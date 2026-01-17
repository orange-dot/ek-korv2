# TriCore GCC Toolchain Configuration Report

## Problem Summary

When loading the JEZGRO RTOS ELF file into the TC397XP emulator, the following issues were observed:

1. **Missing segment at 0x80000000-0x80002000**: The startup code and Boot Mode Header (BMH) region is empty
2. **Suspicious segment at 0x7FFFFD00**: A segment appears just below PFLASH instead of at 0x80000000
3. **Entry point at 0x80002000**: Goes to interrupt vector table instead of `_start`
4. **BMH is all zeros**: Boot Mode Header at PFLASH start is not initialized

```
ELF Segments observed:
  Segment 0: vaddr=0x7FFFFD00 filesz=0x64E  (startup code?)
  Segment 1: vaddr=0x80002000              (interrupt table + code)

BMH at 0x80000000: all zeros
```

---

## TC39x Boot Process (Official Documentation)

According to [Infineon AP32381 documentation](https://documentation.infineon.com/aurixtc3xx/docs/nyb1710229964455):

### Boot Mode Header (BMHD) Structure

| Field | Offset | Size | Description |
|-------|--------|------|-------------|
| BMI | 0x0000 | 8 bits | Boot Mode Index |
| BMHDID | 0x0002 | 16 bits | Identifier (0xB359 = valid) |
| **STAD** | 0x0004 | 32 bits | **Start address (must be in PFLASH, word-aligned)** |
| CRCBMHD | 0x0008 | 32 bits | CRC checksum |
| CRCBMHD_N | 0x000C | 32 bits | Inverted CRC |

### BMHD Locations on TC397

**Important distinction:**
- **PFLASH BMH** (what we use): 0x80000000 (first 32 bytes of PFLASH)
- **UCB BMHD** (for production): 0xAF400000 (User Configuration Block)

For development/simulation, the PFLASH BMH at 0x80000000 is used. The first 32 bytes contain the BMH structure, with STAD pointing to the actual startup code.

### Required Memory Layout

```
0x80000000: +------------------+
            | BMH (32 bytes)   |  <- Boot Mode Header
0x80000020: +------------------+
            | _start code      |  <- STAD should point here
            | (startup section)|
            +------------------+
0x80002000: +------------------+
            | .inttab          |  <- Interrupt vector table (8KB aligned)
            +------------------+
```

---

## Our Current Configuration

### Linker Script (`cmake/tc397xp.ld`)

```ld
MEMORY
{
    BMH (rx)        : ORIGIN = 0x80000000, LENGTH = 32
    PFLASH0_C (rx)  : ORIGIN = 0x80000000, LENGTH = 3M
    ...
}

SECTIONS
{
    .bmhd_0 0x80000000 : FLAGS(arl)
    {
        KEEP(*(.bmhd_0))
    } > BMH

    .startup : ALIGN(4)
    {
        KEEP(*(.startup))
        *crt0*.o(.text .text.*)
    } > PFLASH0_C

    .inttab : ALIGN(8192)
    {
        KEEP(*(.inttab))
    } > PFLASH0_C
    ...
}
```

### Startup Code (`src/crt0_tc397xp.s`)

```asm
    .section .startup, "ax", @progbits
    .global _start

_start:
_crt0_reset:
    disable
    mfcr    %d0, CSFR_CORE_ID
    ...
```

### Identified Problems

1. **No `.bmhd_0` content defined**: The linker script references `.bmhd_0` section but no source file creates this section with valid BMH data

2. **Overlapping memory regions**: BMH and PFLASH0_C both start at 0x80000000, causing potential conflicts

3. **`.startup` section offset**: When `.bmhd_0` is empty (0 bytes), `.startup` might start at wrong address

4. **GCC internal linker issues**: The [EEESlab toolchain issue #8](https://github.com/EEESlab/tricore-gcc-toolchain-11.3.0/issues/8) documents that segment permissions and addresses can be incorrect

---

## How Working Projects Handle This

### Method 1: iLLD / AURIX Development Studio

From [Infineon Community](https://community.infineon.com/t5/AURIX/How-to-add-boot-mode-headers-BMHD-for-TC397-controller/td-p/343397):

Create `Ifx_Cfg_SswBmhd.c`:

```c
#include "Ifx_Cfg_SswBmhd.h"

#pragma section farrom "bmhd_0_orig"
const Ifx_Ssw_Bmhd bmhd_0_orig = {
    0x00FE,        // BMI: Internal start from flash
    0xB359,        // BMHDID: Valid header
    0x80000020,    // STAD: Start address (after BMH)
    0x91A38F03,    // CRC (calculated)
    0x6E5C70FC     // Inverted CRC
};
#pragma section farrom restore
```

### Method 2: OpenBLT Bootloader

From [OpenBLT TriCore TC3 documentation](https://www.feaser.com/openblt/doku.php?id=manual:ports:tricore_tc3):

- First 32 bytes reserved for `_START()` function
- Boot Mode Header stored separately in UCB
- Application offset from 0x80000000 by bootloader size

### Method 3: Direct ASM Definition

```asm
    .section .bmhd_0, "a", @progbits
    .global __BMHD_0

__BMHD_0:
    .short  0x00FE          /* BMI */
    .short  0xB359          /* BMHDID */
    .long   _start          /* STAD - linker resolves to actual address */
    .long   0x00000000      /* CRC - computed by programmer */
    .long   0xFFFFFFFF      /* CRC inverted */
    .space  20, 0xFF        /* Padding to 32 bytes */
```

---

## Root Cause Analysis

### Why segment appears at 0x7FFFFD00

The address `0x7FFFFD00` is suspicious because:
- It's `0x80000000 - 0x300 = 0x7FFFFD00`
- This suggests a **signed vs unsigned address calculation issue** in the linker or toolchain

Possible causes:
1. **tricore-elf-gcc linker bug**: The internal linker script may have issues with addresses above 0x7FFFFFFF (32-bit signed boundary)
2. **Missing memory region**: If `.bmhd_0` has no content, the linker may place `.startup` at an unexpected location
3. **Section ordering**: Without explicit address in `.startup`, GCC may miscalculate

### GCC Default Linker Script Issues

From [bob's blog on TriCore emulation](https://bobbl.github.io/tricore/2025/11/12/tricore-user-mode-emulation.html):

> "The internal linker script of gcc does not define memory regions and the internal startup code does access an invalid memory mapped register which causes an exception."

This confirms that:
- Custom linker scripts are mandatory for TC39x
- Default GCC behavior doesn't work for TriCore microcontrollers

---

## Comparison: Our Code vs Reference

| Aspect | Our Code | Reference (iLLD/working) |
|--------|----------|--------------------------|
| BMH section | `.bmhd_0` (empty) | `.bmhd_0_orig` with C struct |
| BMH content | None | Valid BMI, BMHDID, STAD, CRC |
| Memory regions | BMH overlaps PFLASH0_C | Separate non-overlapping |
| STAD value | Not set | Points to `_start` address |
| CRC calculation | Missing | Computed offline or by tool |

---

## Recommended Fixes

### Fix 1: Add BMH C Source File

Create `src/bmhd_tc397xp.c`:

```c
/**
 * Boot Mode Header for TC397XP
 * Must be placed at 0x80000000 (start of PFLASH)
 */

/* Place in .bmhd_0 section */
__attribute__((section(".bmhd_0")))
const unsigned int bmhd_0[8] = {
    0xB35900FE,     /* BMI (0x00FE) + BMHDID (0xB359) */
    0x80000020,     /* STAD: _start address (after BMH) */
    0x00000000,     /* CRC placeholder */
    0xFFFFFFFF,     /* CRC inverted placeholder */
    0x00000000,     /* Reserved */
    0x00000000,
    0x00000000,
    0x00000000
};
```

### Fix 2: Update Linker Script

```ld
MEMORY
{
    /* BMH is separate, non-overlapping */
    BMH (rx)        : ORIGIN = 0x80000000, LENGTH = 32
    PFLASH0_C (rx)  : ORIGIN = 0x80000020, LENGTH = 3M - 32
    ...
}

SECTIONS
{
    .bmhd_0 0x80000000 :
    {
        KEEP(*(.bmhd_0))
        . = 0x20;  /* Force 32 bytes */
    } > BMH

    .startup 0x80000020 : /* Explicit address after BMH */
    {
        KEEP(*(.startup))
        *crt0*.o(.text .text.*)
    } > PFLASH0_C
    ...
}
```

### Fix 3: Alternative - Skip BMH for Emulator

For emulator testing (no boot firmware), directly set entry point:

```ld
ENTRY(_start)  /* Already present */

SECTIONS
{
    /* Place startup directly at PFLASH start */
    .startup 0x80000000 :
    {
        KEEP(*(.startup))
        *crt0*.o(.text .text.*)
    } > PFLASH0_C

    /* Skip BMH entirely for emulator */
    ...
}
```

And in emulator, read entry point from ELF header instead of BMH STAD.

---

## Emulator-Side Workaround

If fixing the toolchain is complex, the emulator can:

1. **Read ELF entry point directly** (already done):
   ```c
   entry_point = ehdr.e_entry;  // Use ELF header entry
   ```

2. **Handle segment at 0x7FFFFD00**:
   ```c
   // Map suspicious negative-looking addresses to PFLASH
   if (vaddr >= 0x7FFF0000 && vaddr < 0x80000000) {
       uint32_t offset = 0x80000000 - vaddr;
       vaddr = 0x80000000;  // Remap to PFLASH start
   }
   ```

3. **Ignore BMH for simulation**: The real boot firmware parses BMH, but emulator can skip to entry point directly

---

## Conclusions

1. **The segment at 0x7FFFFD00 is likely a toolchain bug** related to signed address handling in tricore-elf-gcc

2. **Missing BMH content** is the primary issue - we need to create a C or ASM file that populates `.bmhd_0` section

3. **Overlapping memory regions** in the linker script may cause unexpected placement

4. **For emulator testing**, the simplest fix is to:
   - Use ELF entry point directly
   - Remap segments near 0x80000000 boundary
   - Skip BMH parsing

5. **For real hardware**, we must:
   - Add valid BMH structure with correct CRC
   - Ensure STAD points to `_start`
   - Use Infineon-provided tools for CRC calculation

---

## References

- [Infineon: How to add boot mode headers for TC397](https://community.infineon.com/t5/AURIX/How-to-add-boot-mode-headers-BMHD-for-TC397-controller/td-p/343397)
- [AP32381 AURIX TC3xx startup and initialization](https://documentation.infineon.com/aurixtc3xx/docs/nyb1710229964455)
- [OpenBLT TriCore TC3 Port](https://www.feaser.com/openblt/doku.php?id=manual:ports:tricore_tc3)
- [EEESlab tricore-gcc-toolchain issues](https://github.com/EEESlab/tricore-gcc-toolchain-11.3.0/issues/8)
- [Infineon AURIX Code Examples](https://github.com/Infineon/AURIX_code_examples)
- [lersi/tricore_gcc](https://github.com/lersi/tricore_gcc)
