# Gate Driver Dizajn za EV Punjače

## 1. Uvod u Gate Driving

### 1.1 Uloga Gate Drivera

```
Blok Dijagram Sistema:

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   MCU/DSP   │────▶│ Gate Driver │────▶│ Power Stage │
│  (3.3V PWM) │     │ (Izolovan)  │     │ (IGBT/SiC)  │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                    ┌─────┴─────┐
                    │ Funkcije: │
                    │ - Izolacija│
                    │ - Pojačanje│
                    │ - Zaštita  │
                    │ - Timing   │
                    └───────────┘

Zašto je Gate Driver Kritičan:

1. Naponsko pojačanje: 3.3V → ±15V (IGBT) ili +15V/-4V (SiC)
2. Strujno pojačanje: mA → Amperi (peak gate current)
3. Galvanska izolacija: LV kontrola ↔ HV power
4. Zaštite: Desaturacija, UVLO, prekostruja
5. Timing kontrola: Dead-time, soft turn-off
```

### 1.2 Gate Driver Zahtevi po Tehnologiji

| Parametar | Si IGBT | SiC MOSFET | GaN HEMT |
|-----------|---------|------------|----------|
| Vgs(on) | +15V | +15V do +18V | +5V do +6V |
| Vgs(off) | 0V do -8V | -4V do -5V | 0V do -3V |
| Peak Ig | 2-5 A | 5-15 A | 2-5 A |
| dv/dt immunity | 50 kV/μs | 100+ kV/μs | 100+ kV/μs |
| Propagation delay | <500 ns | <100 ns | <50 ns |
| Dead-time | 1-3 μs | 100-500 ns | 50-200 ns |
| Izolacija | 1200V | 1500V+ | 650V |

## 2. Topologije Gate Drivera

### 2.1 Jednostepeni Gate Driver

```
Šema jednostepenog gate drivera:

            Vcc (+15V)
               │
               │
          ┌────┴────┐
          │   Rg    │
          │  ┌──┴──┐│
          │  │     ││
PWM ──────┼──┤ U1  ├┼────┬──── Gate
          │  │     ││    │
          │  └──┬──┘│   ═╪═ Cgs
          │     │   │    │
          └────┬────┘    │
               │         │
              GND ───────┴──── Source

Komponente:
- U1: Gate driver IC (npr. UCC27531)
- Rg: Gate otpornik (1-20Ω)
- Cgs: Gate-Source kapacitivnost (interno)

Ograničenja:
- Bez izolacije
- Samo za low-side switching
- Nije pogodno za high-side
```

### 2.2 Izolovani Gate Driver

```
Izolovani gate driver sa optokuplerom:

     ┌─────────────────┬──────────────────────┐
     │   PRIMARY       │      SECONDARY       │
     │                 │                      │
     │    Vcc1         │         Vcc2         │
     │     │           │          │           │
     │ ┌───┴───┐   ┌───┴───┐  ┌───┴───┐      │
     │ │       │   │ ISO   │  │       │      │
PWM ─┼─┤ Input ├───┤ ▓▓▓▓▓ ├──┤Output ├──Rg──┼── Gate
     │ │ Stage │   │Barrier│  │ Stage │      │
     │ └───┬───┘   └───┬───┘  └───┬───┘      │
     │     │           │          │           │
     │    GND1         │         GND2         │
     │                 │                      │
     └─────────────────┴──────────────────────┘
                       │
                   Izolacija
                   (2.5-5 kV)

Tipovi izolacije:
1. Optokupler - tradicionalno, sporije
2. Kapacitivna - brža, CMTI dobra
3. Induktivna (transformator) - najbrža
4. GMR (Giant Magnetoresistive) - novije
```

### 2.3 Half-Bridge Gate Driver

```
Integrisani half-bridge driver:

                     Vboot
                       │
                    ┌──┴──┐
              Dboot │  │  │
         Vcc ──────►┤  │  │ Cboot
                    │  │  │
                    └──┬──┘
                       │
     ┌─────────────────┼────────────────────┐
     │                 │                    │
     │            ┌────┴────┐               │
     │            │  HIGH   │               │
HIN ─┼───────────►│  SIDE   ├───────── HO ──┼── High Gate
     │            │ DRIVER  │               │
     │            └────┬────┘               │
     │                 │                    │
     │                 ├──────────────── VS │ (Switch Node)
     │                 │                    │
     │            ┌────┴────┐               │
     │            │  LOW    │               │
LIN ─┼───────────►│  SIDE   ├───────── LO ──┼── Low Gate
     │            │ DRIVER  │               │
     │            └────┬────┘               │
     │                 │                    │
     │                GND                   │
     └──────────────────────────────────────┘

Bootstrap napajanje High-Side drivera:
- Cboot se puni kada je Low-Side ON
- Dboot sprečava pražnjenje nazad
- Cboot ≥ 10 × Qg (gate charge)
- Refresh potreban (ne može 100% duty cycle)
```

## 3. Komercijalni Gate Driveri

### 3.1 Za IGBT Module

#### Infineon EiceDRIVER

```
1ED020I12-F2 (Single Channel):
┌─────────────────────────────────────┐
│ Parametar          │ Vrednost       │
├────────────────────┼────────────────┤
│ Izlazna struja     │ ±2 A peak      │
│ Izolacija          │ 1200 V         │
│ CMTI               │ 50 kV/μs       │
│ Propagation delay  │ 100 ns typ     │
│ Pulse width dist.  │ 10 ns          │
│ Vcc range          │ 13-20 V        │
│ Desaturacija       │ Da             │
│ UVLO               │ Da             │
│ Soft turn-off      │ Da             │
│ Package            │ DSO-16         │
│ Cena               │ ~€8            │
└─────────────────────────────────────┘

2ED020I12-F2 (Dual Channel za Half-Bridge):
- Iste karakteristike
- Integrisana dead-time kontrola
- Interlock funkcija
```

#### SKYPER Prime (Semikron)

```
SKYPER 32PRO R:
┌─────────────────────────────────────┐
│ Profesionalni IGBT driver           │
├─────────────────────────────────────┤
│ Izlazna struja: ±15 A peak          │
│ Izolacija: 2500 Vrms / 1 min        │
│ CMTI: 50 kV/μs                      │
│ Zaštite:                            │
│   - VCE desaturacija monitoring     │
│   - Soft shutdown                   │
│   - Active clamping opcija          │
│   - UVLO sa hysterezom              │
│ Power supply: ±15V, izolovan DC/DC  │
│ Cena: ~€80                          │
└─────────────────────────────────────┘

Primena: Industrijski IGBT moduli
         FF-series, SEMITRANS, itd.
```

### 3.2 Za SiC MOSFET

#### Wolfspeed CGD Series

```
CGD12HBXMP (za XM3 module):
┌─────────────────────────────────────┐
│ Optimizovan za SiC MOSFET           │
├─────────────────────────────────────┤
│ Izlazna struja: ±10 A peak          │
│ Vgs izlaz: +15V / -4V               │
│ Izolacija: 2.5 kV                   │
│ CMTI: 100 kV/μs                     │
│ Propagation delay: 80 ns            │
│ Rise/Fall time: 8 ns                │
│                                     │
│ SiC-specifične funkcije:            │
│   - Dvostepeni turn-off             │
│   - Active Miller clamp             │
│   - Desaturacija < 1 μs reakcija    │
│   - Soft turn-off za short circuit  │
│                                     │
│ Integrisani DC/DC konverter         │
│ Cena: ~€120                         │
└─────────────────────────────────────┘
```

#### Silicon Labs Si828x

```
Si8285 (Dual Isolated):
┌─────────────────────────────────────┐
│ Parametar          │ Vrednost       │
├────────────────────┼────────────────┤
│ Izlazna struja     │ 4 A source/sink│
│ CMTI               │ 200 kV/μs      │
│ Propagation delay  │ 24 ns typ      │
│ Jitter             │ 0.3 ns         │
│ Izolacija          │ 5 kV           │
│ Undervoltage lockout│ Konfigurabilan│
│ Package            │ SOIC-16 WB     │
│ Cena               │ ~€12           │
└─────────────────────────────────────┘

Prednosti za SiC:
- Ultra-visok CMTI (200 kV/μs)
- Vrlo nizak propagation delay
- Nizak jitter za precizno paralelisanje
```

#### Texas Instruments UCC2152x

```
UCC21520 (4A/6A verzije):
┌─────────────────────────────────────┐
│ Dual-channel sa izolacijom          │
├─────────────────────────────────────┤
│ Peak source current: 4A / 6A        │
│ Peak sink current: 6A / 6A          │
│ CMTI: 100 kV/μs                     │
│ Propagation delay: 19 ns typ        │
│ Delay matching: 2 ns                │
│ Input filter: 5 ns programabilni    │
│ UVLO threshold: Selectable          │
│ Split outputs: Da (za Rg(on)/off)   │
│ Package: SOIC-16                    │
│ Cena: ~€5-6                         │
└─────────────────────────────────────┘

UCC21750 (Single za SiC):
- Integrated isolated power
- Active Miller clamp
- Two-level turn-off
- DESAT < 0.5 μs response
```

#### Power Integrations SCALE-2

```
2SP0115T2Ax-FF450R12ME4:
┌─────────────────────────────────────┐
│ Plug-and-play za Infineon module    │
├─────────────────────────────────────┤
│ Kompletno rešenje:                  │
│   - Gate driver × 2 kanala          │
│   - Izolovano napajanje             │
│   - Fiber optic interfejs opcija    │
│   - Konfigurabilan Rg               │
│                                     │
│ Karakteristike:                     │
│   - SCALE-2 chipset                 │
│   - Advanced Active Clamping (AAC)  │
│   - Short circuit type I i II       │
│   - Soft turn-off                   │
│   - Status feedback                 │
│                                     │
│ Cena: ~€150                         │
└─────────────────────────────────────┘
```

### 3.3 Za GaN

```
Texas Instruments LMG1210:
┌─────────────────────────────────────┐
│ Half-bridge GaN FET driver          │
├─────────────────────────────────────┤
│ Vout: 5.25V                         │
│ Source current: 1.5A                │
│ Sink current: 5A (asymetrično)      │
│ Propagation delay: 6.2 ns           │
│ Dead-time: 4 ns min                 │
│ Bootstrap: 100V max                 │
│ Package: QFN-16                     │
│ Cena: ~€4                           │
└─────────────────────────────────────┘

Napomena: GaN zahteva različit pristup
- Niži gate napon (5-6V)
- Brže switching (ns)
- Krući layout zahtevi
```

## 4. Dizajn Gate Drive Kola

### 4.1 Gate Resistor Selection

```
Funkcija Gate Otpornika:

1. Kontrola dv/dt i di/dt
2. Prigušenje oscilacija (ringing)
3. EMI kontrola
4. Balansiranje gubitaka (turn-on vs turn-off)

Proračun:

dv/dt = Ig / (Cgd + Cds)
di/dt = (Vgs - Vth) × gm / Ciss

Za željeni dv/dt od 10 V/ns sa Cgd = 50 pF:
Ig = dv/dt × Cgd = 10 × 50 = 500 mA

Za Vgs = 15V, Vth = 3V:
Rg(on) = (Vdrv - Vgs_miller) / Ig
Rg(on) = (15 - 10) / 0.5 = 10Ω

Tipične vrednosti:
┌───────────────┬─────────────┬─────────────┐
│ Tehnologija   │ Rg(on)      │ Rg(off)     │
├───────────────┼─────────────┼─────────────┤
│ IGBT          │ 2-10 Ω      │ 2-5 Ω       │
│ SiC MOSFET    │ 1-5 Ω       │ 1-3 Ω       │
│ GaN           │ 0-2 Ω       │ 0-2 Ω       │
└───────────────┴─────────────┴─────────────┘

Separatni Rg za ON/OFF (split output):

        ┌────────┐
        │  Gate  │
Drv+───►│ Driver ├─┬─►Rg(on)──┬── GATE
        │        │ │          │
        └────────┘ └─►Rg(off)─┤
                       │      │
                      ─┴─ D   │
                       ▲      │
                       └──────┘

Prednost: Nezavisna kontrola turn-on i turn-off
```

### 4.2 Negative Bias za SiC

```
Zašto negativan Vgs(off) za SiC:

Problem: Parazitno uključenje
         (Miller turn-on)

             Cgd
        ┌────┤├────┐
        │          │
       ─┴─        ─┴─
Gate ──┤  │Cgs   ┤  │ Cds
       ─┬─        ─┬─
        │          │
        └────┬─────┘
             │
           Source

Kada high-side uključuje:
- dVds/dt na low-side indukuje struju
- Struja kroz Cgd podiže Vgs
- Ako Vgs > Vth → parazitno uključenje!

Rešenje: Negativan Vgs(off)

IGBT: Vgs(off) = 0V do -8V
      (Vth = 5-7V, dovoljna margina)

SiC:  Vgs(off) = -4V do -5V
      (Vth = 2-4V, manja margina!)

Implementacija negativnog biasa:

     +15V ──┬──────────────────┐
            │                  │
           ═╪═ C1              │
            │                  │
     ───────┼──────────────────┼─── Gate
            │                  │
            │    ┌────────┐    │
            └────┤ Driver ├────┘
                 │   IC   │
            ┌────┤        ├────┐
            │    └────────┘    │
           ═╪═ C2              │
            │                  │
     -4V ───┴──────────────────┘

Preporučeni naponi:
- Infineon SiC: +18V / -3V
- Wolfspeed: +15V / -4V
- ROHM: +18V / -5V

UPOZORENJE: Proveriti max Vgs u datasheetu!
            Tipično Vgs(max) = +22V / -6V
```

### 4.3 Active Miller Clamp

```
Problem: Miller plateau oscilacije

Tokom Miller plateau (turn-off):
Vgs ≈ konstanto ali Ig varira
→ Oscilacije mogu uzrokovati re-triggering

Active Miller Clamp rešenje:

              Vdrv
               │
          ┌────┴────┐
          │  Q_on   │
          │   ▼     │
    ──────┤         ├───────┬── GATE
          │         │       │
          │  Q_off  │      ═╪═ Cgs
          │   ▼     │       │
          └────┬────┘       │
               │            │
    ───────────┼────────────┘
               │     │
              ═╪═    ┴ Q_clamp
               │     │
              Vee    │
                     │
                   SOURCE

Kada Q_clamp aktivan:
- Low impedance path: Gate → Source
- Drži Vgs na Vee
- Sprečava Miller turn-on

Timing:
- Q_clamp ON malo pre Q_off ON
- Ostaje ON tokom celog OFF stanja
```

### 4.4 Desaturation Protection

```
Desaturacija detektuje short circuit/overcurrent:

Normalan rad IGBT:
- IGBT zasićen (saturated)
- Vce(sat) = 1.5-2.5V @ Ic nominal

Short circuit:
- IGBT izlazi iz zasićenja
- Vce raste do Vdc (800V!)
- Ic raste nekontrolisano

Desat detekcija:

         Vdc (800V)
           │
          ┌┴┐
     Load │ │
          └┬┘
           │
           ├──────────── Vce sense
           │            │
          ┌┴┐          ─┴─ D_desat
    IGBT  │ │           ▲ (High Voltage)
          └┬┘           │
           │            │
    ───────┼────────────┤
           │            │
         Source    ┌────┴────┐
           │       │ DESAT   │
           │       │ Comparator
           │       │         │
           │       │  Vref   │
           │       │  (7-9V) │
           │       └────┬────┘
           │            │
           │         FAULT
           └────────────┘

Tipičan threshold:
- Vdesat = 7-9V (iznad Vce(sat) + margina)
- Blanking time: 2-5 μs (za turn-on spike)

Reakcija na fault:
1. Soft turn-off (sporo Rg)
2. 2-level turn-off (prvo ograniči di/dt)
3. Fault signal ka MCU
```

### 4.5 Soft Turn-Off

```
Problem: Brzo isključenje pri visokoj struji

di/dt = L × dI/dt → Naponski spike

Za L_stray = 50 nH, I = 500A, dt = 100ns:
V_spike = 50×10^-9 × 500 / 100×10^-9 = 250V!

Vce ukupno = Vdc + V_spike = 800 + 250 = 1050V
→ Prekoračenje 1200V ratinga!

Soft Turn-Off sekvenca:

     Vgs
      │
  +15V├─────┐
      │     │
      │     │         Stage 2
      │     └───────┐ (Slow)
  0V  ├─────────────│───────────────
      │             │
      │             └──────────────
  -4V ├────────────────────────────
      │
      └────────────────────────────► t
           t1      t2

      Vce
      │
 800V ├───────────────┬────────────
      │              ╱│
      │            ╱  │
      │          ╱    │
  Vsat├────────╱      │
      │                │
      └────────────────┴───────────► t

Implementacija:
- Stage 1: Normalan Rg(off)
- Stage 2: Veći Rg ili konstantna struja
- Transition: Vce threshold ili timer
```

## 5. Izolovano Napajanje

### 5.1 Bootstrap Napajanje

```
Bootstrap za half-bridge:

     Vcc (+15V)
       │
       │ D_boot (Fast Recovery)
       │  │
       ├──┴──┐
       │     │ C_boot (≥10μF)
       │    ═╪═
       │     │
       │     └──────────┐
       │                │
       │         ┌──────┴──────┐
       │         │  HIGH SIDE  │
       │         │   DRIVER    │
       │         │             │
       │         └──────┬──────┘
       │                │
       │                ├────────── VS (Switch Node)
       │                │
       │         ┌──────┴──────┐
       │         │  LOW SIDE   │
       │         │   DRIVER    │
       │         └──────┬──────┘
       │                │
       └────────────────┴────────── GND

Proračun C_boot:

C_boot ≥ Qg / ΔV

Gde je:
- Qg = ukupan gate charge
- ΔV = dozvoljeni pad napona (tipično 1V)

Za SiC sa Qg = 500 nC, ΔV = 1V:
C_boot ≥ 500 nC / 1V = 500 nF

Plus margin (×10): C_boot ≥ 5 μF
Preporučeno: 10-22 μF / 25V

Ograničenja bootstrap-a:
- Ne može 100% duty cycle (potreban refresh)
- Max OFF time ograničen (leakage)
- Startup sekvenca potrebna
```

### 5.2 Izolovani DC/DC za Gate Driver

```
Kada koristiti izolovani DC/DC:

1. Kada je potreban 100% duty cycle
2. Za high-side u trofaznom inverteru
3. Za full-bridge (4 nezavisna gate-a)
4. Kada je potreban negativan bias

Push-Pull izolovani DC/DC:

     Vin          T1         Vout
      │     ┌────┬────┐       │
      │     │    │    │       │
      ├─────┤    │    ├───────┤
      │   ┌─┴─┐  │  ┌─┴─┐     │
      │   │Q1 │  │  │D1 │     │
   C1═╪═  └─┬─┘ ═╪═ └─┬─┘    ═╪═ C2
      │     │    │    │       │
      │     │    │    │       │
      │   ┌─┴─┐  │  ┌─┴─┐     │
      │   │Q2 │  │  │D2 │     │
      ├───┤   │  │  │   ├─────┤
      │   └─┬─┘  │  └─┬─┘     │
      │     │    │    │       │
     GND    └────┴────┘     GND2
          (Izolacija)

Komercijalni moduli:

RECOM R15P21503D:
- Vin: 15V (12-18V)
- Vout: +15V / -3V
- Power: 2W
- Izolacija: 5.2 kV
- Cena: ~€25

Murata MGJ2D121505SC:
- Vin: 12V
- Vout: +15V / -5V
- Power: 2W
- Izolacija: 5.2 kV
- Cena: ~€20

MORNSUN QA02 Series:
- Vin: 5V / 12V / 24V opcije
- Vout: +15V / -5V
- Power: 2W
- Izolacija: 3.5 kV
- Cena: ~€8 (ekonomičnija opcija)
```

### 5.3 Gate Driver Power Budget

```
Proračun snage za gate driver:

1. Gate charge gubici:
   Pg = Qg × Vgs × f_sw

   Za SiC (Qg = 150 nC, Vgs = 19V, f_sw = 50 kHz):
   Pg = 150×10^-9 × 19 × 50000 = 142 mW

2. Quiescent current:
   Pq = Vcc × Iq
   Tipično Iq = 5-20 mA
   Pq = 15 × 0.01 = 150 mW

3. Izolacioni DC/DC efikasnost:
   η = 80-85%

   Pdc = (Pg + Pq) / η
   Pdc = (142 + 150) / 0.82 = 356 mW per channel

Za half-bridge (2 kanala):
P_total = 2 × 356 = 712 mW

Za 3-fazni inverter (6 kanala):
P_total = 6 × 356 = 2.14 W

NAPOMENA: Ovo je samo za gate drive!
         Dodatna snaga za MCU, senzore, itd.
```

## 6. PCB Layout za Gate Driver

### 6.1 Kritične Putanje

```
Gate Driver Layout Prioriteti:

                   HIGH dv/dt ZONA
    ┌─────────────────────────────────────────┐
    │                                         │
    │    ┌─────────────────────────────┐      │
    │    │      POWER MODULE           │      │
    │    │   ┌───┐         ┌───┐       │      │
    │    │   │ G │    ○    │ G │       │      │
    │    │   └─┬─┘   NTC   └─┬─┘       │      │
    │    │     │             │         │      │
    │    └─────┼─────────────┼─────────┘      │
    │          │             │                │
    │    ┌─────┴──┐    ┌─────┴──┐             │
    │    │ Rg     │    │ Rg     │ ← Što bliže │
    │    └────┬───┘    └────┬───┘   modulu    │
    │         │             │                 │
    │    ┌────┴─────────────┴────┐            │
    │    │    GATE DRIVER IC     │            │
    │    │    ┌───┐    ┌───┐     │            │
    │    │    │OUT│    │OUT│     │            │
    │    │    └───┘    └───┘     │            │
    │    │                       │            │
    │    │    ┌───┐    ┌───┐     │            │
    │    │    │IN │    │IN │     │            │
    │    └────┴───┴────┴───┴─────┘            │
    │              │                          │
    │    ──────────┼──────────────────────    │
    │    IZOLACIONA BARIJERA                  │
    │    ──────────┼──────────────────────    │
    │              │                          │
    │    ┌─────────┴───────────┐              │
    │    │   CONTROL SECTION   │              │
    │    │   (LOW VOLTAGE)     │              │
    │    └─────────────────────┘              │
    │                                         │
    └─────────────────────────────────────────┘

Pravila:
1. Gate loop što kraći (< 2 cm)
2. Rg što bliže modulu
3. Decopling kondenzatori na VCC/VEE
4. Kelvin source konekcija
5. Fizička separacija HV/LV zona
```

### 6.2 Kelvin Source Konekcija

```
Važnost Kelvin Source:

BEZ Kelvin source:
                    L_stray
    Driver ───Rg───┬──⌇⌇⌇───┬── GATE
                   │        │
                   │       ═╪═ Power
                   │        │  MOSFET
                   │        │
    Driver GND ────┴────────┼── SOURCE
                            │
                        L_source
                            │
                            ▼
                         Power GND

Problem:
- Power struja teče kroz L_source
- V = L × di/dt stvara napon na source
- Gate-Source napon varira!
- Vgs_actual = Vgs_driver - L_source × di/dt

SA Kelvin source (4-pin package):

    Driver ───Rg───┬─────────┬── GATE
                   │         │
                   │        ═╪═ Power
                   │         │  MOSFET
                   │         │
    Driver GND ────┴─────────┼── SOURCE (Kelvin)
                             │
                         L_source
                             │
                             ┼── SOURCE (Power)
                             │
                             ▼
                          Power GND

TO-247-4 Pinout:
     ┌───────────────┐
     │   1   2   3   4│
     │   G   D   S   SK│
     └───────────────┘
     G = Gate
     D = Drain
     S = Source (Power)
     SK = Source Kelvin

Rezultat:
- Kelvin source samo za sensing
- Nema di/dt uticaja
- Preciznija Vgs kontrola
- Brže, čistije switching
```

### 6.3 Decoupling Strategy

```
Gate Driver Decoupling:

    Vcc (+15V) ──┬────────────────┬───────────
                 │                │
                ═╪═ C1           ═╪═ C2
                │(100nF)         │(10μF)
                 │                │
    GND ─────────┴────────────────┴───────────

    Vee (-4V) ───┬────────────────┬───────────
                 │                │
                ═╪═ C3           ═╪═ C4
                │(100nF)         │(10μF)
                 │                │
    GND ─────────┴────────────────┴───────────

Placement:
- C1, C3: ≤5mm od driver IC
- C2, C4: Na ulazu napajanja

Tip kondenzatora:
- C1, C3: MLCC X7R ili C0G
- C2, C4: MLCC X5R/X7R ili Tantalum

Za bootstrap:
- 10-22 μF / 25V
- Low ESR MLCC
- Blizu bootstrap diode
```

## 7. Zaštitne Funkcije

### 7.1 Under-Voltage Lockout (UVLO)

```
UVLO funkcija:

      Vcc
       │
    ┌──┴──┐
    │     │      ┌─────────────────────┐
    │ REG │      │                     │
    │     ├──────┤ UVLO Comparator     │
    └──┬──┘      │                     │
       │         │  Vth_on = 12.5V     │
       │         │  Vth_off = 11.5V    │
       │         │  (1V hysteresis)    │
       │         │                     │
       │         └─────────┬───────────┘
       │                   │
       │              ENABLE
       │                   │
       │         ┌─────────┴───────────┐
       │         │                     │
       │         │    OUTPUT STAGE     │
       │         │                     │
       │         └─────────────────────┘

Tipični UVLO pragovi:

│ Aplikacija     │ UVLO ON │ UVLO OFF │ Hyst  │
├────────────────┼─────────┼──────────┼───────┤
│ IGBT (+15V)    │ 13.0V   │ 11.5V    │ 1.5V  │
│ SiC (+15V/-4V) │ 13.0V   │ 11.5V    │ 1.5V  │
│ SiC (+18V/-5V) │ 15.5V   │ 14.0V    │ 1.5V  │
│ GaN (+5V)      │ 4.5V    │ 4.0V     │ 0.5V  │

Zašto je UVLO važan:
- Nedovoljan Vgs = linearan rad = termalni runaway
- Gate oxide stress kod SiC ako Vgs previsok
- Definisano ponašanje pri power-up/down
```

### 7.2 Short Circuit Protection Types

```
Type I: Uključenje u short circuit

    Ic
     │
     │    ┌────────────────────
     │    │ I_SC (very high)
     │    │
     │────┘
     │
     └────────────────────────► t
          t_desat (<5μs)

- MOSFET uključuje u postojeći short
- Struja limitirana saturacijom
- Desat detektuje visok Vce/Vds odmah
- Reaction time: < 5 μs kritično

Type II: Short circuit tokom ON stanja

    Ic
     │         ┌──────────────
     │         │ I_SC
     │────────┐│
     │ I_load ││
     │        └┘
     └────────────────────────► t
              t_SC

- Normalan rad, zatim short
- Brz porast struje
- Teže detektovati (počinje od normalnog Vce)
- Potrebna brža reakcija

SiC vs IGBT Short Circuit Kapacitet:

│ Parametar      │ IGBT     │ SiC MOSFET │
├────────────────┼──────────┼────────────┤
│ SC kapacitet   │ 10 μs    │ 2-5 μs     │
│ Reakcija potrebna│ <5 μs  │ <1 μs      │
│ SC struja      │ 5-10×In  │ 3-8×In     │
│ Energija limit │ Visoka   │ Niža       │

Za SiC: KRITIČNO brza desaturacija!
```

### 7.3 Implementacija Zaštite

```
Kompletna zaštitna sekvenca:

    FAULT ──┬──────────────────────────────────
            │
            │  ┌──────────────────────────────┐
            │  │   DESAT DETECTED             │
            │  │   Vce > Vth (7V)             │
            │  └──────────────┬───────────────┘
            │                 │
            │                 ▼
            │  ┌──────────────────────────────┐
            │  │   BLANKING TIME              │
            │  │   (2-5 μs za IGBT)           │
            │  │   (0.5-1 μs za SiC)          │
            │  └──────────────┬───────────────┘
            │                 │
            │                 ▼
            │  ┌──────────────────────────────┐
            │  │   SOFT TURN-OFF              │
            │  │   Stage 1: Limit di/dt       │
            │  │   Stage 2: Full off          │
            │  └──────────────┬───────────────┘
            │                 │
            │                 ▼
            │  ┌──────────────────────────────┐
            │  │   FAULT LATCH                │
            │  │   Hold gate off              │
            │  │   Signal MCU                 │
            │  └──────────────────────────────┘
            │
            └──► MCU/DSP: Fault handling

Tipična šema dvostepenog turn-off:

           Vgs
            │
       +15V ├────┐
            │    │
            │    │   ┌─────────┐
        +5V ├────│───┤ Stage 1 │ (Limit di/dt)
            │    │   └─────────┘
            │    │            │
         0V ├────│────────────│───────────
            │    │            │
        -4V ├────│────────────└─────────── Stage 2
            │
            └────────────────────────────► t
                 │ Short    │
                 │detected  │
                 t0        t1 (1-2 μs)
```

## 8. Testiranje Gate Drivera

### 8.1 Statički Testovi

```
1. Output Voltage Test:
   - Vout(high): +15V ±0.5V
   - Vout(low): -4V ±0.3V
   - Meriti pod opterećenjem (Rload = 100Ω)

2. Propagation Delay:
   ┌────────────────────────────────────────┐
   │                                        │
   │   INPUT ────┬───────────────────       │
   │             │                          │
   │        ┌────┴────┐                     │
   │        │   50%   │                     │
   │        │         │ tpd(on)             │
   │   OUTPUT ───┬────┴──────────────       │
   │             │                          │
   │        ┌────┴────┐                     │
   │        │   50%   │                     │
   │                                        │
   └────────────────────────────────────────┘

   Meriti: tpd(on), tpd(off)
   Specifikacija: <100 ns tipično

3. UVLO Test:
   - Rampa Vcc: 0V → 20V → 0V
   - Meriti tačke uključenja/isključenja
   - Verifikovati histerezis

4. CMTI Test:
   - Aplikovati dv/dt na izolacijsku barijeru
   - Meriti izlazne smetnje
   - Spec: >100 kV/μs za SiC
```

### 8.2 Dinamički Testovi

```
Double Pulse Test sa Gate Driver Evaluacijom:

Setup:
    Vdc ──┬──────────┬───────────
          │          │
         ═╪═ Cdc    ┌┴┐
          │         │ │ L_load
          │         │ │
          │         └┬┘
          │          │
          └────┬─────┤
              ┌┴┐    │
         DUT  │ │ ←──┼── GATE DRIVER
              └┬┘        UNDER TEST
               │     │
    GND ───────┴─────┴───────────

Merenja:
1. Rise time / Fall time izlaza drivera
2. Gate voltage overshoot/undershoot
3. Miller plateau karakteristike
4. Gate ringing
5. Switching energije (Eon, Eoff)

Test sekvenca:
│ Parametar        │ Prva nulsa │ Druga nulsa │
├──────────────────┼────────────┼─────────────┤
│ Trajanje         │ 5 μs       │ 2 μs        │
│ Dead time        │ -          │ 2 μs        │
│ Meri se          │ Turn-on    │ Turn-off    │
│                  │ (Id = 0)   │ (Id = Il)   │
```

### 8.3 Test Equipment

```
Potrebna oprema:

1. Osciloskop:
   - Bandwidth: ≥200 MHz (≥500 MHz za SiC)
   - Sample rate: ≥1 GS/s
   - Isolated channels za HV

   Preporuka: Tektronix MDO3054, Keysight DSOX3054

2. Voltage Probes:
   - Differential za gate voltage
   - High voltage za Vce/Vds

   Preporuka:
   - Tektronix THDP0200 (1500V, 200 MHz)
   - PMK PHV 4002-3 (2 kV, 400 MHz)

3. Current Probes:
   - Rogowski coil za di/dt
   - Hall effect za DC + AC

   Preporuka:
   - PEM CWT Mini (di/dt)
   - LEM PR30 (DC + AC)

4. Power Supply:
   - Izolovano, low noise
   - ±15V / -5V outputs

   Preporuka:
   - Recom bench supplies
   - Custom LISN filtered

5. Function Generator:
   - Za PWM generisanje
   - <10 ns rise time

   Preporuka: Tektronix AFG31000
```

## 9. Bill of Materials - Gate Drivers

### 9.1 Za 150 kW Punjač (6 kanala)

```
Opcija A: Integrisani modularni driveri

┌────────────────────────────────────────────────────────┐
│ Komponenta              │ Qty │ Jed. cena │   Ukupno  │
├─────────────────────────┼─────┼───────────┼───────────┤
│ Wolfspeed CGD12HBXMP    │  3  │   €120    │   €360    │
│ (Half-bridge SiC driver)│     │           │           │
├─────────────────────────┼─────┼───────────┼───────────┤
│ DC/DC RECOM R15P21503D  │  6  │   €25     │   €150    │
│ (Backup/aux)            │     │           │           │
├─────────────────────────┼─────┼───────────┼───────────┤
│ Gate resistor kit       │ set │   €20     │   €20     │
├─────────────────────────┼─────┼───────────┼───────────┤
│ Decoupling capacitors   │ set │   €30     │   €30     │
├─────────────────────────┼─────┼───────────┼───────────┤
│ UKUPNO (Opcija A)       │     │           │   €560    │
└────────────────────────────────────────────────────────┘

Opcija B: Diskretni driveri (fleksibilnije)

┌────────────────────────────────────────────────────────┐
│ Komponenta              │ Qty │ Jed. cena │   Ukupno  │
├─────────────────────────┼─────┼───────────┼───────────┤
│ Silicon Labs Si8285     │  3  │   €12     │   €36     │
│ (Dual isolated driver)  │     │           │           │
├─────────────────────────┼─────┼───────────┼───────────┤
│ DC/DC Murata MGJ2       │  6  │   €20     │   €120    │
│ (+15V/-5V, 2W)          │     │           │           │
├─────────────────────────┼─────┼───────────┼───────────┤
│ Desat protection IC     │  6  │   €8      │   €48     │
│ (ACPL-339J ili slično)  │     │           │           │
├─────────────────────────┼─────┼───────────┼───────────┤
│ Gate resistors (matched)│  12 │   €1      │   €12     │
├─────────────────────────┼─────┼───────────┼───────────┤
│ Decopling kit           │ set │   €40     │   €40     │
├─────────────────────────┼─────┼───────────┼───────────┤
│ Bootstrap diode + cap   │  6  │   €5      │   €30     │
├─────────────────────────┼─────┼───────────┼───────────┤
│ UKUPNO (Opcija B)       │     │           │   €286    │
└────────────────────────────────────────────────────────┘

Preporuka:
- Za brz razvoj: Opcija A (manje rizika)
- Za cost optimization: Opcija B (niža cena, više posla)
- Za EXPO 2027: Opcija A preporučeno
```

## 10. Zaključak

### Ključne Preporuke za Gate Driver Dizajn:

```
1. Izbor drivera prema poluvodiču:
   ├── IGBT: Standardni izolovani (1ED020I12)
   ├── SiC: Specijalizovani sa CMTI >100kV/μs
   └── GaN: Integrisani half-bridge (LMG1210)

2. Zaštitne funkcije (OBAVEZNO):
   ├── UVLO sa histerezom
   ├── Desaturation detection (<1μs za SiC)
   ├── Soft turn-off sekvenac
   └── Fault reporting

3. Layout prioriteti:
   ├── Minimizovati gate loop
   ├── Kelvin source konekcija
   ├── Proper decoupling
   └── HV/LV separacija

4. Napajanje:
   ├── Izolovani DC/DC za svaki kanal
   ├── +15V/-4V za SiC (proveriti datasheet!)
   └── Dovoljan power budget (>500mW/ch)

5. Testiranje:
   ├── Double pulse test obavezan
   ├── Desat protection verifikacija
   └── CMTI test na završenom dizajnu
```
