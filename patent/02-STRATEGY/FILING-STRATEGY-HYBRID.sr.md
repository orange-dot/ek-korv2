# STRATEGIJA PATENTNIH PRIJAVA: Hibridni Pristup (3 Patenta)

**Datum:** 2026-01-02
**Pronalazac:** Bojan Janjatovic
**Email:** bojan.janjatovic@gmail.com
**Adresa:** Vojislava Ilica 8, Kikinda, Severni Banat, Srbija
**Status:** NACRT - Za pregled sa patentnim advokatom

---

## STRUKTURA PATENTNE PORODICE

```
+-------------------------------------------------------------+
|                    ELEKTROKOMBINACIJA                        |
|                    Patentna Porodica                         |
+-------------------------------------------------------------+
|                                                              |
|  +-----------------+                                         |
|  |   PATENT A      | <--- KROVNI PATENT                      |
|  |   (Prioritet)   |      Modularna Arhitektura Snage        |
|  |   EK-001/002/003|      + Robotska Zamena + Distribuirana  |
|  +--------+--------+        Rezerva                          |
|           |                                                  |
|           | krstaste reference                               |
|           |                                                  |
|  +--------+--------+       +-----------------+               |
|  |   PATENT B      |       |   PATENT C      |               |
|  |   (Samostalan)  |       |   (Samostalan)  |               |
|  |   EK-005        |       |   EK-004        |               |
|  |   Sistem sa     |       |   Logistika     |               |
|  |   Dva Robota    |       |   Flote         |               |
|  +-----------------+       +-----------------+               |
|                                                              |
+-------------------------------------------------------------+
```

---

## PATENT A: Modularna Arhitektura Snage (Krovni)

### Naslov
**"Modularni sistem za pretvaranje snage sa distribuiranom rezervom i robotskom zamenom modula za infrastrukturu punjenja elektricnih vozila"**

### Obuhvata (Opseg zahteva)
- EK-2026-001: Unifikovana modularna arhitektura snage
- EK-2026-002: Stanica za zamenu dvojne namene
- EK-2026-003: Sistem distribuirane rezerve snage

### Kljucni zahtevi

**Zahtev 1 (Nezavisan - Uredjaj):**
> Modularni sistem za punjenje elektricnih vozila koji sadrzi:
> - mnostvo standardizovanih modula za pretvaranje snage, pri cemu svaki modul ima izlaznu snagu od 1-5 kW;
> - sklop zadnje ploce konfigurisan da prima navedene module u formatu server nozeva;
> - elektricne konektore za slepo spajanje koji omogucavaju zamenu bez gasenja;
> - distribuirani sistem upravljanja snagom koji implementira siroku distribuciju preko svih aktivnih modula;
> - pri cemu kvar bilo kog pojedinacnog modula rezultira smanjenjem ukupne snage sistema manjim od 1%.

**Zahtev 2 (Nezavisan - Metod):**
> Metod za odrzavanje infrastrukture za punjenje elektricnih vozila koji sadrzi:
> - otkrivanje degradacije modula snage putem kontinuiranog nadgledanja;
> - predvidjanje vremenskog okvira kvara koriscenjem analize masinskog ucenja;
> - automatsku zamenu navedenog modula koriscenjem robotske manipulacije;
> - redistribuciju opterecenja snage preko preostalih modula tokom zamene;
> - pri cemu se zamena zavrsava bez prekida usluge.

**Zahtev 3 (Nezavisan - Sistem):**
> Robotska stanica za zamenu modula koja sadrzi:
> - robotski manipulator sposoban za vadenje i umetanje modula snage;
> - sistem za skladistenje modula koji sadrzi zamenske module;
> - dijagnosticki sistem zasnovan na vestackoj inteligenciji koji identifikuje module koji zahtevaju zamenu;
> - interfejs za koordinaciju za sinhronizaciju sa sistemima montiranim na vozilu.

### GRANICA - Sta PATENT A NE pokriva:
```
+===============================================================+
| EKSPLICITNO ISKLJUCENO IZ PATENTA A:                          |
|                                                               |
| 1. Roboti montirani NA vozilu (-> Patent B)                   |
| 2. Koordinacija izmedju vozila i stanice (-> Patent B)        |
| 3. Transport modula vozilima flote (-> Patent C)              |
| 4. Logistika servisnih centara (-> Patent C)                  |
|                                                               |
| Patent A se bavi STACIONARNOM infrastrukturom i               |
| robotima FIKSIRANIM na lokaciji punjenja.                     |
+===============================================================+
```

### Klauzula o krstaskim referencama (u opisu patenta):
> "Sistem opisan ovde moze se koristiti u vezi sa robotskim sistemima
> montiranim na vozilu kako je opisano u patentnoj prijavi u toku
> [Referentni broj PATENTA B], i sistemima za logistiku integrisanim
> sa flotom kako je opisano u patentnoj prijavi u toku
> [Referentni broj PATENTA C], obe podnete od strane istog pronalazaca
> i ukljucene ovde putem reference."

---

## PATENT B: Koordinisan sistem sa dva robota (Samostalan)

### Naslov
**"Koordinisan sistem sa vise robota za samoisceljujucu infrastrukturu punjenja elektricnih vozila sa robotskim jedinicama montiranim na vozilu i baziranim na stanici"**

### Obuhvata (Opseg zahteva)
- EK-2026-005: Koordinisan sistem sa dva robota

### Kljucni zahtevi

**Zahtev 1 (Nezavisan - Sistem):**
> Samoisceljujuci sistem infrastrukture punjenja koji sadrzi:
> - prvu robotsku jedinicu (Robot A) trajno montiranu na elektricno vozilo;
> - drugu robotsku jedinicu (Robot B) lociranu na stanici za punjenje;
> - bezicni protokol za koordinaciju koji omogucava sinhronizovan rad;
> - pri cemu Robot A obavlja dijagnosticke funkcije i manipulaciju konektorom;
> - pri cemu Robot B obavlja zamenu modula i operacije teske kategorije;
> - pri cemu koordinisan rad omogucava autonomno resavanje kvarova bez ljudske intervencije.

**Zahtev 2 (Nezavisan - Metod):**
> Metod za autonomnu popravku sistema za punjenje elektricnih vozila koji sadrzi:
> - otkrivanje kvara punjenja putem dijagnostickog robota montiranog na vozilu;
> - prenos podataka o kvaru ka robotu baziranom na stanici putem bezicnog protokola;
> - koordinaciju simultanih akcija izmedju robota na vozilu i stanici;
> - zavrsavanje operacije popravke dok vozilo ostaje u poziciji punjenja;
> - pri cemu je ukupno vreme popravke manje od 5 minuta.

**Zahtev 3 (Zavisan):**
> Sistem iz Zahteva 1, pri cemu Robot A sadrzi:
> - tezinu manju od 20 kg za montazu na vozilo;
> - dijagnosticke senzore u realnom vremenu;
> - sposobnost manipulacije konektorom;
> - odeljak za skladistenje rezervnih delova.

**Zahtev 4 (Zavisan):**
> Sistem iz Zahteva 1, pri cemu Robot B sadrzi:
> - sposobnost vadenja i umetanja modula;
> - funkcionalnost zamene baterija;
> - sposobnost autonomnog rada 24/7.

### GRANICA - Sta PATENT B NE pokriva:
```
+===============================================================+
| EKSPLICITNO ISKLJUCENO IZ PATENTA B:                          |
|                                                               |
| 1. Dizajn samih modula snage (-> Patent A)                    |
| 2. Algoritmi distribuirane rezerve (-> Patent A)              |
| 3. Sistem zadnje ploce i stalka (-> Patent A)                 |
| 4. Transport modula izmedju lokacija (-> Patent C)            |
| 5. Operacije servisnog centra (-> Patent C)                   |
|                                                               |
| Patent B se bavi KOORDINACIJOM DVA ROBOTA i                   |
| konceptom SAMOISCELJENJA kroz robotsku saradnju.              |
+===============================================================+
```

### Klauzula o krstaskim referencama:
> "Robotske jedinice opisane ovde rade na modularnim sistemima snage
> kako je opisano u patentnoj prijavi u toku [Referentni broj PATENTA A].
> Zamenjeni moduli mogu se transportovati putem sistema logistike flote
> kako je opisano u patentnoj prijavi u toku [Referentni broj PATENTA C].
> Obe prijave podnete od strane istog pronalazaca i ukljucene putem reference."

### Priznanje zavisnosti:
> "Robot B baziran na stanici moze koristiti dizajne modula i tehnike
> robotske manipulacije kompatibilne sa onima opisanim u [PATENTU A].
> Ovaj patent tvrdi da su SISTEM KOORDINACIJE i ROBOT MONTIRAN NA VOZILU
> novi elementi, dok priznaje da mehanizmi zamene modula bazirani na
> stanici mogu biti pokriveni [PATENTOM A]."

---

## PATENT C: Logistika integrisana sa flotom (Samostalan)

### Naslov
**"Sistem logistike odrzavanja integrisan sa flotom za rad cirkularne ekonomije infrastrukture punjenja elektricnih vozila"**

### Obuhvata (Opseg zahteva)
- EK-2026-004: Logistika odrzavanja integrisana sa flotom

### Kljucni zahtevi

**Zahtev 1 (Nezavisan - Metod):**
> Metod za odrzavanje infrastrukture za punjenje elektricnih vozila koji sadrzi:
> - identifikaciju degradiranog modula na stanici za punjenje putem prediktivne dijagnostike;
> - zakazivanje zamene modula da se poklopi sa redovnim operacijama flote vozila;
> - transport zamenskog modula DO stanice za punjenje putem vozila flote;
> - transport uklonjenog modula SA stanice za punjenje putem istog ili narednog vozila flote;
> - isporuku uklonjenog modula u centralizovani servisni objekat;
> - pri cemu nije potrebno slanje namenskog servisnog vozila.

**Zahtev 2 (Nezavisan - Sistem):**
> Sistem cirkularnog odrzavanja za infrastrukturu punjenja elektricnih vozila koji sadrzi:
> - mrezu stanica za punjenje sa modularnim, zamenjivim komponentama;
> - flotu elektricnih vozila koja se servisira na navedenim stanicama za punjenje;
> - sistem upravljanja inventarom modula koji prati lokacije i status modula;
> - sistem optimizacije logistike koji koordinise transport modula putem vozila flote;
> - centralizovani objekat za popravku za obnovu modula;
> - pri cemu moduli cirkulisu izmedju stanica, vozila i objekta za popravku.

**Zahtev 3 (Zavisan):**
> Metod iz Zahteva 1, pri cemu je vozilo flote elektrican autobus
> koji saobracaja na redovnoj liniji koja ukljucuje lokaciju stanice za punjenje.

**Zahtev 4 (Zavisan):**
> Sistem iz Zahteva 2, koji dalje sadrzi:
> - odeljke za skladistenje modula integrisane u vozila flote;
> - automatizovanu predaju modula izmedju vozila i stanice.

### GRANICA - Sta PATENT C NE pokriva:
```
+===============================================================+
| EKSPLICITNO ISKLJUCENO IZ PATENTA C:                          |
|                                                               |
| 1. Dizajn modula snage (-> Patent A)                          |
| 2. Mehanizam robotske zamene (-> Patent A, Patent B)          |
| 3. Robot montiran na vozilu (-> Patent B)                     |
| 4. Koordinacija robota (-> Patent B)                          |
|                                                               |
| Patent C se bavi LOGISTIKOM i aspektom CIRKULARNE EKONOMIJE   |
| - kako moduli PUTUJU kroz sistem.                             |
+===============================================================+
```

### Klauzula o krstaskim referencama:
> "Moduli koji se transportuju putem sistema logistike opisanog ovde
> su modularne jedinice za pretvaranje snage kako je opisano u [PATENTU A].
> Zamena modula na stanicama za punjenje moze se vrsiti robotskim
> sistemima kako je opisano u [PATENTU A] i [PATENTU B]. Sve prijave
> podnete od strane istog pronalazaca i ukljucene putem reference."

---

## MATRICA PROTIV KOLIZIJE

Ova matrica eksplicitno definise sta svaki patent pokriva:

| Element | Patent A | Patent B | Patent C |
|---------|:--------:|:--------:|:--------:|
| Dizajn 3kW modula | DA | NE | NE |
| Konektori za slepo spajanje | DA | NE | NE |
| Sistem zadnje ploce/stalka | DA | NE | NE |
| Algoritam siroke distribucije | DA | NE | NE |
| Distribuirana rezerva | DA | NE | NE |
| Robot na stanici (zamena) | DA | ref | NE |
| Predikcija kvarova vestackom inteligencijom | DA | ref | ref |
| **Robot montiran na vozilu** | NE | DA | NE |
| **Koordinacija Robota A + B** | NE | DA | NE |
| **Bezicni protokol sinhronizacije** | NE | DA | NE |
| **Koncept samoisceljenja** | NE | DA | NE |
| **Transport modula flotom** | NE | NE | DA |
| **Logistika bez izlazaka servisera** | NE | NE | DA |
| **Sistem cirkularne ekonomije** | NE | NE | DA |
| **Integracija servisnog centra** | NE | NE | DA |

**Legenda:**
- DA = Ovaj patent POKRIVA ovaj element
- NE = Ovaj patent NE pokriva ovaj element
- ref = Referencira ali NE TVRDI (ukljuceno putem reference)

---

## TACKE KOLIZIJE I RESENJA

### Tacka kolizije 1: Robot baziran na stanici

**Problem:** Patent A tvrdi robotsku stanicu za zamenu, Patent B tvrdi Robot B na stanici.

**Resenje:**
- Patent A: Tvrdi robota kao SAMOSTALAN sistem baziran na stanici
- Patent B: Tvrdi robota KAO DEO KOORDINISANOG SISTEMA sa Robotom A
- Kljucna razlika: Patent B zahteva OBA robota u koordinaciji

**Formulacija u Patentu B:**
> "Robotska jedinica bazirana na stanici (Robot B) sadasnjeg izuma
> razlikuje se od samostalnih robota baziranih na stanici po svojoj
> NEOPHODNOSTI koordinacije sa jedinicom montiranom na vozilu (Robot A).
> Robot B kako je tvrdjen ovde NE MOZE raditi nezavisno za svrhe
> ovog patenta - koordinacija je sustinski element."

### Tacka kolizije 2: Predikcija kvarova vestackom inteligencijom

**Problem:** Sva tri patenta koriste predikciju vestackom inteligencijom.

**Resenje:**
- Patent A: Vestacka inteligencija za predikciju MODULA (zdravlje hardvera)
- Patent B: Vestacka inteligencija za KOORDINACIJU robota (tajming, sekvenciranje)
- Patent C: Vestacka inteligencija za OPTIMIZACIJU logistike (rutiranje, zakazivanje)

**Formulacija (u svakom patentu):**
> "Sistemi vestacke inteligencije/masinskog ucenja referencirani ovde su specificni
> za [zdravlje modula / koordinaciju robota / optimizaciju logistike] i ne tvrde
> opste metode predikcije vestackom inteligencijom koji mogu biti opisani u
> povezanim prijavama."

### Tacka kolizije 3: Rukovanje modulima

**Problem:** Svi patenti ukljucuju nekakvo rukovanje modulima.

**Resenje:**
- Patent A: FIZICKI dizajn za zamenu bez gasenja (konektori, format)
- Patent B: ROBOTSKA MANIPULACIJA (hvatanje, vadenje, umetanje)
- Patent C: TRANSPORT izmedju lokacija (skladistenje, isporuka)

---

## VREMENSKI OKVIR PRIJAVA

```
2026-01-02  --+-- Datum prioriteta (Git komitovi, ovaj dokument)
              |
2026-Q1     --+-- Privremene prijave (sve tri)
              |   - Jeftino ($320 USPTO / €150 EPO)
              |   - Osigurava datum prioriteta
              |   - 12 meseci za punu prijavu
              |
2026-Q2     --+-- Razvoj radnih prototipova
              |   - Prototip EK3 modula
              |   - Osnovna demonstracija robota
              |
2026-Q3     --+-- Pune patentne prijave
              |   - Patent A prvi (krovni)
              |   - Patent B drugi (referencira A)
              |   - Patent C treci (referencira A, B)
              |
2027-Q1     --+-- PCT medjunarodna prijava
              |   - Prosiruje zastitu globalno
              |   - 30 meseci od datuma prioriteta
              |
2028        --+-- Ulazak u nacionalnu fazu
                  - Odabir zemalja za zastitu
                  - EU, US, CN, JP, KR minimum
```

---

## STRATEGIJA LICENCIRANJA

### Scenario 1: Licenciraj sve zajedno
```
ELEKTROKOMBINACIJA Puna Licenca
+-- Patent A (Modularna arhitektura)
+-- Patent B (Dva robota)
+-- Patent C (Logistika flote)

Primalac licence dobija: Kompletnu samoisceljujucu infrastrukturu
Tantijeme: 5-8% na sistem
Cilj: Veliki CPO-ovi (ChargePoint, EVgo, Ionity)
```

### Scenario 2: Licenciraj selektivno
```
Hyundai/Kia -----> Samo Patent B (Dva robota)
                   Vec imaju robote za punjenje, dodaju montiranog na vozilu

ABB/Siemens -----> Samo Patent A (Modularna arhitektura)
                   Vec prave modularne punjace, poboljsavaju granularnost

Autobuski operateri ---> Samo Patent C (Logistika flote)
                   Specificno za operacije depoa
```

### Scenario 3: Unakrsno licenciranje
```
NIO (ima patent za zamenu baterija) <------> ELEKTROKOMBINACIJA

NIO dobija: Patent A (arhitektura modula)
Mi dobijamo: NIO patente za zamenu baterija + partnerstvo u proizvodnji
```

---

## VLASNISTVO I USTUPANJE

Svi patenti su u vlasnistvu istog entiteta za:
- Jednostavnije unakrsno referenciranje
- Jedinstvenu strategiju licenciranja
- Izbegavanje internih konflikata

```
Vlasnik: [ELEKTROKOMBINACIJA d.o.o. ili Bojan Janjatovic licno]
Pronalazac: Bojan Janjatovic
Svedok: Marija Janjatovic
```

**Preporuka:** Osnuj kompaniju PRE prijave da patenti budu u vlasnistvu kompanije, ne licno. Lakse za investitore i licenciranje.

---

## KONTROLNA LISTA PRE PRIJAVE

### Dokumentacija
- [x] Dokumenti o otkrivanju izuma (5 komada)
- [x] Dokaz prioriteta (Git komitovi)
- [x] Istrazivanje konkurencije (analiza prethodne tehnike)
- [x] Strategija prijave (ovaj dokument)
- [ ] Detaljni tehnicki crtezi
- [ ] Fotografije/videi prototipa
- [ ] Potpisi svedoka (overeni)

### Pravno
- [ ] Konsultacija sa patentnim advokatom
- [ ] Pregled formulacija zahteva
- [ ] Analiza slobode delovanja
- [ ] Osnivanje kompanije (ako nije)

### Tehnicko
- [ ] Radni prototip EK3 modula
- [ ] Demonstracija koordinacije robota (moze biti simulacija)
- [ ] Dijagrami arhitekture sistema (detaljni)

---

## PROCENA BUDZETA

| Stavka | Patent A | Patent B | Patent C | Ukupno |
|--------|----------|----------|----------|--------|
| Privremena prijava (USPTO) | $320 | $320 | $320 | $960 |
| Puna prijava | ~$3,000 | ~$2,500 | ~$2,000 | ~$7,500 |
| PCT prijava | ~$4,000 | ~$4,000 | ~$4,000 | ~$12,000 |
| Nacionalna faza EU | ~$8,000 | ~$8,000 | ~$8,000 | ~$24,000 |
| Nacionalna faza US | ~$5,000 | ~$5,000 | ~$5,000 | ~$15,000 |
| **UKUPNO (Godina 1-3)** | | | | **~$60,000** |

**Opcija uradi sam:** Privremene prijave mozes sam, puna prijava zahteva advokata.

---

## DODATAK: Sabloni pravnog jezika

### Sablon unakrsnih referenci
```
KRSTASTE REFERENCE NA POVEZANE PRIJAVE

Ova prijava je povezana sa i tvrdi korist od:
- [Broj Patenta A] podnet [datum], naslovljen "[naslov]"
- [Broj Patenta B] podnet [datum], naslovljen "[naslov]"
- [Broj Patenta C] podnet [datum], naslovljen "[naslov]"

Sve povezane prijave su od strane istog pronalazaca i
ukljucene su ovde putem reference u celosti.

Sadasnji izum je namenjen da radi u vezi sa,
ali je patentno razlicit od, predmeta
povezanih prijava.
```

### Sablon definicije granica
```
OGRANICENJA OPSEGA

Zahtevi sadasnjeg izuma su specificno ograniceni na
[SPECIFICAN OPSEG]. Sledeci elementi, iako potencijalno
kompatibilni sa sadasnjim izumom, eksplicitno NISU tvrdjeni:

1. [Element iz drugog patenta]
2. [Element iz drugog patenta]
3. [Element iz drugog patenta]

Ovi elementi mogu biti pokriveni povezanim prijavama podnetim od
strane istog pronalazaca.
```

---

*Dokument kreiran: 2026-01-02*
*Verzija: 1.0*
*Za internu upotrebu i konsultaciju sa patentnim advokatom*
