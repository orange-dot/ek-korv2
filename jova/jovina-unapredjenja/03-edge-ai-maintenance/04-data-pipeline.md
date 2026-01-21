# Edge AI Predictive Maintenance: Data Pipeline

> **Topic:** Feature Engineering and Data Collection for TinyML
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document describes the data pipeline for predictive maintenance on EK3 modules, covering sensor data acquisition, feature engineering, labeling strategies, and on-device preprocessing.

---

## 2. Data Acquisition

### 2.1 Sensor Configuration

```
SENSOR CONFIGURATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ADC Channels (STM32G474):
────────────────────────────────────────────
Channel | Signal          | Range      | Resolution
────────┼─────────────────┼────────────┼───────────
ADC1_1  | V_in (DC bus)   | 0-900V     | 12-bit
ADC1_2  | V_out           | 0-900V     | 12-bit
ADC1_3  | I_in            | 0-50A      | 12-bit
ADC1_4  | I_out           | 0-50A      | 12-bit
ADC2_1  | T_mosfet        | -40-150°C  | 12-bit
ADC2_2  | T_diode         | -40-150°C  | 12-bit
ADC2_3  | T_capacitor     | -40-150°C  | 12-bit
ADC2_4  | T_ambient       | -40-85°C   | 12-bit
ADC3_1  | V_ripple (AC)   | 0-50mV     | 12-bit

Sampling Rates:
────────────────────────────────────────────
• Electrical (V, I): 100 Hz (10 ms period)
• Thermal (T): 10 Hz (100 ms period)
• Derived metrics: 1 Hz (1 s period)

Data Volume:
────────────────────────────────────────────
• Raw: 9 channels × 100 Hz × 2 bytes = 1.8 KB/s
• Aggregated: 16 features × 1 Hz × 4 bytes = 64 bytes/s
• Daily: ~5.5 MB (raw) or ~5.5 KB (aggregated)
```

### 2.2 Data Acquisition System

```
DATA ACQUISITION FLOW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Sensors   │────▶│  ADC + DMA  │────▶│   Buffer    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────────────┐
│                  Preprocessing Task                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ Filter  │─▶│ Scale   │─▶│ Window  │─▶│ Feature │   │
│  │ (IIR)   │  │ (INT16) │  │ Buffer  │  │ Extract │   │
│  └─────────┘  └─────────┘  └─────────┘  └────┬────┘   │
└──────────────────────────────────────────────┼─────────┘
                                               │
                    ┌──────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────────────┐
│                   ML Inference Task                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                 │
│  │ Input   │─▶│ Model   │─▶│ Output  │                 │
│  │ Format  │  │ Invoke  │  │ Process │                 │
│  └─────────┘  └─────────┘  └─────────┘                 │
└─────────────────────────────────────────────────────────┘

DMA Configuration:
────────────────────────────────────────────
• Circular buffer mode
• Half-transfer and transfer-complete interrupts
• Double-buffering for continuous acquisition
```

---

## 3. Feature Engineering

### 3.1 Raw Features

```
RAW FEATURE VECTOR (16 dimensions):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Index | Feature        | Unit  | Source
──────┼────────────────┼───────┼─────────────────
0     | V_in           | V     | ADC, scaled
1     | V_out          | V     | ADC, scaled
2     | I_in           | A     | ADC, scaled
3     | I_out          | A     | ADC, scaled
4     | P_in           | W     | V_in × I_in
5     | P_out          | W     | V_out × I_out
6     | η (efficiency) | %     | P_out / P_in
7     | V_ripple       | mV    | ADC, scaled
8     | T_mosfet       | °C    | ADC, NTC curve
9     | T_diode        | °C    | ADC, NTC curve
10    | T_capacitor    | °C    | ADC, NTC curve
11    | T_ambient      | °C    | ADC, NTC curve
12    | T_pcb          | °C    | ADC, NTC curve
13    | ESR_estimated  | mΩ    | Derived
14    | Rds_estimated  | mΩ    | Derived
15    | cycle_count    | -     | Counter
```

### 3.2 Derived Features

```
DERIVED FEATURE COMPUTATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ESR Estimation (Capacitor Health):
────────────────────────────────────────────
# From ripple voltage and current
ESR = V_ripple_rms / I_ripple_rms

# Where ripple is extracted via high-pass filter
V_ripple = HPF(V_dc_bus, f_cutoff=1kHz)
I_ripple = HPF(I_dc_bus, f_cutoff=1kHz)

# RMS over window
V_ripple_rms = sqrt(mean(V_ripple²))
I_ripple_rms = sqrt(mean(I_ripple²))

Rds_on Estimation (MOSFET Health):
────────────────────────────────────────────
# From voltage drop during conduction
# Requires synchronization with gate signal

# During on-state:
V_ds_on = V_drain - V_source  # ~10-50 mV
I_d = I_out

Rds_on = V_ds_on / I_d

# Temperature compensation:
Rds_on_25C = Rds_on / (1 + α × (T_mosfet - 25))
# α ≈ 0.004 for SiC MOSFETs

Thermal Cycle Counter:
────────────────────────────────────────────
# Rainflow counting for fatigue analysis

def count_thermal_cycles(T_history, min_swing=10):
    """
    Count thermal cycles using simplified rainflow.
    """
    cycles = []
    peaks = find_peaks_and_valleys(T_history)

    for i in range(len(peaks) - 1):
        swing = abs(peaks[i+1] - peaks[i])
        if swing >= min_swing:
            mean_T = (peaks[i+1] + peaks[i]) / 2
            cycles.append((swing, mean_T))

    return cycles

# Damage accumulation (Miner's rule)
D = Σᵢ nᵢ / Nf(ΔTᵢ)
```

### 3.3 Statistical Features

```
STATISTICAL FEATURES (per window):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For each raw feature x over window of N samples:
────────────────────────────────────────────

Basic statistics:
• mean(x) = (1/N) × Σᵢ xᵢ
• std(x) = sqrt((1/N) × Σᵢ (xᵢ - mean)²)
• min(x), max(x)
• range(x) = max - min

Higher-order:
• skewness(x) = E[(x - μ)³] / σ³
• kurtosis(x) = E[(x - μ)⁴] / σ⁴ - 3

Trend:
• slope = linear_fit(x).slope
• residual_std = std(x - linear_fit(x))

MCU-OPTIMIZED COMPUTATION:
────────────────────────────────────────────
// Incremental mean and variance (Welford's algorithm)
void update_stats(float x, Stats* s) {
    s->n++;
    float delta = x - s->mean;
    s->mean += delta / s->n;
    float delta2 = x - s->mean;
    s->M2 += delta * delta2;
}

float get_variance(Stats* s) {
    return s->M2 / s->n;
}

// Avoids storing all samples
// O(1) memory instead of O(N)
```

### 3.4 Frequency Domain Features

```
FREQUENCY DOMAIN FEATURES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FFT-based features (for V_ripple, I signals):
────────────────────────────────────────────

• Dominant frequency: argmax(|FFT(x)|)
• Spectral centroid: Σ f × |X(f)| / Σ |X(f)|
• Spectral entropy: -Σ p(f) × log(p(f))
• Band powers: Σ |X(f)|² for f in [f1, f2]

MCU IMPLEMENTATION:
────────────────────────────────────────────
// CMSIS-DSP FFT (64-point, radix-4)
arm_rfft_fast_instance_f32 fft_instance;
arm_rfft_fast_init_f32(&fft_instance, 64);

// Compute FFT
float fft_output[128];  // Complex output
arm_rfft_fast_f32(&fft_instance, input, fft_output, 0);

// Compute magnitude
float magnitudes[32];
arm_cmplx_mag_f32(fft_output, magnitudes, 32);

// Find peak
uint32_t peak_idx;
float peak_val;
arm_max_f32(magnitudes, 32, &peak_val, &peak_idx);

CONSTRAINTS:
────────────────────────────────────────────
• FFT size limited (64-256 points)
• Single precision only
• ~0.5 ms for 64-point FFT
• Memory: 2 × N × 4 bytes for complex
```

---

## 4. Feature Selection

### 4.1 Feature Importance Analysis

```
FEATURE IMPORTANCE (from historical data):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Rank | Feature              | Importance | Category
─────┼──────────────────────┼────────────┼──────────
1    | ESR_estimated        | 0.25       | Derived
2    | T_capacitor_mean     | 0.18       | Thermal
3    | efficiency_trend     | 0.12       | Derived
4    | V_ripple_rms         | 0.10       | Electrical
5    | Rds_estimated        | 0.09       | Derived
6    | thermal_cycle_count  | 0.08       | Derived
7    | T_mosfet_max         | 0.06       | Thermal
8    | P_out_variance       | 0.04       | Electrical
9    | I_out_mean           | 0.03       | Electrical
10   | operating_hours      | 0.03       | Metadata
...

FEATURE SELECTION FOR TINY MODEL:
────────────────────────────────────────────
Select top-k features by importance:
• k = 8: Captures 90% of predictive power
• k = 12: Captures 95%
• k = 16: Full feature set

Recommended minimal set (k=8):
[ESR, T_cap_mean, η_trend, V_ripple, Rds, cycles, T_mos_max, P_var]
```

### 4.2 Correlation Analysis

```
CORRELATION MATRIX (key features):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

              ESR   T_cap   η    V_rip  Rds   RUL
         ┌────────────────────────────────────────
ESR      │ 1.00  0.65  -0.72  0.81  0.45 -0.85
T_cap    │ 0.65  1.00  -0.58  0.52  0.38 -0.70
η        │-0.72 -0.58   1.00 -0.61 -0.55  0.78
V_ripple │ 0.81  0.52  -0.61  1.00  0.35 -0.75
Rds_on   │ 0.45  0.38  -0.55  0.35  1.00 -0.60
RUL      │-0.85 -0.70   0.78 -0.75 -0.60  1.00

INSIGHTS:
────────────────────────────────────────────
• ESR strongly correlated with RUL (primary indicator)
• T_cap and ESR correlated (thermal acceleration)
• Remove redundant features (V_ripple ~ ESR)
• Keep diverse feature types for robustness
```

---

## 5. Labeling Strategy

### 5.1 RUL Label Generation

```
RUL LABELING APPROACHES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Approach 1: Run-to-Failure Data
────────────────────────────────────────────
# Most accurate, but requires failures

RUL(t) = T_failure - t

where T_failure is known from historical data

# Piecewise linear (common in literature)
RUL(t) = min(RUL_max, T_failure - t)

# Prevents unrealistically high RUL values


Approach 2: Physics-Based Simulation
────────────────────────────────────────────
# Use degradation models to estimate RUL

def estimate_rul_physics(ESR, T_history, ESR_eol):
    """
    Estimate RUL from current ESR using Arrhenius model.
    """
    # Current degradation rate
    T_avg = mean(T_history)
    k = k0 * exp(-Ea / (R * (T_avg + 273)))

    # Time to ESR_eol
    rul = (log(ESR_eol) - log(ESR)) / k

    return max(0, rul)


Approach 3: Expert Annotation
────────────────────────────────────────────
# Domain experts label health states

Health State    | RUL Range     | Label
────────────────┼───────────────┼──────
Healthy         | > 1000 hours  | 0
Degraded        | 500-1000      | 1
Warning         | 100-500       | 2
Critical        | < 100         | 3

# Classification instead of regression
```

### 5.2 Weak Supervision

```
WEAK SUPERVISION FOR LABELING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Challenge: Limited run-to-failure data

Labeling Functions:
────────────────────────────────────────────
def lf_esr_threshold(x):
    """ESR above threshold indicates degradation."""
    if x['ESR'] > 1.5 * ESR_nominal:
        return DEGRADED
    return ABSTAIN

def lf_efficiency_drop(x):
    """Efficiency drop indicates problem."""
    if x['efficiency'] < 0.95 * nominal_efficiency:
        return DEGRADED
    return ABSTAIN

def lf_thermal_stress(x):
    """High thermal cycles indicate wear."""
    if x['thermal_cycles'] > 10000:
        return DEGRADED
    return ABSTAIN

def lf_manufacturer_spec(x):
    """Operating outside spec indicates stress."""
    if x['T_cap'] > T_cap_max_spec:
        return WARNING
    return ABSTAIN

# Combine with majority voting or Snorkel
labels = majority_vote([lf1(x), lf2(x), lf3(x), lf4(x)])
```

---

## 6. Preprocessing Pipeline

### 6.1 On-Device Preprocessing

```
ON-DEVICE PREPROCESSING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: ADC to Physical Units
────────────────────────────────────────────
// Voltage scaling (with voltage divider)
float V_in = (adc_value / 4096.0f) * V_ref * divider_ratio;

// Current scaling (with shunt + amplifier)
float I_in = (adc_value / 4096.0f) * V_ref / (R_shunt * gain);

// Temperature (NTC thermistor)
float R_ntc = R_pullup * adc_value / (4096 - adc_value);
float T = 1.0f / (1.0f/T0 + (1.0f/B) * log(R_ntc/R0)) - 273.15f;


Step 2: Filtering
────────────────────────────────────────────
// IIR low-pass filter for noise reduction
// 2nd order Butterworth, fc = 10 Hz

#define FILTER_ALPHA 0.0305f  // For 100 Hz sample, 10 Hz cutoff

static float filter_state[2] = {0};

float iir_lowpass(float x) {
    float y = FILTER_ALPHA * x + (1 - FILTER_ALPHA) * filter_state[0];
    filter_state[0] = y;
    return y;
}


Step 3: Normalization
────────────────────────────────────────────
// Z-score normalization (pre-computed statistics)
float normalize(float x, float mean, float std) {
    return (x - mean) / std;
}

// Min-max normalization for bounded features
float normalize_minmax(float x, float min, float max) {
    return (x - min) / (max - min);
}

// Quantization for INT8 model input
int8_t quantize(float x, float scale, int8_t zero_point) {
    return (int8_t)(x / scale + zero_point);
}


Step 4: Windowing
────────────────────────────────────────────
// Circular buffer for sliding window
#define WINDOW_SIZE 64
#define NUM_FEATURES 16

float window_buffer[WINDOW_SIZE][NUM_FEATURES];
int window_index = 0;

void add_to_window(float* features) {
    memcpy(window_buffer[window_index], features,
           NUM_FEATURES * sizeof(float));
    window_index = (window_index + 1) % WINDOW_SIZE;
}
```

### 6.2 Preprocessing Computational Cost

```
PREPROCESSING TIMING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Operation              | Time    | Frequency
───────────────────────┼─────────┼───────────
ADC conversion         | 2 μs    | 100 Hz
Scaling (16 ch)        | 10 μs   | 100 Hz
IIR filter (16 ch)     | 5 μs    | 100 Hz
Derived features       | 50 μs   | 1 Hz
Statistical features   | 200 μs  | 1 Hz
Normalization          | 20 μs   | 1 Hz
Window formatting      | 10 μs   | 1 Hz
Quantization           | 15 μs   | 1 Hz

Total (per second):
• High-frequency: (2 + 10 + 5) × 100 = 1,700 μs
• Low-frequency: 50 + 200 + 20 + 10 + 15 = 295 μs
• Total: ~2 ms/s (0.2% CPU utilization)
```

---

## 7. Data Storage and Management

### 7.1 On-Device Storage

```
ON-DEVICE DATA STORAGE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Storage Options:
────────────────────────────────────────────
1. Internal Flash (limited writes)
   • Store model parameters
   • Store calibration data
   • Store aggregated statistics

2. External EEPROM/Flash (optional)
   • Store historical data
   • Store training samples for federated learning

Data Retention Policy:
────────────────────────────────────────────
• Keep last 24 hours of raw data (if external storage)
• Keep last 30 days of daily aggregates
• Keep running statistics (lifetime)

Ring Buffer for Recent History:
────────────────────────────────────────────
#define HISTORY_DAYS 30
#define FEATURES_PER_DAY 16  // Daily aggregates

typedef struct {
    uint32_t timestamp;
    float features[FEATURES_PER_DAY];
    float health_index;
    float rul_estimate;
} DailyRecord;

DailyRecord history[HISTORY_DAYS];
int history_index = 0;

void store_daily_record(DailyRecord* record) {
    memcpy(&history[history_index], record, sizeof(DailyRecord));
    history_index = (history_index + 1) % HISTORY_DAYS;

    // Persist to flash periodically
    if (should_persist()) {
        flash_write(HISTORY_ADDR, history, sizeof(history));
    }
}
```

### 7.2 Fleet Data Collection

```
FLEET DATA COLLECTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Data Flow:
────────────────────────────────────────────
EK3 Module → CAN-FD → Station Controller → Cloud

CAN Message Format:
────────────────────────────────────────────
// Periodic health report (1 Hz)
typedef struct {
    uint8_t module_id;
    uint8_t health_index;     // 0-100
    uint16_t rul_hours;       // Predicted RUL
    uint8_t anomaly_flags;    // Bit flags
    uint8_t temperature;      // Max temp (scaled)
    uint16_t esr_mohm;        // ESR in 0.1 mΩ
} HealthReport;  // 8 bytes, fits single CAN-FD frame

// Detailed report (daily, for federated learning)
typedef struct {
    uint8_t module_id;
    uint8_t day_of_year;
    float features[16];       // Daily aggregates
    float labels[2];          // HI, RUL
} DetailedReport;  // 76 bytes, 2 CAN-FD frames

Cloud Data Schema:
────────────────────────────────────────────
CREATE TABLE module_telemetry (
    module_id UUID,
    timestamp TIMESTAMPTZ,
    health_index FLOAT,
    rul_hours INT,
    anomaly_flags INT,
    features JSONB,
    PRIMARY KEY (module_id, timestamp)
);

-- Partitioned by time for efficient queries
```

---

## 8. Data Quality

### 8.1 Anomaly Detection in Pipeline

```
DATA QUALITY CHECKS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Range Checks:
────────────────────────────────────────────
bool validate_sensor(float value, float min, float max) {
    return value >= min && value <= max && !isnan(value);
}

// Per-sensor bounds
const SensorBounds bounds[] = {
    {0, 900},     // V_in
    {0, 900},     // V_out
    {0, 50},      // I_in
    {0, 50},      // I_out
    {-40, 150},   // T_mosfet
    ...
};

Rate of Change Checks:
────────────────────────────────────────────
bool validate_rate(float current, float previous, float max_rate) {
    return fabs(current - previous) <= max_rate;
}

// Max rate per sensor (per sample period)
const float max_rates[] = {
    10.0,    // V_in: 10V per 10ms
    10.0,    // V_out
    5.0,     // I_in: 5A per 10ms
    5.0,     // I_out
    1.0,     // T_mosfet: 1°C per 100ms
    ...
};

Consistency Checks:
────────────────────────────────────────────
bool validate_consistency(SensorData* data) {
    // Power conservation
    float P_loss = data->P_in - data->P_out;
    if (P_loss < 0 || P_loss > 0.2 * data->P_in) {
        return false;
    }

    // Thermal consistency
    if (data->T_mosfet < data->T_ambient) {
        return false;  // Impossible under load
    }

    return true;
}
```

### 8.2 Missing Data Handling

```
MISSING DATA STRATEGIES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Strategy 1: Last Value Imputation
────────────────────────────────────────────
float impute_last(float current, float last_valid, bool is_valid) {
    return is_valid ? current : last_valid;
}

Strategy 2: Linear Interpolation
────────────────────────────────────────────
// For short gaps (< 1 second)
float interpolate(float before, float after, float t) {
    return before + t * (after - before);
}

Strategy 3: Model-Based Imputation
────────────────────────────────────────────
// Use related sensors to estimate missing value
float impute_T_cap(SensorData* data) {
    // T_cap correlates with T_ambient and power
    return data->T_ambient + 0.1 * data->P_out;
}

Strategy 4: Flag and Skip
────────────────────────────────────────────
// Mark sample as invalid, don't use for inference
data->valid = false;
inference_skip_count++;
```

---

## 9. Dataset Specifications

### 9.1 Training Dataset Requirements

```
TRAINING DATASET:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Minimum Requirements:
────────────────────────────────────────────
• Modules: ≥ 50 (for diversity)
• Duration: ≥ 6 months per module
• Run-to-failure: ≥ 10 complete cycles
• Operating conditions: Various loads, temperatures

Recommended:
────────────────────────────────────────────
• Modules: 200+
• Duration: 2+ years
• Run-to-failure: 50+ cycles
• Accelerated aging tests included

Data Split:
────────────────────────────────────────────
• Training: 70%
• Validation: 15%
• Test: 15%

Split by module (not by time) to prevent leakage
```

### 9.2 Benchmark Dataset Format

```
BENCHMARK DATASET STRUCTURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Directory Structure:
────────────────────────────────────────────
ek3_pm_dataset/
├── raw/
│   ├── module_001/
│   │   ├── sensor_data.parquet
│   │   ├── events.json
│   │   └── metadata.json
│   ├── module_002/
│   └── ...
├── processed/
│   ├── train.parquet
│   ├── val.parquet
│   └── test.parquet
├── labels/
│   ├── rul_labels.parquet
│   └── health_labels.parquet
└── README.md

Parquet Schema:
────────────────────────────────────────────
sensor_data.parquet:
  - timestamp: datetime64[ns]
  - module_id: string
  - V_in: float32
  - V_out: float32
  - I_in: float32
  - I_out: float32
  - T_mosfet: float32
  - T_capacitor: float32
  - ... (16 features total)

rul_labels.parquet:
  - timestamp: datetime64[ns]
  - module_id: string
  - rul_hours: float32
  - health_index: float32
  - failure_mode: string (nullable)
```

---

## Related Documents

- `01-problem-formulation.md` - Problem definition
- `02-tinyml-constraints.md` - Hardware constraints
- `03-algorithms.md` - ML algorithms
- `05-literature.md` - Dataset references
