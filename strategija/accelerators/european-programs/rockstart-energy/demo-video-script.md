# EK3 Demo Video Script - Rockstart Energy

> **Document Purpose**: 2-3 minute video script for Rockstart Energy application
> **Target Length**: 2:30-3:00
> **Last Updated**: 2026-01-20
> **Status**: Ready for recording

---

## Video Overview

| Attribute | Details |
|-----------|---------|
| **Format** | Screen recording + voiceover |
| **Duration** | 2:30-3:00 |
| **Visual** | Terminal with ASCII demo + diagrams |
| **Audio** | Clear voiceover, no music |
| **Focus** | 4 D's alignment throughout |

---

## Key Messages to Convey

1. **Real working prototype** - Not slides, running code
2. **Distributed intelligence** - No central controller (Decentralization)
3. **Self-healing** - Automatic failure recovery
4. **V2G ready** - Grid interactive (Decarbonization + Digitalization)
5. **Transport focus** - Bus fleet electrification (Transport)

---

## Script

### Opening (0:00-0:20)

**Visual**: EK-KOR banner in terminal, company logo

**Voiceover**:
> "EK3 is modular EV charging infrastructure for European bus fleet electrification. What you're about to see is a working prototype of our core innovation: ROJ distributed swarm intelligence."
>
> "ROJ - Serbian for 'swarm' - enables hundreds of charging modules to coordinate without any central controller."

---

### 4 D's Context (0:20-0:45)

**Visual**: Simple diagram showing the 4 D's with EK3 mapping

**Voiceover**:
> "Our architecture directly addresses Rockstart's four D's of energy transition:"
>
> "Decentralization - each module has intelligence, no single point of failure."
>
> "Decarbonization - we enable bus fleet electrification at scale."
>
> "Digitalization - smart charging, V2G capability, predictive maintenance."
>
> "And Transport - this IS transport electrification."

---

### Demo Setup (0:45-1:00)

**Visual**: Terminal showing Docker command, modules initializing

**Voiceover**:
> "This demo runs seven EK3 modules in emulation. The same firmware code compiles for real STM32 microcontrollers - what you see here will run on physical hardware."
>
> "Let me start the demo."

**Action**: Run `docker-compose run hax-demo`

---

### Discovery Phase (1:00-1:30)

**Visual**: ASCII table showing modules discovering neighbors, progress bar filling

**Voiceover**:
> "Watch the modules discover each other on a virtual CAN bus. Each module finds its neighbors automatically - zero configuration needed."
>
> "Notice the neighbor counts increasing: one... three... five... all six neighbors found."
>
> [Pause for visual]
>
> "Discovery complete. In a real depot, this happens in under one second - a 152-module station coordinating instantly."

---

### Consensus Demo (1:30-1:55)

**Visual**: Vote proposal appearing, modules voting YES, approval message

**Voiceover**:
> "Now we demonstrate distributed consensus. Module 1 is proposing a mode change - in a real system, this could be switching from charging to V2G discharge."
>
> "Watch each module vote. This uses a Raft-inspired algorithm - the same technology that powers distributed databases like etcd and CockroachDB."
>
> [Pause for visual]
>
> "Vote approved. Seven modules reached consensus in under 100 milliseconds. No central controller involved."

---

### Failure & Recovery (1:55-2:30)

**Visual**: Module 4 marked as DEAD, remaining modules detecting loss, reformation

**Voiceover**:
> "Here's where it gets interesting. Watch what happens when a module fails."
>
> [Module 4 dies]
>
> "Module 4 just died. In a traditional charger, this might take down the entire system. With EK3, watch the remaining modules."
>
> [Pause for reformation]
>
> "They detected the failure through missed heartbeats and automatically reformed the mesh. No human intervention. No central controller."
>
> "The system continues operating with six modules. In a 1 megawatt installation with 303 modules, losing one module means just 0.3% capacity loss. That's true resilience."

---

### V2G Highlight (2:30-2:45)

**Visual**: V2G diagram or return to terminal with final stats

**Voiceover**:
> "Every EK3 module is bidirectional - V2G ready from day one. When buses are parked overnight, they become grid assets. Frequency regulation, peak shaving, emergency backup."
>
> "In the Netherlands alone, this could mean 50 to 200 euros per bus per month in grid services revenue."

---

### Closing (2:45-3:00)

**Visual**: Demo results showing all milestones passed, company logo

**Voiceover**:
> "This is EK3: distributed intelligence for EV charging infrastructure. Real code. Working prototype. Ready for European bus fleets."
>
> "Elektrokombinacija. Netherlands company, European vision."

---

## Recording Instructions

### Technical Setup

| Item | Specification |
|------|---------------|
| **Screen resolution** | 1920×1080 (Full HD) |
| **Terminal font** | Monospace, 18pt minimum |
| **Terminal colors** | High contrast (white on black) |
| **Recording software** | OBS Studio or asciinema |
| **Audio** | USB microphone, quiet room |

### Commands to Run

```bash
# Start demo
cd ek-kor2
docker-compose run hax-demo
```

### Post-Processing

1. Trim any long pauses
2. Add company logo at start/end (5 seconds each)
3. Export as MP4, 1080p
4. Target file size: <50MB

---

## Timing Breakdown

| Section | Start | Duration | Running Total |
|---------|-------|----------|---------------|
| Opening | 0:00 | 0:20 | 0:20 |
| 4 D's Context | 0:20 | 0:25 | 0:45 |
| Demo Setup | 0:45 | 0:15 | 1:00 |
| Discovery | 1:00 | 0:30 | 1:30 |
| Consensus | 1:30 | 0:25 | 1:55 |
| Failure/Recovery | 1:55 | 0:35 | 2:30 |
| V2G Highlight | 2:30 | 0:15 | 2:45 |
| Closing | 2:45 | 0:15 | 3:00 |

---

## Key Differences from HAX Version

| Aspect | HAX (90s) | Rockstart (3:00) |
|--------|-----------|------------------|
| **Duration** | 90 seconds | 2:30-3:00 |
| **4 D's** | Not mentioned | Explicit alignment |
| **V2G** | Brief mention | Dedicated section |
| **EU context** | Not emphasized | Throughout |
| **Framing** | Hardware focus | Energy transition focus |

---

## Rockstart-Specific Callouts

Include these phrases explicitly:

- "Decentralization" - in ROJ description
- "Decarbonization" - in problem framing
- "Digitalization" - in V2G section
- "Transport" - in opening and closing
- "Energy transition" - at least once
- "European bus fleets" - in opening
- "Grid services" - in V2G section
- "No central controller" - multiple times

---

## Backup Options

### If Live Demo Fails

Have pre-recorded backup:
1. Record successful demo beforehand
2. Keep recording ready
3. Can voice over pre-recorded video

### Simplified Version (2:00)

If needed, cut:
- 4 D's section (incorporate into other sections)
- V2G highlight (mention briefly in closing)

---

## Checklist Before Recording

- [ ] Docker environment tested
- [ ] Demo runs successfully 3× in a row
- [ ] Terminal font size readable at 1080p
- [ ] Microphone tested, room quiet
- [ ] Script printed for reference
- [ ] Water nearby for voiceover
- [ ] Logo files ready for post-production

---

## Document History

| Date | Change |
|------|--------|
| 2026-01-20 | Initial script adapted from HAX version for Rockstart |
