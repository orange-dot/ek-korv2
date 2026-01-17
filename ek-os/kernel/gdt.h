/**
 * @file gdt.h
 * @brief Global Descriptor Table for x86_64
 */

#ifndef EK_OS_GDT_H
#define EK_OS_GDT_H

#include <stdint.h>

/* GDT segment selectors */
#define GDT_NULL_SEG    0x00
#define GDT_CODE64_SEG  0x08
#define GDT_DATA64_SEG  0x10
#define GDT_USER_CODE   0x18
#define GDT_USER_DATA   0x20
#define GDT_TSS_SEG     0x28

/**
 * @brief Initialize the GDT
 */
void gdt_init(void);

/**
 * @brief Load GDT and reload segment registers
 */
void gdt_load(void);

#endif /* EK_OS_GDT_H */
