/**
 * @file tricore_irq.c
 * @brief TriCore Interrupt Controller Implementation
 */

#include "tricore_irq.h"
#include "tricore_csa.h"
#include <string.h>

/* ==========================================================================
 * External Symbols
 * ========================================================================== */

extern uint32_t __INTTAB_BASE;

/* ==========================================================================
 * Handler Table
 * ========================================================================== */

/* Handler table indexed by priority number */
static irq_handler_t g_irq_handlers[IRQ_MAX_PRIORITY + 1];

/* ==========================================================================
 * SRC Register Mapping
 *
 * TC397XP has ~1024 SRC registers for different peripherals.
 * This maps interrupt numbers to SRC addresses.
 * ========================================================================== */

/* SRC base addresses for different peripherals */
#define SRC_STM_BASE            (SRC_BASE + 0x490)  /* STM0-5 */
#define SRC_ASCLIN_BASE         (SRC_BASE + 0x040)  /* ASCLIN0-23 */
#define SRC_CAN_BASE            (SRC_BASE + 0x420)  /* CAN0-11 */

/* SRC register offsets */
#define SRC_STM_OFFSET(core, cmp)   (SRC_STM_BASE + (core) * 8 + (cmp) * 4)
#define SRC_ASCLIN_OFFSET(n, type)  (SRC_ASCLIN_BASE + (n) * 12 + (type) * 4)

/* SRC_GPSR for IPI is defined in tc397xp_regs.h */

uint32_t irq_get_src_addr(uint32_t irq_num)
{
    /*
     * Map logical interrupt numbers to SRC addresses.
     * This is a simplified mapping - real implementation would have
     * a complete lookup table.
     */

    /* STM interrupts: 0-11 */
    if (irq_num < 12) {
        uint32_t core = irq_num / 2;
        uint32_t cmp = irq_num % 2;
        return SRC_STM_OFFSET(core, cmp);
    }

    /* ASCLIN interrupts: 20-92 (ASCLIN0-23, 3 per module) */
    if (irq_num >= 20 && irq_num < 92) {
        uint32_t idx = irq_num - 20;
        uint32_t module = idx / 3;
        uint32_t type = idx % 3;  /* 0=TX, 1=RX, 2=ERR */
        return SRC_ASCLIN_OFFSET(module, type);
    }

    /* CAN interrupts: 100-123 (CAN0-11, 2 per module) */
    if (irq_num >= 100 && irq_num < 124) {
        uint32_t idx = irq_num - 100;
        return SRC_CAN_BASE + idx * 4;
    }

    /* Default: return invalid */
    return 0;
}

/* ==========================================================================
 * Initialization
 * ========================================================================== */

void irq_init(void)
{
    uint32_t core_id = cpu_get_id();

    /* Clear handler table */
    memset(g_irq_handlers, 0, sizeof(g_irq_handlers));

    /* Set Base Interrupt Vector (BIV) */
    uint32_t biv = (uint32_t)&__INTTAB_BASE;
    __mtcr(CSFR_BIV, biv);
    __isync();

    /* Initialize ICR (Interrupt Control Register) */
    /* Start with interrupts disabled and priority 0 */
    uint32_t icr = 0;
    __mtcr(CSFR_ICR, icr);
    __isync();

    /* Install default handler for unhandled interrupts */
    for (int i = 1; i <= IRQ_MAX_PRIORITY; i++) {
        g_irq_handlers[i] = irq_default_handler;
    }

    (void)core_id;  /* May be used for per-core configuration */
}

void irq_set_vector_base(uint32_t base)
{
    /* BIV must be 8KB aligned */
    if ((base & 0x1FFF) != 0) {
        return;
    }

    __mtcr(CSFR_BIV, base);
    __isync();
}

/* ==========================================================================
 * Interrupt Registration
 * ========================================================================== */

int irq_register(uint32_t irq_num, uint8_t priority, irq_tos_t tos, irq_handler_t handler)
{
    if (priority == 0 || priority > IRQ_MAX_PRIORITY) {
        return -1;
    }

    if (handler == NULL) {
        return -1;
    }

    uint32_t src_addr = irq_get_src_addr(irq_num);
    if (src_addr == 0) {
        return -1;
    }

    /* Register handler */
    g_irq_handlers[priority] = handler;

    /* Configure SRC register */
    irq_configure_src(src_addr, priority, tos, true);

    return 0;
}

void irq_unregister(uint32_t irq_num)
{
    uint32_t src_addr = irq_get_src_addr(irq_num);
    if (src_addr == 0) {
        return;
    }

    /* Disable interrupt */
    uint32_t src = REG_READ32(src_addr);
    src &= ~SRC_SRE;
    REG_WRITE32(src_addr, src);

    /* Get priority and clear handler */
    uint8_t priority = src & SRC_SRPN_MASK;
    if (priority <= IRQ_MAX_PRIORITY) {
        g_irq_handlers[priority] = irq_default_handler;
    }
}

/* ==========================================================================
 * Interrupt Enable/Disable
 * ========================================================================== */

void irq_enable(uint32_t irq_num)
{
    uint32_t src_addr = irq_get_src_addr(irq_num);
    if (src_addr == 0) {
        return;
    }

    uint32_t src = REG_READ32(src_addr);
    src |= SRC_SRE;
    REG_WRITE32(src_addr, src);
}

void irq_disable(uint32_t irq_num)
{
    uint32_t src_addr = irq_get_src_addr(irq_num);
    if (src_addr == 0) {
        return;
    }

    uint32_t src = REG_READ32(src_addr);
    src &= ~SRC_SRE;
    REG_WRITE32(src_addr, src);
}

/* ==========================================================================
 * Priority Management
 * ========================================================================== */

void irq_set_priority(uint32_t irq_num, uint8_t priority)
{
    uint32_t src_addr = irq_get_src_addr(irq_num);
    if (src_addr == 0) {
        return;
    }

    uint32_t src = REG_READ32(src_addr);
    src = (src & ~SRC_SRPN_MASK) | (priority & SRC_SRPN_MASK);
    REG_WRITE32(src_addr, src);
}

uint8_t irq_get_priority(uint32_t irq_num)
{
    uint32_t src_addr = irq_get_src_addr(irq_num);
    if (src_addr == 0) {
        return 0;
    }

    uint32_t src = REG_READ32(src_addr);
    return src & SRC_SRPN_MASK;
}

void irq_set_current_priority(uint8_t priority)
{
    uint32_t icr = __mfcr(CSFR_ICR);
    icr = (icr & ~ICR_CCPN_MASK) | (priority & ICR_CCPN_MASK);
    __mtcr(CSFR_ICR, icr);
    __isync();
}

/* ==========================================================================
 * Pending/Trigger
 * ========================================================================== */

void irq_trigger(uint32_t irq_num)
{
    uint32_t src_addr = irq_get_src_addr(irq_num);
    if (src_addr == 0) {
        return;
    }

    /* Set SETR bit to trigger software request */
    uint32_t src = REG_READ32(src_addr);
    src |= SRC_SETR;
    REG_WRITE32(src_addr, src);
}

void irq_clear_pending(uint32_t irq_num)
{
    uint32_t src_addr = irq_get_src_addr(irq_num);
    if (src_addr == 0) {
        return;
    }

    /* Set CLRR bit to clear request */
    uint32_t src = REG_READ32(src_addr);
    src |= SRC_CLRR;
    REG_WRITE32(src_addr, src);
}

bool irq_is_pending(uint32_t irq_num)
{
    uint32_t src_addr = irq_get_src_addr(irq_num);
    if (src_addr == 0) {
        return false;
    }

    uint32_t src = REG_READ32(src_addr);
    return (src & SRC_SRR) != 0;
}

/* ==========================================================================
 * SRC Configuration
 * ========================================================================== */

void irq_configure_src(uint32_t src_addr, uint8_t priority, irq_tos_t tos, bool enable)
{
    if (src_addr == 0) {
        return;
    }

    uint32_t src = 0;

    /* Set priority (SRPN) */
    src |= (priority & SRC_SRPN_MASK);

    /* Set type of service (TOS) */
    src |= ((uint32_t)tos << 11) & SRC_TOS_MASK;

    /* Set enable bit */
    if (enable) {
        src |= SRC_SRE;
    }

    REG_WRITE32(src_addr, src);
}

/* ==========================================================================
 * Interrupt Handlers
 * ========================================================================== */

void irq_common_handler(uint32_t priority)
{
    if (priority <= IRQ_MAX_PRIORITY && g_irq_handlers[priority] != NULL) {
        g_irq_handlers[priority]();
    }
}

void irq_default_handler(void)
{
    /*
     * Default handler for unregistered interrupts.
     * In debug mode, we might want to halt or log.
     * In production, just return.
     */
#ifdef JEZGRO_DEBUG
    /* Could trigger debug breakpoint or log */
    __debug();
#endif
}

/* ==========================================================================
 * Interrupt Vector Table Generation
 *
 * TriCore requires a specific vector table format:
 *   - 8KB aligned
 *   - 32 bytes per vector entry
 *   - Entry jumps to handler based on priority
 *
 * This is typically defined in assembly (crt0_tc397xp.s)
 * ========================================================================== */
