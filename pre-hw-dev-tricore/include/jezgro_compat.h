/**
 * @file jezgro_compat.h
 * @brief JEZGRO to ek-kor API compatibility layer
 */

#ifndef JEZGRO_COMPAT_H
#define JEZGRO_COMPAT_H

#include <ek-kor/hal.h>
#include <ek-kor/kernel.h>
#include <ek-kor/scheduler.h>
#include <ek-kor/task.h>
#include <ek-kor/sync.h>
#include <ek-kor/ipc.h>

/* HAL compatibility */
#define hal_init()                  ekk_hal_init()
#define hal_init_core(c)            ekk_hal_init_core(c)
#define hal_get_core_id()           ekk_hal_get_core_id()
#define hal_systick_init(cb)        ekk_hal_systick_init(cb)
#define hal_watchdog_reset()        ekk_hal_watchdog_reset()
#define hal_debug_puts(s)           ekk_hal_debug_puts(s)
#define hal_debug_hex(v)            ekk_hal_debug_hex(v)
#define hal_debug_putc(c)           ekk_hal_debug_putc(c)

/* Task compatibility */
#define task_init()                 ekk_task_init()
#define task_create(p, h)           ekk_task_create(p, h)
#define task_create_idle()          ekk_task_create_idle()
#define task_delay(t)               ekk_task_delay(t)
#define task_yield()                ekk_task_yield()
#define task_get_name(t)            ekk_task_get_name(t)
#define task_wait_for_period()      ekk_task_wait_for_period()
#define task_params_t               ekk_task_params_t

/* Scheduler compatibility */
#define scheduler_init()            ekk_sched_init()
#define scheduler_tick()            ekk_sched_tick()

/* Sync compatibility */
#define sync_spinlock_t             ekk_spinlock_t
#define sync_spinlock_init(l, n)    ekk_spinlock_init(l)
#define sync_mutex_t                ekk_mutex_t
#define sync_mutex_init(m, n)       ekk_mutex_init(m)
#define sync_sem_t                  ekk_sem_t
#define sync_sem_init(s, c)         ekk_sem_init(s, c)

/* IPC compatibility - stubs for now */
#define ipc_mailbox_init()          ((void)0)
#define ipc_buffer_pool_init()      ((void)0)

/* Kernel compatibility */
#define jezgro_init()               ekk_init()
#define jezgro_start()              ekk_start()
#define jezgro_version()            ekk_version()
#define jezgro_ms_to_ticks(ms)      ekk_ms_to_ticks(ms)

/* Type compatibility */
#define JEZGRO_TASK_PARAMS_DEFAULT  EKK_TASK_PARAMS_DEFAULT

#endif /* JEZGRO_COMPAT_H */
