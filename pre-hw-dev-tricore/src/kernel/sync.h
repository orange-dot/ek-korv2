/**
 * @file sync.h
 * @brief JEZGRO Synchronization Primitives
 *
 * Thread-safe synchronization mechanisms:
 *   - Spinlocks (cross-core, non-blocking)
 *   - Mutexes (per-core, blocking with priority inheritance)
 *   - Semaphores (counting, per-core)
 *   - Events (binary flags)
 *
 * For cross-core synchronization, use spinlocks or IPC mailboxes.
 * Mutexes and semaphores are per-core to avoid deadlock complexity.
 */

#ifndef SYNC_H
#define SYNC_H

#include "jezgro.h"

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Spinlock (Cross-Core)
 * ========================================================================== */

/**
 * @brief Spinlock structure
 *
 * For cross-core synchronization. Non-blocking.
 * Must be placed in shared memory (LMU).
 */
typedef struct {
    volatile uint32_t lock;         /**< Lock state */
    uint32_t owner_core;            /**< Owner core ID */
    const char *name;               /**< Name (debug) */
} sync_spinlock_t;

/**
 * @brief Static spinlock initializer
 */
#define SYNC_SPINLOCK_INIT(n) { .lock = 0, .owner_core = 0xFF, .name = n }

/**
 * @brief Initialize spinlock
 * @param spin Spinlock to initialize
 * @param name Name for debugging
 */
void sync_spinlock_init(sync_spinlock_t *spin, const char *name);

/**
 * @brief Acquire spinlock (blocking spin)
 *
 * Disables interrupts while spinning.
 * Use only for very short critical sections.
 *
 * @param spin Spinlock to acquire
 */
void sync_spinlock_acquire(sync_spinlock_t *spin);

/**
 * @brief Try to acquire spinlock (non-blocking)
 *
 * @param spin Spinlock to try
 * @return true if acquired, false if busy
 */
bool sync_spinlock_try(sync_spinlock_t *spin);

/**
 * @brief Release spinlock
 * @param spin Spinlock to release
 */
void sync_spinlock_release(sync_spinlock_t *spin);

/**
 * @brief Check if spinlock is held
 * @param spin Spinlock to check
 * @return true if locked
 */
bool sync_spinlock_is_locked(sync_spinlock_t *spin);

/* ==========================================================================
 * Mutex (Per-Core, Blocking)
 * ========================================================================== */

/**
 * @brief Mutex structure
 *
 * Blocking mutex with priority inheritance.
 * Per-core only (use IPC for cross-core).
 */
typedef struct {
    volatile uint32_t locked;       /**< Lock state */
    task_handle_t owner;            /**< Owning task */
    uint8_t owner_orig_priority;    /**< Owner's original priority */
    uint8_t ceiling;                /**< Priority ceiling */
    task_handle_t wait_head;        /**< Wait queue head */
    uint32_t wait_count;            /**< Tasks waiting */
    const char *name;               /**< Name (debug) */
} sync_mutex_t;

/**
 * @brief Static mutex initializer
 */
#define SYNC_MUTEX_INIT(n) { \
    .locked = 0, .owner = NULL, .owner_orig_priority = 0, \
    .ceiling = JEZGRO_MAX_PRIORITY, .wait_head = NULL, \
    .wait_count = 0, .name = n }

/**
 * @brief Initialize mutex
 * @param mtx Mutex to initialize
 * @param name Name for debugging
 */
void sync_mutex_init(sync_mutex_t *mtx, const char *name);

/**
 * @brief Lock mutex (blocking)
 *
 * Blocks calling task until mutex available.
 * Uses priority inheritance to prevent priority inversion.
 *
 * @param mtx Mutex to lock
 * @param timeout Maximum wait ticks (JEZGRO_WAIT_FOREVER for no timeout)
 * @return JEZGRO_OK on success, JEZGRO_ERROR_TIMEOUT on timeout
 */
jezgro_error_t sync_mutex_lock(sync_mutex_t *mtx, jezgro_ticks_t timeout);

/**
 * @brief Try to lock mutex (non-blocking)
 *
 * @param mtx Mutex to try
 * @return JEZGRO_OK if acquired, JEZGRO_ERROR_BUSY if held
 */
jezgro_error_t sync_mutex_trylock(sync_mutex_t *mtx);

/**
 * @brief Unlock mutex
 *
 * Must be called by owner task.
 * Wakes highest-priority waiting task.
 *
 * @param mtx Mutex to unlock
 * @return JEZGRO_OK on success, JEZGRO_ERROR_STATE if not owner
 */
jezgro_error_t sync_mutex_unlock(sync_mutex_t *mtx);

/**
 * @brief Check if mutex is locked
 * @param mtx Mutex to check
 * @return true if locked
 */
bool sync_mutex_is_locked(sync_mutex_t *mtx);

/**
 * @brief Get mutex owner
 * @param mtx Mutex to query
 * @return Owner task handle, or NULL if unlocked
 */
task_handle_t sync_mutex_get_owner(sync_mutex_t *mtx);

/* ==========================================================================
 * Semaphore (Counting)
 * ========================================================================== */

/**
 * @brief Semaphore structure
 *
 * Counting semaphore for resource counting.
 * Per-core only.
 */
typedef struct {
    volatile int32_t count;         /**< Current count */
    int32_t max_count;              /**< Maximum count */
    task_handle_t wait_head;        /**< Wait queue head */
    uint32_t wait_count;            /**< Tasks waiting */
    const char *name;               /**< Name (debug) */
} sync_semaphore_t;

/**
 * @brief Static semaphore initializer
 */
#define SYNC_SEMAPHORE_INIT(n, initial, max) { \
    .count = initial, .max_count = max, \
    .wait_head = NULL, .wait_count = 0, .name = n }

/**
 * @brief Binary semaphore initializer
 */
#define SYNC_BINARY_SEMAPHORE_INIT(n, initial) \
    SYNC_SEMAPHORE_INIT(n, initial, 1)

/**
 * @brief Initialize semaphore
 * @param sem Semaphore to initialize
 * @param name Name for debugging
 * @param initial_count Initial count
 * @param max_count Maximum count (0 = unlimited)
 */
void sync_semaphore_init(sync_semaphore_t *sem, const char *name,
                         int32_t initial_count, int32_t max_count);

/**
 * @brief Wait on semaphore (decrement)
 *
 * Blocks if count is zero until signaled.
 *
 * @param sem Semaphore to wait on
 * @param timeout Maximum wait ticks
 * @return JEZGRO_OK on success, JEZGRO_ERROR_TIMEOUT on timeout
 */
jezgro_error_t sync_semaphore_wait(sync_semaphore_t *sem, jezgro_ticks_t timeout);

/**
 * @brief Try wait on semaphore (non-blocking)
 *
 * @param sem Semaphore to try
 * @return JEZGRO_OK if acquired, JEZGRO_ERROR_BUSY if count is zero
 */
jezgro_error_t sync_semaphore_trywait(sync_semaphore_t *sem);

/**
 * @brief Signal semaphore (increment)
 *
 * Wakes one waiting task if any.
 *
 * @param sem Semaphore to signal
 * @return JEZGRO_OK on success, JEZGRO_ERROR_FULL if at max count
 */
jezgro_error_t sync_semaphore_signal(sync_semaphore_t *sem);

/**
 * @brief Get semaphore count
 * @param sem Semaphore to query
 * @return Current count
 */
int32_t sync_semaphore_get_count(sync_semaphore_t *sem);

/* ==========================================================================
 * Event Flags
 * ========================================================================== */

/**
 * @brief Event flags structure
 *
 * Bit flags for event signaling.
 */
typedef struct {
    volatile uint32_t flags;        /**< Current flags */
    task_handle_t wait_head;        /**< Wait queue head */
    const char *name;               /**< Name (debug) */
} sync_event_t;

/**
 * @brief Static event initializer
 */
#define SYNC_EVENT_INIT(n) { .flags = 0, .wait_head = NULL, .name = n }

/**
 * @brief Event wait mode
 */
typedef enum {
    SYNC_EVENT_ANY  = 0,            /**< Wait for any flag */
    SYNC_EVENT_ALL  = 1,            /**< Wait for all flags */
} sync_event_mode_t;

/**
 * @brief Initialize event flags
 * @param event Event to initialize
 * @param name Name for debugging
 */
void sync_event_init(sync_event_t *event, const char *name);

/**
 * @brief Wait for event flags
 *
 * @param event Event to wait on
 * @param flags Flags to wait for
 * @param mode SYNC_EVENT_ANY or SYNC_EVENT_ALL
 * @param clear Clear flags on wake
 * @param timeout Maximum wait ticks
 * @param actual Output: flags that triggered wake
 * @return JEZGRO_OK on success
 */
jezgro_error_t sync_event_wait(sync_event_t *event, uint32_t flags,
                               sync_event_mode_t mode, bool clear,
                               jezgro_ticks_t timeout, uint32_t *actual);

/**
 * @brief Set event flags
 *
 * Sets flags and wakes waiting tasks.
 *
 * @param event Event to set
 * @param flags Flags to set
 * @return JEZGRO_OK on success
 */
jezgro_error_t sync_event_set(sync_event_t *event, uint32_t flags);

/**
 * @brief Clear event flags
 *
 * @param event Event to clear
 * @param flags Flags to clear
 * @return Previous flag state
 */
uint32_t sync_event_clear(sync_event_t *event, uint32_t flags);

/**
 * @brief Get event flags
 * @param event Event to query
 * @return Current flags
 */
uint32_t sync_event_get(sync_event_t *event);

/* ==========================================================================
 * Condition Variable
 * ========================================================================== */

/**
 * @brief Condition variable structure
 */
typedef struct {
    task_handle_t wait_head;        /**< Wait queue */
    uint32_t wait_count;            /**< Waiters */
    const char *name;               /**< Name (debug) */
} sync_cond_t;

/**
 * @brief Static condition variable initializer
 */
#define SYNC_COND_INIT(n) { .wait_head = NULL, .wait_count = 0, .name = n }

/**
 * @brief Initialize condition variable
 * @param cond Condition variable to initialize
 * @param name Name for debugging
 */
void sync_cond_init(sync_cond_t *cond, const char *name);

/**
 * @brief Wait on condition variable
 *
 * Must be called with mutex held. Releases mutex while waiting.
 *
 * @param cond Condition variable
 * @param mtx Associated mutex (will be released/reacquired)
 * @param timeout Maximum wait ticks
 * @return JEZGRO_OK on success
 */
jezgro_error_t sync_cond_wait(sync_cond_t *cond, sync_mutex_t *mtx,
                              jezgro_ticks_t timeout);

/**
 * @brief Signal condition variable
 *
 * Wakes one waiting task.
 *
 * @param cond Condition variable
 * @return JEZGRO_OK on success
 */
jezgro_error_t sync_cond_signal(sync_cond_t *cond);

/**
 * @brief Broadcast to condition variable
 *
 * Wakes all waiting tasks.
 *
 * @param cond Condition variable
 * @return JEZGRO_OK on success
 */
jezgro_error_t sync_cond_broadcast(sync_cond_t *cond);

/* ==========================================================================
 * Reader-Writer Lock
 * ========================================================================== */

/**
 * @brief Reader-writer lock structure
 */
typedef struct {
    volatile int32_t readers;       /**< Reader count */
    volatile bool writer;           /**< Writer active */
    task_handle_t read_wait;        /**< Reader wait queue */
    task_handle_t write_wait;       /**< Writer wait queue */
    const char *name;               /**< Name (debug) */
} sync_rwlock_t;

/**
 * @brief Static rwlock initializer
 */
#define SYNC_RWLOCK_INIT(n) { \
    .readers = 0, .writer = false, \
    .read_wait = NULL, .write_wait = NULL, .name = n }

/**
 * @brief Initialize reader-writer lock
 */
void sync_rwlock_init(sync_rwlock_t *rwlock, const char *name);

/**
 * @brief Acquire read lock
 *
 * Multiple readers can hold simultaneously.
 * Blocks if writer is active.
 *
 * @param rwlock Lock to acquire
 * @param timeout Maximum wait
 * @return JEZGRO_OK on success
 */
jezgro_error_t sync_rwlock_rdlock(sync_rwlock_t *rwlock, jezgro_ticks_t timeout);

/**
 * @brief Acquire write lock
 *
 * Exclusive access. Blocks until all readers release.
 *
 * @param rwlock Lock to acquire
 * @param timeout Maximum wait
 * @return JEZGRO_OK on success
 */
jezgro_error_t sync_rwlock_wrlock(sync_rwlock_t *rwlock, jezgro_ticks_t timeout);

/**
 * @brief Release read lock
 * @param rwlock Lock to release
 * @return JEZGRO_OK on success
 */
jezgro_error_t sync_rwlock_rdunlock(sync_rwlock_t *rwlock);

/**
 * @brief Release write lock
 * @param rwlock Lock to release
 * @return JEZGRO_OK on success
 */
jezgro_error_t sync_rwlock_wrunlock(sync_rwlock_t *rwlock);

#ifdef __cplusplus
}
#endif

#endif /* SYNC_H */
