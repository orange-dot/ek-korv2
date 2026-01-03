# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Elektrokombinacija** - Modular EV charging infrastructure for electric bus fleets.
Current concept: **EK3 (3kW modules)** that combine for any power level (3kW to 3MW).

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
- `03-TECHNICAL-SUPPORT/EK3-DETAILED-DESIGN.md` - Complete EK3 3kW module spec

### `/tehnika/` - Technical Documentation
```
00-arhitektura.md          # System architecture overview
01-09-*.md                 # Power electronics, AI/ML, thermal, V2G, swarm, BOM, etc.
komponente/                # Detailed component specs (semiconductors, gate drivers, etc.)
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

- **EK3 Module:** 3kW, LLC topology, SiC MOSFETs, ~$250 COGS
- **Priority Date:** 2026-01-02 (Git verified, WIPO PROOF pending)
- **Patent Family:** 3 patents (A: umbrella, B: dual-robot, C: fleet logistics)
- **5 Inventions:** Modular architecture, swap station, distributed sparing, fleet logistics, coordinated robots
