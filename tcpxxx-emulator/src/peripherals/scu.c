/**
 * @file scu.c
 * @brief TC397XP System Control Unit (SCU) Emulation
 *
 * Complete SCU implementation including:
 * - Clock generation and distribution (OSC, PLL, CCU)
 * - Core reset and release control (CPU0-CPU5)
 * - Per-CPU watchdog timers
 * - ENDINIT protection mechanism
 * - Reset status and software reset
 * - Power management registers
 */

#include "scu.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

/* ==========================================================================
 * Debug Logging
 * ========================================================================== */

#ifdef DEBUG
#define SCU_DEBUG(fmt, ...) printf("[SCU] " fmt "\n", ##__VA_ARGS__)
#else
#define SCU_DEBUG(fmt, ...) ((void)0)
#endif

/* ==========================================================================
 * Internal Helpers
 * ========================================================================== */

/**
 * @brief Calculate PLL output frequency
 *
 * fPLL = fOSC * N / (P * K2)
 * where N = NDIV+1, P = PDIV+1, K2 = K2DIV+1
 */
static uint32_t calc_pll_freq(uint32_t osc_freq, uint32_t con0, uint32_t con1)
{
    /* Extract divider values */
    uint32_t ndiv = ((con1 >> 8) & 0x7F) + 1;   /* N divider (7 bits in CON1) */
    uint32_t pdiv = ((con1 >> 24) & 0x07) + 1;  /* P divider (3 bits) */
    uint32_t k2div = ((con1 >> 16) & 0x7F) + 1; /* K2 divider (7 bits) */

    /* Check bypass mode */
    if (con0 & PLLCON0_VCOBYP) {
        return osc_freq;  /* Bypass mode: output = input */
    }

    /* Check power down */
    if (con0 & PLLCON0_VCOPWD) {
        return 0;
    }

    /* Calculate VCO frequency: fVCO = fOSC * N / P */
    uint64_t vco_freq = ((uint64_t)osc_freq * ndiv) / pdiv;

    /* Calculate output: fPLL = fVCO / K2 */
    uint32_t pll_freq = (uint32_t)(vco_freq / k2div);

    /* Clamp to max */
    if (pll_freq > SCU_PLL_MAX_FREQ_HZ) {
        pll_freq = SCU_PLL_MAX_FREQ_HZ;
    }

    return pll_freq;
}

/**
 * @brief Calculate clock frequency from CCU divider
 */
static uint32_t calc_ccu_freq(uint32_t source_freq, uint32_t div)
{
    if (div == 0) return source_freq;  /* Divider 0 = divide by 1 */
    return source_freq / div;
}

/**
 * @brief Initialize a watchdog to default state
 */
static void init_wdt(scu_wdt_t *wdt)
{
    wdt->con0 = 0xFFFC0001;  /* Default: ENDINIT set, locked, max reload */
    wdt->con1 = 0x00000000;
    wdt->sr = 0x00000000;
    wdt->reload = 0xFFFF;
    wdt->timer = 0xFFFF;
    wdt->enabled = true;
    wdt->locked = true;
}

/**
 * @brief Check watchdog password
 */
static bool check_wdt_password(scu_wdt_t *wdt, uint32_t pw_field)
{
    uint32_t expected_pw = (wdt->con0 & WDTCON0_PW_MASK) >> WDTCON0_PW_SHIFT;
    uint32_t received_pw = (pw_field & WDTCON0_PW_MASK) >> WDTCON0_PW_SHIFT;

    /* Simple password check - in real HW this is more complex */
    return (expected_pw == received_pw) || (expected_pw == 0);
}

/* ==========================================================================
 * SCU Lifecycle
 * ========================================================================== */

scu_t* scu_create(void)
{
    scu_t *scu = calloc(1, sizeof(scu_t));
    if (!scu) {
        return NULL;
    }

    scu_reset(scu);
    return scu;
}

void scu_destroy(scu_t *scu)
{
    if (scu) {
        free(scu);
    }
}

void scu_reset(scu_t *scu)
{
    if (!scu) return;

    /* Module ID */
    scu->id = SCU_MODULE_ID;

    /* Oscillator: assume 20MHz external crystal */
    scu->osccon = 0x00000000;
    scu->osc_freq_hz = SCU_OSC_FREQ_HZ;

    /* Main PLL: configured for 300MHz by default */
    /* fPLL = 20MHz * 30 / (1 * 2) = 300MHz */
    scu->pll.stat = PLLSTAT_VCOLOCK | PLLSTAT_K1RDY | PLLSTAT_K2RDY;
    scu->pll.con0 = 0x00000000;  /* Not bypassed, not powered down */
    scu->pll.con1 = 0x01011D00;  /* N=30, P=1, K2=2 */
    scu->pll.con2 = 0x00000000;
    scu->pll.locked = true;
    scu->pll.bypassed = false;
    scu->pll.powered_down = false;
    scu->pll.freq_hz = SCU_PLL_MAX_FREQ_HZ;

    /* PLL_ERAY: default bypass */
    scu->pll_eray.stat = PLLSTAT_VCOBYST;
    scu->pll_eray.con0 = PLLCON0_VCOBYP;
    scu->pll_eray.con1 = 0x00000000;
    scu->pll_eray.locked = false;
    scu->pll_eray.bypassed = true;
    scu->pll_eray.powered_down = false;
    scu->pll_eray.freq_hz = SCU_OSC_FREQ_HZ;

    /* CCU: default dividers for 300MHz CPU, 100MHz SPB, 100MHz STM */
    /* CCUCON0: fCPU=fPLL/1, fSPB=fPLL/3, fSTM=fPLL/3 */
    scu->ccucon[0] = 0x33331111;  /* Various dividers */
    scu->ccucon[1] = 0x00000001;
    scu->ccucon[2] = 0x00000000;
    scu->ccucon[3] = 0x00000000;
    scu->ccucon[4] = 0x00000000;
    scu->ccucon[5] = 0x00000000;

    /* Calculate actual frequencies */
    scu->cpu_freq_hz = SCU_CPU_MAX_FREQ_HZ;
    scu->spb_freq_hz = SCU_SPB_MAX_FREQ_HZ;
    scu->stm_freq_hz = SCU_STM_MAX_FREQ_HZ;

    /* Reset status: power-on reset */
    scu->rststat = RSTSTAT_PORST;
    scu->rstcon = 0x00000000;
    scu->rstcon2 = 0x00000000;
    scu->arstdis = 0x00000000;
    scu->swrstcon = 0x00000000;

    /* Emergency stop */
    scu->esrcfg[0] = 0x00000000;
    scu->esrcfg[1] = 0x00000000;
    scu->esrocfg = 0x00000000;

    /* Power management */
    scu->pmswcr[0] = 0x00000000;
    scu->pmswcr[1] = 0x00000000;
    scu->pmswstat = 0x00000000;
    for (int i = 0; i < 6; i++) {
        scu->pmcsr[i] = 0x00000000;
    }

    /* Initialize all CPU watchdogs */
    for (int i = 0; i < SCU_NUM_CPU_WDTS; i++) {
        init_wdt(&scu->wdt_cpu[i]);
        scu->endinit_cpu[i] = true;  /* ENDINIT set by default */
    }

    /* Initialize safety watchdog */
    init_wdt(&scu->wdt_safety);
    scu->endinit_safety = true;

    /* CPU control: all CPUs except CPU0 are halted */
    for (int i = 0; i < 6; i++) {
        scu->cpucon[i] = 0x00000000;
        scu->cpu_started[i] = (i == 0);  /* Only CPU0 starts */
    }

    /* Trap control */
    scu->trapstat = 0x00000000;
    scu->trapdis[0] = 0x00000000;
    scu->trapdis[1] = 0x00000000;

    /* Access enable */
    scu->accen0 = 0xFFFFFFFF;

    SCU_DEBUG("Reset complete, fCPU=%u MHz, fSPB=%u MHz",
              scu->cpu_freq_hz / 1000000, scu->spb_freq_hz / 1000000);
}

/* ==========================================================================
 * Register Access
 * ========================================================================== */

uint32_t scu_read_reg(scu_t *scu, uint32_t offset)
{
    if (!scu) return 0;

    switch (offset) {
    /* Identification */
    case SCU_ID:
        return scu->id;

    /* Oscillator */
    case SCU_OSCCON:
        return scu->osccon;

    /* PLL */
    case SCU_PLLSTAT:
        return scu->pll.stat;
    case SCU_PLLCON0:
        return scu->pll.con0;
    case SCU_PLLCON1:
        return scu->pll.con1;
    case SCU_PLLCON2:
        return scu->pll.con2;

    /* PLL_ERAY */
    case SCU_PLLERAYSTAT:
        return scu->pll_eray.stat;
    case SCU_PLLERAYCON0:
        return scu->pll_eray.con0;
    case SCU_PLLERAYCON1:
        return scu->pll_eray.con1;

    /* CCU */
    case SCU_CCUCON0:
        return scu->ccucon[0];
    case SCU_CCUCON1:
        return scu->ccucon[1];
    case SCU_CCUCON2:
        return scu->ccucon[2];
    case SCU_CCUCON3:
        return scu->ccucon[3];
    case SCU_CCUCON4:
        return scu->ccucon[4];
    case SCU_CCUCON5:
        return scu->ccucon[5];

    /* Reset */
    case SCU_RSTSTAT:
        return scu->rststat;
    case SCU_RSTCON:
        return scu->rstcon;
    case SCU_RSTCON2:
        return scu->rstcon2;
    case SCU_ARSTDIS:
        return scu->arstdis;
    case SCU_SWRSTCON:
        return scu->swrstcon;

    /* Emergency Stop */
    case SCU_ESRCFG0:
        return scu->esrcfg[0];
    case SCU_ESRCFG1:
        return scu->esrcfg[1];
    case SCU_ESROCFG:
        return scu->esrocfg;

    /* Power Management */
    case SCU_PMSWCR0:
        return scu->pmswcr[0];
    case SCU_PMSWCR1:
        return scu->pmswcr[1];
    case SCU_PMSWSTAT:
        return scu->pmswstat;
    case SCU_PMCSR0:
    case SCU_PMCSR1:
    case SCU_PMCSR2:
    case SCU_PMCSR3:
    case SCU_PMCSR4:
    case SCU_PMCSR5: {
        int idx = (offset - SCU_PMCSR0) / 4;
        return scu->pmcsr[idx];
    }

    /* CPU Watchdogs */
    case SCU_WDTCPU0CON0:
        return scu->wdt_cpu[0].con0;
    case SCU_WDTCPU0CON1:
        return scu->wdt_cpu[0].con1;
    case SCU_WDTCPU0SR:
        return scu->wdt_cpu[0].sr | (scu->wdt_cpu[0].timer << WDTSR_TIM_SHIFT);

    case SCU_WDTCPU1CON0:
        return scu->wdt_cpu[1].con0;
    case SCU_WDTCPU1CON1:
        return scu->wdt_cpu[1].con1;
    case SCU_WDTCPU1SR:
        return scu->wdt_cpu[1].sr | (scu->wdt_cpu[1].timer << WDTSR_TIM_SHIFT);

    case SCU_WDTCPU2CON0:
        return scu->wdt_cpu[2].con0;
    case SCU_WDTCPU2CON1:
        return scu->wdt_cpu[2].con1;
    case SCU_WDTCPU2SR:
        return scu->wdt_cpu[2].sr | (scu->wdt_cpu[2].timer << WDTSR_TIM_SHIFT);

    case SCU_WDTCPU3CON0:
        return scu->wdt_cpu[3].con0;
    case SCU_WDTCPU3CON1:
        return scu->wdt_cpu[3].con1;
    case SCU_WDTCPU3SR:
        return scu->wdt_cpu[3].sr | (scu->wdt_cpu[3].timer << WDTSR_TIM_SHIFT);

    case SCU_WDTCPU4CON0:
        return scu->wdt_cpu[4].con0;
    case SCU_WDTCPU4CON1:
        return scu->wdt_cpu[4].con1;
    case SCU_WDTCPU4SR:
        return scu->wdt_cpu[4].sr | (scu->wdt_cpu[4].timer << WDTSR_TIM_SHIFT);

    case SCU_WDTCPU5CON0:
        return scu->wdt_cpu[5].con0;
    case SCU_WDTCPU5CON1:
        return scu->wdt_cpu[5].con1;
    case SCU_WDTCPU5SR:
        return scu->wdt_cpu[5].sr | (scu->wdt_cpu[5].timer << WDTSR_TIM_SHIFT);

    /* Safety Watchdog */
    case SCU_WDTSCON0:
        return scu->wdt_safety.con0;
    case SCU_WDTSCON1:
        return scu->wdt_safety.con1;
    case SCU_WDTSSR:
        return scu->wdt_safety.sr | (scu->wdt_safety.timer << WDTSR_TIM_SHIFT);

    /* Trap */
    case SCU_TRAPSTAT:
        return scu->trapstat;
    case SCU_TRAPDIS0:
        return scu->trapdis[0];
    case SCU_TRAPDIS1:
        return scu->trapdis[1];

    /* ENDINIT */
    case SCU_EICON0:
        return scu->endinit_cpu[0] ? WDTCON0_ENDINIT : 0;
    case SCU_SEICON0:
        return scu->endinit_safety ? WDTCON0_ENDINIT : 0;

    /* CPU Control */
    case SCU_CPU0CON:
        return scu->cpucon[0];
    case SCU_CPU1CON:
        return scu->cpucon[1];
    case SCU_CPU2CON:
        return scu->cpucon[2];
    case SCU_CPU3CON:
        return scu->cpucon[3];
    case SCU_CPU4CON:
        return scu->cpucon[4];
    case SCU_CPU5CON:
        return scu->cpucon[5];

    /* Access Control */
    case SCU_ACCEN0:
        return scu->accen0;

    default:
        SCU_DEBUG("Read from unknown offset 0x%03X", offset);
        return 0;
    }
}

void scu_write_reg(scu_t *scu, uint32_t offset, uint32_t value)
{
    if (!scu) return;

    /* Check if register requires ENDINIT clear */
    bool endinit_protected = false;

    switch (offset) {
    case SCU_OSCCON:
    case SCU_PLLCON0:
    case SCU_PLLCON1:
    case SCU_PLLCON2:
    case SCU_PLLERAYCON0:
    case SCU_PLLERAYCON1:
    case SCU_CCUCON0:
    case SCU_CCUCON1:
    case SCU_CCUCON2:
    case SCU_CCUCON3:
    case SCU_CCUCON4:
    case SCU_CCUCON5:
    case SCU_RSTCON:
    case SCU_RSTCON2:
        endinit_protected = true;
        break;
    }

    /* Block writes to protected registers if ENDINIT is set */
    if (endinit_protected && scu->endinit_cpu[0]) {
        SCU_DEBUG("Write to 0x%03X blocked - ENDINIT set", offset);
        return;
    }

    switch (offset) {
    /* Oscillator */
    case SCU_OSCCON:
        scu->osccon = value;
        SCU_DEBUG("OSCCON = 0x%08X", value);
        break;

    /* PLL */
    case SCU_PLLCON0:
        scu->pll.con0 = value;
        scu->pll.bypassed = (value & PLLCON0_VCOBYP) != 0;
        scu->pll.powered_down = (value & PLLCON0_VCOPWD) != 0;
        /* Update lock status */
        if (value & PLLCON0_RESLD) {
            scu->pll.locked = false;
            scu->pll.stat &= ~PLLSTAT_VCOLOCK;
            /* In emulation, lock immediately */
            scu->pll.locked = true;
            scu->pll.stat |= PLLSTAT_VCOLOCK;
        }
        scu_update_clocks(scu);
        SCU_DEBUG("PLLCON0 = 0x%08X, bypass=%d", value, scu->pll.bypassed);
        break;

    case SCU_PLLCON1:
        scu->pll.con1 = value;
        scu_update_clocks(scu);
        SCU_DEBUG("PLLCON1 = 0x%08X, fPLL=%u MHz",
                  value, scu->pll.freq_hz / 1000000);
        break;

    case SCU_PLLCON2:
        scu->pll.con2 = value;
        break;

    /* PLL_ERAY */
    case SCU_PLLERAYCON0:
        scu->pll_eray.con0 = value;
        scu->pll_eray.bypassed = (value & PLLCON0_VCOBYP) != 0;
        break;

    case SCU_PLLERAYCON1:
        scu->pll_eray.con1 = value;
        break;

    /* CCU */
    case SCU_CCUCON0:
        scu->ccucon[0] = value;
        scu_update_clocks(scu);
        SCU_DEBUG("CCUCON0 = 0x%08X, fCPU=%u MHz, fSPB=%u MHz",
                  value, scu->cpu_freq_hz / 1000000, scu->spb_freq_hz / 1000000);
        break;

    case SCU_CCUCON1:
        scu->ccucon[1] = value;
        scu_update_clocks(scu);
        break;

    case SCU_CCUCON2:
    case SCU_CCUCON3:
    case SCU_CCUCON4:
    case SCU_CCUCON5: {
        int idx = 2 + (offset - SCU_CCUCON2) / 4;
        if (idx < 6) scu->ccucon[idx] = value;
        break;
    }

    /* Reset */
    case SCU_RSTSTAT:
        /* Write 1 to clear */
        scu->rststat &= ~value;
        break;

    case SCU_RSTCON:
        scu->rstcon = value;
        break;

    case SCU_RSTCON2:
        scu->rstcon2 = value;
        break;

    case SCU_ARSTDIS:
        scu->arstdis = value;
        break;

    case SCU_SWRSTCON:
        scu->swrstcon = value;
        if (value & SWRSTCON_SWRSTREQ) {
            SCU_DEBUG("Software reset requested!");
            scu_request_sw_reset(scu);
        }
        break;

    /* Emergency Stop */
    case SCU_ESRCFG0:
        scu->esrcfg[0] = value;
        break;
    case SCU_ESRCFG1:
        scu->esrcfg[1] = value;
        break;
    case SCU_ESROCFG:
        scu->esrocfg = value;
        break;

    /* Power Management */
    case SCU_PMSWCR0:
        scu->pmswcr[0] = value;
        break;
    case SCU_PMSWCR1:
        scu->pmswcr[1] = value;
        break;
    case SCU_PMSWSTATCLR:
        scu->pmswstat &= ~value;
        break;
    case SCU_PMCSR0:
    case SCU_PMCSR1:
    case SCU_PMCSR2:
    case SCU_PMCSR3:
    case SCU_PMCSR4:
    case SCU_PMCSR5: {
        int idx = (offset - SCU_PMCSR0) / 4;
        scu->pmcsr[idx] = value;
        break;
    }

    /* Watchdog CON0 writes - handle ENDINIT unlock sequence */
    case SCU_WDTCPU0CON0:
    case SCU_WDTCPU1CON0:
    case SCU_WDTCPU2CON0:
    case SCU_WDTCPU3CON0:
    case SCU_WDTCPU4CON0:
    case SCU_WDTCPU5CON0: {
        int cpu = (offset - SCU_WDTCPU0CON0) / 12;
        scu_wdt_t *wdt = &scu->wdt_cpu[cpu];

        /* Check password */
        if (!check_wdt_password(wdt, value)) {
            wdt->sr |= WDTSR_AE;  /* Access error */
            SCU_DEBUG("WDT CPU%d: password mismatch", cpu);
            break;
        }

        /* Update ENDINIT state */
        bool new_endinit = (value & WDTCON0_ENDINIT) != 0;
        if (new_endinit != scu->endinit_cpu[cpu]) {
            scu->endinit_cpu[cpu] = new_endinit;
            SCU_DEBUG("CPU%d ENDINIT = %d", cpu, new_endinit);
        }

        /* Update reload value */
        uint32_t new_reload = (value >> WDTCON0_REL_SHIFT) & 0xFFFF;
        wdt->reload = new_reload;
        wdt->timer = new_reload;  /* Reset timer on service */

        /* Update lock state */
        wdt->locked = (value & WDTCON0_LCK) != 0;

        /* Store register value (with current password preserved) */
        wdt->con0 = value;
        break;
    }

    case SCU_WDTCPU0CON1:
    case SCU_WDTCPU1CON1:
    case SCU_WDTCPU2CON1:
    case SCU_WDTCPU3CON1:
    case SCU_WDTCPU4CON1:
    case SCU_WDTCPU5CON1: {
        int cpu = (offset - SCU_WDTCPU0CON1) / 12;
        scu->wdt_cpu[cpu].con1 = value;

        /* Handle disable request */
        if (value & WDTCON1_DR) {
            scu->wdt_cpu[cpu].enabled = false;
            scu->wdt_cpu[cpu].sr |= WDTSR_DS;
            SCU_DEBUG("WDT CPU%d disabled", cpu);
        }
        break;
    }

    /* Safety Watchdog */
    case SCU_WDTSCON0: {
        scu_wdt_t *wdt = &scu->wdt_safety;
        if (!check_wdt_password(wdt, value)) {
            wdt->sr |= WDTSR_AE;
            break;
        }
        scu->endinit_safety = (value & WDTCON0_ENDINIT) != 0;
        wdt->reload = (value >> WDTCON0_REL_SHIFT) & 0xFFFF;
        wdt->timer = wdt->reload;
        wdt->locked = (value & WDTCON0_LCK) != 0;
        wdt->con0 = value;
        SCU_DEBUG("Safety ENDINIT = %d", scu->endinit_safety);
        break;
    }

    case SCU_WDTSCON1:
        scu->wdt_safety.con1 = value;
        if (value & WDTCON1_DR) {
            scu->wdt_safety.enabled = false;
            scu->wdt_safety.sr |= WDTSR_DS;
        }
        break;

    /* Trap */
    case SCU_TRAPSET:
        scu->trapstat |= value;
        break;
    case SCU_TRAPCLR:
        scu->trapstat &= ~value;
        break;
    case SCU_TRAPDIS0:
        scu->trapdis[0] = value;
        break;
    case SCU_TRAPDIS1:
        scu->trapdis[1] = value;
        break;

    /* CPU Control - Writing starts the CPU */
    case SCU_CPU1CON:
    case SCU_CPU2CON:
    case SCU_CPU3CON:
    case SCU_CPU4CON:
    case SCU_CPU5CON: {
        int cpu = 1 + (offset - SCU_CPU1CON) / 4;
        scu->cpucon[cpu] = value;

        /* Extract start PC (bit 0 is enable, bits 31:1 are PC) */
        uint32_t pc = value & CPUCON_PC_MASK;

        if (!scu->cpu_started[cpu] && pc != 0) {
            scu->cpu_started[cpu] = true;
            SCU_DEBUG("CPU%d started at PC=0x%08X", cpu, pc);

            /* Call callback if set */
            if (scu->on_cpu_start) {
                scu->on_cpu_start(cpu, pc, scu->callback_user);
            }
        }
        break;
    }

    /* Access Control */
    case SCU_ACCEN0:
        scu->accen0 = value;
        break;

    default:
        SCU_DEBUG("Write to unknown offset 0x%03X = 0x%08X", offset, value);
        break;
    }
}

/* ==========================================================================
 * ENDINIT Protection
 * ========================================================================== */

void scu_clear_endinit(scu_t *scu, uint32_t cpu_id)
{
    if (!scu) return;

    if (cpu_id == 0xFF) {
        /* Safety ENDINIT */
        scu->endinit_safety = false;
        SCU_DEBUG("Safety ENDINIT cleared");
    } else if (cpu_id < SCU_NUM_CPU_WDTS) {
        scu->endinit_cpu[cpu_id] = false;
        SCU_DEBUG("CPU%u ENDINIT cleared", cpu_id);
    }
}

void scu_set_endinit(scu_t *scu, uint32_t cpu_id)
{
    if (!scu) return;

    if (cpu_id == 0xFF) {
        scu->endinit_safety = true;
        SCU_DEBUG("Safety ENDINIT set");
    } else if (cpu_id < SCU_NUM_CPU_WDTS) {
        scu->endinit_cpu[cpu_id] = true;
        SCU_DEBUG("CPU%u ENDINIT set", cpu_id);
    }
}

bool scu_is_endinit_clear(scu_t *scu, uint32_t cpu_id)
{
    if (!scu || cpu_id >= SCU_NUM_CPU_WDTS) return false;
    return !scu->endinit_cpu[cpu_id];
}

/* ==========================================================================
 * Clock Functions
 * ========================================================================== */

uint32_t scu_get_freq_hz(scu_t *scu)
{
    if (!scu) return SCU_CPU_MAX_FREQ_HZ;
    return scu->cpu_freq_hz;
}

uint32_t scu_get_spb_freq_hz(scu_t *scu)
{
    if (!scu) return SCU_SPB_MAX_FREQ_HZ;
    return scu->spb_freq_hz;
}

uint32_t scu_get_stm_freq_hz(scu_t *scu)
{
    if (!scu) return SCU_STM_MAX_FREQ_HZ;
    return scu->stm_freq_hz;
}

void scu_update_clocks(scu_t *scu)
{
    if (!scu) return;

    /* Calculate PLL output frequency */
    scu->pll.freq_hz = calc_pll_freq(scu->osc_freq_hz,
                                      scu->pll.con0, scu->pll.con1);

    /* Update PLL status based on bypass */
    if (scu->pll.bypassed) {
        scu->pll.stat |= PLLSTAT_VCOBYST;
        scu->pll.freq_hz = scu->osc_freq_hz;
    } else {
        scu->pll.stat &= ~PLLSTAT_VCOBYST;
    }

    /* Select source clock for CCU */
    uint32_t source_freq = scu->pll.freq_hz;

    /* Extract dividers from CCUCON0 */
    uint32_t ccucon0 = scu->ccucon[0];
    uint32_t stm_div = (ccucon0 & CCUCON0_STMDIV_MASK);
    uint32_t spb_div = (ccucon0 >> CCUCON0_SPBDIV_SHIFT) & 0x0F;
    /* CPU runs at full PLL speed in this simple model */

    /* Calculate derived frequencies */
    scu->cpu_freq_hz = source_freq;  /* fCPU = fPLL (no divider in simple model) */
    scu->spb_freq_hz = calc_ccu_freq(source_freq, spb_div ? spb_div : 3);
    scu->stm_freq_hz = calc_ccu_freq(source_freq, stm_div ? stm_div : 3);

    /* Clamp to max frequencies */
    if (scu->cpu_freq_hz > SCU_CPU_MAX_FREQ_HZ) {
        scu->cpu_freq_hz = SCU_CPU_MAX_FREQ_HZ;
    }
    if (scu->spb_freq_hz > SCU_SPB_MAX_FREQ_HZ) {
        scu->spb_freq_hz = SCU_SPB_MAX_FREQ_HZ;
    }
    if (scu->stm_freq_hz > SCU_STM_MAX_FREQ_HZ) {
        scu->stm_freq_hz = SCU_STM_MAX_FREQ_HZ;
    }
}

/* ==========================================================================
 * CPU Control
 * ========================================================================== */

int scu_start_cpu(scu_t *scu, uint32_t core_id, uint32_t pc)
{
    if (!scu || core_id == 0 || core_id >= 6) {
        return -1;  /* Core 0 starts at reset, not via SCU */
    }

    /* Write to CPUxCON register */
    uint32_t offset = SCU_CPU1CON + (core_id - 1) * 4;
    scu_write_reg(scu, offset, pc | 1);  /* Bit 0 typically enables */

    return 0;
}

bool scu_is_cpu_started(scu_t *scu, uint32_t core_id)
{
    if (!scu || core_id >= 6) return false;
    return scu->cpu_started[core_id];
}

uint32_t scu_get_cpu_start_pc(scu_t *scu, uint32_t core_id)
{
    if (!scu || core_id == 0 || core_id >= 6) return 0;
    return scu->cpucon[core_id] & CPUCON_PC_MASK;
}

/* ==========================================================================
 * Watchdog Functions
 * ========================================================================== */

uint32_t scu_tick_wdts(scu_t *scu, uint32_t cycles)
{
    if (!scu) return 0;

    uint32_t timeouts = 0;

    /* Tick each enabled CPU watchdog */
    for (int i = 0; i < SCU_NUM_CPU_WDTS; i++) {
        scu_wdt_t *wdt = &scu->wdt_cpu[i];

        if (!wdt->enabled) continue;

        /* Decrement timer */
        if (wdt->timer > cycles) {
            wdt->timer -= cycles;
        } else {
            /* Timeout! */
            wdt->timer = 0;
            wdt->sr |= WDTSR_OE | WDTSR_TO;
            timeouts |= (1 << i);
            SCU_DEBUG("WDT CPU%d timeout!", i);

            /* Reload for next cycle (in real HW this causes reset) */
            wdt->timer = wdt->reload;
        }
    }

    /* Tick safety watchdog */
    if (scu->wdt_safety.enabled) {
        scu_wdt_t *wdt = &scu->wdt_safety;
        if (wdt->timer > cycles) {
            wdt->timer -= cycles;
        } else {
            wdt->timer = 0;
            wdt->sr |= WDTSR_OE | WDTSR_TO;
            timeouts |= (1 << 6);  /* Bit 6 for safety WDT */
            SCU_DEBUG("Safety WDT timeout!");
            wdt->timer = wdt->reload;
        }
    }

    return timeouts;
}

int scu_service_wdt(scu_t *scu, uint32_t cpu_id, uint32_t password)
{
    if (!scu || cpu_id >= SCU_NUM_CPU_WDTS) return -1;

    scu_wdt_t *wdt = &scu->wdt_cpu[cpu_id];

    /* Check password */
    if (!check_wdt_password(wdt, password << WDTCON0_PW_SHIFT)) {
        wdt->sr |= WDTSR_AE;
        return -1;
    }

    /* Reload timer */
    wdt->timer = wdt->reload;

    return 0;
}

int scu_disable_wdt(scu_t *scu, uint32_t cpu_id)
{
    if (!scu || cpu_id >= SCU_NUM_CPU_WDTS) return -1;

    /* Must have ENDINIT clear to disable */
    if (scu->endinit_cpu[cpu_id]) {
        SCU_DEBUG("Cannot disable WDT CPU%u - ENDINIT set", cpu_id);
        return -1;
    }

    scu->wdt_cpu[cpu_id].enabled = false;
    scu->wdt_cpu[cpu_id].sr |= WDTSR_DS;
    SCU_DEBUG("WDT CPU%u disabled", cpu_id);

    return 0;
}

/* ==========================================================================
 * Reset Functions
 * ========================================================================== */

void scu_request_sw_reset(scu_t *scu)
{
    if (!scu) return;

    scu->rststat |= RSTSTAT_SW;

    if (scu->on_reset) {
        scu->on_reset(RSTSTAT_SW, scu->callback_user);
    }

    /* In full emulation, this would trigger system reset */
    SCU_DEBUG("Software reset triggered");
}

uint32_t scu_get_reset_status(scu_t *scu)
{
    if (!scu) return 0;
    return scu->rststat;
}

void scu_clear_reset_status(scu_t *scu, uint32_t mask)
{
    if (!scu) return;
    scu->rststat &= ~mask;
}

/* ==========================================================================
 * Callbacks
 * ========================================================================== */

void scu_set_cpu_start_callback(scu_t *scu,
    void (*callback)(uint32_t core_id, uint32_t pc, void *user), void *user)
{
    if (!scu) return;
    scu->on_cpu_start = callback;
    scu->callback_user = user;
}

void scu_set_reset_callback(scu_t *scu,
    void (*callback)(uint32_t reset_type, void *user), void *user)
{
    if (!scu) return;
    scu->on_reset = callback;
    scu->callback_user = user;
}
