# Bill of Materials and Cost Analysis

## Philosophy: Premium Components, AI Compensation

```
TRADITIONAL APPROACH               ELEKTROKOMBINACIJA
────────────────────────────────────────────────────────────
"Cheaper IGBT"              →    "More expensive SiC, but 50% lower losses"
"Simpler air cool"          →    "More expensive liquid, but 2× density"
"2-level because cheaper"   →    "3-level because better THD"
"Minimum sensors"           →    "AI needs data"

RESULT:
Higher BOM cost            →    But: longer lifespan, lower TCO
More complex design        →    But: AI manages complexity
Premium positioning        →    But: premium performance
```

---

## 1. EK3 (3 kW) - Complete BOM

### Power Electronics

| ID | Component | Part Number | Qty | Unit € | Total € |
|----|------------|-------------|-----|--------|---------|
| PE01 | SiC MOSFET 1000V/35A | C3M0065100K | 8 | 15.00 | 120.00 |
| PE02 | SiC Schottky 650V | C3D10065A | 8 | 8.00 | 64.00 |
| PE03 | Gate Driver IC | Si823H | 4 | 12.00 | 48.00 |
| PE04 | Gate drive transformer | Wurth 750316027 | 4 | 5.00 | 20.00 |
| PE05 | DC Bus Capacitor 450V/470µF | Film, 200kHz | 4 | 15.00 | 60.00 |
| PE06 | Resonant Capacitor | Film, low ESR | 4 | 5.00 | 20.00 |
| PE07 | LLC Transformer 3kW | Custom wound | 1 | 80.00 | 80.00 |
| PE08 | PFC Inductor | Custom, 200µH | 3 | 20.00 | 60.00 |
| PE09 | EMI Filter CM Choke | Nanocrystalline | 1 | 25.00 | 25.00 |
| PE10 | EMI Filter DM | Inductors + Caps | 1 set | 15.00 | 15.00 |
| PE11 | Snubber circuits | RC networks | 1 set | 5.00 | 5.00 |
| PE12 | Current sensor | ACS712 or shunt | 2 | 10.00 | 20.00 |
| PE13 | Voltage dividers | Precision resistor | 4 | 2.00 | 8.00 |
| | **Subtotal Power Electronics** | | | | **€545.00** |

### Control Electronics

| ID | Component | Part Number | Qty | Unit € | Total € |
|----|------------|-------------|-----|--------|---------|
| CE01 | MCU | STM32H743 | 1 | 18.00 | 18.00 |
| CE02 | Crystal oscillator | 25MHz, ±10ppm | 1 | 2.00 | 2.00 |
| CE03 | Voltage regulators | 3.3V, 5V, 15V | 3 | 3.00 | 9.00 |
| CE04 | Op-amps (signal cond.) | OPA4377 | 2 | 4.00 | 8.00 |
| CE05 | ADC external (if needed) | ADS131M04 | 1 | 8.00 | 8.00 |
| CE06 | CAN-FD transceiver | TJA1443 | 1 | 3.00 | 3.00 |
| CE07 | Ethernet PHY | LAN8720 | 1 | 4.00 | 4.00 |
| CE08 | Flash memory | 16MB QSPI | 1 | 5.00 | 5.00 |
| CE09 | RTC + Battery | DS3231 + CR2032 | 1 | 4.00 | 4.00 |
| CE10 | Status LEDs | RGB addressable | 4 | 0.50 | 2.00 |
| CE11 | Connectors | Various | 1 set | 15.00 | 15.00 |
| CE12 | PCB Control | 4-layer, 100×80mm | 1 | 15.00 | 15.00 |
| | **Subtotal Control Electronics** | | | | **€93.00** |

### Thermal

| ID | Component | Part Number | Qty | Unit € | Total € |
|----|------------|-------------|-----|--------|---------|
| TH01 | Aluminum enclosure | Finned, 150×120×80 | 1 | 40.00 | 40.00 |
| TH02 | Internal heatsink | Aluminum, machined | 1 | 20.00 | 20.00 |
| TH03 | TIM (Thermal pad) | Phase change | 1 set | 10.00 | 10.00 |
| TH04 | NTC temperature sensors | 10k, 3950K | 4 | 1.00 | 4.00 |
| TH05 | Fan (optional) | 60mm, 12V | 1 | 8.00 | 8.00 |
| | **Subtotal Thermal** | | | | **€82.00** |

### Connectivity

| ID | Component | Part Number | Qty | Unit € | Total € |
|----|------------|-------------|-----|--------|---------|
| CN01 | DC output connector | Anderson PP45 | 1 | 8.00 | 8.00 |
| CN02 | AC input connector | IEC 60320 C14 | 1 | 3.00 | 3.00 |
| CN03 | CAN connector | M12, 5-pin | 1 | 5.00 | 5.00 |
| CN04 | Ethernet connector | RJ45 shielded | 1 | 2.00 | 2.00 |
| CN05 | Status display | OLED 0.96" I2C | 1 | 8.00 | 8.00 |
| | **Subtotal Connectivity** | | | | **€26.00** |

### Mechanical & Misc

| ID | Component | Part Number | Qty | Unit € | Total € |
|----|------------|-------------|-----|--------|---------|
| MC01 | Power PCB | 4-layer, 2oz Cu | 1 | 40.00 | 40.00 |
| MC02 | Mounting hardware | Screws, standoffs | 1 set | 5.00 | 5.00 |
| MC03 | Labels, documentation | Printed | 1 set | 3.00 | 3.00 |
| MC04 | Wiring internal | Silicone, various | 1 set | 10.00 | 10.00 |
| MC05 | Fuse/breaker | 16A, DC rated | 1 | 5.00 | 5.00 |
| | **Subtotal Mechanical** | | | | **€63.00** |

### EK3 Total BOM

| Category | Subtotal € |
|------------|------------|
| Power Electronics | 545.00 |
| Control Electronics | 93.00 |
| Thermal | 82.00 |
| Connectivity | 26.00 |
| Mechanical & Misc | 63.00 |
| **TOTAL EK3 BOM** | **€809.00** |

---

## 2. EK30 (30 kW) - Complete BOM

### Power Electronics

| ID | Component | Part Number | Qty | Unit € | Total € |
|----|------------|-------------|-----|--------|---------|
| PE01 | SiC Module 1200V | CAB011M12FM3 | 2 | 350.00 | 700.00 |
| PE02 | SiC MOSFET 650V (T-type) | IMW65R048M1H | 12 | 20.00 | 240.00 |
| PE03 | Gate Driver Module | CGD15SG00D2 | 2 | 80.00 | 160.00 |
| PE04 | Gate drivers (discrete) | Si8239x | 6 | 15.00 | 90.00 |
| PE05 | DC Bus Capacitor 900V | Film capacitor bank | 1 | 200.00 | 200.00 |
| PE06 | LLC Transformer 10kW | Custom, 3-phase | 3 | 150.00 | 450.00 |
| PE07 | Resonant Inductors | Custom, integrated | 3 | 40.00 | 120.00 |
| PE08 | PFC Inductors | 3-phase, 100µH | 3 | 80.00 | 240.00 |
| PE09 | EMI Filter CM Choke | High current | 1 | 80.00 | 80.00 |
| PE10 | EMI Filter DM | 3-phase | 1 | 60.00 | 60.00 |
| PE11 | Current sensors | Industrial Hall | 6 | 25.00 | 150.00 |
| PE12 | Voltage sensors | Isolated | 4 | 15.00 | 60.00 |
| PE13 | Busbars | Copper, laminated | 1 set | 100.00 | 100.00 |
| PE14 | AC Contactor | 3-phase, 63A | 1 | 80.00 | 80.00 |
| PE15 | DC Contactor | 1000V, 100A | 1 | 120.00 | 120.00 |
| | **Subtotal Power Electronics** | | | | **€2,850.00** |

### Control Electronics

| ID | Component | Part Number | Qty | Unit € | Total € |
|----|------------|-------------|-----|--------|---------|
| CE01 | MCU (main) | STM32N657 (NPU) | 1 | 35.00 | 35.00 |
| CE02 | MCU (safety) | STM32G474 | 1 | 12.00 | 12.00 |
| CE03 | Voltage regulators | Multi-rail PMIC | 1 | 15.00 | 15.00 |
| CE04 | Signal conditioning | Op-amp arrays | 4 | 5.00 | 20.00 |
| CE05 | High-speed ADC | ADS131M08 | 2 | 15.00 | 30.00 |
| CE06 | CAN-FD transceiver | TJA1443 | 2 | 3.00 | 6.00 |
| CE07 | Ethernet switch | KSZ8567 | 1 | 12.00 | 12.00 |
| CE08 | Flash memory | 64MB QSPI | 1 | 10.00 | 10.00 |
| CE09 | eMMC storage | 8GB | 1 | 15.00 | 15.00 |
| CE10 | Secure element | OPTIGA Trust | 1 | 8.00 | 8.00 |
| CE11 | RTC + supercap | PCF2131 | 1 | 5.00 | 5.00 |
| CE12 | Status LEDs + display | OLED 2.4" | 1 set | 25.00 | 25.00 |
| CE13 | PCB Control | 6-layer, 150×100mm | 1 | 45.00 | 45.00 |
| | **Subtotal Control Electronics** | | | | **€238.00** |

### V2G / Grid Interface

| ID | Component | Part Number | Qty | Unit € | Total € |
|----|------------|-------------|-----|--------|---------|
| V2G01 | PLC Modem | HomePlug GP | 1 | 25.00 | 25.00 |
| V2G02 | Crypto IC | OPTIGA SLS32 | 1 | 8.00 | 8.00 |
| V2G03 | RDC-DD Module | DC fault detect | 1 | 45.00 | 45.00 |
| V2G04 | IMD | Bender ISOMETER | 1 | 60.00 | 60.00 |
| V2G05 | Grid relay | Interface protection | 1 | 100.00 | 100.00 |
| V2G06 | CTs (grid measurement) | 0.5% accuracy | 3 | 15.00 | 45.00 |
| V2G07 | Voltage transformers | Isolated | 3 | 20.00 | 60.00 |
| | **Subtotal V2G** | | | | **€343.00** |

### Thermal System

| ID | Component | Part Number | Qty | Unit € | Total € |
|----|------------|-------------|-----|--------|---------|
| TH01 | Coldplate | Al microchannel | 1 | 120.00 | 120.00 |
| TH02 | Pump | Brushless DC, 10L/min | 1 | 35.00 | 35.00 |
| TH03 | Radiator | 300×300×50mm | 1 | 60.00 | 60.00 |
| TH04 | Radiator fans | 140mm PWM ×2 | 2 | 15.00 | 30.00 |
| TH05 | Reservoir | 300mL inline | 1 | 15.00 | 15.00 |
| TH06 | Tubing | Silicone 10mm, 5m | 1 | 20.00 | 20.00 |
| TH07 | Fittings | Push-connect | 10 | 3.00 | 30.00 |
| TH08 | Coolant | PG premix 2L | 1 | 15.00 | 15.00 |
| TH09 | TIM | Phase change | 1 set | 25.00 | 25.00 |
| TH10 | NTC sensors | M3 threaded | 6 | 2.00 | 12.00 |
| TH11 | Flow sensor | Hall effect | 1 | 15.00 | 15.00 |
| TH12 | Level sensor | Capacitive | 1 | 10.00 | 10.00 |
| | **Subtotal Thermal** | | | | **€387.00** |

### Swarm / Communication

| ID | Component | Part Number | Qty | Unit € | Total € |
|----|------------|-------------|-----|--------|---------|
| SW01 | CAN-FD Transceiver (ext) | TJA1443 | 1 | 3.00 | 3.00 |
| SW02 | CAN connectors | M12, 5-pin | 2 | 5.00 | 10.00 |
| SW03 | CAN cable | Shielded TP 5m | 1 | 10.00 | 10.00 |
| SW04 | Termination resistors | 120Ω | 2 | 0.20 | 0.40 |
| SW05 | 4G/LTE modem | Quectel EG25 | 1 | 45.00 | 45.00 |
| SW06 | SIM holder | Nano-SIM | 1 | 2.00 | 2.00 |
| SW07 | Antenna (4G) | External, SMA | 1 | 8.00 | 8.00 |
| SW08 | WiFi module | ESP32-WROOM | 1 | 5.00 | 5.00 |
| | **Subtotal Swarm** | | | | **€83.40** |

### Mechanical & Enclosure

| ID | Component | Part Number | Qty | Unit € | Total € |
|----|------------|-------------|-----|--------|---------|
| MC01 | Enclosure | IP65, 400×300×150 | 1 | 150.00 | 150.00 |
| MC02 | Power PCB | 6-layer, heavy Cu | 1 | 200.00 | 200.00 |
| MC03 | Mounting hardware | Industrial | 1 set | 25.00 | 25.00 |
| MC04 | Cable glands | IP68 | 6 | 5.00 | 30.00 |
| MC05 | Internal wiring | High-temp silicone | 1 set | 40.00 | 40.00 |
| MC06 | Fuses | DC rated | 3 | 10.00 | 30.00 |
| MC07 | DIN rails | 35mm standard | 2 | 5.00 | 10.00 |
| MC08 | Labels, documentation | Industrial | 1 set | 10.00 | 10.00 |
| | **Subtotal Mechanical** | | | | **€495.00** |

### EK30 Total BOM

| Category | Subtotal € |
|------------|------------|
| Power Electronics | 2,850.00 |
| Control Electronics | 238.00 |
| V2G / Grid Interface | 343.00 |
| Thermal System | 387.00 |
| Swarm / Communication | 83.40 |
| Mechanical & Enclosure | 495.00 |
| **TOTAL EK30 BOM** | **€4,396.40** |

---

## 3. Cost Breakdown Analysis

### EK3 Cost Pie Chart

```
EK3 (€809 total)
────────────────

Power Electronics ████████████████████████████████ 67.4% (€545)
Control Electronics ███████ 11.5% (€93)
Thermal ██████ 10.1% (€82)
Connectivity ██ 3.2% (€26)
Mechanical ████ 7.8% (€63)
```

### EK30 Cost Pie Chart

```
EK30 (€4,396 total)
───────────────────

Power Electronics ████████████████████████████████████████ 64.8% (€2,850)
Thermal ████████ 8.8% (€387)
V2G/Grid ███████ 7.8% (€343)
Mechanical ███████ 11.3% (€495)
Control ████ 5.4% (€238)
Swarm ██ 1.9% (€83)
```

### SiC Premium Analysis

```
SiC vs IGBT COST COMPARISON (EK30)
──────────────────────────────────

IGBT alternative:
• IGBT modules: 2 × €120 = €240
• Si diodes: €60
• Larger heatsink (2×): €240
• Lower efficiency penalty: €500/year energy
• TOTAL IGBT: €540 + €500/year

SiC solution:
• SiC modules: 2 × €350 = €700
• No extra diodes (body diode ok)
• Smaller coldplate: €120
• Higher efficiency: baseline
• TOTAL SiC: €820 initial

BREAKEVEN: 0.64 years = 7.7 months

After 3 years:
• IGBT TCO: €540 + 3×€500 = €2,040
• SiC TCO: €820
• SiC SAVINGS: €1,220 (60% lower!)
```

---

## 4. Manufacturing Costs

### Assembly Labor

| Operation | EK3 (min) | EK30 (min) |
|-----------|-----------|------------|
| PCB assembly (SMT) | Outsourced | Outsourced |
| Through-hole assembly | 30 | 45 |
| Mechanical assembly | 20 | 45 |
| Wiring | 15 | 40 |
| Thermal paste application | 10 | 20 |
| Final assembly | 15 | 30 |
| Testing & calibration | 30 | 60 |
| Packaging | 10 | 15 |
| **TOTAL** | **130 min** | **255 min** |

Labor rate: €40/hour

| Product | Assembly time | Labor cost |
|---------|---------------|------------|
| EK3 | 2.17 hours | €87 |
| EK30 | 4.25 hours | €170 |

### Testing Equipment

| Equipment | Cost € | Amortization |
|-----------|--------|--------------|
| Hi-pot tester | 5,000 | 5 years |
| Power analyzer | 8,000 | 5 years |
| Thermal camera | 3,000 | 5 years |
| Load bank 50kW | 15,000 | 7 years |
| Oscilloscope 4ch | 4,000 | 5 years |
| **TOTAL** | **€35,000** | |

Testing cost per unit (1000 units/year):
€35,000 / 5 years / 1000 units = **€7 per unit**

---

## 5. Pricing Strategy

### Cost Buildup

```
EK3 Pricing
───────────
BOM Cost:                €809
Assembly Labor:          €87
Testing:                 €7
Overhead (15%):          €135
──────────────────────────────
Manufacturing cost:      €1,038
Margin (35%):           €363
──────────────────────────────
WHOLESALE PRICE:         €1,400
Retail margin (30%):     €420
──────────────────────────────
RETAIL PRICE:            €1,820 ≈ €1,800
```

```
EK30 Pricing
────────────
BOM Cost:                €4,396
Assembly Labor:          €170
Testing:                 €7
Overhead (15%):          €686
──────────────────────────────
Manufacturing cost:      €5,259
Margin (35%):           €1,841
──────────────────────────────
WHOLESALE PRICE:         €7,100
Retail margin (30%):     €2,130
──────────────────────────────
RETAIL PRICE:            €9,230 ≈ €9,000
```

### Price per kW Comparison

| Product | Power | Price | €/kW |
|---------|-------|-------|------|
| EK3 | 3 kW | €1,800 | €600/kW |
| EK30 | 30 kW | €9,000 | €300/kW |
| EK30 ×5 (150 kW) | 150 kW | €45,000 | €300/kW |

**Scaling benefit**: Larger modules have 50% lower €/kW

### Market Comparison

```
DC FAST CHARGER MARKET (€/kW)
─────────────────────────────

Budget Chinese:        €150-250/kW
  - Basic features
  - 2-year warranty
  - No V2G

Mid-range EU:          €300-400/kW
  - Good features
  - 3-year warranty
  - Limited V2G

Premium:               €400-600/kW
  - Full features
  - 5-year warranty
  - Full V2G

ELEKTROKOMBINACIJA:    €300/kW (EK30)
  - Premium features (SiC, liquid, AI)
  - Premium performance
  - Mid-range price!

Value proposition: Premium performance at mid-range price
```

---

## 6. Volume Pricing

### Component Volume Discounts

| Volume (units) | BOM Discount | Assembly Efficiency | Total Cost Reduction |
|----------------|--------------|---------------------|----------------------|
| 1-10 | 0% | 0% | 0% |
| 11-50 | 5% | 10% | 6% |
| 51-100 | 10% | 15% | 11% |
| 101-500 | 15% | 20% | 16% |
| 501-1000 | 20% | 25% | 21% |
| 1001+ | 25% | 30% | 26% |

### EK30 at Volume

| Volume | Unit Cost | Unit Price | Margin |
|--------|-----------|------------|--------|
| 1-10 | €5,259 | €9,000 | 42% |
| 100 | €4,680 | €8,000 | 42% |
| 500 | €4,417 | €7,500 | 41% |
| 1000 | €4,155 | €7,000 | 41% |

---

## 7. Warranty & Service Costs

### Failure Rate Assumptions

| Component Category | MTBF (hours) | Annual Failure Rate |
|--------------------|--------------|---------------------|
| SiC MOSFETs | 500,000 | 0.2% |
| Capacitors | 200,000 | 0.5% |
| Control electronics | 1,000,000 | 0.1% |
| Cooling system | 100,000 | 1.0% |
| Connectors/wiring | 500,000 | 0.2% |
| **System overall** | | **~2%/year** |

### Warranty Cost Model

```
5-YEAR WARRANTY COST (per unit)
───────────────────────────────

Year 1: 1% failures × €500 avg repair = €5
Year 2: 1.5% failures × €500 = €7.50
Year 3: 2% failures × €600 = €12
Year 4: 2.5% failures × €700 = €17.50
Year 5: 3% failures × €800 = €24
─────────────────────────────────────────
TOTAL WARRANTY RESERVE: €66 per unit (EK30)

As % of price: €66 / €9,000 = 0.73%

This is VERY LOW because:
• SiC has longer life than IGBT
• AI predictive maintenance catches issues early
• Liquid cooling reduces thermal stress
• Premium components = fewer failures
```

---

## 8. Total Cost of Ownership (TCO)

### 10-Year TCO Comparison: EK30 vs Competition

| Factor | ELEKTROKOMBINACIJA | Competition (IGBT) |
|--------|--------------------|--------------------|
| **Purchase price** | €9,000 | €7,500 |
| **Energy loss (10yr)** | €1,500 | €3,000 |
| **Maintenance (10yr)** | €500 | €1,500 |
| **Downtime cost** | €200 | €800 |
| **Replacement parts** | €300 | €1,000 |
| **TOTAL TCO** | **€11,500** | **€13,800** |
| **TCO Savings** | **€2,300 (17%)** | baseline |

### Payback Calculation

```
EFFICIENCY SAVINGS ALONE
────────────────────────

EK30 efficiency: 97%
Competition: 94%
Difference: 3%

At 30 kW × 3000 hours/year:
Energy throughput: 90,000 kWh/year

Energy saved: 90,000 × 3% = 2,700 kWh/year
At €0.15/kWh: €405/year savings

Premium paid: €9,000 - €7,500 = €1,500
Payback: 1,500 / 405 = 3.7 years

After 10 years: €4,050 - €1,500 = €2,550 net savings
(from efficiency alone, not counting maintenance)
```

---

## 9. R&D Investment

### Development Costs (Estimated)

| Phase | Duration | Team | Cost |
|-------|----------|------|------|
| EK3 Design | 4 months | 3 engineers | €80,000 |
| EK3 Prototypes (5) | 2 months | €30,000 materials | €30,000 |
| EK3 Testing | 2 months | 2 engineers | €30,000 |
| EK30 Design | 5 months | 4 engineers | €120,000 |
| EK30 Prototypes (3) | 3 months | €60,000 materials | €60,000 |
| EK30 Testing | 3 months | 3 engineers | €60,000 |
| Certification | 4 months | Ext. labs + internal | €80,000 |
| Software/AI | 6 months | 2 engineers | €80,000 |
| **TOTAL R&D** | **~18 months** | | **€540,000** |

### R&D Recovery

At 500 units/year:
€540,000 / 500 = €1,080 per unit first year

At 1000 units/year (year 2+):
€540,000 / 1500 = €360 per unit (amortized)

---

## 10. Summary

### Key Financials

| Metric | EK3 | EK30 |
|--------|-----|------|
| BOM Cost | €809 | €4,396 |
| Manufacturing Cost | €1,038 | €5,259 |
| Suggested Retail | €1,800 | €9,000 |
| Gross Margin | 42% | 42% |
| €/kW | €600 | €300 |
| Warranty Reserve | €20 | €66 |
| 10-year TCO vs comp | -15% | -17% |

### Value Proposition

```
ELEKTROKOMBINACIJA VALUE
────────────────────────

✓ Premium components (SiC, liquid cooling)
✓ Premium performance (97%+ efficiency)
✓ Premium features (AI, V2G, Swarm)
✓ Mid-range price point (€300/kW)
✓ Lower TCO (-17% over 10 years)
✓ Future-proof (V2G ready, upgradeable)

RESULT: Best value in market segment
```

---

## Reference

Component prices based on:
- Digi-Key, Mouser pricing (Q3 2024)
- Wolfspeed distributor quotes
- Alibaba for volume reference
- Industry reports (Yole, IHS Markit)
