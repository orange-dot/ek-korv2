# Pasivne Komponente za EV Punjače

## 1. Pregled Pasivnih Komponenti

### 1.1 Uloga u Power Electronics

```
Blok Dijagram 150 kW Punjača - Pasivne Komponente:

    AC ULAZ                                          DC IZLAZ
       │                                                │
       │    ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐   │
       │    │ EMI │    │ PFC │    │     │    │ DC/ │   │
    ───┼───►│Filter├───►│Boost├───►│DC   ├───►│ DC  ├───┼───►
       │    │ L,C │    │L_pfc│    │Link │    │L,Tr │   │
       │    └─────┘    └─────┘    │ C   │    └─────┘   │
       │       ▲          ▲      └─────┘       ▲       │
       │       │          │          ▲         │       │
       │   Induktori   Induktori  Konden-  Transformator
       │   Common mode  PFC       zatori    + Lr (LLC)
       │   + Diff mode

Distribucija Cene Pasivnih:
┌────────────────────────────────────┐
│ Komponenta        │ % ukupne cene  │
├───────────────────┼────────────────┤
│ DC Link kondenz.  │     25%        │
│ PFC induktor      │     20%        │
│ Transformator     │     30%        │
│ EMI filter        │     15%        │
│ Izlazni filter    │     10%        │
└───────────────────────────────────-┘
Ukupno pasivne: ~25-30% cene punjača
```

## 2. Magnetne Komponente

### 2.1 PFC Boost Induktor

```
Funkcija PFC Induktora:

                     D
    ┌────────────────┴────────────────┐
    │                                 │
    │         L_pfc                   │
    ├───────⌇⌇⌇⌇⌇───────┬────────────┤
    │                    │            │
  V_ac                  ─┴─ Q        ─┴─ C_dc
    │                   ─┬─ (SiC)    ─┬─
    │                    │            │
    └────────────────────┴────────────┘

Funkcije:
1. Ograničava di/dt prekidanja
2. Omogućava boost funkciju
3. Skladišti energiju za kontinuirani prenos
4. Filtrira HF komponente

Ključni parametri:

│ Snaga punjača │ L vrednost │ I_rms │ ΔI (ripple) │
├───────────────┼────────────┼───────┼─────────────┤
│ 50 kW         │ 150-300 μH │ 80 A  │ 20% I_peak  │
│ 150 kW        │ 80-150 μH  │ 220 A │ 20% I_peak  │
│ 350 kW        │ 50-100 μH  │ 500 A │ 20% I_peak  │
```

#### Proračun PFC Induktora

```
Za CCM (Continuous Conduction Mode):

L_min = V_in(peak) × D_max × (1 - D_max) / (2 × f_sw × ΔI_L)

Gde je:
- V_in(peak) = √2 × V_in(rms) = √2 × 400V = 566V
- D_max = 1 - V_in(min) / V_dc = 1 - 320/800 = 0.6
- f_sw = 65 kHz (SiC switching frequency)
- ΔI_L = 20% × I_L(peak) = 0.2 × 300A = 60A

L_min = 566 × 0.6 × 0.4 / (2 × 65000 × 60)
L_min = 135.8 / 7,800,000 = 17.4 μH

Za praktičan dizajn, uzimamo 2-3× marginu:
L_design = 50-100 μH

Peak Energy:
E = 0.5 × L × I_peak²
E = 0.5 × 100μH × (350A)² = 6.125 J

RMS Current u induktoru:
I_rms ≈ I_dc / √(1-D) = 190A / √0.4 = 300 A
```

#### Jezgro Materijali

```
Poređenje Materijala za Jezgro:

│ Materijal    │ μr    │ Bsat  │ Core Loss │ Temp  │ Cena  │
├──────────────┼───────┼───────┼───────────┼───────┼───────┤
│ Ferrite (3C95)│ 3000 │ 0.53T │ Nizak     │ 200°C │ $     │
│ Amorfni      │ ~150k │ 1.56T │ Vrlo nizak│ 150°C │ $$$   │
│ Nanokristal  │ ~80k  │ 1.2T  │ Nizak     │ 120°C │ $$$$  │
│ Powder (MPP) │ 14-350│ 0.8T  │ Srednji   │ 200°C │ $$    │
│ Iron Powder  │ 10-100│ 1.0T  │ Visok     │ 125°C │ $     │
│ Silicon Steel│ ~4000 │ 1.8T  │ Visok(50Hz)│200°C │ $     │

Za EV punjače (50-100 kHz):
Preporučeno: Amorfni ili Powder core

Zašto amorfni metal za visoku struju:
1. Visok B_sat → manje jezgro
2. Distribuirani air gap u powder cores
3. Manje fringing losses
4. Bolje termičko ponašanje
```

#### Konstrukcija PFC Induktora

```
Tipične konstrukcije:

1. Toroidni (Powder Core):

        ┌───────────────┐
       ╱                 ╲
      │  ╔═══════════╗    │
      │  ║  Powder   ║    │
      │  ║   Core    ║    │
      │  ╚═══════════╝    │
       ╲                 ╱
        └───────────────┘
              │││││
           Litz wire
           namotaji

   Prednosti:
   - Distribuirani gap = manje EMI
   - Soft saturation
   - Samopodržavajuća konstrukcija

2. EE/EI sa Air Gap:

     ┌─────────────────────────┐
     │███████████████████████│
     │██    ║══════║    ██│
     │██    ║ COIL ║    ██│
     │██    ║══════║    ██│
     │██▄▄▄▄║      ║▄▄▄▄██│
     │████  gap    ████│
     │██▀▀▀▀║      ║▀▀▀▀██│
     │██    ║══════║    ██│
     │██    ║ COIL ║    ██│
     │██    ║══════║    ██│
     │███████████████████████│
     └─────────────────────────┘

   Prednosti:
   - Lako podešavanje gap-a
   - Standardne veličine
   - Bolji thermal management

Air Gap Proračun:
lg = μ0 × N² × Ae / L

Za L=100μH, N=20, Ae=800mm²:
lg = 4π×10^-7 × 400 × 800×10^-6 / 100×10^-6
lg = 4.02 mm
```

#### Wire Selection

```
Skin Effect na visokim frekvencijama:

Skin depth: δ = √(ρ / (π × f × μ))

Za bakar @ 100 kHz, 100°C:
δ = √(2.1×10^-8 / (π × 100000 × 4π×10^-7))
δ = 0.23 mm

Pravilo: Wire radius ≤ 2×δ
→ Max wire diameter ≈ 0.9 mm @ 100 kHz

Rešenja za visoku struju:

1. Litz Wire:
   - Mnoge tanke izolovan žice upletene
   - Svaka žica < 2×δ
   - Tipično 100-2000 strands

   Primer za 300A RMS:
   - J = 5 A/mm² (sa hlađenjem)
   - A_cu = 300/5 = 60 mm²
   - Litz: 1050 × AWG40 (0.08mm)

2. Foil Winding:
   - Bakarnafolija debljine < δ
   - Dobro za planar induktore
   - Lakše hlađenje

3. Parallel Round Wire:
   - Više paralelnih žica
   - Jednostavnije od Litz
   - Veći proximity effect
```

### 2.2 LLC Rezonantni Induktor (Lr)

```
LLC Tank Circuit:

    ┌───────┐    ┌───────┐    ┌───────┐
    │       │    │       │    │       │
────┤ Lr    ├────┤  Cr   ├────┤  Lm   ├────
    │  ⌇⌇⌇  │    │  ═╪═  │    │  ⌇⌇⌇  │
    └───────┘    └───────┘    └───────┘

Lr = Rezonantni induktor (series)
Cr = Rezonantni kondenzator
Lm = Magnetizing inductance (parallel)

Rezonantna frekvencija:
fr = 1 / (2π × √(Lr × Cr))

Karakteristični odnosi:
Ln = Lm / Lr (tipično 3-7)
Qe = √(Lr/Cr) / Rac

Proračun za 50 kW LLC:

Specifikacije:
- P = 50 kW
- V_in = 800V DC
- V_out = 200-500V (širok opseg za baterije)
- f_r = 100 kHz

Lr = V_in² / (8 × f_r × P × k)
   = 800² / (8 × 100000 × 50000 × 1.1)
   = 640000 / 44×10^9
   = 14.5 μH

Cr = 1 / ((2π×f_r)² × Lr)
   = 1 / (39.5×10^10 × 14.5×10^-6)
   = 175 nF

Lm = Ln × Lr = 5 × 14.5 = 72.5 μH
```

#### Lr Konstrukcija

```
Zahtevi za Lr:

1. Precizna vrednost (±3%)
2. Nizak DC otpor
3. Nizak AC otpor (skin/proximity)
4. Termalna stabilnost
5. Linearnost (bez saturacije)

Opcije konstrukcije:

1. Diskretni Air-Core:
   ┌──────────────────────┐
   │                      │
   │    ┌──────────┐      │
   │    │ SOLENOID │      │
   │    │  ⌇⌇⌇⌇⌇⌇  │      │
   │    └──────────┘      │
   │     (air core)       │
   └──────────────────────┘

   L = μ0 × N² × A / l

   Prednosti: Linearnost, bez core loss
   Nedostaci: Veliki, EMI source

2. Gapped Ferrite:
   ┌──────────────────────┐
   │  ████████████████    │
   │  ██    ║║    ██     │
   │  ██  WINDING  ██     │
   │  ██    ║║    ██     │
   │  ██▄▄▄     ▄▄▄██     │
   │    gap   gap         │
   │  ██▀▀▀     ▀▀▀██     │
   │  ████████████████    │
   └──────────────────────┘

   Prednosti: Kompaktno
   Nedostaci: Gap loss, fringing

3. Integrisano u Transformer:
   - Lr = Leakage inductance
   - Kontrolisano preko konstrukcije
   - Štedi prostor i troškove
```

### 2.3 Visokofrekvntni Transformator

```
LLC Transformer Dizajn:

          Primary          Secondary
            │                  │
     ┌──────┴──────┐    ┌──────┴──────┐
     │             │    │             │
     │   Np turns  │    │   Ns turns  │
     │   ∿∿∿∿∿∿∿   │    │   ∿∿∿∿∿∿∿   │
     │             │    │             │
     └─────────────┘    └─────────────┘
            │                  │
            └────── CORE ──────┘

Odnos transformacije:
n = Np / Ns = V_in / V_out

Za 800V → 400V:
n = 800 / 400 = 2:1

Stvarni odnos uzimajući u obzir duty cycle i topology:
n = V_in / (2 × V_out) = 800 / 800 = 1:1 (full bridge LLC)

ili za half-bridge:
n = V_in / (4 × V_out) = 800 / 1600 = 0.5:1
```

#### Area Product Metoda

```
Proračun veličine jezgra:

Ap = Aw × Ae = (P × 10⁴) / (Kf × Ku × Bmax × fs × J)

Gde je:
- Ap = Area product (cm⁴)
- Aw = Window area (cm²)
- Ae = Core cross-section (cm²)
- P = Power (W) = 50,000W
- Kf = Form factor = 4.44 (sine), 4.0 (square)
- Ku = Window utilization = 0.4
- Bmax = Max flux density = 0.25 T (ferrite @ 100kHz)
- fs = Frequency = 100,000 Hz
- J = Current density = 5 A/mm²

Ap = (50000 × 10⁴) / (4 × 0.4 × 0.25 × 100000 × 500)
Ap = 5×10⁸ / 2×10⁷ = 25 cm⁴

Odabir jezgra (ETD/EE serije):

│ Jezgro    │ Ae (mm²) │ Aw (mm²) │ Ap (cm⁴) │
├───────────┼──────────┼──────────┼──────────┤
│ ETD59     │ 368      │ 368      │ 13.5     │
│ E71/33/32 │ 683      │ 485      │ 33.1     │✓
│ E80/38/20 │ 514      │ 532      │ 27.3     │✓
│ U93/76/30 │ 864      │ 780      │ 67.4     │

Za 50 kW: E71 ili veće
Za 150 kW: Više transformatora u paraleli ili custom
```

#### Winding Arrangement

```
Interleaved Winding za nizak leakage:

        ┌─────────────────────────────┐
Layer 5 │         S2                  │
        ├─────────────────────────────┤
Layer 4 │         P                   │
        ├─────────────────────────────┤
Layer 3 │         S1                  │ Interleaved
        ├─────────────────────────────┤
Layer 2 │         P                   │
        ├─────────────────────────────┤
Layer 1 │         S2                  │
        └─────────────────────────────┘

P-S-P-S-P arrangement:
- Smanjuje proximity effect
- Nizak leakage inductance
- Bolja coupling

Sandwich Winding za kontrolisan leakage:

        ┌─────────────────────────────┐
Layer 5 │         P (all)             │
        ├─────────────────────────────┤
Layer 4 │         Isolation           │
        ├─────────────────────────────┤
Layer 3 │         S1                  │ Controlled
        ├─────────────────────────────┤ Leakage
Layer 2 │         Isolation           │
        ├─────────────────────────────┤
Layer 1 │         S2                  │
        └─────────────────────────────┘

- Leakage kao Lr za LLC
- Pojednostavljuje dizajn
- Zahteva pažljivu kontrolu
```

#### Gubici u Transformatoru

```
1. Core Losses (Steinmetz):

Pv = k × f^α × B^β   (mW/cm³)

Za 3C95 ferrite @ 100 kHz, 0.2T:
Pv = 1.6 × 100^1.8 × 0.2^2.5
Pv ≈ 180 mW/cm³

Za Ve = 200 cm³:
P_core = 180 × 200 / 1000 = 36 W

2. Copper Losses:

P_cu = I²_rms × R_ac

R_ac = R_dc × Fr (Fr = AC/DC resistance ratio)

Doerr Formula za Fr:
Fr ≈ 1 + (m² - 1/3) × (h/δ)⁴ / 45

Gde je:
- m = broj layera
- h = debljina provodnika
- δ = skin depth

Za Litz wire, Fr ≈ 1.5-2.0

3. Ukupni gubici:

P_total = P_core + P_cu_primary + P_cu_secondary

Efikasnost transformatora:
η = P_out / (P_out + P_total)

Za dobro dizajniran 50 kW transformer:
P_total ≈ 250-400 W
η ≈ 99.2-99.5%
```

### 2.4 EMI Filter Induktori

```
Common Mode Choke:

         ┌────────────────────────┐
   L ────┤    ⌇⌇⌇⌇⌇⌇             │
         │       ║               │
   N ────┤    ⌇⌇⌇⌇⌇⌇             ├──── Load
         │       ║               │
  PE ────┤    ⌇⌇⌇⌇⌇⌇             │
         └────────────────────────┘
              Toroidno jezgro

Princip rada:
- Differential mode: Magnetni fluks se poništava
- Common mode: Fluks se sabira → visoka impedansa

Tipične vrednosti za 150 kW:
- L_CM = 1-5 mH @ CM
- L_DM = 5-20 μH @ DM (leakage)
- I_rated = 250-400 A

Jezgro materijali za CM choke:
- Nanokristalni: Najbolje performanse, skup
- Amorfni: Odličan kompromis
- Mn-Zn ferrite: Ekonomičan, manji μ

Differential Mode Induktor:

   L ──⌇⌇⌇⌇⌇──┬──⌇⌇⌇⌇⌇── Load
              │
             ═╪═ C_x
              │
   N ─────────┴────────── Load

- Manji induktivitet (50-200 μH)
- Powder core (ne saturiše)
- Visoka struja jednosmerno
```

## 3. Kondenzatori

### 3.1 DC Link Kondenzatori

```
Funkcija DC Link-a:

    Rectifier                    Inverter
        │                            │
        │     ┌──────────────┐       │
        ├─────┤              ├───────┤
        │     │   C_dc       │       │
        │     │   DC LINK    │       │
        │     │              │       │
        ├─────┤   ═══════    ├───────┤
        │     │              │       │
        │     └──────────────┘       │
        │                            │

Funkcije:
1. Energetski buffer između stage-ova
2. Snižava ripple napona
3. Apsorbuje switching transienti
4. Izvor struje za brze promene opterećenja

Ključni parametri:
- Kapacitivnost (μF)
- Naponska klasa (V)
- ESR (mΩ)
- Ripple current capability (A_rms)
- Životni vek (sati @ temp)
```

#### Proračun DC Link Kapacitivnosti

```
Metod 1: Ripple Napon

C = I_out / (f × ΔV)

Za 150 kW, 800V, ΔV = 5%, f = 100 kHz:
I_out = 150000 / 800 = 187.5 A
ΔV = 0.05 × 800 = 40V

C = 187.5 / (100000 × 40) = 47 μF (minimum)

Metod 2: Energy Storage (Hold-up time)

E = 0.5 × C × V²
C = 2 × P × t_hold / (V_max² - V_min²)

Za t_hold = 10 ms, V_max = 850V, V_min = 700V:
C = 2 × 150000 × 0.01 / (722500 - 490000)
C = 3000 / 232500 = 12.9 mF = 12,900 μF

Metod 3: Ripple Current

I_ripple = √(I_out² × D × (1-D))

Za D = 0.5:
I_ripple = 187.5 × √0.25 = 93.75 A_rms

Potreban kapacitet za ripple:
→ Odrediti broj kondenzatora prema I_rms ratingu

Praktičan dizajn (150 kW):
- Kapacitivnost: 2000-4000 μF
- Ripple handling: 100-150 A_rms
- Tipično: 4-8 kondenzatora u paraleli
```

#### Tipovi DC Link Kondenzatora

```
1. Aluminijum Elektrolitski:

   ┌──────────────────────────────────────┐
   │  + Visoka kapacitivnost po volumenu  │
   │  + Niska cena                        │
   │  - Ograničen životni vek             │
   │  - Visok ESR                         │
   │  - Temperaturno osetljiv             │
   │  - Polarizovan                       │
   └──────────────────────────────────────┘

   Životni vek:
   L = L0 × 2^((T0-T)/10)

   Tipični proizvodi:
   - EPCOS B43456 (450V, 4700μF, 85°C)
   - Nichicon LGU (450V, 3300μF, 105°C)

2. Film Kondenzatori (Polipropilen):

   ┌──────────────────────────────────────┐
   │  + Nizak ESR                         │
   │  + Visok ripple current              │
   │  + Dug životni vek (>100,000h)       │
   │  + Nepolarizovan                     │
   │  - Niža kapacitivnost po volumenu    │
   │  - Veća cena                         │
   └──────────────────────────────────────┘

   Tipični proizvodi:
   - EPCOS B32778 (900V DC, 200μF)
   - Vishay MKP1848 (900V DC, 150μF)
   - TDK B32776 (800V DC, 180μF)

3. Hibridni (Film + Electrolytic):

   ┌────────────────────────────────────────────┐
   │  Film kondenzatori za HF ripple filtering  │
   │  Elektrolitski za bulk energy storage      │
   │  Najbolji kompromis za EV punjače          │
   └────────────────────────────────────────────┘
```

#### DC Link Konfiguracija za 150 kW

```
Preporučena konfiguracija:

    DC+ ────┬────────────┬────────────┬────── Inv DC+
            │            │            │
          ┌─┴─┐        ┌─┴─┐        ┌─┴─┐
          │C1 │        │C2 │        │C3 │
          │   │Film    │   │Film    │   │Film
          │450│        │450│        │450│
          │μF │        │μF │        │μF │
          └─┬─┘        └─┬─┘        └─┬─┘
            │            │            │
    MID ────┼────────────┼────────────┼──────
            │            │            │
          ┌─┴─┐        ┌─┴─┐        ┌─┴─┐
          │C4 │        │C5 │        │C6 │
          │   │Film    │   │Film    │   │Film
          │450│        │450│        │450│
          │μF │        │μF │        │μF │
          └─┬─┘        └─┬─┘        └─┬─┘
            │            │            │
    DC- ────┴────────────┴────────────┴────── Inv DC-

Specifikacije:
- 6× Film kondenzatora 900V/450μF
- Ukupno: 1350 μF (serija = 450μF, paralela ×3)
- ESR: < 5 mΩ po kondenzatoru
- I_ripple: 60A per cap = 180A ukupno
- Životni vek: >100,000 sati

Cena estimacija:
6 × €80 = €480 za DC link kondenzatore
```

### 3.2 Rezonantni Kondenzatori (Cr za LLC)

```
Zahtevi za LLC rezonantni kondenzator:

1. Nizak ESR (da se izbegne gubitak)
2. Nizak ESL (za čistu rezonanciju)
3. Stabilnost kapacitivnosti sa temperaturom
4. Visok ripple current rating
5. Dugotrajnost

Proračun Cr (iz sekcije 2.2):
Cr = 175 nF za 50 kW LLC

Tip kondenzatora: Film (PP ili PET)

│ Parametar        │ Zahtev       │
├──────────────────┼──────────────┤
│ Kapacitivnost    │ 150-200 nF   │
│ Tolerancija      │ ±5%          │
│ Napon           │ 800V DC min   │
│ ESR             │ < 10 mΩ       │
│ I_ripple        │ > 50 A_rms    │
│ Temp stability  │ < 5% over range│

Proizvođač opcije:
- WIMA FKP1 (1000V DC, 150nF)
- Vishay MKP385 (1000V DC, 220nF)
- Cornell Dubilier 940C (600V AC / 1200V DC)

Serisko-paralelna kombinacija:
Za 175 nF @ 800V, I_rms = 60A:
- 4× 47nF/600V u paraleli (za kapacitivnost)
- ili 2× 330nF/500V u seriji (za napon)
```

### 3.3 Snubber i Clamp Kondenzatori

```
RCD Snubber za IGBT:

                     R_snub
         ┌────────────┤├────────────┐
         │                         │
         │    D_snub               │
         ├────┤◄├────┐             │
         │           │             │
         │         ┌─┴─┐          │
  DC+ ───┤         │C  │          ├─── DC-
         │         │snub          │
         │         └─┬─┘          │
         │           │             │
         └───────────┴─────────────┘
                     │
               IGBT/MOSFET

Proračun:

C_snub = I × t_fall / (2 × ΔV)

Za I = 300A, t_fall = 100ns, ΔV = 100V:
C_snub = 300 × 100×10^-9 / 200 = 150 nF

R_snub = t_on / (3 × C_snub)

Za t_on = 5μs:
R_snub = 5×10^-6 / (3 × 150×10^-9) = 11 Ω

Tip kondenzatora:
- Ceramic (X7R, C0G) za malu vrednost
- Film za veću vrednost
- Važno: Nizak ESL!

Proizvodi:
- TDK C3225X7S (1kV, 100nF, MLCC)
- KEMET C1812 (500V, 220nF, ceramic)
```

### 3.4 EMI Filter Kondenzatori

```
X i Y Kondenzatori u EMI Filteru:

    L ───┬──⌇⌇⌇⌇─┬────────┬───────── Load L
         │       │        │
        ═╪═Cx1  ═╪═Cx2   ═╪═Cx3
         │       │        │
    N ───┼──⌇⌇⌇⌇─┼────────┼───────── Load N
         │       │        │
        ═╪═Cy   ═╪═Cy    ═╪═Cy
         │       │        │
    PE ──┴───────┴────────┴───────── PE

X kondenzatori (Line-to-Line):
- Klasa X1: ≤4 kV impulse
- Klasa X2: ≤2.5 kV impulse
- Tipično: 0.1-4.7 μF
- Self-healing PP film

Y kondenzatori (Line-to-Ground):
- Klasa Y1: ≤8 kV impulse
- Klasa Y2: ≤5 kV impulse
- Ograničeni po kapacitivnosti (leakage safety)
- Tipično: 2.2-22 nF
- Ceramic ili film

Sigurnosni zahtevi:
- Y kondenzator max: 4.7 nF po fazi (IEC 61851)
- Ukupan leakage current < 3.5 mA

Proizvođači za sigurnosne kondenzatore:
- Vishay (MKP X2, ceramic Y)
- EPCOS/TDK (B32 serija)
- Murata
```

## 4. Specifikacija i Nabavka

### 4.1 Bill of Materials - Pasivne (150 kW)

```
┌─────────────────────────────────────────────────────────────┐
│ MAGNETNE KOMPONENTE                                          │
├──────────────────────────┬─────┬────────────┬───────────────┤
│ Komponenta               │ Qty │ Jed. cena  │    Ukupno     │
├──────────────────────────┼─────┼────────────┼───────────────┤
│ PFC Induktor 100μH/300A  │  3  │    €150    │     €450      │
│ (Amorfno jezgro, Litz)   │     │            │               │
├──────────────────────────┼─────┼────────────┼───────────────┤
│ LLC Transformer 50kW     │  3  │    €200    │     €600      │
│ (Ferrite E71, Litz)      │     │            │               │
├──────────────────────────┼─────┼────────────┼───────────────┤
│ LLC Induktor Lr 15μH     │  3  │    €50     │     €150      │
│ (Gapped ferrite)         │     │            │               │
├──────────────────────────┼─────┼────────────┼───────────────┤
│ CM Choke 3mH/250A        │  1  │    €120    │     €120      │
│ (Nanokristalno jezgro)   │     │            │               │
├──────────────────────────┼─────┼────────────┼───────────────┤
│ DM Inductor 100μH/250A   │  2  │    €60     │     €120      │
│ (Powder core)            │     │            │               │
├──────────────────────────┴─────┴────────────┼───────────────┤
│ SUBTOTAL MAGNETIKA                          │    €1,440     │
└─────────────────────────────────────────────┴───────────────┘

┌─────────────────────────────────────────────────────────────┐
│ KONDENZATORI                                                 │
├──────────────────────────┬─────┬────────────┬───────────────┤
│ Komponenta               │ Qty │ Jed. cena  │    Ukupno     │
├──────────────────────────┼─────┼────────────┼───────────────┤
│ DC Link Film 900V/450μF  │  6  │    €80     │     €480      │
│ (EPCOS B32778)           │     │            │               │
├──────────────────────────┼─────┼────────────┼───────────────┤
│ LLC Resonant 1kV/180nF   │  6  │    €15     │     €90       │
│ (Film PP)                │     │            │               │
├──────────────────────────┼─────┼────────────┼───────────────┤
│ Snubber Ceramic 500V/220nF│ 12 │    €5      │     €60       │
│ (X7R MLCC)               │     │            │               │
├──────────────────────────┼─────┼────────────┼───────────────┤
│ X2 Cap 310VAC/2.2μF      │  6  │    €4      │     €24       │
├──────────────────────────┼─────┼────────────┼───────────────┤
│ Y2 Cap 300VAC/4.7nF      │  6  │    €2      │     €12       │
├──────────────────────────┼─────┼────────────┼───────────────┤
│ Decoupling MLCC set      │ set │    €50     │     €50       │
├──────────────────────────┴─────┴────────────┼───────────────┤
│ SUBTOTAL KONDENZATORI                       │     €716      │
└─────────────────────────────────────────────┴───────────────┘

┌─────────────────────────────────────────────────────────────┐
│ UKUPNO PASIVNE KOMPONENTE                   │    €2,156     │
└─────────────────────────────────────────────┴───────────────┘
```

### 4.2 Proizvođači i Dobavljači

```
Magnetne Komponente:

1. Custom Magnetics:
   - Himag (Kina) - dobar quality/price
   - Coilcraft (USA) - premium
   - Pulse Electronics - standard
   - Wurth Elektronik - EU dostupnost

2. Jezgra (za DIY):
   - TDK/EPCOS - feriti
   - Hitachi Metals - amorfni
   - Magnetics Inc - powder cores
   - VAC (Vacuumschmelze) - nanokristalni

3. Litz Wire:
   - New England Wire
   - Elektrisola
   - MWS Wire Industries

Kondenzatori:

1. DC Link / Film:
   - TDK/EPCOS (B32 serija)
   - Vishay (MKP serija)
   - Cornell Dubilier
   - KEMET (Film)

2. Elektrolitski:
   - Nichicon
   - Nippon Chemi-Con
   - Rubycon
   - EPCOS

3. Keramički (MLCC):
   - Murata
   - TDK
   - Samsung Electro-Mechanics
   - Yageo

4. Sigurnosni (X/Y):
   - Vishay
   - EPCOS
   - KEMET
   - Murata
```

### 4.3 Lead Time i Dostupnost

```
Tipični lead time-ovi:

│ Komponenta            │ Lead Time  │ Napomena           │
├───────────────────────┼────────────┼────────────────────┤
│ Standard feriti       │ 4-8 nedelja│ Stock OK           │
│ Custom magnetics      │ 8-16 nedelja│ Tooling potreban  │
│ Film kondenzatori     │ 6-12 nedelja│ Supply chain issue│
│ MLCC (common)         │ 2-4 nedelje│ Stock OK           │
│ MLCC (automotive)     │ 12-20 ned. │ AEC-Q200 verzije   │
│ DC Link (large)       │ 8-14 nedelja│ Made to order     │

Za EXPO 2027 projekat:
- Naručivanje komponenti: Q3 2026
- Prototip magnetics: Q2 2026
- Second source obavezan za kritične
```

## 5. Termalni i Mehanički Aspekti

### 5.1 Termalno Ponašanje Magnetika

```
Zagrevanje induktora:

         ┌─────────────────────────┐
         │      P_core             │
         │         +               │
         │      P_copper           │
         │         =               │
         │      P_total            │
         │         ↓               │
         │   Rth = ΔT / P_total    │
         │         ↓               │
         │   T_hot_spot            │
         └─────────────────────────┘

Termalni model:

T_hs = T_amb + P_total × (Rth_core + Rth_winding + Rth_case)

Tipične vrednosti:
- Rth_core-to-case: 2-5 K/W
- Rth_winding-to-core: 1-3 K/W
- Rth_case-to-ambient: 5-15 K/W (natural convection)
- Rth_case-to-ambient: 1-3 K/W (forced air)

Maksimalne temperature:
│ Materijal     │ T_max_operating │ Derating    │
├───────────────┼─────────────────┼─────────────┤
│ Ferrite 3C95  │ 200°C           │ 140°C       │
│ Litz wire     │ 180°C (class H) │ 150°C       │
│ Amorphous     │ 150°C           │ 120°C       │
│ Nanocrystal   │ 120°C           │ 100°C       │
```

### 5.2 Montaža i Vibracije

```
Mehanički zahtevi za EV punjač:

1. Vibracije (IEC 60068):
   - 5-150 Hz, 1g acceleration
   - Resonance search potreban

2. Shock:
   - 15g, 11ms half-sine

3. Fiksiranje magnetika:

   Opcija A: Epoxy potting
   ┌─────────────────────────┐
   │  █████████████████████  │
   │  ██  ┌───────────┐  ██  │
   │  ██  │ INDUCTOR  │  ██  │ Epoxy
   │  ██  │   CORE    │  ██  │ fill
   │  ██  └───────────┘  ██  │
   │  █████████████████████  │
   └─────────────────────────┘

   Prednosti: Termalno, mehanički robusno
   Nedostaci: Nepopravljivo, skuplje

   Opcija B: Bracket mount
   ┌──────────────────────────────┐
   │    ╔═══════════════╗         │
   │   ═╬═              ═╬═       │
   │   │║    CORE       ║│        │
   │   │║               ║│ Spring │
   │   │║   WINDING     ║│ clips  │
   │   │║               ║│        │
   │   ═╬═              ═╬═       │
   │    ╚═══════════════╝         │
   └──────────────────────────────┘

   Prednosti: Zamenljivo, jeftinije
   Nedostaci: Slabiji termalni kontakt

4. Fiksiranje kondenzatora:
   - PCB mount: MLCC, mali film
   - Bracket mount: DC link
   - Potting za vibracije
```

## 6. Zaključak i Preporuke

```
Ključne Preporuke za Pasivne Komponente:

1. Magnetika:
   ├── PFC induktor: Amorfni ili powder core
   ├── LLC transformer: Ferrite + integrisani Lr
   ├── EMI filter: Nanokristalni CM choke
   └── Wire: Litz za sve HF primene

2. DC Link:
   ├── Film kondenzatori preferentno
   ├── Hibridni (film+elko) za cost optimize
   └── Min 100,000h životni vek

3. Rezonantni (LLC):
   ├── PP film kondenzatori
   ├── Precizna tolerancija (±5%)
   └── Nizak ESR/ESL

4. EMI:
   ├── Safety rated (X2, Y2 klasa)
   ├── Poštovati leakage limits
   └── Multi-stage filtering

5. Proizvodnja:
   ├── Custom magnetics: 12-16 nedelja lead
   ├── Dual source za kritične
   └── AEC-Q200 za automotive grade

6. Testing:
   ├── Impedance analyzer za magnetics
   ├── LCR meter za kondenzatore
   ├── Thermal imaging u radu
   └── Vibration test obavezan
```
