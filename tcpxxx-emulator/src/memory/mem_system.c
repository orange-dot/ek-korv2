/**
 * @file mem_system.c
 * @brief TC397XP Memory System with Wait State Modeling
 *
 * Implements the TC397XP memory map with timing annotations.
 */

#include "emu_types.h"
#include "tricore_exec.h"
#include "peripherals.h"
#include <stdlib.h>
#include <string.h>

/* Forward declaration */
void mem_destroy(mem_system_t *mem);

/**
 * @brief Memory system structure
 */
struct mem_system {
    uint8_t *pflash;        /* Program Flash (16 MB) */
    uint8_t *dflash;        /* Data Flash (1.15 MB) */
    uint8_t *dspr[6];       /* Per-core DSPR (240 KB each) */
    uint8_t *pspr[6];       /* Per-core PSPR (64 KB each) */
    uint8_t *lmu;           /* Local Memory Unit (768 KB) */
    uint8_t *emem;          /* Extended Memory (4 MB) */
    periph_bus_t *periph;   /* Peripheral bus (ASCLIN, STM, SCU, IR) */

    mem_timing_t timing;    /* Timing configuration */
    uint32_t current_core;  /* Current executing core (for local addressing) */
};

/* ==========================================================================
 * Memory System Lifecycle
 * ========================================================================== */

mem_system_t* mem_create(void)
{
    mem_system_t *mem = calloc(1, sizeof(mem_system_t));
    if (!mem) return NULL;

    /* Allocate memory regions */
    mem->pflash = calloc(1, PFLASH_SIZE);
    mem->dflash = calloc(1, DFLASH_SIZE);
    mem->lmu = calloc(1, LMU_SIZE);
    mem->emem = calloc(1, EMEM_SIZE);
    mem->periph = periph_bus_create();  /* Peripheral bus with ASCLIN, STM, etc. */

    for (int i = 0; i < 6; i++) {
        mem->dspr[i] = calloc(1, DSPR_SIZE_PER_CORE);
        mem->pspr[i] = calloc(1, PSPR_SIZE_PER_CORE);
    }

    /* Check allocations */
    if (!mem->pflash || !mem->dflash || !mem->lmu || !mem->emem || !mem->periph) {
        mem_destroy(mem);
        return NULL;
    }

    for (int i = 0; i < 6; i++) {
        if (!mem->dspr[i] || !mem->pspr[i]) {
            mem_destroy(mem);
            return NULL;
        }
    }

    /* Default timing @ 300MHz */
    mem->timing.pflash_wait_states = 5;
    mem->timing.dflash_read_cycles = 10;
    mem->timing.dspr_cycles = 0;
    mem->timing.lmu_cycles = 1;
    mem->timing.emem_cycles = 2;
    mem->timing.peripheral_cycles = 2;

    mem->current_core = 0;

    return mem;
}

void mem_destroy(mem_system_t *mem)
{
    if (!mem) return;

    free(mem->pflash);
    free(mem->dflash);
    free(mem->lmu);
    free(mem->emem);
    periph_bus_destroy(mem->periph);

    for (int i = 0; i < 6; i++) {
        free(mem->dspr[i]);
        free(mem->pspr[i]);
    }

    free(mem);
}

void mem_set_core(mem_system_t *mem, uint32_t core_id)
{
    if (core_id < 6) {
        mem->current_core = core_id;
    }
}

/* ==========================================================================
 * Address Resolution
 * ========================================================================== */

/**
 * @brief Get pointer to memory at address and return cycle count
 *
 * @param mem       Memory system
 * @param addr      Address to access
 * @param out_ptr   Output pointer to memory location
 * @param is_write  True if write access (affects flash behavior)
 * @return          Cycle count for access (0 = invalid address)
 */
static uint8_t resolve_address(mem_system_t *mem, uint32_t addr, uint8_t **out_ptr, bool is_write)
{
    *out_ptr = NULL;

    /* Program Flash: 0x80000000 - 0x80FFFFFF (16 MB) */
    if (addr >= PFLASH_BASE && addr < PFLASH_BASE + PFLASH_SIZE) {
        if (is_write) {
            return 0;  /* Flash is read-only during execution */
        }
        *out_ptr = mem->pflash + (addr - PFLASH_BASE);
        return mem->timing.pflash_wait_states + 1;
    }

    /* Data Flash: 0xAF000000 */
    if (addr >= DFLASH_BASE && addr < DFLASH_BASE + DFLASH_SIZE) {
        *out_ptr = mem->dflash + (addr - DFLASH_BASE);
        return is_write ? 100 : mem->timing.dflash_read_cycles;  /* EEPROM-like writes are slow */
    }

    /* Local DSPR (current core): 0x70000000 */
    if (addr >= LOCAL_DSPR_BASE && addr < LOCAL_DSPR_BASE + DSPR_SIZE_PER_CORE) {
        *out_ptr = mem->dspr[mem->current_core] + (addr - LOCAL_DSPR_BASE);
        return mem->timing.dspr_cycles + 1;
    }

    /* Local PSPR (current core): 0x70100000 */
    if (addr >= LOCAL_PSPR_BASE && addr < LOCAL_PSPR_BASE + PSPR_SIZE_PER_CORE) {
        *out_ptr = mem->pspr[mem->current_core] + (addr - LOCAL_PSPR_BASE);
        return mem->timing.dspr_cycles + 1;
    }

    /* Global DSPR addresses for each core */
    static const uint32_t dspr_bases[6] = {
        DSPR_BASE_CPU0, DSPR_BASE_CPU1, DSPR_BASE_CPU2,
        DSPR_BASE_CPU3, DSPR_BASE_CPU4, DSPR_BASE_CPU5
    };

    for (int i = 0; i < 6; i++) {
        if (addr >= dspr_bases[i] && addr < dspr_bases[i] + DSPR_SIZE_PER_CORE) {
            *out_ptr = mem->dspr[i] + (addr - dspr_bases[i]);
            /* Cross-core access has additional latency */
            return (i == (int)mem->current_core) ?
                   (mem->timing.dspr_cycles + 1) :
                   (mem->timing.dspr_cycles + 3);
        }
    }

    /* LMU: 0x90000000 */
    if (addr >= LMU_BASE && addr < LMU_BASE + LMU_SIZE) {
        *out_ptr = mem->lmu + (addr - LMU_BASE);
        return mem->timing.lmu_cycles + 1;
    }

    /* EMEM: 0x99000000 */
    if (addr >= EMEM_BASE && addr < EMEM_BASE + EMEM_SIZE) {
        *out_ptr = mem->emem + (addr - EMEM_BASE);
        return mem->timing.emem_cycles + 1;
    }

    /* Peripheral registers: 0xF0000000+ - handled separately in mem_read32/mem_write32 */
    /* Return 0 to indicate special handling needed */

    return 0;  /* Invalid address or peripheral (needs special handling) */
}

/* ==========================================================================
 * Memory Read Functions
 * ========================================================================== */

uint8_t mem_read8(mem_system_t *mem, uint32_t addr)
{
    uint8_t *ptr;
    if (resolve_address(mem, addr, &ptr, false) && ptr) {
        return *ptr;
    }
    return 0;
}

uint16_t mem_read16(mem_system_t *mem, uint32_t addr)
{
    uint8_t *ptr;
    if (resolve_address(mem, addr, &ptr, false) && ptr) {
        /* Little-endian read */
        return (uint16_t)ptr[0] | ((uint16_t)ptr[1] << 8);
    }
    return 0;
}

uint32_t mem_read32(mem_system_t *mem, uint32_t addr)
{
    /* CSFR space: 0xFFFF0000 - 0xFFFFFFFF - NOT peripheral, handled by CPU */
    if (addr >= 0xFFFF0000) {
        /* CSFRs should be accessed via MTCR/MFCR, not memory ops */
        return 0;
    }

    /* Peripheral registers: 0xF0000000 - 0xFFFEFFFF - route through peripheral bus */
    if (addr >= PERIPHERAL_BASE) {
        return periph_read32(mem->periph, addr);
    }

    uint8_t *ptr;
    if (resolve_address(mem, addr, &ptr, false) && ptr) {
        /* Little-endian read */
        return (uint32_t)ptr[0] |
               ((uint32_t)ptr[1] << 8) |
               ((uint32_t)ptr[2] << 16) |
               ((uint32_t)ptr[3] << 24);
    }
    return 0;
}

uint64_t mem_read64(mem_system_t *mem, uint32_t addr)
{
    uint8_t *ptr;
    if (resolve_address(mem, addr, &ptr, false) && ptr) {
        /* Little-endian read */
        uint64_t lo = mem_read32(mem, addr);
        uint64_t hi = mem_read32(mem, addr + 4);
        return lo | (hi << 32);
    }
    return 0;
}

/* ==========================================================================
 * Memory Write Functions
 * ========================================================================== */

void mem_write8(mem_system_t *mem, uint32_t addr, uint8_t value)
{
    uint8_t *ptr;
    if (resolve_address(mem, addr, &ptr, true) && ptr) {
        *ptr = value;
    }
}

void mem_write16(mem_system_t *mem, uint32_t addr, uint16_t value)
{
    uint8_t *ptr;
    if (resolve_address(mem, addr, &ptr, true) && ptr) {
        /* Little-endian write */
        ptr[0] = (uint8_t)(value & 0xFF);
        ptr[1] = (uint8_t)((value >> 8) & 0xFF);
    }
}

void mem_write32(mem_system_t *mem, uint32_t addr, uint32_t value)
{
    /* CSFR space: 0xFFFF0000 - 0xFFFFFFFF - NOT peripheral, handled by CPU */
    if (addr >= 0xFFFF0000) {
        /* CSFRs should be accessed via MTCR/MFCR, not memory ops */
        return;
    }

    /* Peripheral registers: 0xF0000000 - 0xFFFEFFFF - route through peripheral bus */
    if (addr >= PERIPHERAL_BASE) {
        periph_write32(mem->periph, addr, value);
        return;
    }

    uint8_t *ptr;
    if (resolve_address(mem, addr, &ptr, true) && ptr) {
        /* Little-endian write */
        ptr[0] = (uint8_t)(value & 0xFF);
        ptr[1] = (uint8_t)((value >> 8) & 0xFF);
        ptr[2] = (uint8_t)((value >> 16) & 0xFF);
        ptr[3] = (uint8_t)((value >> 24) & 0xFF);
    }
}

void mem_write64(mem_system_t *mem, uint32_t addr, uint64_t value)
{
    mem_write32(mem, addr, (uint32_t)(value & 0xFFFFFFFF));
    mem_write32(mem, addr + 4, (uint32_t)(value >> 32));
}

/* ==========================================================================
 * Timing Query
 * ========================================================================== */

uint8_t mem_get_cycles(mem_system_t *mem, uint32_t addr, bool is_write)
{
    /* CSFR space: 0xFFFF0000+ - not memory, quick access */
    if (addr >= 0xFFFF0000) {
        return 1;
    }

    /* Peripheral registers: 0xF0000000 - 0xFFFEFFFF */
    if (addr >= PERIPHERAL_BASE) {
        return mem->timing.peripheral_cycles + 1;
    }

    uint8_t *ptr;
    return resolve_address(mem, addr, &ptr, is_write);
}

/* ==========================================================================
 * Binary Loading
 * ========================================================================== */

int mem_load_binary(mem_system_t *mem, uint32_t addr, const uint8_t *data, size_t size)
{
    /* Allow loading to flash region (for initial program loading) */
    if (addr >= PFLASH_BASE && addr + size <= PFLASH_BASE + PFLASH_SIZE) {
        memcpy(mem->pflash + (addr - PFLASH_BASE), data, size);
        return 0;
    }

    /* Allow loading to LMU */
    if (addr >= LMU_BASE && addr + size <= LMU_BASE + LMU_SIZE) {
        memcpy(mem->lmu + (addr - LMU_BASE), data, size);
        return 0;
    }

    /* Allow loading to DSPR (local) */
    if (addr >= LOCAL_DSPR_BASE && addr + size <= LOCAL_DSPR_BASE + DSPR_SIZE_PER_CORE) {
        memcpy(mem->dspr[mem->current_core] + (addr - LOCAL_DSPR_BASE), data, size);
        return 0;
    }

    return -1;  /* Invalid region for loading */
}

/* ==========================================================================
 * Timing Configuration
 * ========================================================================== */

void mem_set_timing(mem_system_t *mem, const mem_timing_t *timing)
{
    mem->timing = *timing;
}

const mem_timing_t* mem_get_timing(mem_system_t *mem)
{
    return &mem->timing;
}
