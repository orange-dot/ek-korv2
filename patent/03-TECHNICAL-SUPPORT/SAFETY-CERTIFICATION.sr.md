# Zahtevi za Bezbednost i Sertifikaciju

**Verzija dokumenta:** 1.0
**Datum:** 2026-01-03
**Autor:** Bojan Janjatovic
**Email:** bojan.janjatovic@gmail.com
**Adresa:** Vojislava Ilica 8, Kikinda, Severni Banat, Serbia

---

## 1. Sazetak

```
SERTIFIKACIJA - PREGLED
═══════════════════════════════════════════════════════════════

Sistem se sastoji od vise komponenti koje zahtevaju razlicite
sertifikacije:

┌─────────────────────────────────────────────────────────────┐
│ KOMPONENTA          │ KLJUCNI STANDARDI                     │
├─────────────────────┼───────────────────────────────────────┤
│ EK3 Power Module    │ IEC 62477, IEC 61851, CE/UKCA        │
│ Charging Station    │ IEC 61851, ISO 15118, EN 50178       │
│ Robot (Swap)        │ ISO 10218, EN ISO 13849, CE          │
│ Control System      │ IEC 62443 (cybersecurity)            │
│ Full System         │ Site-specific permits                 │
└─────────────────────────────────────────────────────────────┘

PRIORITET ZA MVP:
1. CE marking za EK3 module (pristup EU trzistu)
2. IEC 61851 usaglasenost za charging funkciju
3. Osnovna bezbednost robota (za demonstraciju)

PUNA SERTIFIKACIJA: 12-18 meseci, €50-150k budzet
═══════════════════════════════════════════════════════════════
```

---

## 2. Regulatorni Okvir

### 2.1 EU Trziste (Primarni Cilj)

```
EU REGULATORNI OKVIR
═══════════════════════════════════════════════════════════════

1. LOW VOLTAGE DIRECTIVE (LVD) 2014/35/EU
   • Primenjuje se na: elektricnu opremu 50-1000V AC, 75-1500V DC
   • EK3 modul: DA (650V DC ulaz)
   • Zahtev: CE oznaka

2. EMC DIRECTIVE 2014/30/EU
   • Elektromagnetna kompatibilnost
   • EK3 modul: DA
   • Zahtev: CE oznaka

3. MACHINERY DIRECTIVE 2006/42/EC
   • Primenjuje se na: robotsku swap stanicu
   • Zahtev: CE oznaka, Declaration of Conformity

4. RADIO EQUIPMENT DIRECTIVE (RED) 2014/53/EU
   • Ako se koristi WiFi/Bluetooth
   • EK3 modul: DA (ESP32 ima radio)
   • Zahtev: CE oznaka

5. ROHS DIRECTIVE 2011/65/EU
   • Ogranicenje opasnih supstanci
   • Sva elektronika: DA
   • Zahtev: Izjava o usaglasenosti

6. WEEE DIRECTIVE 2012/19/EU
   • Rukovanje otpadnom elektronikom
   • Zahtev: Registracija, sema povracaja
```

### 2.2 Specificno za Punjenje EV

```
EV CHARGING STANDARDI (EU)
═══════════════════════════════════════════════════════════════

IEC 61851 - EV Conductive Charging System
─────────────────────────────────────────
Part 1: Opsti zahtevi
Part 21: DC charging zahtevi
Part 23: DC charging stanica
Part 24: Digitalna komunikacija (ISO 15118)

→ OBAVEZNO za bilo koji EV charger

IEC 62196 - Plugs, Sockets, Connectors
─────────────────────────────────────────
Part 1: Opsti zahtevi
Part 3: DC konektori (CCS, CHAdeMO)

→ Ako koristimo standardne konektore (verovatno CCS2)

ISO 15118 - Vehicle to Grid Communication
─────────────────────────────────────────
Part 1: Opste informacije
Part 2: Mrezni/aplikacioni protokol
Part 3: Fizicki/data link sloj
Part 20: 2. generacija mreznog sloja

→ Za smart charging / V2G funkcionalnost

EN 50549 - Grid Connection Requirements
─────────────────────────────────────────
• Kvalitet napajanja
• Funkcije podrske mreze
• Fault ride-through

→ Zahteva lokalni grid operator
```

### 2.3 UK Trziste (Post-Brexit)

```
UK SPECIFICNO
═══════════════════════════════════════════════════════════════

UKCA Marking (zamenjuje CE u UK)
• Slicni tehnicki zahtevi
• Posebna procena usaglasenosti
• UK Approved Body (ne EU Notified Body)

Vremenska linija:
• CE prihvacen do Dec 2025 (mozda produzeno)
• Zatim potrebna UKCA

Strategija:
• Dizajn za CE (EU)
• UKCA kao dodatak (minimalni dodatni napor)
```

---

## 3. Bezbednosni Standardi po Komponenti

### 3.1 EK3 Power Module

```
EK3 MODULE - BEZBEDNOSNI STANDARDI
═══════════════════════════════════════════════════════════════

PRIMARNI: IEC 62477-1
"Safety requirements for power electronic converter systems"
─────────────────────────────────────────────────────────────

Opseg:
• Power electronics oprema
• Bidirekciona konverzija energije
• Do 1000V AC / 1500V DC

Kljucni Zahtevi:
□ Elektricna bezbednost (zastita od strujnog udara)
□ Termalna bezbednost (prevencija pozara)
□ Mehanicka bezbednost (kuciste)
□ Koordinacija izolacije
□ Creepage/clearance rastojanja
□ Zastitno povezivanje
□ Oznacavanje i dokumentacija

Klasifikacija (prema IEC 62477):
• OVERVOLTAGE CATEGORY: OVC III (industrijsko)
• POLLUTION DEGREE: PD2 (neprovodljivo zagadjenje)
• PROTECTION CLASS: Class I (zastitno uzemljenje)

Potrebni Testovi:
□ Dielektricna cvrstoca (hipot)
□ Otpor izolacije
□ Kontinuitet zastitnog povezivanja
□ Merenje struje dodira
□ Termalni test (preopterecenje)
□ Testovi abnormalnog rada


SEKUNDARNI: IEC 61851-23
"DC charging station"
─────────────────────────────────────────────────────────────

Dodatni zahtevi specificni za EV punjenje:
□ Nadgledanje izolacije
□ Zastita od zemljospoja
□ Funkcija hitnog zaustavljanja
□ Interlock konektora
□ Sekvenca operacija


EMC: CISPR 32 / EN 55032
─────────────────────────────────────────────────────────────

Class A (industrijski) limiti:
• Condukovane emisije: 150 kHz - 30 MHz
• Radijacione emisije: 30 MHz - 1 GHz

Imunitet prema EN 61000-4-x seriji:
□ ESD (4-2)
□ Radijacioni imunitet (4-3)
□ EFT/Burst (4-4)
□ Surge (4-5)
□ Condukovani imunitet (4-6)
□ Magnetno polje mrezne frekvencije (4-8)
□ Propadi/prekidi napona (4-11)
```

### 3.2 Stanica za Punjenje (Sistemski Nivo)

```
STANICA ZA PUNJENJE - BEZBEDNOST
═══════════════════════════════════════════════════════════════

IEC 61851-1 (Opsti Zahtevi)
─────────────────────────────────────────────────────────────

Nacini punjenja:
• Mode 4: DC punjenje sa eksternim punjacem

Bezbednosne funkcije:
□ Nadgledanje kontinuiteta zastitnog uzemljenja
□ Nadgledanje izolacije (DC strana)
□ Detekcija rezidualne struje
□ Zastita od prekostruje
□ Zastita od prenapona
□ Hitno zaustavljanje
□ Interlock ventilacije (ako je zatvoreno)

Zahtevi sekvence:
□ Bezbednosne provere pre punjenja
□ Test izolacije pre povezivanja
□ Kontrolisano iskljucenje
□ Rukovanje greskama


IEC 61439-7
"Low-voltage switchgear - Busbar trunking systems"
─────────────────────────────────────────────────────────────

Ako stanica ima razvodnu tablu:
□ Granice porasta temperature
□ Izdrzljivost kratkog spoja
□ Koordinacija izolacije


POZARNA BEZBEDNOST
─────────────────────────────────────────────────────────────

EN 13501-1: Pozarna klasifikacija materijala
• Materijali kucista: min Class B (ogranicena zapaljivost)
• Ili adekvatno zadrzavanje pozara

Lokalni pozarni propisi:
• Zahtevi za sprinklere
• Detekcija pozara
• Evakuacioni izlazi
• Zavisi od lokacije instalacije
```

### 3.3 Bezbednost Robota (Swap Stanica)

```
BEZBEDNOST ROBOTA - KRITICNO
═══════════════════════════════════════════════════════════════

ISO 10218-1:2011
"Robots and robotic devices - Safety requirements - Part 1: Robots"
─────────────────────────────────────────────────────────────

Primenjuje se na: Industrijsku robotsku ruku

Zahtevi:
□ Funkcija hitnog zaustavljanja (Category 0 ili 1)
□ Funkcija zastitnog zaustavljanja
□ Ogranicenje brzine i sile
□ Ogranicenje osa (softversko i hardversko)
□ Enabling device (tropozicioni)
□ Bezbednost pendant-a
□ Zastita singularne tacke


ISO 10218-2:2011
"Part 2: Robot systems and integration"
─────────────────────────────────────────────────────────────

Primenjuje se na: Kompletnu robotsku celiju (robot + stanica)

Zahtevi:
□ Procena rizika (obavezna)
□ Zastita (ograde, senzori, interloci)
□ Dizajn rasporeda
□ Verifikacija instalacije
□ Informacije za korisnika


EN ISO 13849-1
"Safety of machinery - Safety-related parts of control systems"
─────────────────────────────────────────────────────────────

Performance Levels (PL):
• PL a: najnizi
• PL e: najvisi

Za robotsku swap stanicu:
• Hitno zaustavljanje: PL d minimum
• Interlock sigurnosnih vrata: PL c minimum
• Detekcija prisustva: PL c minimum

Kategorije:
• Category 3: detekcija greske, tolerancija jedne greske
• Category 4: detekcija greske, akumulirane greske


IEC 62443
"Industrial automation and control systems security"
─────────────────────────────────────────────────────────────

Cybersecurity za kontrolne sisteme:
□ Security levels (SL 1-4)
□ Zone i konduite
□ Bezbednosni zahtevi
□ Bezbednost komponenti
```

### 3.4 Funkcionalna Bezbednost

```
FUNKCIONALNA BEZBEDNOST (ako je potrebno)
═══════════════════════════════════════════════════════════════

IEC 61508
"Functional safety of E/E/PE safety-related systems"
─────────────────────────────────────────────────────────────

SIL (Safety Integrity Level):
• SIL 1: najnizi
• SIL 4: najvisi

Za EK3 sistem:
• SIL 1 verovatno dovoljan za vecinu funkcija
• SIL 2 mozda za neke kriticne (e-stop, izolacija)

Napomena:
• Puna SIL usaglasenost je SKUPA
• Alternativa: EN ISO 13849 (PL nivoi)
• Konsultovati safety inzenjera


IEC 61511 (Process sector) - verovatno N/A
IEC 62061 (Machinery) - alternativa za 13849
```

---

## 4. Put do Sertifikacije

### 4.1 Samoizjava vs Treca Strana

```
OPCIJE PROCENE USAGLASENOSTI
═══════════════════════════════════════════════════════════════

OPCIJA A: SAMOIZJAVA (Izjava Proizvodjaca)
─────────────────────────────────────────────────────────────
• Proizvodjac sam izjavljuje usaglasenost
• Za LVD, EMC: dozvoljeno (vecina slucajeva)
• Jeftinije, brze
• Rizik: ako nesto podje po zlu, odgovornost na tebi

Potrebno:
□ Technical file (dokumentacija)
□ Declaration of Conformity
□ CE oznaka
□ Interno testiranje (ili koriscenje test laboratorije za podatke)


OPCIJA B: SERTIFIKACIJA TRECE STRANE
─────────────────────────────────────────────────────────────
• Notified Body (EU) potvrdjuje usaglasenost
• Za Machinery Directive: moze biti potrebno
• Za ATEX (ako ima): obavezno
• Skuplje, sporije, ali manje rizika

Notified Bodies (primeri):
• TUV SUD (DE)
• TUV Rheinland (DE)
• SGS (CH)
• Bureau Veritas (FR)
• UL (US, ima EU prisustvo)


PREPORUKA ZA EK3:
═══════════════════════════════════════════════════════════════

Faza 1 (MVP):
• Samoizjava za CE (LVD + EMC)
• Koriscenje akreditovane test laboratorije za EMC testiranje
• Interno bezbednosno testiranje prema IEC 62477

Faza 2 (Proizvodnja):
• Sertifikacija trece strane za punjenje (IEC 61851)
• Robotska celija: procena rizika trece strane
• Razmotriti CB Scheme za medjunarodno priznanje
```

### 4.2 Testne Laboratorije

```
TESTNE LABORATORIJE (EU)
═══════════════════════════════════════════════════════════════

EMC Testiranje:
• Element Materials Technology
• Eurofins E&E
• TUV laboratorije
• Lokalne akreditovane laboratorije (jeftinije)

Bezbednosno Testiranje:
• TUV
• UL
• SGS
• Intertek

Specificno za EV Punjenje:
• KEMA Labs (NL)
• VDE (DE)
• Ricardo (UK)

Cene (orijentaciono):
• EMC pre-compliance: €2-5k
• EMC full compliance: €5-15k
• Bezbednosno testiranje: €10-30k
• IEC 61851 kompletno: €30-50k
```

### 4.3 Vremenska Linija

```
VREMENSKA LINIJA SERTIFIKACIJE
═══════════════════════════════════════════════════════════════

MESEC  1-2:   Pregled dizajna za usaglasenost
               □ Gap analiza prema standardima
               □ Modifikacije dizajna ako su potrebne
               □ Priprema dokumentacije

MESEC  3-4:   Pre-compliance testiranje (interno ili laboratorija)
               □ EMC pre-skeniranje
               □ Bezbednosne provere
               □ Resavanje problema

MESEC  5-6:   Formalno testiranje
               □ EMC puna usaglasenost
               □ Bezbednosno testiranje
               □ Testiranje okruzenja

MESEC  7-8:   Dokumentacija i predaja
               □ Kompletiranje tehnickog fajla
               □ Kompilacija test izvestaja
               □ Nacrt Declaration of Conformity

MESEC  9:     Pregled sertifikacionog tela (ako je treca strana)
               □ Pregled dokumentacije
               □ Moguca pitanja

MESEC 10:     Izdavanje sertifikata
               □ Primena CE oznake
               □ Pustanje u proizvodnju

═══════════════════════════════════════════════════════════════
UKUPNO: ~10 meseci za prvu sertifikaciju

Paralelne aktivnosti mogu skratiti ovo vreme.
Sertifikacija robota je odvojeni trak.
```

---

## 5. Projektni Zahtevi za Bezbednost

### 5.1 Elektricna Bezbednost

```
PROJEKTOVANJE ELEKTRICNE BEZBEDNOSTI
═══════════════════════════════════════════════════════════════

1. KOORDINACIJA IZOLACIJE (IEC 60664-1)
─────────────────────────────────────────

Kategorije napona:
• Mrezni ulaz (400V AC): OVC III
• DC link (650V DC): OVC II
• Izlaz (400V DC): OVC II
• Kontrolna kola (24V): OVC I

Creepage rastojanja (PD2, osnovna izolacija):
┌─────────────────────────────────────────────────────────────┐
│ Working Voltage │ OVC III (mm) │ OVC II (mm) │ OVC I (mm) │
├─────────────────┼──────────────┼─────────────┼────────────┤
│ 400V            │ 4.0          │ 2.5         │ 1.6        │
│ 650V            │ 6.3          │ 4.0         │ 2.5        │
│ 800V            │ 8.0          │ 5.0         │ 3.2        │
└─────────────────────────────────────────────────────────────┘

Pojacana izolacija = 2× osnovne

Clearance: moze biti manji, ali obicno isti kao creepage


2. ZASTITA OD STRUJNOG UDARA
─────────────────────────────────────────

Osnovna zastita:
• Kuciste (IP rejting)
• Izolacija delova pod naponom

Zastita od kvara:
• Automatsko iskljucenje napajanja
• Zastitno uzemljenje (PE)
• RCD (residual current device) - eksterni

IP Rejting:
• Minimum: IP20 (zastita od prsta)
• Spoljna: IP54 ili vise
• Za EK3 modul: IP20 (unutar kabineta)


3. ZASTITNO POVEZIVANJE
─────────────────────────────────────────

• Svi izlozeni provodljivi delovi → PE
• Provodnik za povezivanje: min 6mm² ili jednak faznom
• Zeleno/zuta identifikacija
• Kontinuitet: <0.1Ω


4. ZASTITA OD PREKOSTRUJE
─────────────────────────────────────────

• Osigurac ili prekidac na ulazu
• Interna elektronska OCP
• Koordinacija sa uzvodnom zastitom
```

### 5.2 Termalna Bezbednost

```
PROJEKTOVANJE TERMALNE BEZBEDNOSTI
═══════════════════════════════════════════════════════════════

1. MAKSIMALNE TEMPERATURE (normalan rad)
─────────────────────────────────────────

Prema IEC 62477:
┌─────────────────────────────────────────────────────────────┐
│ Komponenta/Povrsina                      │ Max Temp (°C)   │
├──────────────────────────────────────────┼─────────────────┤
│ Spoljne povrsine (dostupne, metal)       │ 70              │
│ Spoljne povrsine (dostupne, plastika)    │ 85              │
│ Interne komponente (opstih)              │ prema datasheet │
│ Stampana ploca                           │ 130 (FR4)       │
│ Izolacija (Class B)                      │ 130             │
│ Izolacija (Class F)                      │ 155             │
│ Izolacija (Class H)                      │ 180             │
└─────────────────────────────────────────────────────────────┘


2. ABNORMALNI USLOVI
─────────────────────────────────────────

Mora se testirati pod uslovima kvara:
• Otkaz ventilatora za hladjenje → bezbedno gasenje ili derating
• Blokirana ventilacija → termalni iskljucak
• Otkaz jedne komponente → bez pozara, bez strujnog udara

Termalni iskljucaci:
• OTP u firmware-u: derating na 100°C, gasenje na 125°C
• Rezerva: termalni osigurac (jednokratni, poslednja linija odbrane)


3. OTPORNOST NA POZAR
─────────────────────────────────────────

PCB materijal: UL 94 V-0 (minimum)
Kuciste: UL 94 V-0 ili metal
Izolacija kablova: vatrootporna

Glow wire test:
• 650°C za spoljne delove
• 850°C za interne delove koji drze delove pod naponom
```

### 5.3 Mehanicka Bezbednost

```
MEHANICKA BEZBEDNOST
═══════════════════════════════════════════════════════════════

1. CVRSTOCA KUCISTA
─────────────────────────────────────────

Otpornost na udarce:
• IK kod prema IEC 62262
• Minimum IK07 (2J udarac)

Stabilnost:
• Bez rizika od prevrtanja
• Sigurno montiranje

Ostri rubovi:
• Bez dostupnih ostrih rubova
• Obradjeni metalni rubovi


2. BEZBEDNOST HOT-SWAP
─────────────────────────────────────────

Tokom uklanjanja modula:
□ Napajanje automatski iskljuceno PRE nego sto je ekstrakcija moguca
□ Praznjenje rezidualne energije (<60V u roku od 1 sek, ili zasticeno)
□ Interlock sprecava ponovno ukljucenje tokom zamene

Sekvenciranje konektora:
• Uzemljenje prvo spaja / poslednje prekida
• Napajanje pre signala
• Modul prisutan = poslednji kontakt


3. ZASTITA ROBOTSKE CELIJE
─────────────────────────────────────────

Fizicke barijere:
• Fiksne zastite (ograde) gde je moguce
• Minimalna visina: 1400mm (dosezanje preko)

Interlocked zastite:
• Pokretne zastite sa bezbednosnim prekidacima
• Bezbednosni prekidac prema ISO 14119
• PL c minimum

Senzori prisustva:
• Svetlosne zavese (Type 4) ili
• Safety scanner (za vecu oblast)
• PL c ili d u zavisnosti od rizika

Hitno zaustavljanje:
• Crveno dugme gljiva, zuta pozadina
• IEC 60947-5-5
• Category 0 ili 1 stop
• Locirano na svakoj pristupnoj tacki
```

---

## 6. Zahtevi za Dokumentaciju

### 6.1 Tehnicki Fajl

```
TEHNICKI FAJL (Za CE oznaku)
═══════════════════════════════════════════════════════════════

Mora sadrzavati:

1. OPSTI OPIS
   □ Opis proizvoda
   □ Fotografije
   □ Izjava o nameravanoj upotrebi
   □ Korisnicko uputstvo (nacrt)

2. PROJEKTNA DOKUMENTACIJA
   □ Elektricne seme
   □ PCB rasporedi
   □ Mehanicki crtezi
   □ Bill of materials
   □ Opis softvera (ako je primenjivo)

3. LISTA STANDARDA
   □ Lista primenjenih harmonizovanih standarda
   □ Gap analiza za neharmonizovane

4. PROCENA RIZIKA
   □ Identifikacija opasnosti
   □ Procena rizika
   □ Mere smanjenja rizika
   □ Prihvatanje rezidualnog rizika

5. TEST IZVESTAJI
   □ Bezbednosni testovi (interni ili eksterni)
   □ EMC testovi
   □ Testovi okruzenja (ako je primenjivo)
   □ Testovi performansi

6. DOKAZI KVALITETA
   □ Opis kontrole kvaliteta u proizvodnji
   □ Zapisi o kalibraciji
   □ Sertifikati komponenti (kriticna bezbednost)

7. DECLARATION OF CONFORMITY
   □ Potpisana od strane ovlascenog lica
   □ Navodi sve primenjive direktive
   □ Reference na standarde

CUVANJE: 10 godina nakon poslednjeg prodatog proizvoda
LOKACIJA: EU adresa (ili ovlasceni predstavnik)
```

### 6.2 Korisnicka Dokumentacija

```
KORISNICKA DOKUMENTACIJA
═══════════════════════════════════════════════════════════════

1. UPUTSTVO ZA INSTALACIJU
   □ Zahtevi lokacije
   □ Elektricno povezivanje
   □ Mehanicko montiranje
   □ Procedura pustanja u rad
   □ Bezbednosna upozorenja

2. UPUTSTVO ZA RAD
   □ Normalan rad
   □ Opis korisnickog interfejsa
   □ Poruke o greskama i odgovori
   □ Bezbednosne procedure

3. UPUTSTVO ZA ODRZAVANJE
   □ Raspored preventivnog odrzavanja
   □ Procedura zamene modula
   □ Vodic za resavanje problema
   □ Lista rezervnih delova

4. BEZBEDNOSNI PODACI
   □ Objasnjenje bezbednosnih simbola
   □ Upozorenja o rizicima
   □ Procedure u hitnim slucajevima
   □ Licna zastitna oprema

Jezici:
• Sluzbeni jezik svake ciljne zemlje
• Engleski kao minimum za EU
```

---

## 7. Procena Rizika

### 7.1 Metodologija

```
PROCES PROCENE RIZIKA (prema ISO 12100)
═══════════════════════════════════════════════════════════════

KORAK 1: Odredjivanje granica
─────────────────────────
• Nameravana upotreba
• Predvidljiva zloupotreba
• Karakteristike korisnika
• Zivotni vek proizvoda

KORAK 2: Identifikacija opasnosti
─────────────────────────
• Elektricne opasnosti
• Termalne opasnosti
• Mehanicke opasnosti
• Radijacija (EMF)
• Opasnosti od materijala
• Ergonomske opasnosti
• Opasnosti iz okruzenja

KORAK 3: Procena rizika
─────────────────────────
Rizik = Ozbiljnost × Verovatnoca × Izlozenost

Ozbiljnost:
• S1: Manja povreda (reverzibilna)
• S2: Ozbiljna povreda (ireverzibilna)
• S3: Fatalna

Verovatnoca:
• P1: Niska
• P2: Visoka

Izlozenost:
• F1: Retko
• F2: Cesto

KORAK 4: Evaluacija rizika
─────────────────────────
Da li je rizik prihvatljiv?
→ Uporedi sa PLr (potreban performance level)

KORAK 5: Smanjenje rizika
─────────────────────────
1. Inherentno bezbedan dizajn (eliminisi opasnost)
2. Zastita (ograde, interloci)
3. Informacije (upozorenja, instrukcije)

KORAK 6: Verifikacija i dokumentacija
─────────────────────────
• Validiraj mere smanjenja rizika
• Dokumentuj rezidualne rizike
```

### 7.2 Kljucne Opasnosti za EK3 Sistem

```
SAZETAK OPASNOSTI
═══════════════════════════════════════════════════════════════

OPASNOST               │ OZBILJNOST │ MITIGACIJA
───────────────────────┼────────────┼───────────────────────────
Strujni udar (650V DC) │ S3         │ Izolacija, kuciste, PE
                       │            │ interlock, RCD
───────────────────────┼────────────┼───────────────────────────
Arc flash              │ S2-S3      │ Osiguraci, rejting kucista
                       │            │ Zahtevi za PPE
───────────────────────┼────────────┼───────────────────────────
Pozar (thermal runaway)│ S2-S3      │ OTP, termalni osigurac, V-0
                       │            │ materijali, detekcija pozara
───────────────────────┼────────────┼───────────────────────────
Sudar robota           │ S2-S3      │ Zastite, safety scanner
                       │            │ E-stop, ogranicenje brzine
───────────────────────┼────────────┼───────────────────────────
Gnjecenje (robot grip) │ S2         │ Ogranicenje sile, senzori
                       │            │ E-stop
───────────────────────┼────────────┼───────────────────────────
Uskladistena energija  │ S2         │ Kolo za praznjenje,
(kondenzatori)         │            │ oznake upozorenja, interlock
───────────────────────┼────────────┼───────────────────────────
Vruce povrsine         │ S1         │ Zastite, oznake upozorenja
                       │            │ temp limiti prema standardu
───────────────────────┼────────────┼───────────────────────────
EMF izlozenost         │ S1         │ Zastitno oklapanje, rastojanje
                       │            │ (malo verovatno na 3kW)
───────────────────────┼────────────┼───────────────────────────
```

---

## 8. Cybersecurity

```
ZAHTEVI ZA CYBERSECURITY
═══════════════════════════════════════════════════════════════

Rastuca vaznost prema:
• IEC 62443 (Industrijski kontrolni sistemi)
• UN ECE R155 (Automotive cybersecurity)
• NIS2 Directive (EU Kriticna infrastruktura)

MINIMALNI ZAHTEVI:
─────────────────────────────────────────

1. Secure boot
   • Verifikuj integritet firmware-a pri pokretanju
   • Spreci neovlasceni firmware

2. Enkriptovana komunikacija
   • TLS 1.3 za sve eksterne komunikacije
   • Bez plaintext kredencijala

3. Autentifikacija
   • Autentifikacija korisnika za konfiguraciju
   • API kljucevi za sistem-sistem komunikaciju

4. Kontrola pristupa
   • Role-based access (operator, admin, servis)
   • Princip minimalnih privilegija

5. Audit logging
   • Loguj sve bezbednosno-relevantne dogadjaje
   • Tamper-evident logovi

6. Mehanizam azuriranja
   • Bezbedna OTA azuriranja
   • Mogucnost rollback-a
   • Potpisan firmware

7. Upravljanje ranjivostima
   • SBOM (Software Bill of Materials)
   • Proces za security zakrpe
```

---

## 9. Procena Budzeta

```
BUDZET ZA SERTIFIKACIJU (Gruba Procena)
═══════════════════════════════════════════════════════════════

STAVKA                          │ NISKO (€)  │ VISOKO (€)
────────────────────────────────┼────────────┼───────────
EK3 MODUL:                      │            │
  EMC testiranje (pre + puno)   │ 8,000      │ 15,000
  Bezbednosno test. (IEC 62477) │ 10,000     │ 25,000
  Testiranje okruzenja          │ 5,000      │ 10,000
  Priprema dokumentacije        │ 5,000      │ 10,000
────────────────────────────────┼────────────┼───────────
Medjuzbir EK3                   │ 28,000     │ 60,000
────────────────────────────────┼────────────┼───────────
STANICA ZA PUNJENJE:            │            │
  IEC 61851 testiranje          │ 20,000     │ 40,000
  Testovi prikljucenja na mrezu │ 5,000      │ 15,000
────────────────────────────────┼────────────┼───────────
Medjuzbir Stanica               │ 25,000     │ 55,000
────────────────────────────────┼────────────┼───────────
ROBOTSKA CELIJA:                │            │
  Procena rizika                │ 5,000      │ 15,000
  Validacija bezbednosnog sist. │ 10,000     │ 25,000
  Sertifikacija trece strane    │ 10,000     │ 20,000
────────────────────────────────┼────────────┼───────────
Medjuzbir Robot                 │ 25,000     │ 60,000
────────────────────────────────┼────────────┼───────────
KONSALTING:                     │            │
  Safety konsultant             │ 10,000     │ 30,000
  Regulatorni konsultant        │ 5,000      │ 15,000
────────────────────────────────┼────────────┼───────────
Medjuzbir Konsalting            │ 15,000     │ 45,000
────────────────────────────────┼────────────┼───────────
UKUPNO                          │ 93,000     │ 220,000
════════════════════════════════╧════════════╧═══════════

Napomene:
• Opseg zavisi od obima, slozenosti, pronadjenih problema
• Ponovni testovi ako ima neuspeha: dodaj 30-50%
• Vise trzista: dodaj po trzistu
• Ovo su samo eksterni troskovi (bez internog rada)
```

---

## 10. Mapa Puta Sertifikacije

```
FAZNI PRISTUP
═══════════════════════════════════════════════════════════════

FAZA 1: MVP (6 meseci) - Cilj: Demonstraciona jedinica
─────────────────────────────────────────────────────────────
□ Interna bezbednosna revizija
□ Osnovna EMC pre-usaglasenost
□ Procena rizika (dokumentovana)
□ Robotska celija: samo fizicke zastite
□ JOS UVEK NEMA CE oznake (R&D prototip)

Ishod: Bezbedno za kontrolisane demo prikaze


FAZA 2: PILOT (12 meseci) - Cilj: Ogranicena primena
─────────────────────────────────────────────────────────────
□ Puno EMC testiranje usaglasenosti
□ Bezbednosno testiranje (IEC 62477)
□ CE oznaka za EK3 modul
□ Osnovna IEC 61851 usaglasenost
□ Robotska celija: potpuna zastita

Ishod: CE oznaceno, moze se primeniti na pilot lokacijama


FAZA 3: PROIZVODNJA (18 meseci) - Cilj: Komercijalna prodaja
─────────────────────────────────────────────────────────────
□ IEC 61851 sertifikacija trece strane
□ Usaglasenost sa grid kodom (po zemlji)
□ Puna sertifikacija robotske celije
□ Cybersecurity procena
□ Sistem upravljanja kvalitetom (ISO 9001)

Ishod: Potpuno sertifikovano za EU trziste


FAZA 4: EKSPANZIJA (24+ meseci) - Cilj: Ostala trzista
─────────────────────────────────────────────────────────────
□ UKCA oznaka (UK)
□ UL/CSA (Severna Amerika) - ako ulazimo
□ Ostale regionalne sertifikacije

═══════════════════════════════════════════════════════════════
```

---

## 11. Kljucni Kontakti i Resursi

```
KORISNI RESURSI
═══════════════════════════════════════════════════════════════

TELA ZA STANDARDE:
• IEC: www.iec.ch
• ISO: www.iso.org
• CENELEC: www.cencenelec.eu

EU ZVANICNO:
• EUR-Lex (Direktive): eur-lex.europa.eu
• Blue Guide: ec.europa.eu/growth

BAZA NOTIFIED BODIES:
• NANDO: ec.europa.eu/growth/tools-databases/nando

TESTNE LABORATORIJE (Primeri):
• TUV SUD: www.tuvsud.com
• Element: www.element.com
• SGS: www.sgs.com

SPECIFICNO ZA EV PUNJENJE:
• CharIN (CCS organizacija): www.charin.global
• Open Charge Alliance: www.openchargealliance.org
```

---

## 12. Otvorena Pitanja

1. **Ciljna trzista** - Koje zemlje prvo? (utice na grid kodove)
2. **Robot OEM** - Njihova odgovornost za usaglasenost vs nasa?
3. **V2G opseg** - Dodaje znacajnu slozenost sertifikacije
4. **Zastita od eksplozije** - Ima li ATEX zona? (zamena baterije?)
5. **Zahtevi osiguranja** - Pokrice odgovornosti za proizvod
6. **Postojece sertifikacije** - Da li su neke komponente vec sertifikovane?

---

## Reference

- IEC 62477-1:2022 - Safety requirements for power electronic converter systems
- IEC 61851-1:2017 - EV conductive charging system - General requirements
- IEC 61851-23:2014 - DC EV charging station
- ISO 10218-1:2011 - Robots - Safety requirements - Robots
- ISO 10218-2:2011 - Robots - Safety requirements - Integration
- EN ISO 13849-1:2023 - Safety of machinery - Safety-related control systems
- IEC 62443 series - Industrial communication networks - Security
- 2014/35/EU - Low Voltage Directive
- 2014/30/EU - EMC Directive
- 2006/42/EC - Machinery Directive
