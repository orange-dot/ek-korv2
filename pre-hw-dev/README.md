# JEZGRO Pre-Hardware Development

Development environment for JEZGRO microkernel RTOS - **no hardware required**.

## Quick Start

### Windows

```powershell
# 1. Install prerequisites
.\scripts\setup-windows.ps1

# 2. Build and test
mkdir build; cd build
cmake -DBUILD_SIM=ON ..
cmake --build .

# 3. Run tests
.\jezgro_test.exe

# 4. Run CAN swarm simulation
python sim\swarm_simulator.py
```

### Linux

```bash
# 1. Install prerequisites
./scripts/setup-linux.sh

# 2. Build and test
mkdir build && cd build
cmake -DBUILD_SIM=ON ..
make -j$(nproc)

# 3. Run tests
./jezgro_test

# 4. Setup virtual CAN and run swarm simulation
sudo ./scripts/setup-vcan.sh
python3 sim/swarm_simulator.py
```

## Project Structure

```
pre-hw-dev/
├── README.md               # This file
├── CMakeLists.txt          # Build configuration
├── src/
│   ├── kernel/
│   │   ├── jezgro.h        # Main kernel header
│   │   ├── scheduler.c     # EDF real-time scheduler
│   │   ├── scheduler.h
│   │   ├── ipc.c           # Inter-process communication
│   │   ├── ipc.h
│   │   ├── task.c          # Task management
│   │   └── task.h
│   ├── hal/
│   │   ├── hal.h           # Hardware abstraction interface
│   │   ├── hal_sim.c       # Simulation HAL (PC)
│   │   ├── hal_stm32.c     # STM32G474 HAL (future)
│   │   └── hal_aurix.c     # AURIX TC375 HAL (future)
│   └── services/
│       ├── can_gateway.c   # CAN-FD communication service
│       └── can_gateway.h
├── test/
│   ├── test_main.c         # Test runner
│   ├── test_scheduler.c    # Scheduler tests
│   ├── test_ipc.c          # IPC tests
│   └── test_swarm.c        # Swarm coordination tests
├── sim/
│   ├── swarm_simulator.py  # Multi-node CAN simulation
│   ├── can_monitor.py      # CAN bus monitor
│   └── requirements.txt    # Python dependencies
├── renode/
│   ├── stm32g474.repl      # STM32G474 basic platform
│   ├── stm32g474-full.repl # STM32G474 full platform (ADC, CAN, HRTIM)
│   ├── xmc4400.repl        # Infineon XMC4400 (150ps HRPWM!)
│   ├── esp32s3.repl        # ESP32-S3 platform (partial support)
│   ├── jezgro.resc         # Legacy test scenario
│   ├── jezgro-stm32.resc   # STM32 full test scenario
│   ├── jezgro-xmc.resc     # XMC4400 test scenario (experimental)
│   └── jezgro-esp32.resc   # ESP32 test scenario
├── scripts/
│   ├── setup-windows.ps1   # Windows setup script
│   ├── setup-linux.sh      # Linux setup script
│   └── setup-vcan.sh       # Virtual CAN setup
├── docs/
│   ├── RENODE-DEVELOPMENT.md    # Renode emulator deep dive
│   ├── SIMULATION-ALL-TARGETS.md # All architectures simulation guide
│   ├── ARCHITECTURE.md          # Kernel architecture
│   └── API.md                   # API reference
├── .vscode/
│   ├── tasks.json          # Build tasks
│   ├── launch.json         # Debug configurations
│   └── c_cpp_properties.json
└── .github/
    └── workflows/
        └── ci.yml          # CI/CD pipeline
```

## What Can Be Developed Without Hardware

| Component | Simulation | Notes |
|-----------|------------|-------|
| EDF Scheduler | ★★★★★ | Full logic testable |
| IPC Message Passing | ★★★★★ | Zero-copy design |
| Task Management | ★★★★★ | Create, suspend, resume |
| CAN-FD Protocol | ★★★★★ | Via python-can |
| Leader Election | ★★★★★ | Raft-inspired algorithm |
| Swarm Coordination | ★★★★☆ | Multi-process simulation |
| MPU Configuration | ★★★★☆ | Via Renode |
| Context Switching | ★★★☆☆ | ARM-specific parts need HW |

## Simulation Tools

### By Target Architecture

| Target | Emulator | Support Level |
|--------|----------|---------------|
| **STM32G474** | Renode | ✅ Full |
| **XMC4400** | Renode (custom) | ⚠️ Experimental (ARM core works) |
| **ESP32-S3** | Renode / Wokwi | ⚠️ Partial (no WiFi in Renode) |
| **AURIX TC3xx** | QEMU-TriCore / CCS | ❌ Limited (use real HW) |
| **TI C2000** | CCS Simulator | ✅ Full (TI's simulator) |

**NEW:** XMC4400 has 150ps HRPWM (same as C2000) but uses ARM Cortex-M4 → emulatable!

### Core Tools

| Tool | Purpose | Install |
|------|---------|---------|
| **CMake** | Build system | `apt install cmake` / `choco install cmake` |
| **GCC** | Host compiler | `apt install gcc` / `choco install mingw` |
| **ARM GCC** | Cross compiler | `apt install gcc-arm-none-eabi` |
| **Python 3** | Simulation scripts | `apt install python3` / python.org |
| **Renode** | ARM/Xtensa emulator | renode.io / `choco install renode` |
| **python-can** | CAN simulation | `pip install python-can` |
| **TI CCS** | C2000 IDE + Simulator | ti.com/tool/CCSTUDIO |
| **Wokwi** | ESP32 with WiFi | wokwi.com (web-based) |

## Development Phases

### Phase 1: Core Kernel (Week 1-2)

```bash
# Build and test scheduler
cmake --build build --target jezgro_test
./build/jezgro_test --filter=scheduler

# Expected output:
# ✓ EDF selects earliest deadline
# ✓ Priority recalculated on deadline change
# ✓ Deadline miss detected
```

### Phase 2: IPC System (Week 3-4)

```bash
# Test message passing
./build/jezgro_test --filter=ipc

# Expected output:
# ✓ Synchronous send/receive
# ✓ Async message queuing
# ✓ Zero-copy transfer
```

### Phase 3: CAN Swarm (Week 5-6)

```bash
# Linux: Setup virtual CAN
sudo ./scripts/setup-vcan.sh

# Run 5-node swarm simulation
python3 sim/swarm_simulator.py --nodes 5

# Expected output:
# Node 0: LEADER
# Node 1: follower (leader=0)
# Node 2: follower (leader=0)
# ...
```

### Phase 4: Renode Simulation (Week 7+)

```bash
# Run full system in Renode
cd renode
./run_sim.sh ../build/jezgro.elf
```

## API Quick Reference

### Scheduler

```c
// Initialize scheduler
void scheduler_init(void);

// Add task to scheduler
int scheduler_add_task(task_t *task);

// Get next task to run (EDF)
task_t *scheduler_get_next(void);

// Update system tick
void scheduler_tick(uint32_t ms);
```

### IPC

```c
// Send message (blocking)
int ipc_send(uint8_t dest, void *data, size_t len);

// Receive message (blocking)
int ipc_receive(uint8_t *src, void *buf, size_t max_len);

// Send async
int ipc_send_async(uint8_t dest, void *data, size_t len);
```

### Task

```c
// Create new task
task_t *task_create(const char *name, task_func_t func,
                    uint32_t deadline_ms, uint8_t priority);

// Suspend task
void task_suspend(task_t *task);

// Resume task
void task_resume(task_t *task);
```

## Continuous Integration

Every push runs:
1. Host compilation and unit tests
2. Static analysis (cppcheck)
3. CAN swarm simulation test
4. Renode boot test (when configured)

## Next Steps (When Hardware Arrives)

1. Flash to NUCLEO-G474RE / AURIX TC375
2. Validate timing on real hardware
3. Test MPU fault isolation
4. Measure actual context switch time
5. CAN-FD bus electrical validation

## References

### Project Documentation
- [JEZGRO Specification](../tehnika/inzenjersko/en/16-jezgro.md)
- [Development Alternatives](../tehnika/inzenjersko/en/19-jezgro-dev-alternatives.md)
- [Hybrid BOM](../tehnika/inzenjersko/en/20-jezgro-hybrid-bom.md)
- [Simulation Guide](../tehnika/inzenjersko/en/21-jezgro-simulation.md)

### Local Documentation
- [Renode Development Guide](docs/RENODE-DEVELOPMENT.md) - Deep dive into Renode emulation
- [All Targets Simulation](docs/SIMULATION-ALL-TARGETS.md) - STM32, ESP32, AURIX, C2000

### External Resources
- [Renode Documentation](https://renode.readthedocs.io/)
- [Renode GitHub](https://github.com/renode/renode)
- [Wokwi ESP32 Simulator](https://wokwi.com)
- [TI Code Composer Studio](https://www.ti.com/tool/CCSTUDIO)
- [Infineon AURIX Development Studio](https://www.infineon.com/aurix-development-studio)
