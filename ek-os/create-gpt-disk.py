#!/usr/bin/env python3
"""
Create a GPT disk image with EFI System Partition for UEFI boot.
"""

import struct
import os
import uuid
import binascii
import zlib

# Constants
SECTOR_SIZE = 512
CLUSTER_SIZE = 4096
TOTAL_SIZE_MB = 64

def crc32(data):
    """Calculate CRC32 for GPT."""
    return zlib.crc32(data) & 0xFFFFFFFF

def create_gpt_disk(image_path, efi_file_path):
    """Create a GPT disk with EFI System Partition."""

    total_size = TOTAL_SIZE_MB * 1024 * 1024
    total_sectors = total_size // SECTOR_SIZE

    # Read EFI file
    with open(efi_file_path, 'rb') as f:
        efi_data = f.read()
    efi_size = len(efi_data)
    print(f"EFI file size: {efi_size} bytes")

    # Create image
    image = bytearray(total_size)

    # GPT Layout:
    # Sector 0: Protective MBR
    # Sector 1: GPT Header
    # Sectors 2-33: Partition entries (128 entries, 128 bytes each)
    # Sector 34+: Partition data
    # Last sectors: Backup GPT

    first_usable_lba = 34
    last_usable_lba = total_sectors - 34

    # ESP partition (entire usable space)
    esp_start_lba = first_usable_lba
    esp_end_lba = last_usable_lba

    disk_guid = uuid.uuid4().bytes_le
    esp_guid = uuid.uuid4().bytes_le

    # EFI System Partition type GUID
    esp_type_guid = uuid.UUID("C12A7328-F81F-11D2-BA4B-00A0C93EC93B").bytes_le

    # =====================
    # Protective MBR
    # =====================
    mbr = bytearray(512)

    # Partition entry 1 at offset 0x1BE
    mbr[0x1BE] = 0x00  # Not bootable
    mbr[0x1BF:0x1C2] = b'\x00\x02\x00'  # CHS start (doesn't matter)
    mbr[0x1C2] = 0xEE  # Type: GPT protective
    mbr[0x1C3:0x1C6] = b'\xFF\xFF\xFF'  # CHS end
    struct.pack_into('<I', mbr, 0x1C6, 1)  # LBA start
    struct.pack_into('<I', mbr, 0x1CA, min(total_sectors - 1, 0xFFFFFFFF))

    mbr[0x1FE:0x200] = b'\x55\xAA'
    image[0:512] = mbr

    # =====================
    # GPT Header
    # =====================
    gpt_header = bytearray(92)

    gpt_header[0:8] = b'EFI PART'  # Signature
    struct.pack_into('<I', gpt_header, 8, 0x00010000)  # Revision 1.0
    struct.pack_into('<I', gpt_header, 12, 92)  # Header size
    # CRC32 at offset 16 (fill later)
    struct.pack_into('<I', gpt_header, 20, 0)  # Reserved
    struct.pack_into('<Q', gpt_header, 24, 1)  # My LBA
    struct.pack_into('<Q', gpt_header, 32, total_sectors - 1)  # Alternate LBA
    struct.pack_into('<Q', gpt_header, 40, first_usable_lba)  # First usable LBA
    struct.pack_into('<Q', gpt_header, 48, last_usable_lba)  # Last usable LBA
    gpt_header[56:72] = disk_guid  # Disk GUID
    struct.pack_into('<Q', gpt_header, 72, 2)  # Partition entries LBA
    struct.pack_into('<I', gpt_header, 80, 128)  # Number of partition entries
    struct.pack_into('<I', gpt_header, 84, 128)  # Size of partition entry
    # Partition entries CRC32 at offset 88 (fill later)

    # =====================
    # Partition Entries
    # =====================
    partition_entries = bytearray(128 * 128)  # 128 entries, 128 bytes each

    # ESP partition entry (entry 0) - modify partition_entries directly
    partition_entries[0:16] = esp_type_guid  # Partition type GUID
    partition_entries[16:32] = esp_guid  # Unique partition GUID
    struct.pack_into('<Q', partition_entries, 32, esp_start_lba)  # Starting LBA
    struct.pack_into('<Q', partition_entries, 40, esp_end_lba)  # Ending LBA
    struct.pack_into('<Q', partition_entries, 48, 0)  # Attributes
    # Partition name in UTF-16LE
    name = "EFI System Partition"
    for i, c in enumerate(name):
        struct.pack_into('<H', partition_entries, 56 + i * 2, ord(c))

    # Calculate partition entries CRC
    entries_crc = crc32(bytes(partition_entries))
    struct.pack_into('<I', gpt_header, 88, entries_crc)

    # Calculate header CRC
    header_crc = crc32(bytes(gpt_header))
    struct.pack_into('<I', gpt_header, 16, header_crc)

    # Write primary GPT
    image[512:512+92] = gpt_header
    image[1024:1024+len(partition_entries)] = partition_entries

    # =====================
    # FAT32 Filesystem at ESP
    # =====================
    esp_start_offset = esp_start_lba * SECTOR_SIZE
    esp_sectors = esp_end_lba - esp_start_lba + 1

    # FAT32 parameters
    sectors_per_cluster = CLUSTER_SIZE // SECTOR_SIZE
    reserved_sectors = 32
    fat_count = 2
    fat_size_sectors = (esp_sectors // sectors_per_cluster + reserved_sectors) // 128 + 1
    data_start_sector = reserved_sectors + (fat_count * fat_size_sectors)

    print(f"ESP start: sector {esp_start_lba}, offset 0x{esp_start_offset:x}")
    print(f"ESP sectors: {esp_sectors}")
    print(f"FAT size: {fat_size_sectors} sectors")

    # VBR
    vbr = bytearray(512)
    vbr[0:3] = b'\xEB\x58\x90'
    vbr[3:11] = b'MSDOS5.0'
    struct.pack_into('<H', vbr, 11, SECTOR_SIZE)
    vbr[13] = sectors_per_cluster
    struct.pack_into('<H', vbr, 14, reserved_sectors)
    vbr[16] = fat_count
    struct.pack_into('<H', vbr, 17, 0)
    struct.pack_into('<H', vbr, 19, 0)
    vbr[21] = 0xF8
    struct.pack_into('<H', vbr, 22, 0)
    struct.pack_into('<H', vbr, 24, 63)
    struct.pack_into('<H', vbr, 26, 255)
    struct.pack_into('<I', vbr, 28, esp_start_lba)  # Hidden sectors
    struct.pack_into('<I', vbr, 32, esp_sectors)
    struct.pack_into('<I', vbr, 36, fat_size_sectors)
    struct.pack_into('<H', vbr, 40, 0)
    struct.pack_into('<H', vbr, 42, 0)
    struct.pack_into('<I', vbr, 44, 2)  # Root cluster
    struct.pack_into('<H', vbr, 48, 1)  # FSInfo sector
    struct.pack_into('<H', vbr, 50, 6)  # Backup boot sector
    vbr[64] = 0x80
    vbr[66] = 0x29
    struct.pack_into('<I', vbr, 67, 0x12345678)
    vbr[71:82] = b'EFI        '
    vbr[82:90] = b'FAT32   '
    vbr[510:512] = b'\x55\xAA'

    image[esp_start_offset:esp_start_offset+512] = vbr

    # FSInfo
    fsinfo = bytearray(512)
    fsinfo[0:4] = b'RRaA'
    fsinfo[484:488] = b'rrAa'
    struct.pack_into('<I', fsinfo, 488, 0xFFFFFFFF)
    struct.pack_into('<I', fsinfo, 492, 3)
    fsinfo[510:512] = b'\x55\xAA'
    image[esp_start_offset+512:esp_start_offset+1024] = fsinfo

    # Backup boot sector
    image[esp_start_offset+6*512:esp_start_offset+7*512] = vbr

    # FAT
    fat_offset = esp_start_offset + reserved_sectors * SECTOR_SIZE
    fat = bytearray(fat_size_sectors * SECTOR_SIZE)

    struct.pack_into('<I', fat, 0, 0x0FFFFFF8)
    struct.pack_into('<I', fat, 4, 0xFFFFFFFF)
    struct.pack_into('<I', fat, 8, 0x0FFFFFFF)  # Root dir
    struct.pack_into('<I', fat, 12, 0x0FFFFFFF)  # EFI dir
    struct.pack_into('<I', fat, 16, 0x0FFFFFFF)  # BOOT dir

    # EFI file cluster chain
    efi_clusters = (efi_size + CLUSTER_SIZE - 1) // CLUSTER_SIZE
    for i in range(efi_clusters - 1):
        struct.pack_into('<I', fat, (5 + i) * 4, 6 + i)
    struct.pack_into('<I', fat, (5 + efi_clusters - 1) * 4, 0x0FFFFFFF)

    # Write both FATs
    image[fat_offset:fat_offset+len(fat)] = fat
    image[fat_offset+fat_size_sectors*512:fat_offset+fat_size_sectors*512+len(fat)] = fat

    # Data area
    data_offset = esp_start_offset + data_start_sector * SECTOR_SIZE

    # Root directory (cluster 2)
    root_dir = bytearray(CLUSTER_SIZE)
    root_dir[0:11] = b'EFI        '
    root_dir[11] = 0x08  # Volume label
    root_dir[32:43] = b'EFI        '
    root_dir[43] = 0x10  # Directory
    struct.pack_into('<H', root_dir, 32+26, 3)  # Cluster 3
    image[data_offset:data_offset+CLUSTER_SIZE] = root_dir

    # EFI directory (cluster 3)
    efi_dir = bytearray(CLUSTER_SIZE)
    efi_dir[0:11] = b'.          '
    efi_dir[11] = 0x10
    struct.pack_into('<H', efi_dir, 26, 3)
    efi_dir[32:43] = b'..         '
    efi_dir[43] = 0x10
    struct.pack_into('<H', efi_dir, 32+26, 0)
    efi_dir[64:75] = b'BOOT       '
    efi_dir[75] = 0x10
    struct.pack_into('<H', efi_dir, 64+26, 4)
    image[data_offset+CLUSTER_SIZE:data_offset+2*CLUSTER_SIZE] = efi_dir

    # BOOT directory (cluster 4)
    boot_dir = bytearray(CLUSTER_SIZE)
    boot_dir[0:11] = b'.          '
    boot_dir[11] = 0x10
    struct.pack_into('<H', boot_dir, 26, 4)
    boot_dir[32:43] = b'..         '
    boot_dir[43] = 0x10
    struct.pack_into('<H', boot_dir, 32+26, 3)
    boot_dir[64:75] = b'BOOTX64 EFI'
    boot_dir[75] = 0x20  # Archive
    struct.pack_into('<H', boot_dir, 64+26, 5)  # Cluster 5
    struct.pack_into('<I', boot_dir, 64+28, efi_size)
    image[data_offset+2*CLUSTER_SIZE:data_offset+3*CLUSTER_SIZE] = boot_dir

    # EFI file data (cluster 5+)
    image[data_offset+3*CLUSTER_SIZE:data_offset+3*CLUSTER_SIZE+efi_size] = efi_data

    # =====================
    # Backup GPT
    # =====================
    # Partition entries at total_sectors - 33
    backup_entries_lba = total_sectors - 33
    image[backup_entries_lba*512:backup_entries_lba*512+len(partition_entries)] = partition_entries

    # Backup header at last sector
    backup_header = bytearray(gpt_header)
    struct.pack_into('<I', backup_header, 16, 0)  # Clear CRC
    struct.pack_into('<Q', backup_header, 24, total_sectors - 1)  # My LBA
    struct.pack_into('<Q', backup_header, 32, 1)  # Alternate LBA (primary)
    struct.pack_into('<Q', backup_header, 72, backup_entries_lba)  # Entries LBA
    backup_crc = crc32(bytes(backup_header))
    struct.pack_into('<I', backup_header, 16, backup_crc)
    image[(total_sectors-1)*512:(total_sectors)*512] = backup_header[:512]

    # Write image
    with open(image_path, 'wb') as f:
        f.write(image)

    print(f"Created GPT disk: {image_path}")
    print(f"EFI file: /EFI/BOOT/BOOTX64.EFI ({efi_clusters} clusters)")

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    image_path = os.path.join(script_dir, 'ek-os-gpt.img')
    efi_path = os.path.join(script_dir, 'esp', 'EFI', 'BOOT', 'BOOTX64.EFI')

    if not os.path.exists(efi_path):
        print(f"ERROR: EFI file not found: {efi_path}")
        exit(1)

    create_gpt_disk(image_path, efi_path)
