/**
 * @file scheduler.h
 * @brief JEZGRO EDF (Earliest Deadline First) Scheduler
 */

#ifndef SCHEDULER_H
#define SCHEDULER_H

#include <stdint.h>
#include <stdbool.h>

/* Forward declaration */
typedef struct task task_t;

/*===========================================================================*/
/* Scheduler API                                                             */
/*===========================================================================*/

/**
 * @brief Initialize the scheduler
 */
void scheduler_init(void);

/**
 * @brief Add task to scheduler
 * @param task Pointer to task
 * @return 0 on success, negative on error
 */
int scheduler_add_task(task_t *task);

/**
 * @brief Remove task from scheduler
 * @param task Pointer to task
 * @return 0 on success, negative on error
 */
int scheduler_remove_task(task_t *task);

/**
 * @brief Get next task to run (EDF selection)
 * @return Pointer to highest priority task, or NULL
 */
task_t *scheduler_get_next(void);

/**
 * @brief Get currently running task
 * @return Pointer to current task
 */
task_t *scheduler_get_current(void);

/**
 * @brief Process system tick
 * @param elapsed_ms Milliseconds since last tick
 */
void scheduler_tick(uint32_t elapsed_ms);

/**
 * @brief Yield current task
 */
void scheduler_yield(void);

/**
 * @brief Check for deadline misses
 * @return Number of tasks with missed deadlines
 */
int scheduler_check_deadlines(void);

/**
 * @brief Get scheduler statistics
 * @param ready_count Output: number of ready tasks
 * @param blocked_count Output: number of blocked tasks
 */
void scheduler_get_stats(int *ready_count, int *blocked_count);

/**
 * @brief Lock scheduler (disable preemption)
 */
void scheduler_lock(void);

/**
 * @brief Unlock scheduler (enable preemption)
 */
void scheduler_unlock(void);

#endif /* SCHEDULER_H */
