# V2G Kontrolni Algoritmi

Ovaj dokument detaljno opisuje kontrolne algoritme potrebne za dvosmerni V2G (Vehicle-to-Grid) rad u ELEKTROKOMBINACIJA sistemu.

---

## 1. Sinhronizacija sa Mrežom - SRF-PLL

### 1.1 Pregled

Synchronous Reference Frame Phase-Locked Loop (SRF-PLL) je esencijalan za invertere povezane na mrežu. Obezbeđuje:
- Fazni ugao (θ) za Park transformaciju
- Frekvenciju mreže (f) za droop kontrolu
- Amplitudu napona mreže (Vd) za proračun snage

### 1.2 Koordinatne Transformacije

#### Clarke Transformacija (abc → αβ)

Konvertuje trofazne veličine u stacionarni dvofazni referentni okvir:

```
┌     ┐       ┌                        ┐ ┌    ┐
│ Vα  │       │  1      -1/2     -1/2  │ │ Va │
│     │ = 2/3 │                        │ │    │
│ Vβ  │       │  0    √3/2    -√3/2    │ │ Vb │
└     ┘       └                        ┘ │ Vc │
                                         └    ┘
```

U kodu:
```c
// Clarke transformacija (amplitudno-invarijantna)
Valpha = (2.0f/3.0f) * (Va - 0.5f*Vb - 0.5f*Vc);
Vbeta  = (2.0f/3.0f) * (SQRT3_2) * (Vb - Vc);

// gde je SQRT3_2 = 0.866025f
```

#### Park Transformacija (αβ → dq)

Konvertuje stacionarni okvir u rotirajući sinhroni okvir:

```
┌    ┐   ┌                  ┐ ┌    ┐
│ Vd │   │  cos(θ)   sin(θ) │ │ Vα │
│    │ = │                  │ │    │
│ Vq │   │ -sin(θ)   cos(θ) │ │ Vβ │
└    ┘   └                  ┘ └    ┘
```

U kodu:
```c
// Park transformacija
float cos_theta = cosf(theta);
float sin_theta = sinf(theta);
Vd =  Valpha * cos_theta + Vbeta * sin_theta;
Vq = -Valpha * sin_theta + Vbeta * cos_theta;
```

#### Inverzna Park Transformacija (dq → αβ)

Koristi se za generisanje referentnih napona za PWM:

```
┌    ┐   ┌                   ┐ ┌    ┐
│ Vα │   │  cos(θ)   -sin(θ) │ │ Vd │
│    │ = │                   │ │    │
│ Vβ │   │  sin(θ)    cos(θ) │ │ Vq │
└    ┘   └                   ┘ └    ┘
```

### 1.3 Struktura PLL

```
                        ┌──────────────────────────────────────────────┐
                        │               SRF-PLL                         │
                        │                                               │
Vabc ──► [Clarke] ──► [Park(θ)] ──► Vq ──► [PI] ──► Δω ──► [+] ──► ω ──► [∫] ──► θ
                           ▲                          ▲            │
                           │                          │            │
                           │                       ω_nom          │
                           │                                       │
                           └───────────────────────────────────────┘

Princip:
- Kada je θ = θ_mreža, d-osa se poklapa sa vektorom napona
- Vq postaje nula (q-osa je normalna na napon)
- PI regulator vodi Vq → 0 podešavanjem ω
- ω se integriše u θ, zatvarajući petlju
```

### 1.4 Dizajn PI Regulatora

Propusni opseg PLL određuje kompromis brzina/šum:
- Brz PLL (širok propusni opseg): Brzo praćenje, ali osetljiv na harmonike
- Spor PLL (uzak propusni opseg): Čist izlaz, ali spor odziv

**Tipičan dizajn za 50 Hz mrežu:**
- Propusni opseg: 15-25 Hz
- Faktor prigušenja: 0.707 (kritično prigušen)

```
Prenosna funkcija:
H(s) = (Kp × s + Ki) / s²

Prirodna frekvencija: ωn = √Ki
Faktor prigušenja: ζ = Kp / (2 × √Ki)

Za ωn = 2π × 20 Hz i ζ = 0.707:
Ki = ωn² = (125.66)² ≈ 15,790
Kp = 2 × ζ × ωn = 2 × 0.707 × 125.66 ≈ 178
```

### 1.5 Kompletna Implementacija PLL

```c
#include <math.h>

// Konstante
#define PI           3.14159265f
#define SQRT3_2      0.86602540f
#define OMEGA_NOM    314.159265f   // 2π × 50 Hz

// Parametri podešavanja
#define PLL_KP       178.0f
#define PLL_KI       15790.0f
#define PLL_OMEGA_MIN  (2*PI * 45.0f)   // 45 Hz minimum
#define PLL_OMEGA_MAX  (2*PI * 55.0f)   // 55 Hz maksimum

typedef struct {
    // Promenljive stanja
    float theta;         // Fazni ugao [rad]
    float omega;         // Ugaona frekvencija [rad/s]
    float freq;          // Frekvencija [Hz]
    float integral;      // Stanje PI integratora

    // Izlazi
    float Vd;            // Napon d-ose (amplituda)
    float Vq;            // Napon q-ose (treba biti ~0 kada je zaključan)
    float Valpha;        // Napon alfa-ose
    float Vbeta;         // Napon beta-ose

    // Status
    bool locked;         // Status zaključavanja PLL
    float lock_counter;  // Brojač za detekciju zaključavanja
} PLL_State;

void PLL_Init(PLL_State* pll) {
    pll->theta = 0.0f;
    pll->omega = OMEGA_NOM;
    pll->freq = 50.0f;
    pll->integral = 0.0f;
    pll->Vd = 0.0f;
    pll->Vq = 0.0f;
    pll->locked = false;
    pll->lock_counter = 0.0f;
}

void PLL_Update(PLL_State* pll, float Va, float Vb, float Vc, float Ts) {
    // 1. Clarke transformacija (abc → αβ)
    pll->Valpha = (2.0f/3.0f) * (Va - 0.5f*Vb - 0.5f*Vc);
    pll->Vbeta  = (2.0f/3.0f) * SQRT3_2 * (Vb - Vc);

    // 2. Park transformacija (αβ → dq)
    float cos_theta = cosf(pll->theta);
    float sin_theta = sinf(pll->theta);
    pll->Vd =  pll->Valpha * cos_theta + pll->Vbeta * sin_theta;
    pll->Vq = -pll->Valpha * sin_theta + pll->Vbeta * cos_theta;

    // 3. Normalizuj Vq sa Vd za bolje dinamičke karakteristike
    float Vq_normalized = (fabsf(pll->Vd) > 10.0f) ? (pll->Vq / pll->Vd) : 0.0f;

    // 4. PI regulator
    pll->integral += PLL_KI * Vq_normalized * Ts;

    // Anti-windup: ograniči integrator
    float int_limit = PLL_OMEGA_MAX - OMEGA_NOM;
    pll->integral = fmaxf(-int_limit, fminf(int_limit, pll->integral));

    // Izračunaj ugaonu frekvenciju
    float delta_omega = PLL_KP * Vq_normalized + pll->integral;
    pll->omega = OMEGA_NOM + delta_omega;

    // Ograničenja frekvencije
    pll->omega = fmaxf(PLL_OMEGA_MIN, fminf(PLL_OMEGA_MAX, pll->omega));

    // 5. Integracija faznog ugla
    pll->theta += pll->omega * Ts;

    // Omotaj na [0, 2π]
    while (pll->theta >= 2*PI) pll->theta -= 2*PI;
    while (pll->theta < 0) pll->theta += 2*PI;

    // 6. Izračunaj frekvenciju u Hz
    pll->freq = pll->omega / (2*PI);

    // 7. Detekcija zaključavanja (Vq treba biti blizu nule)
    if (fabsf(pll->Vq) < 0.05f * fabsf(pll->Vd)) {
        pll->lock_counter += Ts;
        if (pll->lock_counter > 0.1f) {  // 100ms stabilnog zaključavanja
            pll->locked = true;
        }
    } else {
        pll->lock_counter = 0.0f;
        pll->locked = false;
    }
}

// Pomoćna funkcija: Dobij amplitudu napona mreže (vršna linija-neutrala)
float PLL_GetVoltage(PLL_State* pll) {
    return sqrtf(pll->Vd * pll->Vd + pll->Vq * pll->Vq);
}

// Pomoćna funkcija: Dobij napon mreže u relativnim jedinicama
float PLL_GetVoltagePU(PLL_State* pll, float V_base) {
    return PLL_GetVoltage(pll) / V_base;
}
```

### 1.6 Specifikacije Performansi

| Parametar | Vrednost | Napomene |
|-----------|----------|----------|
| Vreme smirivanja | < 50 ms | Za 5% skok frekvencije |
| Greška u ustaljenom stanju | < 0.01 Hz | Pri stabilnoj mreži |
| Fazna greška | < 1° | Nakon smirivanja |
| Propusni opseg | ~20 Hz | Kompromis: brzina vs šum |
| Učestanost odabiranja | 10-20 kHz | Usklađeno sa kontrolnom petljom |

---

## 2. Frekvencijski Odziv - P(f) Droop Kontrola

### 2.1 Koncept

Droop kontrola obezbeđuje automatsku regulaciju frekvencije podešavanjem izlazne snage na osnovu odstupanja frekvencije mreže:
- Pod-frekvencija → Smanji punjenje (ili prazni preko V2G)
- Nad-frekvencija → Povećaj punjenje

Ovo oponaša ponašanje sinhronih generatora i obezbeđuje stabilnost mreže.

### 2.2 Droop Karakteristika

```
P/Pn (%)
   ▲
 100│                    ┌─────── Pmax (punjenje)
    │                   /
  80│                  /
    │                 /
  60│                /  ← Droop nagib
    │               /      (tipično 4%)
  40│              /
    │             /
  20│            /
    │           /
   0├─────────/────────────────────────────────► f (Hz)
    │        /|    |    |    |    |
 -20│       / |    |    |    |    |
    │      /  |    |    |    |    |
 -40│     /   |    |    |    |    |
    │    /    |    |    |    |    |
 -60│   /     |    |    |    |    |
    │  /      |    |    |    |    |
 -80│ /       |    |    |    |    |
    │/        |    |    |    |    |
-100├─────────┴────┴────┴────┴────┘────────── Pmax (V2G pražnjenje)
    49.0   49.5  49.95 50.05 50.5  51.0

         Pod-frekv.    ◄──►  Nad-frekv.
                    Mrtva zona
                    (±50 mHz)
```

### 2.3 Matematička Formulacija

**Droop jednačina:**
```
ΔP = -Kp × Δf

Gde je:
    ΔP = Podešavanje snage [W]
    Δf = f_merena - f_nominalna [Hz]
    Kp = Droop koeficijent [W/Hz]

Za X% droop:
    Kp = Pn / (X/100 × f_nominalna)

Primer (4% droop, Pn = 30 kW, f0 = 50 Hz):
    Kp = 30000 / (0.04 × 50) = 15000 W/Hz

Značenje: Za svaki pad od 1 Hz, smanji snagu za 15 kW
```

**Sa mrtvom zonom:**
```
Ako |Δf| ≤ f_mrtva_zona:
    P_podešavanje = 0

Ako Δf < -f_mrtva_zona (pod-frekvencija):
    P_podešavanje = -Kp × (Δf + f_mrtva_zona)

Ako Δf > +f_mrtva_zona (nad-frekvencija):
    P_podešavanje = -Kp × (Δf - f_mrtva_zona)
```

### 2.4 Zahtevi Mrežnih Pravila

| Mrežna Pravila | Droop Opseg | Mrtva Zona | Brzina Promene |
|----------------|-------------|------------|----------------|
| ENTSO-E (EU) | 2-12% | ±10-500 mHz | ≤10% Pn/min |
| VDE AR-N 4110 (DE) | 2-12% | ±10 mHz | ≤10% Pn/min |
| EirGrid (IE) | 3-5% | ±15 mHz | ≤1% Pn/s |
| National Grid (UK) | 3-5% | ±15 mHz | ≤1% Pn/s |

### 2.5 Implementacija

```c
// Konfiguracija (zavisna od mrežnih pravila)
#define F_NOMINAL         50.0f      // Nominalna frekvencija [Hz]
#define F_DEADBAND        0.05f      // ±50 mHz mrtva zona
#define DROOP_PERCENT     4.0f       // 4% droop
#define RAMP_RATE_LIMIT   0.10f      // 10% Pn/s max brzina promene

// Frekvencijska ograničenja za zaštitu
#define F_MIN_OPERATE     47.5f      // Ispod ovog: isključenje
#define F_MAX_OPERATE     51.5f      // Iznad ovog: isključenje
#define F_V2G_ENABLE      49.8f      // Omogući V2G ispod ovog
#define F_CHARGE_REDUCE   49.9f      // Počni smanjivati punjenje ispod ovog

typedef struct {
    // Ulazi
    float P_scheduled;      // Planirana snaga iz ISO 15118 [W]
    float P_nominal;        // Nominalna snaga [W]

    // Stanje
    float P_target;         // Ciljna snaga nakon droop [W]
    float P_actual;         // Stvarna snaga (nakon rampe) [W]
    float droop_kp;         // Droop koeficijent [W/Hz]

    // Konfiguracija
    float droop_percent;
    float deadband;
    float ramp_rate;

    // Status
    bool freq_ok;           // Frekvencija u granicama
    bool v2g_enabled;       // V2G pražnjenje dozvoljeno
} FreqDroop_State;

void FreqDroop_Init(FreqDroop_State* fd, float P_nominal) {
    fd->P_scheduled = 0.0f;
    fd->P_nominal = P_nominal;
    fd->P_target = 0.0f;
    fd->P_actual = 0.0f;
    fd->droop_percent = DROOP_PERCENT;
    fd->deadband = F_DEADBAND;
    fd->ramp_rate = RAMP_RATE_LIMIT;

    // Izračunaj droop koeficijent
    fd->droop_kp = P_nominal / (fd->droop_percent * 0.01f * F_NOMINAL);

    fd->freq_ok = true;
    fd->v2g_enabled = false;
}

float FreqDroop_Calculate(FreqDroop_State* fd, float f_measured) {
    // 1. Provera frekvencijske zaštite
    if (f_measured < F_MIN_OPERATE || f_measured > F_MAX_OPERATE) {
        fd->freq_ok = false;
        fd->P_target = 0.0f;  // Isključenje
        return 0.0f;
    }
    fd->freq_ok = true;

    // 2. V2G dozvola na osnovu frekvencije
    fd->v2g_enabled = (f_measured < F_V2G_ENABLE);

    // 3. Izračunaj odstupanje frekvencije
    float delta_f = f_measured - F_NOMINAL;

    // 4. Primeni mrtvu zonu
    float delta_f_effective = 0.0f;
    if (delta_f < -fd->deadband) {
        delta_f_effective = delta_f + fd->deadband;  // Pod-frekvencija
    } else if (delta_f > fd->deadband) {
        delta_f_effective = delta_f - fd->deadband;  // Nad-frekvencija
    }

    // 5. Izračunaj droop podešavanje
    float P_droop = fd->droop_kp * delta_f_effective;

    // 6. Primeni na planiranu snagu
    fd->P_target = fd->P_scheduled + P_droop;

    // 7. Primeni ograničenja snage
    float P_max_charge = fd->P_nominal;
    float P_max_v2g = fd->v2g_enabled ? -fd->P_nominal : 0.0f;

    fd->P_target = fmaxf(P_max_v2g, fminf(P_max_charge, fd->P_target));

    return fd->P_target;
}

void FreqDroop_ApplyRamp(FreqDroop_State* fd, float Ts) {
    // Primeni ograničenje brzine promene (zahtev mrežnih pravila)
    float max_delta = fd->ramp_rate * fd->P_nominal * Ts;
    float delta = fd->P_target - fd->P_actual;

    if (fabsf(delta) > max_delta) {
        delta = (delta > 0.0f) ? max_delta : -max_delta;
    }

    fd->P_actual += delta;
}
```

---

## 3. Regulacija Napona - Q(V) Droop Kontrola

### 3.1 Koncept

Reaktivna snaga (Q) može se koristiti za regulaciju lokalnog napona:
- Nizak napon → Ubaci reaktivnu snagu (kapacitivno) → Podigni napon
- Visok napon → Apsorbuj reaktivnu snagu (induktivno) → Spusti napon

**Ključna prednost:** Bez habanja baterije! Reaktivna snaga se razmenjuje sa mrežom, ne troši se.

### 3.2 Q(V) Karakteristika

```
Q/Sn (%)
   ▲
 +44│                      ┌──── Qmax (kapacitivno)
    │                     /       Ubaci Q za podizanje V
 +30│                    /
    │                   /
 +15│                  /
    │                 /
   0├────────────────/─────────────────────────────► V (pu)
    │               /|         |         |
-15 │              / |   0.95  |  1.05   |  1.10
    │             /  |◄────────┴─────────►|
-30 │            /   |    Mrtva zona      |
    │           /    |                    |
-44 │──────────┘     |                    └──── Qmax (induktivno)
    0.90                                        Apsorbuj Q za spuštanje V
```

### 3.3 Matematička Formulacija

**Q(V) droop:**
```
Ako V_pu < V_low (podnapon):
    Q = Kq × (V_low - V_pu)     // Pozitivno Q (kapacitivno)

Ako V_pu > V_high (nadnapon):
    Q = Kq × (V_high - V_pu)    // Negativno Q (induktivno)

Ako V_low ≤ V_pu ≤ V_high:
    Q = 0                        // Mrtva zona
```

**Proračun maksimalne Q:**
```
Ograničenje prividne snage: S² = P² + Q²
Maksimalna Q pri datom P:   Qmax = √(Sn² - P²)

Za ograničenje faktora snage (npr. cos φ ≥ 0.9):
    tan φ = Q/P
    Qmax = P × tan(acos(0.9)) = P × 0.484
```

### 3.4 Implementacija

```c
#define V_DEADBAND_LOW   0.95f   // pu
#define V_DEADBAND_HIGH  1.05f   // pu
#define V_MIN_OPERATE    0.85f   // pu (isključi ispod)
#define V_MAX_OPERATE    1.10f   // pu (isključi iznad)
#define COS_PHI_MIN      0.90f   // Minimalni faktor snage

typedef struct {
    // Ulazi
    float Sn;               // Nominalna prividna snaga [VA]
    float P_actual;         // Trenutna aktivna snaga [W]

    // Stanje
    float Q_ref;            // Referentna reaktivna snaga [VAR]
    float Q_actual;         // Stvarna reaktivna snaga [VAR]
    float Q_max;            // Maksimalna dostupna Q [VAR]

    // Status
    bool voltage_ok;
} VoltDroop_State;

void VoltDroop_Init(VoltDroop_State* vd, float Sn) {
    vd->Sn = Sn;
    vd->P_actual = 0.0f;
    vd->Q_ref = 0.0f;
    vd->Q_actual = 0.0f;
    vd->Q_max = Sn;  // Početno
    vd->voltage_ok = true;
}

float VoltDroop_Calculate(VoltDroop_State* vd, float V_pu, float P_actual) {
    vd->P_actual = P_actual;

    // 1. Naponska zaštita
    if (V_pu < V_MIN_OPERATE || V_pu > V_MAX_OPERATE) {
        vd->voltage_ok = false;
        vd->Q_ref = 0.0f;
        return 0.0f;
    }
    vd->voltage_ok = true;

    // 2. Izračunaj dostupnu Q (od preostalog kapaciteta prividne snage)
    float P_sq = P_actual * P_actual;
    float S_sq = vd->Sn * vd->Sn;
    if (P_sq >= S_sq) {
        vd->Q_max = 0.0f;  // Nema kapaciteta za Q
    } else {
        vd->Q_max = sqrtf(S_sq - P_sq);
    }

    // 3. Izračunaj droop koeficijent
    float Kq = vd->Q_max / (V_DEADBAND_LOW - 0.90f);

    // 4. Primeni Q(V) droop
    if (V_pu < V_DEADBAND_LOW) {
        // Podnapon: ubaci Q (kapacitivno, pozitivno)
        vd->Q_ref = Kq * (V_DEADBAND_LOW - V_pu);
    } else if (V_pu > V_DEADBAND_HIGH) {
        // Nadnapon: apsorbuj Q (induktivno, negativno)
        vd->Q_ref = Kq * (V_DEADBAND_HIGH - V_pu);
    } else {
        // Mrtva zona
        vd->Q_ref = 0.0f;
    }

    // 5. Ograniči na dostupnu Q
    vd->Q_ref = fmaxf(-vd->Q_max, fminf(vd->Q_max, vd->Q_ref));

    // 6. Dodatno: Proveri ograničenje faktora snage
    if (fabsf(P_actual) > 0.0f) {
        float tan_phi_max = tanf(acosf(COS_PHI_MIN));
        float Q_pf_limit = fabsf(P_actual) * tan_phi_max;
        vd->Q_ref = fmaxf(-Q_pf_limit, fminf(Q_pf_limit, vd->Q_ref));
    }

    return vd->Q_ref;
}
```

---

## 4. Strujni Regulator (dq Okvir)

### 4.1 Pregled

Strujni regulator reguliše izlazne struje invertera da prate reference snage:
- id kontroliše aktivnu snagu P
- iq kontroliše reaktivnu snagu Q

```
Odnosi snaga:
    P = 1.5 × Vd × id    (pretpostavljajući Vq ≈ 0 iz PLL)
    Q = 1.5 × Vd × iq

Reference struja:
    id_ref = P_ref / (1.5 × Vd)
    iq_ref = Q_ref / (1.5 × Vd)
```

### 4.2 Struktura Kontrole

```
                    ┌────────────────────────────────────────────────┐
                    │            STRUJNI REGULATOR                    │
                    │                                                 │
P_ref ──► [/1.5Vd] ──► id_ref ──► [PI] ──► Vd_ff ──► [+] ──► Vd_ref ──►┐
                        │   ▲            │               ▲            │
                        │   │            │               │            │
                    id_meas │       ┌────┘          Vd_mreža         │
                            │       │                                 │
                            │       ▼                                 │
                            │  ωLq×iq ──► [Rasprezanje]               │
                            │                                         │
Q_ref ──► [/1.5Vd] ──► iq_ref ──► [PI] ──► Vq_ff ──► [+] ──► Vq_ref ──►┤
                        │   ▲            │               ▲            │
                        │   │            │               │            │
                    iq_meas │       ┌────┘               │            │
                            │       │                Vq_mreža ≈ 0     │
                            │       ▼                                 │
                            │  ωLd×id ──► [Rasprezanje]               │
                            │                                         │
                            └─────────────────────────────────────────┘
                                                    │
                                                    ▼
                                            [Inv Park] ──► Vα, Vβ ──► PWM
```

### 4.3 Raspregnut PI Regulator

Unakrsno sprezanje između d i q osa stvara poremećaj. Članovi za rasprezanje kompenzuju:

```
Vd* = Vd_PI - ωLq × iq + Vd_mreža
Vq* = Vq_PI + ωLd × id + Vq_mreža

Gde je:
    Vd_PI, Vq_PI = Izlaz PI regulatora
    ω = Ugaona frekvencija mreže (iz PLL)
    Ld, Lq = Induktivnost filtera (d i q, obično jednaki)
    Vd_mreža, Vq_mreža = Unapredni signal napona mreže
```

### 4.4 Podešavanje PI

Za propusni opseg strujne kontrolne petlje od ~1 kHz:
```
Postrojenje: L × di/dt = V - R×i - e

Prenosna funkcija zatvorene petlje:
H(s) = (Kp×s + Ki) / (L×s² + (R + Kp)×s + Ki)

Za željeni propusni opseg ωc i prigušenje ζ:
    Kp = 2 × ζ × ωc × L - R
    Ki = ωc² × L

Primer (L = 0.5 mH, R = 0.1 Ω, ωc = 2π×1000, ζ = 0.707):
    Kp = 2 × 0.707 × 6283 × 0.0005 - 0.1 = 4.34 Ω
    Ki = 6283² × 0.0005 = 19737 Ω/s
```

### 4.5 Implementacija

```c
typedef struct {
    // PI parametri
    float Kp;               // Proporcionalno pojačanje
    float Ki;               // Integralno pojačanje

    // Stanje
    float id_int;           // d-osa integrator
    float iq_int;           // q-osa integrator

    // Parametri filtera
    float L;                // Induktivnost [H]
    float R;                // Otpornost [Ω]

    // Anti-windup ograničenje
    float V_limit;
} CurrentController_State;

void CurrentController_Init(CurrentController_State* cc, float L, float R, float V_dc) {
    // Dizajn za 1 kHz propusni opseg
    float omega_c = 2.0f * PI * 1000.0f;
    float zeta = 0.707f;

    cc->Kp = 2.0f * zeta * omega_c * L - R;
    cc->Ki = omega_c * omega_c * L;

    cc->L = L;
    cc->R = R;
    cc->V_limit = V_dc * 0.9f;  // 90% DC sabirnice

    cc->id_int = 0.0f;
    cc->iq_int = 0.0f;
}

void CurrentController_Update(CurrentController_State* cc,
                              float id_ref, float iq_ref,
                              float id_meas, float iq_meas,
                              float Vd_grid, float Vq_grid,
                              float omega,
                              float* Vd_out, float* Vq_out,
                              float Ts) {
    // 1. Izračunaj greške
    float id_err = id_ref - id_meas;
    float iq_err = iq_ref - iq_meas;

    // 2. PI regulatori sa anti-windup
    cc->id_int += cc->Ki * id_err * Ts;
    cc->iq_int += cc->Ki * iq_err * Ts;

    // Ograniči integrale
    cc->id_int = fmaxf(-cc->V_limit, fminf(cc->V_limit, cc->id_int));
    cc->iq_int = fmaxf(-cc->V_limit, fminf(cc->V_limit, cc->iq_int));

    float Vd_pi = cc->Kp * id_err + cc->id_int;
    float Vq_pi = cc->Kp * iq_err + cc->iq_int;

    // 3. Članovi za rasprezanje
    float Vd_dec = -omega * cc->L * iq_meas;
    float Vq_dec = +omega * cc->L * id_meas;

    // 4. Unapredni signal napona mreže
    *Vd_out = Vd_pi + Vd_dec + Vd_grid;
    *Vq_out = Vq_pi + Vq_dec + Vq_grid;

    // 5. Ograničenje izlaznog napona (kružno ograničenje)
    float V_mag = sqrtf((*Vd_out)*(*Vd_out) + (*Vq_out)*(*Vq_out));
    if (V_mag > cc->V_limit) {
        float scale = cc->V_limit / V_mag;
        *Vd_out *= scale;
        *Vq_out *= scale;
    }
}
```

---

## 5. Kompletna V2G Kontrolna Arhitektura

### 5.1 Pregled Sistema

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          V2G KONTROLNI SISTEM                                     │
│                                                                                   │
│  ┌──────────────┐                                                                │
│  │ ISO 15118-20 │──► P_planirana                                                 │
│  │ ili Upravlja-│──► V2G_omogućen                                                │
│  │ nje flotom   │                                                                │
│  └──────────────┘                                                                │
│         │                                                                         │
│         ▼                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   SENZORI    │    │     PLL      │    │    DROOP     │    │   STRUJNI    │   │
│  │    MREŽE     │───►│   SRF-PLL    │───►│  P(f), Q(V)  │───►│  REGULATOR   │   │
│  │  Va,Vb,Vc    │    │  θ, ω, Vd    │    │  P_ref,Q_ref │    │   id, iq     │   │
│  │  Ia,Ib,Ic    │    │              │    │              │    │              │   │
│  └──────────────┘    └──────────────┘    └──────────────┘    └──────┬───────┘   │
│                                                                      │            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────▼───────┐   │
│  │   TERMALNA   │    │  OGRANIČAVA  │    │    MAŠINA    │    │     PWM      │   │
│  │   ZAŠTITA    │───►│    SNAGE     │◄──►│    STANJA    │    │  GENERATOR   │   │
│  │   Tj, Ta     │    │  Derating    │    │  Predpunjenje│    │    SVPWM     │   │
│  └──────────────┘    └──────────────┘    └──────────────┘    └──────┬───────┘   │
│                                                                      │            │
│                                                               ┌──────▼───────┐   │
│                                                               │   3-LEVEL    │   │
│                                                               │     NPC      │   │
│                                                               │   INVERTER   │   │
│                                                               └──────────────┘   │
│                                                                                   │
│  Vremenski parametri kontrolnih petlji:                                          │
│  ├── Strujna petlja:    10-20 kHz (50-100 μs perioda)                           │
│  ├── PLL petlja:        2-10 kHz (100-500 μs perioda)                           │
│  ├── Droop petlja:      1 kHz (1 ms perioda)                                    │
│  ├── Termalna petlja:   10 Hz (100 ms perioda)                                  │
│  └── ISO 15118 petlja:  ~1 Hz (1 s perioda)                                     │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Reference

- **IEC 61850** - Komunikacione mreže i sistemi za automatizaciju elektrana
- **IEEE 1547-2018** - Standard za interkonekciju i interoperabilnost DER
- **VDE AR-N 4110** - Tehnički zahtevi za priključenje na SN mrežu
- **EN 50549-1** - Zahtevi za priključenje proizvodnih postrojenja na distributivne mreže
- **IEC 62116** - Fotonaponski inverteri povezani na mrežu (anti-ostrvljenje)
- **ISO 15118-20** - V2G komunikacioni interfejs (BPT režim)
