/**
 * @file hal_sim.c
 * @brief ek-kor HAL - Simulation Implementation (PC)
 *
 * This HAL implementation runs on a host PC for testing
 * without actual hardware.
 */

#include <ek-kor/hal.h>
#include <ek-kor/config.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#ifdef _WIN32
#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <windows.h>
#include <intrin.h>
#else
#include <unistd.h>
#include <sys/time.h>
#endif

/* ==========================================================================
 * Private Data
 * ========================================================================== */

static uint64_t g_start_time_us = 0;
static volatile uint32_t g_tick_count = 0;
static volatile uint32_t g_critical_nesting = 0;
static volatile uint32_t g_interrupt_state = 1;
static ekk_hal_systick_cb_t g_tick_callback = NULL;

/* ==========================================================================
 * Helper Functions
 * ========================================================================== */

static uint64_t get_realtime_us(void)
{
#ifdef _WIN32
    LARGE_INTEGER freq, count;
    QueryPerformanceFrequency(&freq);
    QueryPerformanceCounter(&count);
    return (uint64_t)(count.QuadPart * 1000000 / freq.QuadPart);
#else
    struct timeval tv;
    gettimeofday(&tv, NULL);
    return (uint64_t)tv.tv_sec * 1000000 + tv.tv_usec;
#endif
}

/* ==========================================================================
 * Initialization
 * ========================================================================== */

int ekk_hal_init(void)
{
    printf("[EK-KOR HAL-SIM] Initializing simulation HAL\n");
    g_start_time_us = get_realtime_us();
    g_tick_count = 0;
    g_critical_nesting = 0;
    g_interrupt_state = 1;
    printf("[EK-KOR HAL-SIM] HAL initialized\n");
    return 0;
}

int ekk_hal_init_core(uint32_t core_id)
{
    (void)core_id;
    return 0;
}

/* ==========================================================================
 * Core Identification
 * ========================================================================== */

uint32_t ekk_hal_get_core_id(void)
{
    return 0;
}

uint32_t ekk_hal_get_core_count(void)
{
    return 1;
}

bool ekk_hal_is_boot_core(void)
{
    return true;
}

/* ==========================================================================
 * Interrupt Control
 * ========================================================================== */

uint32_t ekk_hal_disable_interrupts(void)
{
    uint32_t prev = g_interrupt_state;
    g_interrupt_state = 0;
    return prev;
}

void ekk_hal_enable_interrupts(void)
{
    g_interrupt_state = 1;
}

void ekk_hal_restore_interrupts(uint32_t state)
{
    g_interrupt_state = state;
}

bool ekk_hal_interrupts_enabled(void)
{
    return g_interrupt_state != 0;
}

/* ==========================================================================
 * Critical Sections
 * ========================================================================== */

uint32_t ekk_hal_enter_critical(void)
{
    ekk_hal_disable_interrupts();
    return ++g_critical_nesting;
}

uint32_t ekk_hal_exit_critical(void)
{
    if (g_critical_nesting > 0) {
        g_critical_nesting--;
    }
    if (g_critical_nesting == 0) {
        ekk_hal_enable_interrupts();
    }
    return g_critical_nesting;
}

bool ekk_hal_in_critical(void)
{
    return g_critical_nesting > 0;
}

/* ==========================================================================
 * Time Functions
 * ========================================================================== */

uint32_t ekk_hal_get_time_us(void)
{
    return (uint32_t)(get_realtime_us() - g_start_time_us);
}

uint32_t ekk_hal_get_time_ms(void)
{
    return ekk_hal_get_time_us() / 1000;
}

uint64_t ekk_hal_get_time_us64(void)
{
    return get_realtime_us() - g_start_time_us;
}

void ekk_hal_delay_us(uint32_t us)
{
#ifdef _WIN32
    if (us >= 1000) {
        Sleep(us / 1000);
    }
#else
    usleep(us);
#endif
}

void ekk_hal_delay_ms(uint32_t ms)
{
#ifdef _WIN32
    Sleep(ms);
#else
    usleep(ms * 1000);
#endif
}

/* ==========================================================================
 * System Tick
 * ========================================================================== */

int ekk_hal_systick_init(ekk_hal_systick_cb_t callback)
{
    g_tick_callback = callback;
    printf("[EK-KOR HAL-SIM] SysTick initialized at %d Hz\n", EKK_TICK_FREQ_HZ);
    return 0;
}

uint32_t ekk_hal_get_tick_count(void)
{
    return g_tick_count;
}

uint32_t ekk_hal_get_tick_period_us(void)
{
    return EKK_TICK_PERIOD_US;
}

/* Call this periodically from main loop in simulation */
void ekk_hal_sim_tick(void)
{
    g_tick_count++;
    if (g_tick_callback) {
        g_tick_callback();
    }
}

/* ==========================================================================
 * Context Switching
 * ========================================================================== */

void ekk_hal_trigger_context_switch(void)
{
    /* In simulation, context switch is handled by scheduler */
}

void ekk_hal_start_first_task(void *stack_ptr, void (*entry)(void))
{
    (void)stack_ptr;
    printf("[EK-KOR HAL-SIM] Starting first task\n");
    if (entry) {
        entry();
    }
}

void ekk_hal_context_switch(void **current_sp, void *next_sp)
{
    (void)current_sp;
    (void)next_sp;
    /* In simulation, context switch is a no-op */
}

/* ==========================================================================
 * Memory Barriers
 * ========================================================================== */

void ekk_hal_memory_barrier(void)
{
#if defined(__GNUC__)
    __asm__ __volatile__ ("" ::: "memory");
#elif defined(_MSC_VER)
    _ReadWriteBarrier();
#endif
}

void ekk_hal_instruction_barrier(void)
{
    ekk_hal_memory_barrier();
}

void ekk_hal_data_sync_barrier(void)
{
    ekk_hal_memory_barrier();
}

/* ==========================================================================
 * Idle / Sleep
 * ========================================================================== */

void ekk_hal_idle(void)
{
    ekk_hal_delay_ms(1);
}

void ekk_hal_sleep(uint32_t mode)
{
    (void)mode;
    ekk_hal_delay_ms(10);
}

/* ==========================================================================
 * Debug Support
 * ========================================================================== */

void ekk_hal_debug_break(void)
{
#if defined(_MSC_VER)
    __debugbreak();
#elif defined(__GNUC__)
    __builtin_trap();
#endif
}

void ekk_hal_debug_putc(char c)
{
    putchar(c);
    fflush(stdout);
}

void ekk_hal_debug_puts(const char *s)
{
    if (s) {
        printf("%s", s);
        fflush(stdout);
    }
}

void ekk_hal_debug_hex(uint32_t value)
{
    printf("0x%08X", value);
    fflush(stdout);
}

/* ==========================================================================
 * Watchdog
 * ========================================================================== */

int ekk_hal_watchdog_init(uint32_t timeout_ms)
{
    printf("[EK-KOR HAL-SIM] Watchdog initialized: %u ms\n", timeout_ms);
    return 0;
}

void ekk_hal_watchdog_reset(void)
{
    /* No-op in simulation */
}

void ekk_hal_watchdog_disable(void)
{
    printf("[EK-KOR HAL-SIM] Watchdog disabled\n");
}

/* ==========================================================================
 * System Reset
 * ========================================================================== */

void ekk_hal_system_reset(void)
{
    printf("[EK-KOR HAL-SIM] System reset requested\n");
    exit(0);
}

uint32_t ekk_hal_get_reset_reason(void)
{
    return 0;
}

/* ==========================================================================
 * Stack Checking
 * ========================================================================== */

void* ekk_hal_get_stack_ptr(void)
{
    volatile int dummy;
    return (void*)&dummy;
}

bool ekk_hal_check_stack(void *stack_bottom, uint32_t stack_size)
{
    (void)stack_bottom;
    (void)stack_size;
    return true;
}
