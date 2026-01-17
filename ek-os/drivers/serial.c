/**
 * @file serial.c
 * @brief COM1 Serial port driver for EK-OS
 */

#include "serial.h"
#include "../lib/io.h"
#include "../lib/string.h"

void serial_init(void) {
    outb(COM1_PORT + 1, 0x00);    /* Disable all interrupts */
    outb(COM1_PORT + 3, 0x80);    /* Enable DLAB (set baud rate divisor) */
    outb(COM1_PORT + 0, 0x01);    /* Set divisor to 1 (115200 baud) */
    outb(COM1_PORT + 1, 0x00);    /*                  (hi byte) */
    outb(COM1_PORT + 3, 0x03);    /* 8 bits, no parity, one stop bit */
    outb(COM1_PORT + 2, 0xC7);    /* Enable FIFO, clear them, 14-byte threshold */
    outb(COM1_PORT + 4, 0x0B);    /* IRQs enabled, RTS/DSR set */

    /* Test serial chip (loopback) */
    outb(COM1_PORT + 4, 0x1E);    /* Set in loopback mode */
    outb(COM1_PORT + 0, 0xAE);    /* Send byte 0xAE */
    if (inb(COM1_PORT + 0) != 0xAE) {
        /* Serial port faulty - continue anyway for now */
    }

    /* Set normal operation mode */
    outb(COM1_PORT + 4, 0x0F);
}

static int serial_is_transmit_empty(void) {
    return inb(COM1_PORT + 5) & 0x20;
}

void serial_putchar(char c) {
    while (!serial_is_transmit_empty());
    outb(COM1_PORT, c);
}

void serial_puts(const char *s) {
    while (*s) {
        if (*s == '\n') {
            serial_putchar('\r');
        }
        serial_putchar(*s++);
    }
}

static int serial_received(void) {
    return inb(COM1_PORT + 5) & 1;
}

char serial_getchar(void) {
    if (!serial_received()) {
        return 0;
    }
    return inb(COM1_PORT);
}

/* Simple printf implementation */
static void print_dec(uint64_t val) {
    char buf[21];
    int i = 0;

    if (val == 0) {
        serial_putchar('0');
        return;
    }

    while (val > 0) {
        buf[i++] = '0' + (val % 10);
        val /= 10;
    }

    while (i > 0) {
        serial_putchar(buf[--i]);
    }
}

static void print_hex(uint64_t val, int width) {
    static const char hex[] = "0123456789abcdef";
    char buf[17];
    int i = 0;

    if (val == 0 && width <= 0) {
        serial_putchar('0');
        return;
    }

    while (val > 0 || i < width) {
        buf[i++] = hex[val & 0xF];
        val >>= 4;
    }

    while (i > 0) {
        serial_putchar(buf[--i]);
    }
}

void serial_printf(const char *fmt, ...) {
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
                        serial_putchar('-');
                        val = -val;
                    }
                    print_dec(val);
                    break;
                }
                case 'u': {
                    unsigned int val = va_arg(args, unsigned int);
                    print_dec(val);
                    break;
                }
                case 'x': {
                    unsigned int val = va_arg(args, unsigned int);
                    print_hex(val, width);
                    break;
                }
                case 'l': {
                    fmt++;
                    if (*fmt == 'x') {
                        uint64_t val = va_arg(args, uint64_t);
                        print_hex(val, width);
                    } else if (*fmt == 'u') {
                        uint64_t val = va_arg(args, uint64_t);
                        print_dec(val);
                    }
                    break;
                }
                case 'p': {
                    serial_puts("0x");
                    uint64_t val = (uint64_t)va_arg(args, void*);
                    print_hex(val, 16);
                    break;
                }
                case 's': {
                    const char *s = va_arg(args, const char*);
                    if (s) {
                        serial_puts(s);
                    } else {
                        serial_puts("(null)");
                    }
                    break;
                }
                case 'c': {
                    char c = (char)va_arg(args, int);
                    serial_putchar(c);
                    break;
                }
                case '%':
                    serial_putchar('%');
                    break;
                default:
                    serial_putchar('%');
                    serial_putchar(*fmt);
                    break;
            }
        } else {
            if (*fmt == '\n') {
                serial_putchar('\r');
            }
            serial_putchar(*fmt);
        }
        fmt++;
    }

    va_end(args);
}
