/**
 * @file ipc.h
 * @brief JEZGRO Inter-Process Communication
 *
 * Synchronous and asynchronous message passing between tasks/services.
 */

#ifndef IPC_H
#define IPC_H

#include <stdint.h>
#include <stddef.h>

/*===========================================================================*/
/* Message Types                                                             */
/*===========================================================================*/

#define IPC_MSG_TYPE_DATA       0x00
#define IPC_MSG_TYPE_REQUEST    0x01
#define IPC_MSG_TYPE_RESPONSE   0x02
#define IPC_MSG_TYPE_NOTIFY     0x03
#define IPC_MSG_TYPE_BROADCAST  0x04

/*===========================================================================*/
/* Message Flags                                                             */
/*===========================================================================*/

#define IPC_FLAG_ASYNC          0x01
#define IPC_FLAG_URGENT         0x02
#define IPC_FLAG_NOBLOCK        0x04

/*===========================================================================*/
/* Special Destinations                                                      */
/*===========================================================================*/

#define IPC_DEST_BROADCAST      0xFF
#define IPC_DEST_KERNEL         0x00

/*===========================================================================*/
/* IPC API                                                                   */
/*===========================================================================*/

/**
 * @brief Initialize IPC subsystem
 */
void ipc_init(void);

/**
 * @brief Send message (blocking)
 * @param dest Destination task/service ID
 * @param type Message type
 * @param data Pointer to data
 * @param len Data length
 * @return 0 on success, negative on error
 */
int ipc_send(uint8_t dest, uint8_t type, const void *data, size_t len);

/**
 * @brief Send message (non-blocking)
 * @param dest Destination task/service ID
 * @param type Message type
 * @param data Pointer to data
 * @param len Data length
 * @return 0 on success, negative on error
 */
int ipc_send_async(uint8_t dest, uint8_t type, const void *data, size_t len);

/**
 * @brief Receive message (blocking)
 * @param src Output: source ID
 * @param type Output: message type
 * @param buf Buffer for data
 * @param max_len Maximum data length
 * @return Actual data length, or negative on error
 */
int ipc_receive(uint8_t *src, uint8_t *type, void *buf, size_t max_len);

/**
 * @brief Receive message (non-blocking)
 * @param src Output: source ID
 * @param type Output: message type
 * @param buf Buffer for data
 * @param max_len Maximum data length
 * @return Actual data length, 0 if none, or negative on error
 */
int ipc_receive_noblock(uint8_t *src, uint8_t *type, void *buf, size_t max_len);

/**
 * @brief Broadcast message to all tasks
 * @param type Message type
 * @param data Pointer to data
 * @param len Data length
 * @return Number of recipients, or negative on error
 */
int ipc_broadcast(uint8_t type, const void *data, size_t len);

/**
 * @brief Check if messages pending for current task
 * @return Number of pending messages
 */
int ipc_pending(void);

/**
 * @brief Get IPC statistics
 * @param sent Output: messages sent
 * @param received Output: messages received
 * @param dropped Output: messages dropped
 */
void ipc_get_stats(uint32_t *sent, uint32_t *received, uint32_t *dropped);

#endif /* IPC_H */
