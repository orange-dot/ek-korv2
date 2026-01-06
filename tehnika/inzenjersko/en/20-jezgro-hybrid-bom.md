# JEZGRO Hybrid BOM - Serbia Sourcing Guide

## Document Information

| Field | Value |
|-------|-------|
| Document ID | EK-TECH-021 |
| Version | 1.0 |
| Date | 2026-01-04 |
| Status | Active |
| Related | 16-jezgro.md, 19-jezgro-dev-alternatives.md |

---

## 1. Overview

This document provides a detailed Bill of Materials (BOM) for the JEZGRO Hybrid "Ultimate" development platform, with sourcing options for buyers in Serbia. The Hybrid combines:

- **Infineon AURIX TC375/TC397** - ASIL-D safety, hardware lockstep
- **TI TMS320F280049C (C2000)** - 150 ps PWM resolution
- **Espressif ESP32-S3** - WiFi/BT connectivity, OTA updates

### 1.1 Supplier Overview for Serbia

| Supplier | Shipping to Serbia | Free Shipping | Notes |
|----------|-------------------|---------------|-------|
| [Arrow](https://www.arrow.com/) | Yes | Orders >$100 | Best for dev boards |
| [Mouser](https://eu.mouser.com/) | Yes | Orders >€65 | Wide selection, €30 shipping otherwise |
| [DigiKey](https://www.digikey.rs/) | Yes | Orders >€50 | Fast shipping, has .rs site |
| [Farnell](https://export.farnell.com/) | Yes (via Tagor) | Check distributor | Local distributor in Niš |
| [LCSC](https://www.lcsc.com/) | Yes | No | Best for passive components |
| [AliExpress](https://www.aliexpress.com/) | Yes | Often free | Budget option, customs risk >€45 |

### 1.2 Serbia Import Considerations

| Factor | Details |
|--------|---------|
| **Customs Threshold** | ~€45-50 (orders above may incur customs) |
| **VAT** | 20% on imported goods |
| **DHL/FedEx Fees** | Additional €10-15 handling for customs clearance |
| **Recommendation** | Keep individual orders under €45 OR order >€100 from Arrow |

---

## 2. Phase 1: Triple-MCU Core (~€200)

Initial development setup with all three MCU families.

### 2.1 Development Boards

| Item | Part Number | Qty | Unit € | Total € | Supplier | Link |
|------|-------------|-----|--------|---------|----------|------|
| AURIX TC375 Lite Kit | KITA2GTC375LITETOBO1 | 2 | 70 | 140 | Arrow/Mouser | [Arrow](https://www.arrow.com/en/products/kita2gtc375litetobo1/infineon-technologies-ag) |
| TI LaunchPad F280049C | LAUNCHXL-F280049C | 1 | 25 | 25 | Mouser/DigiKey | [TI](https://www.ti.com/tool/LAUNCHXL-F280049C) |
| ESP32-S3-DevKitC-1-N8R8 | ESP32-S3-DEVKITC-1-N8R8 | 1 | 10 | 10 | AliExpress/Mouser | [AliExpress](https://www.aliexpress.com/item/1005003979778978.html) |
| **Subtotal Boards** | | | | **€175** | | |

### 2.2 Connectivity & Cables

| Item | Part Number | Qty | Unit € | Total € | Supplier | Link |
|------|-------------|-----|--------|---------|----------|------|
| USB Micro-B cables | Generic | 4 | 2 | 8 | AliExpress | - |
| USB-C cable | Generic | 2 | 3 | 6 | AliExpress | - |
| Dupont jumper wires kit | M-M, M-F, F-F | 1 | 5 | 5 | AliExpress | - |
| Mini breadboard 400pt | Generic | 2 | 3 | 6 | AliExpress | - |
| **Subtotal Connectivity** | | | | **€25** | | |

### 2.3 Phase 1 Total

| Category | Cost € |
|----------|--------|
| Development Boards | 175 |
| Connectivity & Cables | 25 |
| **TOTAL Phase 1** | **€200** |

---

## 3. Phase 2: Full Integration (~€350)

Multi-node CAN-FD network with debugging tools.

### 3.1 Additional Development Boards

| Item | Part Number | Qty | Unit € | Total € | Supplier | Link |
|------|-------------|-----|--------|---------|----------|------|
| TI LaunchPad F280049C | LAUNCHXL-F280049C | 1 | 25 | 25 | Mouser/DigiKey | [TI](https://www.ti.com/tool/LAUNCHXL-F280049C) |

### 3.2 CAN-FD Network

| Item | Part Number | Qty | Unit € | Total € | Supplier | Link |
|------|-------------|-----|--------|---------|----------|------|
| CAN-FD Transceiver IC | TLE9251VSJ | 6 | 1 | 6 | LCSC | [LCSC](https://www.lcsc.com/product-detail/CAN-Transceivers_Infineon-Technologies-TLE9251VSJ_C189937.html) |
| CAN Transceiver Module | SN65HVD230 breakout | 6 | 4 | 24 | AliExpress | [AliExpress](https://www.aliexpress.com/w/wholesale-sn65hvd230.html) |
| Termination Resistors 120Ω | 1% 0805 | 10 | 0.05 | 0.50 | LCSC | - |
| JST-XH connectors 4-pin | Generic | 10 | 0.30 | 3 | LCSC/AliExpress | - |
| Twisted pair cable 2m | Shielded | 3 | 4 | 12 | Local/Amazon | - |
| **Subtotal CAN** | | | | **€45.50** | | |

### 3.3 Debug Tools

| Item | Part Number | Qty | Unit € | Total € | Supplier | Link |
|------|-------------|-----|--------|---------|----------|------|
| CANable 2.0 Pro | CANable V2.0 | 1 | 80 | 80 | [Openlight Labs](https://openlightlabs.com/products/canable-2-0) | Official |
| *Alternative: MKS CANable* | *MKS CANable V2.0* | *1* | *25* | *25* | *AliExpress* | [AliExpress](https://www.aliexpress.com/w/wholesale-canable-2.0.html) |
| Logic Analyzer 24MHz 8CH | Generic Saleae clone | 1 | 5 | 5 | AliExpress | [AliExpress](https://www.aliexpress.com/item/1005001417581550.html) |
| USB-UART CP2102 | CP2102 module | 4 | 2 | 8 | AliExpress | - |
| **Subtotal Debug** | | | | **€93** (or €38 with clone) | | |

### 3.4 Phase 2 Total

| Category | Cost € | Budget Option € |
|----------|--------|-----------------|
| Additional Boards | 25 | 25 |
| CAN-FD Network | 45.50 | 45.50 |
| Debug Tools | 93 | 38 |
| Phase 1 carried over | 200 | 200 |
| **TOTAL Phase 2** | **€363.50** | **€308.50** |

---

## 4. Phase 3: Production System (~€550)

Full system with TC397 for safety validation.

### 4.1 Advanced Hardware

| Item | Part Number | Qty | Unit € | Total € | Supplier | Link |
|------|-------------|-----|--------|---------|----------|------|
| AURIX TC397 5V TFT Kit | KIT_A2G_TC397_5V_TFT | 1 | 149 | 149 | Infineon Direct | [Infineon](https://www.infineon.com/cms/en/product/evaluation-boards/kit_a2g_tc397_5v_tft/) |
| *Alternative: TC397 3V3 TFT* | *KIT_A2G_TC397_3V3_TFT* | *1* | *149* | *149* | *DigiKey* | [DigiKey](https://www.digikey.com/en/products/detail/infineon-technologies/KITA2GTC3973V3TFTTOBO1/12179198) |

### 4.2 Prototype PCB Components

| Item | Part Number | Qty | Unit € | Total € | Supplier | Link |
|------|-------------|-----|--------|---------|----------|------|
| Custom 4-layer PCB 80×60mm | ENIG finish | 5 | 3 | 15 | JLCPCB | [JLCPCB](https://jlcpcb.com/) |
| STM32G474RET6 (optional) | LQFP64 | 2 | 9 | 18 | LCSC/Mouser | - |
| Passive components kit | 0603/0805 | 1 | 20 | 20 | LCSC | - |
| Connectors assortment | JST, USB-C, headers | 1 | 15 | 15 | LCSC/AliExpress | - |
| **Subtotal PCB** | | | | **€68** | | |

### 4.3 Phase 3 Total

| Category | Cost € |
|----------|--------|
| TC397 Kit | 149 |
| Prototype PCB & Components | 68 |
| Phase 2 carried over | 363.50 |
| **TOTAL Phase 3** | **€580.50** |

---

## 5. Complete BOM Summary

### 5.1 By Phase

| Phase | Components | Cumulative € |
|-------|------------|--------------|
| Phase 1 | 2× AURIX TC375, 1× C2000, 1× ESP32, cables | €200 |
| Phase 2 | + CAN network, debug tools | €365 |
| Phase 3 | + TC397, prototype PCBs | €580 |

### 5.2 By Supplier (Recommended Order Strategy)

To minimize customs and shipping costs from Serbia:

| Order | Supplier | Items | Est. Total | Shipping |
|-------|----------|-------|------------|----------|
| **Order 1** | Arrow | 2× AURIX TC375 Lite Kit | ~$155 | Free (>$100) |
| **Order 2** | TI Store | 2× LaunchPad F280049C | ~$50 | Check TI.com |
| **Order 3** | AliExpress | ESP32, cables, logic analyzer, jumpers, CANable clone | ~€45 | Free |
| **Order 4** | LCSC | CAN transceivers, passives, connectors | ~€30 | ~€8 |
| **Order 5** | Infineon | TC397 TFT Kit (Phase 3) | €149 | Check |

### 5.3 Budget vs Premium Options

| Item | Budget € | Premium € | Notes |
|------|----------|-----------|-------|
| CAN Adapter | 25 (MKS clone) | 80 (CANable Pro) | Clone works fine for dev |
| Logic Analyzer | 5 (24MHz clone) | 350 (Saleae Logic 8) | Clone sufficient for start |
| ESP32 | 8 (AliExpress) | 15 (Mouser official) | AliExpress reliable |
| **Total Difference** | | **~€407** | |

---

## 6. Serbian Local Suppliers

### 6.1 Electronics Stores in Belgrade

| Store | Website | Specialty | Notes |
|-------|---------|-----------|-------|
| **Mikro Princ** | [mikroprinc.com](https://www.mikroprinc.com/sr) | Components, tools, dev boards | Good general stock |
| **Beli Elektronik** | [belielektronik.rs](https://www.belielektronik.rs/) | Components, power supplies | Vračar location |
| **Sprint Elektronika** | [sprintel.rs](https://sprintel.rs/) | Import/distribution | Wide range |
| **M&G Electronic** | [mgelectronic.rs](https://www.mgelectronic.rs/) | Components | - |
| **Kelco** | [kelco.rs](https://www.kelco.rs/) | Components | Niš: +381 11 2403-376 |
| **Comet Electronics** | [store.comet.rs](https://store.comet.rs/en/CatalogueFarnell/) | Farnell reseller | Farnell products |

### 6.2 Farnell Authorized Distributor

**Tagor Electronics d.o.o.**
- Address: Bulevar Sv. Cara Konstantina 80-86, 18000 Niš, Serbia
- Can order Farnell products with local support

---

## 7. Software Tools (Free)

All required software is free:

| Tool | Purpose | Download |
|------|---------|----------|
| **AURIX Development Studio** | Infineon IDE | [infineon.com](https://www.infineon.com/aurix-development-studio) |
| **TriCore GCC** | AURIX compiler | Included in ADS |
| **Code Composer Studio** | TI C2000 IDE | [ti.com](https://www.ti.com/tool/CCSTUDIO) |
| **ESP-IDF** | ESP32 framework | [espressif.com](https://docs.espressif.com/projects/esp-idf/) |
| **VS Code** | Editor | [code.visualstudio.com](https://code.visualstudio.com/) |
| **PulseView** | Logic analyzer | [sigrok.org](https://sigrok.org/wiki/PulseView) |
| **SavvyCAN** | CAN bus analyzer | [github.com/collin80/SavvyCAN](https://github.com/collin80/SavvyCAN) |

---

## 8. Quick Links

### Development Boards
- [AURIX TC375 Lite Kit - Arrow](https://www.arrow.com/en/products/kita2gtc375litetobo1/infineon-technologies-ag)
- [AURIX TC375 Lite Kit - Mouser](https://www.mouser.com/ProductDetail/Infineon-Technologies/KITA2GTC375LITETOBO1)
- [LaunchPad F280049C - TI](https://www.ti.com/tool/LAUNCHXL-F280049C)
- [LaunchPad F280049C - DigiKey](https://www.digikey.com/en/products/detail/texas-instruments/LAUNCHXL-F280049C/9860033)
- [ESP32-S3-DevKitC - AliExpress](https://www.aliexpress.com/item/1005003979778978.html)
- [ESP32-S3-DevKitC - Mouser](https://www.mouser.com/ProductDetail/Espressif-Systems/ESP32-S3-DEVKITC-1-N8R8)

### CAN Tools
- [CANable 2.0 Official](https://openlightlabs.com/products/canable-2-0)
- [CANable Pro Isolated](https://openlightlabs.com/products/canable-pro-isolated-usb-to-can-adapter)
- [MKS CANable Clone - AliExpress](https://www.aliexpress.com/w/wholesale-canable-2.0.html)

### Component Distributors
- [LCSC Electronics](https://www.lcsc.com/)
- [JLCPCB (PCB fab)](https://jlcpcb.com/)
- [AliExpress](https://www.aliexpress.com/)

---

## 9. Reference Documents

| Document | Content |
|----------|---------|
| 16-jezgro.md | Full RTOS specification |
| 17-jezgro-dev-bom.md | STM32 development BOM |
| 18-jezgro-dev-plan.md | STM32 development plan |
| 19-jezgro-dev-alternatives.md | All three development options |

---

## Change History

| Date | Version | Description |
|------|---------|-------------|
| 2026-01-04 | 1.0 | Initial version - Serbia sourcing guide |
