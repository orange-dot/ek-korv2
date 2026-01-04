# V2G i Grid Integration

## Filozofija: V2G Native, Ne Addon

```
TRADICIONALNI PUNJAČ               ELEKTROKOMBINACIJA
────────────────────────────────────────────────────────────
Jednosmerna snaga           →    Bidirekciona od početka
V2G kao dodatak             →    V2G kao core feature
Pasivni load                →    Aktivni grid asset
Reaktivna snaga: 0          →    4-quadrant operation
Fixed charging profile      →    Grid-responsive charging
ISO 15118-2 max             →    ISO 15118-20 native
```

---

## 1. Bidirekciona Topologija

### Četiri-Kvadrantna Operacija

```
           P (Active Power)
              ↑
              │
    Q2        │        Q1
   (V2G +     │      (Charge +
   Capacitive)│      Capacitive)
              │
──────────────┼──────────────→ Q (Reactive Power)
              │
    Q3        │        Q4
   (V2G +     │      (Charge +
   Inductive) │      Inductive)
              │

ELEKTROKOMBINACIJA može operisati u sva 4 kvadranta:
• Q1: Punjenje + kapacitivna kompenzacija
• Q2: V2G discharge + kapacitivna kompenzacija
• Q3: V2G discharge + induktivna kompenzacija
• Q4: Punjenje + induktivna kompenzacija
```

### Bidirekcioni Power Flow

```
GRID SIDE (AC)                  VEHICLE SIDE (DC)

   L1 ───┬──[PFC]──┐
         │         │
   L2 ───┼──[PFC]──┼──[DC Bus]──[LLC]──[DC/DC]─── Battery +
         │         │       │           │
   L3 ───┴──[PFC]──┘       │    ┌──────┘
         │                 │    │
   PE ───┴─────────────────┴────┴────────────────── Battery -

Charging Mode (Grid → Vehicle):
AC → PFC (rectify + PFC) → DC Bus → LLC → Battery

Discharging Mode (Vehicle → Grid):
Battery → LLC (reverse) → DC Bus → PFC (invert) → AC

Key requirement: Kontrola mora biti seamless za oba smera
```

### 3-Level NPC za V2G

```
Prednosti 3-level za bidirekciono:
────────────────────────────────

1. Niži THD u oba smera
   • Grid injection quality critical za V2G
   • <3% THD zahtev za grid codes

2. Bolji power factor
   • PF > 0.99 za charging
   • PF > 0.99 za discharging (V2G)

3. Manji filter size
   • Bidirekcioni filteri su veći
   • 3-level smanjuje zahteve za 50%

4. Efikasniji prenos snage
   • Manje switching losses
   • Bolji round-trip efficiency
```

---

## 2. ISO 15118-20 Implementacija

### Protocol Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  V2G Message Handling                                    │   │
│  │  • Charging Session Management                           │   │
│  │  • Energy Transfer Control                               │   │
│  │  • BPT (Bidirectional Power Transfer)                   │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    PRESENTATION LAYER                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  EXI (Efficient XML Interchange)                        │   │
│  │  • XML Schema validation                                 │   │
│  │  • Message encoding/decoding                            │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    SESSION LAYER                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  TLS 1.3 (mandatory in production)                      │   │
│  │  • Mutual authentication                                │   │
│  │  • Encrypted communication                              │   │
│  │  • Certificate handling                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    TRANSPORT LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  TCP/IP                                                  │   │
│  │  • Reliable message delivery                            │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    PHYSICAL LAYER                               │
│  ┌──────────────────────┐  ┌──────────────────────┐           │
│  │  HomePlug Green PHY  │  │  WiFi (optional)     │           │
│  │  PLC over CP line    │  │  Alternative comm    │           │
│  └──────────────────────┘  └──────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### V2G Message Sequence

```
EVCC (Vehicle)                              SECC (Charger)
     │                                           │
     │──── SupportedAppProtocolReq ─────────────→│
     │     (protocols: ISO15118-20:DC)           │
     │                                           │
     │←─── SupportedAppProtocolRes ──────────────│
     │     (selected: ISO15118-20)               │
     │                                           │
     │──── SessionSetupReq ─────────────────────→│
     │                                           │
     │←─── SessionSetupRes ──────────────────────│
     │                                           │
     │──── AuthorizationSetupReq ───────────────→│
     │     (EIM or PnC)                          │
     │                                           │
     │←─── AuthorizationSetupRes ────────────────│
     │                                           │
     │──── ServiceDiscoveryReq ─────────────────→│
     │                                           │
     │←─── ServiceDiscoveryRes ──────────────────│
     │     (services: DC_BPT, DC_ACDP)           │
     │                                           │
     │──── ServiceSelectionReq ─────────────────→│
     │     (selected: DC_BPT, ServiceID=6)       │
     │                                           │
     │←─── ServiceSelectionRes ──────────────────│
     │                                           │
     │──── ChargeParameterDiscoveryReq ─────────→│
     │     (BPT_DC_CPDReqEnergyTransferMode)     │
     │                                           │
     │←─── ChargeParameterDiscoveryRes ──────────│
     │                                           │
     │──── DC_BPT_ChargeLoopReq ────────────────→│
     │     (EVTargetPower, EVTargetVoltage)      │
     │←─── DC_BPT_ChargeLoopRes ─────────────────│
     │     ... loop continues ...                │
```

### BPT Control Modes

```
SCHEDULED MODE
──────────────
• Predefined charging/discharging schedule
• EV provides departure time, target SoC
• EVSE optimizes based on grid conditions
• Good for overnight fleet charging

DYNAMIC MODE
────────────
• Real-time power adjustment
• EVSE can request power changes on-the-fly
• EV responds within defined limits
• Required for frequency regulation

Control Mode transition (ISO 15118-20 feature):
• Can switch from GRID_FOLLOWING to GRID_FORMING
• Without service renegotiation
• Prevents blackout during V2G operation
```

### Plug & Charge (PnC)

```
PnC CERTIFICATE CHAIN
─────────────────────

     ┌──────────────────────┐
     │  V2G Root CA         │ (Hubject, etc.)
     └──────────┬───────────┘
                │
     ┌──────────┴───────────┐
     │  OEM Sub-CA          │ (Vehicle manufacturer)
     └──────────┬───────────┘
                │
     ┌──────────┴───────────┐
     │  Contract Cert       │ (In vehicle)
     └──────────────────────┘


PnC Flow:
1. Vehicle plugs in
2. Automatic ISO 15118-20 handshake
3. Vehicle presents Contract Certificate
4. EVSE validates against trusted CAs
5. Charging authorized - no user action needed
6. Billing through Mobility Service Provider

ELEKTROKOMBINACIJA:
• Supports both PnC and External Identification Means (EIM)
• Certificate storage in secure element
• OTA certificate updates
```

---

## 3. Grid Services

### Frequency Regulation

```
GRID FREQUENCY RESPONSE
───────────────────────

Normal: f = 50.00 Hz (Europe) / 60.00 Hz (US)

Under-frequency (high demand):
• f < 49.95 Hz: Start reducing charging power
• f < 49.90 Hz: Stop charging
• f < 49.80 Hz: Start V2G discharge (if enabled)

Over-frequency (excess generation):
• f > 50.05 Hz: Increase charging power
• f > 50.10 Hz: Maximum charging rate

ELEKTROKOMBINACIJA Response Characteristics:
───────────────────────────────────────────
• Detection time: <100ms (PLL-based)
• Response time: <500ms (power change)
• Droop coefficient: Configurable (2-10%)
• Deadband: ±0.05 Hz (configurable)

Implementation:
┌────────────────────────────────────────────────────┐
│                                                    │
│   Grid Frequency ──→ [PLL] ──→ f_measured         │
│                              │                     │
│                              ▼                     │
│                     ┌────────────────┐            │
│                     │  Droop Control │            │
│                     │                │            │
│   f_nominal ───────→│  ΔP = Kp(f-f0)│───→ P_adj  │
│   P_scheduled ─────→│                │            │
│                     └────────────────┘            │
│                              │                     │
│                              ▼                     │
│                     P_output = P_scheduled + P_adj │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Voltage Regulation (Reactive Power)

```
REACTIVE POWER CAPABILITY
─────────────────────────

EK30 (30 kW) Rating:
• Apparent power: 33 kVA
• Active power: 30 kW max
• Reactive power: ±14 kVAR (at full P)
• Power factor range: 0.9 leading to 0.9 lagging

Q(V) Droop Control:
┌────────────────────────────────────────────────────┐
│                                                    │
│  Q (kVAR)                                         │
│    ↑                                               │
│    │       ╱─────── Q_max (capacitive)            │
│    │      ╱                                        │
│    │     ╱                                         │
│ ───┼────╱───────────────────────→ V (pu)          │
│    │   ╱    0.95  1.0  1.05                       │
│    │  ╱                                            │
│    │ ╱                                             │
│    ╱─────────────── Q_min (inductive)             │
│                                                    │
└────────────────────────────────────────────────────┘

V < 0.95 pu: Inject Q (capacitive) to raise voltage
V > 1.05 pu: Absorb Q (inductive) to lower voltage
0.95 ≤ V ≤ 1.05: Deadband, no Q compensation

BENEFIT: No battery wear from reactive power!
• Reactive power is exchanged, not consumed
• Uses inverter capacity only
• SoC unaffected
```

### Peak Shaving / Valley Filling

```
DAILY LOAD PROFILE OPTIMIZATION
───────────────────────────────

Without V2G:
│
│            ╭────╮    Peak demand
│           ╱      ╲
│  ─────────        ────────── Average
│ ╱                          ╲
│╱                            ────── Valley
└──────────────────────────────────→ Time
   Night     Day      Evening   Night

With ELEKTROKOMBINACIJA V2G:
│
│  ────────────────────────────── Flattened profile
│         V2G           Charge
│       discharge        ↓
│           ↓        ─────────
│  ────────────────╱          ╲
│                              ─────
└──────────────────────────────────→ Time
   Night     Day      Evening   Night

Benefits:
• Reduced peak demand charges (30-50% savings)
• Better grid utilization
• Enables more renewable integration
```

### Demand Response

```
DEMAND RESPONSE INTEGRATION
───────────────────────────

Aggregator                    ELEKTROKOMBINACIJA
    │                               │
    │──── DR Signal (OpenADR) ─────→│
    │     (reduce 50 kW for 2 hrs)  │
    │                               │
    │                         ┌─────┴─────┐
    │                         │ AI Optimizer│
    │                         │            │
    │                         │ • Check SoC│
    │                         │ • Departure│
    │                         │ • Priority │
    │                         └─────┬─────┘
    │                               │
    │                         Distribute among
    │                         connected EVs
    │                               │
    │←── Acknowledgement ───────────│
    │    (confirmed: 45 kW)         │
    │                               │
    │         ... 2 hours later ... │
    │                               │
    │←── Completion Report ─────────│
    │    (delivered: 90 kWh flex)   │

Protocols supported:
• OpenADR 2.0b
• OSCP (Open Smart Charging Protocol)
• OCPP 2.0.1 with Smart Charging profiles
```

---

## 4. Grid Codes Compliance

### European Grid Codes (RfG)

```
EU REGULATION 2016/631 REQUIREMENTS
────────────────────────────────────

Type A (< 0.8 kW): Basic requirements
Type B (0.8 kW - 1 MW): Frequency/voltage ride-through
Type C (1 - 50 MW): Active power control
Type D (> 50 MW): Full ancillary services

ELEKTROKOMBINACIJA classification:
• Single EK30: Type A (simplified)
• Aggregated fleet: May reach Type B/C

Key requirements:
• Frequency range: 47.5 - 51.5 Hz (continuous)
• Voltage range: 0.85 - 1.10 pu
• Fault ride-through: Per national grid code
• Active power ramp rate: ≤10% Pn per minute
• Reactive power: Per Q(V) characteristics
```

### Fault Ride-Through

```
LOW VOLTAGE RIDE-THROUGH (LVRT)
───────────────────────────────

Voltage (pu)
    ↑
1.0 │─────────────╮
    │             │
0.9 │             ╰──────────────────
    │                  Must remain
0.5 │                  connected
    │
  0 └──────────────────────────────────→ Time
    0    150ms   1.5s              10s

EK30 LVRT capability:
• 0 pu for 150ms (complete dropout)
• 0.5 pu for 1.5s
• 0.9 pu continuous

During LVRT:
• Maintain DC bus voltage
• Resume charging when voltage recovers
• Inject reactive current if required (some codes)
```

### German VDE AR-N 4110

```
VDE AR-N 4110 (Srednji napon) zahtevi:
──────────────────────────────────────

1. Aktivna snaga:
   • Ramp rate: max 10% Pn/min
   • P(f) droop: mandatory

2. Reaktivna snaga:
   • cos φ: 0.9 ind to 0.9 cap
   • Q(V) support required

3. Fault behavior:
   • LVRT per curve
   • Current injection during fault

4. Protection:
   • Anti-islanding detection
   • Interface protection relay

ELEKTROKOMBINACIJA: Fully compliant design
```

---

## 5. Safety i Galvanska Izolacija

### Isolation Requirements

```
DC CHARGING ISOLATION
─────────────────────

IEC 61851-23 requirements:
• Isolation resistance: ≥100 Ω/V
• For 1000V system: ≥100 kΩ
• Continuous monitoring during charging

ELEKTROKOMBINACIJA implementation:
• LLC transformer provides galvanic isolation
• Isolation voltage: 4 kV (test)
• Continuous insulation monitoring (IMD)
• <1 second fault detection
```

### Anti-Islanding Protection

```
ISLANDING SCENARIO
──────────────────

Grid disconnects → Local generation (V2G) →
→ Powers local loads → Dangerous for line workers

Detection methods:
1. Passive:
   • Over/under voltage
   • Over/under frequency
   • Rate of change of frequency (ROCOF)
   • Vector shift

2. Active:
   • Impedance measurement
   • Frequency shift
   • Sandia frequency shift

ELEKTROKOMBINACIJA: Multi-method detection
• Passive: ROCOF + Vector shift
• Active: Impedance injection (during idle)
• Detection time: <2 seconds
• Response: Immediate disconnection
```

### Residual Current Protection

```
RCD REQUIREMENTS
────────────────

IEC 62955: RDC-DD (DC fault current detection)
• Type B RCD or equivalent
• DC fault detection: 6 mA
• AC fault detection: 30 mA

ELEKTROKOMBINACIJA implementation:
• Integrated DC fault sensing
• Separate AC RCD (Type A)
• Combined = Type B equivalent
• Compliant with IEC 62955
```

---

## 6. Round-Trip Efficiency

### V2G Efficiency Chain

```
CHARGING (Grid → Battery)
─────────────────────────
Grid AC → PFC Stage → DC Bus → LLC → Battery DC

η_charge = η_PFC × η_LLC
η_charge = 0.985 × 0.98 = 96.5%

DISCHARGING (Battery → Grid)
────────────────────────────
Battery DC → LLC (reverse) → DC Bus → Inverter → Grid AC

η_discharge = η_LLC × η_inverter
η_discharge = 0.98 × 0.985 = 96.5%

ROUND-TRIP EFFICIENCY
─────────────────────
η_roundtrip = η_charge × η_discharge
η_roundtrip = 0.965 × 0.965 = 93.1%

With battery losses (~2%):
η_total ≈ 91%

COMPARISON
──────────
Traditional pumped hydro: 70-85%
Grid-scale lithium battery: 85-90%
ELEKTROKOMBINACIJA V2G: 91%+ ← Competitive!
```

### Efficiency Optimization

```
AI-ENHANCED V2G EFFICIENCY
──────────────────────────

Traditional: Fixed switching frequency, fixed DC bus
ELEKTROKOMBINACIJA: Dynamic optimization

Optimizations:
1. Variable DC bus voltage
   • Match to battery voltage
   • Reduce LLC conversion ratio
   • +1-2% efficiency at partial load

2. Variable switching frequency
   • Track LLC resonance
   • Maintain ZVS across range
   • +0.5-1% efficiency

3. Interleaving phase control
   • Optimal phase angles for load
   • Ripple cancellation
   • Reduced filter losses

4. Thermal-aware operation
   • Run cooler = lower losses
   • AI predicts thermal trajectory
   • Adjusts for best efficiency point

Result: 93-95% round-trip (best case)
```

---

## 7. V2G Use Cases

### Fleet Depot (Primary Target)

```
SCENARIO: Bus depot with 50 electric buses
──────────────────────────────────────────

Fleet:
• 50 buses × 400 kWh battery = 20 MWh total storage
• Daily consumption: ~150 kWh/bus
• Parked 18:00 - 06:00 (12 hours)

V2G Opportunity:
• Available capacity: 20 MWh - (50 × 150 kWh next day buffer)
• Flex capacity: ~12.5 MWh

Revenue streams:
1. Frequency regulation: €5-15/MWh
2. Peak shaving: €50-100/MWh avoided
3. Demand response: €10-30/event
4. Capacity market: €30-50/kW-year

Annual V2G revenue estimate: €30,000 - €80,000
(Pays for charger system in 3-5 years)
```

### Commercial Building V2B

```
SCENARIO: Office building with EV parking
─────────────────────────────────────────

Setup:
• 20 parking spots with EK30 chargers
• 30% utilization during work hours
• Peak demand charge: €15/kW/month

V2B Strategy:
• Monitor building demand
• When approaching peak: V2B discharge
• When low demand: charge EVs

Peak reduction: 100 kW → 70 kW
Savings: 30 kW × €15 × 12 months = €5,400/year

Plus:
• Emergency backup power
• Demand response participation
• Employee benefit (free charging)
```

### Residential V2H

```
SCENARIO: Home with solar PV + EV
────────────────────────────────

Setup:
• 10 kW solar PV system
• EV with 60 kWh battery
• Grid connection: 3-phase, 11 kW

V2H Benefits:
1. Solar self-consumption
   • Excess solar → EV battery
   • Evening: EV → house
   • 80%+ self-consumption possible

2. Time-of-use arbitrage
   • Charge at night (€0.08/kWh)
   • Discharge at peak (€0.25/kWh)
   • Profit: €0.17/kWh × 20 kWh = €3.40/day

3. Backup power
   • Grid outage: EV powers essential loads
   • 60 kWh = 2-3 days of basic power
```

---

## 8. Bill of Materials - V2G Specific

| Komponenta | Specifikacija | Qty | Unit Price | Total |
|------------|---------------|-----|------------|-------|
| PLC Modem | HomePlug Green PHY | 1 | €25 | €25 |
| Crypto IC | Secure element (OPTIGA) | 1 | €8 | €8 |
| RDC-DD Module | DC 6mA detection | 1 | €45 | €45 |
| IMD | Insulation monitor | 1 | €60 | €60 |
| Grid Relay | 3-phase contactor, 63A | 1 | €80 | €80 |
| CT Sensors | Grid current, 0.5% | 3 | €15 | €45 |
| VT (Voltage) | Grid voltage sensing | 1 | €20 | €20 |
| PLL IC | Grid sync, TI ADS1247 | 1 | €12 | €12 |
| Protection Relay | Interface protection | 1 | €100 | €100 |
| **TOTAL V2G** | | | | **€395** |

---

## Reference i Izvori

- [ISO 15118-20:2022 Standard](https://www.iso.org/standard/77845.html)
- [ISO 15118-20 V2G Support](https://www.switch-ev.com/blog/how-iso15118-supports-vehicle-to-grid)
- [CharIN DC BPT Interoperability Guide](https://www.charin.global/media/pages/technology/knowledge-base/04e4f443ae-1731074296/charin_interop_guide_2.0_dc_bpt_iso_15118-20_v1.0_publication.pdf)
- [V2G Frequency Regulation Research](https://www.sciencedirect.com/science/article/abs/pii/S0378779624004474)
- [Reactive Power V2G Capabilities](https://www.researchgate.net/publication/312933890_Reactive_Power_Compensation_Capabilities_of_V2G-Enabled_Electric_Vehicles)
- [V2G Grid Services Overview](https://www.switch-ev.com/blog/vehicle-to-grid)
