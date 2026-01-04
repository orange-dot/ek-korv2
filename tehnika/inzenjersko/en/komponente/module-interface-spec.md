# EK3 Module Interface Specification

## Document Information

| Field | Value |
|-------|-------|
| Document ID | EK-COMP-INT-001 |
| Version | 1.0 |
| Date | 2026-01-03 |
| Status | Active |
| Author | Elektrokombinacija Engineering |

---

## 1. Interface Overview

### 1.1 Physical Interface

The EK3 module communicates with the rack and other modules through a 20-pin blind-mate connector providing:

| Interface | Pins | Purpose |
|-----------|------|---------|
| Power | 4 (DC+, DC-) | DC bus connection (800V) |
| Ground | 2 | Chassis/safety ground |
| CAN-A | 2 | Primary communication bus |
| CAN-B | 2 | Backup communication bus |
| SPI | 4 | Diagnostics port |
| I2C | 2 | EEPROM/configuration |
| ID | 2 | Slot identification |
| Key | 2 | Mechanical keying (no contact) |

### 1.2 Logical Interface

The logical interface consists of:

1. **CAN-FD Messages**: Structured communication protocol
2. **State Machine**: Module operational states
3. **Capability Model**: Access control and permissions
4. **Protocol Version**: Backward compatibility

---

## 2. CAN Message Contracts

### 2.1 Extended ID Structure (29-bit)

All EK3 CAN messages use extended identifiers:

```
┌─────────────────────────────────────────────────────────────────┐
│                   29-bit Extended CAN ID                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Bit Position:                                                   │
│  28  27  26  25  24  23  22  21  20  19  18  17  16  15  14     │
│  ├───┴───┴───┴───┼───┴───┴───┴───┼───┴───┴───┴───┴───┴───┤     │
│  │   Priority    │  Message Type │      Source ID         │     │
│  │   (4 bits)    │   (4 bits)    │     (8 bits)           │     │
│                                                                  │
│  Bit Position:                                                   │
│  13  12  11  10   9   8   7   6   5   4   3   2   1   0         │
│  ├───┴───┴───┴───┴───┴───┴───┼───┴───┴───┴───┴───┴───┴───┤     │
│  │      Target ID             │       Sequence            │     │
│  │      (8 bits)              │       (5 bits)            │     │
│                                                                  │
│  Field Definitions:                                              │
│  ┌──────────────┬────────────────────────────────────────────┐  │
│  │ Priority     │ 0x0=Critical, 0x1=High, 0x2=Med, 0xF=Low   │  │
│  │ Message Type │ See Section 2.2                            │  │
│  │ Source ID    │ Module ID (0x00-0xFE), 0xFF=Station        │  │
│  │ Target ID    │ Module ID, 0xFF=Broadcast                  │  │
│  │ Sequence     │ Rolling 0-31 for replay protection         │  │
│  └──────────────┴────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Message Type Definitions

| Type Code | Name | Priority | Description |
|-----------|------|----------|-------------|
| 0x0 | SYNC | Critical | Time synchronization |
| 0x1 | ELECTION | High | Leader election (Raft) |
| 0x2 | HEARTBEAT | Medium | Periodic status |
| 0x3 | POWER_CMD | High | Power commands |
| 0x4 | POWER_ACK | High | Power acknowledgment |
| 0x5 | THERMAL | Medium | Temperature sharing |
| 0x6 | CONFIG | Low | Configuration read/write |
| 0x7 | FAULT | Critical | Fault notification |
| 0x8 | DIAG_REQ | Low | Diagnostics request |
| 0x9 | DIAG_RSP | Low | Diagnostics response |
| 0xA | LOG | Low | Log entry upload |
| 0xB | SWAP_NOTIFY | High | Hot-swap notification |
| 0xC-0xE | Reserved | - | Future use |
| 0xF | FW_UPDATE | Background | Firmware update |

### 2.3 CAN-FD Payload Format (64 bytes max)

**Standard Message Header (8 bytes):**

```
┌─────────────────────────────────────────────────────────────────┐
│                   Message Header (Bytes 0-7)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Byte 0-1: Protocol version (uint16_t, little-endian)           │
│            Current version: 0x0100 (v1.0)                        │
│                                                                  │
│  Byte 2: Message flags                                           │
│          Bit 0: Requires ACK                                     │
│          Bit 1: Is response                                      │
│          Bit 2: Has CMAC signature                               │
│          Bit 3: Fragmented message                               │
│          Bit 4-7: Reserved                                       │
│                                                                  │
│  Byte 3: Fragment info (if fragmented)                           │
│          Bits 0-3: Fragment index                                │
│          Bits 4-7: Total fragments                               │
│                                                                  │
│  Byte 4-7: Timestamp (uint32_t, ms since epoch or boot)          │
│                                                                  │
│  Byte 8-63: Payload (type-specific)                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Message Specifications

### 3.1 HEARTBEAT (0x2)

Broadcast every 1 second by each module.

```
┌─────────────────────────────────────────────────────────────────┐
│                    HEARTBEAT Message                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CAN ID: Priority=0x2, Type=0x2, Src=module_id, Tgt=0xFF        │
│  Example: 0x12200FF (module 0x20 broadcasting)                   │
│                                                                  │
│  Payload (32 bytes):                                             │
│  ┌────────┬────────┬─────────────────────────────────────────┐  │
│  │ Offset │ Size   │ Field                                   │  │
│  ├────────┼────────┼─────────────────────────────────────────┤  │
│  │ 0      │ 2      │ Protocol version                        │  │
│  │ 2      │ 1      │ Flags (0x00)                            │  │
│  │ 3      │ 1      │ Reserved                                │  │
│  │ 4      │ 4      │ Timestamp (ms)                          │  │
│  │ 8      │ 1      │ Module state (enum)                     │  │
│  │ 9      │ 1      │ Health flags                            │  │
│  │ 10     │ 2      │ Output power (W)                        │  │
│  │ 12     │ 2      │ Output voltage (mV ÷ 10)                │  │
│  │ 14     │ 2      │ Output current (mA)                     │  │
│  │ 16     │ 2      │ PCB temperature (°C × 10)               │  │
│  │ 18     │ 2      │ MOSFET temperature (°C × 10)            │  │
│  │ 20     │ 2      │ Input voltage (mV ÷ 10)                 │  │
│  │ 22     │ 4      │ Uptime (seconds)                        │  │
│  │ 26     │ 2      │ Error count (cumulative)                │  │
│  │ 28     │ 4      │ CRC32 of payload                        │  │
│  └────────┴────────┴─────────────────────────────────────────┘  │
│                                                                  │
│  Health Flags (byte 9):                                          │
│  Bit 0: Over-temperature warning                                │
│  Bit 1: Under-voltage warning                                   │
│  Bit 2: Over-current warning                                    │
│  Bit 3: Fan failure                                             │
│  Bit 4: Communication degraded                                  │
│  Bit 5: Calibration needed                                      │
│  Bit 6-7: Reserved                                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 POWER_CMD (0x3)

Power level command from station controller to module.

```
┌─────────────────────────────────────────────────────────────────┐
│                    POWER_CMD Message                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CAN ID: Priority=0x1, Type=0x3, Src=0xFF, Tgt=module_id        │
│  Example: 0x113FF20 (station to module 0x20)                     │
│                                                                  │
│  Payload (24 bytes):                                             │
│  ┌────────┬────────┬─────────────────────────────────────────┐  │
│  │ Offset │ Size   │ Field                                   │  │
│  ├────────┼────────┼─────────────────────────────────────────┤  │
│  │ 0      │ 2      │ Protocol version                        │  │
│  │ 2      │ 1      │ Flags (0x01 = requires ACK)             │  │
│  │ 3      │ 1      │ Reserved                                │  │
│  │ 4      │ 4      │ Timestamp (ms)                          │  │
│  │ 8      │ 1      │ Command type (enum)                     │  │
│  │ 9      │ 1      │ Reserved                                │  │
│  │ 10     │ 2      │ Target power (W)                        │  │
│  │ 12     │ 2      │ Target voltage (mV ÷ 10)                │  │
│  │ 14     │ 2      │ Current limit (mA)                      │  │
│  │ 16     │ 8      │ CMAC signature (if flag set)            │  │
│  └────────┴────────┴─────────────────────────────────────────┘  │
│                                                                  │
│  Command Types (byte 8):                                         │
│  0x00: SET_POWER - Set power level                              │
│  0x01: ENABLE - Enable output                                   │
│  0x02: DISABLE - Disable output                                 │
│  0x03: SOFT_START - Gradual ramp up                             │
│  0x04: EMERGENCY_STOP - Immediate shutdown                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 POWER_ACK (0x4)

Response to POWER_CMD.

```
┌─────────────────────────────────────────────────────────────────┐
│                    POWER_ACK Message                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CAN ID: Priority=0x1, Type=0x4, Src=module_id, Tgt=0xFF        │
│  Example: 0x11420FF (module 0x20 acknowledging)                  │
│                                                                  │
│  Payload (20 bytes):                                             │
│  ┌────────┬────────┬─────────────────────────────────────────┐  │
│  │ Offset │ Size   │ Field                                   │  │
│  ├────────┼────────┼─────────────────────────────────────────┤  │
│  │ 0      │ 2      │ Protocol version                        │  │
│  │ 2      │ 1      │ Flags (0x02 = is response)              │  │
│  │ 3      │ 1      │ Reserved                                │  │
│  │ 4      │ 4      │ Timestamp (ms)                          │  │
│  │ 8      │ 1      │ Result code                             │  │
│  │ 9      │ 1      │ Reserved                                │  │
│  │ 10     │ 2      │ Actual power (W)                        │  │
│  │ 12     │ 2      │ Actual voltage (mV ÷ 10)                │  │
│  │ 14     │ 2      │ Actual current (mA)                     │  │
│  │ 16     │ 4      │ CRC32 of payload                        │  │
│  └────────┴────────┴─────────────────────────────────────────┘  │
│                                                                  │
│  Result Codes (byte 8):                                          │
│  0x00: SUCCESS                                                  │
│  0x01: PARTIAL - Target modified due to limits                  │
│  0x02: REJECTED_THERMAL - Temperature too high                  │
│  0x03: REJECTED_FAULT - Module in fault state                   │
│  0x04: REJECTED_AUTH - Authentication failed                    │
│  0x05: REJECTED_VERSION - Protocol version mismatch             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 THERMAL (0x5)

Temperature sharing for distributed thermal management.

```
┌─────────────────────────────────────────────────────────────────┐
│                    THERMAL Message                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CAN ID: Priority=0x2, Type=0x5, Src=module_id, Tgt=0xFF        │
│                                                                  │
│  Payload (16 bytes):                                             │
│  ┌────────┬────────┬─────────────────────────────────────────┐  │
│  │ Offset │ Size   │ Field                                   │  │
│  ├────────┼────────┼─────────────────────────────────────────┤  │
│  │ 0      │ 2      │ Protocol version                        │  │
│  │ 2      │ 1      │ Flags                                   │  │
│  │ 3      │ 1      │ Request type                            │  │
│  │ 4      │ 4      │ Timestamp (ms)                          │  │
│  │ 8      │ 2      │ Current temperature (°C × 10)           │  │
│  │ 10     │ 2      │ Power headroom (W available)            │  │
│  │ 12     │ 2      │ Requested reduction (W)                 │  │
│  │ 14     │ 2      │ CRC16                                   │  │
│  └────────┴────────┴─────────────────────────────────────────┘  │
│                                                                  │
│  Request Types (byte 3):                                         │
│  0x00: STATUS_ONLY - Just reporting temperature                 │
│  0x01: REQUEST_HELP - Need power reduction from neighbors       │
│  0x02: OFFER_HELP - Can accept additional load                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5 FAULT (0x7)

Critical fault notification (highest priority).

```
┌─────────────────────────────────────────────────────────────────┐
│                    FAULT Message                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CAN ID: Priority=0x0, Type=0x7, Src=module_id, Tgt=0xFF        │
│  Example: 0x00720FF (module 0x20, critical fault broadcast)      │
│                                                                  │
│  Payload (28 bytes):                                             │
│  ┌────────┬────────┬─────────────────────────────────────────┐  │
│  │ Offset │ Size   │ Field                                   │  │
│  ├────────┼────────┼─────────────────────────────────────────┤  │
│  │ 0      │ 2      │ Protocol version                        │  │
│  │ 2      │ 1      │ Flags                                   │  │
│  │ 3      │ 1      │ Severity (1-5)                          │  │
│  │ 4      │ 4      │ Timestamp (ms)                          │  │
│  │ 8      │ 2      │ Fault code                              │  │
│  │ 10     │ 2      │ Sub-code                                │  │
│  │ 12     │ 4      │ Fault value (context-dependent)         │  │
│  │ 16     │ 8      │ Module state snapshot                   │  │
│  │ 24     │ 4      │ CRC32                                   │  │
│  └────────┴────────┴─────────────────────────────────────────┘  │
│                                                                  │
│  Severity Levels:                                                │
│  1: INFO - Logged only                                          │
│  2: WARNING - Alert, operation continues                        │
│  3: ERROR - Degraded operation                                  │
│  4: CRITICAL - Module shutdown, others compensate               │
│  5: EMERGENCY - System-wide shutdown initiated                  │
│                                                                  │
│  Fault Codes:                                                    │
│  0x0100-0x01FF: Power stage faults (OCP, OVP, etc.)            │
│  0x0200-0x02FF: Thermal faults                                  │
│  0x0300-0x03FF: Communication faults                            │
│  0x0400-0x04FF: Firmware/software faults                        │
│  0x0500-0x05FF: Configuration faults                            │
│  0x0600-0x06FF: Security faults                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.6 ELECTION (0x1)

Raft leader election messages.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ELECTION Message                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CAN ID: Priority=0x1, Type=0x1, Src=module_id, Tgt=0xFF        │
│                                                                  │
│  Payload (24 bytes):                                             │
│  ┌────────┬────────┬─────────────────────────────────────────┐  │
│  │ Offset │ Size   │ Field                                   │  │
│  ├────────┼────────┼─────────────────────────────────────────┤  │
│  │ 0      │ 2      │ Protocol version                        │  │
│  │ 2      │ 1      │ Flags                                   │  │
│  │ 3      │ 1      │ Election type                           │  │
│  │ 4      │ 4      │ Timestamp (ms)                          │  │
│  │ 8      │ 4      │ Term number                             │  │
│  │ 12     │ 1      │ Candidate ID                            │  │
│  │ 13     │ 1      │ Current leader ID (0xFF if none)        │  │
│  │ 14     │ 2      │ Log index                               │  │
│  │ 16     │ 4      │ Log term                                │  │
│  │ 20     │ 4      │ CRC32                                   │  │
│  └────────┴────────┴─────────────────────────────────────────┘  │
│                                                                  │
│  Election Types (byte 3):                                        │
│  0x00: REQUEST_VOTE - Candidate requesting vote                 │
│  0x01: VOTE_GRANT - Vote granted                                │
│  0x02: VOTE_DENY - Vote denied                                  │
│  0x03: LEADER_ANNOUNCE - Leader declaring victory               │
│  0x04: APPEND_ENTRIES - Log replication (heartbeat)             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Module State Machine

### 4.1 State Definitions

```
┌─────────────────────────────────────────────────────────────────┐
│                    Module States                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ State         │ Code │ Description                        │  │
│  ├───────────────┼──────┼────────────────────────────────────┤  │
│  │ BOOT          │ 0x00 │ Initial power-up, self-test        │  │
│  │ DISCOVERING   │ 0x01 │ Finding other modules on CAN       │  │
│  │ SYNCHRONIZING │ 0x02 │ Time sync, joining swarm           │  │
│  │ STANDBY       │ 0x03 │ Ready, awaiting power command      │  │
│  │ ACTIVE        │ 0x04 │ Delivering power                   │  │
│  │ DEGRADED      │ 0x05 │ Reduced capability (thermal, etc)  │  │
│  │ FAULT         │ 0x06 │ Error state, output disabled       │  │
│  │ MAINTENANCE   │ 0x07 │ Manual override, diagnostics       │  │
│  │ UPDATING      │ 0x08 │ Firmware update in progress        │  │
│  │ SHUTDOWN      │ 0x09 │ Graceful shutdown sequence         │  │
│  └───────────────┴──────┴────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 State Transition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    State Transition Diagram                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                           ┌───────────┐                         │
│                           │   BOOT    │                         │
│                           │  (0x00)   │                         │
│                           └─────┬─────┘                         │
│                                 │ Self-test OK                  │
│                                 ▼                               │
│                         ┌─────────────┐                         │
│                         │ DISCOVERING │                         │
│                         │   (0x01)    │                         │
│                         └──────┬──────┘                         │
│                                │ Found peers                    │
│                                ▼                               │
│                       ┌──────────────────┐                      │
│                       │  SYNCHRONIZING   │                      │
│                       │     (0x02)       │                      │
│                       └────────┬─────────┘                      │
│                                │ Sync complete                  │
│                                ▼                               │
│            ┌───────────────────────────────────────┐            │
│            │              STANDBY                  │            │
│            │               (0x03)                  │            │
│            └───────┬───────────────────────┬───────┘            │
│                    │                       │                    │
│      Power command │                       │ FW update request  │
│                    ▼                       ▼                   │
│            ┌───────────────┐       ┌───────────────┐            │
│            │    ACTIVE     │       │   UPDATING    │            │
│            │    (0x04)     │       │    (0x08)     │            │
│            └───────┬───────┘       └───────┬───────┘            │
│                    │                       │                    │
│      Thermal limit │       Update complete │                    │
│                    ▼                       │                    │
│            ┌───────────────┐               │                    │
│            │   DEGRADED    │               │                    │
│            │    (0x05)     │               │                    │
│            └───────┬───────┘               │                    │
│                    │                       │                    │
│         Any fault  │                       │                    │
│         detected   ▼                       │                    │
│            ┌───────────────┐               │                    │
│            │    FAULT      │◄──────────────┘                    │
│            │    (0x06)     │                                    │
│            └───────┬───────┘                                    │
│                    │                                            │
│       Manual reset │                                            │
│                    ▼                                           │
│            ┌───────────────┐                                    │
│            │  MAINTENANCE  │                                    │
│            │    (0x07)     │                                    │
│            └───────────────┘                                    │
│                                                                  │
│  Note: SHUTDOWN (0x09) can be entered from any state            │
│        via shutdown command                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Transition Guards

| From | To | Guard Condition |
|------|-----|-----------------|
| BOOT | DISCOVERING | Self-test passed |
| BOOT | FAULT | Self-test failed |
| DISCOVERING | SYNCHRONIZING | At least 1 peer found (or timeout for single module) |
| SYNCHRONIZING | STANDBY | Time sync < 1ms, swarm membership confirmed |
| STANDBY | ACTIVE | Valid power command received |
| ACTIVE | DEGRADED | Temperature > 80°C or other limit |
| ACTIVE | STANDBY | Power command = 0 |
| DEGRADED | ACTIVE | Temperature < 70°C (hysteresis) |
| DEGRADED | FAULT | Limit exceeded 3× in 1 minute |
| Any | FAULT | Critical error detected |
| FAULT | MAINTENANCE | Manual intervention |
| MAINTENANCE | BOOT | Reset command |
| Any | SHUTDOWN | Shutdown command |

---

## 5. Capability Model

### 5.1 Role Definitions

```
┌─────────────────────────────────────────────────────────────────┐
│                    Role Hierarchy                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Level 0: MODULE_PEER                                            │
│           • Other EK3 modules in the same rack                  │
│           • No authentication (same trust zone)                  │
│                                                                  │
│  Level 1: STATION_CONTROLLER                                     │
│           • Local station controller                            │
│           • Authenticated via mTLS certificate                  │
│                                                                  │
│  Level 2: DEPOT_CONTROLLER                                       │
│           • Depot-level management system                       │
│           • Authenticated via certificate chain                 │
│                                                                  │
│  Level 3: CLOUD_ADMIN                                            │
│           • Remote fleet management                             │
│           • Authenticated via API key + OAuth2                  │
│                                                                  │
│  Level 4: MAINTENANCE                                            │
│           • On-site technician                                  │
│           • Authenticated via badge/code                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Permission Matrix

| Permission | MODULE_PEER | STATION | DEPOT | CLOUD | MAINTENANCE |
|------------|-------------|---------|-------|-------|-------------|
| READ_STATUS | Yes | Yes | Yes | Yes | Yes |
| READ_CONFIG | No | Yes | Yes | Yes | Yes |
| SET_POWER | No | Yes | Yes | No | Yes |
| SET_LIMITS | No | Yes | Yes | No | Yes |
| SHUTDOWN | No | Yes | Yes | Yes | Yes |
| ENABLE | No | Yes | Yes | No | Yes |
| WRITE_CONFIG | No | No | Yes | No | Yes |
| FIRMWARE_UPDATE | No | No | Yes | Yes | Yes |
| FACTORY_RESET | No | No | No | No | Yes |
| READ_KEYS | No | No | No | No | No* |
| WRITE_KEYS | No | No | No | No | No* |

*Keys can only be provisioned during manufacturing

### 5.3 Command Validation

Every command is validated before execution:

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
    /* 1. Check CMAC signature (if required) */
    if (msg->flags & FLAG_HAS_CMAC) {
        if (!VerifyCMAC(msg)) {
            return VALIDATE_SIGNATURE_FAIL;
        }
    }

    /* 2. Check sequence number (replay protection) */
    if (!CheckSequence(msg->source, msg->sequence)) {
        return VALIDATE_REPLAY_FAIL;
    }

    /* 3. Identify sender role */
    Role_t role = IdentifyRole(msg->source);

    /* 4. Check permission for command type */
    Permission_t required = GetRequiredPermission(msg->type);
    if (!HasPermission(role, required)) {
        return VALIDATE_PERMISSION_FAIL;
    }

    /* 5. Check command parameters are in valid range */
    if (!ValidateParameters(msg)) {
        return VALIDATE_RANGE_FAIL;
    }

    /* 6. Check module is in valid state for command */
    if (!StateAllowsCommand(g_module_state, msg->type)) {
        return VALIDATE_STATE_FAIL;
    }

    return VALIDATE_OK;
}
```

---

## 6. Protocol Versioning

### 6.1 Version Format

```
Version: MAJOR.MINOR (uint16_t = 0xMMmm)

Current: v1.0 = 0x0100

Rules:
- MAJOR bump: Breaking changes (incompatible)
- MINOR bump: Backward-compatible additions
```

### 6.2 Compatibility Policy

| Sender Version | Receiver Version | Compatibility |
|----------------|------------------|---------------|
| 1.0 | 1.0 | Full |
| 1.0 | 1.1 | Full (receiver ignores new fields) |
| 1.1 | 1.0 | Partial (sender omits new fields) |
| 1.x | 2.x | None (rejected) |

### 6.3 Version Negotiation

During DISCOVERING state, modules exchange version information:

```
┌─────────────────────────────────────────────────────────────────┐
│                  Version Negotiation                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Module A (v1.1)                    Module B (v1.0)              │
│       │                                  │                       │
│       │ ─── HEARTBEAT(version=1.1) ────► │                       │
│       │                                  │                       │
│       │ ◄─── HEARTBEAT(version=1.0) ─── │                       │
│       │                                  │                       │
│       │ ─── (Uses v1.0 protocol) ──────► │                       │
│       │                                  │                       │
│       │     Communication proceeds       │                       │
│       │     using lowest common version  │                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. References

| Document | Description |
|----------|-------------|
| `tehnika/10-microkernel-architecture.md` | System architecture |
| `tehnika/11-security-model.md` | Security and authentication |
| `tehnika/05-swarm-intelligence.md` | Swarm protocols (Raft) |
| `tehnika/15-ek3-connector-spec.md` | Physical connector |
| CAN 2.0B Specification | Bosch |
| CAN-FD Specification | ISO 11898-1:2015 |

---

## Appendix A: Message Quick Reference

| Type | Code | Priority | Period | Direction |
|------|------|----------|--------|-----------|
| SYNC | 0x0 | Critical | 100ms | Leader→All |
| ELECTION | 0x1 | High | On-demand | Any→All |
| HEARTBEAT | 0x2 | Medium | 1000ms | Module→All |
| POWER_CMD | 0x3 | High | On-demand | Station→Module |
| POWER_ACK | 0x4 | High | Response | Module→Station |
| THERMAL | 0x5 | Medium | 5000ms | Module→All |
| CONFIG | 0x6 | Low | On-demand | Any |
| FAULT | 0x7 | Critical | On-event | Module→All |
| DIAG_REQ | 0x8 | Low | On-demand | Station→Module |
| DIAG_RSP | 0x9 | Low | Response | Module→Station |
| LOG | 0xA | Low | Batched | Module→Station |
| SWAP_NOTIFY | 0xB | High | On-event | Module→All |
| FW_UPDATE | 0xF | Background | Chunked | Station→Module |

---

## Appendix B: Fault Code Reference

| Code | Name | Severity | Description |
|------|------|----------|-------------|
| 0x0100 | OCP_TRIP | 4 | Over-current protection triggered |
| 0x0101 | OVP_TRIP | 4 | Over-voltage protection triggered |
| 0x0102 | UVP_TRIP | 3 | Under-voltage protection triggered |
| 0x0103 | GROUND_FAULT | 4 | Ground fault detected |
| 0x0200 | OTP_WARNING | 2 | Temperature approaching limit |
| 0x0201 | OTP_TRIP | 4 | Over-temperature shutdown |
| 0x0202 | FAN_FAIL | 3 | Fan failure detected |
| 0x0300 | CAN_A_FAIL | 2 | Primary CAN bus failure |
| 0x0301 | CAN_B_FAIL | 2 | Backup CAN bus failure |
| 0x0302 | CAN_BOTH_FAIL | 5 | Both CAN buses failed |
| 0x0400 | WATCHDOG | 4 | Watchdog timeout |
| 0x0401 | STACK_OVERFLOW | 4 | Task stack overflow |
| 0x0500 | CONFIG_CORRUPT | 3 | Configuration checksum fail |
| 0x0600 | AUTH_FAIL | 2 | Authentication failure |
| 0x0601 | TAMPER_DETECT | 4 | Physical tamper detected |
