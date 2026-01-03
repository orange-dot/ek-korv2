# Standardi i Protokoli za EV Punjenje

## Konektori i Fizički Standardi

### CCS2 (Combo 2) - Evropski Standard
- **Mandat:** EU Direktiva 2014/94/EU (od novembra 2017)
- **Specifikacije:** Do 500 kW (1000V, 500A)
- **Komunikacija:** ISO 15118

### CCS1 - Severno-američki Standard
- **Specifikacije:** Do 350 kW na 1,000 VDC sa 500A max

### GB/T - Kineski Standard
- **Konektori:** GB/T 20234
- **Komunikacija:** CAN bus (GB/T 27930)
- **Snaga:** Do 237.5 kW

### ChaoJi - Sledeća Generacija (Kina-Japan)
- **Kapacitet:** Do 900-1,200 kW
- **Kompatibilnost:** Unazad kompatibilan sa GB/T, CHAdeMO, CCS preko adaptera
- **Status:** ChaoJi-1 odobren u Kini septembra 2023

### MCS (Megawatt Charging System)
- **Standard:** SAE J3271 (objavljen mart 2025)
- **Max snaga:** 3.75 MW
- **Max napon:** 1,250 VDC (konektor za 1,500 VDC)
- **Max struja:** 3,000A kontinualno
- **Konfiguracije:** 350A (bez hlađenja), 1,000A, 3,000A
- **Komunikacija:** ISO 15118-20 preko Automotive Ethernet (10BASE-T1S)

---

## Pantograph Standardi

### SAE J3105 (januar 2020)
Definiše automatsko konduktivno punjenje za teška vozila:

| Varijanta | Opis | Pozicioniranje |
|-----------|------|----------------|
| J3105-1 | Infrastruktura-montiran pantograph-down | ±100 mm |
| J3105-2 | Vozilo-montiran pantograph-up | ±100 mm |
| J3105-3 | Stäubli QCC horizontalna konekcija | ±10 mm |

**Nivoi snage:**
- **Level 1:** Do 600A / ~350 kW na 250-1,000 VDC
- **Level 2:** Do 1,200A / ~1,200 kW na 250-1,000 VDC

### OppCharge Standard
- **Razvoj:** Volvo Buses sa ABB, Siemens, Solaris, New Flyer, Heliox
- **Komunikacija:** WiFi IEEE 802.11a/n sa WPA2 enkripcijom
- **Protokol:** Adaptiran ISO 15118-2 za bežičnu operaciju
- **Tolerancija:** ±200 mm longitudinalno, ±150 mm lateralno

### EN 50696
Upravljanje automatskim konduktivnim interfejsima visokih snaga za autobuse.

---

## Komunikacijski Protokoli

### ISO 15118 - Plug & Charge
- **ISO 15118-2:** Trenutni standard, PKI sertifikati za autentifikaciju
- **ISO 15118-20:** Proširena verzija sa V2G podrškom i Automotive Ethernet

### OCPP (Open Charge Point Protocol)
| Verzija | Karakteristike |
|---------|---------------|
| 1.6 | Široko rasprostranjen, osnovna funkcionalnost |
| 2.0.1 | Native ISO 15118 podrška, poboljšana sigurnost, bidirekciono punjenje |

### GB/T 27930
Kineski CAN bus protokol za DC punjenje.

---

## Bežično Punjenje

### SAE J2954
- **Frekvencija:** 85 kHz
- **Klase visine:** Z1 (100-150mm), Z2 (140-210mm), Z3 (170-250mm za autobuse)
- **Lateralna tolerancija:** ±100 mm
- **Efikasnost:** 90-95%

---

## Regulatorni Okvir (EU)

### Clean Vehicles Directive (CVD)
- **2021-2025:** 45% čistih autobusa u nabavkama (vodeće zemlje)
- **2026-2030:** 65% čistih autobusa, minimum 50% zero-emission

### AFIR (Alternative Fuels Infrastructure Regulation)
- **Efektivan:** April 2024
- **TEN-T zahtevi:** Stanice svakih 120 km, min 350 kW po tački, 400 kW ukupno
- **Napomena:** Depot punjenje NIJE javno dostupno po AFIR

### CO2 Emisioni Standardi
- **2030:** 90% zero-emission prodaje gradskih autobusa
- **2035:** 100% zero-emission

### Euro 7
- **Efektivan:** 2028 za autobuse
- **NOx:** 56% strožiji limiti
- **Dodatno:** Čestice kočnica i habanje guma od 2030-2032
