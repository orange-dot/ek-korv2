# Side Project Disclosure: Elektrokombinacija

> **Purpose**: Transparency about a personal side project
> **From**: [Your Name]
> **Date**: January 2026

---

## Summary

I'm working on a side project - modular EV charging system. I wanted you to be aware of it because I prefer to be transparent. The project is unrelated to NCR Voyix, developed in my personal time on personal equipment.

---

## What is EK3

A 3.3 kW power electronics module designed to be combined in arbitrary quantities for any power level (3 kW to 3 MW). The key thing is distributed coordination - no central controller.

---

## Hardware Architecture

### EK3 Module Specifications

| Parameter | Value |
|-----------|-------|
| Rated Power | 3.3 kW |
| Output Voltage | 200-920 VDC |
| Input | 3-phase 400VAC or DC link |
| Topology | LLC resonant (half-bridge) |
| Switching Frequency | 100-500 kHz (variable) |
| Primary MOSFETs | Wolfspeed C3M0021120K (1200V SiC) |
| Secondary Rectification | Synchronous (SiC MOSFETs) |
| Controller | STM32G474RET6 (Cortex-M4F, 170 MHz) |
| Communication | CAN-FD @ 5 Mbps |
| Dimensions | 200 × 320 × 44 mm (1U half-width) |
| Weight Target | < 3.5 kg |
| Efficiency Target | > 95% peak |
| Cooling | Forced air (shared plenum) |

### Why LLC Topology

```
       Lr        Cr
    ┌──────┐  ┌──────┐
────┤ resonant inductor ├──┤ resonant cap ├────┐
    └──────┘  └──────┘                        │
                                              │
    ┌─────────────────────────────────────────┤
    │            Transformer                  │
    │  ┌─────┐      n:1       ┌─────┐        │
    ├──┤     ├────────────────┤     ├────────┤
    │  │     │                │     │        │
    │  └─────┘                └─────┘        │
    │     Lm (magnetizing)                   │
    └────────────────────────────────────────┘
```

- ZVS (Zero Voltage Switching) across entire load range
- No reverse recovery losses on primary side
- Magnetizing inductance participates in resonance
- Frequency modulation instead of PWM duty cycle
- Lower EMI than hard-switched topologies

### Power Stage Block Diagram

```
AC Input        PFC Stage       DC Link         LLC Stage        Output
─────────────────────────────────────────────────────────────────────────
                ┌─────────┐     ┌─────┐      ┌──────────┐
3φ 400V ──────► │ Vienna  │────►│ 800V│─────►│ LLC HB   │──────► 200-920V
   AC           │ Rectifier│     │ Bus │      │ Resonant │        DC Out
                └─────────┘     └─────┘      └──────────┘
                     │                            │
                     │         ┌──────────┐       │
                     └────────►│ STM32G474│◄──────┘
                               │          │
                               │ HRTIM    │◄────── CAN-FD Bus
                               │ ADC      │
                               │ FDCAN    │
                               └──────────┘
```

### STM32G474 Peripheral Usage

| Peripheral | Function |
|------------|----------|
| HRTIM | PWM generation, 184 ps resolution, dead-time, ADC trigger |
| ADC1/2 | Current sensing (dual simultaneous) |
| ADC3 | Voltage sensing, temperature |
| FDCAN1 | Inter-module communication (5 Mbps) |
| FDCAN2 | External interface (vehicle, BMS) |
| CORDIC | Sin/cos for PLL (hardware accelerator) |
| FMAC | FIR/IIR filtering (hardware accelerator) |
| DAC | Analog references |
| COMP | Overcurrent protection (hardware, < 100ns) |
| TIM1 | Backup PWM / fault handling |
| UART | Debug / diagnostics |

---

## Firmware Architecture

### Layer Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │ Charging    │ │ V2G Mode    │ │ Diagnostics             ││
│  │ State Machine│ │ Control     │ │ & Reporting             ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                     COORDINATION LAYER (ROJ)                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │ Neighbor    │ │ Consensus   │ │ Load                    ││
│  │ Discovery   │ │ (Raft-like) │ │ Balancing               ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                     CONTROL LAYER                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │ Voltage     │ │ Current     │ │ PLL                     ││
│  │ Loop        │ │ Loop        │ │ (grid sync)             ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                     DRIVER LAYER                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │ HRTIM       │ │ ADC         │ │ CAN-FD                  ││
│  │ Driver      │ │ Driver      │ │ Driver                  ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                     HAL (Hardware Abstraction)               │
│  STM32G474 │ EFR32MG24 │ RP2040 │ Linux/POSIX (test)       │
└─────────────────────────────────────────────────────────────┘
```

### ROJ - Distributed Coordination Protocol

"ROJ" = Serbian for "swarm". Modules coordinate peer-to-peer without a central master.

#### Neighbor Discovery

```c
// Each module periodically broadcasts heartbeat
typedef struct {
    uint8_t  module_id;
    uint8_t  state;          // IDLE, CHARGING, FAULT, etc.
    uint16_t output_voltage; // current output (0.1V resolution)
    uint16_t output_current; // current output (0.1A resolution)
    uint8_t  temperature;    // hottest point (°C)
    uint8_t  soc_estimate;   // if known from vehicle
    uint32_t uptime_seconds;
    uint8_t  neighbor_count; // how many neighbors I see
} heartbeat_msg_t;  // 12 bytes, fits in single CAN-FD frame

// Discovery state machine
enum discovery_state {
    DISC_LISTENING,      // waiting for heartbeats
    DISC_ANNOUNCING,     // sending own heartbeats
    DISC_SYNCHRONIZED,   // stable mesh topology
};

// K-nearest tracking (no need for full mesh in large systems)
#define MAX_TRACKED_NEIGHBORS 16
```

#### Consensus Protocol (Raft-inspired)

For coordinating charging sessions, mode changes, fault response:

```c
typedef enum {
    ROLE_FOLLOWER,
    ROLE_CANDIDATE,
    ROLE_LEADER
} raft_role_t;

typedef struct {
    uint32_t current_term;
    uint8_t  voted_for;        // module_id or 0xFF
    uint8_t  current_leader;   // module_id or 0xFF
    uint8_t  commit_index;
    uint8_t  last_applied;
} consensus_state_t;

// Leader election timeout: 150-300ms (randomized)
// Heartbeat interval: 50ms
// One leader per charging session, but any module can take over
```

#### Fault Tolerance

```c
// When a module detects a fault:
void on_module_fault(uint8_t module_id, fault_code_t fault) {
    // 1. Broadcast fault notification
    broadcast_fault(module_id, fault);

    // 2. Remaining modules rebalance load
    //    If it was the leader - new election
    if (module_id == consensus.current_leader) {
        start_election();
    }

    // 3. Adjust power sharing
    //    N modules down -> others take over if possible
    recalculate_power_sharing();
}

// Typical reaction time: < 100ms for full mesh reformation
```

### Control Loops

#### Voltage Control (Outer Loop)

```c
// PI controller, 1 kHz update rate
typedef struct {
    float kp;           // proportional gain
    float ki;           // integral gain
    float integral;     // accumulated error
    float output_min;   // saturation limits
    float output_max;
} pi_controller_t;

// Droop control for parallel operation
// V = V_nominal - R_droop * I
// R_droop typically 2-5% for load sharing
float calculate_voltage_reference(float i_total, float i_local) {
    float droop = DROOP_RESISTANCE * i_local;
    return v_nominal - droop;
}
```

#### Current Control (Inner Loop)

```c
// Runs at PWM frequency (100+ kHz effective)
// For LLC: frequency control instead of duty cycle

void llc_control_update(void) {
    float v_out = read_output_voltage();
    float i_out = read_output_current();

    // Outer loop generates current reference
    float i_ref = voltage_pi_update(v_setpoint, v_out);

    // Inner loop generates frequency
    float freq = current_pi_update(i_ref, i_out);

    // Clamp to resonant frequency bounds
    freq = clamp(freq, F_RES_MIN, F_RES_MAX);

    // Update HRTIM
    set_switching_frequency(freq);
}
```

#### Grid Synchronization PLL (for V2G)

```c
// SOGI-PLL (Second Order Generalized Integrator)
// Uses STM32G474 CORDIC for sin/cos

typedef struct {
    float theta;        // grid angle estimate
    float omega;        // frequency estimate
    float v_alpha;      // Clarke transform
    float v_beta;
    float v_d;          // Park transform (should be 0)
    float v_q;          // Park transform (grid amplitude)
} pll_state_t;

// Update rate: 10-20 kHz
// Lock time: < 100ms typical
// Frequency tracking: 45-65 Hz
```

---

## Communication Protocol

### CAN-FD Message IDs

```c
// ID structure: 11-bit standard
// [10:8] = message type (0-7)
// [7:0]  = source module ID

#define MSG_HEARTBEAT      (0 << 8)  // 0x000-0x0FF
#define MSG_CONSENSUS      (1 << 8)  // 0x100-0x1FF
#define MSG_POWER_CMD      (2 << 8)  // 0x200-0x2FF
#define MSG_FAULT          (3 << 8)  // 0x300-0x3FF
#define MSG_DIAGNOSTIC     (4 << 8)  // 0x400-0x4FF
#define MSG_VEHICLE        (5 << 8)  // 0x500-0x5FF (ISO 15118)
#define MSG_GRID           (6 << 8)  // 0x600-0x6FF (V2G commands)
#define MSG_RESERVED       (7 << 8)  // 0x700-0x7FF

// CAN-FD config: 1 Mbps arbitration, 5 Mbps data
// Max payload: 64 bytes
```

### Typical Message Flow (Charging Session Start)

```
Vehicle ──────► Any Module: START_SESSION request
                    │
                    ▼
             Module broadcasts: ELECTION for this session
                    │
                    ▼
             Consensus: One module becomes session leader
                    │
                    ▼
             Leader ──► All modules: POWER_ON, target voltage
                    │
                    ▼
             All modules: Soft-start to target
                    │
                    ▼
             Leader ──► Vehicle: READY, voltage stable
                    │
                    ▼
             Vehicle ──► Leader: Current request
                    │
                    ▼
             Leader ──► All modules: LOAD_SHARE distribution
```

---

## Test Environment

### Renode Emulation

```bash
# Runs 7 STM32G474 instances with virtual CAN bus
cd ek-kor2
docker-compose up -d

# Each module is a full emulation including:
# - Cortex-M4F core
# - HRTIM (timing, not actual PWM)
# - FDCAN (full protocol)
# - ADC (simulated readings)
```

### Test Scenarios

```python
# test_neighbor_discovery.py
def test_7_modules_discover_each_other():
    start_modules(7)
    wait_for_discovery(timeout=5.0)
    for module in modules:
        assert module.neighbor_count >= 6

# test_leader_election.py
def test_leader_elected_within_timeout():
    start_modules(7)
    wait_for_leader(timeout=2.0)
    leaders = [m for m in modules if m.role == LEADER]
    assert len(leaders) == 1

# test_fault_recovery.py
def test_mesh_reforms_after_module_death():
    start_modules(7)
    wait_for_stable()
    kill_module(3)
    wait_for_stable(timeout=1.0)
    for module in remaining_modules:
        assert module.neighbor_count >= 5
```

---

## Physics Simulation Engine (Go)

Separate from the embedded firmware, there's a physics simulator written in Go for system-level testing and visualization.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Web Frontend (React)                        │
│                    Real-time visualization                       │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │ WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Go Simulation Engine                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Thermal     │  │ Electrical  │  │ Distributed             │ │
│  │ Model       │  │ Model       │  │ Coordination            │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Redis Pub/Sub
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      State Store (Redis)                         │
│              Module states, metrics, events                      │
└─────────────────────────────────────────────────────────────────┘
```

### Simulation Parameters

| Parameter | Value |
|-----------|-------|
| Default tick rate | 100 ms |
| Time scale | Configurable (1x - 100x) |
| Max modules | 84 (7 racks × 12 modules) |
| Thermal resolution | Per-component |
| CAN bus model | Message latency + arbitration |

### Thermal Model

```go
// Three-node thermal network per module
type ThermalState struct {
    TjMOSFET    float64  // Junction temperature (°C)
    TCase       float64  // Case temperature (°C)
    TAmbient    float64  // Ambient/heatsink (°C)
}

// Thermal resistances (from datasheet + measurements)
const (
    RthJC = 0.24   // Junction to case (K/W) - SiC MOSFET
    RthCH = 0.10   // Case to heatsink (K/W) - thermal interface
    RthHA = 0.50   // Heatsink to ambient (K/W) - forced air
)

// First-order thermal dynamics
// dT/dt = (P_loss - (T - T_ambient) / Rth) / Cth
func (t *ThermalModel) Update(powerLoss float64, dt float64) {
    // RC time constant for thermal mass
    tau := t.Cth * t.Rth

    // Steady-state temperature rise
    dT_ss := powerLoss * t.Rth

    // Exponential approach to steady state
    t.Temperature += (dT_ss - (t.Temperature - t.Ambient)) * (1 - math.Exp(-dt/tau))
}
```

### Component Aging Models

```go
// Arrhenius model for capacitor lifetime
// L = L0 * exp(Ea/k * (1/T - 1/T0))
type ArrheniusModel struct {
    L0             float64  // Base lifetime at T0 (hours)
    T0             float64  // Reference temperature (K)
    ActivationEv   float64  // Activation energy (eV)
    VoltageAccel   float64  // Voltage acceleration factor
}

func (a *ArrheniusModel) RemainingLife(temp, voltage float64) float64 {
    tempK := temp + 273.15
    tempFactor := math.Exp(a.ActivationEv / kBoltzmann * (1/a.T0 - 1/tempK))
    voltageFactor := math.Pow(voltage/a.RatedVoltage, -a.VoltageAccel)
    return a.L0 * tempFactor * voltageFactor
}

// Coffin-Manson model for thermal cycling fatigue
// Nf = A * (ΔT)^(-n) * exp(Ea / (k * Tmax))
type CoffinMansonModel struct {
    A              float64  // Material constant
    N              float64  // Fatigue exponent (typically 2-3 for solder)
    ActivationEv   float64  // Activation energy
}

func (c *CoffinMansonModel) CyclestoFailure(deltaT, maxTemp float64) float64 {
    maxTempK := maxTemp + 273.15
    return c.A * math.Pow(deltaT, -c.N) * math.Exp(c.ActivationEv/(kBoltzmann*maxTempK))
}
```

### LLC Electrical Model

```go
// Load-dependent efficiency curve (from simulation/measurement)
type LLCModel struct {
    RatedPower    float64
    PeakEff       float64  // ~0.965 at 50% load
    LightLoadEff  float64  // ~0.92 at 10% load
    FullLoadEff   float64  // ~0.95 at 100% load
}

func (l *LLCModel) Efficiency(loadPercent float64) float64 {
    // Polynomial fit to efficiency curve
    // Accounts for: switching losses (freq-dependent), conduction losses (I²R)
    x := loadPercent / 100.0
    return l.PeakEff - 0.045*math.Pow(x-0.5, 2) - 0.01*(1-x)
}

func (l *LLCModel) PowerLoss(inputPower float64) float64 {
    loadPercent := (inputPower / l.RatedPower) * 100
    eff := l.Efficiency(loadPercent)
    return inputPower * (1 - eff)
}
```

### V2G Droop Control

```go
// ENTSO-E compliant frequency droop
type FrequencyDroop struct {
    Deadband    float64  // ±0.01 Hz (10 mHz)
    DroopPct    float64  // 4% = 2% per 0.5 Hz
    ResponseMs  float64  // 200 ms activation time
}

func (d *FrequencyDroop) PowerAdjustment(freqHz float64, ratedPower float64) float64 {
    deviation := freqHz - 50.0

    // Inside deadband - no response
    if math.Abs(deviation) < d.Deadband {
        return 0
    }

    // Linear droop outside deadband
    // -1 Hz -> +100% power (discharge), +1 Hz -> -100% power (charge)
    droopFactor := -deviation / (50.0 * d.DroopPct / 100.0)
    return ratedPower * math.Max(-1, math.Min(1, droopFactor))
}

// Voltage droop for parallel module coordination
type VoltageDroop struct {
    DroopResistance float64  // Virtual resistance (Ω)
    NominalVoltage  float64  // Target voltage (V)
}

func (v *VoltageDroop) VoltageReference(localCurrent float64) float64 {
    // V = Vnom - Rdroop * I
    return v.NominalVoltage - v.DroopResistance*localCurrent
}
```

### Power Distribution (Wide Striping)

```go
// Distribute load across modules to minimize thermal stress
type WideStriping struct {
    Modules      []*Module
    TargetPower  float64
}

func (w *WideStriping) Distribute() map[int]float64 {
    allocation := make(map[int]float64)
    activeModules := w.getActiveModules()

    if len(activeModules) == 0 {
        return allocation
    }

    // Even distribution first
    perModule := w.TargetPower / float64(len(activeModules))

    // Adjust for thermal headroom
    for _, m := range activeModules {
        headroom := m.MaxTemp - m.CurrentTemp
        thermalFactor := headroom / 40.0  // 40°C nominal headroom
        allocation[m.ID] = perModule * math.Min(1.0, thermalFactor)
    }

    // Redistribute shortfall to cooler modules
    w.rebalance(allocation)

    return allocation
}
```

### CAN Network Simulation

```go
// Virtual CAN bus with realistic timing
type CANBus struct {
    Modules        []*Module
    ArbitrationUs  float64  // 50 µs per bit at 1 Mbps
    DataRateUs     float64  // 0.2 µs per bit at 5 Mbps
    QueueDepth     int
}

type CANFrame struct {
    ID         uint16
    Data       []byte
    Priority   int      // Lower = higher priority
    TimestampUs int64
}

func (c *CANBus) Transmit(frame CANFrame) int64 {
    // Arbitration phase (11-bit ID)
    latency := float64(11) * c.ArbitrationUs

    // Data phase (up to 64 bytes)
    latency += float64(len(frame.Data)*8) * c.DataRateUs

    // Stuff bits, CRC, ACK (~20% overhead)
    latency *= 1.2

    return int64(latency)
}
```

---

## Scaling

| Application | Modules | Power | CAN Bus Config |
|-------------|---------|-------|----------------|
| Single module test | 1 | 3.3 kW | Single bus |
| Home charger | 7 | 23 kW | Single bus |
| DC fast charger | 46 | 150 kW | Single bus |
| Bus depot point | 152 | 500 kW | 3 buses, bridged |
| Full depot | 303 | 1 MW | 6 buses, hierarchical |
| MCS truck | 909 | 3 MW | Hierarchical mesh |

For systems > ~64 modules: hierarchical topology with "supernode" modules that bridge segments.

---

## Current Status

| Component | Status |
|-----------|--------|
| Hardware design | Schematic concept, no PCB yet |
| LLC control theory | Documented, not implemented |
| Neighbor discovery | Working (tested in emulation) |
| Consensus protocol | Working (tested in emulation) |
| Fault tolerance | Working (tested in emulation) |
| HAL - STM32G474 | Partial (CAN, GPIO, basic timers) |
| HAL - Renode | Complete (for testing) |
| HAL - Raspberry Pi | Partial (for multi-core testing) |
| Power control loops | Designed, not implemented |
| V2G / PLL | Designed, not implemented |
| Go physics simulator | Working (thermal, electrical, aging) |
| Web visualization | Working (React, real-time updates) |
| Redis state store | Working (pub/sub, persistence) |

---

## Repository Structure

```
ek-kor2/
├── c/
│   ├── include/ekk/      # Public headers
│   ├── src/
│   │   ├── core/         # Coordination, consensus
│   │   ├── hal/          # Hardware abstraction
│   │   │   ├── stm32g474/
│   │   │   ├── rpi3/
│   │   │   └── renode/
│   │   └── control/      # Power control (WIP)
│   ├── test/             # Unit tests
│   └── examples/         # Demo applications
├── renode/               # Emulation scripts
└── docker-compose.yml    # Test environment

simulator/
├── engine/
│   ├── cmd/              # Main entry point
│   ├── internal/
│   │   ├── engine/       # Simulation loop, entity management
│   │   ├── models/       # Thermal, electrical, aging models
│   │   ├── comms/        # Redis pub/sub, WebSocket
│   │   └── config/       # Configuration loading
│   └── go.mod            # Go module definition
└── README.md

web/
├── src/
│   ├── components/       # React components
│   │   └── simulation/   # Module grid, rack panels
│   ├── hooks/            # WebSocket, state management
│   └── pages/            # Main views
└── package.json
```

---

## Why I'm Doing This

Pure technical challenge - combination of power electronics, embedded systems, and distributed systems. Three areas I'm interested in, combined into one project.

---

## Transferable Learnings for NCR Voyix

Regardless of whether this project interests NCR Voyix directly, several technical approaches from this work could benefit our stack and practices:

### Go for Backend Services

The Go physics simulator (`simulator/engine/`) demonstrates Go's strengths:

```go
// Go enforces explicit error handling - no silent failures
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

**Key advantages observed:**
- No exceptions = no hidden control flow (every error is explicit)
- No inheritance = no "magic" from parent classes
- No generics abuse = readable code (Go 1.18+ generics are intentionally limited)
- Compile-time enforcement of interface contracts
- Fast compilation (~2s for entire simulator)
- Single binary deployment (no runtime dependencies)
- Built-in race detector (`go run -race`)

**Docker-native development:**
```yaml
# Simple, reproducible builds
services:
  simulator:
    build: ./simulator/engine
    command: ["./simulator", "-tick", "100ms", "-modules", "84"]
```

**Recommendation:** Consider Go for new backend microservices where:
- Explicit error handling matters
- Fast compilation improves developer iteration
- Simple deployment is valued over framework features
- Concurrency is needed (goroutines + channels)

### Rust for Safety-Critical Code

The project implements the same RTOS in both C and Rust with shared test vectors:

```rust
// Rust makes invalid states unrepresentable
enum ModuleState {
    Offline,
    Initializing { start_time: Instant },
    Online { neighbor_count: u8 },
    Fault { code: FaultCode, recoverable: bool },
}

// Pattern matching forces handling all cases
match module.state {
    ModuleState::Offline => self.start_discovery(),
    ModuleState::Initializing { start_time } if elapsed > TIMEOUT => {
        self.transition_to_fault(FaultCode::InitTimeout)
    }
    ModuleState::Online { neighbor_count } => self.tick_normal(),
    ModuleState::Fault { recoverable: true, .. } => self.attempt_recovery(),
    ModuleState::Fault { recoverable: false, .. } => self.halt(),
    _ => {}
}
```

**Key advantages observed:**
- Memory safety without garbage collection
- No null pointer dereferences (Option<T> instead)
- No data races (borrow checker enforces at compile time)
- Zero-cost abstractions (no runtime overhead for safety)
- Cross-compilation to embedded targets (ARM, RISC-V)

**Recommendation:** Consider Rust for:
- Security-critical parsers (payment processing, protocol handling)
- Performance-critical paths where C would normally be used
- Embedded/low-level code that needs memory safety

### Extreme Agentic Development Workflow

**This entire project was developed in "extreme agentic mode"** using Claude Opus 4.5 with custom orchestration. Key patterns:

**1. Custom Skills (`.claude/skills/`)**
```markdown
# /power-calc skill
Performs power electronics calculations:
- LLC resonant frequency
- Thermal dissipation
- Efficiency curves
- Component selection
```

14 custom skills for project-specific workflows: `power-calc`, `thermal-analysis`, `patent-draft`, `consistency-check`, etc.

**2. Extensive Permission History**
The `.claude/settings.local.json` shows 200+ explicit permission grants - each representing a deliberate decision about what the AI can do:
```json
{
  "permissions": {
    "allow": [
      "Bash(docker-compose build:*)",
      "Bash(cargo build:*)",
      "Bash(cmake:*)",
      // ... 200+ more
    ]
  }
}
```

**3. Auditable AI Workflow**

Every AI action is:
- Explicitly permitted (no blanket `allow all`)
- Logged in conversation history
- Reviewable in Git commits
- Cross-validated (C vs Rust outputs must match)

**4. Avoiding Common Agentic Pitfalls**

| Pitfall | Mitigation |
|---------|------------|
| AI "hallucinating" code | Test vectors as ground truth - both C and Rust must produce identical output |
| Uncontrolled changes | Incremental permission grants, explicit bash commands |
| Lost context | Custom skills encode domain knowledge persistently |
| Inconsistent outputs | JSON test vectors shared between implementations |
| "Works on my machine" | Docker-based builds, Renode emulation |

**5. Development Statistics**

From Git history:
- ~50 multi-hour agentic sessions
- 10-phase implementation plan executed systematically
- Cross-validation catches ~15% of initial implementation bugs
- Docker CI runs on every significant change

**Recommendation for NCR Voyix:**
- Establish "agentic development guidelines" before AI coding becomes widespread
- Create domain-specific skills/prompts for common NCR Voyix workflows
- Implement test vector patterns for cross-validation
- Use explicit permission grants, not blanket approvals
- Consider AI-assisted code review with similar guardrails

**Caution: AI Slop Risk**

Like everyone reasonable, I'm wary of "AI slop" - low-quality AI-generated code that looks plausible but is subtly wrong. Mitigations used here:

1. **Dual implementation** - If C and Rust both pass, less likely to be hallucinated
2. **Formal test vectors** - JSON spec is human-written, implementations must match
3. **Emulation testing** - Renode runs actual ARM binary, catches real bugs
4. **Human review** - All commits reviewed before merge
5. **Incremental grants** - AI earns trust through working code, not blanket access

This is an experiment in "how to use AI agents safely" - lessons learned are arguably more valuable than the code itself.

### Parallel Implementation as Verification

```
spec/test-vectors/*.json  →  THE TRUTH (25+ vectors)
        ↓
    ┌───┴───┐
    ↓       ↓
  C impl   Rust impl
    ↓       ↓
    └───┬───┘
        ↓
   Outputs must match
```

When C and Rust disagree:
1. Check the spec
2. If spec is ambiguous, fix the spec first
3. Then fix both implementations

This pattern caught bugs that single-implementation testing missed.

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
