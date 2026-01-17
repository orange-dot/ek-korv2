/**
 * @file hal.h
 * @brief Hardware Abstraction Layer Interface
 *
 * Platform-independent interface for JEZGRO kernel.
 * This header defines the HAL API that each platform must implement.
 *
 * TC397XP implementation in hal_tc397xp.c
 */

#ifndef HAL_H
#define HAL_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Configuration
 * ========================================================================== */

/* Maximum number of CPU cores */
#define HAL_MAX_CORES           6

/* System tick frequency */
#define HAL_SYSTICK_FREQ_HZ     1000    /* 1 kHz = 1ms tick */

/* ==========================================================================
 * Initialization
 * ========================================================================== */

/**
 * @brief Initialize HAL layer
 *
 * Called once during system startup (from CPU0).
 * Initializes:
 *   - System timer (STM)
 *   - GPIO for debug LEDs (if available)
 *   - Any other platform hardware
 *
 * @return 0 on success, negative on error
 */
int hal_init(void);

/**
 * @brief Per-core HAL initialization
 *
 * Called on each core during startup.
 * Initializes per-core resources (systick, etc.).
 *
 * @param core_id Core identifier
 * @return 0 on success, negative on error
 */
int hal_init_core(uint32_t core_id);

/* ==========================================================================
 * Core Identification
 * ========================================================================== */

/**
 * @brief Get current core ID
 * @return Core ID (0 to HAL_MAX_CORES-1)
 */
uint32_t hal_get_core_id(void);

/**
 * @brief Get number of active cores
 * @return Number of cores configured
 */
uint32_t hal_get_core_count(void);

/**
 * @brief Check if running on boot core
 * @return true if current core is boot core (CPU0)
 */
bool hal_is_boot_core(void);

/* ==========================================================================
 * Interrupt Control
 * ========================================================================== */

/**
 * @brief Disable interrupts on current core
 *
 * Must be paired with hal_restore_interrupts().
 *
 * @return Previous interrupt state (to pass to restore)
 */
uint32_t hal_disable_interrupts(void);

/**
 * @brief Enable interrupts on current core
 */
void hal_enable_interrupts(void);

/**
 * @brief Restore interrupt state
 *
 * Restores interrupt state returned by hal_disable_interrupts().
 *
 * @param state Previous interrupt state
 */
void hal_restore_interrupts(uint32_t state);

/**
 * @brief Check if interrupts are enabled
 * @return true if enabled
 */
bool hal_interrupts_enabled(void);

/* ==========================================================================
 * Critical Sections
 * ========================================================================== */

/**
 * @brief Enter critical section (disable preemption)
 *
 * Disables interrupts and prevents context switches.
 * Can be nested. Must be paired with hal_exit_critical().
 *
 * @return Nesting count (for debugging)
 */
uint32_t hal_enter_critical(void);

/**
 * @brief Exit critical section
 *
 * Re-enables interrupts if nesting count reaches zero.
 *
 * @return Nesting count after exit
 */
uint32_t hal_exit_critical(void);

/**
 * @brief Check if in critical section
 * @return true if currently in critical section
 */
bool hal_in_critical(void);

/* ==========================================================================
 * Time Functions
 * ========================================================================== */

/**
 * @brief Get system time in microseconds
 *
 * Uses STM timer. Wraps every ~71 minutes at 1MHz.
 *
 * @return Time in microseconds
 */
uint32_t hal_get_time_us(void);

/**
 * @brief Get system time in milliseconds
 * @return Time in milliseconds
 */
uint32_t hal_get_time_ms(void);

/**
 * @brief Get 64-bit system time in microseconds
 *
 * Full 64-bit timer for long-running applications.
 *
 * @return Time in microseconds
 */
uint64_t hal_get_time_us64(void);

/**
 * @brief Delay for specified microseconds
 *
 * Busy-wait delay. For short delays only.
 *
 * @param us Microseconds to delay
 */
void hal_delay_us(uint32_t us);

/**
 * @brief Delay for specified milliseconds
 * @param ms Milliseconds to delay
 */
void hal_delay_ms(uint32_t ms);

/* ==========================================================================
 * System Tick
 * ========================================================================== */

/**
 * @brief System tick callback type
 */
typedef void (*hal_systick_callback_t)(void);

/**
 * @brief Initialize system tick timer
 *
 * Configures per-core periodic interrupt at HAL_SYSTICK_FREQ_HZ.
 *
 * @param callback Function to call on each tick
 * @return 0 on success
 */
int hal_systick_init(hal_systick_callback_t callback);

/**
 * @brief Get current tick count
 * @return Number of ticks since boot
 */
uint32_t hal_get_tick_count(void);

/**
 * @brief Get tick period in microseconds
 * @return Microseconds per tick
 */
uint32_t hal_get_tick_period_us(void);

/* ==========================================================================
 * Context Switching
 * ========================================================================== */

/**
 * @brief Trigger context switch (PendSV equivalent)
 *
 * Schedules a context switch at the next safe point.
 * On TriCore, this triggers a software interrupt.
 */
void hal_trigger_context_switch(void);

/**
 * @brief Start first task
 *
 * Called to start the first task. Does not return.
 *
 * @param stack_ptr Initial stack pointer for task
 * @param entry Task entry point
 */
void hal_start_first_task(void *stack_ptr, void (*entry)(void));

/**
 * @brief Perform context switch
 *
 * Saves current context and loads new context.
 * Platform-specific implementation.
 *
 * @param current_sp Pointer to current stack pointer (saved here)
 * @param next_sp Next task's stack pointer
 */
void hal_context_switch(void **current_sp, void *next_sp);

/* ==========================================================================
 * Memory Barriers
 * ========================================================================== */

/**
 * @brief Data memory barrier
 *
 * Ensures all data memory accesses complete before continuing.
 */
void hal_memory_barrier(void);

/**
 * @brief Instruction synchronization barrier
 *
 * Ensures instruction pipeline is flushed.
 */
void hal_instruction_barrier(void);

/**
 * @brief Data synchronization barrier
 *
 * Ensures all memory transactions complete.
 */
void hal_data_sync_barrier(void);

/* ==========================================================================
 * Idle / Sleep
 * ========================================================================== */

/**
 * @brief Enter idle state
 *
 * Low-power wait for interrupt. Returns on any interrupt.
 */
void hal_idle(void);

/**
 * @brief Enter sleep state
 *
 * Deeper sleep mode. May require specific wake sources.
 *
 * @param mode Sleep mode (0 = lightest, higher = deeper)
 */
void hal_sleep(uint32_t mode);

/* ==========================================================================
 * Debug Support
 * ========================================================================== */

/**
 * @brief Debug breakpoint
 *
 * Triggers debugger breakpoint if attached.
 */
void hal_debug_break(void);

/**
 * @brief Output debug character
 *
 * Sends character to debug output (UART, semihosting, etc.).
 *
 * @param c Character to output
 */
void hal_debug_putc(char c);

/**
 * @brief Output debug string
 * @param s Null-terminated string
 */
void hal_debug_puts(const char *s);

/**
 * @brief Output debug hex value
 * @param value Value to print
 */
void hal_debug_hex(uint32_t value);

/* ==========================================================================
 * Watchdog
 * ========================================================================== */

/**
 * @brief Initialize watchdog timer
 *
 * @param timeout_ms Timeout in milliseconds
 * @return 0 on success
 */
int hal_watchdog_init(uint32_t timeout_ms);

/**
 * @brief Reset (kick) watchdog timer
 */
void hal_watchdog_reset(void);

/**
 * @brief Disable watchdog (if allowed)
 */
void hal_watchdog_disable(void);

/* ==========================================================================
 * System Reset
 * ========================================================================== */

/**
 * @brief Perform system reset
 */
void hal_system_reset(void);

/**
 * @brief Get reset reason
 * @return Platform-specific reset reason bits
 */
uint32_t hal_get_reset_reason(void);

/* ==========================================================================
 * Stack Checking
 * ========================================================================== */

/**
 * @brief Get current stack pointer
 * @return Stack pointer value
 */
void* hal_get_stack_ptr(void);

/**
 * @brief Check stack for overflow
 *
 * @param stack_bottom Bottom of stack area
 * @param stack_size Stack size in bytes
 * @return true if stack OK, false if overflow detected
 */
bool hal_check_stack(void *stack_bottom, uint32_t stack_size);

/* ==========================================================================
 * Platform-Specific Extensions
 * ========================================================================== */

#ifdef HAL_TC397XP

/**
 * @brief Get STM timer value
 * @param stm_id STM module ID (0-5, one per core)
 * @return 32-bit timer value
 */
uint32_t hal_tc_get_stm(uint32_t stm_id);

/**
 * @brief Get STM 64-bit value
 * @param stm_id STM module ID
 * @return 64-bit timer value
 */
uint64_t hal_tc_get_stm64(uint32_t stm_id);

/**
 * @brief Setup STM compare match
 * @param stm_id STM module ID
 * @param cmp_id Compare register (0 or 1)
 * @param value Compare value
 * @param callback Function to call on match
 * @return 0 on success
 */
int hal_tc_stm_compare(uint32_t stm_id, uint32_t cmp_id, uint32_t value,
                       void (*callback)(void));

#endif /* HAL_TC397XP */

#ifdef __cplusplus
}
#endif

#endif /* HAL_H */
