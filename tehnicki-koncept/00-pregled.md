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

### EK3 - Proof of Concept (3 kW)
```
Svrha: Validacija arhitekture na minimalnoj snazi
─────────────────────────────────────────────────
• SiC MOSFET (650V, 30A class)
• LLC rezonantna topologija
• AI self-tuning control
• Digital twin embedded
• Dimenzije: ~150 × 120 × 80 mm
• Težina: ~2 kg
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

1. **01-power-electronics.md** - SiC MOSFET selekcija, 3-level NPC topologija, LLC rezonantni konverter, gate driver dizajn, EMI/EMC, zaštita, BOM power stage
2. **02-ai-ml-sistem.md** - Edge AI hardver (STM32N6 NPU), digital twin arhitektura, predictive maintenance, self-tuning kontrola, anomaly detection, fleet learning
3. **03-thermal-management.md** - Liquid cooling sistem, coldplate dizajn, junction temperature estimacija, AI thermal control, safety features
4. **04-v2g-grid.md** - ISO 15118-20 implementacija, bidirekciona topologija, grid services (frequency/voltage regulation), grid codes compliance
5. **05-swarm-intelligence.md** - Distribuirana arhitektura, CAN-FD komunikacija, load balancing algoritmi, fault tolerance, scalability
6. **06-bom-cost.md** - Kompletni BOM za EK3 i EK30, cost breakdown, pricing strategija, TCO analiza, R&D investment
7. **07-konkurencija.md** - Analiza konkurencije, reliability kriza u industriji (podaci 2025), konkurentska prednost
8. **08-swap-station.md** - Robotska zamena EK modula + battery swap za autobuse, fleet-integrated maintenance, patentabilni koncept
9. **09-ek3-rack-sistem.md** - **KLJUČNA INOVACIJA**: Jedan modul (EK3) za SVE - od 3kW do 3MW, rack sistem, robot swap, radikalna modularnost, **3PAR storage inspiracija** (chunklets, wide striping, distributed sparing)

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

## Target Specifikacije

| Parametar | EK3 | EK30 |
|-----------|-----|------|
| Snaga | 3 kW | 30 kW |
| Efikasnost | >96% | >97% |
| THD struje | <3% | <2% |
| Power factor | >0.99 | >0.995 |
| Izlazni napon | 50-500V DC | 200-1000V DC |
| V2G | Da | Da |
| AI Edge | ARM Cortex-M7 | ARM Cortex-A + NPU |
| Hlađenje | Air | Liquid |
| MTBF | >100,000h | >150,000h |
