/**
 * @file jezgro.h
 * @brief JEZGRO Real-Time Operating System for TC397XP
 *
 * Multi-core RTOS with:
 *   - EDF (Earliest Deadline First) scheduling
 *   - Per-core ready queues (no task migration)
 *   - CSA-based context switching
 *   - Cross-core IPC and synchronization
 *
 * Core assignment:
 *   - CPU0-3: Safety cores (lockstep) for critical tasks
 *   - CPU4-5: Performance cores for non-critical tasks
 */

#ifndef JEZGRO_H
#define JEZGRO_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Version
 * ========================================================================== */

#define JEZGRO_VERSION_MAJOR    1
#define JEZGRO_VERSION_MINOR    0
#define JEZGRO_VERSION_PATCH    0
#define JEZGRO_VERSION_STRING   "1.0.0-tricore"

/* ==========================================================================
 * Configuration
 * ========================================================================== */

/** Number of CPU cores */
#define JEZGRO_MAX_CORES        6

/** Maximum tasks per core */
#define JEZGRO_MAX_TASKS_PER_CORE   16

/** Total maximum tasks */
#define JEZGRO_MAX_TASKS        (JEZGRO_MAX_CORES * JEZGRO_MAX_TASKS_PER_CORE)

/** Maximum task name length */
#define JEZGRO_TASK_NAME_LEN    16

/** Default stack size per task */
#define JEZGRO_DEFAULT_STACK_SIZE   2048

/** Minimum stack size */
#define JEZGRO_MIN_STACK_SIZE       512

/** System tick frequency (Hz) */
#define JEZGRO_TICK_FREQ_HZ     1000

/** Tick period (microseconds) */
#define JEZGRO_TICK_PERIOD_US   (1000000 / JEZGRO_TICK_FREQ_HZ)

/** Maximum priority levels (higher = more urgent) */
#define JEZGRO_MAX_PRIORITY     255

/** Idle task priority (lowest) */
#define JEZGRO_PRIORITY_IDLE    0

/** Kernel priority (highest) */
#define JEZGRO_PRIORITY_KERNEL  255

/* IPC Configuration */
#define JEZGRO_MAX_QUEUES       16      /**< Message queues per core */
#define JEZGRO_MAX_MAILBOXES    8       /**< Cross-core mailboxes */
#define JEZGRO_MAX_SEMAPHORES   32      /**< Semaphores per core */
#define JEZGRO_MAX_MUTEXES      16      /**< Mutexes per core */

/* ==========================================================================
 * Error Codes
 * ========================================================================== */

typedef enum {
    JEZGRO_OK               = 0,        /**< Success */
    JEZGRO_ERROR            = -1,       /**< Generic error */
    JEZGRO_ERROR_NOMEM      = -2,       /**< Out of memory */
    JEZGRO_ERROR_PARAM      = -3,       /**< Invalid parameter */
    JEZGRO_ERROR_STATE      = -4,       /**< Invalid state */
    JEZGRO_ERROR_TIMEOUT    = -5,       /**< Timeout */
    JEZGRO_ERROR_BUSY       = -6,       /**< Resource busy */
    JEZGRO_ERROR_FULL       = -7,       /**< Queue/buffer full */
    JEZGRO_ERROR_EMPTY      = -8,       /**< Queue/buffer empty */
    JEZGRO_ERROR_DELETED    = -9,       /**< Object deleted */
    JEZGRO_ERROR_ISR        = -10,      /**< Invalid from ISR */
    JEZGRO_ERROR_NOTASK     = -11,      /**< No such task */
    JEZGRO_ERROR_DEADLINE   = -12,      /**< Deadline missed */
} jezgro_error_t;

/* ==========================================================================
 * Task States
 * ========================================================================== */

typedef enum {
    TASK_STATE_INACTIVE     = 0,        /**< Not yet created */
    TASK_STATE_READY        = 1,        /**< Ready to run */
    TASK_STATE_RUNNING      = 2,        /**< Currently executing */
    TASK_STATE_BLOCKED      = 3,        /**< Waiting for event */
    TASK_STATE_SUSPENDED    = 4,        /**< Manually suspended */
    TASK_STATE_TERMINATED   = 5,        /**< Finished execution */
} task_state_t;

/* ==========================================================================
 * Task Types
 * ========================================================================== */

/**
 * @brief Task flags
 */
typedef enum {
    TASK_FLAG_NONE          = 0x00,
    TASK_FLAG_PERIODIC      = 0x01,     /**< Periodic task */
    TASK_FLAG_REALTIME      = 0x02,     /**< Hard real-time */
    TASK_FLAG_SAFETY        = 0x04,     /**< Safety-critical */
    TASK_FLAG_PRIVILEGED    = 0x08,     /**< Supervisor mode */
} task_flags_t;

/**
 * @brief Task function type
 */
typedef void (*task_func_t)(void *arg);

/**
 * @brief Task handle (opaque pointer)
 */
typedef struct task_control_block* task_handle_t;

/**
 * @brief Task parameters for creation
 */
typedef struct {
    const char      *name;          /**< Task name */
    task_func_t     func;           /**< Entry function */
    void            *arg;           /**< Argument to function */
    uint8_t         priority;       /**< Priority (0-255) */
    uint32_t        stack_size;     /**< Stack size in bytes */
    void            *stack_base;    /**< Pre-allocated stack (NULL = auto) */
    uint32_t        core_affinity;  /**< Core to run on (0-5) */
    uint32_t        period_us;      /**< Period for periodic tasks (0 = aperiodic) */
    uint32_t        deadline_us;    /**< Relative deadline (0 = period) */
    task_flags_t    flags;          /**< Task flags */
} task_params_t;

/**
 * @brief Task statistics
 */
typedef struct {
    uint32_t        run_count;          /**< Times task has run */
    uint32_t        total_time_us;      /**< Total CPU time */
    uint32_t        max_exec_time_us;   /**< Worst-case execution */
    uint32_t        deadlines_missed;   /**< Deadline violations */
    uint32_t        preemptions;        /**< Times preempted */
} task_stats_t;

/* ==========================================================================
 * Kernel State
 * ========================================================================== */

/**
 * @brief Kernel state
 */
typedef enum {
    KERNEL_STATE_INIT       = 0,        /**< Initializing */
    KERNEL_STATE_RUNNING    = 1,        /**< Running normally */
    KERNEL_STATE_SUSPENDED  = 2,        /**< All scheduling suspended */
    KERNEL_STATE_PANIC      = 3,        /**< Fatal error */
} kernel_state_t;

/**
 * @brief Per-core kernel state
 */
typedef struct {
    kernel_state_t  state;              /**< Current state */
    task_handle_t   current_task;       /**< Running task */
    task_handle_t   idle_task;          /**< Idle task */
    uint32_t        tick_count;         /**< Local tick counter */
    uint32_t        task_count;         /**< Number of tasks */
    bool            scheduler_locked;   /**< Scheduler disabled */
    uint32_t        isr_nesting;        /**< ISR nesting depth */
} core_state_t;

/* ==========================================================================
 * Time Types
 * ========================================================================== */

/** Time in microseconds */
typedef uint32_t jezgro_time_us_t;

/** Time in milliseconds */
typedef uint32_t jezgro_time_ms_t;

/** Time in ticks */
typedef uint32_t jezgro_ticks_t;

/** Maximum timeout value (wait forever) */
#define JEZGRO_WAIT_FOREVER     ((jezgro_ticks_t)0xFFFFFFFF)

/** Don't wait (poll) */
#define JEZGRO_NO_WAIT          ((jezgro_ticks_t)0)

/* ==========================================================================
 * Kernel API
 * ========================================================================== */

/**
 * @brief Initialize JEZGRO kernel
 *
 * Must be called from CPU0 before any other kernel functions.
 * Initializes all per-core data structures.
 *
 * @return JEZGRO_OK on success
 */
jezgro_error_t jezgro_init(void);

/**
 * @brief Start the kernel scheduler
 *
 * Called from each core after tasks are created.
 * This function does not return.
 */
void jezgro_start(void);

/**
 * @brief Get kernel version string
 * @return Version string
 */
const char* jezgro_version(void);

/**
 * @brief Get kernel state for current core
 * @return Current kernel state
 */
kernel_state_t jezgro_get_state(void);

/**
 * @brief Get current tick count
 * @return Tick count
 */
jezgro_ticks_t jezgro_get_ticks(void);

/**
 * @brief Get current time in microseconds
 * @return Time in microseconds
 */
jezgro_time_us_t jezgro_get_time_us(void);

/**
 * @brief Convert ticks to milliseconds
 */
jezgro_time_ms_t jezgro_ticks_to_ms(jezgro_ticks_t ticks);

/**
 * @brief Convert milliseconds to ticks
 */
jezgro_ticks_t jezgro_ms_to_ticks(jezgro_time_ms_t ms);

/* ==========================================================================
 * Task API (defined in task.h)
 * ========================================================================== */

/* Forward declarations - full API in task.h */
jezgro_error_t task_create(const task_params_t *params, task_handle_t *handle);
jezgro_error_t task_delete(task_handle_t handle);
jezgro_error_t task_suspend(task_handle_t handle);
jezgro_error_t task_resume(task_handle_t handle);
task_handle_t task_get_current(void);
void task_yield(void);
void task_delay(jezgro_ticks_t ticks);
void task_delay_until(jezgro_ticks_t *prev_wake, jezgro_ticks_t period);

/* ==========================================================================
 * Scheduler API (defined in scheduler.h)
 * ========================================================================== */

/* Forward declarations - full API in scheduler.h */
void scheduler_lock(void);
void scheduler_unlock(void);
void scheduler_tick(void);

/* ==========================================================================
 * Synchronization API (defined in sync.h)
 * ========================================================================== */

/* Forward declarations - full API in sync.h */
typedef struct mutex* mutex_t;
typedef struct semaphore* semaphore_t;

/* ==========================================================================
 * IPC API (defined in ipc.h)
 * ========================================================================== */

/* Forward declarations - full API in ipc.h */
typedef struct message_queue* queue_t;
typedef struct mailbox* mailbox_t;

/* ==========================================================================
 * Utility Macros
 * ========================================================================== */

/** Calculate stack words from bytes */
#define JEZGRO_STACK_WORDS(bytes)   ((bytes) / sizeof(uint32_t))

/** Default task parameters initializer */
#define JEZGRO_TASK_PARAMS_DEFAULT  { \
    .name = "task",                   \
    .func = NULL,                     \
    .arg = NULL,                      \
    .priority = 128,                  \
    .stack_size = JEZGRO_DEFAULT_STACK_SIZE, \
    .stack_base = NULL,               \
    .core_affinity = 0,               \
    .period_us = 0,                   \
    .deadline_us = 0,                 \
    .flags = TASK_FLAG_NONE           \
}

/** Check if in ISR context */
bool jezgro_in_isr(void);

/** Enter critical section */
void jezgro_enter_critical(void);

/** Exit critical section */
void jezgro_exit_critical(void);

/* ==========================================================================
 * Debug / Assertions
 * ========================================================================== */

#ifdef JEZGRO_DEBUG

#define JEZGRO_ASSERT(cond) do { \
    if (!(cond)) { \
        jezgro_panic("Assert: " #cond); \
    } \
} while(0)

#else

#define JEZGRO_ASSERT(cond) ((void)0)

#endif

/**
 * @brief Kernel panic
 *
 * Called on unrecoverable error. Does not return.
 *
 * @param msg Error message
 */
void jezgro_panic(const char *msg) __attribute__((noreturn));

/**
 * @brief Deadline miss hook
 *
 * Called when a task misses its deadline.
 * Override this for custom handling.
 *
 * @param task Task that missed deadline
 * @param overrun Overrun in microseconds
 */
void jezgro_deadline_miss_hook(task_handle_t task, uint32_t overrun);

/**
 * @brief Stack overflow hook
 *
 * Called when stack overflow detected.
 *
 * @param task Task with overflow
 */
void jezgro_stack_overflow_hook(task_handle_t task);

#ifdef __cplusplus
}
#endif

#endif /* JEZGRO_H */
