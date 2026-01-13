/**
 * @file gfx.c
 * @brief Modern graphics primitives implementation for EK-OS
 */

#include "gfx.h"
#include "fb.h"

uint32_t gfx_blend(uint32_t bg, uint32_t fg) {
    uint8_t alpha = gfx_alpha(fg);

    if (alpha == 0) return bg;
    if (alpha == 255) return fg;

    /* Alpha blending: result = fg * alpha + bg * (1 - alpha) */
    uint8_t inv_alpha = 255 - alpha;

    uint8_t r = (gfx_red(fg) * alpha + gfx_red(bg) * inv_alpha) / 255;
    uint8_t g = (gfx_green(fg) * alpha + gfx_green(bg) * inv_alpha) / 255;
    uint8_t b = (gfx_blue(fg) * alpha + gfx_blue(bg) * inv_alpha) / 255;

    return gfx_rgb(r, g, b);
}

uint32_t gfx_lerp(uint32_t c1, uint32_t c2, int t) {
    if (t <= 0) return c1;
    if (t >= 255) return c2;

    int inv_t = 255 - t;

    uint8_t r = (gfx_red(c1) * inv_t + gfx_red(c2) * t) / 255;
    uint8_t g = (gfx_green(c1) * inv_t + gfx_green(c2) * t) / 255;
    uint8_t b = (gfx_blue(c1) * inv_t + gfx_blue(c2) * t) / 255;
    uint8_t a = (gfx_alpha(c1) * inv_t + gfx_alpha(c2) * t) / 255;

    return gfx_rgba(r, g, b, a);
}

uint32_t gfx_lighten(uint32_t c, int amount) {
    int r = gfx_red(c) + amount;
    int g = gfx_green(c) + amount;
    int b = gfx_blue(c) + amount;

    if (r > 255) r = 255;
    if (g > 255) g = 255;
    if (b > 255) b = 255;

    return gfx_rgba(r, g, b, gfx_alpha(c));
}

uint32_t gfx_darken(uint32_t c, int amount) {
    int r = gfx_red(c) - amount;
    int g = gfx_green(c) - amount;
    int b = gfx_blue(c) - amount;

    if (r < 0) r = 0;
    if (g < 0) g = 0;
    if (b < 0) b = 0;

    return gfx_rgba(r, g, b, gfx_alpha(c));
}

void gfx_pixel_blend(int x, int y, uint32_t color) {
    if (!fb_available()) return;
    if (x < 0 || x >= (int)g_fb.width || y < 0 || y >= (int)g_fb.height) return;

    uint8_t alpha = gfx_alpha(color);
    if (alpha == 0) return;

    if (alpha == 255) {
        fb_pixel(x, y, color);
    } else {
        uint32_t bg = g_fb.buffer[y * g_fb.pitch + x];
        fb_pixel(x, y, gfx_blend(bg, color));
    }
}

/* Helper: Draw quarter circle (for rounded corners) */
static void draw_quarter_circle(int cx, int cy, int r, int quadrant, uint32_t color) {
    /* Midpoint circle algorithm */
    int x = 0;
    int y = r;
    int d = 1 - r;

    while (x <= y) {
        /* Map to appropriate quadrant */
        switch (quadrant) {
            case 0: /* Top-right */
                fb_pixel(cx + x, cy - y, color);
                fb_pixel(cx + y, cy - x, color);
                break;
            case 1: /* Top-left */
                fb_pixel(cx - x, cy - y, color);
                fb_pixel(cx - y, cy - x, color);
                break;
            case 2: /* Bottom-left */
                fb_pixel(cx - x, cy + y, color);
                fb_pixel(cx - y, cy + x, color);
                break;
            case 3: /* Bottom-right */
                fb_pixel(cx + x, cy + y, color);
                fb_pixel(cx + y, cy + x, color);
                break;
        }

        if (d < 0) {
            d += 2 * x + 3;
        } else {
            d += 2 * (x - y) + 5;
            y--;
        }
        x++;
    }
}

/* Helper: Fill quarter circle (for filled rounded corners) */
static void fill_quarter_circle(int cx, int cy, int r, int quadrant, uint32_t color) {
    int x = 0;
    int y = r;
    int d = 1 - r;

    while (x <= y) {
        switch (quadrant) {
            case 0: /* Top-right */
                fb_hline(cx, cy - y, x + 1, color);
                fb_hline(cx, cy - x, y + 1, color);
                break;
            case 1: /* Top-left */
                fb_hline(cx - x, cy - y, x + 1, color);
                fb_hline(cx - y, cy - x, y + 1, color);
                break;
            case 2: /* Bottom-left */
                fb_hline(cx - x, cy + y, x + 1, color);
                fb_hline(cx - y, cy + x, y + 1, color);
                break;
            case 3: /* Bottom-right */
                fb_hline(cx, cy + y, x + 1, color);
                fb_hline(cx, cy + x, y + 1, color);
                break;
        }

        if (d < 0) {
            d += 2 * x + 3;
        } else {
            d += 2 * (x - y) + 5;
            y--;
        }
        x++;
    }
}

void gfx_rounded_rect(int x, int y, int w, int h, int radius, uint32_t color) {
    if (!fb_available() || w <= 0 || h <= 0) return;

    if (radius <= 0) {
        fb_rect(x, y, w, h, color);
        return;
    }

    /* Clamp radius */
    if (radius > w / 2) radius = w / 2;
    if (radius > h / 2) radius = h / 2;

    /* Draw corners */
    draw_quarter_circle(x + w - 1 - radius, y + radius, radius, 0, color);         /* Top-right */
    draw_quarter_circle(x + radius, y + radius, radius, 1, color);                  /* Top-left */
    draw_quarter_circle(x + radius, y + h - 1 - radius, radius, 2, color);          /* Bottom-left */
    draw_quarter_circle(x + w - 1 - radius, y + h - 1 - radius, radius, 3, color);  /* Bottom-right */

    /* Draw straight edges */
    fb_hline(x + radius, y, w - 2 * radius, color);           /* Top */
    fb_hline(x + radius, y + h - 1, w - 2 * radius, color);   /* Bottom */
    fb_vline(x, y + radius, h - 2 * radius, color);           /* Left */
    fb_vline(x + w - 1, y + radius, h - 2 * radius, color);   /* Right */
}

void gfx_rounded_rect_fill(int x, int y, int w, int h, int radius, uint32_t color) {
    if (!fb_available() || w <= 0 || h <= 0) return;

    if (radius <= 0) {
        fb_rect_fill(x, y, w, h, color);
        return;
    }

    /* Clamp radius */
    if (radius > w / 2) radius = w / 2;
    if (radius > h / 2) radius = h / 2;

    /* Fill corners */
    fill_quarter_circle(x + w - 1 - radius, y + radius, radius, 0, color);         /* Top-right */
    fill_quarter_circle(x + radius, y + radius, radius, 1, color);                  /* Top-left */
    fill_quarter_circle(x + radius, y + h - 1 - radius, radius, 2, color);          /* Bottom-left */
    fill_quarter_circle(x + w - 1 - radius, y + h - 1 - radius, radius, 3, color);  /* Bottom-right */

    /* Fill top section (above rounded corners) - already done by fill_quarter_circle for top corners */

    /* Fill middle section */
    fb_rect_fill(x, y + radius, w, h - 2 * radius, color);

    /* Fill remaining parts in top and bottom sections */
    fb_rect_fill(x + radius, y, w - 2 * radius, radius, color);
    fb_rect_fill(x + radius, y + h - radius, w - 2 * radius, radius, color);
}

void gfx_gradient_rect(int x, int y, int w, int h, gradient_t grad) {
    if (!fb_available() || w <= 0 || h <= 0) return;

    for (int row = 0; row < h; row++) {
        /* Calculate gradient interpolation */
        int t = (row * 255) / (h - 1);
        uint32_t color = gfx_lerp(grad.top, grad.bottom, t);

        fb_hline(x, y + row, w, color);
    }
}

void gfx_gradient_rounded(int x, int y, int w, int h, int radius, gradient_t grad) {
    if (!fb_available() || w <= 0 || h <= 0) return;

    if (radius <= 0) {
        gfx_gradient_rect(x, y, w, h, grad);
        return;
    }

    /* Clamp radius */
    if (radius > w / 2) radius = w / 2;
    if (radius > h / 2) radius = h / 2;

    /* Draw row by row with gradient, respecting rounded corners */
    for (int row = 0; row < h; row++) {
        int t = h > 1 ? (row * 255) / (h - 1) : 0;
        uint32_t color = gfx_lerp(grad.top, grad.bottom, t);

        int line_x = x;
        int line_w = w;

        /* Top rounded section */
        if (row < radius) {
            /* Calculate horizontal inset for this row */
            int dy = radius - row;
            /* Use circle equation: dx^2 + dy^2 = r^2 -> dx = sqrt(r^2 - dy^2) */
            int dx2 = radius * radius - dy * dy;
            int dx = 0;
            while (dx * dx < dx2) dx++;
            int inset = radius - dx;
            line_x = x + inset;
            line_w = w - 2 * inset;
        }
        /* Bottom rounded section */
        else if (row >= h - radius) {
            int dy = row - (h - 1 - radius);
            int dx2 = radius * radius - dy * dy;
            int dx = 0;
            while (dx * dx < dx2) dx++;
            int inset = radius - dx;
            line_x = x + inset;
            line_w = w - 2 * inset;
        }

        if (line_w > 0) {
            fb_hline(line_x, y + row, line_w, color);
        }
    }
}

void gfx_shadow(int x, int y, int w, int h, int radius, shadow_t shadow) {
    if (!fb_available() || shadow.blur <= 0) return;

    /* Simple box shadow: draw multiple semi-transparent layers */
    int sx = x + shadow.offset_x;
    int sy = y + shadow.offset_y;

    /* Draw shadow layers from outside in */
    for (int i = shadow.blur; i >= 0; i--) {
        /* Calculate alpha for this layer */
        int alpha = gfx_alpha(shadow.color) * (shadow.blur - i) / shadow.blur;
        uint32_t layer_color = gfx_rgba(
            gfx_red(shadow.color),
            gfx_green(shadow.color),
            gfx_blue(shadow.color),
            alpha
        );

        /* Draw expanded shadow rectangle */
        int expand = i;
        for (int row = -expand; row < h + expand; row++) {
            for (int col = -expand; col < w + expand; col++) {
                /* Skip inside area */
                if (row >= 0 && row < h && col >= 0 && col < w) continue;

                gfx_pixel_blend(sx + col, sy + row, layer_color);
            }
        }
    }

    /* Draw solid shadow core */
    uint32_t core_color = gfx_rgba(
        gfx_red(shadow.color),
        gfx_green(shadow.color),
        gfx_blue(shadow.color),
        gfx_alpha(shadow.color) / 2
    );

    if (radius > 0) {
        /* For rounded shadow, we'd need to match the rounded shape */
        /* For now, just draw rectangle */
        for (int row = 0; row < h; row++) {
            for (int col = 0; col < w; col++) {
                gfx_pixel_blend(sx + col, sy + row, core_color);
            }
        }
    } else {
        for (int row = 0; row < h; row++) {
            for (int col = 0; col < w; col++) {
                gfx_pixel_blend(sx + col, sy + row, core_color);
            }
        }
    }
}

void gfx_circle(int cx, int cy, int r, uint32_t color) {
    if (!fb_available() || r <= 0) return;

    /* Midpoint circle algorithm */
    int x = 0;
    int y = r;
    int d = 1 - r;

    while (x <= y) {
        fb_pixel(cx + x, cy - y, color);
        fb_pixel(cx - x, cy - y, color);
        fb_pixel(cx + x, cy + y, color);
        fb_pixel(cx - x, cy + y, color);
        fb_pixel(cx + y, cy - x, color);
        fb_pixel(cx - y, cy - x, color);
        fb_pixel(cx + y, cy + x, color);
        fb_pixel(cx - y, cy + x, color);

        if (d < 0) {
            d += 2 * x + 3;
        } else {
            d += 2 * (x - y) + 5;
            y--;
        }
        x++;
    }
}

void gfx_circle_fill(int cx, int cy, int r, uint32_t color) {
    if (!fb_available() || r <= 0) return;

    int x = 0;
    int y = r;
    int d = 1 - r;

    while (x <= y) {
        fb_hline(cx - x, cy - y, 2 * x + 1, color);
        fb_hline(cx - y, cy - x, 2 * y + 1, color);
        fb_hline(cx - x, cy + y, 2 * x + 1, color);
        fb_hline(cx - y, cy + x, 2 * y + 1, color);

        if (d < 0) {
            d += 2 * x + 3;
        } else {
            d += 2 * (x - y) + 5;
            y--;
        }
        x++;
    }
}
