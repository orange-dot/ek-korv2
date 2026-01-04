# Metering and Billing for EV Chargers

## 1. Metering Requirements

### 1.1 Regulatory Requirements

```
MID Directive (Measuring Instruments Directive 2014/32/EU):

For commercial charging, energy metering must be:
- MID certified (class B minimum)
- Tamper-evident
- Verifiable (inspection possible)

Accuracy Classes:

│ Class │ Active Energy Error │ Application          │
├───────┼─────────────────────┼──────────────────────┤
│   A   │ ±2%                 │ Basic metering       │
│   B   │ ±1%                 │ Commercial EV charge │
│   C   │ ±0.5%               │ Precision billing    │

For DC charging required:
- DC energy meter (not standard AC kWh meter!)
- Special MID certificates for DC
- Currently limited number of manufacturers
```

### 1.2 What to Measure

```
Parameters for Billing:

1. Mandatory:
   ├── Active Energy (kWh) - MID certified
   ├── Charging Time (duration)
   └── Session ID

2. Recommended (for transparency):
   ├── Voltage (real-time)
   ├── Current (real-time)
   ├── Power (kW)
   ├── SOC start/end (from vehicle)
   └── Peak power

3. For diagnostics:
   ├── Power factor
   ├── Harmonics
   ├── Temperature
   └── Efficiency
```

## 2. DC Energy Meters

### 2.1 MID Certified DC Meters

```
Commercially Available MID DC Meters:

1. Phoenix Contact EEM-350-D-MID:
┌─────────────────────────────────────────────────────────────┐
│ Specifications:                                             │
│ - Voltage range: 50-1000V DC                               │
│ - Current range: up to 600A (via shunt)                    │
│ - Accuracy: Class B (1%)                                   │
│ - Interface: RS-485 Modbus RTU                             │
│ - MID certified: Yes (DE-18-MI003-PTB006)                  │
│ - Display: LCD with kWh, V, A, W                           │
│ - DIN rail mounting                                         │
│ - Price: ~€400-500                                          │
└─────────────────────────────────────────────────────────────┘

2. Carlo Gavazzi EM340MID:
┌─────────────────────────────────────────────────────────────┐
│ Specifications:                                             │
│ - Originally AC, DC adapter available                      │
│ - Current: via external CT                                 │
│ - MID certified for DC application                         │
│ - Modbus RTU                                               │
│ - Price: ~€300-400                                          │
└─────────────────────────────────────────────────────────────┘

3. LEM EM4T (OEM module):
┌─────────────────────────────────────────────────────────────┐
│ Specifications:                                             │
│ - Voltage: up to 1000V DC                                  │
│ - Current: LEM sensor based                                │
│ - Accuracy: <0.5%                                          │
│ - Output: Pulse, Modbus                                    │
│ - MID preparation (requires integration cert)              │
│ - Price: ~€200-300                                          │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Shunt-Based vs Hall-Based

```
Current Measurement Comparison:

Shunt-Based:
┌─────────────────────────────────────────────────────────────┐
│ + Very accurate (0.1-0.5%)                                 │
│ + Long-term stable                                         │
│ + MID compliant designs exist                              │
│ - Power loss (I²R)                                         │
│ - Requires isolation for signal                            │
│ - Heat generation                                          │
│                                                             │
│   DC+ ──[████████]───────── Load                           │
│           Shunt                                             │
│           (50-100μΩ)                                        │
│             │ │                                             │
│            ─┴─┴─ to isolated amplifier                     │
└─────────────────────────────────────────────────────────────┘

Hall Effect (Closed Loop):
┌─────────────────────────────────────────────────────────────┐
│ + No power loss                                            │
│ + Galvanically isolated                                    │
│ + Easy to install                                          │
│ - Offset drift                                             │
│ - More complex calibration                                 │
│ - MID certification more difficult                         │
│                                                             │
│   DC+ ──────[████]────────── Load                          │
│              Hall                                           │
│             Sensor                                          │
│               │                                             │
│          Analog output                                      │
└─────────────────────────────────────────────────────────────┘

Recommendation for MID:
→ Shunt-based with isolated amplifier
→ Factory calibration + periodic verification
```

### 2.3 Connection with Billing System

```
Data Flow for Billing:

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌───────────────┐                                            │
│   │   DC Meter    │                                            │
│   │   (MID)       │                                            │
│   └───────┬───────┘                                            │
│           │ Modbus RTU (RS-485)                                │
│           ▼                                                     │
│   ┌───────────────┐                                            │
│   │   Charger     │                                            │
│   │   Controller  │                                            │
│   └───────┬───────┘                                            │
│           │                                                     │
│           │ OCPP MeterValues                                    │
│           ▼                                                     │
│   ┌───────────────┐        ┌───────────────┐                   │
│   │     CSMS      │───────►│   Billing     │                   │
│   │   (Backend)   │        │   System      │                   │
│   └───────────────┘        └───────────────┘                   │
│                                   │                             │
│                                   ▼                             │
│                            ┌───────────────┐                   │
│                            │   Invoice     │                   │
│                            │   Generation  │                   │
│                            └───────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

OCPP MeterValues Message:

{
  "connectorId": 1,
  "transactionId": 12345,
  "meterValue": [{
    "timestamp": "2024-01-15T14:30:00Z",
    "sampledValue": [
      {
        "value": "45230",
        "context": "Sample.Periodic",
        "format": "Raw",
        "measurand": "Energy.Active.Import.Register",
        "unit": "Wh"
      },
      {
        "value": "145500",
        "measurand": "Power.Active.Import",
        "unit": "W"
      }
    ]
  }]
}
```

## 3. Billing Models

### 3.1 Pricing Strategies

```
Common Billing Models:

1. Per kWh (Energy-based):
   ├── Simple, transparent
   ├── €0.30-0.50/kWh typical
   └── Preferred by consumers

2. Per Minute (Time-based):
   ├── Incentivizes fast charging
   ├── May penalize slower chargers
   └── €0.05-0.15/min typical

3. Hybrid (Energy + Time):
   ├── €/kWh for energy
   ├── €/min for occupancy after charging complete
   └── Balances both concerns

4. Session Fee + Energy:
   ├── Fixed start fee: €1-3
   ├── Plus €/kWh
   └── Covers fixed costs

5. Subscription:
   ├── Monthly fee for reduced rates
   └── For fleet operators

Pricing Formula Example:

Total = StartFee + (Energy × PricePerKWh) + (OccupancyTime × PricePerMin)

// Implementation
float calculate_bill(ChargingSession *session)
{
    float energy_cost = session->energy_kwh * pricing.per_kwh;
    float session_fee = pricing.start_fee;

    float occupancy_time = 0;
    if (session->end_time > session->charge_complete_time) {
        occupancy_time = (session->end_time - session->charge_complete_time) / 60.0;
    }
    float occupancy_cost = occupancy_time * pricing.per_minute_idle;

    return session_fee + energy_cost + occupancy_cost;
}
```

### 3.2 Roaming and Interoperability

```
Roaming Networks:

For charger interoperability with different operators:

1. Hubject (HBS):
   - Largest EU roaming network
   - OICP protocol
   - B2B connections

2. Gireve:
   - French-based, EU coverage
   - OCPI protocol

3. e-clearing.net:
   - German network
   - VDE certified

Protocol for Roaming (OCPI 2.2):

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   CPO (Charge Point Operator)                               │
│   └── Operates chargers                                     │
│            │                                                │
│            │ OCPI                                           │
│            ▼                                                │
│   ┌───────────────────────────────────────────────────┐    │
│   │              Roaming Hub                           │    │
│   │         (Hubject, Gireve, etc.)                   │    │
│   └───────────────────────────────────────────────────┘    │
│            │                                                │
│            │ OCPI                                           │
│            ▼                                                │
│   eMSP (e-Mobility Service Provider)                       │
│   └── Issues cards/apps to users                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 4. Signed Meter Values

### 4.1 German Eichrecht (Calibration Law)

```
Eichrecht requirements (German calibration law):

Special requirements for charging transparency in Germany:

1. Signed record of each session
2. User can verify accuracy
3. Digital signature from MID meter
4. QR code for verification

Signed Meter Record:

┌─────────────────────────────────────────────────────────────┐
│ Charge Point ID: DE*ABC*E1234567                           │
│ Transaction ID: 987654321                                   │
│                                                             │
│ Start: 2024-01-15 14:30:00 UTC                             │
│ End:   2024-01-15 15:05:00 UTC                             │
│                                                             │
│ Energy Start: 123456.789 kWh                               │
│ Energy End:   123502.123 kWh                               │
│ Energy Delivered: 45.334 kWh                               │
│                                                             │
│ Meter Serial: MID-123456                                   │
│ Signature: <base64 encoded ECDSA signature>                │
│ Public Key ID: PKEY-001                                    │
│                                                             │
│ [QR Code for verification]                                 │
└─────────────────────────────────────────────────────────────┘

Products supporting Eichrecht:

1. ABB DC meters (Eichrecht ready)
2. Siemens Sicharge D
3. Keba P30 (for AC)
4. has-to-be OCMF implementation
```

### 4.2 OCMF Format

```
OCMF (Open Charge Metering Format):

Standard format for signed meter values.

OCMF Payload Example:

OCMF|{
  "FV": "1.0",
  "GI": "ABB Terra",
  "GS": "ABC123456",
  "GV": "1.0",
  "PG": "T1",
  "MV": "Phoenix Contact",
  "MM": "EEM-350",
  "MS": "MID12345",
  "MF": "1.0",
  "IS": true,
  "IT": "ISO15118",
  "ID": "EMAID12345",
  "RD": [{
    "TM": "2024-01-15T14:30:00,000+00:00 S",
    "TX": "B",
    "RV": 123456.789,
    "RI": "1-b:1.8.0",
    "RU": "kWh",
    "RT": "AC",
    "EF": "",
    "ST": "G"
  }]
}|<signature>
```

## 5. Display and Receipt

### 5.1 Display Requirements

```
IEC 61851 / MID requirements for display:

Mandatory displays during charging:
1. Current power (kW)
2. Delivered energy (kWh) - MID register
3. Charging status
4. Price (if commercial)

At end of session:
1. Total energy (kWh)
2. Duration
3. Total amount
4. Transaction ID

Display Example:

┌─────────────────────────────────────────┐
│                                         │
│         CHARGING IN PROGRESS            │
│                                         │
│    ████████████████░░░░░░░  75%        │
│                                         │
│    Power:      145.2 kW                │
│    Energy:      45.3 kWh               │
│    Duration:    18:32                   │
│    Estimated:   7 min remaining        │
│                                         │
│    Current cost: €15.75                │
│                                         │
│    [STOP CHARGING]                      │
│                                         │
└─────────────────────────────────────────┘
```

### 5.2 Receipt Generation

```
Digital and Physical Receipt:

Digital Receipt (email/app):
┌─────────────────────────────────────────┐
│         CHARGING RECEIPT                │
│                                         │
│ Location: Belgrade EXPO Station #3     │
│ Date: 2024-01-15                       │
│ Time: 14:30 - 15:05                    │
│                                         │
│ ─────────────────────────────────────  │
│ Energy delivered:       45.334 kWh     │
│ Price per kWh:          €0.35          │
│ Energy cost:            €15.87         │
│                                         │
│ Occupancy time:         0 min          │
│ Occupancy cost:         €0.00          │
│                                         │
│ Session fee:            €1.00          │
│ ─────────────────────────────────────  │
│ TOTAL:                  €16.87         │
│ VAT (20%):              €2.81          │
│ ─────────────────────────────────────  │
│                                         │
│ Payment: **** **** **** 1234           │
│ Transaction ID: TXN-2024011-98765      │
│                                         │
│ [QR] Verify meter reading              │
└─────────────────────────────────────────┘

Printer Options (for physical receipt):
1. Thermal printer (Epson TM-T88)
2. Integrated in HMI panel
3. Optional - most go paperless
```

## 6. Bill of Materials - Metering

```
┌─────────────────────────────────────────────────────────────────┐
│ METERING COMPONENTS (150 kW DC Charger)                         │
├──────────────────────────────┬─────┬────────────┬───────────────┤
│ Component                    │ Qty │ Unit Price │    Total      │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ DC Energy Meter MID Class B  │  1  │   €450     │    €450       │
│ (Phoenix Contact EEM-350-D)  │     │            │               │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ DC Shunt 600A/75mV          │  1  │    €80     │     €80       │
│ (Class 0.2)                  │     │            │               │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Voltage Divider (isolated)   │  1  │    €50     │     €50       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ RS-485 interface module      │  1  │    €20     │     €20       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Calibration certificate      │  1  │   €100     │    €100       │
├──────────────────────────────┴─────┴────────────┼───────────────┤
│ TOTAL METERING                                  │    €700       │
└─────────────────────────────────────────────────┴───────────────┘

Note: Eichrecht compliance adds ~€200-500 for
      signing module and software implementation.
```
