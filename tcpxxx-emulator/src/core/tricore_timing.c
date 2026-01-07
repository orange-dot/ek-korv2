/**
 * @file tricore_timing.c
 * @brief TriCore TC1.6.2P Timing Annotation Engine
 *
 * Provides cycle count estimates for instructions based on the
 * TC1.6.2 Architecture Manual timing specifications.
 *
 * Target accuracy: ~10% cycle count error for RTOS development.
 */

#include "emu_types.h"
#include "tricore_decode.h"
#include <stdbool.h>

/* ==========================================================================
 * Instruction Timing Classes
 * ========================================================================== */

/**
 * @brief Base cycle counts by timing class
 */
static const uint8_t timing_class_cycles[] = {
    [TIMING_CLASS_1]      = 1,   /* Single cycle ALU */
    [TIMING_CLASS_2]      = 2,   /* Complex ALU (saturating, etc.) */
    [TIMING_CLASS_3]      = 3,   /* Multiply (3 cycle latency) */
    [TIMING_CLASS_LS]     = 1,   /* Load/Store base (+ wait states) */
    [TIMING_CLASS_BRANCH] = 1,   /* Branch (1-3 cycles) */
    [TIMING_CLASS_CALL]   = 4,   /* CALL/RET (CSA access) */
    [TIMING_CLASS_DIV]    = 32,  /* Division (up to 32 cycles) */
    [TIMING_CLASS_LOOP]   = 1,   /* LOOP (0 or 1 cycle) */
    [TIMING_CLASS_CSA]    = 4,   /* CSA operations */
    [TIMING_CLASS_SYSTEM] = 2,   /* System instructions */
};

/* ==========================================================================
 * 16-bit Instruction Timing
 * ========================================================================== */

/**
 * @brief Get timing class for 16-bit instruction
 */
static timing_class_t get_timing_class_16bit(uint8_t opcode)
{
    switch (opcode & 0xFF) {
    /* SR format - Single cycle */
    case 0x00:  /* RET */
        return TIMING_CLASS_CALL;  /* Context restore */

    case 0x02:  /* MOV */
    case 0x0A:  /* MOV.A */
    case 0x22:  /* MOV.D */
    case 0x12:  /* RSUB */
        return TIMING_CLASS_1;

    /* SRR format - Single cycle */
    case 0x42:  /* ADD */
    case 0x4A:  /* ADD.A */
    case 0x52:  /* SUB */
    case 0x5A:  /* SUB.A */
    case 0x26:  /* AND */
    case 0x2E:  /* OR */
    case 0x36:  /* XOR */
    case 0x3E:  /* CMOVN */
    case 0x2A:  /* CMOV */
    case 0x62:  /* MUL */
        return (opcode == 0x62) ? TIMING_CLASS_3 : TIMING_CLASS_1;

    /* SRC format */
    case 0xD2:  /* MOV */
    case 0xC2:  /* ADD */
    case 0xE2:  /* MUL */
    case 0x92:  /* ADDI */
    case 0xA2:  /* ADDIH */
        return (opcode == 0xE2) ? TIMING_CLASS_3 : TIMING_CLASS_1;

    /* SLR, SLRO - Load */
    case 0x08:  /* LD.A */
    case 0x04:  /* LD.W */
    case 0x0C:  /* LD.BU */
    case 0x14:  /* LD.H */
    case 0x44:  /* LD.A [A15] */
    case 0x54:  /* LD.W [A15] */
    case 0x84:  /* LD.A [A15+off] */
    case 0x94:  /* LD.W [A15+off] */
        return TIMING_CLASS_LS;

    /* SSR, SSRO - Store */
    case 0x28:  /* ST.A */
    case 0x24:  /* ST.W */
    case 0x2C:  /* ST.B */
    case 0x34:  /* ST.H */
    case 0x64:  /* ST.A [A15] */
    case 0x74:  /* ST.W [A15] */
    case 0xA4:  /* ST.A [A15+off] */
    case 0xB4:  /* ST.W [A15+off] */
        return TIMING_CLASS_LS;

    /* SB format - Branch */
    case 0x3C:  /* J */
        return TIMING_CLASS_BRANCH;

    /* SBC format - Conditional branch */
    case 0xDE:  /* JNE */
    case 0x9E:  /* JEQ */
    case 0xCE:  /* JNZ.T */
    case 0x8E:  /* JZ.T */
        return TIMING_CLASS_BRANCH;

    /* LOOP */
    case 0xFC:  /* LOOP */
        return TIMING_CLASS_LOOP;

    default:
        return TIMING_CLASS_1;
    }
}

/* ==========================================================================
 * 32-bit Instruction Timing
 * ========================================================================== */

/**
 * @brief Get timing class for 32-bit instruction
 */
static timing_class_t get_timing_class_32bit(uint8_t opcode1, uint8_t opcode2)
{
    switch (opcode1) {
    /* B format - Branch */
    case 0x1D:  /* J */
    case 0x9D:  /* JI */
    case 0x5D:  /* JL */
    case 0xDD:  /* JLI */
    case 0x2D:  /* JA */
        return TIMING_CLASS_BRANCH;

    case 0x6D:  /* CALL */
    case 0xED:  /* CALLI */
        return TIMING_CLASS_CALL;

    /* BRR format - Conditional branch */
    case 0xDF:  /* JEQ */
    case 0x5F:  /* JNE */
    case 0xFF:  /* JLT */
    case 0x7F:  /* JGE */
    case 0xBF:  /* JLT.U */
    case 0x3F:  /* JGE.U */
        return TIMING_CLASS_BRANCH;

    /* BRC format - Branch register/const */
    case 0x9F:  /* JEQ (const) */
    case 0x1F:  /* JNE (const) */
        return TIMING_CLASS_BRANCH;

    /* BO format - Load/Store */
    case 0x09:  /* LD.A */
    case 0x19:  /* LD.W */
    case 0x29:  /* LD.H */
    case 0x39:  /* LD.B */
    case 0x49:  /* LD.Q */
    case 0x05:  /* LD.D */
    case 0x89:  /* ST.A */
    case 0x59:  /* ST.W */
    case 0x69:  /* ST.H */
    case 0x79:  /* ST.B */
    case 0xA9:  /* ST.Q */
    case 0xE5:  /* ST.D */
    case 0x15:  /* LDMST */
    case 0xC5:  /* SWAP.W */
        return TIMING_CLASS_LS;

    /* BOL format - Load/Store long offset */
    case 0x99:  /* LD.W (off16) */
    case 0xB9:  /* ST.W (off16) */
        return TIMING_CLASS_LS;

    case 0xD9:  /* LEA */
        return TIMING_CLASS_1;

    /* RC format - use opcode2 to disambiguate from RR */
    case 0x8B:  /* ADDI */
    case 0xCB:  /* ADDIH */
    case 0x8F:  /* AND (RC) */
    case 0x0F:  /* OR (RC) */
    case 0x8D:  /* XOR (RC) */
        return TIMING_CLASS_1;

    /* 0x0B - RR format ALU operations */
    case 0x0B:
        switch (opcode2) {
        case 0x00:  /* ADD */
        case 0x02:  /* ADDS */
        case 0x04:  /* SUB */
        case 0x06:  /* SUBS */
        case 0x08:  /* AND */
        case 0x0A:  /* OR */
        case 0x0C:  /* XOR */
        case 0x0E:  /* SH */
        case 0x10:  /* SHA */
            return TIMING_CLASS_1;
        case 0x6A:  /* MUL */
        case 0x68:  /* MUL.U */
            return TIMING_CLASS_3;
        default:
            return TIMING_CLASS_1;
        }

    /* 0x0D - SYS format system operations */
    case 0x0D:
        switch (opcode2) {
        case 0x00:  /* SYSCALL */
            return TIMING_CLASS_CSA;
        case 0x04:  /* DISABLE */
        case 0x06:  /* ENABLE */
        case 0x08:  /* DSYNC */
        case 0x0A:  /* ISYNC */
        case 0x0C:  /* NOP */
            return TIMING_CLASS_SYSTEM;
        case 0x10:  /* RFE */
            return TIMING_CLASS_CSA;
        case 0x12:  /* DEBUG */
        case 0x14:  /* WAIT */
            return TIMING_CLASS_SYSTEM;
        case 0x18:  /* SVLCX */
        case 0x1A:  /* RSLCX */
            return TIMING_CLASS_CSA;
        case 0x1C:  /* BISR */
            return TIMING_CLASS_CSA;
        default:
            return TIMING_CLASS_SYSTEM;
        }

    /* RLC format */
    case 0x1B:  /* ADDI (RLC) */
    case 0x3B:  /* MOV */
    case 0x7B:  /* MOVH */
    case 0xBB:  /* MOV.U */
    case 0x6B:  /* ADDIH.A / also used for DIV - check opcode2 */
        /* 0x6B is both ADDIH.A and DIV.U - disambiguate by opcode2 */
        if (opcode2 == 0x21) {
            return TIMING_CLASS_DIV;
        }
        return TIMING_CLASS_1;

    case 0xD1:  /* LEA (RLC) */
        return TIMING_CLASS_1;

    /* Multiply operations */
    case 0x53:  /* MUL/MADD */
    case 0x73:  /* MUL.U/MADD.U */
    case 0xD3:  /* MSUB */
    case 0x33:  /* MADD */
    case 0xB3:  /* MADDSU */
        return TIMING_CLASS_3;

    /* Division */
    case 0x4B:  /* DIV */
        if (opcode2 == 0x20 || opcode2 == 0x21) {
            return TIMING_CLASS_DIV;
        }
        return TIMING_CLASS_1;

    /* MTCR/MFCR */
    case 0xCD:  /* MTCR */
    case 0x4D:  /* MFCR */
        return TIMING_CLASS_2;

    default:
        return TIMING_CLASS_1;
    }
}

/* ==========================================================================
 * Public Interface
 * ========================================================================== */

/**
 * @brief Get base cycle count for instruction
 *
 * @param opcode1   Primary opcode
 * @param opcode2   Secondary opcode (for RR, RRR formats)
 * @param is_16bit  True if 16-bit instruction
 * @return          Base cycle count
 */
uint8_t timing_get_instruction_cycles(uint8_t opcode1, uint8_t opcode2)
{
    timing_class_t tc;

    /* Detect 16-bit vs 32-bit based on opcode LSB */
    bool is_16bit = (opcode1 & 0x01) == 0;

    if (is_16bit) {
        tc = get_timing_class_16bit(opcode1);
    } else {
        tc = get_timing_class_32bit(opcode1, opcode2);
    }

    return timing_class_cycles[tc];
}

/**
 * @brief Get cycle count for decoded instruction
 */
uint8_t timing_get_decoded_cycles(const decoded_insn_t *insn)
{
    timing_class_t tc;

    if (insn->size == 2) {
        tc = get_timing_class_16bit(insn->opcode1);
    } else {
        tc = get_timing_class_32bit(insn->opcode1, insn->opcode2);
    }

    return timing_class_cycles[tc];
}

/**
 * @brief Get memory access cycle count
 *
 * @param addr      Memory address
 * @param is_write  True if write access
 * @return          Cycle count for access
 */
uint8_t timing_get_memory_cycles(uint32_t addr, bool is_write)
{
    /* Program Flash: 5 wait states @ 300MHz */
    if (addr >= PFLASH_BASE && addr < PFLASH_BASE + PFLASH_SIZE) {
        return is_write ? 0 : 6;  /* Flash is read-only during execution */
    }

    /* Data Flash: 10+ cycles read, much slower write */
    if (addr >= DFLASH_BASE && addr < DFLASH_BASE + DFLASH_SIZE) {
        return is_write ? 100 : 11;
    }

    /* Local DSPR: 0 wait states */
    if (addr >= LOCAL_DSPR_BASE && addr < LOCAL_DSPR_BASE + DSPR_SIZE_PER_CORE) {
        return 1;
    }

    /* Local PSPR: 0 wait states */
    if (addr >= LOCAL_PSPR_BASE && addr < LOCAL_PSPR_BASE + PSPR_SIZE_PER_CORE) {
        return 1;
    }

    /* LMU: 1 cycle */
    if (addr >= LMU_BASE && addr < LMU_BASE + LMU_SIZE) {
        return 2;
    }

    /* EMEM: 2 cycles */
    if (addr >= EMEM_BASE && addr < EMEM_BASE + EMEM_SIZE) {
        return 3;
    }

    /* Peripheral: 2 cycles */
    if (addr >= PERIPHERAL_BASE) {
        return 3;
    }

    /* Default: 1 cycle */
    return 1;
}

/**
 * @brief Estimate branch penalty
 *
 * Uses simple static prediction: backward branches predicted taken,
 * forward branches predicted not taken.
 *
 * @param pc            Current PC
 * @param target        Branch target address
 * @param actually_taken Whether branch was actually taken
 * @return              Additional cycles for misprediction (0 or ~3)
 */
uint8_t timing_branch_penalty(uint32_t pc, uint32_t target, bool actually_taken)
{
    /* Static prediction: backward taken, forward not taken */
    bool predicted_taken = (target < pc);

    if (predicted_taken == actually_taken) {
        return 0;  /* Correct prediction */
    }
    return 3;  /* Misprediction penalty ~3 cycles */
}

/**
 * @brief Get timing class name for debugging
 */
const char* timing_class_name(timing_class_t tc)
{
    static const char *names[] = {
        [TIMING_CLASS_1]      = "CLASS_1 (1 cycle)",
        [TIMING_CLASS_2]      = "CLASS_2 (2 cycles)",
        [TIMING_CLASS_3]      = "CLASS_3 (3 cycles)",
        [TIMING_CLASS_LS]     = "CLASS_LS (load/store)",
        [TIMING_CLASS_BRANCH] = "CLASS_BRANCH",
        [TIMING_CLASS_CALL]   = "CLASS_CALL (CSA)",
        [TIMING_CLASS_DIV]    = "CLASS_DIV (32 cycles)",
        [TIMING_CLASS_LOOP]   = "CLASS_LOOP",
        [TIMING_CLASS_CSA]    = "CLASS_CSA",
        [TIMING_CLASS_SYSTEM] = "CLASS_SYSTEM",
    };

    if (tc <= TIMING_CLASS_SYSTEM) {
        return names[tc];
    }
    return "UNKNOWN";
}
