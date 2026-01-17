/**
 * @file elf_loader.c
 * @brief ELF32 Loader Implementation for TriCore TC397XP Emulator
 *
 * Parses and loads ELF32 executables for the TriCore architecture.
 */

#include "elf_loader.h"
#include "tricore_exec.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* External memory functions */
extern int mem_load_binary(mem_system_t *mem, uint32_t addr, const uint8_t *data, size_t size);

/* ==========================================================================
 * Internal Helpers
 * ========================================================================== */

/**
 * @brief Read 16-bit little-endian value from buffer
 */
static inline uint16_t read_le16(const uint8_t *p)
{
    return (uint16_t)p[0] | ((uint16_t)p[1] << 8);
}

/**
 * @brief Read 32-bit little-endian value from buffer
 */
static inline uint32_t read_le32(const uint8_t *p)
{
    return (uint32_t)p[0] |
           ((uint32_t)p[1] << 8) |
           ((uint32_t)p[2] << 16) |
           ((uint32_t)p[3] << 24);
}

/**
 * @brief Parse ELF32 header from buffer
 */
static elf_result_t parse_elf_header(const uint8_t *data, size_t size, Elf32_Ehdr *hdr)
{
    if (size < sizeof(Elf32_Ehdr)) {
        return ELF_ERROR_BAD_HEADER;
    }

    /* Parse e_ident */
    memcpy(hdr->e_ident, data, EI_NIDENT);

    /* Check magic number */
    if (hdr->e_ident[EI_MAG0] != ELFMAG0 ||
        hdr->e_ident[EI_MAG1] != ELFMAG1 ||
        hdr->e_ident[EI_MAG2] != ELFMAG2 ||
        hdr->e_ident[EI_MAG3] != ELFMAG3) {
        return ELF_ERROR_NOT_ELF;
    }

    /* Check class (must be 32-bit) */
    if (hdr->e_ident[EI_CLASS] != ELFCLASS32) {
        return ELF_ERROR_NOT_ELF32;
    }

    /* Check endianness (TriCore is little-endian) */
    if (hdr->e_ident[EI_DATA] != ELFDATA2LSB) {
        return ELF_ERROR_NOT_LITTLE_ENDIAN;
    }

    /* Parse rest of header (little-endian) */
    const uint8_t *p = data + EI_NIDENT;
    hdr->e_type      = read_le16(p); p += 2;
    hdr->e_machine   = read_le16(p); p += 2;
    hdr->e_version   = read_le32(p); p += 4;
    hdr->e_entry     = read_le32(p); p += 4;
    hdr->e_phoff     = read_le32(p); p += 4;
    hdr->e_shoff     = read_le32(p); p += 4;
    hdr->e_flags     = read_le32(p); p += 4;
    hdr->e_ehsize    = read_le16(p); p += 2;
    hdr->e_phentsize = read_le16(p); p += 2;
    hdr->e_phnum     = read_le16(p); p += 2;
    hdr->e_shentsize = read_le16(p); p += 2;
    hdr->e_shnum     = read_le16(p); p += 2;
    hdr->e_shstrndx  = read_le16(p);

    /* Check machine type (TriCore = 44) */
    if (hdr->e_machine != EM_TRICORE) {
        return ELF_ERROR_NOT_TRICORE;
    }

    /* Check type (must be executable) */
    if (hdr->e_type != ET_EXEC) {
        return ELF_ERROR_NOT_EXECUTABLE;
    }

    return ELF_OK;
}

/**
 * @brief Parse program header from buffer
 */
static void parse_phdr(const uint8_t *data, Elf32_Phdr *phdr)
{
    phdr->p_type   = read_le32(data + 0);
    phdr->p_offset = read_le32(data + 4);
    phdr->p_vaddr  = read_le32(data + 8);
    phdr->p_paddr  = read_le32(data + 12);
    phdr->p_filesz = read_le32(data + 16);
    phdr->p_memsz  = read_le32(data + 20);
    phdr->p_flags  = read_le32(data + 24);
    phdr->p_align  = read_le32(data + 28);
}

/**
 * @brief Find section by name in ELF section headers
 *
 * Searches for a named section (e.g., ".bmhd_0") and returns its info.
 * Used to work around toolchain bugs where program headers have wrong offsets.
 *
 * @param data ELF file data
 * @param size ELF file size
 * @param name Section name to find
 * @param addr Output: section virtual address
 * @param sec_size Output: section size
 * @param offset Output: section file offset
 * @return true if section found, false otherwise
 */
static bool find_section_by_name(const uint8_t *data, size_t size, const char *name,
                                  uint32_t *addr, uint32_t *sec_size, uint32_t *offset)
{
    Elf32_Ehdr hdr;
    if (parse_elf_header(data, size, &hdr) != ELF_OK) {
        return false;
    }

    if (hdr.e_shoff == 0 || hdr.e_shnum == 0) {
        return false;
    }

    /* Get section header string table */
    if (hdr.e_shstrndx == 0 || hdr.e_shstrndx >= hdr.e_shnum) {
        return false;
    }

    const uint8_t *shstrtab_shdr = data + hdr.e_shoff + hdr.e_shstrndx * hdr.e_shentsize;
    uint32_t shstrtab_offset = read_le32(shstrtab_shdr + 16);
    uint32_t shstrtab_size = read_le32(shstrtab_shdr + 20);

    /* Search sections */
    for (uint16_t i = 0; i < hdr.e_shnum; i++) {
        const uint8_t *shdr = data + hdr.e_shoff + i * hdr.e_shentsize;
        uint32_t sh_name = read_le32(shdr + 0);

        if (sh_name == 0 || sh_name >= shstrtab_size) {
            continue;
        }

        const char *sec_name = (const char *)(data + shstrtab_offset + sh_name);
        if (strcmp(sec_name, name) == 0) {
            *addr = read_le32(shdr + 12);      /* sh_addr */
            *sec_size = read_le32(shdr + 20);  /* sh_size */
            *offset = read_le32(shdr + 16);    /* sh_offset */
            return true;
        }
    }

    return false;
}

/**
 * @brief Find symbol by name in ELF symbol table
 *
 * Searches for a named symbol (e.g., "_start") in the ELF file's symbol table.
 * This is useful when the ELF entry point is incorrect or points to BMH.
 *
 * @param data ELF file data
 * @param size ELF file size
 * @param name Symbol name to find
 * @param value Output: symbol value (address)
 * @return true if symbol found, false otherwise
 */
static bool find_symbol(const uint8_t *data, size_t size, const char *name, uint32_t *value)
{
    Elf32_Ehdr hdr;
    if (parse_elf_header(data, size, &hdr) != ELF_OK) {
        return false;
    }

    if (hdr.e_shoff == 0 || hdr.e_shnum == 0) {
        return false;  /* No section headers */
    }

    /* Find .symtab and .strtab sections */
    uint32_t symtab_offset = 0, symtab_size = 0, symtab_entsize = 0;
    uint32_t strtab_offset = 0, strtab_size = 0;
    uint32_t shstrtab_offset = 0;

    /* First, get section header string table */
    if (hdr.e_shstrndx != 0 && hdr.e_shstrndx < hdr.e_shnum) {
        const uint8_t *shstrtab_shdr = data + hdr.e_shoff + hdr.e_shstrndx * hdr.e_shentsize;
        shstrtab_offset = read_le32(shstrtab_shdr + 16);  /* sh_offset */
    }

    /* Search for .symtab and .strtab */
    for (uint16_t i = 0; i < hdr.e_shnum; i++) {
        const uint8_t *shdr = data + hdr.e_shoff + i * hdr.e_shentsize;
        uint32_t sh_name = read_le32(shdr + 0);
        uint32_t sh_type = read_le32(shdr + 4);
        uint32_t sh_offset = read_le32(shdr + 16);
        uint32_t sh_size = read_le32(shdr + 20);
        uint32_t sh_entsize = read_le32(shdr + 36);

        /* Get section name */
        const char *sec_name = "";
        if (shstrtab_offset && sh_name < size - shstrtab_offset) {
            sec_name = (const char *)(data + shstrtab_offset + sh_name);
        }

        if (sh_type == 2 /* SHT_SYMTAB */) {
            symtab_offset = sh_offset;
            symtab_size = sh_size;
            symtab_entsize = sh_entsize ? sh_entsize : 16;

            /* Link field points to string table section */
            uint32_t sh_link = read_le32(shdr + 24);
            if (sh_link < hdr.e_shnum) {
                const uint8_t *strtab_shdr = data + hdr.e_shoff + sh_link * hdr.e_shentsize;
                strtab_offset = read_le32(strtab_shdr + 16);
                strtab_size = read_le32(strtab_shdr + 20);
            }
            break;
        }
    }

    if (symtab_offset == 0 || strtab_offset == 0) {
        return false;  /* No symbol table found */
    }

    /* Search symbols */
    uint32_t num_symbols = symtab_size / symtab_entsize;
    for (uint32_t i = 0; i < num_symbols; i++) {
        const uint8_t *sym = data + symtab_offset + i * symtab_entsize;
        uint32_t st_name = read_le32(sym + 0);
        uint32_t st_value = read_le32(sym + 4);
        /* uint32_t st_size = read_le32(sym + 8); */
        /* uint8_t st_info = sym[12]; */

        if (st_name == 0 || st_name >= strtab_size) {
            continue;
        }

        const char *sym_name = (const char *)(data + strtab_offset + st_name);
        if (strcmp(sym_name, name) == 0) {
            *value = st_value;
            return true;
        }
    }

    return false;
}

/**
 * @brief Check if address is in a loadable region
 */
static bool is_valid_load_addr(uint32_t addr, uint32_t size)
{
    /* Program Flash: 0x80000000 - 0x80FFFFFF */
    if (addr >= 0x80000000 && addr + size <= 0x81000000) {
        return true;
    }

    /* Data Flash: 0xAF000000 */
    if (addr >= 0xAF000000 && addr + size <= 0xAF120000) {
        return true;
    }

    /* LMU: 0x90000000 */
    if (addr >= 0x90000000 && addr + size <= 0x900C0000) {
        return true;
    }

    /* EMEM: 0x99000000 */
    if (addr >= 0x99000000 && addr + size <= 0x99400000) {
        return true;
    }

    /* Local DSPR: 0x70000000 */
    if (addr >= 0x70000000 && addr + size <= 0x7003C000) {
        return true;
    }

    /* Local PSPR: 0x70100000 */
    if (addr >= 0x70100000 && addr + size <= 0x70110000) {
        return true;
    }

    /* All DSPR regions (CPU0-5): 240KB for CPU0-2, 96KB for CPU3-5 */
    uint32_t dspr_bases[] = {0x70000000, 0x60000000, 0x50000000,
                             0x40000000, 0x30000000, 0x10000000};
    uint32_t dspr_sizes[] = {0x3C000, 0x3C000, 0x3C000,  /* 240 KB */
                             0x18000, 0x18000, 0x18000}; /* 96 KB */
    for (int i = 0; i < 6; i++) {
        if (addr >= dspr_bases[i] && addr + size <= dspr_bases[i] + dspr_sizes[i]) {
            return true;
        }
    }

    /* All PSPR regions (CPU0-5): 64KB each */
    uint32_t pspr_bases[] = {0x70100000, 0x60100000, 0x50100000,
                             0x40100000, 0x30100000, 0x10100000};
    for (int i = 0; i < 6; i++) {
        if (addr >= pspr_bases[i] && addr + size <= pspr_bases[i] + 0x10000) {
            return true;
        }
    }

    return false;
}

/* ==========================================================================
 * Public API Implementation
 * ========================================================================== */

elf_result_t elf_validate(const uint8_t *data, size_t size)
{
    if (!data) {
        return ELF_ERROR_NULL_PARAM;
    }

    Elf32_Ehdr hdr;
    return parse_elf_header(data, size, &hdr);
}

elf_result_t elf_load_buffer(const uint8_t *data, size_t size, mem_system_t *mem, elf_load_info_t *info)
{
    if (!data || !mem) {
        return ELF_ERROR_NULL_PARAM;
    }

    /* Parse ELF header */
    Elf32_Ehdr hdr;
    elf_result_t result = parse_elf_header(data, size, &hdr);
    if (result != ELF_OK) {
        return result;
    }

    /* Initialize load info */
    elf_load_info_t local_info;
    elf_load_info_t *pinfo = info ? info : &local_info;
    memset(pinfo, 0, sizeof(*pinfo));
    pinfo->entry_point = hdr.e_entry;

    /* Validate program header table location */
    if (hdr.e_phoff == 0 || hdr.e_phnum == 0) {
        return ELF_ERROR_BAD_HEADER;
    }

    if (hdr.e_phoff + hdr.e_phnum * hdr.e_phentsize > size) {
        return ELF_ERROR_BAD_HEADER;
    }

    /* Process each program header */
    for (uint16_t i = 0; i < hdr.e_phnum; i++) {
        const uint8_t *phdr_data = data + hdr.e_phoff + i * hdr.e_phentsize;
        Elf32_Phdr phdr;
        parse_phdr(phdr_data, &phdr);

        /* Debug: show all segments */
        fprintf(stderr, "ELF: Segment %d: type=%d vaddr=0x%08X filesz=0x%X memsz=0x%X\n",
                i, phdr.p_type, phdr.p_vaddr, phdr.p_filesz, phdr.p_memsz);

        /* Only process loadable segments */
        if (phdr.p_type != PT_LOAD) {
            continue;
        }

        /* Validate segment */
        if (phdr.p_filesz > 0 && phdr.p_offset + phdr.p_filesz > size) {
            return ELF_ERROR_INVALID_SEGMENT;
        }

        if (!is_valid_load_addr(phdr.p_vaddr, phdr.p_memsz)) {
            /*
             * Special case: Handle potential address wrap-around for startup code.
             * Some toolchains might generate addresses like 0x7FFFFD00 which is
             * actually meant to be near 0x80000000 (just 0x300 bytes below).
             * Try mapping it to the correct PFLASH location.
             */
            if (phdr.p_vaddr >= 0x7FFF0000 && phdr.p_vaddr < 0x80000000) {
                /*
                 * TOOLCHAIN BUG WORKAROUND:
                 * tricore-elf-gcc may produce segments at addresses like 0x7FFFFD00
                 * due to signed vs unsigned address calculation issues.
                 * 0x7FFFFD00 = 0x80000000 - 0x300 (likely startup code)
                 *
                 * We compute the intended address by calculating the "negative offset"
                 * from 0x80000000 and then placing it at that offset within PFLASH.
                 * For most cases, this means the startup code goes to 0x80000000.
                 */
                uint32_t negative_offset = 0x80000000 - phdr.p_vaddr;
                uint32_t adjusted_addr;

                if (negative_offset <= 0x1000) {
                    /* Small offset - likely startup code, place at PFLASH start */
                    adjusted_addr = 0x80000000;
                } else {
                    /* Larger offset - try to preserve relative position */
                    adjusted_addr = 0x80000000;
                }

                fprintf(stderr, "ELF: TOOLCHAIN BUG WORKAROUND: segment at 0x%08X (offset -0x%X from PFLASH)\n",
                        phdr.p_vaddr, negative_offset);
                fprintf(stderr, "ELF: Remapping to 0x%08X (size 0x%X)\n", adjusted_addr, phdr.p_memsz);

                /*
                 * Handle the buggy segment:
                 * Check if the file offset is 0 or points to ELF header.
                 * If offset is 0, the segment data would be the ELF header itself,
                 * which is clearly wrong. In this case, we need to find the actual
                 * section data from section headers.
                 *
                 * For BMH segment specifically, we'll look up .bmhd_0 section.
                 */
                if (phdr.p_filesz > 0) {
                    /* Skip segments with offset 0 - they're malformed */
                    if (phdr.p_offset == 0) {
                        fprintf(stderr, "ELF: Skipping segment with offset=0 (toolchain bug - would load ELF header)\n");

                        /* For BMH, try to find .bmhd_0 section and load it correctly */
                        uint32_t bmhd_addr, bmhd_size, bmhd_offset;
                        if (find_section_by_name(data, size, ".bmhd_0", &bmhd_addr, &bmhd_size, &bmhd_offset)) {
                            fprintf(stderr, "ELF: Found .bmhd_0 section at file offset 0x%X, loading to 0x%08X\n",
                                    bmhd_offset, bmhd_addr);
                            const uint8_t *section_data = data + bmhd_offset;
                            if (mem_load_binary(mem, bmhd_addr, section_data, bmhd_size) == 0) {
                                pinfo->total_loaded += bmhd_size;
                            }
                        }
                        continue;
                    }

                    const uint8_t *segment_data = data + phdr.p_offset;
                    if (mem_load_binary(mem, adjusted_addr, segment_data, phdr.p_filesz) != 0) {
                        fprintf(stderr, "ELF: Failed to load segment at 0x%08X\n", adjusted_addr);
                        return ELF_ERROR_SEGMENT_LOAD;
                    }
                    pinfo->total_loaded += phdr.p_filesz;
                }
                continue;
            }

            /* Skip segments outside valid memory regions with warning */
            fprintf(stderr, "ELF: Skipping segment at 0x%08X (size 0x%X) - outside TC397 memory map\n",
                    phdr.p_vaddr, phdr.p_memsz);
            continue;
        }

        /* Load segment data (file portion) */
        if (phdr.p_filesz > 0) {
            const uint8_t *segment_data = data + phdr.p_offset;
            if (mem_load_binary(mem, phdr.p_vaddr, segment_data, phdr.p_filesz) != 0) {
                fprintf(stderr, "ELF: Failed to load segment at 0x%08X\n", phdr.p_vaddr);
                return ELF_ERROR_SEGMENT_LOAD;
            }
        }

        /* Handle BSS (memory size > file size) */
        if (phdr.p_memsz > phdr.p_filesz) {
            uint32_t bss_start = phdr.p_vaddr + phdr.p_filesz;
            uint32_t bss_size = phdr.p_memsz - phdr.p_filesz;

            /* Create zero buffer for BSS */
            uint8_t *zeros = calloc(1, bss_size);
            if (zeros) {
                mem_load_binary(mem, bss_start, zeros, bss_size);
                free(zeros);
            }

            /* Record BSS info (use last BSS section found) */
            pinfo->has_bss = true;
            pinfo->bss_start = bss_start;
            pinfo->bss_size = bss_size;
        }

        /* Record segment info */
        if (pinfo->num_segments < 16) {
            elf_segment_info_t *seg = &pinfo->segments[pinfo->num_segments];
            seg->vaddr = phdr.p_vaddr;
            seg->paddr = phdr.p_paddr;
            seg->memsz = phdr.p_memsz;
            seg->filesz = phdr.p_filesz;
            seg->flags = phdr.p_flags;
            pinfo->num_segments++;
        }

        pinfo->total_loaded += phdr.p_filesz;
    }

    /* Validate entry point - if it's not in any executable segment, use first exec segment */
    bool entry_in_exec = false;
    uint32_t first_exec_addr = 0;
    for (uint32_t i = 0; i < pinfo->num_segments; i++) {
        elf_segment_info_t *seg = &pinfo->segments[i];
        if (seg->flags & PF_X) {  /* Executable */
            if (first_exec_addr == 0) {
                first_exec_addr = seg->vaddr;
            }
            if (pinfo->entry_point >= seg->vaddr &&
                pinfo->entry_point < seg->vaddr + seg->memsz) {
                entry_in_exec = true;
                break;
            }
        }
    }

    /*
     * If entry point is BMH address (0x80000000 or 0xA0000000),
     * try to extract the real start address from the Boot Mode Header.
     *
     * TC39x Boot Mode Header format (first 32 bytes at PFLASH start):
     * Offset 0x00: BMI (Boot Mode Index) - 16 bits
     * Offset 0x02: BMHDID (Boot Mode Header ID) - 16 bits
     * Offset 0x04: STAD (Start Address) - 32 bits  <-- This is what we need
     * Offset 0x08: CRCBMHD (CRC) - 32 bits
     * ... etc
     */
    if ((pinfo->entry_point == 0x80000000 || pinfo->entry_point == 0xA0000000) && !entry_in_exec) {
        uint32_t bmh_stad = mem_read32(mem, 0x80000004);

        /* Validate STAD - should be a valid PFLASH or RAM address */
        if (bmh_stad != 0 && bmh_stad != 0xFFFFFFFF) {
            if ((bmh_stad >= 0x80000020 && bmh_stad < 0x90000000) ||  /* PFLASH */
                (bmh_stad >= 0x70000000 && bmh_stad < 0x71000000) ||  /* DSPR/PSPR CPU0 */
                (bmh_stad >= 0x90000000 && bmh_stad < 0x91000000)) {  /* LMU */
                fprintf(stderr, "ELF: Using STAD from BMH: 0x%08X\n", bmh_stad);
                pinfo->entry_point = bmh_stad;
                entry_in_exec = true;  /* Trust the BMH */
            }
        }
    }

    if (!entry_in_exec) {
        /*
         * Entry point seems invalid. Try multiple fallback strategies:
         * 1. Look for _start symbol in symbol table
         * 2. Look for _crt0_reset symbol
         * 3. Use first executable segment address
         */
        uint32_t start_sym = 0;

        if (find_symbol(data, size, "_start", &start_sym)) {
            fprintf(stderr, "ELF: Found _start symbol at 0x%08X\n", start_sym);
            pinfo->entry_point = start_sym;
        } else if (find_symbol(data, size, "_crt0_reset", &start_sym)) {
            fprintf(stderr, "ELF: Found _crt0_reset symbol at 0x%08X\n", start_sym);
            pinfo->entry_point = start_sym;
        } else if (find_symbol(data, size, "main", &start_sym)) {
            fprintf(stderr, "ELF: Found main symbol at 0x%08X (no startup code?)\n", start_sym);
            pinfo->entry_point = start_sym;
        } else if (first_exec_addr != 0) {
            fprintf(stderr, "ELF: No entry symbols found, using first exec segment at 0x%08X\n",
                    first_exec_addr);
            pinfo->entry_point = first_exec_addr;
        } else {
            fprintf(stderr, "ELF: WARNING: No valid entry point found!\n");
        }
    }

    /* Final validation - entry point must be in valid memory */
    if (pinfo->entry_point != 0 && !is_valid_load_addr(pinfo->entry_point, 4)) {
        fprintf(stderr, "ELF: WARNING: Entry point 0x%08X is outside valid memory regions\n",
                pinfo->entry_point);
    }

    fprintf(stderr, "ELF: Final entry point: 0x%08X, loaded %u bytes in %u segments\n",
            pinfo->entry_point, pinfo->total_loaded, pinfo->num_segments);

    return ELF_OK;
}

elf_result_t elf_load_file(const char *filename, mem_system_t *mem, elf_load_info_t *info)
{
    if (!filename || !mem) {
        return ELF_ERROR_NULL_PARAM;
    }

    /* Open file */
    FILE *fp = fopen(filename, "rb");
    if (!fp) {
        return ELF_ERROR_FILE_OPEN;
    }

    /* Get file size */
    fseek(fp, 0, SEEK_END);
    long file_size = ftell(fp);
    fseek(fp, 0, SEEK_SET);

    if (file_size <= 0) {
        fclose(fp);
        return ELF_ERROR_FILE_READ;
    }

    /* Allocate buffer */
    uint8_t *buffer = malloc((size_t)file_size);
    if (!buffer) {
        fclose(fp);
        return ELF_ERROR_MEMORY_ALLOC;
    }

    /* Read file */
    size_t bytes_read = fread(buffer, 1, (size_t)file_size, fp);
    fclose(fp);

    if (bytes_read != (size_t)file_size) {
        free(buffer);
        return ELF_ERROR_FILE_READ;
    }

    /* Load from buffer */
    elf_result_t result = elf_load_buffer(buffer, (size_t)file_size, mem, info);
    free(buffer);

    return result;
}

const char* elf_strerror(elf_result_t result)
{
    switch (result) {
        case ELF_OK:                    return "Success";
        case ELF_ERROR_NULL_PARAM:      return "NULL parameter";
        case ELF_ERROR_FILE_OPEN:       return "Cannot open file";
        case ELF_ERROR_FILE_READ:       return "File read error";
        case ELF_ERROR_NOT_ELF:         return "Not an ELF file (bad magic)";
        case ELF_ERROR_NOT_ELF32:       return "Not a 32-bit ELF";
        case ELF_ERROR_NOT_LITTLE_ENDIAN: return "Not little-endian";
        case ELF_ERROR_NOT_TRICORE:     return "Not TriCore architecture (expected EM_TRICORE=44)";
        case ELF_ERROR_NOT_EXECUTABLE:  return "Not an executable ELF (expected ET_EXEC)";
        case ELF_ERROR_BAD_HEADER:      return "Malformed ELF header";
        case ELF_ERROR_MEMORY_ALLOC:    return "Memory allocation failed";
        case ELF_ERROR_SEGMENT_LOAD:    return "Failed to load segment";
        case ELF_ERROR_INVALID_SEGMENT: return "Invalid segment address or size";
        default:                        return "Unknown error";
    }
}

void elf_print_info(const uint8_t *data, size_t size)
{
    if (!data || size < sizeof(Elf32_Ehdr)) {
        printf("ELF: Invalid data\n");
        return;
    }

    Elf32_Ehdr hdr;
    if (parse_elf_header(data, size, &hdr) != ELF_OK) {
        printf("ELF: Failed to parse header\n");
        return;
    }

    printf("=== ELF Header ===\n");
    printf("Class:        ELF32\n");
    printf("Data:         Little Endian\n");
    printf("Type:         %s (0x%04X)\n",
           hdr.e_type == ET_EXEC ? "Executable" :
           hdr.e_type == ET_REL ? "Relocatable" :
           hdr.e_type == ET_DYN ? "Shared Object" : "Unknown",
           hdr.e_type);
    printf("Machine:      TriCore (0x%04X)\n", hdr.e_machine);
    printf("Entry Point:  0x%08X\n", hdr.e_entry);
    printf("PH Offset:    0x%08X\n", hdr.e_phoff);
    printf("PH Entries:   %u\n", hdr.e_phnum);
    printf("SH Offset:    0x%08X\n", hdr.e_shoff);
    printf("SH Entries:   %u\n", hdr.e_shnum);
    printf("Flags:        0x%08X\n", hdr.e_flags);

    if (hdr.e_phnum > 0 && hdr.e_phoff + hdr.e_phnum * hdr.e_phentsize <= size) {
        printf("\n=== Program Headers ===\n");
        for (uint16_t i = 0; i < hdr.e_phnum; i++) {
            const uint8_t *phdr_data = data + hdr.e_phoff + i * hdr.e_phentsize;
            Elf32_Phdr phdr;
            parse_phdr(phdr_data, &phdr);

            const char *type_str = "UNKNOWN";
            switch (phdr.p_type) {
                case PT_NULL:    type_str = "NULL"; break;
                case PT_LOAD:    type_str = "LOAD"; break;
                case PT_DYNAMIC: type_str = "DYNAMIC"; break;
                case PT_INTERP:  type_str = "INTERP"; break;
                case PT_NOTE:    type_str = "NOTE"; break;
                case PT_PHDR:    type_str = "PHDR"; break;
            }

            printf("[%2u] %-8s VAddr=0x%08X PAddr=0x%08X FileSz=0x%06X MemSz=0x%06X %c%c%c\n",
                   i, type_str,
                   phdr.p_vaddr, phdr.p_paddr,
                   phdr.p_filesz, phdr.p_memsz,
                   (phdr.p_flags & PF_R) ? 'R' : '-',
                   (phdr.p_flags & PF_W) ? 'W' : '-',
                   (phdr.p_flags & PF_X) ? 'X' : '-');
        }
    }
}
