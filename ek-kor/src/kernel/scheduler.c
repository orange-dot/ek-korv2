/**
 * @file scheduler.c
 * @brief ek-kor EDF Scheduler Implementation
 *
 * Earliest Deadline First scheduling with per-core ready queues.
 */

#include <ek-kor/ek-kor.h>
#include <string.h>

/* ==========================================================================
 * Per-Core Scheduler Data
 * ========================================================================== */

static ekk_sched_data_t g_sched[EKK_MAX_CORES];
static volatile ekk_tick_t g_tick_count[EKK_MAX_CORES];
static ekk_task_t g_delay_head[EKK_MAX_CORES];

/* ==========================================================================
 * Helper Functions
 * ========================================================================== */

static inline ekk_sched_data_t* get_sched(void)
{
    return &g_sched[ekk_hal_get_core_id()];
}

static inline ekk_tick_t* get_tick_count(void)
{
    return (ekk_tick_t*)&g_tick_count[ekk_hal_get_core_id()];
}

/* ==========================================================================
 * Initialization
 * ========================================================================== */

ekk_err_t ekk_sched_init(void)
{
    uint32_t core = ekk_hal_get_core_id();

    memset(&g_sched[core], 0, sizeof(ekk_sched_data_t));
    g_tick_count[core] = 0;
    g_delay_head[core] = NULL;

    return EKK_OK;
}

void ekk_sched_start(void)
{
    ekk_sched_data_t *sched = get_sched();

    /* Create idle task if not already */
    if (!sched->idle_task) {
        ekk_task_create_idle();
    }

    sched->running = true;

    /* Select first task */
    ekk_task_t first = ekk_sched_select_next();
    if (!first) {
        first = sched->idle_task;
    }

    sched->current = first;

    /* Start systick */
    ekk_hal_systick_init(ekk_sched_tick);

    /* Start first task - doesn't return */
    ekk_tcb_t *tcb = ekk_task_get_tcb(first);
    tcb->state = EKK_TASK_RUNNING;
    ekk_hal_start_first_task(tcb->stack_top, (void (*)(void))tcb->entry_func);

    /* Never reached */
    for (;;) {}
}

/* ==========================================================================
 * Scheduler Control
 * ========================================================================== */

void ekk_sched_lock(void)
{
    ekk_hal_enter_critical();
    get_sched()->lock_count++;
    ekk_hal_exit_critical();
}

void ekk_sched_unlock(void)
{
    ekk_sched_data_t *sched = get_sched();

    ekk_hal_enter_critical();
    if (sched->lock_count > 0) {
        sched->lock_count--;
    }
    ekk_hal_exit_critical();

    /* Check for pending reschedule */
    if (sched->lock_count == 0 && sched->running) {
        ekk_sched_switch_request();
    }
}

bool ekk_sched_is_locked(void)
{
    return get_sched()->lock_count > 0;
}

bool ekk_sched_is_running(void)
{
    return get_sched()->running;
}

/* ==========================================================================
 * Task Queue Management
 * ========================================================================== */

void ekk_sched_ready(ekk_task_t task)
{
    ekk_sched_data_t *sched = get_sched();
    ekk_tcb_t *tcb = ekk_task_get_tcb(task);

    ekk_hal_enter_critical();

    tcb->state = EKK_TASK_READY;

    /* Insert sorted by deadline (EDF) or priority */
    ekk_tcb_t **pp = (ekk_tcb_t**)&sched->ready_head;

#if EKK_USE_EDF
    while (*pp && (*pp)->deadline <= tcb->deadline) {
        pp = &(*pp)->next_ready;
    }
#else
    while (*pp && (*pp)->effective_priority >= tcb->effective_priority) {
        pp = &(*pp)->next_ready;
    }
#endif

    tcb->next_ready = *pp;
    *pp = tcb;
    sched->ready_count++;

    ekk_hal_exit_critical();

    /* May need to preempt current task */
    if (sched->running && !sched->lock_count) {
        ekk_sched_switch_request();
    }
}

void ekk_sched_unready(ekk_task_t task)
{
    ekk_sched_data_t *sched = get_sched();
    ekk_tcb_t *tcb = ekk_task_get_tcb(task);

    ekk_hal_enter_critical();

    ekk_tcb_t **pp = (ekk_tcb_t**)&sched->ready_head;
    while (*pp && *pp != tcb) {
        pp = &(*pp)->next_ready;
    }

    if (*pp) {
        *pp = tcb->next_ready;
        tcb->next_ready = NULL;
        sched->ready_count--;
    }

    ekk_hal_exit_critical();
}

ekk_err_t ekk_sched_block(ekk_tick_t timeout)
{
    ekk_sched_data_t *sched = get_sched();
    ekk_tcb_t *tcb = ekk_task_get_tcb(sched->current);

    ekk_hal_enter_critical();

    tcb->state = EKK_TASK_BLOCKED;
    tcb->timeout_result = EKK_OK;

    if (timeout != EKK_WAIT_FOREVER && timeout > 0) {
        tcb->wake_time = *get_tick_count() + timeout;
        /* Add to delay queue - simplified, just store wake time */
    }

    ekk_hal_exit_critical();

    /* Trigger reschedule */
    ekk_sched_switch_request();

    return tcb->timeout_result;
}

void ekk_sched_unblock(ekk_task_t task)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(task);

    ekk_hal_enter_critical();
    if (tcb->state == EKK_TASK_BLOCKED) {
        ekk_sched_ready(task);
    }
    ekk_hal_exit_critical();
}

/* ==========================================================================
 * Context Switching
 * ========================================================================== */

void ekk_sched_switch_request(void)
{
    if (!ekk_sched_is_locked() && ekk_sched_is_running()) {
        ekk_hal_trigger_context_switch();
    }
}

void ekk_sched_yield(void)
{
    ekk_sched_data_t *sched = get_sched();
    ekk_tcb_t *tcb = ekk_task_get_tcb(sched->current);

    /* Move to back of queue with same deadline/priority */
    ekk_sched_unready(sched->current);
    tcb->state = EKK_TASK_READY;
    ekk_sched_ready(sched->current);

    ekk_sched_switch_request();
}

ekk_task_t ekk_sched_get_current(void)
{
    return get_sched()->current;
}

ekk_task_t ekk_sched_select_next(void)
{
    ekk_sched_data_t *sched = get_sched();

    if (sched->ready_head) {
        return sched->ready_head;
    }

    return sched->idle_task;
}

/* ==========================================================================
 * Timer Tick Handling
 * ========================================================================== */

void ekk_sched_tick(void)
{
    ekk_tick_t *tick = get_tick_count();
    (*tick)++;

    /* Process delay queue - wake tasks whose time has come */
    /* TODO: Implement delay queue processing */

#if EKK_CHECK_DEADLINE
    ekk_sched_check_deadlines();
#endif

    /* Request reschedule to check if preemption needed */
    ekk_sched_switch_request();
}

ekk_tick_t ekk_sched_get_ticks(void)
{
    return *get_tick_count();
}

/* ==========================================================================
 * Delay Management
 * ========================================================================== */

void ekk_sched_delay(ekk_tick_t ticks)
{
    if (ticks == 0) return;

    ekk_sched_data_t *sched = get_sched();
    ekk_tcb_t *tcb = ekk_task_get_tcb(sched->current);

    ekk_hal_enter_critical();
    tcb->wake_time = *get_tick_count() + ticks;
    tcb->state = EKK_TASK_BLOCKED;
    ekk_hal_exit_critical();

    ekk_sched_switch_request();
}

void ekk_sched_delay_until(ekk_tick_t *prev_wake, ekk_tick_t period)
{
    ekk_tick_t now = *get_tick_count();
    ekk_tick_t next = *prev_wake + period;

    if ((int32_t)(next - now) > 0) {
        ekk_sched_delay(next - now);
    }

    *prev_wake = next;
}

void ekk_sched_wake(ekk_task_t task, bool timeout_expired)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(task);

    ekk_hal_enter_critical();
    if (tcb->state == EKK_TASK_BLOCKED) {
        tcb->timeout_result = timeout_expired ? EKK_ERR_TIMEOUT : EKK_OK;
        ekk_sched_ready(task);
    }
    ekk_hal_exit_critical();
}

/* ==========================================================================
 * Priority Management
 * ========================================================================== */

void ekk_sched_priority_inherit(ekk_task_t task, uint8_t ceiling)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(task);
    if (!tcb) return;

    ekk_hal_enter_critical();
    if (ceiling > tcb->effective_priority) {
        tcb->effective_priority = ceiling;
        /* Re-sort in ready queue if needed */
        if (tcb->state == EKK_TASK_READY) {
            ekk_sched_unready(task);
            ekk_sched_ready(task);
        }
    }
    ekk_hal_exit_critical();
}

void ekk_sched_priority_restore(ekk_task_t task)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(task);
    if (!tcb) return;

    ekk_hal_enter_critical();
    tcb->effective_priority = tcb->base_priority;
    if (tcb->state == EKK_TASK_READY) {
        ekk_sched_unready(task);
        ekk_sched_ready(task);
    }
    ekk_hal_exit_critical();
}

/* ==========================================================================
 * Deadline Management
 * ========================================================================== */

void ekk_sched_set_deadline(ekk_task_t task, ekk_time_us_t deadline_us)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(task);
    tcb->deadline = deadline_us;
}

void ekk_sched_check_deadlines(void)
{
#if EKK_CHECK_DEADLINE
    ekk_sched_data_t *sched = get_sched();
    ekk_time_us_t now = ekk_hal_get_time_us();

    ekk_tcb_t *tcb = (ekk_tcb_t*)sched->ready_head;
    while (tcb) {
        if (tcb->deadline > 0 && now > tcb->deadline) {
            tcb->deadlines_missed++;
            uint32_t overrun = now - tcb->deadline;
            ekk_deadline_miss_hook((ekk_task_t)tcb, overrun);
        }
        tcb = tcb->next_ready;
    }
#endif
}

/* ==========================================================================
 * Statistics
 * ========================================================================== */

void ekk_sched_get_stats(uint32_t core_id, uint32_t *switches, uint32_t *idle_pct)
{
    if (core_id >= EKK_MAX_CORES) {
        core_id = ekk_hal_get_core_id();
    }

    if (switches) *switches = g_sched[core_id].context_switches;
    if (idle_pct) *idle_pct = 0; /* TODO: Calculate idle percentage */
}

void ekk_sched_reset_stats(void)
{
    uint32_t core = ekk_hal_get_core_id();
    g_sched[core].context_switches = 0;
    g_sched[core].idle_time_us = 0;
}

uint32_t ekk_sched_get_utilization(void)
{
    /* TODO: Implement CPU utilization calculation */
    return 0;
}

void ekk_sched_dump_ready(void)
{
    ekk_sched_data_t *sched = get_sched();

    ekk_hal_debug_puts("Ready queue:\n");
    ekk_tcb_t *tcb = (ekk_tcb_t*)sched->ready_head;
    while (tcb) {
        ekk_hal_debug_puts("  ");
        ekk_hal_debug_puts(tcb->name);
        ekk_hal_debug_puts("\n");
        tcb = tcb->next_ready;
    }
}

bool ekk_sched_validate(void)
{
    /* TODO: Validate ready queue integrity */
    return true;
}
