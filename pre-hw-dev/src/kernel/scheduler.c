/**
 * @file scheduler.c
 * @brief JEZGRO EDF (Earliest Deadline First) Scheduler Implementation
 *
 * The EDF scheduler always selects the task with the earliest absolute
 * deadline. This provides optimal CPU utilization for real-time systems.
 */

#include "jezgro.h"
#include "hal.h"
#include <string.h>

#ifdef JEZGRO_SIM
#include <stdio.h>
#define SCHED_DEBUG(fmt, ...) \
    do { if (JEZGRO_DEBUG) printf("[SCHED] " fmt "\n", ##__VA_ARGS__); } while(0)
#else
#define SCHED_DEBUG(fmt, ...)
/* ARM intrinsic for Wait For Interrupt */
static inline void __WFI(void) { __asm volatile ("wfi"); }
#endif

/*===========================================================================*/
/* Private Data                                                              */
/*===========================================================================*/

/** Ready queue (sorted by deadline) */
static task_t *ready_queue = NULL;

/** Currently running task */
static task_t *current_task = NULL;

/** Idle task */
static task_t idle_task;

/** Current system tick */
static tick_t system_ticks = 0;

/** Context switch counter */
static uint32_t context_switches = 0;

/** Scheduler lock count */
static int sched_lock_count = 0;

/** Context switch in progress flag - prevents nested switches */
static volatile bool context_switch_pending = false;

/*===========================================================================*/
/* Private Functions                                                         */
/*===========================================================================*/

/**
 * @brief Insert task into ready queue (sorted by deadline)
 */
static void insert_by_deadline(task_t *task)
{
    task_t **pp = &ready_queue;

    /* Find insertion point (maintain deadline order) */
    while (*pp != NULL && (*pp)->deadline <= task->deadline) {
        pp = &((*pp)->next);
    }

    task->next = *pp;
    *pp = task;
}

/**
 * @brief Remove task from ready queue
 */
static void remove_from_queue(task_t *task)
{
    task_t **pp = &ready_queue;

    while (*pp != NULL) {
        if (*pp == task) {
            *pp = task->next;
            task->next = NULL;
            return;
        }
        pp = &((*pp)->next);
    }
}

/**
 * @brief Idle task function
 */
static void idle_task_func(void *arg)
{
    (void)arg;
    while (1) {
        /* Low power wait or yield */
        #ifdef JEZGRO_SIM
        /* In simulation, just yield */
        #else
        __WFI(); /* Wait for interrupt */
        #endif
    }
}

/*===========================================================================*/
/* Public Functions                                                          */
/*===========================================================================*/

void scheduler_init(void)
{
    SCHED_DEBUG("Initializing scheduler");

    ready_queue = NULL;
    current_task = NULL;
    system_ticks = 0;
    context_switches = 0;
    sched_lock_count = 0;

    /* Initialize idle task */
    memset(&idle_task, 0, sizeof(idle_task));
    idle_task.id = 255;
    idle_task.name = "idle";
    idle_task.state = TASK_STATE_READY;
    idle_task.deadline = UINT32_MAX; /* Lowest priority */
    idle_task.func = idle_task_func;

    SCHED_DEBUG("Scheduler initialized");
}

int scheduler_add_task(task_t *task)
{
    if (task == NULL) {
        return JEZGRO_ERR_INVALID;
    }

    SCHED_DEBUG("Adding task '%s' (id=%d, deadline=%u)",
                task->name, task->id, task->deadline);

    /* Critical section - protect ready_queue modification */
    uint32_t irq_state = hal_disable_interrupts();

    task->state = TASK_STATE_READY;
    task->deadline_missed = false;
    task->next = NULL;

    insert_by_deadline(task);

    hal_restore_interrupts(irq_state);

    return JEZGRO_OK;
}

int scheduler_remove_task(task_t *task)
{
    if (task == NULL) {
        return JEZGRO_ERR_INVALID;
    }

    SCHED_DEBUG("Removing task '%s' (id=%d)", task->name, task->id);

    /* Critical section - protect ready_queue modification */
    uint32_t irq_state = hal_disable_interrupts();

    remove_from_queue(task);
    task->state = TASK_STATE_TERMINATED;

    hal_restore_interrupts(irq_state);

    return JEZGRO_OK;
}

task_t *scheduler_get_next(void)
{
    /* Critical section - protect ready_queue access and current_task update */
    uint32_t irq_state = hal_disable_interrupts();

    task_t *next = NULL;

    /* Find first ready task in queue (already sorted by deadline) */
    for (task_t *t = ready_queue; t != NULL; t = t->next) {
        if (t->state == TASK_STATE_READY) {
            next = t;
            break;
        }
    }

    /* If no ready task, return idle task */
    if (next == NULL) {
        next = &idle_task;
    }

    /* Context switch if different task */
    if (next != current_task) {
        if (current_task != NULL && current_task->state == TASK_STATE_RUNNING) {
            current_task->state = TASK_STATE_READY;
        }
        current_task = next;
        current_task->state = TASK_STATE_RUNNING;
        context_switches++;

        SCHED_DEBUG("Context switch to '%s' (deadline=%u)",
                    current_task->name, current_task->deadline);
    }

    hal_restore_interrupts(irq_state);

    return current_task;
}

task_t *scheduler_get_current(void)
{
    return current_task;
}

task_t *scheduler_peek_next(void)
{
    /* Find first ready task without changing state */
    for (task_t *t = ready_queue; t != NULL; t = t->next) {
        if (t->state == TASK_STATE_READY) {
            return t;
        }
    }
    return NULL;
}

void scheduler_tick(uint32_t elapsed_ms)
{
    system_ticks += elapsed_ms;

    /* Check deadlines for all tasks */
    for (task_t *t = ready_queue; t != NULL; t = t->next) {
        if (t->state == TASK_STATE_READY || t->state == TASK_STATE_RUNNING) {
            if (system_ticks > t->deadline && !t->deadline_missed) {
                t->deadline_missed = true;
                SCHED_DEBUG("DEADLINE MISS: task '%s' (deadline=%u, now=%u)",
                            t->name, t->deadline, system_ticks);
            }
        }

        /* Handle periodic tasks */
        if (t->period > 0 && t->state == TASK_STATE_TERMINATED) {
            /* Reset for next period */
            t->deadline += t->period;
            t->deadline_missed = false;
            t->state = TASK_STATE_READY;
            SCHED_DEBUG("Periodic task '%s' reset (new deadline=%u)",
                        t->name, t->deadline);
        }
    }
}

void scheduler_yield(void)
{
    if (current_task == NULL) {
        return;
    }

    #ifdef JEZGRO_SIM
    /* In simulation, just switch state and get next */
    current_task->state = TASK_STATE_READY;
    scheduler_get_next();
    #else
    /* Critical section - protect scheduler state */
    uint32_t irq_state = hal_disable_interrupts();

    /* Find next ready task (different from current) */
    task_t *next = NULL;
    for (task_t *t = ready_queue; t != NULL; t = t->next) {
        if (t->state == TASK_STATE_READY && t != current_task) {
            next = t;
            break;
        }
    }

    if (next == NULL) {
        /* No other ready task, continue running current */
        hal_restore_interrupts(irq_state);
        return;
    }

    /* Perform context switch */
    task_t *prev = current_task;
    prev->state = TASK_STATE_READY;
    current_task = next;
    next->state = TASK_STATE_RUNNING;
    context_switches++;

    SCHED_DEBUG("Yield: '%s' -> '%s'", prev->name, next->name);

    /* Mark context switch as pending - prevents preemption during switch */
    context_switch_pending = true;

    /* Restore interrupts before triggering PendSV.
     * PendSV needs interrupts enabled to run. */
    hal_restore_interrupts(irq_state);

    /* Trigger context switch - PendSV will run after we return */
    hal_context_switch(&prev->sp, next->sp);

    /* PendSV has completed - we're now back in this task */
    context_switch_pending = false;

    /* When we return here, this task has been restored */
    #endif
}

void scheduler_preempt(void)
{
    #ifndef JEZGRO_SIM
    /* Called from SysTick to check if preemption is needed.
     * Note: This is called from interrupt context!
     */

    /* Don't preempt if a context switch is already in progress */
    if (context_switch_pending) {
        return;
    }

    /* Find next ready task */
    task_t *next = NULL;
    for (task_t *t = ready_queue; t != NULL; t = t->next) {
        if (t->state == TASK_STATE_READY) {
            next = t;
            break;
        }
    }

    if (next == NULL || next == current_task) {
        return;  /* No preemption needed */
    }

    /* Only preempt if next has earlier deadline (EDF) */
    if (current_task != NULL && next->deadline >= current_task->deadline) {
        return;  /* Current task has priority */
    }

    /* Preemption needed - perform context switch */
    task_t *prev = current_task;
    if (prev != NULL) {
        prev->state = TASK_STATE_READY;
    }

    current_task = next;
    next->state = TASK_STATE_RUNNING;
    context_switches++;

    SCHED_DEBUG("Preempt: '%s' -> '%s'",
                prev ? prev->name : "none", next->name);

    /* Mark context switch as pending */
    context_switch_pending = true;

    /* Trigger context switch via PendSV.
     * PendSV has lower priority than SysTick, so it will run
     * after SysTick returns. */
    if (prev != NULL) {
        hal_context_switch(&prev->sp, next->sp);
    } else {
        hal_context_switch(NULL, next->sp);
    }

    /* Note: context_switch_pending will be cleared by the task
     * that resumes, in its scheduler_yield() return path.
     * For preemption, the preempted task will clear it when it
     * next calls scheduler_yield(). */
    #endif
}

void scheduler_start(void)
{
    SCHED_DEBUG("Starting scheduler");

    /* Get first ready task */
    task_t *first = NULL;
    for (task_t *t = ready_queue; t != NULL; t = t->next) {
        if (t->state == TASK_STATE_READY) {
            first = t;
            break;
        }
    }

    if (first == NULL) {
        SCHED_DEBUG("No tasks to run, entering idle loop");
        /* No tasks, just idle forever */
        while (1) {
            #ifndef JEZGRO_SIM
            __WFI();
            #endif
        }
    }

    SCHED_DEBUG("Starting first task: '%s' (sp=0x%08X)", first->name, first->sp);

    current_task = first;
    first->state = TASK_STATE_RUNNING;
    context_switches++;

    #ifdef JEZGRO_SIM
    /* In simulation, just call the function directly */
    if (first->func) {
        first->func(first->arg);
    }
    #else
    /* Mark context switch as starting - will be cleared by first yield */
    context_switch_pending = true;

    /* Perform first context switch (no save, just load) */
    /* Pass NULL for current_sp to skip saving current context */
    hal_context_switch(NULL, first->sp);

    /* Never reached - we switched to first task */
    #endif
}

int scheduler_check_deadlines(void)
{
    int count = 0;

    for (task_t *t = ready_queue; t != NULL; t = t->next) {
        if (t->deadline_missed) {
            count++;
        }
    }

    return count;
}

void scheduler_get_stats(int *ready_count, int *blocked_count)
{
    int ready = 0;
    int blocked = 0;

    for (task_t *t = ready_queue; t != NULL; t = t->next) {
        switch (t->state) {
            case TASK_STATE_READY:
            case TASK_STATE_RUNNING:
                ready++;
                break;
            case TASK_STATE_BLOCKED:
                blocked++;
                break;
            default:
                break;
        }
    }

    if (ready_count) *ready_count = ready;
    if (blocked_count) *blocked_count = blocked;
}

void scheduler_lock(void)
{
    sched_lock_count++;
}

void scheduler_unlock(void)
{
    if (sched_lock_count > 0) {
        sched_lock_count--;
    }
}

/* Accessor for system ticks */
tick_t jezgro_get_ticks(void)
{
    return system_ticks;
}
