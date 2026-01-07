/**
 * @file sync.c
 * @brief JEZGRO Synchronization Primitives Implementation
 */

#include "sync.h"
#include "scheduler.h"
#include "task.h"
#include "hal/hal.h"
#include "arch/tricore_cpu.h"
#include "arch/tricore_multicore.h"
#include "tricore_intrinsics.h"

/* ==========================================================================
 * Spinlock Implementation
 * ========================================================================== */

void sync_spinlock_init(sync_spinlock_t *spin, const char *name)
{
    spin->lock = 0;
    spin->owner_core = 0xFF;
    spin->name = name;
}

void sync_spinlock_acquire(sync_spinlock_t *spin)
{
    /* Spin until we acquire the lock */
    while (__swap(&spin->lock, 1) != 0) {
        __nop();
    }

    __dsync();  /* Memory barrier after acquire */
    spin->owner_core = hal_get_core_id();
}

bool sync_spinlock_try(sync_spinlock_t *spin)
{
    if (__swap(&spin->lock, 1) == 0) {
        __dsync();
        spin->owner_core = hal_get_core_id();
        return true;
    }
    return false;
}

void sync_spinlock_release(sync_spinlock_t *spin)
{
    spin->owner_core = 0xFF;
    __dsync();  /* Ensure writes complete before release */
    spin->lock = 0;
}

bool sync_spinlock_is_locked(sync_spinlock_t *spin)
{
    return spin->lock != 0;
}

/* ==========================================================================
 * Mutex Implementation
 * ========================================================================== */

void sync_mutex_init(sync_mutex_t *mtx, const char *name)
{
    mtx->locked = 0;
    mtx->owner = NULL;
    mtx->owner_orig_priority = 0;
    mtx->ceiling = JEZGRO_MAX_PRIORITY;
    mtx->wait_head = NULL;
    mtx->wait_count = 0;
    mtx->name = name;
}

/**
 * @brief Add task to mutex wait queue (sorted by priority)
 */
static void mutex_wait_enqueue(sync_mutex_t *mtx, task_handle_t task)
{
    tcb_t *tcb = task_get_tcb(task);
    tcb->blocked_on = mtx;
    tcb->next_blocked = NULL;

    if (mtx->wait_head == NULL) {
        mtx->wait_head = task;
    }
    else {
        /* Insert in priority order (highest first) */
        tcb_t *head = task_get_tcb(mtx->wait_head);

        if (tcb->effective_priority > head->effective_priority) {
            tcb->next_blocked = mtx->wait_head;
            mtx->wait_head = task;
        }
        else {
            tcb_t *prev = head;
            while (prev->next_blocked != NULL) {
                tcb_t *next = task_get_tcb(prev->next_blocked);
                if (tcb->effective_priority > next->effective_priority) {
                    break;
                }
                prev = next;
            }
            tcb->next_blocked = prev->next_blocked;
            prev->next_blocked = task;
        }
    }

    mtx->wait_count++;
}

/**
 * @brief Remove task from mutex wait queue
 */
static task_handle_t mutex_wait_dequeue(sync_mutex_t *mtx)
{
    if (mtx->wait_head == NULL) {
        return NULL;
    }

    task_handle_t task = mtx->wait_head;
    tcb_t *tcb = task_get_tcb(task);

    mtx->wait_head = tcb->next_blocked;
    tcb->next_blocked = NULL;
    tcb->blocked_on = NULL;
    mtx->wait_count--;

    return task;
}

jezgro_error_t sync_mutex_lock(sync_mutex_t *mtx, jezgro_ticks_t timeout)
{
    task_handle_t current = task_get_current();

    hal_enter_critical();

    /* Check if already held by us (recursive mutex) */
    if (mtx->owner == current) {
        /* For now, don't support recursive - return error */
        hal_exit_critical();
        return JEZGRO_ERROR_BUSY;
    }

    /* Try to acquire */
    if (!mtx->locked) {
        mtx->locked = 1;
        mtx->owner = current;
        mtx->owner_orig_priority = task_get_priority(current);

        hal_exit_critical();
        return JEZGRO_OK;
    }

    /* Non-blocking request? */
    if (timeout == JEZGRO_NO_WAIT) {
        hal_exit_critical();
        return JEZGRO_ERROR_BUSY;
    }

    /* Need to wait */
    tcb_t *tcb = task_get_tcb(current);
    tcb->state = TASK_STATE_BLOCKED;

    /* Add to wait queue */
    mutex_wait_enqueue(mtx, current);

    /* Priority inheritance: boost owner if waiter has higher priority */
    tcb_t *owner_tcb = task_get_tcb(mtx->owner);
    if (tcb->effective_priority > owner_tcb->effective_priority) {
        scheduler_priority_inherit(mtx->owner, tcb->effective_priority);
    }

    hal_exit_critical();

    /* Block */
    jezgro_error_t result = scheduler_block(timeout);

    /* Woke up - check if we got the mutex or timed out */
    hal_enter_critical();

    if (mtx->owner == current) {
        hal_exit_critical();
        return JEZGRO_OK;
    }

    /* Remove from wait queue if timed out */
    /* (May have already been removed if we got mutex) */
    tcb = task_get_tcb(current);
    if (tcb->blocked_on == mtx) {
        /* Still in queue - remove */
        /* Find and remove from queue */
        if (mtx->wait_head == current) {
            mutex_wait_dequeue(mtx);
        }
        else {
            tcb_t *prev = task_get_tcb(mtx->wait_head);
            while (prev->next_blocked != NULL && prev->next_blocked != current) {
                prev = task_get_tcb(prev->next_blocked);
            }
            if (prev->next_blocked == current) {
                tcb_t *cur = task_get_tcb(current);
                prev->next_blocked = cur->next_blocked;
                cur->next_blocked = NULL;
                cur->blocked_on = NULL;
                mtx->wait_count--;
            }
        }
    }

    hal_exit_critical();

    return result;
}

jezgro_error_t sync_mutex_trylock(sync_mutex_t *mtx)
{
    return sync_mutex_lock(mtx, JEZGRO_NO_WAIT);
}

jezgro_error_t sync_mutex_unlock(sync_mutex_t *mtx)
{
    task_handle_t current = task_get_current();

    hal_enter_critical();

    /* Must be owner to unlock */
    if (mtx->owner != current) {
        hal_exit_critical();
        return JEZGRO_ERROR_STATE;
    }

    /* Restore original priority if it was boosted */
    scheduler_priority_restore(current);

    /* Wake next waiter if any */
    task_handle_t next = mutex_wait_dequeue(mtx);

    if (next != NULL) {
        /* Transfer ownership to waiter */
        mtx->owner = next;
        mtx->owner_orig_priority = task_get_priority(next);
        scheduler_unblock(next);
    }
    else {
        /* No waiters - unlock */
        mtx->locked = 0;
        mtx->owner = NULL;
    }

    hal_exit_critical();

    return JEZGRO_OK;
}

bool sync_mutex_is_locked(sync_mutex_t *mtx)
{
    return mtx->locked != 0;
}

task_handle_t sync_mutex_get_owner(sync_mutex_t *mtx)
{
    return mtx->owner;
}

/* ==========================================================================
 * Semaphore Implementation
 * ========================================================================== */

void sync_semaphore_init(sync_semaphore_t *sem, const char *name,
                         int32_t initial_count, int32_t max_count)
{
    sem->count = initial_count;
    sem->max_count = max_count > 0 ? max_count : 0x7FFFFFFF;
    sem->wait_head = NULL;
    sem->wait_count = 0;
    sem->name = name;
}

/**
 * @brief Add task to semaphore wait queue (FIFO)
 */
static void sem_wait_enqueue(sync_semaphore_t *sem, task_handle_t task)
{
    tcb_t *tcb = task_get_tcb(task);
    tcb->blocked_on = sem;
    tcb->next_blocked = NULL;

    if (sem->wait_head == NULL) {
        sem->wait_head = task;
    }
    else {
        /* Add to end */
        tcb_t *prev = task_get_tcb(sem->wait_head);
        while (prev->next_blocked != NULL) {
            prev = task_get_tcb(prev->next_blocked);
        }
        prev->next_blocked = task;
    }

    sem->wait_count++;
}

/**
 * @brief Remove first task from semaphore wait queue
 */
static task_handle_t sem_wait_dequeue(sync_semaphore_t *sem)
{
    if (sem->wait_head == NULL) {
        return NULL;
    }

    task_handle_t task = sem->wait_head;
    tcb_t *tcb = task_get_tcb(task);

    sem->wait_head = tcb->next_blocked;
    tcb->next_blocked = NULL;
    tcb->blocked_on = NULL;
    sem->wait_count--;

    return task;
}

jezgro_error_t sync_semaphore_wait(sync_semaphore_t *sem, jezgro_ticks_t timeout)
{
    hal_enter_critical();

    /* Try to decrement */
    if (sem->count > 0) {
        sem->count--;
        hal_exit_critical();
        return JEZGRO_OK;
    }

    /* Non-blocking? */
    if (timeout == JEZGRO_NO_WAIT) {
        hal_exit_critical();
        return JEZGRO_ERROR_BUSY;
    }

    /* Need to wait */
    task_handle_t current = task_get_current();
    tcb_t *tcb = task_get_tcb(current);
    tcb->state = TASK_STATE_BLOCKED;

    sem_wait_enqueue(sem, current);

    hal_exit_critical();

    /* Block */
    jezgro_error_t result = scheduler_block(timeout);

    /* Remove from queue if timed out */
    if (result == JEZGRO_ERROR_TIMEOUT) {
        hal_enter_critical();
        tcb = task_get_tcb(current);
        if (tcb->blocked_on == sem) {
            /* Still in queue - remove */
            if (sem->wait_head == current) {
                sem_wait_dequeue(sem);
            }
            else {
                tcb_t *prev = task_get_tcb(sem->wait_head);
                while (prev->next_blocked != NULL && prev->next_blocked != current) {
                    prev = task_get_tcb(prev->next_blocked);
                }
                if (prev->next_blocked == current) {
                    tcb_t *cur = task_get_tcb(current);
                    prev->next_blocked = cur->next_blocked;
                    cur->next_blocked = NULL;
                    cur->blocked_on = NULL;
                    sem->wait_count--;
                }
            }
        }
        hal_exit_critical();
    }

    return result;
}

jezgro_error_t sync_semaphore_trywait(sync_semaphore_t *sem)
{
    return sync_semaphore_wait(sem, JEZGRO_NO_WAIT);
}

jezgro_error_t sync_semaphore_signal(sync_semaphore_t *sem)
{
    hal_enter_critical();

    /* Check max */
    if (sem->count >= sem->max_count) {
        hal_exit_critical();
        return JEZGRO_ERROR_FULL;
    }

    /* Wake waiter if any */
    task_handle_t waiter = sem_wait_dequeue(sem);

    if (waiter != NULL) {
        scheduler_unblock(waiter);
    }
    else {
        sem->count++;
    }

    hal_exit_critical();

    return JEZGRO_OK;
}

int32_t sync_semaphore_get_count(sync_semaphore_t *sem)
{
    return sem->count;
}

/* ==========================================================================
 * Event Flags Implementation
 * ========================================================================== */

void sync_event_init(sync_event_t *event, const char *name)
{
    event->flags = 0;
    event->wait_head = NULL;
    event->name = name;
}

jezgro_error_t sync_event_wait(sync_event_t *event, uint32_t flags,
                               sync_event_mode_t mode, bool clear,
                               jezgro_ticks_t timeout, uint32_t *actual)
{
    hal_enter_critical();

    /* Check if condition already met */
    uint32_t current = event->flags;
    bool satisfied = (mode == SYNC_EVENT_ANY) ?
                     ((current & flags) != 0) :
                     ((current & flags) == flags);

    if (satisfied) {
        if (actual) *actual = current & flags;
        if (clear) event->flags &= ~flags;
        hal_exit_critical();
        return JEZGRO_OK;
    }

    /* Non-blocking? */
    if (timeout == JEZGRO_NO_WAIT) {
        hal_exit_critical();
        return JEZGRO_ERROR_TIMEOUT;
    }

    /* Need to wait */
    task_handle_t task = task_get_current();
    tcb_t *tcb = task_get_tcb(task);
    tcb->state = TASK_STATE_BLOCKED;
    tcb->blocked_on = event;

    /* Store wait conditions in TCB */
    tcb->blocked_reason = flags | ((uint32_t)mode << 31);

    /* Add to wait list */
    tcb->next_blocked = event->wait_head;
    event->wait_head = task;

    hal_exit_critical();

    /* Block */
    jezgro_error_t result = scheduler_block(timeout);

    hal_enter_critical();

    /* Check result */
    current = event->flags;
    satisfied = (mode == SYNC_EVENT_ANY) ?
                ((current & flags) != 0) :
                ((current & flags) == flags);

    if (satisfied) {
        if (actual) *actual = current & flags;
        if (clear) event->flags &= ~flags;
        result = JEZGRO_OK;
    }

    /* Remove from wait list if still there */
    tcb = task_get_tcb(task);
    if (tcb->blocked_on == event) {
        if (event->wait_head == task) {
            event->wait_head = tcb->next_blocked;
        }
        else {
            tcb_t *prev = task_get_tcb(event->wait_head);
            while (prev && prev->next_blocked != task) {
                prev = task_get_tcb(prev->next_blocked);
            }
            if (prev) {
                prev->next_blocked = tcb->next_blocked;
            }
        }
        tcb->next_blocked = NULL;
        tcb->blocked_on = NULL;
    }

    hal_exit_critical();

    return result;
}

jezgro_error_t sync_event_set(sync_event_t *event, uint32_t flags)
{
    hal_enter_critical();

    event->flags |= flags;

    /* Wake waiters whose conditions are now met */
    task_handle_t *prev_ptr = &event->wait_head;
    task_handle_t task = event->wait_head;

    while (task != NULL) {
        tcb_t *tcb = task_get_tcb(task);
        task_handle_t next = tcb->next_blocked;

        uint32_t wait_flags = tcb->blocked_reason & 0x7FFFFFFF;
        sync_event_mode_t mode = (tcb->blocked_reason >> 31) ? SYNC_EVENT_ALL : SYNC_EVENT_ANY;

        bool satisfied = (mode == SYNC_EVENT_ANY) ?
                         ((event->flags & wait_flags) != 0) :
                         ((event->flags & wait_flags) == wait_flags);

        if (satisfied) {
            /* Remove from wait list */
            *prev_ptr = next;
            tcb->next_blocked = NULL;
            tcb->blocked_on = NULL;

            /* Wake task */
            scheduler_unblock(task);
        }
        else {
            prev_ptr = &tcb->next_blocked;
        }

        task = next;
    }

    hal_exit_critical();

    return JEZGRO_OK;
}

uint32_t sync_event_clear(sync_event_t *event, uint32_t flags)
{
    hal_enter_critical();
    uint32_t prev = event->flags;
    event->flags &= ~flags;
    hal_exit_critical();
    return prev;
}

uint32_t sync_event_get(sync_event_t *event)
{
    return event->flags;
}

/* ==========================================================================
 * Condition Variable Implementation
 * ========================================================================== */

void sync_cond_init(sync_cond_t *cond, const char *name)
{
    cond->wait_head = NULL;
    cond->wait_count = 0;
    cond->name = name;
}

jezgro_error_t sync_cond_wait(sync_cond_t *cond, sync_mutex_t *mtx,
                              jezgro_ticks_t timeout)
{
    task_handle_t current = task_get_current();

    hal_enter_critical();

    /* Add to wait queue */
    tcb_t *tcb = task_get_tcb(current);
    tcb->blocked_on = cond;
    tcb->next_blocked = cond->wait_head;
    cond->wait_head = current;
    cond->wait_count++;

    tcb->state = TASK_STATE_BLOCKED;

    hal_exit_critical();

    /* Release mutex */
    sync_mutex_unlock(mtx);

    /* Block */
    jezgro_error_t result = scheduler_block(timeout);

    /* Reacquire mutex before returning */
    sync_mutex_lock(mtx, JEZGRO_WAIT_FOREVER);

    return result;
}

jezgro_error_t sync_cond_signal(sync_cond_t *cond)
{
    hal_enter_critical();

    if (cond->wait_head != NULL) {
        task_handle_t task = cond->wait_head;
        tcb_t *tcb = task_get_tcb(task);

        cond->wait_head = tcb->next_blocked;
        tcb->next_blocked = NULL;
        tcb->blocked_on = NULL;
        cond->wait_count--;

        scheduler_unblock(task);
    }

    hal_exit_critical();

    return JEZGRO_OK;
}

jezgro_error_t sync_cond_broadcast(sync_cond_t *cond)
{
    hal_enter_critical();

    while (cond->wait_head != NULL) {
        task_handle_t task = cond->wait_head;
        tcb_t *tcb = task_get_tcb(task);

        cond->wait_head = tcb->next_blocked;
        tcb->next_blocked = NULL;
        tcb->blocked_on = NULL;
        cond->wait_count--;

        scheduler_unblock(task);
    }

    hal_exit_critical();

    return JEZGRO_OK;
}

/* ==========================================================================
 * Reader-Writer Lock Implementation
 * ========================================================================== */

void sync_rwlock_init(sync_rwlock_t *rwlock, const char *name)
{
    rwlock->readers = 0;
    rwlock->writer = false;
    rwlock->read_wait = NULL;
    rwlock->write_wait = NULL;
    rwlock->name = name;
}

jezgro_error_t sync_rwlock_rdlock(sync_rwlock_t *rwlock, jezgro_ticks_t timeout)
{
    hal_enter_critical();

    /* Can acquire if no writer and no waiting writers */
    if (!rwlock->writer && rwlock->write_wait == NULL) {
        rwlock->readers++;
        hal_exit_critical();
        return JEZGRO_OK;
    }

    if (timeout == JEZGRO_NO_WAIT) {
        hal_exit_critical();
        return JEZGRO_ERROR_BUSY;
    }

    /* Wait for read access */
    task_handle_t current = task_get_current();
    tcb_t *tcb = task_get_tcb(current);
    tcb->state = TASK_STATE_BLOCKED;
    tcb->blocked_on = rwlock;
    tcb->next_blocked = rwlock->read_wait;
    rwlock->read_wait = current;

    hal_exit_critical();

    jezgro_error_t result = scheduler_block(timeout);

    /* If succeeded, we were granted read access */
    return result;
}

jezgro_error_t sync_rwlock_wrlock(sync_rwlock_t *rwlock, jezgro_ticks_t timeout)
{
    hal_enter_critical();

    /* Can acquire if no readers and no writer */
    if (rwlock->readers == 0 && !rwlock->writer) {
        rwlock->writer = true;
        hal_exit_critical();
        return JEZGRO_OK;
    }

    if (timeout == JEZGRO_NO_WAIT) {
        hal_exit_critical();
        return JEZGRO_ERROR_BUSY;
    }

    /* Wait for write access */
    task_handle_t current = task_get_current();
    tcb_t *tcb = task_get_tcb(current);
    tcb->state = TASK_STATE_BLOCKED;
    tcb->blocked_on = rwlock;
    tcb->next_blocked = rwlock->write_wait;
    rwlock->write_wait = current;

    hal_exit_critical();

    jezgro_error_t result = scheduler_block(timeout);

    return result;
}

jezgro_error_t sync_rwlock_rdunlock(sync_rwlock_t *rwlock)
{
    hal_enter_critical();

    if (rwlock->readers > 0) {
        rwlock->readers--;
    }

    /* If no more readers, wake a waiting writer */
    if (rwlock->readers == 0 && rwlock->write_wait != NULL) {
        task_handle_t writer = rwlock->write_wait;
        tcb_t *tcb = task_get_tcb(writer);
        rwlock->write_wait = tcb->next_blocked;
        tcb->next_blocked = NULL;
        tcb->blocked_on = NULL;

        rwlock->writer = true;
        scheduler_unblock(writer);
    }

    hal_exit_critical();

    return JEZGRO_OK;
}

jezgro_error_t sync_rwlock_wrunlock(sync_rwlock_t *rwlock)
{
    hal_enter_critical();

    rwlock->writer = false;

    /* Prefer waiting readers (or could prefer writers for write-priority) */
    if (rwlock->read_wait != NULL) {
        /* Wake all waiting readers */
        while (rwlock->read_wait != NULL) {
            task_handle_t reader = rwlock->read_wait;
            tcb_t *tcb = task_get_tcb(reader);
            rwlock->read_wait = tcb->next_blocked;
            tcb->next_blocked = NULL;
            tcb->blocked_on = NULL;

            rwlock->readers++;
            scheduler_unblock(reader);
        }
    }
    else if (rwlock->write_wait != NULL) {
        /* Wake one waiting writer */
        task_handle_t writer = rwlock->write_wait;
        tcb_t *tcb = task_get_tcb(writer);
        rwlock->write_wait = tcb->next_blocked;
        tcb->next_blocked = NULL;
        tcb->blocked_on = NULL;

        rwlock->writer = true;
        scheduler_unblock(writer);
    }

    hal_exit_critical();

    return JEZGRO_OK;
}
