# Elektrokombinacija Technical Package
## For Khosla Ventures Seed Fund Application

**Date:** January 21, 2026
**Version:** 2.0 (includes Session 2026-01-21 updates)
**Contact:** bojan.janjatovic@gmail.com

---

## What's Included

This package contains **full source code** for our distributed energy coordination system:

```
khosla-technical-package-2026-01-21/
│
├── README.md                 # This file
├── 05-TECHNICAL-DISCLOSURE.md # Full session disclosure
│
├── docs/                     # Technical documentation
│   ├── 00-system-architecture.md
│   ├── 02-roj-intelligence.md   # ROJ distributed coordination
│   ├── 07-v2g-control.md
│   ├── 11-v2g-ai-ml.md          # Charger placement MILP
│   └── ek-kor-rtos-technical-report.md
│
├── ek-kor2/                  # EK-KOR2 RTOS Kernel
│   ├── c/                    # C implementation
│   │   ├── include/ekk/      # Headers
│   │   └── src/              # Source
│   ├── rust/                 # Rust implementation
│   │   └── src/
│   ├── spec/                 # Specifications
│   │   ├── api.md            # API reference
│   │   ├── test-vectors/     # 27 JSON test vectors
│   │   ├── golden-outputs/   # 20 reference outputs
│   │   ├── property-tests/   # Proptest invariants
│   │   └── ekkl/             # EKKL spec files
│   ├── ekkl/                 # EKKL interpreter
│   │   └── src/              # Complete interpreter
│   ├── tools/                # Test tools
│   │   ├── run_tests.py      # Cross-validation
│   │   ├── golden_capture.py
│   │   ├── golden_validate.py
│   │   ├── reference_impl.py # Python reference
│   │   └── llm_oracle.py     # AI-assisted testing
│   └── docs/
│       ├── mapf-integration.md
│       └── test-vector-system.md
│
└── mapf-het-research/        # MAPF-HET Algorithm Research
    ├── cmd/mapfhet/          # CLI entry
    └── internal/
        ├── core/             # Domain models
        └── algo/             # 12 algorithm implementations
```

---

## Key Technical Highlights

### 1. MAPF-HET Integration (NEW - Session 2026-01-21)

Multi-Agent Path Finding algorithms integrated into real-time kernel:

| Feature | Implementation |
|---------|---------------|
| Deadline-aware scheduling | `EKK_FIELD_SLACK` field component |
| Capability-based tasks | `ekk_capability_t` bitmask |
| Critical deadline priority | Modified task selection algorithm |

**Collaboration:** Developed with our Distributed Systems & Optimization Advisor (PhD, identity confidential due to defense sector employment).

### 2. EKKL Interpreter (NEW - Session 2026-01-21)

Domain-specific language for deterministic test oracle:

- ~160KB of interpreter source code
- Fixed-point semantics matching ekk Q16.16
- Executable specification for cross-validation

### 3. Multi-Layer Test System (NEW - Session 2026-01-21)

Comprehensive validation infrastructure:

- Property tests (proptest) - mathematical invariants
- Golden outputs - regression testing
- Python reference - lightweight implementation
- LLM oracle - AI-assisted test generation

### 4. EK-KOR2 RTOS Kernel

Novel coordination without central scheduler:

- Potential field scheduling (gradient-based work distribution)
- k=7 topological neighbors (scale-free network theory)
- Threshold consensus (distributed decision making)
- Lock-free IPC (<100ns publish latency)
- Dual C/Rust implementation (cross-validated)

### 5. MAPF-HET Research Codebase

12 algorithm implementations in Go:

- CBS, Prioritized, A*, A*3D
- Deadline-aware CBS, Energy-aware CBS
- Hybrid CBS + potential field execution
- Monte Carlo Tree Search with field guidance

---

## Quick Validation

### Run Test Vectors (Cross-Validation)
```bash
# Build C implementation
cd ek-kor2/c && mkdir build && cd build
cmake .. && make

# Build Rust implementation
cd ek-kor2/rust
cargo build --bin test_harness

# Run cross-validation
cd ek-kor2/tools
python run_tests.py
```

### Run Property Tests
```bash
cd ek-kor2/spec/property-tests
cargo test
```

### Run EKKL Interpreter
```bash
cd ek-kor2/ekkl
cargo run -- ../spec/ekkl/field.ekkl
```

### Run MAPF-HET Algorithms
```bash
cd mapf-het-research
go test ./...
```

---

## Collaboration Acknowledgments

### Distributed Systems & Optimization Advisor (Official)

- PhD Computer Science (Western Europe)
- 15+ years distributed systems research
- Focus: MAPF-HET, V2G optimization, fleet logistics
- **Identity confidential** due to EU defense/telecom sector employment
- Full credentials disclosed under NDA

**Contribution to this package:**
- MAPF-HET algorithm formalization
- Deadline-aware CBS algorithm (deadline_cbs.go:231-270)
- Capability-based task assignment framework

---

## What This Demonstrates

1. **Technical Depth** - Novel algorithms, not just integration
2. **Production Quality** - Comprehensive testing, dual implementation
3. **Collaboration Network** - PhD-level algorithm research support
4. **Execution Speed** - 22,550 lines in a single intensive session

---

## IP Protection

- **Priority Date:** January 2, 2026
- **Bernstein Project:** 0c4684af-4751-483f-9335-7592a67230b2
- **Git Commit:** dd14f6f63aa97a7985efbaad55a5372d9ad3e1fc
- **Protection:** Blockchain timestamps, GPG-signed commits

---

## Contact

**Bojan Janjatovic** (Co-Founder & CTO)
Email: bojan.janjatovic@gmail.com

**Marija Janjatovic** (Co-Founder & CEO)
Email: bojan.janjatovic@gmail.com (primary contact)

**Company:** Elektrokombinacija (Netherlands BV)
**R&D:** Serbia (EU-adjacent)

---

*Package prepared: January 21, 2026*
*For: Khosla Ventures Seed Fund Application*
