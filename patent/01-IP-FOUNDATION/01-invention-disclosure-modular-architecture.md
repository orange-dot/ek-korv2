# Invention Disclosure: Unified Modular Power Architecture

## Administrative Information

| Field | Value |
|-------|-------|
| Disclosure ID | EK-2026-001 |
| Date of Disclosure | 2026-01-02 |
| Inventor(s) | Bojan Janjatović |
| Email | bojan.janjatovic@gmail.com |
| Address | Vojislava Ilica 8, Kikinda, Severni Banat, Serbia |
| Date of Conception | 2026-01-02 |
| Witnesses | Marija Janjatović |

### Origin of Invention
Inspiracija: Razgovor sa prijateljem o problemima punjenja autobusa u Srbiji (depot sistem). Neko je pokušao da kopira ABB uređaj - uočen problem sa maintenance i reliability postojećih rešenja.

---

## 1. Title of Invention

**Unified Modular Power Architecture for Scalable EV Charging Systems Using Standardized Hot-Swappable Power Modules**

Alternative titles:
- Blade-Format Power Module System for EV Charging Infrastructure
- Granular Modular DC Fast Charging System with Robotic Serviceability

---

## 2. Technical Field

```
□ Power Electronics
□ Electric Vehicle Charging Infrastructure
□ Modular System Design
□ Robotics/Automation
□ Predictive Maintenance
```

---

## 3. Problem Statement

### 3.1 Current State of the Art

```
Današnji EV punjači koriste jedan od dva pristupa:

PRISTUP A: Monolitni dizajn
• Ceo power stage u jednom kućištu
• Kvar = kompletan punjač van funkcije
• Popravka zahteva tehničara na licu mesta
• Tipičan downtime: 2-14 dana

PRISTUP B: Grubi moduli (10-50 kW po modulu)
• 3-10 modula po punjaču
• Kvar jednog = 10-33% gubitak kapaciteta
• Moduli su teški (10-30 kg), ručna zamena
• Različiti moduli za različite snage punjača
```

### 3.2 Problems with Current Approaches

```
1. RELIABILITY CLIFF
   • J.D. Power 2025: 84% success rate
   • ChargerHelp 2025: 71% first-time success
   • 15 point degradation after 3 years

2. MAINTENANCE COMPLEXITY
   • Truck roll za svaku popravku: €200-500
   • Tehničar mora biti specijalizovan
   • Prosečno vreme popravke: 3-5 dana

3. INVENTORY NIGHTMARE
   • Različiti moduli za svaku snagu punjača
   • Mnogo SKU-ova za održavanje
   • Spare parts traženje = downtime

4. GRACEFUL DEGRADATION - NONEXISTENT
   • 1 od 5 modula otkaže = 20% pad
   • Sistem često potpuno pada umesto degradacije
```

---

## 4. Summary of Invention

### 4.1 Core Concept

```
JEDAN STANDARDNI MODUL (EK3, 3 kW) ZA SVE PRIMENE:

• E-bike punjač: 1 modul
• Kućni punjač: 3-7 modula
• DC Fast 50 kW: 17 modula
• Highway 350 kW: 117 modula
• Bus depot 1 MW: 334 modula
• MCS 3 MW: 1000 modula

ISTI MODUL, RAZLIČITA KOLIČINA
```

### 4.2 Key Innovation Elements

```
ELEMENT 1: Extreme Granularity
─────────────────────────────────────────────────────────────
• 3 kW je najmanja praktična jedinica
• Omogućava 0.3% granularnost za 1 MW sistem
• Kvar jednog = zanemarljiv uticaj

ELEMENT 2: Blade Server Form Factor
─────────────────────────────────────────────────────────────
• 1U visina (44.45 mm) za standardni 19" rack
• Blind-mate konektori (ne treba vizuelni kontakt)
• Robot-compatible grip points
• Hot-swap bez prekida rada sistema

ELEMENT 3: Distributed Intelligence
─────────────────────────────────────────────────────────────
• Svaki modul ima lokalni AI processor
• Moduli komuniciraju peer-to-peer (ROJ)
• Nema single point of failure u kontroli
• Plug & play - modul se sam konfiguriše

ELEMENT 4: 3PAR-Inspired Load Distribution
─────────────────────────────────────────────────────────────
• Wide striping: load preko SVIH modula
• Distributed sparing: nema hot-spare, rezerva u svakom
• Thin provisioning: neaktivni moduli u sleep mode
• Ravnomerno starenje svih modula
```

---

## 5. Detailed Description

### 5.1 Physical Module Design

```
EK3 MODULE SPECIFICATIONS:
═══════════════════════════════════════════════════════════════

Dimensions:
• Width: 100 mm (4 modules per 19" row)
• Depth: 300 mm
• Height: 44.45 mm (1U)
• Mass: 1.8 kg (enables robotic handling)

Power:
• Input: 400V DC (from central PFC)
• Output: 50-500V DC (vehicle compatible)
• Power: 3 kW continuous, 3.3 kW peak
• Efficiency: >97%

Thermal:
• Cooling: Integrated fan + vapor chamber
• Max ambient: 50°C
• Derating: None up to 45°C

Connectors (rear panel):
• Power: Anderson SBS50 or equivalent (blind-mate)
• Data: 48-pin blade connector
  - CAN-FD (primary communication)
  - Ethernet (diagnostics, firmware update)
  - I2C (sensor bus)
  - PWM sync (interleaving coordination)

Mechanical features:
• Rail guides for rack insertion
• Robot grip points (2× M6 threaded, top surface)
• Cam lock for secure retention
• LED status indicator (RGB)
```

### 5.2 Rack System Design

```
STANDARD RACK CONFIGURATION:
═══════════════════════════════════════════════════════════════

Rack type: Standard 19" server rack, 42U height

Layout:
• U1-U3: DC bus distribution, protection, fusing
• U4-U6: Backplane controller, CAN-FD hub, AI edge
• U7-U42: Power modules (36U × 4 wide = 144 slots)
         Practical fill: 84 modules (21 rows × 4)

Per rack capacity: 84 × 3 kW = 252 kW

Backplane features:
• DC power distribution (800V bus)
• Data networking (star topology CAN-FD)
• Module presence detection
• Temperature monitoring per slot
• Sequential power-up control
```

### 5.3 Scaling Architecture

```
CONFIGURATION EXAMPLES:
═══════════════════════════════════════════════════════════════

HOME CHARGER (22 kW):
• 8 modules in desktop enclosure
• No rack needed
• Same module as MW station

DC FAST (150 kW):
• 50 modules
• 1 standard rack
• Robot-ready but manual swap OK

HIGHWAY STATION (350 kW):
• 117 modules
• 2 racks side-by-side
• Robot swap recommended

BUS DEPOT (1 MW):
• 334 modules
• 4 racks
• Robot swap required
• Integrated with battery swap

MCS STATION (3 MW):
• 1000 modules
• 12 racks
• 2 robots on rails
• Graceful degradation to 2.7 MW with 10% failure
```

### 5.4 Robot Swap System

```
ROBOT SPECIFICATIONS:
═══════════════════════════════════════════════════════════════

Type: Custom-designed robot system (NOT off-the-shelf UR/KUKA)
Design: Purpose-built for EV charging maintenance
See also: EK-2026-005 (Coordinated Dual-Robot System)

Requirements:
• Payload: ≥10 kg (module 1.8 kg + gripper)
• Reach: ≥1.3 m
• Repeatability: ≤0.1 mm
• Speed: Up to 1 m/s (safety limited)

Gripper:
• Custom end effector
• Engages M6 grip points on module
• Force sensing for insertion
• Position verification

SWAP SEQUENCE (40 seconds total):
═══════════════════════════════════════════════════════════════

T+0s:   Command received (module ID, location)
T+2s:   Robot path planning
T+5s:   Robot positions at target slot
T+8s:   Gripper engages module grip points
T+10s:  Cam lock release, module extraction begins
T+15s:  Module fully extracted (300mm travel)
T+18s:  Robot rotates to "out" bin
T+20s:  Module deposited in defective bin
T+24s:  Robot moves to fresh module storage
T+27s:  Robot grips fresh module
T+30s:  Robot returns to target slot
T+34s:  Module insertion begins
T+38s:  Cam lock engagement
T+39s:  Backplane handshake - module ONLINE
T+40s:  Robot returns to home position
```

---

## 6. Advantages Over Prior Art

```
ADVANTAGE 1: Extreme Reliability
─────────────────────────────────────────────────────────────
Prior art: 1 of 5 modules fails = 20% capacity loss
This invention: 1 of 334 modules fails = 0.3% capacity loss
Improvement: 67× better granularity

ADVANTAGE 2: Robotic Serviceability
─────────────────────────────────────────────────────────────
Prior art: Manual swap, heavy modules, technician required
This invention: 40-second robot swap, 1.8 kg modules
Improvement: From days to seconds, no human needed

ADVANTAGE 3: Universal Module
─────────────────────────────────────────────────────────────
Prior art: Different module for each power class
This invention: Same module from 3 kW to 3 MW
Improvement: Single SKU for all inventory

ADVANTAGE 4: Distributed Sparing
─────────────────────────────────────────────────────────────
Prior art: Dedicated hot-spare modules sitting idle
This invention: Spare capacity distributed across all modules
Improvement: Better utilization, continuous testing

ADVANTAGE 5: Mass Production Economics
─────────────────────────────────────────────────────────────
Prior art: Low volume of each module type
This invention: Single design, millions of units
Improvement: 35%+ cost reduction at scale
```

---

## 7. Known Prior Art

```
RELATED PATENTS TO INVESTIGATE:
═══════════════════════════════════════════════════════════════

1. Blade server patents (IBM, HP, Dell)
   - Mechanical form factor
   - BUT: Not for power electronics

2. 3PAR storage patents (HP)
   - Chunklet architecture
   - BUT: For data storage, not power

3. Tesla Supercharger patents
   - Modular approach
   - BUT: Larger modules, not robot-ready

4. ABB modular charger patents
   - Hot-swap concept
   - BUT: 25-50 kW modules, not 3 kW

5. Battery swap patents (NIO, Aulton)
   - Robotic swap
   - BUT: For batteries, not charger modules

DIFFERENTIATION:
─────────────────────────────────────────────────────────────
Our combination of:
• Extreme granularity (3 kW)
• Blade server form factor
• Robot-ready design
• 3PAR-inspired load distribution
• Integrated with battery swap station

...appears to be NOVEL
```

---

## 8. Potential Claims (Draft)

```
INDEPENDENT CLAIM 1 (System):
A modular electric vehicle charging system comprising:
• A plurality of identical power modules, each having a rated
  power output between 1 kW and 5 kW;
• A rack-mounted housing configured to receive said plurality
  of power modules in hot-swappable configuration;
• A backplane providing power and data connectivity to each
  module position;
• Wherein the system is scalable from 3 kW to 3 MW by varying
  the number of said identical power modules.

INDEPENDENT CLAIM 2 (Method):
A method for maintaining an electric vehicle charging system
comprising:
• Detecting degradation in a first power module using
  predictive analytics;
• Scheduling replacement of said first power module during
  a planned vehicle charging session;
• Robotically extracting said first power module without
  interrupting charging operations;
• Robotically inserting a replacement power module;
• Wherein total replacement time is less than 120 seconds.

DEPENDENT CLAIMS:
• ...wherein each module weighs less than 3 kg
• ...wherein modules communicate via CAN-FD in peer-to-peer
  configuration
• ...wherein spare capacity is distributed across all active
  modules rather than dedicated spare modules
• ...wherein the robotic system is integrated with a battery
  swap station for electric buses
```

---

## 9. Development Status

```
□ Concept only (current)
□ Proof of concept built
□ Prototype tested
□ Pilot production
□ Commercial production
```

---

## 10. Commercial Potential

```
MARKET SIZE:
• Global EV charging market: $50B by 2030
• DC fast charging segment: $20B
• Addressable with this technology: $5-10B

COMPETITIVE ADVANTAGE:
• Only modular system with 3 kW granularity
• Only system designed for robotic swap
• 35% lower cost at scale
• 99.9% uptime vs industry 95%

POTENTIAL LICENSEES:
• Major charger OEMs (ABB, Siemens, Tritium)
• Fleet operators (bus companies, logistics)
• Utilities building charging infrastructure
```

---

## 11. Signatures

```
INVENTOR(S):

Name: _________________________
Signature: ____________________
Date: ________________________


WITNESS (non-inventor who understands the disclosure):

Name: _________________________
Signature: ____________________
Date: ________________________
```

---

## Notes for Patent Attorney

```
KEY POINTS TO EMPHASIZE:
1. Granularity level (3 kW) is novel for EV charging
2. Combination of blade format + robot swap is novel
3. 3PAR concepts applied to power = new technical field
4. Integration with bus fleet for logistics is unique

POTENTIAL CHALLENGES:
1. Prior art in blade servers (but not power)
2. Prior art in modular chargers (but larger modules)
3. Software/AI aspects (focus on technical effect)

RECOMMENDED APPROACH:
1. File broad system claim first
2. File method claim for robot swap
3. Consider separate filing for bus fleet integration
```
