# EK-OS

A bare-metal x86_64 operating system based on EK-KOR distributed RTOS concepts.

## Overview

EK-OS is an experimental operating system that implements EK-KOR's novel distributed coordination algorithms on x86_64 hardware. Each CPU core runs as an independent EK-KOR module, coordinating through potential fields in shared memory.

## Features

- **UEFI boot** - Modern 64-bit boot process
- **SMP support** - Each CPU core = one EK-KOR module
- **VGA text console** - 80x25 text mode display
- **PS/2 keyboard** - Full keyboard input support
- **Serial debug** - COM1 @ 115200 baud for debug output
- **EK-KOR integration** - Potential field scheduling, k=7 neighbor topology

## Building

### Prerequisites

- GCC cross-compiler (`x86_64-elf-gcc`) or system GCC
- GNU Make
- QEMU with OVMF (for testing)

### Build

```bash
cd ek-os
make
```

### Run in QEMU

```bash
# Requires OVMF UEFI firmware
make run
```

### Run on Real Hardware

1. Format USB drive as FAT32
2. Create `EFI/BOOT/` directory
3. Copy `build/BOOTX64.EFI` to `EFI/BOOT/BOOTX64.EFI`
4. Boot PC from USB (disable Secure Boot in BIOS)

## Architecture

```
ek-os/
├── boot/           # UEFI bootloader
├── kernel/         # Core kernel (GDT, IDT, main)
├── drivers/        # Hardware drivers (VGA, serial, keyboard)
├── hal/            # EK-KOR HAL implementation for x86
├── lib/            # Runtime library (string, printf)
└── ekk/            # EK-KOR library (from ek-kor2/)
```

## Memory Layout

| Address Range | Usage |
|--------------|-------|
| 0x00001000 - 0x00007FFF | AP trampoline |
| 0x00100000 - 0x001FFFFF | Kernel code/data |
| 0x00200000 - 0x002FFFFF | Per-core stacks |
| 0x00300000 - 0x0030FFFF | EK-KOR field region |
| 0x00310000 - 0x0031FFFF | Message queues |
| 0x000B8000 | VGA text buffer |
| 0xFEE00000 | Local APIC |

## License

MIT License - See LICENSE file

## Credits

Part of the Elektrokombinacija project - modular EV charging infrastructure.
