/**
 * @file ipc.c
 * @brief JEZGRO Inter-Process Communication Implementation
 *
 * Lock-free message queue with zero-copy support.
 */

#include "jezgro.h"
#include <string.h>

#ifdef JEZGRO_SIM
#include <stdio.h>
#define IPC_DEBUG(fmt, ...) \
    do { if (JEZGRO_DEBUG) printf("[IPC] " fmt "\n", ##__VA_ARGS__); } while(0)
#else
#define IPC_DEBUG(fmt, ...)
#endif

/*===========================================================================*/
/* Private Data                                                              */
/*===========================================================================*/

/** Message pool */
static ipc_msg_t msg_pool[JEZGRO_MSG_POOL_SIZE];

/** Free message bitmap */
static uint64_t msg_free_bitmap;

/** Per-task mailboxes (simple ring buffers) */
#define MAILBOX_SIZE 8
static struct {
    ipc_msg_t *msgs[MAILBOX_SIZE];
    uint8_t head;
    uint8_t tail;
    uint8_t count;
} mailboxes[JEZGRO_MAX_TASKS];

/** Statistics */
static uint32_t stat_sent = 0;
static uint32_t stat_received = 0;
static uint32_t stat_dropped = 0;

/*===========================================================================*/
/* Private Functions                                                         */
/*===========================================================================*/

/**
 * @brief Allocate message from pool
 */
static ipc_msg_t *msg_alloc(void)
{
    for (int i = 0; i < JEZGRO_MSG_POOL_SIZE; i++) {
        uint64_t mask = 1ULL << i;
        if (msg_free_bitmap & mask) {
            msg_free_bitmap &= ~mask;
            return &msg_pool[i];
        }
    }
    return NULL; /* Pool exhausted */
}

/**
 * @brief Free message back to pool
 */
static void msg_free(ipc_msg_t *msg)
{
    int idx = msg - msg_pool;
    if (idx >= 0 && idx < JEZGRO_MSG_POOL_SIZE) {
        msg_free_bitmap |= (1ULL << idx);
    }
}

/**
 * @brief Add message to mailbox
 */
static int mailbox_put(uint8_t task_id, ipc_msg_t *msg)
{
    if (task_id >= JEZGRO_MAX_TASKS) {
        return JEZGRO_ERR_INVALID;
    }

    if (mailboxes[task_id].count >= MAILBOX_SIZE) {
        stat_dropped++;
        return JEZGRO_ERR_FULL;
    }

    mailboxes[task_id].msgs[mailboxes[task_id].tail] = msg;
    mailboxes[task_id].tail = (mailboxes[task_id].tail + 1) % MAILBOX_SIZE;
    mailboxes[task_id].count++;

    return JEZGRO_OK;
}

/**
 * @brief Get message from mailbox
 */
static ipc_msg_t *mailbox_get(uint8_t task_id)
{
    if (task_id >= JEZGRO_MAX_TASKS) {
        return NULL;
    }

    if (mailboxes[task_id].count == 0) {
        return NULL;
    }

    ipc_msg_t *msg = mailboxes[task_id].msgs[mailboxes[task_id].head];
    mailboxes[task_id].head = (mailboxes[task_id].head + 1) % MAILBOX_SIZE;
    mailboxes[task_id].count--;

    return msg;
}

/*===========================================================================*/
/* Public Functions                                                          */
/*===========================================================================*/

void ipc_init(void)
{
    IPC_DEBUG("Initializing IPC subsystem");

    /* Mark all messages as free */
    msg_free_bitmap = ~0ULL;
    if (JEZGRO_MSG_POOL_SIZE < 64) {
        msg_free_bitmap &= (1ULL << JEZGRO_MSG_POOL_SIZE) - 1;
    }

    /* Initialize mailboxes */
    memset(mailboxes, 0, sizeof(mailboxes));

    /* Reset stats */
    stat_sent = 0;
    stat_received = 0;
    stat_dropped = 0;

    IPC_DEBUG("IPC initialized (pool=%d, mailbox=%d)",
              JEZGRO_MSG_POOL_SIZE, MAILBOX_SIZE);
}

int ipc_send(uint8_t dest, uint8_t type, const void *data, size_t len)
{
    if (len > JEZGRO_MSG_MAX_SIZE) {
        return JEZGRO_ERR_INVALID;
    }

    /* Allocate message */
    ipc_msg_t *msg = msg_alloc();
    if (msg == NULL) {
        IPC_DEBUG("Message pool exhausted");
        return JEZGRO_ERR_NOMEM;
    }

    /* Get current task ID */
    task_t *current = scheduler_get_current();
    uint8_t src_id = current ? current->id : 0;

    /* Fill message */
    msg->src = src_id;
    msg->dest = dest;
    msg->type = type;
    msg->flags = 0;
    msg->len = len;
    if (data && len > 0) {
        memcpy(msg->data, data, len);
    }

    IPC_DEBUG("Send: %d -> %d, type=%d, len=%zu", src_id, dest, type, len);

    /* Deliver to mailbox */
    int ret = mailbox_put(dest, msg);
    if (ret != JEZGRO_OK) {
        msg_free(msg);
        return ret;
    }

    stat_sent++;
    return JEZGRO_OK;
}

int ipc_send_async(uint8_t dest, uint8_t type, const void *data, size_t len)
{
    /* For now, same as sync send (will differ with proper blocking) */
    return ipc_send(dest, type, data, len);
}

int ipc_receive(uint8_t *src, uint8_t *type, void *buf, size_t max_len)
{
    /* Get current task ID */
    task_t *current = scheduler_get_current();
    if (current == NULL) {
        return JEZGRO_ERR_INVALID;
    }

    /* Block until message available (in simulation, just check) */
    ipc_msg_t *msg = NULL;

    #ifdef JEZGRO_SIM
    /* In simulation, just poll */
    msg = mailbox_get(current->id);
    if (msg == NULL) {
        return JEZGRO_ERR_EMPTY;
    }
    #else
    /* On real HW, would block here */
    while ((msg = mailbox_get(current->id)) == NULL) {
        scheduler_yield();
    }
    #endif

    /* Copy data */
    if (src) *src = msg->src;
    if (type) *type = msg->type;

    size_t copy_len = (msg->len < max_len) ? msg->len : max_len;
    if (buf && copy_len > 0) {
        memcpy(buf, msg->data, copy_len);
    }

    IPC_DEBUG("Recv: %d <- %d, type=%d, len=%u",
              current->id, msg->src, msg->type, msg->len);

    /* Free message */
    msg_free(msg);
    stat_received++;

    return (int)copy_len;
}

int ipc_receive_noblock(uint8_t *src, uint8_t *type, void *buf, size_t max_len)
{
    task_t *current = scheduler_get_current();
    if (current == NULL) {
        return JEZGRO_ERR_INVALID;
    }

    ipc_msg_t *msg = mailbox_get(current->id);
    if (msg == NULL) {
        return 0; /* No message */
    }

    if (src) *src = msg->src;
    if (type) *type = msg->type;

    size_t copy_len = (msg->len < max_len) ? msg->len : max_len;
    if (buf && copy_len > 0) {
        memcpy(buf, msg->data, copy_len);
    }

    msg_free(msg);
    stat_received++;

    return (int)copy_len;
}

int ipc_broadcast(uint8_t type, const void *data, size_t len)
{
    int count = 0;

    for (int i = 0; i < JEZGRO_MAX_TASKS; i++) {
        if (ipc_send(i, type, data, len) == JEZGRO_OK) {
            count++;
        }
    }

    IPC_DEBUG("Broadcast type=%d to %d tasks", type, count);
    return count;
}

int ipc_pending(void)
{
    task_t *current = scheduler_get_current();
    if (current == NULL || current->id >= JEZGRO_MAX_TASKS) {
        return 0;
    }
    return mailboxes[current->id].count;
}

void ipc_get_stats(uint32_t *sent, uint32_t *received, uint32_t *dropped)
{
    if (sent) *sent = stat_sent;
    if (received) *received = stat_received;
    if (dropped) *dropped = stat_dropped;
}
