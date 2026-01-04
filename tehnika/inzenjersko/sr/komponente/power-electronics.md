# Power Electronics - Detaljna razrada

## 1. Uvod

Power electronics je srce svakog EV punjača. Pretvara mrežni AC napon u regulirani DC napon potreban za punjenje baterije vozila. Ovaj dokument detaljno razrađuje sve aspekte dizajna power electronics sustava.

---

## 2. Arhitektura sustava

### 2.1 Dvostupanjska arhitektura (standard)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DVOSTUPANJSKA ARHITEKTURA                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   3-faz AC        EMI         AC/DC          DC Link        DC/DC          │
│   400V 50Hz      Filter       (PFC)          Bus           (Isolated)      │
│                                                                             │
│   ┌─────┐      ┌───────┐    ┌───────┐      ┌───────┐     ┌───────┐        │
│   │     │      │       │    │       │      │       │     │       │        │
│   │  ~  │─────►│ EMI   │───►│ PFC   │─────►│ 800V  │────►│ LLC/  │───► DC │
│   │     │      │       │    │       │      │  DC   │     │ DAB   │    Out │
│   │     │      │       │    │       │      │       │     │       │        │
│   └─────┘      └───────┘    └───────┘      └───────┘     └───────┘        │
│                                                                             │
│   Funkcije:                                                                 │
│   • EMI Filter: Suzbijanje smetnji, THD redukcija                          │
│   • PFC: Power factor correction (>0.99), AC→DC konverzija                 │
│   • DC Link: Energetski buffer, decoupling između stupnjeva                │
│   • DC/DC: Galvanska izolacija, naponska regulacija                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Prednosti dvostupanjske arhitekture

| Prednost | Obrazloženje |
|----------|--------------|
| Decoupling | PFC i DC/DC mogu se optimizirati neovisno |
| Regulacija | Širok izlazni naponski raspon (150-920V) |
| Izolacija | Galvanska izolacija u DC/DC stupnju |
| Efikasnost | Svaki stupanj optimiziran za svoju funkciju |
| Modularnost | Lakše skaliranje snage |

### 2.3 Jednostupanjska arhitektura (alternativa)

```
┌─────────────────────────────────────────────────────────────────┐
│              JEDNOSTUPANJSKA ARHITEKTURA                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   3-faz AC      EMI        Izolirani         DC                │
│   400V         Filter      AC/DC            Output              │
│                                                                 │
│   ┌─────┐    ┌───────┐   ┌────────────┐   ┌───────┐           │
│   │     │    │       │   │            │   │       │           │
│   │  ~  │───►│ EMI   │──►│  Matrix /  │──►│Filter │──► DC     │
│   │     │    │       │   │  DAB-based │   │       │   Out     │
│   │     │    │       │   │            │   │       │           │
│   └─────┘    └───────┘   └────────────┘   └───────┘           │
│                                                                 │
│   Prednosti:                                                    │
│   • Manji broj komponenti                                      │
│   • Potencijalno veća efikasnost (jedan stupanj konverzije)   │
│   • Kompaktniji dizajn                                         │
│                                                                 │
│   Nedostaci:                                                    │
│   • Složenija kontrola                                         │
│   • Ograničen naponski raspon                                  │
│   • Manje fleksibilan dizajn                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. AC/DC Stupanj - Power Factor Correction

### 3.1 Zašto PFC?

**Bez PFC:**
- Power factor: 0.6-0.7
- THD: 80-100%
- Harmonici opterećuju mrežu
- Penali od distributera električne energije

**S PFC:**
- Power factor: >0.99
- THD: <5%
- Sinusoidalna ulazna struja
- Usklađenost sa standardima (IEC 61000-3-2/12)

### 3.2 Vienna Rectifier - Detaljna analiza

#### Topologija

```
                           DC+ (400V)
                              │
                              │
    ┌─────────────────────────┼─────────────────────────┐
    │                         │                         │
   ═══                       ═══                       ═══
   ═══ C1                    ═══ C1                    ═══ C1
    │                         │                         │
    │    D1a    S1    D1b     │    D2a    S2    D2b     │    D3a    S3    D3b
    ├────►┤────┤────├◄────────├────►┤────┤────├◄────────├────►┤────┤────├◄────┤
    │           │              │          │              │          │          │
    │           │              │          │              │          │          │
    L1──[L]─────┴──────────────│          │              │          │          │
                               │          │              │          │          │
    L2──[L]────────────────────┴──────────┴──────────────│          │          │
                                                         │          │          │
    L3──[L]──────────────────────────────────────────────┴──────────┴──────────┤
    │                                                                           │
    │                         │                         │                       │
   ═══                       ═══                       ═══                      │
   ═══ C2                    ═══ C2                    ═══ C2                   │
    │                         │                         │                       │
    └─────────────────────────┼─────────────────────────┘                       │
                              │                                                 │
                           DC- (400V)                                           │
                              │                                                 │
                         Neutral Point ◄────────────────────────────────────────┘
```

#### Princip rada

**Pozitivna poluperioda (faza L1):**
1. Struja teče kroz L1, D1a, S1 (kad je uključen), i vraća se kroz neutral point
2. S1 se PWM modulira za kontrolu struje
3. Kad je S1 isključen, struja teče kroz D1a u gornji DC bus

**Negativna poluperioda (faza L1):**
1. Struja teče iz neutral pointa, kroz S1 (kad je uključen), D1b, i vraća se u L1
2. Kad je S1 isključen, struja teče iz donjeg DC busa kroz D1b

#### Matematički model

**Ulazna struja (po fazi):**
```
i_L(t) = I_m × sin(ωt)

Gdje je:
- I_m = √2 × I_rms
- ω = 2πf = 2π × 50 = 314.16 rad/s
```

**DC link napon:**
```
V_dc = 2 × V_ac_peak / √3 × M

Za 400V AC ulaz i M=0.95:
V_dc = 2 × 565V / 1.732 × 0.95 = ~620V (minimum)

Tipično se koristi V_dc = 700-800V za marginu
```

**Duty cycle za PFC:**
```
d(t) = 1 - (V_dc/2) / |v_ac(t)|

Za sinusoidalnu struju, duty cycle varira sinusoidalno
```

#### Specifikacije komponenti

| Komponenta | Vrijednost | Tip | Proizvođač |
|------------|------------|-----|------------|
| S1-S3 | 1200V/50A | SiC MOSFET | Wolfspeed C3M0065100K |
| D1a-D3b | 1200V/30A | SiC Schottky | Wolfspeed C4D20120D |
| L1-L3 | 200-500 µH | Sendust/Powder | Magnetics |
| C1, C2 | 500-1000 µF | Film PP | TDK EPCOS |

#### Kontrolna strategija

```
┌─────────────────────────────────────────────────────────────────┐
│              VIENNA RECTIFIER CONTROL                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   V_dc_ref ──┬──►[   ]──► V_dc_error                           │
│              │   │-│                                            │
│   V_dc_meas ─┘   [PI]──► I_ref (amplitude)                     │
│                    │                                            │
│                    ▼                                            │
│   V_ac_phase ──►[×]──► i_ref(t) = I_ref × sin(θ)              │
│                    │                                            │
│                    ▼                                            │
│   i_L_meas ─────►[ - ]──► i_error                              │
│                    │                                            │
│                    ▼                                            │
│                  [PI/PR]──► duty cycle                         │
│                    │                                            │
│                    ▼                                            │
│                  [PWM]──► Gate signals S1, S2, S3              │
│                                                                 │
│   Tipični PI parametri:                                        │
│   • Voltage loop: Kp=0.5, Ki=50, bandwidth ~20 Hz             │
│   • Current loop: Kp=0.1, Ki=500, bandwidth ~2 kHz            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Performanse

| Parametar | Vrijednost | Uvjet |
|-----------|------------|-------|
| Efikasnost | 98.5% | Puno opterećenje |
| Power factor | 0.995 | Puno opterećenje |
| THD struje | 2.5% | Puno opterećenje |
| THD struje | 5% | 20% opterećenja |

---

### 3.3 Active Front End (AFE) - Bidirekcijski

#### Topologija (Three-Phase Two-Level)

```
                                    DC+
                                     │
                                    ═══
                                    ═══ C_dc
                                     │
    ┌────────────────┬───────────────┼───────────────┬────────────────┐
    │                │               │               │                │
   ┌┴┐              ┌┴┐             ┌┴┐             ┌┴┐              ┌┴┐
   │S1│             │S3│            │S5│            │  │             │  │
   │  │             │  │            │  │            │  │             │  │
   └┬┘              └┬┘             └┬┘             └┬┘              └┬┘
    │                │               │               │                │
    ├────[L1]────────┤               │               │                │
    │                │               │               │                │
    │                ├────[L2]───────┤               │                │
    │                │               │               │                │
    │                │               ├────[L3]───────┤                │
    │                │               │               │                │
   ┌┴┐              ┌┴┐             ┌┴┐             │                │
   │S2│             │S4│            │S6│            │                │
   │  │             │  │            │  │            │                │
   └┬┘              └┬┘             └┬┘             │                │
    │                │               │               │                │
    └────────────────┴───────────────┼───────────────┴────────────────┘
                                     │
                                    ═══
                                    ═══ C_dc
                                     │
                                    DC-
```

#### Prednosti AFE nad Vienna Rectifierom

| Aspekt | Vienna | AFE |
|--------|--------|-----|
| Bidirekcionalnost | Ne | Da |
| V2G sposobnost | Ne | Da |
| Reaktivna kompenzacija | Ne | Da |
| Broj aktivnih sklopki | 3 | 6 |
| Efikasnost | 98.5% | 97-98% |
| Kompleksnost kontrole | Srednja | Visoka |

#### Space Vector Modulation (SVM) za AFE

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPACE VECTOR DIAGRAM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                         V3 (010)                                │
│                            /\                                   │
│                           /  \                                  │
│                          /    \                                 │
│                         /      \                                │
│                        /   S3   \                               │
│                       /          \                              │
│              V2 (110)/     S2     \ V4 (011)                   │
│                     /              \                            │
│                    /    ┌──────┐    \                          │
│                   /     │V_ref │     \                         │
│                  /      │  θ   │      \                        │
│                 /       └──────┘       \                       │
│                /     S1          S4     \                      │
│               /                          \                     │
│      V1 (100)────────────────────────────── V5 (001)          │
│               \           S6           S5 /                    │
│                \                        /                      │
│                 \                      /                       │
│                  \        V0         /                         │
│                   \     (000,111)   /                          │
│                    \              /                            │
│                     \            /                             │
│                      V6 (101)                                  │
│                                                                 │
│   Switching states: V0-V7 (8 states, 2 zero vectors)          │
│   V_ref se sintetizira iz najbližih vektora                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### SVM algoritam

```c
// Space Vector Modulation Implementation
void SVM_Calculate(float V_alpha, float V_beta, float V_dc,
                   float* duty_a, float* duty_b, float* duty_c) {

    // Izračun sektora
    float V_ref = sqrt(V_alpha*V_alpha + V_beta*V_beta);
    float theta = atan2(V_beta, V_alpha);
    if (theta < 0) theta += 2*PI;

    int sector = (int)(theta / (PI/3)) + 1;

    // Normalizacija
    float m = V_ref / (V_dc / sqrt(3));  // Modulation index
    float angle = theta - (sector-1) * PI/3;

    // Vrijeme vektora
    float T1 = m * sin(PI/3 - angle);
    float T2 = m * sin(angle);
    float T0 = 1 - T1 - T2;

    // Duty cycle prema sektoru
    switch(sector) {
        case 1:
            *duty_a = T1 + T2 + T0/2;
            *duty_b = T2 + T0/2;
            *duty_c = T0/2;
            break;
        case 2:
            *duty_a = T1 + T0/2;
            *duty_b = T1 + T2 + T0/2;
            *duty_c = T0/2;
            break;
        // ... cases 3-6
    }
}
```

---

### 3.4 Three-Level NPC (Neutral Point Clamped)

#### Topologija

```
                                         DC+
                                          │
                                         ═══ C1
                                          │
    ┌─────────────────┬───────────────────┼─────────────────┐
    │                 │                   │                 │
   ┌┴┐               ┌┴┐                 ┌┴┐               │
   │S1a│             │S2a│               │S3a│              │
   └┬┘               └┬┘                 └┬┘               │
    │                 │                   │                 │
   ┌┴┐               ┌┴┐                 ┌┴┐               │
   │S1b│             │S2b│               │S3b│              │
   └┬┘               └┬┘                 └┬┘               │
    │                 │                   │                 │
    ├────►│D1├────────┼────►│D2├──────────┼────►│D3├───────┤ Neutral
    │                 │                   │                 │   Point
   ┌┴┐               ┌┴┐                 ┌┴┐               │
   │S1c│             │S2c│               │S3c│              │
   └┬┘               └┬┘                 └┬┘               │
    │                 │                   │                 │
   ┌┴┐               ┌┴┐                 ┌┴┐               │
   │S1d│             │S2d│               │S3d│              │
   └┬┘               └┬┘                 └┬┘               │
    │                 │                   │                 │
    └─────────────────┴───────────────────┼─────────────────┘
                                          │
                                         ═══ C2
                                          │
                                         DC-
```

#### Prednosti 3-Level NPC

| Prednost | Kvantifikacija |
|----------|----------------|
| Niži naponski stres | V_dc/2 po sklopki (vs V_dc za 2-level) |
| Manji THD | 50% manji nego 2-level |
| Manje dv/dt | Pola od 2-level |
| Manji EMI | Značajno poboljšanje |
| Veća efikasnost | +0.5-1% |

#### Nedostaci

- Više komponenti (12 sklopki + 6 dioda vs 6 sklopki)
- Balansiranje neutral pointa
- Kompleksnija kontrola

---

## 4. DC/DC Stupanj - Izolirani pretvarači

### 4.1 LLC Rezonantni pretvarač - Detaljna analiza

#### Topologija

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LLC RESONANT CONVERTER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   V_dc+ ──┬──────┐                                                         │
│           │     ┌┴┐                                                        │
│           │     │S1│ (High-side)                                           │
│           │     └┬┘                                                        │
│           │      │                                                          │
│           │      ├──────[Lr]──────[Cr]──────┐                              │
│           │      │                          │                               │
│           │      │    ┌────────────────┐    │                               │
│           │      │    │                │    │                               │
│           │      │    │   ┌────────┐   │    │        SEKUNDARNA STRANA     │
│           │      │    │   │        │   │    │    ┌─────────────────────┐   │
│           │      │    │   │   Lm   │   │    │    │                     │   │
│           │      └────┤   │        │   ├────┘    │    D1  ┌───┐       │   │
│           │           │   └────────┘   │         │   ──►├─┤   ├───┐   │   │
│           │           │                │         │       └───┘   │   │   │
│           │           │  TRANSFORMER   │    ○────┤              ═══  │   │
│           │           │    n:1         │    ○    │   ──►├─┐     ═══ C_out│
│           │           │                │         │   D2  │ │      │   │   │
│           │      ┌────┤                ├────┐    │       └─┤      │   │   │
│           │      │    │                │    │    │         └──────┤   │   │
│           │      │    └────────────────┘    │    │                │   │   │
│           │      │                          │    └────────────────┼───┘   │
│           │      ├──────────────────────────┘                     │       │
│           │      │                                                ▼       │
│           │     ┌┴┐                                           V_out       │
│           │     │S2│ (Low-side)                                           │
│           │     └┬┘                                                        │
│           │      │                                                          │
│   V_dc- ──┴──────┘                                                         │
│                                                                             │
│   Komponente:                                                               │
│   • Lr = Rezonantna induktivnost (serijska)                                │
│   • Cr = Rezonantni kondenzator                                            │
│   • Lm = Magnetizacijska induktivnost transformatora                       │
│   • n = Omjer namota transformatora                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Rezonantne frekvencije

**Serijska rezonantna frekvencija (fr):**
```
fr = 1 / (2π × √(Lr × Cr))
```

**Paralelna rezonantna frekvencija (fp):**
```
fp = 1 / (2π × √((Lr + Lm) × Cr))
```

**Odnos:**
```
fp < fr (uvijek)

Ln = Lm / Lr  (tipično 3-7)

fp = fr / √(1 + Ln)
```

#### Gain karakteristika

```
┌─────────────────────────────────────────────────────────────────┐
│                   LLC GAIN CHARACTERISTIC                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Gain │                                                        │
│   M    │     Light load                                        │
│        │        ╱╲                                              │
│   1.4 ─│       ╱  ╲                                             │
│        │      ╱    ╲  Medium load                               │
│   1.2 ─│     ╱      ╲    ╱╲                                     │
│        │    ╱        ╲  ╱  ╲  Heavy load                        │
│   1.0 ─│───╱──────────╲╱────╲─────────────────                  │
│        │  ╱                  ╲                                  │
│   0.8 ─│ ╱                    ╲                                 │
│        │╱                      ╲                                │
│   0.6 ─│                        ╲                               │
│        │                                                        │
│        └────────────────────────────────────────────────────    │
│             fp        fr                    f_sw                │
│                                                                 │
│   Operativne regije:                                           │
│   • f_sw < fp: Capacitive mode (izbjegavati - gubitak ZVS)    │
│   • fp < f_sw < fr: Below resonance (ZVS, boost operation)    │
│   • f_sw = fr: Resonance (max efficiency)                     │
│   • f_sw > fr: Above resonance (ZVS, buck operation)          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Dizajn procedura za 50 kW LLC

**Ulazni parametri:**
```
P_out = 50 kW
V_in = 800 V (DC link)
V_out = 200-800 V (battery range)
f_r = 100 kHz (target resonant frequency)
```

**Korak 1: Omjer transformatora**
```
n = V_in / (2 × V_out_nom) = 800 / (2 × 400) = 1:1
```

**Korak 2: Ekvivalentni otpor opterećenja**
```
R_ac = (8 × n² × V_out²) / (π² × P_out)
R_ac = (8 × 1 × 400²) / (π² × 50000) = 2.6 Ω
```

**Korak 3: Quality factor (Q)**
```
Q = √(Lr/Cr) / R_ac

Tipično Q = 0.3-0.5 za širok raspon opterećenja
Odabiremo Q = 0.4
```

**Korak 4: Ln = Lm/Lr**
```
Ln = 5 (kompromis između gain raspona i efikasnosti)
```

**Korak 5: Izračun komponenti**
```
Cr = 1 / (2π × fr × Q × R_ac)
Cr = 1 / (2π × 100k × 0.4 × 2.6) = 153 nF

Lr = 1 / ((2π × fr)² × Cr)
Lr = 1 / ((2π × 100k)² × 153n) = 16.5 µH

Lm = Ln × Lr = 5 × 16.5 = 82.5 µH
```

**Korak 6: Verifikacija gain raspona**
```
M_min = V_out_min × n / (V_in/2) = 200 × 1 / 400 = 0.5
M_max = V_out_max × n / (V_in/2) = 800 × 1 / 400 = 2.0

Potreban M raspon: 0.5 - 2.0
LLC s Ln=5, Q=0.4 može postići M = 0.7 - 1.4

Problem: Potreban veći M raspon!
```

**Korak 7: Redizajn za širi raspon**
```
Opcija A: Smanjiti Ln na 3
- Veći M raspon ali manja efikasnost

Opcija B: Koristiti varijabilni DC link
- PFC regulira V_dc za optimalni M

Opcija C: Dodatni buck/boost stupanj
- Povećava kompleksnost ali omogućuje puni raspon
```

#### Soft Switching analiza

**Zero Voltage Switching (ZVS) uvjet:**
```
Za ZVS primarnih sklopki:
I_Lm(t_dead) > 0

I_Lm_peak = (V_in × T_sw) / (4 × Lm)

Dead time za ZVS:
t_dead > (2 × C_oss × V_in) / I_Lm_peak

Tipično: t_dead = 100-500 ns
```

**Zero Current Switching (ZCS) na sekundarnoj strani:**
```
Kad f_sw > fr, diode na sekundarnoj strani
prirodno komutiraju pri nultoj struji (ZCS)
```

---

### 4.2 Dual Active Bridge (DAB) - Detaljna analiza

#### Topologija

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DUAL ACTIVE BRIDGE (DAB)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   PRIMARNI H-BRIDGE              TRANSFORMER           SEKUNDARNI H-BRIDGE │
│                                                                             │
│   V1+ ──┬────────┐                  ┌────┐                ┌────────┬── V2+ │
│         │       ┌┴┐                 │    │               ┌┴┐       │       │
│         │       │S1│                │    │               │S5│       │       │
│         │       └┬┘                 │    │               └┬┘       │       │
│         │        │                  │    │                │        │       │
│         │        ├──────[L]─────────┤ n:1├────────────────┤        │       │
│         │        │                  │    │                │        │       │
│         │       ┌┴┐                 │    │               ┌┴┐       │       │
│         │       │S3│                │    │               │S7│       │       │
│         │       └┬┘                 │    │               └┬┘       │       │
│         │        │                  └────┘                │        │       │
│         │        │                                        │        │       │
│         │        │                                        │        │       │
│         │       ┌┴┐                                      ┌┴┐       │       │
│         │       │S2│                                     │S6│       │       │
│         │       └┬┘                                      └┬┘       │       │
│         │        │                                        │        │       │
│         │        ├────────────────────────────────────────┤        │       │
│         │        │                                        │        │       │
│         │       ┌┴┐                                      ┌┴┐       │       │
│         │       │S4│                                     │S8│       │       │
│         │       └┬┘                                      └┬┘       │       │
│         │        │                                        │        │       │
│   V1- ──┴────────┘                                        └────────┴── V2- │
│                                                                             │
│   L = Serijska induktivnost (može biti leakage transformatora)             │
│   n = Omjer namota transformatora                                          │
│   S1-S4 = Primarne sklopke                                                 │
│   S5-S8 = Sekundarne sklopke                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Single Phase Shift (SPS) kontrola

```
┌─────────────────────────────────────────────────────────────────┐
│              SINGLE PHASE SHIFT MODULATION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   V_p  │    ┌─────┐         ┌─────┐                            │
│        │    │     │         │     │                            │
│   +V1 ─┤────┘     └─────────┘     └─────────                   │
│        │                                                        │
│    0  ─┤                                                        │
│        │         ┌─────┐         ┌─────┐                       │
│   -V1 ─┤─────────┘     └─────────┘     └────                   │
│        │                                                        │
│        └───────────────────────────────────────► t              │
│                                                                 │
│   V_s  │       ┌─────┐         ┌─────┐                         │
│        │  φ    │     │         │     │                         │
│   +V2 ─┤──┼────┘     └─────────┘     └─────                    │
│        │  │                                                     │
│    0  ─┤  │                                                     │
│        │  │    ┌─────┐         ┌─────┐                         │
│   -V2 ─┤──┼────┘     └─────────┘     └─────                    │
│        │  │                                                     │
│        └──┴────────────────────────────────────► t              │
│           │                                                     │
│           φ = Phase shift angle                                 │
│                                                                 │
│   Prijenos snage:                                              │
│                                                                 │
│   P = (V1 × V2 × φ × (π - |φ|)) / (2π² × f_sw × L × n)        │
│                                                                 │
│   Maksimalna snaga pri φ = π/2 (90°)                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Extended Phase Shift (EPS) i Dual Phase Shift (DPS)

Za poboljšanje efikasnosti pri laganom opterećenju:

```
EPS: Dodaje phase shift unutar primarnog ili sekundarnog bridgea
DPS: Phase shift i na primarnom i na sekundarnom bridgeu
TPS: Triple phase shift - svi stupnjevi slobode
```

#### ZVS analiza za DAB

```
ZVS uvjet za primarne sklopke:
I_L(0) < 0  (struja mora teći kroz antiparalelnu diodu)

I_L(0) = (n×V2 - V1) × φ / (2π × f_sw × L) + (V1 × (π - φ)) / (2π × f_sw × L)

Za širok ZVS raspon:
- Optimizirati L
- Koristiti napredne modulacijske strategije (EPS, DPS)
- Dodati pomoćne ZVS mreže
```

#### Dizajn primjer za 50 kW DAB

**Specifikacije:**
```
P = 50 kW
V1 = 800 V (DC link)
V2 = 200-800 V (baterija)
f_sw = 50 kHz
```

**Transformator:**
```
n = V1 / V2_nom = 800 / 400 = 2:1
```

**Serijska induktivnost:**
```
Za P_max pri φ = π/4 (45°, za marginu):

L = (V1 × V2 × φ × (π - φ)) / (2π² × f_sw × P × n)
L = (800 × 400 × 0.785 × 2.356) / (2 × 9.87 × 50k × 50k × 2)
L = 12 µH
```

**Transformer leakage:**
```
Ako je L_leakage = 5 µH, dodati:
L_ext = 12 - 5 = 7 µH eksterna induktivnost
```

---

## 5. Usporedba topologija

### 5.1 AC/DC topologije

| Parametar | Vienna | 2L-AFE | 3L-NPC | T-Type |
|-----------|--------|--------|--------|--------|
| Efikasnost | 98.5% | 97% | 98% | 98.2% |
| Power factor | 0.99 | 0.99 | 0.99 | 0.99 |
| THD | <3% | <5% | <3% | <3% |
| V2G | Ne | Da | Da | Da |
| Broj sklopki | 3 | 6 | 12 | 9 |
| Naponski stres | V_dc | V_dc | V_dc/2 | Mix |
| Kompleksnost | Srednja | Srednja | Visoka | Srednja |
| Cijena | $ | $ | $$$ | $$ |
| **Preporuka** | Unidir. | V2G simple | High power | Best overall |

### 5.2 DC/DC topologije

| Parametar | LLC | DAB | PSFB | CLLC |
|-----------|-----|-----|------|------|
| Efikasnost | 98% | 97% | 96% | 97.5% |
| Bidirekcionalnost | Ne | Da | Ne | Da |
| V2G | Ne | Da | Ne | Da |
| ZVS raspon | Širok | Ograničen | Srednji | Širok |
| Naponski raspon | ±20% | Širok | Širok | Širok |
| Kompleksnost | Srednja | Visoka | Niska | Visoka |
| Cijena | $$ | $$$ | $ | $$$ |
| **Preporuka** | Unidir. | V2G | Budget | V2G premium |

---

## 6. Layout i PCB dizajn

### 6.1 Power loop minimizacija

```
┌─────────────────────────────────────────────────────────────────┐
│                    POWER LOOP OPTIMIZATION                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   LOŠE (velika petlja):                                        │
│                                                                 │
│   DC+ ────────────────────────────┐                            │
│                                   │                             │
│                          ┌────────┴────────┐                   │
│                          │     MOSFET      │                   │
│                          └────────┬────────┘                   │
│                                   │                             │
│                                   │     ← Duga petlja          │
│                                   │       = Visoki L          │
│                          ┌────────┴────────┐                   │
│                          │   Kondenzator   │                   │
│                          └────────┬────────┘                   │
│                                   │                             │
│   DC- ────────────────────────────┘                            │
│                                                                 │
│                                                                 │
│   DOBRO (minimalna petlja):                                    │
│                                                                 │
│   DC+ ───┐                                                     │
│          │                                                      │
│   ┌──────┴──────┬──────────────┐                               │
│   │   MOSFET    │  Kondenzator │  ← Minimalna petlja          │
│   └──────┬──────┴──────────────┘    = Niski L                  │
│          │                                                      │
│   DC- ───┘                                                     │
│                                                                 │
│   Preporuke:                                                   │
│   • Koristiti laminirane bus barove                           │
│   • DC link kapacitor direktno uz MOSFETe                     │
│   • Višeslojni PCB s power i ground planovima                 │
│   • Ciljna parazitska induktivnost: < 10 nH                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Gate driver layout

```
┌─────────────────────────────────────────────────────────────────┐
│                  GATE DRIVER PCB LAYOUT                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                                                         │  │
│   │   ┌─────────┐                        ┌─────────┐       │  │
│   │   │  Gate   │    ← Kratki putovi     │  SiC    │       │  │
│   │   │ Driver  │───────────────────────►│ MOSFET  │       │  │
│   │   │   IC    │    < 20mm              │         │       │  │
│   │   └─────────┘                        └─────────┘       │  │
│   │        │                                   │            │  │
│   │        │                                   │            │  │
│   │   ┌────┴────┐                         ┌────┴────┐      │  │
│   │   │ Decoup. │                         │ Kelvin  │      │  │
│   │   │  Caps   │                         │ Source  │      │  │
│   │   │100nF×3  │                         │  Conn.  │      │  │
│   │   └─────────┘                         └─────────┘      │  │
│   │                                                         │  │
│   │   Pravila:                                             │  │
│   │   • Kelvin source za precizno gate-source              │  │
│   │   • Decoupling caps < 5mm od gate drivera             │  │
│   │   • Minimizirati gate loop induktivnost               │  │
│   │   • Odvojeni slojevi za power i signal                │  │
│   │                                                         │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Simulacija i verifikacija

### 7.1 Preporučeni alati

| Alat | Namjena | Cijena |
|------|---------|--------|
| LTspice | Circuit simulation | Besplatno |
| PLECS | Power electronics | $$ |
| PSIM | Power electronics | $$ |
| Simulink/Simscape | System simulation | $$$ |
| SIMetrix | Circuit simulation | $ |
| Altium Designer | PCB design | $$$ |
| Ansys Icepak | Thermal simulation | $$$$ |
| CST Studio | EMC simulation | $$$$ |

### 7.2 Kritične simulacije

1. **Steady-state analiza**
   - Efikasnost vs opterećenje
   - THD vs opterećenje
   - Power factor vs opterećenje

2. **Transient analiza**
   - Load step response
   - Startup/shutdown
   - Fault conditions

3. **Thermal analiza**
   - Junction temperature
   - Thermal cycling stress
   - Cooling system adequacy

4. **EMC analiza**
   - Conducted emissions
   - Radiated emissions
   - Filter effectiveness

---

## 8. Reference

- [MDPI: Power Converter Topologies Review](https://www.mdpi.com/2079-9292/12/7/1581)
- [Wolfspeed: SiC in DC Fast Chargers](https://www.wolfspeed.com/knowledge-center/article/designing-with-silicon-carbide-sic-in-electric-vehicle-dc-fast-chargers/)
- [TI: Power Topology Considerations for EVs](https://www.ti.com/lit/pdf/slla497)
- [Infineon: LLC Design Guide](https://www.infineon.com/LLC)
- [IEEE: DAB Converter Modulation Strategies](https://ieeexplore.ieee.org)
