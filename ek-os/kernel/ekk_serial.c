/**
 * @file ekk_serial.c
 * @brief EK-KOR serial output override for EK-OS
 *
 * @copyright Copyright (c) 2026 Elektrokombinacija
 * @license MIT
 *
 * This file overrides the weak ekk_hal_printf symbol from EK-KOR HAL
 * to provide serial output using EK-OS's serial driver.
 */

#include "../drivers/serial.h"
#include <stdarg.h>

/**
 * @brief EK-KOR debug print - override weak symbol
 *
 * Routes EK-KOR debug output to EK-OS serial port.
 */
void ekk_hal_printf(const char *fmt, ...) {
    va_list args;
    va_start(args, fmt);

    serial_printf("[EKK] ");

    /* Manual format handling for freestanding environment */
    const char *p = fmt;
    while (*p) {
        if (*p == '%') {
            p++;
            switch (*p) {
                case 'd':
                case 'i':
                    serial_printf("%d", va_arg(args, int));
                    break;
                case 'u':
                    serial_printf("%u", va_arg(args, unsigned int));
                    break;
                case 'l':
                    p++;
                    if (*p == 'u') {
                        serial_printf("%lu", va_arg(args, unsigned long));
                    } else if (*p == 'd') {
                        serial_printf("%ld", va_arg(args, long));
                    } else {
                        serial_putchar('%');
                        serial_putchar('l');
                        serial_putchar(*p);
                    }
                    break;
                case 'x':
                    serial_printf("%x", va_arg(args, unsigned int));
                    break;
                case 'X':
                    serial_printf("%X", va_arg(args, unsigned int));
                    break;
                case 's':
                    serial_printf("%s", va_arg(args, const char *));
                    break;
                case 'c':
                    serial_putchar((char)va_arg(args, int));
                    break;
                case '%':
                    serial_putchar('%');
                    break;
                default:
                    serial_putchar('%');
                    serial_putchar(*p);
                    break;
            }
        } else {
            serial_putchar(*p);
        }
        p++;
    }

    va_end(args);
}

/**
 * @brief EK-KOR assert failure - override weak symbol
 */
void ekk_hal_assert_fail(const char *file, int line, const char *expr) {
    serial_printf("\n!!! EK-KOR ASSERT FAILED !!!\n");
    serial_printf("File: %s\n", file);
    serial_printf("Line: %d\n", line);
    serial_printf("Expr: %s\n", expr);

    /* Halt the system */
    __asm__ volatile("cli");
    while (1) {
        __asm__ volatile("hlt");
    }
}
