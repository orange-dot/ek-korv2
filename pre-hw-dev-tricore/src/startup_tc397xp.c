/**
 * @file startup_tc397xp.c
 * @brief TC397XP C Startup Code (Simplified)
 *
 * Minimal startup for ek-kor kernel integration testing.
 * TODO: Full SCU/PLL configuration for production.
 */

#include "tc397xp_regs.h"
#include "tricore_intrinsics.h"

#include <stdint.h>

/* ==========================================================================
 * External Symbols
 * ========================================================================== */

extern void cpu0_main(void);
extern void cpu1_main(void);
extern void cpu2_main(void);
extern void cpu3_main(void);
extern void cpu4_main(void);
extern void cpu5_main(void);

/* Weak definitions - can be overridden by application */
__attribute__((weak)) void cpu0_main(void) { while(1) __nop(); }
__attribute__((weak)) void cpu1_main(void) { while(1) __nop(); }
__attribute__((weak)) void cpu2_main(void) { while(1) __nop(); }
__attribute__((weak)) void cpu3_main(void) { while(1) __nop(); }
__attribute__((weak)) void cpu4_main(void) { while(1) __nop(); }
__attribute__((weak)) void cpu5_main(void) { while(1) __nop(); }

/* IRQ and trap handlers (called from assembly) */
void irq_common_handler(uint32_t priority);
void trap_handler(uint32_t trap_class);

/* ==========================================================================
 * Clock Configuration Constants
 * ========================================================================== */

#define OSC_FREQ_HZ         20000000UL      /* 20 MHz external oscillator */
#define PLL_TARGET_HZ       300000000UL     /* 300 MHz PLL output */
#define STM_CLOCK_HZ        100000000UL     /* 100 MHz STM clock */

/* ==========================================================================
 * Startup Entry Point (called from assembly)
 * ========================================================================== */

/**
 * @brief C startup entry point
 * @param core_id Core ID (0-5)
 *
 * Called from crt0_tc397xp.s after basic CPU initialization.
 */
void _startup_tc397xp(uint32_t core_id)
{
    /* CPU0 does system-wide initialization */
    if (core_id == 0) {
        /* TODO: SCU unlock, PLL configuration, peripheral clocks */
        /* For now, assume default clock configuration is acceptable */
    }

    /* Enable interrupts */
    __enable();

    /* Jump to core-specific main function */
    switch (core_id) {
        case 0: cpu0_main(); break;
        case 1: cpu1_main(); break;
        case 2: cpu2_main(); break;
        case 3: cpu3_main(); break;
        case 4: cpu4_main(); break;
        case 5: cpu5_main(); break;
        default: break;
    }

    /* Should not return - halt if it does */
    while (1) {
        __nop();
    }
}

/* ==========================================================================
 * System Functions (used by HAL)
 * ========================================================================== */

/**
 * @brief Get system clock frequency
 */
uint32_t get_system_clock(void)
{
    /* TODO: Read actual clock from SCU */
    return PLL_TARGET_HZ;
}

/**
 * @brief Get STM timer clock frequency
 */
uint32_t get_stm_clock(void)
{
    /* TODO: Read actual STM divider from CCUCON0 */
    return STM_CLOCK_HZ;
}

/**
 * @brief Request system reset
 */
void system_reset(void)
{
    /* TODO: Proper reset via SCU */
    /* For now, just loop */
    __disable();
    while (1) {
        __nop();
    }
}

/**
 * @brief Get reset reason
 */
uint32_t get_reset_reason(void)
{
    /* TODO: Read from SCU_RSTSTAT */
    return 0;
}

/* ==========================================================================
 * Interrupt Handling
 * ========================================================================== */

/* irq_common_handler is defined in tricore_irq.c */

/**
 * @brief Trap handler
 * @param trap_class Trap class (0-7)
 *
 * Called from trap vector table.
 */
void trap_handler(uint32_t trap_class)
{
    /* Halt on trap for now */
    (void)trap_class;
    __disable();
    while (1) {
        __nop();
    }
}
