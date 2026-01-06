# JEZGRO Familija Proizvoda

**Verzija:** 1.0
**Datum:** 2026-01-04
**Status:** SPECIFIKACIJA

---

## Svrha Dokumenta

Ovaj dokument definiše **JEZGRO microkernel familiju proizvoda** - unificiranu firmware arhitekturu koja radi na svim inteligentnim komponentama Elektrokombinacija ekosistema. Od modula za punjenje do robota do protokol adaptera, JEZGRO pruža konzistentnu toleranciju na greške, real-time performanse i efikasnost razvoja.

---

## 1. Uvod

### 1.1 Filozofija Unificiranog Kernela

Elektrokombinacija sistem sadrži mnoge inteligentne embedded uređaje:
- EK3 moduli za punjenje (3.3kW power konverteri)
- Rack kontroleri (termalno i inventory upravljanje)
- EK-BAT baterijski moduli (BMS kontroleri)
- Robot kontroleri (motion i koordinacija)
- Protokol adapteri (V2G, CCS, MCS, OCPP)

Umesto razvoja zasebnog firmwarea za svaki tip uređaja, JEZGRO pruža **jedan microkernel** koji radi na svima njima. Svaki uređaj pokreće isti kernel sa različitim **konfiguracijama servisa**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    JEZGRO: JEDAN KERNEL, MNOGO KONFIGURACIJA                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│   │ JEZGRO-EK3  │  │ JEZGRO-RACK │  │ JEZGRO-BAT  │  │ JEZGRO-ROB  │       │
│   │ (Punjenje)  │  │ (Kontroler) │  │ (Baterija)  │  │ (Roboti)    │       │
│   │ STM32G474   │  │ STM32G474   │  │ STM32G474   │  │ STM32H743   │       │
│   │ LLC Control │  │ Fan/Thermal │  │ BMS/Balance │  │ Motion Ctrl │       │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│          │                │                │                │               │
│          └────────────────┴────────────────┴────────────────┘               │
│                              CAN-FD @ 5 Mbps                                │
│                                    │                                        │
│   ┌─────────────┐  ┌─────────────┐  │  ┌─────────────┐  ┌─────────────┐    │
│   │ EK-ADAPT-V2G│  │EK-ADAPT-BUS │  │  │EK-ADAPT-CCS │  │EK-ADAPT-MCS │    │
│   │ V2G Gateway │  │ Retrofit Bus│  │  │ CCS Bridge  │  │ MW Punjenje │    │
│   │ STM32H743   │  │ STM32G474   │  │  │ STM32H743   │  │ STM32H743   │    │
│   │ ISO 15118   │  │ OEM Protokol│  │  │ SLAC/PLC    │  │ CharIN MCS  │    │
│   └─────────────┘  └─────────────┘  │  └─────────────┘  └─────────────┘    │
│                                     │                                       │
│          Svi pokreću JEZGRO-GW ─────┘                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Ključne Prednosti

| Prednost | Opis |
|----------|------|
| **Deljena Baza Koda** | Jedan kernel, jedan razvojni tim, jedan test paket |
| **Konzistentno Rukovanje Greškama** | Svi uređaji se oporavljaju od grešaka na isti način (automatski restart servisa) |
| **Pojednostavljenje Lanca Snabdevanja** | Isti MCU (STM32G474) na većini uređaja |
| **Poznat Razvoj** | Programeri uče jednom, primenjuju svuda |
| **Unificirani Alati** | Isti debugger, isti flash tool, isti CI/CD |
| **Koordinacija Između Uređaja** | Zajednički IPC protokol omogućava swarm intelligence |

### 1.3 MINIX Nasleđe

JEZGRO nasleđuje svoju osnovnu arhitekturu od MINIX 3, prilagođenu za resursno ograničene embedded sisteme:

| MINIX 3 Koncept | JEZGRO Adaptacija |
|-----------------|-------------------|
| MMU-bazirana izolacija | **MPU-bazirana izolacija** (MMU nije potreban) |
| User-space drajveri | Servisi rade u neprivilegovanom modu sa MPU regionima |
| Reincarnation server | Automatski restart servisa pri greški |
| Message-passing IPC | Zero-copy IPC sa 64-bajtnim porukama |
| Minimalan kernel | ~8KB kernel, sve ostalo u servisima |

---

## 2. Pregled Familije Proizvoda

### 2.1 Matrica Varijanti

| Varijanta | Ciljni Uređaj | MCU | RAM | Ključni Servisi | Status |
|-----------|---------------|-----|-----|-----------------|--------|
| **JEZGRO-EK3** | Modul za punjenje | STM32G474 | 128 KB | LLC_CONTROL, THERMAL, ROJ | Specifikovan |
| **JEZGRO-RACK** | Rack kontroler | STM32G474 | 128 KB | FAN_CONTROL, SLOT_INVENTORY | Specifikovan |
| **JEZGRO-BAT** | Baterija BMS | STM32G474 | 128 KB | CELL_MONITOR, BALANCING, SOC | Planiran |
| **JEZGRO-ROB** | Robot kontroleri | STM32H743 | 1024 KB | MOTION_CTRL, TRAJECTORY, SAFETY | Planiran |
| **JEZGRO-GW** | Protokol adapteri | STM32H743 | 1024 KB | ISO15118, OCPP, V2G_CONTROL | Planiran |

### 2.2 Izbor MCU-a

JEZGRO podržava dva primarna MCU cilja:

#### STM32G474 (Primarni - Optimizovan za Cenu)
- **Jezgro:** Cortex-M4 @ 170 MHz
- **RAM:** 128 KB (dovoljno za 6-8 servisa)
- **Flash:** 512 KB
- **MPU:** 8 regiona (JEZGRO zahtev)
- **Periferije:** CAN-FD, HRTIM, AES, USB
- **Primena:** EK3 moduli, rack kontroler, baterija BMS, jednostavni adapteri

#### STM32H743 (Prošireni - Visoke Performanse)
- **Jezgro:** Cortex-M7 @ 480 MHz
- **RAM:** 1024 KB (za kompleksne protokol stack-ove)
- **Flash:** 2048 KB
- **MPU:** 16 regiona
- **Periferije:** CAN-FD, Ethernet MAC, DCMI, SDMMC
- **Primena:** Robot kontroleri, V2G adapteri, protokol gateway-i

### 2.3 Zajedničke vs Varijanta-Specifične Komponente

```
┌─────────────────────────────────────────────────────────────────┐
│                    JEZGRO ARHITEKTURA                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ZAJEDNIČKO (sve varijante)      VARIJANTA-SPECIFIČNO           │
│  ──────────────────────────      ───────────────────────         │
│  ┌─────────────────────┐        ┌─────────────────────┐         │
│  │ Kernel (~8 KB)      │        │ LLC_CONTROL (EK3)   │         │
│  │ • Scheduler (EDF)   │        │ FAN_CONTROL (RACK)  │         │
│  │ • MPU Manager       │        │ CELL_MONITOR (BAT)  │         │
│  │ • IPC Redovi        │        │ MOTION_CTRL (ROB)   │         │
│  │ • Interrupt Dispatch│        │ ISO15118 (GW)       │         │
│  └─────────────────────┘        └─────────────────────┘         │
│                                                                  │
│  ┌─────────────────────┐        ┌─────────────────────┐         │
│  │ Reincarnation Server│        │ Uređaj-specifični   │         │
│  │ • Watchdog monitor  │        │ HAL drajveri        │         │
│  │ • Oporavak grešaka  │        │ • PWM (LLC/motor)   │         │
│  │ • Restore stanja    │        │ • ADC konfiguracije │         │
│  └─────────────────────┘        │ • GPIO mapiranja    │         │
│                                 └─────────────────────┘         │
│  ┌─────────────────────┐                                        │
│  │ Standardni Servisi  │                                        │
│  │ • CAN_HANDLER       │                                        │
│  │ • AUDIT_LOGGER      │                                        │
│  │ • THERMAL_MGR       │                                        │
│  └─────────────────────┘                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. JEZGRO Osnovne Komponente

### 3.1 Kernel Arhitektura

JEZGRO kernel radi u privilegovanom modu i pruža:

| Komponenta | Veličina | Funkcija |
|------------|----------|----------|
| **Scheduler** | ~2 KB | EDF (Earliest Deadline First) sa priority fallback-om |
| **MPU Manager** | ~1.5 KB | Konfiguriše 8 MPU regiona po context switch-u servisa |
| **IPC Sistem** | ~2 KB | Zero-copy message passing, 512-poruka pool |
| **Interrupt Dispatch** | ~1 KB | Rutira interrupt-e registrovanim servisima |
| **Reincarnation Server** | ~1.5 KB | Nadgleda watchdog-e, restartuje neuspele servise |

**Ukupni kernel footprint:** ~8 KB

### 3.2 Memory Layout

```
┌─────────────────────────────────────────────────┐  0x2001FFFF
│                                                 │
│              Service Memory Pool                │
│           (dinamički alocirano)                 │
│                                                 │
├─────────────────────────────────────────────────┤  ~0x20014000
│                                                 │
│              IPC Message Pool                   │
│        512 poruka × 64 bajta = 32 KB           │
│                                                 │
├─────────────────────────────────────────────────┤  0x2000C000
│                                                 │
│              Service Stack-ovi                  │
│         (po-servisu, MPU-zaštićeni)            │
│                                                 │
├─────────────────────────────────────────────────┤  0x20004000
│                                                 │
│              Kernel Podaci                      │
│        (scheduler, MPU tabele, itd.)           │
│                                                 │
├─────────────────────────────────────────────────┤  0x20002000
│                                                 │
│              Kernel Stack (MSP)                 │
│                 8 KB                            │
│                                                 │
└─────────────────────────────────────────────────┘  0x20000000
```

### 3.3 Standardni Servisi

Ovi servisi su dostupni u svim JEZGRO varijantama:

| Servis | Prioritet | Svrha | RAM |
|--------|-----------|-------|-----|
| **CAN_HANDLER** | HIGH | CAN-FD RX/TX, IPC translacija | 8 KB |
| **AUDIT_LOGGER** | LOW | Event logging u flash | 16 KB |
| **THERMAL_MGR** | MEDIUM | Monitoring temperature, derating | 8 KB |

### 3.4 API Kompatibilnost

Sve JEZGRO varijante dele isti API:

```c
// Definicija servisa (ista za sve varijante)
JEZGRO_SERVICE_DEFINE(my_service,
    .priority = JEZGRO_PRIORITY_MEDIUM,
    .stack_size = 2048,
    .memory_size = 8192,
    .watchdog_ms = 500
);

// IPC (isti API za EK3, BAT, ROB, GW)
jezgro_send(dest_service, &msg);
jezgro_receive(src_filter, &msg, timeout);
jezgro_broadcast(&msg);

// Sinhronizacija
jezgro_sem_wait(&sem);
jezgro_sem_signal(&sem);

// Watchdog
jezgro_watchdog_feed();
```

### 3.5 ROJ_COORD Servis (SWARM CORE)

Sve JEZGRO varijante koje učestvuju u koordinaciji roja uključuju **ROJ_COORD** servis, koji implementira **SWARM CORE** specifikaciju.

**SWARM CORE** obezbeđuje jedinstvenu koordinaciju za sve tipove uređaja:

| Komponenta | Svrha |
|------------|-------|
| **Policy Engine** | Čuva parametre, bira režim ponašanja (istraživanje/eksploatacija) |
| **Quorum Engine** | Pokreće odluke sa unakrsnom inhibicijom |
| **Stigmergy Store** | Lokalna mapa tagova sa TTL i eksponencijalnim opadanjem |
| **Task Allocator** | Distribucija zadataka i resursa |
| **Health/Trust** | Detekcija anomalija i izolacija agenata |

**CAN-FD Tipovi Poruka:**

| Tip | ID Opseg | Svrha |
|-----|----------|-------|
| `ROJ_HEARTBEAT` | 0x510 + node | Prisutnost + osnovne metrike |
| `ROJ_STATE` | 0x520 + node | Prošireni snimak stanja |
| `ROJ_TASK_CLAIM` | 0x540 | Zahtevi za zadatke/resurse |
| `ROJ_VOTE` | 0x550 | Kvorum glasanje |
| `ROJ_TAG` | 0x560 | Stigmergy tagovi |
| `ROJ_ALERT` | 0x5FF | Kritične notifikacije |

**Profili Specifični za Varijante:**
- **JEZGRO-EK3**: Fokus na balansiranju opterećenja, termalnoj koordinaciji
- **JEZGRO-BAT**: Fokus na SOC/SOH, V2G učešću
- **JEZGRO-ROB**: Fokus na koordinaciji kretanja, sigurnosnim zonama
- **JEZGRO-GW**: Fokus na mrežnim signalima, upravljanju prioritetima

Referenca: `tehnika/inzenjersko/sr/rojno-jezgro/00-core-spec.md` (EK-TECH-027)

---

## 4. JEZGRO Varijante

### 4.1 JEZGRO-EK3 (Modul za Punjenje)

**Cilj:** EK3 3.3kW moduli za punjenje
**Referenca:** `tehnika/inzenjersko/sr/16-jezgro.md`

| ID | Servis | Prioritet | Stack | Memory | Watchdog |
|----|--------|-----------|-------|--------|----------|
| 0 | KERNEL | - | 2 KB | 8 KB | - |
| 1 | LLC_CONTROL | CRITICAL | 2 KB | 16 KB | 10 ms |
| 2 | SAFETY_MONITOR | CRITICAL | 1 KB | 4 KB | 50 ms |
| 3 | CAN_HANDLER | HIGH | 2 KB | 8 KB | 100 ms |
| 4 | THERMAL_MGR | MEDIUM | 2 KB | 8 KB | 500 ms |
| 5 | ROJ_COORD | MEDIUM | 4 KB | 16 KB | 1000 ms |
| 6 | AUDIT_LOGGER | LOW | 4 KB | 16 KB | 2000 ms |

**Ukupni RAM:** ~78 KB od 128 KB

### 4.2 JEZGRO-RACK (Rack Kontroler)

**Cilj:** Custom rack kontroler za 84-modulne rack-ove
**Referenca:** `tehnika/inzenjersko/sr/15-custom-rack-system.md` Sekcija 10

| ID | Servis | Prioritet | Stack | Memory | Watchdog |
|----|--------|-----------|-------|--------|----------|
| 0 | KERNEL | - | 2 KB | 8 KB | - |
| 1 | FAN_CONTROL | HIGH | 2 KB | 8 KB | 100 ms |
| 2 | THERMAL_MONITOR | MEDIUM | 2 KB | 8 KB | 500 ms |
| 3 | SLOT_INVENTORY | MEDIUM | 2 KB | 8 KB | 1000 ms |
| 4 | CAN_BRIDGE | HIGH | 2 KB | 8 KB | 100 ms |
| 5 | TELEMETRY | LOW | 4 KB | 16 KB | 2000 ms |

**Ukupni RAM:** ~56 KB od 128 KB

### 4.3 JEZGRO-BAT (Baterija BMS)

**Cilj:** EK-BAT-25/50/100 baterijski moduli
**Referenca:** `tehnika/inzenjersko/sr/22-jezgro-bat.md` (planirano)

| ID | Servis | Prioritet | Stack | Memory | Watchdog |
|----|--------|-----------|-------|--------|----------|
| 0 | KERNEL | - | 2 KB | 8 KB | - |
| 1 | CELL_MONITOR | CRITICAL | 2 KB | 16 KB | 50 ms |
| 2 | BALANCING | HIGH | 2 KB | 8 KB | 200 ms |
| 3 | SOC_SOH | MEDIUM | 4 KB | 16 KB | 500 ms |
| 4 | THERMAL_MGR | MEDIUM | 2 KB | 8 KB | 500 ms |
| 5 | ROJ_COORD | MEDIUM | 4 KB | 16 KB | 1000 ms |
| 6 | CAN_HANDLER | HIGH | 2 KB | 8 KB | 100 ms |
| 7 | AUDIT_LOGGER | LOW | 4 KB | 16 KB | 2000 ms |

**Ukupni RAM:** ~86 KB od 128 KB

**Ključne Funkcije:**
- Monitoring napona/temperature ćelija preko AFE (BQ76952 ili ekvivalent)
- Pasivno/aktivno balansiranje ćelija
- SOC/SOH procena (Extended Kalman Filter)
- Multi-baterijska swarm koordinacija

### 4.4 JEZGRO-ROB (Robot Kontroler)

**Cilj:** Swap station roboti (Robot A montiran na vozilu, Robot B na stanici)
**Referenca:** `tehnika/inzenjersko/sr/23-jezgro-rob.md` (planirano)

| ID | Servis | Prioritet | Stack | Memory | Watchdog |
|----|--------|-----------|-------|--------|----------|
| 0 | KERNEL | - | 4 KB | 16 KB | - |
| 1 | MOTION_CTRL | CRITICAL | 4 KB | 32 KB | 10 ms |
| 2 | TRAJECTORY | HIGH | 4 KB | 32 KB | 50 ms |
| 3 | SENSOR_FUSION | HIGH | 4 KB | 32 KB | 20 ms |
| 4 | SAFETY_MONITOR | CRITICAL | 2 KB | 8 KB | 20 ms |
| 5 | COORDINATION | MEDIUM | 4 KB | 16 KB | 100 ms |
| 6 | CAN_HANDLER | HIGH | 2 KB | 8 KB | 100 ms |
| 7 | AUDIT_LOGGER | LOW | 4 KB | 16 KB | 2000 ms |

**Ukupni RAM:** ~176 KB (zahteva STM32H743)

**Ključne Funkcije:**
- Real-time servo kontrolne petlje (1-10 kHz)
- Planiranje trajektorije i interpolacija
- Fuzija senzora (IMU, enkoderi, senzori sile)
- Robot A ↔ Robot B protokol koordinacije
- Safety monitoring (detekcija sudara, E-stop)

### 4.5 JEZGRO-GW (Protokol Gateway)

**Cilj:** V2G adapteri, CCS bridgevi, OCPP gateway-i
**Referenca:** `tehnika/inzenjersko/sr/24-jezgro-gw.md` (planirano)

| ID | Servis | Prioritet | Stack | Memory | Watchdog |
|----|--------|-----------|-------|--------|----------|
| 0 | KERNEL | - | 4 KB | 16 KB | - |
| 1 | PLL_SYNC | CRITICAL | 2 KB | 8 KB | 10 ms |
| 2 | CURRENT_CTRL | CRITICAL | 4 KB | 16 KB | 1 ms |
| 3 | DROOP_CTRL | HIGH | 2 KB | 8 KB | 10 ms |
| 4 | ISO15118 | MEDIUM | 16 KB | 64 KB | 1000 ms |
| 5 | OCPP_CLIENT | LOW | 8 KB | 32 KB | 5000 ms |
| 6 | CAN_HANDLER | HIGH | 2 KB | 8 KB | 100 ms |
| 7 | AUDIT_LOGGER | LOW | 4 KB | 16 KB | 2000 ms |

**Ukupni RAM:** ~184 KB (zahteva STM32H743)

**Ključne Funkcije:**
- Grid sinhronizacija (SRF-PLL)
- Bidirekciona kontrola toka snage (dq-frame)
- Droop kontrola za grid servise P(f), Q(V)
- ISO 15118-20 protokol stack
- OCPP 2.0.1 klijent

---

## 5. Adapter Uređaji

JEZGRO-GW pokreće familiju adapter uređaja koji integrišu ne-EK opremu u Elektrokombinacija ekosistem.

### 5.1 Matrica Adapter Uređaja

| Uređaj | Svrha | MCU | Protokol Stack |
|--------|-------|-----|----------------|
| **EK-ADAPT-V2G** | Ne-EK vozila → V2G mreža | STM32H743 | ISO 15118-20 BPT |
| **EK-ADAPT-BUS** | Retrofit postojećih autobusa | STM32G474 | OEM CAN + EK CAN |
| **EK-ADAPT-CCS** | CCS Combo to EK bridge | STM32H743 | ISO 15118, SLAC |
| **EK-ADAPT-MCS** | Megawatt Charging adapter | STM32H743 | CharIN MCS |
| **EK-ADAPT-OCPP** | Gateway za treće strane | STM32G474 | OCPP 1.6/2.0.1 |

### 5.2 EK-ADAPT-V2G

**Svrha:** Omogućiti bilo kojem EV sa CCS-om da učestvuje u V2G bez native ISO 15118-20 podrške.

```
┌─────────────────────────────────────────────────────────────┐
│                      EK-ADAPT-V2G                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Strana Vozila                   Strana Punjača             │
│   ─────────────                   ──────────────             │
│   ┌─────────────┐                ┌─────────────┐            │
│   │ CCS Combo 2 │                │ EK CAN-FD   │            │
│   │ Konektor    │                │ Interfejs   │            │
│   └──────┬──────┘                └──────┬──────┘            │
│          │                              │                    │
│          ▼                              ▼                    │
│   ┌─────────────────────────────────────────────────┐       │
│   │              JEZGRO-GW (STM32H743)              │       │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐           │       │
│   │  │PLL_SYNC │ │ISO15118 │ │CAN_HANDL│           │       │
│   │  │         │ │         │ │         │           │       │
│   │  └─────────┘ └─────────┘ └─────────┘           │       │
│   └─────────────────────────────────────────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Ključne Karakteristike:**
- Translacija protokola: legacy CCS ↔ ISO 15118-20 BPT
- PLL sinhronizacija za grid coupling
- Droop kontrola P(f), Q(V) prema `tehnika/inzenjersko/sr/07-v2g-control.md`
- Do 50 kW bidirekciono

### 5.3 EK-ADAPT-BUS

**Svrha:** Retrofit postojećih električnih autobusa koji nisu fabrički konfigurisani za EK swap sistem.

```
┌─────────────────────────────────────────────────────────────┐
│                      EK-ADAPT-BUS                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   OEM Interfejs Autobusa          EK Ekosistem               │
│   ──────────────────────          ────────────               │
│   ┌─────────────┐                ┌─────────────┐            │
│   │ OEM BMS     │                │ Swap Stanica│            │
│   │ Protokol    │                │ CAN-FD      │            │
│   └──────┬──────┘                └──────┬──────┘            │
│          │                              │                    │
│          ▼                              ▼                    │
│   ┌─────────────────────────────────────────────────┐       │
│   │              JEZGRO-GW (STM32G474)              │       │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐           │       │
│   │  │OEM_PROTO│ │TRANSLATE│ │CAN_HANDL│           │       │
│   │  │         │ │         │ │         │           │       │
│   │  └─────────┘ └─────────┘ └─────────┘           │       │
│   └─────────────────────────────────────────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Ključne Karakteristike:**
- Translacija OEM baterijskog protokola
- SOC/SOH izveštavanje ka EK fleet managementu
- Mehanički adapter za swap interfejs
- Podržava Solaris, BYD, Volvo i druge OEM protokole

### 5.4 EK-ADAPT-CCS

**Svrha:** Omogućiti EK punjačima da pune bilo koje CCS-kompatibilno vozilo.

**Ključne Karakteristike:**
- CCS Combo Type 2 signalizacija (CP/PP)
- HomePlug Green PHY (SLAC)
- ISO 15118-2/-20 komunikacija
- Isporuka snage do 350 kW

### 5.5 EK-ADAPT-MCS

**Svrha:** Interfejs EK modularne arhitekture ka MCS (Megawatt Charging System) za teške kamione.

**Ključne Karakteristike:**
- 1-3 MW koordinacija snage preko više rack-ova
- CharIN MCS rukovanje protokolom
- Aktivno termalno upravljanje za operaciju visokih struja
- Podržava 1500V DC operaciju

### 5.6 EK-ADAPT-OCPP

**Svrha:** Omogućiti punjačima trećih strana integraciju sa EK fleet managementom.

**Ključne Karakteristike:**
- OCPP 1.6J / 2.0.1 klijent/server
- Agregacija punjača trećih strana u unificirani fleet pregled
- Firmware update proxy
- Billing integracija

---

## 6. Komponente NEPODOBNE za JEZGRO

Neke komponente u EK ekosistemu NISU kandidati za JEZGRO:

| Komponenta | Razlog | Alternativa |
|------------|--------|-------------|
| **Centralni PFC** | DSP-specifična kontrola (TMS320F28379D ima optimizovane biblioteke) | Bare-metal + TI C2000 ControlSUITE |
| **Safety MCU** | ASIL-D lockstep potreban (AURIX TC3xx dual-core) | Bare-metal prema Infineon safety uputstvima |
| **Station Controller** | Pune Linux mogućnosti potrebne (filesystem, networking, Docker) | Linux sa opcionim JEZGRO co-procesorom |
| **Cloud Backend** | Server-class computing | Standardni server OS + kontejneri |

---

## 7. Build Sistem

### 7.1 Selekcija Varijante

JEZGRO koristi Kconfig-stil build sistema za selekciju varijante:

```kconfig
# jezgro.config

# Selekcija MCU-a
CONFIG_MCU_STM32G474=y
# CONFIG_MCU_STM32H743 is not set

# Selekcija Varijante
CONFIG_JEZGRO_EK3=y
# CONFIG_JEZGRO_RACK is not set
# CONFIG_JEZGRO_BAT is not set
# CONFIG_JEZGRO_ROB is not set
# CONFIG_JEZGRO_GW is not set

# Konfiguracija Servisa
CONFIG_SERVICE_LLC_CONTROL=y
CONFIG_SERVICE_SAFETY_MONITOR=y
CONFIG_SERVICE_CAN_HANDLER=y
CONFIG_SERVICE_THERMAL_MGR=y
CONFIG_SERVICE_ROJ_COORD=y
CONFIG_SERVICE_AUDIT_LOGGER=y

# Konfiguracija Memorije
CONFIG_IPC_POOL_SIZE=512
CONFIG_MAX_SERVICES=8
```

### 7.2 Build Komande

```bash
# Konfiguracija za EK3 varijantu
make menuconfig
# ili
cp configs/jezgro_ek3_defconfig .config

# Build
make all

# Flash
make flash

# Debug
make debug
```

### 7.3 Omogućavanje/Onemogućavanje Servisa

Pojedinačni servisi mogu biti omogućeni/onemogućeni u vreme kompajliranja:

```c
// U service_config.h (auto-generisan iz Kconfig-a)
#define CONFIG_SERVICE_LLC_CONTROL     1
#define CONFIG_SERVICE_SAFETY_MONITOR  1
#define CONFIG_SERVICE_ROJ_COORD     1
#define CONFIG_SERVICE_ISO15118        0  // Nije potrebno za EK3
#define CONFIG_SERVICE_MOTION_CTRL     0  // Nije potrebno za EK3
```

---

## 8. Razvojni Tok Rada

### 8.1 Unificirano Razvojno Okruženje

Sve JEZGRO varijante koriste isti toolchain:

| Alat | Svrha |
|------|-------|
| **arm-none-eabi-gcc** | Cross-compiler |
| **OpenOCD** | Debugger/flash interfejs |
| **STM32CubeProgrammer** | Alternativni flasher |
| **VS Code + Cortex-Debug** | IDE |
| **CMake** | Build sistem |
| **cppcheck** | Statička analiza |

### 8.2 Strategija Testiranja

```
┌─────────────────────────────────────────────────────────────┐
│                    TEST PIRAMIDA                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    ┌─────────────┐                          │
│                    │  System     │  HIL testiranje sa        │
│                    │  Testovi    │  stvarnim hardverom       │
│                    └──────┬──────┘                          │
│                           │                                  │
│               ┌───────────┴───────────┐                     │
│               │  Integracioni Testovi │  QEMU emulacija     │
│               │   (kernel + servisi)  │  sa CAN bus sim     │
│               └───────────┬───────────┘                     │
│                           │                                  │
│       ┌───────────────────┴───────────────────┐             │
│       │           Unit Testovi                 │  Host-based │
│       │  (kernel logika, IPC, scheduler)       │  sa mockovima│
│       └────────────────────────────────────────┘             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 FreeRTOS Putanja Migracije

Za timove koji trenutno koriste FreeRTOS, JEZGRO pruža migration shim:

| FreeRTOS API | JEZGRO Ekvivalent |
|--------------|-------------------|
| `xTaskCreate()` | `JEZGRO_SERVICE_DEFINE()` + MPU config |
| `vTaskDelay()` | `jezgro_sleep()` |
| `xQueueSend()` | `jezgro_send()` |
| `xQueueReceive()` | `jezgro_receive()` |
| `xSemaphoreTake()` | `jezgro_sem_wait()` |
| `xSemaphoreGive()` | `jezgro_sem_signal()` |

Referenca: `tehnika/inzenjersko/sr/16-jezgro.md` Sekcija 8.4

---

## 9. Real-Time Garancije

### 9.1 Vremenske Specifikacije

Sve JEZGRO varijante ispunjavaju ove vremenske garancije:

| Operacija | Najgori Slučaj | Tipično |
|-----------|----------------|---------|
| Interrupt latencija | 500 ns | 200 ns |
| Context switch | 2 µs | 500 ns |
| MPU rekonfiguracija | 200 ns | 100 ns |
| IPC send (sync) | 5 µs | 1 µs |
| IPC receive | 3 µs | 500 ns |
| Service restart | 50 ms | 10 ms |

### 9.2 Varijanta-Specifični Zahtevi

| Varijanta | Kritična Petlja | Zahtev |
|-----------|-----------------|--------|
| JEZGRO-EK3 | LLC power kontrola | <1 µs ISR |
| JEZGRO-ROB | Servo kontrola | <100 µs petlja |
| JEZGRO-GW | PLL praćenje | <10 µs petlja |
| JEZGRO-BAT | Cell monitoring | <1 ms sampling |

---

## 10. Unakrsne Reference

### 10.1 Detaljne Specifikacije Varijanti

| Varijanta | Dokument |
|-----------|----------|
| JEZGRO-EK3 | `tehnika/inzenjersko/sr/16-jezgro.md` |
| JEZGRO-RACK | `tehnika/inzenjersko/sr/15-custom-rack-system.md` Sekcija 10 |
| JEZGRO-BAT | `tehnika/inzenjersko/sr/22-jezgro-bat.md` (planirano) |
| JEZGRO-ROB | `tehnika/inzenjersko/sr/23-jezgro-rob.md` (planirano) |
| JEZGRO-GW | `tehnika/inzenjersko/sr/24-jezgro-gw.md` (planirano) |

### 10.2 Povezani Dokumenti

| Dokument | Veza |
|----------|------|
| `tehnika/inzenjersko/sr/SPECIFICATIONS.md` | Master specifikacije |
| `tehnika/inzenjersko/sr/07-v2g-control.md` | V2G kontrolni algoritmi (JEZGRO-GW servisi) |
| `tehnika/inzenjersko/sr/05-swap-station.md` | Swap station robotika (JEZGRO-ROB integracija) |
| `tehnika/inzenjersko/sr/19-battery-module-standard.md` | Baterijski modul spec (JEZGRO-BAT integracija) |
| `tehnika/inzenjersko/sr/rojno-jezgro/00-core-spec.md` | SWARM CORE specifikacija (ROJ_COORD servis) |
| `tehnika/inzenjersko/sr/rojno-jezgro/01-detaljni-dokument.md` | SWARM CORE detaljna implementacija |
| `tehnika/konceptualno/sr/02-roj-intelligence.md` | ROJ konceptualna dokumentacija |
| `patent/01-IP-FOUNDATION/06-invention-disclosure-jezgro.md` | JEZGRO patent |

---

## Istorija Izmena

| Datum | Verzija | Opis |
|-------|---------|------|
| 2026-01-04 | 1.0 | Inicijalna specifikacija familije proizvoda |
