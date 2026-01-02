# ELEKTROKOMBINACIJA - Koncept Univerzalne Modularne Platforme

## Ključna Ideja

**"Jedan modul za sve"** - Mali, jeftin, lak modul koji se kombinuje u neograničenom broju za bilo koju primenu.

```
TRADICIONALNI PRISTUP              ELEKTROKOMBINACIJA

   [  50 kW  ]  ──► Bus            [10][10][10][10][10] ──► Bus (50 kW)
   [  22 kW  ]  ──► Auto           [10][10]             ──► Auto (22 kW)
   [   7 kW  ]  ──► Kućni          [10]                 ──► Kućni (10 kW)
   [   3 kW  ]  ──► Skuter         [10] (redukovano)    ──► Skuter

   4 različita proizvoda           1 univerzalni modul
   4× razvoj, 4× sertifikacija     1× razvoj, 1× sertifikacija
```

## Zašto 10 kW?

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ANALIZA OPTIMALNE SNAGE MODULA                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Kriterijum          │ 5 kW  │ 10 kW │ 15 kW │ 25 kW │ 50 kW       │
│  ────────────────────┼───────┼───────┼───────┼───────┼─────────────│
│  Težina (kg)         │  3-4  │  6-8  │ 10-12 │ 15-18 │   20-25     │
│  Jedan čovek nosi?   │  ✓✓   │  ✓✓   │   ✓   │   △   │     ✗       │
│  Hlađenje            │  Air  │  Air  │ Air/Liq│ Liquid│  Liquid     │
│  Razvoj (€)          │  15k  │  25k  │  35k  │  45k  │   60k+      │
│  BOM cost (€)        │  300  │  500  │  700  │ 1000  │  1500+      │
│  ────────────────────┼───────┼───────┼───────┼───────┼─────────────│
│  Za 150 kW treba:    │  30   │  15   │  10   │   6   │    3        │
│  Redundancija (N+1)  │ 3.3%  │ 6.7%  │  10%  │  17%  │   33%       │
│  ────────────────────┼───────┼───────┼───────┼───────┼─────────────│
│                                                                      │
│  OPTIMUM ──────────────────► 10 kW                                  │
│                                                                      │
│  • Dovoljno mali za jednu osobu                                     │
│  • Dovoljno velik da broj modula bude praktičan                     │
│  • Air cooling moguć (jednostavnije)                                │
│  • Nizak development cost                                            │
│  • Okrugao broj - laka matematika (×10 = snaga u kW)               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## EK10 - Osnovni Modul

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EK10 POWER MODUL                             │
│                    "Building Block of E-Mobility"                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌───────────────────────────────────────┐                         │
│   │  ┌─────────────────────────────────┐  │                         │
│   │  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │  ← Ventilacija          │
│   │  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  │                         │
│   │  └─────────────────────────────────┘  │                         │
│   │                                       │                         │
│   │   ●  ●  ○    [EK10]    ┌────────┐   │                         │
│   │  LED status            │ 10 kW  │   │                         │
│   │                        └────────┘   │                         │
│   │                                       │                         │
│   │   [AC IN]    [DC OUT]    [CAN]      │  ← Konektori            │
│   └───────────────────────────────────────┘                         │
│                                                                      │
│   Dimenzije: 250 × 200 × 120 mm (shoebox size)                      │
│   Težina: 6-8 kg                                                     │
│   Hlađenje: Forced air (2× 60mm fan)                                │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                         SPECIFIKACIJE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ULAZ (AC):                    IZLAZ (DC):                         │
│   ├── 230V 1-fazni ILI          ├── 50-500V DC                      │
│   ├── 400V 3-fazni              ├── max 25A                         │
│   ├── PF > 0.99                 ├── 10 kW kontinualno               │
│   └── THDi < 5%                 └── Ripple < 2%                     │
│                                                                      │
│   EFIKASNOST: > 95%             ZAŠTITE: OVP, OCP, OTP, GFD         │
│   KOMUNIKACIJA: CAN bus         HOT-SWAP: Da                        │
│                                                                      │
│   CENA (target):                                                     │
│   ├── BOM: ~€500                                                     │
│   ├── Prodajna: ~€1,200                                              │
│   └── vs konkurencija: 50-60% jeftinije                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Univerzalna Primena

### 1. Laka Električna Vozila

```
E-BICIKL / E-SKUTER / E-MOTOR
────────────────────────────────────────────────────────

   ┌─────┐
   │EK10 │ ──► 10 kW punjač
   └─────┘

   • Puni e-skuter za 30-60 min
   • Puni e-bicikl za 15-30 min
   • Idealno za sharing stanice
   • Zidna montaža, minimalan prostor

   SISTEM: EK-10
   Cena: ~€1,500 (sa kućištem)
```

### 2. Kućno Punjenje

```
KUĆNI PUNJAČ / WALLBOX
────────────────────────────────────────────────────────

   ┌─────┐ ┌─────┐
   │EK10 │ │EK10 │ ──► 20 kW punjač
   └─────┘ └─────┘

   • 20 kW = puni prosečan EV za 2-3 sata
   • Može i 1 modul (10 kW) za sporije punjenje
   • Upgradeable: dodaj modul kad treba više snage

   SISTEM: EK-20 (2 modula)
   Cena: ~€3,000
```

### 3. Javno AC Punjenje

```
DESTINATION CHARGER (Hoteli, Restorani, Parkovi)
────────────────────────────────────────────────────────

   ┌─────┐ ┌─────┐ ┌─────┐
   │EK10 │ │EK10 │ │EK10 │ ──► 22-30 kW
   └─────┘ └─────┘ └─────┘

   • 22 kW standard za javno AC punjenje
   • 3 modula, jedan stub
   • Ako jedan otkaže: 20 kW još radi (67%)

   SISTEM: EK-22 (3 modula)
   Cena: ~€4,500
```

### 4. DC Fast Charging - Automobili

```
DC FAST CHARGER (50-150 kW)
────────────────────────────────────────────────────────

   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
   │EK10 │ │EK10 │ │EK10 │ │EK10 │ │EK10 │
   └─────┘ └─────┘ └─────┘ └─────┘ └─────┘  ──► 50 kW

   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
   │EK10 │ │EK10 │ │EK10 │ │EK10 │ │EK10 │
   └─────┘ └─────┘ └─────┘ └─────┘ └─────┘
   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
   │EK10 │ │EK10 │ │EK10 │ │EK10 │ │EK10 │
   └─────┘ └─────┘ └─────┘ └─────┘ └─────┘  ──► 150 kW

   • Skalabilno: počni sa 50 kW, dodaj module kasnije
   • Redundancija: 1 od 15 = samo 6.7% gubitka
   • Servis: zameni modul za 2 minuta

   SISTEM: EK-50 do EK-150
   Cena: €8,000 - €22,000
```

### 5. Ultrabrzo Punjenje - Automobili

```
ULTRA-FAST CHARGER (250-350 kW)
────────────────────────────────────────────────────────

   ┌─────────────────────────────────────────────┐
   │  [EK10] [EK10] [EK10] [EK10] [EK10]        │
   │  [EK10] [EK10] [EK10] [EK10] [EK10]        │
   │  [EK10] [EK10] [EK10] [EK10] [EK10]        │ ──► 250 kW
   │  [EK10] [EK10] [EK10] [EK10] [EK10]        │
   │  [EK10] [EK10] [EK10] [EK10] [EK10]        │
   │                                             │
   │         25 modula = 250 kW                  │
   └─────────────────────────────────────────────┘

   • Puni EV od 10-80% za 15-20 min
   • Premium lokacije (autoputevi)

   SISTEM: EK-250 / EK-350
   Cena: €35,000 - €50,000
```

### 6. E-Bus Depot Charging

```
BUS DEPOT CHARGER (100-200 kW po priključku)
────────────────────────────────────────────────────────

          POWER CABINET                    DISPENSERS
   ┌─────────────────────────┐
   │ [EK10][EK10][EK10][EK10]│            ┌─────┐
   │ [EK10][EK10][EK10][EK10]│ ──────────►│BUS 1│
   │ [EK10][EK10][EK10][EK10]│            └─────┘
   │ [EK10][EK10][EK10][EK10]│            ┌─────┐
   │ [EK10][EK10][EK10][EK10]│ ──────────►│BUS 2│
   │ [EK10][EK10][EK10][EK10]│            └─────┘
   │ [EK10][EK10][EK10][EK10]│            ┌─────┐
   │ [EK10][EK10][EK10][EK10]│ ──────────►│BUS 3│
   │                         │            └─────┘
   │    32 modula = 320 kW   │
   │    Dynamic load sharing │
   └─────────────────────────┘

   • Noćno punjenje cele flote
   • Smart scheduling - puni kad je struja jeftina
   • Dynamic power sharing između buseva

   SISTEM: EK-DEPOT
   Cena: ~€45,000 (za 320 kW, 3 izlaza)
```

### 7. E-Bus Opportunity Charging

```
OPPORTUNITY / PANTOGRAPH (300-600 kW)
────────────────────────────────────────────────────────

   ┌───────────────────────────────────────────────────┐
   │                  POWER STATION                     │
   │                                                    │
   │  [EK10][EK10][EK10][EK10][EK10][EK10][EK10][EK10] │
   │  [EK10][EK10][EK10][EK10][EK10][EK10][EK10][EK10] │
   │  [EK10][EK10][EK10][EK10][EK10][EK10][EK10][EK10] │
   │  [EK10][EK10][EK10][EK10][EK10][EK10][EK10][EK10] │
   │  [EK10][EK10][EK10][EK10][EK10][EK10][EK10][EK10] │
   │  [EK10][EK10][EK10][EK10][EK10][EK10][EK10][EK10] │
   │                                                    │
   │           48 modula = 480 kW                       │
   └───────────────────────────────────────────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  PANTOGRAPH  │
                   │   CONTACT    │
                   └──────┬───────┘
                          │
                     ═════╧═════
                     [   BUS   ]

   • 5-8 min punjenje na terminalu
   • Ekstremna redundancija (2% gubitak po modulu)

   SISTEM: EK-PANTO
   Cena: ~€70,000 (480 kW)
```

### 8. E-Truck / Megawatt Charging

```
MEGAWATT CHARGING SYSTEM (MCS) - Do 1+ MW
────────────────────────────────────────────────────────

   ┌─────────────────────────────────────────────────────────────┐
   │                      POWER STATION                           │
   │  ┌─────────────────────────────────────────────────────┐    │
   │  │ RACK 1: [EK10]×20 = 200 kW                          │    │
   │  ├─────────────────────────────────────────────────────┤    │
   │  │ RACK 2: [EK10]×20 = 200 kW                          │    │
   │  ├─────────────────────────────────────────────────────┤    │
   │  │ RACK 3: [EK10]×20 = 200 kW                          │    │
   │  ├─────────────────────────────────────────────────────┤    │
   │  │ RACK 4: [EK10]×20 = 200 kW                          │    │
   │  ├─────────────────────────────────────────────────────┤    │
   │  │ RACK 5: [EK10]×20 = 200 kW                          │    │
   │  └─────────────────────────────────────────────────────┘    │
   │                                                              │
   │              100 modula = 1 MEGAWATT                        │
   └─────────────────────────────────────────────────────────────┘

   • Za električne kamione (Tesla Semi, etc.)
   • Budućnost teretnog transporta
   • MCS standard (CharIN)

   SISTEM: EK-MEGA
   Cena: ~€150,000 (1 MW)
```

### 9. Battery Swap Station

```
BATTERY SWAP (punjenje izvađenih baterija)
────────────────────────────────────────────────────────

   ┌─────────────────────────────────────────────────────────────┐
   │                   BATTERY STORAGE RACK                       │
   │                                                              │
   │   [BAT 1] [BAT 2] [BAT 3] [BAT 4] [BAT 5]                  │
   │      │       │       │       │       │                      │
   │      └───────┴───────┴───────┴───────┘                      │
   │                      │                                       │
   │         ┌────────────┴────────────┐                         │
   │         │     POWER CABINET       │                         │
   │         │                         │                         │
   │         │  [EK10][EK10][EK10]... │                         │
   │         │  (N modula po potrebi)  │                         │
   │         │                         │                         │
   │         │  Smart routing:         │                         │
   │         │  - Puni prazne baterije│                         │
   │         │  - Balansira opterećenje│                         │
   │         │  - Noćno=puno, dan=swap │                         │
   │         └─────────────────────────┘                         │
   └─────────────────────────────────────────────────────────────┘

   SISTEM: EK-SWAP
   Cena: Skalabilno po potrebi
```

## Prednosti Malog Modula

### 1. Servisiranje

```
TRADICIONALNO (50 kW modul)           ELEKTROKOMBINACIJA (10 kW)

Kvar modula = 50 kW manje             Kvar modula = 10 kW manje

┌────────────────────┐                ┌────────────────────┐
│   150 kW SISTEM    │                │   150 kW SISTEM    │
│                    │                │                    │
│  [50kW] [50kW] [X] │ = 100 kW      │ [10]×14 + [X]     │ = 140 kW
│                    │   (33% pad)    │                    │   (6.7% pad)
└────────────────────┘                └────────────────────┘

Zamena:                               Zamena:
• 20-25 kg modul                      • 6-8 kg modul
• 2 osobe potrebne                    • 1 osoba dovoljna
• Specijalni alat                     • Bez alata (quick-release)
• 30+ min downtime                    • 2-5 min downtime
• Rezervni deo: €4,000+               • Rezervni deo: €500
```

### 2. Terenska Podrška

```
SCENARIO: Punjač u selu, 100 km od servisa

TRADICIONALNO:
1. Dojava kvara
2. Dijagnostika (remote ili na licu mesta)
3. Narudžba dela (50 kW modul) - čeka se isporuka
4. Servisno vozilo + 2 tehničara
5. Demontaža starog (težak, nezgrapan)
6. Montaža novog
7. Testiranje
8. DOWNTIME: 2-7 dana

ELEKTROKOMBINACIJA:
1. Dojava kvara + automatska dijagnostika
2. Sistem identifikuje: "Modul #7 od 15 neispravan"
3. Sistem nastavlja rad sa 14 modula (93% kapaciteta)
4. Kurir donosi novi EK10 (6 kg paket)
5. Bilo ko može zameniti (plug & play)
6. DOWNTIME: 0 (sistem nikad nije bio offline)
```

### 3. Skalabilnost Poslovanja

```
RASTUĆI BIZNIS - Primer: Lokalni operater

Godina 1 (mali budžet):
├── Kupovina: 10× EK10 modula
├── Konfiguracija: 2× punjača po 50 kW
└── Investicija: ~€15,000

Godina 2 (rast potražnje):
├── Kupovina: +10× EK10 modula
├── Rekonfiguracija: 2× 100 kW ILI 4× 50 kW
└── Dodatna investicija: ~€12,000

Godina 3 (premium lokacija):
├── Kupovina: +15× EK10 modula
├── Konfiguracija: 1× 150 kW ultra-fast + 2× 100 kW
└── Sve sa istim modulima!

NEMA BACANJA OPREME - samo dodaješ module!
```

## Ekonomska Analiza

### Troškovi Razvoja

```
┌─────────────────────────────────────────────────────────────────────┐
│              UPOREDBA TROŠKOVA RAZVOJA                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Stavka                    │  50 kW modul  │  10 kW modul           │
│  ─────────────────────────┼───────────────┼────────────────────────│
│  Power electronics R&D     │    €25,000    │    €12,000             │
│  PCB dizajn & prototip     │    €10,000    │     €5,000             │
│  Firmware development      │    €15,000    │     €8,000             │
│  Mehanički dizajn          │     €8,000    │     €4,000             │
│  Termalni dizajn           │    €10,000    │     €3,000 (air cool)  │
│  EMC testiranje            │     €8,000    │     €5,000             │
│  Safety testiranje         │    €10,000    │     €6,000             │
│  Sertifikacija (CE)        │    €12,000    │     €8,000             │
│  Tooling (kalupovi, etc)   │    €15,000    │     €8,000             │
│  ─────────────────────────┼───────────────┼────────────────────────│
│  UKUPNO                    │   €113,000    │    €59,000             │
│                            │               │                        │
│  UŠTEDA:                   │               │    48% MANJE!          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Troškovi Proizvodnje

```
┌─────────────────────────────────────────────────────────────────────┐
│              EK10 BILL OF MATERIALS (qty 1000+)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Komponenta                         │  Cena (€)                     │
│  ──────────────────────────────────┼───────────────────────────────│
│  Poluprovodnici (MOSFETs, diode)    │     €120                      │
│  Gate driveri                       │      €30                      │
│  PFC induktor                       │      €40                      │
│  HF transformator                   │      €35                      │
│  DC link kondenzatori               │      €45                      │
│  Output filter                      │      €25                      │
│  EMI filter                         │      €30                      │
│  Kontroler (MCU + drivers)          │      €35                      │
│  Senzori (struja, napon, temp)      │      €20                      │
│  PCB (main + control)               │      €25                      │
│  Kućište + hlađenje                │      €40                      │
│  Ventilatori (2×)                   │      €10                      │
│  Konektori (AC, DC, CAN)            │      €25                      │
│  Montaža i testiranje               │      €30                      │
│  ──────────────────────────────────┼───────────────────────────────│
│  BOM TOTAL                          │     €510                      │
│  Overhead (15%)                     │      €77                      │
│  ──────────────────────────────────┼───────────────────────────────│
│  COGS                               │     €587                      │
│  Target margin (50%)                │     €587                      │
│  ──────────────────────────────────┼───────────────────────────────│
│  PRODAJNA CENA EK10                 │   ~€1,200                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

Poređenje sa konkurencijom (za 10 kW ekvivalent):
├── Delta:    ~€2,500
├── ABB:      ~€3,000
├── Siemens:  ~€2,800
└── EK10:     ~€1,200  ◄── 50-60% jeftinije!
```

### Cenovnik Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CENOVNIK EK SISTEMA                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Sistem      │ Modula │ Snaga   │  Naša cena │ Konkurencija        │
│  ───────────┼────────┼─────────┼────────────┼─────────────────────│
│  EK-10       │   1    │  10 kW  │   €1,500   │ N/A                 │
│  EK-22       │   3    │  22 kW  │   €4,500   │ €6,000-8,000        │
│  EK-50       │   5    │  50 kW  │   €8,000   │ €15,000-20,000      │
│  EK-100      │  10    │ 100 kW  │  €15,000   │ €30,000-40,000      │
│  EK-150      │  15    │ 150 kW  │  €22,000   │ €45,000-60,000      │
│  EK-250      │  25    │ 250 kW  │  €35,000   │ €70,000-90,000      │
│  EK-350      │  35    │ 350 kW  │  €48,000   │ €100,000-120,000    │
│  EK-PANTO    │  50    │ 500 kW  │  €70,000   │ €150,000+           │
│  EK-MEGA     │ 100    │  1 MW   │ €140,000   │ €300,000+           │
│                                                                      │
│  * Cene uključuju master controller i kućište                       │
│  * Pantograph/MCS konektor dodatno                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Tehnička Arhitektura

### EK10 Blok Dijagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EK10 MODUL                                   │
│                                                                      │
│  AC IN ────┐                                                        │
│  (230V/    │                                                        │
│   400V)    │                                                        │
│            ▼                                                        │
│      ┌──────────┐     ┌──────────┐     ┌──────────┐                │
│      │   EMI    │     │  PFC     │     │  DC/DC   │                │
│      │  Filter  │────►│  Stage   │────►│  Stage   │───► DC OUT     │
│      │          │     │(Totem    │     │ (LLC or  │    50-500V     │
│      └──────────┘     │ Pole)    │     │  Phase   │    max 25A     │
│                       └────┬─────┘     │ Shifted) │                │
│                            │           └────┬─────┘                │
│                            │                │                       │
│                       ┌────┴────────────────┴────┐                 │
│                       │      MCU CONTROLLER      │                 │
│                       │      (STM32G4 series)    │                 │
│                       │                          │                 │
│                       │  • PFC control loop      │                 │
│                       │  • DC/DC control loop    │                 │
│                       │  • Protections           │                 │
│                       │  • CAN communication     │                 │
│                       │  • Diagnostics           │                 │
│                       └────────────┬─────────────┘                 │
│                                    │                                │
│   CAN BUS ◄────────────────────────┘                               │
│   (ka Master Controlleru)                                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Master Controller

```
┌─────────────────────────────────────────────────────────────────────┐
│                      MASTER CONTROLLER                               │
│                     (Jedan po sistemu)                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌───────────────────────────────────────────────────────────┐    │
│   │                    CAN NETWORK                             │    │
│   │                                                            │    │
│   │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      ┌─────┐   │    │
│   │  │EK10 │ │EK10 │ │EK10 │ │EK10 │ │EK10 │ .... │EK10 │   │    │
│   │  │ #1  │ │ #2  │ │ #3  │ │ #4  │ │ #5  │      │ #N  │   │    │
│   │  └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘      └──┬──┘   │    │
│   │     └──────┴───────┴───────┴───────┴────────────┘       │    │
│   │                          │                               │    │
│   │                          ▼                               │    │
│   │                  ┌───────────────┐                       │    │
│   │                  │    MASTER     │                       │    │
│   │                  │  CONTROLLER   │                       │    │
│   │                  │               │                       │    │
│   │                  │ • Module mgmt │                       │    │
│   │                  │ • Load sharing│                       │    │
│   │                  │ • Fault mgmt  │                       │    │
│   │                  │ • Hot-swap    │                       │    │
│   │                  └───────────────┘                       │    │
│   │                          │                               │    │
│   └──────────────────────────┼───────────────────────────────┘    │
│                              │                                     │
│   ┌──────────────────────────┼───────────────────────────────┐    │
│   │              VEHICLE COMMUNICATION                        │    │
│   │                          │                                │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │    │
│   │  │  ISO 15118  │  │  CHAdeMO    │  │    CCS      │       │    │
│   │  │    (PLC)    │  │   (CAN)     │  │   (PWM)     │       │    │
│   │  └─────────────┘  └─────────────┘  └─────────────┘       │    │
│   └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│   ┌──────────────────────────────────────────────────────────┐    │
│   │              BACKEND COMMUNICATION                        │    │
│   │                                                           │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │    │
│   │  │  OCPP 2.0   │  │    4G/5G    │  │  Ethernet   │       │    │
│   │  └─────────────┘  └─────────────┘  └─────────────┘       │    │
│   └──────────────────────────────────────────────────────────┘    │
│                                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

## Fazni Razvoj

```
FAZA 1: EK10 PROTOTIP (4-6 meseci, €40,000)
────────────────────────────────────────────
├── Power electronics dizajn (10 kW)
├── PCB layout & fabrication
├── Firmware (basic control)
├── Lab testing & iteration
└── Deliverable: Funkcionalni EK10 prototip

FAZA 2: VALIDACIJA (3-4 meseca, €25,000)
────────────────────────────────────────────
├── Multi-modul testiranje (3-5 modula)
├── Master controller razvoj
├── CAN protokol finalizacija
├── Thermal/stress testing
└── Deliverable: Validirani sistem 30-50 kW

FAZA 3: SERTIFIKACIJA (4-6 meseci, €35,000)
────────────────────────────────────────────
├── EMC testiranje i optimizacija
├── Safety (IEC 61851, IEC 62368)
├── CE marking
├── Production tooling
└── Deliverable: CE sertifikovan EK10

FAZA 4: PILOT (6 meseci, €50,000)
────────────────────────────────────────────
├── Proizvodnja: 50-100 modula
├── Pilot instalacije (5-10 lokacija)
├── Field testing i feedback
├── Iteracija dizajna
└── Deliverable: Market-ready proizvod

UKUPNA INVESTICIJA: ~€150,000
(vs €300,000+ za tradicionalni pristup)
```

## Zaključak

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   ELEKTROKOMBINACIJA = LEGO PRINCIP ZA EV PUNJAČE                   │
│                                                                      │
│   ┌──────┐                                                          │
│   │ EK10 │  ×  N  =  Bilo koja snaga                               │
│   └──────┘                                                          │
│                                                                      │
│   ✓ Jedan proizvod za celo tržište                                  │
│   ✓ 50-60% jeftinije od konkurencije                               │
│   ✓ Lako servisiranje (1 osoba, 2 minuta)                          │
│   ✓ Nula downtime (N+1 redundancija)                               │
│   ✓ Skalabilno od 10 kW do 1+ MW                                   │
│   ✓ Manji inicijalni razvoj (€150k vs €300k+)                      │
│   ✓ Brži time-to-market                                             │
│                                                                      │
│   OD E-BICIKLA DO MEGAWATT KAMIONA - JEDAN MODUL!                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```
