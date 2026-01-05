# ELEKTROKOMBINACIJA - Technical Concept

## Philosophy: Return to Modularity + AI

### Lesson from the Past: TV Service Example

```
EVOLUTION OF TV SERVICING:
════════════════════════════════════════════════════════════════

1970-1990: MODULAR SYSTEMS          1990-2000s: INTEGRATED SYSTEMS
─────────────────────────────       ─────────────────────────────
TV = chassis + modules              TV = single board + ASIC
Fault? Replace module (30 min)      Fault? Throw away (or expensive)
Module → service for repair         Repair impossible
Technician doesn't need expertise   Expensive equipment needed
Lasts 15-20 years                   Planned obsolescence
```

### Infrastructure ≠ Consumer Electronics

```
EV CHARGER IS NOT A PHONE:
• Replacement cost: €20,000+, not €500
• Downtime: Lost revenue every hour
• Location: On highway, not in store
• Expected life: 15 years, not 2 years

CONCLUSION: For infrastructure, MODULARITY is the right architecture.
```

### ELEKTROKOMBINACIJA = 1970s Modularity + 2020s AI

```
OLD                                NEW
────────────────────────────────────────────────────────────
Technician swaps module (30 min) → Robot swaps module (60 sec)
On-site diagnostics            →   AI predicts fault 2 weeks ahead
Module to service for repair   →   Module to hub for refurbishment
Experienced technician needed  →   Technician not needed
```

---

## Additional Philosophy: AI-Powered

```
TRADITIONAL APPROACH               ELEKTROKOMBINACIJA
─────────────────────────────────────────────────────────────────
"Simpler is better"          →    "AI manages complexity"
"IGBT because cheaper"       →    "SiC because more efficient"
"Air cooling because easier" →    "Liquid because denser"
"2-level because known"      →    "3-level for better THD"
"Reactive alarms"            →    "Predictive diagnostics"
"Independent modules"        →    "Swarm intelligence"
```

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ELEKTROKOMBINACIJA ECOSYSTEM                          │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         CLOUD LAYER                                  │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │   Digital    │  │  Predictive  │  │    Fleet     │              │   │
│  │  │    Twins     │  │  Analytics   │  │  Management  │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                              4G/5G/Fiber                                    │
│                                    │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       EDGE AI LAYER                                  │   │
│  │                                                                      │   │
│  │              ┌─────────────────────────────────┐                    │   │
│  │              │      MASTER CONTROLLER          │                    │   │
│  │              │                                 │                    │   │
│  │              │  • Swarm Coordinator            │                    │   │
│  │              │  • V2G/Grid Services            │                    │   │
│  │              │  • ISO 15118-20 Stack           │                    │   │
│  │              │  • Local AI Inference           │                    │   │
│  │              └─────────────────────────────────┘                    │   │
│  │                              │                                      │   │
│  │                         CAN-FD Bus                                  │   │
│  │                              │                                      │   │
│  └──────────────────────────────┼──────────────────────────────────────┘   │
│                                 │                                          │
│  ┌──────────────────────────────┼──────────────────────────────────────┐   │
│  │                       POWER LAYER                                    │   │
│  │                                                                      │   │
│  │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │   │
│  │   │  EK30   │  │  EK30   │  │  EK30   │  │  EK30   │  │  EK30   │  │   │
│  │   │ Module  │  │ Module  │  │ Module  │  │ Module  │  │ Module  │  │   │
│  │   │         │  │         │  │         │  │         │  │         │  │   │
│  │   │ 30 kW   │  │ 30 kW   │  │ 30 kW   │  │ 30 kW   │  │ 30 kW   │  │   │
│  │   │ SiC     │  │ SiC     │  │ SiC     │  │ SiC     │  │ SiC     │  │   │
│  │   │ 3-level │  │ 3-level │  │ 3-level │  │ 3-level │  │ 3-level │  │   │
│  │   │ AI Edge │  │ AI Edge │  │ AI Edge │  │ AI Edge │  │ AI Edge │  │   │
│  │   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  │   │
│  │        │            │            │            │            │        │   │
│  │        └────────────┴────────────┼────────────┴────────────┘        │   │
│  │                                  │                                  │   │
│  │                           DC BUS (parallel)                         │   │
│  │                                  │                                  │   │
│  └──────────────────────────────────┼──────────────────────────────────┘   │
│                                     │                                      │
│                              ┌──────┴──────┐                               │
│                              │   VEHICLE   │                               │
│                              │   CCS2/MCS  │                               │
│                              └─────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Modules

### EK3 - Universal Module (3.3 kW)
```
Purpose: One module for ALL applications - from 3kW to 3MW
─────────────────────────────────────────────────
• SiC MOSFET 900V (Wolfspeed C3M0065090D)
• LLC resonant topology (DC/DC)
• CAN-FD communication @ 5 Mbps
• AI self-tuning control
• Digital twin embedded
• Dimensions: 200 × 320 × 44 mm (1U half-width)
• Weight: ~3.5 kg
• Efficiency: >96% peak, >94% @ 50% load
```

### EK30 - Production (30 kW)
```
Purpose: Scaled version for commercial applications
─────────────────────────────────────────────────
• SiC MOSFET (1200V, 100A class)
• 3-level NPC topology
• Liquid cooling
• V2G bidirectional
• Swarm-ready
• Dimensions: ~400 × 300 × 150 mm
• Weight: ~12 kg
```

## Documents in This Folder

1. **01-power-electronics.md** - SiC MOSFET selection, 3-level NPC topology, LLC resonant converter, gate driver design, EMI/EMC, protection, power stage BOM
2. **02-ai-ml-sistem.md** - Edge AI hardware (STM32N6 NPU), digital twin architecture, predictive maintenance, self-tuning control, anomaly detection, fleet learning
3. **03-thermal-management.md** - Liquid cooling system, coldplate design, junction temperature estimation, AI thermal control, safety features
4. **04-v2g-grid.md** - ISO 15118-20 implementation, bidirectional topology, grid services (frequency/voltage regulation), grid codes compliance
5. **05-ROJ-intelligence.md** - Distributed architecture, CAN-FD communication, load balancing algorithms, fault tolerance, scalability
6. **06-bom-cost.md** - Complete BOM for EK3 and EK30, cost breakdown, pricing strategy, TCO analysis, R&D investment
7. **07-konkurencija.md** - Competition analysis, reliability crisis in industry (2025 data), competitive advantage
8. **08-swap-station.md** - Robotic EK module swap + battery swap for buses, fleet-integrated maintenance, patentable concept
9. **09-ek3-rack-sistem.md** - **KEY INNOVATION**: One module (EK3) for ALL - from 3kW to 3MW, rack system, robot swap, radical modularity, **3PAR storage inspiration** (chunklets, wide striping, distributed sparing)

## Key Innovations

### 1. Every Module is Smart
```
Traditional: "Dumb" power module + central controller
ELEKTROKOMBINACIJA: Every module has AI edge processor

Benefits:
• Distributed intelligence
• No single point of failure
• Self-healing system
• Plug & play module addition
```

### 2. Digital Twin for Every Module
```
Every physical module has a virtual copy in the cloud:
• Real-time state synchronization
• "What-if" scenario simulation
• Predictive maintenance
• Remote diagnostics
```

### 3. Swarm Intelligence
```
Modules communicate peer-to-peer:
• Autonomous load redistribution
• Collective efficiency optimization
• Fault tolerance without central arbiter
• Emergent behavior for grid services
```

### 4. V2G Native
```
Not an add-on, but a core feature:
• Bidirectional topology from the start
• ISO 15118-20 Plug & Charge
• Grid frequency support
• Demand response ready
```

### 5. Robotic Swap Station
```
Combination of battery swap for buses + module swap for chargers:

BUS ARRIVES → Robot swaps bus battery
           → Simultaneously robot swaps EK module if needed
           → AI predicted the swap in advance
           → Zero downtime, zero truck rolls
```

### 6. ONE MODULE FOR ALL (RADICAL MODULARITY!)
```
TRADITIONAL:                      ELEKTROKOMBINACIJA:
─────────────────────────────────────────────────────────────
Small charger = small module      Small charger = 1 × EK3
Medium = medium module            Medium = 10 × EK3
Large = large module              Large = 100 × EK3
MCS = huge module                 MCS = 1000 × EK3

4+ different designs              ONE design for ALL

BENEFITS:
• Mass production = low cost
• 1 fault = 0.3% loss (not 10%)
• One type of spare part
• Robot swaps in 40 seconds
• Graceful degradation - never "down"
```

### 7. 3PAR Storage Inspiration
```
Same principles that revolutionized the storage industry:

STORAGE (3PAR)                    POWER (EK3)
─────────────────────────────────────────────────────────────
Chunklets (1GB blocks)       →    EK3 (3kW modules)
Wide striping (all disks)    →    Load across ALL modules
Distributed sparing          →    No hot-spare, reserve distributed
Thin provisioning            →    Sleep mode for inactive modules
Mesh-active controllers      →    Swarm intelligence

HP bought 3PAR for $2.35B (2010) - PROVEN CONCEPT!
```

### 8. Extended Modularity: Vehicle Batteries (EK-BAT)
```
The same radical modularity applies to VEHICLE BATTERIES:

CHARGER MODULARITY                 BATTERY MODULARITY
─────────────────────────────────────────────────────────────
EK3 (3kW) charger modules     →    EK-BAT vehicle battery modules
Robot swaps charger modules   →    Robot swaps vehicle batteries
Distributed sparing           →    Shared battery pool
Swarm intelligence            →    BMS ROJ coordination

RESULT: ONE ECOSYSTEM FOR BOTH INFRASTRUCTURE AND VEHICLES
```

**EK-BAT Module Family:**

| Module | Capacity | Weight | Vehicles |
|--------|----------|--------|----------|
| EK-BAT-25 | 25 kWh | 150 kg | Vans, small trucks |
| EK-BAT-50 | 50 kWh | 300 kg | Buses, medium trucks |
| EK-BAT-100 | 100 kWh | 600 kg | Heavy buses, long-haul trucks |

**Key Benefits:**
- Weight savings: 1,800-2,700 kg freed for payload
- 5-minute swap vs 2-hour charging
- 37× more energy per kg of battery material (shallow cycling)
- Same swap station handles batteries AND charger modules

### 9. From Charging to Swapping
```
PARADIGM SHIFT FOR HEAVY VEHICLES:

TRADITIONAL                        ELEKTROKOMBINACIJA
─────────────────────────────────────────────────────────────
Large 400kWh battery          →    Small 100kWh battery
2-hour charging               →    5-minute swap
Vehicle downtime: hours       →    Vehicle downtime: minutes
Heavy battery = less cargo    →    Light battery = more cargo
Single deep cycle/day         →    Multiple shallow cycles
Depot charging (10 MW peak)   →    Distributed swap (250 kW smooth)
```

**Vehicle-Specific Battery Sizing:**

| Vehicle | Traditional | Small + Swap | Weight Saved | Swap Frequency |
|---------|-------------|--------------|--------------|----------------|
| City Bus | 400 kWh | 100 kWh | 1,800 kg | Every 100 km |
| Regional Bus | 500 kWh | 150 kWh | 2,100 kg | Every 150 km |
| Delivery Van | 150 kWh | 50 kWh | 600 kg | 2-3× daily |
| Long-haul Truck | 600 kWh | 150 kWh × 4 | 2,700 kg | Every 200 km |

See **04-small-battery-philosophy.md** for detailed analysis.

## Target Specifications

| Parameter | EK3 | EK30 (reference) |
|-----------|-----|------------------|
| Power | 3.3 kW (3.6 kW peak) | 30 kW |
| Efficiency | >96% peak, >94% @ 50% | >97% |
| Current THD | <3% | <2% |
| Power factor | >0.99 | >0.995 |
| Output voltage | 50-500V DC | 200-1000V DC |
| V2G | Yes | Yes |
| SiC MOSFET | 900V (Wolfspeed) | 1200V |
| MCU | STM32G474 (Cortex-M4) | ARM Cortex-A + NPU |
| Communication | CAN-FD @ 5 Mbps | CAN-FD @ 5 Mbps |
| Cooling | Forced air (shared plenum) | Liquid |
| Dimensions | 200×320×44 mm | ~400×300×150 mm |
| Weight | ~3.5 kg | ~12 kg |
| MTBF | >100,000h | >150,000h |
