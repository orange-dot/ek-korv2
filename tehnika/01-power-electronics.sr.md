# Power Electronics Arhitektura

## Filozofija: Bolje, Ne Lakše

```
TRADICIONALNO                     ELEKTROKOMBINACIJA
───────────────────────────────────────────────────────────
IGBT (jeftinije)            →    SiC MOSFET (50% manji gubici)
2-level topologija          →    3-level NPC (bolji THD, manji stress)
Si diode                    →    SiC Schottky (zero recovery)
Air cooling                 →    Liquid cooling (2× gustina)
Fixed frequency PWM         →    AI-optimized switching
```

---

## 1. SiC MOSFET Selekcija

### Zašto SiC umesto IGBT?

| Parametar | Si IGBT | SiC MOSFET | Prednost |
|-----------|---------|------------|----------|
| Switching losses | 100% (baseline) | 30-50% | 50-70% niže |
| Conduction losses | Vce(sat) ~2V | Rds(on) × I² | 30-40% niže pri partial load |
| Max junction temp | 150°C | 175°C | Veća termalna margina |
| Switching frequency | <20 kHz typical | >100 kHz | 5× veća frekvencija |
| Body diode | Slow recovery | Fast/Zero recovery | Nema reverse recovery losses |
| Temperature coefficient | Negative | Positive | Prirodna strujno balansiranje |

### Odabrani SiC MOSFET-i

#### EK3 (3.3 kW) - Wolfspeed 900V SiC

```
Komponenta: C3M0065090D (preporučeno)
─────────────────────────────────────────
Napon: 900V
Struja: 36A continuous
Rds(on): 65 mΩ @ 25°C
Package: TO-247-4 (Kelvin source)

Zašto 900V za 650V DC link?
• Optimalan balans cene i margine
• Dovoljna margina za voltage spikes (~40%)
• Bolji Rds(on) nego 1200V varijante
• Niža cena nego 1200V klasa

Alternative:
• Infineon IMZ120R045M1 (1200V) - veća margina
• ROHM SCT3030AR (650V) - ako je DC link niži
• Onsemi NTH4L022N065SC (650V) - cost optimized
```

#### EK30 (30 kW) - Wolfspeed Gen 4

```
Komponenta: CAB011M12FM3 (Six-Pack Module)
─────────────────────────────────────────
Napon: 1200V
Struja: 200A per phase
Rds(on): 11 mΩ (full bridge 100A config)
Package: 62mm industry standard

Gen 4 prednosti (vs Gen 3):
• 22% niži Rds(on) @ 125°C
• 60% niži turn-on energy
• 30% niži switching losses (soft body diode)
• 50% niži VDS overshoot

Dostupnost: Sampling sada, production Q1 2026
```

### Alternativa: Infineon CoolSiC G2

```
Komponenta: AIMW120R015M2 (ili modul)
─────────────────────────────────────
Napon: 1200V
Rds(on): 15 mΩ
Prednost: 25% niži switching losses vs G1
Package: Various (discrete i moduli)

Kada koristiti Infineon:
• Ako je Wolfspeed nedostupan
• Za second-source strategiju
• Automotive-qualified varijante (AEC-Q101)
```

---

## 2. Topologija: 3-Level NPC

### Zašto 3-Level umesto 2-Level?

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
   Vout: 0 ili Vdc             ┌───────────┐ │
                               │    S3     │─┼── Vdc/2
                               └───────────┘ │
                                    D3 ──┤  │
                               ┌───────────┐ │
                               │    S4     │─┘
                               └───────────┘

                               Vout: 0, Vdc/2, ili Vdc
```

### Prednosti 3-Level NPC

| Parametar | 2-Level | 3-Level NPC | Poboljšanje |
|-----------|---------|-------------|-------------|
| Voltage stress per switch | Vdc | Vdc/2 | 50% niži |
| Output THD | ~5% | <2% | 60% bolji |
| dv/dt stress | Visok | Nizak | EMC friendly |
| Filter size | Baseline | 50% manji | Manja težina |
| Switching losses | Baseline | 30% niže | Veća efikasnost |

### T-Type vs I-NPC Varijante

```
T-TYPE NPC (Odabrano za EK30)
─────────────────────────────
       S1 (1200V)
          │
    ┌─────┼─────┐
    │     │     │
   S2a   OUT   S2b    ← Bidirekcioni switch (2×650V)
    │     │     │
    └─────┼─────┘
          │
       S3 (1200V)

Prednosti T-Type:
• Manje komponenti nego I-NPC
• Niži conduction losses
• Optimalno za fsw < 50 kHz

I-NPC (Alternativa za višu frekvenciju)
───────────────────────────────────────
• Svi switchevi mogu biti 650V
• Bolji za fsw > 50 kHz
• Kompleksnija kontrola
```

### Implementacija za EK30

```
DC Bus: 800V nominal (do 1000V max)
───────────────────────────────────

High-side: 1200V SiC MOSFET (Wolfspeed Gen 4)
Mid-point: 2× 650V SiC MOSFET back-to-back
Low-side: 1200V SiC MOSFET (Wolfspeed Gen 4)

Switching frequency: 30-50 kHz
• Optimalno za T-type topologiju
• Dobar balans efikasnosti i veličine

Gate driver: Isolated, +18V/-5V
• Pozitivan bias: 18V za potpuno uključenje SiC
• Negativan bias: -5V za immunity od parasitic turn-on
```

---

## 3. DC-DC Stage: LLC Resonant

### Zašto LLC?

```
LLC RESONANT PREDNOSTI
──────────────────────
1. Zero Voltage Switching (ZVS) od no-load do full-load
2. Zero Current Switching (ZCS) na sekundarnim diodama
3. Soft switching = minimalni EMI
4. Mogućnost integracije Lr u transformer leakage
5. Jednostavna sinhronizacija za bidirekcioni rad (V2G)
```

### LLC Dizajn za EK3 (3.3 kW)

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

Parametri EK3:
─────────────
Input: 650V DC (from central PFC)
Output: 50-500V DC (battery range)
Power: 3.3 kW continuous (3.6 kW peak)
Resonant frequency: 200 kHz
Switching range: 150-250 kHz
Transformer ratio: 1:1 (za širok output range)
Magnetizing inductance Lm: 200 µH
Resonant inductance Lr: 20 µH
Resonant capacitor Cr: 32 nF

Planar transformer:
• Integrisan u PCB za manufacturing repeatability
• Leakage = Lr (no external inductor)
• Film capacitors (no electrolytics)

Očekivana efikasnost: >96% peak, >94% @ 50% load
```

### Three-Phase Interleaved LLC za EK30 (30 kW)

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
• Ripple cancellation na output
• Smanjenje output filter capacitance za 70%
• Distribucija termalne disipacije

Parametri EK30:
─────────────
Input: 800V DC (from NPC PFC)
Output: 200-1000V DC (podržava 400V i 800V vozila)
Power: 30 kW (3 × 10 kW phases)
Switching frequency: 135-250 kHz
Transformer ratio: 1:1.2

Peak efficiency: >98%
Reference: Wolfspeed 30kW interleaved LLC design
```

---

## 4. Gate Driver Dizajn

### Zahtevi za SiC MOSFET Gate Drive

```
SiC SPECIFIČNOSTI
─────────────────
1. Viši gate threshold: ~4V (vs 2V za Si)
2. Niža gate kapacitancija: Brže switching, ali više dv/dt
3. Miller plateau: Kraći, zahteva brži driver
4. Parasitic turn-on: Osetljiv na dv/dt indukovan gate noise

REŠENJE: +18V/-5V Gate Drive
────────────────────────────
• +18V: Osigurava nizak Rds(on) čak i na visokoj temperaturi
• -5V: Sprečava lažno paljenje od dv/dt noise
• Kelvin source: Eliminira common source inductance
```

### Preporučeni Gate Driver IC

```
Isolated Gate Driver: Silicon Labs Si823Hx
──────────────────────────────────────────
• Peak output current: 8A source/sink
• Propagation delay: <50 ns
• CMTI: >200 kV/µs
• Integrated DC-DC za ±supply

Alternative:
• Infineon 1EDC series
• Texas Instruments UCC21732
• ROHM BM61S41RFV
```

### Gate Resistor Optimizacija

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

Strategija:
• Rg_on: Veći (10-20Ω) - kontrolisan turn-on, manji overshoot
• Rg_off: Manji (2-5Ω) - brz turn-off za niže switching losses
• Doff: Bypass dioda za asimetrične Rg vrednosti
```

---

## 5. EMI/EMC Dizajn

### Common Mode Choke

```
          ┌─────┐
   L ─────┤     ├───── L'
          │ CMC │
   N ─────┤     ├───── N'
          └─────┘
           │ │
          PE (shield)

Specifikacija:
• Impedance: >1 kΩ @ 100 kHz
• Saturation current: >50A (za EK30)
• Nanocrystalline core za širok frekvencijski opseg
```

### dv/dt Limiting

```
3-level NPC prirodno ima niži dv/dt:
• 2-level: dv/dt = Vdc / t_rise ≈ 800V / 50ns = 16 kV/µs
• 3-level: dv/dt = (Vdc/2) / t_rise ≈ 400V / 50ns = 8 kV/µs

Dodatne mere:
• Snubber circuits na kritičnim nodovima
• Shielded gate drive transformeri
• Proper PCB layout (star grounding)
```

---

## 6. Protection Systems

### Hardware Protection

```
DESAT Detection (za SiC)
────────────────────────
• Monitor Vds during on-state
• Threshold: Vds > 8V = fault
• Blanking time: 500 ns (SiC ima brz turn-on)
• Response: Soft turn-off (controlled di/dt)

Over-Current Protection
───────────────────────
• Current sense resistor: 1-2 mΩ shunt
• Hall effect sensor: Za galvansku izolaciju
• Rogowski coil: Za brzu detekciju (AC komponenta)

Over-Voltage Protection
───────────────────────
• Active clamp circuit na DC bus
• TVS diode na gate
• Varistor na AC input
```

### AI-Enhanced Protection

```
Tradicionalno: Fixed thresholds
ELEKTROKOMBINACIJA: Adaptive AI thresholds

Primeri:
1. Cold start: Dozvoli viši inrush jer su komponente hladne
2. Hot operation: Smanji current limit jer je termal margina manja
3. Aged components: AI detektuje degradaciju, prilagođava limite
4. Predictive: Anticipira probleme pre nego što se dogode
```

---

## 7. Bill of Materials - Power Stage

### EK3 (3.3 kW) - Power Electronics BOM

| Komponenta | Part Number | Qty | Unit Price | Total |
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

| Komponenta | Part Number | Qty | Unit Price | Total |
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

## Reference i Izvori

- [Wolfspeed 1200V SiC MOSFETs](https://www.wolfspeed.com/products/power/sic-mosfets/1200v-silicon-carbide-mosfets/)
- [Wolfspeed Gen 4 Technology](https://www.eenewseurope.com/en/wolfspeed-launches-fourth-generation-sic-technology/)
- [Wolfspeed 30kW Interleaved LLC](https://forum.wolfspeed.com/uploads/22UYEDDEDTVL/a-sic-based-30kw-three-phases-interleaved-llc-converter-for-ev-fast-charger.pdf)
- [ON Semi - Fast DC EV Charging Topologies](https://www.onsemi.com/pub/collateral/tnd6366-d.pdf)
- [EE Power - Bidirectional Topologies](https://eepower.com/technical-articles/bi-directional-topologies-for-fast-charging-of-evs-options-to-optimize-for-size-power-cost-or-simplicity/)
- [ROHM 800V Three-Phase LLC](https://fscdn.rohm.com/en/products/databook/applinote/discrete/sic/mosfet/800v_three-phase_output_llc_dcdc_resonant_converter_an-e.pdf)
