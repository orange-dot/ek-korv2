# JEZGRO RTOS Debugging Guide

## Prerequisites

1. **VS Code Extensions** (install from Extensions panel):
   - `marus25.cortex-debug` - Cortex-Debug
   - `ms-vscode.cpptools` - C/C++ (Microsoft)

2. **Tools**:
   - ARM GCC Toolchain (arm-none-eabi-gdb)
   - Renode (installed at `C:\Program Files\Renode`)

## Quick Start (Windows)

### Step 1: Start Renode

Double-click **`debug-renode.bat`** in the `pre-hw-dev` folder.

Or from terminal:
```cmd
D:\work\autobusi-punjaci\pre-hw-dev\debug-renode.bat
```

This opens Renode GUI with:
- GDB server on port 3333
- UART analyzer window (shows debug output)

### Step 2: Attach VS Code Debugger

1. Open `pre-hw-dev` folder in VS Code
2. Press `F5` (or Run → Start Debugging)
3. Select **"Attach to Renode"**

### Step 3: Start Emulation

In Renode console, type:
```
start
```

Debugger will hit breakpoints, show variables, etc.

## Debugging Features

### Breakpoints
- Click left of line number to set breakpoint
- Works in C code and assembly

### Variable Inspection
- Hover over variables
- Watch panel for expressions
- Locals panel for current scope

### Peripheral Registers
- SVD file provides register definitions
- View > Debug Console shows CORTEX PERIPHERALS panel
- Expand to see all STM32G474 registers (GPIOA, USART1, TIM1, etc.)

### Memory View
- Debug Console: `x/16x 0x20000000` (view 16 words at address)
- Or use Memory panel

### Call Stack
- Shows current execution path
- Click to navigate

## Renode Commands (in Renode console)

```
start           # Start emulation
pause           # Pause emulation
step            # Single step
cpu PC          # Show program counter
sysbus ReadDoubleWord 0x20000000    # Read memory
sysbus.usart1 DumpHistoryBuffer     # Show UART output
quit            # Exit
```

## Common Debug Scenarios

### 1. Debug Boot Sequence
```
- Set breakpoint at main()
- Start debugging
- Step through initialization
```

### 2. Debug Task Switching
```
- Set breakpoint at PendSV_Handler
- Or scheduler_yield()
- Watch current_task and next_task variables
```

### 3. Debug MPU Fault
```
- Set breakpoint at MemManage_Handler
- Check SCB_CFSR and SCB_MMFAR values
```

### 4. Inspect Task Stacks
```
- In debug console: x/32x task->sp
- Shows saved registers R4-R11, then R0-R3, R12, LR, PC, xPSR
```

## Troubleshooting

### "Connection refused"
- Renode not running or GDB server not started
- Check Renode console for errors

### "Target not halted"
- Emulation is running
- In Renode: `pause`

### "No symbol table"
- Build with debug symbols: `-g -O0`
- Check that executable path is correct

### Breakpoint not hit
- Ensure code path is executed
- Check optimization level (use -O0 for debugging)

## VS Code Tasks

| Task | Description |
|------|-------------|
| ARM Build | Build firmware for STM32G474 |
| Start Renode GDB Server | Launch Renode with GDB |
| Run in Renode | Build and run (no debug) |

Access via: Terminal > Run Task

## Project Files

| File | Description |
|------|-------------|
| `debug-renode.bat` | Windows batch to start Renode debug session |
| `renode/debug.resc` | Renode script with GDB server config |
| `renode/stm32g474-minimal.repl` | STM32G474 platform definition |
| `renode/STM32G474.svd` | Peripheral register definitions |
| `.vscode/launch.json` | VS Code debug configurations |
| `.vscode/tasks.json` | Build and run tasks |
| `build-arm/jezgro_firmware` | ARM ELF binary with debug symbols |
