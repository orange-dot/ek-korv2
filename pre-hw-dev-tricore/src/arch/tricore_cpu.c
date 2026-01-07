/**
 * @file tricore_cpu.c
 * @brief TriCore CPU Control Implementation
 */

#include "tricore_cpu.h"
#include <stddef.h>
#include "tc397xp_regs.h"

/* ==========================================================================
 * External Symbols (from linker script)
 * ========================================================================== */

extern uint32_t __STACK_TOP_CPU0;
extern uint32_t __STACK_TOP_CPU1;
extern uint32_t __STACK_TOP_CPU2;
extern uint32_t __STACK_TOP_CPU3;
extern uint32_t __STACK_TOP_CPU4;
extern uint32_t __STACK_TOP_CPU5;

extern uint32_t __CSA_CPU0_START, __CSA_CPU0_END;
extern uint32_t __CSA_CPU1_START, __CSA_CPU1_END;
extern uint32_t __CSA_CPU2_START, __CSA_CPU2_END;
extern uint32_t __CSA_CPU3_START, __CSA_CPU3_END;
extern uint32_t __CSA_CPU4_START, __CSA_CPU4_END;
extern uint32_t __CSA_CPU5_START, __CSA_CPU5_END;

/* ==========================================================================
 * DSPR/PSPR Memory Configuration
 * ========================================================================== */

/* DSPR base addresses (from TC397XP datasheet) */
static const uint32_t dspr_bases[CPU_COUNT] = {
    0x70000000,     /* CPU0: 240KB */
    0x60000000,     /* CPU1: 240KB */
    0x50000000,     /* CPU2: 240KB */
    0x40000000,     /* CPU3: 96KB */
    0x30000000,     /* CPU4: 96KB */
    0x10000000,     /* CPU5: 96KB */
};

static const uint32_t dspr_sizes[CPU_COUNT] = {
    240 * 1024,     /* CPU0 */
    240 * 1024,     /* CPU1 */
    240 * 1024,     /* CPU2 */
    96 * 1024,      /* CPU3 */
    96 * 1024,      /* CPU4 */
    96 * 1024,      /* CPU5 */
};

/* PSPR base addresses */
static const uint32_t pspr_bases[CPU_COUNT] = {
    0x70100000,     /* CPU0: 64KB */
    0x60100000,     /* CPU1: 64KB */
    0x50100000,     /* CPU2: 64KB */
    0x40100000,     /* CPU3: 64KB */
    0x30100000,     /* CPU4: 64KB */
    0x10100000,     /* CPU5: 64KB */
};

static const uint32_t pspr_size = 64 * 1024;  /* All cores have 64KB PSPR */

/* ==========================================================================
 * Global Data
 * ========================================================================== */

cpu_info_t g_cpu_info[CPU_COUNT];

/* ==========================================================================
 * Initialization
 * ========================================================================== */

void cpu_init(void)
{
    /* Initialize CPU info for all cores */
    for (uint32_t i = 0; i < CPU_COUNT; i++) {
        g_cpu_info[i].core_id = i;
        g_cpu_info[i].state = (i == 0) ? CPU_STATE_RUNNING : CPU_STATE_HALTED;
        g_cpu_info[i].is_lockstep = (i < CPU_LOCKSTEP_COUNT);
        g_cpu_info[i].dspr_base = dspr_bases[i];
        g_cpu_info[i].dspr_size = dspr_sizes[i];
        g_cpu_info[i].pspr_base = pspr_bases[i];
        g_cpu_info[i].pspr_size = pspr_size;
        g_cpu_info[i].entry_func = NULL;
        g_cpu_info[i].entry_arg = NULL;
    }

    /* Set stack tops from linker symbols */
    g_cpu_info[0].stack_top = (uint32_t)&__STACK_TOP_CPU0;
    g_cpu_info[1].stack_top = (uint32_t)&__STACK_TOP_CPU1;
    g_cpu_info[2].stack_top = (uint32_t)&__STACK_TOP_CPU2;
    g_cpu_info[3].stack_top = (uint32_t)&__STACK_TOP_CPU3;
    g_cpu_info[4].stack_top = (uint32_t)&__STACK_TOP_CPU4;
    g_cpu_info[5].stack_top = (uint32_t)&__STACK_TOP_CPU5;

    /* Set CSA pool regions from linker symbols */
    g_cpu_info[0].csa_base = (uint32_t)&__CSA_CPU0_START;
    g_cpu_info[0].csa_size = (uint32_t)&__CSA_CPU0_END - (uint32_t)&__CSA_CPU0_START;
    g_cpu_info[1].csa_base = (uint32_t)&__CSA_CPU1_START;
    g_cpu_info[1].csa_size = (uint32_t)&__CSA_CPU1_END - (uint32_t)&__CSA_CPU1_START;
    g_cpu_info[2].csa_base = (uint32_t)&__CSA_CPU2_START;
    g_cpu_info[2].csa_size = (uint32_t)&__CSA_CPU2_END - (uint32_t)&__CSA_CPU2_START;
    g_cpu_info[3].csa_base = (uint32_t)&__CSA_CPU3_START;
    g_cpu_info[3].csa_size = (uint32_t)&__CSA_CPU3_END - (uint32_t)&__CSA_CPU3_START;
    g_cpu_info[4].csa_base = (uint32_t)&__CSA_CPU4_START;
    g_cpu_info[4].csa_size = (uint32_t)&__CSA_CPU4_END - (uint32_t)&__CSA_CPU4_START;
    g_cpu_info[5].csa_base = (uint32_t)&__CSA_CPU5_START;
    g_cpu_info[5].csa_size = (uint32_t)&__CSA_CPU5_END - (uint32_t)&__CSA_CPU5_START;
}

/* ==========================================================================
 * CPU Information
 * ========================================================================== */

cpu_info_t* cpu_get_info(uint32_t core_id)
{
    if (core_id >= CPU_COUNT) {
        return NULL;
    }
    return &g_cpu_info[core_id];
}

uint32_t cpu_get_dspr_base(uint32_t core_id)
{
    if (core_id >= CPU_COUNT) {
        return 0;
    }
    return dspr_bases[core_id];
}

uint32_t cpu_get_dspr_size(uint32_t core_id)
{
    if (core_id >= CPU_COUNT) {
        return 0;
    }
    return dspr_sizes[core_id];
}

/* ==========================================================================
 * Power Management
 * ========================================================================== */

void cpu_idle(void)
{
    /*
     * TriCore doesn't have WFI like ARM.
     * We can use the IDLE instruction or just spin with interrupts enabled.
     * For now, just enable interrupts and do nothing.
     */
    __enable();
    __nop();
    __nop();
    __nop();
    __nop();
}

void cpu_halt(void)
{
    __disable();
    while (1) {
        __nop();
    }
}

void cpu_reset(void)
{
    /* Unlock ENDINIT to access reset registers */
    cpu_endinit_unlock();

    /* Trigger software reset via SCU */
    REG_WRITE32(SCU_BASE + SCU_SWRSTCON, 0x00000002);  /* Request reset */

    /* Wait for reset (should not return) */
    while (1) {
        __nop();
    }
}

/* ==========================================================================
 * ENDINIT Protection
 *
 * TC3xx uses password-based protection for critical registers.
 * The watchdog timer provides ENDINIT protection.
 * ========================================================================== */

/* Watchdog timer registers for CPU0 */
#define WDT_CPU0_BASE       (SCU_BASE + 0x100)
#define WDT_CON0            0x00
#define WDT_CON1            0x04
#define WDT_SR              0x08

/* WDT_CON0 bits */
#define WDT_CON0_ENDINIT    (1U << 0)
#define WDT_CON0_LCK        (1U << 1)
#define WDT_CON0_PW_MASK    0x0000FFFC
#define WDT_CON0_REL_MASK   0xFFFF0000

/* WDT_CON1 bits */
#define WDT_CON1_DR         (1U << 3)   /* Disable Request */

/**
 * @brief Get password from current WDT_CON0 value
 */
static uint32_t wdt_get_password(uint32_t con0)
{
    /* Password is bits [15:2], inverted for next write */
    uint32_t pw = (con0 & WDT_CON0_PW_MASK);
    return pw ^ WDT_CON0_PW_MASK;  /* Invert password bits */
}

void cpu_endinit_unlock(void)
{
    uint32_t core_id = cpu_get_id();
    uint32_t wdt_base = WDT_CPU0_BASE + (core_id * 0x0C);  /* Per-CPU WDT offset */

    uint32_t con0 = REG_READ32(wdt_base + WDT_CON0);
    uint32_t password = wdt_get_password(con0);
    uint32_t rel = con0 & WDT_CON0_REL_MASK;

    /* Step 1: Write password with LCK=0, ENDINIT=0 */
    REG_WRITE32(wdt_base + WDT_CON0, password | rel | WDT_CON0_LCK);

    /* Step 2: Write password with LCK=1, ENDINIT=0 to clear ENDINIT */
    REG_WRITE32(wdt_base + WDT_CON0, password | rel);

    /* Wait for ENDINIT to clear */
    while (REG_READ32(wdt_base + WDT_CON0) & WDT_CON0_ENDINIT) {
        __nop();
    }
}

void cpu_endinit_lock(void)
{
    uint32_t core_id = cpu_get_id();
    uint32_t wdt_base = WDT_CPU0_BASE + (core_id * 0x0C);

    uint32_t con0 = REG_READ32(wdt_base + WDT_CON0);
    uint32_t password = wdt_get_password(con0);
    uint32_t rel = con0 & WDT_CON0_REL_MASK;

    /* Step 1: Write password with LCK=0, ENDINIT=1 */
    REG_WRITE32(wdt_base + WDT_CON0, password | rel | WDT_CON0_LCK | WDT_CON0_ENDINIT);

    /* Step 2: Write password with LCK=1, ENDINIT=1 to set ENDINIT */
    REG_WRITE32(wdt_base + WDT_CON0, password | rel | WDT_CON0_ENDINIT);

    /* Wait for ENDINIT to set */
    while (!(REG_READ32(wdt_base + WDT_CON0) & WDT_CON0_ENDINIT)) {
        __nop();
    }
}

/* Safety ENDINIT - uses global safety watchdog */
#define WDT_SAFETY_BASE     (SCU_BASE + 0x0F0)

void cpu_safety_endinit_unlock(void)
{
    uint32_t con0 = REG_READ32(WDT_SAFETY_BASE + WDT_CON0);
    uint32_t password = wdt_get_password(con0);
    uint32_t rel = con0 & WDT_CON0_REL_MASK;

    REG_WRITE32(WDT_SAFETY_BASE + WDT_CON0, password | rel | WDT_CON0_LCK);
    REG_WRITE32(WDT_SAFETY_BASE + WDT_CON0, password | rel);

    while (REG_READ32(WDT_SAFETY_BASE + WDT_CON0) & WDT_CON0_ENDINIT) {
        __nop();
    }
}

void cpu_safety_endinit_lock(void)
{
    uint32_t con0 = REG_READ32(WDT_SAFETY_BASE + WDT_CON0);
    uint32_t password = wdt_get_password(con0);
    uint32_t rel = con0 & WDT_CON0_REL_MASK;

    REG_WRITE32(WDT_SAFETY_BASE + WDT_CON0, password | rel | WDT_CON0_LCK | WDT_CON0_ENDINIT);
    REG_WRITE32(WDT_SAFETY_BASE + WDT_CON0, password | rel | WDT_CON0_ENDINIT);

    while (!(REG_READ32(WDT_SAFETY_BASE + WDT_CON0) & WDT_CON0_ENDINIT)) {
        __nop();
    }
}
