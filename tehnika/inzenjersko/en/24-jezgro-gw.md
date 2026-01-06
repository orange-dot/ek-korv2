# JEZGRO-GW: Gateway and Protocol Adapter Firmware

**Version:** 1.0
**Date:** 2026-01-04
**Status:** SPECIFICATION

---

## Document Purpose

This document specifies **JEZGRO-GW**, the JEZGRO microkernel variant for protocol gateways and V2G adapters. JEZGRO-GW provides fault-tolerant grid synchronization, bidirectional power control, and protocol translation for integrating diverse devices into the ELEKTROKOMBINACIJA ecosystem.

---

## 1. Overview

### 1.1 Gateway Requirements

Protocol gateways bridge different systems and standards:

| Gateway Type | Primary Function | Complexity |
|--------------|------------------|------------|
| **EK-ADAPT-V2G** | Non-EK vehicles → V2G network | High (full V2G stack) |
| **EK-ADAPT-BUS** | Legacy bus retrofit | Medium (protocol translation) |
| **EK-ADAPT-CCS** | CCS Combo to EK bridge | High (ISO 15118 + SLAC) |
| **EK-ADAPT-MCS** | Megawatt Charging adapter | High (MCS + CharIN protocol) |
| **EK-ADAPT-OCPP** | Third-party charger gateway | Medium (OCPP 2.0.1) |

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    JEZGRO-GW GATEWAY ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   EXTERNAL WORLD                        ELEKTROKOMBINACIJA ECOSYSTEM         │
│                                                                              │
│   ┌─────────────┐      ┌─────────────────────────┐      ┌─────────────┐     │
│   │ Third-party │      │      JEZGRO-GW          │      │   EK3       │     │
│   │ EV          │◄────►│  ┌─────────────────┐   │◄────►│   Modules   │     │
│   │ (non-EK)    │      │  │ Protocol Stack  │   │      │             │     │
│   └─────────────┘      │  │ ┌─────┐ ┌─────┐ │   │      └─────────────┘     │
│                        │  │ │ISO  │ │CAN  │ │   │                          │
│   ┌─────────────┐      │  │ │15118│ │-FD  │ │   │      ┌─────────────┐     │
│   │ Grid        │◄────►│  │ └─────┘ └─────┘ │   │◄────►│   Station   │     │
│   │ Connection  │      │  └─────────────────┘   │      │   Controller│     │
│   └─────────────┘      │                        │      └─────────────┘     │
│                        │  ┌─────────────────┐   │                          │
│   ┌─────────────┐      │  │ V2G Control     │   │      ┌─────────────┐     │
│   │ Cloud       │◄────►│  │ ┌─────┐ ┌─────┐ │   │◄────►│   Fleet     │     │
│   │ (OCPP)      │      │  │ │PLL  │ │Droop│ │   │      │   Management│     │
│   └─────────────┘      │  │ └─────┘ └─────┘ │   │      └─────────────┘     │
│                        │  └─────────────────┘   │                          │
│                        └─────────────────────────┘                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Why JEZGRO for Gateways?

Gateways handle multiple concurrent protocols with real-time requirements:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    JEZGRO-GW ADVANTAGES                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   TRADITIONAL GATEWAY               JEZGRO-GW                                │
│   ──────────────────────            ──────────                               │
│   ┌─────────────────────┐          ┌─────────────────────┐                  │
│   │ Monolithic          │          │ Isolated Services   │                  │
│   │ Protocol Handler    │          │ ┌─────┐ ┌─────┐    │                  │
│   │                     │          │ │PLL  │ │ISO  │    │                  │
│   │ ISO 15118 bug =     │          │ │SYNC │ │15118│    │                  │
│   │ Total system crash  │          │ └──┬──┘ └──┬──┘    │                  │
│   │                     │          │    │       │       │                  │
│   │ Grid sync lost      │          │ ┌──┴───────┴──┐    │                  │
│   │                     │          │ │   KERNEL    │    │                  │
│   └─────────────────────┘          │ │ (restarts   │    │                  │
│                                    │ │  services)  │    │                  │
│                                    │ └─────────────┘    │                  │
│                                    │                    │                  │
│                                    │ ISO 15118 crash =  │                  │
│                                    │ Service restart    │                  │
│                                    │ Grid sync preserved│                  │
│                                    └────────────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Benefit | Description |
|---------|-------------|
| **Protocol Isolation** | ISO 15118 crash doesn't affect grid sync |
| **Real-time Guarantees** | PLL runs at CRITICAL priority, always scheduled |
| **Graceful Degradation** | Communication loss → fall back to local control |
| **Automatic Recovery** | Protocol stack restart in <100ms |
| **Unified Platform** | Same JEZGRO across all adapters |

### 1.3 Hardware Selection

JEZGRO-GW uses STM32H743 for computational headroom:

| Parameter | STM32G474 | STM32H743 (GW) | Reason |
|-----------|-----------|----------------|--------|
| Core | Cortex-M4 @ 170 MHz | Cortex-M7 @ 480 MHz | Protocol stacks |
| Flash | 512 KB | 2 MB | Large stacks |
| RAM | 128 KB | 1 MB | Buffers, TLS |
| FPU | Single-precision | Double-precision | Control math |
| Ethernet | No | Yes (MAC) | OCPP, ISO 15118 |
| USB | USB FS | USB HS + OTG | ISO 15118-3 |
| CAN-FD | 3 | 2 | Internal CAN |
| Price | ~$8 | ~$15 | Worth it |

**Why H743 for gateways:**
- 1 MB RAM for TLS buffers and protocol state machines
- Ethernet MAC for OCPP and ISO 15118-20 communication
- USB High-Speed for PLC (Power Line Communication) modem
- More flash for large protocol stacks
- Hardware crypto acceleration (AES, SHA)

---

## 2. Architecture

### 2.1 Service Configuration (V2G Gateway)

| ID | Service | Priority | Stack | Memory | Watchdog | Purpose |
|----|---------|----------|-------|--------|----------|---------|
| 0 | KERNEL | - | 4 KB | 16 KB | - | Core (privileged) |
| 1 | PLL_SYNC | CRITICAL | 4 KB | 16 KB | 10 ms | Grid synchronization |
| 2 | CURRENT_CTRL | CRITICAL | 4 KB | 32 KB | 100 µs | dq-frame current control |
| 3 | DROOP_CTRL | HIGH | 4 KB | 16 KB | 10 ms | P(f), Q(V) droop |
| 4 | POWER_MGR | HIGH | 4 KB | 16 KB | 50 ms | Power flow coordination |
| 5 | ISO15118 | MEDIUM | 16 KB | 128 KB | 1000 ms | V2G protocol stack |
| 6 | SLAC | MEDIUM | 8 KB | 32 KB | 500 ms | Signal Level Attenuation |
| 7 | OCPP_CLIENT | LOW | 8 KB | 64 KB | 5000 ms | Backend communication |
| 8 | CAN_HANDLER | HIGH | 4 KB | 16 KB | 100 ms | Internal CAN-FD |
| 9 | AUDIT_LOGGER | LOW | 4 KB | 32 KB | 2000 ms | Event logging |

**Total RAM:** ~368 KB of 1 MB available

### 2.2 Service Configuration (Protocol Bridge)

For simpler protocol bridges (e.g., OCPP gateway):

| ID | Service | Priority | Stack | Memory | Watchdog | Purpose |
|----|---------|----------|-------|--------|----------|---------|
| 0 | KERNEL | - | 4 KB | 16 KB | - | Core (privileged) |
| 1 | PROTOCOL_A | MEDIUM | 8 KB | 64 KB | 1000 ms | Source protocol |
| 2 | PROTOCOL_B | MEDIUM | 8 KB | 64 KB | 1000 ms | Target protocol |
| 3 | TRANSLATOR | HIGH | 4 KB | 32 KB | 100 ms | Message translation |
| 4 | CAN_HANDLER | HIGH | 4 KB | 16 KB | 100 ms | Internal CAN-FD |
| 5 | ETHERNET | MEDIUM | 4 KB | 32 KB | 500 ms | Network stack |
| 6 | AUDIT_LOGGER | LOW | 4 KB | 32 KB | 2000 ms | Event logging |

**Total RAM:** ~256 KB of 1 MB available

### 2.3 Memory Map

```
┌─────────────────────────────────────────────────┐  0x240FFFFF (1 MB)
│                                                 │
│        ISO15118 Memory (128 KB)                 │
│        (V2G messages, state machine)            │
├─────────────────────────────────────────────────┤  0x240E0000
│        OCPP_CLIENT Memory (64 KB)               │
│        (JSON buffers, WebSocket)                │
├─────────────────────────────────────────────────┤  0x240D0000
│        SLAC Memory (32 KB)                      │
│        (PLC modem interface)                    │
├─────────────────────────────────────────────────┤  0x240C8000
│        CURRENT_CTRL Memory (32 KB)              │
│        (PID state, measurement history)         │
├─────────────────────────────────────────────────┤  0x240C0000
│        DROOP_CTRL Memory (16 KB)                │
│        (Droop parameters, ramp state)           │
├─────────────────────────────────────────────────┤  0x240BC000
│        PLL_SYNC Memory (16 KB)                  │
│        (PLL state, filter coefficients)         │
├─────────────────────────────────────────────────┤  0x240B8000
│        Other Services (64 KB)                   │
│        (POWER_MGR, CAN, AUDIT)                  │
├─────────────────────────────────────────────────┤  0x240A8000
│        IPC Message Pool (32 KB)                 │
│        512 messages × 64 bytes                  │
├─────────────────────────────────────────────────┤  0x240A0000
│        TLS Buffers (64 KB)                      │
│        (Secure communication)                   │
├─────────────────────────────────────────────────┤  0x24090000
│        Ethernet Buffers (64 KB)                 │
│        (DMA, TX/RX rings)                       │
├─────────────────────────────────────────────────┤  0x24080000
│        Service Stacks (64 KB)                   │
│        (8 KB × 8 services)                      │
├─────────────────────────────────────────────────┤  0x24070000
│        Reserved (448 KB)                        │
│        (future expansion)                       │
├─────────────────────────────────────────────────┤  0x24000000
│        D1 Domain RAM (128 KB)                   │
│        Kernel + TCM access                      │
└─────────────────────────────────────────────────┘  0x20000000
```

### 2.4 Hardware Interface

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    JEZGRO-GW HARDWARE (V2G Gateway)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        STM32H743 MCU                                 │   │
│   │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │   │
│   │  │ TIM1-2 │ │  ADC   │ │ CAN-FD │ │  ETH   │ │  USB   │ │ CRYP   │ │   │
│   │  │(PWM/Cap)│ │(V,I)   │ │(Internal)│ │(OCPP) │ │(PLC)   │ │(TLS)   │ │   │
│   │  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ │   │
│   └──────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┘   │
│          │          │          │          │          │          │           │
│          ▼          ▼          ▼          ▼          ▼          ▼           │
│   ┌──────────┐ ┌─────────┐ ┌───────┐ ┌─────────┐ ┌───────┐ ┌──────────┐    │
│   │ Inverter │ │ Voltage │ │Station│ │ Network │ │ PLC   │ │ Secure   │    │
│   │ Bridge   │ │ Current │ │ Ctrl  │ │ Switch  │ │ Modem │ │ Element  │    │
│   │          │ │ Sensors │ │       │ │         │ │(HomePlug)│          │    │
│   └──────────┘ └─────────┘ └───────┘ └─────────┘ └───────┘ └──────────┘    │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                       EXTERNAL INTERFACES                            │   │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│   │  │  Grid      │  │  Vehicle   │  │  Pilot     │  │  Proximity │    │   │
│   │  │  3-Phase   │  │  Connector │  │  Control   │  │  Detection │    │   │
│   │  │  AC/DC     │  │  (CCS)     │  │  (PWM)     │  │            │    │   │
│   └──┴────────────┴──┴────────────┴──┴────────────┴──┴────────────┴────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. PLL Synchronization Service

### 3.1 Service Definition

```c
JEZGRO_SERVICE_DEFINE(pll_sync,
    .priority = JEZGRO_PRIORITY_CRITICAL,
    .stack_size = 4096,
    .memory_size = 16384,
    .watchdog_ms = 10
);

void pll_sync_main(void) {
    PLL_State pll;

    PLL_Init(&pll);

    // Configure ADC for grid voltage sampling (10 kHz)
    adc_configure_grid_voltage(10000);

    while (1) {
        jezgro_watchdog_feed();

        // Wait for ADC conversion complete
        adc_wait_conversion();

        // Read grid voltages
        float Va = adc_read_voltage(CH_VA);
        float Vb = adc_read_voltage(CH_VB);
        float Vc = adc_read_voltage(CH_VC);

        // Update PLL
        PLL_Update(&pll, Va, Vb, Vc, TS_PLL);

        // Publish PLL state to other services
        publish_pll_state(&pll);

        // Check for grid loss
        if (!pll.locked) {
            jezgro_msg_t msg = {
                .type = MSG_GRID_UNLOCKED,
                .payload.voltage = PLL_GetVoltage(&pll)
            };
            jezgro_send_priority(SVC_POWER_MGR, &msg);
        }
    }
}
```

### 3.2 SRF-PLL Implementation

The Synchronous Reference Frame PLL tracks grid phase and frequency:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SRF-PLL STRUCTURE                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Grid Voltages                                                              │
│   Va,Vb,Vc ──► [Clarke] ──► Vα,Vβ ──► [Park(θ)] ──► Vd,Vq                   │
│                                            ▲                │               │
│                                            │                │               │
│                                            │                ▼               │
│                                            │         ┌─────────────┐        │
│                                            │         │     PI      │        │
│                                            │         │  Controller │        │
│                                            │         └──────┬──────┘        │
│                                            │                │ Δω            │
│                                            │                ▼               │
│                                            │         ┌─────────────┐        │
│                                            │         │    + ω_nom  │        │
│                                            │         └──────┬──────┘        │
│                                            │                │ ω             │
│                                            │                ▼               │
│                                            │         ┌─────────────┐        │
│                                            │         │  Integrator │        │
│                                            │         └──────┬──────┘        │
│                                            │                │ θ             │
│                                            └────────────────┘               │
│                                                                              │
│   When locked: Vq ≈ 0, Vd = grid voltage magnitude                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 PLL Performance Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| Settling time | < 50 ms | For 5% frequency step |
| Steady-state error | < 0.01 Hz | At stable grid |
| Phase error | < 1° | After settling |
| Bandwidth | ~20 Hz | Noise vs speed tradeoff |
| Sampling rate | 10 kHz | Matched to control loop |
| Lock detection | 100 ms | Vq < 5% of Vd |

### 3.4 Grid Code Compliance

| Parameter | ENTSO-E | VDE AR-N 4110 | EirGrid |
|-----------|---------|---------------|---------|
| Frequency range | 47.5-51.5 Hz | 47.5-51.5 Hz | 47.0-52.0 Hz |
| Voltage range | 0.85-1.10 pu | 0.90-1.10 pu | 0.90-1.10 pu |
| Response time | < 2 s | < 1 s | < 1 s |
| ROCOF tolerance | 2 Hz/s | 2 Hz/s | 1 Hz/s |

---

## 4. Current Controller Service

### 4.1 Service Definition

```c
JEZGRO_SERVICE_DEFINE(current_ctrl,
    .priority = JEZGRO_PRIORITY_CRITICAL,
    .stack_size = 4096,
    .memory_size = 32768,
    .watchdog_ms = 1  // 100 µs effective via timer
);

void current_ctrl_main(void) {
    CurrentController_State cc;

    CurrentController_Init(&cc, L_FILTER, R_FILTER, V_DC_NOM);

    // Configure high-speed timer for 10 kHz control loop
    jezgro_timer_start(TIMER_CURRENT_LOOP, 10000);

    while (1) {
        jezgro_watchdog_feed();

        // Wait for control loop tick
        jezgro_timer_wait(TIMER_CURRENT_LOOP);

        // Get PLL state (from shared memory)
        PLL_State* pll = get_pll_state();

        // Get power references (from DROOP_CTRL)
        float P_ref = get_power_reference();
        float Q_ref = get_reactive_reference();

        // Calculate current references
        float Vd = pll->Vd;
        float id_ref = P_ref / (1.5f * Vd);
        float iq_ref = Q_ref / (1.5f * Vd);

        // Read actual currents
        float Ia = adc_read_current(CH_IA);
        float Ib = adc_read_current(CH_IB);
        float Ic = adc_read_current(CH_IC);

        // Transform to dq frame
        float id_meas, iq_meas;
        abc_to_dq(Ia, Ib, Ic, pll->theta, &id_meas, &iq_meas);

        // Run current controller
        float Vd_ref, Vq_ref;
        CurrentController_Update(&cc,
                                 id_ref, iq_ref,
                                 id_meas, iq_meas,
                                 pll->Vd, pll->Vq,
                                 pll->omega,
                                 &Vd_ref, &Vq_ref,
                                 TS_CURRENT);

        // Generate PWM
        float duty_a, duty_b, duty_c;
        dq_to_pwm(Vd_ref, Vq_ref, pll->theta, V_DC,
                  &duty_a, &duty_b, &duty_c);

        pwm_update(duty_a, duty_b, duty_c);

        // Publish actual power
        float P_actual = 1.5f * Vd * id_meas;
        float Q_actual = 1.5f * Vd * iq_meas;
        publish_power(P_actual, Q_actual);
    }
}
```

### 4.2 Decoupled Control Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    dq CURRENT CONTROLLER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   P_ref ──► [÷1.5Vd] ──► id_ref ──►[─]──► [PI] ──► Vd_pi ──►[+]──► Vd_ref  │
│                             ▲       │                         ▲   │         │
│                        id_meas     │                         │   │         │
│                                    │                    Vd_grid  │         │
│                                    │                             │         │
│                                    └──► (-ωL×iq) ────────────────┘         │
│                                              │                              │
│                                     Decoupling term                         │
│                                                                              │
│   Q_ref ──► [÷1.5Vd] ──► iq_ref ──►[─]──► [PI] ──► Vq_pi ──►[+]──► Vq_ref  │
│                             ▲       │                         ▲   │         │
│                        iq_meas     │                         │   │         │
│                                    │                    Vq_grid  │         │
│                                    │                             │         │
│                                    └──► (+ωL×id) ────────────────┘         │
│                                                                              │
│   Vd_ref, Vq_ref ──► [Inverse Park] ──► [SVPWM] ──► Inverter                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 PI Tuning Parameters

| Parameter | Value | Derivation |
|-----------|-------|------------|
| Bandwidth (ωc) | 2π × 1000 rad/s | 1 kHz control bandwidth |
| Damping (ζ) | 0.707 | Critically damped |
| Kp | 2ζωcL - R ≈ 4.4 Ω | For L=0.5mH, R=0.1Ω |
| Ki | ωc²L ≈ 19740 Ω/s | Integral gain |
| Anti-windup | 0.9 × Vdc | Output voltage limit |

---

## 5. Droop Control Service

### 5.1 Service Definition

```c
JEZGRO_SERVICE_DEFINE(droop_ctrl,
    .priority = JEZGRO_PRIORITY_HIGH,
    .stack_size = 4096,
    .memory_size = 16384,
    .watchdog_ms = 10
);

void droop_ctrl_main(void) {
    FreqDroop_State freq_droop;
    VoltDroop_State volt_droop;

    FreqDroop_Init(&freq_droop, P_NOMINAL);
    VoltDroop_Init(&volt_droop, S_NOMINAL);

    while (1) {
        jezgro_watchdog_feed();

        // Get scheduled power from ISO 15118 or fleet management
        jezgro_msg_t msg;
        if (jezgro_receive(SVC_ISO15118, &msg, 0) == JEZGRO_OK) {
            if (msg.type == MSG_POWER_SCHEDULE) {
                FreqDroop_SetScheduledPower(&freq_droop, msg.payload.power);
            }
        }

        // Get PLL measurements
        PLL_State* pll = get_pll_state();
        float freq = pll->freq;
        float V_pu = PLL_GetVoltagePU(pll, V_GRID_NOMINAL);

        // Calculate P(f) droop
        float P_target = FreqDroop_Calculate(&freq_droop, freq);
        FreqDroop_ApplyRamp(&freq_droop, TS_DROOP);

        // Calculate Q(V) droop
        float Q_target = VoltDroop_Calculate(&volt_droop, V_pu, freq_droop.P_actual);
        VoltDroop_ApplyRamp(&volt_droop, RAMP_RATE_Q, TS_DROOP);

        // Publish power references
        set_power_reference(freq_droop.P_actual);
        set_reactive_reference(volt_droop.Q_actual);

        // Check for grid support events
        if (freq < F_CRITICAL || freq > F_CRITICAL_HIGH) {
            jezgro_msg_t alert = {
                .type = MSG_GRID_EMERGENCY,
                .payload.freq = freq
            };
            jezgro_send(SVC_POWER_MGR, &alert);
        }

        jezgro_sleep(1);  // 1 kHz droop update
    }
}
```

### 5.2 P(f) Droop Characteristic

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    P(f) DROOP CHARACTERISTIC                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   P/Pn (%)                                                                   │
│      ▲                                                                       │
│  +100│                         ┌────────── Pmax (charging)                  │
│      │                        /                                             │
│   +50│                       /                                              │
│      │                      /  ← Droop slope (4%)                           │
│    0 ├──────────────────────/───────────────────────────────► f (Hz)        │
│      │                     /│     │     │     │     │                       │
│   -50│                    / │     │     │     │     │                       │
│      │                   /  │     │     │     │     │                       │
│  -100│──────────────────/   │     │     │     │     │─── Pmax (V2G)         │
│      49.0    49.5    49.95 50.05  50.5  51.0                                │
│                                                                              │
│              ◄──── Under-frequency ────►◄── Deadband ──►◄── Over-freq ──►   │
│                                         (±50 mHz)                           │
│                                                                              │
│   Response:                                                                  │
│   - Under-frequency: Reduce charging (or discharge via V2G)                 │
│   - Over-frequency: Increase charging                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Q(V) Droop Characteristic

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Q(V) DROOP CHARACTERISTIC                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Q/Sn (%)                                                                   │
│      ▲                                                                       │
│   +44│                         ┌────────── Qmax (capacitive)                │
│      │                        /           Inject Q → raise voltage          │
│   +20│                       /                                              │
│      │                      /                                               │
│    0 ├─────────────────────/────────────────────────────────► V (pu)        │
│      │                    /│    │    │         │    │                       │
│   -20│                   / │    │    │         │    │                       │
│      │                  /  │    │    │         │    │                       │
│   -44│─────────────────/   │    │    │         │    │── Qmax (inductive)    │
│      0.90   0.92   0.94  0.95  1.0   1.05   1.08  1.10                      │
│                                                                              │
│              Under-voltage    Deadband      Over-voltage                    │
│              (inject Q)     (no action)     (absorb Q)                      │
│                                                                              │
│   Key advantage: No battery wear! Q is exchanged, not consumed.             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.4 Grid Code Parameters

| Parameter | ENTSO-E | VDE AR-N 4110 | UK G99 |
|-----------|---------|---------------|--------|
| Droop range | 2-12% | 2-12% | 3-5% |
| Deadband | ±10-500 mHz | ±10 mHz | ±15 mHz |
| Ramp rate | ≤10% Pn/min | ≤10% Pn/min | ≤1% Pn/s |
| Response time | ≤ 2 s | ≤ 1 s | ≤ 1 s |
| Q(V) enable | 0.90-1.10 pu | 0.95-1.05 pu | 0.95-1.05 pu |

---

## 6. ISO 15118 Service

### 6.1 Service Definition

```c
JEZGRO_SERVICE_DEFINE(iso15118,
    .priority = JEZGRO_PRIORITY_MEDIUM,
    .stack_size = 16384,
    .memory_size = 131072,  // 128 KB for V2G stack
    .watchdog_ms = 1000
);

void iso15118_main(void) {
    ISO15118_State state;
    V2G_Message msg_buf;

    ISO15118_Init(&state);

    while (1) {
        jezgro_watchdog_feed();

        // State machine based on ISO 15118-2/-20
        switch (state.session_state) {
            case V2G_SESSION_IDLE:
                // Wait for vehicle connection via SLAC
                if (check_vehicle_connected()) {
                    state.session_state = V2G_SESSION_SETUP;
                    send_session_setup_req(&state);
                }
                break;

            case V2G_SESSION_SETUP:
                if (receive_session_setup_res(&state, &msg_buf)) {
                    state.session_state = V2G_AUTH;
                    send_auth_req(&state);
                }
                break;

            case V2G_AUTH:
                // PnC (Plug and Charge) or EIM
                if (receive_auth_res(&state, &msg_buf)) {
                    if (state.auth_success) {
                        state.session_state = V2G_CHARGE_PARAM;
                    }
                }
                break;

            case V2G_CHARGE_PARAM:
                // Exchange charging parameters
                if (receive_charge_param_res(&state, &msg_buf)) {
                    // Check for BPT (Bidirectional Power Transfer)
                    if (state.bpt_supported) {
                        state.v2g_enabled = true;
                    }
                    state.session_state = V2G_POWER_DELIVERY;
                }
                break;

            case V2G_POWER_DELIVERY:
                // Active charging/discharging
                handle_power_delivery(&state);

                // Send power schedule to droop control
                jezgro_msg_t msg = {
                    .type = MSG_POWER_SCHEDULE,
                    .payload.power = state.scheduled_power
                };
                jezgro_send(SVC_DROOP_CTRL, &msg);
                break;

            case V2G_SESSION_STOP:
                send_session_stop_req(&state);
                state.session_state = V2G_SESSION_IDLE;
                break;
        }

        jezgro_sleep(100);  // 10 Hz protocol update
    }
}
```

### 6.2 ISO 15118-20 BPT Mode

Bidirectional Power Transfer (BPT) enables V2G operation:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ISO 15118-20 BPT SESSION                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   EVSE (Charger)                                 EV (Vehicle)                │
│        │                                              │                      │
│        │◄─────── SessionSetupReq ────────────────────│                      │
│        │──────── SessionSetupRes ───────────────────►│                      │
│        │                                              │                      │
│        │◄─────── AuthorizationReq ───────────────────│                      │
│        │──────── AuthorizationRes ──────────────────►│                      │
│        │                                              │                      │
│        │◄─────── ServiceDiscoveryReq ────────────────│                      │
│        │──────── ServiceDiscoveryRes ───────────────►│                      │
│        │         (includes BPT capability)           │                      │
│        │                                              │                      │
│        │◄─────── DC_BPT_ChargeParameterReq ─────────│                      │
│        │──────── DC_BPT_ChargeParameterRes ────────►│                      │
│        │         (max discharge power)               │                      │
│        │                                              │                      │
│        │◄─────── ScheduleExchangeReq ────────────────│                      │
│        │──────── ScheduleExchangeRes ───────────────►│                      │
│        │         (bidirectional schedule)            │                      │
│        │                                              │                      │
│        │◄─────── DC_BPT_ControlReq ─────────────────│                      │
│        │──────── DC_BPT_ControlRes ────────────────►│                      │
│        │         (active power exchange)             │                      │
│        │         ┌─────────────────────────────┐    │                      │
│        │         │ Repeat during V2G session   │    │                      │
│        │         └─────────────────────────────┘    │                      │
│        │                                              │                      │
│        │◄─────── PowerDeliveryReq (stop) ───────────│                      │
│        │──────── PowerDeliveryRes ─────────────────►│                      │
│        │                                              │                      │
│        │◄─────── SessionStopReq ────────────────────│                      │
│        │──────── SessionStopRes ───────────────────►│                      │
│        │                                              │                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Message Encoding (EXI)

ISO 15118 uses EXI (Efficient XML Interchange) for compact messaging:

```c
// EXI encoding for V2G messages
typedef struct {
    uint16_t session_id;
    uint8_t response_code;
    int32_t ev_max_power_w;
    int32_t ev_min_power_w;      // Negative for V2G
    uint8_t ev_soc_percent;
    int32_t evse_max_power_w;
    int32_t evse_min_power_w;    // Negative for V2G
    uint32_t departure_time;
} BPT_ChargeParam_t;

// Encode to EXI
size_t encode_bpt_charge_param(BPT_ChargeParam_t* param, uint8_t* buffer, size_t max_len);

// Decode from EXI
bool decode_bpt_charge_param(uint8_t* buffer, size_t len, BPT_ChargeParam_t* param);
```

---

## 7. OCPP Client Service

### 7.1 Service Definition

```c
JEZGRO_SERVICE_DEFINE(ocpp_client,
    .priority = JEZGRO_PRIORITY_LOW,
    .stack_size = 8192,
    .memory_size = 65536,  // 64 KB for JSON buffers
    .watchdog_ms = 5000
);

void ocpp_client_main(void) {
    OCPP_State state;

    OCPP_Init(&state, CSMS_URL, STATION_ID);

    while (1) {
        jezgro_watchdog_feed();

        // Maintain WebSocket connection
        if (!state.connected) {
            if (OCPP_Connect(&state) != OCPP_OK) {
                jezgro_sleep(5000);  // Retry after 5 seconds
                continue;
            }
            OCPP_SendBootNotification(&state);
        }

        // Process incoming messages
        OCPP_Message msg;
        if (OCPP_Receive(&state, &msg, 100) == OCPP_OK) {
            switch (msg.action) {
                case OCPP_SET_CHARGING_PROFILE:
                    handle_charging_profile(&state, &msg);
                    break;

                case OCPP_REMOTE_START:
                    handle_remote_start(&state, &msg);
                    break;

                case OCPP_REMOTE_STOP:
                    handle_remote_stop(&state, &msg);
                    break;

                case OCPP_GET_COMPOSITE_SCHEDULE:
                    handle_get_schedule(&state, &msg);
                    break;

                case OCPP_RESERVE_NOW:
                    handle_reservation(&state, &msg);
                    break;
            }
        }

        // Send periodic status updates
        if (time_since_last_status() > STATUS_INTERVAL) {
            OCPP_SendStatusNotification(&state);
        }

        // Send meter values
        if (time_since_last_meter() > METER_INTERVAL) {
            OCPP_SendMeterValues(&state);
        }

        jezgro_sleep(100);
    }
}
```

### 7.2 OCPP 2.0.1 Features for V2G

| Feature | Description | Message |
|---------|-------------|---------|
| **Bidirectional Charging** | V2G support | NotifyEVChargingSchedule |
| **Smart Charging** | Profile-based | SetChargingProfile |
| **Dynamic Pricing** | Price signals | SetVariables |
| **ISO 15118 Integration** | PnC, BPT | Get15118EVCertificate |
| **Grid Services** | FCR, aFRR | SetChargingProfile (absolute) |

### 7.3 Charging Profile Structure

```c
typedef struct {
    int32_t id;
    int32_t stack_level;
    ChargingProfilePurpose purpose;  // TxProfile, RecurringProfile, etc.
    ChargingProfileKind kind;        // Absolute, Relative, Recurring
    uint32_t valid_from;
    uint32_t valid_to;

    struct {
        uint32_t start_period;
        float limit;                 // Positive = charge, Negative = discharge
        int32_t number_phases;
    } periods[MAX_PERIODS];

    int32_t period_count;
} ChargingProfile;

// Example: V2G during peak (17:00-19:00)
ChargingProfile v2g_peak_profile = {
    .id = 1,
    .stack_level = 0,
    .purpose = TxDefaultProfile,
    .kind = Absolute,
    .periods = {
        { .start_period = 0,     .limit = 22000,  .number_phases = 3 },   // 22 kW charge
        { .start_period = 61200, .limit = -10000, .number_phases = 3 },   // 10 kW V2G @ 17:00
        { .start_period = 68400, .limit = 22000,  .number_phases = 3 },   // Resume @ 19:00
    },
    .period_count = 3
};
```

---

## 8. Integration Architecture

### 8.1 Service Communication Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SERVICE COMMUNICATION MAP                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        REAL-TIME DOMAIN                              │   │
│   │                                                                      │   │
│   │   ┌─────────────┐    θ,ω,Vd    ┌─────────────┐                      │   │
│   │   │  PLL_SYNC   │─────────────►│CURRENT_CTRL │                      │   │
│   │   │  (10 kHz)   │              │  (10 kHz)   │                      │   │
│   │   └──────┬──────┘              └──────▲──────┘                      │   │
│   │          │ θ,ω,V                      │ P_ref, Q_ref                │   │
│   │          ▼                            │                              │   │
│   │   ┌─────────────┐    P,Q      ┌──────┴──────┐                      │   │
│   │   │ DROOP_CTRL  │────────────►│             │                      │   │
│   │   │  (1 kHz)    │◄────────────│             │                      │   │
│   │   └──────┬──────┘   P_sched   │             │                      │   │
│   │          │                     │ POWER_MGR  │                      │   │
│   │          │                     │             │                      │   │
│   └──────────┼─────────────────────┼─────────────┼───────────────────────┘   │
│              │                     │             │                           │
│   ┌──────────┼─────────────────────┼─────────────┼───────────────────────┐   │
│   │          ▼                     ▼             │    PROTOCOL DOMAIN     │   │
│   │   ┌─────────────┐       ┌─────────────┐     │                        │   │
│   │   │  ISO15118   │◄─────►│ OCPP_CLIENT │     │                        │   │
│   │   │  (~10 Hz)   │       │  (~1 Hz)    │     │                        │   │
│   │   └─────────────┘       └─────────────┘     │                        │   │
│   │          ▲                     ▲            │                        │   │
│   │          │                     │            │                        │   │
│   │   ┌──────┴──────┐       ┌──────┴──────┐    │                        │   │
│   │   │    SLAC     │       │  ETHERNET   │    │                        │   │
│   │   │  (PLC)      │       │  (TCP/TLS)  │    │                        │   │
│   │   └─────────────┘       └─────────────┘    │                        │   │
│   │                                             │                        │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 CAN Protocol to Station Controller

| Message ID | Name | Frequency | Content |
|------------|------|-----------|---------|
| 0x600 | GW_STATUS | 10 Hz | Grid state, power, frequency |
| 0x610 | GW_PLL | 10 Hz | θ, ω, Vd, Vq, locked |
| 0x620 | GW_POWER | 10 Hz | P_actual, Q_actual, limits |
| 0x630 | GW_V2G | 1 Hz | V2G enabled, session state |
| 0x640 | GW_FAULT | Event | Fault code, description |
| 0x700 | STATION_CMD | On-demand | Power setpoint, mode |

### 8.3 State Machine

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GATEWAY STATE MACHINE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                                 ┌─────────┐                                 │
│                                 │  INIT   │                                 │
│                                 └────┬────┘                                 │
│                                      │ HW OK                                │
│                                      ▼                                      │
│                             ┌────────────────┐                              │
│                             │  GRID_SEARCH   │◄───────────────┐            │
│                             │  (PLL locking) │                │            │
│                             └────────┬───────┘                │            │
│                                      │ PLL locked             │            │
│                                      ▼                        │            │
│                             ┌────────────────┐                │            │
│                          ┌─►│   STANDBY      │◄──┐            │            │
│                          │  │  (grid sync)   │   │            │            │
│                          │  └────────┬───────┘   │            │ Grid lost  │
│                          │           │ Vehicle   │            │            │
│           Session stop   │           │ connected │ Session    │            │
│                          │           ▼           │ stop       │            │
│                          │  ┌────────────────┐   │            │            │
│                          │  │  V2G_SESSION   │───┘            │            │
│                          │  │ (ISO 15118)    │                │            │
│                          │  └────────┬───────┘                │            │
│                          │           │ Authorized             │            │
│                          │           ▼                        │            │
│                          │  ┌────────────────┐                │            │
│                          └──│   CHARGING     │────────────────┘            │
│                             │ or DISCHARGING │                              │
│                             └────────────────┘                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Testing and Validation

### 9.1 Service-Level Tests

| Test | Purpose | Method |
|------|---------|--------|
| PLL lock time | Verify < 50 ms | Step change grid voltage |
| Current loop bandwidth | Verify 1 kHz | Frequency response |
| Droop response | Verify grid code | Frequency step test |
| ISO 15118 compliance | Protocol conformance | TTCN-3 test suite |
| OCPP compliance | Backend integration | OCPP test tool |

### 9.2 Integration Tests

| Test | Purpose | Pass Criteria |
|------|---------|---------------|
| Grid sync + charging | Full power flow | Stable at rated power |
| V2G discharge | Bidirectional | Discharge to grid |
| Grid event response | Droop activation | < 1 s response |
| Communication loss | Graceful degradation | Local control continues |
| Service restart | Fault recovery | < 100 ms restart |

### 9.3 Grid Code Tests

| Test | Standard | Criteria |
|------|----------|----------|
| LVRT | IEC 61000 | Ride through 0.3 pu for 150 ms |
| Frequency response | EN 50549 | 4% droop, < 2 s |
| Anti-islanding | IEC 62116 | Trip < 2 s |
| Harmonics | EN 61000-3-12 | THD < 5% |

---

## 10. Cross-References

| Document | Relationship |
|----------|--------------|
| `tehnika/inzenjersko/en/21-jezgro-product-family.md` | JEZGRO product family |
| `tehnika/inzenjersko/en/16-jezgro.md` | Base JEZGRO specification |
| `tehnika/inzenjersko/en/07-v2g-control.md` | V2G algorithm details |
| `tehnika/inzenjersko/en/08-iso15118-bpt.md` | ISO 15118 BPT mode |
| `tehnika/inzenjersko/en/25-adapter-devices.md` | Adapter hardware specs |

---

## Change History

| Date | Version | Description |
|------|---------|-------------|
| 2026-01-04 | 1.0 | Initial JEZGRO-GW specification |
