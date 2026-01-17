/**
 * @file stm.c
 * @brief TC397XP System Timer Module (STM) Emulation
 *
 * STM provides 64-bit free-running counter for OS tick generation.
 * Each core has its own STM instance (STM0-STM5).
 *
 * Key features:
 * - 64-bit free-running counter (TIM0-TIM6)
 * - Two compare registers (CMP0, CMP1)
 * - Configurable compare match position via CMCON
 * - Interrupt generation on compare match
 *
 * Reference: TC39x User Manual, Section 22 (STM)
 */

#include "peripherals.h"
#include <stdlib.h>
#include <string.h>

/* ==========================================================================
 * STM Internal State
 * ========================================================================== */

struct stm {
    /* Identification */
    uint32_t core_id;
    uint32_t module_id;     /* 0x000000C0 for STM */

    /* 64-bit counter */
    uint64_t counter;
    uint64_t capture;       /* Captured value on read */

    /* Compare registers */
    uint32_t cmp[2];        /* CMP0, CMP1 */
    uint32_t cmcon;         /* Compare match control */

    /* Interrupt control */
    uint32_t icr;           /* Interrupt control register */
    bool irq_pending[2];    /* IRQ pending for CMP0, CMP1 */

    /* Clock control */
    uint32_t clc;
    uint32_t ocs;           /* OCDS control */

    /* Kernel reset */
    uint32_t krst0;
    uint32_t krst1;

    /* Access protection */
    uint32_t accen0;
    uint32_t accen1;

    /* Shadow registers */
    uint32_t tim0sv;
    uint32_t capsv;
};

/* ==========================================================================
 * Lifecycle
 * ========================================================================== */

stm_t* stm_create(uint32_t core_id)
{
    stm_t *stm = calloc(1, sizeof(stm_t));
    if (!stm) return NULL;

    stm->core_id = core_id;
    stm->module_id = 0x000000C0;  /* STM module ID */

    /* Default CMCON: compare all 32 bits starting at bit 0 */
    stm->cmcon = 0x001F0000 | 0x0000001F;  /* MSIZE=31 for both */

    /* Default access enable: all masters allowed */
    stm->accen0 = 0xFFFFFFFF;
    stm->accen1 = 0xFFFFFFFF;

    return stm;
}

void stm_destroy(stm_t *stm)
{
    free(stm);
}

void stm_reset(stm_t *stm)
{
    if (!stm) return;

    stm->counter = 0;
    stm->capture = 0;
    stm->cmp[0] = 0;
    stm->cmp[1] = 0;
    stm->cmcon = 0x001F0000 | 0x0000001F;
    stm->icr = 0;
    stm->irq_pending[0] = false;
    stm->irq_pending[1] = false;
    stm->clc = 0;
    stm->ocs = 0;
    stm->krst0 = 0;
    stm->krst1 = 0;
    stm->accen0 = 0xFFFFFFFF;
    stm->accen1 = 0xFFFFFFFF;
    stm->tim0sv = 0;
    stm->capsv = 0;
}

/* ==========================================================================
 * Compare Match Logic
 * ========================================================================== */

/**
 * @brief Check if compare match occurred
 *
 * CMCON configures which bits of the counter to compare:
 * - MSTART: Starting bit position (0-31)
 * - MSIZE: Number of bits to compare - 1 (0-31 means 1-32 bits)
 *
 * Compare match occurs when:
 *   (counter[MSTART+MSIZE:MSTART] == CMP[MSIZE:0])
 */
static bool check_compare_match(stm_t *stm, int cmp_index, uint64_t old_counter)
{
    uint32_t mstart, msize;

    if (cmp_index == 0) {
        mstart = (stm->cmcon >> 8) & 0x1F;
        msize = stm->cmcon & 0x1F;
    } else {
        mstart = (stm->cmcon >> 24) & 0x1F;
        msize = (stm->cmcon >> 16) & 0x1F;
    }

    /* Create mask for compare (msize+1 bits) */
    uint32_t mask = (msize == 31) ? 0xFFFFFFFF : ((1U << (msize + 1)) - 1);

    /* Extract compare field from counter */
    uint32_t counter_field = (uint32_t)(stm->counter >> mstart) & mask;
    uint32_t old_field = (uint32_t)(old_counter >> mstart) & mask;
    uint32_t cmp_value = stm->cmp[cmp_index] & mask;

    /* Compare match if:
     * 1. Current field equals compare value, AND
     * 2. Previous field was different (edge detection)
     *
     * This handles counter wrap-around properly.
     */
    if (counter_field == cmp_value && old_field != cmp_value) {
        return true;
    }

    /* Also check if counter crossed the compare value */
    if (old_field < cmp_value && counter_field >= cmp_value) {
        return true;
    }

    /* Handle wrap-around case */
    if (counter_field < old_field && cmp_value <= counter_field) {
        return true;
    }

    return false;
}

/* ==========================================================================
 * Timer Update
 * ========================================================================== */

void stm_tick(stm_t *stm, uint32_t cycles)
{
    if (!stm) return;

    /* Check if timer is enabled (CLC.DISR == 0) */
    if (stm->clc & 0x01) {
        return;  /* Module disabled */
    }

    uint64_t old_counter = stm->counter;
    stm->counter += cycles;

    /* Check compare match for CMP0 */
    if ((stm->icr & STM_ICR_CMP0EN) && check_compare_match(stm, 0, old_counter)) {
        stm->irq_pending[0] = true;
        stm->icr |= STM_ICR_CMP0IR;  /* Set interrupt request flag */
    }

    /* Check compare match for CMP1 */
    if ((stm->icr & STM_ICR_CMP1EN) && check_compare_match(stm, 1, old_counter)) {
        stm->irq_pending[1] = true;
        stm->icr |= STM_ICR_CMP1IR;  /* Set interrupt request flag */
    }
}

uint64_t stm_get_counter(stm_t *stm)
{
    return stm ? stm->counter : 0;
}

bool stm_irq_pending(stm_t *stm, int cmp_index)
{
    if (!stm || cmp_index < 0 || cmp_index > 1) return false;
    return stm->irq_pending[cmp_index];
}

void stm_clear_irq(stm_t *stm, int cmp_index)
{
    if (!stm || cmp_index < 0 || cmp_index > 1) return;
    stm->irq_pending[cmp_index] = false;

    /* Clear the interrupt request flag in ICR */
    if (cmp_index == 0) {
        stm->icr &= ~STM_ICR_CMP0IR;
    } else {
        stm->icr &= ~STM_ICR_CMP1IR;
    }
}

/* ==========================================================================
 * Register Access
 * ========================================================================== */

uint32_t stm_read_reg(stm_t *stm, uint32_t offset)
{
    if (!stm) return 0;

    switch (offset) {
    case STM_CLC:
        return stm->clc;

    case STM_ID:
        return stm->module_id;

    case STM_TIM0:
        /* Reading TIM0 captures the full 64-bit value */
        stm->capture = stm->counter;
        return (uint32_t)(stm->counter & 0xFFFFFFFF);

    case STM_TIM1:
        return (uint32_t)((stm->counter >> 4) & 0xFFFFFFFF);

    case STM_TIM2:
        return (uint32_t)((stm->counter >> 8) & 0xFFFFFFFF);

    case STM_TIM3:
        return (uint32_t)((stm->counter >> 12) & 0xFFFFFFFF);

    case STM_TIM4:
        return (uint32_t)((stm->counter >> 16) & 0xFFFFFFFF);

    case STM_TIM5:
        return (uint32_t)((stm->counter >> 20) & 0xFFFFFFFF);

    case STM_TIM6:
        /* Return upper 32 bits from capture */
        return (uint32_t)((stm->capture >> 32) & 0xFFFFFFFF);

    case STM_CAP:
        return (uint32_t)(stm->capture & 0xFFFFFFFF);

    case STM_CMP0:
        return stm->cmp[0];

    case STM_CMP1:
        return stm->cmp[1];

    case STM_CMCON:
        return stm->cmcon;

    case STM_ICR:
        return stm->icr;

    case STM_ISCR:
        return 0;  /* Write-only */

    case STM_OCS:
        return stm->ocs;

    case STM_TIM0SV:
        return stm->tim0sv;

    case STM_CAPSV:
        return stm->capsv;

    case STM_KRSTCLR:
        return 0;  /* Write-only */

    case STM_KRST1:
        return stm->krst1;

    case STM_KRST0:
        return stm->krst0;

    case STM_ACCEN1:
        return stm->accen1;

    case STM_ACCEN0:
        return stm->accen0;

    default:
        return 0;
    }
}

void stm_write_reg(stm_t *stm, uint32_t offset, uint32_t value)
{
    if (!stm) return;

    switch (offset) {
    case STM_CLC:
        stm->clc = value;
        break;

    case STM_CMP0:
        stm->cmp[0] = value;
        break;

    case STM_CMP1:
        stm->cmp[1] = value;
        break;

    case STM_CMCON:
        stm->cmcon = value;
        break;

    case STM_ICR:
        /* ICR write - only enable bits can be modified directly */
        stm->icr = (stm->icr & ~(STM_ICR_CMP0EN | STM_ICR_CMP1EN |
                                  STM_ICR_CMP0OS | STM_ICR_CMP1OS)) |
                   (value & (STM_ICR_CMP0EN | STM_ICR_CMP1EN |
                            STM_ICR_CMP0OS | STM_ICR_CMP1OS));
        break;

    case STM_ISCR:
        /* Interrupt set/clear register */
        /* Bits 0,4: Set request (CMP0SR, CMP1SR) */
        if (value & (1 << 0)) {
            stm->icr |= STM_ICR_CMP0IR;
            stm->irq_pending[0] = true;
        }
        if (value & (1 << 4)) {
            stm->icr |= STM_ICR_CMP1IR;
            stm->irq_pending[1] = true;
        }
        /* Bits 1,5: Clear request (CMP0RC, CMP1RC) */
        if (value & (1 << 1)) {
            stm->icr &= ~STM_ICR_CMP0IR;
            stm->irq_pending[0] = false;
        }
        if (value & (1 << 5)) {
            stm->icr &= ~STM_ICR_CMP1IR;
            stm->irq_pending[1] = false;
        }
        break;

    case STM_OCS:
        stm->ocs = value;
        break;

    case STM_KRSTCLR:
        /* Clear kernel reset status */
        if (value & 0x01) {
            stm->krst0 &= ~0x02;  /* Clear RST bit */
        }
        break;

    case STM_KRST1:
        stm->krst1 = value & 0x01;  /* Only RST bit writable */
        break;

    case STM_KRST0:
        /* Trigger kernel reset if RST bit set in KRST1 */
        if ((value & 0x01) && (stm->krst1 & 0x01)) {
            stm_reset(stm);
            stm->krst0 = 0x02;  /* Set RST status bit */
            stm->krst1 = 0;
        }
        break;

    case STM_ACCEN1:
        stm->accen1 = value;
        break;

    case STM_ACCEN0:
        stm->accen0 = value;
        break;

    default:
        break;
    }
}
