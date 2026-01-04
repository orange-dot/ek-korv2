# V2G AI/ML Optimizacija

Ovaj dokument detaljno opisuje AI/ML algoritme za optimizaciju V2G operacija u ELEKTROKOMBINACIJA sistemu.

---

## 1. Pregled

### 1.1 AI/ML Primene u V2G

| Primena | Algoritam | Platforma | Kašnjenje |
|---------|-----------|-----------|-----------|
| Predikcija Frekvencije Mreže | LSTM | Edge (STM32H7) | <100ms |
| Optimizacija Demand Response | MILP | Cloud | <1s |
| Cenovni Arbitraž | RL/Heuristika | Cloud | <1s |
| Agregacija Flote | Raft + Prioritet | Edge | <10ms |
| Detekcija Anomalija | Autoencoder | Edge | <50ms |
| Model Degradacije Baterije | Physics-Informed NN | Cloud | <1s |

### 1.2 Arhitektura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       AI/ML ARHITEKTURA ZA V2G                           │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                           CLOUD SLOJ                                │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │ │
│  │  │   TRENING    │  │ OPTIMIZACIJA │  │  DIGITALNI   │              │ │
│  │  │   PIPELINE   │  │    ENGINE    │  │   BLIZANCI   │              │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │ │
│  └────────────────────────────────┬───────────────────────────────────┘ │
│                                   │ MQTT / gRPC                         │
│  ┌────────────────────────────────▼───────────────────────────────────┐ │
│  │                           EDGE SLOJ                                 │ │
│  │                      (Kontroler Depoa)                              │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │ │
│  │  │ PRED. FREKV. │  │   AGREGATOR  │  │  DETEKCIJA   │              │ │
│  │  │   (LSTM)     │  │    FLOTE     │  │  ANOMALIJA   │              │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │ │
│  └────────────────────────────┬───────────────────────────────────────┘ │
│                               │ CAN-FD @ 5Mbps                         │
│  ┌────────────────────────────▼───────────────────────────────────────┐ │
│  │                          SLOJ MODULA                                │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │ │
│  │  │  EK3    │  │  EK3    │  │  EK3    │  │  EK3    │  │  EK3    │  │ │
│  │  │ STM32G4 │  │ STM32G4 │  │ STM32G4 │  │ STM32G4 │  │ STM32G4 │  │ │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Predikcija Frekvencije Mreže

### 2.1 LSTM Arhitektura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LSTM ZA PREDIKCIJU FREKVENCIJE                        │
│                                                                          │
│  Ulaz (klizni prozor = 60 sekundi):                                     │
│  ├─ f[t-59] ... f[t]      Frekvencija mreže (60 uzoraka @ 1Hz)          │
│  ├─ P_load[t-59:t]        Ukupno opterećenje mreže                      │
│  ├─ P_renewable[t-59:t]   Proizvodnja iz OIE                            │
│  ├─ hour_of_day           Ciklično kodiranje (sin/cos)                  │
│  └─ day_of_week           Ciklično kodiranje (sin/cos)                  │
│                                                                          │
│  Arhitektura:                                                            │
│  ┌────────────────┐                                                     │
│  │ Ulazni Sloj    │ oblik: (60, 5)                                      │
│  └───────┬────────┘                                                     │
│          ▼                                                               │
│  ┌────────────────┐                                                     │
│  │ LSTM Sloj 1    │ 64 jedinice, return_sequences=True                  │
│  │ Dropout(0.2)   │                                                     │
│  └───────┬────────┘                                                     │
│          ▼                                                               │
│  ┌────────────────┐                                                     │
│  │ LSTM Sloj 2    │ 32 jedinice, return_sequences=False                 │
│  │ Dropout(0.2)   │                                                     │
│  └───────┬────────┘                                                     │
│          ▼                                                               │
│  ┌────────────────┐                                                     │
│  │ Dense Sloj     │ 16 jedinica, ReLU                                   │
│  └───────┬────────┘                                                     │
│          ▼                                                               │
│  ┌────────────────┐                                                     │
│  │ Izlazni Sloj   │ 4 jedinice (višehorizontna predikcija)              │
│  └────────────────┘                                                     │
│                                                                          │
│  Izlaz:                                                                  │
│  ├─ f[t+1]     1 sekunda unapred                                        │
│  ├─ f[t+10]    10 sekundi unapred                                       │
│  ├─ f[t+60]    1 minut unapred                                          │
│  └─ f[t+300]   5 minuta unapred                                         │
│                                                                          │
│  Trening:                                                                │
│  ├─ Podaci: ENTSO-E Transparency Platform (1 godina)                    │
│  ├─ Gubitak: MSE                                                        │
│  └─ Ciljni MAE: <0.02 Hz za 1-minutnu predikciju                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Edge Deployment (STM32H7)

```c
// TensorFlow Lite Micro na STM32H7
typedef struct {
    float input_buffer[60][5];  // 60 vremenskih koraka × 5 karakteristika
    float predictions[4];       // 4 horizonta: 1s, 10s, 60s, 300s
    int write_idx;
    bool model_ready;
} FrequencyPredictor;

void FreqPredict_AddSample(float frequency, float p_load,
                           float p_renewable, float hour, float day);

bool FreqPredict_Infer(void);

// Proaktivna V2G kontrola na osnovu predikcija
void V2G_ProactiveControl(void) {
    float freq_1min = FreqPredict_GetPrediction(2);  // 60s unapred

    if (freq_1min < 49.8f) {
        // Predviđen događaj pod-frekvencije
        PrepareV2GDischarge();
    } else if (freq_1min > 50.2f) {
        // Predviđena nad-frekvencija
        IncreaseChargingPower();
    }
}
```

---

## 3. Optimizacija Demand Response

### 3.1 Formulacija Problema

```
CILJ: Minimizuj ukupni trošak uz ispunjenje DR obaveze

MINIMIZUJ:
    C_ukupno = Σ_t Σ_v [ C_baterija(P_v,t) + C_propusteno(P_v,t) - R_mreža(P_v,t) ]

GDE JE:
    C_baterija    = Trošak degradacije baterije od V2G cikliranja
    C_propusteno  = Propušteni prihod od nepunjenja
    R_mreža       = Prihod od mrežnih servisa

OGRANIČENJA:
    1. DR Obaveza:
       Σ_v P_v,t ≥ P_DR,t  ∀t ∈ DR_događaj

    2. SoC Limiti:
       SoC_min,v ≤ SoC_v,t ≤ SoC_max,v  ∀v,t

    3. Ograničenje Polaska:
       SoC_v,t_polazak ≥ SoC_potreban,v  ∀v sa t_polazak ≤ t_kraj

    4. Limiti Snage:
       P_min,v ≤ P_v,t ≤ P_max,v  ∀v,t
```

### 3.2 MILP Implementacija

```python
from pulp import *

def optimize_fleet_v2g(vehicles, dr_event, dt=0.25):
    """Optimizuj V2G alokaciju snage za flotu."""

    n_steps = int(dr_event['duration'] / dt)
    prob = LpProblem("V2G_Fleet_Optimization", LpMinimize)

    # Varijable odlučivanja: P[v, t] = snaga za vozilo v u vremenu t
    P = {}
    for v in vehicles:
        for t in range(n_steps):
            P[v['id'], t] = LpVariable(
                f"P_{v['id']}_{t}",
                lowBound=-v['max_discharge'],
                upBound=v['max_charge']
            )

    # Ciljna funkcija i ograničenja...
    # (vidi engleski dokument za kompletan kod)

    prob.solve()
    return {v['id']: [P[v['id'], t].varValue for t in range(n_steps)]
            for v in vehicles}
```

---

## 4. Cenovni Arbitraž

### 4.1 Strategija

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      STRATEGIJA CENOVNOG ARBITRAŽA                       │
│                                                                          │
│  Cena (EUR/MWh)                                                          │
│       ▲                                                                  │
│   150 │              ╱╲           Vršno                                  │
│       │             ╱  ╲          │                                      │
│   100 │            ╱    ╲   ╱╲    ▼                                      │
│       │     ╱╲    ╱      ╲ ╱  ╲                                          │
│    50 │    ╱  ╲  ╱        ╳    ╲                                         │
│       │───╱────╲╱─────────╱╲────╲─── Prag rentabilnosti                  │
│     0 │  Van-vršno   Dan      Veče    Noć                                │
│       └────────────────────────────────────────► Vreme                   │
│                                                                          │
│  LOGIKA ODLUČIVANJA:                                                     │
│  ──────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  Prag = (1/η_roundtrip - 1) × P_avg + C_degradacija                      │
│                                                                          │
│  Primer:                                                                 │
│    η_roundtrip = 0.91 (91% efikasnost krug)                              │
│    P_avg = 80 EUR/MWh                                                    │
│    C_degradacija = 5 EUR/MWh (habanje baterije)                          │
│                                                                          │
│    Prag = (1/0.91 - 1) × 80 + 5 = 12.9 EUR/MWh                           │
│                                                                          │
│  AKCIJE:                                                                 │
│  ├─ P_trenutna < 67 EUR/MWh: PUNJENJE max snagom                        │
│  ├─ P_trenutna > 93 EUR/MWh: PRAŽNJENJE (V2G)                            │
│  └─ Inače: Pratiti raspored ili mirovanje                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Implementacija

```c
typedef enum {
    ARBITRAGE_CHARGE,
    ARBITRAGE_DISCHARGE,
    ARBITRAGE_HOLD
} ArbitrageAction;

ArbitrageAction Arbitrage_Decide(PriceArbitrage* arb,
                                 float current_soc,
                                 float min_soc,
                                 float max_soc) {
    float price_threshold_charge = arb->avg_price - arb->breakeven_spread / 2.0f;
    float price_threshold_discharge = arb->avg_price + arb->breakeven_spread / 2.0f;

    if (arb->current_price < price_threshold_charge && current_soc < max_soc) {
        return ARBITRAGE_CHARGE;
    }

    if (arb->current_price > price_threshold_discharge && current_soc > min_soc) {
        return ARBITRAGE_DISCHARGE;
    }

    return ARBITRAGE_HOLD;
}
```

---

## 5. Agregacija Flote

### 5.1 Alokacija Zasnovana na Prioritetu

```c
// Izračunaj prioritet za V2G učešće
float CalculateV2GPriority(FleetVehicle* v, uint32_t current_time) {
    // Viši skor = bolji kandidat za V2G

    // Faktor 1: Visok SoC je dobar (više energije za davanje)
    float soc_score = v->soc;

    // Faktor 2: Kasni polazak je dobar (više vremena za dopunjavanje)
    float time_to_depart = (float)(v->departure_time - current_time) / 3600.0f;
    float depart_score = fminf(time_to_depart / 8.0f, 1.0f);

    // Faktor 3: Dobro zdravlje baterije je poželjno
    float health_score = v->battery_health;

    // Faktor 4: Proveri da li SoC dozvoljava V2G
    float soc_margin = v->soc - v->required_soc - 0.1f;
    if (soc_margin < 0) return 0.0f;

    // Ponderisana kombinacija
    return soc_score * 0.3f + depart_score * 0.3f +
           health_score * 0.2f + fminf(soc_margin / 0.3f, 1.0f) * 0.2f;
}

void Fleet_DistributeDRPower(FleetAggregator* fleet, float dr_power_request) {
    // Izračunaj prioritete za sva vozila
    for (int i = 0; i < fleet->vehicle_count; i++) {
        CalculateV2GPriority(&fleet->vehicles[i], GetCurrentTime());
    }

    // Sortiraj po prioritetu (najviši prvi)
    qsort(fleet->vehicles, fleet->vehicle_count,
          sizeof(FleetVehicle), CompareByPriority);

    // Dodeli snagu počevši od najvišeg prioriteta
    float remaining = fabsf(dr_power_request);

    for (int i = 0; i < fleet->vehicle_count && remaining > 0; i++) {
        FleetVehicle* v = &fleet->vehicles[i];
        if (v->priority_score <= 0.0f) continue;

        float assignable = fminf(v->max_discharge, remaining);
        v->assigned_power = -assignable;
        remaining -= assignable;

        SendPowerCommand(v->id, v->assigned_power);
    }
}
```

---

## 6. Detekcija Anomalija

### 6.1 Autoencoder Arhitektura

```python
def create_anomaly_detector():
    """Autoencoder za detekciju anomalija u V2G radu."""

    input_dim = 10  # Frekvencija, napon, snaga, temperature, struja, efikasnost

    encoder_input = layers.Input(shape=(input_dim,))
    x = layers.Dense(32, activation='relu')(encoder_input)
    x = layers.Dense(16, activation='relu')(x)
    encoded = layers.Dense(8, activation='relu')(x)

    x = layers.Dense(16, activation='relu')(encoded)
    x = layers.Dense(32, activation='relu')(x)
    decoded = layers.Dense(input_dim, activation='linear')(x)

    autoencoder = models.Model(encoder_input, decoded)
    autoencoder.compile(optimizer='adam', loss='mse')

    return autoencoder
```

### 6.2 Edge Implementacija

```c
bool Anomaly_Detect(AnomalyDetector* det, float* features, int n_features) {
    // Normalizuj karakteristike
    float normalized[10];
    for (int i = 0; i < n_features; i++) {
        normalized[i] = (features[i] - det->feature_means[i]) / det->feature_stds[i];
    }

    // Jednostavna greška rekonstrukcije
    float error = 0.0f;
    for (int i = 0; i < n_features; i++) {
        error += normalized[i] * normalized[i];
    }
    error = sqrtf(error / n_features);

    // Anomalija ako greška > srednja + 3*std
    float dynamic_threshold = det->mean_error + 3.0f * det->std_error;
    return error > fmaxf(dynamic_threshold, det->threshold);
}
```

---

## 7. Reference

- **TensorFlow Lite for Microcontrollers** - Edge ML deployment
- **ENTSO-E Transparency Platform** - Evropski mrežni podaci
- **PuLP Documentation** - Linearno programiranje u Python-u
- **RAFT Consensus Algorithm** - Distribuirana koordinacija
- **ISO 15118-20** - V2G komunikacioni protokol
