/**
 * @file test_elf_load.c
 * @brief Quick test of ELF loader with JEZGRO TriCore ELF
 */

#include <stdio.h>
#include <stdlib.h>
#include "elf_loader.h"

/* External memory functions */
extern mem_system_t* mem_create(void);
extern void mem_destroy(mem_system_t *mem);
extern uint32_t mem_read32(mem_system_t *mem, uint32_t addr);

int main(int argc, char **argv)
{
    const char *elf_path = argc > 1 ? argv[1] :
        "D:/work/autobusi-punjaci/pre-hw-dev-tricore/build/manual/jezgro-tricore.elf";

    printf("=== TC397XP ELF Loader Test ===\n\n");
    printf("Loading: %s\n\n", elf_path);

    /* Create memory system */
    mem_system_t *mem = mem_create();
    if (!mem) {
        fprintf(stderr, "Failed to create memory system\n");
        return 1;
    }

    /* Load ELF */
    elf_load_info_t info;
    elf_result_t result = elf_load_file(elf_path, mem, &info);

    printf("\n=== Load Result ===\n");
    printf("Status: %s\n", elf_strerror(result));

    if (result == ELF_OK) {
        printf("Entry Point: 0x%08X\n", info.entry_point);
        printf("Segments:    %u\n", info.num_segments);
        printf("Total Bytes: %u\n", info.total_loaded);

        if (info.has_bss) {
            printf("BSS:         0x%08X - 0x%08X (%u bytes)\n",
                   info.bss_start, info.bss_start + info.bss_size, info.bss_size);
        }

        /* Check BMH at 0x80000000 */
        printf("\n=== Boot Mode Header @ 0x80000000 ===\n");
        uint32_t bmh0 = mem_read32(mem, 0x80000000);
        uint32_t bmh1 = mem_read32(mem, 0x80000004);
        uint32_t bmh2 = mem_read32(mem, 0x80000008);
        uint32_t bmh3 = mem_read32(mem, 0x8000000C);

        uint16_t bmi = bmh0 & 0xFFFF;
        uint16_t bmhdid = (bmh0 >> 16) & 0xFFFF;
        uint32_t stad = bmh1;

        printf("BMI:     0x%04X %s\n", bmi, bmi == 0x00FE ? "(Internal flash start)" : "");
        printf("BMHDID:  0x%04X %s\n", bmhdid, bmhdid == 0xB359 ? "(Valid header)" : "(INVALID!)");
        printf("STAD:    0x%08X\n", stad);
        printf("CRC:     0x%08X\n", bmh2);
        printf("CRC_INV: 0x%08X\n", bmh3);

        /* Check startup code at entry point */
        printf("\n=== Startup Code @ 0x%08X ===\n", info.entry_point);
        for (int i = 0; i < 4; i++) {
            uint32_t addr = info.entry_point + i * 4;
            uint32_t insn = mem_read32(mem, addr);
            printf("0x%08X: %08X\n", addr, insn);
        }

        /* Validate entry point */
        if (info.entry_point == stad) {
            printf("\n✓ Entry point matches BMH STAD\n");
        } else if (stad != 0 && stad != 0xFFFFFFFF) {
            printf("\n! Entry point (0x%08X) differs from BMH STAD (0x%08X)\n",
                   info.entry_point, stad);
        }

        printf("\n=== SUCCESS ===\n");
    } else {
        printf("\n=== FAILED ===\n");
    }

    mem_destroy(mem);
    return result == ELF_OK ? 0 : 1;
}
