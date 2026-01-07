/**
 * @file tricore_cpu.c
 * @brief TriCore TC1.6.2P CPU Controller
 *
 * Implements the main CPU execution loop with:
 * - Fetch-decode-execute cycle
 * - Trap/exception handling
 * - Interrupt delivery
 * - Breakpoint support
 * - Multi-core coordination
 */

#include "emu_types.h"
#include "tricore_decode.h"
#include "tricore_exec.h"
#include <stdio.h>
#include <string.h>

/* ==========================================================================
 * External Functions
 * ========================================================================== */

/* From tricore_regs.c */
extern void cpu_init(cpu_state_t *cpu, uint32_t core_id);
extern uint32_t cpu_read_csfr(cpu_state_t *cpu, uint16_t addr);
extern void cpu_write_csfr(cpu_state_t *cpu, uint16_t addr, uint32_t value);

/* From tricore_exec.c */
extern int tricore_step(cpu_state_t *cpu, mem_system_t *mem);
extern int tricore_handle_interrupt(cpu_state_t *cpu, mem_system_t *mem);
extern int tricore_trap(cpu_state_t *cpu, mem_system_t *mem, uint8_t trap_class, uint8_t trap_id);
extern int csa_save_upper(cpu_state_t *cpu, mem_system_t *mem);

/* ==========================================================================
 * Trap Classes (TC1.6.2P)
 * ========================================================================== */

#define TRAP_CLASS_MMU      0   /* MMU trap */
#define TRAP_CLASS_PROT     1   /* Protection trap */
#define TRAP_CLASS_INSN     2   /* Instruction error */
#define TRAP_CLASS_CONTEXT  3   /* Context management error */
#define TRAP_CLASS_BUS      4   /* System bus error */
#define TRAP_CLASS_ASSERT   5   /* Assertion trap */
#define TRAP_CLASS_SYSCALL  6   /* System call */
#define TRAP_CLASS_NMI      7   /* Non-maskable interrupt */

/* Trap IDs for common traps */
#define TIN_VAF     0   /* Virtual Address Fill (MMU) */
#define TIN_VAP     1   /* Virtual Address Protection */
#define TIN_IOPC    1   /* Illegal Opcode */
#define TIN_UOPC    2   /* Unimplemented Opcode */
#define TIN_OPD     3   /* Invalid Operand */
#define TIN_ALN     4   /* Alignment Error */
#define TIN_MEM     5   /* Memory access violation */
#define TIN_FCU     1   /* Free Context List Underflow */
#define TIN_CDO     2   /* Call Depth Overflow */
#define TIN_CDU     3   /* Call Depth Underflow */
#define TIN_PSE     1   /* Program Fetch Sync Error */
#define TIN_DSE     2   /* Data Access Sync Error */
#define TIN_DAE     3   /* Data Access Async Error */
#define TIN_SYS     0   /* System call */

/* ==========================================================================
 * CPU Controller State
 * ========================================================================== */

/**
 * @brief CPU controller context
 */
typedef struct {
    cpu_state_t    *cpu;
    mem_system_t   *mem;

    /* Execution control */
    bool            running;
    bool            single_step;
    uint64_t        max_cycles;
    uint64_t        max_insns;

    /* Breakpoints */
    uint32_t        breakpoints[32];
    uint32_t        num_breakpoints;
    bool            bp_hit;
    uint32_t        bp_addr;

    /* Trap state */
    bool            trap_pending;
    uint8_t         trap_class;
    uint8_t         trap_id;

    /* Statistics */
    uint64_t        cycles_executed;
    uint64_t        insns_executed;
    uint64_t        traps_taken;
    uint64_t        interrupts_taken;

    /* Callbacks */
    void           *callback_ctx;
    void          (*on_breakpoint)(void *ctx, uint32_t addr);
    void          (*on_trap)(void *ctx, uint8_t trap_class, uint8_t trap_id);
    void          (*on_halt)(void *ctx);

} cpu_controller_t;

/* ==========================================================================
 * CPU State Management
 * ========================================================================== */

/**
 * @brief Reset CPU to initial state
 */
void cpu_reset(cpu_state_t *cpu)
{
    uint32_t core_id = cpu->core_id;
    cpu_init(cpu, core_id);

    /* TC397 reset vector */
    cpu->pc = 0x80000020;

    /* Supervisor mode, interrupts disabled */
    cpu->psw = (PSW_IO_SUPERVISOR << PSW_IO_SHIFT);
    cpu->icr = 0;  /* IE=0, CCPN=0 */

    /* Default trap/interrupt vectors */
    cpu->btv = 0x80000100;  /* Base Trap Vector */
    cpu->biv = 0x80000200;  /* Base Interrupt Vector */

    cpu->state = CPU_STATE_HALTED;
}

/**
 * @brief Halt CPU execution
 */
void cpu_halt(cpu_state_t *cpu)
{
    cpu->state = CPU_STATE_HALTED;
}

/**
 * @brief Check if CPU is running
 */
bool cpu_is_running(cpu_state_t *cpu)
{
    return cpu->state == CPU_STATE_RUNNING;
}

/**
 * @brief Get CPU state string
 */
const char* cpu_state_str(cpu_state_t *cpu)
{
    switch (cpu->state) {
    case CPU_STATE_RUNNING: return "RUNNING";
    case CPU_STATE_HALTED:  return "HALTED";
    case CPU_STATE_DEBUG:   return "DEBUG";
    case CPU_STATE_IDLE:    return "IDLE";
    default:                return "UNKNOWN";
    }
}

/* ==========================================================================
 * Trap Handling
 * ========================================================================== */

/**
 * @brief Deliver trap to CPU
 */
static int cpu_deliver_trap(cpu_state_t *cpu, mem_system_t *mem,
                            uint8_t trap_class, uint8_t trap_id)
{
    /* Save upper context */
    int cycles = csa_save_upper(cpu, mem);
    if (cycles < 0) {
        /* CSA depleted - this is a nested trap, fatal */
        cpu->state = CPU_STATE_HALTED;
        return -1;
    }

    /* Store trap info in D[15] */
    cpu->d[15] = ((uint32_t)trap_class << 8) | trap_id;

    /* Calculate trap vector address */
    uint32_t vector = cpu->btv + (trap_class * 0x20);  /* 32 bytes per trap class */

    /* Disable interrupts during trap handling */
    cpu->icr &= ~ICR_IE;

    /* Jump to trap handler */
    cpu->pc = vector;

    return cycles + 4;  /* CSA cycles + trap entry */
}

/**
 * @brief Handle illegal opcode trap
 */
static int cpu_trap_illegal_opcode(cpu_state_t *cpu, mem_system_t *mem)
{
    return cpu_deliver_trap(cpu, mem, TRAP_CLASS_INSN, TIN_IOPC);
}

/**
 * @brief Handle unimplemented opcode trap
 */
static int cpu_trap_unimplemented(cpu_state_t *cpu, mem_system_t *mem)
{
    return cpu_deliver_trap(cpu, mem, TRAP_CLASS_INSN, TIN_UOPC);
}

/**
 * @brief Handle alignment error trap
 */
static int cpu_trap_alignment(cpu_state_t *cpu, mem_system_t *mem)
{
    return cpu_deliver_trap(cpu, mem, TRAP_CLASS_INSN, TIN_ALN);
}

/**
 * @brief Handle context underflow trap
 */
static int cpu_trap_context_underflow(cpu_state_t *cpu, mem_system_t *mem)
{
    return cpu_deliver_trap(cpu, mem, TRAP_CLASS_CONTEXT, TIN_FCU);
}

/* ==========================================================================
 * Breakpoint Management
 * ========================================================================== */

/**
 * @brief Add a breakpoint
 */
int cpu_add_breakpoint(cpu_controller_t *ctrl, uint32_t addr)
{
    if (ctrl->num_breakpoints >= 32) {
        return -1;  /* Table full */
    }

    /* Check if already exists */
    for (uint32_t i = 0; i < ctrl->num_breakpoints; i++) {
        if (ctrl->breakpoints[i] == addr) {
            return 0;  /* Already set */
        }
    }

    ctrl->breakpoints[ctrl->num_breakpoints++] = addr;
    return 0;
}

/**
 * @brief Remove a breakpoint
 */
int cpu_remove_breakpoint(cpu_controller_t *ctrl, uint32_t addr)
{
    for (uint32_t i = 0; i < ctrl->num_breakpoints; i++) {
        if (ctrl->breakpoints[i] == addr) {
            /* Shift remaining entries */
            for (uint32_t j = i; j < ctrl->num_breakpoints - 1; j++) {
                ctrl->breakpoints[j] = ctrl->breakpoints[j + 1];
            }
            ctrl->num_breakpoints--;
            return 0;
        }
    }
    return -1;  /* Not found */
}

/**
 * @brief Check if PC is at a breakpoint
 */
static bool cpu_check_breakpoint(cpu_controller_t *ctrl, uint32_t pc)
{
    for (uint32_t i = 0; i < ctrl->num_breakpoints; i++) {
        if (ctrl->breakpoints[i] == pc) {
            ctrl->bp_hit = true;
            ctrl->bp_addr = pc;
            return true;
        }
    }
    return false;
}

/* ==========================================================================
 * Main Execution Loop
 * ========================================================================== */

/**
 * @brief Execute one instruction with full trap handling
 *
 * @param cpu   CPU state
 * @param mem   Memory system
 * @return      Cycle count, or negative on fatal error
 */
int cpu_execute_one(cpu_state_t *cpu, mem_system_t *mem)
{
    /* Check CPU state */
    if (cpu->state != CPU_STATE_RUNNING) {
        return 0;
    }

    /* Fetch and decode instruction */
    uint32_t pc = cpu->pc;
    uint32_t word = mem_read32(mem, pc);

    decoded_insn_t insn;
    int size = tricore_decode(pc, word, &insn);

    if (size <= 0) {
        /* Decode error - illegal opcode */
        fprintf(stderr, "CPU[%u]: Illegal opcode at PC=0x%08X (word=0x%08X)\n",
                cpu->core_id, pc, word);
        return cpu_trap_illegal_opcode(cpu, mem);
    }

    /* Execute instruction */
    int cycles = tricore_step(cpu, mem);

    if (cycles < 0) {
        /* Execution error - unimplemented opcode */
        fprintf(stderr, "CPU[%u]: Unimplemented instruction at PC=0x%08X\n",
                cpu->core_id, pc);
        return cpu_trap_unimplemented(cpu, mem);
    }

    /* Update statistics */
    cpu->cycle_count += cycles;
    cpu->insn_count++;

    /* Handle pending interrupts */
    if (cpu->irq_pending && (cpu->icr & ICR_IE)) {
        int irq_cycles = tricore_handle_interrupt(cpu, mem);
        if (irq_cycles > 0) {
            cycles += irq_cycles;
        }
    }

    return cycles;
}

/**
 * @brief Run CPU for specified cycles or until stop condition
 *
 * @param cpu           CPU state
 * @param mem           Memory system
 * @param max_cycles    Maximum cycles to run (0 = unlimited)
 * @return              Stop reason: 0=cycles, 1=halt, 2=debug, 3=error
 */
int cpu_run(cpu_state_t *cpu, void *mem, uint64_t max_cycles)
{
    mem_system_t *m = (mem_system_t *)mem;
    uint64_t start_cycles = cpu->cycle_count;

    cpu->state = CPU_STATE_RUNNING;

    while (cpu->state == CPU_STATE_RUNNING) {
        /* Check cycle limit */
        if (max_cycles > 0 && (cpu->cycle_count - start_cycles) >= max_cycles) {
            return 0;  /* Cycle limit reached */
        }

        /* Execute one instruction */
        int cycles = cpu_execute_one(cpu, m);

        if (cycles < 0) {
            return 3;  /* Fatal error */
        }

        /* Check for state changes */
        if (cpu->state == CPU_STATE_HALTED) {
            return 1;  /* Halted */
        }

        if (cpu->state == CPU_STATE_DEBUG) {
            return 2;  /* Debug break */
        }
    }

    return 0;
}

/**
 * @brief Run CPU with controller (full featured)
 */
int cpu_run_controlled(cpu_controller_t *ctrl)
{
    cpu_state_t *cpu = ctrl->cpu;
    mem_system_t *mem = ctrl->mem;

    ctrl->running = true;
    ctrl->bp_hit = false;
    ctrl->cycles_executed = 0;
    ctrl->insns_executed = 0;

    cpu->state = CPU_STATE_RUNNING;

    while (ctrl->running && cpu->state == CPU_STATE_RUNNING) {
        /* Check cycle limit */
        if (ctrl->max_cycles > 0 && ctrl->cycles_executed >= ctrl->max_cycles) {
            break;
        }

        /* Check instruction limit */
        if (ctrl->max_insns > 0 && ctrl->insns_executed >= ctrl->max_insns) {
            break;
        }

        /* Check breakpoints before execution */
        if (cpu_check_breakpoint(ctrl, cpu->pc)) {
            cpu->state = CPU_STATE_DEBUG;
            if (ctrl->on_breakpoint) {
                ctrl->on_breakpoint(ctrl->callback_ctx, cpu->pc);
            }
            break;
        }

        /* Execute one instruction */
        int cycles = cpu_execute_one(cpu, mem);

        if (cycles < 0) {
            ctrl->trap_pending = true;
            ctrl->traps_taken++;
            if (ctrl->on_trap) {
                ctrl->on_trap(ctrl->callback_ctx, ctrl->trap_class, ctrl->trap_id);
            }
        } else {
            ctrl->cycles_executed += cycles;
            ctrl->insns_executed++;
        }

        /* Single step mode */
        if (ctrl->single_step) {
            break;
        }

        /* Check for state changes */
        if (cpu->state == CPU_STATE_HALTED) {
            if (ctrl->on_halt) {
                ctrl->on_halt(ctrl->callback_ctx);
            }
            break;
        }
    }

    ctrl->running = false;
    return (cpu->state == CPU_STATE_RUNNING) ? 0 : 1;
}

/* ==========================================================================
 * Multi-core Support
 * ========================================================================== */

/**
 * @brief Step all cores in round-robin fashion
 *
 * @param cores     Array of CPU states
 * @param num_cores Number of cores
 * @param mem       Memory system
 * @return          Total cycles executed across all cores
 */
int cpu_step_all_cores(cpu_state_t *cores, uint32_t num_cores, mem_system_t *mem)
{
    int total_cycles = 0;

    /* External function to set memory context per core */
    extern void mem_set_core(mem_system_t *mem, uint32_t core_id);

    for (uint32_t i = 0; i < num_cores; i++) {
        if (cores[i].state == CPU_STATE_RUNNING) {
            mem_set_core(mem, i);
            int cycles = cpu_execute_one(&cores[i], mem);
            if (cycles > 0) {
                total_cycles += cycles;
            }
        }
    }

    return total_cycles;
}

/**
 * @brief Check if any core is running
 */
bool cpu_any_running(cpu_state_t *cores, uint32_t num_cores)
{
    for (uint32_t i = 0; i < num_cores; i++) {
        if (cores[i].state == CPU_STATE_RUNNING) {
            return true;
        }
    }
    return false;
}

/**
 * @brief Halt all cores
 */
void cpu_halt_all(cpu_state_t *cores, uint32_t num_cores)
{
    for (uint32_t i = 0; i < num_cores; i++) {
        if (cores[i].state == CPU_STATE_RUNNING) {
            cores[i].state = CPU_STATE_DEBUG;
        }
    }
}

/**
 * @brief Resume all halted cores
 */
void cpu_resume_all(cpu_state_t *cores, uint32_t num_cores)
{
    for (uint32_t i = 0; i < num_cores; i++) {
        if (cores[i].state == CPU_STATE_DEBUG ||
            cores[i].state == CPU_STATE_HALTED) {
            cores[i].state = CPU_STATE_RUNNING;
        }
    }
}

/* ==========================================================================
 * Controller Lifecycle
 * ========================================================================== */

/**
 * @brief Initialize CPU controller
 */
void cpu_controller_init(cpu_controller_t *ctrl, cpu_state_t *cpu, mem_system_t *mem)
{
    memset(ctrl, 0, sizeof(*ctrl));
    ctrl->cpu = cpu;
    ctrl->mem = mem;
}

/**
 * @brief Set execution limits
 */
void cpu_controller_set_limits(cpu_controller_t *ctrl, uint64_t max_cycles, uint64_t max_insns)
{
    ctrl->max_cycles = max_cycles;
    ctrl->max_insns = max_insns;
}

/**
 * @brief Set single-step mode
 */
void cpu_controller_set_single_step(cpu_controller_t *ctrl, bool enabled)
{
    ctrl->single_step = enabled;
}

/**
 * @brief Stop controller
 */
void cpu_controller_stop(cpu_controller_t *ctrl)
{
    ctrl->running = false;
}

/* ==========================================================================
 * Debug Support
 * ========================================================================== */

/**
 * @brief Print CPU state summary
 */
void cpu_print_state(cpu_state_t *cpu)
{
    printf("=== CPU Core %u State ===\n", cpu->core_id);
    printf("  State:  %s\n", cpu_state_str(cpu));
    printf("  PC:     0x%08X\n", cpu->pc);
    printf("  PSW:    0x%08X (IO=%u, IE=%u)\n",
           cpu->psw,
           (cpu->psw >> PSW_IO_SHIFT) & 3,
           (cpu->icr & ICR_IE) ? 1 : 0);
    printf("  ICR:    0x%08X (CCPN=%u)\n",
           cpu->icr, cpu->icr & ICR_CCPN_MASK);
    printf("  PCXI:   0x%08X\n", cpu->pcxi);
    printf("  FCX:    0x%08X\n", cpu->fcx);
    printf("  Insns:  %llu\n", (unsigned long long)cpu->insn_count);
    printf("  Cycles: %llu\n", (unsigned long long)cpu->cycle_count);
}

/**
 * @brief Print register dump
 */
void cpu_print_registers(cpu_state_t *cpu)
{
    printf("=== Registers (Core %u) ===\n", cpu->core_id);
    printf("  D0-D3:   %08X %08X %08X %08X\n",
           cpu->d[0], cpu->d[1], cpu->d[2], cpu->d[3]);
    printf("  D4-D7:   %08X %08X %08X %08X\n",
           cpu->d[4], cpu->d[5], cpu->d[6], cpu->d[7]);
    printf("  D8-D11:  %08X %08X %08X %08X\n",
           cpu->d[8], cpu->d[9], cpu->d[10], cpu->d[11]);
    printf("  D12-D15: %08X %08X %08X %08X\n",
           cpu->d[12], cpu->d[13], cpu->d[14], cpu->d[15]);
    printf("  A0-A3:   %08X %08X %08X %08X\n",
           cpu->a[0], cpu->a[1], cpu->a[2], cpu->a[3]);
    printf("  A4-A7:   %08X %08X %08X %08X\n",
           cpu->a[4], cpu->a[5], cpu->a[6], cpu->a[7]);
    printf("  A8-A11:  %08X %08X %08X %08X\n",
           cpu->a[8], cpu->a[9], cpu->a[10], cpu->a[11]);
    printf("  A12-A15: %08X %08X %08X %08X\n",
           cpu->a[12], cpu->a[13], cpu->a[14], cpu->a[15]);
}
