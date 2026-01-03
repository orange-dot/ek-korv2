# EK3 Sensor Architecture & AI/ML Stack

**Document Version:** 1.0
**Date:** 2026-01-03
**Author:** Bojan Janjatović
**Email:** bojan.janjatovic@gmail.com
**Address:** Vojislava Ilica 8, Kikinda, Severni Banat, Serbia

---

## Executive Summary

Ovaj dokument definiše senzorsku arhitekturu za EK3 power module (3kW) i AI/ML stack za detekciju degradacije i kvarova. Fokus je na **ekspertskim sistemima i klasičnom ML**, ne na LLM-ovima.

**Ključni principi:**
1. Deterministički, objašnjivi rezultati
2. Edge processing (niska latencija, offline rad)
3. Kombinacija rule-based i learned sistema
4. Tvoje servisno iskustvo → formalizovane heuristike

---

## 1. Senzorski Stack

### 1.1 Current Sensing (Struja)

```
PREPORUČENO: Infineon XENSIV TLI4971 (Released: October 2025)
═══════════════════════════════════════════════════════════════

Specifikacije:
• Tip: Coreless magnetic sensor (bez jezgra)
• Preciznost: ±0.7% total error over temperature and lifetime
• Izolacija: 8mm creepage/clearance (reinforced isolation)
• Opsezi: 16A, 20A, 30A, 35A, 40A, 50A
• Insertion resistance: 220 µΩ typical
• Insertion inductance: <1 nH
• OCD (Overcurrent Detection): Hardware-level, brz

Zašto ovo:
• Coreless = nema histereze, nema saturacije
• Kompatibilno sa GaN/SiC (brza OCD)
• EEPROM za per-module kalibraciju
• Industrijski standard za DC fast charging

Alternativa:
• ACEINNA AMR senzori (Anisotropic Magneto-Resistive)
• Allegro ACS712/ACS723 (jeftiniji, manje precizni)
```

**Šta detektuje:**
| Signal | Indikacija |
|--------|------------|
| I > Imax | Preopterećenje, kratak spoj |
| I ripple ↑ | Degradacija MOSFET-a, loš kontakt |
| I nebalans (3-phase) | Problem na jednoj fazi |
| dI/dt anomalija | Switching problem |

---

### 1.2 Temperature Sensing (Temperatura)

```
METOD A: Vce(sat) / Vds(on) MONITORING (Junction Temperature)
═══════════════════════════════════════════════════════════════

Princip:
• MOSFET/IGBT sam služi kao temperaturni senzor
• Vds(on) raste linearno sa temperaturom
• Meri se tokom uključenog stanja

Implementacija:
• Jednostavan analog circuit za Vds sensing
• ADC sampling sinhronizovan sa PWM
• Kalibracija: Vds vs Tj karakteristika per device

Preciznost: ~94% (prema istraživanjima 2025)
Prednost: NEMA DODATNOG SENZORA na čipu!

Reference:
• IEEE: "Online Monitoring of IGBT Junction Temperature Based
  on Vce Measurement"
• ScienceDirect: "Junction Temperature Prediction Using
  Multivariate Linear Regression"
```

```
METOD B: NTC TERMISTORI (Ambient + Heatsink)
═══════════════════════════════════════════════════════════════

Lokacije:
• Heatsink (blizu MOSFET-a)
• Ambient (ulaz vazduha)
• Izlaz vazduha (ako ima ventilator)
• PCB hot spots (blizu kondenzatora)

Preporučeno:
• 10K NTC, B=3950
• Preciznost ±1%
• Response time <1s

Cena: ~$0.10-0.30 po komadu
```

```
METOD C: OPTIČKI SENZORI (Bleeding Edge - za R&D)
═══════════════════════════════════════════════════════════════

• Fiber-optic pirometrija
• Direktno merenje bez kontakta
• Preciznost ±0.5°C

Status: Skupo za proizvodnju, korisno za validaciju
```

**Šta detektuje:**
| Signal | Indikacija |
|--------|------------|
| Tj > 125°C | Termalni stres, smanji load |
| Tj > 150°C | HITNO - thermal shutdown |
| ΔT (junction-ambient) ↑ | Degradacija thermal interface |
| Tambient > 45°C | Loša ventilacija okoline |
| Dnevni Tj trend ↑ | Dugoročna degradacija |

---

### 1.3 Voltage Sensing (Napon)

```
MONITORING TAČKE:
═══════════════════════════════════════════════════════════════

1. INPUT VOLTAGE (Vin)
   • Resistor divider → ADC
   • Opseg: 0-450V DC (za 400V DC link)
   • Preciznost: ±0.5%

2. OUTPUT VOLTAGE (Vout)
   • Resistor divider → ADC
   • Opseg: prema output specs
   • VAŽNO: meri i DC i AC ripple komponente

3. INTERMEDIATE RAILS (ako postoje)
   • 12V, 5V, 3.3V rails za kontrolnu elektroniku
   • Jednostavan monitoring

4. DC LINK RIPPLE
   • High-speed ADC ili dedicated ripple detector
   • Ripple ↑ = kondenzator degradacija
```

**Šta detektuje:**
| Signal | Indikacija |
|--------|------------|
| Vin izvan opsega | Grid problem, zaštiti modul |
| Vout ripple ↑ | ESR kondenzatora raste |
| Vout regulacija loša | Kontrolna petlja problem |
| Rail dropout | Pomoćno napajanje failing |

---

### 1.4 Capacitor Health Monitoring (ESR)

```
ONLINE ESR ESTIMACIJA
═══════════════════════════════════════════════════════════════

Princip:
ESR = Vripple / Iripple

Implementacija:
1. Meri ripple struju kroz kondenzator (ili induktor)
2. Meri ripple napon na kondenzatoru
3. Računaj ESR u realnom vremenu
4. Prati trend

PRAGOVI (Aluminum Electrolytic):
┌─────────────────────────────────────────────────────────────┐
│  ESR < 1.2x nominal    │  OK                               │
│  ESR 1.2x - 1.5x       │  UPOZORENJE - planiraj zamenu     │
│  ESR 1.5x - 2.0x       │  ZAMENI na sledećem busu          │
│  ESR > 2.0x            │  END OF LIFE - hitna zamena       │
│                                                             │
│  Capacitance < 80%     │  END OF LIFE                      │
└─────────────────────────────────────────────────────────────┘

STATISTIKA: ~30% svih kvarova elektronike = kondenzatori!
```

**Degradacioni mehanizam:**
```
Elektrolit isparava/curi → ESR raste → više gubitaka →
više toplote → brže isparavanje → THERMAL RUNAWAY
```

---

### 1.5 Derived Metrics (Izvedene veličine)

```
EFIKASNOST (η)
═══════════════════════════════════════════════════════════════

η = Pout / Pin = (Vout × Iout) / (Vin × Iin)

• Meri se iz postojećih senzora (nema dodatnog HW)
• Svaki modul ima svoj baseline (fabrička kalibracija)
• Trend analysis otkriva degradaciju pre eksplicitnog kvara

PRAGOVI:
┌─────────────────────────────────────────────────────────────┐
│  η > 95%               │  Nominalno                        │
│  η 93-95%              │  Monitoring - možda ok            │
│  η 90-93%              │  UPOZORENJE - istraži             │
│  η < 90%               │  Problem - planiraj zamenu        │
└─────────────────────────────────────────────────────────────┘
```

```
POWER FACTOR (za AC-DC module)
═══════════════════════════════════════════════════════════════

PF degradacija može ukazati na:
• PFC stage problem
• Input filter degradacija
• Harmonici
```

---

## 2. Edge Processing Hardware

### 2.1 MCU Selection

```
OPCIJA A: ESP32-S3 (Preporučeno za prototip)
═══════════════════════════════════════════════════════════════

Specifikacije:
• Dual-core Xtensa LX7 @ 240MHz
• 512KB SRAM, 8MB PSRAM (optional)
• AI acceleration (vector instructions)
• WiFi + BLE 5.0
• 20+ ADC channels (12-bit)
• Cena: ~$3-5

Prednosti:
• Jeftin, dostupan
• Edge Impulse podrška
• Dovoljan za TinyML modele
• WiFi za cloud sync (opciono)

Mane:
• Nije "industrijski" (-40 to +85°C)
• 12-bit ADC možda nedovoljan za neke aplikacije


OPCIJA B: STM32H7 (Produkcija)
═══════════════════════════════════════════════════════════════

Specifikacije:
• Cortex-M7 @ 480MHz
• 1MB RAM, 2MB Flash
• 16-bit ADC, 3.6 MSPS
• CAN-FD, industrial interfaces
• -40 to +125°C operating range
• Cena: ~$8-15

Prednosti:
• Industrijski standard
• Bolja preciznost ADC
• Više GPIO, bolja periferija
• AUTOSAR/ISO26262 podržan

Mane:
• Nema WiFi (treba eksterni modul)
• Skuplje


OPCIJA C: Nordic nRF52840 (Ultra-low power)
═══════════════════════════════════════════════════════════════

• Za battery-backup scenarije
• BLE 5.0
• Vrlo niska potrošnja
```

### 2.2 ADC Considerations

```
ADC ZAHTEVI PO MERENJU:
═══════════════════════════════════════════════════════════════

| Merenje          | Rezolucija | Sample Rate | Napomena           |
|------------------|------------|-------------|---------------------|
| DC struja        | 12-bit     | 1 kHz       | RMS averaging       |
| DC napon         | 12-bit     | 1 kHz       | RMS averaging       |
| Ripple detection | 12-bit     | 100 kHz     | Za ESR estimation   |
| Temperature      | 10-bit     | 1 Hz        | Sporo se menja      |
| Junction temp    | 12-bit     | 10 kHz      | Sinhrono sa PWM     |

Za ripple detection možda treba eksterni high-speed ADC
ili dedicated analog ripple detector circuit.
```

---

## 3. AI/ML Stack

### 3.1 Arhitektura

```
                    ┌─────────────────────────────────────┐
                    │         CLOUD (Opciono)              │
                    │  • Agregacija podataka               │
                    │  • Model retraining                  │
                    │  • Fleet-wide analytics              │
                    └──────────────────┬──────────────────┘
                                       │ (periodic sync)
                                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    EDGE (Na EK3 modulu)                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │  LAYER 1        │  │  LAYER 2        │  │  LAYER 3    │  │
│  │  Rule-Based     │  │  Classical ML   │  │  Trending   │  │
│  │  Expert System  │  │  Anomaly Det.   │  │  & RUL      │  │
│  └────────┬────────┘  └────────┬────────┘  └──────┬──────┘  │
│           │                    │                   │         │
│           └────────────────────┼───────────────────┘         │
│                                ▼                             │
│                    ┌─────────────────────┐                   │
│                    │   DECISION LOGIC    │                   │
│                    │   (Prioritization)  │                   │
│                    └─────────┬───────────┘                   │
│                              ▼                               │
│                    ┌─────────────────────┐                   │
│                    │   ACTION OUTPUT     │                   │
│                    │   • Status LED      │                   │
│                    │   • CAN message     │                   │
│                    │   • Swap request    │                   │
│                    └─────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Layer 1: Rule-Based Expert System

```
FIZIČKI MODELI I PRAGOVI
═══════════════════════════════════════════════════════════════

Ovo definiše ČOVEK (ti!) na osnovu:
• Datasheet limita komponenti
• Servisnog iskustva
• Fizičkog razumevanja degradacije

PRIMER PRAVILA:

// Temperature rules
IF Tj > 150°C THEN
    action = IMMEDIATE_SHUTDOWN
    reason = "Junction temperature critical"

IF Tj > 125°C FOR > 10 minutes THEN
    action = REDUCE_POWER_50%
    reason = "Sustained thermal stress"

IF (Tj - Tambient) > 60°C AND load < 50% THEN
    action = SCHEDULE_REPLACEMENT
    reason = "Thermal interface degraded"

// Current rules
IF Iout > Imax THEN
    action = OVERCURRENT_PROTECTION
    latency = < 10µs (hardware level)

IF Iripple > 2x baseline THEN
    action = INVESTIGATE
    reason = "Possible MOSFET degradation"

// Capacitor rules
IF ESR > 1.5x initial THEN
    action = SCHEDULE_REPLACEMENT
    urgency = NEXT_BUS
    reason = "Capacitor aging - 50% ESR increase"

IF ESR > 2x initial THEN
    action = REPLACE_IMMEDIATELY
    reason = "Capacitor end of life"

// Efficiency rules
IF efficiency < 90% AND
   temperature_ok AND
   current_ok THEN
    action = SCHEDULE_REPLACEMENT
    reason = "Unexplained efficiency loss"
```

```
"MIRIŠE NA CRKLE KONDENZATORE" HEURISTIKE
═══════════════════════════════════════════════════════════════

Ovo su stvari koje TI znaš iz iskustva, a formalizujemo ih:

1. "Kondenzator pred smrt"
   • ESR raste brže nego linerano
   • Output ripple raste
   • Temperatura kondenzatora raste
   → Kombinacija ovih = HIGH CONFIDENCE failure prediction

2. "MOSFET umire"
   • Vds(on) raste (veći Rds_on)
   • Switching loss raste (efficiency pada)
   • Moguće: čudni zvuci (vibracije od loše gate drive)

3. "Termalna pasta otišla"
   • ΔT(junction-heatsink) raste
   • Ali ΔT(heatsink-ambient) OK
   → Problem je interface, ne ventilacija

4. "Ventilator crkava"
   • Tambient-to-heatsink ΔT raste
   • Sve temperature polako rastu
   • Periodic pattern ako je intermittent
```

### 3.3 Layer 2: Classical ML (Anomaly Detection)

```
ALGORITMI ZA ANOMALY DETECTION
═══════════════════════════════════════════════════════════════

1. AUTOENCODER (Preporučeno za TinyML)
   ────────────────────────────────────
   • Trenirano na "normalnim" podacima
   • Reconstruction error = anomaly score
   • Mala memorija (~10-50KB model)

   Input: [I, V, T, η, ESR] - normalized
   Output: Reconstruction error

   IF reconstruction_error > threshold THEN
       anomaly_detected = TRUE

2. ISOLATION FOREST
   ────────────────────────────────────
   • Dobar za outlier detection
   • Ne zahteva labeled data
   • Može na MCU (optimizovano)

3. ONE-CLASS SVM
   ────────────────────────────────────
   • Klasičan pristup
   • Teži za deployment na MCU
   • Možda za cloud processing

4. SIMPLE STATISTICAL
   ────────────────────────────────────
   • Z-score na sliding window
   • Ako |Z| > 3, anomaly
   • Najjednostavnije, baseline
```

```
TRAINING STRATEGIJA (bez postojećih podataka o kvarovima)
═══════════════════════════════════════════════════════════════

FAZA 1: Fabrička kalibracija
• Svaki modul prolazi burn-in test
• Snimaju se baseline vrednosti za taj specifični modul
• Baseline se čuva u EEPROM modula

FAZA 2: Normalan rad = training data
• Prvih N sati rada = "normal" class
• Autoencoder se trenira na ovome
• Per-module personalizacija

FAZA 3: Fleet learning (kad bude više modula)
• Agregacija anomalija sa cele flote
• Identifikacija common failure patterns
• Model update preko OTA

FAZA 4: Eksplicitni failure data (kad se dese kvarovi)
• Svaki kvar se labeluje
• Retroaktivno: šta je bilo pre kvara?
• Supervised learning becomes possible
```

### 3.4 Layer 3: Trending & RUL Prediction

```
REMAINING USEFUL LIFE (RUL) ESTIMATION
═══════════════════════════════════════════════════════════════

Za kondenzatore:
• ESR trend extrapolation
• Arrhenius model za temperaturu
• Empirijska formula:
  Life_remaining = Life_nominal × 2^((Tmax-Tactual)/10)

Za MOSFET-e:
• Vds(on) trending
• Thermal cycling count
• Power cycling count

JEDNOSTAVAN PRISTUP:
• Linear regression na ključne parametre
• Exponential smoothing za trend
• Confidence interval za predikciju
```

---

## 4. Software Architecture

### 4.1 Firmware Structure

```c
// Pseudo-code structure

typedef struct {
    float current_rms;
    float voltage_dc;
    float voltage_ripple;
    float temp_junction;
    float temp_ambient;
    float temp_heatsink;
    float esr_estimated;
    float efficiency;
    uint32_t timestamp;
} SensorData;

typedef enum {
    STATUS_OK,
    STATUS_WARNING,
    STATUS_SCHEDULE_REPLACEMENT,
    STATUS_REPLACE_NEXT_BUS,
    STATUS_CRITICAL,
    STATUS_SHUTDOWN
} ModuleStatus;

// Main loop
void health_monitor_task(void) {
    while(1) {
        // 1. Collect sensor data
        SensorData data = collect_all_sensors();

        // 2. Layer 1: Rule-based checks (immediate)
        ModuleStatus rule_status = check_rules(&data);
        if (rule_status == STATUS_SHUTDOWN) {
            emergency_shutdown();
            continue;
        }

        // 3. Layer 2: ML anomaly detection
        float anomaly_score = run_autoencoder(&data);
        bool anomaly = anomaly_score > ANOMALY_THRESHOLD;

        // 4. Layer 3: Update trends
        update_trends(&data);
        RUL rul = estimate_remaining_life();

        // 5. Combine and decide
        ModuleStatus final_status = combine_assessments(
            rule_status,
            anomaly,
            rul
        );

        // 6. Report
        report_status(final_status);
        log_to_flash(&data);

        vTaskDelay(SAMPLE_PERIOD);
    }
}
```

### 4.2 Development Tools

```
EDGE IMPULSE (Preporučeno)
═══════════════════════════════════════════════════════════════

• End-to-end platforma za TinyML
• Data collection → Training → Deployment
• EON compiler za optimizaciju
• Podržava ESP32, STM32, Nordic
• Free tier dovoljan za development

Workflow:
1. Collect sensor data (CSV upload ili live)
2. Label data (normal vs anomaly, ako imaš)
3. Train model (autoencoder, classification)
4. Test on device
5. Deploy (C++ library)


TENSORFLOW LITE MICRO / LiteRT
═══════════════════════════════════════════════════════════════

• Google-ov runtime za MCU
• 16KB minimum footprint
• Quantization support (int8)
• Dobra dokumentacija
```

---

## 5. Communication & Integration

### 5.1 Internal (Module → Station Controller)

```
CAN BUS (Preporučeno)
═══════════════════════════════════════════════════════════════

• Industrijski standard
• Robusno u EMI okruženju
• Multi-drop (više modula na jednoj liniji)
• CAN-FD za veći bandwidth ako treba

Message structure:
┌─────────────────────────────────────────────────────────────┐
│ ID: MODULE_XX_STATUS                                        │
│ Data:                                                       │
│   [0]: status_code (OK/WARN/REPLACE/CRITICAL)              │
│   [1]: temp_junction (scaled)                               │
│   [2]: efficiency (scaled)                                  │
│   [3]: anomaly_score (scaled)                               │
│   [4-5]: ESR (16-bit)                                       │
│   [6]: hours_to_replacement (estimated)                     │
│   [7]: reserved                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 External (Station → Fleet System)

```
MQTT preko cellular/WiFi
═══════════════════════════════════════════════════════════════

Topics:
• station/{id}/module/{slot}/status
• station/{id}/module/{slot}/telemetry
• station/{id}/maintenance/request

Periodic telemetry: svakih 5 min
Event-driven: odmah pri promeni statusa
```

---

## 6. Bill of Materials (Senzori per Module)

```
ESTIMATED BOM - SENSORS ONLY
═══════════════════════════════════════════════════════════════

| Component              | Qty | Unit Price | Total  |
|------------------------|-----|------------|--------|
| Infineon TLI4971-50A   | 2   | $3.50      | $7.00  |
| NTC 10K thermistor     | 4   | $0.20      | $0.80  |
| Resistor dividers      | 1   | $0.50      | $0.50  |
| Op-amp (Vds sensing)   | 1   | $0.30      | $0.30  |
| ESP32-S3-WROOM-1       | 1   | $4.00      | $4.00  |
| Misc (caps, resistors) | 1   | $1.00      | $1.00  |
|------------------------|-----|------------|--------|
| TOTAL                  |     |            | ~$14   |

Za produkciju sa STM32H7: ~$20-25 per module
```

---

## 7. Roadmap

```
PHASE 1: Prototype (Mesec 1-2)
═══════════════════════════════════════════════════════════════
□ ESP32-S3 dev board + basic sensors
□ Rule-based system only
□ Serial output / basic logging
□ Validacija na bench power supply

PHASE 2: ML Integration (Mesec 3-4)
═══════════════════════════════════════════════════════════════
□ Edge Impulse setup
□ Collect baseline data (100+ hours)
□ Train autoencoder
□ Deploy to ESP32
□ A/B test: rules only vs rules + ML

PHASE 3: Production Design (Mesec 5-6)
═══════════════════════════════════════════════════════════════
□ STM32H7 migration
□ CAN bus integration
□ Industrial temp range validation
□ EMC testing

PHASE 4: Fleet Learning (Ongoing)
═══════════════════════════════════════════════════════════════
□ Cloud aggregation setup
□ Fleet-wide anomaly correlation
□ Model updates via OTA
□ Continuous improvement
```

---

## 8. Open Questions

1. **Koji tačno MOSFET/IGBT koristimo?**
   → Određuje Vds sensing parametre

2. **Koji tip kondenzatora (electrolytic vs film)?**
   → Različiti degradacioni mehanizmi

3. **Switching frequency?**
   → Utiče na sampling rate za ripple

4. **Treba li galvanska izolacija za sve senzore?**
   → Safety consideration

5. **Koliko slotova za module po stanici?**
   → CAN addressing scheme

---

## References

### Hardware
- [Infineon XENSIV TLI4971](https://www.infineon.com/products/sensor/current-sensors)
- [Infineon XENSIV Sensor Selection Guide 2025-2026](https://www.infineon.com/xensiv)

### Condition Monitoring
- [Capacitor Health Monitoring Review (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7374397/)
- [Junction Temperature Optical Sensing (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10457841/)
- [IGBT Vce Monitoring (IEEE)](https://ieeexplore.ieee.org/document/8921865/)
- [SiC/GaN Condition Monitoring (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S0167931721001350)

### TinyML & Edge AI
- [TinyML Applications (ThinkRobotics)](https://thinkrobotics.com/blogs/learn/tinyml-applications-on-microcontrollers-revolutionizing-edge-ai)
- [Edge AI Trends 2026 (Evolute)](https://www.evolute.in/blog/10-embedded-systems-development-technology-trends-in-2026-driving-the-next-wave-of-smart-electronics/)
- [Predictive Maintenance Sensors 2026 (Tractian)](https://tractian.com/en/blog/top-predictive-maintenance-sensors)

### Tools
- [Edge Impulse](https://edgeimpulse.com/)
- [TensorFlow Lite Micro](https://www.tensorflow.org/lite/microcontrollers)
