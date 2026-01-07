/**
 * @file scheduler.h
 * @brief ek-kor EDF Scheduler
 *
 * Earliest Deadline First (EDF) scheduling:
 *   - Per-core ready queues (no task migration for safety)
 *   - Priority inheritance for mutex holders
 *   - Deadline tracking and violation detection
 *   - Preemptive scheduling on tick and task events
 */

#ifndef EKK_SCHEDULER_H
#define EKK_SCHEDULER_H

#include <ek-kor/types.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Scheduler Data
 * ========================================================================== */

/**
 * @brief Per-core scheduler data
 */
typedef struct {
    ekk_task_t      ready_head;         /**< First ready task */
    uint32_t        ready_count;        /**< Number of ready tasks */
    ekk_task_t      current;            /**< Currently running task */
    ekk_task_t      idle_task;          /**< Idle task for this core */
    bool            running;            /**< Scheduler active */
    uint32_t        lock_count;         /**< Scheduler lock nesting */
    uint32_t        context_switches;   /**< Total switches */
    uint32_t        idle_time_us;       /**< Time in idle */
    uint32_t        last_switch_time;   /**< Last switch timestamp */
} ekk_sched_data_t;

/* ==========================================================================
 * Initialization
 * ========================================================================== */

/**
 * @brief Initialize scheduler for current core
 * @return EKK_OK on success
 */
ekk_err_t ekk_sched_init(void);

/**
 * @brief Start scheduler on current core
 *
 * Starts running tasks. Does not return.
 */
EKK_NORETURN void ekk_sched_start(void);

/* ==========================================================================
 * Scheduler Control
 * ========================================================================== */

/**
 * @brief Lock scheduler (prevent task switches)
 */
void ekk_sched_lock(void);

/**
 * @brief Unlock scheduler
 */
void ekk_sched_unlock(void);

/**
 * @brief Check if scheduler is locked
 * @return true if locked
 */
bool ekk_sched_is_locked(void);

/**
 * @brief Check if scheduler is running
 * @return true if started
 */
bool ekk_sched_is_running(void);

/* ==========================================================================
 * Task Queue Management
 * ========================================================================== */

/**
 * @brief Add task to ready queue
 * @param task Task to add
 */
void ekk_sched_ready(ekk_task_t task);

/**
 * @brief Remove task from ready queue
 * @param task Task to remove
 */
void ekk_sched_unready(ekk_task_t task);

/**
 * @brief Block current task
 * @param timeout Timeout in ticks (0 = no timeout)
 * @return EKK_OK or EKK_ERR_TIMEOUT
 */
ekk_err_t ekk_sched_block(ekk_tick_t timeout);

/**
 * @brief Unblock a task
 * @param task Task to unblock
 */
void ekk_sched_unblock(ekk_task_t task);

/* ==========================================================================
 * Context Switching
 * ========================================================================== */

/**
 * @brief Request context switch
 */
void ekk_sched_switch_request(void);

/**
 * @brief Yield current task
 */
void ekk_sched_yield(void);

/**
 * @brief Get current task on this core
 * @return Current task handle
 */
ekk_task_t ekk_sched_get_current(void);

/**
 * @brief Get next task to run
 * @return Task to run (idle task if none ready)
 */
ekk_task_t ekk_sched_select_next(void);

/* ==========================================================================
 * Timer Tick Handling
 * ========================================================================== */

/**
 * @brief System tick handler
 *
 * Called from system tick ISR.
 */
void ekk_sched_tick(void);

/**
 * @brief Get current tick count for this core
 * @return Tick count
 */
ekk_tick_t ekk_sched_get_ticks(void);

/* ==========================================================================
 * Delay Management
 * ========================================================================== */

/**
 * @brief Delay current task
 * @param ticks Ticks to delay
 */
void ekk_sched_delay(ekk_tick_t ticks);

/**
 * @brief Delay until absolute tick
 * @param prev_wake Previous wake time (updated)
 * @param period Period in ticks
 */
void ekk_sched_delay_until(ekk_tick_t *prev_wake, ekk_tick_t period);

/**
 * @brief Wake task from timed wait
 * @param task Task to wake
 * @param timeout_expired true if woken by timeout
 */
void ekk_sched_wake(ekk_task_t task, bool timeout_expired);

/* ==========================================================================
 * Priority Management
 * ========================================================================== */

/**
 * @brief Raise task priority (for priority inheritance)
 * @param task Task to boost
 * @param ceiling New priority ceiling
 */
void ekk_sched_priority_inherit(ekk_task_t task, uint8_t ceiling);

/**
 * @brief Restore task base priority
 * @param task Task to restore
 */
void ekk_sched_priority_restore(ekk_task_t task);

/* ==========================================================================
 * Deadline Management (EDF)
 * ========================================================================== */

/**
 * @brief Set task absolute deadline
 * @param task Task
 * @param deadline_us Absolute deadline in microseconds
 */
void ekk_sched_set_deadline(ekk_task_t task, ekk_time_us_t deadline_us);

/**
 * @brief Check for deadline violations
 */
void ekk_sched_check_deadlines(void);

/* ==========================================================================
 * Statistics
 * ========================================================================== */

/**
 * @brief Get scheduler statistics
 * @param core_id Core to query
 * @param switches Output: context switch count
 * @param idle_pct Output: idle percentage (0-100)
 */
void ekk_sched_get_stats(uint32_t core_id, uint32_t *switches, uint32_t *idle_pct);

/**
 * @brief Reset scheduler statistics
 */
void ekk_sched_reset_stats(void);

/**
 * @brief Get CPU utilization
 * @return Utilization percentage (0-100)
 */
uint32_t ekk_sched_get_utilization(void);

/* ==========================================================================
 * Debug
 * ========================================================================== */

/**
 * @brief Dump ready queue (debug)
 */
void ekk_sched_dump_ready(void);

/**
 * @brief Validate ready queue integrity
 * @return true if valid
 */
bool ekk_sched_validate(void);

#ifdef __cplusplus
}
#endif

#endif /* EKK_SCHEDULER_H */
