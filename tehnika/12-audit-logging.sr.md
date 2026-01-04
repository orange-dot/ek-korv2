# EK3 Revizijsko Logovanje

## Informacije o Dokumentu

| Polje | Vrednost |
|-------|----------|
| ID Dokumenta | EK-TECH-012 |
| Verzija | 1.0 |
| Datum | 2026-01-03 |
| Status | Aktivan |
| Autor | Elektrokombinacija Inženjering |

---

## 1. Pregled

### 1.1 Svrha

Revizijsko logovanje pruža:

1. **Dijagnostiku**: Brzo identifikovanje uzroka problema
2. **Forenziku**: Rekonstrukcija događaja nakon incidenta
3. **Usklađenost**: Ispunjavanje regulatornih zahteva (ISO 15118, OCPP 2.0)
4. **Analitiku**: Podaci za prediktivno održavanje i optimizaciju

### 1.2 Principi Dizajna

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PRINCIPI LOGOVANJA                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. LOKALNO PRVO                                                         │
│     Svaki modul loguje u svoju lokalnu flash memoriju                   │
│     Nema zavisnosti od mreže za kritično logovanje                      │
│                                                                          │
│  2. STRUKTURIRANO                                                        │
│     Fiksni format zapisa za mašinsko parsiranje                         │
│     Bez slobodnog teksta u događajima                                   │
│                                                                          │
│  3. KOMPRESOVANO                                                         │
│     Minimalni prostor po događaju (8 bytes)                             │
│     Batch kompresija za upload                                          │
│                                                                          │
│  4. SIGURNO                                                              │
│     Integritet zaštićen CRC-om                                          │
│     Neizmenjivo (circular buffer, bez brisanja)                         │
│                                                                          │
│  5. SLOJEVITO                                                            │
│     Nivo 1: Lokalni modul (7 dana)                                      │
│     Nivo 2: Station (90 dana)                                           │
│     Nivo 3: Cloud (2 godine+)                                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Lokalno Logovanje (Po Modulu)

### 2.1 Flash Organizacija

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     FLASH LAYOUT ZA LOGOVANJE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  STM32G474 Flash: 512 KB ukupno                                         │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 0x0800_0000 │ Bootloader        │ 16 KB   │                     │    │
│  ├─────────────┼───────────────────┼─────────┤                     │    │
│  │ 0x0800_4000 │ App Slot A        │ 192 KB  │                     │    │
│  ├─────────────┼───────────────────┼─────────┤                     │    │
│  │ 0x0803_4000 │ App Slot B        │ 192 KB  │                     │    │
│  ├─────────────┼───────────────────┼─────────┤                     │    │
│  │ 0x0806_4000 │ Konfiguracija     │ 16 KB   │                     │    │
│  ├─────────────┼───────────────────┼─────────┤                     │    │
│  │ 0x0806_8000 │ Audit Log ◄───────│ 64 KB   │◄── Posvećeno logu   │    │
│  ├─────────────┼───────────────────┼─────────┤                     │    │
│  │ 0x0807_8000 │ OTP Ključevi      │ 8 KB    │                     │    │
│  ├─────────────┼───────────────────┼─────────┤                     │    │
│  │ 0x0807_A000 │ Rezervisano       │ 24 KB   │                     │    │
│  └─────────────┴───────────────────┴─────────┘                     │    │
│                                                                          │
│  Audit Log Oblast (64 KB):                                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Sektor 0 │ Sektor 1 │ Sektor 2 │ ... │ Sektor 15 │             │    │
│  │  4 KB    │  4 KB    │  4 KB    │     │  4 KB     │             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Circular Buffer:                                                        │
│  • 16 sektora × 4 KB = 64 KB                                            │
│  • Veličina zapisa: 8 bytes                                             │
│  • Max zapisa: 8192 događaja                                            │
│  • Pri 100 događaja/dan: ~82 dana lokalne istorije                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Format Log Unosa

```c
/* 8-byte log unos - optimizovan za flash efikasnost */
typedef struct __attribute__((packed)) {
    uint32_t timestamp;     /* Sekunde od boot-a ili Unix epoch */
    uint16_t event_code;    /* Tip događaja (videti tabelu) */
    uint8_t severity;       /* 0=Debug, 1=Info, 2=Warning, 3=Error, 4=Critical */
    uint8_t data;           /* Podaci specifični za događaj */
} LogEntry_t;

_Static_assert(sizeof(LogEntry_t) == 8, "LogEntry mora biti 8 bytes");
```

### 2.3 Upravljanje Kružnim Baferom

```c
#define LOG_SECTOR_SIZE     4096
#define LOG_SECTOR_COUNT    16
#define LOG_ENTRY_SIZE      8
#define LOG_ENTRIES_PER_SECTOR (LOG_SECTOR_SIZE / LOG_ENTRY_SIZE)

typedef struct {
    uint32_t write_sector;      /* Trenutni sektor za pisanje */
    uint32_t write_offset;      /* Offset u okviru sektora */
    uint32_t oldest_sector;     /* Najstariji sektor (za čitanje) */
    uint32_t sequence_number;   /* Globalni sekventni broj */
} LogState_t;

static LogState_t log_state;

void WriteLogEntry(const LogEntry_t *entry) {
    uint32_t flash_addr = LOG_BASE_ADDR +
                          (log_state.write_sector * LOG_SECTOR_SIZE) +
                          log_state.write_offset;

    /* Upiši unos u flash */
    HAL_FLASH_Unlock();
    HAL_FLASH_Program(FLASH_TYPEPROGRAM_DOUBLEWORD,
                      flash_addr,
                      *(uint64_t *)entry);
    HAL_FLASH_Lock();

    /* Ažuriraj poziciju pisanja */
    log_state.write_offset += LOG_ENTRY_SIZE;
    if (log_state.write_offset >= LOG_SECTOR_SIZE) {
        /* Pređi na sledeći sektor */
        log_state.write_offset = 0;
        log_state.write_sector = (log_state.write_sector + 1) % LOG_SECTOR_COUNT;

        /* Ako smo sustigli najstariji, pomeri ga */
        if (log_state.write_sector == log_state.oldest_sector) {
            log_state.oldest_sector = (log_state.oldest_sector + 1) % LOG_SECTOR_COUNT;
            /* Obriši sledeći sektor za pisanje */
            HAL_FLASH_Unlock();
            FLASH_Erase_Sector(log_state.write_sector, FLASH_VOLTAGE_RANGE_3);
            HAL_FLASH_Lock();
        }
    }

    log_state.sequence_number++;
}
```

---

## 3. Tipovi Događaja

### 3.1 Kategorije Događaja

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      KATEGORIJE KODOVA DOGAĐAJA                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  0x00xx: Događaji Snage                                                  │
│  0x01xx: Događaji Stanja                                                 │
│  0x02xx: Termalni Događaji                                               │
│  0x03xx: Komunikacioni Događaji                                          │
│  0x04xx: Swap Događaji (zamena modula)                                   │
│  0x05xx: Bezbednosni Događaji                                            │
│  0x06xx: Firmware Događaji                                               │
│  0x07xx: Dijagnostički Događaji                                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Detaljna Tabela Tipova Događaja

| Kod | Ime | Kategorija | Ozbiljnost | Podatak (byte 7) |
|-----|-----|------------|------------|------------------|
| 0x0001 | POWER_ON | Snaga | Info | Nivo napona (V/10) |
| 0x0002 | POWER_OFF | Snaga | Info | Razlog (enum) |
| 0x0003 | POWER_TARGET_SET | Snaga | Info | Ciljna snaga (W/100) |
| 0x0004 | POWER_LIMIT_HIT | Snaga | Warning | Limit tip |
| 0x0005 | OUTPUT_ENABLED | Snaga | Info | 0 |
| 0x0006 | OUTPUT_DISABLED | Snaga | Info | Razlog (enum) |
| 0x0100 | STATE_BOOT | Stanje | Info | Boot razlog |
| 0x0101 | STATE_STANDBY | Stanje | Info | 0 |
| 0x0102 | STATE_ACTIVE | Stanje | Info | 0 |
| 0x0103 | STATE_DEGRADED | Stanje | Warning | Degradacija % |
| 0x0104 | STATE_FAULT | Stanje | Error | Kod kvara |
| 0x0200 | TEMP_WARNING | Termalni | Warning | Temperatura °C |
| 0x0201 | TEMP_CRITICAL | Termalni | Critical | Temperatura °C |
| 0x0202 | FAN_SPEED_CHANGE | Termalni | Info | PWM % |
| 0x0203 | THERMAL_THROTTLE | Termalni | Warning | Derating % |
| 0x0300 | CAN_TX | Komunikacija | Debug | Tip poruke |
| 0x0301 | CAN_RX | Komunikacija | Debug | Tip poruke |
| 0x0302 | CAN_ERROR | Komunikacija | Warning | Kod greške |
| 0x0303 | CAN_FAILOVER | Komunikacija | Warning | A→B ili B→A |
| 0x0400 | SWAP_DETECTED | Swap | Info | Stari slot ID |
| 0x0401 | SWAP_COMPLETE | Swap | Info | Novi slot ID |
| 0x0402 | SWAP_FAILED | Swap | Error | Razlog |
| 0x0500 | AUTH_SUCCESS | Bezbednost | Info | Uloga pošiljaoca |
| 0x0501 | AUTH_FAILURE | Bezbednost | Warning | Razlog odbijanja |
| 0x0502 | KEY_ROTATED | Bezbednost | Info | Nova epoha |
| 0x0503 | TAMPER_DETECTED | Bezbednost | Critical | Tip tamper-a |
| 0x0600 | FW_UPDATE_START | Firmware | Info | Verzija (major) |
| 0x0601 | FW_UPDATE_CHUNK | Firmware | Debug | Chunk indeks |
| 0x0602 | FW_UPDATE_COMPLETE | Firmware | Info | Nova verzija |
| 0x0603 | FW_UPDATE_FAILED | Firmware | Error | Kod greške |
| 0x0604 | BOOT_SIGNATURE_OK | Firmware | Info | Slot (A/B) |
| 0x0605 | BOOT_SIGNATURE_FAIL | Firmware | Critical | Slot (A/B) |
| 0x0700 | SELF_TEST_PASS | Dijagnostika | Info | Test ID |
| 0x0701 | SELF_TEST_FAIL | Dijagnostika | Error | Test ID |
| 0x0702 | WATCHDOG_RESET | Dijagnostika | Warning | Task ID |

---

## 4. Sinhronizacija na Station

### 4.1 Batch Upload Protokol

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      BATCH UPLOAD PROTOKOL                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Modul                              Station Controller                   │
│     │                                       │                            │
│     │ ──── LOG_BATCH_START ───────────────► │                            │
│     │      (module_id, entry_count,         │                            │
│     │       first_seq, last_seq)            │                            │
│     │                                       │                            │
│     │ ◄──── LOG_BATCH_ACK ─────────────── │                            │
│     │       (ready, buffer_space)           │                            │
│     │                                       │                            │
│     │ ──── LOG_CHUNK[0] ─────────────────► │                            │
│     │      (64 bytes = 8 unosa)             │                            │
│     │                                       │                            │
│     │ ──── LOG_CHUNK[1] ─────────────────► │                            │
│     │      ...                              │                            │
│     │                                       │                            │
│     │ ──── LOG_CHUNK[n] ─────────────────► │                            │
│     │                                       │                            │
│     │ ◄──── LOG_BATCH_COMPLETE ───────── │                            │
│     │       (received_count, crc_ok)        │                            │
│     │                                       │                            │
│     │ ──── LOG_BATCH_CONFIRM ───────────► │                            │
│     │      (modul može sada označiti kao   │                            │
│     │       upload-ovano)                   │                            │
│                                                                          │
│  Period: Svaka 5 minuta ili kada bafer dostigene 80%                    │
│  Format: CBOR enkodiranje za kompaktnost                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 CBOR Enkodiranje

```c
/* CBOR enkodiranje za efikasan transfer */
#include "tinycbor.h"

size_t EncodeLogBatch(const LogEntry_t *entries, size_t count,
                       uint8_t *buffer, size_t buffer_size) {
    CborEncoder encoder, array;

    cbor_encoder_init(&encoder, buffer, buffer_size, 0);
    cbor_encoder_create_array(&encoder, &array, count);

    for (size_t i = 0; i < count; i++) {
        CborEncoder entry;
        cbor_encoder_create_array(&array, &entry, 4);

        cbor_encode_uint(&entry, entries[i].timestamp);
        cbor_encode_uint(&entry, entries[i].event_code);
        cbor_encode_uint(&entry, entries[i].severity);
        cbor_encode_uint(&entry, entries[i].data);

        cbor_encoder_close_container(&array, &entry);
    }

    cbor_encoder_close_container(&encoder, &array);

    return cbor_encoder_get_buffer_size(&encoder, buffer);
}
```

---

## 5. Forenzička Analiza

### 5.1 Rekonstrukcija Događaja

Kada se dogodi incident, logovi omogućavaju vremensku rekonstrukciju:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   PRIMER FORENZIČKE ANALIZE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Incident: Modul #42 prešao u FAULT stanje u 14:32:15                   │
│                                                                          │
│  Vremenski prikaz loga:                                                 │
│                                                                          │
│  14:30:00  │ STATE_ACTIVE      │ Info    │ Normalan rad                │
│  14:30:45  │ TEMP_WARNING      │ Warning │ 85°C                        │
│  14:31:10  │ THERMAL_THROTTLE  │ Warning │ 20% derating                │
│  14:31:30  │ TEMP_WARNING      │ Warning │ 92°C                        │
│  14:31:45  │ FAN_SPEED_CHANGE  │ Info    │ 100% PWM                    │
│  14:32:00  │ TEMP_CRITICAL     │ Critical│ 98°C                        │
│  14:32:05  │ THERMAL_THROTTLE  │ Warning │ 50% derating                │
│  14:32:10  │ STATE_DEGRADED    │ Warning │ 50%                         │
│  14:32:15  │ TEMP_CRITICAL     │ Critical│ 105°C                       │
│  14:32:15  │ STATE_FAULT       │ Error   │ OTP_TRIP                    │
│  14:32:16  │ OUTPUT_DISABLED   │ Info    │ THERMAL                     │
│                                                                          │
│  Analiza:                                                               │
│  • Ventilator verovatno otkazao (~14:31) jer PWM 100% nije pomogao     │
│  • Sistem ispravno reagovao: throttle → degrade → fault                │
│  • Hardware OTP pravilno trigovao na 105°C                             │
│  • Preporuka: Proveriti ventilator modula #42                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Alat za Analizu Obrazaca

```python
#!/usr/bin/env python3
"""
Alat za analizu EK3 log obrazaca
"""

import struct
from collections import Counter
from datetime import datetime

def parse_log_file(filename):
    entries = []
    with open(filename, 'rb') as f:
        while True:
            data = f.read(8)
            if len(data) < 8:
                break
            timestamp, event_code, severity, data_byte = struct.unpack('<IHBB', data)
            entries.append({
                'timestamp': timestamp,
                'event_code': event_code,
                'severity': severity,
                'data': data_byte
            })
    return entries

def find_patterns(entries):
    """Pronađi česte sekvence događaja pre kvara"""
    fault_indices = [i for i, e in enumerate(entries) if e['event_code'] == 0x0104]

    patterns = []
    for idx in fault_indices:
        # Uzmi 10 događaja pre kvara
        start = max(0, idx - 10)
        pattern = [e['event_code'] for e in entries[start:idx]]
        patterns.append(tuple(pattern))

    return Counter(patterns).most_common(5)

def calculate_mtbf(entries):
    """Izračunaj Mean Time Between Failures"""
    fault_times = [e['timestamp'] for e in entries if e['event_code'] == 0x0104]
    if len(fault_times) < 2:
        return None

    intervals = [fault_times[i+1] - fault_times[i] for i in range(len(fault_times)-1)]
    return sum(intervals) / len(intervals)
```

---

## 6. Retencija Podataka

### 6.1 Politika Retencije

| Nivo | Lokacija | Kapacitet | Period Retencije | Sadržaj |
|------|----------|-----------|------------------|---------|
| 1 | Flash Modula | 64 KB | ~7 dana | Svi događaji |
| 2 | Station Controller | 1 GB | 90 dana | Svi događaji |
| 3 | Cloud | Neograničeno | 2+ godine | Agregirano + kritično |

### 6.2 Strategija Agregacije

Pri prelasku sa Nivoa 2 na Nivo 3, podaci se agregiraju:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      STRATEGIJA AGREGACIJE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Nivo 2 (Station) - Sirovi Podaci:                                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 14:00:00 TEMP=62°C                                              │    │
│  │ 14:00:01 TEMP=63°C                                              │    │
│  │ 14:00:02 TEMP=62°C                                              │    │
│  │ ... (3600 unosa/sat)                                            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Nivo 3 (Cloud) - Agregirano:                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 14:00-15:00: TEMP avg=64°C, min=58°C, max=72°C                  │    │
│  │              POWER avg=2.8kW, total_energy=2.8kWh               │    │
│  │              EVENTS: 0 warnings, 0 errors                       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Izuzeci (uvek se čuvaju puni podaci):                                  │
│  • Svi Critical događaji                                                │
│  • Svi Error događaji                                                   │
│  • ±5 minuta oko svakog Warning-a                                      │
│  • Svi swap događaji                                                    │
│  • Svi bezbednosni događaji                                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Reference

| Dokument | Opis |
|----------|------|
| `tehnika/10-microkernel-architecture.md` | Arhitektura sistema |
| `tehnika/11-security-model.md` | Logovanje bezbednosnih događaja |
| `tehnika/14-firmware-architecture.md` | Flash layout |
| OCPP 2.0.1 | Zahtevi za logovanje punjača |
| ISO 15118-2 | V2G zahtevi za usklađenost |

---

## Dodatak A: Referenca Kodova Događaja

```c
/* Kompletna enum lista kodova događaja */
typedef enum {
    /* 0x00xx: Snaga */
    EVT_POWER_ON            = 0x0001,
    EVT_POWER_OFF           = 0x0002,
    EVT_POWER_TARGET_SET    = 0x0003,
    EVT_POWER_LIMIT_HIT     = 0x0004,
    EVT_OUTPUT_ENABLED      = 0x0005,
    EVT_OUTPUT_DISABLED     = 0x0006,

    /* 0x01xx: Stanje */
    EVT_STATE_BOOT          = 0x0100,
    EVT_STATE_STANDBY       = 0x0101,
    EVT_STATE_ACTIVE        = 0x0102,
    EVT_STATE_DEGRADED      = 0x0103,
    EVT_STATE_FAULT         = 0x0104,

    /* 0x02xx: Termalni */
    EVT_TEMP_WARNING        = 0x0200,
    EVT_TEMP_CRITICAL       = 0x0201,
    EVT_FAN_SPEED_CHANGE    = 0x0202,
    EVT_THERMAL_THROTTLE    = 0x0203,

    /* 0x03xx: Komunikacija */
    EVT_CAN_TX              = 0x0300,
    EVT_CAN_RX              = 0x0301,
    EVT_CAN_ERROR           = 0x0302,
    EVT_CAN_FAILOVER        = 0x0303,

    /* 0x04xx: Swap */
    EVT_SWAP_DETECTED       = 0x0400,
    EVT_SWAP_COMPLETE       = 0x0401,
    EVT_SWAP_FAILED         = 0x0402,

    /* 0x05xx: Bezbednost */
    EVT_AUTH_SUCCESS        = 0x0500,
    EVT_AUTH_FAILURE        = 0x0501,
    EVT_KEY_ROTATED         = 0x0502,
    EVT_TAMPER_DETECTED     = 0x0503,

    /* 0x06xx: Firmware */
    EVT_FW_UPDATE_START     = 0x0600,
    EVT_FW_UPDATE_CHUNK     = 0x0601,
    EVT_FW_UPDATE_COMPLETE  = 0x0602,
    EVT_FW_UPDATE_FAILED    = 0x0603,
    EVT_BOOT_SIGNATURE_OK   = 0x0604,
    EVT_BOOT_SIGNATURE_FAIL = 0x0605,

    /* 0x07xx: Dijagnostika */
    EVT_SELF_TEST_PASS      = 0x0700,
    EVT_SELF_TEST_FAIL      = 0x0701,
    EVT_WATCHDOG_RESET      = 0x0702,
} EventCode_t;
```

---

## Dodatak B: Zahtevi Prostora za Skladištenje

| Komponenta | Tip Događaja | Događaji/Dan | Bytes/Dan |
|------------|--------------|--------------|-----------|
| Normalan rad | Periodični status | 8640 | 69 KB |
| Termalni | Promene temperature | 100 | 800 B |
| Snaga | Promene snage | 50 | 400 B |
| Komunikacija | CAN saobraćaj | 1000 | 8 KB |
| **Ukupno (tipično)** | | ~10000 | **~80 KB/dan** |
| **Ukupno (intenzivno)** | | ~50000 | **~400 KB/dan** |
