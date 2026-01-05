# JEZGRO hardverske platforme

**Verzija:** 1.0
**Datum:** 2026-01-04
**Status:** SPECIFIKACIJA

---

## Namena dokumenta

Ovaj dokument specificira **hardverske platforme** za porodicu proizvoda JEZGRO mikrokernela. Konvergencijom na zajedničke MCU familije, PCB dizajne i komponente, ELEKTROKOMBINACIJA postiže efikasnost lanca snabdevanja, pojednostavljenu proizvodnju i konzistentne firmverske interfejse kroz sve varijante.

---

## 1. Pregled

### 1.1 Strategija platforme

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STRATEGIJA JEZGRO HARDVERSKE PLATFORME                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    DVE MCU FAMILIJE                                  │   │
│   │                                                                      │   │
│   │   ┌─────────────────────┐    ┌─────────────────────┐               │   │
│   │   │    STM32G474        │    │    STM32H743        │               │   │
│   │   │    (Cortex-M4)      │    │    (Cortex-M7)      │               │   │
│   │   │                     │    │                     │               │   │
│   │   │  • 170 MHz          │    │  • 480 MHz          │               │   │
│   │   │  • 512 KB Flash     │    │  • 2 MB Flash       │               │   │
│   │   │  • 128 KB RAM       │    │  • 1 MB RAM         │               │   │
│   │   │  • ~8$              │    │  • ~15$             │               │   │
│   │   │                     │    │                     │               │   │
│   │   │  Koristi:           │    │  Koristi:           │               │   │
│   │   │  • JEZGRO-EK3       │    │  • JEZGRO-ROB       │               │   │
│   │   │  • JEZGRO-RACK      │    │  • JEZGRO-GW        │               │   │
│   │   │  • JEZGRO-BAT       │    │  • EK-ADAPT-*       │               │   │
│   │   │  • EK-ADAPT-BUS     │    │                     │               │   │
│   │   │  • EK-ADAPT-OCPP    │    │                     │               │   │
│   │   └─────────────────────┘    └─────────────────────┘               │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    TRI PCB FORM FAKTORA                              │   │
│   │                                                                      │   │
│   │   ┌───────────┐   ┌───────────┐   ┌───────────┐                    │   │
│   │   │  EK-PCB-S │   │  EK-PCB-M │   │  EK-PCB-L │                    │   │
│   │   │  50×80mm  │   │  80×100mm │   │  100×160mm│                    │   │
│   │   │  4-sloja  │   │  4-sloja  │   │  6-slojeva│                    │   │
│   │   │           │   │           │   │           │                    │   │
│   │   │ • EK3     │   │ • Rek     │   │ • Robot   │                    │   │
│   │   │ • Baterija│   │ • Adapteri│   │ • Kapija  │                    │   │
│   │   └───────────┘   └───────────┘   └───────────┘                    │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Matrica izbora MCU

| JEZGRO varijanta | MCU | Razlog | Ključni zahtevi |
|------------------|-----|--------|-----------------|
| **JEZGRO-EK3** | STM32G474 | HRTIM za LLC, CORDIC | 65 kHz prekidanje, 128 KB RAM |
| **JEZGRO-RACK** | STM32G474 | CAN-FD × 3, PWM | Upravljanje ventilatorima, slotovi |
| **JEZGRO-BAT** | STM32G474 | ADC za monitoring ćelija | 16-ćelijski AFE interfejs |
| **JEZGRO-ROB** | STM32H743 | Dvostruki FPU, više RAM | Trajektorija, kinematika |
| **JEZGRO-GW** | STM32H743 | Ethernet, 1 MB RAM | ISO 15118, TLS baferi |

### 1.3 NE koristi JEZGRO (Namesnki hardver)

| Komponenta | MCU/DSP | Razlog |
|------------|---------|--------|
| **Centralni PFC** | TMS320F28379D | DSP za PLL, visoka rezolucija PWM (150 ps) |
| **Sigurnosni MCU** | AURIX TC3xx | ASIL-D lockstep, hardverska sigurnost |
| **Kontroler stanice** | Linux SBC (RPi CM4) | Pun OS za OCPP server, HMI |

---

## 2. STM32G474 platforma

### 2.1 Specifikacije MCU

| Parametar | Vrednost | Napomene |
|-----------|----------|----------|
| **Jezgro** | ARM Cortex-M4F | 170 MHz, jednostruka preciznost FPU |
| **Flash** | 512 KB | Dupla banka, ECC |
| **RAM** | 128 KB | SRAM1 + SRAM2 |
| **HRTIM** | 217 ps rezolucija | Za LLC rezonantno upravljanje |
| **ADC** | 5 × 12-bit, 4 MSPS | Simultano uzorkovanje |
| **CAN-FD** | 3 × FDCAN | 5 Mbps brzina podataka |
| **CORDIC** | Hardverska trigonometrija | sin/cos za 6 ciklusa |
| **FMAC** | Akcelerator filtera | IIR/FIR filteri |
| **DAC** | 4 × 12-bit | Reference komparatora |
| **Komparatori** | 7 × analogni | Hardverska detekcija grešaka |
| **Temp opseg** | -40°C do +125°C | Industrijski stepen |
| **Pakovanje** | LQFP100 / LQFP64 | 100-pin preferiran |
| **Cena** | ~8$ (qty 1000) | Volumenska cena |

### 2.2 Mapa memorije (JEZGRO na G474)

```
┌─────────────────────────────────────────────────┐  0x2001FFFF (128 KB)
│                                                 │
│        AUDIT_LOGGER (16 KB)                     │
│        Kružni bafer, red za flash commit        │
├─────────────────────────────────────────────────┤  0x2001C000
│        ROJ_COORD (16 KB)                      │
│        Koordinacija više modula                 │
├─────────────────────────────────────────────────┤  0x20018000
│        SERVISNO-SPECIFIČNO (8-16 KB)            │
│        Thermal, CAN, Safety, itd.               │
├─────────────────────────────────────────────────┤  0x20014000
│        LLC_CONTROL / APLIKACIJA (16 KB)         │
│        Upravljačka petlja, mašina stanja        │
├─────────────────────────────────────────────────┤  0x20010000
│        IPC BAFER PORUKA (32 KB)                 │
│        512 poruka × 64 bajta                    │
├─────────────────────────────────────────────────┤  0x20008000
│        KERNEL PROSTOR (8 KB)                    │
│        Raspoređivač, MPU, ISR vektori           │
├─────────────────────────────────────────────────┤  0x20006000
│        ŠTITOVI STEKOVA (8 KB)                   │
│        MPU-zaštićene regije                     │
├─────────────────────────────────────────────────┤  0x20004000
│        STEKOVI (16 KB)                          │
│        Stekovi po servisu (1-2 KB svaki)        │
└─────────────────────────────────────────────────┘  0x20000000
```

### 2.3 Dodela periferija (JEZGRO-EK3)

| Periferija | Funkcija | Napomene |
|------------|----------|----------|
| **HRTIM** | LLC PWM | 65-500 kHz, sinhrono ispravljanje |
| **TIM1** | Pomoćni PWM | Meki start, ventilator |
| **ADC1** | Merenje napona | Vin, Vout, Vbus |
| **ADC2** | Merenje struje | Iin, Iout |
| **ADC3** | Temperatura | NTC × 4 |
| **FDCAN1** | EK interni CAN | Modul ↔ Rek |
| **FDCAN2** | Eksterni CAN | Kontroler stanice |
| **DAC1-2** | Pragovi grešaka | OCP, OVP reference |
| **COMP1-4** | Hardverska zaštita | <50 ns trip |
| **USART1** | Debug konzola | 115200 baud |
| **SPI1** | Eksterni flash | W25Q128 (16 MB) |

### 2.4 Konfiguracija takta

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STM32G474 STABLO TAKTA                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   HSE (8 MHz)                                                                │
│       │                                                                      │
│       ├──► PLL ──► SYSCLK (170 MHz) ──► AHB (170 MHz) ──► APB1/2 (170 MHz)  │
│       │                                                                      │
│       └──► HRTIM takt (170 MHz × 32 = 5.44 GHz efektivno)                   │
│                     └──► 217 ps PWM rezolucija                              │
│                                                                              │
│   LSE (32.768 kHz) ──► RTC, IWDG (rezerva)                                  │
│                                                                              │
│   FDCAN: HSE / 1 = 8 MHz ──► Bit timing za 5 Mbps                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. STM32H743 platforma

### 3.1 Specifikacije MCU

| Parametar | Vrednost | Napomene |
|-----------|----------|----------|
| **Jezgro** | ARM Cortex-M7 | 480 MHz, dvostruka preciznost FPU |
| **Flash** | 2 MB | Dupla banka, ECC |
| **RAM** | 1 MB | D1 (512K) + D2 (288K) + D3 (64K) + ITCM (64K) + DTCM (128K) |
| **Keš** | 16 KB I + 16 KB D | Za performanse |
| **Ethernet** | 10/100 MAC | Sa PHY za OCPP |
| **USB** | USB HS + OTG | Za PLC modem |
| **CAN-FD** | 2 × FDCAN | 5 Mbps brzina podataka |
| **ADC** | 3 × 16-bit | Simultani, 3.6 MSPS |
| **Kripto** | AES, SHA, RNG | Hardverska akceleracija |
| **Temp opseg** | -40°C do +85°C | Industrijski stepen |
| **Pakovanje** | LQFP144 / LQFP176 | 144-pin tipično |
| **Cena** | ~15$ (qty 1000) | Volumenska cena |

### 3.2 Mapa memorije (JEZGRO na H743)

```
┌─────────────────────────────────────────────────┐  0x240FFFFF
│                                                 │
│        D3 DOMEN (64 KB)                         │
│        DMA, BDMA pristupačno                    │
├─────────────────────────────────────────────────┤  0x38010000
│                                                 │
│        D2 DOMEN (288 KB)                        │
│        Ethernet DMA, USB baferi                 │
├─────────────────────────────────────────────────┤  0x30048000
│                                                 │
│        D1 DOMEN (512 KB)                        │
│        Glavna aplikaciona memorija              │
│        ┌─────────────────────────────────────┐  │
│        │ ISO15118 servis (128 KB)            │  │
│        ├─────────────────────────────────────┤  │
│        │ OCPP_CLIENT (64 KB)                 │  │
│        ├─────────────────────────────────────┤  │
│        │ Protokol servisi (64 KB)            │  │
│        ├─────────────────────────────────────┤  │
│        │ Control servisi (64 KB)             │  │
│        ├─────────────────────────────────────┤  │
│        │ IPC bafer poruka (64 KB)            │  │
│        ├─────────────────────────────────────┤  │
│        │ TLS baferi (64 KB)                  │  │
│        ├─────────────────────────────────────┤  │
│        │ Kernel + stekovi (64 KB)            │  │
│        └─────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤  0x24000000
│                                                 │
│        DTCM (128 KB) - Nula čekanja             │
│        Kritične kontrolne promenljive           │
├─────────────────────────────────────────────────┤  0x20000000
│                                                 │
│        ITCM (64 KB) - Nula čekanja              │
│        Kritični ISR kod                         │
└─────────────────────────────────────────────────┘  0x00000000
```

### 3.3 Dodela periferija (JEZGRO-GW)

| Periferija | Funkcija | Napomene |
|------------|----------|----------|
| **ETH** | OCPP, ISO 15118-20 | LAN8742A PHY |
| **USB HS** | PLC modem | HomePlug Green PHY |
| **FDCAN1** | EK interni CAN | Magistrala stanice |
| **FDCAN2** | CAN vozila | Za adaptere |
| **TIM1** | Takt upravljanja | 10 kHz petlja |
| **ADC1-2** | Merenje mreže | Va, Vb, Vc, Ia, Ib, Ic |
| **DAC1** | Analogni izlaz | Test signali |
| **CRYP** | TLS akceleracija | AES-128/256 |
| **HASH** | SHA-256 | Validacija sertifikata |
| **SPI1** | Eksterni flash | W25Q128 (16 MB) |
| **USART1** | Debug konzola | 115200 baud |

### 3.4 Dodela periferija (JEZGRO-ROB)

| Periferija | Funkcija | Napomene |
|------------|----------|----------|
| **TIM1-2** | Servo PWM | 6 osa × 2 (Robot A+B) |
| **TIM3-4** | Enkoder interfejs | Kvadraturni × 6 |
| **ADC1-2** | Struja motora | Merenje po osi |
| **ADC3** | Sila/moment | Ćelije opterećenja |
| **SPI1** | IMU interfejs | ICM-42688-P |
| **SPI2** | Vizijski senzor | Kamera niske rezolucije |
| **FDCAN1** | Magistrala Robota A | Interne ose |
| **FDCAN2** | Magistrala Robota B | Interne ose |
| **USART1** | CAN stanice | Preko izolatora |
| **I2C1** | EEPROM, RTC | Konfiguracija |

---

## 4. PCB form faktori

### 4.1 EK-PCB-S (50×80mm)

**Primene:** JEZGRO-EK3, JEZGRO-BAT

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EK-PCB-S (50×80mm)                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────┐          │
│   │                                                              │          │
│   │    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐     │ 50mm     │
│   │    │ MCU    │    │ Napaj. │    │ CAN    │    │ Debug  │     │          │
│   │    │G474    │    │ Reg    │    │ Trans  │    │ Header │     │          │
│   │    └────────┘    └────────┘    └────────┘    └────────┘     │          │
│   │                                                              │          │
│   │    ┌────────────────────────────────────────────────┐       │          │
│   │    │              Aplikaciono-specifično            │       │          │
│   │    │       (Gate drajveri, AFE, senzori)           │       │          │
│   │    └────────────────────────────────────────────────┘       │          │
│   │                                                              │          │
│   │    [===] [===] [===] [===]  ← Konektori (donja ivica)       │          │
│   │    Nap   CAN   Ctrl  Aux                                     │          │
│   └──────────────────────────────────────────────────────────────┘          │
│                                                                              │
│                              80mm                                            │
│                                                                              │
│   Slaganje slojeva (4-sloja):                                               │
│   L1: Signal (MCU, brze veze)                                               │
│   L2: GND ravan                                                             │
│   L3: Ravan napajanja (3.3V, 5V)                                            │
│   L4: Signal (konektori, analog)                                            │
│                                                                              │
│   Debljina: 1.6 mm                                                          │
│   Bakar: 1 oz (35 µm)                                                       │
│   Završna obrada: ENIG                                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 EK-PCB-M (80×100mm)

**Primene:** JEZGRO-RACK, EK-ADAPT-BUS, EK-ADAPT-OCPP

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EK-PCB-M (80×100mm)                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌───────────────────────────────────────────────────────────────────┐     │
│   │                                                                   │     │
│   │    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────────┐      │ 80mm│
│   │    │ MCU    │    │ Ethernet│   │ CAN ×2 │    │ Celular    │      │     │
│   │    │G474/H743│   │ PHY    │    │ Trans  │    │ (opciono)  │      │     │
│   │    └────────┘    └────────┘    └────────┘    └────────────┘      │     │
│   │                                                                   │     │
│   │    ┌────────┐    ┌────────┐    ┌────────────────────────┐        │     │
│   │    │ Napaj. │    │ Flash  │    │     Oblast primene     │        │     │
│   │    │ Izvor  │    │ 16MB   │    │   (RS485, Modbus, itd) │        │     │
│   │    └────────┘    └────────┘    └────────────────────────┘        │     │
│   │                                                                   │     │
│   │    ┌────────────────────────────────────────────────────┐        │     │
│   │    │              Red konektora (M12, Phoenix)          │        │     │
│   │    └────────────────────────────────────────────────────┘        │     │
│   └───────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│                                 100mm                                        │
│                                                                              │
│   Slaganje slojeva (4-sloja):                                               │
│   L1: Signal (MCU, Ethernet)                                                │
│   L2: GND ravan                                                             │
│   L3: Ravan napajanja                                                       │
│   L4: Signal (konektori)                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 EK-PCB-L (100×160mm)

**Primene:** JEZGRO-ROB, JEZGRO-GW, EK-ADAPT-V2G, EK-ADAPT-CCS, EK-ADAPT-MCS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EK-PCB-L (100×160mm)                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │                                                                    │    │
│   │    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────────────┐   │100mm
│   │    │ MCU    │    │ Ethernet│   │  USB   │    │ PLC modem      │   │    │
│   │    │ H743   │    │ PHY    │    │  PHY   │    │ (HomePlug)     │   │    │
│   │    │ 144pin │    │        │    │        │    │                │   │    │
│   │    └────────┘    └────────┘    └────────┘    └────────────────┘   │    │
│   │                                                                    │    │
│   │    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────────────┐   │    │
│   │    │ Napaj. │    │ Flash  │    │ CAN ×2 │    │ Izolovani      │   │    │
│   │    │ Izvor  │    │ 16MB   │    │ Trans  │    │ DC/DC          │   │    │
│   │    └────────┘    └────────┘    └────────┘    └────────────────┘   │    │
│   │                                                                    │    │
│   │    ┌────────────────────────────────────────────────────────┐     │    │
│   │    │              Aplikaciono-specifična oblast              │     │    │
│   │    │   (Drajveri motora, ADC interfejs, upravljanje relejima)│     │    │
│   │    └────────────────────────────────────────────────────────┘     │    │
│   │                                                                    │    │
│   │    ┌────────────────────────────────────────────────────────┐     │    │
│   │    │        Izolaciona barijera (3mm razmak)                │     │    │
│   │    └────────────────────────────────────────────────────────┘     │    │
│   │                                                                    │    │
│   │    ┌────────────────────────────────────────────────────────┐     │    │
│   │    │        Visokonaponski interfejs (izolovan)             │     │    │
│   │    └────────────────────────────────────────────────────────┘     │    │
│   │                                                                    │    │
│   │    [Konektori: M12, Deutsch, Phoenix, RJ45]                       │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│                                 160mm                                        │
│                                                                              │
│   Slaganje slojeva (6-slojeva):                                             │
│   L1: Signal (MCU, brze veze)                                               │
│   L2: GND ravan                                                             │
│   L3: Signal (analog, spore veze)                                           │
│   L4: Ravan napajanja (3.3V, 5V, 15V)                                       │
│   L5: GND ravan                                                             │
│   L6: Signal (konektori, napajanje)                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Zajedničke komponente

### 5.1 Lista materijala (Zajedničko jezgro)

| Kategorija | Komponenta | Oznaka | Kol | Cena (1k) | Koristi |
|------------|------------|--------|-----|-----------|---------|
| **MCU** | STM32G474VET6 | STM32G474VET6 | 1 | 8.00$ | EK3, RACK, BAT |
| **MCU** | STM32H743VIT6 | STM32H743VIT6 | 1 | 15.00$ | ROB, GW, ADAPT |
| **Flash** | 16 MB SPI NOR | W25Q128JVSIQ | 1 | 1.50$ | Svi |
| **CAN Trans** | CAN-FD | TJA1443ATK | 2 | 1.20$ | Svi |
| **Ethernet PHY** | 10/100 | LAN8742A-CZ | 1 | 2.00$ | Samo H743 |
| **LDO 3.3V** | 500 mA | AMS1117-3.3 | 1 | 0.15$ | Svi |
| **LDO 5V** | 1 A | LM1117-5.0 | 1 | 0.20$ | Svi |
| **Kristal** | 8 MHz | ABM8-8.000MHZ | 1 | 0.30$ | Svi |
| **Kristal** | 32.768 kHz | ABS07-32.768KHZ | 1 | 0.25$ | Svi |
| **ESD zaštita** | TVS niz | TPD4E05U06 | 2 | 0.40$ | Svi |
| **Ferit** | EMI filter | BLM18PG121SN1 | 10 | 0.05$ | Svi |

### 5.2 Sekcija napajanja

| Komponenta | Oznaka | Specifikacija | Cena |
|------------|--------|---------------|------|
| **DC/DC 24V→5V** | TPS54531 | 5A, 96% efikasnost | 1.50$ |
| **DC/DC 24V→3.3V** | TPS62175 | 500mA | 1.00$ |
| **DC/DC 24V→15V (izo)** | SN6505B + transformator | 1W | 3.00$ |
| **DC/DC 24V→-15V (izo)** | SN6505B + transformator | 1W | 3.00$ |
| **Ulazna zaštita** | TVS + Osigurač | 36V clamp | 0.50$ |

### 5.3 Komunikacioni interfejsi

| Interfejs | Komponente | Napomene |
|-----------|------------|----------|
| **CAN-FD** | TJA1443 + TVS | 5 Mbps, ±58V fault |
| **Ethernet** | LAN8742A + magnetics | 10/100 Mbps |
| **USB HS** | USB3320C + ESD | 480 Mbps |
| **RS485** | MAX3485 | Za OCPP most |
| **SPI Flash** | W25Q128JV | 133 MHz, 16 MB |

---

## 6. Standardi konektora

### 6.1 Izbor konektora

| Interfejs | Konektor | IP stepen | Napomene |
|-----------|----------|-----------|----------|
| **Ulaz napajanja** | Phoenix MC 4-pin | IP20 | 9-36V DC, 5A |
| **CAN-FD (EK)** | Deutsch DT04-4P | IP67 | CANL, CANH, GND, VCC |
| **CAN (eksterni)** | M12 5-pin A-kodiran | IP67 | Industrijski standard |
| **Ethernet** | M12 D-kodiran | IP67 | Industrijski |
| **Ethernet (unutra)** | RJ45 oklopljen | IP20 | Standardni |
| **USB** | USB-C | IP20 | Debug/održavanje |
| **Debug** | 2×5 0.05" header | - | SWD + UART |

### 6.2 Raspored pinova

**CAN-FD (Deutsch DT04-4P):**
| Pin | Signal | Boja |
|-----|--------|------|
| 1 | CAN_H | Žuta |
| 2 | CAN_L | Zelena |
| 3 | GND | Crna |
| 4 | VCC (opciono) | Crvena |

**Debug Header (2×5 0.05"):**
| Pin | Signal |
|-----|--------|
| 1 | VCC (3.3V) |
| 2 | SWDIO |
| 3 | GND |
| 4 | SWCLK |
| 5 | GND |
| 6 | SWO |
| 7 | NC |
| 8 | TX (UART) |
| 9 | GND |
| 10 | RX (UART) |

---

## 7. Debug i programiranje

### 7.1 Debug interfejsi

| Metoda | Konektor | Alat | Brzina |
|--------|----------|------|--------|
| **SWD** | 2×5 header | ST-Link V3 | 24 MHz |
| **JTAG** | 2×10 header | J-Link | 50 MHz |
| **UART** | Na debug header | Bilo koji USB-UART | 115200 |
| **RTT** | Preko SWD | J-Link RTT | Real-time |

### 7.2 Produkciono programiranje

| Faza | Metoda | Napomene |
|------|--------|----------|
| **Fabrika** | Gang programator | Programiraj 10 ploča istovremeno |
| **Test** | SWD preko test fixture | Funkcionalni test + kalibracija |
| **Terensko ažuriranje** | CAN bootloader | JEZGRO OTA mogućnost |
| **Oporavak** | SWD preko USB | Debug port uvek dostupan |

### 7.3 Bootloader

```c
// JEZGRO bootloader mapa memorije
// Lociran u prvih 32 KB flash-a

#define BOOTLOADER_START    0x08000000
#define BOOTLOADER_SIZE     0x8000      // 32 KB
#define APPLICATION_START   0x08008000
#define APPLICATION_SIZE    0x78000     // 480 KB (G474)

typedef struct {
    uint32_t magic;         // 0x4A455A47 ("JEZG")
    uint32_t version;       // Semantička verzija
    uint32_t size;          // Veličina aplikacije
    uint32_t crc32;         // CRC32 aplikacije
    uint32_t entry_point;   // Reset vektor
} jezgro_app_header_t;
```

---

## 8. Varijantno-specifičan hardver

### 8.1 JEZGRO-EK3 (Modul punjenja)

| Komponenta | Oznaka | Funkcija |
|------------|--------|----------|
| **Gate drajver** | UCC21520 | Izolovan, 4A |
| **Senzor struje** | ACS730KLCTR-20AB | Hall, 20A |
| **Senzor napona** | Delitelj + AMC1311 | Izolovan |
| **NTC interfejs** | 10k pull-up × 4 | Temperatura |
| **LLC transformator** | Custom E32 | 650V:450V |

### 8.2 JEZGRO-BAT (Baterijski BMS)

| Komponenta | Oznaka | Funkcija |
|------------|--------|----------|
| **AFE** | BQ76952 | 16-ćelija, balansiranje |
| **isoSPI** | LTC6820 | Daisy-chain |
| **Senzor struje** | Shunt + INA240 | ±200A |
| **Pred-punjenje** | Relej + otpornik | Meki start |
| **Monitor osigurača** | Delitelj napona | Status osigurača |

### 8.3 JEZGRO-ROB (Kontroler robota)

| Komponenta | Oznaka | Funkcija |
|------------|--------|----------|
| **Drajver motora** | DRV8302 × 6 | BLDC, 60V/30A |
| **Enkoder interfejs** | On-chip (TIM) | Kvadraturni × 6 |
| **IMU** | ICM-42688-P | 6-osni, 32 kHz |
| **ADC senzora sile** | ADS131M08 | 8-kan, 24-bit |
| **E-stop relej** | Sigurnosni relej | SIL3 sposoban |

### 8.4 JEZGRO-GW (Kapija)

| Komponenta | Oznaka | Funkcija |
|------------|--------|----------|
| **PLC modem** | QCA7005 | HomePlug Green PHY |
| **Ethernet svič** | KSZ8795 | 5-port (opciono) |
| **Drajver kontaktora** | ULN2003A | 7-kan, 500mA |
| **Pilot kolo** | Komparator + PWM | IEC 61851 |
| **Izolacija** | ISO7741 × 2 | Digitalni izolator |

---

## 9. Testiranje i validacija

### 9.1 Hardverske test tačke

| Test tačka | Signal | Namena |
|------------|--------|--------|
| TP1 | VCC_3V3 | Napajanje |
| TP2 | VCC_5V | Napajanje |
| TP3 | CAN_H | CAN bus debug |
| TP4 | CAN_L | CAN bus debug |
| TP5 | GND | Referenca uzemljenja |
| TP6 | MCU_CLK | Verifikacija takta |
| TP7-10 | App-specifično | Po varijanti |

### 9.2 Sekvenca produkcionog testa

| Korak | Test | Kriterijum prolaska |
|-------|------|---------------------|
| 1 | Uključenje | 3.3V ±5%, 5V ±5% |
| 2 | Provera kristala | 8 MHz ±50 ppm |
| 3 | Flash ID | W25Q128 detektovan |
| 4 | CAN loopback | Tx/Rx poklapanje |
| 5 | Program firmvera | CRC32 validan |
| 6 | Samotestiranje | Svi servisi startuju |
| 7 | Kalibracija | ADC kal po jedinici |

### 9.3 EMC zahtevi

| Test | Standard | Zahtev |
|------|----------|--------|
| ESD | IEC 61000-4-2 | ±8 kV kontakt, ±15 kV vazduh |
| Zračena imunost | IEC 61000-4-3 | 10 V/m, 80-2000 MHz |
| Sprovedena imunost | IEC 61000-4-6 | 10 V, 150 kHz-80 MHz |
| Prenaponi | IEC 61000-4-5 | ±2 kV zajedničko, ±1 kV dif |
| Zračene emisije | CISPR 32 | Klasa B |

---

## 10. Unakrsne reference

| Dokument | Veza |
|----------|------|
| `tehnika/inzenjersko/sr/21-jezgro-product-family.md` | Pregled porodice proizvoda |
| `tehnika/inzenjersko/sr/16-jezgro.md` | JEZGRO kernel specifikacija |
| `tehnika/inzenjersko/sr/komponente/kontrolna-elektronika.md` | Kontrolna elektronika |
| `tehnika/inzenjersko/sr/SPECIFICATIONS.md` | Master specifikacije |

---

## Istorija promena

| Datum | Verzija | Opis |
|-------|---------|------|
| 2026-01-04 | 1.0 | Inicijalna specifikacija hardverskih platformi |
