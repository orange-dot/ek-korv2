/**
 * @file tricore_csa.c
 * @brief TriCore Context Save Area (CSA) Implementation
 */

#include "tricore_csa.h"
#include "tricore_cpu.h"
#include <string.h>

/* ==========================================================================
 * Per-Core CSA Pools
 * ========================================================================== */

static csa_pool_t g_csa_pools[CPU_COUNT];

/* ==========================================================================
 * Pool Initialization
 * ========================================================================== */

int csa_init_pool(uint32_t base, uint32_t size)
{
    uint32_t core_id = cpu_get_id();

    /* Validate alignment */
    if ((base & (CSA_ALIGNMENT - 1)) != 0) {
        return -1;  /* Base not aligned */
    }

    if (size < CSA_ENTRY_SIZE * 2) {
        return -1;  /* Pool too small */
    }

    csa_pool_t *pool = &g_csa_pools[core_id];
    pool->core_id = core_id;
    pool->base = base;
    pool->size = size;
    pool->count = size / CSA_ENTRY_SIZE;
    pool->free_count = pool->count;
    pool->initialized = false;

    /*
     * Build the free CSA list
     *
     * Each CSA entry's first word (PCXI) points to the next entry.
     * The last entry points to NULL (0).
     */
    csa_entry_t *entries = (csa_entry_t *)base;
    uint32_t num_entries = pool->count;

    for (uint32_t i = 0; i < num_entries - 1; i++) {
        /* Clear entry */
        memset(&entries[i], 0, CSA_ENTRY_SIZE);
        /* Point to next entry */
        entries[i].words[0] = csa_addr_to_link(&entries[i + 1]);
    }
    /* Last entry points to NULL */
    memset(&entries[num_entries - 1], 0, CSA_ENTRY_SIZE);
    entries[num_entries - 1].words[0] = 0;

    /* Set FCX (Free Context List Head) to first entry */
    __set_fcx(csa_addr_to_link(&entries[0]));

    /* Set LCX (Free Context List Limit) to trigger warning when low */
    /* Set to ~10 entries before end */
    uint32_t limit_idx = (num_entries > 10) ? (num_entries - 10) : 0;
    __set_lcx(csa_addr_to_link(&entries[limit_idx]));

    pool->initialized = true;

    return 0;
}

csa_pool_t* csa_get_pool(void)
{
    return &g_csa_pools[cpu_get_id()];
}

bool csa_is_low(void)
{
    /* Check SYSCON.FCDSF (Free Context List Depleted Sticky Flag) */
    uint32_t syscon = __mfcr(CSFR_SYSCON);
    return (syscon & SYSCON_FCDSF) != 0;
}

uint32_t csa_get_free_count(void)
{
    /* Count entries in free list */
    uint32_t count = 0;
    uint32_t fcx = __get_fcx();

    while (fcx != 0) {
        csa_entry_t *entry = (csa_entry_t *)csa_link_to_addr(fcx);
        fcx = entry->words[0];
        count++;

        /* Safety limit */
        if (count > 1000) break;
    }

    return count;
}

/* ==========================================================================
 * CSA Allocation
 * ========================================================================== */

csa_entry_t* csa_alloc(void)
{
    uint32_t irq_state = cpu_enter_critical();

    uint32_t fcx = __get_fcx();
    if (fcx == 0) {
        cpu_exit_critical(irq_state);
        return NULL;  /* Pool depleted */
    }

    /* Get entry from head of free list */
    csa_entry_t *entry = (csa_entry_t *)csa_link_to_addr(fcx);

    /* Update FCX to point to next free entry */
    __set_fcx(entry->words[0]);

    /* Update pool stats */
    csa_pool_t *pool = csa_get_pool();
    if (pool->free_count > 0) {
        pool->free_count--;
    }

    cpu_exit_critical(irq_state);

    /* Clear the allocated entry */
    memset(entry, 0, CSA_ENTRY_SIZE);

    return entry;
}

void csa_free(csa_entry_t *entry)
{
    if (entry == NULL) {
        return;
    }

    uint32_t irq_state = cpu_enter_critical();

    /* Add to head of free list */
    uint32_t fcx = __get_fcx();
    entry->words[0] = fcx;
    __set_fcx(csa_addr_to_link(entry));

    /* Update pool stats */
    csa_pool_t *pool = csa_get_pool();
    pool->free_count++;

    cpu_exit_critical(irq_state);
}

void csa_free_chain(uint32_t pcxi)
{
    while (pcxi != 0) {
        csa_entry_t *entry = (csa_entry_t *)csa_link_to_addr(pcxi);
        uint32_t next = entry->words[0];
        csa_free(entry);
        pcxi = next;
    }
}

/* ==========================================================================
 * Task Context Creation
 * ========================================================================== */

uint32_t csa_create_task_context(uint32_t stack_top, void (*entry)(void*), void *arg)
{
    /*
     * For a new task, we need to create a context that looks like:
     * 1. A lower context with the entry point as the return address
     * 2. An upper context with the stack pointer and initial PSW
     *
     * When the task is first scheduled, we load its PCXI and call RFE
     * (Return From Exception) which restores the upper context and
     * returns to the entry point.
     */

    /* Allocate upper context */
    csa_entry_t *upper = csa_alloc();
    if (upper == NULL) {
        return 0;
    }

    /* Allocate lower context */
    csa_entry_t *lower = csa_alloc();
    if (lower == NULL) {
        csa_free(upper);
        return 0;
    }

    /* Initialize upper context */
    upper->upper.pcxi = csa_addr_to_link(lower) | PCXI_UL;  /* Link to lower, mark as upper */
    upper->upper.psw = PSW_IO_SUPERVISOR << PSW_IO_SHIFT;   /* Supervisor mode */
    upper->upper.a10 = stack_top;                           /* Stack pointer */
    upper->upper.a11 = (uint32_t)entry;                     /* Return address (entry point) */
    /* D8-D15, A12-A15 initialized to 0 */

    /* Initialize lower context */
    lower->lower.pcxi = 0;                          /* End of chain */
    lower->lower.a11_pc = (uint32_t)entry;          /* Entry point */
    lower->lower.a4 = (uint32_t)arg;                /* First argument (in A4 per ABI) */
    /* D0-D7, A2-A7, D4-D7 initialized to 0 */

    /* Return PCXI pointing to upper context */
    return csa_addr_to_link(upper) | PCXI_UL;
}

/* ==========================================================================
 * Context Switch
 * ========================================================================== */

/*
 * Context switch implementation using TriCore CSA mechanism.
 *
 * Unlike ARM where we manually push/pop registers to the stack,
 * TriCore uses a hardware-linked list of Context Save Areas.
 *
 * Key instructions:
 *   SVLCX - Save Lower Context (allocates CSA, saves D0-D7, A2-A7, A11)
 *   RSLCX - Restore Lower Context (restores from CSA, frees it)
 *   BISR  - Begin Interrupt Service Routine (allocates CSA for upper context)
 *   RFE   - Return From Exception (restores upper context, returns)
 */

void csa_switch_context(uint32_t *current_pcxi, uint32_t next_pcxi)
{
    /*
     * This is a simplified context switch.
     * In practice, we need assembly for precise control.
     *
     * The actual switch happens like this:
     * 1. SVLCX to save current lower context
     * 2. Store updated PCXI to current task
     * 3. Load next task's PCXI
     * 4. RSLCX to restore next lower context
     * 5. Continue execution
     */

    /* Save current lower context */
    __svlcx();

    /* Get current PCXI (now points to saved context) */
    *current_pcxi = __get_pcxi();

    /* Load next task's context */
    __set_pcxi(next_pcxi);

    /* Restore next lower context */
    __rslcx();

    /* Execution continues in next task */
}

void csa_load_context(uint32_t pcxi)
{
    /* Load the context and return from exception */
    __set_pcxi(pcxi);
    __rslcx();
    __rfe();

    /* Should never reach here */
    while (1) {
        __nop();
    }
}

/* ==========================================================================
 * Debug Functions
 * ========================================================================== */

void csa_dump_chain(uint32_t pcxi)
{
    /* TODO: Implement debug output when UART is available */
    (void)pcxi;
}

bool csa_validate_pool(void)
{
    csa_pool_t *pool = csa_get_pool();

    if (!pool->initialized) {
        return false;
    }

    /* Count free entries and verify they're within pool bounds */
    uint32_t count = 0;
    uint32_t fcx = __get_fcx();
    uint32_t pool_end = pool->base + pool->size;

    while (fcx != 0 && count < pool->count + 1) {
        csa_entry_t *entry = (csa_entry_t *)csa_link_to_addr(fcx);
        uint32_t addr = (uint32_t)entry;

        /* Check entry is within pool bounds */
        if (addr < pool->base || addr >= pool_end) {
            return false;
        }

        /* Check alignment */
        if (addr & (CSA_ALIGNMENT - 1)) {
            return false;
        }

        fcx = entry->words[0];
        count++;
    }

    /* If we counted more than pool size, there's a cycle */
    if (count > pool->count) {
        return false;
    }

    return true;
}
