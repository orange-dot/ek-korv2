/**
 * @file peripherals.h
 * @brief TC397XP Peripheral Subsystem
 *
 * Unified peripheral interface for STM, ASCLIN, IR, SCU.
 */

#ifndef PERIPHERALS_H
#define PERIPHERALS_H

#include <stdint.h>
#include <stdbool.h>

/* ==========================================================================
 * TC397XP Peripheral Base Addresses (from User Manual)
 * ========================================================================== */

/* STM - System Timer Modules (one per core) */
#define STM0_BASE       0xF0001000
#define STM1_BASE       0xF0001100
#define STM2_BASE       0xF0001200
#define STM3_BASE       0xF0001300
#define STM4_BASE       0xF0001400
#define STM5_BASE       0xF0001500
#define STM_SIZE        0x100

/* ASCLIN - Async/Sync Serial Interface */
#define ASCLIN0_BASE    0xF0000600
#define ASCLIN1_BASE    0xF0000700
#define ASCLIN_SIZE     0x100

/* IR - Interrupt Router: see ir.h for IR_BASE_ADDR, IR_SIZE */

/* SCU - System Control Unit: see scu.h for SCU_BASE_ADDR, SCU_SIZE */

/* ==========================================================================
 * STM - System Timer Module
 * ========================================================================== */

/* STM Register Offsets */
#define STM_CLC         0x00    /* Clock Control */
#define STM_ID          0x08    /* Module ID */
#define STM_TIM0        0x10    /* Timer bits [31:0] */
#define STM_TIM1        0x14    /* Timer bits [35:4] */
#define STM_TIM2        0x18    /* Timer bits [39:8] */
#define STM_TIM3        0x1C    /* Timer bits [43:12] */
#define STM_TIM4        0x20    /* Timer bits [47:16] */
#define STM_TIM5        0x24    /* Timer bits [51:20] */
#define STM_TIM6        0x28    /* Timer bits [55:24] (CAP) */
#define STM_CAP         0x2C    /* Capture register */
#define STM_CMP0        0x30    /* Compare 0 */
#define STM_CMP1        0x34    /* Compare 1 */
#define STM_CMCON       0x38    /* Compare match control */
#define STM_ICR         0x3C    /* Interrupt control */
#define STM_ISCR        0x40    /* Interrupt set/clear */
#define STM_TIM0SV      0x50    /* Timer 0 shadow value */
#define STM_CAPSV       0x54    /* Capture shadow value */
#define STM_OCS         0xE8    /* OCDS Control */
#define STM_KRSTCLR     0xEC    /* Kernel Reset Clear */
#define STM_KRST1       0xF0    /* Kernel Reset 1 */
#define STM_KRST0       0xF4    /* Kernel Reset 0 */
#define STM_ACCEN1      0xF8    /* Access Enable 1 */
#define STM_ACCEN0      0xFC    /* Access Enable 0 */

/* STM_CMCON bits */
#define STM_CMCON_MSIZE0_MASK   0x0000001F  /* Compare size for CMP0 */
#define STM_CMCON_MSTART0_MASK  0x00001F00  /* Compare start bit for CMP0 */
#define STM_CMCON_MSIZE1_MASK   0x001F0000  /* Compare size for CMP1 */
#define STM_CMCON_MSTART1_MASK  0x1F000000  /* Compare start bit for CMP1 */

/* STM_ICR bits */
#define STM_ICR_CMP0EN      (1 << 0)    /* Compare 0 interrupt enable */
#define STM_ICR_CMP1EN      (1 << 4)    /* Compare 1 interrupt enable */
#define STM_ICR_CMP0IR      (1 << 1)    /* Compare 0 interrupt request */
#define STM_ICR_CMP1IR      (1 << 5)    /* Compare 1 interrupt request */
#define STM_ICR_CMP0OS      (1 << 2)    /* Compare 0 output selection */
#define STM_ICR_CMP1OS      (1 << 6)    /* Compare 1 output selection */

typedef struct stm stm_t;

stm_t* stm_create(uint32_t core_id);
void stm_destroy(stm_t *stm);
void stm_reset(stm_t *stm);
void stm_tick(stm_t *stm, uint32_t cycles);
uint64_t stm_get_counter(stm_t *stm);
uint32_t stm_read_reg(stm_t *stm, uint32_t offset);
void stm_write_reg(stm_t *stm, uint32_t offset, uint32_t value);
bool stm_irq_pending(stm_t *stm, int cmp_index);
void stm_clear_irq(stm_t *stm, int cmp_index);

/* ==========================================================================
 * ASCLIN - Async/Sync Serial Interface (UART mode)
 * ========================================================================== */

/* ASCLIN Register Offsets */
#define ASCLIN_CLC          0x00    /* Clock Control */
#define ASCLIN_PISEL        0x04    /* Port Input Select */
#define ASCLIN_ID           0x08    /* Module ID */
#define ASCLIN_TXDATA       0x0C    /* TX Data */
#define ASCLIN_RXDATA       0x10    /* RX Data */
#define ASCLIN_BITCON       0x14    /* Bit Configuration */
#define ASCLIN_FRAMECON     0x18    /* Frame Configuration */
#define ASCLIN_DATCON       0x1C    /* Data Configuration */
#define ASCLIN_BRG          0x20    /* Baud Rate Generator */
#define ASCLIN_IOCR         0x24    /* IO Control */
#define ASCLIN_CSR          0x28    /* Clock Select/Status */
#define ASCLIN_FLAGS        0x2C    /* Flags Register */
#define ASCLIN_FLAGSSET     0x30    /* Flags Set */
#define ASCLIN_FLAGSCLEAR   0x34    /* Flags Clear */
#define ASCLIN_FLAGSEN      0x38    /* Flags Enable (interrupt enable) */
#define ASCLIN_TXFIFOCON    0x3C    /* TX FIFO Configuration */
#define ASCLIN_RXFIFOCON    0x40    /* RX FIFO Configuration */
#define ASCLIN_LINCON       0x44    /* LIN Control */
#define ASCLIN_LINBTIMER    0x48    /* LIN Break Timer */
#define ASCLIN_LINHTIMER    0x4C    /* LIN Header Timer */
#define ASCLIN_OCS          0xE8    /* OCDS Control */
#define ASCLIN_KRSTCLR      0xEC    /* Kernel Reset Clear */
#define ASCLIN_KRST1        0xF0    /* Kernel Reset 1 */
#define ASCLIN_KRST0        0xF4    /* Kernel Reset 0 */
#define ASCLIN_ACCEN1       0xF8    /* Access Enable 1 */
#define ASCLIN_ACCEN0       0xFC    /* Access Enable 0 */

/* ASCLIN_FLAGS bits */
#define ASCLIN_FLAGS_TH     (1 << 0)    /* TX FIFO level below threshold */
#define ASCLIN_FLAGS_TR     (1 << 1)    /* TX FIFO request */
#define ASCLIN_FLAGS_RH     (1 << 2)    /* RX FIFO level above threshold */
#define ASCLIN_FLAGS_RR     (1 << 3)    /* RX FIFO request */
#define ASCLIN_FLAGS_FE     (1 << 4)    /* Framing Error */
#define ASCLIN_FLAGS_TC     (1 << 5)    /* Transmission complete */
#define ASCLIN_FLAGS_RFO    (1 << 6)    /* RX FIFO Overflow */
#define ASCLIN_FLAGS_TFO    (1 << 7)    /* TX FIFO Overflow */
#define ASCLIN_FLAGS_PE     (1 << 8)    /* Parity Error */
#define ASCLIN_FLAGS_RFU    (1 << 9)    /* RX FIFO Underflow */
#define ASCLIN_FLAGS_BD     (1 << 10)   /* Break Detected */
#define ASCLIN_FLAGS_LP     (1 << 11)   /* LIN Parity Error */
#define ASCLIN_FLAGS_LC     (1 << 12)   /* LIN Checksum Error */
#define ASCLIN_FLAGS_CE     (1 << 13)   /* Collision Error */
#define ASCLIN_FLAGS_RBI    (1 << 14)   /* RX Break Interrupt */
#define ASCLIN_FLAGS_TBI    (1 << 15)   /* TX Break Interrupt */

/* ASCLIN_CSR bits */
#define ASCLIN_CSR_CLKSEL_MASK  0x0000001F  /* Clock select */
#define ASCLIN_CSR_CON          (1 << 31)   /* Clock enable */

/* ASCLIN_FRAMECON bits */
#define ASCLIN_FRAMECON_MODE_MASK   0x00030000  /* Mode: 0=Init, 1=ASC, 2=LIN, 3=SPI */
#define ASCLIN_FRAMECON_MODE_SHIFT  16

typedef struct asclin asclin_t;

asclin_t* asclin_create(uint32_t index);
void asclin_destroy(asclin_t *asclin);
void asclin_reset(asclin_t *asclin);
uint32_t asclin_read_reg(asclin_t *uart, uint32_t offset);
void asclin_write_reg(asclin_t *uart, uint32_t offset, uint32_t value);
bool asclin_tx_ready(asclin_t *uart);
bool asclin_rx_ready(asclin_t *uart);
int asclin_poll_rx(asclin_t *uart);  /* Non-blocking read from stdin */

/* ==========================================================================
 * IR - Interrupt Router
 * ========================================================================== */

/* Full IR interface is in ir.h */
#include "ir.h"

/* ==========================================================================
 * SCU - System Control Unit
 * ========================================================================== */

/* Full SCU interface is in scu.h */
#include "scu.h"

/* ==========================================================================
 * Peripheral Bus - Unified memory-mapped access
 * ========================================================================== */

typedef struct periph_bus periph_bus_t;

periph_bus_t* periph_bus_create(void);
void periph_bus_destroy(periph_bus_t *bus);

/* Memory-mapped access */
uint32_t periph_read32(periph_bus_t *bus, uint32_t addr);
void periph_write32(periph_bus_t *bus, uint32_t addr, uint32_t value);

/* Tick all peripherals */
void periph_tick(periph_bus_t *bus, uint32_t core_id, uint32_t cycles);

/* Get pending interrupt for CPU */
int periph_get_pending_irq(periph_bus_t *bus, uint32_t cpu_id, uint8_t *priority);

/* Access individual peripherals (for testing) */
stm_t* periph_get_stm(periph_bus_t *bus, uint32_t core_id);
asclin_t* periph_get_asclin(periph_bus_t *bus, uint32_t index);
ir_t* periph_get_ir(periph_bus_t *bus);
scu_t* periph_get_scu(periph_bus_t *bus);

#endif /* PERIPHERALS_H */
