/*
 * TC397XP Linker Script
 * Target: SAK-TC397XP-256F300S BD
 *
 * Memory Layout:
 *   - 6 CPU cores (CPU0-CPU5)
 *   - CPU0-CPU3: Lockstep capable (ASIL-D)
 *   - CPU4-CPU5: Non-lockstep (performance)
 *   - Each core has private DSPR (Data Scratch-Pad RAM) and PSPR (Program Scratch-Pad RAM)
 *   - Shared LMU (Local Memory Unit) accessible by all cores
 */

OUTPUT_FORMAT("elf32-tricore")
OUTPUT_ARCH(tricore)
ENTRY(_start)

/* ==========================================================================
 * Memory Regions
 * ========================================================================== */

MEMORY
{
    /* ======================================================================
     * Program Flash (PFLASH) - Total 16 MB
     * Cached access via 0x80xxxxxx, non-cached via 0xA0xxxxxx
     * ====================================================================== */

    /* Boot Mode Header - First 32 bytes of PFLASH0 (must be separate!) */
    BMH (rx)        : ORIGIN = 0x80000000, LENGTH = 32

    /* PFLASH0 starts after BMH to avoid overlap */
    PFLASH0_C (rx)  : ORIGIN = 0x80000020, LENGTH = 3M - 32 /* Bank 0 (cached) */
    PFLASH1_C (rx)  : ORIGIN = 0x80300000, LENGTH = 3M      /* Bank 1 (cached) */
    PFLASH2_C (rx)  : ORIGIN = 0x80600000, LENGTH = 3M      /* Bank 2 (cached) */
    PFLASH3_C (rx)  : ORIGIN = 0x80900000, LENGTH = 3M      /* Bank 3 (cached) */
    PFLASH4_C (rx)  : ORIGIN = 0x80C00000, LENGTH = 3M      /* Bank 4 (cached) */

    /* ======================================================================
     * Data Scratch-Pad RAM (DSPR) - Per-core private RAM
     * Zero wait-state access, fastest memory for each core
     * ====================================================================== */
    DSPR0 (rwx)     : ORIGIN = 0x70000000, LENGTH = 240K    /* CPU0 */
    DSPR1 (rwx)     : ORIGIN = 0x60000000, LENGTH = 240K    /* CPU1 */
    DSPR2 (rwx)     : ORIGIN = 0x50000000, LENGTH = 240K    /* CPU2 */
    DSPR3 (rwx)     : ORIGIN = 0x40000000, LENGTH = 96K     /* CPU3 */
    DSPR4 (rwx)     : ORIGIN = 0x30000000, LENGTH = 96K     /* CPU4 */
    DSPR5 (rwx)     : ORIGIN = 0x10000000, LENGTH = 96K     /* CPU5 */

    /* ======================================================================
     * Program Scratch-Pad RAM (PSPR) - Per-core private RAM for code
     * Zero wait-state, used for time-critical interrupt handlers
     * ====================================================================== */
    PSPR0 (rwx)     : ORIGIN = 0x70100000, LENGTH = 64K     /* CPU0 */
    PSPR1 (rwx)     : ORIGIN = 0x60100000, LENGTH = 64K     /* CPU1 */
    PSPR2 (rwx)     : ORIGIN = 0x50100000, LENGTH = 64K     /* CPU2 */
    PSPR3 (rwx)     : ORIGIN = 0x40100000, LENGTH = 64K     /* CPU3 */
    PSPR4 (rwx)     : ORIGIN = 0x30100000, LENGTH = 64K     /* CPU4 */
    PSPR5 (rwx)     : ORIGIN = 0x10100000, LENGTH = 64K     /* CPU5 */

    /* ======================================================================
     * Local Memory Unit (LMU) - Shared RAM
     * Accessible by all cores, used for inter-core communication
     * ====================================================================== */
    LMU (rwx)       : ORIGIN = 0x90000000, LENGTH = 768K

    /* ======================================================================
     * Peripheral Space (reference only, not in MEMORY)
     * ====================================================================== */
    /* SFR:   0xF0000000 - 0xFFFFFFFF */
    /* EMEM:  0x99000000 (emulation devices only) */
}

/* ==========================================================================
 * Memory Allocation
 * ========================================================================== */

/* CSA (Context Save Area) pool size per core - 64 bytes per CSA entry */
__CSA_SIZE_PER_CORE = 16K;  /* 256 CSA entries per core */

/* Stack size per core */
__STACK_SIZE_PER_CORE = 8K;

/* Heap size per core (minimal, RTOS uses pools) */
__HEAP_SIZE_PER_CORE = 4K;

/* IPC shared buffer in LMU */
__IPC_BUFFER_SIZE = 64K;

/* ==========================================================================
 * Sections
 * ========================================================================== */

SECTIONS
{
    /* ======================================================================
     * Boot Mode Header (BMH) - Required by TC3xx boot loader
     * Must be at 0x80000000 with valid STAD pointing to _start
     * ====================================================================== */
    .bmhd_0 0x80000000 :
    {
        KEEP(*(.bmhd_0))
        . = 0x20;  /* Force section to be exactly 32 bytes */
    } > BMH

    /* ======================================================================
     * Startup Code - Immediately after BMH at 0x80000020
     * STAD in BMH points here
     * ====================================================================== */
    .startup 0x80000020 :
    {
        PROVIDE(__STARTUP_START = .);
        KEEP(*(.startup))
        KEEP(*(.startup.*))
        *crt0*.o(.text .text.*)
        PROVIDE(__STARTUP_END = .);
    } > PFLASH0_C

    /* ======================================================================
     * Interrupt Vector Table
     * ====================================================================== */
    .inttab : ALIGN(8192)
    {
        PROVIDE(__INTTAB_BASE = .);
        KEEP(*(.inttab))
        KEEP(*(.inttab.*))
    } > PFLASH0_C

    /* ======================================================================
     * Trap Vector Table
     * ====================================================================== */
    .traptab : ALIGN(256)
    {
        PROVIDE(__TRAPTAB_BASE = .);
        KEEP(*(.traptab))
        KEEP(*(.traptab.*))
    } > PFLASH0_C

    /* ======================================================================
     * Code (.text)
     * ====================================================================== */
    .text : ALIGN(4)
    {
        *(.text)
        *(.text.*)
        *(.gnu.linkonce.t.*)

        /* C++ constructors/destructors */
        KEEP(*(.init))
        KEEP(*(.fini))

        /* ARM-style init/fini arrays */
        PROVIDE_HIDDEN(__init_array_start = .);
        KEEP(*(SORT(.init_array.*)))
        KEEP(*(.init_array))
        PROVIDE_HIDDEN(__init_array_end = .);

        PROVIDE_HIDDEN(__fini_array_start = .);
        KEEP(*(SORT(.fini_array.*)))
        KEEP(*(.fini_array))
        PROVIDE_HIDDEN(__fini_array_end = .);
    } > PFLASH0_C

    /* ======================================================================
     * Read-Only Data (.rodata)
     * ====================================================================== */
    .rodata : ALIGN(4)
    {
        *(.rodata)
        *(.rodata.*)
        *(.srodata)         /* GCC 13+ small read-only data */
        *(.srodata.*)
        *(.gnu.linkonce.r.*)
    } > PFLASH0_C

    /* ======================================================================
     * Small Constant Data (.sdata2 / .sbss2) - Required by libc
     * ====================================================================== */
    .sdata2 : ALIGN(4)
    {
        PROVIDE(__SDATA2_BASE = .);
        KEEP(*(.sdata2))
        KEEP(*(.sdata2.*))
        KEEP(*(.gnu.linkonce.s2.*))
        /* Ensure section exists even if empty */
        . = ALIGN(4);
    } > PFLASH0_C

    /* End of flash content */
    PROVIDE(__FLASH_END = .);

    /* ======================================================================
     * CPU0 Private Memory (DSPR0) - Boot Core
     * ====================================================================== */

    /* Initialized data for CPU0 - copied from flash at startup */
    .data_cpu0 : ALIGN(8)
    {
        PROVIDE(__DATA_CPU0_START = .);
        *(.data.cpu0)
        *(.data.cpu0.*)
        PROVIDE(__DATA_CPU0_END = .);
    } > DSPR0 AT > PFLASH0_C

    PROVIDE(__DATA_CPU0_LOAD = LOADADDR(.data_cpu0));

    /* Global initialized data - CPU0 is primary */
    .data : ALIGN(8)
    {
        PROVIDE(__DATA_START = .);
        *(.data)
        *(.data.*)
        *(.gnu.linkonce.d.*)
        PROVIDE(__DATA_END = .);
    } > DSPR0 AT > PFLASH0_C

    PROVIDE(__DATA_LOAD = LOADADDR(.data));

    /* Small initialized data - Required by libc */
    .sdata : ALIGN(4)
    {
        PROVIDE(__SDATA_BASE = .);
        KEEP(*(.sdata))
        KEEP(*(.sdata.*))
        KEEP(*(.gnu.linkonce.s.*))
        . = ALIGN(4);
    } > DSPR0 AT > PFLASH0_C

    PROVIDE(__SDATA_LOAD = LOADADDR(.sdata));

    /* Uninitialized data for CPU0 */
    .bss_cpu0 (NOLOAD) : ALIGN(8)
    {
        PROVIDE(__BSS_CPU0_START = .);
        *(.bss.cpu0)
        *(.bss.cpu0.*)
        PROVIDE(__BSS_CPU0_END = .);
    } > DSPR0

    /* Global uninitialized data */
    .bss (NOLOAD) : ALIGN(8)
    {
        PROVIDE(__BSS_START = .);
        *(.bss)
        *(.bss.*)
        *(.gnu.linkonce.b.*)
        /* Custom per-variable sections from -fdata-sections */
        *(.g_*)
        *(COMMON)
        PROVIDE(__BSS_END = .);
    } > DSPR0

    /* Small uninitialized data - Required by libc */
    .sbss (NOLOAD) : ALIGN(4)
    {
        PROVIDE(__SBSS_START = .);
        KEEP(*(.sbss))
        KEEP(*(.sbss.*))
        KEEP(*(.gnu.linkonce.sb.*))
        PROVIDE(__SBSS_END = .);
        . = ALIGN(4);
    } > DSPR0

    /* CPU0 CSA pool */
    .csa_cpu0 (NOLOAD) : ALIGN(64)
    {
        PROVIDE(__CSA_CPU0_START = .);
        . += __CSA_SIZE_PER_CORE;
        PROVIDE(__CSA_CPU0_END = .);
    } > DSPR0

    /* CPU0 Stack */
    .stack_cpu0 (NOLOAD) : ALIGN(8)
    {
        PROVIDE(__STACK_CPU0_START = .);
        . += __STACK_SIZE_PER_CORE;
        PROVIDE(__STACK_CPU0_END = .);
    } > DSPR0

    /* CPU0 Heap */
    .heap_cpu0 (NOLOAD) : ALIGN(8)
    {
        PROVIDE(__HEAP_CPU0_START = .);
        PROVIDE(__HEAP = .);         /* Standard libc symbol */
        . += __HEAP_SIZE_PER_CORE;
        PROVIDE(__HEAP_CPU0_END = .);
        PROVIDE(__HEAP_END = .);     /* Standard libc symbol */
    } > DSPR0

    /* ======================================================================
     * CPU1 Private Memory (DSPR1)
     * ====================================================================== */
    .data_cpu1 : ALIGN(8) { *(.data.cpu1) *(.data.cpu1.*) } > DSPR1 AT > PFLASH0_C
    .bss_cpu1 (NOLOAD) : ALIGN(8) { *(.bss.cpu1) *(.bss.cpu1.*) } > DSPR1
    .csa_cpu1 (NOLOAD) : ALIGN(64) { PROVIDE(__CSA_CPU1_START = .); . += __CSA_SIZE_PER_CORE; PROVIDE(__CSA_CPU1_END = .); } > DSPR1
    .stack_cpu1 (NOLOAD) : ALIGN(8) { PROVIDE(__STACK_CPU1_START = .); . += __STACK_SIZE_PER_CORE; PROVIDE(__STACK_CPU1_END = .); } > DSPR1

    /* ======================================================================
     * CPU2 Private Memory (DSPR2)
     * ====================================================================== */
    .data_cpu2 : ALIGN(8) { *(.data.cpu2) *(.data.cpu2.*) } > DSPR2 AT > PFLASH0_C
    .bss_cpu2 (NOLOAD) : ALIGN(8) { *(.bss.cpu2) *(.bss.cpu2.*) } > DSPR2
    .csa_cpu2 (NOLOAD) : ALIGN(64) { PROVIDE(__CSA_CPU2_START = .); . += __CSA_SIZE_PER_CORE; PROVIDE(__CSA_CPU2_END = .); } > DSPR2
    .stack_cpu2 (NOLOAD) : ALIGN(8) { PROVIDE(__STACK_CPU2_START = .); . += __STACK_SIZE_PER_CORE; PROVIDE(__STACK_CPU2_END = .); } > DSPR2

    /* ======================================================================
     * CPU3 Private Memory (DSPR3)
     * ====================================================================== */
    .data_cpu3 : ALIGN(8) { *(.data.cpu3) *(.data.cpu3.*) } > DSPR3 AT > PFLASH0_C
    .bss_cpu3 (NOLOAD) : ALIGN(8) { *(.bss.cpu3) *(.bss.cpu3.*) } > DSPR3
    .csa_cpu3 (NOLOAD) : ALIGN(64) { PROVIDE(__CSA_CPU3_START = .); . += __CSA_SIZE_PER_CORE; PROVIDE(__CSA_CPU3_END = .); } > DSPR3
    .stack_cpu3 (NOLOAD) : ALIGN(8) { PROVIDE(__STACK_CPU3_START = .); . += __STACK_SIZE_PER_CORE; PROVIDE(__STACK_CPU3_END = .); } > DSPR3

    /* ======================================================================
     * CPU4 Private Memory (DSPR4)
     * ====================================================================== */
    .data_cpu4 : ALIGN(8) { *(.data.cpu4) *(.data.cpu4.*) } > DSPR4 AT > PFLASH0_C
    .bss_cpu4 (NOLOAD) : ALIGN(8) { *(.bss.cpu4) *(.bss.cpu4.*) } > DSPR4
    .csa_cpu4 (NOLOAD) : ALIGN(64) { PROVIDE(__CSA_CPU4_START = .); . += __CSA_SIZE_PER_CORE; PROVIDE(__CSA_CPU4_END = .); } > DSPR4
    .stack_cpu4 (NOLOAD) : ALIGN(8) { PROVIDE(__STACK_CPU4_START = .); . += __STACK_SIZE_PER_CORE; PROVIDE(__STACK_CPU4_END = .); } > DSPR4

    /* ======================================================================
     * CPU5 Private Memory (DSPR5)
     * ====================================================================== */
    .data_cpu5 : ALIGN(8) { *(.data.cpu5) *(.data.cpu5.*) } > DSPR5 AT > PFLASH0_C
    .bss_cpu5 (NOLOAD) : ALIGN(8) { *(.bss.cpu5) *(.bss.cpu5.*) } > DSPR5
    .csa_cpu5 (NOLOAD) : ALIGN(64) { PROVIDE(__CSA_CPU5_START = .); . += __CSA_SIZE_PER_CORE; PROVIDE(__CSA_CPU5_END = .); } > DSPR5
    .stack_cpu5 (NOLOAD) : ALIGN(8) { PROVIDE(__STACK_CPU5_START = .); . += __STACK_SIZE_PER_CORE; PROVIDE(__STACK_CPU5_END = .); } > DSPR5

    /* ======================================================================
     * LMU - Shared Memory (Inter-Core Communication)
     * ====================================================================== */

    /* IPC message buffers */
    .ipc_buffers (NOLOAD) : ALIGN(64)
    {
        PROVIDE(__IPC_START = .);
        *(.ipc)
        *(.ipc.*)
        . += __IPC_BUFFER_SIZE;
        PROVIDE(__IPC_END = .);
    } > LMU

    /* Cross-core spinlocks */
    .spinlocks (NOLOAD) : ALIGN(64)
    {
        PROVIDE(__SPINLOCK_START = .);
        *(.spinlock)
        *(.spinlock.*)
        PROVIDE(__SPINLOCK_END = .);
    } > LMU

    /* Shared data (accessible by all cores) */
    .shared (NOLOAD) : ALIGN(8)
    {
        PROVIDE(__SHARED_START = .);
        *(.shared)
        *(.shared.*)
        PROVIDE(__SHARED_END = .);
    } > LMU

    /* ======================================================================
     * Debug Sections
     * ====================================================================== */
    .comment        0 : { *(.comment) }
    .debug          0 : { *(.debug) }
    .debug_info     0 : { *(.debug_info .gnu.linkonce.wi.*) }
    .debug_abbrev   0 : { *(.debug_abbrev) }
    .debug_line     0 : { *(.debug_line .debug_line.* .debug_line_end ) }
    .debug_frame    0 : { *(.debug_frame) }
    .debug_str      0 : { *(.debug_str) }
    .debug_loc      0 : { *(.debug_loc) }
    .debug_macinfo  0 : { *(.debug_macinfo) }
    .debug_ranges   0 : { *(.debug_ranges) }

    /* ======================================================================
     * Discard
     * ====================================================================== */
    /DISCARD/ :
    {
        *(.note.GNU-stack)
        *(.gnu_debuglink)
        *(.gnu.lto_*)
    }
}

/* ==========================================================================
 * Symbol Exports for Startup Code
 * ========================================================================== */

/* Flash symbols */
PROVIDE(__PFLASH_START = ORIGIN(PFLASH0_C));
PROVIDE(__PFLASH_SIZE = LENGTH(PFLASH0_C) + LENGTH(PFLASH1_C) + LENGTH(PFLASH2_C) + LENGTH(PFLASH3_C) + LENGTH(PFLASH4_C));

/* LMU symbols */
PROVIDE(__LMU_START = ORIGIN(LMU));
PROVIDE(__LMU_SIZE = LENGTH(LMU));

/* Per-core stack top symbols (stack grows downward) */
PROVIDE(__STACK_TOP_CPU0 = __STACK_CPU0_END);
PROVIDE(__STACK_TOP_CPU1 = __STACK_CPU1_END);
PROVIDE(__STACK_TOP_CPU2 = __STACK_CPU2_END);
PROVIDE(__STACK_TOP_CPU3 = __STACK_CPU3_END);
PROVIDE(__STACK_TOP_CPU4 = __STACK_CPU4_END);
PROVIDE(__STACK_TOP_CPU5 = __STACK_CPU5_END);

/* Aliases for crt0 compatibility (stack top = end of stack region) */
PROVIDE(__STACK_CPU0 = __STACK_CPU0_END);
PROVIDE(__STACK_CPU1 = __STACK_CPU1_END);
PROVIDE(__STACK_CPU2 = __STACK_CPU2_END);
PROVIDE(__STACK_CPU3 = __STACK_CPU3_END);
PROVIDE(__STACK_CPU4 = __STACK_CPU4_END);
PROVIDE(__STACK_CPU5 = __STACK_CPU5_END);
