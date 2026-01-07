/**
 * @file hal.h
 * @brief ek-kor Hardware Abstraction Layer Interface
 *
 * Platform-independent HAL interface. Each platform must implement
 * these functions (hal_stm32.c, hal_tc397xp.c, hal_sim.c).
 */

#ifndef EKK_HAL_H
#define EKK_HAL_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Initialization
 * ========================================================================== */

/**
 * @brief Initialize HAL layer
 *
 * Called once during system startup (from CPU0/boot core).
 *
 * @return 0 on success, negative on error
 */
int ekk_hal_init(void);

/**
 * @brief Per-core HAL initialization
 *
 * Called on each core during startup.
 *
 * @param core_id Core identifier
 * @return 0 on success, negative on error
 */
int ekk_hal_init_core(uint32_t core_id);

/* ==========================================================================
 * Core Identification
 * ========================================================================== */

/**
 * @brief Get current core ID
 * @return Core ID (0 on single-core systems)
 */
uint32_t ekk_hal_get_core_id(void);

/**
 * @brief Get number of active cores
 * @return Number of cores configured
 */
uint32_t ekk_hal_get_core_count(void);

/**
 * @brief Check if running on boot core
 * @return true if current core is boot core (CPU0)
 */
bool ekk_hal_is_boot_core(void);

/* ==========================================================================
 * Interrupt Control
 * ========================================================================== */

/**
 * @brief Disable interrupts on current core
 * @return Previous interrupt state (to pass to restore)
 */
uint32_t ekk_hal_disable_interrupts(void);

/**
 * @brief Enable interrupts on current core
 */
void ekk_hal_enable_interrupts(void);

/**
 * @brief Restore interrupt state
 * @param state Previous interrupt state
 */
void ekk_hal_restore_interrupts(uint32_t state);

/**
 * @brief Check if interrupts are enabled
 * @return true if enabled
 */
bool ekk_hal_interrupts_enabled(void);

/* ==========================================================================
 * Critical Sections
 * ========================================================================== */

/**
 * @brief Enter critical section (disable preemption)
 * @return Nesting count
 */
uint32_t ekk_hal_enter_critical(void);

/**
 * @brief Exit critical section
 * @return Nesting count after exit
 */
uint32_t ekk_hal_exit_critical(void);

/**
 * @brief Check if in critical section
 * @return true if currently in critical section
 */
bool ekk_hal_in_critical(void);

/* ==========================================================================
 * Time Functions
 * ========================================================================== */

/**
 * @brief Get system time in microseconds
 * @return Time in microseconds
 */
uint32_t ekk_hal_get_time_us(void);

/**
 * @brief Get system time in milliseconds
 * @return Time in milliseconds
 */
uint32_t ekk_hal_get_time_ms(void);

/**
 * @brief Get 64-bit system time in microseconds
 * @return Time in microseconds
 */
uint64_t ekk_hal_get_time_us64(void);

/**
 * @brief Delay for specified microseconds (busy-wait)
 * @param us Microseconds to delay
 */
void ekk_hal_delay_us(uint32_t us);

/**
 * @brief Delay for specified milliseconds (busy-wait)
 * @param ms Milliseconds to delay
 */
void ekk_hal_delay_ms(uint32_t ms);

/* ==========================================================================
 * System Tick
 * ========================================================================== */

/**
 * @brief System tick callback type
 */
typedef void (*ekk_hal_systick_cb_t)(void);

/**
 * @brief Initialize system tick timer
 * @param callback Function to call on each tick
 * @return 0 on success
 */
int ekk_hal_systick_init(ekk_hal_systick_cb_t callback);

/**
 * @brief Get current tick count
 * @return Number of ticks since boot
 */
uint32_t ekk_hal_get_tick_count(void);

/**
 * @brief Get tick period in microseconds
 * @return Microseconds per tick
 */
uint32_t ekk_hal_get_tick_period_us(void);

/* ==========================================================================
 * Context Switching
 * ========================================================================== */

/**
 * @brief Trigger context switch
 *
 * Schedules a context switch at the next safe point.
 */
void ekk_hal_trigger_context_switch(void);

/**
 * @brief Start first task
 *
 * Called to start the first task. Does not return.
 *
 * @param stack_ptr Initial stack pointer for task
 * @param entry Task entry point
 */
void ekk_hal_start_first_task(void *stack_ptr, void (*entry)(void));

/**
 * @brief Perform context switch
 *
 * @param current_sp Pointer to current stack pointer (saved here)
 * @param next_sp Next task's stack pointer
 */
void ekk_hal_context_switch(void **current_sp, void *next_sp);

/* ==========================================================================
 * Memory Barriers
 * ========================================================================== */

/**
 * @brief Data memory barrier
 */
void ekk_hal_memory_barrier(void);

/**
 * @brief Instruction synchronization barrier
 */
void ekk_hal_instruction_barrier(void);

/**
 * @brief Data synchronization barrier
 */
void ekk_hal_data_sync_barrier(void);

/* ==========================================================================
 * Idle / Sleep
 * ========================================================================== */

/**
 * @brief Enter idle state (low-power wait for interrupt)
 */
void ekk_hal_idle(void);

/**
 * @brief Enter sleep state
 * @param mode Sleep mode (0 = lightest)
 */
void ekk_hal_sleep(uint32_t mode);

/* ==========================================================================
 * Debug Support
 * ========================================================================== */

/**
 * @brief Debug breakpoint
 */
void ekk_hal_debug_break(void);

/**
 * @brief Output debug character
 * @param c Character to output
 */
void ekk_hal_debug_putc(char c);

/**
 * @brief Output debug string
 * @param s Null-terminated string
 */
void ekk_hal_debug_puts(const char *s);

/**
 * @brief Output debug hex value
 * @param value Value to print
 */
void ekk_hal_debug_hex(uint32_t value);

/* ==========================================================================
 * Watchdog
 * ========================================================================== */

/**
 * @brief Initialize watchdog timer
 * @param timeout_ms Timeout in milliseconds
 * @return 0 on success
 */
int ekk_hal_watchdog_init(uint32_t timeout_ms);

/**
 * @brief Reset (kick) watchdog timer
 */
void ekk_hal_watchdog_reset(void);

/**
 * @brief Disable watchdog (if allowed)
 */
void ekk_hal_watchdog_disable(void);

/* ==========================================================================
 * System Reset
 * ========================================================================== */

/**
 * @brief Perform system reset
 */
void ekk_hal_system_reset(void);

/**
 * @brief Get reset reason
 * @return Platform-specific reset reason bits
 */
uint32_t ekk_hal_get_reset_reason(void);

/* ==========================================================================
 * Stack Checking
 * ========================================================================== */

/**
 * @brief Get current stack pointer
 * @return Stack pointer value
 */
void* ekk_hal_get_stack_ptr(void);

/**
 * @brief Check stack for overflow
 * @param stack_bottom Bottom of stack area
 * @param stack_size Stack size in bytes
 * @return true if stack OK, false if overflow
 */
bool ekk_hal_check_stack(void *stack_bottom, uint32_t stack_size);

/* ==========================================================================
 * Memory Protection Unit (MPU)
 * ========================================================================== */

/* Forward declaration */
struct ekk_tcb;

/**
 * @brief Initialize MPU hardware
 * @return 0 on success, negative on error
 */
int ekk_hal_mpu_init(void);

/**
 * @brief Get number of MPU regions supported by hardware
 * @return Number of regions (0 if MPU not supported)
 */
uint8_t ekk_hal_mpu_get_region_count(void);

/**
 * @brief Configure an MPU region
 * @param region Region number
 * @param base Base address (must be aligned)
 * @param size Size in bytes (must be power of 2)
 * @param access Access permissions
 * @param attr Memory attributes
 * @return 0 on success
 */
int ekk_hal_mpu_configure_region(uint8_t region, void *base, uint32_t size,
                                  uint8_t access, uint8_t attr);

/**
 * @brief Enable MPU region
 * @param region Region number
 */
void ekk_hal_mpu_enable_region(uint8_t region);

/**
 * @brief Disable MPU region
 * @param region Region number
 */
void ekk_hal_mpu_disable_region(uint8_t region);

/**
 * @brief Enable MPU globally
 */
void ekk_hal_mpu_enable(void);

/**
 * @brief Disable MPU globally
 */
void ekk_hal_mpu_disable(void);

/**
 * @brief Load MPU configuration for a task
 * @param tcb Task control block with MPU regions
 */
void ekk_hal_mpu_load_task_regions(const struct ekk_tcb *tcb);

/* ==========================================================================
 * Privilege Control
 * ========================================================================== */

/**
 * @brief Enter user (unprivileged) mode
 */
void ekk_hal_enter_user_mode(void);

/**
 * @brief Enter privileged (supervisor) mode
 */
void ekk_hal_enter_privileged_mode(void);

/**
 * @brief Check if currently in privileged mode
 * @return true if privileged
 */
bool ekk_hal_is_privileged(void);

/* ==========================================================================
 * Fault Handling
 * ========================================================================== */

/**
 * @brief Fault handler callback type
 * @param fault_type Type of fault
 * @param fault_addr Faulting address (if applicable)
 */
typedef void (*ekk_hal_fault_handler_t)(uint32_t fault_type, void *fault_addr);

/**
 * @brief Register fault handler
 * @param handler Fault handler function
 */
void ekk_hal_register_fault_handler(ekk_hal_fault_handler_t handler);

/**
 * @brief Get last fault address
 * @return Faulting address
 */
void* ekk_hal_get_fault_address(void);

/**
 * @brief Get last fault status
 * @return Platform-specific fault status
 */
uint32_t ekk_hal_get_fault_status(void);

/**
 * @brief Clear fault status
 */
void ekk_hal_clear_fault_status(void);

/* ==========================================================================
 * Inter-Processor Interrupt (IPI)
 * ========================================================================== */

/**
 * @brief IPI callback type
 */
typedef void (*ekk_hal_ipi_handler_t)(uint32_t sender_core, uint32_t msg);

/**
 * @brief Initialize IPI subsystem
 * @return 0 on success
 */
int ekk_hal_ipi_init(void);

/**
 * @brief Register IPI handler
 * @param handler IPI handler function
 */
void ekk_hal_ipi_register_handler(ekk_hal_ipi_handler_t handler);

/**
 * @brief Send IPI to specific core
 * @param target_core Target core ID
 * @param msg Message value (platform-specific)
 * @return 0 on success
 */
int ekk_hal_ipi_send(uint32_t target_core, uint32_t msg);

/**
 * @brief Send IPI to all other cores
 * @param msg Message value
 * @return Number of cores notified
 */
uint32_t ekk_hal_ipi_broadcast(uint32_t msg);

/**
 * @brief Acknowledge IPI (call from IPI handler)
 */
void ekk_hal_ipi_ack(void);

#ifdef __cplusplus
}
#endif

#endif /* EKK_HAL_H */
