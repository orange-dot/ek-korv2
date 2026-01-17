/**
 * @file sync.h
 * @brief JEZGRO Synchronization Primitives - Mutex and Semaphore
 *
 * Provides mutex (mutual exclusion) and semaphore (counting/binary)
 * primitives for task synchronization.
 *
 * Copyright (c) 2026 Elektrokombinacija
 * SPDX-License-Identifier: MIT
 */

#ifndef SYNC_H
#define SYNC_H

#include <stdint.h>
#include <stdbool.h>

/* Forward declaration - actual task_t is in jezgro.h */
struct task;

/*===========================================================================*/
/* Mutex Types                                                               */
/*===========================================================================*/

/**
 * @brief Mutex (Mutual Exclusion Lock)
 *
 * Features:
 * - Owner tracking (only owner can unlock)
 * - Recursive locking (same task can lock multiple times)
 * - Wait queue sorted by EDF deadline
 */
typedef struct {
    uint8_t         id;             /**< Mutex ID (1-16, 0=invalid) */
    bool            locked;         /**< Lock state */
    struct task     *owner;         /**< Current owner (NULL if unlocked) */
    uint8_t         recursion_count;/**< Recursive lock count */
    struct task     *wait_queue;    /**< Tasks waiting for this mutex */
    uint8_t         waiters_count;  /**< Number of waiting tasks */
} mutex_t;

/*===========================================================================*/
/* Semaphore Types                                                           */
/*===========================================================================*/

/**
 * @brief Semaphore (Counting/Binary)
 *
 * Features:
 * - Counting semaphore (count >= 0)
 * - Binary semaphore (max_count = 1)
 * - Wait queue sorted by EDF deadline
 */
typedef struct {
    uint8_t         id;             /**< Semaphore ID (1-16, 0=invalid) */
    int16_t         count;          /**< Current value */
    int16_t         max_count;      /**< Maximum value (0=unbounded) */
    struct task     *wait_queue;    /**< Tasks waiting for this semaphore */
    uint8_t         waiters_count;  /**< Number of waiting tasks */
} semaphore_t;

/*===========================================================================*/
/* Error Codes                                                               */
/*===========================================================================*/

#define SYNC_OK             0
#define SYNC_ERR_NOMEM     -1   /**< No free slots in pool */
#define SYNC_ERR_INVALID   -2   /**< Invalid parameter or object */
#define SYNC_ERR_OWNER     -3   /**< Not owner (mutex unlock) */
#define SYNC_ERR_WOULD_BLOCK -4 /**< Would block (trylock/trywait) */
#define SYNC_ERR_OVERFLOW  -5   /**< Semaphore count overflow */

/*===========================================================================*/
/* Initialization                                                            */
/*===========================================================================*/

/**
 * @brief Initialize synchronization subsystem
 *
 * Must be called before creating any mutex or semaphore.
 */
void sync_init(void);

/*===========================================================================*/
/* Mutex API                                                                 */
/*===========================================================================*/

/**
 * @brief Create a new mutex
 * @return Pointer to mutex, or NULL if no slots available
 */
mutex_t *mutex_create(void);

/**
 * @brief Destroy a mutex
 * @param mtx Mutex to destroy
 * @return SYNC_OK on success, error code otherwise
 *
 * @note Will fail if mutex is locked or has waiters
 */
int mutex_destroy(mutex_t *mtx);

/**
 * @brief Lock a mutex (blocking)
 * @param mtx Mutex to lock
 * @return SYNC_OK on success
 *
 * If mutex is already locked by another task, the calling task
 * will block until the mutex becomes available.
 *
 * Supports recursive locking: the same task can lock multiple times,
 * and must unlock the same number of times.
 */
int mutex_lock(mutex_t *mtx);

/**
 * @brief Try to lock a mutex (non-blocking)
 * @param mtx Mutex to lock
 * @return SYNC_OK if locked, SYNC_ERR_WOULD_BLOCK if already locked
 *
 * Never blocks. Returns immediately if mutex is not available.
 */
int mutex_trylock(mutex_t *mtx);

/**
 * @brief Unlock a mutex
 * @param mtx Mutex to unlock
 * @return SYNC_OK on success, SYNC_ERR_OWNER if not owner
 *
 * For recursive locks, decrements the recursion count.
 * When count reaches 0, the mutex is released.
 *
 * If tasks are waiting, the one with the earliest deadline
 * will be woken and become the new owner.
 */
int mutex_unlock(mutex_t *mtx);

/**
 * @brief Check if current task owns the mutex
 * @param mtx Mutex to check
 * @return true if current task is owner
 */
bool mutex_is_owner(mutex_t *mtx);

/*===========================================================================*/
/* Semaphore API                                                             */
/*===========================================================================*/

/**
 * @brief Create a counting semaphore
 * @param initial_count Initial count value
 * @param max_count Maximum count (0 = unbounded)
 * @return Pointer to semaphore, or NULL if no slots available
 */
semaphore_t *sem_create(int16_t initial_count, int16_t max_count);

/**
 * @brief Create a binary semaphore
 * @param initial_value Initial value (0 or 1)
 * @return Pointer to semaphore, or NULL if no slots available
 */
semaphore_t *sem_create_binary(int16_t initial_value);

/**
 * @brief Destroy a semaphore
 * @param sem Semaphore to destroy
 * @return SYNC_OK on success, error code otherwise
 *
 * @note Will fail if semaphore has waiters
 */
int sem_destroy(semaphore_t *sem);

/**
 * @brief Wait on semaphore (blocking)
 * @param sem Semaphore to wait on
 * @return SYNC_OK on success
 *
 * Decrements the count. If count was 0, blocks until
 * another task signals the semaphore.
 */
int sem_wait(semaphore_t *sem);

/**
 * @brief Try to wait on semaphore (non-blocking)
 * @param sem Semaphore to wait on
 * @return SYNC_OK if decremented, SYNC_ERR_WOULD_BLOCK if count was 0
 *
 * Never blocks. Returns immediately if count is 0.
 */
int sem_trywait(semaphore_t *sem);

/**
 * @brief Signal a semaphore
 * @param sem Semaphore to signal
 * @return SYNC_OK on success, SYNC_ERR_OVERFLOW if max exceeded
 *
 * If tasks are waiting, wakes the one with the earliest deadline.
 * Otherwise, increments the count (up to max_count if bounded).
 */
int sem_signal(semaphore_t *sem);

/**
 * @brief Get current semaphore count
 * @param sem Semaphore to query
 * @return Current count value
 */
int16_t sem_get_count(semaphore_t *sem);

#endif /* SYNC_H */
