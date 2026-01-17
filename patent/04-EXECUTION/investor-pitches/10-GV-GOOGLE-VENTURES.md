# GV (Google Ventures) - EK-KOR2 Open Source Pitch

**Updated: January 2026**
**Focus: EK-KOR2 Open-Source Coordination RTOS + Autonomous Energy Infrastructure**

## Investor Profile

```
GV (GOOGLE VENTURES)
═══════════════════════════════════════════════════════════════
Type:       Corporate VC, part of Alphabet
AUM:        $8B+
Ticket:     $1M-25M (seed to growth)
Focus:      Life sciences, enterprise, consumer, frontier tech
Climate:    Active - Climeworks, Commonwealth Fusion, Fervo, Form Energy
OSS DNA:    Android, Kubernetes, TensorFlow, Chromium → they GET open-source
Approach:   Patient capital, access to Google resources
Website:    gv.com

KEY PARTNERS FOR OUR PITCH:
─────────────────────────────────────────────────────────────
KARIM FARIS (General Partner) ← PRIMARY TARGET
• Former Google engineer (Ads, YouTube)
• Focus: Enterprise infrastructure, deep tech
• Climate investments: Led Climeworks, Commonwealth Fusion
• OSS understanding: YouTube scale infrastructure
→ PRIMARY: Climate + infrastructure + OSS strategy

ERIK NORDLANDER (Partner)
• Focus: Climate tech, sustainability
• Led: Fervo Energy (geothermal), Form Energy (storage)
→ STRONG FIT: Energy infrastructure specialist

TOM HULME (General Partner, Europe)
• IDEO alum, Design Council UK
• Focus: Design-led companies, European deals
→ EU market entry angle

DAVID KRANE (CEO & Managing Partner)
• Google employee #84, built Google comms
• Focus: Mission-driven companies
• Style: Long-term thinking, transformative bets
```

---

## NEW: EK-KOR2 - Layered Open-Source Strategy

### Google's Playbook - Android Model Applied to Energy

```
THE ANDROID INSIGHT - LAYERED IP STRATEGY:
════════════════════════════════════════════════════════════════

Android (OSS) + Google Apps (proprietary) = ecosystem dominance
Kubernetes (OSS) + GKE (proprietary) = cloud revenue
Chromium (OSS) + Google services (proprietary) = browser dominance

OUR APPROACH:
EK-KOR2/JEZGRO (OSS) + Hardware/Apps (proprietary) = energy standard

┌─────────────────────────────────────────────────────────────┐
│  PROPRIETARY LAYER (Closed Source)                          │
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
│  → Industry standard, ecosystem adoption, talent magnet     │
└─────────────────────────────────────────────────────────────┘

GV understands this playbook DEEPLY - it's Google's own strategy.
```

### EK-KOR2: What It Is

```
EK-KOR2: FIELD-CENTRIC COORDINATION RTOS
════════════════════════════════════════════════════════════════

WHAT IT IS:
Novel real-time operating system for distributed coordination
of modular power electronics. No central scheduler - modules
self-organize through potential field gradients.

OPEN SOURCE:
MIT License. Parallel C/Rust implementations.
"Kubernetes for distributed energy infrastructure."

KEY INNOVATIONS:
1. Potential Field Scheduling    - No central coordinator
2. Topological k=7 Coordination  - Scale-free neighbor selection
3. Threshold Consensus           - Distributed voting
4. Adaptive Mesh Reformation     - Self-healing topology

THE PARALLEL TO KUBERNETES:
┌─────────────────────────────────────────────────────────────┐
│  Kubernetes: Coordinates containers across nodes            │
│  EK-KOR2: Coordinates power modules across chargers         │
│                                                             │
│  Both: No single point of failure, self-healing, scalable   │
└─────────────────────────────────────────────────────────────┘
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

---

## GV Investment Philosophy Alignment

### What Makes GV Different - And Why We Fit

1. **Patient Capital**
   - Alphabet backing = no fund timeline pressure
   - Can wait 10+ years for infrastructure plays
   - **EK-KOR2**: Standard adoption takes time (like Kubernetes)

2. **Google Resources ("GV Startup Lab")**
   - Access to Google engineering expertise
   - Cloud credits (GCP)
   - **EK-KOR2**: Fleet AI/ML runs on GCP, predictive maintenance

3. **Open-Source DNA**
   - Android, Kubernetes, TensorFlow, Chromium
   - **EK-KOR2**: Same playbook - open foundation, ecosystem monetization
   - Google GETS this strategy intuitively

4. **Climate Conviction + Technical Depth**
   - Climeworks, Commonwealth Fusion, Fervo, Form Energy
   - NOT incremental improvements - breakthrough tech
   - **EK-KOR2**: Novel coordination paradigm, not better charger

5. **Portfolio Synergies**
   - Waymo: Autonomous systems expertise
   - Google Cloud: AI/ML infrastructure
   - **EK-KOR2**: Autonomous coordination + cloud telemetry

---

## GV Climate Portfolio - Our Positioning

### Map our story to their existing investments:

| GV Investment | What They Do | Our Parallel |
|---------------|--------------|--------------|
| **Climeworks** | Modular carbon capture | Modular power electronics (same scaling thesis) |
| **Commonwealth Fusion** | Breakthrough generation | Breakthrough distribution |
| **Fervo Energy** | Geothermal infrastructure | EV charging infrastructure |
| **Form Energy** | Grid-scale storage | Grid-connected charging |
| **Cruise/Waymo** | Autonomous vehicles | Autonomous coordination (EK-KOR2) |

### Talking Points:

> "You've invested in breakthrough energy generation (Fusion) and storage (Form).
> We're the missing piece: breakthrough energy DISTRIBUTION with an open-source
> coordination layer - like what Kubernetes did for cloud infrastructure."

> "Climeworks proved modular scaling works. EK-KOR2 proves modular coordination
> works. Same thesis: standardized units, manufacturing scale, open ecosystem."

---

## Tailored Messaging

### DON'T say → DO say:

| Generic | GV-Optimized |
|---------|--------------|
| "Open-source charger software" | "Kubernetes for distributed energy" |
| "Better coordination" | "Potential field scheduling - no central coordinator" |
| "We want Google's money" | "Seeking partner with OSS DNA and patient capital" |
| "Robot maintenance" | "Self-healing infrastructure (Waymo autonomy principles)" |
| "Patents pending" | "OSS foundation + hardware IP moat (Android model)" |

### GV resonance keywords:
- "Open-source" / "MIT licensed"
- "Ecosystem" / "Standard creation"
- "Kubernetes model"
- "Self-healing" / "No SPOF"
- "Modular" (Climeworks parallel)
- "Patient capital" / "Infrastructure"
- "Technical moat"

---

## Email Template A: To Karim Faris (Primary Target)

```
Subject: Open-Source Coordination for Distributed Energy - Kubernetes Model

Karim,

You led GV's investment in Climeworks - modular carbon capture that scales.
We're building the coordination layer for modular energy infrastructure,
with the same open-source strategy that made Kubernetes the cloud standard.

THE BREAKTHROUGH: EK-KOR2 RTOS

An open-source coordination system for distributed power electronics.
No central scheduler - modules self-organize through potential field
gradients, like biological swarms.

┌────────────────────────────────────────────────────────────┐
│  KUBERNETES : CONTAINERS :: EK-KOR2 : POWER MODULES        │
├────────────────────────────────────────────────────────────┤
│  • No single point of failure                              │
│  • Self-healing on node loss                               │
│  • Scale from small to massive                             │
│  • Open-source foundation + commercial ecosystem           │
└────────────────────────────────────────────────────────────┘

THE STRATEGY:

Google pioneered this playbook:
• Android → mobile ecosystem
• Kubernetes → cloud infrastructure
• TensorFlow → AI/ML foundation

EK-KOR2 → distributed energy coordination

Open-source the RTOS, build community adoption, sell certified
hardware and services. "Red Hat of distributed energy."

WHY THIS MATTERS:

Every modular energy system needs coordination:
• EV charging (depot, fast charging, MCS)
• Grid storage (battery farms, V2G)
• Microgrids (campus, industrial, residential)

Today: proprietary, brittle, no interoperability.
Tomorrow: open standard, like TCP/IP for energy.

TECHNICAL MOAT:

• Novel scheduling paradigm (potential fields)
• Dual C/Rust implementation (embedded + safety-critical)
• k=7 topological neighbors (scale-free network)
• Threshold consensus (distributed voting)
• Lock-free IPC (<100ns latency)

THE CLIMEWORKS PARALLEL:

Climeworks: Modular DAC units that scale.
EK-KOR2: Modular coordination that scales.
Same thesis: Open foundation, manufacturing scale, ecosystem.

TRACTION:

• EK-KOR2: Working C implementation, 22 test vectors passing
• EK3 module: Complete 3.3kW design (900V SiC, LLC topology)
• 5 patent concepts on hardware (WIPO PROOF Jan 2026)
• Ready to open-source on funding

ASK:

$2M seed to open-source EK-KOR2 and deploy certified hardware pilot.

This is a 10-year infrastructure play. We need patient capital with
technical depth and OSS DNA. That's GV.

Happy to walk through the coordination architecture with your team.

Bojan Janjatovic
Founder, Elektrokombinacija
https://github.com/elektrokombinacija/ek-kor2 (private, invite on request)
```

---

## Email Template B: To Erik Nordlander (Climate Partner)

```
Subject: Open-Source Coordination Layer for Fleet Electrification

Erik,

GV's climate thesis is clear: back breakthrough technologies that can scale.
Climeworks for carbon capture. Fervo for geothermal. Form for storage.

We're building the missing layer: open-source COORDINATION for distributed
energy infrastructure.

THE PROBLEM:
────────────
Electric fleet operators face 15-30% charger downtime. But the deeper
problem: every vendor builds proprietary coordination. No standard.
No interoperability. Brittle systems.

THE BREAKTHROUGH: EK-KOR2
─────────────────────────
Open-source RTOS for modular power electronics:

• Potential field scheduling (no central coordinator)
• Self-organizing distributed consensus
• Self-healing mesh topology
• MIT license - "Kubernetes for energy infrastructure"

WHY OPEN SOURCE WINS:
─────────────────────
Google proved this playbook works:
• Android dominated mobile through open ecosystem
• Kubernetes dominated cloud through open ecosystem
• EK-KOR2 will dominate distributed energy coordination

THE CLIMEWORKS PARALLEL:
────────────────────────
Climeworks: Modular carbon capture → open ecosystem for DAC
EK-KOR2: Modular coordination → open ecosystem for energy

Same thesis: standardize the building blocks, open the platform,
monetize hardware and services.

MARKET TIMING:
──────────────
• EU mandates 100% electric buses by 2035
• $100B+ infrastructure buildout happening NOW
• No open coordination standard exists
• First-mover advantage on ecosystem creation

THE TECHNICAL MOAT:
───────────────────
• Novel scheduling paradigm (potential fields, no SPOF)
• Dual C/Rust implementation
• 5 patent concepts on hardware
• 12-18 month ecosystem head start

ASK:
────
$2M seed to open-source EK-KOR2 and deploy pilot with EU operator.

This is a patient capital play. Infrastructure standards take time
to establish. GV's Alphabet backing makes you the right partner.

Bojan Janjatovic
Founder, Elektrokombinacija
```

---

## Email Template C: To Tom Hulme (Europe + Design)

```
Subject: Open-Source Energy Infrastructure Standard - European Launch

Tom,

With your European focus and design background, wanted to share what
we're building: an open-source coordination standard for modular
energy infrastructure, launching from Europe.

THE DESIGN PRINCIPLE:
─────────────────────
Current energy coordination is like pre-Kubernetes cloud:
• Every vendor's proprietary solution
• No interoperability
• Central schedulers = single points of failure

EK-KOR2: Designed for distributed autonomy from first principles.
No central coordinator. Self-healing. Open-source.

THE EUROPEAN OPPORTUNITY:
─────────────────────────
• EU mandates 100% electric buses by 2035
• €100B+ infrastructure investment coming
• European transit authorities prefer open standards
• GAIA-X initiative favors open-source infrastructure

WHY EUROPE FIRST:
─────────────────
• Regulatory tailwind (EU 2035 mandate)
• Open-source friendly (vs US proprietary bias)
• GV's European presence through you
• Serbia base = EU-adjacent, cost-effective R&D

THE STRATEGY:
─────────────
Open-source EK-KOR2 (MIT license) → build European developer community
→ first hardware pilots with EU transit operators → expand globally.

Would love to discuss GV's European strategy and how EK-KOR2 fits
your open infrastructure thesis.

Bojan Janjatovic
Founder, Elektrokombinacija
```

---

## One-Pager (GV-Optimized)

### Header
```
ELEKTROKOMBINACIJA
Open-Source Coordination for Distributed Energy
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"What Kubernetes did for cloud, we're doing for energy infrastructure"
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

Sound familiar?
This was cloud infrastructure before Kubernetes.
```

### Solution
```
EK-KOR2: OPEN-SOURCE COORDINATION RTOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────┐
│  KUBERNETES : CONTAINERS :: EK-KOR2 : POWER MODULES     │
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
1. Potential Field Scheduling - swarm-like coordination
2. Topological k=7 Neighbors - scale-free network
3. Threshold Consensus - distributed voting
4. Adaptive Mesh - self-healing on failures

IMPLEMENTATION:
• Dual C/Rust (embedded + safety-critical)
• STM32G474 target (Cortex-M4, 170MHz)
• CAN-FD @ 5Mbps communication
• MIT License - fully open-source
```

### Why Layered Open Source

```
GOOGLE'S LAYERED STRATEGY APPLIED TO ENERGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GOOGLE'S PROVEN MODEL:
Android (OSS)    + Google Apps (proprietary)  = Mobile dominance
Kubernetes (OSS) + GKE (proprietary)          = Cloud revenue
Chromium (OSS)   + Google services (propri.)  = Browser dominance

OUR MODEL:
EK-KOR2/JEZGRO (OSS) + Hardware/Apps (proprietary) = Energy standard

┌─────────────────────────────────────────────────────────┐
│  PROPRIETARY: Hardware, Fleet Mgmt, Applications        │
│  ─────────────────────────────────────────────────────  │
│  OPEN SOURCE: EK-KOR2 RTOS, JEZGRO Kernel               │
└─────────────────────────────────────────────────────────┘

WHY LAYERED STRATEGY WINS:
✓ OS layer: Network effects, community, standard creation
✓ App layer: Revenue protection, competitive differentiation
✓ Hardware: Margins, certification moat, quality control
✓ Best of both: adoption + revenue

BUSINESS MODEL:
1. Open-source OS layer (EK-KOR2 RTOS, JEZGRO kernel)
2. Build community/ecosystem → becomes standard
3. Sell proprietary hardware (EK3 modules)
4. Proprietary fleet management + applications
5. Cloud telemetry (GCP opportunity)

GV UNDERSTANDS THIS - IT'S YOUR OWN STRATEGY.
```

### Why GV

```
PERFECT FIT FOR GV'S THESIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CLIMATE PORTFOLIO EXTENSION:
✓ Climeworks: Modular carbon capture (parallel thesis)
✓ Commonwealth Fusion: Breakthrough generation
✓ Fervo: Geothermal infrastructure
✓ Form Energy: Grid storage
✓ EK-KOR2: Distribution coordination (missing layer)

OPEN-SOURCE DNA:
✓ GV backed Android, Kubernetes precursors
✓ Understands ecosystem monetization
✓ Patient capital for standard adoption

GOOGLE SYNERGIES:
✓ Google Cloud for fleet telemetry
✓ AI/ML for predictive maintenance
✓ Waymo autonomy principles (self-healing)
✓ Design sprint methodology

PATIENT CAPITAL:
✓ Infrastructure standards take time
✓ Alphabet backing = no fund pressure
✓ Can wait for ecosystem to mature
```

### Market

```
TAM: €100B+ - EU bus fleet electrification by 2035
SAM: €10B   - Charging infrastructure
SOM: €500M  - Coordination/reliability layer

TIMING:
• EU 2035 mandate creates guaranteed demand
• No open coordination standard exists
• First-mover advantage on ecosystem

EXPANSION PATH:
Bus depot → fast charging → MCS trucks → grid storage → microgrids
(Same RTOS coordinates all of them)
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
• Enterprise-grade reliability mindset (NCR/Toshiba scale)
• Large-scale distributed systems experience
• Real-time logistics optimization (postal sorting)
• Production-quality code standards

BUILDING:
• Embedded systems community (post open-source)
• Power electronics engineers (EK3 hardware)
• Rust/C systems programmers
```

### Ask

```
$2M SEED ROUND
════════════════════════════════════════════════════
EK-KOR2 open-source launch      $300K (docs, CI/CD, community)
EK3 hardware development        $700K (prototype, certification)
EU pilot deployment             $500K (transit operator)
Team expansion                  $400K (4 engineers)
IP protection                   $100K (hardware patents)
────────────────────────────────────────────────────
MILESTONE: Open-source ecosystem launch + hardware pilot, 12-18 months
EXIT PATH: Strategic acquisition or Series A
```

---

## GV Conversation Prep

### Expected Questions:

1. **"How does this relate to Kubernetes?"**
   → "Same coordination problem, different domain. Kubernetes schedules
      containers across nodes. EK-KOR2 schedules power delivery across
      modules. Both: no SPOF, self-healing, open-source ecosystem."

2. **"What's the Google Cloud angle?"**
   → "Fleet telemetry and predictive maintenance run on GCP. Every module
      reports health data. ML models predict failures. This is a natural
      GCP workload - high-frequency industrial IoT."

3. **"Why won't existing charger vendors open-source?"**
   → "Classic innovator's dilemma. ABB and Siemens monetize through
      proprietary lock-in. Open-sourcing would cannibalize their
      service revenue. We have nothing to lose, everything to gain."

4. **"What's the Waymo connection?"**
   → "Autonomous systems principles. Waymo coordinates sensors and
      actuators without central control. EK-KOR2 coordinates power
      modules the same way. Self-healing, distributed intelligence."

5. **"How do you monetize open-source?"**
   → "Same as Android: open the platform, monetize the hardware.
      EK-KOR2 is free. EK3 certified modules are not. Plus
      professional services for enterprise deployments."

### Technical Deep-Dive Points:

```
ARCHITECTURE HIGHLIGHTS FOR ENGINEERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. POTENTIAL FIELD SCHEDULING
   - Inspired by robotics path planning
   - Each module publishes "field" (load, thermal, power)
   - Work flows along gradients (like water downhill)
   - No central coordinator needed

2. K=7 TOPOLOGICAL NEIGHBORS
   - Scale-free network structure
   - Each module tracks 7 nearest neighbors
   - Network remains connected even with failures
   - Inspired by small-world network research

3. THRESHOLD CONSENSUS
   - Distributed voting for decisions
   - No leader election required
   - Supermajority (67%) for critical ops
   - 50ms timeout, fast convergence

4. LOCK-FREE IPC
   - Sequence counter pattern
   - <100ns field publish latency
   - No mutex contention
   - Safe for real-time constraints

5. DUAL IMPLEMENTATION (C + Rust)
   - C: Legacy embedded compatibility
   - Rust: Memory safety for critical paths
   - Cross-validation catches bugs
   - Attracts both developer communities
```

---

## GV Application Strategy

### Approach Order:

```
1. KARIM FARIS (Infrastructure + Climate)       ← PRIMARY
   - Led Climeworks investment
   - Technical depth, ex-Google engineer
   - OSS understanding from YouTube scale
   - Email Template A

2. ERIK NORDLANDER (Climate Partner)            ← SECONDARY
   - Direct fit with climate thesis
   - Led Fervo, Form Energy investments
   - Email Template B

3. TOM HULME (Europe)                           ← EU ANGLE
   - If US outreach doesn't work
   - European market positioning
   - Email Template C

4. GENERAL APPLICATION (gv.com)                 ← PARALLEL TRACK
   - Submit while doing direct outreach
```

### Follow-up Strategy

```
DAY 1: Submit GV general application
       (emphasize OSS strategy, Kubernetes parallel)

DAY 2-3: LinkedIn connection to Karim Faris
         "Building open-source coordination for distributed energy.
          Similar playbook to Kubernetes. Would value your perspective."

DAY 4-5: Direct email to Karim (Template A)
         Subject: "Open-Source Coordination for Distributed Energy"

WEEK 2: If no response:
        - Make EK-KOR2 repo public, generate GitHub buzz
        - HackerNews technical post
        - Engage with GV portfolio companies

WEEK 3: Follow-up email with traction update
        "Just open-sourced EK-KOR2. X stars in first week.
         Community response is strong. Happy to discuss."

PARALLEL TRACK:
- Connect through Climeworks/Fervo network
- Google Cloud for Startups program
- CNCF connections (Kubernetes community)
```

---

## Key Phrases (GV Language)

### USE:
- "Kubernetes for energy"
- "Open-source foundation"
- "Ecosystem monetization"
- "Standard creation"
- "Self-healing infrastructure"
- "No single point of failure"
- "Patient capital"
- "Climeworks thesis"
- "Technical depth"
- "Google Cloud synergies"

### AVOID:
- "Better chargers" (too incremental)
- "Green tech" (unless economic angle)
- "Revolutionary" (let them say it)
- Timeline estimates
- Comparisons to non-Google OSS projects

---

## Competitive Positioning

```
IF ASKED ABOUT COMPETITION:

"Why won't ABB/Siemens open-source?"
→ "They're invested in proprietary lock-in. Their business model
   is service revenue on closed systems. Open-sourcing would
   cannibalize that. Classic innovator's dilemma."

"What about OpenEMS or other energy OSS?"
→ "OpenEMS does building energy management (BMS level). We're doing
   real-time coordination for power electronics (module level).
   Different layer - actually complementary."

"Why won't someone fork and compete?"
→ "That's success, not failure. When Android got forked, Google won
   because the ecosystem grew. We're building the foundation - forks
   validate the standard."

"What's the moat if code is open?"
→ "Standard creation moat. Once EK-KOR2 is THE coordination layer,
   switching costs are high. Plus hardware patents on EK3 implementation.
   Same model as Android - open software, proprietary hardware."
```

---

*Document updated: 2026-01-12*
*Target: Karim Faris, Erik Nordlander - GV (Google Ventures)*
*Strategy: Open-source standard creation (Kubernetes model)*

---

## Sources

- [GV Climate Portfolio](https://www.gv.com/portfolio/?sector=Climate)
- [Google Open Source](https://opensource.google/)
- [Kubernetes Origin Story](https://kubernetes.io/blog/2018/07/20/the-history-of-kubernetes-the-community-behind-it/)
- [Android Open Source Project](https://source.android.com/)
- [EK-KOR2 Technical Specification](../../ek-kor2/spec/api.md)
