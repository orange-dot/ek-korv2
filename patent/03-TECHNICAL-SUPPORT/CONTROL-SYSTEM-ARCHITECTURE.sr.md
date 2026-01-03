# Arhitektura Kontrolnog Sistema

**Verzija Dokumenta:** 1.0
**Datum:** 2026-01-03
**Autor:** Bojan Janjatovic
**Email:** bojan.janjatovic@gmail.com
**Adresa:** Vojislava Ilica 8, Kikinda, Severni Banat, Srbija

---

## 1. Pregled Sistema

```
HIJERARHIJA KONTROLNOG SISTEMA
═══════════════════════════════════════════════════════════════

                    ┌─────────────────────────────────────┐
                    │         CLOUD / BACKEND             │
     NIVO 4         │  Upravljanje Flotom i Analitika     │
                    │  (Opciono - sistem radi i offline)  │
                    └──────────────────┬──────────────────┘
                                       │ HTTPS/MQTT
                                       │ (mobilna/optika)
                    ┌──────────────────┴──────────────────┐
                    │         KONTROLER DEPOA             │
     NIVO 3         │  Koordinacija svih stanica u depou  │
                    │  + inventar + zakazivanje           │
                    └──────────────────┬──────────────────┘
                                       │ Ethernet
                         ┌─────────────┴─────────────┐
                         ▼                           ▼
              ┌─────────────────────┐     ┌─────────────────────┐
              │  KONTROLER STA #1  │     │  KONTROLER STA #N  │
   NIVO 2     │  • Upravljanje     │     │                     │
              │    punjenjem       │     │                     │
              │  • Kontrola robota │     │                     │
              │  • Zdravlje modula │     │                     │
              └─────────┬──────────┘     └─────────────────────┘
                        │ CAN bus
          ┌─────────────┼─────────────┬─────────────┐
          ▼             ▼             ▼             ▼
      ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐
      │ EK3   │    │ EK3   │    │ EK3   │    │ Robot │
   N1 │ #1    │    │ #2    │    │ #N    │    │ Ctrl  │
      │       │    │       │    │       │    │       │
      └───────┘    └───────┘    └───────┘    └───────┘

═══════════════════════════════════════════════════════════════
PRINCIP: Svaki nivo moze raditi AUTONOMNO ako visi nivo otkaze
═══════════════════════════════════════════════════════════════
```

---

## 2. Nivo 1: Kontroler Modula (EK3)

> Detaljno pokriveno u SENSOR-ARCHITECTURE.md

```
SAZETAK - KONTROLER MODULA
═══════════════════════════════════════════════════════════════

Hardver: STM32G474 (Cortex-M4 @ 170MHz, integrisani CAN-FD)

Funkcije:
• Kontrola DC-DC konverzije snage (LLC rezonantni)
• Nadgledanje senzora (I, V, T, ESR)
• Procena zdravlja (rule-based + ML)
• CAN-FD komunikacija @ 5 Mbps

Autonomija:
• Moze raditi samostalno za osnovno punjenje
• Samozastita (OCP, OTP, OVP)
• Degradirani rezim ako komunikacija otkaze

Interfejs prema NIVOU 2:
• CAN-FD @ 5 Mbps (64-byte payload)
• Izvestavanje o statusu svake sekunde
• Event-driven alarmi odmah
```

---

## 3. Nivo 2: Kontroler Stanice

### 3.1 Hardverska Platforma

```
HARDVER KONTROLERA STANICE
═══════════════════════════════════════════════════════════════

OPCIJA A: Industrijski PC (Preporuceno)
─────────────────────────────────────
• Advantech UNO-2271G ili slicno
• Intel Atom/Celeron
• 4GB RAM, 64GB SSD
• Sirok temperaturni opseg: -20 do +60°C
• Dupli Ethernet, 2x RS485, GPIO
• DIN rail montaza
• Cena: ~$400-600

OPCIJA B: Raspberry Pi CM4 + Industrijski Nosac
─────────────────────────────────────
• Compute Module 4
• Industrijska noseca ploca (Waveshare, Seeed)
• CAN HAT
• Cena: ~$150-250
• Manje robustan, OK za prototip

OPCIJA C: PLC
─────────────────────────────────────
• Siemens S7-1200, Beckhoff CX serija
• Overkill za ovu aplikaciju
• Skupo, ali industrijski dokazano


PREPORUCENI I/O:
─────────────────────────────────────
• 2x CAN bus (moduli + robot)
• 1x Ethernet (uplink ka Kontroleru Depoa)
• 1x RS485 (legacy uredaji ako treba)
• 8x DI (emergency stops, senzori vrata)
• 4x DO (statusne lampice, brave)
• 1x USB (laptop za odrzavanje)
```

### 3.2 Softverski Stek

```
OPERATIVNI SISTEM
═══════════════════════════════════════════════════════════════

Linux-based (Debian/Ubuntu LTS ili Yocto custom)

Zasto Linux:
• Fleksibilnost
• Bogat ekosistem
• Real-time capable (PREEMPT_RT patch)
• OTA updates
• Containerization (Docker) za izolaciju

Alternativa:
• Windows IoT (ako treba .NET kompatibilnost)
• RTOS (FreeRTOS, Zephyr) ako treba hard real-time
  → Verovatno nepotrebno za ovaj nivo
```

```
SOFTVERSKA ARHITEKTURA
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                     KONTROLER STANICE                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐    │
│  │  MENADZER   │ │   MONITOR   │ │      KONTROLER      │    │
│  │  PUNJENJA   │ │  ZDRAVLJA   │ │       ROBOTA        │    │
│  │             │ │   MODULA    │ │                     │    │
│  │ • Upravlj.  │ │ • Agregacija│ │ • Sekvenca zamene   │    │
│  │   sesijama  │ │   statusa   │ │ • Sigurnosna blok.  │    │
│  │ • Alokacija │ │   modula    │ │ • Kontrola hvataca  │    │
│  │   snage     │ │ • Predvidj. │ │ • Kontrola pozicije │    │
│  │ • Komunik.  │ │   otkaza    │ │                     │    │
│  │   sa vozil. │ │ • Zakaziv.  │ │                     │    │
│  │             │ │   zamena    │ │                     │    │
│  └──────┬──────┘ └──────┬──────┘ └──────────┬──────────┘    │
│         │               │                    │               │
│         └───────────────┼────────────────────┘               │
│                         ▼                                    │
│              ┌─────────────────────┐                        │
│              │    ORKESTRATOR      │                        │
│              │  (State Machine)    │                        │
│              └──────────┬──────────┘                        │
│                         │                                    │
│    ┌────────────────────┼────────────────────┐              │
│    ▼                    ▼                    ▼              │
│ ┌──────┐          ┌──────────┐         ┌─────────┐         │
│ │ CAN  │          │  MQTT    │         │  REST   │         │
│ │Driver│          │  Client  │         │  API    │         │
│ └──────┘          └──────────┘         └─────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    LINUX + DOCKER                            │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Kljucni Servisi

```
SERVIS: MENADZER PUNJENJA
═══════════════════════════════════════════════════════════════

Odgovornosti:
1. Identifikacija vozila (RFID, prepoznavanje tablica, ili API)
2. Upravljanje sesijama (start, stop, pauza)
3. Alokacija snage preko modula
4. Merenje energije (za naplatu)
5. Komunikacija sa vozilom (ako ima V2G/ISO 15118)

State Machine:
┌─────────┐    vozilo     ┌─────────────┐  auth ok    ┌──────────┐
│  IDLE   │──────────────▶│ IDENTIFIKAC │────────────▶│ POKRETANJ│
└─────────┘   detektov.   └─────────────┘             └────┬─────┘
     ▲                                                      │
     │                    ┌─────────────┐    prikljucak ok  │
     │                    │   PUNJENJE  │◀─────────────────┘
     │                    └──────┬──────┘
     │                           │
     │         ┌─────────────────┼─────────────────┐
     │         ▼                 ▼                 ▼
     │    ┌─────────┐      ┌──────────┐     ┌───────────┐
     │    │ZAVRSENO │      │ PAUZIRANO│     │  GRESKA   │
     │    └────┬────┘      └──────────┘     └─────┬─────┘
     │         │                                   │
     └─────────┴───────────────────────────────────┘


Punjenje sa degradiranim modulima:
─────────────────────────────────
• Ako modul X kaze "degraded" → redistribuuj opterecenje
• Ako modul X kaze "replace" → iskljuci iz rotacije
• Punjenje nastavlja sa smanjenom snagom ako treba
• Obavestenje korisniku: "Punjenje smanjenom brzinom"
```

```
SERVIS: MONITOR ZDRAVLJA MODULA
═══════════════════════════════════════════════════════════════

Odgovornosti:
1. Agregacija statusa svih modula
2. Analiza trendova na nivou flote
3. Odluke o zakazivanju zamena
4. Integracija sa Upravljanjem Flotom

Logika zakazivanja zamene:
─────────────────────────────────

FOR each module:
    IF status == CRITICAL:
        → Zamena ODMAH (sledeci slobodan slot)

    IF status == REPLACE_NEXT_BUS:
        → Dodaj u "hitna zamena" red
        → Obavesti Upravljanje Flotom

    IF status == SCHEDULE_REPLACEMENT:
        → Dodaj u "planirana zamena" red
        → Optimizuj: grupisi vise zamena
        → Cekaj bus koji vec nosi rezervni modul

PRIORITIZACIJA:
1. Critical → odmah
2. Urgent → u roku od 4 sata
3. Planned → u roku od 7 dana

GRUPNO ZAKAZIVANJE:
• Ako 3+ modula treba zamenu → zakazi "prozor za odrzavanje"
• Obavesti depo da pripremi vise rezervnih modula
```

```
SERVIS: KONTROLER ROBOTA
═══════════════════════════════════════════════════════════════

Odgovornosti:
1. Izvrsavanje sekvence zamene
2. Upravljanje sigurnosnom blokadom
3. Kontrola hvataca
4. Obrada gresaka i oporavak

Sekvenca Zamene (pojednostavljena):
─────────────────────────────────

1. PREDUSLOVI
   □ Nema vozila u punjackom mestu
   □ Napajanje modula ISKLJUCENO
   □ Sigurnosna vrata zakljucana
   □ Robot u pocetnoj poziciji

2. SEKVENCA UKLANJANJA
   □ Pomeri se do slota modula X
   □ Verifikuj poziciju (kamera/senzor)
   □ Aktiviraj hvatac
   □ Verifikuj hvatanje
   □ Otkljucaj rezu modula
   □ Izvuci modul
   □ Pomeri se na buffer poziciju
   □ Otpusti na "uklonjeni" nosac

3. SEKVENCA INSTALACIJE
   □ Pomeri se do "rezervni" nosaca
   □ Uzmi novi modul
   □ Pomeri se do slota X
   □ Poravnaj (vodjeno kamerom)
   □ Ubaci modul
   □ Zakljucaj rezu
   □ Otpusti hvatac
   □ Povuci se

4. POSTUSLOVI
   □ Napajanje modula UKLJUCENO
   □ CAN komunikacija verifikacija
   □ Brza provera zdravlja
   □ Izvestaj o zavrsetku

Obrada Gresaka:
─────────────────────────────────
• Greska hvataca → ponovi 2x, zatim odustani
• Greska pozicije → re-home, ponovi
• Modul zaglavljen → oznaka za ljudsku intervenciju
• Napajanje tokom zamene → HITNO ZAUSTAVLJANJE
```

### 3.4 Komunikacioni Interfejsi

```
CAN-FD BUS MREZA (Interna)
═══════════════════════════════════════════════════════════════

Topologija: Single bus, multi-drop
Brzina: CAN-FD @ 5 Mbps (data faza) / 1 Mbps (arbitracija)
Payload: 64 bajta (vs 8 bajta CAN 2.0)
Terminacija: 120Ω na oba kraja
Kasnjenje: <1ms po poruci

Adrese Cvorova:
• 0x100-0x1FF: EK3 Moduli (slot 1-255)
• 0x200-0x2FF: Robot kontroler
• 0x300-0x3FF: Pomocni (ventilatori, brave, senzori)
• 0x700-0x7FF: Kontroler stanice (master)

Tipovi Poruka:
─────────────────────────────────

# Heartbeat (svake sekunde)
ID: 0x100 + slot_number
LEN: 64 (CAN-FD)
DATA: [
  status, temp_junction, temp_ambient, efficiency,
  power_out_H, power_out_L, voltage_H, voltage_L,
  current_H, current_L, ESR_H, ESR_L, RUL, fan_speed,
  anomaly_score, fault_code, uptime_H, uptime_M, uptime_L,
  ... (prosirena telemetrija)
]

# Komanda (od Kontrolera Stanice)
ID: 0x700
LEN: 64 (CAN-FD)
DATA: [cmd_type, target_slot, params[0-61]]

Komande:
  0x01 = Napajanje UKLJUCI
  0x02 = Napajanje ISKLJUCI
  0x03 = Postavi limit snage (params: power_H, power_L)
  0x04 = Udji u standby
  0x05 = Priprema za zamenu (bezbedno gasenje)
  0x10 = Zahtev za detaljnu dijagnostiku
  0x20 = Azuriranje firmware-a (params: chunk data)

# Alarm (event-driven, visok prioritet)
ID: 0x080 + slot_number (opseg ID-ova visokog prioriteta)
LEN: 64 (CAN-FD)
DATA: [alarm_code, severity, timestamp[4], values[58]]
```

```
UPLINK KA KONTROLERU DEPOA (Ethernet)
═══════════════════════════════════════════════════════════════

Protokol: MQTT 5.0 over TLS
Broker: Kontroler Depoa (lokalni) + Cloud (backup)

Struktura Topika:
─────────────────────────────────

# Status stanice
depot/{depot_id}/station/{station_id}/status
  → JSON: {state, active_sessions, available_power, module_health}

# Telemetrija po modulu (periodicno, 1/min)
depot/{depot_id}/station/{station_id}/module/{slot}/telemetry
  → JSON: {temp, current, voltage, efficiency, esr, anomaly_score}

# Dogadjaji (odmah)
depot/{depot_id}/station/{station_id}/events
  → JSON: {event_type, slot, severity, message, timestamp}

# Komande (od Kontrolera Depoa)
depot/{depot_id}/station/{station_id}/commands
  → JSON: {command, parameters}

# Zahtevi za zamenu
depot/{depot_id}/station/{station_id}/swap/request
  → JSON: {slot, urgency, reason, estimated_rul}

depot/{depot_id}/station/{station_id}/swap/complete
  → JSON: {slot, old_module_sn, new_module_sn, result}
```

### 3.5 Lokalno Skladistenje i Perzistencija

```
SKLADISTENJE PODATAKA
═══════════════════════════════════════════════════════════════

SQLite Baza (lokalno):
─────────────────────────────────

Tabele:
• charging_sessions - istorija punjenja
• module_telemetry - agregirani podaci (1min rezolucija)
• module_events - svi alarmi i dogadjaji
• swap_history - sve zamene modula
• config - konfiguracija sistema

Zadrzavanje:
• Telemetrija: 90 dana lokalno, zatim upload + brisanje
• Dogadjaji: 1 godina
• Sesije: trajno (relevantno za naplatu)

Sinhronizacija:
• Background sync ka Depou/Cloudu
• Offline-first: sve radi i bez uplink-a
```

---

## 4. Nivo 3: Kontroler Depoa

### 4.1 Uloga i Odgovornosti

```
KONTROLER DEPOA - FUNKCIJE
═══════════════════════════════════════════════════════════════

1. UPRAVLJANJE INVENTAROM
   • Pracenje svih modula (po serijskom broju)
   • Lokacija: u stanici / u skladistu / na busu / u servisu
   • Status: aktivan / degradiran / na cekanju / u popravci

2. KOORDINACIJA ZAMENA
   • Prima zahteve za zamenu od svih stanica
   • Optimizuje: koji bus nosi koji modul gde
   • Koordinira sa voznim redom autobusa

3. UPRAVLJANJE REZERVNIM FONDOM
   • Koliko rezervnih modula treba u depou?
   • Kada naruciti nove?
   • Koji moduli idu na renoviranje?

4. INTEGRACIJA SA LOGISTIKOM FLOTE
   • API ka fleet management sistemu
   • Zna raspored autobusa
   • Moze zakazati "servisni bus" ako treba

5. LOKALNA ANALITIKA
   • Agregacija podataka sa svih stanica
   • Analiza trendova za ceo depo
   • Predikcija: "za 2 nedelje ce trebati 5 zamena"

6. UPLINK KA CLOUD-u
   • Sinhronizacija sa centralnim sistemom (ako postoji)
   • Backup za sve podatke
```

### 4.2 Hardver

```
HARDVER KONTROLERA DEPOA
═══════════════════════════════════════════════════════════════

Opcija: Standardni server ili VM

Preporuceno:
• Intel NUC ili mini server
• 8GB+ RAM
• 256GB+ SSD
• UPS backup (min 30 min)
• Dupli Ethernet (redundantnost)

Softver:
• Linux server (Ubuntu LTS)
• Docker za sve servise
• PostgreSQL za bazu
• Mosquitto MQTT broker
• Nginx reverse proxy

Moze biti i VM na postojecoj depot IT infrastrukturi.
```

### 4.3 Softverska Arhitektura

```
SOFTVERSKI STEK KONTROLERA DEPOA
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                      KONTROLER DEPOA                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │    INVENTAR    │  │   OPTIMIZATOR  │  │  INTEGRACIJA │  │
│  │    SERVIS      │  │     ZAMENA     │  │    FLOTE     │  │
│  │                │  │                │  │              │  │
│  │ • Pracenje     │  │ • Upravlj.     │  │ • Raspored   │  │
│  │   modula       │  │   redom        │  │   buseva     │  │
│  │ • Serijski     │  │ • Optimizac.   │  │ • Komunik.   │  │
│  │   brojevi      │  │   ruta         │  │   sa vozac.  │  │
│  │ • Zivotni      │  │ • Grupno       │  │ • Servisni   │  │
│  │   ciklus       │  │   zakazivanje  │  │   zahtevi    │  │
│  └───────┬────────┘  └───────┬────────┘  └──────┬───────┘  │
│          │                   │                   │          │
│          └───────────────────┼───────────────────┘          │
│                              ▼                              │
│                    ┌─────────────────┐                      │
│                    │   ORKESTRATOR   │                      │
│                    └────────┬────────┘                      │
│                             │                               │
│         ┌───────────────────┼───────────────────┐          │
│         ▼                   ▼                   ▼          │
│    ┌─────────┐        ┌──────────┐        ┌─────────┐      │
│    │  MQTT   │        │   REST   │        │ WebSocket│     │
│    │ Broker  │        │   API    │        │  (UI)   │      │
│    └─────────┘        └──────────┘        └─────────┘      │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                    PostgreSQL + Redis                        │
├─────────────────────────────────────────────────────────────┤
│                    Docker + Linux                            │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Algoritam Optimizacije Zamene

```
OPTIMIZATOR ZAMENE - LOGIKA
═══════════════════════════════════════════════════════════════

Ulaz:
• Lista zahteva za zamenu (stanica, slot, hitnost, razlog)
• Trenutni inventar rezervnih modula
• Raspored autobusa (sledecih 24h)
• Kapacitet autobusa za transport modula

Izlaz:
• Optimalan plan: koji bus → koje module → koja stanica

ALGORITAM (Greedy + Heuristike):
─────────────────────────────────

1. PRIORITIZACIJA ZAHTEVA
   Sortiraj po: hitnost DESC, udaljenost_stanice ASC

   Critical → mora u sledecih 30 min
   Urgent → mora u sledecih 4h
   Planned → u sledecih 7 dana

2. ZA SVAKI CRITICAL/URGENT:
   Nadji najraniji bus koji prolazi tom stanicom
   AKO bus ima kapacitet:
       Dodeli modul busu
       Rezervisi rezervni iz inventara
   INACE:
       Oznaci za namenska servisna vozila

3. ZA PLANIRANE ZAHTEVE:
   Grupisi po ruti
   Nadji bus koji prolazi vise stanica
   Grupisi zamene (minimiziraj putovanja)

4. PROVERA OGRANICENJA:
   • Maksimalni kapacitet busa: 4 modula (primer)
   • Vozac nije tehnicar za odrzavanje → samo dostava
   • Ako robot nije dostupan → preskoci

5. IZLAZNI PLAN:
   {
     bus_id: "BUS-042",
     polazak: "14:30",
     zadaci: [
       {stanica: "S-01", akcija: "dostavi", moduli: ["M-1234"]},
       {stanica: "S-01", akcija: "pokupi", moduli: ["M-0987"]},
       {stanica: "S-03", akcija: "dostavi", moduli: ["M-5678"]}
     ]
   }
```

### 4.5 Kontrolna Tabla (Dashboard)

```
KONTROLNA TABLA DEPOA (Web)
═══════════════════════════════════════════════════════════════

Tehnologija: React + TypeScript + TailwindCSS
Real-time: WebSocket za azuriranja uzivo

PRIKAZI:
─────────────────────────────────

1. PREGLED
   ┌─────────────────────────────────────────────────────────┐
   │  DEPO: Beograd Centar                                   │
   │                                                          │
   │  Stanice: 12     Moduli: 156      Rezervni: 18         │
   │  Online: 12      Zdravi: 142      U tranzitu: 4        │
   │                  Upozorenje: 11   U popravci: 8        │
   │                  Kriticno: 3                            │
   │                                                          │
   │  [!] 3 modula treba zamenu u sledecih 24h              │
   └─────────────────────────────────────────────────────────┘

2. MAPA STANICA
   • Interaktivna mapa depoa
   • Svaka stanica: zeleno/zuto/crveno
   • Klik → detalji stanice

3. LISTA MODULA
   • Tabela svih modula
   • Filter po statusu, stanici, starosti
   • Sortiranje po oceni zdravlja
   • Klik → istorija modula

4. RED ZAMENA
   • Zamene na cekanju
   • Dodeljen bus
   • Procenjeno vreme dolaska
   • Opcije za rucnu izmenu

5. ANALITIKA
   • Trendovi otkaza
   • MTBF po seriji modula
   • Sezonski obrasci
   • Analiza troskova
```

---

## 5. Nivo 4: Cloud / Centralno Upravljanje

### 5.1 Opciono ali Preporuceno

```
CLOUD FUNKCIJE
═══════════════════════════════════════════════════════════════

1. UPRAVLJANJE VISE DEPOA
   • Centralni pregled svih depoa
   • Deljenje rezervnih delova izmedju depoa
   • Globalna optimizacija inventara

2. NAPREDNA ANALITIKA
   • ML modeli trenirani na podacima cele flote
   • Poboljsanje predikcije otkaza
   • Poredjenje izmedju depoa

3. OTA AZURIRANJA
   • Firmware updates za module
   • Software updates za kontrolere Stanice/Depoa
   • Fazno uvodjenje (10% → 50% → 100%)

4. NAPLATA I IZVESTAVANJE
   • Izvestaji o potrosnji energije
   • Pracenje troskova odrzavanja
   • SLA usaglasenost

5. UDALJENA PODRSKA
   • Bezbedni pristup za dijagnostiku
   • Udaljena konfiguracija
   • Pomoc pri resavanju problema
```

### 5.2 Cloud Arhitektura (Skica)

```
CLOUD INFRASTRUKTURA
═══════════════════════════════════════════════════════════════

Provajder: AWS / Azure / GCP (bilo koji)

┌─────────────────────────────────────────────────────────────┐
│                         CLOUD                                │
│                                                              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │   API         │  │   Analitika   │  │   ML          │   │
│  │   Gateway     │  │   Servis      │  │   Trening     │   │
│  └───────┬───────┘  └───────────────┘  └───────────────┘   │
│          │                                                   │
│          ▼                                                   │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │   IoT Hub     │  │   Time Series │  │   Blob        │   │
│  │   (MQTT)      │  │   Baza        │  │   Storage     │   │
│  └───────────────┘  └───────────────┘  └───────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
          │
          │ TLS/MQTT
          ▼
    ┌───────────┐
    │ KONTROLER │
    │   DEPOA   │
    └───────────┘
```

---

## 6. Bezbednosna Razmatranja

```
SLOJEVI BEZBEDNOSTI
═══════════════════════════════════════════════════════════════

1. SEGMENTACIJA MREZE
   • Poseban VLAN za infrastrukturu punjenja
   • Firewall izmedju IT i OT mreze
   • Nema direktnog pristupa internetu za Kontrolere Stanica

2. AUTENTIFIKACIJA
   • Mutual TLS za MQTT
   • API keys za REST
   • Role-based access control (RBAC)

3. ENKRIPCIJA
   • TLS 1.3 za sve eksterne komunikacije
   • AES-256 za sacuvane kredencijale
   • Potpisana azuriranja firmware-a

4. FIZICKA BEZBEDNOST
   • Zakljucani ormani za kontrolere
   • Detekcija neovlascenog pristupa
   • Secure boot na embedded uredajima

5. NADGLEDANJE
   • Audit log svih komandi
   • Detekcija anomalija na mreznom saobracaju
   • Upozorenja za pokusaje neovlascenog pristupa
```

---

## 7. Rezimi Otkaza i Otpornost

```
SCENARIJI OTKAZA I ODGOVOR
═══════════════════════════════════════════════════════════════

SCENARIO: Kontroler Stanice offline
─────────────────────────────────────
• Moduli nastavljaju da rade autonomno
• Osnovno punjenje OK
• Nema novih swap operacija
• Alert ka Kontroleru Depoa
• Oporavak: automatski reconnect

SCENARIO: Kontroler Depoa offline
─────────────────────────────────────
• Stanice rade normalno
• Zahtevi za zamenu se queue-uju lokalno
• Rucna zamena i dalje moguca
• Oporavak: sinhronizacija backlog-a

SCENARIO: Cloud offline
─────────────────────────────────────
• Potpuno normalan rad
• Lokalni podaci se akumuliraju
• Sinhronizacija kad se uspostavi veza
• Nema uticaja na operacije

SCENARIO: CAN bus kvar
─────────────────────────────────────
• Moduli prelaze u bezbedni rezim
• Punjenje se zaustavlja
• Potrebna fizicka intervencija
• Kritican alert

SCENARIO: Nestanak struje
─────────────────────────────────────
• Kontroler Stanice na UPS-u (30 min)
• Elegantno gasenje svih modula
• Stanje sacuvano u perzistentno skladiste
• Auto-oporavak po povratku struje
```

---

## 8. Razvojna Mapa

```
FAZA 1: MVP Jedne Stanice (Mesec 1-3)
═══════════════════════════════════════════════════════════════
□ Kontroler Stanice osnovni (Raspberry Pi)
□ CAN komunikacija sa 4 EK3 modula
□ Osnovno upravljanje sesijama punjenja
□ Lokalna web kontrolna tabla (samo citanje)
□ Rucna zamena (bez robota)

FAZA 2: Integracija Robota (Mesec 4-5)
═══════════════════════════════════════════════════════════════
□ Integracija kontrolera robota
□ Implementacija sekvence zamene
□ Sistem sigurnosne blokade
□ Tok zahtev/zavrsetak zamene

FAZA 3: Vise Stanica (Mesec 6-7)
═══════════════════════════════════════════════════════════════
□ MVP Kontrolera Depoa
□ Upravljanje vise stanica
□ Pracenje inventara
□ Osnovna optimizacija zamene

FAZA 4: Integracija Flote (Mesec 8-9)
═══════════════════════════════════════════════════════════════
□ Integracija rasporeda buseva
□ Transportna logistika
□ Obavestenja vozacima
□ End-to-end tok zamene

FAZA 5: Cloud i Skaliranje (Mesec 10-12)
═══════════════════════════════════════════════════════════════
□ Cloud backend
□ Podrska za vise depoa
□ Napredna analitika
□ Sistem OTA azuriranja
```

---

## 9. Otvorena Pitanja

1. **Fleet management sistem klijenta** - API ili custom integracija?
2. **Komunikacija sa vozilom** - ISO 15118, OCPP, proprietary?
3. **Integracija naplate** - direktno ili preko postojeceg sistema?
4. **Proizvodjac robota** - gotov proizvod ili custom?
5. **Multi-tenant** - jedan sistem za vise operatora?

---

## Reference

- OCPP 2.0.1 Specifikacija (Open Charge Point Protocol)
- ISO 15118 (Komunikacija Vozilo-Mreza)
- IEC 61851 (Standardi za Punjenje EV)
- CANopen CiA 301/401
- MQTT 5.0 Specifikacija
