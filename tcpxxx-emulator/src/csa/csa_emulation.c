/**
 * @file csa_emulation.c
 * @brief TriCore Context Save Area (CSA) Hardware Emulation
 *
 * Implements the CSA free list management for TriCore's hardware
 * context save/restore mechanism used by CALL/RET/BISR/RFE.
 *
 * CSA Memory Layout:
 * - Each CSA entry is 64 bytes (16 x 32-bit words)
 * - Entry[0] = Link word (points to next CSA in chain)
 * - Entry[1-15] = Context data (registers)
 *
 * Link Word Format:
 * - bits [19:16] = Segment (address bits [31:28])
 * - bits [15:0] = Offset (address bits [21:6])
 *
 * Reference: TriCore TC1.6.2 Architecture Manual
 */

#include "emu_types.h"
#include "tricore_exec.h"
#include <stdio.h>

/* ==========================================================================
 * Link Word Conversion
 * ========================================================================== */

/**
 * @brief Convert CSA memory address to link word format
 *
 * Link format packs the address for efficient storage:
 * - bits [19:16] = address[31:28] (segment)
 * - bits [15:0] = address[21:6] (offset / 64)
 */
uint32_t csa_addr_to_link(uint32_t addr)
{
    return ((addr & 0xF0000000) >> 12) | ((addr & 0x003FFFC0) >> 6);
}

/**
 * @brief Convert link word to CSA memory address
 */
uint32_t csa_link_to_addr(uint32_t link)
{
    return ((link & 0x000F0000) << 12) | ((link & 0x0000FFFF) << 6);
}

/* ==========================================================================
 * CSA Pool Initialization
 * ========================================================================== */

/**
 * @brief Initialize CSA pool with linked free list
 *
 * Creates the hardware CSA free list in memory. Each CSA entry's first
 * word points to the next free CSA, forming a singly-linked list.
 *
 * Typical pool sizes:
 * - 256 entries (16 KB) for simple applications
 * - 1024 entries (64 KB) for RTOS with many tasks
 *
 * @param cpu   CPU state (FCX/LCX will be initialized)
 * @param mem   Memory system to write the linked list
 * @param base  Base address of CSA pool (must be 64-byte aligned)
 * @param size  Total size of CSA pool in bytes
 * @return      Number of CSA entries created, or negative on error
 */
int csa_init_pool(cpu_state_t *cpu, mem_system_t *mem, uint32_t base, uint32_t size)
{
    /* Validate alignment (CSA must be 64-byte aligned) */
    if (base & (CSA_ALIGNMENT - 1)) {
        return -1;
    }

    /* Calculate number of CSA entries */
    uint32_t num_entries = size / CSA_ENTRY_SIZE;
    if (num_entries < 2) {
        return -1;  /* Need at least 2 entries */
    }

    /* Build the free list in memory */
    for (uint32_t i = 0; i < num_entries; i++) {
        uint32_t entry_addr = base + (i * CSA_ENTRY_SIZE);
        uint32_t next_addr;
        uint32_t link_word;

        if (i < num_entries - 1) {
            /* Point to next entry */
            next_addr = entry_addr + CSA_ENTRY_SIZE;
            link_word = csa_addr_to_link(next_addr);
        } else {
            /* Last entry - end of list */
            link_word = 0;
        }

        /* Write link word to first word of CSA entry */
        mem_write32(mem, entry_addr, link_word);

        /* Clear the rest of the entry (optional, for clean state) */
        for (int j = 1; j < 16; j++) {
            mem_write32(mem, entry_addr + (j * 4), 0);
        }
    }

    /* Initialize CPU registers */
    cpu->fcx = csa_addr_to_link(base);  /* First free CSA */
    cpu->lcx = csa_addr_to_link(base + (num_entries - 1) * CSA_ENTRY_SIZE);  /* Limit */

    return (int)num_entries;
}

/**
 * @brief Check CSA pool health
 *
 * Walks the free list and counts entries. Useful for debugging
 * CSA leaks or corruption.
 *
 * @param cpu   CPU state with FCX
 * @param mem   Memory system
 * @return      Number of free CSA entries, or negative on error
 */
int csa_count_free(cpu_state_t *cpu, mem_system_t *mem)
{
    int count = 0;
    uint32_t link = cpu->fcx;
    uint32_t max_iterations = 10000;  /* Prevent infinite loops */

    while (link != 0 && count < (int)max_iterations) {
        uint32_t addr = csa_link_to_addr(link);
        link = mem_read32(mem, addr);  /* Read next link */
        count++;
    }

    if (count >= (int)max_iterations) {
        return -1;  /* Likely corrupted list */
    }

    return count;
}

/**
 * @brief Check if CSA pool is near exhaustion
 *
 * Compares FCX with LCX to detect low CSA condition.
 * When FCX reaches LCX, a trap should be generated.
 *
 * @param cpu   CPU state
 * @return      true if pool is at or below limit
 */
bool csa_is_depleted(cpu_state_t *cpu)
{
    return (cpu->fcx == 0) || (cpu->fcx == cpu->lcx);
}

/**
 * @brief Get CSA pool statistics
 *
 * @param cpu        CPU state
 * @param mem        Memory system
 * @param out_free   Output: number of free entries
 * @param out_total  Output: total pool size (estimated from FCX/LCX)
 */
void csa_get_stats(cpu_state_t *cpu, mem_system_t *mem, int *out_free, int *out_total)
{
    *out_free = csa_count_free(cpu, mem);

    /* Estimate total from LCX - not exact but gives rough idea */
    if (cpu->lcx != 0) {
        uint32_t fcx_addr = csa_link_to_addr(cpu->fcx);
        uint32_t lcx_addr = csa_link_to_addr(cpu->lcx);

        /* Rough estimate assuming contiguous pool */
        if (lcx_addr >= fcx_addr) {
            *out_total = (int)((lcx_addr - fcx_addr) / CSA_ENTRY_SIZE) + *out_free;
        } else {
            *out_total = *out_free;  /* Can't estimate */
        }
    } else {
        *out_total = *out_free;
    }
}

/* ==========================================================================
 * Debug Helpers
 * ========================================================================== */

/**
 * @brief Dump CSA entry contents (for debugging)
 */
void csa_dump_entry(mem_system_t *mem, uint32_t addr, bool is_upper)
{
    printf("CSA @ 0x%08X (%s context):\n", addr, is_upper ? "upper" : "lower");

    uint32_t link = mem_read32(mem, addr + 0);
    printf("  Link/PCXI: 0x%08X -> 0x%08X\n", link, csa_link_to_addr(link));

    if (is_upper) {
        printf("  PSW:  0x%08X\n", mem_read32(mem, addr + 4));
        printf("  A10:  0x%08X (SP)\n", mem_read32(mem, addr + 8));
        printf("  A11:  0x%08X (RA)\n", mem_read32(mem, addr + 12));
        printf("  D8-D11: 0x%08X 0x%08X 0x%08X 0x%08X\n",
               mem_read32(mem, addr + 16), mem_read32(mem, addr + 20),
               mem_read32(mem, addr + 24), mem_read32(mem, addr + 28));
        printf("  A12-A15: 0x%08X 0x%08X 0x%08X 0x%08X\n",
               mem_read32(mem, addr + 32), mem_read32(mem, addr + 36),
               mem_read32(mem, addr + 40), mem_read32(mem, addr + 44));
        printf("  D12-D15: 0x%08X 0x%08X 0x%08X 0x%08X\n",
               mem_read32(mem, addr + 48), mem_read32(mem, addr + 52),
               mem_read32(mem, addr + 56), mem_read32(mem, addr + 60));
    } else {
        printf("  A11:  0x%08X (Return PC)\n", mem_read32(mem, addr + 4));
        printf("  A2-A3: 0x%08X 0x%08X\n",
               mem_read32(mem, addr + 8), mem_read32(mem, addr + 12));
        printf("  D0-D3: 0x%08X 0x%08X 0x%08X 0x%08X\n",
               mem_read32(mem, addr + 16), mem_read32(mem, addr + 20),
               mem_read32(mem, addr + 24), mem_read32(mem, addr + 28));
        printf("  A4-A7: 0x%08X 0x%08X 0x%08X 0x%08X\n",
               mem_read32(mem, addr + 32), mem_read32(mem, addr + 36),
               mem_read32(mem, addr + 40), mem_read32(mem, addr + 44));
        printf("  D4-D7: 0x%08X 0x%08X 0x%08X 0x%08X\n",
               mem_read32(mem, addr + 48), mem_read32(mem, addr + 52),
               mem_read32(mem, addr + 56), mem_read32(mem, addr + 60));
    }
}

/**
 * @brief Walk and dump entire CSA free list (for debugging)
 */
void csa_dump_free_list(cpu_state_t *cpu, mem_system_t *mem, int max_entries)
{
    printf("CSA Free List (FCX=0x%08X, LCX=0x%08X):\n", cpu->fcx, cpu->lcx);

    uint32_t link = cpu->fcx;
    int count = 0;

    while (link != 0 && count < max_entries) {
        uint32_t addr = csa_link_to_addr(link);
        uint32_t next = mem_read32(mem, addr);

        printf("  [%d] Link=0x%05X -> Addr=0x%08X -> Next=0x%05X\n",
               count, link, addr, next);

        link = next;
        count++;

        if (link == cpu->lcx) {
            printf("  [%d] ** LCX reached (limit) **\n", count);
        }
    }

    if (link == 0) {
        printf("  End of list (%d entries)\n", count);
    } else if (count >= max_entries) {
        printf("  ... truncated at %d entries\n", max_entries);
    }
}
