# EK-ADAPT: Specifikacije adapter uređaja

**Verzija:** 1.0
**Datum:** 2026-01-04
**Status:** SPECIFIKACIJA

---

## Namena dokumenta

Ovaj dokument specificira porodicu **EK-ADAPT** adapter uređaja koji proširuju ELEKTROKOMBINACIJA ekosistem za rad sa vozilima trećih strana, nasleđenim autobusima i postojećim standardima punjenja. Svi adapteri pokreću JEZGRO-GW firmver za konzistentno ponašanje i integraciju.

---

## 1. Pregled

### 1.1 Porodica adaptera

| Uređaj | Namena | Ciljno tržište |
|--------|--------|----------------|
| **EK-ADAPT-V2G** | Ne-EK vozila → V2G mreža | Flote EV trećih strana |
| **EK-ADAPT-BUS** | Retrofit nasleđenih autobusa | Operateri tranzita |
| **EK-ADAPT-CCS** | CCS Combo ka EK mostu | Standardno DC punjenje |
| **EK-ADAPT-MCS** | Megavatno punjenje adapter | Teški kamioni |
| **EK-ADAPT-OCPP** | Kapija za punjače trećih strana | CPO integracija |

### 1.2 Zajednička arhitektura

Svi adapteri dele:
- STM32H743 MCU koji pokreće JEZGRO-GW
- CAN-FD interfejs ka EK ekosistemu
- Modularni softver (omogući/onemogući servise po tipu adaptera)
- Zajednička porodica mehaničkih kućišta

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ARHITEKTURA PORODICE ADAPTERA                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                          ┌───────────────────────────────────────────┐       │
│                          │          ELEKTROKOMBINACIJA                │       │
│                          │              EKOSISTEM                     │       │
│                          │                                           │       │
│                          │  ┌─────────┐  ┌─────────┐  ┌─────────┐  │       │
│                          │  │   EK3   │  │ Stanica │  │  Flota  │  │       │
│                          │  │ Moduli  │  │  Ctrl   │  │   Mgmt  │  │       │
│                          │  └────┬────┘  └────┬────┘  └────┬────┘  │       │
│                          │       │            │            │        │       │
│                          └───────┼────────────┼────────────┼────────┘       │
│                                  │            │            │                 │
│                          ═══════╪════════════╪════════════╪═══════════      │
│                                 CAN-FD       MQTT/REST    MQTT              │
│                          ═══════╪════════════╪════════════╪═══════════      │
│                                  │            │            │                 │
│   ┌─────────────┬────────────────┼────────────┼────────────┼──────────────┐ │
│   │             │                │            │            │              │ │
│   ▼             ▼                ▼            ▼            ▼              ▼ │
│ ┌────────┐  ┌────────┐     ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐│
│ │EK-ADAPT│  │EK-ADAPT│     │EK-ADAPT│   │EK-ADAPT│   │EK-ADAPT│   │Budući  ││
│ │  V2G   │  │  BUS   │     │  CCS   │   │  MCS   │   │  OCPP  │   │Adapteri││
│ └───┬────┘  └───┬────┘     └───┬────┘   └───┬────┘   └───┬────┘   └────────┘│
│     │           │              │            │            │                  │
│     ▼           ▼              ▼            ▼            ▼                  │
│ ┌────────┐  ┌────────┐     ┌────────┐   ┌────────┐   ┌────────┐            │
│ │Treća   │  │Nasleđeni│    │Standard│   │ Teški  │   │Treća   │            │
│ │strana  │  │ autobus │    │CCS EV  │   │ kamion │   │strana  │            │
│ │EV      │  └────────┘     └────────┘   └────────┘   │punjač  │            │
│ └────────┘                                           └────────┘            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. EK-ADAPT-V2G

### 2.1 Namena

Omogućava bilo kom V2G-sposobnom električnom vozilu da učestvuje u ELEKTROKOMBINACIJA V2G mreži, bez obzira na proizvođača.

### 2.2 Slučajevi korišćenja

1. **Integracija flote**: EV trećih strana (Nissan Leaf, VW ID, itd.) koji se pridružuju EK V2G mreži
2. **Mrežne usluge**: Omogući ne-EK vozilima da pruže frekvencijski odziv
3. **Energetska arbitraža**: Dozvoli bilo kom EV da učestvuje u cenovnom punjenju

### 2.3 Specifikacije

| Parametar | Vrednost | Napomene |
|-----------|----------|----------|
| Ulaz | CCS Combo 2 / CHAdeMO | Preko zasebnog utikača |
| Izlaz | EK CAN-FD magistrala | Sistemska integracija |
| Opseg snage | 10-50 kW dvosmerno | Po mogućnostima vozila |
| Podrška protokola | ISO 15118-2, -20, CHAdeMO 3.0 | Pun V2G stek |
| MCU | STM32H743 | JEZGRO-GW |
| Dimenzije | 300 × 200 × 100 mm | Zidna montaža |
| IP stepen | IP54 | Unutra/zaštićeno spolja |

### 2.4 Blok dijagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EK-ADAPT-V2G BLOK DIJAGRAM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   STRANA VOZILA                         STRANA EK EKOSISTEMA                │
│                                                                              │
│   ┌─────────────┐                        ┌─────────────┐                    │
│   │   CCS2      │                        │  CAN-FD    │                    │
│   │  Konektor   │                        │  Interfejs  │                    │
│   └──────┬──────┘                        └──────┬──────┘                    │
│          │                                      │                           │
│   ┌──────▼──────┐                        ┌──────▼──────┐                    │
│   │    PLC      │                        │  Kontroler  │                    │
│   │   Modem     │                        │   stanice   │                    │
│   │ (HomePlug)  │                        │   kapija    │                    │
│   └──────┬──────┘                        └──────┬──────┘                    │
│          │                                      │                           │
│          └──────────────────┬───────────────────┘                           │
│                             │                                               │
│                      ┌──────▼──────┐                                        │
│                      │  STM32H743  │                                        │
│                      │  JEZGRO-GW  │                                        │
│                      │             │                                        │
│                      │ ┌─────────┐ │                                        │
│                      │ │ISO15118 │ │                                        │
│                      │ │ Servis  │ │                                        │
│                      │ └─────────┘ │                                        │
│                      │ ┌─────────┐ │                                        │
│                      │ │Prevođenje│ │                                        │
│                      │ │protokola│ │                                        │
│                      │ └─────────┘ │                                        │
│                      │ ┌─────────┐ │                                        │
│                      │ │  V2G    │ │                                        │
│                      │ │Upravlj. │ │                                        │
│                      │ └─────────┘ │                                        │
│                      └─────────────┘                                        │
│                                                                              │
│   Funkcije:                                                                  │
│   • ISO 15118 ↔ EK prevođenje protokola                                    │
│   • Upravljanje V2G sesijom                                                │
│   • Koordinacija mrežnih usluga                                            │
│   • Merenje snage i naplata                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.5 JEZGRO-GW konfiguracija

```c
// EK-ADAPT-V2G konfiguracija servisa
#define JEZGRO_ENABLE_PLL_SYNC       0  // Nema direktne mrežne konekcije
#define JEZGRO_ENABLE_CURRENT_CTRL   0  // Nema upravljanja invertorom
#define JEZGRO_ENABLE_DROOP_CTRL     0  // Droop preko ISO 15118
#define JEZGRO_ENABLE_ISO15118       1  // Pun V2G stek
#define JEZGRO_ENABLE_SLAC           1  // PLC komunikacija
#define JEZGRO_ENABLE_OCPP_CLIENT    1  // Backend komunikacija
#define JEZGRO_ENABLE_CAN_HANDLER    1  // EK integracija
#define JEZGRO_ENABLE_AUDIT_LOGGER   1  // Beleženje događaja
```

---

## 3. EK-ADAPT-BUS

### 3.1 Namena

Retrofituje postojeće dizel ili starije električne autobuse za rad sa ELEKTROKOMBINACIJA infrastrukturom za zamenu baterija i punjenje.

### 3.2 Slučajevi korišćenja

1. **Retrofit konverzija**: Dodaj mogućnost zamene postojećim električnim autobusima
2. **Hibridna integracija**: Poveži dizel-hibridne autobuse na mrežu punjenja
3. **Tranzicija flote**: Postupna migracija sa nasleđene na EK platformu

### 3.3 Specifikacije

| Parametar | Vrednost | Napomene |
|-----------|----------|----------|
| Interfejs vozila | OEM-specifičan CAN | Prevedeno u EK |
| EK interfejs | CAN-FD @ 5 Mbps | Standardni EK protokol |
| Monitoring baterije | Preko OEM BMS | Prolazni podaci |
| MCU | STM32G474 | Jednostavniji zahtevi |
| Dimenzije | 200 × 150 × 80 mm | Montaža ispod table |
| IP stepen | IP40 | Unutar vozila |

### 3.4 Blok dijagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EK-ADAPT-BUS BLOK DIJAGRAM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   AUTOBUS (Nasleđeni)                     EK EKOSISTEM                      │
│                                                                              │
│   ┌─────────────┐                          ┌─────────────┐                  │
│   │   OEM       │                          │   Stanica   │                  │
│   │   CAN mag.  │                          │   zamene    │                  │
│   └──────┬──────┘                          └──────┬──────┘                  │
│          │                                        │                         │
│   ┌──────▼──────┐                          ┌──────▼──────┐                  │
│   │   OEM BMS   │                          │   EK       │                  │
│   │  Interfejs  │                          │  CAN-FD    │                  │
│   └──────┬──────┘                          └──────┬──────┘                  │
│          │                                        │                         │
│          └────────────────┬───────────────────────┘                         │
│                           │                                                 │
│                    ┌──────▼──────┐                                          │
│                    │  STM32G474  │                                          │
│                    │  JEZGRO-GW  │                                          │
│                    │             │                                          │
│                    │ ┌─────────┐ │                                          │
│                    │ │OEM Proto│ │  ← OEM-specifičan                        │
│                    │ │ Parser  │ │                                          │
│                    │ └─────────┘ │                                          │
│                    │ ┌─────────┐ │                                          │
│                    │ │   EK    │ │  ← EK protokol                           │
│                    │ │Protokol │ │                                          │
│                    │ └─────────┘ │                                          │
│                    │ ┌─────────┐ │                                          │
│                    │ │Virtuelni│ │  ← Virtuelni BMS                         │
│                    │ │ BMS     │ │                                          │
│                    │ └─────────┘ │                                          │
│                    └─────────────┘                                          │
│                                                                              │
│   Funkcije:                                                                  │
│   • Parsiranje OEM CAN protokola (Solaris, BYD, itd.)                      │
│   • Prevođenje stanja baterije u EK format                                 │
│   • Koordinacija sa stanicom zamene                                        │
│   • Integracija upravljanja flotom                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Podržani OEM protokoli

| Proizvođač | Protokol | Podrška adaptera |
|------------|----------|------------------|
| Solaris | Vlasnički CAN | Potpuna |
| BYD | Vlasnički CAN | Potpuna |
| Yutong | GB/T 27930 | Potpuna |
| VDL | Vlasnički CAN | Delimična |
| Mercedes eCitaro | Vlasnički | Planirano |
| Volvo | Vlasnički | Planirano |

### 3.6 JEZGRO-GW konfiguracija

```c
// EK-ADAPT-BUS konfiguracija servisa
#define JEZGRO_ENABLE_OEM_PROTOCOL   1  // OEM CAN parser
#define JEZGRO_ENABLE_VIRTUAL_BMS    1  // Prevođenje baterije
#define JEZGRO_ENABLE_CAN_HANDLER    1  // Dupli CAN (OEM + EK)
#define JEZGRO_ENABLE_SWAP_COORD     1  // Interfejs stanice zamene
#define JEZGRO_ENABLE_AUDIT_LOGGER   1  // Beleženje događaja
```

---

## 4. EK-ADAPT-CCS

### 4.1 Namena

Premošćuje standardne CCS Combo punjače i vozila ka EK ekosistemu, omogućavajući bilo kom CCS-sposobnom vozilu da koristi EK infrastrukturu punjenja.

### 4.2 Slučajevi korišćenja

1. **Univerzalno punjenje**: Bilo koji CCS EV na EK stanicama
2. **Prevođenje protokola**: CCS ↔ EK nativni protokol
3. **Mrežne usluge**: Omogući CCS vozilima V2G (gde je podržano)

### 4.3 Specifikacije

| Parametar | Vrednost | Napomene |
|-----------|----------|----------|
| Interfejs vozila | CCS Combo 2 | Standardni utikač |
| Interfejs punjača | EK3 moduli preko CAN-FD | Do 150 kW |
| Opseg snage | 50-150 kW | DC brzo punjenje |
| Podrška protokola | ISO 15118-2, DIN SPEC 70121 | Pun PnC |
| MCU | STM32H743 | Pun ISO 15118 stek |
| Dimenzije | 400 × 300 × 150 mm | Postoljska montaža |
| IP stepen | IP55 | Spolja |

### 4.4 Blok dijagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EK-ADAPT-CCS BLOK DIJAGRAM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   VOZILO                       EK-ADAPT-CCS                EK3 REKOVI       │
│                                                                              │
│   ┌─────────┐              ┌─────────────────┐          ┌─────────┐         │
│   │  CCS2   │              │                 │          │  EK3    │         │
│   │ Utikač  │◄────────────►│  Relejna ploča  │          │ Moduli  │         │
│   │         │    DC        │  (Kontaktori)   │          │         │         │
│   └────┬────┘              └────────┬────────┘          └────┬────┘         │
│        │                            │                        │              │
│        │                            │ DC magistrala (650V)   │              │
│        │                     ═══════╪════════════════════════╪═══════       │
│        │                            │                        │              │
│   ┌────▼────┐              ┌────────▼────────┐          ┌────▼────┐         │
│   │  Pilot  │              │  Stepen snage   │          │ CAN-FD  │         │
│   │  PWM    │              │  (Pred-punjenje)│          │ mag.    │         │
│   └────┬────┘              └────────┬────────┘          └────┬────┘         │
│        │                            │                        │              │
│   ┌────▼────┐                       │                        │              │
│   │  PLC    │              ┌────────▼────────────────────────▼────┐         │
│   │ Modem   │              │            STM32H743                  │         │
│   │(HomePlug)│◄───────────►│            JEZGRO-GW                 │         │
│   └─────────┘              │                                      │         │
│                            │  ┌─────────┐  ┌─────────┐  ┌───────┐│         │
│                            │  │ISO15118 │  │Upravlj. │  │Sigurn.││         │
│                            │  │ Stek    │  │modulima │  │Monitor││         │
│                            │  └─────────┘  └─────────┘  └───────┘│         │
│                            └──────────────────────────────────────┘         │
│                                                                              │
│   Funkcije:                                                                  │
│   • Pun CCS Combo 2 protokol punjenja                                      │
│   • ISO 15118 SLAC + V2G poruke                                            │
│   • EK3 koordinacija modula                                                │
│   • Upravljanje putanjom snage (pred-punjenje, kontaktori)                 │
│   • Integracija merenja i naplate                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.5 Sigurnosna arhitektura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EK-ADAPT-CCS SIGURNOSNI SLOJEVI                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Sloj 1: HARDVER                                                           │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ • Interlock kontaktora (HW lanac)                                   │   │
│   │ • Detekcija greške uzemljenja (RCD)                                │   │
│   │ • Zaštita od prestruje (osigurač + prekidač)                       │   │
│   │ • Monitoring pilot signala (nezavisni komparator)                   │   │
│   │ • Proximity detekcija (PP pin)                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   Sloj 2: FIRMVER (JEZGRO servisi)                                          │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ • Validacija mašine stanja                                          │   │
│   │ • Monitoring tajmauta (po IEC 61851)                               │   │
│   │ • Test izolacije pre napajanja                                      │   │
│   │ • Primena ograničenja struje/napona                                 │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   Sloj 3: PROTOKOL (ISO 15118)                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ • Validacija sesije                                                 │   │
│   │ • Pregovaranje parametara                                           │   │
│   │ • Rukovanje hitnim zaustavljanjem                                   │   │
│   │ • Detekcija zavarenja                                               │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.6 JEZGRO-GW konfiguracija

```c
// EK-ADAPT-CCS konfiguracija servisa
#define JEZGRO_ENABLE_PLL_SYNC       0  // Nema AC mreže (DC punjač)
#define JEZGRO_ENABLE_ISO15118       1  // Pun V2G stek
#define JEZGRO_ENABLE_SLAC           1  // PLC komunikacija
#define JEZGRO_ENABLE_POWER_PATH     1  // Upravljanje kontaktorima
#define JEZGRO_ENABLE_MODULE_CTRL    1  // EK3 koordinacija
#define JEZGRO_ENABLE_METERING       1  // Merenje energije
#define JEZGRO_ENABLE_CAN_HANDLER    1  // EK integracija
#define JEZGRO_ENABLE_AUDIT_LOGGER   1  // Beleženje događaja
```

---

## 5. EK-ADAPT-MCS

### 5.1 Namena

Omogućava Megawatt Charging System (MCS) mogućnost za teške kamione i autobuse, podržavajući brzine punjenja do 3 MW.

### 5.2 Slučajevi korišćenja

1. **Autoputni kamioni**: Električni kamioni za duge relacije koji zahtevaju brzo punjenje
2. **Električni autobusi**: Punjenje visoke snage u depou za flote autobusa
3. **Teška oprema**: Rudarski kamioni, lučka oprema

### 5.3 Specifikacije

| Parametar | Vrednost | Napomene |
|-----------|----------|----------|
| Konektor | MCS (CharIN) | Nominalno 3 MW |
| Opseg snage | 350 kW - 3 MW | Skalabilno |
| Napon | 800-1500V DC | MCS standard |
| Struja | Do 3000A | Tečno hlađen kabl |
| Protokol | ISO 15118-20 + CharIN MCS | Pun BPT |
| MCU | STM32H743 | JEZGRO-GW |
| Dimenzije | 600 × 400 × 200 mm | Podna montaža |
| IP stepen | IP55 | Spolja |
| Hlađenje | Tečno + prinudni vazduh | Visoka snaga |

### 5.4 Blok dijagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EK-ADAPT-MCS BLOK DIJAGRAM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   KAMION                       EK-ADAPT-MCS              EK3 REKOVI (x4)    │
│                                                                              │
│   ┌─────────┐              ┌─────────────────┐         ┌─────────────┐      │
│   │   MCS   │              │  Sklop kontak-  │         │ 277 kW × 4  │      │
│   │ Utikač  │◄────────────►│  tora visoke    │◄───────►│ = 1.1 MW    │      │
│   │         │    3000A     │  snage          │         │             │      │
│   └────┬────┘   (hlađeno)  └────────┬────────┘         └──────┬──────┘      │
│        │                            │                         │             │
│        │                            │ DC mag. (1500V max)     │             │
│        │                     ═══════╪═════════════════════════╪═══════      │
│        │                            │                         │             │
│   ┌────▼────┐              ┌────────▼────────┐         ┌──────▼──────┐      │
│   │ Pilot   │              │ Jedinica za     │         │ Kontroleri  │      │
│   │  + PP   │              │ upravljanje     │         │ rekova      │      │
│   └────┬────┘              │ snagom (Sekvenc.)│         └──────┬──────┘      │
│        │                   └────────┬────────┘                │             │
│   ┌────▼────┐                       │                         │             │
│   │  PLC    │              ┌────────▼─────────────────────────▼────┐        │
│   │ Modem   │◄────────────►│            STM32H743                   │        │
│   │(HomePlug)│              │            JEZGRO-GW                  │        │
│   └─────────┘              │                                       │        │
│                            │  ┌─────────┐  ┌─────────┐  ┌────────┐│        │
│                            │  │ MCS     │  │ Balans  │  │Termalno││        │
│                            │  │ Protokol│  │ snage   │  │ Mgmt   ││        │
│                            │  └─────────┘  └─────────┘  └────────┘│        │
│                            └───────────────────────────────────────┘        │
│                                                                              │
│   Ključne karakteristike:                                                    │
│   • Koordinacija više rekova za MW-skalnu snagu                            │
│   • Upravljanje tečnim hlađenjem (kabl + elektronika)                      │
│   • Usklađenost sa CharIN MCS protokolom                                   │
│   • Koordinacija mrežne konekcije (upravljanje zahtevima)                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.5 Konfiguracija skaliranja

| Konfiguracija | Rekovi | EK3 moduli | Ukupna snaga |
|---------------|--------|------------|--------------|
| MCS-350 | 2 | 106 | 350 kW |
| MCS-750 | 3 | 227 | 750 kW |
| MCS-1000 | 4 | 303 | 1 MW |
| MCS-1500 | 6 | 454 | 1.5 MW |
| MCS-3000 | 12 | 909 | 3 MW |

### 5.6 JEZGRO-GW konfiguracija

```c
// EK-ADAPT-MCS konfiguracija servisa
#define JEZGRO_ENABLE_ISO15118       1  // V2G stek
#define JEZGRO_ENABLE_SLAC           1  // PLC komunikacija
#define JEZGRO_ENABLE_MCS_PROTOCOL   1  // CharIN MCS ekstenzije
#define JEZGRO_ENABLE_MULTI_RACK     1  // Koordinacija rekova
#define JEZGRO_ENABLE_THERMAL_MGR    1  // Sistem hlađenja
#define JEZGRO_ENABLE_POWER_BALANCE  1  // MW-skalno balansiranje
#define JEZGRO_ENABLE_CAN_HANDLER    1  // EK integracija
#define JEZGRO_ENABLE_AUDIT_LOGGER   1  // Beleženje događaja
```

---

## 6. EK-ADAPT-OCPP

### 6.1 Namena

Integriše stanice punjenja trećih strana u ELEKTROKOMBINACIJA ekosistem putem OCPP protokola, omogućavajući unificirano upravljanje flotom.

### 6.2 Slučajevi korišćenja

1. **CPO integracija**: Upravljaj punjačima trećih strana zajedno sa EK stanicama
2. **Roaming**: Omogući EK floti pristup ne-EK punjačima
3. **Nadogradnja nasleđenih**: Dodaj pametne funkcije postojećim punjačima

### 6.3 Specifikacije

| Parametar | Vrednost | Napomene |
|-----------|----------|----------|
| OCPP podrška | 1.6J, 2.0.1 | Puni profili |
| Povezivanje | Ethernet, 4G/LTE | Dupla putanja |
| Interfejs punjača | RS485, Modbus, CAN | Više opcija |
| MCU | STM32G474 | Jednostavniji zahtevi |
| Dimenzije | 150 × 100 × 50 mm | DIN šina |
| IP stepen | IP20 | Unutrašnje kućište |

### 6.4 Blok dijagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EK-ADAPT-OCPP BLOK DIJAGRAM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   OBLAK                        EK-ADAPT-OCPP             PUNJAČ TREĆE STRANE│
│                                                                              │
│   ┌─────────┐              ┌─────────────────┐         ┌─────────────┐      │
│   │ EK      │              │                 │         │ Kontroler   │      │
│   │ Flota   │              │    Ethernet     │         │ punjača     │      │
│   │ Backend │◄────────────►│    + 4G/LTE     │         │             │      │
│   └─────────┘   OCPP 2.0   └────────┬────────┘         └──────┬──────┘      │
│                                     │                         │             │
│   ┌─────────┐                       │                         │             │
│   │ OCPP    │                       │                  ┌──────▼──────┐      │
│   │ Centr.  │              ┌────────▼────────┐         │   RS485 /   │      │
│   │ Sistem  │              │   STM32G474     │         │   Modbus /  │      │
│   └────┬────┘              │   JEZGRO-GW     │◄───────►│   CAN       │      │
│        │                   │                 │         └─────────────┘      │
│        │                   │ ┌─────────────┐ │                              │
│        └──────────────────►│ │ OCPP klijent│ │                              │
│              OCPP 2.0      │ │ (ka EK)     │ │                              │
│                            │ └─────────────┘ │                              │
│                            │ ┌─────────────┐ │                              │
│                            │ │ OCPP server │ │  ← Strana punjača            │
│                            │ │(od punjača) │ │                              │
│                            │ └─────────────┘ │                              │
│                            │ ┌─────────────┐ │                              │
│                            │ │  Prevodilac │ │                              │
│                            │ │  protokola  │ │                              │
│                            │ └─────────────┘ │                              │
│                            └─────────────────┘                              │
│                                                                              │
│   Funkcije:                                                                  │
│   • OCPP ↔ EK prevođenje protokola                                         │
│   • Dupli OCPP (klijent ka EK backend, server ka punjaču)                  │
│   • Upravljanje profilima pametnog punjenja                                │
│   • Agregacija i validacija merenja                                        │
│   • Lokalni keš autorizacije                                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.5 Podrška OCPP funkcija

| Funkcija | OCPP 1.6J | OCPP 2.0.1 |
|----------|-----------|------------|
| Daljinski Start/Stop | ✓ | ✓ |
| Pametno punjenje | ✓ | ✓ |
| Lokalna autorizacija | ✓ | ✓ |
| Ažuriranje firmvera | ✓ | ✓ |
| Dijagnostika | ✓ | ✓ |
| 15118 sertifikat | - | ✓ |
| Model uređaja | - | ✓ |
| V2G (ISO 15118-20) | - | ✓ |

### 6.6 JEZGRO-GW konfiguracija

```c
// EK-ADAPT-OCPP konfiguracija servisa
#define JEZGRO_ENABLE_OCPP_CLIENT    1  // Ka EK backend-u
#define JEZGRO_ENABLE_OCPP_SERVER    1  // Od punjača treće strane
#define JEZGRO_ENABLE_PROTOCOL_TRANS 1  // Sloj za prevođenje
#define JEZGRO_ENABLE_LOCAL_AUTH     1  // Offline autorizacija
#define JEZGRO_ENABLE_ETHERNET       1  // Mrežni stek
#define JEZGRO_ENABLE_CELLULAR       1  // 4G/LTE modem
#define JEZGRO_ENABLE_AUDIT_LOGGER   1  // Beleženje događaja
```

---

## 7. Hardverska platforma

### 7.1 Zajednička PCB

Svi adapteri dele zajedničku kontrolersku ploču:

| Komponenta | Oznaka dela | Napomene |
|------------|-------------|----------|
| MCU | STM32H743VIT6 ili STM32G474VET6 | Zavisno od adaptera |
| Flash | W25Q128JV | 16 MB eksterni |
| Ethernet PHY | LAN8742A | 10/100 Mbps |
| CAN primopredajnik | TJA1443 | CAN-FD sposoban |
| PLC modem | QCA7005 | HomePlug Green PHY |
| Celular | Quectel EC25 | 4G/LTE (opciono) |
| Napajanje | Široki ulaz (9-36V) | Automobilski |
| ESD zaštita | TVS nizovi | Svi U/I |

### 7.2 Opcije kućišta

| Model | Veličina (mm) | IP stepen | Montaža | Primena |
|-------|---------------|-----------|---------|---------|
| EK-ENC-S | 150×100×50 | IP20 | DIN šina | Unutra |
| EK-ENC-M | 200×150×80 | IP40 | Zid/Panel | Vozilo |
| EK-ENC-L | 300×200×100 | IP54 | Zid | Zaštićeno |
| EK-ENC-XL | 400×300×150 | IP55 | Postolje | Spolja |

### 7.3 Standardi konektora

| Interfejs | Konektor | Napomene |
|-----------|----------|----------|
| Ulazno napajanje | Phoenix MC 4-pin | 9-36V DC |
| CAN-FD (EK) | Deutsch DT04-4P | IP67 stepen |
| CAN (OEM) | OEM-specifičan | Preko kabelskog snopa |
| Ethernet | M12 D-kodiran | Industrijski |
| PLC | Integrisano | Preko vodova napajanja |
| USB | Type-C | Održavanje |

---

## 8. Zahtevi za sertifikaciju

### 8.1 Po tipu adaptera

| Adapter | CE | UL | Homologacija vozila | Mrežni kod |
|---------|----|----|---------------------|------------|
| EK-ADAPT-V2G | ✓ | ✓ | - | EN 50549 |
| EK-ADAPT-BUS | ✓ | - | ECE R100 | - |
| EK-ADAPT-CCS | ✓ | ✓ | - | EN 50549 |
| EK-ADAPT-MCS | ✓ | ✓ | - | EN 50549 |
| EK-ADAPT-OCPP | ✓ | - | - | - |

### 8.2 Sertifikacije protokola

| Protokol | Telo za testiranje | Adapter |
|----------|--------------------|---------|
| ISO 15118-2 | CharIN | V2G, CCS |
| ISO 15118-20 | CharIN | V2G, CCS, MCS |
| OCPP 2.0.1 | OCA | OCPP, V2G |
| CHAdeMO 3.0 | CHAdeMO | V2G |
| CharIN MCS | CharIN | MCS |

---

## 9. Unakrsne reference

| Dokument | Veza |
|----------|------|
| `tehnika/inzenjersko/sr/24-jezgro-gw.md` | Firmver kapije |
| `tehnika/inzenjersko/sr/21-jezgro-product-family.md` | JEZGRO varijante |
| `tehnika/inzenjersko/sr/07-v2g-control.md` | V2G algoritmi |
| `tehnika/inzenjersko/sr/08-iso15118-bpt.md` | ISO 15118 detalji |
| `tehnika/inzenjersko/sr/SPECIFICATIONS.md` | Master specifikacije |

---

## Istorija promena

| Datum | Verzija | Opis |
|-------|---------|------|
| 2026-01-04 | 1.0 | Inicijalna specifikacija EK-ADAPT porodice |
