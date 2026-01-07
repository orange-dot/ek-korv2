/**
 * @file ipc.c
 * @brief ek-kor Inter-Process Communication Implementation
 */

#include <ek-kor/ek-kor.h>
#include <string.h>

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

    /* TODO: Send IPI to target core */
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
 * Zero-Copy Buffer Pool (stub)
 * ========================================================================== */

ekk_err_t ekk_buffer_pool_init(void)
{
    return EKK_OK;
}

ekk_buffer_t* ekk_buffer_alloc(uint32_t size)
{
    (void)size;
    return NULL; /* TODO */
}

void ekk_buffer_ref(ekk_buffer_t *buf)
{
    if (buf) buf->ref_count++;
}

void ekk_buffer_release(ekk_buffer_t *buf)
{
    if (buf && buf->ref_count > 0) {
        buf->ref_count--;
    }
}

ekk_err_t ekk_buffer_send(uint32_t target_core, ekk_buffer_t *buf, uint32_t msg_type)
{
    (void)target_core;
    (void)buf;
    (void)msg_type;
    return EKK_ERR_PARAM; /* TODO */
}

ekk_err_t ekk_buffer_receive(ekk_buffer_t **buf, uint32_t *msg_type, ekk_tick_t timeout)
{
    (void)buf;
    (void)msg_type;
    (void)timeout;
    return EKK_ERR_PARAM; /* TODO */
}

/* ==========================================================================
 * RPC (stub)
 * ========================================================================== */

int32_t ekk_call_on_core(uint32_t target_core, void (*func)(void*),
                         void *arg, ekk_tick_t timeout)
{
    (void)target_core;
    (void)timeout;

    /* On single-core, just call directly */
    if (func) func(arg);
    return 0;
}

uint32_t ekk_call_on_all(void (*func)(void*), void *arg, ekk_tick_t timeout)
{
    (void)timeout;
    if (func) func(arg);
    return 1;
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
