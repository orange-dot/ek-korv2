# SWARM CORE: Core Spec (Draft)

## Document Information

| Field | Value |
|---|---|
| Document ID | EK-TECH-027 |
| Version | 0.1 |
| Date | 2026-01-05 |
| Status | DRAFT |
| Author | Elektrokombinacija Engineering |

---

## 1. Purpose

SWARM CORE is the shared coordination core for the entire JEZGRO product family.
The goal is that all devices (EK3, BAT, ROB, GW, RACK) use the same principles
and interfaces for local decisions that yield stable and optimal global behavior.

---

## 2. Scope

SWARM CORE defines:
- Minimal feature set for swarm coordination (discovery, health, coordination, allocation)
- Unified state and message model for JEZGRO services and CAN-FD network
- Algorithmic principles (quorum, stigmergy, topological coordination, feedback loops)
- Metrics, constraints, and acceptance criteria

SWARM CORE does NOT define:
- Concrete implementation of device-specific logic (LLC, BMS, motion)
- Cloud backend or centralized optimization
- Hardware details outside JEZGRO standards

---

## 3. Definitions

- Agent: device with local state and rules (JEZGRO service ROJ_COORD).
- Swarm: set of agents exchanging minimal information for coordination.
- Quorum: threshold of active votes that triggers a decision without full consensus.
- Stigmergy: indirect coordination via environment traces (tags with TTL).
- Topological neighbors: fixed number of nearest/known peers (k-neighbors), not distance-based.
- Policy: parameter set that shapes swarm behavior (k, decay, quorum).

---

## 4. System Model

Each JEZGRO device runs ROJ_COORD service that uses the SWARM CORE library.
Communication flows over IPC (local) and CAN-FD (network). The swarm is decentralized.

```
[JEZGRO DEVICE]
  - ROJ_COORD (uses SWARM CORE)
  - Device Services (LLC, BMS, Motion, V2G)
  - IPC <-> CAN-FD bridge
```

---

## 5. Core Principles

- Local rules -> global behavior (emergence)
- Positive and negative feedback (amplification + stabilization)
- Quorum for fast decisions with acceptable quality
- Stigmergy to reduce traffic and enable implicit coordination
- Topological coordination to stay stable under density changes
- Graceful degradation: system keeps operating after agent loss

---

## 6. Functional Capabilities (MVP)

1) Auto-discovery and agent identity
2) Periodic health sharing
3) Task and resource allocation
4) Quorum decisions (vote + stop signals)
5) Stigmergic tags with TTL and decay
6) Local anomaly isolation (quarantine)

---

## 7. Interfaces

### 7.1 JEZGRO IPC
- Message types: ROJ_HEARTBEAT, ROJ_STATE, ROJ_TASK, ROJ_VOTE, ROJ_TAG
- IPC payload format: JEZGRO standard 64B message

### 7.2 CAN-FD
- CAN-FD messages mapped 1:1 to IPC types
- Priority message: ROJ_ALERT (fault, isolation, quorum decision)

### 7.3 Device Services
- LLC/BMS/Motion/V2G services expose local metrics
- SWARM CORE returns recommendations: setpoints, allocation, standby

---

## 8. Minimal State Model

```
NodeState:
  - node_id, role, status
  - capabilities (power, thermal, storage, motion)
  - metrics (temp, load, soc, health)
  - trust_score, last_seen

Policy:
  - k_neighbors
  - quorum_min, quorum_ratio
  - decay_half_life_ms
  - gossip_period_ms
  - isolation_threshold

Tag (stigmergy):
  - tag_id, type, value, ttl_ms, origin
```

---

## 9. Algorithmic Minimum

- Topological neighbor selection: k=6..7 (default)
- Quorum: max(quorum_min, quorum_ratio * active_nodes)
- Pheromone/Tag decay: exponential decay with half-life
- Cross-inhibition: negative votes slow competing decisions
- Exploration noise: small randomness to avoid local optima

---

## 10. Non-Functional Requirements

- Deterministic behavior in real-time constraints
- Minimal CPU/RAM overhead per agent
- Scale: >= 20 agents per CAN segment without degradation
- Security: message authentication, isolation of suspicious agents

---

## 11. Acceptance Criteria

- Swarm remains operational after 30% agent loss
- Quorum decision in < 500ms under normal load
- Tag/pheromone mechanism stabilizes system without central command
- Integration with JEZGRO services without API changes
- One policy profile works across EK3, BAT, and ROB variants

---

## 12. Related Documents

- tehnika/konceptualno/en/02-roj-intelligence.md
- tehnika/inzenjersko/en/16-jezgro.md
- tehnika/inzenjersko/en/21-jezgro-product-family.md
