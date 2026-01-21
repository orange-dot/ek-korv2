# Stochastic Fleet Logistics: Simulation Scenarios

> **Topic:** Fleet Simulation and Benchmark Scenarios
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document defines simulation scenarios, fleet configurations, and validation methodology for stochastic fleet logistics algorithms.

---

## 2. Fleet Configurations

### 2.1 Small Fleet

```
CONFIGURATION: FLEET-S20
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Stations: 3 + 1 depot
• Depot: Central location, unlimited spares
• Station 1: 8 buses, 5 spare modules
• Station 2: 7 buses, 4 spare modules
• Station 3: 5 buses, 3 spare modules

Total: 20 buses, ~300 modules

Vehicles: 2 maintenance vans
• Capacity: 10 modules each
• Speed: 40 km/h average

Geography:
────────────────────────────────────────────
        [Depot]
           │ 15 km
    ┌──────┴──────┐
    │             │
[S1] ←── 10 km ──→ [S2]
    │             │
    └──────┬──────┘
           │ 12 km
         [S3]

Travel times (minutes):
• Depot ↔ S1: 22 min
• Depot ↔ S2: 22 min
• Depot ↔ S3: 27 min
• S1 ↔ S2: 15 min
• S1 ↔ S3: 20 min
• S2 ↔ S3: 18 min
```

### 2.2 Medium Fleet

```
CONFIGURATION: FLEET-M50
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Stations: 8 + 1 depot
Total: 50 buses, ~750 modules

Vehicles: 4 maintenance vans

Station distribution:
────────────────────────────────────────────
Station | Buses | Spares | Distance to Depot
────────┼───────┼────────┼──────────────────
S1      | 10    | 8      | 15 km
S2      | 8     | 6      | 18 km
S3      | 7     | 5      | 22 km
S4      | 6     | 5      | 12 km
S5      | 6     | 4      | 25 km
S6      | 5     | 4      | 20 km
S7      | 4     | 3      | 28 km
S8      | 4     | 3      | 30 km

Geography: Urban area ~40 km diameter
```

### 2.3 Large Fleet

```
CONFIGURATION: FLEET-L100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Stations: 15 + 1 depot
Total: 100 buses, ~1500 modules

Vehicles: 8 maintenance vans + 2 emergency vehicles

Hierarchical structure:
────────────────────────────────────────────
• Central depot: Main spare inventory
• 3 regional hubs: Secondary inventory
• 15 charging stations: Minimal buffer stock

Use case: Metropolitan bus network
```

---

## 3. Demand Scenarios

### 3.1 Demand Generation

```
DEMAND GENERATION MODEL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def generate_daily_demand(fleet, date, params):
    """
    Generate demand for one day.
    """
    demands = []

    # 1. Planned demand (from RUL predictions)
    for bus in fleet.buses:
        for module in bus.modules:
            if module.RUL < params.replacement_threshold:
                # Schedule replacement
                time_window = get_availability(bus, date)
                demands.append(PlannedDemand(
                    module=module,
                    bus=bus,
                    time_window=time_window,
                    priority='planned'
                ))

    # 2. Random failures (Poisson process)
    n_failures = np.random.poisson(params.lambda_ * fleet.n_modules)
    for _ in range(n_failures):
        # Random module (excluding already flagged)
        module = random.choice(fleet.healthy_modules)
        # Random time during day
        failure_time = random.uniform(0, 24)
        # Urgent time window
        time_window = (failure_time, failure_time + params.max_response)
        demands.append(RandomDemand(
            module=module,
            bus=module.bus,
            time_window=time_window,
            priority='urgent'
        ))

    return demands

DEMAND SCENARIOS:
────────────────────────────────────────────

SC-DEM-LOW: Light maintenance day
• Planned: 2-3 per station
• Random: 1-2 total
• Total: ~20 demands

SC-DEM-TYPICAL: Normal day
• Planned: 4-5 per station
• Random: 3-5 total
• Total: ~40 demands

SC-DEM-HIGH: Heavy maintenance day
• Planned: 6-8 per station
• Random: 5-8 total
• Total: ~60 demands

SC-DEM-SPIKE: Failure cluster
• Normal planned demands
• Correlated failures (e.g., heat wave, bad batch)
• Random: 15-20 total
• Total: ~70 demands
```

### 3.2 Time Window Scenarios

```
TIME WINDOW SCENARIOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bus Schedule Model:
────────────────────────────────────────────
Each bus has schedule: [(depart, return), ...]

Typical patterns:
• Early shift: depart 5:00, return 14:00
• Late shift: depart 13:00, return 22:00
• Split shift: 5:00-10:00, 15:00-20:00
• Night charge: 23:00-5:00 (long window)

Time window for service:
────────────────────────────────────────────
TW = [arrival_time + buffer, departure_time - service_duration]

• buffer = 15 min (safety margin)
• service_duration = 30 min (typical)

SC-TW-WIDE: Flexible scheduling
• Average window: 4 hours
• 80% of demands have > 2 hour window

SC-TW-TIGHT: Constrained scheduling
• Average window: 1.5 hours
• 30% of demands have < 1 hour window

SC-TW-MIXED: Realistic mix
• Day demands: wide windows
• Night demands: narrow windows
```

---

## 4. Simulation Scenarios

### 4.1 Scenario Definitions

```
SCENARIO: SC-FLEET-BASIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fleet: FLEET-S20
Duration: 1 day
Demand: SC-DEM-TYPICAL
Time windows: SC-TW-WIDE
Uncertainty: None (deterministic)
Purpose: Basic algorithm validation

SCENARIO: SC-FLEET-STOCHASTIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fleet: FLEET-S20
Duration: 1 day
Demand: Stochastic (λ = 0.001)
Time windows: SC-TW-MIXED
Uncertainty: Poisson failures + travel time variance
Purpose: Stochastic algorithm evaluation

SCENARIO: SC-FLEET-ROLLING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fleet: FLEET-M50
Duration: 1 week
Demand: Dynamic (revealed over time)
Time windows: SC-TW-MIXED
Uncertainty: Full stochastic
Purpose: Rolling horizon evaluation

SCENARIO: SC-FLEET-SCALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fleet: FLEET-L100
Duration: 1 day
Demand: SC-DEM-HIGH
Time windows: SC-TW-TIGHT
Uncertainty: Moderate
Purpose: Scalability testing

SCENARIO: SC-FLEET-STRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fleet: FLEET-M50
Duration: 1 day
Demand: SC-DEM-SPIKE
Time windows: SC-TW-TIGHT
Uncertainty: High (σ_travel = 0.4)
Purpose: Stress testing robustness
```

### 4.2 Uncertainty Levels

```
UNCERTAINTY CONFIGURATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UC-LOW: Low uncertainty
────────────────────────────────────────────
• RUL σ: 0.10 (10% error)
• Travel σ: 0.15 (15% variability)
• Random failures: λ = 0.0005
• Bus schedule deviation: ±10 min

UC-MODERATE: Moderate uncertainty
────────────────────────────────────────────
• RUL σ: 0.15 (15% error)
• Travel σ: 0.25 (25% variability)
• Random failures: λ = 0.001
• Bus schedule deviation: ±20 min

UC-HIGH: High uncertainty
────────────────────────────────────────────
• RUL σ: 0.25 (25% error)
• Travel σ: 0.40 (40% variability)
• Random failures: λ = 0.002
• Bus schedule deviation: ±45 min
```

---

## 5. Performance Metrics

### 5.1 Service Metrics

```
SERVICE METRICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. SERVICE LEVEL
   Definition: Fraction of demands served within time window
   Formula: SL = |served_on_time| / |total_demands|
   Target: > 95%

2. AVERAGE TARDINESS
   Definition: Mean delay for late services
   Formula: AT = (1/n) Σᵢ max(0, t_service(i) - t_deadline(i))
   Target: < 15 min average

3. MAXIMUM TARDINESS
   Definition: Worst-case delay
   Target: < 2 hours

4. UNSERVED RATE
   Definition: Fraction of demands not served
   Formula: UR = |unserved| / |total_demands|
   Target: < 1%

5. RESPONSE TIME (for urgent)
   Definition: Time from failure report to service
   Target: < 2 hours for 95% of urgent demands
```

### 5.2 Efficiency Metrics

```
EFFICIENCY METRICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. TOTAL DISTANCE
   Definition: Sum of vehicle travel distances
   Formula: D = Σᵥ Σᵢⱼ d_ij × x_ijv
   Benchmark: vs. optimal TSP

7. VEHICLE UTILIZATION
   Definition: Time vehicles are working / total time
   Formula: U = Σᵥ (travel_time + service_time) / (|V| × horizon)
   Target: > 70%

8. ROUTE EFFICIENCY
   Definition: Ratio to optimal
   Formula: RE = optimal_cost / actual_cost
   Target: > 90%

9. EMPTY TRAVEL
   Definition: Distance without cargo
   Target: < 20% of total distance
```

### 5.3 Inventory Metrics

```
INVENTORY METRICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

10. AVERAGE INVENTORY
    Definition: Mean spare modules per station
    Formula: I̅ = (1/T) ∫₀ᵀ Σₛ I_s(t) dt
    Target: Minimize subject to service level

11. STOCKOUT RATE
    Definition: Fraction of time with zero spares
    Formula: SO = (1/|S|) Σₛ |{t : I_s(t) = 0}| / T
    Target: < 5%

12. INVENTORY TURNOVER
    Definition: Annual uses / average inventory
    Formula: TO = annual_replacements / average_inventory
    Target: > 12 (monthly turnover)

13. FILL RATE
    Definition: Fraction served from local stock
    Formula: FR = |served_from_local| / |total_served|
    Target: > 80%
```

---

## 6. Simulation Implementation

### 6.1 Discrete Event Simulation

```
DISCRETE EVENT SIMULATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EVENT TYPES:
────────────────────────────────────────────
• DEMAND_ARRIVAL: New maintenance request
• VEHICLE_DEPART: Vehicle leaves location
• VEHICLE_ARRIVE: Vehicle reaches destination
• SERVICE_START: Begin module replacement
• SERVICE_END: Complete module replacement
• BUS_ARRIVE: Bus returns to station
• BUS_DEPART: Bus leaves for route
• REPLAN: Trigger re-optimization

EVENT LOOP:
────────────────────────────────────────────
def simulate(scenario, algorithm):
    event_queue = PriorityQueue()
    state = initialize_state(scenario)

    # Schedule initial events
    schedule_initial_events(event_queue, scenario)

    # Main loop
    while event_queue:
        event = event_queue.pop()
        state.time = event.time

        if event.type == DEMAND_ARRIVAL:
            handle_demand_arrival(event, state, event_queue)
        elif event.type == VEHICLE_ARRIVE:
            handle_vehicle_arrival(event, state, event_queue)
        elif event.type == SERVICE_END:
            handle_service_end(event, state, event_queue)
        elif event.type == REPLAN:
            new_plan = algorithm.replan(state)
            update_routes(state, new_plan, event_queue)
        # ... other events

    return compute_metrics(state)
```

### 6.2 State Management

```python
STATE REPRESENTATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class FleetState:
    def __init__(self, scenario):
        self.time = 0
        self.stations = {s: StationState(s) for s in scenario.stations}
        self.vehicles = {v: VehicleState(v) for v in scenario.vehicles}
        self.buses = {b: BusState(b) for b in scenario.buses}
        self.demands = DemandManager()

class VehicleState:
    def __init__(self, vehicle):
        self.id = vehicle.id
        self.location = vehicle.start_location
        self.status = 'idle'  # idle, traveling, serving
        self.load = []  # modules carried
        self.route = []  # planned route
        self.current_task = None

class StationState:
    def __init__(self, station):
        self.id = station.id
        self.spares = station.initial_spares
        self.pending_demands = []
        self.buses_present = []

class DemandManager:
    def __init__(self):
        self.pending = []
        self.assigned = {}
        self.served = []
        self.unserved = []

    def add_demand(self, demand):
        self.pending.append(demand)

    def assign(self, demand, vehicle):
        self.pending.remove(demand)
        self.assigned[demand] = vehicle

    def complete(self, demand, time):
        del self.assigned[demand]
        demand.completion_time = time
        self.served.append(demand)
```

---

## 7. Expected Results

### 7.1 Algorithm Benchmarks

```
EXPECTED PERFORMANCE (SC-FLEET-STOCHASTIC):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Algorithm       | Service Level | Distance | Comp. Time
────────────────┼───────────────┼──────────┼────────────
MILP (det)      | 98%           | Optimal  | 30 min
SAA (20 scen)   | 96%           | +5%      | 15 min
ALNS            | 95%           | +8%      | 2 min
Rolling Horizon | 94%           | +12%     | 5 sec/iter
Robust Insert   | 92%           | +15%     | 0.1 sec
```

### 7.2 Value of Stochastic Solution

```
VSS ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Uncertainty Level | VSS (% cost reduction)
──────────────────┼────────────────────────
UC-LOW            | 3-5%
UC-MODERATE       | 8-12%
UC-HIGH           | 15-25%

Interpretation:
• Low uncertainty: Deterministic solution nearly optimal
• High uncertainty: Stochastic approach essential
```

---

## 8. Validation Criteria

```
VALIDATION CHECKLIST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Route Feasibility:
□ All routes start and end at depot
□ Vehicle capacity never exceeded
□ Travel times consistent with distances
□ Service times respected

Time Feasibility:
□ Arrivals within time windows
□ Precedence constraints (pickup before delivery)
□ No time travel (arrivals monotonic)

Demand Coverage:
□ All demands either served or marked unserved
□ No double-serving of demands
□ Pickup-delivery pairs on same vehicle

Inventory:
□ Non-negative inventory at all times
□ Inventory balance equations hold
□ Spare usage matches service events
```

---

## Related Documents

- `01-problem-formulation.md` - Problem definition
- `02-stochastic-analysis.md` - Uncertainty modeling
- `03-algorithms.md` - Solution algorithms
- `05-literature.md` - Simulation references
