/**
 * @file fb.h
 * @brief Framebuffer driver for EK-OS
 *
 * Low-level framebuffer access for GOP-based graphics.
 */

#ifndef EK_OS_FB_H
#define EK_OS_FB_H

#include <stdint.h>

/* Framebuffer state */
typedef struct {
    uint32_t *buffer;       /* Direct framebuffer pointer */
    uint32_t *backbuffer;   /* Double buffer for flicker-free (optional) */
    uint32_t width;
    uint32_t height;
    uint32_t pitch;         /* Pixels per scanline */
    uint32_t bpp;           /* Bits per pixel (32) */
    int is_bgr;             /* 1 if BGR pixel format, 0 if RGB */
} framebuffer_t;

/* Global framebuffer instance */
extern framebuffer_t g_fb;

/**
 * Initialize framebuffer from boot info
 * @param addr      Framebuffer base address
 * @param w         Width in pixels
 * @param h         Height in pixels
 * @param pitch     Bytes per scanline
 * @param bpp       Bits per pixel
 * @param is_bgr    1 if BGR format, 0 if RGB
 */
void fb_init(uint64_t addr, uint32_t w, uint32_t h, uint32_t pitch, uint32_t bpp, int is_bgr);

/**
 * Check if framebuffer is available
 */
int fb_available(void);

/**
 * Clear screen to solid color
 */
void fb_clear(uint32_t color);

/**
 * Set single pixel (bounds-checked)
 */
void fb_pixel(int x, int y, uint32_t color);

/**
 * Draw rectangle outline
 */
void fb_rect(int x, int y, int w, int h, uint32_t color);

/**
 * Draw filled rectangle
 */
void fb_rect_fill(int x, int y, int w, int h, uint32_t color);

/**
 * Draw line (Bresenham)
 */
void fb_line(int x1, int y1, int x2, int y2, uint32_t color);

/**
 * Draw horizontal line (fast)
 */
void fb_hline(int x, int y, int len, uint32_t color);

/**
 * Draw vertical line (fast)
 */
void fb_vline(int x, int y, int len, uint32_t color);

/**
 * Blit bitmap to framebuffer
 * @param x, y      Destination position
 * @param src       Source pixel data (ARGB)
 * @param w, h      Source dimensions
 * @param src_pitch Source pitch (pixels per line)
 */
void fb_blit(int x, int y, const uint32_t *src, int w, int h, int src_pitch);

/**
 * Copy rectangle within framebuffer
 */
void fb_copy(int dst_x, int dst_y, int src_x, int src_y, int w, int h);

/**
 * Swap backbuffer to front (if double buffering enabled)
 */
void fb_swap(void);

/**
 * Convert RGB to native pixel format
 */
static inline uint32_t fb_color(uint8_t r, uint8_t g, uint8_t b) {
    if (g_fb.is_bgr) {
        return (uint32_t)b | ((uint32_t)g << 8) | ((uint32_t)r << 16) | 0xFF000000;
    }
    return (uint32_t)r | ((uint32_t)g << 8) | ((uint32_t)b << 16) | 0xFF000000;
}

#endif /* EK_OS_FB_H */
