/**
 * @file gdt.c
 * @brief Global Descriptor Table for x86_64
 */

#include "gdt.h"
#include "../lib/string.h"

/* GDT entry structure */
struct gdt_entry {
    uint16_t limit_low;
    uint16_t base_low;
    uint8_t  base_middle;
    uint8_t  access;
    uint8_t  granularity;
    uint8_t  base_high;
} __attribute__((packed));

/* GDT pointer structure */
struct gdt_ptr {
    uint16_t limit;
    uint64_t base;
} __attribute__((packed));

/* TSS structure */
struct tss {
    uint32_t reserved0;
    uint64_t rsp0;
    uint64_t rsp1;
    uint64_t rsp2;
    uint64_t reserved1;
    uint64_t ist1;
    uint64_t ist2;
    uint64_t ist3;
    uint64_t ist4;
    uint64_t ist5;
    uint64_t ist6;
    uint64_t ist7;
    uint64_t reserved2;
    uint16_t reserved3;
    uint16_t iopb;
} __attribute__((packed));

/* GDT with 6 entries + TSS (which takes 2 entries in 64-bit mode) */
static struct gdt_entry gdt[7] __attribute__((aligned(16)));
static struct gdt_ptr gdtr;
static struct tss tss __attribute__((aligned(16)));

static void gdt_set_entry(int num, uint32_t base, uint32_t limit, uint8_t access, uint8_t gran) {
    gdt[num].base_low = base & 0xFFFF;
    gdt[num].base_middle = (base >> 16) & 0xFF;
    gdt[num].base_high = (base >> 24) & 0xFF;
    gdt[num].limit_low = limit & 0xFFFF;
    gdt[num].granularity = ((limit >> 16) & 0x0F) | (gran & 0xF0);
    gdt[num].access = access;
}

static void gdt_set_tss(int num, uint64_t base, uint32_t limit) {
    /* Lower 8 bytes of TSS descriptor */
    gdt[num].limit_low = limit & 0xFFFF;
    gdt[num].base_low = base & 0xFFFF;
    gdt[num].base_middle = (base >> 16) & 0xFF;
    gdt[num].access = 0x89;  /* Present, TSS (Available) */
    gdt[num].granularity = ((limit >> 16) & 0x0F);
    gdt[num].base_high = (base >> 24) & 0xFF;

    /* Upper 8 bytes of TSS descriptor (base[63:32] + reserved) */
    struct gdt_entry *upper = &gdt[num + 1];
    uint32_t *base_upper = (uint32_t *)upper;
    base_upper[0] = (base >> 32) & 0xFFFFFFFF;
    base_upper[1] = 0;
}

/* Interrupt stacks for IST */
static uint8_t ist1_stack[8192] __attribute__((aligned(16)));  /* For Double Fault */
static uint8_t ist2_stack[8192] __attribute__((aligned(16)));  /* For NMI */
static uint8_t ist3_stack[8192] __attribute__((aligned(16)));  /* For Machine Check */

void gdt_init(void) {
    /* Clear GDT and TSS */
    memset(&gdt, 0, sizeof(gdt));
    memset(&tss, 0, sizeof(tss));

    /* Entry 0: Null descriptor */
    gdt_set_entry(0, 0, 0, 0, 0);

    /* Entry 1: Kernel code segment (64-bit) */
    gdt_set_entry(1, 0, 0xFFFFF,
                  0x9A,  /* Present, Ring 0, Code, Execute/Read */
                  0xA0); /* Long mode, 4KB granularity */

    /* Entry 2: Kernel data segment */
    gdt_set_entry(2, 0, 0xFFFFF,
                  0x92,  /* Present, Ring 0, Data, Read/Write */
                  0xC0); /* 32-bit, 4KB granularity (data in long mode ignores this) */

    /* Entry 3: User code segment (64-bit) */
    gdt_set_entry(3, 0, 0xFFFFF,
                  0xFA,  /* Present, Ring 3, Code, Execute/Read */
                  0xA0); /* Long mode, 4KB granularity */

    /* Entry 4: User data segment */
    gdt_set_entry(4, 0, 0xFFFFF,
                  0xF2,  /* Present, Ring 3, Data, Read/Write */
                  0xC0); /* 32-bit, 4KB granularity */

    /* Set up TSS with Interrupt Stack Table entries */
    tss.ist1 = (uint64_t)&ist1_stack[sizeof(ist1_stack)];  /* Double Fault stack */
    tss.ist2 = (uint64_t)&ist2_stack[sizeof(ist2_stack)];  /* NMI stack */
    tss.ist3 = (uint64_t)&ist3_stack[sizeof(ist3_stack)];  /* Machine Check stack */
    tss.iopb = sizeof(tss);  /* No I/O permission bitmap */

    /* Entry 5-6: TSS descriptor (spans two entries in 64-bit mode) */
    gdt_set_tss(5, (uint64_t)&tss, sizeof(tss) - 1);

    /* Set up GDTR */
    gdtr.limit = sizeof(gdt) - 1;
    gdtr.base = (uint64_t)&gdt;

    gdt_load();
}

/* Assembly function to load GDT */
void gdt_load(void) {
    __asm__ volatile(
        "lgdt %0\n\t"
        "mov $0x10, %%ax\n\t"
        "mov %%ax, %%ds\n\t"
        "mov %%ax, %%es\n\t"
        "mov %%ax, %%fs\n\t"
        "mov %%ax, %%gs\n\t"
        "mov %%ax, %%ss\n\t"
        /* Reload CS with far return trick */
        "pushq $0x08\n\t"
        "lea 1f(%%rip), %%rax\n\t"
        "pushq %%rax\n\t"
        "lretq\n\t"
        "1:\n\t"
        /* Load TSS */
        "mov $0x28, %%ax\n\t"
        "ltr %%ax\n\t"
        : : "m"(gdtr) : "rax", "memory"
    );
}
