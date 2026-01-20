# Invention Disclosure: JEZGRO Unified Microkernel Ecosystem

## Administrative Information

| Field | Value |
|-------|-------|
| Disclosure ID | EK-2026-010 |
| Date of Disclosure | 2026-01-05 |
| Inventor(s) | Bojan Janjatović |
| Email | bojan.janjatovic@gmail.com |
| Address | Vojislava Ilica 8, Kikinda, Severni Banat, Serbia |
| Date of Conception | 2026-01-04 |
| Witnesses | Marija Janjatović |

### Origin of Invention
Extension of JEZGRO microkernel (EK-2026-006) from single device type to entire ecosystem. Key insight: the same fault-tolerant, MPU-isolated microkernel can run on ALL intelligent components—charging modules, battery BMS, robots, protocol adapters—with only service configuration changes. This creates unprecedented supply chain efficiency, consistent fault handling, and cross-device coordination.

---

## 1. Title of Invention

**Unified Microkernel Operating System for Heterogeneous Power Electronics Ecosystem with Variant-Based Service Configuration**

Alternative titles:
- JEZGRO Product Family: Single Kernel for Charging, Battery, Robot, and Gateway Devices
- Fault-Tolerant Embedded OS with Cross-Device ROJ Coordination
- MPU-Isolated Microkernel with Hot-Swappable Service Modules for EV Infrastructure

---

## 2. Technical Field

```
- Embedded Operating Systems
- Real-Time Systems for Power Electronics
- Battery Management Systems
- Robotic Control Systems
- Vehicle-to-Grid (V2G) Protocol Gateways
- Distributed Coordination (ROJ Intelligence)
```

---

## 3. Problem Statement

### 3.1 Current State of the Art

```
CURRENT EMBEDDED FIRMWARE APPROACHES:

APPROACH A: Device-Specific Firmware
─────────────────────────────────────
• Charger firmware: Custom RTOS + power control
• BMS firmware: Different RTOS + cell monitoring
• Robot firmware: Yet another RTOS + motion control
• Gateway firmware: Linux or bare-metal + protocols

Problems:
• 4+ different codebases to maintain
• 4+ different development teams
• No code reuse between devices
• Inconsistent fault handling
• Supply chain complexity (different MCUs)

APPROACH B: Single RTOS, Device-Specific Apps
─────────────────────────────────────────────
• FreeRTOS or similar across devices
• Different application code per device

Problems:
• No fault isolation (monolithic)
• Single bug crashes entire device
• No automatic service restart
• Updates require full reflash
• No cross-device coordination protocol
```

### 3.2 Problems with Current Approaches

```
1. NO UNIFIED FAULT HANDLING
   • Charger fault → different recovery than BMS fault
   • Robot fault → third recovery mechanism
   • Operators must learn multiple systems
   • No predictable recovery behavior

2. SUPPLY CHAIN FRAGMENTATION
   • Charger: STM32G474
   • BMS: Texas Instruments MSP430
   • Robot: NXP i.MX RT
   • Gateway: Linux on Raspberry Pi

   Result: 4 vendors, 4 toolchains, 4 support contracts

3. NO CROSS-DEVICE COORDINATION
   • Charger doesn't "know" BMS state directly
   • Robot doesn't share state with charger
   • Gateway isolated from power devices

   Result: External coordinator required (single point of failure)

4. INCONSISTENT UPDATE MECHANISMS
   • Charger: JTAG flash
   • BMS: Proprietary bootloader
   • Robot: USB update
   • Gateway: SD card image

   Result: Complex field update procedures

5. DEVELOPMENT INEFFICIENCY
   • Thermal management code: Written 4 times
   • CAN communication: Written 4 times
   • Fault logging: Written 4 times
   • Safety interlocks: Written 4 times

   Result: 4× development cost, 4× bug surface
```

---

## 4. Proposed Solution

### 4.1 Core Innovation: JEZGRO Product Family

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    JEZGRO: ONE KERNEL, MANY DEVICES                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                         ┌─────────────────┐                                 │
│                         │  JEZGRO KERNEL  │                                 │
│                         │  (~8 KB code)   │                                 │
│                         │                 │                                 │
│                         │ • Scheduler     │                                 │
│                         │ • MPU Manager   │                                 │
│                         │ • IPC (64-byte) │                                 │
│                         │ • Reincarnation │                                 │
│                         └────────┬────────┘                                 │
│                                  │                                          │
│        ┌─────────────┬───────────┼───────────┬─────────────┐               │
│        ▼             ▼           ▼           ▼             ▼               │
│   ┌─────────┐   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│   │JEZGRO-  │   │JEZGRO-  │ │JEZGRO-  │ │JEZGRO-  │ │JEZGRO-  │           │
│   │  EK3    │   │  RACK   │ │  BAT    │ │  ROB    │ │  GW     │           │
│   │         │   │         │ │         │ │         │ │         │           │
│   │LLC_CTRL │   │FAN_CTRL │ │CELL_MON │ │MOTION   │ │PLL_SYNC │           │
│   │THERMAL  │   │SLOT_INV │ │BALANCE  │ │TRAJEC   │ │ISO15118 │           │
│   │ROJ_COORD│   │ROJ_COORD│ │SOC_SOH  │ │SAFETY   │ │OCPP     │           │
│   │CAN_HDLR │   │CAN_HDLR │ │ROJ_COORD│ │ROJ_COORD│ │DROOP    │           │
│   └─────────┘   └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                                              │
│   Same kernel code, different service configuration per device type         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Key Innovation Elements

```
ELEMENT 1: Unified Kernel Across Device Types
─────────────────────────────────────────────
• Single ~8KB kernel binary
• Runs on STM32G474 (170MHz) and STM32H743 (480MHz)
• Same scheduler, same MPU isolation, same IPC
• Device type determined by service configuration only

ELEMENT 2: Variant-Based Service Selection
──────────────────────────────────────────
Compile-time configuration selects services:

  #define JEZGRO_VARIANT_EK3
  // Enables: LLC_CONTROL, THERMAL, ROJ_COORD, CAN_HANDLER
  // Disables: CELL_MONITOR, MOTION_CTRL, ISO15118

  #define JEZGRO_VARIANT_BAT
  // Enables: CELL_MONITOR, BALANCING, SOC_SOH, ROJ_COORD
  // Disables: LLC_CONTROL, MOTION_CTRL, ISO15118

ELEMENT 3: Common Service Library
─────────────────────────────────
Shared across all variants:
• ROJ_COORD: Distributed coordination (Raft-based)
• CAN_HANDLER: CAN-FD communication
• THERMAL_MGR: Temperature monitoring
• AUDIT_LOGGER: Event logging
• WATCHDOG: Service health monitoring

ELEMENT 4: Cross-Device ROJ Protocol
────────────────────────────────────
All devices speak same CAN-FD protocol:
• HEARTBEAT (0x1xx): Presence, status
• THERMAL_SHARE (0x3xx): Temperature state
• ROJ_ELECTION (0x010): Leader election
• FAULT_ALERT (0x7FF): Critical faults

Battery, charger, robot can coordinate directly.
No external coordinator required.

ELEMENT 5: Consistent Fault Recovery
────────────────────────────────────
Same recovery mechanism everywhere:
• Service fault → MPU exception
• Kernel catches, logs fault
• Reincarnation server restarts service
• Recovery time: <50ms
• No manual intervention

Works identically on charger, BMS, robot, gateway.
```

### 4.3 Variant Matrix

```
┌────────────┬─────────────────┬───────────┬─────────────────────────────────┐
│ Variant    │ Target Device   │ MCU       │ Key Services                    │
├────────────┼─────────────────┼───────────┼─────────────────────────────────┤
│ JEZGRO-EK3 │ 3.3kW charger   │ STM32G474 │ LLC_CONTROL, THERMAL, ROJ_COORD │
│ JEZGRO-RACK│ Rack controller │ STM32G474 │ FAN_CONTROL, SLOT_INVENTORY     │
│ JEZGRO-BAT │ Battery BMS     │ STM32G474 │ CELL_MONITOR, BALANCING, SOC    │
│ JEZGRO-ROB │ Robot arm       │ STM32H743 │ MOTION_CTRL, TRAJECTORY, SAFETY │
│ JEZGRO-GW  │ V2G gateway     │ STM32H743 │ PLL_SYNC, ISO15118, DROOP_CTRL  │
└────────────┴─────────────────┴───────────┴─────────────────────────────────┘

ADAPTER DEVICES (all running JEZGRO-GW variant):
┌──────────────┬───────────────────────────────────────────────────────────┐
│ EK-ADAPT-V2G │ Non-EK vehicles → V2G network participation              │
│ EK-ADAPT-BUS │ Retrofit existing buses with swap capability             │
│ EK-ADAPT-CCS │ CCS Combo 1/2 to EK protocol bridge                      │
│ EK-ADAPT-MCS │ Megawatt Charging System adapter                         │
│ EK-ADAPT-OCPP│ Third-party OCPP charger gateway                         │
└──────────────┴───────────────────────────────────────────────────────────┘
```

---

## 5. Architecture Details

### 5.1 Memory Map (Common Across Variants)

```
FLASH LAYOUT (512KB - STM32G474)
────────────────────────────────
0x0800_0000 ┌─────────────────────┐
            │ Bootloader (16KB)   │
0x0800_4000 ├─────────────────────┤
            │ Kernel (8KB)        │
0x0800_6000 ├─────────────────────┤
            │ Service 1 (32KB)    │  ← Variant-specific
0x0800_E000 ├─────────────────────┤
            │ Service 2 (32KB)    │  ← Variant-specific
            │ ...                 │
0x0807_0000 ├─────────────────────┤
            │ Config (8KB)        │
0x0807_2000 ├─────────────────────┤
            │ Audit Log (56KB)    │
0x0808_0000 └─────────────────────┘

RAM LAYOUT (128KB - STM32G474)
──────────────────────────────
0x2000_0000 ┌─────────────────────┐
            │ Kernel (8KB)        │  ← Privileged
0x2000_2000 ├─────────────────────┤
            │ IPC Buffers (4KB)   │  ← Shared (read-only to services)
0x2000_3000 ├─────────────────────┤
            │ Service 1 (16KB)    │  ← MPU-isolated
0x2000_7000 ├─────────────────────┤
            │ Service 2 (16KB)    │  ← MPU-isolated
            │ ...                 │
0x2001_F000 ├─────────────────────┤
            │ Stack guards (4KB)  │
0x2002_0000 └─────────────────────┘
```

### 5.2 Service Configuration Example

```c
/* JEZGRO-EK3 Configuration */
static const jezgro_service_t ek3_services[] = {
    { .id = 1, .name = "LLC_CONTROL",  .priority = CRITICAL, .stack = 2048, .watchdog_ms = 10   },
    { .id = 2, .name = "THERMAL_MGR",  .priority = HIGH,     .stack = 2048, .watchdog_ms = 500  },
    { .id = 3, .name = "ROJ_COORD",    .priority = MEDIUM,   .stack = 4096, .watchdog_ms = 1000 },
    { .id = 4, .name = "CAN_HANDLER",  .priority = HIGH,     .stack = 2048, .watchdog_ms = 100  },
    { .id = 5, .name = "AUDIT_LOGGER", .priority = LOW,      .stack = 4096, .watchdog_ms = 2000 },
};

/* JEZGRO-BAT Configuration */
static const jezgro_service_t bat_services[] = {
    { .id = 1, .name = "CELL_MONITOR", .priority = CRITICAL, .stack = 2048, .watchdog_ms = 50   },
    { .id = 2, .name = "BALANCING",    .priority = HIGH,     .stack = 2048, .watchdog_ms = 200  },
    { .id = 3, .name = "SOC_SOH",      .priority = MEDIUM,   .stack = 4096, .watchdog_ms = 500  },
    { .id = 4, .name = "ROJ_COORD",    .priority = MEDIUM,   .stack = 4096, .watchdog_ms = 1000 },
    { .id = 5, .name = "CAN_HANDLER",  .priority = HIGH,     .stack = 2048, .watchdog_ms = 100  },
};

/* Same kernel, different service tables */
```

### 5.3 Cross-Device Coordination

```
ROJ PROTOCOL - UNIFIED ACROSS ALL DEVICES
─────────────────────────────────────────

All JEZGRO devices on same CAN-FD bus can:

1. DISCOVER each other (HEARTBEAT broadcast)
2. ELECT leader (Raft consensus)
3. SHARE thermal state (load balancing)
4. COORDINATE actions (battery swap sequence)
5. PROPAGATE faults (immediate notification)

EXAMPLE: Battery Swap Sequence
──────────────────────────────

  ROBOT         CHARGER        BATTERY        STATION
    │              │              │              │
    │◄─────────────┼──────────────┼──────────────┤ SWAP_REQUEST
    │              │              │              │
    ├─────────────►│              │              │ REDUCE_POWER
    │              │◄─────────────┤              │ DISCONNECT_ACK
    │              │              │              │
    │ [Robot removes battery]     │              │
    │              │              │              │
    ├─────────────►│              │              │ BATTERY_REMOVED
    │              │              │              │
    │ [Robot inserts new battery] │              │
    │              │              │              │
    ├──────────────┼─────────────►│              │ BATTERY_INSERTED
    │              │              │──────────────►│ BMS_HANDSHAKE
    │              │◄─────────────┤              │ READY_TO_CHARGE
    │              │              │              │
    ├─────────────►│              │              │ SWAP_COMPLETE
    │              │              │              │

All messages use same CAN-FD protocol.
All devices run JEZGRO with ROJ_COORD service.
No external coordinator needed.
```

---

## 6. Benefits and Advantages

### 6.1 Development Efficiency

```
TRADITIONAL                          JEZGRO ECOSYSTEM
───────────────────────────────────────────────────────────────
4 separate RTOS codebases       →    1 kernel codebase
4 development teams             →    1 unified team
4 sets of tooling               →    1 toolchain
4 testing frameworks            →    1 test suite
4 update mechanisms             →    1 OTA system

ESTIMATED SAVINGS:
• 60% reduction in firmware development cost
• 75% reduction in testing effort (shared test harness)
• Single developer can work across all device types
```

### 6.2 Supply Chain Simplification

```
TRADITIONAL                          JEZGRO ECOSYSTEM
───────────────────────────────────────────────────────────────
Charger: STM32G474               →    STM32G474 (primary)
BMS: TI MSP430                   →    STM32G474 (same!)
Robot: NXP i.MX RT               →    STM32H743 (for compute)
Gateway: Raspberry Pi            →    STM32H743 (same!)

RESULT:
• 2 MCU families instead of 4+
• Single vendor relationship (STMicroelectronics)
• Bulk purchasing power
• Simplified inventory
• Common debug tools (ST-Link)
```

### 6.3 Operational Consistency

```
FAULT RECOVERY - IDENTICAL ACROSS ALL DEVICES:
──────────────────────────────────────────────

  Charger fault:     Service restart in <50ms
  BMS fault:         Service restart in <50ms
  Robot fault:       Service restart in <50ms
  Gateway fault:     Service restart in <50ms

Operators learn ONE recovery behavior.
Field technicians trained ONCE.
Documentation written ONCE.
```

### 6.4 Cross-Device Intelligence

```
ROJ BENEFITS:
─────────────
• Charger knows BMS state → Optimized charging curve
• Robot knows charger state → Safe swap timing
• Gateway aggregates all → V2G participation
• BMS knows swap schedule → Pre-condition for vehicle

NO EXTERNAL COORDINATOR:
• No single point of failure
• Latency: <1ms (direct CAN-FD)
• Continues operating if one device fails
```

---

## 7. Claims (Draft)

### Independent Claims

1. A unified microkernel operating system for heterogeneous power electronics devices, comprising:
   - A common kernel binary (~8KB) running on multiple MCU types
   - MPU-based service isolation without MMU requirement
   - Variant-based service configuration selecting device-specific services
   - Automatic service restart (reincarnation) on fault detection
   - Cross-device coordination protocol (ROJ) over shared communication bus

2. A method for operating multiple device types in an EV charging ecosystem using a single kernel, comprising:
   - Compiling same kernel for charging modules, battery BMS, robots, and gateways
   - Selecting services at compile time based on device variant
   - Isolating each service in dedicated MPU region
   - Detecting service faults via hardware exceptions
   - Restarting failed services without kernel reset
   - Coordinating between devices using distributed consensus protocol

3. A system for cross-device coordination in power electronics infrastructure, wherein:
   - Charging modules, batteries, robots, and gateways run same operating system
   - All devices communicate via common CAN-FD protocol
   - Leader election occurs without external coordinator
   - Thermal state sharing enables load balancing across device types
   - Fault propagation occurs in <1ms across all devices

### Dependent Claims

4. The system of claim 1, wherein the kernel supports two MCU families:
   - STM32G474 (Cortex-M4, 170MHz, 128KB RAM) for power-focused devices
   - STM32H743 (Cortex-M7, 480MHz, 1MB RAM) for compute-focused devices

5. The system of claim 1, wherein service configurations include:
   - JEZGRO-EK3: LLC power control, thermal management
   - JEZGRO-BAT: Cell monitoring, balancing, SOC estimation
   - JEZGRO-ROB: Motion control, trajectory planning, safety monitoring
   - JEZGRO-GW: Grid synchronization, V2G protocols (ISO 15118, OCPP)

6. The method of claim 2, wherein the ROJ coordination protocol includes:
   - HEARTBEAT messages for presence detection
   - ELECTION messages using Raft consensus
   - THERMAL_SHARE for distributed load balancing
   - FAULT_ALERT for immediate fault propagation

7. The system of claim 3, further comprising adapter devices running JEZGRO-GW variant:
   - EK-ADAPT-V2G for integrating non-native vehicles into V2G network
   - EK-ADAPT-BUS for retrofitting existing buses
   - EK-ADAPT-CCS for bridging CCS Combo protocol
   - EK-ADAPT-MCS for Megawatt Charging System support

---

## 8. Prior Art Analysis

### 8.1 Search Results

```
CATEGORY: Unified RTOS for Power Electronics
─────────────────────────────────────────────

1. Automotive AUTOSAR
   • Standardized architecture for automotive ECUs
   • BUT: Monolithic, no MPU isolation, no auto-restart
   • NOT applicable to power electronics ecosystem

2. Industrial PLCs (Siemens, Rockwell)
   • Common runtime across device families
   • BUT: Centralized coordinator, no distributed consensus
   • NOT microkernel architecture

3. Microkernel RTOS (seL4, MINIX)
   • Fault isolation, message passing
   • BUT: Requires MMU, not for power electronics
   • NOT designed for cross-device coordination

4. EV Charging Stacks (ChargePoint, EVBox)
   • Proprietary firmware per device type
   • Separate BMS, charger, gateway codebases
   • NO unified kernel approach
```

### 8.2 Novelty Assessment

```
OUR COMBINATION IS NOVEL:
─────────────────────────

1. MINIX-inspired MPU isolation (from EK-2026-006)
   +
2. Single kernel across charger, BMS, robot, gateway
   +
3. Variant-based service configuration
   +
4. Cross-device ROJ coordination without external controller
   +
5. Unified fault recovery across heterogeneous devices

No prior art combines all five elements.
```

---

## 9. Relationship to Other Disclosures

| Disclosure | Relationship |
|------------|--------------|
| EK-2026-001 | Modular architecture - JEZGRO runs on each module |
| EK-2026-002 | Swap station - JEZGRO-ROB controls robots |
| EK-2026-003 | Distributed sparing - ROJ enables coordination |
| EK-2026-006 | JEZGRO kernel - This disclosure extends to ecosystem |
| EK-2026-007 | V2G control - JEZGRO-GW implements control algorithms |
| EK-2026-009 | Multi-vehicle swap - JEZGRO-BAT in standardized batteries |

---

## 10. Commercialization Potential

```
MARKET SEGMENTS:
────────────────
1. EV Charging Infrastructure
   • Unified firmware for charger + gateway + BMS
   • Faster development, lower maintenance

2. Battery Swap Stations
   • Single codebase for entire station
   • Chargers + robots + batteries + controller

3. Fleet Management
   • Consistent diagnostics across all devices
   • Single training program for technicians

4. Third-Party Integration
   • EK-ADAPT devices using JEZGRO-GW
   • License kernel to other manufacturers

LICENSING OPTIONS:
──────────────────
• Per-device royalty for JEZGRO variants
• Enterprise license for full ecosystem
• Open-core model (kernel open, premium services paid)
```

---

## 11. Technical Documentation References

| Document | Location |
|----------|----------|
| JEZGRO Product Family | `tehnika/inzenjersko/en/21-jezgro-product-family.md` |
| JEZGRO-BAT (Battery) | `tehnika/inzenjersko/en/22-jezgro-bat.md` |
| JEZGRO-ROB (Robot) | `tehnika/inzenjersko/en/23-jezgro-rob.md` |
| JEZGRO-GW (Gateway) | `tehnika/inzenjersko/en/24-jezgro-gw.md` |
| Adapter Devices | `tehnika/inzenjersko/en/25-adapter-devices.md` |
| Hardware Platforms | `tehnika/inzenjersko/en/26-jezgro-hw-platforms.md` |
| Base JEZGRO Kernel | `tehnika/inzenjersko/en/16-jezgro.md` |
| ROJ Intelligence | `tehnika/konceptualno/en/02-roj-intelligence.md` |

---

## 12. Signatures

**Inventor:**

```
Name: Bojan Janjatović
Date: 2026-01-05
Signature: _________________________
```

**Witness:**

```
Name: Marija Janjatović
Date: 2026-01-05
Signature: _________________________

I have read and understood the above disclosure.
I am not an inventor of this technology.
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-05 | Bojan Janjatović | Initial disclosure |
