# Konektori i Kablovi za EV Punjače

## 1. DC Charging Konektori

### 1.1 CCS Combo 2 (EU Standard)

```
CCS2 Connector Specifikacije:

┌─────────────────────────────────────────────────────────────────┐
│                       CCS COMBO 2                               │
│                                                                 │
│              AC Pins (Type 2)                                   │
│          ┌─────────────────────┐                               │
│          │   L1    L2    L3    │                               │
│          │   ●     ●     ●     │                               │
│          │                     │                               │
│          │   N      PE    CP   │                               │
│          │   ●      ●     ●    │   ← AC charging part          │
│          │              PP     │                               │
│          │              ●      │                               │
│          └─────────────────────┘                               │
│          ┌─────────────────────┐                               │
│          │                     │                               │
│          │   DC+        DC-    │   ← DC charging pins          │
│          │    ◉          ◉     │                               │
│          │                     │                               │
│          └─────────────────────┘                               │
│                                                                 │
│  DC Specifications:                                             │
│  ├── Max Voltage: 1000V DC (1500V in development)              │
│  ├── Max Current: 500A (with liquid cooling)                   │
│  ├── Max Power: 350 kW (500 kW in development)                 │
│  └── Communication: HomePlug GreenPHY (PLC via CP)             │
│                                                                 │
│  Locking: Electromagnetic or mechanical                        │
│  Coding: PP resistor for cable rating                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Pin Assignment:

│ Pin   │ Function           │ Rating              │
├───────┼────────────────────┼─────────────────────┤
│ L1    │ AC Phase 1         │ 32A AC (unused DC)  │
│ L2    │ AC Phase 2         │ 32A AC (unused DC)  │
│ L3    │ AC Phase 3         │ 32A AC (unused DC)  │
│ N     │ Neutral            │ 32A AC (unused DC)  │
│ PE    │ Protective Earth   │ Required            │
│ CP    │ Control Pilot      │ PWM + PLC signal    │
│ PP    │ Proximity Pilot    │ Cable rating        │
│ DC+   │ DC Positive        │ 500A @ 1000V        │
│ DC-   │ DC Negative        │ 500A @ 1000V        │
```

### 1.2 CCS2 Connector Products

```
Komercialni CCS2 Konektori:

1. Phoenix Contact CCS DC Connector:
┌─────────────────────────────────────────────────────────────┐
│ Model: EV-T2M3C-3AC32A-0,5M6,0E33                          │
│                                                             │
│ Specifications:                                             │
│ - DC: 200A continuous                                       │
│ - Voltage: 1000V DC                                         │
│ - Cable: 5m, 50mm² (air cooled)                            │
│ - Temperature rating: -40°C to +50°C                       │
│ - Locking: Electric lock                                    │
│                                                             │
│ Price: ~€400-600                                            │
└─────────────────────────────────────────────────────────────┘

2. ITT Cannon CCS2 (Liquid Cooled):
┌─────────────────────────────────────────────────────────────┐
│ Model: HPC Series                                           │
│                                                             │
│ Specifications:                                             │
│ - DC: 500A continuous (liquid cooled)                      │
│ - Voltage: 1000V DC                                         │
│ - Cable: 4-5m, integrated cooling                          │
│ - Coolant: 50% glycol, 6-8 L/min flow                      │
│                                                             │
│ Price: ~€1,500-2,500 (complete assembly)                   │
└─────────────────────────────────────────────────────────────┘

3. HUBER+SUHNER CCS:
┌─────────────────────────────────────────────────────────────┐
│ RADOX HPC 500 (High Power Charging)                        │
│                                                             │
│ - 500A liquid cooled                                        │
│ - Weight: <3.5 kg (connector only)                         │
│ - Ergonomic design                                          │
│ - >10,000 mating cycles                                     │
│                                                             │
│ Price: ~€2,000-3,000                                        │
└─────────────────────────────────────────────────────────────┘

4. Tesla-compatible Adapters:
   - CCS2 to Tesla (for older Teslas in EU)
   - Available from third parties
   - Price: ~€150-300
```

### 1.3 CHAdeMO Connector

```
CHAdeMO Connector:

┌─────────────────────────────────────────────────────────────────┐
│                      CHAdeMO                                    │
│                                                                 │
│              ┌─────────────────────────┐                       │
│              │  DC+    DC-    FG       │                       │
│              │   ◉      ◉      ○       │                       │
│              │                         │                       │
│              │  START  CHARGE  NC      │                       │
│              │   ○      ○      ○       │                       │
│              │                         │                       │
│              │  PP1   PP2   CAN_H CAN_L│                       │
│              │   ○     ○     ○     ○   │                       │
│              │                         │                       │
│              │  PROX   GND   NC    NC  │                       │
│              │   ○      ○    ○     ○   │                       │
│              └─────────────────────────┘                       │
│                                                                 │
│  Specifications:                                                │
│  ├── Max Voltage: 500V DC (1000V CHAdeMO 2.0)                  │
│  ├── Max Current: 400A                                          │
│  ├── Max Power: 200 kW (400 kW CHAdeMO 2.0)                    │
│  └── Communication: CAN bus (500 kbps)                         │
│                                                                 │
│  Locking: Mechanical (button release)                          │
│  Start: Physical start button required                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

CHAdeMO Suppliers:

1. Yazaki CHAdeMO Cable
   - 200A rated
   - 3-5m cable
   - Price: ~€500-800

2. JAE CHAdeMO
   - OEM quality
   - 400A available
   - Price: ~€600-900
```

### 1.4 Pantograph Connectors (za Autobuse)

```
Pantograph Systems za Bus Charging:

1. OppCharge (Opportunity Charging):
┌─────────────────────────────────────────────────────────────┐
│                   OppCharge System                          │
│                                                             │
│     ┌─────────────────────────────────────────────┐        │
│     │            Pantograph (on charger)          │        │
│     │   ┌───────────────────────────────────┐    │        │
│     │   │    DC+         DC-        PE      │    │        │
│     │   │     ▼           ▼          ▼      │    │        │
│     │   └───────────────────────────────────┘    │        │
│     │                    │                        │        │
│     │                    │ Raise/Lower            │        │
│     │                    ▼                        │        │
│     └─────────────────────────────────────────────┘        │
│                          │                                  │
│     ═══════════════════════════════════════════════        │
│                    BUS ROOF RAIL                            │
│                                                             │
│  Specifications (OppCharge):                                │
│  ├── Voltage: 150-800V DC                                   │
│  ├── Current: up to 500A                                    │
│  ├── Power: up to 450 kW                                    │
│  ├── Contact: Inverted pantograph                           │
│  └── Connection time: <5 seconds                            │
│                                                             │
│  Standards: EN 50696 (under development)                    │
└─────────────────────────────────────────────────────────────┘

2. Schunk Smart Charging:
   - Pantograph down (on bus)
   - Contact from roof structure
   - 150-600 kW
   - Price: €15,000-30,000 per station

3. ABB Pantograph System:
   - Up to 600 kW
   - Integrated with HVC charging
   - Price: €20,000-40,000

Roof Rail (Vehicle Side):

Standard Interface (OppCharge / EN 50696):
- DC+ and DC- contacts
- PE contact
- Data communication (CAN or PLC)
- Alignment tolerance: ±200mm
```

## 2. Liquid Cooled Cable

### 2.1 Konstrukcija

```
Liquid Cooled DC Cable Cross-Section:

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│            ┌─────────────────────────────────────┐             │
│            │           Outer Jacket              │             │
│            │      ┌───────────────────────┐      │             │
│            │      │    Coolant Tube (in)  │      │             │
│            │      │  ┌─────────────────┐  │      │             │
│            │      │  │    DC+ Cable    │  │      │             │
│            │      │  │  (35-50mm² Cu)  │  │      │             │
│            │      │  │    ┌─────┐      │  │      │             │
│            │      │  │    │     │      │  │      │             │
│            │      │  │    │     │      │  │      │             │
│            │      │  │    └─────┘      │  │      │             │
│            │      │  │                 │  │      │             │
│            │      │  │    DC- Cable    │  │      │             │
│            │      │  │  (35-50mm² Cu)  │  │      │             │
│            │      │  └─────────────────┘  │      │             │
│            │      │   Coolant Tube (out)  │      │             │
│            │      └───────────────────────┘      │             │
│            │        PE, PP, CP conductors        │             │
│            └─────────────────────────────────────┘             │
│                                                                 │
│  Cable Specifications:                                          │
│  ├── DC conductor: 35-50 mm² copper                            │
│  ├── Coolant tubes: 6-8mm diameter                             │
│  ├── Outer diameter: 40-50mm                                    │
│  ├── Weight: ~3-4 kg/m                                          │
│  ├── Bend radius: min 150mm                                     │
│  └── Operating temp: -40°C to +60°C ambient                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Cooling Parameters:

│ Current (A) │ Heat (W/m) │ Flow (L/min) │ ΔT Coolant │
├─────────────┼────────────┼──────────────┼────────────┤
│ 200         │ 20         │ 2            │ <5°C       │
│ 350         │ 60         │ 4            │ <7°C       │
│ 500         │ 120        │ 6            │ <10°C      │
```

### 2.2 Kabelski Sistemi

```
Liquid Cooled Cable Systems:

1. HUBER+SUHNER RADOX HPC:
┌─────────────────────────────────────────────────────────────┐
│ Complete system including:                                  │
│ - Liquid cooled cable (4-5m)                               │
│ - CCS2 connector with cooling                              │
│ - Coolant manifold connections                             │
│ - CP, PP, PE conductors                                    │
│                                                             │
│ Ratings:                                                    │
│ - 500A @ 1000V DC                                          │
│ - Coolant: 50% glycol, 8 L/min                            │
│                                                             │
│ Price: ~€3,000-5,000                                        │
└─────────────────────────────────────────────────────────────┘

2. Phoenix Contact Liquid Cooled:
┌─────────────────────────────────────────────────────────────┐
│ EV-T2M5C-DC-LIQCOOL series                                 │
│                                                             │
│ - 350A or 500A versions                                    │
│ - Integrated temperature monitoring                        │
│ - 5m cable standard                                         │
│                                                             │
│ Price: ~€2,500-4,000                                        │
└─────────────────────────────────────────────────────────────┘

3. ITT Cannon HPC:
┌─────────────────────────────────────────────────────────────┐
│ High Power Charging Assembly                               │
│                                                             │
│ - Up to 500A                                                │
│ - Lightweight aluminum construction                        │
│ - Advanced thermal management                              │
│                                                             │
│ Price: ~€2,000-3,500                                        │
└─────────────────────────────────────────────────────────────┘
```

## 3. Internal Wiring

### 3.1 AC Input Cables

```
AC Input Cable Sizing:

Ampacity Calculation:

I_rated = P / (√3 × V × pf)

Za 150 kW @ 400V, pf=0.95:
I = 150000 / (√3 × 400 × 0.95) = 228A

Cable selection (derating factors):
- Installation: In tray (0.85)
- Ambient: 40°C (0.91)
- Grouping: 2 cables (0.80)

Required ampacity: 228 / (0.85 × 0.91 × 0.80) = 368A

Cable: 185mm² Cu per phase (4-core + PE)

Cable Products:

1. Lapp ÖLFLEX CLASSIC 400:
   - 4G185 + 1×95 PE
   - PVC insulation
   - Price: ~€50-70/m

2. Nexans H07RN-F:
   - Rubber insulated
   - More flexible
   - Price: ~€60-80/m
```

### 3.2 DC Bus Bars

```
DC Bus Bar Design:

For 150 kW @ 800V:
I_dc = 150000 / 800 = 187.5A (×1.25 = 235A rating)

Copper Bar Sizing:
J = 3-5 A/mm² (with forced air/liquid cooling)
A = 235 / 4 = 59 mm² minimum

Standard: 40mm × 5mm copper (200 mm²) → ample margin

Laminated Bus Bar Benefits:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Insulation (Kapton/Nomex)                          │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  DC+ Copper layer                                   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  Insulation                                         │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  DC- Copper layer                                   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  Insulation (outer)                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Advantages:                                                │
│  - Very low inductance (<10 nH)                            │
│  - Reduced EMI                                              │
│  - Better current sharing                                   │
│  - Compact construction                                     │
│                                                             │
│  Custom fabrication: €200-500 per set                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Signal Cables

```
Signal Cable Types:

1. CAN Bus:
   - Shielded twisted pair
   - 120Ω characteristic impedance
   - LAPP UNITRONIC BUS CAN: €3-5/m

2. Control Signals:
   - Multi-conductor shielded
   - LIYCY or similar
   - €2-4/m

3. Temperature Sensors:
   - Shielded for noise immunity
   - Extension wire for thermocouples
   - €1-3/m

4. Gate Drive:
   - Twisted pair, shielded
   - Low capacitance
   - Short runs (<1m) preferred

5. Ethernet/Communication:
   - Cat6 STP for internal
   - Industrial Ethernet (M12) for external
   - €3-10/m

Cable Segregation:

┌─────────────────────────────────────────────────────────────┐
│                     CABLE ROUTING                           │
│                                                             │
│  Power Cables ════════════════════════════════════════════  │
│                                                             │
│  ─────────────── Physical Separation (min 50mm) ──────────  │
│                                                             │
│  Signal Cables ────────────────────────────────────────────  │
│                                                             │
│  Rules:                                                     │
│  - Cross at 90° if must cross                              │
│  - Separate cable trays for power/signal                   │
│  - Shield grounded at one end (or both with care)          │
│  - Ferrites on signal cables near noise sources            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 4. Connector Accessories

### 4.1 Cable Management

```
Cable Retraction Systems:

1. Spring Retractor:
   - Simple mechanical
   - Good for short cables (<3m)
   - Price: €200-400

2. Motorized Retractor:
   - For longer/heavier cables
   - Controlled retraction speed
   - Price: €500-1,000

3. Cable Holder Hook:
   - Manual placement
   - Lowest cost
   - Price: €50-100

4. Overhead Cable Guide:
   - For multiple dispensers
   - Reduces trip hazard
   - Price: €300-600

Holster/Holder Design:

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│      ┌───────────────────────────────────────────┐         │
│      │                                           │         │
│      │   ╔═══════════════════════════════════╗   │         │
│      │   ║       CCS2 Connector Rest         ║   │         │
│      │   ║   ┌─────────────────────────┐     ║   │         │
│      │   ║   │                         │     ║   │         │
│      │   ║   │    Connector sits here  │     ║   │         │
│      │   ║   │                         │     ║   │         │
│      │   ║   └─────────────────────────┘     ║   │         │
│      │   ║                                   ║   │         │
│      │   ╚═══════════════════════════════════╝   │         │
│      │                                           │         │
│      │   Cable guide/hook                        │         │
│      │                                           │         │
│      └───────────────────────────────────────────┘         │
│                                                             │
│   Features:                                                 │
│   - Weather protection (cover)                              │
│   - LED status light                                        │
│   - Drainage for water                                      │
│   - Secure hold during charging                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Environmental Protection

```
IP Rating Requirements:

Connector (when mated): IP44 minimum
Connector (in holster): IP54 minimum
Outdoor charging: IP65 preferred

Sealing Methods:
- O-ring seals on mating face
- Cable glands with IP68 rating
- Holster with drainage

Temperature Considerations:

│ Climate        │ Design Temp Range    │ Special Requirements │
├────────────────┼──────────────────────┼──────────────────────┤
│ Mediterranean  │ -10°C to +45°C       │ Standard             │
│ Continental    │ -25°C to +45°C       │ Cold rated cables    │
│ Nordic         │ -40°C to +35°C       │ Arctic grade, heaters│
│ Desert         │ 0°C to +55°C         │ High temp rated      │

For Serbia (EXPO 2027):
- Design range: -20°C to +45°C
- Standard commercial grade suitable
```

## 5. Bill of Materials - Konektori

```
┌─────────────────────────────────────────────────────────────────┐
│ KONEKTORI I KABLOVI (150 kW DC Punjač)                          │
├──────────────────────────────┬─────┬────────────┬───────────────┤
│ Komponenta                   │ Qty │ Jed. cena  │    Ukupno     │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ CCS2 Liquid Cooled Cable Assy│  1  │  €3,000    │   €3,000      │
│ (5m, 350A rated)             │     │            │               │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ CHAdeMO Cable Assembly       │  1  │   €700     │    €700       │
│ (5m, 200A) - optional       │     │            │               │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ AC Input Cable 4×185mm²      │ 10m │    €60     │    €600       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ DC Bus Bar Set (laminated)   │  1  │   €350     │    €350       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Internal DC cable 70mm²      │ 10m │    €25     │    €250       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Signal cables (various)      │ set │   €150     │    €150       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Cable glands, terminals      │ set │   €100     │    €100       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Cable retractor/holder       │  1  │   €300     │    €300       │
├──────────────────────────────┴─────┴────────────┼───────────────┤
│ UKUPNO KONEKTORI/KABLOVI                        │   €5,450      │
│ (sa CHAdeMO opcijom)                            │               │
│                                                 │               │
│ Bez CHAdeMO:                                    │   €4,750      │
└─────────────────────────────────────────────────┴───────────────┘

Za Bus Pantograph dodatno:
│ Pantograph system            │  1  │ €20,000    │  €20,000      │
│ (complete, incl. controls)   │     │            │               │
```

## 6. Zaključak

```
Preporuke za Konektore i Kablove:

1. DC Connector Selection:
   ├── CCS2: Obavezno za EU tržište
   ├── CHAdeMO: Opcionalno za kompatibilnost
   └── Pantograph: Za depot/bus charging

2. Cable Type:
   ├── >200A: Liquid cooling required
   ├── <200A: Air cooled acceptable
   └── Quality brands: HUBER+SUHNER, Phoenix, ITT

3. Internal Wiring:
   ├── Laminated bus bars za low inductance
   ├── Proper segregation power/signal
   └── Industrial grade connectors

4. Environmental:
   ├── IP54 minimum za sve
   ├── UV resistant za outdoor
   └── Temperature rated za climate

5. Testing:
   ├── Cycle testing (10,000+ insertions)
   ├── Temperature rise test
   └── IP rating verification
```
