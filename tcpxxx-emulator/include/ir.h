/**
 * @file ir.h
 * @brief TC397XP Interrupt Router (IR) Interface
 *
 * The Interrupt Router provides centralized interrupt distribution:
 * - 1024 Service Request Control (SRC) registers
 * - Priority-based routing (SRPN 0-255)
 * - Type of Service (TOS) field for CPU/DMA targeting
 * - Multi-core interrupt delivery with arbitration
 *
 * Interrupt Flow:
 * 1. Peripheral asserts interrupt → SRC.SRR = 1
 * 2. IR checks SRC.SRE (enabled) and SRC.TOS (target)
 * 3. IR compares SRC.SRPN with CPU's ICR.CCPN
 * 4. If SRPN > CCPN and ICR.IE=1, interrupt is delivered
 * 5. CPU jumps to BIV + (SRPN * 32), sets ICR.CCPN = SRPN
 * 6. ISR clears SRC.SRR via CLRR bit or peripheral action
 */

#ifndef IR_H
#define IR_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * IR Base Address and Size
 * ========================================================================== */

#define IR_BASE_ADDR            0xF0038000
#define IR_SIZE                 0x2000      /* 8KB for SRC registers */

/* ==========================================================================
 * SRC Register Layout
 * ========================================================================== */

/*
 * SRC Register Bit Fields (32-bit):
 * [7:0]   SRPN   - Service Request Priority Number (0-255)
 * [9:8]   Reserved
 * [10]    SRE    - Service Request Enable
 * [13:11] TOS    - Type of Service (target CPU/DMA)
 * [15:14] Reserved
 * [23:16] Reserved (ECC in real HW)
 * [24]    SRR    - Service Request flag (read-only status)
 * [25]    CLRR   - Clear Request (write 1 to clear SRR)
 * [26]    SETR   - Set Request (write 1 to set SRR)
 * [27]    IOV    - Interrupt Overflow (set if SRR already 1)
 * [28]    IOVCLR - Clear Overflow (write 1 to clear IOV)
 * [29]    SWS    - Software Sticky bit
 * [30]    SWSCLR - Clear SWS (write 1 to clear)
 * [31]    Reserved
 */

#define IR_SRC_SRPN_MASK        0x000000FF  /* Priority Number [7:0] */
#define IR_SRC_SRPN_SHIFT       0
#define IR_SRC_SRE              (1U << 10)  /* Service Request Enable */
#define IR_SRC_TOS_MASK         0x00003800  /* Type of Service [13:11] */
#define IR_SRC_TOS_SHIFT        11
#define IR_SRC_SRR              (1U << 24)  /* Service Request flag */
#define IR_SRC_CLRR             (1U << 25)  /* Clear Request */
#define IR_SRC_SETR             (1U << 26)  /* Set Request */
#define IR_SRC_IOV              (1U << 27)  /* Interrupt Overflow */
#define IR_SRC_IOVCLR           (1U << 28)  /* Clear Overflow */
#define IR_SRC_SWS              (1U << 29)  /* Software Sticky */
#define IR_SRC_SWSCLR           (1U << 30)  /* Clear SWS */

/* ==========================================================================
 * Type of Service (TOS) Values
 * ========================================================================== */

typedef enum {
    IR_TOS_CPU0     = 0,    /* Route to CPU0 */
    IR_TOS_DMA      = 1,    /* Route to DMA */
    IR_TOS_CPU1     = 2,    /* Route to CPU1 */
    IR_TOS_CPU2     = 3,    /* Route to CPU2 */
    IR_TOS_CPU3     = 4,    /* Route to CPU3 */
    IR_TOS_CPU4     = 5,    /* Route to CPU4 */
    IR_TOS_CPU5     = 6,    /* Route to CPU5 */
    IR_TOS_RESERVED = 7,    /* Reserved */
} ir_tos_t;

/* Convert TOS to CPU ID (-1 if DMA or invalid) */
#define IR_TOS_TO_CPU(tos) \
    ((tos) == IR_TOS_CPU0 ? 0 : \
     (tos) == IR_TOS_CPU1 ? 1 : \
     (tos) == IR_TOS_CPU2 ? 2 : \
     (tos) == IR_TOS_CPU3 ? 3 : \
     (tos) == IR_TOS_CPU4 ? 4 : \
     (tos) == IR_TOS_CPU5 ? 5 : -1)

/* Convert CPU ID to TOS */
#define IR_CPU_TO_TOS(cpu) \
    ((cpu) == 0 ? IR_TOS_CPU0 : \
     (cpu) == 1 ? IR_TOS_CPU1 : \
     (cpu) == 2 ? IR_TOS_CPU2 : \
     (cpu) == 3 ? IR_TOS_CPU3 : \
     (cpu) == 4 ? IR_TOS_CPU4 : \
     (cpu) == 5 ? IR_TOS_CPU5 : IR_TOS_RESERVED)

/* ==========================================================================
 * SRC Register Index Assignments (TC397XP)
 * ========================================================================== */

/* Total SRC registers */
#define IR_NUM_SRC              1024

/* STM - System Timer Modules (6 modules × 2 compare channels) */
#define IR_SRC_STM0_SR0         0x000   /* STM0 Compare 0 */
#define IR_SRC_STM0_SR1         0x001   /* STM0 Compare 1 */
#define IR_SRC_STM1_SR0         0x002   /* STM1 Compare 0 */
#define IR_SRC_STM1_SR1         0x003   /* STM1 Compare 1 */
#define IR_SRC_STM2_SR0         0x004   /* STM2 Compare 0 */
#define IR_SRC_STM2_SR1         0x005   /* STM2 Compare 1 */
#define IR_SRC_STM3_SR0         0x006   /* STM3 Compare 0 */
#define IR_SRC_STM3_SR1         0x007   /* STM3 Compare 1 */
#define IR_SRC_STM4_SR0         0x008   /* STM4 Compare 0 */
#define IR_SRC_STM4_SR1         0x009   /* STM4 Compare 1 */
#define IR_SRC_STM5_SR0         0x00A   /* STM5 Compare 0 */
#define IR_SRC_STM5_SR1         0x00B   /* STM5 Compare 1 */

/* ASCLIN - Async/Sync Serial Interface (12 modules × 4 sources) */
#define IR_SRC_ASCLIN_BASE      0x030
#define IR_SRC_ASCLIN0_TX       0x030   /* ASCLIN0 TX */
#define IR_SRC_ASCLIN0_RX       0x031   /* ASCLIN0 RX */
#define IR_SRC_ASCLIN0_ERR      0x032   /* ASCLIN0 Error */
#define IR_SRC_ASCLIN1_TX       0x034   /* ASCLIN1 TX */
#define IR_SRC_ASCLIN1_RX       0x035   /* ASCLIN1 RX */
#define IR_SRC_ASCLIN1_ERR      0x036   /* ASCLIN1 Error */
/* ... ASCLIN2-11 follow same pattern */

/* GPSRx - General Purpose Service Requests (4 groups × 3 sources) */
#define IR_SRC_GPSR_BASE        0x100
#define IR_SRC_GPSR0_SR0        0x100   /* GPSR Group 0, Source 0 */
#define IR_SRC_GPSR0_SR1        0x101   /* GPSR Group 0, Source 1 */
#define IR_SRC_GPSR0_SR2        0x102   /* GPSR Group 0, Source 2 */
#define IR_SRC_GPSR0_SR3        0x103   /* GPSR Group 0, Source 3 */
#define IR_SRC_GPSR1_SR0        0x104   /* GPSR Group 1, Source 0 */
#define IR_SRC_GPSR1_SR1        0x105   /* GPSR Group 1, Source 1 */
#define IR_SRC_GPSR1_SR2        0x106   /* GPSR Group 1, Source 2 */
#define IR_SRC_GPSR1_SR3        0x107   /* GPSR Group 1, Source 3 */
#define IR_SRC_GPSR2_SR0        0x108   /* GPSR Group 2, Source 0 */
#define IR_SRC_GPSR2_SR1        0x109   /* GPSR Group 2, Source 1 */
#define IR_SRC_GPSR2_SR2        0x10A   /* GPSR Group 2, Source 2 */
#define IR_SRC_GPSR2_SR3        0x10B   /* GPSR Group 2, Source 3 */

/* CAN - Controller Area Network (4 modules) */
#define IR_SRC_CAN_BASE         0x200
#define IR_SRC_CAN0_INT0        0x200   /* CAN0 Interrupt 0 */
#define IR_SRC_CAN0_INT1        0x201   /* CAN0 Interrupt 1 */
#define IR_SRC_CAN0_INT2        0x202   /* CAN0 Interrupt 2 */
#define IR_SRC_CAN0_INT3        0x203   /* CAN0 Interrupt 3 */
/* ... CAN1-3 follow */

/* GTM - Generic Timer Module */
#define IR_SRC_GTM_BASE         0x300
#define IR_SRC_GTM_ATOM0_SR0    0x300   /* GTM ATOM0 */
/* ... many GTM sources */

/* DMA - Direct Memory Access */
#define IR_SRC_DMA_BASE         0x400
#define IR_SRC_DMA_CH0          0x400   /* DMA Channel 0 */
#define IR_SRC_DMA_CH1          0x401   /* DMA Channel 1 */
/* ... DMA channels 0-127 */
#define IR_SRC_DMA_ERR          0x480   /* DMA Error */

/* SMU - Safety Management Unit */
#define IR_SRC_SMU_SR0          0x500   /* SMU Service Request 0 */
#define IR_SRC_SMU_SR1          0x501   /* SMU Service Request 1 */
#define IR_SRC_SMU_SR2          0x502   /* SMU Service Request 2 */

/* SCU - System Control Unit */
#define IR_SRC_SCU_DTS          0x510   /* Die Temperature Sensor */
#define IR_SRC_SCU_ERU0         0x511   /* External Request 0 */
#define IR_SRC_SCU_ERU1         0x512   /* External Request 1 */
#define IR_SRC_SCU_ERU2         0x513   /* External Request 2 */
#define IR_SRC_SCU_ERU3         0x514   /* External Request 3 */

/* QSPI - Queued SPI */
#define IR_SRC_QSPI_BASE        0x520
#define IR_SRC_QSPI0_TX         0x520   /* QSPI0 TX */
#define IR_SRC_QSPI0_RX         0x521   /* QSPI0 RX */
#define IR_SRC_QSPI0_ERR        0x522   /* QSPI0 Error */
#define IR_SRC_QSPI0_PT         0x523   /* QSPI0 Phase Trans */

/* Software Interrupts (for IPC between cores) */
#define IR_SRC_SW_BASE          0x600
#define IR_SRC_SW0              0x600   /* Software Interrupt 0 */
#define IR_SRC_SW1              0x601   /* Software Interrupt 1 */
#define IR_SRC_SW2              0x602   /* Software Interrupt 2 */
#define IR_SRC_SW3              0x603   /* Software Interrupt 3 */
#define IR_SRC_SW4              0x604   /* Software Interrupt 4 */
#define IR_SRC_SW5              0x605   /* Software Interrupt 5 */
#define IR_SRC_SW6              0x606   /* Software Interrupt 6 */
#define IR_SRC_SW7              0x607   /* Software Interrupt 7 */

/* ==========================================================================
 * Interrupt Delivery State
 * ========================================================================== */

/**
 * @brief Pending interrupt info for a CPU
 */
typedef struct {
    bool        pending;        /* Interrupt is pending */
    uint16_t    src_index;      /* SRC register index */
    uint8_t     priority;       /* SRPN value */
    uint32_t    vector;         /* Calculated vector address */
} ir_pending_t;

/**
 * @brief IR state structure
 */
typedef struct ir {
    /* SRC registers */
    uint32_t    src[IR_NUM_SRC];

    /* Per-CPU pending interrupt cache */
    ir_pending_t pending[6];

    /* Statistics */
    uint64_t    total_asserts;      /* Total interrupt assertions */
    uint64_t    total_deliveries;   /* Total interrupts delivered */
    uint64_t    total_overflows;    /* Total overflow events */

    /* Configuration */
    bool        verbose;            /* Debug output */

} ir_t;

/* ==========================================================================
 * IR Lifecycle
 * ========================================================================== */

/**
 * @brief Create and initialize IR
 * @return Pointer to IR, or NULL on error
 */
ir_t* ir_create(void);

/**
 * @brief Destroy IR
 * @param ir IR to destroy
 */
void ir_destroy(ir_t *ir);

/**
 * @brief Reset IR to power-on state
 * @param ir IR instance
 */
void ir_reset(ir_t *ir);

/* ==========================================================================
 * SRC Register Access
 * ========================================================================== */

/**
 * @brief Read SRC register
 * @param ir IR instance
 * @param index SRC index (0-1023)
 * @return Register value
 */
uint32_t ir_read_src(ir_t *ir, uint32_t index);

/**
 * @brief Write SRC register
 * @param ir IR instance
 * @param index SRC index (0-1023)
 * @param value Value to write
 *
 * Handles special bits:
 * - CLRR: Write 1 to clear SRR
 * - SETR: Write 1 to set SRR
 * - IOVCLR: Write 1 to clear IOV
 * - SWSCLR: Write 1 to clear SWS
 */
void ir_write_src(ir_t *ir, uint32_t index, uint32_t value);

/**
 * @brief Read SRC via memory-mapped address
 * @param ir IR instance
 * @param offset Offset from IR base (0x000-0xFFF)
 * @return Register value
 */
uint32_t ir_read_reg(ir_t *ir, uint32_t offset);

/**
 * @brief Write SRC via memory-mapped address
 * @param ir IR instance
 * @param offset Offset from IR base (0x000-0xFFF)
 * @param value Value to write
 */
void ir_write_reg(ir_t *ir, uint32_t offset, uint32_t value);

/* ==========================================================================
 * Interrupt Control
 * ========================================================================== */

/**
 * @brief Assert interrupt from peripheral
 * @param ir IR instance
 * @param src_index SRC index of the interrupt source
 *
 * Sets SRR flag. If already set, also sets IOV (overflow).
 */
void ir_assert(ir_t *ir, uint32_t src_index);

/**
 * @brief Clear interrupt request
 * @param ir IR instance
 * @param src_index SRC index
 */
void ir_clear(ir_t *ir, uint32_t src_index);

/**
 * @brief Check if specific interrupt is pending
 * @param ir IR instance
 * @param src_index SRC index
 * @return true if SRR is set
 */
bool ir_is_pending(ir_t *ir, uint32_t src_index);

/**
 * @brief Configure SRC register
 * @param ir IR instance
 * @param src_index SRC index
 * @param priority SRPN value (0-255)
 * @param tos Target (IR_TOS_CPUx or IR_TOS_DMA)
 * @param enable Enable the interrupt
 */
void ir_configure_src(ir_t *ir, uint32_t src_index,
                      uint8_t priority, ir_tos_t tos, bool enable);

/* ==========================================================================
 * Multi-core Interrupt Arbitration
 * ========================================================================== */

/**
 * @brief Get highest priority pending interrupt for a CPU
 * @param ir IR instance
 * @param cpu_id Target CPU (0-5)
 * @param priority Output: SRPN of pending interrupt (can be NULL)
 * @return SRC index of highest priority pending, or -1 if none
 *
 * Scans all SRC registers for:
 * - SRR=1 (request pending)
 * - SRE=1 (enabled)
 * - TOS matches cpu_id
 * Returns the one with highest SRPN.
 */
int ir_get_pending_for_cpu(ir_t *ir, uint32_t cpu_id, uint8_t *priority);

/**
 * @brief Check if CPU should take interrupt
 * @param ir IR instance
 * @param cpu_id Target CPU (0-5)
 * @param ccpn Current CPU Priority Number (from ICR)
 * @param ie Interrupt Enable (from ICR)
 * @param out_priority Output: SRPN of interrupt to take
 * @param out_src Output: SRC index of interrupt to take
 * @return true if interrupt should be taken
 *
 * Checks if pending interrupt's SRPN > ccpn and ie=1.
 */
bool ir_should_interrupt(ir_t *ir, uint32_t cpu_id,
                         uint8_t ccpn, bool ie,
                         uint8_t *out_priority, uint16_t *out_src);

/**
 * @brief Acknowledge interrupt (called when CPU enters ISR)
 * @param ir IR instance
 * @param src_index SRC index being acknowledged
 *
 * In auto-clear mode, clears SRR. Otherwise, SRR stays set
 * until cleared by software or peripheral.
 */
void ir_acknowledge(ir_t *ir, uint32_t src_index);

/**
 * @brief Calculate interrupt vector address
 * @param biv Base Interrupt Vector (from CPU's BIV register)
 * @param srpn Service Request Priority Number
 * @return Vector address = BIV + (SRPN * 32)
 */
static inline uint32_t ir_calc_vector(uint32_t biv, uint8_t srpn)
{
    return (biv & ~0x1) + ((uint32_t)srpn << 5);
}

/* ==========================================================================
 * DMA Trigger Support
 * ========================================================================== */

/**
 * @brief Get pending DMA trigger
 * @param ir IR instance
 * @param priority Output: priority of pending DMA trigger
 * @return SRC index of pending DMA trigger, or -1 if none
 *
 * Scans for interrupts with TOS=IR_TOS_DMA.
 */
int ir_get_pending_dma(ir_t *ir, uint8_t *priority);

/* ==========================================================================
 * Software Interrupts (IPC)
 * ========================================================================== */

/**
 * @brief Trigger software interrupt
 * @param ir IR instance
 * @param sw_index Software interrupt index (0-7)
 *
 * Software interrupts are used for inter-processor communication.
 */
void ir_trigger_sw_interrupt(ir_t *ir, uint32_t sw_index);

/**
 * @brief Configure software interrupt for IPC
 * @param ir IR instance
 * @param sw_index Software interrupt index (0-7)
 * @param target_cpu Target CPU (0-5)
 * @param priority SRPN value
 */
void ir_configure_sw_interrupt(ir_t *ir, uint32_t sw_index,
                               uint32_t target_cpu, uint8_t priority);

/* ==========================================================================
 * Debug and Statistics
 * ========================================================================== */

/**
 * @brief Print IR status
 * @param ir IR instance
 */
void ir_print_status(ir_t *ir);

/**
 * @brief Print pending interrupts for all CPUs
 * @param ir IR instance
 */
void ir_print_pending(ir_t *ir);

/**
 * @brief Get statistics
 * @param ir IR instance
 * @param asserts Output: total assertions
 * @param deliveries Output: total deliveries
 * @param overflows Output: total overflows
 */
void ir_get_stats(ir_t *ir, uint64_t *asserts,
                  uint64_t *deliveries, uint64_t *overflows);

/**
 * @brief Enable/disable verbose output
 * @param ir IR instance
 * @param verbose true to enable debug output
 */
void ir_set_verbose(ir_t *ir, bool verbose);

#ifdef __cplusplus
}
#endif

#endif /* IR_H */
