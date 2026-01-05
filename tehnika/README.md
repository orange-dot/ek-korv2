# Technical Documentation / Tehnička Dokumentacija

This folder contains all technical documentation for the ELEKTROKOMBINACIJA EV charging system.

## Structure / Struktura

```
tehnika/
├── konceptualno/          # Conceptual / Konceptualno
│   ├── en/                # English versions
│   └── sr/                # Serbian versions
├── inzenjersko/           # Engineering / Inženjersko
│   ├── en/                # English versions
│   │   └── komponente/    # Component specifications
│   └── sr/                # Serbian versions
│       └── komponente/    # Specifikacije komponenti
└── _archive/              # Archived documents
```

---

## Conceptual Documentation / Konceptualna Dokumentacija

High-level architecture, philosophy, and strategic overview.

| EN | SR | Description |
|----|----|----|
| [00-arhitektura](konceptualno/en/00-arhitektura.md) | [00-arhitektura](konceptualno/sr/00-arhitektura.md) | System architecture philosophy |
| [01-v2g-grid](konceptualno/en/01-v2g-grid.md) | [01-v2g-grid](konceptualno/sr/01-v2g-grid.md) | V2G and grid integration concepts |
| [02-roj-intelligence](konceptualno/en/02-roj-intelligence.md) | [02-roj-intelligence](konceptualno/sr/02-roj-intelligence.md) | ROJ distributed intelligence for fleet coordination |
| [03-konkurencija](konceptualno/en/03-konkurencija.md) | [03-konkurencija](konceptualno/sr/03-konkurencija.md) | Competitive analysis |
| [04-small-battery-philosophy](konceptualno/en/04-small-battery-philosophy.md) | [04-small-battery-philosophy](konceptualno/sr/04-small-battery-philosophy.md) | **NEW** Small batteries + frequent swaps paradigm |

---

## Engineering Documentation / Inženjerska Dokumentacija

Detailed specifications, equations, control algorithms, and implementation-ready designs.

### Core Documents / Osnovni Dokumenti

| EN | SR | Description |
|----|----|----|
| [SPECIFICATIONS](inzenjersko/en/SPECIFICATIONS.md) | [SPECIFICATIONS](inzenjersko/sr/SPECIFICATIONS.md) | Master specification (single source of truth) |
| [01-power-electronics](inzenjersko/en/01-power-electronics.md) | [01-power-electronics](inzenjersko/sr/01-power-electronics.md) | Power electronics design |
| [02-ai-ml-sistem](inzenjersko/en/02-ai-ml-sistem.md) | [02-ai-ml-sistem](inzenjersko/sr/02-ai-ml-sistem.md) | AI/ML for predictive maintenance |
| [03-thermal-management](inzenjersko/en/03-thermal-management.md) | [03-thermal-management](inzenjersko/sr/03-thermal-management.md) | Thermal analysis and cooling |
| [04-bom-cost](inzenjersko/en/04-bom-cost.md) | [04-bom-cost](inzenjersko/sr/04-bom-cost.md) | Bill of Materials and costs |
| [05-swap-station](inzenjersko/en/05-swap-station.md) | [05-swap-station](inzenjersko/sr/05-swap-station.md) | Module swap station design |

### Firmware & Control / Firmware i Kontrola

| EN | SR | Description |
|----|----|----|
| [06-microkernel-architecture](inzenjersko/en/06-microkernel-architecture.md) | [06-microkernel-architecture](inzenjersko/sr/06-microkernel-architecture.md) | Microkernel firmware architecture |
| [07-v2g-control](inzenjersko/en/07-v2g-control.md) | [07-v2g-control](inzenjersko/sr/07-v2g-control.md) | V2G control algorithms (PLL, droop) |
| [08-iso15118-bpt](inzenjersko/en/08-iso15118-bpt.md) | [08-iso15118-bpt](inzenjersko/sr/08-iso15118-bpt.md) | ISO 15118-20 BPT protocol |
| [11-v2g-ai-ml](inzenjersko/en/11-v2g-ai-ml.md) | [11-v2g-ai-ml](inzenjersko/sr/11-v2g-ai-ml.md) | AI/ML for V2G optimization |
| [13-firmware-architecture](inzenjersko/en/13-firmware-architecture.md) | [13-firmware-architecture](inzenjersko/sr/13-firmware-architecture.md) | STM32G474 firmware design |
| [16-jezgro](inzenjersko/en/16-jezgro.md) | [16-jezgro](inzenjersko/sr/16-jezgro.md) | Core kernel system |
| [rojno-jezgro-core-spec](inzenjersko/en/rojno-jezgro/00-core-spec.md) | [rojno-jezgro-core-spec](inzenjersko/sr/rojno-jezgro/00-core-spec.md) | ROJNO JEZGRO core spec (swarm core) |
| [rojno-jezgro-detalji](inzenjersko/en/rojno-jezgro/01-detaljni-dokument.md) | [rojno-jezgro-detalji](inzenjersko/sr/rojno-jezgro/01-detaljni-dokument.md) | Detailed ROJNO JEZGRO design for further development |

### Security / Bezbednost

| EN | SR | Description |
|----|----|----|
| [09-security-model](inzenjersko/en/09-security-model.md) | [09-security-model](inzenjersko/sr/09-security-model.md) | Security architecture |
| [10-audit-logging](inzenjersko/en/10-audit-logging.md) | [10-audit-logging](inzenjersko/sr/10-audit-logging.md) | Audit logging design |
| [12-hardware-security](inzenjersko/en/12-hardware-security.md) | [12-hardware-security](inzenjersko/sr/12-hardware-security.md) | Hardware security modules |

### Hardware Design / Dizajn Hardvera

| EN | SR | Description |
|----|----|----|
| [14-ek3-connector-spec](inzenjersko/en/14-ek3-connector-spec.md) | [14-ek3-connector-spec](inzenjersko/sr/14-ek3-connector-spec.md) | EK3 connector specifications |
| [15-custom-rack-system](inzenjersko/en/15-custom-rack-system.md) | [15-custom-rack-system](inzenjersko/sr/15-custom-rack-system.md) | Custom rack system design |

---

## Component Specifications / Specifikacije Komponenti

Detailed specifications for all EK3 module components.

| EN | SR | Description |
|----|----|----|
| [poluprovdnici](inzenjersko/en/komponente/poluprovdnici.md) | [poluprovdnici](inzenjersko/sr/komponente/poluprovdnici.md) | Semiconductors (SiC MOSFETs) |
| [gate-driveri](inzenjersko/en/komponente/gate-driveri.md) | [gate-driveri](inzenjersko/sr/komponente/gate-driveri.md) | Gate drivers |
| [pasivne-komponente](inzenjersko/en/komponente/pasivne-komponente.md) | [pasivne-komponente](inzenjersko/sr/komponente/pasivne-komponente.md) | Passive components |
| [power-electronics](inzenjersko/en/komponente/power-electronics.md) | [power-electronics](inzenjersko/sr/komponente/power-electronics.md) | Power stage components |
| [kontrolna-elektronika](inzenjersko/en/komponente/kontrolna-elektronika.md) | [kontrolna-elektronika](inzenjersko/sr/komponente/kontrolna-elektronika.md) | Control electronics |
| [komunikacija](inzenjersko/en/komponente/komunikacija.md) | [komunikacija](inzenjersko/sr/komponente/komunikacija.md) | Communication (CAN-FD) |
| [konektori-kablovi](inzenjersko/en/komponente/konektori-kablovi.md) | [konektori-kablovi](inzenjersko/sr/komponente/konektori-kablovi.md) | Connectors and cables |
| [termalno-upravljanje](inzenjersko/en/komponente/termalno-upravljanje.md) | [termalno-upravljanje](inzenjersko/sr/komponente/termalno-upravljanje.md) | Thermal management |
| [mjerenje-billing](inzenjersko/en/komponente/mjerenje-billing.md) | [mjerenje-billing](inzenjersko/sr/komponente/mjerenje-billing.md) | Metering and billing |
| [emc-emi](inzenjersko/en/komponente/emc-emi.md) | [emc-emi](inzenjersko/sr/komponente/emc-emi.md) | EMC/EMI compliance |
| [hmi](inzenjersko/en/komponente/hmi.md) | [hmi](inzenjersko/sr/komponente/hmi.md) | Human-machine interface |
| [softver-firmware](inzenjersko/en/komponente/softver-firmware.md) | [softver-firmware](inzenjersko/sr/komponente/softver-firmware.md) | Software and firmware |
| [sigurnost](inzenjersko/en/komponente/sigurnost.md) | [sigurnost](inzenjersko/sr/komponente/sigurnost.md) | Safety systems |
| [module-interface-spec](inzenjersko/en/komponente/module-interface-spec.md) | [module-interface-spec](inzenjersko/sr/komponente/module-interface-spec.md) | Module interface specification |

---

## Navigation Guide / Vodič za Navigaciju

**For newcomers / Za početnike:**
1. Start with [00-arhitektura](konceptualno/en/00-arhitektura.md) for system philosophy
2. Read [04-small-battery-philosophy](konceptualno/en/04-small-battery-philosophy.md) for battery swap paradigm
3. Read [SPECIFICATIONS](inzenjersko/en/SPECIFICATIONS.md) for key parameters

**For developers / Za programere:**
1. [06-microkernel-architecture](inzenjersko/en/06-microkernel-architecture.md) for firmware structure
2. [07-v2g-control](inzenjersko/en/07-v2g-control.md) for control algorithms

**For hardware engineers / Za hardverske inženjere:**
1. [01-power-electronics](inzenjersko/en/01-power-electronics.md) for power stage
2. [03-thermal-management](inzenjersko/en/03-thermal-management.md) for thermal design
3. Component specs in `komponente/`

---

## Document Statistics / Statistika Dokumenata

| Category | EN | SR | Total |
|----------|----|----|-------|
| Conceptual | 5 | 5 | 10 |
| Engineering (main) | 18 | 18 | 36 |
| Components | 14 | 14 | 28 |
| **Total** | **37** | **37** | **74** |
