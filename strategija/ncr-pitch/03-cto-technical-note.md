# Technical Learnings from a Side Project

> **To**: Rakamura Johnson, CTO, NCR Voyix
> **CC**: Luka Miskeljin, Marco Sneek, Isidro Rodriguez
> **From**: Bojan Janjatovic, Senior Software Engineer, Platform Engineering
> **Subject**: Engineering practices from personal project - potentially applicable to NCR

---

## Context

Over the holiday break, I started a hardware/software hobby project - about 3 weeks of personal time so far (evenings, weekends, personal equipment). While the domain (EV charging infrastructure) is unrelated to NCR Voyix, several engineering approaches I've been experimenting with might be relevant to our platform modernization efforts.

Following the recent NRF 2026 momentum and the emphasis on accelerating innovation through the Voyix Commerce Platform, I wanted to share these learnings with leadership in case they're useful to our broader engineering efforts.

I'm copying my management chain so they're aware of this communication.

---

## 1. Dual-Implementation Verification

**The Problem**: How do you trust AI-assisted code? How do you catch subtle bugs that pass unit tests?

**My Approach**: I implemented the same firmware logic in both C and Rust simultaneously, with shared JSON test vectors as the canonical source of truth.

### How It Works

```
┌─────────────┐                           ┌─────────────┐
│  C impl     │                           │  Rust impl  │
│  (embedded) │                           │  (verification) │
└──────┬──────┘                           └──────┬──────┘
       │                                         │
       ▼                                         ▼
┌─────────────────────────────────────────────────────────┐
│              Shared JSON Test Vectors                   │
│              (human-written, canonical)                 │
│                                                         │
│  • Input states, expected outputs                       │
│  • Edge cases defined once, tested in both languages    │
│  • Language-agnostic specification                      │
└─────────────────────────────────────────────────────────┘
       │                                         │
       ▼                                         ▼
   ┌───────┐                                 ┌───────┐
   │ Pass? │                                 │ Pass? │
   └───────┘                                 └───────┘
       │                                         │
       └──────────────────┬──────────────────────┘
                          ▼
                   Both must match
```

### Test Vector Example

```json
{
  "test": "leader_election_timeout",
  "initial_state": {
    "role": "follower",
    "term": 5,
    "votes_received": 0,
    "election_timeout_ms": 150
  },
  "input": {
    "event": "timeout_elapsed",
    "elapsed_ms": 200
  },
  "expected_output": {
    "role": "candidate",
    "term": 6,
    "voted_for": "self",
    "action": "broadcast_vote_request"
  }
}
```

The test vector is written by a human (me), reviewed carefully, and both C and Rust implementations must produce the exact same output. If they disagree, at least one has a bug.

### Why This Works

- **Different failure modes**: C bugs (buffer overflows, pointer errors) differ from Rust bugs (logic errors, type mismatches)
- **AI cross-check**: If AI generates C code with a subtle bug, it's unlikely to generate the identical bug in Rust
- **Specification as code**: JSON vectors serve as executable documentation

**Results**: This caught ~15% of bugs that single-implementation testing missed.

**NCR Applicability**:
- Payment processing logic (critical paths where correctness is paramount)
- Protocol parsers (where bugs = security vulnerabilities)
- Any code where correctness matters more than development speed
- State machine logic (transaction flows, device states)

---

## 2. Agentic AI Development with Guardrails

**The Problem**: AI coding assistants are powerful but can produce "slop" - code that looks correct but isn't.

**My Approach**: Explicit permission grants for each AI action, creating an auditable trail.

```
WORKFLOW
─────────────────────────────────────────────────────────────
1. AI proposes code change
2. Human reviews and grants specific permission
3. Change logged to Git with context
4. Dual-implementation catches hallucinations
5. Emulation testing validates on actual target

PERMISSION LOG (200+ explicit grants)
─────────────────────────────────────────────────────────────
Each permission is a deliberate decision, not blanket approval.
Creates audit trail of AI-assisted development.
```

**Key Insight**: The friction of explicit permissions forces you to understand what the AI is doing. It's slower, but the code quality is higher.

**NCR Applicability**:
- Guidelines for AI-assisted development before it becomes widespread
- Audit trail requirements for AI-generated code in production
- Quality gates specific to AI-generated code

---

## 3. Go for Backend Services

**The Problem**: Complex backend systems with hidden control flow, exception-based error handling, runtime surprises, and deployment complexity.

**My Approach**: Built a physics simulator in Go. What I observed aligns with what makes Go excellent for production services.

### No Magic Programming

```go
// Go: Explicit error handling - no hidden control flow
func (s *Simulation) AddModule(id uint8) error {
    if id >= MaxModules {
        return fmt.Errorf("module ID %d exceeds max %d", id, MaxModules)
    }
    if _, exists := s.modules[id]; exists {
        return ErrModuleAlreadyExists
    }
    // ...
    return nil
}
```

**What "no magic" means in practice:**
- No exceptions flying up the stack invisibly
- No inheritance hierarchies to trace ("where does this method actually come from?")
- No decorators, annotations, or runtime reflection surprises
- No dependency injection frameworks with hidden wiring
- Code reads top-to-bottom, left-to-right - what you see is what executes

When debugging at 3 AM, "boring" code is a feature.

### Docker / Container Benefits

```dockerfile
# Go Dockerfile - entire thing
FROM scratch
COPY myservice /myservice
ENTRYPOINT ["/myservice"]
```

```
COMPARISON: Container Image Size
─────────────────────────────────────────────────────────────
Java (Spring Boot)     ~400-800 MB    (JVM + dependencies)
Python (Flask)         ~150-400 MB    (interpreter + packages)
Node.js (Express)      ~150-300 MB    (runtime + node_modules)
Go                     ~10-20 MB      (static binary, no runtime)
─────────────────────────────────────────────────────────────
```

**Why this matters:**
- **Faster deployments**: 10 MB pulls faster than 400 MB
- **Smaller attack surface**: No runtime = fewer CVEs to patch
- **FROM scratch**: Literally empty base image - nothing but your binary
- **No runtime dependencies**: No "works on my machine" - same binary everywhere
- **Startup time**: Milliseconds, not seconds (no JVM warmup, no interpreter init)

### Compilation Speed

```
Full rebuild: ~2 seconds (entire project)
Incremental:  ~200ms
```

Fast feedback loop = more iterations = better code.

### Go Benefits Summary

| Aspect | Go Advantage |
|--------|--------------|
| Error handling | Explicit, in-band, no hidden flow |
| Inheritance | None - composition only |
| Dependencies | Single binary, zero runtime deps |
| Containers | 10 MB images, FROM scratch |
| Startup | Milliseconds |
| Concurrency | Built-in race detector |
| Learning curve | Small language, readable in days |

**NCR Applicability**:
- Microservices where deployment simplicity matters
- Edge services where container size affects rollout speed
- Services requiring fast cold-start (serverless, scaling)
- Codebases where readability/maintainability is priority
- Teams onboarding new developers frequently

---

## 4. Rust for Security-Critical Parsers

**My Approach**: Protocol parsing in Rust instead of C.

```rust
// Rust: Compiler enforces handling all cases
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
    // Compiler error if cases not exhaustive
}
```

**Rust Benefits I Observed**:
- No null pointer dereferences (Option<T> instead)
- No data races (borrow checker enforces at compile time)
- Pattern matching forces handling all cases
- Memory safety without garbage collection

**NCR Applicability**:
- Security-critical parsers (payment messages, protocol handlers)
- Performance-critical paths where C would normally be used
- New components where memory safety is paramount

---

## 5. Distributed Consensus for Edge Devices

**The Problem**: Central controller = single point of failure.

**My Approach**: Raft-inspired consensus among edge devices.

```
TRADITIONAL                      DISTRIBUTED
─────────────────────────────────────────────────────────────
┌─────────────┐                 ┌─────────────┐
│  Central    │                 │  Device A   │◄──┐
│  Controller │                 └─────────────┘   │
└──────┬──────┘                 ┌─────────────┐   │ peer-to-peer
       │                        │  Device B   │◄──┼─── consensus
       ▼                        └─────────────┘   │
┌──────────────┐                ┌─────────────┐   │
│ All devices  │                │  Device C   │◄──┘
│ depend on it │                └─────────────┘
└──────────────┘
                                Any device can lead.
Single point of failure.        Others continue if one fails.
```

**Key Insight**: The same Raft consensus used in etcd/Consul works for coordinating physical devices, not just database replicas.

**NCR Applicability**:
- Store device networks (POS terminals, self-checkout)
- Resilience when store controller is unavailable
- Edge computing scenarios

---

## 6. Emulation-Based Testing

**The Problem**: Can't test firmware without hardware. Hardware is expensive and slow to iterate.

**My Approach**: Renode emulator runs actual ARM binary.

```
┌─────────────────────────────────────────────────────────────┐
│                    RENODE EMULATOR                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ STM32G474   │  │  CAN-FD     │  │  Simulated  │         │
│  │ (emulated)  │──│  Bus        │──│  Neighbors  │         │
│  │             │  │  (virtual)  │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  Runs ACTUAL firmware binary, not simulation                │
└─────────────────────────────────────────────────────────────┘
```

**Benefits**:
- Test firmware without hardware
- Reproducible CI/CD pipeline
- Catch "works on my machine" issues
- Test failure scenarios safely

**NCR Applicability**:
- Firmware testing for terminals/devices
- CI/CD for embedded systems
- Regression testing without physical hardware

---

## 7. Symbolic AI for Deterministic Systems

**The Problem**: LLMs are powerful but fundamentally non-deterministic. For safety-critical systems, you need guarantees, not probabilities.

### LLM Limitations in Critical Systems

```
LLM CHARACTERISTICS
─────────────────────────────────────────────────────────────
✗ Non-deterministic    Same input can produce different output
✗ No guarantees        "Usually correct" ≠ "always correct"
✗ Black box            Cannot prove why a decision was made
✗ Hallucinations       Confidently wrong outputs
✗ No formal verification possible
─────────────────────────────────────────────────────────────

REQUIRED FOR SAFETY-CRITICAL SYSTEMS (automotive, medical, payment)
─────────────────────────────────────────────────────────────
✓ Deterministic        Same input → same output, always
✓ Provable             Can formally verify correctness
✓ Explainable          Clear audit trail of decisions
✓ Bounded behavior     Known limits, predictable edge cases
✓ Certifiable          Meets ISO 26262, IEC 61508, etc.
─────────────────────────────────────────────────────────────
```

### Symbolic AI / Expert Systems

**My Approach**: For control logic and decision-making in my project, I use explicit state machines and rule-based systems - what's now called "symbolic AI" or "good old-fashioned AI" (GOFAI).

```
SYMBOLIC AI APPROACH
─────────────────────────────────────────────────────────────
┌─────────────────────────────────────────────────────────┐
│                    RULE ENGINE                          │
│                                                         │
│  IF voltage > 920V AND current > 0                      │
│    THEN fault(OVERVOLTAGE), action(DISCONNECT)          │
│                                                         │
│  IF temperature > 85°C AND power > 2.5kW                │
│    THEN action(DERATE), set_power(2.0kW)                │
│                                                         │
│  IF heartbeat_timeout > 500ms                           │
│    THEN state(SUSPECT), action(PROBE)                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
           │
           ▼
    ┌─────────────┐
    │ DETERMINISTIC │  Same conditions → same actions
    │ EXPLAINABLE   │  "Why did it disconnect?" → logged rule
    │ TESTABLE      │  Every rule has explicit test cases
    │ CERTIFIABLE   │  Formal methods can prove properties
    └─────────────────┘
```

### Why This Matters for Automotive / Industrial

```
AUTOMOTIVE (ISO 26262)
─────────────────────────────────────────────────────────────
Requirement: Demonstrate that software behaves correctly
             under ALL conditions

LLM approach:   "It worked in 99.7% of test cases"
                → NOT CERTIFIABLE

Symbolic approach: "Here is formal proof that condition X
                    always produces action Y"
                → CERTIFIABLE
─────────────────────────────────────────────────────────────
```

### Hybrid Approach: LLM + Symbolic

The best of both worlds:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   LLM (Claude, GPT)              SYMBOLIC LAYER             │
│   ─────────────────              ─────────────────          │
│   • Development assistance       • Runtime decisions        │
│   • Code generation              • Safety interlocks        │
│   • Documentation                • Fault handling           │
│   • Test case ideation           • State machine logic      │
│                                                             │
│   Used at DESIGN TIME            Used at RUN TIME           │
│   (human in the loop)            (deterministic execution)  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**My project uses both:**
- LLM (Claude) helps me write code, explore designs, generate documentation
- Symbolic logic (state machines, explicit rules) runs on the actual device
- The LLM never runs in production - only deterministic code does

### Expert Systems Renaissance

Classic expert systems are having a renaissance because:

| Era | Approach | Limitation |
|-----|----------|------------|
| 1980s | Expert systems | Knowledge acquisition bottleneck |
| 2020s | LLMs | Non-deterministic, can't certify |
| Now | Hybrid | LLM helps BUILD expert systems, symbolic logic RUNS them |

**NCR Applicability**:
- Payment processing rules (fraud detection with explainable decisions)
- Device state machines (POS terminal states, self-checkout flows)
- Compliance requirements (audit trail of why decision was made)
- Edge device logic (must work offline, must be deterministic)
- Any system requiring certification (PCI-DSS, SOC2, etc.)

---

## Summary

| Practice | Benefit | NCR Relevance |
|----------|---------|---------------|
| Dual implementation | Catches subtle bugs | Payment/security code |
| AI guardrails | Auditable AI-assisted dev | Development guidelines |
| Go for backends | Explicit, simple, fast containers | Microservices, edge |
| Rust for parsers | Memory-safe, no crashes | Security-critical code |
| Distributed consensus | No single point of failure | Edge device resilience |
| Emulation testing | Test without hardware | Firmware CI/CD |
| Symbolic AI | Deterministic, certifiable | Payment rules, compliance |

---

## Why I'm Sharing This

The recent NRF 2026 communication emphasized "accelerating innovation" and "modernizing our software portfolio." These are engineering practices I've found valuable while working on my personal project. If any of them are relevant to our platform efforts, I'd be glad to discuss further or contribute to internal initiatives.

This is purely a technical knowledge-sharing communication - no business angle, just learnings that might be useful to the team.

---

## Next Steps (If Interested)

- Happy to present any of these topics to interested teams
- Can provide deeper technical documentation on specific practices
- Available for discussion at leadership's convenience

---

*Bojan Janjatovic*
*Senior Software Engineer, Platform Engineering*
