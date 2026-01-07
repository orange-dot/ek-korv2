/**
 * @file tricore_multicore.h
 * @brief TriCore Multi-Core Support
 *
 * Provides multi-core startup, synchronization primitives,
 * and inter-processor interrupts (IPI) for TC397XP.
 */

#ifndef TRICORE_MULTICORE_H
#define TRICORE_MULTICORE_H

#include <stdint.h>
#include <stdbool.h>
#include "tricore_cpu.h"

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Constants
 * ========================================================================== */

/* IPI (Inter-Processor Interrupt) events */
#define IPI_EVENT_NONE          0       /**< No event */
#define IPI_EVENT_SCHEDULE      1       /**< Reschedule request */
#define IPI_EVENT_WAKEUP        2       /**< Wake up from idle */
#define IPI_EVENT_STOP          3       /**< Stop core */
#define IPI_EVENT_CALL          4       /**< Remote function call */
#define IPI_EVENT_USER          16      /**< First user-defined event */

/* Spinlock states */
#define SPINLOCK_UNLOCKED       0
#define SPINLOCK_LOCKED         1

/* ==========================================================================
 * Types
 * ========================================================================== */

/**
 * @brief Spinlock type
 *
 * Simple test-and-set spinlock for cross-core synchronization.
 * Must be placed in shared memory (LMU).
 */
typedef struct {
    volatile uint32_t lock;     /**< Lock state */
    uint32_t owner;             /**< Owner core ID (for debugging) */
} spinlock_t;

/**
 * @brief Core entry function type
 */
typedef void (*core_entry_t)(void *arg);

/**
 * @brief IPI handler function type
 */
typedef void (*ipi_handler_t)(uint32_t event, void *arg);

/**
 * @brief Cross-core function call
 */
typedef struct {
    void (*func)(void *);       /**< Function to call */
    void *arg;                  /**< Argument */
    volatile bool done;         /**< Completion flag */
    volatile int result;        /**< Result code */
} remote_call_t;

/* ==========================================================================
 * Spinlock Operations
 * ========================================================================== */

/**
 * @brief Initialize a spinlock
 * @param lock Pointer to spinlock
 */
static inline void spinlock_init(spinlock_t *lock)
{
    lock->lock = SPINLOCK_UNLOCKED;
    lock->owner = CPU_COUNT;  /* Invalid owner */
}

/**
 * @brief Acquire a spinlock (blocking)
 *
 * Spins until lock is acquired. Uses atomic swap instruction.
 *
 * @param lock Pointer to spinlock
 */
static inline void spinlock_acquire(spinlock_t *lock)
{
    while (__swap(&lock->lock, SPINLOCK_LOCKED) != SPINLOCK_UNLOCKED) {
        /* Spin */
        __nop();
    }
    __dsync();  /* Ensure subsequent reads see updates */
    lock->owner = cpu_get_id();
}

/**
 * @brief Try to acquire a spinlock (non-blocking)
 * @param lock Pointer to spinlock
 * @return true if lock acquired, false if already held
 */
static inline bool spinlock_try_acquire(spinlock_t *lock)
{
    if (__swap(&lock->lock, SPINLOCK_LOCKED) == SPINLOCK_UNLOCKED) {
        __dsync();
        lock->owner = cpu_get_id();
        return true;
    }
    return false;
}

/**
 * @brief Release a spinlock
 * @param lock Pointer to spinlock
 */
static inline void spinlock_release(spinlock_t *lock)
{
    lock->owner = CPU_COUNT;
    __dsync();  /* Ensure all writes complete before release */
    lock->lock = SPINLOCK_UNLOCKED;
}

/**
 * @brief Check if spinlock is held
 * @param lock Pointer to spinlock
 * @return true if locked
 */
static inline bool spinlock_is_locked(spinlock_t *lock)
{
    return lock->lock == SPINLOCK_LOCKED;
}

/**
 * @brief Check if current core owns the spinlock
 * @param lock Pointer to spinlock
 * @return true if owned by current core
 */
static inline bool spinlock_is_owner(spinlock_t *lock)
{
    return lock->owner == cpu_get_id();
}

/* ==========================================================================
 * Multi-Core Startup
 * ========================================================================== */

/**
 * @brief Initialize multi-core subsystem
 *
 * Called once from CPU0 during boot. Sets up:
 *   - Per-core data structures
 *   - IPI handlers
 *   - Core startup synchronization
 */
void multicore_init(void);

/**
 * @brief Start a secondary core
 *
 * Releases the specified core from reset and starts execution
 * at the given entry point.
 *
 * @param core_id Core to start (1-5, CPU0 is already running)
 * @param entry Entry function
 * @param arg Argument to pass to entry function
 * @return 0 on success, -1 on error
 */
int multicore_start_core(uint32_t core_id, core_entry_t entry, void *arg);

/**
 * @brief Start all secondary cores
 *
 * Starts CPU1-CPU5 with their registered entry functions.
 *
 * @return Number of cores started
 */
int multicore_start_all(void);

/**
 * @brief Wait for a core to reach ready state
 * @param core_id Core to wait for
 * @param timeout_ms Timeout in milliseconds (0 = infinite)
 * @return true if core is ready, false on timeout
 */
bool multicore_wait_core_ready(uint32_t core_id, uint32_t timeout_ms);

/**
 * @brief Wait for all cores to reach ready state
 * @param timeout_ms Timeout in milliseconds (0 = infinite)
 * @return true if all cores ready, false on timeout
 */
bool multicore_wait_all_ready(uint32_t timeout_ms);

/**
 * @brief Signal that current core is ready
 *
 * Called by secondary cores after initialization complete.
 */
void multicore_signal_ready(void);

/**
 * @brief Check if a core is ready
 * @param core_id Core to check
 * @return true if ready
 */
bool multicore_is_core_ready(uint32_t core_id);

/* ==========================================================================
 * Inter-Processor Interrupts (IPI)
 * ========================================================================== */

/**
 * @brief Register IPI handler for current core
 * @param handler Handler function
 */
void multicore_register_ipi_handler(ipi_handler_t handler);

/**
 * @brief Send IPI to a specific core
 * @param target_core Destination core
 * @param event Event type
 * @param arg Event argument
 * @return 0 on success
 */
int multicore_send_ipi(uint32_t target_core, uint32_t event, void *arg);

/**
 * @brief Send IPI to all other cores
 * @param event Event type
 * @param arg Event argument
 * @return Number of cores notified
 */
int multicore_broadcast_ipi(uint32_t event, void *arg);

/**
 * @brief Handle incoming IPI (called from ISR)
 */
void multicore_handle_ipi(void);

/* ==========================================================================
 * Remote Function Calls
 * ========================================================================== */

/**
 * @brief Call a function on another core (blocking)
 *
 * Sends an IPI to the target core to execute the function,
 * then waits for completion.
 *
 * @param target_core Destination core
 * @param func Function to call
 * @param arg Argument
 * @param timeout_ms Timeout in milliseconds (0 = infinite)
 * @return 0 on success, -1 on error/timeout
 */
int multicore_call_on_core(uint32_t target_core, void (*func)(void*), void *arg, uint32_t timeout_ms);

/**
 * @brief Call a function on all other cores (blocking)
 * @param func Function to call
 * @param arg Argument
 * @param timeout_ms Timeout in milliseconds
 * @return Number of cores that completed successfully
 */
int multicore_call_on_all(void (*func)(void*), void *arg, uint32_t timeout_ms);

/* ==========================================================================
 * Core Synchronization Barriers
 * ========================================================================== */

/**
 * @brief Synchronization barrier
 *
 * All cores must reach the barrier before any can continue.
 * Each call must use a unique barrier_id.
 *
 * @param barrier_id Unique identifier for this barrier point
 */
void multicore_barrier(uint32_t barrier_id);

/**
 * @brief Memory barrier across all cores
 *
 * Ensures all previous memory operations are visible to all cores.
 */
void multicore_memory_barrier(void);

/* ==========================================================================
 * Shared Memory Helpers
 * ========================================================================== */

/**
 * @brief Get LMU (shared memory) base address
 * @return LMU base address
 */
uint32_t multicore_get_shared_base(void);

/**
 * @brief Get LMU size
 * @return LMU size in bytes
 */
uint32_t multicore_get_shared_size(void);

/**
 * @brief Allocate memory from shared pool
 *
 * Simple bump allocator for shared memory.
 * Must be called with proper synchronization.
 *
 * @param size Size in bytes
 * @param align Alignment (must be power of 2)
 * @return Pointer to allocated memory, or NULL
 */
void* multicore_alloc_shared(uint32_t size, uint32_t align);

#ifdef __cplusplus
}
#endif

#endif /* TRICORE_MULTICORE_H */
