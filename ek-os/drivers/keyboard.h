/**
 * @file keyboard.h
 * @brief PS/2 Keyboard driver for EK-OS
 */

#ifndef EK_OS_KEYBOARD_H
#define EK_OS_KEYBOARD_H

#include <stdint.h>

/**
 * @brief Initialize PS/2 keyboard
 */
void keyboard_init(void);

/**
 * @brief Read a character from keyboard (non-blocking)
 * @return ASCII character, or 0 if no key pressed
 */
char keyboard_read(void);

/**
 * @brief Check if a key is available
 */
int keyboard_available(void);

#endif /* EK_OS_KEYBOARD_H */
