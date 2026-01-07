# AURIX TC3xx Emulator Development Notes

Extracted from Infineon official documentation.

## TriCore TC1.6.2 CPU Architecture

### Register Set (32 GPRs)
```
Data Registers:     D[0] - D[15]  (32-bit each)
Address Registers:  A[0] - A[15]  (32-bit each)

Special Functions:
  D[15] - Implicit Data register
  A[10] - Stack Pointer (SP)
  A[11] - Return Address (RA)
  A[15] - Implicit Address register

System Globals (not saved in context):
  A[0], A[1], A[8], A[9]

Lower context: registers [0-7]
Upper context: registers [8-15]
```

### System Registers
```
PC   - Program Counter
PSW  - Program Status Word
PCXI - Previous Context Information
```

### Memory Model
- 32-bit address width → 4 GB address space
- 16 segments of 256 MB each (upper 4 bits select segment)
- Little-endian byte ordering
- Unified program and I/O memory

### Instruction Set
- 16-bit and 32-bit instruction formats
- 16-bit = subset of 32-bit (for code density)
- Most instructions execute in 1 cycle

### Key Instruction Categories
1. **Arithmetic**: ADD, ADDS, SUB, MUL, MULS, MADD, MSUB, DIV
2. **Logic**: AND, OR, XOR, NAND, NOR
3. **Move**: MOV, MOVH, MOV.U
4. **Load/Store**: LD.W, ST.W, LD.H, ST.H, LD.B, ST.B
5. **Branch**: J, JL, CALL, RET, LOOP
6. **Compare**: EQ, NE, LT, GE
7. **Bit operations**: CLZ, CLS, INSERT, EXTRACT

### Execution Modes
```
User-0:     No peripheral access, cannot disable interrupts
User-1:     Common peripheral access, can briefly disable interrupts
Supervisor: Full access to system registers and peripherals
```

### Context Save Areas (CSA)
- 16 words (64 bytes) per CSA
- Aligned on 16-word boundary
- Linked list structure via Link Word
- Hardware-managed save/restore

### Interrupt System
- Service Request Nodes (SRN) based
- Hardware dispatched ISRs
- Fast context switch (hardware assisted)
- Flexible priority scheme

### Trap Classes
```
Class 0: MMU traps
Class 1: Internal protection traps
Class 2: Instruction errors
Class 3: Context management
Class 4: System bus and memory errors
Class 5: Assertion traps
Class 6: System call
Class 7: NMI
```

## Key System Registers for Emulation

### SYSCON (0xFE14) - System Configuration
```
Bit 24: BHALT  - Boot halt status
Bit 17: U1_IOS - User-1 peripheral access as supervisor
Bit 16: U1_IED - User-1 instruction execution disable
Bit 8:  ESDIS  - Emulator space disable
Bit 4:  TS     - Initial PSW.S in trap handler
Bit 3:  IS     - Initial PSW.S in interrupt handler
Bit 2:  TPROTEN - Temporal protection enable
Bit 1:  PROTEN  - Memory protection enable
Bit 0:  FCDSF   - Free context list depleted sticky flag
```

### CPU_ID (0xFE18) - CPU Identification
```
Bits 31-16: MOD      - Module ID
Bits 15-8:  MOD_32B  - 32-bit module flag (0xC0)
Bits 7-0:   MOD_REV  - Revision number
```

### CORE_ID (0xFE1C) - Core Identification
```
Bits 2-0: CORE_ID - Core number in multicore system
```

## DC-DC Converter Control (AN1102)

### Supported Topologies
1. **Phase Shift Full Bridge (PSFB)**
   - Zero voltage switching (ZVS)
   - Suitable for HV-LV DC-DC

2. **Dual Active Bridge (DAB)**
   - Bidirectional power flow
   - Ideal for V2G applications

### TC3xx Peripherals for DC-DC Control
```
GTM (Generic Timer Module):
  - TOM: Timer Output Module for PWM generation
  - ATOM: Advanced TOM with more features
  - TIM: Timer Input Module for feedback

VADC (Versatile ADC):
  - 12-bit SAR ADC
  - Multiple channels
  - Fast conversion for voltage monitoring

DSADC (Delta-Sigma ADC):
  - High resolution for current sensing
  - Sinc filter for noise rejection
  - Hardware trigger from PWM

DMA:
  - Linked list mode for autonomous transfers
  - Hardware triggers from ADC/timer
  - Reduces CPU load
```

### Timing Requirements
- PWM frequency: 50-200 kHz typical
- ADC sampling: Synchronized with PWM
- Control loop: 10-50 µs typical

## Files Extracted

| File | Content |
|------|---------|
| arch_vol1_cpu_overview.txt | CPU architecture overview (pages 8-25) |
| arch_vol1_registers.txt | System register details (pages 40-70) |
| arch_vol2_instructions.txt | Instruction set overview |
| dcdc_full.txt | Complete DC-DC application note |

## Next Steps for Emulator

1. **CPU Core Emulation**
   - Implement 32 GPRs (16 data + 16 address)
   - Implement system registers (PC, PSW, PCXI)
   - Implement instruction decoder (16-bit and 32-bit)
   - Start with essential subset: MOV, ADD, LD, ST, J, CALL, RET

2. **Memory Subsystem**
   - Implement memory map with segments
   - Add peripheral register stubs
   - Implement CSA management

3. **Peripheral Stubs**
   - GTM timer basic functionality
   - VADC conversion simulation
   - CAN-FD message buffers

4. **Test Framework**
   - Load ELF binaries
   - Trace execution
   - Compare with reference behavior