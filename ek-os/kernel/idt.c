/**
 * @file idt.c
 * @brief Interrupt Descriptor Table for x86_64
 */

#include "idt.h"
#include "gdt.h"
#include "../lib/string.h"
#include "../lib/io.h"
#include "../drivers/serial.h"
#include "../drivers/vga.h"

/* IDT entry (interrupt gate) */
struct idt_entry {
    uint16_t offset_low;
    uint16_t selector;
    uint8_t  ist;
    uint8_t  type_attr;
    uint16_t offset_mid;
    uint32_t offset_high;
    uint32_t reserved;
} __attribute__((packed));

/* IDT pointer */
struct idt_ptr {
    uint16_t limit;
    uint64_t base;
} __attribute__((packed));

#define IDT_ENTRIES 256

static struct idt_entry idt[IDT_ENTRIES] __attribute__((aligned(16)));
static struct idt_ptr idtr;
static interrupt_handler_t handlers[IDT_ENTRIES];

/* External ISR stubs from interrupts.S */
extern void isr_stub_0(void);
extern void isr_stub_1(void);
extern void isr_stub_2(void);
extern void isr_stub_3(void);
extern void isr_stub_4(void);
extern void isr_stub_5(void);
extern void isr_stub_6(void);
extern void isr_stub_7(void);
extern void isr_stub_8(void);
extern void isr_stub_10(void);
extern void isr_stub_11(void);
extern void isr_stub_12(void);
extern void isr_stub_13(void);
extern void isr_stub_14(void);
extern void isr_stub_16(void);
extern void isr_stub_17(void);
extern void isr_stub_18(void);
extern void isr_stub_19(void);
extern void isr_stub_32(void);
extern void isr_stub_33(void);
extern void isr_stub_39(void);

static void idt_set_gate(uint8_t num, uint64_t handler, uint8_t ist, uint8_t type) {
    idt[num].offset_low = handler & 0xFFFF;
    idt[num].offset_mid = (handler >> 16) & 0xFFFF;
    idt[num].offset_high = (handler >> 32) & 0xFFFFFFFF;
    idt[num].selector = GDT_CODE64_SEG;
    idt[num].ist = ist;
    idt[num].type_attr = type;
    idt[num].reserved = 0;
}

/* Disable Local APIC to prevent spurious interrupts */
static void lapic_disable(void) {
    /* Local APIC base address - typically 0xFEE00000 */
    volatile uint32_t *lapic_sivr = (volatile uint32_t *)0xFEE000F0;

    /* Read current SIVR value */
    uint32_t sivr = *lapic_sivr;

    /* Clear bit 8 (APIC Software Enable) to disable APIC */
    sivr &= ~(1 << 8);

    /* Write back */
    *lapic_sivr = sivr;

    serial_printf("[IDT] Local APIC disabled\n");
}

/* PIC initialization (remap IRQs to 32-47) */
static void pic_init(void) {
    /* ICW1: Start initialization sequence */
    outb(0x20, 0x11);
    outb(0xA0, 0x11);
    io_wait();

    /* ICW2: Vector offsets */
    outb(0x21, 0x20);    /* PIC1: IRQ 0-7 -> INT 32-39 */
    outb(0xA1, 0x28);    /* PIC2: IRQ 8-15 -> INT 40-47 */
    io_wait();

    /* ICW3: Cascade identity */
    outb(0x21, 0x04);    /* PIC1: Slave on IRQ2 */
    outb(0xA1, 0x02);    /* PIC2: Cascade identity */
    io_wait();

    /* ICW4: 8086 mode */
    outb(0x21, 0x01);
    outb(0xA1, 0x01);
    io_wait();

    /* Mask all IRQs except keyboard (IRQ1) */
    outb(0x21, 0xFD);    /* Enable only IRQ1 (keyboard) */
    outb(0xA1, 0xFF);    /* Disable all IRQs on PIC2 */
}

/* Send End of Interrupt */
static void pic_send_eoi(uint8_t irq) {
    if (irq >= 8) {
        outb(0xA0, 0x20);
    }
    outb(0x20, 0x20);
}

/* Default exception handler */
static void default_exception_handler(struct interrupt_frame *frame) {
    serial_printf("\n!!! EXCEPTION %lu at RIP=0x%016lx !!!\n",
                  frame->int_no, frame->rip);
    serial_printf("Error code: 0x%016lx\n", frame->error_code);
    serial_printf("RAX=%016lx RBX=%016lx RCX=%016lx RDX=%016lx\n",
                  frame->rax, frame->rbx, frame->rcx, frame->rdx);
    serial_printf("RSI=%016lx RDI=%016lx RBP=%016lx RSP=%016lx\n",
                  frame->rsi, frame->rdi, frame->rbp, frame->rsp);
    serial_printf("CS=%04lx SS=%04lx RFLAGS=%016lx\n",
                  frame->cs, frame->ss, frame->rflags);

    vga_set_color(VGA_WHITE, VGA_RED);
    vga_printf("\n\n  KERNEL PANIC: Exception %lu  \n", frame->int_no);
    vga_set_color(VGA_WHITE, VGA_BLACK);

    /* Halt */
    while (1) {
        __asm__ volatile("cli; hlt");
    }
}

/* Common interrupt dispatcher (called from assembly)
 * IMPORTANT: We use RDI directly because GCC's prologue corrupts the frame parameter
 */
__attribute__((noinline, used))
void isr_common_handler(struct interrupt_frame *frame) {
    /* GCC may corrupt 'frame' in prologue - read RDI directly instead */
    struct interrupt_frame *real_frame;
    __asm__ volatile("movq %%rdi, %0" : "=r"(real_frame) : : );

    /* Use real_frame instead of frame */
    frame = real_frame;

    uint64_t int_no = frame->int_no;

    if (handlers[int_no]) {
        handlers[int_no](frame);
    } else if (int_no < 32) {
        default_exception_handler(frame);
    }

    /* Send EOI for hardware IRQs */
    if (int_no >= 32 && int_no < 48) {
        pic_send_eoi(int_no - 32);
    }
}

void idt_init(void) {
    memset(&idt, 0, sizeof(idt));
    memset(&handlers, 0, sizeof(handlers));

    /* 0x8E = Present, DPL=0, Interrupt Gate */
    /* 0x8F = Present, DPL=0, Trap Gate */
    #define INT_GATE 0x8E
    #define TRAP_GATE 0x8F

    /* CPU exceptions */
    idt_set_gate(0, (uint64_t)isr_stub_0, 0, INT_GATE);   /* Divide Error */
    idt_set_gate(1, (uint64_t)isr_stub_1, 0, INT_GATE);   /* Debug */
    idt_set_gate(2, (uint64_t)isr_stub_2, 2, INT_GATE);   /* NMI - uses IST2 */
    idt_set_gate(3, (uint64_t)isr_stub_3, 0, TRAP_GATE);  /* Breakpoint */
    idt_set_gate(4, (uint64_t)isr_stub_4, 0, INT_GATE);   /* Overflow */
    idt_set_gate(5, (uint64_t)isr_stub_5, 0, INT_GATE);   /* Bound Range */
    idt_set_gate(6, (uint64_t)isr_stub_6, 0, INT_GATE);   /* Invalid Opcode */
    idt_set_gate(7, (uint64_t)isr_stub_7, 0, INT_GATE);   /* Device Not Available */
    idt_set_gate(8, (uint64_t)isr_stub_8, 1, INT_GATE);   /* Double Fault - uses IST1 */
    idt_set_gate(10, (uint64_t)isr_stub_10, 0, INT_GATE); /* Invalid TSS */
    idt_set_gate(11, (uint64_t)isr_stub_11, 0, INT_GATE); /* Segment Not Present */
    idt_set_gate(12, (uint64_t)isr_stub_12, 0, INT_GATE); /* Stack Fault */
    idt_set_gate(13, (uint64_t)isr_stub_13, 0, INT_GATE); /* General Protection */
    idt_set_gate(14, (uint64_t)isr_stub_14, 0, INT_GATE); /* Page Fault */
    idt_set_gate(16, (uint64_t)isr_stub_16, 0, INT_GATE); /* x87 FPU Error */
    idt_set_gate(17, (uint64_t)isr_stub_17, 0, INT_GATE); /* Alignment Check */
    idt_set_gate(18, (uint64_t)isr_stub_18, 3, INT_GATE); /* Machine Check - uses IST3 */
    idt_set_gate(19, (uint64_t)isr_stub_19, 0, INT_GATE); /* SIMD Exception */

    /* Hardware IRQs (remapped to 32-47) */
    idt_set_gate(32, (uint64_t)isr_stub_32, 0, INT_GATE);  /* Timer */
    idt_set_gate(33, (uint64_t)isr_stub_33, 0, INT_GATE);  /* Keyboard */
    idt_set_gate(39, (uint64_t)isr_stub_39, 0, INT_GATE);  /* Spurious */

    /* Disable Local APIC to prevent spurious APIC interrupts */
    lapic_disable();

    /* Initialize PIC */
    pic_init();

    /* Load IDT */
    idtr.limit = sizeof(idt) - 1;
    idtr.base = (uint64_t)&idt;
    __asm__ volatile("lidt %0" : : "m"(idtr));
}

void idt_register_handler(uint8_t vector, interrupt_handler_t handler) {
    handlers[vector] = handler;
}
