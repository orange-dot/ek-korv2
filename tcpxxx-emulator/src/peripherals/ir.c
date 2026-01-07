/**
 * @file ir.c
 * @brief TC397XP Interrupt Router (IR) Emulation
 *
 * Complete interrupt distribution system for 6 CPU cores:
 * - 1024 Service Request Control (SRC) registers
 * - Priority-based routing (SRPN 0-255)
 * - Type of Service (TOS) for CPU/DMA targeting
 * - Multi-core interrupt arbitration
 * - Software interrupts for IPC
 *
 * Reference: TC39x User Manual, Section 8 (Interrupt Router)
 */

#include "ir.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

/* ==========================================================================
 * Debug Logging
 * ========================================================================== */

#ifdef DEBUG
#define IR_DEBUG(ir, fmt, ...) \
    do { if ((ir)->verbose) printf("[IR] " fmt "\n", ##__VA_ARGS__); } while(0)
#else
#define IR_DEBUG(ir, fmt, ...) \
    do { if ((ir)->verbose) printf("[IR] " fmt "\n", ##__VA_ARGS__); } while(0)
#endif

/* ==========================================================================
 * Internal Helpers
 * ========================================================================== */

/**
 * @brief Convert TOS field to CPU ID
 * @return CPU ID (0-5) or -1 for DMA/invalid
 */
static int tos_to_cpu(uint32_t tos)
{
    switch (tos) {
    case IR_TOS_CPU0: return 0;
    case IR_TOS_CPU1: return 1;
    case IR_TOS_CPU2: return 2;
    case IR_TOS_CPU3: return 3;
    case IR_TOS_CPU4: return 4;
    case IR_TOS_CPU5: return 5;
    case IR_TOS_DMA:  return -1;  /* DMA, not a CPU */
    default:          return -1;  /* Invalid */
    }
}

/**
 * @brief Update pending interrupt cache for a CPU
 */
static void update_pending_cache(ir_t *ir, uint32_t cpu_id)
{
    if (!ir || cpu_id > 5) return;

    ir_pending_t *pend = &ir->pending[cpu_id];
    pend->pending = false;
    pend->priority = 0;
    pend->src_index = 0;
    pend->vector = 0;

    uint8_t best_priority = 0;
    int best_src = -1;

    /* Scan all SRC registers */
    for (uint32_t i = 0; i < IR_NUM_SRC; i++) {
        uint32_t src = ir->src[i];

        /* Check if request is pending and enabled */
        if (!(src & IR_SRC_SRR) || !(src & IR_SRC_SRE)) {
            continue;
        }

        /* Check if targeting this CPU */
        uint32_t tos = (src & IR_SRC_TOS_MASK) >> IR_SRC_TOS_SHIFT;
        if (tos_to_cpu(tos) != (int)cpu_id) {
            continue;
        }

        /* Check priority - higher SRPN wins */
        uint8_t srpn = src & IR_SRC_SRPN_MASK;
        if (srpn > best_priority) {
            best_priority = srpn;
            best_src = (int)i;
        }
    }

    if (best_src >= 0) {
        pend->pending = true;
        pend->src_index = (uint16_t)best_src;
        pend->priority = best_priority;
        /* Vector will be calculated when BIV is known */
    }
}

/**
 * @brief Invalidate pending cache for all CPUs
 */
static void invalidate_all_caches(ir_t *ir)
{
    for (int i = 0; i < 6; i++) {
        ir->pending[i].pending = false;
    }
}

/* ==========================================================================
 * IR Lifecycle
 * ========================================================================== */

ir_t* ir_create(void)
{
    ir_t *ir = calloc(1, sizeof(ir_t));
    if (!ir) {
        return NULL;
    }

    ir_reset(ir);
    return ir;
}

void ir_destroy(ir_t *ir)
{
    if (ir) {
        free(ir);
    }
}

void ir_reset(ir_t *ir)
{
    if (!ir) return;

    /* Clear all SRC registers */
    memset(ir->src, 0, sizeof(ir->src));

    /* Clear pending caches */
    memset(ir->pending, 0, sizeof(ir->pending));

    /* Reset statistics */
    ir->total_asserts = 0;
    ir->total_deliveries = 0;
    ir->total_overflows = 0;

    ir->verbose = false;
}

/* ==========================================================================
 * SRC Register Access
 * ========================================================================== */

uint32_t ir_read_src(ir_t *ir, uint32_t index)
{
    if (!ir || index >= IR_NUM_SRC) return 0;
    return ir->src[index];
}

void ir_write_src(ir_t *ir, uint32_t index, uint32_t value)
{
    if (!ir || index >= IR_NUM_SRC) return;

    uint32_t old = ir->src[index];
    uint32_t new_val = old;

    /* Directly writable fields: SRPN, SRE, TOS */
    new_val = (new_val & ~(IR_SRC_SRPN_MASK | IR_SRC_SRE | IR_SRC_TOS_MASK)) |
              (value & (IR_SRC_SRPN_MASK | IR_SRC_SRE | IR_SRC_TOS_MASK));

    /* CLRR - writing 1 clears SRR */
    if (value & IR_SRC_CLRR) {
        new_val &= ~IR_SRC_SRR;
        IR_DEBUG(ir, "SRC[%u] cleared via CLRR", index);
    }

    /* SETR - writing 1 sets SRR (software trigger) */
    if (value & IR_SRC_SETR) {
        if (new_val & IR_SRC_SRR) {
            /* Already pending - overflow */
            new_val |= IR_SRC_IOV;
            ir->total_overflows++;
        }
        new_val |= IR_SRC_SRR;
        ir->total_asserts++;
        IR_DEBUG(ir, "SRC[%u] set via SETR", index);
    }

    /* IOVCLR - writing 1 clears IOV */
    if (value & IR_SRC_IOVCLR) {
        new_val &= ~IR_SRC_IOV;
    }

    /* SWSCLR - writing 1 clears SWS */
    if (value & IR_SRC_SWSCLR) {
        new_val &= ~IR_SRC_SWS;
    }

    ir->src[index] = new_val;

    /* If SRR, SRE, or TOS changed, invalidate cache */
    if ((old ^ new_val) & (IR_SRC_SRR | IR_SRC_SRE | IR_SRC_TOS_MASK | IR_SRC_SRPN_MASK)) {
        invalidate_all_caches(ir);
    }
}

uint32_t ir_read_reg(ir_t *ir, uint32_t offset)
{
    /* SRC registers are at 4-byte intervals */
    uint32_t index = offset >> 2;
    return ir_read_src(ir, index);
}

void ir_write_reg(ir_t *ir, uint32_t offset, uint32_t value)
{
    uint32_t index = offset >> 2;
    ir_write_src(ir, index, value);
}

/* ==========================================================================
 * Interrupt Control
 * ========================================================================== */

void ir_assert(ir_t *ir, uint32_t src_index)
{
    if (!ir || src_index >= IR_NUM_SRC) return;

    ir->total_asserts++;

    /* Check if already pending */
    if (ir->src[src_index] & IR_SRC_SRR) {
        /* Overflow - request while still pending */
        ir->src[src_index] |= IR_SRC_IOV;
        ir->total_overflows++;
        IR_DEBUG(ir, "SRC[%u] overflow (already pending)", src_index);
    }

    /* Set request flag */
    ir->src[src_index] |= IR_SRC_SRR;

    /* Invalidate cache - a new interrupt is pending */
    invalidate_all_caches(ir);

    IR_DEBUG(ir, "SRC[%u] asserted, SRPN=%u, TOS=%u",
             src_index,
             ir->src[src_index] & IR_SRC_SRPN_MASK,
             (ir->src[src_index] & IR_SRC_TOS_MASK) >> IR_SRC_TOS_SHIFT);
}

void ir_clear(ir_t *ir, uint32_t src_index)
{
    if (!ir || src_index >= IR_NUM_SRC) return;

    if (ir->src[src_index] & IR_SRC_SRR) {
        ir->src[src_index] &= ~IR_SRC_SRR;
        invalidate_all_caches(ir);
        IR_DEBUG(ir, "SRC[%u] cleared", src_index);
    }
}

bool ir_is_pending(ir_t *ir, uint32_t src_index)
{
    if (!ir || src_index >= IR_NUM_SRC) return false;
    return (ir->src[src_index] & IR_SRC_SRR) != 0;
}

void ir_configure_src(ir_t *ir, uint32_t src_index,
                      uint8_t priority, ir_tos_t tos, bool enable)
{
    if (!ir || src_index >= IR_NUM_SRC) return;

    uint32_t value = ir->src[src_index];

    /* Clear configurable fields */
    value &= ~(IR_SRC_SRPN_MASK | IR_SRC_TOS_MASK | IR_SRC_SRE);

    /* Set new values */
    value |= (priority & IR_SRC_SRPN_MASK);
    value |= ((uint32_t)tos << IR_SRC_TOS_SHIFT) & IR_SRC_TOS_MASK;
    if (enable) {
        value |= IR_SRC_SRE;
    }

    ir->src[src_index] = value;
    invalidate_all_caches(ir);

    IR_DEBUG(ir, "SRC[%u] configured: SRPN=%u, TOS=%u, SRE=%d",
             src_index, priority, tos, enable);
}

/* ==========================================================================
 * Multi-core Interrupt Arbitration
 * ========================================================================== */

int ir_get_pending_for_cpu(ir_t *ir, uint32_t cpu_id, uint8_t *priority)
{
    if (!ir || cpu_id > 5) return -1;

    /* Update cache if needed */
    if (!ir->pending[cpu_id].pending) {
        update_pending_cache(ir, cpu_id);
    }

    ir_pending_t *pend = &ir->pending[cpu_id];
    if (!pend->pending) {
        return -1;
    }

    if (priority) {
        *priority = pend->priority;
    }

    return pend->src_index;
}

bool ir_should_interrupt(ir_t *ir, uint32_t cpu_id,
                         uint8_t ccpn, bool ie,
                         uint8_t *out_priority, uint16_t *out_src)
{
    if (!ir || cpu_id > 5) return false;

    /* Interrupts must be enabled */
    if (!ie) return false;

    /* Get highest priority pending interrupt */
    uint8_t pending_priority;
    int src = ir_get_pending_for_cpu(ir, cpu_id, &pending_priority);

    if (src < 0) return false;

    /* Check if pending priority is higher than current */
    if (pending_priority <= ccpn) return false;

    /* Interrupt should be taken */
    if (out_priority) *out_priority = pending_priority;
    if (out_src) *out_src = (uint16_t)src;

    return true;
}

void ir_acknowledge(ir_t *ir, uint32_t src_index)
{
    if (!ir || src_index >= IR_NUM_SRC) return;

    ir->total_deliveries++;

    /* Clear the SRR flag (interrupt acknowledged) */
    ir->src[src_index] &= ~IR_SRC_SRR;

    /* Invalidate cache */
    invalidate_all_caches(ir);

    IR_DEBUG(ir, "SRC[%u] acknowledged", src_index);
}

/* ==========================================================================
 * DMA Trigger Support
 * ========================================================================== */

int ir_get_pending_dma(ir_t *ir, uint8_t *priority)
{
    if (!ir) return -1;

    int best_src = -1;
    uint8_t best_priority = 0;

    for (uint32_t i = 0; i < IR_NUM_SRC; i++) {
        uint32_t src = ir->src[i];

        /* Check if pending and enabled */
        if (!(src & IR_SRC_SRR) || !(src & IR_SRC_SRE)) {
            continue;
        }

        /* Check if targeting DMA */
        uint32_t tos = (src & IR_SRC_TOS_MASK) >> IR_SRC_TOS_SHIFT;
        if (tos != IR_TOS_DMA) {
            continue;
        }

        /* Check priority */
        uint8_t srpn = src & IR_SRC_SRPN_MASK;
        if (srpn > best_priority) {
            best_priority = srpn;
            best_src = (int)i;
        }
    }

    if (best_src >= 0 && priority) {
        *priority = best_priority;
    }

    return best_src;
}

/* ==========================================================================
 * Software Interrupts (IPC)
 * ========================================================================== */

void ir_trigger_sw_interrupt(ir_t *ir, uint32_t sw_index)
{
    if (!ir || sw_index > 7) return;

    uint32_t src_index = IR_SRC_SW_BASE + sw_index;
    ir_assert(ir, src_index);

    IR_DEBUG(ir, "Software interrupt %u triggered", sw_index);
}

void ir_configure_sw_interrupt(ir_t *ir, uint32_t sw_index,
                               uint32_t target_cpu, uint8_t priority)
{
    if (!ir || sw_index > 7 || target_cpu > 5) return;

    uint32_t src_index = IR_SRC_SW_BASE + sw_index;
    ir_tos_t tos;

    switch (target_cpu) {
    case 0: tos = IR_TOS_CPU0; break;
    case 1: tos = IR_TOS_CPU1; break;
    case 2: tos = IR_TOS_CPU2; break;
    case 3: tos = IR_TOS_CPU3; break;
    case 4: tos = IR_TOS_CPU4; break;
    case 5: tos = IR_TOS_CPU5; break;
    default: return;
    }

    ir_configure_src(ir, src_index, priority, tos, true);

    IR_DEBUG(ir, "SW interrupt %u configured: CPU%u, SRPN=%u",
             sw_index, target_cpu, priority);
}

/* ==========================================================================
 * Debug and Statistics
 * ========================================================================== */

void ir_print_status(ir_t *ir)
{
    if (!ir) return;

    printf("\n=== Interrupt Router Status ===\n");
    printf("Total SRC registers: %d\n", IR_NUM_SRC);
    printf("Statistics:\n");
    printf("  Assertions:  %llu\n", (unsigned long long)ir->total_asserts);
    printf("  Deliveries:  %llu\n", (unsigned long long)ir->total_deliveries);
    printf("  Overflows:   %llu\n", (unsigned long long)ir->total_overflows);

    /* Count pending per CPU */
    printf("\nPending interrupts by target:\n");
    int pending_counts[7] = {0};  /* 6 CPUs + DMA */

    for (uint32_t i = 0; i < IR_NUM_SRC; i++) {
        uint32_t src = ir->src[i];
        if ((src & IR_SRC_SRR) && (src & IR_SRC_SRE)) {
            uint32_t tos = (src & IR_SRC_TOS_MASK) >> IR_SRC_TOS_SHIFT;
            int cpu = tos_to_cpu(tos);
            if (cpu >= 0) {
                pending_counts[cpu]++;
            } else if (tos == IR_TOS_DMA) {
                pending_counts[6]++;
            }
        }
    }

    for (int i = 0; i < 6; i++) {
        printf("  CPU%d: %d pending\n", i, pending_counts[i]);
    }
    printf("  DMA:  %d pending\n", pending_counts[6]);
}

void ir_print_pending(ir_t *ir)
{
    if (!ir) return;

    printf("\n=== Pending Interrupts ===\n");

    bool any_pending = false;
    for (uint32_t i = 0; i < IR_NUM_SRC; i++) {
        uint32_t src = ir->src[i];
        if ((src & IR_SRC_SRR) && (src & IR_SRC_SRE)) {
            any_pending = true;
            uint8_t srpn = src & IR_SRC_SRPN_MASK;
            uint32_t tos = (src & IR_SRC_TOS_MASK) >> IR_SRC_TOS_SHIFT;
            const char *target;

            switch (tos) {
            case IR_TOS_CPU0: target = "CPU0"; break;
            case IR_TOS_CPU1: target = "CPU1"; break;
            case IR_TOS_CPU2: target = "CPU2"; break;
            case IR_TOS_CPU3: target = "CPU3"; break;
            case IR_TOS_CPU4: target = "CPU4"; break;
            case IR_TOS_CPU5: target = "CPU5"; break;
            case IR_TOS_DMA:  target = "DMA"; break;
            default:          target = "???"; break;
            }

            printf("  SRC[%3u]: SRPN=%3u -> %s%s\n",
                   i, srpn, target,
                   (src & IR_SRC_IOV) ? " [OVERFLOW]" : "");
        }
    }

    if (!any_pending) {
        printf("  (none)\n");
    }
}

void ir_get_stats(ir_t *ir, uint64_t *asserts,
                  uint64_t *deliveries, uint64_t *overflows)
{
    if (!ir) return;

    if (asserts) *asserts = ir->total_asserts;
    if (deliveries) *deliveries = ir->total_deliveries;
    if (overflows) *overflows = ir->total_overflows;
}

void ir_set_verbose(ir_t *ir, bool verbose)
{
    if (!ir) return;
    ir->verbose = verbose;
}
