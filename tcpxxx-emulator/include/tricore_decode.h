/**
 * @file tricore_decode.h
 * @brief TriCore TC1.6.2P Instruction Decoder
 *
 * Decodes 16-bit and 32-bit TriCore instructions into a structured
 * representation for execution.
 */

#ifndef TRICORE_DECODE_H
#define TRICORE_DECODE_H

#include "emu_types.h"

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Opcode Definitions
 * ========================================================================== */

/**
 * @defgroup TRICORE_OPC Primary Opcodes
 *
 * TriCore uses bits [7:0] (16-bit) or [5:0] (32-bit) as primary opcode.
 * Secondary opcodes are in different bit positions depending on format.
 * @{
 */

/* 16-bit instruction primary opcodes (bits [7:0]) */
#define OPC_16_SB_JNZ           0x5E    /**< JNZ.T conditional */
#define OPC_16_SBC_JEQ          0x1E    /**< JEQ conditional */
#define OPC_16_SBC_JNE          0x5E    /**< JNE conditional */
#define OPC_16_SBR_JNZ          0xEE    /**< JNZ register */
#define OPC_16_SBR_JZ           0x6E    /**< JZ register */
#define OPC_16_SBR_LOOP         0xFC    /**< LOOP */
#define OPC_16_SC_AND           0x16    /**< AND D15, const4 */
#define OPC_16_SC_MOV           0xD2    /**< MOV D15, const8 */
#define OPC_16_SC_OR            0x96    /**< OR D15, const4 */
#define OPC_16_SC_SUB           0x52    /**< SUB D15, const4 */
#define OPC_16_SLR_LD_A         0xD4    /**< LD.A [A15], offset */
#define OPC_16_SLR_LD_W         0x54    /**< LD.W [A15], offset */
#define OPC_16_SLRO_LD_A        0xC8    /**< LD.A [A15]offset, ... */
#define OPC_16_SLRO_LD_W        0x48    /**< LD.W [A15]offset, ... */
#define OPC_16_SR_JI            0xDC    /**< JI indirect jump */
#define OPC_16_SR_NOT           0x46    /**< NOT */
#define OPC_16_SR_RET           0x00    /**< RET */
#define OPC_16_SR_DEBUG         0x00    /**< DEBUG */
#define OPC_16_SRC_ADD          0xC2    /**< ADD short */
#define OPC_16_SRC_CADD         0x8A    /**< CADD conditional add */
#define OPC_16_SRC_MOV          0x82    /**< MOV short */
#define OPC_16_SRC_MOV_A        0xA0    /**< MOV.A short */
#define OPC_16_SRC_SH           0x06    /**< SH short */
#define OPC_16_SRC_SHA          0x86    /**< SHA short */
#define OPC_16_SRO_LD_A         0xCC    /**< LD.A short offset */
#define OPC_16_SRO_LD_W         0x4C    /**< LD.W short offset */
#define OPC_16_SRO_ST_A         0xEC    /**< ST.A short offset */
#define OPC_16_SRO_ST_W         0x6C    /**< ST.W short offset */
#define OPC_16_SRR_ADD          0x42    /**< ADD D[a], D[b] */
#define OPC_16_SRR_MOV          0x02    /**< MOV D[a], D[b] */
#define OPC_16_SRR_MOV_A        0x60    /**< MOV.A A[a], D[b] */
#define OPC_16_SRR_MOV_D        0x80    /**< MOV D[a], A[b] */
#define OPC_16_SRR_MOV_AA       0x40    /**< MOV.AA A[a], A[b] */
#define OPC_16_SRR_MUL          0xE2    /**< MUL short */
#define OPC_16_SRR_SUB          0xA2    /**< SUB D[a], D[b] */
#define OPC_16_SSR_ST_A         0xF4    /**< ST.A short */
#define OPC_16_SSR_ST_W         0x74    /**< ST.W short */
#define OPC_16_SSRO_ST_A        0xE8    /**< ST.A offset */
#define OPC_16_SSRO_ST_W        0x68    /**< ST.W offset */

/* 32-bit instruction primary opcodes (bits [5:0]) */
#define OPC_32_ABS              0x85    /**< ABS addressing */
#define OPC_32_ABSB             0xC5    /**< ABS bit operations */
#define OPC_32_B_CALL           0x6D    /**< CALL absolute */
#define OPC_32_B_J              0x1D    /**< J unconditional */
#define OPC_32_B_JA             0x9D    /**< JA absolute */
#define OPC_32_B_JL             0x5D    /**< JL link */
#define OPC_32_B_JLA            0xDD    /**< JLA absolute link */
#define OPC_32_BIT              0x8F    /**< BIT operations */
#define OPC_32_BO_LD_A          0x09    /**< LD.A base+offset */
#define OPC_32_BO_LD_W          0x19    /**< LD.W base+offset */
#define OPC_32_BO_LD_D          0x49    /**< LD.D base+offset */
#define OPC_32_BO_LD_B          0x29    /**< LD.B base+offset */
#define OPC_32_BO_LD_H          0xC9    /**< LD.H base+offset */
#define OPC_32_BO_LD_BU         0x39    /**< LD.BU base+offset */
#define OPC_32_BO_LD_HU         0xB9    /**< LD.HU base+offset */
#define OPC_32_BO_ST_A          0x89    /**< ST.A base+offset */
#define OPC_32_BO_ST_W          0x59    /**< ST.W base+offset */
#define OPC_32_BO_ST_D          0x79    /**< ST.D base+offset */
#define OPC_32_BO_ST_B          0xE9    /**< ST.B base+offset */
#define OPC_32_BO_ST_H          0xF9    /**< ST.H base+offset */
#define OPC_32_BOL_LD_A         0x99    /**< LD.A BOL format */
#define OPC_32_BOL_LD_W         0x19    /**< LD.W BOL format */
#define OPC_32_BOL_LEA          0xD9    /**< LEA */
#define OPC_32_BOL_ST_A         0xB5    /**< ST.A BOL format */
#define OPC_32_BOL_ST_W         0x59    /**< ST.W BOL format */
#define OPC_32_BRC_JEQ          0xDF    /**< JEQ register-const */
#define OPC_32_BRC_JNE          0xFF    /**< JNE register-const */
#define OPC_32_BRR_JEQ          0x5F    /**< JEQ register-register */
#define OPC_32_BRR_JNE          0x7F    /**< JNE register-register */
#define OPC_32_BRR_JLT          0xBF    /**< JLT register-register */
#define OPC_32_BRR_JGE          0x3F    /**< JGE register-register */
#define OPC_32_RC_ADD           0x8B    /**< ADD register-const */
#define OPC_32_RC_ADDI          0x1B    /**< ADDI */
#define OPC_32_RC_ADDIH         0x9B    /**< ADDIH */
#define OPC_32_RC_AND           0x0F    /**< AND register-const */
#define OPC_32_RC_OR            0x8F    /**< OR register-const */
#define OPC_32_RC_XOR           0x0F    /**< XOR register-const */
#define OPC_32_RC_SH            0x8F    /**< SH register-const */
#define OPC_32_RC_SHA           0x0F    /**< SHA register-const */
#define OPC_32_RCR_MADD         0x13    /**< MADD */
#define OPC_32_RCR_MSUB         0x33    /**< MSUB */
#define OPC_32_RLC_MOV          0x3B    /**< MOV register-longconst */
#define OPC_32_RLC_MOV_U        0xBB    /**< MOV.U unsigned */
#define OPC_32_RLC_MOVH         0x7B    /**< MOVH high */
#define OPC_32_RLC_MOVH_A       0x91    /**< MOVH.A */
#define OPC_32_RLC_MTCR         0xCD    /**< MTCR */
#define OPC_32_RLC_MFCR         0x4D    /**< MFCR */
#define OPC_32_RR_ADD           0x0B    /**< ADD register-register */
#define OPC_32_RR_SUB           0x0B    /**< SUB register-register */
#define OPC_32_RR_MUL           0x73    /**< MUL register-register */
#define OPC_32_RR_AND           0x0F    /**< AND register-register */
#define OPC_32_RR_OR            0x0F    /**< OR register-register */
#define OPC_32_RR_XOR           0x0F    /**< XOR register-register */
#define OPC_32_RR_MOV           0x0B    /**< MOV register-register */
#define OPC_32_RR_MOV_A         0x01    /**< MOV.A */
#define OPC_32_RR_MOV_D         0x4B    /**< MOV D, A */
#define OPC_32_RRR_MADD         0x03    /**< MADD 3-reg */
#define OPC_32_RRR_MSUB         0x23    /**< MSUB 3-reg */
#define OPC_32_SYS              0x0D    /**< System instructions */

/** @} */

/* ==========================================================================
 * Secondary Opcodes (format-specific)
 * ========================================================================== */

/**
 * @defgroup TRICORE_OPC2 Secondary Opcodes
 * @{
 */

/* RR format secondary opcodes (bits [27:20]) */
#define OPC2_RR_ADD             0x00
#define OPC2_RR_ADDS            0x02
#define OPC2_RR_ADDX            0x04
#define OPC2_RR_SUB             0x08
#define OPC2_RR_SUBS            0x0A
#define OPC2_RR_SUBX            0x0C
#define OPC2_RR_MOV             0x1F
#define OPC2_RR_MOV_A           0x63
#define OPC2_RR_ABS             0x1C
#define OPC2_RR_ABSS            0x1D
#define OPC2_RR_MIN             0x18
#define OPC2_RR_MAX             0x1A
#define OPC2_RR_AND             0x08
#define OPC2_RR_ANDN            0x0E
#define OPC2_RR_OR              0x0A
#define OPC2_RR_ORN             0x0F
#define OPC2_RR_XOR             0x0C
#define OPC2_RR_XNOR            0x0D
#define OPC2_RR_NAND            0x09
#define OPC2_RR_NOR             0x0B
#define OPC2_RR_SH              0x00
#define OPC2_RR_SHA             0x01
#define OPC2_RR_CLO             0x1C
#define OPC2_RR_CLZ             0x1B
#define OPC2_RR_CLS             0x1D
#define OPC2_RR_POPCNT          0x22    /* TC1.6.2P */

/* SYS format secondary opcodes (bits [27:22]) */
#define OPC2_SYS_DEBUG          0x01
#define OPC2_SYS_DISABLE        0x0D
#define OPC2_SYS_ENABLE         0x0C
#define OPC2_SYS_DSYNC          0x12
#define OPC2_SYS_ISYNC          0x13
#define OPC2_SYS_NOP            0x00
#define OPC2_SYS_RET            0x06
#define OPC2_SYS_RFE            0x07
#define OPC2_SYS_RSLCX          0x09
#define OPC2_SYS_SVLCX          0x08
#define OPC2_SYS_BISR           0x14
#define OPC2_SYS_SYSCALL        0x24
#define OPC2_SYS_WAIT           0x17

/* RC format secondary opcodes (bits [27:21]) */
#define OPC2_RC_ADD             0x00
#define OPC2_RC_ADDS            0x02
#define OPC2_RC_ADDSC_A         0x10
#define OPC2_RC_RSUB            0x08
#define OPC2_RC_RSUBS           0x0A
#define OPC2_RC_AND             0x08
#define OPC2_RC_ANDN            0x0E
#define OPC2_RC_OR              0x0A
#define OPC2_RC_ORN             0x0F
#define OPC2_RC_XOR             0x0C
#define OPC2_RC_XNOR            0x0D
#define OPC2_RC_SH              0x00
#define OPC2_RC_SHA             0x01
#define OPC2_RC_MIN             0x18
#define OPC2_RC_MAX             0x1A
#define OPC2_RC_EQ              0x10
#define OPC2_RC_NE              0x11
#define OPC2_RC_LT              0x12
#define OPC2_RC_GE              0x14

/** @} */

/* ==========================================================================
 * Decoder Functions
 * ========================================================================== */

/**
 * @brief Decode a TriCore instruction
 *
 * @param pc      Program counter (address of instruction)
 * @param word    Instruction word (little-endian, may be 2 or 4 bytes)
 * @param out     Output decoded instruction structure
 * @return        Instruction size in bytes (2 or 4), or 0 on decode error
 *
 * @note The caller must ensure `word` contains at least 4 bytes.
 *       If the instruction is 16-bit, only the low 16 bits are used.
 */
int tricore_decode(uint32_t pc, uint32_t word, decoded_insn_t *out);

/**
 * @brief Check if an opcode indicates a 16-bit instruction
 *
 * @param opcode  Primary opcode byte (bits [7:0] of first halfword)
 * @return        true if 16-bit instruction, false if 32-bit
 */
bool tricore_is_16bit(uint8_t opcode);

/**
 * @brief Get instruction mnemonic string
 *
 * @param insn    Decoded instruction
 * @return        Mnemonic string (static, do not free)
 */
const char* tricore_mnemonic(const decoded_insn_t *insn);

/**
 * @brief Disassemble instruction to string
 *
 * @param insn    Decoded instruction
 * @param buf     Output buffer
 * @param bufsz   Buffer size
 * @return        Number of characters written (excluding null)
 */
int tricore_disasm(const decoded_insn_t *insn, char *buf, size_t bufsz);

#ifdef __cplusplus
}
#endif

#endif /* TRICORE_DECODE_H */
