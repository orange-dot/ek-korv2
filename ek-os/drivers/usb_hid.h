/**
 * @file usb_hid.h
 * @brief USB HID Class Driver for EK-OS
 *
 * Supports boot protocol keyboards and mice.
 */

#ifndef EK_OS_USB_HID_H
#define EK_OS_USB_HID_H

#include <stdint.h>
#include "usb.h"

/* ============================================================================
 * HID Class Definitions
 * ============================================================================ */

/* HID Subclass */
#define HID_SUBCLASS_NONE         0x00
#define HID_SUBCLASS_BOOT         0x01

/* HID Protocol */
#define HID_PROTOCOL_NONE         0x00
#define HID_PROTOCOL_KEYBOARD     0x01
#define HID_PROTOCOL_MOUSE        0x02

/* HID Class Requests */
#define HID_REQ_GET_REPORT        0x01
#define HID_REQ_GET_IDLE          0x02
#define HID_REQ_GET_PROTOCOL      0x03
#define HID_REQ_SET_REPORT        0x09
#define HID_REQ_SET_IDLE          0x0A
#define HID_REQ_SET_PROTOCOL      0x0B

/* HID Report Types */
#define HID_REPORT_INPUT          0x01
#define HID_REPORT_OUTPUT         0x02
#define HID_REPORT_FEATURE        0x03

/* ============================================================================
 * Boot Protocol Structures
 * ============================================================================ */

/* Boot Keyboard Report (8 bytes) */
typedef struct __attribute__((packed)) {
    uint8_t modifiers;        /* Modifier keys */
    uint8_t reserved;
    uint8_t keys[6];          /* Up to 6 simultaneous keys */
} hid_keyboard_report_t;

/* Modifier key bits */
#define HID_MOD_LCTRL             (1 << 0)
#define HID_MOD_LSHIFT            (1 << 1)
#define HID_MOD_LALT              (1 << 2)
#define HID_MOD_LGUI              (1 << 3)
#define HID_MOD_RCTRL             (1 << 4)
#define HID_MOD_RSHIFT            (1 << 5)
#define HID_MOD_RALT              (1 << 6)
#define HID_MOD_RGUI              (1 << 7)

/* Boot Mouse Report (3-4 bytes) */
typedef struct __attribute__((packed)) {
    uint8_t buttons;          /* Button states */
    int8_t  x;                /* X movement */
    int8_t  y;                /* Y movement */
    int8_t  wheel;            /* Scroll wheel (optional) */
} hid_mouse_report_t;

/* Mouse button bits */
#define HID_MOUSE_BTN_LEFT        (1 << 0)
#define HID_MOUSE_BTN_RIGHT       (1 << 1)
#define HID_MOUSE_BTN_MIDDLE      (1 << 2)

/* ============================================================================
 * HID Device Types
 * ============================================================================ */

typedef enum {
    HID_TYPE_UNKNOWN,
    HID_TYPE_KEYBOARD,
    HID_TYPE_MOUSE,
    HID_TYPE_GENERIC
} hid_type_t;

/* ============================================================================
 * HID Device Structure
 * ============================================================================ */

#define HID_MAX_DEVICES           4
#define HID_REPORT_BUFFER_SIZE    64

typedef struct hid_device {
    usb_device_t *usb_dev;    /* Parent USB device */
    uint8_t  interface_num;   /* Interface number */
    uint8_t  in_endpoint;     /* Interrupt IN endpoint address */
    uint8_t  out_endpoint;    /* Interrupt OUT endpoint (optional) */
    uint16_t report_size;     /* Max report size */
    uint8_t  interval;        /* Polling interval (ms) */

    hid_type_t type;

    /* Report buffers */
    uint8_t  report[HID_REPORT_BUFFER_SIZE];
    uint8_t  prev_report[HID_REPORT_BUFFER_SIZE];

    /* Linked list */
    struct hid_device *next;
} hid_device_t;

/* ============================================================================
 * Keyboard State
 * ============================================================================ */

#define HID_KEY_BUFFER_SIZE       32

typedef struct {
    uint8_t modifiers;        /* Current modifier state */
    uint8_t leds;             /* LED state */

    /* Key event buffer (circular) */
    char    key_buffer[HID_KEY_BUFFER_SIZE];
    uint8_t key_head;
    uint8_t key_tail;
} hid_keyboard_state_t;

/* LED bits */
#define HID_LED_NUM_LOCK          (1 << 0)
#define HID_LED_CAPS_LOCK         (1 << 1)
#define HID_LED_SCROLL_LOCK       (1 << 2)

/* ============================================================================
 * Mouse State
 * ============================================================================ */

typedef struct {
    uint8_t buttons;          /* Current button state */
    int32_t x;                /* Accumulated X movement */
    int32_t y;                /* Accumulated Y movement */
    int32_t wheel;            /* Accumulated scroll */
} hid_mouse_state_t;

/* ============================================================================
 * Functions
 * ============================================================================ */

/**
 * @brief Initialize HID driver
 */
int hid_init(void);

/**
 * @brief Probe USB device for HID interfaces
 */
int hid_probe(usb_device_t *usb_dev);

/**
 * @brief Poll HID devices for new reports
 */
void hid_poll(void);

/**
 * @brief Read a character from keyboard (non-blocking)
 * @return ASCII character, or 0 if no key available
 */
char hid_keyboard_read(void);

/**
 * @brief Check if keyboard data is available
 */
int hid_keyboard_available(void);

/**
 * @brief Set keyboard LEDs
 */
void hid_keyboard_set_leds(uint8_t leds);

/**
 * @brief Get current keyboard state
 */
hid_keyboard_state_t *hid_keyboard_state(void);

/**
 * @brief Get current mouse state
 */
hid_mouse_state_t *hid_mouse_state(void);

/**
 * @brief Reset mouse accumulated movement
 */
void hid_mouse_reset(void);

/**
 * @brief Convert HID usage code to ASCII
 */
char hid_usage_to_ascii(uint8_t usage, uint8_t modifiers);

/* Global state */
extern hid_device_t *hid_devices;
extern hid_keyboard_state_t g_hid_keyboard;
extern hid_mouse_state_t g_hid_mouse;

#endif /* EK_OS_USB_HID_H */
