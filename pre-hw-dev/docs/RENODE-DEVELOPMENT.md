# JEZGRO Development with Renode Hardware Emulation

## Overview

Renode is an open-source hardware emulation framework developed by Antmicro. It allows you to run and debug real firmware (the exact same binary that runs on physical hardware) on your development PC without any physical chips.

This document covers the complete development workflow using Renode for JEZGRO kernel development.

## What Renode Emulates

### CPU Emulation

Renode provides cycle-accurate emulation of ARM Cortex-M processors:

```
┌────────────────────────────────────────────────────────────┐
│                    Renode CPU Emulation                    │
├────────────────────────────────────────────────────────────┤
│  Instruction Set    │ Full ARMv7-M (Thumb-2)               │
│  FPU                │ Single-precision FPv4-SP-D16         │
│  Interrupts         │ NVIC with priority levels            │
│  System Timer       │ SysTick with configurable frequency  │
│  Debug              │ GDB stub for full debugging          │
│  Exceptions         │ HardFault, MemManage, BusFault, etc. │
└────────────────────────────────────────────────────────────┘
```

### Memory Model

The emulated STM32G474 has the same memory map as real hardware:

```
Memory Map (STM32G474)
══════════════════════════════════════════════════════════

0x0800_0000 ┌──────────────────────┐
            │                      │
            │   Flash Memory       │  512 KB
            │   (Code + Constants) │  Read/Execute
            │                      │
0x0807_FFFF └──────────────────────┘

0x1000_0000 ┌──────────────────────┐
            │   CCM SRAM           │  32 KB
            │   (Core-Coupled)     │  Fast access, no DMA
0x1000_7FFF └──────────────────────┘

0x2000_0000 ┌──────────────────────┐
            │   SRAM1              │  80 KB
            │   (Main RAM)         │  Code + Data + Stack
0x2001_3FFF └──────────────────────┘

0x2001_4000 ┌──────────────────────┐
            │   SRAM2              │  16 KB
            │   (Secondary RAM)    │  Data buffers
0x2001_7FFF └──────────────────────┘

0x4000_0000 ┌──────────────────────┐
            │                      │
            │   Peripherals        │  APB1, APB2, AHB
            │   (UART, TIM, CAN)   │
            │                      │
0x5FFF_FFFF └──────────────────────┘

0xE000_0000 ┌──────────────────────┐
            │   System Control     │  NVIC, SysTick, MPU
            │   (Cortex-M Core)    │  Debug, SCB
0xE00F_FFFF └──────────────────────┘
```

### Peripheral Emulation

| Peripheral | Emulation Level | Notes |
|------------|-----------------|-------|
| NVIC | Full | All priority levels, pending bits |
| SysTick | Full | Generates interrupts at configured rate |
| UART | Full | Bidirectional, connects to host terminal |
| GPIO | Partial | Pin state, basic I/O |
| Timers | Partial | Basic counting, interrupts |
| CAN/FDCAN | Stub | Requires custom Python model |
| ADC | Stub | Returns configurable values |
| DMA | Partial | Basic transfers |

## Architecture Comparison

### Real Hardware vs Emulation

```
┌─────────────────────────────────────────────────────────────────────┐
│                        REAL HARDWARE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │ STM32G474   │    │   CAN       │    │   Power     │             │
│  │ Cortex-M4F  │◄──►│ Transceiver │◄──►│   Stage     │             │
│  │ 170 MHz     │    │   TLE9251   │    │   SiC       │             │
│  └─────────────┘    └─────────────┘    └─────────────┘             │
│        │                                                            │
│        │ SWD Debug                                                  │
│        ▼                                                            │
│  ┌─────────────┐                                                    │
│  │  ST-Link    │◄──── USB ────► PC                                 │
│  │  Debugger   │                                                    │
│  └─────────────┘                                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      RENODE EMULATION                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                         YOUR PC                                │ │
│  │  ┌─────────────────────────────────────────────────────────┐  │ │
│  │  │                    Renode Process                        │  │ │
│  │  │  ┌───────────────────────────────────────────────────┐  │  │ │
│  │  │  │           Virtual STM32G474                       │  │  │ │
│  │  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐           │  │  │ │
│  │  │  │  │  CPU    │  │  NVIC   │  │ SysTick │           │  │  │ │
│  │  │  │  │ ARM M4F │  │         │  │         │           │  │  │ │
│  │  │  │  └────┬────┘  └────┬────┘  └────┬────┘           │  │  │ │
│  │  │  │       │            │            │                 │  │  │ │
│  │  │  │       └────────────┴────────────┘                 │  │  │ │
│  │  │  │                    │ Bus                          │  │  │ │
│  │  │  │       ┌────────────┼────────────┐                 │  │  │ │
│  │  │  │  ┌────┴────┐  ┌────┴────┐  ┌────┴────┐           │  │  │ │
│  │  │  │  │  Flash  │  │  SRAM   │  │  UART   │──► Terminal│  │ │ │
│  │  │  │  │ 512 KB  │  │  96 KB  │  │         │           │  │  │ │
│  │  │  │  └─────────┘  └─────────┘  └─────────┘           │  │  │ │
│  │  │  └───────────────────────────────────────────────────┘  │  │ │
│  │  │                         │                                │  │ │
│  │  │                         │ GDB Server (:3333)             │  │ │
│  │  │                         ▼                                │  │ │
│  │  │                   ┌───────────┐                          │  │ │
│  │  │                   │    GDB    │◄── VS Code Debugger      │  │ │
│  │  │                   └───────────┘                          │  │ │
│  │  └─────────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Development Workflow

### Phase 1: Pure Simulation (No Renode)

Start with the simplest approach - compile for your host PC:

```
┌─────────────────────────────────────────────────────────────────┐
│  Phase 1: Host PC Simulation                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Source Code          HAL Layer            Host Implementation  │
│  ┌──────────┐        ┌──────────┐         ┌──────────┐         │
│  │scheduler │        │  hal.h   │         │ hal_sim.c│         │
│  │   .c     │───────►│ abstract │────────►│ Windows/ │         │
│  │  ipc.c   │        │interface │         │ Linux    │         │
│  │  task.c  │        └──────────┘         └──────────┘         │
│  └──────────┘                                   │               │
│                                                 │               │
│                                                 ▼               │
│                                          ┌──────────┐          │
│                                          │  .exe    │          │
│                                          │ Runs on  │          │
│                                          │ your PC  │          │
│                                          └──────────┘          │
│                                                                 │
│  Benefits:                                                      │
│  ✓ Fast compile-run cycle (seconds)                            │
│  ✓ Full IDE debugging (VS Code, Visual Studio)                 │
│  ✓ Easy printf debugging                                       │
│  ✓ Unit tests with coverage                                    │
│  ✓ No special tools needed                                     │
│                                                                 │
│  Limitations:                                                   │
│  ✗ No real interrupt timing                                    │
│  ✗ No peripheral register access                               │
│  ✗ Different memory model                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Commands:**
```bash
# Windows
mkdir build && cd build
cmake -DBUILD_SIM=ON ..
cmake --build .
./jezgro_test.exe

# Linux
mkdir build && cd build
cmake -DBUILD_SIM=ON ..
make -j$(nproc)
./jezgro_test
```

### Phase 2: Renode Emulation

Cross-compile for ARM, run in Renode:

```
┌─────────────────────────────────────────────────────────────────┐
│  Phase 2: Renode Emulation                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Source Code          HAL Layer           STM32 Implementation  │
│  ┌──────────┐        ┌──────────┐         ┌──────────┐         │
│  │scheduler │        │  hal.h   │         │hal_stm32 │         │
│  │   .c     │───────►│ abstract │────────►│   .c     │         │
│  │  ipc.c   │        │interface │         │ Real HAL │         │
│  │  task.c  │        └──────────┘         └──────────┘         │
│  └──────────┘                                   │               │
│       │                                         │               │
│       │ ARM GCC                                 │               │
│       ▼                                         ▼               │
│  ┌─────────────────────────────────────────────────┐           │
│  │              jezgro_firmware.elf                │           │
│  │         (ARM Cortex-M4 binary)                  │           │
│  └─────────────────────────────────────────────────┘           │
│                          │                                      │
│                          │ Load into                            │
│                          ▼                                      │
│  ┌─────────────────────────────────────────────────┐           │
│  │                   RENODE                        │           │
│  │  ┌───────────────────────────────────────────┐ │           │
│  │  │         Virtual STM32G474                 │ │           │
│  │  │   Executes real ARM instructions          │ │           │
│  │  │   Real peripheral register access         │ │           │
│  │  │   Real interrupt handling                 │ │           │
│  │  └───────────────────────────────────────────┘ │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
│  Benefits:                                                      │
│  ✓ Real ARM instruction execution                              │
│  ✓ Accurate peripheral behavior                                │
│  ✓ Same binary as production                                   │
│  ✓ GDB debugging                                               │
│  ✓ Can simulate multiple nodes                                 │
│                                                                 │
│  Limitations:                                                   │
│  ✗ Slower than native simulation                               │
│  ✗ Some peripherals need custom models                         │
│  ✗ Timing not 100% cycle-accurate                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Commands:**
```bash
# Cross-compile for ARM
mkdir build-arm && cd build-arm
cmake -DCMAKE_TOOLCHAIN_FILE=../cmake/arm-none-eabi.cmake ..
make -j$(nproc)

# Run in Renode
renode ../renode/jezgro.resc
# In Renode console:
(monitor) start
```

### Phase 3: Swarm Simulation

Multiple emulated nodes communicating via virtual CAN:

```
┌─────────────────────────────────────────────────────────────────┐
│  Phase 3: Multi-Node Swarm Simulation                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Linux Host                             │  │
│  │                                                           │  │
│  │  ┌─────────┐    ┌─────────┐    ┌─────────┐              │  │
│  │  │ Renode  │    │ Renode  │    │ Renode  │              │  │
│  │  │ Node 0  │    │ Node 1  │    │ Node 2  │              │  │
│  │  │ (Leader)│    │(Follower│    │(Follower│              │  │
│  │  └────┬────┘    └────┬────┘    └────┬────┘              │  │
│  │       │              │              │                    │  │
│  │       │    vcan0     │              │                    │  │
│  │       └──────────────┴──────────────┘                    │  │
│  │                      │                                    │  │
│  │              ┌───────┴───────┐                           │  │
│  │              │  Virtual CAN  │                           │  │
│  │              │    Bus        │                           │  │
│  │              └───────────────┘                           │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Message Flow:                                                  │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  Node 0 (Leader)          Node 1              Node 2           │
│       │                      │                   │              │
│       │──── HEARTBEAT ──────►│                   │              │
│       │──── HEARTBEAT ───────────────────────────►              │
│       │                      │                   │              │
│       │◄─── STATUS ──────────│                   │              │
│       │◄─── STATUS ───────────────────────────────              │
│       │                      │                   │              │
│       │──── POWER_CMD ──────►│                   │              │
│       │                      │                   │              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Setup (Linux only for vcan):**
```bash
# Setup virtual CAN
sudo ./scripts/setup-vcan.sh 5

# Run Python swarm simulator
python3 sim/swarm_simulator.py --nodes 5 --duration 60

# Or with Renode nodes
# Terminal 1:
renode renode/jezgro.resc --port 1234 --can vcan0
# Terminal 2:
renode renode/jezgro.resc --port 1235 --can vcan0
# etc.
```

## Renode Platform Files Explained

### stm32g474.repl (Platform Description)

This file describes the virtual hardware:

```python
// CPU Definition
cpu: CPU.CortexM @ sysbus
    cpuType: "cortex-m4f"      // ARM Cortex-M4 with FPU
    nvic: nvic                  // Connect to interrupt controller

// Interrupt Controller
nvic: IRQControllers.NVIC @ sysbus 0xE000E000
    priorityMask: 0xF0          // 4-bit priority (16 levels)
    systickFrequency: 170000000 // 170 MHz clock
    -> cpu@0                    // IRQ output to CPU

// Memory Regions
flash: Memory.MappedMemory @ sysbus 0x08000000
    size: 0x80000               // 512 KB

sram1: Memory.MappedMemory @ sysbus 0x20000000
    size: 0x14000               // 80 KB

// Peripherals
usart1: UART.STM32_UART @ sysbus 0x40013800
    -> nvic@37                  // USART1 IRQ number

timer2: Timers.STM32_Timer @ sysbus 0x40000000
    -> nvic@28
    frequency: 170000000
```

### jezgro.resc (Test Scenario Script)

This file controls the emulation:

```python
# Create the virtual machine
mach create "jezgro"

# Load the hardware description
machine LoadPlatformDescription @stm32g474.repl

# Show UART output in terminal
showAnalyzer usart1

# Load the firmware
$firmware ?= @../build/jezgro_firmware.elf
sysbus LoadELF $firmware

# Define test macro
macro run_test
"""
    start           # Begin CPU execution
    sleep 5         # Run for 5 seconds
    pause           # Stop execution
    echo "Test complete"
"""

# Ready message
echo "JEZGRO Renode Simulation Ready"
echo "Commands: start, pause, step, quit"
```

## Debugging with Renode

### GDB Integration

Renode includes a GDB server for full debugging:

```
┌─────────────────────────────────────────────────────────────────┐
│  Debugging Architecture                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐         ┌─────────────────┐               │
│  │    VS Code      │         │     Renode      │               │
│  │                 │         │                 │               │
│  │  ┌───────────┐  │  TCP    │  ┌───────────┐  │               │
│  │  │  GDB MI   │◄─┼─:3333──►│  │ GDB Server│  │               │
│  │  │  Client   │  │         │  │           │  │               │
│  │  └───────────┘  │         │  └─────┬─────┘  │               │
│  │       │         │         │        │        │               │
│  │       ▼         │         │        ▼        │               │
│  │  ┌───────────┐  │         │  ┌───────────┐  │               │
│  │  │ Breakpts  │  │         │  │ Virtual   │  │               │
│  │  │ Variables │  │         │  │ STM32G474 │  │               │
│  │  │ Call Stack│  │         │  │           │  │               │
│  │  └───────────┘  │         │  └───────────┘  │               │
│  └─────────────────┘         └─────────────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Start GDB server in Renode:**
```
(monitor) machine StartGdbServer 3333
```

**Connect from GDB:**
```bash
arm-none-eabi-gdb build/jezgro_firmware.elf
(gdb) target remote :3333
(gdb) break main
(gdb) continue
```

**VS Code launch.json for Renode debugging:**
```json
{
    "name": "Debug (Renode)",
    "type": "cortex-debug",
    "request": "launch",
    "servertype": "external",
    "gdbTarget": "localhost:3333",
    "executable": "${workspaceFolder}/build-arm/jezgro_firmware.elf",
    "device": "STM32G474RE",
    "svdFile": "${workspaceFolder}/svd/STM32G474.svd"
}
```

### Debug Commands

| Command | Description |
|---------|-------------|
| `start` | Begin execution |
| `pause` | Stop execution |
| `step` | Single instruction |
| `sysbus ReadByte 0x20000000` | Read memory |
| `sysbus WriteByte 0x20000000 0x42` | Write memory |
| `cpu PC` | Get program counter |
| `cpu GetRegisterUnsafe 0` | Read R0 |
| `logLevel 0` | Maximum verbosity |

## Custom Peripheral Models

For peripherals not fully supported (like FDCAN), create Python models:

### Example: CAN-FD Stub

```python
# In stm32g474.repl
fdcan1: Python.PythonPeripheral @ sysbus 0x40006400
    size: 0x400
    initable: true
    filename: "fdcan_model.py"
```

**fdcan_model.py:**
```python
# FDCAN Register Model
CCCR = 0x00    # Control register
NBTP = 0x1C    # Nominal bit timing
DBTP = 0x0C    # Data bit timing
TEST = 0x10    # Test register

class FDCANModel:
    def __init__(self):
        self.cccr = 0x00000001  # INIT bit set
        self.tx_queue = []
        self.rx_queue = []

    def read(self, offset, width):
        if offset == 0x00:  # CCCR
            return self.cccr
        elif offset == 0x1C:  # NBTP
            return 0x00000000
        return 0

    def write(self, offset, width, value):
        if offset == 0x00:  # CCCR
            self.cccr = value
            if not (value & 0x01):  # INIT cleared
                self.log("FDCAN: Normal mode")
```

## Complete Development Process

### Step-by-Step Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    JEZGRO Development Process                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Step 1: Write Code                                        │  │
│  │ ════════════════════                                      │  │
│  │ • Edit kernel sources (scheduler.c, ipc.c, task.c)       │  │
│  │ • HAL functions are abstract - implementation separate    │  │
│  │ • Use standard C99, no compiler-specific features         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Step 2: Unit Test (Host PC)                               │  │
│  │ ═══════════════════════════                               │  │
│  │ $ cmake -DBUILD_SIM=ON .. && make && ./jezgro_test       │  │
│  │ • Fast iteration (< 1 second compile)                     │  │
│  │ • Full debugger support                                   │  │
│  │ • Test scheduler logic, IPC, task management              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Step 3: Renode Integration Test                           │  │
│  │ ═══════════════════════════════                           │  │
│  │ $ cmake -DCMAKE_TOOLCHAIN_FILE=arm-toolchain.cmake ..    │  │
│  │ $ make && renode jezgro.resc                              │  │
│  │ • Real ARM binary execution                               │  │
│  │ • Test interrupt handling                                 │  │
│  │ • Verify peripheral interactions                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Step 4: Swarm Simulation                                  │  │
│  │ ════════════════════════                                  │  │
│  │ $ python3 swarm_simulator.py --nodes 10                  │  │
│  │ • Test leader election algorithm                          │  │
│  │ • Verify CAN message protocols                            │  │
│  │ • Stress test with many nodes                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Step 5: CI/CD Validation                                  │  │
│  │ ════════════════════════                                  │  │
│  │ • Automatic on every git push                             │  │
│  │ • Builds for Windows + Linux                              │  │
│  │ • Runs all tests                                          │  │
│  │ • Static analysis (cppcheck)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Step 6: Hardware Validation (when available)              │  │
│  │ ════════════════════════════════════════════              │  │
│  │ • Flash same binary to real STM32G474                     │  │
│  │ • Verify timing with oscilloscope                         │  │
│  │ • Test real CAN-FD communication                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Daily Development Cycle

```
Morning:
  1. Pull latest changes
  2. Run unit tests (30 seconds)
  3. Start coding

During Development:
  1. Write/modify code
  2. Compile for host (< 1 second)
  3. Run specific test
  4. Repeat until working

Before Commit:
  1. Run full test suite
  2. Run Renode integration test
  3. Run swarm simulation
  4. Commit with descriptive message

CI Pipeline:
  1. Triggers on push
  2. Builds all configurations
  3. Runs all tests
  4. Reports results
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Renode can't find .elf | Use absolute path or `@` prefix for relative |
| GDB won't connect | Ensure `StartGdbServer 3333` is running |
| UART output missing | Add `showAnalyzer usart1` to script |
| Simulation hangs | Check for infinite loops, add timeout |
| Memory fault | Verify linker script memory regions |

### Debug Logging

Enable verbose logging in Renode:
```
logLevel -1          # All messages
logLevel 0 cpu       # CPU only
logLevel 1 sysbus    # Bus transactions
```

### Performance Tips

1. **Use quantum** for faster simulation:
   ```
   emulation SetGlobalQuantum "0.001"  # 1ms quantum
   ```

2. **Disable unused peripherals** in .repl file

3. **Use lightweight UART model** for just logging

## Installation

### Windows

```powershell
# Download from https://github.com/renode/renode/releases
# Or use Chocolatey:
choco install renode

# Verify
renode --version
```

### Linux

```bash
# Ubuntu/Debian
wget https://github.com/renode/renode/releases/download/v1.14.0/renode_1.14.0_amd64.deb
sudo dpkg -i renode_1.14.0_amd64.deb

# Or build from source
git clone https://github.com/renode/renode.git
cd renode
./build.sh
```

### macOS

```bash
# Homebrew
brew install renode
```

## Resources

- **Renode Documentation**: https://renode.readthedocs.io/
- **Renode GitHub**: https://github.com/renode/renode
- **STM32 Models**: https://github.com/renode/renode-infrastructure
- **Example Scripts**: https://github.com/renode/renode/tree/master/scripts

## Summary

| Development Phase | Tool | What It Tests | Speed |
|-------------------|------|---------------|-------|
| Unit Testing | Host compiler | Logic, algorithms | Very fast |
| Integration | Renode | Interrupts, peripherals | Medium |
| Swarm | Python + vcan | Multi-node protocols | Fast |
| Hardware | Real MCU | Everything | Slow |

With this workflow, ~80% of JEZGRO kernel development can be completed before hardware arrives, with high confidence that the code will work on real silicon.
