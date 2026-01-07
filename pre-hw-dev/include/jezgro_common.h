/**
 * @file jezgro_common.h
 * @brief JEZGRO Common Types and Definitions
 *
 * This header provides platform-independent types and definitions
 * that work across all JEZGRO implementations:
 *   - STM32G474 (single-core, ARM Cortex-M4)
 *   - TC397XP (6-core, TriCore)
 *
 * Include this header in application code for maximum portability.
 */

#ifndef JEZGRO_COMMON_H
#define JEZGRO_COMMON_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Platform Detection
 * ========================================================================== */

#if defined(JEZGRO_SIM)
    #define JEZGRO_PLATFORM_SIM         1
    #define JEZGRO_PLATFORM_NAME        "Simulation"
    #define JEZGRO_SINGLE_CORE          1
#elif defined(STM32G474xx) || defined(STM32G4)
    #define JEZGRO_PLATFORM_STM32       1
    #define JEZGRO_PLATFORM_NAME        "STM32G474"
    #define JEZGRO_SINGLE_CORE          1
#elif defined(TC397) || defined(TC397XP) || defined(__TRICORE__)
    #define JEZGRO_PLATFORM_TRICORE     1
    #define JEZGRO_PLATFORM_NAME        "TC397XP"
    #define JEZGRO_MULTI_CORE           1
    #define JEZGRO_NUM_CORES            6
#else
    #warning "Unknown platform - defaulting to simulation"
    #define JEZGRO_PLATFORM_SIM         1
    #define JEZGRO_PLATFORM_NAME        "Unknown"
    #define JEZGRO_SINGLE_CORE          1
#endif

/* ==========================================================================
 * Version (Common across platforms)
 * ========================================================================== */

#define JEZGRO_COMMON_VERSION_MAJOR     1
#define JEZGRO_COMMON_VERSION_MINOR     0
#define JEZGRO_COMMON_VERSION_PATCH     0

/* ==========================================================================
 * Error Codes (Unified)
 * ========================================================================== */

/**
 * @brief JEZGRO error codes
 *
 * Unified error codes used across all platforms.
 */
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
    JEZGRO_ERROR_FAULT      = -13,      /**< Hardware/software fault */
} jezgro_err_t;

/* Legacy compatibility macros */
#define JEZGRO_ERR_NOMEM        JEZGRO_ERROR_NOMEM
#define JEZGRO_ERR_INVALID      JEZGRO_ERROR_PARAM
#define JEZGRO_ERR_TIMEOUT      JEZGRO_ERROR_TIMEOUT
#define JEZGRO_ERR_BUSY         JEZGRO_ERROR_BUSY
#define JEZGRO_ERR_FULL         JEZGRO_ERROR_FULL
#define JEZGRO_ERR_EMPTY        JEZGRO_ERROR_EMPTY
#define JEZGRO_ERR_FAULT        JEZGRO_ERROR_FAULT

/* ==========================================================================
 * Time Types (Unified)
 * ========================================================================== */

/** Time in ticks */
typedef uint32_t jezgro_tick_t;

/** Time in microseconds */
typedef uint32_t jezgro_time_us_t;

/** Time in milliseconds */
typedef uint32_t jezgro_time_ms_t;

/** Maximum timeout (wait forever) */
#define JEZGRO_WAIT_FOREVER     ((jezgro_tick_t)0xFFFFFFFF)

/** No wait (poll) */
#define JEZGRO_NO_WAIT          ((jezgro_tick_t)0)

/* Legacy compatibility */
typedef jezgro_tick_t tick_t;

/* ==========================================================================
 * Task Types (Unified)
 * ========================================================================== */

/**
 * @brief Task state
 */
typedef enum {
    JEZGRO_TASK_INACTIVE    = 0,        /**< Not created */
    JEZGRO_TASK_READY       = 1,        /**< Ready to run */
    JEZGRO_TASK_RUNNING     = 2,        /**< Currently executing */
    JEZGRO_TASK_BLOCKED     = 3,        /**< Waiting for event */
    JEZGRO_TASK_SUSPENDED   = 4,        /**< Manually suspended */
    JEZGRO_TASK_TERMINATED  = 5,        /**< Finished */
} jezgro_task_state_t;

/**
 * @brief Task flags
 */
typedef enum {
    JEZGRO_TASK_FLAG_NONE       = 0x00,
    JEZGRO_TASK_FLAG_PERIODIC   = 0x01, /**< Periodic task */
    JEZGRO_TASK_FLAG_REALTIME   = 0x02, /**< Hard real-time */
    JEZGRO_TASK_FLAG_SAFETY     = 0x04, /**< Safety-critical */
    JEZGRO_TASK_FLAG_PRIVILEGED = 0x08, /**< Privileged mode */
} jezgro_task_flags_t;

/**
 * @brief Task function type
 */
typedef void (*jezgro_task_func_t)(void *arg);

/**
 * @brief Task handle (opaque)
 *
 * On STM32: pointer to task_t
 * On TriCore: pointer to task_control_block
 */
typedef void* jezgro_task_handle_t;

/**
 * @brief Task configuration (portable)
 *
 * Use this struct to create tasks on any platform.
 */
typedef struct {
    const char          *name;          /**< Task name (max 15 chars) */
    jezgro_task_func_t  func;           /**< Entry function */
    void                *arg;           /**< Argument to function */
    uint8_t             priority;       /**< Priority (0=lowest, 255=highest) */
    uint32_t            stack_size;     /**< Stack size in bytes */
    void                *stack_base;    /**< Pre-allocated stack (NULL=auto) */
    uint32_t            period_us;      /**< Period for periodic tasks (0=aperiodic) */
    uint32_t            deadline_us;    /**< Relative deadline (0=same as period) */
    jezgro_task_flags_t flags;          /**< Task flags */
#if defined(JEZGRO_MULTI_CORE)
    uint32_t            core_affinity;  /**< Core to run on (ignored on single-core) */
#endif
} jezgro_task_config_t;

/**
 * @brief Default task configuration initializer
 */
#if defined(JEZGRO_MULTI_CORE)
#define JEZGRO_TASK_CONFIG_DEFAULT { \
    .name = "task",                   \
    .func = NULL,                     \
    .arg = NULL,                      \
    .priority = 128,                  \
    .stack_size = 1024,               \
    .stack_base = NULL,               \
    .period_us = 0,                   \
    .deadline_us = 0,                 \
    .flags = JEZGRO_TASK_FLAG_NONE,   \
    .core_affinity = 0                \
}
#else
#define JEZGRO_TASK_CONFIG_DEFAULT { \
    .name = "task",                   \
    .func = NULL,                     \
    .arg = NULL,                      \
    .priority = 128,                  \
    .stack_size = 1024,               \
    .stack_base = NULL,               \
    .period_us = 0,                   \
    .deadline_us = 0,                 \
    .flags = JEZGRO_TASK_FLAG_NONE    \
}
#endif

/* ==========================================================================
 * Synchronization Types (Unified)
 * ========================================================================== */

/**
 * @brief Mutex handle (opaque)
 */
typedef void* jezgro_mutex_t;

/**
 * @brief Semaphore handle (opaque)
 */
typedef void* jezgro_sem_t;

/**
 * @brief Event flags handle (opaque)
 */
typedef void* jezgro_event_t;

/* ==========================================================================
 * IPC Types (Unified)
 * ========================================================================== */

/**
 * @brief Message queue handle (opaque)
 */
typedef void* jezgro_queue_t;

/**
 * @brief Maximum portable message size
 */
#define JEZGRO_MSG_MAX_SIZE     64

/* ==========================================================================
 * Configuration Limits
 * ========================================================================== */

/** Maximum tasks (platform may support more) */
#define JEZGRO_MAX_TASKS_PORTABLE   32

/** Maximum task name length */
#define JEZGRO_TASK_NAME_MAX        16

/** Default tick rate (Hz) */
#define JEZGRO_TICK_RATE_HZ         1000

/* ==========================================================================
 * Utility Macros
 * ========================================================================== */

/** Convert milliseconds to ticks */
#define JEZGRO_MS_TO_TICKS(ms)      ((jezgro_tick_t)((ms) * JEZGRO_TICK_RATE_HZ / 1000))

/** Convert ticks to milliseconds */
#define JEZGRO_TICKS_TO_MS(ticks)   ((jezgro_time_ms_t)((ticks) * 1000 / JEZGRO_TICK_RATE_HZ))

/** Convert microseconds to ticks (rounded up) */
#define JEZGRO_US_TO_TICKS(us)      ((jezgro_tick_t)(((us) * JEZGRO_TICK_RATE_HZ + 999999) / 1000000))

/** Array element count */
#define JEZGRO_ARRAY_SIZE(arr)      (sizeof(arr) / sizeof((arr)[0]))

/** Minimum of two values */
#define JEZGRO_MIN(a, b)            (((a) < (b)) ? (a) : (b))

/** Maximum of two values */
#define JEZGRO_MAX(a, b)            (((a) > (b)) ? (a) : (b))

/* ==========================================================================
 * Debug Support
 * ========================================================================== */

#ifdef JEZGRO_DEBUG
    #define JEZGRO_ASSERT(cond) do { \
        if (!(cond)) { \
            jezgro_panic("ASSERT: " #cond " @ " __FILE__); \
        } \
    } while(0)
#else
    #define JEZGRO_ASSERT(cond) ((void)0)
#endif

/* ==========================================================================
 * Kernel State
 * ========================================================================== */

/**
 * @brief Kernel state
 */
typedef enum {
    JEZGRO_STATE_INIT       = 0,        /**< Initializing */
    JEZGRO_STATE_RUNNING    = 1,        /**< Running */
    JEZGRO_STATE_SUSPENDED  = 2,        /**< Suspended */
    JEZGRO_STATE_PANIC      = 3,        /**< Fatal error */
} jezgro_state_t;

/* ==========================================================================
 * Statistics (Unified)
 * ========================================================================== */

/**
 * @brief System statistics
 */
typedef struct {
    uint32_t uptime_ms;             /**< System uptime */
    uint32_t context_switches;      /**< Total context switches */
    uint32_t deadline_misses;       /**< Deadline violations */
    uint32_t ipc_messages;          /**< IPC messages sent */
    uint8_t  cpu_usage_percent;     /**< CPU usage (0-100) */
#if defined(JEZGRO_MULTI_CORE)
    uint8_t  per_core_usage[JEZGRO_NUM_CORES]; /**< Per-core CPU usage */
#endif
} jezgro_stats_t;

#ifdef __cplusplus
}
#endif

#endif /* JEZGRO_COMMON_H */
