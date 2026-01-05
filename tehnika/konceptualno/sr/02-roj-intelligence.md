# ROJ: Distribuirana Inteligencija za Multi-Modul Sisteme

## Šta je ROJ?

**ROJ** je Elektrokombinacija sistem za distribuiranu inteligenciju. Kao što JEZGRO (kernel) imenuje naš mikrokernel OS, ROJ imenuje naš sloj za koordinaciju roja.

Ime odražava:
- **Distribuiranu prirodu**: Kao pčele u roju, svaki modul je autonoman
- **Kolektivnu inteligenciju**: Jednostavna pravila stvaraju složeno, optimalno ponašanje
- **Srpsko poreklo**: Konzistentno sa JEZGRO brendingom

## Filozofija: Distribuirana Inteligencija

```
CENTRALIZOVANI SISTEM            ELEKTROKOMBINACIJA ROJ
────────────────────────────────────────────────────────────
Jedan kontroler                →    Svaki modul = mozak
Single point of failure       →    Nema single point
Hijerarhijska kontrola        →    Peer-to-peer
Scalability limit             →    Plug & play
Manual load balancing         →    Autonomna optimizacija
Scheduled maintenance         →    Self-healing
```

---

## 1. ROJ Arhitektura

### Koncept

```
TRADICIONALNO                    ROJ INTELIGENCIJA
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

### ROJ Topologija

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
│              ROJ APPLICATION LAYER                      │
│  • Load balancing                                       │
│  • Thermal coordination                                 │
│  • Fault handling                                       │
│  • Leader election                                      │
├─────────────────────────────────────────────────────────┤
│              ROJ TRANSPORT LAYER                        │
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

## 5. ROJ Algoritmi

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
EMERGENTNA ROJ PONAŠANJA
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

Level 1: Modul ROJ-evi (do 20 modula svaki)
Level 2: ROJ-od-ROJ-eva (do 10 ROJ-eva)
Level 3: Site kontroler (opciono)

         ┌─────────────────────────────────┐
         │        SITE KONTROLER           │
         │        (opciono)                │
         └───────────┬─────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │  ROJ 1  │  │  ROJ 2  │  │  ROJ 3  │
   │ 600 kW  │  │ 600 kW  │  │ 600 kW  │
   │20×EK30  │  │20×EK30  │  │20×EK30  │
   └─────────┘  └─────────┘  └─────────┘

Total: 1.8 MW sa punim ROJ benefitima
```

---

## 7. Implementation Details

### Software Architecture

```
ROJ MODULE SOFTVER
──────────────────

┌────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  ┌────────────────────────────────────────────────────┐   │
│  │              ROJ KOORDINATOR                        │   │
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

## 8. Lista Materijala - ROJ

| Komponenta | Specifikacija | Qty | Unit Price | Total |
|------------|---------------|-----|------------|-------|
| CAN-FD Transceiver | TJA1443 ili ekvivalent | 1 | €3 | €3 |
| CAN-FD Controller | Integrisan u MCU | - | - | €0 |
| Termination Resistor | 120Ω, 1% | 2 | €0.10 | €0.20 |
| CAN Konektor | DB9 ili M12 | 2 | €5 | €10 |
| CAN Kabl | Oklopljeni twisted pair, 5m | 1 | €10 | €10 |
| Status LED | RGB, addressable | 1 | €1 | €1 |
| ID DIP Switch | 4-pozicioni (ili softverski ID) | 1 | €1 | €1 |
| **UKUPNO ROJ po modulu** | | | | **€25.20** |

---

## 9. Redundant Communication (Dual CAN)

### 9.1 Dual CAN Bus Design

```
ZAŠTO DUAL CAN?
───────────────
• CAN bus je single point of failure
• Prekid žice → ROJ gubi koordinaciju
• Critical for safety and reliability

DUAL CAN ARCHITECTURE
─────────────────────

┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│   Module 1        Module 2        Module 3        Module 84       │
│   ┌──────┐        ┌──────┐        ┌──────┐        ┌──────┐       │
│   │ MCU  │        │ MCU  │        │ MCU  │        │ MCU  │       │
│   │      │        │      │        │      │        │      │       │
│   │ CAN1 │        │ CAN1 │        │ CAN1 │        │ CAN1 │       │
│   │ CAN2 │        │ CAN2 │        │ CAN2 │        │ CAN2 │       │
│   └──┬┬──┘        └──┬┬──┘        └──┬┬──┘        └──┬┬──┘       │
│      ││              ││              ││              ││           │
│ CAN-A║╠══════════════╬╬══════════════╬╬══════════════╬╣══ 120Ω   │
│      ││              ││              ││              ││           │
│ CAN-B║╠══════════════╬╬══════════════╬╬══════════════╬╣══ 120Ω   │
│      ││              ││              ││              ││           │
│                                                                   │
│   Physical separation: CAN-A left side, CAN-B right side         │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

CAN-A (Primary):
• All normal communication
• Power commands, heartbeats, sync
• High data rate traffic

CAN-B (Backup):
• Heartbeat only (1 Hz per module)
• Failover traffic if CAN-A fails
• Lower traffic, higher reliability margin
```

### 9.2 Failover Protocol

```
FAILOVER STATE MACHINE
──────────────────────

         ┌────────────────────────────────────────────┐
         │                                            │
         ▼                                            │
    ┌─────────────┐       CAN-A Error           ┌────┴────────┐
    │  NORMAL     │───────────────────────────► │  DEGRADED   │
    │  (CAN-A)    │       >10 errors/100ms      │  (CAN-B)    │
    └─────────────┘                              └─────────────┘
         ▲                                            │
         │                                            │
         └───────────── Manual switchback ────────────┘
                       (operator command)


DETECTION CRITERIA
──────────────────
Failover triggered when:
• Error frame count > 10 in 100ms window
• Bus-off state detected
• No valid messages for 500ms

NOT triggered by:
• Single error frame
• Intermittent errors < threshold
• Normal arbitration delays


FAILOVER SEQUENCE
─────────────────

Time     Event                          Action
────────────────────────────────────────────────────────────────
T+0ms    First error detected           Start error counter
T+10ms   Error count = 5                Continue monitoring
T+50ms   Error count = 11 (>10)         TRIGGER FAILOVER
T+51ms   Disable CAN-A TX               Stop transmitting on A
T+52ms   Enable CAN-B TX                Start transmitting on B
T+55ms   Broadcast FAILOVER msg on B    Notify all modules
T+60ms   All modules on CAN-B           Swarm continues operation

Total switchover time: <10ms
Packet loss: 0-1 heartbeats


FAILOVER MESSAGE FORMAT
───────────────────────
ID: 0x7FE (high priority, just below FAULT_ALERT)
Payload: [source_id, epoch, old_bus, new_bus, error_count, timestamp]
Purpose: Synchronize all modules to same bus
```

### 9.3 Split-Brain Prevention

```
SPLIT-BRAIN PROBLEM
───────────────────

What if CAN-A and CAN-B become isolated?

         CAN-A          │          CAN-B
    ┌────────────┐      │     ┌────────────┐
    │   M1  M2   │      │     │   M3  M4   │
    │            │  ????│     │            │
    │  Leader A  │      │     │  Leader B  │
    └────────────┘      │     └────────────┘

Two leaders = inconsistent state = BAD


PREVENTION MECHANISM: EPOCH COUNTER
───────────────────────────────────

Each module maintains:
• current_epoch: Monotonically increasing counter
• last_epoch_seen: Highest epoch seen from any peer

Rules:
1. Leader broadcasts epoch in every SYNC message
2. On failover, leader increments epoch
3. Module accepts only messages from epoch >= last_epoch_seen
4. On network merge, higher epoch wins

SEQUENCE NUMBER TRACKING
────────────────────────

Per-module sequence numbers prevent replay:

┌──────────────┬────────────────────────────────────────┐
│ Module ID    │ Sequence tracking                      │
├──────────────┼────────────────────────────────────────┤
│ Module 1     │ last_seq=1042, window=[1040-1042]     │
│ Module 2     │ last_seq=892,  window=[890-892]       │
│ Module 3     │ last_seq=2103, window=[2100-2103]     │
│ ...          │ ...                                    │
└──────────────┴────────────────────────────────────────┘

On network merge:
• Modules compare sequence numbers
• Higher sequence = more recent state
• Lower sequence modules resync


NETWORK MERGE ALGORITHM
───────────────────────

function onNetworkMerge():
    # Step 1: Compare epochs
    peer_epochs = collectEpochsFromAllPeers()
    max_epoch = max(peer_epochs)

    # Step 2: Accept leader with highest epoch
    if my_epoch < max_epoch:
        state = FOLLOWER
        current_epoch = max_epoch
        resyncFromPeer(max_epoch_owner)

    # Step 3: If tie, compare module ID
    if my_epoch == max_epoch and my_id < leader_id:
        state = FOLLOWER

    # Step 4: Broadcast merged state
    if state == LEADER:
        epoch++
        broadcast(SYNC(epoch, merged_state))
```

### 9.4 Hardware Implementation

```
DUAL CAN TRANSCEIVER SETUP
──────────────────────────

Per Module:
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│   STM32G474                                                   │
│   ┌─────────────────────────────────────────────────────────┐ │
│   │                                                         │ │
│   │    FDCAN1 ────────────► TJA1443 (#1) ────► CAN-A       │ │
│   │                         (Primary)                       │ │
│   │                                                         │ │
│   │    FDCAN2 ────────────► TJA1443 (#2) ────► CAN-B       │ │
│   │                         (Backup)                        │ │
│   │                                                         │ │
│   └─────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘

Component Selection:
• Transceiver: TJA1443ATK (NXP)
  - CAN-FD up to 5 Mbps
  - ±58V bus fault tolerance
  - Integrated ESD protection
• Alternative: TCAN1042 (TI) for tighter budgets

PCB ROUTING FOR DUAL CAN
────────────────────────

Backplane routing:

┌─────────────────────────────────────────────────────────────────┐
│                        BACKPLANE PCB                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Left edge (CAN-A):                 Right edge (CAN-B):         │
│  ════════════════════               ════════════════════        │
│  ║ CAN-A_H          ║               ║ CAN-B_H          ║        │
│  ║ CAN-A_L          ║               ║ CAN-B_L          ║        │
│  ════════════════════               ════════════════════        │
│         ↑                                    ↑                  │
│         │                                    │                  │
│    Twisted pair                        Twisted pair             │
│    in shielded                         in shielded              │
│    conduit                             conduit                  │
│                                                                 │
│  Physical separation: >50mm between CAN-A and CAN-B routing    │
│  Purpose: Fault on one bus unlikely to affect other            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

TERMINATION (Both Buses)
────────────────────────

Split termination for better EMC:

CAN_H ──────┬────────────────
            │
           ┌┴┐
           │ │ 60Ω
           └┬┘
            ├────┤├──── 4.7nF ──► GND
           ┌┴┐
           │ │ 60Ω
           └┬┘
            │
CAN_L ──────┴────────────────

Location: Both ends of each bus
Total: 4 termination networks per rack


BOM ADDITION FOR DUAL CAN
─────────────────────────

| Component           | Qty per module | Unit Price | Total  |
|---------------------|----------------|------------|--------|
| TJA1443ATK (2nd)    | 1              | €3.00      | €3.00  |
| CM choke (2nd)      | 1              | €1.50      | €1.50  |
| TVS diodes (2nd)    | 2              | €0.50      | €1.00  |
| Termination (share) | 0.25           | €2.00      | €0.50  |
| **Additional cost** |                |            | **€6** |

Ukupna ROJ cena sa dual CAN: €25.20 + €6.00 = €31.20 po modulu
```

### 9.5 Software Configuration

```c
/* Dual CAN initialization */
typedef struct {
    CAN_HandleTypeDef *primary;    /* CAN-A */
    CAN_HandleTypeDef *backup;     /* CAN-B */
    uint8_t active_bus;            /* 0=A, 1=B */
    uint32_t error_count;
    uint32_t last_error_time;
} DualCAN_t;

void DualCAN_Init(DualCAN_t *dcan) {
    /* Initialize both CAN peripherals */
    CAN_Init(dcan->primary, CAN_SPEED_5MBPS);
    CAN_Init(dcan->backup, CAN_SPEED_5MBPS);

    /* Primary handles all traffic */
    dcan->active_bus = 0;

    /* Backup only receives (monitors health) */
    CAN_SetMode(dcan->backup, CAN_MODE_LISTEN_ONLY);

    dcan->error_count = 0;
}

void DualCAN_OnError(DualCAN_t *dcan) {
    uint32_t now = HAL_GetTick();

    /* Count errors in 100ms window */
    if (now - dcan->last_error_time > 100) {
        dcan->error_count = 0;
    }
    dcan->error_count++;
    dcan->last_error_time = now;

    /* Failover threshold */
    if (dcan->error_count > 10) {
        DualCAN_Failover(dcan);
    }
}

void DualCAN_Failover(DualCAN_t *dcan) {
    if (dcan->active_bus == 0) {
        /* Switch A → B */
        CAN_SetMode(dcan->primary, CAN_MODE_DISABLED);
        CAN_SetMode(dcan->backup, CAN_MODE_NORMAL);
        dcan->active_bus = 1;
    }
    /* Note: B→A requires manual intervention */

    /* Broadcast failover notification */
    CANMessage_t msg;
    msg.id = 0x7FE;
    msg.data[0] = g_module_id;
    msg.data[1] = g_epoch >> 24;
    /* ... */
    CAN_Transmit(dcan->backup, &msg);
}
```

---

## 10. ROJ Inteligencija za Baterije (EK-BAT)

ROJ paradigma prirodno se proširuje sa modula punjača (EK3) na module baterija vozila (EK-BAT). Svaki modul baterije je autonomni agent sa ugrađenim BMS-om koji učestvuje u većoj ROJ mreži.

### 10.1 Modul Baterije kao ROJ Agent

```
ROJ PUNJAČA                          ROJ BATERIJA
────────────────────────────────────────────────────────────────────
EK3 moduli punjača               →    EK-BAT moduli baterija
Optimizacija snage               →    Optimizacija SOC/SOH
Termalna koordinacija            →    Balansiranje ćelija kroz flotu
Droop kontrola                   →    V2G učešće
Senziranje napona DC sabirnice   →    Praćenje zdravlja baterije
Robot zamenjuje module punjača   →    Robot zamenjuje baterije

KOMBINOVANI EKOSISTEM:

        ┌──────────────────────────────────────────────────────────┐
        │                    SWAP STANICA                          │
        │   ┌─────────────────────────────────────────────────┐   │
        │   │          ROJ MODULA PUNJAČA                      │   │
        │   │   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐            │   │
        │   │   │ EK3 │  │ EK3 │  │ EK3 │  │ EK3 │  ...       │   │
        │   │   └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘            │   │
        │   │      └────────┴────────┴────────┘                │   │
        │   │               │ CAN-FD                           │   │
        │   └───────────────┼──────────────────────────────────┘   │
        │                   │                                      │
        │                   ▼                                      │
        │   ┌─────────────────────────────────────────────────┐   │
        │   │          ROJ MODULA BATERIJA (POOL)              │   │
        │   │   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐            │   │
        │   │   │BAT-1│  │BAT-2│  │BAT-3│  │BAT-4│  ...       │   │
        │   │   │ 85% │  │ 70% │  │ 95% │  │ 60% │  (SOC)     │   │
        │   │   └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘            │   │
        │   │      └────────┴────────┴────────┘                │   │
        │   │               │ CAN-FD (Roj baterija)            │   │
        │   └───────────────┼──────────────────────────────────┘   │
        │                   │                                      │
        └───────────────────┼──────────────────────────────────────┘
                            │
                     VOZILA DOLAZE
                     BATERIJE SE MENJAJU
```

### 10.2 Distribuirana BMS Arhitektura

```
TRADICIONALNI BMS                    ROJ BMS (EK-BAT)
────────────────────────────────────────────────────────────────────
Centralni BMS po vozilu          →    Svaki modul ima pun BMS
Proprietary protokoli            →    Otvoreni CAN-FD protokol
Fiksna baterija = fiksno vozilo  →    Bilo koja baterija → bilo koje vozilo
Kvar = zarobljeno vozilo         →    Kvar = zamena na novi modul

MOGUĆNOSTI EK-BAT BMS (po modulu):
──────────────────────────────────
• Praćenje napona ćelija (±1mV)
• Praćenje temperature ćelija (8 tačaka)
• SOC estimacija (Kulonsko brojanje + Kalman)
• SOH estimacija (impedansna spektroskopija)
• Aktivno balansiranje (ćelija-do-ćelije)
• Termalno upravljanje (pumpa/ventil)
• CAN-FD komunikacija (5 Mbps)
• Učešće u roju (izbor lidera)
• V2G spremnost (bidirekciona kontrola)
• Prediktivna analitika zdravlja (edge AI)

BMS HARDVER:
────────────
Glavni MCU: STM32G474RET6 (isti kao EK3!)
AFE: BQ76952 (16 ćelija, TI)
Senziranje struje: INA240 (bidirekcioni)
Temperatura: NTC × 8, ±0,5°C
Izolacija: ISO7741 (4 kanala)
Memorija: 1MB Flash, 128KB SRAM
AI akcelerator: Integrisani FPU + CORDIC
```

### 10.3 Optimizacija Baterijskog Pool-a

```
CILJEVI ROJ OPTIMIZACIJE
──────────────────────────

minimize: f(dispatch) =
    w₁ × Σ(SOC_target - SOC_i)² +     # SOC izjednačavanje
    w₂ × Σ(1/SOH_i) × P_dispatch_i +   # Očuvanje slabih baterija
    w₃ × Σ(T_i - T_optimal)² +         # Termalna optimizacija
    w₄ × Σ(cycles_i × P_i) +           # Balansiranje habanja
    w₅ × Σ(d_stanica - d_vozilo)       # Minimizacija udaljenosti

ograničenja:
    Σ SOC_dispatched ≥ energy_potrebna_za_rutu
    SOC_i ∈ [SOC_min, SOC_max]
    T_i ≤ T_limit
    n_dispatched ≤ kapacitet_vozila


ALGORITAM DISPEČINGA (Greedy-Optimal):
──────────────────────────────────────

function selectBatteriesForVehicle(vehicle, pool):
    required_energy = vehicle.route.energy_kwh
    candidates = pool.filter(b → b.SOC > SOC_min and b.available)

    # Boduj svaku bateriju (niže = bolje)
    for battery in candidates:
        score = 0
        score += α × abs(battery.SOC - SOC_optimal)     # Preferiraj srednji SOC
        score += β × (1 - battery.SOH)                   # Izbegavaj degradirane
        score += γ × (battery.temp - 25°C)²             # Preferiraj sobnu temp
        score += δ × battery.total_cycles / 4000        # Balansiranje habanja
        battery.dispatch_score = score

    # Selektuj top N baterija koje zadovoljavaju energetski zahtev
    selected = []
    candidates.sortBy(dispatch_score)

    for battery in candidates:
        selected.add(battery)
        if sum(b.energy_available for b in selected) >= required_energy:
            break

    return selected


PRIMER: Gradska autobuska flota (10 autobusa, 50 baterija pool)
───────────────────────────────────────────────────────────────

Stanje pool-a:
┌─────────┬─────────┬─────────┬──────────┬────────────────────┐
│ Baterija│ SOC (%) │ SOH (%) │ Temp (°C)│ Bodovi             │
├─────────┼─────────┼─────────┼──────────┼────────────────────┤
│ BAT-12  │ 82      │ 98      │ 28       │ 0.15 (odlično)     │
│ BAT-07  │ 85      │ 96      │ 25       │ 0.18               │
│ BAT-23  │ 90      │ 95      │ 30       │ 0.22               │
│ BAT-41  │ 95      │ 92      │ 32       │ 0.28 (prepuna)     │
│ BAT-03  │ 65      │ 88      │ 35       │ 0.45 (degradirana) │
│ BAT-19  │ 40      │ 75      │ 22       │ 0.82 (nizak SOH)   │
└─────────┴─────────┴─────────┴──────────┴────────────────────┘

Autobus #5 treba 80 kWh za rutu:
• Algoritam bira: BAT-12 + BAT-07 (50 kWh × 85% prosek = 85 kWh)
• Izbegava: BAT-19 (nizak SOH), BAT-41 (zahtevalo bi duboko pražnjenje)
• Rezultat: Optimalno korišćenje baterija kroz flotu
```

### 10.4 Komunikacija Vozilo-Stanica

```
SEKVENCA KOMUNIKACIJE ZA ZAMENU BATERIJA
────────────────────────────────────────

Dolazak vozila → Pregovaranje o zameni → Razmena baterija → Odlazak

DETALJNA SEKVENCA:

T-2min: Vozilo emituje nameru dolaska (preko LTE/5G)
        MSG: {vehicle_id, ETA, route_next, energy_needed, battery_count}

T-1min: Stanica odgovara sa planom zamene
        MSG: {station_id, bay_assignment, batteries_reserved[]}
        Stanica rezerviše optimalne baterije iz pool-a

T-0:    Vozilo dolazi na poziciju
        Fizička konekcija: CAN-FD + interlock

T+10s:  BMS rukovanje
        BMS vozila ↔ BMS stanice ↔ BMS baterija (roj)
        Razmena: SOC, SOH, termalno stanje, autentifikacija

T+30s:  Robot počinje uklanjanje
        Stare baterije ulaze u pool (za punjenje)
        Nove baterije se montiraju na vozilo

T+5min: Zamena završena
        Finalna BMS sinhronizacija, autorizacija odlaska vozila

POSLE ZAMENE:
        Stare baterije se pridružuju roju stanice
        Počinje punjenje preko EK3 roja punjača
        Spremne za sledeće vozilo za ~30 min


CAN-FD TIPOVI PORUKA (Proširenje za roj baterija):
──────────────────────────────────────────────────

7. BATTERY_STATUS (1 Hz, po modulu)
   ID: 0x400 + battery_id
   Payload: [SOC%, SOH%, Tj_max, Tj_avg, voltage, current, fault_code]
   Svrha: Agregacija statusa pool-a

8. DISPATCH_REQUEST (na dolazak vozila)
   ID: 0x500
   Payload: [vehicle_id, energy_kwh, count, priority, route_hash]
   Svrha: Inicijacija selekcije baterija

9. DISPATCH_ASSIGN (odgovor na zahtev)
   ID: 0x501
   Payload: [battery_ids[], SOC[], bay_number, ETA_ready]
   Svrha: Potvrda alokacije baterija

10. V2G_COMMAND (zahtev mrežnog operatora)
    ID: 0x600
    Payload: [power_kw, duration_s, price_kwh, grid_frequency]
    Svrha: V2G zahtev za učešće roja baterija
```

### 10.5 V2G Integracija

```
ROJ BATERIJA KAO VIRTUELNA ELEKTRANA
────────────────────────────────────

Baterijski pool na swap stanici pruža mrežne usluge:

┌────────────────────────────────────────────────────────────────────┐
│                         MREŽNI OPERATOR                             │
│                              │                                      │
│                     ┌────────▼────────┐                            │
│                     │  SIGNAL MREŽE   │                            │
│                     │  (frekv, cena)  │                            │
│                     └────────┬────────┘                            │
│                              │                                      │
│   ┌──────────────────────────▼───────────────────────────────────┐ │
│   │                  SWAP STANICA                                 │ │
│   │                                                               │ │
│   │   ┌───────────────────────────────────────────────────────┐  │ │
│   │   │              ROJ EK3 PUNJAČA (BIDIREKCIONI)           │  │ │
│   │   │         ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐            │  │ │
│   │   │         │ EK3 │  │ EK3 │  │ EK3 │  │ EK3 │            │  │ │
│   │   │         │ V2G │  │ V2G │  │ V2G │  │ V2G │            │  │ │
│   │   │         └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘            │  │ │
│   │   │            └────────┴────────┴────────┘               │  │ │
│   │   │                      │                                 │  │ │
│   │   └──────────────────────┼─────────────────────────────────┘  │ │
│   │                          │ DC sabirnica                       │ │
│   │   ┌──────────────────────┼─────────────────────────────────┐  │ │
│   │   │              ROJ BATERIJA (V2G SPREMAN)                │  │ │
│   │   │         ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐            │  │ │
│   │   │         │BAT-1│  │BAT-2│  │BAT-3│  │BAT-4│            │  │ │
│   │   │         │ 80% │  │ 75% │  │ 90% │  │ 65% │            │  │ │
│   │   │         └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘            │  │ │
│   │   │            │        │        │        │                │  │ │
│   │   │    DOSTUPNO ZA V2G:     REZERVISANO ZA VOZILA:        │  │ │
│   │   │    BAT-2, BAT-4         BAT-1, BAT-3                   │  │ │
│   │   │    140 kWh kapacitet    170 kWh rezervisano            │  │ │
│   │   │                                                        │  │ │
│   │   └────────────────────────────────────────────────────────┘  │ │
│   │                                                               │ │
│   └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

MODEL PRIHODA OD V2G:
─────────────────────
Pool od 50 baterija na autobuskom depou
• Prosečno 50% baterija dostupno za V2G
• 25 × 50 kWh × 0,5 dostupnost = 625 kWh skladištenje
• Smanjenje vršnog opterećenja: 4h/dan × 365 dana × €0,15/kWh = €137k/god
• Regulacija frekvencije: €50k/godišnje dodatno

Kriterijumi za V2G učešće (po bateriji):
• SOC > 30% (rezerva za hitni dispatch)
• SOH > 80% (zaštita zdravih baterija)
• Nije rezervisana za vozilo u naredna 2 sata
• Termalno stanje normalno
```

### 10.6 Emergentna Ponašanja Roja Baterija

```
EMERGENTNA PONAŠANJA (Roj baterija)
───────────────────────────────────

1. SOC IZJEDNAČAVANJE
   • Baterije sa visokim SOC → pružaju V2G
   • Baterije sa niskim SOC → prioritetno punjenje
   • Rezultat: Pool održava uniformnu spremnost

2. TERMALNO PREBACIVANJE OPTEREĆENJA
   • Vruće baterije → standby (hlađenje)
   • Hladne baterije → punjenje/V2G
   • Toplota distribuirana kroz vreme

3. SELEKCIJA ZASNOVANA NA ZDRAVLJU
   • Baterije visokog SOH → zahtevne rute (brda, duge)
   • Baterije niskog SOH → lake rute (ravne, kratke)
   • Životni vek baterija maksimiziran kroz flotu

4. PREDIKTIVNO POZICIONIRANJE
   • Učenje obrazaca dolaska vozila
   • Prethodno pozicioniranje za jutarnji šic
   • Anticipacija skokova cene struje

5. IZOLACIJA KVAROVA
   • Slaba ćelija detektovana u BAT-15
   • Automatsko isključenje iz dispečinga
   • Upozorenje za održavanje
   • Nijedno vozilo ne ostaje zarobljeno


POREĐENJE: Tradicionalni vs ROJ BMS
───────────────────────────────────

| Aspekt                | Tradicionalni      | ROJ BMS             |
|-----------------------|--------------------|---------------------|
| Donošenje odluka      | Centralizovano     | Distribuirano       |
| Single point of fail  | Da (centralni BMS) | Ne                  |
| Skalabilnost          | Ograničena         | Linearna            |
| Iskorišćenje baterija | Individualno       | Optimizovano za fl. |
| V2G koordinacija      | Po vozilu          | Na nivou pool-a     |
| Rukovanje kvarovima   | Ručno              | Automatsko          |
| Dodavanje nove bater. | Konfiguracija      | Plug & play         |
| Optimizacija zdravlja | Po bateriji        | Kroz celu flotu     |
```

---

## 11. SWARM CORE Specifikacija

SWARM CORE je formalna specifikacija ROJ koordinacije za celu JEZGRO porodicu proizvoda. Definiše zajedničku implementaciju koju svi uređaji (EK3, BAT, ROB, GW, RACK) koriste za koordinaciju roja.

### 11.1 ROJ_COORD Servis

ROJ_COORD servis je runtime komponenta koja implementira SWARM CORE. Sastoji se od pet ključnih komponenti:

| Komponenta | Svrha |
|------------|-------|
| **Policy Engine** | Čuva parametre, bira režim ponašanja (istraživanje/eksploatacija) |
| **Quorum Engine** | Pokreće odluke sa unakrsnom inhibicijom |
| **Stigmergy Store** | Lokalna mapa tagova sa TTL i eksponencijalnim opadanjem |
| **Task Allocator** | Distribucija zadataka i resursa |
| **Health/Trust** | Detekcija anomalija i izolacija agenata |

### 11.2 Protokol Poruka

SWARM CORE definiše šest CAN-FD tipova poruka za koordinaciju:

| Tip | ID Opseg | Frekvencija | Svrha |
|-----|----------|-------------|-------|
| `ROJ_HEARTBEAT` | 0x510 + node | 1-2 Hz | Prisutnost + osnovne metrike |
| `ROJ_STATE` | 0x520 + node | 0.5 Hz | Prošireni snimak stanja |
| `ROJ_TASK_CLAIM` | 0x540 | Po potrebi | Zahtevi za zadatke/resurse |
| `ROJ_VOTE` | 0x550 | Po potrebi | Kvorum glasanje |
| `ROJ_TAG` | 0x560 | 1-5 Hz | Stigmergy tagovi |
| `ROJ_ALERT` | 0x5FF | Događaj | Kritične notifikacije |

### 11.3 Algoritmi Koordinacije

**Kvorum Glasanje:**
```
Q = max(quorum_min, quorum_ratio × active_nodes)

if votes_yes >= Q and votes_yes > votes_no:
    decision = ACCEPT
elif timeout and votes_yes < Q:
    decision = REJECT
```

**Stigmergija (Tag + Opadanje):**
```
tag.value(t+dt) = tag.value(t) × exp(-dt / tau)
```
Tagovi eksponencijalno opadaju sa konfigurabilnim poluvremenom. Istek TTL-a uklanja tag.

**Topološka Koordinacija:**
- Svaki agent održava k suseda (podrazumevano k=6-7)
- Lista se osvežava na osnovu kvaliteta veze i svežine podataka
- Obezbeđuje stabilnost nezavisno od gustine mreže

### 11.4 Povezani Dokumenti

Za kompletnu specifikaciju, videti:
- `tehnika/inzenjersko/sr/rojno-jezgro/00-core-spec.md` (EK-TECH-027)
- `tehnika/inzenjersko/sr/rojno-jezgro/01-detaljni-dokument.md` (EK-TECH-028)

---

## Reference i Izvori

- [Distributed Controller for Parallel Converters](https://ieeexplore.ieee.org/document/10621445/)
- [Multi-Module Converter Control Strategy](https://ieeexplore.ieee.org/document/131193)
- [Distributed Control for AC/DC Converters](https://ietresearch.onlinelibrary.wiley.com/doi/abs/10.1049/iet-pel.2012.0390)
- [imperix Distributed Converter Control](https://imperix.com/technology/distributed-converter-control/)
- [Reactive Power Coordination](https://www.sciencedirect.com/science/article/pii/S2096511725001203)
- [Raft Consensus Algorithm](https://raft.github.io/)
