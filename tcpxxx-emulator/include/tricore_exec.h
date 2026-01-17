/**
 * @file tricore_exec.h
 * @brief TriCore TC1.6.2P Instruction Executor Interface
 *
 * Executes decoded TriCore instructions and updates CPU state.
 */

#ifndef TRICORE_EXEC_H
#define TRICORE_EXEC_H

#include "emu_types.h"
#include "tricore_decode.h"

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Memory Access Interface
 * ========================================================================== */

/**
 * @brief Memory system opaque type
 */
typedef struct mem_system mem_system_t;

/**
 * @brief Memory read functions
 */
uint8_t  mem_read8(mem_system_t *mem, uint32_t addr);
uint16_t mem_read16(mem_system_t *mem, uint32_t addr);
uint32_t mem_read32(mem_system_t *mem, uint32_t addr);
uint64_t mem_read64(mem_system_t *mem, uint32_t addr);

/**
 * @brief Memory write functions
 */
void mem_write8(mem_system_t *mem, uint32_t addr, uint8_t value);
void mem_write16(mem_system_t *mem, uint32_t addr, uint16_t value);
void mem_write32(mem_system_t *mem, uint32_t addr, uint32_t value);
void mem_write64(mem_system_t *mem, uint32_t addr, uint64_t value);

/**
 * @brief Get memory access cycles
 */
uint8_t mem_get_cycles(mem_system_t *mem, uint32_t addr, bool is_write);

/* ==========================================================================
 * Executor Interface
 * ========================================================================== */

/**
 * @brief Execute one decoded instruction
 *
 * @param cpu   CPU state (updated in place)
 * @param insn  Decoded instruction
 * @param mem   Memory system
 * @return      Cycle count for this instruction (including memory access)
 *              Returns negative value on error/trap
 */
int tricore_exec(cpu_state_t *cpu, const decoded_insn_t *insn, mem_system_t *mem);

/**
 * @brief Fetch, decode, and execute one instruction
 *
 * @param cpu   CPU state
 * @param mem   Memory system
 * @return      Cycle count, or negative on error
 */
int tricore_step(cpu_state_t *cpu, mem_system_t *mem);

/**
 * @brief Handle pending interrupt
 *
 * @param cpu   CPU state
 * @param mem   Memory system
 * @return      Cycle count for interrupt entry
 */
int tricore_handle_interrupt(cpu_state_t *cpu, mem_system_t *mem);

/**
 * @brief Trigger trap
 *
 * @param cpu       CPU state
 * @param mem       Memory system
 * @param trap_class Trap class (0-7)
 * @param trap_id   Trap identification number
 * @return          Cycle count for trap entry
 */
int tricore_trap(cpu_state_t *cpu, mem_system_t *mem, uint8_t trap_class, uint8_t trap_id);

/* ==========================================================================
 * PSW Flag Helpers
 * ========================================================================== */

/**
 * @brief Update PSW overflow flags after arithmetic
 */
void psw_update_overflow(cpu_state_t *cpu, int64_t result, bool is_signed);

/**
 * @brief Update PSW carry flag
 */
void psw_update_carry(cpu_state_t *cpu, uint64_t result);

/**
 * @brief Check condition for conditional instructions
 */
bool check_condition(cpu_state_t *cpu, uint8_t cond);

/* ==========================================================================
 * CSA Operations
 * ========================================================================== */

/**
 * @brief Save lower context (for CALL)
 */
int csa_save_lower(cpu_state_t *cpu, mem_system_t *mem);

/**
 * @brief Restore lower context (for RET)
 */
int csa_restore_lower(cpu_state_t *cpu, mem_system_t *mem);

/**
 * @brief Save upper context (for interrupt/trap)
 */
int csa_save_upper(cpu_state_t *cpu, mem_system_t *mem);

/**
 * @brief Restore upper context (for RFE)
 */
int csa_restore_upper(cpu_state_t *cpu, mem_system_t *mem);

#ifdef __cplusplus
}
#endif

#endif /* TRICORE_EXEC_H */
