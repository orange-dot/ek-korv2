# TCPxxx Emulator - TriCore TC1.6.2P Bug Fixes

**Date:** 2026-01-08
**Session:** EK-KOR RTOS porting to TC397XP

## Summary

Fixed multiple instruction decoding and execution bugs in the TCPxxx TriCore emulator that prevented the EK-KOR RTOS kernel from booting correctly.

## Critical Fix: SUB.A SP Encoding

**Problem:** The `sub.a %sp,8` instruction (opcode 0x20) was incorrectly decoded as SRC format, reading the register from bits[11:8]. This caused SP to not decrement, corrupting nested function call stack frames.

**Solution:** Changed opcode 0x20 to use SC format with implicit SP (A10) and const8 from bits[15:8].

**File:** `src/core/tricore_decode.c`
```c
case 0x20:  /* SUB.A SP, const8 - SC format with implicit SP */
    out->format = FMT_SC;
    out->dst = 10;                          /* SP (A10) implicit */
    out->imm = BITS(insn, 15, 8);           /* const8 */
    out->is_addr_dst = true;
    break;
```

## Bug Fixes Applied

### 1. Logic Operations (16-bit SRR format)
Added missing OR/AND/XOR opcodes to decoder:
- `0xA6` - OR D[a], D[b]
- `0x26` - AND D[a], D[b]
- `0x66` - XOR D[a], D[b]

### 2. Accumulating Comparison Instructions (RC format)
Added AND.EQ/NE/LT/GE and OR.EQ/NE/LT/GE for opcode 0x8B:
- `0x20` - AND.EQ D[c], D[a], const9
- `0x21` - AND.NE D[c], D[a], const9
- `0x22` - AND.LT D[c], D[a], const9
- `0x23` - AND.LT.U D[c], D[a], const9
- `0x24` - AND.GE D[c], D[a], const9
- `0x25` - AND.GE.U D[c], D[a], const9
- `0x28` - OR.EQ D[c], D[a], const9
- `0x29` - OR.NE D[c], D[a], const9
- `0x2A` - OR.LT D[c], D[a], const9
- `0x2B` - OR.LT.U D[c], D[a], const9
- `0x2C` - OR.GE D[c], D[a], const9
- `0x2D` - OR.GE.U D[c], D[a], const9

### 3. Post-Increment Load/Store (SSR format)
Added post-increment variants:
- `0x24` - ST.B [A[b]+], D[a]
- `0x34` - ST.W [A[b]+], D[a]
- `0x84` - LD.B [A[b]+], D[a]
- `0xC4` - LD.W [A[b]+], D[a]

### 4. Debug Tracing Added
- A14 save/restore tracing in CSA functions
- MOV.AA tracing when dst=A14
- SUB.A tracing in puts/putc range

## Critical Fix: RET Instruction Return Value Preservation

**Problem:** The `RET` instruction was restoring D2 and A2 registers from the CSA, which
destroyed function return values. In TriCore calling convention:
- D2 holds scalar return values
- A2 holds pointer/address return values

When a function returned, the `csa_restore_lower()` function restored these registers
from the caller's saved context, overwriting the return value the callee had placed there.

**Root Cause:** The scheduler's `get_sched()` function called `ekk_hal_get_core_id()`,
which correctly returned 0 in D2. But RET restored D2 from the CSA (garbage value),
causing `get_sched()` to calculate wrong scheduler address (0x80000000 instead of 0x70000730).

**Solution:** Created `csa_restore_lower_ex()` with a `preserve_retval` parameter:
- RET uses `csa_restore_lower_ex(cpu, mem, 1)` - preserves D2/A2
- RSLCX uses `csa_restore_lower(cpu, mem)` - restores all registers

**File:** `src/core/tricore_exec.c`
```c
int csa_restore_lower_ex(cpu_state_t *cpu, mem_system_t *mem, int preserve_retval)
{
    /* ... */
    if (!preserve_retval) {
        A(2) = load32(cpu, mem, csa_addr + 8, &cycles);
        D(2) = load32(cpu, mem, csa_addr + 24, &cycles);
    }
    /* ... */
}
```

## Test Results

**Boot Output (successful):**
```
JEZGRO
==================================
JEZGRO RTOS for TC397XP
==================================
Kernel initialized
Starting scheduler...
```

**Status:**
- Kernel initialization: ✓
- UART output: ✓
- Function calls/returns: ✓
- Return value preservation: ✓
- Scheduler start: ✓
- Scheduler enters idle loop: ✓ (waiting for timer interrupts)

## Files Modified

- `src/core/tricore_decode.c` - Decoder fixes
- `src/core/tricore_exec.c` - Executor fixes + RET return value preservation
- `src/core/tricore_regs.c` - Register handling
- `src/main.c` - Emulator main loop
- `include/emu_types.h` - Type definitions

## Next Steps

1. ~~Debug context switch FCX pointer issue~~ (resolved by RET fix)
2. Enable STM timer interrupts for task preemption
3. Test task context switching with timer
4. Multi-core boot (CPU1, CPU2)
