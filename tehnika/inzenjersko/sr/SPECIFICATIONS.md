# EK3 Master Specifikacije

**Verzija:** 1.0
**Datum:** 2026-01-03
**Status:** STANDARDIZOVANO

---

## Svrha Dokumenta

Ovaj dokument je **single source of truth** za sve EK3 specifikacije. Svi ostali dokumenti u repozitorijumu moraju biti usklađeni sa vrednostima ovde.

---

## EK3 Modul - Standardne Specifikacije

### Električne Karakteristike

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| Snaga (continuous) | **3.3 kW** | LLC resonant DC/DC |
| Snaga (peak) | **3.6 kW** | Kratkoročno |
| Input napon | 650V DC | Od centralnog PFC |
| Output napon | 50-500V DC | Pun opseg baterija |
| Efikasnost (peak) | >96% | @ 50% load |
| Efikasnost (full load) | >94% | @ 3.3 kW |
| Standby potrošnja | <3W | Deep sleep mode |

### Power Electronics

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| SiC MOSFET | **900V (Wolfspeed C3M0065090D)** | Optimalan balans cene i margine |
| Topologija | LLC Resonant DC/DC | ZVS, ZCS |
| Switching frekvencija | 150-250 kHz | Resonant |
| Transformer | Planar, PCB integrisan | Manufacturing repeatability |
| Kondenzatori | Film only | No electrolytics, >50,000h |

### Fizičke Karakteristike

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| Dimenzije | **200 × 320 × 44 mm** | 1U half-width |
| Masa | **~3.5 kg** | Sa heatsink-om |
| Form factor | Custom rack blade | Ne 19" telecom |
| Hlađenje | Forced air (shared plenum) | Front-to-back |

### Kontrola i Komunikacija

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| MCU | **STM32G474** | Cortex-M4 @ 170MHz |
| Komunikacija | **CAN-FD @ 5 Mbps** | 64-byte payload |
| CAN transceiver | NXP TJA1443 | CAN-FD capable |
| Latencija | <1ms per message | Real-time |

### Konektori

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| Data konektor | **20-pin blind-mate** | CAN-FD, I2C, PWM |
| Power konektori | Anderson SBS50 | Sequenced mating |
| Hot-swap vreme | <1 sekunda | Electrical disconnect |
| Mating ciklusi | >50,000 | Robot-grade |
| Insertion force | <20N | Robot-friendly |

### Pouzdanost

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| MTBF | >100,000 h | Calculated |
| Životni vek | >50,000 h | Film capacitors |
| Kapacitet gubitak po kvaru | 0.33% | 1/303 modula |

---

## Custom Rack Specifikacije

### Dimenzije (Preliminarno)

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| Širina | ~900 mm | Za 4× modula + spacing |
| Dubina | ~500 mm | Modul + airflow |
| Visina | ~1200 mm | Kompaktnije od 42U |
| Masa (pun) | ~350 kg | Sa 84 modula |
| Snaga po rack-u | **277 kW** | 84 × 3.3 kW |

### Termalni Dizajn

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| Airflow | Front-to-back | Shared plenum |
| Disipacija | ~11 kW | Pri 96% efikasnosti |
| Filter | Lako zamenjiv | Robot accessible |

### Centralni PFC

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| Input | 400V AC 3-phase | Grid connection |
| Output | 650V DC | DC bus za EK3 module |
| Redundancija | Modularan dizajn | N+1 |

---

## Skaliranje

| Use Case | Modula | Rack-ova | Snaga |
|----------|--------|----------|-------|
| E-bike | 1 | - | 3.3 kW |
| Home charger | 3-7 | - | 10-23 kW |
| DC Fast 50kW | 16 | Half | 53 kW |
| DC Fast 150kW | 46 | 1 | 152 kW |
| Highway 350kW | 106 | 2 | 350 kW |
| Bus Depot 500kW | 152 | 2 | 502 kW |
| Truck 1MW | 303 | 4 | 1 MW |
| MCS 3MW | 909 | 12 | 3 MW |

---

## Reference Dokumenti

### Arhitektura i Filozofija

| Dokument | Lokacija | Opis |
|----------|----------|------|
| Arhitektura pregled | `tehnika/00-arhitektura.md` | Sistemska filozofija |
| **Mikrokernel arhitektura** | `tehnika/10-microkernel-architecture.md` | MASTER DOC - Mikrokernel principi |
| Rack sistem | `tehnika/09-ek3-rack-sistem.md` | 3PAR inspiracija |
| Custom rack sistem | `tehnika/16-custom-rack-system.md` | Backplane kao "hardware microkernel" |

### Firmware i Softver

| Dokument | Lokacija | Opis |
|----------|----------|------|
| Firmware arhitektura | `tehnika/14-firmware-architecture.md` | RTOS, tasks, memory, secure boot |
| Swarm intelligence | `tehnika/05-swarm-intelligence.md` | Raft, load balancing, dual CAN |
| Module interface | `tehnika/komponente/module-interface-spec.md` | CAN protokol, state machine |
| Audit logging | `tehnika/12-audit-logging.md` | Event logging, forensics |

### Hardver i Sigurnost

| Dokument | Lokacija | Opis |
|----------|----------|------|
| Power electronics | `tehnika/01-power-electronics.md` | SiC, LLC topologija |
| Hardware security | `tehnika/13-hardware-security.md` | PCB, crypto, tamper detection |
| Connector spec | `tehnika/15-ek3-connector-spec.md` | 20-pin blind-mate |
| Security model | `tehnika/11-security-model.md` | RBAC, CMAC, trust tiers |

### Patenti i Dizajn

| Dokument | Lokacija | Opis |
|----------|----------|------|
| Kontrolni sistem | `patent/03-TECHNICAL-SUPPORT/CONTROL-SYSTEM-ARCHITECTURE.md` | 4-level hierarchy |
| EK3 detaljan dizajn | `patent/03-TECHNICAL-SUPPORT/EK3-DETAILED-DESIGN.md` | Kompletna specifikacija |
| Komunikacija | `tehnika/komponente/komunikacija.md` | CAN protokoli |

---

## Istorija Izmena

| Datum | Verzija | Opis |
|-------|---------|------|
| 2026-01-03 | 1.0 | Inicijalna standardizacija: 3.3kW, 900V SiC, CAN-FD, custom rack |
