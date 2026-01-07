/**
 * @file bmhd_tc397xp.c
 * @brief Boot Mode Header for TC397XP
 *
 * This file defines the Boot Mode Header (BMH) structure that must be
 * placed at the start of PFLASH (0x80000000). The boot firmware reads
 * this header to determine where to jump after reset.
 *
 * For TC3xx, the BMH contains:
 *   - BMI: Boot Mode Index (0x00FE = internal flash start)
 *   - BMHDID: Header ID (0xB359 = valid)
 *   - STAD: Start address (entry point)
 *   - CRC: Checksum (0 for development/emulator)
 */

#include <stdint.h>

/* External symbol from linker - address of _start */
extern void _start(void);

/**
 * Boot Mode Header structure
 * Placed at 0x80000000 (start of PFLASH)
 */
__attribute__((section(".bmhd_0"), used))
const uint32_t __bmhd_0[8] = {
    /* Word 0: BMI (lower 16 bits) + BMHDID (upper 16 bits) */
    /* BMI = 0x00FE: Internal start from flash, no ABM, no LBIST */
    /* BMHDID = 0xB359: Valid boot mode header marker */
    0xB35900FE,

    /* Word 1: STAD - Start Address */
    /* Must point to _start in .startup section */
    /* Using fixed address 0x80000020 (right after 32-byte BMH) */
    0x80000020,

    /* Word 2: CRCBMHD - CRC over bytes 0x000-0x007 */
    /* For emulator/development, we use 0 (CRC check disabled) */
    0x00000000,

    /* Word 3: CRCBMHD_N - Inverted CRC */
    /* Must be bitwise inverse of CRCBMHD */
    0xFFFFFFFF,

    /* Words 4-7: Reserved, should be 0 */
    0x00000000,
    0x00000000,
    0x00000000,
    0x00000000
};
