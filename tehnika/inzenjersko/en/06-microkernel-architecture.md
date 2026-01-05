# EK3 Microkernel-Inspired Architecture

## Document Information

| Field | Value |
|-------|-------|
| Document ID | EK-TECH-010 |
| Version | 1.0 |
| Date | 2026-01-03 |
| Status | Active |
| Author | Elektrokombinacija Engineering |

---

## 1. Introduction

### 1.1 Inspiration: MINIX Microkernel

The EK3 modular power system architecture draws inspiration from microkernel operating system design, particularly the principles established by MINIX. In traditional monolithic OS kernels, all services run in kernel space with full privileges. A failure in any component can crash the entire system.

The MINIX microkernel takes a different approach:
- **Minimal kernel**: Only essential services (IPC, scheduling, low-level hardware access) run in kernel mode
- **User-space services**: File systems, drivers, and networking run as isolated processes
- **Message passing**: Components communicate via well-defined message protocols
- **Fault isolation**: A crashed service can be restarted without affecting the kernel

### 1.2 Mapping to Power Electronics

We apply these principles to EV charging infrastructure:

| OS Concept | Power Electronics Equivalent |
|------------|------------------------------|
| Kernel | Hardware protection circuits (OCP, OVP, OTP) + core LLC control |
| User processes | Health monitoring, thermal management, ROJ coordination |
| IPC (Inter-Process Communication) | CAN-FD message passing between modules |
| Process isolation | Galvanic isolation + separate MCU per module |
| Graceful degradation | N-1 redundancy, wide power striping |
| Hot reload | Hot-swap module replacement |

### 1.3 Why Microkernel for EV Chargers?

Traditional EV charger architectures suffer from:

1. **Monolithic failure modes**: Single point of failure takes down entire charger
2. **Coarse granularity**: 10-50 kW modules mean 10-33% capacity loss per failure
3. **Tight coupling**: Components cannot be updated or replaced independently
4. **Limited scalability**: Different designs needed for different power levels

The microkernel approach provides:

1. **Fault isolation**: Module failure affects only 0.4% of capacity (3.3 kW / 800 kW)
2. **Independent updates**: Firmware can be updated per-module without system shutdown
3. **Horizontal scaling**: Same module architecture from 3 kW to 3 MW
4. **Autonomous operation**: Modules self-coordinate without central controller

---

## 2. Layered Architecture

The EK3 system implements a four-layer architecture analogous to OS design:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LAYER 3: APPLICATION                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   OCPP      │  │  Fleet AI   │  │   Cloud     │  │  Operator   │    │
│  │  Gateway    │  │  Optimizer  │  │  Telemetry  │  │    UI       │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────────────────────┤
│                        LAYER 2: SERVICES                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Health    │  │   Thermal   │  │   Swarm     │  │   Audit     │    │
│  │  Monitor    │  │  Manager    │  │  Coord.     │  │   Logger    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────────────────────┤
│                        LAYER 1: KERNEL                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │   │
│  │  │   OCP     │  │   OVP     │  │   OTP     │  │   GFI     │    │   │
│  │  │ Hardware  │  │ Hardware  │  │ Hardware  │  │ Hardware  │    │   │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │   │
│  │  ┌───────────────────────────────────────────────────────────┐ │   │
│  │  │              LLC Resonant Controller                      │ │   │
│  │  │         (PWM generation, current/voltage loops)           │ │   │
│  │  └───────────────────────────────────────────────────────────┘ │   │
│  │  ┌───────────────────────────────────────────────────────────┐ │   │
│  │  │              CAN-FD Driver (5 Mbps)                       │ │   │
│  │  │         (Message TX/RX, filtering, arbitration)           │ │   │
│  │  └───────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│                        LAYER 0: HAL                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  GPIO │ ADC │ DAC │ Timer │ DMA │ SPI │ I2C │ UART │ FLASH     │   │
│  │                   STM32G474 Peripherals                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │     SiC MOSFETs │ Gate Drivers │ Magnetics │ Capacitors         │   │
│  │                   Power Stage Hardware                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Layer 0: Hardware Abstraction Layer (HAL)

The HAL provides hardware-independent interfaces to:

**MCU Peripherals (STM32G474):**
- High-resolution timers (HRTIM) for PWM generation at 400 kHz
- ADC with DMA for continuous current/voltage sampling at 10 kHz
- CAN-FD peripheral with hardware filtering
- Flash memory interface for configuration and logging
- Cryptographic accelerator (AES, CMAC, TRNG)

**Power Stage Hardware:**
- Wolfspeed C3M0016120K SiC MOSFETs (1200V, 16 mΩ)
- Silicon Labs Si8271 isolated gate drivers
- LLC transformer and resonant tank
- DC link capacitors and output filter

**HAL Responsibilities:**
```
┌─────────────────────────────────────────────────────┐
│ HAL Functions                                       │
├─────────────────────────────────────────────────────┤
│ • Initialize peripherals to known state            │
│ • Provide register abstraction (read/write)        │
│ • Handle interrupt vectors                         │
│ • Manage DMA transfers                             │
│ • Abstract hardware differences between revisions  │
└─────────────────────────────────────────────────────┘
```

### 2.2 Layer 1: Kernel Layer

The kernel layer contains **safety-critical, real-time** functions that cannot tolerate delays or failures. This is analogous to the minimal MINIX kernel.

**What belongs in the kernel:**

| Component | Latency Requirement | Criticality |
|-----------|---------------------|-------------|
| Over-Current Protection (OCP) | <1 µs | Safety-critical |
| Over-Voltage Protection (OVP) | <1 µs | Safety-critical |
| Over-Temperature Protection (OTP) | <10 ms | Safety-critical |
| Ground Fault Interrupt (GFI) | <10 ms | Safety-critical |
| LLC PWM Control | <2.5 µs (400 kHz) | Power delivery |
| Current/Voltage Regulation | <100 µs | Power quality |
| CAN-FD Driver | <1 ms | Communication |

**Kernel Design Principles:**

1. **Minimal code size**: <32 KB Flash footprint
2. **Deterministic timing**: All paths have bounded worst-case execution time (WCET)
3. **No dynamic allocation**: All memory statically allocated at compile time
4. **Hardware-backed protection**: OCP/OVP/OTP use comparator + hardware trip, not software
5. **Fail-safe defaults**: Any unexpected state triggers safe shutdown

**Hardware Protection Circuit:**

```
                    ┌─────────────────────────────────┐
                    │     Hardware Protection Block    │
                    │         (Non-bypassable)         │
                    │                                  │
   Vout ───────────►│ Comparator ──► OVP Trip ────────┼──► Gate Driver
                    │     ^                           │     Disable
   Iout ───────────►│ Comparator ──► OCP Trip ────────┤
                    │     ^                           │
   Temp ───────────►│ Comparator ──► OTP Trip ────────┤
                    │     ^                           │
                    │  Thresholds set by resistor     │
                    │  dividers (not firmware!)       │
                    └─────────────────────────────────┘
```

### 2.3 Layer 2: Services Layer

Services run as independent tasks with lower priority than kernel functions. They are analogous to user-space processes in MINIX.

**Service Tasks:**

| Service | Update Rate | Priority | Description |
|---------|-------------|----------|-------------|
| Health Monitor | 10 Hz | Medium | Component diagnostics, MTBF tracking |
| Thermal Manager | 100 Hz | Medium-High | Fan control, power derating |
| Swarm Coordinator | 10 Hz | Medium | Leader election, load balancing |
| Audit Logger | Background | Low | Event logging to flash |
| Diagnostics | On-demand | Lowest | Self-test routines |

**Service Isolation:**

Each service:
- Runs in its own RTOS task with dedicated stack
- Communicates with kernel only via message queues
- Cannot directly access hardware (must go through HAL)
- Can be restarted independently if it crashes
- Has watchdog timeout for deadlock detection

```
┌─────────────────────────────────────────────────────────────────┐
│                     Service Isolation Model                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Health     │    │   Thermal    │    │    Swarm     │       │
│  │   Monitor    │    │   Manager    │    │    Coord.    │       │
│  │  ┌────────┐  │    │  ┌────────┐  │    │  ┌────────┐  │       │
│  │  │ Stack  │  │    │  │ Stack  │  │    │  │ Stack  │  │       │
│  │  │ 2KB    │  │    │  │ 4KB    │  │    │  │ 4KB    │  │       │
│  │  └────────┘  │    │  └────────┘  │    │  └────────┘  │       │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Message Queue (FreeRTOS Queue)              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     Kernel Layer                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Layer 3: Application Layer

The application layer provides external interfaces and high-level orchestration:

**Components:**
- **OCPP Gateway**: Handles charging station protocol (OCPP 1.6J/2.0.1)
- **Fleet AI Optimizer**: Machine learning for predictive maintenance
- **Cloud Telemetry**: Sends operational data to central monitoring
- **Operator UI**: Local touchscreen interface (if present)

**Application Layer Characteristics:**
- Runs on Station Controller (separate from EK3 modules)
- Communicates with modules via Ethernet → CAN-FD gateway
- Non-real-time, can tolerate 100ms+ latencies
- Stateless where possible (modules maintain their own state)

---

## 3. Trust Boundaries

Trust boundaries define what components can do and what they must trust.

### 3.1 Trust Level Definitions

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          TRUST LEVELS                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  LEVEL 3 ─────────────────────────────────────────────────────────────  │
│  │ External Commands (Cloud, Fleet Management, OCPP)                    │
│  │ • Authenticated via API keys, OAuth2, certificates                   │
│  │ • Rate-limited, logged, auditable                                    │
│  │ • Cannot directly command power stage                                │
│  │                                                                       │
│  LEVEL 2 ─────────────────────────────────────────────────────────────  │
│  │ Station Controller                                                    │
│  │ • Authenticated via mTLS certificates                                │
│  │ • Can set power targets, start/stop charging                         │
│  │ • Cannot bypass safety limits                                        │
│  │                                                                       │
│  LEVEL 1 ─────────────────────────────────────────────────────────────  │
│  │ Module Firmware (signed, verified)                                    │
│  │ • Secure boot enforced                                               │
│  │ • Can control power stage within hardware limits                     │
│  │ • Full access to peripherals                                         │
│  │                                                                       │
│  LEVEL 0 ─────────────────────────────────────────────────────────────  │
│  │ Hardware Protection (non-bypassable)                                  │
│  │ • Analog comparators with fixed thresholds                           │
│  │ • Cannot be overridden by any software                               │
│  │ • Represents absolute safety boundary                                │
│  │                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Trust Level Capabilities

| Level | Can Command | Cannot Do | Authenticator |
|-------|-------------|-----------|---------------|
| 0 | Immediate shutdown | Nothing else | Hardware (resistors) |
| 1 | Power stage, all peripherals | Bypass HW protection | Secure boot signature |
| 2 | Power targets, scheduling | Set unsafe targets | mTLS certificate |
| 3 | High-level orchestration | Direct power commands | API key + RBAC |

### 3.3 Trust Boundary Crossings

When a request crosses a trust boundary, validation occurs:

```
┌─────────────────────────────────────────────────────────────────┐
│            Trust Boundary Crossing: Cloud → Module               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Cloud (Level 3)                                                 │
│       │                                                          │
│       │ "Set module 42 to 3.0 kW"                                │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────┐                                    │
│  │  Station Controller     │                                    │
│  │  Validates:             │                                    │
│  │  • API key valid?       │ ◄─── Level 3→2 boundary            │
│  │  • Rate limit OK?       │                                    │
│  │  • Module exists?       │                                    │
│  └───────────┬─────────────┘                                    │
│              │                                                   │
│              │ CAN-FD: POWER_COMMAND(module=42, target=3000W)   │
│              │                                                   │
│              ▼                                                   │
│  ┌─────────────────────────┐                                    │
│  │  Module Firmware        │                                    │
│  │  Validates:             │                                    │
│  │  • CMAC signature?      │ ◄─── Level 2→1 boundary            │
│  │  • Sequence number?     │                                    │
│  │  • Target within spec?  │                                    │
│  └───────────┬─────────────┘                                    │
│              │                                                   │
│              │ Set PWM duty cycle                                │
│              │                                                   │
│              ▼                                                   │
│  ┌─────────────────────────┐                                    │
│  │  Hardware Protection    │                                    │
│  │  Enforces:              │ ◄─── Level 1→0 boundary            │
│  │  • I < 4.0A (trip)      │      (non-negotiable)              │
│  │  • V < 920V (trip)      │                                    │
│  │  • T < 105°C (trip)     │                                    │
│  └─────────────────────────┘                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Message Passing Semantics

Inter-module communication uses CAN-FD as the message passing backbone, analogous to IPC in microkernel operating systems.

### 4.1 CAN-FD as IPC Mechanism

| OS IPC Concept | CAN-FD Implementation |
|----------------|----------------------|
| Message send | CAN TX with extended ID |
| Message receive | CAN RX with hardware filtering |
| Synchronous call | Request + wait for response |
| Asynchronous event | Publish without ACK |
| Broadcast | CAN ID without specific target |
| Multicast | CAN ID with group membership |

### 4.2 Message Types

**Type 1: Request-Response**

Used for commands that require acknowledgment.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Request-Response Pattern                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Station Controller                              Module #42      │
│         │                                            │           │
│         │ ─────── POWER_REQ(target=3000W) ─────────► │           │
│         │         ID: 0x10200042                     │           │
│         │         [timeout: 100ms]                   │           │
│         │                                            │           │
│         │ ◄─────── POWER_ACK(actual=2980W) ──────── │           │
│         │          ID: 0x18200042                    │           │
│         │          [within timeout]                  │           │
│         │                                            │           │
│  If no ACK within timeout:                           │           │
│         │ ─────── Retry (max 3) ─────────────────►  │           │
│         │                                            │           │
└─────────────────────────────────────────────────────────────────┘
```

**Type 2: Publish (Fire-and-Forget)**

Used for periodic status broadcasts.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Publish Pattern                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Module #42 broadcasts every 1 second:                           │
│                                                                  │
│  HEARTBEAT(                                                      │
│    id: 42,                                                       │
│    state: ACTIVE,                                                │
│    power: 2980W,                                                 │
│    temp: 62°C,                                                   │
│    health: 0x00                                                  │
│  )                                                               │
│  ID: 0x10100042                                                  │
│                                                                  │
│  All listeners (Station, other modules) receive                  │
│  No ACK expected or required                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Type 3: Event (Urgent Notification)**

Used for faults and state changes requiring immediate attention.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Event Pattern                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Module #42 detects over-temperature:                            │
│                                                                  │
│  FAULT_ALERT(                                                    │
│    id: 42,                                                       │
│    fault_code: OTP_WARNING,                                      │
│    severity: 2,                                                  │
│    value: 98°C,                                                  │
│    timestamp: 0x12345678                                         │
│  )                                                               │
│  ID: 0x107FF042  (high priority, near max ID)                    │
│                                                                  │
│  Station Controller:                                             │
│    → Log event                                                   │
│    → Adjust load distribution                                    │
│    → Alert operator if severity ≥ 3                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 CAN-FD Extended ID Structure

The 29-bit extended CAN ID encodes message type, source, and destination:

```
┌─────────────────────────────────────────────────────────────────┐
│                   29-bit Extended CAN ID                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Bit:  28  27  26  25  24  23  22  21  20  19  18  17  16  15   │
│       ├───┴───┴───┴───┼───┴───┴───┴───┼───┴───┴───┴───┴───┴───┤ │
│       │   Priority    │  Message Type │    Source Module ID    │ │
│       │   (4 bits)    │   (4 bits)    │      (12 bits)         │ │
│                                                                  │
│  Bit:  14  13  12  11  10   9   8   7   6   5   4   3   2   1  0│
│       ├───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┤ │
│       │                  Target Module ID                       │ │
│       │                    (12 bits)                            │ │
│       │           0xFFF = broadcast to all                      │ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Priority Levels:**

| Priority | Value | Use Case |
|----------|-------|----------|
| CRITICAL | 0x0 | Fault alerts, emergency stop |
| HIGH | 0x1 | Power commands, sync |
| MEDIUM | 0x2 | Status queries, thermal |
| LOW | 0x3 | Diagnostics, logging |
| BACKGROUND | 0xF | Firmware update chunks |

**Message Types:**

| Type | Value | Description |
|------|-------|-------------|
| SYNC | 0x0 | Time synchronization |
| ELECTION | 0x1 | Leader election (Raft) |
| HEARTBEAT | 0x2 | Periodic status |
| POWER_CMD | 0x3 | Power target commands |
| THERMAL | 0x4 | Temperature sharing |
| FAULT | 0x7 | Fault notifications |
| DIAG | 0x8 | Diagnostics |
| FW_UPDATE | 0xF | Firmware update |

---

## 5. Minimal Kernel Design

### 5.1 Kernel vs User-Space Mapping

Following microkernel principles, we minimize what runs in the "kernel" (safety-critical, real-time) versus "user-space" (services that can tolerate delays).

```
┌─────────────────────────────────────────────────────────────────┐
│                    Kernel (Safety-Critical)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  MUST be in kernel:                                              │
│  ├── Hardware protection triggers (OCP, OVP, OTP, GFI)          │
│  ├── LLC resonant control loop (400 kHz)                        │
│  ├── Current/voltage feedback control (10 kHz)                  │
│  ├── CAN-FD message TX/RX driver                                │
│  ├── Watchdog refresh                                           │
│  └── Safe shutdown sequence                                     │
│                                                                  │
│  Code size: ~20 KB                                               │
│  RAM usage: ~8 KB                                                │
│  WCET: <100 µs for all paths                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    User-Space (Services)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CAN be in user-space:                                           │
│  ├── Health monitoring and MTBF tracking                        │
│  ├── Thermal management and fan control                         │
│  ├── Swarm coordination (leader election, load balancing)       │
│  ├── Audit logging to flash                                     │
│  ├── Diagnostics and self-test                                  │
│  ├── Configuration management                                   │
│  ├── Firmware update receiver                                   │
│  └── Statistics and telemetry                                   │
│                                                                  │
│  Code size: ~80 KB                                               │
│  RAM usage: ~32 KB                                               │
│  Latency tolerance: 10-1000 ms                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Kernel Invariants

The kernel maintains these invariants that CANNOT be violated:

1. **Power limits**: Output never exceeds 3.3 kW (hardware enforced)
2. **Voltage range**: 200-920 VDC output (hardware comparator trip)
3. **Current limit**: <4.0A continuous (hardware comparator trip)
4. **Temperature**: <105°C junction (hardware thermal shutdown)
5. **Response time**: Fault response <10 µs (hardware trip)
6. **Watchdog**: MCU resets if kernel loop stalls >100ms

### 5.3 Service Restart Capability

If a user-space service crashes (stack overflow, deadlock, etc.), the system continues operating:

```
┌─────────────────────────────────────────────────────────────────┐
│                Service Crash Recovery                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Normal operation:                                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                            │
│  │ Health  │ │ Thermal │ │ Swarm   │  ← All services running    │
│  │   OK    │ │   OK    │ │   OK    │                            │
│  └─────────┘ └─────────┘ └─────────┘                            │
│                                                                  │
│  Thermal service crashes (stack overflow):                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                            │
│  │ Health  │ │ Thermal │ │ Swarm   │                            │
│  │   OK    │ │ CRASHED │ │   OK    │                            │
│  └─────────┘ └────┬────┘ └─────────┘                            │
│                   │                                              │
│                   ▼                                              │
│         Supervisor detects watchdog timeout                      │
│                   │                                              │
│                   ▼                                              │
│         Task deleted, stack freed                                │
│                   │                                              │
│                   ▼                                              │
│         Task recreated with fresh stack                          │
│                   │                                              │
│                   ▼                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                            │
│  │ Health  │ │ Thermal │ │ Swarm   │  ← Service restored        │
│  │   OK    │ │   OK    │ │   OK    │                            │
│  └─────────┘ └─────────┘ └─────────┘                            │
│                                                                  │
│  During recovery (~100ms):                                       │
│  • Power delivery continues (kernel handles)                    │
│  • Thermal protection via hardware (kernel)                     │
│  • Only thermal logging/optimization lost temporarily           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. 3PAR Storage Architecture Mapping

The EK3 rack system borrows concepts from 3PAR storage arrays, which also use a distributed, failure-tolerant architecture.

### 6.1 Concept Mapping

| 3PAR Concept | EK3 Implementation |
|--------------|-------------------|
| Wide striping | Power distributed across ALL modules |
| Thin provisioning | Modules activated on-demand |
| Persistent cache | Capacitor bank for ride-through |
| RAID-like redundancy | N-1 module redundancy |
| Online sparing | Hot-swap without shutdown |
| Automatic load balancing | Droop control equalizes current |

### 6.2 Wide Striping for Power

In traditional chargers, modules are grouped into "strings" that must all function:

```
Traditional (String Architecture):
┌─────────────────────────────────────────────────────────────────┐
│  String 1: [M1]-[M2]-[M3]-[M4]  → 40 kW output                  │
│  String 2: [M5]-[M6]-[M7]-[M8]  → 40 kW output                  │
│                                                                  │
│  If M3 fails: String 1 = 0 kW (entire string down)              │
│  Impact: 50% capacity loss                                       │
└─────────────────────────────────────────────────────────────────┘

EK3 (Wide Striping):
┌─────────────────────────────────────────────────────────────────┐
│  All modules in parallel on DC bus:                              │
│  [M1][M2][M3][M4][M5][M6][M7][M8][M9]...[M84] → 252 kW          │
│                                                                  │
│  If M3 fails: 251 kW (M3 isolated, others compensate)           │
│  Impact: 0.4% capacity loss                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Distributed Sparing

No dedicated "spare" modules. Instead, all modules run slightly below capacity and absorb load when peers fail:

```
┌─────────────────────────────────────────────────────────────────┐
│              Distributed Sparing Model                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Normal operation (84 modules, 200 kW demand):                   │
│  Each module: 200 kW / 84 = 2.38 kW (72% of 3.3 kW capacity)    │
│                                                                  │
│  After 1 failure (83 modules):                                   │
│  Each module: 200 kW / 83 = 2.41 kW (73% capacity)              │
│  → Negligible change per module                                  │
│                                                                  │
│  After 10 failures (74 modules):                                 │
│  Each module: 200 kW / 74 = 2.70 kW (82% capacity)              │
│  → Still comfortable headroom                                    │
│                                                                  │
│  Critical threshold (61 modules):                                │
│  Each module: 200 kW / 61 = 3.28 kW (99% capacity)              │
│  → Alert: Schedule maintenance                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. References

| Document | Description |
|----------|-------------|
| `tehnika/05-ROJ-intelligence.md` | Swarm coordination protocols |
| `tehnika/11-security-model.md` | Security and trust model |
| `tehnika/12-audit-logging.md` | Audit logging and forensics |
| `tehnika/13-hardware-security.md` | Hardware security and HSM |
| `tehnika/14-firmware-architecture.md` | RTOS and firmware design |
| `tehnika/16-custom-rack-system.md` | Custom rack with microkernel backplane |
| `tehnika/17-jezgro.md` | JEZGRO microkernel OS implementation |
| `patent/01-IP-FOUNDATION/06-invention-disclosure-jezgro.md` | Patent disclosure for JEZGRO |

---

## 8. JEZGRO OS Integration

This section describes how the abstract microkernel architecture is implemented by the JEZGRO real-time operating system.

### 8.1 JEZGRO as the EK3 Microkernel Implementation

JEZGRO is a custom microkernel RTOS that implements the principles described in this document. It brings MINIX-style reliability (fault isolation, message passing, automatic service restart) to resource-constrained STM32 microcontrollers using MPU instead of MMU.

> **See:** `tehnika/17-jezgro.md` (EK-TECH-017) for complete implementation details.

### 8.2 Layer Mapping

| This Document (Abstract) | JEZGRO Layer | Implementation |
|--------------------------|--------------|----------------|
| Layer 0: HAL | Hardware drivers | STM32 HAL + custom drivers |
| Layer 1: Kernel (OCP/OVP/OTP) | Layer 0: Privileged Drivers | LLC_CONTROL, SAFETY_MONITOR |
| Layer 1: Kernel (LLC control) | Layer 1: Microkernel | Scheduler, MPU Manager, IPC |
| Layer 2: Services | Layer 2-3: Kernel + User Services | Reincarnation Server + isolated services |
| Layer 3: Application | External (Station Controller) | OCPP Gateway, Fleet AI |

### 8.3 Trust Boundary Implementation via MPU

The trust levels defined in Section 3 map to JEZGRO MPU regions:

```
Trust Level 0 (Hardware Protection)
    ↓
    Non-bypassable analog comparators
    (OCP, OVP, OTP - not software controlled)

Trust Level 1 (Module Firmware)
    ↓
    MPU Regions 0-2: Privileged access
    - Region 0: Flash (code, read-only)
    - Region 1: Kernel data (scheduler, ISR stacks)
    - Region 2: LLC Control (privileged driver)

Trust Level 2 (Station Controller Commands)
    ↓
    CAN-FD messages with CMAC authentication
    Validated by CAN_HANDLER service before IPC routing

Trust Level 3 (External/Cloud Commands)
    ↓
    Station Controller filters and validates
    Rate-limited, logged, auditable
```

### 8.4 Message Passing: CAN-FD ↔ JEZGRO IPC

The CAN-FD message format (Section 4.3) maps to JEZGRO IPC messages:

```
CAN-FD Extended ID (29 bits)
┌───────────┬───────────┬─────────────────┬──────────────┐
│ Priority  │ Msg Type  │   Source ID     │   Dest ID    │
│  (4 bit)  │  (4 bit)  │   (12 bits)     │   (9 bits)   │
└───────────┴───────────┴─────────────────┴──────────────┘
      ↓           ↓             ↓                ↓
      ↓           ↓             ↓                ↓
┌───────────┬───────────┬─────────────────┬──────────────┐
│msg.flags  │ msg.type  │    msg.src      │   msg.dst    │
│ priority  │           │ (service ID)    │ (service ID) │
└───────────┴───────────┴─────────────────┴──────────────┘
            JEZGRO IPC Message Fields
```

The CAN_HANDLER service performs bidirectional translation:
- **Incoming**: CAN-FD RX → `can_rx_to_ipc()` → IPC message → route to destination service
- **Outgoing**: IPC message → `ipc_to_can_tx()` → CAN-FD TX → external bus

### 8.5 Reincarnation Server and Section 5 Guarantees

Section 5 (Minimal Kernel Design) defines kernel invariants that JEZGRO enforces via the Reincarnation Server:

| Invariant | JEZGRO Implementation |
|-----------|----------------------|
| Power limits (3.3 kW max) | LLC_CONTROL enforces in kernel space; hardware comparator backup |
| Voltage range (200-920 VDC) | Hardware OVP trip + LLC_CONTROL software limit |
| Current limit (<4.0 A) | Hardware OCP trip + LLC_CONTROL software limit |
| Temperature (<105°C) | Hardware OTP trip + THERMAL_MGR monitoring |
| Fault response (<10 µs) | Hardware trip; JEZGRO handles restart |
| Watchdog (100 ms) | Per-service watchdog via Reincarnation Server |

**Service Crash Recovery:**
- Non-critical service (AUDIT_LOGGER, SWARM_COORD) crashes → Reincarnation Server restarts in <50 ms
- Critical service (LLC_CONTROL, SAFETY_MONITOR) crashes → Hardware protection ensures safe shutdown
- Power delivery continues during non-critical service restart

---

## Appendix A: Comparison with Traditional Architectures

| Aspect | Monolithic Charger | Modular (Coarse) | EK3 (Microkernel) |
|--------|-------------------|------------------|-------------------|
| Module size | N/A (single unit) | 10-50 kW | 3.3 kW |
| Failure impact | 100% down | 10-50% down | 0.4% down |
| Repair time | 2-14 days | 1-4 hours | 60 seconds |
| Scaling | Buy new unit | Limited | Linear |
| Firmware update | Full shutdown | Per-module | Per-module, rolling |
| Central controller | Required | Required | Optional |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| HAL | Hardware Abstraction Layer - isolates firmware from hardware specifics |
| IPC | Inter-Process Communication - how components exchange messages |
| WCET | Worst-Case Execution Time - maximum time a code path can take |
| Kernel | Minimal, safety-critical code that cannot fail |
| Service | Higher-level functionality that can tolerate delays/restarts |
| Trust boundary | Interface where privilege level changes |
| Wide striping | Distributing load across all available resources |
| Droop control | Autonomous load sharing via voltage-current characteristic |
| JEZGRO | Serbian for "kernel"; the MINIX-inspired RTOS for EK3 |
| Reincarnation Server | MINIX concept for automatic service restart |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-03 | Elektrokombinacija Engineering | Initial document |
| 1.1 | 2026-01-04 | Elektrokombinacija Engineering | Added JEZGRO integration, updated references |
