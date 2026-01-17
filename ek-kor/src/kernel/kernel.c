/**
 * @file kernel.c
 * @brief ek-kor Kernel Core Implementation
 */

#include <ek-kor/ek-kor.h>
#include <string.h>

/* ==========================================================================
 * Global State
 * ========================================================================== */

static ekk_state_t g_kernel_state = EKK_STATE_INIT;
static ekk_stats_t g_stats;

/* ==========================================================================
 * Kernel Initialization
 * ========================================================================== */

ekk_err_t ekk_init(void)
{
    /* Initialize HAL */
    if (ekk_hal_init() != 0) {
        return EKK_ERROR;
    }

    /* Initialize subsystems */
    ekk_err_t err;

    err = ekk_task_init();
    if (err != EKK_OK) return err;

    err = ekk_sched_init();
    if (err != EKK_OK) return err;

    /* Clear statistics */
    memset(&g_stats, 0, sizeof(g_stats));

    g_kernel_state = EKK_STATE_INIT;
    return EKK_OK;
}

void ekk_start(void)
{
    g_kernel_state = EKK_STATE_RUNNING;
    ekk_sched_start();
    /* Never returns */
}

/* ==========================================================================
 * Kernel Information
 * ========================================================================== */

const char* ekk_version(void)
{
    return EKK_VERSION_STRING;
}

ekk_state_t ekk_get_state(void)
{
    return g_kernel_state;
}

ekk_tick_t ekk_get_ticks(void)
{
    return ekk_sched_get_ticks();
}

ekk_time_us_t ekk_get_time_us(void)
{
    return ekk_hal_get_time_us();
}

ekk_err_t ekk_get_stats(ekk_stats_t *stats)
{
    if (!stats) return EKK_ERR_PARAM;

    g_stats.uptime_ms = ekk_hal_get_time_ms();
    *stats = g_stats;
    return EKK_OK;
}

/* ==========================================================================
 * Time Conversions
 * ========================================================================== */

ekk_time_ms_t ekk_ticks_to_ms(ekk_tick_t ticks)
{
    return (ekk_time_ms_t)((ticks * 1000) / EKK_TICK_FREQ_HZ);
}

ekk_tick_t ekk_ms_to_ticks(ekk_time_ms_t ms)
{
    return (ekk_tick_t)((ms * EKK_TICK_FREQ_HZ) / 1000);
}

ekk_tick_t ekk_us_to_ticks(ekk_time_us_t us)
{
    return (ekk_tick_t)((us * EKK_TICK_FREQ_HZ + 999999) / 1000000);
}

/* ==========================================================================
 * Critical Sections
 * ========================================================================== */

static volatile uint32_t g_isr_nesting = 0;

bool ekk_in_isr(void)
{
    return g_isr_nesting > 0;
}

void ekk_enter_critical(void)
{
    ekk_hal_enter_critical();
}

void ekk_exit_critical(void)
{
    ekk_hal_exit_critical();
}

/* ==========================================================================
 * Error Handling
 * ========================================================================== */

void ekk_panic(const char *msg)
{
    ekk_hal_disable_interrupts();
    g_kernel_state = EKK_STATE_PANIC;

    ekk_hal_debug_puts("\n!!! EK-KOR PANIC: ");
    ekk_hal_debug_puts(msg);
    ekk_hal_debug_puts(" !!!\n");

    /* Halt */
    for (;;) {
        ekk_hal_debug_break();
    }
}

EKK_WEAK void ekk_deadline_miss_hook(ekk_task_t task, uint32_t overrun)
{
    (void)task;
    (void)overrun;
    g_stats.deadline_misses++;
}

EKK_WEAK void ekk_stack_overflow_hook(ekk_task_t task)
{
    (void)task;
    ekk_panic("Stack overflow");
}
