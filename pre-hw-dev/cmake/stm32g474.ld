/* =============================================================================
 * STM32G474 Linker Script for JEZGRO RTOS
 * Memory: 512KB Flash, 96KB SRAM (80K SRAM1 + 16K SRAM2), 32KB CCM
 * ============================================================================= */

/* Entry Point */
ENTRY(Reset_Handler)

/* Stack size - 4KB for main stack */
_Min_Stack_Size = 0x1000;

/* Heap size - 8KB for dynamic allocation */
_Min_Heap_Size = 0x2000;

/* Memory Regions */
MEMORY
{
    /* Main Flash - 512 KB */
    FLASH (rx)    : ORIGIN = 0x08000000, LENGTH = 512K

    /* SRAM1 - 80 KB (main working memory) */
    SRAM1 (rwx)   : ORIGIN = 0x20000000, LENGTH = 80K

    /* SRAM2 - 16 KB (can be retained in standby) */
    SRAM2 (rwx)   : ORIGIN = 0x20014000, LENGTH = 16K

    /* CCM SRAM - 32 KB (core coupled, fastest, no DMA access) */
    CCM (rwx)     : ORIGIN = 0x10000000, LENGTH = 32K
}

/* Stack at end of SRAM1 */
_estack = ORIGIN(SRAM1) + LENGTH(SRAM1);

/* Sections */
SECTIONS
{
    /* Vector table and code go to Flash */
    .isr_vector :
    {
        . = ALIGN(4);
        KEEP(*(.isr_vector))    /* Startup code */
        . = ALIGN(4);
    } >FLASH

    /* Code section */
    .text :
    {
        . = ALIGN(4);
        *(.text)
        *(.text*)
        *(.glue_7)              /* ARM-Thumb glue */
        *(.glue_7t)
        *(.eh_frame)

        KEEP(*(.init))
        KEEP(*(.fini))

        . = ALIGN(4);
        _etext = .;
    } >FLASH

    /* Read-only data */
    .rodata :
    {
        . = ALIGN(4);
        *(.rodata)
        *(.rodata*)
        . = ALIGN(4);
    } >FLASH

    /* ARM exception unwind tables */
    .ARM.extab :
    {
        *(.ARM.extab* .gnu.linkonce.armextab.*)
    } >FLASH

    .ARM :
    {
        __exidx_start = .;
        *(.ARM.exidx*)
        __exidx_end = .;
    } >FLASH

    /* Used by startup to initialize data */
    _sidata = LOADADDR(.data);

    /* Initialized data - copied from Flash to SRAM at startup */
    .data :
    {
        . = ALIGN(4);
        _sdata = .;
        *(.data)
        *(.data*)
        . = ALIGN(4);
        _edata = .;
    } >SRAM1 AT> FLASH

    /* Uninitialized data - zeroed at startup */
    .bss :
    {
        . = ALIGN(4);
        _sbss = .;
        __bss_start__ = _sbss;
        *(.bss)
        *(.bss*)
        *(COMMON)
        . = ALIGN(4);
        _ebss = .;
        __bss_end__ = _ebss;
    } >SRAM1

    /* User heap */
    ._user_heap_stack :
    {
        . = ALIGN(8);
        PROVIDE(end = .);
        PROVIDE(_end = .);
        . = . + _Min_Heap_Size;
        . = . + _Min_Stack_Size;
        . = ALIGN(8);
    } >SRAM1

    /* CCM SRAM - use for task stacks (fast, no DMA contention) */
    .ccmram (NOLOAD) :
    {
        . = ALIGN(4);
        _sccmram = .;
        *(.ccmram)
        *(.ccmram*)
        . = ALIGN(4);
        _eccmram = .;
    } >CCM

    /* SRAM2 - use for data that needs standby retention */
    .sram2 (NOLOAD) :
    {
        . = ALIGN(4);
        *(.sram2)
        *(.sram2*)
        . = ALIGN(4);
    } >SRAM2

    /* Remove debug info from output */
    /DISCARD/ :
    {
        libc.a(*)
        libm.a(*)
        libgcc.a(*)
    }

    /* ARM attributes */
    .ARM.attributes 0 : { *(.ARM.attributes) }
}
