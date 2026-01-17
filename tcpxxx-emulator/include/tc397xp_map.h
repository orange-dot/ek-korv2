/**
 * @file tc397xp_map.h
 * @brief TC397XP Complete Memory Map and Register Definitions
 *
 * Based on Infineon TC397XP User Manual and TC1.6.2 Architecture Manual.
 * This file provides comprehensive address definitions for the emulator.
 */

#ifndef TC397XP_MAP_H
#define TC397XP_MAP_H

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * TC397XP Memory Map Overview
 * ==========================================================================
 *
 * Segment 0 (0x0xxxxxxx): Reserved / CPU5 DSPR alias
 * Segment 1 (0x1xxxxxxx): CPU5 DSPR global (240KB @ 0x10000000)
 * Segment 2 (0x2xxxxxxx): Reserved
 * Segment 3 (0x3xxxxxxx): CPU4 DSPR global (240KB @ 0x30000000)
 * Segment 4 (0x4xxxxxxx): CPU3 DSPR global (240KB @ 0x40000000)
 * Segment 5 (0x5xxxxxxx): CPU2 DSPR global (240KB @ 0x50000000)
 * Segment 6 (0x6xxxxxxx): CPU1 DSPR global (240KB @ 0x60000000)
 * Segment 7 (0x7xxxxxxx): CPU0 DSPR (local/global)
 * Segment 8 (0x8xxxxxxx): Program Flash (16MB @ 0x80000000)
 * Segment 9 (0x9xxxxxxx): LMU/EMEM
 * Segment A (0xAxxxxxxx): Data Flash (1.15MB @ 0xAF000000)
 * Segment B-D: Reserved / Debug
 * Segment E: Boot ROM (128KB @ 0x8FFC0000 mirrored to 0xEFFC0000)
 * Segment F (0xFxxxxxxx): Peripheral Space
 */

/* ==========================================================================
 * Memory Regions
 * ========================================================================== */

/* Program Flash Banks */
#define PFLASH0_BASE            0x80000000
#define PFLASH0_SIZE            (3 * 1024 * 1024)   /* 3MB PF0 */
#define PFLASH1_BASE            0x80300000
#define PFLASH1_SIZE            (3 * 1024 * 1024)   /* 3MB PF1 */
#define PFLASH2_BASE            0x80600000
#define PFLASH2_SIZE            (3 * 1024 * 1024)   /* 3MB PF2 */
#define PFLASH3_BASE            0x80900000
#define PFLASH3_SIZE            (3 * 1024 * 1024)   /* 3MB PF3 */
#define PFLASH4_BASE            0x80C00000
#define PFLASH4_SIZE            (3 * 1024 * 1024)   /* 3MB PF4 */
#define PFLASH_TOTAL_SIZE       (16 * 1024 * 1024)  /* 16MB total */

/* Data Flash */
#define DFLASH0_BASE            0xAF000000
#define DFLASH0_SIZE            (1024 * 1024)       /* 1MB DF0 EEPROM */
#define DFLASH1_BASE            0xAF110000
#define DFLASH1_SIZE            (128 * 1024)        /* 128KB DF1 HSM */
#define UCB_BASE                0xAF400000          /* User Config Blocks */

/* DSPR (Data Scratch-Pad RAM) per core */
#define DSPR0_BASE              0x70000000          /* CPU0 local/global */
#define DSPR1_BASE              0x60000000          /* CPU1 global */
#define DSPR2_BASE              0x50000000          /* CPU2 global */
#define DSPR3_BASE              0x40000000          /* CPU3 global */
#define DSPR4_BASE              0x30000000          /* CPU4 global */
#define DSPR5_BASE              0x10000000          /* CPU5 global */
#define DSPR_SIZE               (240 * 1024)        /* 240KB per core */
#define DSPR_LOCAL_BASE         0x70000000          /* Local alias for all cores */

/* PSPR (Program Scratch-Pad RAM) per core */
#define PSPR0_BASE              0x70100000          /* CPU0 PSPR */
#define PSPR1_BASE              0x60100000          /* CPU1 PSPR */
#define PSPR2_BASE              0x50100000          /* CPU2 PSPR */
#define PSPR3_BASE              0x40100000          /* CPU3 PSPR */
#define PSPR4_BASE              0x30100000          /* CPU4 PSPR */
#define PSPR5_BASE              0x10100000          /* CPU5 PSPR */
#define PSPR_SIZE_CPU0          (64 * 1024)         /* 64KB for CPU0 */
#define PSPR_SIZE_CPU1_5        (32 * 1024)         /* 32KB for CPU1-5 */
#define PSPR_LOCAL_BASE         0x70100000          /* Local alias */

/* LMU (Local Memory Unit) - Shared RAM */
#define LMU0_BASE               0x90000000
#define LMU0_SIZE               (32 * 1024)         /* 32KB Bank 0 */
#define LMU1_BASE               0x90010000
#define LMU1_SIZE               (256 * 1024)        /* 256KB Bank 1 */
#define LMU2_BASE               0x90040000
#define LMU2_SIZE               (256 * 1024)        /* 256KB Bank 2 */
#define LMU_TOTAL_SIZE          (768 * 1024)        /* 768KB total */

/* EMEM (Emulation Memory / Extra Memory) */
#define EMEM_BASE               0x99000000
#define EMEM_SIZE               (4 * 1024 * 1024)   /* 4MB */

/* Boot ROM */
#define BROM_BASE               0x8FFC0000          /* Primary */
#define BROM_ALIAS              0xAFFC0000          /* Alias in seg A */
#define BROM_SIZE               (128 * 1024)        /* 128KB */

/* ==========================================================================
 * Peripheral Base Addresses (Segment F: 0xF0000000 - 0xFFFFFFFF)
 * ========================================================================== */

/* --- ASCLIN (Async/Sync Serial Interface) --- */
#define ASCLIN0_BASE            0xF0000600
#define ASCLIN1_BASE            0xF0000700
#define ASCLIN2_BASE            0xF0000800
#define ASCLIN3_BASE            0xF0000900
#define ASCLIN4_BASE            0xF0000A00
#define ASCLIN5_BASE            0xF0000B00
#define ASCLIN6_BASE            0xF0000C00
#define ASCLIN7_BASE            0xF0000D00
#define ASCLIN8_BASE            0xF0000E00
#define ASCLIN9_BASE            0xF0000F00
#define ASCLIN10_BASE           0xF0001000  /* Note: overlaps STM range, verify */
#define ASCLIN11_BASE           0xF0001100
#define ASCLIN_COUNT            12
#define ASCLIN_SIZE             0x100

/* --- STM (System Timer Module) - One per core --- */
#define STM0_BASE               0xF0001000
#define STM1_BASE               0xF0001100
#define STM2_BASE               0xF0001200
#define STM3_BASE               0xF0001300
#define STM4_BASE               0xF0001400
#define STM5_BASE               0xF0001500
#define STM_COUNT               6
#define STM_SIZE                0x100

/* --- QSPI (Queued SPI) --- */
#define QSPI0_BASE              0xF0001C00
#define QSPI1_BASE              0xF0001D00
#define QSPI2_BASE              0xF0001E00
#define QSPI3_BASE              0xF0001F00
#define QSPI4_BASE              0xF0002000
#define QSPI5_BASE              0xF0002100
#define QSPI_COUNT              6
#define QSPI_SIZE               0x100

/* --- CCU6 (Capture Compare Unit 6) --- */
#define CCU60_BASE              0xF0002A00
#define CCU61_BASE              0xF0002B00
#define CCU6_COUNT              2
#define CCU6_SIZE               0x100

/* --- GPT12 (General Purpose Timer Unit) --- */
#define GPT120_BASE             0xF0002E00
#define GPT12_SIZE              0x100

/* --- DMA (Direct Memory Access) --- */
#define DMA_BASE                0xF0010000
#define DMA_SIZE                0x2000
#define DMA_CH_COUNT            128             /* 128 DMA channels */

/* --- VADC (Versatile Analog-to-Digital Converter) --- */
#define VADC_BASE               0xF0020000
#define VADC_SIZE               0x4000
#define VADC_GROUP_COUNT        12              /* 12 ADC groups */
#define VADC_CH_PER_GROUP       8               /* 8 channels per group */

/* --- DSADC (Delta-Sigma ADC) --- */
#define DSADC_BASE              0xF0024000
#define DSADC_SIZE              0x1000
#define DSADC_CH_COUNT          10              /* 10 DSADC channels */

/* --- EVADC (Enhanced VADC) - Same as VADC on TC397 --- */
#define EVADC_BASE              VADC_BASE

/* --- SCU (System Control Unit) --- */
#define SCU_BASE                0xF0036000
#define SCU_SIZE                0x400

/* --- SMU (Safety Management Unit) --- */
#define SMU_BASE                0xF0036800
#define SMU_SIZE                0x400

/* --- IR (Interrupt Router) --- */
#define IR_BASE                 0xF0038000
#define IR_SIZE                 0x2000
#define IR_SRC_COUNT            1024

/* --- PORT (I/O Ports) --- */
#define PORT00_BASE             0xF003A000
#define PORT01_BASE             0xF003A100
#define PORT02_BASE             0xF003A200
#define PORT10_BASE             0xF003B000
#define PORT11_BASE             0xF003B100
#define PORT12_BASE             0xF003B200
#define PORT13_BASE             0xF003B300
#define PORT14_BASE             0xF003B400
#define PORT15_BASE             0xF003B500
#define PORT20_BASE             0xF003C000
#define PORT21_BASE             0xF003C100
#define PORT22_BASE             0xF003C200
#define PORT23_BASE             0xF003C300
#define PORT24_BASE             0xF003C400
#define PORT25_BASE             0xF003C500
#define PORT26_BASE             0xF003C600
#define PORT32_BASE             0xF003D200
#define PORT33_BASE             0xF003D300
#define PORT34_BASE             0xF003D400
#define PORT40_BASE             0xF003E000
#define PORT_SIZE               0x100

/* --- GTM (Generic Timer Module) --- */
#define GTM_BASE                0xF0100000
#define GTM_SIZE                0x80000         /* 512KB GTM space */
#define GTM_TIM_COUNT           8               /* 8 TIM modules */
#define GTM_TOM_COUNT           6               /* 6 TOM modules */
#define GTM_ATOM_COUNT          12              /* 12 ATOM modules */
#define GTM_TBU_COUNT           3               /* 3 TBU channels */
#define GTM_MCS_COUNT           10              /* 10 MCS modules */
#define GTM_DPLL_COUNT          1               /* 1 DPLL */

/* GTM Sub-module Offsets */
#define GTM_TBU_OFFSET          0x0100
#define GTM_BRC_OFFSET          0x0200
#define GTM_TIM0_OFFSET         0x1000
#define GTM_TIM_SPACING         0x0800          /* TIM0-7 */
#define GTM_TOM0_OFFSET         0x8000
#define GTM_TOM_SPACING         0x0800          /* TOM0-5 */
#define GTM_ATOM0_OFFSET        0xC000
#define GTM_ATOM_SPACING        0x0800          /* ATOM0-11 */
#define GTM_MCS0_OFFSET         0x18000
#define GTM_MCS_SPACING         0x0800          /* MCS0-9 */
#define GTM_DPLL_OFFSET         0x1C000

/* --- MCMCAN (Multi-CAN Controller) --- */
#define CAN0_BASE               0xF0200000      /* CAN Node 0-3 */
#define CAN1_BASE               0xF0210000      /* CAN Node 4-7 */
#define CAN2_BASE               0xF0220000      /* CAN Node 8-11 (if available) */
#define CAN_NODE_SIZE           0x1000
#define CAN_MSG_RAM_OFFSET      0x8000          /* Message RAM offset */
#define CAN_MSG_RAM_SIZE        0x4000          /* 16KB per CAN module */

/* --- ERAY (FlexRay) --- */
#define ERAY0_BASE              0xF001C000
#define ERAY1_BASE              0xF001D000
#define ERAY_SIZE               0x1000

/* --- PSI5 --- */
#define PSI5_BASE               0xF0005000
#define PSI5_SIZE               0x400

/* --- PSI5S --- */
#define PSI5S_BASE              0xF0005400
#define PSI5S_SIZE              0x400

/* --- SENT --- */
#define SENT_BASE               0xF0003000
#define SENT_SIZE               0x400

/* --- I2C --- */
#define I2C0_BASE               0xF0088000
#define I2C1_BASE               0xF0088100
#define I2C_SIZE                0x100

/* --- HSM (Hardware Security Module) --- */
#define HSM_BASE                0xF0040000
#define HSM_SIZE                0x10000

/* --- GETH (Gigabit Ethernet) --- */
#define GETH_BASE               0xF001E000
#define GETH_SIZE               0x2000

/* --- CPU Debug/CSFR Segment (0xFFFxxxxx) --- */
#define CPU_CSFR_BASE           0xF8800000      /* CPU0 CSFR base */
#define CPU_CSFR_SPACING        0x20000         /* Spacing between CPU CSFRs */

/* ==========================================================================
 * CSFR (Core Special Function Registers) - TC1.6.2 Architecture
 * These are offsets within core register space (accessed via MTCR/MFCR)
 * ========================================================================== */

/* Context Management */
#define CSFR_PCXI               0xFE00      /* Previous Context Info */
#define CSFR_PSW                0xFE04      /* Program Status Word */
#define CSFR_PC                 0xFE08      /* Program Counter (read-only) */

/* System Configuration */
#define CSFR_SYSCON             0xFE14      /* System Configuration */
#define CSFR_CPU_ID             0xFE18      /* CPU Identification */
#define CSFR_CORE_ID            0xFE1C      /* Core Identification */

/* Trap/Interrupt Vectors */
#define CSFR_BIV                0xFE20      /* Base Interrupt Vector */
#define CSFR_BTV                0xFE24      /* Base Trap Vector */
#define CSFR_ISP                0xFE28      /* Interrupt Stack Pointer */
#define CSFR_ICR                0xFE2C      /* Interrupt Control Register */

/* Reserved block 0xFE30-0xFE34 */

/* CSA Management */
#define CSFR_FCX                0xFE38      /* Free CSA List Head */
#define CSFR_LCX                0xFE3C      /* Free CSA List Limit */

/* Compatibility */
#define CSFR_COMPAT             0x9400      /* Compatibility Mode */

/* Debug Registers */
#define CSFR_DMS                0xFD40      /* Debug Mode Source */
#define CSFR_DCX                0xFD44      /* Debug Context Save Area Ptr */
#define CSFR_DBGTCR             0xFD48      /* Debug Trap Control */
#define CSFR_CCTRL              0xFC00      /* Counter Control */
#define CSFR_CCNT               0xFC04      /* CPU Clock Cycle Count */
#define CSFR_ICNT               0xFC08      /* Instruction Count */
#define CSFR_M1CNT              0xFC0C      /* Multi-count 1 */
#define CSFR_M2CNT              0xFC10      /* Multi-count 2 */
#define CSFR_M3CNT              0xFC14      /* Multi-count 3 */

/* Debug Status/Control */
#define CSFR_DBGSR              0xFD00      /* Debug Status */
#define CSFR_EXEVT              0xFD08      /* External Break Event */
#define CSFR_CREVT              0xFD0C      /* Core Reset Event */
#define CSFR_SWEVT              0xFD10      /* Software Break Event */
#define CSFR_TR0EVT             0xFD20      /* Trigger Event 0 */
#define CSFR_TR1EVT             0xFD24      /* Trigger Event 1 */
#define CSFR_TR2EVT             0xFD28      /* Trigger Event 2 */
#define CSFR_TR3EVT             0xFD2C      /* Trigger Event 3 */
#define CSFR_TR4EVT             0xFD30      /* Trigger Event 4 */
#define CSFR_TR5EVT             0xFD34      /* Trigger Event 5 */
#define CSFR_TR6EVT             0xFD38      /* Trigger Event 6 */
#define CSFR_TR7EVT             0xFD3C      /* Trigger Event 7 */

/* Temporal Protection */
#define CSFR_TPS_CON            0xE400      /* Temporal Protection Control */
#define CSFR_TPS_TIMER0         0xE404      /* Temporal Protection Timer 0 */
#define CSFR_TPS_TIMER1         0xE408      /* Temporal Protection Timer 1 */
#define CSFR_TPS_TIMER2         0xE40C      /* Temporal Protection Timer 2 */

/* Memory Protection (Code) */
#define CSFR_CPR0_L             0xD000      /* Code Protection Range 0 Lower */
#define CSFR_CPR0_U             0xD004      /* Code Protection Range 0 Upper */
#define CSFR_CPR1_L             0xD008      /* Code Protection Range 1 Lower */
#define CSFR_CPR1_U             0xD00C      /* Code Protection Range 1 Upper */
#define CSFR_CPR2_L             0xD010
#define CSFR_CPR2_U             0xD014
#define CSFR_CPR3_L             0xD018
#define CSFR_CPR3_U             0xD01C
#define CSFR_CPR4_L             0xD020
#define CSFR_CPR4_U             0xD024
#define CSFR_CPR5_L             0xD028
#define CSFR_CPR5_U             0xD02C
#define CSFR_CPR6_L             0xD030
#define CSFR_CPR6_U             0xD034
#define CSFR_CPR7_L             0xD038
#define CSFR_CPR7_U             0xD03C

/* Memory Protection (Data) */
#define CSFR_DPR0_L             0xC000      /* Data Protection Range 0 Lower */
#define CSFR_DPR0_U             0xC004      /* Data Protection Range 0 Upper */
#define CSFR_DPR1_L             0xC008
#define CSFR_DPR1_U             0xC00C
#define CSFR_DPR2_L             0xC010
#define CSFR_DPR2_U             0xC014
#define CSFR_DPR3_L             0xC018
#define CSFR_DPR3_U             0xC01C
#define CSFR_DPR4_L             0xC020
#define CSFR_DPR4_U             0xC024
#define CSFR_DPR5_L             0xC028
#define CSFR_DPR5_U             0xC02C
#define CSFR_DPR6_L             0xC030
#define CSFR_DPR6_U             0xC034
#define CSFR_DPR7_L             0xC038
#define CSFR_DPR7_U             0xC03C
#define CSFR_DPR8_L             0xC040
#define CSFR_DPR8_U             0xC044
#define CSFR_DPR9_L             0xC048
#define CSFR_DPR9_U             0xC04C
#define CSFR_DPR10_L            0xC050
#define CSFR_DPR10_U            0xC054
#define CSFR_DPR11_L            0xC058
#define CSFR_DPR11_U            0xC05C
#define CSFR_DPR12_L            0xC060
#define CSFR_DPR12_U            0xC064
#define CSFR_DPR13_L            0xC068
#define CSFR_DPR13_U            0xC06C
#define CSFR_DPR14_L            0xC070
#define CSFR_DPR14_U            0xC074
#define CSFR_DPR15_L            0xC078
#define CSFR_DPR15_U            0xC07C

/* Protection Mode Registers */
#define CSFR_CPXE0              0xD100      /* Code Execute Enable Set 0 */
#define CSFR_CPXE1              0xD104      /* Code Execute Enable Set 1 */
#define CSFR_CPXE2              0xD108      /* Code Execute Enable Set 2 */
#define CSFR_CPXE3              0xD10C      /* Code Execute Enable Set 3 */
#define CSFR_DPRE0              0xC100      /* Data Read Enable Set 0 */
#define CSFR_DPRE1              0xC104      /* Data Read Enable Set 1 */
#define CSFR_DPRE2              0xC108      /* Data Read Enable Set 2 */
#define CSFR_DPRE3              0xC10C      /* Data Read Enable Set 3 */
#define CSFR_DPWE0              0xC140      /* Data Write Enable Set 0 */
#define CSFR_DPWE1              0xC144      /* Data Write Enable Set 1 */
#define CSFR_DPWE2              0xC148      /* Data Write Enable Set 2 */
#define CSFR_DPWE3              0xC14C      /* Data Write Enable Set 3 */

/* FPU Registers (if FPU present) */
#define CSFR_FPU_TRAP_CON       0xA000      /* FPU Trap Control */
#define CSFR_FPU_TRAP_PC        0xA004      /* FPU Trap PC */
#define CSFR_FPU_TRAP_OPC       0xA008      /* FPU Trap Opcode */
#define CSFR_FPU_TRAP_SRC1      0xA010      /* FPU Trap Source 1 */
#define CSFR_FPU_TRAP_SRC2      0xA014      /* FPU Trap Source 2 */
#define CSFR_FPU_TRAP_SRC3      0xA018      /* FPU Trap Source 3 */

/* ==========================================================================
 * PSW (Program Status Word) Bit Definitions - Complete
 * ========================================================================== */

#define PSW_CDC_MASK            0x0000007F  /* [6:0] Call Depth Counter */
#define PSW_CDC_SHIFT           0
#define PSW_CDE                 (1U << 7)   /* [7] Call Depth Count Enable */
#define PSW_GW                  (1U << 8)   /* [8] Global Register Write Perm */
#define PSW_IS                  (1U << 9)   /* [9] Interrupt Stack */
#define PSW_IO_MASK             0x00000C00  /* [11:10] I/O Mode */
#define PSW_IO_SHIFT            10
#define PSW_PRS_MASK            0x00003000  /* [13:12] Protection Register Set */
#define PSW_PRS_SHIFT           12
#define PSW_S                   (1U << 14)  /* [14] Safety Task ID */
/* Bits [23:15] reserved */
#define PSW_USB_MASK            0x7F000000  /* [30:24] User Status Bits */
#define PSW_USB_SHIFT           24
#define PSW_SAV                 (1U << 27)  /* [27] Sticky Advanced Overflow */
#define PSW_AV                  (1U << 28)  /* [28] Advanced Overflow */
#define PSW_SV                  (1U << 29)  /* [29] Sticky Overflow */
#define PSW_V                   (1U << 30)  /* [30] Overflow */
#define PSW_C                   (1U << 31)  /* [31] Carry */

/* PSW I/O Mode values */
#define PSW_IO_USER0            0           /* User-0 Mode */
#define PSW_IO_USER1            1           /* User-1 Mode */
#define PSW_IO_SUPERVISOR       2           /* Supervisor Mode */

/* ==========================================================================
 * ICR (Interrupt Control Register) Bit Definitions
 * ========================================================================== */

#define ICR_CCPN_MASK           0x000000FF  /* [7:0] Current CPU Priority Num */
#define ICR_CCPN_SHIFT          0
#define ICR_IE                  (1U << 8)   /* [8] Interrupt Enable */
/* Bits [15:9] reserved */
#define ICR_PIPN_MASK           0x00FF0000  /* [23:16] Pending Int Priority Num */
#define ICR_PIPN_SHIFT          16
/* Bits [31:24] reserved */

/* ==========================================================================
 * PCXI (Previous Context Information) Bit Definitions
 * ========================================================================== */

#define PCXI_PCXO_MASK          0x0000FFFF  /* [15:0] PCX Offset */
#define PCXI_PCXO_SHIFT         0
#define PCXI_PCXS_MASK          0x000F0000  /* [19:16] PCX Segment */
#define PCXI_PCXS_SHIFT         16
#define PCXI_UL                 (1U << 20)  /* [20] Upper/Lower Context */
#define PCXI_PIE                (1U << 21)  /* [21] Previous IE */
#define PCXI_PCPN_MASK          0xFF000000  /* [29:22] Previous CPU Priority */
#define PCXI_PCPN_SHIFT         22

/* ==========================================================================
 * SYSCON (System Configuration) Bit Definitions
 * ========================================================================== */

#define SYSCON_FCDSF            (1U << 0)   /* [0] FCD Trap Sticky Flag */
#define SYSCON_PROTEN           (1U << 1)   /* [1] Memory Protection Enable */
#define SYSCON_TPROTEN          (1U << 2)   /* [2] Temporal Protection Enable */
#define SYSCON_IS               (1U << 3)   /* [3] Initial PSW.S in ISR */
#define SYSCON_TS               (1U << 4)   /* [4] Initial PSW.S in Trap */
/* Bits [7:5] reserved */
#define SYSCON_ESDIS            (1U << 8)   /* [8] Emulator Space Disable */
/* Bits [15:9] reserved */
#define SYSCON_U1_IED           (1U << 16)  /* [16] User-1 Instr Exec Disable */
#define SYSCON_U1_IOS           (1U << 17)  /* [17] User-1 Periph as Supervisor */
/* Bits [23:18] reserved */
#define SYSCON_BHALT            (1U << 24)  /* [24] Boot Halt */
/* Bits [31:25] reserved */

/* ==========================================================================
 * CPU_ID Register Bit Definitions
 * ========================================================================== */

#define CPU_ID_MOD_REV_MASK     0x000000FF  /* [7:0] Module Revision */
#define CPU_ID_MOD_32B_MASK     0x0000FF00  /* [15:8] 32-bit Module Flag */
#define CPU_ID_MOD_MASK         0xFFFF0000  /* [31:16] Module Identification */
#define CPU_ID_MOD_SHIFT        16

/* TC1.6.2P expected values */
#define CPU_ID_TC162_MOD        0xC000      /* Module ID for TC1.6.2 */
#define CPU_ID_TC162_32B        0xC0        /* 32-bit module indicator */

/* ==========================================================================
 * CCTRL (Core Counter Control) Bit Definitions
 * ========================================================================== */

#define CCTRL_CM                (1U << 0)   /* [0] Counter Mode */
#define CCTRL_CE                (1U << 1)   /* [1] Counter Enable */
#define CCTRL_M1                0x00000070  /* [6:4] Multi-count 1 Mode */
#define CCTRL_M2                0x00007000  /* [14:12] Multi-count 2 Mode */
#define CCTRL_M3                0x00700000  /* [22:20] Multi-count 3 Mode */

/* ==========================================================================
 * DBGSR (Debug Status Register) Bit Definitions
 * ========================================================================== */

#define DBGSR_DE                (1U << 0)   /* [0] Debug Enable */
#define DBGSR_HALT_MASK         0x00000006  /* [2:1] Halt State */
#define DBGSR_HALT_SHIFT        1
#define DBGSR_SIH               (1U << 3)   /* [3] Suspend-in-Halt */
#define DBGSR_SUSP              (1U << 4)   /* [4] Suspend */
#define DBGSR_PREVSUSP          (1U << 5)   /* [5] Previous Suspend */
#define DBGSR_PEVT              (1U << 6)   /* [6] Posted Event */
#define DBGSR_EVTSRC_MASK       0x00001F00  /* [12:8] Event Source */
#define DBGSR_EVTSRC_SHIFT      8

/* ==========================================================================
 * Memory Wait States (TC397XP typical values)
 * ========================================================================== */

#define WAIT_DSPR               0           /* DSPR: 0 wait states (local) */
#define WAIT_DSPR_REMOTE        1           /* DSPR remote: 1 wait state */
#define WAIT_PSPR               0           /* PSPR: 0 wait states */
#define WAIT_LMU                1           /* LMU: 1 wait state */
#define WAIT_PFLASH             5           /* PFLASH: 5 wait states @300MHz */
#define WAIT_DFLASH             100         /* DFLASH: ~100 cycles (variable) */
#define WAIT_PERIPHERAL         2           /* Peripheral: 2 wait states */
#define WAIT_EMEM               2           /* EMEM: 2 wait states */

/* ==========================================================================
 * Trap Classes (TC1.6.2)
 * ========================================================================== */

#define TRAP_CLASS_MMU          0           /* Class 0: MMU Traps */
#define TRAP_CLASS_PROT         1           /* Class 1: Protection Traps */
#define TRAP_CLASS_INSN         2           /* Class 2: Instruction Error */
#define TRAP_CLASS_CONTEXT      3           /* Class 3: Context Management */
#define TRAP_CLASS_BUS          4           /* Class 4: System Bus/Peripheral */
#define TRAP_CLASS_ASSERT       5           /* Class 5: Assertion Traps */
#define TRAP_CLASS_SYSCALL      6           /* Class 6: System Call */
#define TRAP_CLASS_NMI          7           /* Class 7: Non-Maskable Interrupt */

/* Trap Identification Numbers (TIN) */
/* Class 2: Instruction Errors */
#define TIN_IOPC                1           /* Illegal Opcode */
#define TIN_UOPC                2           /* Unimplemented Opcode */
#define TIN_OPD                 3           /* Invalid Operand */
#define TIN_ALN                 4           /* Data Address Alignment */
#define TIN_MEM                 5           /* Invalid Memory Address */

/* Class 3: Context */
#define TIN_FCD                 1           /* Free Context List Depleted */
#define TIN_CDO                 2           /* Call Depth Overflow */
#define TIN_CDU                 3           /* Call Depth Underflow */
#define TIN_FCU                 4           /* Free Context List Underflow */
#define TIN_CSU                 5           /* Context Save Area Underflow */
#define TIN_CTYP                6           /* Context Type Error */
#define TIN_NEST                7           /* Nesting Error */

/* Class 6: System Call */
#define TIN_SYS                 0           /* System Call */

#ifdef __cplusplus
}
#endif

#endif /* TC397XP_MAP_H */