/**
 * @file main.c
 * @brief EK-OS Kernel Main Entry Point
 *
 * This is where control transfers from the UEFI bootloader.
 * BSP (Bootstrap Processor) initialization happens here.
 */

#include "../boot/uefi_boot.h"
#include "../drivers/serial.h"
#include "../drivers/vga.h"
#include "../drivers/keyboard.h"
#include "gdt.h"
#include "idt.h"

/* EK-KOR includes */
#include <ekk/ekk.h>
#include <ekk/ekk_hal.h>
#include <ekk/ekk_module.h>

/* Version info */
#define EK_OS_VERSION "0.1.0"
#define EK_OS_CODENAME "Genesis"

/* EK-KOR module for this core (BSP) */
static ekk_module_t g_bsp_module;

/* Global boot info pointer */
static ek_boot_info_t *g_boot_info;

/* Kernel stack - 64KB aligned to 16 bytes */
static uint8_t kernel_stack[65536] __attribute__((aligned(16)));
#define KERNEL_STACK_TOP ((uint64_t)&kernel_stack[sizeof(kernel_stack)])

/* Keyboard interrupt handler */
static void keyboard_irq_handler(struct interrupt_frame *frame) {
    (void)frame;
    char c = keyboard_read();
    if (c) {
        serial_printf("Key: '%c' (0x%02x)\n", c >= 32 ? c : '.', (unsigned char)c);
        if (c >= 32 && c < 127) {
            vga_putchar(c);
        } else if (c == '\n') {
            vga_putchar('\n');
        } else if (c == '\b') {
            vga_putchar('\b');
        }
    }
}

/* Print memory map */
static void print_memory_map(void) {
    if (!g_boot_info || !g_boot_info->memory_map) {
        serial_printf("No memory map available\n");
        return;
    }

    serial_printf("\nMemory Map:\n");
    serial_printf("%-20s %-18s %-10s\n", "Type", "Physical Start", "Pages");
    serial_printf("----------------------------------------------------\n");

    static const char *mem_types[] = {
        "Reserved", "LoaderCode", "LoaderData", "BootServicesCode",
        "BootServicesData", "RuntimeCode", "RuntimeData", "Conventional",
        "Unusable", "ACPIReclaim", "ACPIMemNVS", "MMIO", "MMIOPortSpace",
        "PalCode", "Persistent"
    };

    uint8_t *mmap = (uint8_t *)g_boot_info->memory_map;
    UINTN entries = g_boot_info->memory_map_size / g_boot_info->memory_map_desc_size;
    uint64_t total_conventional = 0;

    for (UINTN i = 0; i < entries; i++) {
        EFI_MEMORY_DESCRIPTOR *desc = (EFI_MEMORY_DESCRIPTOR *)(mmap + i * g_boot_info->memory_map_desc_size);
        const char *type_str = desc->Type < 15 ? mem_types[desc->Type] : "Unknown";

        if (desc->Type == EfiConventionalMemory) {
            total_conventional += desc->NumberOfPages * 4096;
        }

        /* Only print first 10 entries to avoid flooding */
        if (i < 10) {
            serial_printf("%-20s 0x%016lx %lu\n",
                         type_str, desc->PhysicalStart, desc->NumberOfPages);
        }
    }

    serial_printf("... (%lu total entries)\n", entries);
    serial_printf("\nTotal conventional memory: %lu MB\n", total_conventional / (1024 * 1024));
}

/* Main kernel entry point */
void kernel_main(ek_boot_info_t *boot_info) {
    /* Save boot info pointer first */
    g_boot_info = boot_info;

    /* Switch to our own kernel stack - UEFI stack may be in BootServicesData
     * which becomes invalid after ExitBootServices */
    uint64_t kernel_stack_top = KERNEL_STACK_TOP;
    __asm__ volatile(
        "movq %0, %%rsp"
        : : "r"(kernel_stack_top) : "memory"
    );

    /* Continue with initialization - boot_info is in g_boot_info now */
    boot_info = g_boot_info;

    /* Initialize serial first for debug output */
    serial_init();

    /* Debug: print kernel stack location */
    uint64_t current_rsp;
    __asm__ volatile("movq %%rsp, %0" : "=r"(current_rsp));
    serial_printf("[STACK] Kernel stack top: 0x%016lx\n", kernel_stack_top);
    serial_printf("[STACK] Current RSP:      0x%016lx\n", current_rsp);
    serial_printf("\n\n");
    serial_printf("========================================\n");
    serial_printf("  EK-OS Kernel v%s (%s)\n", EK_OS_VERSION, EK_OS_CODENAME);
    serial_printf("  Based on EK-KOR Distributed RTOS\n");
    serial_printf("========================================\n\n");

    /* Verify boot info */
    if (boot_info->magic != EK_BOOT_MAGIC) {
        serial_printf("[FAIL] Invalid boot info magic: 0x%lx\n", boot_info->magic);
        goto halt;
    }
    serial_printf("[OK] Boot info valid\n");

    /* Initialize GDT */
    serial_printf("[....] Initializing GDT...\n");
    gdt_init();
    serial_printf("[OK] GDT initialized\n");

    /* Initialize IDT */
    serial_printf("[....] Initializing IDT...\n");
    idt_init();
    serial_printf("[OK] IDT initialized\n");

    /* Initialize VGA */
    serial_printf("[....] Initializing VGA...\n");
    vga_init();
    serial_printf("[OK] VGA initialized\n");

    /* Print banner on screen */
    vga_set_color(VGA_LIGHT_CYAN, VGA_BLACK);
    vga_printf("========================================\n");
    vga_printf("  EK-OS v%s (%s)\n", EK_OS_VERSION, EK_OS_CODENAME);
    vga_printf("  Based on EK-KOR Distributed RTOS\n");
    vga_printf("========================================\n\n");
    vga_set_color(VGA_WHITE, VGA_BLACK);

    /* Print ACPI info */
    if (boot_info->acpi_rsdp) {
        serial_printf("[OK] ACPI RSDP at 0x%lx\n", boot_info->acpi_rsdp);
        vga_printf("[OK] ACPI RSDP found\n");
    } else {
        serial_printf("[WARN] No ACPI RSDP\n");
        vga_printf("[WARN] No ACPI RSDP\n");
    }

    /* Print memory map */
    print_memory_map();
    vga_printf("[OK] Memory map loaded\n");

    /* Initialize keyboard */
    serial_printf("[....] Initializing keyboard...\n");
    keyboard_init();
    idt_register_handler(33, keyboard_irq_handler);
    serial_printf("[OK] Keyboard initialized\n");
    vga_printf("[OK] Keyboard initialized\n");

    /* Enable interrupts - IST stacks now configured for fault handling */
    interrupts_enable();
    serial_printf("[OK] Interrupts enabled\n");
    vga_printf("[OK] Interrupts enabled\n");

    /* Initialize EK-KOR HAL */
    serial_printf("[....] Initializing EK-KOR HAL...\n");
    if (ekk_hal_init() != EKK_OK) {
        serial_printf("[FAIL] EK-KOR HAL initialization failed\n");
        vga_set_color(VGA_LIGHT_RED, VGA_BLACK);
        vga_printf("[FAIL] EK-KOR HAL init failed\n");
        goto halt;
    }
    serial_printf("[OK] EK-KOR HAL initialized (%s)\n", ekk_hal_platform_name());
    vga_printf("[OK] EK-KOR HAL: %s\n", ekk_hal_platform_name());

    /* Initialize EK-KOR library */
    serial_printf("[....] Initializing EK-KOR library...\n");
    if (ekk_init() != EKK_OK) {
        serial_printf("[FAIL] EK-KOR initialization failed\n");
        vga_set_color(VGA_LIGHT_RED, VGA_BLACK);
        vga_printf("[FAIL] EK-KOR init failed\n");
        goto halt;
    }
    serial_printf("[OK] EK-KOR library initialized\n");
    vga_printf("[OK] EK-KOR library ready\n");

    /* Initialize BSP module */
    serial_printf("[....] Creating BSP module...\n");
    ekk_module_id_t my_id = ekk_hal_get_module_id();
    ekk_position_t bsp_pos = {.x = 0, .y = 0, .z = 0};
    if (ekk_module_init(&g_bsp_module, my_id, "bsp-core", bsp_pos) != EKK_OK) {
        serial_printf("[FAIL] Module initialization failed\n");
        vga_set_color(VGA_LIGHT_RED, VGA_BLACK);
        vga_printf("[FAIL] Module init failed\n");
        goto halt;
    }
    serial_printf("[OK] BSP module ID=%u initialized\n", my_id);
    vga_printf("[OK] Module ID=%u (BSP)\n", my_id);

    vga_printf("\n");
    vga_set_color(VGA_LIGHT_GREEN, VGA_BLACK);
    vga_printf("EK-OS boot complete!\n");
    vga_set_color(VGA_WHITE, VGA_BLACK);
    vga_printf("EK-KOR distributed RTOS running.\n");
    vga_printf("Type on keyboard to test input.\n\n");
    vga_printf("> ");

    serial_printf("\n[OK] Boot complete. Entering EK-KOR main loop.\n");

    /* Main loop - EK-KOR tick-based scheduling */
    ekk_time_us_t last_status = 0;
    while (1) {
        /* Get current time */
        ekk_time_us_t now = ekk_hal_time_us();

        /* Run EK-KOR module tick */
        ekk_module_tick(&g_bsp_module, now);

        /* Poll for serial input */
        char c = serial_getchar();
        if (c) {
            serial_printf("Serial input: '%c'\n", c);
            if (c == 'r') {
                serial_printf("Rebooting...\n");
                __asm__ volatile("int $0xFF");
            } else if (c == 's') {
                /* Status command */
                serial_printf("\n--- EK-KOR Status ---\n");
                serial_printf("Time: %lu us\n", (unsigned long)now);
                serial_printf("Module ID: %u\n", my_id);
                serial_printf("Platform: %s\n", ekk_hal_platform_name());
                serial_printf("---------------------\n");
            }
        }

        /* Print status every 5 seconds */
        if (now - last_status >= 5000000) {
            serial_printf("[EK-KOR] tick @%lu us, module=%u\n",
                         (unsigned long)now, my_id);
            last_status = now;
        }

        __asm__ volatile("hlt");
    }

halt:
    serial_printf("\n[HALT] System halted.\n");
    while (1) {
        __asm__ volatile("cli; hlt");
    }
}
