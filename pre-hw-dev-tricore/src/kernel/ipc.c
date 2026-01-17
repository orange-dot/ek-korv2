/**
 * @file ipc.c
 * @brief JEZGRO IPC Implementation
 */

#include "ipc.h"
#include "scheduler.h"
#include "task.h"
#include "sync.h"
#include "hal/hal.h"
#include "arch/tricore_cpu.h"
#include "arch/tricore_multicore.h"
#include <string.h>

/* ==========================================================================
 * Message Queue Implementation
 * ========================================================================== */

jezgro_error_t ipc_queue_create(ipc_queue_t *queue, const char *name,
                                uint32_t msg_size, uint32_t capacity,
                                void *buffer)
{
    if (queue == NULL || msg_size == 0 || capacity == 0) {
        return JEZGRO_ERROR_PARAM;
    }

    queue->msg_size = msg_size;
    queue->capacity = capacity;
    queue->head = 0;
    queue->tail = 0;
    queue->count = 0;
    queue->send_wait = NULL;
    queue->recv_wait = NULL;
    queue->name = name;

    if (buffer != NULL) {
        queue->buffer = (uint8_t*)buffer;
    }
    else {
        /* Allocate from shared memory */
        extern void* multicore_alloc_shared(uint32_t size, uint32_t align);
        queue->buffer = multicore_alloc_shared(msg_size * capacity, 8);
        if (queue->buffer == NULL) {
            return JEZGRO_ERROR_NOMEM;
        }
    }

    return JEZGRO_OK;
}

jezgro_error_t ipc_queue_delete(ipc_queue_t *queue)
{
    if (queue == NULL) {
        return JEZGRO_ERROR_PARAM;
    }

    hal_enter_critical();

    /* Wake all waiting tasks with error */
    while (queue->send_wait != NULL) {
        task_handle_t task = queue->send_wait;
        tcb_t *tcb = task_get_tcb(task);
        queue->send_wait = tcb->next_blocked;
        tcb->next_blocked = NULL;
        tcb->blocked_on = NULL;
        tcb->timeout_result = JEZGRO_ERROR_DELETED;
        scheduler_unblock(task);
    }

    while (queue->recv_wait != NULL) {
        task_handle_t task = queue->recv_wait;
        tcb_t *tcb = task_get_tcb(task);
        queue->recv_wait = tcb->next_blocked;
        tcb->next_blocked = NULL;
        tcb->blocked_on = NULL;
        tcb->timeout_result = JEZGRO_ERROR_DELETED;
        scheduler_unblock(task);
    }

    queue->buffer = NULL;

    hal_exit_critical();

    return JEZGRO_OK;
}

jezgro_error_t ipc_queue_send(ipc_queue_t *queue, const void *msg,
                              jezgro_ticks_t timeout)
{
    if (queue == NULL || msg == NULL) {
        return JEZGRO_ERROR_PARAM;
    }

    hal_enter_critical();

    /* Check if space available */
    if (queue->count < queue->capacity) {
        /* Copy message to buffer */
        uint8_t *dst = queue->buffer + (queue->head * queue->msg_size);
        memcpy(dst, msg, queue->msg_size);

        queue->head = (queue->head + 1) % queue->capacity;
        queue->count++;

        /* Wake receiver if any */
        if (queue->recv_wait != NULL) {
            task_handle_t task = queue->recv_wait;
            tcb_t *tcb = task_get_tcb(task);
            queue->recv_wait = tcb->next_blocked;
            tcb->next_blocked = NULL;
            tcb->blocked_on = NULL;
            scheduler_unblock(task);
        }

        hal_exit_critical();
        return JEZGRO_OK;
    }

    /* Queue full - wait or return */
    if (timeout == JEZGRO_NO_WAIT) {
        hal_exit_critical();
        return JEZGRO_ERROR_FULL;
    }

    /* Block waiting for space */
    task_handle_t current = task_get_current();
    tcb_t *tcb = task_get_tcb(current);
    tcb->state = TASK_STATE_BLOCKED;
    tcb->blocked_on = queue;
    tcb->next_blocked = queue->send_wait;
    queue->send_wait = current;

    hal_exit_critical();

    /* Block */
    jezgro_error_t result = scheduler_block(timeout);

    if (result == JEZGRO_OK) {
        /* Retry send */
        return ipc_queue_send(queue, msg, JEZGRO_NO_WAIT);
    }

    return result;
}

jezgro_error_t ipc_queue_send_front(ipc_queue_t *queue, const void *msg,
                                    jezgro_ticks_t timeout)
{
    if (queue == NULL || msg == NULL) {
        return JEZGRO_ERROR_PARAM;
    }

    hal_enter_critical();

    if (queue->count < queue->capacity) {
        /* Insert at front */
        queue->tail = (queue->tail + queue->capacity - 1) % queue->capacity;
        uint8_t *dst = queue->buffer + (queue->tail * queue->msg_size);
        memcpy(dst, msg, queue->msg_size);
        queue->count++;

        /* Wake receiver if any */
        if (queue->recv_wait != NULL) {
            task_handle_t task = queue->recv_wait;
            tcb_t *tcb = task_get_tcb(task);
            queue->recv_wait = tcb->next_blocked;
            tcb->next_blocked = NULL;
            tcb->blocked_on = NULL;
            scheduler_unblock(task);
        }

        hal_exit_critical();
        return JEZGRO_OK;
    }

    hal_exit_critical();

    if (timeout == JEZGRO_NO_WAIT) {
        return JEZGRO_ERROR_FULL;
    }

    /* Block and retry */
    task_delay(1);
    return ipc_queue_send_front(queue, msg, timeout - 1);
}

jezgro_error_t ipc_queue_receive(ipc_queue_t *queue, void *msg,
                                 jezgro_ticks_t timeout)
{
    if (queue == NULL || msg == NULL) {
        return JEZGRO_ERROR_PARAM;
    }

    hal_enter_critical();

    if (queue->count > 0) {
        /* Copy message from buffer */
        uint8_t *src = queue->buffer + (queue->tail * queue->msg_size);
        memcpy(msg, src, queue->msg_size);

        queue->tail = (queue->tail + 1) % queue->capacity;
        queue->count--;

        /* Wake sender if any */
        if (queue->send_wait != NULL) {
            task_handle_t task = queue->send_wait;
            tcb_t *tcb = task_get_tcb(task);
            queue->send_wait = tcb->next_blocked;
            tcb->next_blocked = NULL;
            tcb->blocked_on = NULL;
            scheduler_unblock(task);
        }

        hal_exit_critical();
        return JEZGRO_OK;
    }

    /* Queue empty - wait or return */
    if (timeout == JEZGRO_NO_WAIT) {
        hal_exit_critical();
        return JEZGRO_ERROR_EMPTY;
    }

    /* Block waiting for message */
    task_handle_t current = task_get_current();
    tcb_t *tcb = task_get_tcb(current);
    tcb->state = TASK_STATE_BLOCKED;
    tcb->blocked_on = queue;
    tcb->next_blocked = queue->recv_wait;
    queue->recv_wait = current;

    hal_exit_critical();

    /* Block */
    jezgro_error_t result = scheduler_block(timeout);

    if (result == JEZGRO_OK) {
        /* Retry receive */
        return ipc_queue_receive(queue, msg, JEZGRO_NO_WAIT);
    }

    return result;
}

jezgro_error_t ipc_queue_peek(ipc_queue_t *queue, void *msg)
{
    if (queue == NULL || msg == NULL) {
        return JEZGRO_ERROR_PARAM;
    }

    hal_enter_critical();

    if (queue->count == 0) {
        hal_exit_critical();
        return JEZGRO_ERROR_EMPTY;
    }

    uint8_t *src = queue->buffer + (queue->tail * queue->msg_size);
    memcpy(msg, src, queue->msg_size);

    hal_exit_critical();

    return JEZGRO_OK;
}

uint32_t ipc_queue_count(ipc_queue_t *queue)
{
    return queue ? queue->count : 0;
}

uint32_t ipc_queue_space(ipc_queue_t *queue)
{
    return queue ? (queue->capacity - queue->count) : 0;
}

bool ipc_queue_is_empty(ipc_queue_t *queue)
{
    return queue ? (queue->count == 0) : true;
}

bool ipc_queue_is_full(ipc_queue_t *queue)
{
    return queue ? (queue->count >= queue->capacity) : true;
}

void ipc_queue_flush(ipc_queue_t *queue)
{
    if (queue == NULL) return;

    hal_enter_critical();
    queue->head = 0;
    queue->tail = 0;
    queue->count = 0;
    hal_exit_critical();
}

/* ==========================================================================
 * Cross-Core Mailbox Implementation
 * ========================================================================== */

/* Per-core mailboxes (in shared memory) */
static ipc_mailbox_t *g_mailboxes[JEZGRO_MAX_CORES];
static sync_spinlock_t g_mailbox_locks[JEZGRO_MAX_CORES];

/* Per-core statistics */
static ipc_stats_t g_ipc_stats[JEZGRO_MAX_CORES];

jezgro_error_t ipc_mailbox_init(void)
{
    extern void* multicore_alloc_shared(uint32_t size, uint32_t align);

    for (uint32_t i = 0; i < JEZGRO_MAX_CORES; i++) {
        /* Allocate mailbox in shared memory */
        g_mailboxes[i] = multicore_alloc_shared(sizeof(ipc_mailbox_t), 64);
        if (g_mailboxes[i] == NULL) {
            return JEZGRO_ERROR_NOMEM;
        }

        memset(g_mailboxes[i], 0, sizeof(ipc_mailbox_t));
        g_mailboxes[i]->owner_core = i;
        g_mailboxes[i]->name = "mbox";

        sync_spinlock_init(&g_mailbox_locks[i], "mbox_lock");
    }

    memset(g_ipc_stats, 0, sizeof(g_ipc_stats));

    return JEZGRO_OK;
}

ipc_mailbox_t* ipc_mailbox_get(uint32_t core_id)
{
    if (core_id >= JEZGRO_MAX_CORES) {
        return NULL;
    }
    return g_mailboxes[core_id];
}

jezgro_error_t ipc_mailbox_send(uint32_t target_core, uint32_t msg_type,
                                const void *data, uint32_t size)
{
    if (target_core >= JEZGRO_MAX_CORES || size > IPC_MAILBOX_MSG_SIZE) {
        return JEZGRO_ERROR_PARAM;
    }

    ipc_mailbox_t *mbox = g_mailboxes[target_core];
    if (mbox == NULL) {
        return JEZGRO_ERROR_STATE;
    }

    uint32_t my_core = hal_get_core_id();

    sync_spinlock_acquire(&g_mailbox_locks[target_core]);

    /* Find empty slot */
    if (mbox->pending_count >= IPC_MAILBOX_SLOTS) {
        sync_spinlock_release(&g_mailbox_locks[target_core]);
        g_ipc_stats[my_core].send_failures++;
        return JEZGRO_ERROR_FULL;
    }

    uint32_t idx = mbox->write_idx;
    mailbox_slot_t *slot = &mbox->slots[idx];

    slot->sender_core = my_core;
    slot->msg_type = msg_type;
    if (data && size > 0) {
        memcpy(slot->data, data, size);
    }
    slot->status = MAILBOX_SLOT_FULL;

    mbox->write_idx = (idx + 1) % IPC_MAILBOX_SLOTS;
    mbox->pending_count++;

    sync_spinlock_release(&g_mailbox_locks[target_core]);

    /* Statistics */
    g_ipc_stats[my_core].messages_sent++;

    /* Send IPI to wake target core */
    multicore_send_ipi(target_core, IPI_EVENT_WAKEUP, NULL);

    return JEZGRO_OK;
}

jezgro_error_t ipc_mailbox_receive(uint32_t *msg_type, void *data,
                                   uint32_t size, uint32_t *sender_core,
                                   jezgro_ticks_t timeout)
{
    uint32_t my_core = hal_get_core_id();
    ipc_mailbox_t *mbox = g_mailboxes[my_core];

    if (mbox == NULL) {
        return JEZGRO_ERROR_STATE;
    }

    jezgro_ticks_t start = scheduler_get_ticks();

    while (1) {
        sync_spinlock_acquire(&g_mailbox_locks[my_core]);

        if (mbox->pending_count > 0) {
            uint32_t idx = mbox->read_idx;
            mailbox_slot_t *slot = &mbox->slots[idx];

            if (slot->status == MAILBOX_SLOT_FULL) {
                if (msg_type) *msg_type = slot->msg_type;
                if (sender_core) *sender_core = slot->sender_core;
                if (data && size > 0) {
                    uint32_t copy_size = (size < IPC_MAILBOX_MSG_SIZE) ?
                                         size : IPC_MAILBOX_MSG_SIZE;
                    memcpy(data, slot->data, copy_size);
                }

                slot->status = MAILBOX_SLOT_EMPTY;
                mbox->read_idx = (idx + 1) % IPC_MAILBOX_SLOTS;
                mbox->pending_count--;

                sync_spinlock_release(&g_mailbox_locks[my_core]);

                g_ipc_stats[my_core].messages_received++;
                return JEZGRO_OK;
            }
        }

        sync_spinlock_release(&g_mailbox_locks[my_core]);

        /* Check timeout */
        if (timeout == JEZGRO_NO_WAIT) {
            return JEZGRO_ERROR_EMPTY;
        }

        jezgro_ticks_t elapsed = scheduler_get_ticks() - start;
        if (timeout != JEZGRO_WAIT_FOREVER && elapsed >= timeout) {
            g_ipc_stats[my_core].receive_timeouts++;
            return JEZGRO_ERROR_TIMEOUT;
        }

        /* Wait for IPI */
        task_delay(1);
    }
}

uint32_t ipc_mailbox_pending(uint32_t core_id)
{
    if (core_id >= JEZGRO_MAX_CORES || g_mailboxes[core_id] == NULL) {
        return 0;
    }
    return g_mailboxes[core_id]->pending_count;
}

uint32_t ipc_mailbox_broadcast(uint32_t msg_type, const void *data, uint32_t size)
{
    uint32_t my_core = hal_get_core_id();
    uint32_t sent = 0;

    for (uint32_t i = 0; i < JEZGRO_MAX_CORES; i++) {
        if (i != my_core) {
            if (ipc_mailbox_send(i, msg_type, data, size) == JEZGRO_OK) {
                sent++;
            }
        }
    }

    return sent;
}

/* ==========================================================================
 * Zero-Copy Buffer Pool Implementation
 * ========================================================================== */

/* Buffer pool */
static ipc_buffer_t g_buffer_pool[IPC_BUFFER_POOL_SIZE];
static uint8_t *g_buffer_data;
static sync_spinlock_t g_buffer_lock;
static uint32_t g_buffer_size = 256;  /* Size per buffer */

jezgro_error_t ipc_buffer_pool_init(void)
{
    extern void* multicore_alloc_shared(uint32_t size, uint32_t align);

    /* Allocate data area */
    uint32_t total_size = IPC_BUFFER_POOL_SIZE * g_buffer_size;
    g_buffer_data = multicore_alloc_shared(total_size, 64);
    if (g_buffer_data == NULL) {
        return JEZGRO_ERROR_NOMEM;
    }

    /* Initialize pool */
    memset(g_buffer_pool, 0, sizeof(g_buffer_pool));
    for (uint32_t i = 0; i < IPC_BUFFER_POOL_SIZE; i++) {
        g_buffer_pool[i].data = g_buffer_data + (i * g_buffer_size);
        g_buffer_pool[i].size = g_buffer_size;
        g_buffer_pool[i].ref_count = 0;
    }

    sync_spinlock_init(&g_buffer_lock, "buf_pool");

    return JEZGRO_OK;
}

ipc_buffer_t* ipc_buffer_alloc(uint32_t size)
{
    if (size > g_buffer_size) {
        return NULL;  /* Request too large */
    }

    sync_spinlock_acquire(&g_buffer_lock);

    for (uint32_t i = 0; i < IPC_BUFFER_POOL_SIZE; i++) {
        if (g_buffer_pool[i].ref_count == 0) {
            g_buffer_pool[i].ref_count = 1;
            g_buffer_pool[i].owner_core = hal_get_core_id();

            sync_spinlock_release(&g_buffer_lock);

            g_ipc_stats[hal_get_core_id()].buffers_allocated++;
            return &g_buffer_pool[i];
        }
    }

    sync_spinlock_release(&g_buffer_lock);
    return NULL;  /* Pool exhausted */
}

void ipc_buffer_ref(ipc_buffer_t *buf)
{
    if (buf == NULL) return;

    sync_spinlock_acquire(&g_buffer_lock);
    buf->ref_count++;
    sync_spinlock_release(&g_buffer_lock);
}

void ipc_buffer_release(ipc_buffer_t *buf)
{
    if (buf == NULL) return;

    sync_spinlock_acquire(&g_buffer_lock);

    if (buf->ref_count > 0) {
        buf->ref_count--;
        if (buf->ref_count == 0) {
            g_ipc_stats[hal_get_core_id()].buffers_freed++;
        }
    }

    sync_spinlock_release(&g_buffer_lock);
}

jezgro_error_t ipc_buffer_send(uint32_t target_core, ipc_buffer_t *buf,
                               uint32_t msg_type)
{
    if (buf == NULL) {
        return JEZGRO_ERROR_PARAM;
    }

    /* Send buffer pointer via mailbox */
    return ipc_mailbox_send(target_core, IPC_MSG_BUFFER, &buf, sizeof(buf));
}

jezgro_error_t ipc_buffer_receive(ipc_buffer_t **buf, uint32_t *msg_type,
                                  jezgro_ticks_t timeout)
{
    uint32_t type;
    ipc_buffer_t *recv_buf;
    uint32_t sender;

    jezgro_error_t result = ipc_mailbox_receive(&type, &recv_buf,
                                                sizeof(recv_buf), &sender,
                                                timeout);

    if (result == JEZGRO_OK && type == IPC_MSG_BUFFER) {
        if (buf) *buf = recv_buf;
        if (msg_type) *msg_type = type;
        return JEZGRO_OK;
    }

    return result;
}

/* ==========================================================================
 * Remote Procedure Call
 * ========================================================================== */

int32_t ipc_call_on_core(uint32_t target_core, void (*func)(void*),
                         void *arg, jezgro_ticks_t timeout)
{
    if (target_core >= JEZGRO_MAX_CORES || target_core == hal_get_core_id()) {
        return -1;
    }

    /* Allocate RPC descriptor in shared memory */
    extern void* multicore_alloc_shared(uint32_t size, uint32_t align);
    ipc_rpc_t *rpc = multicore_alloc_shared(sizeof(ipc_rpc_t), 8);
    if (rpc == NULL) {
        return -1;
    }

    rpc->func = func;
    rpc->arg = arg;
    rpc->done = false;
    rpc->result = -1;

    /* Memory barrier */
    hal_data_sync_barrier();

    /* Send via mailbox */
    jezgro_error_t result = ipc_mailbox_send(target_core, IPC_MSG_RPC,
                                             &rpc, sizeof(rpc));
    if (result != JEZGRO_OK) {
        return -1;
    }

    /* Wait for completion */
    jezgro_ticks_t start = scheduler_get_ticks();
    while (!rpc->done) {
        if (timeout != JEZGRO_WAIT_FOREVER) {
            if (scheduler_get_ticks() - start >= timeout) {
                return -1;  /* Timeout */
            }
        }
        task_delay(1);
    }

    return rpc->result;
}

uint32_t ipc_call_on_all(void (*func)(void*), void *arg, jezgro_ticks_t timeout)
{
    uint32_t my_core = hal_get_core_id();
    uint32_t success = 0;

    for (uint32_t i = 0; i < JEZGRO_MAX_CORES; i++) {
        if (i != my_core) {
            if (ipc_call_on_core(i, func, arg, timeout) >= 0) {
                success++;
            }
        }
    }

    return success;
}

/* ==========================================================================
 * IPC Handler (called from IPI handler)
 * ========================================================================== */

/**
 * @brief Process pending IPC messages
 *
 * Called from scheduler tick or IPI handler.
 */
void ipc_process_pending(void)
{
    uint32_t type;
    void *data;
    uint32_t sender;

    /* Process all pending messages */
    while (ipc_mailbox_receive(&type, &data, sizeof(data), &sender,
                               JEZGRO_NO_WAIT) == JEZGRO_OK) {
        switch (type) {
            case IPC_MSG_RPC: {
                /* Execute RPC */
                ipc_rpc_t *rpc = *(ipc_rpc_t**)&data;
                if (rpc && rpc->func) {
                    rpc->func(rpc->arg);
                    rpc->result = 0;
                    hal_data_sync_barrier();
                    rpc->done = true;
                }
                break;
            }

            default:
                /* Application handles other types */
                break;
        }
    }
}

/* ==========================================================================
 * Statistics
 * ========================================================================== */

void ipc_get_stats(uint32_t core_id, ipc_stats_t *stats)
{
    if (core_id >= JEZGRO_MAX_CORES || stats == NULL) {
        return;
    }
    *stats = g_ipc_stats[core_id];
}

void ipc_reset_stats(void)
{
    memset(g_ipc_stats, 0, sizeof(g_ipc_stats));
}
