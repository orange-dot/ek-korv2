# Control System Architecture

> **Note:** This is the patent filing version. For living documentation, see [`tehnika/10-microkernel-architecture.md`](../../tehnika/10-microkernel-architecture.md).

**Document Version:** 1.1
**Date:** 2026-01-04
**Author:** Bojan Janjatović
**Email:** bojan.janjatovic@gmail.com
**Address:** Vojislava Ilica 8, Kikinda, Severni Banat, Serbia

---

## 1. Microkernel-Inspired Architecture

### 1.1 Design Philosophy

```
MICROKERNEL PRINCIPLES APPLIED TO POWER ELECTRONICS
═══════════════════════════════════════════════════════════════

The EK3 control system architecture draws inspiration from
microkernel operating systems (such as MINIX):

MICROKERNEL OS                    EK3 SYSTEM
═══════════════                   ══════════════════════════════
Minimal kernel (IPC,              Minimal backplane (power bus,
scheduling, memory)               CAN routing only)

User-space services               Module firmware (health,
                                  ROJ coordination, logging)

Message passing IPC               CAN-FD message protocol

Process isolation                 Module electrical isolation

Kernel crash = system down        Backplane fail = system down
Service crash = recoverable       Module fail = recoverable

This architecture ensures:
• No single point of failure in intelligence layer
• Graceful degradation when components fail
• Independent module operation
• System survives loss of any single module
```

### 1.2 Trust Boundaries

```
TRUST BOUNDARY ARCHITECTURE
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                      TRUST LEVELS                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  LEVEL 0: HARDWARE (Non-bypassable)                         │
│  ════════════════════════════════                           │
│  • Hardware OCP/OVP/OTP protection circuits                 │
│  • Analog comparators, not software controlled              │
│  • Cannot be disabled by any firmware                       │
│  • Backplane passive routing                                │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  LEVEL 1: KERNEL FIRMWARE (Minimal, signed)                 │
│  ══════════════════════════════════════════                 │
│  • Secure bootloader                                        │
│  • Fault handlers                                           │
│  • Power stage control (LLC switching)                      │
│  • CAN-FD driver                                            │
│  • Cryptographic engine                                     │
│  Size: ~20KB, rarely updated, extensively tested            │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  LEVEL 2: SERVICES (Isolated, sandboxed)                    │
│  ═══════════════════════════════════════                    │
│  • Health monitoring                                        │
│  • Thermal management                                       │
│  • ROJ coordination                                         │
│  • Audit logging                                            │
│  • OTA update handler                                       │
│  Bugs here cannot compromise Level 0/1                      │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  LEVEL 3: EXTERNAL (Authenticated, rate-limited)            │
│  ═══════════════════════════════════════════════            │
│  • Commands from Station Controller                         │
│  • Firmware updates                                         │
│  • Configuration changes                                    │
│  All require cryptographic authentication                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Message Passing Semantics

```
CAN-FD AS INTER-PROCESS COMMUNICATION (IPC)
═══════════════════════════════════════════════════════════════

Just as microkernel IPC enables service communication,
CAN-FD provides standardized message passing between modules:

MESSAGE TYPES:
┌─────────────────────────────────────────────────────────────┐
│ TYPE              │ PATTERN          │ EXAMPLE              │
├───────────────────┼──────────────────┼──────────────────────┤
│ Request-Response  │ Sync, blocking   │ GET_STATUS           │
│                   │ (with timeout)   │ SET_POWER            │
├───────────────────┼──────────────────┼──────────────────────┤
│ Publish           │ Periodic         │ HEARTBEAT (1Hz)      │
│                   │ broadcast        │ THERMAL_SHARE (10Hz) │
├───────────────────┼──────────────────┼──────────────────────┤
│ Event             │ Async, one-shot  │ FAULT_ALERT          │
│                   │ high priority    │ STATE_CHANGE         │
└─────────────────────────────────────────────────────────────┘

PROTOCOL GUARANTEES:
• Delivery: At-least-once (CAN hardware retry)
• Ordering: Per-source FIFO (sequence numbers)
• Latency: <1ms for 64-byte message at 5 Mbps
• Authentication: CMAC on security-critical messages
```

### 1.4 SWARM CORE Coordination (ROJ_COORD)

```
SWARM CORE - UNIFIED COORDINATION SPECIFICATION
═══════════════════════════════════════════════════════════════

SWARM CORE is the formal specification of ROJ (swarm) coordination
for the entire JEZGRO product family. All devices run the same
ROJ_COORD service with device-specific policy profiles.

ARCHITECTURE:
┌─────────────────────────────────────────────────────────────┐
│                    SWARM CORE LIBRARY                        │
├─────────────────────────────────────────────────────────────┤
│  Policy Engine     │ Stores parameters, behavior mode       │
│  Quorum Engine     │ Drives decisions, cross-inhibition     │
│  Stigmergy Store   │ Local tag map with TTL and decay       │
│  Task Allocator    │ Task and resource distribution         │
│  Health/Trust      │ Anomaly detection, agent isolation     │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │    ROJ_COORD      │
                    │     SERVICE       │
                    └─────────┬─────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
       ┌─────────┐      ┌─────────┐      ┌─────────┐
       │ EK3     │      │ BAT     │      │ ROB     │
       │ Charger │      │ Battery │      │ Robot   │
       └─────────┘      └─────────┘      └─────────┘

CAN-FD MESSAGE TYPES (SWARM CORE):
┌───────────────────┬────────────────┬─────────────────────────┐
│ Type              │ ID Range       │ Purpose                 │
├───────────────────┼────────────────┼─────────────────────────┤
│ ROJ_HEARTBEAT     │ 0x510 + node   │ Presence + basic metrics│
│ ROJ_STATE         │ 0x520 + node   │ Extended state snapshot │
│ ROJ_TASK_CLAIM    │ 0x540          │ Task/resource requests  │
│ ROJ_VOTE          │ 0x550          │ Quorum voting           │
│ ROJ_TAG           │ 0x560          │ Stigmergy tags          │
│ ROJ_ALERT         │ 0x5FF          │ Critical notifications  │
└───────────────────┴────────────────┴─────────────────────────┘

COORDINATION PRINCIPLES:
─────────────────────────────────────
• Quorum voting: Q = max(quorum_min, quorum_ratio × active_nodes)
• Stigmergy: Tags with TTL and exponential decay
• Topological: k-neighbors coordination (k=6-7 default)
• Graceful degradation: System operates after 30% agent loss
• Decision latency: Quorum reached in <500ms under normal load

DEFAULT POLICY PROFILE:
┌─────────────────────────┬─────────────────────────────────────┐
│ Parameter               │ Value                               │
├─────────────────────────┼─────────────────────────────────────┤
│ k_neighbors             │ 6-7                                 │
│ quorum_min              │ 3                                   │
│ quorum_ratio_pct        │ 60%                                 │
│ heartbeat_period_ms     │ 1000                                │
│ gossip_period_ms        │ 500                                 │
│ tag_ttl_ms              │ 5000                                │
│ decay_half_life_ms      │ 2000                                │
│ isolation_threshold_pct │ 30                                  │
│ exploration_noise_pct   │ 2                                   │
└─────────────────────────┴─────────────────────────────────────┘

DEVICE-SPECIFIC PROFILES:
• JEZGRO-EK3: Focus on load balancing, thermal coordination
• JEZGRO-BAT: Focus on SOC/SOH, V2G participation
• JEZGRO-ROB: Focus on motion coordination, safety zones
• JEZGRO-GW:  Focus on grid signals, priority management

Reference: tehnika/inzenjersko/en/rojno-jezgro/00-core-spec.md
Reference: tehnika/inzenjersko/en/rojno-jezgro/01-detaljni-dokument.md
```

---

## 2. System Overview

```
HIJERARHIJA KONTROLNOG SISTEMA
═══════════════════════════════════════════════════════════════

                    ┌─────────────────────────────────────┐
                    │         CLOUD / BACKEND             │
     LEVEL 4        │  Fleet Management & Analytics       │
                    │  (Optional - sistem radi i offline) │
                    └──────────────────┬──────────────────┘
                                       │ HTTPS/MQTT
                                       │ (cellular/fiber)
                    ┌──────────────────┴──────────────────┐
                    │         DEPOT CONTROLLER            │
     LEVEL 3        │  Koordinacija svih stanica u depou  │
                    │  + inventory + scheduling           │
                    └──────────────────┬──────────────────┘
                                       │ Ethernet
                         ┌─────────────┴─────────────┐
                         ▼                           ▼
              ┌─────────────────────┐     ┌─────────────────────┐
              │  STATION CTRL #1   │     │  STATION CTRL #N   │
   LEVEL 2    │  • Charging mgmt   │     │                     │
              │  • Robot control   │     │                     │
              │  • Module health   │     │                     │
              └─────────┬──────────┘     └─────────────────────┘
                        │ CAN bus
          ┌─────────────┼─────────────┬─────────────┐
          ▼             ▼             ▼             ▼
      ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐
      │ EK3   │    │ EK3   │    │ EK3   │    │ Robot │
   L1 │ #1    │    │ #2    │    │ #N    │    │ Ctrl  │
      │       │    │       │    │       │    │       │
      └───────┘    └───────┘    └───────┘    └───────┘

═══════════════════════════════════════════════════════════════
PRINCIP: Svaki nivo može raditi AUTONOMNO ako viši nivo otkaže
═══════════════════════════════════════════════════════════════
```

---

## 2. Level 1: Module Controller (EK3)

> Detaljno pokriveno u SENSOR-ARCHITECTURE.md

```
SAŽETAK - MODULE CONTROLLER
═══════════════════════════════════════════════════════════════

Hardware: STM32G474 (Cortex-M4 @ 170MHz, integrated CAN-FD)

Funkcije:
• DC-DC power conversion control (LLC resonant)
• Senzor monitoring (I, V, T, ESR)
• Health assessment (rule-based + ML)
• CAN-FD communication @ 5 Mbps

Autonomija:
• Može raditi samostalno za osnovno punjenje
• Self-protection (OCP, OTP, OVP)
• Degraded mode ako komunikacija otkaže

Interfejs prema LEVEL 2:
• CAN-FD @ 5 Mbps (64-byte payload)
• Status reporting svake sekunde
• Event-driven alarmi odmah
```

---

## 3. Level 2: Station Controller

### 3.1 Hardware Platform

```
STATION CONTROLLER HARDWARE
═══════════════════════════════════════════════════════════════

OPCIJA A: Industrial PC (Preporučeno)
─────────────────────────────────────
• Advantech UNO-2271G ili slično
• Intel Atom/Celeron
• 4GB RAM, 64GB SSD
• Wide temp: -20 to +60°C
• Dual Ethernet, 2x RS485, GPIO
• DIN rail mount
• Cena: ~$400-600

OPCIJA B: Raspberry Pi CM4 + Industrial Carrier
─────────────────────────────────────
• Compute Module 4
• Industrial carrier board (Waveshare, Seeed)
• CAN HAT
• Cena: ~$150-250
• Manje robustan, OK za prototip

OPCIJA C: PLC
─────────────────────────────────────
• Siemens S7-1200, Beckhoff CX series
• Overkill za ovu aplikaciju
• Skupo, ali industrijski dokazano


PREPORUČENI I/O:
─────────────────────────────────────
• 2x CAN bus (moduli + robot)
• 1x Ethernet (uplink ka Depot Controller)
• 1x RS485 (legacy uređaji ako treba)
• 8x DI (emergency stops, door sensors)
• 4x DO (status lights, locks)
• 1x USB (maintenance laptop)
```

### 3.2 Software Stack

```
OPERATING SYSTEM
═══════════════════════════════════════════════════════════════

Linux-based (Debian/Ubuntu LTS ili Yocto custom)

Zašto Linux:
• Fleksibilnost
• Bogat ecosystem
• Real-time capable (PREEMPT_RT patch)
• OTA updates
• Containerization (Docker) za izolaciju

Alternativa:
• Windows IoT (ako treba .NET compatibility)
• RTOS (FreeRTOS, Zephyr) ako treba hard real-time
  → Verovatno nepotrebno za ovaj nivo
```

```
SOFTWARE ARCHITECTURE
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                     STATION CONTROLLER                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │
│  │   CHARGING  │ │   MODULE    │ │       ROBOT         │    │
│  │   MANAGER   │ │   HEALTH    │ │     CONTROLLER      │    │
│  │             │ │   MONITOR   │ │                     │    │
│  │ • Session   │ │ • Aggregate │ │ • Swap sequencing   │    │
│  │   handling  │ │   module    │ │ • Safety interlock  │    │
│  │ • Power     │ │   status    │ │ • Gripper control   │    │
│  │   allocation│ │ • Predict   │ │ • Position control  │    │
│  │ • Vehicle   │ │   failures  │ │                     │    │
│  │   comms     │ │ • Schedule  │ │                     │    │
│  │             │ │   swaps     │ │                     │    │
│  └──────┬──────┘ └──────┬──────┘ └──────────┬──────────┘    │
│         │               │                    │               │
│         └───────────────┼────────────────────┘               │
│                         ▼                                    │
│              ┌─────────────────────┐                        │
│              │    ORCHESTRATOR     │                        │
│              │  (State Machine)    │                        │
│              └──────────┬──────────┘                        │
│                         │                                    │
│    ┌────────────────────┼────────────────────┐              │
│    ▼                    ▼                    ▼              │
│ ┌──────┐          ┌──────────┐         ┌─────────┐         │
│ │ CAN  │          │  MQTT    │         │  REST   │         │
│ │Driver│          │  Client  │         │  API    │         │
│ └──────┘          └──────────┘         └─────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    LINUX + DOCKER                            │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Key Services

```
SERVICE: CHARGING MANAGER
═══════════════════════════════════════════════════════════════

Odgovornosti:
1. Vehicle identification (RFID, plate recognition, ili API)
2. Session management (start, stop, pause)
3. Power allocation across modules
4. Energy metering (za billing)
5. Vehicle communication (ako ima V2G/ISO 15118)

State Machine:
┌─────────┐    vehicle    ┌─────────────┐   auth ok   ┌──────────┐
│  IDLE   │──────────────▶│ IDENTIFYING │────────────▶│ STARTING │
└─────────┘   detected    └─────────────┘             └────┬─────┘
     ▲                                                      │
     │                    ┌─────────────┐    plug ok       │
     │                    │  CHARGING   │◀─────────────────┘
     │                    └──────┬──────┘
     │                           │
     │         ┌─────────────────┼─────────────────┐
     │         ▼                 ▼                 ▼
     │    ┌─────────┐      ┌──────────┐     ┌───────────┐
     │    │COMPLETED│      │ PAUSED   │     │  FAULTED  │
     │    └────┬────┘      └──────────┘     └─────┬─────┘
     │         │                                   │
     └─────────┴───────────────────────────────────┘


Punjenje sa degradiranim modulima:
─────────────────────────────────
• Ako modul X kaže "degraded" → redistribuuj load
• Ako modul X kaže "replace" → isključi iz rotacije
• Charging continues at reduced power ako treba
• User notification: "Charging at reduced speed"
```

```
SERVICE: MODULE HEALTH MONITOR
═══════════════════════════════════════════════════════════════

Odgovornosti:
1. Agregacija statusa svih modula
2. Fleet-level trend analysis
3. Swap scheduling decisions
4. Integration sa Fleet Management

Logika zakazivanja zamene:
─────────────────────────────────

FOR each module:
    IF status == CRITICAL:
        → Swap IMMEDIATELY (sledeći slobodan slot)

    IF status == REPLACE_NEXT_BUS:
        → Dodaj u "urgent swap" queue
        → Obavesti Fleet Management

    IF status == SCHEDULE_REPLACEMENT:
        → Dodaj u "planned swap" queue
        → Optimizuj: grupiši više zamena
        → Čekaj bus koji već nosi spare module

PRIORITIZATION:
1. Critical → odmah
2. Urgent → u roku od 4 sata
3. Planned → u roku od 7 dana

BATCHING:
• Ako 3+ modula treba zamenu → zakaži "maintenance window"
• Obavesti depot da pripremi više spare modula
```

```
SERVICE: ROBOT CONTROLLER
═══════════════════════════════════════════════════════════════

Odgovornosti:
1. Swap sequence execution
2. Safety interlock management
3. Gripper control
4. Error handling & recovery

Swap Sequence (pojednostavljen):
─────────────────────────────────

1. PRE-CONDITIONS
   □ No vehicle in charging bay
   □ Module power OFF
   □ Safety door locked
   □ Robot homed

2. REMOVAL SEQUENCE
   □ Move to module slot X
   □ Verify position (camera/sensor)
   □ Engage gripper
   □ Verify grip
   □ Unlock module latch
   □ Extract module
   □ Move to buffer position
   □ Release to "removed" rack

3. INSTALLATION SEQUENCE
   □ Move to "spare" rack
   □ Pick new module
   □ Move to slot X
   □ Align (camera-guided)
   □ Insert module
   □ Lock latch
   □ Release gripper
   □ Retract

4. POST-CONDITIONS
   □ Module power ON
   □ CAN communication verify
   □ Quick health check
   □ Report complete

Error Handling:
─────────────────────────────────
• Gripper fail → retry 2x, then abort
• Position error → re-home, retry
• Module stuck → human intervention flag
• Power during swap → EMERGENCY STOP
```

### 3.4 Communication Interfaces

```
CAN-FD BUS NETWORK (Interni)
═══════════════════════════════════════════════════════════════

Topology: Single bus, multi-drop
Speed: CAN-FD @ 5 Mbps (data phase) / 1 Mbps (arbitration)
Payload: 64 bytes (vs 8 bytes CAN 2.0)
Termination: 120Ω na oba kraja
Latency: <1ms per message

Node Addresses:
• 0x100-0x1FF: EK3 Modules (slot 1-255)
• 0x200-0x2FF: Robot controller
• 0x300-0x3FF: Auxiliary (fans, locks, sensors)
• 0x700-0x7FF: Station controller (master)

Message Types:
─────────────────────────────────

# Heartbeat (svake sekunde)
ID: 0x100 + slot_number
LEN: 64 (CAN-FD)
DATA: [
  status, temp_junction, temp_ambient, efficiency,
  power_out_H, power_out_L, voltage_H, voltage_L,
  current_H, current_L, ESR_H, ESR_L, RUL, fan_speed,
  anomaly_score, fault_code, uptime_H, uptime_M, uptime_L,
  ... (extended telemetry)
]

# Command (od Station Controller)
ID: 0x700
LEN: 64 (CAN-FD)
DATA: [cmd_type, target_slot, params[0-61]]

Commands:
  0x01 = Power ON
  0x02 = Power OFF
  0x03 = Set power limit (params: power_H, power_L)
  0x04 = Enter standby
  0x05 = Prepare for swap (safe shutdown)
  0x10 = Request detailed diagnostics
  0x20 = Firmware update (params: chunk data)

# Alarm (event-driven, high priority)
ID: 0x080 + slot_number (high priority ID range)
LEN: 64 (CAN-FD)
DATA: [alarm_code, severity, timestamp[4], values[58]]
```

```
UPLINK KA DEPOT CONTROLLER (Ethernet)
═══════════════════════════════════════════════════════════════

Protocol: MQTT 5.0 over TLS
Broker: Depot Controller (local) + Cloud (backup)

Topic Structure:
─────────────────────────────────

# Station status
depot/{depot_id}/station/{station_id}/status
  → JSON: {state, active_sessions, available_power, module_health}

# Per-module telemetry (periodic, 1/min)
depot/{depot_id}/station/{station_id}/module/{slot}/telemetry
  → JSON: {temp, current, voltage, efficiency, esr, anomaly_score}

# Events (immediate)
depot/{depot_id}/station/{station_id}/events
  → JSON: {event_type, slot, severity, message, timestamp}

# Commands (from Depot Controller)
depot/{depot_id}/station/{station_id}/commands
  → JSON: {command, parameters}

# Swap requests
depot/{depot_id}/station/{station_id}/swap/request
  → JSON: {slot, urgency, reason, estimated_rul}

depot/{depot_id}/station/{station_id}/swap/complete
  → JSON: {slot, old_module_sn, new_module_sn, result}
```

### 3.5 Local Storage & Persistence

```
DATA STORAGE
═══════════════════════════════════════════════════════════════

SQLite Database (lokalno):
─────────────────────────────────

Tables:
• charging_sessions - istorija punjenja
• module_telemetry - agregirani podaci (1min resolution)
• module_events - svi alarmi i događaji
• swap_history - sve zamene modula
• config - konfiguracija sistema

Retention:
• Telemetry: 90 dana lokalno, zatim upload + delete
• Events: 1 godina
• Sessions: trajno (billing relevantno)

Sync:
• Background sync ka Depot/Cloud
• Offline-first: sve radi i bez uplink-a
```

---

## 4. Level 3: Depot Controller

### 4.1 Role & Responsibilities

```
DEPOT CONTROLLER - FUNKCIJE
═══════════════════════════════════════════════════════════════

1. INVENTORY MANAGEMENT
   • Tracking svih modula (po serijskom broju)
   • Lokacija: u stanici / u skladištu / na busu / u servisu
   • Status: aktivan / degradiran / na čekanju / u popravci

2. SWAP COORDINATION
   • Prima swap requests od svih stanica
   • Optimizuje: koji bus nosi koji modul gde
   • Koordinira sa voznim redom autobusa

3. SPARE POOL MANAGEMENT
   • Koliko spare modula treba u depou?
   • Kada naručiti nove?
   • Koji moduli idu na refurbishment?

4. FLEET LOGISTICS INTEGRATION
   • API ka fleet management sistemu
   • Zna raspored autobusa
   • Može zakazati "service bus" ako treba

5. LOCAL ANALYTICS
   • Agregacija podataka sa svih stanica
   • Trend analysis za ceo depot
   • Predictive: "za 2 nedelje će trebati 5 zamena"

6. UPLINK TO CLOUD
   • Sync sa centralnim sistemom (ako postoji)
   • Backup za sve podatke
```

### 4.2 Hardware

```
DEPOT CONTROLLER HARDWARE
═══════════════════════════════════════════════════════════════

Opcija: Standard server ili VM

Preporučeno:
• Intel NUC ili mini server
• 8GB+ RAM
• 256GB+ SSD
• UPS backup (min 30 min)
• Dual Ethernet (redundancy)

Software:
• Linux server (Ubuntu LTS)
• Docker za sve servise
• PostgreSQL za bazu
• Mosquitto MQTT broker
• Nginx reverse proxy

Može biti i VM na postojećoj depot IT infrastrukturi.
```

### 4.3 Software Architecture

```
DEPOT CONTROLLER SOFTWARE STACK
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                      DEPOT CONTROLLER                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │   INVENTORY    │  │     SWAP       │  │   FLEET      │  │
│  │   SERVICE      │  │   OPTIMIZER    │  │ INTEGRATION  │  │
│  │                │  │                │  │              │  │
│  │ • Module       │  │ • Queue mgmt   │  │ • Bus        │  │
│  │   tracking     │  │ • Route        │  │   schedules  │  │
│  │ • Serial #     │  │   optimization │  │ • Driver     │  │
│  │   management   │  │ • Batching     │  │   comms      │  │
│  │ • Lifecycle    │  │               │  │ • Service    │  │
│  │   status       │  │                │  │   requests   │  │
│  └───────┬────────┘  └───────┬────────┘  └──────┬───────┘  │
│          │                   │                   │          │
│          └───────────────────┼───────────────────┘          │
│                              ▼                              │
│                    ┌─────────────────┐                      │
│                    │  ORCHESTRATOR   │                      │
│                    └────────┬────────┘                      │
│                             │                               │
│         ┌───────────────────┼───────────────────┐          │
│         ▼                   ▼                   ▼          │
│    ┌─────────┐        ┌──────────┐        ┌─────────┐      │
│    │  MQTT   │        │   REST   │        │ WebSocket│     │
│    │ Broker  │        │   API    │        │  (UI)   │      │
│    └─────────┘        └──────────┘        └─────────┘      │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    PostgreSQL + Redis                        │
├─────────────────────────────────────────────────────────────┤
│                    Docker + Linux                            │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Swap Optimization Algorithm

```
SWAP OPTIMIZER - LOGIKA
═══════════════════════════════════════════════════════════════

Input:
• Lista swap requests (station, slot, urgency, reason)
• Trenutni inventory spare modula
• Raspored autobusa (sledećih 24h)
• Kapacitet autobusa za transport modula

Output:
• Optimalan plan: koji bus → koje module → koja stanica

ALGORITAM (Greedy + Heuristics):
─────────────────────────────────

1. PRIORITIZE REQUESTS
   Sort by: urgency DESC, station_distance ASC

   Critical → mora u sledećih 30 min
   Urgent → mora u sledećih 4h
   Planned → u sledećih 7 dana

2. FOR EACH CRITICAL/URGENT:
   Find soonest bus passing that station
   IF bus has capacity:
       Assign module to bus
       Reserve spare from inventory
   ELSE:
       Flag for dedicated service vehicle

3. FOR PLANNED REQUESTS:
   Group by route
   Find bus that passes multiple stations
   Batch replacements (minimize trips)

4. CONSTRAINT CHECK:
   • Bus max capacity: 4 modules (example)
   • Driver nije maintenance tehničar → samo drop-off
   • Ako robot nije dostupan → skip

5. OUTPUT PLAN:
   {
     bus_id: "BUS-042",
     departure: "14:30",
     tasks: [
       {station: "S-01", action: "deliver", modules: ["M-1234"]},
       {station: "S-01", action: "pickup", modules: ["M-0987"]},
       {station: "S-03", action: "deliver", modules: ["M-5678"]}
     ]
   }
```

### 4.5 Dashboard UI

```
DEPOT DASHBOARD (Web)
═══════════════════════════════════════════════════════════════

Tech: React + TypeScript + TailwindCSS
Real-time: WebSocket za live updates

VIEWS:
─────────────────────────────────

1. OVERVIEW
   ┌─────────────────────────────────────────────────────────┐
   │  DEPOT: Beograd Centar                                  │
   │                                                          │
   │  Stations: 12      Modules: 156     Spare: 18          │
   │  Online: 12        Healthy: 142     In Transit: 4      │
   │                    Warning: 11      In Repair: 8       │
   │                    Critical: 3                          │
   │                                                          │
   │  [!] 3 modules need replacement in next 24h            │
   └─────────────────────────────────────────────────────────┘

2. STATION MAP
   • Interaktivna mapa depoa
   • Svaka stanica: zeleno/žuto/crveno
   • Click → detalji stanice

3. MODULE LIST
   • Tabela svih modula
   • Filter by status, station, age
   • Sort by health score
   • Click → modul istorija

4. SWAP QUEUE
   • Pending swaps
   • Assigned bus
   • ETA
   • Manual override opcije

5. ANALYTICS
   • Failure trends
   • MTBF per module batch
   • Seasonal patterns
   • Cost analysis
```

---

## 5. Level 4: Cloud / Central Management

### 5.1 Optional but Recommended

```
CLOUD FUNKCIJE
═══════════════════════════════════════════════════════════════

1. MULTI-DEPOT MANAGEMENT
   • Centralni pregled svih depoa
   • Cross-depot spare sharing
   • Global inventory optimization

2. ADVANCED ANALYTICS
   • ML models trenirani na podacima cele flote
   • Failure prediction improvements
   • Benchmark between depots

3. OTA UPDATES
   • Firmware updates za module
   • Software updates za Station/Depot controllers
   • Staged rollout (10% → 50% → 100%)

4. BILLING & REPORTING
   • Energy consumption reports
   • Maintenance cost tracking
   • SLA compliance

5. REMOTE SUPPORT
   • Secure access za dijagnostiku
   • Remote configuration
   • Troubleshooting assistance
```

### 5.2 Cloud Architecture (Sketch)

```
CLOUD INFRASTRUCTURE
═══════════════════════════════════════════════════════════════

Provider: AWS / Azure / GCP (bilo koji)

┌─────────────────────────────────────────────────────────────┐
│                         CLOUD                                │
│                                                              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │   API         │  │   Analytics   │  │   ML          │   │
│  │   Gateway     │  │   Service     │  │   Training    │   │
│  └───────┬───────┘  └───────────────┘  └───────────────┘   │
│          │                                                   │
│          ▼                                                   │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │   IoT Hub     │  │   Time Series │  │   Blob        │   │
│  │   (MQTT)      │  │   Database    │  │   Storage     │   │
│  └───────────────┘  └───────────────┘  └───────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
          │
          │ TLS/MQTT
          ▼
    ┌───────────┐
    │  DEPOT    │
    │ Controller│
    └───────────┘
```

---

## 6. Security Considerations

```
SECURITY LAYERS
═══════════════════════════════════════════════════════════════

1. NETWORK SEGMENTATION
   • Separate VLAN za charging infrastructure
   • Firewall između IT i OT mreže
   • No direct internet access za Station Controllers

2. AUTHENTICATION
   • Mutual TLS za MQTT
   • API keys za REST
   • Role-based access control (RBAC)

3. ENCRYPTION
   • TLS 1.3 za sve eksterne komunikacije
   • AES-256 za stored credentials
   • Signed firmware updates

4. PHYSICAL SECURITY
   • Locked cabinets za controllers
   • Tamper detection
   • Secure boot na embedded uređajima

5. MONITORING
   • Audit log svih komandi
   • Anomaly detection na network traffic
   • Alerting za unauthorized access attempts
```

---

## 7. Failure Modes & Resilience

```
FAILURE SCENARIOS I ODGOVOR
═══════════════════════════════════════════════════════════════

SCENARIO: Station Controller offline
─────────────────────────────────────
• Moduli nastavljaju da rade autonomno
• Basic charging OK
• Nema novih swap operacija
• Alert ka Depot Controller
• Recovery: automatski reconnect

SCENARIO: Depot Controller offline
─────────────────────────────────────
• Stanice rade normalno
• Swap zahtevi se queue-uju lokalno
• Manual swap i dalje moguć
• Recovery: sync backlog

SCENARIO: Cloud offline
─────────────────────────────────────
• Potpuno normalan rad
• Lokalni podaci se akumuliraju
• Sync kad se uspostavi veza
• Nema uticaja na operacije

SCENARIO: CAN bus fault
─────────────────────────────────────
• Moduli prelaze u safe mode
• Charging stops
• Physical intervention required
• Critical alert

SCENARIO: Power outage
─────────────────────────────────────
• Station Controller na UPS (30 min)
• Graceful shutdown svih modula
• State saved to persistent storage
• Auto-recovery on power restore
```

---

## 8. Development Roadmap

```
PHASE 1: Single Station MVP (Month 1-3)
═══════════════════════════════════════════════════════════════
□ Station Controller basic (Raspberry Pi)
□ CAN communication sa 4 EK3 modula
□ Basic charging session management
□ Local web dashboard (read-only)
□ Manual swap (no robot)

PHASE 2: Robot Integration (Month 4-5)
═══════════════════════════════════════════════════════════════
□ Robot controller integration
□ Swap sequence implementation
□ Safety interlock system
□ Swap request/complete flow

PHASE 3: Multi-Station (Month 6-7)
═══════════════════════════════════════════════════════════════
□ Depot Controller MVP
□ Multi-station management
□ Inventory tracking
□ Basic swap optimization

PHASE 4: Fleet Integration (Month 8-9)
═══════════════════════════════════════════════════════════════
□ Bus schedule integration
□ Transport logistics
□ Driver notifications
□ End-to-end swap workflow

PHASE 5: Cloud & Scale (Month 10-12)
═══════════════════════════════════════════════════════════════
□ Cloud backend
□ Multi-depot support
□ Advanced analytics
□ OTA update system
```

---

## 9. Open Questions

1. **Fleet management sistem klijenta** - API ili custom integracija?
2. **Vehicle communication** - ISO 15118, OCPP, proprietary?
3. **Billing integration** - direktno ili preko postojećeg sistema?
4. **Robot vendor** - off-the-shelf ili custom?
5. **Multi-tenant** - jedan sistem za više operatora?

---

## References

- OCPP 2.0.1 Specification (Open Charge Point Protocol)
- ISO 15118 (Vehicle-to-Grid Communication)
- IEC 61851 (EV Charging Standards)
- CANopen CiA 301/401
- MQTT 5.0 Specification
