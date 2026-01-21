# Technology Overview (Shared Content)

*Use this content across all grant applications. Adapt tone/depth per program.*

---

## One-Paragraph Summary

Elektrokombinacija is developing EK-KOR2, an open-source Real-Time Operating System (RTOS) for distributed power electronics coordination. Unlike existing proprietary solutions that rely on central coordinators, EK-KOR2 uses a novel **potential field scheduling** algorithm where modules self-organize through gradient flow - similar to how biological swarms coordinate without central control. Combined with the EK3 modular power electronics platform (3.3kW units that combine for any power level), this enables scalable, fault-tolerant charging infrastructure for electric vehicle fleets.

---

## Technical Innovation

### 1. Potential Field Scheduling (Novel)

```
TRADITIONAL APPROACH:          OUR APPROACH:
═══════════════════════════════════════════════════════════════

    Central                    No Central
   Coordinator                 Coordinator
       │
       ▼                      Module 1    Module 2    Module 3
   ┌───────┐                  [0.5 load]  [0.3 load]  [0.7 load]
   │ SPOF  │                      │           │           │
   └───┬───┘                      └───────────┴─────┬─────┘
       │                                            │
   ┌───┴───┐                              Gradient Flow
   │       │                         (emergent coordination)
Module Module Module
   1     2     3              Work flows to lowest-load nodes
                              automatically - no coordinator
```

**Mathematical Foundation:**
- Based on Khatib's 1986 artificial potential fields (robot navigation)
- Adapted from spatial navigation to temporal task scheduling
- Each module publishes state as "field" (load, thermal, power availability)
- Work flows along gradients like water flowing downhill
- Emergent coordination without central point of failure

### 2. Distributed Consensus Protocol

```
k=7 TOPOLOGICAL NEIGHBORS (Scale-Free Network)
═══════════════════════════════════════════════════════════════

Based on Cavagna & Giardina's starling flock research:
• Each node maintains exactly k=7 neighbors
• Optimal for information propagation vs overhead
• Threshold voting for distributed decisions
• Byzantine fault tolerance (survives f < k/3 failures)
• Self-healing mesh topology
```

### 3. Lock-Free Inter-Process Communication

```
SEQUENCE COUNTER PATTERN
═══════════════════════════════════════════════════════════════

Writer increments before/after write
Reader validates consistency via counter match
Result: <100ns publish latency, zero blocking

No mutexes, no priority inversion, deterministic timing
```

### 4. EK3 Modular Power Electronics

```
SINGLE MODULE SPECIFICATIONS:
═══════════════════════════════════════════════════════════════
• Power: 3.3 kW (bidirectional)
• Topology: LLC resonant converter (ZVS operation)
• MOSFETs: 900V SiC (Wolfspeed C3M0065100K)
• Controller: STM32G474 (Cortex-M4F, 170MHz)
• Communication: CAN-FD @ 5 Mbps
• Efficiency: >97% target
• Dimensions: 200×320×44mm (1U half-width)
• Weight: 3.5 kg

SCALING:
• 1 module = 3.3 kW (e-bike)
• 7 modules = 23 kW (home)
• 46 modules = 150 kW (DC fast)
• 303 modules = 1 MW (bus depot)
• 909 modules = 3 MW (MCS megawatt charging)
```

---

## Technology Readiness Level (TRL)

| Component | Current TRL | Target TRL (18mo) |
|-----------|-------------|-------------------|
| EK-KOR2 RTOS (C) | TRL 4 | TRL 6 |
| Potential field scheduler | TRL 4 | TRL 6 |
| Consensus protocol | TRL 4 | TRL 5 |
| EK3 power design | TRL 3 | TRL 5 |
| Fleet simulator | TRL 5 | TRL 6 |
| CAN-FD protocol | TRL 4 | TRL 6 |

**TRL Definitions:**
- TRL 3: Proof of concept
- TRL 4: Lab validation
- TRL 5: Relevant environment validation
- TRL 6: Prototype demonstration

---

## Validation Status

### What Has Been Proven

| Claim | Evidence |
|-------|----------|
| Potential field scheduling works | 22 test vectors passing, dual C/Rust implementation |
| Consensus converges | Property-based testing, 100+ node simulations |
| Lock-free IPC achieves <100ns | Benchmark measurements |
| k=7 topology is optimal | Based on peer-reviewed Cavagna/Giardina research |
| EK3 design is feasible | Complete specifications, BOM, thermal analysis |

### What Remains to Be Proven

| Risk | Mitigation | Timeline |
|------|------------|----------|
| Real-time performance at scale | Hardware-in-loop testing | 6 months |
| Hardware certification (IEC 61508) | Safety analysis, certified components | 12 months |
| Community adoption | Open-source launch, developer relations | 12 months |
| Thermal management in production | Prototype testing, thermal chamber | 9 months |

---

## External Validation

### Infineon Technologies Partnership
- Engaged for emulator development collaboration
- Source code shared for review
- NDA in progress for timing specifications
- Significance: €50B semiconductor giant validates technical approach

### Academic Collaboration
- PhD advisor (distributed systems, Western Europe)
- Research collaboration on MAPF-HET algorithms
- Publication targets: ICRA, IROS, IEEE TSG

---

## Differentiation

| Aspect | Existing Solutions | EK-KOR2 |
|--------|-------------------|---------|
| Architecture | Central coordinator | Distributed, no SPOF |
| Scheduling | Priority-based, static | Potential field, adaptive |
| Failure handling | Manual intervention | Self-healing mesh |
| Scalability | Limited by coordinator | Linear to 1000+ nodes |
| Licensing | Proprietary, per-unit | Open source (MIT) |
| Vendor lock-in | High | None |

---

## Open Source Strategy

### Licensing Model

```
LAYERED OPEN SOURCE (Android/Linux Model)
═══════════════════════════════════════════════════════════════

LAYER 1 - FULLY OPEN (MIT License):
├── EK-KOR2 RTOS core
├── Scheduling algorithms
├── Consensus protocols
├── Reference implementations
└── Documentation & tools

LAYER 2 - OPEN HARDWARE:
├── EK3 module schematics
├── PCB designs
├── BOM lists
└── Manufacturing guides

LAYER 3 - CERTIFIED PRODUCTS (Revenue):
├── Pre-certified EK3 modules
├── Safety-certified firmware
├── Fleet management platform
└── Support & services
```

### Community Building Plan
- GitHub repository (public)
- Developer documentation
- Reference hardware designs
- Contribution guidelines
- Regular releases

---

*Last updated: January 2026*
*Version: 1.0*
