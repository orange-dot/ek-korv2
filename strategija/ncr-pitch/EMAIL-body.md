# Technical Learnings from a Side Project

**To:** Rakamura Johnson, CTO, NCR Voyix
**CC:** Luka Miskeljin, Marco Sneek, Isidro Rodriguez
**From:** Bojan Janjatovic, Senior Software Engineer, Platform Engineering

---

## Context

Over the holiday break, I started a hardware/software hobby project - about 3 weeks of personal time so far (evenings, weekends, personal equipment). While the domain (EV charging infrastructure) is unrelated to NCR Voyix, several engineering approaches I've been experimenting with might be relevant to our platform modernization efforts.

Following the recent NRF 2026 momentum and the emphasis on accelerating innovation through the Voyix Commerce Platform, I wanted to share these learnings with leadership in case they're useful to our broader engineering efforts.

I'm copying my management chain so they're aware of this communication.

---

## Summary of Practices

I've documented 7 engineering practices in the attached technical document. Here's a brief overview:

### 1. Dual-Implementation Verification

I implemented the same logic in both C and Rust, with shared JSON test vectors as ground truth. When both implementations produce identical output, confidence is high. This approach caught approximately 15% of bugs that single-implementation testing missed.

**NCR relevance:** Payment processing logic, protocol parsers, any code where correctness is paramount.

### 2. Agentic AI Development - Two Modes

I distinguish between two types of AI-assisted tasks:

**Extreme Agentic Mode** - For well-defined implementation tasks with clear success criteria. AI runs autonomously for 1+ hours without human input. Verification is done afterward via test vectors (if both C and Rust produce correct output, the implementation is correct). Human reviews the result, not every step.

**Human-in-the-Loop Mode** - For exploratory work, architecture decisions, or tasks without clear test criteria. Human guides AI step-by-step with explicit permission grants. Slower, but necessary when correctness can't be automatically verified.

The key insight: match the mode to the task. Test vectors enable autonomous operation; their absence requires human guidance.

**NCR relevance:** Guidelines for AI-assisted development, understanding when autonomous AI is appropriate vs. when human oversight is essential.

### 3. Go for Backend Services

Built a physics simulator in Go. Key observations: no exceptions (explicit error handling), no inheritance (code reads linearly), single binary deployment (10-20 MB container images vs 400+ MB for JVM), millisecond startup times.

**NCR relevance:** Microservices, edge services where container size matters, fast cold-start requirements.

### 4. Rust for Security-Critical Parsers

Protocol parsing in Rust instead of C. Compiler enforces handling all cases, no null pointer dereferences, no data races (borrow checker), memory safety without garbage collection.

**NCR relevance:** Security-critical parsers, performance-critical paths, new components where memory safety is paramount.

### 5. Distributed Consensus for Edge Devices

Applied Raft-inspired consensus among physical devices. No central controller - any device can lead, others continue if one fails. Same patterns used in etcd/Consul work for coordinating physical devices.

**NCR relevance:** Store device networks, resilience when store controller unavailable, edge computing.

### 6. Emulation-Based Testing

Using Renode emulator to run actual ARM firmware binaries without hardware. Enables reproducible CI/CD, catches "works on my machine" issues, allows safe testing of failure scenarios.

**NCR relevance:** Firmware testing, CI/CD for embedded systems, regression testing without physical hardware.

### 7. Symbolic AI for Deterministic Systems

For safety-critical logic, using explicit state machines and rule-based systems instead of LLMs. LLMs are non-deterministic and cannot be certified for safety-critical applications. The hybrid approach: LLM assists at design time, symbolic logic runs at runtime.

**NCR relevance:** Payment processing rules, device state machines, compliance requirements, any system requiring certification (PCI-DSS, SOC2).

---

## Why I'm Sharing This

The recent NRF 2026 communication emphasized "accelerating innovation" and "modernizing our software portfolio." These are engineering practices I've found valuable while working on my personal project. If any of them are relevant to our platform efforts, I'd be glad to discuss further or contribute to internal initiatives.

This is purely a technical knowledge-sharing communication - no business angle, just learnings that might be useful to the team.

---

## Attachments

1. **Technical-Details.pdf** - Diagrams, code examples, and detailed explanations
2. **Code-Samples.zip** - Representative code snippets (C, Rust, Go)

---

## Next Steps (If Interested)

- Happy to present any of these topics to interested teams
- Can provide deeper technical documentation on specific practices
- Available for discussion at leadership's convenience

---

*Bojan Janjatovic*
*Senior Software Engineer, Platform Engineering*
