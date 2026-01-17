/**
 * @file mailbox.h
 * @brief VideoCore Mailbox Interface for Raspberry Pi 3B+
 *
 * @copyright Copyright (c) 2026 Elektrokombinacija
 * @license MIT
 */

#ifndef RPI3_MAILBOX_H
#define RPI3_MAILBOX_H

#include <stdint.h>

/* Mailbox request/response codes */
#define MBOX_REQUEST            0x00000000
#define MBOX_RESPONSE_SUCCESS   0x80000000
#define MBOX_RESPONSE_ERROR     0x80000001

/* Property tags for framebuffer */
#define MBOX_TAG_SET_PHYS_WH    0x00048003  /* Set physical (display) width/height */
#define MBOX_TAG_SET_VIRT_WH    0x00048004  /* Set virtual (buffer) width/height */
#define MBOX_TAG_SET_DEPTH      0x00048005  /* Set bits per pixel */
#define MBOX_TAG_SET_PIXEL_ORDER 0x00048006 /* Set pixel order (RGB/BGR) */
#define MBOX_TAG_ALLOC_FB       0x00040001  /* Allocate framebuffer */
#define MBOX_TAG_GET_PITCH      0x00040008  /* Get bytes per row */
#define MBOX_TAG_END            0x00000000  /* End tag */

/* Pixel order values */
#define MBOX_PIXEL_ORDER_BGR    0
#define MBOX_PIXEL_ORDER_RGB    1

/**
 * @brief Call the VideoCore mailbox with a property buffer
 *
 * @param buffer 16-byte aligned buffer with property tags
 * @return 0 on success, -1 on failure
 */
int mbox_call(volatile uint32_t *buffer);

#endif /* RPI3_MAILBOX_H */
