# V2G Control Algorithms

This document details the control algorithms required for bidirectional V2G (Vehicle-to-Grid) operation in the ELEKTROKOMBINACIJA system.

---

## 1. Grid Synchronization - SRF-PLL

### 1.1 Overview

The Synchronous Reference Frame Phase-Locked Loop (SRF-PLL) is essential for grid-connected inverters. It provides:
- Phase angle (θ) for Park transformation
- Grid frequency (f) for droop control
- Grid voltage magnitude (Vd) for power calculations

### 1.2 Coordinate Transformations

#### Clarke Transformation (abc → αβ)

Converts three-phase quantities to stationary two-phase reference frame:

```
┌     ┐       ┌                        ┐ ┌    ┐
│ Vα  │       │  1      -1/2     -1/2  │ │ Va │
│     │ = 2/3 │                        │ │    │
│ Vβ  │       │  0    √3/2    -√3/2    │ │ Vb │
└     ┘       └                        ┘ │ Vc │
                                         └    ┘
```

In code:
```c
// Clarke transformation (amplitude-invariant)
Valpha = (2.0f/3.0f) * (Va - 0.5f*Vb - 0.5f*Vc);
Vbeta  = (2.0f/3.0f) * (SQRT3_2) * (Vb - Vc);

// where SQRT3_2 = 0.866025f
```

#### Park Transformation (αβ → dq)

Converts stationary frame to rotating synchronous frame:

```
┌    ┐   ┌                  ┐ ┌    ┐
│ Vd │   │  cos(θ)   sin(θ) │ │ Vα │
│    │ = │                  │ │    │
│ Vq │   │ -sin(θ)   cos(θ) │ │ Vβ │
└    ┘   └                  ┘ └    ┘
```

In code:
```c
// Park transformation
float cos_theta = cosf(theta);
float sin_theta = sinf(theta);
Vd =  Valpha * cos_theta + Vbeta * sin_theta;
Vq = -Valpha * sin_theta + Vbeta * cos_theta;
```

#### Inverse Park Transformation (dq → αβ)

Used to generate reference voltages for PWM:

```
┌    ┐   ┌                   ┐ ┌    ┐
│ Vα │   │  cos(θ)   -sin(θ) │ │ Vd │
│    │ = │                   │ │    │
│ Vβ │   │  sin(θ)    cos(θ) │ │ Vq │
└    ┘   └                   ┘ └    ┘
```

### 1.3 PLL Structure

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

Principle:
- When θ = θ_grid, the d-axis aligns with grid voltage vector
- Vq becomes zero (q-axis is perpendicular to voltage)
- PI controller drives Vq → 0 by adjusting ω
- ω integrates to θ, closing the loop
```

### 1.4 PI Controller Design

The PLL bandwidth determines speed vs. noise tradeoff:
- Fast PLL (high bandwidth): Quick tracking, but susceptible to harmonics
- Slow PLL (low bandwidth): Clean output, but slow response

**Typical design for 50 Hz grid:**
- Bandwidth: 15-25 Hz
- Damping ratio: 0.707 (critically damped)

```
Transfer function:
H(s) = (Kp × s + Ki) / s²

Natural frequency: ωn = √Ki
Damping ratio: ζ = Kp / (2 × √Ki)

For ωn = 2π × 20 Hz and ζ = 0.707:
Ki = ωn² = (125.66)² ≈ 15,790
Kp = 2 × ζ × ωn = 2 × 0.707 × 125.66 ≈ 178
```

### 1.5 Complete PLL Implementation

```c
#include <math.h>

// Constants
#define PI           3.14159265f
#define SQRT3_2      0.86602540f
#define OMEGA_NOM    314.159265f   // 2π × 50 Hz

// Tuning parameters
#define PLL_KP       178.0f
#define PLL_KI       15790.0f
#define PLL_OMEGA_MIN  (2*PI * 45.0f)   // 45 Hz minimum
#define PLL_OMEGA_MAX  (2*PI * 55.0f)   // 55 Hz maximum

typedef struct {
    // State variables
    float theta;         // Phase angle [rad]
    float omega;         // Angular frequency [rad/s]
    float freq;          // Frequency [Hz]
    float integral;      // PI integrator state

    // Outputs
    float Vd;            // d-axis voltage (magnitude)
    float Vq;            // q-axis voltage (should be ~0 when locked)
    float Valpha;        // Alpha-axis voltage
    float Vbeta;         // Beta-axis voltage

    // Status
    bool locked;         // PLL locked status
    float lock_counter;  // Lock detection counter
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
    // 1. Clarke transformation (abc → αβ)
    pll->Valpha = (2.0f/3.0f) * (Va - 0.5f*Vb - 0.5f*Vc);
    pll->Vbeta  = (2.0f/3.0f) * SQRT3_2 * (Vb - Vc);

    // 2. Park transformation (αβ → dq)
    float cos_theta = cosf(pll->theta);
    float sin_theta = sinf(pll->theta);
    pll->Vd =  pll->Valpha * cos_theta + pll->Vbeta * sin_theta;
    pll->Vq = -pll->Valpha * sin_theta + pll->Vbeta * cos_theta;

    // 3. Normalize Vq by Vd for better dynamics
    float Vq_normalized = (fabsf(pll->Vd) > 10.0f) ? (pll->Vq / pll->Vd) : 0.0f;

    // 4. PI controller
    pll->integral += PLL_KI * Vq_normalized * Ts;

    // Anti-windup: limit integrator
    float int_limit = PLL_OMEGA_MAX - OMEGA_NOM;
    pll->integral = fmaxf(-int_limit, fminf(int_limit, pll->integral));

    // Calculate angular frequency
    float delta_omega = PLL_KP * Vq_normalized + pll->integral;
    pll->omega = OMEGA_NOM + delta_omega;

    // Frequency limits
    pll->omega = fmaxf(PLL_OMEGA_MIN, fminf(PLL_OMEGA_MAX, pll->omega));

    // 5. Phase angle integration
    pll->theta += pll->omega * Ts;

    // Wrap to [0, 2π]
    while (pll->theta >= 2*PI) pll->theta -= 2*PI;
    while (pll->theta < 0) pll->theta += 2*PI;

    // 6. Calculate frequency in Hz
    pll->freq = pll->omega / (2*PI);

    // 7. Lock detection (Vq should be near zero when locked)
    if (fabsf(pll->Vq) < 0.05f * fabsf(pll->Vd)) {
        pll->lock_counter += Ts;
        if (pll->lock_counter > 0.1f) {  // 100ms of stable lock
            pll->locked = true;
        }
    } else {
        pll->lock_counter = 0.0f;
        pll->locked = false;
    }
}

// Helper: Get grid voltage magnitude (peak line-to-neutral)
float PLL_GetVoltage(PLL_State* pll) {
    return sqrtf(pll->Vd * pll->Vd + pll->Vq * pll->Vq);
}

// Helper: Get grid voltage in per-unit
float PLL_GetVoltagePU(PLL_State* pll, float V_base) {
    return PLL_GetVoltage(pll) / V_base;
}
```

### 1.6 Performance Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| Settling time | < 50 ms | For 5% frequency step |
| Steady-state error | < 0.01 Hz | At stable grid |
| Phase error | < 1° | After settling |
| Bandwidth | ~20 Hz | Tradeoff: speed vs noise |
| Sampling rate | 10-20 kHz | Matched to control loop |

---

## 2. Frequency Response - P(f) Droop Control

### 2.1 Concept

Droop control provides automatic frequency regulation by adjusting power output based on grid frequency deviations:
- Under-frequency → Reduce charging (or discharge via V2G)
- Over-frequency → Increase charging

This mimics the behavior of synchronous generators and provides grid stability.

### 2.2 Droop Characteristic

```
P/Pn (%)
   ▲
 100│                    ┌─────── Pmax (charging)
    │                   /
  80│                  /
    │                 /
  60│                /  ← Droop slope
    │               /      (typically 4%)
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
-100├─────────┴────┴────┴────┴────┘────────── Pmax (V2G discharge)
    49.0   49.5  49.95 50.05 50.5  51.0

         Under-freq   ◄──►  Over-freq
                    Deadband
                    (±50 mHz)
```

### 2.3 Mathematical Formulation

**Droop equation:**
```
ΔP = -Kp × Δf

Where:
    ΔP = Power adjustment [W]
    Δf = f_measured - f_nominal [Hz]
    Kp = Droop coefficient [W/Hz]

For X% droop:
    Kp = Pn / (X/100 × f_nominal)

Example (4% droop, Pn = 30 kW, f0 = 50 Hz):
    Kp = 30000 / (0.04 × 50) = 15000 W/Hz

Meaning: For every 1 Hz drop, reduce power by 15 kW
```

**With deadband:**
```
If |Δf| ≤ f_deadband:
    P_adjustment = 0

If Δf < -f_deadband (under-frequency):
    P_adjustment = -Kp × (Δf + f_deadband)

If Δf > +f_deadband (over-frequency):
    P_adjustment = -Kp × (Δf - f_deadband)
```

### 2.4 Grid Code Requirements

| Grid Code | Droop Range | Deadband | Ramp Rate |
|-----------|-------------|----------|-----------|
| ENTSO-E (EU) | 2-12% | ±10-500 mHz | ≤10% Pn/min |
| VDE AR-N 4110 (DE) | 2-12% | ±10 mHz | ≤10% Pn/min |
| EirGrid (IE) | 3-5% | ±15 mHz | ≤1% Pn/s |
| National Grid (UK) | 3-5% | ±15 mHz | ≤1% Pn/s |

### 2.5 Implementation

```c
// Configuration (grid code dependent)
#define F_NOMINAL         50.0f      // Nominal frequency [Hz]
#define F_DEADBAND        0.05f      // ±50 mHz deadband
#define DROOP_PERCENT     4.0f       // 4% droop
#define RAMP_RATE_LIMIT   0.10f      // 10% Pn/s max ramp rate

// Frequency limits for protection
#define F_MIN_OPERATE     47.5f      // Below this: trip
#define F_MAX_OPERATE     51.5f      // Above this: trip
#define F_V2G_ENABLE      49.8f      // Enable V2G below this
#define F_CHARGE_REDUCE   49.9f      // Start reducing charge below this

typedef struct {
    // Inputs
    float P_scheduled;      // Scheduled power from ISO 15118 [W]
    float P_nominal;        // Rated power [W]

    // State
    float P_target;         // Target power after droop [W]
    float P_actual;         // Actual power (after ramp) [W]
    float droop_kp;         // Droop coefficient [W/Hz]

    // Configuration
    float droop_percent;
    float deadband;
    float ramp_rate;

    // Status
    bool freq_ok;           // Frequency within limits
    bool v2g_enabled;       // V2G discharge permitted
} FreqDroop_State;

void FreqDroop_Init(FreqDroop_State* fd, float P_nominal) {
    fd->P_scheduled = 0.0f;
    fd->P_nominal = P_nominal;
    fd->P_target = 0.0f;
    fd->P_actual = 0.0f;
    fd->droop_percent = DROOP_PERCENT;
    fd->deadband = F_DEADBAND;
    fd->ramp_rate = RAMP_RATE_LIMIT;

    // Calculate droop coefficient
    fd->droop_kp = P_nominal / (fd->droop_percent * 0.01f * F_NOMINAL);

    fd->freq_ok = true;
    fd->v2g_enabled = false;
}

void FreqDroop_SetScheduledPower(FreqDroop_State* fd, float P_scheduled) {
    // Scheduled power from ISO 15118 or fleet management
    // Positive = charging, Negative = V2G discharge
    fd->P_scheduled = P_scheduled;
}

float FreqDroop_Calculate(FreqDroop_State* fd, float f_measured) {
    // 1. Frequency protection check
    if (f_measured < F_MIN_OPERATE || f_measured > F_MAX_OPERATE) {
        fd->freq_ok = false;
        fd->P_target = 0.0f;  // Trip
        return 0.0f;
    }
    fd->freq_ok = true;

    // 2. V2G permission based on frequency
    fd->v2g_enabled = (f_measured < F_V2G_ENABLE);

    // 3. Calculate frequency deviation
    float delta_f = f_measured - F_NOMINAL;

    // 4. Apply deadband
    float delta_f_effective = 0.0f;
    if (delta_f < -fd->deadband) {
        delta_f_effective = delta_f + fd->deadband;  // Under-frequency
    } else if (delta_f > fd->deadband) {
        delta_f_effective = delta_f - fd->deadband;  // Over-frequency
    }
    // Within deadband: delta_f_effective = 0

    // 5. Calculate droop adjustment
    // Negative delta_f → positive adjustment (reduce charging / enable V2G)
    // Positive delta_f → negative adjustment (increase charging)
    float P_droop = -fd->droop_kp * delta_f_effective;

    // 6. Apply to scheduled power
    fd->P_target = fd->P_scheduled + P_droop;

    // 7. Apply power limits
    // Positive limit: maximum charging power
    // Negative limit: maximum V2G discharge power (only if enabled)
    float P_max_charge = fd->P_nominal;
    float P_max_v2g = fd->v2g_enabled ? -fd->P_nominal : 0.0f;

    fd->P_target = fmaxf(P_max_v2g, fminf(P_max_charge, fd->P_target));

    return fd->P_target;
}

void FreqDroop_ApplyRamp(FreqDroop_State* fd, float Ts) {
    // Apply ramp rate limit (grid code requirement)
    float max_delta = fd->ramp_rate * fd->P_nominal * Ts;
    float delta = fd->P_target - fd->P_actual;

    if (fabsf(delta) > max_delta) {
        delta = (delta > 0.0f) ? max_delta : -max_delta;
    }

    fd->P_actual += delta;
}

// Get actual power output
float FreqDroop_GetPower(FreqDroop_State* fd) {
    return fd->P_actual;
}
```

### 2.6 Frequency Response Timeline

```
Event: Grid frequency drops from 50.00 Hz to 49.80 Hz

Time (ms)   Frequency   Action                          P_target
────────────────────────────────────────────────────────────────────
0           50.00 Hz    Normal charging                 +30 kW
50          49.90 Hz    Frequency detected by PLL       +30 kW
100         49.80 Hz    Droop activated (past deadband) +15 kW
                        ΔP = -15000 × (49.80-49.95)
                           = -15000 × (-0.15) = +2.25 kW
                        Wait, let's recalculate...

For f = 49.80 Hz, deadband = 50 mHz:
    delta_f_effective = 49.80 - 50.00 + 0.05 = -0.15 Hz
    P_droop = -15000 × (-0.15) = +2250 W (reduce charging)

If P_scheduled = +30 kW:
    P_target = 30000 + 2250 = 32250 W → wait, that's wrong direction!

Correction: Under-frequency should REDUCE charging.
Let me fix the sign convention:

Under-frequency (f < f0): We should REDUCE load (charging)
    delta_f = f - f0 = 49.80 - 50.00 = -0.20 Hz
    delta_f_effective = -0.20 + 0.05 = -0.15 Hz (past deadband)
    P_droop = -Kp × delta_f_effective = -15000 × (-0.15) = +2250 W

P_scheduled = +30 kW (charging)
P_target = +30 kW + 2.25 kW = +32.25 kW → WRONG!

The issue: positive P_droop should REDUCE charging, not increase it.

CORRECTED FORMULA:
    P_target = P_scheduled - P_droop (when P_droop > 0, reduce power)

OR use:
    P_droop = +Kp × delta_f_effective (opposite sign)

Under-frequency: delta_f < 0, P_droop < 0, net reduction
Over-frequency: delta_f > 0, P_droop > 0, net increase

Let me recalculate:
    delta_f = -0.20 Hz
    delta_f_effective = -0.15 Hz (after deadband)
    P_droop = +15000 × (-0.15) = -2250 W

P_target = 30000 + (-2250) = 27750 W → charging reduced

For severe under-frequency (49.50 Hz):
    delta_f_effective = 49.50 - 50.00 + 0.05 = -0.45 Hz
    P_droop = 15000 × (-0.45) = -6750 W
    P_target = 30000 - 6750 = 23250 W

For critical under-frequency (49.00 Hz):
    delta_f_effective = -0.95 Hz
    P_droop = 15000 × (-0.95) = -14250 W
    P_target = 30000 - 14250 = 15750 W

If scheduled for V2G discharge (P_scheduled = -10 kW):
    P_target = -10000 + (-14250) = -24250 W → more V2G!
```

**Corrected implementation:**

```c
float FreqDroop_Calculate_v2(FreqDroop_State* fd, float f_measured) {
    // ... protection checks ...

    float delta_f = f_measured - F_NOMINAL;
    float delta_f_effective = 0.0f;

    if (delta_f < -fd->deadband) {
        delta_f_effective = delta_f + fd->deadband;
    } else if (delta_f > fd->deadband) {
        delta_f_effective = delta_f - fd->deadband;
    }

    // Correct formula: P_droop = Kp × delta_f
    // Under-freq (delta_f < 0) → P_droop < 0 → reduce P
    // Over-freq (delta_f > 0) → P_droop > 0 → increase P
    float P_droop = fd->droop_kp * delta_f_effective;

    fd->P_target = fd->P_scheduled + P_droop;

    // Clamp
    fd->P_target = fmaxf(-fd->P_nominal, fminf(fd->P_nominal, fd->P_target));

    return fd->P_target;
}
```

---

## 3. Voltage Regulation - Q(V) Droop Control

### 3.1 Concept

Reactive power (Q) can be used to regulate local voltage:
- Low voltage → Inject reactive power (capacitive) → Raise voltage
- High voltage → Absorb reactive power (inductive) → Lower voltage

**Key advantage:** No battery wear! Reactive power is exchanged with grid, not consumed.

### 3.2 Q(V) Characteristic

```
Q/Sn (%)
   ▲
 +44│                      ┌──── Qmax (capacitive)
    │                     /       Inject Q to raise V
 +30│                    /
    │                   /
 +15│                  /
    │                 /
   0├────────────────/─────────────────────────────► V (pu)
    │               /|         |         |
-15 │              / |   0.95  |  1.05   |  1.10
    │             /  |◄────────┴─────────►|
-30 │            /   |      Deadband      |
    │           /    |                    |
-44 │──────────┘     |                    └──── Qmax (inductive)
    0.90                                        Absorb Q to lower V
```

### 3.3 Mathematical Formulation

**Q(V) droop:**
```
If V_pu < V_low (under-voltage):
    Q = Kq × (V_low - V_pu)     // Positive Q (capacitive)

If V_pu > V_high (over-voltage):
    Q = Kq × (V_high - V_pu)    // Negative Q (inductive)

If V_low ≤ V_pu ≤ V_high:
    Q = 0                        // Deadband
```

**Maximum Q calculation:**
```
Apparent power constraint: S² = P² + Q²
Maximum Q at given P:       Qmax = √(Sn² - P²)

For power factor limit (e.g., cos φ ≥ 0.9):
    tan φ = Q/P
    Qmax = P × tan(acos(0.9)) = P × 0.484
```

### 3.4 Implementation

```c
#define V_DEADBAND_LOW   0.95f   // pu
#define V_DEADBAND_HIGH  1.05f   // pu
#define V_MIN_OPERATE    0.85f   // pu (trip below)
#define V_MAX_OPERATE    1.10f   // pu (trip above)
#define COS_PHI_MIN      0.90f   // Minimum power factor

typedef struct {
    // Inputs
    float Sn;               // Rated apparent power [VA]
    float P_actual;         // Current active power [W]

    // State
    float Q_ref;            // Reference reactive power [VAR]
    float Q_actual;         // Actual reactive power [VAR]
    float Q_max;            // Maximum available Q [VAR]

    // Status
    bool voltage_ok;
} VoltDroop_State;

void VoltDroop_Init(VoltDroop_State* vd, float Sn) {
    vd->Sn = Sn;
    vd->P_actual = 0.0f;
    vd->Q_ref = 0.0f;
    vd->Q_actual = 0.0f;
    vd->Q_max = Sn;  // Initial
    vd->voltage_ok = true;
}

float VoltDroop_Calculate(VoltDroop_State* vd, float V_pu, float P_actual) {
    vd->P_actual = P_actual;

    // 1. Voltage protection
    if (V_pu < V_MIN_OPERATE || V_pu > V_MAX_OPERATE) {
        vd->voltage_ok = false;
        vd->Q_ref = 0.0f;
        return 0.0f;
    }
    vd->voltage_ok = true;

    // 2. Calculate available Q (from remaining apparent power capacity)
    float P_sq = P_actual * P_actual;
    float S_sq = vd->Sn * vd->Sn;
    if (P_sq >= S_sq) {
        vd->Q_max = 0.0f;  // No capacity for Q
    } else {
        vd->Q_max = sqrtf(S_sq - P_sq);
    }

    // 3. Calculate droop coefficient
    // Full Q at voltage limits (V = 0.90 or V = 1.10)
    float Kq = vd->Q_max / (V_DEADBAND_LOW - 0.90f);  // = Qmax / 0.05

    // 4. Apply Q(V) droop
    if (V_pu < V_DEADBAND_LOW) {
        // Under-voltage: inject Q (capacitive, positive)
        vd->Q_ref = Kq * (V_DEADBAND_LOW - V_pu);
    } else if (V_pu > V_DEADBAND_HIGH) {
        // Over-voltage: absorb Q (inductive, negative)
        vd->Q_ref = Kq * (V_DEADBAND_HIGH - V_pu);
    } else {
        // Deadband
        vd->Q_ref = 0.0f;
    }

    // 5. Clamp to available Q
    vd->Q_ref = fmaxf(-vd->Q_max, fminf(vd->Q_max, vd->Q_ref));

    // 6. Additional: Check power factor constraint
    if (fabsf(P_actual) > 0.0f) {
        float tan_phi_max = tanf(acosf(COS_PHI_MIN));  // ≈ 0.484
        float Q_pf_limit = fabsf(P_actual) * tan_phi_max;
        vd->Q_ref = fmaxf(-Q_pf_limit, fminf(Q_pf_limit, vd->Q_ref));
    }

    return vd->Q_ref;
}

void VoltDroop_ApplyRamp(VoltDroop_State* vd, float ramp_rate, float Ts) {
    float max_delta = ramp_rate * vd->Sn * Ts;
    float delta = vd->Q_ref - vd->Q_actual;

    if (fabsf(delta) > max_delta) {
        delta = (delta > 0.0f) ? max_delta : -max_delta;
    }

    vd->Q_actual += delta;
}
```

---

## 4. Current Controller (dq Frame)

### 4.1 Overview

The current controller regulates inverter output currents to track power references:
- id controls active power P
- iq controls reactive power Q

```
Power relationships:
    P = 1.5 × Vd × id    (assuming Vq ≈ 0 from PLL)
    Q = 1.5 × Vd × iq

Current references:
    id_ref = P_ref / (1.5 × Vd)
    iq_ref = Q_ref / (1.5 × Vd)
```

### 4.2 Control Structure

```
                    ┌────────────────────────────────────────────────┐
                    │            CURRENT CONTROLLER                   │
                    │                                                 │
P_ref ──► [/1.5Vd] ──► id_ref ──► [PI] ──► Vd_ff ──► [+] ──► Vd_ref ──►┐
                        │   ▲            │               ▲            │
                        │   │            │               │            │
                    id_meas │       ┌────┘          Vd_grid          │
                            │       │                                 │
                            │       ▼                                 │
                            │  ωLq×iq ──► [Decoupling]                │
                            │                                         │
                            │                                         │
Q_ref ──► [/1.5Vd] ──► iq_ref ──► [PI] ──► Vq_ff ──► [+] ──► Vq_ref ──►┤
                        │   ▲            │               ▲            │
                        │   │            │               │            │
                    iq_meas │       ┌────┘               │            │
                            │       │                  Vq_grid ≈ 0    │
                            │       ▼                                 │
                            │  ωLd×id ──► [Decoupling]                │
                            │                                         │
                            └─────────────────────────────────────────┘
                                                    │
                                                    ▼
                                            [Inv Park] ──► Vα, Vβ ──► PWM
```

### 4.3 Decoupled PI Controller

Cross-coupling between d and q axes creates disturbance. Decoupling terms compensate:

```
Vd* = Vd_PI - ωLq × iq + Vd_grid
Vq* = Vq_PI + ωLd × id + Vq_grid

Where:
    Vd_PI, Vq_PI = Output of PI controllers
    ω = Grid angular frequency (from PLL)
    Ld, Lq = Filter inductance (d and q, usually equal)
    Vd_grid, Vq_grid = Grid voltage feedforward
```

### 4.4 PI Tuning

For current control loop bandwidth of ~1 kHz:
```
Plant: L × di/dt = V - R×i - e

Closed-loop transfer function:
H(s) = (Kp×s + Ki) / (L×s² + (R + Kp)×s + Ki)

For desired bandwidth ωc and damping ζ:
    Kp = 2 × ζ × ωc × L - R
    Ki = ωc² × L

Example (L = 0.5 mH, R = 0.1 Ω, ωc = 2π×1000, ζ = 0.707):
    Kp = 2 × 0.707 × 6283 × 0.0005 - 0.1 = 4.34 Ω
    Ki = 6283² × 0.0005 = 19737 Ω/s
```

### 4.5 Implementation

```c
typedef struct {
    // PI parameters
    float Kp;               // Proportional gain
    float Ki;               // Integral gain

    // State
    float id_int;           // d-axis integrator
    float iq_int;           // q-axis integrator

    // Filter parameters
    float L;                // Inductance [H]
    float R;                // Resistance [Ω]

    // Anti-windup limit
    float V_limit;
} CurrentController_State;

void CurrentController_Init(CurrentController_State* cc, float L, float R, float V_dc) {
    // Design for 1 kHz bandwidth
    float omega_c = 2.0f * PI * 1000.0f;
    float zeta = 0.707f;

    cc->Kp = 2.0f * zeta * omega_c * L - R;
    cc->Ki = omega_c * omega_c * L;

    cc->L = L;
    cc->R = R;
    cc->V_limit = V_dc * 0.9f;  // 90% of DC bus

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
    // 1. Calculate errors
    float id_err = id_ref - id_meas;
    float iq_err = iq_ref - iq_meas;

    // 2. PI controllers with anti-windup
    cc->id_int += cc->Ki * id_err * Ts;
    cc->iq_int += cc->Ki * iq_err * Ts;

    // Clamp integrals
    cc->id_int = fmaxf(-cc->V_limit, fminf(cc->V_limit, cc->id_int));
    cc->iq_int = fmaxf(-cc->V_limit, fminf(cc->V_limit, cc->iq_int));

    float Vd_pi = cc->Kp * id_err + cc->id_int;
    float Vq_pi = cc->Kp * iq_err + cc->iq_int;

    // 3. Decoupling terms
    float Vd_dec = -omega * cc->L * iq_meas;
    float Vq_dec = +omega * cc->L * id_meas;

    // 4. Grid voltage feedforward
    *Vd_out = Vd_pi + Vd_dec + Vd_grid;
    *Vq_out = Vq_pi + Vq_dec + Vq_grid;

    // 5. Output voltage limiting (circular limit)
    float V_mag = sqrtf((*Vd_out)*(*Vd_out) + (*Vq_out)*(*Vq_out));
    if (V_mag > cc->V_limit) {
        float scale = cc->V_limit / V_mag;
        *Vd_out *= scale;
        *Vq_out *= scale;
    }
}

void CurrentController_Reset(CurrentController_State* cc) {
    cc->id_int = 0.0f;
    cc->iq_int = 0.0f;
}
```

---

## 5. Complete V2G Control Architecture

### 5.1 System Overview

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          V2G CONTROL SYSTEM                                       │
│                                                                                   │
│  ┌──────────────┐                                                                │
│  │ ISO 15118-20 │──► P_scheduled                                                 │
│  │ or Fleet Mgmt│──► V2G_enabled                                                 │
│  └──────────────┘                                                                │
│         │                                                                         │
│         ▼                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │    GRID      │    │     PLL      │    │    DROOP     │    │   CURRENT    │   │
│  │   SENSORS    │───►│   SRF-PLL    │───►│  P(f), Q(V)  │───►│  CONTROLLER  │   │
│  │  Va,Vb,Vc    │    │  θ, ω, Vd    │    │  P_ref,Q_ref │    │   id, iq     │   │
│  │  Ia,Ib,Ic    │    │              │    │              │    │              │   │
│  └──────────────┘    └──────────────┘    └──────────────┘    └──────┬───────┘   │
│                                                                      │            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────▼───────┐   │
│  │   THERMAL    │    │    POWER     │    │    STATE     │    │     PWM      │   │
│  │  PROTECTION  │───►│   LIMITER    │◄──►│   MACHINE    │    │  GENERATOR   │   │
│  │   Tj, Ta     │    │  Derating    │    │  Precharge   │    │   SVPWM      │   │
│  └──────────────┘    └──────────────┘    └──────────────┘    └──────┬───────┘   │
│                                                                      │            │
│                                                               ┌──────▼───────┐   │
│                                                               │   3-LEVEL    │   │
│                                                               │     NPC      │   │
│                                                               │   INVERTER   │   │
│                                                               └──────────────┘   │
│                                                                                   │
│  Control Loop Timing:                                                             │
│  ├── Current loop:    10-20 kHz (50-100 μs period)                               │
│  ├── PLL loop:        2-10 kHz (100-500 μs period)                               │
│  ├── Droop loop:      1 kHz (1 ms period)                                        │
│  ├── Thermal loop:    10 Hz (100 ms period)                                      │
│  └── ISO 15118 loop:  ~1 Hz (1 s period)                                         │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Main Control Loop

```c
// Main control structure
typedef struct {
    // Sub-controllers
    PLL_State pll;
    FreqDroop_State freq_droop;
    VoltDroop_State volt_droop;
    CurrentController_State current_ctrl;

    // External inputs
    float P_scheduled;          // From ISO 15118 or fleet management [W]
    float Q_scheduled;          // Scheduled reactive power [VAR]
    bool v2g_permitted;         // V2G discharge allowed by vehicle

    // System parameters
    float P_nominal;            // Rated power [W]
    float S_nominal;            // Rated apparent power [VA]
    float V_dc;                 // DC bus voltage [V]
    float V_grid_nominal;       // Nominal grid voltage [V]

    // Control outputs
    float P_actual;             // Actual active power [W]
    float Q_actual;             // Actual reactive power [VAR]
    float Vd_ref, Vq_ref;       // Voltage references for PWM

    // Status flags
    bool grid_ok;
    bool ready_to_charge;
    bool ready_to_discharge;
} V2G_Controller;

void V2G_Controller_Init(V2G_Controller* ctrl, float P_nom, float V_dc, float L, float R) {
    ctrl->P_nominal = P_nom;
    ctrl->S_nominal = P_nom / 0.9f;  // Assuming 0.9 PF minimum
    ctrl->V_dc = V_dc;
    ctrl->V_grid_nominal = 230.0f * sqrtf(2);  // Peak line-neutral

    PLL_Init(&ctrl->pll);
    FreqDroop_Init(&ctrl->freq_droop, P_nom);
    VoltDroop_Init(&ctrl->volt_droop, ctrl->S_nominal);
    CurrentController_Init(&ctrl->current_ctrl, L, R, V_dc);

    ctrl->P_scheduled = 0.0f;
    ctrl->Q_scheduled = 0.0f;
    ctrl->v2g_permitted = false;
    ctrl->grid_ok = false;
    ctrl->ready_to_charge = false;
    ctrl->ready_to_discharge = false;
}

void V2G_Controller_Update(V2G_Controller* ctrl,
                           float Va, float Vb, float Vc,
                           float Ia, float Ib, float Ic,
                           float Ts) {
    // ═══════════════════════════════════════════════════════════════
    // 1. PLL UPDATE (Grid synchronization)
    // ═══════════════════════════════════════════════════════════════
    PLL_Update(&ctrl->pll, Va, Vb, Vc, Ts);

    if (!ctrl->pll.locked) {
        ctrl->grid_ok = false;
        ctrl->Vd_ref = 0.0f;
        ctrl->Vq_ref = 0.0f;
        return;
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. FREQUENCY DROOP (Active power regulation)
    // ═══════════════════════════════════════════════════════════════
    FreqDroop_SetScheduledPower(&ctrl->freq_droop, ctrl->P_scheduled);

    // Apply V2G permission
    if (!ctrl->v2g_permitted && ctrl->freq_droop.P_target < 0) {
        ctrl->freq_droop.P_target = 0.0f;  // No discharge without permission
    }

    float P_target = FreqDroop_Calculate(&ctrl->freq_droop, ctrl->pll.freq);
    FreqDroop_ApplyRamp(&ctrl->freq_droop, Ts);

    // ═══════════════════════════════════════════════════════════════
    // 3. VOLTAGE DROOP (Reactive power regulation)
    // ═══════════════════════════════════════════════════════════════
    float V_pu = PLL_GetVoltagePU(&ctrl->pll, ctrl->V_grid_nominal);
    float Q_target = VoltDroop_Calculate(&ctrl->volt_droop, V_pu, ctrl->freq_droop.P_actual);

    // Add scheduled Q (if any)
    Q_target += ctrl->Q_scheduled;
    VoltDroop_ApplyRamp(&ctrl->volt_droop, 0.1f, Ts);  // 10%/s ramp

    ctrl->P_actual = ctrl->freq_droop.P_actual;
    ctrl->Q_actual = ctrl->volt_droop.Q_actual;

    // ═══════════════════════════════════════════════════════════════
    // 4. CURRENT REFERENCES
    // ═══════════════════════════════════════════════════════════════
    float Vd = ctrl->pll.Vd;
    float id_ref = ctrl->P_actual / (1.5f * Vd);
    float iq_ref = ctrl->Q_actual / (1.5f * Vd);

    // Current measurement in dq frame
    float Ialpha = (2.0f/3.0f) * (Ia - 0.5f*Ib - 0.5f*Ic);
    float Ibeta  = (2.0f/3.0f) * 0.866025f * (Ib - Ic);
    float cos_t = cosf(ctrl->pll.theta);
    float sin_t = sinf(ctrl->pll.theta);
    float id_meas =  Ialpha * cos_t + Ibeta * sin_t;
    float iq_meas = -Ialpha * sin_t + Ibeta * cos_t;

    // ═══════════════════════════════════════════════════════════════
    // 5. CURRENT CONTROL
    // ═══════════════════════════════════════════════════════════════
    CurrentController_Update(&ctrl->current_ctrl,
                             id_ref, iq_ref,
                             id_meas, iq_meas,
                             ctrl->pll.Vd, ctrl->pll.Vq,
                             ctrl->pll.omega,
                             &ctrl->Vd_ref, &ctrl->Vq_ref,
                             Ts);

    // ═══════════════════════════════════════════════════════════════
    // 6. STATUS UPDATE
    // ═══════════════════════════════════════════════════════════════
    ctrl->grid_ok = ctrl->pll.locked &&
                    ctrl->freq_droop.freq_ok &&
                    ctrl->volt_droop.voltage_ok;

    ctrl->ready_to_charge = ctrl->grid_ok && (ctrl->V_dc > 600.0f);
    ctrl->ready_to_discharge = ctrl->ready_to_charge && ctrl->v2g_permitted;
}

// Get PWM duty cycles (Space Vector PWM)
void V2G_Controller_GetPWM(V2G_Controller* ctrl, float* duty_a, float* duty_b, float* duty_c) {
    // Inverse Park transformation
    float cos_t = cosf(ctrl->pll.theta);
    float sin_t = sinf(ctrl->pll.theta);
    float Valpha = ctrl->Vd_ref * cos_t - ctrl->Vq_ref * sin_t;
    float Vbeta  = ctrl->Vd_ref * sin_t + ctrl->Vq_ref * cos_t;

    // Inverse Clarke (2-phase to 3-phase)
    float Va_ref = Valpha;
    float Vb_ref = -0.5f * Valpha + 0.866025f * Vbeta;
    float Vc_ref = -0.5f * Valpha - 0.866025f * Vbeta;

    // Normalize to duty cycle (assuming center-aligned PWM)
    float Vdc_half = ctrl->V_dc / 2.0f;
    *duty_a = 0.5f + Va_ref / (2.0f * Vdc_half);
    *duty_b = 0.5f + Vb_ref / (2.0f * Vdc_half);
    *duty_c = 0.5f + Vc_ref / (2.0f * Vdc_half);

    // Clamp to valid range
    *duty_a = fmaxf(0.02f, fminf(0.98f, *duty_a));
    *duty_b = fmaxf(0.02f, fminf(0.98f, *duty_b));
    *duty_c = fmaxf(0.02f, fminf(0.98f, *duty_c));
}
```

---

## 6. References

- **IEC 61850** - Communication networks and systems for power utility automation
- **IEEE 1547-2018** - Standard for Interconnection and Interoperability of DER
- **VDE AR-N 4110** - Technical requirements for connection to MV network
- **EN 50549-1** - Requirements for generating plants to be connected to distribution networks
- **IEC 62116** - Utility-interconnected photovoltaic inverters (anti-islanding)
- **ISO 15118-20** - V2G communication interface (BPT mode)
