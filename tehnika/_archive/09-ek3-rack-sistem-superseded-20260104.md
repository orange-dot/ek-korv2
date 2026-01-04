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
EK3 MODUL - 1U HALF-WIDTH (telecom stil)
════════════════════════════════════════════════════════════════

POGLED ODOZGO:
┌─────────────────────────────────────────────────────┐
│  ○ GRIP    ┌─────────────┐              GRIP ○     │
│            │    FAN      │                         │  Širina: 200mm (1U half-width)
│  ┌──────┐  └─────────────┘  ┌────────┐            │  Dubina: 320mm
│  │ SiC  │                   │  CTRL  │            │  Visina: 44mm (1U)
│  │POWER │  ┌─────────────┐  │STM32G4 │            │
│  │STAGE │  │  HEATSINK   │  │        │            │  Masa: 3.5 kg
│  │ LLC  │  │  + VAPOR    │  │ CAN-FD │            │
│  │ 900V │  │   CHAMBER   │  └────────┘            │  Snaga: 3.3 kW (3.6 kW peak)
│  └──────┘  └─────────────┘  ┌────────┐            │
│                             │  DC    │            │  Efikasnost: >96% peak
│  ┌────────────────────────┐ │  FUSE  │            │               >94% @ 50%
│  │   PLANAR TRANSFORMER   │ └────────┘            │
│  └────────────────────────┘                       │
│  [============= RAIL GUIDES ===============]      │
└─────────────────────────────────────────────────────┘

POGLED SA STRANE:
┌────────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ 44mm (1U)
└────────────────────────────────────────────┘
          320mm dubina
```

### Konektor Panel (Zadnja Strana)

```
BACKPLANE KONEKTOR - BLIND-MATE DESIGN
════════════════════════════════════════════════════════════════

┌─────────────────────────────────────┐
│                                     │
│   ┌─────┐  ┌─────┐  ┌─────┐       │
│   │DC IN│  │DC OUT│ │ GND │       │  POWER CONTACTS:
│   │ +   │  │  +   │ │     │       │  • Sequenced mating
│   │650V │  │ 50-  │ │     │       │  • First: GND
│   │ 10A │  │500V  │ │     │       │  • Last: DC IN/OUT
│   └─────┘  └─────┘  └─────┘       │
│      POWER (Anderson SBS50)        │
│                                     │
│   ┌───────────────────────┐        │
│   │    DATA CONNECTOR     │        │
│   │     (20-pin)          │        │  SIGNALS (20-pin):
│   │    • CAN-FD H/L       │        │  • 2× CAN-FD
│   │    • I2C (sensors)    │        │  • 2× I2C
│   │    • PWM sync         │        │  • 4× PWM/Sync
│   │    • Module ID        │        │  • 4× GPIO/Status
│   └───────────────────────┘        │  • 8× Reserved
│                                     │
│        ◉ STATUS LED                 │
│        (RGB: G=OK, Y=Warn, R=Fail) │
│                                     │
│   [■■■■■■■ ALIGNMENT RAIL ■■■■■■]  │
└─────────────────────────────────────┘

INSERTION FORCE: <20N (robot-friendly)
MATING CYCLES: >50,000
HOT-SWAP TIME: <1 second electrical disconnect
```

---

## Rack Layout

> **NAPOMENA:** Razmatramo custom rack dizajn umesto standardnog 19" formata
> zbog termalnih izazova pri visokoj gustini snage. Videti sekciju "Custom Rack Koncept" ispod.

### Referentna konfiguracija: 84 Modula = 277 kW

```
CUSTOM RACK - FRONT VIEW (84 × EK3 = 277 kW)
════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│  ┌──────┬──────┬──────┬──────┐  │ Row 21: 13.2 kW         │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │ Row 20: 13.2 kW         │
│  ├──────┼──────┼──────┼──────┤  │ Row 19: 13.2 kW         │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │ ...                     │
│  ├──────┼──────┼──────┼──────┤  │                         │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │ POWER SECTION           │
│  ├──────┼──────┼──────┼──────┤  │ 21 rows × 4 modules     │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │ = 84 modules            │
│  ├──────┼──────┼──────┼──────┤  │ = 277.2 kW              │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │                         │
│  ├──────┼──────┼──────┼──────┤  │                         │
│  │      ...  (21 rows)  ...  │  │                         │
│  ├──────┼──────┼──────┼──────┤  │                         │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │ Row 2: 13.2 kW          │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │ Row 1: 13.2 kW          │
│  └──────┴──────┴──────┴──────┘  │                         │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────┐  │                         │
│  │     BACKPLANE CONTROLLER   │  │ CONTROL SECTION        │
│  │     • Power distribution   │  │ Custom height          │
│  │     • CAN-FD hub @ 5 Mbps  │  │                         │
│  │     • AI Edge processor    │  │                         │
│  │     • Ethernet switch      │  │                         │
│  └────────────────────────────┘  │                         │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────┐  │                         │
│  │     CENTRAL PFC            │  │ POWER INPUT            │
│  │     • Input: 400V AC 3-ph  │  │ Custom height          │
│  │     • DC Bus: 650V         │  │                         │
│  │     • Protection/Fusing    │  │                         │
│  └────────────────────────────┘  │                         │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────┐  │                         │
│  │     THERMAL MANAGEMENT     │  │ COOLING                │
│  │     • Front-to-back airflow│  │ Integrated plenum      │
│  │     • Shared plenum        │  │                         │
│  │     • Filter + fans        │  │                         │
│  └────────────────────────────┘  │                         │
└─────────────────────────────────────────────────────────────┘

UKUPNO: Custom rack (ne 19" standard)
• Module section: 84 × EK3 @ 3.3kW = 277 kW
• Kontroler + CAN-FD hub
• Centralni PFC (AC/DC)
• Integrisano hlađenje (plenum)

DIMENZIJE RACK-a (TBD nakon termalnog modelovanja):
• Širina: ~900mm (za 4× 200mm modula + spacing)
• Dubina: ~500mm (modul 320mm + airflow)
• Visina: ~1200mm
• Masa (pun): ~350 kg
```

---

## Skaliranje: Od 3.3 kW do 3 MW

```
KONFIGURACIJE (EK3 @ 3.3 kW):
════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│  USE CASE          │ MODULA │ RACK-OVA │  SNAGA  │ FOOTPRINT│
├────────────────────┼────────┼──────────┼─────────┼──────────┤
│  E-bike charger    │    1   │    -     │  3.3 kW │  0.01 m² │
│  Home charger      │   3-7  │    -     │ 10-23kW │  0.05 m² │
│  Destination 22kW  │    7   │  Mini    │  23 kW  │  0.2 m²  │
│  DC Fast 50kW      │   16   │  Half    │  53 kW  │  0.3 m²  │
│  DC Fast 150kW     │   46   │    1     │ 152 kW  │  0.6 m²  │
│  Highway 350kW     │  106   │    2     │ 350 kW  │  1.2 m²  │
│  Bus Depot 500kW   │  152   │    2     │ 502 kW  │  1.2 m²  │
│  Bus Opp. 750kW    │  228   │    3     │ 752 kW  │  1.8 m²  │
│  Truck Depot 1MW   │  303   │    4     │   1 MW  │  2.4 m²  │
│  MCS Station 2MW   │  606   │    8     │   2 MW  │  4.8 m²  │
│  MCS Station 3MW   │  909   │   12     │   3 MW  │  7.2 m²  │
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
    │  │RACK │  │RACK │  │      RACK 1-2: 152 modula = 502 kW
    │  │  1  │  │  2  │  │      (76 modula po rack-u)
    │  │     │  │     │  │
    │  └─────┘  └─────┘  │
    │                     │      1m
    │  ┌─────┐  ┌─────┐  │
    │  │RACK │  │RACK │  │      RACK 3-4: 152 modula = 502 kW
    │  │  3  │  │  4  │  │
    │  │     │  │     │  │
    │  └─────┘  └─────┘  │
    │                     │
    │  ┌───────────────┐  │
    │  │   ROBOT ARM   │  │      Custom robot na šini
    │  │   ═══════════ │  │
    │  └───────────────┘  │
    │                     │
    └─────────────────────┘

    TOTAL: 304 modula × 3.3 kW = 1,003 kW
    FOOTPRINT: 2.4 × 2.5m = 6 m²
```

---

## Robot Swap Sistem

### Robot Specifikacije

```
ROBOT ZA EK3 SWAP
════════════════════════════════════════════════════════════════

TIP: Purpose-built robot (Robot B) na linearnoj šini
(NE off-the-shelf UR/KUKA - videti patent EK-2026-002)

SPECIFIKACIJE:
• Payload: 10-15 kg (EK3 = 3.5 kg, plus gripper)
• Reach: 1.5-2m
• Repeatability: ±0.1mm
• Speed: Do 0.5 m/s (bezbedno)
• Masa robota: 30-50 kg
• Napajanje: 400V AC

LINEAR RAIL:
• Dužina: Po potrebi (2-10m za velike instalacije)
• Tip: Igus DryLin ili Bosch Rexroth
• Pozicioniranje: ±0.1mm

GRIPPER:
• Tip: Custom električni (ne pneumatski)
• Hvata EK3 za robot grip points
• Senzori: Force feedback + proximity
• Alignment pins za precizno pozicioniranje

PROCENJENA CENA:
• Robot B: €10,000-20,000
• (vs industrial cobot: €30,000-100,000)
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

### Uporedba: 10 velikih vs 303 malih modula

```
SCENARIO: 1 MW punjač, 10 godina rada
════════════════════════════════════════════════════════════════

TRADICIONALNO (10 × 100kW modula):
─────────────────────────────────────────────────
• MTBF po modulu: 100,000 h
• Verovatnoća kvara jednog modula/god: ~8%
• Kada 1 otkaže: GUBITAK 10% KAPACITETA
• Popravka: Tehničar, 2-5 dana

ELEKTROKOMBINACIJA (303 × 3.3kW modula):
─────────────────────────────────────────────────
• MTBF po modulu: 100,000 h
• Verovatnoća kvara jednog modula/god: ~8%
• Ali: Očekivanih ~24 kvarova/god (statistički)
• Kada 1 otkaže: GUBITAK 0.33% KAPACITETA
• Popravka: Robot, 40 sekundi

MATEMATIKA DOSTUPNOSTI:
─────────────────────────────────────────────────
Tradicionalno:
• 1 kvar = 10% degradacija dok ne dođe tehničar
• Očekivano 1-2 kvara godišnje
• Svaki kvar = 2-5 dana na 90% kapaciteta
• Godišnja dostupnost: ~98%

ELEKTROKOMBINACIJA:
• 24 kvarova godišnje, ali svaki = 0.33% gubitak
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

ELEKTROKOMBINACIJA (303 modula @ 3.3 kW):
100% |████████████████████████████████████████
99.67|█████████████████████████████████████▓▓▓ ← 1 otkaže
99.34|█████████████████████████████████████▓▓▓ ← 2 otkaže
99%  |█████████████████████████████████████▓▓▓ ← 3 otkaže
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

ELEKTROKOMBINACIJA (303 × EK3 @ 3.3kW, mass-produced):
─────────────────────────────────────────────────
EK3 modul (@10k volume):           €150 × 303 = €45,450
Custom racks (4×):                  €3,000 × 4 = €12,000
Backplanes + PFC (4×):              €2,000 × 4 = €8,000
Control system (CAN-FD):                       = €5,000
Robot B (amortizovan):              €15,000/10 = €1,500
Installation:                                  = €5,000
─────────────────────────────────────────────────
TOTAL:                                         €76,950

UŠTEDA: 33%!

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
• 1 MW stanica = 303 × €50 = €15,150 za module!
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

## Custom Rack Koncept

### Zašto ne standardni 19" rack?

```
IZAZOVI SA 19" TELECOM RACK-OM:
════════════════════════════════════════════════════════════════

1. TERMALNO UPRAVLJANJE
   • 84 modula × 3.3kW = 277 kW u jednom rack-u
   • ~11 kW disipacije toplote (pri 96% efikasnosti)
   • Standardni 19" rack NIJE dizajniran za ovakvu gustinu
   • Potreban optimizovan airflow path

2. FORM FACTOR MISMATCH
   • EK3 modul: 200×320×44mm (1U half-width)
   • 19" rack: 482mm širina
   • Samo 2 modula po redu (ne 4)
   • Gubimo gustinu

3. ROBOT PRISTUP
   • 19" rack je dizajniran za ljudski pristup
   • Robot treba drugačije clearance i alignment

4. BACKPLANE DIZAJN
   • Custom blind-mate konektori
   • Sequenced power mating
   • Ne uklapa se u standardni 19" format
```

### Predloženi Custom Rack

```
ELEKTROKOMBINACIJA CUSTOM RACK:
════════════════════════════════════════════════════════════════

DIMENZIJE (TBD nakon termalnog modelovanja):
• Širina: ~900mm (za 4× 200mm modula + spacing)
• Dubina: ~500mm (modul 320mm + airflow plenum)
• Visina: ~1200mm (kompaktniji od 42U)

TERMALNI DIZAJN:
• Front-to-back airflow
• Integrisani fans u plenumu
• Filter sa lakim pristupom
• Optional: Liquid cooling za DC bus

ROBOT OPTIMIZACIJA:
• Širi horizontalni spacing za gripper
• Vertikalni alignment rails
• Standardizovane pozicije za sve module
• LED markeri za vizuelnu navigaciju

MODULARNI BACKPLANE:
• Custom PCB backplane
• 20-pin blind-mate data konektori
• Sequenced power mating (GND first)
• CAN-FD hub integrisan

CENTRALNI PFC:
• Modularan PFC (za redundanciju)
• AC input: 400V 3-phase
• DC bus: 650V
• Može biti u istom ili odvojenom rack-u
```

### Faze Razvoja Custom Rack-a

```
FAZA 1: Termalno Modelovanje
─────────────────────────────────────────────────
• CFD simulacija airflow-a
• Definisanje max thermal density
• Optimizacija fan placement-a

FAZA 2: Mehanički Dizajn
─────────────────────────────────────────────────
• CAD modelovanje
• Robot gripper clearance analiza
• Prototip frame strukture

FAZA 3: Električki Dizajn
─────────────────────────────────────────────────
• Backplane PCB
• DC bus distribution
• CAN-FD wiring

FAZA 4: Integracija
─────────────────────────────────────────────────
• Pilot rack sa 12-24 modula
• Robot swap testiranje
• Termalno testiranje pod loadom
```

---

## Zaključak: Zašto EK3-Only Arhitektura Pobeđuje

```
SUMMARY:
════════════════════════════════════════════════════════════════

✓ JEDAN DIZAJN za sve - od 3.3 kW do 3 MW
✓ MASOVNA PROIZVODNJA - cena pada, kvalitet raste
✓ GRANULARNA POUZDANOST - 0.33% gubitak po kvaru, ne 10%
✓ ROBOT ZAMENA - 40 sekundi, ne 2-5 dana
✓ UNIVERSAL INVENTORY - jedan tip rezervnog dela
✓ GRACEFUL DEGRADATION - sistem nikad "pao"
✓ NIŽA CENA - 33%+ ušteda na hardveru
✓ CIRCULAR ECONOMY - moduli se popravljaju i vraćaju
✓ CUSTOM RACK - optimizovan za termiku i robotsku zamenu

OVO JE NOVA PARADIGMA:
Ne "koliko kW po modulu" nego "koliko modula po kW"

SPECIFIKACIJE EK3:
• Snaga: 3.3 kW continuous, 3.6 kW peak
• Dimenzije: 200×320×44mm (1U half-width)
• Masa: 3.5 kg
• SiC: 900V Wolfspeed
• Komunikacija: CAN-FD @ 5 Mbps
• MCU: STM32G474 (Cortex-M4)
• Efikasnost: >96% peak, >94% @ 50% load
```

---

## Sledeći Koraci

1. **Custom rack termalno modelovanje** - CFD simulacija
2. **Backplane PCB dizajn** - 20-pin konektori + CAN-FD
3. **Robot B prototip** - custom gripper za EK3
4. **Centralni PFC dizajn** - modularan za redundanciju
5. **Pilot rack** - 1 rack = 24 modula = 79 kW demo

---

## Datum

Kreirano: Januar 2026
Status: Koncept
