/**
 * @file tc397xp_sfr.h
 * @brief TC397XP CPU Special Function Registers (CSFRs)
 *
 * Core Special Function Registers for TriCore TC1.6.2 architecture.
 * These registers are accessed via MFCR/MTCR instructions.
 *
 * Reference: TriCore TC1.6.2 Architecture Manual Volume 1
 */

#ifndef TC397XP_SFR_H
#define TC397XP_SFR_H

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * CSFR Address Definitions
 * ========================================================================== */

/**
 * @defgroup CSFR_ADDR Core Special Function Register Addresses
 * @{
 */

/* --------------------------------------------------------------------------
 * Program Counter and Status
 * -------------------------------------------------------------------------- */
#define CSFR_PCXI       0xFE00      /**< Previous Context Information */
#define CSFR_PSW        0xFE04      /**< Program Status Word */
#define CSFR_PC         0xFE08      /**< Program Counter */

/* --------------------------------------------------------------------------
 * System Control
 * -------------------------------------------------------------------------- */
#define CSFR_SYSCON     0xFE14      /**< System Configuration */
#define CSFR_CPU_ID     0xFE18      /**< CPU Identification */
#define CSFR_CORE_ID    0xFE1C      /**< Core Identification */

/* --------------------------------------------------------------------------
 * Context Save Area (CSA)
 * -------------------------------------------------------------------------- */
#define CSFR_FCX        0xFE38      /**< Free CSA List Head Pointer */
#define CSFR_LCX        0xFE3C      /**< Free CSA List Limit Pointer */

/* --------------------------------------------------------------------------
 * Interrupt Control
 * -------------------------------------------------------------------------- */
#define CSFR_ICR        0xFE2C      /**< Interrupt Control Register */
#define CSFR_ISP        0xFE28      /**< Interrupt Stack Pointer */

/* --------------------------------------------------------------------------
 * Protection and Safety
 * -------------------------------------------------------------------------- */
#define CSFR_BTV        0xFE24      /**< Base Trap Vector Table Pointer */
#define CSFR_BIV        0xFE20      /**< Base Interrupt Vector Table Pointer */

/* --------------------------------------------------------------------------
 * Memory Protection System (MPS) - Data Protection Registers
 * TC1.6.2 has 18 data protection register pairs (DPR0-DPR17)
 * Each pair has Lower (L) and Upper (U) bounds
 * -------------------------------------------------------------------------- */

/* Data Protection Registers - Set 0 (Protection Register Set 0) */
#define CSFR_DPR0_L     0xC000      /**< Data Protection Range 0 Lower */
#define CSFR_DPR0_U     0xC004      /**< Data Protection Range 0 Upper */
#define CSFR_DPR1_L     0xC008      /**< Data Protection Range 1 Lower */
#define CSFR_DPR1_U     0xC00C      /**< Data Protection Range 1 Upper */
#define CSFR_DPR2_L     0xC010      /**< Data Protection Range 2 Lower */
#define CSFR_DPR2_U     0xC014      /**< Data Protection Range 2 Upper */
#define CSFR_DPR3_L     0xC018      /**< Data Protection Range 3 Lower */
#define CSFR_DPR3_U     0xC01C      /**< Data Protection Range 3 Upper */
#define CSFR_DPR4_L     0xC020      /**< Data Protection Range 4 Lower */
#define CSFR_DPR4_U     0xC024      /**< Data Protection Range 4 Upper */
#define CSFR_DPR5_L     0xC028      /**< Data Protection Range 5 Lower */
#define CSFR_DPR5_U     0xC02C      /**< Data Protection Range 5 Upper */
#define CSFR_DPR6_L     0xC030      /**< Data Protection Range 6 Lower */
#define CSFR_DPR6_U     0xC034      /**< Data Protection Range 6 Upper */
#define CSFR_DPR7_L     0xC038      /**< Data Protection Range 7 Lower */
#define CSFR_DPR7_U     0xC03C      /**< Data Protection Range 7 Upper */

/* Data Protection Read/Write Enable - Per PRS (4 sets: PRS 0-3) */
#define CSFR_DPRE_0     0xE010      /**< Data Protection Read Enable Set 0 */
#define CSFR_DPWE_0     0xE020      /**< Data Protection Write Enable Set 0 */
#define CSFR_DPRE_1     0xE014      /**< Data Protection Read Enable Set 1 */
#define CSFR_DPWE_1     0xE024      /**< Data Protection Write Enable Set 1 */
#define CSFR_DPRE_2     0xE018      /**< Data Protection Read Enable Set 2 */
#define CSFR_DPWE_2     0xE028      /**< Data Protection Write Enable Set 2 */
#define CSFR_DPRE_3     0xE01C      /**< Data Protection Read Enable Set 3 */
#define CSFR_DPWE_3     0xE02C      /**< Data Protection Write Enable Set 3 */

/* Code Protection Registers */
#define CSFR_CPR0_L     0xD000      /**< Code Protection Range 0 Lower */
#define CSFR_CPR0_U     0xD004      /**< Code Protection Range 0 Upper */
#define CSFR_CPR1_L     0xD008      /**< Code Protection Range 1 Lower */
#define CSFR_CPR1_U     0xD00C      /**< Code Protection Range 1 Upper */
#define CSFR_CPR2_L     0xD010      /**< Code Protection Range 2 Lower */
#define CSFR_CPR2_U     0xD014      /**< Code Protection Range 2 Upper */
#define CSFR_CPR3_L     0xD018      /**< Code Protection Range 3 Lower */
#define CSFR_CPR3_U     0xD01C      /**< Code Protection Range 3 Upper */

/* Code Protection Execute Enable */
#define CSFR_CPXE_0     0xE000      /**< Code Protection Execute Enable Set 0 */
#define CSFR_CPXE_1     0xE004      /**< Code Protection Execute Enable Set 1 */
#define CSFR_CPXE_2     0xE008      /**< Code Protection Execute Enable Set 2 */
#define CSFR_CPXE_3     0xE00C      /**< Code Protection Execute Enable Set 3 */

/* Memory Trap/Error Registers */
#define CSFR_DEADD      0x9020      /**< Data Error Address Register */
#define CSFR_DIEAR      0x9024      /**< Data Integrity Error Address Register */
#define CSFR_DIETR      0x9028      /**< Data Integrity Error Trap Register */
#define CSFR_PIETR      0x9214      /**< Program Integrity Error Trap Register */
#define CSFR_PIEAR      0x9210      /**< Program Integrity Error Address Register */

/* --------------------------------------------------------------------------
 * Debug Registers
 * -------------------------------------------------------------------------- */
#define CSFR_DBGSR      0xFD00      /**< Debug Status Register */
#define CSFR_EXEVT      0xFD08      /**< External Break Event */

/* --------------------------------------------------------------------------
 * Performance Counters (optional)
 * -------------------------------------------------------------------------- */
#define CSFR_CCTRL      0xFC00      /**< Counter Control */
#define CSFR_CCNT       0xFC04      /**< CPU Clock Count */

/** @} */

/* ==========================================================================
 * Register Bit Field Definitions
 * ========================================================================== */

/**
 * @defgroup PSW_BITS Program Status Word Bit Definitions
 * @{
 */

/* PSW - Program Status Word */
#define PSW_CDC_MASK        0x0000007F  /**< Call Depth Counter */
#define PSW_CDC_SHIFT       0
#define PSW_CDE             (1U << 7)   /**< Call Depth Count Enable */
#define PSW_GW              (1U << 8)   /**< Global Address Register Write Permission */
#define PSW_IS              (1U << 9)   /**< Interrupt Stack Control */
#define PSW_IO_MASK         0x00000C00  /**< I/O Mode */
#define PSW_IO_SHIFT        10
#define PSW_PRS_MASK        0x00003000  /**< Protection Register Set */
#define PSW_PRS_SHIFT       12
#define PSW_S               (1U << 14)  /**< Safety Task Identifier */
#define PSW_USB             (1U << 24)  /**< User Status Bit (application-specific) */
#define PSW_SAV             (1U << 27)  /**< Sticky Advance Overflow */
#define PSW_AV              (1U << 28)  /**< Advance Overflow */
#define PSW_SV              (1U << 29)  /**< Sticky Overflow */
#define PSW_V               (1U << 30)  /**< Overflow */
#define PSW_C               (1U << 31)  /**< Carry */

/* PSW I/O Mode values */
#define PSW_IO_USER         0           /**< User-0 mode */
#define PSW_IO_USER1        1           /**< User-1 mode */
#define PSW_IO_SUPERVISOR   2           /**< Supervisor mode */

/** @} */

/**
 * @defgroup ICR_BITS Interrupt Control Register Bit Definitions
 * @{
 */

/* ICR - Interrupt Control Register */
#define ICR_CCPN_MASK       0x000000FF  /**< Current CPU Priority Number */
#define ICR_CCPN_SHIFT      0
#define ICR_IE              (1U << 8)   /**< Interrupt Enable */
#define ICR_PIPN_MASK       0x00FF0000  /**< Pending Interrupt Priority Number */
#define ICR_PIPN_SHIFT      16
#define ICR_CARBCYC_MASK    0x03000000  /**< Number of Arbitration Cycles */
#define ICR_CARBCYC_SHIFT   24
#define ICR_CONECYC         (1U << 26)  /**< Interrupt Control One-Cycle Mode */

/** @} */

/**
 * @defgroup PCXI_BITS Previous Context Information Register Bit Definitions
 * @{
 */

/* PCXI - Previous Context Information */
#define PCXI_PCXO_MASK      0x0000FFFF  /**< Previous Context Pointer Offset */
#define PCXI_PCXO_SHIFT     0
#define PCXI_PCXS_MASK      0x000F0000  /**< Previous Context Pointer Segment */
#define PCXI_PCXS_SHIFT     16
#define PCXI_UL             (1U << 20)  /**< Upper or Lower Context Tag */
#define PCXI_PIE            (1U << 21)  /**< Previous Interrupt Enable */
#define PCXI_PCPN_MASK      0x00FF0000  /**< Previous CPU Priority Number (upper byte) */
#define PCXI_PCPN_SHIFT     22

/* PCXI UL values */
#define PCXI_UL_LOWER       0           /**< Lower context */
#define PCXI_UL_UPPER       1           /**< Upper context */

/** @} */

/**
 * @defgroup CORE_ID_BITS Core Identification Register
 * @{
 */

/* CORE_ID - Core Identification */
#define CORE_ID_MASK        0x00000007  /**< Core ID (0-5 for TC397XP) */

/** @} */

/**
 * @defgroup SYSCON_BITS System Configuration Register
 * @{
 */

/* SYSCON - System Configuration */
#define SYSCON_FCDSF        (1U << 0)   /**< Free Context List Depleted Sticky Flag */
#define SYSCON_PROTEN       (1U << 1)   /**< Memory Protection Enable */
#define SYSCON_TPROTEN      (1U << 2)   /**< Temporal Protection Enable */
#define SYSCON_IS           (1U << 3)   /**< Initial State */
#define SYSCON_IT           (1U << 4)   /**< Initial Timer */

/** @} */

/* ==========================================================================
 * CSA (Context Save Area) Structure
 *
 * Each CSA entry is 64 bytes (16 words), aligned to 64-byte boundary.
 * ========================================================================== */

/**
 * @brief Upper Context (saved automatically on interrupt/trap)
 *
 * Contains registers that the callee is allowed to use (caller-saved).
 */
typedef struct __attribute__((packed, aligned(64))) {
    uint32_t pcxi;      /**< Previous Context Information */
    uint32_t psw;       /**< Program Status Word */
    uint32_t a10;       /**< Address register A10 (SP) */
    uint32_t a11;       /**< Address register A11 (RA) */
    uint32_t d8;        /**< Data register D8 */
    uint32_t d9;        /**< Data register D9 */
    uint32_t d10;       /**< Data register D10 */
    uint32_t d11;       /**< Data register D11 */
    uint32_t a12;       /**< Address register A12 */
    uint32_t a13;       /**< Address register A13 */
    uint32_t a14;       /**< Address register A14 */
    uint32_t a15;       /**< Address register A15 */
    uint32_t d12;       /**< Data register D12 */
    uint32_t d13;       /**< Data register D13 */
    uint32_t d14;       /**< Data register D14 */
    uint32_t d15;       /**< Data register D15 */
} csa_upper_t;

/**
 * @brief Lower Context (saved on function call with CALL instruction)
 *
 * Contains registers that the callee must preserve (callee-saved).
 */
typedef struct __attribute__((packed, aligned(64))) {
    uint32_t pcxi;      /**< Previous Context Information */
    uint32_t a11_pc;    /**< Return address (PC after CALL) */
    uint32_t a2;        /**< Address register A2 */
    uint32_t a3;        /**< Address register A3 */
    uint32_t d0;        /**< Data register D0 */
    uint32_t d1;        /**< Data register D1 */
    uint32_t d2;        /**< Data register D2 */
    uint32_t d3;        /**< Data register D3 */
    uint32_t a4;        /**< Address register A4 (first argument) */
    uint32_t a5;        /**< Address register A5 (second argument) */
    uint32_t a6;        /**< Address register A6 */
    uint32_t a7;        /**< Address register A7 */
    uint32_t d4;        /**< Data register D4 (first argument) */
    uint32_t d5;        /**< Data register D5 (second argument) */
    uint32_t d6;        /**< Data register D6 */
    uint32_t d7;        /**< Data register D7 */
} csa_lower_t;

/* ==========================================================================
 * CSA Link Word Manipulation Macros
 *
 * CSA pointers are stored as link words in PCXI/FCX/LCX registers.
 * Format: [31:20] = Segment, [19:6] = Offset >> 6, [5:0] = reserved
 * ========================================================================== */

/**
 * @brief Convert CSA address to link word format
 */
#define CSA_ADDR_TO_LINK(addr) \
    ((((uint32_t)(addr) & 0xF0000000) >> 12) | \
     (((uint32_t)(addr) & 0x0003FFC0) >> 6))

/**
 * @brief Convert link word to CSA address
 */
#define CSA_LINK_TO_ADDR(link) \
    ((void *)(((link) & 0x000F0000) << 12) | \
             (((link) & 0x0000FFFF) << 6))

/**
 * @brief Get segment from CSA address
 */
#define CSA_SEGMENT(addr)   (((uint32_t)(addr) >> 28) & 0x0F)

/**
 * @brief Get offset from CSA address
 */
#define CSA_OFFSET(addr)    (((uint32_t)(addr) >> 6) & 0xFFFF)

/* ==========================================================================
 * TC397XP Specific Constants
 * ========================================================================== */

#define TC397XP_NUM_CORES           6       /**< Total number of CPU cores */
#define TC397XP_LOCKSTEP_CORES      4       /**< Cores with lockstep (CPU0-CPU3) */
#define TC397XP_MAX_PRIORITY        255     /**< Maximum interrupt priority */
#define TC397XP_CSA_SIZE            64      /**< CSA entry size in bytes */

#ifdef __cplusplus
}
#endif

#endif /* TC397XP_SFR_H */
