# ROJ: Distributed Intelligence for Multi-Module Systems

## What is ROJ?

**ROJ** (Serbian for "swarm" - as in bee swarm) is Elektrokombinacija's distributed intelligence system. Like JEZGRO (kernel) names our microkernel OS, ROJ names our swarm coordination layer.

The name reflects:
- **Distributed nature**: Like bees in a swarm, each module is autonomous
- **Collective intelligence**: Simple rules create complex, optimal behavior
- **Serbian origin**: Consistent with JEZGRO branding

## Philosophy: Distributed Intelligence

```
CENTRALIZED SYSTEM              ELEKTROKOMBINACIJA ROJ
────────────────────────────────────────────────────────────
Single controller              →    Each module = brain
Single point of failure       →    No single point
Hierarchical control          →    Peer-to-peer
Scalability limit             →    Plug & play
Manual load balancing         →    Autonomous optimization
Scheduled maintenance         →    Self-healing
```

---

## 1. ROJ Architecture

### Concept

```
TRADITIONAL                     ROJ INTELLIGENCE
─────────────────────────────────────────────────────────────

    ┌─────────────┐                 ┌─────┐
    │   MASTER    │                 │ M1  │←───→ Peer
    │ CONTROLLER  │                 └──┬──┘       │
    └──────┬──────┘                    │          │
           │                        ┌──┴──┐    ┌──┴──┐
    ┌──────┼──────┐                 │ M2  │←───│ M3  │
    ▼      ▼      ▼                 └──┬──┘    └──┬──┘
 ┌────┐ ┌────┐ ┌────┐                  │          │
 │ M1 │ │ M2 │ │ M3 │               ┌──┴──┐    ┌──┴──┐
 └────┘ └────┘ └────┘               │ M4  │←───│ M5  │
   ↑       ↑       ↑                └─────┘    └─────┘
   │       │       │
  DUMB   DUMB    DUMB              EACH MODULE:
                                    • Has full AI
                                    • Can operate standalone
                                    • Communicates with peers
                                    • Self-optimizes
                                    • Self-heals
```

### ROJ Topology

```
FULLY CONNECTED MESH
────────────────────

        M1───────────M2
        /│╲         ╱│╲
       / │ ╲       ╱ │ ╲
      /  │  ╲     ╱  │  ╲
     /   │   ╲   ╱   │   ╲
    M6   │    ╲ ╱    │    M3
     ╲   │     ╳     │   ╱
      ╲  │    ╱ ╲    │  ╱
       ╲ │   ╱   ╲   │ ╱
        ╲│  ╱     ╲  │╱
        M5─────────M4

Each module communicates with ALL others
• Redundant paths
• No single point of failure
• O(n²) connections

For large systems (>10 modules):
Use hierarchical mesh or spanning tree
to reduce communication overhead
```

### Module Roles

```
ROLE ASSIGNMENT (Dynamic)
─────────────────────────

LEADER (elected):
• Aggregates system state
• Interfaces with external systems
• Coordinates major decisions
• Any module can become leader

FOLLOWER:
• Local optimization
• Reports status to peers
• Executes ROJ decisions
• Can promote to leader if needed

STANDBY:
• Reduced power state
• Monitors for activation need
• Hot spare capability

Election algorithm: Modified Raft consensus
• Leader election in <100ms
• Automatic failover
• No manual intervention
```

---

## 2. Communication Protocol

### CAN-FD Bus

```
WHY CAN-FD?
───────────
• Industrial standard
• Proven reliability
• Up to 8 Mbps data rate
• Error detection built-in
• Automotive heritage

CAN-FD vs CAN 2.0:
• Data payload: 64 bytes (vs 8 bytes)
• Bit rate: 8 Mbps (vs 1 Mbps)
• Compatible with CAN infrastructure

ELEKTROKOMBINACIJA CAN-FD Network:
──────────────────────────────────
Bit rate: 5 Mbps (data phase)
         1 Mbps (arbitration phase)
Payload: 64 bytes per frame
Latency: <1ms per message
Topology: Linear bus with termination
```

### Message Types

```
MESSAGE STRUCTURE (CAN-FD)
──────────────────────────

┌────────┬────────┬────────────────────────────────────┐
│ ID     │ Length │ Payload (up to 64 bytes)           │
│(11/29b)│ (4b)   │                                    │
└────────┴────────┴────────────────────────────────────┘

MESSAGE TYPES:

1. HEARTBEAT (1 Hz, broadcast)
   ID: 0x100 + module_id
   Payload: [status, Tj, power, SoC_estimate, fault_code]
   Purpose: Presence detection, basic status

2. POWER_COMMAND (on demand)
   ID: 0x200 + target_module
   Payload: [power_target, ramp_rate, priority]
   Purpose: Power redistribution

3. SYNC (100 Hz, broadcast)
   ID: 0x050
   Payload: [timestamp, grid_frequency, grid_voltage]
   Purpose: Time sync, grid state sharing

4. THERMAL_SHARE (10 Hz, broadcast)
   ID: 0x300 + module_id
   Payload: [Tj_all_devices, coolant_temp, fan_speed]
   Purpose: Thermal coordination

5. FAULT_ALERT (event-driven)
   ID: 0x7FF (highest priority)
   Payload: [source_module, fault_type, timestamp, data]
   Purpose: Immediate fault notification

6. ELECTION (event-driven)
   ID: 0x010
   Payload: [candidate_id, term, log_index, last_term]
   Purpose: Leader election (Raft)
```

### Protocol Stack

```
┌─────────────────────────────────────────────────────────┐
│              ROJ APPLICATION LAYER                       │
│  • Load balancing                                       │
│  • Thermal coordination                                 │
│  • Fault handling                                       │
│  • Leader election                                      │
├─────────────────────────────────────────────────────────┤
│              ROJ TRANSPORT LAYER                         │
│  • Message serialization                                │
│  • Acknowledgment handling                              │
│  • Retry logic                                          │
├─────────────────────────────────────────────────────────┤
│              CAN-FD DRIVER                              │
│  • Frame construction                                   │
│  • Arbitration                                          │
│  • Error handling                                       │
├─────────────────────────────────────────────────────────┤
│              CAN-FD HARDWARE                            │
│  • Transceiver                                          │
│  • Controller (integrated in MCU)                       │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Distributed Load Balancing

### Droop Control

```
DROOP-BASED POWER SHARING
─────────────────────────

Each module implements droop:

P_out = P_rated × (V_ref - V_actual) / ΔV_droop

Where:
• P_rated: Module rated power (30 kW)
• V_ref: Reference DC bus voltage
• V_actual: Measured DC bus voltage
• ΔV_droop: Droop coefficient (2-5%)

Effect:
• Higher bus voltage → Higher power output
• Lower bus voltage → Lower power output
• Natural self-balancing without communication

       P_out
         ↑
P_rated ─┼─────╮
         │      ╲
         │       ╲
         │        ╲
         │         ╲
       0 └──────────╲──────→ V_bus
               V_min  V_ref
```

### AI-Enhanced Load Balancing

```
BEYOND DROOP: AI OPTIMIZATION
─────────────────────────────

Droop is baseline, AI adds:

1. THERMAL AWARENESS
   • Hot module: reduce power share
   • Cold module: increase power share
   • Objective: Equalize junction temperatures

2. EFFICIENCY OPTIMIZATION
   • Each module has efficiency curve
   • AI finds optimal power distribution
   • Maximize system efficiency, not module efficiency

3. LIFETIME BALANCING
   • Track operating hours per module
   • Balance wear across fleet
   • Predict RUL, adjust accordingly

4. FAULT ANTICIPATION
   • Predict impending failures
   • Pre-redistribute before failure
   • Graceful degradation

OPTIMIZATION ALGORITHM:
───────────────────────

minimize: Σ(Tj_i - Tj_target)² + λ₁ × Σ(1/η_i) + λ₂ × Σ(age_i × P_i)
subject to: Σ P_i = P_total
            P_min ≤ P_i ≤ P_max
            Tj_i ≤ Tj_limit

Solved distributedly using:
• Consensus-based optimization
• Each module computes local gradient
• Share gradients, not raw data
• Converge in <10 iterations
```

### Dynamic Redistribution Example

```
SCENARIO: 5× EK30 modules, 100 kW demand
───────────────────────────────────────

Initial state (equal distribution):
┌─────┬────────┬────────┬─────────┐
│ Mod │ Power  │ Tj     │ η       │
├─────┼────────┼────────┼─────────┤
│ M1  │ 20 kW  │ 120°C  │ 97.1%   │
│ M2  │ 20 kW  │ 135°C  │ 96.8%   │ ← HOT!
│ M3  │ 20 kW  │ 125°C  │ 97.0%   │
│ M4  │ 20 kW  │ 115°C  │ 97.2%   │
│ M5  │ 20 kW  │ 110°C  │ 97.3%   │ ← Coolest
├─────┼────────┼────────┼─────────┤
│ TOT │ 100 kW │ avg125 │ avg97.1%│
└─────┴────────┴────────┴─────────┘

After AI optimization (10 iterations):
┌─────┬────────┬────────┬─────────┐
│ Mod │ Power  │ Tj     │ η       │
├─────┼────────┼────────┼─────────┤
│ M1  │ 19 kW  │ 118°C  │ 97.2%   │
│ M2  │ 15 kW  │ 122°C  │ 97.4%   │ ← Reduced
│ M3  │ 18 kW  │ 120°C  │ 97.1%   │
│ M4  │ 22 kW  │ 120°C  │ 97.0%   │
│ M5  │ 26 kW  │ 120°C  │ 96.9%   │ ← Increased
├─────┼────────┼────────┼─────────┤
│ TOT │ 100 kW │ avg120 │ avg97.1%│
└─────┴────────┴────────┴─────────┘

Result:
• Temperature spread: 25°C → 4°C
• M2 prevented from thermal stress
• System efficiency maintained
• All modules at 120°C target
```

---

## 4. Fault Tolerance

### N+1 Redundancy

```
DESIGN FOR FAILURE
──────────────────

System sizing: Σ P_module > P_required × 1.2

Example: 150 kW system
• 6 × EK30 = 180 kW capacity
• Any 1 module can fail
• System continues at full power

With 2 module failure:
• 4 × 30 kW = 120 kW
• 80% power maintained
• Graceful degradation
```

### Fault Detection & Isolation

```
FAULT DETECTION (per module)
────────────────────────────
1. Self-diagnostics
   • Overcurrent
   • Overvoltage
   • Overtemperature
   • Communication timeout
   • AI anomaly detection

2. Peer monitoring
   • Heartbeat timeout
   • Inconsistent state reports
   • Unusual behavior patterns

FAULT ISOLATION
───────────────
1. Module detects own fault
2. Broadcasts FAULT_ALERT on CAN
3. Reduces output to zero (soft shutdown)
4. Opens output contactor (if severe)
5. Enters safe state

PEER RESPONSE
─────────────
1. Receive FAULT_ALERT
2. Immediately begin redistribution
3. Each module increases power proportionally
4. New steady state in <100ms
5. Log event for maintenance
```

### Self-Healing

```
SELF-HEALING SCENARIOS
──────────────────────

SCENARIO 1: Transient fault
• Module detects overcurrent spike
• Reduces power, clears fault
• Gradually returns to normal
• Logs event, continues operation

SCENARIO 2: Persistent fault
• Module cannot clear fault
• Enters standby mode
• Other modules compensate
• Maintenance notification sent

SCENARIO 3: Communication loss
• Module loses CAN communication
• Switches to standalone mode
• Uses local droop control only
• Attempts reconnection periodically

SCENARIO 4: Module replacement
• Failed module replaced (hot-swap)
• New module powers up
• Auto-discovers network
• Downloads configuration from peers
• Joins ROJ seamlessly

Time for new module integration: <30 seconds
```

---

## 5. ROJ Algorithms

### Consensus Protocol (Raft-inspired)

```
LEADER ELECTION
───────────────

States: LEADER, CANDIDATE, FOLLOWER

FOLLOWER → CANDIDATE:
  When: No heartbeat from leader for 150-300ms (randomized)
  Action: Increment term, request votes

CANDIDATE → LEADER:
  When: Receives majority of votes
  Action: Send heartbeats, begin leading

CANDIDATE → FOLLOWER:
  When: Receives heartbeat from higher term leader
  Action: Accept new leader

LEADER → FOLLOWER:
  When: Discovers higher term
  Action: Step down

Algorithm pseudocode:
─────────────────────

function onElectionTimeout():
    state = CANDIDATE
    currentTerm++
    votedFor = self
    votes = 1
    broadcast(RequestVote(currentTerm, self))

function onRequestVote(term, candidateId):
    if term > currentTerm:
        currentTerm = term
        state = FOLLOWER
    if term >= currentTerm and votedFor is None:
        votedFor = candidateId
        return VoteGranted
    return VoteDenied

function onVoteReceived(granted):
    if granted:
        votes++
    if votes > numModules / 2:
        state = LEADER
        startHeartbeat()
```

### Distributed Optimization

```
CONSENSUS-BASED OPTIMIZATION
────────────────────────────

Each module maintains:
• Local state: x_i (power, temperature, etc.)
• Neighbor states: x_j for all neighbors
• Local cost function: f_i(x_i)

Update rule (per iteration):
x_i(k+1) = Σ w_ij × x_j(k) - α × ∇f_i(x_i(k))

Where:
• w_ij: Weight for neighbor j (usually 1/degree)
• α: Step size
• ∇f_i: Local gradient

Properties:
• Converges to global optimum
• Only local communication needed
• Robust to node failures
• Scalable to large networks

Convergence: Typically 5-20 iterations
Communication per iteration: O(n) messages
```

### Emergent Behavior

```
EMERGENT ROJ BEHAVIORS
──────────────────────

1. LOAD FOLLOWING
   • No central command
   • Modules sense DC bus voltage
   • Collectively adjust to demand
   • Behavior: Tracks load changes automatically

2. THERMAL MIGRATION
   • Hot modules reduce output
   • Cool modules increase output
   • Heat "flows" to cooler modules
   • Behavior: Self-cooling without central control

3. FAULT ABSORPTION
   • Failed module stops contributing
   • Neighbors sense voltage drop
   • Automatically compensate
   • Behavior: Seamless fault ride-through

4. EFFICIENCY SEEKING
   • Modules share efficiency data
   • Load concentrates on efficient modules
   • At partial load, some modules go standby
   • Behavior: System efficiency maximization
```

---

## 6. Scalability

### Adding Modules

```
PLUG & PLAY PROCEDURE
─────────────────────

1. Physical connection
   • Connect DC bus (parallel)
   • Connect CAN-FD bus
   • Connect coolant loop (if shared)

2. Power up
   • Module boots, runs self-test
   • Scans CAN bus for existing nodes
   • Broadcasts JOIN_REQUEST

3. Network integration
   • Leader responds with configuration
   • Module receives:
     - Assigned ID
     - Current setpoints
     - Grid parameters
     - Fleet policies

4. Synchronization
   • Module syncs to grid (PLL)
   • Syncs to DC bus voltage
   • Begins soft-start power injection

5. Full operation
   • Participates in ROJ optimization
   • Reports status, receives commands
   • Full member of ROJ

Total time: <60 seconds
User intervention: None
```

### Removing Modules

```
PLANNED REMOVAL
───────────────
1. Operator initiates removal command
2. Module reduces power to zero
3. Opens output contactor
4. Broadcasts LEAVE message
5. Other modules redistribute
6. Physical disconnection safe

UNPLANNED REMOVAL (hot unplug)
──────────────────────────────
1. Module suddenly disappears
2. Heartbeat timeout detected (150ms)
3. ROJ initiates fault redistribution
4. System continues at reduced capacity
5. No user intervention needed
```

### Scaling Limits

```
THEORETICAL LIMITS
──────────────────

CAN-FD bus:
• ~100 nodes per bus segment
• Bandwidth limits: ~50 Hz update rate with 64 nodes

Practical limits for ELEKTROKOMBINACIJA:
• Recommended: ≤20 modules per CAN segment
• With CAN bridge: Up to 100 modules

Power scaling:
• 20 × EK30 = 600 kW per CAN segment
• Multiple segments for MW-scale systems

HIERARCHICAL SCALING
────────────────────

For very large systems (>1 MW):

Level 1: Module ROJs (up to 20 modules each)
Level 2: ROJ-of-ROJs (up to 10 ROJs)
Level 3: Site controller (optional)

         ┌─────────────────────────────────┐
         │        SITE CONTROLLER          │
         │        (optional)               │
         └───────────┬─────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │  ROJ 1  │  │  ROJ 2  │  │  ROJ 3  │
   │ 600 kW  │  │ 600 kW  │  │ 600 kW  │
   │20×EK30  │  │20×EK30  │  │20×EK30  │
   └─────────┘  └─────────┘  └─────────┘

Total: 1.8 MW with full ROJ benefits
```

---

## 7. Implementation Details

### Software Architecture

```
ROJ MODULE SOFTWARE
───────────────────

┌────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  ┌────────────────────────────────────────────────────┐   │
│  │              ROJ COORDINATOR                        │   │
│  │  • Leader election                                  │   │
│  │  • Distributed optimization                         │   │
│  │  • Fault handling                                   │   │
│  └────────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────────┤
│                    SERVICES LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Power       │  │  Thermal     │  │  Diagnostics │    │
│  │  Control     │  │  Manager     │  │  Engine      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
├────────────────────────────────────────────────────────────┤
│                    COMMUNICATION LAYER                     │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  CAN-FD Stack                                        │ │
│  │  • Message serialization                             │ │
│  │  • Routing                                           │ │
│  │  • Acknowledgment                                    │ │
│  └──────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│                    HAL LAYER                               │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐            │
│  │  CAN      │  │  PWM      │  │  ADC      │            │
│  │  Driver   │  │  Driver   │  │  Driver   │            │
│  └───────────┘  └───────────┘  └───────────┘            │
└────────────────────────────────────────────────────────────┘
```

### State Machine

```
MODULE STATE MACHINE
────────────────────

           ┌───────────────────┐
           │      BOOT         │
           └─────────┬─────────┘
                     │ Self-test passed
                     ▼
           ┌───────────────────┐
           │   DISCOVERING     │ ←─── Network scan
           └─────────┬─────────┘
                     │ Network found
                     ▼
           ┌───────────────────┐
           │   SYNCHRONIZING   │ ←─── Grid sync, config
           └─────────┬─────────┘
                     │ Sync complete
                     ▼
           ┌───────────────────┐
    ┌─────→│    STANDBY        │ ←─── Low demand
    │      └─────────┬─────────┘
    │                │ Demand increase
    │                ▼
    │      ┌───────────────────┐
    │      │    ACTIVE         │ ←─── Normal operation
    │      └─────────┬─────────┘
    │                │ Fault detected
    │                ▼
    │      ┌───────────────────┐
    └──────│    DEGRADED       │ ←─── Reduced capability
           └─────────┬─────────┘
                     │ Fault cleared
                     ▼
           ┌───────────────────┐
           │    FAULT          │ ←─── Safe shutdown
           └───────────────────┘

Transitions are event-driven
Timeout watchdogs for stuck states
```

---

## 8. Bill of Materials - ROJ

| Component | Specification | Qty | Unit Price | Total |
|-----------|---------------|-----|------------|-------|
| CAN-FD Transceiver | TJA1443 or equivalent | 1 | €3 | €3 |
| CAN-FD Controller | Integrated in MCU | - | - | €0 |
| Termination Resistor | 120Ω, 1% | 2 | €0.10 | €0.20 |
| CAN Connector | DB9 or M12 | 2 | €5 | €10 |
| CAN Cable | Shielded twisted pair, 5m | 1 | €10 | €10 |
| Status LED | RGB, addressable | 1 | €1 | €1 |
| ID DIP Switch | 4-position (or software ID) | 1 | €1 | €1 |
| **TOTAL ROJ per module** | | | | **€25.20** |

---

## 9. Battery ROJ Intelligence (EK-BAT)

The ROJ intelligence paradigm extends naturally from charger modules (EK3) to vehicle battery modules (EK-BAT). Each battery module is an autonomous agent with onboard BMS that participates in a larger ROJ network.

### 9.1 Battery Module as ROJ Agent

```
CHARGER ROJ                          BATTERY ROJ
────────────────────────────────────────────────────────────────────
EK3 charger modules              →    EK-BAT battery modules
Power optimization               →    SOC/SOH optimization
Thermal coordination             →    Cell balancing across fleet
Droop control                    →    V2G participation
DC bus voltage sensing           →    Battery health monitoring
Robot swaps charger modules      →    Robot swaps batteries

COMBINED ECOSYSTEM:

        ┌──────────────────────────────────────────────────────────┐
        │                    SWAP STATION                          │
        │   ┌─────────────────────────────────────────────────┐   │
        │   │          CHARGER MODULE ROJ                      │   │
        │   │   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐            │   │
        │   │   │ EK3 │  │ EK3 │  │ EK3 │  │ EK3 │  ...       │   │
        │   │   └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘            │   │
        │   │      └────────┴────────┴────────┘                │   │
        │   │               │ CAN-FD                           │   │
        │   └───────────────┼──────────────────────────────────┘   │
        │                   │                                      │
        │                   ▼                                      │
        │   ┌─────────────────────────────────────────────────┐   │
        │   │          BATTERY MODULE ROJ (POOL)               │   │
        │   │   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐            │   │
        │   │   │BAT-1│  │BAT-2│  │BAT-3│  │BAT-4│  ...       │   │
        │   │   │ 85% │  │ 70% │  │ 95% │  │ 60% │  (SOC)     │   │
        │   │   └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘            │   │
        │   │      └────────┴────────┴────────┘                │   │
        │   │               │ CAN-FD (Battery ROJ)             │   │
        │   └───────────────┼──────────────────────────────────┘   │
        │                   │                                      │
        └───────────────────┼──────────────────────────────────────┘
                            │
                     VEHICLES ARRIVE
                     BATTERIES SWAPPED
```

### 9.2 Distributed BMS Architecture

```
TRADITIONAL BMS                      ROJ BMS (EK-BAT)
────────────────────────────────────────────────────────────────────
Central BMS per vehicle         →    Each module has full BMS
Proprietary protocols           →    Open CAN-FD protocol
Fixed battery = fixed vehicle   →    Any battery → any vehicle
Failure = stranded vehicle      →    Failure = swap to new module

EK-BAT BMS CAPABILITIES (per module):
─────────────────────────────────────
• Cell voltage monitoring (±1mV)
• Cell temperature monitoring (8 points)
• SOC estimation (Coulomb counting + Kalman)
• SOH estimation (impedance spectroscopy)
• Active balancing (cell-to-cell)
• Thermal management (pump/valve control)
• CAN-FD communication (5 Mbps)
• ROJ participation (leader election)
• V2G ready (bidirectional control)
• Predictive health analytics (edge AI)

BMS HARDWARE:
─────────────
Main MCU: STM32G474RET6 (same as EK3!)
AFE: BQ76952 (16 cell, TI)
Current sense: INA240 (bidirectional)
Temperature: NTC × 8, ±0.5°C
Isolation: ISO7741 (4-channel)
Memory: 1MB Flash, 128KB SRAM
AI accelerator: Integrated FPU + CORDIC
```

### 9.3 Battery Pool Optimization

```
ROJ OPTIMIZATION OBJECTIVES
───────────────────────────

minimize: f(dispatch) =
    w₁ × Σ(SOC_target - SOC_i)² +     # SOC equalization
    w₂ × Σ(1/SOH_i) × P_dispatch_i +   # Preserve weak batteries
    w₃ × Σ(T_i - T_optimal)² +         # Thermal optimization
    w₄ × Σ(cycles_i × P_i) +           # Wear leveling
    w₅ × Σ(d_station - d_vehicle)      # Distance minimization

subject to:
    Σ SOC_dispatched ≥ route_energy_required
    SOC_i ∈ [SOC_min, SOC_max]
    T_i ≤ T_limit
    n_dispatched ≤ vehicle_capacity


DISPATCH ALGORITHM (Greedy-Optimal):
────────────────────────────────────

function selectBatteriesForVehicle(vehicle, pool):
    required_energy = vehicle.route.energy_kwh
    candidates = pool.filter(b → b.SOC > SOC_min and b.available)

    # Score each battery (lower = better)
    for battery in candidates:
        score = 0
        score += α × abs(battery.SOC - SOC_optimal)     # Prefer mid-SOC
        score += β × (1 - battery.SOH)                   # Avoid degraded
        score += γ × (battery.temp - 25°C)²             # Prefer room temp
        score += δ × battery.total_cycles / 4000        # Wear leveling
        battery.dispatch_score = score

    # Select top N batteries that meet energy requirement
    selected = []
    candidates.sortBy(dispatch_score)

    for battery in candidates:
        selected.add(battery)
        if sum(b.energy_available for b in selected) >= required_energy:
            break

    return selected


EXAMPLE: City Bus Fleet (10 buses, 50 battery pool)
──────────────────────────────────────────────────

Pool state:
┌─────────┬─────────┬─────────┬──────────┬────────────────────┐
│ Battery │ SOC (%) │ SOH (%) │ Temp (°C)│ Score              │
├─────────┼─────────┼─────────┼──────────┼────────────────────┤
│ BAT-12  │ 82      │ 98      │ 28       │ 0.15 (excellent)   │
│ BAT-07  │ 85      │ 96      │ 25       │ 0.18               │
│ BAT-23  │ 90      │ 95      │ 30       │ 0.22               │
│ BAT-41  │ 95      │ 92      │ 32       │ 0.28 (too full)    │
│ BAT-03  │ 65      │ 88      │ 35       │ 0.45 (degraded)    │
│ BAT-19  │ 40      │ 75      │ 22       │ 0.82 (low SOH)     │
└─────────┴─────────┴─────────┴──────────┴────────────────────┘

Bus #5 needs 80 kWh for route:
• Algorithm selects: BAT-12 + BAT-07 (50 kWh each × 85% avg = 85 kWh)
• Avoids: BAT-19 (low SOH), BAT-41 (would need to discharge deeply)
• Result: Optimal battery utilization across fleet
```

### 9.4 Vehicle-Station Communication

```
BATTERY SWAP COMMUNICATION SEQUENCE
───────────────────────────────────

Vehicle Arrival → Swap Negotiation → Battery Exchange → Departure

DETAILED SEQUENCE:

T-2min: Vehicle broadcasts arrival intent (over LTE/5G)
        MSG: {vehicle_id, ETA, route_next, energy_needed, battery_count}

T-1min: Station responds with swap plan
        MSG: {station_id, bay_assignment, batteries_reserved[]}
        Station reserves optimal batteries from pool

T-0:    Vehicle arrives at bay
        Physical connection: CAN-FD + interlock

T+10s:  BMS handshake
        Vehicle BMS ↔ Station BMS ↔ Battery BMSs (ROJ)
        Exchange: SOC, SOH, thermal state, authentication

T+30s:  Robot begins removal
        Old batteries enter pool (for charging)
        New batteries mounted to vehicle

T+5min: Swap complete
        Final BMS sync, vehicle departure authorization

POST-SWAP:
        Old batteries join station ROJ
        Begin charging via EK3 charger ROJ
        Ready for next vehicle in ~30 min


CAN-FD MESSAGE TYPES (Battery ROJ Extension):
─────────────────────────────────────────────

7. BATTERY_STATUS (1 Hz, per module)
   ID: 0x400 + battery_id
   Payload: [SOC%, SOH%, Tj_max, Tj_avg, voltage, current, fault_code]
   Purpose: Pool status aggregation

8. DISPATCH_REQUEST (on vehicle arrival)
   ID: 0x500
   Payload: [vehicle_id, energy_kwh, count, priority, route_hash]
   Purpose: Initiate battery selection

9. DISPATCH_ASSIGN (response to request)
   ID: 0x501
   Payload: [battery_ids[], SOC[], bay_number, ETA_ready]
   Purpose: Confirm battery allocation

10. V2G_COMMAND (grid operator request)
    ID: 0x600
    Payload: [power_kw, duration_s, price_kwh, grid_frequency]
    Purpose: V2G participation request to battery ROJ
```

### 9.5 V2G Integration

```
BATTERY ROJ AS VIRTUAL POWER PLANT
──────────────────────────────────

Battery pool at swap station provides grid services:

┌────────────────────────────────────────────────────────────────────┐
│                         GRID OPERATOR                               │
│                              │                                      │
│                     ┌────────▼────────┐                            │
│                     │  GRID SIGNAL    │                            │
│                     │  (freq, price)  │                            │
│                     └────────┬────────┘                            │
│                              │                                      │
│   ┌──────────────────────────▼───────────────────────────────────┐ │
│   │                  SWAP STATION                                 │ │
│   │                                                               │ │
│   │   ┌───────────────────────────────────────────────────────┐  │ │
│   │   │              EK3 CHARGER ROJ (BIDIRECTIONAL)          │  │ │
│   │   │         ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐            │  │ │
│   │   │         │ EK3 │  │ EK3 │  │ EK3 │  │ EK3 │            │  │ │
│   │   │         │ V2G │  │ V2G │  │ V2G │  │ V2G │            │  │ │
│   │   │         └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘            │  │ │
│   │   │            └────────┴────────┴────────┘               │  │ │
│   │   │                      │                                 │  │ │
│   │   └──────────────────────┼─────────────────────────────────┘  │ │
│   │                          │ DC Bus                             │ │
│   │   ┌──────────────────────┼─────────────────────────────────┐  │ │
│   │   │              BATTERY ROJ (V2G READY)                   │  │ │
│   │   │         ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐            │  │ │
│   │   │         │BAT-1│  │BAT-2│  │BAT-3│  │BAT-4│            │  │ │
│   │   │         │ 80% │  │ 75% │  │ 90% │  │ 65% │            │  │ │
│   │   │         └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘            │  │ │
│   │   │            │        │        │        │                │  │ │
│   │   │    AVAILABLE FOR V2G:    RESERVED FOR VEHICLES:       │  │ │
│   │   │    BAT-2, BAT-4          BAT-1, BAT-3                  │  │ │
│   │   │    140 kWh capacity      170 kWh reserved              │  │ │
│   │   │                                                        │  │ │
│   │   └────────────────────────────────────────────────────────┘  │ │
│   │                                                               │ │
│   └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

V2G REVENUE MODEL:
──────────────────
50-battery pool at bus depot
• Average 50% batteries available for V2G
• 25 × 50 kWh × 0.5 availability = 625 kWh storage
• Peak shaving: 4 hours/day × 365 days × €0.15/kWh = €137k/year
• Frequency regulation: €50k/year additional

V2G participation criteria (per battery):
• SOC > 30% (reserve for emergency dispatch)
• SOH > 80% (protect healthy batteries)
• Not reserved for vehicle within 2 hours
• Thermal state normal
```

### 9.6 Emergent Battery ROJ Behaviors

```
EMERGENT BEHAVIORS (Battery ROJ)
────────────────────────────────

1. SOC EQUALIZATION
   • Batteries with high SOC → provide V2G
   • Batteries with low SOC → priority charging
   • Result: Pool maintains uniform readiness

2. THERMAL LOAD SHIFTING
   • Hot batteries → standby (cooling)
   • Cool batteries → charging/V2G
   • Heat distributed across time

3. HEALTH-BASED SELECTION
   • High-SOH batteries → demanding routes (hills, long)
   • Low-SOH batteries → easy routes (flat, short)
   • Fleet-wide battery life maximized

4. PREDICTIVE POSITIONING
   • Learn vehicle arrival patterns
   • Pre-position batteries for morning rush
   • Anticipate grid price spikes

5. FAULT ISOLATION
   • Weak cell detected in BAT-15
   • Automatic exclusion from dispatch
   • Alert for maintenance
   • No vehicle stranded


COMPARISON: Traditional vs ROJ BMS
──────────────────────────────────

| Aspect                | Traditional        | ROJ BMS             |
|-----------------------|--------------------|--------------------|
| Decision making       | Centralized        | Distributed         |
| Single point failure  | Yes (central BMS)  | No                  |
| Scalability           | Limited            | Linear              |
| Battery utilization   | Individual         | Fleet-optimized     |
| V2G coordination      | Per-vehicle        | Pool-level          |
| Failure handling      | Manual             | Automatic           |
| Add new battery       | Configuration      | Plug & play         |
| Health optimization   | Per-battery        | Fleet-wide          |
```

---

## 10. SWARM CORE Specification

SWARM CORE is the formal specification of ROJ coordination for the entire JEZGRO product family. It defines the shared implementation that all devices (EK3, BAT, ROB, GW, RACK) use for swarm coordination.

### 10.1 ROJ_COORD Service

The ROJ_COORD service is the runtime component that implements SWARM CORE. It consists of five key components:

| Component | Purpose |
|-----------|---------|
| **Policy Engine** | Stores parameters, selects behavior mode (explore/exploit) |
| **Quorum Engine** | Drives decisions with cross-inhibition |
| **Stigmergy Store** | Local tag map with TTL and exponential decay |
| **Task Allocator** | Task and resource distribution |
| **Health/Trust** | Anomaly detection and agent isolation |

### 10.2 Message Protocol

SWARM CORE defines six CAN-FD message types for coordination:

| Type | ID Range | Frequency | Purpose |
|------|----------|-----------|---------|
| `ROJ_HEARTBEAT` | 0x510 + node | 1-2 Hz | Presence + basic metrics |
| `ROJ_STATE` | 0x520 + node | 0.5 Hz | Extended state snapshot |
| `ROJ_TASK_CLAIM` | 0x540 | On-demand | Task/resource requests |
| `ROJ_VOTE` | 0x550 | On-demand | Quorum voting |
| `ROJ_TAG` | 0x560 | 1-5 Hz | Stigmergy tags |
| `ROJ_ALERT` | 0x5FF | Event | Critical notifications |

### 10.3 Coordination Algorithms

**Quorum Voting:**
```
Q = max(quorum_min, quorum_ratio × active_nodes)

if votes_yes >= Q and votes_yes > votes_no:
    decision = ACCEPT
elif timeout and votes_yes < Q:
    decision = REJECT
```

**Stigmergy (Tag + Decay):**
```
tag.value(t+dt) = tag.value(t) × exp(-dt / tau)
```
Tags decay exponentially with configurable half-life. TTL expiry removes the tag.

**Topological Coordination:**
- Each agent maintains k neighbors (default k=6-7)
- List refreshed based on link quality and freshness
- Provides stability independent of network density

### 10.4 Related Documents

For complete specification, see:
- `tehnika/inzenjersko/en/rojno-jezgro/00-core-spec.md` (EK-TECH-027)
- `tehnika/inzenjersko/en/rojno-jezgro/01-detaljni-dokument.md` (EK-TECH-028)

---

## References and Sources

- [Distributed Controller for Parallel Converters](https://ieeexplore.ieee.org/document/10621445/)
- [Multi-Module Converter Control Strategy](https://ieeexplore.ieee.org/document/131193)
- [Distributed Control for AC/DC Converters](https://ietresearch.onlinelibrary.wiley.com/doi/abs/10.1049/iet-pel.2012.0390)
- [imperix Distributed Converter Control](https://imperix.com/technology/distributed-converter-control/)
- [Reactive Power Coordination](https://www.sciencedirect.com/science/article/pii/S2096511725001203)
- [Raft Consensus Algorithm](https://raft.github.io/)
