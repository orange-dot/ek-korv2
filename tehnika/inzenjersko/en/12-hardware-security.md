# EK3 Hardware Security

## Document Information

| Field | Value |
|-------|-------|
| Document ID | EK-TECH-013 |
| Version | 1.0 |
| Date | 2026-01-03 |
| Status | Active |
| Author | Elektrokombinacija Engineering |

---

## 1. Overview

### 1.1 Hardware Security Philosophy

The EK3 module implements defense-in-depth at the hardware level:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Defense-in-Depth Layers                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 5: Physical Security                                      │
│           • Enclosure, locks, tamper seals                       │
│                                                                  │
│  Layer 4: Tamper Detection                                       │
│           • Intrusion sensors, voltage monitoring                │
│                                                                  │
│  Layer 3: Cryptographic Security                                 │
│           • Secure boot, CMAC authentication, encrypted keys     │
│                                                                  │
│  Layer 2: Memory Protection                                      │
│           • MPU, read-out protection, OTP fuses                  │
│                                                                  │
│  Layer 1: PCB Security                                           │
│           • Guard rings, via stitching, buried traces            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Threat Model

**Physical Access Threats:**

| Threat | Risk Level | Mitigation |
|--------|------------|------------|
| Module theft | Medium | Encrypted keys, remote disable |
| Firmware extraction | High | RDP Level 2, secure boot |
| Key extraction | High | OTP storage, hardware crypto |
| Hardware tampering | Medium | Tamper detection, conformal coating |
| Debug port access | High | JTAG disabled in production |
| Side-channel attack | Low | Constant-time crypto, noise injection |

---

## 2. PCB Layout for Security

### 2.1 Guard Rings

Sensitive circuit areas are protected by guard rings:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Guard Ring Implementation                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │  ╔═══════════════════════════════════════════════════╗  │  │
│    │  ║                                                   ║  │  │
│    │  ║   ┌─────────────────────────────────────────┐    ║  │  │
│    │  ║   │                                         │    ║  │  │
│    │  ║   │      CRYPTO SECTION                     │    ║  │  │
│    │  ║   │      • AES keys                         │    ║  │  │
│    │  ║   │      • CMAC computation                 │    ║  │  │
│    │  ║   │      • TRNG                             │    ║  │  │
│    │  ║   │                                         │    ║  │  │
│    │  ║   └─────────────────────────────────────────┘    ║  │  │
│    │  ║                                                   ║  │  │
│    │  ╚═══════════════════════════════════════════════════╝  │  │
│    │   ▲                                                  ▲   │  │
│    │   │                                                  │   │  │
│    │   └──────── Guard Ring (ground pour) ────────────────┘   │  │
│    │             with via stitching                           │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Guard Ring Specifications:                                      │
│  • Width: 0.5 mm minimum                                        │
│  • Via spacing: 2 mm maximum                                    │
│  • Connected to chassis ground                                  │
│  • Continuous around sensitive sections                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Protected Sections:**
1. Cryptographic engine area (MCU vicinity)
2. JTAG/SWD debug port area
3. External secure element (if present)
4. OTP memory interface

### 2.2 Layer Stack and Routing Rules

**6-Layer PCB Stack:**

```
┌─────────────────────────────────────────────────────────────────┐
│                        PCB Layer Stack                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Layer 1 (TOP):     Signal + Components                          │
│  ─────────────────────────────────────────────────────────────  │
│                     Prepreg (0.2mm)                              │
│  ─────────────────────────────────────────────────────────────  │
│  Layer 2 (GND):     Ground Plane (continuous)                    │
│  ─────────────────────────────────────────────────────────────  │
│                     Core (0.4mm)                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Layer 3 (SIG):     Internal Signals (sensitive)                 │
│                     • Crypto signals                             │
│                     • Key data lines                             │
│                     • CAN differential pairs                     │
│  ─────────────────────────────────────────────────────────────  │
│                     Prepreg (0.2mm)                              │
│  ─────────────────────────────────────────────────────────────  │
│  Layer 4 (PWR):     Power Planes                                 │
│                     • 3.3V, 5V, 12V islands                      │
│  ─────────────────────────────────────────────────────────────  │
│                     Core (0.4mm)                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Layer 5 (GND):     Ground Plane (continuous)                    │
│  ─────────────────────────────────────────────────────────────  │
│                     Prepreg (0.2mm)                              │
│  ─────────────────────────────────────────────────────────────  │
│  Layer 6 (BOT):     Signal + Components                          │
│                                                                  │
│  Total Thickness: ~1.6mm                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Routing Rules:**

| Signal Type | Layer | Width | Spacing | Shield |
|-------------|-------|-------|---------|--------|
| Crypto/keys | L3 (internal) | 0.15mm | 0.3mm | Ground pour |
| CAN-H/CAN-L | L3 (internal) | 0.2mm | 0.2mm | Differential pair |
| Power traces | L4 | 0.5mm+ | 0.3mm | Via stitching |
| Gate drive | L1/L6 | 0.3mm | 0.5mm | Ground return |
| General I/O | L1/L6 | 0.15mm | 0.15mm | None |

### 2.3 Via Stitching

Ground plane integrity is critical for EMI and security:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Via Stitching Pattern                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     ●───●───●───●───●───●───●───●───●───●                       │
│     │                                   │                       │
│     ●   ┌───────────────────────────┐   ●                       │
│     │   │                           │   │                       │
│     ●   │    PROTECTED SECTION      │   ●                       │
│     │   │                           │   │                       │
│     ●   │    (crypto, keys)         │   ●                       │
│     │   │                           │   │                       │
│     ●   └───────────────────────────┘   ●                       │
│     │                                   │                       │
│     ●───●───●───●───●───●───●───●───●───●                       │
│                                                                  │
│     ● = Ground via (0.3mm drill, 0.6mm pad)                     │
│     Spacing: 2mm maximum along perimeter                        │
│     Purpose: Faraday cage, EMI containment                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Cryptographic Hardware

### 3.1 STM32G474 Built-in Crypto

The STM32G474 includes hardware cryptographic accelerators:

| Feature | Capability |
|---------|------------|
| AES | 128/256-bit, ECB/CBC/CTR/GCM |
| CMAC | AES-128-CMAC (message authentication) |
| TRNG | True Random Number Generator |
| CRC | Hardware CRC32 |

**AES Hardware Accelerator:**

```c
/* AES-128-CMAC for message authentication */
typedef struct {
    uint8_t key[16];      /* 128-bit key */
    uint8_t iv[16];       /* Initialization vector */
} AES_Context_t;

/* Hardware-accelerated CMAC */
HAL_StatusTypeDef ComputeCMAC(
    const uint8_t *key,
    const uint8_t *message,
    uint32_t length,
    uint8_t *mac_out
) {
    CRYP_HandleTypeDef hcryp;

    /* Configure AES in CMAC mode */
    hcryp.Instance = AES;
    hcryp.Init.DataType = CRYP_DATATYPE_8B;
    hcryp.Init.KeySize = CRYP_KEYSIZE_128B;
    hcryp.Init.Algorithm = CRYP_AES_CMAC;
    hcryp.Init.pKey = (uint32_t*)key;

    HAL_CRYP_Init(&hcryp);

    /* Compute CMAC */
    return HAL_CRYPEx_AESCMAC(
        &hcryp,
        (uint8_t*)message,
        length,
        mac_out,
        HAL_MAX_DELAY
    );
}
```

**True Random Number Generator:**

```c
/* TRNG configuration */
void InitTRNG(void) {
    /* Enable RNG clock */
    __HAL_RCC_RNG_CLK_ENABLE();

    /* Configure RNG */
    hrng.Instance = RNG;
    HAL_RNG_Init(&hrng);
}

/* Generate random bytes */
HAL_StatusTypeDef GetRandomBytes(uint8_t *buffer, uint32_t length) {
    uint32_t random_word;

    for (uint32_t i = 0; i < length; i += 4) {
        if (HAL_RNG_GenerateRandomNumber(&hrng, &random_word) != HAL_OK) {
            return HAL_ERROR;
        }

        /* Copy bytes (handle partial word at end) */
        uint32_t bytes_to_copy = MIN(4, length - i);
        memcpy(&buffer[i], &random_word, bytes_to_copy);
    }

    return HAL_OK;
}
```

### 3.2 Secure Key Storage

**Option Bytes Protection:**

```c
/* Read-out protection levels */
typedef enum {
    RDP_LEVEL_0 = 0xAA,  /* No protection (development) */
    RDP_LEVEL_1 = 0xBB,  /* Read-out disabled, can be reverted */
    RDP_LEVEL_2 = 0xCC   /* Permanent protection (production) */
} RDP_Level_t;

/* Set RDP level (CAUTION: Level 2 is PERMANENT) */
void SetReadProtection(RDP_Level_t level) {
    FLASH_OBProgramInitTypeDef ob;

    HAL_FLASH_Unlock();
    HAL_FLASH_OB_Unlock();

    ob.OptionType = OPTIONBYTE_RDP;
    ob.RDPLevel = level;

    HAL_FLASHEx_OBProgram(&ob);

    HAL_FLASH_OB_Lock();
    HAL_FLASH_Lock();

    /* Trigger option byte reload */
    HAL_FLASH_OB_Launch();
}
```

**OTP (One-Time Programmable) Memory:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    OTP Memory Layout (1 KB)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Offset    Size    Purpose                                       │
│  ──────────────────────────────────────────────────────────────  │
│  0x000     32B     Firmware signing public key (Ed25519)         │
│  0x020     16B     Device-unique AES key (factory provisioned)   │
│  0x030     16B     CMAC session key seed                         │
│  0x040     4B      Version counter (anti-rollback)               │
│  0x044     8B      Module serial number                          │
│  0x04C     4B      Manufacturing date code                       │
│  0x050     4B      Hardware revision                             │
│  0x054     428B    Reserved for future use                       │
│  0x200     512B    Calibration data (ADC, temperature)           │
│                                                                  │
│  Note: OTP can only be written once per bit (0→1)               │
│        Writing is permanent and cannot be reversed               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 External Secure Element (Optional)

For high-security deployments, an external secure element may be added:

**Option 1: Microchip ATECC608B**

| Feature | Specification |
|---------|---------------|
| Interface | I2C @ 1 MHz |
| Algorithms | ECDSA-P256, ECDH, SHA-256 |
| Key storage | 16 slots |
| Tamper protection | Active shield mesh |
| Certification | Common Criteria EAL5+ |

**Option 2: STMicroelectronics STSAFE-A110**

| Feature | Specification |
|---------|---------------|
| Interface | I2C @ 400 kHz |
| Algorithms | ECDSA-P256/P384, AES-128/256 |
| Key storage | 8 regions |
| Tamper protection | Voltage, glitch detection |
| Certification | CC EAL5+ |

**Use Cases for External SE:**
- PKI certificate storage
- TLS client authentication
- Firmware update key escrow
- Fleet-wide device identity

---

## 4. Tamper Detection

### 4.1 Passive Tamper Detection

**Enclosure Open Detection:**

```
┌─────────────────────────────────────────────────────────────────┐
│                   Enclosure Tamper Switch                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     ┌─────────────────────────────────┐                         │
│     │                                 │                         │
│     │    ┌───┐                        │                         │
│     │    │ S │◄─── Micro-switch       │                         │
│     │    └─┬─┘     (normally closed)  │                         │
│     │      │                          │                         │
│     │      └──────► GPIO (PB12)       │                         │
│     │               • Pull-up enabled │                         │
│     │               • Edge interrupt  │                         │
│     │                                 │                         │
│     └─────────────────────────────────┘                         │
│                                                                  │
│  Trigger conditions:                                             │
│  • Lid removed (switch opens → GPIO goes high)                  │
│  • Wire cut (same effect)                                       │
│                                                                  │
│  Response:                                                       │
│  • Log tamper event with timestamp                              │
│  • Alert station controller                                      │
│  • Optional: Zeroize keys (configurable)                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Light Sensor (Enclosure Breach):**

```c
/* Photodiode tamper detection */
#define LIGHT_THRESHOLD_ADC  100  /* ADC counts (dark < 100) */

void CheckLightTamper(void) {
    uint16_t light_level = ReadADC(ADC_CHANNEL_LIGHT);

    if (light_level > LIGHT_THRESHOLD_ADC) {
        /* Light detected inside sealed enclosure */
        LogTamperEvent(TAMPER_LIGHT_DETECTED, light_level);
        AlertStationController(ALERT_TAMPER);

        if (GetSecurityPolicy() == SECURITY_HIGH) {
            ZeroizeKeys();
        }
    }
}
```

### 4.2 Active Tamper Detection

**Voltage Glitch Detection:**

```
┌─────────────────────────────────────────────────────────────────┐
│                 Voltage Glitch Detection Circuit                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     VCC (3.3V)                                                   │
│         │                                                        │
│         ├────────┬───────────────────────────┐                  │
│         │        │                           │                  │
│        ┌┴┐      ┌┴┐                          │                  │
│        │R│      │C│ 100nF                    │                  │
│        │ │      │ │ (decoupling)             │                  │
│        └┬┘      └┬┘                          │                  │
│         │        │                           │                  │
│         └────────┴───────► ADC_VCC           │                  │
│                            (continuous       │                  │
│                             sampling)        │                  │
│                                              │                  │
│         Window comparator:                   │                  │
│         • Low threshold: 3.0V                │                  │
│         • High threshold: 3.6V               │                  │
│         • Sample rate: 100 kHz               │                  │
│         • Glitch trigger: >10 samples        │                  │
│           outside window                     │                  │
│                                              │                  │
└─────────────────────────────────────────────────────────────────┘
```

```c
/* Voltage monitoring ISR */
void ADC_VMON_IRQHandler(void) {
    static uint8_t glitch_count = 0;
    uint16_t vcc_adc = ADC1->DR;

    /* Convert to millivolts */
    uint16_t vcc_mv = (vcc_adc * 3300) / 4095;

    /* Check bounds */
    if (vcc_mv < VCC_MIN_MV || vcc_mv > VCC_MAX_MV) {
        glitch_count++;

        if (glitch_count >= GLITCH_THRESHOLD) {
            /* Voltage attack detected */
            LogTamperEvent(TAMPER_VOLTAGE_GLITCH, vcc_mv);
            TriggerSafeShutdown();
        }
    } else {
        glitch_count = 0;
    }
}
```

**Clock Glitch Detection:**

```c
/* Clock frequency monitoring */
void CheckClockIntegrity(void) {
    /* Use TIM2 to measure HSE clock cycles */
    uint32_t hse_cycles = MeasureHSECycles(1000); /* 1ms window */

    /* Expected: 8000 cycles (8 MHz HSE) */
    if (hse_cycles < 7800 || hse_cycles > 8200) {
        /* Clock manipulation detected */
        LogTamperEvent(TAMPER_CLOCK_GLITCH, hse_cycles);
        TriggerSafeShutdown();
    }
}
```

**Temperature Anomaly Detection:**

```c
/* Sudden temperature change detection */
#define TEMP_RATE_LIMIT_C_PER_S  5  /* Max 5°C/second change */

void CheckTemperatureAnomaly(void) {
    static int16_t last_temp = 0;
    static uint32_t last_time = 0;

    int16_t current_temp = ReadInternalTemperature();
    uint32_t current_time = HAL_GetTick();

    if (last_time != 0) {
        uint32_t delta_time_ms = current_time - last_time;
        int16_t delta_temp = abs(current_temp - last_temp);

        /* Calculate rate in °C/second */
        int16_t rate = (delta_temp * 1000) / delta_time_ms;

        if (rate > TEMP_RATE_LIMIT_C_PER_S) {
            /* Possible thermal attack (freeze spray, heat gun) */
            LogTamperEvent(TAMPER_TEMPERATURE_ANOMALY, rate);
            AlertStationController(ALERT_TAMPER);
        }
    }

    last_temp = current_temp;
    last_time = current_time;
}
```

### 4.3 Tamper Response

**Key Zeroization:**

```c
/* Emergency key zeroization */
void ZeroizeKeys(void) {
    /* Disable interrupts during zeroization */
    __disable_irq();

    /* Overwrite RAM key storage */
    volatile uint8_t *key_ram = (volatile uint8_t*)KEY_RAM_ADDRESS;
    for (int i = 0; i < KEY_RAM_SIZE; i++) {
        key_ram[i] = 0x00;
        key_ram[i] = 0xFF;
        key_ram[i] = 0xAA;
        key_ram[i] = 0x55;
        key_ram[i] = 0x00;
    }

    /* Trigger AES key register clear */
    AES->KEYR0 = 0;
    AES->KEYR1 = 0;
    AES->KEYR2 = 0;
    AES->KEYR3 = 0;

    /* Log event (to flash, before possible destruction) */
    LogTamperEvent(TAMPER_KEY_ZEROIZED, 0);

    /* Enter lockout state */
    EnterTamperLockout();
}
```

---

## 5. Physical Protection

### 5.1 Module Enclosure

**Specifications:**

| Parameter | Value |
|-----------|-------|
| Material | Aluminum alloy 6061-T6 |
| Wall thickness | 2.0 mm |
| Surface treatment | Anodized, black |
| IP rating | IP20 (in rack), IP54 (standalone) |
| EMI shielding | >60 dB @ 1 GHz |

**Enclosure Design:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     Module Enclosure (Top View)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌──────────────────────────────────────────────────────┐     │
│    │  ╔══════════════════════════════════════════════╗    │     │
│    │  ║                                              ║    │     │
│    │  ║   ┌──────────────────────────────────────┐   ║    │     │
│    │  ║   │                                      │   ║    │     │
│    │  ║   │           PCB Assembly               │   ║    │     │
│    │  ║   │                                      │   ║    │     │
│    │  ║   │   [MCU]  [GD]  [MOSFET]  [XFMR]     │   ║    │     │
│    │  ║   │                                      │   ║    │     │
│    │  ║   └──────────────────────────────────────┘   ║    │     │
│    │  ║                                              ║    │     │
│    │  ╚══════════════════════════════════════════════╝    │     │
│    │   ▲                                            ▲     │     │
│    │   └──── EMI gasket (conductive foam) ──────────┘     │     │
│    │                                                      │     │
│    │   Lid secured with tamper-evident screws             │     │
│    │   Tamper switch under lid corner                     │     │
│    └──────────────────────────────────────────────────────┘     │
│                                                                  │
│    Dimensions: 200 × 320 × 44 mm                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Connector Security

**Keying (Polarization):**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Connector Keying Design                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Module connector (male):        Backplane connector (female): │
│                                                                  │
│    ┌───────────────────┐           ┌───────────────────┐        │
│    │ █ █ █ █ █ █ █ █ █ │           │ ○ ○ ○ ○ ○ ○ ○ ○ ○ │        │
│    │ █ █ █ █   █ █ █ █ │           │ ○ ○ ○ ○   ○ ○ ○ ○ │        │
│    │         ▼         │           │         ▼         │        │
│    │       (key)       │           │      (keyway)     │        │
│    └───────────────────┘           └───────────────────┘        │
│                                                                  │
│    Key position encodes module type:                             │
│    • Position A: EK3 standard (3.3 kW)                          │
│    • Position B: EK3-HV (high voltage variant)                  │
│    • Position C: Future expansion                               │
│                                                                  │
│    Prevents insertion of wrong module type                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**ESD Protection:**

```
┌─────────────────────────────────────────────────────────────────┐
│                   ESD Protection Scheme                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Connector Pin ──────┬──────────────────► To Circuit          │
│                        │                                         │
│                       ─┴─                                        │
│                       ╲╱  TVS Diode                              │
│                       ─┬─  (bidirectional)                       │
│                        │                                         │
│                       ─┴─  GND                                   │
│                                                                  │
│    Signal Pins:                                                  │
│    • CAN-H, CAN-L: SMBJ6.0CA (±6V clamp)                        │
│    • SPI, I2C: PESD5V0S1BB (±5V clamp)                          │
│                                                                  │
│    Power Pins:                                                   │
│    • DC+, DC-: Varistor (1000V clamp)                           │
│                                                                  │
│    ESD Rating: ±15 kV HBM, ±8 kV contact                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Conformal Coating

**Application:**

| Area | Coating Type | Thickness |
|------|--------------|-----------|
| Control section | Acrylic (AR) | 50-75 µm |
| Power section | Silicone (SR) | 75-125 µm |
| Connectors | Masked (no coating) | N/A |

**Benefits:**
- Moisture protection (humidity resistance)
- Corrosion prevention (salt spray)
- Insulation (high voltage isolation)
- Reverse engineering deterrent

---

## 6. Power Supply Security

### 6.1 Brownout Detection (BOR)

STM32G474 BOR configuration:

```c
/* BOR level configuration */
typedef enum {
    BOR_LEVEL_0 = OB_BOR_LEVEL_0,  /* 1.7V threshold */
    BOR_LEVEL_1 = OB_BOR_LEVEL_1,  /* 2.0V threshold */
    BOR_LEVEL_2 = OB_BOR_LEVEL_2,  /* 2.2V threshold */
    BOR_LEVEL_3 = OB_BOR_LEVEL_3,  /* 2.5V threshold */
    BOR_LEVEL_4 = OB_BOR_LEVEL_4   /* 2.8V threshold (recommended) */
} BOR_Level_t;

/* Configure BOR in option bytes */
void ConfigureBOR(BOR_Level_t level) {
    FLASH_OBProgramInitTypeDef ob;

    HAL_FLASH_Unlock();
    HAL_FLASH_OB_Unlock();

    ob.OptionType = OPTIONBYTE_BOR;
    ob.BORLevel = level;

    HAL_FLASHEx_OBProgram(&ob);

    HAL_FLASH_OB_Lock();
    HAL_FLASH_Lock();
}
```

### 6.2 Voltage Supervisor

External supervisor IC for reliable reset:

```
┌─────────────────────────────────────────────────────────────────┐
│                  Voltage Supervisor Circuit                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     VCC (3.3V)                                                   │
│         │                                                        │
│         ├──────────────────────────────────────┐                │
│         │                                      │                │
│        ┌┴────────────────┐                     │                │
│        │   MAX809TEUR    │                     │                │
│        │   (2.93V thresh)│                     │                │
│        │                 │                     │                │
│        │  VCC    RESET   │──────► STM32 NRST   │                │
│        │    │      │     │                     │                │
│        └────┼──────┼─────┘                     │                │
│             │      │                           │                │
│             └──────┴───────────────────────────┘                │
│                    │                                             │
│                   ─┴─ GND                                        │
│                                                                  │
│     Features:                                                    │
│     • Threshold: 2.93V ±2.5%                                    │
│     • Reset pulse: 140ms (typ)                                  │
│     • Power-on reset delay: 200ms                               │
│     • Current consumption: 3µA                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Glitch Protection

Power supply filtering for glitch immunity:

```
┌─────────────────────────────────────────────────────────────────┐
│                 Power Supply Filtering                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     Input (5V)                                                   │
│         │                                                        │
│        ─┴─ Ferrite Bead                                         │
│        ─┬─ (1kΩ @ 100MHz)                                       │
│         │                                                        │
│         ├────────┬────────┬────────┐                            │
│         │        │        │        │                            │
│        ─┴─      ─┴─      ─┴─      ─┴─                           │
│        10µF     100nF    10nF     100pF                         │
│        ─┬─      ─┬─      ─┬─      ─┬─                           │
│         │        │        │        │                            │
│         └────────┴────────┴────────┴────────► To LDO            │
│                                                                  │
│     Purpose:                                                     │
│     • 10µF: Bulk energy storage                                 │
│     • 100nF: Mid-frequency decoupling                           │
│     • 10nF: High-frequency decoupling                           │
│     • 100pF: RF noise suppression                               │
│     • Ferrite: Common-mode noise rejection                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. EMC for Dual CAN

### 7.1 CAN Bus Termination

```
┌─────────────────────────────────────────────────────────────────┐
│                   CAN Bus Termination Options                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Option A: Standard Termination (120Ω)                           │
│                                                                  │
│      CAN-H ────────────────────────────────── CAN-H              │
│                         │                                        │
│                        ┌┴┐                                       │
│                        │ │ 120Ω                                  │
│                        └┬┘                                       │
│                         │                                        │
│      CAN-L ────────────────────────────────── CAN-L              │
│                                                                  │
│  Option B: Split Termination (better EMC)                        │
│                                                                  │
│      CAN-H ────────────────────────────────── CAN-H              │
│                         │                                        │
│                        ┌┴┐                                       │
│                        │ │ 60Ω                                   │
│                        └┬┘                                       │
│                         ├────┤├──── 4.7nF ────► GND              │
│                        ┌┴┐                                       │
│                        │ │ 60Ω                                   │
│                        └┬┘                                       │
│                         │                                        │
│      CAN-L ────────────────────────────────── CAN-L              │
│                                                                  │
│  Split termination provides:                                     │
│  • Better common-mode rejection                                  │
│  • Lower EMI emissions                                           │
│  • Improved ESD immunity                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Transceiver Selection

**Primary: TJA1443 (NXP)**

| Parameter | Value |
|-----------|-------|
| Data rate | Up to 5 Mbps (CAN-FD) |
| Supply voltage | 4.5-5.5V |
| Bus fault protection | ±58V |
| ESD protection | ±8 kV HBM |
| Loop delay | <200 ns |

**Alternative: ISO1042 (Texas Instruments)**

| Parameter | Value |
|-----------|-------|
| Isolation | 5000 V RMS |
| Data rate | Up to 5 Mbps |
| CMTI | >100 kV/µs |
| Use case | When galvanic isolation required |

### 7.3 CAN Routing Guidelines

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAN Signal Routing Rules                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Differential Pair Requirements:                                 │
│  • Trace width: 0.2 mm                                          │
│  • Trace spacing: 0.2 mm (edge-to-edge)                         │
│  • Impedance: 120Ω differential                                 │
│  • Length matching: ±5 mm                                       │
│                                                                  │
│  Routing Path:                                                   │
│                                                                  │
│     ┌─────────────────────────────────────────────────────┐     │
│     │  MCU                                                 │     │
│     │  ┌─────┐       ┌─────────┐       ┌──────────────┐   │     │
│     │  │CAN  │──────►│TJA1443  │──────►│ Connector    │   │     │
│     │  │TX/RX│       │Xcvr     │       │ (to backpl.) │   │     │
│     │  └─────┘       └─────────┘       └──────────────┘   │     │
│     │      │               │                              │     │
│     │      └───────────────┴─── Ground plane reference    │     │
│     │                                                      │     │
│     │  Keep CAN traces on Layer 3 (internal)              │     │
│     │  Ground plane on Layer 2 and Layer 5                │     │
│     └─────────────────────────────────────────────────────┘     │
│                                                                  │
│  Backplane:                                                      │
│  • Twisted pair cable (CAN-H and CAN-L twisted together)        │
│  • Category 5e shielded cable acceptable                        │
│  • Max stub length to any module: <30 cm                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.4 Common Mode Choke

```
┌─────────────────────────────────────────────────────────────────┐
│                Common Mode Choke Application                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     From Transceiver                   To Connector              │
│                                                                  │
│     CAN-H ──────┐    ┌──────────────── CAN-H                    │
│                 │    │                                           │
│                ┌┴────┴┐                                          │
│                │ ████ │                                          │
│                │ ████ │  Common Mode Choke                       │
│                │ ████ │  (e.g., Murata DLW5BTN501)               │
│                │ ████ │  • Impedance: 500Ω @ 100MHz              │
│                └┬────┬┘  • Rated current: 300mA                  │
│                 │    │                                           │
│     CAN-L ──────┘    └──────────────── CAN-L                    │
│                                                                  │
│     Function:                                                    │
│     • Attenuates common-mode noise from external sources        │
│     • Reduces conducted emissions from module                   │
│     • Does not affect differential CAN signals                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. References

| Document | Description |
|----------|-------------|
| `tehnika/10-microkernel-architecture.md` | System architecture |
| `tehnika/11-security-model.md` | Software security model |
| `tehnika/15-ek3-connector-spec.md` | Connector specifications |
| STM32G474 Reference Manual | RM0440 |
| AN4838 | STM32 Hardware Security |
| ATECC608B Datasheet | Microchip secure element |

---

## Appendix A: Security Checklist

| Item | Priority | Status |
|------|----------|--------|
| RDP Level 2 set | Critical | □ |
| BOR Level 4 configured | High | □ |
| JTAG disabled | Critical | □ |
| OTP keys programmed | Critical | □ |
| Secure boot verified | Critical | □ |
| Tamper switch installed | Medium | □ |
| Conformal coating applied | Medium | □ |
| ESD protection verified | High | □ |

---

## Appendix B: Component References

| Component | Part Number | Manufacturer |
|-----------|-------------|--------------|
| MCU | STM32G474RET6 | STMicroelectronics |
| CAN Transceiver | TJA1443ATK | NXP |
| Voltage Supervisor | MAX809TEUR | Maxim |
| CM Choke | DLW5BTN501 | Murata |
| TVS (CAN) | SMBJ6.0CA | Littelfuse |
| Secure Element | ATECC608B | Microchip |
