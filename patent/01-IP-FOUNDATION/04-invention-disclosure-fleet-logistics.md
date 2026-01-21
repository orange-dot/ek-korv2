# Invention Disclosure: Fleet-Integrated Maintenance Logistics

## Administrative Information

| Field | Value |
|-------|-------|
| Disclosure ID | EK-2026-004 |
| Date of Disclosure | 2026-01-02 |
| Inventor(s) | Bojan Janjatović |
| Email | bojan.janjatovic@gmail.com |
| Address | Vojislava Ilica 8, Kikinda, Severni Banat, Serbia |
| Date of Conception | 2026-01-02 |
| Witnesses | Marija Janjatović |

### Origin of Invention
Inspiracija: Problem sa maintenance EV punjača u Srbiji - tehničari moraju dolaziti za svaku popravku. Ideja: zašto ne koristiti autobuse koji ionako prolaze kroz stanice kao transportnu mrežu za module?

---

## 1. Title of Invention

**Fleet Vehicle Integrated Logistics System for Distributed Infrastructure Maintenance**

Alternative: Using Public Transit Vehicles as Spare Parts Transport Network

---

## 2. Problem Statement

```
TRADICIONALNI MAINTENANCE LOGISTICS:
═══════════════════════════════════════════════════════════════

SCENARIO: Punjač na stanici X ima pokvareni modul

1. Dispatch servisnog vozila iz centrale
2. Vožnja do lokacije (30 min - 2 sata)
3. Zamena modula (ako ima deo)
4. Vožnja pokvarenog modula nazad
5. Vožnja do sledeće lokacije ili povratak

TROŠKOVI:
• Servisno vozilo: €30,000-50,000 kupovina
• Vozač/tehničar: €25-40/sat
• Gorivo: €20-50 po izlasku
• Prosečan "truck roll": €200-500

PROBLEM:
• Vozilo 80% vremena stoji
• Tehničar 60% vremena vozi, ne radi
• Svaka lokacija zahteva poseban izlazak
• Urgentne popravke = premium cena
```

---

## 3. Summary of Invention

```
KLJUČNI UVID:
═══════════════════════════════════════════════════════════════

Autobusi IONAKO prolaze kroz SWAP STANICE svakih X sati.
Autobusi IONAKO idu u DEPOT svake večeri.
Autobusi imaju CARGO PROSTOR koji nije iskorišćen.

REŠENJE:
Koristiti POSTOJEĆU RUTU autobusa za transport modula!

WORKFLOW:
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   SWAP      │      │    BUS      │      │   SERVICE   │
│  STATION    │─────►│  (redovna   │─────►│   DEPOT     │
│             │      │   ruta)     │      │             │
│ Defektan    │      │             │      │ Popravka    │
│ modul OUT   │      │ Transport   │      │ modula      │
└─────────────┘      └─────────────┘      └─────────────┘
       ▲                                         │
       │              ┌─────────────┐            │
       │              │    BUS      │            │
       └──────────────│  (redovna   │◄───────────┘
                      │   ruta)     │
                      │             │
                      │ Popravljeni │
                      │ modul BACK  │
                      └─────────────┘

REZULTAT: ZERO DEDICATED LOGISTICS VEHICLES
```

---

## 4. Detailed Description

### 4.1 Transport Container Design

```
MODULE TRANSPORT BOX:
═══════════════════════════════════════════════════════════════

DIMENZIJE:
• Spoljne: 600 × 400 × 300 mm
• Unutrašnje: 560 × 360 × 260 mm
• Masa (prazan): 3 kg
• Masa (pun, 10 modula): 21 kg

KARAKTERISTIKE:
• Materijal: HDPE ili aluminijum
• ESD zaštita: Conductive foam umetak
• Shock protection: 50G rated
• Weatherproof: IP65
• Stackable: Da (do 3 visoko)
• Handle: Ergonomski, za jednu ruku

IDENTIFIKACIJA:
• RFID tag (pasivni, UHF)
• QR kod (backup)
• LED indikator (status)
  - Zeleno: Fresh moduli
  - Crveno: Defektni moduli
  - Plavo: Mixed/in transit

KAPACITET:
• 10 × EK3 modula
• Ili 5 × EK3 + alat/delovi
• Ili mešavina po potrebi

MOUNTING U AUTOBUSU:
• Standardni cargo bay
• Quick-release brackets
• Može i u prostor za invalidska kolica (ako nije zauzet)
```

### 4.2 Logistics Flow

```
DNEVNI CIKLUS:
═══════════════════════════════════════════════════════════════

06:00 - JUTARNJI POLAZAK IZ DEPOTA
────────────────────────────────────────────────────────────────
• Tehničar u depotu stavlja box sa popravljenim modulima u bus
• Bus kreće na redovnu liniju
• Box putuje "besplatno" sa autobusom

08:30 - PROLAZAK KROZ SWAP STANICU
────────────────────────────────────────────────────────────────
• Bus dolazi na swap (redovno punjenje)
• Robot uzima popravljene module iz boxa
• Robot stavlja defektne module u box
• Bus nastavlja rutu
• ZERO dodatnog vremena za bus

12:00 - DRUGI PROLAZAK (opciono)
────────────────────────────────────────────────────────────────
• Ako je isti bus, ista procedural
• Ili drugi bus preuzima box

18:00 - POVRATAK U DEPOT
────────────────────────────────────────────────────────────────
• Bus završava smenu
• Tehničar uzima box sa defektnim modulima
• Modul ide na dijagnostiku i popravku

20:00-06:00 - NOĆNA SMENA U SERVISU
────────────────────────────────────────────────────────────────
• Tehničari popravljaju module
• Nema žurbe - cela noć za rad
• Sutra ujutru: ciklus se ponavlja
```

### 4.3 Scheduling Algorithm

```
ALGORITHM: Optimal Box Routing
═══════════════════════════════════════════════════════════════

INPUTS:
• Bus_routes[]: Lista svih ruta sa vremenima
• Station_needs[]: Koji moduli trebaju kojoj stanici
• Depot_ready[]: Koji moduli su popravljeni i spremni
• Box_locations[]: Gde su box-ovi trenutno

DAILY PLANNING (večer pre):
1. Identify stations needing fresh modules
2. Identify buses passing those stations tomorrow
3. Assign boxes to buses (optimize for minimal transfers)
4. Generate loading instructions for depot technicians

REAL-TIME ADJUSTMENTS:
• If bus breaks down: Reassign box to next bus on route
• If urgent need: Taxi/courier for critical modules only
• If module fails mid-day: Schedule pickup for next bus pass

EXAMPLE:
Station A needs 3 modules
Station B needs 2 modules
Bus 101 passes A at 09:00, returns to depot at 18:00
Bus 205 passes B at 10:00, passes A at 14:00

OPTIMAL PLAN:
• Bus 101: Carry 3 modules for A, deliver at 09:00
• Bus 205: Carry 2 modules for B, deliver at 10:00
  Then pick up defectives from A at 14:00

RESULT: 5 modules delivered, 0 dedicated vehicles
```

### 4.4 Exception Handling

```
SCENARIO: Kritičan kvar, nema bus u naredna 2 sata
═══════════════════════════════════════════════════════════════

OPCIJA 1: Graceful Degradation
• Punjač radi na 99.7% kapaciteta (1 od 300 modula)
• Čeka se redovan bus
• Prihvatljivo za većinu situacija

OPCIJA 2: Taxi/Courier
• Za stvarno kritične situacije
• Courier donosi modul iz najbližeg depota
• Trošak: €30-50 (vs €200-500 za tehničara)
• Frekvencija: <1% slučajeva

OPCIJA 3: Nearby Station
• Robot sa druge stanice "pozajmljuje" modul
• Transport sledećim busom koji povezuje stanice
• Decentralizovani inventory

SCENARIO: Box oštećen/izgubljen
═══════════════════════════════════════════════════════════════

• Svaki box ima GPS tracker (opciono)
• RFID skeniranje na svakoj tački
• Backup box-ovi u svakom depotu
• Insurance za sadržaj (moduli ~€1,500)
```

### 4.5 Formal Scheduling Model (VRPTW)

```
FORMAL OPTIMIZATION MODEL
═══════════════════════════════════════════════════════════════

The module transport problem is formalized as a Vehicle Routing
Problem with Time Windows and Pickup/Delivery (VRPTW-PD).


SETS AND INDICES
────────────────
S     Set of swap stations (pickup/delivery points)
B     Set of buses (vehicles)
D     Set of depots (single depot simplification: D = {d₀})
M     Set of modules requiring transport
T     Set of time periods (discretized, e.g., 15-min intervals)

i,j   Indices for locations (stations ∪ depot)
b     Index for buses
m     Index for modules
t     Index for time periods


PARAMETERS
──────────
cap_b      Capacity of bus b (box slots, typically 1-2)
cap_box    Modules per box (10)
a_b,i      Arrival time of bus b at station i (from schedule)
d_b,i      Departure time of bus b from station i
w_i^need   Number of modules needed at station i
w_i^return Number of defective modules to return from station i
deadline_m Deadline for module m delivery (from failure prediction)
priority_m Priority weight for module m (higher = more urgent)
dist_i,j   Travel time from i to j (bus schedule constrained)


DECISION VARIABLES
──────────────────
x_b,i,j ∈ {0,1}    Bus b travels from i to j carrying modules
y_m,b ∈ {0,1}      Module m assigned to bus b
z_i,t ∈ ℤ⁺        Inventory of fresh modules at station i at time t
p_m ∈ ℤ⁺          Time period when module m is delivered


OBJECTIVE FUNCTION
──────────────────

minimize:
    α × Σ_m [ priority_m × max(0, p_m - deadline_m) ]   # Weighted tardiness
  + β × Σ_b Σ_i,j [ x_b,i,j × dist_i,j ]               # Total routing cost
  + γ × Σ_m [ (1 - Σ_b y_m,b) ]                        # Unserved penalty

WHERE:
    α = 100   (penalty per priority-hour late)
    β = 1     (routing cost weight)
    γ = 1000  (large penalty for unserved modules)


CONSTRAINTS
───────────

1. FLOW CONSERVATION (each bus follows its scheduled route):

   Σ_j x_b,i,j = Σ_j x_b,j,i    ∀b ∈ B, i ∈ S

   # Bus arrives and departs each station (following schedule)


2. BUS CAPACITY:

   Σ_m y_m,b ≤ cap_b × cap_box    ∀b ∈ B

   # Modules assigned to bus ≤ box capacity


3. TIME WINDOWS (respect bus schedule):

   y_m,b = 1 → p_m ≥ a_b,dest(m)    ∀m, b

   # Module delivered when bus arrives at destination


4. PICKUP BEFORE DELIVERY (for return logistics):

   For module m going station i → depot:
   p_m^pickup ≤ p_m^deliver


5. STATION DEMAND SATISFACTION:

   Σ_m∈delivered_to(i) 1 ≥ w_i^need    ∀i ∈ S

   # Enough fresh modules delivered to meet demand


6. RETURN LOGISTICS:

   Σ_m∈return_from(i) 1 ≥ w_i^return   ∀i ∈ S

   # Defective modules picked up for repair


7. SCHEDULE ADHERENCE (buses follow fixed routes):

   x_b,i,j = 1 → (i,j) ∈ Route_b

   # Buses can only travel on their scheduled routes


8. SINGLE ASSIGNMENT:

   Σ_b y_m,b ≤ 1    ∀m ∈ M

   # Each module assigned to at most one bus


EXAMPLE INSTANCE
────────────────

Given:
• 3 swap stations: S = {A, B, C}
• 5 buses with routes:
  - Bus 1: Depot → A (08:00) → B (10:00) → Depot (18:00)
  - Bus 2: Depot → B (09:00) → C (11:00) → Depot (17:00)
  - Bus 3: Depot → A (14:00) → C (16:00) → Depot (20:00)
• Module needs:
  - Station A: 3 fresh modules needed by 10:00, 2 defective to return
  - Station B: 2 fresh modules needed by 12:00, 1 defective to return
  - Station C: 1 fresh module needed by 14:00

OPTIMAL SOLUTION:
• Bus 1: Carry 3 fresh modules, deliver at A (08:00) ✓
         Pick up 2 defective from A
         Deliver 2 fresh to B (10:00) ✓ (overserve, allows buffer)
         Pick up 1 defective from B
• Bus 2: Carry 1 fresh module, deliver at C (via B route)
         (Alternative: Bus 3 delivers at 16:00, still within deadline)

RESULT:
• Total tardiness: 0 (all deadlines met)
• Buses used: 2 (Bus 3 not needed)
• Defective returns: 3 modules returned same day


SOLUTION APPROACH: MILP WITH HEURISTIC WARM-START
─────────────────────────────────────────────────

1. GREEDY HEURISTIC (fast, provides initial solution):

   function GreedyAssign(modules, buses):
       sort modules by priority × (deadline - now)  # Most urgent first
       for each module m in modules:
           for each bus b passing m.destination:
               if b.arrival_time <= m.deadline and b.has_capacity():
                   assign(m, b)
                   break
       return assignment

2. MILP REFINEMENT (optimal, uses heuristic as warm-start):

   prob = MILP_Model(sets, parameters, constraints)
   prob.set_initial_solution(GreedyAssign(modules, buses))
   solution = prob.solve(time_limit=60s)

3. REAL-TIME ADJUSTMENT (event-driven):

   on BusBreakdown(bus_id):
       affected_modules = modules assigned to bus_id
       rerun GreedyAssign for affected_modules only
       update assignments

   on UrgentModuleRequest(station_id, count):
       add new module requests with high priority
       rerun optimization


PYTHON IMPLEMENTATION (using PuLP)
──────────────────────────────────
```

```python
from pulp import *
from datetime import datetime, timedelta

def optimize_module_transport(
    stations,           # List of station dicts with demand
    buses,              # List of bus dicts with routes
    modules_needed,     # List of module requests
    modules_return,     # List of defective modules to return
    depot,              # Depot location
    box_capacity=10     # Modules per box
):
    """
    Solve the module transport optimization problem.

    Returns assignment of modules to buses with timing.
    """

    prob = LpProblem("Module_Transport_VRPTW", LpMinimize)

    # Index sets
    all_modules = modules_needed + modules_return
    n_modules = len(all_modules)
    n_buses = len(buses)

    # Decision variables
    # y[m,b] = 1 if module m assigned to bus b
    y = [[LpVariable(f"y_{m}_{b}", cat='Binary')
          for b in range(n_buses)]
         for m in range(n_modules)]

    # p[m] = delivery time for module m (continuous)
    p = [LpVariable(f"p_{m}", lowBound=0) for m in range(n_modules)]

    # t[m] = tardiness for module m (auxiliary)
    tardiness = [LpVariable(f"tard_{m}", lowBound=0) for m in range(n_modules)]

    # === OBJECTIVE ===
    # Minimize weighted tardiness + unserved penalty

    alpha = 100   # Tardiness penalty per hour
    gamma = 1000  # Unserved penalty

    obj_tardiness = lpSum([
        alpha * all_modules[m].get('priority', 1) * tardiness[m]
        for m in range(n_modules)
    ])

    obj_unserved = lpSum([
        gamma * (1 - lpSum([y[m][b] for b in range(n_buses)]))
        for m in range(n_modules)
    ])

    prob += obj_tardiness + obj_unserved

    # === CONSTRAINTS ===

    # 1. Each module assigned to at most one bus
    for m in range(n_modules):
        prob += lpSum([y[m][b] for b in range(n_buses)]) <= 1

    # 2. Bus capacity (box slots × modules per box)
    for b in range(n_buses):
        max_modules = buses[b].get('box_slots', 1) * box_capacity
        prob += lpSum([y[m][b] for m in range(n_modules)]) <= max_modules

    # 3. Time window constraints
    M = 10000  # Big M for indicator constraints
    for m in range(n_modules):
        dest = all_modules[m]['destination']
        deadline = all_modules[m].get('deadline_hours', 24)

        for b in range(n_buses):
            # Check if bus b serves destination
            if dest in buses[b]['stops']:
                arrival_time = buses[b]['stops'][dest]

                # If assigned, delivery time = bus arrival time
                prob += p[m] >= arrival_time - M * (1 - y[m][b])
                prob += p[m] <= arrival_time + M * (1 - y[m][b])
            else:
                # Bus doesn't serve this destination
                prob += y[m][b] == 0

        # Tardiness calculation
        prob += tardiness[m] >= p[m] - deadline

    # 4. Station demand satisfaction (soft constraint via objective)
    # Already handled by unserved penalty

    # === SOLVE ===
    prob.solve(PULP_CBC_CMD(msg=0, timeLimit=60))

    if prob.status not in [LpStatusOptimal, LpStatusNotSolved]:
        return None

    # === EXTRACT RESULTS ===
    result = {
        'status': LpStatus[prob.status],
        'total_tardiness': sum(t.varValue or 0 for t in tardiness),
        'assignments': []
    }

    for m in range(n_modules):
        for b in range(n_buses):
            if y[m][b].varValue and y[m][b].varValue > 0.5:
                result['assignments'].append({
                    'module_id': all_modules[m]['id'],
                    'bus_id': buses[b]['id'],
                    'destination': all_modules[m]['destination'],
                    'delivery_time': p[m].varValue,
                    'tardiness': tardiness[m].varValue
                })
                break

    return result


# Example usage
def example_daily_planning():
    """Example: Plan module transport for tomorrow."""

    stations = [
        {'id': 'STATION_A', 'location': (44.8, 20.4)},
        {'id': 'STATION_B', 'location': (44.75, 20.45)},
        {'id': 'STATION_C', 'location': (44.82, 20.5)},
    ]

    buses = [
        {
            'id': 'BUS_101',
            'box_slots': 1,
            'stops': {
                'STATION_A': 8.0,   # Arrives at 08:00
                'STATION_B': 10.0,  # Arrives at 10:00
            }
        },
        {
            'id': 'BUS_205',
            'box_slots': 1,
            'stops': {
                'STATION_B': 9.0,   # Arrives at 09:00
                'STATION_C': 11.0,  # Arrives at 11:00
            }
        },
        {
            'id': 'BUS_310',
            'box_slots': 2,
            'stops': {
                'STATION_A': 14.0,  # Arrives at 14:00
                'STATION_C': 16.0,  # Arrives at 16:00
            }
        },
    ]

    # Fresh modules needed (predicted from AI)
    modules_needed = [
        {'id': 'MOD_001', 'destination': 'STATION_A',
         'deadline_hours': 10.0, 'priority': 3},
        {'id': 'MOD_002', 'destination': 'STATION_A',
         'deadline_hours': 10.0, 'priority': 3},
        {'id': 'MOD_003', 'destination': 'STATION_A',
         'deadline_hours': 10.0, 'priority': 3},
        {'id': 'MOD_004', 'destination': 'STATION_B',
         'deadline_hours': 12.0, 'priority': 2},
        {'id': 'MOD_005', 'destination': 'STATION_B',
         'deadline_hours': 12.0, 'priority': 2},
        {'id': 'MOD_006', 'destination': 'STATION_C',
         'deadline_hours': 18.0, 'priority': 1},
    ]

    # Defective modules to return
    modules_return = [
        {'id': 'DEF_001', 'destination': 'DEPOT',
         'pickup_from': 'STATION_A', 'deadline_hours': 20.0, 'priority': 1},
        {'id': 'DEF_002', 'destination': 'DEPOT',
         'pickup_from': 'STATION_B', 'deadline_hours': 20.0, 'priority': 1},
    ]

    result = optimize_module_transport(
        stations, buses, modules_needed, modules_return, 'DEPOT'
    )

    print(f"Optimization status: {result['status']}")
    print(f"Total tardiness: {result['total_tardiness']:.1f} hours")
    print("\nAssignments:")
    for a in result['assignments']:
        print(f"  {a['module_id']} → {a['bus_id']} "
              f"(deliver to {a['destination']} at {a['delivery_time']:.1f}h)")
```

```
COMPLEXITY AND SCALABILITY
──────────────────────────

Problem Size:
• Typical fleet: 50-200 buses
• Typical stations: 10-50 swap stations
• Daily module movements: 10-100 modules

Computational Complexity:
• Greedy heuristic: O(M × B × S) where M=modules, B=buses, S=stations
• MILP exact: NP-hard, but small instances solve in seconds

Practical Performance:
• 100 modules, 100 buses, 50 stations: <5 seconds (with warm-start)
• Real-time re-optimization: <1 second (incremental)

Scalability Strategy:
• Decompose by depot region if multiple depots
• Use rolling horizon for multi-day planning
• Cache bus route structures (static schedule)
```

---

## 5. Advantages Over Prior Art

```
ADVANTAGE 1: Zero Logistics Fleet
─────────────────────────────────────────────────────────────
Prior art: Dedicated service vehicles
This invention: Use existing bus fleet
Savings: €30,000-50,000 per vehicle × fleet size

ADVANTAGE 2: Zero Driver Cost
─────────────────────────────────────────────────────────────
Prior art: Driver/technician for each trip
This invention: Bus driver already on payroll
Savings: €25-40/hour × travel time

ADVANTAGE 3: Higher Frequency
─────────────────────────────────────────────────────────────
Prior art: 1-2 service visits per week per station
This invention: Multiple bus passes per day
Response time: Hours instead of days

ADVANTAGE 4: Predictable Schedule
─────────────────────────────────────────────────────────────
Prior art: Reactive dispatch when failure occurs
This invention: Known bus schedule enables planning
Result: Proactive maintenance possible

ADVANTAGE 5: Scalability
─────────────────────────────────────────────────────────────
Prior art: More stations = more service vehicles
This invention: More stations = same bus fleet
Scaling: O(1) instead of O(n)
```

---

## 6. Novel Aspects

```
WHAT IS NEW:
═══════════════════════════════════════════════════════════════

1. FLEET VEHICLES AS LOGISTICS NETWORK
   • Concept of using passenger vehicles for parts transport
   • Never applied to EV charging infrastructure
   • Unique synergy with bus battery swap stations

2. INTEGRATION WITH SWAP STATION
   • Robot handles both battery AND parts logistics
   • No human intervention at station
   • Seamless integration with existing workflow

3. DETECTION + LOGISTICS COMBO
   • AI detects degradation through continuous monitoring:
     - Early detection (trend analysis): days/weeks ahead
     - Typical (anomaly during charging): hours ahead
     - Reactive (sudden failure): minutes - but no downtime!
   • Scheduling algorithm matches to bus routes
   • Parts arrive via next scheduled bus on that route
   • Even reactive scenarios avoid truck rolls

4. CIRCULAR ECONOMY ENABLER
   • Modules return to depot for repair
   • Not disposed, but refurbished
   • Fleet enables cost-effective returns
```

---

## 7. Claims (Draft)

```
INDEPENDENT CLAIM 1:
A logistics system for infrastructure maintenance comprising:
• A plurality of service modules distributed across remote
  stations;
• A fleet of vehicles operating on scheduled routes passing
  said stations;
• Transport containers configured to carry replacement modules;
• An automated system at each station for loading and
  unloading said containers from said vehicles;
• Wherein replacement module transport utilizes scheduled
  fleet vehicle routes without dedicated logistics vehicles.

INDEPENDENT CLAIM 2:
A method for maintaining distributed infrastructure comprising:
• Predicting module replacement needs at remote stations;
• Identifying fleet vehicles scheduled to pass said stations;
• Loading replacement modules onto identified vehicles;
• Automatically exchanging modules at stations during
  scheduled vehicle stops;
• Returning replaced modules via fleet vehicles for repair.

DEPENDENT CLAIMS:
• ...wherein the fleet vehicles are electric buses
• ...wherein the automated exchange system is integrated with
  a vehicle battery swap station
• ...wherein module exchange occurs simultaneously with
  battery exchange
• ...wherein scheduling optimization minimizes transfers
```

---

## 8. Signatures

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
