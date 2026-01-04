# Swap Station Koncept

## Filozofija: Povratak Modularnosti

### Lekcija iz Istorije: Evolucija Servisa TV Prijemnika

```
PRIMER: Kako se servisiranje televizora promenilo kroz decenije
═══════════════════════════════════════════════════════════════

ERA 1 (1970-1990): VISOKO MODULARNI SISTEMI
────────────────────────────────────────────
TV prijemnik = šasija + zamenljivi moduli
• Tuner modul
• IF modul
• Video procesor modul
• Audio modul
• Napajanje modul

SERVISIRANJE:
├── Dijagnostika: Koji modul ne radi?
├── Na terenu: Zameni modul (30 min)
├── U servisu: Popravi modul (može i sutra)
├── Tehničar: Ne mora biti ekspert za sve
└── Rezultat: TV traje 15-20 godina

ERA 2 (1990-2000s): VISOKO INTEGRISANI SISTEMI
────────────────────────────────────────────
TV prijemnik = jedna ploča sa custom ASIC-ima
• Sve funkcije u nekoliko čipova
• Surface mount komponente
• Proprietary delovi

SERVISIRANJE:
├── Dijagnostika: Kompleksna, treba skupa oprema
├── Na terenu: Skoro nemoguće
├── U servisu: Često skuplje od novog uređaja
├── Tehničar: Mora biti visoko specijalizovan
└── Rezultat: "Baci i kupi nov" - planned obsolescence
```

### Zašto se Industrija Okrenula Integraciji?

```
RAZLOZI ZA INTEGRACIJU:
• Niža cena proizvodnje (manje konektora, manje sklapanja)
• Manji form factor
• "Dobro je za prodaju novih uređaja"

ALI ZA INFRASTRUKTURU (punjači, industrijska oprema):
• Cena zamene je OGROMNA
• Downtime košta više od popravke
• Očekivani životni vek: 15+ godina
• Lokacije su teško dostupne

ZAKLJUČAK: Modularan dizajn je BOLJI za infrastrukturu!
```

### ELEKTROKOMBINACIJA Pristup: Best of Both Worlds

```
KOMBINUJEMO:
════════════════════════════════════════════════════════════

MODULARNOST IZ 1970-ih          TEHNOLOGIJA IZ 2020-ih
─────────────────────────────────────────────────────────
Zamenljivi moduli          +    AI prediktivna dijagnostika
Popravka u servisu         +    Robotska zamena na terenu
Dugotrajna oprema          +    OTA firmware update
Jednostavno održavanje     +    Cloud monitoring

                    ═══════════════
                    REZULTAT:
                    ═══════════════
                    • Zamena modula: 60 sekundi (robot)
                    • Dijagnostika: AI zna unapred
                    • Tehničar na terenu: NIJE POTREBAN
                    • Životni vek: 15+ godina
                    • Refurbishment: Cirkularna ekonomija
```

---

## Pregled Inovacije

ELEKTROKOMBINACIJA Swap Station kombinuje dva procesa u jedan:
1. **Battery swap** za električne autobuse (poznata tehnologija)
2. **Module swap** za EK punjač module (NOVA tehnologija)

```
┌─────────────────────────────────────────────────────────────────┐
│                    SWAP STATION LAYOUT                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    ┌──────────────┐              ┌──────────────┐              │
│    │   BATTERY    │              │    MODULE    │              │
│    │    STORAGE   │              │    STORAGE   │              │
│    │  ┌──┐ ┌──┐   │              │  [EK] [EK]   │              │
│    │  │▓▓│ │▓▓│   │              │  [EK] [EK]   │              │
│    │  └──┘ └──┘   │              │  [EK] [EK]   │              │
│    │  ┌──┐ ┌──┐   │              │  [EK] [EK]   │              │
│    │  │▓▓│ │░░│   │              │  Rezervni    │              │
│    │  └──┘ └──┘   │              │  moduli      │              │
│    └──────────────┘              └──────────────┘              │
│           │                             │                       │
│           └──────────┬──────────────────┘                       │
│                      │                                          │
│              ┌───────▼───────┐                                  │
│              │  ROBOT ARM    │                                  │
│              │  (dual-task)  │                                  │
│              └───────┬───────┘                                  │
│                      │                                          │
│    ══════════════════╪══════════════════════════                │
│                      │         BUS LANE                         │
│              ┌───────▼───────┐                                  │
│              │   AUTOBUS     │                                  │
│              │   ┌─────┐     │                                  │
│              │   │ BAT │     │                                  │
│              │   └─────┘     │                                  │
│              └───────────────┘                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Zašto je Ovo Jedinstveno?

### Postojeća Rešenja na Tržištu

| Tehnologija | Postoji | Primeri | Ograničenja |
|-------------|---------|---------|-------------|
| Battery swap za EV | ✅ | NIO, Ample, CATL | Samo baterije vozila |
| Robotic EV charging | ✅ | Rocsys, EVS Robot | Samo plug-in, ne swap |
| Hot-swap charger moduli | ✅ | Kempower | Ručno, tehničar |
| Robotic warehouse battery | ✅ | Ocado, UBTECH | Roboti, ne vozila |

### ELEKTROKOMBINACIJA Inovacija

| Nova Tehnologija | Status | Prednost |
|------------------|--------|----------|
| Robotic EK module swap | **NOVO** | Automatska zamena bez tehničara |
| Dual-swap (battery + module) | **NOVO** | Dva procesa, jedna poseta |
| AI-driven swap scheduling | **NOVO** | Predviđanje kada treba zamena |
| Fleet-integrated maintenance | **NOVO** | Autobusi = servisna mreža |

---

## Workflow Detaljno

### Scenario: Autobus Dolazi na Swap

```
FAZA 1: IDENTIFIKACIJA (30 sec)
═══════════════════════════════════════════════════════════════
Autobus ulazi → RFID/camera identifikacija
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ CLOUD PROVERA:                                              │
│ • Bus ID: BG-1234-EV                                        │
│ • Battery SoC: 12%                                          │
│ • Potrebna baterija: Model B-400kWh                         │
│ • EK Module status na ovoj stanici: [✓][✓][!][✓]           │
│   → Modul #3 predviđen za zamenu (AI alert pre 3 dana)     │
└─────────────────────────────────────────────────────────────┘

FAZA 2: PARALELNI SWAP (3-5 min)
═══════════════════════════════════════════════════════════════

    ROBOT ARM #1                    ROBOT ARM #2
    (Battery)                       (EK Module)
         │                               │
         ▼                               ▼
┌─────────────────┐            ┌─────────────────┐
│ 1. Pozicionira  │            │ 1. Pozicionira  │
│    se ispod     │            │    se kod       │
│    autobusa     │            │    charging     │
│                 │            │    rack-a       │
│ 2. Otključava   │            │                 │
│    bateriju     │            │ 2. Disconnect   │
│                 │            │    EK modul #3  │
│ 3. Izvlači      │            │    (power+data) │
│    praznu       │            │                 │
│    bateriju     │            │ 3. Izvlači      │
│                 │            │    degradirani  │
│ 4. Postavlja    │            │    modul        │
│    punu         │            │                 │
│    bateriju     │            │ 4. Postavlja    │
│                 │            │    novi modul   │
│ 5. Zaključava   │            │                 │
│    i verifikuje │            │ 5. Connect +    │
│                 │            │    AI verify    │
└─────────────────┘            └─────────────────┘
         │                               │
         └───────────────┬───────────────┘
                         │
                         ▼
FAZA 3: VERIFIKACIJA (30 sec)
═══════════════════════════════════════════════════════════════
• Battery handshake OK
• EK Module #3 online, self-test PASS
• Charging station: 100% operativna
• Bus ready to depart

FAZA 4: IZLAZ
═══════════════════════════════════════════════════════════════
Autobus odlazi sa punom baterijom
Stanica ostaje potpuno funkcionalna
Degradirani modul ide na refurbishment
```

---

## Mehanički Dizajn EK Modula za Robotic Handling

### Zahtevi za Robot-Friendly Modul

```
EK30 MODULE - ROBOTIC SWAP EDITION
══════════════════════════════════════════════════════════════

DIMENZIJE:
┌─────────────────────────────────────┐
│                                     │  H: 400mm
│  ┌───┐               ┌───┐         │  W: 300mm
│  │ ● │               │ ● │         │  D: 500mm
│  └───┘               └───┘         │  Masa: 25kg
│    ROBOT GRIP POINTS               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     POWER CONNECTOR         │   │
│  │     (Quick-release)         │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     DATA CONNECTOR          │   │
│  │     (Blind-mate)            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     COOLANT CONNECTORS      │   │
│  │     (Dry-break)             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [====== RAIL GUIDES ======]       │
│                                     │
└─────────────────────────────────────┘
```

### Ključni Elementi za Automatsku Zamenu

| Komponenta | Specifikacija | Zašto |
|------------|---------------|-------|
| **Robot Grip Points** | 2x M8 threaded inserts, 200mm apart | Standardna hvataljka |
| **Power Connector** | Anderson SBS75 ili REMA DIN 160A | Quick-release, >10,000 cycles |
| **Data Connector** | Harting Han-Modular | Blind-mate, IP65 |
| **Coolant** | Stäubli dry-break couplings | Zero-spill disconnect |
| **Rail Guides** | 19" rack standard | Precizno pozicioniranje |
| **Alignment Pins** | 2x conical pins, ±2mm tolerance | Robot-friendly docking |
| **Locking Mechanism** | Motorized cam lock | Automated secure/release |

### Konektor Layout (Rear Panel)

```
      ┌─────────────────────────────────────┐
      │  ○────○    DC+  DC-   ○────○       │
      │  ALIGN     ████████████    ALIGN    │
      │            ████████████             │
      │         600V/100A POWER             │
      │                                     │
      │  ┌──────┐  ┌──────┐  ┌──────┐      │
      │  │ ETH  │  │ CAN  │  │ AUX  │      │
      │  │      │  │      │  │      │      │
      │  └──────┘  └──────┘  └──────┘      │
      │     DATA CONNECTORS (Blind-mate)    │
      │                                     │
      │    ◉ IN ════════════ OUT ◉         │
      │         COOLANT (Dry-break)         │
      │                                     │
      │  [LOCK]                    [LOCK]   │
      │    ▼                          ▼     │
      └─────────────────────────────────────┘
```

---

## Module Storage & Inventory System

### Swap Station Module Rack

```
MODULE STORAGE RACK (kapacitet: 8 modula)
══════════════════════════════════════════════════════════════

    ┌─────┬─────┬─────┬─────┐
    │ EK1 │ EK2 │ EK3 │ EK4 │  ← Gornji red (rezervni)
    │ ✓   │ ✓   │ ✓   │ CHG │     CHG = na punjenju
    ├─────┼─────┼─────┼─────┤
    │ EK5 │ EK6 │ EK7 │ EK8 │  ← Donji red
    │ ✓   │ RFB │ ✓   │ ✓   │     RFB = za refurbishment
    └─────┴─────┴─────┴─────┘

STATUS INDIKATORI:
✓   = Spreman za deployment
CHG = Charging/conditioning
RFB = Needs refurbishment (skloniti)
!   = Alert (degradacija detektovana)

RACK FEATURES:
• Svaki slot ima charging capability (trickle charge)
• Temperature-controlled storage
• Individual module health monitoring
• FIFO rotation (najstariji prvi ide)
```

### Inventory Management Algorithm

```python
# Pseudo-code za inventory management

class ModuleInventory:
    def check_swap_needed(self, station_id):
        """
        Proverava da li neki modul na stanici treba zamenu
        Poziva se svaki put kad autobus dođe
        """
        modules = get_active_modules(station_id)

        for module in modules:
            health = module.ai_health_score  # 0-100
            predicted_failure = module.predicted_failure_days

            if health < 70 or predicted_failure < 14:
                # Modul treba zamenu
                reserve = find_best_reserve_module(station_id)
                if reserve:
                    schedule_swap(module, reserve, next_bus_arrival)
                else:
                    alert_logistics("Need module delivery", station_id)

    def post_swap_handling(self, removed_module):
        """
        Šta raditi sa izvađenim modulom
        """
        if removed_module.health_score > 50:
            # Može se refurbishovati
            send_to_refurbishment_center(removed_module)
        else:
            # End of life
            send_to_recycling(removed_module)
```

---

## Robot Arm Specifikacije

### Dual-Purpose Robot System

```
OPCIJA A: Dva Zasebna Robota
═══════════════════════════════════════════════════════════════

┌─────────────────┐          ┌─────────────────┐
│  BATTERY ROBOT  │          │  MODULE ROBOT   │
│  ─────────────  │          │  ─────────────  │
│  Payload: 800kg │          │  Payload: 50kg  │
│  Reach: 3.5m    │          │  Reach: 2.0m    │
│  Speed: Medium  │          │  Speed: Fast    │
│  Precision: ±5mm│          │  Precision: ±1mm│
│                 │          │                 │
│  Tip: Gantry    │          │  Tip: 6-axis    │
│  ili Cartesian  │          │  articulated    │
└─────────────────┘          └─────────────────┘

Prednosti: Paralelni rad, specijalizovani
Mane: Veća cena, više održavanja


OPCIJA B: Jedan Multi-Purpose Robot + Tool Changer
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────┐
│         UNIVERSAL ROBOT                 │
│         ────────────────                │
│         Payload: 100kg (max)            │
│         Reach: 3.0m                     │
│         Precision: ±2mm                 │
│                                         │
│         TOOL CHANGER:                   │
│         ┌─────────┐  ┌─────────┐       │
│         │ Battery │  │ Module  │       │
│         │ Gripper │  │ Gripper │       │
│         │ (heavy) │  │ (light) │       │
│         └─────────┘  └─────────┘       │
└─────────────────────────────────────────┘

Prednosti: Jeftiniji, manji footprint
Mane: Sekvencijalni rad, sporije


OPCIJA C: Humanoid Robot (Futuristic)
═══════════════════════════════════════════════════════════════
Primer: UBTECH Walker S2 - već ima self battery swap
Mogao bi da radi i module swap sa pravim toolingom
Prednosti: Fleksibilan, adaptivan
Mane: Još nije mature tehnologija za heavy-duty
```

### Preporučena Konfiguracija

```
PREPORUKA: OPCIJA A (Dva robota) za prvu fazu

BATTERY ROBOT:                    MODULE ROBOT:
├── KUKA KR 500 ili              ├── Universal Robots UR20
│   Fanuc M-900iB                │   ili KUKA LBR iiwa
├── Gantry mount                 ├── Floor/wall mount
├── Custom battery gripper       ├── Custom module gripper
└── Safety: Light curtains       └── Collaborative mode

SHARED SYSTEMS:
├── Vision system (3D cameras za pozicioniranje)
├── Central PLC (Siemens S7-1500 ili Beckhoff)
├── Safety PLC (dedicated)
└── Cloud connectivity za AI scheduling
```

---

## Fleet Integration: Autobusi kao Servisna Mreža

### Koncept

```
TRADICIONALNI MODEL:
═══════════════════════════════════════════════════════════════
Punjač pokvaren → Operater primeti → Pozove tehničara →
Tehničar planira → Vozi do lokacije → Dijagnostika →
Možda nema deo → Vraća se → Dolazi ponovo → Popravlja

UKUPNO VREME: 2-5 dana
TRUCK ROLLS: 1-3


ELEKTROKOMBINACIJA MODEL:
═══════════════════════════════════════════════════════════════
AI predvidi kvar (14 dana ranije) →
Sistem zna koji autobus dolazi na tu stanicu →
Rezervni modul već čeka na stanici →
Autobus dolazi na battery swap →
Robot menja i bateriju i modul SIMULTANO →
Autobus odlazi, stanica 100%

UKUPNO VREME: 0 dodatnog vremena (deo redovne operacije)
TRUCK ROLLS: 0
```

### Logistics Network

```
               ┌─────────────────┐
               │  CENTRAL HUB    │
               │  (Refurbishment │
               │   & Storage)    │
               └────────┬────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ SWAP     │  │ SWAP     │  │ SWAP     │
    │ STATION  │  │ STATION  │  │ STATION  │
    │ #1       │  │ #2       │  │ #3       │
    └────┬─────┘  └────┬─────┘  └────┬─────┘
         │             │             │
         └─────────────┼─────────────┘
                       │
              ┌────────▼────────┐
              │   BUS FLEET     │
              │   (Transport)   │
              │                 │
              │  ┌───┐ ┌───┐   │
              │  │BUS│ │BUS│   │
              │  └───┘ └───┘   │
              └─────────────────┘

MODULE FLOW:
1. Central Hub ima pool rezervnih modula
2. Autobusi (ili dedicirani transport) nose module do stanica
3. Degradirani moduli se vraćaju u Hub za refurbishment
4. Refurbishovani moduli idu nazad u cirkulaciju
```

### Scheduling Algorithm

```python
# AI Scheduling za module logistics

def optimize_module_delivery():
    """
    Optimizuje dostavu rezervnih modula kroz bus fleet
    """

    # Koje stanice trebaju module uskoro?
    stations_needing_modules = []
    for station in all_stations:
        for module in station.modules:
            if module.predicted_failure_days < 14:
                stations_needing_modules.append({
                    'station': station,
                    'urgency': 14 - module.predicted_failure_days,
                    'module_type': module.type
                })

    # Koji autobusi prolaze pored tih stanica?
    for need in stations_needing_modules:
        buses = get_buses_passing_station(need['station'], next_48h)

        for bus in buses:
            # Da li autobus može da ponese modul?
            if bus.has_cargo_space and bus.route_includes(central_hub):
                schedule_module_pickup(bus, central_hub, need)
                break

    # Fallback: dedicirani transport ako nema pogodnog autobusa
    unmet_needs = [n for n in stations_needing_modules if not n.scheduled]
    for need in unmet_needs:
        schedule_dedicated_delivery(need)
```

---

## Business Model

### Cost Comparison

```
TRADICIONALNI MODEL (20 stanica, 5 godina)
═══════════════════════════════════════════════════════════════
Tehničar truck rolls:        40/god × €150 × 5 = €30,000
Downtime lost revenue:       €10,000/god × 5   = €50,000
Emergency repairs:           €5,000/god × 5    = €25,000
Module replacements:         10 × €3,000       = €30,000
                                        TOTAL: €135,000

SWAP STATION MODEL (20 stanica, 5 godina)
═══════════════════════════════════════════════════════════════
Robot system (amortized):    €100,000 ÷ 5     = €20,000/god × 5 = €100,000
Module inventory (rotating): 40 × €2,500      = €100,000 (one-time, reused)
Refurbishment costs:         €500/mod × 20    = €10,000
Downtime:                    ~0               = €0
Truck rolls:                 ~0               = €0
                                        TOTAL: €210,000 (first 5 years)

BREAK-EVEN ANALYSIS:
═══════════════════════════════════════════════════════════════
• Initial investment viši, ali:
• Posle Year 5, godišnji troškovi su ~€15,000 vs ~€27,000
• Scale benefits: Više stanica = bolji ROI
• Za 50+ stanica: break-even u godini 3
```

### Revenue Opportunities

```
DODATNI PRIHODI:
═══════════════════════════════════════════════════════════════

1. MODULE-AS-A-SERVICE
   • Operateri ne kupuju module, nego plaćaju po kWh
   • Mi održavamo inventory i health
   • Recurring revenue model

2. FLEET MAINTENANCE UGOVOR
   • Flat fee po autobusu/mesecu
   • Uključuje battery swap + charger održavanje
   • Predvidivi troškovi za operatere

3. DATA MONETIZATION
   • Agregirani podaci o zdravlju flote
   • Benchmarking across operators
   • Predictive insights za grid operatere

4. REFURBISHMENT SERVICES
   • Third-party moduli mogu koristiti našu mrežu
   • Standardizovani refurb proces
   • Circular economy partner
```

---

## Implementation Roadmap

### Faza 1: Proof of Concept (6 meseci)

```
DELIVERABLES:
├── EK30 modul sa robotic-friendly dizajnom
├── Jednostavan robot setup (1 arm + tool changer)
├── Mock swap station (ne prava battery swap)
├── Demonstracija module swap <60 sec
└── AI scheduling prototype

LOKACIJA: Kontrolisano okruženje (radionica)
BUDGET: €150,000
```

### Faza 2: Pilot Station (12 meseci)

```
DELIVERABLES:
├── Puna swap station (battery + module)
├── Integracija sa jednim bus operaterom
├── 5 autobusa u pilot programu
├── Real-world data collection
└── Refurbishment proces setup

LOKACIJA: Jedan grad (Beograd?)
BUDGET: €500,000
PARTNERI: GSP ili privatni bus operator
```

### Faza 3: Scale (24 meseci)

```
DELIVERABLES:
├── 5 swap stanica
├── 50+ autobusa
├── Module logistics network
├── Full AI optimization
└── Commercial offering

BUDGET: €2,000,000
REVENUE TARGET: Break-even by end of Year 3
```

---

## Patentabilni Elementi

```
POTENCIJALNI PATENTI:
═══════════════════════════════════════════════════════════════

1. "Integrated Battery and Charger Module Swap Station"
   • Claim: Kombinovanje dva swap procesa u jedan visit

2. "AI-Scheduled Predictive Module Replacement"
   • Claim: Korišćenje predictive AI za scheduling swap-a

3. "Fleet-Integrated Charger Maintenance Network"
   • Claim: Korišćenje service fleet za transport modula

4. "Robot-Compatible EV Charger Module Design"
   • Claim: Specifični connector/gripper dizajn za automated handling

5. "Parallel Dual-Swap Robotic System"
   • Claim: Dva robota rade simultano na različitim task-ovima
```

---

## Reference

- [NIO Power Swap Station](https://www.nio.com/nio-power) - Battery swap benchmark
- [Rocsys Autonomous Charging](https://www.rocsys.com/) - Robotic plug-in technology
- [Kempower Power Module](https://kempower.com/power-module/) - Manual hot-swap moduli
- [UBTECH Walker S2](https://www.ubtrobot.com/en/humanoid/products/walker-s2) - Self battery swap robot
- [Ocado Battery Swap](https://ocadointelligentautomation.com/systems/battery-swap) - Warehouse robot swap

---

## Datum

Kreirano: Januar 2026
Status: Koncept / Pre-development
