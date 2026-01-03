# Domaći EV Punjač - Univerzalna Platforma

## Strateška Vizija

### Cilj
Razviti **domaći (srpski) power modul** koji može služiti za:
1. **DANAS:** Depot i opportunity charging postojeće flote (Higer, budući)
2. **SUTRA:** Integracija u battery swap infrastrukturu

### Ključni Uvid
Battery swap stanica nije zamena za punjače - ona **SADRŽI punjače** koji pune izvađene baterije dok čekaju na zamenu. Isti 50 kW moduli mogu raditi u oba scenarija!

```
DEPOT CHARGING                    BATTERY SWAP STATION

    ┌─────────┐                   ┌─────────────────────────────┐
    │         │                   │   Battery Storage Rack      │
    │  50 kW  │                   │                             │
    │  MODUL  │───► BUS           │  [BAT] [BAT] [BAT] [BAT]   │
    │         │                   │    │     │     │     │     │
    └─────────┘                   │    └──┬──┴──┬──┴──┬──┘     │
                                  │       │     │     │        │
                                  │    ┌──┴─────┴─────┴──┐     │
                                  │    │  POWER CABINET  │     │
                                  │    │  N × 50kW MODUL │     │
                                  │    │  (ISTI MODULI!) │     │
                                  │    └─────────────────┘     │
                                  └─────────────────────────────┘
```

## Proizvod: 50 kW Power Modul

### Zašto 50 kW?
```
50 kW je optimalna jedinica jer:

1. Skalabilnost:
   - 1× modul = 50 kW (mali depot punjač)
   - 3× modula = 150 kW (standardni DC fast)
   - 6× modula = 300 kW (opportunity/pantograph)
   - 12× modula = 600 kW (megawatt charging / swap station)

2. Fizičke dimenzije:
   - 50 kW sa SiC: ~20 kg, 400×300×200 mm
   - Jedan čovek može montirati/zameniti
   - 19" rack kompatibilno

3. Termalno upravljanje:
   - 50 kW = ~2.5 kW gubitaka
   - Moguće air cooling (jednostavnije)
   - Liquid cooling opciono za gustinu

4. Razvoj:
   - Manji rizik nego 150 kW odjednom
   - Brža iteracija dizajna
   - Testiranje na nižoj snazi
```

### Specifikacije Modula

```
┌─────────────────────────────────────────────────────────────────┐
│                    50 kW POWER MODUL v1.0                       │
│                    "SRBIJACHARGE PM50"                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ULAZ (AC):                                                     │
│  ├── Napon: 380-420V AC, 3-fazni                               │
│  ├── Frekvencija: 50 Hz                                         │
│  ├── Power Factor: >0.99 (Active PFC)                          │
│  └── THDi: <5%                                                  │
│                                                                 │
│  IZLAZ (DC):                                                    │
│  ├── Napon: 200-1000V DC (za 800V sisteme)                     │
│  ├── Struja: max 125A @ 400V, 62.5A @ 800V                     │
│  ├── Snaga: 50 kW kontinualno                                  │
│  └── Ripple: <2% Vpp                                           │
│                                                                 │
│  EFIKASNOST:                                                    │
│  ├── Peak: >96% (sa SiC)                                       │
│  └── Euro efficiency: >95%                                      │
│                                                                 │
│  KOMUNIKACIJA:                                                  │
│  ├── CAN bus (interno, ka masteru)                             │
│  ├── Modbus RTU opcija                                          │
│  └── Status LED + fault signalizacija                          │
│                                                                 │
│  FIZIČKO:                                                       │
│  ├── Dimenzije: 400 × 300 × 200 mm (4U rack)                   │
│  ├── Težina: <25 kg                                             │
│  ├── Hlađenje: Forced air (opcija liquid)                      │
│  └── IP20 (za ugradnju u orman)                                │
│                                                                 │
│  ZAŠTITE:                                                       │
│  ├── OVP, OCP, OTP                                              │
│  ├── Ground fault detection                                     │
│  ├── Soft start                                                 │
│  └── Hot-swap capable (sa masterom)                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Sistemske Konfiguracije

### Konfiguracija 1: Depot Punjač (50-150 kW)

```
Za noćno punjenje flote u depou:

┌─────────────────────────────────────────────────────────────────┐
│                    DEPOT CHARGER 150 kW                         │
│                                                                 │
│   AC ULAZ ════════════════════════════════════════════════     │
│   400V 3ph        │           │           │                    │
│                   │           │           │                    │
│              ┌────┴────┐ ┌────┴────┐ ┌────┴────┐              │
│              │ PM50 #1 │ │ PM50 #2 │ │ PM50 #3 │              │
│              │  50 kW  │ │  50 kW  │ │  50 kW  │              │
│              └────┬────┘ └────┬────┘ └────┬────┘              │
│                   │           │           │                    │
│                   └─────┬─────┴─────┬─────┘                    │
│                         │           │                          │
│                    DC BUS (parallel)                           │
│                         │                                      │
│                   ┌─────┴─────┐                                │
│                   │  MASTER   │                                │
│                   │CONTROLLER │                                │
│                   │           │                                │
│                   │ - CCS2    │                                │
│                   │ - ISO15118│                                │
│                   │ - OCPP    │                                │
│                   └─────┬─────┘                                │
│                         │                                      │
│                    ═════╧═════                                 │
│                      CCS2 Plug                                 │
│                    (ili pantograph)                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Prednosti:
- Redundancija: Ako jedan modul otkaže, ostali rade (100 kW)
- Skalabilnost: Početi sa 50 kW, dodati module kasnije
- Servis: Zamena modula za 15 minuta
- Cena: Niži CAPEX za manje flote

Varijante:
- 1× PM50 = 50 kW (mali depot, e-dostavna vozila)
- 2× PM50 = 100 kW (srednji depot)
- 3× PM50 = 150 kW (standardni bus depot)
```

### Konfiguracija 2: Opportunity Charger (300-450 kW)

```
Za punjenje na terminalima/stanicama:

┌─────────────────────────────────────────────────────────────────┐
│               OPPORTUNITY CHARGER 300 kW                        │
│                                                                 │
│        ┌─────────────────────────────────────────────┐         │
│        │              POWER CABINET                  │         │
│        │                                             │         │
│        │  ┌──────┐ ┌──────┐ ┌──────┐               │         │
│        │  │PM50#1│ │PM50#2│ │PM50#3│               │         │
│        │  └──────┘ └──────┘ └──────┘               │         │
│        │  ┌──────┐ ┌──────┐ ┌──────┐               │         │
│        │  │PM50#4│ │PM50#5│ │PM50#6│               │         │
│        │  └──────┘ └──────┘ └──────┘               │         │
│        │                                             │         │
│        │         MASTER + DC BUS                    │         │
│        │                                             │         │
│        └─────────────────────────────────────────────┘         │
│                           │                                     │
│                           │                                     │
│              ┌────────────┴────────────┐                       │
│              │      PANTOGRAPH         │                       │
│              │    (roof contact)       │                       │
│              └─────────────────────────┘                       │
│                           │                                     │
│                        [BUS]                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Napredne funkcije:
- 6× PM50 = 300 kW
- N+1 redundancija (5 aktivnih, 1 standby)
- Punjenje 5-8 minuta na terminalu
- Automatska konekcija pantograph
```

### Konfiguracija 3: Battery Swap Station (Budućnost)

```
Kada Srbija pređe na battery swap model:

┌─────────────────────────────────────────────────────────────────┐
│                   BATTERY SWAP STATION                          │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                 BATTERY RACK (10 slots)                  │  │
│   │                                                          │  │
│   │   [BAT1] [BAT2] [BAT3] [BAT4] [BAT5]                    │  │
│   │     │      │      │      │      │                       │  │
│   │   [BAT6] [BAT7] [BAT8] [BAT9] [BAT10]                   │  │
│   │     │      │      │      │      │                       │  │
│   │     └──────┴──────┴──────┴──────┴──────────────┐        │  │
│   │                                                │        │  │
│   └────────────────────────────────────────────────┼────────┘  │
│                                                    │            │
│   ┌────────────────────────────────────────────────┴──────┐    │
│   │                   POWER CABINET                        │    │
│   │                                                        │    │
│   │   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │    │
│   │   │PM50#1│ │PM50#2│ │PM50#3│ │PM50#4│ │PM50#5│       │    │
│   │   └──────┘ └──────┘ └──────┘ └──────┘ └──────┘       │    │
│   │   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │    │
│   │   │PM50#6│ │PM50#7│ │PM50#8│ │PM50#9│ │PM50#10│      │    │
│   │   └──────┘ └──────┘ └──────┘ └──────┘ └──────┘       │    │
│   │                                                        │    │
│   │              SWAP STATION CONTROLLER                   │    │
│   │   - Battery routing/selection                          │    │
│   │   - SOC management                                     │    │
│   │   - Queue optimization                                 │    │
│   │   - Grid load balancing                                │    │
│   │                                                        │    │
│   └────────────────────────────────────────────────────────┘    │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    SWAP BAY                              │  │
│   │                                                          │  │
│   │    [BUS POSITION]     [ROBOT ARM]                       │  │
│   │         ═══               ╔═╗                           │  │
│   │                           ║ ║                           │  │
│   │                           ╚═╝                           │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Isti PM50 moduli, ali sa dodatnim:
- Battery management routing
- Parallel charging of stored batteries
- Smart scheduling (puni baterije noću, swap danju)

Kapacitet:
- 10× PM50 = 500 kW ukupne snage punjenja
- 10 baterija × 300 kWh = 3 MWh storage
- ~30 swap operacija dnevno po stanici
```

## Arhitektura Power Modula

### Blok Dijagram PM50

```
┌─────────────────────────────────────────────────────────────────┐
│                         PM50 MODUL                              │
│                                                                 │
│   AC IN ─────┐                                                  │
│   (3-phase)  │                                                  │
│              ▼                                                  │
│        ┌──────────┐     ┌──────────┐     ┌──────────┐          │
│        │   EMI    │     │  Vienna  │     │    LLC   │          │
│        │  Filter  │────►│Rectifier │────►│  DC/DC   │───► DC OUT
│        │          │     │   PFC    │     │          │          │
│        └──────────┘     └────┬─────┘     └────┬─────┘          │
│                              │                │                 │
│                         ┌────┴────────────────┴────┐           │
│                         │      DSP CONTROLLER      │           │
│                         │      (TMS320F28379)      │           │
│                         │                          │           │
│                         │  - PFC control           │           │
│                         │  - LLC control           │           │
│                         │  - Protections           │           │
│                         │  - CAN interface         │           │
│                         └────────────┬─────────────┘           │
│                                      │                          │
│   CAN ◄──────────────────────────────┘                         │
│   (ka Master Controlleru)                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Master Controller

```
Zadatak Master Controller-a:

┌─────────────────────────────────────────────────────────────────┐
│                      MASTER CONTROLLER                          │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                  COMMUNICATION                           │  │
│   │                                                          │  │
│   │   Vehicle Side:          Backend Side:                   │  │
│   │   ├── ISO 15118 (PLC)    ├── OCPP 2.0 (4G/Ethernet)     │  │
│   │   ├── CHAdeMO (CAN)      ├── Local HMI                   │  │
│   │   └── DIN 70121          └── Diagnostics                 │  │
│   │                                                          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                  POWER MANAGEMENT                        │  │
│   │                                                          │  │
│   │   ├── Load sharing između PM50 modula                    │  │
│   │   ├── Fault handling (isključi neispravan modul)        │  │
│   │   ├── Soft start sequencing                              │  │
│   │   └── Grid power limiting                                │  │
│   │                                                          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                  SAFETY                                  │  │
│   │                                                          │  │
│   │   ├── Isolation monitoring (IMD)                        │  │
│   │   ├── Contactor control                                  │  │
│   │   ├── Emergency stop                                     │  │
│   │   └── Pre-charge sequence                                │  │
│   │                                                          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Hardware: STM32H7 + QCA7000 (PLC) + 4G modem                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Fazni Razvoj

### Faza 1: MVP (6 meseci)
```
Cilj: Funkcionalni 50 kW modul

Aktivnosti:
1. Finalizacija topologije (Vienna + LLC)
2. PCB dizajn power stage
3. DSP firmware (basic control loops)
4. Prototip #1 - lab testing
5. EMC pre-scan

Deliverable:
- 1× PM50 prototip
- Efikasnost >94%
- Testiran na 50 kW

Budget: ~€50,000 (komponente + tooling)
```

### Faza 2: Sistem Integracija (6 meseci)
```
Cilj: Kompletna 150 kW charging stanica

Aktivnosti:
1. Master Controller razvoj
2. 3× PM50 integracija
3. ISO 15118 / OCPP implementacija
4. Cabinet dizajn (termalno, EMC)
5. Pilot instalacija (1-2 lokacije)

Deliverable:
- 150 kW depot punjač
- OCPP 1.6 certified
- Pilot na 2 lokacije

Budget: ~€80,000
```

### Faza 3: Sertifikacija & Proizvodnja (6 meseci)
```
Cilj: CE marking, početak serijske proizvodnje

Aktivnosti:
1. EMC full testing i optimizacija
2. Safety testing (IEC 61851)
3. Eichrecht preparation (MID metering)
4. Production tooling
5. Supply chain setup

Deliverable:
- CE certified proizvod
- 10 kom pilot serija
- Production capacity: 50 units/month

Budget: ~€100,000
```

### Faza 4: Pantograph & Scale (12 meseci)
```
Cilj: 300 kW opportunity charging

Aktivnosti:
1. 6× PM50 konfiguracija
2. Pantograph integracija
3. Fleet management software
4. EXPO 2027 deployment

Deliverable:
- 300 kW pantograph punjači
- 10+ instalacija za EXPO
- Fleet management platforma

Budget: ~€200,000
```

### Faza 5: Battery Swap Ready (24+ meseci)
```
Cilj: Podrška za battery swap stanice

Aktivnosti:
1. Multi-output verzija PM50
2. Battery routing controller
3. Swap station integration
4. Partnerstvo sa kineskim OEM

Deliverable:
- Swap-ready power system
- Kompatibilnost sa kineskim standardom
- Pilot swap stanica

Budget: TBD (zavisi od tržišta)
```

## Ekonomska Analiza

### Troškovi Proizvodnje PM50

```
┌─────────────────────────────────────────────────────────────────┐
│ Bill of Materials - PM50 (serijska proizvodnja, qty 100+)       │
├──────────────────────────────────┬──────────────────────────────┤
│ Kategorija                       │ Cena (€)                     │
├──────────────────────────────────┼──────────────────────────────┤
│ Poluvodici (SiC/IGBT)           │ 800                          │
│ Gate driveri                     │ 150                          │
│ Pasivne (magnetics, caps)        │ 500                          │
│ Kontrolna elektronika            │ 150                          │
│ Termalno (heatsinks, fans)       │ 150                          │
│ Kućište, konektori               │ 150                          │
│ PCB fabrication                  │ 100                          │
│ Assembly labor                   │ 200                          │
├──────────────────────────────────┼──────────────────────────────┤
│ UKUPNO BOM                       │ 2,200 €                      │
├──────────────────────────────────┼──────────────────────────────┤
│ Overhead (20%)                   │ 440 €                        │
│ COGS                             │ 2,640 €                      │
├──────────────────────────────────┼──────────────────────────────┤
│ Target margin (40%)              │ 1,760 €                      │
│ PRODAJNA CENA PM50               │ ~4,400 €                     │
└──────────────────────────────────┴──────────────────────────────┘

Uporedba sa konkurencijom:

ABB/Siemens 50 kW modul: ~€8,000-12,000
Kineski OEM: ~€3,000-5,000
Naš target: ~€4,400 (konkurentan, lokalna podrška)
```

### Cena Kompletnih Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│ Sistem                    │ Komponente      │ Prodajna cena    │
├───────────────────────────┼─────────────────┼──────────────────┤
│ Depot 50 kW               │ 1×PM50 + Master │ €8,000           │
│ Depot 100 kW              │ 2×PM50 + Master │ €14,000          │
│ Depot 150 kW              │ 3×PM50 + Master │ €20,000          │
├───────────────────────────┼─────────────────┼──────────────────┤
│ Opportunity 300 kW        │ 6×PM50 + Panto  │ €50,000          │
│ Opportunity 450 kW        │ 9×PM50 + Panto  │ €70,000          │
├───────────────────────────┼─────────────────┼──────────────────┤
│ Swap Station Power Unit   │ 10×PM50 + Ctrl  │ €60,000          │
│ (bez robotike)            │                 │                  │
└───────────────────────────┴─────────────────┴──────────────────┘

ABB HVC150 (150 kW) košta ~€40,000-50,000
Naš 150 kW = €20,000 → 50-60% ušteda!
```

## Prednosti Domaćeg Proizvoda

### 1. Ekonomske
```
✓ Niža cena (lokalna proizvodnja, bez carina)
✓ Brža isporuka (nema shipping iz Kine/EU)
✓ Lokalna valuta (bez FX rizika)
✓ Državne subvencije za domaće (potencijalno)
```

### 2. Tehničke
```
✓ Prilagođeno lokalnoj mreži (400V/50Hz Srbija)
✓ Servis i podrška na srpskom
✓ Brza reakcija na probleme (isti dan)
✓ Customizacija po potrebi operatera
```

### 3. Strateške
```
✓ Know-how ostaje u Srbiji
✓ Radna mesta u proizvodnji
✓ Izvozni potencijal (region, EU)
✓ Energetska nezavisnost
```

### 4. Kompatibilnost
```
✓ Postojeća flota (Higer plug-in)     → CCS2/Pantograph output
✓ Buduća flota (bilo koji OEM)        → Standardni protokoli
✓ Kineski battery swap                → Isti moduli, drugi master
✓ EU interoperabilnost               → CE, OCPP, ISO 15118
```

## Zaključak

```
PREPORUKA:

1. Razviti 50 kW modularni power modul (PM50)
   - Domaći dizajn i proizvodnja
   - Konkurentna cena (~€4,400/modul)
   - Kvalitet na nivou ABB/Siemens

2. Skalabilne konfiguracije:
   - Depot: 50-150 kW (1-3 modula)
   - Opportunity: 300-450 kW (6-9 modula)
   - Swap station: 500+ kW (10+ modula)

3. Fazni pristup:
   - Faza 1-2: Depot charging (EXPO 2027 ready)
   - Faza 3-4: Opportunity/pantograph
   - Faza 5: Battery swap kada tržište sazri

4. Partnerstva:
   - MT-KOMEX: Distribucija, instalacija
   - Higer/kineski OEM: Kompatibilnost sa vozilima
   - EPS/Elektromreža: Grid integracija
   - Fakulteti (ETF, FTN): R&D podrška

INVESTICIJA: ~€430,000 kroz 3 godine
ROI: Pozitivan nakon 200 prodatih modula (~2 godine prodaje)
```
