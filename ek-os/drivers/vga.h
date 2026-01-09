/**
 * @file vga.h
 * @brief VGA text mode driver for EK-OS
 */

#ifndef EK_OS_VGA_H
#define EK_OS_VGA_H

#include <stdint.h>
#include <stdarg.h>

#define VGA_WIDTH  80
#define VGA_HEIGHT 25

/* VGA colors */
enum vga_color {
    VGA_BLACK = 0,
    VGA_BLUE = 1,
    VGA_GREEN = 2,
    VGA_CYAN = 3,
    VGA_RED = 4,
    VGA_MAGENTA = 5,
    VGA_BROWN = 6,
    VGA_LIGHT_GREY = 7,
    VGA_DARK_GREY = 8,
    VGA_LIGHT_BLUE = 9,
    VGA_LIGHT_GREEN = 10,
    VGA_LIGHT_CYAN = 11,
    VGA_LIGHT_RED = 12,
    VGA_LIGHT_MAGENTA = 13,
    VGA_LIGHT_BROWN = 14,
    VGA_WHITE = 15,
};

/**
 * @brief Initialize VGA text mode
 */
void vga_init(void);

/**
 * @brief Clear the screen
 */
void vga_clear(void);

/**
 * @brief Set text color
 */
void vga_set_color(enum vga_color fg, enum vga_color bg);

/**
 * @brief Put a character at position
 */
void vga_putchar_at(int x, int y, char c);

/**
 * @brief Write a character at cursor position
 */
void vga_putchar(char c);

/**
 * @brief Write a string at cursor position
 */
void vga_puts(const char *s);

/**
 * @brief Printf-style output to VGA
 */
void vga_printf(const char *fmt, ...);

/**
 * @brief Set cursor position
 */
void vga_set_cursor(int x, int y);

/**
 * @brief Get current cursor position
 */
void vga_get_cursor(int *x, int *y);

#endif /* EK_OS_VGA_H */
