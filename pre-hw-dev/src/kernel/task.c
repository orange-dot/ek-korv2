/**
 * @file task.c
 * @brief JEZGRO Task Management Implementation
 */

#include "jezgro.h"
#include <string.h>

#ifdef JEZGRO_SIM
#include <stdio.h>
#include <stdlib.h>
#define TASK_DEBUG(fmt, ...) \
    do { if (JEZGRO_DEBUG) printf("[TASK] " fmt "\n", ##__VA_ARGS__); } while(0)
#else
#define TASK_DEBUG(fmt, ...)
#endif

/*===========================================================================*/
/* Private Data                                                              */
/*===========================================================================*/

/** Task pool */
static task_t task_pool[JEZGRO_MAX_TASKS];

/** Task allocation bitmap */
static uint32_t task_alloc_bitmap = 0;

/** Next task ID */
static uint8_t next_task_id = 1;

/*===========================================================================*/
/* Public Functions                                                          */
/*===========================================================================*/

void task_init(void)
{
    TASK_DEBUG("Initializing task subsystem");

    memset(task_pool, 0, sizeof(task_pool));
    task_alloc_bitmap = 0;
    next_task_id = 1;

    TASK_DEBUG("Task subsystem initialized (max=%d)", JEZGRO_MAX_TASKS);
}

task_t *task_create(const char *name, task_func_t func, void *arg,
                    uint32_t deadline_ms, uint32_t period_ms)
{
    /* Find free slot */
    int slot = -1;
    for (int i = 0; i < JEZGRO_MAX_TASKS; i++) {
        if (!(task_alloc_bitmap & (1U << i))) {
            slot = i;
            break;
        }
    }

    if (slot < 0) {
        TASK_DEBUG("No free task slots");
        return NULL;
    }

    task_t *task = &task_pool[slot];
    task_alloc_bitmap |= (1U << slot);

    /* Initialize task */
    memset(task, 0, sizeof(task_t));
    task->id = next_task_id++;
    task->name = name;
    task->state = TASK_STATE_READY;
    task->func = func;
    task->arg = arg;
    task->deadline = jezgro_get_ticks() + deadline_ms;
    task->period = period_ms;
    task->wcet = 0;
    task->deadline_missed = false;

    #ifdef JEZGRO_SIM
    /* In simulation, no real stack needed */
    task->stack = NULL;
    task->stack_size = 0;
    #else
    /* Allocate stack */
    task->stack_size = JEZGRO_TASK_STACK_SIZE;
    task->stack = malloc(task->stack_size);
    if (task->stack == NULL) {
        task_alloc_bitmap &= ~(1U << slot);
        return NULL;
    }
    #endif

    TASK_DEBUG("Created task '%s' (id=%d, deadline=%u, period=%u)",
               name, task->id, task->deadline, task->period);

    /* Add to scheduler */
    scheduler_add_task(task);

    return task;
}

void task_destroy(task_t *task)
{
    if (task == NULL) return;

    TASK_DEBUG("Destroying task '%s' (id=%d)", task->name, task->id);

    /* Remove from scheduler */
    scheduler_remove_task(task);

    /* Free stack */
    #ifndef JEZGRO_SIM
    if (task->stack) {
        free(task->stack);
    }
    #endif

    /* Find slot and free it */
    int slot = task - task_pool;
    if (slot >= 0 && slot < JEZGRO_MAX_TASKS) {
        task_alloc_bitmap &= ~(1U << slot);
    }

    memset(task, 0, sizeof(task_t));
}

void task_suspend(task_t *task)
{
    if (task == NULL) return;

    TASK_DEBUG("Suspending task '%s'", task->name);
    task->state = TASK_STATE_SUSPENDED;
}

void task_resume(task_t *task)
{
    if (task == NULL) return;

    if (task->state == TASK_STATE_SUSPENDED) {
        TASK_DEBUG("Resuming task '%s'", task->name);
        task->state = TASK_STATE_READY;
    }
}

void task_set_deadline(task_t *task, uint32_t deadline_ms)
{
    if (task == NULL) return;

    task->deadline = jezgro_get_ticks() + deadline_ms;
    TASK_DEBUG("Task '%s' new deadline=%u", task->name, task->deadline);
}

task_t *task_get_by_id(uint8_t id)
{
    for (int i = 0; i < JEZGRO_MAX_TASKS; i++) {
        if ((task_alloc_bitmap & (1U << i)) && task_pool[i].id == id) {
            return &task_pool[i];
        }
    }
    return NULL;
}

task_t *task_get_by_name(const char *name)
{
    if (name == NULL) return NULL;

    for (int i = 0; i < JEZGRO_MAX_TASKS; i++) {
        if ((task_alloc_bitmap & (1U << i)) &&
            task_pool[i].name &&
            strcmp(task_pool[i].name, name) == 0) {
            return &task_pool[i];
        }
    }
    return NULL;
}

void task_sleep(uint32_t ms)
{
    task_t *current = scheduler_get_current();
    if (current == NULL) return;

    /* In simulation, just update deadline and yield */
    current->state = TASK_STATE_BLOCKED;

    #ifdef JEZGRO_SIM
    /* Simulate sleep by advancing tick */
    scheduler_tick(ms);
    #else
    /* Real implementation would use timer */
    #endif

    current->state = TASK_STATE_READY;
}

void task_complete(void)
{
    task_t *current = scheduler_get_current();
    if (current == NULL) return;

    TASK_DEBUG("Task '%s' completed", current->name);
    current->state = TASK_STATE_TERMINATED;

    scheduler_yield();
}

int task_count(void)
{
    int count = 0;
    for (int i = 0; i < JEZGRO_MAX_TASKS; i++) {
        if (task_alloc_bitmap & (1U << i)) {
            count++;
        }
    }
    return count;
}
