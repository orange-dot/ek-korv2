/**
 * @file emu_config.h
 * @brief TC397XP Emulator Configuration
 *
 * Runtime and compile-time configuration options.
 */

#ifndef EMU_CONFIG_H
#define EMU_CONFIG_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Compile-time Configuration
 * ========================================================================== */

/**
 * @defgroup EMU_COMPILE_CONFIG Compile-time configuration
 * @{
 */

/** Enable execution tracing (high overhead) */
#ifndef EMU_ENABLE_TRACE
#define EMU_ENABLE_TRACE            0
#endif

/** Enable cycle-accurate timing annotations */
#ifndef EMU_ENABLE_TIMING
#define EMU_ENABLE_TIMING           1
#endif

/** Enable GDB server support */
#ifndef EMU_ENABLE_GDB
#define EMU_ENABLE_GDB              1
#endif

/** Enable multi-core support */
#ifndef EMU_ENABLE_MULTICORE
#define EMU_ENABLE_MULTICORE        1
#endif

/** Number of cores to emulate (1-6) */
#ifndef EMU_NUM_CORES
#define EMU_NUM_CORES               6
#endif

/** Default clock frequency in Hz */
#ifndef EMU_DEFAULT_FREQ_HZ
#define EMU_DEFAULT_FREQ_HZ         300000000   /* 300 MHz */
#endif

/** @} */

/* ==========================================================================
 * Default Memory Timing (@ 300 MHz)
 * ========================================================================== */

/**
 * @defgroup EMU_MEM_TIMING Default memory timing
 * @{
 */

/** Program flash wait states */
#define EMU_DEFAULT_PFLASH_WS       5

/** Data flash read cycles */
#define EMU_DEFAULT_DFLASH_CYCLES   10

/** DSPR access cycles (zero wait state) */
#define EMU_DEFAULT_DSPR_CYCLES     0

/** PSPR access cycles (zero wait state) */
#define EMU_DEFAULT_PSPR_CYCLES     0

/** LMU access cycles */
#define EMU_DEFAULT_LMU_CYCLES      1

/** EMEM access cycles */
#define EMU_DEFAULT_EMEM_CYCLES     2

/** Peripheral (SFR) access cycles */
#define EMU_DEFAULT_PERIPH_CYCLES   2

/** @} */

/* ==========================================================================
 * Execution Configuration
 * ========================================================================== */

/**
 * @defgroup EMU_EXEC_CONFIG Execution configuration
 * @{
 */

/** Instructions per sync barrier (multi-core) */
#define EMU_SYNC_INTERVAL           1000

/** GDB server default port */
#define EMU_GDB_DEFAULT_PORT        3333

/** Maximum breakpoints */
#define EMU_MAX_BREAKPOINTS         32

/** Trace buffer size (instructions) */
#define EMU_TRACE_BUFFER_SIZE       65536

/** @} */

/* ==========================================================================
 * Runtime Configuration Structure
 * ========================================================================== */

/**
 * @brief Emulator runtime configuration
 */
typedef struct {
    /* Core settings */
    uint32_t num_cores;             /**< Number of cores to emulate (1-6) */
    uint32_t clock_freq_hz;         /**< Clock frequency in Hz */

    /* Memory timing */
    uint8_t pflash_wait_states;     /**< Program flash wait states */
    uint8_t dflash_cycles;          /**< Data flash read cycles */
    uint8_t dspr_cycles;            /**< DSPR access cycles */
    uint8_t lmu_cycles;             /**< LMU access cycles */
    uint8_t peripheral_cycles;      /**< Peripheral access cycles */

    /* Features */
    bool enable_timing;             /**< Enable timing annotations */
    bool enable_trace;              /**< Enable execution trace */
    bool enable_gdb;                /**< Enable GDB server */
    uint16_t gdb_port;              /**< GDB server port */

    /* Files */
    const char *elf_path;           /**< Path to ELF file to load */
    const char *timing_csv;         /**< Path to timing CSV file */

} emu_config_t;

/**
 * @brief Get default configuration
 * @return Default configuration structure
 */
static inline emu_config_t emu_config_default(void) {
    emu_config_t cfg = {
        .num_cores = EMU_NUM_CORES,
        .clock_freq_hz = EMU_DEFAULT_FREQ_HZ,

        .pflash_wait_states = EMU_DEFAULT_PFLASH_WS,
        .dflash_cycles = EMU_DEFAULT_DFLASH_CYCLES,
        .dspr_cycles = EMU_DEFAULT_DSPR_CYCLES,
        .lmu_cycles = EMU_DEFAULT_LMU_CYCLES,
        .peripheral_cycles = EMU_DEFAULT_PERIPH_CYCLES,

        .enable_timing = true,
        .enable_trace = false,
        .enable_gdb = true,
        .gdb_port = EMU_GDB_DEFAULT_PORT,

        .elf_path = NULL,
        .timing_csv = NULL,
    };
    return cfg;
}

#ifdef __cplusplus
}
#endif

#endif /* EMU_CONFIG_H */
