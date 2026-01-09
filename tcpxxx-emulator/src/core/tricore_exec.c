/**
 * @file tricore_exec.c
 * @brief TriCore TC1.6.2P Instruction Executor
 *
 * Executes decoded TriCore instructions and updates CPU state.
 * Implements timing annotations for ~10% cycle accuracy.
 *
 * Reference: TriCore TC1.6.2 Architecture Manual
 */

#include "tricore_exec.h"
#include "tricore_decode.h"
#include <stdio.h>
#include <string.h>

/* ==========================================================================
 * Helper Macros
 * ========================================================================== */

/* Sign extension */
#define SEXT8(x)    ((int32_t)(int8_t)(x))
#define SEXT16(x)   ((int32_t)(int16_t)(x))
#define SEXT32(x)   ((int64_t)(int32_t)(x))

/* Register access shortcuts */
#define D(n)        (cpu->d[(n) & 0xF])
#define A(n)        (cpu->a[(n) & 0xF])
#define PC          (cpu->pc)
#define PSW         (cpu->psw)
#define PCXI        (cpu->pcxi)
#define FCX         (cpu->fcx)
#define ICR         (cpu->icr)

/* PSW flag access */
#define PSW_SET_C(v)    do { if (v) PSW |= PSW_C; else PSW &= ~PSW_C; } while(0)
#define PSW_SET_V(v)    do { if (v) PSW |= PSW_V; else PSW &= ~PSW_V; } while(0)
#define PSW_SET_SV(v)   do { if (v) PSW |= PSW_SV; } while(0)  /* Sticky */
#define PSW_SET_AV(v)   do { if (v) PSW |= PSW_AV; else PSW &= ~PSW_AV; } while(0)
#define PSW_SET_SAV(v)  do { if (v) PSW |= PSW_SAV; } while(0) /* Sticky */

#define PSW_GET_C()     ((PSW & PSW_C) != 0)

/* Base timing cycles */
#define CYCLES_ALU      1   /* Basic ALU operations */
#define CYCLES_MUL      2   /* Multiply */
#define CYCLES_DIV      10  /* Division (simplified) */
#define CYCLES_BRANCH   1   /* Taken branch */
#define CYCLES_BRANCH_NT 1  /* Not taken branch */
#define CYCLES_CALL     4   /* CALL (CSA save) */
#define CYCLES_RET      4   /* RET (CSA restore) */
#define CYCLES_TRAP     4   /* Trap entry */

/* ==========================================================================
 * Forward Declarations
 * ========================================================================== */

static int exec_16bit(cpu_state_t *cpu, const decoded_insn_t *insn, mem_system_t *mem);
static int exec_32bit(cpu_state_t *cpu, const decoded_insn_t *insn, mem_system_t *mem);

/* ==========================================================================
 * PSW Flag Helpers
 * ========================================================================== */

/**
 * @brief Update overflow flags for addition
 */
static void update_flags_add(cpu_state_t *cpu, int32_t a, int32_t b, int64_t result)
{
    bool overflow = ((a > 0 && b > 0 && result < 0) ||
                     (a < 0 && b < 0 && result > 0));
    PSW_SET_V(overflow);
    PSW_SET_SV(overflow);

    /* Advanced overflow (bit 31 != bit 30) */
    bool av = ((result >> 31) & 1) != ((result >> 30) & 1);
    PSW_SET_AV(av);
    PSW_SET_SAV(av);
}

/**
 * @brief Update overflow flags for subtraction
 */
static void update_flags_sub(cpu_state_t *cpu, int32_t a, int32_t b, int64_t result)
{
    bool overflow = ((a > 0 && b < 0 && result < 0) ||
                     (a < 0 && b > 0 && result > 0));
    PSW_SET_V(overflow);
    PSW_SET_SV(overflow);

    bool av = ((result >> 31) & 1) != ((result >> 30) & 1);
    PSW_SET_AV(av);
    PSW_SET_SAV(av);
}

/**
 * @brief Update carry flag for unsigned addition
 */
static void update_carry_add(cpu_state_t *cpu, uint32_t a, uint32_t b)
{
    uint64_t result = (uint64_t)a + (uint64_t)b;
    PSW_SET_C(result > 0xFFFFFFFF);
}

/* ==========================================================================
 * Memory Access Helpers
 * ========================================================================== */

/**
 * @brief Load with timing
 */
static uint32_t load32(cpu_state_t *cpu, mem_system_t *mem, uint32_t addr, int *cycles)
{
    *cycles += mem_get_cycles(mem, addr, false);
    return mem_read32(mem, addr);
}

static uint16_t load16(cpu_state_t *cpu, mem_system_t *mem, uint32_t addr, int *cycles)
{
    *cycles += mem_get_cycles(mem, addr, false);
    return mem_read16(mem, addr);
}

static uint8_t load8(cpu_state_t *cpu, mem_system_t *mem, uint32_t addr, int *cycles)
{
    *cycles += mem_get_cycles(mem, addr, false);
    return mem_read8(mem, addr);
}

/**
 * @brief Store with timing
 */
static void store32(cpu_state_t *cpu, mem_system_t *mem, uint32_t addr, uint32_t val, int *cycles)
{
    *cycles += mem_get_cycles(mem, addr, true);
    mem_write32(mem, addr, val);
}

static void store16(cpu_state_t *cpu, mem_system_t *mem, uint32_t addr, uint16_t val, int *cycles)
{
    *cycles += mem_get_cycles(mem, addr, true);
    mem_write16(mem, addr, val);
}

static void store8(cpu_state_t *cpu, mem_system_t *mem, uint32_t addr, uint8_t val, int *cycles)
{
    *cycles += mem_get_cycles(mem, addr, true);
    mem_write8(mem, addr, val);
}

/* ==========================================================================
 * CSA Operations
 * ========================================================================== */

/**
 * @brief Convert link word to address
 */
static uint32_t link_to_addr(uint32_t link)
{
    return ((link & 0x000F0000) << 12) | ((link & 0x0000FFFF) << 6);
}

/**
 * @brief Convert address to link word
 */
static uint32_t addr_to_link(uint32_t addr)
{
    return ((addr & 0xF0000000) >> 12) | ((addr & 0x003FFFC0) >> 6);
}

/**
 * @brief Save lower context (CALL instruction)
 */
int csa_save_lower(cpu_state_t *cpu, mem_system_t *mem)
{
    int cycles = 0;

    /* Get free CSA from FCX */
    if (FCX == 0) {
        /* CSA depleted - trigger trap */
        fprintf(stderr, "CSA DEPLETED - no free context save areas\n");
        return -1;
    }

    uint32_t csa_addr = link_to_addr(FCX);

    /* Read next free from CSA[0] (link word) */
    uint32_t next_fcx = load32(cpu, mem, csa_addr, &cycles);

    /* Save lower context */
    store32(cpu, mem, csa_addr + 0, PCXI, &cycles);           /* PCXI */
    store32(cpu, mem, csa_addr + 4, A(11), &cycles);          /* A11 (return addr) */
    store32(cpu, mem, csa_addr + 8, A(2), &cycles);
    store32(cpu, mem, csa_addr + 12, A(3), &cycles);
    store32(cpu, mem, csa_addr + 16, D(0), &cycles);
    store32(cpu, mem, csa_addr + 20, D(1), &cycles);
    store32(cpu, mem, csa_addr + 24, D(2), &cycles);
    store32(cpu, mem, csa_addr + 28, D(3), &cycles);
    store32(cpu, mem, csa_addr + 32, A(4), &cycles);
    store32(cpu, mem, csa_addr + 36, A(5), &cycles);
    store32(cpu, mem, csa_addr + 40, A(6), &cycles);
    store32(cpu, mem, csa_addr + 44, A(7), &cycles);
    store32(cpu, mem, csa_addr + 48, D(4), &cycles);
    store32(cpu, mem, csa_addr + 52, D(5), &cycles);
    store32(cpu, mem, csa_addr + 56, D(6), &cycles);
    store32(cpu, mem, csa_addr + 60, D(7), &cycles);

    /* Save A14 to shadow stack (GCC expects A14 preserved across calls) */
    if (cpu->a14_shadow_depth < 64) {
        fprintf(stderr, "[A14-SAVE] depth=%d A14=0x%08X\n", cpu->a14_shadow_depth, A(14));
        cpu->a14_shadow[cpu->a14_shadow_depth++] = A(14);
    }

    /* Update PCXI with new link (lower context, UL=0) */
    PCXI = addr_to_link(csa_addr);  /* UL bit clear = lower context */

    /* Update FCX to next free */
    FCX = next_fcx;

    return cycles;
}

/**
 * @brief Restore lower context from CSA
 * @param cpu CPU state
 * @param mem Memory system
 * @param preserve_retval If true, preserve D2/A2 (return value registers)
 *                        Use true for RET, false for RSLCX
 */
int csa_restore_lower_ex(cpu_state_t *cpu, mem_system_t *mem, int preserve_retval)
{
    int cycles = 0;

    if (PCXI == 0) {
        /* No context to restore */
        return -1;
    }

    uint32_t csa_addr = link_to_addr(PCXI);

    /* Restore lower context */
    uint32_t old_pcxi = load32(cpu, mem, csa_addr + 0, &cycles);
    A(11) = load32(cpu, mem, csa_addr + 4, &cycles);  /* Return address */

    /* D2 and A2 are return value registers - only restore for RSLCX, not RET */
    if (!preserve_retval) {
        A(2) = load32(cpu, mem, csa_addr + 8, &cycles);
        D(2) = load32(cpu, mem, csa_addr + 24, &cycles);
    } else {
        /* Still need to read for cycle count but don't use values */
        (void)load32(cpu, mem, csa_addr + 8, &cycles);
        (void)load32(cpu, mem, csa_addr + 24, &cycles);
    }

    A(3) = load32(cpu, mem, csa_addr + 12, &cycles);
    D(0) = load32(cpu, mem, csa_addr + 16, &cycles);
    D(1) = load32(cpu, mem, csa_addr + 20, &cycles);
    D(3) = load32(cpu, mem, csa_addr + 28, &cycles);
    A(4) = load32(cpu, mem, csa_addr + 32, &cycles);
    A(5) = load32(cpu, mem, csa_addr + 36, &cycles);
    A(6) = load32(cpu, mem, csa_addr + 40, &cycles);
    A(7) = load32(cpu, mem, csa_addr + 44, &cycles);
    D(4) = load32(cpu, mem, csa_addr + 48, &cycles);
    D(5) = load32(cpu, mem, csa_addr + 52, &cycles);
    D(6) = load32(cpu, mem, csa_addr + 56, &cycles);
    D(7) = load32(cpu, mem, csa_addr + 60, &cycles);

    /* Restore A14 from shadow stack (GCC expects A14 preserved across calls) */
    if (cpu->a14_shadow_depth > 0) {
        A(14) = cpu->a14_shadow[--cpu->a14_shadow_depth];
        fprintf(stderr, "[A14-REST] depth=%d A14=0x%08X\n", cpu->a14_shadow_depth, A(14));
    }

    /* Return CSA to free list */
    store32(cpu, mem, csa_addr, FCX, &cycles);
    FCX = PCXI;

    /* Restore old PCXI */
    PCXI = old_pcxi;

    return cycles;
}

/* Wrapper for backward compatibility - restores all registers */
int csa_restore_lower(cpu_state_t *cpu, mem_system_t *mem)
{
    return csa_restore_lower_ex(cpu, mem, 0);  /* restore all */
}

/**
 * @brief Save upper context (interrupt/trap entry)
 */
int csa_save_upper(cpu_state_t *cpu, mem_system_t *mem)
{
    int cycles = 0;

    if (FCX == 0) {
        return -1;  /* CSA depleted */
    }

    uint32_t csa_addr = link_to_addr(FCX);
    uint32_t next_fcx = load32(cpu, mem, csa_addr, &cycles);

    /* Save upper context */
    store32(cpu, mem, csa_addr + 0, PCXI, &cycles);
    store32(cpu, mem, csa_addr + 4, PSW, &cycles);
    store32(cpu, mem, csa_addr + 8, A(10), &cycles);   /* SP */
    store32(cpu, mem, csa_addr + 12, A(11), &cycles);  /* RA */
    store32(cpu, mem, csa_addr + 16, D(8), &cycles);
    store32(cpu, mem, csa_addr + 20, D(9), &cycles);
    store32(cpu, mem, csa_addr + 24, D(10), &cycles);
    store32(cpu, mem, csa_addr + 28, D(11), &cycles);
    store32(cpu, mem, csa_addr + 32, A(12), &cycles);
    store32(cpu, mem, csa_addr + 36, A(13), &cycles);
    store32(cpu, mem, csa_addr + 40, A(14), &cycles);
    store32(cpu, mem, csa_addr + 44, A(15), &cycles);
    store32(cpu, mem, csa_addr + 48, D(12), &cycles);
    store32(cpu, mem, csa_addr + 52, D(13), &cycles);
    store32(cpu, mem, csa_addr + 56, D(14), &cycles);
    store32(cpu, mem, csa_addr + 60, D(15), &cycles);

    /* Update PCXI with upper context flag (UL=1) */
    PCXI = addr_to_link(csa_addr) | PCXI_UL;

    FCX = next_fcx;

    return cycles;
}

/**
 * @brief Restore upper context (RFE instruction)
 */
int csa_restore_upper(cpu_state_t *cpu, mem_system_t *mem)
{
    int cycles = 0;

    if (PCXI == 0) {
        return -1;
    }

    uint32_t csa_addr = link_to_addr(PCXI);

    /* Restore upper context */
    uint32_t old_pcxi = load32(cpu, mem, csa_addr + 0, &cycles);
    PSW = load32(cpu, mem, csa_addr + 4, &cycles);
    A(10) = load32(cpu, mem, csa_addr + 8, &cycles);
    A(11) = load32(cpu, mem, csa_addr + 12, &cycles);
    D(8) = load32(cpu, mem, csa_addr + 16, &cycles);
    D(9) = load32(cpu, mem, csa_addr + 20, &cycles);
    D(10) = load32(cpu, mem, csa_addr + 24, &cycles);
    D(11) = load32(cpu, mem, csa_addr + 28, &cycles);
    A(12) = load32(cpu, mem, csa_addr + 32, &cycles);
    A(13) = load32(cpu, mem, csa_addr + 36, &cycles);
    A(14) = load32(cpu, mem, csa_addr + 40, &cycles);
    A(15) = load32(cpu, mem, csa_addr + 44, &cycles);
    D(12) = load32(cpu, mem, csa_addr + 48, &cycles);
    D(13) = load32(cpu, mem, csa_addr + 52, &cycles);
    D(14) = load32(cpu, mem, csa_addr + 56, &cycles);
    D(15) = load32(cpu, mem, csa_addr + 60, &cycles);

    /* Return CSA to free list */
    store32(cpu, mem, csa_addr, FCX, &cycles);
    FCX = addr_to_link(csa_addr);

    PCXI = old_pcxi;

    return cycles;
}

/* ==========================================================================
 * 16-bit Instruction Execution
 * ========================================================================== */

static int exec_16bit(cpu_state_t *cpu, const decoded_insn_t *insn, mem_system_t *mem)
{
    int cycles = CYCLES_ALU;
    uint8_t opc = insn->opcode1;

    /* Debug: detect if 16-bit handler gets opcode 0x01 (should be 32-bit) */
    if (opc == 0x01 || (insn->pc >= 0x800055a0 && insn->pc <= 0x800055c0)) {
        fprintf(stderr, "[DBG] exec_16bit called: PC=0x%08X opc=0x%02X raw=0x%08X size=%d\n",
                insn->pc, opc, insn->raw, insn->size);
    }

    switch (opc) {
    /* ======== SR format ======== */
    case 0x00:  /* RET, DEBUG, NOP, and other SR instructions */
        switch (insn->opcode2) {
        case 0x00:  /* NOP (when d=0) or RET (when d=9) - decode based on full word */
            {
                /* Check for specific encodings */
                uint16_t word16 = insn->raw & 0xFFFF;
                if (word16 == 0x0000) {
                    /* NOP */
                    break;
                }
                /* 0x0090 = RET (d=9) */
                if ((word16 & 0x0F00) == 0x0900) {
                    /* RET - preserve D2/A2 return values */
                    cycles = csa_restore_lower_ex(cpu, mem, 1);
                    if (cycles < 0) {
                        return -1;  /* Error */
                    }
                    PC = A(11);  /* Return address */
                    return cycles;
                }
                /* Fall through to unknown */
                fprintf(stderr, "Unknown SR word 0x%04X at PC=0x%08X\n", word16, insn->pc);
                return -1;
            }

        case 0x01:  /* DEBUG (d=0) */
            cpu->state = CPU_STATE_DEBUG;
            return CYCLES_ALU;

        case 0x02:  /* RFE - Return from exception */
            cycles = csa_restore_upper(cpu, mem);
            if (cycles < 0) return -1;
            PC = A(11);
            return cycles;

        case 0x04:  /* RSLCX - Restore lower context */
            cycles = csa_restore_lower(cpu, mem);
            if (cycles < 0) return -1;
            break;

        case 0x05:  /* SVLCX - Save lower context */
            cycles = csa_save_lower(cpu, mem);
            if (cycles < 0) return -1;
            break;

        case 0x08:  /* NOP variant or JI/FRET etc. - treat as NOP for now */
            /* This might be interrupt vector table data, not code */
            /* Skip it as a NOP */
            break;

        case 0x09:  /* RET (standard encoding) - preserve D2/A2 return values */
            cycles = csa_restore_lower_ex(cpu, mem, 1);
            if (cycles < 0) {
                return -1;  /* Error */
            }
            PC = A(11);  /* Return address */
            return cycles;

        default:
            /* Unknown SR instruction */
            fprintf(stderr, "Unknown SR opcode2: 0x%02X at PC=0x%08X (word=0x%04X)\n",
                    insn->opcode2, insn->pc, (uint16_t)(insn->raw & 0xFFFF));
            return -1;
        }
        break;

    /* ======== SRR format - Register operations ======== */
    case 0x02:  /* MOV D[a], D[b] */
        if (insn->pc >= 0x800002b0 && insn->pc <= 0x800002c4) {
            printf("DEBUG: MOV D%d <- D%d (0x%08X) at PC=0x%08X\n",
                   insn->dst, insn->src2, D(insn->src2), insn->pc);
        }
        D(insn->dst) = D(insn->src2);
        break;

    case 0x42:  /* ADD D[a], D[b] */
        {
            int32_t a = D(insn->dst);
            int32_t b = D(insn->src2);
            int64_t result = (int64_t)a + (int64_t)b;
            D(insn->dst) = (uint32_t)result;
            update_flags_add(cpu, a, b, result);
            update_carry_add(cpu, (uint32_t)a, (uint32_t)b);
        }
        break;

    case 0xA2:  /* SUB D[a], D[b] */
        {
            int32_t a = D(insn->dst);
            int32_t b = D(insn->src2);
            int64_t result = (int64_t)a - (int64_t)b;
            D(insn->dst) = (uint32_t)result;
            update_flags_sub(cpu, a, b, result);
        }
        break;

    case 0xE2:  /* MUL D[a], D[b] */
        {
            int32_t a = D(insn->dst);
            int32_t b = D(insn->src2);
            D(insn->dst) = (uint32_t)(a * b);
            cycles = CYCLES_MUL;
        }
        break;

    case 0x26:  /* AND D[a], D[b] */
        D(insn->dst) = D(insn->dst) & D(insn->src2);
        break;

    case 0x66:  /* XOR D[a], D[b] */
        D(insn->dst) = D(insn->dst) ^ D(insn->src2);
        break;

    case 0xA6:  /* OR D[a], D[b] */
        D(insn->dst) = D(insn->dst) | D(insn->src2);
        break;

    case 0x40:  /* MOV.AA A[a], A[b] */
        if (insn->dst == 14) {
            fprintf(stderr, "[MOV.AA] PC=0x%08X A14 <- A%d (0x%08X), old_A14=0x%08X\n",
                    insn->pc, insn->src2, A(insn->src2), A(14));
        }
        A(insn->dst) = A(insn->src2);
        break;

    case 0x60:  /* MOV.A A[a], D[b] */
        A(insn->dst) = D(insn->src2);
        break;

    case 0x80:  /* MOV D[a], A[b] */
        if (insn->pc >= 0x800002b0 && insn->pc <= 0x800002c4) {
            printf("DEBUG: MOV.D D%d <- A%d (0x%08X) at PC=0x%08X\n",
                   insn->dst, insn->src2, A(insn->src2), insn->pc);
        }
        D(insn->dst) = A(insn->src2);
        break;

    case 0xC0:  /* SUB.A A[a], A[b] */
        A(insn->dst) = A(insn->dst) - A(insn->src2);
        break;

    case 0xE0:  /* ADD.A A[a], A[b] */
        A(insn->dst) = A(insn->dst) + A(insn->src2);
        break;

    /* ======== SRC format - Register + Constant ======== */
    case 0x82:  /* MOV D[a], const4 */
        D(insn->dst) = (uint32_t)insn->imm;
        break;

    case 0xC2:  /* ADD D[a], const4 */
        {
            int32_t a = D(insn->dst);
            int32_t b = insn->imm;
            int64_t result = (int64_t)a + (int64_t)b;
            D(insn->dst) = (uint32_t)result;
            update_flags_add(cpu, a, b, result);
        }
        break;

    case 0x06:  /* SH D[a], const4 */
        {
            int32_t shift = insn->imm;
            if (insn->pc >= 0x800002b0 && insn->pc <= 0x800002c4) {
                printf("DEBUG: SH D%d (0x%08X) by %d at PC=0x%08X\n",
                       insn->dst, D(insn->dst), shift, insn->pc);
            }
            if (shift >= 0) {
                D(insn->dst) = D(insn->dst) << shift;
            } else {
                D(insn->dst) = D(insn->dst) >> (-shift);
            }
            if (insn->pc >= 0x800002b0 && insn->pc <= 0x800002c4) {
                printf("DEBUG: SH result = 0x%08X\n", D(insn->dst));
            }
        }
        break;

    case 0x86:  /* SHA D[a], const4 */
        {
            int32_t shift = insn->imm;
            int32_t val = (int32_t)D(insn->dst);
            if (shift >= 0) {
                D(insn->dst) = (uint32_t)(val << shift);
            } else {
                D(insn->dst) = (uint32_t)(val >> (-shift));
            }
        }
        break;

    case 0x8A:  /* CADD D[a], D15, const4 */
        if (D(15) != 0) {
            D(insn->dst) = D(insn->dst) + insn->imm;
        }
        break;

    case 0xA0:  /* MOV.A A[a], const4 */
        A(insn->dst) = (uint32_t)insn->imm;
        break;
    case 0x20:  /* SUB.A A[a], const4 - Subtract const from address register */
        if (insn->pc >= 0x80006566 && insn->pc <= 0x80006596) {
            fprintf(stderr, "[TRACE] SUB.A: PC=0x%08X A%d=0x%08X - %d => 0x%08X\n",
                    insn->pc, insn->dst, A(insn->dst), insn->imm, A(insn->dst) - (uint32_t)insn->imm);
        }
        A(insn->dst) = A(insn->dst) - (uint32_t)insn->imm;
        break;
    case 0xB0:  /* ADD.A A[a], const4 - Add const to address register */
        A(insn->dst) = A(insn->dst) + (uint32_t)insn->imm;
        break;

    /* ======== SC format - D15 operations ======== */
    case 0x16:  /* AND D15, const8 */
        D(15) = D(15) & (uint32_t)(insn->imm & 0xFF);
        break;

    case 0x52:  /* SUB D15, const8 */
        D(15) = D(15) - (uint32_t)(insn->imm & 0xFF);
        break;

    case 0x96:  /* OR D15, const8 */
        D(15) = D(15) | (uint32_t)(insn->imm & 0xFF);
        break;

    case 0xD2:  /* MOV D15, const8 */
        D(15) = (uint32_t)(insn->imm & 0xFF);
        break;

    /* ======== SLR format - Load short (uses A[b] from instruction) ======== */
    case 0x54:  /* LD.W D[c], [A[b]] */
        {
            uint32_t addr = A(insn->src1);
            uint32_t val = load32(cpu, mem, addr, &cycles);
            /* Debug: trace ALL LD.W from RAM or at specific PCs */
            if (addr >= 0x70000000 && addr < 0x70100000) {
                fprintf(stderr, "[LD.W] PC=0x%08X: [0x%08X] => 0x%08X\n",
                        insn->pc, addr, val);
            }
            /* Debug: trace specific PCs in ekk_sched_select_next and ekk_sched_start */
            if (insn->pc >= 0x800047cc && insn->pc < 0x80004800) {
                fprintf(stderr, "[SCHED_SEL] PC=0x%08X A2=0x%08X D2=0x%08X\n",
                        insn->pc, A(2), D(2));
            }
            D(insn->dst) = val;
        }
        break;

    case 0xD4:  /* LD.A A[c], [A[b]] */
        A(insn->dst) = load32(cpu, mem, A(insn->src1), &cycles);
        break;

    /* ======== SLRO format - Load with offset ======== */
    case 0x48:  /* LD.W D[a], [A15]off4 */
        D(insn->dst) = load32(cpu, mem, A(15) + insn->imm, &cycles);
        break;

    case 0xC8:  /* LD.A A[a], [A15]off4 */
        A(insn->dst) = load32(cpu, mem, A(15) + insn->imm, &cycles);
        break;

    /* ======== SRO format - Load/Store with A[b] base ======== */
    case 0x4C:  /* LD.W D[a], [A[b]]off4 */
        D(insn->dst) = load32(cpu, mem, A(insn->src2) + insn->imm, &cycles);
        break;

    case 0xCC:  /* LD.A A[a], [A[b]]off4 */
        A(insn->dst) = load32(cpu, mem, A(insn->src2) + insn->imm, &cycles);
        break;

    case 0x6C:  /* ST.W [A[b]]off4, D[a] */
        store32(cpu, mem, A(insn->src2) + insn->imm, D(insn->src1), &cycles);
        break;

    case 0xEC:  /* ST.A [A[b]]off4, A[a] */
        store32(cpu, mem, A(insn->src2) + insn->imm, A(insn->src1), &cycles);
        break;

    /* ======== SSR format - Store short ======== */
    case 0x74:  /* ST.W [A[b]], D[a] */
        store32(cpu, mem, A(insn->src2), D(insn->src1), &cycles);
        break;

    case 0x24:  /* ST.B [A[b]+], D[a] (post-increment byte) */
        store8(cpu, mem, A(insn->src2), (uint8_t)D(insn->src1), &cycles);
        A(insn->src2) = A(insn->src2) + 1;  /* Post-increment by 1 byte */
        break;

    case 0x34:  /* ST.W [A[b]+], D[a] (post-increment word) */
        store32(cpu, mem, A(insn->src2), D(insn->src1), &cycles);
        A(insn->src2) = A(insn->src2) + 4;  /* Post-increment by 4 bytes */
        break;

    case 0x84:  /* LD.B [A[b]+], D[a] (post-increment byte) */
        D(insn->src1) = SEXT8(load8(cpu, mem, A(insn->src2), &cycles));
        A(insn->src2) = A(insn->src2) + 1;  /* Post-increment by 1 byte */
        break;

    case 0xC4:  /* LD.W [A[b]+], D[a] (post-increment word) */
        D(insn->src1) = load32(cpu, mem, A(insn->src2), &cycles);
        A(insn->src2) = A(insn->src2) + 4;  /* Post-increment by 4 bytes */
        break;

    case 0xF4:  /* ST.A [A[b]], A[a] */
        store32(cpu, mem, A(insn->src2), A(insn->src1), &cycles);
        break;

    /* ======== SSRO format - Store with offset ======== */
    case 0x68:  /* ST.W [A15]off4, D[a] */
        store32(cpu, mem, A(15) + insn->imm, D(insn->src1), &cycles);
        break;

    case 0xE8:  /* ST.A [A15]off4, A[a] */
        store32(cpu, mem, A(15) + insn->imm, A(insn->src1), &cycles);
        break;

    /* ======== SBR format - Branch with register ======== */
    case 0x6E:  /* JZ D[a], disp4 */
        if (D(insn->src1) == 0) {
            PC = insn->pc + insn->imm * 2;
            cycles = CYCLES_BRANCH;
        } else {
            PC = insn->pc + 2;
            cycles = CYCLES_BRANCH_NT;
        }
        return cycles;

    case 0xEE:  /* JNZ D[a], disp4 */
        if (D(insn->src1) != 0) {
            PC = insn->pc + insn->imm * 2;
            cycles = CYCLES_BRANCH;
        } else {
            PC = insn->pc + 2;
            cycles = CYCLES_BRANCH_NT;
        }
        return cycles;

    case 0xFC:  /* LOOP A[b], disp4 */
        A(insn->src1) = A(insn->src1) - 1;
        if (A(insn->src1) != 0) {
            PC = insn->pc + insn->imm * 2;
            cycles = 1;  /* Zero-overhead when taken */
        } else {
            PC = insn->pc + 2;
            cycles = CYCLES_BRANCH_NT;
        }
        return cycles;

    /* ======== SB format - Short branch ======== */
    case 0x3C:  /* J disp8 */
        PC = insn->pc + insn->imm * 2;
        return CYCLES_BRANCH;

    /* ======== SBC format - Conditional branch ======== */
    case 0x1E:  /* JEQ D15, const4, disp4 */
        if ((int32_t)D(15) == insn->imm) {
            PC = insn->pc + ((insn->raw >> 8) & 0xF) * 2;
            cycles = CYCLES_BRANCH;
        } else {
            PC = insn->pc + 2;
            cycles = CYCLES_BRANCH_NT;
        }
        return cycles;

    case 0x5E:  /* JNE D15, const4, disp4 */
        if ((int32_t)D(15) != insn->imm) {
            PC = insn->pc + ((insn->raw >> 8) & 0xF) * 2;
            cycles = CYCLES_BRANCH;
        } else {
            PC = insn->pc + 2;
            cycles = CYCLES_BRANCH_NT;
        }
        return cycles;

    /* ======== SR format - Special ======== */
    case 0xDC:  /* JI A[a] */
        PC = A(insn->src1) & 0xFFFFFFFE;  /* Clear LSB */
        return CYCLES_BRANCH;

    case 0x46:  /* NOT D[a] */
        D(insn->dst) = ~D(insn->dst);
        break;

    default:
        fprintf(stderr, "Unimplemented 16-bit opcode: 0x%02X\n", opc);
        return -1;
    }

    /* Default: advance PC by instruction size */
    PC = insn->pc + insn->size;
    return cycles;
}

/* ==========================================================================
 * 32-bit Instruction Execution
 * ========================================================================== */

static int exec_32bit(cpu_state_t *cpu, const decoded_insn_t *insn, mem_system_t *mem)
{
    int cycles = CYCLES_ALU;
    uint8_t opc = insn->opcode1;

    switch (opc) {
    /* ======== B format - Branches ======== */
    case 0x1D:  /* J disp24 */
        PC = insn->pc + insn->imm;
        return CYCLES_BRANCH;

    case 0x5D:  /* JL disp24 */
        A(11) = insn->pc + 4;  /* Save return address */
        PC = insn->pc + insn->imm;
        return CYCLES_BRANCH;

    case 0x6D:  /* CALL disp24 */
        {
            uint32_t target = insn->pc + insn->imm;
            fprintf(stderr, "[TRACE] CALL: PC=0x%08X target=0x%08X\n", insn->pc, target);
            A(11) = insn->pc + 4;  /* Return address */
            cycles = csa_save_lower(cpu, mem);
            if (cycles < 0) {
                return -1;  /* CSA depleted */
            }
            PC = target;
        }
        return cycles;

    case 0x2D:  /* CALLI A[a] - Call Indirect */
        A(11) = insn->pc + 4;  /* Return address */
        cycles = csa_save_lower(cpu, mem);
        if (cycles < 0) {
            return -1;  /* CSA depleted */
        }
        PC = A(insn->src1) & 0xFFFFFFFE;  /* Target from address register, word-aligned */
        return cycles;

    case 0x9D:  /* JA abs24 */
        PC = (insn->imm << 1) & 0xFFFFFFFE;
        return CYCLES_BRANCH;

    case 0xDD:  /* JLA abs24 */
        A(11) = insn->pc + 4;
        PC = (insn->imm << 1) & 0xFFFFFFFE;
        return CYCLES_BRANCH;

    /* ======== BO format - Load/Store base+offset ======== */
    case 0x19:  /* LD.W */
        D(insn->dst) = load32(cpu, mem, A(insn->src1) + insn->imm, &cycles);
        break;

    case 0x09:  /* LD.A */
        A(insn->dst) = load32(cpu, mem, A(insn->src1) + insn->imm, &cycles);
        break;

    case 0x29:  /* LD.B */
        D(insn->dst) = SEXT8(load8(cpu, mem, A(insn->src1) + insn->imm, &cycles));
        break;

    case 0x39:  /* LD.BU */
        D(insn->dst) = load8(cpu, mem, A(insn->src1) + insn->imm, &cycles);
        break;

    case 0xC9:  /* LD.H */
        D(insn->dst) = SEXT16(load16(cpu, mem, A(insn->src1) + insn->imm, &cycles));
        break;

    case 0xB9:  /* LD.HU */
        D(insn->dst) = load16(cpu, mem, A(insn->src1) + insn->imm, &cycles);
        break;

    case 0x49:  /* LD.D (64-bit load) */
        {
            uint32_t addr = A(insn->src1) + insn->imm;
            D(insn->dst) = load32(cpu, mem, addr, &cycles);
            D(insn->dst + 1) = load32(cpu, mem, addr + 4, &cycles);
        }
        break;

    case 0x59:  /* ST.W */
        {
            uint32_t addr = A(insn->src1) + insn->imm;
            uint32_t val = D(insn->src2);
            if (insn->pc == 0x800065A0) {
                fprintf(stderr, "[TRACE] ST.W-59: PC=0x%08X A%d=0x%08X off=%d addr=0x%08X <= D%d=0x%08X\n",
                        insn->pc, insn->src1, A(insn->src1), insn->imm, addr, insn->src2, val);
            }
            store32(cpu, mem, addr, val, &cycles);
        }
        break;

    case 0x89:  /* ST.D (64-bit store) */
        {uint32_t addr = A(insn->src1) + insn->imm; store32(cpu, mem, addr, D(insn->src2), &cycles); store32(cpu, mem, addr + 4, D(insn->src2 + 1), &cycles);}
        break;

    case 0xE9:  /* ST.B */
        {
            uint32_t addr = A(insn->src1) + insn->imm;
            uint8_t val = (uint8_t)D(insn->src2);
            if (addr >= 0x70039D70 && addr <= 0x70039D80) {
                fprintf(stderr, "[TRACE] ST.B-E9: PC=0x%08X A%d=0x%08X off=%d addr=0x%08X <= 0x%02X\n",
                        insn->pc, insn->src1, A(insn->src1), insn->imm, addr, val);
            }
            store8(cpu, mem, addr, val, &cycles);
        }
        break;

    case 0xF9:  /* ST.H */
        store16(cpu, mem, A(insn->src1) + insn->imm, (uint16_t)D(insn->src2), &cycles);
        break;

    case 0x79:  /* LD.B (signed byte load) */
        {
            uint32_t addr = A(insn->src1) + insn->imm;
            uint8_t val = load8(cpu, mem, addr, &cycles);
            fprintf(stderr, "[TRACE] LD.B: PC=0x%08X A%d=0x%08X off=%d addr=0x%08X => byte=0x%02X\n",
                    insn->pc, insn->src1, A(insn->src1), insn->imm, addr, val);
            D(insn->dst) = SEXT8(val);
        }
        break;

    /* ======== BOL format - LEA, LD.A, ST.A ======== */
    case 0x99:  /* LD.A A[c], [A[b]]off16 */
        {
            uint32_t addr = A(insn->src1) + insn->imm;
            uint32_t val = load32(cpu, mem, addr, &cycles);
            fprintf(stderr, "[TRACE] LD.A: PC=0x%08X A%d=0x%08X off=%d addr=0x%08X => A%d=0x%08X\n",
                    insn->pc, insn->src1, A(insn->src1), insn->imm, addr, insn->dst, val);
            A(insn->dst) = val;
        }
        break;

    case 0xB5:  /* ST.A [A[b]]off16, A[c] */
        {
            uint32_t addr = A(insn->src1) + insn->imm;
            fprintf(stderr, "[TRACE] ST.A: PC=0x%08X A%d=0x%08X off=%d addr=0x%08X <= A%d=0x%08X\n",
                    insn->pc, insn->src1, A(insn->src1), insn->imm, addr, insn->src2, A(insn->src2));
            store32(cpu, mem, addr, A(insn->src2), &cycles);
        }
        break;

    case 0xD9:  /* LEA A[c], [A[b]]off16 */
        {
            uint32_t result = A(insn->src1) + insn->imm;
            fprintf(stderr, "[TRACE] LEA: PC=0x%08X A%d=0x%08X + %d => A%d=0x%08X\n",
                    insn->pc, insn->src1, A(insn->src1), insn->imm, insn->dst, result);
            A(insn->dst) = result;
        }
        break;

    /* ======== BRR format - Conditional branches ======== */
    case 0x5F:  /* JEQ D[a], D[b], disp15 */
        if (D(insn->src1) == D(insn->src2)) {
            PC = insn->pc + insn->imm;
            cycles = CYCLES_BRANCH;
        } else {
            PC = insn->pc + 4;
            cycles = CYCLES_BRANCH_NT;
        }
        return cycles;

    case 0x7F:  /* JNE D[a], D[b], disp15 */
        if (D(insn->src1) != D(insn->src2)) {
            PC = insn->pc + insn->imm;
            cycles = CYCLES_BRANCH;
        } else {
            PC = insn->pc + 4;
            cycles = CYCLES_BRANCH_NT;
        }
        return cycles;

    case 0x7D:  /* JNE.A A[a], A[b], disp15 - Jump if address registers not equal */
        if (A(insn->src1) != A(insn->src2)) {
            PC = insn->pc + insn->imm;
            cycles = CYCLES_BRANCH;
        } else {
            PC = insn->pc + 4;
            cycles = CYCLES_BRANCH_NT;
        }
        return cycles;

    case 0xFD:  /* JEQ.A A[a], A[b], disp15 - Jump if address registers equal */
        if (A(insn->src1) == A(insn->src2)) {
            PC = insn->pc + insn->imm;
            cycles = CYCLES_BRANCH;
        } else {
            PC = insn->pc + 4;
            cycles = CYCLES_BRANCH_NT;
        }
        return cycles;

    case 0x3F:  /* JGE D[a], D[b], disp15 */
        if ((int32_t)D(insn->src1) >= (int32_t)D(insn->src2)) {
            PC = insn->pc + insn->imm;
            cycles = CYCLES_BRANCH;
        } else {
            PC = insn->pc + 4;
            cycles = CYCLES_BRANCH_NT;
        }
        return cycles;

    case 0xBF:  /* JLT D[a], D[b], disp15 (signed) */
        if ((int32_t)D(insn->src1) < (int32_t)D(insn->src2)) {
            PC = insn->pc + insn->imm;
            cycles = CYCLES_BRANCH;
        } else {
            PC = insn->pc + 4;
            cycles = CYCLES_BRANCH_NT;
        }
        return cycles;

    case 0x1F:  /* Unsigned branch variants */
        switch (insn->opcode2) {
        case 0x00:  /* JGE.U D[a], D[b], disp15 (unsigned) */
            if (D(insn->src1) >= D(insn->src2)) {
                PC = insn->pc + insn->imm;
                cycles = CYCLES_BRANCH;
            } else {
                PC = insn->pc + 4;
                cycles = CYCLES_BRANCH_NT;
            }
            return cycles;

        case 0x01:  /* JLT.U D[a], D[b], disp15 (unsigned) */
            if (D(insn->src1) < D(insn->src2)) {
                PC = insn->pc + insn->imm;
                cycles = CYCLES_BRANCH;
            } else {
                PC = insn->pc + 4;
                cycles = CYCLES_BRANCH_NT;
            }
            return cycles;

        default:
            fprintf(stderr, "Unimplemented 1F branch opcode2: 0x%02X\n", insn->opcode2);
            return -1;
        }

    case 0x9F:  /* Zero-comparison branches */
        switch (insn->opcode2) {
        case 0x00:  /* JGEZ D[a], disp15 - branch if >= 0 */
            if ((int32_t)D(insn->src1) >= 0) {
                PC = insn->pc + insn->imm;
                cycles = CYCLES_BRANCH;
            } else {
                PC = insn->pc + 4;
                cycles = CYCLES_BRANCH_NT;
            }
            return cycles;

        case 0x01:  /* JLTZ D[a], disp15 - branch if < 0 */
            if ((int32_t)D(insn->src1) < 0) {
                PC = insn->pc + insn->imm;
                cycles = CYCLES_BRANCH;
            } else {
                PC = insn->pc + 4;
                cycles = CYCLES_BRANCH_NT;
            }
            return cycles;

        default:
            fprintf(stderr, "Unimplemented 9F branch opcode2: 0x%02X\n", insn->opcode2);
            return -1;
        }

    /* ======== BRC format - Branch with constant ======== */
    /* NOTE: disp15 is bits [30:16] of instruction word. Cannot use insn->src2 (int8_t overflow) */
    case 0xDF:  /* JEQ / JLT.U D[a], const4, disp15 */
        {
            /* Extract disp15 from raw instruction, sign-extend and multiply by 2 */
            uint32_t raw_disp15 = (insn->raw >> 16) & 0x7FFF;
            int32_t disp = ((int32_t)(raw_disp15 << 17)) >> 16;
            
            if (insn->pc == 0x800065b6) {
                fprintf(stderr, "[TRACE] JEQ: PC=0x%08X raw=0x%08X D%d=%d imm=%d disp=%d src2=%d\n",
                        insn->pc, insn->raw, insn->src1, (int32_t)D(insn->src1), insn->imm, disp, insn->src2);
            }

            switch (insn->opcode2) {
            case 0:  /* JEQ D[a], const4, disp15 - signed equality */
                if ((int32_t)D(insn->src1) == insn->imm) {
                    PC = insn->pc + disp;
                    cycles = CYCLES_BRANCH;
                } else {
                    PC = insn->pc + 4;
                    cycles = CYCLES_BRANCH_NT;
                }
                return cycles;
            case 1:  /* JNE D[a], const4, disp15 - jump if NOT equal */
                if ((int32_t)D(insn->src1) != insn->imm) {
                    PC = insn->pc + disp;
                    cycles = CYCLES_BRANCH;
                } else {
                    PC = insn->pc + 4;
                    cycles = CYCLES_BRANCH_NT;
                }
                return cycles;
            default:
                fprintf(stderr, "Unimplemented DF branch opcode2: 0x%02X\n", insn->opcode2);
                return -1;
            }
        }

    case 0xFF:  /* JNE / JGE.U D[a], const4, disp15 */
        {
            /* Extract disp15 from raw instruction, sign-extend and multiply by 2 */
            uint32_t raw_disp15 = (insn->raw >> 16) & 0x7FFF;
            int32_t disp = ((int32_t)(raw_disp15 << 17)) >> 16;

            switch (insn->opcode2) {
            case 0:  /* JNE D[a], const4, disp15 - signed inequality */
                if ((int32_t)D(insn->src1) != insn->imm) {
                    PC = insn->pc + disp;
                    cycles = CYCLES_BRANCH;
                } else {
                    PC = insn->pc + 4;
                    cycles = CYCLES_BRANCH_NT;
                }
                return cycles;
            case 1:  /* JGE.U D[a], const4, disp15 - unsigned >= */
                {
                    uint32_t uconst = (uint32_t)(insn->imm & 0xF);
                    if (D(insn->src1) >= uconst) {
                        PC = insn->pc + disp;
                        cycles = CYCLES_BRANCH;
                    } else {
                        PC = insn->pc + 4;
                        cycles = CYCLES_BRANCH_NT;
                    }
                }
                return cycles;
            default:
                fprintf(stderr, "Unimplemented FF branch opcode2: 0x%02X\n", insn->opcode2);
                return -1;
            }
        }

    /* ======== RLC format - Long constant ======== */
    case 0x3B:  /* MOV D[c], const16 */
        D(insn->dst) = insn->imm;
        break;

    case 0xBB:  /* MOV.U D[c], const16 */
        D(insn->dst) = (uint32_t)(insn->imm & 0xFFFF);
        break;

    case 0x7B:  /* MOVH D[c], const16 */
        D(insn->dst) = insn->imm << 16;
        break;

    case 0x91:  /* MOVH.A A[c], const16 */
        A(insn->dst) = insn->imm << 16;
        break;

    case 0x1B:  /* ADDI D[c], D[a], const16 */
        {
            int32_t a = D(insn->src1);
            int32_t b = insn->imm;
            int64_t result = (int64_t)a + (int64_t)b;
            D(insn->dst) = (uint32_t)result;
            update_flags_add(cpu, a, b, result);
        }
        break;

    case 0x9B:  /* ADDIH D[c], D[a], const16 */
        D(insn->dst) = D(insn->src1) + (insn->imm << 16);
        break;

    case 0xCD:  /* MTCR const16, D[a] */
        {
            uint16_t csfr_addr = (uint16_t)insn->imm;
            switch (csfr_addr) {
            case CSFR_PSW:      PSW = D(insn->src1); break;
            case CSFR_PCXI:     PCXI = D(insn->src1); break;
            case CSFR_FCX:
                FCX = D(insn->src1);
                printf("DEBUG: MTCR FCX = 0x%08X at PC=0x%08X\n", FCX, insn->pc);
                break;
            case CSFR_LCX:      cpu->lcx = D(insn->src1); break;
            case CSFR_ICR:      ICR = D(insn->src1); break;
            case CSFR_ISP:      cpu->isp = D(insn->src1); break;
            case CSFR_BTV:      cpu->btv = D(insn->src1); break;
            case CSFR_BIV:      cpu->biv = D(insn->src1); break;
            case CSFR_SYSCON:   cpu->syscon = D(insn->src1); break;
            default: break;
            }
        }
        break;

    case 0x4D:  /* MFCR D[c], const16 */
        {
            uint16_t csfr_addr = (uint16_t)insn->imm;
            fprintf(stderr, "[MFCR] PC=0x%08X csfr=0x%04X imm=0x%08X dst=%d\n",
                    insn->pc, csfr_addr, insn->imm, insn->dst);
            switch (csfr_addr) {
            case CSFR_PC:       D(insn->dst) = PC; break;
            case CSFR_PSW:      D(insn->dst) = PSW; break;
            case CSFR_PCXI:     D(insn->dst) = PCXI; break;
            case CSFR_FCX:      D(insn->dst) = FCX; break;
            case CSFR_LCX:      D(insn->dst) = cpu->lcx; break;
            case CSFR_ICR:      D(insn->dst) = ICR; break;
            case CSFR_ISP:      D(insn->dst) = cpu->isp; break;
            case CSFR_BTV:      D(insn->dst) = cpu->btv; break;
            case CSFR_BIV:      D(insn->dst) = cpu->biv; break;
            case CSFR_SYSCON:   D(insn->dst) = cpu->syscon; break;
            case CSFR_CORE_ID:
                fprintf(stderr, "[CORE_ID] PC=0x%08X cpu->core_id=%u D%d<=%u\n",
                        insn->pc, cpu->core_id, insn->dst, cpu->core_id);
                D(insn->dst) = cpu->core_id;
                break;
            case CSFR_CCNT:     D(insn->dst) = (uint32_t)cpu->cycle_count; break;
            default:            D(insn->dst) = 0; break;
            }
        }
        break;

    /* ======== RC format - Arithmetic with constant ======== */
    case 0x8B:  /* ADD, compare variants */
        switch (insn->opcode2) {
        case 0x00:  /* ADD D[c], D[a], const9 */
            {
                int32_t a = D(insn->src1);
                int32_t b = insn->imm;
                int64_t result = (int64_t)a + (int64_t)b;
                D(insn->dst) = (uint32_t)result;
                update_flags_add(cpu, a, b, result);
            }
            break;
        case 0x02:  /* ADDS D[c], D[a], const9 (saturating) */
            {
                int64_t result = (int64_t)(int32_t)D(insn->src1) + (int64_t)insn->imm;
                if (result > INT32_MAX) result = INT32_MAX;
                if (result < INT32_MIN) result = INT32_MIN;
                D(insn->dst) = (uint32_t)(int32_t)result;
            }
            break;
        case 0x08:  /* RSUB D[c], D[a], const9 */
            {
                int32_t a = insn->imm;
                int32_t b = D(insn->src1);
                D(insn->dst) = (uint32_t)(a - b);
            }
            break;

        /* Compare with constant */
        case 0x10:  /* EQ D[c], D[a], const9 */
            D(insn->dst) = ((int32_t)D(insn->src1) == insn->imm) ? 1 : 0;
            break;
        case 0x11:  /* NE D[c], D[a], const9 */
            D(insn->dst) = ((int32_t)D(insn->src1) != insn->imm) ? 1 : 0;
            break;
        case 0x12:  /* LT D[c], D[a], const9 (signed) */
            D(insn->dst) = ((int32_t)D(insn->src1) < insn->imm) ? 1 : 0;
            break;
        case 0x13:  /* LT.U D[c], D[a], const9 (unsigned) */
            D(insn->dst) = (D(insn->src1) < (uint32_t)insn->imm) ? 1 : 0;
            break;
        case 0x14:  /* GE D[c], D[a], const9 (signed) */
            D(insn->dst) = ((int32_t)D(insn->src1) >= insn->imm) ? 1 : 0;
            break;
        case 0x15:  /* GE.U D[c], D[a], const9 (unsigned) */
            D(insn->dst) = (D(insn->src1) >= (uint32_t)insn->imm) ? 1 : 0;
            break;

        /* Accumulating comparisons */
        case 0x20:  /* AND.EQ D[c], D[a], const9 */
            /* D[c] = D[c] AND (D[a] == const9 ? 1 : 0) */
            D(insn->dst) = D(insn->dst) & (((int32_t)D(insn->src1) == insn->imm) ? 1 : 0);
            break;
        case 0x21:  /* AND.NE D[c], D[a], const9 */
            D(insn->dst) = D(insn->dst) & (((int32_t)D(insn->src1) != insn->imm) ? 1 : 0);
            break;
        case 0x24:  /* AND.GE D[c], D[a], const9 */
            D(insn->dst) = D(insn->dst) & (((int32_t)D(insn->src1) >= insn->imm) ? 1 : 0);
            break;
        case 0x25:  /* AND.GE.U D[c], D[a], const9 */
            D(insn->dst) = D(insn->dst) & ((D(insn->src1) >= (uint32_t)insn->imm) ? 1 : 0);
            break;
        case 0x22:  /* AND.LT D[c], D[a], const9 */
            D(insn->dst) = D(insn->dst) & (((int32_t)D(insn->src1) < insn->imm) ? 1 : 0);
            break;
        case 0x23:  /* AND.LT.U D[c], D[a], const9 */
            D(insn->dst) = D(insn->dst) & ((D(insn->src1) < (uint32_t)insn->imm) ? 1 : 0);
            break;

        /* OR accumulating comparisons */
        case 0x28:  /* OR.EQ D[c], D[a], const9 */
            D(insn->dst) = D(insn->dst) | (((int32_t)D(insn->src1) == insn->imm) ? 1 : 0);
            break;
        case 0x29:  /* OR.NE D[c], D[a], const9 */
            D(insn->dst) = D(insn->dst) | (((int32_t)D(insn->src1) != insn->imm) ? 1 : 0);
            break;
        case 0x2C:  /* OR.GE D[c], D[a], const9 */
            D(insn->dst) = D(insn->dst) | (((int32_t)D(insn->src1) >= insn->imm) ? 1 : 0);
            break;
        case 0x2D:  /* OR.GE.U D[c], D[a], const9 */
            D(insn->dst) = D(insn->dst) | ((D(insn->src1) >= (uint32_t)insn->imm) ? 1 : 0);
            break;
        case 0x2A:  /* OR.LT D[c], D[a], const9 */
            D(insn->dst) = D(insn->dst) | (((int32_t)D(insn->src1) < insn->imm) ? 1 : 0);
            break;
        case 0x2B:  /* OR.LT.U D[c], D[a], const9 */
            D(insn->dst) = D(insn->dst) | ((D(insn->src1) < (uint32_t)insn->imm) ? 1 : 0);
            break;

        default:
            fprintf(stderr, "Unimplemented RC opcode2: 0x%02X\n", insn->opcode2);
            return -1;
        }
        break;

    case 0x53:  /* MUL D[c], D[a], const9 */
        {
            int32_t a = (int32_t)D(insn->src1);
            int32_t b = insn->imm;
            D(insn->dst) = (uint32_t)(a * b);
            cycles = CYCLES_MUL;
        }
        break;

    case 0x8F:  /* Logic/Shift RC */
        switch (insn->opcode2) {
        case 0x00:  /* SH D[c], D[a], const9 */
            {
                int32_t shift = insn->imm;
                if (insn->pc >= 0x800002b0 && insn->pc <= 0x800002c4) {
                    printf("DEBUG: SH(RC) D%d <- D%d (0x%08X) by %d at PC=0x%08X\n",
                           insn->dst, insn->src1, D(insn->src1), shift, insn->pc);
                }
                if (shift >= 0 && shift < 32) {
                    D(insn->dst) = D(insn->src1) << shift;
                } else if (shift < 0 && shift > -32) {
                    D(insn->dst) = D(insn->src1) >> (-shift);
                } else {
                    D(insn->dst) = 0;
                }
                if (insn->pc >= 0x800002b0 && insn->pc <= 0x800002c4) {
                    printf("DEBUG: SH(RC) result = 0x%08X\n", D(insn->dst));
                }
            }
            break;
        case 0x01:  /* SHA D[c], D[a], const9 (arithmetic) */
            {
                int32_t shift = insn->imm;
                int32_t val = (int32_t)D(insn->src1);
                if (shift >= 0 && shift < 32) {
                    D(insn->dst) = (uint32_t)(val << shift);
                } else if (shift < 0 && shift > -32) {
                    D(insn->dst) = (uint32_t)(val >> (-shift));
                } else if (shift <= -32) {
                    D(insn->dst) = (val < 0) ? 0xFFFFFFFF : 0;
                } else {
                    D(insn->dst) = 0;
                }
            }
            break;
        case 0x08:  /* AND D[c], D[a], const9 */
            D(insn->dst) = D(insn->src1) & (uint32_t)(insn->imm & 0x1FF);
            break;
        case 0x09:  /* ANDN D[c], D[a], const9 */
            D(insn->dst) = D(insn->src1) & ~(uint32_t)(insn->imm & 0x1FF);
            break;
        case 0x0A:  /* OR D[c], D[a], const9 */
            D(insn->dst) = D(insn->src1) | (uint32_t)(insn->imm & 0x1FF);
            break;
        case 0x0B:  /* ORN D[c], D[a], const9 */
            D(insn->dst) = D(insn->src1) | ~(uint32_t)(insn->imm & 0x1FF);
            break;
        case 0x0C:  /* XOR D[c], D[a], const9 */
            D(insn->dst) = D(insn->src1) ^ (uint32_t)(insn->imm & 0x1FF);
            break;
        case 0x0D:  /* XNOR D[c], D[a], const9 */
            D(insn->dst) = ~(D(insn->src1) ^ (uint32_t)(insn->imm & 0x1FF));
            break;
        case 0x0E:  /* ANDN D[c], D[a], const9 (alternate encoding) */
            D(insn->dst) = D(insn->src1) & ~(uint32_t)(insn->imm & 0x1FF);
            break;
        default:
            fprintf(stderr, "Unimplemented 8F opcode2: 0x%02X\n", insn->opcode2);
            return -1;
        }
        break;

    case 0x0F:  /* Logic RR - register operations */
        switch (insn->opcode2) {
        case 0x0A:  /* OR D[c], D[a], D[b] */
            D(insn->dst) = D(insn->src1) | D(insn->src2);
            break;
        case 0x08:  /* AND D[c], D[a], D[b] */
            D(insn->dst) = D(insn->src1) & D(insn->src2);
            break;
        case 0x0E:  /* ANDN D[c], D[a], D[b] - D[c] = D[a] & ~D[b] */
            D(insn->dst) = D(insn->src1) & ~D(insn->src2);
            break;
        case 0x0C:  /* XOR D[c], D[a], D[b] */
            D(insn->dst) = D(insn->src1) ^ D(insn->src2);
            break;
        case 0x0F:  /* NAND D[c], D[a], D[b] */
            D(insn->dst) = ~(D(insn->src1) & D(insn->src2));
            break;
        case 0x0D:  /* NOR D[c], D[a], D[b] */
            D(insn->dst) = ~(D(insn->src1) | D(insn->src2));
            break;
        case 0x0B:  /* ORN D[c], D[a], D[b] - D[c] = D[a] | ~D[b] */
            D(insn->dst) = D(insn->src1) | ~D(insn->src2);
            break;
        case 0x09:  /* XNOR D[c], D[a], D[b] */
            D(insn->dst) = ~(D(insn->src1) ^ D(insn->src2));
            break;
        case 0x00:  /* SH D[c], D[a], D[b] - shift by register */
            {
                int32_t shift = (int32_t)D(insn->src2);
                if (shift >= 0) {
                    D(insn->dst) = (shift >= 32) ? 0 : (D(insn->src1) << shift);
                } else {
                    shift = -shift;
                    D(insn->dst) = (shift >= 32) ? 0 : (D(insn->src1) >> shift);
                }
            }
            break;
        case 0x01:  /* SHA D[c], D[a], D[b] - arithmetic shift by register */
            {
                int32_t shift = (int32_t)D(insn->src2);
                int32_t val = (int32_t)D(insn->src1);
                if (shift >= 0) {
                    D(insn->dst) = (shift >= 32) ? 0 : ((uint32_t)val << shift);
                } else {
                    shift = -shift;
                    D(insn->dst) = (shift >= 32) ? (val >> 31) : (val >> shift);
                }
            }
            break;
        default:
            fprintf(stderr, "Unimplemented 0F opcode2: 0x%02X\n", insn->opcode2);
            return -1;
        }
        break;

    /* ======== RR format - Register operations ======== */
    case 0x0B:  /* Arithmetic RR */
        switch (insn->opcode2) {
        case 0x00:  /* ADD D[c], D[a], D[b] */
            {
                int32_t a = D(insn->src1);
                int32_t b = D(insn->src2);
                int64_t result = (int64_t)a + (int64_t)b;
                D(insn->dst) = (uint32_t)result;
                update_flags_add(cpu, a, b, result);
                update_carry_add(cpu, (uint32_t)a, (uint32_t)b);
            }
            break;
        case 0x02:  /* ADDS D[c], D[a], D[b] */
            {
                int64_t result = (int64_t)(int32_t)D(insn->src1) +
                                (int64_t)(int32_t)D(insn->src2);
                if (result > INT32_MAX) result = INT32_MAX;
                if (result < INT32_MIN) result = INT32_MIN;
                D(insn->dst) = (uint32_t)(int32_t)result;
            }
            break;
        case 0x08:  /* SUB D[c], D[a], D[b] */
            {
                int32_t a = D(insn->src1);
                int32_t b = D(insn->src2);
                int64_t result = (int64_t)a - (int64_t)b;
                D(insn->dst) = (uint32_t)result;
                update_flags_sub(cpu, a, b, result);
            }
            break;
        case 0x0A:  /* SUBS D[c], D[a], D[b] */
            {
                int64_t result = (int64_t)(int32_t)D(insn->src1) -
                                (int64_t)(int32_t)D(insn->src2);
                if (result > INT32_MAX) result = INT32_MAX;
                if (result < INT32_MIN) result = INT32_MIN;
                D(insn->dst) = (uint32_t)(int32_t)result;
            }
            break;
        case 0x1F:  /* MOV D[c], D[b] */
            D(insn->dst) = D(insn->src2);
            break;
        case 0x1C:  /* ABS D[c], D[b] */
            {
                int32_t val = (int32_t)D(insn->src2);
                D(insn->dst) = (val < 0) ? -val : val;
            }
            break;
        case 0x18:  /* MIN D[c], D[a], D[b] */
            {
                int32_t a = (int32_t)D(insn->src1);
                int32_t b = (int32_t)D(insn->src2);
                D(insn->dst) = (a < b) ? (uint32_t)a : (uint32_t)b;
            }
            break;
        case 0x1A:  /* MAX D[c], D[a], D[b] */
            {
                int32_t a = (int32_t)D(insn->src1);
                int32_t b = (int32_t)D(insn->src2);
                D(insn->dst) = (a > b) ? (uint32_t)a : (uint32_t)b;
            }
            break;

        /* Compare instructions - result is 0 or 1 */
        case 0x10:  /* EQ D[c], D[a], D[b] */
            D(insn->dst) = (D(insn->src1) == D(insn->src2)) ? 1 : 0;
            break;
        case 0x11:  /* NE D[c], D[a], D[b] */
            D(insn->dst) = (D(insn->src1) != D(insn->src2)) ? 1 : 0;
            break;
        case 0x12:  /* LT D[c], D[a], D[b] (signed) */
            D(insn->dst) = ((int32_t)D(insn->src1) < (int32_t)D(insn->src2)) ? 1 : 0;
            break;
        case 0x13:  /* LT.U D[c], D[a], D[b] (unsigned) */
            D(insn->dst) = (D(insn->src1) < D(insn->src2)) ? 1 : 0;
            break;
        case 0x14:  /* GE D[c], D[a], D[b] (signed) */
            D(insn->dst) = ((int32_t)D(insn->src1) >= (int32_t)D(insn->src2)) ? 1 : 0;
            break;
        case 0x15:  /* GE.U D[c], D[a], D[b] (unsigned) */
            D(insn->dst) = (D(insn->src1) >= D(insn->src2)) ? 1 : 0;
            break;
        case 0x16:  /* LE D[c], D[a], D[b] (signed) - a <= b */
            D(insn->dst) = ((int32_t)D(insn->src1) <= (int32_t)D(insn->src2)) ? 1 : 0;
            break;
        case 0x17:  /* GT D[c], D[a], D[b] (signed) - a > b */
            D(insn->dst) = ((int32_t)D(insn->src1) > (int32_t)D(insn->src2)) ? 1 : 0;
            break;

        /* Logic instructions */
        case 0x28:  /* AND D[c], D[a], D[b] */
            D(insn->dst) = D(insn->src1) & D(insn->src2);
            break;
        case 0x2E:  /* ANDN D[c], D[a], D[b] */
            D(insn->dst) = D(insn->src1) & ~D(insn->src2);
            break;
        case 0x2A:  /* OR D[c], D[a], D[b] */
            D(insn->dst) = D(insn->src1) | D(insn->src2);
            break;
        case 0x2F:  /* ORN D[c], D[a], D[b] */
            D(insn->dst) = D(insn->src1) | ~D(insn->src2);
            break;
        case 0x2C:  /* XOR D[c], D[a], D[b] */
            D(insn->dst) = D(insn->src1) ^ D(insn->src2);
            break;
        case 0x2D:  /* XNOR D[c], D[a], D[b] */
            D(insn->dst) = ~(D(insn->src1) ^ D(insn->src2));
            break;
        case 0x26:  /* NAND D[c], D[a], D[b] */
            D(insn->dst) = ~(D(insn->src1) & D(insn->src2));
            break;
        case 0x27:  /* NOR D[c], D[a], D[b] */
            D(insn->dst) = ~(D(insn->src1) | D(insn->src2));
            break;

        default:
            /* Handle more RR variants */
            fprintf(stderr, "Unimplemented RR opcode2: 0x%02X\n", insn->opcode2);
            return -1;
        }
        break;

    case 0x01:  /* Address register operations */
        /* Debug: trace opcode 0x01 execution */
        if (insn->pc >= 0x800055a0 && insn->pc <= 0x800055c0) {
            fprintf(stderr, "[DBG] Exec opcode=0x01 opcode2=0x%02X at PC=0x%08X raw=0x%08X\n",
                    insn->opcode2, insn->pc, insn->raw);
            fprintf(stderr, "      dst=%d src1=%d src2=%d\n", insn->dst, insn->src1, insn->src2);
        }
        switch (insn->opcode2) {
        case 0x60:  /* ADDSC.A A[c], A[b], D[a], n - scaled addition */
            {
                /* ADDSC.A: A[c] = A[b] + (D[a] << n) */
                uint32_t scale = (insn->raw >> 16) & 0xF;  /* bits 19:16 = scale factor n */
                if (insn->pc >= 0x800055a0 && insn->pc <= 0x800055c0) {
                    fprintf(stderr, "      ADDSC.A: A[%d] = A[%d](0x%08X) + (D[%d](0x%08X) << %u)\n",
                            insn->dst, insn->src2, A(insn->src2), insn->src1, D(insn->src1), scale);
                }
                A(insn->dst) = A(insn->src2) + (D(insn->src1) << scale);
            }
            break;
        case 0x61:  /* ADDSC.AT A[c], A[b], D[a] - address table scaled addition */
            {
                /* ADDSC.AT: A[c] = A[b] + (D[a] << 2) - always scale by 4 (word ptr) */
                A(insn->dst) = A(insn->src2) + (D(insn->src1) << 2);
            }
            break;
        case 0x63:  /* MOV.A A[c], D[b] */
            A(insn->dst) = D(insn->src2);
            break;
        case 0x00:  /* ADD.A A[c], A[a], A[b] */
            A(insn->dst) = A(insn->src1) + A(insn->src2);
            break;
        case 0x02:  /* SUB.A A[c], A[a], A[b] */
            A(insn->dst) = A(insn->src1) - A(insn->src2);
            break;
        case 0x40:  /* MOV.AA A[c], A[b] */
            A(insn->dst) = A(insn->src2);
            break;
        default:
            fprintf(stderr, "Unimplemented 01 opcode2: 0x%02X\n", insn->opcode2);
            return -1;
        }
        break;

    case 0x4B:  /* DIV, DVINIT, DVSTEP, DVADJ, MOV D[c], A[b] */
        switch (insn->opcode2) {
        case 0x20:  /* DVINIT D[c], D[a], D[b] - Initialize signed division */
            {
                /* Setup 64-bit dividend from D[a], divisor in D[b] */
                /* Result in D[c+1]:D[c] - D[c+1] = quotient, D[c] = remainder */
                int64_t dividend = SEXT32(D(insn->src1));
                int32_t divisor = (int32_t)D(insn->src2);

                if (divisor == 0) {
                    /* Division by zero - undefined behavior, set trap */
                    D(insn->dst) = 0;
                    D(insn->dst + 1) = 0;
                    PSW_SET_V(true);
                    PSW_SET_SV(true);
                } else {
                    /* Initialize division state */
                    /* D[c] = sign-extended dividend (low 32 bits) */
                    /* D[c+1] = dividend (for iteration) */
                    D(insn->dst) = D(insn->src1);
                    D(insn->dst + 1) = (dividend < 0) ? -1 : 0;
                }
                cycles = 2;
            }
            break;

        case 0x24:  /* DVSTEP D[c], D[a], D[b] - Signed division step */
            {
                /* One step of iterative division */
                /* For emulator simplicity, perform full division on last step */
                int64_t dividend = ((int64_t)(int32_t)D(insn->dst + 1) << 32) | D(insn->dst);
                int32_t divisor = (int32_t)D(insn->src2);

                if (divisor != 0) {
                    int32_t quotient = (int32_t)(dividend / divisor);
                    int32_t remainder = (int32_t)(dividend % divisor);
                    D(insn->dst) = remainder;
                    D(insn->dst + 1) = quotient;
                }
                cycles = 1;
            }
            break;

        case 0x2C:  /* DVADJ D[c], D[a], D[b] - Division adjustment */
            {
                /* Final adjustment: correct remainder sign */
                int32_t quotient = (int32_t)D(insn->dst + 1);
                int32_t remainder = (int32_t)D(insn->dst);
                int32_t divisor = (int32_t)D(insn->src2);

                /* Adjust if remainder has wrong sign */
                if (divisor != 0 && remainder != 0) {
                    if ((divisor > 0 && remainder < 0) || (divisor < 0 && remainder > 0)) {
                        remainder += divisor;
                        quotient -= (divisor > 0) ? 1 : -1;
                    }
                }
                D(insn->dst) = remainder;
                D(insn->dst + 1) = quotient;
                cycles = 1;
            }
            break;

        case 0x0F:  /* MOV D[c], A[b] - move from address to data register */
            D(insn->dst) = A(insn->src2);
            break;

        default:
            fprintf(stderr, "Unimplemented 4B opcode2: 0x%02X\n", insn->opcode2);
            return -1;
        }
        break;

    case 0x6B:  /* DVINIT.U, DVSTEP.U - Unsigned division */
        switch (insn->opcode2) {
        case 0x20:  /* DVINIT.U D[c], D[a], D[b] - Initialize unsigned division */
            {
                /* Setup 64-bit dividend from D[a], divisor in D[b] */
                uint32_t dividend = D(insn->src1);
                uint32_t divisor = D(insn->src2);

                if (divisor == 0) {
                    D(insn->dst) = 0;
                    D(insn->dst + 1) = 0;
                    PSW_SET_V(true);
                    PSW_SET_SV(true);
                } else {
                    D(insn->dst) = dividend;
                    D(insn->dst + 1) = 0;
                }
                cycles = 2;
            }
            break;

        case 0x24:  /* DVSTEP.U D[c], D[a], D[b] - Unsigned division step */
            {
                uint64_t dividend = ((uint64_t)D(insn->dst + 1) << 32) | D(insn->dst);
                uint32_t divisor = D(insn->src2);

                if (divisor != 0) {
                    uint32_t quotient = (uint32_t)(dividend / divisor);
                    uint32_t remainder = (uint32_t)(dividend % divisor);
                    D(insn->dst) = remainder;
                    D(insn->dst + 1) = quotient;
                }
                cycles = 1;
            }
            break;

        default:
            fprintf(stderr, "Unimplemented 6B opcode2: 0x%02X\n", insn->opcode2);
            return -1;
        }
        break;

    case 0x73:  /* MUL variants */
        switch (insn->opcode2) {
        case 0x06:  /* MUL.U E[c], D[a], D[b] - unsigned 32x32 -> 64 */
            {
                uint64_t result = (uint64_t)D(insn->src1) * (uint64_t)D(insn->src2);
                D(insn->dst) = (uint32_t)(result & 0xFFFFFFFF);          /* Low word */
                D(insn->dst + 1) = (uint32_t)((result >> 32) & 0xFFFFFFFF);  /* High word */
                cycles = CYCLES_MUL;
            }
            break;
        case 0x0A:  /* MUL D[c], D[a], D[b] */
            D(insn->dst) = (uint32_t)((int32_t)D(insn->src1) * (int32_t)D(insn->src2));
            cycles = CYCLES_MUL;
            break;
        default:
            fprintf(stderr, "Unimplemented MUL opcode2: 0x%02X\n", insn->opcode2);
            return -1;
        }
        break;

    /* ======== RRR format - Three-operand ======== */
    case 0x03:  /* MADD D[c], D[d], D[a], D[b] */
        D(insn->dst) = D(insn->src3) + (int32_t)D(insn->src1) * (int32_t)D(insn->src2);
        cycles = CYCLES_MUL;
        break;

    case 0x23:  /* MSUB D[c], D[d], D[a], D[b] */
        D(insn->dst) = D(insn->src3) - (int32_t)D(insn->src1) * (int32_t)D(insn->src2);
        cycles = CYCLES_MUL;
        break;

    case 0x43:  /* SEL D[c], D[d], D[a], D[b] */
        D(insn->dst) = (D(insn->src3) != 0) ? D(insn->src1) : D(insn->src2);
        break;

    /* ======== RCR format - MADD/MSUB with constant ======== */
    case 0x13:  /* MADD D[c], D[d], D[a], const9 */
        D(insn->dst) = D(insn->src2) + (int32_t)D(insn->src1) * insn->imm;
        cycles = CYCLES_MUL;
        break;

    case 0x33:  /* MSUB D[c], D[d], D[a], const9 */
        D(insn->dst) = D(insn->src2) - (int32_t)D(insn->src1) * insn->imm;
        cycles = CYCLES_MUL;
        break;

    /* ======== RRPW format - Bit field operations with pos/width from register ======== */
    case 0x37:  /* EXTR, EXTR.U, INSERT with pos/width from D[b] register */
        {
            /* For opcode 0x37, pos/width come from D[b] register, NOT from instruction bits!
             * D[b][4:0] = pos, D[b][9:5] = width
             * The instruction bits (insn->pos, insn->width) are NOT used for this opcode.
             */
            uint32_t db_val = D(insn->src2);
            uint32_t pos = db_val & 0x1F;            /* D[b][4:0] */
            uint32_t width = (db_val >> 5) & 0x1F;   /* D[b][9:5] */

            if (insn->pc >= 0x800002b0 && insn->pc <= 0x800002c4) {
                printf("DEBUG: 0x37 opcode at PC=0x%08X: opcode2=0x%02X, D%d=0x%08X -> pos=%u, width=%u\n",
                       insn->pc, insn->opcode2, insn->src2, db_val, pos, width);
            }

            switch (insn->opcode2) {
            case 0x00:  /* EXTR D[c], D[a], D[b] - signed extract */
                {
                    if (width == 0) {
                        D(insn->dst) = 0;
                    } else {
                        uint32_t mask = (width >= 32) ? 0xFFFFFFFF : ((1U << width) - 1);
                        uint32_t val = (D(insn->src1) >> pos) & mask;
                        /* Sign extend */
                        if (width < 32 && (val & (1U << (width - 1)))) {
                            val |= ~mask;
                        }
                        D(insn->dst) = val;
                    }
                    if (insn->pc >= 0x800002b0 && insn->pc <= 0x800002c4) {
                        printf("DEBUG: EXTR result = 0x%08X\n", D(insn->dst));
                    }
                }
                break;

            case 0x01:  /* EXTR.U D[c], D[a], D[b] - unsigned extract */
                {
                    if (insn->pc >= 0x800002b0 && insn->pc <= 0x800002c4) {
                        printf("DEBUG: EXTR.U D%d <- D%d (0x%08X), pos=%u, width=%u at PC=0x%08X\n",
                               insn->dst, insn->src1, D(insn->src1), pos, width, insn->pc);
                    }
                    if (width == 0) {
                        D(insn->dst) = 0;
                    } else {
                        uint32_t mask = (width >= 32) ? 0xFFFFFFFF : ((1U << width) - 1);
                        D(insn->dst) = (D(insn->src1) >> pos) & mask;
                    }
                    if (insn->pc >= 0x800002b0 && insn->pc <= 0x800002c4) {
                        printf("DEBUG: EXTR.U result = 0x%08X\n", D(insn->dst));
                    }
                }
                break;

            case 0x02:  /* INSERT D[c], D[a], D[b] - insert bits using pos/width from D[b+1] */
                {
                    /* For INSERT with opcode 0x37, the insert value comes from D[s2],
                     * but pos/width come from D[s2+1] - this is the E[b] extended register format */
                    uint32_t db1_val = D(insn->src2 + 1);  /* D[b+1] for pos/width */
                    pos = db1_val & 0x1F;
                    width = (db1_val >> 5) & 0x1F;

                    if (insn->pc >= 0x800002b0 && insn->pc <= 0x800002c4) {
                        printf("DEBUG: INSERT D%d <- D%d (0x%08X), D%d (0x%08X), pos=%u, width=%u at PC=0x%08X\n",
                               insn->dst, insn->src1, D(insn->src1), insn->src2, D(insn->src2), pos, width, insn->pc);
                    }
                    if (width == 0) {
                        D(insn->dst) = D(insn->src1);
                    } else {
                        uint32_t mask = (width >= 32) ? 0xFFFFFFFF : ((1U << width) - 1);
                        uint32_t insert_val = (D(insn->src2) & mask) << pos;
                        uint32_t clear_mask = ~(mask << pos);
                        D(insn->dst) = (D(insn->src1) & clear_mask) | insert_val;
                    }
                    if (insn->pc >= 0x800002b0 && insn->pc <= 0x800002c4) {
                        printf("DEBUG: INSERT result = 0x%08X\n", D(insn->dst));
                    }
                }
                break;

            case 0x03:  /* IMASK E[c], D[b], pos, width - Create insert mask */
                {
                    if (width == 0) {
                        D(insn->dst) = 0;
                        D(insn->dst + 1) = 0;
                    } else {
                        uint32_t mask = (width >= 32) ? 0xFFFFFFFF : ((1U << width) - 1);
                        D(insn->dst) = (D(insn->src2) & mask) << pos;  /* Data shifted */
                        D(insn->dst + 1) = mask << pos;                 /* Mask */
                    }
                }
                break;

            default:
                fprintf(stderr, "Unimplemented 37 opcode2: 0x%02X\n", insn->opcode2);
                return -1;
            }
        }
        break;

    case 0xB7:  /* EXTR, EXTR.U, INSERT with constant pos/width */
        {
            uint32_t pos = insn->pos;
            uint32_t width = insn->width;

            switch (insn->opcode2) {
            case 0x00:  /* EXTR D[c], D[a], pos, width - signed extract */
                {
                    if (width == 0) {
                        D(insn->dst) = 0;
                    } else {
                        uint32_t mask = (width >= 32) ? 0xFFFFFFFF : ((1U << width) - 1);
                        uint32_t val = (D(insn->src1) >> pos) & mask;
                        if (width < 32 && (val & (1U << (width - 1)))) {
                            val |= ~mask;
                        }
                        D(insn->dst) = val;
                    }
                }
                break;

            case 0x01:  /* EXTR.U D[c], D[a], pos, width - unsigned extract */
                {
                    if (width == 0) {
                        D(insn->dst) = 0;
                    } else {
                        uint32_t mask = (width >= 32) ? 0xFFFFFFFF : ((1U << width) - 1);
                        D(insn->dst) = (D(insn->src1) >> pos) & mask;
                    }
                }
                break;

            case 0x02:  /* INSERT D[c], D[a], const4, pos, width */
                {
                    if (width == 0) {
                        D(insn->dst) = D(insn->src1);
                    } else {
                        uint32_t mask = (width >= 32) ? 0xFFFFFFFF : ((1U << width) - 1);
                        uint32_t insert_val = ((uint32_t)insn->imm & mask) << pos;
                        uint32_t clear_mask = ~(mask << pos);
                        D(insn->dst) = (D(insn->src1) & clear_mask) | insert_val;
                    }
                }
                break;

            case 0x03:  /* IMASK E[c], const4, pos, width */
                {
                    if (width == 0) {
                        D(insn->dst) = 0;
                        D(insn->dst + 1) = 0;
                    } else {
                        uint32_t mask = (width >= 32) ? 0xFFFFFFFF : ((1U << width) - 1);
                        D(insn->dst) = ((uint32_t)insn->imm & mask) << pos;
                        D(insn->dst + 1) = mask << pos;
                    }
                }
                break;

            default:
                fprintf(stderr, "Unimplemented B7 opcode2: 0x%02X\n", insn->opcode2);
                return -1;
            }
        }
        break;

    /* ======== Bit count operations ======== */
    case 0x17:  /* CLZ, CLS, etc. */
        switch (insn->opcode2) {
        case 0x1B:  /* CLZ D[c], D[b] - Count leading zeros */
            {
                uint32_t val = D(insn->src2);
                uint32_t count = 0;
                if (val == 0) {
                    count = 32;
                } else {
                    while ((val & 0x80000000) == 0) {
                        count++;
                        val <<= 1;
                    }
                }
                D(insn->dst) = count;
            }
            break;

        case 0x1C:  /* CLS D[c], D[b] - Count leading signs */
            {
                int32_t val = (int32_t)D(insn->src2);
                uint32_t count = 0;
                if (val == 0 || val == -1) {
                    count = 31;
                } else {
                    int sign = (val < 0) ? 1 : 0;
                    while (((val >> 31) & 1) == sign && count < 31) {
                        count++;
                        val <<= 1;
                    }
                }
                D(insn->dst) = count;
            }
            break;

        case 0x20:  /* CLO D[c], D[b] - Count leading ones */
            {
                uint32_t val = D(insn->src2);
                uint32_t count = 0;
                while ((val & 0x80000000) != 0 && count < 32) {
                    count++;
                    val <<= 1;
                }
                D(insn->dst) = count;
            }
            break;

        default:
            fprintf(stderr, "Unimplemented 17 opcode2: 0x%02X\n", insn->opcode2);
            return -1;
        }
        break;

    /* ======== SYS format - System instructions ======== */
    case 0x0D:
        switch (insn->opcode2) {
        case 0x00:  /* NOP */
            break;

        case 0x06:  /* RET - preserve D2/A2 return values */
            cycles = csa_restore_lower_ex(cpu, mem, 1);
            if (cycles < 0) return -1;
            PC = A(11);
            return cycles;

        case 0x07:  /* RFE */
            cycles = csa_restore_upper(cpu, mem);
            if (cycles < 0) return -1;
            PC = A(11);
            /* Restore interrupt enable from saved PCXI.PIE */
            return cycles;

        case 0x08:  /* SVLCX */
            cycles = csa_save_lower(cpu, mem);
            if (cycles < 0) return -1;
            break;

        case 0x09:  /* RSLCX */
            cycles = csa_restore_lower(cpu, mem);
            if (cycles < 0) return -1;
            break;

        case 0x0C:  /* ENABLE */
            ICR |= ICR_IE;
            break;

        case 0x0D:  /* DISABLE */
            ICR &= ~ICR_IE;
            break;

        case 0x12:  /* DSYNC */
            /* Data synchronization barrier - NOP in emulator */
            break;

        case 0x13:  /* ISYNC */
            /* Instruction synchronization barrier - NOP in emulator */
            break;

        case 0x14:  /* BISR */
            {
                /* Save upper context */
                cycles = csa_save_upper(cpu, mem);
                if (cycles < 0) return -1;
                /* Set new interrupt level */
                uint8_t new_level = insn->dst & 0xFF;
                ICR = (ICR & ~ICR_CCPN_MASK) | (new_level & ICR_CCPN_MASK);
                ICR |= ICR_IE;  /* Enable interrupts */
            }
            break;

        case 0x17:  /* WAIT */
            cpu->state = CPU_STATE_IDLE;
            break;

        case 0x24:  /* SYSCALL */
            /* Trigger system call trap */
            return tricore_trap(cpu, mem, 6, insn->imm & 0xFF);

        default:
            fprintf(stderr, "Unimplemented SYS opcode2: 0x%02X\n", insn->opcode2);
            return -1;
        }
        break;

    case 0xC5:  /* LEA A[c], off18 (ABS format) */
        {
            uint32_t c = (insn->raw >> 8) & 0xF;
            uint32_t off18_5_0   = (insn->raw >> 16) & 0x3F;
            uint32_t off18_9_6   = (insn->raw >> 28) & 0xF;
            uint32_t off18_13_10 = (insn->raw >> 22) & 0xF;
            uint32_t off18_17_14 = (insn->raw >> 12) & 0xF;
            uint32_t off18 = off18_5_0 | (off18_9_6 << 6) | (off18_13_10 << 10) | (off18_17_14 << 14);
            uint32_t ea = (off18_17_14 << 28) | (off18 & 0x3FFF);
            A(c) = ea;
        }
        break;

    default:
        fprintf(stderr, "Unimplemented 32-bit opcode: 0x%02X at PC=0x%08X\n", opc, insn->pc);
        return -1;
    }

    /* Default: advance PC */
    PC = insn->pc + insn->size;
    return cycles;
}

/* ==========================================================================
 * Main Executor Entry Points
 * ========================================================================== */

/**
 * @brief Execute one decoded instruction
 */
int tricore_exec(cpu_state_t *cpu, const decoded_insn_t *insn, mem_system_t *mem)
{
    if (insn->size == 2) {
        return exec_16bit(cpu, insn, mem);
    } else {
        return exec_32bit(cpu, insn, mem);
    }
}

/**
 * @brief Fetch, decode, and execute one instruction
 */
int tricore_step(cpu_state_t *cpu, mem_system_t *mem)
{
    int cycles = 0;

    /* Fetch instruction word (always fetch 4 bytes, may only use 2) */
    uint32_t word = mem_read32(mem, cpu->pc);
    cycles += mem_get_cycles(mem, cpu->pc, false);

    /* Decode */
    decoded_insn_t insn;
    int size = tricore_decode(cpu->pc, word, &insn);
    if (size <= 0) {
        fprintf(stderr, "Decode error at PC=0x%08X word=0x%08X (opc1=0x%02X)\n",
                cpu->pc, word, word & 0xFF);
        return -1;
    }

    /* Execute */
    int exec_cycles = tricore_exec(cpu, &insn, mem);
    if (exec_cycles < 0) {
        return exec_cycles;  /* Error */
    }

    cycles += exec_cycles;
    cpu->insn_count++;

    return cycles;
}

/**
 * @brief Handle pending interrupt
 */
int tricore_handle_interrupt(cpu_state_t *cpu, mem_system_t *mem)
{
    if (!cpu->irq_pending || !(ICR & ICR_IE)) {
        return 0;  /* No interrupt or disabled */
    }

    /* Check priority */
    uint8_t current_level = ICR & ICR_CCPN_MASK;
    if (cpu->pending_priority <= current_level) {
        return 0;  /* Lower or equal priority */
    }

    /* Accept interrupt */
    int cycles = csa_save_upper(cpu, mem);
    if (cycles < 0) return -1;

    /* Update ICR */
    ICR = (ICR & ~ICR_CCPN_MASK) | (cpu->pending_priority & ICR_CCPN_MASK);

    /* Jump to interrupt vector */
    uint32_t vector = cpu->biv + (cpu->pending_priority * 8);
    cpu->pc = vector;

    /* Clear pending */
    cpu->irq_pending = false;

    return cycles + CYCLES_TRAP;
}

/**
 * @brief Trigger trap
 */
int tricore_trap(cpu_state_t *cpu, mem_system_t *mem, uint8_t trap_class, uint8_t trap_id)
{
    int cycles = csa_save_upper(cpu, mem);
    if (cycles < 0) return -1;

    /* Store trap info in D15 */
    D(15) = (trap_class << 8) | trap_id;

    /* Jump to trap vector */
    uint32_t vector = cpu->btv + (trap_class * 8);
    cpu->pc = vector;

    /* Disable interrupts */
    ICR &= ~ICR_IE;

    return cycles + CYCLES_TRAP;
}
