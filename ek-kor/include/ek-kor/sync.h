/**
 * @file sync.h
 * @brief ek-kor Synchronization Primitives
 *
 * Thread-safe synchronization mechanisms:
 *   - Spinlocks (cross-core, non-blocking)
 *   - Mutexes (per-core, blocking with priority inheritance)
 *   - Semaphores (counting, per-core)
 *   - Events (binary flags)
 *   - Condition variables
 *   - Reader-writer locks
 */

#ifndef EKK_SYNC_H
#define EKK_SYNC_H

#include <ek-kor/types.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Spinlock (Cross-Core)
 * ========================================================================== */

/**
 * @brief Spinlock structure (for cross-core sync)
 */
typedef struct {
    volatile uint32_t lock;
    uint32_t owner_core;
    const char *name;
} ekk_spinlock_t;

#define EKK_SPINLOCK_INIT(n) { .lock = 0, .owner_core = 0xFF, .name = n }

void ekk_spinlock_init(ekk_spinlock_t *spin, const char *name);
void ekk_spinlock_acquire(ekk_spinlock_t *spin);
bool ekk_spinlock_try(ekk_spinlock_t *spin);
void ekk_spinlock_release(ekk_spinlock_t *spin);
bool ekk_spinlock_is_locked(ekk_spinlock_t *spin);

/* ==========================================================================
 * Mutex (Per-Core, Blocking)
 * ========================================================================== */

/**
 * @brief Mutex structure with priority inheritance
 */
typedef struct {
    volatile uint32_t locked;
    ekk_task_t owner;
    uint8_t owner_orig_priority;
    uint8_t ceiling;
    ekk_task_t wait_head;
    uint32_t wait_count;
    const char *name;
} ekk_mutex_struct_t;

#define EKK_MUTEX_INIT(n) { \
    .locked = 0, .owner = NULL, .owner_orig_priority = 0, \
    .ceiling = 255, .wait_head = NULL, .wait_count = 0, .name = n }

void ekk_mutex_init(ekk_mutex_struct_t *mtx, const char *name);
ekk_err_t ekk_mutex_lock(ekk_mutex_struct_t *mtx, ekk_tick_t timeout);
ekk_err_t ekk_mutex_trylock(ekk_mutex_struct_t *mtx);
ekk_err_t ekk_mutex_unlock(ekk_mutex_struct_t *mtx);
bool ekk_mutex_is_locked(ekk_mutex_struct_t *mtx);
ekk_task_t ekk_mutex_get_owner(ekk_mutex_struct_t *mtx);

/* ==========================================================================
 * Semaphore (Counting)
 * ========================================================================== */

/**
 * @brief Counting semaphore structure
 */
typedef struct {
    volatile int32_t count;
    int32_t max_count;
    ekk_task_t wait_head;
    uint32_t wait_count;
    const char *name;
} ekk_sem_struct_t;

#define EKK_SEMAPHORE_INIT(n, initial, max) { \
    .count = initial, .max_count = max, \
    .wait_head = NULL, .wait_count = 0, .name = n }

#define EKK_BINARY_SEM_INIT(n, initial) EKK_SEMAPHORE_INIT(n, initial, 1)

void ekk_sem_init(ekk_sem_struct_t *sem, const char *name,
                  int32_t initial_count, int32_t max_count);
ekk_err_t ekk_sem_wait(ekk_sem_struct_t *sem, ekk_tick_t timeout);
ekk_err_t ekk_sem_trywait(ekk_sem_struct_t *sem);
ekk_err_t ekk_sem_signal(ekk_sem_struct_t *sem);
int32_t ekk_sem_get_count(ekk_sem_struct_t *sem);

/* ==========================================================================
 * Event Flags
 * ========================================================================== */

/**
 * @brief Event flags structure
 */
typedef struct {
    volatile uint32_t flags;
    ekk_task_t wait_head;
    const char *name;
} ekk_event_struct_t;

#define EKK_EVENT_INIT(n) { .flags = 0, .wait_head = NULL, .name = n }

typedef enum {
    EKK_EVENT_ANY = 0,
    EKK_EVENT_ALL = 1,
} ekk_event_mode_t;

void ekk_event_init(ekk_event_struct_t *event, const char *name);
ekk_err_t ekk_event_wait(ekk_event_struct_t *event, uint32_t flags,
                         ekk_event_mode_t mode, bool clear,
                         ekk_tick_t timeout, uint32_t *actual);
ekk_err_t ekk_event_set(ekk_event_struct_t *event, uint32_t flags);
uint32_t ekk_event_clear(ekk_event_struct_t *event, uint32_t flags);
uint32_t ekk_event_get(ekk_event_struct_t *event);

/* ==========================================================================
 * Condition Variable
 * ========================================================================== */

/**
 * @brief Condition variable structure
 */
typedef struct {
    ekk_task_t wait_head;
    uint32_t wait_count;
    const char *name;
} ekk_cond_t;

#define EKK_COND_INIT(n) { .wait_head = NULL, .wait_count = 0, .name = n }

void ekk_cond_init(ekk_cond_t *cond, const char *name);
ekk_err_t ekk_cond_wait(ekk_cond_t *cond, ekk_mutex_struct_t *mtx,
                        ekk_tick_t timeout);
ekk_err_t ekk_cond_signal(ekk_cond_t *cond);
ekk_err_t ekk_cond_broadcast(ekk_cond_t *cond);

/* ==========================================================================
 * Reader-Writer Lock
 * ========================================================================== */

/**
 * @brief Reader-writer lock structure
 */
typedef struct {
    volatile int32_t readers;
    volatile bool writer;
    ekk_task_t read_wait;
    ekk_task_t write_wait;
    const char *name;
} ekk_rwlock_t;

#define EKK_RWLOCK_INIT(n) { \
    .readers = 0, .writer = false, \
    .read_wait = NULL, .write_wait = NULL, .name = n }

void ekk_rwlock_init(ekk_rwlock_t *rwlock, const char *name);
ekk_err_t ekk_rwlock_rdlock(ekk_rwlock_t *rwlock, ekk_tick_t timeout);
ekk_err_t ekk_rwlock_wrlock(ekk_rwlock_t *rwlock, ekk_tick_t timeout);
ekk_err_t ekk_rwlock_rdunlock(ekk_rwlock_t *rwlock);
ekk_err_t ekk_rwlock_wrunlock(ekk_rwlock_t *rwlock);

#ifdef __cplusplus
}
#endif

#endif /* EKK_SYNC_H */
