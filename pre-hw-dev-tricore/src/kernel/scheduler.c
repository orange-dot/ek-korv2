/**
 * @file scheduler.c
 * @brief JEZGRO EDF Scheduler Implementation
 *
 * Per-core EDF scheduler with:
 *   - Sorted ready queues (by deadline)
 *   - Preemptive scheduling
 *   - Priority inheritance
 *   - Deadline tracking
 */

#include "scheduler.h"
#include "task.h"
#include "hal/hal.h"
#include "arch/tricore_cpu.h"
#include "arch/tricore_csa.h"
#include <string.h>

/* ==========================================================================
 * Per-Core Scheduler Data
 * ========================================================================== */

static scheduler_data_t g_scheduler[JEZGRO_MAX_CORES];

/* Tick counter per core */
static volatile jezgro_ticks_t g_tick_count[JEZGRO_MAX_CORES];

/* Delay queue (tasks waiting on time) */
static task_handle_t g_delay_head[JEZGRO_MAX_CORES];

/* Context switch pending flag */
static volatile bool g_switch_pending[JEZGRO_MAX_CORES];

/* ==========================================================================
 * Internal Helpers
 * ========================================================================== */

/**
 * @brief Get scheduler data for current core
 */
static inline scheduler_data_t* get_scheduler(void)
{
    return &g_scheduler[hal_get_core_id()];
}

/**
 * @brief Compare tasks for EDF ordering
 *
 * Returns true if task_a should run before task_b.
 * EDF: earlier deadline wins.
 * Same deadline: higher priority wins.
 */
static bool task_compare_edf(task_handle_t task_a, task_handle_t task_b)
{
    tcb_t *a = (tcb_t*)task_a;
    tcb_t *b = (tcb_t*)task_b;

#if SCHEDULER_USE_EDF
    /* EDF: earlier deadline first */
    if (a->deadline != b->deadline) {
        return a->deadline < b->deadline;
    }
#endif

    /* Same deadline: higher priority first */
    return a->effective_priority > b->effective_priority;
}

/**
 * @brief Insert task into sorted ready queue
 */
static void ready_queue_insert(task_handle_t task)
{
    scheduler_data_t *sched = get_scheduler();
    tcb_t *tcb = (tcb_t*)task;

    tcb->next_ready = NULL;

    if (sched->ready_head == NULL) {
        /* Empty queue */
        sched->ready_head = task;
    }
    else if (task_compare_edf(task, sched->ready_head)) {
        /* Insert at head */
        tcb->next_ready = sched->ready_head;
        sched->ready_head = task;
    }
    else {
        /* Find insertion point */
        tcb_t *prev = (tcb_t*)sched->ready_head;
        while (prev->next_ready != NULL &&
               !task_compare_edf(task, prev->next_ready)) {
            prev = (tcb_t*)prev->next_ready;
        }
        tcb->next_ready = prev->next_ready;
        prev->next_ready = task;
    }

    sched->ready_count++;
}

/**
 * @brief Remove task from ready queue
 */
static void ready_queue_remove(task_handle_t task)
{
    scheduler_data_t *sched = get_scheduler();

    if (sched->ready_head == NULL) {
        return;
    }

    if (sched->ready_head == task) {
        /* Remove from head */
        tcb_t *tcb = (tcb_t*)task;
        sched->ready_head = tcb->next_ready;
        tcb->next_ready = NULL;
        sched->ready_count--;
        return;
    }

    /* Search for task */
    tcb_t *prev = (tcb_t*)sched->ready_head;
    while (prev->next_ready != NULL && prev->next_ready != task) {
        prev = (tcb_t*)prev->next_ready;
    }

    if (prev->next_ready == task) {
        tcb_t *tcb = (tcb_t*)task;
        prev->next_ready = tcb->next_ready;
        tcb->next_ready = NULL;
        sched->ready_count--;
    }
}

/**
 * @brief Insert task into delay queue (sorted by wake time)
 */
static void delay_queue_insert(task_handle_t task, jezgro_ticks_t wake_time)
{
    uint32_t core = hal_get_core_id();
    tcb_t *tcb = (tcb_t*)task;

    tcb->wake_time = wake_time;
    tcb->next_delay = NULL;

    if (g_delay_head[core] == NULL) {
        g_delay_head[core] = task;
    }
    else {
        tcb_t *head = (tcb_t*)g_delay_head[core];
        if (wake_time < head->wake_time) {
            /* Insert at head */
            tcb->next_delay = g_delay_head[core];
            g_delay_head[core] = task;
        }
        else {
            /* Find insertion point */
            tcb_t *prev = head;
            while (prev->next_delay != NULL) {
                tcb_t *next = (tcb_t*)prev->next_delay;
                if (wake_time < next->wake_time) {
                    break;
                }
                prev = next;
            }
            tcb->next_delay = prev->next_delay;
            prev->next_delay = task;
        }
    }
}

/**
 * @brief Remove task from delay queue
 */
static void delay_queue_remove(task_handle_t task)
{
    uint32_t core = hal_get_core_id();

    if (g_delay_head[core] == NULL) {
        return;
    }

    if (g_delay_head[core] == task) {
        tcb_t *tcb = (tcb_t*)task;
        g_delay_head[core] = tcb->next_delay;
        tcb->next_delay = NULL;
        return;
    }

    tcb_t *prev = (tcb_t*)g_delay_head[core];
    while (prev->next_delay != NULL && prev->next_delay != task) {
        prev = (tcb_t*)prev->next_delay;
    }

    if (prev->next_delay == task) {
        tcb_t *tcb = (tcb_t*)task;
        prev->next_delay = tcb->next_delay;
        tcb->next_delay = NULL;
    }
}

/* ==========================================================================
 * Context Switch
 * ========================================================================== */

/* External assembly context switch */
extern void _context_switch_asm(uint32_t *old_pcxi, uint32_t new_pcxi);
extern void _start_first_task(uint32_t pcxi);

/**
 * @brief Perform actual context switch
 */
static void do_context_switch(task_handle_t from, task_handle_t to)
{
    scheduler_data_t *sched = get_scheduler();

    if (from == to) {
        return;
    }

    tcb_t *from_tcb = (tcb_t*)from;
    tcb_t *to_tcb = (tcb_t*)to;

    /* Update states */
    if (from_tcb != NULL && from_tcb->state == TASK_STATE_RUNNING) {
        from_tcb->state = TASK_STATE_READY;
    }
    to_tcb->state = TASK_STATE_RUNNING;

    /* Update current */
    sched->current = to;

    /* Statistics */
    sched->context_switches++;

#if SCHEDULER_TRACK_TIME
    uint32_t now = hal_get_time_us();
    if (from_tcb != NULL) {
        from_tcb->last_run_time = now - sched->last_switch_time;
        from_tcb->total_run_time += from_tcb->last_run_time;
    }
    sched->last_switch_time = now;
#endif

    /* Perform switch */
    if (from_tcb != NULL) {
        _context_switch_asm(&from_tcb->context_pcxi, to_tcb->context_pcxi);
    }
    else {
        /* Starting first task */
        _start_first_task(to_tcb->context_pcxi);
    }
}

/* ==========================================================================
 * Initialization
 * ========================================================================== */

jezgro_error_t scheduler_init(void)
{
    uint32_t core = hal_get_core_id();
    scheduler_data_t *sched = &g_scheduler[core];

    memset(sched, 0, sizeof(scheduler_data_t));

    sched->ready_head = NULL;
    sched->ready_count = 0;
    sched->current = NULL;
    sched->idle_task = NULL;
    sched->running = false;
    sched->lock_count = 0;
    sched->context_switches = 0;
    sched->idle_time_us = 0;
    sched->last_switch_time = 0;

    g_tick_count[core] = 0;
    g_delay_head[core] = NULL;
    g_switch_pending[core] = false;

    return JEZGRO_OK;
}

void scheduler_start(void)
{
    scheduler_data_t *sched = get_scheduler();

    /* Must have at least idle task */
    if (sched->idle_task == NULL) {
        jezgro_panic("No idle task");
    }

    /* Select first task */
    task_handle_t first = scheduler_select_next();

    /* Mark as running */
    sched->running = true;
    sched->current = first;

    tcb_t *tcb = (tcb_t*)first;
    tcb->state = TASK_STATE_RUNNING;

    /* Initialize time tracking */
    sched->last_switch_time = hal_get_time_us();

    /* Start first task (never returns) */
    _start_first_task(tcb->context_pcxi);

    /* Should never reach here */
    while (1) {
        __nop();
    }
}

/* ==========================================================================
 * Scheduler Control
 * ========================================================================== */

void scheduler_lock(void)
{
    hal_enter_critical();
    get_scheduler()->lock_count++;
    hal_exit_critical();
}

void scheduler_unlock(void)
{
    scheduler_data_t *sched = get_scheduler();

    hal_enter_critical();

    if (sched->lock_count > 0) {
        sched->lock_count--;
    }

    /* Check for pending switch */
    if (sched->lock_count == 0 && g_switch_pending[hal_get_core_id()]) {
        g_switch_pending[hal_get_core_id()] = false;

        task_handle_t next = scheduler_select_next();
        if (next != sched->current) {
            do_context_switch(sched->current, next);
        }
    }

    hal_exit_critical();
}

bool scheduler_is_locked(void)
{
    return get_scheduler()->lock_count > 0;
}

bool scheduler_is_running(void)
{
    return get_scheduler()->running;
}

/* ==========================================================================
 * Task Queue Management
 * ========================================================================== */

void scheduler_ready(task_handle_t task)
{
    tcb_t *tcb = (tcb_t*)task;
    scheduler_data_t *sched = get_scheduler();

    hal_enter_critical();

    tcb->state = TASK_STATE_READY;
    ready_queue_insert(task);

    /* Check if preemption needed */
    if (sched->running && sched->lock_count == 0) {
        if (task_compare_edf(task, sched->current)) {
            /* New task has earlier deadline - preempt */
            do_context_switch(sched->current, task);
        }
    }

    hal_exit_critical();
}

void scheduler_unready(task_handle_t task)
{
    hal_enter_critical();
    ready_queue_remove(task);
    hal_exit_critical();
}

jezgro_error_t scheduler_block(jezgro_ticks_t timeout)
{
    scheduler_data_t *sched = get_scheduler();
    tcb_t *tcb = (tcb_t*)sched->current;

    hal_enter_critical();

    /* Remove from ready queue */
    ready_queue_remove(sched->current);

    /* Set blocked state */
    tcb->state = TASK_STATE_BLOCKED;
    tcb->timeout_result = JEZGRO_OK;

    /* Add to delay queue if timeout specified */
    if (timeout != JEZGRO_WAIT_FOREVER && timeout != JEZGRO_NO_WAIT) {
        delay_queue_insert(sched->current, g_tick_count[hal_get_core_id()] + timeout);
    }

    /* Select and switch to next task */
    task_handle_t next = scheduler_select_next();
    do_context_switch(sched->current, next);

    hal_exit_critical();

    /* When we return, check if it was timeout */
    return tcb->timeout_result;
}

void scheduler_unblock(task_handle_t task)
{
    tcb_t *tcb = (tcb_t*)task;

    hal_enter_critical();

    if (tcb->state == TASK_STATE_BLOCKED) {
        /* Remove from delay queue if present */
        delay_queue_remove(task);

        /* Add to ready queue */
        scheduler_ready(task);
    }

    hal_exit_critical();
}

/* ==========================================================================
 * Context Switch Triggers
 * ========================================================================== */

void scheduler_switch_request(void)
{
    uint32_t core = hal_get_core_id();
    g_switch_pending[core] = true;

    /* If in ISR, switch will happen on exit */
    /* If not, request via HAL */
    if (!jezgro_in_isr() && !scheduler_is_locked()) {
        hal_trigger_context_switch();
    }
}

void scheduler_yield(void)
{
    scheduler_data_t *sched = get_scheduler();

    hal_enter_critical();

    tcb_t *tcb = (tcb_t*)sched->current;

    /* Move current task to end of same-priority tasks */
    ready_queue_remove(sched->current);
    tcb->state = TASK_STATE_READY;
    ready_queue_insert(sched->current);

    /* Select and switch */
    task_handle_t next = scheduler_select_next();
    if (next != sched->current) {
        do_context_switch(sched->current, next);
    }

    hal_exit_critical();
}

task_handle_t scheduler_get_current(void)
{
    return get_scheduler()->current;
}

task_handle_t scheduler_select_next(void)
{
    scheduler_data_t *sched = get_scheduler();

    /* Ready queue is sorted - head is highest priority */
    if (sched->ready_head != NULL) {
        return sched->ready_head;
    }

    /* No ready tasks - return idle */
    return sched->idle_task;
}

/* ==========================================================================
 * Timer Tick Handler
 * ========================================================================== */

void scheduler_tick(void)
{
    uint32_t core = hal_get_core_id();
    scheduler_data_t *sched = &g_scheduler[core];

    /* Increment tick count */
    g_tick_count[core]++;

    /* Process delay queue - wake expired tasks */
    while (g_delay_head[core] != NULL) {
        tcb_t *tcb = (tcb_t*)g_delay_head[core];
        if (tcb->wake_time > g_tick_count[core]) {
            break;  /* No more expired */
        }

        /* Wake this task */
        task_handle_t task = g_delay_head[core];
        g_delay_head[core] = tcb->next_delay;
        tcb->next_delay = NULL;

        /* Mark as timeout if was blocking call */
        if (tcb->state == TASK_STATE_BLOCKED) {
            tcb->timeout_result = JEZGRO_ERROR_TIMEOUT;
        }

        tcb->state = TASK_STATE_READY;
        ready_queue_insert(task);
    }

#if SCHEDULER_CHECK_DEADLINE
    /* Check for deadline violations */
    scheduler_check_deadlines();
#endif

    /* Request reschedule if higher priority task became ready */
    if (sched->running && sched->lock_count == 0) {
        task_handle_t next = scheduler_select_next();
        if (next != sched->current &&
            task_compare_edf(next, sched->current)) {
            g_switch_pending[core] = true;
        }
    }
}

jezgro_ticks_t scheduler_get_ticks(void)
{
    return g_tick_count[hal_get_core_id()];
}

/* ==========================================================================
 * Delay Functions
 * ========================================================================== */

void scheduler_delay(jezgro_ticks_t ticks)
{
    if (ticks == 0) {
        return;
    }

    scheduler_data_t *sched = get_scheduler();

    hal_enter_critical();

    tcb_t *tcb = (tcb_t*)sched->current;
    tcb->state = TASK_STATE_BLOCKED;

    /* Add to delay queue */
    delay_queue_insert(sched->current, g_tick_count[hal_get_core_id()] + ticks);

    /* Remove from ready queue */
    ready_queue_remove(sched->current);

    /* Switch to next task */
    task_handle_t next = scheduler_select_next();
    do_context_switch(sched->current, next);

    hal_exit_critical();
}

void scheduler_delay_until(jezgro_ticks_t *prev_wake, jezgro_ticks_t period)
{
    jezgro_ticks_t current = g_tick_count[hal_get_core_id()];
    jezgro_ticks_t next_wake = *prev_wake + period;

    if (next_wake > current) {
        /* Need to wait */
        scheduler_delay(next_wake - current);
    }

    *prev_wake = next_wake;
}

void scheduler_wake(task_handle_t task, bool timeout_expired)
{
    tcb_t *tcb = (tcb_t*)task;

    hal_enter_critical();

    delay_queue_remove(task);

    if (tcb->state == TASK_STATE_BLOCKED) {
        tcb->timeout_result = timeout_expired ? JEZGRO_ERROR_TIMEOUT : JEZGRO_OK;
        tcb->state = TASK_STATE_READY;
        ready_queue_insert(task);

        /* Check preemption */
        scheduler_switch_request();
    }

    hal_exit_critical();
}

/* ==========================================================================
 * Priority Management
 * ========================================================================== */

void scheduler_priority_inherit(task_handle_t task, uint8_t ceiling)
{
    tcb_t *tcb = (tcb_t*)task;

    hal_enter_critical();

    if (ceiling > tcb->effective_priority) {
        tcb->effective_priority = ceiling;

        /* Re-sort in ready queue */
        if (tcb->state == TASK_STATE_READY) {
            ready_queue_remove(task);
            ready_queue_insert(task);
        }
    }

    hal_exit_critical();
}

void scheduler_priority_restore(task_handle_t task)
{
    tcb_t *tcb = (tcb_t*)task;

    hal_enter_critical();

    tcb->effective_priority = tcb->base_priority;

    /* Re-sort in ready queue */
    if (tcb->state == TASK_STATE_READY) {
        ready_queue_remove(task);
        ready_queue_insert(task);
    }

    hal_exit_critical();
}

/* ==========================================================================
 * Deadline Management
 * ========================================================================== */

void scheduler_set_deadline(task_handle_t task, jezgro_time_us_t deadline_us)
{
    tcb_t *tcb = (tcb_t*)task;

    hal_enter_critical();

    tcb->deadline = deadline_us;

    /* Re-sort if in ready queue */
    if (tcb->state == TASK_STATE_READY) {
        ready_queue_remove(task);
        ready_queue_insert(task);
    }

    hal_exit_critical();
}

void scheduler_check_deadlines(void)
{
#if SCHEDULER_CHECK_DEADLINE
    jezgro_time_us_t now = hal_get_time_us();
    scheduler_data_t *sched = get_scheduler();

    /* Check current task */
    if (sched->current != NULL && sched->current != sched->idle_task) {
        tcb_t *tcb = (tcb_t*)sched->current;

        if (tcb->deadline != 0 && now > tcb->deadline) {
            /* Deadline missed */
            tcb->deadlines_missed++;
            jezgro_deadline_miss_hook(sched->current, now - tcb->deadline);
        }
    }
#endif
}

/* ==========================================================================
 * Statistics
 * ========================================================================== */

void scheduler_get_stats(uint32_t core_id, uint32_t *switches, uint32_t *idle_pct)
{
    if (core_id >= JEZGRO_MAX_CORES) {
        core_id = hal_get_core_id();
    }

    scheduler_data_t *sched = &g_scheduler[core_id];

    if (switches) {
        *switches = sched->context_switches;
    }

    if (idle_pct) {
        /* Calculate based on tracked idle time */
        /* TODO: More accurate calculation */
        *idle_pct = 0;
    }
}

void scheduler_reset_stats(void)
{
    scheduler_data_t *sched = get_scheduler();
    sched->context_switches = 0;
    sched->idle_time_us = 0;
}

uint32_t scheduler_get_utilization(void)
{
    /* TODO: Calculate actual CPU utilization */
    return 0;
}

/* ==========================================================================
 * Debug
 * ========================================================================== */

void scheduler_dump_ready(void)
{
    /* TODO: Implement debug output */
}

bool scheduler_validate(void)
{
    scheduler_data_t *sched = get_scheduler();
    uint32_t count = 0;

    /* Count tasks in ready queue */
    task_handle_t task = sched->ready_head;
    while (task != NULL) {
        count++;
        tcb_t *tcb = (tcb_t*)task;
        task = tcb->next_ready;

        /* Prevent infinite loop */
        if (count > JEZGRO_MAX_TASKS) {
            return false;
        }
    }

    return count == sched->ready_count;
}

/* ==========================================================================
 * Idle Task Hook
 * ========================================================================== */

/**
 * @brief Set idle task for current core
 */
void scheduler_set_idle_task(task_handle_t task)
{
    get_scheduler()->idle_task = task;
}
