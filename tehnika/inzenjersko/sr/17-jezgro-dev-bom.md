# JEZGRO Razvojna BOM Lista

## Informacije o dokumentu

| Polje | Vrednost |
|-------|----------|
| ID dokumenta | EK-TECH-018 |
| Verzija | 1.0 |
| Datum | 2026-01-04 |
| Status | Nacrt |
| Povezano | 16-jezgro.md |

---

## 1. Pregled

Ovaj dokument sadrži specifikaciju materijala (BOM) za razvoj prototipa JEZGRO mikrokernela. Uključuje:

1. **Razvojni alati** - ploče, debugeri, analizatori
2. **Diskretne komponente** - za izradu prototip PCB-a
3. **Softverski alati** - besplatni/open source toolchain

Ciljni MCU: **STM32G474RET6** (Cortex-M4 @ 170MHz, 128KB RAM, MPU)

---

## 2. Razvojni alati

### 2.1 Razvojne ploče

| ID | Komponenta | Opis | Kom | Jed. € | Ukupno € | Dobavljač |
|----|------------|------|-----|--------|----------|-----------|
| DEV01 | NUCLEO-G474RE | STM32G474RE dev ploča (128KB RAM, MPU) | 2 | 24,00 | 48,00 | Mouser/DigiKey |
| DEV02 | ST-LINK V3MINIE | Brzi eksterni debuger | 1 | 12,00 | 12,00 | ST |
| DEV03 | ST-LINK V3SET | Komplet debuger (opciono) | 1 | 35,00 | 35,00 | ST |
| | **Subtotal** | | | | **€60,00** | |

### 2.2 CAN-FD testiranje

| ID | Komponenta | Opis | Kom | Jed. € | Ukupno € | Dobavljač |
|----|------------|------|-----|--------|----------|-----------|
| CAN01 | PEAK PCAN-USB FD | CAN-FD USB adapter (5 Mbps) | 1 | 320,00 | 320,00 | PEAK-System |
| CAN02 | Canable Pro | Jeftinija CAN-FD alternativa | 1 | 80,00 | (80,00) | Canable |
| CAN03 | SN65HVD230 breakout | CAN primopredajnik za NUCLEO | 3 | 4,00 | 12,00 | Amazon |
| CAN04 | DB9 konektori | CAN standardni konektori | 10 | 1,50 | 15,00 | - |
| CAN05 | CAN kablovi | Upredena parica, oklopljeno, 2m | 5 | 4,00 | 20,00 | - |
| CAN06 | Terminacioni otpornici | 120Ω, 1% | 10 | 0,10 | 1,00 | - |
| | **Subtotal** | | | | **€368,00** | |

### 2.3 Debug i analiza

| ID | Komponenta | Opis | Kom | Jed. € | Ukupno € | Dobavljač |
|----|------------|------|-----|--------|----------|-----------|
| DBG01 | Logički analizator 24MHz | Osnovna analiza tajminga | 1 | 15,00 | 15,00 | AliExpress |
| DBG02 | Saleae Logic 8 | Profesionalni logički analizator | 1 | 350,00 | (350,00) | Saleae |
| DBG03 | USB-UART CP2102 | Serijski debug izlaz | 2 | 3,00 | 6,00 | - |
| DBG04 | Segger J-Trace PRO | ETM trace (opciono) | 1 | 1200,00 | (1200,00) | Segger |
| | **Subtotal** | | | | **€21,00** | |

### 2.4 Napajanje i laboratorijska oprema

| ID | Komponenta | Opis | Kom | Jed. € | Ukupno € | Dobavljač |
|----|------------|------|-----|--------|----------|-----------|
| PWR01 | Laboratorijsko napajanje 0-30V/5A | Podesivo, dvokanalno | 1 | 85,00 | 85,00 | Korad/RND |
| PWR02 | USB-C PD trigger | Alternativno napajanje | 2 | 8,00 | 16,00 | - |
| PWR03 | INA219 monitor struje | Profilisanje potrošnje | 3 | 5,00 | 15,00 | - |
| | **Subtotal** | | | | **€116,00** | |

### 2.5 Kablovi i pribor

| ID | Komponenta | Opis | Kom | Jed. € | Ukupno € |
|----|------------|------|-----|--------|----------|
| ACC01 | Dupont žice | M-M, M-F, F-F komplet | 1 | 5,00 | 5,00 |
| ACC02 | Mini breadboard | 400 tačaka | 2 | 3,00 | 6,00 |
| ACC03 | USB kablovi | Micro-B i USB-C | 5 | 3,00 | 15,00 |
| ACC04 | Hvataljke za sonde | Mikro-grabber komplet | 2 | 8,00 | 16,00 |
| | **Subtotal** | | | | **€42,00** |

### 2.6 Pregled razvojnih alata

| Kategorija | Osnovno € | Sa opcijama € |
|------------|-----------|---------------|
| Razvojne ploče | 60,00 | 95,00 |
| CAN-FD testiranje | 368,00 | 368,00 |
| Debug i analiza | 21,00 | 1.571,00 |
| Napajanje i lab | 116,00 | 116,00 |
| Kablovi i pribor | 42,00 | 42,00 |
| **UKUPNO** | **€607,00** | **€2.192,00** |

---

## 3. Prototip ploča - Diskretne komponente

Prilagođeni PCB za JEZGRO razvoj sa punim CAN-FD i debug mogućnostima.

### 3.1 MCU i jezgro

| ID | Komponenta | Part Number | Kućište | Kom | Jed. € | Ukupno € |
|----|------------|-------------|---------|-----|--------|----------|
| U1 | MCU Cortex-M4 170MHz | STM32G474RET6 | LQFP64 | 1 | 8,50 | 8,50 |
| Y1 | Kristal 25MHz | ABM8-25.000MHZ-B2 | 3.2×2.5mm | 1 | 0,80 | 0,80 |
| Y2 | Kristal 32.768kHz | ABS07-32.768KHZ | 3.2×1.5mm | 1 | 0,50 | 0,50 |
| | **Subtotal** | | | | | **€9,80** |

### 3.2 Napajanje

| ID | Komponenta | Part Number | Kućište | Kom | Jed. € | Ukupno € |
|----|------------|-------------|---------|-----|--------|----------|
| U2 | LDO 3.3V 500mA | AMS1117-3.3 | SOT-223 | 1 | 0,30 | 0,30 |
| U3 | LDO 5V 500mA | AMS1117-5.0 | SOT-223 | 1 | 0,30 | 0,30 |
| U4 | DC-DC buck modul | MP1584EN | Modul | 1 | 1,50 | 1,50 |
| | **Subtotal** | | | | | **€2,10** |

### 3.3 CAN-FD interfejs

| ID | Komponenta | Part Number | Kućište | Kom | Jed. € | Ukupno € |
|----|------------|-------------|---------|-----|--------|----------|
| U5 | CAN-FD primopredajnik | TJA1443AT | SOIC-8 | 1 | 2,80 | 2,80 |
| U6 | CAN-FD primopredajnik | TJA1443AT | SOIC-8 | 1 | 2,80 | 2,80 |
| R1,R2 | Terminacija | 120Ω 1% | 0603 | 2 | 0,05 | 0,10 |
| | **Subtotal** | | | | | **€5,70** |

### 3.4 Debug i programiranje

| ID | Komponenta | Part Number | Kućište | Kom | Jed. € | Ukupno € |
|----|------------|-------------|---------|-----|--------|----------|
| J1 | SWD konektor | 2x5 1.27mm | THT | 1 | 0,40 | 0,40 |
| J2 | UART konektor | 1x4 2.54mm | THT | 1 | 0,20 | 0,20 |
| U7 | USB-UART most | CP2102N | QFN-28 | 1 | 1,50 | 1,50 |
| | **Subtotal** | | | | | **€2,10** |

### 3.5 Memorija (opciono)

| ID | Komponenta | Part Number | Kućište | Kom | Jed. € | Ukupno € |
|----|------------|-------------|---------|-----|--------|----------|
| U8 | QSPI Flash 16MB | W25Q128JVSIQ | SOIC-8 | 1 | 2,00 | 2,00 |
| U9 | FRAM 256Kb | FM25V10-G | SOIC-8 | 1 | 3,50 | 3,50 |
| | **Subtotal** | | | | | **€5,50** |

### 3.6 Pasivne komponente

| ID | Komponenta | Vrednost | Kućište | Kom | Jed. € | Ukupno € |
|----|------------|----------|---------|-----|--------|----------|
| C1-C10 | Blokadni kondenzatori | 100nF X7R | 0603 | 10 | 0,03 | 0,30 |
| C11-C14 | Bulk kondenzatori | 10µF X5R | 0805 | 4 | 0,10 | 0,40 |
| C15-C18 | Opterećenje kristala | 20pF C0G | 0603 | 4 | 0,05 | 0,20 |
| R3-R12 | Pull-up/down | 10kΩ | 0603 | 10 | 0,02 | 0,20 |
| R13-R14 | USB serijski | 22Ω | 0603 | 2 | 0,05 | 0,10 |
| L1-L2 | Feritna perla | 600Ω@100MHz | 0603 | 2 | 0,10 | 0,20 |
| | **Subtotal** | | | | | **€1,40** |

### 3.7 Konektori

| ID | Komponenta | Tip | Kućište | Kom | Jed. € | Ukupno € |
|----|------------|-----|---------|-----|--------|----------|
| J3 | Ulaz napajanja | DC barrel 5.5/2.1 | THT | 1 | 0,50 | 0,50 |
| J4-J5 | CAN magistrala | JST-XH 4-pin | THT | 2 | 0,20 | 0,40 |
| J6 | USB | USB-C 16-pin | SMD | 1 | 0,60 | 0,60 |
| J7 | GPIO header | 2x10 2.54mm | THT | 1 | 0,50 | 0,50 |
| | **Subtotal** | | | | | **€2,00** |

### 3.8 Indikatori

| ID | Komponenta | Boja | Kućište | Kom | Jed. € | Ukupno € |
|----|------------|------|---------|-----|--------|----------|
| D1 | LED napajanja | Zelena | 0603 | 1 | 0,10 | 0,10 |
| D2 | LED statusa | Plava | 0603 | 1 | 0,10 | 0,10 |
| D3 | CAN TX LED | Žuta | 0603 | 1 | 0,10 | 0,10 |
| D4 | CAN RX LED | Narandžasta | 0603 | 1 | 0,10 | 0,10 |
| D5 | LED greške | Crvena | 0603 | 1 | 0,10 | 0,10 |
| R15-R19 | Otpornici za LED | 1kΩ | 0603 | 5 | 0,02 | 0,10 |
| | **Subtotal** | | | | | **€0,60** |

### 3.9 ESD zaštita

| ID | Komponenta | Part Number | Kućište | Kom | Jed. € | Ukupno € |
|----|------------|-------------|---------|-----|--------|----------|
| D6 | USB ESD | USBLC6-2SC6 | SOT-23-6 | 1 | 0,40 | 0,40 |
| D7-D8 | CAN ESD | PESD1CAN | SOD-323 | 2 | 0,30 | 0,60 |
| | **Subtotal** | | | | | **€1,00** |

### 3.10 Izrada PCB-a

| ID | Komponenta | Specifikacija | Kom | Jed. € | Ukupno € |
|----|------------|---------------|-----|--------|----------|
| PCB01 | 4-slojni PCB | 80×60mm, 1.6mm, ENIG | 5 | 3,00 | 15,00 |
| | **Subtotal** | | | | **€15,00** |

### 3.11 Pregled diskretnih komponenti

| Kategorija | Ukupno € |
|------------|----------|
| MCU i jezgro | 9,80 |
| Napajanje | 2,10 |
| CAN-FD interfejs | 5,70 |
| Debug i programiranje | 2,10 |
| Memorija (opciono) | 5,50 |
| Pasivne komponente | 1,40 |
| Konektori | 2,00 |
| Indikatori | 0,60 |
| ESD zaštita | 1,00 |
| PCB (5 kom) | 15,00 |
| **UKUPNO (po ploči)** | **~€45,20** |
| **UKUPNO (5 ploča)** | **~€165,00** |

---

## 4. Softverski alati

Sav potreban softver je besplatan/open source:

| Alat | Namena | Licenca | Preuzimanje |
|------|--------|---------|-------------|
| ARM GCC Toolchain | Kompajler (arm-none-eabi-gcc) | GPL | developer.arm.com |
| OpenOCD | Debuger/flešer | GPL | openocd.org |
| STM32CubeIDE | ST razvojno okruženje | Besplatno | st.com |
| STM32CubeMX | Konfiguracija pinova/takta | Besplatno | st.com |
| VS Code + Cortex-Debug | Alternativno okruženje | MIT | code.visualstudio.com |
| PulseView/sigrok | Softver za logički analizator | GPL | sigrok.org |
| PCAN-View | CAN-FD monitor magistrale | Besplatno* | peak-system.com |

*Besplatno uz PEAK hardver

---

## 5. Preporučene faze nabavke

### Faza 1: Minimalni početak (~€75)

Početak razvoja JEZGRO kernela:

| Stavka | € |
|--------|---|
| NUCLEO-G474RE × 2 | 48,00 |
| ST-LINK V3MINIE | 12,00 |
| USB-UART × 2 | 6,00 |
| Žice + breadboard | 9,00 |
| **Ukupno** | **€75,00** |

**Omogućava:** Razvoj jezgra kernela, MPU izolacija, raspoređivač, IPC

### Faza 2: CAN-FD testiranje (+€115)

Testiranje višečvornog roja:

| Stavka | € |
|--------|---|
| Logički analizator 24MHz | 15,00 |
| SN65HVD230 breakout × 3 | 12,00 |
| Canable Pro CAN-FD USB | 80,00 |
| Kablovi i konektori | 8,00 |
| **Ukupno** | **€115,00** |

**Omogućava:** CAN-FD IPC gateway, testiranje koordinacije roja

### Faza 3: Prilagođeni prototip (~€165)

Izrada namenske JEZGRO ploče:

| Stavka | € |
|--------|---|
| Diskretne komponente (5 ploča) | 150,00 |
| Izrada PCB-a (5 kom) | 15,00 |
| **Ukupno** | **€165,00** |

**Omogućava:** Testiranje reprezentativno za proizvodnju, termalna validacija

### Faza 4: Profesionalni alati (+€670)

Za napredni debugging:

| Stavka | € |
|--------|---|
| PEAK PCAN-USB FD | 320,00 |
| Saleae Logic 8 | 350,00 |
| **Ukupno** | **€670,00** |

**Omogućava:** Analiza protokola, sertifikacija tajminga, testiranje usklađenosti

---

## 6. Ukupna investicija - pregled

| Konfiguracija | Ukupno € | Opis |
|---------------|----------|------|
| **Minimalna** | ~€75 | 2× NUCLEO + debuger |
| **Standardna** | ~€355 | + CAN-FD + logički analizator + prototip |
| **Profesionalna** | ~€1.025 | + PEAK + Saleae |
| **Kompletna laboratorija** | ~€2.400 | + lab. napajanje + J-Trace + rezerve |

---

## 7. Preporučeni dobavljači

| Tip komponente | Preporučeni dobavljač | Napomene |
|----------------|----------------------|----------|
| STM32 MCU | Mouser, DigiKey, Farnell | Ovlašćeni distributeri |
| NUCLEO ploče | ST eStore, Mouser | Često na popustu |
| CAN primopredajnici | Mouser, DigiKey | TJA1443 od NXP |
| Pasivne komponente | LCSC, Mouser | LCSC za veće količine |
| Izrada PCB-a | JLCPCB, PCBWay | JLCPCB najjeftiniji |
| Konektori | LCSC, AliExpress | Ekonomična opcija |
| Test oprema | Amazon, AliExpress | Logički analizatori |
| Profesionalni alati | Direktno (PEAK, Saleae, Segger) | Garancijska podrška |

---

## 8. Referentni dokumenti

| Dokument | Opis |
|----------|------|
| `16-jezgro.md` | JEZGRO RTOS specifikacija |
| `04-bom-cost.md` | Proizvodna BOM lista EK3 modula |
| `SPECIFICATIONS.md` | Glavna specifikacija EK3 |
| `14-firmware-architecture.md` | Arhitektura firmware-a (FreeRTOS osnova) |

---

## Istorija izmena

| Datum | Verzija | Opis |
|-------|---------|------|
| 2026-01-04 | 1.0 | Inicijalna verzija |
