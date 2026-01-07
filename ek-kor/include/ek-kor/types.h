/**
 * @file types.h
 * @brief ek-kor Common Types and Definitions
 *
 * Platform-independent types and definitions for ek-kor kernel.
 * Works across all implementations (STM32, TriCore, simulation).
 */

#ifndef EKK_TYPES_H
#define EKK_TYPES_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Compiler Compatibility
 * ========================================================================== */

/* noreturn attribute */
#if defined(__GNUC__) || defined(__clang__)
    #define EKK_NORETURN __attribute__((noreturn))
#elif defined(_MSC_VER)
    #define EKK_NORETURN __declspec(noreturn)
#else
    #define EKK_NORETURN
#endif

/* weak attribute (for overridable functions) */
#if defined(__GNUC__) || defined(__clang__)
    #define EKK_WEAK __attribute__((weak))
#else
    #define EKK_WEAK
#endif

/* unused attribute */
#if defined(__GNUC__) || defined(__clang__)
    #define EKK_UNUSED __attribute__((unused))
#else
    #define EKK_UNUSED
#endif

/* packed attribute */
#if defined(__GNUC__) || defined(__clang__)
    #define EKK_PACKED __attribute__((packed))
#elif defined(_MSC_VER)
    #define EKK_PACKED
    /* Use #pragma pack(push,1) / #pragma pack(pop) for MSVC */
#else
    #define EKK_PACKED
#endif

/* aligned attribute */
#if defined(__GNUC__) || defined(__clang__)
    #define EKK_ALIGNED(n) __attribute__((aligned(n)))
#elif defined(_MSC_VER)
    #define EKK_ALIGNED(n) __declspec(align(n))
#else
    #define EKK_ALIGNED(n)
#endif

/* ==========================================================================
 * Error Codes
 * ========================================================================== */

/**
 * @brief ek-kor error codes
 */
typedef enum {
    EKK_OK              = 0,        /**< Success */
    EKK_ERROR           = -1,       /**< Generic error */
    EKK_ERR_NOMEM       = -2,       /**< Out of memory */
    EKK_ERR_PARAM       = -3,       /**< Invalid parameter */
    EKK_ERR_STATE       = -4,       /**< Invalid state */
    EKK_ERR_TIMEOUT     = -5,       /**< Timeout */
    EKK_ERR_BUSY        = -6,       /**< Resource busy */
    EKK_ERR_FULL        = -7,       /**< Queue/buffer full */
    EKK_ERR_EMPTY       = -8,       /**< Queue/buffer empty */
    EKK_ERR_DELETED     = -9,       /**< Object deleted */
    EKK_ERR_ISR         = -10,      /**< Invalid from ISR */
    EKK_ERR_NOTASK      = -11,      /**< No such task */
    EKK_ERR_DEADLINE    = -12,      /**< Deadline missed */
    EKK_ERR_FAULT       = -13,      /**< Hardware/software fault */
} ekk_err_t;

/* ==========================================================================
 * Time Types
 * ========================================================================== */

/** Time in ticks */
typedef uint32_t ekk_tick_t;

/** Time in microseconds */
typedef uint32_t ekk_time_us_t;

/** Time in milliseconds */
typedef uint32_t ekk_time_ms_t;

/** Maximum timeout (wait forever) */
#define EKK_WAIT_FOREVER    ((ekk_tick_t)0xFFFFFFFF)

/** No wait (poll) */
#define EKK_NO_WAIT         ((ekk_tick_t)0)

/* ==========================================================================
 * Task Types
 * ========================================================================== */

/**
 * @brief Task state
 */
typedef enum {
    EKK_TASK_INACTIVE   = 0,        /**< Not created */
    EKK_TASK_READY      = 1,        /**< Ready to run */
    EKK_TASK_RUNNING    = 2,        /**< Currently executing */
    EKK_TASK_BLOCKED    = 3,        /**< Waiting for event */
    EKK_TASK_SUSPENDED  = 4,        /**< Manually suspended */
    EKK_TASK_TERMINATED = 5,        /**< Finished */
} ekk_task_state_t;

/**
 * @brief Task flags
 */
typedef enum {
    EKK_TASK_FLAG_NONE       = 0x00,
    EKK_TASK_FLAG_PERIODIC   = 0x01, /**< Periodic task */
    EKK_TASK_FLAG_REALTIME   = 0x02, /**< Hard real-time */
    EKK_TASK_FLAG_SAFETY     = 0x04, /**< Safety-critical */
    EKK_TASK_FLAG_PRIVILEGED = 0x08, /**< Privileged mode */
} ekk_task_flags_t;

/**
 * @brief Task function type
 */
typedef void (*ekk_task_func_t)(void *arg);

/**
 * @brief Task handle (opaque)
 */
typedef struct ekk_tcb* ekk_task_t;

/**
 * @brief Task parameters for creation
 */
typedef struct {
    const char          *name;          /**< Task name (max 15 chars) */
    ekk_task_func_t     func;           /**< Entry function */
    void                *arg;           /**< Argument to function */
    uint8_t             priority;       /**< Priority (0=lowest, 255=highest) */
    uint32_t            stack_size;     /**< Stack size in bytes */
    void                *stack_base;    /**< Pre-allocated stack (NULL=auto) */
    uint32_t            core_affinity;  /**< Core to run on (0 on single-core) */
    uint32_t            period_us;      /**< Period for periodic tasks (0=aperiodic) */
    uint32_t            deadline_us;    /**< Relative deadline (0=same as period) */
    ekk_task_flags_t    flags;          /**< Task flags */
} ekk_task_params_t;

/**
 * @brief Default task parameters initializer
 */
#define EKK_TASK_PARAMS_DEFAULT { \
    .name = "task",               \
    .func = NULL,                 \
    .arg = NULL,                  \
    .priority = 128,              \
    .stack_size = 1024,           \
    .stack_base = NULL,           \
    .core_affinity = 0,           \
    .period_us = 0,               \
    .deadline_us = 0,             \
    .flags = EKK_TASK_FLAG_NONE   \
}

/**
 * @brief Task statistics
 */
typedef struct {
    uint32_t    run_count;          /**< Times task has run */
    uint32_t    total_time_us;      /**< Total CPU time */
    uint32_t    max_exec_time_us;   /**< Worst-case execution */
    uint32_t    deadlines_missed;   /**< Deadline violations */
    uint32_t    preemptions;        /**< Times preempted */
} ekk_task_stats_t;

/* ==========================================================================
 * Synchronization Types
 * ========================================================================== */

/**
 * @brief Mutex handle (opaque)
 */
typedef void* ekk_mutex_t;

/**
 * @brief Semaphore handle (opaque)
 */
typedef void* ekk_sem_t;

/**
 * @brief Event flags handle (opaque)
 */
typedef void* ekk_event_t;

/* ==========================================================================
 * IPC Types
 * ========================================================================== */

/**
 * @brief Message queue handle (opaque)
 */
typedef void* ekk_queue_t;

/**
 * @brief Mailbox handle (opaque)
 */
typedef void* ekk_mailbox_t;

/* ==========================================================================
 * Kernel State
 * ========================================================================== */

/**
 * @brief Kernel state
 */
typedef enum {
    EKK_STATE_INIT      = 0,        /**< Initializing */
    EKK_STATE_RUNNING   = 1,        /**< Running */
    EKK_STATE_SUSPENDED = 2,        /**< Suspended */
    EKK_STATE_PANIC     = 3,        /**< Fatal error */
} ekk_state_t;

/**
 * @brief System statistics
 */
typedef struct {
    uint32_t uptime_ms;             /**< System uptime */
    uint32_t context_switches;      /**< Total context switches */
    uint32_t deadline_misses;       /**< Deadline violations */
    uint32_t ipc_messages;          /**< IPC messages sent */
    uint8_t  cpu_usage_percent;     /**< CPU usage (0-100) */
} ekk_stats_t;

/* ==========================================================================
 * Utility Macros
 * ========================================================================== */

/** Array element count */
#define EKK_ARRAY_SIZE(arr)     (sizeof(arr) / sizeof((arr)[0]))

/** Minimum of two values */
#define EKK_MIN(a, b)           (((a) < (b)) ? (a) : (b))

/** Maximum of two values */
#define EKK_MAX(a, b)           (((a) > (b)) ? (a) : (b))

/** Calculate stack words from bytes */
#define EKK_STACK_WORDS(bytes)  ((bytes) / sizeof(uint32_t))

#ifdef __cplusplus
}
#endif

#endif /* EKK_TYPES_H */
