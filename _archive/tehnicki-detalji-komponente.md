# Tehnički detalji komponenti EV punjača: kompletna razrada

## Pregled arhitekture sustava

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EV PUNJAČ - BLOK DIJAGRAM                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MREŽNI           EMI        AC/DC         DC LINK      DC/DC        IZLAZ │
│  PRIKLJUČAK      FILTER      (PFC)         KAPACITORI   (IZOLIRANI)        │
│                                                                             │
│  ┌─────┐      ┌───────┐    ┌───────┐      ┌───────┐    ┌───────┐   ┌─────┐│
│  │3-faz│──────│ EMI   │────│Vienna │──────│  DC   │────│  LLC/ │───│ CCS ││
│  │400V │      │Filter │    │Rectif.│      │ Link  │    │  DAB  │   │Konek││
│  │ AC  │      │       │    │       │      │800VDC │    │       │   │     ││
│  └─────┘      └───────┘    └───────┘      └───────┘    └───────┘   └─────┘│
│                                │               │            │              │
│                                ▼               ▼            ▼              │
│                         ┌───────────────────────────────────────┐          │
│                         │         KONTROLNI SUSTAV              │          │
│                         │  ┌─────────────────────────────────┐  │          │
│                         │  │  MCU/DSP (STM32, TMS320, etc.)  │  │          │
│                         │  └─────────────────────────────────┘  │          │
│                         │         │           │          │      │          │
│                         │    ┌────┴────┐ ┌────┴────┐ ┌───┴───┐ │          │
│                         │    │PWM Ctrl │ │Comm    │ │Safety │ │          │
│                         │    │Gate Drv │ │ISO15118│ │Monitor│ │          │
│                         │    └─────────┘ └────────┘ └───────┘ │          │
│                         └───────────────────────────────────────┘          │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      POMOĆNI SUSTAVI                                 │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐         │  │
│  │  │Hlađenje│  │Mjerenje│  │  HMI   │  │Sigurn. │  │Backend │         │  │
│  │  │Termalno│  │Energije│  │Display │  │RCD/IMD │  │ OCPP   │         │  │
│  │  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. ENERGETSKA ELEKTRONIKA (Power Electronics)

### 1.1 AC/DC stupanj - Power Factor Correction (PFC)

#### Funkcija
Pretvara trofazni AC ulaz (400V, 50Hz) u stabilan DC link napon (~800VDC) s visokim faktorom snage (>0.99) i niskim harmoničkim izobličenjem (THD <5%).

#### Topologije

##### Vienna Rectifier (preporučeno za unidirekcijske punjače)

```
           L1 ──┬──[L]──┬──────┐
                │       │      │
           L2 ──┬──[L]──┼──┬───┼──┐         ┌──► DC+ (400V)
                │       │  │   │  │         │
           L3 ──┬──[L]──┼──┼───┼──┼──┐      │
                │       │  │   │  │  │      │
               ┌┴┐     ┌┴─┴┐ ┌┴─┴┐┌┴─┴┐    │
               │D│     │ S1││ S2││ S3│     │   C_DC
               └┬┘     └─┬─┘└─┬─┘└─┬─┘     │    ║
                │        │    │    │       ├────╫────┐
                │        └────┴────┴───────┤    ║    │
                │                          │         │ DC Link
               ┌┴┐     ┌───┬───┬───┐      │         │ 800VDC
               │D│     │ S4│ S5│ S6│      │    ║    │
               └┬┘     └─┬─┘└─┬─┘└─┬─┘     ├────╫────┘
                │        │    │    │       │    ║
                └────────┴────┴────┴───────┘
                                               └──► DC- (400V)

        S1-S6: SiC MOSFET ili IGBT
        D: Brze diode
        L: Boost induktori (tipično 200-500 µH)
        C_DC: DC link kondenzatori (tipično 2-4 mF)
```

| Parametar | Vrijednost |
|-----------|------------|
| Efikasnost | 98-98.5% |
| Power factor | >0.99 |
| THD | <3% (bez dodatnog filtriranja) |
| Broj aktivnih sklopki | 6 (vs 12 za AFE) |
| Bidirekcionalnost | Ne |
| Kompleksnost kontrole | Srednja |

##### Active Front End (AFE) - za V2G

```
       L1 ──[L]──┬────┬────┐
                 │    │    │
       L2 ──[L]──┼──┬─┼──┬─┼──┐
                 │  │ │  │ │  │
       L3 ──[L]──┼──┼─┼──┼─┼──┼──┐
                 │  │ │  │ │  │  │
                ┌┴┐┌┴┐┌┴┐┌┴┐┌┴┐┌┴┐
                │T││T││T││T││T││T│      T = IGBT ili SiC s antiparalelnom diodom
                └┬┘└┬┘└┬┘└┬┘└┬┘└┬┘
                 │  │  │  │  │  │
                 └──┴──┴──┴──┴──┘
                        │
                       DC bus (800V)
```

| Parametar | Vrijednost |
|-----------|------------|
| Efikasnost | 96-98% |
| Power factor | Podesiv (-1 do +1) |
| Bidirekcionalnost | Da (4-kvadrantna operacija) |
| V2G sposobnost | Da |
| Kompleksnost | Visoka |
| Dodatna funkcija | Reaktivna kompenzacija snage |

##### Usporedba topologija AC/DC

| Topologija | Efikasnost | Sklopke | Bidirek. | THD | Preporuka |
|------------|------------|---------|----------|-----|-----------|
| Vienna Rectifier | 98.5% | 6 | Ne | <3% | Depot bez V2G |
| 2-Level AFE | 97% | 6 | Da | <5% | V2G, jednostavno |
| 3-Level NPC | 98% | 12 | Da | <3% | V2G, visoke snage |
| T-Type NPC | 98.2% | 9 | Da | <3% | Optimum |

---

### 1.2 DC/DC stupanj - Izolirani pretvarač

#### Funkcija
- Galvanska izolacija (sigurnost)
- Regulacija izlaznog napona (150-920V za CCS2)
- Strujno ograničenje
- Soft switching za smanjenje gubitaka

#### LLC Rezonantni pretvarač (unidirekcijski)

```
    DC+ ──┬──[S1]──┬──[S3]──┐
          │        │        │
          │    [Lr]─[Cr]    │           Lr = rezonantna induktivnost
          │        │        │           Cr = rezonantni kondenzator
          │      ┌─┴─┐      │           Lm = magnetizacijska indukt.
          │      │ T │      │           T = HF transformator
          │      │Lm │      │
          │      └─┬─┘      │
          │        │        │
    DC- ──┴──[S2]──┴──[S4]──┘
                   │
                   ▼
           ┌───────┴───────┐
           │   Sekundarna  │
           │     strana    │
           │  ┌───┐ ┌───┐  │
           │  │D1 │ │D2 │  │──► Izlaz DC
           │  └───┘ └───┘  │    (150-920V)
           │       │       │
           │  ┌───┐ ┌───┐  │
           │  │D3 │ │D4 │  │
           │  └───┘ └───┘  │
           └───────────────┘
```

| Parametar | Tipična vrijednost |
|-----------|-------------------|
| Efikasnost | 97-98% |
| Switching frekvencija | 50-150 kHz |
| ZVS raspon | Širok (cijeli opseg opterećenja) |
| Izlazni naponski raspon | ±20% od nominale |
| Galvanska izolacija | 4 kVAC (1 min) |

**Dizajn rezonantnog tanka:**

```
Rezonantna frekvencija: fr = 1 / (2π√(Lr×Cr))

Tipične vrijednosti za 50 kW modul:
- Lr = 10-50 µH
- Cr = 100-500 nF
- Lm = 100-500 µH
- fr = 80-120 kHz
```

#### Dual Active Bridge (DAB) - bidirekcijski

```
    PRIMARNI H-BRIDGE              SEKUNDARNI H-BRIDGE

    DC+ ──┬──[S1]──┬──[S3]──┐       ┌──[S5]──┬──[S7]──┬── DC+
          │        │        │       │        │        │
          │        │        │   ┌─┬─┐       │        │
          │        └────────┼───│T│L│───────┼────────┘
          │                 │   └─┴─┘       │
          │        ┌────────┼─────┘         │
          │        │        │               │
    DC- ──┴──[S2]──┴──[S4]──┘       └──[S6]──┴──[S8]──┴── DC-

    T = HF transformator
    L = serijska induktivnost (može biti integrirano u T)
```

| Parametar | Tipična vrijednost |
|-----------|-------------------|
| Efikasnost | 96-97% |
| Bidirekcionalnost | Da (inherentno) |
| Izlazni naponski raspon | 2:1 i više |
| Kontrola | Phase-shift + frekvencija |
| V2G sposobnost | Da |

**Prijenos snage u DAB-u:**

```
P = (V1 × V2 × φ × (π - |φ|)) / (2π² × fs × L)

Gdje je:
- V1, V2 = naponi na primarnoj i sekundarnoj strani
- φ = fazni pomak (radijani)
- fs = switching frekvencija
- L = serijska induktivnost
```

---

### 1.3 Poluvodičke komponente

#### SiC MOSFET moduli

| Proizvođač | Serija | Napon | Struja | Rth | Cijena |
|------------|--------|-------|--------|-----|--------|
| Wolfspeed | CAS325M12HM2 | 1200V | 325A | 0.04 K/W | ~$400 |
| Infineon | FF6MR12W2M1 | 1200V | 600A | 0.025 K/W | ~$600 |
| ROHM | BSM300C12P3G201 | 1200V | 300A | 0.045 K/W | ~$350 |
| STMicro | ACEPACK 2 | 1200V | 300A | 0.05 K/W | ~$300 |
| Onsemi | NXH010P120MNF2 | 1200V | 296A | 0.04 K/W | ~$350 |

#### IGBT moduli (za niži budžet)

| Proizvođač | Serija | Napon | Struja | Cijena |
|------------|--------|-------|--------|--------|
| Infineon | FF450R12ME4 | 1200V | 450A | ~$150 |
| Semikron | SKM400GB12E4 | 1200V | 400A | ~$120 |
| Fuji | 2MBI450VH-120-50 | 1200V | 450A | ~$140 |

#### SiC vs IGBT usporedba (za 50 kW modul)

| Parametar | Si IGBT | SiC MOSFET |
|-----------|---------|------------|
| Switching frekvencija | 20 kHz | 100 kHz |
| Switching gubici | 100% (ref) | ~40% |
| Conduction gubici | 100% (ref) | ~70% |
| Veličina hladnjaka | 100% | ~50% |
| Veličina induktora | 100% | ~40% |
| Ukupna efikasnost | 95% | 97.5% |
| Cijena modula | $150 | $400 |
| Ukupni TCO (5 god) | Viši | Niži |

---

### 1.4 Gate driveri

#### Zahtjevi za SiC MOSFET gate drivere

| Parametar | Zahtjev | Obrazloženje |
|-----------|---------|--------------|
| Izlazna struja | 4-10 A peak | Brzo punjenje gate kapaciteta |
| Napon napajanja | +15V / -4V do -5V | Optimalno Vgs za SiC |
| CMTI | >100 kV/µs | Otpornost na dv/dt |
| Izolacija | 5-8 kV | Sigurnost, galvanska izolacija |
| Propagation delay | <100 ns | Brza reakcija |
| Matching | <10 ns | Za half-bridge konfiguracije |

#### Preporučeni gate driveri

| Proizvođač | Model | Struja | CMTI | Izolacija | Cijena |
|------------|-------|--------|------|-----------|--------|
| Infineon | 1EDC60H12AH | 10A | 200 kV/µs | 5.7 kV | ~$15 |
| TI | UCC21750 | 10A | 150 kV/µs | 5.7 kV | ~$12 |
| STMicro | STGAP2SiCSN | 4A | 100 kV/µs | 6 kV | ~$8 |
| Silicon Labs | Si828x | 4A | 200 kV/µs | 5 kV | ~$10 |
| Broadcom | ACPL-352J | 5A | 50 kV/µs | 5 kV | ~$7 |

#### Izolirano napajanje za gate driver

```
┌─────────────────────────────────────────────────────┐
│              IZOLIRANI GATE DRIVER SUSTAV           │
├─────────────────────────────────────────────────────┤
│                                                     │
│   +15V ──┬──[Izolirani    ]──┬── +15V_HI           │
│          │  DC/DC           │                      │
│   GND ───┤  (push-pull)     ├── GND_HI ─┐         │
│          │                   │           │ SiC     │
│          │  Transformer      │           │ Gate    │
│          │  ┌───┐           │           │         │
│          └──│ T │───────────┘   -5V_HI ─┘         │
│             └───┘                                  │
│                                                    │
│   Tipični izolirani DC/DC:                        │
│   - Würth WE-AGDT serija                          │
│   - Murata MGJ serija                             │
│   - Recom R15P2xxS serija                         │
│                                                    │
│   Izlaz: +15V / -4V ili -5V, 1-2W                 │
│   Izolacija: 5.7 kVRMS                            │
│   Parazitski kapacitet: <10 pF                    │
│                                                    │
└─────────────────────────────────────────────────────┘
```

---

### 1.5 Pasivne komponente

#### DC Link kondenzatori

| Tip | Kapacitet | Napon | Struja ripple | Životni vijek |
|-----|-----------|-------|---------------|---------------|
| Film (PP) | 500-2000 µF | 900-1100V | 50-100 Arms | 100,000+ h |
| Elektrolitski | 2000-5000 µF | 450V (u seriji) | 20-50 Arms | 10,000-20,000 h |

**Preporučeni proizvođači:**
- TDK EPCOS B25620/B25655 serije
- Vishay MKP1848 serija
- KEMET C4AQ serija
- Cornell Dubilier 947D serija

**Dimenzioniranje:**

```
Minimalni kapacitet: C_min = I_ripple / (2 × f_sw × ΔV_max)

Primjer za 50 kW, 100 kHz, ΔV=20V:
C_min = 62.5A / (2 × 100kHz × 20V) = 15.6 µF

Praktično: 10-20× za robusnost → 200-400 µF
```

#### Induktori (Boost/PFC)

| Tip jezgre | Materijal | Frekvencija | Snaga | Prednosti |
|------------|-----------|-------------|-------|-----------|
| Toroidalna | Sendust | <100 kHz | <50 kW | Nisko EMI zračenje |
| Toroidalna | Nano-kristal | <200 kHz | <100 kW | Visoka permeabilnost |
| E-core | Ferrit (N87, 3C95) | >100 kHz | Sve | Jeftino, dostupno |
| Amorfna | Metglas | <50 kHz | >100 kW | Niske jezgrene gubitke |

**Proizvođači:**
- Magnetics Inc (Kool Mu, XFlux)
- Micrometals (sendust)
- TDK (ferrit, amorfno)
- Vacuumschmelze (nanokristal)

#### Visokofrekvencijski transformatori

| Parametar | Tipična vrijednost |
|-----------|-------------------|
| Materijal jezgre | Ferrit (N87, 3C97, PC95) |
| Frekvencija | 50-150 kHz |
| Snaga po jezgri | 10-50 kW |
| Efikasnost | >99% |
| Izolacija | 4-8 kVAC |
| Namotaj | Litz žica (100-800 strands) |

**Jezgre za 50 kW modul:**
- ETD59, ETD64 (ferrit)
- PM87, PM114 (ferrit)
- Custom toroidalne (nanokristal)

---

## 2. KONTROLNA ELEKTRONIKA

### 2.1 Glavni kontroler (MCU/DSP)

#### Zahtjevi

| Funkcija | Zahtjev |
|----------|---------|
| PWM kanali | Minimum 12 (za 3-faz PFC + DC/DC) |
| PWM rezolucija | >10 bit, >100 kHz |
| ADC kanali | 8-16, >12 bit, <1 µs sampling |
| Komunikacija | CAN, SPI, UART, Ethernet |
| Processing | Real-time control loop <10 µs |
| Memorija | >256 KB Flash, >64 KB RAM |

#### Preporučeni mikrokontroleri

| Proizvođač | Serija | Jezgra | PWM | ADC | Cijena |
|------------|--------|--------|-----|-----|--------|
| TI | TMS320F28379D | Dual C28x | 24 | 4×16-bit | ~$20 |
| TI | TMS320F28003x | C28x | 16 | 3×12-bit | ~$10 |
| STMicro | STM32G474 | Cortex-M4 | 12 | 5×12-bit | ~$8 |
| STMicro | STM32H7 | Cortex-M7 | 20+ | 3×16-bit | ~$15 |
| Infineon | XMC4800 | Cortex-M4 | 8 | 4×12-bit | ~$12 |
| NXP | S32K3 | Cortex-M7 | 24 | 2×12-bit | ~$15 |

#### Arhitektura kontrolnog sustava

```
┌─────────────────────────────────────────────────────────────────┐
│                    KONTROLNA ARHITEKTURA                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              GLAVNI DSP/MCU (TMS320F28379D)             │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │            Control Loops (<10 µs)               │    │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │    │   │
│  │  │  │PFC       │  │DC/DC     │  │Current   │      │    │   │
│  │  │  │Voltage   │  │Voltage   │  │Control   │      │    │   │
│  │  │  │Control   │  │Control   │  │Loop      │      │    │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘      │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                          │                               │   │
│  │  ┌───────────┬───────────┼───────────┬───────────┐      │   │
│  │  │           │           │           │           │      │   │
│  │  ▼           ▼           ▼           ▼           ▼      │   │
│  │ PWM        ADC        SPI/I2C      CAN        UART     │   │
│  │ (Gate      (V,I       (Temp,      (BMS       (Debug)   │   │
│  │  Drive)    sense)     sensors)    comm)               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                     │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         KOMUNIKACIJSKI PROCESOR (STM32 / Linux SBC)     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │ISO 15118 │  │  OCPP    │  │   HMI    │              │   │
│  │  │ Stack    │  │ Client   │  │ Control  │              │   │
│  │  └──────────┘  └──────────┘  └──────────┘              │   │
│  │         │              │              │                 │   │
│  │    HomePlug       Ethernet        Display              │   │
│  │    (PLC)          /4G/WiFi        Interface            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Senzori

#### Strujni senzori

| Tip | Raspon | Točnost | Bandwidth | Izolacija | Cijena |
|-----|--------|---------|-----------|-----------|--------|
| Hall effect (open loop) | ±600A | ±1% | 50 kHz | 4 kV | ~$20 |
| Hall effect (closed loop) | ±600A | ±0.5% | 200 kHz | 4 kV | ~$40 |
| Fluxgate | ±1000A | ±0.1% | 300 kHz | 4 kV | ~$80 |
| Shunt + izolacija | ±500A | ±0.2% | 1 MHz | 5 kV | ~$30 |
| Rogowski coil | ±2000A | ±1% | 10 MHz | 10 kV | ~$50 |

**Preporučeni proizvođači:**
- LEM (HTFS, HO, HLSR serije)
- Allegro (ACS770, ACS772)
- Melexis (MLX91220)
- Honeywell (CSNX serija)
- Isabellenhütte (shunt + ISO)

#### Naponski senzori

| Tip | Raspon | Točnost | Bandwidth | Cijena |
|-----|--------|---------|-----------|--------|
| Rezistivni djelitelj + ISO amp | 0-1000V | ±0.5% | 100 kHz | ~$15 |
| Hall effect (LEM LV25-P) | 0-500V | ±0.8% | 50 kHz | ~$30 |
| Capacitive divider | 0-1500V | ±1% | 1 MHz | ~$20 |

#### Temperaturni senzori

| Lokacija | Tip | Raspon | Točnost |
|----------|-----|--------|---------|
| Hladnjak poluvodiča | NTC (10k @ 25°C) | -40 do 150°C | ±1°C |
| Ambijent | NTC ili PT1000 | -40 do 85°C | ±0.5°C |
| Konektor/kabel | PT1000 (integrirano) | -40 do 150°C | ±0.3°C |
| Rashladna tekućina | PT100/PT1000 | -40 do 100°C | ±0.5°C |

### 2.3 Pomoćno napajanje (Auxiliary Power Supply)

```
┌─────────────────────────────────────────────────────────────────┐
│                  AUXILIARY POWER ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   3-faz 400V ──► [EMI] ──► [AC/DC      ] ──► 24V DC bus        │
│      AC              Filter     Flyback/LLC     (300-500W)      │
│                                                                 │
│   24V DC bus                                                    │
│       │                                                         │
│       ├──► [DC/DC Buck] ──► 12V (fans, pumpe)                  │
│       │                                                         │
│       ├──► [DC/DC Buck] ──► 5V (digitalna logika)              │
│       │                                                         │
│       ├──► [DC/DC Buck] ──► 3.3V (MCU, senzori)                │
│       │                                                         │
│       ├──► [Isolated DC/DC] ──► ±15V (gate driveri)            │
│       │    (x6-12 komada za svaki half-bridge)                 │
│       │                                                         │
│       └──► [UPS baterija] ──► 24V backup (graceful shutdown)   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. KOMUNIKACIJSKI SUSTAVI

### 3.1 ISO 15118 - Vehicle Communication

#### Arhitektura ISO 15118 stacka

```
┌─────────────────────────────────────────────────────────────────┐
│                    ISO 15118 PROTOCOL STACK                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 APPLICATION LAYER                        │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ V2G Messages (SessionSetup, ChargeParameter,     │   │   │
│  │  │ PowerDelivery, MeteringReceipt, etc.)            │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 PRESENTATION LAYER                       │   │
│  │  ┌────────────────┐  ┌────────────────────────────┐     │   │
│  │  │ EXI Encoding   │  │ XML Schema (V2G_CI)        │     │   │
│  │  └────────────────┘  └────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   SESSION LAYER                          │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │ TLS 1.2/1.3 (Security, Plug & Charge PKI)      │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  TRANSPORT LAYER                         │   │
│  │  ┌────────────────┐  ┌────────────────────────────┐     │   │
│  │  │ TCP/IP         │  │ UDP (SDP - discovery)      │     │   │
│  │  └────────────────┘  └────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   NETWORK LAYER                          │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │ IPv6 (Link Local)                               │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   DATA LINK LAYER                        │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │ HomePlug GreenPHY (PLC over CP pilot)          │     │   │
│  │  │ ili WiFi (za OppCharge) ili Ethernet (MCS)     │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   PHYSICAL LAYER                         │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │ Control Pilot (CP) line - ±12V PWM + PLC       │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### ISO 15118 verzije

| Verzija | Godina | Ključne značajke |
|---------|--------|------------------|
| DIN 70121 | 2014 | Bazični DC charging, još uvijek široko korišten |
| ISO 15118-2 | 2014 | Plug & Charge, V2G signalizacija, AC/DC |
| ISO 15118-20 | 2022 | V2G bidirekcijski, MCS podrška, TLS 1.3 |

#### Gotova rješenja za ISO 15118

| Proizvođač | Produkt | Značajke | Cijena |
|------------|---------|----------|--------|
| Vector | vSECC | Linux-based, certified | ~$2000+ |
| IoTecha | CCSoM | Complete module, HW+SW | ~$500-1000 |
| ChargePoint | Open source | Reference implementation | Besplatno |
| Switch EV | SECC Stack | Commercial license | ~$30-50k |
| Pionix | EVerest | Open source, Linux | Besplatno |

### 3.2 OCPP - Backend Communication

#### OCPP verzije

| Verzija | Značajke | Status |
|---------|----------|--------|
| OCPP 1.6J | JSON/WebSocket, bazično | Legacy, još široko |
| OCPP 2.0.1 | ISO 15118 integracija, security profiles, V2G | Preporučeno |
| OCPP 2.1 | Device management, ISO 15118-20 | Najnovije (2024) |

#### OCPP arhitektura

```
┌─────────────────────────────────────────────────────────────────┐
│                      OCPP ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   CHARGE POINT                           CSMS (Backend)         │
│   ┌───────────────┐                     ┌───────────────┐      │
│   │               │                     │               │      │
│   │ ┌───────────┐ │    WebSocket/TLS    │ ┌───────────┐ │      │
│   │ │OCPP Client│ │◄───────────────────►│ │OCPP Server│ │      │
│   │ └───────────┘ │   (JSON-RPC 2.0)    │ └───────────┘ │      │
│   │               │                     │               │      │
│   │ Messages:     │                     │ Messages:     │      │
│   │ - BootNotif.  │                     │ - RemoteStart │      │
│   │ - Authorize   │                     │ - SetChargePr │      │
│   │ - StartTrans  │                     │ - UpdateFirmw │      │
│   │ - MeterValues │                     │ - GetConfig   │      │
│   │ - StatusNotif │                     │ - Reset       │      │
│   │               │                     │               │      │
│   └───────────────┘                     └───────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### OCPP implementacije

| Produkt | Tip | Licenca | Značajke |
|---------|-----|---------|----------|
| OpenOCPP | Open source | Apache 2.0 | 1.6J + 2.0.1, embedded |
| SteVe | Open source | GPL | Backend, Java |
| OCPP.Core | Open source | MIT | .NET Core, backend |
| ChargeLab | Komercijalno | - | Full stack |
| Ampcontrol | Komercijalno | SaaS | AI optimization |

### 3.3 BMS komunikacija (CAN bus)

#### CAN protokoli za EV punjenje

| Standard | Primjena | Brzina |
|----------|----------|--------|
| DIN 70121 | DC charging (legacy) | 500 kbps |
| ISO 15118 CAN | Backup komunikacija | 500 kbps |
| SAE J1939 | Heavy-duty vehicles | 250/500 kbps |
| GB/T 27930 | Kinesko tržište | 250 kbps |

#### Tipične CAN poruke za punjenje

```
┌──────────────────────────────────────────────────────────────┐
│                 BMS → CHARGER MESSAGES                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ CAN ID 0x100: Battery Status                                │
│ ├── Byte 0-1: Pack Voltage (0.1V resolution)                │
│ ├── Byte 2-3: Pack Current (0.1A resolution, signed)        │
│ ├── Byte 4: State of Charge (0-100%)                        │
│ ├── Byte 5: State of Health (0-100%)                        │
│ └── Byte 6-7: Remaining Capacity (0.1 Ah)                   │
│                                                              │
│ CAN ID 0x101: Charge Request                                │
│ ├── Byte 0-1: Max Charge Voltage (0.1V)                     │
│ ├── Byte 2-3: Max Charge Current (0.1A)                     │
│ ├── Byte 4: Charge Enable (0/1)                             │
│ └── Byte 5-7: Reserved                                      │
│                                                              │
│ CAN ID 0x102: Cell Temperatures                             │
│ ├── Byte 0: Min Cell Temp (°C, offset -40)                  │
│ ├── Byte 1: Max Cell Temp (°C, offset -40)                  │
│ ├── Byte 2: Avg Cell Temp (°C, offset -40)                  │
│ └── Byte 3-7: Individual cell temps                         │
│                                                              │
│ CAN ID 0x103: Cell Voltages                                 │
│ ├── Byte 0-1: Min Cell Voltage (mV)                         │
│ ├── Byte 2-3: Max Cell Voltage (mV)                         │
│ └── Byte 4-5: Cell Voltage Delta (mV)                       │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                 CHARGER → BMS MESSAGES                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ CAN ID 0x200: Charger Status                                │
│ ├── Byte 0-1: Output Voltage (0.1V)                         │
│ ├── Byte 2-3: Output Current (0.1A)                         │
│ ├── Byte 4: Charger State (0=Off, 1=Ready, 2=Charging)      │
│ └── Byte 5: Fault Code                                      │
│                                                              │
│ CAN ID 0x201: Charger Capability                            │
│ ├── Byte 0-1: Max Output Voltage (0.1V)                     │
│ ├── Byte 2-3: Max Output Current (0.1A)                     │
│ └── Byte 4-5: Max Output Power (0.1 kW)                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. SOFTVER

### 4.1 Firmware arhitektura

```
┌─────────────────────────────────────────────────────────────────┐
│                   FIRMWARE ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                  APPLICATION LAYER                         │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │ │
│  │  │ Charging    │ │ Safety      │ │ Communication       │  │ │
│  │  │ State       │ │ Monitor     │ │ Manager             │  │ │
│  │  │ Machine     │ │             │ │ (ISO15118, OCPP)    │  │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘  │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │ │
│  │  │ Energy      │ │ Thermal     │ │ Diagnostics &       │  │ │
│  │  │ Metering    │ │ Management  │ │ Logging             │  │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                   CONTROL LAYER                            │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │              Real-Time Control Loops                 │  │ │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │  │ │
│  │  │  │ PFC     │  │ DC/DC   │  │ Current │  │ MPPT   │ │  │ │
│  │  │  │ Control │  │ Control │  │ Limit   │  │(solar) │ │  │ │
│  │  │  │ (10kHz) │  │ (10kHz) │  │         │  │        │ │  │ │
│  │  │  └─────────┘  └─────────┘  └─────────┘  └────────┘ │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    DRIVER LAYER                            │ │
│  │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐       │ │
│  │  │ PWM   │ │ ADC   │ │ CAN   │ │ SPI   │ │ GPIO  │       │ │
│  │  │Driver │ │Driver │ │Driver │ │Driver │ │Driver │       │ │
│  │  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                  HARDWARE ABSTRACTION                      │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │ MCU Peripherals (Timer, DMA, Interrupt, Watchdog)   │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                       RTOS                                 │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │ FreeRTOS / Zephyr / ThreadX / Bare-metal           │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 State Machine - Charging Session

```
┌─────────────────────────────────────────────────────────────────┐
│               CHARGING SESSION STATE MACHINE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                          ┌───────────┐                         │
│                          │   IDLE    │                         │
│                          │  (State A)│                         │
│                          └─────┬─────┘                         │
│                                │ Vehicle connected              │
│                                ▼                                │
│                          ┌───────────┐                         │
│                          │ CONNECTED │                         │
│                          │  (State B)│                         │
│                          └─────┬─────┘                         │
│                                │ SLAC complete                  │
│                                ▼                                │
│                          ┌───────────┐                         │
│                          │  SLAC/    │                         │
│                          │ MATCHING  │                         │
│                          └─────┬─────┘                         │
│                                │ V2G session established        │
│                                ▼                                │
│                          ┌───────────┐                         │
│                          │AUTHORIZING│                         │
│                          │           │                         │
│                          └─────┬─────┘                         │
│                                │ Authorized                     │
│                                ▼                                │
│                          ┌───────────┐                         │
│        ┌────────────────►│  CHARGE   │◄────────────────┐       │
│        │                 │NEGOTIATION│                 │       │
│        │                 └─────┬─────┘                 │       │
│        │                       │ Parameters agreed     │       │
│        │                       ▼                       │       │
│        │                 ┌───────────┐                 │       │
│        │                 │  PRE-     │                 │       │
│        │                 │ CHARGE    │                 │       │
│ Renegotiate              └─────┬─────┘          Pause  │       │
│        │                       │ Voltage matched       │       │
│        │                       ▼                       │       │
│        │                 ┌───────────┐                 │       │
│        └─────────────────│ CHARGING  │─────────────────┘       │
│                          │  (State C)│                         │
│                          └─────┬─────┘                         │
│                                │ Complete / Stop                │
│                                ▼                                │
│                          ┌───────────┐                         │
│                          │   POST-   │                         │
│                          │  CHARGE   │                         │
│                          └─────┬─────┘                         │
│                                │                                │
│                                ▼                                │
│                          ┌───────────┐                         │
│                          │DISCONNECT │                         │
│                          │           │                         │
│                          └─────┬─────┘                         │
│                                │                                │
│                                ▼                                │
│                          ┌───────────┐                         │
│                          │   IDLE    │                         │
│                          └───────────┘                         │
│                                                                 │
│  ERROR states (from any state):                                │
│  - FAULT (hardware fault)                                      │
│  - EMERGENCY_STOP                                              │
│  - COMMUNICATION_LOST                                          │
│  - ISOLATION_FAULT                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Kontrolni algoritmi

#### PID kontroler za strujnu petlju

```c
// Current control loop (runs at 10-20 kHz)
typedef struct {
    float Kp;           // Proportional gain
    float Ki;           // Integral gain
    float Kd;           // Derivative gain (usually 0)
    float integral;     // Integral accumulator
    float prev_error;   // Previous error for derivative
    float output_min;   // Anti-windup limits
    float output_max;
} PID_Controller;

float PID_Update(PID_Controller* pid, float setpoint, float measurement) {
    float error = setpoint - measurement;

    // Proportional term
    float P = pid->Kp * error;

    // Integral term with anti-windup
    pid->integral += pid->Ki * error * Ts;
    if (pid->integral > pid->output_max) pid->integral = pid->output_max;
    if (pid->integral < pid->output_min) pid->integral = pid->output_min;
    float I = pid->integral;

    // Derivative term
    float D = pid->Kd * (error - pid->prev_error) / Ts;
    pid->prev_error = error;

    // Calculate output
    float output = P + I + D;

    // Limit output
    if (output > pid->output_max) output = pid->output_max;
    if (output < pid->output_min) output = pid->output_min;

    return output;
}

// Typical tuning for current loop:
// Kp = 0.1 - 0.5
// Ki = 100 - 500
// Kd = 0 (current loops usually don't need derivative)
```

#### CC-CV (Constant Current - Constant Voltage) charging

```c
typedef enum {
    CHARGE_MODE_CC,      // Constant Current
    CHARGE_MODE_CV,      // Constant Voltage
    CHARGE_MODE_TAPER    // Taper (end of charge)
} ChargeMode;

typedef struct {
    float target_voltage;    // V
    float target_current;    // A
    float taper_current;     // A (typically 5-10% of max)
    float current_actual;
    float voltage_actual;
    ChargeMode mode;
} ChargeController;

void ChargeControl_Update(ChargeController* ctrl) {
    // Determine charging mode based on battery voltage
    if (ctrl->voltage_actual < ctrl->target_voltage - 5.0f) {
        // CC mode: battery voltage below target
        ctrl->mode = CHARGE_MODE_CC;
        // Current setpoint = target current
        current_setpoint = ctrl->target_current;
    }
    else if (ctrl->voltage_actual >= ctrl->target_voltage - 5.0f &&
             ctrl->current_actual > ctrl->taper_current) {
        // CV mode: voltage at target, current still high
        ctrl->mode = CHARGE_MODE_CV;
        // Regulate voltage, let current decrease naturally
        voltage_setpoint = ctrl->target_voltage;
    }
    else {
        // Taper mode: current below threshold
        ctrl->mode = CHARGE_MODE_TAPER;
        // End charging
        StopCharging();
    }
}
```

---

## 5. TERMALNO UPRAVLJANJE

### 5.1 Tekući rashladni sustav

```
┌─────────────────────────────────────────────────────────────────┐
│              LIQUID COOLING SYSTEM ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌───────────────────────────────────────────────────────┐    │
│   │                    COOLING LOOP                        │    │
│   │                                                        │    │
│   │   ┌──────────┐     ┌──────────┐     ┌──────────┐      │    │
│   │   │  Pumpa   │────►│Cold Plate│────►│Cold Plate│      │    │
│   │   │ 20-50 LPM│     │ (PFC)    │     │ (DC/DC)  │      │    │
│   │   └────┬─────┘     └──────────┘     └────┬─────┘      │    │
│   │        │                                  │            │    │
│   │        │      ┌───────────────────┐       │            │    │
│   │        │      │ Ekspanzijska      │       │            │    │
│   │        └──────┤ posuda            ├───────┘            │    │
│   │               │ (deaeracija)      │                    │    │
│   │               └─────────┬─────────┘                    │    │
│   │                         │                              │    │
│   │               ┌─────────▼─────────┐                    │    │
│   │               │    Radiator       │                    │    │
│   │               │  + ventilatori    │                    │    │
│   │               │  (2-4 kW odvod)   │                    │    │
│   │               └───────────────────┘                    │    │
│   │                                                        │    │
│   └───────────────────────────────────────────────────────┘    │
│                                                                 │
│   KOMPONENTE:                                                   │
│   ┌────────────────────────────────────────────────────────┐   │
│   │ • Pumpa: 24VDC brushless, 20-50 LPM, 2-5 bar          │   │
│   │   - Proizvođači: Bosch, Continental, Davies Craig      │   │
│   │                                                        │   │
│   │ • Cold plate: Aluminij, friction stir welded          │   │
│   │   - Termalna otpornost: 0.01-0.05 K/W                 │   │
│   │   - Proizvođači: Boyd, Aavid, Wakefield-Vette         │   │
│   │                                                        │   │
│   │ • Radiator: Aluminij, 2-4 kW kapacitet                │   │
│   │   - Ventilatori: 24VDC, 200-400 CFM ukupno            │   │
│   │                                                        │   │
│   │ • Rashladna tekućina: 50/50 voda/etilen glikol        │   │
│   │   - Temperatura: -35°C do +100°C                      │   │
│   │                                                        │   │
│   │ • Senzori: PT1000 (ulaz/izlaz), flow sensor          │   │
│   │                                                        │   │
│   └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Cold Plate dizajn

```
┌─────────────────────────────────────────────────────────────────┐
│                    COLD PLATE DESIGN                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   SERPENTINE CHANNEL LAYOUT:                                   │
│                                                                 │
│   Ulaz ────┐                                                   │
│            │                                                    │
│   ┌────────┴──────────────────────────────────────┐            │
│   │  ══════════════════════════════════════════  │            │
│   │                                              │  │            │
│   │  ══════════════════════════════════════════  │            │
│   │  │                                              │            │
│   │  ══════════════════════════════════════════  │            │
│   │                                              │  │            │
│   │  ══════════════════════════════════════════  │            │
│   └────────┬──────────────────────────────────────┘            │
│            │                                                    │
│   Izlaz ───┘                                                   │
│                                                                 │
│   SPECIFIKACIJE:                                               │
│   • Materijal: Aluminij 6061-T6                               │
│   • Debljina: 10-15 mm                                        │
│   • Širina kanala: 3-6 mm                                     │
│   • Dubina kanala: 3-5 mm                                     │
│   • Pad tlaka: 0.1-0.3 bar @ 10 LPM                           │
│   • Termalna otpornost: 0.02-0.05 K/W                         │
│                                                                 │
│   MONTAŽA POLUVODIČA:                                          │
│   • Thermal interface material (TIM): 1-5 W/mK                 │
│   • Pritisak: 200-400 kPa                                     │
│   • Ravnost površine: <50 µm                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Tekuće hlađeni kabel

```
┌─────────────────────────────────────────────────────────────────┐
│               LIQUID COOLED CABLE ASSEMBLY                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   PRESJEK KABLA:                                               │
│                                                                 │
│           ┌─────────────────────────────────┐                  │
│           │    Vanjski plašt (TPE/PUR)      │                  │
│           │  ┌───────────────────────────┐  │                  │
│           │  │  Armatura (opcionalno)    │  │                  │
│           │  │ ┌───────────────────────┐ │  │                  │
│           │  │ │ Rashladna cijev (IN)  │ │  │                  │
│           │  │ │   ┌───────────────┐   │ │  │                  │
│           │  │ │   │  DC+ vodič    │   │ │  │                  │
│           │  │ │   │  (35-70 mm²)  │   │ │  │                  │
│           │  │ │   └───────────────┘   │ │  │                  │
│           │  │ │   ┌───────────────┐   │ │  │                  │
│           │  │ │   │  DC- vodič    │   │ │  │                  │
│           │  │ │   │  (35-70 mm²)  │   │ │  │                  │
│           │  │ │   └───────────────┘   │ │  │                  │
│           │  │ │   ┌───────────────┐   │ │  │                  │
│           │  │ │   │ Signal vodiči │   │ │  │                  │
│           │  │ │   │ (CP, PP, PE)  │   │ │  │                  │
│           │  │ │   └───────────────┘   │ │  │                  │
│           │  │ └───────────────────────┘ │  │                  │
│           │  │ ┌───────────────────────┐ │  │                  │
│           │  │ │ Rashladna cijev (OUT) │ │  │                  │
│           │  │ └───────────────────────┘ │  │                  │
│           │  └───────────────────────────┘  │                  │
│           └─────────────────────────────────┘                  │
│                                                                 │
│   SPECIFIKACIJE:                                               │
│   • Struja: 400-500 A kontinuirano                            │
│   • Napon: 1000 VDC                                           │
│   • Vanjski promjer: 28-35 mm                                 │
│   • Težina: 2.5-4 kg/m (vs 6-8 kg/m air-cooled)              │
│   • Protok rashladne tekućine: 2-4 LPM                        │
│   • Temperatura kabla: <60°C površina                         │
│   • Životni vijek: >10,000 ciklusa                            │
│   • Standard: IEC 62893-4-2                                   │
│                                                                 │
│   PROIZVOĐAČI:                                                 │
│   • HUBER+SUHNER (Radox HPC)                                  │
│   • Leoni                                                      │
│   • Phoenix Contact                                            │
│   • ITT Cannon                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. SIGURNOSNI SUSTAVI

### 6.1 Ground Fault Detection

```
┌─────────────────────────────────────────────────────────────────┐
│                 GROUND FAULT PROTECTION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   AC STRANA (RCD Type B):                                      │
│   ┌────────────────────────────────────────────────────────┐   │
│   │                                                        │   │
│   │   L1 ───┬───[    ]───────────────────────────►        │   │
│   │         │   ┌───┐                                      │   │
│   │   L2 ───┼───│RCD│───────────────────────────►        │   │
│   │         │   │   │                                      │   │
│   │   L3 ───┼───│B  │───────────────────────────►        │   │
│   │         │   └─┬─┘                                      │   │
│   │   N  ───┴─────┼─────────────────────────────►        │   │
│   │               │                                        │   │
│   │               │ Trip @ 30 mA AC, 6 mA DC              │   │
│   │               ▼                                        │   │
│   │          [ Trip Coil ]                                 │   │
│   │                                                        │   │
│   └────────────────────────────────────────────────────────┘   │
│                                                                 │
│   DC STRANA (Isolation Monitoring):                            │
│   ┌────────────────────────────────────────────────────────┐   │
│   │                                                        │   │
│   │   DC+ ────────┬───────────────────────► To vehicle    │   │
│   │               │                                        │   │
│   │          ┌────┴────┐                                   │   │
│   │          │   IMD   │  Insulation Monitoring Device    │   │
│   │          │         │  (Bender IR155, IR425)           │   │
│   │          │  Riso   │                                   │   │
│   │          │ >100Ω/V │  Min. 100 kΩ @ 1000V = 100 kΩ   │   │
│   │          └────┬────┘                                   │   │
│   │               │                                        │   │
│   │   DC- ────────┴───────────────────────► To vehicle    │   │
│   │               │                                        │   │
│   │              PE (chassis ground)                       │   │
│   │                                                        │   │
│   └────────────────────────────────────────────────────────┘   │
│                                                                 │
│   TRIP LEVELS:                                                 │
│   • RCD (AC): 30 mA AC, 6 mA DC                               │
│   • IMD (DC): <100 kΩ warning, <50 kΩ trip                   │
│   • Response time: <100 ms                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Sigurnosne komponente

| Komponenta | Funkcija | Standard | Proizvođači |
|------------|----------|----------|-------------|
| RCD Type B | AC+DC fault detection | IEC 62423 | ABB, Siemens, Bender |
| IMD | DC izolacija monitoring | IEC 61557-8 | Bender, Megger |
| Emergency Stop | Hitno isključenje | IEC 60947-5-5 | Eaton, Schneider |
| Interlock | Konektor sigurnost | IEC 62196 | Phoenix, TE |
| Contactor | DC prekidanje | IEC 60947-4 | Gigavac, TE, Sensata |
| Fuse | Prekostrujna zaštita | IEC 60269 | Bussmann, Littelfuse |
| SPD | Prenaponi | IEC 61643 | Phoenix, Dehn |

### 6.3 Safety Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SAFETY ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │              SAFETY CONTROLLER (SIL 2)                  │  │
│   │  ┌─────────────────────────────────────────────────┐    │  │
│   │  │         Independent Safety MCU                   │    │  │
│   │  │    (separate from main control MCU)              │    │  │
│   │  └─────────────────────────────────────────────────┘    │  │
│   │                          │                               │  │
│   │    ┌─────────────────────┼─────────────────────┐        │  │
│   │    │                     │                     │        │  │
│   │    ▼                     ▼                     ▼        │  │
│   │ ┌──────┐           ┌──────────┐          ┌──────────┐  │  │
│   │ │E-Stop│           │Isolation │          │Over-     │  │  │
│   │ │Input │           │Monitor   │          │current   │  │  │
│   │ └──────┘           └──────────┘          └──────────┘  │  │
│   │    │                     │                     │        │  │
│   │    ▼                     ▼                     ▼        │  │
│   │ ┌──────────────────────────────────────────────────┐   │  │
│   │ │              SAFETY LOGIC (OR gate)              │   │  │
│   │ └──────────────────────────────────────────────────┘   │  │
│   │                          │                              │  │
│   │                          ▼                              │  │
│   │ ┌──────────────────────────────────────────────────┐   │  │
│   │ │        DC CONTACTOR CONTROL                      │   │  │
│   │ │  (redundant: 2 contactors in series)             │   │  │
│   │ └──────────────────────────────────────────────────┘   │  │
│   │                          │                              │  │
│   │    ┌─────────────────────┼─────────────────────┐       │  │
│   │    ▼                     ▼                     ▼       │  │
│   │ ┌──────┐           ┌──────────┐          ┌──────────┐ │  │
│   │ │K1    │           │K2        │          │Discharge │ │  │
│   │ │(main)│           │(redundant│          │Resistor  │ │  │
│   │ └──────┘           └──────────┘          └──────────┘ │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   RESPONSE TIMES:                                              │
│   • E-Stop to contactor open: <50 ms                          │
│   • Isolation fault to shutdown: <100 ms                       │
│   • Overcurrent to shutdown: <1 ms (hardware)                 │
│   • DC link discharge: <5 s to <60V                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. MJERENJE I BILLING

### 7.1 DC Energy Meter

```
┌─────────────────────────────────────────────────────────────────┐
│                    DC ENERGY METERING                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌───────────────────────────────────────────────────────┐    │
│   │                   MID CERTIFIED METER                  │    │
│   │                                                        │    │
│   │   DC+ ────┬────[Shunt]────┬──────────────► Output     │    │
│   │           │               │                            │    │
│   │           │    ┌──────────┴──────────┐                │    │
│   │           │    │                     │                │    │
│   │           │    │   ┌─────────────┐   │                │    │
│   │     Voltage    │   │    ADC      │   │   Current      │    │
│   │     Input      │   │  24-bit     │   │   Input        │    │
│   │           │    │   │  Σ-Δ        │   │                │    │
│   │           │    │   └──────┬──────┘   │                │    │
│   │           │    │          │          │                │    │
│   │           │    │   ┌──────▼──────┐   │                │    │
│   │           │    │   │    MCU      │   │                │    │
│   │           │    │   │ Energy Calc │   │                │    │
│   │           │    │   └──────┬──────┘   │                │    │
│   │           │    │          │          │                │    │
│   │           │    │   ┌──────▼──────┐   │                │    │
│   │           │    │   │   Crypto    │   │                │    │
│   │           │    │   │  (signing)  │   │                │    │
│   │           │    │   └──────┬──────┘   │                │    │
│   │           │    │          │          │                │    │
│   │           │    └──────────┼──────────┘                │    │
│   │           │               │                            │    │
│   │   DC- ────┴───────────────┴──────────────► Output     │    │
│   │                           │                            │    │
│   │                      RS485/Modbus                      │    │
│   │                      ili Ethernet                      │    │
│   │                                                        │    │
│   └───────────────────────────────────────────────────────┘    │
│                                                                 │
│   SPECIFIKACIJE:                                               │
│   • Točnost: Class 0.5 (IEC 62053-41) ili Class B (EN50470)   │
│   • Napon: 0-1000 VDC                                         │
│   • Struja: 0-500 A (ili više)                                │
│   • Sampling: 10-50 kHz                                        │
│   • Certifikati: MID, PTB, LNE, Eichrecht                     │
│   • Format podataka: OCMF (Open Charge Metering Format)       │
│                                                                 │
│   PROIZVOĐAČI:                                                 │
│   • LEM DCBM 400/600                                          │
│   • Accuenergy AcuDC 300                                      │
│   • Eastron DCM6 serija                                       │
│   • Isabellenhütte IEM-DCC                                    │
│   • Carlo Gavazzi EM340                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Cable Loss Compensation

```
Energija na konektoru ≠ Energija iz punjača

E_vehicle = E_charger - E_cable_loss

E_cable_loss = I² × R_cable × t

Gdje je:
- I = struja punjenja (A)
- R_cable = otpor kabla (tipično 1-5 mΩ za liquid-cooled)
- t = vrijeme

Za pravedno naplaćivanje, MID mjerač mora biti
što bliže konektoru vozila, ili koristiti 4-wire
mjerenje s kompenzacijom gubitaka kabla.
```

---

## 8. HMI I KORISNIČKO SUČELJE

### 8.1 Display sustav

```
┌─────────────────────────────────────────────────────────────────┐
│                      HMI ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌───────────────────────────────────────────────────────┐    │
│   │                  TOUCHSCREEN DISPLAY                   │    │
│   │                                                        │    │
│   │   ┌────────────────────────────────────────────────┐  │    │
│   │   │                                                │  │    │
│   │   │     ┌──────────────────────────────────┐      │  │    │
│   │   │     │         STATUS BAR               │      │  │    │
│   │   │     │  [Time] [Network] [Temp] [Power] │      │  │    │
│   │   │     └──────────────────────────────────┘      │  │    │
│   │   │                                                │  │    │
│   │   │     ┌──────────────────────────────────┐      │  │    │
│   │   │     │                                  │      │  │    │
│   │   │     │      MAIN CONTENT AREA          │      │  │    │
│   │   │     │                                  │      │  │    │
│   │   │     │  - Charging status              │      │  │    │
│   │   │     │  - Energy delivered             │      │  │    │
│   │   │     │  - Estimated time               │      │  │    │
│   │   │     │  - Cost                         │      │  │    │
│   │   │     │                                  │      │  │    │
│   │   │     └──────────────────────────────────┘      │  │    │
│   │   │                                                │  │    │
│   │   │     ┌──────────────────────────────────┐      │  │    │
│   │   │     │         PAYMENT/AUTH             │      │  │    │
│   │   │     │  [RFID] [Credit Card] [App]      │      │  │    │
│   │   │     └──────────────────────────────────┘      │  │    │
│   │   │                                                │  │    │
│   │   └────────────────────────────────────────────────┘  │    │
│   │                                                        │    │
│   │   SPECIFIKACIJE:                                      │    │
│   │   • Veličina: 7" - 15"                                │    │
│   │   • Rezolucija: 800×480 do 1920×1080                  │    │
│   │   • Tip: PCAP (Projected Capacitive)                  │    │
│   │   • Zaštita: IP65/IP66, IK08                          │    │
│   │   • Temperatura: -40°C do +85°C                       │    │
│   │   • Svjetlina: >500 nits (sunlight readable)          │    │
│   │                                                        │    │
│   └───────────────────────────────────────────────────────┘    │
│                                                                 │
│   PROIZVOĐAČI:                                                 │
│   • Winmate (industrijski panel PC)                           │
│   • UICO (PCAP touchscreen)                                   │
│   • Anders Electronics                                        │
│   • Elo Touch                                                 │
│   • Advantech                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 RFID i plaćanje

| Komponenta | Standard | Funkcija |
|------------|----------|----------|
| RFID čitač | ISO 14443 A/B, ISO 15693, NFC | Kartična autorizacija |
| EMV čitač | EMVCo Level 1/2 | Kontaktna kartica |
| NFC platforma | EMV Contactless | Beskontaktno plaćanje |
| PIN pad | PCI PTS | Unos PIN-a |

**PCI DSS zahtjevi:**
- Šifriranje podataka kartice
- Secure element za ključeve
- Tamper detection
- Redoviti sigurnosni auditi

---

## 9. EMC I EMI FILTRIRANJE

### 9.1 EMI Filter dizajn

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMI FILTER TOPOLOGY                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ULAZ (mreža)                              IZLAZ (PFC)         │
│                                                                 │
│   L ──┬──[Cx1]──┬──[L_DM]──┬──[Cx2]──┬──[L_CM]──┬──────► L     │
│       │         │          │         │          │               │
│       │    ┌────┴────┐     │    ┌────┴────┐     │               │
│   N ──┼────┤         ├─────┼────┤         ├─────┼──────► N     │
│       │    │  L_CM   │     │    │  L_CM   │     │               │
│       │    │ (Common │     │    │ (Common │     │               │
│       │    │  Mode)  │     │    │  Mode)  │     │               │
│       │    └────┬────┘     │    └────┬────┘     │               │
│       │         │          │         │          │               │
│   PE ─┴──[Cy]───┴──[Cy]────┴──[Cy]───┴──[Cy]────┴──────► PE    │
│                                                                 │
│   KOMPONENTE:                                                   │
│                                                                 │
│   Cx (X-kondenzatori, diferent. mod):                          │
│   • Kapacitet: 0.1 - 2.2 µF                                    │
│   • Napon: 310 VAC (X2 class)                                  │
│   • Tip: Film (PP)                                             │
│                                                                 │
│   Cy (Y-kondenzatori, common mode):                            │
│   • Kapacitet: 2.2 - 10 nF                                     │
│   • Napon: 250 VAC (Y2 class)                                  │
│   • Ograničenje: Leakage current < 3.5 mA                      │
│                                                                 │
│   L_CM (Common mode prigušnica):                               │
│   • Induktivitet: 1 - 10 mH                                    │
│   • Struja: Nominalna AC struja                                │
│   • Materijal jezgre: Nanokristal, ferrit                      │
│                                                                 │
│   L_DM (Differential mode prigušnica):                         │
│   • Induktivitet: 10 - 100 µH                                  │
│   • Leakage od CM prigušnice ili zasebna                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 EMC standardi

| Standard | Frekvencija | Limit | Primjena |
|----------|-------------|-------|----------|
| CISPR 11/32 Class B | 150 kHz - 30 MHz | Conducted | Residential |
| CISPR 11/32 Class A | 150 kHz - 30 MHz | Conducted | Industrial |
| CISPR 11/32 | 30 MHz - 1 GHz | Radiated | Svi |
| IEC 61000-4-3 | 80 MHz - 6 GHz | Immunity | 10 V/m |
| IEC 61000-4-4 | - | EFT/Burst | 4 kV |
| IEC 61000-4-5 | - | Surge | 4 kV L-PE |

---

## 10. MEHANIČKI DIZAJN

### 10.1 Kućište

| Parametar | Zahtjev |
|-----------|---------|
| IP zaštita | IP54 (indoor), IP65 (outdoor) |
| IK udarci | IK08 - IK10 |
| Materijal | Aluminij (hlađenje) + čelik (strukturno) |
| Pristup | Prednja vrata za servis |
| Ventilacija | Filtrirani ulaz zraka, zaštićeni izlaz |
| Boja | RAL 7035 (svijetlo siva) tipično |

### 10.2 Raspored komponenti

```
┌─────────────────────────────────────────────────────────────────┐
│                  CABINET LAYOUT (front view)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌───────────────────────────────────────────────────────┐    │
│   │                    VENTILATION                        │    │
│   │                    (filtered intake)                   │    │
│   └───────────────────────────────────────────────────────┘    │
│                                                                 │
│   ┌───────────────────────────────────────────────────────┐    │
│   │              POWER ELECTRONICS SECTION                │    │
│   │   ┌─────────────┐   ┌─────────────┐                  │    │
│   │   │    PFC      │   │   DC/DC     │                  │    │
│   │   │   Module    │   │   Module    │                  │    │
│   │   └─────────────┘   └─────────────┘                  │    │
│   │                                                       │    │
│   │   ┌─────────────────────────────────────────────┐    │    │
│   │   │           COLD PLATE (za poluvodiče)        │    │    │
│   │   └─────────────────────────────────────────────┘    │    │
│   └───────────────────────────────────────────────────────┘    │
│                                                                 │
│   ┌───────────────────────────────────────────────────────┐    │
│   │                 DC LINK CAPACITORS                    │    │
│   └───────────────────────────────────────────────────────┘    │
│                                                                 │
│   ┌───────────────────────────────────────────────────────┐    │
│   │              CONTROL ELECTRONICS SECTION              │    │
│   │   ┌─────────┐  ┌─────────┐  ┌─────────┐             │    │
│   │   │Main MCU │  │Comm MCU │  │  PSU    │             │    │
│   │   └─────────┘  └─────────┘  └─────────┘             │    │
│   └───────────────────────────────────────────────────────┘    │
│                                                                 │
│   ┌───────────────────────────────────────────────────────┐    │
│   │              AC INPUT / PROTECTION                    │    │
│   │   ┌─────┐  ┌─────┐  ┌─────────────┐  ┌──────┐       │    │
│   │   │Breaker│ │RCD  │  │ EMI Filter  │  │Contac│       │    │
│   │   └─────┘  └─────┘  └─────────────┘  └──────┘       │    │
│   └───────────────────────────────────────────────────────┘    │
│                                                                 │
│   ┌───────────────────────────────────────────────────────┐    │
│   │                 CABLE ENTRY (bottom)                   │    │
│   └───────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. BILL OF MATERIALS - 50 kW MODUL

### Procjena troškova komponenti

| Kategorija | Komponenta | Qty | Cijena/kom | Ukupno |
|------------|------------|-----|------------|--------|
| **Power Semiconductors** | | | | |
| | SiC MOSFET modul 1200V/300A | 2 | €350 | €700 |
| | Gate driver (isolated) | 4 | €12 | €48 |
| | Fast diodes | 6 | €15 | €90 |
| **Passives** | | | | |
| | DC link capacitors 500µF/900V | 2 | €80 | €160 |
| | PFC inductors 200µH | 3 | €60 | €180 |
| | HF transformer 50kW | 1 | €300 | €300 |
| | EMI filter (3-phase) | 1 | €150 | €150 |
| **Control** | | | | |
| | Main MCU (TMS320F28379D) | 1 | €25 | €25 |
| | Comm processor (STM32) | 1 | €15 | €15 |
| | ISO 15118 PLC modem | 1 | €50 | €50 |
| **Sensors** | | | | |
| | Current sensors (LEM) | 4 | €35 | €140 |
| | Voltage sensors | 2 | €20 | €40 |
| | Temperature sensors | 8 | €3 | €24 |
| **Safety** | | | | |
| | RCD Type B | 1 | €200 | €200 |
| | IMD (Bender) | 1 | €150 | €150 |
| | DC contactors | 2 | €80 | €160 |
| | Fuses | 4 | €20 | €80 |
| **Thermal** | | | | |
| | Cold plate | 1 | €200 | €200 |
| | Pump | 1 | €80 | €80 |
| | Radiator + fans | 1 | €150 | €150 |
| | Coolant, tubing, fittings | 1 | €50 | €50 |
| **Metering** | | | | |
| | DC energy meter (MID) | 1 | €300 | €300 |
| **HMI** | | | | |
| | Touchscreen display 7" | 1 | €150 | €150 |
| | RFID reader | 1 | €50 | €50 |
| **Mechanical** | | | | |
| | Enclosure (IP65) | 1 | €500 | €500 |
| | Wiring, connectors | 1 | €200 | €200 |
| | CCS2 connector + cable | 1 | €400 | €400 |
| **Aux Power** | | | | |
| | Auxiliary PSU (24V, 12V, 5V) | 1 | €100 | €100 |
| | | | | |
| **SUBTOTAL (komponente)** | | | | **€4,692** |
| Assembly, testing, overhead | | | 30% | €1,408 |
| **UKUPNO PROIZVODNI TROŠAK** | | | | **€6,100** |

### Usporedba s tržišnim cijenama

| Proizvod | Snaga | Tržišna cijena | Naš trošak | Marža |
|----------|-------|----------------|------------|-------|
| 50 kW modul | 50 kW | €15,000-20,000 | €6,100 | 60-70% |
| 150 kW sustav | 150 kW | €40,000-50,000 | €18,000 | 55-65% |
| 300 kW sustav | 300 kW | €75,000-90,000 | €35,000 | 50-60% |

---

## 12. REFERENCE I STANDARDI

### Ključni standardi

| Standard | Naziv | Primjena |
|----------|-------|----------|
| IEC 61851-1 | EV charging - General | Svi punjači |
| IEC 61851-23 | DC charging | DC fast charging |
| IEC 62196-3 | CCS connector | Konektor |
| ISO 15118-2/-20 | V2G communication | Komunikacija |
| OCPP 2.0.1 | Backend protocol | Backend |
| EN 50696 | Pantograph charging | Pantograph |
| IEC 61000-6-2/4 | EMC | EMC compliance |
| UL 2202 | DC charging (USA) | US tržište |

### Izvori informacija

- [MDPI: Power Converter Topologies for EV Fast-Charging](https://www.mdpi.com/2079-9292/12/7/1581)
- [Wolfspeed: SiC Solutions for DC Fast Charging](https://www.wolfspeed.com/knowledge-center/article/designing-with-silicon-carbide-sic-in-electric-vehicle-dc-fast-chargers/)
- [Onsemi: DC Fast EV Charging Topologies](https://www.onsemi.com/company/news-media/blog/automotive/en-us/dc-fast-ev-charging-common-system-topologies-and-power-devices)
- [TI: Isolated Gate Drivers for SiC](https://www.ti.com/isolated-gate-drivers)
- [Infineon: EiceDRIVER for SiC](https://www.infineon.com/products/power/gate-driver-ics/eicedriver-for-sic-mosfets/)
- [LEM: DC Billing Meters](https://www.lem.com/en/dcbm-400-600)
- [Bender: EV Charging Safety](https://www.benderinc.com/solutions/electric-vehicles/)
- [OpenOCPP: Open Source OCPP](https://openocpp.com/)
- [IEEE Spectrum: EV Charging Precision Cooling](https://spectrum.ieee.org/breaking-ev-charging-bottlenecks)
