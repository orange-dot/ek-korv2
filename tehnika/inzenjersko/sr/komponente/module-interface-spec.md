# EK3 Specifikacija Interfejsa Modula

## Informacije o Dokumentu

| Polje | Vrednost |
|-------|----------|
| ID Dokumenta | EK-COMP-INT-001 |
| Verzija | 1.0 |
| Datum | 2026-01-03 |
| Status | Aktivan |
| Autor | Elektrokombinacija Inženjering |

---

## 1. Pregled Interfejsa

### 1.1 Fizički Interfejs

EK3 modul komunicira sa rack-om i drugim modulima preko 20-pinskog blind-mate konektora koji pruža:

| Interfejs | Pinovi | Svrha |
|-----------|--------|-------|
| Snaga | 4 (DC+, DC-) | DC bus konekcija (800V) |
| Masa | 2 | Masa šasije/bezbednosna |
| CAN-A | 2 | Primarni komunikacioni bus |
| CAN-B | 2 | Rezervni komunikacioni bus |
| SPI | 4 | Port za dijagnostiku |
| I2C | 2 | EEPROM/konfiguracija |
| ID | 2 | Identifikacija slota |
| Ključ | 2 | Mehanički ključ (bez kontakta) |

### 1.2 Logički Interfejs

Logički interfejs se sastoji od:

1. **CAN-FD Poruke**: Strukturirani komunikacioni protokol
2. **Mašina Stanja**: Operativna stanja modula
3. **Model Mogućnosti**: Kontrola pristupa i dozvole
4. **Verzija Protokola**: Kompatibilnost unazad

---

## 2. Ugovori CAN Poruka

### 2.1 Struktura Proširenog ID-a (29-bit)

Sve EK3 CAN poruke koriste proširene identifikatore:

```
┌─────────────────────────────────────────────────────────────────┐
│                   29-bitni Prošireni CAN ID                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Pozicija Bita:                                                  │
│  28  27  26  25  24  23  22  21  20  19  18  17  16  15  14     │
│  ├───┴───┴───┴───┼───┴───┴───┴───┼───┴───┴───┴───┴───┴───┤     │
│  │   Prioritet   │   Tip Poruke  │    ID Izvornog Modula  │     │
│  │   (4 bita)    │   (4 bita)    │      (8 bita)          │     │
│                                                                  │
│  Pozicija Bita:                                                  │
│  13  12  11  10   9   8   7   6   5   4   3   2   1   0         │
│  ├───┴───┴───┴───┴───┴───┴───┴───┼───┴───┴───┴───┴───┴───┤     │
│  │      ID Ciljnog Modula        │       Sekvenca         │     │
│  │      (8 bita)                 │       (5 bita)         │     │
│                                                                  │
│  Definicije Polja:                                               │
│  ┌──────────────┬────────────────────────────────────────────┐  │
│  │ Prioritet    │ 0x0=Kritičan, 0x1=Visok, 0x2=Sred, 0xF=Nizak│  │
│  │ Tip Poruke   │ Videti Sekciju 2.2                         │  │
│  │ ID Izvora    │ ID Modula (0x00-0xFE), 0xFF=Stanica        │  │
│  │ ID Cilja     │ ID Modula, 0xFF=Broadcast                  │  │
│  │ Sekvenca     │ Rotirajuća 0-31 za replay zaštitu          │  │
│  └──────────────┴────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Definicije Tipova Poruka

| Kod Tipa | Ime | Prioritet | Opis |
|----------|-----|-----------|------|
| 0x0 | SYNC | Kritičan | Vremenska sinhronizacija |
| 0x1 | ELECTION | Visok | Izbor lidera (Raft) |
| 0x2 | HEARTBEAT | Srednji | Periodični status |
| 0x3 | POWER_CMD | Visok | Komande snage |
| 0x4 | POWER_ACK | Visok | Potvrda snage |
| 0x5 | THERMAL | Srednji | Deljenje temperature |
| 0x6 | CONFIG | Nizak | Čitanje/pisanje konfiguracije |
| 0x7 | FAULT | Kritičan | Notifikacija o kvaru |
| 0x8 | DIAG_REQ | Nizak | Zahtev za dijagnostiku |
| 0x9 | DIAG_RSP | Nizak | Odgovor dijagnostike |
| 0xA | LOG | Nizak | Upload log unosa |
| 0xB | SWAP_NOTIFY | Visok | Notifikacija o hot-swap-u |
| 0xC-0xE | Rezervisano | - | Buduća upotreba |
| 0xF | FW_UPDATE | Pozadinski | Ažuriranje firmware-a |

### 2.3 Format CAN-FD Payload-a (64 bytes max)

**Standardno Zaglavlje Poruke (8 bytes):**

```
┌─────────────────────────────────────────────────────────────────┐
│                   Zaglavlje Poruke (Bytes 0-7)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Byte 0-1: Verzija protokola (uint16_t, little-endian)          │
│            Trenutna verzija: 0x0100 (v1.0)                       │
│                                                                  │
│  Byte 2: Flagovi poruke                                          │
│          Bit 0: Zahteva ACK                                      │
│          Bit 1: Je odgovor                                       │
│          Bit 2: Ima CMAC potpis                                  │
│          Bit 3: Fragmentirana poruka                             │
│          Bit 4-7: Rezervisano                                    │
│                                                                  │
│  Byte 3: Info o fragmentu (ako je fragmentirana)                 │
│          Bitovi 0-3: Indeks fragmenta                            │
│          Bitovi 4-7: Ukupno fragmenata                           │
│                                                                  │
│  Byte 4-7: Timestamp (uint32_t, ms od epoch-a ili boot-a)        │
│                                                                  │
│  Byte 8-63: Payload (specifičan za tip)                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Specifikacije Poruka

### 3.1 HEARTBEAT (0x2)

Broadcast svake 1 sekunde od svakog modula.

```
┌─────────────────────────────────────────────────────────────────┐
│                    HEARTBEAT Poruka                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CAN ID: Prioritet=0x2, Tip=0x2, Src=module_id, Tgt=0xFF        │
│  Primer: 0x12200FF (modul 0x20 broadcast)                        │
│                                                                  │
│  Payload (32 bytes):                                             │
│  ┌────────┬────────┬─────────────────────────────────────────┐  │
│  │ Offset │ Veličina│ Polje                                   │  │
│  ├────────┼────────┼─────────────────────────────────────────┤  │
│  │ 0      │ 2      │ Verzija protokola                       │  │
│  │ 2      │ 1      │ Flagovi (0x00)                          │  │
│  │ 3      │ 1      │ Rezervisano                             │  │
│  │ 4      │ 4      │ Timestamp (ms)                          │  │
│  │ 8      │ 1      │ Stanje modula (enum)                    │  │
│  │ 9      │ 1      │ Flagovi zdravlja                        │  │
│  │ 10     │ 2      │ Izlazna snaga (W)                       │  │
│  │ 12     │ 2      │ Izlazni napon (mV ÷ 10)                 │  │
│  │ 14     │ 2      │ Izlazna struja (mA)                     │  │
│  │ 16     │ 2      │ Temperatura PCB-a (°C × 10)             │  │
│  │ 18     │ 2      │ Temperatura MOSFET-a (°C × 10)          │  │
│  │ 20     │ 2      │ Ulazni napon (mV ÷ 10)                  │  │
│  │ 22     │ 4      │ Uptime (sekunde)                        │  │
│  │ 26     │ 2      │ Broj grešaka (kumulativno)              │  │
│  │ 28     │ 4      │ CRC32 payload-a                         │  │
│  └────────┴────────┴─────────────────────────────────────────┘  │
│                                                                  │
│  Flagovi Zdravlja (byte 9):                                      │
│  Bit 0: Upozorenje za pregrevanje                               │
│  Bit 1: Upozorenje za podnapon                                  │
│  Bit 2: Upozorenje za prekostruju                               │
│  Bit 3: Kvar ventilatora                                        │
│  Bit 4: Degradirana komunikacija                                │
│  Bit 5: Potrebna kalibracija                                    │
│  Bit 6-7: Rezervisano                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 POWER_CMD (0x3)

Komanda nivoa snage od station kontrolera ka modulu.

```
┌─────────────────────────────────────────────────────────────────┐
│                    POWER_CMD Poruka                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CAN ID: Prioritet=0x1, Tip=0x3, Src=0xFF, Tgt=module_id        │
│  Primer: 0x113FF20 (stanica ka modulu 0x20)                      │
│                                                                  │
│  Payload (24 bytes):                                             │
│  ┌────────┬────────┬─────────────────────────────────────────┐  │
│  │ Offset │ Veličina│ Polje                                   │  │
│  ├────────┼────────┼─────────────────────────────────────────┤  │
│  │ 0      │ 2      │ Verzija protokola                       │  │
│  │ 2      │ 1      │ Flagovi (0x01 = zahteva ACK)            │  │
│  │ 3      │ 1      │ Rezervisano                             │  │
│  │ 4      │ 4      │ Timestamp (ms)                          │  │
│  │ 8      │ 1      │ Tip komande (enum)                      │  │
│  │ 9      │ 1      │ Rezervisano                             │  │
│  │ 10     │ 2      │ Ciljna snaga (W)                        │  │
│  │ 12     │ 2      │ Ciljni napon (mV ÷ 10)                  │  │
│  │ 14     │ 2      │ Limit struje (mA)                       │  │
│  │ 16     │ 8      │ CMAC potpis (ako je flag postavljen)    │  │
│  └────────┴────────┴─────────────────────────────────────────┘  │
│                                                                  │
│  Tipovi Komandi (byte 8):                                        │
│  0x00: SET_POWER - Postavi nivo snage                           │
│  0x01: ENABLE - Omogući izlaz                                   │
│  0x02: DISABLE - Onemogući izlaz                                │
│  0x03: SOFT_START - Postepeno povećavanje                       │
│  0x04: EMERGENCY_STOP - Trenutno gašenje                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 POWER_ACK (0x4)

Odgovor na POWER_CMD.

```
┌─────────────────────────────────────────────────────────────────┐
│                    POWER_ACK Poruka                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CAN ID: Prioritet=0x1, Tip=0x4, Src=module_id, Tgt=0xFF        │
│  Primer: 0x11420FF (modul 0x20 potvrđuje)                        │
│                                                                  │
│  Payload (20 bytes):                                             │
│  ┌────────┬────────┬─────────────────────────────────────────┐  │
│  │ Offset │ Veličina│ Polje                                   │  │
│  ├────────┼────────┼─────────────────────────────────────────┤  │
│  │ 0      │ 2      │ Verzija protokola                       │  │
│  │ 2      │ 1      │ Flagovi (0x02 = je odgovor)             │  │
│  │ 3      │ 1      │ Rezervisano                             │  │
│  │ 4      │ 4      │ Timestamp (ms)                          │  │
│  │ 8      │ 1      │ Kod rezultata                           │  │
│  │ 9      │ 1      │ Rezervisano                             │  │
│  │ 10     │ 2      │ Stvarna snaga (W)                       │  │
│  │ 12     │ 2      │ Stvarni napon (mV ÷ 10)                 │  │
│  │ 14     │ 2      │ Stvarna struja (mA)                     │  │
│  │ 16     │ 4      │ CRC32 payload-a                         │  │
│  └────────┴────────┴─────────────────────────────────────────┘  │
│                                                                  │
│  Kodovi Rezultata (byte 8):                                      │
│  0x00: SUCCESS                                                  │
│  0x01: PARTIAL - Cilj modifikovan zbog limita                   │
│  0x02: REJECTED_THERMAL - Temperatura previsoka                 │
│  0x03: REJECTED_FAULT - Modul u stanju kvara                    │
│  0x04: REJECTED_AUTH - Autentifikacija neuspela                 │
│  0x05: REJECTED_VERSION - Nepodudaranje verzije protokola       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 THERMAL (0x5)

Deljenje temperature za distribuirano termalno upravljanje.

```
┌─────────────────────────────────────────────────────────────────┐
│                    THERMAL Poruka                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CAN ID: Prioritet=0x2, Tip=0x5, Src=module_id, Tgt=0xFF        │
│                                                                  │
│  Payload (16 bytes):                                             │
│  ┌────────┬────────┬─────────────────────────────────────────┐  │
│  │ Offset │ Veličina│ Polje                                   │  │
│  ├────────┼────────┼─────────────────────────────────────────┤  │
│  │ 0      │ 2      │ Verzija protokola                       │  │
│  │ 2      │ 1      │ Flagovi                                 │  │
│  │ 3      │ 1      │ Tip zahteva                             │  │
│  │ 4      │ 4      │ Timestamp (ms)                          │  │
│  │ 8      │ 2      │ Trenutna temperatura (°C × 10)          │  │
│  │ 10     │ 2      │ Rezerva snage (W dostupno)              │  │
│  │ 12     │ 2      │ Zahtevano smanjenje (W)                 │  │
│  │ 14     │ 2      │ CRC16                                   │  │
│  └────────┴────────┴─────────────────────────────────────────┘  │
│                                                                  │
│  Tipovi Zahteva (byte 3):                                        │
│  0x00: STATUS_ONLY - Samo izveštavanje temperature              │
│  0x01: REQUEST_HELP - Treba smanjenje snage od suseda           │
│  0x02: OFFER_HELP - Može prihvatiti dodatno opterećenje         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5 FAULT (0x7)

Notifikacija o kritičnom kvaru (najviši prioritet).

```
┌─────────────────────────────────────────────────────────────────┐
│                    FAULT Poruka                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CAN ID: Prioritet=0x0, Tip=0x7, Src=module_id, Tgt=0xFF        │
│  Primer: 0x00720FF (modul 0x20, kritičan kvar broadcast)         │
│                                                                  │
│  Payload (28 bytes):                                             │
│  ┌────────┬────────┬─────────────────────────────────────────┐  │
│  │ Offset │ Veličina│ Polje                                   │  │
│  ├────────┼────────┼─────────────────────────────────────────┤  │
│  │ 0      │ 2      │ Verzija protokola                       │  │
│  │ 2      │ 1      │ Flagovi                                 │  │
│  │ 3      │ 1      │ Ozbiljnost (1-5)                        │  │
│  │ 4      │ 4      │ Timestamp (ms)                          │  │
│  │ 8      │ 2      │ Kod kvara                               │  │
│  │ 10     │ 2      │ Pod-kod                                 │  │
│  │ 12     │ 4      │ Vrednost kvara (zavisno od konteksta)   │  │
│  │ 16     │ 8      │ Snimak stanja modula                    │  │
│  │ 24     │ 4      │ CRC32                                   │  │
│  └────────┴────────┴─────────────────────────────────────────┘  │
│                                                                  │
│  Nivoi Ozbiljnosti:                                              │
│  1: INFO - Samo logirano                                        │
│  2: WARNING - Upozorenje, rad nastavlja                         │
│  3: ERROR - Degradiran rad                                      │
│  4: CRITICAL - Gašenje modula, ostali kompenzuju                │
│  5: EMERGENCY - Pokrenuto gašenje celog sistema                 │
│                                                                  │
│  Kodovi Kvarova:                                                 │
│  0x0100-0x01FF: Kvarovi energetskog stepena (OCP, OVP, itd.)    │
│  0x0200-0x02FF: Termalni kvarovi                                │
│  0x0300-0x03FF: Komunikacioni kvarovi                           │
│  0x0400-0x04FF: Firmware/softver kvarovi                        │
│  0x0500-0x05FF: Konfiguracija kvarovi                           │
│  0x0600-0x06FF: Bezbednosni kvarovi                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.6 ELECTION (0x1)

Raft poruke za izbor lidera.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ELECTION Poruka                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CAN ID: Prioritet=0x1, Tip=0x1, Src=module_id, Tgt=0xFF        │
│                                                                  │
│  Payload (24 bytes):                                             │
│  ┌────────┬────────┬─────────────────────────────────────────┐  │
│  │ Offset │ Veličina│ Polje                                   │  │
│  ├────────┼────────┼─────────────────────────────────────────┤  │
│  │ 0      │ 2      │ Verzija protokola                       │  │
│  │ 2      │ 1      │ Flagovi                                 │  │
│  │ 3      │ 1      │ Tip izbora                              │  │
│  │ 4      │ 4      │ Timestamp (ms)                          │  │
│  │ 8      │ 4      │ Broj termina                            │  │
│  │ 12     │ 1      │ ID kandidata                            │  │
│  │ 13     │ 1      │ Trenutni ID lidera (0xFF ako nema)      │  │
│  │ 14     │ 2      │ Indeks loga                             │  │
│  │ 16     │ 4      │ Termin loga                             │  │
│  │ 20     │ 4      │ CRC32                                   │  │
│  └────────┴────────┴─────────────────────────────────────────┘  │
│                                                                  │
│  Tipovi Izbora (byte 3):                                         │
│  0x00: REQUEST_VOTE - Kandidat traži glas                       │
│  0x01: VOTE_GRANT - Glas odobren                                │
│  0x02: VOTE_DENY - Glas odbijen                                 │
│  0x03: LEADER_ANNOUNCE - Lider objavljuje pobedu                │
│  0x04: APPEND_ENTRIES - Replikacija loga (heartbeat)            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Mašina Stanja Modula

### 4.1 Definicije Stanja

```
┌─────────────────────────────────────────────────────────────────┐
│                    Stanja Modula                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Stanje        │ Kod  │ Opis                               │  │
│  ├───────────────┼──────┼────────────────────────────────────┤  │
│  │ BOOT          │ 0x00 │ Inicijalno uključenje, samo-test   │  │
│  │ DISCOVERING   │ 0x01 │ Pronalaženje drugih modula na CAN  │  │
│  │ SYNCHRONIZING │ 0x02 │ Sinhr. vremena, pridruživanje swarm│  │
│  │ STANDBY       │ 0x03 │ Spreman, čeka komandu snage        │  │
│  │ ACTIVE        │ 0x04 │ Isporučuje snagu                   │  │
│  │ DEGRADED      │ 0x05 │ Smanjena mogućnost (termalno, itd) │  │
│  │ FAULT         │ 0x06 │ Stanje greške, izlaz onemogućen    │  │
│  │ MAINTENANCE   │ 0x07 │ Ručno preuzimanje, dijagnostika    │  │
│  │ UPDATING      │ 0x08 │ Ažuriranje firmware-a u toku       │  │
│  │ SHUTDOWN      │ 0x09 │ Sekvenca graceful gašenja          │  │
│  └───────────────┴──────┴────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Dijagram Prelaza Stanja

```
┌─────────────────────────────────────────────────────────────────┐
│                    Dijagram Prelaza Stanja                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                           ┌───────────┐                         │
│                           │   BOOT    │                         │
│                           │  (0x00)   │                         │
│                           └─────┬─────┘                         │
│                                 │ Samo-test OK                  │
│                                 ▼                               │
│                         ┌─────────────┐                         │
│                         │ DISCOVERING │                         │
│                         │   (0x01)    │                         │
│                         └──────┬──────┘                         │
│                                │ Pronađeni vršnjaci             │
│                                ▼                               │
│                       ┌──────────────────┐                      │
│                       │  SYNCHRONIZING   │                      │
│                       │     (0x02)       │                      │
│                       └────────┬─────────┘                      │
│                                │ Sinhr. završena                │
│                                ▼                               │
│            ┌───────────────────────────────────────┐            │
│            │              STANDBY                  │            │
│            │               (0x03)                  │            │
│            └───────┬───────────────────────┬───────┘            │
│                    │                       │                    │
│      Komanda snage │                       │ Zahtev za FW update│
│                    ▼                       ▼                   │
│            ┌───────────────┐       ┌───────────────┐            │
│            │    ACTIVE     │       │   UPDATING    │            │
│            │    (0x04)     │       │    (0x08)     │            │
│            └───────┬───────┘       └───────┬───────┘            │
│                    │                       │                    │
│     Termalni limit │       Update završen │                    │
│                    ▼                       │                    │
│            ┌───────────────┐               │                    │
│            │   DEGRADED    │               │                    │
│            │    (0x05)     │               │                    │
│            └───────┬───────┘               │                    │
│                    │                       │                    │
│       Bilo koji    │                       │                    │
│       kvar detektovan▼                     │                    │
│            ┌───────────────┐               │                    │
│            │    FAULT      │◄──────────────┘                    │
│            │    (0x06)     │                                    │
│            └───────┬───────┘                                    │
│                    │                                            │
│       Ručni reset  │                                            │
│                    ▼                                           │
│            ┌───────────────┐                                    │
│            │  MAINTENANCE  │                                    │
│            │    (0x07)     │                                    │
│            └───────────────┘                                    │
│                                                                  │
│  Napomena: SHUTDOWN (0x09) može se ući iz bilo kog stanja       │
│            putem komande za gašenje                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Uslovi za Prelaz (Guards)

| Od | Ka | Uslov |
|----|-----|-------|
| BOOT | DISCOVERING | Samo-test prošao |
| BOOT | FAULT | Samo-test neuspeo |
| DISCOVERING | SYNCHRONIZING | Najmanje 1 vršnjak pronađen (ili timeout za jedan modul) |
| SYNCHRONIZING | STANDBY | Sinhr. vremena < 1ms, članstvo u swarm potvrđeno |
| STANDBY | ACTIVE | Validna komanda snage primljena |
| ACTIVE | DEGRADED | Temperatura > 80°C ili drugi limit |
| ACTIVE | STANDBY | Komanda snage = 0 |
| DEGRADED | ACTIVE | Temperatura < 70°C (histerezis) |
| DEGRADED | FAULT | Limit prekoračen 3× u 1 minutu |
| Bilo koje | FAULT | Kritična greška detektovana |
| FAULT | MAINTENANCE | Ručna intervencija |
| MAINTENANCE | BOOT | Komanda za reset |
| Bilo koje | SHUTDOWN | Komanda za gašenje |

---

## 5. Model Mogućnosti

### 5.1 Definicije Uloga

```
┌─────────────────────────────────────────────────────────────────┐
│                    Hijerarhija Uloga                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Nivo 0: MODULE_PEER                                             │
│          • Drugi EK3 moduli u istom rack-u                      │
│          • Bez autentifikacije (ista zona poverenja)            │
│                                                                  │
│  Nivo 1: STATION_CONTROLLER                                      │
│          • Lokalni kontroler stanice za punjenje                │
│          • Autentifikovan putem mTLS sertifikata                │
│                                                                  │
│  Nivo 2: DEPOT_CONTROLLER                                        │
│          • Sistem upravljanja na nivou depoa                    │
│          • Autentifikovan putem lanca sertifikata               │
│                                                                  │
│  Nivo 3: CLOUD_ADMIN                                             │
│          • Udaljeno upravljanje flotom                          │
│          • Autentifikovan putem API ključa + OAuth2             │
│                                                                  │
│  Nivo 4: MAINTENANCE                                             │
│          • Tehničar na licu mesta                               │
│          • Autentifikovan putem značke/koda                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Matrica Dozvola

| Dozvola | MODULE_PEER | STATION | DEPOT | CLOUD | MAINTENANCE |
|---------|-------------|---------|-------|-------|-------------|
| READ_STATUS | Da | Da | Da | Da | Da |
| READ_CONFIG | Ne | Da | Da | Da | Da |
| SET_POWER | Ne | Da | Da | Ne | Da |
| SET_LIMITS | Ne | Da | Da | Ne | Da |
| SHUTDOWN | Ne | Da | Da | Da | Da |
| ENABLE | Ne | Da | Da | Ne | Da |
| WRITE_CONFIG | Ne | Ne | Da | Ne | Da |
| FIRMWARE_UPDATE | Ne | Ne | Da | Da | Da |
| FACTORY_RESET | Ne | Ne | Ne | Ne | Da |
| READ_KEYS | Ne | Ne | Ne | Ne | Ne* |
| WRITE_KEYS | Ne | Ne | Ne | Ne | Ne* |

*Ključevi se mogu provizionisati samo tokom proizvodnje

### 5.3 Validacija Komandi

```c
typedef enum {
    VALIDATE_OK = 0,
    VALIDATE_AUTH_FAIL,
    VALIDATE_PERMISSION_FAIL,
    VALIDATE_RANGE_FAIL,
    VALIDATE_STATE_FAIL,
    VALIDATE_SIGNATURE_FAIL,
    VALIDATE_REPLAY_FAIL
} ValidateResult_t;

ValidateResult_t ValidateCommand(const CANMessage_t *msg) {
    /* 1. Proveri CMAC potpis (ako je obavezan) */
    if (msg->flags & FLAG_HAS_CMAC) {
        if (!VerifyCMAC(msg)) {
            return VALIDATE_SIGNATURE_FAIL;
        }
    }

    /* 2. Proveri sekventni broj (replay zaštita) */
    if (!CheckSequence(msg->source, msg->sequence)) {
        return VALIDATE_REPLAY_FAIL;
    }

    /* 3. Identifikuj ulogu pošiljaoca */
    Role_t role = IdentifyRole(msg->source);

    /* 4. Proveri dozvolu za tip komande */
    Permission_t required = GetRequiredPermission(msg->type);
    if (!HasPermission(role, required)) {
        return VALIDATE_PERMISSION_FAIL;
    }

    /* 5. Proveri da li su parametri u validnom opsegu */
    if (!ValidateParameters(msg)) {
        return VALIDATE_RANGE_FAIL;
    }

    /* 6. Proveri da li je modul u validnom stanju za komandu */
    if (!StateAllowsCommand(g_module_state, msg->type)) {
        return VALIDATE_STATE_FAIL;
    }

    return VALIDATE_OK;
}
```

---

## 6. Verzionisanje Protokola

### 6.1 Format Verzije

```
Verzija: MAJOR.MINOR (uint16_t = 0xMMmm)

Trenutna: v1.0 = 0x0100

Pravila:
- MAJOR povećanje: Breaking promene (nekompatibilno)
- MINOR povećanje: Kompatibilni dodaci unazad
```

### 6.2 Politika Kompatibilnosti

| Verzija Pošiljaoca | Verzija Primaoca | Kompatibilnost |
|--------------------|------------------|----------------|
| 1.0 | 1.0 | Puna |
| 1.0 | 1.1 | Puna (primalac ignoriše nova polja) |
| 1.1 | 1.0 | Delimična (pošiljalac izostavlja nova polja) |
| 1.x | 2.x | Nema (odbijeno) |

### 6.3 Pregovaranje Verzije

Tokom DISCOVERING stanja, moduli razmenjuju informacije o verziji:

```
┌─────────────────────────────────────────────────────────────────┐
│                  Pregovaranje Verzije                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Modul A (v1.1)                    Modul B (v1.0)               │
│       │                                  │                       │
│       │ ─── HEARTBEAT(version=1.1) ────► │                       │
│       │                                  │                       │
│       │ ◄─── HEARTBEAT(version=1.0) ─── │                       │
│       │                                  │                       │
│       │ ─── (Koristi v1.0 protokol) ───► │                       │
│       │                                  │                       │
│       │     Komunikacija nastavlja       │                       │
│       │     koristeći najnižu zajedničku │                       │
│       │     verziju                      │                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Reference

| Dokument | Opis |
|----------|------|
| `tehnika/10-microkernel-architecture.md` | Arhitektura sistema |
| `tehnika/11-security-model.md` | Bezbednost i autentifikacija |
| `tehnika/05-swarm-intelligence.md` | Swarm protokoli (Raft) |
| `tehnika/15-ek3-connector-spec.md` | Fizički konektor |
| CAN 2.0B Specifikacija | Bosch |
| CAN-FD Specifikacija | ISO 11898-1:2015 |

---

## Dodatak A: Brza Referenca Poruka

| Tip | Kod | Prioritet | Period | Smer |
|-----|-----|-----------|--------|------|
| SYNC | 0x0 | Kritičan | 100ms | Lider→Svi |
| ELECTION | 0x1 | Visok | Na zahtev | Bilo→Svi |
| HEARTBEAT | 0x2 | Srednji | 1000ms | Modul→Svi |
| POWER_CMD | 0x3 | Visok | Na zahtev | Stanica→Modul |
| POWER_ACK | 0x4 | Visok | Odgovor | Modul→Stanica |
| THERMAL | 0x5 | Srednji | 5000ms | Modul→Svi |
| CONFIG | 0x6 | Nizak | Na zahtev | Bilo |
| FAULT | 0x7 | Kritičan | Na događaj | Modul→Svi |
| DIAG_REQ | 0x8 | Nizak | Na zahtev | Stanica→Modul |
| DIAG_RSP | 0x9 | Nizak | Odgovor | Modul→Stanica |
| LOG | 0xA | Nizak | Batch | Modul→Stanica |
| SWAP_NOTIFY | 0xB | Visok | Na događaj | Modul→Svi |
| FW_UPDATE | 0xF | Pozadinski | Chunk-ovi | Stanica→Modul |

---

## Dodatak B: Referenca Kodova Kvarova

| Kod | Ime | Ozbiljnost | Opis |
|-----|-----|------------|------|
| 0x0100 | OCP_TRIP | 4 | Zaštita od prekostruje aktivirana |
| 0x0101 | OVP_TRIP | 4 | Zaštita od prenapona aktivirana |
| 0x0102 | UVP_TRIP | 3 | Zaštita od podnapona aktivirana |
| 0x0103 | GROUND_FAULT | 4 | Kvar uzemljenja detektovan |
| 0x0200 | OTP_WARNING | 2 | Temperatura približava limitu |
| 0x0201 | OTP_TRIP | 4 | Gašenje zbog pregrevanja |
| 0x0202 | FAN_FAIL | 3 | Kvar ventilatora detektovan |
| 0x0300 | CAN_A_FAIL | 2 | Kvar primarnog CAN busa |
| 0x0301 | CAN_B_FAIL | 2 | Kvar rezervnog CAN busa |
| 0x0302 | CAN_BOTH_FAIL | 5 | Oba CAN busa otkazala |
| 0x0400 | WATCHDOG | 4 | Watchdog timeout |
| 0x0401 | STACK_OVERFLOW | 4 | Prekoračenje steka taska |
| 0x0500 | CONFIG_CORRUPT | 3 | Neuspela provera konfiguracije |
| 0x0600 | AUTH_FAIL | 2 | Neuspela autentifikacija |
| 0x0601 | TAMPER_DETECT | 4 | Fizički tamper detektovan |
