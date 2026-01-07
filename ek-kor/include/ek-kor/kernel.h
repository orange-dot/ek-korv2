/**
 * @file kernel.h
 * @brief ek-kor Kernel API
 *
 * Main kernel initialization, startup, and control functions.
 */

#ifndef EKK_KERNEL_H
#define EKK_KERNEL_H

#include <ek-kor/types.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Kernel Initialization
 * ========================================================================== */

/**
 * @brief Initialize ek-kor kernel
 *
 * Must be called before any other kernel functions.
 * On multi-core systems, call from CPU0 (boot core).
 *
 * @return EKK_OK on success
 */
ekk_err_t ekk_init(void);

/**
 * @brief Start the kernel scheduler
 *
 * Called after tasks are created. This function does not return.
 * On multi-core systems, call from each core after core-local init.
 */
EKK_NORETURN void ekk_start(void);

/* ==========================================================================
 * Kernel Information
 * ========================================================================== */

/**
 * @brief Get kernel version string
 * @return Version string (e.g., "1.0.0")
 */
const char* ekk_version(void);

/**
 * @brief Get kernel state
 * @return Current kernel state
 */
ekk_state_t ekk_get_state(void);

/**
 * @brief Get current tick count
 * @return Tick count
 */
ekk_tick_t ekk_get_ticks(void);

/**
 * @brief Get current time in microseconds
 * @return Time in microseconds
 */
ekk_time_us_t ekk_get_time_us(void);

/**
 * @brief Get system statistics
 * @param stats Output: statistics structure
 * @return EKK_OK on success
 */
ekk_err_t ekk_get_stats(ekk_stats_t *stats);

/* ==========================================================================
 * Time Conversions
 * ========================================================================== */

/**
 * @brief Convert ticks to milliseconds
 */
ekk_time_ms_t ekk_ticks_to_ms(ekk_tick_t ticks);

/**
 * @brief Convert milliseconds to ticks
 */
ekk_tick_t ekk_ms_to_ticks(ekk_time_ms_t ms);

/**
 * @brief Convert microseconds to ticks
 */
ekk_tick_t ekk_us_to_ticks(ekk_time_us_t us);

/* ==========================================================================
 * Critical Sections
 * ========================================================================== */

/**
 * @brief Check if in ISR context
 * @return true if in interrupt handler
 */
bool ekk_in_isr(void);

/**
 * @brief Enter critical section
 */
void ekk_enter_critical(void);

/**
 * @brief Exit critical section
 */
void ekk_exit_critical(void);

/* ==========================================================================
 * Error Handling
 * ========================================================================== */

/**
 * @brief Kernel panic
 *
 * Called on unrecoverable error. Does not return.
 *
 * @param msg Error message
 */
EKK_NORETURN void ekk_panic(const char *msg);

/**
 * @brief Deadline miss hook
 *
 * Called when a task misses its deadline.
 * Override with weak linkage for custom handling.
 *
 * @param task Task that missed deadline
 * @param overrun Overrun in microseconds
 */
void ekk_deadline_miss_hook(ekk_task_t task, uint32_t overrun);

/**
 * @brief Stack overflow hook
 *
 * Called when stack overflow detected.
 *
 * @param task Task with overflow
 */
void ekk_stack_overflow_hook(ekk_task_t task);

/* ==========================================================================
 * Debug Support
 * ========================================================================== */

#ifdef EKK_DEBUG

#define EKK_ASSERT(cond) do { \
    if (!(cond)) { \
        ekk_panic("Assert: " #cond); \
    } \
} while(0)

#else

#define EKK_ASSERT(cond) ((void)0)

#endif

#ifdef __cplusplus
}
#endif

#endif /* EKK_KERNEL_H */
