/**
 * @file usb_hid.c
 * @brief USB HID Class Driver for EK-OS
 */

#include "usb_hid.h"
#include "usb.h"
#include "xhci.h"
#include "serial.h"
#include <string.h>

/* ============================================================================
 * Global State
 * ============================================================================ */

static hid_device_t hid_device_pool[HID_MAX_DEVICES];
hid_device_t *hid_devices = NULL;
static int hid_device_count = 0;

hid_keyboard_state_t g_hid_keyboard;
hid_mouse_state_t g_hid_mouse;

/* ============================================================================
 * HID Usage to ASCII Tables
 * ============================================================================ */

/* HID Usage codes (from USB HID Usage Tables) */
static const char hid_usage_to_ascii_lower[128] = {
    0,   0,   0,   0,   'a', 'b', 'c', 'd',    /* 0x00-0x07 */
    'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',    /* 0x08-0x0F */
    'm', 'n', 'o', 'p', 'q', 'r', 's', 't',    /* 0x10-0x17 */
    'u', 'v', 'w', 'x', 'y', 'z', '1', '2',    /* 0x18-0x1F */
    '3', '4', '5', '6', '7', '8', '9', '0',    /* 0x20-0x27 */
    '\n', 27, '\b', '\t', ' ', '-', '=', '[',  /* 0x28-0x2F */
    ']', '\\', 0,  ';', '\'', '`', ',', '.',   /* 0x30-0x37 */
    '/', 0,   0,   0,   0,   0,   0,   0,      /* 0x38-0x3F */
    0,   0,   0,   0,   0,   0,   0,   0,      /* 0x40-0x47 F1-F8 */
    0,   0,   0,   0,   0,   0,   0,   0,      /* 0x48-0x4F F9-F12, etc */
    0,   0,   0,   0,   '/', '*', '-', '+',    /* 0x50-0x57 Keypad */
    '\n', '1', '2', '3', '4', '5', '6', '7',   /* 0x58-0x5F Keypad */
    '8', '9', '0', '.', 0,   0,   0,   0,      /* 0x60-0x67 */
    0,   0,   0,   0,   0,   0,   0,   0,      /* 0x68-0x6F */
    0,   0,   0,   0,   0,   0,   0,   0,      /* 0x70-0x77 */
    0,   0,   0,   0,   0,   0,   0,   0,      /* 0x78-0x7F */
};

static const char hid_usage_to_ascii_upper[128] = {
    0,   0,   0,   0,   'A', 'B', 'C', 'D',    /* 0x00-0x07 */
    'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',    /* 0x08-0x0F */
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',    /* 0x10-0x17 */
    'U', 'V', 'W', 'X', 'Y', 'Z', '!', '@',    /* 0x18-0x1F */
    '#', '$', '%', '^', '&', '*', '(', ')',    /* 0x20-0x27 */
    '\n', 27, '\b', '\t', ' ', '_', '+', '{',  /* 0x28-0x2F */
    '}', '|', 0,  ':', '"', '~', '<', '>',     /* 0x30-0x37 */
    '?', 0,   0,   0,   0,   0,   0,   0,      /* 0x38-0x3F */
    0,   0,   0,   0,   0,   0,   0,   0,      /* 0x40-0x47 */
    0,   0,   0,   0,   0,   0,   0,   0,      /* 0x48-0x4F */
    0,   0,   0,   0,   '/', '*', '-', '+',    /* 0x50-0x57 */
    '\n', '1', '2', '3', '4', '5', '6', '7',   /* 0x58-0x5F */
    '8', '9', '0', '.', 0,   0,   0,   0,      /* 0x60-0x67 */
    0,   0,   0,   0,   0,   0,   0,   0,      /* 0x68-0x6F */
    0,   0,   0,   0,   0,   0,   0,   0,      /* 0x70-0x77 */
    0,   0,   0,   0,   0,   0,   0,   0,      /* 0x78-0x7F */
};

char hid_usage_to_ascii(uint8_t usage, uint8_t modifiers) {
    if (usage >= 128) return 0;

    int shift = (modifiers & (HID_MOD_LSHIFT | HID_MOD_RSHIFT)) != 0;
    int caps = (g_hid_keyboard.leds & HID_LED_CAPS_LOCK) != 0;

    /* For letters, caps lock inverts shift */
    if (usage >= 0x04 && usage <= 0x1D) {
        shift ^= caps;
    }

    return shift ? hid_usage_to_ascii_upper[usage]
                 : hid_usage_to_ascii_lower[usage];
}

/* ============================================================================
 * Keyboard Processing
 * ============================================================================ */

static void hid_process_keyboard(hid_device_t *dev,
                                 const uint8_t *report, uint16_t len) {
    if (len < 8) return;

    const hid_keyboard_report_t *kbd = (const hid_keyboard_report_t *)report;
    const hid_keyboard_report_t *prev = (const hid_keyboard_report_t *)dev->prev_report;

    g_hid_keyboard.modifiers = kbd->modifiers;

    /* Find newly pressed keys */
    for (int i = 0; i < 6; i++) {
        uint8_t key = kbd->keys[i];
        if (key == 0 || key == 1) continue;  /* 0=none, 1=rollover error */

        /* Check if this key was in previous report */
        int found = 0;
        for (int j = 0; j < 6; j++) {
            if (prev->keys[j] == key) {
                found = 1;
                break;
            }
        }

        if (!found) {
            /* New key press */
            char c = hid_usage_to_ascii(key, kbd->modifiers);
            if (c) {
                uint8_t next = (g_hid_keyboard.key_tail + 1) % HID_KEY_BUFFER_SIZE;
                if (next != g_hid_keyboard.key_head) {
                    g_hid_keyboard.key_buffer[g_hid_keyboard.key_tail] = c;
                    g_hid_keyboard.key_tail = next;
                }
            }

            /* Handle Caps Lock toggle */
            if (key == 0x39) {  /* Caps Lock */
                g_hid_keyboard.leds ^= HID_LED_CAPS_LOCK;
                /* TODO: Send LED report */
            }
        }
    }

    memcpy(dev->prev_report, report, len);
}

/* ============================================================================
 * Mouse Processing
 * ============================================================================ */

static void hid_process_mouse(hid_device_t *dev,
                              const uint8_t *report, uint16_t len) {
    if (len < 3) return;

    const hid_mouse_report_t *mouse = (const hid_mouse_report_t *)report;

    g_hid_mouse.buttons = mouse->buttons;
    g_hid_mouse.x += mouse->x;
    g_hid_mouse.y += mouse->y;
    if (len >= 4) {
        g_hid_mouse.wheel += mouse->wheel;
    }
}

/* ============================================================================
 * Device Probe
 * ============================================================================ */

int hid_probe(usb_device_t *usb_dev) {
    int found = 0;

    for (int i = 0; i < usb_dev->num_interfaces; i++) {
        usb_interface_t *iface = &usb_dev->interfaces[i];

        if (iface->class_code != USB_CLASS_HID) {
            continue;
        }

        if (hid_device_count >= HID_MAX_DEVICES) {
            serial_printf("[HID] Device pool full\n");
            break;
        }

        hid_device_t *hid = &hid_device_pool[hid_device_count++];
        memset(hid, 0, sizeof(*hid));

        hid->usb_dev = usb_dev;
        hid->interface_num = iface->number;

        /* Determine HID type */
        if (iface->subclass == HID_SUBCLASS_BOOT) {
            if (iface->protocol == HID_PROTOCOL_KEYBOARD) {
                hid->type = HID_TYPE_KEYBOARD;
                serial_printf("[HID] Boot keyboard detected\n");
            } else if (iface->protocol == HID_PROTOCOL_MOUSE) {
                hid->type = HID_TYPE_MOUSE;
                serial_printf("[HID] Boot mouse detected\n");
            } else {
                hid->type = HID_TYPE_GENERIC;
            }
        } else {
            hid->type = HID_TYPE_GENERIC;
        }

        /* Find interrupt IN endpoint */
        for (int j = 0; j < iface->num_endpoints; j++) {
            usb_endpoint_t *ep = &iface->endpoints[j];
            if (ep->type == USB_EP_TYPE_INTERRUPT) {
                if (ep->address & USB_EP_DIR_IN) {
                    hid->in_endpoint = ep->address;
                    hid->report_size = ep->max_packet_size;
                    hid->interval = ep->interval;
                } else {
                    hid->out_endpoint = ep->address;
                }
            }
        }

        if (hid->in_endpoint == 0) {
            serial_printf("[HID] No interrupt IN endpoint found\n");
            hid_device_count--;
            continue;
        }

        /* Set boot protocol for boot devices */
        if (iface->subclass == HID_SUBCLASS_BOOT) {
            usb_control_msg(usb_dev,
                            USB_DIR_OUT | USB_TYPE_CLASS | USB_RECIP_INTERFACE,
                            HID_REQ_SET_PROTOCOL,
                            0,  /* Boot protocol */
                            iface->number,
                            NULL, 0);
        }

        /* Set idle rate to 0 (report only on change) */
        usb_control_msg(usb_dev,
                        USB_DIR_OUT | USB_TYPE_CLASS | USB_RECIP_INTERFACE,
                        HID_REQ_SET_IDLE,
                        0,  /* Infinite idle */
                        iface->number,
                        NULL, 0);

        /* Add to linked list */
        hid->next = hid_devices;
        hid_devices = hid;

        iface->driver_data = hid;
        found++;

        serial_printf("[HID] Device configured: EP=0x%02x, report_size=%d\n",
                      hid->in_endpoint, hid->report_size);
    }

    return found;
}

/* ============================================================================
 * Polling
 * ============================================================================ */

static int hid_poll_count = 0;

static void hid_poll_device(hid_device_t *hid) {
    if (!hid->usb_dev || hid->in_endpoint == 0) return;

    /* Issue interrupt transfer */
    int ret = usb_interrupt_read(hid->usb_dev,
                                 hid->in_endpoint,
                                 hid->report,
                                 hid->report_size);

    hid_poll_count++;

    if (ret > 0) {
        /* Process report based on device type */
        switch (hid->type) {
            case HID_TYPE_KEYBOARD:
                hid_process_keyboard(hid, hid->report, ret);
                break;
            case HID_TYPE_MOUSE:
                hid_process_mouse(hid, hid->report, ret);
                break;
            default:
                break;
        }
    }
}

static int first_poll = 1;

void hid_poll(void) {
    if (first_poll) {
        serial_printf("[HID] First poll, devices=%p\n", (void*)hid_devices);
        if (hid_devices) {
            serial_printf("[HID] Device: usb=%p ep=0x%02x type=%d\n",
                          (void*)hid_devices->usb_dev,
                          hid_devices->in_endpoint,
                          hid_devices->type);
        }
        first_poll = 0;
    }

    for (hid_device_t *hid = hid_devices; hid; hid = hid->next) {
        hid_poll_device(hid);
    }

    /* Also poll USB for events */
    usb_poll();
}

/* ============================================================================
 * Keyboard API
 * ============================================================================ */

char hid_keyboard_read(void) {
    if (g_hid_keyboard.key_head == g_hid_keyboard.key_tail) {
        return 0;
    }

    char c = g_hid_keyboard.key_buffer[g_hid_keyboard.key_head];
    g_hid_keyboard.key_head = (g_hid_keyboard.key_head + 1) % HID_KEY_BUFFER_SIZE;
    return c;
}

int hid_keyboard_available(void) {
    return g_hid_keyboard.key_head != g_hid_keyboard.key_tail;
}

void hid_keyboard_set_leds(uint8_t leds) {
    g_hid_keyboard.leds = leds;

    /* Send LED report to all keyboards */
    for (hid_device_t *hid = hid_devices; hid; hid = hid->next) {
        if (hid->type == HID_TYPE_KEYBOARD && hid->out_endpoint) {
            /* TODO: Send SET_REPORT for LEDs */
        }
    }
}

hid_keyboard_state_t *hid_keyboard_state(void) {
    return &g_hid_keyboard;
}

/* ============================================================================
 * Mouse API
 * ============================================================================ */

hid_mouse_state_t *hid_mouse_state(void) {
    return &g_hid_mouse;
}

void hid_mouse_reset(void) {
    g_hid_mouse.x = 0;
    g_hid_mouse.y = 0;
    g_hid_mouse.wheel = 0;
}

/* ============================================================================
 * Initialization
 * ============================================================================ */

int hid_init(void) {
    serial_printf("[HID] Initializing HID driver...\n");

    memset(&g_hid_keyboard, 0, sizeof(g_hid_keyboard));
    memset(&g_hid_mouse, 0, sizeof(g_hid_mouse));
    memset(hid_device_pool, 0, sizeof(hid_device_pool));
    hid_devices = NULL;
    hid_device_count = 0;

    /* Probe all USB devices for HID interfaces */
    int found = 0;
    for (usb_device_t *dev = usb_devices; dev; dev = dev->next) {
        found += hid_probe(dev);
    }

    serial_printf("[HID] HID driver initialized, %d devices\n", found);
    return 0;
}
