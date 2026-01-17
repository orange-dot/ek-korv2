/**
 * @file multicore.h
 * @brief TC397XP Multi-core Orchestration
 *
 * Provides 6-core execution orchestration with:
 * - Round-robin core stepping
 * - Core start/stop control
 * - Inter-core interrupt routing
 * - Shared memory access ordering
 */

#ifndef MULTICORE_H
#define MULTICORE_H

#include "emu_types.h"
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Forward declaration */
typedef struct mem_system mem_system_t;

/* ==========================================================================
 * Multi-core System State
 * ========================================================================== */

/**
 * @brief Core execution state for orchestration
 */
typedef enum {
    CORE_OFFLINE,       /**< Core not powered/clocked */
    CORE_HALTED,        /**< Core halted (waiting for start) */
    CORE_RUNNING,       /**< Core executing instructions */
    CORE_WAITING,       /**< Core in WAIT instruction (low power) */
    CORE_DEBUG,         /**< Core stopped at breakpoint */
} core_run_state_t;

/**
 * @brief Multi-core system structure
 */
typedef struct {
    cpu_state_t         cores[TC397XP_NUM_CORES];   /**< Per-core CPU state */
    core_run_state_t    run_state[TC397XP_NUM_CORES]; /**< Per-core run state */
    mem_system_t       *mem;                         /**< Shared memory system */

    /* Synchronization */
    uint32_t            active_cores;               /**< Bitmask of active cores */
    uint32_t            started_cores;              /**< Bitmask of started cores */

    /* Timing */
    uint64_t            global_cycle;               /**< Global cycle counter */
    uint64_t            sync_interval;              /**< Cycles between sync points */

    /* Inter-core communication */
    bool                ipi_pending[TC397XP_NUM_CORES];  /**< IPI pending per core */
    uint8_t             ipi_priority[TC397XP_NUM_CORES]; /**< IPI priority per core */

    /* Configuration */
    uint32_t            num_cores;                  /**< Number of cores to emulate (1-6) */
    bool                lockstep_enabled;           /**< Lockstep mode for cores 0-3 */

} multicore_system_t;

/* ==========================================================================
 * Multi-core System Lifecycle
 * ========================================================================== */

/**
 * @brief Create and initialize multi-core system
 *
 * @param mem           Memory system to use
 * @param num_cores     Number of cores to emulate (1-6)
 * @return              Pointer to multicore system, or NULL on error
 */
multicore_system_t* multicore_create(mem_system_t *mem, uint32_t num_cores);

/**
 * @brief Destroy multi-core system
 *
 * @param mc    Multi-core system to destroy
 */
void multicore_destroy(multicore_system_t *mc);

/**
 * @brief Reset all cores to initial state
 *
 * @param mc    Multi-core system
 *
 * After reset:
 * - Core 0 is HALTED at reset vector (0x80000020)
 * - Cores 1-5 are OFFLINE
 */
void multicore_reset(multicore_system_t *mc);

/* ==========================================================================
 * Core Control
 * ========================================================================== */

/**
 * @brief Start a core at specified address
 *
 * @param mc        Multi-core system
 * @param core_id   Core to start (0-5)
 * @param pc        Initial PC value
 * @return          0 on success, -1 on error
 */
int multicore_start_core(multicore_system_t *mc, uint32_t core_id, uint32_t pc);

/**
 * @brief Stop a running core
 *
 * @param mc        Multi-core system
 * @param core_id   Core to stop (0-5)
 * @return          0 on success, -1 on error
 */
int multicore_stop_core(multicore_system_t *mc, uint32_t core_id);

/**
 * @brief Check if any core is running
 *
 * @param mc    Multi-core system
 * @return      true if at least one core is running
 */
bool multicore_any_running(multicore_system_t *mc);

/**
 * @brief Get pointer to specific core's CPU state
 *
 * @param mc        Multi-core system
 * @param core_id   Core ID (0-5)
 * @return          Pointer to cpu_state_t, or NULL if invalid
 */
cpu_state_t* multicore_get_core(multicore_system_t *mc, uint32_t core_id);

/* ==========================================================================
 * Execution
 * ========================================================================== */

/**
 * @brief Step all active cores one cycle (round-robin)
 *
 * @param mc    Multi-core system
 * @return      Total cycles executed across all cores
 *
 * Each core executes one instruction per call, in order from core 0 to 5.
 * Only RUNNING cores are stepped. WAITING cores check for wake events.
 */
int multicore_step_all(multicore_system_t *mc);

/**
 * @brief Step a single core
 *
 * @param mc        Multi-core system
 * @param core_id   Core to step
 * @return          Cycles for that core's instruction, or negative on error
 */
int multicore_step_core(multicore_system_t *mc, uint32_t core_id);

/**
 * @brief Run all cores until stop condition
 *
 * @param mc            Multi-core system
 * @param max_cycles    Maximum cycles to run (0 = unlimited)
 * @return              0 on normal stop, -1 on error
 *
 * Runs until:
 * - All cores halt/stop
 * - max_cycles reached
 * - Breakpoint hit
 */
int multicore_run(multicore_system_t *mc, uint64_t max_cycles);

/* ==========================================================================
 * Inter-core Communication
 * ========================================================================== */

/**
 * @brief Send inter-processor interrupt
 *
 * @param mc            Multi-core system
 * @param target_core   Target core (0-5)
 * @param priority      Interrupt priority (0-255)
 * @return              0 on success, -1 on error
 */
int multicore_send_ipi(multicore_system_t *mc, uint32_t target_core, uint8_t priority);

/**
 * @brief Check and deliver pending IPIs
 *
 * @param mc    Multi-core system
 *
 * Called internally by multicore_step_all(). Can be called manually
 * for fine-grained control.
 */
void multicore_check_ipis(multicore_system_t *mc);

/* ==========================================================================
 * Debug Support
 * ========================================================================== */

/**
 * @brief Halt all cores (debug break)
 *
 * @param mc    Multi-core system
 */
void multicore_halt_all(multicore_system_t *mc);

/**
 * @brief Resume all halted cores
 *
 * @param mc    Multi-core system
 */
void multicore_resume_all(multicore_system_t *mc);

/**
 * @brief Print status of all cores
 *
 * @param mc    Multi-core system
 */
void multicore_print_status(multicore_system_t *mc);

/* ==========================================================================
 * Synchronization Primitives (SWAP-based spinlocks)
 * ========================================================================== */

/**
 * @brief Execute SWAP instruction atomically
 *
 * @param mc        Multi-core system
 * @param addr      Memory address
 * @param value     Value to swap in
 * @return          Original value at address
 *
 * Atomic swap used for spinlock implementation:
 * - Acquire: while (swap(&lock, 1) == 1) { }
 * - Release: swap(&lock, 0)
 */
uint32_t multicore_atomic_swap(multicore_system_t *mc, uint32_t addr, uint32_t value);

/**
 * @brief Execute CMPSWAP instruction atomically
 *
 * @param mc        Multi-core system
 * @param addr      Memory address
 * @param expected  Expected value
 * @param desired   Desired new value
 * @return          Original value at address (compare with expected)
 *
 * Compare-and-swap for lock-free algorithms.
 */
uint32_t multicore_atomic_cmpswap(multicore_system_t *mc, uint32_t addr,
                                   uint32_t expected, uint32_t desired);

#ifdef __cplusplus
}
#endif

#endif /* MULTICORE_H */
