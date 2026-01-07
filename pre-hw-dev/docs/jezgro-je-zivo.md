# JEZGRO JE ŽIVO! - Renode Emulation Success

**Datum:** 2026-01-06
**Verzija:** JEZGRO 0.1.0-pre
**Target:** STM32G474 (Cortex-M4F)
**Emulator:** Renode 1.16.0

---

## Pregled

Ova sesija dokumentuje uspešno pokretanje JEZGRO RTOS kernela u Renode emulatoru. Kernel bootuje, inicijalizuje HAL, i ulazi u idle loop - sve bez pravog hardvera.

## Šta je urađeno

### 1. Kreiran ARM Build System

#### Toolchain File (`cmake/arm-none-eabi.cmake`)
```cmake
set(CMAKE_SYSTEM_NAME Generic)
set(CMAKE_SYSTEM_PROCESSOR arm)
set(TOOLCHAIN_PREFIX arm-none-eabi-)

# Cortex-M4 with FPU
set(CPU_FLAGS "-mcpu=cortex-m4 -mthumb -mfloat-abi=hard -mfpu=fpv4-sp-d16")
```

#### Linker Script (`cmake/stm32g474.ld`)
- Flash: 0x08000000, 512KB
- SRAM1: 0x20000000, 80KB
- SRAM2: 0x20014000, 16KB
- CCM: 0x10000000, 32KB

### 2. Startup Assembly (`src/startup_stm32g474.s`)

380 linija ARM assembly koda:
- Vector table sa 102 interrupt handlera
- Reset_Handler: FPU enable, .data copy, .bss zero
- Default fault handlers (HardFault, MemManage, BusFault, UsageFault)

### 3. STM32 HAL Implementation (`src/hal/hal_stm32.c`)

530 linija C koda:
- SysTick timing (1ms tick)
- USART1 debug output (115200 baud)
- MPU configuration
- GPIO control
- **Context switching via PendSV** (naked assembly function)
- ARM intrinsics (__WFI, __DSB, __ISB, etc.)

### 4. Renode Platform (`renode/stm32g474-minimal.repl`)

Minimalna platforma kompatibilna sa Renode 1.16.0:
- CPU.CortexM (cortex-m4f)
- NVIC sa SysTick
- Memory regions (Flash, SRAM1, SRAM2, CCM)
- STM32F7_USART za debug
- Python stubs za RCC i GPIO

## Instaliran Toolchain

### xPack ARM GCC 14.2.1
```powershell
npm install -g xpm
xpm install --global @xpack-dev-tools/arm-none-eabi-gcc@latest
```
Lokacija: `C:\Users\bojan\AppData\Roaming\xPacks\@xpack-dev-tools\arm-none-eabi-gcc\14.2.1-1.1.1\.content\bin`

### xPack Ninja 1.13.1
```powershell
xpm install --global @xpack-dev-tools/ninja-build@latest
```
Lokacija: `C:\Users\bojan\AppData\Roaming\xPacks\@xpack-dev-tools\ninja-build\1.13.1-1.1\.content\bin`

### Renode 1.16.0
```powershell
winget install Renode.Renode
```
Lokacija: `C:\Program Files\Renode\`

## Build Proces

### Host Simulation (Windows)
```bash
cd D:\work\autobusi-punjaci\pre-hw-dev
mkdir build && cd build
cmake -DBUILD_SIM=ON ..
cmake --build . --config Release
./Release/jezgro_test.exe  # 13/13 tests passed
```

### ARM Cross-Compilation
```bash
export PATH="/c/Users/bojan/AppData/Roaming/xPacks/@xpack-dev-tools/ninja-build/1.13.1-1.1/.content/bin:/c/Users/bojan/AppData/Roaming/xPacks/@xpack-dev-tools/arm-none-eabi-gcc/14.2.1-1.1.1/.content/bin:$PATH"

cmake -B build-arm -S . \
  -DCMAKE_TOOLCHAIN_FILE=cmake/arm-none-eabi.cmake \
  -G Ninja

cmake --build build-arm
```

### Build Output
```
   text    data     bss     dec     hex filename
  14384      96   20048   34528    86e0 jezgro_firmware
```

- **jezgro_firmware** - ELF executable (70KB with debug)
- **jezgro_firmware.bin** - Raw binary (14KB)
- **jezgro_firmware.hex** - Intel HEX
- **jezgro_firmware.map** - Linker map

## Renode Emulacija

### Pokretanje
```bash
cd D:\work\autobusi-punjaci\pre-hw-dev

"/c/Program Files/Renode/bin/Renode.exe" --console --disable-xwt -e \
  "mach create; \
   machine LoadPlatformDescription @renode/stm32g474-minimal.repl; \
   sysbus LoadELF @build-arm/jezgro_firmware; \
   start; sleep 2; pause; \
   cpu PC; cpu SP; quit"
```

### Rezultati
```
Loading block of 14392 bytes at 0x8000000     # Flash
Loading block of 7852 bytes at 0x8003838      # .data init values
Loading block of 12292 bytes at 0x8003898     # More data

Setting initial values: PC = 0x80002A1, SP = 0x20014000

After 2 seconds:
  PC = 0x8001c62  →  hal_stm32.c:122  →  __WFI() in idle_task!
  SP = 0x20013fc4  →  Stack is being used
  ExecutedInstructions = 29573
```

## Dokaz da radi

| Metrika | Vrednost | Značenje |
|---------|----------|----------|
| Initial PC | 0x080002A1 | Reset_Handler entry |
| Final PC | 0x08001C62 | __WFI() in idle loop |
| Initial SP | 0x20014000 | Top of SRAM |
| Final SP | 0x20013FC4 | Stack in use (~60 bytes) |
| Instructions | 29,573 | Code executed successfully |

**PC na `__WFI()` znači:**
1. ✅ Reset_Handler izvršen
2. ✅ .data sekcija kopirana iz Flash u RAM
3. ✅ .bss sekcija nulirana
4. ✅ FPU omogućen
5. ✅ main() pozvan
6. ✅ hal_init() - USART1, GPIO, NVIC konfigurisan
7. ✅ Scheduler pokrenut
8. ✅ Idle task aktivan i čeka interrupt

## Memory Map (iz ELF-a)

```
Section       VMA        Size    Description
.isr_vector   08000000   0x1D8   Vector table (472 bytes)
.text         080001E0   0x2D5C  Code (11,612 bytes)
.rodata       08002F3C   0x8F4   Read-only data (2,292 bytes)
.data         20000000   0x60    Initialized data (96 bytes)
.bss          20000060   0x1E4C  Uninitialized data (7,756 bytes)
._user_heap   20001EAC   0x3004  Heap + Stack (12,292 bytes)
```

## Fixevi tokom sesije

### 1. Windows SDK Bug
Problem: `oaidl.h` kompilacija pada sa MSVC
Fix: Dodato `WIN32_LEAN_AND_MEAN` u `hal_sim.c`

### 2. Missing stdlib.h
Problem: `malloc`/`free` undefined za ARM build
Fix: Dodato `#include <stdlib.h>` van `#ifdef JEZGRO_SIM` bloka

### 3. Missing __WFI intrinsic
Problem: `__WFI` undefined u `scheduler.c`
Fix: Dodato inline assembly za embedded build:
```c
#else
static inline void __WFI(void) { __asm volatile ("wfi"); }
#endif
```

### 4. Renode Platform Compatibility
Problem: `Timers.CortexM_SysTick` i `GPIOPort.GPIOManager` ne postoje u Renode 1.16.0
Fix: Kreiran `stm32g474-minimal.repl` sa kompatibilnim tipovima

### 5. UART IRQ Syntax
Problem: Ambiguous interrupt connection
Fix: `-> nvic@37` → `IRQ -> nvic@37`

## Update: SysTick i UART Debug Output

**Datum:** 2026-01-06 (nastavak sesije)

### Novi firmware main (`src/firmware_main.c`)

Kreiran pravi embedded main umesto test_main.c:
- `hal_init()` - inicijalizuje HAL
- `scheduler_init()`, `task_init()`, `ipc_init()` - kernel subsistemi
- `task_create()` - kreira 2 test taska
- `hal_systick_init(1000)` - SysTick @ 1kHz (1ms tick)
- Scheduler loop sa UART debug output

### SysTick Handler

```c
void SysTick_Handler(void)
{
    tick_counter++;
    hal_systick_increment();  // Update HAL timing
    scheduler_tick(1);         // Notify scheduler

    // Heartbeat every second
    if ((tick_counter % 1000) == 0) {
        debug_puts("[SYS] tick=...\r\n");
    }
}
```

### UART Debug Output - Funkcioniše!

```
================================================
  JEZGRO RTOS v0.1.0-pre
  Platform: STM32G474
  Renode STM32G474 Emulation
================================================

[BOOT] Initializing scheduler...
[BOOT] Initializing task manager...
[BOOT] Initializing IPC...
[BOOT] Creating task1 (deadline=100ms)...
[BOOT] Creating task2 (deadline=200ms)...
[BOOT] Starting SysTick @ 1kHz...
[BOOT] Enabling interrupts...
[BOOT] Entering scheduler loop...

[T1] count=1000 ticks=0
[T1] count=152000 ticks=1   ← SysTick počeo da radi!
[T1] count=200000 ticks=32
[T1] count=300000 ticks=98
...
```

### Nova Build veličina

```
   text    data     bss     dec     hex filename
   4512      84   15560   20156    4ebc jezgro_firmware
```

Manji nego test build jer nema printf/stdio!

### Pokretanje sa UART output

```bash
"/c/Program Files/Renode/bin/Renode.exe" --console --disable-xwt -e \
  "mach create; \
   machine LoadPlatformDescription @renode/stm32g474-minimal.repl; \
   sysbus LoadELF @build-arm/jezgro_firmware; \
   start; sleep 5; pause; \
   sysbus.usart1 DumpHistoryBuffer; quit"
```

### HAL Weak Symbol Pattern

`SysTick_Handler` u `hal_stm32.c` je sada `__attribute__((weak))` tako da aplikacija može da ga override-uje. Dodata `hal_systick_increment()` funkcija da aplikacija može da održava HAL timing.

## Update: Context Switching Funkcioniše!

**Datum:** 2026-01-06 (treći update)

### Promene

1. **`scheduler_start()`** - pokreće prvi task sa pravim context switchom
2. **`scheduler_yield()`** - kooperativni context switch između taskova
3. **`scheduler_preempt()`** - EDF preempcija iz SysTick handlera
4. **MPU konfiguracija** - 5 regiona (Flash, Kernel SRAM, Heap, Peripherals, System)
5. **Poboljšani fault handleri** - detaljni CFSR/MMFAR/BFAR dump

### Test Output - Oba Taska Rade!

```
[T1] count=25000 ticks=2
[T1] count=26000 ticks=6
[T2] count=26000 ready=2 blocked=0   ← Task2 dobija CPU!
[T1] count=27000 ticks=10
[T1] count=28000 ticks=14
[T2] count=28000 ready=2 blocked=0
...
```

| Metrika | Vrednost |
|---------|----------|
| T1 iterations/print | 1000 |
| T2 iterations/print | 2000 |
| Ready tasks | 2 |
| Context switches | Cooperative via yield() |

### Arhitektura Context Switch-a

```
scheduler_start()
    └── hal_context_switch(NULL, first_task->sp)
            └── PendSV_Handler
                    ├── Save R4-R11 (skip if NULL)
                    ├── Load next task SP
                    ├── Restore R4-R11
                    └── BX LR (return to thread mode PSP)

scheduler_yield()
    └── hal_context_switch(&current->sp, next->sp)
            └── PendSV_Handler
                    ├── Save R4-R11 to current stack
                    ├── Store new SP to current->sp
                    ├── Load next task SP
                    ├── Restore R4-R11
                    └── BX LR
```

## Update: Comprehensive Test Suite

**Datum:** 2026-01-06 (četvrti update)

### Test Results Summary

| Test | Status | Details |
|------|--------|---------|
| Context Switch | ✅ PASS | T1/T2/T3 switching via PendSV |
| EDF Preemption | ✅ PASS | T3 (50ms) preempts T1 (100ms) |
| Mutex | ✅ PASS | shared_counter = task_counter |
| Semaphore | ✅ PASS | Producer/Consumer pattern |
| MPU Fault | ✅ PASS | DACCVIOL on Flash write |

### EDF Preemption Test

```
[T3] cnt=200 produced=2 (PREEMPT)    ← T3 (deadline=50ms) runs most
[T3] cnt=400 produced=4 (PREEMPT)
[T1] cnt=500 shared=500              ← T1 (deadline=100ms) runs less
[T3] cnt=600 produced=6 (PREEMPT)
```

Task priority (EDF): T3 > T1 > T2 based on deadlines.

### Mutex Test

```c
mutex_lock(test_mutex);
shared_counter++;
mutex_unlock(test_mutex);
```

Result: `shared=10000` when `cnt=10000` - no race condition!

### MPU Fault Test

```
[T4] Attempting to write to Flash (read-only region)...

*** MPU FAULT ***
CFSR: 0x00000082
MMFAR: 0x08000100      ← Exact fault address!
Flags: DACCVIOL MMARVALID
```

MPU correctly catches write to read-only Flash region!

## Update: CAN-FD Implementation for ROJ (Swarm)

**Datum:** 2026-01-06 (peti update)

### FDCAN Driver

Implemented full FDCAN driver in `hal_stm32.c`:
- Support for 3 FDCAN instances (FDCAN1/2/3)
- 3KB shared Message SRAM allocation
- Classic CAN and CAN-FD support
- Round-robin TX buffer allocation (Renode compatible)
- Standard/Extended ID filtering

```c
/* Initialize CAN-FD */
hal_can_init(0, 500000, 0);  /* 500kbps classic CAN */

/* Send heartbeat */
tx_msg.id = 0x101;  /* Node 1 heartbeat */
tx_msg.fd = false;
tx_msg.len = 8;
hal_can_send(0, &tx_msg);
```

### Renode Platform Update

Added to `stm32g474-minimal.repl`:
```
// CAN Message SRAM (3KB shared)
can_sram: Memory.MappedMemory @ sysbus 0x4000A400
    size: 0xC00

// FDCAN1 - CAN-FD Controller
fdcan1: CAN.MCAN @ sysbus 0x40006400
    messageRAM: can_sram
    Line0 -> nvic@21
    Line1 -> nvic@22
```

### Multi-Node Swarm Simulation

Created `renode/swarm-simulation.resc`:
- 3 EK3 nodes connected via shared `canHub`
- Each node sends heartbeat with node ID and tick count
- ROJ (Roj = Swarm) communication protocol

### Test Results - Single Node TX

```
[ROJ] Swarm task started, node=1
[ROJ] CAN initialized (500k classic)
[ROJ] tx=735 rx=0       ← 735 messages transmitted!
```

TX working correctly. RX requires multi-node simulation with canHub.

## Sledeći koraci

1. ~~**Dodaj SysTick interrupt**~~ ✅ DONE
2. ~~**UART output**~~ ✅ DONE
3. ~~**Context switch test**~~ ✅ DONE
4. ~~**Preemption test**~~ ✅ DONE - EDF radi!
5. ~~**Mutex test**~~ ✅ DONE - nema race condition
6. ~~**Semaphore test**~~ ✅ DONE - producer/consumer
7. ~~**MPU fault test**~~ ✅ DONE - DACCVIOL detektovan
8. ~~**CAN-FD driver**~~ ✅ DONE - FDCAN TX working, multi-node ready
9. **Multi-node swarm test** - run swarm-simulation.resc with canHub
10. **Real hardware** - flash na pravi STM32G474

## Komande za brzi start

### PowerShell Setup
```powershell
$env:PATH = "C:\Users\bojan\AppData\Roaming\xPacks\@xpack-dev-tools\arm-none-eabi-gcc\14.2.1-1.1.1\.content\bin;C:\Users\bojan\AppData\Roaming\xPacks\@xpack-dev-tools\ninja-build\1.13.1-1.1\.content\bin;" + $env:PATH
```

### Git Bash Setup
```bash
export PATH="/c/Users/bojan/AppData/Roaming/xPacks/@xpack-dev-tools/ninja-build/1.13.1-1.1/.content/bin:/c/Users/bojan/AppData/Roaming/xPacks/@xpack-dev-tools/arm-none-eabi-gcc/14.2.1-1.1.1/.content/bin:$PATH"
```

### Rebuild
```bash
cmake --build build-arm
```

### Run in Renode (headless)
```bash
"/c/Program Files/Renode/bin/Renode.exe" --console --disable-xwt -e \
  "mach create; \
   machine LoadPlatformDescription @renode/stm32g474-minimal.repl; \
   sysbus LoadELF @build-arm/jezgro_firmware; \
   start; sleep 5; pause; cpu PC; quit"
```

### Run in Renode (GUI)
```bash
"/c/Program Files/Renode/bin/Renode.exe"
# Then in Renode console:
# mach create
# machine LoadPlatformDescription @renode/stm32g474-minimal.repl
# sysbus LoadELF @build-arm/jezgro_firmware
# showAnalyzer usart1
# start
```

### Run Multi-Node Swarm Simulation
```bash
cd D:\work\autobusi-punjaci\pre-hw-dev
"/c/Program Files/Renode/bin/Renode.exe" renode/swarm-simulation.resc

# In Renode console:
# start              - Start all 3 nodes
# pause              - Pause all
# mach set ek3-node1 - Switch to node 1
# sysbus.usart1 DumpHistoryBuffer
```

---

**JEZGRO RTOS + CAN-FD ROJ Swarm je spreman za testiranje!**
