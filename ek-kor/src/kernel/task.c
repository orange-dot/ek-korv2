/**
 * @file task.c
 * @brief ek-kor Task Management Implementation
 */

#include <ek-kor/ek-kor.h>
#include <string.h>
#include <stdio.h>

/* MSVC snprintf compatibility */
#if defined(_MSC_VER) && _MSC_VER < 1900
    #define snprintf _snprintf
#endif

/* ==========================================================================
 * Task Pool
 * ========================================================================== */

static ekk_tcb_t g_task_pool[EKK_MAX_TASKS];
static uint32_t g_task_count = 0;
static uint32_t g_next_task_id = 1;

/* ==========================================================================
 * Initialization
 * ========================================================================== */

ekk_err_t ekk_task_init(void)
{
    memset(g_task_pool, 0, sizeof(g_task_pool));
    g_task_count = 0;
    g_next_task_id = 1;
    return EKK_OK;
}

/* ==========================================================================
 * Task Creation / Deletion
 * ========================================================================== */

ekk_err_t ekk_task_create(const ekk_task_params_t *params, ekk_task_t *handle)
{
    if (!params || !params->func || !handle) {
        return EKK_ERR_PARAM;
    }

    /* Find free TCB slot */
    ekk_tcb_t *tcb = NULL;
    for (uint32_t i = 0; i < EKK_MAX_TASKS; i++) {
        if (g_task_pool[i].state == EKK_TASK_INACTIVE) {
            tcb = &g_task_pool[i];
            break;
        }
    }

    if (!tcb) {
        return EKK_ERR_NOMEM;
    }

    /* Initialize TCB */
    memset(tcb, 0, sizeof(ekk_tcb_t));

    /* Copy name */
    if (params->name) {
        strncpy(tcb->name, params->name, sizeof(tcb->name) - 1);
    } else {
        snprintf(tcb->name, sizeof(tcb->name), "task%u", g_next_task_id);
    }

    tcb->id = g_next_task_id++;
    tcb->core_id = params->core_affinity;
    tcb->state = EKK_TASK_READY;
    tcb->flags = params->flags;
    tcb->base_priority = params->priority;
    tcb->effective_priority = params->priority;
    tcb->period_us = params->period_us;
    tcb->relative_deadline_us = params->deadline_us ? params->deadline_us : params->period_us;
    tcb->entry_func = params->func;
    tcb->entry_arg = params->arg;

    /* Allocate stack */
    uint32_t stack_size = params->stack_size ? params->stack_size : EKK_DEFAULT_STACK_SIZE;
    if (stack_size < EKK_MIN_STACK_SIZE) {
        stack_size = EKK_MIN_STACK_SIZE;
    }

    if (params->stack_base) {
        tcb->stack_base = params->stack_base;
    } else {
        /* Static allocation from pool - simplified */
        static uint8_t stack_pool[EKK_MAX_TASKS][EKK_DEFAULT_STACK_SIZE];
        static uint32_t stack_idx = 0;
        if (stack_idx < EKK_MAX_TASKS) {
            tcb->stack_base = stack_pool[stack_idx++];
        } else {
            return EKK_ERR_NOMEM;
        }
    }

    tcb->stack_size = stack_size;
    tcb->stack_top = (uint8_t*)tcb->stack_base + stack_size;

    /* Add to scheduler */
    ekk_sched_ready((ekk_task_t)tcb);

    g_task_count++;
    *handle = (ekk_task_t)tcb;

    return EKK_OK;
}

ekk_err_t ekk_task_delete(ekk_task_t handle)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(handle);
    if (!tcb) return EKK_ERR_PARAM;

    ekk_hal_enter_critical();

    /* Remove from any queues */
    if (tcb->state == EKK_TASK_READY) {
        ekk_sched_unready(handle);
    }

    tcb->state = EKK_TASK_TERMINATED;
    g_task_count--;

    ekk_hal_exit_critical();

    return EKK_OK;
}

ekk_err_t ekk_task_suspend(ekk_task_t handle)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(handle);
    if (!tcb) {
        tcb = ekk_task_get_tcb(ekk_sched_get_current());
    }
    if (!tcb) return EKK_ERR_PARAM;

    ekk_hal_enter_critical();

    if (tcb->state == EKK_TASK_READY) {
        ekk_sched_unready((ekk_task_t)tcb);
    }
    tcb->state = EKK_TASK_SUSPENDED;

    ekk_hal_exit_critical();

    if ((ekk_task_t)tcb == ekk_sched_get_current()) {
        ekk_sched_switch_request();
    }

    return EKK_OK;
}

ekk_err_t ekk_task_resume(ekk_task_t handle)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(handle);
    if (!tcb) return EKK_ERR_PARAM;

    ekk_hal_enter_critical();

    if (tcb->state == EKK_TASK_SUSPENDED) {
        ekk_sched_ready(handle);
    }

    ekk_hal_exit_critical();

    return EKK_OK;
}

/* ==========================================================================
 * Task Query
 * ========================================================================== */

ekk_task_t ekk_task_get_current(void)
{
    return ekk_sched_get_current();
}

ekk_task_t ekk_task_get_by_id(uint32_t task_id)
{
    for (uint32_t i = 0; i < EKK_MAX_TASKS; i++) {
        if (g_task_pool[i].id == task_id &&
            g_task_pool[i].state != EKK_TASK_INACTIVE) {
            return (ekk_task_t)&g_task_pool[i];
        }
    }
    return NULL;
}

ekk_task_t ekk_task_get_by_name(const char *name)
{
    if (!name) return NULL;

    for (uint32_t i = 0; i < EKK_MAX_TASKS; i++) {
        if (g_task_pool[i].state != EKK_TASK_INACTIVE &&
            strcmp(g_task_pool[i].name, name) == 0) {
            return (ekk_task_t)&g_task_pool[i];
        }
    }
    return NULL;
}

/* ==========================================================================
 * Task Properties
 * ========================================================================== */

const char* ekk_task_get_name(ekk_task_t handle)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(handle);
    return tcb ? tcb->name : NULL;
}

ekk_task_state_t ekk_task_get_state(ekk_task_t handle)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(handle);
    return tcb ? tcb->state : EKK_TASK_INACTIVE;
}

uint8_t ekk_task_get_priority(ekk_task_t handle)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(handle);
    return tcb ? tcb->effective_priority : 0;
}

ekk_err_t ekk_task_set_priority(ekk_task_t handle, uint8_t priority)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(handle);
    if (!tcb) return EKK_ERR_PARAM;

    ekk_hal_enter_critical();
    tcb->base_priority = priority;
    tcb->effective_priority = priority;
    ekk_hal_exit_critical();

    return EKK_OK;
}

uint32_t ekk_task_get_core(ekk_task_t handle)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(handle);
    return tcb ? tcb->core_id : 0;
}

ekk_err_t ekk_task_get_stats(ekk_task_t handle, ekk_task_stats_t *stats)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(handle);
    if (!tcb || !stats) return EKK_ERR_PARAM;

    stats->run_count = tcb->run_count;
    stats->total_time_us = tcb->total_run_time;
    stats->max_exec_time_us = tcb->max_run_time;
    stats->deadlines_missed = tcb->deadlines_missed;
    stats->preemptions = 0; /* TODO */

    return EKK_OK;
}

/* ==========================================================================
 * Task Timing
 * ========================================================================== */

void ekk_task_yield(void)
{
    ekk_sched_yield();
}

void ekk_task_delay(ekk_tick_t ticks)
{
    ekk_sched_delay(ticks);
}

void ekk_task_delay_ms(ekk_time_ms_t ms)
{
    ekk_sched_delay(ekk_ms_to_ticks(ms));
}

void ekk_task_delay_until(ekk_tick_t *prev_wake, ekk_tick_t period)
{
    ekk_sched_delay_until(prev_wake, period);
}

void ekk_task_wait_for_period(void)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(ekk_sched_get_current());
    if (tcb && tcb->period_us > 0) {
        ekk_tick_t period_ticks = ekk_us_to_ticks(tcb->period_us);
        static ekk_tick_t prev = 0;
        if (prev == 0) prev = ekk_sched_get_ticks();
        ekk_task_delay_until(&prev, period_ticks);
    }
}

bool ekk_task_deadline_met(void)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(ekk_sched_get_current());
    if (!tcb || tcb->deadline == 0) return true;
    return ekk_hal_get_time_us() <= tcb->deadline;
}

uint32_t ekk_task_get_slack(void)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(ekk_sched_get_current());
    if (!tcb || tcb->deadline == 0) return 0;

    ekk_time_us_t now = ekk_hal_get_time_us();
    if (now >= tcb->deadline) return 0;
    return tcb->deadline - now;
}

/* ==========================================================================
 * Task Notifications (stub)
 * ========================================================================== */

uint32_t ekk_task_notify_wait(bool clear_on_exit, ekk_tick_t timeout)
{
    (void)clear_on_exit;
    (void)timeout;
    return 0; /* TODO */
}

ekk_err_t ekk_task_notify(ekk_task_t handle, uint32_t value)
{
    (void)handle;
    (void)value;
    return EKK_OK; /* TODO */
}

ekk_err_t ekk_task_notify_give(ekk_task_t handle)
{
    return ekk_task_notify(handle, 1);
}

ekk_err_t ekk_task_notify_take(ekk_tick_t timeout)
{
    return ekk_task_notify_wait(true, timeout) ? EKK_OK : EKK_ERR_TIMEOUT;
}

/* ==========================================================================
 * Stack Management
 * ========================================================================== */

uint32_t ekk_task_get_stack_high_water(ekk_task_t handle)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(handle);
    if (!tcb) return 0;

    /* Check for stack pattern (assuming 0xDEADBEEF fill) */
    uint32_t *p = (uint32_t*)tcb->stack_base;
    uint32_t free_words = 0;
    while ((void*)p < tcb->stack_top && *p == 0xDEADBEEF) {
        free_words++;
        p++;
    }
    return free_words * sizeof(uint32_t);
}

bool ekk_task_check_stack(ekk_task_t handle)
{
    ekk_tcb_t *tcb = ekk_task_get_tcb(handle);
    if (!tcb) return false;
    return ekk_hal_check_stack(tcb->stack_base, tcb->stack_size);
}

/* ==========================================================================
 * Idle Task
 * ========================================================================== */

static void idle_task_func(void *arg)
{
    (void)arg;
    for (;;) {
        ekk_task_idle_hook();
        ekk_hal_idle();
    }
}

ekk_err_t ekk_task_create_idle(void)
{
    ekk_task_params_t params = EKK_TASK_PARAMS_DEFAULT;
    params.name = "idle";
    params.func = idle_task_func;
    params.priority = EKK_PRIORITY_IDLE;
    params.stack_size = EKK_MIN_STACK_SIZE;

    ekk_task_t handle;
    return ekk_task_create(&params, &handle);
}

EKK_WEAK void ekk_task_idle_hook(void)
{
    /* Default: do nothing */
}

/* ==========================================================================
 * Internal
 * ========================================================================== */

ekk_tcb_t* ekk_task_get_tcb(ekk_task_t handle)
{
    return (ekk_tcb_t*)handle;
}
