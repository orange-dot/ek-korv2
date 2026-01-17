/**
 * @file jezgro_compat.h
 * @brief JEZGRO Compatibility Layer
 *
 * This header provides a unified API that works on both:
 *   - STM32G474 (single-core)
 *   - TC397XP (6-core)
 *
 * Application code should include this header instead of platform-specific
 * headers for maximum portability.
 *
 * Usage:
 *   #include "jezgro_compat.h"
 *
 *   void my_task(void *arg) {
 *       while (1) {
 *           // Do work
 *           jz_task_delay(jz_ms_to_ticks(100));
 *       }
 *   }
 *
 *   int main(void) {
 *       jz_init();
 *       jz_task_create_simple("mytask", my_task, NULL, 128, 1024);
 *       jz_start();
 *   }
 */

#ifndef JEZGRO_COMPAT_H
#define JEZGRO_COMPAT_H

#include "jezgro_common.h"

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Platform-Specific Includes
 * ========================================================================== */

#if defined(JEZGRO_PLATFORM_TRICORE)
    /* TriCore includes */
    #include "kernel/jezgro.h"
    #include "kernel/scheduler.h"
    #include "kernel/task.h"
    #include "kernel/sync.h"
    #include "kernel/ipc.h"
    #include "hal/hal.h"
#elif defined(JEZGRO_PLATFORM_STM32) || defined(JEZGRO_PLATFORM_SIM)
    /* STM32/Simulation includes */
    #include "kernel/jezgro.h"
    #include "hal/hal.h"
#endif

/* ==========================================================================
 * Kernel API (Unified)
 * ========================================================================== */

/**
 * @brief Initialize JEZGRO kernel
 * @return JEZGRO_OK on success
 */
static inline jezgro_err_t jz_init(void)
{
#if defined(JEZGRO_PLATFORM_TRICORE)
    return jezgro_init();
#else
    int ret = jezgro_init();
    return (ret == 0) ? JEZGRO_OK : JEZGRO_ERROR;
#endif
}

/**
 * @brief Start JEZGRO scheduler
 *
 * This function does not return.
 */
static inline void jz_start(void)
{
    jezgro_start();
}

/**
 * @brief Get current tick count
 * @return Tick count since boot
 */
static inline jezgro_tick_t jz_get_ticks(void)
{
    return jezgro_get_ticks();
}

/**
 * @brief Convert milliseconds to ticks
 */
static inline jezgro_tick_t jz_ms_to_ticks(jezgro_time_ms_t ms)
{
#if defined(JEZGRO_PLATFORM_TRICORE)
    return jezgro_ms_to_ticks(ms);
#else
    return ms;  /* Assuming 1kHz tick rate */
#endif
}

/**
 * @brief Convert ticks to milliseconds
 */
static inline jezgro_time_ms_t jz_ticks_to_ms(jezgro_tick_t ticks)
{
#if defined(JEZGRO_PLATFORM_TRICORE)
    return jezgro_ticks_to_ms(ticks);
#else
    return ticks;  /* Assuming 1kHz tick rate */
#endif
}

/**
 * @brief Get current time in microseconds
 */
static inline jezgro_time_us_t jz_get_time_us(void)
{
#if defined(JEZGRO_PLATFORM_TRICORE)
    return jezgro_get_time_us();
#else
    return hal_get_time_us();
#endif
}

/**
 * @brief Kernel panic - unrecoverable error
 */
static inline void jz_panic(const char *msg)
{
    jezgro_panic(msg);
}

/* ==========================================================================
 * Task API (Unified)
 * ========================================================================== */

/**
 * @brief Create a task with full configuration
 *
 * @param config Task configuration
 * @param handle Output: task handle (can be NULL)
 * @return JEZGRO_OK on success
 */
static inline jezgro_err_t jz_task_create(const jezgro_task_config_t *config,
                                          jezgro_task_handle_t *handle)
{
#if defined(JEZGRO_PLATFORM_TRICORE)
    task_params_t params = JEZGRO_TASK_PARAMS_DEFAULT;
    params.name = config->name;
    params.func = config->func;
    params.arg = config->arg;
    params.priority = config->priority;
    params.stack_size = config->stack_size;
    params.stack_base = config->stack_base;
    params.period_us = config->period_us;
    params.deadline_us = config->deadline_us;
    params.core_affinity = config->core_affinity;
    params.flags = (task_flags_t)config->flags;

    task_handle_t h = NULL;
    jezgro_error_t err = task_create(&params, &h);
    if (handle) *handle = (jezgro_task_handle_t)h;
    return (jezgro_err_t)err;
#else
    /* STM32 implementation - allocate TCB and create task */
    static task_t task_pool[JEZGRO_MAX_TASKS];
    static uint32_t task_pool_index = 0;

    if (task_pool_index >= JEZGRO_MAX_TASKS) {
        return JEZGRO_ERROR_NOMEM;
    }

    task_t *task = &task_pool[task_pool_index++];
    task->name = config->name;
    task->func = config->func;
    task->arg = config->arg;
    task->base_priority = config->priority;
    task->period = config->period_us / 1000;  /* Convert to ticks */
    task->wcet = 0;
    task->stack_size = config->stack_size;

    int ret = task_create_static(task, config->name, config->func,
                                  config->arg, config->priority,
                                  config->stack_size);
    if (handle) *handle = (jezgro_task_handle_t)task;
    return (ret == 0) ? JEZGRO_OK : JEZGRO_ERROR;
#endif
}

/**
 * @brief Create a task (simplified)
 *
 * @param name Task name
 * @param func Entry function
 * @param arg Argument
 * @param priority Priority (0-255)
 * @param stack_size Stack size in bytes
 * @return JEZGRO_OK on success
 */
static inline jezgro_err_t jz_task_create_simple(const char *name,
                                                  jezgro_task_func_t func,
                                                  void *arg,
                                                  uint8_t priority,
                                                  uint32_t stack_size)
{
    jezgro_task_config_t config = JEZGRO_TASK_CONFIG_DEFAULT;
    config.name = name;
    config.func = func;
    config.arg = arg;
    config.priority = priority;
    config.stack_size = stack_size;
    return jz_task_create(&config, NULL);
}

/**
 * @brief Delay current task
 *
 * @param ticks Ticks to delay
 */
static inline void jz_task_delay(jezgro_tick_t ticks)
{
#if defined(JEZGRO_PLATFORM_TRICORE)
    task_delay(ticks);
#else
    task_delay(ticks);
#endif
}

/**
 * @brief Delay until absolute tick (for periodic tasks)
 *
 * @param prev_wake Previous wake time (updated on return)
 * @param period Period in ticks
 */
static inline void jz_task_delay_until(jezgro_tick_t *prev_wake, jezgro_tick_t period)
{
#if defined(JEZGRO_PLATFORM_TRICORE)
    task_delay_until(prev_wake, period);
#else
    task_delay_until(prev_wake, period);
#endif
}

/**
 * @brief Yield current task
 */
static inline void jz_task_yield(void)
{
#if defined(JEZGRO_PLATFORM_TRICORE)
    task_yield();
#else
    scheduler_yield();
#endif
}

/**
 * @brief Get current task handle
 */
static inline jezgro_task_handle_t jz_task_get_current(void)
{
#if defined(JEZGRO_PLATFORM_TRICORE)
    return (jezgro_task_handle_t)task_get_current();
#else
    return (jezgro_task_handle_t)scheduler_get_current();
#endif
}

/**
 * @brief Suspend a task
 */
static inline jezgro_err_t jz_task_suspend(jezgro_task_handle_t handle)
{
#if defined(JEZGRO_PLATFORM_TRICORE)
    return (jezgro_err_t)task_suspend((task_handle_t)handle);
#else
    task_t *task = (task_t *)handle;
    task->state = TASK_STATE_SUSPENDED;
    return JEZGRO_OK;
#endif
}

/**
 * @brief Resume a suspended task
 */
static inline jezgro_err_t jz_task_resume(jezgro_task_handle_t handle)
{
#if defined(JEZGRO_PLATFORM_TRICORE)
    return (jezgro_err_t)task_resume((task_handle_t)handle);
#else
    task_t *task = (task_t *)handle;
    task->state = TASK_STATE_READY;
    return JEZGRO_OK;
#endif
}

/* ==========================================================================
 * Scheduler API (Unified)
 * ========================================================================== */

/**
 * @brief Lock scheduler (disable preemption)
 */
static inline void jz_scheduler_lock(void)
{
    scheduler_lock();
}

/**
 * @brief Unlock scheduler
 */
static inline void jz_scheduler_unlock(void)
{
    scheduler_unlock();
}

/* ==========================================================================
 * Critical Sections (Unified)
 * ========================================================================== */

/**
 * @brief Enter critical section (disable interrupts)
 * @return Previous interrupt state
 */
static inline uint32_t jz_enter_critical(void)
{
    return hal_disable_interrupts();
}

/**
 * @brief Exit critical section
 * @param state State from jz_enter_critical()
 */
static inline void jz_exit_critical(uint32_t state)
{
    hal_restore_interrupts(state);
}

/* ==========================================================================
 * Synchronization API (Unified)
 * ========================================================================== */

#if defined(JEZGRO_PLATFORM_TRICORE)

/**
 * @brief Create a mutex
 */
static inline jezgro_err_t jz_mutex_create(jezgro_mutex_t *mutex, const char *name)
{
    return (jezgro_err_t)sync_mutex_create((sync_mutex_t *)mutex, name);
}

/**
 * @brief Lock a mutex
 */
static inline jezgro_err_t jz_mutex_lock(jezgro_mutex_t mutex, jezgro_tick_t timeout)
{
    return (jezgro_err_t)sync_mutex_lock((sync_mutex_t *)mutex, timeout);
}

/**
 * @brief Unlock a mutex
 */
static inline jezgro_err_t jz_mutex_unlock(jezgro_mutex_t mutex)
{
    return (jezgro_err_t)sync_mutex_unlock((sync_mutex_t *)mutex);
}

/**
 * @brief Create a semaphore
 */
static inline jezgro_err_t jz_sem_create(jezgro_sem_t *sem, const char *name, uint32_t initial)
{
    return (jezgro_err_t)sync_sem_create((sync_semaphore_t *)sem, name, initial, 0xFFFFFFFF);
}

/**
 * @brief Wait on semaphore
 */
static inline jezgro_err_t jz_sem_wait(jezgro_sem_t sem, jezgro_tick_t timeout)
{
    return (jezgro_err_t)sync_sem_wait((sync_semaphore_t *)sem, timeout);
}

/**
 * @brief Signal semaphore
 */
static inline jezgro_err_t jz_sem_signal(jezgro_sem_t sem)
{
    return (jezgro_err_t)sync_sem_signal((sync_semaphore_t *)sem);
}

#else /* STM32 */

/* STM32 sync primitives - simplified stubs */
static inline jezgro_err_t jz_mutex_create(jezgro_mutex_t *mutex, const char *name)
{
    (void)name;
    *mutex = NULL;  /* TODO: implement */
    return JEZGRO_OK;
}

static inline jezgro_err_t jz_mutex_lock(jezgro_mutex_t mutex, jezgro_tick_t timeout)
{
    (void)mutex; (void)timeout;
    return JEZGRO_OK;  /* TODO: implement */
}

static inline jezgro_err_t jz_mutex_unlock(jezgro_mutex_t mutex)
{
    (void)mutex;
    return JEZGRO_OK;  /* TODO: implement */
}

static inline jezgro_err_t jz_sem_create(jezgro_sem_t *sem, const char *name, uint32_t initial)
{
    (void)name; (void)initial;
    *sem = NULL;  /* TODO: implement */
    return JEZGRO_OK;
}

static inline jezgro_err_t jz_sem_wait(jezgro_sem_t sem, jezgro_tick_t timeout)
{
    (void)sem; (void)timeout;
    return JEZGRO_OK;  /* TODO: implement */
}

static inline jezgro_err_t jz_sem_signal(jezgro_sem_t sem)
{
    (void)sem;
    return JEZGRO_OK;  /* TODO: implement */
}

#endif

/* ==========================================================================
 * Debug / Diagnostic API
 * ========================================================================== */

/**
 * @brief Get platform name
 */
static inline const char* jz_get_platform(void)
{
    return JEZGRO_PLATFORM_NAME;
}

/**
 * @brief Check if running on multi-core platform
 */
static inline bool jz_is_multicore(void)
{
#if defined(JEZGRO_MULTI_CORE)
    return true;
#else
    return false;
#endif
}

/**
 * @brief Get core ID (0 on single-core platforms)
 */
static inline uint32_t jz_get_core_id(void)
{
#if defined(JEZGRO_PLATFORM_TRICORE)
    return hal_get_core_id();
#else
    return 0;
#endif
}

/**
 * @brief Get number of cores
 */
static inline uint32_t jz_get_num_cores(void)
{
#if defined(JEZGRO_MULTI_CORE)
    return JEZGRO_NUM_CORES;
#else
    return 1;
#endif
}

/* ==========================================================================
 * HAL Wrappers (Unified)
 * ========================================================================== */

/**
 * @brief Initialize hardware
 */
static inline jezgro_err_t jz_hal_init(void)
{
    int ret = hal_init();
    return (ret == 0) ? JEZGRO_OK : JEZGRO_ERROR;
}

/**
 * @brief Debug output
 */
static inline void jz_debug_puts(const char *str)
{
#if defined(JEZGRO_PLATFORM_TRICORE)
    hal_debug_puts(str);
#else
    hal_uart_puts(0, str);
#endif
}

/**
 * @brief Debug output (hex)
 */
static inline void jz_debug_hex(uint32_t val)
{
#if defined(JEZGRO_PLATFORM_TRICORE)
    hal_debug_hex(val);
#else
    /* Simple hex output for STM32 */
    char buf[12];
    static const char hex[] = "0123456789ABCDEF";
    buf[0] = '0'; buf[1] = 'x';
    for (int i = 0; i < 8; i++) {
        buf[2 + i] = hex[(val >> (28 - i * 4)) & 0xF];
    }
    buf[10] = '\0';
    hal_uart_puts(0, buf);
#endif
}

/* ==========================================================================
 * CAN-FD API (Unified)
 *
 * This is the primary communication interface between STM32 modules
 * and TC397 coordinator.
 * ========================================================================== */

/**
 * @brief CAN message structure (portable)
 */
typedef struct {
    uint32_t id;            /**< Message ID (11 or 29 bit) */
    uint8_t  data[64];      /**< Payload (up to 64 bytes for FD) */
    uint8_t  len;           /**< Data length */
    bool     extended;      /**< Extended ID (29-bit) */
    bool     fd;            /**< CAN-FD frame */
    bool     brs;           /**< Bit rate switch */
} jz_can_msg_t;

/**
 * @brief Initialize CAN-FD
 */
static inline jezgro_err_t jz_can_init(uint8_t instance, uint32_t bitrate, uint32_t data_bitrate)
{
    int ret = hal_can_init(instance, bitrate, data_bitrate);
    return (ret == 0) ? JEZGRO_OK : JEZGRO_ERROR;
}

/**
 * @brief Send CAN message
 */
static inline jezgro_err_t jz_can_send(uint8_t instance, const jz_can_msg_t *msg)
{
    hal_can_msg_t hal_msg;
    hal_msg.id = msg->id;
    hal_msg.len = msg->len;
    hal_msg.extended = msg->extended;
    hal_msg.fd = msg->fd;
    hal_msg.brs = msg->brs;
    for (int i = 0; i < msg->len && i < 64; i++) {
        hal_msg.data[i] = msg->data[i];
    }
    int ret = hal_can_send(instance, &hal_msg);
    return (ret == 0) ? JEZGRO_OK : JEZGRO_ERROR;
}

/**
 * @brief Receive CAN message (non-blocking)
 */
static inline jezgro_err_t jz_can_receive(uint8_t instance, jz_can_msg_t *msg)
{
    hal_can_msg_t hal_msg;
    int ret = hal_can_receive(instance, &hal_msg);
    if (ret == 0) {
        msg->id = hal_msg.id;
        msg->len = hal_msg.len;
        msg->extended = hal_msg.extended;
        msg->fd = hal_msg.fd;
        msg->brs = hal_msg.brs;
        for (int i = 0; i < hal_msg.len && i < 64; i++) {
            msg->data[i] = hal_msg.data[i];
        }
        return JEZGRO_OK;
    }
    return JEZGRO_ERROR_EMPTY;
}

#ifdef __cplusplus
}
#endif

#endif /* JEZGRO_COMPAT_H */
