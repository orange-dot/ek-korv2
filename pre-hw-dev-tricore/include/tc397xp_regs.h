/**
 * @file tc397xp_regs.h
 * @brief TC397XP Peripheral Register Definitions
 *
 * Memory-mapped peripheral registers for AURIX TC397XP.
 * Base addresses and register offsets for SCU, STM, ASCLIN, CAN, GPIO, etc.
 *
 * Reference: TC39x User Manual, Infineon
 */

#ifndef TC397XP_REGS_H
#define TC397XP_REGS_H

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Peripheral Base Addresses
 * ========================================================================== */

/**
 * @defgroup PERIPH_BASE Peripheral Base Addresses
 * All peripherals are memory-mapped in the 0xF000_0000 - 0xFFFF_FFFF range
 * @{
 */

/* System Control Unit */
#define SCU_BASE            0xF0036000UL

/* Clock Control */
#define CCU_BASE            0xF0036100UL

/* Power Management */
#define PMC_BASE            0xF0036200UL

/* System Timer Module (per-core) */
#define STM0_BASE           0xF0001000UL    /* CPU0 STM */
#define STM1_BASE           0xF0001100UL    /* CPU1 STM */
#define STM2_BASE           0xF0001200UL    /* CPU2 STM */
#define STM3_BASE           0xF0001300UL    /* CPU3 STM */
#define STM4_BASE           0xF0001400UL    /* CPU4 STM */
#define STM5_BASE           0xF0001500UL    /* CPU5 STM */

/* ASCLIN (Async/Sync Serial Interface) */
#define ASCLIN0_BASE        0xF0000600UL
#define ASCLIN1_BASE        0xF0000700UL
#define ASCLIN2_BASE        0xF0000800UL
#define ASCLIN3_BASE        0xF0000900UL
/* ... up to ASCLIN23 */

/* CAN (MCMCAN) Modules */
#define CAN0_BASE           0xF0200000UL
#define CAN1_BASE           0xF0210000UL
#define CAN2_BASE           0xF0220000UL
/* ... up to CAN11 (12 total) */

/* GPIO Ports */
#define PORT00_BASE         0xF003A000UL
#define PORT01_BASE         0xF003A100UL
#define PORT02_BASE         0xF003A200UL
/* ... up to PORT41 */

/* Interrupt Router */
#define IR_BASE             0xF0038000UL

/* Service Request Control (SRC) */
#define SRC_BASE            0xF0038000UL

/* Watchdog Timer */
#define WDT_BASE            0xF0036300UL

/** @} */

/* ==========================================================================
 * SCU - System Control Unit
 * ========================================================================== */

/**
 * @defgroup SCU_REGS System Control Unit Registers
 * @{
 */

/* SCU Register Offsets */
#define SCU_ID              0x008       /**< Identification Register */
#define SCU_OSCCON          0x010       /**< OSC Control Register */
#define SCU_PLLSTAT         0x014       /**< PLL Status Register */
#define SCU_PLLCON0         0x018       /**< PLL Configuration 0 */
#define SCU_PLLCON1         0x01C       /**< PLL Configuration 1 */
#define SCU_PLLCON2         0x020       /**< PLL Configuration 2 */
#define SCU_PLLERAYSTAT     0x024       /**< PLL_ERAY Status */
#define SCU_PLLERAYCON0     0x028       /**< PLL_ERAY Configuration 0 */
#define SCU_PLLERAYCON1     0x02C       /**< PLL_ERAY Configuration 1 */
#define SCU_CCUCON0         0x030       /**< CCU Control 0 */
#define SCU_CCUCON1         0x034       /**< CCU Control 1 */
#define SCU_CCUCON2         0x040       /**< CCU Control 2 */
#define SCU_CCUCON5         0x04C       /**< CCU Control 5 */
#define SCU_RSTSTAT         0x050       /**< Reset Status */
#define SCU_RSTCON          0x058       /**< Reset Configuration */
#define SCU_SWRSTCON        0x060       /**< Software Reset Configuration */
#define SCU_RSTCON2         0x064       /**< Reset Configuration 2 */
#define SCU_EVRRSTCON       0x070       /**< EVR Reset Configuration */

/* CPU Control (per-core) */
#define SCU_CPU0_BASE       0xF0036400UL
#define SCU_CPU_OFFSET      0x100       /**< Offset between CPU control blocks */

/* Per-CPU SCU register offsets */
#define SCU_CPUx_CLC        0x000       /**< CPU Clock Control */
#define SCU_CPUx_STAT       0x004       /**< CPU Status */
#define SCU_CPUx_CCTRL0     0x020       /**< CPU Control 0 */

/* PLL Status bits */
#define SCU_PLLSTAT_VCOLOCK (1U << 2)   /**< VCO Lock Status */
#define SCU_PLLSTAT_FINDIS  (1U << 3)   /**< Finder Disable Status */
#define SCU_PLLSTAT_K1RDY   (1U << 4)   /**< K1 Divider Ready */
#define SCU_PLLSTAT_K2RDY   (1U << 5)   /**< K2 Divider Ready */

/* CCUCON0 bits */
#define SCU_CCUCON0_CLKSEL_MASK     0x30000000  /**< Clock Selection */
#define SCU_CCUCON0_CLKSEL_BACKUP   0x00000000  /**< Backup clock */
#define SCU_CCUCON0_CLKSEL_PLL      0x10000000  /**< PLL clock */

/** @} */

/* ==========================================================================
 * STM - System Timer Module
 * ========================================================================== */

/**
 * @defgroup STM_REGS System Timer Module Registers
 * @{
 */

/* STM Register Offsets */
#define STM_CLC             0x000       /**< Clock Control */
#define STM_ID              0x008       /**< Module ID */
#define STM_TIM0            0x010       /**< Timer 0 (lower 32 bits) */
#define STM_TIM1            0x014       /**< Timer 1 */
#define STM_TIM2            0x018       /**< Timer 2 */
#define STM_TIM3            0x01C       /**< Timer 3 */
#define STM_TIM4            0x020       /**< Timer 4 */
#define STM_TIM5            0x024       /**< Timer 5 */
#define STM_TIM6            0x028       /**< Timer 6 (upper 32 bits) */
#define STM_CAP             0x02C       /**< Timer Capture */
#define STM_CMP0            0x030       /**< Compare 0 */
#define STM_CMP1            0x034       /**< Compare 1 */
#define STM_CMCON           0x038       /**< Compare Match Control */
#define STM_ICR             0x03C       /**< Interrupt Control */
#define STM_ISCR            0x040       /**< Interrupt Set/Clear */
#define STM_OCS             0x0E8       /**< OCDS Control and Status */
#define STM_KRSTCLR         0x0EC       /**< Kernel Reset Clear */
#define STM_KRST1           0x0F0       /**< Kernel Reset 1 */
#define STM_KRST0           0x0F4       /**< Kernel Reset 0 */
#define STM_ACCEN1          0x0F8       /**< Access Enable 1 */
#define STM_ACCEN0          0x0FC       /**< Access Enable 0 */

/* STM ICR bits */
#define STM_ICR_CMP0EN      (1U << 0)   /**< Compare 0 Interrupt Enable */
#define STM_ICR_CMP0IR      (1U << 1)   /**< Compare 0 Interrupt Request */
#define STM_ICR_CMP0OS      (1U << 2)   /**< Compare 0 OS flag */
#define STM_ICR_CMP1EN      (1U << 4)   /**< Compare 1 Interrupt Enable */
#define STM_ICR_CMP1IR      (1U << 5)   /**< Compare 1 Interrupt Request */
#define STM_ICR_CMP1OS      (1U << 6)   /**< Compare 1 OS flag */

/* STM ISCR bits (interrupt set/clear) */
#define STM_ISCR_CMP0IRR    (1U << 0)   /**< Compare 0 Interrupt Reset */
#define STM_ISCR_CMP0IRS    (1U << 1)   /**< Compare 0 Interrupt Set */
#define STM_ISCR_CMP1IRR    (1U << 2)   /**< Compare 1 Interrupt Reset */
#define STM_ISCR_CMP1IRS    (1U << 3)   /**< Compare 1 Interrupt Set */

/* STM CMCON bits */
#define STM_CMCON_MSIZE0_MASK   0x0000001F  /**< Compare 0 size */
#define STM_CMCON_MSTART0_MASK  0x00001F00  /**< Compare 0 start bit */
#define STM_CMCON_MSIZE1_MASK   0x001F0000  /**< Compare 1 size */
#define STM_CMCON_MSTART1_MASK  0x1F000000  /**< Compare 1 start bit */
#define STM_CMCON_MSIZE0(x)     ((x) & 0x1F)          /**< Compare 0 size value */
#define STM_CMCON_MSTART0(x)    (((x) & 0x1F) << 8)   /**< Compare 0 start bit */
#define STM_CMCON_MSIZE1(x)     (((x) & 0x1F) << 16)  /**< Compare 1 size value */
#define STM_CMCON_MSTART1(x)    (((x) & 0x1F) << 24)  /**< Compare 1 start bit */

/** @} */

/* ==========================================================================
 * ASCLIN - Async/Sync Serial Interface (UART/LIN/SPI)
 * ========================================================================== */

/**
 * @defgroup ASCLIN_REGS ASCLIN Registers
 * @{
 */

/* ASCLIN Register Offsets */
#define ASCLIN_CLC          0x000       /**< Clock Control */
#define ASCLIN_IOCR         0x004       /**< I/O Control */
#define ASCLIN_ID           0x008       /**< Module ID */
#define ASCLIN_TXFIFOCON    0x00C       /**< TX FIFO Configuration */
#define ASCLIN_RXFIFOCON    0x010       /**< RX FIFO Configuration */
#define ASCLIN_BITCON       0x014       /**< Bit Configuration */
#define ASCLIN_FRAMECON     0x018       /**< Frame Configuration */
#define ASCLIN_DATCON       0x01C       /**< Data Configuration */
#define ASCLIN_BRG          0x020       /**< Baud Rate Generator */
#define ASCLIN_BRD          0x024       /**< Baud Rate Detection */
#define ASCLIN_LIN_CON      0x028       /**< LIN Control */
#define ASCLIN_LIN_BTIMER   0x02C       /**< LIN Break Timer */
#define ASCLIN_LIN_HTIMER   0x030       /**< LIN Header Timer */
#define ASCLIN_FLAGS        0x034       /**< Flags */
#define ASCLIN_FLAGSSET     0x038       /**< Flags Set */
#define ASCLIN_FLAGSCLEAR   0x03C       /**< Flags Clear */
#define ASCLIN_FLAGSENABLE  0x040       /**< Flags Enable */
#define ASCLIN_TXDATA       0x044       /**< Transmit Data */
#define ASCLIN_RXDATA       0x048       /**< Receive Data */
#define ASCLIN_CSR          0x04C       /**< Clock Selection */

/* ASCLIN CSR bits (clock source selection) */
#define ASCLIN_CSR_CLKSEL_NOCLK     0   /**< No clock */
#define ASCLIN_CSR_CLKSEL_CLC       1   /**< CLC clock */
#define ASCLIN_CSR_CLKSEL_EVROSC    2   /**< EVR Oscillator */
#define ASCLIN_CSR_CLKSEL_FMAX      4   /**< fMAX */
#define ASCLIN_CSR_CLKSEL_FSOURCE   8   /**< fSOURCE */

/* ASCLIN FLAGS bits */
#define ASCLIN_FLAGS_TH     (1U << 0)   /**< Transmit Header */
#define ASCLIN_FLAGS_TR     (1U << 1)   /**< Transmit Response */
#define ASCLIN_FLAGS_RH     (1U << 2)   /**< Receive Header */
#define ASCLIN_FLAGS_RR     (1U << 3)   /**< Receive Response */
#define ASCLIN_FLAGS_FE     (1U << 16)  /**< Framing Error */
#define ASCLIN_FLAGS_HT     (1U << 17)  /**< Header Timeout */
#define ASCLIN_FLAGS_RT     (1U << 18)  /**< Response Timeout */
#define ASCLIN_FLAGS_TFL    (1U << 23)  /**< TX FIFO Level */
#define ASCLIN_FLAGS_RFL    (1U << 24)  /**< RX FIFO Level */
#define ASCLIN_FLAGS_TC     (1U << 25)  /**< Transmission Complete */

/* ASCLIN FRAMECON bits */
#define ASCLIN_FRAMECON_MODE_MASK   0x00030000  /**< Mode selection */
#define ASCLIN_FRAMECON_MODE_INIT   0x00000000  /**< Initialization mode */
#define ASCLIN_FRAMECON_MODE_ASC    0x00010000  /**< ASC mode (UART) */
#define ASCLIN_FRAMECON_MODE_SPI    0x00020000  /**< SPI mode */
#define ASCLIN_FRAMECON_MODE_LIN    0x00030000  /**< LIN mode */
#define ASCLIN_FRAMECON_STOP_MASK   0x00000700  /**< Stop bits */
#define ASCLIN_FRAMECON_STOP_1      0x00000100  /**< 1 stop bit */
#define ASCLIN_FRAMECON_STOP_2      0x00000200  /**< 2 stop bits */

/* ASCLIN DATCON bits */
#define ASCLIN_DATCON_DATLEN_MASK   0x0000000F  /**< Data length */

/* ASCLIN TXFIFOCON bits */
#define ASCLIN_TXFIFOCON_FLUSH      (1U << 0)   /**< Flush TX FIFO */
#define ASCLIN_TXFIFOCON_ENO        (1U << 1)   /**< Enable Output */
#define ASCLIN_TXFIFOCON_INTLEVEL_MASK  0x00003F00  /**< Interrupt level */

/* ASCLIN RXFIFOCON bits */
#define ASCLIN_RXFIFOCON_FLUSH      (1U << 0)   /**< Flush RX FIFO */
#define ASCLIN_RXFIFOCON_ENI        (1U << 1)   /**< Enable Input */
#define ASCLIN_RXFIFOCON_INTLEVEL_MASK  0x00003F00  /**< Interrupt level */

/** @} */

/* ==========================================================================
 * CAN (MCMCAN) - CAN with Flexible Data-rate
 * ========================================================================== */

/**
 * @defgroup CAN_REGS MCMCAN Registers
 * @{
 */

/* CAN Module Register Offsets (per node) */
#define CAN_CLC             0x000       /**< Clock Control */
#define CAN_ID              0x008       /**< Module ID */
#define CAN_MCR             0x00C       /**< Module Control */

/* CAN Node Register Offsets (within module) */
#define CAN_N_CR            0x200       /**< Node Control */
#define CAN_N_SR            0x204       /**< Node Status */
#define CAN_N_IR            0x208       /**< Node Interrupt */
#define CAN_N_IE            0x20C       /**< Node Interrupt Enable */
#define CAN_N_BTR           0x218       /**< Bit Timing */
#define CAN_N_FBTR          0x21C       /**< Fast Bit Timing */
#define CAN_N_TDCR          0x248       /**< Transmitter Delay Compensation */

/* Message RAM (per node, offset within node) */
#define CAN_N_SIDFC         0x284       /**< Standard ID Filter Config */
#define CAN_N_XIDFC         0x288       /**< Extended ID Filter Config */
#define CAN_N_XIDAM         0x290       /**< Extended ID AND Mask */
#define CAN_N_HPMS          0x294       /**< High Priority Message Status */
#define CAN_N_RXF0C         0x2A0       /**< RX FIFO 0 Config */
#define CAN_N_RXF0S         0x2A4       /**< RX FIFO 0 Status */
#define CAN_N_RXF0A         0x2A8       /**< RX FIFO 0 Acknowledge */
#define CAN_N_RXF1C         0x2B0       /**< RX FIFO 1 Config */
#define CAN_N_RXF1S         0x2B4       /**< RX FIFO 1 Status */
#define CAN_N_RXF1A         0x2B8       /**< RX FIFO 1 Acknowledge */
#define CAN_N_TXBC          0x2C0       /**< TX Buffer Config */
#define CAN_N_TXFQS         0x2C4       /**< TX FIFO/Queue Status */
#define CAN_N_TXBRP         0x2C8       /**< TX Buffer Request Pending */
#define CAN_N_TXBAR         0x2CC       /**< TX Buffer Add Request */
#define CAN_N_TXBCR         0x2D0       /**< TX Buffer Cancel Request */
#define CAN_N_TXBTO         0x2D4       /**< TX Buffer Transmission Occurred */
#define CAN_N_TXBCF         0x2D8       /**< TX Buffer Cancellation Finished */
#define CAN_N_TXBTIE        0x2DC       /**< TX Buffer Transmission Int Enable */
#define CAN_N_TXBCIE        0x2E0       /**< TX Buffer Cancel Int Enable */
#define CAN_N_TXESC         0x2C8       /**< TX Element Size Config */
#define CAN_N_RXESC         0x2BC       /**< RX Element Size Config */

/** @} */

/* ==========================================================================
 * GPIO - General Purpose I/O
 * ========================================================================== */

/**
 * @defgroup GPIO_REGS GPIO Registers
 * @{
 */

/* GPIO Register Offsets (per port) */
#define PORT_OUT            0x000       /**< Output Data */
#define PORT_OMR            0x004       /**< Output Modification */
#define PORT_IOCR0          0x010       /**< I/O Control 0 (pins 0-3) */
#define PORT_IOCR4          0x014       /**< I/O Control 4 (pins 4-7) */
#define PORT_IOCR8          0x018       /**< I/O Control 8 (pins 8-11) */
#define PORT_IOCR12         0x01C       /**< I/O Control 12 (pins 12-15) */
#define PORT_IN             0x024       /**< Input Data */
#define PORT_PDR0           0x040       /**< Pad Driver Mode 0 */
#define PORT_PDR1           0x044       /**< Pad Driver Mode 1 */
#define PORT_ESR            0x050       /**< Emergency Stop */

/* IOCR modes (4 bits per pin) */
#define PORT_IOCR_PC_INPUT              0x00    /**< Input, no pull */
#define PORT_IOCR_PC_INPUT_PULLDOWN     0x01    /**< Input, pull-down */
#define PORT_IOCR_PC_INPUT_PULLUP       0x02    /**< Input, pull-up */
#define PORT_IOCR_PC_OUTPUT_PUSHPULL    0x10    /**< Output, push-pull */
#define PORT_IOCR_PC_OUTPUT_OPENDRAIN   0x18    /**< Output, open-drain */
#define PORT_IOCR_PC_ALT1               0x11    /**< Alternate function 1 */
#define PORT_IOCR_PC_ALT2               0x12    /**< Alternate function 2 */
#define PORT_IOCR_PC_ALT3               0x13    /**< Alternate function 3 */
#define PORT_IOCR_PC_ALT4               0x14    /**< Alternate function 4 */
#define PORT_IOCR_PC_ALT5               0x15    /**< Alternate function 5 */
#define PORT_IOCR_PC_ALT6               0x16    /**< Alternate function 6 */
#define PORT_IOCR_PC_ALT7               0x17    /**< Alternate function 7 */

/** @} */

/* ==========================================================================
 * IR/SRC - Interrupt Router / Service Request Control
 * ========================================================================== */

/**
 * @defgroup IR_REGS Interrupt Router Registers
 * @{
 */

/* SRC Register Offset (base + module_offset + src_index * 4) */
#define SRC_STM0SR0         (SRC_BASE + 0x490)  /**< STM0 Service Request 0 */
#define SRC_STM0SR1         (SRC_BASE + 0x494)  /**< STM0 Service Request 1 */
#define SRC_ASCLIN0TX       (SRC_BASE + 0x040)  /**< ASCLIN0 TX */
#define SRC_ASCLIN0RX       (SRC_BASE + 0x044)  /**< ASCLIN0 RX */
#define SRC_ASCLIN0ERR      (SRC_BASE + 0x048)  /**< ASCLIN0 Error */

/* GPSR (General Purpose Service Request) for inter-processor interrupts */
#define SRC_GPSR_BASE       (SRC_BASE + 0x990)  /**< GPSR base offset */
#define SRC_GPSR(core, sr)  (SRC_GPSR_BASE + ((core) * 0x10) + ((sr) * 0x04))

/* SRC register bits */
#define SRC_SRPN_MASK       0x000000FF  /**< Service Request Priority Number */
#define SRC_SRE             (1U << 10)  /**< Service Request Enable */
#define SRC_TOS_MASK        0x00001800  /**< Type of Service */
#define SRC_TOS_CPU0        0x00000000  /**< Route to CPU0 */
#define SRC_TOS_CPU1        0x00000800  /**< Route to CPU1 */
#define SRC_TOS_CPU2        0x00001000  /**< Route to CPU2 */
#define SRC_TOS_DMA         0x00001800  /**< Route to DMA */
#define SRC_SRR             (1U << 24)  /**< Service Request Flag */
#define SRC_CLRR            (1U << 25)  /**< Clear Request */
#define SRC_SETR            (1U << 26)  /**< Set Request */
#define SRC_IOV             (1U << 27)  /**< Interrupt Trigger Overflow */
#define SRC_IOVCLR          (1U << 28)  /**< Interrupt Trigger Overflow Clear */
#define SRC_SWS             (1U << 29)  /**< Software Sticky Bit */
#define SRC_SWSCLR          (1U << 30)  /**< Software Sticky Bit Clear */

/** @} */

/* ==========================================================================
 * Register Access Macros
 * ========================================================================== */

/**
 * @defgroup REG_ACCESS Register Access Macros
 * @{
 */

#define REG32(addr)         (*(volatile uint32_t *)(addr))
#define REG16(addr)         (*(volatile uint16_t *)(addr))
#define REG8(addr)          (*(volatile uint8_t *)(addr))

#define REG_READ32(addr)    REG32(addr)
#define REG_WRITE32(addr, val)  do { REG32(addr) = (val); } while(0)

#define REG_SET32(addr, bits)   do { REG32(addr) |= (bits); } while(0)
#define REG_CLR32(addr, bits)   do { REG32(addr) &= ~(bits); } while(0)
#define REG_MOD32(addr, mask, val)  do { REG32(addr) = (REG32(addr) & ~(mask)) | ((val) & (mask)); } while(0)

/** @} */

/* ==========================================================================
 * Unlock/Lock for Protected Registers
 * ========================================================================== */

/**
 * @defgroup ENDINIT ENDINIT Protection
 *
 * Many TC3xx registers require ENDINIT unlock before modification.
 * @{
 */

/* Per-CPU Watchdog Timer registers */
#define SCU_WDTCPU0_CON0    (SCU_BASE + 0x100)  /**< WDT CPU0 Control 0 */
#define SCU_WDTCPU0_CON1    (SCU_BASE + 0x104)  /**< WDT CPU0 Control 1 */
#define SCU_WDTCPU1_CON0    (SCU_BASE + 0x10C)  /**< WDT CPU1 Control 0 */
#define SCU_WDTCPU1_CON1    (SCU_BASE + 0x110)  /**< WDT CPU1 Control 1 */
#define SCU_WDTCPU2_CON0    (SCU_BASE + 0x118)  /**< WDT CPU2 Control 0 */
#define SCU_WDTCPU2_CON1    (SCU_BASE + 0x11C)  /**< WDT CPU2 Control 1 */
#define SCU_WDTCPU3_CON0    (SCU_BASE + 0x124)  /**< WDT CPU3 Control 0 */
#define SCU_WDTCPU3_CON1    (SCU_BASE + 0x128)  /**< WDT CPU3 Control 1 */
#define SCU_WDTCPU4_CON0    (SCU_BASE + 0x130)  /**< WDT CPU4 Control 0 */
#define SCU_WDTCPU4_CON1    (SCU_BASE + 0x134)  /**< WDT CPU4 Control 1 */
#define SCU_WDTCPU5_CON0    (SCU_BASE + 0x13C)  /**< WDT CPU5 Control 0 */
#define SCU_WDTCPU5_CON1    (SCU_BASE + 0x140)  /**< WDT CPU5 Control 1 */

/* Legacy alias */
#define SCU_WDTCPU0CON0     SCU_WDTCPU0_CON0

/* Simplified ENDINIT handling - actual implementation needs password handling */
#define ENDINIT_UNLOCK()    /* Implementation in hal_tc397xp.c */
#define ENDINIT_LOCK()      /* Implementation in hal_tc397xp.c */

/** @} */

#ifdef __cplusplus
}
#endif

#endif /* TC397XP_REGS_H */
