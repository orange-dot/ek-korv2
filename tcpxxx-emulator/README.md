# TC397XP Functional Emulator

Functional emulator for Infineon AURIX TC397XP (TriCore TC1.6.2P).

> **Note:** This is a functional emulator for firmware bring-up. Timing/cycle accuracy is NOT validated (SCU/PLL emulation incomplete).

## Features

- TriCore TC1.6.2P instruction set emulation (~150 instructions)
- 6-core TC397XP configuration (single core active)
- Memory system with basic wait state stubs
- CSA (Context Save Area) hardware emulation
- Essential peripherals: STM, ASCLIN (UART) - stubs only
- GDB remote debugging framework (in progress)

## Status

**Current state:** ✅ Functional - JEZGRO firmware runs to idle loop

| Component | Status |
|-----------|--------|
| Instruction Decoder | ✅ Complete (~150 instructions) |
| Instruction Executor | ✅ Functional (boots RTOS) |
| Timing Engine | ⚠️ Basic annotations (not validated) |
| Memory System | ✅ Functional with wait states* |
| CSA Emulation | ✅ Complete (linked list, CALL/RET) |
| Peripherals | ⚠️ STM, ASCLIN stubs |
| GDB Server | ⚠️ Framework ready |

*Wait states are stub values from datasheet, not validated against real hardware.

See [STATUS.md](STATUS.md) for latest development log.

## ISA Coverage

Implemented instruction categories (~150 instructions):

| Category | Status | Notes |
|----------|--------|-------|
| Load/Store (LD.*, ST.*) | ✅ Functional | 16-bit and 32-bit variants |
| Arithmetic (ADD, SUB, MUL) | ✅ Functional | Including saturating |
| Logic (AND, OR, XOR, NOT) | ✅ Functional | |
| Shift (SH, SHA, EXTR) | ✅ Functional | |
| Compare (EQ, LT, GE) | ✅ Functional | |
| Branch (J, JL, CALL, RET) | ✅ Functional | CSA integration |
| CSA (CALL, RET, SVLCX, RSLCX) | ✅ Functional | Linked list complete |
| Address arithmetic (LEA, ADDSC.A) | ✅ Functional | |
| Move (MOV, MOV.A, MTCR, MFCR) | ✅ Functional | |
| Loop (LOOP, LOOPU) | ✅ Functional | |
| Bit operations (INSERT, EXTR.U) | ✅ Functional | |
| NOP, DEBUG, ISYNC | ✅ Functional | |

**Not yet implemented:** FPU instructions, some SIMD/packed operations, certain privileged instructions.

See [STATUS.md](STATUS.md) for detailed bug fix history.

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

| Region | Address Range | Wait States* |
|--------|--------------|-------------|
| PFLASH | 0x80000000 | 5 cycles |
| DSPR (local) | 0x70000000 | 0 cycles |
| LMU | 0x90000000 | 1 cycle |
| Peripherals | 0xF0000000 | 2 cycles |

*Wait state values are from datasheet; timing accuracy is NOT validated.

## References

- TriCore TC1.6.2 Architecture Manual Volume 1 (Instruction Set)
- TriCore TC1.6.2 Architecture Manual Volume 2 (Timing)
- TC3xx User Manual Part 1 (System Architecture)
- TC3xx User Manual Part 2 (Peripherals)

## License

MIT License
