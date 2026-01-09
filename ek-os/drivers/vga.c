/**
 * @file vga.c
 * @brief VGA text mode driver for EK-OS
 */

#include "vga.h"
#include "../lib/io.h"
#include "../lib/string.h"

#define VGA_BASE 0xB8000

static uint16_t *vga_buffer = (uint16_t *)VGA_BASE;
static int cursor_x = 0;
static int cursor_y = 0;
static uint8_t current_color = 0x0F; /* White on black */

static inline uint16_t vga_entry(char c, uint8_t color) {
    return (uint16_t)c | ((uint16_t)color << 8);
}

void vga_init(void) {
    vga_buffer = (uint16_t *)VGA_BASE;
    cursor_x = 0;
    cursor_y = 0;
    current_color = 0x0F;
    vga_clear();
}

void vga_clear(void) {
    for (int i = 0; i < VGA_WIDTH * VGA_HEIGHT; i++) {
        vga_buffer[i] = vga_entry(' ', current_color);
    }
    cursor_x = 0;
    cursor_y = 0;
    vga_set_cursor(0, 0);
}

void vga_set_color(enum vga_color fg, enum vga_color bg) {
    current_color = fg | (bg << 4);
}

void vga_putchar_at(int x, int y, char c) {
    if (x >= 0 && x < VGA_WIDTH && y >= 0 && y < VGA_HEIGHT) {
        vga_buffer[y * VGA_WIDTH + x] = vga_entry(c, current_color);
    }
}

static void scroll(void) {
    /* Move all lines up by one */
    memmove(vga_buffer, vga_buffer + VGA_WIDTH,
            (VGA_HEIGHT - 1) * VGA_WIDTH * sizeof(uint16_t));

    /* Clear the last line */
    for (int i = 0; i < VGA_WIDTH; i++) {
        vga_buffer[(VGA_HEIGHT - 1) * VGA_WIDTH + i] = vga_entry(' ', current_color);
    }
}

void vga_putchar(char c) {
    if (c == '\n') {
        cursor_x = 0;
        cursor_y++;
    } else if (c == '\r') {
        cursor_x = 0;
    } else if (c == '\t') {
        cursor_x = (cursor_x + 8) & ~7;
    } else if (c == '\b') {
        if (cursor_x > 0) {
            cursor_x--;
            vga_putchar_at(cursor_x, cursor_y, ' ');
        }
    } else {
        vga_putchar_at(cursor_x, cursor_y, c);
        cursor_x++;
    }

    if (cursor_x >= VGA_WIDTH) {
        cursor_x = 0;
        cursor_y++;
    }

    if (cursor_y >= VGA_HEIGHT) {
        scroll();
        cursor_y = VGA_HEIGHT - 1;
    }

    vga_set_cursor(cursor_x, cursor_y);
}

void vga_puts(const char *s) {
    while (*s) {
        vga_putchar(*s++);
    }
}

void vga_set_cursor(int x, int y) {
    cursor_x = x;
    cursor_y = y;
    uint16_t pos = y * VGA_WIDTH + x;

    outb(0x3D4, 0x0F);
    outb(0x3D5, (uint8_t)(pos & 0xFF));
    outb(0x3D4, 0x0E);
    outb(0x3D5, (uint8_t)((pos >> 8) & 0xFF));
}

void vga_get_cursor(int *x, int *y) {
    *x = cursor_x;
    *y = cursor_y;
}

/* Simple printf implementation for VGA */
static void vga_print_dec(uint64_t val) {
    char buf[21];
    int i = 0;

    if (val == 0) {
        vga_putchar('0');
        return;
    }

    while (val > 0) {
        buf[i++] = '0' + (val % 10);
        val /= 10;
    }

    while (i > 0) {
        vga_putchar(buf[--i]);
    }
}

static void vga_print_hex(uint64_t val, int width) {
    static const char hex[] = "0123456789abcdef";
    char buf[17];
    int i = 0;

    if (val == 0 && width <= 0) {
        vga_putchar('0');
        return;
    }

    while (val > 0 || i < width) {
        buf[i++] = hex[val & 0xF];
        val >>= 4;
    }

    while (i > 0) {
        vga_putchar(buf[--i]);
    }
}

void vga_printf(const char *fmt, ...) {
    va_list args;
    va_start(args, fmt);

    while (*fmt) {
        if (*fmt == '%') {
            fmt++;
            int width = 0;
            while (*fmt >= '0' && *fmt <= '9') {
                width = width * 10 + (*fmt - '0');
                fmt++;
            }

            switch (*fmt) {
                case 'd':
                case 'i': {
                    int val = va_arg(args, int);
                    if (val < 0) {
                        vga_putchar('-');
                        val = -val;
                    }
                    vga_print_dec(val);
                    break;
                }
                case 'u': {
                    unsigned int val = va_arg(args, unsigned int);
                    vga_print_dec(val);
                    break;
                }
                case 'x': {
                    unsigned int val = va_arg(args, unsigned int);
                    vga_print_hex(val, width);
                    break;
                }
                case 'l': {
                    fmt++;
                    if (*fmt == 'x') {
                        uint64_t val = va_arg(args, uint64_t);
                        vga_print_hex(val, width);
                    } else if (*fmt == 'u') {
                        uint64_t val = va_arg(args, uint64_t);
                        vga_print_dec(val);
                    }
                    break;
                }
                case 'p': {
                    vga_puts("0x");
                    uint64_t val = (uint64_t)va_arg(args, void*);
                    vga_print_hex(val, 16);
                    break;
                }
                case 's': {
                    const char *s = va_arg(args, const char*);
                    if (s) {
                        vga_puts(s);
                    } else {
                        vga_puts("(null)");
                    }
                    break;
                }
                case 'c': {
                    char c = (char)va_arg(args, int);
                    vga_putchar(c);
                    break;
                }
                case '%':
                    vga_putchar('%');
                    break;
                default:
                    vga_putchar('%');
                    vga_putchar(*fmt);
                    break;
            }
        } else {
            vga_putchar(*fmt);
        }
        fmt++;
    }

    va_end(args);
}
