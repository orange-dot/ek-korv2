# KHOSLA VENTURES - EK-KOR2 Open Source Pitch

**Updated: January 2026**
**Focus: EK-KOR2 Open-Source Coordination RTOS + Autonomous EV Infrastructure**

## Investor Profile

```
KHOSLA VENTURES
═══════════════════════════════════════════════════════════════
Type:       Premier Deep Tech / Climate VC (founded 2004)
AUM:        $15B+
Ticket:     $500K-5M (seed), up to $50M (Series A)
Focus:      Climate tech, AI, robotics, deep tech, healthcare
Approach:   OPEN - public application on website
Website:    khoslaventures.com/apply

KEY PARTNERS FOR OUR PITCH:
─────────────────────────────────────────────────────────────
SVEN STROHBAND (Managing Director) ← PRIMARY TARGET
• Background: Lead engineer Stanford "Stanley" - DARPA Grand
  Challenge 2005 winner (autonomous car → Google self-driving)
• Portfolio: Rocket Lab, GitLab, Hermeus, Berkshire Grey
• Focus: Robotics, autonomous systems, deep tech
• Passion: "Technologies that forge new industries"
→ PERFECT FIT: Open-source RTOS + autonomous energy infrastructure

VINOD KHOSLA (Founder)
• Sun Microsystems co-founder (OSS heritage!)
• "Black Swan" approach - big bets on transformative tech
• 2025: "Millions taking small amounts on projects that
  will fail, but if they succeed, they change the world"
• Focus: Breakthrough > deploying existing tech

SAMIR KAUL (Founding Partner)
• AI-infused strategies, roll-ups with new technology
• Early-stage company builder
```

---

## NEW: EK-KOR2 - Layered Open-Source Strategy

### The "Android Model" for Distributed Energy

```
LAYERED ARCHITECTURE - STRATEGIC IP SEPARATION
════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│  PROPRIETARY LAYER (Closed)                                 │
│  ─────────────────────────────────────────────────────────  │
│  • Fleet Management System (AI scheduling, logistics)       │
│  • EK3 Hardware Design (power electronics, thermals)        │
│  • Application Layer (web apps, APIs, integrations)         │
│  • Robotic Swap System (mechanical design, control)         │
│                                                             │
│  → Revenue generation, competitive moat                     │
├─────────────────────────────────────────────────────────────┤
│  OPEN SOURCE LAYER (MIT License)                            │
│  ─────────────────────────────────────────────────────────  │
│  • EK-KOR2 RTOS (coordination, consensus, topology)         │
│  • JEZGRO Kernel (real-time scheduling, HAL)                │
│  • Communication Protocols (CAN-FD messaging)               │
│                                                             │
│  → Industry adoption, ecosystem creation, talent magnet     │
└─────────────────────────────────────────────────────────────┘

THE INSIGHT:
Android is open-source. Google's apps are not.
Linux is open-source. Red Hat's management tools are not.
EK-KOR2 is open-source. Our hardware + applications are not.

Create the standard at OS layer. Monetize the stack above it.
```

### Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    EK-KOR2 ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐     │
│  │Module 1 │   │Module 2 │   │Module 3 │   │Module N │     │
│  │ Field:  │   │ Field:  │   │ Field:  │   │ Field:  │     │
│  │ [0.5]   │──▶│ [0.3]   │──▶│ [0.7]   │──▶│ [0.4]   │     │
│  │ Load    │   │ Load    │   │ Load    │   │ Load    │     │
│  └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘     │
│       │             │             │             │           │
│       └─────────────┴──────┬──────┴─────────────┘           │
│                            │                                 │
│                   Gradient Flow                              │
│              (work flows to low-load modules)                │
│                                                             │
│  NO CENTRAL SCHEDULER - EMERGENT COORDINATION               │
└─────────────────────────────────────────────────────────────┘

SPECIFICATIONS:
• Languages:        C (embedded) + Rust (safety-critical)
• Target MCU:       STM32G474 (Cortex-M4, 170MHz)
• Communication:    CAN-FD @ 5Mbps
• Latency:          Field publish <100ns (lock-free)
• Consensus:        Threshold voting (50ms timeout)
• Heartbeat:        10ms period, 5-miss = dead
• Neighbors:        k=7 topological (scale-free)
```

### Why This Matters for Khosla

```
FORGING A NEW INDUSTRY - SVEN'S SWEET SPOT
════════════════════════════════════════════════════════════════

"What Android did for mobile, our stack does for distributed energy."

THE INSIGHT:
Every modular energy system needs a coordination layer.
Currently: Everyone rolls their own (brittle, proprietary).
With EK-KOR2: Industry-standard open-source foundation.

THE LAYERED PLAY (Android Model):
1. Open-source the OS layer (EK-KOR2 RTOS, JEZGRO kernel)
2. Build community adoption → becomes industry standard
3. Keep hardware + applications proprietary → revenue
4. Sell complete systems (hardware + software stack)
5. Professional services for large deployments

WHY LAYERED STRATEGY WINS:
• OS layer: Network effects, community, talent attraction
• App layer: Revenue protection, competitive differentiation
• Hardware layer: Margins, certification moat, quality control
• Vinod's Sun heritage - he GETS open-source strategy
• Google's Android playbook - proven at scale

BLACK SWAN PROFILE:
• Technical risk: HIGH (novel scheduling, distributed consensus)
• Market risk: LOW (EU mandates, $100B infrastructure)
• IP risk: LOW (OSS foundation + proprietary hardware/apps)
```

---

## Khosla Investment Philosophy Alignment

### "Black Swan" Approach - KEY UNDERSTANDING

Khosla does NOT seek incremental improvements. They seek:
> "High-risk ventures with potentially enormous societal impact"

### 6 Principles We Hit:

1. **"Main Tech Economics" > "Clean Tech"**
   - Vinod 2025: "Green tech must first make economic sense"
   - Our angle: 80% lower OPEX is ECONOMICS, not environmentalism
   - OSS strategy = 10x developer velocity vs proprietary

2. **Breakthrough Innovation > Deployment**
   - Vinod: "Deploying today's tech = bad idea"
   - EK-KOR2: Completely new scheduling paradigm
   - Potential fields + emergent coordination = NO central scheduler

3. **Extreme Technical Risk, Low Market Risk**
   - Technical: Novel RTOS, distributed consensus, field theory
   - Market: EU mandates guarantee demand for next decade

4. **"Technologies that forge new industries"** (Sven)
   - Not improving existing chargers
   - Creating the coordination standard for all modular energy

5. **Autonomous Systems Heritage**
   - Stanley → Google self-driving (Sven's background)
   - EK-KOR2: Self-organizing, self-healing mesh
   - "Autonomous coordination, not just autonomous hardware"

6. **Portfolio Synergies**
   - Rocket Lab: Modular philosophy, vertical integration
   - **GitLab: Open-source strategy, developer ecosystem** ← KEY
   - Berkshire Grey: Distributed autonomous systems

---

## Tailored Messaging

### DON'T say → DO say:

| Generic | Khosla-Optimized |
|---------|------------------|
| "Open-source charger software" | "Creating the Linux of distributed energy" |
| "Better coordination" | "Novel potential field scheduling - no central coordinator" |
| "Open-source for marketing" | "Open-source for network effects and standard creation" |
| "Robot maintenance" | "Autonomous self-healing infrastructure" |
| "We have patents" | "OSS foundation + hardware IP moat" |
| "Reduces costs" | "Economics work WITHOUT subsidies" |

---

## Email Template A: To Sven Strohband (Primary Target)

```
Subject: Open-Source RTOS for Autonomous Energy Infrastructure

Sven,

Your work on Stanley proved autonomous systems could operate in
unstructured environments. We're building the coordination layer
that makes distributed energy infrastructure autonomous.

THE BREAKTHROUGH:

EK-KOR2 is an open-source RTOS for modular power electronics.
No central scheduler. Modules self-organize through potential
field gradients - like how biological swarms coordinate.

┌────────────────────────────────────────────────────────────┐
│  Module 1    Module 2    Module 3    Module 4              │
│  [0.5 load]  [0.3 load]  [0.7 load]  [0.4 load]            │
│      │           │           │           │                 │
│      └───────────┴─────┬─────┴───────────┘                 │
│                        │                                    │
│              Gradient Flow (emergent)                       │
│         Work flows automatically to low-load nodes          │
│                                                            │
│            NO CENTRAL SCHEDULER - SELF-ORGANIZING          │
└────────────────────────────────────────────────────────────┘

WHY OPEN SOURCE:

Think Linux for servers, Android for mobile, Kubernetes for
cloud. We're creating EK-KOR2 for distributed energy.

Every modular energy system (EV charging, grid storage,
microgrids) needs coordination. Today: proprietary, brittle.
Tomorrow: industry-standard, open-source foundation.

THE BUSINESS MODEL:
• Open-source RTOS (MIT license) → community adoption
• Sell certified hardware running EK-KOR2
• Professional services for large deployments
• "Red Hat of distributed energy"

TECHNICAL MOAT:
• Dual C/Rust implementation (embedded + safety-critical)
• 5 patent concepts on hardware implementation
• 12-18 month head start on ecosystem building

WHY THIS IS A BLACK SWAN BET:
• Technical risk: Novel scheduling paradigm, distributed consensus
• Market risk: LOW - EU mandates 100% electric buses by 2035
• Standard creation moat beats patent moat long-term

TRACTION:
• EK-KOR2: Working C implementation, Rust in progress
• EK3 module: 3.3kW power electronics designed
• GitHub repo ready to open-source on funding

ASK: $1.5M seed to open-source EK-KOR2 and build first
certified hardware implementation.

Worth 20 minutes to discuss the autonomous coordination
architecture?

Bojan Janjatovic
Founder, Elektrokombinacija
https://github.com/elektrokombinacija/ek-kor2 (private, invite on request)
```

---

## Email Template B: General Khosla Application

```
Subject: Open-Source Coordination RTOS for Distributed Energy - Black Swan Bet

Dear Khosla Ventures team,

Not incremental charger improvement. A platform shift.

THE INSIGHT:
Every modular energy system needs a coordination layer.
Current state: Everyone builds proprietary, brittle solutions.
Our play: Create the open-source standard.

THE BREAKTHROUGH: EK-KOR2 RTOS
• Potential field scheduling (no central coordinator)
• Self-organizing distributed consensus
• Self-healing mesh topology
• Dual C/Rust implementation
• MIT license - "Linux of distributed energy"

WHY OPEN SOURCE STRATEGY WINS:
• Linux dominated servers through open ecosystem
• Android dominated mobile through open ecosystem
• Kubernetes dominated cloud through open ecosystem
• EK-KOR2 will dominate distributed energy coordination

THE BUSINESS MODEL:
Open-source the RTOS. Sell certified hardware.
Professional services for deployment.
"Red Hat of distributed energy."

MAIN TECH ECONOMICS:
• 80% lower OPEX through autonomous coordination
• Works WITHOUT subsidies - pure economic advantage
• Network effects compound adoption

WHY NOW:
• EU mandates 100% electric buses by 2035
• $100B+ infrastructure buildout starting now
• No open standard for modular energy coordination exists
• First-mover advantage on ecosystem creation

THE BET:
High technical risk (novel RTOS, distributed consensus)
Low market risk (mandates guarantee demand)
= Classic Khosla profile

TRACTION:
• EK-KOR2: Working C implementation, 22 test vectors passing
• EK3 module: Complete 3.3kW design (900V SiC, LLC topology)
• 5 patent concepts (WIPO PROOF priority Jan 2026)
• Ready to open-source on funding

ASK: $1.5M seed to open-source EK-KOR2 and build certified hardware.

Bojan Janjatovic
Founder, Elektrokombinacija
```

---

## One-Pager (Khosla-Optimized)

### Header
```
ELEKTROKOMBINACIJA
Open-Source Coordination for Distributed Energy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"What Linux did for computing, we're doing for energy infrastructure"
```

### Problem
```
DISTRIBUTED ENERGY LACKS A COORDINATION STANDARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Modular energy systems are emerging everywhere:
• EV charging (depot, opportunity, MCS)
• Grid storage (battery farms, V2G)
• Microgrids (campus, industrial, residential)

Current state:
• Every vendor builds proprietary coordination
• Central schedulers = single point of failure
• No interoperability between systems
• Brittle, expensive, non-scalable

THE MISSING PIECE:
An open-source coordination layer that any modular
energy system can use. Like how Linux became the
standard for servers.
```

### Solution
```
EK-KOR2: OPEN-SOURCE COORDINATION RTOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────┐
│              POTENTIAL FIELD COORDINATION               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐            │
│  │Mod 1 │   │Mod 2 │   │Mod 3 │   │Mod N │            │
│  │[0.5] │──▶│[0.3] │──▶│[0.7] │──▶│[0.4] │            │
│  └──────┘   └──────┘   └──────┘   └──────┘            │
│                                                         │
│  Modules publish "fields" (load, thermal, power)        │
│  Work flows along gradients - NO CENTRAL SCHEDULER     │
│                                                         │
└─────────────────────────────────────────────────────────┘

KEY INNOVATIONS:
1. Potential Field Scheduling - biological swarm-like coordination
2. Topological k=7 Neighbors - scale-free network structure
3. Threshold Consensus - distributed voting for decisions
4. Adaptive Mesh Reformation - self-healing on failures

IMPLEMENTATION:
• Dual C/Rust for embedded and safety-critical
• STM32G474 target (Cortex-M4, 170MHz)
• CAN-FD @ 5Mbps communication
• Lock-free IPC (<100ns latency)
• MIT License - fully open-source
```

### Why Layered Open Source

```
THE ANDROID MODEL FOR ENERGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRECEDENTS - LAYERED STRATEGIES:
Linux (OSS) → Red Hat tools (proprietary) = $34B
Android (OSS) → Google apps (proprietary) = ecosystem dominance
Kubernetes (OSS) → cloud services (proprietary) = $B revenue

OUR APPROACH:
EK-KOR2/JEZGRO (OSS) → Hardware + Apps (proprietary)

┌─────────────────────────────────────────────────────────┐
│  PROPRIETARY: Hardware, Fleet Mgmt, Applications        │
│  ─────────────────────────────────────────────────────  │
│  OPEN SOURCE: EK-KOR2 RTOS, JEZGRO Kernel               │
└─────────────────────────────────────────────────────────┘

WHY THIS STRATEGY WINS:
✓ OS layer becomes industry standard (network effects)
✓ Community contributes, finds bugs, attracts talent
✓ Proprietary layer protects margins and differentiation
✓ Hardware certification creates quality moat
✓ Best of both worlds: adoption + revenue

VINOD'S SUN HERITAGE:
• Sun pioneered layered OSS (Java OSS, Solaris proprietary)
• He understands strategic IP separation
• This is exactly the play that worked for Android
```

### Why Khosla

```
BLACK SWAN PROFILE - PERFECT FIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TECHNICAL RISK: HIGH ✓
• Novel scheduling paradigm (potential fields)
• Distributed consensus (threshold voting)
• Dual-language implementation (C + Rust)
• Real-time constraints on embedded hardware

MARKET RISK: LOW ✓
• EU mandates 100% electric buses by 2035
• $100B+ infrastructure investment happening
• Every modular system needs coordination
• No open standard currently exists

PORTFOLIO SYNERGIES:
• GitLab: Open-source strategy, dev ecosystem
• Rocket Lab: Modular architecture philosophy
• Berkshire Grey: Distributed autonomous systems
• ALL: First-principles hard engineering

"TECHNOLOGIES THAT FORGE NEW INDUSTRIES" ✓
• Not improving existing coordination
• Creating new standard for distributed energy
• Platform, not product
```

### Team

```
BOJAN JANJATOVIC - Founder
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 15 years enterprise software experience
• Postal & logistics systems - international projects for
  Toshiba (via Serbian engineering subcontractor)
• NCR Voyix - current, development team
• Power electronics + embedded systems (personal projects)
• RTOS development - EK-KOR2, JEZGRO kernels

WHY THIS BACKGROUND MATTERS:
• Enterprise-grade reliability mindset
• Large-scale distributed systems experience
• Real-time logistics optimization (postal sorting)
• Production-quality code standards

BUILDING:
• Community of embedded developers (post open-source)
• Power electronics engineers (EK3 hardware)
• Rust/C systems programmers
```

### Ask

```
$1.5M SEED ROUND
════════════════════════════════════════════════════
EK-KOR2 open-source launch      $200K (docs, CI/CD, community)
EK3 hardware development        $500K (prototype, certification)
Pilot deployment                $400K (EU transit operator)
Team expansion                  $300K (3 engineers)
IP protection                   $100K (hardware patents)
────────────────────────────────────────────────────
MILESTONE: Open-source launch + working hardware pilot, 12 months
EXIT PATH: Strategic acquisition or Series A
```

---

## Sven Strohband - Conversation Prep

### Expected Questions:

1. **"Why open-source? Won't competitors just copy it?"**
   → "That's the point. When everyone uses our standard, we win.
      Linux is 'copied' by everyone - Red Hat is worth $34B.
      We monetize hardware and services, not the RTOS itself."

2. **"What's the potential field scheduling innovation?"**
   → "Instead of central coordinator assigning work, each module
      publishes its state (load, thermal). Work flows along gradients
      like water flowing downhill. Emergent coordination, no SPOF."

3. **"Why dual C/Rust implementation?"**
   → "C for legacy embedded compatibility, Rust for safety-critical
      paths. Cross-validation catches bugs. Shows engineering rigor.
      Rust community will contribute - they love embedded projects."

4. **"How does this relate to Stanley?"**
   → "Stanley had to coordinate sensors, actuators, path planning
      without centralized control. EK-KOR2 does the same for power
      modules. Distributed sensing → distributed decision making."

5. **"What's the competitive moat if it's open-source?"**
   → "Standard creation moat. Once EK-KOR2 is THE coordination layer,
      switching costs are high. We have first-mover on ecosystem,
      plus hardware patents on EK3 implementation."

### Technical Deep-Dive Points:

```
ARCHITECTURE HIGHLIGHTS FOR SVEN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. FIELD DECAY (temporal coordination)
   decay_factor = exp(-(now - timestamp) / tau)
   Stale information naturally deprioritized.

2. K=7 TOPOLOGY (scale-free network)
   Each module tracks 7 neighbors.
   Network stays connected even with failures.
   Inspired by small-world network research.

3. THRESHOLD CONSENSUS (distributed voting)
   No leader election needed.
   50ms timeout for vote collection.
   Supermajority (67%) for critical decisions.

4. SEQUENCE COUNTER PATTERN (lock-free)
   Writers increment sequence (odd = writing).
   Readers retry if sequence changed.
   <100ns publish latency, no locks.

5. CHASKEY MAC (authentication)
   Lightweight message authentication.
   1-2μs on Cortex-M4.
   Prevents spoofing in CAN-FD bus.
```

---

## Follow-up Strategy

```
PRIORITY: TARGET SVEN STROHBAND + EMPHASIZE OSS

DAY 1: Submit general Khosla application
       (emphasize OSS strategy, GitLab parallel)

DAY 2-3: LinkedIn connection to Sven
         "Building open-source coordination for distributed energy.
          Your Stanley work inspired our autonomous approach."

DAY 4-5: Direct email to Sven (Template A)
         Subject: "Open-Source RTOS for Autonomous Energy Infrastructure"

WEEK 2: If no response:
        - GitHub activity (make repo public, generate buzz)
        - HackerNews post about EK-KOR2 architecture
        - Tag Khosla in technical threads

WEEK 3: Follow-up email
        "Following up on EK-KOR2. Just released initial docs on GitHub.
         Early community response is strong. Happy to walk through."

PARALLEL TRACK:
- Reach out through GitLab network (Khosla portfolio)
- Identify Stanford embedded systems connections (Sven's network)
- Technical blog posts establishing thought leadership
```

---

## Key Phrases (Khosla Language)

### USE:
- "Linux of distributed energy"
- "Standard creation moat"
- "Potential field scheduling"
- "No central coordinator"
- "Self-organizing mesh"
- "Open-source foundation"
- "Network effects"
- "Black Swan bet"
- "Main tech economics"
- "Technologies that forge new industries"

### AVOID:
- "Green" / "Clean" / "Eco" (unless tied to economics)
- "Innovative" (everyone says it)
- "Disruptive" (overused)
- "Revolutionary" (let them say it)
- Timeline estimates

---

## Competitive Positioning

```
IF ASKED ABOUT COMPETITION:

"Why won't ABB/Siemens open-source their coordination?"
→ "They're invested in proprietary lock-in. Switching would
   cannibalize existing service revenue. Classic innovator's dilemma."

"Why won't someone fork EK-KOR2 and compete?"
→ "That's success, not failure. When Linux got forked everywhere,
   Red Hat didn't lose - the ecosystem grew. We're building the
   foundation, monetizing hardware and services."

"What about other open-source energy projects?"
→ "OpenEMS does building energy management. We're doing real-time
   coordination for power electronics. Different layer, complementary."

"What's the IP strategy with open-source?"
→ "RTOS is MIT licensed - attracts adoption. Hardware implementation
   (EK3 module design) is patented. Community grows, we sell the best
   certified hardware."
```

---

*Document updated: 2026-01-12*
*Target: Sven Strohband, Khosla Ventures*
*Strategy: Open-source RTOS + standard creation moat*

---

## Sources

- [Sven Strohband - Khosla Ventures](https://www.khoslaventures.com/team/sven-strohband)
- [Vinod Khosla on Green Tech Investment (Bloomberg, Jul 2025)](https://www.bloomberg.com/news/videos/2025-07-15/vinod-khosla-on-green-tech-investment-video)
- [GitLab Open-Source Strategy](https://about.gitlab.com/company/strategy/)
- [Red Hat Business Model](https://www.redhat.com/en/about/company)
- [EK-KOR2 Technical Specification](../../ek-kor2/spec/api.md)
