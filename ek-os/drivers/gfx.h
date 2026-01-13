/**
 * @file gfx.h
 * @brief Modern graphics primitives for EK-OS
 *
 * Provides React-style visual effects: gradients, rounded corners, shadows.
 */

#ifndef EK_OS_GFX_H
#define EK_OS_GFX_H

#include <stdint.h>

/* Gradient definition */
typedef struct {
    uint32_t top;       /* Top color (ARGB) */
    uint32_t bottom;    /* Bottom color (ARGB) */
} gradient_t;

/* Shadow definition */
typedef struct {
    int offset_x;       /* Horizontal offset */
    int offset_y;       /* Vertical offset */
    int blur;           /* Blur radius (0 = sharp) */
    uint32_t color;     /* Shadow color (ARGB with alpha) */
} shadow_t;

/* Pre-defined color scheme (dark theme) */
#define COLOR_BG_DARK       0xFF1E1E2E  /* Dark background */
#define COLOR_BG_PANEL      0xFF2D2D3D  /* Panel background */
#define COLOR_BG_INPUT      0xFF252532  /* Input field background */
#define COLOR_ACCENT        0xFF7C3AED  /* Purple accent */
#define COLOR_ACCENT_LIGHT  0xFF8B5CF6  /* Light purple */
#define COLOR_ACCENT_DARK   0xFF6D28D9  /* Dark purple */
#define COLOR_TEXT          0xFFE4E4E7  /* Light text */
#define COLOR_TEXT_DIM      0xFF71717A  /* Dimmed text */
#define COLOR_BORDER        0xFF3F3F46  /* Border color */
#define COLOR_SUCCESS       0xFF22C55E  /* Green */
#define COLOR_ERROR         0xFFEF4444  /* Red */
#define COLOR_WARNING       0xFFF59E0B  /* Yellow */
#define COLOR_INFO          0xFF3B82F6  /* Blue */

/* Transparent */
#define COLOR_TRANSPARENT   0x00000000

/**
 * Create color from RGB components
 */
static inline uint32_t gfx_rgb(uint8_t r, uint8_t g, uint8_t b) {
    return 0xFF000000 | ((uint32_t)r << 16) | ((uint32_t)g << 8) | (uint32_t)b;
}

/**
 * Create color with alpha
 */
static inline uint32_t gfx_rgba(uint8_t r, uint8_t g, uint8_t b, uint8_t a) {
    return ((uint32_t)a << 24) | ((uint32_t)r << 16) | ((uint32_t)g << 8) | (uint32_t)b;
}

/**
 * Extract components from ARGB color
 */
static inline uint8_t gfx_alpha(uint32_t c) { return (c >> 24) & 0xFF; }
static inline uint8_t gfx_red(uint32_t c)   { return (c >> 16) & 0xFF; }
static inline uint8_t gfx_green(uint32_t c) { return (c >> 8) & 0xFF; }
static inline uint8_t gfx_blue(uint32_t c)  { return c & 0xFF; }

/**
 * Blend two colors (alpha compositing)
 * @param bg    Background color
 * @param fg    Foreground color (with alpha)
 * @return      Blended color
 */
uint32_t gfx_blend(uint32_t bg, uint32_t fg);

/**
 * Linear interpolation between two colors
 * @param c1    Start color
 * @param c2    End color
 * @param t     Interpolation factor (0-255)
 * @return      Interpolated color
 */
uint32_t gfx_lerp(uint32_t c1, uint32_t c2, int t);

/**
 * Lighten a color
 * @param c         Color to lighten
 * @param amount    Amount (0-255)
 */
uint32_t gfx_lighten(uint32_t c, int amount);

/**
 * Darken a color
 * @param c         Color to darken
 * @param amount    Amount (0-255)
 */
uint32_t gfx_darken(uint32_t c, int amount);

/**
 * Draw rounded rectangle outline
 */
void gfx_rounded_rect(int x, int y, int w, int h, int radius, uint32_t color);

/**
 * Draw filled rounded rectangle
 */
void gfx_rounded_rect_fill(int x, int y, int w, int h, int radius, uint32_t color);

/**
 * Draw rectangle with vertical gradient
 */
void gfx_gradient_rect(int x, int y, int w, int h, gradient_t grad);

/**
 * Draw rounded rectangle with vertical gradient
 */
void gfx_gradient_rounded(int x, int y, int w, int h, int radius, gradient_t grad);

/**
 * Draw shadow behind a rectangle
 * Call BEFORE drawing the actual rectangle
 */
void gfx_shadow(int x, int y, int w, int h, int radius, shadow_t shadow);

/**
 * Draw circle outline
 */
void gfx_circle(int cx, int cy, int r, uint32_t color);

/**
 * Draw filled circle
 */
void gfx_circle_fill(int cx, int cy, int r, uint32_t color);

/**
 * Draw pixel with alpha blending
 */
void gfx_pixel_blend(int x, int y, uint32_t color);

/**
 * Convenience: Create gradient from single color (darken to lighten)
 */
static inline gradient_t gfx_gradient_from_color(uint32_t base) {
    gradient_t g;
    g.top = gfx_lighten(base, 20);
    g.bottom = gfx_darken(base, 20);
    return g;
}

/**
 * Convenience: Create standard button shadow
 */
static inline shadow_t gfx_shadow_default(void) {
    shadow_t s = {2, 3, 4, 0x40000000};  /* 25% black */
    return s;
}

#endif /* EK_OS_GFX_H */
