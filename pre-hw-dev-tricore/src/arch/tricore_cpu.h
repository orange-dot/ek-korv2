/**
 * @file tricore_cpu.h
 * @brief TriCore CPU Control Interface
 *
 * CPU identification, control, and low-level operations for TC397XP.
 */

#ifndef TRICORE_CPU_H
#define TRICORE_CPU_H

#include <stdint.h>
#include <stdbool.h>
#include "tricore_intrinsics.h"
#include "tc397xp_sfr.h"
#include "tc397xp_regs.h"

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Constants
 * ========================================================================== */

#define CPU_COUNT               6       /**< Total CPU cores in TC397XP */
#define CPU_LOCKSTEP_COUNT      4       /**< Cores with lockstep (CPU0-CPU3) */

/* CPU Core IDs */
#define CPU0                    0
#define CPU1                    1
#define CPU2                    2
#define CPU3                    3
#define CPU4                    4
#define CPU5                    5

/* ==========================================================================
 * Types
 * ========================================================================== */

/**
 * @brief CPU state
 */
typedef enum {
    CPU_STATE_HALTED = 0,       /**< CPU is halted (not running) */
    CPU_STATE_RUNNING,          /**< CPU is running */
    CPU_STATE_IDLE,             /**< CPU is in idle/low-power mode */
    CPU_STATE_DEBUG,            /**< CPU is in debug mode */
} cpu_state_t;

/**
 * @brief Per-CPU data structure
 */
typedef struct {
    uint32_t        core_id;            /**< Core ID (0-5) */
    cpu_state_t     state;              /**< Current state */
    bool            is_lockstep;        /**< Has lockstep checker core */
    uint32_t        dspr_base;          /**< DSPR base address */
    uint32_t        dspr_size;          /**< DSPR size in bytes */
    uint32_t        pspr_base;          /**< PSPR base address */
    uint32_t        pspr_size;          /**< PSPR size in bytes */
    uint32_t        stack_top;          /**< Stack top address */
    uint32_t        csa_base;           /**< CSA pool base */
    uint32_t        csa_size;           /**< CSA pool size */
    void           *entry_func;         /**< Entry function for this core */
    void           *entry_arg;          /**< Argument for entry function */
} cpu_info_t;

/* ==========================================================================
 * Global Data
 * ========================================================================== */

/**
 * @brief Per-CPU information array
 */
extern cpu_info_t g_cpu_info[CPU_COUNT];

/* ==========================================================================
 * Function Prototypes
 * ========================================================================== */

/**
 * @brief Initialize CPU subsystem
 * Called once from CPU0 during boot.
 */
void cpu_init(void);

/**
 * @brief Get current CPU core ID
 * @return Core ID (0-5)
 */
static inline uint32_t cpu_get_id(void)
{
    return __get_core_id();
}

/**
 * @brief Get CPU info structure for a core
 * @param core_id Core ID (0-5)
 * @return Pointer to cpu_info_t, or NULL if invalid
 */
cpu_info_t* cpu_get_info(uint32_t core_id);

/**
 * @brief Get current CPU info structure
 * @return Pointer to cpu_info_t for current core
 */
static inline cpu_info_t* cpu_get_current_info(void)
{
    return cpu_get_info(cpu_get_id());
}

/**
 * @brief Check if current core has lockstep
 * @return true if lockstep enabled
 */
static inline bool cpu_has_lockstep(void)
{
    return cpu_get_id() < CPU_LOCKSTEP_COUNT;
}

/**
 * @brief Check if a core ID is valid
 * @param core_id Core ID to check
 * @return true if valid (0-5)
 */
static inline bool cpu_is_valid_id(uint32_t core_id)
{
    return core_id < CPU_COUNT;
}

/**
 * @brief Get DSPR base address for a core
 * @param core_id Core ID
 * @return DSPR base address
 */
uint32_t cpu_get_dspr_base(uint32_t core_id);

/**
 * @brief Get DSPR size for a core
 * @param core_id Core ID
 * @return DSPR size in bytes
 */
uint32_t cpu_get_dspr_size(uint32_t core_id);

/* ==========================================================================
 * Critical Section (Interrupt Control)
 * ========================================================================== */

/**
 * @brief Enter critical section (disable interrupts)
 * @return Previous interrupt state (ICR value)
 */
static inline uint32_t cpu_enter_critical(void)
{
    return __save_and_disable_interrupts();
}

/**
 * @brief Exit critical section (restore interrupts)
 * @param state Previous ICR value from cpu_enter_critical()
 */
static inline void cpu_exit_critical(uint32_t state)
{
    __restore_interrupts(state);
}

/**
 * @brief Check if interrupts are enabled
 * @return true if interrupts enabled
 */
static inline bool cpu_interrupts_enabled(void)
{
    return (__mfcr(CSFR_ICR) & ICR_IE) != 0;
}

/* ==========================================================================
 * Memory Barriers
 * ========================================================================== */

/**
 * @brief Data memory barrier
 */
static inline void cpu_dmb(void)
{
    __dsync();
}

/**
 * @brief Instruction memory barrier
 */
static inline void cpu_imb(void)
{
    __isync();
}

/**
 * @brief Full memory barrier (data + instruction)
 */
static inline void cpu_mb(void)
{
    __barrier();
}

/* ==========================================================================
 * Idle and Power Management
 * ========================================================================== */

/**
 * @brief Enter idle mode (wait for interrupt)
 */
void cpu_idle(void);

/**
 * @brief Halt CPU (for fatal errors)
 */
void cpu_halt(void) __attribute__((noreturn));

/**
 * @brief Trigger software reset
 */
void cpu_reset(void) __attribute__((noreturn));

/* ==========================================================================
 * ENDINIT Protection
 * ========================================================================== */

/**
 * @brief Unlock ENDINIT protection (allows modifying protected registers)
 * Must be called before modifying SCU, WDT, and other protected registers.
 */
void cpu_endinit_unlock(void);

/**
 * @brief Lock ENDINIT protection
 * Must be called after modifying protected registers.
 */
void cpu_endinit_lock(void);

/**
 * @brief Clear Safety ENDINIT (for safety-critical registers)
 */
void cpu_safety_endinit_unlock(void);

/**
 * @brief Set Safety ENDINIT
 */
void cpu_safety_endinit_lock(void);

#ifdef __cplusplus
}
#endif

#endif /* TRICORE_CPU_H */
