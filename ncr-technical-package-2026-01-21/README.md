# Elektrokombinacija Technical Package

**For NCR Voyix Internal Disclosure**
**Date:** January 21, 2026

---

## Purpose

This package contains full source code for the Elektrokombinacija project. It's provided for complete transparency—you don't need to review the code unless you want to.

---

## What's Included

```
ncr-technical-package-2026-01-21/
│
├── README.md                      # This file
│
├── docs/                          # Technical documentation
│   ├── 00-system-architecture.md
│   ├── 02-roj-intelligence.md     # Distributed coordination
│   ├── 07-v2g-control.md          # V2G grid control
│   └── 11-v2g-ai-ml.md            # AI/ML optimizations
│
├── ek-kor2/                       # EK-KOR2 RTOS Kernel
│   ├── c/                         # C implementation
│   │   ├── include/ekk/           # Headers
│   │   └── src/                   # Source code
│   ├── rust/                      # Rust implementation
│   │   └── src/
│   └── spec/                      # Specifications
│       ├── test-vectors/          # 27 JSON test vectors
│       └── property-tests/        # Proptest invariants
│
└── mapf-het-research/             # Algorithm Research
    ├── internal/algo/             # 12 algorithm implementations
    └── internal/core/             # Domain models
```

---

## What This Demonstrates

1. **Real engineering work** - Not slides or concepts, actual running code
2. **Production quality** - Comprehensive testing, dual implementation
3. **Algorithm research** - PhD-level distributed systems work
4. **Complete transparency** - Nothing hidden

---

## Key Components

### EK-KOR2 RTOS Kernel

Real-time operating system for distributed power electronics:

| Feature | Description |
|---------|-------------|
| Potential field scheduling | Bio-inspired work distribution |
| k=7 topological neighbors | Scale-free network coordination |
| Threshold consensus | Distributed decision making |
| Lock-free IPC | <100ns publish latency |
| Dual implementation | C and Rust cross-validated |

### MAPF-HET Research

Multi-Agent Path Finding for Heterogeneous agents:

| Algorithm | Purpose |
|-----------|---------|
| CBS | Conflict-Based Search baseline |
| Deadline-CBS | Hard deadline integration |
| Hybrid-CBS | CBS planning + field execution |
| MCTS | Monte Carlo Tree Search |

---

## Domain Context

**Industry:** EV charging infrastructure
**Application:** Electric bus fleet charging
**Scale:** 10 to 1000+ power modules

**No overlap with NCR:** This is industrial embedded systems for EV infrastructure, completely separate from NCR's retail/banking technology domain.

---

## Code Statistics

| Component | Language | Approximate Lines |
|-----------|----------|-------------------|
| EK-KOR2 kernel (C) | C | ~4,500 |
| EK-KOR2 kernel (Rust) | Rust | ~2,500 |
| MAPF-HET research | Go | ~3,000 |
| Test infrastructure | Python | ~1,500 |
| Documentation | Markdown | ~15,000 |

---

## Verification

To verify this is working code (optional):

```bash
# C implementation
cd ek-kor2/c && mkdir build && cd build
cmake .. && make

# Rust implementation
cd ek-kor2/rust
cargo build

# MAPF-HET algorithms
cd mapf-het-research
go test ./...
```

---

*Technical package prepared for NCR Voyix internal disclosure, January 2026*
