# ELEKTROKOMBINACIJA - Predlog Tehničke Saradnje

**Za:** MikroElektronika d.o.o., Beograd
**Od:** Elektrokombinacija, Kikinda
**Datum:** Januar 2026
**Kontakt forma:** https://www.mikroe.com/design-service

---

## 1. KO SMO MI

**Elektrokombinacija** razvija modularnu infrastrukturu za punjenje električnih autobusa.

```
PROJEKAT: EK3 - Modularni Power Modul
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 3.3kW power conversion modul
• Input: 3-phase 400VAC
• Output: 200-920VDC
• Kontroler: STM32G474 (Cortex-M4F, 170MHz)
• Komunikacija: CAN-FD @ 5 Mbps
• Hot-swappable dizajn
• Skalira od 3kW do 3MW (1-909 modula)

PRIMENA:
• Punjači za električne autobuse
• DC fast charging stanice
• V2G (Vehicle-to-Grid) sistemi
```

**Faza projekta:** Pre-seed, tražimo EUR 500K investiciju, prototip u razvoju.

**Lokacija:** Kikinda, Srbija (osnivanje NL B.V. u toku)

---

## 2. ZAŠTO MIKROE?

MikroElektronika je lider u embedded development tools-ima. Vaši proizvodi su relevantni za naš projekat:

### Šta nam treba

| Kategorija | Potreba | MikroE Proizvod |
|------------|---------|-----------------|
| **Development** | STM32G4 dev board | Clicker 2 for STM32 / Fusion for STM32 |
| **CAN-FD** | CAN komunikacija | CAN FD Click / CAN FD 2 Click |
| **Power Monitoring** | Struja/napon merenje | Current Click / Volt Click |
| **Thermal** | Termalni senzori | Thermostat Click / Temp&Hum Click |
| **Prototyping** | Click boards ecosystem | Razni Click moduli |

### Zašto baš vi

```
✓ Srpska firma - razumemo se
✓ STM32 podrška - naš target MCU
✓ Click ekosistem - brzo prototyping
✓ NECTO Studio - unified development
✓ Kvalitet - poznati ste globalno
✓ Blizu smo - Kikinda-Beograd
```

---

## 3. PREDLOG SARADNJE

### Opcija A: Nabavka opreme (Minimalno)

```
SHOPPING LIST - Za početak razvoja
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Development Boards:
• 2x Fusion for STM32 v8          ~$200
• 2x Clicker 2 for STM32          ~$60

Click Boards:
• 2x CAN FD Click                 ~$50
• 2x CAN FD 2 Click               ~$50
• 2x Current 6 Click              ~$40
• 2x Volt 2 Click                 ~$40
• 2x Thermostat 4 Click           ~$40
• 2x ADC 10 Click                 ~$30
• 1x UART I2C/SPI Click           ~$20

Accessories:
• Kablovi, adaptori, itd.         ~$50
─────────────────────────────────────────────────────
PROCENA:                          ~$580-700

Pitanje: Da li imate popust za startupe / R&D projekte?
```

### Opcija B: Tehnička konsultacija

```
OBLASTI GDE BI NAM SAVET ZNAČIO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. STM32G474 BEST PRACTICES
   • CAN-FD konfiguracija za 5 Mbps
   • ADC setup za power monitoring
   • Timer konfiguracija za PWM control
   • Low-power modes za standby

2. EMC/EMI CONSIDERATIONS
   • PCB layout preporuke
   • Filtering za power stage proximity
   • CAN bus termination u multi-node setup

3. CLICK BOARD INTEGRATION
   • Koji Click moduli za naš use case
   • Custom Click board mogućnost?

Pitanje: Da li nudite konsultantske usluge?
         Ili imate partnere koje preporučujete?
```

### Opcija C: Partnerstvo (Ako vas zanima)

```
POTENCIJALNO INTERESANTNO ZA MIKROE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CASE STUDY
   • "MikroE tools used in EV charging development"
   • Marketing materijal za vas
   • Mi dobijamo kredibilitet

2. CO-DEVELOPMENT
   • Custom Click board za power module control?
   • "EK3 Click" - CAN-FD + current sensing + thermal
   • Vi prodajete globalno, mi koristimo

3. SHOWCASE
   • Demo naših uređaja sa vašim logo-om
   • Zajednički nastup na sajmovima

4. EQUITY / INVESTMENT
   • Ako vas zanima EV charging prostor
   • Mali udeo, strateška vrednost za oba

Ovo su samo ideje - otvoreni smo za razgovor
o bilo čemu što ima smisla za obe strane.
```

---

## 4. O PROJEKTU - TEHNIČKI DETALJI

### EK3 Modul Arhitektura

```
┌─────────────────────────────────────────────────────────────┐
│                    EK3 POWER MODULE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │   VIENNA    │   │    LLC      │   │   STM32G4   │       │
│  │    PFC      │──▶│   DC-DC     │──▶│  CONTROL    │       │
│  │  (400VAC)   │   │ (SiC MOSFET)│   │  (CAN-FD)   │       │
│  └─────────────┘   └─────────────┘   └─────────────┘       │
│                                                             │
│  SPECS:                                                     │
│  • Power: 3.3 kW                                            │
│  • Input: 3-phase 400VAC                                    │
│  • Output: 200-920 VDC                                      │
│  • Efficiency: >96%                                         │
│  • Size: 200 × 320 × 44mm                                   │
│  • Weight: ~3.5 kg                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Software Stack

```
EK-KOR2 RTOS (Open Source, MIT License)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Distributed coordination bez centralnog schedulera
• Potential field scheduling
• CAN-FD messaging protocol
• Self-healing mesh topology
• Dual implementation: C + Rust

Target: STM32G474 (vaš Fusion board je idealan za dev)
```

### Zašto STM32G474?

```
✓ Mixed-signal capabilities (ADC, DAC, Comparators)
✓ HRTIM za precision PWM
✓ Math accelerator (CORDIC, FMAC)
✓ CAN-FD native support
✓ 170 MHz Cortex-M4F
✓ MikroE ima odličnu podršku za STM32
```

---

## 5. TIM

```
FOUNDER:
Bojan Janjatovic
• 15 godina enterprise software (Toshiba, NCR Voyix)
• RTOS development (EK-KOR2, JEZGRO kernels)
• Power electronics hobbyist → ozbiljan projekat

ADVISORS (u pregovorima):
• Dr. Jovan Radak - PhD, senzori, automotive (Nemačka)
• Milorad Sekulović - inženjer, USA

FINANSIRANJE:
• Target: EUR 500K pre-seed (EIT InnoEnergy)
• Status: Aplikacija u pripremi
```

---

## 6. ŠTA TRAŽIMO OD VAS

### Minimum (sigurno):
- [ ] Kupovina dev boards i Click modula
- [ ] Eventualni startup popust?

### Bonus (ako ima interesa):
- [ ] Tehnička konsultacija (plaćamo)
- [ ] Preporuka za PCB/EMC eksperte
- [ ] Case study saradnja

### Moonshot (ako vas zanima):
- [ ] Custom Click board development
- [ ] Strateško partnerstvo
- [ ] Co-marketing

---

## 7. KONTAKT

**Bojan Janjatovic**
Founder & CTO, Elektrokombinacija

Email: bojan.janjatovic@gmail.com
Lokacija: Kikinda, Srbija
Web: elektrokombinacija.com

---

## 8. APPENDIX: MikroE Proizvodi Koje Razmatramo

### Development Boards

| Proizvod | Cena | Zašto nam treba |
|----------|------|-----------------|
| Fusion for STM32 v8 | ~$99 | Main dev platform, Click slots |
| Clicker 2 for STM32 | ~$29 | Compact testing |
| UNI Clicker | ~$19 | Quick experiments |

### Click Boards

| Click | Cena | Primena |
|-------|------|---------|
| CAN FD Click | ~$24 | Inter-module communication |
| CAN FD 2 Click | ~$24 | Backup/testing |
| Current 6 Click | ~$19 | Output current monitoring |
| Volt 2 Click | ~$19 | Voltage monitoring |
| Thermostat 4 Click | ~$19 | Thermal protection |
| ADC 10 Click | ~$15 | High-res measurements |

### Software

| Proizvod | Licenca | Zašto |
|----------|---------|-------|
| NECTO Studio | Free | Unified IDE, Click integration |
| mikroSDK | Free | HAL za brži development |

---

*Dokument pripremljen: Januar 2026*
*Za slanje preko: https://www.mikroe.com/design-service*
