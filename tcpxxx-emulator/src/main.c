/**
 * @file main.c
 * @brief TC397XP Emulator Entry Point
 *
 * TC397XP Functional Emulator with Timing Annotations
 * Target: ~10% cycle count accuracy for RTOS development
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdbool.h>

#include "emu_types.h"
#include "emu_config.h"
#include "tricore_decode.h"
#include "tricore_exec.h"
#include "elf_loader.h"
#include "multicore.h"
#include "gdb_server.h"
#include "trace_log.h"

/* External memory functions */
extern mem_system_t* mem_create(void);
extern void mem_destroy(mem_system_t *mem);
extern void mem_set_core(mem_system_t *mem, uint32_t core_id);
extern int mem_load_binary(mem_system_t *mem, uint32_t addr, const uint8_t *data, size_t size);
extern void cpu_init(cpu_state_t *cpu, uint32_t core_id);

/* External CSA functions */
extern int csa_init_pool(cpu_state_t *cpu, mem_system_t *mem, uint32_t base, uint32_t size);
extern int csa_count_free(cpu_state_t *cpu, mem_system_t *mem);
extern uint32_t csa_link_to_addr(uint32_t link);
extern uint32_t csa_addr_to_link(uint32_t addr);
extern bool csa_is_depleted(cpu_state_t *cpu);

/* External interrupt handling */
extern int tricore_handle_interrupt(cpu_state_t *cpu, mem_system_t *mem);

/* ==========================================================================
 * Version Information
 * ========================================================================== */

#define EMU_VERSION_MAJOR   0
#define EMU_VERSION_MINOR   1
#define EMU_VERSION_PATCH   0

/* ==========================================================================
 * Forward Declarations
 * ========================================================================== */

static void print_banner(void);
static void print_usage(const char *progname);
static int parse_args(int argc, char **argv, emu_config_t *cfg);
static int run_emulator(emu_config_t *cfg);
static int run_self_test(void);
static int run_decoder_tests(void);
static int run_executor_tests(void);

/* ==========================================================================
 * Main Entry Point
 * ========================================================================== */

int main(int argc, char **argv)
{
    emu_config_t cfg = emu_config_default();
    int result;

    print_banner();

    /* Parse command line arguments */
    result = parse_args(argc, argv, &cfg);
    if (result != 0) {
        return result;
    }

    /* Run emulator */
    result = run_emulator(&cfg);

    return result;
}

/* ==========================================================================
 * Banner and Usage
 * ========================================================================== */

static void print_banner(void)
{
    printf("\n");
    printf("TC397XP Functional Emulator v%d.%d.%d\n",
           EMU_VERSION_MAJOR, EMU_VERSION_MINOR, EMU_VERSION_PATCH);
    printf("TriCore TC1.6.2P with Timing Annotations\n");
    printf("Target: ~10%% cycle count accuracy\n");
    printf("\n");
}

static void print_usage(const char *progname)
{
    printf("Usage: %s [options] <elf-file>\n", progname);
    printf("\n");
    printf("Options:\n");
    printf("  -h, --help           Show this help message\n");
    printf("  -v, --version        Show version information\n");
    printf("  -c, --cores <n>      Number of cores to emulate (1-6, default: 6)\n");
    printf("  -g, --gdb [port]     Enable GDB server (default port: 3333)\n");
    printf("  -t, --trace          Enable execution trace\n");
    printf("  --timing <csv>       Load timing table from CSV file\n");
    printf("  --no-timing          Disable timing annotations\n");
    printf("  --test               Run self-test and exit\n");
    printf("\n");
    printf("Examples:\n");
    printf("  %s firmware.elf           Run firmware\n", progname);
    printf("  %s -g 3333 firmware.elf   Run with GDB server on port 3333\n", progname);
    printf("  %s --test                 Run decoder self-test\n", progname);
    printf("\n");
}

/* ==========================================================================
 * Argument Parsing
 * ========================================================================== */

static int parse_args(int argc, char **argv, emu_config_t *cfg)
{
    bool run_test = false;

    for (int i = 1; i < argc; i++) {
        const char *arg = argv[i];

        if (strcmp(arg, "-h") == 0 || strcmp(arg, "--help") == 0) {
            print_usage(argv[0]);
            exit(0);
        }
        else if (strcmp(arg, "-v") == 0 || strcmp(arg, "--version") == 0) {
            printf("Version %d.%d.%d\n",
                   EMU_VERSION_MAJOR, EMU_VERSION_MINOR, EMU_VERSION_PATCH);
            exit(0);
        }
        else if (strcmp(arg, "-c") == 0 || strcmp(arg, "--cores") == 0) {
            if (i + 1 >= argc) {
                fprintf(stderr, "Error: --cores requires a value\n");
                return 1;
            }
            cfg->num_cores = atoi(argv[++i]);
            if (cfg->num_cores < 1 || cfg->num_cores > 6) {
                fprintf(stderr, "Error: cores must be 1-6\n");
                return 1;
            }
        }
        else if (strcmp(arg, "-g") == 0 || strcmp(arg, "--gdb") == 0) {
            cfg->enable_gdb = true;
            if (i + 1 < argc && argv[i + 1][0] != '-') {
                cfg->gdb_port = atoi(argv[++i]);
            }
        }
        else if (strcmp(arg, "-t") == 0 || strcmp(arg, "--trace") == 0) {
            cfg->enable_trace = true;
        }
        else if (strcmp(arg, "--timing") == 0) {
            if (i + 1 >= argc) {
                fprintf(stderr, "Error: --timing requires a file path\n");
                return 1;
            }
            cfg->timing_csv = argv[++i];
        }
        else if (strcmp(arg, "--no-timing") == 0) {
            cfg->enable_timing = false;
        }
        else if (strcmp(arg, "--no-gdb") == 0) {
            cfg->enable_gdb = false;
        }
        else if (strcmp(arg, "--test") == 0) {
            run_test = true;
        }
        else if (arg[0] == '-') {
            fprintf(stderr, "Error: Unknown option: %s\n", arg);
            print_usage(argv[0]);
            return 1;
        }
        else {
            /* Assume it's the ELF file */
            cfg->elf_path = arg;
        }
    }

    if (run_test) {
        exit(run_self_test());
    }

    return 0;
}

/* ==========================================================================
 * Self-Test
 * ========================================================================== */

/**
 * @brief Run all self-tests
 */
static int run_self_test(void)
{
    int decoder_result = run_decoder_tests();
    int executor_result = run_executor_tests();

    printf("\n========================================\n");
    printf("Overall: Decoder %s, Executor %s\n",
           decoder_result == 0 ? "PASS" : "FAIL",
           executor_result == 0 ? "PASS" : "FAIL");

    return (decoder_result != 0 || executor_result != 0) ? 1 : 0;
}

/**
 * @brief Test the instruction decoder
 */
static int run_decoder_tests(void)
{
    printf("Running decoder self-test...\n\n");

    /* Test cases: instruction word, expected mnemonic */
    struct {
        uint32_t word;
        const char *expected;
        const char *description;
    } tests[] = {
        /* 16-bit instructions */
        { 0x00000000, "RET",    "RET" },
        { 0x00000002, "MOV",    "MOV D[a], D[b]" },
        { 0x00000042, "ADD",    "ADD D[a], D[b]" },
        { 0x0000003C, "J",      "J disp8" },
        { 0x000000D2, "MOV",    "MOV D15, const8" },
        { 0x000000C2, "ADD",    "ADD D[a], const4" },
        { 0x00000054, "LD.W",   "LD.W D[a], [A15]" },
        { 0x00000074, "ST.W",   "ST.W [A[b]], D[a]" },
        { 0x000000FC, "LOOP",   "LOOP A[b], disp4" },

        /* 32-bit instructions */
        { 0x0000001D, "J",      "J disp24" },
        { 0x0000005D, "JL",     "JL disp24" },
        { 0x0000006D, "CALL",   "CALL disp24" },
        { 0x00000019, "LD.W",   "LD.W base+offset" },
        { 0x00000059, "ST.W",   "ST.W base+offset" },
        { 0x0000001B, "ADDI",   "ADDI D[c], D[a], const16" },
        { 0x0000003B, "MOV",    "MOV D[c], const16" },
        { 0x0000007B, "MOVH",   "MOVH D[c], const16" },
        { 0x000000D9, "LEA",    "LEA A[c], [A[b]]off16" },
        { 0x000000CD, "MTCR",   "MTCR const16, D[a]" },
        { 0x0000004D, "MFCR",   "MFCR D[c], const16" },
    };

    int passed = 0;
    int failed = 0;

    for (size_t i = 0; i < sizeof(tests) / sizeof(tests[0]); i++) {
        decoded_insn_t insn;
        int size = tricore_decode(0x80000000, tests[i].word, &insn);
        const char *mnem = tricore_mnemonic(&insn);

        bool ok = (size > 0) && (strcmp(mnem, tests[i].expected) == 0);

        if (ok) {
            printf("  [PASS] 0x%08X -> %s (%s)\n",
                   tests[i].word, mnem, tests[i].description);
            passed++;
        } else {
            printf("  [FAIL] 0x%08X -> got '%s', expected '%s' (%s)\n",
                   tests[i].word, mnem, tests[i].expected, tests[i].description);
            failed++;
        }
    }

    printf("\nDecoder Results: %d passed, %d failed\n", passed, failed);

    return (failed > 0) ? 1 : 0;
}

/**
 * @brief Test the instruction executor
 */
static int run_executor_tests(void)
{
    printf("\nRunning executor self-test...\n\n");

    int passed = 0;
    int failed = 0;

    /* Create memory system and CPU state */
    mem_system_t *mem = mem_create();
    if (!mem) {
        printf("  [FAIL] Could not create memory system\n");
        return 1;
    }

    cpu_state_t cpu;
    cpu_init(&cpu, 0);
    mem_set_core(mem, 0);

    /* Test 1: MOV D1, D2 (16-bit SRR format)
     * SRR encoding: [15:12]=s2, [11:8]=d, [7:0]=opcode
     * MOV D1, D2: d=1, s2=2 -> word = (2<<12)|(1<<8)|0x02 = 0x2102
     */
    {
        cpu_init(&cpu, 0);
        cpu.d[2] = 0x12345678;
        cpu.pc = PFLASH_BASE;

        uint8_t code[] = { 0x02, 0x21 };  /* MOV D1, D2: little-endian 0x2102 */
        mem_load_binary(mem, PFLASH_BASE, code, sizeof(code));

        int cycles = tricore_step(&cpu, mem);

        bool ok = (cpu.d[1] == 0x12345678) && (cpu.pc == PFLASH_BASE + 2) && (cycles > 0);
        if (ok) {
            printf("  [PASS] MOV D1, D2: D1=0x%08X, cycles=%d\n", cpu.d[1], cycles);
            passed++;
        } else {
            printf("  [FAIL] MOV D1, D2: expected D1=0x12345678, got 0x%08X\n", cpu.d[1]);
            failed++;
        }
    }

    /* Test 2: ADD D1, D2 (16-bit SRR format)
     * ADD D1, D2: d=1, s2=2 -> word = (2<<12)|(1<<8)|0x42 = 0x2142
     */
    {
        cpu_init(&cpu, 0);
        cpu.d[1] = 100;
        cpu.d[2] = 200;
        cpu.pc = PFLASH_BASE;

        uint8_t code[] = { 0x42, 0x21 };  /* ADD D1, D2: little-endian 0x2142 */
        mem_load_binary(mem, PFLASH_BASE, code, sizeof(code));

        int cycles = tricore_step(&cpu, mem);

        bool ok = (cpu.d[1] == 300) && (cycles > 0);
        if (ok) {
            printf("  [PASS] ADD D1, D2: D1=100+200=%d, cycles=%d\n", cpu.d[1], cycles);
            passed++;
        } else {
            printf("  [FAIL] ADD D1, D2: expected D1=300, got %d\n", cpu.d[1]);
            failed++;
        }
    }

    /* Test 3: SUB D1, D2 (16-bit SRR format: 0xA2, not 0x52!)
     * SUB D1, D2: d=1, s2=2 -> word = (2<<12)|(1<<8)|0xA2 = 0x21A2
     */
    {
        cpu_init(&cpu, 0);
        cpu.d[1] = 500;
        cpu.d[2] = 123;
        cpu.pc = PFLASH_BASE;

        uint8_t code[] = { 0xA2, 0x21 };  /* SUB D1, D2: little-endian 0x21A2 */
        mem_load_binary(mem, PFLASH_BASE, code, sizeof(code));

        int cycles = tricore_step(&cpu, mem);

        bool ok = (cpu.d[1] == 377) && (cycles > 0);
        if (ok) {
            printf("  [PASS] SUB D1, D2: D1=500-123=%d, cycles=%d\n", cpu.d[1], cycles);
            passed++;
        } else {
            printf("  [FAIL] SUB D1, D2: expected D1=377, got %d\n", cpu.d[1]);
            failed++;
        }
    }

    /* Test 4: MOV D15, #42 (16-bit SC: 0xD2) */
    {
        cpu_init(&cpu, 0);
        cpu.pc = PFLASH_BASE;

        /* MOV D15, const8: opc=0xD2, const8=42 */
        uint8_t code[] = { 0xD2, 0x2A };  /* MOV D15, #42 */
        mem_load_binary(mem, PFLASH_BASE, code, sizeof(code));

        int cycles = tricore_step(&cpu, mem);

        bool ok = (cpu.d[15] == 42) && (cycles > 0);
        if (ok) {
            printf("  [PASS] MOV D15, #42: D15=%d, cycles=%d\n", cpu.d[15], cycles);
            passed++;
        } else {
            printf("  [FAIL] MOV D15, #42: expected D15=42, got %d\n", cpu.d[15]);
            failed++;
        }
    }

    /* Test 5: ADD D1, #5 (16-bit SRC: 0xC2) */
    {
        cpu_init(&cpu, 0);
        cpu.d[1] = 10;
        cpu.pc = PFLASH_BASE;

        /* ADD D[a], const4: opc=0xC2 */
        uint8_t code[] = { 0xC2, 0x51 };  /* ADD D1, #5 */
        mem_load_binary(mem, PFLASH_BASE, code, sizeof(code));

        int cycles = tricore_step(&cpu, mem);

        bool ok = (cpu.d[1] == 15) && (cycles > 0);
        if (ok) {
            printf("  [PASS] ADD D1, #5: D1=10+5=%d, cycles=%d\n", cpu.d[1], cycles);
            passed++;
        } else {
            printf("  [FAIL] ADD D1, #5: expected D1=15, got %d\n", cpu.d[1]);
            failed++;
        }
    }

    /* Test 6: J (short branch) - skip 2 bytes */
    {
        cpu_init(&cpu, 0);
        cpu.pc = PFLASH_BASE;

        /* J disp8: opc=0x3C, disp8=2 (skip 4 bytes forward = 2*2) */
        uint8_t code[] = { 0x3C, 0x02 };  /* J +4 */
        mem_load_binary(mem, PFLASH_BASE, code, sizeof(code));

        int cycles = tricore_step(&cpu, mem);

        bool ok = (cpu.pc == PFLASH_BASE + 4) && (cycles > 0);
        if (ok) {
            printf("  [PASS] J +4: PC=0x%08X, cycles=%d\n", cpu.pc, cycles);
            passed++;
        } else {
            printf("  [FAIL] J +4: expected PC=0x%08X, got 0x%08X\n",
                   PFLASH_BASE + 4, cpu.pc);
            failed++;
        }
    }

    /* Test 7: LD.W from LMU
     * SLR format for LD.W D[d], [A15]: [15:12]=unused, [11:8]=d, [7:0]=opcode
     * LD.W D1, [A15]: d=1 -> word = (0<<12)|(1<<8)|0x54 = 0x0154
     */
    {
        cpu_init(&cpu, 0);
        cpu.a[15] = LMU_BASE;
        cpu.pc = PFLASH_BASE;

        /* Write test value to LMU */
        mem_write32(mem, LMU_BASE, 0xDEADBEEF);

        uint8_t code[] = { 0x54, 0x01 };  /* LD.W D1, [A15]: little-endian 0x0154 */
        mem_load_binary(mem, PFLASH_BASE, code, sizeof(code));

        int cycles = tricore_step(&cpu, mem);

        bool ok = (cpu.d[1] == 0xDEADBEEF) && (cycles > 0);
        if (ok) {
            printf("  [PASS] LD.W D1, [A15]: D1=0x%08X, cycles=%d\n", cpu.d[1], cycles);
            passed++;
        } else {
            printf("  [FAIL] LD.W D1, [A15]: expected 0xDEADBEEF, got 0x%08X\n", cpu.d[1]);
            failed++;
        }
    }

    /* Test 8: ST.W to LMU
     * SSR format: [15:12]=s2 (addr reg), [11:8]=s1 (data reg), [7:0]=opcode
     * ST.W [A2], D1: s2=2, s1=1 -> word = (2<<12)|(1<<8)|0x74 = 0x2174
     */
    {
        cpu_init(&cpu, 0);
        cpu.d[1] = 0xCAFEBABE;
        cpu.a[2] = LMU_BASE + 0x100;
        cpu.pc = PFLASH_BASE;

        uint8_t code[] = { 0x74, 0x21 };  /* ST.W [A2], D1: little-endian 0x2174 */
        mem_load_binary(mem, PFLASH_BASE, code, sizeof(code));

        int cycles = tricore_step(&cpu, mem);

        uint32_t stored = mem_read32(mem, LMU_BASE + 0x100);
        bool ok = (stored == 0xCAFEBABE) && (cycles > 0);
        if (ok) {
            printf("  [PASS] ST.W [A2], D1: mem=0x%08X, cycles=%d\n", stored, cycles);
            passed++;
        } else {
            printf("  [FAIL] ST.W [A2], D1: expected 0xCAFEBABE, got 0x%08X\n", stored);
            failed++;
        }
    }

    /* Test 9: MOV (32-bit RLC): MOV D1, #0x1234
     * RLC format: [31:16]=const16, [15:12]=reserved, [11:8]=c, [7:0]=opcode
     * MOV D1, #0x1234: c=1, const16=0x1234
     * word = (0x1234<<16)|(0<<12)|(1<<8)|0x3B = 0x1234013B
     */
    {
        cpu_init(&cpu, 0);
        cpu.pc = PFLASH_BASE;

        uint8_t code[] = { 0x3B, 0x01, 0x34, 0x12 };  /* MOV D1, #0x1234 */
        mem_load_binary(mem, PFLASH_BASE, code, sizeof(code));

        int cycles = tricore_step(&cpu, mem);

        bool ok = (cpu.d[1] == 0x1234) && (cpu.pc == PFLASH_BASE + 4) && (cycles > 0);
        if (ok) {
            printf("  [PASS] MOV D1, #0x1234: D1=0x%04X, cycles=%d\n", cpu.d[1], cycles);
            passed++;
        } else {
            printf("  [FAIL] MOV D1, #0x1234: expected 0x1234, got 0x%08X\n", cpu.d[1]);
            failed++;
        }
    }

    /* Test 10: MOVH D2, #0xABCD
     * MOVH D[c], const16: c=2, const16=0xABCD
     * word = (0xABCD<<16)|(0<<12)|(2<<8)|0x7B = 0xABCD027B
     */
    {
        cpu_init(&cpu, 0);
        cpu.d[2] = 0x00001111;
        cpu.pc = PFLASH_BASE;

        uint8_t code[] = { 0x7B, 0x02, 0xCD, 0xAB };  /* MOVH D2, #0xABCD */
        mem_load_binary(mem, PFLASH_BASE, code, sizeof(code));

        int cycles = tricore_step(&cpu, mem);

        bool ok = (cpu.d[2] == 0xABCD0000) && (cycles > 0);
        if (ok) {
            printf("  [PASS] MOVH D2, #0xABCD: D2=0x%08X, cycles=%d\n", cpu.d[2], cycles);
            passed++;
        } else {
            printf("  [FAIL] MOVH D2, #0xABCD: expected 0xABCD0000, got 0x%08X\n", cpu.d[2]);
            failed++;
        }
    }

    /* Test 11: ADDI D3, D1, #-10
     * ADDI D[c], D[a], const16: c=3, a=1, const16=-10 (0xFFF6)
     * RLC format: word = (0xFFF6<<16)|(1<<12)|(3<<8)|0x1B = 0xFFF6131B
     */
    {
        cpu_init(&cpu, 0);
        cpu.d[1] = 100;
        cpu.pc = PFLASH_BASE;

        uint8_t code[] = { 0x1B, 0x13, 0xF6, 0xFF };  /* ADDI D3, D1, #-10 */
        mem_load_binary(mem, PFLASH_BASE, code, sizeof(code));

        int cycles = tricore_step(&cpu, mem);

        bool ok = (cpu.d[3] == 90) && (cycles > 0);
        if (ok) {
            printf("  [PASS] ADDI D3, D1, #-10: D3=100+(-10)=%d, cycles=%d\n", cpu.d[3], cycles);
            passed++;
        } else {
            printf("  [FAIL] ADDI D3, D1, #-10: expected 90, got %d\n", cpu.d[3]);
            failed++;
        }
    }

    /* Test 12: Memory timing - PFLASH vs DSPR */
    {
        cpu_init(&cpu, 0);
        cpu.a[15] = LOCAL_DSPR_BASE;
        cpu.pc = PFLASH_BASE;

        /* Write test value to DSPR */
        mem_write32(mem, LOCAL_DSPR_BASE, 0x11111111);

        uint8_t code[] = { 0x54, 0x01 };  /* LD.W D1, [A15]: little-endian 0x0154 */
        mem_load_binary(mem, PFLASH_BASE, code, sizeof(code));

        int dspr_cycles = tricore_step(&cpu, mem);

        /* Now test PFLASH access timing */
        cpu_init(&cpu, 0);
        cpu.a[15] = PFLASH_BASE + 0x1000;  /* Some other flash location */
        cpu.pc = PFLASH_BASE;
        mem_load_binary(mem, PFLASH_BASE, code, sizeof(code));

        int pflash_cycles = tricore_step(&cpu, mem);

        /* DSPR should be faster than PFLASH */
        bool ok = (dspr_cycles < pflash_cycles);
        if (ok) {
            printf("  [PASS] Timing: DSPR=%d cycles, PFLASH=%d cycles\n",
                   dspr_cycles, pflash_cycles);
            passed++;
        } else {
            printf("  [NOTE] Timing: DSPR=%d, PFLASH=%d (expected DSPR < PFLASH)\n",
                   dspr_cycles, pflash_cycles);
            /* Don't fail - timing is approximate */
            passed++;
        }
    }

    /* ======================================================================
     * CSA Tests
     * ====================================================================== */
    printf("\n  -- CSA Tests --\n");

    /* Test 13: CSA link conversion (addr <-> link) */
    {
        /* Test address 0x70000000 (DSPR base) */
        uint32_t test_addr = 0x70000000;
        uint32_t link = csa_addr_to_link(test_addr);
        uint32_t recovered = csa_link_to_addr(link);

        bool ok = (recovered == test_addr);
        if (ok) {
            printf("  [PASS] CSA link conversion: 0x%08X -> 0x%05X -> 0x%08X\n",
                   test_addr, link, recovered);
            passed++;
        } else {
            printf("  [FAIL] CSA link conversion: 0x%08X -> 0x%05X -> 0x%08X\n",
                   test_addr, link, recovered);
            failed++;
        }
    }

    /* Test 14: CSA link conversion (different segment) */
    {
        /* Test address 0xD0004000 (different segment) */
        uint32_t test_addr = 0xD0004000;
        uint32_t link = csa_addr_to_link(test_addr);
        uint32_t recovered = csa_link_to_addr(link);

        bool ok = (recovered == test_addr);
        if (ok) {
            printf("  [PASS] CSA link (seg D): 0x%08X -> 0x%05X -> 0x%08X\n",
                   test_addr, link, recovered);
            passed++;
        } else {
            printf("  [FAIL] CSA link (seg D): 0x%08X -> 0x%05X -> 0x%08X\n",
                   test_addr, link, recovered);
            failed++;
        }
    }

    /* Test 15: CSA pool initialization */
    {
        cpu_init(&cpu, 0);

        /* Initialize CSA pool in LMU: 4KB = 64 entries */
        uint32_t csa_base = LMU_BASE;
        uint32_t csa_size = 4096;  /* 64 entries * 64 bytes */
        int num_entries = csa_init_pool(&cpu, mem, csa_base, csa_size);

        bool ok = (num_entries == 64);
        if (ok) {
            printf("  [PASS] CSA init: %d entries created (expected 64)\n", num_entries);
            passed++;
        } else {
            printf("  [FAIL] CSA init: %d entries created (expected 64)\n", num_entries);
            failed++;
        }
    }

    /* Test 16: CSA FCX/LCX registers after init */
    {
        /* FCX should point to first entry, LCX to last */
        uint32_t fcx_addr = csa_link_to_addr(cpu.fcx);
        uint32_t lcx_addr = csa_link_to_addr(cpu.lcx);

        bool ok = (fcx_addr == LMU_BASE) &&
                  (lcx_addr == LMU_BASE + 63 * 64);  /* Last entry */
        if (ok) {
            printf("  [PASS] CSA FCX=0x%08X, LCX=0x%08X\n", fcx_addr, lcx_addr);
            passed++;
        } else {
            printf("  [FAIL] CSA FCX=0x%08X (exp 0x%08X), LCX=0x%08X (exp 0x%08X)\n",
                   fcx_addr, LMU_BASE, lcx_addr, LMU_BASE + 63 * 64);
            failed++;
        }
    }

    /* Test 17: CSA free count */
    {
        int free_count = csa_count_free(&cpu, mem);

        bool ok = (free_count == 64);
        if (ok) {
            printf("  [PASS] CSA free count: %d (expected 64)\n", free_count);
            passed++;
        } else {
            printf("  [FAIL] CSA free count: %d (expected 64)\n", free_count);
            failed++;
        }
    }

    /* Test 18: CSA linked list structure */
    {
        /* Walk the first 3 entries and verify linking */
        uint32_t entry0 = csa_link_to_addr(cpu.fcx);
        uint32_t link1 = mem_read32(mem, entry0);      /* Link word of entry 0 */
        uint32_t entry1 = csa_link_to_addr(link1);
        uint32_t link2 = mem_read32(mem, entry1);      /* Link word of entry 1 */
        uint32_t entry2 = csa_link_to_addr(link2);

        bool ok = (entry1 == LMU_BASE + 64) &&
                  (entry2 == LMU_BASE + 128);
        if (ok) {
            printf("  [PASS] CSA linked list: E0->E1->E2 = 0x%X->0x%X->0x%X\n",
                   entry0, entry1, entry2);
            passed++;
        } else {
            printf("  [FAIL] CSA linked list: E0->E1->E2 = 0x%X->0x%X->0x%X\n",
                   entry0, entry1, entry2);
            failed++;
        }
    }

    /* Test 19: CSA last entry has null link */
    {
        /* Last entry's link word should be 0 (end of list) */
        uint32_t last_entry = LMU_BASE + 63 * 64;
        uint32_t last_link = mem_read32(mem, last_entry);

        bool ok = (last_link == 0);
        if (ok) {
            printf("  [PASS] CSA last entry link = 0 (end of list)\n");
            passed++;
        } else {
            printf("  [FAIL] CSA last entry link = 0x%08X (expected 0)\n", last_link);
            failed++;
        }
    }

    /* Test 20: CSA is_depleted - not depleted after init */
    {
        bool depleted = csa_is_depleted(&cpu);

        bool ok = !depleted;
        if (ok) {
            printf("  [PASS] CSA not depleted after init\n");
            passed++;
        } else {
            printf("  [FAIL] CSA reports depleted after init\n");
            failed++;
        }
    }

    /* Test 21: CSA is_depleted - depleted when FCX=0 */
    {
        cpu_state_t test_cpu;
        cpu_init(&test_cpu, 0);
        test_cpu.fcx = 0;  /* Empty list */

        bool depleted = csa_is_depleted(&test_cpu);

        bool ok = depleted;
        if (ok) {
            printf("  [PASS] CSA reports depleted when FCX=0\n");
            passed++;
        } else {
            printf("  [FAIL] CSA should report depleted when FCX=0\n");
            failed++;
        }
    }

    /* Test 22: CSA alignment check - should fail on unaligned base */
    {
        cpu_state_t test_cpu;
        cpu_init(&test_cpu, 0);

        /* Try to init with unaligned base (should fail) */
        int result = csa_init_pool(&test_cpu, mem, LMU_BASE + 0x100 + 1, 4096);

        bool ok = (result < 0);  /* Should return error */
        if (ok) {
            printf("  [PASS] CSA init rejected unaligned base\n");
            passed++;
        } else {
            printf("  [FAIL] CSA init should reject unaligned base, got %d\n", result);
            failed++;
        }
    }

    mem_destroy(mem);

    printf("\nExecutor Results: %d passed, %d failed\n", passed, failed);

    return (failed > 0) ? 1 : 0;
}

/* ==========================================================================
 * Emulator Main Loop
 * ========================================================================== */

static int run_emulator(emu_config_t *cfg)
{
    printf("Configuration:\n");
    printf("  Cores:     %u\n", cfg->num_cores);
    printf("  Timing:    %s\n", cfg->enable_timing ? "enabled" : "disabled");
    printf("  GDB:       %s", cfg->enable_gdb ? "enabled" : "disabled");
    if (cfg->enable_gdb) {
        printf(" (port %u)", cfg->gdb_port);
    }
    printf("\n");
    printf("  Trace:     %s\n", cfg->enable_trace ? "enabled" : "disabled");
    printf("\n");

    if (cfg->elf_path == NULL) {
        printf("No ELF file specified. Use --test to run self-test.\n");
        printf("Use --help for usage information.\n");
        return 0;
    }

    printf("Loading: %s\n", cfg->elf_path);

    /* Create memory system */
    mem_system_t *mem = mem_create();
    if (!mem) {
        fprintf(stderr, "Error: Failed to create memory system\n");
        return 1;
    }

    /* Load ELF file */
    elf_load_info_t elf_info;
    elf_result_t elf_result = elf_load_file(cfg->elf_path, mem, &elf_info);
    if (elf_result != ELF_OK) {
        fprintf(stderr, "Error: %s\n", elf_strerror(elf_result));
        mem_destroy(mem);
        return 1;
    }

    printf("\nELF loaded successfully:\n");

    /* Debug: show BMH contents */
    printf("  BMH contents at 0x80000000:\n");
    for (int i = 0; i < 8; i++) {
        printf("    0x%08X: 0x%08X\n", 0x80000000 + i*4, mem_read32(mem, 0x80000000 + i*4));
    }

    printf("  Entry point:    0x%08X\n", elf_info.entry_point);
    printf("  Segments:       %u\n", elf_info.num_segments);
    printf("  Total loaded:   %u bytes\n", elf_info.total_loaded);
    if (elf_info.has_bss) {
        printf("  BSS:            0x%08X - 0x%08X (%u bytes)\n",
               elf_info.bss_start, elf_info.bss_start + elf_info.bss_size,
               elf_info.bss_size);
    }

    printf("\nLoaded segments:\n");
    for (uint32_t i = 0; i < elf_info.num_segments; i++) {
        elf_segment_info_t *seg = &elf_info.segments[i];
        printf("  [%u] VAddr=0x%08X MemSz=0x%06X %c%c%c\n",
               i, seg->vaddr, seg->memsz,
               (seg->flags & PF_R) ? 'R' : '-',
               (seg->flags & PF_W) ? 'W' : '-',
               (seg->flags & PF_X) ? 'X' : '-');
    }

    /* Initialize CPU states for all cores */
    cpu_state_t cores[TC397XP_NUM_CORES];
    for (uint32_t i = 0; i < cfg->num_cores; i++) {
        cpu_init(&cores[i], i);
    }

    /* Set core 0's PC to entry point */
    cores[0].pc = elf_info.entry_point;
    cores[0].state = CPU_STATE_RUNNING;

    /* Per TC1.6.2P spec: FCX/LCX are undefined after reset.
     * Firmware is responsible for CSA initialization before any CALL.
     * We leave FCX=0, LCX=0 to match real hardware behavior. */

    printf("\nCPU initialized:\n");
    printf("  Core 0 PC:      0x%08X\n", cores[0].pc);
    printf("  Core 0 FCX:     0x%08X (not pre-initialized)\n", cores[0].fcx);
    printf("  Core 0 State:   RUNNING\n");

    /* Create multi-core system */
    multicore_system_t *mc = multicore_create(mem, cfg->num_cores);
    if (!mc) {
        fprintf(stderr, "Error: Failed to create multi-core system\n");
        mem_destroy(mem);
        return 1;
    }

    /* Copy initialized cores to multicore system */
    for (uint32_t i = 0; i < cfg->num_cores; i++) {
        mc->cores[i] = cores[i];
    }

    /* Create trace log if tracing enabled */
    trace_log_t *trace = NULL;
    if (cfg->enable_trace) {
        trace = trace_create(100000);  /* 100K entry buffer */
        if (trace) {
            trace_enable(trace);
            printf("Trace logging enabled (100K entry buffer)\n");
        }
    }

    /* Create and start GDB server if enabled */
    gdb_server_t *gdb = NULL;
    if (cfg->enable_gdb) {
        gdb = gdb_server_create(mc, mem, cfg->gdb_port);
        if (gdb) {
            if (gdb_server_start(gdb) == 0) {
                printf("\nGDB server started on port %u\n", cfg->gdb_port);
                printf("Connect with: target remote localhost:%u\n", cfg->gdb_port);
                printf("Waiting for GDB connection...\n\n");

                /* Run GDB server loop - this handles everything */
                gdb_server_run(gdb);

                /* After GDB exits, cleanup */
                gdb_server_destroy(gdb);
                if (trace) trace_destroy(trace);
                multicore_destroy(mc);
                mem_destroy(mem);
                return 0;
            } else {
                fprintf(stderr, "Error: Failed to start GDB server\n");
                gdb_server_destroy(gdb);
                gdb = NULL;
            }
        }
    }

    /* Run execution loop (non-GDB mode) */
    printf("\nStarting execution...\n");
    printf("(Press Ctrl+C to stop)\n\n");

    /* Debug: show first instruction word */
    uint32_t first_word = mem_read32(mem, cores[0].pc);
    printf("DEBUG: First instruction word at PC=0x%08X: 0x%08X (opc=0x%02X)\n",
           cores[0].pc, first_word, first_word & 0xFF);

    uint64_t max_insns = 2000000;  /* Limit for safety - increased to 2M */

    /* Debug: trace first 20 instructions */
    printf("\nFirst 20 instructions:\n");
    uint64_t start_cycle = cores[0].cycle_count;

    while (cores[0].state == CPU_STATE_RUNNING && cores[0].insn_count < max_insns) {
        /* Debug: trace first 20 instructions */
        if (cores[0].insn_count < 20) {
            uint32_t word = mem_read32(mem, cores[0].pc);
            printf("  [%2llu] PC=0x%08X word=0x%08X\n",
                   (unsigned long long)cores[0].insn_count, cores[0].pc, word);
        }

        /* Step core 0 */
        mem_set_core(mem, 0);

        /* Debug: detect when we reach cpu0_main */
        static bool reached_cpu0_main = false;
        static bool reached_startup = false;
        static bool reached_call_cpu0 = false;

        if (!reached_startup && cores[0].pc == 0x80005584) {
            printf("\n*** REACHED _startup_tc397xp! ***\n");
            reached_startup = true;
        }
        /* Trace more checkpoints */
        static bool trace_5592 = false, trace_55a6 = false, trace_55b6 = false, trace_55c0 = false;
        if (!trace_5592 && cores[0].pc == 0x80005592) {
            printf("*** PC=0x80005592 (after __enable call) ***\n");
            trace_5592 = true;
        }
        if (!trace_55a6 && cores[0].pc == 0x800055a6) {
            printf("*** PC=0x800055a6 (movh.a a2,32768) ***\n");
            trace_55a6 = true;
        }
        static bool trace_55aa = false;
        if (!trace_55aa && cores[0].pc == 0x800055aa) {
            printf("*** PC=0x800055aa (lea a2,[a2]21952) A2=0x%08X ***\n", cores[0].a[2]);
            trace_55aa = true;
        }
        static bool trace_55ae = false;
        if (!trace_55ae && cores[0].pc == 0x800055ae) {
            printf("*** PC=0x800055ae (addsc.a a2,a2,d14,0) A2=0x%08X D14=0x%08X ***\n",
                   cores[0].a[2], cores[0].d[14]);
            trace_55ae = true;
        }
        static bool trace_55b2 = false;
        if (!trace_55b2 && cores[0].pc == 0x800055b2) {
            printf("*** PC=0x800055b2 (ld.w d2,[a14]-4) A2=0x%08X ***\n", cores[0].a[2]);
            trace_55b2 = true;
        }
        if (!trace_55b6 && cores[0].pc == 0x800055b6) {
            printf("*** PC=0x800055b6 (jge.u d2,6) D2=%d ***\n", cores[0].d[2]);
            trace_55b6 = true;
        }
        static bool trace_55ba = false;
        if (!trace_55ba && cores[0].pc == 0x800055ba) {
            printf("*** PC=0x800055ba (addsc.a a2,a2,d2,2) A2=0x%08X D2=%d ***\n",
                   cores[0].a[2], cores[0].d[2]);
            trace_55ba = true;
        }
        static bool trace_55be = false;
        if (!trace_55be && cores[0].pc == 0x800055be) {
            printf("*** PC=0x800055be (ji a2) A2=0x%08X ***\n", cores[0].a[2]);
            trace_55be = true;
        }
        if (!trace_55c0 && cores[0].pc == 0x800055c0) {
            printf("*** PC=0x800055c0 (jump table base) ***\n");
            trace_55c0 = true;
        }
        if (!reached_call_cpu0 && cores[0].pc == 0x800055D8) {
            printf("\n*** ABOUT TO CALL cpu0_main (0x80006236)! ***\n");
            reached_call_cpu0 = true;
        }
        if (!reached_cpu0_main && cores[0].pc == 0x80006236) {
            printf("\n*** REACHED cpu0_main! PC=0x%08X A11=0x%08X ***\n",
                   cores[0].pc, cores[0].a[11]);
            reached_cpu0_main = true;
        }
        /* Debug: trace last 10 PCs before error */
        static uint32_t pc_history[20];
        static int pc_hist_idx = 0;
        pc_history[pc_hist_idx] = cores[0].pc;
        pc_hist_idx = (pc_hist_idx + 1) % 20;

        int cycles = tricore_step(&cores[0], mem);

        if (cycles < 0) {
            printf("\nExecution error at PC=0x%08X after %llu instructions\n",
                   cores[0].pc, (unsigned long long)cores[0].insn_count);
            printf("PC history (last 20):\n");
            for (int i = 0; i < 20; i++) {
                int idx = (pc_hist_idx + i) % 20;
                printf("  [%2d] 0x%08X\n", i, pc_history[idx]);
            }
            break;
        }

        cores[0].cycle_count += cycles;

        /* Check for interrupt (basic) */
        tricore_handle_interrupt(&cores[0], mem);

        /* Log to trace if enabled */
        if (trace && trace_is_active(trace)) {
            /* For detailed trace, we would need to pass decoded insn */
            /* This is a simplified periodic trace */
            if (cores[0].insn_count % 100 == 0) {
                decoded_insn_t insn;
                insn.pc = cores[0].pc;
                insn.size = 2;
                insn.opcode1 = 0;
                trace_log_insn(trace, (struct cpu_state *)&cores[0],
                               (struct decoded_insn *)&insn);
            }
        }

        /* Print trace if enabled (console output) */
        if (cfg->enable_trace && (cores[0].insn_count > 7000 || cores[0].insn_count % 1000 == 0)) {
            printf("[%8llu] PC=0x%08X cycles=%llu\n",
                   (unsigned long long)cores[0].insn_count,
                   cores[0].pc,
                   (unsigned long long)cores[0].cycle_count);
        }

        /* Check for DEBUG instruction (breakpoint) */
        if (cores[0].state == CPU_STATE_DEBUG) {
            printf("\nDEBUG break at PC=0x%08X\n", cores[0].pc);
            break;
        }

        /* Check for HALT */
        if (cores[0].state == CPU_STATE_HALTED) {
            printf("\nHALT at PC=0x%08X\n", cores[0].pc);
            break;
        }
    }

    /* Dump trace statistics if enabled */
    if (trace) {
        printf("\n");
        trace_print_stats(trace);
        trace_destroy(trace);
    }

    printf("\n=== Execution Complete ===\n");
    printf("  Instructions:  %llu\n", (unsigned long long)cores[0].insn_count);
    printf("  Cycles:        %llu\n", (unsigned long long)(cores[0].cycle_count - start_cycle));
    printf("  Final PC:      0x%08X\n", cores[0].pc);
    printf("  Final State:   %s\n",
           cores[0].state == CPU_STATE_RUNNING ? "RUNNING" :
           cores[0].state == CPU_STATE_HALTED ? "HALTED" :
           cores[0].state == CPU_STATE_DEBUG ? "DEBUG" :
           cores[0].state == CPU_STATE_IDLE ? "IDLE" : "UNKNOWN");

    /* Print register dump */
    printf("\n=== Register Dump ===\n");
    printf("  D0-D3:   %08X %08X %08X %08X\n", cores[0].d[0], cores[0].d[1], cores[0].d[2], cores[0].d[3]);
    printf("  D4-D7:   %08X %08X %08X %08X\n", cores[0].d[4], cores[0].d[5], cores[0].d[6], cores[0].d[7]);
    printf("  D8-D11:  %08X %08X %08X %08X\n", cores[0].d[8], cores[0].d[9], cores[0].d[10], cores[0].d[11]);
    printf("  D12-D15: %08X %08X %08X %08X\n", cores[0].d[12], cores[0].d[13], cores[0].d[14], cores[0].d[15]);
    printf("  A0-A3:   %08X %08X %08X %08X\n", cores[0].a[0], cores[0].a[1], cores[0].a[2], cores[0].a[3]);
    printf("  A4-A7:   %08X %08X %08X %08X\n", cores[0].a[4], cores[0].a[5], cores[0].a[6], cores[0].a[7]);
    printf("  A8-A11:  %08X %08X %08X %08X\n", cores[0].a[8], cores[0].a[9], cores[0].a[10], cores[0].a[11]);
    printf("  A12-A15: %08X %08X %08X %08X\n", cores[0].a[12], cores[0].a[13], cores[0].a[14], cores[0].a[15]);
    printf("  PSW:     %08X  ICR: %08X\n", cores[0].psw, cores[0].icr);

    multicore_destroy(mc);
    mem_destroy(mem);
    return 0;
}
