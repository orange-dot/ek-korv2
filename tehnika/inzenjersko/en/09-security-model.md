# EK3 Security Model

## Document Information

| Field | Value |
|-------|-------|
| Document ID | EK-TECH-011 |
| Version | 1.0 |
| Date | 2026-01-03 |
| Status | Active |
| Author | Elektrokombinacija Engineering |

---

## 1. Overview

### 1.1 Security Philosophy

The EK3 security model implements defense-in-depth with multiple independent layers:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Defense-in-Depth Model                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    External Threats                                              │
│         │                                                        │
│         ▼                                                        │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ Layer 5: Network Security (TLS, VPN, firewall)          │  │
│    └─────────────────────────────────────────────────────────┘  │
│         │                                                        │
│         ▼                                                        │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ Layer 4: API Authentication (OAuth2, API keys)          │  │
│    └─────────────────────────────────────────────────────────┘  │
│         │                                                        │
│         ▼                                                        │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ Layer 3: Message Authentication (CMAC signatures)       │  │
│    └─────────────────────────────────────────────────────────┘  │
│         │                                                        │
│         ▼                                                        │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ Layer 2: Access Control (RBAC, capability model)        │  │
│    └─────────────────────────────────────────────────────────┘  │
│         │                                                        │
│         ▼                                                        │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ Layer 1: Firmware Security (secure boot, code signing)  │  │
│    └─────────────────────────────────────────────────────────┘  │
│         │                                                        │
│         ▼                                                        │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ Layer 0: Hardware Security (tamper, crypto, OTP)        │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│    Each layer provides protection even if outer layers fail     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Threat Model

| Threat Category | Examples | Mitigations |
|-----------------|----------|-------------|
| Remote attack | Network intrusion, API abuse | TLS, OAuth2, rate limiting |
| Local network attack | CAN bus injection | CMAC, sequence numbers |
| Physical access | Module theft, debugging | Tamper detection, RDP |
| Supply chain | Counterfeit modules | Secure boot, attestation |
| Insider threat | Rogue employee | RBAC, audit logging |
| Denial of service | Bus flooding | Priority filtering, rate limits |

---

## 2. Trust Tiers

### 2.1 Tier Definitions

```
┌─────────────────────────────────────────────────────────────────┐
│                    Trust Tier Hierarchy                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TIER 0: Hardware Root of Trust                                  │
│  ═══════════════════════════════                                 │
│  • Cannot be modified by any software                           │
│  • Enforced by: Resistor dividers, fuses, analog comparators    │
│  • Examples:                                                     │
│    - OCP trip point (hardware comparator)                       │
│    - OVP trip point (hardware comparator)                       │
│    - OTP keys in fuse memory                                    │
│    - Secure boot public key                                     │
│                                                                  │
│  TIER 1: Signed Firmware                                         │
│  ════════════════════════                                        │
│  • Cryptographically verified at boot                           │
│  • Enforced by: Bootloader, secure boot chain                   │
│  • Examples:                                                     │
│    - Application firmware (Ed25519 signed)                      │
│    - Configuration data (CMAC protected)                        │
│    - Bootloader (factory-programmed, locked)                    │
│                                                                  │
│  TIER 2: Authenticated Controllers                               │
│  ═════════════════════════════════                               │
│  • Identity verified via certificates                           │
│  • Enforced by: mTLS, certificate chain                         │
│  • Examples:                                                     │
│    - Station Controller (has device certificate)                │
│    - Depot Controller (has intermediate CA cert)                │
│                                                                  │
│  TIER 3: Authenticated Services                                  │
│  ══════════════════════════════                                  │
│  • Identity verified via API keys and OAuth2                    │
│  • Enforced by: API gateway, token validation                   │
│  • Examples:                                                     │
│    - Cloud management platform                                  │
│    - Third-party integrations                                   │
│    - Mobile apps                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Trust Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                    Trust Boundary Map                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │                    INTERNET                              │  │
│    │                    (Untrusted)                           │  │
│    └───────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
│            ═══════════════╧══════════════════                   │
│            │ BOUNDARY A: TLS + OAuth2       │                   │
│            ═══════════════╤══════════════════                   │
│                            │                                     │
│    ┌───────────────────────┴─────────────────────────────────┐  │
│    │              CLOUD PLATFORM (Tier 3)                     │  │
│    └───────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
│            ═══════════════╧══════════════════                   │
│            │ BOUNDARY B: VPN + mTLS         │                   │
│            ═══════════════╤══════════════════                   │
│                            │                                     │
│    ┌───────────────────────┴─────────────────────────────────┐  │
│    │              DEPOT NETWORK (Tier 2)                      │  │
│    └───────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
│            ═══════════════╧══════════════════                   │
│            │ BOUNDARY C: mTLS Certificate   │                   │
│            ═══════════════╤══════════════════                   │
│                            │                                     │
│    ┌───────────────────────┴─────────────────────────────────┐  │
│    │              STATION CONTROLLER (Tier 2)                 │  │
│    └───────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
│            ═══════════════╧══════════════════                   │
│            │ BOUNDARY D: CAN-FD + CMAC      │                   │
│            ═══════════════╤══════════════════                   │
│                            │                                     │
│    ┌───────────────────────┴─────────────────────────────────┐  │
│    │              EK3 MODULES (Tier 1)                        │  │
│    │    ┌─────────────────────────────────────────────────┐   │  │
│    │    │           HARDWARE PROTECTION (Tier 0)          │   │  │
│    │    │        (Non-bypassable by software)             │   │  │
│    │    └─────────────────────────────────────────────────┘   │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Role-Based Access Control (RBAC)

### 3.1 Role Definitions

| Role | Tier | Authentication | Scope |
|------|------|----------------|-------|
| MODULE_PEER | 1 | Same CAN bus | Single rack |
| STATION_CONTROLLER | 2 | mTLS certificate | Single station |
| DEPOT_CONTROLLER | 2 | mTLS + CA chain | All stations in depot |
| CLOUD_ADMIN | 3 | OAuth2 + API key | Fleet-wide |
| MAINTENANCE | 2 | Badge + PIN | Physical access |

### 3.2 Permission Definitions

```
┌─────────────────────────────────────────────────────────────────┐
│                    Permission Categories                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  READ Operations (Safe, information only):                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ READ_STATUS     │ Current power, voltage, temperature       ││
│  │ READ_CONFIG     │ Module settings, calibration              ││
│  │ READ_LOGS       │ Audit log entries                         ││
│  │ READ_HEALTH     │ Diagnostic information                    ││
│  │ READ_INVENTORY  │ Module list, serial numbers               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  WRITE Operations (Affect behavior):                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ SET_POWER       │ Change power output level                 ││
│  │ SET_LIMITS      │ Modify voltage/current limits             ││
│  │ SET_CONFIG      │ Change module configuration               ││
│  │ ENABLE          │ Enable power output                       ││
│  │ DISABLE         │ Disable power output (graceful)           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  CONTROL Operations (Critical):                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ SHUTDOWN        │ Emergency shutdown                        ││
│  │ RESTART         │ Module restart                            ││
│  │ FIRMWARE_UPDATE │ Update module firmware                    ││
│  │ FACTORY_RESET   │ Reset to factory defaults                 ││
│  │ KEY_PROVISION   │ Write cryptographic keys                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Permission Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                    RBAC Permission Matrix                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Permission        │ PEER │ STATION │ DEPOT │ CLOUD │ MAINT    │
│  ──────────────────┼──────┼─────────┼───────┼───────┼─────────  │
│  READ_STATUS       │  ●   │    ●    │   ●   │   ●   │    ●     │
│  READ_CONFIG       │  ○   │    ●    │   ●   │   ●   │    ●     │
│  READ_LOGS         │  ○   │    ●    │   ●   │   ●   │    ●     │
│  READ_HEALTH       │  ○   │    ●    │   ●   │   ●   │    ●     │
│  READ_INVENTORY    │  ○   │    ●    │   ●   │   ●   │    ●     │
│  ──────────────────┼──────┼─────────┼───────┼───────┼─────────  │
│  SET_POWER         │  ○   │    ●    │   ●   │   ○   │    ●     │
│  SET_LIMITS        │  ○   │    ●    │   ●   │   ○   │    ●     │
│  SET_CONFIG        │  ○   │    ○    │   ●   │   ○   │    ●     │
│  ENABLE            │  ○   │    ●    │   ●   │   ○   │    ●     │
│  DISABLE           │  ○   │    ●    │   ●   │   ●   │    ●     │
│  ──────────────────┼──────┼─────────┼───────┼───────┼─────────  │
│  SHUTDOWN          │  ○   │    ●    │   ●   │   ●   │    ●     │
│  RESTART           │  ○   │    ●    │   ●   │   ●   │    ●     │
│  FIRMWARE_UPDATE   │  ○   │    ○    │   ●   │   ●   │    ●     │
│  FACTORY_RESET     │  ○   │    ○    │   ○   │   ○   │    ●     │
│  KEY_PROVISION     │  ○   │    ○    │   ○   │   ○   │    ○*    │
│                                                                  │
│  ● = Allowed   ○ = Denied   * = Factory only                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Role Assignment

```c
/* Role identification from message source */
typedef enum {
    ROLE_MODULE_PEER = 0,
    ROLE_STATION_CONTROLLER = 1,
    ROLE_DEPOT_CONTROLLER = 2,
    ROLE_CLOUD_ADMIN = 3,
    ROLE_MAINTENANCE = 4,
    ROLE_UNKNOWN = 255
} Role_t;

Role_t IdentifyRole(uint8_t source_id, const CANMessage_t *msg) {
    /* Module peer: Source ID is a valid module ID (0x00-0xFE) */
    if (source_id >= 0x00 && source_id <= 0xFE) {
        return ROLE_MODULE_PEER;
    }

    /* Station controller: Source ID 0xFF with valid certificate */
    if (source_id == 0xFF) {
        /* Check CMAC signature */
        if (msg->flags & FLAG_HAS_CMAC) {
            if (VerifyStationCMAC(msg)) {
                return ROLE_STATION_CONTROLLER;
            }
        }
    }

    /* Other roles require additional authentication context */
    return ROLE_UNKNOWN;
}
```

---

## 4. Message Authentication (CMAC)

### 4.1 AES-128-CMAC Overview

CMAC (Cipher-based Message Authentication Code) provides:
- Message integrity (detect tampering)
- Message authenticity (verify sender)
- Replay protection (sequence numbers)

```
┌─────────────────────────────────────────────────────────────────┐
│                    CMAC Authentication Flow                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Sender (Station Controller):                                  │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │                                                         │  │
│    │    Message ──┬──────────────────────────► Payload       │  │
│    │              │                                          │  │
│    │              ▼                                          │  │
│    │    ┌───────────────┐                                    │  │
│    │    │  AES-CMAC     │◄─── Session Key                    │  │
│    │    │  (STM32 HW)   │                                    │  │
│    │    └───────┬───────┘                                    │  │
│    │            │                                            │  │
│    │            ▼                                            │  │
│    │    8-byte MAC ──────────────────────────► Appended      │  │
│    │                                                         │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│    Receiver (EK3 Module):                                        │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │                                                         │  │
│    │    Payload ──────────────────────┬──────────────────────┤  │
│    │                                  │                      │  │
│    │    Received MAC ─────────────────┤                      │  │
│    │                                  │                      │  │
│    │                                  ▼                      │  │
│    │                        ┌───────────────┐                │  │
│    │    Session Key ──────► │  AES-CMAC     │                │  │
│    │                        │  Verify       │                │  │
│    │                        └───────┬───────┘                │  │
│    │                                │                        │  │
│    │                                ▼                        │  │
│    │                    Match? ─┬─ Yes ─► Accept             │  │
│    │                            │                            │  │
│    │                            └─ No ──► Reject             │  │
│    │                                                         │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 STM32G474 Hardware CMAC

```c
/* CMAC computation using STM32 hardware AES */
#define CMAC_KEY_SIZE   16  /* AES-128 */
#define CMAC_TAG_SIZE   8   /* Truncated to 64 bits for CAN */

typedef struct {
    uint8_t key[CMAC_KEY_SIZE];
    uint8_t subkey1[16];
    uint8_t subkey2[16];
} CMACContext_t;

/* Initialize CMAC with session key */
HAL_StatusTypeDef CMAC_Init(CMACContext_t *ctx, const uint8_t *key) {
    memcpy(ctx->key, key, CMAC_KEY_SIZE);

    /* Generate subkeys using AES */
    uint8_t L[16] = {0};
    CRYP_HandleTypeDef hcryp;

    hcryp.Instance = AES;
    hcryp.Init.Algorithm = CRYP_AES_ECB;
    hcryp.Init.DataType = CRYP_DATATYPE_8B;
    hcryp.Init.KeySize = CRYP_KEYSIZE_128B;
    hcryp.Init.pKey = (uint32_t*)key;

    HAL_CRYP_Init(&hcryp);
    HAL_CRYP_Encrypt(&hcryp, (uint8_t*)"\x00\x00\x00\x00\x00\x00\x00\x00"
                             "\x00\x00\x00\x00\x00\x00\x00\x00",
                     16, L, HAL_MAX_DELAY);

    /* Generate K1 and K2 from L */
    GenerateSubkeys(L, ctx->subkey1, ctx->subkey2);

    return HAL_OK;
}

/* Compute CMAC tag */
HAL_StatusTypeDef CMAC_Compute(
    CMACContext_t *ctx,
    const uint8_t *message,
    uint32_t length,
    uint8_t *tag
) {
    CRYP_HandleTypeDef hcryp;

    hcryp.Instance = AES;
    hcryp.Init.Algorithm = CRYP_AES_CBC;
    hcryp.Init.DataType = CRYP_DATATYPE_8B;
    hcryp.Init.KeySize = CRYP_KEYSIZE_128B;
    hcryp.Init.pKey = (uint32_t*)ctx->key;
    hcryp.Init.pInitVect = (uint32_t*)"\x00\x00\x00\x00\x00\x00\x00\x00"
                                       "\x00\x00\x00\x00\x00\x00\x00\x00";

    HAL_CRYP_Init(&hcryp);

    /* Process all blocks except last */
    uint8_t block[16];
    uint8_t ciphertext[16] = {0};

    for (uint32_t i = 0; i < length - 16; i += 16) {
        XOR_Blocks(block, &message[i], ciphertext);
        HAL_CRYP_Encrypt(&hcryp, block, 16, ciphertext, HAL_MAX_DELAY);
    }

    /* Process last block with subkey */
    uint8_t last_block[16];
    PrepareLastBlock(message, length, ctx->subkey1, ctx->subkey2, last_block);
    XOR_Blocks(block, last_block, ciphertext);
    HAL_CRYP_Encrypt(&hcryp, block, 16, ciphertext, HAL_MAX_DELAY);

    /* Truncate to 8 bytes for CAN payload */
    memcpy(tag, ciphertext, CMAC_TAG_SIZE);

    return HAL_OK;
}
```

### 4.3 Replay Protection

```c
/* Sequence number tracking per source */
#define MAX_SOURCES 256
#define SEQ_WINDOW_SIZE 32

typedef struct {
    uint8_t last_seq;
    uint32_t window_bitmap;  /* Sliding window for out-of-order */
} SequenceTracker_t;

static SequenceTracker_t seq_tracker[MAX_SOURCES];

/* Check if sequence number is valid (not replay) */
bool CheckSequence(uint8_t source, uint8_t seq) {
    SequenceTracker_t *tracker = &seq_tracker[source];

    /* Calculate distance from last seen sequence */
    int8_t delta = (int8_t)(seq - tracker->last_seq);

    if (delta > 0) {
        /* New sequence, shift window */
        if (delta < SEQ_WINDOW_SIZE) {
            tracker->window_bitmap <<= delta;
            tracker->window_bitmap |= 1;  /* Mark as seen */
        } else {
            tracker->window_bitmap = 1;  /* Too far ahead, reset */
        }
        tracker->last_seq = seq;
        return true;
    } else if (delta == 0) {
        /* Exact replay */
        return false;
    } else {
        /* Behind current sequence, check window */
        uint8_t offset = (uint8_t)(-delta);
        if (offset >= SEQ_WINDOW_SIZE) {
            return false;  /* Too old */
        }
        uint32_t mask = 1 << offset;
        if (tracker->window_bitmap & mask) {
            return false;  /* Already seen */
        }
        tracker->window_bitmap |= mask;
        return true;
    }
}
```

---

## 5. Key Management

### 5.1 Key Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    Key Hierarchy                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Root Keys (Factory Provisioned, OTP):                         │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │                                                         │  │
│    │  ┌───────────────────────────────────────────────────┐ │  │
│    │  │ Firmware Signing Public Key (Ed25519, 32 bytes)   │ │  │
│    │  │ • Verifies application signatures                  │ │  │
│    │  │ • Cannot be changed (OTP fused)                    │ │  │
│    │  └───────────────────────────────────────────────────┘ │  │
│    │                                                         │  │
│    │  ┌───────────────────────────────────────────────────┐ │  │
│    │  │ Device Master Key (AES-256, 32 bytes)             │ │  │
│    │  │ • Derives all session keys                         │ │  │
│    │  │ • Unique per module                                │ │  │
│    │  │ • Never leaves secure storage                      │ │  │
│    │  └───────────────────────────────────────────────────┘ │  │
│    │                                                         │  │
│    └─────────────────────────────────────────────────────────┘  │
│                          │                                       │
│                          ▼                                       │
│    Derived Keys (Runtime):                                       │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │                                                         │  │
│    │  ┌───────────────────────────────────────────────────┐ │  │
│    │  │ Station Session Key (AES-128)                      │ │  │
│    │  │ • Derived: HKDF(DMK, station_id, epoch)           │ │  │
│    │  │ • Rotated daily                                    │ │  │
│    │  │ • Used for CMAC with station controller            │ │  │
│    │  └───────────────────────────────────────────────────┘ │  │
│    │                                                         │  │
│    │  ┌───────────────────────────────────────────────────┐ │  │
│    │  │ Log Encryption Key (AES-128)                       │ │  │
│    │  │ • Derived: HKDF(DMK, "LOG", module_id)            │ │  │
│    │  │ • Static per module                                │ │  │
│    │  │ • Used for audit log encryption                    │ │  │
│    │  └───────────────────────────────────────────────────┘ │  │
│    │                                                         │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Key Derivation

```c
/* HKDF-based key derivation */
#define HKDF_HASH_LEN 32  /* SHA-256 */

typedef struct {
    uint8_t station_id[4];
    uint32_t epoch;  /* Day number since epoch */
    uint8_t purpose; /* 0x01=CMAC, 0x02=Encryption */
} KeyContext_t;

HAL_StatusTypeDef DeriveSessionKey(
    const uint8_t *master_key,
    const KeyContext_t *context,
    uint8_t *session_key
) {
    /* HKDF-Extract */
    uint8_t prk[HKDF_HASH_LEN];
    HMAC_SHA256(
        (uint8_t*)"EK3-KEY-DERIVATION",  /* Salt */
        18,
        master_key,
        32,
        prk
    );

    /* HKDF-Expand */
    uint8_t info[16];
    memcpy(&info[0], context->station_id, 4);
    memcpy(&info[4], &context->epoch, 4);
    info[8] = context->purpose;
    memset(&info[9], 0, 7);

    return HKDF_Expand(prk, info, 16, session_key, 16);
}
```

### 5.3 Key Rotation

```
┌─────────────────────────────────────────────────────────────────┐
│                    Key Rotation Schedule                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Key Type               │ Rotation Period │ Trigger             │
│  ───────────────────────┼─────────────────┼────────────────────  │
│  Device Master Key      │ Never           │ N/A (OTP)           │
│  Firmware Signing Key   │ 5 years         │ Manual ceremony     │
│  Station Session Key    │ 24 hours        │ Epoch change        │
│  Certificate            │ 1 year          │ Expiry date         │
│  API Key                │ 90 days         │ Policy + manual     │
│                                                                  │
│  Session Key Rotation Process:                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                             ││
│  │  1. At 00:00 UTC, epoch increments                          ││
│  │  2. Module derives new session key using new epoch          ││
│  │  3. Both old and new keys accepted for 1 hour (grace)       ││
│  │  4. At 01:00 UTC, old key disabled                          ││
│  │                                                             ││
│  │  Grace period allows for clock drift between devices        ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.4 Key Revocation

```c
/* Key revocation list (stored in flash, synced from cloud) */
#define MAX_REVOKED_KEYS 256

typedef struct {
    uint8_t key_id[8];     /* First 8 bytes of key fingerprint */
    uint32_t revoked_time; /* Unix timestamp */
    uint8_t reason;        /* Revocation reason code */
} RevokedKey_t;

typedef struct {
    uint32_t version;
    uint32_t count;
    RevokedKey_t entries[MAX_REVOKED_KEYS];
    uint32_t crc32;
} RevocationList_t;

/* Check if a key is revoked */
bool IsKeyRevoked(const uint8_t *key_fingerprint) {
    RevocationList_t *list = GetRevocationList();

    for (uint32_t i = 0; i < list->count; i++) {
        if (memcmp(key_fingerprint, list->entries[i].key_id, 8) == 0) {
            return true;
        }
    }
    return false;
}
```

---

## 6. Security Events

### 6.1 Event Categories

| Category | Code Range | Examples |
|----------|------------|----------|
| Authentication | 0x6000-0x60FF | Login, logout, auth failure |
| Authorization | 0x6100-0x61FF | Permission denied, role change |
| Cryptographic | 0x6200-0x62FF | Key rotation, signature failure |
| Physical | 0x6300-0x63FF | Tamper detected, door open |
| Firmware | 0x6400-0x64FF | Update started, verified, failed |
| Configuration | 0x6500-0x65FF | Setting changed, reset |

### 6.2 Security Event Logging

```c
/* Security event structure */
typedef struct {
    uint32_t timestamp;        /* Unix timestamp */
    uint16_t event_code;       /* Event type */
    uint8_t  severity;         /* 1-5 */
    uint8_t  source;           /* Module/station ID */
    uint8_t  actor_id[8];      /* Who triggered (if known) */
    uint8_t  details[16];      /* Event-specific data */
    uint8_t  cmac[8];          /* Integrity check */
} SecurityEvent_t;

/* Log a security event (always, cannot be disabled) */
void LogSecurityEvent(
    uint16_t event_code,
    uint8_t severity,
    const uint8_t *actor_id,
    const uint8_t *details
) {
    SecurityEvent_t event;

    event.timestamp = GetUnixTime();
    event.event_code = event_code;
    event.severity = severity;
    event.source = g_module_id;

    if (actor_id) {
        memcpy(event.actor_id, actor_id, 8);
    } else {
        memset(event.actor_id, 0, 8);
    }

    if (details) {
        memcpy(event.details, details, 16);
    } else {
        memset(event.details, 0, 16);
    }

    /* Compute CMAC for tamper evidence */
    CMAC_Compute(&g_log_cmac_ctx,
                 (uint8_t*)&event,
                 sizeof(event) - 8,
                 event.cmac);

    /* Write to secure log partition */
    WriteToSecurityLog(&event);

    /* If severity >= 4, alert immediately */
    if (severity >= 4) {
        SendSecurityAlert(&event);
    }
}
```

### 6.3 Alert Escalation

```
┌─────────────────────────────────────────────────────────────────┐
│                    Alert Escalation Path                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Severity 1 (INFO):                                              │
│  → Log locally only                                              │
│                                                                  │
│  Severity 2 (WARNING):                                           │
│  → Log locally                                                   │
│  → Include in daily report to station                           │
│                                                                  │
│  Severity 3 (ERROR):                                             │
│  → Log locally                                                   │
│  → Real-time notification to station controller                 │
│  → Include in depot dashboard                                    │
│                                                                  │
│  Severity 4 (CRITICAL):                                          │
│  → Log locally                                                   │
│  → Real-time notification to station and depot                  │
│  → Cloud alert (email/SMS to on-call)                           │
│  → Module enters degraded mode                                   │
│                                                                  │
│  Severity 5 (EMERGENCY):                                         │
│  → All of above                                                  │
│  → Module shuts down                                             │
│  → Adjacent modules alerted                                      │
│  → May trigger facility-wide alarm                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. References

| Document | Description |
|----------|-------------|
| `tehnika/10-microkernel-architecture.md` | Trust boundaries |
| `tehnika/13-hardware-security.md` | Hardware security |
| `tehnika/12-audit-logging.md` | Audit logging details |
| `tehnika/komponente/module-interface-spec.md` | CAN message format |
| NIST SP 800-108 | Key Derivation Functions |
| NIST SP 800-38B | CMAC Specification |

---

## Appendix A: Security Checklist

| Item | Priority | Verification |
|------|----------|--------------|
| RDP Level 2 enabled | Critical | Read option bytes |
| CMAC keys provisioned | Critical | Test authentication |
| Secure boot verified | Critical | Check boot log |
| Sequence tracking active | High | Send replay, verify reject |
| RBAC enforced | High | Test permission denial |
| Security logging enabled | High | Check log entries |
| Key rotation working | Medium | Check after epoch change |
| Revocation list updated | Medium | Check version |

---

## Appendix B: Security Event Codes

| Code | Name | Severity | Description |
|------|------|----------|-------------|
| 0x6000 | AUTH_SUCCESS | 1 | Successful authentication |
| 0x6001 | AUTH_FAILURE | 3 | Authentication failed |
| 0x6002 | AUTH_LOCKOUT | 4 | Too many failures, locked |
| 0x6100 | PERMISSION_DENIED | 2 | Insufficient permissions |
| 0x6101 | ROLE_CHANGED | 2 | Role assignment changed |
| 0x6200 | KEY_ROTATED | 1 | Session key rotated |
| 0x6201 | SIGNATURE_INVALID | 4 | CMAC verification failed |
| 0x6202 | REPLAY_DETECTED | 3 | Sequence number replay |
| 0x6300 | TAMPER_DETECTED | 4 | Physical tamper event |
| 0x6301 | ENCLOSURE_OPEN | 3 | Enclosure opened |
| 0x6400 | FW_UPDATE_START | 2 | Firmware update started |
| 0x6401 | FW_UPDATE_SUCCESS | 2 | Update completed |
| 0x6402 | FW_UPDATE_FAILED | 4 | Update failed |
| 0x6500 | CONFIG_CHANGED | 2 | Configuration modified |
| 0x6501 | FACTORY_RESET | 3 | Factory reset performed |
