# JEZGRO Development Options

## Document Information

| Field | Value |
|-------|-------|
| Document ID | EK-TECH-020 |
| Version | 1.2 |
| Date | 2026-01-04 |
| Status | Active |
| Related | 16-jezgro.md, 17-jezgro-dev-bom.md, 18-jezgro-dev-plan.md |

---

## 1. Overview

JEZGRO microkernel RTOS can be developed on three different hardware platforms, each optimized for specific use cases:

| Option | Platform | Target Use Case | Entry Cost |
|--------|----------|-----------------|------------|
| **STM32** | ST STM32G474 | Fast prototyping, startups | €290 |
| **AURIX** | Infineon TC375/TC397 | Safety-critical automotive (ASIL-D) | €165 |
| **Hybrid** | AURIX + C2000 + ESP32 | Ultimate: ASIL-D + 150ps PWM + WiFi/OTA | €200 |

---

## 2. Option Comparison

### 2.1 Technical Specifications

| Specification | STM32 | AURIX | Hybrid |
|---------------|-------|-------|--------|
| **Primary MCU** | STM32G474 | TC375/TC397 | AURIX + C2000 + ESP32 |
| **Architecture** | Cortex-M4 | TriCore (3 cores) | TriCore + DSP + Xtensa |
| **Clock Speed** | 170 MHz | 300 MHz | 300 + 100 + 240 MHz |
| **RAM** | 128 KB | 768 KB | 768 + 100 + 512 KB |
| **CAN-FD** | 3× instances | 4× instances | 4× + 2× instances |
| **MPU Regions** | 8 | 16 per core | 16 + dedicated power MCU |
| **PWM Resolution** | 5.9 ns | 6.5 ns | **150 ps** (C2000) |
| **ADC** | 12-bit @ 4 MSPS | 12-bit @ 5 MSPS | 12-bit @ 3.5 MSPS |
| **Safety Certification** | None | **ASIL-D** | **ASIL-D** (AURIX) |
| **Hardware Lockstep** | No | **Yes** | **Yes** (AURIX) |
| **HSM (Security)** | No | **Yes** | **Yes** (AURIX) |
| **WiFi/OTA** | No | No | **Yes** (ESP32) |

### 2.2 Investment Comparison

| Phase | STM32 | AURIX | Hybrid |
|-------|-------|-------|--------|
| Phase 1: Kernel | €290 | €165 | €200 |
| Phase 2: CAN-FD Swarm | €410 | €430 | €550 |
| Phase 3: Full System | €605 | €830 | €1,100 |
| Phase 4: Production | €770 | €1,030 | €1,400 |

### 2.3 Development Complexity

| Factor | STM32 | AURIX | Hybrid |
|--------|-------|-------|--------|
| Learning Curve | Low | Medium | High |
| Toolchains | 1 | 1 | 3 |
| Ecosystem Size | ★★★★★ | ★★★ | ★★★★ |
| Debug Complexity | Low | Medium | High |
| Time to First Boot | 1 day | 3 days | 7 days |
| Community Support | Excellent | Good | Mixed |

---

## 3. Option A: STM32 (Recommended Start)

### 3.1 Why STM32?

The STM32G474 offers the best balance of ecosystem, cost, and capability for initial JEZGRO development.

**Key Features:**
- Cortex-M4 @ 170 MHz with FPU
- 128 KB RAM, 512 KB Flash
- 8 MPU regions for fault isolation
- 3× CAN-FD @ 5 Mbps
- HRPWM for power electronics
- Integrated ST-LINK debugger on NUCLEO boards

### 3.2 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    STM32G474 Node                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   JEZGRO    │  │    IPC      │  │   CAN-FD    │     │
│  │   Kernel    │◄─┤   Manager   │◄─┤   Gateway   │◄─┐  │
│  │   (EDF)     │  │             │  │             │  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│         │                                           │  │
│  ┌──────▼──────────────────────────────────────┐   │  │
│  │              User Services                   │   │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐          │   │  │
│  │  │ Power  │ │ Thermal│ │ Comm   │  ...     │   │  │
│  │  │ Ctrl   │ │ Mgmt   │ │ Stack  │          │   │  │
│  │  └────────┘ └────────┘ └────────┘          │   │  │
│  └─────────────────────────────────────────────┘   │  │
└────────────────────────────────────────────────────┼──┘
                                                     │
                              CAN-FD Bus (5 Mbps) ◄──┘
```

### 3.3 Development BOM Summary

| Phase | Investment | Hardware |
|-------|------------|----------|
| 1. Kernel Core | €290 | 10× NUCLEO-G474RE + USB hub |
| 2. CAN-FD | €410 | + CAN transceivers + Canable Pro |
| 3. Debug Tools | €440 | + Logic analyzer + UART adapters |
| 4. Custom PCB | €605 | + 5× prototype boards |

**Full BOM:** See `17-jezgro-dev-bom.md`
**Development Plan:** See `18-jezgro-dev-plan.md`

### 3.4 Strengths & Limitations

| Strengths | Limitations |
|-----------|-------------|
| Largest ecosystem | No safety certification |
| Lowest learning curve | Single-core only |
| Cheapest dev boards (€24) | No hardware lockstep |
| Excellent documentation | Limited RAM (128 KB) |
| Fast time to market | No integrated HSM |

---

## 4. Option B: Infineon AURIX (Safety-Critical)

### 4.1 Why AURIX?

AURIX TC3xx is the gold standard for safety-critical automotive applications, offering hardware features impossible to achieve in software.

**Key Features:**
- 3× TriCore CPUs @ 300 MHz
- Hardware lockstep (CPU0 mirrors CPU1)
- ASIL-D certified
- Hardware Security Module (HSM)
- 768 KB RAM
- FlexRay support

### 4.2 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AURIX TC375 (3 cores)                    │
├───────────────┬───────────────┬───────────────┬─────────────┤
│    CPU0       │     CPU1      │     CPU2      │    HSM      │
│   (Master)    │  (Lockstep)   │   (Safety)    │  (Crypto)   │
├───────────────┼───────────────┼───────────────┼─────────────┤
│ JEZGRO Kernel │ JEZGRO Mirror │ Safety        │ Secure boot │
│ Scheduler     │ (redundant)   │ Monitor       │ Key storage │
│ IPC Manager   │               │ Watchdog      │ Crypto accel│
│ CAN Gateway   │               │ Fault Handler │             │
└───────────────┴───────────────┴───────────────┴─────────────┘
        │               │               │
        └───────────────┴───────────────┘
                        │
           Hardware Comparator (lockstep verification)
```

### 4.3 Development BOM

#### Phase 1: Kernel Development (~€165)

| Item | Part Number | Qty | €/unit | Total € |
|------|-------------|-----|--------|---------|
| AURIX TC375 Lite Kit | KIT_A2G_TC375_LITE | 2 | 70 | 140 |
| USB cables | - | 4 | 2 | 8 |
| Jumper wires kit | - | 1 | 7 | 7 |
| Breadboard | - | 2 | 5 | 10 |
| **Subtotal** | | | | **€165** |

#### Phase 2: CAN-FD Swarm (~€265)

| Item | Part Number | Qty | €/unit | Total € |
|------|-------------|-----|--------|---------|
| AURIX TC375 Lite Kit | KIT_A2G_TC375_LITE | 3 | 70 | 210 |
| CAN-FD transceiver | TLE9251VSJ | 5 | 8 | 40 |
| Termination + cables | - | 1 | 15 | 15 |
| **Subtotal** | | | | **€265** |

#### Phase 3: Safety Validation (~€400)

| Item | Part Number | Qty | €/unit | Total € |
|------|-------------|-----|--------|---------|
| AURIX TC397 Application Kit | KIT_A2G_TC397_TFT | 1 | 350 | 350 |
| Isolation monitor board | Custom | 1 | 50 | 50 |
| **Subtotal** | | | | **€400** |

**Optional Professional Tools:**
- Lauterbach TRACE32: ~€2,000
- iSYSTEM Blue Box: ~€800
- Tasking Compiler: €3,000/year

### 4.4 Software Stack

| Tool | Purpose | Cost |
|------|---------|------|
| AURIX Development Studio | IDE (Eclipse-based) | Free |
| iLLD (Low Level Drivers) | HAL for AURIX | Free |
| MCAL (AUTOSAR) | AUTOSAR drivers | Free (limited) |
| SafeTlib | Safety library | Free |
| TriCore GCC | Compiler | Free |

### 4.5 Strengths & Limitations

| Strengths | Limitations |
|-----------|-------------|
| ASIL-D certification | Steeper learning curve |
| Hardware lockstep | TriCore ≠ ARM |
| HSM for security | More expensive (€70/board) |
| 768 KB RAM | Smaller ecosystem |
| 3 independent cores | Overkill for non-safety apps |

---

## 5. Option C: Hybrid "Ultimate"

### 5.1 Why Hybrid?

Combines the best of all worlds: AURIX safety + high-resolution PWM + ESP32 connectivity. The ultimate solution for demanding applications.

**Key Features:**
- AURIX TC375/TC397 for ASIL-D safety and swarm coordination
- **Infineon XMC4400** OR TI C2000 for power control (150 ps PWM resolution)
- ESP32 for wireless connectivity (WiFi/BT, OTA updates)

### 5.1.1 XMC4400 vs TI C2000 (HRPWM MCU Choice)

| Feature | Infineon XMC4400 | TI C2000 (F280049C) |
|---------|------------------|---------------------|
| **Architecture** | ARM Cortex-M4 | C28x DSP |
| **HRPWM Resolution** | 150 ps | 150 ps |
| **Renode Emulation** | ✅ Possible (custom) | ❌ Not supported |
| **Vendor** | **Same as AURIX** | TI only |
| **ADC Speed** | 70 ns (14.3 MSPS) | 290 ns (3.5 MSPS) |
| **IDE** | DAVE (no simulator) | CCS (with simulator) |
| **Reference Designs** | Würth 3kW LLC | Community |
| **Dev Board** | ~€35 (PLT2GO) | ~€25 (LaunchPad) |

**Recommendation:**
- Use **XMC4400** for easier emulation and Infineon ecosystem consistency
- Use **TI C2000** if you need CCS simulator or have existing TI expertise

### 5.2 Architecture

```
                    ┌─────────────────────────────────────┐
                    │         Cloud / SCADA               │
                    └──────────────┬──────────────────────┘
                                   │ WiFi/MQTT
                    ┌──────────────▼──────────────────────┐
                    │     ESP32-S3 Communication Hub      │
                    │   • WiFi/BT gateway • OTA updates   │
                    └──────────────┬──────────────────────┘
                                   │ UART 1 Mbps
┌──────────────────────────────────┼──────────────────────────────────┐
│                          CAN-FD Bus (5 Mbps)                        │
└───────────────┬──────────────────┴──────────────────┬───────────────┘
                │                                     │
┌───────────────▼───────────────┐     ┌───────────────▼───────────────┐
│       AURIX TC375/TC397       │     │      TMS320F280049C           │
│    JEZGRO Master (ASIL-D)     │     │      Power Controller         │
├───────────────────────────────┤     ├───────────────────────────────┤
│ • Lockstep (CPU0/CPU1)        │     │ • HRPWM 150 ps resolution     │
│ • Safety monitor (CPU2)       │     │ • ADC 3.5 MSPS                │
│ • HSM crypto                  │     │ • PFC + LLC control           │
│ • Swarm coordination          │     │ • Phase-shift DAB             │
└───────────────────────────────┘     └───────────────────────────────┘
```

### 5.3 Development BOM

#### Phase 1: Triple-MCU Core (~€200-210)

**Option A: With XMC4400 (Recommended - Infineon ecosystem)**

| Item | Part Number | Qty | €/unit | Total € |
|------|-------------|-----|--------|---------|
| AURIX TC375 Lite Kit | KIT_A2G_TC375_LITE | 2 | 70 | 140 |
| **XMC4400 PLT2GO** | KIT_XMC_PLT2GO_XMC4400 | 1 | 35 | 35 |
| ESP32-S3-DevKitC-1 | ESP32-S3-DEVKITC-1 | 1 | 10 | 10 |
| CAN + cables + jumpers | - | 1 | 25 | 25 |
| **Subtotal** | | | | **€210** |

**Option B: With TI C2000 (CCS simulator available)**

| Item | Part Number | Qty | €/unit | Total € |
|------|-------------|-----|--------|---------|
| AURIX TC375 Lite Kit | KIT_A2G_TC375_LITE | 2 | 70 | 140 |
| TI LaunchPad F280049C | LAUNCHXL-F280049C | 1 | 25 | 25 |
| ESP32-S3-DevKitC-1 | ESP32-S3-DEVKITC-1 | 1 | 10 | 10 |
| CAN + cables + jumpers | - | 1 | 25 | 25 |
| **Subtotal** | | | | **€200** |

#### Phase 2: Full Integration (~€350)

| Item | Part Number | Qty | €/unit | Total € |
|------|-------------|-----|--------|---------|
| AURIX TC375 Lite Kit | KIT_A2G_TC375_LITE | 2 | 70 | 140 |
| TI LaunchPad F280049C | LAUNCHXL-F280049C | 2 | 25 | 50 |
| CAN-FD transceivers | TLE9251VSJ | 6 | 8 | 48 |
| Canable Pro | - | 1 | 80 | 80 |
| Cables, connectors | - | 1 | 32 | 32 |
| **Subtotal** | | | | **€350** |

#### Phase 3: Production System (~€550)

| Item | Part Number | Qty | €/unit | Total € |
|------|-------------|-----|--------|---------|
| AURIX TC397 Application Kit | KIT_A2G_TC397_TFT | 1 | 350 | 350 |
| Custom prototype PCB | - | 5 | 30 | 150 |
| Additional components | - | 1 | 50 | 50 |
| **Subtotal** | | | | **€550** |

### 5.4 Software Stack

| MCU | IDE | Compiler | RTOS |
|-----|-----|----------|------|
| AURIX TC375 | AURIX Dev Studio | TriCore GCC | JEZGRO |
| TMS320F280049C | Code Composer Studio | TI C2000 | Bare metal |
| ESP32-S3 | VS Code | ESP-IDF | FreeRTOS |

### 5.5 Inter-MCU Protocol

```
┌────────────────────────────────────────────────────────────────┐
│                    CAN-FD Message Format                       │
├────────────┬───────────┬───────────┬──────────────────────────┤
│ ID (11bit) │ Type (4b) │ Src (4b)  │ Payload (0-64 bytes)     │
├────────────┼───────────┼───────────┼──────────────────────────┤
│ 0x100-1FF  │ COORD     │ AURIX     │ Swarm commands, safety   │
│ 0x200-2FF  │ POWER     │ C2000     │ PWM setpoints, ADC       │
│ 0x300-3FF  │ CLOUD     │ ESP32     │ Telemetry, OTA status    │
│ 0x400-4FF  │ TELEMETRY │ Any       │ Monitoring data          │
└────────────┴───────────┴───────────┴──────────────────────────┘
```

### 5.6 Strengths & Limitations

| Strengths | Limitations |
|-----------|-------------|
| **ASIL-D certified** (AURIX) | 3 different toolchains |
| **150 ps PWM** (C2000) | Higher cost (~€1,100 full) |
| **WiFi/OTA** (ESP32) | More complex integration |
| Hardware lockstep | Longer development time (7 days) |
| HSM crypto security | Requires multi-domain expertise |
| Maximum capability | Larger PCB footprint |

---

## 6. Recommendation Matrix

| Scenario | Recommended | Rationale |
|----------|-------------|-----------|
| Fast PoC, startup | **STM32** | Fastest time to market, best ecosystem |
| Limited budget | **STM32** | Cheapest full system (€605) |
| Automotive OEM | **AURIX** | ASIL-D certification required |
| Safety-critical | **AURIX** | Hardware lockstep, HSM |
| Premium power electronics | **Hybrid** | 150 ps PWM resolution |
| IoT/connected product | **Hybrid** | Built-in WiFi/BT |
| Maximum flexibility | **Hybrid** | Best-in-class components |
| AUTOSAR required | **AURIX** | Native MCAL support |
| Existing TI expertise | **Hybrid** | Leverage C2000 knowledge |

---

## 7. Migration Paths

Starting with STM32 doesn't lock you in:

```
                        STM32 (Start Here)
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
    Stay with STM32      Migrate to AURIX    Evolve to Hybrid
    (Production)         (Safety needed)     (Performance needed)
            │                  │                  │
            │                  │                  │
            ▼                  ▼                  ▼
    ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
    │ • Scale swarm │  │ • Port to     │  │ • Keep STM32  │
    │ • Custom PCB  │  │   TriCore     │  │   coordinator │
    │ • Production  │  │ • Add lockstep│  │ • Add C2000   │
    │   optimize    │  │ • SafeTlib    │  │   for power   │
    │               │  │ • ASIL cert   │  │ • Add XMC     │
    │               │  │               │  │   for safety  │
    └───────────────┘  └───────────────┘  └───────────────┘
```

**Recommended approach:** Start with STM32, validate JEZGRO kernel design, then migrate if requirements demand.

---

## 8. Quick Decision Guide

```
Do you need ASIL-D certification?
    │
    ├─► YES ─► AURIX
    │
    └─► NO
         │
         Do you need 150 ps PWM for power electronics?
             │
             ├─► YES ─► Hybrid
             │
             └─► NO
                  │
                  Do you need wireless OTA?
                      │
                      ├─► YES ─► Hybrid
                      │
                      └─► NO ─► STM32
```

---

## 9. Reference Documents

| Document | Content |
|----------|---------|
| 16-jezgro.md | Full RTOS specification |
| 17-jezgro-dev-bom.md | STM32 complete BOM |
| 18-jezgro-dev-plan.md | STM32 development plan |
| SPECIFICATIONS.md | EK3 hardware specifications |

---

## Change History

| Date | Version | Description |
|------|---------|-------------|
| 2026-01-04 | 1.0 | Initial version |
| 2026-01-04 | 1.1 | Consolidated three options, website-ready |
| 2026-01-04 | 1.2 | Hybrid updated to AURIX + C2000 + ESP32 (Ultimate) |
| 2026-01-04 | 1.3 | Added Infineon XMC4400 as alternative to TI C2000 (ARM Cortex-M4 with 150ps HRPWM, Renode emulatable) |
