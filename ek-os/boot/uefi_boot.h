/**
 * @file uefi_boot.h
 * @brief Minimal UEFI definitions for EK-OS bootloader
 *
 * This provides just enough UEFI definitions to boot without
 * requiring the full gnu-efi or EDK2 libraries.
 */

#ifndef EK_OS_UEFI_BOOT_H
#define EK_OS_UEFI_BOOT_H

#include <stdint.h>
#include <stddef.h>

/* UEFI calling convention for x86_64 */
#define EFIAPI __attribute__((ms_abi))

/* Basic UEFI types */
typedef uint64_t UINTN;
typedef int64_t  INTN;
typedef uint64_t EFI_STATUS;
typedef void*    EFI_HANDLE;
typedef void*    EFI_EVENT;
typedef uint16_t CHAR16;
typedef uint8_t  BOOLEAN;

/* UEFI GUID */
typedef struct {
    uint32_t Data1;
    uint16_t Data2;
    uint16_t Data3;
    uint8_t  Data4[8];
} EFI_GUID;

/* Status codes */
#define EFI_SUCCESS             0
#define EFI_ERROR               0x8000000000000000ULL
#define EFI_INVALID_PARAMETER   (EFI_ERROR | 2)
#define EFI_UNSUPPORTED         (EFI_ERROR | 3)
#define EFI_NOT_FOUND           (EFI_ERROR | 14)

/* Memory types */
typedef enum {
    EfiReservedMemoryType,
    EfiLoaderCode,
    EfiLoaderData,
    EfiBootServicesCode,
    EfiBootServicesData,
    EfiRuntimeServicesCode,
    EfiRuntimeServicesData,
    EfiConventionalMemory,
    EfiUnusableMemory,
    EfiACPIReclaimMemory,
    EfiACPIMemoryNVS,
    EfiMemoryMappedIO,
    EfiMemoryMappedIOPortSpace,
    EfiPalCode,
    EfiPersistentMemory,
    EfiMaxMemoryType
} EFI_MEMORY_TYPE;

/* Memory descriptor */
typedef struct {
    uint32_t Type;
    uint64_t PhysicalStart;
    uint64_t VirtualStart;
    uint64_t NumberOfPages;
    uint64_t Attribute;
} EFI_MEMORY_DESCRIPTOR;

/* Table header */
typedef struct {
    uint64_t Signature;
    uint32_t Revision;
    uint32_t HeaderSize;
    uint32_t CRC32;
    uint32_t Reserved;
} EFI_TABLE_HEADER;

/* Simple Text Output Protocol */
typedef struct EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL;

typedef EFI_STATUS (EFIAPI *EFI_TEXT_STRING)(
    EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL *This,
    CHAR16 *String
);

typedef EFI_STATUS (EFIAPI *EFI_TEXT_CLEAR_SCREEN)(
    EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL *This
);

struct EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL {
    void *Reset;
    EFI_TEXT_STRING OutputString;
    void *TestString;
    void *QueryMode;
    void *SetMode;
    void *SetAttribute;
    EFI_TEXT_CLEAR_SCREEN ClearScreen;
    void *SetCursorPosition;
    void *EnableCursor;
    void *Mode;
};

/* Boot Services */
typedef struct {
    EFI_TABLE_HEADER Hdr;
    void *RaiseTPL;
    void *RestoreTPL;
    void *AllocatePages;
    void *FreePages;
    EFI_STATUS (EFIAPI *GetMemoryMap)(
        UINTN *MemoryMapSize,
        EFI_MEMORY_DESCRIPTOR *MemoryMap,
        UINTN *MapKey,
        UINTN *DescriptorSize,
        uint32_t *DescriptorVersion
    );
    void *AllocatePool;
    void *FreePool;
    void *CreateEvent;
    void *SetTimer;
    void *WaitForEvent;
    void *SignalEvent;
    void *CloseEvent;
    void *CheckEvent;
    void *InstallProtocolInterface;
    void *ReinstallProtocolInterface;
    void *UninstallProtocolInterface;
    void *HandleProtocol;
    void *Reserved;
    void *RegisterProtocolNotify;
    void *LocateHandle;
    void *LocateDevicePath;
    void *InstallConfigurationTable;
    void *LoadImage;
    void *StartImage;
    void *Exit;
    void *UnloadImage;
    EFI_STATUS (EFIAPI *ExitBootServices)(
        EFI_HANDLE ImageHandle,
        UINTN MapKey
    );
    void *GetNextMonotonicCount;
    void *Stall;
    void *SetWatchdogTimer;
    /* ... more functions not needed */
} EFI_BOOT_SERVICES;

/* Configuration Table */
typedef struct {
    EFI_GUID VendorGuid;
    void *VendorTable;
} EFI_CONFIGURATION_TABLE;

/* System Table */
typedef struct {
    EFI_TABLE_HEADER Hdr;
    CHAR16 *FirmwareVendor;
    uint32_t FirmwareRevision;
    EFI_HANDLE ConsoleInHandle;
    void *ConIn;
    EFI_HANDLE ConsoleOutHandle;
    EFI_SIMPLE_TEXT_OUTPUT_PROTOCOL *ConOut;
    EFI_HANDLE StandardErrorHandle;
    void *StdErr;
    void *RuntimeServices;
    EFI_BOOT_SERVICES *BootServices;
    UINTN NumberOfTableEntries;
    EFI_CONFIGURATION_TABLE *ConfigurationTable;
} EFI_SYSTEM_TABLE;

/* Known GUIDs */
#define EFI_ACPI_20_TABLE_GUID \
    { 0x8868e871, 0xe4f1, 0x11d3, { 0xbc, 0x22, 0x00, 0x80, 0xc7, 0x3c, 0x88, 0x81 } }

#define EFI_ACPI_TABLE_GUID \
    { 0xeb9d2d30, 0x2d88, 0x11d3, { 0x9a, 0x16, 0x00, 0x90, 0x27, 0x3f, 0xc1, 0x4d } }

/* Boot info passed to kernel */
typedef struct {
    uint64_t magic;                     /* 0x454B4F53 "EKOS" */
    uint64_t memory_map;                /* Physical address of memory map */
    uint64_t memory_map_size;
    uint64_t memory_map_desc_size;
    uint64_t acpi_rsdp;                 /* ACPI RSDP address */
    uint64_t framebuffer_addr;          /* Framebuffer (if GOP used) */
    uint32_t framebuffer_width;
    uint32_t framebuffer_height;
    uint32_t framebuffer_pitch;
} __attribute__((packed)) ek_boot_info_t;

#define EK_BOOT_MAGIC 0x454B4F53ULL

#endif /* EK_OS_UEFI_BOOT_H */
