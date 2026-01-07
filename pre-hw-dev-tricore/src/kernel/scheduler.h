/**
 * @file scheduler.h
 * @brief JEZGRO EDF Scheduler
 *
 * Implements Earliest Deadline First (EDF) scheduling:
 *   - Per-core ready queues (no task migration for safety)
 *   - Priority inheritance for mutex holders
 *   - Deadline tracking and violation detection
 *   - Preemptive scheduling on tick and task events
 */

#ifndef SCHEDULER_H
#define SCHEDULER_H

#include "jezgro.h"
#include "task.h"

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Configuration
 * ========================================================================== */

/** EDF scheduling enabled (vs static priority) */
#define SCHEDULER_USE_EDF       1

/** Track execution time per task */
#define SCHEDULER_TRACK_TIME    1

/** Check for deadline misses */
#define SCHEDULER_CHECK_DEADLINE 1

/* ==========================================================================
 * Scheduler State
 * ========================================================================== */

/**
 * @brief Per-core scheduler data
 */
typedef struct {
    /* Ready queue (sorted by deadline/priority) */
    task_handle_t   ready_head;         /**< First ready task */
    uint32_t        ready_count;        /**< Number of ready tasks */

    /* Current execution */
    task_handle_t   current;            /**< Currently running task */
    task_handle_t   idle_task;          /**< Idle task for this core */

    /* Scheduler state */
    bool            running;            /**< Scheduler active */
    uint32_t        lock_count;         /**< Scheduler lock nesting */

    /* Statistics */
    uint32_t        context_switches;   /**< Total switches */
    uint32_t        idle_time_us;       /**< Time in idle */
    uint32_t        last_switch_time;   /**< Last switch timestamp */
} scheduler_data_t;

/* ==========================================================================
 * Initialization
 * ========================================================================== */

/**
 * @brief Initialize scheduler for current core
 *
 * Called during kernel init from each core.
 *
 * @return JEZGRO_OK on success
 */
jezgro_error_t scheduler_init(void);

/**
 * @brief Start scheduler on current core
 *
 * Starts running tasks. Does not return.
 */
void scheduler_start(void) __attribute__((noreturn));

/* ==========================================================================
 * Scheduler Control
 * ========================================================================== */

/**
 * @brief Lock scheduler (prevent task switches)
 *
 * Can be nested. Use to protect critical operations
 * that must not be preempted.
 */
void scheduler_lock(void);

/**
 * @brief Unlock scheduler
 *
 * Decrements lock count. When zero, scheduling resumes.
 * May trigger immediate context switch if higher priority ready.
 */
void scheduler_unlock(void);

/**
 * @brief Check if scheduler is locked
 * @return true if locked
 */
bool scheduler_is_locked(void);

/**
 * @brief Check if scheduler is running
 * @return true if started and not in init
 */
bool scheduler_is_running(void);

/* ==========================================================================
 * Task Queue Management
 * ========================================================================== */

/**
 * @brief Add task to ready queue
 *
 * Inserts task in deadline/priority order.
 * May trigger preemption if task has earlier deadline.
 *
 * @param task Task to add
 */
void scheduler_ready(task_handle_t task);

/**
 * @brief Remove task from ready queue
 *
 * @param task Task to remove
 */
void scheduler_unready(task_handle_t task);

/**
 * @brief Block current task
 *
 * Removes current task from ready queue and reschedules.
 * Task must set itself to BLOCKED state before calling.
 *
 * @param timeout Timeout in ticks (0 = no timeout)
 * @return JEZGRO_OK or JEZGRO_ERROR_TIMEOUT
 */
jezgro_error_t scheduler_block(jezgro_ticks_t timeout);

/**
 * @brief Unblock a task
 *
 * Moves task from blocked to ready.
 * May trigger preemption if task has higher priority.
 *
 * @param task Task to unblock
 */
void scheduler_unblock(task_handle_t task);

/* ==========================================================================
 * Context Switching
 * ========================================================================== */

/**
 * @brief Request context switch
 *
 * Triggers switch at next safe point (after ISR).
 */
void scheduler_switch_request(void);

/**
 * @brief Yield current task
 *
 * Voluntarily gives up CPU. Reschedules immediately.
 * Task remains ready but at back of its priority queue.
 */
void scheduler_yield(void);

/**
 * @brief Get current task on this core
 * @return Current task handle
 */
task_handle_t scheduler_get_current(void);

/**
 * @brief Get next task to run
 *
 * Selects highest priority/earliest deadline ready task.
 *
 * @return Task to run (idle task if none ready)
 */
task_handle_t scheduler_select_next(void);

/* ==========================================================================
 * Timer Tick Handling
 * ========================================================================== */

/**
 * @brief System tick handler
 *
 * Called from system tick ISR. Updates:
 *   - Task delays and timeouts
 *   - Periodic task releases
 *   - Deadline tracking
 *   - Time slice (if enabled)
 */
void scheduler_tick(void);

/**
 * @brief Get current tick count for this core
 * @return Tick count
 */
jezgro_ticks_t scheduler_get_ticks(void);

/* ==========================================================================
 * Delay Management
 * ========================================================================== */

/**
 * @brief Delay current task
 *
 * Blocks task for specified ticks.
 *
 * @param ticks Ticks to delay
 */
void scheduler_delay(jezgro_ticks_t ticks);

/**
 * @brief Delay until absolute tick
 *
 * For periodic tasks. More accurate than relative delay.
 *
 * @param prev_wake Previous wake time (updated)
 * @param period Period in ticks
 */
void scheduler_delay_until(jezgro_ticks_t *prev_wake, jezgro_ticks_t period);

/**
 * @brief Wake task from timed wait
 *
 * @param task Task to wake
 * @param timeout_expired true if woken by timeout
 */
void scheduler_wake(task_handle_t task, bool timeout_expired);

/* ==========================================================================
 * Priority Management
 * ========================================================================== */

/**
 * @brief Raise task priority (for priority inheritance)
 *
 * Temporarily raises task priority to ceiling.
 * Used when task holds mutex.
 *
 * @param task Task to boost
 * @param ceiling New priority ceiling
 */
void scheduler_priority_inherit(task_handle_t task, uint8_t ceiling);

/**
 * @brief Restore task base priority
 *
 * Called when task releases mutex.
 *
 * @param task Task to restore
 */
void scheduler_priority_restore(task_handle_t task);

/* ==========================================================================
 * Deadline Management (EDF)
 * ========================================================================== */

/**
 * @brief Set task absolute deadline
 *
 * @param task Task
 * @param deadline_us Absolute deadline in microseconds
 */
void scheduler_set_deadline(task_handle_t task, jezgro_time_us_t deadline_us);

/**
 * @brief Check for deadline violations
 *
 * Called from tick handler. Invokes hook on miss.
 */
void scheduler_check_deadlines(void);

/* ==========================================================================
 * Statistics
 * ========================================================================== */

/**
 * @brief Get scheduler statistics
 *
 * @param core_id Core to query (or current if >= JEZGRO_MAX_CORES)
 * @param switches Output: context switch count
 * @param idle_pct Output: idle percentage (0-100)
 */
void scheduler_get_stats(uint32_t core_id, uint32_t *switches, uint32_t *idle_pct);

/**
 * @brief Reset scheduler statistics
 */
void scheduler_reset_stats(void);

/**
 * @brief Get CPU utilization
 *
 * @return Utilization percentage (0-100)
 */
uint32_t scheduler_get_utilization(void);

/* ==========================================================================
 * Debug
 * ========================================================================== */

/**
 * @brief Dump ready queue (debug)
 */
void scheduler_dump_ready(void);

/**
 * @brief Validate ready queue integrity
 * @return true if valid
 */
bool scheduler_validate(void);

#ifdef __cplusplus
}
#endif

#endif /* SCHEDULER_H */
