# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working Language & Documentation

- **Working language:** English (for all development, skills, internal tools)
- **Documentation:** Bilingual (Serbian + English), identical content in both languages
- **Technical docs** (`tehnika/`): English primary, Serbian `.sr.md` versions parallel
- **Patent docs** (`patent/`): English primary, Serbian `.sr.md` versions parallel
- **Skills/agents:** English only (`.claude/skills/`)

## Project Overview

**Elektrokombinacija** - Modular EV charging infrastructure for electric bus fleets.
Current concept: **EK3 (3.3kW modules)** that combine for any power level (3kW to 3MW).

## Documentation Structure

### `/patent/` - IP Foundation (Primary)
```
01-IP-FOUNDATION/      # 5 invention disclosures, priority proof log
02-STRATEGY/           # Filing strategy, DIY master plan, competitive research
03-TECHNICAL-SUPPORT/  # EK3 design, control system, sensors, safety certification
04-EXECUTION/          # Funding strategy, team matrix, investor pitches
99-ARCHIVE/            # Superseded documents
```

**Key patent documents:**
- `01-IP-FOUNDATION/01-05-invention-disclosure-*.md` - 5 core inventions
- `02-STRATEGY/FILING-STRATEGY-HYBRID.md` - Current 3-patent family strategy
- `03-TECHNICAL-SUPPORT/EK3-DETAILED-DESIGN.md` - Complete EK3 3.3kW module spec

### `/tehnika/` - Technical Documentation
```
00-arhitektura.md          # System architecture overview
01-09-*.md                 # Power electronics, AI/ML, thermal, V2G, swarm, BOM, etc.
komponente/                # Detailed component specs (semiconductors, gate drivers, etc.)
SPECIFICATIONS.md          # Master specification document (single source of truth)
```

### `/strategija/` - Business Strategy
- `kombinacije-strategije.md` - 8 development paths
- `abb-srbija.md` - ABB vendor-specific for Serbia/EXPO 2027

### `/reference/` - Consolidated Research
- `standardi-protokoli.md` - CCS, MCS, ISO 15118, OCPP, pantograph standards
- `trziste-analiza.md` - Market size, competitors, pricing
- `case-studies.md` - Hamburg, Schiphol, Belgrade, Western Balkans

### `/_archive/` - Obsolete Documents
Contains superseded concept documents (EK10, PM50) and merged research files.

## Web Demo Application

```bash
cd web
npm install
npm run dev     # http://localhost:5173
npm run build   # Production build to dist/
```

Auto-deploys to Azure Static Web Apps on push to `main`.

## Key Concepts

- **EK3 Module:** 3.3kW, LLC topology, 900V SiC MOSFETs (Wolfspeed), STM32G474, CAN-FD @ 5Mbps
- **Dimensions:** 200×320×44mm (1U half-width), 3.5kg
- **Priority Date:** 2026-01-02 (Git verified, WIPO PROOF pending)
- **Patent Family:** 3 patents (A: umbrella, B: dual-robot, C: fleet logistics)
- **5 Inventions:** Modular architecture, swap station, distributed sparing, fleet logistics, coordinated robots

## Master Specification

See `tehnika/SPECIFICATIONS.md` for single source of truth on all EK3 specs.

## Skills / Slash Commands

Available skills for project work:

### Specifications & Consistency
- `/spec-update` - Update specifications across all documents
- `/consistency-check` - Check documentation consistency
- `/codex-review` - Technical review following codex-report.md pattern

### Patent & IP
- `/patent-draft` - Create new patent disclosure documents

### Technical Calculations
- `/power-calc` - Power electronics calculations
- `/bom-calc` - Bill of Materials and costs
- `/thermal-analysis` - Thermal analysis for modules and racks

### Design
- `/robot-design` - Robotic swap system specifications
- `/v2g-design` - Vehicle-to-Grid functionality
- `/swarm-design` - Swarm intelligence for module coordination
- `/ai-ml` - AI/ML for predictive maintenance

### Standards & Compliance
- `/standards-check` - Industry standards compliance verification

### Web & Localization
- `/web-update` - Update React demo application
- `/translate-sr` - Serbian translation (avoid anglicisms)

## Scaling Reference

| Use Case | Modules | Power |
|----------|---------|-------|
| E-bike | 1 | 3.3 kW |
| Home | 7 | 23 kW |
| DC Fast | 46 | 152 kW |
| Bus Depot | 152 | 502 kW |
| 1 MW | 303 | 1 MW |
| 3 MW (MCS) | 909 | 3 MW |

## Bilingual Documentation Guidelines

**Standard naming convention (English primary everywhere):**
- English (primary): `document.md`
- Serbian: `document.sr.md`

This applies to all documentation folders:
- `/tehnika/` - Technical documentation
- `/patent/` - Patent documentation
- `/strategija/` - Business strategy
- `/reference/` - Research materials

**Exceptions:**
- **Web app** (`web/`): Bilingual via i18n (`sr.json`, `en.json`)
- **Internal tools** (`.claude/`): English only
