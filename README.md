# EK-KOR v2: Field-Centric Coordination RTOS

**Parallel C/Rust Development Project**

Real-time coordination kernel for modular power electronics.

## Project Structure

```
ek-kor2/
├── README.md                 # This file
├── DEVELOPMENT.md            # Development guide
│
├── docs/                     # DOCUMENTATION
│   ├── test-vector-system.md # Cross-language validation guide
│   ├── ekkl-language.md      # EKKL DSL reference
│   └── ek-kor-rtos-technical-report.md
│
├── spec/                     # LANGUAGE-AGNOSTIC SPECIFICATION
│   ├── api.md                # API specification
│   ├── state-machines.md     # State machine definitions
│   ├── test-vectors/         # Shared test cases (JSON)
│   │   ├── field_*.json
│   │   ├── topology_*.json
│   │   ├── consensus_*.json
│   │   └── heartbeat_*.json
│   └── state-machines/       # Visual diagrams
│
├── c/                        # C IMPLEMENTATION
│   ├── CMakeLists.txt
│   ├── README.md
│   ├── include/ekk/          # Header files
│   ├── src/                  # Implementation
│   └── test/                 # Unit tests
│
├── rust/                     # RUST IMPLEMENTATION
│   ├── Cargo.toml
│   ├── src/                  # Implementation
│   └── tests/                # Integration tests
│
├── sim/                      # SIMULATION & VISUALIZATION
│   ├── multi_module.py       # Multi-module simulator
│   └── visualize.py          # Field/topology visualizer
│
└── tools/                    # BUILD & TEST TOOLS
    ├── run_tests.py          # Cross-language test runner
    └── compare_outputs.py    # Output comparison tool
```

## Design

1. **Potential Field Scheduling** - No central scheduler
2. **Topological k=7 Coordination** - Scale-free neighbor selection
3. **Threshold Consensus** - Distributed voting
4. **Adaptive Mesh Reformation** - Self-healing topology

## Development Workflow

```
┌─────────────────────────────────────────────────────────┐
│                    spec/test-vectors/                   │
│              (language-agnostic truth)                  │
└─────────────────────────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                              ▼
┌─────────────────────┐      ┌─────────────────────────┐
│   C Implementation  │      │   Rust Implementation   │
│   c/src/*.c         │      │   rust/src/*.rs         │
└─────────────────────┘      └─────────────────────────┘
          │                              │
          └──────────────┬───────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│              tools/compare_outputs.py                   │
│         "Both implementations match spec"               │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# Run C tests
cd c && mkdir build && cd build && cmake .. && make && ctest

# Run Rust tests
cd rust && cargo test

# Run cross-language comparison
python tools/run_tests.py
```

## Documentation

- [Test Vector System](docs/test-vector-system.md) - Cross-language validation architecture
- [EKKL Language](docs/ekkl-language.md) - Deterministic DSL for test vector oracles
- [Technical Report](docs/ek-kor-rtos-technical-report.md) - RTOS design and implementation

## Module Development Order

| Module | Focus |
|--------|-------|
| field | Simplest, learn basics |
| topology | k-neighbor algorithm |
| heartbeat | Timing, state machines |
| consensus | Most complex, voting |
| module | Integration |
| hal | Hardware abstraction |

## License

MIT License - Copyright (c) 2026 Elektrokombinacija
