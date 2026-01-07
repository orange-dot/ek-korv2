/**
 * @file elf_loader.h
 * @brief ELF32 Loader for TriCore TC397XP Emulator
 *
 * Loads ELF32 executables into emulator memory.
 * TriCore uses 32-bit little-endian ELF format.
 */

#ifndef ELF_LOADER_H
#define ELF_LOADER_H

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Forward declaration */
typedef struct mem_system mem_system_t;

/* ==========================================================================
 * ELF32 Constants
 * ========================================================================== */

/* ELF identification indices */
#define EI_MAG0         0       /**< Magic number byte 0 */
#define EI_MAG1         1       /**< Magic number byte 1 */
#define EI_MAG2         2       /**< Magic number byte 2 */
#define EI_MAG3         3       /**< Magic number byte 3 */
#define EI_CLASS        4       /**< File class */
#define EI_DATA         5       /**< Data encoding */
#define EI_VERSION      6       /**< ELF version */
#define EI_OSABI        7       /**< OS/ABI identification */
#define EI_ABIVERSION   8       /**< ABI version */
#define EI_NIDENT       16      /**< Size of e_ident[] */

/* ELF magic number */
#define ELFMAG0         0x7F
#define ELFMAG1         'E'
#define ELFMAG2         'L'
#define ELFMAG3         'F'

/* ELF class values */
#define ELFCLASSNONE    0       /**< Invalid class */
#define ELFCLASS32      1       /**< 32-bit objects */
#define ELFCLASS64      2       /**< 64-bit objects */

/* Data encoding */
#define ELFDATANONE     0       /**< Invalid data encoding */
#define ELFDATA2LSB     1       /**< Little endian */
#define ELFDATA2MSB     2       /**< Big endian */

/* ELF type values */
#define ET_NONE         0       /**< No file type */
#define ET_REL          1       /**< Relocatable file */
#define ET_EXEC         2       /**< Executable file */
#define ET_DYN          3       /**< Shared object file */
#define ET_CORE         4       /**< Core file */

/* ELF machine types */
#define EM_TRICORE      44      /**< TriCore architecture */

/* Program header types */
#define PT_NULL         0       /**< Unused entry */
#define PT_LOAD         1       /**< Loadable segment */
#define PT_DYNAMIC      2       /**< Dynamic linking info */
#define PT_INTERP       3       /**< Interpreter path */
#define PT_NOTE         4       /**< Auxiliary information */
#define PT_SHLIB        5       /**< Reserved */
#define PT_PHDR         6       /**< Program header table */

/* Program header flags */
#define PF_X            0x1     /**< Execute permission */
#define PF_W            0x2     /**< Write permission */
#define PF_R            0x4     /**< Read permission */

/* Section header types */
#define SHT_NULL        0       /**< Inactive section */
#define SHT_PROGBITS    1       /**< Program-defined information */
#define SHT_SYMTAB      2       /**< Symbol table */
#define SHT_STRTAB      3       /**< String table */
#define SHT_NOBITS      8       /**< No data (BSS) */

/* Section header flags */
#define SHF_WRITE       0x1     /**< Writable section */
#define SHF_ALLOC       0x2     /**< Occupies memory at runtime */
#define SHF_EXECINSTR   0x4     /**< Executable section */

/* ==========================================================================
 * ELF32 Structures
 * ========================================================================== */

/**
 * @brief ELF32 file header
 */
typedef struct {
    uint8_t     e_ident[EI_NIDENT]; /**< ELF identification */
    uint16_t    e_type;             /**< Object file type */
    uint16_t    e_machine;          /**< Architecture */
    uint32_t    e_version;          /**< Object file version */
    uint32_t    e_entry;            /**< Entry point address */
    uint32_t    e_phoff;            /**< Program header table offset */
    uint32_t    e_shoff;            /**< Section header table offset */
    uint32_t    e_flags;            /**< Processor-specific flags */
    uint16_t    e_ehsize;           /**< ELF header size */
    uint16_t    e_phentsize;        /**< Program header entry size */
    uint16_t    e_phnum;            /**< Number of program headers */
    uint16_t    e_shentsize;        /**< Section header entry size */
    uint16_t    e_shnum;            /**< Number of section headers */
    uint16_t    e_shstrndx;         /**< Section name string table index */
} Elf32_Ehdr;

/**
 * @brief ELF32 program header
 */
typedef struct {
    uint32_t    p_type;     /**< Segment type */
    uint32_t    p_offset;   /**< Segment file offset */
    uint32_t    p_vaddr;    /**< Segment virtual address */
    uint32_t    p_paddr;    /**< Segment physical address */
    uint32_t    p_filesz;   /**< Segment size in file */
    uint32_t    p_memsz;    /**< Segment size in memory */
    uint32_t    p_flags;    /**< Segment flags */
    uint32_t    p_align;    /**< Segment alignment */
} Elf32_Phdr;

/**
 * @brief ELF32 section header
 */
typedef struct {
    uint32_t    sh_name;        /**< Section name (string table index) */
    uint32_t    sh_type;        /**< Section type */
    uint32_t    sh_flags;       /**< Section flags */
    uint32_t    sh_addr;        /**< Section virtual address */
    uint32_t    sh_offset;      /**< Section file offset */
    uint32_t    sh_size;        /**< Section size */
    uint32_t    sh_link;        /**< Link to another section */
    uint32_t    sh_info;        /**< Additional section info */
    uint32_t    sh_addralign;   /**< Section alignment */
    uint32_t    sh_entsize;     /**< Entry size if section has table */
} Elf32_Shdr;

/**
 * @brief ELF32 symbol table entry
 */
typedef struct {
    uint32_t    st_name;    /**< Symbol name (string table index) */
    uint32_t    st_value;   /**< Symbol value */
    uint32_t    st_size;    /**< Symbol size */
    uint8_t     st_info;    /**< Symbol type and binding */
    uint8_t     st_other;   /**< Symbol visibility */
    uint16_t    st_shndx;   /**< Section index */
} Elf32_Sym;

/* ==========================================================================
 * Loader Result Codes
 * ========================================================================== */

typedef enum {
    ELF_OK = 0,                     /**< Success */
    ELF_ERROR_NULL_PARAM,           /**< NULL parameter passed */
    ELF_ERROR_FILE_OPEN,            /**< Cannot open file */
    ELF_ERROR_FILE_READ,            /**< File read error */
    ELF_ERROR_NOT_ELF,              /**< Not an ELF file (bad magic) */
    ELF_ERROR_NOT_ELF32,            /**< Not a 32-bit ELF */
    ELF_ERROR_NOT_LITTLE_ENDIAN,    /**< Not little-endian */
    ELF_ERROR_NOT_TRICORE,          /**< Not TriCore architecture */
    ELF_ERROR_NOT_EXECUTABLE,       /**< Not an executable ELF */
    ELF_ERROR_BAD_HEADER,           /**< Malformed ELF header */
    ELF_ERROR_MEMORY_ALLOC,         /**< Memory allocation failed */
    ELF_ERROR_SEGMENT_LOAD,         /**< Failed to load segment */
    ELF_ERROR_INVALID_SEGMENT,      /**< Invalid segment address/size */
} elf_result_t;

/* ==========================================================================
 * ELF Load Information
 * ========================================================================== */

/**
 * @brief Loaded segment information
 */
typedef struct {
    uint32_t    vaddr;      /**< Virtual address */
    uint32_t    paddr;      /**< Physical address */
    uint32_t    memsz;      /**< Size in memory */
    uint32_t    filesz;     /**< Size in file */
    uint32_t    flags;      /**< Segment flags (PF_*) */
} elf_segment_info_t;

/**
 * @brief ELF load result information
 */
typedef struct {
    uint32_t            entry_point;    /**< Program entry point */
    uint32_t            num_segments;   /**< Number of loaded segments */
    elf_segment_info_t  segments[16];   /**< Loaded segment info (max 16) */
    uint32_t            total_loaded;   /**< Total bytes loaded */
    bool                has_bss;        /**< BSS section present */
    uint32_t            bss_start;      /**< BSS start address */
    uint32_t            bss_size;       /**< BSS size */
} elf_load_info_t;

/* ==========================================================================
 * ELF Loader API
 * ========================================================================== */

/**
 * @brief Load an ELF file into emulator memory
 *
 * @param filename  Path to ELF file
 * @param mem       Memory system to load into
 * @param info      Output load information (can be NULL)
 * @return          ELF_OK on success, error code otherwise
 *
 * Loads all PT_LOAD segments from the ELF file into the appropriate
 * memory regions. Supports:
 * - Program Flash (0x80000000)
 * - Data Flash (0xAF000000)
 * - LMU (0x90000000)
 * - DSPR (0x70000000 local, or global core addresses)
 * - EMEM (0x99000000)
 */
elf_result_t elf_load_file(const char *filename, mem_system_t *mem, elf_load_info_t *info);

/**
 * @brief Load an ELF from memory buffer
 *
 * @param data      Pointer to ELF data in memory
 * @param size      Size of ELF data
 * @param mem       Memory system to load into
 * @param info      Output load information (can be NULL)
 * @return          ELF_OK on success, error code otherwise
 */
elf_result_t elf_load_buffer(const uint8_t *data, size_t size, mem_system_t *mem, elf_load_info_t *info);

/**
 * @brief Validate ELF header without loading
 *
 * @param data      Pointer to ELF data
 * @param size      Size of data buffer
 * @return          ELF_OK if valid TriCore ELF, error code otherwise
 */
elf_result_t elf_validate(const uint8_t *data, size_t size);

/**
 * @brief Get human-readable error message
 *
 * @param result    Error code from elf_load_*
 * @return          Static error message string
 */
const char* elf_strerror(elf_result_t result);

/**
 * @brief Print ELF header information (for debugging)
 *
 * @param data      Pointer to ELF data
 * @param size      Size of data buffer
 */
void elf_print_info(const uint8_t *data, size_t size);

#ifdef __cplusplus
}
#endif

#endif /* ELF_LOADER_H */
