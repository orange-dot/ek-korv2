# Poluvodičke Komponente za EV Punjače

## Pregled Tehnologija

### Evolucija Poluvodičke Tehnologije

```
Generacije Power Poluvodača:

   Si BJT → Si MOSFET → Si IGBT → SiC MOSFET → GaN HEMT
   1970s     1980s       1990s      2010s        2020s

Performanse vs. Generacija:
                                                    ★ GaN
   Efikasnost                               ★ SiC
   (%)        ★ Si IGBT
        95 ─────●─────────────●─────────────●────
                              ↑             ↑
        90 ────────●──────────│─────────────│────
                   │          │             │
                   Si         SiC           GaN
                   MOSFET     MOSFET        HEMT
```

## 1. Silicijum IGBT (Insulated Gate Bipolar Transistor)

### 1.1 Princip Rada

```
IGBT Struktura (NPT - Non-Punch Through):

         Emiter (E)    Gate (G)
            │             │
    ┌───────┴─────────────┴───────┐
    │  n+ │  p-body  │  n+        │ ← Emiter implant
    │     └────┬─────┘            │
    │          │ Kanal            │
    │     n- drift region         │ ← Određuje Vce
    │                             │
    │     n+ buffer layer         │ ← PT verzija
    │                             │
    │     p+ collector            │
    └─────────────────────────────┘
                  │
            Kolektor (C)

Ekvivalentna Šema:

         G ──┤├──┐
                 │
    E ────┬──────┴──────┬──── E
          │    MOSFET   │
          │      │      │
          └──────┼──────┘
                 │
          ┌──────┴──────┐
          │    PNP      │
          │  Bipolar    │
          └──────┬──────┘
                 │
    C ───────────┴─────────── C
```

### 1.2 IGBT Generacije

| Generacija | Godina | Vce(sat) @ 100A | Eoff (mJ) | f_sw max | Napomena |
|------------|--------|-----------------|-----------|----------|----------|
| Gen 3 | 2000 | 2.5 V | 25 | 10 kHz | NPT |
| Gen 4 | 2005 | 2.0 V | 18 | 15 kHz | Field-Stop |
| Gen 5 | 2010 | 1.7 V | 12 | 20 kHz | Trench FS |
| Gen 6 | 2015 | 1.5 V | 8 | 25 kHz | Micro-pattern |
| Gen 7 | 2020 | 1.45 V | 6 | 30 kHz | RC-IGBT |

### 1.3 Ključni Proizvođači IGBT Modula

#### Infineon PrimePACK/EconoPACK

```
EconoPACK+ 4 (FF450R12ME4):
┌─────────────────────────────────────┐
│                                     │
│   ┌─────┐   ┌─────┐   ┌─────┐      │
│   │ T1  │   │ T2  │   │ T3  │      │  Half-bridge
│   │     │   │     │   │     │      │  konfiguacija
│   └──┬──┘   └──┬──┘   └──┬──┘      │
│      │         │         │         │
│   ┌──┴──┐   ┌──┴──┐   ┌──┴──┐      │
│   │ D1  │   │ D2  │   │ D3  │      │
│   └─────┘   └─────┘   └─────┘      │
│                                     │
│   DC+  AC1  AC2  AC3  DC-          │
└───┬────┬────┬────┬────┬────────────┘
    │    │    │    │    │

Specifikacije FF450R12ME4:
- Vces: 1200 V
- Ic nom: 450 A
- Vce(sat): 1.70 V @ 450A, 125°C
- Eon: 32 mJ @ 450A, 600V, 125°C
- Eoff: 23 mJ @ 450A, 600V, 125°C
- Rth(j-c) IGBT: 0.034 K/W
- Rth(j-c) Diode: 0.062 K/W
- Tjmax: 175°C
```

#### Mitsubishi CM-Series

```
CM600DX-24T (NX-Series):
- Vces: 1200 V
- Ic: 600 A
- Vce(sat): 1.65 V @ 600A, 125°C
- Posebnost: Integrisan NTC termistor
- Pakovanje: Dual modul 62mm

Prednosti NX serije:
1. Niži Vce(sat) za manje kondukcione gubitke
2. Mekši switching za manji EMI
3. Bolji paralelni rad više modula
```

#### Semikron SEMiX / SEMITRANS

```
SEMiX453GB12E4s (Six-pack):

        DC+
         │
    ┌────┴────┬────────┬────────┐
    │         │        │        │
   ┌┴┐       ┌┴┐      ┌┴┐      │
   │ │T1     │ │T3    │ │T5    │
   └┬┘       └┬┘      └┬┘      │
    ├─U───────┼─V──────┼─W─────┤ AC izlazi
   ┌┴┐       ┌┴┐      ┌┴┐      │
   │ │T2     │ │T4    │ │T6    │
   └┬┘       └┬┘      └┬┘      │
    │         │        │        │
    └────┬────┴────────┴────────┘
         │
        DC-

Specifikacije:
- 6-pack konfiguracija za trofazni inverter
- Vces: 1200 V
- Ic: 450 A
- Ugrađena termalna zaštita
- Spring kontakti za lako montiranje
```

### 1.4 Proračun Gubitaka IGBT

```
Kondukcioni gubici:
P_cond = Vce(sat) × Ic × D

Gde je:
- Vce(sat) = Vce0 + r × Ic (linearizovano)
- D = duty cycle

Za sinusoidni izlaz:
P_cond = Ic × (Vce0/π + r×Ic/4) + Ic × m × cos(φ) × (Vce0/4 + r×Ic/(3π))

Switching gubici:
P_sw = f_sw × (Eon + Eoff) × (Vdc/Vref) × (Ic/Iref)

Gde je:
- f_sw = switching frekvencija
- Eon, Eoff = energije iz datasheeta
- Vref, Iref = referentni uslovi iz datasheeta

Ukupni gubici IGBT:
P_total = P_cond + P_sw

Primer proračuna (150 kW inverter):
- Vdc = 800 V, Ic = 200 A, f_sw = 16 kHz
- Vce(sat) = 1.7 V, Eon = 15 mJ, Eoff = 12 mJ
- D = 0.5, cos(φ) = 0.95

P_cond = 200 × 1.7 × 0.5 = 170 W
P_sw = 16000 × (15 + 12) × 10^-3 × (800/600) × (200/450)
P_sw = 16000 × 0.027 × 1.33 × 0.44 = 253 W
P_total = 170 + 253 = 423 W po IGBT
```

## 2. Silicijum Karbid (SiC) MOSFET

### 2.1 Materijalne Prednosti SiC

```
Poređenje Si vs SiC Materijala:

Parametar           │   Si      │   SiC (4H)  │ Faktor
────────────────────┼───────────┼─────────────┼────────
Bandgap (eV)        │   1.12    │   3.26      │  2.9×
Kritično polje      │   0.3     │   2.8       │  9.3×
(MV/cm)             │           │             │
Termalna provod.    │   1.5     │   4.9       │  3.3×
(W/cm·K)            │           │             │
Zasićena brzina e-  │   1.0     │   2.0       │  2.0×
(×10^7 cm/s)        │           │             │
Intrinsična temp.   │   150     │   900       │  6.0×
(°C)                │           │             │

Baliga Figure of Merit (BFOM):
BFOM = ε × μ × Ec³

SiC BFOM = 900 × Si BFOM

Praktični rezultat:
- 10× manji Rds(on) za istu naponsku klasu
- 3× veća radna temperatura
- 5-10× veća switching frekvencija
```

### 2.2 SiC MOSFET Struktura

```
Planar SiC MOSFET:

         Source (S)       Gate (G)
            │                │
    ┌───────┴────────────────┴───────┐
    │   n+  │    p-well    │  n+    │
    │       └──────┬───────┘        │
    │              │ Kanal (JFET)   │
    │         n- epitaksijalni      │
    │              sloj             │
    │                               │
    │         n+ SiC supstrat       │
    └───────────────────────────────┘
                   │
             Drain (D)

Trench SiC MOSFET (Novija generacija):

         S          G          S
         │          │          │
    ┌────┴────┬─────┴─────┬────┴────┐
    │   n+    │   Oxide   │   n+    │
    │ ┌───────┤           ├───────┐ │
    │ │ p-well│           │p-well │ │
    │ │       │ Poly-Si   │       │ │
    │ │       │   Gate    │       │ │
    │ └───────┤           ├───────┘ │
    │         └───────────┘         │
    │      n- drift region          │
    │                               │
    │      n+ SiC supstrat          │
    └───────────────────────────────┘
                   │
                   D

Prednosti Trench strukture:
- Eliminisan JFET efekat
- 30-40% niži Rds(on)
- Bolja gustina struje
```

### 2.3 Ključni SiC Proizvođači

#### Wolfspeed (Cree)

```
C3M0016120K (Gen 3):
┌─────────────────────────────────────┐
│ Parametar          │ Vrednost       │
├────────────────────┼────────────────┤
│ Vds                │ 1200 V         │
│ Rds(on) @ 25°C     │ 16 mΩ          │
│ Rds(on) @ 175°C    │ 28 mΩ          │
│ Id @ 25°C          │ 115 A          │
│ Id @ 100°C         │ 95 A           │
│ Qg (total)         │ 123 nC         │
│ Ciss               │ 3300 pF        │
│ Coss               │ 160 pF         │
│ Crss               │ 13 pF          │
│ Pakovanje          │ TO-247-4       │
│ Cena (qty 100)     │ ~$45           │
└─────────────────────────────────────┘

C3M0032120K (Niža struja, niža cena):
- Rds(on): 32 mΩ
- Id: 63 A
- Cena: ~$25

CAB425M12XM3 (Power Modul):
- Half-bridge konfiguracija
- Rds(on): 4.2 mΩ (po switchu)
- Id: 425 A kontinualno
- Integrisana termistorska zaštita
- 62mm industrijski footprint
```

#### Infineon CoolSiC

```
IMZ120R016M1H (1200V, TO-247-4):
- Rds(on): 16 mΩ @ 25°C
- Tehnologija: Trench
- .XT bonding za bolju pouzdanost
- Kelvin source pin za precizno upravljanje

FF6MR12W2M1_B11 (CoolSiC Modul):
┌─────────────────────────────────────┐
│ EasyPACK 2B Half-Bridge             │
├─────────────────────────────────────┤
│ Vds: 1200 V                         │
│ Rds(on): 6 mΩ (po switchu)          │
│ Id: 400 A                           │
│ Package: 34mm                       │
│ Integrisan driver: Opciono          │
└─────────────────────────────────────┘

Infineon HybridPACK Drive:
- Kombinacija IGBT + SiC dioda
- Optimizovan za EV traction
- Kompaktno pakovanje
```

#### ROHM

```
SCT3022AL (3rd Gen):
- Vds: 650 V (za 400V sisteme)
- Rds(on): 22 mΩ
- Trench struktura
- TO-247N pakovanje

SCT4045DR (4th Gen, 1200V):
- Rds(on): 45 mΩ
- Poboljšana Crss (niža)
- Robusniji gate oxide

BSM300D12P3G002 (Full SiC Modul):
- 1200V/300A half-bridge
- Rds(on): 5 mΩ
- Optimizovan za 50+ kHz
```

#### STMicroelectronics

```
SCTW90N65G2V (Gen 2):
- Vds: 650 V
- Rds(on): 18 mΩ
- Nizak Qg: 58 nC
- HiP247 pakovanje (izolovano)

STPSC20H12 (SiC Schottky Dioda):
- Vrrm: 1200 V
- If: 20 A
- Vf: 1.35 V @ 20A
- Zero reverse recovery
```

### 2.4 Proračun Gubitaka SiC MOSFET

```
Kondukcioni gubici:
P_cond = Irms² × Rds(on)(Tj)

Temperaturna zavisnost Rds(on):
Rds(on)(T) = Rds(on)(25°C) × [1 + α×(T-25)]

Tipično α = 0.004 do 0.006 /°C za SiC
(Znatno bolje od Si IGBT gde je α ~ 0.02)

Switching gubici:
P_sw = 0.5 × f_sw × Vds × Id × (tr + tf)

Gde je:
- tr = rise time ≈ Qg / Ig(on)
- tf = fall time ≈ Qg / Ig(off)

Praktičnije preko energija:
P_sw = f_sw × (Eon + Eoff)

SiC tipične vrednosti (vs IGBT):
- Eon: 0.3 mJ vs 15 mJ (50× manje)
- Eoff: 0.2 mJ vs 12 mJ (60× manje)

Primer (150 kW, 800V, 200A, 50 kHz):
Rds(on) @ 125°C = 16 mΩ × 1.5 = 24 mΩ
P_cond = (200 × 0.707)² × 0.024 = 480 W
P_sw = 50000 × (0.3 + 0.2) × 10^-3 = 25 W
P_total = 505 W

Poređenje sa IGBT @ 16 kHz:
IGBT: 423 W @ 16 kHz
SiC:  505 W @ 50 kHz

Pri istoj frekvenciji (16 kHz):
SiC P_sw = 16000 × 0.5 × 10^-3 = 8 W
SiC P_total = 480 + 8 = 488 W (slično IGBT)

ALI: SiC može raditi na 50+ kHz
→ Manji magnetics, manji filter
→ Ukupno manji i lakši sistem
```

### 2.5 SiC Izazovi i Rešenja

```
Problem 1: Gate Oxide Pouzdanost
───────────────────────────────────
Uzrok: Defekti na SiC/SiO2 interfejsu
Simptom: Vth drift, threshold instabilnost

Rešenja:
- Koristiti Vgs = +15V/-4V (ne +20V/-5V)
- Izbegavati Vgs > 18V
- Soft turn-on za smanjenje dV/dt

Problem 2: Paralelni Rad
───────────────────────────────────
Uzrok: Negativni temperaturni koef. Rds(on)
       na niskim strujama

Rešenja:
- Matching uređaja (±5% Vth)
- Simetrična PCB layout
- Gate otpornici za svaki uređaj
- Derating (80% nominalne struje)

Problem 3: Short Circuit Kapacitet
───────────────────────────────────
SiC: 2-5 μs vs IGBT: 10+ μs

Rešenja:
- Brza desaturaciona zaštita (<1 μs)
- Active Miller Clamp
- Soft turn-off sekvenca

Problem 4: Cena
───────────────────────────────────
SiC: ~$0.30/A vs IGBT: ~$0.10/A

Trend: 15-20% godišnje smanjenje
Projekcija: Paritet 2026-2028
```

## 3. Galijum Nitrid (GaN)

### 3.1 GaN vs SiC Pozicioniranje

```
Aplikacioni Prostor:

Snaga (kW)
    │
 500├───────────────────────────────
    │                    │ SiC     │
 200├───────────────────┼─────────┤
    │         │ SiC     │ SiC/Si  │
 100├─────────┼─────────┼─────────┤
    │   GaN   │ SiC/GaN │   Si    │
  50├─────────┼─────────┼─────────┤
    │   GaN   │   GaN   │   Si    │
  10├─────────┼─────────┼─────────┤
    │   GaN   │   GaN   │   Si    │
    └─────────┴─────────┴─────────┴──→ Napon (V)
         400     650     1200

Za EV punjače (>50 kW):
- 400V sistemi: GaN ili SiC
- 800V sistemi: SiC dominira
- >100 kW: SiC preferiran
```

### 3.2 GaN HEMT Struktura

```
Enhancement-mode GaN HEMT:

         S          G          D
         │          │          │
    ┌────┴────┬─────┴─────┬────┴────┐
    │   n+    │   p-GaN   │   n+    │
    │         │   (gate)  │         │
    │     ────┴───────────┴────     │
    │         AlGaN barrier         │
    │     ════════════════════      │ ← 2DEG
    │         GaN buffer            │
    │                               │
    │         Si supstrat           │
    └───────────────────────────────┘

2DEG (Two-Dimensional Electron Gas):
- Visoka mobilnost elektrona
- Nizak Rds(on) bez drift regiona
- Lateralna struktura (surface mount)
```

### 3.3 GaN Proizvođači za EV Punjače

#### GaN Systems

```
GS66516T (650V, Top-cooled):
- Vds: 650 V
- Rds(on): 25 mΩ
- Id: 60 A
- Package: GaNPX (SMD)
- Reverse conduction: Da (bez body diode)

GS-EVB-HB-66508B-ON (Eval Board):
- Half-bridge 650V/30A
- Includes gate driver
- Za razvoj 10-20 kW faza
```

#### Efficient Power Conversion (EPC)

```
EPC2206 (80V klasa - za DC/DC):
- Vds: 80 V
- Rds(on): 1.8 mΩ
- Id: 90 A
- Chip-scale package

EPC2218 (100V):
- Za niskonaponske DC/DC stage
- Idealan za LLC sekundare

Napomena: EPC fokusiran na <200V
Za AC/DC stage potrebni 650V+ uređaji
```

#### Navitas

```
GaNFast NV6128 (650V):
- Integrisano: GaN + driver
- Half-bridge u jednom pakovanju
- Pojednostavljen dizajn
- Za OBC (On-Board Charger) aplikacije

Napomena: Trenutno do ~10 kW
Ne preporučuje se za >50 kW DC punjače
```

### 3.4 GaN Primena u EV Punjačima

```
Gde ima smisla koristiti GaN:

1. On-Board Charger (OBC) - 7-22 kW
   ✓ Kritična veličina/težina
   ✓ 400V sistemi dominantni
   ✓ GaN @ 500 kHz omogućava kompaktnost

2. DC/DC Konverter u vozilu
   ✓ 400V → 12V/48V
   ✓ Visoka frekvencija za malu veličinu

3. Bidirekcioni V2G punjači <20 kW
   ✓ Rezidencijalna primena
   ✓ Premium segment

Gde SiC dominira:

1. DC Fast Charging >50 kW
   ✓ Potrebna 1200V klasa
   ✓ Visoke struje (>200A)
   ✓ GaN 650V ne pokriva 800V arhitekture

2. Pantograph sistemi
   ✓ Ekstremne snage (>300 kW)
   ✓ Robusnost važnija od efikasnosti
```

## 4. Diode Tehnologije

### 4.1 Si Fast Recovery Diode

```
Karakteristike:
- Vrrm: do 1200V
- Trr: 50-200 ns
- Qrr: visok (uzrokuje gubitke)
- Cena: najniža

Primena:
- Jeftini punjači
- Niska switching frekvencija (<20 kHz)
- Snubber diode
```

### 4.2 SiC Schottky Diode

```
Prednosti vs Si FRD:
- Zero reverse recovery
- Bez Qrr gubitaka
- Stabilno preko temperature
- Pozitivan temp. koef. Vf

Ključni proizvodi:

Wolfspeed C4D20120D:
- Vrrm: 1200 V
- If: 20 A
- Vf: 1.5 V @ 20A
- Qc: 40 nC

ROHM SCS220AM:
- Vrrm: 650 V
- If: 20 A
- Vf: 1.35 V
- AEC-Q101 kvalifikovan

Infineon IDH16G65C6:
- Vrrm: 650 V
- If: 16 A
- Vf: 1.5 V
- Merged PiN Schottky (MPS)
```

### 4.3 SiC vs Si Dioda u Vienna Rectifier

```
Uticaj na performanse:

Sa Si FRD (Trr = 100ns, Qrr = 2μC):
                     ┌──────┐
  Struja ───────────┤      ├─────────
                     │      │
                     │      │  Reverse
                     │      │  recovery
                     └──┬───┘
                        │
                        ▼ Gubitak

Sa SiC Schottky (Trr ≈ 0):
                     ┌──────┐
  Struja ───────────┤      │─────────
                     │      │
                     └──────┘
                     Bez reverse recovery

Praktični rezultat za 50 kW Vienna:
- Si FRD @ 50 kHz: 150 W diodni gubici
- SiC Schottky @ 50 kHz: 25 W diodni gubici
- Ušteda: 125 W × 6 dioda = 750 W!
```

## 5. Modularni Power Blokovi

### 5.1 Integrisani Power Moduli

```
Prednosti integrisanih modula:
1. Optimizovan layout (minimalni paraziti)
2. Matched komponente
3. Integrisana zaštita
4. Jednostavnije hlađenje
5. Sertifikovano ponašanje

Nedostaci:
1. Manja fleksibilnost
2. Lead time problemi
3. Viša cena po W
4. Teža zamena
```

### 5.2 Infineon FF-Series za Punjače

```
FF8MR12W2M1H_B11 (CoolSiC Easy 1B):

┌──────────────────────────────────────┐
│  ┌─────────────────────────────────┐ │
│  │        High Side MOSFET         │ │
│  │   Rds(on) = 8 mΩ, Id = 480A     │ │
│  ├─────────────────────────────────┤ │
│  │         AC Terminal             │ │
│  ├─────────────────────────────────┤ │
│  │        Low Side MOSFET          │ │
│  │   Rds(on) = 8 mΩ, Id = 480A     │ │
│  └─────────────────────────────────┘ │
│                                      │
│   DC+  DC-  AC  NTC                  │
└───┬────┬────┬───┬────────────────────┘
    │    │    │   │

Termalne karakteristike:
- Rth(j-c): 0.12 K/W per switch
- Tjmax: 175°C
- Footprint: 34mm × 62mm
```

### 5.3 Wolfspeed XM3 Platforma

```
CAB450M12XM3:
┌─────────────────────────────────────┐
│  Specifikacija        │ Vrednost    │
├───────────────────────┼─────────────┤
│  Topologija           │ Half-bridge │
│  Vds                  │ 1200 V      │
│  Rds(on) @ 25°C       │ 4.5 mΩ      │
│  Id kontinualno       │ 450 A       │
│  Id peak (1ms)        │ 850 A       │
│  Rth(j-c)            │ 0.09 K/W    │
│  Creepage             │ 5 mm        │
│  Package              │ 62mm        │
└─────────────────────────────────────┘

Dostupni gate driveri:
- CGD12HBXMP (Wolfspeed)
- 2SP0215T2A0-12 (Power Integrations)
- SKYPER 42LJ (Semikron)
```

## 6. Izbor Poluvodiča za EV Punjač

### 6.1 Decision Matrix

```
Kriterijumi izbora (težinski):

                    │ Težina │ IGBT │ SiC │ Hibrid
────────────────────┼────────┼──────┼─────┼────────
Efikasnost          │   25%  │  3   │  5  │   4
Gustina snage       │   20%  │  2   │  5  │   3
Cena komponenti     │   20%  │  5   │  2  │   3
Pouzdanost (proven) │   15%  │  5   │  3  │   4
Dostupnost          │   10%  │  5   │  3  │   4
Složenost dizajna   │   10%  │  4   │  2  │   3
────────────────────┼────────┼──────┼─────┼────────
UKUPNO              │  100%  │ 3.65 │ 3.5 │  3.45

Rezultat: Zavisi od prioriteta!

Za EXPO 2027 (brz razvoj, pouzdanost):
→ IGBT ili Hybrid preporučen

Za premium proizvod (efikasnost):
→ Full SiC preporučen
```

### 6.2 Preporučena Konfiguracija po Snazi

```
50 kW DC Punjač:
├── PFC Stage: Vienna Rectifier
│   ├── Switches: IGBT 1200V/75A × 6
│   │   └── Infineon IKW75N120CH3
│   └── Diode: SiC Schottky 1200V/20A × 6
│       └── Wolfspeed C4D20120D
│
└── DC/DC Stage: LLC + Full Bridge
    ├── Primary: IGBT 1200V/150A × 4
    │   └── Infineon IKW150N120H3
    └── Secondary: SiC Schottky 650V/60A × 4
        └── ROHM SCS260AM

150 kW DC Punjač:
├── PFC Stage: AFE (Active Front End)
│   └── SiC Module 1200V/300A × 3
│       └── Wolfspeed CAB450M12XM3
│
└── DC/DC Stage: DAB
    ├── Primary: SiC Module 1200V/300A × 2
    └── Secondary: SiC Module 1200V/300A × 2

300+ kW Pantograph:
├── Modularni pristup: 3-4 × 100kW modula
├── Svaki modul: Full SiC
└── Paralelni DC izlaz sa load sharing
```

### 6.3 Bill of Materials - Poluvodici (150 kW)

```
┌────────────────────────────────────────────────────────┐
│ Komponenta              │ Qty │ Jed. cena │   Ukupno  │
├─────────────────────────┼─────┼───────────┼───────────┤
│ SiC Module 1200V/450A   │  6  │   €450    │  €2,700   │
│ (Wolfspeed CAB450M12XM3)│     │           │           │
├─────────────────────────┼─────┼───────────┼───────────┤
│ SiC Gate Driver         │  6  │   €120    │   €720    │
│ (CGD12HBXMP)           │     │           │           │
├─────────────────────────┼─────┼───────────┼───────────┤
│ SiC Schottky 1200V/40A  │  12 │   €25     │   €300    │
│ (C4D40120D)            │     │           │           │
├─────────────────────────┼─────┼───────────┼───────────┤
│ TVS/Protection         │ set │   €150    │   €150    │
├─────────────────────────┼─────┼───────────┼───────────┤
│ NTC/Temperature Sensors │  12 │   €5      │   €60     │
├─────────────────────────┼─────┼───────────┼───────────┤
│ UKUPNO POLUVODICI      │     │           │  €3,930   │
└────────────────────────────────────────────────────────┘

IGBT alternativa (manja efikasnost):
- IGBT Moduli (×6): €1,800
- Fast Recovery Diode: €200
- Gate Driveri: €480
- UKUPNO: €2,600 (34% manje)

Trade-off:
SiC: +€1,330 ali -2% gubitaka = 3 kW ušteda
@ 0.15 €/kWh, 8h/dan, 300 dana = €1,080/god ušteda
ROI: 1.2 godine
```

## 7. Testiranje i Karakterizacija

### 7.1 Statičko Testiranje

```
Parametri za merenje:

1. Vce(sat) / Rds(on) vs Temperature
   ┌────────────────────────────────┐
   │ Test Setup:                    │
   │ - Curve tracer (Keysight B1505)│
   │ - Thermal chamber (-40 to 175°C)│
   │ - Pulsed measurement (<1ms)    │
   └────────────────────────────────┘

2. Gate Karakteristike
   - Vth (threshold voltage)
   - gm (transconductance)
   - Ciss, Coss, Crss vs Vds

3. Breakdown Voltage
   - Vces/Vds @ Ic/Id = 1mA
   - Leakage current @ rated voltage

4. Thermal Impedance
   - Zth(j-c) transient curve
   - Rth junction to case
```

### 7.2 Dinamičko Testiranje

```
Double Pulse Test Setup:

    Vdc ──┬──────────┬───────────
          │          │
         ═╪═ Cdc    ┌┴┐
          │         │ │ Load
          │         │L│ Inductor
          │         └┬┘
          │          │
          └────┬─────┤
              ┌┴┐    │
         DUT  │ │ ←──┼── Gate Driver
              └┬┘    │
               │     │
    GND ───────┴─────┴───────────

Mereni parametri:
- tr, tf (rise/fall time)
- td(on), td(off) (delay time)
- Eon, Eoff (switching energy)
- di/dt, dv/dt
- Overshoot, ringing

Test uslovi (tipično):
- Vdc = 800V (za 1200V uređaje)
- Id = rated current
- Tj = 25°C, 125°C, 150°C
- Rg = 0Ω, 10Ω, 20Ω (za Rg optimizaciju)
```

### 7.3 Pouzdanost i Životni Vek

```
Accelerated Life Testing:

1. Power Cycling Test
   ┌──────────────────────────────────┐
   │ Ton: 2s heating                  │
   │ Toff: 2s cooling                 │
   │ ΔTj: 100°C                       │
   │ Cycles: >100,000 za kvalifikaciju│
   └──────────────────────────────────┘

2. Thermal Cycling
   - -40°C to +125°C
   - 1000 ciklusa minimum

3. High Temperature Reverse Bias (HTRB)
   - Vds = 80% rated, Tj = 150°C
   - 1000 sati

4. High Temperature Gate Bias (HTGB)
   - Vgs = max rated
   - 1000 sati @ 150°C

5. Humidity Testing (H3TRB)
   - 85°C, 85% RH
   - Vds = 80% rated
   - 1000 sati

MTBF Proračun:
Za SiC modul u 150 kW punjač:
- Operating hours: 6000 h/god
- Tj average: 100°C
- Load cycles: 50,000/god
- Očekivani MTBF: 200,000+ sati
- Očekivani životni vek: 15+ godina
```

## 8. Emerging Technologies

### 8.1 GaN na SiC Supstratu

```
GaN-on-SiC Prednosti:
- Bolja termalna provodnost (SiC substrat)
- Veća gustina snage
- Potencijal za >1000V klase

Status: R&D faza
Dostupnost: 2026+
```

### 8.2 Diamond Semiconductors

```
Ultra-Wide Bandgap:
- Bandgap: 5.5 eV (vs 3.3 SiC)
- Kritično polje: 10 MV/cm
- Termalna provodnost: 22 W/cm·K

Status: Laboratorija
Komercijalizacija: 2030+
```

### 8.3 Vertical GaN

```
GaN-on-GaN:
- Eliminiše Si substrat ograničenja
- Omogućava >1200V klase
- Vertikalna struktura kao SiC

Status: Early production
Dostupnost: 2025-2026
```

## 9. Zaključak i Preporuke

### Za EXPO 2027 Projekat:

```
Strategija 1: Konzervativan pristup
- PFC: IGBT + SiC diode (Hybrid)
- DC/DC: IGBT + SiC Schottky
- Prednost: Proverena pouzdanost
- Risk: Nizak

Strategija 2: Performance pristup
- Full SiC dizajn
- Veća efikasnost, manja veličina
- Prednost: Premium pozicioniranje
- Risk: Srednji (supply chain)

Strategija 3: Platforma pristup
- Dizajn za obe opcije
- Zajednički gate driver, layout
- Zamena IGBT ↔ SiC modula
- Prednost: Fleksibilnost
- Risk: Veći inicijalni development cost

PREPORUKA: Strategija 3
- Započeti sa IGBT za brzu validaciju
- Upgrade na SiC za volume production
- Zadržati obe opcije za različite segmente
```
