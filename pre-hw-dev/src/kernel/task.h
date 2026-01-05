/**
 * @file task.h
 * @brief JEZGRO Task Management
 */

#ifndef TASK_H
#define TASK_H

#include <stdint.h>
#include <stddef.h>

/* Forward declaration */
typedef struct task task_t;
typedef void (*task_func_t)(void *arg);

/*===========================================================================*/
/* Task API                                                                  */
/*===========================================================================*/

/**
 * @brief Initialize task subsystem
 */
void task_init(void);

/**
 * @brief Create a new task
 * @param name Task name (for debug)
 * @param func Task entry function
 * @param arg Argument passed to task
 * @param deadline_ms Initial deadline in milliseconds
 * @param period_ms Period for periodic tasks (0 for aperiodic)
 * @return Pointer to task, or NULL on error
 */
task_t *task_create(const char *name, task_func_t func, void *arg,
                    uint32_t deadline_ms, uint32_t period_ms);

/**
 * @brief Destroy a task
 * @param task Pointer to task
 */
void task_destroy(task_t *task);

/**
 * @brief Suspend a task
 * @param task Pointer to task
 */
void task_suspend(task_t *task);

/**
 * @brief Resume a suspended task
 * @param task Pointer to task
 */
void task_resume(task_t *task);

/**
 * @brief Set task deadline
 * @param task Pointer to task
 * @param deadline_ms New deadline in milliseconds
 */
void task_set_deadline(task_t *task, uint32_t deadline_ms);

/**
 * @brief Get task by ID
 * @param id Task ID
 * @return Pointer to task, or NULL if not found
 */
task_t *task_get_by_id(uint8_t id);

/**
 * @brief Get task by name
 * @param name Task name
 * @return Pointer to task, or NULL if not found
 */
task_t *task_get_by_name(const char *name);

/**
 * @brief Sleep current task for specified time
 * @param ms Milliseconds to sleep
 */
void task_sleep(uint32_t ms);

/**
 * @brief Mark current task as complete (for periodic tasks)
 */
void task_complete(void);

/**
 * @brief Get total number of tasks
 * @return Number of active tasks
 */
int task_count(void);

#endif /* TASK_H */
