# JEZGRO-BAT: Battery Management System Firmware

**Version:** 1.0
**Date:** 2026-01-04
**Status:** SPECIFICATION

---

## Document Purpose

This document specifies **JEZGRO-BAT**, the JEZGRO microkernel variant for EK-BAT battery module BMS controllers. JEZGRO-BAT provides fault-tolerant cell monitoring, balancing, and swarm coordination for the EK-BAT-25/50/100 battery family.

---

## 1. Overview

### 1.1 BMS Requirements

The EK-BAT battery modules require sophisticated battery management:

| Requirement | Specification |
|-------------|---------------|
| Cell count | 96-224 cells (depending on module size) |
| Voltage monitoring | ±2 mV accuracy |
| Temperature monitoring | ±1°C accuracy, 8-16 sensors per module |
| Balancing | Passive (100mA) + Active (optional, 1A) |
| SOC accuracy | ±3% over full range |
| SOH tracking | Capacity fade, impedance growth |
| Communication | CAN-FD @ 5 Mbps to vehicle and charger |
| Safety | Hardware OVP/UVP, thermal runaway detection |

### 1.2 Why JEZGRO for BMS?

Traditional BMS firmware is monolithic - a single failure can disable the entire battery. JEZGRO-BAT provides:

```
┌─────────────────────────────────────────────────────────────────┐
│                    JEZGRO-BAT ADVANTAGES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   TRADITIONAL BMS              JEZGRO-BAT                       │
│   ───────────────              ──────────                        │
│   ┌─────────────────┐         ┌─────────────────┐               │
│   │ Monolithic      │         │ Isolated Services│               │
│   │ Firmware        │         │ ┌─────┐ ┌─────┐ │               │
│   │                 │         │ │CELL │ │BAL  │ │               │
│   │ One bug =       │         │ │MON  │ │     │ │               │
│   │ Total failure   │         │ └──┬──┘ └──┬──┘ │               │
│   │                 │         │    │       │    │               │
│   └────────┬────────┘         │ ┌──┴───────┴──┐ │               │
│            │                  │ │   KERNEL    │ │               │
│            ▼                  │ │ (restarts   │ │               │
│      Battery offline          │ │  failed     │ │               │
│      Vehicle stranded         │ │  services)  │ │               │
│                               │ └─────────────┘ │               │
│                               │                 │               │
│                               │ One bug =       │               │
│                               │ Service restart │               │
│                               │ Battery online  │               │
│                               └─────────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| Benefit | Description |
|---------|-------------|
| **Fault Isolation** | Cell monitoring crash doesn't affect balancing |
| **Automatic Recovery** | Failed service restarts in <50ms |
| **Consistent API** | Same development model as EK3, rack controller |
| **Swarm Ready** | Multi-battery coordination built-in |
| **OTA Updates** | Update individual services without full reflash |

### 1.3 Target Hardware

| Parameter | EK-BAT-25 | EK-BAT-50 | EK-BAT-100 |
|-----------|-----------|-----------|------------|
| Capacity | 25 kWh | 50 kWh | 100 kWh |
| Voltage | 400V (350-450V) | 400V (350-450V) | 800V (700-900V) |
| Cell config | 96S (LFP) | 128S (LFP) | 224S (LFP) |
| MCU | STM32G474 | STM32G474 | STM32G474 |
| AFE | BQ76952 ×2 | BQ76952 ×3 | BQ76952 ×5 |

---

## 2. Architecture

### 2.1 Service Configuration

| ID | Service | Priority | Stack | Memory | Watchdog | Purpose |
|----|---------|----------|-------|--------|----------|---------|
| 0 | KERNEL | - | 2 KB | 8 KB | - | Core (privileged) |
| 1 | CELL_MONITOR | CRITICAL | 2 KB | 16 KB | 50 ms | Cell voltage/temp reading |
| 2 | BALANCING | HIGH | 2 KB | 8 KB | 200 ms | Cell balancing control |
| 3 | SOC_SOH | MEDIUM | 4 KB | 16 KB | 500 ms | State estimation |
| 4 | THERMAL_MGR | MEDIUM | 2 KB | 8 KB | 500 ms | Cooling loop control |
| 5 | ROJ_COORD | MEDIUM | 4 KB | 16 KB | 1000 ms | Multi-battery coordination |
| 6 | CAN_HANDLER | HIGH | 2 KB | 8 KB | 100 ms | Vehicle/charger comms |
| 7 | AUDIT_LOGGER | LOW | 4 KB | 16 KB | 2000 ms | Event logging |

**Total RAM:** ~86 KB of 128 KB available

### 2.2 Memory Map

```
┌─────────────────────────────────────────────────┐  0x2001FFFF (128 KB)
│                                                 │
│        AUDIT_LOGGER Memory (16 KB)              │
│        (ring buffer, flash queue)               │
├─────────────────────────────────────────────────┤  0x2001C000
│        ROJ_COORD Memory (16 KB)               │
│        (peer table, election state)             │
├─────────────────────────────────────────────────┤  0x20018000
│        SOC_SOH Memory (16 KB)                   │
│        (Kalman state, history buffer)           │
├─────────────────────────────────────────────────┤  0x20014000
│        CELL_MONITOR Memory (16 KB)              │
│        (cell data arrays, calibration)          │
├─────────────────────────────────────────────────┤  0x20010000
│        Other Services (24 KB)                   │
│        (BALANCING, THERMAL, CAN_HANDLER)        │
├─────────────────────────────────────────────────┤  0x2000A000
│        IPC Message Pool (16 KB)                 │
│        256 messages × 64 bytes                  │
├─────────────────────────────────────────────────┤  0x20006000
│        Service Stacks (16 KB)                   │
│        (2 KB × 8 services)                      │
├─────────────────────────────────────────────────┤  0x20002000
│        Kernel Data + Stack (8 KB)               │
└─────────────────────────────────────────────────┘  0x20000000
```

### 2.3 Hardware Interface

```
┌─────────────────────────────────────────────────────────────────┐
│                    JEZGRO-BAT HARDWARE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                   STM32G474 MCU                          │   │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │   │
│   │  │  SPI1   │ │  I2C1   │ │ CAN-FD  │ │  ADC    │        │   │
│   │  │ (AFE)   │ │ (Temp)  │ │ (Comms) │ │ (Curr)  │        │   │
│   │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘        │   │
│   └───────┼───────────┼───────────┼───────────┼─────────────┘   │
│           │           │           │           │                  │
│           ▼           ▼           ▼           ▼                  │
│   ┌───────────┐ ┌───────────┐ ┌───────┐ ┌───────────┐           │
│   │ BQ76952   │ │ NTC/PT100 │ │Vehicle│ │ Hall/Shunt│           │
│   │ AFE ×2-5  │ │ Sensors   │ │Charger│ │ Current   │           │
│   │ (isoSPI)  │ │ (8-16)    │ │       │ │ Sensor    │           │
│   └───────────┘ └───────────┘ └───────┘ └───────────┘           │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    BATTERY CELLS                         │   │
│   │   ┌───┬───┬───┬───┬───┬───┬───┬───┐                     │   │
│   │   │ 1 │ 2 │ 3 │...│...│...│...│ N │  96-224 cells       │   │
│   │   └───┴───┴───┴───┴───┴───┴───┴───┘                     │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Cell Monitoring Service

### 3.1 Service Definition

```c
JEZGRO_SERVICE_DEFINE(cell_monitor,
    .priority = JEZGRO_PRIORITY_CRITICAL,
    .stack_size = 2048,
    .memory_size = 16384,
    .watchdog_ms = 50
);

void cell_monitor_main(void) {
    cell_data_t cells[MAX_CELLS];

    // Initialize AFE chain
    afe_init_chain();

    while (1) {
        jezgro_watchdog_feed();

        // Read all cell voltages (10-20ms)
        afe_read_all_voltages(cells);

        // Read cell temperatures
        afe_read_all_temperatures(cells);

        // Check limits
        for (int i = 0; i < cell_count; i++) {
            if (cells[i].voltage > OVP_THRESHOLD ||
                cells[i].voltage < UVP_THRESHOLD) {
                // Send fault message
                jezgro_msg_t msg = {
                    .type = MSG_CELL_FAULT,
                    .payload.cell_id = i,
                    .payload.voltage = cells[i].voltage
                };
                jezgro_send(SVC_SAFETY, &msg);
            }
        }

        // Publish cell data for other services
        publish_cell_data(cells);

        jezgro_sleep(20);  // 50 Hz update rate
    }
}
```

### 3.2 AFE Interface (BQ76952)

The BQ76952 AFE monitors up to 16 cells. Multiple AFEs are daisy-chained via isoSPI:

```
┌─────────────────────────────────────────────────────────────────┐
│                    AFE DAISY CHAIN (EK-BAT-50)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   STM32G474                                                      │
│   ┌───────┐                                                      │
│   │ SPI1  │───────────────┐                                     │
│   └───────┘               │                                     │
│                           ▼                                     │
│                    ┌─────────────┐                              │
│                    │  BQ76952 #1 │ Cells 1-16                   │
│                    │  (Master)   │                              │
│                    └──────┬──────┘                              │
│                           │ isoSPI                              │
│                    ┌──────▼──────┐                              │
│                    │  BQ76952 #2 │ Cells 17-32                  │
│                    └──────┬──────┘                              │
│                           │ isoSPI                              │
│                    ┌──────▼──────┐                              │
│                    │  BQ76952 #3 │ Cells 33-48 (+ remaining)    │
│                    └─────────────┘                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Data Structures

```c
typedef struct {
    uint16_t voltage_mv;      // Cell voltage in mV (2000-4200)
    int8_t   temperature_c;   // Cell temperature in °C (-40 to +85)
    uint8_t  flags;           // OVP, UVP, OTP, balancing active
} cell_state_t;

typedef struct {
    uint8_t      module_id;
    uint8_t      cell_count;
    cell_state_t cells[MAX_CELLS];
    uint32_t     pack_voltage_mv;
    int32_t      pack_current_ma;
    uint32_t     timestamp;
} cell_data_t;
```

### 3.4 Fault Detection

| Fault | Threshold | Action |
|-------|-----------|--------|
| Cell overvoltage | >3.65V (LFP) | Immediate charge stop |
| Cell undervoltage | <2.5V (LFP) | Immediate discharge stop |
| Cell overtemperature | >55°C | Derate, then stop |
| Cell undertemperature | <-20°C | Disable charging |
| Delta voltage | >100mV | Flag for balancing |
| Communication loss | >100ms | Use last known + flag |

---

## 4. Balancing Service

### 4.1 Service Definition

```c
JEZGRO_SERVICE_DEFINE(balancing,
    .priority = JEZGRO_PRIORITY_HIGH,
    .stack_size = 2048,
    .memory_size = 8192,
    .watchdog_ms = 200
);

void balancing_main(void) {
    balance_state_t state;

    while (1) {
        jezgro_watchdog_feed();

        // Wait for cell data
        jezgro_msg_t msg;
        if (jezgro_receive(SVC_CELL_MONITOR, &msg, 100) == JEZGRO_OK) {
            cell_data_t* cells = msg.payload.cells;

            // Calculate target voltage (lowest + margin)
            uint16_t target = calculate_balance_target(cells);

            // Enable balancing on high cells
            for (int i = 0; i < cell_count; i++) {
                if (cells->cells[i].voltage_mv > target + BALANCE_HYSTERESIS) {
                    enable_balance(i);
                } else {
                    disable_balance(i);
                }
            }
        }

        // Thermal limit check
        if (get_max_temperature() > BALANCE_THERMAL_LIMIT) {
            disable_all_balancing();
        }
    }
}
```

### 4.2 Passive Balancing

Passive balancing dissipates energy from high cells through resistors:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PASSIVE BALANCING CIRCUIT                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Cell N ────┬───────────────────────────────── Cell N+1        │
│              │                                                   │
│              │    ┌─────────┐                                   │
│              ├────┤  33Ω    ├────┐                              │
│              │    │ (1W)    │    │                              │
│              │    └─────────┘    │                              │
│              │                   │                              │
│              │    ┌─────────┐    │                              │
│              └────┤ MOSFET  ├────┘                              │
│                   │ (BQ76952│                                   │
│                   │ internal)│                                   │
│                   └────┬────┘                                   │
│                        │                                        │
│                   Control from AFE                              │
│                                                                  │
│   Balance current: ~100mA @ 3.3V                                │
│   Power dissipation: ~330mW per cell                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| Parameter | Value |
|-----------|-------|
| Balance resistor | 33Ω, 1W |
| Balance current | ~100mA |
| Max cells balancing simultaneously | 8 (thermal limit) |
| Balance start threshold | Vcell > Vmin + 50mV |
| Balance stop threshold | Vcell < Vmin + 20mV |

### 4.3 Active Balancing (Optional)

For faster balancing, active balancing transfers energy between cells:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACTIVE BALANCING (FLYBACK)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   High Cell ──┬──────┬──────────────────── Pack Bus             │
│               │      │                                          │
│               │   ┌──┴──┐                                       │
│               │   │     │ Flyback                               │
│               │   │ ))) │ Transformer                           │
│               │   │ ((( │                                       │
│               │   └──┬──┘                                       │
│               │      │                                          │
│          ┌────┴────┐ │                                          │
│          │ MOSFET  │ │                                          │
│          │ Switch  │ │                                          │
│          └────┬────┘ │                                          │
│               │      │                                          │
│   GND ────────┴──────┴──────────────────── Pack GND             │
│                                                                  │
│   Balance current: ~1A                                          │
│   Efficiency: ~85%                                              │
│   Energy recovery: Yes (to pack bus)                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. SOC/SOH Estimation Service

### 5.1 Service Definition

```c
JEZGRO_SERVICE_DEFINE(soc_soh,
    .priority = JEZGRO_PRIORITY_MEDIUM,
    .stack_size = 4096,
    .memory_size = 16384,
    .watchdog_ms = 500
);

void soc_soh_main(void) {
    ekf_state_t ekf;
    soh_tracker_t soh;

    // Initialize Kalman filter
    ekf_init(&ekf);
    soh_init(&soh);

    while (1) {
        jezgro_watchdog_feed();

        // Get latest cell data
        cell_data_t cells;
        get_latest_cell_data(&cells);

        // Run EKF update
        float soc = ekf_update(&ekf,
                               cells.pack_voltage_mv,
                               cells.pack_current_ma);

        // Update SOH (slow, capacity fade tracking)
        float soh_pct = soh_update(&soh, soc, cells.pack_current_ma);

        // Publish results
        publish_soc_soh(soc, soh_pct);

        // Check for full/empty conditions
        if (soc < SOC_EMPTY_THRESHOLD) {
            send_empty_warning();
        }

        jezgro_sleep(100);  // 10 Hz update
    }
}
```

### 5.2 Extended Kalman Filter

SOC estimation uses an Extended Kalman Filter combining:
- Coulomb counting (current integration)
- OCV-SOC lookup (voltage-based)
- Model-based prediction (RC equivalent circuit)

```
┌─────────────────────────────────────────────────────────────────┐
│                    EKF SOC ESTIMATION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   State Vector: x = [SOC, V_RC1, V_RC2]^T                       │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                   BATTERY MODEL                          │   │
│   │                                                          │   │
│   │   V_terminal = OCV(SOC) - I*R0 - V_RC1 - V_RC2          │   │
│   │                                                          │   │
│   │   ┌───┐   ┌───────┐   ┌───────┐                         │   │
│   │   │R0 │───┤R1  C1 ├───┤R2  C2 ├───┬─── V_terminal       │   │
│   │   └───┘   └───────┘   └───────┘   │                     │   │
│   │                                    │                     │   │
│   │   OCV(SOC) ────────────────────────┘                    │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Prediction:                                                    │
│     SOC_k+1 = SOC_k - (I * dt) / Q_nominal                     │
│     V_RCi_k+1 = V_RCi_k * exp(-dt/tau_i) + Ri*I*(1-exp(-dt/tau))│
│                                                                  │
│   Update:                                                        │
│     Innovation: y = V_measured - V_predicted                    │
│     Kalman Gain: K = P * H^T * (H*P*H^T + R)^-1                │
│     x_updated = x_predicted + K * y                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 OCV-SOC Lookup Table (LFP)

```c
// OCV-SOC lookup for LiFePO4 at 25°C
const uint16_t ocv_soc_table[11] = {
    // mV at SOC = 0%, 10%, 20%, ... 100%
    2800,  // 0%
    3180,  // 10%
    3220,  // 20%
    3250,  // 30%
    3270,  // 40%
    3280,  // 50%
    3290,  // 60%
    3300,  // 70%
    3320,  // 80%
    3350,  // 90%
    3650   // 100%
};
```

### 5.4 SOH Tracking

State of Health tracks capacity fade and impedance growth:

| Parameter | Method | Frequency |
|-----------|--------|-----------|
| Capacity fade | Full cycle measurement | Every 10 cycles |
| Impedance growth | Pulse test analysis | Monthly or on-demand |
| Cycle count | Coulomb counting | Continuous |
| Calendar aging | Time-based model | Background |

```c
typedef struct {
    float capacity_ah;         // Current capacity (vs nominal)
    float impedance_mohm;      // Current impedance (vs initial)
    uint32_t cycle_count;      // Full equivalent cycles
    uint32_t operating_hours;  // Total hours in use
    float soh_capacity_pct;    // SOH based on capacity
    float soh_impedance_pct;   // SOH based on impedance
    float soh_combined_pct;    // Weighted combination
} soh_data_t;
```

---

## 6. Swarm Coordination Service

### 6.1 Multi-Battery Architecture

Vehicles may have multiple EK-BAT modules that coordinate via swarm intelligence:

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-BATTERY SWARM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   City Bus (12m) - 2× EK-BAT-50                                 │
│   ┌───────────────────────────────────────────────────────┐     │
│   │                                                        │     │
│   │   ┌─────────────┐         ┌─────────────┐             │     │
│   │   │ EK-BAT-50   │         │ EK-BAT-50   │             │     │
│   │   │ Module A    │◄───────►│ Module B    │             │     │
│   │   │ SOC: 75%    │  CAN-FD │ SOC: 72%    │             │     │
│   │   │ SOH: 98%    │         │ SOH: 95%    │             │     │
│   │   └──────┬──────┘         └──────┬──────┘             │     │
│   │          │                       │                     │     │
│   │          └───────────┬───────────┘                     │     │
│   │                      │                                 │     │
│   │              ┌───────▼───────┐                        │     │
│   │              │ Load Balancer │                        │     │
│   │              │ (ROJ_COORD) │                        │     │
│   │              │               │                        │     │
│   │              │ A: 52% load   │                        │     │
│   │              │ B: 48% load   │                        │     │
│   │              └───────────────┘                        │     │
│   │                                                        │     │
│   └───────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Service Definition

```c
JEZGRO_SERVICE_DEFINE(swarm_coord,
    .priority = JEZGRO_PRIORITY_MEDIUM,
    .stack_size = 4096,
    .memory_size = 16384,
    .watchdog_ms = 1000
);

void swarm_coord_main(void) {
    peer_table_t peers;
    load_balance_t lb;

    peer_table_init(&peers);

    while (1) {
        jezgro_watchdog_feed();

        // Announce our state
        broadcast_state(get_local_soc(), get_local_soh());

        // Receive peer states
        update_peer_table(&peers);

        // Calculate load distribution
        calculate_load_balance(&peers, &lb);

        // Apply local power limit
        set_local_power_limit(lb.my_share);

        // Health-aware decisions
        if (should_defer_to_healthier_peer(&peers)) {
            reduce_my_contribution();
        }

        jezgro_sleep(100);
    }
}
```

### 6.3 Load Balancing Algorithm

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOAD BALANCING ALGORITHM                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Input:                                                         │
│     P_total = Total power demand                                │
│     SOC_i = State of charge for battery i                       │
│     SOH_i = State of health for battery i                       │
│     T_i = Temperature for battery i                             │
│                                                                  │
│   Weight Calculation:                                            │
│     W_i = SOC_i × SOH_i × ThermalFactor(T_i)                   │
│                                                                  │
│     ThermalFactor(T) = 1.0           if T < 40°C               │
│                      = 1.0 - 0.02×(T-40)  if 40°C ≤ T < 50°C   │
│                      = 0.8 - 0.04×(T-50)  if T ≥ 50°C          │
│                                                                  │
│   Power Allocation:                                              │
│     P_i = P_total × (W_i / Σ W_j)                              │
│                                                                  │
│   Example (2 batteries):                                        │
│     Battery A: SOC=75%, SOH=98%, T=35°C → W_A = 0.75×0.98×1.0  │
│     Battery B: SOC=72%, SOH=95%, T=42°C → W_B = 0.72×0.95×0.96 │
│                                                                  │
│     W_A = 0.735,  W_B = 0.657                                   │
│     P_A = P_total × 0.735/1.392 = 52.8%                        │
│     P_B = P_total × 0.657/1.392 = 47.2%                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.4 CAN Protocol for Multi-Battery

| Message ID | Name | Frequency | Content |
|------------|------|-----------|---------|
| 0x100 + ID | BAT_STATUS | 10 Hz | SOC, SOH, voltage, current, temp |
| 0x180 + ID | BAT_LIMITS | 1 Hz | Max charge/discharge power |
| 0x200 + ID | BAT_COMMAND | On-demand | Power setpoint, mode |
| 0x280 + ID | BAT_FAULT | Event | Fault code, cell ID |

---

## 7. Integration

### 7.1 Vehicle Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                    VEHICLE INTEGRATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐     CAN-FD      ┌─────────────┐              │
│   │   Vehicle   │◄───────────────►│  EK-BAT     │              │
│   │   ECU       │                 │  BMS        │              │
│   └──────┬──────┘                 └──────┬──────┘              │
│          │                               │                      │
│          ▼                               ▼                      │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                  CAN MESSAGE FLOW                        │   │
│   │                                                          │   │
│   │   Vehicle → BMS:                                         │   │
│   │   • Power demand (kW)                                    │   │
│   │   • Charge enable/disable                                │   │
│   │   • Preconditioning request                              │   │
│   │                                                          │   │
│   │   BMS → Vehicle:                                         │   │
│   │   • SOC (%)                                              │   │
│   │   • Available power (kW charge/discharge)                │   │
│   │   • Pack voltage/current                                 │   │
│   │   • Temperature range                                    │   │
│   │   • Fault status                                         │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Swap Station Integration

During battery swap, the BMS communicates with the swap station:

| Phase | BMS Action |
|-------|------------|
| **Pre-swap** | Report SOC, SOH, fault status |
| **Disconnect** | Safe shutdown, contactor open |
| **Storage** | Low-power mode, periodic SOC check |
| **Reconnect** | Isolation test, contactor close |
| **Post-swap** | Full status report, ready for operation |

### 7.3 Charging Integration

```c
// Charging handshake with EK3 modules
void handle_charge_request(charge_request_t* req) {
    // Calculate charge limits based on SOC, temperature, SOH
    charge_limits_t limits;

    limits.max_voltage = calculate_charge_voltage();
    limits.max_current = calculate_charge_current();
    limits.target_soc = req->target_soc;

    // Temperature-based derating
    if (get_max_temperature() > 40) {
        limits.max_current *= 0.8;
    }

    // SOH-based derating for degraded cells
    if (get_soh() < 80) {
        limits.max_current *= 0.9;
    }

    // Send limits to charger
    send_charge_limits(&limits);
}
```

---

## 8. Safety Architecture

### 8.1 Hardware vs Software Protection

```
┌─────────────────────────────────────────────────────────────────┐
│                    SAFETY LAYERS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Layer 1: HARDWARE (cannot be bypassed)                        │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ • AFE internal OVP/UVP comparators                      │   │
│   │ • Hardware contactor control (independent MCU)          │   │
│   │ • Fuses (cell-level and pack-level)                    │   │
│   │ • Thermal fuses on cells                                │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Layer 2: FIRMWARE (JEZGRO services)                           │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ • CELL_MONITOR: Continuous voltage/temp checking       │   │
│   │ • SAFETY_MONITOR: Dedicated safety service (optional)  │   │
│   │ • Automatic service restart on fault                   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Layer 3: SYSTEM (vehicle/station level)                       │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ • Vehicle ECU monitors BMS heartbeat                   │   │
│   │ • Swap station verifies battery health                 │   │
│   │ • Fleet management tracks degradation                  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Fault Response Matrix

| Fault | Detection | Response | Recovery |
|-------|-----------|----------|----------|
| Cell OVP | AFE + firmware | Stop charge, open contactor | Auto after voltage drops |
| Cell UVP | AFE + firmware | Stop discharge, open contactor | Auto after charge |
| Cell OTP | NTC + firmware | Derate, then stop | Auto after cooldown |
| Balancing fault | Firmware | Disable balance FET | Manual inspection |
| AFE comm loss | Firmware | Use last known, flag warning | Auto on reconnect |
| SOC estimation fault | Firmware | Fall back to OCV method | Auto |
| Contactor weld | Firmware + vehicle | Emergency disconnect | Replace contactor |

---

## 9. Testing and Validation

### 9.1 Service-Level Tests

| Test | Purpose | Method |
|------|---------|--------|
| CELL_MONITOR timing | Verify 50Hz update rate | Logic analyzer on SPI |
| BALANCING accuracy | Verify cell convergence | Discharge test |
| SOC_SOH accuracy | Verify ±3% SOC | Full cycle test |
| ROJ_COORD fairness | Verify load distribution | Multi-battery test |
| Fault injection | Verify recovery | Kill services, check restart |

### 9.2 Integration Tests

| Test | Purpose | Pass Criteria |
|------|---------|---------------|
| Vehicle integration | CAN protocol compliance | All messages parsed |
| Swap station handshake | Safe disconnect/reconnect | No contactor faults |
| Charging profile | Proper CC/CV charging | SOC reaches 100% |
| Multi-battery balance | Equal SOC convergence | <2% delta after 1h |

### 9.3 Environmental Tests

| Test | Conditions | Duration |
|------|------------|----------|
| High temp operation | 55°C ambient | 8 hours |
| Low temp charging | -20°C | Charge to 80% |
| Thermal cycling | -20°C to +55°C | 100 cycles |
| Vibration | Per ISO 16750-3 | 8 hours per axis |

---

## 10. Cross-References

| Document | Relationship |
|----------|--------------|
| `tehnika/inzenjersko/en/21-jezgro-product-family.md` | JEZGRO product family |
| `tehnika/inzenjersko/en/16-jezgro.md` | Base JEZGRO specification |
| `tehnika/inzenjersko/en/SPECIFICATIONS.md` | EK-BAT module specs |
| `tehnika/inzenjersko/en/05-swap-station.md` | Swap station integration |
| `tehnika/konceptualno/en/02-swarm-intelligence.md` | Swarm algorithms |

---

## Change History

| Date | Version | Description |
|------|---------|-------------|
| 2026-01-04 | 1.0 | Initial JEZGRO-BAT specification |
