/**
 * @file periph_bus.c
 * @brief TC397XP Peripheral Bus Implementation
 *
 * Routes memory-mapped peripheral accesses to appropriate handlers.
 * Connects ASCLIN, STM, SCU, IR peripherals to the memory system.
 */

#include "peripherals.h"
#include <stdlib.h>
#include <stdio.h>

/* ==========================================================================
 * Peripheral Bus Structure
 * ========================================================================== */

struct periph_bus {
    asclin_t *asclin[2];    /* ASCLIN0, ASCLIN1 */
    stm_t *stm[6];          /* STM0-STM5 (one per core) */
    scu_t *scu;             /* System Control Unit */
    ir_t *ir;               /* Interrupt Router */
};

/* ==========================================================================
 * Lifecycle
 * ========================================================================== */

periph_bus_t* periph_bus_create(void)
{
    periph_bus_t *bus = calloc(1, sizeof(periph_bus_t));
    if (!bus) return NULL;

    /* Create ASCLIN peripherals */
    bus->asclin[0] = asclin_create(0);
    bus->asclin[1] = asclin_create(1);

    /* Create STM peripherals (one per core) */
    for (int i = 0; i < 6; i++) {
        bus->stm[i] = stm_create(i);
    }

    /* Create SCU and IR */
    bus->scu = scu_create();
    bus->ir = ir_create();

    return bus;
}

void periph_bus_destroy(periph_bus_t *bus)
{
    if (!bus) return;

    for (int i = 0; i < 2; i++) {
        if (bus->asclin[i]) asclin_destroy(bus->asclin[i]);
    }
    for (int i = 0; i < 6; i++) {
        if (bus->stm[i]) stm_destroy(bus->stm[i]);
    }
    if (bus->scu) scu_destroy(bus->scu);
    if (bus->ir) ir_destroy(bus->ir);

    free(bus);
}

/* ==========================================================================
 * Memory-Mapped Access
 * ========================================================================== */

uint32_t periph_read32(periph_bus_t *bus, uint32_t addr)
{
    if (!bus) return 0;

    /* Debug: log first few peripheral reads */
    static int read_count = 0;
    if (read_count < 10) {
        fprintf(stderr, "[PERIPH] read32 addr=0x%08X\n", addr);
        read_count++;
    }

    /* ASCLIN0: 0xF0000600 - 0xF00006FF */
    if (addr >= ASCLIN0_BASE && addr < ASCLIN0_BASE + ASCLIN_SIZE) {
        return asclin_read_reg(bus->asclin[0], addr - ASCLIN0_BASE);
    }

    /* ASCLIN1: 0xF0000700 - 0xF00007FF */
    if (addr >= ASCLIN1_BASE && addr < ASCLIN1_BASE + ASCLIN_SIZE) {
        return asclin_read_reg(bus->asclin[1], addr - ASCLIN1_BASE);
    }

    /* STM0-STM5: 0xF0001000 - 0xF00015FF */
    if (addr >= STM0_BASE && addr < STM0_BASE + 6 * STM_SIZE) {
        int stm_idx = (addr - STM0_BASE) / STM_SIZE;
        uint32_t offset = (addr - STM0_BASE) % STM_SIZE;
        if (stm_idx < 6 && bus->stm[stm_idx]) {
            return stm_read_reg(bus->stm[stm_idx], offset);
        }
    }

    /* SCU: 0xF0036000 - 0xF0036FFF */
    if (addr >= SCU_BASE_ADDR && addr < SCU_BASE_ADDR + SCU_SIZE) {
        return scu_read_reg(bus->scu, addr - SCU_BASE_ADDR);
    }

    /* IR: 0xF0037000 - 0xF0037FFF */
    if (addr >= IR_BASE_ADDR && addr < IR_BASE_ADDR + IR_SIZE) {
        return ir_read_reg(bus->ir, addr - IR_BASE_ADDR);
    }

    /* Unknown peripheral - return 0 */
    return 0;
}

void periph_write32(periph_bus_t *bus, uint32_t addr, uint32_t value)
{
    if (!bus) return;

    /* Debug: log first few peripheral writes */
    static int write_count = 0;
    if (write_count < 20) {
        fprintf(stderr, "[PERIPH] write32 addr=0x%08X value=0x%08X\n", addr, value);
        write_count++;
    }

    /* ASCLIN0: 0xF0000600 - 0xF00006FF */
    if (addr >= ASCLIN0_BASE && addr < ASCLIN0_BASE + ASCLIN_SIZE) {
        asclin_write_reg(bus->asclin[0], addr - ASCLIN0_BASE, value);
        return;
    }

    /* ASCLIN1: 0xF0000700 - 0xF00007FF */
    if (addr >= ASCLIN1_BASE && addr < ASCLIN1_BASE + ASCLIN_SIZE) {
        asclin_write_reg(bus->asclin[1], addr - ASCLIN1_BASE, value);
        return;
    }

    /* STM0-STM5: 0xF0001000 - 0xF00015FF */
    if (addr >= STM0_BASE && addr < STM0_BASE + 6 * STM_SIZE) {
        int stm_idx = (addr - STM0_BASE) / STM_SIZE;
        uint32_t offset = (addr - STM0_BASE) % STM_SIZE;
        if (stm_idx < 6 && bus->stm[stm_idx]) {
            stm_write_reg(bus->stm[stm_idx], offset, value);
        }
        return;
    }

    /* SCU: 0xF0036000 - 0xF0036FFF */
    if (addr >= SCU_BASE_ADDR && addr < SCU_BASE_ADDR + SCU_SIZE) {
        scu_write_reg(bus->scu, addr - SCU_BASE_ADDR, value);
        return;
    }

    /* IR: 0xF0037000 - 0xF0037FFF */
    if (addr >= IR_BASE_ADDR && addr < IR_BASE_ADDR + IR_SIZE) {
        ir_write_reg(bus->ir, addr - IR_BASE_ADDR, value);
        return;
    }

    /* Unknown peripheral - ignore */
}

/* ==========================================================================
 * Tick
 * ========================================================================== */

void periph_tick(periph_bus_t *bus, uint32_t core_id, uint32_t cycles)
{
    if (!bus) return;

    /* Tick STM for this core */
    if (core_id < 6 && bus->stm[core_id]) {
        stm_tick(bus->stm[core_id], cycles);
    }
}

/* ==========================================================================
 * Interrupt Handling
 * ========================================================================== */

int periph_get_pending_irq(periph_bus_t *bus, uint32_t cpu_id, uint8_t *priority)
{
    if (!bus || !bus->ir) return -1;
    return ir_get_pending_for_cpu(bus->ir, cpu_id, priority);
}

/* ==========================================================================
 * Accessor Functions
 * ========================================================================== */

stm_t* periph_get_stm(periph_bus_t *bus, uint32_t core_id)
{
    if (!bus || core_id >= 6) return NULL;
    return bus->stm[core_id];
}

asclin_t* periph_get_asclin(periph_bus_t *bus, uint32_t index)
{
    if (!bus || index >= 2) return NULL;
    return bus->asclin[index];
}

ir_t* periph_get_ir(periph_bus_t *bus)
{
    return bus ? bus->ir : NULL;
}

scu_t* periph_get_scu(periph_bus_t *bus)
{
    return bus ? bus->scu : NULL;
}
