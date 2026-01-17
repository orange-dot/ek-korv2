/**
 * @file tricore_csa.h
 * @brief TriCore Context Save Area (CSA) Management
 *
 * CSA is TriCore's hardware-assisted context switching mechanism.
 * Each context (upper or lower) is stored in a 64-byte CSA entry.
 * CSA entries are linked together in a free list.
 */

#ifndef TRICORE_CSA_H
#define TRICORE_CSA_H

#include <stdint.h>
#include <stdbool.h>
#include "tc397xp_sfr.h"
#include "tricore_intrinsics.h"

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Constants
 * ========================================================================== */

#define CSA_ENTRY_SIZE      64      /**< Size of one CSA entry in bytes */
#define CSA_ALIGNMENT       64      /**< Required alignment for CSA entries */

/* ==========================================================================
 * Types
 * ========================================================================== */

/**
 * @brief Generic CSA entry (can be upper or lower context)
 */
typedef union {
    csa_upper_t upper;
    csa_lower_t lower;
    uint32_t    words[16];
    uint8_t     bytes[64];
} csa_entry_t __attribute__((aligned(CSA_ALIGNMENT)));

/**
 * @brief CSA pool for a single core
 */
typedef struct {
    uint32_t    core_id;        /**< Owner core ID */
    uint32_t    base;           /**< Pool base address */
    uint32_t    size;           /**< Pool size in bytes */
    uint32_t    count;          /**< Number of CSA entries */
    uint32_t    free_count;     /**< Number of free entries */
    bool        initialized;    /**< Pool has been initialized */
} csa_pool_t;

/* ==========================================================================
 * Function Prototypes
 * ========================================================================== */

/**
 * @brief Initialize CSA pool for current core
 *
 * Sets up the free CSA list (FCX) and limit (LCX) for the calling core.
 * Must be called early in startup, before any context switches.
 *
 * @param base Base address of CSA pool (must be 64-byte aligned)
 * @param size Size of CSA pool in bytes
 * @return 0 on success, -1 on error
 */
int csa_init_pool(uint32_t base, uint32_t size);

/**
 * @brief Get CSA pool information for current core
 * @return Pointer to csa_pool_t
 */
csa_pool_t* csa_get_pool(void);

/**
 * @brief Check if CSA pool is running low
 * @return true if less than 10 entries remaining
 */
bool csa_is_low(void);

/**
 * @brief Get number of free CSA entries
 * @return Number of free entries
 */
uint32_t csa_get_free_count(void);

/* ==========================================================================
 * CSA Link Word Conversions
 * ========================================================================== */

/**
 * @brief Convert CSA memory address to link word format
 *
 * Link word format used in PCXI/FCX/LCX:
 *   [31:20] = Segment (bits [31:28] of address)
 *   [19:6]  = Offset >> 6 (bits [21:6] of address)
 *   [5:0]   = Reserved
 *
 * @param addr CSA entry memory address
 * @return Link word
 */
static inline uint32_t csa_addr_to_link(void *addr)
{
    uint32_t a = (uint32_t)addr;
    return ((a & 0xF0000000) >> 12) | ((a & 0x003FFFC0) >> 6);
}

/**
 * @brief Convert link word to CSA memory address
 * @param link Link word from PCXI/FCX
 * @return Memory address
 */
static inline void* csa_link_to_addr(uint32_t link)
{
    return (void*)(((link & 0x000F0000) << 12) | ((link & 0x0000FFFF) << 6));
}

/**
 * @brief Check if link word is valid (non-null)
 * @param link Link word
 * @return true if valid
 */
static inline bool csa_link_is_valid(uint32_t link)
{
    return link != 0;
}

/* ==========================================================================
 * Context Manipulation
 * ========================================================================== */

/**
 * @brief Initialize a task's initial context
 *
 * Creates the initial CSA chain for a new task, setting up:
 *   - Upper context with initial register values
 *   - Lower context with entry point and argument
 *
 * @param stack_top Top of task's stack
 * @param entry Task entry function
 * @param arg Argument to pass to entry function
 * @return Initial PCXI value to load when starting task, or 0 on error
 */
uint32_t csa_create_task_context(uint32_t stack_top, void (*entry)(void*), void *arg);

/**
 * @brief Allocate a CSA entry from free list
 *
 * Removes one entry from the FCX free list.
 *
 * @return Pointer to allocated CSA entry, or NULL if depleted
 */
csa_entry_t* csa_alloc(void);

/**
 * @brief Free a CSA entry back to free list
 *
 * Returns entry to the FCX free list.
 *
 * @param entry Pointer to CSA entry
 */
void csa_free(csa_entry_t *entry);

/**
 * @brief Free an entire CSA chain
 *
 * Follows the PCXI chain and frees all entries.
 * Used when destroying a task.
 *
 * @param pcxi Head of CSA chain (task's saved PCXI)
 */
void csa_free_chain(uint32_t pcxi);

/* ==========================================================================
 * Context Switch Support
 * ========================================================================== */

/**
 * @brief Save current context and switch to new context
 *
 * This is the core context switch operation:
 *   1. Save current lower context (SVLCX)
 *   2. Update current task's saved PCXI
 *   3. Load new task's PCXI
 *   4. Restore new lower context (RSLCX)
 *
 * Note: Upper context is automatically saved/restored by hardware on
 * interrupt/trap entry/exit.
 *
 * @param current_pcxi Pointer to current task's PCXI storage
 * @param next_pcxi New task's PCXI value
 */
void csa_switch_context(uint32_t *current_pcxi, uint32_t next_pcxi);

/**
 * @brief Load context and start execution (no save)
 *
 * Used when starting the first task or when current task is terminated.
 *
 * @param pcxi PCXI of context to load
 */
void csa_load_context(uint32_t pcxi) __attribute__((noreturn));

/* ==========================================================================
 * Debugging
 * ========================================================================== */

/**
 * @brief Dump CSA chain for debugging
 * @param pcxi Head of chain
 */
void csa_dump_chain(uint32_t pcxi);

/**
 * @brief Validate CSA pool integrity
 * @return true if pool is valid
 */
bool csa_validate_pool(void);

#ifdef __cplusplus
}
#endif

#endif /* TRICORE_CSA_H */
