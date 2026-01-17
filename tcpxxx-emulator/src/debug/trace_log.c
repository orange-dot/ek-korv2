/**
 * @file trace_log.c
 * @brief TC397XP Execution Trace Logging Implementation
 *
 * Circular buffer trace logging with filtering and export.
 */

#include "trace_log.h"
#include "emu_types.h"
#include "tricore_decode.h"
#include <stdlib.h>
#include <string.h>
#include <time.h>

/* ==========================================================================
 * Internal Helpers
 * ========================================================================== */

/**
 * @brief Check if entry passes address filter
 */
static bool passes_addr_filter(trace_log_t *log, uint32_t pc)
{
    if (!log->filter.filter_addr) return true;
    return (pc >= log->filter.addr_start && pc < log->filter.addr_end);
}

/**
 * @brief Check if entry passes opcode filter
 */
static bool passes_opcode_filter(trace_log_t *log, uint8_t opcode)
{
    if (!log->filter.filter_opcode) return true;
    return ((opcode & log->filter.opcode_mask) == log->filter.opcode_match);
}

/**
 * @brief Check if entry passes sampling filter
 */
static bool passes_sampling(trace_log_t *log)
{
    if (log->filter.sample_rate == 0) return true;
    return (log->total_logged % log->filter.sample_rate) == 0;
}

/**
 * @brief Add entry to circular buffer
 */
static trace_entry_t* buffer_add(trace_log_t *log)
{
    trace_entry_t *entry = &log->buffer[log->head];

    log->head = (log->head + 1) % log->capacity;
    if (log->count < log->capacity) {
        log->count++;
    } else {
        log->wrapped = true;
    }

    return entry;
}

/**
 * @brief Get buffer index for logical index
 */
static size_t get_buffer_index(trace_log_t *log, size_t index)
{
    if (log->wrapped) {
        /* Buffer has wrapped - oldest entry is at head */
        return (log->head + index) % log->capacity;
    } else {
        /* Buffer hasn't wrapped - entries start at 0 */
        return index;
    }
}

/* ==========================================================================
 * Lifecycle
 * ========================================================================== */

trace_log_t* trace_create(size_t capacity)
{
    if (capacity == 0) {
        capacity = 10000;  /* Default: 10K entries */
    }

    trace_log_t *log = calloc(1, sizeof(trace_log_t));
    if (!log) return NULL;

    log->buffer = calloc(capacity, sizeof(trace_entry_t));
    if (!log->buffer) {
        free(log);
        return NULL;
    }

    log->capacity = capacity;
    log->head = 0;
    log->count = 0;
    log->wrapped = false;
    log->enabled = false;
    log->paused = false;

    /* Default filter: trace everything */
    log->filter.trace_branches = true;
    log->filter.trace_calls = true;
    log->filter.trace_mem = false;      /* Memory tracing off by default */
    log->filter.trace_traps = true;

    log->capture_regs = false;
    log->reg_interval = 100;  /* Capture regs every 100 instructions */

    return log;
}

void trace_destroy(trace_log_t *log)
{
    if (log) {
        free(log->buffer);
        free(log);
    }
}

void trace_reset(trace_log_t *log)
{
    if (!log) return;

    log->head = 0;
    log->count = 0;
    log->wrapped = false;
    log->total_logged = 0;
    log->total_filtered = 0;
    log->branch_count = 0;
    log->call_count = 0;
    log->trap_count = 0;
    log->irq_count = 0;

    memset(log->buffer, 0, log->capacity * sizeof(trace_entry_t));
}

/* ==========================================================================
 * Enable/Disable
 * ========================================================================== */

void trace_enable(trace_log_t *log)
{
    if (log) {
        log->enabled = true;
        log->paused = false;
    }
}

void trace_disable(trace_log_t *log)
{
    if (log) {
        log->enabled = false;
    }
}

void trace_pause(trace_log_t *log)
{
    if (log) {
        log->paused = true;
    }
}

void trace_resume(trace_log_t *log)
{
    if (log) {
        log->paused = false;
    }
}

bool trace_is_active(trace_log_t *log)
{
    return log && log->enabled && !log->paused;
}

/* ==========================================================================
 * Logging Functions
 * ========================================================================== */

void trace_log_insn(trace_log_t *log, const struct cpu_state *cpu,
                    const struct decoded_insn *insn)
{
    if (!log || !log->enabled || log->paused) return;
    if (!cpu || !insn) return;

    const cpu_state_t *c = (const cpu_state_t *)cpu;
    const decoded_insn_t *d = (const decoded_insn_t *)insn;

    /* Apply filters */
    if (!passes_addr_filter(log, d->pc)) {
        log->total_filtered++;
        return;
    }

    if (!passes_opcode_filter(log, d->opcode1)) {
        log->total_filtered++;
        return;
    }

    if (!passes_sampling(log)) {
        log->total_filtered++;
        return;
    }

    /* Create entry */
    trace_entry_t *entry = buffer_add(log);

    entry->timestamp = c->cycle_count;
    entry->pc = d->pc;
    entry->insn_word = d->raw;  /* Use raw instruction word directly */
    entry->insn_size = d->size;
    entry->core_id = (uint8_t)c->core_id;
    entry->flags = 0;

    /* Detect instruction type */
    if (d->format == FMT_SB || d->format == FMT_SBC || d->format == FMT_SBR ||
        d->format == FMT_B || d->format == FMT_BRC || d->format == FMT_BRR) {
        entry->flags |= TRACE_FLAG_BRANCH;
        log->branch_count++;
    }

    /* Detect call/return based on opcode */
    if (d->opcode1 == 0x6D || d->opcode1 == 0xED) {  /* CALL, CALLI */
        entry->flags |= TRACE_FLAG_CALL;
        log->call_count++;
    }
    if (d->opcode1 == 0x00 && d->size == 2) {  /* RET */
        entry->flags |= TRACE_FLAG_RET;
    }

    /* Capture registers if enabled */
    if (log->capture_regs &&
        (log->reg_interval == 0 || (log->total_logged % log->reg_interval) == 0)) {
        entry->flags |= TRACE_FLAG_REGS;
        entry->d15 = c->d[15];
        entry->a10 = c->a[10];
        entry->psw = c->psw;
    }

    log->total_logged++;

    /* Invoke callback if set */
    if (log->on_entry) {
        log->on_entry(log, entry, log->callback_ctx);
    }
}

void trace_log_branch(trace_log_t *log, uint32_t pc, uint32_t target, bool taken)
{
    if (!log || !log->enabled || log->paused) return;
    if (!log->filter.trace_branches) return;

    trace_entry_t *entry = buffer_add(log);

    entry->timestamp = 0;  /* Will be set by caller if needed */
    entry->pc = pc;
    entry->insn_word = target;  /* Store target in insn_word */
    entry->insn_size = 0;       /* Special marker for branch event */
    entry->core_id = 0;
    entry->flags = TRACE_FLAG_BRANCH;
    if (taken) {
        entry->flags |= TRACE_FLAG_TAKEN;
    }

    log->branch_count++;
    log->total_logged++;

    if (log->on_entry) {
        log->on_entry(log, entry, log->callback_ctx);
    }
}

void trace_log_mem(trace_log_t *log, uint32_t pc, uint32_t addr,
                   uint32_t data, bool is_write)
{
    if (!log || !log->enabled || log->paused) return;
    if (!log->filter.trace_mem) return;

    trace_entry_t *entry = buffer_add(log);

    entry->timestamp = 0;
    entry->pc = pc;
    entry->insn_word = 0;
    entry->insn_size = 0;
    entry->core_id = 0;
    entry->flags = TRACE_FLAG_MEM;
    entry->mem_addr = addr;
    entry->mem_data = data;

    log->total_logged++;

    if (log->on_entry) {
        log->on_entry(log, entry, log->callback_ctx);
    }
}

void trace_log_trap(trace_log_t *log, uint32_t pc, uint8_t trap_class, uint8_t trap_id)
{
    if (!log || !log->enabled || log->paused) return;
    if (!log->filter.trace_traps) return;

    trace_entry_t *entry = buffer_add(log);

    entry->timestamp = 0;
    entry->pc = pc;
    entry->insn_word = ((uint32_t)trap_class << 8) | trap_id;
    entry->insn_size = 0;
    entry->core_id = 0;
    entry->flags = TRACE_FLAG_TRAP;

    log->trap_count++;
    log->total_logged++;

    if (log->on_entry) {
        log->on_entry(log, entry, log->callback_ctx);
    }
}

void trace_log_irq(trace_log_t *log, uint32_t pc, uint32_t vector, uint8_t priority)
{
    if (!log || !log->enabled || log->paused) return;
    if (!log->filter.trace_traps) return;

    trace_entry_t *entry = buffer_add(log);

    entry->timestamp = 0;
    entry->pc = pc;
    entry->insn_word = vector;
    entry->insn_size = priority;  /* Store priority in size field */
    entry->core_id = 0;
    entry->flags = TRACE_FLAG_IRQ;

    log->irq_count++;
    log->total_logged++;

    if (log->on_entry) {
        log->on_entry(log, entry, log->callback_ctx);
    }
}

/* ==========================================================================
 * Filter Configuration
 * ========================================================================== */

void trace_set_addr_filter(trace_log_t *log, uint32_t start, uint32_t end)
{
    if (!log) return;

    if (end == 0) {
        log->filter.filter_addr = false;
    } else {
        log->filter.filter_addr = true;
        log->filter.addr_start = start;
        log->filter.addr_end = end;
    }
}

void trace_set_opcode_filter(trace_log_t *log, uint8_t opcode, uint8_t mask)
{
    if (!log) return;

    if (mask == 0) {
        log->filter.filter_opcode = false;
    } else {
        log->filter.filter_opcode = true;
        log->filter.opcode_match = opcode;
        log->filter.opcode_mask = mask;
    }
}

void trace_set_event_filter(trace_log_t *log, bool branches, bool calls,
                            bool mem, bool traps)
{
    if (!log) return;

    log->filter.trace_branches = branches;
    log->filter.trace_calls = calls;
    log->filter.trace_mem = mem;
    log->filter.trace_traps = traps;
}

void trace_set_sample_rate(trace_log_t *log, uint32_t rate)
{
    if (!log) return;
    log->filter.sample_rate = rate;
}

void trace_set_reg_capture(trace_log_t *log, bool enable, uint32_t interval)
{
    if (!log) return;
    log->capture_regs = enable;
    log->reg_interval = interval;
}

/* ==========================================================================
 * Buffer Access
 * ========================================================================== */

size_t trace_get_count(trace_log_t *log)
{
    if (!log) return 0;
    return log->count;
}

const trace_entry_t* trace_get_entry(trace_log_t *log, size_t index)
{
    if (!log || index >= log->count) return NULL;

    size_t buf_idx = get_buffer_index(log, index);
    return &log->buffer[buf_idx];
}

const trace_entry_t* trace_get_latest(trace_log_t *log)
{
    if (!log || log->count == 0) return NULL;

    size_t latest_idx = (log->head == 0) ? log->capacity - 1 : log->head - 1;
    return &log->buffer[latest_idx];
}

int trace_find_pc(trace_log_t *log, uint32_t pc, size_t start_index)
{
    if (!log) return -1;

    for (size_t i = start_index; i < log->count; i++) {
        const trace_entry_t *entry = trace_get_entry(log, i);
        if (entry && entry->pc == pc) {
            return (int)i;
        }
    }
    return -1;
}

/* ==========================================================================
 * Export Functions
 * ========================================================================== */

int trace_export(trace_log_t *log, const char *filename, trace_format_t format)
{
    if (!log || !filename) return -1;

    FILE *f = fopen(filename, "w");
    if (!f) return -1;

    switch (format) {
    case TRACE_FMT_TEXT:
        trace_dump(log, f, 0);
        break;

    case TRACE_FMT_CSV:
        fprintf(f, "timestamp,pc,insn_word,size,core,flags\n");
        for (size_t i = 0; i < log->count; i++) {
            const trace_entry_t *e = trace_get_entry(log, i);
            if (e) {
                fprintf(f, "%llu,0x%08X,0x%08X,%u,%u,0x%02X\n",
                        (unsigned long long)e->timestamp,
                        e->pc, e->insn_word, e->insn_size,
                        e->core_id, e->flags);
            }
        }
        break;

    case TRACE_FMT_BINARY:
        /* Write header */
        fprintf(f, "TRACE001");
        fwrite(&log->count, sizeof(log->count), 1, f);
        /* Write entries */
        for (size_t i = 0; i < log->count; i++) {
            const trace_entry_t *e = trace_get_entry(log, i);
            if (e) {
                fwrite(e, sizeof(trace_entry_t), 1, f);
            }
        }
        break;

    case TRACE_FMT_VCD:
        /* VCD header */
        {
            time_t now = time(NULL);
            fprintf(f, "$date\n  %s$end\n", ctime(&now));
            fprintf(f, "$version\n  TC397XP Emulator Trace 1.0\n$end\n");
            fprintf(f, "$timescale 1ns $end\n");
            fprintf(f, "$scope module cpu $end\n");
            fprintf(f, "$var wire 32 pc PC $end\n");
            fprintf(f, "$var wire 32 insn Instruction $end\n");
            fprintf(f, "$upscope $end\n");
            fprintf(f, "$enddefinitions $end\n");
            fprintf(f, "$dumpvars\n");
            fprintf(f, "b0 pc\n");
            fprintf(f, "b0 insn\n");
            fprintf(f, "$end\n");

            for (size_t i = 0; i < log->count; i++) {
                const trace_entry_t *e = trace_get_entry(log, i);
                if (e) {
                    fprintf(f, "#%llu\n", (unsigned long long)e->timestamp);
                    fprintf(f, "b");
                    for (int b = 31; b >= 0; b--) {
                        fprintf(f, "%c", (e->pc >> b) & 1 ? '1' : '0');
                    }
                    fprintf(f, " pc\n");
                    fprintf(f, "b");
                    for (int b = 31; b >= 0; b--) {
                        fprintf(f, "%c", (e->insn_word >> b) & 1 ? '1' : '0');
                    }
                    fprintf(f, " insn\n");
                }
            }
        }
        break;
    }

    fclose(f);
    return 0;
}

void trace_dump(trace_log_t *log, FILE *out, size_t max_entries)
{
    if (!log || !out) return;

    size_t count = (max_entries > 0 && max_entries < log->count) ?
                   max_entries : log->count;

    fprintf(out, "=== Trace Dump (%zu entries) ===\n", count);

    for (size_t i = 0; i < count; i++) {
        const trace_entry_t *e = trace_get_entry(log, i);
        if (!e) continue;

        fprintf(out, "[%6zu] %12llu  Core%u  PC=%08X  ",
                i, (unsigned long long)e->timestamp, e->core_id, e->pc);

        if (e->insn_size > 0) {
            if (e->insn_size == 2) {
                fprintf(out, "%04X      ", e->insn_word & 0xFFFF);
            } else {
                fprintf(out, "%08X  ", e->insn_word);
            }
        } else {
            fprintf(out, "          ");
        }

        /* Print flags */
        if (e->flags & TRACE_FLAG_BRANCH) fprintf(out, "BR ");
        if (e->flags & TRACE_FLAG_TAKEN)  fprintf(out, "TK ");
        if (e->flags & TRACE_FLAG_CALL)   fprintf(out, "CALL ");
        if (e->flags & TRACE_FLAG_RET)    fprintf(out, "RET ");
        if (e->flags & TRACE_FLAG_TRAP)   fprintf(out, "TRAP ");
        if (e->flags & TRACE_FLAG_IRQ)    fprintf(out, "IRQ ");
        if (e->flags & TRACE_FLAG_MEM)    fprintf(out, "MEM ");

        if (e->flags & TRACE_FLAG_REGS) {
            fprintf(out, " [D15=%08X A10=%08X PSW=%08X]",
                    e->d15, e->a10, e->psw);
        }

        if (e->flags & TRACE_FLAG_MEM) {
            fprintf(out, " [%08X=%08X]", e->mem_addr, e->mem_data);
        }

        fprintf(out, "\n");
    }
}

void trace_dump_recent(trace_log_t *log, FILE *out, size_t count)
{
    if (!log || !out || log->count == 0) return;

    if (count > log->count) count = log->count;

    size_t start = log->count - count;
    fprintf(out, "=== Last %zu Entries ===\n", count);

    for (size_t i = start; i < log->count; i++) {
        const trace_entry_t *e = trace_get_entry(log, i);
        if (!e) continue;

        fprintf(out, "[%6zu] %12llu  PC=%08X  ",
                i, (unsigned long long)e->timestamp, e->pc);

        if (e->insn_size == 2) {
            fprintf(out, "%04X\n", e->insn_word & 0xFFFF);
        } else if (e->insn_size == 4) {
            fprintf(out, "%08X\n", e->insn_word);
        } else {
            fprintf(out, "(event)\n");
        }
    }
}

/* ==========================================================================
 * Streaming Callback
 * ========================================================================== */

void trace_set_callback(trace_log_t *log,
    void (*callback)(trace_log_t *log, const trace_entry_t *entry, void *ctx),
    void *ctx)
{
    if (!log) return;
    log->on_entry = callback;
    log->callback_ctx = ctx;
}

/* ==========================================================================
 * Statistics
 * ========================================================================== */

void trace_print_stats(trace_log_t *log)
{
    if (!log) return;

    printf("=== Trace Statistics ===\n");
    printf("  Buffer capacity:   %zu\n", log->capacity);
    printf("  Buffer entries:    %zu\n", log->count);
    printf("  Buffer wrapped:    %s\n", log->wrapped ? "yes" : "no");
    printf("  Total logged:      %llu\n", (unsigned long long)log->total_logged);
    printf("  Total filtered:    %llu\n", (unsigned long long)log->total_filtered);
    printf("  Branches:          %llu\n", (unsigned long long)log->branch_count);
    printf("  Calls/Returns:     %llu\n", (unsigned long long)log->call_count);
    printf("  Traps:             %llu\n", (unsigned long long)log->trap_count);
    printf("  Interrupts:        %llu\n", (unsigned long long)log->irq_count);
    printf("  State:             %s\n",
           !log->enabled ? "disabled" :
           log->paused ? "paused" : "active");
}

void trace_get_stats(trace_log_t *log, uint64_t *total_logged,
                     uint64_t *total_filtered, uint64_t *branches,
                     uint64_t *calls)
{
    if (!log) return;

    if (total_logged) *total_logged = log->total_logged;
    if (total_filtered) *total_filtered = log->total_filtered;
    if (branches) *branches = log->branch_count;
    if (calls) *calls = log->call_count;
}
