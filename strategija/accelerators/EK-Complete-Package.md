# Elektrokombinacija (EK) - Complete Package

> **Za interno deljenje** | Januar 2026

---

# DEO 1: PREGLED

## Šta gradimo

**EK3** - Modularni punjač za električna vozila od 3.3 kW koji se skalira od e-bicikala do megavatnih stanica.

| Primena | Moduli | Snaga |
|---------|--------|-------|
| E-bicikl | 1 | 3.3 kW |
| Kućni punjač | 7 | 23 kW |
| DC brzi | 46 | 152 kW |
| Autobusko depo | 152 | 502 kW |
| MCS kamion | 909 | 3 MW |

**Jedan dizajn modula. Milioni jedinica. 35% niža cena.**

---

## Problem koji rešavamo

Operator autobuske flote u Srbiji uložio **1 milion evra** u 10 ABB punjača. Pokušali su da ih prilagode lokalno - hardver je radio, ali vlasnički firmware značio je da punjači stoje neupotrebljeni mesecima. Više programerskih timova je pokušalo i nije uspelo.

**1M€ uloženo. Zero kWh isporučeno.**

| Problem | EK3 Rešenje |
|---------|-------------|
| Monolitni dizajn | 3.3 kW moduli (ekstremna modularnost) |
| Ne može se popraviti lokalno | Dizajn za popravku u depou |
| Zaključan firmware | Otvorena arhitektura (JEZGRO) |
| Jedna tačka kvara | Distribuirana inteligencija (ROJ roj) |
| Visoka cena | Masovna proizvodnja jednog SKU |

---

## Tim

| Uloga | Odgovornosti |
|-------|--------------|
| **CEO** | Strategija, biznis razvoj, marketing, pravni poslovi, IP, nabavka |
| **CTO** | Hardver, firmware, softver, arhitektura proizvoda (22 godine iskustva) |

Oba osnivača: **100% posvećeni full-time**

---

## Status

| Oblast | Progres |
|--------|---------|
| Dizajn modula | ✅ Kompletan |
| Firmware | ✅ Radi (Renode emulacija) |
| Dokumentacija | ✅ Sveobuhvatna |
| Validacija kupaca | ✅ Urađena |
| Tim | ✅ Spreman |
| Aplikacije | ✅ Spremne za slanje |

---

# DEO 2: STRATEGIJA AKCELERATORA

## Ciljni programi

| Program | Investicija | Status | Zašto |
|---------|-------------|--------|-------|
| **HAX** | Do $550K | Spremni za prijavu | #1 hardverski akcelerator, rolling prijave |
| **Elemental Impact** | Do $3M | Spremni za prijavu | Kapital za deployment, fokus na zajednicu |
| **LACI** | $50-500K | Jesen 2026 | Pristup municipalnim flotama, LA Metro |

## Spremnost za HAX

| Zahtev | Status |
|--------|--------|
| Radni prototip | ✅ Urađeno |
| Validacija kupaca | ✅ Urađeno |
| 2+ suosnivača | ✅ Urađeno |
| Climate tech narativ | ✅ Urađeno |

**HAX ima rolling prijave - možemo prijaviti bilo kad.**

---

# DEO 3: PITCH DECK OUTLINE (HAX)

## Slide 1: Naslov
```
ELEKTROKOMBINACIJA
EK3: Modularna EV infrastruktura za punjenje
za flote električnih autobusa
```

## Slide 2: Problem
**€1 Milion u hardveru. Zero kWh isporučeno.**
- Operator flote u Srbiji kupio 10 ABB punjača (~€100k svaki)
- Pokušao prilagoditi firmware lokalno - NEUSPEŠNO
- Punjači stoje neupotrebljeni MESECIMA

## Slide 3: Šta smo naučili
```
MONOLITNI DIZAJN              ŠTA OPERATORI TREBAJU
────────────────              ─────────────────────
Jedna tačka kvara          →  Distribuirana otpornost
€100k po jedinici          →  Pristupačno na skali
Vlasnički firmware         →  Lokalna adaptacija
Servisno vozilo            →  Zero truck rolls
Vendor lock-in             →  Otvorena arhitektura
```

## Slide 4: Rešenje - EK3 Modul
```
JEDAN MODUL. BILO KOJA PRIMENA.

• 3.3 kW po modulu
• 200 × 320 × 44 mm
• Hot-swappable
• Isti kod od e-bicikla do MCS kamiona
```

## Slide 5: ROJ Swarm Intelligence
```
Tradicionalno:              EK3:
┌─────────┐                ┌───┬───┬───┐
│ Central │                │ M │ M │ M │
│Controller│               ├───┼───┼───┤
└────┬────┘                │ M │ M │ M │
     │                     └───┴───┴───┘
  ┌──┴──┐
  M M M M                  Svaki modul = autonoman

Controller umre = SVE STAJE    Modul umre = 0.3% gubitak
```

## Slide 6: Demo
- 7 modula se pronalaze
- Distribuirano glasanje radi
- Kill modul 4
- Mesh se automatski reformira

## Slide 7: Fleet Logistics
```
AUTOBUSI SU LOGISTIČKA MREŽA

Swap Stanica → 🚌 Bus Ruta → Depo (POPRAVKA)
                  (besplatan transport)
     ↑                              │
     └──────── 🚌 ──────────────────┘
           (nov modul se vraća)

REZULTAT: €0 transportni troškovi
```

## Slide 8: Tim
- CEO: Strategija, BD, marketing, pravno, IP
- CTO: 22 godine HW+SW iskustva

## Slide 9: IP Pozicija
- Prioritetni datum: 2. januar 2026
- 5 Invention Disclosures
- 3-patentna porodica planirana

## Slide 10: Tržišna prilika
- Globalno tržište el. autobusa: $50B+ do 2030
- Beachhead: Srbija/Balkan + EXPO 2027 Beograd

## Slide 11: Biznis model
- Prodaja modula (€150/modul na skali)
- Servisni ugovori
- Licenciranje (budućnost)

## Slide 12: Ask
- HAX partnerstvo
- 12-mesečni roadmap do customer pilota

---

# DEO 4: KHOSLA VENTURES PITCH

## Profil investitora
```
KHOSLA VENTURES
Tip:       Premier Deep Tech / Climate VC
AUM:       $15B+
Ticket:    $500K-5M (seed), do $50M (Series A)
Fokus:     Climate tech, AI, robotika, deep tech
Website:   khoslaventures.com/apply
```

## Ključni partneri
- **SVEN STROHBAND** - Managing Director, Stanford "Stanley" tim
- **VINOD KHOSLA** - Osnivač, Sun Microsystems co-founder

## Naš angle: "Linux distribuirane energije"
```
SLOJEVITA ARHITEKTURA
═══════════════════════════════════════════

┌─────────────────────────────────────────┐
│  PROPRIETARNI SLOJ (Zatvoren)           │
│  • Fleet Management System              │
│  • EK3 Hardware Design                  │
│  • Aplikacije                           │
├─────────────────────────────────────────┤
│  OPEN SOURCE SLOJ (MIT Licenca)         │
│  • EK-KOR2 RTOS                         │
│  • JEZGRO Kernel                        │
└─────────────────────────────────────────┘

Android je open-source. Google apps nisu.
Linux je open-source. Red Hat tools nisu.
EK-KOR2 je open-source. Naš hardver nije.
```

## Email template za Svena
```
Subject: Open-Source RTOS for Autonomous Energy Infrastructure

Sven,

Your work on Stanley proved autonomous systems could operate
in unstructured environments. We're building the coordination
layer that makes distributed energy infrastructure autonomous.

EK-KOR2 is an open-source RTOS for modular power electronics.
No central scheduler. Modules self-organize through potential
field gradients - like how biological swarms coordinate.

ASK: $1.5M seed to open-source EK-KOR2 and build first
certified hardware implementation.
```

---

# DEO 5: OSTALI INVESTOR PITCHEVI

## Dostupni pitch dokumenti

| Investor | Fokus | Lokacija |
|----------|-------|----------|
| Khosla Ventures | Open-source RTOS, Black Swan | `investor-pitches/01-KHOSLA-VENTURES.md` |
| Andrej Karpathy | AI/ML angle | `investor-pitches/02-ANDREJ-KARPATHY.md` |
| Lowercarbon Capital | Climate focus | `investor-pitches/03-LOWERCARBON-CAPITAL.md` |
| Tony Fadell | Hardware legend | `investor-pitches/04-TONY-FADELL.md` |
| Lux Capital | Deep tech | `investor-pitches/05-LUX-CAPITAL.md` |
| Ramez Naam | Energy transition | `investor-pitches/06-RAMEZ-NAAM.md` |
| EIT InnoEnergy | EU energy | `investor-pitches/07-EIT-INNOENERGY.md` |
| South Central Ventures | Regional | `investor-pitches/08-SOUTH-CENTRAL-VENTURES.md` |
| Credo Ventures | CEE focus | `investor-pitches/09-CREDO-VENTURES.md` |
| GV (Google Ventures) | Tech giant | `investor-pitches/10-GV-GOOGLE-VENTURES.md` |
| NCR Voyix | Strategic | `investor-pitches/11-NCR-VOYIX.md` |

## Custom propozali

| Dokument | Namena |
|----------|--------|
| EK-Proposal-Jovan-Radak | Individualni investor |
| EK-Proposal-MikroElektronika | Strateški partner |
| EK-Proposal-Milorad-Sekulovic | Individualni investor |

---

# DEO 6: KLJUČNE INOVACIJE

## 1. ROJ Swarm Intelligence
- Nema centralnog kontrolera
- Moduli se koordiniraju peer-to-peer
- Raft-based leader election (<100ms failover)
- Droop control + AI optimizacija

## 2. Fleet Logistics
- Autobusi nose defektne module do depoa
- Zero truck rolls
- O(1) skaliranje

## 3. Ekstremna modularnost
- 3.3 kW → 3 MW iz istog modula
- Jedan SKU za masovnu proizvodnju
- 0.3% gubitak ako jedan modul otkaže

## 4. Cirkularnost
- Dizajn za popravku
- 15-25 godina životnog veka modula
- Zero e-waste

---

# DEO 7: SLEDEĆI KORACI

## Odmah
1. ✅ Pripremiti materijale (URAĐENO)
2. ⬜ Poslati HAX aplikaciju
3. ⬜ Poslati Elemental aplikaciju

## Q1 2026
- Kontaktirati LACI za Cohort 13
- Build relationships sa TEP članovima

## Q2-Q3 2026
- HAX program (ako primljeni)
- Pripremiti LACI Fall 2026 aplikaciju

---

# DEO 8: KONTAKT I RESURSI

## Fajlovi
| Resurs | Lokacija |
|--------|----------|
| HAX profil | `accelerators/hax/profile.md` |
| Elemental profil | `accelerators/elemental-impact/profile.md` |
| LACI profil | `accelerators/laci/profile.md` |
| Customer validation | `accelerators/hax/customer-validation.md` |
| Tehničke specifikacije | `tehnika/inzenjersko/en/SPECIFICATIONS.md` |
| Patent dokumenti | `patent/01-IP-FOUNDATION/` |
| Investor pitchevi | `patent/04-EXECUTION/investor-pitches/` |

---

*Dokument generisan: 19. januar 2026*
