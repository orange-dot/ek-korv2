# JEZGRO razvojne opcije

## Informacije o dokumentu

| Polje | Vrednost |
|-------|----------|
| ID dokumenta | EK-TECH-020 |
| Verzija | 1.2 |
| Datum | 2026-01-04 |
| Status | Aktivan |
| Povezano | 16-jezgro.md, 17-jezgro-dev-bom.md, 18-jezgro-dev-plan.md |

---

## 1. Pregled

JEZGRO mikrokernel RTOS može se razvijati na tri različite hardverske platforme, od kojih je svaka optimizovana za specifične slučajeve upotrebe:

| Opcija | Platforma | Ciljna upotreba | Početna cena |
|--------|-----------|-----------------|--------------|
| **STM32** | ST STM32G474 | Brzo prototipiranje, startapi | €290 |
| **AURIX** | Infineon TC375/TC397 | Bezbednosno-kritične automobilske aplikacije (ASIL-D) | €165 |
| **Hibrid** | AURIX + C2000 + ESP32 | Ultimate: ASIL-D + 150ps PWM + WiFi/OTA | €200 |

---

## 2. Poređenje opcija

### 2.1 Tehničke specifikacije

| Specifikacija | STM32 | AURIX | Hibrid |
|---------------|-------|-------|--------|
| **Primarni MCU** | STM32G474 | TC375/TC397 | AURIX + C2000 + ESP32 |
| **Arhitektura** | Cortex-M4 | TriCore (3 jezgra) | TriCore + DSP + Xtensa |
| **Takt** | 170 MHz | 300 MHz | 300 + 100 + 240 MHz |
| **RAM** | 128 KB | 768 KB | 768 + 100 + 512 KB |
| **CAN-FD** | 3× instance | 4× instance | 4× + 2× instance |
| **MPU regioni** | 8 | 16 po jezgru | 16 + dedicirani power MCU |
| **PWM rezolucija** | 5,9 ns | 6,5 ns | **150 ps** (C2000) |
| **ADC** | 12-bit @ 4 MSPS | 12-bit @ 5 MSPS | 12-bit @ 3,5 MSPS |
| **Bezbednosna sertifikacija** | Nema | **ASIL-D** | **ASIL-D** (AURIX) |
| **Hardverski lockstep** | Ne | **Da** | **Da** (AURIX) |
| **HSM (bezbednost)** | Ne | **Da** | **Da** (AURIX) |
| **WiFi/OTA** | Ne | Ne | **Da** (ESP32) |

### 2.2 Poređenje investicija

| Faza | STM32 | AURIX | Hibrid |
|------|-------|-------|--------|
| Faza 1: Kernel | €290 | €165 | €200 |
| Faza 2: CAN-FD roj | €410 | €430 | €550 |
| Faza 3: Kompletan sistem | €605 | €830 | €1.100 |
| Faza 4: Proizvodnja | €770 | €1.030 | €1.400 |

### 2.3 Složenost razvoja

| Faktor | STM32 | AURIX | Hibrid |
|--------|-------|-------|--------|
| Krivulja učenja | Niska | Srednja | Visoka |
| Broj toolchain-ova | 1 | 1 | 3 |
| Veličina ekosistema | ★★★★★ | ★★★ | ★★★★ |
| Složenost debagovanja | Niska | Srednja | Visoka |
| Vreme do prvog boot-a | 1 dan | 3 dana | 7 dana |
| Podrška zajednice | Odlična | Dobra | Mešovita |

---

## 3. Opcija A: STM32 (preporučeni početak)

### 3.1 Zašto STM32?

STM32G474 nudi najbolji balans ekosistema, cene i mogućnosti za inicijalni JEZGRO razvoj.

**Ključne karakteristike:**
- Cortex-M4 @ 170 MHz sa FPU
- 128 KB RAM, 512 KB Flash
- 8 MPU regiona za izolaciju grešaka
- 3× CAN-FD @ 5 Mbps
- HRPWM za energetsku elektroniku
- Integrisani ST-LINK debager na NUCLEO pločama

### 3.2 Arhitektura

```
┌─────────────────────────────────────────────────────────┐
│                    STM32G474 čvor                       │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   JEZGRO    │  │    IPC      │  │   CAN-FD    │     │
│  │   Kernel    │◄─┤   Menadžer  │◄─┤   Gateway   │◄─┐  │
│  │   (EDF)     │  │             │  │             │  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│         │                                           │  │
│  ┌──────▼──────────────────────────────────────┐   │  │
│  │           Korisnički servisi                 │   │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐          │   │  │
│  │  │ Power  │ │Termalni│ │ Komuni-│  ...     │   │  │
│  │  │ Ctrl   │ │ Mgmt   │ │ kacija │          │   │  │
│  │  └────────┘ └────────┘ └────────┘          │   │  │
│  └─────────────────────────────────────────────┘   │  │
└────────────────────────────────────────────────────┼──┘
                                                     │
                            CAN-FD magistrala ◄──────┘
                               (5 Mbps)
```

### 3.3 Pregled BOM-a za razvoj

| Faza | Investicija | Hardver |
|------|-------------|---------|
| 1. Kernel jezgro | €290 | 10× NUCLEO-G474RE + USB hub |
| 2. CAN-FD | €410 | + CAN primopredajnici + Canable Pro |
| 3. Debug alati | €440 | + Logički analizator + UART adapteri |
| 4. Prilagođena PCB | €605 | + 5× prototip ploča |

**Kompletan BOM:** Pogledajte `17-jezgro-dev-bom.md`
**Plan razvoja:** Pogledajte `18-jezgro-dev-plan.md`

### 3.4 Prednosti i ograničenja

| Prednosti | Ograničenja |
|-----------|-------------|
| Najveći ekosistem | Nema bezbednosne sertifikacije |
| Najniža krivulja učenja | Samo jednojezgarni |
| Najjeftinije dev ploče (€24) | Nema hardverski lockstep |
| Odlična dokumentacija | Ograničen RAM (128 KB) |
| Brz izlazak na tržište | Nema integrisani HSM |

---

## 4. Opcija B: Infineon AURIX (bezbednosno-kritična)

### 4.1 Zašto AURIX?

AURIX TC3xx je zlatni standard za bezbednosno-kritične automobilske aplikacije, nudeći hardverske funkcije koje je nemoguće postići softverski.

**Ključne karakteristike:**
- 3× TriCore CPU @ 300 MHz
- Hardverski lockstep (CPU0 preslikava CPU1)
- ASIL-D sertifikovan
- Hardverski bezbednosni modul (HSM)
- 768 KB RAM
- FlexRay podrška

### 4.2 Arhitektura

```
┌─────────────────────────────────────────────────────────────┐
│                    AURIX TC375 (3 jezgra)                   │
├───────────────┬───────────────┬───────────────┬─────────────┤
│    CPU0       │     CPU1      │     CPU2      │    HSM      │
│   (Master)    │  (Lockstep)   │ (Bezbednost)  │  (Kripto)   │
├───────────────┼───────────────┼───────────────┼─────────────┤
│ JEZGRO Kernel │ JEZGRO Mirror │ Bezbednosni   │ Secure boot │
│ Raspoređivač  │ (redundantni) │ Monitor       │ Čuv. ključ. │
│ IPC Menadžer  │               │ Watchdog      │ Kripto akc. │
│ CAN Gateway   │               │ Fault Handler │             │
└───────────────┴───────────────┴───────────────┴─────────────┘
        │               │               │
        └───────────────┴───────────────┘
                        │
           Hardverski komparator (lockstep verifikacija)
```

### 4.3 BOM za razvoj

#### Faza 1: Razvoj kernela (~€165)

| Stavka | Broj dela | Kol. | €/kom | Ukupno € |
|--------|-----------|------|-------|----------|
| AURIX TC375 Lite Kit | KIT_A2G_TC375_LITE | 2 | 70 | 140 |
| USB kablovi | - | 4 | 2 | 8 |
| Komplet žica | - | 1 | 7 | 7 |
| Breadboard | - | 2 | 5 | 10 |
| **Međuzbir** | | | | **€165** |

#### Faza 2: CAN-FD roj (~€265)

| Stavka | Broj dela | Kol. | €/kom | Ukupno € |
|--------|-----------|------|-------|----------|
| AURIX TC375 Lite Kit | KIT_A2G_TC375_LITE | 3 | 70 | 210 |
| CAN-FD primopredajnik | TLE9251VSJ | 5 | 8 | 40 |
| Terminacija + kablovi | - | 1 | 15 | 15 |
| **Međuzbir** | | | | **€265** |

#### Faza 3: Validacija bezbednosti (~€400)

| Stavka | Broj dela | Kol. | €/kom | Ukupno € |
|--------|-----------|------|-------|----------|
| AURIX TC397 Application Kit | KIT_A2G_TC397_TFT | 1 | 350 | 350 |
| Izolaciona monitor ploča | Prilagođeno | 1 | 50 | 50 |
| **Međuzbir** | | | | **€400** |

**Opcioni profesionalni alati:**
- Lauterbach TRACE32: ~€2.000
- iSYSTEM Blue Box: ~€800
- Tasking kompajler: €3.000/godišnje

### 4.4 Softverski stek

| Alat | Namena | Cena |
|------|--------|------|
| AURIX Development Studio | IDE (baziran na Eclipse) | Besplatno |
| iLLD (Low Level Drivers) | HAL za AURIX | Besplatno |
| MCAL (AUTOSAR) | AUTOSAR drajveri | Besplatno (ograničeno) |
| SafeTlib | Bezbednosna biblioteka | Besplatno |
| TriCore GCC | Kompajler | Besplatno |

### 4.5 Prednosti i ograničenja

| Prednosti | Ograničenja |
|-----------|-------------|
| ASIL-D sertifikacija | Strmija krivulja učenja |
| Hardverski lockstep | TriCore ≠ ARM |
| HSM za bezbednost | Skuplje (€70/ploča) |
| 768 KB RAM | Manji ekosistem |
| 3 nezavisna jezgra | Preterano za ne-bezbednosne aplikacije |

---

## 5. Opcija C: Hibrid "Ultimate"

### 5.1 Zašto Hibrid?

Kombinuje najbolje od svih svetova: AURIX bezbednost + visoko-rezolucioni PWM + ESP32 povezanost. Ultimate rešenje za zahtevne aplikacije.

**Ključne karakteristike:**
- AURIX TC375/TC397 za ASIL-D bezbednost i koordinaciju roja
- **Infineon XMC4400** ILI TI C2000 za kontrolu snage (150 ps PWM rezolucija)
- ESP32 za bežičnu povezanost (WiFi/BT, OTA ažuriranja)

### 5.1.1 XMC4400 vs TI C2000 (Izbor HRPWM MCU)

| Karakteristika | Infineon XMC4400 | TI C2000 (F280049C) |
|----------------|------------------|---------------------|
| **Arhitektura** | ARM Cortex-M4 | C28x DSP |
| **HRPWM rezolucija** | 150 ps | 150 ps |
| **Renode emulacija** | ✅ Moguće (prilagođeno) | ❌ Nije podržano |
| **Proizvođač** | **Isti kao AURIX** | Samo TI |
| **ADC brzina** | 70 ns (14,3 MSPS) | 290 ns (3,5 MSPS) |
| **IDE** | DAVE (bez simulatora) | CCS (sa simulatorom) |
| **Referentni dizajni** | Würth 3kW LLC | Zajednica |
| **Dev board** | ~€35 (PLT2GO) | ~€25 (LaunchPad) |

**Preporuka:**
- Koristite **XMC4400** za lakšu emulaciju i konzistentnost Infineon ekosistema
- Koristite **TI C2000** ako vam treba CCS simulator ili imate TI iskustvo

### 5.2 Arhitektura

```
                    ┌─────────────────────────────────────┐
                    │         Cloud / SCADA               │
                    └──────────────┬──────────────────────┘
                                   │ WiFi/MQTT
                    ┌──────────────▼──────────────────────┐
                    │     ESP32-S3 komunikacioni hub      │
                    │   • WiFi/BT gateway • OTA updates   │
                    └──────────────┬──────────────────────┘
                                   │ UART 1 Mbps
┌──────────────────────────────────┼──────────────────────────────────┐
│                          CAN-FD magistrala (5 Mbps)                 │
└───────────────┬──────────────────┴──────────────────┬───────────────┘
                │                                     │
┌───────────────▼───────────────┐     ┌───────────────▼───────────────┐
│       AURIX TC375/TC397       │     │      TMS320F280049C           │
│    JEZGRO Master (ASIL-D)     │     │      Kontroler snage          │
├───────────────────────────────┤     ├───────────────────────────────┤
│ • Lockstep (CPU0/CPU1)        │     │ • HRPWM 150 ps rezolucija     │
│ • Bezbednosni monitor (CPU2)  │     │ • ADC 3,5 MSPS                │
│ • HSM kripto                  │     │ • PFC + LLC kontrola          │
│ • Koordinacija roja           │     │ • Phase-shift DAB             │
└───────────────────────────────┘     └───────────────────────────────┘
```

### 5.3 BOM za razvoj

#### Faza 1: Triple-MCU jezgro (~€200-210)

**Opcija A: Sa XMC4400 (Preporučeno - Infineon ekosistem)**

| Stavka | Broj dela | Kol. | €/kom | Ukupno € |
|--------|-----------|------|-------|----------|
| AURIX TC375 Lite Kit | KIT_A2G_TC375_LITE | 2 | 70 | 140 |
| **XMC4400 PLT2GO** | KIT_XMC_PLT2GO_XMC4400 | 1 | 35 | 35 |
| ESP32-S3-DevKitC-1 | ESP32-S3-DEVKITC-1 | 1 | 10 | 10 |
| CAN + kablovi + žice | - | 1 | 25 | 25 |
| **Međuzbir** | | | | **€210** |

**Opcija B: Sa TI C2000 (CCS simulator dostupan)**

| Stavka | Broj dela | Kol. | €/kom | Ukupno € |
|--------|-----------|------|-------|----------|
| AURIX TC375 Lite Kit | KIT_A2G_TC375_LITE | 2 | 70 | 140 |
| TI LaunchPad F280049C | LAUNCHXL-F280049C | 1 | 25 | 25 |
| ESP32-S3-DevKitC-1 | ESP32-S3-DEVKITC-1 | 1 | 10 | 10 |
| CAN + kablovi + žice | - | 1 | 25 | 25 |
| **Međuzbir** | | | | **€200** |

#### Faza 2: Puna integracija (~€350)

| Stavka | Broj dela | Kol. | €/kom | Ukupno € |
|--------|-----------|------|-------|----------|
| AURIX TC375 Lite Kit | KIT_A2G_TC375_LITE | 2 | 70 | 140 |
| TI LaunchPad F280049C | LAUNCHXL-F280049C | 2 | 25 | 50 |
| CAN-FD primopredajnici | TLE9251VSJ | 6 | 8 | 48 |
| Canable Pro | - | 1 | 80 | 80 |
| Kablovi, konektori | - | 1 | 32 | 32 |
| **Međuzbir** | | | | **€350** |

#### Faza 3: Proizvodni sistem (~€550)

| Stavka | Broj dela | Kol. | €/kom | Ukupno € |
|--------|-----------|------|-------|----------|
| AURIX TC397 Application Kit | KIT_A2G_TC397_TFT | 1 | 350 | 350 |
| Prilagođena prototip PCB | - | 5 | 30 | 150 |
| Dodatne komponente | - | 1 | 50 | 50 |
| **Međuzbir** | | | | **€550** |

### 5.4 Softverski stek

| MCU | IDE | Kompajler | RTOS |
|-----|-----|-----------|------|
| AURIX TC375 | AURIX Dev Studio | TriCore GCC | JEZGRO |
| TMS320F280049C | Code Composer Studio | TI C2000 | Bare metal |
| ESP32-S3 | VS Code | ESP-IDF | FreeRTOS |

### 5.5 Međuprocesni protokol

```
┌────────────────────────────────────────────────────────────────┐
│                    CAN-FD format poruke                        │
├────────────┬───────────┬───────────┬──────────────────────────┤
│ ID (11bit) │ Tip (4b)  │ Izvor(4b) │ Payload (0-64 bajta)     │
├────────────┼───────────┼───────────┼──────────────────────────┤
│ 0x100-1FF  │ COORD     │ AURIX     │ Komande roja, bezbednost │
│ 0x200-2FF  │ POWER     │ C2000     │ PWM setpoint, ADC        │
│ 0x300-3FF  │ CLOUD     │ ESP32     │ Telemetrija, OTA status  │
│ 0x400-4FF  │ TELEMETRY │ Bilo koji │ Podaci za praćenje       │
└────────────┴───────────┴───────────┴──────────────────────────┘
```

### 5.6 Prednosti i ograničenja

| Prednosti | Ograničenja |
|-----------|-------------|
| **ASIL-D sertifikovan** (AURIX) | 3 različita toolchain-a |
| **150 ps PWM** (C2000) | Viša cena (~€1.100 kompletno) |
| **WiFi/OTA** (ESP32) | Složenija integracija |
| Hardverski lockstep | Duže vreme razvoja (7 dana) |
| HSM kripto bezbednost | Zahteva multi-domensku ekspertizu |
| Maksimalne mogućnosti | Veći PCB otisak |

---

## 6. Matrica preporuka

| Scenario | Preporučeno | Obrazloženje |
|----------|-------------|--------------|
| Brz PoC, startap | **STM32** | Najbrži izlazak na tržište, najbolji ekosistem |
| Ograničen budžet | **STM32** | Najjeftiniji kompletan sistem (€605) |
| Automobilski OEM | **AURIX** | Potrebna ASIL-D sertifikacija |
| Bezbednosno-kritično | **AURIX** | Hardverski lockstep, HSM |
| Premium energetska elektronika | **Hibrid** | 150 ps PWM rezolucija |
| IoT/povezani proizvod | **Hibrid** | Ugrađen WiFi/BT |
| Maksimalna fleksibilnost | **Hibrid** | Najbolje komponente od svakog |
| Potreban AUTOSAR | **AURIX** | Nativna MCAL podrška |
| Postojeća TI ekspertiza | **Hibrid** | Iskoristi znanje o C2000 |

---

## 7. Putanje migracije

Početak sa STM32 ne zaključava vas:

```
                        STM32 (počnite ovde)
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
    Ostanite na STM32    Migrirajte na AURIX  Evoluirajte u Hibrid
    (Proizvodnja)        (Potrebna bezbed.)   (Potrebne perform.)
            │                  │                  │
            │                  │                  │
            ▼                  ▼                  ▼
    ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
    │ • Skaliraj roj│  │ • Port na     │  │ • Zadrži STM32│
    │ • Custom PCB  │  │   TriCore     │  │   koordinator │
    │ • Optimizuj   │  │ • Dodaj       │  │ • Dodaj C2000 │
    │   proizvodnju │  │   lockstep    │  │   za snagu    │
    │               │  │ • SafeTlib    │  │ • Dodaj XMC   │
    │               │  │ • ASIL sert.  │  │   za bezbed.  │
    └───────────────┘  └───────────────┘  └───────────────┘
```

**Preporučeni pristup:** Počnite sa STM32, validirajte JEZGRO kernel dizajn, zatim migrirajte ako zahtevi to nalažu.

---

## 8. Vodič za brzu odluku

```
Da li vam treba ASIL-D sertifikacija?
    │
    ├─► DA ─► AURIX
    │
    └─► NE
         │
         Da li vam treba 150 ps PWM za energetsku elektroniku?
             │
             ├─► DA ─► Hibrid
             │
             └─► NE
                  │
                  Da li vam treba bežični OTA?
                      │
                      ├─► DA ─► Hibrid
                      │
                      └─► NE ─► STM32
```

---

## 9. Referentni dokumenti

| Dokument | Sadržaj |
|----------|---------|
| 16-jezgro.md | Kompletna RTOS specifikacija |
| 17-jezgro-dev-bom.md | STM32 kompletan BOM |
| 18-jezgro-dev-plan.md | STM32 plan razvoja |
| SPECIFICATIONS.md | EK3 hardverske specifikacije |

---

## Istorija izmena

| Datum | Verzija | Opis |
|-------|---------|------|
| 2026-01-04 | 1.0 | Inicijalna verzija |
| 2026-01-04 | 1.1 | Konsolidovane tri opcije, spremno za sajt |
| 2026-01-04 | 1.2 | Hibrid ažuriran na AURIX + C2000 + ESP32 (Ultimate) |
| 2026-01-04 | 1.3 | Dodat Infineon XMC4400 kao alternativa TI C2000 (ARM Cortex-M4 sa 150ps HRPWM, Renode emulatibilan) |
