/**
 * @file task.h
 * @brief ek-kor Task Management
 *
 * Task Control Block (TCB) and task management API.
 * Tasks are bound to specific cores (no migration for safety).
 */

#ifndef EKK_TASK_H
#define EKK_TASK_H

#include <ek-kor/types.h>
#include <ek-kor/mpu.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Task Control Block
 * ========================================================================== */

/**
 * @brief Task Control Block (TCB)
 */
typedef struct ekk_tcb {
    /* Task identification */
    char            name[16];               /**< Task name */
    uint32_t        id;                     /**< Unique task ID */
    uint32_t        core_id;                /**< Core affinity */

    /* Task state */
    ekk_task_state_t state;                 /**< Current state */
    ekk_task_flags_t flags;                 /**< Task flags */

    /* Priority */
    uint8_t         base_priority;          /**< Original priority */
    uint8_t         effective_priority;     /**< Current (inherited) priority */

    /* Scheduling */
    uint32_t        deadline;               /**< Absolute deadline (us) */
    uint32_t        period_us;              /**< Period for periodic tasks */
    uint32_t        relative_deadline_us;   /**< Relative deadline */

    /* Context (platform-specific) */
    uint32_t        context_data;           /**< Saved context (CSA/SP) */

    /* Stack */
    void            *stack_base;            /**< Stack bottom */
    uint32_t        stack_size;             /**< Stack size in bytes */
    void            *stack_top;             /**< Stack top (initial SP) */

    /* Entry point */
    ekk_task_func_t entry_func;             /**< Task function */
    void            *entry_arg;             /**< Argument to function */

    /* Timing */
    uint32_t        wake_time;              /**< Wake tick (for delays) */
    ekk_err_t       timeout_result;         /**< Result after timeout */

    /* Statistics */
    uint32_t        run_count;              /**< Times executed */
    uint32_t        total_run_time;         /**< Total execution time (us) */
    uint32_t        last_run_time;          /**< Last execution time (us) */
    uint32_t        max_run_time;           /**< Worst-case time (us) */
    uint32_t        deadlines_missed;       /**< Deadline violations */

    /* Queue linkage */
    struct ekk_tcb  *next_ready;            /**< Next in ready queue */
    struct ekk_tcb  *next_delay;            /**< Next in delay queue */
    struct ekk_tcb  *next_blocked;          /**< Next in blocked list */

    /* Blocking state */
    void            *blocked_on;            /**< Object waiting on */
    uint32_t        blocked_reason;         /**< Why blocked */

    /* User data */
    void            *user_data;             /**< Application-specific data */

#if EKK_USE_MPU
    /* Memory Protection */
    ekk_mpu_region_t mpu_regions[EKK_MPU_REGIONS_PER_TASK]; /**< MPU regions */
    uint8_t          mpu_region_count;      /**< Number of active regions */
    ekk_privilege_t  privilege;             /**< Privilege level */
#endif

} ekk_tcb_t;

/* ==========================================================================
 * Task Management API
 * ========================================================================== */

/**
 * @brief Create a new task
 * @param params Task parameters
 * @param handle Output: task handle
 * @return EKK_OK on success
 */
ekk_err_t ekk_task_create(const ekk_task_params_t *params, ekk_task_t *handle);

/**
 * @brief Delete a task
 * @param handle Task to delete (NULL = current task)
 * @return EKK_OK on success
 */
ekk_err_t ekk_task_delete(ekk_task_t handle);

/**
 * @brief Suspend a task
 * @param handle Task to suspend (NULL = current task)
 * @return EKK_OK on success
 */
ekk_err_t ekk_task_suspend(ekk_task_t handle);

/**
 * @brief Resume a suspended task
 * @param handle Task to resume
 * @return EKK_OK on success
 */
ekk_err_t ekk_task_resume(ekk_task_t handle);

/**
 * @brief Get current task handle
 * @return Handle to currently running task
 */
ekk_task_t ekk_task_get_current(void);

/**
 * @brief Get task by ID
 * @param task_id Task ID
 * @return Task handle or NULL
 */
ekk_task_t ekk_task_get_by_id(uint32_t task_id);

/**
 * @brief Get task by name
 * @param name Task name
 * @return Task handle or NULL
 */
ekk_task_t ekk_task_get_by_name(const char *name);

/* ==========================================================================
 * Task Properties
 * ========================================================================== */

/**
 * @brief Get task name
 * @param handle Task handle
 * @return Task name string
 */
const char* ekk_task_get_name(ekk_task_t handle);

/**
 * @brief Get task state
 * @param handle Task handle
 * @return Current state
 */
ekk_task_state_t ekk_task_get_state(ekk_task_t handle);

/**
 * @brief Get task priority
 * @param handle Task handle
 * @return Effective priority
 */
uint8_t ekk_task_get_priority(ekk_task_t handle);

/**
 * @brief Set task priority
 * @param handle Task handle
 * @param priority New priority
 * @return EKK_OK on success
 */
ekk_err_t ekk_task_set_priority(ekk_task_t handle, uint8_t priority);

/**
 * @brief Get task core affinity
 * @param handle Task handle
 * @return Core ID
 */
uint32_t ekk_task_get_core(ekk_task_t handle);

/**
 * @brief Get task statistics
 * @param handle Task handle
 * @param stats Output: statistics structure
 * @return EKK_OK on success
 */
ekk_err_t ekk_task_get_stats(ekk_task_t handle, ekk_task_stats_t *stats);

/* ==========================================================================
 * Task Timing
 * ========================================================================== */

/**
 * @brief Yield CPU to next ready task
 */
void ekk_task_yield(void);

/**
 * @brief Delay task for specified ticks
 * @param ticks Number of ticks to delay
 */
void ekk_task_delay(ekk_tick_t ticks);

/**
 * @brief Delay task for specified milliseconds
 * @param ms Milliseconds to delay
 */
void ekk_task_delay_ms(ekk_time_ms_t ms);

/**
 * @brief Delay until absolute tick
 * @param prev_wake Previous wake time (updated on return)
 * @param period Period in ticks
 */
void ekk_task_delay_until(ekk_tick_t *prev_wake, ekk_tick_t period);

/* ==========================================================================
 * Periodic Tasks
 * ========================================================================== */

/**
 * @brief Wait for next period (periodic tasks)
 */
void ekk_task_wait_for_period(void);

/**
 * @brief Check if deadline was met
 * @return true if last period completed before deadline
 */
bool ekk_task_deadline_met(void);

/**
 * @brief Get remaining time to deadline
 * @return Microseconds until deadline (0 if passed)
 */
uint32_t ekk_task_get_slack(void);

/* ==========================================================================
 * Task Notifications
 * ========================================================================== */

/**
 * @brief Wait for task notification
 * @param clear_on_exit Clear notification on wake
 * @param timeout Timeout in ticks
 * @return Notification value (0 on timeout)
 */
uint32_t ekk_task_notify_wait(bool clear_on_exit, ekk_tick_t timeout);

/**
 * @brief Send notification to task
 * @param handle Target task
 * @param value Notification value
 * @return EKK_OK on success
 */
ekk_err_t ekk_task_notify(ekk_task_t handle, uint32_t value);

/**
 * @brief Give notification (increment)
 * @param handle Target task
 * @return EKK_OK on success
 */
ekk_err_t ekk_task_notify_give(ekk_task_t handle);

/**
 * @brief Take notification (decrement, blocking)
 * @param timeout Timeout in ticks
 * @return EKK_OK on success, EKK_ERR_TIMEOUT on timeout
 */
ekk_err_t ekk_task_notify_take(ekk_tick_t timeout);

/* ==========================================================================
 * Stack Management
 * ========================================================================== */

/**
 * @brief Get task stack high water mark
 * @param handle Task handle
 * @return Minimum free bytes
 */
uint32_t ekk_task_get_stack_high_water(ekk_task_t handle);

/**
 * @brief Check task stack for overflow
 * @param handle Task handle
 * @return true if stack OK, false if overflow
 */
bool ekk_task_check_stack(ekk_task_t handle);

/* ==========================================================================
 * Idle Task
 * ========================================================================== */

/**
 * @brief Create idle task for current core
 * @return EKK_OK on success
 */
ekk_err_t ekk_task_create_idle(void);

/**
 * @brief Idle task hook (override for power management)
 */
void ekk_task_idle_hook(void);

/* ==========================================================================
 * Internal Functions
 * ========================================================================== */

/**
 * @brief Initialize task subsystem
 * @return EKK_OK on success
 */
ekk_err_t ekk_task_init(void);

/**
 * @brief Get TCB pointer (internal use)
 */
ekk_tcb_t* ekk_task_get_tcb(ekk_task_t handle);

#ifdef __cplusplus
}
#endif

#endif /* EKK_TASK_H */
