# PATENT FILING STRATEGY: Hibridni Pristup (3 Patenta)

**Datum:** 2026-01-02
**Inventor:** Bojan Janjatović
**Email:** bojan.janjatovic@gmail.com
**Address:** Vojislava Ilica 8, Kikinda, Severni Banat, Serbia
**Status:** DRAFT - Za pregled sa patent advokatom

---

## STRUKTURA PATENT FAMILIJE

```
┌─────────────────────────────────────────────────────────────────┐
│                    ELEKTROKOMBINACIJA                           │
│                    Patent Family                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐                                           │
│  │   PATENT A      │ ◄─── UMBRELLA PATENT                      │
│  │   (Priority)    │      Modular Power Architecture           │
│  │   EK-001/002/003│      + Robotic Swap + Distributed Sparing │
│  └────────┬────────┘                                           │
│           │                                                     │
│           │ cross-reference                                     │
│           │                                                     │
│  ┌────────┴────────┐       ┌─────────────────┐                │
│  │   PATENT B      │       │   PATENT C      │                │
│  │   (Standalone)  │       │   (Standalone)  │                │
│  │   EK-005        │       │   EK-004        │                │
│  │   Dual-Robot    │       │   Fleet         │                │
│  │   System        │       │   Logistics     │                │
│  └─────────────────┘       └─────────────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## PATENT A: Modular Power Architecture (Umbrella)

### Naslov
**"Modular Power Conversion System with Distributed Sparing and Robotic Module Replacement for Electric Vehicle Charging Infrastructure"**

### Obuhvata (Claims scope)
- EK-2026-001: Unified Modular Power Architecture
- EK-2026-002: Dual-Purpose Robotic Swap Station
- EK-2026-003: Distributed Power Sparing System
- EK-2026-006: JEZGRO Microkernel (fault-tolerant firmware)
- EK-2026-007: Decentralized V2G Control System (per-module grid sync, droop control)

### Ključni Claims

**Claim 1 (Independent - Apparatus):**
> A modular electric vehicle charging system comprising:
> - a plurality of standardized power conversion modules, each module having a power output of 1-5 kW;
> - a backplane assembly configured to receive said modules in a blade-server format;
> - blind-mate electrical connectors enabling hot-swap capability;
> - a distributed power management system implementing wide-striping across all active modules;
> - wherein failure of any single module results in less than 1% total system power reduction.

**Claim 2 (Independent - Method):**
> A method for maintaining electric vehicle charging infrastructure comprising:
> - detecting degradation of a power module via continuous monitoring;
> - predicting failure timeframe using machine learning analysis;
> - automatically replacing said module using robotic manipulation;
> - redistributing power load across remaining modules during replacement;
> - wherein replacement is completed without service interruption.

**Claim 3 (Independent - System):**
> A robotic module replacement station comprising:
> - a robotic manipulator capable of extracting and inserting power modules;
> - a module storage system containing replacement modules;
> - an AI-based diagnostic system identifying modules requiring replacement;
> - coordination interface for synchronizing with vehicle-mounted systems.

### GRANICA (Boundary) - Šta PATENT A NE pokriva:
```
╔═══════════════════════════════════════════════════════════════╗
║ EKSPLICITNO ISKLJUČENO IZ PATENT A:                          ║
║                                                               ║
║ 1. Roboti montirani NA vozilu (→ Patent B)                   ║
║ 2. Koordinacija između vozila i stanice (→ Patent B)         ║
║ 3. Transport modula vozilima flote (→ Patent C)              ║
║ 4. Logistika servisnih centara (→ Patent C)                  ║
║                                                               ║
║ Patent A se bavi STACIONARNOM infrastrukturom i              ║
║ robotima FIKSIRANIM na lokaciji punjenja.                    ║
╚═══════════════════════════════════════════════════════════════╝
```

### Cross-Reference Klauzula (u opisu patenta):
> "The system described herein may be utilized in conjunction with
> vehicle-mounted robotic systems as described in co-pending application
> [PATENT B Reference Number], and fleet-integrated logistics systems
> as described in co-pending application [PATENT C Reference Number],
> both filed by the same inventor and incorporated herein by reference."

---

## PATENT B: Coordinated Dual-Robot System (Standalone)

### Naslov
**"Coordinated Multi-Robot System for Self-Healing Electric Vehicle Charging Infrastructure with Vehicle-Mounted and Station-Based Robotic Units"**

### Obuhvata (Claims scope)
- EK-2026-005: Coordinated Dual-Robot System

### Ključni Claims

**Claim 1 (Independent - System):**
> A self-healing charging infrastructure system comprising:
> - a first robotic unit (Robot A) permanently mounted on an electric vehicle;
> - a second robotic unit (Robot B) located at a charging station;
> - a wireless coordination protocol enabling synchronized operation;
> - wherein Robot A performs diagnostic functions and connector manipulation;
> - wherein Robot B performs module replacement and heavy-duty operations;
> - wherein coordinated operation enables autonomous fault resolution without human intervention.

**Claim 2 (Independent - Method):**
> A method for autonomous repair of electric vehicle charging systems comprising:
> - detecting a charging fault via vehicle-mounted diagnostic robot;
> - transmitting fault data to station-based robot via wireless protocol;
> - coordinating simultaneous actions between vehicle and station robots;
> - completing repair operation while vehicle remains at charging position;
> - wherein total repair time is less than 5 minutes.

**Claim 3 (Dependent):**
> The system of Claim 1, wherein Robot A comprises:
> - weight less than 20 kg for vehicle mounting;
> - real-time diagnostic sensors;
> - connector manipulation capability;
> - spare parts storage compartment.

**Claim 4 (Dependent):**
> The system of Claim 1, wherein Robot B comprises:
> - module extraction and insertion capability;
> - battery swap functionality;
> - 24/7 autonomous operation capability.

### GRANICA (Boundary) - Šta PATENT B NE pokriva:
```
╔═══════════════════════════════════════════════════════════════╗
║ EKSPLICITNO ISKLJUČENO IZ PATENT B:                          ║
║                                                               ║
║ 1. Dizajn samih power modula (→ Patent A)                    ║
║ 2. Distributed sparing algoritmi (→ Patent A)                ║
║ 3. Backplane i rack sistem (→ Patent A)                      ║
║ 4. Transport modula između lokacija (→ Patent C)             ║
║ 5. Servisni centar operacije (→ Patent C)                    ║
║                                                               ║
║ Patent B se bavi KOORDINACIJOM DVA ROBOTA i                  ║
║ konceptom SELF-HEALING kroz robotsku saradnju.               ║
╚═══════════════════════════════════════════════════════════════╝
```

### Cross-Reference Klauzula:
> "The robotic units described herein operate on modular power systems
> as described in co-pending application [PATENT A Reference Number].
> Replaced modules may be transported via fleet logistics systems
> as described in co-pending application [PATENT C Reference Number].
> Both applications filed by the same inventor and incorporated by reference."

### Dependency Acknowledgment:
> "The station-based Robot B may utilize module designs and robotic
> manipulation techniques compatible with those described in [PATENT A].
> This patent claims the COORDINATION SYSTEM and VEHICLE-MOUNTED ROBOT
> as novel elements, while acknowledging that station-based module
> replacement mechanisms may be covered under [PATENT A]."

---

## PATENT C: Fleet-Integrated Logistics (Standalone)

### Naslov
**"Fleet-Integrated Maintenance Logistics System for Circular Economy Operation of Electric Vehicle Charging Infrastructure"**

### Obuhvata (Claims scope)
- EK-2026-004: Fleet-Integrated Maintenance Logistics
- EK-2026-008: V2G AI/ML Fleet Optimization (frequency prediction, battery degradation, priority allocation)

### Ključni Claims

**Claim 1 (Independent - Method):**
> A method for maintaining electric vehicle charging infrastructure comprising:
> - identifying a degraded module at a charging station via predictive diagnostics;
> - scheduling module replacement to coincide with regular vehicle fleet operations;
> - transporting replacement module TO charging station via fleet vehicle;
> - transporting removed module FROM charging station via same or subsequent fleet vehicle;
> - delivering removed module to centralized service facility;
> - wherein no dedicated service vehicle dispatch is required.

**Claim 2 (Independent - System):**
> A circular maintenance system for EV charging infrastructure comprising:
> - a network of charging stations with modular, replaceable components;
> - a fleet of electric vehicles serviced by said charging stations;
> - a module inventory management system tracking module locations and status;
> - a logistics optimization system coordinating module transport via fleet vehicles;
> - a centralized repair facility for module refurbishment;
> - wherein modules circulate between stations, vehicles, and repair facility.

**Claim 3 (Dependent):**
> The method of Claim 1, wherein the fleet vehicle is an electric bus
> operating on a regular route that includes the charging station location.

**Claim 4 (Dependent):**
> The system of Claim 2, further comprising:
> - module storage compartments integrated into fleet vehicles;
> - automated module handoff between vehicle and station.

### GRANICA (Boundary) - Šta PATENT C NE pokriva:
```
╔═══════════════════════════════════════════════════════════════╗
║ EKSPLICITNO ISKLJUČENO IZ PATENT C:                          ║
║                                                               ║
║ 1. Dizajn power modula (→ Patent A)                          ║
║ 2. Robotic swap mehanizam (→ Patent A, Patent B)             ║
║ 3. Vehicle-mounted robot (→ Patent B)                        ║
║ 4. Robot koordinacija (→ Patent B)                           ║
║                                                               ║
║ Patent C se bavi LOGISTIKOM i CIRCULAR ECONOMY               ║
║ aspektom - kako moduli PUTUJU kroz sistem.                   ║
╚═══════════════════════════════════════════════════════════════╝
```

### Cross-Reference Klauzula:
> "The modules transported via the logistics system described herein
> are modular power conversion units as described in [PATENT A].
> Module replacement at charging stations may be performed by robotic
> systems as described in [PATENT A] and [PATENT B]. All applications
> filed by the same inventor and incorporated by reference."

---

## ANTI-COLLISION MATRIX

Ova matrica eksplicitno definiše šta svaki patent pokriva:

| Element | Patent A | Patent B | Patent C |
|---------|:--------:|:--------:|:--------:|
| 3kW module design | ✅ | ❌ | ❌ |
| Blind-mate connectors | ✅ | ❌ | ❌ |
| Backplane/rack system | ✅ | ❌ | ❌ |
| Wide striping algorithm | ✅ | ❌ | ❌ |
| Distributed sparing | ✅ | ❌ | ❌ |
| Station-based robot (swap) | ✅ | ⚠️ ref | ❌ |
| AI failure prediction | ✅ | ⚠️ ref | ⚠️ ref |
| **Vehicle-mounted robot** | ❌ | ✅ | ❌ |
| **Robot A + B coordination** | ❌ | ✅ | ❌ |
| **Wireless sync protocol** | ❌ | ✅ | ❌ |
| **Self-healing concept** | ❌ | ✅ | ❌ |
| **Fleet transport of modules** | ❌ | ❌ | ✅ |
| **Zero truck-roll logistics** | ❌ | ❌ | ✅ |
| **Circular economy system** | ❌ | ❌ | ✅ |
| **Service center integration** | ❌ | ❌ | ✅ |
| **Per-module V2G control** | ✅ (EK-007) | ❌ | ❌ |
| **Droop control (P(f), Q(V))** | ✅ (EK-007) | ❌ | ❌ |
| **Hot-swap during V2G** | ✅ (EK-007) | ❌ | ❌ |
| **ISO 15118-20 BPT integration** | ✅ (EK-007) | ❌ | ❌ |
| **Grid frequency ML prediction** | ❌ | ❌ | ✅ (EK-008) |
| **Battery degradation model** | ❌ | ❌ | ✅ (EK-008) |
| **Priority-based fleet V2G** | ❌ | ❌ | ✅ (EK-008) |
| **Edge-deployed ML** | ❌ | ❌ | ✅ (EK-008) |

**Legenda:**
- ✅ = Ovaj patent POKRIVA ovaj element
- ❌ = Ovaj patent NE pokriva ovaj element
- ⚠️ ref = Referencira ali NE CLAIM-uje (incorporated by reference)

---

## COLLISION POINTS I REŠENJA

### Collision Point 1: Station-based Robot

**Problem:** Patent A claim-uje robotic swap station, Patent B claim-uje Robot B at station.

**Rešenje:**
- Patent A: Claim-uje robota kao STANDALONE station-based system
- Patent B: Claim-uje robota KAO DEO KOORDINIRANOG SISTEMA sa Robot A
- Ključna razlika: Patent B zahteva OBA robota u koordinaciji

**Formulacija u Patent B:**
> "The station-based robotic unit (Robot B) of the present invention
> is distinguished from standalone station-based robots by its
> REQUIREMENT for coordination with a vehicle-mounted unit (Robot A).
> Robot B as claimed herein CANNOT operate independently for the
> purposes of this patent - coordination is an essential element."

### Collision Point 2: AI Failure Prediction

**Problem:** Sva tri patenta koriste AI predikciju.

**Rešenje:**
- Patent A: AI za predikciju MODULA (hardware health)
- Patent B: AI za KOORDINACIJU robota (timing, sequencing)
- Patent C: AI za LOGISTICS optimization (routing, scheduling)

**Formulacija (u svakom patentu):**
> "The AI/ML systems referenced herein are specific to [module health /
> robot coordination / logistics optimization] and do not claim general
> AI prediction methods which may be described in related applications."

### Collision Point 3: Module Handling

**Problem:** Svi patenti uključuju nekakvo rukovanje modulima.

**Rešenje:**
- Patent A: FIZIČKI dizajn za hot-swap (connectors, form factor)
- Patent B: ROBOTSKA MANIPULACIJA (grasp, extract, insert)
- Patent C: TRANSPORT između lokacija (storage, delivery)

---

## FILING TIMELINE

```
2026-01-02  ──┬── Priority Date (Git commits, this document)
              │
2026-Q1     ──┼── Provisional Applications (sve tri)
              │   - Jeftino ($320 USPTO / €150 EPO)
              │   - Osigurava priority date
              │   - 12 meseci za full filing
              │
2026-Q2     ──┼── Develop working prototypes
              │   - EK3 module prototype
              │   - Basic robot demonstration
              │
2026-Q3     ──┼── Full Patent Applications
              │   - Patent A first (umbrella)
              │   - Patent B second (references A)
              │   - Patent C third (references A, B)
              │
2027-Q1     ──┼── PCT International Filing
              │   - Extends protection globally
              │   - 30 months from priority date
              │
2028        ──┴── National Phase Entry
                  - Select countries for protection
                  - EU, US, CN, JP, KR minimum
```

---

## LICENSING STRATEGY

### Scenario 1: Licenciraj Sve Zajedno
```
ELEKTROKOMBINACIJA Full License
├── Patent A (Modular Architecture)
├── Patent B (Dual-Robot)
└── Patent C (Fleet Logistics)

Licensee dobija: Kompletnu self-healing infrastrukturu
Royalty: 5-8% na sistem
Target: Large CPOs (ChargePoint, EVgo, Ionity)
```

### Scenario 2: Licenciraj Selektivno
```
Hyundai/Kia ─────► Patent B only (Dual-Robot)
                   Već imaju charging robote, dodaju vehicle-mounted

ABB/Siemens ─────► Patent A only (Modular Architecture)
                   Već prave modularne punjače, poboljšavaju granularnost

Bus Operators ───► Patent C only (Fleet Logistics)
                   Specifično za depot operacije
```

### Scenario 3: Cross-Licensing
```
NIO (ima battery swap IP) ◄──────► ELEKTROKOMBINACIJA

NIO dobija: Patent A (module architecture)
Mi dobijamo: NIO battery swap patents + manufacturing partnership
```

---

## OWNERSHIP & ASSIGNMENT

Svi patenti su u vlasništvu istog entiteta za:
- Jednostavnije cross-referencing
- Jedinstvenu licensing strategiju
- Izbegavanje internih konflikata

```
Owner: [ELEKTROKOMBINACIJA d.o.o. ili Bojan Janjatović personally]
Inventor: Bojan Janjatović
Witness: Marija Janjatović
```

**Preporuka:** Osnuj kompaniju PRE filing-a da patenti budu u vlasništvu kompanije, ne lično. Lakše za investitore i licensing.

---

## CHECKLIST PRE FILING-A

### Dokumentacija
- [x] Invention disclosure documents (8 komada: EK-001 do EK-008)
- [x] Priority proof (Git commits: 2026-01-02, 2026-01-03, 2026-01-04)
- [x] Competitive research (prior art analysis)
- [x] Filing strategy (ovaj dokument)
- [x] V2G Control technical docs (tehnika/inzenjersko/en/07-v2g-control.md)
- [x] AI/ML technical docs (tehnika/inzenjersko/en/11-v2g-ai-ml.md)
- [ ] Detailed technical drawings
- [ ] Prototype photos/videos
- [ ] Witness signatures (notarized)

### Legal
- [ ] Konsultacija sa patent advokatom
- [ ] Pregled claims formulacija
- [ ] Freedom-to-operate analysis
- [ ] Company formation (ako nije)

### Technical
- [ ] Working prototype EK3 module
- [ ] Robot coordination demo (može biti simulacija)
- [ ] System architecture diagrams (detailed)

---

## BUDGET ESTIMATE

| Stavka | Patent A | Patent B | Patent C | Total |
|--------|----------|----------|----------|-------|
| Provisional (USPTO) | $320 | $320 | $320 | $960 |
| Full Application | ~$3,000 | ~$2,500 | ~$2,000 | ~$7,500 |
| PCT Filing | ~$4,000 | ~$4,000 | ~$4,000 | ~$12,000 |
| EU National Phase | ~$8,000 | ~$8,000 | ~$8,000 | ~$24,000 |
| US National Phase | ~$5,000 | ~$5,000 | ~$5,000 | ~$15,000 |
| **TOTAL (Year 1-3)** | | | | **~$60,000** |

**DIY opcija:** Provisional applications možeš sam, full filing zahteva advokata.

---

## APPENDIX: Legal Language Templates

### Cross-Reference Template
```
CROSS-REFERENCE TO RELATED APPLICATIONS

This application is related to and claims the benefit of:
- [Patent A number] filed [date], titled "[title]"
- [Patent B number] filed [date], titled "[title]"
- [Patent C number] filed [date], titled "[title]"

All related applications are by the same inventor and are
incorporated herein by reference in their entirety.

The present invention is intended to operate in conjunction
with, but is patentably distinct from, the subject matter
of the related applications.
```

### Boundary Definition Template
```
SCOPE LIMITATIONS

The claims of the present invention are specifically limited to
[SPECIFIC SCOPE]. The following elements, while potentially
compatible with the present invention, are explicitly NOT claimed:

1. [Element from other patent]
2. [Element from other patent]
3. [Element from other patent]

These elements may be covered by related applications filed by
the same inventor.
```

---

*Dokument kreiran: 2026-01-02*
*Poslednji update: 2026-01-04 (dodato: EK-007 V2G Control, EK-008 AI/ML)*
*Verzija: 1.1*
*Za internu upotrebu i konsultaciju sa patent advokatom*
