# Sigurnosni Sustavi za EV Punjače

## 1. Sigurnosni Standardi

### 1.1 Primenjivi Standardi

```
Ključni Standardi za Sigurnost EV Punjača:

┌─────────────────────────────────────────────────────────────────┐
│ Standard           │ Opis                                       │
├────────────────────┼────────────────────────────────────────────┤
│ IEC 61851-1        │ Opšti zahtevi za EV charging opremu        │
│ IEC 61851-23       │ DC EV charging stations                    │
│ IEC 62040-1        │ UPS safety requirements (reference)        │
│ IEC 60950-1/62368  │ IT equipment safety                        │
│ IEC 61000-x        │ EMC requirements                           │
│ IEC 60529          │ IP protection ratings                      │
│ IEC 61140          │ Protection against electric shock          │
│ IEC 60364          │ Electrical installations                   │
│ ISO 6469           │ EV safety specifications                   │
│ ISO 17409          │ Conductive charging safety                 │
│ UL 2594/2202       │ North American EV charging requirements    │
└─────────────────────────────────────────────────────────────────┘

Functional Safety (opcionalno, za kritične primene):
├── IEC 61508: Functional safety of E/E/PE systems
├── ISO 26262: Automotive functional safety
└── IEC 62443: Industrial cybersecurity
```

### 1.2 Zahtevi za Zaštitu

```
Protection Requirements per IEC 61851-23:

1. Electrical Protection:
   ├── Overcurrent protection
   ├── Overvoltage protection
   ├── Ground fault protection (RCD)
   ├── Insulation monitoring
   └── Short circuit protection

2. Mechanical Protection:
   ├── IP rating (IP54 minimum za outdoor)
   ├── Impact resistance (IK rating)
   ├── Cable strain relief
   └── Connector locking mechanism

3. Thermal Protection:
   ├── Overtemperature shutdown
   ├── Cooling system monitoring
   └── Fire resistance materials

4. Control System Safety:
   ├── Emergency stop functionality
   ├── Contactor welding detection
   ├── Watchdog timer
   └── Fail-safe design
```

## 2. Zaštita od Strujnog Udara

### 2.1 RCD (Residual Current Device)

```
RCD Zahtevi za DC Punjače:

Prema IEC 61851-23:
- Zaštita od AC i DC ground faults
- Type B RCD obavezan za DC punjenje
- Reakcija: ≤30 mA AC, ≤6 mA DC

RCD Tipovi:

┌─────────────────────────────────────────────────────────────────┐
│ Type │ Detects                              │ Use Case          │
├──────┼──────────────────────────────────────┼───────────────────┤
│ AC   │ AC residual current only             │ ✗ Ne za EV        │
│ A    │ AC + pulsating DC                    │ ✗ Ne za DC charge │
│ F    │ Type A + high frequency + composite  │ △ AC charging     │
│ B    │ AC + pulsating DC + smooth DC        │ ✓ DC charging     │
│ B+   │ Type B + freq up to 20kHz           │ ✓ Advanced DC     │
└─────────────────────────────────────────────────────────────────┘

Type B RCD Working Principle:

    L1 ────┬──⌒⌒⌒──┬──────────────────── Load
           │       │
    L2 ────┤       ├───── Σ = 0 (normal)
           │       │
    L3 ────┤       ├───── Σ ≠ 0 (fault)
           │       │
    N  ────┤       │
           │       │
    PE ────┘       │
                   │
              ┌────┴────┐
              │Summation│
              │  CT     │
              └────┬────┘
                   │
                   ▼
              Trip Circuit

Proizvodi:

1. Doepke DFS 4 B (Type B):
   - 4-pole, 40-125A
   - 30mA AC, 6mA DC
   - Price: €200-400

2. Bender RCMB (Modular):
   - Configurable sensitivity
   - Integrated monitoring
   - Price: €300-500

3. ABB F204 B (Type B):
   - 4-pole, up to 63A
   - Compact DIN rail
   - Price: €250-350
```

### 2.2 IMD (Insulation Monitoring Device)

```
Insulation Monitoring za DC System:

Zahtev (IEC 61851-23):
- Kontinuirano praćenje izolacije DC sistema
- Alarm: <100 Ω/V (za 800V: <80 kΩ)
- Shutdown: <50 Ω/V (za 800V: <40 kΩ)

Princip Rada:

    DC+ ─────────────────────────────────────────
           │                               │
           │     ┌──────────────────┐      │
           │     │   IMD Device     │      │
           │     │                  │      │
           │     │   ┌─────────┐    │      │
           │     │   │Measuring│    │     ═╪═
           ├─────┼───┤ Circuit ├────┼───    │ Vehicle
           │     │   └─────────┘    │       │ Battery
           │     │        │         │      ═╪═
           │     │   ┌────┴────┐    │      │
           │     │   │Evaluate │    │      │
           │     │   └─────────┘    │      │
           │     └──────────────────┘      │
           │                               │
    DC- ─────────────────────────────────────────
                        │
                       PE

Merenje koristi AC signal superponiran na DC
za merenje izolacione otpornosti obe strane.

Proizvodi:

1. Bender ISOMETER IR155-3204:
   - For EV charging systems
   - 0-1000V DC
   - Response: 2-20 kΩ adjustable
   - Price: €400-600

2. Bender ISOMETER iso685:
   - Advanced features
   - IT system capable
   - Price: €600-800

3. Littelfuse SE-601:
   - Cost effective
   - Basic functionality
   - Price: €200-300
```

### 2.3 Cable Check (Pre-Charge Isolation Test)

```
Cable Check Sequence (ISO 15118-2):

Pre uključenja DC napona, punjač mora verifikovati
izolaciju između DC+ i DC- prema PE.

Procedure:

1. Apply low voltage (≤60V DC)
2. Measure insulation resistance
3. Pass criteria: R_iso > 100 Ω/V × Vdc_max
   Za 1000V sistem: R_iso > 100 kΩ

Timing:
├── Maximum duration: 15 seconds
├── Failure: Abort charging, notify EV
└── Success: Proceed to PreCharge

Implementation:

    DC+ ──────┬────[R_test]────┬─────────────
              │                │
         ┌────┴────┐      ┌────┴────┐
         │ RELAY   │      │  V_meas │
         │  K1     │      │  (ADC)  │
         └────┬────┘      └────┬────┘
              │                │
    Test    ──┴────────────────┴───── PE
    Voltage
    (60V DC)

    DC- ──────┬────[R_test]────┬─────────────
              │                │
         ┌────┴────┐      ┌────┴────┐
         │ RELAY   │      │  V_meas │
         │  K2     │      │  (ADC)  │
         └────┬────┘      └────┬────┘
              │                │
    Test    ──┴────────────────┴───── PE
    Voltage
    (60V DC)

Algorithm:
1. Close K1 (test DC+ to PE)
2. Measure V_meas with known R_test
3. Calculate R_iso+ = R_test × (V_test/V_meas - 1)
4. Open K1, close K2 (test DC- to PE)
5. Repeat measurement for R_iso-
6. R_iso_total = R_iso+ || R_iso-
7. Compare to threshold
```

## 3. Overcurrent i Overvoltage Protection

### 3.1 Fuses i Circuit Breakers

```
AC Side Protection:

Main Circuit Breaker:
- Rating: 1.25 × I_nominal
- Za 150 kW @ 400V: I = 150000/(400×√3×0.95) = 228A
- Breaker: 250A, 4-pole, curve B/C
- Short circuit rating: 25-50 kA

Opcije:
1. ABB Tmax T4N 250:
   - 250A, 4P
   - Icu: 36 kA
   - Price: €400-600

2. Schneider NSX250F:
   - 250A, 4P
   - Icu: 36 kA
   - Price: €350-500

DC Side Protection:

DC Fuses (za battery circuit):
- Fast-acting, DC rated
- Voltage: 1000V DC minimum
- Current: 1.25 × I_max

Opcije:
1. Bussmann FWH-400A:
   - 400A, 1000V DC
   - I²t: 90,000 A²s
   - Price: €150-200

2. Littelfuse KLKD:
   - 600A, 1000V DC
   - Very fast acting
   - Price: €100-150

MCCB za DC:
1. ABB Tmax T4D 320 DC:
   - 320A, 2-pole
   - 1000V DC
   - Price: €800-1000
```

### 3.2 Electronic Protection

```
Hardware OCP/OVP Circuit:

Fast Comparator Protection:

         ┌───────────────────────────────────────────┐
         │                                           │
   Vdc ──┤  ┌─────────┐                             │
         │  │ Divider │                              │
         │  │ 100:1   │                              │
         │  └────┬────┘                              │
         │       │ V_sense                           │
         │       │                                   │
         │  ┌────┴────┐   ┌─────────┐   ┌─────────┐ │
         │  │   +     │   │         │   │  GATE   │ │
   Vref ─┼──┤   CMP   ├───┤   OR    ├───┤ DRIVER  ├─┼── PWM OFF
   (OVP) │  │   -     │   │  GATE   │   │  FAULT  │ │
         │  └─────────┘   │         │   │  INPUT  │ │
         │                │         │   │         │ │
         │  ┌─────────┐   │         │   └─────────┘ │
   Idc ──┼──┤ Current │   │         │               │
         │  │ Sensor  │   │         │               │
         │  └────┬────┘   │         │               │
         │       │        │         │               │
         │  ┌────┴────┐   │         │               │
         │  │   +     │   │         │               │
   Vref ─┼──┤   CMP   ├───┤         │               │
   (OCP) │  │   -     │   │         │               │
         │  └─────────┘   └─────────┘               │
         │                                           │
         └───────────────────────────────────────────┘

Response time: <1 μs (hardware path)

Threshold Settings:
│ Protection │ Threshold        │ Response   │
├────────────┼──────────────────┼────────────┤
│ OVP        │ 110% × Vdc_nom   │ <1 μs      │
│ OCP        │ 150% × Idc_nom   │ <1 μs      │
│ OTP        │ Tj_max - 10°C    │ <100 μs    │
│ Desat      │ Vce > 7V         │ <2 μs      │
```

### 3.3 Surge Protection (SPD)

```
SPD za AC Ulaz:

Type 2 SPD (per IEC 61643):
- Location: After main breaker
- Uc: 275-320V AC
- In: 20-40 kA (8/20 μs)
- Up: <1.5 kV

Šema:

    L1 ──┬──────────────────────────────── Load
         │
        ─┴─ SPD1
        ─┬─
         │
    L2 ──┼──┬──────────────────────────── Load
         │  │
         │ ─┴─ SPD2
         │ ─┬─
         │  │
    L3 ──┼──┼──┬────────────────────────── Load
         │  │  │
         │  │ ─┴─ SPD3
         │  │ ─┬─
         │  │  │
    N  ──┼──┼──┼──┬─────────────────────── Load
         │  │  │  │
         │  │  │ ─┴─ SPD_N
         │  │  │ ─┬─
         │  │  │  │
    PE ──┴──┴──┴──┴───────────────────────

SPD za DC Link:

MOV + Gas Discharge Tube hybrid:
- Uc: 1000V DC
- In: 10 kA
- Up: <2 kV

Proizvodi:

1. Phoenix Contact VAL-SEC-T2:
   - 3+N configuration
   - Type 2, 40 kA
   - Price: €200-300

2. DEHN DEHNguard:
   - Industrial grade
   - Remote signaling
   - Price: €250-400
```

## 4. Kontaktori i Preklopnici

### 4.1 DC Kontaktori

```
DC Contactor Requirements:

- Napon: ≥1000V DC
- Struja: 1.25 × I_nom kontinualno
- Prekinuti kapacitet: Puna struja @ pun napon
- Arc extinguishing: Magnetic blowout ili gas
- Životni vek: >100,000 operacija

DC Arc Extinguishing:

Magnetski Blowout:
┌─────────────────────────────────────┐
│                                     │
│    ═══╗     Magnet     ╔═══        │
│       ║                ║           │
│    [──╬────────────────╬──]        │
│       ║    Contacts    ║           │
│    ═══╝                ╚═══        │
│                                     │
│    Arc is blown sideways into       │
│    arc chutes by magnetic field     │
│                                     │
└─────────────────────────────────────┘

Hermetic Sealing (H2/N2):
- Arc gašenje u zatvorenoj komori
- Hydrogen ili Nitrogen atmosfera
- Koristi se za high voltage DC

Proizvodi:

1. Gigavac GX200 Series:
   ┌─────────────────────────────────────┐
   │ Rated voltage: 1000V DC            │
   │ Continuous current: 500A           │
   │ Breaking capacity: 500A @ 450V DC  │
   │ Coil: 12V/24V DC                   │
   │ Life: 100,000 cycles               │
   │ Price: ~€200                        │
   └─────────────────────────────────────┘

2. TE Connectivity EV200:
   ┌─────────────────────────────────────┐
   │ Rated voltage: 900V DC             │
   │ Continuous current: 500A           │
   │ Hermetically sealed                │
   │ Coil: 12V/24V DC                   │
   │ AEC-Q200 qualified                 │
   │ Price: ~€150                        │
   └─────────────────────────────────────┘

3. Sensata GV200MA (za 800V+ sisteme):
   ┌─────────────────────────────────────┐
   │ Rated voltage: 1000V DC            │
   │ Continuous current: 350A           │
   │ Breaking: 350A @ 450V DC           │
   │ Auxiliary contacts: Available      │
   │ Price: ~€180                        │
   └─────────────────────────────────────┘
```

### 4.2 Contactor Welding Detection

```
Welding Detection Methods:

1. Auxiliary Contact Monitoring:

    Main     Aux
    ═══      ═══
     │        │
    ─┴─      ─┴─    Aux opens when main closes
    ─┬─      ─┬─    If main welded, aux cannot open
     │        │

    Logic:
    if (coil_off && aux_contact == closed) {
        welding_detected = true;
    }

2. Voltage Monitoring:

    DC+ ──[CONTACTOR]──┬── To vehicle
                       │
                  ┌────┴────┐
                  │ V_sense │
                  └─────────┘

    Logic:
    if (coil_off && V_sense > threshold) {
        welding_detected = true;  // Contactor stuck
    }

3. Pre-charge Verification:

    Before closing main contactor:
    1. Measure DC link voltage (should be 0)
    2. Close pre-charge contactor with resistor
    3. Monitor voltage rise
    4. If voltage rises too fast → main stuck closed

Implementation:

typedef enum {
    CONTACTOR_OPEN,
    CONTACTOR_CLOSED,
    CONTACTOR_WELDED,
    CONTACTOR_FAULT
} ContactorState_t;

ContactorState_t check_contactor_state(void)
{
    // Read auxiliary contact
    bool aux_contact = GPIO_Read(AUX_CONTACT_PIN);

    // Read voltage across contactor
    float v_sense = ADC_Read(CONTACTOR_VOLTAGE_SENSE);

    if (contactor_coil_off) {
        if (aux_contact == CONTACT_CLOSED || v_sense > THRESHOLD) {
            return CONTACTOR_WELDED;
        }
        return CONTACTOR_OPEN;
    } else {
        if (aux_contact == CONTACT_OPEN || v_sense < THRESHOLD) {
            return CONTACTOR_FAULT;  // Failed to close
        }
        return CONTACTOR_CLOSED;
    }
}
```

### 4.3 Pre-Charge Circuit

```
Pre-Charge Function:

Sprečava inrush current pri zatvaranju DC kontaktora.

Šema:

    DC+ ────┬────[MAIN CONTACTOR]────┬──── To DC Link
            │                        │
            │    [R_precharge]       │
            └────[════════════]──────┘
                 [PRE CONTACTOR]

Pre-charge Resistor Sizing:

I_inrush_max = V_dc / R_precharge
τ = R_precharge × C_dc_link

Za C_dc = 2000 μF, V_dc = 800V, I_max = 20A:
R_precharge = V_dc / I_max = 800 / 20 = 40 Ω
τ = 40 × 0.002 = 80 ms
T_precharge = 5 × τ = 400 ms (99.3% charged)

P_resistor = V²/R × duty = 800²/40 × 0.1 = 1600W (peak)
→ Use 50W resistor with short duty

Sequence:

1. Close pre-charge contactor
2. Monitor voltage rise (should reach 95% of V_dc)
3. Wait for T_precharge (typ. 500ms)
4. Close main contactor
5. Open pre-charge contactor
6. Ready for operation

Safety Checks:
- Timeout if voltage doesn't rise → contactor fault
- Voltage rises too fast → capacitor fault
- Voltage oscillates → system instability
```

## 5. Emergency Stop

### 5.1 E-Stop Implementation

```
Emergency Stop Requirements (IEC 60947-5-5):

- Category 0: Immediate power removal
- Category 1: Controlled stop, then power removal
- Color: RED on YELLOW background
- Position: Easily accessible
- Reset: Manual only

Za EV Punjač: Category 1 preporučeno
(kontrolisano zaustavljanje radi zaštite baterije)

E-Stop Circuit:

     +24V ───────────────────────────────────
               │              │
         ┌─────┴─────┐  ┌─────┴─────┐
         │  E-STOP   │  │  E-STOP   │  Redundant
         │    #1     │  │    #2     │  buttons
         │    NC     │  │    NC     │
         └─────┬─────┘  └─────┬─────┘
               │              │
     ──────────┴──────────────┴──────────────
                      │
               ┌──────┴──────┐
               │   Safety    │
               │   Relay     │  (Pilz PNOZ, etc.)
               │             │
               └──────┬──────┘
                      │
           ┌──────────┼──────────┐
           │          │          │
      To Contactor  To MCU   To Gate
         Coils     (E-Stop   Drivers
                   detected) (inhibit)

Safety Relay Products:

1. Pilz PNOZ X3P:
   - 2 NO + 1 NC safety contacts
   - Category 4 / PLe capable
   - Auto or manual reset
   - Price: €150-200

2. ABB Jokab RT9:
   - 3 NO safety contacts
   - Screw or spring terminals
   - Price: €80-120

3. Schneider XPS-AC:
   - 2 NO safety outputs
   - Compact design
   - Price: €100-150
```

### 5.2 Shutdown Sequence

```
Emergency Shutdown Sequence:

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   E-STOP Activated                                              │
│         │                                                       │
│         ▼                                                       │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ IMMEDIATE ACTIONS (Hardware, <1ms):                     │  │
│   │ - Disable all PWM outputs                               │  │
│   │ - Inhibit gate drivers                                  │  │
│   │ - Set safe state outputs                                │  │
│   └───────────────────────────┬─────────────────────────────┘  │
│                               │                                 │
│                               ▼                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ CONTROLLED STOP (Firmware, <100ms):                     │  │
│   │ - Ramp current to zero                                  │  │
│   │ - Send stop message to vehicle                          │  │
│   │ - Log event with timestamp                              │  │
│   └───────────────────────────┬─────────────────────────────┘  │
│                               │                                 │
│                               ▼                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ ISOLATION (Safety relay, <500ms):                       │  │
│   │ - Open main DC contactors                               │  │
│   │ - Open AC contactors                                    │  │
│   │ - Verify contactor open (aux contacts)                  │  │
│   └───────────────────────────┬─────────────────────────────┘  │
│                               │                                 │
│                               ▼                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ NOTIFICATION:                                           │  │
│   │ - OCPP StatusNotification (Faulted)                     │  │
│   │ - Local alarm indication                                │  │
│   │ - Event logging                                         │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   System remains in SAFE STATE until:                           │
│   - E-Stop reset                                                │
│   - Power cycle                                                 │
│   - Authorized restart                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 6. Ground Fault Protection

### 6.1 IT System Grounding

```
EV DC Charging grounding (IT System):

IT System = Isolated Terra (no direct ground connection)

    ┌─────────────────────────────────────────────────────────┐
    │                    DC CHARGER                           │
    │                                                         │
    │   DC+ ──────────────────────────────────── Vehicle DC+  │
    │         │                                               │
    │         │   ┌─────────────────────────┐                │
    │         │   │      DC/DC Stage        │                │
    │         │   │    (Galvanically        │                │
    │         └───┤     Isolated)           │                │
    │             │                         │                │
    │             │   ┌──────────────────┐  │                │
    │             │   │      IMD         │  │                │
    │             │   │  (monitoring)    │  │                │
    │             │   └────────┬─────────┘  │                │
    │             │            │            │                │
    │   DC- ─────────────────────────────────── Vehicle DC-  │
    │                          │                              │
    │                         PE (not connected to DC)        │
    │                                                         │
    └─────────────────────────────────────────────────────────┘

Prednosti IT sistema za DC punjenje:
1. Jedan ground fault ne uzrokuje trenutni shutdown
2. IMD detektuje fault, dozvoljava kontrolisani stop
3. Sigurniji za ljude (nema fault current kroz PE)
```

### 6.2 Ground Fault Response

```
Ground Fault Handling:

Fault Severity Levels:

│ R_iso (Ω/V)     │ Status      │ Action                   │
├─────────────────┼─────────────┼──────────────────────────┤
│ > 500           │ OK          │ Normal operation         │
│ 100 - 500       │ Warning     │ Log, notify, continue    │
│ 50 - 100        │ Alarm       │ Reduce power, schedule stop│
│ < 50            │ Critical    │ Immediate controlled stop │

Response Algorithm:

void ground_fault_handler(float r_iso)
{
    if (r_iso < CRITICAL_THRESHOLD) {
        // Immediate stop
        charging_stop(STOP_REASON_GROUND_FAULT);
        contactor_open_sequence();
        log_event(EVENT_GROUND_FAULT_CRITICAL, r_iso);
        ocpp_status_notification(STATUS_FAULTED);

    } else if (r_iso < ALARM_THRESHOLD) {
        // Controlled reduction
        power_limit_set(50);  // 50% power
        set_warning(WARNING_GROUND_FAULT);

        if (charging_active) {
            schedule_stop(60);  // Stop in 60 seconds
        }
        log_event(EVENT_GROUND_FAULT_ALARM, r_iso);

    } else if (r_iso < WARNING_THRESHOLD) {
        // Log and continue
        set_warning(WARNING_GROUND_FAULT_MINOR);
        log_event(EVENT_GROUND_FAULT_WARNING, r_iso);
    }
}
```

## 7. Cybersecurity

### 7.1 Security Requirements

```
Cybersecurity za EV Punjače (ISO 15118, OCPP 2.0):

Threat Model:

1. Unauthorized Charging:
   - Stolen credentials
   - Replay attacks
   - Mitigation: TLS, certificate auth

2. Firmware Tampering:
   - Malicious firmware upload
   - Mitigation: Secure boot, signed updates

3. Communication Interception:
   - Man-in-the-middle
   - Mitigation: TLS 1.3, certificate pinning

4. Physical Access:
   - Debug port exploitation
   - Mitigation: Disable JTAG in production

5. Denial of Service:
   - Network flooding
   - Mitigation: Rate limiting, firewall

Security Layers:

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Application Security:                                    │   │
│  │ - User authentication (RFID, app)                        │   │
│  │ - Authorization (OCPP, ISO 15118)                        │   │
│  │ - Secure session management                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Transport Security:                                      │   │
│  │ - TLS 1.2/1.3 for all connections                       │   │
│  │ - Certificate-based authentication                       │   │
│  │ - Perfect forward secrecy                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Platform Security:                                       │   │
│  │ - Secure boot chain                                      │   │
│  │ - Encrypted firmware storage                             │   │
│  │ - Secure key storage (TPM/HSM)                          │   │
│  │ - Protected debug interfaces                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Physical Security:                                       │   │
│  │ - Tamper detection                                       │   │
│  │ - Locked enclosure                                       │   │
│  │ - Anti-vandal design                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 8. Bill of Materials - Sigurnost

```
┌─────────────────────────────────────────────────────────────────┐
│ SIGURNOSNE KOMPONENTE (150 kW DC Punjač)                        │
├──────────────────────────────┬─────┬────────────┬───────────────┤
│ Komponenta                   │ Qty │ Jed. cena  │    Ukupno     │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ RCD Type B 300mA             │  1  │   €300     │    €300       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ IMD Bender IR155             │  1  │   €500     │    €500       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ MCCB 250A AC                 │  1  │   €450     │    €450       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ DC Contactor 500A (×2)       │  2  │   €180     │    €360       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Pre-charge Relay + Resistor  │  1  │    €50     │     €50       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ DC Fuses 400A (×2)           │  2  │   €150     │    €300       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ SPD Type 2 AC                │  1  │   €250     │    €250       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Safety Relay (Pilz)          │  1  │   €150     │    €150       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ E-Stop Button (×2)           │  2  │    €30     │     €60       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Door Interlock               │  1  │    €40     │     €40       │
├──────────────────────────────┴─────┴────────────┼───────────────┤
│ UKUPNO SIGURNOST                                │   €2,460      │
└─────────────────────────────────────────────────┴───────────────┘
```
