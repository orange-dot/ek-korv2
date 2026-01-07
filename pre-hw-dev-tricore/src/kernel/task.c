/**
 * @file task.c
 * @brief JEZGRO Task Management Implementation
 */

#include "task.h"
#include "scheduler.h"
#include "hal/hal.h"
#include "arch/tricore_cpu.h"
#include "arch/tricore_csa.h"
#include <string.h>

/* ==========================================================================
 * Task Pool
 * ========================================================================== */

/* Per-core task pools */
static tcb_t g_task_pool[JEZGRO_MAX_CORES][JEZGRO_MAX_TASKS_PER_CORE];
static uint32_t g_task_count[JEZGRO_MAX_CORES];

/* Global task ID counter */
static volatile uint32_t g_next_task_id = 1;

/* Stack fill pattern for overflow detection */
#define STACK_FILL_PATTERN  0xDEADBEEF

/* ==========================================================================
 * Internal Helpers
 * ========================================================================== */

/**
 * @brief Allocate TCB from pool
 */
static tcb_t* allocate_tcb(uint32_t core_id)
{
    if (core_id >= JEZGRO_MAX_CORES) {
        return NULL;
    }

    for (uint32_t i = 0; i < JEZGRO_MAX_TASKS_PER_CORE; i++) {
        if (g_task_pool[core_id][i].state == TASK_STATE_INACTIVE) {
            g_task_count[core_id]++;
            return &g_task_pool[core_id][i];
        }
    }

    return NULL;  /* Pool exhausted */
}

/**
 * @brief Free TCB back to pool
 */
static void free_tcb(tcb_t *tcb)
{
    if (tcb == NULL) return;

    uint32_t core_id = tcb->core_id;
    memset(tcb, 0, sizeof(tcb_t));
    tcb->state = TASK_STATE_INACTIVE;

    if (g_task_count[core_id] > 0) {
        g_task_count[core_id]--;
    }
}

/**
 * @brief Fill stack with pattern for overflow detection
 */
static void fill_stack_pattern(void *stack_base, uint32_t size)
{
    uint32_t *ptr = (uint32_t*)stack_base;
    uint32_t words = size / sizeof(uint32_t);

    for (uint32_t i = 0; i < words; i++) {
        ptr[i] = STACK_FILL_PATTERN;
    }
}

/**
 * @brief Task wrapper function
 *
 * Entry point for all tasks. Calls user function and handles cleanup.
 */
static void task_wrapper(void *arg)
{
    tcb_t *tcb = (tcb_t*)arg;

    /* Call actual task function */
    if (tcb->entry_func != NULL) {
        tcb->entry_func(tcb->entry_arg);
    }

    /* Task returned - terminate */
    task_delete(NULL);

    /* Should not reach here */
    while (1) {
        __nop();
    }
}

/* ==========================================================================
 * Initialization
 * ========================================================================== */

jezgro_error_t task_init(void)
{
    /* Initialize all task pools */
    memset(g_task_pool, 0, sizeof(g_task_pool));
    memset(g_task_count, 0, sizeof(g_task_count));

    for (uint32_t core = 0; core < JEZGRO_MAX_CORES; core++) {
        for (uint32_t i = 0; i < JEZGRO_MAX_TASKS_PER_CORE; i++) {
            g_task_pool[core][i].state = TASK_STATE_INACTIVE;
        }
    }

    return JEZGRO_OK;
}

/* ==========================================================================
 * Task Creation
 * ========================================================================== */

jezgro_error_t task_create(const task_params_t *params, task_handle_t *handle)
{
    if (params == NULL || params->func == NULL) {
        return JEZGRO_ERROR_PARAM;
    }

    uint32_t core_id = params->core_affinity;
    if (core_id >= JEZGRO_MAX_CORES) {
        core_id = hal_get_core_id();  /* Default to current core */
    }

    /* Allocate TCB */
    tcb_t *tcb = allocate_tcb(core_id);
    if (tcb == NULL) {
        return JEZGRO_ERROR_NOMEM;
    }

    /* Initialize TCB */
    memset(tcb, 0, sizeof(tcb_t));

    /* Name */
    if (params->name != NULL) {
        strncpy(tcb->name, params->name, JEZGRO_TASK_NAME_LEN - 1);
        tcb->name[JEZGRO_TASK_NAME_LEN - 1] = '\0';
    }

    /* ID */
    hal_enter_critical();
    tcb->id = g_next_task_id++;
    hal_exit_critical();

    tcb->core_id = core_id;
    tcb->flags = params->flags;

    /* Priority */
    tcb->base_priority = params->priority;
    tcb->effective_priority = params->priority;

    /* Timing */
    tcb->period_us = params->period_us;
    tcb->relative_deadline_us = params->deadline_us ? params->deadline_us : params->period_us;
    tcb->deadline = 0;  /* Set on first activation */

    /* Entry point */
    tcb->entry_func = params->func;
    tcb->entry_arg = params->arg;

    /* Stack allocation */
    uint32_t stack_size = params->stack_size;
    if (stack_size < JEZGRO_MIN_STACK_SIZE) {
        stack_size = JEZGRO_DEFAULT_STACK_SIZE;
    }

    if (params->stack_base != NULL) {
        /* Use pre-allocated stack */
        tcb->stack_base = params->stack_base;
    }
    else {
        /* Allocate from shared memory */
        /* For TC397XP, we should allocate from per-core DSPR */
        /* TODO: Proper per-core stack allocation */
        /* For now, use multicore_alloc_shared */
        extern void* multicore_alloc_shared(uint32_t size, uint32_t align);
        tcb->stack_base = multicore_alloc_shared(stack_size, 64);
        if (tcb->stack_base == NULL) {
            free_tcb(tcb);
            return JEZGRO_ERROR_NOMEM;
        }
    }

    tcb->stack_size = stack_size;
    tcb->stack_top = (void*)((uint32_t)tcb->stack_base + stack_size);

    /* Fill stack with pattern for overflow detection */
    fill_stack_pattern(tcb->stack_base, stack_size);

    /* Create CSA context */
    uint32_t pcxi = csa_create_task_context(
        (uint32_t)tcb->stack_top,
        task_wrapper,
        tcb
    );

    if (pcxi == 0) {
        free_tcb(tcb);
        return JEZGRO_ERROR_NOMEM;
    }

    tcb->context_pcxi = pcxi;

    /* Initialize state */
    tcb->state = TASK_STATE_READY;

    /* Add to scheduler */
    scheduler_ready((task_handle_t)tcb);

    if (handle != NULL) {
        *handle = (task_handle_t)tcb;
    }

    return JEZGRO_OK;
}

jezgro_error_t task_delete(task_handle_t handle)
{
    tcb_t *tcb;

    if (handle == NULL) {
        tcb = (tcb_t*)task_get_current();
    }
    else {
        tcb = (tcb_t*)handle;
    }

    if (tcb == NULL || tcb->state == TASK_STATE_INACTIVE) {
        return JEZGRO_ERROR_NOTASK;
    }

    hal_enter_critical();

    /* Remove from scheduler queues */
    scheduler_unready((task_handle_t)tcb);

    /* Free CSA context */
    if (tcb->context_pcxi != 0) {
        csa_free_chain(tcb->context_pcxi);
    }

    /* Mark as terminated */
    tcb->state = TASK_STATE_TERMINATED;

    /* If deleting current task, must switch */
    if ((task_handle_t)tcb == task_get_current()) {
        tcb->state = TASK_STATE_INACTIVE;
        free_tcb(tcb);
        hal_exit_critical();
        scheduler_yield();
        /* Never returns */
    }
    else {
        tcb->state = TASK_STATE_INACTIVE;
        free_tcb(tcb);
        hal_exit_critical();
    }

    return JEZGRO_OK;
}

/* ==========================================================================
 * Task State Management
 * ========================================================================== */

jezgro_error_t task_suspend(task_handle_t handle)
{
    tcb_t *tcb;

    if (handle == NULL) {
        tcb = (tcb_t*)task_get_current();
    }
    else {
        tcb = (tcb_t*)handle;
    }

    if (tcb == NULL || tcb->state == TASK_STATE_INACTIVE) {
        return JEZGRO_ERROR_NOTASK;
    }

    hal_enter_critical();

    /* Remove from ready queue */
    scheduler_unready((task_handle_t)tcb);

    tcb->state = TASK_STATE_SUSPENDED;

    /* If suspending self, yield */
    if ((task_handle_t)tcb == task_get_current()) {
        hal_exit_critical();
        scheduler_yield();
    }
    else {
        hal_exit_critical();
    }

    return JEZGRO_OK;
}

jezgro_error_t task_resume(task_handle_t handle)
{
    tcb_t *tcb = (tcb_t*)handle;

    if (tcb == NULL || tcb->state == TASK_STATE_INACTIVE) {
        return JEZGRO_ERROR_NOTASK;
    }

    if (tcb->state != TASK_STATE_SUSPENDED) {
        return JEZGRO_ERROR_STATE;
    }

    /* Add back to scheduler */
    scheduler_ready(handle);

    return JEZGRO_OK;
}

task_handle_t task_get_current(void)
{
    return scheduler_get_current();
}

task_handle_t task_get_by_id(uint32_t task_id)
{
    for (uint32_t core = 0; core < JEZGRO_MAX_CORES; core++) {
        for (uint32_t i = 0; i < JEZGRO_MAX_TASKS_PER_CORE; i++) {
            if (g_task_pool[core][i].state != TASK_STATE_INACTIVE &&
                g_task_pool[core][i].id == task_id) {
                return (task_handle_t)&g_task_pool[core][i];
            }
        }
    }
    return NULL;
}

task_handle_t task_get_by_name(const char *name)
{
    if (name == NULL) return NULL;

    for (uint32_t core = 0; core < JEZGRO_MAX_CORES; core++) {
        for (uint32_t i = 0; i < JEZGRO_MAX_TASKS_PER_CORE; i++) {
            if (g_task_pool[core][i].state != TASK_STATE_INACTIVE &&
                strcmp(g_task_pool[core][i].name, name) == 0) {
                return (task_handle_t)&g_task_pool[core][i];
            }
        }
    }
    return NULL;
}

/* ==========================================================================
 * Task Properties
 * ========================================================================== */

const char* task_get_name(task_handle_t handle)
{
    tcb_t *tcb = (tcb_t*)handle;
    return tcb ? tcb->name : NULL;
}

task_state_t task_get_state(task_handle_t handle)
{
    tcb_t *tcb = (tcb_t*)handle;
    return tcb ? tcb->state : TASK_STATE_INACTIVE;
}

uint8_t task_get_priority(task_handle_t handle)
{
    tcb_t *tcb = (tcb_t*)handle;
    return tcb ? tcb->effective_priority : 0;
}

jezgro_error_t task_set_priority(task_handle_t handle, uint8_t priority)
{
    tcb_t *tcb = (tcb_t*)handle;

    if (tcb == NULL) {
        return JEZGRO_ERROR_PARAM;
    }

    hal_enter_critical();

    tcb->base_priority = priority;
    tcb->effective_priority = priority;

    /* Re-sort in ready queue */
    if (tcb->state == TASK_STATE_READY) {
        scheduler_unready(handle);
        scheduler_ready(handle);
    }

    hal_exit_critical();

    return JEZGRO_OK;
}

uint32_t task_get_core(task_handle_t handle)
{
    tcb_t *tcb = (tcb_t*)handle;
    return tcb ? tcb->core_id : 0;
}

jezgro_error_t task_get_stats(task_handle_t handle, task_stats_t *stats)
{
    tcb_t *tcb = (tcb_t*)handle;

    if (tcb == NULL || stats == NULL) {
        return JEZGRO_ERROR_PARAM;
    }

    stats->run_count = tcb->run_count;
    stats->total_time_us = tcb->total_run_time;
    stats->max_exec_time_us = tcb->max_run_time;
    stats->deadlines_missed = tcb->deadlines_missed;
    stats->preemptions = 0;  /* TODO: track preemptions */

    return JEZGRO_OK;
}

/* ==========================================================================
 * Task Timing
 * ========================================================================== */

void task_yield(void)
{
    scheduler_yield();
}

void task_delay(jezgro_ticks_t ticks)
{
    scheduler_delay(ticks);
}

void task_delay_ms(jezgro_time_ms_t ms)
{
    jezgro_ticks_t ticks = jezgro_ms_to_ticks(ms);
    scheduler_delay(ticks);
}

void task_delay_until(jezgro_ticks_t *prev_wake, jezgro_ticks_t period)
{
    scheduler_delay_until(prev_wake, period);
}

/* ==========================================================================
 * Periodic Tasks
 * ========================================================================== */

void task_wait_for_period(void)
{
    tcb_t *tcb = (tcb_t*)task_get_current();

    if (tcb == NULL || tcb->period_us == 0) {
        return;  /* Not a periodic task */
    }

    /* Calculate next deadline */
    uint32_t now = hal_get_time_us();
    tcb->deadline = now + tcb->relative_deadline_us;

    /* Wait for next period */
    jezgro_ticks_t period_ticks = tcb->period_us / JEZGRO_TICK_PERIOD_US;
    scheduler_delay(period_ticks);
}

bool task_deadline_met(void)
{
    tcb_t *tcb = (tcb_t*)task_get_current();
    if (tcb == NULL) return true;

    return tcb->deadlines_missed == 0;
}

uint32_t task_get_slack(void)
{
    tcb_t *tcb = (tcb_t*)task_get_current();
    if (tcb == NULL || tcb->deadline == 0) return 0;

    uint32_t now = hal_get_time_us();
    if (now >= tcb->deadline) {
        return 0;  /* Deadline passed */
    }

    return tcb->deadline - now;
}

/* ==========================================================================
 * Task Notifications
 * ========================================================================== */

/* Notification value stored in TCB (reusing blocked_reason field) */

uint32_t task_notify_wait(bool clear_on_exit, jezgro_ticks_t timeout)
{
    tcb_t *tcb = (tcb_t*)task_get_current();
    if (tcb == NULL) return 0;

    hal_enter_critical();

    /* Check if already notified */
    if (tcb->blocked_reason != 0) {
        uint32_t value = tcb->blocked_reason;
        if (clear_on_exit) {
            tcb->blocked_reason = 0;
        }
        hal_exit_critical();
        return value;
    }

    /* Block waiting for notification */
    tcb->state = TASK_STATE_BLOCKED;
    tcb->blocked_on = tcb;  /* Marker for notification wait */

    hal_exit_critical();

    jezgro_error_t result = scheduler_block(timeout);

    hal_enter_critical();
    uint32_t value = tcb->blocked_reason;
    if (clear_on_exit) {
        tcb->blocked_reason = 0;
    }
    tcb->blocked_on = NULL;
    hal_exit_critical();

    if (result == JEZGRO_ERROR_TIMEOUT) {
        return 0;
    }

    return value;
}

jezgro_error_t task_notify(task_handle_t handle, uint32_t value)
{
    tcb_t *tcb = (tcb_t*)handle;

    if (tcb == NULL) {
        return JEZGRO_ERROR_PARAM;
    }

    hal_enter_critical();

    tcb->blocked_reason = value;

    /* Wake if waiting on notification */
    if (tcb->state == TASK_STATE_BLOCKED && tcb->blocked_on == tcb) {
        scheduler_unblock(handle);
    }

    hal_exit_critical();

    return JEZGRO_OK;
}

jezgro_error_t task_notify_give(task_handle_t handle)
{
    return task_notify(handle, 1);
}

jezgro_error_t task_notify_take(jezgro_ticks_t timeout)
{
    uint32_t value = task_notify_wait(true, timeout);
    return value > 0 ? JEZGRO_OK : JEZGRO_ERROR_TIMEOUT;
}

/* ==========================================================================
 * Stack Management
 * ========================================================================== */

uint32_t task_get_stack_high_water(task_handle_t handle)
{
    tcb_t *tcb = (tcb_t*)handle;
    if (tcb == NULL) return 0;

    /* Scan from bottom for first non-pattern word */
    uint32_t *ptr = (uint32_t*)tcb->stack_base;
    uint32_t words = tcb->stack_size / sizeof(uint32_t);
    uint32_t used = 0;

    for (uint32_t i = 0; i < words; i++) {
        if (ptr[i] != STACK_FILL_PATTERN) {
            used = (words - i) * sizeof(uint32_t);
            break;
        }
    }

    return tcb->stack_size - used;  /* Free space */
}

bool task_check_stack(task_handle_t handle)
{
    tcb_t *tcb = (tcb_t*)handle;
    if (tcb == NULL) return false;

    /* Check bottom guard word */
    uint32_t *bottom = (uint32_t*)tcb->stack_base;
    return *bottom == STACK_FILL_PATTERN;
}

/* ==========================================================================
 * Idle Task
 * ========================================================================== */

static void idle_task_func(void *arg)
{
    (void)arg;

    while (1) {
        task_idle_hook();
        hal_idle();
    }
}

jezgro_error_t task_create_idle(void)
{
    uint32_t core = hal_get_core_id();

    task_params_t params = JEZGRO_TASK_PARAMS_DEFAULT;
    params.name = "idle";
    params.func = idle_task_func;
    params.priority = JEZGRO_PRIORITY_IDLE;
    params.stack_size = JEZGRO_MIN_STACK_SIZE;
    params.core_affinity = core;

    task_handle_t handle;
    jezgro_error_t result = task_create(&params, &handle);

    if (result == JEZGRO_OK) {
        /* Register with scheduler */
        extern void scheduler_set_idle_task(task_handle_t task);
        scheduler_set_idle_task(handle);
    }

    return result;
}

__attribute__((weak))
void task_idle_hook(void)
{
    /* Default: do nothing */
    /* Override for power management */
}

/* ==========================================================================
 * Internal Functions
 * ========================================================================== */

tcb_t* task_get_tcb(task_handle_t handle)
{
    return (tcb_t*)handle;
}
