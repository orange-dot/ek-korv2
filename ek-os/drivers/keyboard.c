/**
 * @file keyboard.c
 * @brief PS/2 Keyboard driver for EK-OS
 */

#include "keyboard.h"
#include "../lib/io.h"

#define KB_DATA_PORT    0x60
#define KB_STATUS_PORT  0x64
#define KB_CMD_PORT     0x64

/* Keyboard status bits */
#define KB_STATUS_OUTPUT_FULL   0x01
#define KB_STATUS_INPUT_FULL    0x02

/* Special keys */
#define KB_RELEASE      0x80
#define KB_LSHIFT       0x2A
#define KB_RSHIFT       0x36
#define KB_CAPS         0x3A
#define KB_CTRL         0x1D
#define KB_ALT          0x38

/* Modifier state */
static int shift_pressed = 0;
static int caps_lock = 0;
static int ctrl_pressed = 0;
static int alt_pressed = 0;

/* US keyboard scancode to ASCII (lowercase) */
static const char scancode_to_ascii_lower[128] = {
    0,    27,  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '\b',
    '\t', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\n',
    0,    'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', '`',
    0,    '\\', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 0,
    '*',  0,   ' ', 0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
    0,    0,   0,   0,   0,   0,   '-', 0,   0,   0,   '+', 0,   0,
    0,    0,   0,   0,   0,   0,   0,   0,   0
};

/* US keyboard scancode to ASCII (uppercase/shifted) */
static const char scancode_to_ascii_upper[128] = {
    0,    27,  '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '\b',
    '\t', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '\n',
    0,    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"', '~',
    0,    '|', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?', 0,
    '*',  0,   ' ', 0,   0,   0,   0,   0,   0,   0,   0,   0,   0,
    0,    0,   0,   0,   0,   0,   '-', 0,   0,   0,   '+', 0,   0,
    0,    0,   0,   0,   0,   0,   0,   0,   0
};

void keyboard_init(void) {
    /* Wait for controller to be ready */
    while (inb(KB_STATUS_PORT) & KB_STATUS_INPUT_FULL);

    /* Disable devices during setup */
    outb(KB_CMD_PORT, 0xAD);  /* Disable first PS/2 port */
    while (inb(KB_STATUS_PORT) & KB_STATUS_INPUT_FULL);

    /* Flush output buffer */
    while (inb(KB_STATUS_PORT) & KB_STATUS_OUTPUT_FULL) {
        inb(KB_DATA_PORT);
    }

    /* Enable first PS/2 port */
    outb(KB_CMD_PORT, 0xAE);
    while (inb(KB_STATUS_PORT) & KB_STATUS_INPUT_FULL);

    /* Reset keyboard */
    outb(KB_DATA_PORT, 0xFF);
    while (!(inb(KB_STATUS_PORT) & KB_STATUS_OUTPUT_FULL));
    inb(KB_DATA_PORT);  /* Read ACK */

    /* Set scan code set 1 */
    while (inb(KB_STATUS_PORT) & KB_STATUS_INPUT_FULL);
    outb(KB_DATA_PORT, 0xF0);
    while (!(inb(KB_STATUS_PORT) & KB_STATUS_OUTPUT_FULL));
    inb(KB_DATA_PORT);
    while (inb(KB_STATUS_PORT) & KB_STATUS_INPUT_FULL);
    outb(KB_DATA_PORT, 0x01);
    while (!(inb(KB_STATUS_PORT) & KB_STATUS_OUTPUT_FULL));
    inb(KB_DATA_PORT);

    /* Enable scanning */
    while (inb(KB_STATUS_PORT) & KB_STATUS_INPUT_FULL);
    outb(KB_DATA_PORT, 0xF4);
    while (!(inb(KB_STATUS_PORT) & KB_STATUS_OUTPUT_FULL));
    inb(KB_DATA_PORT);

    shift_pressed = 0;
    caps_lock = 0;
    ctrl_pressed = 0;
    alt_pressed = 0;
}

int keyboard_available(void) {
    return (inb(KB_STATUS_PORT) & KB_STATUS_OUTPUT_FULL) != 0;
}

char keyboard_read(void) {
    if (!keyboard_available()) {
        return 0;
    }

    uint8_t scancode = inb(KB_DATA_PORT);

    /* Handle key release */
    if (scancode & KB_RELEASE) {
        uint8_t key = scancode & ~KB_RELEASE;
        if (key == KB_LSHIFT || key == KB_RSHIFT) {
            shift_pressed = 0;
        } else if (key == KB_CTRL) {
            ctrl_pressed = 0;
        } else if (key == KB_ALT) {
            alt_pressed = 0;
        }
        return 0;
    }

    /* Handle modifiers */
    if (scancode == KB_LSHIFT || scancode == KB_RSHIFT) {
        shift_pressed = 1;
        return 0;
    }
    if (scancode == KB_CTRL) {
        ctrl_pressed = 1;
        return 0;
    }
    if (scancode == KB_ALT) {
        alt_pressed = 1;
        return 0;
    }
    if (scancode == KB_CAPS) {
        caps_lock = !caps_lock;
        return 0;
    }

    /* Convert to ASCII */
    if (scancode >= 128) {
        return 0;
    }

    char c;
    int use_upper = shift_pressed ^ caps_lock;

    if (use_upper) {
        c = scancode_to_ascii_upper[scancode];
    } else {
        c = scancode_to_ascii_lower[scancode];
    }

    /* Handle Ctrl combinations */
    if (ctrl_pressed && c >= 'a' && c <= 'z') {
        c = c - 'a' + 1;  /* Ctrl+A = 1, Ctrl+B = 2, etc. */
    }

    return c;
}
