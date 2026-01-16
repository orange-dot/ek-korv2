/**
 * @file mailbox.c
 * @brief VideoCore Mailbox Interface for Raspberry Pi 3B+
 *
 * @copyright Copyright (c) 2026 Elektrokombinacija
 * @license MIT
 *
 * The mailbox is used to communicate with the VideoCore GPU.
 * Property tags are used to configure the framebuffer, get hardware
 * info, and control various system functions.
 */

#include "mailbox.h"
#include "rpi3_hw.h"

/**
 * @brief Call the VideoCore mailbox with a property buffer
 *
 * The buffer must be 16-byte aligned. The buffer format is:
 *   [0] = total size in bytes
 *   [1] = request code (0 for request)
 *   [2] = tag ID
 *   [3] = value buffer size
 *   [4] = request/response indicator (0 for request)
 *   [5+] = value buffer
 *   ... more tags ...
 *   [N] = end tag (0)
 *
 * @param buffer 16-byte aligned buffer with property tags
 * @return 0 on success, -1 on failure
 */
int mbox_call(volatile uint32_t *buffer)
{
    /* Ensure 16-byte alignment */
    uint32_t addr = (uint32_t)(uintptr_t)buffer;
    if (addr & 0xF) {
        return -1;  /* Buffer not aligned */
    }

    /* Data synchronization barrier */
    __asm__ volatile("dsb sy" ::: "memory");

    /* Use direct ARM address - RPi3 VC sees same physical address space */
    uint32_t msg = (addr & ~0xF) | MBOX_CH_PROP;

    /* Wait for mailbox to be ready (not full) */
    while (mmio_read32(MBOX_STATUS) & MBOX_FULL) {
        __asm__ volatile("nop");
    }

    /* Write to mailbox */
    mmio_write32(MBOX_WRITE, msg);

    /* Wait for response */
    while (1) {
        /* Wait for response (not empty) */
        while (mmio_read32(MBOX_STATUS) & MBOX_EMPTY) {
            __asm__ volatile("nop");
        }

        /* Read response */
        uint32_t resp = mmio_read32(MBOX_READ);

        /* Check if this is our response (same channel) */
        if ((resp & 0xF) == MBOX_CH_PROP) {
            break;
        }
    }

    /* Memory barrier to see GPU's response */
    __asm__ volatile("dsb sy" ::: "memory");

    /* Check response code */
    if (buffer[1] != MBOX_RESPONSE_SUCCESS) {
        return -1;
    }

    return 0;
}
