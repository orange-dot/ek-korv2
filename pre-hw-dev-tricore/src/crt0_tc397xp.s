/**
 * @file crt0_tc397xp.s
 * @brief TriCore TC397XP Startup Assembly Code
 *
 * This is the entry point after reset. Each core starts here and:
 *   1. Sets up initial stack pointer (A10)
 *   2. Initializes CSA pool (FCX, LCX)
 *   3. Enables interrupts (ICR)
 *   4. Jumps to C startup code
 *
 * Memory layout per core:
 *   - Private stack in DSPR
 *   - Private CSA pool in DSPR
 *   - Shared data in LMU
 *
 * Compatible with tricore-elf-gcc 13.x (NoMore201 toolchain)
 */

    .section .startup, "ax", @progbits
    .global _start
    .global _crt0_reset
    .type _start, @function
    .type _crt0_reset, @function

/* ==========================================================================
 * Register Definitions
 * ========================================================================== */

/* Core Special Function Registers */
.equ CSFR_PCXI,     0xFE00      /* Previous Context Information */
.equ CSFR_PSW,      0xFE04      /* Program Status Word */
.equ CSFR_PC,       0xFE08      /* Program Counter */
.equ CSFR_SYSCON,   0xFE14      /* System Configuration */
.equ CSFR_CORE_ID,  0xFE1C      /* Core Identification */
.equ CSFR_BIV,      0xFE20      /* Base Interrupt Vector */
.equ CSFR_BTV,      0xFE24      /* Base Trap Vector */
.equ CSFR_ISP,      0xFE28      /* Interrupt Stack Pointer */
.equ CSFR_ICR,      0xFE2C      /* Interrupt Control Register */
.equ CSFR_FCX,      0xFE38      /* Free Context List Head */
.equ CSFR_LCX,      0xFE3C      /* Free Context List Limit */

/* PSW bits */
.equ PSW_IO_USER,       0       /* User mode */
.equ PSW_IO_SUPERVISOR, 1       /* Supervisor mode */
.equ PSW_IO_SHIFT,      10      /* IO field shift */
.equ PSW_GW,            0x100   /* Global Write enable */
.equ PSW_CDE,           0x80    /* Call Depth Enable */
.equ PSW_CDC_MASK,      0x7F    /* Call Depth Counter mask */

/* ICR bits */
.equ ICR_IE,            0x100   /* Interrupt Enable */

/* Memory addresses (from linker script) */
.extern __STACK_CPU0
.extern __STACK_CPU1
.extern __STACK_CPU2
.extern __STACK_CPU3
.extern __STACK_CPU4
.extern __STACK_CPU5
.extern __CSA_CPU0_START
.extern __CSA_CPU1_START
.extern __CSA_CPU2_START
.extern __CSA_CPU3_START
.extern __CSA_CPU4_START
.extern __CSA_CPU5_START
.extern __CSA_CPU0_END
.extern __CSA_CPU1_END
.extern __CSA_CPU2_END
.extern __CSA_CPU3_END
.extern __CSA_CPU4_END
.extern __CSA_CPU5_END
.extern __INTTAB_BASE
.extern __TRAPTAB_BASE
.extern __DATA_START
.extern __DATA_END
.extern __DATA_LOAD
.extern __BSS_START
.extern __BSS_END

/* C entry points */
.extern _startup_tc397xp
.extern cpu0_main
.extern cpu1_main
.extern cpu2_main
.extern cpu3_main
.extern cpu4_main
.extern cpu5_main

/* ==========================================================================
 * Reset Entry Point
 * ========================================================================== */

    .align 2    /* 4-byte alignment (2^2), NOT .align 8 which is 256-byte! */
_start:
_crt0_reset:
    /*
     * TriCore boots with:
     *   - Supervisor mode
     *   - Interrupts disabled
     *   - ENDINIT set (must unlock for most config)
     *
     * We need to:
     *   1. Determine which core we are
     *   2. Set up core-specific stack and CSA
     *   3. Initialize BSS and copy DATA (CPU0 only)
     *   4. Jump to C startup
     */

    /* Disable interrupts */
    disable

    /* Get core ID into D0 */
    mfcr    %d0, CSFR_CORE_ID
    and     %d0, %d0, 0x7           /* Mask to get core number */

    /* Branch to core-specific setup based on ID */
    jz      %d0, _setup_cpu0
    jeq     %d0, 1, _setup_cpu1
    jeq     %d0, 2, _setup_cpu2
    jeq     %d0, 3, _setup_cpu3
    jeq     %d0, 4, _setup_cpu4
    jeq     %d0, 5, _setup_cpu5

    /* Unknown core - halt */
    j       _halt

/* ==========================================================================
 * CPU0 Setup (Boot Core)
 * ========================================================================== */

_setup_cpu0:
    /* Load stack pointer for CPU0 */
    movh.a  %a10, hi:__STACK_CPU0
    lea     %a10, [%a10] lo:__STACK_CPU0

    /* Initialize CSA for CPU0 - use J not CALL (CSA not ready yet!) */
    movh.a  %a2, hi:__CSA_CPU0_START
    lea     %a2, [%a2] lo:__CSA_CPU0_START
    movh.a  %a3, hi:__CSA_CPU0_END
    lea     %a3, [%a3] lo:__CSA_CPU0_END
    movh.a  %a11, hi:_cpu0_csa_done
    lea     %a11, [%a11] lo:_cpu0_csa_done
    j       _init_csa_pool
_cpu0_csa_done:

    /* Set interrupt vector base */
    movh    %d0, hi:__INTTAB_BASE
    addi    %d0, %d0, lo:__INTTAB_BASE
    mtcr    CSFR_BIV, %d0
    isync

    /* Set trap vector base */
    movh    %d0, hi:__TRAPTAB_BASE
    addi    %d0, %d0, lo:__TRAPTAB_BASE
    mtcr    CSFR_BTV, %d0
    isync

    /* Set interrupt stack pointer (same as regular stack for now) */
    movh    %d0, hi:__STACK_CPU0
    addi    %d0, %d0, lo:__STACK_CPU0
    mtcr    CSFR_ISP, %d0
    isync

    /* Initialize PSW: Supervisor mode (IO=1 at bit 10), CDC=0, CDE=1 (bit 7) */
    /* PSW value = 0x00000480 = (1 << 10) | (1 << 7) */
    mov     %d0, 0x480
    mtcr    CSFR_PSW, %d0
    isync

    /* CPU0 initializes .data and .bss sections */

    /* Copy initialized data from flash to RAM */
    movh.a  %a4, hi:__DATA_START
    lea     %a4, [%a4] lo:__DATA_START      /* Destination */
    movh.a  %a5, hi:__DATA_END
    lea     %a5, [%a5] lo:__DATA_END        /* End */
    movh.a  %a6, hi:__DATA_LOAD
    lea     %a6, [%a6] lo:__DATA_LOAD       /* Source (in flash) */

_copy_data_loop:
    /* Compare addresses: if a4 >= a5, done */
    mov.d   %d0, %a4
    mov.d   %d1, %a5
    jge     %d0, %d1, _copy_data_done
    ld.w    %d0, [%a6+]4
    st.w    [%a4+]4, %d0
    j       _copy_data_loop

_copy_data_done:

    /* Clear .bss section */
    movh.a  %a4, hi:__BSS_START
    lea     %a4, [%a4] lo:__BSS_START
    movh.a  %a5, hi:__BSS_END
    lea     %a5, [%a5] lo:__BSS_END
    mov     %d0, 0

_clear_bss_loop:
    /* Compare addresses: if a4 >= a5, done */
    mov.d   %d2, %a4
    mov.d   %d3, %a5
    jge     %d2, %d3, _clear_bss_done
    st.w    [%a4+]4, %d0
    j       _clear_bss_loop

_clear_bss_done:

    /* Jump to C startup (does SCU/PLL init, then calls cpu0_main) */
    movh.a  %a4, hi:_startup_tc397xp
    lea     %a4, [%a4] lo:_startup_tc397xp
    mov     %d4, 0                          /* Core ID argument */
    calli   %a4

    /* Should not return */
    j       _halt

/* ==========================================================================
 * CPU1-5 Setup (Secondary Cores)
 * ========================================================================== */

_setup_cpu1:
    movh.a  %a10, hi:__STACK_CPU1
    lea     %a10, [%a10] lo:__STACK_CPU1
    movh.a  %a2, hi:__CSA_CPU1_START
    lea     %a2, [%a2] lo:__CSA_CPU1_START
    movh.a  %a3, hi:__CSA_CPU1_END
    lea     %a3, [%a3] lo:__CSA_CPU1_END
    movh.a  %a11, hi:_secondary_core_common
    lea     %a11, [%a11] lo:_secondary_core_common
    j       _init_csa_pool

_setup_cpu2:
    movh.a  %a10, hi:__STACK_CPU2
    lea     %a10, [%a10] lo:__STACK_CPU2
    movh.a  %a2, hi:__CSA_CPU2_START
    lea     %a2, [%a2] lo:__CSA_CPU2_START
    movh.a  %a3, hi:__CSA_CPU2_END
    lea     %a3, [%a3] lo:__CSA_CPU2_END
    movh.a  %a11, hi:_secondary_core_common
    lea     %a11, [%a11] lo:_secondary_core_common
    j       _init_csa_pool

_setup_cpu3:
    movh.a  %a10, hi:__STACK_CPU3
    lea     %a10, [%a10] lo:__STACK_CPU3
    movh.a  %a2, hi:__CSA_CPU3_START
    lea     %a2, [%a2] lo:__CSA_CPU3_START
    movh.a  %a3, hi:__CSA_CPU3_END
    lea     %a3, [%a3] lo:__CSA_CPU3_END
    movh.a  %a11, hi:_secondary_core_common
    lea     %a11, [%a11] lo:_secondary_core_common
    j       _init_csa_pool

_setup_cpu4:
    movh.a  %a10, hi:__STACK_CPU4
    lea     %a10, [%a10] lo:__STACK_CPU4
    movh.a  %a2, hi:__CSA_CPU4_START
    lea     %a2, [%a2] lo:__CSA_CPU4_START
    movh.a  %a3, hi:__CSA_CPU4_END
    lea     %a3, [%a3] lo:__CSA_CPU4_END
    movh.a  %a11, hi:_secondary_core_common
    lea     %a11, [%a11] lo:_secondary_core_common
    j       _init_csa_pool

_setup_cpu5:
    movh.a  %a10, hi:__STACK_CPU5
    lea     %a10, [%a10] lo:__STACK_CPU5
    movh.a  %a2, hi:__CSA_CPU5_START
    lea     %a2, [%a2] lo:__CSA_CPU5_START
    movh.a  %a3, hi:__CSA_CPU5_END
    lea     %a3, [%a3] lo:__CSA_CPU5_END
    movh.a  %a11, hi:_secondary_core_common
    lea     %a11, [%a11] lo:_secondary_core_common
    j       _init_csa_pool

_secondary_core_common:
    /* Set interrupt vector base (same as CPU0) */
    movh    %d0, hi:__INTTAB_BASE
    addi    %d0, %d0, lo:__INTTAB_BASE
    mtcr    CSFR_BIV, %d0
    isync

    /* Set trap vector base */
    movh    %d0, hi:__TRAPTAB_BASE
    addi    %d0, %d0, lo:__TRAPTAB_BASE
    mtcr    CSFR_BTV, %d0
    isync

    /* Initialize PSW: Supervisor mode (IO=1 at bit 10), CDE=1 (bit 7) */
    mov     %d0, 0x480
    mtcr    CSFR_PSW, %d0
    isync

    /* Get core ID and call C startup */
    mfcr    %d4, CSFR_CORE_ID
    and     %d4, %d4, 0x7

    movh.a  %a4, hi:_startup_tc397xp
    lea     %a4, [%a4] lo:_startup_tc397xp
    calli   %a4

    /* Should not return */
    j       _halt

/* ==========================================================================
 * CSA Pool Initialization
 *
 * Input:
 *   A2 = CSA pool start address
 *   A3 = CSA pool end address
 *
 * Builds a linked list of CSA entries and sets FCX/LCX.
 * ========================================================================== */

_init_csa_pool:
    /*
     * CSA entries are 64 bytes (16 words) each, aligned to 64 bytes.
     * Each entry's first word is the link to next entry.
     * Link format: [19:16]=segment, [15:0]=offset/64
     */

    /* Calculate number of entries: (end - start) / 64 */
    /* A4 = A3 - A2 (size in bytes) */
    mov.d   %d0, %a3
    mov.d   %d1, %a2
    sub     %d0, %d0, %d1               /* D0 = size */
    sha     %d1, %d0, -6                /* D1 = count = size >> 6 */

    /* Check for at least 2 entries */
    jlt     %d1, 2, _csa_init_fail

    /* Build linked list */
    mov.aa  %a4, %a2                    /* A4 = current entry */
    add     %d1, %d1, -1                /* Decrement count (loop count - 1) */

_csa_link_loop:
    jz      %d1, _csa_link_last

    /* Calculate next entry address */
    lea     %a5, [%a4]64                /* A5 = next entry (current + 64) */

    /* Calculate link word for next entry */
    /* Link format: [19:16]=segment (addr[31:28]), [15:0]=offset/64 (addr[21:6]) */
    mov.d   %d0, %a5                    /* D0 = address of next entry */

    /* Offset part: (addr >> 6) & 0xFFFF - the 16-bit word-aligned offset */
    /* Note: Must divide full address by 64 first, THEN mask to 16 bits! */
    sh      %d3, %d0, -6                /* D3 = addr >> 6 (26-bit value) */
    sh      %d3, %d3, 16                /* D3 = (addr >> 6) << 16 (move to upper) */
    sh      %d3, %d3, -16               /* D3 = ((addr >> 6) << 16) >> 16 = (addr >> 6) & 0xFFFF */

    /* Segment part: (addr >> 28) << 16 */
    sh      %d2, %d0, -28               /* D2 = segment number (0-15) */
    sh      %d2, %d2, 16                /* D2 = segment << 16 (in bits 19:16) */

    /* Combine: link = segment_part | offset_part */
    or      %d0, %d3, %d2               /* D0 = link word */

    /* Store link in first word of current entry */
    st.w    [%a4], %d0

    /* Clear rest of entry (words 1-15) */
    mov     %d2, 0
    st.w    [%a4]4, %d2
    st.w    [%a4]8, %d2
    st.w    [%a4]12, %d2
    st.w    [%a4]16, %d2
    st.w    [%a4]20, %d2
    st.w    [%a4]24, %d2
    st.w    [%a4]28, %d2
    st.w    [%a4]32, %d2
    st.w    [%a4]36, %d2
    st.w    [%a4]40, %d2
    st.w    [%a4]44, %d2
    st.w    [%a4]48, %d2
    st.w    [%a4]52, %d2
    st.w    [%a4]56, %d2
    st.w    [%a4]60, %d2

    /* Move to next entry */
    mov.aa  %a4, %a5
    add     %d1, %d1, -1
    j       _csa_link_loop

_csa_link_last:
    /* Last entry: link = 0 (end of list) */
    mov     %d0, 0
    st.w    [%a4], %d0

    /* Clear rest of last entry */
    mov     %d2, 0
    st.w    [%a4]4, %d2
    st.w    [%a4]8, %d2
    st.w    [%a4]12, %d2
    st.w    [%a4]16, %d2
    st.w    [%a4]20, %d2
    st.w    [%a4]24, %d2
    st.w    [%a4]28, %d2
    st.w    [%a4]32, %d2
    st.w    [%a4]36, %d2
    st.w    [%a4]40, %d2
    st.w    [%a4]44, %d2
    st.w    [%a4]48, %d2
    st.w    [%a4]52, %d2
    st.w    [%a4]56, %d2
    st.w    [%a4]60, %d2

    /* Set FCX to first entry */
    /* Link format: [19:16]=segment (addr[31:28]), [15:0]=offset/64 (addr[21:6]) */
    mov.d   %d0, %a2                    /* D0 = start address */

    /* Offset part: (addr >> 6) & 0xFFFF */
    sh      %d1, %d0, -6                /* D1 = addr >> 6 */
    sh      %d1, %d1, 16                /* D1 = (addr >> 6) << 16 */
    sh      %d1, %d1, -16               /* D1 = (addr >> 6) & 0xFFFF */

    /* Segment part: (addr >> 28) << 16 */
    sh      %d2, %d0, -28               /* D2 = segment number (0-15) */
    sh      %d2, %d2, 16                /* D2 = segment << 16 (in bits 19:16) */

    /* Combine: link = segment_part | offset_part */
    or      %d0, %d1, %d2               /* D0 = link word */

    mtcr    CSFR_FCX, %d0
    isync

    /* Set LCX to ~10 entries before end (low watermark) */
    /* Calculate: end - 10*64 = end - 640 */
    lea     %a6, [%a3]-640
    /* Check if underflow: compare a6 < a2 */
    mov.d   %d0, %a6
    mov.d   %d1, %a2
    jlt     %d0, %d1, _csa_lcx_start    /* If underflow, use start */
    j       _csa_lcx_set

_csa_lcx_start:
    mov.aa  %a6, %a2

_csa_lcx_set:
    mov.d   %d0, %a6                    /* D0 = LCX address */

    /* Offset part: (addr >> 6) & 0xFFFF */
    sh      %d1, %d0, -6                /* D1 = addr >> 6 */
    sh      %d1, %d1, 16                /* D1 = (addr >> 6) << 16 */
    sh      %d1, %d1, -16               /* D1 = (addr >> 6) & 0xFFFF */

    /* Segment part: (addr >> 28) << 16 */
    sh      %d2, %d0, -28               /* D2 = segment number */
    sh      %d2, %d2, 16                /* D2 = segment << 16 */

    /* Combine: link = segment_part | offset_part */
    or      %d0, %d1, %d2               /* D0 = link word */

    mtcr    CSFR_LCX, %d0
    isync

    ji      %a11        /* Return via A11 (before CSA ready, ret won't work) */

_csa_init_fail:
    /* CSA pool too small */
    j       _halt

/* ==========================================================================
 * Halt
 * ========================================================================== */

_halt:
    disable
    nop
    j       _halt

/* ==========================================================================
 * Trap Vector Table
 *
 * TriCore has 8 trap classes, each with a 32-byte entry.
 * ========================================================================== */

    .section .traptab, "ax", @progbits
    .align 8
    .global __TRAPTAB_BASE

__TRAPTAB_BASE:

/* Class 0: MMU (not used on TC397) */
_trap_mmu:
    svlcx
    movh.a  %a14, hi:_trap_handler
    lea     %a14, [%a14] lo:_trap_handler
    mov     %d4, 0
    ji      %a14

    .align 5

/* Class 1: Internal Protection */
_trap_protection:
    svlcx
    movh.a  %a14, hi:_trap_handler
    lea     %a14, [%a14] lo:_trap_handler
    mov     %d4, 1
    ji      %a14

    .align 5

/* Class 2: Instruction Errors */
_trap_instruction:
    svlcx
    movh.a  %a14, hi:_trap_handler
    lea     %a14, [%a14] lo:_trap_handler
    mov     %d4, 2
    ji      %a14

    .align 5

/* Class 3: Context Management */
_trap_context:
    svlcx
    movh.a  %a14, hi:_trap_handler
    lea     %a14, [%a14] lo:_trap_handler
    mov     %d4, 3
    ji      %a14

    .align 5

/* Class 4: System Bus and Peripheral Errors */
_trap_bus:
    svlcx
    movh.a  %a14, hi:_trap_handler
    lea     %a14, [%a14] lo:_trap_handler
    mov     %d4, 4
    ji      %a14

    .align 5

/* Class 5: Assertion Traps */
_trap_assertion:
    svlcx
    movh.a  %a14, hi:_trap_handler
    lea     %a14, [%a14] lo:_trap_handler
    mov     %d4, 5
    ji      %a14

    .align 5

/* Class 6: System Call (syscall instruction) */
_trap_syscall:
    svlcx
    movh.a  %a14, hi:_trap_handler
    lea     %a14, [%a14] lo:_trap_handler
    mov     %d4, 6
    ji      %a14

    .align 5

/* Class 7: NMI (Non-Maskable Interrupt) */
_trap_nmi:
    svlcx
    movh.a  %a14, hi:_trap_handler
    lea     %a14, [%a14] lo:_trap_handler
    mov     %d4, 7
    ji      %a14

/* ==========================================================================
 * Interrupt Vector Table
 *
 * TriCore TC3xx has up to 255 interrupt priorities.
 * Each vector entry is 32 bytes.
 * The table must be 8KB aligned.
 * ========================================================================== */

    .section .inttab, "ax", @progbits
    .align 13           /* 8KB alignment */
    .global __INTTAB_BASE

__INTTAB_BASE:

/* Priority 0 is reserved (no interrupt) */
    .align 5
_int_prio_0:
    rfe

/* Generate entries for priorities 1-255 */
/* Each entry: save context, call common handler with priority in D4 */

    .irp prio, 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31
    .align 5
_int_prio_\prio:
    bisr    \prio
    movh.a  %a14, hi:_irq_common_entry
    lea     %a14, [%a14] lo:_irq_common_entry
    mov     %d4, \prio
    ji      %a14
    .endr

    /* Continue for higher priorities (32-255) */
    .irp prio, 32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63
    .align 5
_int_prio_\prio:
    bisr    \prio
    movh.a  %a14, hi:_irq_common_entry
    lea     %a14, [%a14] lo:_irq_common_entry
    mov     %d4, \prio
    ji      %a14
    .endr

    /* Priorities 64-127 */
    .irp prio, 64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95
    .align 5
_int_prio_\prio:
    bisr    \prio
    movh.a  %a14, hi:_irq_common_entry
    lea     %a14, [%a14] lo:_irq_common_entry
    mov     %d4, \prio
    ji      %a14
    .endr

    .irp prio, 96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127
    .align 5
_int_prio_\prio:
    bisr    \prio
    movh.a  %a14, hi:_irq_common_entry
    lea     %a14, [%a14] lo:_irq_common_entry
    mov     %d4, \prio
    ji      %a14
    .endr

    /* Fill remaining priorities with simple handlers (128-255) */
    .irp prio, 128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159
    .align 5
_int_prio_\prio:
    bisr    \prio
    movh.a  %a14, hi:_irq_common_entry
    lea     %a14, [%a14] lo:_irq_common_entry
    mov     %d4, \prio
    ji      %a14
    .endr

    .irp prio, 160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191
    .align 5
_int_prio_\prio:
    bisr    \prio
    movh.a  %a14, hi:_irq_common_entry
    lea     %a14, [%a14] lo:_irq_common_entry
    mov     %d4, \prio
    ji      %a14
    .endr

    .irp prio, 192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223
    .align 5
_int_prio_\prio:
    bisr    \prio
    movh.a  %a14, hi:_irq_common_entry
    lea     %a14, [%a14] lo:_irq_common_entry
    mov     %d4, \prio
    ji      %a14
    .endr

    .irp prio, 224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255
    .align 5
_int_prio_\prio:
    bisr    \prio
    movh.a  %a14, hi:_irq_common_entry
    lea     %a14, [%a14] lo:_irq_common_entry
    mov     %d4, \prio
    ji      %a14
    .endr

/* ==========================================================================
 * Common Interrupt Entry
 *
 * Called from vector table with priority in D4.
 * Calls C handler, then returns from interrupt.
 * ========================================================================== */

    .section .text, "ax", @progbits

    .extern irq_common_handler
    .extern trap_handler

_irq_common_entry:
    /* D4 contains priority number */
    /* Call C handler: irq_common_handler(priority) */
    movh.a  %a14, hi:irq_common_handler
    lea     %a14, [%a14] lo:irq_common_handler
    calli   %a14

    /* Return from interrupt */
    rslcx               /* Restore lower context */
    rfe                 /* Return from exception */

/* Trap handler wrapper */
_trap_handler:
    /* D4 contains trap class */
    /* Call C handler: trap_handler(class) */
    movh.a  %a14, hi:trap_handler
    lea     %a14, [%a14] lo:trap_handler
    calli   %a14

    /* Return from trap (if handler returns) */
    rslcx
    rfe

/* ==========================================================================
 * Context Switch Helper (called from C)
 *
 * void _context_switch_asm(uint32_t *old_pcxi, uint32_t new_pcxi);
 *   A4 = pointer to save old PCXI
 *   D4 = new PCXI to load
 * ========================================================================== */

    .global _context_switch_asm
    .type _context_switch_asm, @function

_context_switch_asm:
    /* Save lower context of current task */
    svlcx

    /* Store current PCXI to old task */
    mfcr    %d0, CSFR_PCXI
    st.w    [%a4], %d0

    /* Load new task's PCXI */
    mtcr    CSFR_PCXI, %d4
    isync

    /* Restore lower context of new task */
    rslcx

    /* Return to new task */
    ret

/* ==========================================================================
 * First Task Start Helper
 *
 * void _start_first_task(uint32_t pcxi);
 *   D4 = PCXI of task to start
 *
 * Used to start the first task - no context to save.
 * ========================================================================== */

    .global _start_first_task
    .type _start_first_task, @function

_start_first_task:
    /* Load task's PCXI */
    mtcr    CSFR_PCXI, %d4
    isync

    /* Restore context and return to task */
    rslcx
    rfe

    /* Should never reach here */
    j       _halt

/* ==========================================================================
 * End of startup code
 * ========================================================================== */

    .end
