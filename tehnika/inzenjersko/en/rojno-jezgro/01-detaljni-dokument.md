# SWARM CORE: Detailed Document (for further development)

## Document Information

| Field | Value |
|---|---|
| Document ID | EK-TECH-028 |
| Version | 0.1 |
| Date | 2026-01-05 |
| Status | DRAFT |
| Author | Elektrokombinacija Engineering |

---

## 1. Context and Goals

SWARM CORE is a shared implementation of swarm principles for the JEZGRO family.
This document expands architecture, data, protocols, and algorithms needed for
robust coordination without centralized control.

Primary goals:
- One coordination model for EK3, BAT, ROB, GW, and RACK
- Minimal traffic with maximum stability
- Predictable behavior in RT environments
- Fault isolation and security at swarm level

---

## 2. System Architecture

### 2.1 Layers

```
+-----------------------------------------------------+
| SWARM CORE (shared library + ROJ_COORD service)     |
|  - Policy Engine                                   |
|  - Quorum Engine                                   |
|  - Stigmergy Store                                 |
|  - Task Allocator                                  |
|  - Health/Trust                                    |
+-------------------- IPC / CAN-FD ------------------+
| JEZGRO Kernel + Device Services (LLC/BMS/Motion)    |
+-----------------------------------------------------+
```

### 2.2 Components

- Policy Engine: stores parameters and selects behavior mode (explore/exploit)
- Quorum Engine: drives decisions and cross-inhibition
- Stigmergy Store: local tag map with TTL and decay
- Task Allocator: task/resource distribution
- Health/Trust: anomaly detection and isolation
- IO Adapter: IPC <-> CAN-FD mapping

---

## 3. Data Model

### 3.1 NodeState

```
struct roj_node_state {
  uint16_t node_id;
  uint8_t  role;           // LEADER/FOLLOWER/STANDBY
  uint8_t  status;         // ACTIVE/DEGRADED/ISOLATED
  uint16_t capability_flags;
  int16_t  temp_c_x10;
  uint16_t load_pct;
  uint16_t soc_pct;
  uint16_t health_pct;
  uint16_t trust_pct;
  uint32_t last_seen_ms;
};
```

### 3.2 Policy

```
struct roj_policy {
  uint8_t  k_neighbors;
  uint8_t  quorum_min;
  uint8_t  quorum_ratio_pct;
  uint16_t gossip_period_ms;
  uint16_t heartbeat_period_ms;
  uint16_t tag_ttl_ms;
  uint16_t decay_half_life_ms;
  uint8_t  isolation_threshold_pct;
  uint8_t  exploration_noise_pct;
};
```

### 3.3 Stigmergy Tag

```
struct roj_tag {
  uint16_t tag_id;
  uint8_t  type;          // RESOURCE, ROUTE, ALERT, TASK
  int32_t  value;
  uint32_t ttl_ms;
  uint16_t origin_id;
};
```

---

## 4. Protocols and Messages

### 4.1 Message Categories

- ROJ_HEARTBEAT: presence + basic metrics
- ROJ_STATE: extended state snapshot
- ROJ_TASK_CLAIM: claim/request for task
- ROJ_VOTE: quorum vote
- ROJ_TAG: stigmergy tag
- ROJ_ALERT: critical notifications

### 4.2 CAN-FD Mapping Proposal

| Type | ID range | Period | Payload |
|---|---|---|---|
| ROJ_HEARTBEAT | 0x510 + node_id | 1-2 Hz | status, temp, load, health |
| ROJ_STATE | 0x520 + node_id | 0.5 Hz | capabilities, soc, trust |
| ROJ_TASK_CLAIM | 0x540 | on-demand | task_id, node_id, score |
| ROJ_VOTE | 0x550 | on-demand | decision_id, vote, weight |
| ROJ_TAG | 0x560 | 1-5 Hz | tag_id, type, value, ttl |
| ROJ_ALERT | 0x5FF | event | code, node_id, data |

NOTE: IPC messages map to the same types (JEZGRO 64B payload).

---

## 5. Algorithms

### 5.1 Topological Coordination

- Each agent keeps a list of k neighbors (default k=6..7)
- List refresh uses link quality and freshness of state
- If k neighbors are unavailable, fill with random peers

### 5.2 Quorum Decisions

- Minimum threshold: quorum_min
- Dynamic threshold: quorum_ratio * active_nodes
- Cross-inhibition: opposite votes reduce decision weight

Pseudo-logic:
```
if votes_yes >= Q and votes_yes > votes_no:
  decision = ACCEPT
elif timeout and votes_yes < Q:
  decision = REJECT
```

### 5.3 Stigmergy (tag + decay)

- Tags are shared periodically and stored locally
- Decay: tag.value(t+dt) = tag.value(t) * exp(-dt / tau)
- TTL expiry removes tag

### 5.4 Task Allocation

- Score = f(health, load, temp, soc, proximity)
- Task claim sent only if score is under threshold
- If multiple claims arrive, quorum selects winner

### 5.5 Local Stability

- Positive feedback: tags and success amplify next decisions
- Negative feedback: decay and timeouts prevent lock-in
- Exploration noise: low randomness (1-3%) to avoid local optima

---

## 6. State Machines

### 6.1 Node State

```
BOOT -> JOINING -> SYNC -> ACTIVE -> DEGRADED -> RECOVERY
                  |                 |
                  +----> ISOLATED <-+
```

- JOINING: discovery and policy sync
- SYNC: time and baseline state sync
- ACTIVE: normal swarm coordination
- DEGRADED: reduced function, still in swarm
- ISOLATED: temporarily removed due to anomaly
- RECOVERY: returns to active state

### 6.2 Task Lifecycle

```
PROPOSE -> CLAIM -> VOTE -> ASSIGN -> EXECUTE -> COMPLETE
```

---

## 7. Configuration and Profiles

### 7.1 Default Profile

```
Policy:
  k_neighbors = 6
  quorum_min = 3
  quorum_ratio_pct = 60
  heartbeat_period_ms = 1000
  gossip_period_ms = 500
  tag_ttl_ms = 5000
  decay_half_life_ms = 2000
  isolation_threshold_pct = 30
  exploration_noise_pct = 2
```

### 7.2 Variant Profiles (examples)

- JEZGRO-EK3: focus on load/thermal
- JEZGRO-BAT: focus on SOC/SOH and V2G participation
- JEZGRO-ROB: focus on motion coordination and safety zones
- JEZGRO-GW: focus on grid signals and priorities

---

## 8. Security and Integrity

- Message authentication (CMAC/HMAC) on CAN-FD
- Per-node trust score, decays on anomalies
- Quarantine for suspicious behavior
- Rate limiting on critical messages

---

## 9. Observability

- Event log: JOIN, LEAVE, QUORUM_DECISION, ISOLATED
- Metrics: convergence_time, message_rate, stability_score
- Export: via CAN-FD or diagnostic gateway

---

## 10. Testing and Simulation

- Unit: policy, quorum, decay
- Integration: 5-20 agents, fault injection
- HIL: JEZGRO + CAN-FD lab tests
- Simulation: synthetic networks (densities 5-100)

Validation metrics:
- time_to_quorum
- load_balance_error
- recovery_time
- false_isolation_rate

---

## 11. Implementation Phases

1) Phase A: core data model + IPC messages
2) Phase B: quorum + task claim
3) Phase C: stigmergy + decay
4) Phase D: trust/isolation
5) Phase E: per-variant profiling

---

## 12. Open Questions

- What is the minimal metrics set that works across all variants?
- How to map trust/isolation into safety certification?
- Is dual-bus (CAN-A/CAN-B) required for all variants?

---

## 13. Related Documents

- tehnika/konceptualno/en/02-roj-intelligence.md
- tehnika/inzenjersko/en/16-jezgro.md
- tehnika/inzenjersko/en/21-jezgro-product-family.md
