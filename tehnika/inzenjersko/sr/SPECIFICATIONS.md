# EK3 Master Specifikacije

**Verzija:** 1.0
**Datum:** 2026-01-03
**Status:** STANDARDIZOVANO

---

## Svrha Dokumenta

Ovaj dokument je **single source of truth** za sve EK3 specifikacije. Svi ostali dokumenti u repozitorijumu moraju biti usklađeni sa vrednostima ovde.

---

## EK3 Modul - Standardne Specifikacije

### Električne Karakteristike

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| Snaga (continuous) | **3.3 kW** | LLC resonant DC/DC |
| Snaga (peak) | **3.6 kW** | Kratkoročno |
| Input napon | 650V DC | Od centralnog PFC |
| Output napon | 50-500V DC | Pun opseg baterija |
| Efikasnost (peak) | >96% | @ 50% load |
| Efikasnost (full load) | >94% | @ 3.3 kW |
| Standby potrošnja | <3W | Deep sleep mode |

### Power Electronics

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| SiC MOSFET | **900V (Wolfspeed C3M0065090D)** | Optimalan balans cene i margine |
| Topologija | LLC Resonant DC/DC | ZVS, ZCS |
| Switching frekvencija | 150-250 kHz | Resonant |
| Transformer | Planar, PCB integrisan | Manufacturing repeatability |
| Kondenzatori | Film only | No electrolytics, >50,000h |

### Fizičke Karakteristike

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| Dimenzije | **200 × 320 × 44 mm** | 1U half-width |
| Masa | **~3.5 kg** | Sa heatsink-om |
| Form factor | Custom rack blade | Ne 19" telecom |
| Hlađenje | Forced air (shared plenum) | Front-to-back |

### Kontrola i Komunikacija

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| MCU | **STM32G474** | Cortex-M4 @ 170MHz |
| Komunikacija | **CAN-FD @ 5 Mbps** | 64-byte payload |
| CAN transceiver | NXP TJA1443 | CAN-FD capable |
| Latencija | <1ms per message | Real-time |

### Konektori

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| Data konektor | **20-pin blind-mate** | CAN-FD, I2C, PWM |
| Power konektori | Anderson SBS50 | Sequenced mating |
| Hot-swap vreme | <1 sekunda | Electrical disconnect |
| Mating ciklusi | >50,000 | Robot-grade |
| Insertion force | <20N | Robot-friendly |

### Pouzdanost

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| MTBF | >100,000 h | Calculated |
| Životni vek | >50,000 h | Film capacitors |
| Kapacitet gubitak po kvaru | 0.33% | 1/303 modula |

---

## Custom Rack Specifikacije

### Dimenzije (Preliminarno)

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| Širina | ~900 mm | Za 4× modula + spacing |
| Dubina | ~500 mm | Modul + airflow |
| Visina | ~1200 mm | Kompaktnije od 42U |
| Masa (pun) | ~350 kg | Sa 84 modula |
| Snaga po rack-u | **277 kW** | 84 × 3.3 kW |

### Termalni Dizajn

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| Airflow | Front-to-back | Shared plenum |
| Disipacija | ~11 kW | Pri 96% efikasnosti |
| Filter | Lako zamenjiv | Robot accessible |

### Centralni PFC

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| Topologija | **Vienna Rectifier** | 3-fazni, bidirekcioni-ready |
| Ulazni napon | 380-480V AC 3-fazni | ±10% tolerancija |
| Ulazna frekvencija | 50/60 Hz | Auto-detekcija |
| Izlazni napon | **650V DC** | ±5% regulacija |
| Izlazna snaga | **100 kW** | Po PFC jedinici |
| Efikasnost | >97% | @ puno opterećenje |
| Faktor snage | >0.99 | @ >25% opterećenja |
| THD | <5% | EN 61000-3-12 |
| Kontroler | TMS320F28379D | Dual-core DSP |
| Form factor | 3U × 19" | Rack-mount |
| Redundancija | Modularan dizajn | N+1 dostupno |

### Rack Kontroler

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| MCU | **STM32G474VET6** | Isti kao EK3 moduli |
| Firmware | **JEZGRO mikrokernel** | Ujedinjeno sa EK3 firmverom |
| CAN interfejs | 2× CAN-FD | 5 Mbps, dupli bus |
| Kontrola ventilatora | 15× PWM izlaza | 5 zona × 3 ventilatora |
| Ethernet | Opcioni W5500 SPI | Direktan pristup mreži |

---

## Skaliranje

| Use Case | Modula | Rack-ova | Snaga |
|----------|--------|----------|-------|
| E-bike | 1 | - | 3.3 kW |
| Home charger | 3-7 | - | 10-23 kW |
| DC Fast 50kW | 16 | Half | 53 kW |
| DC Fast 150kW | 46 | 1 | 152 kW |
| Highway 350kW | 106 | 2 | 350 kW |
| Bus Depot 500kW | 152 | 2 | 502 kW |
| Truck 1MW | 303 | 4 | 1 MW |
| MCS 3MW | 909 | 12 | 3 MW |

---

## EK-BAT Familija Baterijskih Modula

EK-BAT familija proširuje filozofiju modularnosti Elektrokombinacije sa modula punjača na baterije vozila. Tri standardizovane veličine pokrivaju sve klase teških komercijalnih vozila.

### EK-BAT-25 (Modul za Kombije)

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| Kapacitet | **25 kWh** | Neto upotrebljivo |
| Nominalni napon | 400V | 350-450V opseg |
| Masa | **150 kg** | Uključuje BMS, kućište |
| Dimenzije | 600 × 400 × 300 mm | Kompatibilno sa robotom |
| Hemija | LFP (LiFePO4) | Najbezbednija hemija |
| Gustina energije | 167 Wh/kg | Nivo paketa |
| C-rate (punjenje) | 2C | 50 kW max |
| C-rate (pražnjenje) | 3C | 75 kW max |
| Životni vek ciklusa | >4.000 | @ 80% DoD |
| Kalendarski vek | 10 godina | |
| Hlađenje | Tečno | Deljena petlja |
| Radna temperatura | -20°C do +55°C | Puna snaga 0-45°C |
| IP oznaka | IP67 | Potopivo |
| BMS | Distribuirani, ROJ-ready | STM32G474 |

**Ciljna vozila:** Dostavni kombiji (2× = 50 kWh), mali kamioni (klasa 3,5t)

### EK-BAT-50 (Modul za Autobuse)

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| Kapacitet | **50 kWh** | Neto upotrebljivo |
| Nominalni napon | 400V | 350-450V opseg |
| Masa | **300 kg** | Uključuje BMS, kućište |
| Dimenzije | 900 × 600 × 300 mm | Kompatibilno sa robotom |
| Hemija | LFP (LiFePO4) | Najbezbednija hemija |
| Gustina energije | 167 Wh/kg | Nivo paketa |
| C-rate (punjenje) | 2C | 100 kW max |
| C-rate (pražnjenje) | 3C | 150 kW max |
| Životni vek ciklusa | >4.000 | @ 80% DoD |
| Kalendarski vek | 10 godina | |
| Hlađenje | Tečno | Deljena petlja |
| Radna temperatura | -20°C do +55°C | Puna snaga 0-45°C |
| IP oznaka | IP67 | Potopivo |
| BMS | Distribuirani, ROJ-ready | STM32G474 |

**Ciljna vozila:** Gradski autobusi (2× = 100 kWh), regionalni autobusi (3× = 150 kWh), srednji kamioni

### EK-BAT-100 (Modul za Teške Kamione)

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| Kapacitet | **100 kWh** | Neto upotrebljivo |
| Nominalni napon | 800V | 700-900V opseg |
| Masa | **600 kg** | Uključuje BMS, kućište |
| Dimenzije | 1200 × 800 × 400 mm | Kompatibilno sa robotom |
| Hemija | LFP (LiFePO4) | Najbezbednija hemija |
| Gustina energije | 167 Wh/kg | Nivo paketa |
| C-rate (punjenje) | 2C | 200 kW max |
| C-rate (pražnjenje) | 3C | 300 kW max |
| Životni vek ciklusa | >4.000 | @ 80% DoD |
| Kalendarski vek | 10 godina | |
| Hlađenje | Tečno | Deljena petlja |
| Radna temperatura | -20°C do +55°C | Puna snaga 0-45°C |
| IP oznaka | IP67 | Potopivo |
| BMS | Distribuirani, ROJ-ready | STM32G474 |

**Ciljna vozila:** Tegljači (4× = 400 kWh), teški autobusi, zglobni autobusi

### EK-BAT Specifikacije Konektora

| Parametar | EK-BAT-25/50 | EK-BAT-100 |
|-----------|--------------|------------|
| Power konektor | Anderson SBS350 | REMA DIN 320A |
| Data konektor | Harting Han-Modular 10A | Harting Han-Modular 10A |
| Coolant konektor | Stäubli DN12 | Stäubli DN20 |
| Mating ciklusi (power) | >10.000 | >10.000 |
| Mating ciklusi (data) | >5.000 | >5.000 |
| Mating ciklusi (coolant) | >50.000 | >50.000 |
| Kontaktna otpornost | <0,1 mΩ | <0,1 mΩ |
| Tolerancija slepog spajanja | ±3 mm | ±3 mm |

### EK-BAT Tačke za Hvatanje Robota

| Modul | Razmak hvataljke | Interfejs |
|-------|------------------|-----------|
| EK-BAT-25 | 400 × 200 mm | M10 umeci × 4 |
| EK-BAT-50 | 700 × 400 mm | M10 umeci × 4 |
| EK-BAT-100 | 1000 × 600 mm | M10 umeci × 4 |

### Matrica Konfiguracije Vozila

| Tip Vozila | Modul | Broj | Ukupna Energija |
|------------|-------|------|-----------------|
| Dostavni kombi | EK-BAT-25 | 2 | 50 kWh |
| Gradski autobus (12m) | EK-BAT-50 | 2 | 100 kWh |
| Regionalni autobus (15m) | EK-BAT-50 | 3 | 150 kWh |
| Gradski kamion | EK-BAT-50 | 2 | 100 kWh |
| Tegljač | EK-BAT-100 | 4 | 400 kWh |
| Zglobni autobus | EK-BAT-100 | 2 | 200 kWh |

---

## JEZGRO Mikrokernel Porodica Proizvoda

JEZGRO je MINIX-inspirisan mikrokernel RTOS dizajniran za energetsku elektroniku, koji pruža izolaciju grešaka, automatski restart servisa i garancije realnog vremena kroz sve Elektrokombinacija ugrađene kontrolere.

### JEZGRO Varijante

| Varijanta | Ciljni uređaj | MCU | Ključni servisi |
|-----------|---------------|-----|-----------------|
| **JEZGRO-EK3** | Modul punjenja | STM32G474 | LLC_CONTROL, THERMAL, ROJ |
| **JEZGRO-RACK** | Kontroler reka | STM32G474 | FAN_CONTROL, SLOT_INVENTORY |
| **JEZGRO-BAT** | Baterijski BMS | STM32G474 | CELL_MONITOR, BALANCING, SOC |
| **JEZGRO-ROB** | Kontroleri robota | STM32H743 | MOTION_CTRL, TRAJECTORY, SAFETY |
| **JEZGRO-GW** | Protokol kapije | STM32H743 | PLL_SYNC, ISO15118, DROOP_CTRL |

### Zajedničke specifikacije kernela

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| Veličina kernela | <10 KB | Minimalan otisak |
| Izolacija grešaka | MPU-bazirana | Bez MMU zahteva |
| Restart servisa | <50 ms | Automatski oporavak |
| Latencija prekida | <1 µs | Real-time |
| IPC mehanizam | Zero-copy prosleđivanje poruka | 64-bajtne poruke |
| Raspoređivač | EDF sa prioritetnim fallback | Svestan rokova |

### Hardverske platforme

| Platforma | MCU | RAM | Flash | Cena |
|-----------|-----|-----|-------|------|
| **EK-PLAT-G4** | STM32G474VET6 | 128 KB | 512 KB | ~8$ |
| **EK-PLAT-H7** | STM32H743VIT6 | 1 MB | 2 MB | ~15$ |

### PCB form faktori

| Form faktor | Veličina | Slojevi | Primene |
|-------------|----------|---------|---------|
| **EK-PCB-S** | 50×80 mm | 4 | EK3 modul, Baterijski BMS |
| **EK-PCB-M** | 80×100 mm | 4 | Kontroler reka, OCPP adapter |
| **EK-PCB-L** | 100×160 mm | 6 | Kontroler robota, V2G kapija |

---

## EK-ADAPT Porodica adapter uređaja

EK-ADAPT porodica proširuje Elektrokombinacija ekosistem za rad sa vozilima trećih strana, nasleđenim autobusima i postojećim standardima punjenja. Svi adapteri pokreću JEZGRO-GW firmver.

### Tipovi adaptera

| Uređaj | Namena | MCU | Opseg snage |
|--------|--------|-----|-------------|
| **EK-ADAPT-V2G** | EV trećih strana → V2G mreža | STM32H743 | 10-50 kW bidir |
| **EK-ADAPT-BUS** | Retrofit nasleđenih autobusa | STM32G474 | N/A (protokol) |
| **EK-ADAPT-CCS** | CCS Combo ka EK mostu | STM32H743 | 50-150 kW |
| **EK-ADAPT-MCS** | Megavatno punjenje adapter | STM32H743 | 350 kW - 3 MW |
| **EK-ADAPT-OCPP** | Kapija za punjače trećih strana | STM32G474 | N/A (protokol) |

### EK-ADAPT-V2G specifikacije

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| Interfejs vozila | CCS Combo 2 / CHAdeMO | Preko utikača |
| EK interfejs | CAN-FD @ 5 Mbps | Sistemska integracija |
| Opseg snage | 10-50 kW dvosmerno | Po mogućnostima vozila |
| Podrška protokola | ISO 15118-2, -20, CHAdeMO 3.0 | Pun V2G stek |
| Dimenzije | 300 × 200 × 100 mm | Zidna montaža |
| IP stepen | IP54 | Unutra/zaštićeno |

### EK-ADAPT-MCS specifikacije

| Parametar | Vrednost | Napomena |
|-----------|----------|----------|
| Konektor | MCS (CharIN) | Nominalno 3 MW |
| Opseg snage | 350 kW - 3 MW | Skalabilno |
| Napon | 800-1500V DC | MCS standard |
| Struja | Do 3000A | Tečno hlađen kabl |
| Protokol | ISO 15118-20 + CharIN MCS | Pun BPT |
| Hlađenje | Tečno + prinudni vazduh | Visoka snaga |

### EK-ADAPT skaliranje (MCS)

| Konfiguracija | Rekovi | EK3 moduli | Ukupna snaga |
|---------------|--------|------------|--------------|
| MCS-350 | 2 | 106 | 350 kW |
| MCS-750 | 3 | 227 | 750 kW |
| MCS-1000 | 4 | 303 | 1 MW |
| MCS-1500 | 6 | 454 | 1.5 MW |
| MCS-3000 | 12 | 909 | 3 MW |

---

## Reference Dokumenti

### Arhitektura i Filozofija

| Dokument | Lokacija | Opis |
|----------|----------|------|
| Arhitektura pregled | `tehnika/00-arhitektura.md` | Sistemska filozofija |
| **Mikrokernel arhitektura** | `tehnika/10-microkernel-architecture.md` | MASTER DOC - Mikrokernel principi |
| Rack sistem | `tehnika/09-ek3-rack-sistem.md` | 3PAR inspiracija |
| Custom rack sistem | `tehnika/16-custom-rack-system.md` | Backplane kao "hardware microkernel" |

### Firmware i Softver

| Dokument | Lokacija | Opis |
|----------|----------|------|
| Firmware arhitektura | `tehnika/14-firmware-architecture.md` | RTOS, tasks, memory, secure boot |
| ROJ inteligencija | `tehnika/konceptualno/sr/02-roj-intelligence.md` | Raft, load balancing, dual CAN |
| Module interface | `tehnika/komponente/module-interface-spec.md` | CAN protokol, state machine |
| Audit logging | `tehnika/12-audit-logging.md` | Event logging, forensics |

### Hardver i Sigurnost

| Dokument | Lokacija | Opis |
|----------|----------|------|
| Power electronics | `tehnika/01-power-electronics.md` | SiC, LLC topologija |
| Hardware security | `tehnika/13-hardware-security.md` | PCB, crypto, tamper detection |
| Connector spec | `tehnika/15-ek3-connector-spec.md` | 20-pin blind-mate |
| Security model | `tehnika/11-security-model.md` | RBAC, CMAC, trust tiers |

### Patenti i Dizajn

| Dokument | Lokacija | Opis |
|----------|----------|------|
| Kontrolni sistem | `patent/03-TECHNICAL-SUPPORT/CONTROL-SYSTEM-ARCHITECTURE.md` | 4-level hierarchy |
| EK3 detaljan dizajn | `patent/03-TECHNICAL-SUPPORT/EK3-DETAILED-DESIGN.md` | Kompletna specifikacija |
| Komunikacija | `tehnika/komponente/komunikacija.md` | CAN protokoli |

### JEZGRO Ekosistem

| Dokument | Lokacija | Opis |
|----------|----------|------|
| **JEZGRO porodica proizvoda** | `tehnika/inzenjersko/sr/21-jezgro-product-family.md` | Pregled svih varijanti |
| **JEZGRO mikrokernel** | `tehnika/inzenjersko/sr/16-jezgro.md` | Bazna specifikacija kernela |
| **JEZGRO-BAT (BMS)** | `tehnika/inzenjersko/sr/22-jezgro-bat.md` | Baterijski BMS |
| **JEZGRO-ROB (Robot)** | `tehnika/inzenjersko/sr/23-jezgro-rob.md` | Kontroler robota |
| **JEZGRO-GW (Kapija)** | `tehnika/inzenjersko/sr/24-jezgro-gw.md` | Gateway firmver |
| **EK-ADAPT uređaji** | `tehnika/inzenjersko/sr/25-adapter-devices.md` | Adapter uređaji |
| **Hardverske platforme** | `tehnika/inzenjersko/sr/26-jezgro-hw-platforms.md` | MCU, PCB, konektori |

---

## Istorija Izmena

| Datum | Verzija | Opis |
|-------|---------|------|
| 2026-01-04 | 1.4 | Dodata JEZGRO porodica proizvoda (5 varijanti), EK-ADAPT adapter uređaji (5 tipova), hardverske platforme |
| 2026-01-04 | 1.3 | Dodate specifikacije Centralnog PFC modula (Vienna rectifier), Rack kontroler (STM32G474 + JEZGRO) |
| 2026-01-04 | 1.2 | Dodate specifikacije EK-BAT familije baterijskih modula |
| 2026-01-03 | 1.0 | Inicijalna standardizacija: 3.3kW, 900V SiC, CAN-FD, custom rack |
