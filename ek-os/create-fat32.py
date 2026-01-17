#!/usr/bin/env python3
"""
Create a bootable FAT32 disk image with EFI file for UEFI boot.
This creates a raw disk image with MBR partition table and FAT32 filesystem.
"""

import struct
import os

# Constants
SECTOR_SIZE = 512
CLUSTER_SIZE = 4096  # 8 sectors per cluster
RESERVED_SECTORS = 32
FAT_COUNT = 2
ROOT_DIR_ENTRIES = 0  # FAT32 uses cluster-based root dir

def create_fat32_image(image_path, efi_file_path, size_mb=64):
    """Create a FAT32 disk image with the EFI file."""

    total_size = size_mb * 1024 * 1024
    total_sectors = total_size // SECTOR_SIZE

    # Read EFI file
    with open(efi_file_path, 'rb') as f:
        efi_data = f.read()
    efi_size = len(efi_data)

    print(f"EFI file size: {efi_size} bytes")

    # Create image
    image = bytearray(total_size)

    # Calculate FAT32 parameters
    sectors_per_cluster = CLUSTER_SIZE // SECTOR_SIZE
    fat_size_sectors = (total_sectors // sectors_per_cluster + RESERVED_SECTORS) // 128 + 1
    data_start_sector = RESERVED_SECTORS + (FAT_COUNT * fat_size_sectors)
    data_clusters = (total_sectors - data_start_sector) // sectors_per_cluster

    print(f"Total sectors: {total_sectors}")
    print(f"FAT size: {fat_size_sectors} sectors")
    print(f"Data start: sector {data_start_sector}")
    print(f"Data clusters: {data_clusters}")

    # Create MBR (Master Boot Record)
    mbr = bytearray(SECTOR_SIZE)

    # Partition table entry 1 (offset 0x1BE)
    # FAT32 partition starting at sector 0 (whole disk)
    mbr[0x1BE] = 0x80  # Bootable
    mbr[0x1BF:0x1C2] = b'\x00\x01\x00'  # CHS start
    mbr[0x1C2] = 0x0C  # Type: FAT32 LBA
    mbr[0x1C3:0x1C6] = b'\xFE\xFF\xFF'  # CHS end
    struct.pack_into('<I', mbr, 0x1C6, 0)  # LBA start (sector 0 - we use superfloppy)
    struct.pack_into('<I', mbr, 0x1CA, total_sectors)  # LBA size

    # Boot signature
    mbr[0x1FE:0x200] = b'\x55\xAA'

    # Actually, let's use a "superfloppy" format (no MBR, just VBR at sector 0)
    # This is simpler and commonly used for EFI

    # Create VBR (Volume Boot Record) at sector 0
    vbr = bytearray(SECTOR_SIZE)

    # Jump instruction
    vbr[0:3] = b'\xEB\x58\x90'  # jmp short + nop

    # OEM ID
    vbr[3:11] = b'MSWIN4.1'

    # BIOS Parameter Block (BPB)
    struct.pack_into('<H', vbr, 11, SECTOR_SIZE)  # Bytes per sector
    vbr[13] = sectors_per_cluster  # Sectors per cluster
    struct.pack_into('<H', vbr, 14, RESERVED_SECTORS)  # Reserved sectors
    vbr[16] = FAT_COUNT  # Number of FATs
    struct.pack_into('<H', vbr, 17, 0)  # Root entries (0 for FAT32)
    struct.pack_into('<H', vbr, 19, 0)  # Total sectors 16-bit (0 for FAT32)
    vbr[21] = 0xF8  # Media descriptor (fixed disk)
    struct.pack_into('<H', vbr, 22, 0)  # FAT size 16-bit (0 for FAT32)
    struct.pack_into('<H', vbr, 24, 63)  # Sectors per track
    struct.pack_into('<H', vbr, 26, 255)  # Number of heads
    struct.pack_into('<I', vbr, 28, 0)  # Hidden sectors
    struct.pack_into('<I', vbr, 32, total_sectors)  # Total sectors 32-bit

    # FAT32 Extended BPB
    struct.pack_into('<I', vbr, 36, fat_size_sectors)  # FAT size 32-bit
    struct.pack_into('<H', vbr, 40, 0)  # Flags
    struct.pack_into('<H', vbr, 42, 0)  # Version
    struct.pack_into('<I', vbr, 44, 2)  # Root cluster
    struct.pack_into('<H', vbr, 48, 1)  # FSInfo sector
    struct.pack_into('<H', vbr, 50, 6)  # Backup boot sector
    # Reserved (12 bytes at offset 52)
    vbr[64] = 0x80  # Drive number
    vbr[65] = 0  # Reserved
    vbr[66] = 0x29  # Extended boot signature
    struct.pack_into('<I', vbr, 67, 0x12345678)  # Volume serial number
    vbr[71:82] = b'EK-OS      '  # Volume label
    vbr[82:90] = b'FAT32   '  # File system type

    # Boot code (not needed for EFI, but add signature)
    vbr[510:512] = b'\x55\xAA'  # Boot signature

    # Write VBR
    image[0:512] = vbr

    # Create FSInfo sector (sector 1)
    fsinfo = bytearray(SECTOR_SIZE)
    fsinfo[0:4] = b'RRaA'  # Lead signature
    fsinfo[484:488] = b'rrAa'  # Struct signature
    struct.pack_into('<I', fsinfo, 488, data_clusters - 10)  # Free clusters
    struct.pack_into('<I', fsinfo, 492, 3)  # Next free cluster
    fsinfo[510:512] = b'\x55\xAA'  # Trail signature
    image[512:1024] = fsinfo

    # Write backup VBR at sector 6
    image[6*512:7*512] = vbr

    # Create FAT tables
    fat_offset = RESERVED_SECTORS * SECTOR_SIZE
    fat = bytearray(fat_size_sectors * SECTOR_SIZE)

    # FAT32 reserved entries
    struct.pack_into('<I', fat, 0, 0x0FFFFFF8)  # Media type in cluster 0
    struct.pack_into('<I', fat, 4, 0xFFFFFFFF)  # End of chain marker in cluster 1

    # Root directory chain (cluster 2)
    struct.pack_into('<I', fat, 8, 0x0FFFFFFF)  # End of chain for root dir

    # EFI directory chain (cluster 3)
    struct.pack_into('<I', fat, 12, 0x0FFFFFFF)  # End of chain for EFI dir

    # BOOT directory chain (cluster 4)
    struct.pack_into('<I', fat, 16, 0x0FFFFFFF)  # End of chain for BOOT dir

    # EFI file chain (starting cluster 5)
    efi_clusters_needed = (efi_size + CLUSTER_SIZE - 1) // CLUSTER_SIZE
    for i in range(efi_clusters_needed - 1):
        struct.pack_into('<I', fat, (5 + i) * 4, 5 + i + 1)  # Point to next cluster
    struct.pack_into('<I', fat, (5 + efi_clusters_needed - 1) * 4, 0x0FFFFFFF)  # End of chain

    print(f"EFI file needs {efi_clusters_needed} clusters")

    # Write both FAT copies
    image[fat_offset:fat_offset + len(fat)] = fat
    image[fat_offset + fat_size_sectors * SECTOR_SIZE:fat_offset + fat_size_sectors * SECTOR_SIZE + len(fat)] = fat

    # Create root directory (cluster 2)
    root_dir_offset = data_start_sector * SECTOR_SIZE
    root_dir = bytearray(CLUSTER_SIZE)

    # Volume label entry
    root_dir[0:11] = b'EK-OS      '  # Name
    root_dir[11] = 0x08  # Attribute: volume label

    # EFI directory entry
    root_dir[32:43] = b'EFI        '  # Name (8.3 format)
    root_dir[43] = 0x10  # Attribute: directory
    struct.pack_into('<H', root_dir, 32+20, 0)  # High cluster
    struct.pack_into('<H', root_dir, 32+26, 3)  # Low cluster (cluster 3)
    struct.pack_into('<I', root_dir, 32+28, 0)  # Size (0 for directory)

    image[root_dir_offset:root_dir_offset + CLUSTER_SIZE] = root_dir

    # Create EFI directory (cluster 3)
    efi_dir_offset = root_dir_offset + CLUSTER_SIZE
    efi_dir = bytearray(CLUSTER_SIZE)

    # "." entry
    efi_dir[0:11] = b'.          '
    efi_dir[11] = 0x10
    struct.pack_into('<H', efi_dir, 26, 3)

    # ".." entry
    efi_dir[32:43] = b'..         '
    efi_dir[43] = 0x10
    struct.pack_into('<H', efi_dir, 32+26, 0)  # Points to root (cluster 0 means root)

    # BOOT directory entry
    efi_dir[64:75] = b'BOOT       '  # Name
    efi_dir[75] = 0x10  # Attribute: directory
    struct.pack_into('<H', efi_dir, 64+20, 0)  # High cluster
    struct.pack_into('<H', efi_dir, 64+26, 4)  # Low cluster (cluster 4)

    image[efi_dir_offset:efi_dir_offset + CLUSTER_SIZE] = efi_dir

    # Create BOOT directory (cluster 4)
    boot_dir_offset = root_dir_offset + 2 * CLUSTER_SIZE
    boot_dir = bytearray(CLUSTER_SIZE)

    # "." entry
    boot_dir[0:11] = b'.          '
    boot_dir[11] = 0x10
    struct.pack_into('<H', boot_dir, 26, 4)

    # ".." entry
    boot_dir[32:43] = b'..         '
    boot_dir[43] = 0x10
    struct.pack_into('<H', boot_dir, 32+26, 3)  # Points to EFI

    # BOOTX64.EFI file entry
    boot_dir[64:75] = b'BOOTX64 EFI'  # Name (8.3 format)
    boot_dir[75] = 0x20  # Attribute: archive
    struct.pack_into('<H', boot_dir, 64+20, 0)  # High cluster
    struct.pack_into('<H', boot_dir, 64+26, 5)  # Low cluster (cluster 5)
    struct.pack_into('<I', boot_dir, 64+28, efi_size)  # Size

    image[boot_dir_offset:boot_dir_offset + CLUSTER_SIZE] = boot_dir

    # Write EFI file data (starting at cluster 5)
    efi_data_offset = root_dir_offset + 3 * CLUSTER_SIZE
    image[efi_data_offset:efi_data_offset + efi_size] = efi_data

    # Write image to file
    with open(image_path, 'wb') as f:
        f.write(image)

    print(f"Created {image_path}")
    print(f"Directory structure: /EFI/BOOT/BOOTX64.EFI")

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    image_path = os.path.join(script_dir, 'ek-os.img')
    efi_path = os.path.join(script_dir, 'esp', 'EFI', 'BOOT', 'BOOTX64.EFI')

    if not os.path.exists(efi_path):
        print(f"ERROR: EFI file not found: {efi_path}")
        exit(1)

    create_fat32_image(image_path, efi_path)
