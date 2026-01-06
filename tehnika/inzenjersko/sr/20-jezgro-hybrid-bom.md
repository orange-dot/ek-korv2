# JEZGRO Hibrid BOM - Vodič za nabavku iz Srbije

## Informacije o dokumentu

| Polje | Vrednost |
|-------|----------|
| ID dokumenta | EK-TECH-021 |
| Verzija | 1.0 |
| Datum | 2026-01-04 |
| Status | Aktivan |
| Povezano | 16-jezgro.md, 19-jezgro-dev-alternatives.md |

---

## 1. Pregled

Ovaj dokument sadrži detaljan spisak materijala (BOM) za JEZGRO Hibrid "Ultimate" razvojnu platformu, sa opcijama nabavke za kupce iz Srbije. Hibrid kombinuje:

- **Infineon AURIX TC375/TC397** - ASIL-D bezbednost, hardverski lockstep
- **TI TMS320F280049C (C2000)** - 150 ps PWM rezolucija
- **Espressif ESP32-S3** - WiFi/BT povezivost, OTA ažuriranja

### 1.1 Pregled dobavljača za Srbiju

| Dobavljač | Isporuka u Srbiju | Besplatna dostava | Napomene |
|-----------|-------------------|-------------------|----------|
| [Arrow](https://www.arrow.com/) | Da | Narudžbe >$100 | Najbolje za dev ploče |
| [Mouser](https://eu.mouser.com/) | Da | Narudžbe >€65 | Širok izbor, inače €30 dostava |
| [DigiKey](https://www.digikey.rs/) | Da | Narudžbe >€50 | Brza isporuka, ima .rs sajt |
| [Farnell](https://export.farnell.com/) | Da (preko Tagora) | Proveriti | Lokalni distributer u Nišu |
| [LCSC](https://www.lcsc.com/) | Da | Ne | Najbolje za pasivne komponente |
| [AliExpress](https://www.aliexpress.com/) | Da | Često besplatno | Jeftina opcija, rizik carine >€45 |

### 1.2 Uvozna razmatranja za Srbiju

| Faktor | Detalji |
|--------|---------|
| **Carinski prag** | ~€45-50 (narudžbe iznad mogu imati carinu) |
| **PDV** | 20% na uvezenu robu |
| **DHL/FedEx troškovi** | Dodatnih €10-15 za carinjenje |
| **Preporuka** | Držati pojedinačne narudžbe ispod €45 ILI naručiti >$100 sa Arrow |

---

## 2. Faza 1: Triple-MCU jezgro (~€200)

Početna razvojna konfiguracija sa sve tri MCU porodice.

### 2.1 Razvojne ploče

| Stavka | Broj dela | Kol. | €/kom | Ukupno € | Dobavljač | Link |
|--------|-----------|------|-------|----------|-----------|------|
| AURIX TC375 Lite Kit | KITA2GTC375LITETOBO1 | 2 | 70 | 140 | Arrow/Mouser | [Arrow](https://www.arrow.com/en/products/kita2gtc375litetobo1/infineon-technologies-ag) |
| TI LaunchPad F280049C | LAUNCHXL-F280049C | 1 | 25 | 25 | Mouser/DigiKey | [TI](https://www.ti.com/tool/LAUNCHXL-F280049C) |
| ESP32-S3-DevKitC-1-N8R8 | ESP32-S3-DEVKITC-1-N8R8 | 1 | 10 | 10 | AliExpress/Mouser | [AliExpress](https://www.aliexpress.com/item/1005003979778978.html) |
| **Međuzbir ploče** | | | | **€175** | | |

### 2.2 Povezivanje i kablovi

| Stavka | Broj dela | Kol. | €/kom | Ukupno € | Dobavljač | Link |
|--------|-----------|------|-------|----------|-----------|------|
| USB Micro-B kablovi | Generički | 4 | 2 | 8 | AliExpress | - |
| USB-C kabl | Generički | 2 | 3 | 6 | AliExpress | - |
| Dupont žice komplet | M-M, M-F, F-F | 1 | 5 | 5 | AliExpress | - |
| Mini breadboard 400 tač. | Generički | 2 | 3 | 6 | AliExpress | - |
| **Međuzbir povezivanje** | | | | **€25** | | |

### 2.3 Ukupno Faza 1

| Kategorija | Cena € |
|------------|--------|
| Razvojne ploče | 175 |
| Povezivanje i kablovi | 25 |
| **UKUPNO Faza 1** | **€200** |

---

## 3. Faza 2: Puna integracija (~€350)

Višečvorna CAN-FD mreža sa alatima za debagovanje.

### 3.1 Dodatne razvojne ploče

| Stavka | Broj dela | Kol. | €/kom | Ukupno € | Dobavljač | Link |
|--------|-----------|------|-------|----------|-----------|------|
| TI LaunchPad F280049C | LAUNCHXL-F280049C | 1 | 25 | 25 | Mouser/DigiKey | [TI](https://www.ti.com/tool/LAUNCHXL-F280049C) |

### 3.2 CAN-FD mreža

| Stavka | Broj dela | Kol. | €/kom | Ukupno € | Dobavljač | Link |
|--------|-----------|------|-------|----------|-----------|------|
| CAN-FD primopredajnik IC | TLE9251VSJ | 6 | 1 | 6 | LCSC | [LCSC](https://www.lcsc.com/product-detail/CAN-Transceivers_Infineon-Technologies-TLE9251VSJ_C189937.html) |
| CAN primopredajnik modul | SN65HVD230 breakout | 6 | 4 | 24 | AliExpress | [AliExpress](https://www.aliexpress.com/w/wholesale-sn65hvd230.html) |
| Terminacioni otpornici 120Ω | 1% 0805 | 10 | 0,05 | 0,50 | LCSC | - |
| JST-XH konektori 4-pin | Generički | 10 | 0,30 | 3 | LCSC/AliExpress | - |
| Upleteni kabl 2m | Oklopljeni | 3 | 4 | 12 | Lokalno/Amazon | - |
| **Međuzbir CAN** | | | | **€45,50** | | |

### 3.3 Alati za debagovanje

| Stavka | Broj dela | Kol. | €/kom | Ukupno € | Dobavljač | Link |
|--------|-----------|------|-------|----------|-----------|------|
| CANable 2.0 Pro | CANable V2.0 | 1 | 80 | 80 | [Openlight Labs](https://openlightlabs.com/products/canable-2-0) | Originalni |
| *Alternativa: MKS CANable* | *MKS CANable V2.0* | *1* | *25* | *25* | *AliExpress* | [AliExpress](https://www.aliexpress.com/w/wholesale-canable-2.0.html) |
| Logički analizator 24MHz 8CH | Generički Saleae klon | 1 | 5 | 5 | AliExpress | [AliExpress](https://www.aliexpress.com/item/1005001417581550.html) |
| USB-UART CP2102 | CP2102 modul | 4 | 2 | 8 | AliExpress | - |
| **Međuzbir debag** | | | | **€93** (ili €38 sa klonom) | | |

### 3.4 Ukupno Faza 2

| Kategorija | Cena € | Budžet opcija € |
|------------|--------|-----------------|
| Dodatne ploče | 25 | 25 |
| CAN-FD mreža | 45,50 | 45,50 |
| Alati za debag | 93 | 38 |
| Faza 1 preneseno | 200 | 200 |
| **UKUPNO Faza 2** | **€363,50** | **€308,50** |

---

## 4. Faza 3: Proizvodni sistem (~€550)

Kompletan sistem sa TC397 za validaciju bezbednosti.

### 4.1 Napredni hardver

| Stavka | Broj dela | Kol. | €/kom | Ukupno € | Dobavljač | Link |
|--------|-----------|------|-------|----------|-----------|------|
| AURIX TC397 5V TFT Kit | KIT_A2G_TC397_5V_TFT | 1 | 149 | 149 | Infineon Direct | [Infineon](https://www.infineon.com/cms/en/product/evaluation-boards/kit_a2g_tc397_5v_tft/) |
| *Alternativa: TC397 3V3 TFT* | *KIT_A2G_TC397_3V3_TFT* | *1* | *149* | *149* | *DigiKey* | [DigiKey](https://www.digikey.com/en/products/detail/infineon-technologies/KITA2GTC3973V3TFTTOBO1/12179198) |

### 4.2 Komponente za prototip PCB

| Stavka | Broj dela | Kol. | €/kom | Ukupno € | Dobavljač | Link |
|--------|-----------|------|-------|----------|-----------|------|
| Custom 4-slojni PCB 80×60mm | ENIG finish | 5 | 3 | 15 | JLCPCB | [JLCPCB](https://jlcpcb.com/) |
| STM32G474RET6 (opciono) | LQFP64 | 2 | 9 | 18 | LCSC/Mouser | - |
| Pasivne komponente komplet | 0603/0805 | 1 | 20 | 20 | LCSC | - |
| Asortiman konektora | JST, USB-C, hederi | 1 | 15 | 15 | LCSC/AliExpress | - |
| **Međuzbir PCB** | | | | **€68** | | |

### 4.3 Ukupno Faza 3

| Kategorija | Cena € |
|------------|--------|
| TC397 Kit | 149 |
| Prototip PCB i komponente | 68 |
| Faza 2 preneseno | 363,50 |
| **UKUPNO Faza 3** | **€580,50** |

---

## 5. Kompletni BOM pregled

### 5.1 Po fazama

| Faza | Komponente | Kumulativno € |
|------|------------|---------------|
| Faza 1 | 2× AURIX TC375, 1× C2000, 1× ESP32, kablovi | €200 |
| Faza 2 | + CAN mreža, debug alati | €365 |
| Faza 3 | + TC397, prototip PCB-ovi | €580 |

### 5.2 Po dobavljaču (preporučena strategija naručivanja)

Za minimizaciju carine i troškova dostave iz Srbije:

| Narudžba | Dobavljač | Stavke | Procenjen iznos | Dostava |
|----------|-----------|--------|-----------------|---------|
| **Narudžba 1** | Arrow | 2× AURIX TC375 Lite Kit | ~$155 | Besplatno (>$100) |
| **Narudžba 2** | TI Store | 2× LaunchPad F280049C | ~$50 | Proveriti TI.com |
| **Narudžba 3** | AliExpress | ESP32, kablovi, logički analizator, žice, CANable klon | ~€45 | Besplatno |
| **Narudžba 4** | LCSC | CAN primopredajnici, pasivne komp., konektori | ~€30 | ~€8 |
| **Narudžba 5** | Infineon | TC397 TFT Kit (Faza 3) | €149 | Proveriti |

### 5.3 Budžet vs Premium opcije

| Stavka | Budžet € | Premium € | Napomene |
|--------|----------|-----------|----------|
| CAN adapter | 25 (MKS klon) | 80 (CANable Pro) | Klon radi ok za razvoj |
| Logički analizator | 5 (24MHz klon) | 350 (Saleae Logic 8) | Klon dovoljan za početak |
| ESP32 | 8 (AliExpress) | 15 (Mouser originalni) | AliExpress pouzdan |
| **Ukupna razlika** | | **~€407** | |

---

## 6. Lokalni dobavljači u Srbiji

### 6.1 Prodavnice elektronike u Beogradu

| Prodavnica | Sajt | Specijalnost | Napomene |
|------------|------|--------------|----------|
| **Mikro Princ** | [mikroprinc.com](https://www.mikroprinc.com/sr) | Komponente, alati, dev ploče | Dobar generalni asortiman |
| **Beli Elektronik** | [belielektronik.rs](https://www.belielektronik.rs/) | Komponente, napajanja | Lokacija Vračar |
| **Sprint Elektronika** | [sprintel.rs](https://sprintel.rs/) | Uvoz/distribucija | Širok asortiman |
| **M&G Electronic** | [mgelectronic.rs](https://www.mgelectronic.rs/) | Komponente | - |
| **Kelco** | [kelco.rs](https://www.kelco.rs/) | Komponente | Niš: +381 11 2403-376 |
| **Comet Electronics** | [store.comet.rs](https://store.comet.rs/en/CatalogueFarnell/) | Farnell preprodavac | Farnell proizvodi |

### 6.2 Farnell ovlašćeni distributer

**Tagor Electronics d.o.o.**
- Adresa: Bulevar Sv. Cara Konstantina 80-86, 18000 Niš, Srbija
- Mogu naručiti Farnell proizvode sa lokalnom podrškom

---

## 7. Softverski alati (besplatni)

Sav potreban softver je besplatan:

| Alat | Namena | Preuzimanje |
|------|--------|-------------|
| **AURIX Development Studio** | Infineon IDE | [infineon.com](https://www.infineon.com/aurix-development-studio) |
| **TriCore GCC** | AURIX kompajler | Uključen u ADS |
| **Code Composer Studio** | TI C2000 IDE | [ti.com](https://www.ti.com/tool/CCSTUDIO) |
| **ESP-IDF** | ESP32 framework | [espressif.com](https://docs.espressif.com/projects/esp-idf/) |
| **VS Code** | Editor | [code.visualstudio.com](https://code.visualstudio.com/) |
| **PulseView** | Logički analizator | [sigrok.org](https://sigrok.org/wiki/PulseView) |
| **SavvyCAN** | CAN bus analizator | [github.com/collin80/SavvyCAN](https://github.com/collin80/SavvyCAN) |

---

## 8. Brzi linkovi

### Razvojne ploče
- [AURIX TC375 Lite Kit - Arrow](https://www.arrow.com/en/products/kita2gtc375litetobo1/infineon-technologies-ag)
- [AURIX TC375 Lite Kit - Mouser](https://www.mouser.com/ProductDetail/Infineon-Technologies/KITA2GTC375LITETOBO1)
- [LaunchPad F280049C - TI](https://www.ti.com/tool/LAUNCHXL-F280049C)
- [LaunchPad F280049C - DigiKey](https://www.digikey.com/en/products/detail/texas-instruments/LAUNCHXL-F280049C/9860033)
- [ESP32-S3-DevKitC - AliExpress](https://www.aliexpress.com/item/1005003979778978.html)
- [ESP32-S3-DevKitC - Mouser](https://www.mouser.com/ProductDetail/Espressif-Systems/ESP32-S3-DEVKITC-1-N8R8)

### CAN alati
- [CANable 2.0 Originalni](https://openlightlabs.com/products/canable-2-0)
- [CANable Pro Izolovani](https://openlightlabs.com/products/canable-pro-isolated-usb-to-can-adapter)
- [MKS CANable Klon - AliExpress](https://www.aliexpress.com/w/wholesale-canable-2.0.html)

### Distributeri komponenti
- [LCSC Electronics](https://www.lcsc.com/)
- [JLCPCB (izrada PCB)](https://jlcpcb.com/)
- [AliExpress](https://www.aliexpress.com/)

---

## 9. Referentni dokumenti

| Dokument | Sadržaj |
|----------|---------|
| 16-jezgro.md | Kompletna RTOS specifikacija |
| 17-jezgro-dev-bom.md | STM32 razvojni BOM |
| 18-jezgro-dev-plan.md | STM32 plan razvoja |
| 19-jezgro-dev-alternatives.md | Sve tri razvojne opcije |

---

## Istorija izmena

| Datum | Verzija | Opis |
|-------|---------|------|
| 2026-01-04 | 1.0 | Inicijalna verzija - vodič za nabavku iz Srbije |
