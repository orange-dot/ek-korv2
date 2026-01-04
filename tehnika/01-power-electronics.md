# Power Electronics Architecture

## Philosophy: Better, Not Easier

```
TRADITIONAL                      ELEKTROKOMBINACIJA
───────────────────────────────────────────────────────────
IGBT (cheaper)              →    SiC MOSFET (50% lower losses)
2-level topology            →    3-level NPC (better THD, lower stress)
Si diodes                   →    SiC Schottky (zero recovery)
Air cooling                 →    Liquid cooling (2× density)
Fixed frequency PWM         →    AI-optimized switching
```

---

## 1. SiC MOSFET Selection

### Why SiC instead of IGBT?

| Parameter | Si IGBT | SiC MOSFET | Advantage |
|-----------|---------|------------|----------|
| Switching losses | 100% (baseline) | 30-50% | 50-70% lower |
| Conduction losses | Vce(sat) ~2V | Rds(on) × I² | 30-40% lower at partial load |
| Max junction temp | 150°C | 175°C | Higher thermal margin |
| Switching frequency | <20 kHz typical | >100 kHz | 5× higher frequency |
| Body diode | Slow recovery | Fast/Zero recovery | No reverse recovery losses |
| Temperature coefficient | Negative | Positive | Natural current balancing |

### Selected SiC MOSFETs

#### EK3 (3.3 kW) - Wolfspeed 900V SiC

```
Component: C3M0065090D (recommended)
─────────────────────────────────────────
Voltage: 900V
Current: 36A continuous
Rds(on): 65 mΩ @ 25°C
Package: TO-247-4 (Kelvin source)

Why 900V for 650V DC link?
• Optimal balance of cost and margin
• Sufficient margin for voltage spikes (~40%)
• Better Rds(on) than 1200V variants
• Lower cost than 1200V class

Alternatives:
• Infineon IMZ120R045M1 (1200V) - higher margin
• ROHM SCT3030AR (650V) - if DC link is lower
• Onsemi NTH4L022N065SC (650V) - cost optimized
```

#### EK30 (30 kW) - Wolfspeed Gen 4

```
Component: CAB011M12FM3 (Six-Pack Module)
─────────────────────────────────────────
Voltage: 1200V
Current: 200A per phase
Rds(on): 11 mΩ (full bridge 100A config)
Package: 62mm industry standard

Gen 4 advantages (vs Gen 3):
• 22% lower Rds(on) @ 125°C
• 60% lower turn-on energy
• 30% lower switching losses (soft body diode)
• 50% lower VDS overshoot

Availability: Sampling now, production Q1 2026
```

### Alternative: Infineon CoolSiC G2

```
Component: AIMW120R015M2 (or module)
─────────────────────────────────────
Voltage: 1200V
Rds(on): 15 mΩ
Advantage: 25% lower switching losses vs G1
Package: Various (discrete and modules)

When to use Infineon:
• If Wolfspeed is unavailable
• For second-source strategy
• Automotive-qualified variants (AEC-Q101)
```

---

## 2. Topology: 3-Level NPC

### Why 3-Level instead of 2-Level?

```
2-LEVEL                          3-LEVEL NPC
    │                                │
    ▼                                ▼
┌───────┐                      ┌───────────┐
│  S1   │─┐                    │    S1     │─┐
└───────┘ │                    └───────────┘ │
          ├── Vdc                   D1 ──┤  │
┌───────┐ │                    ┌───────────┐ │
│  S2   │─┘                    │    S2     │─┼── Vdc/2
└───────┘                      └───────────┘ │
                                    D2 ──┤  │    ← Neutral point
   Vout: 0 or Vdc              ┌───────────┐ │
                               │    S3     │─┼── Vdc/2
                               └───────────┘ │
                                    D3 ──┤  │
                               ┌───────────┐ │
                               │    S4     │─┘
                               └───────────┘

                               Vout: 0, Vdc/2, or Vdc
```

### 3-Level NPC Advantages

| Parameter | 2-Level | 3-Level NPC | Improvement |
|-----------|---------|-------------|-------------|
| Voltage stress per switch | Vdc | Vdc/2 | 50% lower |
| Output THD | ~5% | <2% | 60% better |
| dv/dt stress | High | Low | EMC friendly |
| Filter size | Baseline | 50% smaller | Lower weight |
| Switching losses | Baseline | 30% lower | Higher efficiency |

### T-Type vs I-NPC Variants

```
T-TYPE NPC (Selected for EK30)
─────────────────────────────
       S1 (1200V)
          │
    ┌─────┼─────┐
    │     │     │
   S2a   OUT   S2b    ← Bidirectional switch (2×650V)
    │     │     │
    └─────┼─────┘
          │
       S3 (1200V)

T-Type advantages:
• Fewer components than I-NPC
• Lower conduction losses
• Optimal for fsw < 50 kHz

I-NPC (Alternative for higher frequency)
───────────────────────────────────────
• All switches can be 650V
• Better for fsw > 50 kHz
• More complex control
```

### Implementation for EK30

```
DC Bus: 800V nominal (up to 1000V max)
───────────────────────────────────

High-side: 1200V SiC MOSFET (Wolfspeed Gen 4)
Mid-point: 2× 650V SiC MOSFET back-to-back
Low-side: 1200V SiC MOSFET (Wolfspeed Gen 4)

Switching frequency: 30-50 kHz
• Optimal for T-type topology
• Good balance of efficiency and size

Gate driver: Isolated, +18V/-5V
• Positive bias: 18V for full SiC turn-on
• Negative bias: -5V for immunity from parasitic turn-on
```

---

## 3. DC-DC Stage: LLC Resonant

### Why LLC?

```
LLC RESONANT ADVANTAGES
──────────────────────
1. Zero Voltage Switching (ZVS) from no-load to full-load
2. Zero Current Switching (ZCS) on secondary diodes
3. Soft switching = minimal EMI
4. Ability to integrate Lr into transformer leakage
5. Simple synchronization for bidirectional operation (V2G)
```

### LLC Design for EK3 (3.3 kW)

```
                    Lr      Cr
          ┌────────[===]───||───┐
          │                     │
    S1 ───┤                     │
          │    ┌───────────┐    │
Vdc ──────┼────┤           ├────┼──── Vout
          │    │    Tx     │    │
    S2 ───┤    │   n:1     │    │
          │    └───────────┘    │
          │         │           │
          └─────────┴───────────┘
                    Lm

EK3 Parameters:
─────────────
Input: 650V DC (from central PFC)
Output: 50-500V DC (battery range)
Power: 3.3 kW continuous (3.6 kW peak)
Resonant frequency: 200 kHz
Switching range: 150-250 kHz
Transformer ratio: 1:1 (for wide output range)
Magnetizing inductance Lm: 200 µH
Resonant inductance Lr: 20 µH
Resonant capacitor Cr: 32 nF

Planar transformer:
• Integrated into PCB for manufacturing repeatability
• Leakage = Lr (no external inductor)
• Film capacitors (no electrolytics)

Expected efficiency: >96% peak, >94% @ 50% load
```

### Three-Phase Interleaved LLC for EK30 (30 kW)

```
         Phase A      Phase B      Phase C
            │            │            │
         ┌──┴──┐      ┌──┴──┐      ┌──┴──┐
         │ LLC │      │ LLC │      │ LLC │
         │ 10kW│      │ 10kW│      │ 10kW│
         └──┬──┘      └──┬──┘      └──┬──┘
            │            │            │
            └──────┬─────┴─────┬─────┘
                   │           │
               Vout+       Vout-

Interleaving: 120° phase shift
─────────────────────────────
• Ripple cancellation on output
• 70% reduction in output filter capacitance
• Distribution of thermal dissipation

EK30 Parameters:
─────────────
Input: 800V DC (from NPC PFC)
Output: 200-1000V DC (supports 400V and 800V vehicles)
Power: 30 kW (3 × 10 kW phases)
Switching frequency: 135-250 kHz
Transformer ratio: 1:1.2

Peak efficiency: >98%
Reference: Wolfspeed 30kW interleaved LLC design
```

---

## 4. Gate Driver Design

### Requirements for SiC MOSFET Gate Drive

```
SiC SPECIFICS
─────────────────
1. Higher gate threshold: ~4V (vs 2V for Si)
2. Lower gate capacitance: Faster switching, but more dv/dt
3. Miller plateau: Shorter, requires faster driver
4. Parasitic turn-on: Sensitive to dv/dt induced gate noise

SOLUTION: +18V/-5V Gate Drive
────────────────────────────
• +18V: Ensures low Rds(on) even at high temperature
• -5V: Prevents false turn-on from dv/dt noise
• Kelvin source: Eliminates common source inductance
```

### Recommended Gate Driver IC

```
Isolated Gate Driver: Silicon Labs Si823Hx
──────────────────────────────────────────
• Peak output current: 8A source/sink
• Propagation delay: <50 ns
• CMTI: >200 kV/µs
• Integrated DC-DC for ±supply

Alternatives:
• Infineon 1EDC series
• Texas Instruments UCC21732
• ROHM BM61S41RFV
```

### Gate Resistor Optimization

```
         Rg_on
    ┌────[===]────┐
    │             │
Driver OUT ──┼── MOSFET Gate
    │             │
    └────[===]────┘
         Rg_off
           │
         Doff (Schottky)

Strategy:
• Rg_on: Higher (10-20Ω) - controlled turn-on, lower overshoot
• Rg_off: Lower (2-5Ω) - fast turn-off for lower switching losses
• Doff: Bypass diode for asymmetric Rg values
```

---

## 5. EMI/EMC Design

### Common Mode Choke

```
          ┌─────┐
   L ─────┤     ├───── L'
          │ CMC │
   N ─────┤     ├───── N'
          └─────┘
           │ │
          PE (shield)

Specification:
• Impedance: >1 kΩ @ 100 kHz
• Saturation current: >50A (for EK30)
• Nanocrystalline core for wide frequency range
```

### dv/dt Limiting

```
3-level NPC naturally has lower dv/dt:
• 2-level: dv/dt = Vdc / t_rise ≈ 800V / 50ns = 16 kV/µs
• 3-level: dv/dt = (Vdc/2) / t_rise ≈ 400V / 50ns = 8 kV/µs

Additional measures:
• Snubber circuits on critical nodes
• Shielded gate drive transformers
• Proper PCB layout (star grounding)
```

---

## 6. Protection Systems

### Hardware Protection

```
DESAT Detection (for SiC)
────────────────────────
• Monitor Vds during on-state
• Threshold: Vds > 8V = fault
• Blanking time: 500 ns (SiC has fast turn-on)
• Response: Soft turn-off (controlled di/dt)

Over-Current Protection
───────────────────────
• Current sense resistor: 1-2 mΩ shunt
• Hall effect sensor: For galvanic isolation
• Rogowski coil: For fast detection (AC component)

Over-Voltage Protection
───────────────────────
• Active clamp circuit on DC bus
• TVS diode on gate
• Varistor on AC input
```

### AI-Enhanced Protection

```
Traditional: Fixed thresholds
ELEKTROKOMBINACIJA: Adaptive AI thresholds

Examples:
1. Cold start: Allow higher inrush because components are cold
2. Hot operation: Reduce current limit because thermal margin is smaller
3. Aged components: AI detects degradation, adjusts limits
4. Predictive: Anticipates problems before they occur
```

---

## 7. Bill of Materials - Power Stage

### EK3 (3.3 kW) - Power Electronics BOM

| Component | Part Number | Qty | Unit Price | Total |
|------------|-------------|-----|------------|-------|
| SiC MOSFET 900V | C3M0065090D | 4 | €18 | €72 |
| SiC Schottky 650V | C3D10065A | 4 | €8 | €32 |
| Gate Driver | Si823H | 2 | €12 | €24 |
| Resonant Capacitor | Film, 200kHz rated | 4 | €5 | €20 |
| Planar Transformer | PCB integrated, 3.3kW | 1 | €60 | €60 |
| DC Link Capacitor | Film 800V, 100µF | 2 | €20 | €40 |
| CM Choke | Nanocrystalline | 1 | €25 | €25 |
| Current Sensor | TLI4971 | 1 | €8 | €8 |
| Heatsink + Vapor Chamber | Aluminum, finned | 1 | €35 | €35 |
| PCB | 4-layer, 2oz Cu, planar Tx | 1 | €50 | €50 |
| STM32G474 + passives | MCU + CAN-FD | 1 | €15 | €15 |
| Connectors (20-pin + power) | Blind-mate | 1 | €30 | €30 |
| **TOTAL Power Stage** | | | | **€411** |

### EK30 (30 kW) - Power Electronics BOM

| Component | Part Number | Qty | Unit Price | Total |
|------------|-------------|-----|------------|-------|
| SiC Module 1200V | CAB011M12FM3 | 2 | €350 | €700 |
| SiC MOSFET 650V (T-type) | Various | 12 | €20 | €240 |
| Gate Driver Module | Integrated | 2 | €80 | €160 |
| LLC Transformer | Custom, 10kW each | 3 | €150 | €450 |
| DC Bus Capacitor Bank | 900V, film | 1 set | €200 | €200 |
| CM Choke | High current | 1 | €80 | €80 |
| Current Sensors | Industrial | 6 | €25 | €150 |
| Coldplate (liquid) | Aluminum, channels | 1 | €150 | €150 |
| PCB Assembly | 6-layer, heavy Cu | 1 | €200 | €200 |
| Connectors, busbars | High current | - | - | €150 |
| **TOTAL Power Stage** | | | | **€2,480** |

---

## 8. Performance Targets

### EK3 Targets

```
Parameter               Target      Notes
──────────────────────────────────────────
Peak efficiency         >96%        @ 50% load
Full load efficiency    >94%        @ 3.3 kW
THD (current)          N/A         DC/DC only (central PFC)
Power factor           N/A         DC/DC only
Standby power          <3W         Deep sleep mode
Turn-on time           <5s         Hot-swap ready
Hot-swap time          <1s         Electrical disconnect
Communication          CAN-FD      @ 5 Mbps
```

### EK30 Targets

```
Parameter               Target      Notes
──────────────────────────────────────────
Peak efficiency         >98%        @ 50% load
Full load efficiency    >97%        @ 30 kW
THD (current)          <2%         3-level advantage
Power factor           >0.995      T-type NPC
Standby power          <10W        Per module
V2G round-trip eff     >94%        AC→DC→AC
```

---

## References and Sources

- [Wolfspeed 1200V SiC MOSFETs](https://www.wolfspeed.com/products/power/sic-mosfets/1200v-silicon-carbide-mosfets/)
- [Wolfspeed Gen 4 Technology](https://www.eenewseurope.com/en/wolfspeed-launches-fourth-generation-sic-technology/)
- [Wolfspeed 30kW Interleaved LLC](https://forum.wolfspeed.com/uploads/22UYEDDEDTVL/a-sic-based-30kw-three-phases-interleaved-llc-converter-for-ev-fast-charger.pdf)
- [ON Semi - Fast DC EV Charging Topologies](https://www.onsemi.com/pub/collateral/tnd6366-d.pdf)
- [EE Power - Bidirectional Topologies](https://eepower.com/technical-articles/bi-directional-topologies-for-fast-charging-of-evs-options-to-optimize-for-size-power-cost-or-simplicity/)
- [ROHM 800V Three-Phase LLC](https://fscdn.rohm.com/en/products/databook/applinote/discrete/sic/mosfet/800v_three-phase_output_llc_dcdc_resonant_converter_an-e.pdf)
