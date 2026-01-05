# JEZGRO Development Simulation Guide

## Document Information

| Field | Value |
|-------|-------|
| Document ID | EK-TECH-022 |
| Version | 1.0 |
| Date | 2026-01-04 |
| Status | Active |
| Related | 16-jezgro.md, 19-jezgro-dev-alternatives.md |

---

## 1. Overview

JEZGRO development can begin immediately using simulation and emulation tools. This document covers options for each component of the Hybrid architecture.

### 1.1 What Can Be Simulated

| Component | Simulation Quality | Recommended Tool |
|-----------|-------------------|------------------|
| JEZGRO Kernel (ARM) | ★★★★★ Excellent | Renode, QEMU |
| STM32G474 peripherals | ★★★★☆ Very Good | Renode |
| **Infineon XMC4400** | ★★★★☆ Very Good | **Renode (custom platform)** |
| AURIX TriCore | ★★★☆☆ Limited | TSIM, ADS Simulator |
| TI C2000 | ★★★☆☆ Limited | CCS Simulator |
| ESP32-S3 | ★★★★☆ Very Good | Wokwi, QEMU |
| CAN-FD Bus | ★★★★★ Excellent | vcan, python-can |
| Multi-node Swarm | ★★★★☆ Very Good | Docker + vcan |

> **NEW:** Infineon XMC4400 (ARM Cortex-M4 with 150ps HRPWM) can be emulated in Renode using custom platform files. See `pre-hw-dev/renode/xmc4400.repl` for the platform definition.

---

## 2. Recommended Development Strategy

### 2.1 Phase 0: Pre-Hardware Development

```
┌─────────────────────────────────────────────────────────────┐
│                SIMULATION-FIRST APPROACH                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Week 1-2: Host PC Development                               │
│  ├── Unit tests for kernel algorithms                        │
│  ├── Scheduler logic (EDF)                                   │
│  ├── IPC message passing                                     │
│  └── Data structures                                         │
│                                                              │
│  Week 3-4: ARM Simulation (Renode/QEMU)                      │
│  ├── Boot sequence                                           │
│  ├── Context switching                                       │
│  ├── MPU configuration                                       │
│  └── Interrupt handling                                      │
│                                                              │
│  Week 5-6: Virtual CAN Network                               │
│  ├── CAN-FD protocol stack                                   │
│  ├── Multi-node communication                                │
│  ├── Leader election                                         │
│  └── Swarm coordination                                      │
│                                                              │
│  Week 7+: Hardware Arrives → Port & Validate                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Tool-by-Tool Setup

### 3.1 Renode (Recommended for STM32)

**Renode** is an open-source embedded systems simulator from Antmicro. Excellent for ARM Cortex-M development.

#### Installation

```bash
# Windows (via installer)
# Download from: https://renode.io/download/

# Linux
wget https://github.com/renode/renode/releases/download/v1.14.0/renode_1.14.0_amd64.deb
sudo dpkg -i renode_1.14.0_amd64.deb

# macOS
brew install renode
```

#### STM32G474 Platform File

Create `stm32g474.repl`:

```
// STM32G474 Platform Description for Renode

cpu: CPU.CortexM @ sysbus
    cpuType: "cortex-m4f"
    nvic: nvic

nvic: IRQControllers.NVIC @ sysbus 0xE000E000
    -> cpu@0

flash: Memory.MappedMemory @ sysbus 0x08000000
    size: 0x80000  // 512 KB

sram: Memory.MappedMemory @ sysbus 0x20000000
    size: 0x20000  // 128 KB

usart1: UART.STM32_UART @ sysbus 0x40013800
    -> nvic@37

fdcan1: CAN.STMCAN @ sysbus 0x40006400
    -> nvic@21

timer2: Timers.STM32_Timer @ sysbus 0x40000000
    -> nvic@28
    frequency: 170000000

systick: Timers.CortexM_SysTick @ sysbus 0xE000E010
    -> nvic@-1
    frequency: 170000000
```

#### Running JEZGRO in Renode

```bash
# Start Renode
renode

# In Renode console:
mach create
machine LoadPlatformDescription @stm32g474.repl
sysbus LoadELF @jezgro.elf
showAnalyzer usart1
start
```

#### VS Code Integration

Install "Renode" extension, add to `.vscode/launch.json`:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug JEZGRO (Renode)",
            "type": "cortex-debug",
            "request": "launch",
            "servertype": "external",
            "gdbTarget": "localhost:3333",
            "executable": "${workspaceFolder}/build/jezgro.elf",
            "preLaunchTask": "Start Renode"
        }
    ]
}
```

---

### 3.2 QEMU (Alternative for ARM)

QEMU supports Cortex-M4 but with less peripheral coverage than Renode.

#### Installation

```bash
# Windows
# Download from: https://www.qemu.org/download/#windows

# Linux
sudo apt install qemu-system-arm

# macOS
brew install qemu
```

#### Running

```bash
qemu-system-arm \
    -machine lm3s6965evb \
    -cpu cortex-m4 \
    -nographic \
    -kernel jezgro.elf \
    -S -gdb tcp::3333
```

**Note:** QEMU's STM32 support is limited. Use Renode for better STM32G4 simulation.

---

### 3.3 Virtual CAN Bus (Linux)

Essential for simulating multi-node swarm communication.

#### Setup vcan Interface

```bash
# Load kernel module
sudo modprobe vcan

# Create virtual CAN interfaces
sudo ip link add dev vcan0 type vcan
sudo ip link set up vcan0

# Create multiple interfaces for swarm simulation
for i in {0..9}; do
    sudo ip link add dev vcan$i type vcan
    sudo ip link set up vcan$i
done
```

#### Python CAN Simulation

```python
#!/usr/bin/env python3
"""
JEZGRO CAN-FD Swarm Simulator
Simulates multiple JEZGRO nodes communicating over virtual CAN
"""

import can
import threading
import time
import random

class JezgroNode:
    """Simulates a JEZGRO node on CAN bus"""

    # Message IDs from JEZGRO spec
    MSG_HEARTBEAT = 0x100
    MSG_LEADER_ELECTION = 0x110
    MSG_POWER_STATUS = 0x200
    MSG_TELEMETRY = 0x400

    def __init__(self, node_id: int, bus: can.Bus):
        self.node_id = node_id
        self.bus = bus
        self.is_leader = False
        self.leader_id = None
        self.running = True

    def send_heartbeat(self):
        """Send periodic heartbeat"""
        msg = can.Message(
            arbitration_id=self.MSG_HEARTBEAT + self.node_id,
            data=[self.node_id, int(self.is_leader), 0, 0, 0, 0, 0, 0],
            is_fd=True,
            bitrate_switch=True
        )
        self.bus.send(msg)

    def handle_message(self, msg: can.Message):
        """Process incoming CAN message"""
        msg_type = msg.arbitration_id & 0xF00

        if msg_type == self.MSG_HEARTBEAT:
            sender_id = msg.data[0]
            is_leader = msg.data[1]
            if is_leader:
                self.leader_id = sender_id

        elif msg_type == self.MSG_LEADER_ELECTION:
            # Simple leader election: lowest ID wins
            candidate_id = msg.data[0]
            if candidate_id < self.node_id:
                self.is_leader = False

    def run(self):
        """Main node loop"""
        print(f"Node {self.node_id} started")

        # Listener thread
        def listener():
            while self.running:
                msg = self.bus.recv(timeout=0.1)
                if msg:
                    self.handle_message(msg)

        listener_thread = threading.Thread(target=listener)
        listener_thread.start()

        # Main loop
        while self.running:
            self.send_heartbeat()
            time.sleep(0.1)  # 100ms heartbeat

        listener_thread.join()


def simulate_swarm(num_nodes: int = 5):
    """Run swarm simulation with multiple nodes"""

    # Create virtual CAN bus
    bus = can.Bus('vcan0', bustype='socketcan', fd=True)

    # Create nodes
    nodes = []
    threads = []

    for i in range(num_nodes):
        node = JezgroNode(node_id=i, bus=bus)
        nodes.append(node)
        t = threading.Thread(target=node.run)
        threads.append(t)
        t.start()

    # Let simulation run
    try:
        print(f"Swarm simulation running with {num_nodes} nodes...")
        print("Press Ctrl+C to stop")
        while True:
            time.sleep(1)
            # Print status
            for node in nodes:
                status = "LEADER" if node.is_leader else f"follower (leader={node.leader_id})"
                print(f"  Node {node.node_id}: {status}")
            print()

    except KeyboardInterrupt:
        print("\nStopping simulation...")
        for node in nodes:
            node.running = False
        for t in threads:
            t.join()

    bus.shutdown()


if __name__ == "__main__":
    simulate_swarm(5)
```

#### Windows Alternative: python-can with Virtual Bus

```python
# For Windows without vcan, use virtual bus
import can

# Create virtual bus (works on all platforms)
bus1 = can.Bus('test', bustype='virtual', fd=True)
bus2 = can.Bus('test', bustype='virtual', fd=True)

# Messages sent on bus1 are received on bus2 and vice versa
```

---

### 3.4 Wokwi (ESP32 Simulation)

**Wokwi** is a free online simulator for ESP32, Arduino, and other microcontrollers.

#### Online Simulator

Visit: https://wokwi.com/

Create new ESP32-S3 project, supports:
- WiFi simulation
- GPIO, I2C, SPI
- UART (including to other simulated devices)
- Display simulation

#### VS Code Extension

```bash
# Install Wokwi extension in VS Code
# Then add wokwi.toml to project:
```

```toml
[wokwi]
version = 1
firmware = "build/esp32-jezgro.bin"
elf = "build/esp32-jezgro.elf"

[[chip]]
name = "esp32-s3"

[[uart]]
id = "uart0"
baud = 115200
```

---

### 3.5 Infineon XMC4400 Simulation (NEW)

**XMC4400** is an alternative to TI C2000 for power control, with the same **150ps HRPWM resolution** but ARM Cortex-M4 architecture (Renode-compatible!).

#### Custom Renode Platform

Platform files are available in `pre-hw-dev/renode/`:
- `xmc4400.repl` - Platform definition (CPU, memory, peripherals)
- `jezgro-xmc.resc` - Test scenario

#### Running XMC4400 in Renode

```bash
cd pre-hw-dev
renode renode/jezgro-xmc.resc
(monitor) start
```

#### What's Emulated

| Peripheral | Status | Notes |
|------------|--------|-------|
| CPU (Cortex-M4F) | ✅ Full | ARM core fully supported |
| HRPWM | ⚠️ Stub | Registers + logging, no waveforms |
| VADC (ADC) | ⚠️ Stub | Returns mid-scale values |
| CAN | ⚠️ Stub | Basic register model |
| USIC (UART) | ✅ Works | Uses STM32 UART model |
| GPIO | ✅ Works | Uses STM32 GPIO model |
| CCU4/CCU8 Timers | ✅ Works | Basic timing |

#### Why XMC4400 Over C2000?

| Feature | XMC4400 | C2000 |
|---------|---------|-------|
| Renode Emulation | ✅ Yes (custom) | ❌ No |
| HRPWM | 150 ps | 150 ps |
| Architecture | ARM (familiar) | C28x (proprietary) |
| Vendor | Same as AURIX | TI only |

For power control development before hardware arrives, XMC4400 with Renode is recommended.

---

### 3.6 AURIX Simulation (Limited)

Infineon provides limited simulation in AURIX Development Studio.

#### AURIX Development Studio Simulator

1. Install AURIX Development Studio (ADS)
2. Create project for TC375
3. Use "Simulation" debug configuration
4. Limited peripheral support, but CPU simulation works

#### TSIM (TriCore Instruction Set Simulator)

Part of Tasking toolchain (commercial), provides:
- Instruction-accurate simulation
- Performance profiling
- No peripheral simulation

#### Practical Approach for AURIX

```
Since AURIX simulation is limited:

1. Develop JEZGRO kernel core on simulated STM32 (Renode)
2. Abstract hardware layer (HAL) for portability
3. Test algorithms and logic in simulation
4. Port to AURIX when hardware arrives
5. AURIX-specific features (lockstep, HSM) test on real hardware
```

---

### 3.6 Docker-Based Multi-Node Simulation

Run complete swarm simulation in containers.

#### Dockerfile

```dockerfile
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    python3 \
    python3-pip \
    can-utils \
    iproute2 \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install python-can

WORKDIR /jezgro
COPY . .

CMD ["python3", "sim/swarm_simulator.py"]
```

#### Docker Compose for Swarm

```yaml
version: '3.8'

services:
  jezgro-node-0:
    build: .
    environment:
      - NODE_ID=0
      - IS_LEADER=true
    cap_add:
      - NET_ADMIN
    networks:
      - canbus

  jezgro-node-1:
    build: .
    environment:
      - NODE_ID=1
    cap_add:
      - NET_ADMIN
    networks:
      - canbus

  jezgro-node-2:
    build: .
    environment:
      - NODE_ID=2
    cap_add:
      - NET_ADMIN
    networks:
      - canbus

  # Add more nodes as needed...

networks:
  canbus:
    driver: bridge
```

---

## 4. Unit Testing on Host PC

Before any simulation, develop core algorithms on host PC.

### 4.1 Project Structure

```
jezgro/
├── src/
│   ├── kernel/
│   │   ├── scheduler.c      # EDF scheduler
│   │   ├── ipc.c            # Message passing
│   │   └── context.c        # Context switching (ARM-specific)
│   ├── hal/
│   │   ├── hal.h            # Hardware abstraction
│   │   ├── hal_stm32.c      # STM32 implementation
│   │   ├── hal_aurix.c      # AURIX implementation
│   │   └── hal_sim.c        # Simulation stub
│   └── services/
│       ├── power_ctrl.c
│       └── can_gateway.c
├── test/
│   ├── test_scheduler.c
│   ├── test_ipc.c
│   └── test_swarm.c
├── sim/
│   ├── swarm_simulator.py
│   └── can_monitor.py
└── CMakeLists.txt
```

### 4.2 CMake for Host Testing

```cmake
cmake_minimum_required(VERSION 3.16)
project(jezgro)

# Option for simulation build
option(BUILD_SIM "Build for simulation/testing" ON)

if(BUILD_SIM)
    # Host PC build for testing
    add_definitions(-DJEZGRO_SIM)

    add_executable(jezgro_test
        src/kernel/scheduler.c
        src/kernel/ipc.c
        src/hal/hal_sim.c
        test/test_scheduler.c
        test/test_ipc.c
    )

    target_link_libraries(jezgro_test pthread)

else()
    # Cross-compile for target
    set(CMAKE_TOOLCHAIN_FILE cmake/arm-none-eabi.cmake)
    # ... target build config
endif()
```

### 4.3 Example: EDF Scheduler Test

```c
// test/test_scheduler.c
#include <stdio.h>
#include <assert.h>
#include "../src/kernel/scheduler.h"

void test_edf_priority(void) {
    scheduler_init();

    // Create tasks with different deadlines
    task_t task1 = {.id = 1, .deadline = 100, .state = TASK_READY};
    task_t task2 = {.id = 2, .deadline = 50, .state = TASK_READY};
    task_t task3 = {.id = 3, .deadline = 200, .state = TASK_READY};

    scheduler_add_task(&task1);
    scheduler_add_task(&task2);
    scheduler_add_task(&task3);

    // EDF should select task2 (earliest deadline)
    task_t *next = scheduler_get_next();
    assert(next->id == 2);
    printf("✓ EDF selects earliest deadline task\n");

    // Mark task2 complete, should select task1
    task2.state = TASK_COMPLETE;
    next = scheduler_get_next();
    assert(next->id == 1);
    printf("✓ EDF updates after task completion\n");
}

void test_deadline_miss(void) {
    scheduler_init();

    task_t task = {.id = 1, .deadline = 10, .state = TASK_RUNNING};
    scheduler_add_task(&task);

    // Simulate time passing beyond deadline
    scheduler_tick(15);

    assert(task.deadline_missed == true);
    printf("✓ Deadline miss detected\n");
}

int main(void) {
    printf("JEZGRO Scheduler Tests\n");
    printf("======================\n\n");

    test_edf_priority();
    test_deadline_miss();

    printf("\nAll tests passed!\n");
    return 0;
}
```

---

## 5. CI/CD Pipeline

### 5.1 GitHub Actions Workflow

```yaml
# .github/workflows/jezgro-ci.yml
name: JEZGRO CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  host-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y cmake build-essential

      - name: Build host tests
        run: |
          mkdir build && cd build
          cmake -DBUILD_SIM=ON ..
          make

      - name: Run tests
        run: ./build/jezgro_test

  renode-simulation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Renode
        run: |
          wget https://github.com/renode/renode/releases/download/v1.14.0/renode_1.14.0_amd64.deb
          sudo dpkg -i renode_1.14.0_amd64.deb

      - name: Install ARM toolchain
        run: |
          sudo apt-get install -y gcc-arm-none-eabi

      - name: Build firmware
        run: |
          mkdir build && cd build
          cmake -DBUILD_SIM=OFF -DCMAKE_TOOLCHAIN_FILE=../cmake/arm-none-eabi.cmake ..
          make

      - name: Run Renode simulation
        run: |
          renode --disable-xwt -e "include @sim/test_scenario.resc; start; sleep 10; quit"

  can-swarm-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup vcan
        run: |
          sudo modprobe vcan
          sudo ip link add dev vcan0 type vcan
          sudo ip link set up vcan0

      - name: Install Python deps
        run: pip install python-can

      - name: Run swarm simulation
        run: |
          timeout 30 python3 sim/swarm_simulator.py || true
```

---

## 6. Simulation Limitations

### 6.1 What Cannot Be Simulated

| Feature | Reason | Mitigation |
|---------|--------|------------|
| AURIX lockstep | Hardware-specific | Test on real TC375 |
| HSM crypto | Security hardware | Use software crypto in sim |
| Exact timing | Host PC variance | Use relative timing |
| CAN-FD bit timing | Physical layer | Test protocol, not electrical |
| Power electronics | Analog domain | Use SPICE for power stage |
| EMC/thermal | Physical phenomena | Test on prototype |

### 6.2 Simulation vs Reality

```
Simulation Accuracy by Layer:

┌─────────────────────────────────────────┐
│ Application Logic      │ ████████████ 95%  ← Excellent
├─────────────────────────────────────────┤
│ RTOS Kernel            │ ████████░░░░ 80%  ← Good
├─────────────────────────────────────────┤
│ Peripheral Drivers     │ ██████░░░░░░ 60%  ← Moderate
├─────────────────────────────────────────┤
│ Hardware Timing        │ ████░░░░░░░░ 40%  ← Limited
├─────────────────────────────────────────┤
│ Electrical/Analog      │ ██░░░░░░░░░░ 20%  ← Poor
└─────────────────────────────────────────┘
```

---

## 7. Quick Start

### 7.1 Today (No Hardware)

```bash
# 1. Clone and setup
git clone <jezgro-repo>
cd jezgro

# 2. Build and run host tests
mkdir build && cd build
cmake -DBUILD_SIM=ON ..
make
./jezgro_test

# 3. Setup virtual CAN (Linux)
sudo modprobe vcan
sudo ip link add dev vcan0 type vcan
sudo ip link set up vcan0

# 4. Run swarm simulator
python3 sim/swarm_simulator.py
```

### 7.2 This Week

1. **Day 1-2:** Setup toolchain, run host tests
2. **Day 3-4:** Install Renode, simulate STM32 boot
3. **Day 5-6:** Implement basic scheduler, test in simulation
4. **Day 7:** Setup virtual CAN, test multi-node messaging

### 7.3 Before Hardware Arrives

- [ ] EDF scheduler implemented and tested
- [ ] IPC message passing working in simulation
- [ ] CAN-FD protocol stack tested on vcan
- [ ] Leader election algorithm validated
- [ ] Basic swarm coordination demonstrated
- [ ] CI/CD pipeline running

---

## 8. Reference

| Resource | URL |
|----------|-----|
| Renode Documentation | https://renode.readthedocs.io/ |
| QEMU ARM | https://www.qemu.org/docs/master/system/arm/ |
| python-can | https://python-can.readthedocs.io/ |
| Wokwi ESP32 | https://docs.wokwi.com/guides/esp32 |
| AURIX Dev Studio | https://www.infineon.com/aurix-development-studio |
| SocketCAN | https://docs.kernel.org/networking/can.html |

---

## Change History

| Date | Version | Description |
|------|---------|-------------|
| 2026-01-04 | 1.0 | Initial version |
| 2026-01-04 | 1.1 | Added Infineon XMC4400 simulation with custom Renode platform |
