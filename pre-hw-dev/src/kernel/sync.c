/**
 * @file sync.c
 * @brief JEZGRO Synchronization Primitives Implementation
 *
 * Implements mutex and semaphore with:
 * - Bitmap allocation
 * - EDF-sorted wait queues
 * - Recursive mutex locking
 *
 * Copyright (c) 2026 Elektrokombinacija
 * SPDX-License-Identifier: MIT
 */

#include "jezgro.h"
#include "hal.h"
#include <string.h>

#ifdef JEZGRO_SIM
#include <stdio.h>
#define SYNC_DEBUG(fmt, ...) \
    do { if (JEZGRO_DEBUG) printf("[SYNC] " fmt "\n", ##__VA_ARGS__); } while(0)
#else
#define SYNC_DEBUG(fmt, ...)
#endif

/* HAL interrupt macros for critical sections */
#define hal_irq_save()      hal_disable_interrupts()
#define hal_irq_restore(f)  hal_restore_interrupts(f)

/*===========================================================================*/
/* Private Data                                                              */
/*===========================================================================*/

/** Mutex pool */
static mutex_t mutex_pool[JEZGRO_MAX_MUTEXES];

/** Mutex allocation bitmap */
static uint16_t mutex_alloc_bitmap = 0;

/** Semaphore pool */
static semaphore_t sem_pool[JEZGRO_MAX_SEMAPHORES];

/** Semaphore allocation bitmap */
static uint16_t sem_alloc_bitmap = 0;

/** Next IDs */
static uint8_t next_mutex_id = 1;
static uint8_t next_sem_id = 1;

/*===========================================================================*/
/* Private Functions                                                         */
/*===========================================================================*/

/**
 * @brief Insert task into wait queue sorted by EDF deadline
 *
 * Tasks with earlier deadlines are placed first.
 */
static void insert_wait_queue(task_t **queue, task_t *task)
{
    task_t **pp = queue;

    /* Find insertion point (EDF order) */
    while (*pp != NULL && (*pp)->deadline <= task->deadline) {
        pp = &((*pp)->next);
    }

    /* Insert task */
    task->next = *pp;
    *pp = task;
}

/**
 * @brief Remove first task from wait queue
 * @return Removed task or NULL if queue empty
 */
static task_t *remove_wait_queue(task_t **queue)
{
    if (*queue == NULL) {
        return NULL;
    }

    task_t *task = *queue;
    *queue = task->next;
    task->next = NULL;
    return task;
}

/*===========================================================================*/
/* Initialization                                                            */
/*===========================================================================*/

void sync_init(void)
{
    SYNC_DEBUG("Initializing sync subsystem");

    memset(mutex_pool, 0, sizeof(mutex_pool));
    memset(sem_pool, 0, sizeof(sem_pool));
    mutex_alloc_bitmap = 0;
    sem_alloc_bitmap = 0;
    next_mutex_id = 1;
    next_sem_id = 1;

    SYNC_DEBUG("Sync initialized (max_mutex=%d, max_sem=%d)",
               JEZGRO_MAX_MUTEXES, JEZGRO_MAX_SEMAPHORES);
}

/*===========================================================================*/
/* Mutex Implementation                                                      */
/*===========================================================================*/

mutex_t *mutex_create(void)
{
    uint32_t flags = hal_irq_save();

    /* Find free slot */
    int slot = -1;
    for (int i = 0; i < JEZGRO_MAX_MUTEXES; i++) {
        if (!(mutex_alloc_bitmap & (1U << i))) {
            slot = i;
            break;
        }
    }

    if (slot < 0) {
        hal_irq_restore(flags);
        SYNC_DEBUG("No free mutex slots");
        return NULL;
    }

    mutex_t *mtx = &mutex_pool[slot];
    mutex_alloc_bitmap |= (1U << slot);

    /* Initialize mutex */
    memset(mtx, 0, sizeof(mutex_t));
    mtx->id = next_mutex_id++;
    mtx->locked = false;
    mtx->owner = NULL;
    mtx->recursion_count = 0;
    mtx->wait_queue = NULL;
    mtx->waiters_count = 0;

    hal_irq_restore(flags);

    SYNC_DEBUG("Created mutex id=%d", mtx->id);
    return mtx;
}

int mutex_destroy(mutex_t *mtx)
{
    if (mtx == NULL || mtx->id == 0) {
        return SYNC_ERR_INVALID;
    }

    uint32_t flags = hal_irq_save();

    /* Cannot destroy if locked or has waiters */
    if (mtx->locked || mtx->waiters_count > 0) {
        hal_irq_restore(flags);
        SYNC_DEBUG("Cannot destroy mutex id=%d (locked=%d, waiters=%d)",
                   mtx->id, mtx->locked, mtx->waiters_count);
        return SYNC_ERR_INVALID;
    }

    /* Find slot and free */
    int slot = mtx - mutex_pool;
    if (slot >= 0 && slot < JEZGRO_MAX_MUTEXES) {
        mutex_alloc_bitmap &= ~(1U << slot);
    }

    SYNC_DEBUG("Destroyed mutex id=%d", mtx->id);
    memset(mtx, 0, sizeof(mutex_t));

    hal_irq_restore(flags);
    return SYNC_OK;
}

int mutex_lock(mutex_t *mtx)
{
    if (mtx == NULL || mtx->id == 0) {
        return SYNC_ERR_INVALID;
    }

    task_t *current = scheduler_get_current();
    if (current == NULL) {
        return SYNC_ERR_INVALID;
    }

    uint32_t flags = hal_irq_save();

    /* Check for recursive lock */
    if (mtx->locked && mtx->owner == current) {
        mtx->recursion_count++;
        hal_irq_restore(flags);
        SYNC_DEBUG("Mutex id=%d recursive lock (count=%d)",
                   mtx->id, mtx->recursion_count);
        return SYNC_OK;
    }

    /* Try to acquire lock */
    if (!mtx->locked) {
        mtx->locked = true;
        mtx->owner = current;
        mtx->recursion_count = 1;
        hal_irq_restore(flags);
        SYNC_DEBUG("Mutex id=%d locked by task '%s'",
                   mtx->id, current->name);
        return SYNC_OK;
    }

    /* Mutex is locked by another task - block */
    SYNC_DEBUG("Mutex id=%d blocking task '%s' (owner='%s')",
               mtx->id, current->name, mtx->owner->name);

    current->state = TASK_STATE_BLOCKED;
    current->block_reason = BLOCK_REASON_MUTEX;
    current->block_object = mtx;

    insert_wait_queue(&mtx->wait_queue, current);
    mtx->waiters_count++;

    hal_irq_restore(flags);

    /* Yield to let another task run */
    scheduler_yield();

    /* When we wake up, we own the mutex */
    return SYNC_OK;
}

int mutex_trylock(mutex_t *mtx)
{
    if (mtx == NULL || mtx->id == 0) {
        return SYNC_ERR_INVALID;
    }

    task_t *current = scheduler_get_current();
    if (current == NULL) {
        return SYNC_ERR_INVALID;
    }

    uint32_t flags = hal_irq_save();

    /* Check for recursive lock */
    if (mtx->locked && mtx->owner == current) {
        mtx->recursion_count++;
        hal_irq_restore(flags);
        return SYNC_OK;
    }

    /* Try to acquire lock */
    if (!mtx->locked) {
        mtx->locked = true;
        mtx->owner = current;
        mtx->recursion_count = 1;
        hal_irq_restore(flags);
        SYNC_DEBUG("Mutex id=%d trylock success by task '%s'",
                   mtx->id, current->name);
        return SYNC_OK;
    }

    /* Already locked - don't block */
    hal_irq_restore(flags);
    return SYNC_ERR_WOULD_BLOCK;
}

int mutex_unlock(mutex_t *mtx)
{
    if (mtx == NULL || mtx->id == 0) {
        return SYNC_ERR_INVALID;
    }

    task_t *current = scheduler_get_current();
    if (current == NULL) {
        return SYNC_ERR_INVALID;
    }

    uint32_t flags = hal_irq_save();

    /* Verify ownership */
    if (!mtx->locked || mtx->owner != current) {
        hal_irq_restore(flags);
        SYNC_DEBUG("Mutex id=%d unlock failed - not owner", mtx->id);
        return SYNC_ERR_OWNER;
    }

    /* Handle recursive unlock */
    if (mtx->recursion_count > 1) {
        mtx->recursion_count--;
        hal_irq_restore(flags);
        SYNC_DEBUG("Mutex id=%d recursive unlock (count=%d)",
                   mtx->id, mtx->recursion_count);
        return SYNC_OK;
    }

    /* Check for waiters */
    if (mtx->wait_queue != NULL) {
        /* Transfer ownership to first waiter (earliest deadline) */
        task_t *waiter = remove_wait_queue(&mtx->wait_queue);
        mtx->waiters_count--;

        mtx->owner = waiter;
        mtx->recursion_count = 1;

        /* Wake up the waiter */
        waiter->state = TASK_STATE_READY;
        waiter->block_reason = BLOCK_REASON_NONE;
        waiter->block_object = NULL;

        SYNC_DEBUG("Mutex id=%d transferred to task '%s'",
                   mtx->id, waiter->name);

        hal_irq_restore(flags);

        /* Yield to potentially let waiter run (if higher priority) */
        scheduler_yield();
        return SYNC_OK;
    }

    /* No waiters - release mutex */
    mtx->locked = false;
    mtx->owner = NULL;
    mtx->recursion_count = 0;

    hal_irq_restore(flags);

    SYNC_DEBUG("Mutex id=%d unlocked", mtx->id);
    return SYNC_OK;
}

bool mutex_is_owner(mutex_t *mtx)
{
    if (mtx == NULL || mtx->id == 0) {
        return false;
    }

    task_t *current = scheduler_get_current();
    return (mtx->locked && mtx->owner == current);
}

/*===========================================================================*/
/* Semaphore Implementation                                                  */
/*===========================================================================*/

semaphore_t *sem_create(int16_t initial_count, int16_t max_count)
{
    if (initial_count < 0) {
        return NULL;
    }

    if (max_count > 0 && initial_count > max_count) {
        return NULL;
    }

    uint32_t flags = hal_irq_save();

    /* Find free slot */
    int slot = -1;
    for (int i = 0; i < JEZGRO_MAX_SEMAPHORES; i++) {
        if (!(sem_alloc_bitmap & (1U << i))) {
            slot = i;
            break;
        }
    }

    if (slot < 0) {
        hal_irq_restore(flags);
        SYNC_DEBUG("No free semaphore slots");
        return NULL;
    }

    semaphore_t *sem = &sem_pool[slot];
    sem_alloc_bitmap |= (1U << slot);

    /* Initialize semaphore */
    memset(sem, 0, sizeof(semaphore_t));
    sem->id = next_sem_id++;
    sem->count = initial_count;
    sem->max_count = max_count;
    sem->wait_queue = NULL;
    sem->waiters_count = 0;

    hal_irq_restore(flags);

    SYNC_DEBUG("Created semaphore id=%d (count=%d, max=%d)",
               sem->id, sem->count, sem->max_count);
    return sem;
}

semaphore_t *sem_create_binary(int16_t initial_value)
{
    if (initial_value < 0 || initial_value > 1) {
        initial_value = (initial_value > 0) ? 1 : 0;
    }
    return sem_create(initial_value, 1);
}

int sem_destroy(semaphore_t *sem)
{
    if (sem == NULL || sem->id == 0) {
        return SYNC_ERR_INVALID;
    }

    uint32_t flags = hal_irq_save();

    /* Cannot destroy if has waiters */
    if (sem->waiters_count > 0) {
        hal_irq_restore(flags);
        SYNC_DEBUG("Cannot destroy semaphore id=%d (waiters=%d)",
                   sem->id, sem->waiters_count);
        return SYNC_ERR_INVALID;
    }

    /* Find slot and free */
    int slot = sem - sem_pool;
    if (slot >= 0 && slot < JEZGRO_MAX_SEMAPHORES) {
        sem_alloc_bitmap &= ~(1U << slot);
    }

    SYNC_DEBUG("Destroyed semaphore id=%d", sem->id);
    memset(sem, 0, sizeof(semaphore_t));

    hal_irq_restore(flags);
    return SYNC_OK;
}

int sem_wait(semaphore_t *sem)
{
    if (sem == NULL || sem->id == 0) {
        return SYNC_ERR_INVALID;
    }

    task_t *current = scheduler_get_current();
    if (current == NULL) {
        return SYNC_ERR_INVALID;
    }

    uint32_t flags = hal_irq_save();

    /* Try to decrement */
    if (sem->count > 0) {
        sem->count--;
        hal_irq_restore(flags);
        SYNC_DEBUG("Semaphore id=%d wait success (count=%d)",
                   sem->id, sem->count);
        return SYNC_OK;
    }

    /* Count is 0 - block */
    SYNC_DEBUG("Semaphore id=%d blocking task '%s'",
               sem->id, current->name);

    current->state = TASK_STATE_BLOCKED;
    current->block_reason = BLOCK_REASON_SEMAPHORE;
    current->block_object = sem;

    insert_wait_queue(&sem->wait_queue, current);
    sem->waiters_count++;

    hal_irq_restore(flags);

    /* Yield to let another task run */
    scheduler_yield();

    /* When we wake up, we've acquired the semaphore */
    return SYNC_OK;
}

int sem_trywait(semaphore_t *sem)
{
    if (sem == NULL || sem->id == 0) {
        return SYNC_ERR_INVALID;
    }

    uint32_t flags = hal_irq_save();

    if (sem->count > 0) {
        sem->count--;
        hal_irq_restore(flags);
        SYNC_DEBUG("Semaphore id=%d trywait success (count=%d)",
                   sem->id, sem->count);
        return SYNC_OK;
    }

    hal_irq_restore(flags);
    return SYNC_ERR_WOULD_BLOCK;
}

int sem_signal(semaphore_t *sem)
{
    if (sem == NULL || sem->id == 0) {
        return SYNC_ERR_INVALID;
    }

    uint32_t flags = hal_irq_save();

    /* Check for waiters */
    if (sem->wait_queue != NULL) {
        /* Wake first waiter (earliest deadline) */
        task_t *waiter = remove_wait_queue(&sem->wait_queue);
        sem->waiters_count--;

        waiter->state = TASK_STATE_READY;
        waiter->block_reason = BLOCK_REASON_NONE;
        waiter->block_object = NULL;

        SYNC_DEBUG("Semaphore id=%d woke task '%s'",
                   sem->id, waiter->name);

        hal_irq_restore(flags);

        /* Yield to potentially let waiter run */
        scheduler_yield();
        return SYNC_OK;
    }

    /* No waiters - increment count */
    if (sem->max_count > 0 && sem->count >= sem->max_count) {
        hal_irq_restore(flags);
        SYNC_DEBUG("Semaphore id=%d overflow (count=%d, max=%d)",
                   sem->id, sem->count, sem->max_count);
        return SYNC_ERR_OVERFLOW;
    }

    sem->count++;
    hal_irq_restore(flags);

    SYNC_DEBUG("Semaphore id=%d signal (count=%d)", sem->id, sem->count);
    return SYNC_OK;
}

int16_t sem_get_count(semaphore_t *sem)
{
    if (sem == NULL || sem->id == 0) {
        return -1;
    }
    return sem->count;
}
