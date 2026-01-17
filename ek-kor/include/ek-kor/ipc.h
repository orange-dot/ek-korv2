/**
 * @file ipc.h
 * @brief ek-kor Inter-Process Communication
 *
 * Cross-core and same-core message passing:
 *   - Message queues (per-core)
 *   - Mailboxes (cross-core, in shared memory)
 *   - Zero-copy buffers for large data
 */

#ifndef EKK_IPC_H
#define EKK_IPC_H

#include <ek-kor/types.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Message Queue (Per-Core)
 * ========================================================================== */

/**
 * @brief Message queue structure
 */
typedef struct {
    uint8_t         *buffer;
    uint32_t        msg_size;
    uint32_t        capacity;
    volatile uint32_t head;
    volatile uint32_t tail;
    volatile uint32_t count;
    ekk_task_t      send_wait;
    ekk_task_t      recv_wait;
    const char      *name;
} ekk_queue_struct_t;

ekk_err_t ekk_queue_create(ekk_queue_struct_t *queue, const char *name,
                           uint32_t msg_size, uint32_t capacity, void *buffer);
ekk_err_t ekk_queue_delete(ekk_queue_struct_t *queue);
ekk_err_t ekk_queue_send(ekk_queue_struct_t *queue, const void *msg,
                         ekk_tick_t timeout);
ekk_err_t ekk_queue_send_front(ekk_queue_struct_t *queue, const void *msg,
                               ekk_tick_t timeout);
ekk_err_t ekk_queue_receive(ekk_queue_struct_t *queue, void *msg,
                            ekk_tick_t timeout);
ekk_err_t ekk_queue_peek(ekk_queue_struct_t *queue, void *msg);
uint32_t ekk_queue_count(ekk_queue_struct_t *queue);
uint32_t ekk_queue_space(ekk_queue_struct_t *queue);
bool ekk_queue_is_empty(ekk_queue_struct_t *queue);
bool ekk_queue_is_full(ekk_queue_struct_t *queue);
void ekk_queue_flush(ekk_queue_struct_t *queue);

/* ==========================================================================
 * Cross-Core Mailbox
 * ========================================================================== */

#define EKK_MAILBOX_MSG_SIZE    32
#define EKK_MAILBOX_SLOTS       8

typedef enum {
    EKK_MAILBOX_EMPTY   = 0,
    EKK_MAILBOX_FULL    = 1,
    EKK_MAILBOX_CLAIMED = 2,
} ekk_mailbox_slot_status_t;

typedef struct {
    volatile uint32_t status;
    uint32_t sender_core;
    uint32_t msg_type;
    uint8_t data[EKK_MAILBOX_MSG_SIZE];
} ekk_mailbox_slot_t;

typedef struct {
    ekk_mailbox_slot_t slots[EKK_MAILBOX_SLOTS];
    volatile uint32_t write_idx;
    volatile uint32_t read_idx;
    volatile uint32_t pending_count;
    uint32_t owner_core;
    const char *name;
} ekk_mailbox_struct_t;

ekk_err_t ekk_mailbox_init(void);
ekk_mailbox_struct_t* ekk_mailbox_get(uint32_t core_id);
ekk_err_t ekk_mailbox_send(uint32_t target_core, uint32_t msg_type,
                           const void *data, uint32_t size);
ekk_err_t ekk_mailbox_receive(uint32_t *msg_type, void *data,
                              uint32_t size, uint32_t *sender_core,
                              ekk_tick_t timeout);
uint32_t ekk_mailbox_pending(uint32_t core_id);
uint32_t ekk_mailbox_broadcast(uint32_t msg_type, const void *data, uint32_t size);

/* ==========================================================================
 * Zero-Copy Buffer Pool
 * ========================================================================== */

typedef struct {
    void            *data;
    uint32_t        size;
    volatile uint32_t ref_count;
    uint32_t        owner_core;
    uint32_t        flags;
} ekk_buffer_t;

ekk_err_t ekk_buffer_pool_init(void);
ekk_buffer_t* ekk_buffer_alloc(uint32_t size);
void ekk_buffer_ref(ekk_buffer_t *buf);
void ekk_buffer_release(ekk_buffer_t *buf);
ekk_err_t ekk_buffer_send(uint32_t target_core, ekk_buffer_t *buf, uint32_t msg_type);
ekk_err_t ekk_buffer_receive(ekk_buffer_t **buf, uint32_t *msg_type, ekk_tick_t timeout);

/* ==========================================================================
 * Standard Message Types
 * ========================================================================== */

#define EKK_MSG_GENERIC     0
#define EKK_MSG_RPC         1
#define EKK_MSG_RPC_REPLY   2
#define EKK_MSG_SCHEDULER   3
#define EKK_MSG_BUFFER      4
#define EKK_MSG_SHUTDOWN    5
#define EKK_MSG_USER        0x100

/* ==========================================================================
 * Remote Procedure Call (RPC)
 * ========================================================================== */

typedef struct {
    void (*func)(void*);
    void *arg;
    volatile bool done;
    volatile int32_t result;
} ekk_rpc_t;

int32_t ekk_call_on_core(uint32_t target_core, void (*func)(void*),
                         void *arg, ekk_tick_t timeout);
uint32_t ekk_call_on_all(void (*func)(void*), void *arg, ekk_tick_t timeout);

/* ==========================================================================
 * Statistics
 * ========================================================================== */

typedef struct {
    uint32_t messages_sent;
    uint32_t messages_received;
    uint32_t send_failures;
    uint32_t receive_timeouts;
    uint32_t buffers_allocated;
    uint32_t buffers_freed;
} ekk_ipc_stats_t;

void ekk_ipc_get_stats(uint32_t core_id, ekk_ipc_stats_t *stats);
void ekk_ipc_reset_stats(void);

#ifdef __cplusplus
}
#endif

#endif /* EKK_IPC_H */
