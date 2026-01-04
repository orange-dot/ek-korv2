# Prijava Izuma: Jedinstvena Modularna Power Arhitektura

## Administrativni Podaci

| Polje | Vrednost |
|-------|----------|
| ID Prijave | EK-2026-001 |
| Datum Prijave | 2026-01-02 |
| Pronalazač(i) | Bojan Janjatović |
| Email | bojan.janjatovic@gmail.com |
| Adresa | Vojislava Ilica 8, Kikinda, Severni Banat, Srbija |
| Datum Nastanka Ideje | 2026-01-02 |
| Svedoci | Marija Janjatović |

### Poreklo Izuma
Inspiracija: Razgovor sa prijateljem o problemima punjenja autobusa u Srbiji (depot sistem). Neko je pokušao da kopira ABB uređaj - uočen problem sa održavanjem i pouzdanošću postojećih rešenja.

---

## 1. Naziv Izuma

**Jedinstvena Modularna Power Arhitektura za Skalabilne Sisteme za Punjenje Električnih Vozila Korišćenjem Standardizovanih Hot-Swappable Power Modula**

Alternativni nazivi:
- Blade-Format Power Modul Sistem za Infrastrukturu Punjenja EV
- Granularni Modularni DC Brzi Sistem za Punjenje sa Robotskom Servisabilnošću

---

## 2. Tehnička Oblast

```
□ Power Elektronika
□ Infrastruktura za Punjenje Električnih Vozila
□ Modularni Dizajn Sistema
□ Robotika/Automatizacija
□ Prediktivno Održavanje
```

---

## 3. Opis Problema

### 3.1 Trenutno Stanje Tehnike

```
Današnji EV punjači koriste jedan od dva pristupa:

PRISTUP A: Monolitni dizajn
• Ceo power stage u jednom kućištu
• Kvar = kompletan punjač van funkcije
• Popravka zahteva tehničara na licu mesta
• Tipičan downtime: 2-14 dana

PRISTUP B: Grubi moduli (10-50 kW po modulu)
• 3-10 modula po punjaču
• Kvar jednog = 10-33% gubitak kapaciteta
• Moduli su teški (10-30 kg), ručna zamena
• Različiti moduli za različite snage punjača
```

### 3.2 Problemi sa Trenutnim Pristupima

```
1. NAGLI PAD POUZDANOSTI
   • J.D. Power 2025: 84% stopa uspešnosti
   • ChargerHelp 2025: 71% uspeh iz prvog pokušaja
   • Degradacija od 15 poena nakon 3 godine

2. KOMPLEKSNOST ODRŽAVANJA
   • Dolazak servisnog vozila za svaku popravku: €200-500
   • Tehničar mora biti specijalizovan
   • Prosečno vreme popravke: 3-5 dana

3. KOŠMAR SA ZALIHAMA
   • Različiti moduli za svaku snagu punjača
   • Mnogo SKU-ova za održavanje
   • Traženje rezervnih delova = downtime

4. GRACEFUL DEGRADATION - NE POSTOJI
   • 1 od 5 modula otkaže = 20% pad
   • Sistem često potpuno pada umesto degradacije
```

---

## 4. Sažetak Izuma

### 4.1 Osnovni Koncept

```
JEDAN STANDARDNI MODUL (EK3, 3 kW) ZA SVE PRIMENE:

• E-bike punjač: 1 modul
• Kućni punjač: 3-7 modula
• DC Fast 50 kW: 17 modula
• Autoput 350 kW: 117 modula
• Autobusni depo 1 MW: 334 modula
• MCS 3 MW: 1000 modula

ISTI MODUL, RAZLIČITA KOLIČINA
```

### 4.2 Ključni Elementi Inovacije

```
ELEMENT 1: Ekstremna Granularnost
─────────────────────────────────────────────────────────────
• 3 kW je najmanja praktična jedinica
• Omogućava 0.3% granularnost za 1 MW sistem
• Kvar jednog = zanemarljiv uticaj

ELEMENT 2: Blade Server Form Factor
─────────────────────────────────────────────────────────────
• 1U visina (44.45 mm) za standardni 19" rack
• Blind-mate konektori (ne treba vizuelni kontakt)
• Tačke za hvatanje kompatibilne sa robotima
• Hot-swap bez prekida rada sistema

ELEMENT 3: Distribuirana Inteligencija
─────────────────────────────────────────────────────────────
• Svaki modul ima lokalni AI procesor
• Moduli komuniciraju peer-to-peer (swarm)
• Nema single point of failure u kontroli
• Plug & play - modul se sam konfiguriše

ELEMENT 4: 3PAR-Inspirisana Distribucija Opterećenja
─────────────────────────────────────────────────────────────
• Wide striping: opterećenje preko SVIH modula
• Distributed sparing: nema hot-spare, rezerva u svakom
• Thin provisioning: neaktivni moduli u sleep mode
• Ravnomerno starenje svih modula
```

---

## 5. Detaljan Opis

### 5.1 Dizajn Fizičkog Modula

```
SPECIFIKACIJE EK3 MODULA:
═══════════════════════════════════════════════════════════════

Dimenzije:
• Širina: 100 mm (4 modula po 19" redu)
• Dubina: 300 mm
• Visina: 44.45 mm (1U)
• Masa: 1.8 kg (omogućava robotsko rukovanje)

Snaga:
• Ulaz: 400V DC (sa centralnog PFC)
• Izlaz: 50-500V DC (kompatibilno sa vozilima)
• Snaga: 3 kW kontinualno, 3.3 kW vršno
• Efikasnost: >97%

Termalno:
• Hlađenje: Integrisani ventilator + vapor chamber
• Maksimalna ambijentalna: 50°C
• Derating: Nema do 45°C

Konektori (zadnji panel):
• Napajanje: Anderson SBS50 ili ekvivalent (blind-mate)
• Podaci: 48-pinski blade konektor
  - CAN-FD (primarna komunikacija)
  - Ethernet (dijagnostika, firmware update)
  - I2C (senzorska magistrala)
  - PWM sync (koordinacija interleaving-a)

Mehaničke karakteristike:
• Šinske vođice za umetanje u rack
• Tačke za robotski hvat (2× M6 navojni, gornja površina)
• Cam lock za sigurno držanje
• LED statusni indikator (RGB)
```

### 5.2 Dizajn Rack Sistema

```
STANDARDNA RACK KONFIGURACIJA:
═══════════════════════════════════════════════════════════════

Tip rack-a: Standardni 19" serverski rack, 42U visina

Raspored:
• U1-U3: DC bus distribucija, zaštita, osigurači
• U4-U6: Backplane kontroler, CAN-FD hub, AI edge
• U7-U42: Power moduli (36U × 4 širine = 144 slota)
         Praktično popunjavanje: 84 modula (21 red × 4)

Kapacitet po rack-u: 84 × 3 kW = 252 kW

Karakteristike backplane-a:
• DC distribucija napajanja (800V magistrala)
• Podatkovna mreža (star topologija CAN-FD)
• Detekcija prisustva modula
• Praćenje temperature po slotu
• Sekvencijalna kontrola uključivanja
```

### 5.3 Arhitektura Skaliranja

```
PRIMERI KONFIGURACIJE:
═══════════════════════════════════════════════════════════════

KUĆNI PUNJAČ (22 kW):
• 8 modula u desktop kućištu
• Rack nije potreban
• Isti modul kao MW stanica

DC BRZI (150 kW):
• 50 modula
• 1 standardni rack
• Spreman za robota ali ručna zamena OK

AUTOPUTNA STANICA (350 kW):
• 117 modula
• 2 rack-a jedan do drugog
• Preporučena robotska zamena

AUTOBUSNI DEPO (1 MW):
• 334 modula
• 4 rack-a
• Neophodna robotska zamena
• Integrisano sa zamenom baterija

MCS STANICA (3 MW):
• 1000 modula
• 12 rack-ova
• 2 robota na šinama
• Graceful degradation na 2.7 MW sa 10% otkaza
```

### 5.4 Sistem za Robotsku Zamenu

```
SPECIFIKACIJE ROBOTA:
═══════════════════════════════════════════════════════════════

Tip: Posebno dizajniran robotski sistem (NIJE gotov UR/KUKA)
Dizajn: Namenski napravljen za održavanje EV punjenja
Vidi takođe: EK-2026-005 (Koordinisani Dvo-Robotski Sistem)

Zahtevi:
• Nosivost: ≥10 kg (modul 1.8 kg + hvataljka)
• Domet: ≥1.3 m
• Ponovljivost: ≤0.1 mm
• Brzina: Do 1 m/s (bezbednosno ograničeno)

Hvataljka:
• Prilagođeni krajnji efektor
• Zahvata M6 tačke za hvatanje na modulu
• Senzor sile za umetanje
• Verifikacija pozicije

SEKVENCA ZAMENE (40 sekundi ukupno):
═══════════════════════════════════════════════════════════════

T+0s:   Komanda primljena (ID modula, lokacija)
T+2s:   Planiranje putanje robota
T+5s:   Robot pozicioniran na ciljni slot
T+8s:   Hvataljka zahvata tačke za hvatanje modula
T+10s:  Otpuštanje cam lock-a, početak ekstrakcije modula
T+15s:  Modul potpuno izvađen (300mm hod)
T+18s:  Robot rotira ka "izlaznoj" kutiji
T+20s:  Modul deponovan u kutiju za neispravne
T+24s:  Robot se pomera ka skladištu svežih modula
T+27s:  Robot hvata sveži modul
T+30s:  Robot se vraća na ciljni slot
T+34s:  Početak umetanja modula
T+38s:  Aktiviranje cam lock-a
T+39s:  Backplane handshake - modul ONLINE
T+40s:  Robot se vraća u početnu poziciju
```

---

## 6. Prednosti u Odnosu na Prethodno Stanje Tehnike

```
PREDNOST 1: Ekstremna Pouzdanost
─────────────────────────────────────────────────────────────
Prethodno stanje: 1 od 5 modula otkaže = 20% gubitak kapaciteta
Ovaj izum: 1 od 334 modula otkaže = 0.3% gubitak kapaciteta
Poboljšanje: 67× bolja granularnost

PREDNOST 2: Robotska Servisabilnost
─────────────────────────────────────────────────────────────
Prethodno stanje: Ručna zamena, teški moduli, potreban tehničar
Ovaj izum: Robotska zamena za 40 sekundi, moduli od 1.8 kg
Poboljšanje: Od dana do sekundi, bez ljudskog učešća

PREDNOST 3: Univerzalni Modul
─────────────────────────────────────────────────────────────
Prethodno stanje: Različit modul za svaku klasu snage
Ovaj izum: Isti modul od 3 kW do 3 MW
Poboljšanje: Jedan SKU za sve zalihe

PREDNOST 4: Distribuirana Rezerva
─────────────────────────────────────────────────────────────
Prethodno stanje: Dedicirani hot-spare moduli koji sede neaktivni
Ovaj izum: Rezervni kapacitet distribuiran preko svih modula
Poboljšanje: Bolja iskorišćenost, kontinuirano testiranje

PREDNOST 5: Ekonomija Masovne Proizvodnje
─────────────────────────────────────────────────────────────
Prethodno stanje: Mali obim svakog tipa modula
Ovaj izum: Jedan dizajn, milioni jedinica
Poboljšanje: 35%+ smanjenje troškova pri velikoj skali
```

---

## 7. Poznato Prethodno Stanje Tehnike

```
SRODNI PATENTI ZA ISTRAŽIVANJE:
═══════════════════════════════════════════════════════════════

1. Blade server patenti (IBM, HP, Dell)
   - Mehanički form factor
   - ALI: Nije za power elektroniku

2. 3PAR storage patenti (HP)
   - Chunklet arhitektura
   - ALI: Za skladištenje podataka, ne za napajanje

3. Tesla Supercharger patenti
   - Modularni pristup
   - ALI: Veći moduli, nije spremno za robote

4. ABB modularni punjač patenti
   - Hot-swap koncept
   - ALI: 25-50 kW moduli, ne 3 kW

5. Battery swap patenti (NIO, Aulton)
   - Robotska zamena
   - ALI: Za baterije, ne za module punjača

DIFERENCIJACIJA:
─────────────────────────────────────────────────────────────
Naša kombinacija:
• Ekstremna granularnost (3 kW)
• Blade server form factor
• Dizajn spreman za robote
• 3PAR-inspirisana distribucija opterećenja
• Integrisano sa stanicom za zamenu baterija

...izgleda da je NOVA
```

---

## 8. Potencijalni Patentni Zahtevi (Nacrt)

```
NEZAVISNI ZAHTEV 1 (Sistem):
Modularni sistem za punjenje električnih vozila koji sadrži:
• Više identičnih power modula, od kojih svaki ima nazivnu
  izlaznu snagu između 1 kW i 5 kW;
• Rack-montirano kućište konfigurisano da primi navedene
  power module u hot-swappable konfiguraciji;
• Backplane koji obezbeđuje napajanje i podatkovnu konekciju
  za svaku poziciju modula;
• Pri čemu je sistem skalabilan od 3 kW do 3 MW variranjem
  broja navedenih identičnih power modula.

NEZAVISNI ZAHTEV 2 (Metoda):
Metoda za održavanje sistema za punjenje električnih vozila
koja sadrži:
• Detekciju degradacije u prvom power modulu korišćenjem
  prediktivne analitike;
• Zakazivanje zamene navedenog prvog power modula tokom
  planiranog punjenja vozila;
• Robotsko vađenje navedenog prvog power modula bez
  prekidanja operacija punjenja;
• Robotsko umetanje zamenskog power modula;
• Pri čemu je ukupno vreme zamene manje od 120 sekundi.

ZAVISNI ZAHTEVI:
• ...pri čemu svaki modul ima masu manju od 3 kg
• ...pri čemu moduli komuniciraju putem CAN-FD u peer-to-peer
  konfiguraciji
• ...pri čemu je rezervni kapacitet distribuiran preko svih aktivnih
  modula umesto dediciranih rezervnih modula
• ...pri čemu je robotski sistem integrisan sa stanicom za zamenu
  baterija za električne autobuse
```

---

## 9. Status Razvoja

```
□ Samo koncept (trenutno)
□ Izgrađen dokaz koncepta
□ Prototip testiran
□ Pilot proizvodnja
□ Komercijalna proizvodnja
```

---

## 10. Komercijalni Potencijal

```
VELIČINA TRŽIŠTA:
• Globalno tržište EV punjenja: $50B do 2030
• DC brzi segment punjenja: $20B
• Adresabilno sa ovom tehnologijom: $5-10B

KONKURENTSKA PREDNOST:
• Jedini modularni sistem sa 3 kW granularnošću
• Jedini sistem dizajniran za robotsku zamenu
• 35% niža cena pri velikoj skali
• 99.9% uptime naspram industrijskog proseka 95%

POTENCIJALNI KORISNICI LICENCE:
• Veliki proizvođači punjača (ABB, Siemens, Tritium)
• Operateri flota (autobuske kompanije, logistika)
• Komunalna preduzeća koja grade infrastrukturu punjenja
```

---

## 11. Potpisi

```
PRONALAZAČ(I):

Ime: _________________________
Potpis: ______________________
Datum: _______________________


SVEDOK (ne-pronalazač koji razume prijavu):

Ime: _________________________
Potpis: ______________________
Datum: _______________________
```

---

## Napomene za Patentnog Zastupnika

```
KLJUČNE TAČKE ZA NAGLAŠAVANJE:
1. Nivo granularnosti (3 kW) je nov za EV punjenje
2. Kombinacija blade formata + robotska zamena je nova
3. 3PAR koncepti primenjeni na napajanje = nova tehnička oblast
4. Integracija sa autobuskom flotom za logistiku je jedinstvena

POTENCIJALNI IZAZOVI:
1. Prethodno stanje tehnike u blade serverima (ali ne za napajanje)
2. Prethodno stanje tehnike u modularnim punjačima (ali veći moduli)
3. Softverski/AI aspekti (fokus na tehnički efekat)

PREPORUČENI PRISTUP:
1. Najpre prijaviti široki sistemski zahtev
2. Prijaviti zahtev za metodu robotske zamene
3. Razmotriti zasebnu prijavu za integraciju sa autobuskom flotom
```
