# Invention Disclosure: Distributed Power Sparing System

## Administrative Information

| Field | Value |
|-------|-------|
| Disclosure ID | EK-2026-003 |
| Date of Disclosure | 2026-01-02 |
| Inventor(s) | Bojan Janjatović |
| Email | bojan.janjatovic@gmail.com |
| Address | Vojislava Ilica 8, Kikinda, Severni Banat, Serbia |
| Date of Conception | 2026-01-02 |
| Witnesses | Marija Janjatović |

### Origin of Invention
Inspiracija iz 3PAR storage arhitekture - primena dokazanih koncepata (chunklets, wide striping, distributed sparing) na power electronics. Nova primena postojećih principa u drugom tehničkom domenu.

---

## 1. Title of Invention

**Distributed Spare Capacity Management for Modular Power Systems Using Storage-Derived Load Distribution Algorithms**

Alternative: Application of Data Storage Reliability Principles to Power Electronics

---

## 2. Problem Statement

```
TRADICIONALNI PRISTUP - HOT SPARE:
═══════════════════════════════════════════════════════════════
• Dedicirani rezervni moduli koji čekaju kvar
• Spare sedi neaktivan 99% vremena
• Nije testiran u produkciji - možda i on ne radi
• Posle jednog kvara - nema više rezerve
• Neravnomerno starenje (aktivni moduli stare brže)

REZULTAT:
• Loša iskorišćenost opreme
• Nepredvidivi kvarovi spare modula
• Cliff-edge failure mode
```

---

## 3. Summary of Invention

```
INSPIRACIJA: 3PAR Storage Architecture (HP, 2002)
═══════════════════════════════════════════════════════════════

3PAR je revolucionisao storage industriju primenom:
• Chunklets (mali blokovi umesto celih diskova)
• Wide striping (podaci preko SVIH diskova)
• Distributed sparing (nema dedicated spare)
• Thin provisioning (alociraj tek kad treba)

MI PRIMENJUJEMO ISTU LOGIKU NA POWER ELECTRONICS:
• EK3 modul = "chunklet" snage (3 kW)
• Wide striping = load preko SVIH modula
• Distributed sparing = rezerva u svakom modulu
• Thin provisioning = sleep mode za neaktivne
```

### Core Concept

```
UMESTO:
┌─────┬─────┬─────┬─────┬─────┬─────┐
│100% │100% │100% │100% │100% │ 0%  │ ← Spare ne radi
└─────┴─────┴─────┴─────┴─────┴─────┘

NAŠE REŠENJE:
┌─────┬─────┬─────┬─────┬─────┬─────┐
│ 83% │ 83% │ 83% │ 83% │ 83% │ 83% │ ← Svi rade, svi imaju rezervu
└─────┴─────┴─────┴─────┴─────┴─────┘

KADA JEDAN OTKAŽE:
┌─────┬─────┬─────┬─────┬─────┐
│100% │100% │100% │100% │100% │ ← Preostali preuzimaju
└─────┴─────┴─────┴─────┴─────┘

JOŠ UVEK 100% KAPACITETA!
```

---

## 4. Detailed Description

### 4.1 Wide Striping for Power

```
PROBLEM SA KONCENTRISANIM LOADOM:
═══════════════════════════════════════════════════════════════

Sistem od 10 modula, potrebno 50% snage:

TRADICIONALNO:
Modul:  1    2    3    4    5    6    7    8    9   10
Load:  100% 100% 100% 100% 100%  0%   0%   0%   0%   0%

• Moduli 1-5 rade na 100%, stare brže
• Moduli 6-10 ne rade uopšte
• Za 5 godina: 1-5 pred kraj života, 6-10 kao novi
• Termalni stres koncentrisan

WIDE STRIPING:
Modul:  1    2    3    4    5    6    7    8    9   10
Load:  50%  50%  50%  50%  50%  50%  50%  50%  50%  50%

• Svi moduli rade podjednako
• Ravnomerno starenje
• Niža temperatura (manji load po modulu)
• Predvidljiviji maintenance
• Duži životni vek sistema
```

### 4.2 Distributed Sparing Algorithm

```
ALGORITHM: Dynamic Capacity Allocation
═══════════════════════════════════════════════════════════════

INPUTS:
• N = broj aktivnih modula
• P_total = ukupna potrebna snaga
• P_module = nominalna snaga modula (3 kW)
• R = željena rezerva (npr. 10%)

CALCULATE:
• P_available = N × P_module
• Load_factor = P_total / P_available
• If Load_factor > (1 - R):
    Activate sleeping modules
• Else:
    Distribute P_total evenly across all N modules

EXAMPLE:
N = 10, P_total = 27 kW, P_module = 3 kW, R = 10%
P_available = 30 kW
Load_factor = 27/30 = 90%
Target: 90% each module = 2.7 kW per module

FAILURE RESPONSE:
When module fails:
• N_new = N - 1 = 9
• P_available_new = 27 kW
• Load_factor_new = 27/27 = 100%
• Each remaining module: 3 kW

System continues at FULL CAPACITY!
```

### 4.3 Thin Provisioning for Power

```
CONCEPT: Sleep Mode for Unused Modules
═══════════════════════════════════════════════════════════════

SCENARIO: 350 kW punjač, trenutno treba 50 kW

TRADICIONALNO:
• Sve komponente dimenzionisane za 350 kW
• Svi power stage-ovi aktivni
• Efikasnost pada pri malom loadu (switching losses)

THIN PROVISIONING:
• 117 modula instalirana (351 kW potencijal)
• Pri 50 kW: 17 modula aktivno @ 100%
• Ostalih 100 modula u SLEEP MODE:
  - PWM isključen
  - Samo monitoring aktivan
  - Potrošnja: <1W po modulu

PREDNOSTI:
• Svaki aktivan modul radi na optimalnom loadu
• Minimalna standby potrošnja
• Instant wake-up kad treba više snage (<10ms)
• Ravnomerna rotacija aktivnih modula
```

### 4.4 Module Rotation Algorithm

```
ALGORITHM: Wear Leveling
═══════════════════════════════════════════════════════════════

CILJ: Ravnomerno starenje svih modula

TRACKING (per module):
• Operating_hours: Ukupno vreme rada
• Thermal_cycles: Broj on/off ciklusa
• Peak_loads: Broj epizoda na >90% load
• Health_score: AI-estimated remaining life

ROTATION LOGIC:
Every T minutes (e.g., T=60):
1. Sort modules by Operating_hours (ascending)
2. If load < 80% of active modules:
   • Sleep highest-hours module
   • Wake lowest-hours sleeping module
3. Result: Natural wear leveling

EXAMPLE:
Hour 0:  Active = [M1, M2, M3], Sleep = [M4, M5, M6]
Hour 1:  Active = [M4, M2, M3], Sleep = [M1, M5, M6]  # M1↔M4
Hour 2:  Active = [M4, M5, M3], Sleep = [M1, M2, M6]  # M2↔M5
...

After 1 year: All modules have ~equal operating hours
```

---

## 5. Advantages Over Prior Art

```
ADVANTAGE 1: No Idle Equipment
─────────────────────────────────────────────────────────────
Prior art: 10-20% of equipment sits idle as hot spare
This invention: All equipment actively used
Utilization improvement: 10-20%

ADVANTAGE 2: Continuous Testing
─────────────────────────────────────────────────────────────
Prior art: Spare modules untested until needed
This invention: All modules continuously tested in production
Failure detection: Proactive vs reactive

ADVANTAGE 3: Graceful Degradation
─────────────────────────────────────────────────────────────
Prior art: Spare exhausted = cliff-edge failure
This invention: Gradual capacity reduction
Failure mode: Graceful vs catastrophic

ADVANTAGE 4: Uniform Aging
─────────────────────────────────────────────────────────────
Prior art: Active modules age faster than spares
This invention: All modules age equally
Maintenance: Predictable batch replacement

ADVANTAGE 5: Optimal Efficiency
─────────────────────────────────────────────────────────────
Prior art: All modules active even at low load
This invention: Only needed modules active
Efficiency at low load: +5-10%
```

---

## 6. Novel Aspects

```
WHAT IS NEW:
═══════════════════════════════════════════════════════════════

1. APPLICATION OF STORAGE CONCEPTS TO POWER
   • 3PAR concepts (chunklets, wide striping, distributed
     sparing) have NEVER been applied to power electronics
   • This is a new technical field for these algorithms

2. WEAR LEVELING FOR POWER MODULES
   • Concept exists for flash storage (SSD)
   • Never applied to power converter modules
   • Our implementation considers thermal and electrical stress

3. THIN PROVISIONING FOR REAL-TIME POWER
   • Storage thin provisioning is for capacity allocation
   • Power thin provisioning requires <10ms response time
   • Different technical challenges (instant wake-up)

4. COMBINED APPROACH
   • No prior art combines all four concepts:
     - Wide striping
     - Distributed sparing
     - Thin provisioning
     - Wear leveling
   • Synergy between concepts is novel
```

---

## 7. Claims (Draft)

```
INDEPENDENT CLAIM 1:
A power distribution system comprising:
• A plurality of modular power units connected in parallel;
• A control system distributing electrical load across
  substantially all of said power units simultaneously;
• Wherein spare capacity is distributed across all units
  rather than provided by dedicated spare units;
• Wherein the control system dynamically adjusts individual
  unit loading to maintain uniform operating hours.

INDEPENDENT CLAIM 2:
A method for managing spare capacity in a modular power
system comprising:
• Operating all modules at less than rated capacity such
  that aggregate spare capacity equals a predetermined
  reserve margin;
• Upon failure of one module, increasing loading of
  remaining modules to maintain total system output;
• Rotating module activation to equalize operating hours.

DEPENDENT CLAIMS:
• ...wherein spare capacity is 10-20% of total rated capacity
• ...wherein load distribution algorithm is derived from
  data storage wide-striping techniques
• ...wherein inactive modules enter low-power sleep mode
• ...wherein module rotation occurs at intervals of 30-120 min
```

---

## 8. References

```
3PAR STORAGE ARCHITECTURE:
• US Patent 7,107,389 - "Sparse chunklet allocation"
• US Patent 7,146,521 - "Wide striping for data storage"
• HPE Primera Technical White Papers

WEAR LEVELING (Flash Storage):
• Various SSD manufacturer patents
• Concept well-established for NAND flash

DISTINCTION:
Our invention applies these concepts to POWER ELECTRONICS,
which is a different technical field with different
challenges (real-time response, thermal management,
electrical stress vs bit errors).
```

---

## 9. Signatures

```
INVENTOR(S):

Name: _________________________
Signature: ____________________
Date: ________________________

WITNESS:

Name: _________________________
Signature: ____________________
Date: ________________________
```
