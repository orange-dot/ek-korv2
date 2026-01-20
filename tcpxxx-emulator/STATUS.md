# TriCore TC397XP Emulator - Development Status

**Last Updated:** 2026-01-20

## Current State

**Status:** ✅ JEZGRO firmware runs successfully - reaches idle loop

### What Works
- ELF loading with toolchain bug workarounds
- Instruction decoding (all major 16-bit and 32-bit formats)
- CSA initialization and linked list management
- CALL/RET with context save/restore
- FCX/LCX register handling
- Full firmware boot sequence:
  1. crt0 startup assembly
  2. CSA initialization (128 entries)
  3. .data/.bss initialization
  4. C startup (_startup_tc397xp)
  5. Idle loop execution

### Latest Milestone (2026-01-07)

**JEZGRO firmware now executes to idle loop!**

```
=== Execution Complete ===
  Instructions:  1,000,000
  Cycles:        12,293,552
  Final PC:      0x8000560A (idle loop)
  Final State:   RUNNING
```

The firmware:
1. Initializes CSA with correct linked list
2. Boots through C runtime
3. Enters idle loop calling `__nop` repeatedly

### Bug Fixes Today

| Time | Issue | Fix |
|------|-------|-----|
| 09:15 | CSA link offset calculation wrong | Changed `(addr & 0xFFFF) >> 6` to `(addr >> 6) & 0xFFFF` in firmware crt0 |
| 09:10 | Opcode 0x01 ADDSC.A missing | Added ADDSC.A, ADDSC.AT, ADD.A, SUB.A, MOV.AA handlers |
| 09:05 | Opcode 0x20 SUB.A (16-bit) missing | Added SUB.A and ADD.A 16-bit handlers |
| 09:00 | Opcode 0x0F decoded as RC, not RR | Changed decoder to use decode_rr for 0x0F (OR/AND/XOR with registers) |

## Test Command

```bash
# From the emulator directory:
cmake --build build --config Debug
./build/Debug/tcpxxx-emu.exe --no-gdb <path-to-firmware.elf>

# Example with test firmware:
./build/Debug/tcpxxx-emu.exe --no-gdb test-firmware/jezgro-tricore.elf
```

## Key Files

| File | Purpose |
|------|---------|
| `src/core/tricore_exec.c` | Instruction execution |
| `src/core/tricore_decode.c` | Instruction decoding |
| `src/main.c` | Main loop, trace output |
| `src/elf_loader.c` | ELF loading with workarounds |

## Next Steps

1. **Add UART emulation** - To see firmware printf output
2. **Add more peripheral emulation** - STM, GPT, etc.
3. **Add multi-core support** - Currently only core 0 runs
4. **Add GDB debugging** - Already has framework, needs testing

## Architecture Notes

- TC1.6.2P instruction set
- CSA: 64-byte linked list entries for context switching
- FCX/LCX: Free/Last CSA pointers
- CSA pointer format: bits[19:16]=segment, bits[15:0]=offset/64
- Current CSA region: 0x70033D40 (128 entries = 8KB)

## Previous Fixes

| Date | Issue | Fix |
|------|-------|-----|
| 2026-01-07 | EXTR.U reads pos/width from register | Use `insn->pos` and `insn->width` for 0xB7, register for 0x37 |
| 2026-01-06 | RLC const16 extraction | Changed to `BITS(insn, 27, 12)` |
| 2026-01-06 | MFCR wrote to FCX instead of reading | Fixed handler at line 945 |
| 2026-01-06 | CSA memory overlap | Moved CSA region |
