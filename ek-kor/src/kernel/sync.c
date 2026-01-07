/**
 * @file sync.c
 * @brief ek-kor Synchronization Primitives Implementation
 */

#include <ek-kor/ek-kor.h>
#include <string.h>

/* ==========================================================================
 * Wait Queue Helpers
 * ========================================================================== */

/**
 * @brief Insert task into wait queue sorted by priority (highest first)
 */
static void wait_queue_insert(ekk_task_t *head, ekk_task_t task)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(task);
    uint8_t prio = tcb->effective_priority;

    ekk_tcb_t **pp = (ekk_tcb_t**)head;

    /* Insert sorted by priority (highest priority first) */
    while (*pp) {
        if ((*pp)->effective_priority < prio) {
            break;
        }
        pp = &(*pp)->next_blocked;
    }

    tcb->next_blocked = *pp;
    *pp = tcb;
}

/**
 * @brief Remove and return highest-priority task from wait queue
 */
static ekk_task_t wait_queue_pop(ekk_task_t *head)
{
    if (!*head) return NULL;

    ekk_tcb_t *tcb = ekk_task_get_tcb(*head);
    *head = (ekk_task_t)tcb->next_blocked;
    tcb->next_blocked = NULL;

    return (ekk_task_t)tcb;
}

/**
 * @brief Remove specific task from wait queue
 */
static bool wait_queue_remove(ekk_task_t *head, ekk_task_t task)
{
    ekk_tcb_t *target = ekk_task_get_tcb(task);
    ekk_tcb_t **pp = (ekk_tcb_t**)head;

    while (*pp) {
        if (*pp == target) {
            *pp = target->next_blocked;
            target->next_blocked = NULL;
            return true;
        }
        pp = &(*pp)->next_blocked;
    }
    return false;
}

/* ==========================================================================
 * Spinlock
 * ========================================================================== */

void ekk_spinlock_init(ekk_spinlock_t *spin, const char *name)
{
    spin->lock = 0;
    spin->owner_core = 0xFF;
    spin->name = name;
}

void ekk_spinlock_acquire(ekk_spinlock_t *spin)
{
    uint32_t core = ekk_hal_get_core_id();

    while (1) {
        uint32_t state = ekk_hal_disable_interrupts();

        if (spin->lock == 0) {
            spin->lock = 1;
            spin->owner_core = core;
            ekk_hal_restore_interrupts(state);
            return;
        }

        ekk_hal_restore_interrupts(state);
        /* Busy wait - yield if possible */
    }
}

bool ekk_spinlock_try(ekk_spinlock_t *spin)
{
    uint32_t core = ekk_hal_get_core_id();
    uint32_t state = ekk_hal_disable_interrupts();

    if (spin->lock == 0) {
        spin->lock = 1;
        spin->owner_core = core;
        ekk_hal_restore_interrupts(state);
        return true;
    }

    ekk_hal_restore_interrupts(state);
    return false;
}

void ekk_spinlock_release(ekk_spinlock_t *spin)
{
    ekk_hal_memory_barrier();
    spin->owner_core = 0xFF;
    spin->lock = 0;
}

bool ekk_spinlock_is_locked(ekk_spinlock_t *spin)
{
    return spin->lock != 0;
}

/* ==========================================================================
 * Mutex
 * ========================================================================== */

void ekk_mutex_init(ekk_mutex_struct_t *mtx, const char *name)
{
    memset(mtx, 0, sizeof(*mtx));
    mtx->ceiling = EKK_MAX_PRIORITY;
    mtx->name = name;
}

ekk_err_t ekk_mutex_lock(ekk_mutex_struct_t *mtx, ekk_tick_t timeout)
{
    ekk_task_t current = ekk_sched_get_current();

    ekk_hal_enter_critical();

    if (mtx->locked == 0) {
        /* Mutex available - acquire it */
        mtx->locked = 1;
        mtx->owner = current;
        mtx->owner_orig_priority = ekk_task_get_priority(current);
        ekk_hal_exit_critical();
        return EKK_OK;
    }

    if (mtx->owner == current) {
        /* Recursive lock - not supported, return error */
        ekk_hal_exit_critical();
        return EKK_ERR_STATE;
    }

    /* Mutex held - must wait */
    if (timeout == EKK_NO_WAIT) {
        ekk_hal_exit_critical();
        return EKK_ERR_BUSY;
    }

    /* Priority inheritance: boost owner if needed */
    uint8_t my_prio = ekk_task_get_priority(current);
    if (my_prio > ekk_task_get_priority(mtx->owner)) {
        ekk_sched_priority_inherit(mtx->owner, my_prio);
    }

    /* Add to wait queue sorted by priority */
    wait_queue_insert(&mtx->wait_head, current);
    mtx->wait_count++;

    /* Mark task as blocked on this mutex */
    ekk_tcb_t *tcb = ekk_task_get_tcb(current);
    tcb->blocked_on = mtx;

    ekk_hal_exit_critical();

    /* Block until mutex available */
    ekk_err_t err = ekk_sched_block(timeout);

    ekk_hal_enter_critical();
    if (err != EKK_OK) {
        /* Timeout or error - remove from wait queue if still there */
        if (wait_queue_remove(&mtx->wait_head, current)) {
            mtx->wait_count--;
        }
    }
    ekk_hal_exit_critical();

    if (err == EKK_OK) {
        /* Got the mutex - already set by unlock */
    }

    return err;
}

ekk_err_t ekk_mutex_trylock(ekk_mutex_struct_t *mtx)
{
    return ekk_mutex_lock(mtx, EKK_NO_WAIT);
}

ekk_err_t ekk_mutex_unlock(ekk_mutex_struct_t *mtx)
{
    ekk_task_t current = ekk_sched_get_current();

    ekk_hal_enter_critical();

    if (mtx->owner != current) {
        ekk_hal_exit_critical();
        return EKK_ERR_STATE;
    }

    /* Restore original priority */
    ekk_sched_priority_restore(current);

    /* Wake highest-priority waiter if any */
    ekk_task_t next_owner = wait_queue_pop(&mtx->wait_head);

    if (next_owner) {
        /* Transfer ownership directly to waiter */
        mtx->owner = next_owner;
        mtx->owner_orig_priority = ekk_task_get_priority(next_owner);
        mtx->wait_count--;

        /* Clear blocked state */
        ekk_tcb_t *tcb = ekk_task_get_tcb(next_owner);
        tcb->blocked_on = NULL;

        /* Wake the new owner */
        ekk_sched_unblock(next_owner);
    } else {
        /* No waiters - release mutex */
        mtx->owner = NULL;
        mtx->locked = 0;
    }

    ekk_hal_exit_critical();

    return EKK_OK;
}

bool ekk_mutex_is_locked(ekk_mutex_struct_t *mtx)
{
    return mtx->locked != 0;
}

ekk_task_t ekk_mutex_get_owner(ekk_mutex_struct_t *mtx)
{
    return mtx->owner;
}

/* ==========================================================================
 * Semaphore
 * ========================================================================== */

void ekk_sem_init(ekk_sem_struct_t *sem, const char *name,
                  int32_t initial_count, int32_t max_count)
{
    memset(sem, 0, sizeof(*sem));
    sem->count = initial_count;
    sem->max_count = max_count ? max_count : INT32_MAX;
    sem->name = name;
}

ekk_err_t ekk_sem_wait(ekk_sem_struct_t *sem, ekk_tick_t timeout)
{
    ekk_task_t current = ekk_sched_get_current();

    ekk_hal_enter_critical();

    if (sem->count > 0) {
        sem->count--;
        ekk_hal_exit_critical();
        return EKK_OK;
    }

    if (timeout == EKK_NO_WAIT) {
        ekk_hal_exit_critical();
        return EKK_ERR_BUSY;
    }

    /* Add to wait queue sorted by priority */
    wait_queue_insert(&sem->wait_head, current);
    sem->wait_count++;

    ekk_tcb_t *tcb = ekk_task_get_tcb(current);
    tcb->blocked_on = sem;

    ekk_hal_exit_critical();

    ekk_err_t err = ekk_sched_block(timeout);

    ekk_hal_enter_critical();
    if (err != EKK_OK) {
        /* Timeout - remove from wait queue if still there */
        if (wait_queue_remove(&sem->wait_head, current)) {
            sem->wait_count--;
        }
    }
    tcb->blocked_on = NULL;
    ekk_hal_exit_critical();

    return err;
}

ekk_err_t ekk_sem_trywait(ekk_sem_struct_t *sem)
{
    return ekk_sem_wait(sem, EKK_NO_WAIT);
}

ekk_err_t ekk_sem_signal(ekk_sem_struct_t *sem)
{
    ekk_hal_enter_critical();

    if (sem->count >= sem->max_count) {
        ekk_hal_exit_critical();
        return EKK_ERR_FULL;
    }

    /* Wake highest-priority waiter if any */
    ekk_task_t waiter = wait_queue_pop(&sem->wait_head);

    if (waiter) {
        /* Give semaphore directly to waiter */
        sem->wait_count--;

        ekk_tcb_t *tcb = ekk_task_get_tcb(waiter);
        tcb->blocked_on = NULL;

        ekk_sched_unblock(waiter);
    } else {
        /* No waiters - increment count */
        sem->count++;
    }

    ekk_hal_exit_critical();

    return EKK_OK;
}

int32_t ekk_sem_get_count(ekk_sem_struct_t *sem)
{
    return sem->count;
}

/* ==========================================================================
 * Event Flags
 * ========================================================================== */

void ekk_event_init(ekk_event_struct_t *event, const char *name)
{
    memset(event, 0, sizeof(*event));
    event->name = name;
}

ekk_err_t ekk_event_wait(ekk_event_struct_t *event, uint32_t flags,
                         ekk_event_mode_t mode, bool clear,
                         ekk_tick_t timeout, uint32_t *actual)
{
    ekk_hal_enter_critical();

    bool satisfied = false;
    if (mode == EKK_EVENT_ALL) {
        satisfied = (event->flags & flags) == flags;
    } else {
        satisfied = (event->flags & flags) != 0;
    }

    if (satisfied) {
        if (actual) *actual = event->flags & flags;
        if (clear) event->flags &= ~flags;
        ekk_hal_exit_critical();
        return EKK_OK;
    }

    if (timeout == EKK_NO_WAIT) {
        ekk_hal_exit_critical();
        return EKK_ERR_TIMEOUT;
    }

    ekk_hal_exit_critical();

    /* Block and wait */
    ekk_err_t err = ekk_sched_block(timeout);

    if (err == EKK_OK) {
        ekk_hal_enter_critical();
        if (actual) *actual = event->flags & flags;
        if (clear) event->flags &= ~flags;
        ekk_hal_exit_critical();
    }

    return err;
}

ekk_err_t ekk_event_set(ekk_event_struct_t *event, uint32_t flags)
{
    ekk_hal_enter_critical();
    event->flags |= flags;

    /* Wake all waiters that may now be satisfied */
    ekk_task_t waiter = event->wait_head;
    while (waiter) {
        ekk_tcb_t *tcb = ekk_task_get_tcb(waiter);
        ekk_task_t next = (ekk_task_t)tcb->next_blocked;

        /* Wake the waiter - it will re-check condition */
        tcb->blocked_on = NULL;
        ekk_sched_unblock(waiter);

        waiter = next;
    }
    event->wait_head = NULL;

    ekk_hal_exit_critical();
    return EKK_OK;
}

uint32_t ekk_event_clear(ekk_event_struct_t *event, uint32_t flags)
{
    ekk_hal_enter_critical();
    uint32_t prev = event->flags;
    event->flags &= ~flags;
    ekk_hal_exit_critical();
    return prev;
}

uint32_t ekk_event_get(ekk_event_struct_t *event)
{
    return event->flags;
}

/* ==========================================================================
 * Condition Variable
 * ========================================================================== */

void ekk_cond_init(ekk_cond_t *cond, const char *name)
{
    memset(cond, 0, sizeof(*cond));
    cond->name = name;
}

ekk_err_t ekk_cond_wait(ekk_cond_t *cond, ekk_mutex_struct_t *mtx,
                        ekk_tick_t timeout)
{
    ekk_task_t current = ekk_sched_get_current();

    ekk_hal_enter_critical();

    /* Add to wait queue */
    wait_queue_insert(&cond->wait_head, current);
    cond->wait_count++;

    ekk_tcb_t *tcb = ekk_task_get_tcb(current);
    tcb->blocked_on = cond;

    ekk_hal_exit_critical();

    /* Release mutex while waiting */
    ekk_mutex_unlock(mtx);

    ekk_err_t err = ekk_sched_block(timeout);

    ekk_hal_enter_critical();
    if (err != EKK_OK) {
        /* Timeout - remove from wait queue if still there */
        if (wait_queue_remove(&cond->wait_head, current)) {
            cond->wait_count--;
        }
    }
    tcb->blocked_on = NULL;
    ekk_hal_exit_critical();

    /* Re-acquire mutex before returning */
    ekk_mutex_lock(mtx, EKK_WAIT_FOREVER);

    return err;
}

ekk_err_t ekk_cond_signal(ekk_cond_t *cond)
{
    ekk_hal_enter_critical();

    /* Wake highest-priority waiter */
    ekk_task_t waiter = wait_queue_pop(&cond->wait_head);

    if (waiter) {
        cond->wait_count--;

        ekk_tcb_t *tcb = ekk_task_get_tcb(waiter);
        tcb->blocked_on = NULL;

        ekk_sched_unblock(waiter);
    }

    ekk_hal_exit_critical();
    return EKK_OK;
}

ekk_err_t ekk_cond_broadcast(ekk_cond_t *cond)
{
    ekk_hal_enter_critical();

    /* Wake all waiters */
    ekk_task_t waiter = cond->wait_head;
    while (waiter) {
        ekk_tcb_t *tcb = ekk_task_get_tcb(waiter);
        ekk_task_t next = (ekk_task_t)tcb->next_blocked;

        tcb->blocked_on = NULL;
        ekk_sched_unblock(waiter);
        cond->wait_count--;

        waiter = next;
    }
    cond->wait_head = NULL;

    ekk_hal_exit_critical();
    return EKK_OK;
}

/* ==========================================================================
 * Reader-Writer Lock
 * ========================================================================== */

void ekk_rwlock_init(ekk_rwlock_t *rwlock, const char *name)
{
    memset(rwlock, 0, sizeof(*rwlock));
    rwlock->name = name;
}

ekk_err_t ekk_rwlock_rdlock(ekk_rwlock_t *rwlock, ekk_tick_t timeout)
{
    ekk_task_t current = ekk_sched_get_current();

    ekk_hal_enter_critical();

    /* Wait if there's a writer or pending writers (writer priority) */
    while (rwlock->writer || rwlock->write_wait) {
        if (timeout == EKK_NO_WAIT) {
            ekk_hal_exit_critical();
            return EKK_ERR_BUSY;
        }

        /* Add to read wait queue */
        wait_queue_insert(&rwlock->read_wait, current);
        ekk_tcb_t *tcb = ekk_task_get_tcb(current);
        tcb->blocked_on = rwlock;

        ekk_hal_exit_critical();

        ekk_err_t err = ekk_sched_block(timeout);

        ekk_hal_enter_critical();
        wait_queue_remove(&rwlock->read_wait, current);
        tcb->blocked_on = NULL;

        if (err != EKK_OK) {
            ekk_hal_exit_critical();
            return err;
        }
    }

    rwlock->readers++;
    ekk_hal_exit_critical();

    return EKK_OK;
}

ekk_err_t ekk_rwlock_wrlock(ekk_rwlock_t *rwlock, ekk_tick_t timeout)
{
    ekk_task_t current = ekk_sched_get_current();

    ekk_hal_enter_critical();

    while (rwlock->writer || rwlock->readers > 0) {
        if (timeout == EKK_NO_WAIT) {
            ekk_hal_exit_critical();
            return EKK_ERR_BUSY;
        }

        /* Add to write wait queue */
        wait_queue_insert(&rwlock->write_wait, current);
        ekk_tcb_t *tcb = ekk_task_get_tcb(current);
        tcb->blocked_on = rwlock;

        ekk_hal_exit_critical();

        ekk_err_t err = ekk_sched_block(timeout);

        ekk_hal_enter_critical();
        wait_queue_remove(&rwlock->write_wait, current);
        tcb->blocked_on = NULL;

        if (err != EKK_OK) {
            ekk_hal_exit_critical();
            return err;
        }
    }

    rwlock->writer = true;
    ekk_hal_exit_critical();

    return EKK_OK;
}

ekk_err_t ekk_rwlock_rdunlock(ekk_rwlock_t *rwlock)
{
    ekk_hal_enter_critical();

    if (rwlock->readers > 0) {
        rwlock->readers--;
    }

    /* When last reader leaves, wake a waiting writer */
    if (rwlock->readers == 0 && rwlock->write_wait) {
        ekk_task_t waiter = wait_queue_pop(&rwlock->write_wait);
        if (waiter) {
            ekk_tcb_t *tcb = ekk_task_get_tcb(waiter);
            tcb->blocked_on = NULL;
            ekk_sched_unblock(waiter);
        }
    }

    ekk_hal_exit_critical();
    return EKK_OK;
}

ekk_err_t ekk_rwlock_wrunlock(ekk_rwlock_t *rwlock)
{
    ekk_hal_enter_critical();

    rwlock->writer = false;

    /* Prefer waiting readers over writers */
    if (rwlock->read_wait) {
        /* Wake all waiting readers */
        ekk_task_t waiter = rwlock->read_wait;
        while (waiter) {
            ekk_tcb_t *tcb = ekk_task_get_tcb(waiter);
            ekk_task_t next = (ekk_task_t)tcb->next_blocked;
            tcb->blocked_on = NULL;
            ekk_sched_unblock(waiter);
            waiter = next;
        }
        rwlock->read_wait = NULL;
    } else if (rwlock->write_wait) {
        /* Wake one waiting writer */
        ekk_task_t waiter = wait_queue_pop(&rwlock->write_wait);
        if (waiter) {
            ekk_tcb_t *tcb = ekk_task_get_tcb(waiter);
            tcb->blocked_on = NULL;
            ekk_sched_unblock(waiter);
        }
    }

    ekk_hal_exit_critical();
    return EKK_OK;
}
