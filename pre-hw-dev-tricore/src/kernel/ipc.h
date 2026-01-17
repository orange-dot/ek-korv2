/**
 * @file ipc.h
 * @brief JEZGRO Inter-Process Communication
 *
 * Cross-core and same-core message passing:
 *   - Message queues (per-core)
 *   - Mailboxes (cross-core, in LMU shared memory)
 *   - Zero-copy buffers for large data
 */

#ifndef IPC_H
#define IPC_H

#include "jezgro.h"

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Configuration
 * ========================================================================== */

/** Maximum message size for queues (bytes) */
#define IPC_MAX_MSG_SIZE        64

/** Default queue depth */
#define IPC_DEFAULT_QUEUE_DEPTH 16

/** Maximum mailbox message size */
#define IPC_MAILBOX_MSG_SIZE    32

/** Number of mailbox slots */
#define IPC_MAILBOX_SLOTS       8

/* ==========================================================================
 * Message Queue (Per-Core)
 * ========================================================================== */

/**
 * @brief Message queue structure
 *
 * Fixed-size message queue for same-core communication.
 * For cross-core, use mailboxes.
 */
typedef struct {
    uint8_t         *buffer;            /**< Message buffer */
    uint32_t        msg_size;           /**< Size per message */
    uint32_t        capacity;           /**< Max messages */
    volatile uint32_t head;             /**< Write index */
    volatile uint32_t tail;             /**< Read index */
    volatile uint32_t count;            /**< Current count */
    task_handle_t   send_wait;          /**< Senders waiting */
    task_handle_t   recv_wait;          /**< Receivers waiting */
    const char      *name;              /**< Queue name */
} ipc_queue_t;

/**
 * @brief Create message queue
 *
 * @param queue Queue structure to initialize
 * @param name Queue name
 * @param msg_size Size of each message in bytes
 * @param capacity Maximum number of messages
 * @param buffer Pre-allocated buffer (NULL = auto-allocate)
 * @return JEZGRO_OK on success
 */
jezgro_error_t ipc_queue_create(ipc_queue_t *queue, const char *name,
                                uint32_t msg_size, uint32_t capacity,
                                void *buffer);

/**
 * @brief Delete message queue
 *
 * Wakes all waiting tasks with error.
 *
 * @param queue Queue to delete
 * @return JEZGRO_OK on success
 */
jezgro_error_t ipc_queue_delete(ipc_queue_t *queue);

/**
 * @brief Send message to queue
 *
 * Copies message to queue. Blocks if full (unless timeout=0).
 *
 * @param queue Target queue
 * @param msg Message data
 * @param timeout Timeout in ticks
 * @return JEZGRO_OK on success
 */
jezgro_error_t ipc_queue_send(ipc_queue_t *queue, const void *msg,
                              jezgro_ticks_t timeout);

/**
 * @brief Send message to front of queue (urgent)
 *
 * @param queue Target queue
 * @param msg Message data
 * @param timeout Timeout in ticks
 * @return JEZGRO_OK on success
 */
jezgro_error_t ipc_queue_send_front(ipc_queue_t *queue, const void *msg,
                                    jezgro_ticks_t timeout);

/**
 * @brief Receive message from queue
 *
 * Copies message from queue. Blocks if empty (unless timeout=0).
 *
 * @param queue Source queue
 * @param msg Buffer for message
 * @param timeout Timeout in ticks
 * @return JEZGRO_OK on success
 */
jezgro_error_t ipc_queue_receive(ipc_queue_t *queue, void *msg,
                                 jezgro_ticks_t timeout);

/**
 * @brief Peek at front message without removing
 *
 * @param queue Queue to peek
 * @param msg Buffer for message
 * @return JEZGRO_OK if message available
 */
jezgro_error_t ipc_queue_peek(ipc_queue_t *queue, void *msg);

/**
 * @brief Get queue message count
 * @param queue Queue to query
 * @return Number of messages in queue
 */
uint32_t ipc_queue_count(ipc_queue_t *queue);

/**
 * @brief Get queue free space
 * @param queue Queue to query
 * @return Number of free slots
 */
uint32_t ipc_queue_space(ipc_queue_t *queue);

/**
 * @brief Check if queue is empty
 */
bool ipc_queue_is_empty(ipc_queue_t *queue);

/**
 * @brief Check if queue is full
 */
bool ipc_queue_is_full(ipc_queue_t *queue);

/**
 * @brief Flush all messages from queue
 * @param queue Queue to flush
 */
void ipc_queue_flush(ipc_queue_t *queue);

/* ==========================================================================
 * Cross-Core Mailbox
 * ========================================================================== */

/**
 * @brief Mailbox slot status
 */
typedef enum {
    MAILBOX_SLOT_EMPTY      = 0,        /**< Slot available */
    MAILBOX_SLOT_FULL       = 1,        /**< Message waiting */
    MAILBOX_SLOT_CLAIMED    = 2,        /**< Being read */
} mailbox_slot_status_t;

/**
 * @brief Mailbox slot
 */
typedef struct {
    volatile uint32_t status;           /**< Slot status */
    uint32_t sender_core;               /**< Sender core ID */
    uint32_t msg_type;                  /**< Message type */
    uint8_t data[IPC_MAILBOX_MSG_SIZE]; /**< Message data */
} mailbox_slot_t;

/**
 * @brief Cross-core mailbox
 *
 * Placed in LMU shared memory.
 * Each core has a mailbox for receiving messages.
 */
typedef struct {
    mailbox_slot_t  slots[IPC_MAILBOX_SLOTS];   /**< Message slots */
    volatile uint32_t write_idx;                 /**< Next write slot */
    volatile uint32_t read_idx;                  /**< Next read slot */
    volatile uint32_t pending_count;             /**< Messages pending */
    uint32_t        owner_core;                  /**< Receiving core */
    const char      *name;                       /**< Mailbox name */
} ipc_mailbox_t;

/**
 * @brief Initialize mailbox system
 *
 * Called once from CPU0.
 * Sets up per-core mailboxes in shared memory.
 *
 * @return JEZGRO_OK on success
 */
jezgro_error_t ipc_mailbox_init(void);

/**
 * @brief Get mailbox for core
 *
 * @param core_id Target core
 * @return Mailbox pointer or NULL
 */
ipc_mailbox_t* ipc_mailbox_get(uint32_t core_id);

/**
 * @brief Send message to core's mailbox
 *
 * Non-blocking. Returns error if mailbox full.
 * Sends IPI to wake target core.
 *
 * @param target_core Destination core
 * @param msg_type Application-defined message type
 * @param data Message data
 * @param size Data size (max IPC_MAILBOX_MSG_SIZE)
 * @return JEZGRO_OK on success
 */
jezgro_error_t ipc_mailbox_send(uint32_t target_core, uint32_t msg_type,
                                const void *data, uint32_t size);

/**
 * @brief Receive message from own mailbox
 *
 * @param msg_type Output: message type
 * @param data Buffer for message
 * @param size Buffer size
 * @param sender_core Output: sender core ID
 * @param timeout Timeout in ticks (0 = poll)
 * @return JEZGRO_OK on success
 */
jezgro_error_t ipc_mailbox_receive(uint32_t *msg_type, void *data,
                                   uint32_t size, uint32_t *sender_core,
                                   jezgro_ticks_t timeout);

/**
 * @brief Check if mailbox has pending messages
 * @param core_id Core to check
 * @return Number of pending messages
 */
uint32_t ipc_mailbox_pending(uint32_t core_id);

/**
 * @brief Broadcast message to all cores
 *
 * @param msg_type Message type
 * @param data Message data
 * @param size Data size
 * @return Number of cores that received message
 */
uint32_t ipc_mailbox_broadcast(uint32_t msg_type, const void *data, uint32_t size);

/* ==========================================================================
 * Zero-Copy Buffer Pool
 * ========================================================================== */

/**
 * @brief Buffer descriptor
 */
typedef struct {
    void            *data;              /**< Data pointer */
    uint32_t        size;               /**< Buffer size */
    volatile uint32_t ref_count;        /**< Reference count */
    uint32_t        owner_core;         /**< Allocating core */
    uint32_t        flags;              /**< Buffer flags */
} ipc_buffer_t;

/** Number of shared buffers */
#define IPC_BUFFER_POOL_SIZE    32

/**
 * @brief Initialize buffer pool
 * @return JEZGRO_OK on success
 */
jezgro_error_t ipc_buffer_pool_init(void);

/**
 * @brief Allocate shared buffer
 *
 * @param size Required size
 * @return Buffer descriptor or NULL
 */
ipc_buffer_t* ipc_buffer_alloc(uint32_t size);

/**
 * @brief Add reference to buffer
 *
 * @param buf Buffer to reference
 */
void ipc_buffer_ref(ipc_buffer_t *buf);

/**
 * @brief Release buffer reference
 *
 * Buffer freed when ref count reaches zero.
 *
 * @param buf Buffer to release
 */
void ipc_buffer_release(ipc_buffer_t *buf);

/**
 * @brief Send buffer to another core
 *
 * Transfers ownership. Receiver must release.
 *
 * @param target_core Destination core
 * @param buf Buffer to send
 * @param msg_type Message type
 * @return JEZGRO_OK on success
 */
jezgro_error_t ipc_buffer_send(uint32_t target_core, ipc_buffer_t *buf,
                               uint32_t msg_type);

/**
 * @brief Receive buffer from mailbox
 *
 * @param buf Output: buffer pointer
 * @param msg_type Output: message type
 * @param timeout Timeout in ticks
 * @return JEZGRO_OK on success
 */
jezgro_error_t ipc_buffer_receive(ipc_buffer_t **buf, uint32_t *msg_type,
                                  jezgro_ticks_t timeout);

/* ==========================================================================
 * Standard Message Types
 * ========================================================================== */

/** Message type: No specific type */
#define IPC_MSG_GENERIC         0

/** Message type: Remote function call */
#define IPC_MSG_RPC             1

/** Message type: RPC response */
#define IPC_MSG_RPC_REPLY       2

/** Message type: Scheduler event */
#define IPC_MSG_SCHEDULER       3

/** Message type: Zero-copy buffer */
#define IPC_MSG_BUFFER          4

/** Message type: Shutdown request */
#define IPC_MSG_SHUTDOWN        5

/** First application message type */
#define IPC_MSG_USER            0x100

/* ==========================================================================
 * Remote Procedure Call (RPC)
 * ========================================================================== */

/**
 * @brief RPC request structure
 */
typedef struct {
    void            (*func)(void*);     /**< Function to call */
    void            *arg;               /**< Argument */
    volatile bool   done;               /**< Completion flag */
    volatile int32_t result;            /**< Return value */
} ipc_rpc_t;

/**
 * @brief Call function on another core
 *
 * Blocking call - waits for completion.
 *
 * @param target_core Destination core
 * @param func Function to call
 * @param arg Argument to pass
 * @param timeout Timeout in ticks
 * @return Function result or error code
 */
int32_t ipc_call_on_core(uint32_t target_core, void (*func)(void*),
                         void *arg, jezgro_ticks_t timeout);

/**
 * @brief Call function on all cores
 *
 * Blocking - waits for all to complete.
 *
 * @param func Function to call
 * @param arg Argument
 * @param timeout Timeout per core
 * @return Number of successful calls
 */
uint32_t ipc_call_on_all(void (*func)(void*), void *arg, jezgro_ticks_t timeout);

/* ==========================================================================
 * Statistics
 * ========================================================================== */

/**
 * @brief IPC statistics
 */
typedef struct {
    uint32_t        messages_sent;      /**< Total sent */
    uint32_t        messages_received;  /**< Total received */
    uint32_t        send_failures;      /**< Send failures */
    uint32_t        receive_timeouts;   /**< Receive timeouts */
    uint32_t        buffers_allocated;  /**< Buffers allocated */
    uint32_t        buffers_freed;      /**< Buffers freed */
} ipc_stats_t;

/**
 * @brief Get IPC statistics for core
 *
 * @param core_id Core to query
 * @param stats Output statistics
 */
void ipc_get_stats(uint32_t core_id, ipc_stats_t *stats);

/**
 * @brief Reset IPC statistics
 */
void ipc_reset_stats(void);

#ifdef __cplusplus
}
#endif

#endif /* IPC_H */
