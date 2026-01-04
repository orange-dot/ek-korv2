# Termalno Upravljanje za EV Punjače

## 1. Termalni Zahtevi

### 1.1 Izvori Toplote

```
Distribucija Gubitaka u 150 kW DC Punjaču:

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Ukupni gubici @ 150 kW, η = 95%                               │
│  P_loss = 150 kW × (1 - 0.95) / 0.95 = 7.9 kW                  │
│                                                                 │
│  Distribucija:                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Komponenta           │ Gubici (W) │ % ukupnog │ Hlađenje │   │
│  ├──────────────────────┼────────────┼───────────┼──────────┤   │
│  │ PFC Stage (IGBT/SiC) │   2,400    │   30%     │ Liquid   │   │
│  │ DC/DC Stage (prim)   │   1,900    │   24%     │ Liquid   │   │
│  │ DC/DC Stage (sek)    │   1,100    │   14%     │ Liquid   │   │
│  │ Transformator        │     800    │   10%     │ Air/Oil  │   │
│  │ Induktori (PFC)      │     600    │    8%     │ Air      │   │
│  │ DC Link kondenzatori │     400    │    5%     │ Air      │   │
│  │ EMI Filter           │     300    │    4%     │ Air      │   │
│  │ Kablovi/Bus bar      │     200    │    2%     │ Air      │   │
│  │ Kontrolna elektronika│     200    │    3%     │ Air      │   │
│  ├──────────────────────┼────────────┼───────────┼──────────┤   │
│  │ UKUPNO               │   7,900    │  100%     │          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Kritične Temperature:

│ Komponenta        │ Tj_max   │ Derating Start │ Target Tj │
├───────────────────┼──────────┼────────────────┼───────────┤
│ Si IGBT           │ 150°C    │ 125°C          │ 100°C     │
│ SiC MOSFET        │ 175°C    │ 150°C          │ 125°C     │
│ Diode             │ 175°C    │ 150°C          │ 125°C     │
│ Ferrite core      │ 200°C    │ 140°C          │ 100°C     │
│ Litz wire (H)     │ 180°C    │ 155°C          │ 130°C     │
│ Film capacitor    │ 105°C    │ 85°C           │ 70°C      │
│ Electrolytic cap  │ 105°C    │ 85°C           │ 65°C      │
```

### 1.2 Ambient Conditions

```
Projektni Uslovi:

Indoor Installation:
- T_ambient: 0°C to +40°C (nominal)
- T_ambient: -10°C to +45°C (extended)
- Humidity: 20-80% RH, non-condensing
- Altitude: up to 1000m (derating above)

Outdoor Installation:
- T_ambient: -25°C to +50°C
- T_ambient: -40°C to +55°C (extreme)
- Direct sunlight: +15°C adder
- Humidity: 5-100% RH
- IP rating: IP54 minimum

Temperature Margin Calculation:

ΔT_allowed = Tj_max - T_ambient_max - T_margin

Za SiC @ outdoor:
ΔT_allowed = 175 - 55 - 20 = 100°C

Za Film Cap @ outdoor:
ΔT_allowed = 105 - 55 - 10 = 40°C

→ Film capacitors su termalno kritični!
```

## 2. Liquid Cooling System

### 2.1 Sistem Pregled

```
Liquid Cooling Loop:

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│      ┌────────────────────────────────────────────────────┐    │
│      │                                                    │    │
│      │    ┌─────────┐    ┌─────────┐    ┌─────────┐     │    │
│      │    │  PFC    │    │  DC/DC  │    │  DC/DC  │     │    │
│      │    │ Module  │    │ Primary │    │Secondary│     │    │
│      │    └────┬────┘    └────┬────┘    └────┬────┘     │    │
│      │         │              │              │          │    │
│      │    ┌────┴──────────────┴──────────────┴────┐     │    │
│      │    │         COLD PLATE (Manifold)         │     │    │
│      │    └──────────────────┬────────────────────┘     │    │
│      │                       │                          │    │
│      │                       │                          │    │
│      └───────────────────────┼──────────────────────────┘    │
│                              │                               │
│      HOT                     │                COLD           │
│      ◄──────────────────     │     ──────────────────►       │
│                              │                               │
│  ┌──────────┐           ┌────┴────┐           ┌──────────┐  │
│  │          │           │         │           │          │  │
│  │   HEAT   │◄──────────┤  PUMP   │◄──────────┤EXPANSION │  │
│  │ EXCHANGER│           │         │           │  TANK    │  │
│  │(Radiator)│           └─────────┘           │          │  │
│  │          │                                 └──────────┘  │
│  └────┬─────┘                                               │
│       │                                                      │
│       ▼ Fans                                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Coolant Specifications:

│ Parametar             │ Vrednost                  │
├───────────────────────┼───────────────────────────┤
│ Type                  │ 50% Ethylene Glycol + H2O │
│ Specific heat         │ 3.4 kJ/(kg·K)             │
│ Density               │ 1.05 kg/L                 │
│ Flow rate             │ 10-20 L/min               │
│ Inlet temp (design)   │ 35-45°C                   │
│ ΔT across cold plate  │ 5-10°C                    │
│ Pressure drop         │ 0.2-0.5 bar               │
│ System volume         │ 5-10 L                    │
└───────────────────────────────────────────────────┘
```

### 2.2 Cold Plate Design

```
Cold Plate za Power Module:

Tipovi Cold Plate konstrukcije:

1. Tube-in-Plate:
   ┌─────────────────────────────────────────────────┐
   │ ┌───────────────────────────────────────────┐   │
   │ │  ○─────○─────○─────○─────○─────○─────○   │   │
   │ │  │     │     │     │     │     │     │   │   │
   │ │  │     │     │     │     │     │     │   │   │
   │ │  ○─────○─────○─────○─────○─────○─────○   │   │
   │ └───────────────────────────────────────────┘   │
   │                                                 │
   │ Aluminum plate + copper/SS tubes               │
   │ Simple, lower cost                             │
   │ Limited performance                            │
   └─────────────────────────────────────────────────┘

2. Brazed Channel:
   ┌─────────────────────────────────────────────────┐
   │ ┌───────────────────────────────────────────┐   │
   │ │ ═══════════════════════════════════════   │   │
   │ │ ═══════════════════════════════════════   │   │
   │ │ ═══════════════════════════════════════   │   │
   │ │ ═══════════════════════════════════════   │   │
   │ └───────────────────────────────────────────┘   │
   │                                                 │
   │ Vacuum brazed aluminum                         │
   │ Excellent thermal performance                  │
   │ Higher cost, complex manufacturing             │
   └─────────────────────────────────────────────────┘

3. Pin-Fin (Direct Cooled):
   ┌─────────────────────────────────────────────────┐
   │  Module baseplate ═══════════════════════════   │
   │                    │ │ │ │ │ │ │ │ │ │         │
   │                    │ │ │ │ │ │ │ │ │ │  Pins   │
   │                    │ │ │ │ │ │ │ │ │ │         │
   │  ─────────────────────────────────────── Flow  │
   │                                                 │
   │ Best thermal: direct contact to coolant        │
   │ Requires sealed module base                    │
   │ Used in advanced EV inverters                  │
   └─────────────────────────────────────────────────┘

Thermal Resistance:

Rth_total = Rth_jc + Rth_cs + Rth_sa

Gde je:
- Rth_jc: Junction to case (datasheet)
- Rth_cs: Case to sink (TIM)
- Rth_sa: Sink to ambient (cold plate)

Za SiC modul CAB450M12XM3:
- Rth_jc = 0.09 K/W (per switch)
- Rth_cs = 0.02 K/W (sa TIM)
- Rth_sa = 0.05 K/W (liquid cold plate)
- Rth_total = 0.16 K/W

Tj = T_coolant + P_loss × Rth_total
Tj = 45 + 800W × 0.16 = 45 + 128 = 173°C

⚠️ Preblizu limitu! Potrebno:
- Smanjiti gubitke (bolji switching)
- Poboljšati cold plate (Rth_sa niži)
- Sniziti T_coolant (veći radiator)
```

### 2.3 Proračun Cold Plate

```
Termalni Proračun:

1. Potrebni Heat Transfer Coefficient:

Q = h × A × ΔT

Za Q = 5000 W, ΔT = 30°C, A = 0.05 m²:
h = Q / (A × ΔT) = 5000 / (0.05 × 30) = 3333 W/(m²·K)

2. Flow Rate:

Q = ṁ × Cp × ΔT_coolant

Za Q = 5000 W, Cp = 3400 J/(kg·K), ΔT = 8°C:
ṁ = Q / (Cp × ΔT) = 5000 / (3400 × 8) = 0.184 kg/s
V̇ = ṁ / ρ = 0.184 / 1.05 = 0.175 L/s = 10.5 L/min

3. Pressure Drop (channel flow):

ΔP = f × (L/Dh) × (ρ × v²/2)

Za turbulentni tok u kanalu:
f = 0.316 / Re^0.25 (Blasius)

Primer:
- Kanal: 10mm × 5mm, L = 300mm
- v = 1 m/s, ρ = 1050 kg/m³
- Dh = 4A/P = 4×50/(30) = 6.67mm
- Re = ρvDh/μ = 1050×1×0.00667/0.003 = 2340
- f = 0.316/2340^0.25 = 0.045
- ΔP = 0.045 × (0.3/0.00667) × (1050×1²/2) = 1060 Pa ≈ 0.01 bar

Za ceo sistem (hladnjak + cevi + manifold):
ΔP_total ≈ 0.3-0.5 bar
```

### 2.4 Thermal Interface Materials (TIM)

```
TIM Options:

│ Tip                   │ λ (W/m·K) │ Rth (K·cm²/W) │ Cena    │
├───────────────────────┼───────────┼───────────────┼─────────┤
│ Thermal paste         │ 1-5       │ 0.2-0.5       │ $       │
│ Phase change pad      │ 3-6       │ 0.1-0.3       │ $$      │
│ Graphite sheet        │ 10-15     │ 0.1-0.2       │ $$      │
│ Gap filler (soft)     │ 1-5       │ 0.3-1.0       │ $$      │
│ Liquid metal          │ 20-80     │ 0.02-0.05     │ $$$$    │
│ Solder (thermal joint)│ 30-50     │ 0.01-0.02     │ N/A     │

Preporučeno za Power Module:
1. Phase change pad (Honeywell PTM7950)
   - λ = 6 W/m·K
   - Thickness: 0.25 mm
   - Rth = 0.04°C·cm²/W
   - Reflow na montaži

2. Thermal paste (Arctic MX-4 Pro)
   - Za maintenance/replacement
   - λ = 8.5 W/m·K
   - Requires proper application

Application:

    Power Module
    ════════════════════
         TIM (0.25mm)
    ════════════════════
         Cold Plate
    ____________________

Rth_TIM = t / (λ × A)

Za PTM7950, t = 0.25mm, λ = 6 W/m·K, A = 40 cm²:
Rth_TIM = 0.00025 / (6 × 0.004) = 0.01°C/W

Ukupni doprinos Rth_cs ≈ 0.02°C/W (uključujući contact resistance)
```

### 2.5 Pumpe i Ventilatori

```
Pump Selection:

Requirements:
- Flow: 15 L/min
- Head: 5 m (0.5 bar)
- Voltage: 24V DC (za redundanciju)
- Lifetime: >40,000 hours

Options:

1. Pierburg CWA200 (Automotive):
   ┌─────────────────────────────────────────┐
   │ Flow: 20 L/min @ 0.3 bar               │
   │ Voltage: 12V DC                         │
   │ Power: 50W                              │
   │ Lifetime: >20,000 hours                │
   │ Price: ~€80                             │
   │ Note: Automotive grade, PWM control    │
   └─────────────────────────────────────────┘

2. Laing D5 (PC Cooling):
   ┌─────────────────────────────────────────┐
   │ Flow: 15 L/min @ 0.4 bar               │
   │ Voltage: 12V DC                         │
   │ Power: 23W                              │
   │ Lifetime: 50,000 hours                 │
   │ Price: ~€100                            │
   │ Note: Quiet, reliable, PWM             │
   └─────────────────────────────────────────┘

3. IDEX Micropump GJ-N (Industrial):
   ┌─────────────────────────────────────────┐
   │ Flow: 10 L/min @ 1.0 bar               │
   │ Voltage: 24V DC                         │
   │ Power: 30W                              │
   │ Lifetime: 20,000 hours (brushless)     │
   │ Price: ~€250                            │
   │ Note: High reliability, industrial     │
   └─────────────────────────────────────────┘

Fan Selection for Radiator:

Requirements:
- Airflow: 500-1000 CFM
- Static pressure: 10-30 mmH2O
- Noise: <60 dBA @ 1m
- IP54 minimum

Options:

1. Ebm-papst 4414F (Axial):
   - 119×119×38 mm
   - 24V DC, 12W
   - 190 CFM, 11 mmH2O
   - 52 dBA
   - Price: ~€60

2. Sanyo Denki 9G (High Static):
   - 120×120×38 mm
   - 24V DC, 15W
   - 180 CFM, 25 mmH2O
   - 56 dBA
   - Price: ~€50

Array: 4× fans za 150 kW charger
```

### 2.6 Heat Exchanger (Radiator)

```
Radiator Sizing:

Required heat rejection: Q = 8 kW (sa marginom)
Air-side ΔT: 15°C (ambient to exhaust)
Coolant ΔT: 8°C

UA Calculation:

LMTD = (ΔT₁ - ΔT₂) / ln(ΔT₁/ΔT₂)

Za:
- Coolant in: 50°C, out: 42°C
- Air in: 35°C, out: 50°C

ΔT₁ = 50 - 35 = 15°C (coolant in vs air in)
ΔT₂ = 42 - 50 = -8°C (wrong, recalculate)

Counterflow:
ΔT₁ = 50 - 50 = 0°C (coolant in vs air out) ← Not valid

Crossflow is typical:
LMTD_crossflow ≈ 10-12°C

Q = UA × LMTD
UA = Q / LMTD = 8000 / 10 = 800 W/K

Radiator Specifications:

┌────────────────────────────────────────────────────────────┐
│ Parameter                  │ Value                         │
├────────────────────────────┼───────────────────────────────┤
│ Core size                  │ 400 × 300 × 50 mm            │
│ Fin density                │ 18 FPI (fins per inch)       │
│ Tube configuration         │ 2-row, multi-pass            │
│ Material                   │ Aluminum (brazed)            │
│ Coolant connections        │ G1/2" or 16mm barb           │
│ Max pressure               │ 2 bar                        │
│ Heat rejection (rated)     │ 10 kW @ ΔT=15°C              │
│ Airflow required           │ 800 CFM                      │
└────────────────────────────────────────────────────────────┘

Commercial Options:

1. Lytron M14-240 (Industrial):
   - Heat: 10 kW
   - Dimensions: 400×300×80mm
   - Price: ~€400

2. Mishimoto Racing (Automotive):
   - Various sizes
   - Good quality/price
   - Price: €150-300

3. Custom from China:
   - Alibaba suppliers
   - 4-6 week lead time
   - Price: €80-150
```

## 3. Air Cooling (za manje komponente)

### 3.1 Cabinet Airflow Design

```
Cabinet Ventilation:

┌─────────────────────────────────────────────────────────────────┐
│                          EXHAUST                                │
│                           ═══                                   │
│                          │   │                                  │
│                          │Fan│                                  │
│                          │   │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │    ┌────────┐  ┌────────┐  ┌────────┐                  │   │
│  │    │Inductor│  │Trans-  │  │Capacitor│                 │   │
│  │    │        │  │former  │  │  Bank   │   HOT ZONE      │   │
│  │    └────────┘  └────────┘  └─────────┘                 │   │
│  │         ▲           ▲           ▲                       │   │
│  │         │           │           │      Airflow          │   │
│  │    ═════════════════════════════════════                │   │
│  │                                                         │   │
│  │    ┌────────────────────────────────────┐              │   │
│  │    │      Power Modules (Liquid)        │              │   │
│  │    │      (minimalna interakcija)       │              │   │
│  │    └────────────────────────────────────┘              │   │
│  │                                                         │   │
│  │    ═════════════════════════════════════                │   │
│  │         ▲           ▲           ▲                       │   │
│  │    ┌────────┐  ┌────────┐  ┌────────┐                  │   │
│  │    │Control │  │  EMI   │  │ Power  │  COLD ZONE       │   │
│  │    │ PCB    │  │ Filter │  │ Entry  │                  │   │
│  │    └────────┘  └────────┘  └────────┘                  │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │   │                                  │
│                          │   │                                  │
│                          │Fan│                                  │
│                          │   │                                  │
│                           ═══                                   │
│                          INTAKE                                 │
│                      (filtered)                                 │
└─────────────────────────────────────────────────────────────────┘

Airflow Calculation:

Q_air = ṁ × Cp × ΔT

Za komponente sa air cooling (3 kW):
ṁ = Q / (Cp × ΔT) = 3000 / (1005 × 15) = 0.2 kg/s
V̇ = ṁ / ρ = 0.2 / 1.2 = 0.167 m³/s = 350 CFM

Sa marginom (50%):
V̇_design = 500 CFM

Fans: 2× 200 CFM intake + 2× 300 CFM exhaust
(Slight positive pressure to keep dust out)
```

### 3.2 Heatsink za PCB Komponente

```
Heatsink za Gate Driver DC/DC:

Power dissipation: 5W
Target ΔT: 40°C (junction to ambient)
Required Rth_sa: 40/5 = 8°C/W

Heatsink Options:

1. Extruded Aluminum (Fisher SK481):
   - Dimensions: 50×50×20mm
   - Rth: 5°C/W (natural convection)
   - Rth: 2°C/W (forced @ 2 m/s)
   - Price: ~€3

2. Stamped/Bent (Fischer):
   - Dimensions: 40×40×15mm
   - Rth: 8-12°C/W
   - Price: ~€1

3. Board-mount (Aavid):
   - TO-220 clip-on
   - Rth: 10-15°C/W
   - Price: ~€0.5

Mounting:
- Spring clips za vibration resistance
- Thermal pad (3M 8810)
- Rth_contact: 0.5-1°C/W
```

## 4. Thermal Control System

### 4.1 Sensor Placement

```
Temperature Monitoring Points:

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Power Module Internal (NTC in module):                         │
│  ├── T1: IGBT/SiC junction (estimated from NTC)                │
│  ├── T2: Diode junction                                         │
│  └── T3: Baseplate                                              │
│                                                                 │
│  Cold Plate:                                                    │
│  ├── T4: Inlet coolant temperature                              │
│  ├── T5: Outlet coolant temperature                             │
│  └── T6: Cold plate surface (backup)                            │
│                                                                 │
│  Air-cooled components:                                         │
│  ├── T7: Transformer winding (embedded)                         │
│  ├── T8: PFC inductor                                           │
│  ├── T9: DC Link capacitors                                     │
│  └── T10: Cabinet ambient                                       │
│                                                                 │
│  External:                                                      │
│  ├── T11: Radiator inlet air                                    │
│  ├── T12: Radiator outlet air                                   │
│  └── T13: Outdoor ambient (for outdoor units)                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Sensor Types by Location:

│ Location          │ Sensor Type    │ Range      │ Accuracy │
├───────────────────┼────────────────┼────────────┼──────────┤
│ Module internal   │ NTC (built-in) │ -40..175°C │ ±2°C     │
│ Coolant           │ NTC/PT1000     │ -40..125°C │ ±1°C     │
│ Cold plate        │ NTC            │ -40..125°C │ ±2°C     │
│ Transformer       │ PT100/Thermocouple│ -40..200°C│ ±1°C    │
│ Capacitors        │ NTC            │ -40..105°C │ ±2°C     │
│ Ambient           │ NTC/Digital    │ -40..85°C  │ ±1°C     │
```

### 4.2 Control Algorithm

```
Thermal Control Strategy:

typedef struct {
    float T_coolant_in;
    float T_coolant_out;
    float T_module[6];      // 6 power modules
    float T_ambient;
    float T_capacitors;
    float T_transformer;
} ThermalSensors_t;

typedef struct {
    float pump_speed;       // 0-100%
    float fan_speed[4];     // 0-100% per fan
    float power_limit;      // 0-100% of nominal
    bool alarm_active;
    bool shutdown_active;
} ThermalControl_t;

void Thermal_Control_Update(ThermalSensors_t *sensors, ThermalControl_t *control)
{
    // 1. Calculate module temperatures (from NTC + thermal model)
    float T_max_module = 0;
    for (int i = 0; i < 6; i++) {
        if (sensors->T_module[i] > T_max_module) {
            T_max_module = sensors->T_module[i];
        }
    }

    // 2. Pump speed control (coolant outlet temp based)
    float pump_error = sensors->T_coolant_out - COOLANT_TARGET_TEMP;
    control->pump_speed = PI_Run(&pump_pi, pump_error);
    control->pump_speed = CLAMP(control->pump_speed, 30.0f, 100.0f);

    // 3. Fan speed control (ambient and radiator based)
    float fan_error = sensors->T_coolant_in - T_AMBIENT_REF;
    float fan_speed_base = PI_Run(&fan_pi, fan_error);

    for (int i = 0; i < 4; i++) {
        control->fan_speed[i] = CLAMP(fan_speed_base, 20.0f, 100.0f);
    }

    // 4. Power derating
    if (T_max_module > DERATING_START_TEMP) {
        float derating = (T_max_module - DERATING_START_TEMP) /
                        (DERATING_END_TEMP - DERATING_START_TEMP);
        control->power_limit = 100.0f - (derating * 50.0f);  // Max 50% derating
        control->power_limit = CLAMP(control->power_limit, 50.0f, 100.0f);
    } else {
        control->power_limit = 100.0f;
    }

    // 5. Alarm and shutdown
    control->alarm_active = (T_max_module > ALARM_TEMP) ||
                           (sensors->T_capacitors > CAP_ALARM_TEMP);

    control->shutdown_active = (T_max_module > SHUTDOWN_TEMP) ||
                              (sensors->T_capacitors > CAP_SHUTDOWN_TEMP);
}

Temperature Thresholds:

│ Parameter               │ Value  │ Action              │
├─────────────────────────┼────────┼─────────────────────┤
│ COOLANT_TARGET_TEMP     │ 45°C   │ Normal operation    │
│ DERATING_START_TEMP     │ 130°C  │ Start reducing power│
│ DERATING_END_TEMP       │ 150°C  │ 50% power limit     │
│ ALARM_TEMP              │ 145°C  │ Warning, log        │
│ SHUTDOWN_TEMP           │ 160°C  │ Emergency stop      │
│ CAP_ALARM_TEMP          │ 75°C   │ Warning             │
│ CAP_SHUTDOWN_TEMP       │ 90°C   │ Emergency stop      │
```

### 4.3 Pre-Conditioning

```
Cold Start Heating:

Za outdoor punjače na niskim temperaturama:

if (T_ambient < MIN_OPERATING_TEMP) {  // e.g., -20°C
    // Pre-heat mode
    enable_circulation_heater();  // 500W-2kW heater

    while (T_coolant < MIN_START_TEMP) {  // e.g., -10°C
        run_pump_low_speed();
        run_heater();
        wait(10_seconds);
    }

    disable_heater();
    // Now safe to start power electronics
}

Heater Options:

1. Inline Coolant Heater:
   - PTC element
   - 500W-2kW
   - Integrated in coolant loop

2. Silicone Heater Pad:
   - On cold plate surface
   - 100-500W
   - For localized heating

3. Resistive Coolant Heater:
   - Immersion element
   - In expansion tank
   - 1-3kW

Hot Climate Pre-Cooling:

if (T_cabinet > MAX_IDLE_TEMP) {  // e.g., 50°C
    // Pre-cool before charging
    run_fans_high();
    run_pump_medium();

    while (T_cabinet > READY_TEMP) {  // e.g., 40°C
        wait(30_seconds);
    }
}
```

## 5. Simulation i Modeling

### 5.1 Thermal RC Network

```
Cauer Thermal Model (za Power Module):

Tj ─────┬──[Rth1]──┬──[Rth2]──┬──[Rth3]──┬── T_coolant
        │          │          │          │
       ═╪═ Cth1   ═╪═ Cth2   ═╪═ Cth3   ═╪═ (infinite)
        │          │          │          │
       GND        GND        GND        GND

│ Layer        │ Rth (K/W) │ Cth (J/K) │ τ (s)   │
├──────────────┼───────────┼───────────┼─────────┤
│ Die          │ 0.02      │ 0.01      │ 0.0002  │
│ Solder       │ 0.01      │ 0.05      │ 0.0005  │
│ Substrate    │ 0.03      │ 0.5       │ 0.015   │
│ Baseplate    │ 0.02      │ 5.0       │ 0.1     │
│ TIM          │ 0.02      │ 0.1       │ 0.002   │
│ Cold plate   │ 0.03      │ 50        │ 1.5     │

Differential Equation:

dTj/dt = (P_loss - (Tj - Tc)/Rth_jc) / Cth_j

Discrete Implementation:

for each time step dt:
    for each layer i:
        T[i] += dt * ((T[i-1] - T[i])/R[i-1] - (T[i] - T[i+1])/R[i]) / C[i]
```

### 5.2 CFD Analysis

```
CFD Simulation za Cabinet:

Tools:
1. ANSYS Fluent - Industry standard
2. OpenFOAM - Open source
3. Simscale - Cloud-based
4. FloTHERM - Electronics specific

Simulation Setup:

1. Geometry:
   - Full cabinet model
   - Simplified component models
   - Inlet/outlet openings

2. Mesh:
   - 2-5 million cells typical
   - Refinement near components
   - Boundary layer on surfaces

3. Boundary Conditions:
   - Heat sources (W) on components
   - Mass flow at inlet
   - Pressure at outlet
   - External temperature

4. Analysis:
   - Steady-state temperature field
   - Velocity vectors
   - Hot spots identification
   - Pressure drop through cabinet

Typical Results:

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Temperature Distribution (°C):                             │
│                                                             │
│     ┌──────────────────────────────────┐                   │
│     │            75°C (exhaust)         │                   │
│     │  ┌────────────────────────────┐  │                   │
│     │  │     65°C     70°C    68°C  │  │                   │
│     │  │    [IND]    [XFMR]  [CAP]  │  │                   │
│     │  │                            │  │                   │
│     │  │     45°C (liquid cooled)   │  │                   │
│     │  │    [===============]       │  │                   │
│     │  │                            │  │                   │
│     │  │     38°C     40°C    42°C  │  │                   │
│     │  │    [PCB]   [FILT]  [PWR]   │  │                   │
│     │  └────────────────────────────┘  │                   │
│     │            35°C (intake)          │                   │
│     └──────────────────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 6. Bill of Materials - Termalno

```
┌─────────────────────────────────────────────────────────────────┐
│ TERMALNE KOMPONENTE (150 kW DC Punjač)                          │
├──────────────────────────────┬─────┬────────────┬───────────────┤
│ Komponenta                   │ Qty │ Jed. cena  │    Ukupno     │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Cold Plate (brazed aluminum) │  1  │   €300     │    €300       │
│ 400×300mm, 6 mounting zones  │     │            │               │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Radiator 10kW (automotive)   │  1  │   €200     │    €200       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Coolant Pump (Laing D5)      │  1  │   €100     │    €100       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Expansion Tank 2L            │  1  │    €30     │     €30       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Radiator Fans 120mm (×4)     │  4  │    €50     │    €200       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Cabinet Fans 200mm (×2)      │  2  │    €60     │    €120       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Coolant (5L 50% glycol)      │  1  │    €20     │     €20       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Hoses, fittings, clamps      │ set │    €80     │     €80       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ TIM (Phase change pads)      │  6  │    €10     │     €60       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Heatsinks for PCB components │ set │    €50     │     €50       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Temperature sensors (NTC)    │ 15  │     €2     │     €30       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Pre-heat element (1kW)       │  1  │    €50     │     €50       │
├──────────────────────────────┴─────┴────────────┼───────────────┤
│ UKUPNO TERMALNO                                 │   €1,240      │
└─────────────────────────────────────────────────┴───────────────┘
```

## 7. Zaključak

```
Preporuke za Termalno Upravljanje:

1. Cooling Strategy:
   ├── Power modules: Liquid cooling (obavezno za >50kW)
   ├── Magnetics: Air cooling (forced)
   ├── Capacitors: Air cooling + positioning
   └── Control: Conduction + minimal airflow

2. System Design:
   ├── Cold plate: Brazed channel za best performance
   ├── Radiator: Oversized 20% za margin
   ├── Pump: Automotive grade, PWM controlled
   └── Fans: IP54+, low noise, redundant

3. Control:
   ├── Multi-zone temperature monitoring
   ├── Predictive derating (before limits)
   ├── Pre-conditioning za extreme temps
   └── Redundant sensors za kritične tačke

4. Reliability:
   ├── Coolant: Ethylene glycol, 2-year life
   ├── Pump: >40,000 hours MTBF
   ├── Filters: Serviceable, 1-year interval
   └── Sensors: Dual for critical points

5. Testing:
   ├── Thermal cycling validation
   ├── Altitude derating verification
   ├── Extreme temperature operation
   └── Failure mode analysis
```
