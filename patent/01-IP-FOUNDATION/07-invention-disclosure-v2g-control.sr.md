# Prijava Izuma: Decentralizovani V2G Kontrolni Sistem za Modularnu Infrastrukturu Punjenja

## Administrativne Informacije

| Polje | Vrednost |
|-------|----------|
| ID Prijave | EK-2026-007 |
| Datum Prijave | 2026-01-04 |
| Pronalazač(i) | Bojan Janjatović |
| Email | bojan.janjatovic@gmail.com |
| Adresa | Vojislava Ilića 8, Kikinda, Severni Banat, Srbija |
| Datum Koncepcije | 2026-01-04 |
| Svedoci | Marija Janjatović |

### Poreklo Izuma
Nadogradnja modularne arhitekture punjača (EK-2026-001) sa V2G sposobnostima. Ključna inovacija je decentralizovana kontrola gde svaki 3kW modul ima sopstvenu mrežnu sinhronizaciju i droop kontrolu, omogućavajući zamenu modula tokom aktivne V2G operacije bez prekida mrežnih servisa.

---

## 1. Naslov Izuma

**Decentralizovani Sistem Kontrole Vehicle-to-Grid sa Sinhronizacijom Mreže po Modulu i Mogućnošću Zamene u Radu**

Alternativni naslovi:
- Distribuirana Droop Kontrolna Arhitektura za Modularne Dvosmerne EV Punjače
- Samokoordinirajući V2G Energetski Moduli sa Graceful Degradation

---

## 2. Tehničko Područje

```
□ Energetska Elektronika - Dvosmerna DC/AC Konverzija
□ Vehicle-to-Grid (V2G) Tehnologija
□ Kontrola Invertera Povezanih na Mrežu
□ Distribuirani Kontrolni Sistemi
□ EV Infrastruktura za Punjenje
```

---

## 3. Izjava o Problemu

### 3.1 Trenutno Stanje Tehnike

```
POSTOJEĆE V2G ARHITEKTURE PUNJAČA:

CENTRALIZOVANA KONTROLA:
• Jedan kontroler upravlja celom energetskom elektronikom
• Mrežna sinhronizacija (PLL) na nivou sistema
• Droop kontrola primenjena na agregirani izlaz
• Jedinstvena tačka otkaza za ceo V2G sistem

OGRANIČENJA:
• Kvar modula = potpuni prekid V2G servisa
• Zamena u radu zahteva gašenje V2G
• Skaliranje zahteva nov dizajn kontrolnog sistema
• Ograničena tolerancija na greške
```

### 3.2 Problemi Trenutnih Pristupa

```
1. JEDINSTVENA TAČKA OTKAZA
   • Kvar centralnog PLL/droop kontrolera = sav V2G staje
   • Obaveza prema mreži se ne može održati
   • Gubitak prihoda i rizik za stabilnost mreže

2. NEMA ZAMENE U RADU TOKOM V2G
   • Trenutni sistemi zahtevaju prekid servisa za održavanje
   • Zamena modula = V2G servis offline
   • Ne može se održati obaveza regulacije frekvencije

3. SLOŽENOST SKALIRANJA
   • Centralni kontroler mora biti redizajniran za svaki nivo snage
   • Više modula = složenija centralna kontrola
   • Teret testiranja raste eksponencijalno

4. OGRANIČENJA VREMENA ODZIVA
   • Centralni kontroler stvara usko grlo u komunikaciji
   • Mrežni događaji zahtevaju odziv ispod 100ms
   • Centralizovane odluke prespora na velikoj skali
```

---

## 4. Sažetak Izuma

### 4.1 Osnovni Koncept

```
DECENTRALIZOVANA V2G KONTROLA:

Svaki 3kW EK3 modul sadrži kompletnu V2G sposobnost:
• Lokalna Fazno-Zaključana Petlja (PLL) za mrežnu sinhronizaciju
• Lokalna P(f) droop kontrola za regulaciju frekvencije
• Lokalna Q(V) droop kontrola za podršku napona
• Lokalni kontroler struje za isporuku snage

ROJI KOORDINACIJA:
• Moduli se koordiniraju putem peer-to-peer poruka
• Nema jedinstvene tačke otkaza u kontroli
• Bilo koji modul može biti zamenjen tokom V2G operacije
• Sistem nastavlja da pruža mrežni servis sa N-1 modula
```

### 4.2 Ključni Inovativni Elementi

```
ELEMENT 1: Mrežna Sinhronizacija po Modulu
─────────────────────────────────────────────────────────────
• Svaki modul ima nezavisni PLL koji prati fazni ugao/frekvenciju
• Moduli dele informacije o stanju mreže radi validacije
• Detekcija neslaganja sprečava pogrešan rad
• Kvar modula ne utiče na sinhronizaciju drugih

ELEMENT 2: Distribuirana Droop Kontrola
─────────────────────────────────────────────────────────────
• P(f) droop: Svaki modul podešava snagu na osnovu lokalne frekvencije
• Q(V) droop: Svaki modul pruža lokalnu podršku napona
• Automatska podela opterećenja bez centralne koordinacije
• Mrežno-nativno ponašanje proizilazi iz lokalnih odluka

ELEMENT 3: Zamena u Radu Tokom V2G Operacije
─────────────────────────────────────────────────────────────
• Vađenje modula pokreće gracioznu preraspodelu snage
• Preostali moduli povećavaju izlaz da održe obavezu
• Umetanje novog modula se auto-sinhronizuje i pridružuje
• Mrežni servis neprekinut tokom održavanja

ELEMENT 4: Višeslojna Kontrolna Hijerarhija
─────────────────────────────────────────────────────────────
• Sloj 1: Lokalni PLL (najbrži, po modulu)
• Sloj 2: Droop kontrola (brzo, po modulu)
• Sloj 3: Kontrola struje (srednje, po modulu)
• Sloj 4: Raspoređivanje snage (sporo, na nivou sistema)
• Sloj 5: Koordinacija flote (najsporije, na nivou oblaka)
```

---

## 5. Detaljan Opis

### 5.1 Kontrolna Arhitektura po Modulu

```
SVAKI EK3 MODUL SADRŽI:
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                      EK3 MODUL                               │
│                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│   │   MREŽNI    │───►│    PLL      │───►│   DROOP     │    │
│   │  SENZORI    │    │ (Po Modulu) │    │  KONTROLA   │    │
│   │  V, I, f    │    │  θ, ω, Vd   │    │  P(f), Q(V) │    │
│   └─────────────┘    └──────┬──────┘    └──────┬──────┘    │
│                             │                   │            │
│                             ▼                   ▼            │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│   │  KONTROLER  │◄───│  REFERENCA  │◄───│   SISTEM    │    │
│   │   STRUJE    │    │   SNAGE     │    │   ZAŠTITE   │    │
│   │   id, iq    │    │  P*, Q*     │    │             │    │
│   └──────┬──────┘    └─────────────┘    └─────────────┘    │
│          │                                                   │
│          ▼                                                   │
│   ┌─────────────┐                                           │
│   │    PWM      │───► Energetski Stepen ───► Mrežna Veza   │
│   │  GENERATOR  │                                           │
│   └─────────────┘                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

KLJUČNA KORIST:
• Kompletna kontrolna petlja unutar svakog modula
• Modul radi nezavisno od drugih
• Kvar izolovan na pojedinačni modul
```

### 5.2 Strategija Mrežne Sinhronizacije

```
PLL PO MODULU:
═══════════════════════════════════════════════════════════════

Svaki modul nezavisno prati:
• Fazni ugao mrežnog napona (θ)
• Mrežnu frekvenciju (ω)
• Amplitudu mrežnog napona (V)

MEHANIZAM KONSENZUSA:
• Moduli dele PLL stanje putem CAN-FD mreže
• Medijana glasanje za konsenzus o frekvenciji
• Detekcija outlier-a identifikuje neispravne senzore
• Modul sa lošim PLL podacima je izolovan

STANJA SINHRONIZACIJE:
1. AKVIZICIJA: PLL se zaključava na mrežu
2. ZAKLJUČAN: Normalan rad
3. COASTING: Privremeni gubitak, koristi predviđeni ugao
4. GREŠKA: Ne može se sinhronizovati, modul offline
```

### 5.3 Droop Kontrola Rad

```
FREKVENCIJSKI DROOP (P-f KARAKTERISTIKA):
═══════════════════════════════════════════════════════════════

Odziv Snage:
              Podfrekvencija          Nadfrekvencija
              (smanji opterećenje)    (apsorbuj višak)
                      │                       │
                      ▼                       ▼
    P/Pn     ─────────────────────────────────────────────
      │                     ╱
    +1│                    ╱   ← Punjenje
      │                   ╱
      │                  ╱ ← Mrtva zona (±50mHz)
      │─────────────────╱─────────────────────► f
      │                ╱            49.95  50.05
      │               ╱
    -1│              ╱   ← V2G Pražnjenje
      │─────────────╱

PONAŠANJE PO MODULU:
• Svaki modul reaguje na lokalno merenje frekvencije
• Automatska podela opterećenja: moduli vide istu frekvenciju
• Prirodna koordinacija bez eksplicitnih poruka
• Ukupan odziv sistema = suma odziva modula


NAPONSKI DROOP (Q-V KARAKTERISTIKA):
═══════════════════════════════════════════════════════════════

Odziv Reaktivne Snage:
• Nizak napon → Injektiraj reaktivnu snagu (kapacitivno)
• Visok napon → Apsorbuj reaktivnu snagu (induktivno)
• Bez habanja baterije: reaktivna snaga je samo razmena sa mrežom

PREDNOST PO MODULU:
• Lokalna podrška napona poboljšava kvalitet obližnje mreže
• Moduli u različitim fazama mogu reagovati nezavisno
• Kapacitet reaktivne snage iskorišćen bez centralne koordinacije
```

### 5.4 Procedura Zamene u Radu Tokom V2G

```
SEKVENCA ZAMENE (Zamena modula tokom V2G):
═══════════════════════════════════════════════════════════════

POČETNO STANJE: 100 modula obezbeđuje 50kW V2G pražnjenje

T+0ms:    Robot identifikuje neispravan modul #47
          Sistem pruža: 50kW pražnjenje
          Doprinos po modulu: 500W svaki

T+10ms:   Obaveštenje o zameni emitirano
          Ostali moduli primaju "M47 čeka uklanjanje"

T+50ms:   Modul #47 prima komandu za gašenje
          Počinje smanjenje snage (500W → 0W)

T+200ms:  Modul #47 na nuli
          99 modula sada deli 50kW
          Doprinos po modulu: 505W svaki (u okviru margine)
          Mrežni servis: NEPREKINUT

T+500ms:  Modul #47 isključen sa backplane-a
          Robotsko vađenje počinje

T+30s:    Novi modul #47 umetnut
          Modul se pali, PLL u akviziciji

T+30.5s:  PLL zaključan, droop parametri konfigurisani
          Modul se pridružuje sa nula snage

T+31s:    Modul raste do 505W doprinosa
          100 modula ponovo deli 50kW

T+32s:    Sistem se vraća na nominalan rad
          Mrežni servis: NIKAD PREKINUT

KLJUČNA INOVACIJA:
• Graciozna preraspodela snage tokom zamene
• Nije potrebno restartovanje centralnog kontrolera
• Obaveza mrežnog servisa održana kroz ceo proces
• Zamena može da se desi tokom vršnog odziva na mrežni događaj
```

### 5.5 ISO 15118-20 BPT Integracija

```
PODRŠKA V2G PROTOKOLA:
═══════════════════════════════════════════════════════════════

ISO 15118-20 definiše protokol za dvosmerni prenos snage (BPT).
ELEKTROKOMBINACIJA implementira oba kontrolna režima:

ZAKAZANI REŽIM:
• Punjač pruža raspored snage vozilu
• Raspored uključuje periode V2G pražnjenja
• Vozilo prati raspored, punjač sprovodi
• Primer: Punjenje 18:00-22:00, V2G 00:00-02:00, Punjenje 02:00-06:00

DINAMIČKI REŽIM:
• Punjač može zahtevati promene snage u realnom vremenu
• Koristi se za regulaciju frekvencije, odziv na zahtev
• Vozilo mora odgovoriti u roku od 2 sekunde (po standardu)
• Omogućava učešće u mrežnim servisima

MODULARNA PREDNOST:
• Svaki modul može učestvovati u različitoj sesiji
• Više vozila može biti povezano istovremeno
• Agregirani V2G kapacitet prijavljen operateru mreže
• Kvarovi pojedinačnih modula ne utiču na stanje protokola


PREGOVARANJE VOZILO-PUNJAČ:
═══════════════════════════════════════════════════════════════

Limiti snage razmenjeni na početku sesije:
• Vozilo pruža: max snagu punjenja/pražnjenja, SoC limite
• Punjač pruža: dostupnu snagu (iz broja modula)
• Pregovarani parametri = minimum oba limita

Adaptacija na zamenu:
• Uklanjanje modula → punjač preračunava dostupnu snagu
• ISO 15118-20 dozvoljava dinamičko ažuriranje limita
• Vozilo obavešteno o novim limitima, prilagođava se
• Nije potrebno restartovanje sesije
```

---

## 6. Prednosti u Odnosu na Postojeću Tehniku

```
PREDNOST 1: Nema Jedinstvene Tačke Otkaza
─────────────────────────────────────────────────────────────
Postojeća tehnika: Kvar centralnog kontrolera = potpuno gašenje V2G
Ovaj izum: Bilo koji kvar modula = 0.3% smanjenje kapaciteta
           Kontrola nastavlja sa preostalim modulima

PREDNOST 2: Zamena u Radu Tokom Mrežnih Servisa
─────────────────────────────────────────────────────────────
Postojeća tehnika: Održavanje zahteva prekid V2G servisa
Ovaj izum: Zamena modula tokom vršnog odziva na mrežni događaj
           Obaveza prema mreži održana kroz ceo proces

PREDNOST 3: Automatska Podela Opterećenja
─────────────────────────────────────────────────────────────
Postojeća tehnika: Centralni kontroler računa raspodelu snage
Ovaj izum: Droop kontrola pruža prirodnu podelu opterećenja
           Nije potrebna komunikacija za koordinaciju

PREDNOST 4: Vreme Odziva Ispod 100ms
─────────────────────────────────────────────────────────────
Postojeća tehnika: Latencija centralnog kontrolera ograničava odziv
Ovaj izum: Svaki modul reaguje na lokalno merenje
           Paralelni odziv, nema komunikacionog uskog grla

PREDNOST 5: Pojednostavljeno Skaliranje
─────────────────────────────────────────────────────────────
Postojeća tehnika: Nov dizajn kontrolnog sistema za svaki nivo snage
Ovaj izum: Dodaj module, ukupni kapacitet raste
           Kontrolna logika identična na bilo kojoj skali

PREDNOST 6: Usklađenost sa Mrežnim Kodeksom po Dizajnu
─────────────────────────────────────────────────────────────
Postojeća tehnika: Usklađenost verifikovana na nivou sistema
Ovaj izum: Svaki modul pojedinačno usklađen sa mrežom
           Sistem nasleđuje usklađenost od modula
```

---

## 7. Poznata Postojeća Tehnika

```
SRODNE TEHNOLOGIJE:
═══════════════════════════════════════════════════════════════

1. GRID-FORMING INVERTERI (Za komunalne potrebe)
   - Decentralizovana kontrola na nivou invertera
   - ALI: Pojedinačni veliki inverteri, nisu modularni
   - ALI: Nema mogućnost zamene u radu

2. MIKROMREŽE SA DROOP KONTROLOM
   - Distribuirani generatori sa P(f), Q(V) droop-om
   - ALI: Različiti izvori energije, ne modularne identične jedinice
   - ALI: Nema robotske zamene, ručno održavanje

3. ABB TERRA HP MODULARNI PUNJAČI
   - Više modula po punjaču
   - ALI: Centralni kontroler za V2G
   - ALI: Moduli od 50kW, ne granularnost od 3kW

4. FREEWIRE BOOST PUNJAČ
   - Punjač sa integrisanom baterijom, dvosmerni
   - ALI: Monolitni dizajn, nije modularan
   - ALI: Jedinstvena tačka otkaza

5. TRITIUM/DCBEL V2G PUNJAČI
   - Podrška za ISO 15118-20 BPT
   - ALI: Centralna V2G kontrola
   - ALI: Nema zamene u radu tokom V2G


DIFERENCIJACIJA:
─────────────────────────────────────────────────────────────
Naša kombinacija:
• PLL i droop kontrola po modulu
• Granularnost od 3kW za ekstremnu redundansu
• Zamena u radu tokom aktivne V2G operacije
• Roji koordinacija bez centralnog kontrolera
• ISO 15118-20 BPT integracija sa dinamičkim ažuriranjem limita

...izgleda da je NOVA
```

---

## 8. Potencijalni Zahtevi (Nacrt)

```
NEZAVISNI ZAHTEV 1 (Sistem):
Sistem za vehicle-to-grid punjenje koji obuhvata:
• Više identičnih energetskih modula, gde svaki modul sadrži:
  - Lokalnu fazno-zaključanu petlju za mrežnu sinhronizaciju
  - Lokalni kontroler frekvencijskog droop-a za regulaciju aktivne snage
  - Lokalni kontroler naponskog droop-a za regulaciju reaktivne snage
  - Lokalni kontroler struje za isporuku snage
• Peer-to-peer komunikacionu mrežu koja povezuje pomenute module
• Pri čemu svaki modul nezavisno reaguje na mrežne uslove
  bez potrebe za koordinacijom od centralnog kontrolera
• Pri čemu sistem održava mrežni servis tokom zamene u radu
  bilo kog pojedinačnog modula

NEZAVISNI ZAHTEV 2 (Metoda):
Metoda za pružanje vehicle-to-grid usluga koja obuhvata:
• Sinhronizaciju svakog od više energetskih modula sa mrežnom
  fazom koristeći nezavisne fazno-zaključane petlje
• Merenje mrežne frekvencije na lokaciji svakog modula
• Podešavanje izlaza aktivne snage svakog modula na osnovu lokalne
  frekvencije merenja i droop karakteristike
• Preraspodelu snage među preostalim modulima kada se jedan modul
  ukloni tokom aktivne V2G operacije
• Pri čemu se obaveza mrežnog servisa održava tokom
  zamene modula

ZAVISNI ZAHTEVI:
• ...gde moduli dele PLL stanje za validaciju konsenzusa
• ...gde se neispravni moduli automatski izoluju
• ...gde su droop parametri konfigurisivi po mrežnom kodeksu
• ...gde sistem podržava ISO 15118-20 BPT protokol
• ...gde se dinamički limiti snage komuniciraju vozilu
  tokom događaja zamene u radu
• ...gde je vreme odziva na devijaciju mrežne frekvencije
  manje od 100 milisekundi
```

---

## 9. Status Razvoja

```
□ Samo koncept (trenutno)
□ Napravljen dokaz koncepta
□ Prototip testiran
□ Pilot proizvodnja
□ Komercijalna proizvodnja
```

---

## 10. Komercijalni Potencijal

```
VELIČINA TRŽIŠTA:
• Tržište V2G sposobnih punjača: $2B do 2030
• Tržište mrežnih servisa (regulacija frekvencije): $5B/godišnje
• Infrastruktura za punjenje autobusnih depoa: $3B do 2030

KONKURENTSKA PREDNOST:
• Jedini V2G sistem sa kontrolom po modulu
• Zamena u radu tokom mrežnog servisa = 99.99% dostupnost
• Usklađenost sa mrežnim kodeksom na nivou modula
• Pojednostavljen put sertifikacije

POTENCIJALNI LICENCIRANI KORISNICI:
• Operateri mreže (servisi regulacije frekvencije)
• Operateri flota (autobusni depoi, logistika)
• Agregatori (virtuelne elektrane)
• OEM proizvođači punjača (ABB, Tritium, ChargePoint)
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
1. Kontrola po modulu je nova za V2G punjenje
2. Zamena u radu tokom mrežnog servisa je nova
3. Kombinacija droop kontrole + modularna arhitektura
4. Sinergija sa patentom modularne arhitekture (EK-2026-001)
5. ISO 15118-20 BPT integracija sa dinamičkim limitima

POTENCIJALNI IZAZOVI:
1. Droop kontrola je poznata (ali ne na nivou modula)
2. PLL je standardan (ali po modulu sa konsenzusom je nov)
3. Softver/kontrolni aspekti (fokus na tehničkom efektu)

PREPORUČENI PRISTUP:
1. Pozicionirati kao poboljšanje EK-2026-001
2. Naglasiti zamenu u radu tokom V2G kao ključni diferencijator
3. Zahtevati sistem i metodu odvojeno
4. Razmotriti nastavak za ISO 15118-20 specifičnosti

UNAKRSNA REFERENCA:
• Patent A (Umbrela): EK-2026-001 Modularna Arhitektura
• Ovaj patent: V2G-specifična kontrolna inovacija
• Referenca na Patent A za zahteve hardvera modula
```
