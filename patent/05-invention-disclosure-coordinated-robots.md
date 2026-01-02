# Invention Disclosure: Coordinated Dual-Robot Maintenance System

## Administrative Information

| Field | Value |
|-------|-------|
| Disclosure ID | EK-2026-005 |
| Date of Disclosure | 2026-01-02 |
| Inventor(s) | Bojan Janjatović |
| Date of Conception | 2026-01-02 |
| Witnesses | Marija Janjatović |

### Origin of Invention
Proširenje swap station koncepta: umesto kupovine industrijskih robota (UR10e, KUKA), razvijamo SOPSTVENOG robota. Ključna inovacija: robot na autobusu + robot na stanici rade u koordinaciji. Self-healing infrastruktura.

---

## 1. Title of Invention

**Coordinated Dual-Robot System for Autonomous EV Charging Infrastructure Maintenance**

Alternative titles:
- Vehicle-Mounted and Station-Based Cooperative Robotic Maintenance System
- Self-Healing Charging Infrastructure with Distributed Robotics

---

## 2. Problem Statement

```
TRENUTNI PRISTUP:
═══════════════════════════════════════════════════════════════
• Industrijski roboti (UR, KUKA) su SKUPI: €30,000-100,000
• Robot je SAMO na stanici
• Ako autobus dođe i punjenje ne radi:
  → Čeka se tehničar
  → Ili čeka se da neko dođe da popravi
  → Downtime!

PROBLEM:
• Jedan robot na stanici = single point of failure
• Nema redundancije
• Autobus je "glup" - ne može ništa da uradi sam
```

---

## 3. Summary of Invention

```
DVA ROBOTA U KOORDINACIJI:
═══════════════════════════════════════════════════════════════

    AUTOBUS                         STANICA
    ┌─────────────────┐            ┌─────────────────┐
    │                 │            │                 │
    │  ┌───────────┐  │            │  ┌───────────┐  │
    │  │  ROBOT A  │  │◄──────────►│  │  ROBOT B  │  │
    │  │ (onboard) │  │  koordin.  │  │ (station) │  │
    │  └───────────┘  │            │  └───────────┘  │
    │                 │            │                 │
    │  ▪ Manji       │            │  ▪ Veći        │
    │  ▪ Battery     │            │  ▪ Module swap │
    │    konekcija   │            │  ▪ Teži poslovi│
    │  ▪ Laki       │            │                 │
    │    servisi     │            │                 │
    └─────────────────┘            └─────────────────┘

SCENARIJI:
─────────────────────────────────────────────────────────────

SCENARIO 1: Normalan battery swap
• Robot B (stanica) menja bateriju
• Robot A (bus) asistira sa konektorima

SCENARIO 2: Punjenje ne radi, dijagnostika
• Autobus dođe, punjenje FAIL
• Robot A skenira problem
• Robot A + Robot B koordinirano popravljaju
• Ako ne mogu → zakazuje se human tehničar

SCENARIO 3: Preventivni maintenance
• AI predvidi problem
• Sledeći bus koji dođe ima Robot A koji donosi deo
• Robot B instalira

SCENARIO 4: Samo Robot A (bez stanice)
• Bus parkiran u depotu bez robota
• Robot A radi basic maintenance sam
```

---

## 4. Detailed Description

### 4.1 Robot A - Vehicle-Mounted (Bus Robot)

```
ROBOT A SPECIFIKACIJE:
═══════════════════════════════════════════════════════════════

LOKACIJA: Montiran na autobusu (donji deo, blizu baterije)

KARAKTERISTIKE:
• Mala masa: <15 kg
• Kompaktan: Fits u prostor ispod poda
• Payload: 5-10 kg
• Reach: 0.5-1m
• Power: 48V iz bus sistema

MOGUĆNOSTI:
• Konektor manipulation (charging plug)
• Light-duty swap asistencija
• Vizuelna inspekcija (kamera)
• Senzor probing (dijagnostika)
• Nošenje malih delova (fuses, connectors)

STORAGE NA BUSU:
• Mali inventory box sa spare delovima:
  - Fuses
  - Connectors
  - Small modules
  - Cleaning supplies

KADA RADI SAM:
• Basic dijagnostika
• Čišćenje konektora
• Zamena osigurača
• Reporting problema
```

### 4.2 Robot B - Station-Based

```
ROBOT B SPECIFIKACIJE:
═══════════════════════════════════════════════════════════════

LOKACIJA: Swap stanica, na linearnoj šini

KARAKTERISTIKE:
• Veća masa: 30-50 kg robot
• Payload: 50-100 kg (za baterije)
• Reach: 1.5-2m
• Power: 400V AC

MOGUĆNOSTI:
• Battery swap (glavni posao)
• EK3 module swap
• Heavy-duty maintenance
• Koordinacija sa Robot A

STORAGE NA STANICI:
• Fresh baterije
• Fresh EK3 moduli
• Defective bins
• Tool storage
```

### 4.3 Coordination Protocol

```
KOMUNIKACIJA:
═══════════════════════════════════════════════════════════════

WIRELESS LINK:
• Bus approaching → Station aware
• Robot A ←→ Robot B real-time sync
• Shared sensor data
• Coordinated motion planning

HANDSHAKE SEQUENCE:
─────────────────────────────────────────────────────────────

1. BUS APPROACHING (500m)
   Bus → Station: "Arriving in 2 min, battery 15%, need swap"
   Station → Bus: "ACK, Robot B ready, bay 2 available"

2. BUS DOCKING
   Robot A: "Deployed, connectors accessible"
   Robot B: "Moving to position"

3. COORDINATED SWAP
   Robot B: "Grasping battery"
   Robot A: "Releasing latches" (ako treba)
   Robot B: "Extracting..."
   Robot A: "Monitoring clearance"

4. COMPLETION
   Robot A: "New battery locked"
   Robot B: "Returning to home"
   Bus: "Departing"

FAULT SCENARIO:
─────────────────────────────────────────────────────────────

1. CHARGING FAILS
   Station: "Charge session failed, error 0x42"
   Robot A: "Deploying for inspection"
   Robot A: "Visual: Connector debris detected"
   Robot A: "Attempting cleaning..."
   Robot A: "Retry charge"
   Station: "Charge OK"

   // Problem solved WITHOUT human intervention!
```

### 4.4 Self-Healing Scenarios

```
SCENARIO: Punjač ima neispravan modul
═══════════════════════════════════════════════════════════════

TRADICIONALNO:
1. Punjenje FAIL
2. Alarm na central
3. Dispatcher šalje tehničara
4. Tehničar vozi 1h
5. Dijagnostika 30min
6. Popravka 1h
7. TOTAL: 3-4 sata downtime

SA KOORDINIRANIM ROBOTIMA:
1. Punjenje FAIL
2. Robot A: Dijagnostika (30 sec)
3. Robot A → AI: "Modul 47 degradiran"
4. AI → Robot B: "Replace modul 47"
5. Robot B: Swap (60 sec)
6. Punjenje OK
7. TOTAL: 2 minuta downtime

═══════════════════════════════════════════════════════════════

SCENARIO: Bus dolazi, Robot B je pokvaren
═══════════════════════════════════════════════════════════════

TRADICIONALNO:
• Nema swap, bus čeka ili ide dalje prazan

SA KOORDINIRANIM ROBOTIMA:
• Robot A može uraditi BASIC operacije sam:
  - Manuelni charging (plug-in)
  - Dijagnostika Robot B
  - Čak i simple repairs na Robot B!

═══════════════════════════════════════════════════════════════

SCENARIO: Hitna popravka u polju
═══════════════════════════════════════════════════════════════

• Bus 1 ima problem sa punjačem na stanici X
• Bus 2 prolazi kroz stanicu X (redovna ruta)
• Robot A na Bus 2 nosi replacement deo
• Robot A (Bus 2) + Robot B (stanica) popravljaju
• Bus 1 nije ni znao da je bio problem!
```

---

## 5. Key Innovation: Custom Robot Design

```
ZAŠTO PRAVIMO SVOG ROBOTA?
═══════════════════════════════════════════════════════════════

INDUSTRIJSKI ROBOTI (UR, KUKA):
• Cena: €30,000-100,000
• General purpose = overkill za našu primenu
• Teški, veliki
• Ne mogu na vozilo

NAŠ PRISTUP:
• Purpose-built za EV charging/swap
• Robot A: €2,000-5,000 (estimate)
• Robot B: €10,000-20,000 (estimate)
• Optimizovani za specifične task-ove
• Koordinacija ugrađena od starta

PATENTABILNOST:
─────────────────────────────────────────────────────────────
✓ Specific robot design za charging
✓ Dual-robot coordination protocol
✓ Self-healing infrastructure concept
✓ Vehicle-mounted robot za maintenance
```

---

## 6. Advantages Over Prior Art

```
ADVANTAGE 1: Redundancy
─────────────────────────────────────────────────────────────
Prior art: Single robot at station = SPOF
This invention: Two robots = redundancy
If Robot B fails, Robot A can do basic ops

ADVANTAGE 2: Distributed Intelligence
─────────────────────────────────────────────────────────────
Prior art: Robot waits at station
This invention: Robot COMES with the vehicle
Every bus = mobile maintenance unit

ADVANTAGE 3: Self-Healing
─────────────────────────────────────────────────────────────
Prior art: Problem → call technician
This invention: Problem → robots fix it
Most issues resolved in <5 minutes

ADVANTAGE 4: Cost
─────────────────────────────────────────────────────────────
Prior art: €50,000+ industrial robot
This invention: €15,000-25,000 for BOTH custom robots
Purpose-built = cheaper and better

ADVANTAGE 5: Fleet Multiplier
─────────────────────────────────────────────────────────────
Prior art: N stations need N robots
This invention: N buses have N Robot A's
Fleet of 100 buses = 100 mobile maintenance robots!
```

---

## 7. Claims (Draft)

```
INDEPENDENT CLAIM 1 (System):
A distributed robotic maintenance system for electric vehicle
charging infrastructure comprising:
• A first robot mounted on the electric vehicle;
• A second robot positioned at a charging station;
• A communication link enabling coordination between said
  robots;
• Wherein said robots cooperatively perform maintenance tasks
  that neither could complete independently.

INDEPENDENT CLAIM 2 (Method):
A method for autonomous infrastructure maintenance comprising:
• Detecting a fault condition at a charging station;
• Dispatching diagnostic data from a vehicle-mounted robot;
• Coordinating repair actions between the vehicle-mounted
  robot and a station-based robot;
• Completing repair without human intervention.

INDEPENDENT CLAIM 3 (Vehicle):
An electric vehicle comprising:
• An onboard robotic manipulator;
• A storage compartment for spare components;
• A communication system for coordinating with external
  infrastructure robots;
• Wherein said vehicle functions as a mobile maintenance unit.

DEPENDENT CLAIMS:
• ...wherein the vehicle-mounted robot weighs less than 20 kg
• ...wherein coordination uses wireless protocol with <10ms latency
• ...wherein the vehicle carries standardized spare components
• ...wherein failed components are transported to service
  centers via the vehicle's normal route
```

---

## 8. Development Roadmap

```
PHASE 1: Robot B (Station)
─────────────────────────────────────────────────────────────
• Custom design za EK3 swap
• Jeftiniji od industrijskog
• Prove the concept

PHASE 2: Robot A (Vehicle) - Prototype
─────────────────────────────────────────────────────────────
• Compact design
• Basic manipulation
• Communication protocol

PHASE 3: Coordination
─────────────────────────────────────────────────────────────
• A + B working together
• Self-healing scenarios
• Edge cases

PHASE 4: Fleet Deployment
─────────────────────────────────────────────────────────────
• Robot A on every bus
• Network of Robot B's on stations
• Self-maintaining infrastructure
```

---

## 9. Signatures

```
INVENTOR(S):

Name: Bojan Janjatović
Signature: ____________________
Date: 2026-01-02


WITNESS:

Name: Marija Janjatović
Signature: ____________________
Date: 2026-01-02
```
