# EK3 Rack Sistem: Jedan Modul za Sve

## Filozofija: Radikalna Modularnost

```
TRADICIONALNI PRISTUP:              ELEKTROKOMBINACIJA:
════════════════════════════════════════════════════════════════
Mali punjač = mali modul            Mali punjač = 1 × EK3
Srednji punjač = srednji modul      Srednji punjač = 10 × EK3
Veliki punjač = veliki modul        Veliki punjač = 100 × EK3
MCS punjač = ogroman modul          MCS punjač = 1000 × EK3

Rezultat: 4+ različita dizajna      Rezultat: JEDAN dizajn za sve
```

### Zašto je Ovo Revolucionarno?

```
1. MASOVNA PROIZVODNJA
   • Jedan modul, milionski tiraž
   • Cena pada eksponencijalno
   • Kvalitet raste (više iteracija)

2. UNIVERZALNI INVENTORY
   • Jedna SKU za sve primene
   • Swap stanica: 20 modula pokriva SVE
   • Logistics: jedan tip kutije

3. GRANULARNA POUZDANOST
   • 1000 modula, 1 otkaže = 0.1% gubitak
   • vs tradicionalno: 1 od 10 otkaže = 10% gubitak
   • "Graceful degradation" umesto "total failure"

4. DEMOKRATIZACIJA SNAGE
   • Isti modul u skuteru i u MCS stanici
   • Vlasnik skutera i fleet operator koriste ISTU tehnologiju
```

---

## EK3 Modul: Fizički Dizajn za Rack Mounting

### Dimenzije i Form Factor

```
EK3 MODUL - BLADE FORMAT
════════════════════════════════════════════════════════════════

POGLED ODOZGO:
┌─────────────────────────────────┐
│  ○ GRIP    ┌─────────┐  GRIP ○ │
│            │   FAN   │         │  Širina: 100mm (fits 4 per 19" row)
│  ┌──────┐  └─────────┘  ┌────┐ │  Dubina: 300mm
│  │ SiC  │               │CTRL│ │  Visina: 1U (44.45mm)
│  │POWER │  ┌─────────┐  │    │ │
│  │STAGE │  │HEATSINK │  │NPU │ │  Masa: 1.8 kg
│  └──────┘  │ + VAPOR │  └────┘ │
│            │ CHAMBER │         │  Snaga: 3 kW
│  ┌──────┐  └─────────┘  ┌────┐ │
│  │ PFC  │               │ DC │ │  Efikasnost: >97%
│  │      │               │FUSE│ │
│  └──────┘               └────┘ │
│                                │
│  [====== RAIL GUIDES ======]   │
└─────────────────────────────────┘

POGLED SA STRANE:
┌────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ 44.45mm (1U)
└────────────────────────────────────────┘
          300mm dubina
```

### Konektor Panel (Zadnja Strana)

```
BACKPLANE KONEKTOR - ACTIVE MATING
════════════════════════════════════════════════════════════════

┌─────────────────────────────────────┐
│                                     │
│   ┌─────┐  ┌─────┐  ┌─────┐       │
│   │DC IN│  │DC OUT│ │ GND │       │
│   │ +   │  │  +   │ │     │       │
│   │400V │  │ 50-  │ │     │       │
│   │ 10A │  │500V  │ │     │       │
│   └─────┘  └─────┘  └─────┘       │
│      POWER (Anderson SBS50)        │
│                                     │
│   ┌───────────────────────┐        │
│   │    DATA CONNECTOR     │        │
│   │    (48-pin blade)     │        │
│   │    • CAN-FD           │        │
│   │    • Ethernet         │        │
│   │    • I2C (sensors)    │        │
│   │    • PWM sync         │        │
│   └───────────────────────┘        │
│                                     │
│        ◉ STATUS LED                 │
│        (RGB: G=OK, Y=Warn, R=Fail) │
│                                     │
│   [■■■■■■■ ALIGNMENT RAIL ■■■■■■]  │
└─────────────────────────────────────┘

INSERTION FORCE: <20N (robot-friendly)
MATING CYCLES: >50,000
```

---

## Rack Layout: 19" Standard

### Jedan Rack = 84 Modula = 252 kW

```
19" RACK - FRONT VIEW (84 × EK3 = 252 kW)
════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│  ┌──────┬──────┬──────┬──────┐  │ U42: 12 kW              │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │ U41: 12 kW              │
│  ├──────┼──────┼──────┼──────┤  │ U40: 12 kW              │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │ ...                     │
│  ├──────┼──────┼──────┼──────┤  │                         │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │ POWER SECTION           │
│  ├──────┼──────┼──────┼──────┤  │ 21 rows × 4 modules     │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │ = 84 modules            │
│  ├──────┼──────┼──────┼──────┤  │ = 252 kW                │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │                         │
│  ├──────┼──────┼──────┼──────┤  │                         │
│  │      ...  (21 rows)  ...  │  │                         │
│  ├──────┼──────┼──────┼──────┤  │                         │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │ U2: 12 kW               │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │ U1: 12 kW               │
│  └──────┴──────┴──────┴──────┘  │                         │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────┐  │                         │
│  │     BACKPLANE CONTROLLER   │  │ CONTROL SECTION        │
│  │     • Power distribution   │  │ 3U height              │
│  │     • CAN-FD hub           │  │                         │
│  │     • AI Edge processor    │  │                         │
│  │     • Ethernet switch      │  │                         │
│  └────────────────────────────┘  │                         │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────┐  │                         │
│  │     DC BUS DISTRIBUTION    │  │ POWER INPUT            │
│  │     • Input: 400V AC 3-ph  │  │ 3U height              │
│  │     • DC Bus: 800V         │  │                         │
│  │     • Protection/Fusing    │  │                         │
│  └────────────────────────────┘  │                         │
└─────────────────────────────────────────────────────────────┘

UKUPNO: 42U rack
• 36U za module (84 × EK3)
• 3U za kontroler
• 3U za napajanje

DIMENZIJE RACK-a:
• Širina: 600mm
• Dubina: 1000mm
• Visina: 2000mm
• Masa (pun): ~250 kg
```

---

## Skaliranje: Od 3 kW do 3 MW

```
KONFIGURACIJE:
════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│  USE CASE          │ MODULA │ RACK-OVA │  SNAGA  │ FOOTPRINT│
├────────────────────┼────────┼──────────┼─────────┼──────────┤
│  E-bike charger    │    1   │    -     │   3 kW  │  0.01 m² │
│  Home charger      │   3-7  │    -     │  9-21kW │  0.05 m² │
│  Destination 22kW  │    8   │  Mini    │  24 kW  │  0.2 m²  │
│  DC Fast 50kW      │   17   │  Half    │  51 kW  │  0.3 m²  │
│  DC Fast 150kW     │   50   │    1     │ 150 kW  │  0.6 m²  │
│  Highway 350kW     │  117   │    2     │ 351 kW  │  1.2 m²  │
│  Bus Depot 500kW   │  167   │    2     │ 501 kW  │  1.2 m²  │
│  Bus Opp. 750kW    │  250   │    3     │ 750 kW  │  1.8 m²  │
│  Truck Depot 1MW   │  334   │    4     │   1 MW  │  2.4 m²  │
│  MCS Station 2MW   │  667   │    8     │   2 MW  │  4.8 m²  │
│  MCS Station 3MW   │ 1000   │   12     │   3 MW  │  7.2 m²  │
└─────────────────────────────────────────────────────────────┘
```

### Vizualizacija: 1 MW Stanica (4 Rack-a)

```
1 MW CHARGING STATION - TOP VIEW
════════════════════════════════════════════════════════════════

            2.4m
    ┌─────────────────────┐
    │                     │
    │  ┌─────┐  ┌─────┐  │
    │  │RACK │  │RACK │  │      RACK 1-2: 168 modula = 504 kW
    │  │  1  │  │  2  │  │
    │  │     │  │     │  │
    │  └─────┘  └─────┘  │
    │                     │      1m
    │  ┌─────┐  ┌─────┐  │
    │  │RACK │  │RACK │  │      RACK 3-4: 168 modula = 504 kW
    │  │  3  │  │  4  │  │
    │  │     │  │     │  │
    │  └─────┘  └─────┘  │
    │                     │
    │  ┌───────────────┐  │
    │  │   ROBOT ARM   │  │      KUKA/UR robot na šini
    │  │   ═══════════ │  │
    │  └───────────────┘  │
    │                     │
    └─────────────────────┘

    TOTAL: 336 modula = 1,008 kW
    FOOTPRINT: 2.4 × 2.5m = 6 m²
```

---

## Robot Swap Sistem

### Robot Specifikacije

```
ROBOT ZA EK3 SWAP
════════════════════════════════════════════════════════════════

TIP: Collaborative robot (cobot) na linearnoj šini
PREPORUKA: Universal Robots UR10e ili KUKA LBR iiwa 14

SPECIFIKACIJE:
• Payload: 10 kg (EK3 = 1.8 kg, plus gripper)
• Reach: 1.3m
• Repeatability: ±0.05mm
• Speed: Do 1 m/s (bezbedno)

LINEAR RAIL:
• Dužina: Po potrebi (2-10m za velike instalacije)
• Tip: Igus DryLin ili Bosch Rexroth
• Pozicioniranje: ±0.1mm

GRIPPER:
• Tip: Custom pneumatski ili električni
• Hvata EK3 za robot grip points
• Senzori: Force feedback + proximity
```

### Swap Sekvenca

```
ROBOT SWAP WORKFLOW (1 modul)
════════════════════════════════════════════════════════════════

VREME    AKCIJA
─────────────────────────────────────────────────────────────
T+0s     AI identifikuje modul za zamenu: Rack 2, Row 15, Slot 3
T+2s     Robot prima komandu, planira putanju
T+5s     Robot se pozicionira ispred rack-a
T+8s     Robot hvata modul (grip engagement)
T+10s    Robot izvlači modul (300mm izvlačenje)
T+15s    Robot se okreće ka "OUT" poziciji
T+18s    Robot odlaže modul u "defective" bin
T+22s    Robot se pozicionira kod "fresh module" storage
T+25s    Robot hvata novi modul
T+28s    Robot se vraća na Rack 2, Row 15, Slot 3
T+32s    Robot insertuje modul (alignment + push)
T+35s    Modul se zaključava (cam lock engagement)
T+38s    Backplane handshake - modul ONLINE
T+40s    Robot se vraća u home poziciju
─────────────────────────────────────────────────────────────
TOTAL: 40 sekundi za kompletan swap

ZA 10 MODULA (batch replacement): ~5 minuta
ZA 50 MODULA (major service): ~25 minuta
```

### Multi-Robot za Velike Instalacije

```
3 MW STANICA (1000 modula, 12 rack-ova)
════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   R1   R2   R3   R4   R5   R6   R7   R8   R9   R10  R11 R12│
│   ┌┐   ┌┐   ┌┐   ┌┐   ┌┐   ┌┐   ┌┐   ┌┐   ┌┐   ┌┐   ┌┐  ┌┐│
│   ││   ││   ││   ││   ││   ││   ││   ││   ││   ││   ││  │││
│   ││   ││   ││   ││   ││   ││   ││   ││   ││   ││   ││  │││
│   └┘   └┘   └┘   └┘   └┘   └┘   └┘   └┘   └┘   └┘   └┘  └┘│
│   ═══════════════════════════════════════════════════════  │
│              LINEAR RAIL (10m)                              │
│                    │                                        │
│              ┌─────┴─────┐                                  │
│              │  ROBOT 1  │                                  │
│              └───────────┘                                  │
│                                                             │
│   ═══════════════════════════════════════════════════════  │
│              LINEAR RAIL (10m) - druga strana              │
│                    │                                        │
│              ┌─────┴─────┐                                  │
│              │  ROBOT 2  │                                  │
│              └───────────┘                                  │
│                                                             │
│   MODULE STORAGE:                                           │
│   ┌──────────────────────────────────────────────────────┐ │
│   │  FRESH: 50 modula    │    DEFECTIVE: 20 slots       │ │
│   └──────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘

2 ROBOTA RADE PARALELNO:
• Robot 1: Rack 1-6 (gornja šina)
• Robot 2: Rack 7-12 (donja šina)
• Kapacitet: 100+ swap-ova po satu
```

---

## Pouzdanost: Matematika Modularnosti

### Uporedba: 10 velikih vs 1000 malih modula

```
SCENARIO: 1 MW punjač, 10 godina rada
════════════════════════════════════════════════════════════════

TRADICIONALNO (10 × 100kW modula):
─────────────────────────────────────────────────
• MTBF po modulu: 100,000 h
• Verovatnoća kvara jednog modula/god: ~8%
• Kada 1 otkaže: GUBITAK 10% KAPACITETA
• Popravka: Tehničar, 2-5 dana

ELEKTROKOMBINACIJA (334 × 3kW modula):
─────────────────────────────────────────────────
• MTBF po modulu: 100,000 h
• Verovatnoća kvara jednog modula/god: ~8%
• Ali: Očekivanih ~27 kvarova/god (statistički)
• Kada 1 otkaže: GUBITAK 0.3% KAPACITETA
• Popravka: Robot, 40 sekundi

MATEMATIKA DOSTUPNOSTI:
─────────────────────────────────────────────────
Tradicionalno:
• 1 kvar = 10% degradacija dok ne dođe tehničar
• Očekivano 1-2 kvara godišnje
• Svaki kvar = 2-5 dana na 90% kapaciteta
• Godišnja dostupnost: ~98%

ELEKTROKOMBINACIJA:
• 27 kvarova godišnje, ali svaki = 0.3% gubitak
• Robot zameni za 40 sec
• Sistem NIKAD ispod 99% kapaciteta
• Godišnja dostupnost: >99.9%
```

### Graceful Degradation Vizualizacija

```
KAPACITET TOKOM VREMENA:
════════════════════════════════════════════════════════════════

TRADICIONALNO (10 modula):
100%|████████████████████████████████████████
 90%|                    ████████████████████ ← 1 modul otkaže
 80%|                                     ████ ← 2 modula
    └────────────────────────────────────────→ vreme
           ↑ kvar            ↑ kvar

ELEKTROKOMBINACIJA (334 modula):
100%|████████████████████████████████████████
99.7|█████████████████████████████████████▓▓▓ ← 1 otkaže
99.4|█████████████████████████████████████▓▓▓ ← 2 otkaže
99% |█████████████████████████████████████▓▓▓ ← 3 otkaže
    └────────────────────────────────────────→ vreme
    Praktično NEMA VIDLJIVOG PADA jer robot stalno menja!
```

---

## Inspiracija: 3PAR Storage Arhitektura

### Šta je 3PAR?

```
3PAR (sada HPE Primera/Alletra) je revolucionisao storage industriju
sličnim pristupom - radikalnom modularnosti na nivou najmanje jedinice.

Umesto da koristi cele diskove kao gradivne elemente, 3PAR deli
diskove na "chunklete" od 1GB i distribuira podatke preko SVIH diskova.

Isti princip primenjujemo na power electronics!
```

### Mapiranje Koncepata: Storage → Punjači

```
3PAR KONCEPT           STORAGE                 EK3 PRIMENA
═══════════════════════════════════════════════════════════════════

CHUNKLETS              1GB blokovi umesto      EK3 = 3kW "chunklet"
                       celih diskova           snage

WIDE STRIPING          Podaci preko SVIH       Opterećenje preko SVIH
                       diskova, ne samo 2-3    modula, ne samo potrebnih

THIN PROVISIONING      Kapacitet se alocira    Moduli "spavaju" dok
                       tek kad treba           nisu potrebni

AUTONOMIC              Dodaj/ukloni disk →     Dodaj/ukloni modul →
REBALANCING            auto redistribucija     auto redistribucija

DISTRIBUTED            Spare kapacitet         Nema "hot spare" modula
SPARING                raspoređen, ne          - spare je distribuiran
                       dedicirani hot-spare    u svakom modulu

MESH-ACTIVE            Svi kontroleri          Swarm - svi moduli
                       aktivni, nema mastera   ravnopravni, nema mastera

RAPID REBUILD          Rebuild sa SVIH         Recovery load sa SVIH
                       diskova paralelno       modula paralelno
```

### Distributed Sparing: Ključna Inovacija

```
TRADICIONALNI "HOT SPARE":
═══════════════════════════════════════════════════════════════════

┌─────┬─────┬─────┬─────┬─────┬─────┐
│100% │100% │100% │100% │100% │  0% │  ← Spare sedi, ne radi ništa
└─────┴─────┴─────┴─────┴─────┴─────┘
  M1    M2    M3    M4    M5   SPARE

• Spare modul: Hladan, netestiran, troši prostor
• Kvar M3 → SPARE preuzima 100% odmah
• Ali: Spare je bio neaktivan - možda i on ima problem?
• Posle jednog kvara: Nema više spare-a!


3PAR / EK3 DISTRIBUTED SPARING:
═══════════════════════════════════════════════════════════════════

┌─────┬─────┬─────┬─────┬─────┬─────┐
│ 83% │ 83% │ 83% │ 83% │ 83% │ 83% │  ← Svi rade, svi imaju rezervu
└─────┴─────┴─────┴─────┴─────┴─────┘
  M1    M2    M3    M4    M5    M6

• Nema "spare" modula - SPARE KAPACITET je distribuiran
• Svi moduli aktivni = svi testirani u produkciji
• Kvar M3 → Preostalih 5 ide sa 83% na 100%
• Posle jednog kvara: JOŠ UVEK ima rezerve za sledeći!
```

### Praktičan Primer: 100kW Sistem

```
100kW SISTEM SA 10% REZERVE:
═══════════════════════════════════════════════════════════════════

TRADICIONALNO (Hot Spare):
────────────────────────────────────────
34 modula × 3kW = 102kW aktivno
 + 4 spare modula × 3kW = 12kW neaktivno (čeka)
═══════════════════════════════════════
38 modula ukupno, ali 4 NE RADE

• Spare troši prostor, struju za standby, ali ne doprinosi
• Posle 4 kvara: NEMA VIŠE REZERVE


EK3/3PAR (Distributed Sparing):
────────────────────────────────────────
38 modula × 3kW = 114kW potencijal
Rade na 88% = 100kW isporučeno
═══════════════════════════════════════
38 modula ukupno, SVI RADE

Kvar 1 modula → 37 × 3kW × 92% = 102kW ✓
Kvar 2 modula → 36 × 3kW × 95% = 102kW ✓
Kvar 3 modula → 35 × 3kW × 97% = 102kW ✓
Kvar 4 modula → 34 × 3kW × 100% = 102kW ✓

GRACEFUL DEGRADATION do 34 modula pre nego što padne ispod 100kW!
```

### Wide Striping: Ravnomerno Starenje

```
TRADICIONALNO - Koncentrisano Opterećenje:
═══════════════════════════════════════════════════════════════════

Potrebno 100kW od 300kW sistema:

┌─────┬─────┬─────┬─────┬─────┬─────┐
│100% │100% │100% │100% │ 0%  │ 0%  │  ← 4 rade na max, 2 spavaju
└─────┴─────┴─────┴─────┴─────┴─────┘
  M1    M2    M3    M4    M5    M6

Problem: M1-M4 stare brže, M5-M6 uopšte ne rade
Posle 5 godina: M1-M4 pred kraj života, M5-M6 kao novi


EK3/3PAR - Wide Striping:
═══════════════════════════════════════════════════════════════════

Potrebno 100kW od 300kW sistema:

┌─────┬─────┬─────┬─────┬─────┬─────┐
│ 33% │ 33% │ 33% │ 33% │ 33% │ 33% │  ← Svi rade podjednako
└─────┴─────┴─────┴─────┴─────┴─────┘
  M1    M2    M3    M4    M5    M6

Prednosti:
• Ravnomerno starenje svih modula
• Niža temperatura (manje opterećenje po modulu)
• Duži životni vek sistema
• Predvidljiviji maintenance
```

### Thin Provisioning: Dinamička Alokacija

```
THIN PROVISIONING ZA POWER:
═══════════════════════════════════════════════════════════════════

USE CASE: Punjač koji podržava 350kW ali retko treba toliko

TRADICIONALNO:
• Sve komponente dimenzionisane za 350kW
• 90% vremena koristi se 50kW
• Efikasnost pada pri malom opterećenju

EK3/3PAR:
• 117 modula instalirana (351kW potencijal)
• Pri 50kW: Samo 17 modula aktivno, ostali u sleep
• Pri 200kW: 67 modula aktivno
• Pri 350kW: Svih 117 aktivno

Prednosti:
• Svaki aktivan modul radi na optimalnom opterećenju
• Neaktivni moduli: Minimalna potrošnja
• Efikasnost >97% bez obzira na load
```

### Zaključak: Dokazani Koncept

```
3PAR JE DOKAZAO DA OVO RADI:
═══════════════════════════════════════════════════════════════════

• 2002: 3PAR uvodi chunklet arhitekturu
• Storage industrija: "Nemoguće, previše kompleksno"
• 2010: HP kupuje 3PAR za $2.35 milijarde
• 2024: HPE Primera/Alletra - industrijski standard

ISTA LOGIKA ZA EV PUNJAČE:
• Umesto chunklet-a: EK3 modul (3kW)
• Umesto wide striping: Load distribution preko svih modula
• Umesto thin provisioning: Sleep mode za neaktivne module
• Umesto distributed sparing: Rezerva u svakom modulu, ne hot-spare

AKO RADI ZA STORAGE, RADI I ZA POWER ELECTRONICS!
```

---

## Ekonomija: Zašto je Jeftinije

### Cost Breakdown

```
COST ANALYSIS: 1 MW SISTEM
════════════════════════════════════════════════════════════════

TRADICIONALNO (10 × 100kW specijalizovanih modula):
─────────────────────────────────────────────────
100kW modul (custom dizajn):     €8,000 × 10 = €80,000
Rack/enclosure (custom):                       €15,000
Control system:                                €10,000
Installation:                                  €10,000
─────────────────────────────────────────────────
TOTAL:                                        €115,000

ELEKTROKOMBINACIJA (334 × EK3 mass-produced):
─────────────────────────────────────────────────
EK3 modul (@10k volume):           €150 × 334 = €50,100
Standard 19" racks (4×):            €2,000 × 4 = €8,000
Backplanes (4×):                    €1,000 × 4 = €4,000
Control system (standardni):                   = €5,000
Robot arm (amortizovan):            €30,000/10 = €3,000
Installation:                                  = €5,000
─────────────────────────────────────────────────
TOTAL:                                         €75,100

UŠTEDA: 35%!

PLUS:
• Maintenance cost: -70% (robot vs tehničar)
• Spare parts inventory: -80% (jedan tip modula)
• Downtime cost: -90% (40 sec vs 2-5 dana)
```

### Economies of Scale

```
EK3 CENA vs KOLIČINA:
════════════════════════════════════════════════════════════════

GODIŠNJA PROIZVODNJA     CENA PO MODULU     NAPOMENA
─────────────────────────────────────────────────────────────
1,000 modula             €300               Prototip/pilot
10,000 modula            €150               Mala serija
100,000 modula           €80                Srednja serija
1,000,000 modula         €50                Masovna proizvodnja

SA 1M MODULA GODIŠNJE:
• 1 MW stanica = 334 × €50 = €16,700 za module!
• Plus rack/control = ~€35,000 TOTAL za 1 MW sistem
• To je €35/kW (industrija: €100-150/kW)
```

---

## Integracija sa Swap Station

```
SWAP STATION + RACK SISTEM
════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                    SWAP STATION                             │
│                                                             │
│   BUS LANE                                                  │
│   ════════════════════════════════════════                  │
│          │                                                  │
│   ┌──────┴──────┐                                          │
│   │    BUS      │      BATTERY SWAP AREA                   │
│   └─────────────┘                                          │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │              CHARGING RACK AREA                      │  │
│   │   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                  │  │
│   │   │RACK1│ │RACK2│ │RACK3│ │RACK4│   1 MW           │  │
│   │   │ 84  │ │ 84  │ │ 84  │ │ 84  │   336 EK3        │  │
│   │   └─────┘ └─────┘ └─────┘ └─────┘                  │  │
│   │         ══════════════════════                      │  │
│   │              ROBOT RAIL                              │  │
│   │              ┌──────┐                               │  │
│   │              │ROBOT │                               │  │
│   │              └──────┘                               │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   WORKFLOW:                                                 │
│   1. Bus dolazi → Battery swap robot menja bateriju        │
│   2. ISTOVREMENO: EK3 robot menja module koji treba        │
│   3. Bus odlazi, charging sistem 100%                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Zaključak: Zašto EK3-Only Arhitektura Pobeđuje

```
SUMMARY:
════════════════════════════════════════════════════════════════

✓ JEDAN DIZAJN za sve - od 3 kW do 3 MW
✓ MASOVNA PROIZVODNJA - cena pada, kvalitet raste
✓ GRANULARNA POUZDANOST - 0.3% gubitak po kvaru, ne 10%
✓ ROBOT ZAMENA - 40 sekundi, ne 2-5 dana
✓ UNIVERSAL INVENTORY - jedan tip rezervnog dela
✓ GRACEFUL DEGRADATION - sistem nikad "pao"
✓ NIŽA CENA - 35%+ ušteda na hardveru
✓ CIRCULAR ECONOMY - moduli se popravljaju i vraćaju

OVO JE NOVA PARADIGMA:
Ne "koliko kW po modulu" nego "koliko modula po kW"
```

---

## Sledeći Koraci

1. **Detaljan dizajn EK3 modula** za rack mounting
2. **Backplane specifikacija** - power + data distribution
3. **Robot gripper dizajn** - custom za EK3
4. **Thermal analysis** - 84 modula u jednom rack-u
5. **Pilot rack** - 1 rack = 84 modula = 252 kW demo

---

## Datum

Kreirano: Januar 2026
Status: Koncept
