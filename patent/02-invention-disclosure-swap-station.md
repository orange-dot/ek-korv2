# Invention Disclosure: Dual-Purpose Robotic Swap Station

## Administrative Information

| Field | Value |
|-------|-------|
| Disclosure ID | EK-2026-002 |
| Date of Disclosure | 2026-01-02 |
| Inventor(s) | Bojan Janjatović |
| Date of Conception | 2026-01-02 |
| Witnesses | Marija Janjatović |

### Origin of Invention
Inspiracija: Razgovor o depot sistemu za autobuse u Srbiji. Ideja o kombinovanju battery swap-a i module swap-a na istoj lokaciji, koristeći postojeću bus flotu kao logističku mrežu.

---

## 1. Title of Invention

**Integrated Robotic Station for Simultaneous Electric Vehicle Battery Swap and Charging Infrastructure Module Replacement**

Alternative titles:
- Dual-Purpose Swap Station for Fleet Vehicles and Charger Maintenance
- Combined Battery and Power Module Exchange System

---

## 2. Problem Statement

### Current State

```
BATTERY SWAP STATIONS (NIO, Aulton, etc.):
• Robot menja bateriju vozila
• Infrastruktura za punjenje baterija je ODVOJENA
• Kada punjač ima problem = čeka se tehničar

CHARGER MAINTENANCE:
• Tehničar dolazi kamionetom ("truck roll")
• Prosečan trošak: €200-500 po pozivu
• Downtime: 2-14 dana
• Punjač ne radi dok se ne popravi

DVA ODVOJENA SISTEMA = DVA PUTA TROŠKOVI
```

### Problem

```
1. Swap stanice imaju robote koji 95% vremena stoje
2. Punjači u swap stanicama i dalje zahtevaju tehničare
3. Nema integracije između battery swap i charger maintenance
4. Transport rezervnih delova zahteva posebna vozila
```

---

## 3. Summary of Invention

```
JEDNA STANICA, DVA SWAPA:

┌─────────────────────────────────────────────────────────────┐
│                    SWAP STATION                             │
│                                                             │
│   AUTOBUS DOLAZI                                            │
│        │                                                    │
│        ▼                                                    │
│   ┌─────────┐      ┌─────────────────┐                     │
│   │BATTERY  │      │  CHARGER RACK   │                     │
│   │  SWAP   │      │                 │                     │
│   │         │      │  ┌───┐ ┌───┐    │                     │
│   │  Robot  │─────►│  │EK3│ │EK3│... │◄── Isti robot!     │
│   │    1    │      │  └───┘ └───┘    │                     │
│   └─────────┘      └─────────────────┘                     │
│                                                             │
│   ISTOVREMENO:                                              │
│   • Robot menja bateriju autobusa (3 min)                  │
│   • Isti ili drugi robot menja EK3 module (40 sec)         │
│   • AI je predvideo koje module treba zameniti             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Innovation Elements

```
ELEMENT 1: Shared Robotic Infrastructure
─────────────────────────────────────────────────────────────
• Isti robot (ili isti tip robota) za oba swapa
• Različiti gripperi: battery gripper + module gripper
• Tool changer za brzu zamenu grippera
• Amortizacija robota preko oba use case-a

ELEMENT 2: Synchronized Scheduling
─────────────────────────────────────────────────────────────
• AI predviđa kvar modula 2 nedelje unapred
• AI zna raspored dolazaka autobusa
• Swap modula se zakazuje kada autobus ionako dolazi
• Zero dedicated maintenance visits

ELEMENT 3: Fleet as Logistics Network
─────────────────────────────────────────────────────────────
• Pokvareni modul ide u centralni servis SA AUTOBUSOM
• Popravljen modul se vraća SA AUTOBUSOM
• Nema potrebe za servisnim vozilima
• Postojeća ruta autobusa = besplatan transport

ELEMENT 4: Unified Control System
─────────────────────────────────────────────────────────────
• Jedan sistem upravlja:
  - Battery swap operacijama
  - Charger module swap operacijama
  - Inventory management (baterije + moduli)
  - Predictive maintenance za sve
```

---

## 4. Detailed Description

### 4.1 Station Layout

```
FLOOR PLAN:
═══════════════════════════════════════════════════════════════

         BUS ENTRANCE
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    ┌─────────────────────────────────────────────────┐     │
│    │              BUS POSITIONING AREA               │     │
│    │                                                 │     │
│    │    ┌─────────────────────────────┐             │     │
│    │    │          BUS               │             │     │
│    │    │    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓      │             │     │
│    │    │    (battery underneath)    │             │     │
│    │    └─────────────────────────────┘             │     │
│    │                  │                             │     │
│    └──────────────────┼─────────────────────────────┘     │
│                       │                                    │
│    ═══════════════════╪════════════════════  ROBOT RAIL   │
│                       │                                    │
│    ┌──────────────────┼──────────────────┐                │
│    │    ROBOT 1       │      ROBOT 2     │                │
│    │   (Battery)      │     (Modules)    │                │
│    └──────────────────┼──────────────────┘                │
│                       │                                    │
│    ┌──────────────────┴──────────────────┐                │
│    │                                      │                │
│    │   BATTERY        │    MODULE        │                │
│    │   STORAGE        │    RACKS         │                │
│    │                  │                  │                │
│    │   ┌────┐ ┌────┐ │  ┌────┐ ┌────┐  │                │
│    │   │Full│ │Full│ │  │Rack│ │Rack│  │                │
│    │   │Batt│ │Batt│ │  │ 1  │ │ 2  │  │                │
│    │   └────┘ └────┘ │  └────┘ └────┘  │                │
│    │   ┌────┐ ┌────┐ │  ┌────┐ ┌────┐  │                │
│    │   │Empt│ │Empt│ │  │Rack│ │Rack│  │                │
│    │   │Batt│ │Batt│ │  │ 3  │ │ 4  │  │                │
│    │   └────┘ └────┘ │  └────┘ └────┘  │                │
│    │                  │                  │                │
│    └──────────────────┴──────────────────┘                │
│                                                             │
│    ┌─────────────────────────────────────────────────┐     │
│    │              MODULE SERVICE AREA                │     │
│    │   ┌────────┐    ┌────────┐    ┌────────┐       │     │
│    │   │Defect  │    │Fresh   │    │Transit │       │     │
│    │   │Modules │    │Modules │    │(to/from│       │     │
│    │   │(out)   │    │(in)    │    │ depot) │       │     │
│    │   └────────┘    └────────┘    └────────┘       │     │
│    └─────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
         BUS EXIT
```

### 4.2 Operational Workflow

```
SCENARIO: Autobus GSP-347 dolazi u 14:30
═══════════════════════════════════════════════════════════════

PRE DOLASKA (AI scheduling):
─────────────────────────────────────────────────────────────
• AI zna da GSP-347 dolazi u 14:30 (iz fleet sistema)
• AI zna da Rack 2, Slot 15 ima modul za zamenu
• AI zna da nema hitnih battery swapova u 14:30
• AI odlučuje: "Uraditi module swap dok je bus na poziciji"

14:30 - BUS DOLAZI:
─────────────────────────────────────────────────────────────
T+0:00  Bus ulazi u stanicu
T+0:30  Pozicioniranje (automatsko, senzori)
T+1:00  Robot 1 započinje battery swap
        Robot 2 započinje module swap (paralelno!)

14:31-14:34 - PARALELNI SWAP:
─────────────────────────────────────────────────────────────
ROBOT 1 (Battery):          ROBOT 2 (Modules):
• Otkači praznu bateriju    • Pozicionira se kod Rack 2
• Izvuče bateriju           • Izvlači defektan modul
• Stavi u storage           • Stavlja u "defect" bin
• Uzme punu bateriju        • Uzima fresh modul
• Insertuje u bus           • Insertuje u rack
• Zaključa                   • Verifikuje online status

T+3:30  Oba swapa završena

14:34 - BUS ODLAZI:
─────────────────────────────────────────────────────────────
T+4:00  Bus izlazi sa punom baterijom
        Charger rack je 100% operativan
        Defektan modul čeka transport

KASNIJE - TRANSPORT:
─────────────────────────────────────────────────────────────
18:00   Bus GSP-112 ide u depot (redovna ruta)
        Robot stavlja defektan modul u "transit" box
        Box se montira u prtljažnik busa

19:30   GSP-112 stiže u depot
        Tehničar uzima box sa defektnim modulima
        Stavlja box sa popravljenim modulima

SUTRA:
─────────────────────────────────────────────────────────────
06:00   GSP-112 kreće na prvu turu
        Prolazi kroz swap stanicu
        Robot uzima popravljene module iz boxa
        Stavlja nove defektne module u box
```

### 4.3 Robot System

```
OPCIJA A: Dva Specijalizovana Robota
═══════════════════════════════════════════════════════════════

ROBOT 1 - Battery Handler:
• Tip: Heavy payload (500+ kg)
• Primer: KUKA KR 500, Fanuc M-900
• Gripper: Custom battery gripper
• Dedicated to battery swap

ROBOT 2 - Module Handler:
• Tip: Collaborative (10 kg payload)
• Primer: UR10e, KUKA LBR iiwa
• Gripper: Precision module gripper
• Dedicated to EK3 modules

PREDNOST: Paralelni rad, optimizovani gripperi
MANA: Viša cena (2 robota)


OPCIJA B: Jedan Robot sa Tool Changer
═══════════════════════════════════════════════════════════════

ROBOT: Medium payload (100 kg)
• Primer: KUKA KR 100, ABB IRB 4600

TOOL CHANGER:
• Schunk SWS ili slično
• Vreme zamene: 5 sekundi

GRIPPERI:
• Battery gripper (u tool dock-u)
• Module gripper (u tool dock-u)

WORKFLOW:
1. Pick up battery gripper
2. Swap battery
3. Return battery gripper
4. Pick up module gripper
5. Swap modules
6. Return module gripper

PREDNOST: Niža cena (1 robot)
MANA: Sekvencijalni rad, sporije
```

### 4.4 Fleet Logistics Integration

```
MODULE TRANSPORT VIA BUS FLEET:
═══════════════════════════════════════════════════════════════

TRANSPORT BOX:
• Dimenzije: 600 × 400 × 300 mm
• Kapacitet: 10 EK3 modula
• ESD zaštita
• Shock absorbing foam
• RFID tag za tracking
• Fits u standardni bus cargo bay

WORKFLOW:

    SWAP STATION              CENTRAL DEPOT
    ────────────────          ────────────────
         │                          │
    ┌────┴────┐                ┌────┴────┐
    │Defective│    ═══BUS═══►  │Service  │
    │ Modules │                │ Center  │
    └─────────┘                └────┬────┘
                                    │
                               ┌────┴────┐
    ┌─────────┐    ◄═══BUS═══  │Repaired │
    │  Fresh  │                │ Modules │
    │ Modules │                └─────────┘
    └────┬────┘
         │
    ┌────┴────┐
    │  Rack   │
    └─────────┘

CAPACITY MATH:
• 1 bus može nositi 2 transport boxa = 20 modula
• Prosečan depot: 50 autobusa
• Ako 10% prolazi kroz swap stanicu dnevno = 5 buseva
• Kapacitet transporta: 100 modula/dan
• Više nego dovoljno za maintenance potrebe
```

---

## 5. Advantages Over Prior Art

```
ADVANTAGE 1: Shared Infrastructure
─────────────────────────────────────────────────────────────
Prior art: Separate robots for battery and charger maintenance
This invention: Same robot infrastructure for both
Savings: 30-50% on robotic equipment

ADVANTAGE 2: Zero Truck Rolls
─────────────────────────────────────────────────────────────
Prior art: Service vehicle dispatched for every charger issue
This invention: No dedicated service vehicles needed
Savings: €200-500 per maintenance event

ADVANTAGE 3: Proactive Maintenance
─────────────────────────────────────────────────────────────
Prior art: Reactive - fix after failure
This invention: Predictive - replace before failure
Result: Near-zero charger downtime

ADVANTAGE 4: Fleet as Logistics Network
─────────────────────────────────────────────────────────────
Prior art: Dedicated logistics for spare parts
This invention: Use existing bus routes
Savings: 100% of logistics cost

ADVANTAGE 5: Synergy Scheduling
─────────────────────────────────────────────────────────────
Prior art: Charger maintenance scheduled independently
This invention: Synchronized with bus visits
Result: Maintenance happens "for free" during normal operations
```

---

## 6. Claims (Draft)

```
INDEPENDENT CLAIM 1 (System):
A maintenance system for electric vehicle charging infrastructure
comprising:
• A robotic swap station configured for battery exchange of
  electric vehicles;
• A plurality of modular power units providing charging power;
• A robotic system configured to replace said modular power
  units without interrupting vehicle service;
• Wherein the robotic system for power unit replacement shares
  infrastructure with the battery swap system.

INDEPENDENT CLAIM 2 (Method):
A method for maintaining charging infrastructure comprising:
• Predicting failure of a power module using diagnostic data;
• Scheduling replacement coincident with a vehicle visit;
• Replacing the power module while the vehicle undergoes
  battery exchange;
• Transporting the replaced module to a service center using
  the fleet vehicle.

DEPENDENT CLAIMS:
• ...wherein a single robot performs both battery and module
  exchange using interchangeable end effectors
• ...wherein module transport utilizes scheduled fleet vehicle
  routes without dedicated logistics
• ...wherein replacement scheduling is synchronized with fleet
  management system
```

---

## 7. Development Status

```
☑ Concept only (current)
□ Proof of concept built
□ Prototype tested
□ Pilot production
□ Commercial production
```

---

## 8. Signatures

```
INVENTOR(S):

Name: _________________________
Signature: ____________________
Date: ________________________


WITNESS:

Name: _________________________
Signature: ____________________
Date: ________________________
```
