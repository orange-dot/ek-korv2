# EK-ADAPT: Adapter Device Specifications

**Version:** 1.0
**Date:** 2026-01-04
**Status:** SPECIFICATION

---

## Document Purpose

This document specifies the **EK-ADAPT** family of adapter devices that extend the ELEKTROKOMBINACIJA ecosystem to work with third-party vehicles, legacy buses, and existing charging standards. All adapters run JEZGRO-GW firmware for consistent behavior and integration.

---

## 1. Overview

### 1.1 Adapter Family

| Device | Purpose | Target Market |
|--------|---------|---------------|
| **EK-ADAPT-V2G** | Non-EK vehicles → V2G network | Third-party EV fleets |
| **EK-ADAPT-BUS** | Retrofit legacy buses | Transit operators |
| **EK-ADAPT-CCS** | CCS Combo to EK bridge | Standard DC charging |
| **EK-ADAPT-MCS** | Megawatt Charging adapter | Heavy-duty trucks |
| **EK-ADAPT-OCPP** | Third-party charger gateway | CPO integration |

### 1.2 Common Architecture

All adapters share:
- STM32H743 MCU running JEZGRO-GW
- CAN-FD interface to EK ecosystem
- Modular software (enable/disable services per adapter type)
- Common mechanical enclosure family

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ADAPTER FAMILY ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                          ┌───────────────────────────────────────────┐       │
│                          │          ELEKTROKOMBINACIJA                │       │
│                          │              ECOSYSTEM                     │       │
│                          │                                           │       │
│                          │  ┌─────────┐  ┌─────────┐  ┌─────────┐  │       │
│                          │  │   EK3   │  │ Station │  │  Fleet  │  │       │
│                          │  │ Modules │  │  Ctrl   │  │   Mgmt  │  │       │
│                          │  └────┬────┘  └────┬────┘  └────┬────┘  │       │
│                          │       │            │            │        │       │
│                          └───────┼────────────┼────────────┼────────┘       │
│                                  │            │            │                 │
│                          ═══════╪════════════╪════════════╪═══════════      │
│                                 CAN-FD       MQTT/REST    MQTT              │
│                          ═══════╪════════════╪════════════╪═══════════      │
│                                  │            │            │                 │
│   ┌─────────────┬────────────────┼────────────┼────────────┼──────────────┐ │
│   │             │                │            │            │              │ │
│   ▼             ▼                ▼            ▼            ▼              ▼ │
│ ┌────────┐  ┌────────┐     ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐│
│ │EK-ADAPT│  │EK-ADAPT│     │EK-ADAPT│   │EK-ADAPT│   │EK-ADAPT│   │Future  ││
│ │  V2G   │  │  BUS   │     │  CCS   │   │  MCS   │   │  OCPP  │   │Adapters││
│ └───┬────┘  └───┬────┘     └───┬────┘   └───┬────┘   └───┬────┘   └────────┘│
│     │           │              │            │            │                  │
│     ▼           ▼              ▼            ▼            ▼                  │
│ ┌────────┐  ┌────────┐     ┌────────┐   ┌────────┐   ┌────────┐            │
│ │Third-  │  │Legacy  │     │Standard│   │ Heavy  │   │Third-  │            │
│ │party EV│  │ Bus    │     │CCS EV  │   │ Truck  │   │party   │            │
│ └────────┘  └────────┘     └────────┘   └────────┘   │Charger │            │
│                                                       └────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. EK-ADAPT-V2G

### 2.1 Purpose

Enables any V2G-capable electric vehicle to participate in the ELEKTROKOMBINACIJA V2G network, regardless of manufacturer.

### 2.2 Use Cases

1. **Fleet Integration**: Third-party EVs (Nissan Leaf, VW ID, etc.) joining EK V2G network
2. **Grid Services**: Enable non-EK vehicles to provide frequency response
3. **Energy Arbitrage**: Allow any EV to participate in price-based charging

### 2.3 Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| Input | CCS Combo 2 / CHAdeMO | Via separate inlet |
| Output | EK CAN-FD bus | System integration |
| Power range | 10-50 kW bidirectional | Per vehicle capability |
| Protocol support | ISO 15118-2, -20, CHAdeMO 3.0 | Full V2G stack |
| MCU | STM32H743 | JEZGRO-GW |
| Dimensions | 300 × 200 × 100 mm | Wall-mount |
| IP rating | IP54 | Indoor/sheltered outdoor |

### 2.4 Block Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EK-ADAPT-V2G BLOCK DIAGRAM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   VEHICLE SIDE                           EK ECOSYSTEM SIDE                   │
│                                                                              │
│   ┌─────────────┐                        ┌─────────────┐                    │
│   │   CCS2      │                        │  CAN-FD    │                    │
│   │  Connector  │                        │  Interface  │                    │
│   └──────┬──────┘                        └──────┬──────┘                    │
│          │                                      │                           │
│   ┌──────▼──────┐                        ┌──────▼──────┐                    │
│   │    PLC      │                        │   Station   │                    │
│   │   Modem     │                        │  Controller │                    │
│   │ (HomePlug)  │                        │   Gateway   │                    │
│   └──────┬──────┘                        └──────┬──────┘                    │
│          │                                      │                           │
│          └──────────────────┬───────────────────┘                           │
│                             │                                               │
│                      ┌──────▼──────┐                                        │
│                      │  STM32H743  │                                        │
│                      │  JEZGRO-GW  │                                        │
│                      │             │                                        │
│                      │ ┌─────────┐ │                                        │
│                      │ │ISO15118 │ │                                        │
│                      │ │ Service │ │                                        │
│                      │ └─────────┘ │                                        │
│                      │ ┌─────────┐ │                                        │
│                      │ │ Protocol│ │                                        │
│                      │ │Translate│ │                                        │
│                      │ └─────────┘ │                                        │
│                      │ ┌─────────┐ │                                        │
│                      │ │  V2G    │ │                                        │
│                      │ │ Control │ │                                        │
│                      │ └─────────┘ │                                        │
│                      └─────────────┘                                        │
│                                                                              │
│   Functions:                                                                 │
│   • ISO 15118 ↔ EK protocol translation                                     │
│   • V2G session management                                                  │
│   • Grid service coordination                                               │
│   • Power metering and billing                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.5 JEZGRO-GW Configuration

```c
// EK-ADAPT-V2G service configuration
#define JEZGRO_ENABLE_PLL_SYNC       0  // No direct grid connection
#define JEZGRO_ENABLE_CURRENT_CTRL   0  // No inverter control
#define JEZGRO_ENABLE_DROOP_CTRL     0  // Droop via ISO 15118
#define JEZGRO_ENABLE_ISO15118       1  // Full V2G stack
#define JEZGRO_ENABLE_SLAC           1  // PLC communication
#define JEZGRO_ENABLE_OCPP_CLIENT    1  // Backend communication
#define JEZGRO_ENABLE_CAN_HANDLER    1  // EK integration
#define JEZGRO_ENABLE_AUDIT_LOGGER   1  // Event logging
```

---

## 3. EK-ADAPT-BUS

### 3.1 Purpose

Retrofits existing diesel or older electric buses to work with ELEKTROKOMBINACIJA battery swap and charging infrastructure.

### 3.2 Use Cases

1. **Retrofit Conversion**: Add swap capability to existing electric buses
2. **Hybrid Integration**: Connect diesel-hybrid buses to charging network
3. **Fleet Transition**: Gradual migration from legacy to EK platform

### 3.3 Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| Vehicle interface | OEM-specific CAN | Translated to EK |
| EK interface | CAN-FD @ 5 Mbps | Standard EK protocol |
| Battery monitoring | Via OEM BMS | Pass-through data |
| MCU | STM32G474 | Simpler requirements |
| Dimensions | 200 × 150 × 80 mm | Under-dash mount |
| IP rating | IP40 | Indoor vehicle |

### 3.4 Block Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EK-ADAPT-BUS BLOCK DIAGRAM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   BUS (Legacy)                              EK ECOSYSTEM                     │
│                                                                              │
│   ┌─────────────┐                          ┌─────────────┐                  │
│   │   OEM       │                          │   Swap      │                  │
│   │   CAN Bus   │                          │   Station   │                  │
│   └──────┬──────┘                          └──────┬──────┘                  │
│          │                                        │                         │
│   ┌──────▼──────┐                          ┌──────▼──────┐                  │
│   │   OEM BMS   │                          │   EK       │                  │
│   │  Interface  │                          │  CAN-FD    │                  │
│   └──────┬──────┘                          └──────┬──────┘                  │
│          │                                        │                         │
│          └────────────────┬───────────────────────┘                         │
│                           │                                                 │
│                    ┌──────▼──────┐                                          │
│                    │  STM32G474  │                                          │
│                    │  JEZGRO-GW  │                                          │
│                    │             │                                          │
│                    │ ┌─────────┐ │                                          │
│                    │ │OEM Proto│ │  ← OEM-specific                          │
│                    │ │ Parser  │ │                                          │
│                    │ └─────────┘ │                                          │
│                    │ ┌─────────┐ │                                          │
│                    │ │   EK    │ │  ← EK protocol                           │
│                    │ │Protocol │ │                                          │
│                    │ └─────────┘ │                                          │
│                    │ ┌─────────┐ │                                          │
│                    │ │ Battery │ │  ← Virtual BMS                           │
│                    │ │ Virtual │ │                                          │
│                    │ └─────────┘ │                                          │
│                    └─────────────┘                                          │
│                                                                              │
│   Functions:                                                                 │
│   • OEM CAN protocol parsing (Solaris, BYD, etc.)                           │
│   • Battery state translation to EK format                                  │
│   • Swap station coordination                                               │
│   • Fleet management integration                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Supported OEM Protocols

| Manufacturer | Protocol | Adapter Support |
|--------------|----------|-----------------|
| Solaris | Proprietary CAN | Full |
| BYD | Proprietary CAN | Full |
| Yutong | GB/T 27930 | Full |
| VDL | Proprietary CAN | Partial |
| Mercedes eCitaro | Proprietary | Planned |
| Volvo | Proprietary | Planned |

### 3.6 JEZGRO-GW Configuration

```c
// EK-ADAPT-BUS service configuration
#define JEZGRO_ENABLE_OEM_PROTOCOL   1  // OEM CAN parser
#define JEZGRO_ENABLE_VIRTUAL_BMS    1  // Battery translation
#define JEZGRO_ENABLE_CAN_HANDLER    1  // Dual CAN (OEM + EK)
#define JEZGRO_ENABLE_SWAP_COORD     1  // Swap station interface
#define JEZGRO_ENABLE_AUDIT_LOGGER   1  // Event logging
```

---

## 4. EK-ADAPT-CCS

### 4.1 Purpose

Bridges standard CCS Combo chargers and vehicles to the EK ecosystem, enabling any CCS-capable vehicle to use EK charging infrastructure.

### 4.2 Use Cases

1. **Universal Charging**: Any CCS EV at EK stations
2. **Protocol Translation**: CCS ↔ EK native protocol
3. **Grid Services**: Enable CCS vehicles for V2G (where supported)

### 4.3 Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| Vehicle interface | CCS Combo 2 | Standard inlet |
| Charger interface | EK3 modules via CAN-FD | Up to 150 kW |
| Power range | 50-150 kW | DC fast charging |
| Protocol support | ISO 15118-2, DIN SPEC 70121 | Full PnC |
| MCU | STM32H743 | Full ISO 15118 stack |
| Dimensions | 400 × 300 × 150 mm | Pedestal mount |
| IP rating | IP55 | Outdoor |

### 4.4 Block Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EK-ADAPT-CCS BLOCK DIAGRAM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   VEHICLE                    EK-ADAPT-CCS                 EK3 RACK          │
│                                                                              │
│   ┌─────────┐              ┌─────────────────┐          ┌─────────┐         │
│   │  CCS2   │              │                 │          │  EK3    │         │
│   │ Inlet   │◄────────────►│  Relay Board    │          │ Modules │         │
│   │         │    DC        │  (Contactors)   │          │         │         │
│   └────┬────┘              └────────┬────────┘          └────┬────┘         │
│        │                            │                        │              │
│        │                            │ DC Bus (650V)          │              │
│        │                     ═══════╪════════════════════════╪═══════       │
│        │                            │                        │              │
│   ┌────▼────┐              ┌────────▼────────┐          ┌────▼────┐         │
│   │  Pilot  │              │   Power Stage   │          │ CAN-FD  │         │
│   │  PWM    │              │   (Precharge)   │          │ Bus     │         │
│   └────┬────┘              └────────┬────────┘          └────┬────┘         │
│        │                            │                        │              │
│   ┌────▼────┐                       │                        │              │
│   │  PLC    │              ┌────────▼────────────────────────▼────┐         │
│   │ Modem   │              │            STM32H743                  │         │
│   │(HomePlug)│◄───────────►│            JEZGRO-GW                 │         │
│   └─────────┘              │                                      │         │
│                            │  ┌─────────┐  ┌─────────┐  ┌───────┐│         │
│                            │  │ISO15118 │  │ Module  │  │Safety ││         │
│                            │  │ Stack   │  │ Control │  │Monitor││         │
│                            │  └─────────┘  └─────────┘  └───────┘│         │
│                            └──────────────────────────────────────┘         │
│                                                                              │
│   Functions:                                                                 │
│   • Full CCS Combo 2 charging protocol                                      │
│   • ISO 15118 SLAC + V2G messaging                                          │
│   • EK3 module coordination                                                 │
│   • Power path control (precharge, contactors)                              │
│   • Metering and billing integration                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.5 Safety Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EK-ADAPT-CCS SAFETY LAYERS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Layer 1: HARDWARE                                                         │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ • Contactor interlock (HW chain)                                    │   │
│   │ • Ground fault detection (RCD)                                      │   │
│   │ • Over-current protection (fuse + breaker)                          │   │
│   │ • Pilot signal monitoring (independent comparator)                  │   │
│   │ • Proximity detection (PP pin)                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   Layer 2: FIRMWARE (JEZGRO services)                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ • State machine validation                                          │   │
│   │ • Timeout monitoring (per IEC 61851)                                │   │
│   │ • Isolation test before energizing                                  │   │
│   │ • Current/voltage limit enforcement                                 │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   Layer 3: PROTOCOL (ISO 15118)                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ • Session validation                                                │   │
│   │ • Parameter negotiation                                             │   │
│   │ • Emergency stop handling                                           │   │
│   │ • Weld detection                                                    │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.6 JEZGRO-GW Configuration

```c
// EK-ADAPT-CCS service configuration
#define JEZGRO_ENABLE_PLL_SYNC       0  // No AC grid (DC charger)
#define JEZGRO_ENABLE_ISO15118       1  // Full V2G stack
#define JEZGRO_ENABLE_SLAC           1  // PLC communication
#define JEZGRO_ENABLE_POWER_PATH     1  // Contactor control
#define JEZGRO_ENABLE_MODULE_CTRL    1  // EK3 coordination
#define JEZGRO_ENABLE_METERING       1  // Energy measurement
#define JEZGRO_ENABLE_CAN_HANDLER    1  // EK integration
#define JEZGRO_ENABLE_AUDIT_LOGGER   1  // Event logging
```

---

## 5. EK-ADAPT-MCS

### 5.1 Purpose

Enables Megawatt Charging System (MCS) capability for heavy-duty trucks and buses, supporting charging rates up to 3 MW.

### 5.2 Use Cases

1. **Highway Trucks**: Long-haul electric trucks requiring fast charging
2. **Electric Buses**: High-power depot charging for bus fleets
3. **Heavy Equipment**: Mining trucks, port equipment

### 5.3 Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| Connector | MCS (CharIN) | 3 MW rated |
| Power range | 350 kW - 3 MW | Scalable |
| Voltage | 800-1500V DC | MCS standard |
| Current | Up to 3000A | Liquid-cooled cable |
| Protocol | ISO 15118-20 + CharIN MCS | Full BPT |
| MCU | STM32H743 | JEZGRO-GW |
| Dimensions | 600 × 400 × 200 mm | Ground mount |
| IP rating | IP55 | Outdoor |
| Cooling | Liquid + forced air | High power |

### 5.4 Block Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EK-ADAPT-MCS BLOCK DIAGRAM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   TRUCK                      EK-ADAPT-MCS               EK3 RACKS (x4)      │
│                                                                              │
│   ┌─────────┐              ┌─────────────────┐         ┌─────────────┐      │
│   │   MCS   │              │  High-Power     │         │ 277 kW × 4  │      │
│   │ Inlet   │◄────────────►│  Contactor      │◄───────►│ = 1.1 MW    │      │
│   │         │    3000A     │  Assembly       │         │             │      │
│   └────┬────┘   (cooled)   └────────┬────────┘         └──────┬──────┘      │
│        │                            │                         │             │
│        │                            │ DC Bus (1500V max)      │             │
│        │                     ═══════╪═════════════════════════╪═══════      │
│        │                            │                         │             │
│   ┌────▼────┐              ┌────────▼────────┐         ┌──────▼──────┐      │
│   │ Pilot   │              │ Power Manage-   │         │ Rack        │      │
│   │  + PP   │              │ ment Unit       │         │ Controllers │      │
│   └────┬────┘              │ (Sequencing)    │         └──────┬──────┘      │
│        │                   └────────┬────────┘                │             │
│   ┌────▼────┐                       │                         │             │
│   │  PLC    │              ┌────────▼─────────────────────────▼────┐        │
│   │ Modem   │◄────────────►│            STM32H743                   │        │
│   │(HomePlug)│              │            JEZGRO-GW                  │        │
│   └─────────┘              │                                       │        │
│                            │  ┌─────────┐  ┌─────────┐  ┌────────┐│        │
│                            │  │ MCS     │  │ Power   │  │Thermal ││        │
│                            │  │ Protocol│  │ Balance │  │ Mgmt   ││        │
│                            │  └─────────┘  └─────────┘  └────────┘│        │
│                            └───────────────────────────────────────┘        │
│                                                                              │
│   Key Features:                                                              │
│   • Multi-rack coordination for MW-scale power                              │
│   • Liquid cooling management (cable + electronics)                         │
│   • CharIN MCS protocol compliance                                          │
│   • Grid connection coordination (demand management)                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.5 Scaling Configuration

| Configuration | Racks | EK3 Modules | Total Power |
|---------------|-------|-------------|-------------|
| MCS-350 | 2 | 106 | 350 kW |
| MCS-750 | 3 | 227 | 750 kW |
| MCS-1000 | 4 | 303 | 1 MW |
| MCS-1500 | 6 | 454 | 1.5 MW |
| MCS-3000 | 12 | 909 | 3 MW |

### 5.6 JEZGRO-GW Configuration

```c
// EK-ADAPT-MCS service configuration
#define JEZGRO_ENABLE_ISO15118       1  // V2G stack
#define JEZGRO_ENABLE_SLAC           1  // PLC communication
#define JEZGRO_ENABLE_MCS_PROTOCOL   1  // CharIN MCS extensions
#define JEZGRO_ENABLE_MULTI_RACK     1  // Rack coordination
#define JEZGRO_ENABLE_THERMAL_MGR    1  // Cooling system
#define JEZGRO_ENABLE_POWER_BALANCE  1  // MW-scale balancing
#define JEZGRO_ENABLE_CAN_HANDLER    1  // EK integration
#define JEZGRO_ENABLE_AUDIT_LOGGER   1  // Event logging
```

---

## 6. EK-ADAPT-OCPP

### 6.1 Purpose

Integrates third-party charging stations into the ELEKTROKOMBINACIJA ecosystem via OCPP protocol, enabling unified fleet management.

### 6.2 Use Cases

1. **CPO Integration**: Manage third-party chargers alongside EK stations
2. **Roaming**: Enable EK fleet access to non-EK chargers
3. **Legacy Upgrade**: Add smart features to existing chargers

### 6.3 Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| OCPP support | 1.6J, 2.0.1 | Full profiles |
| Connectivity | Ethernet, 4G/LTE | Dual path |
| Charger interface | RS485, Modbus, CAN | Multiple options |
| MCU | STM32G474 | Simpler requirements |
| Dimensions | 150 × 100 × 50 mm | DIN rail |
| IP rating | IP20 | Indoor enclosure |

### 6.4 Block Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EK-ADAPT-OCPP BLOCK DIAGRAM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   CLOUD                      EK-ADAPT-OCPP              THIRD-PARTY CHARGER │
│                                                                              │
│   ┌─────────┐              ┌─────────────────┐         ┌─────────────┐      │
│   │ EK      │              │                 │         │ Charger     │      │
│   │ Fleet   │              │    Ethernet     │         │ Controller  │      │
│   │ Backend │◄────────────►│    + 4G/LTE     │         │             │      │
│   └─────────┘   OCPP 2.0   └────────┬────────┘         └──────┬──────┘      │
│                                     │                         │             │
│   ┌─────────┐                       │                         │             │
│   │ OCPP    │                       │                  ┌──────▼──────┐      │
│   │ Central │              ┌────────▼────────┐         │   RS485 /   │      │
│   │ System  │              │   STM32G474     │         │   Modbus /  │      │
│   └────┬────┘              │   JEZGRO-GW     │◄───────►│   CAN       │      │
│        │                   │                 │         └─────────────┘      │
│        │                   │ ┌─────────────┐ │                              │
│        └──────────────────►│ │ OCPP Client │ │                              │
│              OCPP 2.0      │ │ (to EK)     │ │                              │
│                            │ └─────────────┘ │                              │
│                            │ ┌─────────────┐ │                              │
│                            │ │ OCPP Server │ │  ← Charger-facing            │
│                            │ │ (from chgr) │ │                              │
│                            │ └─────────────┘ │                              │
│                            │ ┌─────────────┐ │                              │
│                            │ │ Protocol    │ │                              │
│                            │ │ Translator  │ │                              │
│                            │ └─────────────┘ │                              │
│                            └─────────────────┘                              │
│                                                                              │
│   Functions:                                                                 │
│   • OCPP ↔ EK protocol translation                                          │
│   • Dual OCPP (client to EK backend, server to charger)                     │
│   • Smart charging profile management                                       │
│   • Metering aggregation and validation                                     │
│   • Local authorization cache                                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.5 OCPP Feature Support

| Feature | OCPP 1.6J | OCPP 2.0.1 |
|---------|-----------|------------|
| Remote Start/Stop | ✓ | ✓ |
| Smart Charging | ✓ | ✓ |
| Local Auth | ✓ | ✓ |
| Firmware Update | ✓ | ✓ |
| Diagnostics | ✓ | ✓ |
| 15118 Certificate | - | ✓ |
| Device Model | - | ✓ |
| V2G (ISO 15118-20) | - | ✓ |

### 6.6 JEZGRO-GW Configuration

```c
// EK-ADAPT-OCPP service configuration
#define JEZGRO_ENABLE_OCPP_CLIENT    1  // To EK backend
#define JEZGRO_ENABLE_OCPP_SERVER    1  // From third-party charger
#define JEZGRO_ENABLE_PROTOCOL_TRANS 1  // Translation layer
#define JEZGRO_ENABLE_LOCAL_AUTH     1  // Offline authorization
#define JEZGRO_ENABLE_ETHERNET       1  // Network stack
#define JEZGRO_ENABLE_CELLULAR       1  // 4G/LTE modem
#define JEZGRO_ENABLE_AUDIT_LOGGER   1  // Event logging
```

---

## 7. Hardware Platform

### 7.1 Common PCB

All adapters share a common controller board:

| Component | Part Number | Notes |
|-----------|-------------|-------|
| MCU | STM32H743VIT6 or STM32G474VET6 | Depending on adapter |
| Flash | W25Q128JV | 16 MB external |
| Ethernet PHY | LAN8742A | 10/100 Mbps |
| CAN transceiver | TJA1443 | CAN-FD capable |
| PLC modem | QCA7005 | HomePlug Green PHY |
| Cellular | Quectel EC25 | 4G/LTE (optional) |
| Power supply | Wide input (9-36V) | Automotive |
| ESD protection | TVS arrays | All I/O |

### 7.2 Enclosure Options

| Model | Size (mm) | IP Rating | Mounting | Application |
|-------|-----------|-----------|----------|-------------|
| EK-ENC-S | 150×100×50 | IP20 | DIN rail | Indoor |
| EK-ENC-M | 200×150×80 | IP40 | Wall/Panel | Vehicle |
| EK-ENC-L | 300×200×100 | IP54 | Wall | Sheltered |
| EK-ENC-XL | 400×300×150 | IP55 | Pedestal | Outdoor |

### 7.3 Connector Standards

| Interface | Connector | Notes |
|-----------|-----------|-------|
| Power input | Phoenix MC 4-pin | 9-36V DC |
| CAN-FD (EK) | Deutsch DT04-4P | IP67 rated |
| CAN (OEM) | OEM-specific | Via harness |
| Ethernet | M12 D-coded | Industrial |
| PLC | Integrated | Via power line |
| USB | Type-C | Maintenance |

---

## 8. Certification Requirements

### 8.1 Per Adapter Type

| Adapter | CE | UL | Vehicle Homolog | Grid Code |
|---------|----|----|-----------------|-----------|
| EK-ADAPT-V2G | ✓ | ✓ | - | EN 50549 |
| EK-ADAPT-BUS | ✓ | - | ECE R100 | - |
| EK-ADAPT-CCS | ✓ | ✓ | - | EN 50549 |
| EK-ADAPT-MCS | ✓ | ✓ | - | EN 50549 |
| EK-ADAPT-OCPP | ✓ | - | - | - |

### 8.2 Protocol Certifications

| Protocol | Testing Body | Adapter |
|----------|--------------|---------|
| ISO 15118-2 | CharIN | V2G, CCS |
| ISO 15118-20 | CharIN | V2G, CCS, MCS |
| OCPP 2.0.1 | OCA | OCPP, V2G |
| CHAdeMO 3.0 | CHAdeMO | V2G |
| CharIN MCS | CharIN | MCS |

---

## 9. Cross-References

| Document | Relationship |
|----------|--------------|
| `tehnika/inzenjersko/en/24-jezgro-gw.md` | Gateway firmware |
| `tehnika/inzenjersko/en/21-jezgro-product-family.md` | JEZGRO variants |
| `tehnika/inzenjersko/en/07-v2g-control.md` | V2G algorithms |
| `tehnika/inzenjersko/en/08-iso15118-bpt.md` | ISO 15118 details |
| `tehnika/inzenjersko/en/SPECIFICATIONS.md` | Master specifications |

---

## Change History

| Date | Version | Description |
|------|---------|-------------|
| 2026-01-04 | 1.0 | Initial EK-ADAPT family specification |
