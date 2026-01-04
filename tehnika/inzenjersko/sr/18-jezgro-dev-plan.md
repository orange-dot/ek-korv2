# JEZGRO Plan razvoja

## Informacije o dokumentu

| Polje | Vrednost |
|-------|----------|
| ID dokumenta | EK-TECH-019 |
| Verzija | 1.0 |
| Datum | 2026-01-04 |
| Status | Aktivan |
| Povezano | 16-jezgro.md, 17-jezgro-dev-bom.md |

---

## 1. Preporučeni početak (~€290)

**Počni sa 10 NUCLEO ploča - omogućava kompletan razvoj roja od prvog dana.**

### 1.1 Hardver

| Stavka | Part Number | Kom | Jed. € | Ukupno € |
|--------|-------------|-----|--------|----------|
| NUCLEO-G474RE | NUCLEO-G474RE | 10 | 24 | 240 |
| USB kablovi | Micro-B | 10 | 3 | 30 |
| USB hub | 10-portni sa napajanjem | 1 | 20 | 20 |
| **UKUPNO** | | | | **€290** |

**Zašto 10 ploča?**
- Kompletno testiranje roja (izbor lidera, konsenzus, tolerancija grešaka)
- Paralelni razvoj (više članova tima)
- Rezervne ploče za eksperimente
- Samo €240 više od jedne ploče - trivijalno za projekat ovog obima

### 1.2 Šta NUCLEO-G474RE pruža

| Karakteristika | Specifikacija |
|----------------|---------------|
| MCU | STM32G474RET6 (Cortex-M4 @ 170MHz) |
| RAM | 128 KB (dovoljno za sve JEZGRO servise) |
| Flash | 512 KB |
| MPU | 8 regiona (ključno za izolaciju grešaka) |
| Debuger | Integrisani ST-LINK/V2-1 |
| Napajanje | Preko USB-a |
| Korisnički I/O | 1 LED, 1 taster |

### 1.3 Softver (besplatno)

**Primarni toolchain:**

| Alat | Namena | Preuzimanje |
|------|--------|-------------|
| VS Code | Editor/IDE | code.visualstudio.com |
| ARM GCC | Kompajler (arm-none-eabi-gcc) | developer.arm.com |
| OpenOCD | Debuger/flešer | openocd.org |
| Cortex-Debug | VS Code debug ekstenzija | VS Code marketplace |

**Alternativa (sve-u-jednom):**
- STM32CubeIDE - uključuje sve ali je teži

### 1.4 Šta možeš razvijati

Sa 10 NUCLEO ploča - **sve od prvog dana:**

| Komponenta | Status |
|------------|--------|
| Jezgro kernela | Potpuni razvoj |
| EDF raspoređivač | Potpuni razvoj |
| MPU menadžer | Potpuni razvoj |
| Prebacivanje konteksta | Potpuni razvoj |
| IPC prosleđivanje poruka | Potpuni razvoj |
| Server za reinkarnaciju | Potpuni razvoj |
| Watchdog sistem | Potpuni razvoj |
| Svi korisnički servisi | Potpuni razvoj |
| CAN-FD komunikacija | Potpuni razvoj |
| Koordinacija roja | **Potpuni razvoj (10 čvorova!)** |
| Izbor lidera | Potpuni razvoj |
| Tolerancija grešaka | Potpuni razvoj |

---

## 2. Faze razvoja

### Faza 1: Jezgro kernela (~€27)

**Hardver:** 1× NUCLEO-G474RE

**Ciljevi:**
- [ ] Sekvenca pokretanja i konfiguracija takta
- [ ] Implementacija EDF raspoređivača
- [ ] Prebacivanje konteksta sa MPU rekonfiguracijom
- [ ] Osnovno kreiranje i upravljanje taskovima
- [ ] Kernel tick tajmer (SysTick)

### Faza 2: Izolacija grešaka (~€27)

**Hardver:** Isto kao Faza 1

**Ciljevi:**
- [ ] Konfiguracija MPU regiona
- [ ] MemManage handler za greške
- [ ] Detekcija prekoračenja steka
- [ ] Izolacija memorije servisa
- [ ] Razdvajanje nivoa privilegija

**Metod testiranja:** Namerno izazvati greške, verifikovati izolaciju

### Faza 3: IPC sistem (~€27)

**Hardver:** Isto kao Faza 1

**Ciljevi:**
- [ ] Alokacija pool-a poruka (bez zaključavanja)
- [ ] Sinhrono slanje/primanje
- [ ] Asinhrono prosleđivanje poruka
- [ ] Mehanizam emitovanja
- [ ] Poštanski sandučići servisa

**Metod testiranja:** Benchmarkovi međuservisne komunikacije

### Faza 4: Server za reinkarnaciju (~€27)

**Hardver:** Isto kao Faza 1

**Ciljevi:**
- [ ] Watchdog monitoring po servisu
- [ ] Automatska detekcija grešaka
- [ ] Restart servisa bez reseta sistema
- [ ] Hook-ovi za očuvanje stanja
- [ ] Eksponencijalno odlaganje za ponovljene greške

**Metod testiranja:** Ubiti servise, meriti vreme restarta (<50ms cilj)

### Faza 5: CAN-FD integracija (~€60)

**Hardver:** 2× NUCLEO-G474RE + 2× CAN primopredajnik

| Stavka | € |
|--------|---|
| 2. NUCLEO-G474RE | 24 |
| SN65HVD230 breakout × 2 | 8 |
| Žice za povezivanje | 5 |
| **Dodatni trošak** | **€37** |

**Ciljevi:**
- [ ] CAN-FD drajver (5 Mbps)
- [ ] Prevođenje CAN ↔ IPC poruka
- [ ] Komunikacija više čvorova
- [ ] Rutiranje poruka

### Faza 6: Testiranje roja (~€115)

**Hardver:** 3× NUCLEO + CAN magistrala + analizator

| Stavka | € |
|--------|---|
| 3. NUCLEO-G474RE | 24 |
| SN65HVD230 breakout (3.) | 4 |
| Logički analizator 24MHz | 15 |
| Canable Pro (PC interfejs) | 80 |
| **Dodatni trošak** | **€123** |

**Ciljevi:**
- [ ] Izbor lidera (inspirisano Raft-om)
- [ ] Heartbeat protokol
- [ ] Distribuirani konsenzus
- [ ] Testiranje tolerancije na greške

### Faza 7: Proizvodni prototip (~€165)

**Hardver:** Prilagođeni PCB sa diskretnim komponentama

Videti `17-jezgro-dev-bom.md` Sekcija 3 za kompletnu BOM listu.

**Ciljevi:**
- [ ] Validacija prilagođenog hardvera
- [ ] Termalno testiranje
- [ ] EMC pred-usklađenost
- [ ] Performanse reprezentativne za proizvodnju

---

## 3. Kumulativna investicija

| Faza | Dodato € | Ukupno € | Hardver |
|------|----------|----------|---------|
| 1-6 | 290 | 290 | 10× NUCLEO + USB hub |
| +CAN | 120 | 410 | + 10× CAN primopredajnik + Canable |
| +Debug | 30 | 440 | + Logički analizator + UART adapteri |
| 7 | 165 | 605 | + Prilagođeni prototip PCB |

**Napomena:** Početak sa 10 ploča eliminiše inkrementalne nabavke hardvera i omogućava paralelne radne tokove.

---

## 4. Razvojne prekretnice

### Prekretnica 1: Boot kernela
- Sistem se podiže do idle taska
- Tick tajmer radi
- Serijski debug izlaz funkcioniše

### Prekretnica 2: MPU izolacija
- Dva taska rade u odvojenim MPU regionima
- Greška u Tasku A ne ruši Task B
- MemManage handler hvata prekršaje

### Prekretnica 3: IPC funkcioniše
- Task A šalje poruku Tasku B
- Task B prima i odgovara
- Verifikovan zero-copy transfer

### Prekretnica 4: Auto-oporavak
- Servis namerno srušen
- Server za reinkarnaciju detektuje grešku
- Servis se restartuje u roku od 50ms
- Stanje sačuvano preko restarta

### Prekretnica 5: Višečvorni CAN
- Dve NUCLEO ploče komuniciraju preko CAN-FD
- Poruke prevedene u interni IPC
- Verifikovana latencija < 1ms

### Prekretnica 6: Roj operativan
- 3+ čvora biraju lidera
- Kvar lidera pokreće ponovni izbor
- Sistem nastavlja da radi

---

## 5. Vodič za brzi početak

### Korak 1: Nabavka hardvera
```
Poruči: 10× NUCLEO-G474RE (~€240, Mouser/DigiKey)
Poruči: 10× USB Micro-B kablovi (~€30)
Poruči: 1× 10-portni USB hub sa napajanjem (~€20)
Ukupno: ~€290, dostava 2-5 dana
```

### Korak 2: Instalacija toolchain-a
```
1. VS Code          → code.visualstudio.com
2. ARM GCC          → developer.arm.com/downloads/-/gnu-rm
3. OpenOCD          → github.com/openocd-org/openocd/releases
4. Cortex-Debug     → VS Code Extensions → "Cortex-Debug"
5. C/C++ Extension  → VS Code Extensions → "C/C++"
```

### Korak 3: Kreiranje projekta
```
mkdir jezgro && cd jezgro
git init
# Kopiraj CMakeLists.txt iz 16-jezgro.md Sekcija 11
# Kopiraj linker skriptu STM32G474RETX_FLASH.ld
# Kopiraj startup fajlove iz STM32CubeG4
```

### Korak 4: Build i Flash
```
mkdir build && cd build
cmake ..
make -j8
make flash   # Koristi OpenOCD + ST-LINK
```

### Korak 5: Početak kodiranja
```
Počni sa: Kernel tick tajmer + osnovni raspoređivač
Referenca: 16-jezgro.md Sekcija 3 (Komponente kernela)
```

---

## 6. Referentni dokumenti

| Dokument | Sadržaj |
|----------|---------|
| 16-jezgro.md | Kompletna RTOS specifikacija |
| 17-jezgro-dev-bom.md | Kompletna BOM lista |
| 14-firmware-architecture.md | FreeRTOS osnova |
| SPECIFICATIONS.md | Hardverske specifikacije EK3 |

---

## Istorija izmena

| Datum | Verzija | Opis |
|-------|---------|------|
| 2026-01-04 | 1.0 | Inicijalna verzija |
