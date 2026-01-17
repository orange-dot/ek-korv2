/**
 * @file tricore_irq.h
 * @brief TriCore Interrupt Controller Interface
 *
 * TC397XP uses the Interrupt Router (IR) to distribute service requests
 * to CPU cores or DMA. Each core has its own Interrupt Control Unit (ICU).
 */

#ifndef TRICORE_IRQ_H
#define TRICORE_IRQ_H

#include <stdint.h>
#include <stdbool.h>
#include "tc397xp_regs.h"
#include "tricore_cpu.h"

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Constants
 * ========================================================================== */

#define IRQ_MAX_PRIORITY        255     /**< Maximum interrupt priority */
#define IRQ_MIN_PRIORITY        1       /**< Minimum interrupt priority (0 = disabled) */
#define IRQ_PRIORITY_KERNEL     200     /**< Kernel-level interrupts */
#define IRQ_PRIORITY_IPI        150     /**< Inter-processor interrupt priority */
#define IRQ_PRIORITY_SYSTICK    100     /**< System tick priority */
#define IRQ_PRIORITY_LOW        50      /**< Low priority */

/* Number of service request nodes */
#define SRC_COUNT               1024    /**< Total SRC nodes in TC397XP */

/* GPSR interrupt numbers (base + core * 4 + channel) */
#define IRQ_GPSR_BASE           200     /**< Base IRQ number for GPSR */

/* ==========================================================================
 * Types
 * ========================================================================== */

/**
 * @brief Type of service destination
 */
typedef enum {
    IRQ_TOS_CPU0 = 0,       /**< Route to CPU0 */
    IRQ_TOS_CPU1 = 1,       /**< Route to CPU1 */
    IRQ_TOS_CPU2 = 2,       /**< Route to CPU2 */
    IRQ_TOS_CPU3 = 3,       /**< Route to CPU3 (if not DMA) */
    IRQ_TOS_DMA  = 3,       /**< Route to DMA (context-dependent) */
    IRQ_TOS_CPU4 = 4,       /**< Route to CPU4 */
    IRQ_TOS_CPU5 = 5,       /**< Route to CPU5 */
} irq_tos_t;

/**
 * @brief Interrupt handler function type
 */
typedef void (*irq_handler_t)(void);

/**
 * @brief Interrupt configuration
 */
typedef struct {
    uint8_t         priority;       /**< Priority (0-255, 0=disabled) */
    irq_tos_t       tos;            /**< Target of Service */
    irq_handler_t   handler;        /**< Handler function */
    bool            enabled;        /**< Enable flag */
} irq_config_t;

/* ==========================================================================
 * Interrupt Vector Numbers
 * ========================================================================== */

/**
 * @defgroup IRQ_VECTORS Common Interrupt Vector Numbers
 * @{
 */

/* STM (System Timer) interrupts */
#define IRQ_STM0_CMP0       0       /**< STM0 Compare 0 */
#define IRQ_STM0_CMP1       1       /**< STM0 Compare 1 */
#define IRQ_STM1_CMP0       2       /**< STM1 Compare 0 */
#define IRQ_STM1_CMP1       3       /**< STM1 Compare 1 */
#define IRQ_STM2_CMP0       4       /**< STM2 Compare 0 */
#define IRQ_STM2_CMP1       5       /**< STM2 Compare 1 */
/* ... continues for STM3-5 */

/* ASCLIN interrupts */
#define IRQ_ASCLIN0_TX      20      /**< ASCLIN0 Transmit */
#define IRQ_ASCLIN0_RX      21      /**< ASCLIN0 Receive */
#define IRQ_ASCLIN0_ERR     22      /**< ASCLIN0 Error */
/* ... continues for ASCLIN1-23 */

/* CAN interrupts */
#define IRQ_CAN0_INT0       100     /**< CAN0 Interrupt Line 0 */
#define IRQ_CAN0_INT1       101     /**< CAN0 Interrupt Line 1 */
/* ... continues for CAN1-11 */

/** @} */

/* ==========================================================================
 * Function Prototypes
 * ========================================================================== */

/**
 * @brief Initialize interrupt subsystem for current core
 *
 * Sets up:
 *   - Base Interrupt Vector (BIV)
 *   - ICR to enable interrupts
 *   - Default priorities
 */
void irq_init(void);

/**
 * @brief Set interrupt vector table base address
 * @param base Vector table base (must be 8KB aligned)
 */
void irq_set_vector_base(uint32_t base);

/**
 * @brief Register an interrupt handler
 *
 * @param irq_num Interrupt/SRC number
 * @param priority Priority (1-255, higher = more urgent)
 * @param tos Target of Service (CPU0-5 or DMA)
 * @param handler Handler function
 * @return 0 on success, -1 on error
 */
int irq_register(uint32_t irq_num, uint8_t priority, irq_tos_t tos, irq_handler_t handler);

/**
 * @brief Unregister an interrupt handler
 * @param irq_num Interrupt number
 */
void irq_unregister(uint32_t irq_num);

/**
 * @brief Enable an interrupt
 * @param irq_num Interrupt number
 */
void irq_enable(uint32_t irq_num);

/**
 * @brief Disable an interrupt
 * @param irq_num Interrupt number
 */
void irq_disable(uint32_t irq_num);

/**
 * @brief Set interrupt priority
 * @param irq_num Interrupt number
 * @param priority New priority (0-255)
 */
void irq_set_priority(uint32_t irq_num, uint8_t priority);

/**
 * @brief Get interrupt priority
 * @param irq_num Interrupt number
 * @return Current priority
 */
uint8_t irq_get_priority(uint32_t irq_num);

/**
 * @brief Trigger a software interrupt
 * @param irq_num Interrupt number
 */
void irq_trigger(uint32_t irq_num);

/**
 * @brief Clear pending interrupt
 * @param irq_num Interrupt number
 */
void irq_clear_pending(uint32_t irq_num);

/**
 * @brief Check if interrupt is pending
 * @param irq_num Interrupt number
 * @return true if pending
 */
bool irq_is_pending(uint32_t irq_num);

/* ==========================================================================
 * Global Interrupt Control
 * ========================================================================== */

/**
 * @brief Enable global interrupts
 */
static inline void irq_global_enable(void)
{
    __enable();
}

/**
 * @brief Disable global interrupts
 */
static inline void irq_global_disable(void)
{
    __disable();
}

/**
 * @brief Check if global interrupts are enabled
 * @return true if enabled
 */
static inline bool irq_global_enabled(void)
{
    return cpu_interrupts_enabled();
}

/**
 * @brief Get current CPU priority level
 * @return Current priority (from ICR.CCPN)
 */
static inline uint8_t irq_get_current_priority(void)
{
    return __mfcr(CSFR_ICR) & ICR_CCPN_MASK;
}

/**
 * @brief Set current CPU priority level
 * @param priority New priority level
 */
void irq_set_current_priority(uint8_t priority);

/* ==========================================================================
 * SRC (Service Request Control) Access
 * ========================================================================== */

/**
 * @brief Get SRC register address for an interrupt
 * @param irq_num Interrupt number
 * @return SRC register address
 */
uint32_t irq_get_src_addr(uint32_t irq_num);

/**
 * @brief Configure SRC register directly
 * @param src_addr SRC register address
 * @param priority Priority number (SRPN)
 * @param tos Type of service
 * @param enable Enable flag
 */
void irq_configure_src(uint32_t src_addr, uint8_t priority, irq_tos_t tos, bool enable);

/* ==========================================================================
 * Interrupt Handler Support
 * ========================================================================== */

/**
 * @brief Common interrupt entry point
 *
 * Called from interrupt vector table. Looks up and calls registered handler.
 *
 * @param priority Priority number from interrupt
 */
void irq_common_handler(uint32_t priority);

/**
 * @brief Default unhandled interrupt handler
 */
void irq_default_handler(void);

#ifdef __cplusplus
}
#endif

#endif /* TRICORE_IRQ_H */
