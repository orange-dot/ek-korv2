/**
 * @file task.h
 * @brief JEZGRO Task Management
 *
 * Task Control Block (TCB) structure and task management API.
 * Tasks are bound to specific cores (no migration for safety).
 */

#ifndef TASK_H
#define TASK_H

#include "jezgro.h"

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Task Control Block
 * ========================================================================== */

/**
 * @brief Task Control Block (TCB)
 *
 * Full structure for task state management.
 * Placed in per-core memory for cache efficiency.
 */
typedef struct task_control_block {
    /* Task identification */
    char            name[JEZGRO_TASK_NAME_LEN];  /**< Task name */
    uint32_t        id;                          /**< Unique task ID */
    uint32_t        core_id;                     /**< Core affinity */

    /* Task state */
    task_state_t    state;                       /**< Current state */
    task_flags_t    flags;                       /**< Task flags */

    /* Priority */
    uint8_t         base_priority;               /**< Original priority */
    uint8_t         effective_priority;          /**< Current (inherited) priority */

    /* Scheduling */
    uint32_t        deadline;                    /**< Absolute deadline (us) */
    uint32_t        period_us;                   /**< Period for periodic tasks */
    uint32_t        relative_deadline_us;        /**< Relative deadline */

    /* Context (TriCore CSA) */
    uint32_t        context_pcxi;                /**< Saved PCXI (context chain) */

    /* Stack */
    void            *stack_base;                 /**< Stack bottom */
    uint32_t        stack_size;                  /**< Stack size in bytes */
    void            *stack_top;                  /**< Stack top (initial SP) */

    /* Entry point */
    task_func_t     entry_func;                  /**< Task function */
    void            *entry_arg;                  /**< Argument to function */

    /* Timing */
    uint32_t        wake_time;                   /**< Wake tick (for delays) */
    jezgro_error_t  timeout_result;              /**< Result after timeout */

    /* Statistics */
    uint32_t        run_count;                   /**< Times executed */
    uint32_t        total_run_time;              /**< Total execution time (us) */
    uint32_t        last_run_time;               /**< Last execution time (us) */
    uint32_t        max_run_time;                /**< Worst-case time (us) */
    uint32_t        deadlines_missed;            /**< Deadline violations */

    /* Queue linkage */
    struct task_control_block *next_ready;       /**< Next in ready queue */
    struct task_control_block *next_delay;       /**< Next in delay queue */
    struct task_control_block *next_blocked;     /**< Next in blocked list */

    /* Blocking state */
    void            *blocked_on;                 /**< Object waiting on */
    uint32_t        blocked_reason;              /**< Why blocked */

    /* User data */
    void            *user_data;                  /**< Application-specific data */

} tcb_t;

/* ==========================================================================
 * Task Management API
 * ========================================================================== */

/**
 * @brief Create a new task
 *
 * Allocates TCB, stack, and CSA context for the task.
 * Task is created in READY state and added to scheduler.
 *
 * @param params Task parameters
 * @param handle Output: task handle
 * @return JEZGRO_OK on success
 */
jezgro_error_t task_create(const task_params_t *params, task_handle_t *handle);

/**
 * @brief Delete a task
 *
 * Removes task from scheduler and frees resources.
 * Cannot delete currently running task.
 *
 * @param handle Task to delete (NULL = current task)
 * @return JEZGRO_OK on success
 */
jezgro_error_t task_delete(task_handle_t handle);

/**
 * @brief Suspend a task
 *
 * Moves task to SUSPENDED state. Task won't run until resumed.
 *
 * @param handle Task to suspend (NULL = current task)
 * @return JEZGRO_OK on success
 */
jezgro_error_t task_suspend(task_handle_t handle);

/**
 * @brief Resume a suspended task
 *
 * Moves task back to READY state.
 *
 * @param handle Task to resume
 * @return JEZGRO_OK on success
 */
jezgro_error_t task_resume(task_handle_t handle);

/**
 * @brief Get current task handle
 * @return Handle to currently running task
 */
task_handle_t task_get_current(void);

/**
 * @brief Get task by ID
 *
 * @param task_id Task ID
 * @return Task handle or NULL
 */
task_handle_t task_get_by_id(uint32_t task_id);

/**
 * @brief Get task by name
 *
 * @param name Task name
 * @return Task handle or NULL
 */
task_handle_t task_get_by_name(const char *name);

/* ==========================================================================
 * Task Properties
 * ========================================================================== */

/**
 * @brief Get task name
 * @param handle Task handle
 * @return Task name string
 */
const char* task_get_name(task_handle_t handle);

/**
 * @brief Get task state
 * @param handle Task handle
 * @return Current state
 */
task_state_t task_get_state(task_handle_t handle);

/**
 * @brief Get task priority
 * @param handle Task handle
 * @return Effective priority
 */
uint8_t task_get_priority(task_handle_t handle);

/**
 * @brief Set task priority
 *
 * @param handle Task handle
 * @param priority New priority
 * @return JEZGRO_OK on success
 */
jezgro_error_t task_set_priority(task_handle_t handle, uint8_t priority);

/**
 * @brief Get task core affinity
 * @param handle Task handle
 * @return Core ID (0-5)
 */
uint32_t task_get_core(task_handle_t handle);

/**
 * @brief Get task statistics
 *
 * @param handle Task handle
 * @param stats Output: statistics structure
 * @return JEZGRO_OK on success
 */
jezgro_error_t task_get_stats(task_handle_t handle, task_stats_t *stats);

/* ==========================================================================
 * Task Timing
 * ========================================================================== */

/**
 * @brief Yield CPU to next ready task
 *
 * Current task remains ready but goes to back of queue.
 */
void task_yield(void);

/**
 * @brief Delay task for specified ticks
 *
 * @param ticks Number of ticks to delay
 */
void task_delay(jezgro_ticks_t ticks);

/**
 * @brief Delay task for specified milliseconds
 *
 * @param ms Milliseconds to delay
 */
void task_delay_ms(jezgro_time_ms_t ms);

/**
 * @brief Delay until absolute tick
 *
 * For periodic execution with minimal drift.
 *
 * @param prev_wake Previous wake time (updated on return)
 * @param period Period in ticks
 */
void task_delay_until(jezgro_ticks_t *prev_wake, jezgro_ticks_t period);

/* ==========================================================================
 * Periodic Tasks
 * ========================================================================== */

/**
 * @brief Wait for next period (periodic tasks)
 *
 * For periodic tasks: waits until next period.
 * Tracks deadline for the new period.
 */
void task_wait_for_period(void);

/**
 * @brief Check if deadline was met
 *
 * @return true if last period completed before deadline
 */
bool task_deadline_met(void);

/**
 * @brief Get remaining time to deadline
 *
 * @return Microseconds until deadline (0 if passed)
 */
uint32_t task_get_slack(void);

/* ==========================================================================
 * Task Notifications (lightweight IPC)
 * ========================================================================== */

/**
 * @brief Wait for task notification
 *
 * Blocks until notified or timeout.
 *
 * @param clear_on_exit Clear notification on wake
 * @param timeout Timeout in ticks
 * @return Notification value (0 on timeout)
 */
uint32_t task_notify_wait(bool clear_on_exit, jezgro_ticks_t timeout);

/**
 * @brief Send notification to task
 *
 * @param handle Target task
 * @param value Notification value
 * @return JEZGRO_OK on success
 */
jezgro_error_t task_notify(task_handle_t handle, uint32_t value);

/**
 * @brief Give notification (increment)
 *
 * Binary semaphore-like notification.
 *
 * @param handle Target task
 * @return JEZGRO_OK on success
 */
jezgro_error_t task_notify_give(task_handle_t handle);

/**
 * @brief Take notification (decrement, blocking)
 *
 * @param timeout Timeout in ticks
 * @return JEZGRO_OK on success, JEZGRO_ERROR_TIMEOUT on timeout
 */
jezgro_error_t task_notify_take(jezgro_ticks_t timeout);

/* ==========================================================================
 * Stack Management
 * ========================================================================== */

/**
 * @brief Get task stack high water mark
 *
 * Returns minimum free stack space since task started.
 * Useful for tuning stack sizes.
 *
 * @param handle Task handle
 * @return Minimum free bytes
 */
uint32_t task_get_stack_high_water(task_handle_t handle);

/**
 * @brief Check task stack for overflow
 *
 * @param handle Task handle
 * @return true if stack OK, false if overflow
 */
bool task_check_stack(task_handle_t handle);

/* ==========================================================================
 * Idle Task
 * ========================================================================== */

/**
 * @brief Create idle task for current core
 *
 * Called during kernel init. Creates lowest-priority task
 * that runs when no other tasks are ready.
 *
 * @return JEZGRO_OK on success
 */
jezgro_error_t task_create_idle(void);

/**
 * @brief Idle task hook
 *
 * Called each time idle task runs.
 * Can be overridden for power management.
 */
void task_idle_hook(void);

/* ==========================================================================
 * Internal Functions
 * ========================================================================== */

/**
 * @brief Initialize task subsystem
 * @return JEZGRO_OK on success
 */
jezgro_error_t task_init(void);

/**
 * @brief Get TCB pointer (internal use)
 */
tcb_t* task_get_tcb(task_handle_t handle);

#ifdef __cplusplus
}
#endif

#endif /* TASK_H */
