# Technical Specifications (Shared Content)

*Use this content for technically-focused grant applications.*

---

## EK-KOR2 RTOS Architecture

### System Overview

```
EK-KOR2 RTOS ARCHITECTURE
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  Fleet Management │ V2G Control │ Monitoring │ Diagnostics  │
├─────────────────────────────────────────────────────────────┤
│                    EK-KOR2 MIDDLEWARE                       │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Potential  │  │  Consensus   │  │   Topology        │  │
│  │   Field     │  │  Protocol    │  │   Manager         │  │
│  │  Scheduler  │  │  (Threshold) │  │   (k=7 mesh)      │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Lock-Free  │  │   Field      │  │   Mesh            │  │
│  │    IPC      │  │  Manager     │  │   Reformation     │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    HARDWARE ABSTRACTION                     │
│     CAN-FD Driver │ Timer │ ADC │ PWM │ GPIO │ Flash       │
├─────────────────────────────────────────────────────────────┤
│                    HARDWARE (STM32G474)                     │
│     ARM Cortex-M4F @ 170MHz │ 512KB Flash │ 128KB RAM      │
└─────────────────────────────────────────────────────────────┘
```

---

## Potential Field Scheduler

### Mathematical Model

```
POTENTIAL FIELD FUNCTION:
═══════════════════════════════════════════════════════════════

For each module i at time t:

    φᵢ(t) = w₁·Lᵢ(t) + w₂·Tᵢ(t) + w₃·Pᵢ(t) + w₄·Eᵢ(t)

Where:
    Lᵢ(t) = Load factor (0-1)
    Tᵢ(t) = Thermal state (normalized)
    Pᵢ(t) = Power availability (normalized)
    Eᵢ(t) = Error/fault state
    wₙ    = Configurable weights

GRADIENT CALCULATION:

    ∇φ = φⱼ - φᵢ  for neighbor j

WORK FLOW RULE:

    Work flows from high φ to low φ
    (Like water flowing downhill)
```

### Implementation Details

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Update rate | 10 Hz | Balance responsiveness vs. overhead |
| Field propagation | 3 hops max | Prevents oscillation |
| Damping factor | 0.7 | Stability (empirically tuned) |
| Weight defaults | [0.4, 0.3, 0.2, 0.1] | Load prioritized |

---

## Consensus Protocol

### Threshold Voting Mechanism

```
CONSENSUS PARAMETERS:
═══════════════════════════════════════════════════════════════

k = 7        (topological neighbors)
f < k/3      (Byzantine fault tolerance = up to 2 failures)
T = 5        (voting threshold for decision)
timeout = 100ms (max round duration)

PROTOCOL FLOW:

1. PROPOSE: Initiator broadcasts proposal to k neighbors
2. VOTE: Each neighbor validates and votes (accept/reject)
3. COMMIT: If votes ≥ T within timeout, commit decision
4. PROPAGATE: Decision spreads through mesh

CONSISTENCY GUARANTEE:
• All correct nodes eventually agree
• No split-brain under network partition
• Graceful degradation with failures
```

### Scale-Free Network Topology

```
k=7 NEIGHBOR SELECTION (Cavagna-Giardina)
═══════════════════════════════════════════════════════════════

Based on starling flock research:
• Birds track exactly 6-7 neighbors regardless of density
• Information propagates optimally at k=7
• Robust to individual failures

IMPLEMENTATION:
• Each node maintains sorted list by signal strength
• Top 7 = active neighbors
• Periodic re-evaluation (every 5 seconds)
• Hysteresis prevents thrashing
```

---

## Lock-Free IPC

### Sequence Counter Pattern

```c
// Writer side
void publish(message_t* msg) {
    atomic_inc(&seq_counter);     // Odd = write in progress
    memcpy(&shared_buffer, msg, sizeof(message_t));
    atomic_inc(&seq_counter);     // Even = write complete
}

// Reader side
bool read(message_t* out) {
    uint32_t seq1 = atomic_load(&seq_counter);
    if (seq1 & 1) return false;   // Write in progress
    memcpy(out, &shared_buffer, sizeof(message_t));
    uint32_t seq2 = atomic_load(&seq_counter);
    return (seq1 == seq2);        // Validate consistency
}
```

### Performance Characteristics

| Metric | Value | Measurement Method |
|--------|-------|-------------------|
| Publish latency | <100ns | Cycle counter on STM32G474 |
| Read latency | <50ns | Cycle counter |
| Memory overhead | 8 bytes/channel | Sequence counter + padding |
| Contention | None | Lock-free by design |

---

## EK3 Power Module Specifications

### Electrical Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| Rated power | 3.3 kW | Continuous |
| Peak power | 4.0 kW | 30 seconds |
| Input voltage | 400-800 VDC | Wide range |
| Output voltage | 200-920 VDC | Battery compatible |
| Efficiency | >97% | At rated load |
| Power factor | >0.99 | With PFC stage |

### Topology: LLC Resonant Converter

```
LLC CONVERTER TOPOLOGY:
═══════════════════════════════════════════════════════════════

     ┌────────────────────────────────────────────────────┐
     │                                                    │
  VIN│   Q1    Q2         Lr        Cr                   │VOUT
  ───┼──┬──┬───┬──┬───────○○○○───────┤├────┬────────────┼───
     │  │  │   │  │                        │             │
     │ ─┴─ │  ─┴─ │     ┌────┐      ┌────┐│    ┌────┐   │
     │ │▲│ │  │▲│ │     │    │      │    ││    │    │   │
     │ └┬┘ │  └┬┘ │     │ Lm │      │ Tx ││    │ Cf │   │
     │  │  │   │  │     │    │      │    ││    │    │   │
     │  └──┴───┴──┴─────┴────┴──────┴────┴┴────┴────┴───│
     │                                                    │
     └────────────────────────────────────────────────────┘

ADVANTAGES:
• ZVS (Zero Voltage Switching) operation
• High efficiency at wide load range
• Low EMI due to soft switching
• Compact magnetics design
```

### Component Selection

| Component | Part Number | Specification |
|-----------|-------------|---------------|
| Primary MOSFETs | Wolfspeed C3M0065100K | 900V SiC, 65mΩ |
| Gate drivers | Silicon Labs Si8271 | Isolated, 4A peak |
| Controller | STM32G474RET6 | 170MHz, HRTIM |
| Current sensor | Allegro ACS37800 | ±30A, isolated |
| Transformer | Custom wound | Planar, 100kHz |

### Mechanical Specifications

| Parameter | Value |
|-----------|-------|
| Dimensions | 200 × 320 × 44 mm |
| Form factor | 1U half-width (rack mount) |
| Weight | 3.5 kg |
| Cooling | Forced air (40mm fans) |
| Connectors | Anderson SB50 (power), RJ45 (CAN) |

---

## Communication Protocol

### CAN-FD Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Nominal bitrate | 500 kbps | Compatibility |
| Data bitrate | 5 Mbps | High throughput |
| Max payload | 64 bytes | CAN-FD standard |
| Message ID scheme | 11-bit standard | Simplicity |

### Message Types

| ID Range | Purpose | Priority |
|----------|---------|----------|
| 0x000-0x0FF | Emergency/Safety | Highest |
| 0x100-0x1FF | Consensus protocol | High |
| 0x200-0x2FF | Field updates | Medium |
| 0x300-0x3FF | Diagnostics | Low |
| 0x400-0x4FF | Configuration | Lowest |

---

## Safety Architecture

### Two-Tier Safety System

```
SAFETY ARCHITECTURE:
═══════════════════════════════════════════════════════════════

LAYER 1 (L1): HARDWARE SAFETY
├── Independent safety MCU (STM32G071)
├── Monitors: voltage, current, temperature
├── Direct contactor control
├── Response time: <10μs
└── Cannot be overridden by software

LAYER 2 (L2): SOFTWARE SAFETY
├── Main MCU (STM32G474)
├── Graceful degradation logic
├── Predictive fault detection
├── Logging and diagnostics
└── Coordinates with L1

INDEPENDENCE:
• L1 and L2 have separate power domains
• L1 can disconnect power without L2
• L1 uses hardware comparators (no software)
```

### Certification Path

| Standard | Scope | Timeline |
|----------|-------|----------|
| IEC 61508 | Functional safety | 18 months |
| ISO 26262 | Automotive (ASIL-B target) | 24 months |
| UL 2202 | EV charging equipment | 12 months |
| CE marking | EU market access | 6 months |

---

## Test Coverage

### EK-KOR2 RTOS Tests

| Category | Tests | Status |
|----------|-------|--------|
| Scheduler unit tests | 8 | All passing |
| Consensus protocol | 6 | All passing |
| IPC mechanisms | 4 | All passing |
| Topology management | 4 | All passing |
| **Total** | **22** | **All passing** |

### Simulation Coverage

| Scenario | Nodes | Duration | Result |
|----------|-------|----------|--------|
| Normal operation | 100 | 24h simulated | Pass |
| Node failures | 100 | 100 failures injected | Self-healed |
| Network partition | 50+50 | 1h partition | Reconverged |
| Byzantine faults | 100 | 10 malicious nodes | Tolerated |

---

*Last updated: January 2026*
*Version: 1.0*
