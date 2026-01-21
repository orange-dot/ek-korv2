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

### Topological Neighbor Selection Algorithm

```
FORMAL NEIGHBOR SELECTION FOR k-TOPOLOGY
────────────────────────────────────────

The k=7 topological coordination requires each module to select
exactly k neighbors from the segment. This selection MUST optimize
for network properties while ensuring convergence to a stable topology.


LOGICAL DISTANCE METRIC DEFINITION
──────────────────────────────────

Logical distance d(i,j) between modules i and j is computed as:

    d(i,j) = w₁ × d_can(i,j) + w₂ × d_latency(i,j) + w₃ × d_error(i,j)

Where:

1. CAN Address Distance:
   d_can(i,j) = min(|CAN_ID_i - CAN_ID_j|, N - |CAN_ID_i - CAN_ID_j|)

   This creates a "ring" topology where IDs wrap around.
   Example with N=64 nodes:
   - d_can(1, 5) = 4
   - d_can(1, 63) = min(62, 2) = 2  (wraps around)

2. Message Latency Distance:
   d_latency(i,j) = avg_rtt(i,j) / MAX_EXPECTED_RTT

   Measured via PING messages over CAN-FD.
   Normalized to [0, 1] range.

3. Error Rate Distance:
   d_error(i,j) = (missed_msgs(i,j) + crc_errors(i,j)) / total_msgs(i,j)

   Historical error rate between nodes.
   Higher errors = higher distance = less likely neighbor.


Default weights (tunable):
   w₁ = 0.5  # CAN topology
   w₂ = 0.3  # Latency
   w₃ = 0.2  # Reliability


NEIGHBOR SELECTION ALGORITHM
────────────────────────────

Goal: Select k neighbors that minimize network diameter while
      maximizing fault tolerance.

algorithm SelectNeighbors(self_id, all_nodes, k):
    candidates = all_nodes - {self_id}
    selected = []

    # Phase 1: Select geographically diverse neighbors
    # Pick neighbors spread across the CAN ID space
    for i in range(k):
        target_position = (self_id + i × (N / k)) mod N
        nearest = argmin(candidates, key=λn: d_can(n, target_position))
        selected.append(nearest)
        candidates.remove(nearest)

    # Phase 2: Quality refinement
    # Replace poor-quality selections with better alternatives
    for i, neighbor in enumerate(selected):
        quality = 1 / (d_latency(self_id, neighbor) + d_error(self_id, neighbor) + ε)

        # Check if any remaining candidate is significantly better
        for candidate in candidates:
            candidate_quality = 1 / (d_latency(self_id, candidate) + d_error(self_id, candidate) + ε)

            # Only replace if quality improvement > 20% AND
            # replacement doesn't reduce topological diversity
            if candidate_quality > 1.2 × quality:
                if maintains_diversity(selected, i, candidate):
                    selected[i] = candidate
                    candidates.remove(candidate)
                    candidates.add(neighbor)
                    break

    return selected


function maintains_diversity(selected, replace_idx, new_neighbor):
    # Ensure neighbors are spread across at least 3 CAN ID quadrants
    quadrant_count = count_quadrants(selected[:replace_idx] +
                                      [new_neighbor] +
                                      selected[replace_idx+1:])
    return quadrant_count >= 3


ADAPTIVE k VALUE
────────────────

For small networks, k=7 may be suboptimal or impossible.
Adaptive k calculation:

function compute_adaptive_k(segment_size):
    if segment_size <= 3:
        # Fully connected mesh
        return segment_size - 1

    if segment_size <= 7:
        # k = n-2 ensures good connectivity
        return segment_size - 2

    if segment_size <= 15:
        # k = 5 is sufficient
        return 5

    if segment_size <= 30:
        # k = 6 balances bandwidth and connectivity
        return 6

    # Default for large segments
    return 7

Theoretical basis (from starling flock research):
- k ≈ 6-7 provides scale-free correlation
- k < 6 may cause coordination fragmentation
- k > 7 wastes bandwidth with minimal benefit


TOPOLOGY REFORMATION TRIGGERS
─────────────────────────────

Neighbor lists must be rebuilt when:

1. Node failure (heartbeat timeout)
2. Node addition (JOIN_REQUEST received)
3. Quality degradation (error rate > threshold)
4. Periodic refresh (every 60 seconds)
5. Partition heal (reconciliation)

Reformation algorithm:

function on_topology_trigger(trigger_type):
    # Rate limit reformations
    if time_since_last_reformation < MIN_REFORMATION_INTERVAL:
        queue_reformation(trigger_type)
        return

    # Announce reformation intent
    broadcast(TOPOLOGY_REFORMATION_START(self.id, trigger_type))

    # Collect current network state
    active_nodes = discover_active_nodes()

    # Compute new neighbors
    new_k = compute_adaptive_k(len(active_nodes))
    new_neighbors = SelectNeighbors(self.id, active_nodes, new_k)

    # Validate selection with neighbors
    for neighbor in new_neighbors:
        send(neighbor, NEIGHBOR_PROPOSAL(self.id))

    # Wait for acknowledgments
    acks = await_acks(new_neighbors, timeout=NEIGHBOR_ACK_TIMEOUT)

    # Finalize if majority acknowledge
    if len(acks) >= new_k / 2 + 1:
        commit_neighbor_list(new_neighbors)
        broadcast(TOPOLOGY_REFORMATION_COMPLETE(self.id, new_neighbors))
    else:
        # Retry with fallback neighbors
        retry_reformation_with_fallbacks()


CONVERGENCE GUARANTEE
─────────────────────

Theorem: The SelectNeighbors algorithm converges to a stable topology
         within O(log N) reformation rounds for N nodes.

Proof sketch:
1. Phase 1 ensures geometric diversity (no clustering)
2. Phase 2 quality refinement is monotonic (quality only increases)
3. Rate limiting prevents oscillation
4. Mutual acknowledgment ensures symmetric neighbor relationships

Convergence metrics (logged for verification):
- topology_diameter: Max hops between any two nodes
- avg_neighbor_quality: Mean 1/d(i,j) for all neighbor pairs
- reformation_count: Total reformations since startup
- convergence_time: Time from startup to stable topology


EXAMPLE: 64-Module Segment
──────────────────────────

Module 0 neighbor selection with k=7:

Phase 1 (geometric spread):
- Target positions: 0, 9, 18, 27, 36, 45, 54 (spaced by N/k = 64/7 ≈ 9)
- Initial selection: [9, 18, 27, 36, 45, 54, 63]

Phase 2 (quality refinement):
- Module 27 has high error rate (0.05)
- Module 28 has low error rate (0.001) and similar position
- Replace 27 → 28

Final neighbors: [9, 18, 28, 36, 45, 54, 63]

Network properties achieved:
- Diameter: 4 hops (any node reachable in ≤4 hops)
- Redundancy: 3 independent paths between most node pairs
- Fault tolerance: 2 neighbor failures survivable
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

### Byzantine Fault Tolerance

```
BYZANTINE FAULT MODEL
─────────────────────

A Byzantine fault occurs when a module behaves arbitrarily:
• Sends incorrect data (sensor failure, firmware bug)
• Sends conflicting data to different peers (equivocation)
• Fails to follow protocol (malicious or corrupted)
• Colludes with other faulty modules (coordinated attack)

Unlike crash faults (module simply stops), Byzantine faults are
unpredictable and potentially malicious.


FORMAL BOUNDS
─────────────

For Byzantine fault tolerance with f faulty nodes:

    N ≥ 3f + 1

Where:
• N = total number of nodes
• f = maximum number of Byzantine (faulty) nodes

For ROJ with k=7 neighbors:
• N = 7 modules in consensus group
• f = 2 Byzantine faults tolerated
• Requires 5 honest votes for consensus (7 - 2 = 5)

This satisfies: 7 ≥ 3(2) + 1 = 7 ✓


BYZANTINE BEHAVIOR DETECTION
────────────────────────────

1. EQUIVOCATION DETECTION

   Equivocation: Module sends different values to different peers
   for the same state.

   Detection mechanism:

   function on_neighbor_state_received(sender, state, sequence):
       # Store state announcement
       state_cache[sender][sequence] = {
           state: state,
           received_from: [current_reporter],
           timestamp: now()
       }

       # Share announcements with k-neighbors
       for neighbor in my_neighbors:
           share_state_observation(neighbor, sender, state, sequence)

   function on_state_observation_shared(reporter, about, state, seq):
       if seq in state_cache[about]:
           existing = state_cache[about][seq]

           # Equivocation detected!
           if existing.state != state:
               log_equivocation(
                   byzantine_module=about,
                   state_1=existing.state,
                   reporter_1=existing.received_from,
                   state_2=state,
                   reporter_2=reporter
               )
               initiate_quarantine(about)

   Equivocation is unforgeable proof of Byzantine behavior.


2. SIGNATURE VERIFICATION FOR CRITICAL MESSAGES

   Critical messages (power commands, leader election, emergency)
   MUST be signed to prevent impersonation.

   Message structure with signature:

   SIGNED_MESSAGE = {
       payload: [original message bytes],
       sender_id: u16,
       sequence: u32,
       mac: [16 bytes]  # Chaskey MAC with shared key
   }

   Verification:

   function verify_signed_message(msg):
       expected_mac = chaskey_mac(
           key=shared_segment_key,
           data=msg.payload || msg.sender_id || msg.sequence
       )

       if msg.mac != expected_mac:
           log_invalid_signature(msg.sender_id)
           increment_byzantine_suspicion(msg.sender_id)
           return REJECT

       if msg.sequence <= last_seen_sequence[msg.sender_id]:
           # Replay attack detection
           log_replay_attempt(msg.sender_id)
           return REJECT

       last_seen_sequence[msg.sender_id] = msg.sequence
       return ACCEPT


3. BEHAVIOR CONSISTENCY CHECKING

   Monitor for statistically unlikely behavior patterns:

   byzantine_indicators = {
       inconsistent_power_reports: 0,
       impossible_state_transitions: 0,
       protocol_violations: 0,
       timing_anomalies: 0,
       selective_communication: 0
   }

   Anomaly detection rules:

   # Power report consistency
   if abs(reported_power - measured_bus_contribution) > THRESHOLD:
       byzantine_indicators.inconsistent_power_reports++

   # State transition validity
   if transition(old_state, new_state) NOT IN valid_transitions:
       byzantine_indicators.impossible_state_transitions++

   # Protocol compliance
   if message_type NOT IN expected_for_current_state:
       byzantine_indicators.protocol_violations++

   # Timing (heartbeats should be regular)
   jitter = stddev(heartbeat_intervals)
   if jitter > ACCEPTABLE_JITTER:
       byzantine_indicators.timing_anomalies++

   # Selective communication (talking to some, not others)
   if neighbor reports hearing X but I don't:
       byzantine_indicators.selective_communication++

   # Aggregate suspicion
   suspicion_score = weighted_sum(byzantine_indicators)
   if suspicion_score > BYZANTINE_THRESHOLD:
       initiate_quarantine_vote(module_id)


QUARANTINE PROTOCOL
───────────────────

When Byzantine behavior confirmed, module is quarantined:

function initiate_quarantine_vote(suspect_id):
    # Require supermajority to quarantine (prevent false positives)
    proposal = QUARANTINE_PROPOSAL(
        suspect_id=suspect_id,
        evidence=collect_evidence(suspect_id),
        proposer=self.id,
        timestamp=now()
    )

    broadcast_to_segment(proposal)
    await_votes(timeout=QUARANTINE_VOTE_TIMEOUT)

function on_quarantine_proposal(proposal):
    # Verify evidence locally
    if verify_evidence(proposal.evidence):
        vote = APPROVE
    else:
        vote = REJECT

    send_vote(proposal.proposer, vote)

function count_quarantine_votes(votes):
    approve_count = count(v for v in votes if v == APPROVE)
    total_voters = len(votes)

    # 2/3 supermajority required
    if approve_count >= (2 * total_voters / 3):
        execute_quarantine(suspect_id)
    else:
        dismiss_proposal()

function execute_quarantine(module_id):
    quarantined_modules.add(module_id)

    # Stop accepting messages from quarantined module
    message_filter.block(module_id)

    # Remove from neighbor lists
    for node in segment:
        node.remove_neighbor(module_id)

    # Redistribute load away from quarantined module
    redistribute_load_excluding(module_id)

    # Alert L2 supervisor
    send_quarantine_alert_to_l2(module_id, evidence)


QUARANTINE RECOVERY
───────────────────

Quarantined modules can rejoin after operator intervention:

1. Module reboots with fresh firmware
2. Self-test passes
3. Module broadcasts REJOIN_REQUEST
4. L2 supervisor validates and authorizes
5. Segment members receive L2 authorization
6. Module begins probationary period (reduced trust)
7. After probation, full trust restored

Probationary rules:
• Messages require extra validation
• Cannot participate in leader election
• Power commands capped at 50%
• Duration: 24 hours or 1000 successful transactions
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

## 11. Network Partition Handling

Network partitions occur when communication failures divide a ROJ network into isolated groups that cannot communicate with each other. This section defines formal algorithms for detecting partitions, preventing split-brain scenarios, and recovering when partitions heal.

### 11.1 Partition Detection Algorithm

```
PARTITION DETECTION FUNDAMENTALS
────────────────────────────────

A network partition exists when:
• Subset P₁ of nodes can communicate with each other
• Subset P₂ of nodes can communicate with each other
• No node in P₁ can communicate with any node in P₂
• P₁ ∪ P₂ = All nodes, P₁ ∩ P₂ = ∅

DETECTION MECHANISMS:

1. HEARTBEAT-BASED SUSPICION
   ────────────────────────────
   Each module maintains:
   • received_heartbeats[]: timestamp of last heartbeat per known node
   • suspicion_count[]: consecutive missed heartbeats per node
   • partition_suspicion_level: aggregate partition likelihood

   Algorithm (executed every heartbeat_interval):

   for each known_node in network:
       elapsed = current_time - received_heartbeats[known_node]
       if elapsed > heartbeat_timeout:
           suspicion_count[known_node]++
           if suspicion_count[known_node] >= SUSPICION_THRESHOLD (default: 3):
               mark_node_suspected(known_node)
       else:
           suspicion_count[known_node] = 0
           mark_node_healthy(known_node)

   # Aggregate suspicion into partition likelihood
   suspected_count = count(nodes where suspicion_count >= THRESHOLD)
   total_known = count(known_nodes)
   partition_suspicion_level = suspected_count / total_known

   if partition_suspicion_level > PARTITION_THRESHOLD (default: 0.3):
       initiate_partition_protocol()


2. QUORUM LOSS DETECTION
   ──────────────────────

   Quorum Q = floor(N/2) + 1 for N total nodes

   active_nodes = count(nodes responding within timeout)

   if active_nodes < Q:
       # We may be in minority partition
       partition_state = MINORITY_SUSPECTED
       disable_decisions()  # Cannot make consensus decisions
   else if active_nodes >= Q:
       partition_state = QUORUM_PRESENT
       enable_decisions()


3. CAN ARBITRATION PATTERN ANALYSIS
   ─────────────────────────────────

   CAN-FD provides implicit partition detection through arbitration:

   • In unified network: arbitration resolves priority normally
   • In partitioned segment: only local nodes participate

   Detection heuristic:

   observed_arbitration_winners[] # IDs that won arbitration recently
   expected_high_priority_ids[]   # IDs that should win often

   if expected_high_priority_ids NOT IN observed_arbitration_winners:
       # High-priority nodes unreachable = possible partition
       segment_partition_suspected = true


4. PARTITION ANNOUNCEMENT PROTOCOL
   ────────────────────────────────

   When partition suspected, broadcast PARTITION_SUSPECTED message:

   Message ID: 0x018 (high priority)
   Payload:
   | Byte | Field              | Description                    |
   |------|--------------------|---------------------------------|
   | 0-1  | Sender ID          | Module detecting partition     |
   | 2    | Suspicion Level    | 0-100 partition likelihood     |
   | 3    | Visible Node Count | Nodes this module can see      |
   | 4    | Expected Nodes     | Total nodes expected           |
   | 5    | Partition Epoch    | Incrementing partition counter |
   | 6-7  | Reserved           | Future use                     |

   Receiving modules:
   • Correlate with own suspicion level
   • If consensus on partition: transition to PARTITIONED state
```

### 11.2 Split-Brain Prevention

```
SPLIT-BRAIN PROBLEM
───────────────────

Split-brain occurs when partitioned groups independently:
• Elect separate leaders
• Make conflicting decisions
• Diverge in state

Example catastrophic scenario:
• Partition creates two groups of 50 modules each
• Both groups elect a leader
• Both groups independently adjust grid power
• On partition heal: conflicting power levels cause grid instability


PREVENTION STRATEGY: MINORITY PARTITION FREEZE

Core principle: Only the partition containing a QUORUM may make decisions.
Minority partitions enter read-only freeze mode.


MINORITY PARTITION BEHAVIOR
───────────────────────────

function on_partition_detected():
    visible_nodes = get_reachable_nodes()

    # Check if we have quorum
    if len(visible_nodes) >= QUORUM:
        partition_role = MAJORITY
        enable_consensus_decisions()
        enable_power_changes()
    else:
        partition_role = MINORITY
        # CRITICAL: Freeze all non-local decisions
        disable_consensus_decisions()
        freeze_power_levels()  # Maintain last known good state
        enter_read_only_mode()

    # Continue local safety functions regardless
    continue_local_safety()  # Thermal protection, fault detection

Freeze mode rules:
• Power output: Hold at last commanded level (droop-only control)
• Leader election: Suspended (no new leader in minority)
• Load balancing: Local droop only, no ROJ optimization
• Fault response: Local isolation only, no redistributions


MAJORITY PARTITION BEHAVIOR
───────────────────────────

function majority_partition_operation():
    # Continue normal operation with reduced capacity
    recalculate_capacity(visible_nodes)
    redistribute_load_among_visible()

    # Adjust thresholds for smaller network
    update_consensus_thresholds(len(visible_nodes))

    # Log for reconciliation later
    log_all_decisions(partition_epoch)


EPOCH/TERM NUMBERING FOR STALE DETECTION
────────────────────────────────────────

Each partition event increments a global epoch:

partition_epoch: u32 = 0  # Monotonically increasing

On partition detection:
    partition_epoch++
    broadcast_epoch_update(partition_epoch)

On message receipt:
    if message.epoch < local_epoch:
        # Stale message from before partition
        discard_message()
        send_epoch_correction(sender, local_epoch)

    if message.epoch > local_epoch:
        # We are behind - request state sync
        request_state_sync(sender)

Leader messages include epoch:
    LEADER_HEARTBEAT = {
        leader_id: u16,
        term: u32,
        epoch: u32,  # Partition epoch
        committed_index: u32,
        ...
    }

Stale leader detection:
    if incoming_leader_heartbeat.epoch < local_epoch:
        # Leader from old partition - ignore
        ignore_heartbeat()
```

### 11.3 Partition Recovery and Reconciliation

```
PARTITION HEALING DETECTION
───────────────────────────

Partition heals when:
• Previously unreachable nodes respond to heartbeats
• CAN arbitration shows previously missing high-priority IDs
• Received messages from nodes marked as suspected

function on_suspected_node_responds(node_id):
    if node_id in suspected_nodes:
        suspected_nodes.remove(node_id)

        # Check if this heals a partition
        if partition_state == PARTITIONED:
            visible_now = get_reachable_nodes()
            if len(visible_now) > len(partition_visible) + HEAL_THRESHOLD:
                initiate_reconciliation()


RECONCILIATION PROTOCOL
───────────────────────

Phase 1: LEADER RESOLUTION

    # Both partitions may have elected leaders
    # Resolve using epoch comparison

    leader_candidates = collect_leader_claims()

    # Highest epoch wins (was in majority partition)
    winning_leader = max(leader_candidates, key=lambda l: l.epoch)

    # If epoch tie, use higher term; if term tie, use lower ID
    if epoch_tie:
        winning_leader = max(candidates, key=lambda l: (l.term, -l.id))

    broadcast_leader_resolution(winning_leader)

Phase 2: STATE SYNCHRONIZATION

    # Minority partition nodes catch up to majority state

    function sync_state_from_majority():
        # Request committed state from winning leader
        request = STATE_SYNC_REQUEST(
            my_last_epoch,
            my_last_committed_index
        )
        send_to(winning_leader, request)

        # Receive and apply state updates
        state_updates = receive_state_sync()
        for update in state_updates:
            if update.epoch > local_epoch:
                apply_state_update(update)
                local_epoch = update.epoch
                local_committed = update.committed_index

Phase 3: LOAD REDISTRIBUTION

    # Gradually reintegrate minority partition capacity

    function reintegrate_partition():
        # Minority nodes announce rejoining
        broadcast(PARTITION_REJOIN(self.id, self.capacity))

        # Wait for acknowledgment from leader
        ack = await_leader_ack()

        # Ramp power back gradually (prevent grid transients)
        for step in range(REINTEGRATION_STEPS):
            target_power = (step / REINTEGRATION_STEPS) * normal_power
            set_power_limit(target_power)
            await delay(REINTEGRATION_INTERVAL)  # 100ms per step

        # Resume normal ROJ participation
        partition_state = HEALTHY
        enable_full_operation()


RECONCILIATION MESSAGE TYPES
────────────────────────────

PARTITION_HEAL (0x019):
| Byte | Field           | Description                        |
|------|-----------------|-------------------------------------|
| 0-1  | Sender ID       | Module detecting heal               |
| 2-3  | Partition A ID  | Representative of first partition  |
| 4-5  | Partition B ID  | Representative of second partition |
| 6    | Heal Confidence | 0-100 confidence heal is complete  |
| 7    | Reserved        |                                     |

STATE_SYNC_REQUEST (0x01A):
| Byte | Field              | Description                     |
|------|--------------------|----------------------------------|
| 0-1  | Requester ID       | Node requesting sync             |
| 2-5  | Last Known Epoch   | Requester's last epoch           |
| 6-9  | Last Committed Idx | Requester's commit index         |
| 10-11| Reserved           |                                  |

STATE_SYNC_RESPONSE (0x01B):
| Byte  | Field              | Description                    |
|-------|--------------------|---------------------------------|
| 0-1   | Responder ID       | Leader/majority node            |
| 2-5   | Current Epoch      | Current partition epoch         |
| 6-9   | Committed Index    | Current commit index            |
| 10-13 | State Hash         | Hash for integrity check        |
| 14-63 | State Deltas       | Compressed state updates        |


SAFETY DURING RECONCILIATION
────────────────────────────

Critical constraint: Grid stability during reconciliation

Rules:
• Total system power change rate: ≤ 10% per second
• Reintegrating modules: Start at 0%, ramp over 10 seconds
• Conflicting setpoints: Resolve to LOWER power (fail-safe)
• If reconciliation fails: Both partitions freeze, alert operator

Emergency override:
    if reconciliation_timeout_exceeded:
        enter_safe_state()
        alert_l2_supervisor()
        await_manual_intervention()
```

### 11.4 Partition Handling State Machine

```
PARTITION STATE MACHINE (per module)
────────────────────────────────────

         ┌─────────────────┐
         │     HEALTHY     │ ←── Normal operation
         └────────┬────────┘
                  │ Heartbeat loss / suspicion
                  ▼
         ┌─────────────────┐
         │    SUSPECTING   │ ←── Monitoring, not yet partitioned
         └────────┬────────┘
                  │ Suspicion confirmed / quorum check
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│   MAJORITY    │   │   MINORITY    │
│   PARTITION   │   │   PARTITION   │
│ (full ops)    │   │ (frozen)      │
└───────┬───────┘   └───────┬───────┘
        │                   │
        │ Partition heal detected
        │                   │
        └─────────┬─────────┘
                  ▼
         ┌─────────────────┐
         │  RECONCILING    │ ←── State sync in progress
         └────────┬────────┘
                  │ Reconciliation complete
                  ▼
         ┌─────────────────┐
         │     HEALTHY     │
         └─────────────────┘


State transition table:

| From       | Event                    | To          | Action                    |
|------------|--------------------------|-------------|---------------------------|
| HEALTHY    | suspicion > threshold    | SUSPECTING  | Start partition protocol  |
| SUSPECTING | quorum present           | MAJORITY    | Continue with majority    |
| SUSPECTING | quorum lost              | MINORITY    | Freeze operations         |
| MAJORITY   | heal detected            | RECONCILING | Start reconciliation      |
| MINORITY   | heal detected            | RECONCILING | Request state sync        |
| RECONCILING| sync complete            | HEALTHY     | Resume normal operation   |
| RECONCILING| sync timeout             | MINORITY    | Retry or freeze           |
| ANY        | manual reset             | HEALTHY     | Operator intervention     |
```

---

## References and Sources

- [Distributed Controller for Parallel Converters](https://ieeexplore.ieee.org/document/10621445/)
- [Multi-Module Converter Control Strategy](https://ieeexplore.ieee.org/document/131193)
- [Distributed Control for AC/DC Converters](https://ietresearch.onlinelibrary.wiley.com/doi/abs/10.1049/iet-pel.2012.0390)
- [imperix Distributed Converter Control](https://imperix.com/technology/distributed-converter-control/)
- [Reactive Power Coordination](https://www.sciencedirect.com/science/article/pii/S2096511725001203)
- [Raft Consensus Algorithm](https://raft.github.io/)
