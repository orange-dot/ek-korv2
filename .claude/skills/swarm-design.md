# Skill: swarm-design

Swarm intelligence design for EK3 module coordination.

## When to Use

- For load balancing algorithms
- For fault tolerance design
- For leader election protocols

## Swarm Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SWARM NETWORK                             │
│                                                              │
│   ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐             │
│   │ EK3  │◄──►│ EK3  │◄──►│ EK3  │◄──►│ EK3  │    ...      │
│   │  #1  │    │  #2  │    │  #3  │    │  #4  │             │
│   │      │    │      │    │LEADER│    │      │             │
│   └──────┘    └──────┘    └──────┘    └──────┘             │
│       │           │           │           │                  │
│       └───────────┴───────────┴───────────┘                  │
│                       CAN-FD @ 5 Mbps                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Message Types (CAN-FD)

```
HEARTBEAT (1 Hz):
  ID: 0x100 + node_id
  Data: [status, power, temp, health_score]

POWER_COMMAND:
  ID: 0x200 + node_id
  Data: [target_power, ramp_rate]

ELECTION:
  ID: 0x080 (high priority)
  Data: [term, candidate_id, vote]

FAULT_ALERT:
  ID: 0x050 (highest priority)
  Data: [fault_code, node_id, timestamp]
```

## Load Balancing

### Wide Striping (3PAR-inspired)
```
Total demand: 100 kW
Modules: 50 (165 kW capacity)

Traditional: 30 modules @ 100%, 20 idle
Wide stripe: 50 modules @ 60% each

Benefits:
- Uniform thermal load
- Uniform aging
- Higher efficiency (sweet spot)
- No single point of failure
```

### Droop Control (Fallback)
```
If CAN-FD fails:
  Each module: P = P_max × (1 - k × (V - V_ref))

  k = droop coefficient
  Natural load sharing without communication
```

## Leader Election (Raft-inspired)

```
States: FOLLOWER → CANDIDATE → LEADER

Timeouts:
  Heartbeat: 100ms
  Election: 150-300ms (random)

Election triggers:
  - Leader heartbeat timeout
  - Split-brain recovery
  - New module added

Leader responsibilities:
  - Load allocation
  - Fault coordination
  - External interface
```

## Fault Tolerance

```
Failure detection:
  - Missing heartbeat (3× timeout)
  - Anomaly score threshold
  - Hardware fault flags

Recovery:
  T+0ms:    Fault detected
  T+10ms:   Leader notified
  T+50ms:   Load redistributed
  T+100ms:  New steady state

Capacity impact:
  1/303 modules = 0.33% loss
  System continues operating
```

## Files

- `tehnika/05-swarm-intelligence.md`
- `patent/03-TECHNICAL-SUPPORT/CONTROL-SYSTEM-ARCHITECTURE.md`

## Example

```
/swarm-design load-balancing 303-modules
```