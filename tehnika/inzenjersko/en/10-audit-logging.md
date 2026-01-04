# EK3 Audit Logging System

## Document Information

| Field | Value |
|-------|-------|
| Document ID | EK-TECH-012 |
| Version | 1.0 |
| Date | 2026-01-03 |
| Status | Active |
| Author | Elektrokombinacija Engineering |

---

## 1. Overview

### 1.1 Purpose

The EK3 audit logging system provides:

1. **Diagnostics**: Troubleshoot issues with operational data
2. **Forensics**: Post-incident analysis and root cause determination
3. **Compliance**: Meet regulatory requirements for logging
4. **Predictive Maintenance**: Data for AI-based failure prediction

### 1.2 Logging Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Logging Data Flow                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌─────────────┐                                              │
│    │   Module    │                                              │
│    │   Events    │                                              │
│    └──────┬──────┘                                              │
│           │                                                      │
│           ▼                                                      │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │            LOCAL FLASH STORAGE (64 KB)                  │  │
│    │            • Circular buffer                             │  │
│    │            • ~10,000 events                              │  │
│    │            • 7-day retention                             │  │
│    └─────────────────────────────┬───────────────────────────┘  │
│                                  │ Every 5 minutes              │
│                                  ▼                              │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │            STATION CONTROLLER                            │  │
│    │            • Aggregates from all modules                 │  │
│    │            • 90-day retention                            │  │
│    │            • Query interface                             │  │
│    └─────────────────────────────┬───────────────────────────┘  │
│                                  │ Daily upload                 │
│                                  ▼                              │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │            CLOUD STORAGE                                 │  │
│    │            • Long-term archive                           │  │
│    │            • 2-year retention                            │  │
│    │            • Analytics and ML                            │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Local Logging (Per Module)

### 2.1 Flash Storage Layout

The audit log occupies 64 KB of flash memory:

```
┌─────────────────────────────────────────────────────────────────┐
│               Audit Log Flash Layout (64 KB)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Address         Size      Purpose                               │
│  ───────────────────────────────────────────────────────────     │
│  0x08068000      4 KB      Sector 0 (events 0-511)              │
│  0x08069000      4 KB      Sector 1 (events 512-1023)           │
│  0x0806A000      4 KB      Sector 2 (events 1024-1535)          │
│  0x0806B000      4 KB      Sector 3 (events 1536-2047)          │
│  0x0806C000      4 KB      Sector 4 (events 2048-2559)          │
│  0x0806D000      4 KB      Sector 5 (events 2560-3071)          │
│  0x0806E000      4 KB      Sector 6 (events 3072-3583)          │
│  0x0806F000      4 KB      Sector 7 (events 3584-4095)          │
│  0x08070000      4 KB      Sector 8 (events 4096-4607)          │
│  0x08071000      4 KB      Sector 9 (events 4608-5119)          │
│  0x08072000      4 KB      Sector 10 (events 5120-5631)         │
│  0x08073000      4 KB      Sector 11 (events 5632-6143)         │
│  0x08074000      4 KB      Sector 12 (events 6144-6655)         │
│  0x08075000      4 KB      Sector 13 (events 6656-7167)         │
│  0x08076000      4 KB      Sector 14 (events 7168-7679)         │
│  0x08077000      4 KB      Sector 15 (events 7680-8191)         │
│                                                                  │
│  Total: 16 sectors × 4 KB = 64 KB                               │
│  Event size: 8 bytes                                            │
│  Capacity: 64 KB / 8 = 8,192 events                             │
│  At 1 event/second: ~2.3 hours before wrap                      │
│  Typical rate: ~100 events/hour → ~3.4 days before wrap         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Circular Buffer Implementation

```c
/* Log entry structure (8 bytes for minimal footprint) */
typedef struct __attribute__((packed)) {
    uint32_t timestamp;    /* Seconds since boot (or epoch) */
    uint16_t event_code;   /* Event type */
    uint8_t  severity;     /* 1-5 */
    uint8_t  data;         /* Event-specific data byte */
} LogEntry_t;

/* Log header (per sector) */
typedef struct __attribute__((packed)) {
    uint32_t magic;        /* 0x4C4F4731 = "LOG1" */
    uint32_t sector_id;    /* Which sector (0-15) */
    uint32_t write_count;  /* Wear leveling counter */
    uint32_t first_seq;    /* First sequence number in sector */
    uint32_t reserved[4];  /* Pad to 32 bytes */
} SectorHeader_t;

/* Global log state */
typedef struct {
    uint8_t  current_sector;
    uint16_t current_offset;
    uint32_t sequence_number;
    uint32_t sector_write_count[16];
} LogState_t;

static LogState_t g_log_state;

/* Write a log entry */
void Log_Write(uint16_t event_code, uint8_t severity, uint8_t data) {
    LogEntry_t entry = {
        .timestamp = GetTimestamp(),
        .event_code = event_code,
        .severity = severity,
        .data = data
    };

    /* Calculate flash address */
    uint32_t addr = LOG_BASE_ADDR +
                    (g_log_state.current_sector * SECTOR_SIZE) +
                    sizeof(SectorHeader_t) +
                    (g_log_state.current_offset * sizeof(LogEntry_t));

    /* Write entry */
    HAL_FLASH_Unlock();
    HAL_FLASH_Program(FLASH_TYPEPROGRAM_DOUBLEWORD, addr, *(uint64_t*)&entry);
    HAL_FLASH_Lock();

    /* Advance position */
    g_log_state.current_offset++;
    g_log_state.sequence_number++;

    /* Check for sector wrap */
    if (g_log_state.current_offset >= ENTRIES_PER_SECTOR) {
        AdvanceToNextSector();
    }
}

/* Advance to next sector (erase oldest) */
void AdvanceToNextSector(void) {
    /* Move to next sector */
    g_log_state.current_sector = (g_log_state.current_sector + 1) % 16;
    g_log_state.current_offset = 0;

    /* Find sector with lowest write count (wear leveling) */
    uint8_t target = FindLowestWearSector();

    /* Erase target sector */
    HAL_FLASH_Unlock();
    FLASH_Erase_Sector(target + LOG_FIRST_SECTOR, FLASH_VOLTAGE_RANGE_3);
    HAL_FLASH_Lock();

    /* Write new header */
    WriteSectorHeader(target);

    g_log_state.sector_write_count[target]++;
}
```

### 2.3 Event Types

```
┌─────────────────────────────────────────────────────────────────┐
│                    Event Type Categories                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  POWER EVENTS (0x0100-0x01FF):                                  │
│  ┌─────────┬────────────────────────────────────────────────┐   │
│  │ Code    │ Description                          │ Sev     │   │
│  ├─────────┼────────────────────────────────────────────────┤   │
│  │ 0x0100  │ Power output enabled                 │ 2       │   │
│  │ 0x0101  │ Power output disabled                │ 2       │   │
│  │ 0x0102  │ Power level changed                  │ 1       │   │
│  │ 0x0103  │ Soft start completed                 │ 1       │   │
│  │ 0x0110  │ OCP triggered                        │ 4       │   │
│  │ 0x0111  │ OVP triggered                        │ 4       │   │
│  │ 0x0112  │ UVP triggered                        │ 3       │   │
│  │ 0x0113  │ Ground fault detected                │ 4       │   │
│  └─────────┴────────────────────────────────────────────────┘   │
│                                                                  │
│  STATE EVENTS (0x0200-0x02FF):                                  │
│  ┌─────────┬────────────────────────────────────────────────┐   │
│  │ 0x0200  │ State: BOOT                          │ 1       │   │
│  │ 0x0201  │ State: DISCOVERING                   │ 1       │   │
│  │ 0x0202  │ State: SYNCHRONIZING                 │ 1       │   │
│  │ 0x0203  │ State: STANDBY                       │ 1       │   │
│  │ 0x0204  │ State: ACTIVE                        │ 1       │   │
│  │ 0x0205  │ State: DEGRADED                      │ 2       │   │
│  │ 0x0206  │ State: FAULT                         │ 3       │   │
│  │ 0x0207  │ State: MAINTENANCE                   │ 2       │   │
│  │ 0x0208  │ State: UPDATING                      │ 2       │   │
│  │ 0x0209  │ State: SHUTDOWN                      │ 2       │   │
│  └─────────┴────────────────────────────────────────────────┘   │
│                                                                  │
│  THERMAL EVENTS (0x0300-0x03FF):                                │
│  ┌─────────┬────────────────────────────────────────────────┐   │
│  │ 0x0300  │ Temperature normal                   │ 1       │   │
│  │ 0x0301  │ Temperature warning (>70°C)          │ 2       │   │
│  │ 0x0302  │ Temperature critical (>85°C)         │ 3       │   │
│  │ 0x0303  │ Thermal shutdown (>100°C)            │ 4       │   │
│  │ 0x0310  │ Fan speed changed                    │ 1       │   │
│  │ 0x0311  │ Fan failure detected                 │ 3       │   │
│  │ 0x0320  │ Derating active                      │ 2       │   │
│  │ 0x0321  │ Derating cleared                     │ 1       │   │
│  └─────────┴────────────────────────────────────────────────┘   │
│                                                                  │
│  COMMUNICATION EVENTS (0x0400-0x04FF):                          │
│  ┌─────────┬────────────────────────────────────────────────┐   │
│  │ 0x0400  │ CAN-A connected                      │ 1       │   │
│  │ 0x0401  │ CAN-A error                          │ 3       │   │
│  │ 0x0402  │ CAN-A bus-off                        │ 4       │   │
│  │ 0x0410  │ CAN-B connected                      │ 1       │   │
│  │ 0x0411  │ CAN-B error                          │ 3       │   │
│  │ 0x0420  │ Failover to CAN-B                    │ 3       │   │
│  │ 0x0430  │ Leader elected (self)                │ 2       │   │
│  │ 0x0431  │ New leader detected                  │ 2       │   │
│  │ 0x0432  │ Leader heartbeat timeout             │ 3       │   │
│  └─────────┴────────────────────────────────────────────────┘   │
│                                                                  │
│  SWAP EVENTS (0x0500-0x05FF):                                   │
│  ┌─────────┬────────────────────────────────────────────────┐   │
│  │ 0x0500  │ Module insertion detected            │ 2       │   │
│  │ 0x0501  │ Module removal detected              │ 2       │   │
│  │ 0x0502  │ Pre-charge started                   │ 1       │   │
│  │ 0x0503  │ Pre-charge completed                 │ 1       │   │
│  │ 0x0504  │ Joined swarm                         │ 2       │   │
│  │ 0x0505  │ Left swarm (graceful)                │ 2       │   │
│  └─────────┴────────────────────────────────────────────────┘   │
│                                                                  │
│  SECURITY EVENTS (0x0600-0x06FF):                               │
│  (See 11-security-model.md for complete list)                   │
│                                                                  │
│  FIRMWARE EVENTS (0x0700-0x07FF):                               │
│  ┌─────────┬────────────────────────────────────────────────┐   │
│  │ 0x0700  │ Firmware update started              │ 2       │   │
│  │ 0x0701  │ Firmware chunk received              │ 1       │   │
│  │ 0x0702  │ Firmware verification passed         │ 2       │   │
│  │ 0x0703  │ Firmware verification failed         │ 4       │   │
│  │ 0x0704  │ Firmware activated                   │ 2       │   │
│  │ 0x0705  │ Firmware rollback triggered          │ 3       │   │
│  └─────────┴────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Extended Log Entry Format

For detailed events requiring more than 1 data byte:

```c
/* Extended log entry (16 bytes) - uses 2 consecutive slots */
typedef struct __attribute__((packed)) {
    uint32_t timestamp;       /* Seconds since boot */
    uint16_t event_code;      /* Event type */
    uint8_t  severity;        /* 1-5 */
    uint8_t  flags;           /* Bit 7 = extended entry */
    uint8_t  data[8];         /* Extended data payload */
} ExtendedLogEntry_t;

/* Write extended entry */
void Log_WriteExtended(uint16_t event_code, uint8_t severity,
                       const uint8_t *data, uint8_t len) {
    ExtendedLogEntry_t entry = {
        .timestamp = GetTimestamp(),
        .event_code = event_code,
        .severity = severity,
        .flags = 0x80  /* Extended flag */
    };
    memcpy(entry.data, data, MIN(len, 8));

    /* Write as two consecutive entries */
    uint32_t addr = GetCurrentLogAddress();
    HAL_FLASH_Unlock();
    HAL_FLASH_Program(FLASH_TYPEPROGRAM_DOUBLEWORD, addr, *(uint64_t*)&entry);
    HAL_FLASH_Program(FLASH_TYPEPROGRAM_DOUBLEWORD, addr + 8,
                      *((uint64_t*)&entry + 1));
    HAL_FLASH_Lock();

    g_log_state.current_offset += 2;
    g_log_state.sequence_number += 2;
}
```

---

## 3. Log Synchronization

### 3.1 Batch Upload Protocol

Modules upload log entries to the Station Controller every 5 minutes:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Log Upload Protocol                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Module                                  Station Controller    │
│       │                                           │              │
│       │ ─── LOG_SYNC_REQUEST ───────────────────► │              │
│       │     (last_uploaded_seq, count)            │              │
│       │                                           │              │
│       │ ◄── LOG_SYNC_ACK ─────────────────────── │              │
│       │     (ready, max_batch_size)               │              │
│       │                                           │              │
│       │ ─── LOG_DATA ───────────────────────────► │              │
│       │     (batch 1: entries 0-63)               │              │
│       │                                           │              │
│       │ ◄── LOG_DATA_ACK ────────────────────── │              │
│       │     (received_count, next_expected)       │              │
│       │                                           │              │
│       │ ─── LOG_DATA ───────────────────────────► │              │
│       │     (batch 2: entries 64-127)             │              │
│       │                                           │              │
│       │     ... repeat until all uploaded ...     │              │
│       │                                           │              │
│       │ ─── LOG_SYNC_COMPLETE ─────────────────► │              │
│       │     (total_uploaded, checksum)            │              │
│       │                                           │              │
│       │ ◄── LOG_SYNC_CONFIRM ──────────────────  │              │
│       │     (status, next_sync_time)              │              │
│       │                                           │              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 CBOR Encoding

Log entries are encoded in CBOR (Concise Binary Object Representation) for efficient transmission:

```c
/* CBOR-encoded log batch */
typedef struct {
    uint8_t module_id;
    uint32_t batch_seq;
    uint32_t first_entry_seq;
    uint8_t entry_count;
    LogEntry_t entries[64];
    uint16_t crc16;
} LogBatch_t;

/* Encode batch to CBOR */
size_t EncodeBatchCBOR(const LogBatch_t *batch, uint8_t *buffer, size_t max_len) {
    CborEncoder encoder, array_encoder, entry_encoder;

    cbor_encoder_init(&encoder, buffer, max_len, 0);

    /* Map with 5 items */
    cbor_encoder_create_map(&encoder, &array_encoder, 5);

    /* "id": module_id */
    cbor_encode_text_stringz(&array_encoder, "id");
    cbor_encode_uint(&array_encoder, batch->module_id);

    /* "seq": batch_seq */
    cbor_encode_text_stringz(&array_encoder, "seq");
    cbor_encode_uint(&array_encoder, batch->batch_seq);

    /* "first": first_entry_seq */
    cbor_encode_text_stringz(&array_encoder, "first");
    cbor_encode_uint(&array_encoder, batch->first_entry_seq);

    /* "entries": array of entries */
    cbor_encode_text_stringz(&array_encoder, "entries");
    cbor_encoder_create_array(&array_encoder, &entry_encoder, batch->entry_count);

    for (int i = 0; i < batch->entry_count; i++) {
        cbor_encode_byte_string(&entry_encoder,
                                (uint8_t*)&batch->entries[i],
                                sizeof(LogEntry_t));
    }

    cbor_encoder_close_container(&array_encoder, &entry_encoder);

    /* "crc": checksum */
    cbor_encode_text_stringz(&array_encoder, "crc");
    cbor_encode_uint(&array_encoder, batch->crc16);

    cbor_encoder_close_container(&encoder, &array_encoder);

    return cbor_encoder_get_buffer_size(&encoder, buffer);
}
```

---

## 4. Forensic Analysis

### 4.1 Post-Mortem Reconstruction

When a fault occurs, logs enable timeline reconstruction:

```
┌─────────────────────────────────────────────────────────────────┐
│              Example: OCP Fault Investigation                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Timeline (from logs):                                           │
│                                                                  │
│  T-30m   0x0100 POWER_ENABLED        Module started             │
│  T-29m   0x0204 STATE_ACTIVE         Normal operation            │
│  T-25m   0x0102 POWER_CHANGED        Power: 2800W               │
│  T-10m   0x0301 TEMP_WARNING         Temp: 72°C                 │
│  T-9m    0x0320 DERATING_ACTIVE      Power reduced to 2500W     │
│  T-5m    0x0102 POWER_CHANGED        Power: 3100W (external cmd)│
│  T-4m    0x0302 TEMP_CRITICAL        Temp: 88°C                 │
│  T-3m    0x0320 DERATING_ACTIVE      Power reduced to 2000W     │
│  T-2m    0x0102 POWER_CHANGED        Power: 3300W (override!)   │
│  T-1m    0x0303 THERMAL_SHUTDOWN     Temp: 102°C               │
│  T-0     0x0110 OCP_TRIGGERED        Fault!                     │
│  T+1s    0x0206 STATE_FAULT          Module shutdown            │
│                                                                  │
│  Root Cause Analysis:                                            │
│  • Power override command at T-2m bypassed thermal protection   │
│  • Investigation: Who sent override? Check security log         │
│  • Recommendation: Disable power override during thermal limit  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Pattern Recognition

Log data enables ML-based pattern detection:

```python
# Python analysis script (runs on cloud)
import pandas as pd
from sklearn.ensemble import IsolationForest

def analyze_module_health(module_id, log_df):
    """
    Detect anomalous patterns in module logs
    """
    # Feature extraction
    features = log_df.groupby(pd.Grouper(key='timestamp', freq='1H')).agg({
        'temp_warning_count': 'sum',
        'ocp_count': 'sum',
        'state_changes': 'count',
        'avg_power': 'mean',
        'avg_temp': 'mean'
    })

    # Train isolation forest
    model = IsolationForest(contamination=0.1)
    features['anomaly'] = model.fit_predict(features)

    # Flag anomalous periods
    anomalies = features[features['anomaly'] == -1]

    return anomalies

def predict_failure(module_id, log_df):
    """
    Predict time-to-failure based on degradation patterns
    """
    # Extract degradation indicators
    temp_trend = log_df['avg_temp'].rolling(24).mean()
    ocp_rate = log_df['ocp_count'].rolling(24).sum()

    # Simple heuristic (real model would be more sophisticated)
    if temp_trend.iloc[-1] > 80 and ocp_rate.iloc[-1] > 3:
        return "HIGH_RISK: Schedule maintenance within 7 days"
    elif temp_trend.iloc[-1] > 70 or ocp_rate.iloc[-1] > 1:
        return "MEDIUM_RISK: Monitor closely"
    else:
        return "LOW_RISK: Normal operation"
```

---

## 5. Data Retention

### 5.1 Retention Policy

| Storage Level | Retention Period | Capacity | Purpose |
|---------------|------------------|----------|---------|
| Module Flash | 7 days | 64 KB | Immediate diagnostics |
| Station Controller | 90 days | 10 GB | Local analysis |
| Cloud Archive | 2 years | Unlimited | Long-term analytics |
| Legal Hold | 7 years | As needed | Compliance/litigation |

### 5.2 Data Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    Log Data Lifecycle                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Module           Station           Cloud            Archive   │
│       │                │                │                │       │
│    CREATE             │                │                │       │
│       │               │                │                │       │
│       ├──── 5 min ───►│ AGGREGATE      │                │       │
│       │               │                │                │       │
│       │               ├──── daily ────►│ STORE          │       │
│       │               │                │                │       │
│       │               │                │                │       │
│    ◄──┼─── 7 days ───►│                │                │       │
│    OVERWRITE          │                │                │       │
│                       │                │                │       │
│                    ◄──┼── 90 days ────►│                │       │
│                    DELETE              │                │       │
│                                        │                │       │
│                                     ◄──┼── 2 years ────►│       │
│                                     ARCHIVE to cold     │       │
│                                        │                │       │
│                                        │             ◄──┼─ 7yr ─►│
│                                        │             DELETE      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Storage Sizing

```
MODULE FLASH (64 KB):
• Entry size: 8 bytes
• Entries per module: 8,192
• At 100 events/hour: 3.4 days
• At 500 events/hour: 16 hours (busy module)

STATION CONTROLLER (90 days, 84 modules):
• Entries per module per day: ~2,400
• Entries per day (all modules): 201,600
• Entry size (with metadata): 16 bytes
• Daily storage: 3.2 MB
• 90-day storage: 288 MB
• With 30x headroom: 10 GB allocated

CLOUD STORAGE (2 years):
• Daily ingest per station: 3.2 MB
• Annual per station: 1.2 GB
• 10 stations × 2 years: 24 GB
• With compression (10:1): 2.4 GB
```

---

## 6. References

| Document | Description |
|----------|-------------|
| `tehnika/11-security-model.md` | Security event codes |
| `tehnika/14-firmware-architecture.md` | Flash layout |
| `tehnika/komponente/module-interface-spec.md` | CAN log messages |
| RFC 8949 | CBOR specification |
| IEC 62443 | Industrial security logging requirements |

---

## Appendix A: Log Query API

```c
/* Query interface (Station Controller) */

/* Query parameters */
typedef struct {
    uint8_t  module_id;      /* 0xFF = all modules */
    uint32_t start_time;     /* Unix timestamp */
    uint32_t end_time;       /* Unix timestamp */
    uint16_t event_code;     /* 0 = all events */
    uint8_t  min_severity;   /* 1-5 */
    uint16_t max_results;    /* Limit */
} LogQuery_t;

/* Query result */
typedef struct {
    uint32_t total_matches;
    uint16_t returned_count;
    LogEntry_t *entries;
} LogQueryResult_t;

/* Execute query */
LogQueryResult_t* Log_Query(const LogQuery_t *query);

/* Example queries */

/* All faults from module 42 in last hour */
LogQuery_t q1 = {
    .module_id = 42,
    .start_time = now() - 3600,
    .end_time = now(),
    .event_code = 0,
    .min_severity = 4,
    .max_results = 100
};

/* All OCP events from any module today */
LogQuery_t q2 = {
    .module_id = 0xFF,
    .start_time = today_start(),
    .end_time = now(),
    .event_code = 0x0110,  /* OCP */
    .min_severity = 1,
    .max_results = 1000
};
```

---

## Appendix B: Compliance Requirements

| Standard | Requirement | EK3 Compliance |
|----------|-------------|----------------|
| IEC 62443-3-3 | Security event logging | Yes (see 11-security-model.md) |
| ISO 15118 | Charging session logging | Yes (power events) |
| GDPR | Data retention limits | 2-year default, configurable |
| SOC 2 | Audit trail | Yes (immutable cloud archive) |
