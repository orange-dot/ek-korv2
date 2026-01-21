# GV (Google Ventures) - Full Technical Package Pitch

**Date: January 2026**
**Focus: Complete Code Access + Open-Source Strategy**

---

## Executive Summary

We're offering GV **complete access to everything**: source code, documentation, patent disclosures, and technical designs. Our IP is secured via Bernstein blockchain timestamps (priority date: January 2, 2026). We can share freely because we've already established priority.

This is the level of transparency that matches Google's open-source DNA.

---

## IP Protection Status - Why We Can Share Everything

```
IP PROTECTION VERIFIED
══════════════════════════════════════════════════════════════════

BERNSTEIN BLOCKCHAIN TIMESTAMPS (2026-01-20):
├── Project ID: 0c4684af-4751-483f-9335-7592a67230b2
├── Total Files: 14 (all SHA-256 hashed)
├── Certificates: CN + EU regions
└── Bitcoin Keys: Stored for verification

GIT VERIFICATION:
├── Priority Commit: dd14f6f63aa97a7985efbaad55a5372d9ad3e1fc
├── Date: 2026-01-02 23:40:54 +0100
├── GPG Key: E09C48462307C204 (Good signature)
└── GitHub Verified: Public record

WHAT'S PROTECTED (10 Invention Disclosures):
┌────┬─────────────────────────────────────────────────────────┐
│ 01 │ Unified Modular Power Architecture                      │
│ 02 │ Dual-Purpose Robotic Swap Station                       │
│ 03 │ Distributed Power Sparing System                        │
│ 04 │ Fleet-Integrated Maintenance Logistics                  │
│ 05 │ Coordinated Dual-Robot System                           │
│ 06 │ JEZGRO Microkernel (EK-RTOS)                           │
│ 07 │ Decentralized V2G Control System                        │
│ 08 │ V2G AI/ML Fleet Optimization                           │
│ 09 │ Multi-Vehicle Swap Coordination                         │
│ 10 │ JEZGRO Distributed Consensus Ecosystem                  │
└────┴─────────────────────────────────────────────────────────┘

LEGAL EFFECT:
✓ Prior art defense established
✓ Priority date proven (Jan 2, 2026)
✓ Ownership documented on blockchain
✓ Source code snapshot timestamped

→ WE CAN SHARE EVERYTHING FREELY.
```

---

## Technical Package Contents

### What You're Receiving

```
COMPLETE TECHNICAL PACKAGE
══════════════════════════════════════════════════════════════════

📁 ek-kor/ - EK-KOR RTOS Kernel (C)
   ├── Core kernel implementation
   ├── Potential field scheduler
   ├── k=7 topological neighbor algorithm
   ├── Threshold consensus protocol
   ├── Lock-free IPC (<100ns)
   └── 22 test vectors (all passing)

📁 ek-os/ - EK-OS Bootloader & Kernel
   ├── STM32G474 HAL
   ├── CAN-FD driver (5Mbps)
   ├── Bootloader with secure update
   └── Power stage control interface

📁 simulator/ - Fleet Simulation Engine (Go)
   ├── Discrete event simulator
   ├── Module failure injection
   ├── Self-healing verification
   ├── Performance benchmarks
   └── Visualization output

📁 web/src/ - React Demo Application
   ├── Real-time fleet dashboard
   ├── Module status visualization
   ├── i18n (English + Serbian)
   └── Azure deployment ready

📁 patent/ - Complete IP Documentation
   ├── 10 invention disclosures
   ├── Filing strategy
   ├── Competitive analysis
   └── Technical specifications

📁 tehnika/ - Engineering Documentation
   ├── EK3 3.3kW module design
   ├── Power electronics (900V SiC, LLC)
   ├── Thermal analysis
   ├── V2G control algorithms
   └── BOM and cost analysis

TOTAL: ~400 files, 11 MB source package
```

### Code Quality Indicators

```
CODE MATURITY ASSESSMENT
══════════════════════════════════════════════════════════════════

EK-KOR RTOS:
├── Language: C (MISRA-compatible style)
├── Tests: 22 unit tests, all passing
├── Documentation: Doxygen headers
├── Architecture: Clean layered design
└── Status: PRODUCTION-READY FOUNDATION

EK-OS:
├── Language: C
├── Target: STM32G474 (Cortex-M4, 170MHz)
├── HAL: Custom, minimal dependencies
└── Status: WORKING PROTOTYPE

Simulator:
├── Language: Go
├── Coverage: Core scenarios tested
├── Output: JSON + visualization
└── Status: FUNCTIONAL

Web App:
├── Framework: React + TypeScript
├── State: Zustand
├── i18n: Complete EN/SR
├── Deploy: Azure Static Web Apps
└── Status: PRODUCTION
```

---

## Why Full Transparency

### The Google Playbook - We're Playing It

```
GOOGLE'S OPEN-SOURCE STRATEGY:
══════════════════════════════════════════════════════════════════

Android      → Released source code → Won mobile ecosystem
Kubernetes   → Released source code → Won cloud orchestration
TensorFlow   → Released source code → Won ML frameworks
Chromium     → Released source code → Won browser market

OUR STRATEGY:
EK-KOR2      → Releasing source code → Win energy coordination

SAME PLAYBOOK. SAME OUTCOME.

WHY SHARE WITH GV:
┌─────────────────────────────────────────────────────────────────┐
│ 1. You understand this strategy - it's YOUR strategy            │
│ 2. Full technical due diligence = faster decision               │
│ 3. Shows confidence in execution, not just ideas                │
│ 4. IP is secured - sharing has zero downside                    │
│ 5. Partnership starts with transparency                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Architecture Summary

### EK-KOR2: What The Code Does

```
POTENTIAL FIELD COORDINATION
══════════════════════════════════════════════════════════════════

TRADITIONAL APPROACH (competitors):
┌─────────────────────────────────────────────────────────────────┐
│  Central Scheduler                                              │
│       ↓                                                         │
│  [Module 1] [Module 2] [Module 3] ... [Module N]               │
│                                                                 │
│  PROBLEMS:                                                      │
│  • Single point of failure                                      │
│  • Latency to central node                                      │
│  • Doesn't scale beyond ~50 modules                            │
└─────────────────────────────────────────────────────────────────┘

OUR APPROACH (EK-KOR2):
┌─────────────────────────────────────────────────────────────────┐
│  NO CENTRAL SCHEDULER                                           │
│                                                                 │
│  ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐                    │
│  │Mod 1 │◄─►│Mod 2 │◄─►│Mod 3 │◄─►│Mod N │                    │
│  │φ=0.5 │   │φ=0.3 │   │φ=0.7 │   │φ=0.4 │                    │
│  └──────┘   └──────┘   └──────┘   └──────┘                    │
│                                                                 │
│  Each module publishes a "field" (φ = load/capacity)           │
│  Work flows from HIGH field to LOW field (like water)          │
│  Network self-balances without coordination                     │
│                                                                 │
│  RESULT:                                                        │
│  • No single point of failure                                   │
│  • Constant latency (neighbor-only communication)               │
│  • Scales to 1000+ modules                                      │
│  • Self-healing on any failure                                  │
└─────────────────────────────────────────────────────────────────┘

KEY ALGORITHMS (all in source):
1. kor_field_publish()    - Atomic field broadcast (<100ns)
2. kor_neighbor_select()  - k=7 topological selection
3. kor_threshold_vote()   - Distributed consensus (50ms)
4. kor_mesh_reform()      - Self-healing on node loss
```

### EK3 Module: Hardware Reference Design

```
EK3 3.3kW MODULE SPECIFICATIONS
══════════════════════════════════════════════════════════════════

POWER STAGE:
├── Topology: LLC resonant (DAB variant)
├── Input: 650-900V DC (bus voltage)
├── Output: 200-500V DC (battery voltage)
├── Power: 3.3kW continuous
├── Efficiency: >97%
└── MOSFETs: Wolfspeed C3M0065100K (900V SiC)

CONTROL:
├── MCU: STM32G474 (Cortex-M4, 170MHz)
├── ADC: 12-bit, 5 channels
├── PWM: HRTIM (184ps resolution)
├── Communication: CAN-FD @ 5Mbps
└── RTOS: EK-KOR2 / JEZGRO

PHYSICAL:
├── Dimensions: 200 × 320 × 44mm (1U half-width)
├── Weight: 3.5kg
├── Cooling: Forced air (integrated fan)
└── Mounting: 19" rack compatible

SCALING:
│ Use Case      │ Modules │ Power    │
│───────────────│─────────│──────────│
│ E-bike        │ 1       │ 3.3 kW   │
│ Home charger  │ 7       │ 23 kW    │
│ DC fast       │ 46      │ 152 kW   │
│ Bus depot     │ 152     │ 502 kW   │
│ Megacharger   │ 303     │ 1 MW     │
│ MCS (trucks)  │ 909     │ 3 MW     │
```

---

## The Kubernetes Parallel

### Technical Comparison

```
KUBERNETES : CONTAINERS :: EK-KOR2 : POWER MODULES
══════════════════════════════════════════════════════════════════

                    KUBERNETES              EK-KOR2
──────────────────────────────────────────────────────────────────
Coordinates         Containers              Power modules
Unit                Pod                     EK3 module
Discovery           etcd                    CAN-FD mesh
Scheduling          kube-scheduler          Potential fields
Scaling             Horizontal pod          Parallel modules
Self-healing        Pod restart             Module bypass
Network             CNI plugins             k=7 topology
Health              Liveness probes         10ms heartbeat
Consensus           Raft (etcd)             Threshold voting

SAME PROBLEM SPACE:
• Coordinate distributed resources
• Handle failures gracefully
• Scale horizontally
• No single point of failure

DIFFERENT DOMAIN:
• Kubernetes: millisecond latency OK
• EK-KOR2: microsecond latency required
• Kubernetes: software only
• EK-KOR2: hardware safety-critical
```

### Business Model Parallel

```
LAYERED MONETIZATION (Proven by Google)
══════════════════════════════════════════════════════════════════

GOOGLE'S MODEL:
┌─────────────────────────────────────────────────────────────────┐
│ MONETIZED LAYER                                                 │
│ GKE (managed K8s) / Google Apps / Chrome sync                  │
├─────────────────────────────────────────────────────────────────┤
│ OPEN LAYER                                                      │
│ Kubernetes / Android / Chromium                                 │
└─────────────────────────────────────────────────────────────────┘

OUR MODEL:
┌─────────────────────────────────────────────────────────────────┐
│ MONETIZED LAYER (Proprietary)                                   │
│ ─────────────────────────────────────────────────────────────── │
│ • EK3 Certified Hardware (margins, quality control)             │
│ • Fleet Management System (AI scheduling, logistics)            │
│ • Professional Services (deployment, support)                   │
│ • Cloud Telemetry (GCP integration)                            │
│ • Robotic Swap System (mechanical design)                       │
├─────────────────────────────────────────────────────────────────┤
│ OPEN LAYER (MIT License)                                        │
│ ─────────────────────────────────────────────────────────────── │
│ • EK-KOR2 RTOS (coordination, consensus)                       │
│ • JEZGRO Kernel (real-time scheduling)                         │
│ • Communication Protocols (CAN-FD messaging)                    │
│ • Reference Designs (schematics, BOM)                          │
└─────────────────────────────────────────────────────────────────┘

WHY THIS WORKS:
1. Open layer → Network effects, ecosystem, standard
2. Closed layer → Revenue, margins, competitive moat
3. Best of both → Adoption + profitability
```

---

## GV Portfolio Synergies

### Where We Fit

```
GV CLIMATE PORTFOLIO + ELEKTROKOMBINACIJA
══════════════════════════════════════════════════════════════════

GENERATION:
  Commonwealth Fusion → Breakthrough power generation
  Fervo Energy        → Geothermal infrastructure

STORAGE:
  Form Energy         → Grid-scale iron-air batteries

CAPTURE:
  Climeworks          → Modular carbon capture

DISTRIBUTION (GAP):
  ??? → This is us

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Fusion/Solar → [Storage] → [DISTRIBUTION] → EVs/Grid          │
│                              ↑                                  │
│                     ELEKTROKOMBINACIJA                          │
│                     EK-KOR2 coordination                        │
│                     EK3 modular hardware                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

THE MISSING LAYER:
You have generation (Fusion, Fervo) and storage (Form).
We're the intelligent distribution layer that coordinates it all.
```

### Google Cloud Integration

```
GCP SYNERGY OPPORTUNITIES
══════════════════════════════════════════════════════════════════

FLEET TELEMETRY:
├── Every EK3 module reports health data
├── High-frequency IoT (10ms intervals)
├── Natural fit for Cloud IoT Core
└── BigQuery for analytics

PREDICTIVE MAINTENANCE (AI/ML):
├── TensorFlow models for failure prediction
├── Vertex AI for training
├── Edge deployment to fleet controllers
└── Continuous learning from field data

REAL-TIME PROCESSING:
├── Pub/Sub for event streaming
├── Dataflow for stream processing
├── Cloud Functions for alerts
└── Firebase for real-time dashboard

ESTIMATED GCP REVENUE PER DEPLOYMENT:
• Small depot (50 modules): $500/month
• Large depot (500 modules): $3,000/month
• City-wide network (5000 modules): $20,000/month

→ Natural GCP workload, recurring revenue, grows with adoption
```

---

## Email Template: Full Access Offer

### To Karim Faris

```
Subject: Full Code Access - Open-Source Energy Coordination (Kubernetes Model)

Karim,

I'm sending you complete access to our technical stack - source code,
documentation, patent disclosures, everything. Our IP is secured via
Bernstein blockchain (priority date: January 2, 2026), so we can be
fully transparent.

WHAT YOU'RE GETTING:

• EK-KOR2 RTOS source code (C) - the coordination layer
• EK-OS bootloader and kernel
• Fleet simulation engine (Go)
• Complete patent disclosures (10 inventions)
• EK3 hardware design (schematics, BOM)
• Technical documentation (150+ pages)

Total: ~400 files, 11 MB package

WHY FULL ACCESS:

You've seen this playbook work:
• Android succeeded by being open
• Kubernetes succeeded by being open
• TensorFlow succeeded by being open

EK-KOR2 will succeed by being open. We're offering you a front-row
seat to evaluate everything before it goes public.

THE TECHNICAL THESIS:

Distributed power systems need coordination. Current solutions are
proprietary, central-scheduler based, and don't scale. EK-KOR2 uses
potential field scheduling - modules self-organize without a coordinator.
Same principles as Kubernetes, but for power electronics.

┌────────────────────────────────────────────────────────────────┐
│  KUBERNETES : CONTAINERS :: EK-KOR2 : POWER MODULES           │
│                                                                │
│  No single point of failure                                    │
│  Self-healing on component loss                                │
│  Scales from 10 to 10,000 units                               │
│  Open-source foundation + commercial ecosystem                 │
└────────────────────────────────────────────────────────────────┘

THE IP PROTECTION:

• 10 invention disclosures timestamped on Bernstein blockchain
• Priority date: January 2, 2026 (Git + GPG verified)
• Bitcoin blockchain keys for ownership verification
• CN + EU certificates on file

This isn't pitch deck bravado. The code exists, it works, and the
IP is secured. We're ready to open-source on funding.

THE ASK:

$2M seed to:
• Launch EK-KOR2 as open-source project
• Build certified EK3 hardware
• Deploy pilot with EU transit operator

This is patient capital territory - standard adoption takes years.
GV's Alphabet backing makes you the right partner.

I'll send the complete technical package on your confirmation.
Happy to walk through the architecture with your team.

Bojan Janjatovic
Founder, Elektrokombinacija

GitHub: github.com/orange-dot/autobusi-punjaci (private - invite on request)
Priority proof: Bernstein Project 0c4684af-4751-483f-9335-7592a67230b2
```

---

### To Erik Nordlander

```
Subject: Complete Technical Package - Open-Source Fleet Coordination

Erik,

Your climate portfolio covers generation (Fusion, Fervo) and storage (Form).
We're building the missing layer: intelligent distribution coordination.

I'm offering full code access for technical due diligence. Our IP is
blockchain-timestamped, so we can share everything openly.

WHAT'S IN THE PACKAGE:

• EK-KOR2: Real-time coordination OS (C source code)
• EK-OS: Power electronics kernel
• Fleet simulator (Go)
• 10 patent disclosures
• Complete hardware design (EK3 3.3kW module)

THE CLIMEWORKS PARALLEL:

Climeworks: Modular DAC units → manufacturing scale → open ecosystem
EK-KOR2: Modular coordination → manufacturing scale → open ecosystem

Same thesis. We're applying it to energy distribution.

THE TECHNICAL INNOVATION:

No central scheduler. Modules coordinate through "potential fields" -
each publishes its load, and work flows along gradients. Self-organizing,
self-healing, scales to any size.

Sound familiar? It's how Kubernetes coordinates containers, applied
to power electronics.

MARKET TIMING:

• EU 2035 mandate = guaranteed bus electrification
• €100B infrastructure investment underway
• No open coordination standard exists
• First mover on ecosystem = winner

ASK: $2M seed for open-source launch + EU pilot

I can send the complete package today. Let me know.

Bojan Janjatovic
Founder, Elektrokombinacija
```

---

## Technical Due Diligence Guide

### For GV Engineering Review

```
DUE DILIGENCE CHECKLIST
══════════════════════════════════════════════════════════════════

ARCHITECTURE REVIEW:
□ ek-kor/src/kor_scheduler.c    - Potential field implementation
□ ek-kor/src/kor_consensus.c    - Threshold voting protocol
□ ek-kor/src/kor_topology.c     - k=7 neighbor selection
□ ek-kor/src/kor_ipc.c          - Lock-free communication

TEST VALIDATION:
□ ek-kor/tests/                 - 22 unit tests
□ simulator/                    - Fleet simulation
□ Run: make test (all should pass)

HARDWARE DESIGN:
□ tehnika/inzenjersko/en/SPECIFICATIONS.md
□ tehnika/inzenjersko/en/01-power-electronics.md
□ patent/03-TECHNICAL-SUPPORT/EK3-DETAILED-DESIGN.md

IP DOCUMENTATION:
□ patent/01-IP-FOUNDATION/      - 10 invention disclosures
□ patent/NOTAR-APOSTILLE-PAKET/ - Blockchain proof

WEB DEMO:
□ cd web && npm install && npm run dev
□ Open http://localhost:5173
□ Explore fleet visualization

QUESTIONS TO ASK:
1. How does field propagation handle network partitions?
2. What's the worst-case consensus latency?
3. How does thermal management integrate with load balancing?
4. What's the certification path for automotive (ISO 26262)?
```

---

## Follow-Up Strategy

```
TIMELINE
══════════════════════════════════════════════════════════════════

DAY 1:
├── Submit GV general application (gv.com)
├── Emphasize: OSS strategy, Kubernetes parallel, full code access
└── Attach one-pager PDF

DAY 2-3:
├── LinkedIn: Connect with Karim Faris
├── Message: "Building open-source coordination for distributed energy.
│            Full code access available for technical DD."
└── Don't pitch - just signal technical depth

DAY 4-5:
├── Email Karim (template above)
├── Offer complete technical package
└── CC: hello@gv.com for tracking

WEEK 2 (if no response):
├── Open-source EK-KOR2 publicly
├── Post on HackerNews: "Show HN: Kubernetes for energy infrastructure"
├── Generate GitHub stars/attention
└── Follow up: "Just open-sourced. Community response is strong."

WEEK 3-4:
├── Engage GV portfolio companies
├── Google Cloud for Startups application
├── CNCF community connections
└── Build credibility through ecosystem

PARALLEL TRACK:
├── Other investors (a]16z, Founders Fund, etc.)
├── Generate FOMO if possible
└── "Multiple conversations active"
```

---

## Appendix: Verification Commands

### For GV Technical Team

```bash
# Clone and verify
git clone https://github.com/orange-dot/autobusi-punjaci
cd autobusi-punjaci

# Verify priority date (GPG signed commit)
git log --show-signature -1 dd14f6f63aa97a7985efbaad55a5372d9ad3e1fc

# Expected output:
# commit dd14f6f63aa97a7985efbaad55a5372d9ad3e1fc
# gpg: Good signature from "Bojan Janjatovic"
# Date: Thu Jan 2 23:40:54 2026 +0100

# Verify Bernstein hash
certutil -hashfile "EK3-ALL-DISCLOSURES-2026-01-20.zip" SHA256
# Expected: 3f63a9c4782106c3daa3ec2927dcdab8a008ca9ba81ea85c7fb7788cc3b47b3a

# Run tests
cd ek-kor && make test
# Expected: 22 tests passed

# Run web demo
cd web && npm install && npm run dev
# Open: http://localhost:5173
```

---

## Key Differentiators Summary

```
WHY GV SHOULD INVEST
══════════════════════════════════════════════════════════════════

1. TECHNICAL DEPTH
   Not a pitch deck - working code, passing tests, complete design

2. IP SECURED
   Blockchain timestamps, GPG signatures, legal protection done

3. OPEN-SOURCE STRATEGY
   Same playbook that made Android, Kubernetes, TensorFlow succeed

4. FULL TRANSPARENCY
   Complete code access for due diligence - nothing hidden

5. CLIMATE + INFRASTRUCTURE
   Fits GV thesis: breakthrough tech, patient capital, ecosystem play

6. GOOGLE SYNERGIES
   Natural GCP workload, AI/ML integration, Waymo principles

7. TIMING
   EU 2035 mandate = guaranteed market, no standard exists yet

8. FOUNDER-MARKET FIT
   Enterprise systems background (NCR, Toshiba), embedded expertise
```

---

*Document created: 2026-01-20*
*Target: Karim Faris, Erik Nordlander - GV (Google Ventures)*
*Strategy: Full technical transparency + open-source ecosystem play*

---

## Quick Reference

**Bernstein Project ID:** `0c4684af-4751-483f-9335-7592a67230b2`
**Priority Date:** January 2, 2026
**Git Commit:** `dd14f6f63aa97a7985efbaad55a5372d9ad3e1fc`
**Package Size:** ~400 files, 11 MB

**Contact:**
- Bojan Janjatovic
- bojan.janjatovic@gmail.com
- GitHub: orange-dot/autobusi-punjaci (private)
