/**
 * @file uefi_entry.c
 * @brief UEFI bootloader for EK-OS
 *
 * This is a minimal UEFI application that:
 * 1. Prints boot message
 * 2. Gets memory map
 * 3. Finds ACPI tables
 * 4. Exits boot services
 * 5. Jumps to kernel
 */

#include "uefi_boot.h"

/* External kernel entry point */
extern void kernel_main(ek_boot_info_t *boot_info);

/* Static boot info structure */
static ek_boot_info_t boot_info __attribute__((aligned(16)));

/* Memory map buffer (allocate statically to avoid pool allocation) */
static uint8_t mmap_buffer[16384] __attribute__((aligned(16)));

/* Helper: Print string to UEFI console */
static void uefi_print(EFI_SYSTEM_TABLE *ST, const char *str) {
    CHAR16 buf[2] = { 0, 0 };
    while (*str) {
        if (*str == '\n') {
            buf[0] = '\r';
            ST->ConOut->OutputString(ST->ConOut, buf);
        }
        buf[0] = *str++;
        ST->ConOut->OutputString(ST->ConOut, buf);
    }
}

/* Helper: Compare GUIDs */
static int guid_cmp(EFI_GUID *a, EFI_GUID *b) {
    return (a->Data1 == b->Data1 && a->Data2 == b->Data2 &&
            a->Data3 == b->Data3 &&
            a->Data4[0] == b->Data4[0] && a->Data4[1] == b->Data4[1] &&
            a->Data4[2] == b->Data4[2] && a->Data4[3] == b->Data4[3] &&
            a->Data4[4] == b->Data4[4] && a->Data4[5] == b->Data4[5] &&
            a->Data4[6] == b->Data4[6] && a->Data4[7] == b->Data4[7]);
}

/* Find ACPI RSDP in configuration tables */
static void *find_acpi_rsdp(EFI_SYSTEM_TABLE *ST) {
    EFI_GUID acpi2_guid = EFI_ACPI_20_TABLE_GUID;
    EFI_GUID acpi1_guid = EFI_ACPI_TABLE_GUID;

    /* First try ACPI 2.0 */
    for (UINTN i = 0; i < ST->NumberOfTableEntries; i++) {
        if (guid_cmp(&ST->ConfigurationTable[i].VendorGuid, &acpi2_guid)) {
            return ST->ConfigurationTable[i].VendorTable;
        }
    }

    /* Fall back to ACPI 1.0 */
    for (UINTN i = 0; i < ST->NumberOfTableEntries; i++) {
        if (guid_cmp(&ST->ConfigurationTable[i].VendorGuid, &acpi1_guid)) {
            return ST->ConfigurationTable[i].VendorTable;
        }
    }

    return NULL;
}

/* UEFI Entry Point */
EFI_STATUS EFIAPI efi_main(EFI_HANDLE ImageHandle, EFI_SYSTEM_TABLE *SystemTable) {
    EFI_STATUS status;
    EFI_BOOT_SERVICES *BS = SystemTable->BootServices;

    /* Clear screen and print banner */
    SystemTable->ConOut->ClearScreen(SystemTable->ConOut);
    uefi_print(SystemTable, "\n");
    uefi_print(SystemTable, "=======================================\n");
    uefi_print(SystemTable, "    EK-OS UEFI Bootloader v0.1\n");
    uefi_print(SystemTable, "    Based on EK-KOR distributed RTOS\n");
    uefi_print(SystemTable, "=======================================\n\n");

    /* Initialize boot info */
    boot_info.magic = EK_BOOT_MAGIC;
    boot_info.acpi_rsdp = 0;
    boot_info.framebuffer_addr = 0;
    boot_info.framebuffer_width = 0;
    boot_info.framebuffer_height = 0;
    boot_info.framebuffer_pitch = 0;
    boot_info.framebuffer_bpp = 0;
    boot_info.framebuffer_pixfmt = 0;

    /* Find ACPI RSDP */
    void *rsdp = find_acpi_rsdp(SystemTable);
    if (rsdp) {
        boot_info.acpi_rsdp = (uint64_t)rsdp;
        uefi_print(SystemTable, "[OK] Found ACPI RSDP\n");
    } else {
        uefi_print(SystemTable, "[WARN] ACPI RSDP not found\n");
    }

    /* Initialize Graphics Output Protocol (GOP) */
    EFI_GUID gop_guid = EFI_GRAPHICS_OUTPUT_PROTOCOL_GUID;
    EFI_GRAPHICS_OUTPUT_PROTOCOL *gop = NULL;

    status = BS->LocateProtocol(&gop_guid, NULL, (void **)&gop);
    if (status == EFI_SUCCESS && gop != NULL) {
        /* Find best mode: prefer 1280x720, fallback to highest resolution */
        uint32_t best_mode = gop->Mode->Mode;
        uint32_t best_width = 0;
        uint32_t best_height = 0;
        int found_target = 0;

        for (uint32_t i = 0; i < gop->Mode->MaxMode; i++) {
            EFI_GRAPHICS_OUTPUT_MODE_INFORMATION *info;
            UINTN info_size;

            status = gop->QueryMode(gop, i, &info_size, &info);
            if (status != EFI_SUCCESS) continue;

            /* Check for exact 1280x720 match */
            if (info->HorizontalResolution == 1280 &&
                info->VerticalResolution == 720) {
                best_mode = i;
                found_target = 1;
                break;
            }

            /* Track highest resolution as fallback */
            if (info->HorizontalResolution * info->VerticalResolution >
                best_width * best_height) {
                best_width = info->HorizontalResolution;
                best_height = info->VerticalResolution;
                best_mode = i;
            }
        }

        /* Set the chosen mode */
        if (best_mode != gop->Mode->Mode) {
            gop->SetMode(gop, best_mode);
        }

        /* Store framebuffer info */
        boot_info.framebuffer_addr = gop->Mode->FrameBufferBase;
        boot_info.framebuffer_width = gop->Mode->Info->HorizontalResolution;
        boot_info.framebuffer_height = gop->Mode->Info->VerticalResolution;
        boot_info.framebuffer_pitch = gop->Mode->Info->PixelsPerScanLine * 4;
        boot_info.framebuffer_bpp = 32;

        /* Determine pixel format (RGB vs BGR) */
        if (gop->Mode->Info->PixelFormat == PixelBlueGreenRedReserved8BitPerColor) {
            boot_info.framebuffer_pixfmt = EK_PIXFMT_BGR;
        } else {
            boot_info.framebuffer_pixfmt = EK_PIXFMT_RGB;
        }

        if (found_target) {
            uefi_print(SystemTable, "[OK] GOP initialized: 1280x720x32\n");
        } else {
            uefi_print(SystemTable, "[OK] GOP initialized (fallback resolution)\n");
        }
    } else {
        uefi_print(SystemTable, "[WARN] GOP not available - VGA fallback\n");
    }

    /* Get memory map */
    UINTN mmap_size = sizeof(mmap_buffer);
    UINTN map_key = 0;
    UINTN desc_size = 0;
    uint32_t desc_version = 0;

    status = BS->GetMemoryMap(&mmap_size, (EFI_MEMORY_DESCRIPTOR *)mmap_buffer,
                               &map_key, &desc_size, &desc_version);
    if (status != EFI_SUCCESS) {
        uefi_print(SystemTable, "[FAIL] GetMemoryMap failed\n");
        return status;
    }

    boot_info.memory_map = (uint64_t)mmap_buffer;
    boot_info.memory_map_size = mmap_size;
    boot_info.memory_map_desc_size = desc_size;

    uefi_print(SystemTable, "[OK] Got memory map\n");

    /* Need to get map key again right before ExitBootServices */
    mmap_size = sizeof(mmap_buffer);
    status = BS->GetMemoryMap(&mmap_size, (EFI_MEMORY_DESCRIPTOR *)mmap_buffer,
                               &map_key, &desc_size, &desc_version);
    if (status != EFI_SUCCESS) {
        uefi_print(SystemTable, "[FAIL] GetMemoryMap (2nd) failed\n");
        return status;
    }

    uefi_print(SystemTable, "[OK] Exiting boot services...\n");

    /* Exit boot services - point of no return */
    status = BS->ExitBootServices(ImageHandle, map_key);
    if (status != EFI_SUCCESS) {
        /* May need to retry with fresh map key */
        mmap_size = sizeof(mmap_buffer);
        BS->GetMemoryMap(&mmap_size, (EFI_MEMORY_DESCRIPTOR *)mmap_buffer,
                         &map_key, &desc_size, &desc_version);
        status = BS->ExitBootServices(ImageHandle, map_key);
        if (status != EFI_SUCCESS) {
            /* Can't print anymore - UEFI console may be gone */
            while (1) {
                __asm__ volatile("hlt");
            }
        }
    }

    /* Now we're in full control - jump to kernel */
    kernel_main(&boot_info);

    /* Should never return */
    while (1) {
        __asm__ volatile("hlt");
    }

    return EFI_SUCCESS;
}
