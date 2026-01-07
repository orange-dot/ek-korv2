/**
 * @file emu_types.h
 * @brief TC397XP Emulator Core Type Definitions
 *
 * This file defines the fundamental types used throughout the emulator,
 * including CPU state, decoded instructions, and memory structures.
 */

#ifndef EMU_TYPES_H
#define EMU_TYPES_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * TC397XP Constants
 * ========================================================================== */

#define TC397XP_NUM_CORES           6       /**< Total CPU cores */
#define TC397XP_LOCKSTEP_CORES      4       /**< Cores with lockstep (CPU0-CPU3) */

/* Register counts */
#define NUM_DATA_REGS               16      /**< D0-D15 */
#define NUM_ADDR_REGS               16      /**< A0-A15 */

/* Memory sizes */
#define PFLASH_SIZE                 (16 * 1024 * 1024)  /**< 16 MB Program Flash */
#define DFLASH_SIZE                 (1152 * 1024)       /**< 1.15 MB Data Flash */
#define DSPR_SIZE_PER_CORE          (240 * 1024)        /**< 240 KB DSPR per core */
#define PSPR_SIZE_PER_CORE          (64 * 1024)         /**< 64 KB PSPR per core */
#define LMU_SIZE                    (768 * 1024)        /**< 768 KB LMU */
#define EMEM_SIZE                   (4 * 1024 * 1024)   /**< 4 MB EMEM */

/* Memory base addresses */
#define PFLASH_BASE                 0x80000000
#define DFLASH_BASE                 0xAF000000
#define LMU_BASE                    0x90000000
#define EMEM_BASE                   0x99000000
#define PERIPHERAL_BASE             0xF0000000

/* Per-core local addresses */
#define LOCAL_DSPR_BASE             0x70000000
#define LOCAL_PSPR_BASE             0x70100000

/* DSPR global addresses per core */
#define DSPR_BASE_CPU0              0x70000000
#define DSPR_BASE_CPU1              0x60000000
#define DSPR_BASE_CPU2              0x50000000
#define DSPR_BASE_CPU3              0x40000000
#define DSPR_BASE_CPU4              0x30000000
#define DSPR_BASE_CPU5              0x10000000

/* ==========================================================================
 * CSFR (Core Special Function Register) Addresses
 * ========================================================================== */

#define CSFR_PCXI                   0xFE00
#define CSFR_PSW                    0xFE04
#define CSFR_PC                     0xFE08
#define CSFR_SYSCON                 0xFE14
#define CSFR_CPU_ID                 0xFE18
#define CSFR_CORE_ID                0xFE1C
#define CSFR_BIV                    0xFE20
#define CSFR_BTV                    0xFE24
#define CSFR_ISP                    0xFE28
#define CSFR_ICR                    0xFE2C
#define CSFR_FCX                    0xFE38
#define CSFR_LCX                    0xFE3C
#define CSFR_CCTRL                  0xFC00
#define CSFR_CCNT                   0xFC04
#define CSFR_DBGSR                  0xFD00

/* ==========================================================================
 * PSW (Program Status Word) Bit Definitions
 * ========================================================================== */

#define PSW_CDC_MASK                0x0000007F
#define PSW_CDE                     (1U << 7)
#define PSW_GW                      (1U << 8)
#define PSW_IS                      (1U << 9)
#define PSW_IO_MASK                 0x00000C00
#define PSW_IO_SHIFT                10
#define PSW_PRS_MASK                0x00003000
#define PSW_PRS_SHIFT               12
#define PSW_S                       (1U << 14)
#define PSW_USB                     (1U << 24)
#define PSW_SAV                     (1U << 27)
#define PSW_AV                      (1U << 28)
#define PSW_SV                      (1U << 29)
#define PSW_V                       (1U << 30)
#define PSW_C                       (1U << 31)

/* PSW I/O mode values */
#define PSW_IO_USER                 0
#define PSW_IO_USER1                1
#define PSW_IO_SUPERVISOR           2

/* ==========================================================================
 * ICR (Interrupt Control Register) Bit Definitions
 * ========================================================================== */

#define ICR_CCPN_MASK               0x000000FF
#define ICR_IE                      (1U << 8)
#define ICR_PIPN_MASK               0x00FF0000
#define ICR_PIPN_SHIFT              16

/* ==========================================================================
 * PCXI Bit Definitions
 * ========================================================================== */

#define PCXI_PCXO_MASK              0x0000FFFF
#define PCXI_PCXS_MASK              0x000F0000
#define PCXI_PCXS_SHIFT             16
#define PCXI_UL                     (1U << 20)
#define PCXI_PIE                    (1U << 21)
#define PCXI_PCPN_MASK              0x3FC00000
#define PCXI_PCPN_SHIFT             22

/* ==========================================================================
 * Instruction Format Types
 * ========================================================================== */

/**
 * @brief TriCore instruction format types
 *
 * TriCore uses 16-bit and 32-bit instruction encoding with multiple formats.
 */
typedef enum {
    /* 16-bit formats */
    FMT_SB,     /**< Short Branch */
    FMT_SBC,    /**< Short Branch Conditional */
    FMT_SBR,    /**< Short Branch Register */
    FMT_SBRN,   /**< Short Branch Register with Nop */
    FMT_SC,     /**< Short Constant */
    FMT_SLR,    /**< Short Load Register */
    FMT_SLRO,   /**< Short Load Register with Offset */
    FMT_SR,     /**< Short Register */
    FMT_SRC,    /**< Short Register Constant */
    FMT_SRO,    /**< Short Register with Offset */
    FMT_SRR,    /**< Short Register Register */
    FMT_SRRS,   /**< Short Register Register Shift */
    FMT_SSR,    /**< Short Store Register */
    FMT_SSRO,   /**< Short Store Register with Offset */

    /* 32-bit formats */
    FMT_ABS,    /**< Absolute */
    FMT_ABSB,   /**< Absolute Bit */
    FMT_B,      /**< Branch */
    FMT_BIT,    /**< Bit */
    FMT_BO,     /**< Base + Offset */
    FMT_BOL,    /**< Base + Offset Long */
    FMT_BRC,    /**< Branch Register Constant */
    FMT_BRN,    /**< Branch Register with Nop */
    FMT_BRR,    /**< Branch Register Register */
    FMT_RC,     /**< Register Constant */
    FMT_RCPW,   /**< Register Constant Packed Word */
    FMT_RCR,    /**< Register Constant Register */
    FMT_RCRR,   /**< Register Constant Register Register */
    FMT_RCRW,   /**< Register Constant Register Width */
    FMT_RLC,    /**< Register Long Constant */
    FMT_RR,     /**< Register Register */
    FMT_RR1,    /**< Register Register 1 */
    FMT_RR2,    /**< Register Register 2 */
    FMT_RRPW,   /**< Register Register Packed Word */
    FMT_RRR,    /**< Register Register Register */
    FMT_RRR1,   /**< Register Register Register 1 */
    FMT_RRR2,   /**< Register Register Register 2 */
    FMT_RRRR,   /**< Register Register Register Register */
    FMT_RRRW,   /**< Register Register Register Width */
    FMT_SYS,    /**< System */

    FMT_UNKNOWN /**< Unknown/Invalid format */
} insn_format_t;

/* ==========================================================================
 * Decoded Instruction
 * ========================================================================== */

/**
 * @brief Decoded instruction structure
 *
 * Contains all extracted fields from a TriCore instruction.
 */
typedef struct {
    uint32_t raw;               /**< Raw instruction bits (2 or 4 bytes) */
    uint32_t pc;                /**< PC where this instruction was fetched */

    insn_format_t format;       /**< Instruction format */
    uint8_t opcode1;            /**< Primary opcode (bits [7:0] or [5:0]) */
    uint8_t opcode2;            /**< Secondary opcode (varies by format) */

    int8_t dst;                 /**< Destination register (-1 if none) */
    int8_t dst2;                /**< Second destination (for 64-bit results) */
    int8_t src1;                /**< Source register 1 (-1 if none) */
    int8_t src2;                /**< Source register 2 (-1 if none) */
    int8_t src3;                /**< Source register 3 (-1 if none) */

    int32_t imm;                /**< Immediate value (sign-extended) */
    uint8_t size;               /**< Instruction size in bytes (2 or 4) */

    bool is_addr_dst;           /**< Destination is address register */
    bool is_addr_src1;          /**< Source 1 is address register */
    bool is_addr_src2;          /**< Source 2 is address register */

    /* Extracted fields for specific instructions */
    uint8_t n;                  /**< Bit position for bit operations */
    uint8_t pos;                /**< Position field */
    uint8_t width;              /**< Width field for extract/insert */
} decoded_insn_t;

/* ==========================================================================
 * Timing Classes
 * ========================================================================== */

/**
 * @brief Instruction timing class
 *
 * Based on TC1.6.2 Architecture Manual execution timings.
 */
typedef enum {
    TIMING_CLASS_1,             /**< Single cycle (most ALU) */
    TIMING_CLASS_2,             /**< 2 cycles (complex ALU) */
    TIMING_CLASS_3,             /**< 3 cycles (MUL latency) */
    TIMING_CLASS_LS,            /**< Load/Store (+ wait states) */
    TIMING_CLASS_BRANCH,        /**< Branch (1-3 cycles) */
    TIMING_CLASS_CALL,          /**< CALL/RET (CSA access) */
    TIMING_CLASS_DIV,           /**< Division (up to 32 cycles) */
    TIMING_CLASS_LOOP,          /**< LOOP (0 or 1 cycle) */
    TIMING_CLASS_CSA,           /**< CSA operations (4+ cycles) */
    TIMING_CLASS_SYSTEM,        /**< System instructions */
} timing_class_t;

/* ==========================================================================
 * CPU State
 * ========================================================================== */

/**
 * @brief CPU execution state
 */
typedef enum {
    CPU_STATE_RUNNING,          /**< Normal execution */
    CPU_STATE_HALTED,           /**< HALT instruction or error */
    CPU_STATE_DEBUG,            /**< Breakpoint/debug halt */
    CPU_STATE_IDLE,             /**< WAIT instruction */
} cpu_exec_state_t;

/**
 * @brief TC1.6.2P CPU state
 *
 * Complete state of one TriCore CPU core.
 * Based on TC1.6.2 Architecture Manual and TC397XP User Manual.
 */
typedef struct {
    /* General purpose registers */
    uint32_t d[NUM_DATA_REGS];      /**< Data registers D0-D15 */
    uint32_t a[NUM_ADDR_REGS];      /**< Address registers A0-A15 */

    /* Core Special Function Registers - Context Management */
    uint32_t pc;                    /**< Program Counter (CSFR 0xFE08) */
    uint32_t psw;                   /**< Program Status Word (CSFR 0xFE04) */
    uint32_t pcxi;                  /**< Previous Context Information (CSFR 0xFE00) */
    uint32_t fcx;                   /**< Free CSA List Head (CSFR 0xFE38) */
    uint32_t lcx;                   /**< Free CSA List Limit (CSFR 0xFE3C) */

    /* Core Special Function Registers - Interrupt/Trap */
    uint32_t icr;                   /**< Interrupt Control Register (CSFR 0xFE2C) */
    uint32_t isp;                   /**< Interrupt Stack Pointer (CSFR 0xFE28) */
    uint32_t btv;                   /**< Base Trap Vector (CSFR 0xFE24) */
    uint32_t biv;                   /**< Base Interrupt Vector (CSFR 0xFE20) */

    /* Core Special Function Registers - System Config */
    uint32_t syscon;                /**< System Configuration (CSFR 0xFE14) */
    uint32_t cpu_id;                /**< CPU Identification (CSFR 0xFE18) */
    uint32_t compat;                /**< Compatibility Mode (CSFR 0x9400) */

    /* Core Special Function Registers - Debug */
    uint32_t dbgsr;                 /**< Debug Status Register (CSFR 0xFD00) */
    uint32_t exevt;                 /**< External Break Event (CSFR 0xFD08) */
    uint32_t crevt;                 /**< Core Reset Event (CSFR 0xFD0C) */
    uint32_t swevt;                 /**< Software Break Event (CSFR 0xFD10) */
    uint32_t trevt[8];              /**< Trigger Events 0-7 (CSFR 0xFD20-0xFD3C) */

    /* Core Special Function Registers - Performance Counters */
    uint32_t cctrl;                 /**< Counter Control (CSFR 0xFC00) */
    uint32_t ccnt;                  /**< CPU Clock Count (CSFR 0xFC04) */
    uint32_t icnt;                  /**< Instruction Count (CSFR 0xFC08) */
    uint32_t m1cnt;                 /**< Multi-count 1 (CSFR 0xFC0C) */
    uint32_t m2cnt;                 /**< Multi-count 2 (CSFR 0xFC10) */
    uint32_t m3cnt;                 /**< Multi-count 3 (CSFR 0xFC14) */

    /* Core Special Function Registers - Memory Protection */
    uint32_t dpr_l[16];             /**< Data Protection Range Lower (CSFR 0xC000-0xC07C) */
    uint32_t dpr_u[16];             /**< Data Protection Range Upper */
    uint32_t cpr_l[8];              /**< Code Protection Range Lower (CSFR 0xD000-0xD03C) */
    uint32_t cpr_u[8];              /**< Code Protection Range Upper */
    uint32_t dpre[4];               /**< Data Read Enable Sets (CSFR 0xC100-0xC10C) */
    uint32_t dpwe[4];               /**< Data Write Enable Sets (CSFR 0xC140-0xC14C) */
    uint32_t cpxe[4];               /**< Code Execute Enable Sets (CSFR 0xD100-0xD10C) */

    /* Core Special Function Registers - Temporal Protection */
    uint32_t tps_con;               /**< Temporal Protection Control (CSFR 0xE400) */
    uint32_t tps_timer[3];          /**< Temporal Protection Timers (CSFR 0xE404-0xE40C) */

    /* Core Special Function Registers - FPU (if present) */
    uint32_t fpu_trap_con;          /**< FPU Trap Control (CSFR 0xA000) */
    uint32_t fpu_trap_pc;           /**< FPU Trap PC (CSFR 0xA004) */
    uint32_t fpu_trap_opc;          /**< FPU Trap Opcode (CSFR 0xA008) */

    /* Debug Context */
    uint32_t dms;                   /**< Debug Mode Source (CSFR 0xFD40) */
    uint32_t dcx;                   /**< Debug Context Save Area Ptr (CSFR 0xFD44) */
    uint32_t dbgtcr;                /**< Debug Trap Control (CSFR 0xFD48) */

    /* Performance counters (emulator internal) */
    uint64_t cycle_count;           /**< Accumulated cycle count */
    uint64_t insn_count;            /**< Executed instruction count */

    /* Core identification */
    uint32_t core_id;               /**< Core ID (0-5) */

    /* Execution state */
    cpu_exec_state_t state;         /**< Current execution state */

    /* Interrupt state */
    bool irq_pending;               /**< Interrupt pending flag */
    uint8_t pending_priority;       /**< Priority of pending interrupt */
    uint16_t pending_src;           /**< Source ID of pending interrupt */

    /* Trap state */
    bool trap_pending;              /**< Trap pending flag */
    uint8_t trap_class;             /**< Trap class (0-7) */
    uint8_t trap_tin;               /**< Trap Identification Number */

    /* Protection state */
    bool mem_prot_enabled;          /**< Memory protection enabled */
    bool temp_prot_enabled;         /**< Temporal protection enabled */
    uint8_t current_prs;            /**< Current Protection Register Set */

} cpu_state_t;

/* ==========================================================================
 * CSA (Context Save Area) Structures
 * ========================================================================== */

#define CSA_ENTRY_SIZE              64  /**< Size of one CSA entry */
#define CSA_ALIGNMENT               64  /**< Required alignment */

/**
 * @brief Upper context (caller-saved)
 *
 * Saved automatically on interrupt/trap entry.
 */
#ifdef _MSC_VER
#pragma pack(push, 1)
#endif
typedef struct {
    uint32_t pcxi;          /**< Previous Context Information */
    uint32_t psw;           /**< Program Status Word */
    uint32_t a10;           /**< Stack Pointer */
    uint32_t a11;           /**< Return Address */
    uint32_t d8;
    uint32_t d9;
    uint32_t d10;
    uint32_t d11;
    uint32_t a12;
    uint32_t a13;
    uint32_t a14;
    uint32_t a15;
    uint32_t d12;
    uint32_t d13;
    uint32_t d14;
    uint32_t d15;
}
#ifdef __GNUC__
__attribute__((packed))
#endif
csa_upper_t;

/**
 * @brief Lower context (callee-saved)
 *
 * Saved on CALL instruction.
 */
typedef struct {
    uint32_t pcxi;          /**< Previous Context Information */
    uint32_t a11_pc;        /**< Return address (PC after CALL) */
    uint32_t a2;
    uint32_t a3;
    uint32_t d0;
    uint32_t d1;
    uint32_t d2;
    uint32_t d3;
    uint32_t a4;
    uint32_t a5;
    uint32_t a6;
    uint32_t a7;
    uint32_t d4;
    uint32_t d5;
    uint32_t d6;
    uint32_t d7;
}
#ifdef __GNUC__
__attribute__((packed))
#endif
csa_lower_t;

#ifdef _MSC_VER
#pragma pack(pop)
#endif

/**
 * @brief Generic CSA entry
 */
typedef union {
    csa_upper_t upper;
    csa_lower_t lower;
    uint32_t words[16];
    uint8_t bytes[64];
} csa_entry_t;

/* ==========================================================================
 * CSA Address Conversion Macros
 * ========================================================================== */

/**
 * @brief Convert CSA memory address to link word format
 */
#define CSA_ADDR_TO_LINK(addr) \
    ((((uint32_t)(addr) & 0xF0000000) >> 12) | \
     (((uint32_t)(addr) & 0x003FFFC0) >> 6))

/**
 * @brief Convert link word to CSA memory address
 */
#define CSA_LINK_TO_ADDR(link) \
    ((((link) & 0x000F0000) << 12) | \
     (((link) & 0x0000FFFF) << 6))

/* ==========================================================================
 * Memory Timing
 * ========================================================================== */

/**
 * @brief Memory timing configuration
 */
typedef struct {
    uint8_t pflash_wait_states;     /**< Program flash wait states (0-6) */
    uint8_t dflash_read_cycles;     /**< Data flash read cycles */
    uint8_t dspr_cycles;            /**< DSPR cycles (typically 0) */
    uint8_t lmu_cycles;             /**< LMU cycles (typically 1) */
    uint8_t emem_cycles;            /**< EMEM cycles */
    uint8_t peripheral_cycles;      /**< Peripheral register access cycles */
} mem_timing_t;

/* ==========================================================================
 * Emulator Result Codes
 * ========================================================================== */

typedef enum {
    EMU_OK = 0,
    EMU_ERROR_INVALID_INSN,
    EMU_ERROR_INVALID_ADDR,
    EMU_ERROR_UNIMPLEMENTED,
    EMU_ERROR_TRAP,
    EMU_ERROR_CSA_DEPLETED,
    EMU_ERROR_BREAKPOINT,
    EMU_ERROR_HALT,
} emu_result_t;

#ifdef __cplusplus
}
#endif

#endif /* EMU_TYPES_H */
