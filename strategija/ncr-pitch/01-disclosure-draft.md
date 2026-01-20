# Side Project Disclosure: Elektrokombinacija

> **Purpose**: Transparency about a personal side project
> **From**: [Your Name]
> **Date**: January 2026

---

## Summary

I'm working on a side project - modular EV charging system. I wanted you to be aware of it because I prefer to be transparent. The project is unrelated to NCR Voyix, developed in my personal time on personal equipment.

---

## What is EK3

A 3.3 kW power electronics module designed to be combined in arbitrary quantities for any power level (3 kW to 3 MW). The key innovation is **distributed coordination** - no central controller, modules self-organize like a swarm.

**Key specs:** 3.3 kW per module, 200-920 VDC output, LLC resonant topology, STM32G474 controller, CAN-FD communication at 5 Mbps.

---

## Core Concepts

### 1. Extreme Modularity

Instead of building different chargers for different power levels, one universal 3.3 kW module scales to any application:

| Application | Modules | Power |
|-------------|---------|-------|
| Home charger | 7 | 23 kW |
| DC fast charger | 46 | 150 kW |
| Bus depot | 152 | 500 kW |
| MCS truck charging | 909 | 3 MW |

### 2. Distributed Intelligence (ROJ)

"ROJ" = Serbian for "swarm". Modules coordinate peer-to-peer using a Raft-inspired consensus protocol:

- **No central controller** - any module can lead a charging session
- **Self-healing** - if a module fails, others automatically rebalance
- **Leader election** - modules vote to coordinate, any module can take over
- **Fault tolerance** - system continues operating with failed modules

### 3. Parallel C + Rust Development

The firmware is implemented in both C and Rust simultaneously, with shared JSON test vectors. When both implementations produce identical output, confidence is high. This caught ~15% of bugs that single-implementation testing missed.

### 4. Physics Simulation (Go)

A separate Go-based simulator models thermal dynamics, electrical behavior, and component aging. Runs 84 virtual modules with realistic physics for system-level testing before hardware exists.

---

## Transferable Learnings for NCR Voyix

Regardless of whether this project interests NCR Voyix directly, several approaches could benefit our stack:

### Go Language Benefits

The Go simulator demonstrates why Go works well for backend services:

- **Explicit error handling** - no exceptions, no hidden control flow
- **No inheritance** - no "magic" from parent classes, code is readable
- **Fast compilation** - ~2 seconds for entire project
- **Single binary deployment** - no runtime dependencies
- **Built-in race detector** - finds concurrency bugs automatically

**Recommendation:** Consider Go for new microservices where explicit error handling and simple deployment matter.

### Rust for Safety-Critical Code

The dual C/Rust implementation shows Rust's strengths:

- **Memory safety without garbage collection**
- **No null pointer dereferences** - Option<T> instead
- **No data races** - borrow checker enforces at compile time
- **Pattern matching** - forces handling all cases

**Recommendation:** Consider Rust for security-critical parsers, payment processing, or performance-critical paths where C would normally be used.

### Agentic AI Development Workflow

**This entire project was developed in "extreme agentic mode"** using Claude Opus 4.5 with custom orchestration:

- **14 custom skills** for domain-specific workflows (power calculations, thermal analysis, patent drafting)
- **200+ explicit permission grants** - each a deliberate decision, not blanket approval
- **Auditable workflow** - every AI action logged, reviewable in Git
- **Cross-validation** - C and Rust must produce identical output (catches AI hallucinations)
- **Docker CI** - reproducible builds catch "works on my machine" issues

**Caution: AI Slop Risk**

Like everyone reasonable, I'm wary of AI-generated code that looks plausible but is subtly wrong. Mitigations:

1. Dual implementation verification
2. Human-written JSON test vectors as ground truth
3. Emulation testing (Renode runs actual ARM binary)
4. Human review before merge
5. Incremental trust - AI earns permissions through working code

**Recommendation for NCR Voyix:** Establish "agentic development guidelines" before AI coding becomes widespread. The lessons learned here about safe AI-assisted development may be more valuable than the code itself.

---

## Current Status

| Component | Status |
|-----------|--------|
| Hardware design | Concept, no PCB yet |
| Distributed coordination | Working (tested in emulation) |
| Go physics simulator | Working |
| Power control loops | Designed, not implemented |

---

## Employment Status

- I work on this in my personal time (weekends, evenings)
- On my personal computer and equipment
- NCR Voyix job is my priority and I'm satisfied with it
- I have no intention of leaving NCR Voyix
- Just wanted you to be aware this exists

---

## Final Note

The primary purpose of this disclosure is transparency - I believe in being upfront about side projects, even when unrelated to my employer.

That said, if NCR Voyix sees business value here and would be interested in exploring this further, I would be more than happy to discuss. But that is not the goal of this document - just an open door.

---

*All documentation and code are my personal work, developed independently from NCR Voyix.*

---
---

# Appendix: Code Reference

*The following code samples are provided for technical reference only.*

## A1. ROJ Heartbeat Message (C)

```c
typedef struct {
    uint8_t  module_id;
    uint8_t  state;          // IDLE, CHARGING, FAULT, etc.
    uint16_t output_voltage; // 0.1V resolution
    uint16_t output_current; // 0.1A resolution
    uint8_t  temperature;    // °C
    uint8_t  soc_estimate;
    uint32_t uptime_seconds;
    uint8_t  neighbor_count;
} heartbeat_msg_t;  // 12 bytes, fits in single CAN-FD frame
```

## A2. Consensus State (C)

```c
typedef enum {
    ROLE_FOLLOWER,
    ROLE_CANDIDATE,
    ROLE_LEADER
} raft_role_t;

typedef struct {
    uint32_t current_term;
    uint8_t  voted_for;
    uint8_t  current_leader;
    uint8_t  commit_index;
    uint8_t  last_applied;
} consensus_state_t;
```

## A3. Go Error Handling Pattern

```go
func (s *Simulation) AddModule(id uint8, rack uint8) error {
    if id >= MaxModules {
        return fmt.Errorf("module ID %d exceeds maximum %d", id, MaxModules)
    }
    if _, exists := s.modules[id]; exists {
        return ErrModuleAlreadyExists
    }
    // ... implementation
    return nil
}
```

## A4. Rust State Machine Pattern

```rust
enum ModuleState {
    Offline,
    Initializing { start_time: Instant },
    Online { neighbor_count: u8 },
    Fault { code: FaultCode, recoverable: bool },
}

match module.state {
    ModuleState::Offline => self.start_discovery(),
    ModuleState::Fault { recoverable: true, .. } => self.attempt_recovery(),
    ModuleState::Fault { recoverable: false, .. } => self.halt(),
    // ...
}
```

## A5. Thermal Model (Go)

```go
const (
    RthJC = 0.24   // Junction to case (K/W)
    RthCH = 0.10   // Case to heatsink (K/W)
    RthHA = 0.50   // Heatsink to ambient (K/W)
)

func (t *ThermalModel) Update(powerLoss float64, dt float64) {
    tau := t.Cth * t.Rth
    dT_ss := powerLoss * t.Rth
    t.Temperature += (dT_ss - (t.Temperature - t.Ambient)) * (1 - math.Exp(-dt/tau))
}
```

## A6. CAN-FD Message IDs (C)

```c
#define MSG_HEARTBEAT      (0 << 8)  // 0x000-0x0FF
#define MSG_CONSENSUS      (1 << 8)  // 0x100-0x1FF
#define MSG_POWER_CMD      (2 << 8)  // 0x200-0x2FF
#define MSG_FAULT          (3 << 8)  // 0x300-0x3FF
#define MSG_VEHICLE        (5 << 8)  // 0x500-0x5FF (ISO 15118)
```
