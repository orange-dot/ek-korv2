# TC397XP Functional Emulator

Functional emulator for Infineon AURIX TC397XP (TriCore TC1.6.2P) with timing annotations.

**Target accuracy:** ~10% cycle count error for RTOS development.

## Features

- TriCore TC1.6.2P instruction set emulation
- 6-core TC397XP configuration
- Memory system with wait state modeling
- CSA (Context Save Area) hardware emulation
- Essential peripherals: STM, ASCLIN (UART), IR, SCU
- Timing annotations for instruction and memory access cycles
- GDB remote debugging support

## Status

This is a project skeleton. Current implementation status:

| Component | Status |
|-----------|--------|
| Instruction Decoder | Foundation (~100 instructions) |
| Instruction Executor | Stub |
| Timing Engine | Stub |
| Memory System | Stub |
| CSA Emulation | Stub |
| Peripherals | Stubs |
| GDB Server | Stub |

## Building

### Prerequisites

- CMake 3.16+
- C11 compiler (GCC, Clang, or MSVC)

### Build Commands

```bash
mkdir build && cd build
cmake ..
cmake --build .
```

### Running Self-Test

```bash
./tcpxxx-emu --test
```

### Running Emulator

```bash
./tcpxxx-emu firmware.elf
./tcpxxx-emu -g 3333 firmware.elf  # With GDB server
```

## Architecture

```
tcpxxx-emulator/
├── include/              # Public headers
│   ├── emu_types.h       # Core types (CPU state, decoded insn, etc.)
│   ├── emu_config.h      # Configuration options
│   └── tricore_decode.h  # Decoder interface
├── src/
│   ├── core/             # CPU emulation
│   │   ├── tricore_decode.c  # Instruction decoder
│   │   ├── tricore_exec.c    # Instruction executor
│   │   ├── tricore_timing.c  # Timing annotations
│   │   ├── tricore_regs.c    # Register operations
│   │   └── tricore_cpu.c     # CPU state machine
│   ├── memory/           # Memory system
│   ├── csa/              # Context Save Area
│   ├── peripherals/      # STM, ASCLIN, IR, SCU
│   ├── debug/            # GDB server, trace
│   └── main.c            # Entry point
├── test/                 # Unit tests (Unity framework)
└── timing_tables/        # Instruction/memory timing CSVs
```

## Memory Map

| Region | Address Range | Wait States |
|--------|--------------|-------------|
| PFLASH | 0x80000000 | 5 cycles |
| DSPR (local) | 0x70000000 | 0 cycles |
| LMU | 0x90000000 | 1 cycle |
| Peripherals | 0xF0000000 | 2 cycles |

## References

- TriCore TC1.6.2 Architecture Manual Volume 1 (Instruction Set)
- TriCore TC1.6.2 Architecture Manual Volume 2 (Timing)
- TC3xx User Manual Part 1 (System Architecture)
- TC3xx User Manual Part 2 (Peripherals)

## License

MIT License
