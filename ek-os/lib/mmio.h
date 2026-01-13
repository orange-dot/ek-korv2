/**
 * @file mmio.h
 * @brief Memory-Mapped I/O helpers for EK-OS
 *
 * Provides safe MMIO read/write functions with proper memory barriers
 * for accessing hardware registers.
 */

#ifndef EK_OS_MMIO_H
#define EK_OS_MMIO_H

#include <stdint.h>

/**
 * @brief Full memory barrier (serialize all memory operations)
 */
static inline void mmio_barrier(void) {
    __asm__ volatile("mfence" ::: "memory");
}

/**
 * @brief Read memory barrier
 */
static inline void mmio_read_barrier(void) {
    __asm__ volatile("lfence" ::: "memory");
}

/**
 * @brief Write memory barrier
 */
static inline void mmio_write_barrier(void) {
    __asm__ volatile("sfence" ::: "memory");
}

/**
 * @brief Read 8-bit value from MMIO address
 */
static inline uint8_t mmio_read8(volatile void *addr) {
    uint8_t val = *(volatile uint8_t *)addr;
    mmio_read_barrier();
    return val;
}

/**
 * @brief Write 8-bit value to MMIO address
 */
static inline void mmio_write8(volatile void *addr, uint8_t val) {
    mmio_write_barrier();
    *(volatile uint8_t *)addr = val;
}

/**
 * @brief Read 16-bit value from MMIO address
 */
static inline uint16_t mmio_read16(volatile void *addr) {
    uint16_t val = *(volatile uint16_t *)addr;
    mmio_read_barrier();
    return val;
}

/**
 * @brief Write 16-bit value to MMIO address
 */
static inline void mmio_write16(volatile void *addr, uint16_t val) {
    mmio_write_barrier();
    *(volatile uint16_t *)addr = val;
}

/**
 * @brief Read 32-bit value from MMIO address
 */
static inline uint32_t mmio_read32(volatile void *addr) {
    uint32_t val = *(volatile uint32_t *)addr;
    mmio_read_barrier();
    return val;
}

/**
 * @brief Write 32-bit value to MMIO address
 */
static inline void mmio_write32(volatile void *addr, uint32_t val) {
    mmio_write_barrier();
    *(volatile uint32_t *)addr = val;
}

/**
 * @brief Read 64-bit value from MMIO address
 */
static inline uint64_t mmio_read64(volatile void *addr) {
    uint64_t val = *(volatile uint64_t *)addr;
    mmio_read_barrier();
    return val;
}

/**
 * @brief Write 64-bit value to MMIO address
 */
static inline void mmio_write64(volatile void *addr, uint64_t val) {
    mmio_write_barrier();
    *(volatile uint64_t *)addr = val;
}

/**
 * @brief Read-modify-write 32-bit MMIO register (set bits)
 */
static inline void mmio_set32(volatile void *addr, uint32_t bits) {
    uint32_t val = mmio_read32(addr);
    mmio_write32(addr, val | bits);
}

/**
 * @brief Read-modify-write 32-bit MMIO register (clear bits)
 */
static inline void mmio_clear32(volatile void *addr, uint32_t bits) {
    uint32_t val = mmio_read32(addr);
    mmio_write32(addr, val & ~bits);
}

#endif /* EK_OS_MMIO_H */
