/**
 * @file tricore_intrinsics.h
 * @brief TriCore Compiler Intrinsics
 *
 * Provides compiler-specific intrinsic functions for TriCore architecture.
 * These are used for accessing CSFRs, synchronization, and other low-level operations.
 *
 * Supports:
 *   - TriCore GCC (AURIX Development Studio, HighTec, NoMore201)
 *   - Tasking VX-toolset
 */

#ifndef TRICORE_INTRINSICS_H
#define TRICORE_INTRINSICS_H

#include <stdint.h>
#include "tc397xp_sfr.h"

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Compiler Detection
 * ========================================================================== */

#if defined(__GNUC__) && defined(__TRICORE__)
    #define TRICORE_GCC     1
#elif defined(__TASKING__)
    #define TRICORE_TASKING 1
#else
    #error "Unsupported compiler for TriCore"
#endif

/* ==========================================================================
 * CSFR Access (Core Special Function Registers)
 * ========================================================================== */

/**
 * @brief Read from Core Special Function Register
 * @param reg CSFR address (e.g., CSFR_PCXI, CSFR_PSW) - must be compile-time constant
 * @return Register value
 *
 * Note: Must be a macro to ensure reg is compile-time constant for "i" constraint
 */
#if defined(TRICORE_GCC)
#define __mfcr(reg) \
    __extension__({ \
        uint32_t __res; \
        __asm__ volatile("mfcr %0, %1" : "=d"(__res) : "i"(reg)); \
        __res; \
    })
#elif defined(TRICORE_TASKING)
/* Tasking has built-in __mfcr */
#endif

/**
 * @brief Write to Core Special Function Register
 * @param reg CSFR address - must be compile-time constant
 * @param value Value to write
 *
 * Note: Must be a macro to ensure reg is compile-time constant for "i" constraint
 */
#if defined(TRICORE_GCC)
#define __mtcr(reg, value) \
    do { \
        __asm__ volatile("mtcr %0, %1" : : "i"(reg), "d"(value)); \
    } while(0)
#elif defined(TRICORE_TASKING)
/* Tasking has built-in __mtcr */
#endif

/* ==========================================================================
 * Interrupt Control
 * ========================================================================== */

/**
 * @brief Disable interrupts globally
 */
#if defined(TRICORE_GCC)
static inline void __disable(void)
{
    __asm__ volatile("disable" ::: "memory");
}
#elif defined(TRICORE_TASKING)
#define __disable() __disable()
#endif

/**
 * @brief Enable interrupts globally
 */
#if defined(TRICORE_GCC)
static inline void __enable(void)
{
    __asm__ volatile("enable" ::: "memory");
}
#elif defined(TRICORE_TASKING)
#define __enable() __enable()
#endif

/**
 * @brief Restore interrupt state from ICR value
 * @param icr Previous ICR value (with IE bit)
 */
static inline void __restore_interrupts(uint32_t icr)
{
    if (icr & ICR_IE) {
        __enable();
    }
}

/**
 * @brief Save and disable interrupts
 * @return Previous ICR value
 */
static inline uint32_t __save_and_disable_interrupts(void)
{
    uint32_t icr = __mfcr(CSFR_ICR);
    __disable();
    return icr;
}

/* ==========================================================================
 * Memory Barriers
 * ========================================================================== */

/**
 * @brief Data synchronization barrier
 * Ensures all previous data accesses complete before continuing.
 */
#if defined(TRICORE_GCC)
static inline void __dsync(void)
{
    __asm__ volatile("dsync" ::: "memory");
}
#elif defined(TRICORE_TASKING)
#define __dsync() __dsync()
#endif

/**
 * @brief Instruction synchronization barrier
 * Ensures all previous instructions complete before continuing.
 */
#if defined(TRICORE_GCC)
static inline void __isync(void)
{
    __asm__ volatile("isync" ::: "memory");
}
#elif defined(TRICORE_TASKING)
#define __isync() __isync()
#endif

/**
 * @brief Combined data and instruction barrier
 */
static inline void __barrier(void)
{
    __dsync();
    __isync();
}

/* ==========================================================================
 * Debug and Power Management
 * ========================================================================== */

/**
 * @brief Debug halt (software breakpoint)
 */
#if defined(TRICORE_GCC)
static inline void __debug(void)
{
    __asm__ volatile("debug" ::: "memory");
}
#elif defined(TRICORE_TASKING)
#define __debug() __debug()
#endif

/**
 * @brief No operation
 */
#if defined(TRICORE_GCC)
static inline void __nop(void)
{
    __asm__ volatile("nop");
}
#elif defined(TRICORE_TASKING)
#define __nop() __nop()
#endif

/**
 * @brief Wait for interrupt (low-power idle)
 * Note: Not a standard TriCore instruction, simulate with NOP loop
 */
static inline void __wfi(void)
{
    /* TriCore doesn't have WFI like ARM; use IDLE mode via PMCON if needed */
    __nop();
}

/* ==========================================================================
 * Context Switch Instructions
 * ========================================================================== */

/**
 * @brief Save Lower Context to CSA
 * Saves D0-D7, A2-A7, A11 (RA) to current CSA.
 */
#if defined(TRICORE_GCC)
static inline void __svlcx(void)
{
    __asm__ volatile("svlcx" ::: "memory");
}
#elif defined(TRICORE_TASKING)
#define __svlcx() __svlcx()
#endif

/**
 * @brief Restore Lower Context from CSA
 * Restores D0-D7, A2-A7, A11 from previous CSA.
 */
#if defined(TRICORE_GCC)
static inline void __rslcx(void)
{
    __asm__ volatile("rslcx" ::: "memory");
}
#elif defined(TRICORE_TASKING)
#define __rslcx() __rslcx()
#endif

/**
 * @brief Return from Interrupt
 * Restores upper context and returns to interrupted code.
 */
#if defined(TRICORE_GCC)
static inline void __rfe(void)
{
    __asm__ volatile("rfe" ::: "memory");
}
#elif defined(TRICORE_TASKING)
#define __rfe() __rfe()
#endif

/**
 * @brief Begin Interrupt Service Routine
 * Allocates new CSA for lower context.
 */
#if defined(TRICORE_GCC)
static inline void __bisr(uint32_t priority)
{
    __asm__ volatile("bisr %0" : : "d"(priority) : "memory");
}
#elif defined(TRICORE_TASKING)
#define __bisr(priority) __bisr(priority)
#endif

/* ==========================================================================
 * Atomic Operations
 * ========================================================================== */

/**
 * @brief Swap register with memory atomically
 * @param ptr Memory address
 * @param value New value
 * @return Previous value at ptr
 */
#if defined(TRICORE_GCC)
static inline uint32_t __swap(volatile uint32_t *ptr, uint32_t value)
{
    uint32_t result;
    __asm__ volatile(
        "swap.w [%1]0, %0"
        : "=d"(result)
        : "a"(ptr), "0"(value)
        : "memory"
    );
    return result;
}
#elif defined(TRICORE_TASKING)
#define __swap(ptr, value) __swap(ptr, value)
#endif

/**
 * @brief Compare and swap atomically
 * If *ptr == expected, set *ptr = desired and return 1.
 * Otherwise, return 0.
 */
static inline int __cmpswap(volatile uint32_t *ptr, uint32_t expected, uint32_t desired)
{
    uint32_t prev = __swap(ptr, desired);
    if (prev == expected) {
        return 1;
    } else {
        /* Restore original if comparison failed */
        __swap(ptr, prev);
        return 0;
    }
}

/**
 * @brief Simple spinlock acquire using swap
 * @param lock Pointer to lock variable (0 = unlocked, 1 = locked)
 */
static inline void __spinlock_acquire(volatile uint32_t *lock)
{
    while (__swap(lock, 1) != 0) {
        /* Spin until we acquire the lock */
        __nop();
    }
    __dsync();  /* Ensure subsequent reads see updates from previous holder */
}

/**
 * @brief Spinlock release
 * @param lock Pointer to lock variable
 */
static inline void __spinlock_release(volatile uint32_t *lock)
{
    __dsync();  /* Ensure all writes complete before releasing */
    *lock = 0;
}

/* ==========================================================================
 * Bit Operations
 * ========================================================================== */

/**
 * @brief Count leading zeros
 */
#if defined(TRICORE_GCC)
static inline int __clz(uint32_t value)
{
    int result;
    __asm__ volatile("clz %0, %1" : "=d"(result) : "d"(value));
    return result;
}
#elif defined(TRICORE_TASKING)
#define __clz(value) __clz(value)
#endif

/**
 * @brief Count trailing zeros (use CLZ on reversed bits)
 */
static inline int __ctz(uint32_t value)
{
    if (value == 0) return 32;
    return 31 - __clz(value & -value);
}

/**
 * @brief Population count (number of set bits)
 */
static inline int __popcount(uint32_t value)
{
    /* Software implementation */
    value = value - ((value >> 1) & 0x55555555);
    value = (value & 0x33333333) + ((value >> 2) & 0x33333333);
    return (((value + (value >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
}

/* ==========================================================================
 * Saturating Arithmetic (TriCore has native support)
 * ========================================================================== */

/**
 * @brief Saturating addition (signed 32-bit)
 */
#if defined(TRICORE_GCC)
static inline int32_t __adds(int32_t a, int32_t b)
{
    int32_t result;
    __asm__ volatile("adds %0, %1, %2" : "=d"(result) : "d"(a), "d"(b));
    return result;
}
#elif defined(TRICORE_TASKING)
#define __adds(a, b) __adds(a, b)
#endif

/**
 * @brief Saturating subtraction (signed 32-bit)
 */
#if defined(TRICORE_GCC)
static inline int32_t __subs(int32_t a, int32_t b)
{
    int32_t result;
    __asm__ volatile("subs %0, %1, %2" : "=d"(result) : "d"(a), "d"(b));
    return result;
}
#elif defined(TRICORE_TASKING)
#define __subs(a, b) __subs(a, b)
#endif

/* ==========================================================================
 * Core Identification
 * ========================================================================== */

/**
 * @brief Get current CPU core ID (0-5 for TC397XP)
 */
static inline uint32_t __get_core_id(void)
{
    return __mfcr(CSFR_CORE_ID) & CORE_ID_MASK;
}

/**
 * @brief Get CPU ID (chip-level identification)
 */
static inline uint32_t __get_cpu_id(void)
{
    return __mfcr(CSFR_CPU_ID);
}

/* ==========================================================================
 * CSA (Context Save Area) Access
 * ========================================================================== */

/**
 * @brief Get current PCXI (Previous Context Information)
 */
static inline uint32_t __get_pcxi(void)
{
    return __mfcr(CSFR_PCXI);
}

/**
 * @brief Set PCXI
 */
static inline void __set_pcxi(uint32_t pcxi)
{
    __mtcr(CSFR_PCXI, pcxi);
    __isync();
}

/**
 * @brief Get FCX (Free CSA List Head)
 */
static inline uint32_t __get_fcx(void)
{
    return __mfcr(CSFR_FCX);
}

/**
 * @brief Set FCX
 */
static inline void __set_fcx(uint32_t fcx)
{
    __mtcr(CSFR_FCX, fcx);
    __isync();
}

/**
 * @brief Get LCX (Free CSA List Limit)
 */
static inline uint32_t __get_lcx(void)
{
    return __mfcr(CSFR_LCX);
}

/**
 * @brief Set LCX
 */
static inline void __set_lcx(uint32_t lcx)
{
    __mtcr(CSFR_LCX, lcx);
    __isync();
}

/* ==========================================================================
 * Program Status Word Access
 * ========================================================================== */

/**
 * @brief Get PSW
 */
static inline uint32_t __get_psw(void)
{
    return __mfcr(CSFR_PSW);
}

/**
 * @brief Set PSW
 */
static inline void __set_psw(uint32_t psw)
{
    __mtcr(CSFR_PSW, psw);
    __isync();
}

/**
 * @brief Check if in supervisor mode
 */
static inline int __is_supervisor_mode(void)
{
    uint32_t psw = __get_psw();
    return ((psw & PSW_IO_MASK) >> PSW_IO_SHIFT) == PSW_IO_SUPERVISOR;
}

/* ==========================================================================
 * Stack Pointer Access
 * ========================================================================== */

/**
 * @brief Get current stack pointer (A10)
 */
#if defined(TRICORE_GCC)
static inline uint32_t __get_sp(void)
{
    uint32_t sp;
    __asm__ volatile("mov.d %0, a10" : "=d"(sp));
    return sp;
}
#endif

/**
 * @brief Set stack pointer (A10)
 */
#if defined(TRICORE_GCC)
static inline void __set_sp(uint32_t sp)
{
    __asm__ volatile("mov.a a10, %0" : : "d"(sp));
}
#endif

#ifdef __cplusplus
}
#endif

#endif /* TRICORE_INTRINSICS_H */
