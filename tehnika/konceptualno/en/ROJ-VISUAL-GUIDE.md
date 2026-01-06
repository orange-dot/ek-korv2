# ROJ: Distributed Intelligence Visual Guide

**Document ID:** EK-VIS-001
**Version:** 1.0
**Date:** 2026-01-05

---

## 1. What is ROJ?

**ROJ** (Serbian: "roj" = swarm, as in bee swarm) is Elektrokombinacija's distributed intelligence system. Just as JEZGRO names our microkernel OS, ROJ names our swarm coordination layer.

### Philosophy

> "Simple rules at the individual level create complex optimal behavior at the system level."

Each module is autonomous. No central controller. Peer-to-peer coordination.

```mermaid
flowchart LR
    subgraph Traditional["Traditional: Central Controller"]
        CC[Central<br/>Controller]
        M1a[Module 1]
        M2a[Module 2]
        M3a[Module 3]
        M4a[Module 4]
        CC --> M1a
        CC --> M2a
        CC --> M3a
        CC --> M4a
    end

    subgraph ROJ["ROJ: Distributed Intelligence"]
        M1b[Module 1<br/>+ AI]
        M2b[Module 2<br/>+ AI]
        M3b[Module 3<br/>+ AI]
        M4b[Module 4<br/>+ AI]
        M1b <--> M2b
        M2b <--> M3b
        M3b <--> M4b
        M4b <--> M1b
        M1b <--> M3b
        M2b <--> M4b
    end

    style CC fill:#ff6b6b,color:#fff
    style M1b fill:#4ecdc4,color:#fff
    style M2b fill:#4ecdc4,color:#fff
    style M3b fill:#4ecdc4,color:#fff
    style M4b fill:#4ecdc4,color:#fff
```

**Key Difference:**
- Traditional: Single point of failure, controller bottleneck
- ROJ: No single point of failure, direct peer communication

---

## 2. Module Roles & Leader Election

Modules dynamically take on roles. Leader election uses Raft consensus.

### Role Transitions

```mermaid
stateDiagram-v2
    [*] --> Follower: Power On

    Follower --> Candidate: Election Timeout<br/>(150-300ms)
    Candidate --> Leader: Majority Votes
    Candidate --> Follower: Higher Term<br/>Discovered
    Leader --> Follower: Higher Term<br/>Discovered

    Follower --> Standby: Low Demand
    Standby --> Follower: Demand Increase

    Leader --> [*]: Shutdown
    Follower --> [*]: Shutdown
    Standby --> [*]: Shutdown

    state Follower {
        [*] --> Active
        Active --> Processing: Command
        Processing --> Active: Complete
    }

    state Leader {
        [*] --> Coordinating
        Coordinating --> Broadcasting: State Update
        Broadcasting --> Coordinating: ACK
    }
```

### Role Responsibilities

| Role | Count | Responsibilities |
|------|-------|-----------------|
| **Leader** | 1 | Aggregate system state, assign loads, coordinate |
| **Follower** | N-1 | Local optimization, report status, vote |
| **Standby** | 0+ | Reduced power, hot spare, ready to activate |

---

## 3. Communication Protocol

ROJ uses CAN-FD at 5 Mbps for all inter-module communication.

### Message Flow

```mermaid
sequenceDiagram
    participant L as Leader
    participant F1 as Follower 1
    participant F2 as Follower 2
    participant F3 as Follower 3

    Note over L,F3: Normal Operation (1 Hz)

    L->>F1: HEARTBEAT
    L->>F2: HEARTBEAT
    L->>F3: HEARTBEAT

    F1-->>L: STATUS (T=45°C, P=3.1kW)
    F2-->>L: STATUS (T=52°C, P=3.2kW)
    F3-->>L: STATUS (T=48°C, P=3.0kW)

    Note over L,F3: Thermal Share (10 Hz)

    L->>F1: THERMAL_SHARE (reduce F2)
    L->>F2: THERMAL_SHARE (reduce 10%)
    L->>F3: THERMAL_SHARE (increase 5%)

    Note over L,F3: Fault Event

    F2--xL: FAULT_ALERT (OVT)
    L->>F1: POWER_COMMAND (+15%)
    L->>F3: POWER_COMMAND (+15%)

    Note over F2: F2 enters standby
```

### Message Types

| Type | ID | Frequency | Priority | Purpose |
|------|------|-----------|----------|---------|
| `HEARTBEAT` | 0x1xx | 1 Hz | Medium | Presence detection |
| `POWER_COMMAND` | 0x2xx | On-demand | High | Power redistribution |
| `SYNC` | 0x0xx | 100 Hz | Highest | Time/grid sync |
| `THERMAL_SHARE` | 0x3xx | 10 Hz | Medium | Thermal coordination |
| `FAULT_ALERT` | 0x7FF | Event | Critical | Emergency notification |
| `ELECTION` | 0x010 | Event | High | Leader election |

---

## 4. Distributed Load Balancing

Two mechanisms work together: hardware-based droop control and AI-enhanced optimization.

### Droop Control (Hardware)

```mermaid
flowchart TD
    subgraph Droop["Droop Control Loop"]
        V[Measure Bus Voltage]
        C[Compare to Reference]
        D{ΔV > threshold?}
        INC[Increase Power]
        DEC[Decrease Power]
        HOLD[Hold Power]

        V --> C
        C --> D
        D -->|V < Vref| INC
        D -->|V > Vref| DEC
        D -->|V ≈ Vref| HOLD
        INC --> V
        DEC --> V
        HOLD --> V
    end

    subgraph Formula["Formula"]
        F["P_out = P_rated × (V_ref - V_actual) / ΔV_droop"]
    end
```

**Natural Self-Balancing:** Higher bus voltage → Higher power output. No communication needed.

### AI-Enhanced Optimization

```mermaid
flowchart LR
    subgraph Inputs["Optimization Inputs"]
        T[Temperature]
        E[Efficiency Curves]
        H[Health/Wear Data]
        P[Predicted Failures]
    end

    subgraph AI["AI Optimizer"]
        O[Distributed<br/>Consensus]
    end

    subgraph Outputs["Optimization Goals"]
        TH[Thermal Balance]
        EF[System Efficiency]
        LB[Lifetime Balance]
        FA[Fault Anticipation]
    end

    T --> O
    E --> O
    H --> O
    P --> O

    O --> TH
    O --> EF
    O --> LB
    O --> FA

    style O fill:#3b82f6,color:#fff
```

---

## 5. Thermal Migration

Heat "flows" from hot modules to cooler ones through load redistribution.

```mermaid
flowchart LR
    subgraph Before["Before Thermal Migration"]
        B1["M1: 45°C<br/>3.3 kW"]
        B2["M2: 65°C<br/>3.3 kW"]
        B3["M3: 48°C<br/>3.3 kW"]
    end

    subgraph After["After Thermal Migration"]
        A1["M1: 50°C<br/>3.6 kW"]
        A2["M2: 55°C<br/>2.4 kW"]
        A3["M3: 52°C<br/>3.9 kW"]
    end

    Before --> |"ROJ<br/>Optimization"| After

    style B2 fill:#ff6b6b,color:#fff
    style A1 fill:#4ecdc4,color:#fff
    style A2 fill:#f9ca24,color:#000
    style A3 fill:#4ecdc4,color:#fff
```

**Result:** Temperature spread reduced from 20°C to 5°C. Hot module protected from thermal stress.

---

## 6. Fault Tolerance & Self-Healing

### Module Lifecycle

```mermaid
stateDiagram-v2
    [*] --> BOOT: Power On
    BOOT --> DISCOVERING: Self-Test Pass
    DISCOVERING --> SYNCHRONIZING: Network Found
    SYNCHRONIZING --> STANDBY: PLL Lock
    STANDBY --> ACTIVE: Power Command
    ACTIVE --> DEGRADED: Minor Fault
    DEGRADED --> ACTIVE: Fault Cleared
    DEGRADED --> FAULT: Major Fault
    ACTIVE --> FAULT: Critical Fault
    FAULT --> STANDBY: Reset + Clear

    ACTIVE --> STANDBY: Low Demand
    STANDBY --> ACTIVE: High Demand

    BOOT --> [*]: Self-Test Fail
    FAULT --> [*]: Unrecoverable
```

### Fault Response Sequence

```mermaid
sequenceDiagram
    participant M as Faulty Module
    participant L as Leader
    participant P1 as Peer 1
    participant P2 as Peer 2
    participant P3 as Peer 3

    Note over M: Fault Detected (OVT)

    M->>M: Reduce Power 50%
    M->>L: FAULT_ALERT (thermal)

    L->>L: Calculate redistribution

    par Redistribute Load
        L->>P1: POWER_COMMAND (+20%)
        L->>P2: POWER_COMMAND (+20%)
        L->>P3: POWER_COMMAND (+10%)
    end

    P1-->>L: ACK
    P2-->>L: ACK
    P3-->>L: ACK

    Note over M,P3: Total power maintained<br/>Response time: <100ms

    alt Fault Clears
        M->>L: STATUS (normal)
        L->>M: POWER_COMMAND (resume)
    else Fault Persists
        M->>M: Enter STANDBY
        L->>L: Mark M as spare
    end
```

### Recovery Times

| Event | Detection | Response | Total |
|-------|-----------|----------|-------|
| Module fault | <1 ms | <100 ms | <100 ms |
| Leader failure | 150-300 ms | <100 ms | <400 ms |
| Communication loss | 50 ms | Immediate (droop) | <50 ms |

---

## 7. Scalability

ROJ scales from small systems to large installations using hierarchical coordination.

```mermaid
flowchart BT
    subgraph L1["Level 1: Module ROJs (≤20 each)"]
        R1[ROJ Cluster 1<br/>20 modules]
        R2[ROJ Cluster 2<br/>20 modules]
        R3[ROJ Cluster 3<br/>20 modules]
        R4[ROJ Cluster 4<br/>20 modules]
    end

    subgraph L2["Level 2: ROJ-of-ROJs"]
        RR[Meta-ROJ<br/>Coordinates Clusters]
    end

    subgraph L3["Level 3: Site Controller"]
        SC[Site Controller<br/>Fleet Integration]
    end

    R1 --> RR
    R2 --> RR
    R3 --> RR
    R4 --> RR

    RR --> SC

    style SC fill:#9b59b6,color:#fff
    style RR fill:#3498db,color:#fff
    style R1 fill:#2ecc71,color:#fff
    style R2 fill:#2ecc71,color:#fff
    style R3 fill:#2ecc71,color:#fff
    style R4 fill:#2ecc71,color:#fff
```

### Scaling Limits

| Level | Scope | Max Modules | Communication |
|-------|-------|-------------|---------------|
| **L1** | Single CAN segment | 20 | Direct CAN-FD |
| **L2** | CAN bridge | 100 | CAN-FD bridged |
| **L3** | Site-wide | 1000+ | Ethernet + CAN |

---

## 8. Emergent Behaviors

Simple local rules create complex optimal system behavior.

```mermaid
mindmap
  root((ROJ<br/>Emergent<br/>Behaviors))
    Load Following
      Tracks load changes automatically
      No central command needed
      Sub-second response
    Thermal Migration
      Heat flows to cooler modules
      Prevents hot spots
      Extends lifetime
    Fault Absorption
      Seamless ride-through
      Automatic redistribution
      No service interruption
    Efficiency Seeking
      Load concentrates on efficient modules
      System efficiency maximized
      Dynamic rebalancing
    Self Organization
      New modules auto-integrate
      Failed modules auto-excluded
      Network self-heals
```

---

## 9. Battery ROJ Extension

ROJ extends to battery modules for fleet-wide coordination.

### Fleet Battery Pool

```mermaid
flowchart TD
    subgraph Fleet["Bus Fleet (50 vehicles)"]
        B1[Bus 1<br/>SOC: 80%]
        B2[Bus 2<br/>SOC: 45%]
        B3[Bus 3<br/>SOC: 92%]
        BN[Bus N<br/>SOC: 67%]
    end

    subgraph Station["Swap Station"]
        SP[Spare Pool<br/>12 batteries]
        CH[Charging Bays<br/>8 positions]
    end

    subgraph ROJ["Battery ROJ"]
        BC[Battery<br/>Coordinator]
    end

    B1 <--> BC
    B2 <--> BC
    B3 <--> BC
    BN <--> BC

    BC <--> SP
    BC <--> CH

    style BC fill:#3b82f6,color:#fff
```

### V2G Virtual Power Plant

```mermaid
flowchart LR
    subgraph Grid["Power Grid"]
        G[Grid<br/>Operator]
    end

    subgraph VPP["Virtual Power Plant"]
        AGG[ROJ<br/>Aggregator]
    end

    subgraph Batteries["Battery Fleet"]
        B1[Battery 1<br/>Discharge]
        B2[Battery 2<br/>Charge]
        B3[Battery 3<br/>Idle]
        B4[Battery 4<br/>Discharge]
    end

    G <-->|"Frequency<br/>Regulation"| AGG
    G <-->|"Price<br/>Signals"| AGG

    AGG <--> B1
    AGG <--> B2
    AGG <--> B3
    AGG <--> B4

    style AGG fill:#9b59b6,color:#fff
    style G fill:#e74c3c,color:#fff
    style B1 fill:#2ecc71,color:#fff
    style B2 fill:#f39c12,color:#fff
    style B4 fill:#2ecc71,color:#fff
```

### Battery ROJ Benefits

| Behavior | Mechanism | Benefit |
|----------|-----------|---------|
| **SOC Equalization** | Cross-battery load sharing | Uniform wear |
| **Thermal Load Shifting** | Hot batteries rest | Extended life |
| **Health-Based Selection** | Degraded batteries avoid deep cycles | Protected investment |
| **Predictive Positioning** | Batteries pre-staged for routes | Faster swaps |
| **V2G Participation** | Fleet as virtual power plant | Revenue generation |

---

## 10. Bill of Materials (ROJ per module)

| Component | Part | Qty | Unit Price | Total |
|-----------|------|-----|-----------|-------|
| CAN-FD Transceiver | TJA1443 | 1 | €3.00 | €3.00 |
| Termination Resistor | 120Ω 0805 | 2 | €0.10 | €0.20 |
| CAN Connector | M12 5-pin | 2 | €5.00 | €10.00 |
| CAN Cable | 5m shielded | 1 | €10.00 | €10.00 |
| Status LED | RGB 3mm | 1 | €1.00 | €1.00 |
| ID Switch | 4-pos DIP | 1 | €1.00 | €1.00 |
| **TOTAL** | | | | **€25.20** |

---

## References

1. Ongaro, D., & Ousterhout, J. (2014). "In Search of an Understandable Consensus Algorithm" (Raft)
2. Guerrero, J.M., et al. (2011). "Hierarchical Control of Droop-Controlled AC and DC Microgrids"
3. IEEE 2030.5 - Smart Energy Profile 2.0
4. CAN in Automation (CiA) 301 - CANopen Application Layer

---

*Document: EK-VIS-001 | ROJ Visual Guide | v1.0*
