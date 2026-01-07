/**
 * @file hal_tc397xp.c
 * @brief ek-kor HAL Implementation for TC397XP
 *
 * Implements HAL interface for Infineon AURIX TC397XP.
 */

#define HAL_TC397XP  /* Enable TC397XP extensions */

#include <ek-kor/hal.h>
#include <ek-kor/config.h>
#include "tc397xp_regs.h"
#include "tc397xp_sfr.h"
#include "tricore_intrinsics.h"
#include "arch/tricore_cpu.h"
#include "arch/tricore_csa.h"
#include "arch/tricore_irq.h"

#include <string.h>

/* ==========================================================================
 * External Functions
 * ========================================================================== */

extern uint32_t get_system_clock(void);
extern uint32_t get_stm_clock(void);
extern void system_reset(void);
extern uint32_t get_reset_reason(void);

/* ==========================================================================
 * Per-Core State
 * ========================================================================== */

/* Per-core critical section nesting */
static volatile uint32_t g_critical_nesting[EKK_MAX_CORES];

/* Per-core tick counts */
static volatile uint32_t g_tick_count[EKK_MAX_CORES];

/* Systick callbacks per core */
static ekk_hal_systick_cb_t g_systick_callbacks[EKK_MAX_CORES];

/* STM clock frequency (cached) */
static uint32_t g_stm_clock_hz;

/* ==========================================================================
 * Initialization
 * ========================================================================== */

int ekk_hal_init(void)
{
    /* Only CPU0 should call this */
    if (ekk_hal_get_core_id() != 0) {
        return -1;
    }

    /* Cache STM clock frequency */
    g_stm_clock_hz = get_stm_clock();
    if (g_stm_clock_hz == 0) {
        g_stm_clock_hz = 100000000;  /* Default 100 MHz */
    }

    /* Initialize per-core state */
    memset((void*)g_critical_nesting, 0, sizeof(g_critical_nesting));
    memset((void*)g_tick_count, 0, sizeof(g_tick_count));
    memset((void*)g_systick_callbacks, 0, sizeof(g_systick_callbacks));

    /* STM modules are always running on TC397XP */
    /* No specific initialization needed */

    return 0;
}

int ekk_hal_init_core(uint32_t core_id)
{
    if (core_id >= EKK_MAX_CORES) {
        return -1;
    }

    g_critical_nesting[core_id] = 0;
    g_tick_count[core_id] = 0;
    g_systick_callbacks[core_id] = NULL;

    return 0;
}

/* ==========================================================================
 * Core Identification
 * ========================================================================== */

uint32_t ekk_hal_get_core_id(void)
{
    return cpu_get_id();
}

uint32_t ekk_hal_get_core_count(void)
{
    return CPU_COUNT;
}

bool ekk_hal_is_boot_core(void)
{
    return cpu_get_id() == CPU0;
}

/* ==========================================================================
 * Interrupt Control
 * ========================================================================== */

uint32_t ekk_hal_disable_interrupts(void)
{
    uint32_t icr = __mfcr(CSFR_ICR);
    __disable();
    return icr;
}

void ekk_hal_enable_interrupts(void)
{
    __enable();
}

void ekk_hal_restore_interrupts(uint32_t state)
{
    if (state & ICR_IE) {
        __enable();
    }
}

bool ekk_hal_interrupts_enabled(void)
{
    return cpu_interrupts_enabled();
}

/* ==========================================================================
 * Critical Sections
 * ========================================================================== */

uint32_t ekk_hal_enter_critical(void)
{
    uint32_t core_id = ekk_hal_get_core_id();

    __disable();

    uint32_t nesting = ++g_critical_nesting[core_id];

    return nesting;
}

uint32_t ekk_hal_exit_critical(void)
{
    uint32_t core_id = ekk_hal_get_core_id();

    if (g_critical_nesting[core_id] > 0) {
        g_critical_nesting[core_id]--;
    }

    if (g_critical_nesting[core_id] == 0) {
        __enable();
    }

    return g_critical_nesting[core_id];
}

bool ekk_hal_in_critical(void)
{
    uint32_t core_id = ekk_hal_get_core_id();
    return g_critical_nesting[core_id] > 0;
}

/* ==========================================================================
 * Time Functions - STM Timer
 *
 * TC397XP has 6 STM modules (STM0-STM5), one per CPU core.
 * Each STM is a 64-bit free-running counter at fSTM (up to 100 MHz).
 * ========================================================================== */

/**
 * @brief Get STM base address for core
 */
static uint32_t get_stm_base(uint32_t core_id)
{
    switch (core_id) {
        case 0: return STM0_BASE;
        case 1: return STM1_BASE;
        case 2: return STM2_BASE;
        case 3: return STM3_BASE;
        case 4: return STM4_BASE;
        case 5: return STM5_BASE;
        default: return STM0_BASE;
    }
}

uint32_t ekk_hal_get_time_us(void)
{
    uint32_t core_id = ekk_hal_get_core_id();
    uint32_t stm_base = get_stm_base(core_id);

    /* Read lower 32 bits of STM timer */
    uint32_t tim0 = REG_READ32(stm_base + STM_TIM0);

    /* Convert to microseconds */
    /* STM clock is typically 100 MHz, so divide by 100 for us */
    uint32_t divisor = g_stm_clock_hz / 1000000;
    if (divisor == 0) divisor = 1;

    return tim0 / divisor;
}

uint32_t ekk_hal_get_time_ms(void)
{
    return ekk_hal_get_time_us() / 1000;
}

uint64_t ekk_hal_get_time_us64(void)
{
    uint32_t core_id = ekk_hal_get_core_id();
    uint32_t stm_base = get_stm_base(core_id);

    /* Read 64-bit STM value atomically */
    uint32_t tim0, tim6;
    do {
        tim6 = REG_READ32(stm_base + STM_TIM6);
        tim0 = REG_READ32(stm_base + STM_TIM0);
    } while (tim6 != REG_READ32(stm_base + STM_TIM6));

    uint64_t ticks = ((uint64_t)tim6 << 32) | tim0;

    /* Convert to microseconds */
    uint64_t divisor = g_stm_clock_hz / 1000000;
    if (divisor == 0) divisor = 1;

    return ticks / divisor;
}

void ekk_hal_delay_us(uint32_t us)
{
    uint32_t start = ekk_hal_get_time_us();
    while ((ekk_hal_get_time_us() - start) < us) {
        __nop();
    }
}

void ekk_hal_delay_ms(uint32_t ms)
{
    ekk_hal_delay_us(ms * 1000);
}

/* ==========================================================================
 * System Tick
 * ========================================================================== */

/**
 * @brief STM compare match ISR
 */
static void stm_compare_isr(void)
{
    uint32_t core_id = ekk_hal_get_core_id();
    uint32_t stm_base = get_stm_base(core_id);

    /* Clear interrupt by writing to ISCR */
    REG_WRITE32(stm_base + STM_ISCR, STM_ISCR_CMP0IRR);

    /* Reload compare value for next tick */
    uint32_t period = g_stm_clock_hz / EKK_TICK_FREQ_HZ;
    uint32_t current = REG_READ32(stm_base + STM_TIM0);
    REG_WRITE32(stm_base + STM_CMP0, current + period);

    /* Increment tick count */
    g_tick_count[core_id]++;

    /* Call user callback */
    if (g_systick_callbacks[core_id] != NULL) {
        g_systick_callbacks[core_id]();
    }
}

int ekk_hal_systick_init(ekk_hal_systick_cb_t callback)
{
    uint32_t core_id = ekk_hal_get_core_id();
    uint32_t stm_base = get_stm_base(core_id);

    /* Store callback */
    g_systick_callbacks[core_id] = callback;

    /* Calculate compare period */
    uint32_t period = g_stm_clock_hz / EKK_TICK_FREQ_HZ;

    /* Configure STM compare register 0 */
    uint32_t current = REG_READ32(stm_base + STM_TIM0);
    REG_WRITE32(stm_base + STM_CMP0, current + period);

    /* Configure compare match: enable, size = 32-bit */
    uint32_t cmcon = STM_CMCON_MSIZE0(31);  /* 32-bit compare */
    REG_WRITE32(stm_base + STM_CMCON, cmcon);

    /* Enable compare interrupt */
    uint32_t icr = REG_READ32(stm_base + STM_ICR);
    icr |= STM_ICR_CMP0EN;
    REG_WRITE32(stm_base + STM_ICR, icr);

    /* Register ISR */
    /* STM interrupts are IRQ_STM0_CMP0 + core_id * 2 */
    uint32_t irq_num = IRQ_STM0_CMP0 + core_id * 2;
    irq_register(irq_num, IRQ_PRIORITY_SYSTICK, (irq_tos_t)core_id, stm_compare_isr);

    return 0;
}

uint32_t ekk_hal_get_tick_count(void)
{
    uint32_t core_id = ekk_hal_get_core_id();
    return g_tick_count[core_id];
}

uint32_t ekk_hal_get_tick_period_us(void)
{
    return 1000000 / EKK_TICK_FREQ_HZ;
}

/* ==========================================================================
 * Context Switching
 * ========================================================================== */

/* External assembly helpers */
extern void _context_switch_asm(uint32_t *old_pcxi, uint32_t new_pcxi);
extern void _start_first_task(uint32_t pcxi);

void ekk_hal_trigger_context_switch(void)
{
    /*
     * On TriCore, we trigger context switch via software interrupt.
     * Use GPSR (General Purpose Service Request) for IPI.
     */
    uint32_t core_id = ekk_hal_get_core_id();

    /* Self-IPI for context switch */
    /* Use low priority so it runs after current ISR */
    uint32_t gpsr_addr = SRC_GPSR(core_id, 0);
    uint32_t src = REG_READ32(gpsr_addr);
    src |= SRC_SETR;
    REG_WRITE32(gpsr_addr, src);
}

void ekk_hal_start_first_task(void *stack_ptr, void (*entry)(void))
{
    /*
     * For TriCore, we need to create a task context (CSA chain)
     * and load it.
     */
    uint32_t stack_top = (uint32_t)stack_ptr;
    uint32_t pcxi = csa_create_task_context(stack_top, (void(*)(void*))entry, NULL);

    if (pcxi != 0) {
        _start_first_task(pcxi);
    }

    /* Should not reach here */
    while (1) {
        __nop();
    }
}

void ekk_hal_context_switch(void **current_sp, void *next_sp)
{
    /*
     * TriCore context switch uses CSA, not stack pointers directly.
     * current_sp and next_sp are actually PCXI values.
     */
    uint32_t *current_pcxi = (uint32_t*)current_sp;
    uint32_t next_pcxi = (uint32_t)next_sp;

    _context_switch_asm(current_pcxi, next_pcxi);
}

/* ==========================================================================
 * Memory Barriers
 * ========================================================================== */

void ekk_hal_memory_barrier(void)
{
    __dsync();
}

void ekk_hal_instruction_barrier(void)
{
    __isync();
}

void ekk_hal_data_sync_barrier(void)
{
    __dsync();
    __isync();
}

/* ==========================================================================
 * Idle / Sleep
 * ========================================================================== */

void ekk_hal_idle(void)
{
    cpu_idle();
}

void ekk_hal_sleep(uint32_t mode)
{
    (void)mode;

    /*
     * TC397XP power modes:
     *   - Idle: CPU halted, peripherals running
     *   - Sleep: Deeper, less peripherals
     *   - Standby: Lowest power, RAM retained
     *
     * For now, just use idle mode.
     */
    cpu_idle();
}

/* ==========================================================================
 * Debug Support
 * ========================================================================== */

void ekk_hal_debug_break(void)
{
    __debug();
}

/* Debug output - uses ASCLIN UART */

/* ASCLIN0 registers for UART output */
#define ASCLIN0_BASE        0xF0000600
#define ASCLIN0_TXDATA      (*(volatile uint32_t *)(ASCLIN0_BASE + 0x0C))
#define ASCLIN0_FLAGS       (*(volatile uint32_t *)(ASCLIN0_BASE + 0x2C))
#define ASCLIN_FLAGS_TH     (1 << 0)  /* TX FIFO below threshold */

void ekk_hal_debug_putc(char c)
{
    /* Wait for TX ready (TH flag) */
    while ((ASCLIN0_FLAGS & ASCLIN_FLAGS_TH) == 0) {
        /* Wait */
    }

    /* Write character to TX data register */
    ASCLIN0_TXDATA = (uint32_t)c;
}

void ekk_hal_debug_puts(const char *s)
{
    while (*s) {
        ekk_hal_debug_putc(*s++);
    }
}

void ekk_hal_debug_hex(uint32_t value)
{
    static const char hex[] = "0123456789ABCDEF";

    /* Output "0x" prefix character by character to avoid .srodata section */
    ekk_hal_debug_putc('0');
    ekk_hal_debug_putc('x');
    for (int i = 28; i >= 0; i -= 4) {
        ekk_hal_debug_putc(hex[(value >> i) & 0xF]);
    }
}

/* ==========================================================================
 * Watchdog
 * ========================================================================== */

int ekk_hal_watchdog_init(uint32_t timeout_ms)
{
    (void)timeout_ms;

    /*
     * TC397XP has multiple watchdogs:
     *   - Safety WDT (SWDT) for CPU0
     *   - CPU WDTs (WDTCPU0-5) per core
     *
     * For safety applications, watchdog should be enabled.
     * For development, we may want to disable it.
     */

    /* TODO: Configure watchdog */

    return 0;
}

void ekk_hal_watchdog_reset(void)
{
    uint32_t core_id = ekk_hal_get_core_id();
    uint32_t wdt_base;

    switch (core_id) {
        case 0: wdt_base = SCU_WDTCPU0_CON0; break;
        case 1: wdt_base = SCU_WDTCPU1_CON0; break;
        case 2: wdt_base = SCU_WDTCPU2_CON0; break;
        case 3: wdt_base = SCU_WDTCPU3_CON0; break;
        case 4: wdt_base = SCU_WDTCPU4_CON0; break;
        case 5: wdt_base = SCU_WDTCPU5_CON0; break;
        default: return;
    }

    /* Service watchdog - write sequence */
    /* Specific sequence depends on password mode */
    uint32_t con0 = REG_READ32(wdt_base);

    /* Check if watchdog is enabled */
    if (con0 & 0x4) {  /* ENDINIT cleared = unlocked */
        /* Already serviced or disabled */
        return;
    }

    /* TODO: Implement proper watchdog servicing */
}

void ekk_hal_watchdog_disable(void)
{
    /* Disabling watchdog requires ENDINIT unlock */
    cpu_endinit_unlock();

    /* Disable CPU0 watchdog */
    uint32_t con1 = REG_READ32(SCU_WDTCPU0_CON1);
    con1 |= 0x8;  /* DR bit - disable request */
    REG_WRITE32(SCU_WDTCPU0_CON1, con1);

    cpu_endinit_lock();
}

/* ==========================================================================
 * System Reset
 * ========================================================================== */

void ekk_hal_system_reset(void)
{
    system_reset();
}

uint32_t ekk_hal_get_reset_reason(void)
{
    return get_reset_reason();
}

/* ==========================================================================
 * Stack Checking
 * ========================================================================== */

void* ekk_hal_get_stack_ptr(void)
{
    /* A10 is the stack pointer on TriCore */
    /* Use mov.d to copy address register value to data register */
    uint32_t sp;
    __asm__ volatile ("mov.d %0, %%a10" : "=d"(sp));
    return (void*)sp;
}

bool ekk_hal_check_stack(void *stack_bottom, uint32_t stack_size)
{
    void *current_sp = ekk_hal_get_stack_ptr();
    uint32_t bottom = (uint32_t)stack_bottom;
    uint32_t top = bottom + stack_size;

    /* Stack grows downward on TriCore */
    /* Check if SP is within stack bounds with some margin */
    uint32_t sp = (uint32_t)current_sp;

    if (sp < bottom + 64 || sp > top) {
        return false;  /* Stack overflow or underflow */
    }

    return true;
}

/* ==========================================================================
 * TC397XP-Specific Functions
 * ========================================================================== */

uint32_t ekk_hal_tc_get_stm(uint32_t stm_id)
{
    if (stm_id >= EKK_MAX_CORES) {
        stm_id = 0;
    }

    uint32_t stm_base = get_stm_base(stm_id);
    return REG_READ32(stm_base + STM_TIM0);
}

uint64_t ekk_hal_tc_get_stm64(uint32_t stm_id)
{
    if (stm_id >= EKK_MAX_CORES) {
        stm_id = 0;
    }

    uint32_t stm_base = get_stm_base(stm_id);

    uint32_t tim0, tim6;
    do {
        tim6 = REG_READ32(stm_base + STM_TIM6);
        tim0 = REG_READ32(stm_base + STM_TIM0);
    } while (tim6 != REG_READ32(stm_base + STM_TIM6));

    return ((uint64_t)tim6 << 32) | tim0;
}

int ekk_hal_tc_stm_compare(uint32_t stm_id, uint32_t cmp_id,
                           uint32_t value, void (*callback)(void))
{
    if (stm_id >= EKK_MAX_CORES || cmp_id > 1) {
        return -1;
    }

    uint32_t stm_base = get_stm_base(stm_id);

    /* Set compare value */
    uint32_t cmp_reg = (cmp_id == 0) ? STM_CMP0 : STM_CMP1;
    REG_WRITE32(stm_base + cmp_reg, value);

    /* Register interrupt handler */
    uint32_t irq_num = IRQ_STM0_CMP0 + stm_id * 2 + cmp_id;
    irq_register(irq_num, IRQ_PRIORITY_LOW, (irq_tos_t)stm_id, (irq_handler_t)callback);

    /* Enable compare interrupt */
    uint32_t icr = REG_READ32(stm_base + STM_ICR);
    icr |= (cmp_id == 0) ? STM_ICR_CMP0EN : STM_ICR_CMP1EN;
    REG_WRITE32(stm_base + STM_ICR, icr);

    return 0;
}
