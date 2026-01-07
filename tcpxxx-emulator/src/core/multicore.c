/**
 * @file multicore.c
 * @brief TC397XP Multi-core Orchestration Implementation
 *
 * Provides 6-core execution with round-robin stepping.
 */

#include "multicore.h"
#include "tricore_exec.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* External functions */
extern void cpu_init(cpu_state_t *cpu, uint32_t core_id);
extern void mem_set_core(mem_system_t *mem, uint32_t core_id);
extern uint32_t mem_read32(mem_system_t *mem, uint32_t addr);
extern void mem_write32(mem_system_t *mem, uint32_t addr, uint32_t value);
extern int tricore_handle_interrupt(cpu_state_t *cpu, mem_system_t *mem);

/* TC397XP reset vector */
#define TC397_RESET_VECTOR  0x80000020

/* ==========================================================================
 * Multi-core System Lifecycle
 * ========================================================================== */

multicore_system_t* multicore_create(mem_system_t *mem, uint32_t num_cores)
{
    if (!mem || num_cores == 0 || num_cores > TC397XP_NUM_CORES) {
        return NULL;
    }

    multicore_system_t *mc = calloc(1, sizeof(multicore_system_t));
    if (!mc) {
        return NULL;
    }

    mc->mem = mem;
    mc->num_cores = num_cores;
    mc->sync_interval = 100;  /* Sync every 100 cycles */
    mc->lockstep_enabled = false;  /* Disabled by default */

    /* Initialize all cores */
    for (uint32_t i = 0; i < TC397XP_NUM_CORES; i++) {
        cpu_init(&mc->cores[i], i);
        mc->run_state[i] = CORE_OFFLINE;
        mc->ipi_pending[i] = false;
        mc->ipi_priority[i] = 0;
    }

    /* Core 0 starts at reset vector, halted */
    mc->cores[0].pc = TC397_RESET_VECTOR;
    mc->run_state[0] = CORE_HALTED;
    mc->active_cores = 1;  /* Only core 0 active initially */

    return mc;
}

void multicore_destroy(multicore_system_t *mc)
{
    if (mc) {
        free(mc);
    }
}

void multicore_reset(multicore_system_t *mc)
{
    if (!mc) return;

    /* Reset all cores */
    for (uint32_t i = 0; i < TC397XP_NUM_CORES; i++) {
        cpu_init(&mc->cores[i], i);
        mc->run_state[i] = CORE_OFFLINE;
        mc->ipi_pending[i] = false;
        mc->ipi_priority[i] = 0;
    }

    /* Core 0 is halted at reset vector */
    mc->cores[0].pc = TC397_RESET_VECTOR;
    mc->run_state[0] = CORE_HALTED;
    mc->active_cores = 1;
    mc->started_cores = 0;
    mc->global_cycle = 0;
}

/* ==========================================================================
 * Core Control
 * ========================================================================== */

int multicore_start_core(multicore_system_t *mc, uint32_t core_id, uint32_t pc)
{
    if (!mc || core_id >= mc->num_cores) {
        return -1;
    }

    cpu_state_t *core = &mc->cores[core_id];
    core->pc = pc;
    core->state = CPU_STATE_RUNNING;
    mc->run_state[core_id] = CORE_RUNNING;
    mc->active_cores |= (1 << core_id);
    mc->started_cores |= (1 << core_id);

    return 0;
}

int multicore_stop_core(multicore_system_t *mc, uint32_t core_id)
{
    if (!mc || core_id >= mc->num_cores) {
        return -1;
    }

    mc->cores[core_id].state = CPU_STATE_HALTED;
    mc->run_state[core_id] = CORE_HALTED;

    return 0;
}

bool multicore_any_running(multicore_system_t *mc)
{
    if (!mc) return false;

    for (uint32_t i = 0; i < mc->num_cores; i++) {
        if (mc->run_state[i] == CORE_RUNNING) {
            return true;
        }
    }
    return false;
}

cpu_state_t* multicore_get_core(multicore_system_t *mc, uint32_t core_id)
{
    if (!mc || core_id >= TC397XP_NUM_CORES) {
        return NULL;
    }
    return &mc->cores[core_id];
}

/* ==========================================================================
 * Execution
 * ========================================================================== */

int multicore_step_core(multicore_system_t *mc, uint32_t core_id)
{
    if (!mc || core_id >= mc->num_cores) {
        return -1;
    }

    if (mc->run_state[core_id] != CORE_RUNNING) {
        return 0;  /* Not running, no cycles */
    }

    cpu_state_t *core = &mc->cores[core_id];

    /* Set memory context to this core */
    mem_set_core(mc->mem, core_id);

    /* Execute one instruction */
    int cycles = tricore_step(core, mc->mem);

    if (cycles < 0) {
        mc->run_state[core_id] = CORE_HALTED;
        core->state = CPU_STATE_HALTED;
        return cycles;
    }

    /* Update cycle count */
    core->cycle_count += cycles;

    /* Check for interrupts */
    tricore_handle_interrupt(core, mc->mem);

    /* Update run state based on CPU state */
    switch (core->state) {
        case CPU_STATE_RUNNING:
            mc->run_state[core_id] = CORE_RUNNING;
            break;
        case CPU_STATE_HALTED:
            mc->run_state[core_id] = CORE_HALTED;
            break;
        case CPU_STATE_DEBUG:
            mc->run_state[core_id] = CORE_DEBUG;
            break;
        case CPU_STATE_IDLE:
            mc->run_state[core_id] = CORE_WAITING;
            break;
    }

    return cycles;
}

int multicore_step_all(multicore_system_t *mc)
{
    if (!mc) return -1;

    int total_cycles = 0;

    /* Round-robin: step each active core once */
    for (uint32_t i = 0; i < mc->num_cores; i++) {
        if (mc->run_state[i] == CORE_RUNNING) {
            int cycles = multicore_step_core(mc, i);
            if (cycles > 0) {
                total_cycles += cycles;
            }
        }
    }

    /* Update global cycle counter */
    mc->global_cycle++;

    /* Check for inter-processor interrupts */
    multicore_check_ipis(mc);

    return total_cycles;
}

int multicore_run(multicore_system_t *mc, uint64_t max_cycles)
{
    if (!mc) return -1;

    uint64_t start_cycle = mc->global_cycle;

    while (multicore_any_running(mc)) {
        /* Check cycle limit */
        if (max_cycles > 0 && (mc->global_cycle - start_cycle) >= max_cycles) {
            break;
        }

        int cycles = multicore_step_all(mc);
        if (cycles < 0) {
            return -1;  /* Error */
        }

        /* Check for debug break on any core */
        for (uint32_t i = 0; i < mc->num_cores; i++) {
            if (mc->run_state[i] == CORE_DEBUG) {
                return 0;  /* Stop on breakpoint */
            }
        }
    }

    return 0;
}

/* ==========================================================================
 * Inter-core Communication
 * ========================================================================== */

int multicore_send_ipi(multicore_system_t *mc, uint32_t target_core, uint8_t priority)
{
    if (!mc || target_core >= mc->num_cores) {
        return -1;
    }

    mc->ipi_pending[target_core] = true;
    mc->ipi_priority[target_core] = priority;

    return 0;
}

void multicore_check_ipis(multicore_system_t *mc)
{
    if (!mc) return;

    for (uint32_t i = 0; i < mc->num_cores; i++) {
        if (mc->ipi_pending[i] && mc->run_state[i] == CORE_RUNNING) {
            cpu_state_t *core = &mc->cores[i];

            /* Set interrupt pending in CPU state */
            core->irq_pending = true;
            core->pending_priority = mc->ipi_priority[i];
            core->pending_src = 0xFF;  /* IPI source */

            mc->ipi_pending[i] = false;
        }

        /* Wake waiting cores on IPI */
        if (mc->ipi_pending[i] && mc->run_state[i] == CORE_WAITING) {
            mc->run_state[i] = CORE_RUNNING;
            mc->cores[i].state = CPU_STATE_RUNNING;
            mc->cores[i].irq_pending = true;
            mc->cores[i].pending_priority = mc->ipi_priority[i];
            mc->ipi_pending[i] = false;
        }
    }
}

/* ==========================================================================
 * Debug Support
 * ========================================================================== */

void multicore_halt_all(multicore_system_t *mc)
{
    if (!mc) return;

    for (uint32_t i = 0; i < mc->num_cores; i++) {
        if (mc->run_state[i] == CORE_RUNNING) {
            mc->run_state[i] = CORE_DEBUG;
            mc->cores[i].state = CPU_STATE_DEBUG;
        }
    }
}

void multicore_resume_all(multicore_system_t *mc)
{
    if (!mc) return;

    for (uint32_t i = 0; i < mc->num_cores; i++) {
        if (mc->run_state[i] == CORE_DEBUG || mc->run_state[i] == CORE_HALTED) {
            if (mc->started_cores & (1 << i)) {
                mc->run_state[i] = CORE_RUNNING;
                mc->cores[i].state = CPU_STATE_RUNNING;
            }
        }
    }
}

void multicore_print_status(multicore_system_t *mc)
{
    if (!mc) return;

    printf("\n=== Multi-core Status ===\n");
    printf("Global cycle: %llu\n", (unsigned long long)mc->global_cycle);
    printf("Active cores: 0x%02X\n", mc->active_cores);

    for (uint32_t i = 0; i < mc->num_cores; i++) {
        const char *state_str = "UNKNOWN";
        switch (mc->run_state[i]) {
            case CORE_OFFLINE: state_str = "OFFLINE"; break;
            case CORE_HALTED:  state_str = "HALTED"; break;
            case CORE_RUNNING: state_str = "RUNNING"; break;
            case CORE_WAITING: state_str = "WAITING"; break;
            case CORE_DEBUG:   state_str = "DEBUG"; break;
        }

        printf("  Core %u: %-8s PC=0x%08X insns=%llu cycles=%llu\n",
               i, state_str,
               mc->cores[i].pc,
               (unsigned long long)mc->cores[i].insn_count,
               (unsigned long long)mc->cores[i].cycle_count);
    }
}

/* ==========================================================================
 * Synchronization Primitives
 * ========================================================================== */

uint32_t multicore_atomic_swap(multicore_system_t *mc, uint32_t addr, uint32_t value)
{
    if (!mc) return 0;

    /* Atomic swap: read old value, write new value */
    /* In real hardware this is a locked bus transaction */
    uint32_t old_value = mem_read32(mc->mem, addr);
    mem_write32(mc->mem, addr, value);

    return old_value;
}

uint32_t multicore_atomic_cmpswap(multicore_system_t *mc, uint32_t addr,
                                   uint32_t expected, uint32_t desired)
{
    if (!mc) return 0;

    /* Atomic compare-and-swap */
    uint32_t current = mem_read32(mc->mem, addr);
    if (current == expected) {
        mem_write32(mc->mem, addr, desired);
    }

    return current;
}
