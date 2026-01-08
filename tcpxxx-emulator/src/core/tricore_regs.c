/**
 * @file tricore_regs.c
 * @brief TriCore TC1.6.2P Register Operations (Stub)
 *
 * TODO: Implement CSFR read/write and register initialization
 */

#include "emu_types.h"

void cpu_init(cpu_state_t *cpu, uint32_t core_id)
{
    /* Clear all registers */
    for (int i = 0; i < NUM_DATA_REGS; i++) {
        cpu->d[i] = 0;
    }
    for (int i = 0; i < NUM_ADDR_REGS; i++) {
        cpu->a[i] = 0;
    }

    /* Initialize CSFRs */
    cpu->pc = PFLASH_BASE;  /* Start at flash base */
    cpu->psw = PSW_IO_SUPERVISOR << PSW_IO_SHIFT;  /* Supervisor mode */
    cpu->pcxi = 0;
    cpu->fcx = 0;
    cpu->lcx = 0;
    cpu->icr = 0;
    cpu->isp = 0;
    cpu->btv = 0;
    cpu->biv = 0;
    cpu->syscon = 0;

    cpu->cycle_count = 0;
    cpu->insn_count = 0;
    cpu->core_id = core_id;
    cpu->state = CPU_STATE_HALTED;
    cpu->irq_pending = false;
    cpu->a14_shadow_depth = 0;  /* Initialize A14 shadow stack */
}

uint32_t cpu_read_csfr(cpu_state_t *cpu, uint16_t addr)
{
    switch (addr) {
    case CSFR_PC:       return cpu->pc;
    case CSFR_PSW:      return cpu->psw;
    case CSFR_PCXI:     return cpu->pcxi;
    case CSFR_FCX:      return cpu->fcx;
    case CSFR_LCX:      return cpu->lcx;
    case CSFR_ICR:      return cpu->icr;
    case CSFR_ISP:      return cpu->isp;
    case CSFR_BTV:      return cpu->btv;
    case CSFR_BIV:      return cpu->biv;
    case CSFR_SYSCON:   return cpu->syscon;
    case CSFR_CORE_ID:  return cpu->core_id;
    case CSFR_CCNT:     return (uint32_t)cpu->cycle_count;
    default:            return 0;
    }
}

void cpu_write_csfr(cpu_state_t *cpu, uint16_t addr, uint32_t value)
{
    switch (addr) {
    case CSFR_PSW:      cpu->psw = value; break;
    case CSFR_PCXI:     cpu->pcxi = value; break;
    case CSFR_FCX:      cpu->fcx = value; break;
    case CSFR_LCX:      cpu->lcx = value; break;
    case CSFR_ICR:      cpu->icr = value; break;
    case CSFR_ISP:      cpu->isp = value; break;
    case CSFR_BTV:      cpu->btv = value; break;
    case CSFR_BIV:      cpu->biv = value; break;
    case CSFR_SYSCON:   cpu->syscon = value; break;
    default: break;
    }
}
