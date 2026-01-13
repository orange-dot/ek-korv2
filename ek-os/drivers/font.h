/**
 * @file font.h
 * @brief Bitmap font rendering for EK-OS
 *
 * Provides 8x16 pixel bitmap font for GUI text rendering.
 */

#ifndef EK_OS_FONT_H
#define EK_OS_FONT_H

#include <stdint.h>

#define FONT_WIDTH  8
#define FONT_HEIGHT 16

/**
 * Initialize font system
 */
void font_init(void);

/**
 * Draw single character
 * @param x, y      Position (top-left of character)
 * @param c         ASCII character
 * @param fg        Foreground color (ARGB)
 */
void font_char(int x, int y, char c, uint32_t fg);

/**
 * Draw character with background
 * @param x, y      Position
 * @param c         ASCII character
 * @param fg        Foreground color
 * @param bg        Background color (use 0 for transparent)
 */
void font_char_bg(int x, int y, char c, uint32_t fg, uint32_t bg);

/**
 * Draw string (no background)
 * @param x, y      Position
 * @param s         Null-terminated string
 * @param fg        Foreground color
 */
void font_string(int x, int y, const char *s, uint32_t fg);

/**
 * Draw string with background
 * @param x, y      Position
 * @param s         String
 * @param fg        Foreground color
 * @param bg        Background color
 */
void font_string_bg(int x, int y, const char *s, uint32_t fg, uint32_t bg);

/**
 * Calculate string width in pixels
 */
int font_text_width(const char *s);

/**
 * Get font height
 */
static inline int font_text_height(void) {
    return FONT_HEIGHT;
}

#endif /* EK_OS_FONT_H */
