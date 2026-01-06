# ELEKTROKOMBINACIJA - Tehnički Koncept

## Filozofija: Povratak Modularnosti + AI

### Lekcija iz Prošlosti: Primer TV Servisa

```
EVOLUCIJA SERVISIRANJA TELEVIZORA:
════════════════════════════════════════════════════════════════

1970-1990: MODULARNI SISTEMI          1990-2000s: INTEGRISANI SISTEMI
─────────────────────────────         ─────────────────────────────
TV = šasija + moduli                  TV = jedna ploča + ASIC
Kvar? Zameni modul (30 min)           Kvar? Baci uređaj (ili skupo)
Modul → servis na popravku            Popravka nemoguća
Tehničar ne mora biti ekspert         Treba skupa oprema
Traje 15-20 godina                    Planned obsolescence
```

### Infrastruktura ≠ Potrošačka Elektronika

```
EV PUNJAČ NIJE TELEFON:
• Cena zamene: €20,000+, ne €500
• Downtime: Izgubljen prihod svaki sat
• Lokacija: Na autoputu, ne u prodavnici
• Očekivani vek: 15 godina, ne 2 godine

ZAKLJUČAK: Za infrastrukturu, MODULARNOST je pravilna arhitektura.
```

### ELEKTROKOMBINACIJA = Modularnost 1970s + AI 2020s

```
STARO                              NOVO
────────────────────────────────────────────────────────────
Tehničar menja modul (30 min)  →   Robot menja modul (60 sec)
Dijagnostika na licu mesta     →   AI predvidi kvar 2 ned ranije
Modul u servis na popravku     →   Modul u hub na refurbishment
Iskusan tehničar potreban      →   Tehničar nije potreban
```

---

## Dodatna Filozofija: AI-Powered

```
TRADICIONALNI PRISTUP              ELEKTROKOMBINACIJA
─────────────────────────────────────────────────────────────────
"Jednostavnije je bolje"     →    "AI upravlja kompleksnošću"
"IGBT jer je jeftiniji"      →    "SiC jer je efikasniji"
"Air cooling jer je lakše"   →    "Liquid jer je gušće"
"2-level jer je poznat"      →    "3-level jer je bolji THD"
"Reaktivni alarmi"           →    "Prediktivna dijagnostika"
"Nezavisni moduli"           →    "Swarm intelligence"
```

## Arhitektura Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ELEKTROKOMBINACIJA ECOSYSTEM                          │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         CLOUD LAYER                                  │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │   Digital    │  │  Predictive  │  │    Fleet     │              │   │
│  │  │    Twins     │  │  Analytics   │  │  Management  │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                              4G/5G/Fiber                                    │
│                                    │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       EDGE AI LAYER                                  │   │
│  │                                                                      │   │
│  │              ┌─────────────────────────────────┐                    │   │
│  │              │      MASTER CONTROLLER          │                    │   │
│  │              │                                 │                    │   │
│  │              │  • Swarm Coordinator            │                    │   │
│  │              │  • V2G/Grid Services            │                    │   │
│  │              │  • ISO 15118-20 Stack           │                    │   │
│  │              │  • Local AI Inference           │                    │   │
│  │              └─────────────────────────────────┘                    │   │
│  │                              │                                      │   │
│  │                         CAN-FD Bus                                  │   │
│  │                              │                                      │   │
│  └──────────────────────────────┼──────────────────────────────────────┘   │
│                                 │                                          │
│  ┌──────────────────────────────┼──────────────────────────────────────┐   │
│  │                       POWER LAYER                                    │   │
│  │                                                                      │   │
│  │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │   │
│  │   │  EK30   │  │  EK30   │  │  EK30   │  │  EK30   │  │  EK30   │  │   │
│  │   │ Module  │  │ Module  │  │ Module  │  │ Module  │  │ Module  │  │   │
│  │   │         │  │         │  │         │  │         │  │         │  │   │
│  │   │ 30 kW   │  │ 30 kW   │  │ 30 kW   │  │ 30 kW   │  │ 30 kW   │  │   │
│  │   │ SiC     │  │ SiC     │  │ SiC     │  │ SiC     │  │ SiC     │  │   │
│  │   │ 3-level │  │ 3-level │  │ 3-level │  │ 3-level │  │ 3-level │  │   │
│  │   │ AI Edge │  │ AI Edge │  │ AI Edge │  │ AI Edge │  │ AI Edge │  │   │
│  │   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  │   │
│  │        │            │            │            │            │        │   │
│  │        └────────────┴────────────┼────────────┴────────────┘        │   │
│  │                                  │                                  │   │
│  │                           DC BUS (parallel)                         │   │
│  │                                  │                                  │   │
│  └──────────────────────────────────┼──────────────────────────────────┘   │
│                                     │                                      │
│                              ┌──────┴──────┐                               │
│                              │   VEHICLE   │                               │
│                              │   CCS2/MCS  │                               │
│                              └─────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Moduli

### EK3 - Univerzalni Modul (3.3 kW)
```
Svrha: Jedan modul za SVE primene - od 3kW do 3MW
─────────────────────────────────────────────────
• SiC MOSFET 900V (Wolfspeed C3M0065090D)
• LLC rezonantna topologija (DC/DC)
• CAN-FD komunikacija @ 5 Mbps
• AI self-tuning control
• Digital twin embedded
• Dimenzije: 200 × 320 × 44 mm (1U half-width)
• Težina: ~3.5 kg
• Efikasnost: >96% peak, >94% @ 50% load
```

### EK30 - Production (30 kW)
```
Svrha: Skalirana verzija za komercijalne primene
─────────────────────────────────────────────────
• SiC MOSFET (1200V, 100A class)
• 3-level NPC topologija
• Liquid cooling
• V2G bidirekcioni
• Swarm-ready
• Dimenzije: ~400 × 300 × 150 mm
• Težina: ~12 kg
```

## Dokumenti u ovom folderu

### Core Documentation

1. **01-power-electronics.md** - SiC MOSFET selekcija, 3-level NPC topologija, LLC rezonantni konverter, gate driver dizajn, EMI/EMC, zaštita, BOM power stage
2. **02-ai-ml-sistem.md** - Edge AI hardver (STM32N6 NPU), digital twin arhitektura, predictive maintenance, self-tuning kontrola, anomaly detection, fleet learning
3. **03-thermal-management.md** - Liquid cooling sistem, coldplate dizajn, junction temperature estimacija, AI thermal control, safety features
4. **04-v2g-grid.md** - ISO 15118-20 implementacija, bidirekciona topologija, grid services (frequency/voltage regulation), grid codes compliance
5. **05-ROJ-intelligence.md** - Distribuirana arhitektura, CAN-FD komunikacija, load balancing algoritmi, fault tolerance, scalability, **Dual CAN redundancy**
6. **06-bom-cost.md** - Kompletni BOM za EK3 i EK30, cost breakdown, pricing strategija, TCO analiza, R&D investment
7. **07-konkurencija.md** - Analiza konkurencije, reliability kriza u industriji (podaci 2025), konkurentska prednost
8. **08-swap-station.md** - Robotska zamena EK modula + battery swap za autobuse, fleet-integrated maintenance, patentabilni koncept
9. **09-ek3-rack-sistem.md** - **KLJUČNA INOVACIJA**: Jedan modul (EK3) za SVE - od 3kW do 3MW, rack sistem, robot swap, radikalna modularnost, **3PAR storage inspiracija** (chunklets, wide striping, distributed sparing)

### Microkernel Architecture (NEW)

10. **10-microkernel-architecture.md** - **MASTER DOC**: Mikrokernel principi primenjeni na power electronics, slojevita arhitektura (HAL, Kernel, Services, Application), trust boundaries, message passing semantika
11. **11-security-model.md** - Trust tiers (0-3), RBAC za CAN komande, CMAC autentifikacija, key management, security events
12. **12-audit-logging.md** - Per-module logging, event types, forensics, data retention
13. **13-hardware-security.md** - PCB layout, guard rings, STM32G4 crypto, tamper detection, EMC za dual CAN
14. **14-firmware-architecture.md** - FreeRTOS konfiguracija, task scheduling, memory partitioning, secure boot chain, OTA updates
15. **15-ek3-connector-spec.md** - 20-pin blind-mate konektor, sequenced mating, hot-swap, ESD zaštita
16. **16-custom-rack-system.md** - Backplane kao "hardware microkernel", 84 slotova, robot interface, thermal zones

### Komponente

- **komponente/module-interface-spec.md** - CAN message contracts, state machine, capability model, protocol versioning

## Ključne Inovacije

### 1. Svaki Modul je Pametan
```
Tradicionalno: "Glup" power modul + centralni kontroler
ELEKTROKOMBINACIJA: Svaki modul ima AI edge processor

Prednosti:
• Distribuirana inteligencija
• Nema single point of failure
• Self-healing sistem
• Plug & play dodavanje modula
```

### 2. Digital Twin za Svaki Modul
```
Svaki fizički modul ima virtualnu kopiju u cloud-u:
• Real-time sinhronizacija stanja
• Simulacija "what-if" scenarija
• Predictive maintenance
• Remote diagnostics
```

### 3. Swarm Intelligence
```
Moduli komuniciraju peer-to-peer:
• Autonomna redistribucija opterećenja
• Kolektivna optimizacija efikasnosti
• Fault tolerance bez centralnog arbitra
• Emergent behavior za grid services
```

### 4. V2G Native
```
Nije dodatak, već core feature:
• Bidirekciona topologija od početka
• ISO 15118-20 Plug & Charge
• Grid frequency support
• Demand response ready
```

### 5. Robotic Swap Station
```
Kombinacija battery swap za autobuse + module swap za punjače:

AUTOBUS DOLAZI → Robot menja bateriju autobusa
              → Istovremeno robot menja EK modul ako treba
              → AI je predvideo zamenu unapred
              → Zero downtime, zero truck rolls
```

### 6. JEDAN MODUL ZA SVE (RADIKALNA MODULARNOST!)
```
TRADICIONALNO:                    ELEKTROKOMBINACIJA:
─────────────────────────────────────────────────────────────
Mali punjač = mali modul          Mali punjač = 1 × EK3
Srednji = srednji modul           Srednji = 10 × EK3
Veliki = veliki modul             Veliki = 100 × EK3
MCS = ogroman modul               MCS = 1000 × EK3

4+ različita dizajna              JEDAN dizajn za SVE

PREDNOSTI:
• Masovna proizvodnja = niska cena
• 1 kvar = 0.3% gubitak (ne 10%)
• Jedan tip rezervnog dela
• Robot menja za 40 sekundi
• Graceful degradation - nikad "pao"
```

### 7. 3PAR Storage Inspiracija
```
Isti principi koji su revolucionisali storage industriju:

STORAGE (3PAR)                    POWER (EK3)
─────────────────────────────────────────────────────────────
Chunklets (1GB blokovi)      →    EK3 (3kW moduli)
Wide striping (svi diskovi)  →    Load preko SVIH modula
Distributed sparing          →    Nema hot-spare, rezerva distribuirana
Thin provisioning            →    Sleep mode za neaktivne module
Mesh-active kontroleri       →    Swarm intelligence

HP kupio 3PAR za $2.35B (2010) - DOKAZAN KONCEPT!
```

### 8. Proširena modularnost: Baterije vozila (EK-BAT)
```
Ista radikalna modularnost primenjuje se na BATERIJE VOZILA:

MODULARNOST PUNJAČA                MODULARNOST BATERIJE
─────────────────────────────────────────────────────────────
EK3 (3kW) moduli punjača      →    EK-BAT moduli baterija vozila
Robot menja module punjača    →    Robot menja baterije vozila
Distribuirana rezerva         →    Zajednički bazen baterija
Swarm inteligencija           →    BMS koordinacija roja

REZULTAT: JEDAN EKOSISTEM ZA INFRASTRUKTURU I VOZILA
```

**EK-BAT familija modula:**

| Modul | Kapacitet | Težina | Vozila |
|-------|-----------|--------|--------|
| EK-BAT-25 | 25 kWh | 150 kg | Kombiji, mali kamioni |
| EK-BAT-50 | 50 kWh | 300 kg | Autobusi, srednji kamioni |
| EK-BAT-100 | 100 kWh | 600 kg | Teški autobusi, tegljači |

**Ključne prednosti:**
- Ušteda težine: 1.800-2.700 kg oslobođeno za teret
- 5-minutna zamena umesto 2-satnog punjenja
- 37× više energije po kg materijala baterije (plitko cikliranje)
- Ista stanica za zamenu baterija I modula punjača

### 9. Od punjenja do zamene
```
PROMENA PARADIGME ZA TEŠKA VOZILA:

TRADICIONALNO                      ELEKTROKOMBINACIJA
─────────────────────────────────────────────────────────────
Velika baterija 400kWh        →    Mala baterija 100kWh
2 sata punjenja               →    5 minuta zamene
Zastoj vozila: sati           →    Zastoj vozila: minuti
Teška baterija = manje tereta →    Laka baterija = više tereta
Jedan dubok ciklus/dan        →    Više plitkih ciklusa
Punjenje u depou (10 MW vrh)  →    Distribuirana zamena (250 kW ravno)
```

**Dimenzioniranje baterije po vozilu:**

| Vozilo | Tradicionalno | Malo + zamena | Ušteda težine | Frekvencija zamene |
|--------|---------------|---------------|---------------|---------------------|
| Gradski autobus | 400 kWh | 100 kWh | 1.800 kg | Svakih 100 km |
| Regionalni autobus | 500 kWh | 150 kWh | 2.100 kg | Svakih 150 km |
| Dostavno vozilo | 150 kWh | 50 kWh | 600 kg | 2-3× dnevno |
| Tegljač | 600 kWh | 150 kWh × 4 | 2.700 kg | Svakih 200 km |

Vidi **04-small-battery-philosophy.md** za detaljnu analizu.

## Target Specifikacije

| Parametar | EK3 | EK30 (referentni) |
|-----------|-----|-------------------|
| Snaga | 3.3 kW (3.6 kW peak) | 30 kW |
| Efikasnost | >96% peak, >94% @ 50% | >97% |
| THD struje | <3% | <2% |
| Power factor | >0.99 | >0.995 |
| Izlazni napon | 50-500V DC | 200-1000V DC |
| V2G | Da | Da |
| SiC MOSFET | 900V (Wolfspeed) | 1200V |
| MCU | STM32G474 (Cortex-M4) | ARM Cortex-A + NPU |
| Komunikacija | CAN-FD @ 5 Mbps | CAN-FD @ 5 Mbps |
| Hlađenje | Forced air (shared plenum) | Liquid |
| Dimenzije | 200×320×44 mm | ~400×300×150 mm |
| Težina | ~3.5 kg | ~12 kg |
| MTBF | >100,000h | >150,000h |
