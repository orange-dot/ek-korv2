# Thermal Management for EV Chargers

## 1. Thermal Requirements

### 1.1 Heat Sources

```
Loss Distribution in 150 kW DC Charger:

+---------------------------------------------------------------+
|                                                               |
|  Total losses @ 150 kW, eta = 95%                             |
|  P_loss = 150 kW x (1 - 0.95) / 0.95 = 7.9 kW                 |
|                                                               |
|  Distribution:                                                |
|  +-------------------------------------------------------+   |
|  | Component            | Losses (W) | % total | Cooling |   |
|  +----------------------+------------+---------+---------+   |
|  | PFC Stage (IGBT/SiC) |   2,400    |   30%   | Liquid  |   |
|  | DC/DC Stage (prim)   |   1,900    |   24%   | Liquid  |   |
|  | DC/DC Stage (sec)    |   1,100    |   14%   | Liquid  |   |
|  | Transformer          |     800    |   10%   | Air/Oil |   |
|  | Inductors (PFC)      |     600    |    8%   | Air     |   |
|  | DC Link capacitors   |     400    |    5%   | Air     |   |
|  | EMI Filter           |     300    |    4%   | Air     |   |
|  | Cables/Bus bar       |     200    |    2%   | Air     |   |
|  | Control electronics  |     200    |    3%   | Air     |   |
|  +----------------------+------------+---------+---------+   |
|  | TOTAL                |   7,900    |  100%   |         |   |
|  +-------------------------------------------------------+   |
|                                                               |
+---------------------------------------------------------------+

Critical Temperatures:

| Component         | Tj_max   | Derating Start | Target Tj |
+-------------------+----------+----------------+-----------+
| Si IGBT           | 150C     | 125C           | 100C      |
| SiC MOSFET        | 175C     | 150C           | 125C      |
| Diode             | 175C     | 150C           | 125C      |
| Ferrite core      | 200C     | 140C           | 100C      |
| Litz wire (H)     | 180C     | 155C           | 130C      |
| Film capacitor    | 105C     | 85C            | 70C       |
| Electrolytic cap  | 105C     | 85C            | 65C       |
```

### 1.2 Ambient Conditions

```
Design Conditions:

Indoor Installation:
- T_ambient: 0C to +40C (nominal)
- T_ambient: -10C to +45C (extended)
- Humidity: 20-80% RH, non-condensing
- Altitude: up to 1000m (derating above)

Outdoor Installation:
- T_ambient: -25C to +50C
- T_ambient: -40C to +55C (extreme)
- Direct sunlight: +15C adder
- Humidity: 5-100% RH
- IP rating: IP54 minimum

Temperature Margin Calculation:

DT_allowed = Tj_max - T_ambient_max - T_margin

For SiC @ outdoor:
DT_allowed = 175 - 55 - 20 = 100C

For Film Cap @ outdoor:
DT_allowed = 105 - 55 - 10 = 40C

-> Film capacitors are thermally critical!
```

## 2. Liquid Cooling System

### 2.1 System Overview

```
Liquid Cooling Loop:

+--------------------------------------------------------------+
|                                                              |
|      +----------------------------------------------+       |
|      |                                              |       |
|      |    +---------+    +---------+    +---------+ |       |
|      |    |  PFC    |    |  DC/DC  |    |  DC/DC  | |       |
|      |    | Module  |    | Primary |    |Secondary| |       |
|      |    +----+----+    +----+----+    +----+----+ |       |
|      |         |              |              |      |       |
|      |    +----+--------------+--------------+----+ |       |
|      |    |         COLD PLATE (Manifold)         | |       |
|      |    +------------------+--------------------+ |       |
|      |                       |                      |       |
|      |                       |                      |       |
|      +-----------------------+----------------------+       |
|                              |                              |
|      HOT                     |                COLD          |
|      <---------------        |       ----------------->     |
|                              |                              |
|  +----------+           +----+----+           +----------+  |
|  |          |           |         |           |          |  |
|  |   HEAT   |<----------|  PUMP   |<----------|EXPANSION |  |
|  | EXCHANGER|           |         |           |  TANK    |  |
|  |(Radiator)|           +---------+           |          |  |
|  |          |                                 +----------+  |
|  +----+-----+                                               |
|       |                                                     |
|       v Fans                                                |
|                                                             |
+-------------------------------------------------------------+

Coolant Specifications:

| Parameter             | Value                     |
+-----------------------+---------------------------+
| Type                  | 50% Ethylene Glycol + H2O |
| Specific heat         | 3.4 kJ/(kg K)             |
| Density               | 1.05 kg/L                 |
| Flow rate             | 10-20 L/min               |
| Inlet temp (design)   | 35-45C                    |
| DT across cold plate  | 5-10C                     |
| Pressure drop         | 0.2-0.5 bar               |
| System volume         | 5-10 L                    |
+-----------------------+---------------------------+
```

### 2.2 Cold Plate Design

```
Cold Plate for Power Module:

Cold Plate Construction Types:

1. Tube-in-Plate:
   +---------------------------------------------+
   | +---------------------------------------+   |
   | |  O-----O-----O-----O-----O-----O-----O |   |
   | |  |     |     |     |     |     |     | |   |
   | |  |     |     |     |     |     |     | |   |
   | |  O-----O-----O-----O-----O-----O-----O |   |
   | +---------------------------------------+   |
   |                                             |
   | Aluminum plate + copper/SS tubes           |
   | Simple, lower cost                         |
   | Limited performance                        |
   +---------------------------------------------+

2. Brazed Channel:
   +---------------------------------------------+
   | +---------------------------------------+   |
   | | ===================================== |   |
   | | ===================================== |   |
   | | ===================================== |   |
   | | ===================================== |   |
   | +---------------------------------------+   |
   |                                             |
   | Vacuum brazed aluminum                     |
   | Excellent thermal performance              |
   | Higher cost, complex manufacturing         |
   +---------------------------------------------+

3. Pin-Fin (Direct Cooled):
   +---------------------------------------------+
   |  Module baseplate =======================   |
   |                    | | | | | | | | | |      |
   |                    | | | | | | | | | |  Pins|
   |                    | | | | | | | | | |      |
   |  ------------------------------------- Flow |
   |                                             |
   | Best thermal: direct contact to coolant    |
   | Requires sealed module base                |
   | Used in advanced EV inverters              |
   +---------------------------------------------+

Thermal Resistance:

Rth_total = Rth_jc + Rth_cs + Rth_sa

Where:
- Rth_jc: Junction to case (datasheet)
- Rth_cs: Case to sink (TIM)
- Rth_sa: Sink to ambient (cold plate)

For SiC module CAB450M12XM3:
- Rth_jc = 0.09 K/W (per switch)
- Rth_cs = 0.02 K/W (with TIM)
- Rth_sa = 0.05 K/W (liquid cold plate)
- Rth_total = 0.16 K/W

Tj = T_coolant + P_loss x Rth_total
Tj = 45 + 800W x 0.16 = 45 + 128 = 173C

Warning: Too close to limit! Required:
- Reduce losses (better switching)
- Improve cold plate (lower Rth_sa)
- Lower T_coolant (larger radiator)
```

### 2.3 Cold Plate Calculation

```
Thermal Calculation:

1. Required Heat Transfer Coefficient:

Q = h x A x DT

For Q = 5000 W, DT = 30C, A = 0.05 m^2:
h = Q / (A x DT) = 5000 / (0.05 x 30) = 3333 W/(m^2 K)

2. Flow Rate:

Q = m_dot x Cp x DT_coolant

For Q = 5000 W, Cp = 3400 J/(kg K), DT = 8C:
m_dot = Q / (Cp x DT) = 5000 / (3400 x 8) = 0.184 kg/s
V_dot = m_dot / rho = 0.184 / 1.05 = 0.175 L/s = 10.5 L/min

3. Pressure Drop (channel flow):

DP = f x (L/Dh) x (rho x v^2/2)

For turbulent flow in channel:
f = 0.316 / Re^0.25 (Blasius)

Example:
- Channel: 10mm x 5mm, L = 300mm
- v = 1 m/s, rho = 1050 kg/m^3
- Dh = 4A/P = 4x50/(30) = 6.67mm
- Re = rho x v x Dh/mu = 1050 x 1 x 0.00667/0.003 = 2340
- f = 0.316/2340^0.25 = 0.045
- DP = 0.045 x (0.3/0.00667) x (1050 x 1^2/2) = 1060 Pa ~ 0.01 bar

For entire system (radiator + hoses + manifold):
DP_total ~ 0.3-0.5 bar
```

### 2.4 Thermal Interface Materials (TIM)

```
TIM Options:

| Type                  | lambda (W/m K)| Rth (K cm^2/W)| Price   |
+-----------------------+---------------+---------------+---------+
| Thermal paste         | 1-5           | 0.2-0.5       | $       |
| Phase change pad      | 3-6           | 0.1-0.3       | $$      |
| Graphite sheet        | 10-15         | 0.1-0.2       | $$      |
| Gap filler (soft)     | 1-5           | 0.3-1.0       | $$      |
| Liquid metal          | 20-80         | 0.02-0.05     | $$$$    |
| Solder (thermal joint)| 30-50         | 0.01-0.02     | N/A     |

Recommended for Power Module:
1. Phase change pad (Honeywell PTM7950)
   - lambda = 6 W/m K
   - Thickness: 0.25 mm
   - Rth = 0.04C cm^2/W
   - Reflow on assembly

2. Thermal paste (Arctic MX-4 Pro)
   - For maintenance/replacement
   - lambda = 8.5 W/m K
   - Requires proper application

Application:

    Power Module
    ========================
         TIM (0.25mm)
    ========================
         Cold Plate
    ________________________

Rth_TIM = t / (lambda x A)

For PTM7950, t = 0.25mm, lambda = 6 W/m K, A = 40 cm^2:
Rth_TIM = 0.00025 / (6 x 0.004) = 0.01C/W

Total contribution Rth_cs ~ 0.02C/W (including contact resistance)
```

### 2.5 Pumps and Fans

```
Pump Selection:

Requirements:
- Flow: 15 L/min
- Head: 5 m (0.5 bar)
- Voltage: 24V DC (for redundancy)
- Lifetime: >40,000 hours

Options:

1. Pierburg CWA200 (Automotive):
   +---------------------------------------+
   | Flow: 20 L/min @ 0.3 bar             |
   | Voltage: 12V DC                       |
   | Power: 50W                            |
   | Lifetime: >20,000 hours              |
   | Price: ~EUR80                         |
   | Note: Automotive grade, PWM control  |
   +---------------------------------------+

2. Laing D5 (PC Cooling):
   +---------------------------------------+
   | Flow: 15 L/min @ 0.4 bar             |
   | Voltage: 12V DC                       |
   | Power: 23W                            |
   | Lifetime: 50,000 hours               |
   | Price: ~EUR100                        |
   | Note: Quiet, reliable, PWM           |
   +---------------------------------------+

3. IDEX Micropump GJ-N (Industrial):
   +---------------------------------------+
   | Flow: 10 L/min @ 1.0 bar             |
   | Voltage: 24V DC                       |
   | Power: 30W                            |
   | Lifetime: 20,000 hours (brushless)   |
   | Price: ~EUR250                        |
   | Note: High reliability, industrial   |
   +---------------------------------------+

Fan Selection for Radiator:

Requirements:
- Airflow: 500-1000 CFM
- Static pressure: 10-30 mmH2O
- Noise: <60 dBA @ 1m
- IP54 minimum

Options:

1. Ebm-papst 4414F (Axial):
   - 119x119x38 mm
   - 24V DC, 12W
   - 190 CFM, 11 mmH2O
   - 52 dBA
   - Price: ~EUR60

2. Sanyo Denki 9G (High Static):
   - 120x120x38 mm
   - 24V DC, 15W
   - 180 CFM, 25 mmH2O
   - 56 dBA
   - Price: ~EUR50

Array: 4x fans for 150 kW charger
```

### 2.6 Heat Exchanger (Radiator)

```
Radiator Sizing:

Required heat rejection: Q = 8 kW (with margin)
Air-side DT: 15C (ambient to exhaust)
Coolant DT: 8C

UA Calculation:

LMTD = (DT1 - DT2) / ln(DT1/DT2)

For:
- Coolant in: 50C, out: 42C
- Air in: 35C, out: 50C

DT1 = 50 - 35 = 15C (coolant in vs air in)
DT2 = 42 - 50 = -8C (wrong, recalculate)

Counterflow:
DT1 = 50 - 50 = 0C (coolant in vs air out) <- Not valid

Crossflow is typical:
LMTD_crossflow ~ 10-12C

Q = UA x LMTD
UA = Q / LMTD = 8000 / 10 = 800 W/K

Radiator Specifications:

+------------------------------------------------------------+
| Parameter                  | Value                          |
+----------------------------+--------------------------------+
| Core size                  | 400 x 300 x 50 mm             |
| Fin density                | 18 FPI (fins per inch)        |
| Tube configuration         | 2-row, multi-pass             |
| Material                   | Aluminum (brazed)             |
| Coolant connections        | G1/2" or 16mm barb            |
| Max pressure               | 2 bar                         |
| Heat rejection (rated)     | 10 kW @ DT=15C                |
| Airflow required           | 800 CFM                       |
+------------------------------------------------------------+

Commercial Options:

1. Lytron M14-240 (Industrial):
   - Heat: 10 kW
   - Dimensions: 400x300x80mm
   - Price: ~EUR400

2. Mishimoto Racing (Automotive):
   - Various sizes
   - Good quality/price
   - Price: EUR150-300

3. Custom from China:
   - Alibaba suppliers
   - 4-6 week lead time
   - Price: EUR80-150
```

## 3. Air Cooling (for smaller components)

### 3.1 Cabinet Airflow Design

```
Cabinet Ventilation:

+---------------------------------------------------------------+
|                          EXHAUST                               |
|                           ===                                  |
|                          |   |                                 |
|                          |Fan|                                 |
|                          |   |                                 |
|  +-------------------------------------------------------+   |
|  |                                                       |   |
|  |    +--------+  +--------+  +--------+                |   |
|  |    |Inductor|  |Trans-  |  |Capacitor|               |   |
|  |    |        |  |former  |  |  Bank   |   HOT ZONE    |   |
|  |    +--------+  +--------+  +---------+               |   |
|  |         ^           ^           ^                     |   |
|  |         |           |           |      Airflow        |   |
|  |    =========================================          |   |
|  |                                                       |   |
|  |    +------------------------------------+            |   |
|  |    |      Power Modules (Liquid)        |            |   |
|  |    |      (minimal interaction)         |            |   |
|  |    +------------------------------------+            |   |
|  |                                                       |   |
|  |    =========================================          |   |
|  |         ^           ^           ^                     |   |
|  |    +--------+  +--------+  +--------+                |   |
|  |    |Control |  |  EMI   |  | Power  |  COLD ZONE     |   |
|  |    | PCB    |  | Filter |  | Entry  |                |   |
|  |    +--------+  +--------+  +--------+                |   |
|  |                                                       |   |
|  +-------------------------------------------------------+   |
|                          |   |                                 |
|                          |   |                                 |
|                          |Fan|                                 |
|                          |   |                                 |
|                           ===                                  |
|                          INTAKE                                |
|                      (filtered)                                |
+---------------------------------------------------------------+

Airflow Calculation:

Q_air = m_dot x Cp x DT

For air-cooled components (3 kW):
m_dot = Q / (Cp x DT) = 3000 / (1005 x 15) = 0.2 kg/s
V_dot = m_dot / rho = 0.2 / 1.2 = 0.167 m^3/s = 350 CFM

With margin (50%):
V_dot_design = 500 CFM

Fans: 2x 200 CFM intake + 2x 300 CFM exhaust
(Slight positive pressure to keep dust out)
```

### 3.2 Heatsink for PCB Components

```
Heatsink for Gate Driver DC/DC:

Power dissipation: 5W
Target DT: 40C (junction to ambient)
Required Rth_sa: 40/5 = 8C/W

Heatsink Options:

1. Extruded Aluminum (Fisher SK481):
   - Dimensions: 50x50x20mm
   - Rth: 5C/W (natural convection)
   - Rth: 2C/W (forced @ 2 m/s)
   - Price: ~EUR3

2. Stamped/Bent (Fischer):
   - Dimensions: 40x40x15mm
   - Rth: 8-12C/W
   - Price: ~EUR1

3. Board-mount (Aavid):
   - TO-220 clip-on
   - Rth: 10-15C/W
   - Price: ~EUR0.5

Mounting:
- Spring clips for vibration resistance
- Thermal pad (3M 8810)
- Rth_contact: 0.5-1C/W
```

## 4. Thermal Control System

### 4.1 Sensor Placement

```
Temperature Monitoring Points:

+---------------------------------------------------------------+
|                                                               |
|  Power Module Internal (NTC in module):                        |
|  +-- T1: IGBT/SiC junction (estimated from NTC)               |
|  +-- T2: Diode junction                                        |
|  +-- T3: Baseplate                                             |
|                                                               |
|  Cold Plate:                                                   |
|  +-- T4: Inlet coolant temperature                             |
|  +-- T5: Outlet coolant temperature                            |
|  +-- T6: Cold plate surface (backup)                           |
|                                                               |
|  Air-cooled components:                                        |
|  +-- T7: Transformer winding (embedded)                        |
|  +-- T8: PFC inductor                                          |
|  +-- T9: DC Link capacitors                                    |
|  +-- T10: Cabinet ambient                                      |
|                                                               |
|  External:                                                     |
|  +-- T11: Radiator inlet air                                   |
|  +-- T12: Radiator outlet air                                  |
|  +-- T13: Outdoor ambient (for outdoor units)                  |
|                                                               |
+---------------------------------------------------------------+

Sensor Types by Location:

| Location          | Sensor Type    | Range      | Accuracy |
+-------------------+----------------+------------+----------+
| Module internal   | NTC (built-in) | -40..175C  | +/-2C    |
| Coolant           | NTC/PT1000     | -40..125C  | +/-1C    |
| Cold plate        | NTC            | -40..125C  | +/-2C    |
| Transformer       | PT100/Thermo   | -40..200C  | +/-1C    |
| Capacitors        | NTC            | -40..105C  | +/-2C    |
| Ambient           | NTC/Digital    | -40..85C   | +/-1C    |
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

| Parameter               | Value  | Action              |
+-------------------------+--------+---------------------+
| COOLANT_TARGET_TEMP     | 45C    | Normal operation    |
| DERATING_START_TEMP     | 130C   | Start reducing power|
| DERATING_END_TEMP       | 150C   | 50% power limit     |
| ALARM_TEMP              | 145C   | Warning, log        |
| SHUTDOWN_TEMP           | 160C   | Emergency stop      |
| CAP_ALARM_TEMP          | 75C    | Warning             |
| CAP_SHUTDOWN_TEMP       | 90C    | Emergency stop      |
```

### 4.3 Pre-Conditioning

```
Cold Start Heating:

For outdoor chargers at low temperatures:

if (T_ambient < MIN_OPERATING_TEMP) {  // e.g., -20C
    // Pre-heat mode
    enable_circulation_heater();  // 500W-2kW heater

    while (T_coolant < MIN_START_TEMP) {  // e.g., -10C
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

if (T_cabinet > MAX_IDLE_TEMP) {  // e.g., 50C
    // Pre-cool before charging
    run_fans_high();
    run_pump_medium();

    while (T_cabinet > READY_TEMP) {  // e.g., 40C
        wait(30_seconds);
    }
}
```

## 5. Simulation and Modeling

### 5.1 Thermal RC Network

```
Cauer Thermal Model (for Power Module):

Tj -----+--[Rth1]--+--[Rth2]--+--[Rth3]--+-- T_coolant
        |          |          |          |
       =|= Cth1   =|= Cth2   =|= Cth3   =|= (infinite)
        |          |          |          |
       GND        GND        GND        GND

| Layer        | Rth (K/W) | Cth (J/K) | tau (s)   |
+--------------+-----------+-----------+-----------+
| Die          | 0.02      | 0.01      | 0.0002    |
| Solder       | 0.01      | 0.05      | 0.0005    |
| Substrate    | 0.03      | 0.5       | 0.015     |
| Baseplate    | 0.02      | 5.0       | 0.1       |
| TIM          | 0.02      | 0.1       | 0.002     |
| Cold plate   | 0.03      | 50        | 1.5       |

Differential Equation:

dTj/dt = (P_loss - (Tj - Tc)/Rth_jc) / Cth_j

Discrete Implementation:

for each time step dt:
    for each layer i:
        T[i] += dt * ((T[i-1] - T[i])/R[i-1] - (T[i] - T[i+1])/R[i]) / C[i]
```

### 5.2 CFD Analysis

```
CFD Simulation for Cabinet:

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

+-----------------------------------------------------------+
|                                                           |
|  Temperature Distribution (C):                            |
|                                                           |
|     +----------------------------------+                  |
|     |            75C (exhaust)         |                  |
|     |  +----------------------------+  |                  |
|     |  |     65C     70C    68C    |  |                  |
|     |  |    [IND]   [XFMR]  [CAP]  |  |                  |
|     |  |                           |  |                  |
|     |  |     45C (liquid cooled)   |  |                  |
|     |  |    [=================]    |  |                  |
|     |  |                           |  |                  |
|     |  |     38C     40C    42C    |  |                  |
|     |  |    [PCB]   [FILT]  [PWR]  |  |                  |
|     |  +----------------------------+  |                  |
|     |            35C (intake)          |                  |
|     +----------------------------------+                  |
|                                                           |
+-----------------------------------------------------------+
```

## 6. Bill of Materials - Thermal

```
+---------------------------------------------------------------+
| THERMAL COMPONENTS (150 kW DC Charger)                         |
+------------------------------+-----+------------+---------------+
| Component                    | Qty | Unit price |    Total      |
+------------------------------+-----+------------+---------------+
| Cold Plate (brazed aluminum) |  1  |   EUR300   |    EUR300     |
| 400x300mm, 6 mounting zones  |     |            |               |
+------------------------------+-----+------------+---------------+
| Radiator 10kW (automotive)   |  1  |   EUR200   |    EUR200     |
+------------------------------+-----+------------+---------------+
| Coolant Pump (Laing D5)      |  1  |   EUR100   |    EUR100     |
+------------------------------+-----+------------+---------------+
| Expansion Tank 2L            |  1  |    EUR30   |     EUR30     |
+------------------------------+-----+------------+---------------+
| Radiator Fans 120mm (x4)     |  4  |    EUR50   |    EUR200     |
+------------------------------+-----+------------+---------------+
| Cabinet Fans 200mm (x2)      |  2  |    EUR60   |    EUR120     |
+------------------------------+-----+------------+---------------+
| Coolant (5L 50% glycol)      |  1  |    EUR20   |     EUR20     |
+------------------------------+-----+------------+---------------+
| Hoses, fittings, clamps      | set |    EUR80   |     EUR80     |
+------------------------------+-----+------------+---------------+
| TIM (Phase change pads)      |  6  |    EUR10   |     EUR60     |
+------------------------------+-----+------------+---------------+
| Heatsinks for PCB components | set |    EUR50   |     EUR50     |
+------------------------------+-----+------------+---------------+
| Temperature sensors (NTC)    | 15  |     EUR2   |     EUR30     |
+------------------------------+-----+------------+---------------+
| Pre-heat element (1kW)       |  1  |    EUR50   |     EUR50     |
+------------------------------+-----+------------+---------------+
| TOTAL THERMAL                                   |   EUR1,240    |
+---------------------------------------------------------------+
```

## 7. Conclusion

```
Recommendations for Thermal Management:

1. Cooling Strategy:
   +-- Power modules: Liquid cooling (mandatory for >50kW)
   +-- Magnetics: Air cooling (forced)
   +-- Capacitors: Air cooling + positioning
   +-- Control: Conduction + minimal airflow

2. System Design:
   +-- Cold plate: Brazed channel for best performance
   +-- Radiator: Oversized 20% for margin
   +-- Pump: Automotive grade, PWM controlled
   +-- Fans: IP54+, low noise, redundant

3. Control:
   +-- Multi-zone temperature monitoring
   +-- Predictive derating (before limits)
   +-- Pre-conditioning for extreme temps
   +-- Redundant sensors for critical points

4. Reliability:
   +-- Coolant: Ethylene glycol, 2-year life
   +-- Pump: >40,000 hours MTBF
   +-- Filters: Serviceable, 1-year interval
   +-- Sensors: Dual for critical points

5. Testing:
   +-- Thermal cycling validation
   +-- Altitude derating verification
   +-- Extreme temperature operation
   +-- Failure mode analysis
```
