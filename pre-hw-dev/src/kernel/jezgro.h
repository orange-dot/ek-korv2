/**
 * @file jezgro.h
 * @brief JEZGRO Microkernel RTOS - Main Header
 *
 * JEZGRO is a MINIX-inspired microkernel for power electronics
 * with EDF scheduling and fault-tolerant design.
 *
 * Copyright (c) 2026 Elektrokombinacija
 * SPDX-License-Identifier: MIT
 */

#ifndef JEZGRO_H
#define JEZGRO_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

/*===========================================================================*/
/* Version                                                                   */
/*===========================================================================*/

#define JEZGRO_VERSION_MAJOR    0
#define JEZGRO_VERSION_MINOR    1
#define JEZGRO_VERSION_PATCH    0
#define JEZGRO_VERSION_STRING   "0.1.0-pre"

/*===========================================================================*/
/* Configuration                                                             */
/*===========================================================================*/

/** Maximum number of tasks */
#define JEZGRO_MAX_TASKS        32

/** Maximum number of services */
#define JEZGRO_MAX_SERVICES     16

/** System tick rate (Hz) */
#define JEZGRO_TICK_RATE_HZ     1000

/** IPC message pool size */
#define JEZGRO_MSG_POOL_SIZE    64

/** Maximum message payload size */
#define JEZGRO_MSG_MAX_SIZE     64

/** Maximum number of mutexes */
#define JEZGRO_MAX_MUTEXES      16

/** Maximum number of semaphores */
#define JEZGRO_MAX_SEMAPHORES   16

/** Stack size for user tasks (bytes) */
#define JEZGRO_TASK_STACK_SIZE  1024

/** Enable debug output */
#ifdef JEZGRO_SIM
#define JEZGRO_DEBUG            1
#else
#define JEZGRO_DEBUG            0
#endif

/*===========================================================================*/
/* Types                                                                     */
/*===========================================================================*/

/** Task ID type */
typedef uint8_t task_id_t;

/** Service ID type */
typedef uint8_t service_id_t;

/** Tick count type */
typedef uint32_t tick_t;

/** Task states */
typedef enum {
    TASK_STATE_INVALID = 0,
    TASK_STATE_READY,
    TASK_STATE_RUNNING,
    TASK_STATE_BLOCKED,
    TASK_STATE_SUSPENDED,
    TASK_STATE_TERMINATED
} task_state_t;

/** Task block reasons */
typedef enum {
    BLOCK_REASON_NONE = 0,
    BLOCK_REASON_MUTEX,
    BLOCK_REASON_SEMAPHORE,
    BLOCK_REASON_SLEEP
} block_reason_t;

/** Task priority (lower = higher priority in EDF) */
typedef uint8_t priority_t;

/** Task function pointer */
typedef void (*task_func_t)(void *arg);

/** Task Control Block */
typedef struct task {
    task_id_t       id;             /**< Unique task ID */
    const char      *name;          /**< Task name (debug) */
    task_state_t    state;          /**< Current state */
    priority_t      base_priority;  /**< Base priority */
    tick_t          deadline;       /**< Absolute deadline (ticks) */
    tick_t          period;         /**< Period for periodic tasks (0=aperiodic) */
    tick_t          wcet;           /**< Worst-case execution time */
    bool            deadline_missed;/**< Deadline miss flag */
    task_func_t     func;           /**< Task entry function */
    void            *arg;           /**< Task argument */
    void            *stack;         /**< Stack pointer */
    size_t          stack_size;     /**< Stack size */
    uint32_t        sp;             /**< Saved stack pointer */
    struct task     *next;          /**< Next task in list */
    /* Synchronization */
    block_reason_t  block_reason;   /**< Why task is blocked */
    void            *block_object;  /**< Mutex/semaphore blocking on */
} task_t;

/** IPC Message */
typedef struct {
    uint8_t     src;                /**< Source task/service ID */
    uint8_t     dest;               /**< Destination task/service ID */
    uint8_t     type;               /**< Message type */
    uint8_t     flags;              /**< Flags (async, etc.) */
    uint16_t    len;                /**< Payload length */
    uint8_t     data[JEZGRO_MSG_MAX_SIZE]; /**< Payload */
} ipc_msg_t;

/** System statistics */
typedef struct {
    uint32_t    uptime_ms;          /**< System uptime */
    uint32_t    context_switches;   /**< Total context switches */
    uint32_t    ipc_messages;       /**< Total IPC messages */
    uint32_t    deadline_misses;    /**< Total deadline misses */
    uint32_t    faults_recovered;   /**< Faults recovered by reincarnation */
    uint8_t     cpu_usage_percent;  /**< CPU usage (0-100) */
} jezgro_stats_t;

/*===========================================================================*/
/* Error Codes                                                               */
/*===========================================================================*/

#define JEZGRO_OK               0
#define JEZGRO_ERR_NOMEM       -1
#define JEZGRO_ERR_INVALID     -2
#define JEZGRO_ERR_TIMEOUT     -3
#define JEZGRO_ERR_BUSY        -4
#define JEZGRO_ERR_FULL        -5
#define JEZGRO_ERR_EMPTY       -6
#define JEZGRO_ERR_FAULT       -7

/*===========================================================================*/
/* Kernel API                                                                */
/*===========================================================================*/

/**
 * @brief Initialize JEZGRO kernel
 * @return JEZGRO_OK on success
 */
int jezgro_init(void);

/**
 * @brief Start kernel scheduler (never returns)
 */
void jezgro_start(void);

/**
 * @brief Get current system tick
 * @return Current tick count
 */
tick_t jezgro_get_ticks(void);

/**
 * @brief Get kernel statistics
 * @param stats Pointer to stats structure
 */
void jezgro_get_stats(jezgro_stats_t *stats);

/**
 * @brief Kernel panic - unrecoverable error
 * @param msg Error message
 */
void jezgro_panic(const char *msg);

/*===========================================================================*/
/* Include subsystem headers                                                 */
/*===========================================================================*/

#include "scheduler.h"
#include "ipc.h"
#include "task.h"
#include "sync.h"

#endif /* JEZGRO_H */
