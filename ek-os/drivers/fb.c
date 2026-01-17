/**
 * @file fb.c
 * @brief Framebuffer driver implementation for EK-OS
 */

#include "fb.h"
#include <stddef.h>

/* Global framebuffer instance */
framebuffer_t g_fb = {0};

void fb_init(uint64_t addr, uint32_t w, uint32_t h, uint32_t pitch, uint32_t bpp, int is_bgr) {
    g_fb.buffer = (uint32_t *)(uintptr_t)addr;
    g_fb.backbuffer = NULL;  /* No double buffering yet */
    g_fb.width = w;
    g_fb.height = h;
    g_fb.pitch = pitch / 4;  /* Convert bytes to pixels */
    g_fb.bpp = bpp;
    g_fb.is_bgr = is_bgr;
}

int fb_available(void) {
    return g_fb.buffer != NULL && g_fb.width > 0 && g_fb.height > 0;
}

void fb_clear(uint32_t color) {
    if (!fb_available()) return;

    uint32_t *dst = g_fb.buffer;
    uint32_t total = g_fb.pitch * g_fb.height;

    for (uint32_t i = 0; i < total; i++) {
        dst[i] = color;
    }
}

void fb_pixel(int x, int y, uint32_t color) {
    if (!fb_available()) return;
    if (x < 0 || x >= (int)g_fb.width || y < 0 || y >= (int)g_fb.height) return;

    g_fb.buffer[y * g_fb.pitch + x] = color;
}

void fb_hline(int x, int y, int len, uint32_t color) {
    if (!fb_available()) return;
    if (y < 0 || y >= (int)g_fb.height) return;

    /* Clip to screen bounds */
    if (x < 0) {
        len += x;
        x = 0;
    }
    if (x + len > (int)g_fb.width) {
        len = (int)g_fb.width - x;
    }
    if (len <= 0) return;

    uint32_t *dst = g_fb.buffer + y * g_fb.pitch + x;
    for (int i = 0; i < len; i++) {
        dst[i] = color;
    }
}

void fb_vline(int x, int y, int len, uint32_t color) {
    if (!fb_available()) return;
    if (x < 0 || x >= (int)g_fb.width) return;

    /* Clip to screen bounds */
    if (y < 0) {
        len += y;
        y = 0;
    }
    if (y + len > (int)g_fb.height) {
        len = (int)g_fb.height - y;
    }
    if (len <= 0) return;

    uint32_t *dst = g_fb.buffer + y * g_fb.pitch + x;
    for (int i = 0; i < len; i++) {
        *dst = color;
        dst += g_fb.pitch;
    }
}

void fb_rect(int x, int y, int w, int h, uint32_t color) {
    if (!fb_available() || w <= 0 || h <= 0) return;

    fb_hline(x, y, w, color);           /* Top */
    fb_hline(x, y + h - 1, w, color);   /* Bottom */
    fb_vline(x, y, h, color);           /* Left */
    fb_vline(x + w - 1, y, h, color);   /* Right */
}

void fb_rect_fill(int x, int y, int w, int h, uint32_t color) {
    if (!fb_available() || w <= 0 || h <= 0) return;

    /* Clip to screen bounds */
    if (x < 0) {
        w += x;
        x = 0;
    }
    if (y < 0) {
        h += y;
        y = 0;
    }
    if (x + w > (int)g_fb.width) {
        w = (int)g_fb.width - x;
    }
    if (y + h > (int)g_fb.height) {
        h = (int)g_fb.height - y;
    }
    if (w <= 0 || h <= 0) return;

    uint32_t *dst = g_fb.buffer + y * g_fb.pitch + x;
    for (int row = 0; row < h; row++) {
        for (int col = 0; col < w; col++) {
            dst[col] = color;
        }
        dst += g_fb.pitch;
    }
}

void fb_line(int x1, int y1, int x2, int y2, uint32_t color) {
    if (!fb_available()) return;

    /* Bresenham's line algorithm */
    int dx = x2 - x1;
    int dy = y2 - y1;
    int sx = (dx > 0) ? 1 : -1;
    int sy = (dy > 0) ? 1 : -1;

    if (dx < 0) dx = -dx;
    if (dy < 0) dy = -dy;

    int err = dx - dy;

    while (1) {
        fb_pixel(x1, y1, color);

        if (x1 == x2 && y1 == y2) break;

        int e2 = err * 2;
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
    }
}

void fb_blit(int x, int y, const uint32_t *src, int w, int h, int src_pitch) {
    if (!fb_available() || !src || w <= 0 || h <= 0) return;

    /* Simple clipping */
    int src_x = 0, src_y = 0;
    if (x < 0) {
        src_x = -x;
        w += x;
        x = 0;
    }
    if (y < 0) {
        src_y = -y;
        h += y;
        y = 0;
    }
    if (x + w > (int)g_fb.width) {
        w = (int)g_fb.width - x;
    }
    if (y + h > (int)g_fb.height) {
        h = (int)g_fb.height - y;
    }
    if (w <= 0 || h <= 0) return;

    uint32_t *dst = g_fb.buffer + y * g_fb.pitch + x;
    src += src_y * src_pitch + src_x;

    for (int row = 0; row < h; row++) {
        for (int col = 0; col < w; col++) {
            dst[col] = src[col];
        }
        dst += g_fb.pitch;
        src += src_pitch;
    }
}

void fb_copy(int dst_x, int dst_y, int src_x, int src_y, int w, int h) {
    if (!fb_available() || w <= 0 || h <= 0) return;

    /* Handle overlapping regions by copying in correct direction */
    if (dst_y < src_y || (dst_y == src_y && dst_x < src_x)) {
        /* Copy top-to-bottom, left-to-right */
        for (int row = 0; row < h; row++) {
            uint32_t *dst = g_fb.buffer + (dst_y + row) * g_fb.pitch + dst_x;
            uint32_t *src = g_fb.buffer + (src_y + row) * g_fb.pitch + src_x;
            for (int col = 0; col < w; col++) {
                dst[col] = src[col];
            }
        }
    } else {
        /* Copy bottom-to-top, right-to-left */
        for (int row = h - 1; row >= 0; row--) {
            uint32_t *dst = g_fb.buffer + (dst_y + row) * g_fb.pitch + dst_x;
            uint32_t *src = g_fb.buffer + (src_y + row) * g_fb.pitch + src_x;
            for (int col = w - 1; col >= 0; col--) {
                dst[col] = src[col];
            }
        }
    }
}

void fb_swap(void) {
    /* No double buffering yet - this is a no-op */
    /* When implemented, this would copy backbuffer to front buffer */
}
