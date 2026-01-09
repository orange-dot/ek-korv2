/**
 * @file idt.h
 * @brief Interrupt Descriptor Table for x86_64
 */

#ifndef EK_OS_IDT_H
#define EK_OS_IDT_H

#include <stdint.h>

/* Interrupt numbers */
#define INT_DIVIDE_ERROR        0
#define INT_DEBUG               1
#define INT_NMI                 2
#define INT_BREAKPOINT          3
#define INT_OVERFLOW            4
#define INT_BOUND               5
#define INT_INVALID_OPCODE      6
#define INT_DEVICE_NOT_AVAIL    7
#define INT_DOUBLE_FAULT        8
#define INT_INVALID_TSS         10
#define INT_SEGMENT_NOT_PRESENT 11
#define INT_STACK_FAULT         12
#define INT_GENERAL_PROTECTION  13
#define INT_PAGE_FAULT          14
#define INT_X87_FPE             16
#define INT_ALIGNMENT_CHECK     17
#define INT_MACHINE_CHECK       18
#define INT_SIMD_FPE            19

/* IRQ mappings (remapped to 32-47) */
#define IRQ_BASE                32
#define IRQ_TIMER               0
#define IRQ_KEYBOARD            1
#define IRQ_CASCADE             2
#define IRQ_COM2                3
#define IRQ_COM1                4
#define IRQ_SPURIOUS            7

/* Interrupt frame passed to handlers */
struct interrupt_frame {
    uint64_t r15, r14, r13, r12, r11, r10, r9, r8;
    uint64_t rdi, rsi, rbp, rbx, rdx, rcx, rax;
    uint64_t int_no, error_code;
    uint64_t rip, cs, rflags, rsp, ss;
} __attribute__((packed));

/* Interrupt handler type */
typedef void (*interrupt_handler_t)(struct interrupt_frame *frame);

/**
 * @brief Initialize the IDT
 */
void idt_init(void);

/**
 * @brief Register an interrupt handler
 */
void idt_register_handler(uint8_t vector, interrupt_handler_t handler);

/**
 * @brief Enable interrupts
 */
static inline void interrupts_enable(void) {
    __asm__ volatile("sti");
}

/**
 * @brief Disable interrupts
 */
static inline void interrupts_disable(void) {
    __asm__ volatile("cli");
}

#endif /* EK_OS_IDT_H */
