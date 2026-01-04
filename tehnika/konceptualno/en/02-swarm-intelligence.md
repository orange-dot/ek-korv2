# Swarm Intelligence for Multi-Module Systems

## Philosophy: Distributed Intelligence

```
CENTRALIZED SYSTEM              ELEKTROKOMBINACIJA SWARM
────────────────────────────────────────────────────────────
Single controller              →    Each module = brain
Single point of failure       →    No single point
Hierarchical control          →    Peer-to-peer
Scalability limit             →    Plug & play
Manual load balancing         →    Autonomous optimization
Scheduled maintenance         →    Self-healing
```

---

## 1. Swarm Architecture

### Concept

```
TRADITIONAL                     SWARM INTELLIGENCE
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

### Swarm Topology

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
• Executes swarm decisions
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
│              SWARM APPLICATION LAYER                    │
│  • Load balancing                                       │
│  • Thermal coordination                                 │
│  • Fault handling                                       │
│  • Leader election                                      │
├─────────────────────────────────────────────────────────┤
│              SWARM TRANSPORT LAYER                      │
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
• Joins swarm seamlessly

Time for new module integration: <30 seconds
```

---

## 5. Swarm Algorithms

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
EMERGENT SWARM BEHAVIORS
────────────────────────

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
   • Participates in swarm optimization
   • Reports status, receives commands
   • Full member of swarm

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
3. Swarm initiates fault redistribution
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

Level 1: Module swarms (up to 20 modules each)
Level 2: Swarm-of-swarms (up to 10 swarms)
Level 3: Site controller (optional)

         ┌─────────────────────────────────┐
         │        SITE CONTROLLER          │
         │        (optional)               │
         └───────────┬─────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │ Swarm 1 │  │ Swarm 2 │  │ Swarm 3 │
   │ 600 kW  │  │ 600 kW  │  │ 600 kW  │
   │20×EK30  │  │20×EK30  │  │20×EK30  │
   └─────────┘  └─────────┘  └─────────┘

Total: 1.8 MW with full swarm benefits
```

---

## 7. Implementation Details

### Software Architecture

```
SWARM MODULE SOFTWARE
─────────────────────

┌────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  ┌────────────────────────────────────────────────────┐   │
│  │              SWARM COORDINATOR                      │   │
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

## 8. Bill of Materials - Swarm

| Component | Specification | Qty | Unit Price | Total |
|-----------|---------------|-----|------------|-------|
| CAN-FD Transceiver | TJA1443 or equivalent | 1 | €3 | €3 |
| CAN-FD Controller | Integrated in MCU | - | - | €0 |
| Termination Resistor | 120Ω, 1% | 2 | €0.10 | €0.20 |
| CAN Connector | DB9 or M12 | 2 | €5 | €10 |
| CAN Cable | Shielded twisted pair, 5m | 1 | €10 | €10 |
| Status LED | RGB, addressable | 1 | €1 | €1 |
| ID DIP Switch | 4-position (or software ID) | 1 | €1 | €1 |
| **TOTAL Swarm per module** | | | | **€25.20** |

---

## References and Sources

- [Distributed Controller for Parallel Converters](https://ieeexplore.ieee.org/document/10621445/)
- [Multi-Module Converter Control Strategy](https://ieeexplore.ieee.org/document/131193)
- [Distributed Control for AC/DC Converters](https://ietresearch.onlinelibrary.wiley.com/doi/abs/10.1049/iet-pel.2012.0390)
- [imperix Distributed Converter Control](https://imperix.com/technology/distributed-converter-control/)
- [Reactive Power Coordination](https://www.sciencedirect.com/science/article/pii/S2096511725001203)
- [Raft Consensus Algorithm](https://raft.github.io/)
