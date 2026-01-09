#!/usr/bin/env python3
"""
Patch PE file subsystem from Windows Console (3) to EFI Application (10).
"""

import struct
import sys
import os

def patch_pe_subsystem(pe_path, output_path, new_subsystem=10):
    """
    Patch the subsystem field in a PE file.

    For UEFI:
      10 = IMAGE_SUBSYSTEM_EFI_APPLICATION
      11 = IMAGE_SUBSYSTEM_EFI_BOOT_SERVICE_DRIVER
      12 = IMAGE_SUBSYSTEM_EFI_RUNTIME_DRIVER
    """
    with open(pe_path, 'rb') as f:
        data = bytearray(f.read())

    # Verify MZ header
    if data[0:2] != b'MZ':
        print(f"ERROR: Not a valid PE file (missing MZ header)")
        return False

    # Get PE header offset from DOS header
    pe_offset = struct.unpack_from('<I', data, 0x3C)[0]
    print(f"PE header offset: 0x{pe_offset:X}")

    # Verify PE signature
    if data[pe_offset:pe_offset+4] != b'PE\x00\x00':
        print(f"ERROR: Invalid PE signature at offset 0x{pe_offset:X}")
        return False

    # COFF header is at pe_offset + 4
    coff_offset = pe_offset + 4
    machine = struct.unpack_from('<H', data, coff_offset)[0]
    optional_header_size = struct.unpack_from('<H', data, coff_offset + 16)[0]
    print(f"Machine: 0x{machine:X}")
    print(f"Optional header size: {optional_header_size}")

    # Optional header starts after COFF header (20 bytes)
    optional_offset = coff_offset + 20
    magic = struct.unpack_from('<H', data, optional_offset)[0]
    print(f"Optional header magic: 0x{magic:X}")

    if magic == 0x20B:  # PE32+
        # Subsystem is at offset 68 in PE32+ optional header
        subsystem_offset = optional_offset + 68
    elif magic == 0x10B:  # PE32
        # Subsystem is at offset 68 in PE32 optional header
        subsystem_offset = optional_offset + 68
    else:
        print(f"ERROR: Unknown PE format magic 0x{magic:X}")
        return False

    old_subsystem = struct.unpack_from('<H', data, subsystem_offset)[0]
    print(f"Current subsystem: {old_subsystem} (at offset 0x{subsystem_offset:X})")

    # Patch the subsystem
    struct.pack_into('<H', data, subsystem_offset, new_subsystem)
    print(f"Patched subsystem to: {new_subsystem}")

    # Write output file
    with open(output_path, 'wb') as f:
        f.write(data)
    print(f"Written to: {output_path}")

    return True

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    pe_path = os.path.join(script_dir, 'build', 'EK-OS.elf')
    output_path = os.path.join(script_dir, 'build', 'BOOTX64.EFI')

    if not os.path.exists(pe_path):
        print(f"ERROR: PE file not found: {pe_path}")
        sys.exit(1)

    success = patch_pe_subsystem(pe_path, output_path, new_subsystem=10)
    if not success:
        sys.exit(1)

    # Also copy to ESP directory
    esp_path = os.path.join(script_dir, 'esp', 'EFI', 'BOOT', 'BOOTX64.EFI')
    os.makedirs(os.path.dirname(esp_path), exist_ok=True)
    with open(output_path, 'rb') as f:
        data = f.read()
    with open(esp_path, 'wb') as f:
        f.write(data)
    print(f"Copied to: {esp_path}")
