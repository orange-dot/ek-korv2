/**
 * @file ipc.c
 * @brief ek-kor Inter-Process Communication Implementation
 */

#include <ek-kor/ek-kor.h>
#include <string.h>

/* ==========================================================================
 * IPI Message Types
 * ========================================================================== */

#define EKK_IPI_MSG_MAILBOX     0x01    /**< Mailbox message available */
#define EKK_IPI_MSG_BUFFER      0x02    /**< Zero-copy buffer available */
#define EKK_IPI_MSG_RPC_REQUEST 0x03    /**< RPC request */
#define EKK_IPI_MSG_RPC_RESPONSE 0x04   /**< RPC response */
#define EKK_IPI_MSG_RESCHEDULE  0x05    /**< Request reschedule */

#if EKK_MAX_CORES > 1

/* Forward declaration for RPC processing */
void ekk_rpc_process(void);

/**
 * @brief IPI handler for mailbox, buffer, and RPC notifications
 */
static void ipc_ipi_handler(uint32_t sender_core, uint32_t msg)
{
    (void)sender_core;

    switch (msg) {
        case EKK_IPI_MSG_MAILBOX:
        case EKK_IPI_MSG_BUFFER:
            /* Wake any tasks waiting on mailbox/buffer receive */
            ekk_sched_switch_request();
            break;

        case EKK_IPI_MSG_RPC_REQUEST:
            /* Process RPC request immediately */
            ekk_rpc_process();
            break;

        case EKK_IPI_MSG_RPC_RESPONSE:
            /* Caller will check completion flag */
            break;

        case EKK_IPI_MSG_RESCHEDULE:
            ekk_sched_switch_request();
            break;

        default:
            break;
    }

    ekk_hal_ipi_ack();
}
#endif

/* ==========================================================================
 * Message Queue
 * ========================================================================== */

ekk_err_t ekk_queue_create(ekk_queue_struct_t *queue, const char *name,
                           uint32_t msg_size, uint32_t capacity, void *buffer)
{
    if (!queue || msg_size == 0 || capacity == 0) {
        return EKK_ERR_PARAM;
    }

    memset(queue, 0, sizeof(*queue));
    queue->msg_size = msg_size;
    queue->capacity = capacity;
    queue->name = name;

    if (buffer) {
        queue->buffer = buffer;
    } else {
        /* Static allocation - simplified */
        static uint8_t queue_pool[16][64 * 16]; /* 16 queues, 64-byte msgs, 16 deep */
        static uint32_t pool_idx = 0;
        if (pool_idx < 16) {
            queue->buffer = queue_pool[pool_idx++];
        } else {
            return EKK_ERR_NOMEM;
        }
    }

    return EKK_OK;
}

ekk_err_t ekk_queue_delete(ekk_queue_struct_t *queue)
{
    if (!queue) return EKK_ERR_PARAM;

    /* TODO: Wake waiting tasks with error */
    memset(queue, 0, sizeof(*queue));
    return EKK_OK;
}

ekk_err_t ekk_queue_send(ekk_queue_struct_t *queue, const void *msg,
                         ekk_tick_t timeout)
{
    if (!queue || !msg) return EKK_ERR_PARAM;

    ekk_hal_enter_critical();

    while (queue->count >= queue->capacity) {
        ekk_hal_exit_critical();
        if (timeout == EKK_NO_WAIT) return EKK_ERR_FULL;
        ekk_err_t err = ekk_sched_block(timeout);
        if (err != EKK_OK) return err;
        ekk_hal_enter_critical();
    }

    /* Copy message to buffer */
    uint8_t *dst = queue->buffer + (queue->head * queue->msg_size);
    memcpy(dst, msg, queue->msg_size);

    queue->head = (queue->head + 1) % queue->capacity;
    queue->count++;

    /* Wake waiting receiver */
    ekk_sched_switch_request();

    ekk_hal_exit_critical();
    return EKK_OK;
}

ekk_err_t ekk_queue_send_front(ekk_queue_struct_t *queue, const void *msg,
                               ekk_tick_t timeout)
{
    if (!queue || !msg) return EKK_ERR_PARAM;

    ekk_hal_enter_critical();

    while (queue->count >= queue->capacity) {
        ekk_hal_exit_critical();
        if (timeout == EKK_NO_WAIT) return EKK_ERR_FULL;
        ekk_err_t err = ekk_sched_block(timeout);
        if (err != EKK_OK) return err;
        ekk_hal_enter_critical();
    }

    /* Move tail back */
    queue->tail = (queue->tail + queue->capacity - 1) % queue->capacity;

    /* Copy message to front */
    uint8_t *dst = queue->buffer + (queue->tail * queue->msg_size);
    memcpy(dst, msg, queue->msg_size);

    queue->count++;
    ekk_sched_switch_request();

    ekk_hal_exit_critical();
    return EKK_OK;
}

ekk_err_t ekk_queue_receive(ekk_queue_struct_t *queue, void *msg,
                            ekk_tick_t timeout)
{
    if (!queue || !msg) return EKK_ERR_PARAM;

    ekk_hal_enter_critical();

    while (queue->count == 0) {
        ekk_hal_exit_critical();
        if (timeout == EKK_NO_WAIT) return EKK_ERR_EMPTY;
        ekk_err_t err = ekk_sched_block(timeout);
        if (err != EKK_OK) return err;
        ekk_hal_enter_critical();
    }

    /* Copy message from buffer */
    uint8_t *src = queue->buffer + (queue->tail * queue->msg_size);
    memcpy(msg, src, queue->msg_size);

    queue->tail = (queue->tail + 1) % queue->capacity;
    queue->count--;

    /* Wake waiting sender */
    ekk_sched_switch_request();

    ekk_hal_exit_critical();
    return EKK_OK;
}

ekk_err_t ekk_queue_peek(ekk_queue_struct_t *queue, void *msg)
{
    if (!queue || !msg) return EKK_ERR_PARAM;

    ekk_hal_enter_critical();

    if (queue->count == 0) {
        ekk_hal_exit_critical();
        return EKK_ERR_EMPTY;
    }

    uint8_t *src = queue->buffer + (queue->tail * queue->msg_size);
    memcpy(msg, src, queue->msg_size);

    ekk_hal_exit_critical();
    return EKK_OK;
}

uint32_t ekk_queue_count(ekk_queue_struct_t *queue)
{
    return queue ? queue->count : 0;
}

uint32_t ekk_queue_space(ekk_queue_struct_t *queue)
{
    return queue ? (queue->capacity - queue->count) : 0;
}

bool ekk_queue_is_empty(ekk_queue_struct_t *queue)
{
    return queue ? (queue->count == 0) : true;
}

bool ekk_queue_is_full(ekk_queue_struct_t *queue)
{
    return queue ? (queue->count >= queue->capacity) : true;
}

void ekk_queue_flush(ekk_queue_struct_t *queue)
{
    if (!queue) return;

    ekk_hal_enter_critical();
    queue->head = 0;
    queue->tail = 0;
    queue->count = 0;
    ekk_hal_exit_critical();
}

/* ==========================================================================
 * Cross-Core Mailbox (stubs for single-core)
 * ========================================================================== */

#if EKK_MAX_CORES > 1
static ekk_mailbox_struct_t g_mailboxes[EKK_MAX_CORES];
#endif

ekk_err_t ekk_mailbox_init(void)
{
#if EKK_MAX_CORES > 1
    for (uint32_t i = 0; i < EKK_MAX_CORES; i++) {
        memset(&g_mailboxes[i], 0, sizeof(ekk_mailbox_struct_t));
        g_mailboxes[i].owner_core = i;
    }

    /* Initialize IPI and register handler */
    ekk_hal_ipi_init();
    ekk_hal_ipi_register_handler(ipc_ipi_handler);
#endif
    return EKK_OK;
}

ekk_mailbox_struct_t* ekk_mailbox_get(uint32_t core_id)
{
#if EKK_MAX_CORES > 1
    if (core_id < EKK_MAX_CORES) {
        return &g_mailboxes[core_id];
    }
#else
    (void)core_id;
#endif
    return NULL;
}

ekk_err_t ekk_mailbox_send(uint32_t target_core, uint32_t msg_type,
                           const void *data, uint32_t size)
{
#if EKK_MAX_CORES > 1
    if (target_core >= EKK_MAX_CORES) return EKK_ERR_PARAM;
    if (size > EKK_MAILBOX_MSG_SIZE) return EKK_ERR_PARAM;

    ekk_mailbox_struct_t *mb = &g_mailboxes[target_core];

    ekk_hal_enter_critical();

    if (mb->pending_count >= EKK_MAILBOX_SLOTS) {
        ekk_hal_exit_critical();
        return EKK_ERR_FULL;
    }

    ekk_mailbox_slot_t *slot = &mb->slots[mb->write_idx];
    slot->status = EKK_MAILBOX_FULL;
    slot->sender_core = ekk_hal_get_core_id();
    slot->msg_type = msg_type;
    if (data && size > 0) {
        memcpy(slot->data, data, size);
    }

    mb->write_idx = (mb->write_idx + 1) % EKK_MAILBOX_SLOTS;
    mb->pending_count++;

    ekk_hal_exit_critical();

    /* Send IPI to wake target core */
    ekk_hal_ipi_send(target_core, EKK_IPI_MSG_MAILBOX);

    return EKK_OK;
#else
    (void)target_core;
    (void)msg_type;
    (void)data;
    (void)size;
    return EKK_ERR_PARAM;
#endif
}

ekk_err_t ekk_mailbox_receive(uint32_t *msg_type, void *data,
                              uint32_t size, uint32_t *sender_core,
                              ekk_tick_t timeout)
{
#if EKK_MAX_CORES > 1
    uint32_t core = ekk_hal_get_core_id();
    ekk_mailbox_struct_t *mb = &g_mailboxes[core];

    ekk_hal_enter_critical();

    while (mb->pending_count == 0) {
        ekk_hal_exit_critical();
        if (timeout == EKK_NO_WAIT) return EKK_ERR_EMPTY;
        ekk_err_t err = ekk_sched_block(timeout);
        if (err != EKK_OK) return err;
        ekk_hal_enter_critical();
    }

    ekk_mailbox_slot_t *slot = &mb->slots[mb->read_idx];
    slot->status = EKK_MAILBOX_CLAIMED;

    if (msg_type) *msg_type = slot->msg_type;
    if (sender_core) *sender_core = slot->sender_core;
    if (data && size > 0) {
        uint32_t copy_size = size < EKK_MAILBOX_MSG_SIZE ? size : EKK_MAILBOX_MSG_SIZE;
        memcpy(data, slot->data, copy_size);
    }

    slot->status = EKK_MAILBOX_EMPTY;
    mb->read_idx = (mb->read_idx + 1) % EKK_MAILBOX_SLOTS;
    mb->pending_count--;

    ekk_hal_exit_critical();
    return EKK_OK;
#else
    (void)msg_type;
    (void)data;
    (void)size;
    (void)sender_core;
    (void)timeout;
    return EKK_ERR_PARAM;
#endif
}

uint32_t ekk_mailbox_pending(uint32_t core_id)
{
#if EKK_MAX_CORES > 1
    if (core_id < EKK_MAX_CORES) {
        return g_mailboxes[core_id].pending_count;
    }
#else
    (void)core_id;
#endif
    return 0;
}

uint32_t ekk_mailbox_broadcast(uint32_t msg_type, const void *data, uint32_t size)
{
    uint32_t sent = 0;
#if EKK_MAX_CORES > 1
    uint32_t my_core = ekk_hal_get_core_id();
    for (uint32_t i = 0; i < EKK_MAX_CORES; i++) {
        if (i != my_core) {
            if (ekk_mailbox_send(i, msg_type, data, size) == EKK_OK) {
                sent++;
            }
        }
    }
#else
    (void)msg_type;
    (void)data;
    (void)size;
#endif
    return sent;
}

/* ==========================================================================
 * Zero-Copy Buffer Pool
 *
 * Static pool of fixed-size buffers for efficient cross-core data sharing.
 * Uses reference counting for safe multi-reader access.
 * ========================================================================== */

#ifndef EKK_BUFFER_POOL_SIZE
#define EKK_BUFFER_POOL_SIZE    16
#endif

#ifndef EKK_BUFFER_DATA_SIZE
#define EKK_BUFFER_DATA_SIZE    256
#endif

/* Internal buffer structure */
typedef struct {
    ekk_buffer_t    header;                     /**< Public header */
    uint8_t         data[EKK_BUFFER_DATA_SIZE]; /**< Data storage */
    volatile bool   in_use;                     /**< Allocation flag */
} ekk_buffer_internal_t;

/* Buffer pool */
static ekk_buffer_internal_t g_buffer_pool[EKK_BUFFER_POOL_SIZE];
static ekk_spinlock_t g_buffer_pool_lock;

/* Per-core buffer receive queues */
#if EKK_MAX_CORES > 1
typedef struct {
    ekk_buffer_t    *buffers[8];                /**< Pending buffers */
    uint32_t        msg_types[8];               /**< Message types */
    uint32_t        head;
    uint32_t        tail;
    uint32_t        count;
} ekk_buffer_queue_t;

static ekk_buffer_queue_t g_buffer_queues[EKK_MAX_CORES];
#endif

ekk_err_t ekk_buffer_pool_init(void)
{
    /* Initialize pool */
    memset(g_buffer_pool, 0, sizeof(g_buffer_pool));

    for (uint32_t i = 0; i < EKK_BUFFER_POOL_SIZE; i++) {
        g_buffer_pool[i].header.data = g_buffer_pool[i].data;
        g_buffer_pool[i].header.size = 0;
        g_buffer_pool[i].header.ref_count = 0;
        g_buffer_pool[i].in_use = false;
    }

    ekk_spinlock_init(&g_buffer_pool_lock, "buf_pool");

#if EKK_MAX_CORES > 1
    memset(g_buffer_queues, 0, sizeof(g_buffer_queues));
#endif

    return EKK_OK;
}

ekk_buffer_t* ekk_buffer_alloc(uint32_t size)
{
    if (size > EKK_BUFFER_DATA_SIZE) {
        return NULL;  /* Too large */
    }

    ekk_spinlock_acquire(&g_buffer_pool_lock);

    /* Find free buffer */
    for (uint32_t i = 0; i < EKK_BUFFER_POOL_SIZE; i++) {
        if (!g_buffer_pool[i].in_use) {
            g_buffer_pool[i].in_use = true;
            g_buffer_pool[i].header.ref_count = 1;
            g_buffer_pool[i].header.size = size;
            g_buffer_pool[i].header.owner_core = ekk_hal_get_core_id();

            ekk_spinlock_release(&g_buffer_pool_lock);
            return &g_buffer_pool[i].header;
        }
    }

    ekk_spinlock_release(&g_buffer_pool_lock);
    return NULL;  /* Pool exhausted */
}

void ekk_buffer_ref(ekk_buffer_t *buf)
{
    if (buf) {
        ekk_hal_enter_critical();
        buf->ref_count++;
        ekk_hal_exit_critical();
    }
}

void ekk_buffer_release(ekk_buffer_t *buf)
{
    if (!buf) return;

    ekk_hal_enter_critical();

    if (buf->ref_count > 0) {
        buf->ref_count--;

        /* Free buffer when ref count reaches zero */
        if (buf->ref_count == 0) {
            /* Find internal structure */
            ekk_buffer_internal_t *internal =
                (ekk_buffer_internal_t*)((uint8_t*)buf - offsetof(ekk_buffer_internal_t, header));

            /* Verify it's in our pool */
            if (internal >= &g_buffer_pool[0] &&
                internal < &g_buffer_pool[EKK_BUFFER_POOL_SIZE]) {
                internal->in_use = false;
                buf->size = 0;
            }
        }
    }

    ekk_hal_exit_critical();
}

ekk_err_t ekk_buffer_send(uint32_t target_core, ekk_buffer_t *buf, uint32_t msg_type)
{
#if EKK_MAX_CORES > 1
    if (target_core >= EKK_MAX_CORES || !buf) {
        return EKK_ERR_PARAM;
    }

    ekk_buffer_queue_t *queue = &g_buffer_queues[target_core];

    ekk_hal_enter_critical();

    if (queue->count >= 8) {
        ekk_hal_exit_critical();
        return EKK_ERR_FULL;
    }

    /* Add reference for receiver */
    buf->ref_count++;

    /* Enqueue buffer */
    queue->buffers[queue->head] = buf;
    queue->msg_types[queue->head] = msg_type;
    queue->head = (queue->head + 1) % 8;
    queue->count++;

    ekk_hal_exit_critical();

    /* Send IPI to notify receiver */
    ekk_hal_ipi_send(target_core, EKK_IPI_MSG_BUFFER);

    return EKK_OK;
#else
    (void)target_core;
    (void)buf;
    (void)msg_type;
    return EKK_ERR_PARAM;
#endif
}

ekk_err_t ekk_buffer_receive(ekk_buffer_t **buf, uint32_t *msg_type, ekk_tick_t timeout)
{
#if EKK_MAX_CORES > 1
    if (!buf) {
        return EKK_ERR_PARAM;
    }

    uint32_t core = ekk_hal_get_core_id();
    ekk_buffer_queue_t *queue = &g_buffer_queues[core];

    ekk_hal_enter_critical();

    while (queue->count == 0) {
        ekk_hal_exit_critical();

        if (timeout == EKK_NO_WAIT) {
            return EKK_ERR_EMPTY;
        }

        ekk_err_t err = ekk_sched_block(timeout);
        if (err != EKK_OK) {
            return err;
        }

        ekk_hal_enter_critical();
    }

    /* Dequeue buffer */
    *buf = queue->buffers[queue->tail];
    if (msg_type) {
        *msg_type = queue->msg_types[queue->tail];
    }
    queue->tail = (queue->tail + 1) % 8;
    queue->count--;

    ekk_hal_exit_critical();

    return EKK_OK;
#else
    (void)buf;
    (void)msg_type;
    (void)timeout;
    return EKK_ERR_PARAM;
#endif
}

/* ==========================================================================
 * Remote Procedure Call (RPC)
 *
 * Synchronous function calls across cores.
 * Uses mailbox for request/response with completion notification.
 * ========================================================================== */

#if EKK_MAX_CORES > 1

/* RPC request structure */
typedef struct {
    void        (*func)(void*);     /**< Function to call */
    void        *arg;               /**< Argument */
    volatile int32_t result;        /**< Return value */
    volatile bool    completed;     /**< Completion flag */
    uint32_t    caller_core;        /**< Who sent the request */
} ekk_rpc_request_t;

/* Pending RPC requests per core */
static volatile ekk_rpc_request_t *g_rpc_pending[EKK_MAX_CORES];

/**
 * @brief RPC handler (called on target core)
 */
static void rpc_handle_request(ekk_rpc_request_t *req)
{
    if (req && req->func) {
        /* Execute the function */
        req->func(req->arg);
        req->result = 0;
    } else {
        req->result = -1;
    }

    /* Memory barrier before setting completed */
    ekk_hal_memory_barrier();

    /* Mark as completed */
    req->completed = true;

    /* Send IPI to wake caller */
    ekk_hal_ipi_send(req->caller_core, EKK_IPI_MSG_RPC_RESPONSE);
}

/**
 * @brief Process pending RPC requests (called from scheduler tick or IPI)
 */
void ekk_rpc_process(void)
{
    uint32_t core = ekk_hal_get_core_id();

    ekk_rpc_request_t *req = (ekk_rpc_request_t*)g_rpc_pending[core];
    if (req && !req->completed) {
        g_rpc_pending[core] = NULL;
        rpc_handle_request(req);
    }
}

#endif /* EKK_MAX_CORES > 1 */

int32_t ekk_call_on_core(uint32_t target_core, void (*func)(void*),
                         void *arg, ekk_tick_t timeout)
{
#if EKK_MAX_CORES > 1
    uint32_t my_core = ekk_hal_get_core_id();

    /* If calling own core, just execute directly */
    if (target_core == my_core || target_core >= EKK_MAX_CORES) {
        if (func) func(arg);
        return 0;
    }

    /* Create RPC request on stack (valid until function returns) */
    ekk_rpc_request_t request;
    request.func = func;
    request.arg = arg;
    request.result = -1;
    request.completed = false;
    request.caller_core = my_core;

    /* Post request to target core */
    ekk_hal_enter_critical();
    g_rpc_pending[target_core] = &request;
    ekk_hal_exit_critical();

    /* Send IPI to trigger execution */
    ekk_hal_ipi_send(target_core, EKK_IPI_MSG_RPC_REQUEST);

    /* Wait for completion */
    uint32_t start = ekk_hal_get_time_ms();
    uint32_t timeout_ms = (timeout == EKK_WAIT_FOREVER) ? 0xFFFFFFFF : timeout;

    while (!request.completed) {
        if (timeout != EKK_WAIT_FOREVER) {
            uint32_t elapsed = ekk_hal_get_time_ms() - start;
            if (elapsed >= timeout_ms) {
                /* Timeout - cancel request */
                ekk_hal_enter_critical();
                if (g_rpc_pending[target_core] == &request) {
                    g_rpc_pending[target_core] = NULL;
                }
                ekk_hal_exit_critical();
                return -1;
            }
        }

        /* Yield to let scheduler run */
        ekk_hal_idle();
    }

    return request.result;
#else
    (void)target_core;
    (void)timeout;

    /* Single-core: just call directly */
    if (func) func(arg);
    return 0;
#endif
}

uint32_t ekk_call_on_all(void (*func)(void*), void *arg, ekk_tick_t timeout)
{
#if EKK_MAX_CORES > 1
    uint32_t my_core = ekk_hal_get_core_id();
    uint32_t success_count = 0;

    /* Execute on own core first */
    if (func) {
        func(arg);
        success_count++;
    }

    /* Execute on all other cores */
    for (uint32_t i = 0; i < EKK_MAX_CORES; i++) {
        if (i != my_core) {
            if (ekk_call_on_core(i, func, arg, timeout) == 0) {
                success_count++;
            }
        }
    }

    return success_count;
#else
    (void)timeout;
    if (func) func(arg);
    return 1;
#endif
}

/* ==========================================================================
 * Statistics
 * ========================================================================== */

static ekk_ipc_stats_t g_ipc_stats[EKK_MAX_CORES];

void ekk_ipc_get_stats(uint32_t core_id, ekk_ipc_stats_t *stats)
{
    if (core_id >= EKK_MAX_CORES) {
        core_id = ekk_hal_get_core_id();
    }
    if (stats) {
        *stats = g_ipc_stats[core_id];
    }
}

void ekk_ipc_reset_stats(void)
{
    memset(g_ipc_stats, 0, sizeof(g_ipc_stats));
}
