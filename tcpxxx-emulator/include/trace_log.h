/**
 * @file trace_log.h
 * @brief TC397XP Execution Trace Logging Interface
 *
 * Provides instruction-level execution tracing:
 * - Circular trace buffer with configurable size
 * - Per-instruction logging with PC, opcode, registers
 * - Filter by address range, opcode type
 * - Export to file (text, binary, VCD)
 * - Real-time streaming to callback
 */

#ifndef TRACE_LOG_H
#define TRACE_LOG_H

#include <stdint.h>
#include <stdbool.h>
#include <stdio.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Forward declarations */
struct cpu_state;
struct decoded_insn;

/* ==========================================================================
 * Trace Entry Structure
 * ========================================================================== */

/**
 * @brief Single trace entry
 */
typedef struct {
    uint64_t    timestamp;      /* Cycle count when executed */
    uint32_t    pc;             /* Program counter */
    uint32_t    insn_word;      /* Raw instruction word */
    uint16_t    insn_size;      /* Instruction size (2 or 4 bytes) */
    uint8_t     core_id;        /* Core that executed this */
    uint8_t     flags;          /* Trace flags (see below) */

    /* Register snapshot (optional, if flags & TRACE_FLAG_REGS) */
    uint32_t    d15;            /* D15 - often used for returns */
    uint32_t    a10;            /* A10 - stack pointer */
    uint32_t    psw;            /* PSW - status */

    /* Memory access (if flags & TRACE_FLAG_MEM) */
    uint32_t    mem_addr;       /* Memory address accessed */
    uint32_t    mem_data;       /* Data read/written */

} trace_entry_t;

/* Trace flags */
#define TRACE_FLAG_BRANCH       (1 << 0)    /* Instruction was a branch */
#define TRACE_FLAG_TAKEN        (1 << 1)    /* Branch was taken */
#define TRACE_FLAG_CALL         (1 << 2)    /* Call instruction */
#define TRACE_FLAG_RET          (1 << 3)    /* Return instruction */
#define TRACE_FLAG_TRAP         (1 << 4)    /* Trap occurred */
#define TRACE_FLAG_IRQ          (1 << 5)    /* Interrupt occurred */
#define TRACE_FLAG_MEM          (1 << 6)    /* Memory access recorded */
#define TRACE_FLAG_REGS         (1 << 7)    /* Register snapshot included */

/* ==========================================================================
 * Trace Filter Configuration
 * ========================================================================== */

/**
 * @brief Trace filter settings
 */
typedef struct {
    /* Address range filter */
    bool        filter_addr;    /* Enable address filtering */
    uint32_t    addr_start;     /* Start address (inclusive) */
    uint32_t    addr_end;       /* End address (exclusive) */

    /* Opcode filter */
    bool        filter_opcode;  /* Enable opcode filtering */
    uint8_t     opcode_match;   /* Opcode to match */
    uint8_t     opcode_mask;    /* Mask for matching */

    /* Event filters */
    bool        trace_branches; /* Trace branch instructions */
    bool        trace_calls;    /* Trace call/return */
    bool        trace_mem;      /* Trace memory accesses */
    bool        trace_traps;    /* Trace traps/interrupts */

    /* Sampling */
    uint32_t    sample_rate;    /* Log every N instructions (0 = all) */

} trace_filter_t;

/* ==========================================================================
 * Trace Log Structure
 * ========================================================================== */

/**
 * @brief Trace log instance
 */
typedef struct trace_log {
    /* Circular buffer */
    trace_entry_t  *buffer;
    size_t          capacity;   /* Max entries */
    size_t          head;       /* Next write position */
    size_t          count;      /* Current entry count */
    bool            wrapped;    /* Buffer has wrapped */

    /* State */
    bool            enabled;
    bool            paused;
    uint64_t        total_logged;   /* Total entries ever logged */
    uint64_t        total_filtered; /* Entries filtered out */

    /* Filter */
    trace_filter_t  filter;

    /* Register snapshot control */
    bool            capture_regs;
    uint32_t        reg_interval;   /* Capture every N instructions */

    /* Streaming callback */
    void          (*on_entry)(struct trace_log *log, const trace_entry_t *entry, void *ctx);
    void           *callback_ctx;

    /* Statistics */
    uint64_t        branch_count;
    uint64_t        call_count;
    uint64_t        trap_count;
    uint64_t        irq_count;

} trace_log_t;

/* ==========================================================================
 * Lifecycle
 * ========================================================================== */

/**
 * @brief Create trace log with specified buffer size
 * @param capacity Number of entries in circular buffer
 * @return Trace log, or NULL on error
 */
trace_log_t* trace_create(size_t capacity);

/**
 * @brief Destroy trace log
 * @param log Trace log to destroy
 */
void trace_destroy(trace_log_t *log);

/**
 * @brief Reset trace log (clear buffer, reset stats)
 * @param log Trace log
 */
void trace_reset(trace_log_t *log);

/* ==========================================================================
 * Enable/Disable
 * ========================================================================== */

/**
 * @brief Enable tracing
 * @param log Trace log
 */
void trace_enable(trace_log_t *log);

/**
 * @brief Disable tracing
 * @param log Trace log
 */
void trace_disable(trace_log_t *log);

/**
 * @brief Pause tracing (keeps state but stops logging)
 * @param log Trace log
 */
void trace_pause(trace_log_t *log);

/**
 * @brief Resume tracing
 * @param log Trace log
 */
void trace_resume(trace_log_t *log);

/**
 * @brief Check if tracing is active
 * @param log Trace log
 * @return true if enabled and not paused
 */
bool trace_is_active(trace_log_t *log);

/* ==========================================================================
 * Logging Functions
 * ========================================================================== */

/**
 * @brief Log an instruction execution
 * @param log Trace log
 * @param cpu CPU state after execution
 * @param insn Decoded instruction
 *
 * This is the main logging function called from the execution loop.
 */
void trace_log_insn(trace_log_t *log, const struct cpu_state *cpu,
                    const struct decoded_insn *insn);

/**
 * @brief Log a branch event
 * @param log Trace log
 * @param pc Branch instruction PC
 * @param target Branch target address
 * @param taken Whether branch was taken
 */
void trace_log_branch(trace_log_t *log, uint32_t pc, uint32_t target, bool taken);

/**
 * @brief Log a memory access
 * @param log Trace log
 * @param pc Instruction PC
 * @param addr Memory address
 * @param data Data read/written
 * @param is_write true if write, false if read
 */
void trace_log_mem(trace_log_t *log, uint32_t pc, uint32_t addr,
                   uint32_t data, bool is_write);

/**
 * @brief Log a trap event
 * @param log Trace log
 * @param pc PC where trap occurred
 * @param trap_class Trap class
 * @param trap_id Trap ID within class
 */
void trace_log_trap(trace_log_t *log, uint32_t pc, uint8_t trap_class, uint8_t trap_id);

/**
 * @brief Log an interrupt event
 * @param log Trace log
 * @param pc PC when interrupt taken
 * @param vector Interrupt vector
 * @param priority Interrupt priority (SRPN)
 */
void trace_log_irq(trace_log_t *log, uint32_t pc, uint32_t vector, uint8_t priority);

/* ==========================================================================
 * Filter Configuration
 * ========================================================================== */

/**
 * @brief Set address range filter
 * @param log Trace log
 * @param start Start address (inclusive)
 * @param end End address (exclusive), 0 to disable
 */
void trace_set_addr_filter(trace_log_t *log, uint32_t start, uint32_t end);

/**
 * @brief Set opcode filter
 * @param log Trace log
 * @param opcode Opcode to match
 * @param mask Mask for matching (0 to disable)
 */
void trace_set_opcode_filter(trace_log_t *log, uint8_t opcode, uint8_t mask);

/**
 * @brief Set event filters
 * @param log Trace log
 * @param branches Trace branches
 * @param calls Trace calls/returns
 * @param mem Trace memory accesses
 * @param traps Trace traps/interrupts
 */
void trace_set_event_filter(trace_log_t *log, bool branches, bool calls,
                            bool mem, bool traps);

/**
 * @brief Set sampling rate
 * @param log Trace log
 * @param rate Log every N instructions (0 = all)
 */
void trace_set_sample_rate(trace_log_t *log, uint32_t rate);

/**
 * @brief Configure register snapshots
 * @param log Trace log
 * @param enable Enable register capture
 * @param interval Capture every N instructions (0 = all when enabled)
 */
void trace_set_reg_capture(trace_log_t *log, bool enable, uint32_t interval);

/* ==========================================================================
 * Buffer Access
 * ========================================================================== */

/**
 * @brief Get number of entries in buffer
 * @param log Trace log
 * @return Number of valid entries
 */
size_t trace_get_count(trace_log_t *log);

/**
 * @brief Get entry by index (0 = oldest)
 * @param log Trace log
 * @param index Entry index
 * @return Pointer to entry, or NULL if invalid index
 */
const trace_entry_t* trace_get_entry(trace_log_t *log, size_t index);

/**
 * @brief Get most recent entry
 * @param log Trace log
 * @return Pointer to most recent entry, or NULL if empty
 */
const trace_entry_t* trace_get_latest(trace_log_t *log);

/**
 * @brief Search buffer for PC
 * @param log Trace log
 * @param pc PC to search for
 * @param start_index Index to start search from
 * @return Index of matching entry, or -1 if not found
 */
int trace_find_pc(trace_log_t *log, uint32_t pc, size_t start_index);

/* ==========================================================================
 * Export Functions
 * ========================================================================== */

/**
 * @brief Export format
 */
typedef enum {
    TRACE_FMT_TEXT,     /* Human-readable text */
    TRACE_FMT_CSV,      /* CSV format */
    TRACE_FMT_BINARY,   /* Binary format */
    TRACE_FMT_VCD,      /* Value Change Dump (for waveform viewers) */
} trace_format_t;

/**
 * @brief Export trace buffer to file
 * @param log Trace log
 * @param filename Output filename
 * @param format Export format
 * @return 0 on success, -1 on error
 */
int trace_export(trace_log_t *log, const char *filename, trace_format_t format);

/**
 * @brief Dump trace buffer to FILE stream
 * @param log Trace log
 * @param out Output stream
 * @param max_entries Maximum entries to dump (0 = all)
 */
void trace_dump(trace_log_t *log, FILE *out, size_t max_entries);

/**
 * @brief Dump last N entries
 * @param log Trace log
 * @param out Output stream
 * @param count Number of recent entries to dump
 */
void trace_dump_recent(trace_log_t *log, FILE *out, size_t count);

/* ==========================================================================
 * Streaming Callback
 * ========================================================================== */

/**
 * @brief Set streaming callback
 * @param log Trace log
 * @param callback Function to call for each entry
 * @param ctx User context for callback
 *
 * The callback is invoked immediately when an entry is logged,
 * before it's added to the buffer. Useful for real-time monitoring.
 */
void trace_set_callback(trace_log_t *log,
    void (*callback)(trace_log_t *log, const trace_entry_t *entry, void *ctx),
    void *ctx);

/* ==========================================================================
 * Statistics
 * ========================================================================== */

/**
 * @brief Print trace statistics
 * @param log Trace log
 */
void trace_print_stats(trace_log_t *log);

/**
 * @brief Get trace statistics
 * @param log Trace log
 * @param total_logged Output: total entries ever logged
 * @param total_filtered Output: entries filtered out
 * @param branches Output: branch count
 * @param calls Output: call/return count
 */
void trace_get_stats(trace_log_t *log, uint64_t *total_logged,
                     uint64_t *total_filtered, uint64_t *branches,
                     uint64_t *calls);

#ifdef __cplusplus
}
#endif

#endif /* TRACE_LOG_H */
