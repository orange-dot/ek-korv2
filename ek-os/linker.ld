/**
 * @file linker.ld
 * @brief EK-OS Linker Script for UEFI (Windows PE format)
 *
 * For Windows/MinGW toolchain producing UEFI applications.
 * UEFI uses PE32+ format, same as Windows executables.
 * Section addresses are relative to the image base set by loader.
 */

OUTPUT_FORMAT(pei-x86-64)
ENTRY(efi_main)

SECTIONS
{
    /* Start sections at 0x1000 (relative to image base, after headers) */
    . = 0x1000;

    .text : ALIGN(0x1000)
    {
        *(.text .text.*)
    }

    .rodata : ALIGN(0x1000)
    {
        *(.rodata .rodata.*)
        *(.rdata .rdata.*)
    }

    .data : ALIGN(0x1000)
    {
        *(.data .data.*)
    }

    .bss : ALIGN(0x1000)
    {
        __bss_start = .;
        *(.bss .bss.*)
        *(COMMON)
        __bss_end = .;
    }

    /* Stack for BSP */
    . = ALIGN(0x1000);
    __stack_bottom = .;
    . += 64K;
    __stack_top = .;

    /DISCARD/ :
    {
        *(.comment)
        *(.note*)
        *(.eh_frame*)
        *(.pdata)
        *(.xdata)
        *(.debug*)
    }
}
