# Simbolička AI arhitektura za EK3

## Filozofija: Simbolička AI vs Machine Learning

### Zašto simbolička AI za safety-critical sisteme

```
MACHINE LEARNING                    SIMBOLIČKA AI
────────────────────────────────────────────────────────────────
Crna kutija                    →    Transparentna pravila
Potrebni podaci o kvarovima    →    Kodifikacija ekspertskog znanja
Teška certifikacija            →    Determinističko ponašanje
50-100KB TensorFlow Lite       →    10-20KB rule engine
Kvantizacija za edge           →    Nativna C implementacija
Model introspection tools      →    Standardno debagovanje
Zahteva GPU za trening         →    Radi na MCU od prvog dana
```

### Prednosti za EK3 sistem

| Aspekt | ML pristup | Simbolička AI |
|--------|------------|---------------|
| **Objašnjivost** | SHAP vrednosti, nejasno | Potpun lanac zaključivanja |
| **Certifikacija** | Teško za IEC 61508 | Deterministički, auditabilan |
| **Resursi** | TensorFlow Lite: 50-100KB | Rule engine: 10-20KB |
| **Trening** | Potrebni primeri kvarova | Ekspertsko znanje |
| **Edge deploy** | Kompleksna kvantizacija | Direktna C implementacija |
| **Debugging** | Specijalni alati | Standardni debugger |

### AI kao savetnik, ne aktor

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   SIMBOLIČKA AI (savetodavna)                              │
│   • Predlaže optimalna podešavanja                         │
│   • Predviđa probleme                                      │
│   • Preporučuje akcije                                     │
│   • Dijagnostikuje kvarove                                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   DETERMINISTIČKI SAFETY SLOJ                              │
│   • Hardverski kodirani limiti (certifikovani)             │
│   • Hardverske blokade                                     │
│   • Watchdog tajmeri                                       │
│   • Fail-safe podrazumevane vrednosti                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘

AI NE MOŽE:
✗ Pregaziti safety limite
✗ Onemogućiti zaštitne krugove
✗ Raditi van certifikovane omotnice
✗ Direktno kontrolisati gate drivere

AI MOŽE:
✓ Zahtevati smanjenje snage (kernel validira)
✓ Logovati upozorenja i predikcije
✓ Slati CAN upozorenja stanici
✓ Ažurirati interno stanje zdravlja
```

### Certifikacijski zahtevi

- **IEC 61508** - Funkcionalna bezbednost za industrijske sisteme
- **IEC 62443** - Cybersecurity za industrijske kontrolne sisteme
- **EN ISO 13849-1** - Performance Levels za kontrolne sisteme
- **Eksplicitan audit trail** za sve AI odluke

---

## 2. Reprezentacija znanja

### 2.1 EK3 domenska ontologija

```
EK3-ONTOLOGIJA
├── FizičkeKomponente
│   ├── PowerStage
│   │   ├── SiC-MOSFET (Wolfspeed C3M0065090D, 900V, 65mΩ)
│   │   ├── Gate-Driver (Si823H, izolovani)
│   │   ├── LLC-Transformator (planarni, PCB integrisani)
│   │   └── Rezonantni-Kondenzator (film, 200kHz)
│   │
│   ├── TermičkiSistem
│   │   ├── Hladnjak (aluminijum, sa rebrima)
│   │   ├── TIM (termalna pasta, Phase-Change)
│   │   └── Ventilator (opcioni, PWM kontrola)
│   │
│   └── KontrolniSistem
│       ├── MCU (STM32G474, Cortex-M4, 170MHz)
│       ├── CAN-Transceiver (TJA1443)
│       └── Senzor-Struje (TLI4971, ±0.7%)
│
├── ModoviKvara
│   ├── MOSFET-Degradacija → uzrokuje → Rds(on)-Porast
│   ├── Kondenzator-Starenje → uzrokuje → ESR-Porast
│   ├── TIM-Degradacija → uzrokuje → Rth-Porast
│   ├── Zamor-Lema → uzrokuje → Intermitentni-Kontakt
│   └── Elektromigracija → uzrokuje → Gate-Driver-Kvar
│
├── Simptomi (Merljivi)
│   ├── Pad-Efikasnosti → ukazujeNa → [MOSFET-Deg, Kond-Starenje]
│   ├── Porast-Temperature → ukazujeNa → [TIM-Deg, Blokiran-Protok]
│   ├── Porast-Ripple → ukazujeNa → [Kond-Starenje]
│   └── Porast-Vds(on) → ukazujeNa → [MOSFET-Deg]
│
└── OperativnaStanja
    ├── ZDRAVO → η > 94%, ESR < 1.2×, Tj < 125°C
    ├── DEGRADIRANO → η 90-94% ILI ESR 1.2-1.5× ILI Tj 125-140°C
    ├── UPOZORENJE → ESR 1.5-2.0× ILI Tj 140-150°C
    └── KRITIČNO → ESR > 2.0× ILI Tj > 150°C
```

**Implementacija u C:**

```c
typedef enum {
    COMPONENT_MOSFET,
    COMPONENT_CAPACITOR,
    COMPONENT_TIM,
    COMPONENT_GATE_DRIVER,
    COMPONENT_MCU
} ComponentType;

typedef enum {
    FAILURE_RDSON_INCREASE,
    FAILURE_ESR_INCREASE,
    FAILURE_RTH_INCREASE,
    FAILURE_INTERMITTENT,
    FAILURE_GATE_OXIDE
} FailureMode;

typedef enum {
    SYMPTOM_EFFICIENCY_DROP,
    SYMPTOM_TEMP_RISE,
    SYMPTOM_RIPPLE_INCREASE,
    SYMPTOM_VDSON_INCREASE
} Symptom;

typedef struct {
    ComponentType type;
    uint8_t id;
    HealthState health;
    FailureMode possible_failures[4];
    Symptom associated_symptoms[4];
} Component;

// Memorija: ~100 bajta po tipu komponente
// Ukupno: ~2KB za celu ontologiju
```

### 2.2 Fuzzy skupovi

#### Temperatura (Tj)

```
FUZZY SKUPOVI ZA TEMPERATURU:
┌─────────────────────────────────────────────────────────────────┐
│ Članstvo                                                         │
│   1.0 ─┐    ┌─────┐    ┌─────┐    ┌─────┐    ┌───────           │
│        │   /│     │\  /│     │\  /│     │\  /│                   │
│   0.5 ─│  / │     │ \/ │     │ \/ │     │ \/ │                   │
│        │ /  │     │  /\│     │  /\│     │ /  │                   │
│   0.0 ─┴────┴─────┴────┴─────┴────┴─────┴────┴──────→ Tj (°C)   │
│       HLADNO NOMINALNO TOPLO  VRUĆE KRITIČNO                     │
│         <80   80-110  100-130 120-150  >140                      │
└─────────────────────────────────────────────────────────────────┘

PARAMETRI:
  HLADNO:    μ=1.0 za Tj<70°C,  μ=0.0 za Tj>90°C
  NOMINALNO: μ=1.0 za 85-105°C, trapezoid
  TOPLO:     μ=1.0 za 115-125°C, trapezoid
  VRUĆE:     μ=1.0 za 135-145°C, trapezoid
  KRITIČNO:  μ=0.0 za Tj<130°C, μ=1.0 za Tj>150°C
```

#### ESR degradacija

```
FUZZY SKUPOVI ZA ESR (racio prema baseline):
┌─────────────────────────────────────────────────────────────────┐
│ Članstvo                                                         │
│   1.0 ─┐────────┐    ┌────────┐    ┌────────┐    ┌─────────     │
│        │        │\  /│        │\  /│        │\  /│               │
│   0.5 ─│        │ \/ │        │ \/ │        │ \/ │               │
│        │        │ /\ │        │ /\ │        │ /  │               │
│   0.0 ─┴────────┴────┴────────┴────┴────────┴────┴──→ ESR/ESR₀  │
│        ZDRAVO  DEGRADIRANO   PROPADA    KVAR                     │
│         <1.2    1.1-1.5      1.4-1.9    >1.8                     │
└─────────────────────────────────────────────────────────────────┘
```

#### Efikasnost

```
FUZZY SKUPOVI ZA EFIKASNOST:
  ODLIČNA:   η > 95% (μ=1.0 za η>96%)
  DOBRA:     η 93-96% (trapezoid)
  MARGINALNA: η 90-94% (trapezoid)
  LOŠA:      η < 92% (μ=1.0 za η<88%)
```

**Implementacija:**

```c
typedef struct {
    float a, b, c, d;  // Trapezoidni parametri
} FuzzySet;

float fuzzy_membership(float value, FuzzySet *set) {
    if (value <= set->a || value >= set->d) return 0.0f;
    if (value >= set->b && value <= set->c) return 1.0f;
    if (value < set->b) return (value - set->a) / (set->b - set->a);
    return (set->d - value) / (set->d - set->c);
}

// Temperatura fuzzy skupovi
FuzzySet temp_cold     = {0, 0, 70, 90};
FuzzySet temp_nominal  = {75, 85, 105, 115};
FuzzySet temp_warm     = {105, 115, 125, 135};
FuzzySet temp_hot      = {125, 135, 145, 155};
FuzzySet temp_critical = {140, 150, 200, 200};

// Memorija: ~50 bajta po fuzzy skupu
// Ukupno: ~500 bajta za sve skupove
```

### 2.3 Bayesian mreža za dijagnozu kvarova

```
STRUKTURA BAYESIAN MREŽE:
═══════════════════════════════════════════════════════════════

                    ┌─────────────────┐
                    │  Radni sati     │ (Prior: uniforman)
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
     ┌────────────────┐ ┌─────────────┐ ┌─────────────────┐
     │ MOSFET Habanje │ │ Kond Staren │ │ TIM Degradacija │
     │ P(hab|sati)    │ │ Arrhenius   │ │ Termalni ciklusi│
     └───────┬────────┘ └──────┬──────┘ └────────┬────────┘
             │                 │                  │
             ▼                 ▼                  ▼
     ┌──────────────┐  ┌─────────────┐   ┌────────────────┐
     │ Rds(on) Rast │  │ ESR Rast    │   │ Rth Rast       │
     └───────┬──────┘  └──────┬──────┘   └───────┬────────┘
             │                │                   │
             └────────────────┼───────────────────┘
                              ▼
                    ┌─────────────────┐
                    │  Pad efikasn.   │ (Merljivo)
                    └─────────────────┘
```

**Conditional Probability Tables (CPT):**

```c
// P(ESR_visok | Kondenzator_star)
const float CPT_ESR_GIVEN_CAP_AGE[2][2] = {
    //           ESR_nizak  ESR_visok
    /* mlad */  {0.98,      0.02},
    /* star */  {0.15,      0.85}
};

// P(Efikasnost_niska | Rds_visok, ESR_visok, Rth_visok)
const float CPT_EFF_GIVEN_SYMPTOMS[8] = {
    // Rds ESR Rth -> P(efikasnost_niska)
    // 0   0   0   -> 0.02  (sve zdravo)
    // 0   0   1   -> 0.25  (samo Rth)
    // 0   1   0   -> 0.30  (samo ESR)
    // 0   1   1   -> 0.55
    // 1   0   0   -> 0.35  (samo Rds)
    // 1   0   1   -> 0.60
    // 1   1   0   -> 0.65
    // 1   1   1   -> 0.95  (sve degradirano)
    0.02, 0.25, 0.30, 0.55, 0.35, 0.60, 0.65, 0.95
};

// Memorija: ~2KB za sve CPT tabele
// Inferencija: Variable Elimination (jednostavno za male mreže)
```

---

## 3. Inference Engine arhitektura

### 3.1 Slojevita arhitektura

```
INFERENCE PIPELINE (10 Hz ciklus na modulu)
═══════════════════════════════════════════════════════════════

SLOJ 0: Hardverska zaštita (uvek aktivna, <1µs)
├── OCP komparator → gate driver disable
├── OVP komparator → gate driver disable
└── OTP komparator → termalno gašenje

SLOJ 1: Rule Engine (1ms budžet)
├── Provera pragova (hard limiti)
├── Provera brzine promene (dI/dt, dT/dt)
└── Kombinovana pravila (IF temp_visoka AND struja_niska THEN loš_termalni_put)

SLOJ 2: Fuzzy inferencija (2ms budžet)
├── Fazifikacija (senzor → stepeni članstva)
├── Evaluacija pravila (fuzzy AND/OR)
├── Agregacija
└── Defazifikacija → health_score_fuzzy

SLOJ 3: Bayesian ažuriranje (5ms budžet, 1Hz)
├── Prior verovatnoće iz modela starenja
├── Likelihood iz trenutnih observacija
├── Posterior ažuriranje (jednostavno množenje)
└── Najvjerovatnija hipoteza kvara

SLOJ 4: Trending & RUL (pozadina, 0.1Hz)
├── Linearna regresija na ESR, Rds(on), efikasnost
├── Arrhenius projekcija života
└── RUL procena sa intervalom pouzdanosti
```

### 3.2 Resource budget na STM32G474

| Komponenta | Flash | RAM | Vreme ciklusa |
|------------|-------|-----|---------------|
| Rule Engine | 4KB | 1KB | 1ms |
| Fuzzy Engine | 2KB | 512B | 2ms |
| Bayesian Net | 3KB | 1KB | 5ms (1Hz) |
| Trending/RUL | 2KB | 2KB | 100ms (0.1Hz) |
| Case Library | 4KB | 1KB | pozadina |
| Digital Twin State | 1KB | 256B | 100ms |
| **UKUPNO** | **16KB** | **6KB** | - |
| **Dostupno** | **512KB** | **128KB** | - |
| **Margina** | **96%** | **95%** | - |

### 3.3 Decision Fusion logika

```c
typedef struct {
    HealthStatus rule_result;      // SLOJ 1
    float fuzzy_health_score;      // SLOJ 2 (0.0-1.0)
    FaultHypothesis bayes_fault;   // SLOJ 3
    float bayes_confidence;        // SLOJ 3
    uint32_t rul_hours;            // SLOJ 4
    float rul_confidence;          // SLOJ 4
} InferenceResults;

HealthStatus fuse_decisions(InferenceResults *r) {
    // Rule-based ima prioritet za bezbednost
    if (r->rule_result == STATUS_CRITICAL ||
        r->rule_result == STATUS_SHUTDOWN) {
        return r->rule_result;
    }

    // Fuzzy pruža nijanse za degradaciona stanja
    if (r->fuzzy_health_score < 0.3f) {
        return STATUS_ZAMENI_SLEDECI_BUS;
    } else if (r->fuzzy_health_score < 0.5f) {
        return STATUS_ZAKAŽI_ZAMENU;
    }

    // Bayesian precizira dijagnozu
    if (r->bayes_confidence > 0.8f && r->bayes_fault != FAULT_NONE) {
        log_fault_hypothesis(r->bayes_fault);
    }

    // RUL utiče na planiranje
    if (r->rul_hours < 500 && r->rul_confidence > 0.7f) {
        return STATUS_ZAKAŽI_ZAMENU;
    }

    return STATUS_OK;
}
```

---

## 4. Health Assessment sistem

### 4.1 Pravila za multi-sensor fuziju

Zamena autoencoder-a sa eksplicitnim multi-sensor pravilima:

```
SKUP SLOŽENIH PRAVILA:
═══════════════════════════════════════════════════════════════

PRAVILO: Degradacija termalne paste
AKO (Tj - T_hladnjak) > 40°C
   I (T_hladnjak - T_ambient) < 20°C
   I snaga > 2000W
ONDA TIM_degradacija = VISOKA_POUZDANOST
     → ZAKAŽI_ZAMENU("Termalna pasta degradirala")

PRAVILO: Kraj života kondenzatora
AKO ESR > 1.5 × ESR_baseline
   I ripple_napon > 1.3 × ripple_baseline
   I temp_kondenzatora > 75°C
ONDA kondenzator_EOL = VISOKA_POUZDANOST
     → ZAMENI_SLEDECI_BUS("Kondenzator pri kraju života")

PRAVILO: Degradacija MOSFET-a
AKO Rds_on_procenjeno > 1.2 × Rds_on_baseline
   I efikasnost < 94%
   I switching_loss_proxy > 1.3 × baseline
ONDA mosfet_degradacija = SREDNJA_POUZDANOST
     → ISTRAŽI("Sumnja na degradaciju MOSFET-a")

PRAVILO: Kontekstualna anomalija (Vruće pri malom opterećenju)
AKO Tj > 100°C
   I snaga < 1000W  // Samo 30% opterećenja
   I ventilator_radi = TRUE
ONDA kontekstualna_anomalija = TRUE
     → ALARM("Abnormalno grejanje pri malom opterećenju")

PRAVILO: Brza promena temperature
AKO dTj/dt > 5°C/sekund
   I snaga_stabilna = TRUE
ONDA termalni_runaway_rizik = TRUE
     → SMANJI_SNAGU_50%("Brza promena temperature")
```

### 4.2 Statistička detekcija anomalija

Zamena autoencoder-a sa jednostavnim statističkim metodama:

```c
// Z-score detekcija anomalija
typedef struct {
    float mean;
    float std_dev;
    float min_seen;
    float max_seen;
    uint32_t sample_count;
} RunningStats;

// Welford's online algoritam za running stats
void update_stats(RunningStats *stats, float new_value) {
    stats->sample_count++;
    float delta = new_value - stats->mean;
    stats->mean += delta / stats->sample_count;
    float delta2 = new_value - stats->mean;
    stats->std_dev = sqrtf(
        (stats->std_dev * stats->std_dev * (stats->sample_count - 1) +
         delta * delta2) / stats->sample_count
    );

    if (new_value < stats->min_seen) stats->min_seen = new_value;
    if (new_value > stats->max_seen) stats->max_seen = new_value;
}

float calculate_z_score(float value, RunningStats *stats) {
    if (stats->std_dev < 0.001f) return 0.0f;
    return (value - stats->mean) / stats->std_dev;
}

bool is_statistical_anomaly(float value, RunningStats *stats, float threshold) {
    float z = calculate_z_score(value, stats);
    return fabsf(z) > threshold;  // Tipično threshold = 3.0
}
```

### 4.3 Mahalanobis distanca za multivarijatne anomalije

```c
// Pojednostavljena Mahalanobis distanca
// Pretpostavka: dijagonalna kovarijansna matrica (nezavisne varijable)
typedef struct {
    float temp_var;
    float current_var;
    float efficiency_var;
    float esr_var;
} DiagonalCovariance;

float mahalanobis_simplified(SensorData *current, SensorData *baseline,
                              DiagonalCovariance *cov) {
    float dist_sq = 0;

    dist_sq += powf((current->temp - baseline->temp), 2) / cov->temp_var;
    dist_sq += powf((current->current - baseline->current), 2) / cov->current_var;
    dist_sq += powf((current->efficiency - baseline->efficiency), 2) / cov->efficiency_var;
    dist_sq += powf((current->esr - baseline->esr), 2) / cov->esr_var;

    return sqrtf(dist_sq);
}

// Anomalija ako distanca > χ²(4, 0.99) ≈ 13.3
bool is_multivariate_anomaly(float mahal_dist) {
    return mahal_dist > 3.65f;  // sqrt(13.3)
}
```

---

## 5. Prediktivno održavanje

### 5.1 Fizički modeli

#### 5.1.1 Arrhenius jednačina za kondenzatore

```c
// Predviđanje života kondenzatora korišćenjem Arrhenius modela
// Život se udvostručuje za svakih 10°C smanjenja temperature

#define RATED_LIFE_HOURS   50000.0f  // Nominalni život film kond. na Tmax
#define RATED_TEMP_MAX     105.0f    // Maksimalna nominalna temperatura
#define ARRHENIUS_FACTOR   10.0f     // Interval udvostručenja

float calculate_capacitor_rul(float operating_temp_avg, float operating_hours) {
    // Faktor ubrzanja baziran na temperaturi
    float temp_margin = RATED_TEMP_MAX - operating_temp_avg;
    float acceleration_factor = powf(2.0f, temp_margin / ARRHENIUS_FACTOR);

    // Efektivni život na ovoj temperaturi
    float effective_life = RATED_LIFE_HOURS * acceleration_factor;

    // Preostali koristan život (RUL)
    float rul = effective_life - operating_hours;
    return (rul > 0) ? rul : 0;
}

/*
PRIMER:
- Kondenzator radi na 75°C prosečno
- Margina: 105 - 75 = 30°C
- Faktor: 2^(30/10) = 2³ = 8×
- Efektivni život: 50,000 × 8 = 400,000 sati
- Posle 10,000 sati: RUL = 390,000 sati
*/
```

#### 5.1.2 Coffin-Manson za MOSFET power cycling

```c
// Model habanja za SiC MOSFET usled power cycling-a
// Baziran na Coffin-Manson relaciji

typedef struct {
    uint32_t cycle_count;
    float delta_Tj_histogram[10];  // Kante: 10°C, 20°C, ... 100°C
    float cumulative_damage;
} PowerCyclingData;

// Ciklusi do kvara za dato ΔTj (empirijski fit za Wolfspeed SiC)
uint32_t cycles_to_failure(float delta_Tj) {
    // Empirijski fit: Nf = A × (ΔTj)^(-n)
    // Za Wolfspeed SiC: A ≈ 5×10¹², n ≈ 5
    if (delta_Tj < 10.0f) return UINT32_MAX;
    return (uint32_t)(5e12f / powf(delta_Tj, 5.0f));
}

// Miner-ovo pravilo za kumulativno oštećenje
float calculate_mosfet_damage(PowerCyclingData *data) {
    // D = Σ(nᵢ / Nfᵢ)
    float total_damage = 0;
    float delta_Tj_values[] = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};

    for (int i = 0; i < 10; i++) {
        uint32_t n_cycles = (uint32_t)data->delta_Tj_histogram[i];
        uint32_t Nf = cycles_to_failure(delta_Tj_values[i]);
        if (Nf > 0) {
            total_damage += (float)n_cycles / (float)Nf;
        }
    }

    return total_damage;  // D >= 1.0 znači kraj života
}

/*
PRIMER:
- 1000 ciklusa sa ΔTj = 50°C
- Nf(50°C) = 5×10¹² / 50⁵ = 5×10¹² / 3.125×10⁸ ≈ 16,000
- Oštećenje = 1000/16000 = 0.0625 (6.25% života potrošeno)
*/
```

#### 5.1.3 Praćenje termalne impedanse

```c
// Praćenje degradacije termalnog puta
typedef struct {
    float Rth_junction_case_initial;   // Fabričko merenje
    float Rth_case_heatsink_initial;
    float Rth_heatsink_ambient_initial;
} ThermalBaseline;

typedef struct {
    float Rth_total_current;
    float Rth_ratio;  // current / initial
    ThermalTrend trend;
} ThermalHealth;

// Procena Rth iz merenja
float estimate_Rth_total(float Tj, float T_ambient, float power_dissipated) {
    if (power_dissipated < 10.0f) return 0.0f;  // Nedovoljno snage
    return (Tj - T_ambient) / power_dissipated;
}

// Detekcija degradacije termalnog puta
ThermalHealth assess_thermal_path(float Rth_current, ThermalBaseline *baseline) {
    ThermalHealth health;
    float Rth_initial = baseline->Rth_junction_case_initial +
                        baseline->Rth_case_heatsink_initial +
                        baseline->Rth_heatsink_ambient_initial;

    health.Rth_total_current = Rth_current;
    health.Rth_ratio = Rth_current / Rth_initial;

    if (health.Rth_ratio < 1.1f) {
        health.trend = THERMAL_HEALTHY;
    } else if (health.Rth_ratio < 1.3f) {
        health.trend = THERMAL_DEGRADING;
    } else if (health.Rth_ratio < 1.5f) {
        health.trend = THERMAL_WARNING;
    } else {
        health.trend = THERMAL_CRITICAL;
    }

    return health;
}
```

### 5.2 Trending i ekstrapolacija

```c
// Linearna regresija za ekstrapolaciju trenda
typedef struct {
    float values[256];     // Kružni bafer (poslednjih 256 uzoraka @ 1/sat)
    uint8_t write_index;
    uint32_t total_samples;
} TrendBuffer;

typedef struct {
    float slope;           // jedinice po satu
    float intercept;
    float r_squared;       // Koeficijent korelacije
} LinearTrend;

LinearTrend calculate_trend(TrendBuffer *buf) {
    float sum_x = 0, sum_y = 0, sum_xy = 0, sum_x2 = 0, sum_y2 = 0;
    int n = (buf->total_samples < 256) ? buf->total_samples : 256;

    if (n < 10) {
        // Nedovoljno podataka
        return (LinearTrend){0, 0, 0};
    }

    for (int i = 0; i < n; i++) {
        float x = (float)i;
        float y = buf->values[(buf->write_index - n + i + 256) % 256];
        sum_x += x;
        sum_y += y;
        sum_xy += x * y;
        sum_x2 += x * x;
        sum_y2 += y * y;
    }

    LinearTrend trend;
    float denom = n * sum_x2 - sum_x * sum_x;

    if (fabsf(denom) < 0.001f) {
        trend.slope = 0;
        trend.intercept = sum_y / n;
        trend.r_squared = 0;
    } else {
        trend.slope = (n * sum_xy - sum_x * sum_y) / denom;
        trend.intercept = (sum_y - trend.slope * sum_x) / n;

        // R² izračunavanje
        float ss_tot = n * sum_y2 - sum_y * sum_y;
        float ss_res = ss_tot - trend.slope * trend.slope * denom;
        trend.r_squared = (ss_tot > 0) ? (1.0f - ss_res / ss_tot) : 0;
    }

    return trend;
}

// RUL procena iz trenda
uint32_t estimate_rul_from_trend(LinearTrend *trend, float current_value,
                                   float failure_threshold) {
    if (trend->slope <= 0.001f) {
        return UINT32_MAX;  // Ne degradira
    }

    float hours_to_threshold = (failure_threshold - current_value) / trend->slope;
    return (hours_to_threshold > 0) ? (uint32_t)hours_to_threshold : 0;
}
```

### 5.3 Case-based reasoning (CBR)

```c
// Struktura slučaja za CBR
typedef struct {
    uint32_t case_id;
    uint16_t module_type;          // EK3 varijanta

    // Pattern simptoma u trenutku detekcije
    struct {
        float efficiency_deviation;   // % od baseline
        float esr_ratio;
        float thermal_resistance_ratio;
        float Tj_at_load;
        uint8_t symptom_flags;        // Bitmaska observiranih simptoma
    } symptoms;

    // Uzrok (označen od strane čoveka posle istrage)
    FaultType root_cause;
    uint8_t confidence;              // 1-100

    // Ishod
    MaintenanceAction action_taken;
    bool action_successful;

    // Kontekst
    uint32_t operating_hours_at_event;
    uint8_t ambient_temp_avg;

} Case;

// Matching sličnosti za nove probleme
float case_similarity(Case *stored, Case *current) {
    float sim = 0;
    float weights_sum = 0;

    // Efikasnost (težina 0.3)
    float eff_sim = 1.0f - fabsf(stored->symptoms.efficiency_deviation -
                                  current->symptoms.efficiency_deviation) / 10.0f;
    if (eff_sim < 0) eff_sim = 0;
    sim += 0.3f * eff_sim;
    weights_sum += 0.3f;

    // ESR ratio (težina 0.25)
    float esr_sim = 1.0f - fabsf(stored->symptoms.esr_ratio -
                                  current->symptoms.esr_ratio) / 0.5f;
    if (esr_sim < 0) esr_sim = 0;
    sim += 0.25f * esr_sim;
    weights_sum += 0.25f;

    // Termalna otpornost (težina 0.25)
    float rth_sim = 1.0f - fabsf(stored->symptoms.thermal_resistance_ratio -
                                  current->symptoms.thermal_resistance_ratio) / 0.3f;
    if (rth_sim < 0) rth_sim = 0;
    sim += 0.25f * rth_sim;
    weights_sum += 0.25f;

    // Symptom flags matching (težina 0.2)
    uint8_t matching_flags = ~(stored->symptoms.symptom_flags ^
                                current->symptoms.symptom_flags);
    int matching_count = __builtin_popcount(matching_flags);
    sim += 0.2f * (matching_count / 8.0f);
    weights_sum += 0.2f;

    return sim / weights_sum;
}

// Dohvati najsličnije slučajeve
void retrieve_similar_cases(Case *problem, Case *library, int lib_size,
                            Case **results, float *similarities, int k) {
    // Jednostavan k-nearest neighbors po sličnosti
    for (int i = 0; i < k; i++) {
        results[i] = NULL;
        similarities[i] = -1.0f;
    }

    for (int i = 0; i < lib_size; i++) {
        float sim = case_similarity(&library[i], problem);

        // Ubaci u sortirani niz ako je bolji od najgoreg
        for (int j = 0; j < k; j++) {
            if (sim > similarities[j]) {
                // Pomeri ostale
                for (int m = k - 1; m > j; m--) {
                    results[m] = results[m-1];
                    similarities[m] = similarities[m-1];
                }
                results[j] = &library[i];
                similarities[j] = sim;
                break;
            }
        }
    }
}
```

---

## 6. Pojednostavljen Digital Twin

### 6.1 Struktura sinhronizacije stanja

```c
// Digital Twin = strukturirani snapshot stanja modula
// NEMA "what-if" simulacija - koristi direktne fizičke proračune

typedef struct {
    // Identitet
    uint16_t module_id;
    uint32_t serial_number;

    // Real-time stanje (ažurirano @ 10Hz)
    struct {
        float power_out_w;
        float voltage_out_v;
        float current_out_a;
        float efficiency_percent;
    } power_state;

    // Termalno stanje (ažurirano @ 1Hz)
    struct {
        float Tj_estimated_c;
        float T_heatsink_c;
        float T_ambient_c;
        float Rth_junction_heatsink;  // Izvedeno
    } thermal_state;

    // Stanje zdravlja (ažurirano @ 0.1Hz)
    struct {
        float esr_ratio;              // Trenutni ESR / Baseline ESR
        float rds_on_ratio;           // Trenutni Rds / Baseline Rds
        float efficiency_trend;       // Nagib po 1000 sati
        uint32_t rul_hours;
        HealthStatus status;
    } health_state;

    // Kumulativni brojači (perzistentni)
    struct {
        uint32_t operating_hours;
        uint32_t power_cycles;
        uint32_t thermal_cycles;
        uint32_t fault_count;
    } lifecycle;

    // Baseline (fabričko kalibrisanje, read-only)
    struct {
        float esr_baseline;
        float rds_on_baseline;
        float efficiency_baseline;
    } calibration;

    uint32_t timestamp_ms;
    uint8_t sequence_number;

} DigitalTwinState;

// Veličina: ~200 bajta po modulu
// CAN-FD broadcast: Podeljeno na 4 poruke (64 bajta svaka)
```

### 6.2 Direktni proračuni umesto simulacije

```c
// UMESTO: dt.simulate_scenario({"power": 3000, "ambient": 50})
// KORISTI: Direktan proračun

float predict_Tj_steady_state(float power_w, float T_ambient_c,
                               float Rth_jc, float Rth_ca) {
    float efficiency = 0.96f;  // 96% tipična efikasnost
    float power_loss = power_w * (1.0f - efficiency);
    float Tj = T_ambient_c + power_loss * (Rth_jc + Rth_ca);
    return Tj;
}

// Primer: Predvidi da li može da drži 3kW na 45°C ambient
bool can_sustain_power(float power_w, float T_ambient_c,
                        DigitalTwinState *state) {
    float Rth_total = state->thermal_state.Rth_junction_heatsink +
                      0.5f;  // Procena Rth heatsink-to-ambient

    float predicted_Tj = predict_Tj_steady_state(power_w, T_ambient_c,
                                                   0.3f, Rth_total);

    // Maksimalna dozvoljena Tj je 150°C
    return predicted_Tj < 140.0f;  // 10°C margina
}
```

### 6.3 CAN-FD broadcast protokol

```
DIGITAL TWIN STATE BROADCAST (4 poruke, 1Hz)
═══════════════════════════════════════════════════════════════

Poruka 1 (ID: 0x10100 + module_id): Power State
├── Bytes 0-3: power_out_w (float)
├── Bytes 4-7: voltage_out_v (float)
├── Bytes 8-11: current_out_a (float)
├── Bytes 12-15: efficiency_percent (float)
└── Bytes 16-19: timestamp_ms (uint32)

Poruka 2 (ID: 0x10200 + module_id): Thermal State
├── Bytes 0-3: Tj_estimated_c (float)
├── Bytes 4-7: T_heatsink_c (float)
├── Bytes 8-11: T_ambient_c (float)
├── Bytes 12-15: Rth_junction_heatsink (float)
└── Bytes 16-19: fan_rpm (uint32)

Poruka 3 (ID: 0x10300 + module_id): Health State
├── Bytes 0-3: esr_ratio (float)
├── Bytes 4-7: rds_on_ratio (float)
├── Bytes 8-11: rul_hours (uint32)
├── Byte 12: health_status (uint8)
└── Byte 13: sequence_number (uint8)

Poruka 4 (ID: 0x10400 + module_id): Lifecycle
├── Bytes 0-3: operating_hours (uint32)
├── Bytes 4-7: power_cycles (uint32)
├── Bytes 8-11: thermal_cycles (uint32)
└── Bytes 12-15: fault_count (uint32)
```

---

## 7. Implementacija na ograničenom hardveru

### 7.1 STM32G474 alokacija resursa

```
FLASH LAYOUT (512KB ukupno)
═══════════════════════════════════════════════════════════════
┌────────────────────────────────────────────────────────────┐
│ 0x08000000  Bootloader (16KB)                              │
├────────────────────────────────────────────────────────────┤
│ 0x08004000  Kernel + Safety (64KB)                         │
│             • LLC kontrolna petlja                          │
│             • Hardverski driveri                           │
│             • Watchdog                                      │
├────────────────────────────────────────────────────────────┤
│ 0x08014000  Simbolička AI (32KB)                           │
│             • Rule Engine (4KB)                            │
│             • Fuzzy Engine (2KB)                           │
│             • Bayesian Net (3KB)                           │
│             • Trending (2KB)                               │
│             • Case Library (4KB)                           │
│             • Ontologija + CPT (3KB)                       │
│             • Digital Twin (1KB)                           │
│             • Rezerva (13KB)                               │
├────────────────────────────────────────────────────────────┤
│ 0x0801C000  Aplikacija (352KB)                             │
│             • CAN-FD stack                                 │
│             • Swarm koordinacija                           │
│             • Komunikacija                                  │
├────────────────────────────────────────────────────────────┤
│ 0x08070000  Persistent Storage (48KB)                      │
│             • Baseline kalibracije                          │
│             • Trend buferi                                  │
│             • Lokalna Case biblioteka                       │
│             • Audit log                                     │
└────────────────────────────────────────────────────────────┘

RAM LAYOUT (128KB ukupno)
═══════════════════════════════════════════════════════════════
┌────────────────────────────────────────────────────────────┐
│ 0x20000000  Kernel + ISR Stack (8KB)                       │
├────────────────────────────────────────────────────────────┤
│ 0x20002000  Simbolička AI (8KB)                            │
│             • Rule Engine runtime (1KB)                    │
│             • Fuzzy računanje (512B)                       │
│             • Bayesian runtime (1KB)                       │
│             • Trend buferi (2KB)                           │
│             • Case cache (1KB)                             │
│             • Inference results (512B)                     │
│             • Digital Twin state (256B)                    │
│             • Rezerva (1.7KB)                              │
├────────────────────────────────────────────────────────────┤
│ 0x20004000  Aplikacija (112KB)                             │
│             • FreeRTOS heap                                │
│             • CAN buferi                                   │
│             • Senzorski podaci                             │
└────────────────────────────────────────────────────────────┘
```

### 7.2 Real-time scheduling

```
FreeRTOS TASK PRIORITETI
═══════════════════════════════════════════════════════════════

Prioritet | Task              | Period  | WCET   | Svrha
----------|-------------------|---------|--------|------------------
  ISR     | OCP/OVP/OTP       | event   | <1µs   | Hardverska zaštita
  ISR     | HRTIM Update      | 2.5µs   | 0.5µs  | PWM kontrola
  ISR     | ADC DMA           | 100µs   | 10µs   | Senzorsko uzorkovanje
  P4      | PowerControl      | 1ms     | 400µs  | LLC regulacija
  P5      | SymbolicAI_Fast   | 10ms    | 3ms    | Rule + Fuzzy
  P6      | SymbolicAI_Slow   | 100ms   | 15ms   | Bayes + Trending
  P7      | SwarmCoordinator  | 100ms   | 20ms   | Leader election
  P8      | DigitalTwinSync   | 100ms   | 5ms    | State broadcast
  P9      | CaseLibrary       | 1s      | 50ms   | CBR maintenance
  P10     | AuditLogger       | pozad.  | N/A    | Persistent log
```

### 7.3 Fixed-point aritmetika (opciono)

```c
// Za dodatnu efikasnost, kritični proračuni mogu koristiti fixed-point
// Q16.16 format: 16 bita integer, 16 bita frakcija

typedef int32_t fixed16_t;

#define FIXED_ONE       (1 << 16)
#define FLOAT_TO_FIXED(f)  ((fixed16_t)((f) * FIXED_ONE))
#define FIXED_TO_FLOAT(x)  ((float)(x) / FIXED_ONE)

fixed16_t fixed_mul(fixed16_t a, fixed16_t b) {
    return (fixed16_t)(((int64_t)a * b) >> 16);
}

fixed16_t fixed_div(fixed16_t a, fixed16_t b) {
    return (fixed16_t)(((int64_t)a << 16) / b);
}

// Primer: Fuzzy membership u fixed-point
fixed16_t fuzzy_membership_fixed(fixed16_t value, fixed16_t a, fixed16_t b,
                                   fixed16_t c, fixed16_t d) {
    if (value <= a || value >= d) return 0;
    if (value >= b && value <= c) return FIXED_ONE;
    if (value < b) return fixed_div(value - a, b - a);
    return fixed_div(d - value, d - c);
}
```

---

## 8. Fleet Learning bez ML

### 8.1 Protokol deljenja znanja

```
MODUL → STANICA (pri detekciji kvara):
  CAN-FD: FAULT_REPORT(module_id, symptoms, hypothesis, confidence)

  Struktura FAULT_REPORT:
  ├── module_id: uint16
  ├── timestamp: uint32
  ├── symptoms: 16 bytes (struct)
  ├── hypothesis: uint8 (FaultType enum)
  ├── confidence: uint8 (0-100%)
  └── context: 8 bytes (operating_hours, ambient, load)

STANICA → CLOUD (periodično, MQTT):
  Topic: /fleet/{fleet_id}/cases/new
  Payload: {
    "case_id": "auto-generated",
    "module_serial": "EK3-2026-XXXXX",
    "symptoms": {...},
    "hypothesis": "CAPACITOR_EOL",
    "confidence": 85,
    "timestamp": "2026-01-04T12:00:00Z",
    "context": {...}
  }

CLOUD → STANICA (na ažuriranje):
  Topic: /fleet/{fleet_id}/knowledge/update
  Payload: {
    "new_rules": [
      {
        "id": 47,
        "condition": "ESR_ratio > 1.4 AND temp_trend > 0.5",
        "action": "SCHEDULE_REPLACEMENT",
        "confidence": 0.92
      }
    ],
    "updated_priors": {
      "MOSFET_wear_rate": 0.0015,
      "CAP_aging_factor": 1.08
    },
    "case_summaries": [...]
  }

STANICA → MODUL (OTA ažuriranje pravila):
  CAN-FD: KNOWLEDGE_UPDATE(rule_id, condition_bytecode, action, confidence)
```

### 8.2 Rule mining iz case paterna

```c
// Jednostavan algoritam za ekstrakciju pravila iz slučajeva
// Radi na Station Controller-u (Linux, više resursa)

typedef struct {
    uint8_t condition_flags;    // Koje simptome uključiti
    float thresholds[4];        // Pragovi za svaki simptom
    FaultType conclusion;
    float confidence;
    int support_count;          // Koliko slučajeva podržava
} MinedRule;

void mine_rules_from_cases(Case *library, int lib_size,
                            MinedRule *rules, int *rule_count) {
    // Grupiši slučajeve po root_cause
    for (FaultType ft = 0; ft < FAULT_TYPE_COUNT; ft++) {
        Case *matching[100];
        int match_count = 0;

        for (int i = 0; i < lib_size && match_count < 100; i++) {
            if (library[i].root_cause == ft && library[i].confidence > 70) {
                matching[match_count++] = &library[i];
            }
        }

        if (match_count < 5) continue;  // Nedovoljno primera

        // Pronađi zajedničke karakteristike
        float min_eff_dev = 100, max_eff_dev = -100;
        float min_esr = 10, max_esr = 0;

        for (int i = 0; i < match_count; i++) {
            if (matching[i]->symptoms.efficiency_deviation < min_eff_dev)
                min_eff_dev = matching[i]->symptoms.efficiency_deviation;
            if (matching[i]->symptoms.efficiency_deviation > max_eff_dev)
                max_eff_dev = matching[i]->symptoms.efficiency_deviation;
            // ... slično za ostale simptome
        }

        // Generiši pravilo ako je opseg dovoljno uzak
        if (max_eff_dev - min_eff_dev < 5.0f) {
            MinedRule *r = &rules[*rule_count];
            r->condition_flags = SYMPTOM_EFFICIENCY_DROP;
            r->thresholds[0] = (min_eff_dev + max_eff_dev) / 2;
            r->conclusion = ft;
            r->confidence = (float)match_count / lib_size;
            r->support_count = match_count;
            (*rule_count)++;
        }
    }
}
```

---

## 9. Bezbednost i certifikacija

### 9.1 Hijerarhija bezbednosti

```
NIVO 0: HARDVERSKA ZAŠTITA (nepromenljivo)
═══════════════════════════════════════════════════════════════
├── OCP: Hardverski komparator, <1µs odziv
├── OVP: Hardverski komparator, <1µs odziv
├── OTP: Hardverski komparator + termalni osigurač
└── NE MOŽE biti pregaženo NIKAKVIM softverom

NIVO 1: KERNEL FIRMWARE (20KB, potpisan)
═══════════════════════════════════════════════════════════════
├── LLC kontrolna petlja
├── CAN-FD driver
├── Sekvenca bezbednog gašenja
└── Watchdog refresh

NIVO 2: SIMBOLIČKA AI (savetodavna)
═══════════════════════════════════════════════════════════════
├── Rule Engine → predlaže smanjenje snage
├── Fuzzy Inference → predlaže stanje zdravlja
├── Bayesian Network → predlaže hipotezu kvara
└── RUL Procena → predlaže raspored održavanja
```

### 9.2 Audit trail format

```c
// Svaka odluka mora biti tračljiva
typedef struct {
    uint32_t timestamp;
    uint16_t module_id;
    HealthStatus decision;

    // Lanac dokaza
    struct {
        uint8_t rule_id;             // Koje pravilo je aktivirano
        float threshold;             // Koji prag je poređen
        float actual_value;          // Koja vrednost je izmerena
    } rule_evidence[4];

    float fuzzy_memberships[4];      // Kategorije zdravlja
    float bayesian_posteriors[4];    // Verovatnoće kvarova

    uint32_t rul_estimate;
    float rul_confidence;

    char human_readable[64];         // "ESR 1.8× baseline, RUL 500h"

} DecisionAuditRecord;

// Čuva se u flash kružnom baferu (16KB = ~250 zapisa)
// Može se ekstraktovati preko CAN dijagnostičkog protokola
```

### 9.3 Format objašnjenja odluke

```c
void format_decision_explanation(DecisionAuditRecord *record,
                                   char *output, int max_len) {
    snprintf(output, max_len,
        "Modul %d: %s\n"
        "Razlog: Pravilo #%d aktivirano (prag %.2f, mereno %.2f)\n"
        "Fuzzy score: %.2f (Zdravo:%.2f Degradirano:%.2f Kritično:%.2f)\n"
        "Bayes: Najvjerovatniji kvar %s (pouzdanost %.0f%%)\n"
        "RUL: %lu sati (pouzdanost %.0f%%)",
        record->module_id,
        health_status_str(record->decision),
        record->rule_evidence[0].rule_id,
        record->rule_evidence[0].threshold,
        record->rule_evidence[0].actual_value,
        record->fuzzy_memberships[0] * 0.3f +
            record->fuzzy_memberships[1] * 0.2f,  // weighted score
        record->fuzzy_memberships[0],
        record->fuzzy_memberships[1],
        record->fuzzy_memberships[2],
        fault_type_str(most_likely_fault(record->bayesian_posteriors)),
        record->bayesian_posteriors[0] * 100,
        record->rul_estimate,
        record->rul_confidence * 100
    );
}

/*
PRIMER IZLAZA:
═══════════════════════════════════════════════════════════════
Modul 42: ZAKAŽI_ZAMENU
Razlog: Pravilo #12 aktivirano (prag 1.50, mereno 1.78)
Fuzzy score: 0.35 (Zdravo:0.10 Degradirano:0.65 Kritično:0.15)
Bayes: Najvjerovatniji kvar CAPACITOR_EOL (pouzdanost 82%)
RUL: 480 sati (pouzdanost 75%)
═══════════════════════════════════════════════════════════════
*/
```

---

## 10. Reference i izvori

### Simbolička AI i ekspertski sistemi

- Giarratano & Riley, "Expert Systems: Principles and Programming"
- Jackson, "Introduction to Expert Systems"
- Negnevitsky, "Artificial Intelligence: A Guide to Intelligent Systems"

### Fuzzy logika

- Zadeh, "Fuzzy Sets" (1965)
- Mamdani, "Application of Fuzzy Logic to Approximate Reasoning" (1977)
- Ross, "Fuzzy Logic with Engineering Applications"

### Bayesian mreže

- Pearl, "Probabilistic Reasoning in Intelligent Systems"
- Jensen & Nielsen, "Bayesian Networks and Decision Graphs"
- Koller & Friedman, "Probabilistic Graphical Models"

### Fizički modeli pouzdanosti

- MIL-HDBK-217F, "Reliability Prediction of Electronic Equipment"
- JEDEC JEP122H, "Failure Mechanisms and Models for Semiconductor Devices"
- Arrhenius, "On the Reaction Rate of the Inversion of Non-refined Sugar" (1889)
- Coffin & Manson, "Fatigue and Endurance of Metals" (1954)

### Case-Based Reasoning

- Kolodner, "Case-Based Reasoning"
- Aamodt & Plaza, "Case-Based Reasoning: Foundational Issues" (1994)
- Watson, "Applying Case-Based Reasoning: Techniques for Enterprise Systems"

### Embedded implementacije

- STM32G4 Series Reference Manual (RM0440)
- ARM Cortex-M4 Technical Reference Manual
- CMSIS-DSP Software Library

### Standardi

- IEC 61508: Functional Safety
- IEC 62443: Industrial Cybersecurity
- EN ISO 13849-1: Safety of Control Systems
- ISO/IEC 25010: Systems and Software Quality Requirements
