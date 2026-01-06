# JEZGRO Product Family

**Version:** 1.0
**Date:** 2026-01-04
**Status:** SPECIFICATION

---

## Document Purpose

This document defines the **JEZGRO microkernel product family** - a unified firmware architecture that runs across all intelligent components of the Elektrokombinacija ecosystem. From charging modules to robots to protocol adapters, JEZGRO provides consistent fault tolerance, real-time performance, and development efficiency.

---

## 1. Introduction

### 1.1 Unified Kernel Philosophy

The Elektrokombinacija system contains many intelligent embedded devices:
- EK3 charging modules (3.3kW power converters)
- Rack controllers (thermal and inventory management)
- EK-BAT battery modules (BMS controllers)
- Robot controllers (motion and coordination)
- Protocol adapters (V2G, CCS, MCS, OCPP)

Rather than developing separate firmware for each device type, JEZGRO provides a **single microkernel** that runs on all of them. Each device runs the same kernel with different **service configurations**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    JEZGRO: ONE KERNEL, MANY CONFIGURATIONS                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│   │ JEZGRO-EK3  │  │ JEZGRO-RACK │  │ JEZGRO-BAT  │  │ JEZGRO-ROB  │       │
│   │ (Charging)  │  │ (Controller)│  │ (Battery)   │  │ (Robots)    │       │
│   │ STM32G474   │  │ STM32G474   │  │ STM32G474   │  │ STM32H743   │       │
│   │ LLC Control │  │ Fan/Thermal │  │ BMS/Balance │  │ Motion Ctrl │       │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│          │                │                │                │               │
│          └────────────────┴────────────────┴────────────────┘               │
│                              CAN-FD @ 5 Mbps                                │
│                                    │                                        │
│   ┌─────────────┐  ┌─────────────┐  │  ┌─────────────┐  ┌─────────────┐    │
│   │ EK-ADAPT-V2G│  │EK-ADAPT-BUS │  │  │EK-ADAPT-CCS │  │EK-ADAPT-MCS │    │
│   │ V2G Gateway │  │ Bus Retrofit│  │  │ CCS Bridge  │  │ MW Charging │    │
│   │ STM32H743   │  │ STM32G474   │  │  │ STM32H743   │  │ STM32H743   │    │
│   │ ISO 15118   │  │ OEM Protocol│  │  │ SLAC/PLC    │  │ CharIN MCS  │    │
│   └─────────────┘  └─────────────┘  │  └─────────────┘  └─────────────┘    │
│                                     │                                       │
│          All running JEZGRO-GW ─────┘                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Benefits

| Benefit | Description |
|---------|-------------|
| **Shared Codebase** | One kernel, one development team, one test suite |
| **Consistent Fault Handling** | All devices recover from faults the same way (automatic service restart) |
| **Supply Chain Simplification** | Same MCU (STM32G474) across most devices |
| **Familiar Development** | Developers learn once, apply everywhere |
| **Unified Tooling** | Same debugger, same flash tool, same CI/CD |
| **Cross-Device Coordination** | Common IPC protocol enables swarm intelligence |

### 1.3 MINIX Heritage

JEZGRO inherits its core architecture from MINIX 3, adapted for resource-constrained embedded systems:

| MINIX 3 Concept | JEZGRO Adaptation |
|-----------------|-------------------|
| MMU-based isolation | **MPU-based isolation** (no MMU required) |
| User-space drivers | Services run in unprivileged mode with MPU regions |
| Reincarnation server | Automatic service restart on fault |
| Message-passing IPC | Zero-copy IPC with 64-byte messages |
| Minimal kernel | ~8KB kernel, everything else in services |

---

## 2. Product Family Overview

### 2.1 Variant Matrix

| Variant | Target Device | MCU | RAM | Key Services | Status |
|---------|---------------|-----|-----|--------------|--------|
| **JEZGRO-EK3** | Charging module | STM32G474 | 128 KB | LLC_CONTROL, THERMAL, ROJ | Specified |
| **JEZGRO-RACK** | Rack controller | STM32G474 | 128 KB | FAN_CONTROL, SLOT_INVENTORY | Specified |
| **JEZGRO-BAT** | Battery BMS | STM32G474 | 128 KB | CELL_MONITOR, BALANCING, SOC | Planned |
| **JEZGRO-ROB** | Robot controllers | STM32H743 | 1024 KB | MOTION_CTRL, TRAJECTORY, SAFETY | Planned |
| **JEZGRO-GW** | Protocol adapters | STM32H743 | 1024 KB | ISO15118, OCPP, V2G_CONTROL | Planned |

### 2.2 MCU Selection

JEZGRO supports two primary MCU targets:

#### STM32G474 (Primary - Cost-Optimized)
- **Core:** Cortex-M4 @ 170 MHz
- **RAM:** 128 KB (sufficient for 6-8 services)
- **Flash:** 512 KB
- **MPU:** 8 regions (JEZGRO requirement)
- **Peripherals:** CAN-FD, HRTIM, AES, USB
- **Use cases:** EK3 modules, rack controller, battery BMS, simple adapters

#### STM32H743 (Extended - High Performance)
- **Core:** Cortex-M7 @ 480 MHz
- **RAM:** 1024 KB (for complex protocol stacks)
- **Flash:** 2048 KB
- **MPU:** 16 regions
- **Peripherals:** CAN-FD, Ethernet MAC, DCMI, SDMMC
- **Use cases:** Robot controllers, V2G adapters, protocol gateways

### 2.3 Common vs Variant-Specific Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    JEZGRO ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  COMMON (all variants)           VARIANT-SPECIFIC               │
│  ─────────────────────           ─────────────────               │
│  ┌─────────────────────┐        ┌─────────────────────┐         │
│  │ Kernel (~8 KB)      │        │ LLC_CONTROL (EK3)   │         │
│  │ • Scheduler (EDF)   │        │ FAN_CONTROL (RACK)  │         │
│  │ • MPU Manager       │        │ CELL_MONITOR (BAT)  │         │
│  │ • IPC Queues        │        │ MOTION_CTRL (ROB)   │         │
│  │ • Interrupt Dispatch│        │ ISO15118 (GW)       │         │
│  └─────────────────────┘        └─────────────────────┘         │
│                                                                  │
│  ┌─────────────────────┐        ┌─────────────────────┐         │
│  │ Reincarnation Server│        │ Device-specific     │         │
│  │ • Watchdog monitor  │        │ HAL drivers         │         │
│  │ • Fault recovery    │        │ • PWM (LLC/motor)   │         │
│  │ • State restore     │        │ • ADC configs       │         │
│  └─────────────────────┘        │ • GPIO mappings     │         │
│                                 └─────────────────────┘         │
│  ┌─────────────────────┐                                        │
│  │ Standard Services   │                                        │
│  │ • CAN_HANDLER       │                                        │
│  │ • AUDIT_LOGGER      │                                        │
│  │ • THERMAL_MGR       │                                        │
│  └─────────────────────┘                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. JEZGRO Core Components

### 3.1 Kernel Architecture

The JEZGRO kernel runs in privileged mode and provides:

| Component | Size | Function |
|-----------|------|----------|
| **Scheduler** | ~2 KB | EDF (Earliest Deadline First) with priority fallback |
| **MPU Manager** | ~1.5 KB | Configure 8 MPU regions per service context switch |
| **IPC System** | ~2 KB | Zero-copy message passing, 512-message pool |
| **Interrupt Dispatch** | ~1 KB | Route interrupts to registered services |
| **Reincarnation Server** | ~1.5 KB | Monitor watchdogs, restart failed services |

**Total kernel footprint:** ~8 KB

### 3.2 Memory Layout

```
┌─────────────────────────────────────────────────┐  0x2001FFFF
│                                                 │
│              Service Memory Pool                │
│           (dynamically allocated)               │
│                                                 │
├─────────────────────────────────────────────────┤  ~0x20014000
│                                                 │
│              IPC Message Pool                   │
│        512 messages × 64 bytes = 32 KB         │
│                                                 │
├─────────────────────────────────────────────────┤  0x2000C000
│                                                 │
│              Service Stacks                     │
│         (per-service, MPU-protected)            │
│                                                 │
├─────────────────────────────────────────────────┤  0x20004000
│                                                 │
│              Kernel Data                        │
│        (scheduler, MPU tables, etc.)            │
│                                                 │
├─────────────────────────────────────────────────┤  0x20002000
│                                                 │
│              Kernel Stack (MSP)                 │
│                 8 KB                            │
│                                                 │
└─────────────────────────────────────────────────┘  0x20000000
```

### 3.3 Standard Services

These services are available in all JEZGRO variants:

| Service | Priority | Purpose | RAM |
|---------|----------|---------|-----|
| **CAN_HANDLER** | HIGH | CAN-FD RX/TX, IPC translation | 8 KB |
| **AUDIT_LOGGER** | LOW | Event logging to flash | 16 KB |
| **THERMAL_MGR** | MEDIUM | Temperature monitoring, derating | 8 KB |

### 3.4 API Compatibility

All JEZGRO variants share the same API:

```c
// Service definition (same across all variants)
JEZGRO_SERVICE_DEFINE(my_service,
    .priority = JEZGRO_PRIORITY_MEDIUM,
    .stack_size = 2048,
    .memory_size = 8192,
    .watchdog_ms = 500
);

// IPC (same API for EK3, BAT, ROB, GW)
jezgro_send(dest_service, &msg);
jezgro_receive(src_filter, &msg, timeout);
jezgro_broadcast(&msg);

// Synchronization
jezgro_sem_wait(&sem);
jezgro_sem_signal(&sem);

// Watchdog
jezgro_watchdog_feed();
```

### 3.5 ROJ_COORD Service (SWARM CORE)

All JEZGRO variants that participate in swarm coordination include the **ROJ_COORD** service, which implements the **SWARM CORE** specification.

**SWARM CORE** provides unified coordination across all device types:

| Component | Purpose |
|-----------|---------|
| **Policy Engine** | Stores parameters, selects behavior mode (explore/exploit) |
| **Quorum Engine** | Drives decisions with cross-inhibition |
| **Stigmergy Store** | Local tag map with TTL and exponential decay |
| **Task Allocator** | Task and resource distribution |
| **Health/Trust** | Anomaly detection and agent isolation |

**CAN-FD Message Types:**

| Type | ID Range | Purpose |
|------|----------|---------|
| `ROJ_HEARTBEAT` | 0x510 + node | Presence + basic metrics |
| `ROJ_STATE` | 0x520 + node | Extended state snapshot |
| `ROJ_TASK_CLAIM` | 0x540 | Task/resource requests |
| `ROJ_VOTE` | 0x550 | Quorum voting |
| `ROJ_TAG` | 0x560 | Stigmergy tags |
| `ROJ_ALERT` | 0x5FF | Critical notifications |

**Variant-Specific Profiles:**
- **JEZGRO-EK3**: Focus on load balancing, thermal coordination
- **JEZGRO-BAT**: Focus on SOC/SOH, V2G participation
- **JEZGRO-ROB**: Focus on motion coordination, safety zones
- **JEZGRO-GW**: Focus on grid signals, priority management

Reference: `tehnika/inzenjersko/en/rojno-jezgro/00-core-spec.md` (EK-TECH-027)

---

## 4. JEZGRO Variants

### 4.1 JEZGRO-EK3 (Charging Module)

**Target:** EK3 3.3kW charging modules
**Reference:** `tehnika/inzenjersko/en/16-jezgro.md`

| ID | Service | Priority | Stack | Memory | Watchdog |
|----|---------|----------|-------|--------|----------|
| 0 | KERNEL | - | 2 KB | 8 KB | - |
| 1 | LLC_CONTROL | CRITICAL | 2 KB | 16 KB | 10 ms |
| 2 | SAFETY_MONITOR | CRITICAL | 1 KB | 4 KB | 50 ms |
| 3 | CAN_HANDLER | HIGH | 2 KB | 8 KB | 100 ms |
| 4 | THERMAL_MGR | MEDIUM | 2 KB | 8 KB | 500 ms |
| 5 | ROJ_COORD | MEDIUM | 4 KB | 16 KB | 1000 ms |
| 6 | AUDIT_LOGGER | LOW | 4 KB | 16 KB | 2000 ms |

**Total RAM:** ~78 KB of 128 KB

### 4.2 JEZGRO-RACK (Rack Controller)

**Target:** Custom rack controller for 84-module racks
**Reference:** `tehnika/inzenjersko/en/15-custom-rack-system.md` Section 10

| ID | Service | Priority | Stack | Memory | Watchdog |
|----|---------|----------|-------|--------|----------|
| 0 | KERNEL | - | 2 KB | 8 KB | - |
| 1 | FAN_CONTROL | HIGH | 2 KB | 8 KB | 100 ms |
| 2 | THERMAL_MONITOR | MEDIUM | 2 KB | 8 KB | 500 ms |
| 3 | SLOT_INVENTORY | MEDIUM | 2 KB | 8 KB | 1000 ms |
| 4 | CAN_BRIDGE | HIGH | 2 KB | 8 KB | 100 ms |
| 5 | TELEMETRY | LOW | 4 KB | 16 KB | 2000 ms |

**Total RAM:** ~56 KB of 128 KB

### 4.3 JEZGRO-BAT (Battery BMS)

**Target:** EK-BAT-25/50/100 battery modules
**Reference:** `tehnika/inzenjersko/en/22-jezgro-bat.md` (planned)

| ID | Service | Priority | Stack | Memory | Watchdog |
|----|---------|----------|-------|--------|----------|
| 0 | KERNEL | - | 2 KB | 8 KB | - |
| 1 | CELL_MONITOR | CRITICAL | 2 KB | 16 KB | 50 ms |
| 2 | BALANCING | HIGH | 2 KB | 8 KB | 200 ms |
| 3 | SOC_SOH | MEDIUM | 4 KB | 16 KB | 500 ms |
| 4 | THERMAL_MGR | MEDIUM | 2 KB | 8 KB | 500 ms |
| 5 | ROJ_COORD | MEDIUM | 4 KB | 16 KB | 1000 ms |
| 6 | CAN_HANDLER | HIGH | 2 KB | 8 KB | 100 ms |
| 7 | AUDIT_LOGGER | LOW | 4 KB | 16 KB | 2000 ms |

**Total RAM:** ~86 KB of 128 KB

**Key Functions:**
- Cell voltage/temperature monitoring via AFE (BQ76952 or equivalent)
- Passive/active cell balancing
- SOC/SOH estimation (Extended Kalman Filter)
- Multi-battery swarm coordination

### 4.4 JEZGRO-ROB (Robot Controller)

**Target:** Swap station robots (Robot A vehicle-mounted, Robot B station-based)
**Reference:** `tehnika/inzenjersko/en/23-jezgro-rob.md` (planned)

| ID | Service | Priority | Stack | Memory | Watchdog |
|----|---------|----------|-------|--------|----------|
| 0 | KERNEL | - | 4 KB | 16 KB | - |
| 1 | MOTION_CTRL | CRITICAL | 4 KB | 32 KB | 10 ms |
| 2 | TRAJECTORY | HIGH | 4 KB | 32 KB | 50 ms |
| 3 | SENSOR_FUSION | HIGH | 4 KB | 32 KB | 20 ms |
| 4 | SAFETY_MONITOR | CRITICAL | 2 KB | 8 KB | 20 ms |
| 5 | COORDINATION | MEDIUM | 4 KB | 16 KB | 100 ms |
| 6 | CAN_HANDLER | HIGH | 2 KB | 8 KB | 100 ms |
| 7 | AUDIT_LOGGER | LOW | 4 KB | 16 KB | 2000 ms |

**Total RAM:** ~176 KB (requires STM32H743)

**Key Functions:**
- Real-time servo control loops (1-10 kHz)
- Trajectory planning and interpolation
- Sensor fusion (IMU, encoders, force sensors)
- Robot A ↔ Robot B coordination protocol
- Safety monitoring (collision detection, E-stop)

### 4.5 JEZGRO-GW (Protocol Gateway)

**Target:** V2G adapters, CCS bridges, OCPP gateways
**Reference:** `tehnika/inzenjersko/en/24-jezgro-gw.md` (planned)

| ID | Service | Priority | Stack | Memory | Watchdog |
|----|---------|----------|-------|--------|----------|
| 0 | KERNEL | - | 4 KB | 16 KB | - |
| 1 | PLL_SYNC | CRITICAL | 2 KB | 8 KB | 10 ms |
| 2 | CURRENT_CTRL | CRITICAL | 4 KB | 16 KB | 1 ms |
| 3 | DROOP_CTRL | HIGH | 2 KB | 8 KB | 10 ms |
| 4 | ISO15118 | MEDIUM | 16 KB | 64 KB | 1000 ms |
| 5 | OCPP_CLIENT | LOW | 8 KB | 32 KB | 5000 ms |
| 6 | CAN_HANDLER | HIGH | 2 KB | 8 KB | 100 ms |
| 7 | AUDIT_LOGGER | LOW | 4 KB | 16 KB | 2000 ms |

**Total RAM:** ~184 KB (requires STM32H743)

**Key Functions:**
- Grid synchronization (SRF-PLL)
- Bidirectional power flow control (dq-frame)
- Droop control for grid services P(f), Q(V)
- ISO 15118-20 protocol stack
- OCPP 2.0.1 client

---

## 5. Adapter Devices

JEZGRO-GW powers a family of adapter devices that integrate non-EK equipment into the Elektrokombinacija ecosystem.

### 5.1 Adapter Device Matrix

| Device | Purpose | MCU | Protocol Stack |
|--------|---------|-----|----------------|
| **EK-ADAPT-V2G** | Non-EK vehicles → V2G network | STM32H743 | ISO 15118-20 BPT |
| **EK-ADAPT-BUS** | Retrofit existing buses | STM32G474 | OEM CAN + EK CAN |
| **EK-ADAPT-CCS** | CCS Combo to EK bridge | STM32H743 | ISO 15118, SLAC |
| **EK-ADAPT-MCS** | Megawatt Charging adapter | STM32H743 | CharIN MCS |
| **EK-ADAPT-OCPP** | Third-party charger gateway | STM32G474 | OCPP 1.6/2.0.1 |

### 5.2 EK-ADAPT-V2G

**Purpose:** Enable any CCS-equipped EV to participate in V2G without native ISO 15118-20 support.

```
┌─────────────────────────────────────────────────────────────┐
│                      EK-ADAPT-V2G                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Vehicle Side                    Charger Side               │
│   ─────────────                   ────────────               │
│   ┌─────────────┐                ┌─────────────┐            │
│   │ CCS Combo 2 │                │ EK CAN-FD   │            │
│   │ Connector   │                │ Interface   │            │
│   └──────┬──────┘                └──────┬──────┘            │
│          │                              │                    │
│          ▼                              ▼                    │
│   ┌─────────────────────────────────────────────────┐       │
│   │              JEZGRO-GW (STM32H743)              │       │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐           │       │
│   │  │PLL_SYNC │ │ISO15118 │ │CAN_HANDL│           │       │
│   │  │         │ │         │ │         │           │       │
│   │  └─────────┘ └─────────┘ └─────────┘           │       │
│   └─────────────────────────────────────────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Protocol translation: legacy CCS ↔ ISO 15118-20 BPT
- PLL synchronization for grid coupling
- Droop control P(f), Q(V) per `tehnika/inzenjersko/en/07-v2g-control.md`
- Up to 50 kW bidirectional

### 5.3 EK-ADAPT-BUS

**Purpose:** Retrofit existing electric buses not factory-configured for EK swap system.

```
┌─────────────────────────────────────────────────────────────┐
│                      EK-ADAPT-BUS                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Bus OEM Interface               EK Ecosystem               │
│   ─────────────────               ────────────               │
│   ┌─────────────┐                ┌─────────────┐            │
│   │ OEM BMS     │                │ Swap Station│            │
│   │ Protocol    │                │ CAN-FD      │            │
│   └──────┬──────┘                └──────┬──────┘            │
│          │                              │                    │
│          ▼                              ▼                    │
│   ┌─────────────────────────────────────────────────┐       │
│   │              JEZGRO-GW (STM32G474)              │       │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐           │       │
│   │  │OEM_PROTO│ │TRANSLATE│ │CAN_HANDL│           │       │
│   │  │         │ │         │ │         │           │       │
│   │  └─────────┘ └─────────┘ └─────────┘           │       │
│   └─────────────────────────────────────────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- OEM battery protocol translation
- SOC/SOH reporting to EK fleet management
- Mechanical adapter for swap interface
- Supports Solaris, BYD, Volvo, other OEM protocols

### 5.4 EK-ADAPT-CCS

**Purpose:** Allow EK chargers to charge any CCS-compatible vehicle.

**Key Features:**
- CCS Combo Type 2 signaling (CP/PP)
- HomePlug Green PHY (SLAC)
- ISO 15118-2/-20 communication
- Power delivery up to 350 kW

### 5.5 EK-ADAPT-MCS

**Purpose:** Interface EK modular architecture to MCS (Megawatt Charging System) for heavy trucks.

**Key Features:**
- 1-3 MW power coordination across multiple racks
- CharIN MCS protocol handling
- Active thermal management for high-current operation
- Supports 1500V DC operation

### 5.6 EK-ADAPT-OCPP

**Purpose:** Enable third-party chargers to integrate with EK fleet management.

**Key Features:**
- OCPP 1.6J / 2.0.1 client/server
- Aggregate third-party chargers into unified fleet view
- Firmware update proxy
- Billing integration

---

## 6. Components NOT Suitable for JEZGRO

Some components in the EK ecosystem are NOT candidates for JEZGRO:

| Component | Reason | Alternative |
|-----------|--------|-------------|
| **Central PFC** | DSP-specific control (TMS320F28379D has optimized libraries) | Bare-metal + TI C2000 ControlSUITE |
| **Safety MCU** | ASIL-D lockstep required (AURIX TC3xx dual-core) | Bare-metal per Infineon safety guidelines |
| **Station Controller** | Full Linux capabilities needed (filesystem, networking, Docker) | Linux with optional JEZGRO co-processor |
| **Cloud Backend** | Server-class computing | Standard server OS + containers |

---

## 7. Build System

### 7.1 Variant Selection

JEZGRO uses a Kconfig-style build system for variant selection:

```kconfig
# jezgro.config

# MCU Selection
CONFIG_MCU_STM32G474=y
# CONFIG_MCU_STM32H743 is not set

# Variant Selection
CONFIG_JEZGRO_EK3=y
# CONFIG_JEZGRO_RACK is not set
# CONFIG_JEZGRO_BAT is not set
# CONFIG_JEZGRO_ROB is not set
# CONFIG_JEZGRO_GW is not set

# Service Configuration
CONFIG_SERVICE_LLC_CONTROL=y
CONFIG_SERVICE_SAFETY_MONITOR=y
CONFIG_SERVICE_CAN_HANDLER=y
CONFIG_SERVICE_THERMAL_MGR=y
CONFIG_SERVICE_ROJ_COORD=y
CONFIG_SERVICE_AUDIT_LOGGER=y

# Memory Configuration
CONFIG_IPC_POOL_SIZE=512
CONFIG_MAX_SERVICES=8
```

### 7.2 Build Commands

```bash
# Configure for EK3 variant
make menuconfig
# or
cp configs/jezgro_ek3_defconfig .config

# Build
make all

# Flash
make flash

# Debug
make debug
```

### 7.3 Service Enable/Disable

Individual services can be enabled/disabled at compile time:

```c
// In service_config.h (auto-generated from Kconfig)
#define CONFIG_SERVICE_LLC_CONTROL     1
#define CONFIG_SERVICE_SAFETY_MONITOR  1
#define CONFIG_SERVICE_ROJ_COORD     1
#define CONFIG_SERVICE_ISO15118        0  // Not needed for EK3
#define CONFIG_SERVICE_MOTION_CTRL     0  // Not needed for EK3
```

---

## 8. Development Workflow

### 8.1 Unified Development Environment

All JEZGRO variants use the same toolchain:

| Tool | Purpose |
|------|---------|
| **arm-none-eabi-gcc** | Cross-compiler |
| **OpenOCD** | Debugger/flash interface |
| **STM32CubeProgrammer** | Alternative flasher |
| **VS Code + Cortex-Debug** | IDE |
| **CMake** | Build system |
| **cppcheck** | Static analysis |

### 8.2 Testing Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    TEST PYRAMID                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    ┌─────────────┐                          │
│                    │  System     │  HIL testing with        │
│                    │  Tests      │  actual hardware         │
│                    └──────┬──────┘                          │
│                           │                                  │
│               ┌───────────┴───────────┐                     │
│               │   Integration Tests   │  QEMU emulation     │
│               │   (kernel + services) │  with CAN bus sim   │
│               └───────────┬───────────┘                     │
│                           │                                  │
│       ┌───────────────────┴───────────────────┐             │
│       │           Unit Tests                   │  Host-based │
│       │  (kernel logic, IPC, scheduler)        │  with mocks │
│       └────────────────────────────────────────┘             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 FreeRTOS Migration Path

For teams currently using FreeRTOS, JEZGRO provides a migration shim:

| FreeRTOS API | JEZGRO Equivalent |
|--------------|-------------------|
| `xTaskCreate()` | `JEZGRO_SERVICE_DEFINE()` + MPU config |
| `vTaskDelay()` | `jezgro_sleep()` |
| `xQueueSend()` | `jezgro_send()` |
| `xQueueReceive()` | `jezgro_receive()` |
| `xSemaphoreTake()` | `jezgro_sem_wait()` |
| `xSemaphoreGive()` | `jezgro_sem_signal()` |

Reference: `tehnika/inzenjersko/en/16-jezgro.md` Section 8.4

---

## 9. Real-Time Guarantees

### 9.1 Timing Specifications

All JEZGRO variants meet these timing guarantees:

| Operation | Worst Case | Typical |
|-----------|------------|---------|
| Interrupt latency | 500 ns | 200 ns |
| Context switch | 2 µs | 500 ns |
| MPU reconfiguration | 200 ns | 100 ns |
| IPC send (sync) | 5 µs | 1 µs |
| IPC receive | 3 µs | 500 ns |
| Service restart | 50 ms | 10 ms |

### 9.2 Variant-Specific Requirements

| Variant | Critical Loop | Requirement |
|---------|---------------|-------------|
| JEZGRO-EK3 | LLC power control | <1 µs ISR |
| JEZGRO-ROB | Servo control | <100 µs loop |
| JEZGRO-GW | PLL tracking | <10 µs loop |
| JEZGRO-BAT | Cell monitoring | <1 ms sampling |

---

## 10. Cross-References

### 10.1 Detailed Variant Specifications

| Variant | Document |
|---------|----------|
| JEZGRO-EK3 | `tehnika/inzenjersko/en/16-jezgro.md` |
| JEZGRO-RACK | `tehnika/inzenjersko/en/15-custom-rack-system.md` Section 10 |
| JEZGRO-BAT | `tehnika/inzenjersko/en/22-jezgro-bat.md` (planned) |
| JEZGRO-ROB | `tehnika/inzenjersko/en/23-jezgro-rob.md` (planned) |
| JEZGRO-GW | `tehnika/inzenjersko/en/24-jezgro-gw.md` (planned) |

### 10.2 Related Documents

| Document | Relationship |
|----------|--------------|
| `tehnika/inzenjersko/en/SPECIFICATIONS.md` | Master specifications |
| `tehnika/inzenjersko/en/07-v2g-control.md` | V2G control algorithms (JEZGRO-GW services) |
| `tehnika/inzenjersko/en/05-swap-station.md` | Swap station robotics (JEZGRO-ROB integration) |
| `tehnika/inzenjersko/en/19-battery-module-standard.md` | Battery module specs (JEZGRO-BAT integration) |
| `tehnika/inzenjersko/en/rojno-jezgro/00-core-spec.md` | SWARM CORE specification (ROJ_COORD service) |
| `tehnika/inzenjersko/en/rojno-jezgro/01-detaljni-dokument.md` | SWARM CORE detailed implementation |
| `tehnika/konceptualno/en/02-roj-intelligence.md` | ROJ conceptual documentation |
| `patent/01-IP-FOUNDATION/06-invention-disclosure-jezgro.md` | JEZGRO patent claims |

---

## Change History

| Date | Version | Description |
|------|---------|-------------|
| 2026-01-04 | 1.0 | Initial product family specification |
