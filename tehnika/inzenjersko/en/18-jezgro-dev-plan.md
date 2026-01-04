# JEZGRO Development Plan

## Document Information

| Field | Value |
|-------|-------|
| Document ID | EK-TECH-019 |
| Version | 1.0 |
| Date | 2026-01-04 |
| Status | Active |
| Related | 16-jezgro.md, 17-jezgro-dev-bom.md |

---

## 1. Recommended Start (~€290)

**Start with 10 NUCLEO boards - enables full swarm development from day one.**

### 1.1 Hardware

| Item | Part Number | Qty | Unit € | Total € |
|------|-------------|-----|--------|---------|
| NUCLEO-G474RE | NUCLEO-G474RE | 10 | 24 | 240 |
| USB cables | Micro-B | 10 | 3 | 30 |
| USB hub | 10-port powered | 1 | 20 | 20 |
| **TOTAL** | | | | **€290** |

**Why 10 boards?**
- Full swarm testing (leader election, consensus, fault tolerance)
- Parallel development (multiple team members)
- Spare boards for experiments
- Only €240 more than single board - trivial for project of this scope

### 1.2 What NUCLEO-G474RE Provides

| Feature | Specification |
|---------|---------------|
| MCU | STM32G474RET6 (Cortex-M4 @ 170MHz) |
| RAM | 128 KB (sufficient for all JEZGRO services) |
| Flash | 512 KB |
| MPU | 8 regions (key for fault isolation) |
| Debugger | Integrated ST-LINK/V2-1 |
| Power | USB powered |
| User I/O | 1 LED, 1 button |

### 1.3 Software (Free)

**Primary toolchain:**

| Tool | Purpose | Download |
|------|---------|----------|
| VS Code | Editor/IDE | code.visualstudio.com |
| ARM GCC | Compiler (arm-none-eabi-gcc) | developer.arm.com |
| OpenOCD | Debugger/flasher | openocd.org |
| Cortex-Debug | VS Code debug extension | VS Code marketplace |

**Alternative (all-in-one):**
- STM32CubeIDE - includes everything but heavier

### 1.4 What You Can Develop

With 10 NUCLEO boards - **everything from day one:**

| Component | Status |
|-----------|--------|
| Kernel core | Full development |
| EDF Scheduler | Full development |
| MPU manager | Full development |
| Context switching | Full development |
| IPC message passing | Full development |
| Reincarnation server | Full development |
| Watchdog system | Full development |
| All user services | Full development |
| CAN-FD communication | Full development |
| Swarm coordination | **Full development (10 nodes!)** |
| Leader election | Full development |
| Fault tolerance | Full development |

---

## 2. Development Phases

### Phase 1: Kernel Core (~€27)

**Hardware:** 1× NUCLEO-G474RE

**Goals:**
- [ ] Boot sequence and clock configuration
- [ ] EDF scheduler implementation
- [ ] Context switch with MPU reconfiguration
- [ ] Basic task creation and management
- [ ] Kernel tick timer (SysTick)

**Duration estimate:** Foundation work

### Phase 2: Fault Isolation (~€27)

**Hardware:** Same as Phase 1

**Goals:**
- [ ] MPU region configuration
- [ ] MemManage fault handler
- [ ] Stack overflow detection
- [ ] Service memory isolation
- [ ] Privilege level separation

**Test method:** Intentionally cause faults, verify isolation

### Phase 3: IPC System (~€27)

**Hardware:** Same as Phase 1

**Goals:**
- [ ] Message pool allocation (lock-free)
- [ ] Synchronous send/receive
- [ ] Asynchronous messaging
- [ ] Broadcast mechanism
- [ ] Service mailboxes

**Test method:** Inter-service communication benchmarks

### Phase 4: Reincarnation Server (~€27)

**Hardware:** Same as Phase 1

**Goals:**
- [ ] Per-service watchdog monitoring
- [ ] Automatic fault detection
- [ ] Service restart without system reset
- [ ] State preservation hooks
- [ ] Exponential backoff for repeated failures

**Test method:** Kill services, measure restart time (<50ms target)

### Phase 5: CAN-FD Integration (~€60)

**Hardware:** 2× NUCLEO-G474RE + 2× CAN transceiver

| Item | € |
|------|---|
| 2nd NUCLEO-G474RE | 24 |
| SN65HVD230 breakout × 2 | 8 |
| Jumper wires | 5 |
| **Additional cost** | **€37** |

**Goals:**
- [ ] CAN-FD driver (5 Mbps)
- [ ] CAN ↔ IPC message translation
- [ ] Multi-node communication
- [ ] Message routing

### Phase 6: Swarm Testing (~€115)

**Hardware:** 3× NUCLEO + CAN bus + analyzer

| Item | € |
|------|---|
| 3rd NUCLEO-G474RE | 24 |
| SN65HVD230 breakout (3rd) | 4 |
| Logic analyzer 24MHz | 15 |
| Canable Pro (PC interface) | 80 |
| **Additional cost** | **€123** |

**Goals:**
- [ ] Leader election (Raft-inspired)
- [ ] Heartbeat protocol
- [ ] Distributed consensus
- [ ] Fault tolerance testing

### Phase 7: Production Prototype (~€165)

**Hardware:** Custom PCB with discrete components

See `17-jezgro-dev-bom.md` Section 3 for full BOM.

**Goals:**
- [ ] Custom hardware validation
- [ ] Thermal testing
- [ ] EMC pre-compliance
- [ ] Production-representative performance

---

## 3. Cumulative Investment

| Phase | Added € | Total € | Hardware |
|-------|---------|---------|----------|
| 1-6 | 290 | 290 | 10× NUCLEO + USB hub |
| +CAN | 120 | 410 | + 10× CAN transceiver + Canable |
| +Debug | 30 | 440 | + Logic analyzer + UART adapters |
| 7 | 165 | 605 | + Custom prototype PCBs |

**Note:** Starting with 10 boards eliminates incremental hardware purchases and enables parallel workstreams.

---

## 4. Development Milestones

### Milestone 1: Kernel Boot
- System boots to idle task
- Tick timer running
- Serial debug output working

### Milestone 2: MPU Isolation
- Two tasks running in separate MPU regions
- Fault in Task A does not crash Task B
- MemManage handler catches violations

### Milestone 3: IPC Working
- Task A sends message to Task B
- Task B receives and responds
- Zero-copy transfer verified

### Milestone 4: Auto-Recovery
- Service intentionally crashed
- Reincarnation server detects fault
- Service restarts within 50ms
- State preserved across restart

### Milestone 5: Multi-Node CAN
- Two NUCLEO boards communicate via CAN-FD
- Messages translated to internal IPC
- Latency < 1ms verified

### Milestone 6: Swarm Operational
- 3+ nodes elect leader
- Leader failure triggers re-election
- System continues operating

---

## 5. Quick Start Guide

### Step 1: Get Hardware
```
Order: 10× NUCLEO-G474RE (~€240, Mouser/DigiKey)
Order: 10× USB Micro-B cables (~€30)
Order: 1× 10-port powered USB hub (~€20)
Total: ~€290, delivery 2-5 days
```

### Step 2: Install Toolchain
```
1. VS Code          → code.visualstudio.com
2. ARM GCC          → developer.arm.com/downloads/-/gnu-rm
3. OpenOCD          → github.com/openocd-org/openocd/releases
4. Cortex-Debug     → VS Code Extensions → "Cortex-Debug"
5. C/C++ Extension  → VS Code Extensions → "C/C++"
```

### Step 3: Create Project
```
mkdir jezgro && cd jezgro
git init
# Copy CMakeLists.txt from 16-jezgro.md Section 11
# Copy linker script STM32G474RETX_FLASH.ld
# Copy startup files from STM32CubeG4
```

### Step 4: Build & Flash
```
mkdir build && cd build
cmake ..
make -j8
make flash   # Uses OpenOCD + ST-LINK
```

### Step 5: Start Coding
```
Begin with: Kernel tick timer + basic scheduler
Reference: 16-jezgro.md Section 3 (Kernel Components)
```

---

## 6. Reference Documents

| Document | Content |
|----------|---------|
| 16-jezgro.md | Full RTOS specification |
| 17-jezgro-dev-bom.md | Complete BOM list |
| 14-firmware-architecture.md | FreeRTOS baseline |
| SPECIFICATIONS.md | EK3 hardware specs |

---

## Change History

| Date | Version | Description |
|------|---------|-------------|
| 2026-01-04 | 1.0 | Initial version |
