/**
 * @file serial.h
 * @brief COM1 Serial port driver for EK-OS
 */

#ifndef EK_OS_SERIAL_H
#define EK_OS_SERIAL_H

#include <stdint.h>
#include <stdarg.h>

#define COM1_PORT 0x3F8

/**
 * @brief Initialize COM1 serial port (115200 baud, 8N1)
 */
void serial_init(void);

/**
 * @brief Write a character to serial port
 */
void serial_putchar(char c);

/**
 * @brief Write a string to serial port
 */
void serial_puts(const char *s);

/**
 * @brief Read a character from serial port (non-blocking)
 * @return Character read, or 0 if no data available
 */
char serial_getchar(void);

/**
 * @brief Printf-style output to serial port
 */
void serial_printf(const char *fmt, ...);

#endif /* EK_OS_SERIAL_H */
