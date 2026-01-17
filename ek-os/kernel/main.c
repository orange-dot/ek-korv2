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
#include "../drivers/fb.h"
#include "../drivers/font.h"
#include "../drivers/gfx.h"
#include "../drivers/pci.h"
#include "../drivers/xhci.h"
#include "../drivers/usb.h"
#include "../drivers/usb_hid.h"
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

/* USB status for GUI display (volatile to prevent optimization) */
static volatile struct {
    int pci_ok;
    int xhci_ok;
    int usb_ok;
    int hid_ok;
    int usb_devices;
    int hid_keyboards;
    int hid_mice;
} g_usb_status;

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

/* Draw GUI with system status - reads actual driver state directly */
static void draw_status_gui(void) {
    if (!fb_available()) return;

    /* Clear screen */
    fb_clear(COLOR_BG_DARK);

    /* Draw header panel with gradient */
    gradient_t header_grad = {COLOR_ACCENT, COLOR_ACCENT_DARK};
    gfx_gradient_rounded(20, 20, 500, 60, 8, header_grad);
    font_string(40, 40, "EK-OS v" EK_OS_VERSION " (" EK_OS_CODENAME ")", COLOR_TEXT);

    /* Draw system info panel */
    gfx_rounded_rect_fill(20, 100, 500, 120, 8, COLOR_BG_PANEL);
    gfx_rounded_rect(20, 100, 500, 120, 8, COLOR_BORDER);

    font_string(40, 115, "System Status", COLOR_TEXT);
    font_string(40, 145, "Based on EK-KOR Distributed RTOS", COLOR_TEXT_DIM);
    font_string(40, 175, "Framebuffer: 1280x720", COLOR_SUCCESS);

    /* Draw USB status panel */
    gfx_rounded_rect_fill(20, 240, 500, 180, 8, COLOR_BG_PANEL);
    gfx_rounded_rect(20, 240, 500, 180, 8, COLOR_BORDER);

    font_string(40, 255, "USB Stack Status", COLOR_TEXT);

    /* Check actual driver state directly */
    int pci_ok = (pci_device_count > 0);
    int xhci_ok = g_xhci.initialized;
    int usb_ok = (usb_device_count >= 0 && xhci_ok);  /* usb_init was called */
    int hid_keyboards = 0;
    for (hid_device_t *h = hid_devices; h; h = h->next) {
        if (h->type == HID_TYPE_KEYBOARD) hid_keyboards++;
    }

    /* PCI status */
    if (pci_ok) {
        font_string(40, 285, "[OK] PCI bus scanned", COLOR_SUCCESS);
    } else {
        font_string(40, 285, "[--] PCI not initialized", COLOR_TEXT_DIM);
    }

    /* xHCI status */
    if (xhci_ok) {
        font_string(40, 310, "[OK] xHCI controller ready", COLOR_SUCCESS);
    } else {
        font_string(40, 310, "[!!] No xHCI controller", COLOR_ERROR);
    }

    /* USB status */
    if (usb_ok) {
        font_string(40, 335, "[OK] USB core initialized", COLOR_SUCCESS);
    } else if (xhci_ok) {
        font_string(40, 335, "[!!] USB init failed", COLOR_ERROR);
    } else {
        font_string(40, 335, "[--] USB not available", COLOR_TEXT_DIM);
    }

    /* HID status */
    if (hid_devices || xhci_ok) {
        font_string(40, 360, "[OK] HID driver ready", COLOR_SUCCESS);
    } else {
        font_string(40, 360, "[--] HID not available", COLOR_TEXT_DIM);
    }

    /* Device count */
    if (usb_device_count > 0) {
        font_string(40, 390, "USB devices found", COLOR_SUCCESS);
    } else if (usb_ok) {
        font_string(40, 390, "No USB devices connected", COLOR_TEXT_DIM);
    }

    /* Draw input panel */
    gfx_rounded_rect_fill(20, 440, 500, 80, 8, COLOR_BG_PANEL);
    gfx_rounded_rect(20, 440, 500, 80, 8, COLOR_BORDER);

    font_string(40, 455, "Input Devices", COLOR_TEXT);
    font_string(40, 485, "PS/2 keyboard: ready", COLOR_SUCCESS);

    if (hid_keyboards > 0) {
        font_string(280, 485, "USB keyboard: ready", COLOR_SUCCESS);
    } else if (xhci_ok) {
        font_string(280, 485, "USB keyboard: none", COLOR_TEXT_DIM);
    }

    /* Footer */
    font_string(40, 550, "Type on keyboard to test input (serial output)", COLOR_TEXT_DIM);
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

    /* Initialize USB status struct (BSS may not be zeroed in freestanding) */
    g_usb_status.pci_ok = 0;
    g_usb_status.xhci_ok = 0;
    g_usb_status.usb_ok = 0;
    g_usb_status.hid_ok = 0;
    g_usb_status.usb_devices = 0;
    g_usb_status.hid_keyboards = 0;
    g_usb_status.hid_mice = 0;

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

    /* Initialize VGA (fallback text mode) */
    serial_printf("[....] Initializing VGA...\n");
    vga_init();
    serial_printf("[OK] VGA initialized\n");

    /* Initialize framebuffer if available */
    if (boot_info->framebuffer_addr != 0) {
        serial_printf("[....] Initializing framebuffer...\n");
        fb_init(boot_info->framebuffer_addr,
                boot_info->framebuffer_width,
                boot_info->framebuffer_height,
                boot_info->framebuffer_pitch,
                boot_info->framebuffer_bpp,
                boot_info->framebuffer_pixfmt == EK_PIXFMT_BGR);
        font_init();

        serial_printf("[OK] Framebuffer: %ux%u @ 0x%lx\n",
                     boot_info->framebuffer_width,
                     boot_info->framebuffer_height,
                     boot_info->framebuffer_addr);

        /* Show boot splash while initializing */
        fb_clear(COLOR_BG_DARK);
        gradient_t header_grad = {COLOR_ACCENT, COLOR_ACCENT_DARK};
        gfx_gradient_rounded(20, 20, 400, 60, 8, header_grad);
        font_string(40, 40, "EK-OS v" EK_OS_VERSION " (" EK_OS_CODENAME ")", COLOR_TEXT);
        font_string(40, 120, "Initializing...", COLOR_TEXT_DIM);

        serial_printf("Resolution: %ux%u\n", boot_info->framebuffer_width, boot_info->framebuffer_height);
        serial_printf("[OK] Framebuffer ready, initializing drivers...\n");
    } else {
        serial_printf("[INFO] No framebuffer - using VGA text mode\n");

        /* Print banner on screen */
        vga_set_color(VGA_LIGHT_CYAN, VGA_BLACK);
        vga_printf("========================================\n");
        vga_printf("  EK-OS v%s (%s)\n", EK_OS_VERSION, EK_OS_CODENAME);
        vga_printf("  Based on EK-KOR Distributed RTOS\n");
        vga_printf("========================================\n\n");
        vga_set_color(VGA_WHITE, VGA_BLACK);
    }

    /* Print ACPI info */
    if (boot_info->acpi_rsdp) {
        serial_printf("[OK] ACPI RSDP at 0x%lx\n", boot_info->acpi_rsdp);
        if (!fb_available()) vga_printf("[OK] ACPI RSDP found\n");
    } else {
        serial_printf("[WARN] No ACPI RSDP\n");
        if (!fb_available()) vga_printf("[WARN] No ACPI RSDP\n");
    }

    /* Print memory map */
    print_memory_map();
    if (!fb_available()) vga_printf("[OK] Memory map loaded\n");

    /* Initialize keyboard (PS/2) */
    serial_printf("[....] Initializing PS/2 keyboard...\n");
    keyboard_init();
    idt_register_handler(33, keyboard_irq_handler);
    serial_printf("[OK] PS/2 keyboard initialized\n");
    if (!fb_available()) vga_printf("[OK] PS/2 keyboard initialized\n");

    /* Initialize PCI bus */
    serial_printf("[....] Initializing PCI...\n");
    pci_init();
    g_usb_status.pci_ok = 1;
    serial_printf("[OK] PCI bus scanned\n");
    if (!fb_available()) vga_printf("[OK] PCI bus scanned\n");

    /* Initialize xHCI (USB 3.0) controller */
    serial_printf("[....] Initializing xHCI...\n");
    if (xhci_init() == 0) {
        g_usb_status.xhci_ok = 1;
        serial_printf("[OK] xHCI controller initialized\n");
        if (!fb_available()) vga_printf("[OK] xHCI ready\n");

        /* Initialize USB core */
        serial_printf("[....] Initializing USB...\n");
        if (usb_init() == 0) {
            g_usb_status.usb_ok = 1;
            g_usb_status.usb_devices = usb_device_count;
            serial_printf("[OK] USB core initialized\n");
            if (!fb_available()) vga_printf("[OK] USB ready\n");

            /* Initialize HID driver */
            serial_printf("[....] Initializing USB HID...\n");
            hid_init();
            g_usb_status.hid_ok = 1;
            /* Count HID devices */
            for (hid_device_t *h = hid_devices; h; h = h->next) {
                if (h->type == HID_TYPE_KEYBOARD) g_usb_status.hid_keyboards++;
                if (h->type == HID_TYPE_MOUSE) g_usb_status.hid_mice++;
            }
            serial_printf("[OK] USB HID driver initialized\n");
            if (!fb_available()) vga_printf("[OK] USB HID ready\n");
        } else {
            serial_printf("[WARN] USB initialization failed\n");
            if (!fb_available()) vga_printf("[WARN] USB init failed\n");
        }
    } else {
        serial_printf("[WARN] No xHCI controller found\n");
        if (!fb_available()) vga_printf("[WARN] No xHCI\n");
    }

    /* Enable interrupts - IST stacks now configured for fault handling */
    interrupts_enable();
    serial_printf("[OK] Interrupts enabled\n");
    if (!fb_available()) vga_printf("[OK] Interrupts enabled\n");

    /* Initialize EK-KOR HAL */
    serial_printf("[....] Initializing EK-KOR HAL...\n");
    if (ekk_hal_init() != EKK_OK) {
        serial_printf("[FAIL] EK-KOR HAL initialization failed\n");
        if (!fb_available()) {
            vga_set_color(VGA_LIGHT_RED, VGA_BLACK);
            vga_printf("[FAIL] EK-KOR HAL init failed\n");
        }
        goto halt;
    }
    serial_printf("[OK] EK-KOR HAL initialized (%s)\n", ekk_hal_platform_name());
    if (!fb_available()) vga_printf("[OK] EK-KOR HAL: %s\n", ekk_hal_platform_name());

    /* Initialize EK-KOR library */
    serial_printf("[....] Initializing EK-KOR library...\n");
    if (ekk_init() != EKK_OK) {
        serial_printf("[FAIL] EK-KOR initialization failed\n");
        if (!fb_available()) {
            vga_set_color(VGA_LIGHT_RED, VGA_BLACK);
            vga_printf("[FAIL] EK-KOR init failed\n");
        }
        goto halt;
    }
    serial_printf("[OK] EK-KOR library initialized\n");
    if (!fb_available()) vga_printf("[OK] EK-KOR library ready\n");

    /* Initialize BSP module */
    serial_printf("[....] Creating BSP module...\n");
    ekk_module_id_t my_id = ekk_hal_get_module_id();
    ekk_position_t bsp_pos = {.x = 0, .y = 0, .z = 0};
    if (ekk_module_init(&g_bsp_module, my_id, "bsp-core", bsp_pos) != EKK_OK) {
        serial_printf("[FAIL] Module initialization failed\n");
        if (!fb_available()) {
            vga_set_color(VGA_LIGHT_RED, VGA_BLACK);
            vga_printf("[FAIL] Module init failed\n");
        }
        goto halt;
    }
    serial_printf("[OK] BSP module ID=%u initialized\n", my_id);
    if (!fb_available()) vga_printf("[OK] Module ID=%u (BSP)\n", my_id);

    /* Draw final status GUI with all info */
    serial_printf("[GUI] Status: pci=%d xhci=%d usb=%d hid=%d devs=%d kbd=%d\n",
                  g_usb_status.pci_ok, g_usb_status.xhci_ok,
                  g_usb_status.usb_ok, g_usb_status.hid_ok,
                  g_usb_status.usb_devices, g_usb_status.hid_keyboards);
    draw_status_gui();

    if (!fb_available()) {
        vga_printf("\n");
        vga_set_color(VGA_LIGHT_GREEN, VGA_BLACK);
        vga_printf("EK-OS boot complete!\n");
        vga_set_color(VGA_WHITE, VGA_BLACK);
        vga_printf("EK-KOR distributed RTOS running.\n");
        vga_printf("Type on keyboard to test input.\n\n");
        vga_printf("> ");
    }

    serial_printf("\n[OK] Boot complete. Entering EK-KOR main loop.\n");

    /* Main loop - EK-KOR tick-based scheduling */
    ekk_time_us_t last_status = 0;
    while (1) {
        /* Get current time */
        ekk_time_us_t now = ekk_hal_time_us();

        /* Run EK-KOR module tick */
        ekk_module_tick(&g_bsp_module, now);

        /* Poll USB HID devices */
        hid_poll();

        /* Check USB keyboard input */
        char usb_key = hid_keyboard_read();
        if (usb_key) {
            serial_printf("USB Key: '%c' (0x%02x)\n", usb_key >= 32 ? usb_key : '.', (unsigned char)usb_key);

            /* Display on framebuffer GUI */
            if (fb_available()) {
                static char input_buf[80];
                static int input_pos = 0;
                static int input_y = 500;

                if (usb_key >= 32 && usb_key < 127 && input_pos < 79) {
                    input_buf[input_pos++] = usb_key;
                    input_buf[input_pos] = '\0';
                    /* Clear input area and redraw */
                    fb_rect_fill(40, input_y, 600, 24, COLOR_BG_DARK);
                    font_string(40, input_y, "> ", COLOR_ACCENT);
                    font_string(60, input_y, input_buf, COLOR_TEXT);
                } else if (usb_key == '\n') {
                    /* Move to next line */
                    input_y += 24;
                    if (input_y > 680) input_y = 500;
                    input_pos = 0;
                    input_buf[0] = '\0';
                    fb_rect_fill(40, input_y, 600, 24, COLOR_BG_DARK);
                    font_string(40, input_y, "> ", COLOR_ACCENT);
                } else if (usb_key == '\b' && input_pos > 0) {
                    input_buf[--input_pos] = '\0';
                    fb_rect_fill(40, input_y, 600, 24, COLOR_BG_DARK);
                    font_string(40, input_y, "> ", COLOR_ACCENT);
                    font_string(60, input_y, input_buf, COLOR_TEXT);
                }
            }

            /* Also display on VGA text mode */
            if (usb_key >= 32 && usb_key < 127) {
                vga_putchar(usb_key);
            } else if (usb_key == '\n') {
                vga_putchar('\n');
            } else if (usb_key == '\b') {
                vga_putchar('\b');
            }
        }

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

        /* Yield CPU briefly (don't use HLT since we're polling) */
        __asm__ volatile("pause");
    }

halt:
    serial_printf("\n[HALT] System halted.\n");
    while (1) {
        __asm__ volatile("cli; hlt");
    }
}
