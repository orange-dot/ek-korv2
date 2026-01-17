/**
 * @file tricore_decode.c
 * @brief TriCore TC1.6.2P Instruction Decoder Implementation
 *
 * Decodes 16-bit and 32-bit TriCore instructions.
 * Reference: TriCore TC1.6.2 Core Architecture Manual
 */
#include "tricore_decode.h"
#include <stdio.h>
#include <string.h>
/* ==========================================================================
 * Internal Helper Macros
 * ========================================================================== */
/* Extract bit field from instruction word */
#define BITS(word, hi, lo)  (((word) >> (lo)) & ((1U << ((hi) - (lo) + 1)) - 1))
/* Sign extend a value */
#define SEXT(val, bits)     ((int32_t)((val) << (32 - (bits))) >> (32 - (bits)))
/* Check if opcode byte indicates 16-bit instruction */
#define IS_16BIT(opc)       (((opc) & 0x01) == 0)
/* ==========================================================================
 * 16-bit Instruction Format Detection
 * ========================================================================== */
/**
 * @brief Check if an opcode indicates a 16-bit instruction
 *
 * In TriCore, 16-bit instructions have bit 0 = 0 in the first byte.
 */
bool tricore_is_16bit(uint8_t opcode)
{
    return (opcode & 0x01) == 0;
}
/* ==========================================================================
 * 16-bit Instruction Decoding
 * ========================================================================== */
/**
 * @brief Decode 16-bit SB format (Short Branch)
 */
static void decode_sb(uint16_t insn, decoded_insn_t *out)
{
    out->format = FMT_SB;
    out->imm = SEXT(BITS(insn, 15, 8), 8);  /* disp8 */
}
/**
 * @brief Decode 16-bit SBC format (Short Branch Conditional)
 */
static void decode_sbc(uint16_t insn, decoded_insn_t *out)
{
    out->format = FMT_SBC;
    out->imm = SEXT(BITS(insn, 15, 12), 4); /* const4 */
    out->src1 = 15;  /* D15 implicit */
}
/**
 * @brief Decode 16-bit SBR format (Short Branch Register)
 */
static void decode_sbr(uint16_t insn, decoded_insn_t *out)
{
    out->format = FMT_SBR;
    out->src1 = BITS(insn, 11, 8);          /* s1 */
    out->imm = SEXT(BITS(insn, 15, 12), 4); /* disp4 */
}
/**
 * @brief Decode 16-bit SC format (Short Constant)
 */
static void decode_sc(uint16_t insn, decoded_insn_t *out)
{
    out->format = FMT_SC;
    out->imm = BITS(insn, 15, 8);           /* const8 */
    out->dst = 15;   /* D15 implicit destination */
    out->src1 = 15;  /* D15 implicit source */
}
/**
 * @brief Decode 16-bit SLR format (Short Load Register)
 */
static void decode_slr(uint16_t insn, decoded_insn_t *out)
{
    out->format = FMT_SLR;
    out->dst = BITS(insn, 11, 8);           /* d */
    out->src1 = BITS(insn, 15, 12);         /* s2 (address reg) */
    out->is_addr_src1 = true;
}
/**
 * @brief Decode 16-bit SLRO format (Short Load Register Offset)
 */
static void decode_slro(uint16_t insn, decoded_insn_t *out)
{
    out->format = FMT_SLRO;
    out->dst = BITS(insn, 11, 8);           /* d */
    out->imm = BITS(insn, 15, 12) * 4;      /* off4 (word-aligned) */
    out->src1 = 15;  /* A15 implicit base */
    out->is_addr_src1 = true;
}
/**
 * @brief Decode 16-bit SR format (Short Register)
 */
static void decode_sr(uint16_t insn, decoded_insn_t *out)
{
    out->format = FMT_SR;
    out->src1 = BITS(insn, 11, 8);          /* s1/d */
    out->dst = out->src1;
}
/**
 * @brief Decode 16-bit SRC format (Short Register Constant)
 */
static void decode_src(uint16_t insn, decoded_insn_t *out)
{
    out->format = FMT_SRC;
    out->dst = BITS(insn, 11, 8);           /* d */
    out->imm = SEXT(BITS(insn, 15, 12), 4); /* const4 */
}
/**
 * @brief Decode 16-bit SRO format (Short Register Offset)
 */
static void decode_sro(uint16_t insn, decoded_insn_t *out)
{
    out->format = FMT_SRO;
    out->src1 = BITS(insn, 11, 8);          /* s1 or d */
    out->imm = BITS(insn, 15, 12) * 4;      /* off4 (word-aligned) */
    out->src2 = 15;  /* A15 implicit base */
    out->is_addr_src2 = true;
}
/**
 * @brief Decode 16-bit SRR format (Short Register Register)
 */
static void decode_srr(uint16_t insn, decoded_insn_t *out)
{
    out->format = FMT_SRR;
    out->dst = BITS(insn, 11, 8);           /* d */
    out->src1 = BITS(insn, 11, 8);          /* s1 (same as d) */
    out->src2 = BITS(insn, 15, 12);         /* s2 */
}
/**
 * @brief Decode 16-bit SSR format (Short Store Register)
 */
static void decode_ssr(uint16_t insn, decoded_insn_t *out)
{
    out->format = FMT_SSR;
    out->src1 = BITS(insn, 11, 8);          /* s1 (data) */
    out->src2 = BITS(insn, 15, 12);         /* s2 (address) */
    out->is_addr_src2 = true;
}
/**
 * @brief Decode 16-bit SSRO format (Short Store Register Offset)
 */
static void decode_ssro(uint16_t insn, decoded_insn_t *out)
{
    out->format = FMT_SSRO;
    out->src1 = BITS(insn, 11, 8);          /* s1 (data) */
    out->imm = BITS(insn, 15, 12) * 4;      /* off4 (word-aligned) */
    out->src2 = 15;  /* A15 implicit base */
    out->is_addr_src2 = true;
}
/**
 * @brief Decode a 16-bit instruction
 */
static int decode_16bit(uint16_t insn, decoded_insn_t *out)
{
    uint8_t opc = insn & 0xFF;
    out->opcode1 = opc;
    out->size = 2;
    switch (opc) {
    /* SR format - RET, NOT, etc. */
    case 0x00:
        decode_sr(insn, out);
        out->opcode2 = BITS(insn, 15, 12);
        break;
    /* SRR format - ADD, SUB, MOV, logic ops, etc. */
    case 0x02:  /* MOV D[a], D[b] */
    case 0x42:  /* ADD D[a], D[b] */
    case 0xA2:  /* SUB D[a], D[b] */
    case 0xE2:  /* MUL D[a], D[b] */
    case 0x26:  /* AND D[a], D[b] */
    case 0x66:  /* XOR D[a], D[b] */
    case 0xA6:  /* OR D[a], D[b] */
        decode_srr(insn, out);
        break;
    case 0x40:  /* MOV.AA A[a], A[b] */
    case 0x60:  /* MOV.A A[a], D[b] */
    case 0x80:  /* MOV D[a], A[b] */
    case 0xC0:  /* SUB.A A[a], A[b] */
    case 0xE0:  /* ADD.A A[a], A[b] */
        decode_srr(insn, out);
        out->is_addr_dst = (opc == 0x40 || opc == 0x60 || opc == 0xC0 || opc == 0xE0);
        out->is_addr_src2 = (opc == 0x40 || opc == 0x80 || opc == 0xC0 || opc == 0xE0);
        break;
    /* SRC format - ADD, MOV, SH, etc. with constant */
    case 0x82:  /* MOV D[a], const4 */
    case 0xC2:  /* ADD D[a], const4 */
    case 0x06:  /* SH D[a], const4 */
    case 0x86:  /* SHA D[a], const4 */
    case 0x8A:  /* CADD D[a], D15, const4 */
        decode_src(insn, out);
        break;
    case 0xA0:  /* MOV.A A[a], const4 */
        decode_src(insn, out);
        out->is_addr_dst = true;
        break;
    case 0x20:  /* SUB.A SP, const8 - SC format with implicit SP */
        out->format = FMT_SC;
        out->dst = 10;                          /* SP (A10) implicit */
        out->imm = BITS(insn, 15, 8);           /* const8 */
        out->is_addr_dst = true;
        break;
    case 0xB0:  /* ADD.A A[a], const4 */
        decode_src(insn, out);
        out->is_addr_dst = true;
        break;
    /* SC format - D15 operations */
    case 0x16:  /* AND D15, const8 */
    case 0x52:  /* SUB D15, const8 */
    case 0x96:  /* OR D15, const8 */
    case 0xD2:  /* MOV D15, const8 */
        decode_sc(insn, out);
        break;
    /* SLR format - LD.W, LD.A short */
    case 0x54:  /* LD.W D[a], [A15] */
    case 0xD4:  /* LD.A A[a], [A15] */
        decode_slr(insn, out);
        out->is_addr_dst = (opc == 0xD4);
        break;
    /* SLRO format - LD.W, LD.A with offset */
    case 0x48:  /* LD.W D[a], [A15]off4 */
    case 0xC8:  /* LD.A A[a], [A15]off4 */
        decode_slro(insn, out);
        out->is_addr_dst = (opc == 0xC8);
        break;
    /* SRO format - LD.W, LD.A short offset */
    case 0x4C:  /* LD.W D[a], [A[b]]off4 */
    case 0xCC:  /* LD.A A[a], [A[b]]off4 */
        decode_sro(insn, out);
        out->is_addr_dst = (opc == 0xCC);
        out->dst = BITS(insn, 11, 8);
        break;
    /* SSR format - ST.W, ST.A, post-increment variants */
    case 0x74:  /* ST.W [A[b]], D[a] */
    case 0xF4:  /* ST.A [A[b]], A[a] */
        decode_ssr(insn, out);
        out->is_addr_src1 = (opc == 0xF4);
        break;
    case 0x24:  /* ST.B [A[b]+], D[a] (post-increment byte) */
    case 0x34:  /* ST.W [A[b]+], D[a] (post-increment word) */
    case 0x84:  /* LD.B [A[b]+], D[a] (post-increment byte) */
    case 0xC4:  /* LD.W [A[b]+], D[a] (post-increment word) */
        decode_ssr(insn, out);
        break;
    /* SSRO format - ST.W, ST.A with offset */
    case 0x68:  /* ST.W [A15]off4, D[a] */
    case 0xE8:  /* ST.A [A15]off4, A[a] */
        decode_ssro(insn, out);
        out->is_addr_src1 = (opc == 0xE8);
        break;
    case 0x6C:  /* ST.W [A[b]]off4, D[a] */
    case 0xEC:  /* ST.A [A[b]]off4, A[a] */
        decode_sro(insn, out);
        out->is_addr_src1 = (opc == 0xEC);
        break;
    /* SBR format - JNZ, JZ, LOOP */
    case 0x6E:  /* JZ D[a], disp4 */
    case 0xEE:  /* JNZ D[a], disp4 */
    case 0xFC:  /* LOOP A[b], disp4 */
        decode_sbr(insn, out);
        out->is_addr_src1 = (opc == 0xFC);
        break;
    /* SB format - unconditional short branch */
    case 0x3C:  /* J disp8 */
        decode_sb(insn, out);
        break;
    /* SBC format - conditional branch */
    case 0x1E:  /* JEQ D15, const4, disp4 */
    case 0x5E:  /* JNE D15, const4, disp4 / JNZ.T */
    case 0x9E:  /* JGE D15, const4, disp4 */
    case 0xDE:  /* JLT D15, const4, disp4 */
        decode_sbc(insn, out);
        break;
    /* SR format - special */
    case 0xDC:  /* JI A[a] */
        decode_sr(insn, out);
        out->is_addr_src1 = true;
        break;
    case 0x46:  /* NOT D[a] */
        decode_sr(insn, out);
        break;
    default:
        out->format = FMT_UNKNOWN;
        return 0;
    }
    return 2;
}
/* ==========================================================================
 * 32-bit Instruction Decoding
 * ========================================================================== */
/**
 * @brief Decode 32-bit B format (Branch)
 *
 * B format displacement encoding:
 *   bits [31:16] = disp24[15:0]  (low 16 bits of displacement)
 *   bits [15:8]  = disp24[23:16] (high 8 bits of displacement)
 *   bits [7:0]   = opcode
 *
 * Target address = PC + (sign_extend(disp24) * 2)
 */
static void decode_b(uint32_t insn, decoded_insn_t *out)
{
    out->format = FMT_B;
    /* Extract displacement fields */
    uint32_t disp_lo = BITS(insn, 31, 16);  /* disp24[15:0] - 16 bits */
    uint32_t disp_hi = BITS(insn, 15, 8);   /* disp24[23:16] - 8 bits */
    /* Assemble 24-bit displacement, sign-extend, multiply by 2 for word alignment */
    out->imm = SEXT((disp_hi << 16) | disp_lo, 24) * 2;
}
/**
 * @brief Decode 32-bit BO format (Base + Offset)
 */
static void decode_bo(uint32_t insn, decoded_insn_t *out)
{
    out->format = FMT_BO;
    out->dst = BITS(insn, 11, 8);           /* s1/d (data reg) */
    out->src1 = BITS(insn, 15, 12);         /* b (base address reg) - bits [15:12] */
    out->is_addr_src1 = true;
    /* off10 is split: off10hi = bits[31:28], off10lo = bits[21:16] */
    uint32_t off_hi = BITS(insn, 31, 28);   /* off10[9:6] */
    uint32_t off_lo = BITS(insn, 21, 16);   /* off10[5:0] */
    out->imm = SEXT((off_hi << 6) | off_lo, 10);
    out->opcode2 = BITS(insn, 27, 22);      /* secondary opcode */
}
/**
 * @brief Decode 32-bit BOL format (Base + Offset Long)
 * Format: off16[15:10]=bits[27:22], off16[9:6]=bits[31:28], off16[5:0]=bits[21:16]
 *         b=bits[15:12], c=bits[11:8]
 */
static void decode_bol(uint32_t insn, decoded_insn_t *out)
{
    out->format = FMT_BOL;
    out->dst = BITS(insn, 11, 8);           /* c (destination) */
    out->src1 = BITS(insn, 15, 12);         /* b (base address reg) */
    out->is_addr_src1 = true;
    out->is_addr_dst = true;
    /* off16 is split across non-contiguous fields */
    uint32_t off_5_0 = BITS(insn, 21, 16);   /* off16[5:0] */
    uint32_t off_9_6 = BITS(insn, 31, 28);   /* off16[9:6] */
    uint32_t off_15_10 = BITS(insn, 27, 22); /* off16[15:10] */
    out->imm = SEXT(off_5_0 | (off_9_6 << 6) | (off_15_10 << 10), 16);
}
/**
 * @brief Decode 32-bit BRC format (Branch Register Constant)
 */
static void decode_brc(uint32_t insn, decoded_insn_t *out)
{
    out->format = FMT_BRC;
    out->src1 = BITS(insn, 11, 8);          /* s1 */
    out->imm = SEXT(BITS(insn, 15, 12), 4); /* const4 */
    /* disp15 */
    out->src2 = SEXT(BITS(insn, 30, 16), 15) * 2; /* Reusing src2 for disp */
    out->opcode2 = BITS(insn, 31, 31);      /* op2 bit */
}
/**
 * @brief Decode 32-bit BRR format (Branch Register Register)
 */
static void decode_brr(uint32_t insn, decoded_insn_t *out)
{
    out->format = FMT_BRR;
    out->src1 = BITS(insn, 11, 8);          /* s1 */
    out->src2 = BITS(insn, 15, 12);         /* s2 */
    /* disp15 */
    out->imm = SEXT(BITS(insn, 30, 16), 15) * 2;
    out->opcode2 = BITS(insn, 31, 31);      /* op2 bit */
}
/**
 * @brief Decode 32-bit RC format (Register Constant)
 */
static void decode_rc(uint32_t insn, decoded_insn_t *out)
{
    out->format = FMT_RC;
    out->dst = BITS(insn, 31, 28);          /* d */
    out->src1 = BITS(insn, 11, 8);          /* s1 */
    out->imm = SEXT(BITS(insn, 20, 12), 9); /* const9 */
    out->opcode2 = BITS(insn, 27, 21);      /* op2 */
}
/**
 * @brief Decode 32-bit RCR format (Register Constant Register)
 */
static void decode_rcr(uint32_t insn, decoded_insn_t *out)
{
    out->format = FMT_RCR;
    out->dst = BITS(insn, 31, 28);          /* d */
    out->src1 = BITS(insn, 11, 8);          /* s1 */
    out->src2 = BITS(insn, 15, 12);         /* s3 (accumulator) */
    out->imm = SEXT(BITS(insn, 20, 12), 9); /* const9 */
    out->opcode2 = BITS(insn, 27, 21);      /* op2 */
}
/**
 * @brief Decode 32-bit RLC format (Register Long Constant)
 *
 * RLC format: [31:28]=c (reg), [27:24]=const16[15:12], [23:8]=const16[11:0], [7:0]=opcode
 */
static void decode_rlc(uint32_t insn, decoded_insn_t *out)
{
    out->format = FMT_RLC;
    out->dst = BITS(insn, 31, 28);          /* c (destination register) */
    out->src1 = BITS(insn, 11, 8);          /* s1 (source register) */
    out->imm = BITS(insn, 27, 12);          /* const16 is contiguous bits[27:12] */
}
/**
 * @brief Decode 32-bit RR format (Register Register)
 */
static void decode_rr(uint32_t insn, decoded_insn_t *out)
{
    out->format = FMT_RR;
    out->dst = BITS(insn, 31, 28);          /* d */
    out->src1 = BITS(insn, 11, 8);          /* s1 */
    out->src2 = BITS(insn, 15, 12);         /* s2 */
    out->opcode2 = BITS(insn, 27, 20);      /* op2 */
    out->n = BITS(insn, 17, 16);            /* n field (some instructions) */
}
/**
 * @brief Decode 32-bit RRR format (Register Register Register)
 */
static void decode_rrr(uint32_t insn, decoded_insn_t *out)
{
    out->format = FMT_RRR;
    out->dst = BITS(insn, 31, 28);          /* d */
    out->src1 = BITS(insn, 11, 8);          /* s1 */
    out->src2 = BITS(insn, 15, 12);         /* s2 */
    out->src3 = BITS(insn, 27, 24);         /* s3 (accumulator) */
    out->opcode2 = BITS(insn, 23, 20);      /* op2 */
    out->n = BITS(insn, 17, 16);            /* n field */
}
/**
 * @brief Decode 32-bit SYS format (System)
 */
static void decode_sys(uint32_t insn, decoded_insn_t *out)
{
    out->format = FMT_SYS;
    out->opcode2 = BITS(insn, 27, 22);      /* op2 */
    out->src1 = BITS(insn, 11, 8);          /* s1 */
    out->dst = BITS(insn, 31, 28);          /* d (for BISR) */
}
/**
 * @brief Decode 32-bit RRPW format (Register Register Packed Word)
 * Used for bit field operations: EXTR, INSERT, IMASK
 */
static void decode_rrpw(uint32_t insn, decoded_insn_t *out)
{
    out->format = FMT_RRPW;
    out->dst = BITS(insn, 31, 28);          /* d */
    out->src1 = BITS(insn, 11, 8);          /* s1 */
    out->src2 = BITS(insn, 15, 12);         /* s2 */
    out->pos = BITS(insn, 22, 18);          /* pos (5 bits) */
    out->width = BITS(insn, 27, 23);        /* width (5 bits) */
    out->opcode2 = BITS(insn, 17, 16);      /* op2 (2 bits) */
}
/**
 * @brief Decode 32-bit RCRW format (Register Constant Register Width)
 * Used for bit field operations with constant position
 */
static void decode_rcrw(uint32_t insn, decoded_insn_t *out)
{
    out->format = FMT_RCRW;
    out->dst = BITS(insn, 31, 28);          /* d */
    out->src1 = BITS(insn, 11, 8);          /* s1 */
    out->imm = BITS(insn, 15, 12);          /* const4 */
    out->pos = BITS(insn, 22, 18);          /* pos (5 bits) */
    out->width = BITS(insn, 27, 23);        /* width (5 bits) */
    out->opcode2 = BITS(insn, 17, 16);      /* op2 (2 bits) */
}
/**
 * @brief Decode 32-bit ABS format (Absolute)
 */
static void decode_abs(uint32_t insn, decoded_insn_t *out)
{
    out->format = FMT_ABS;
    out->dst = BITS(insn, 31, 28);          /* s1/d */
    /* off18 is split */
    uint32_t off_a = BITS(insn, 21, 16);    /* 6 bits */
    uint32_t off_b = BITS(insn, 27, 22);    /* 6 bits */
    uint32_t off_c = BITS(insn, 15, 12);    /* 4 bits */
    uint32_t off_d = BITS(insn, 11, 10);    /* 2 bits */
    out->imm = (off_b << 12) | (off_a << 6) | (off_c << 2) | off_d;
    out->opcode2 = BITS(insn, 9, 8);        /* secondary */
}
/**
 * @brief Decode a 32-bit instruction
 */
static int decode_32bit(uint32_t insn, decoded_insn_t *out)
{
    uint8_t opc = insn & 0xFF;  /* Primary opcode is bits [7:0] for 32-bit */
    out->opcode1 = opc;
    out->size = 4;
    switch (opc) {
    /* B format - unconditional branches */
    case 0x1D:  /* J disp24 */
    case 0x5D:  /* JL disp24 */
    case 0x6D:  /* CALL disp24 */
    case 0x9D:  /* JA abs24 */
    case 0xDD:  /* JLA abs24 */
        decode_b(insn, out);
        break;
    /* CALLI - Call Indirect through address register */
    case 0x2D:  /* CALLI A[a] */
        decode_sys(insn, out);
        out->src1 = BITS(insn, 11, 8);  /* a - address register */
        out->is_addr_src1 = true;
        break;
    /* BO format - load/store with base+offset */
    case 0x09:  /* LD.A, LD.DA, etc. */
        decode_bo(insn, out);
        out->is_addr_dst = true;
        break;
    case 0x19:  /* LD.W */
        decode_bo(insn, out);
        break;
    case 0x29:  /* LD.B */
        decode_bo(insn, out);
        break;
    case 0x39:  /* LD.BU */
        decode_bo(insn, out);
        break;
    case 0x49:  /* LD.D */
        decode_bo(insn, out);
        break;
    case 0x59:  /* ST.W */
        decode_bo(insn, out);
        out->src2 = out->dst;  /* source is the "dst" field for stores */
        out->dst = -1;
        break;
    case 0x79:  /* LD.B BOL format (signed byte load) */
        decode_bol(insn, out);
        out->is_addr_dst = false;  /* D[c] is data destination */
        break;
    case 0x89:  /* ST.A */
        decode_bo(insn, out);
        out->src2 = out->dst;
        out->dst = -1;
        out->is_addr_src2 = true;
        break;
    case 0xB9:  /* LD.HU */
        decode_bo(insn, out);
        break;
    case 0xC9:  /* LD.H */
        decode_bo(insn, out);
        break;
    case 0xE9:  /* ST.B */
        decode_bo(insn, out);
        out->src2 = out->dst;
        out->dst = -1;
        break;
    case 0xF9:  /* ST.H */
        decode_bo(insn, out);
        out->src2 = out->dst;
        out->dst = -1;
        break;
    /* BOL format - LEA, LD.A, ST.A, etc. */
    case 0x99:  /* LD.A A[c], [A[b]]off16 */
        decode_bol(insn, out);
        out->is_addr_dst = true;
        break;
    case 0xB5:  /* ST.A [A[b]]off16, A[c] */
        decode_bol(insn, out);
        out->is_addr_src1 = true;  /* A[c] is source, A[b] is base */
        out->src2 = out->dst;  /* A[c] is stored */
        out->dst = -1;  /* No destination register */
        break;
    case 0xD9:  /* LEA */
        decode_bol(insn, out);
        out->is_addr_dst = true;
        break;
    /* BRC format - conditional branch with constant */
    case 0xDF:  /* JEQ.A, etc. */
    case 0xFF:  /* JNE.A, etc. */
        decode_brc(insn, out);
        break;
    /* BRR format - conditional branch with register */
    case 0x1F:  /* JGE.U, JLT.U - unsigned branches */
    case 0x3F:  /* JGE */
    case 0x5F:  /* JEQ */
    case 0x7F:  /* JNE */
    case 0x9F:  /* JGEZ, JLTZ - branch on zero comparison */
    case 0xBF:  /* JLT */
        decode_brr(insn, out);
        break;
    /* BRR format - address register comparison branches */
    case 0x7D:  /* JNE.A - Jump if A[a] != A[b] */
    case 0xFD:  /* JEQ.A - Jump if A[a] == A[b] */
        decode_brr(insn, out);
        out->is_addr_src1 = true;
        out->is_addr_src2 = true;
        break;
    /* RC format - arithmetic/logic with constant */
    case 0x8B:  /* ADD, ADDC, etc. */
        decode_rc(insn, out);
        break;
    case 0x53:  /* MUL D[c], D[a], const9 */
        decode_rc(insn, out);
        break;
    case 0x1B:  /* ADDI */
        decode_rlc(insn, out);
        out->imm = SEXT(out->imm, 16);  /* Sign extend const16 */
        break;
    case 0x9B:  /* ADDIH */
        decode_rlc(insn, out);
        break;
    case 0x8F:  /* AND, ANDN, XOR, SHA, etc. with const9 - RC format */
        decode_rc(insn, out);
        break;
    case 0x0F:  /* OR, AND, XOR, etc. with registers - RR format */
        decode_rr(insn, out);
        break;
    /* RCR format - MAC operations */
    case 0x13:  /* MADD */
    case 0x33:  /* MSUB */
        decode_rcr(insn, out);
        break;
    /* RLC format - MOV with long constant */
    case 0x3B:  /* MOV D[c], const16 */
        decode_rlc(insn, out);
        out->imm = SEXT(out->imm, 16);
        break;
    case 0xBB:  /* MOV.U D[c], const16 (unsigned) */
        decode_rlc(insn, out);
        break;
    case 0x7B:  /* MOVH D[c], const16 */
        decode_rlc(insn, out);
        break;
    case 0x91:  /* MOVH.A A[c], const16 */
        decode_rlc(insn, out);
        out->is_addr_dst = true;
        break;
    case 0xCD:  /* MTCR */
        decode_rlc(insn, out);
        break;
    case 0x4D:  /* MFCR */
        decode_rlc(insn, out);
        break;
    /* RR format - arithmetic/logic with registers */
    case 0x0B:  /* ADD, SUB, MOV, etc. */
        decode_rr(insn, out);
        break;
    case 0x01:  /* MOV.A, etc. */
        decode_rr(insn, out);
        out->is_addr_dst = true;
        break;
    case 0x4B:  /* DIV, DVINIT, DVSTEP, etc. */
        decode_rr(insn, out);
        /* Some 0x4B instructions use address regs, others are division */
        break;
    case 0x6B:  /* DVINIT.U, DVSTEP.U, etc. */
        decode_rr(insn, out);
        break;
    case 0x73:  /* MUL, MULR, etc. */
        decode_rr(insn, out);
        break;
    /* RRR format - 3-operand operations */
    case 0x03:  /* MADD */
    case 0x23:  /* MSUB */
    case 0x43:  /* SEL */
        decode_rrr(insn, out);
        break;
    /* SYS format - system instructions */
    case 0x0D:  /* RET, RFE, DEBUG, etc. */
        decode_sys(insn, out);
        break;
    /* RRPW format - bit field operations */
    case 0x37:  /* EXTR, EXTR.U, INSERT with register */
        decode_rrpw(insn, out);
        break;
    /* RCRW format - bit field with constant */
    case 0xB7:  /* EXTR, EXTR.U, INSERT with constant */
        decode_rcrw(insn, out);
        break;
    /* RR1 format - bit count operations */
    case 0x17:  /* CLZ, CLS, etc. */
        decode_rr(insn, out);
        break;
    /* ABS format - absolute addressing */
    case 0x85:  /* LD.W abs, etc. */
        decode_abs(insn, out);
        break;
    case 0xC5:  /* LEA A[c], off18 */
        decode_abs(insn, out);
        out->is_addr_dst = true;
        break;
    default:
        out->format = FMT_UNKNOWN;
        return 0;
    }
    return 4;
}
/* ==========================================================================
 * Main Decoder Entry Point
 * ========================================================================== */
/**
 * @brief Decode a TriCore instruction
 */
int tricore_decode(uint32_t pc, uint32_t word, decoded_insn_t *out)
{
    /* Initialize output */
    memset(out, 0, sizeof(*out));
    out->pc = pc;
    out->raw = word;
    out->dst = -1;
    out->dst2 = -1;
    out->src1 = -1;
    out->src2 = -1;
    out->src3 = -1;
    /* Check if 16-bit or 32-bit */
    uint8_t first_byte = word & 0xFF;
    if (tricore_is_16bit(first_byte)) {
        return decode_16bit((uint16_t)word, out);
    } else {
        return decode_32bit(word, out);
    }
}
/* ==========================================================================
 * Disassembly Support
 * ========================================================================== */
/**
 * @brief Get instruction mnemonic string
 */
const char* tricore_mnemonic(const decoded_insn_t *insn)
{
    if (insn->size == 2) {
        /* 16-bit instructions */
        switch (insn->opcode1) {
        case 0x00:
            switch (insn->opcode2) {
            case 0x00: return "RET";
            case 0x01: return "DEBUG";
            default:   return "SR?";
            }
        case 0x02: return "MOV";
        case 0x06: return "SH";
        case 0x16: return "AND";
        case 0x3C: return "J";
        case 0x40: return "MOV.AA";
        case 0x42: return "ADD";
        case 0x46: return "NOT";
        case 0x48: return "LD.W";
        case 0x52: return "SUB";
        case 0x54: return "LD.W";
        case 0x60: return "MOV.A";
        case 0x68: return "ST.W";
        case 0x6C: return "ST.W";
        case 0x6E: return "JZ";
        case 0x74: return "ST.W";
        case 0x80: return "MOV";
        case 0x82: return "MOV";
        case 0x86: return "SHA";
        case 0x8A: return "CADD";
        case 0x96: return "OR";
        case 0xA0: return "MOV.A";
        case 0xA2: return "SUB";
        case 0xC2: return "ADD";
        case 0xC8: return "LD.A";
        case 0xCC: return "LD.A";
        case 0xD2: return "MOV";
        case 0xD4: return "LD.A";
        case 0xDC: return "JI";
        case 0xE2: return "MUL";
        case 0xE8: return "ST.A";
        case 0xEC: return "ST.A";
        case 0xEE: return "JNZ";
        case 0xF4: return "ST.A";
        case 0xFC: return "LOOP";
        default:   return "???";
        }
    } else {
        /* 32-bit instructions */
        switch (insn->opcode1) {
        case 0x0B:
            switch (insn->opcode2) {
            case 0x00: return "ADD";
            case 0x02: return "ADDS";
            case 0x08: return "SUB";
            case 0x0A: return "SUBS";
            case 0x1F: return "MOV";
            case 0x1C: return "ABS";
            case 0x18: return "MIN";
            case 0x1A: return "MAX";
            default:   return "RR?";
            }
        case 0x0D:
            switch (insn->opcode2) {
            case 0x00: return "NOP";
            case 0x06: return "RET";
            case 0x07: return "RFE";
            case 0x08: return "SVLCX";
            case 0x09: return "RSLCX";
            case 0x0C: return "ENABLE";
            case 0x0D: return "DISABLE";
            case 0x12: return "DSYNC";
            case 0x13: return "ISYNC";
            case 0x14: return "BISR";
            case 0x17: return "WAIT";
            case 0x24: return "SYSCALL";
            default:   return "SYS?";
            }
        case 0x0F: return "AND/SHA";
        case 0x13: return "MADD";
        case 0x1F:
            switch (insn->opcode2) {
            case 0x00: return "JGE.U";
            case 0x01: return "JLT.U";
            default:   return "JU?";
            }
        case 0x17:
            switch (insn->opcode2) {
            case 0x1B: return "CLZ";
            case 0x1C: return "CLS";
            case 0x20: return "CLO";
            default:   return "BIT?";
            }
        case 0x19: return "LD.W";
        case 0x1B: return "ADDI";
        case 0x1D: return "J";
        case 0x23: return "MSUB";
        case 0x29: return "LD.B";
        case 0x33: return "MSUB";
        case 0x37:
            switch (insn->opcode2) {
            case 0x00: return "EXTR";
            case 0x01: return "EXTR.U";
            case 0x02: return "INSERT";
            case 0x03: return "IMASK";
            default:   return "BF?";
            }
        case 0x39: return "LD.BU";
        case 0x3B: return "MOV";
        case 0x3F: return "JGE";
        case 0x4D: return "MFCR";
        case 0x59: return "ST.W";
        case 0x5D: return "JL";
        case 0x5F: return "JEQ";
        case 0x6D: return "CALL";
        case 0x4B:
            switch (insn->opcode2) {
            case 0x20: return "DVINIT";
            case 0x24: return "DVSTEP";
            case 0x2C: return "DVADJ";
            case 0x0F: return "MOV";
            default:   return "DIV?";
            }
        case 0x6B:
            switch (insn->opcode2) {
            case 0x20: return "DVINIT.U";
            case 0x24: return "DVSTEP.U";
            default:   return "DIVU?";
            }
        case 0x73: return "MUL";
        case 0x79: return "LD.B";
        case 0x7B: return "MOVH";
        case 0x7F: return "JNE";
        case 0x8B: return "ADD";
        case 0x8F: return "OR/SH";
        case 0x9F:
            switch (insn->opcode2) {
            case 0x00: return "JGEZ";
            case 0x01: return "JLTZ";
            default:   return "JZ?";
            }
        case 0xB7:
            switch (insn->opcode2) {
            case 0x00: return "EXTR";
            case 0x01: return "EXTR.U";
            case 0x02: return "INSERT";
            case 0x03: return "IMASK";
            default:   return "BF?";
            }
        case 0x91: return "MOVH.A";
        case 0x9B: return "ADDIH";
        case 0x9D: return "JA";
        case 0xBB: return "MOV.U";
        case 0xBF: return "JLT";
        case 0xC9: return "LD.H";
        case 0xCD: return "MTCR";
        case 0xD9: return "LEA";
        case 0xDD: return "JLA";
        case 0xDF: return "JEQ";
        case 0xE9: return "ST.B";
        case 0xF9: return "ST.H";
        case 0xFF: return "JNE";
        default:   return "???";
        }
    }
}
/**
 * @brief Disassemble instruction to string
 */
int tricore_disasm(const decoded_insn_t *insn, char *buf, size_t bufsz)
{
    const char *mnem = tricore_mnemonic(insn);
    int len = 0;
    /* Start with mnemonic */
    len = snprintf(buf, bufsz, "%-8s", mnem);
    /* Add operands based on format */
    switch (insn->format) {
    case FMT_SRR:
    case FMT_RR:
        if (insn->is_addr_dst) {
            len += snprintf(buf + len, bufsz - len, "a%d, ", insn->dst);
        } else {
            len += snprintf(buf + len, bufsz - len, "d%d, ", insn->dst);
        }
        if (insn->is_addr_src2) {
            len += snprintf(buf + len, bufsz - len, "a%d", insn->src2);
        } else {
            len += snprintf(buf + len, bufsz - len, "d%d", insn->src2);
        }
        break;
    case FMT_SRC:
    case FMT_RC:
        if (insn->is_addr_dst) {
            len += snprintf(buf + len, bufsz - len, "a%d, #%d",
                           insn->dst, insn->imm);
        } else {
            len += snprintf(buf + len, bufsz - len, "d%d, #%d",
                           insn->dst, insn->imm);
        }
        break;
    case FMT_B:
        len += snprintf(buf + len, bufsz - len, "0x%08x",
                       (uint32_t)(insn->pc + insn->imm));
        break;
    case FMT_BO:
    case FMT_BOL:
        if (insn->dst >= 0) {
            len += snprintf(buf + len, bufsz - len, "%s%d, [a%d]%d",
                           insn->is_addr_dst ? "a" : "d",
                           insn->dst, insn->src1, insn->imm);
        } else {
            len += snprintf(buf + len, bufsz - len, "[a%d]%d, %s%d",
                           insn->src1, insn->imm,
                           insn->is_addr_src2 ? "a" : "d", insn->src2);
        }
        break;
    case FMT_RLC:
        len += snprintf(buf + len, bufsz - len, "%s%d, #%d",
                       insn->is_addr_dst ? "a" : "d",
                       insn->dst, insn->imm);
        break;
    default:
        /* Simple format */
        break;
    }
    return len;
}
