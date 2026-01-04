# Hardware Security Architecture

> **Note:** This is the patent filing version. For living documentation, see [`tehnika/13-hardware-security.md`](../../tehnika/13-hardware-security.md).

**Document Version:** 1.0
**Date:** 2026-01-04
**Author:** Bojan Janjatović
**Email:** bojan.janjatovic@gmail.com
**Address:** Vojislava Ilica 8, Kikinda, Severni Banat, Serbia

---

## 1. Overview

```
DEFENSE IN DEPTH - HARDWARE LAYER
═══════════════════════════════════════════════════════════════

This document describes the hardware-level security measures
implemented in the EK3 module to protect against:

• Physical tampering
• Side-channel attacks
• Electromagnetic interference
• Unauthorized access to cryptographic keys
• Reverse engineering attempts

Hardware security forms LEVEL 0 (non-bypassable) in our
trust boundary architecture.
```

---

## 2. PCB Security Design

### 2.1 Layer Stack Security

```
6-LAYER PCB STACK WITH SECURITY FEATURES
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ Layer 1: TOP        - Power components, general signals     │
│          (2 oz Cu)    NO sensitive signals on this layer    │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: GND        - Solid ground plane                    │
│          (1 oz Cu)    Shields internal layers from EMI      │
├─────────────────────────────────────────────────────────────┤
│ Layer 3: SIGNAL     - Crypto signals, key routing          │
│          (1 oz Cu)    PROTECTED by GND planes above/below   │
├─────────────────────────────────────────────────────────────┤
│ Layer 4: POWER      - DC rails, internal power              │
│          (2 oz Cu)    Also acts as shield                   │
├─────────────────────────────────────────────────────────────┤
│ Layer 5: GND        - Second ground plane                   │
│          (1 oz Cu)    Additional EMI shielding              │
├─────────────────────────────────────────────────────────────┤
│ Layer 6: BOTTOM     - MCU, low-power components            │
│          (1 oz Cu)    Debug ports, test points             │
└─────────────────────────────────────────────────────────────┘

Security Principles:
• Sensitive signals (crypto, keys) ONLY on Layer 3 (internal)
• Cannot be probed without destructive layer removal
• Ground planes shield against EM emanations
```

### 2.2 Guard Rings

```
GUARD RING IMPLEMENTATION
═══════════════════════════════════════════════════════════════

                    ┌─────────────────────────┐
                    │    CRYPTO SECTION       │
                    │  ┌───────────────────┐  │
      GUARD         │  │                   │  │
      RING          │  │   STM32G474       │  │
      (GND)         │  │   AES Engine      │  │
       ║            │  │   Key Storage     │  │
       ║            │  │                   │  │
═══════╬════════════│  └───────────────────┘  │═══════════════
       ║            │                         │
       ║            └─────────────────────────┘
       ║
       ╚═══════════════════════════════════════════════════════

Implementation:
• 0.5mm wide copper trace on all layers
• Connected to digital ground at single point
• Surrounds:
  - MCU crypto section
  - JTAG/SWD debug port
  - Key storage area (if external secure element used)

Purpose:
• Blocks EM side-channel leakage
• Provides defined boundary for security analysis
• Enables active tamper detection (broken trace = alert)
```

### 2.3 Via Stitching

```
VIA STITCHING FOR SECURITY
═══════════════════════════════════════════════════════════════

     TOP                                           BOTTOM
      │                                              │
      ▼                                              ▼
    ─────●─────●─────●─────●─────●─────●─────●─────────
         │     │     │     │     │     │     │
    ─────●─────●─────●─────●─────●─────●─────●─────────  GND
         │     │     │     │     │     │     │
    ─────●─────●─────●─────●─────●─────●─────●─────────  GND
         │     │     │     │     │     │     │
    ─────●─────●─────●─────●─────●─────●─────●─────────

Via Grid Specifications:
• Via diameter: 0.3mm
• Via pitch: 2.5mm (dense around crypto)
• Via pitch: 5.0mm (general areas)
• Connects all ground planes

Benefits:
• Low-impedance ground return path
• Excellent EMI shielding effectiveness (>40dB)
• Prevents cavity resonance
• Consistent ground reference for crypto operations
```

### 2.4 Differential Pair Routing (CAN Bus)

```
CAN-FD DIFFERENTIAL PAIR ROUTING
═══════════════════════════════════════════════════════════════

         CAN_H ════════════════════════════════════════
                ↕ 0.2mm gap
         CAN_L ════════════════════════════════════════

         ═══════════════════════════════════════════════
                        GND PLANE (reference)

Specifications:
• Trace width: 0.25mm
• Trace spacing: 0.2mm (gap between H and L)
• Impedance: 120Ω differential
• Reference: Adjacent ground plane
• Max length mismatch: <5mm

Routing Rules:
• Keep pairs together (no separation)
• Avoid crossing power planes
• Length match within 5mm
• Terminate at both ends (120Ω)
• Place near ground plane for low EMI
```

---

## 3. Cryptographic Hardware

### 3.1 STM32G474 Built-in Security

```
STM32G474 SECURITY FEATURES
═══════════════════════════════════════════════════════════════

AES HARDWARE ACCELERATOR:
• AES-128, AES-192, AES-256
• ECB, CBC, CTR, GCM modes
• CMAC support (for message authentication)
• DPA countermeasures (randomized timing)
• Throughput: ~40 Mbps @ 170 MHz

TRUE RANDOM NUMBER GENERATOR (TRNG):
• Compliant with NIST SP 800-90B
• Hardware entropy source (ring oscillators)
• 32-bit output
• Pass NIST statistical tests
• Used for:
  - Session key generation
  - Nonce generation
  - IV generation for encryption

SECURE KEY STORAGE:
• Option Bytes (OB): Configuration protection
• OTP (One-Time Programmable): 1KB, write-once
• SRAM2: Battery-backed, zeroizable on tamper
• RDP Level 2: Permanent read protection

READ-OUT PROTECTION (RDP):
┌─────────────────────────────────────────────────────────────┐
│ LEVEL │ PROTECTION                                          │
├───────┼─────────────────────────────────────────────────────┤
│ 0     │ No protection (development only)                    │
│ 1     │ Flash read protected via debugger                   │
│       │ Can revert to Level 0 (erases flash)                │
│ 2     │ PERMANENT read protection                           │
│       │ Debug interface disabled forever                    │
│       │ JTAG/SWD non-functional                             │
│       │ CANNOT REVERT - device locked                       │
└─────────────────────────────────────────────────────────────┘

Production modules use RDP Level 2.
```

### 3.2 Key Storage Architecture

```
KEY STORAGE LOCATIONS
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                    KEY HIERARCHY                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  OTP AREA (1KB) - Permanently written at manufacturing      │
│  ═══════════════════════════════════════════════════════    │
│  • Module unique ID (128 bits)                              │
│  • Device key (128 bits) - for deriving session keys        │
│  • Firmware signing public key (256 bits Ed25519)           │
│  • Anti-rollback counter (32 bits)                          │
│                                                              │
│  SRAM2 (Battery-backed) - Session data                      │
│  ═══════════════════════════════════════════════════════    │
│  • Current session key                                      │
│  • Sequence counters                                        │
│  • Tamper flags                                             │
│  • CLEARED on any tamper event                              │
│                                                              │
│  FLASH (Protected region) - Configuration                   │
│  ═══════════════════════════════════════════════════════    │
│  • Encrypted configuration data                             │
│  • Module certificates                                      │
│  • Audit logs (integrity protected)                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 External Secure Element (Optional)

```
OPTIONAL SECURE ELEMENT
═══════════════════════════════════════════════════════════════

For high-security deployments, an external secure element
can be added:

CANDIDATES:
┌─────────────────────────────────────────────────────────────┐
│ CHIP          │ FEATURES                         │ COST     │
├───────────────┼──────────────────────────────────┼──────────┤
│ ATECC608B     │ ECDSA, AES, SHA, RNG            │ $0.60    │
│ (Microchip)   │ Secure key storage (16 slots)   │          │
│               │ I2C interface                    │          │
├───────────────┼──────────────────────────────────┼──────────┤
│ STSAFE-A110   │ ECDSA, AES, secure counter      │ $0.80    │
│ (ST)          │ Secure boot support             │          │
│               │ I2C interface                    │          │
├───────────────┼──────────────────────────────────┼──────────┤
│ SE050         │ RSA, ECC, AES, EdgeLock         │ $2.00    │
│ (NXP)         │ IoT-optimized                   │          │
│               │ I2C interface                    │          │
└─────────────────────────────────────────────────────────────┘

When to use external SE:
• Certificate storage for PKI deployments
• When FIPS 140-2 Level 3 required
• For secure element provisioning service integration

Connection:
• I2C bus (100/400 kHz)
• Separate power supply (for power analysis resistance)
• Shield around SE area on PCB
```

---

## 4. Tamper Detection

### 4.1 Passive Tamper Detection

```
PASSIVE TAMPER MECHANISMS
═══════════════════════════════════════════════════════════════

1. ENCLOSURE OPEN DETECTION
   ─────────────────────────
   • Mechanical switch on enclosure lid
   • Normally-closed (NC) contact
   • Connects to GPIO with internal pull-up
   • Opening breaks circuit → interrupt

   Circuit:
   VCC ────┬──── GPIO (with internal pull-up)
           │
         [NC Switch]
           │
   GND ────┘

2. LIGHT SENSOR (OPTIONAL)
   ────────────────────────
   • Photodiode inside enclosure
   • Detects if enclosure opened in lit environment
   • Backup for mechanical switch

   Sensitivity: >10 lux triggers detection

3. MESH LAYER (HIGH SECURITY)
   ──────────────────────────
   • Fine copper trace pattern over crypto section
   • Any cut detected via resistance monitoring
   • Used in high-value deployments only
   • Adds ~$2 to PCB cost
```

### 4.2 Active Tamper Detection

```
ACTIVE TAMPER DETECTION
═══════════════════════════════════════════════════════════════

1. VOLTAGE GLITCH DETECTION
   ─────────────────────────
   • Monitors VCC for sudden drops/spikes
   • Threshold: ±10% of nominal
   • Response time: <100ns
   • STM32G4 built-in BOR (Brownout Reset)

   BOR Levels:
   ┌─────────┬────────────────┐
   │ Level   │ Threshold      │
   ├─────────┼────────────────┤
   │ BOR0    │ 1.7V (lowest)  │
   │ BOR1    │ 2.0V           │
   │ BOR2    │ 2.2V           │
   │ BOR3    │ 2.5V           │
   │ BOR4    │ 2.8V (highest) │
   └─────────┴────────────────┘

   Configuration: BOR4 (most sensitive) for crypto operations

2. CLOCK GLITCH DETECTION
   ───────────────────────
   • CSS (Clock Security System) monitors HSE
   • Detects clock failures or manipulation
   • Auto-switch to HSI if HSE fails
   • Generates NMI interrupt

3. TEMPERATURE ANOMALY
   ────────────────────
   • ADC monitors multiple temperature points
   • Expected range: -20°C to +85°C
   • Anomaly: Temperature change >10°C/sec
   • Could indicate heating attack (fault injection)

4. SEQUENCE MONITORING
   ────────────────────
   • Watchdog checks expected code flow
   • Unexpected jumps trigger reset
   • Prevents return-oriented programming
```

### 4.3 Tamper Response

```
TAMPER RESPONSE ACTIONS
═══════════════════════════════════════════════════════════════

Upon tamper detection:

IMMEDIATE (Hardware-triggered):
┌─────────────────────────────────────────────────────────────┐
│ 1. Zeroize session keys (SRAM2 → all zeros)                │
│    • Happens in <1µs via hardware                          │
│    • No firmware involvement needed                        │
│                                                              │
│ 2. Assert tamper flag in backup domain                     │
│    • Survives power cycling                                │
│    • Must be cleared by authorized command                 │
└─────────────────────────────────────────────────────────────┘

SUBSEQUENT (Firmware-triggered):
┌─────────────────────────────────────────────────────────────┐
│ 3. Log tamper event to audit log                           │
│    • Type, timestamp, sensor data                          │
│    • Protected by CMAC (integrity)                         │
│                                                              │
│ 4. Disable normal operation                                │
│    • Module enters TAMPER state                            │
│    • Power output disabled                                 │
│    • Only responds to diagnostic commands                  │
│                                                              │
│ 5. Alert Station Controller                                │
│    • High-priority CAN message                             │
│    • Includes tamper details                               │
│                                                              │
│ 6. Wait for authorized recovery                            │
│    • Requires MAINTENANCE or FACTORY role                  │
│    • Physical inspection recommended                       │
└─────────────────────────────────────────────────────────────┘

Recovery Procedure:
1. Physical inspection by technician
2. MAINTENANCE role authenticates via CAN
3. Issue TAMPER_CLEAR command
4. Module performs self-test
5. If OK, returns to normal operation
6. If not OK, requires factory service
```

---

## 5. Physical Protection

### 5.1 Enclosure Design

```
MODULE ENCLOSURE SECURITY
═══════════════════════════════════════════════════════════════

MATERIAL: Aluminum alloy (6061-T6)
• Excellent EMI shielding
• Good thermal conductivity
• Corrosion resistant

CONSTRUCTION:
┌─────────────────────────────────────────────────────────────┐
│                     TOP VIEW                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│    │
│  │▓ HEATSINK (top) - Finned extrusion                ▓│    │
│  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│    │
│  │                                                     │    │
│  │  ┌─────────────────────────────────────────────┐   │    │
│  │  │               PCB ASSEMBLY                   │   │    │
│  │  │  (conformal coated for moisture/dust)       │   │    │
│  │  └─────────────────────────────────────────────┘   │    │
│  │                                                     │    │
│  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│    │
│  │▓ BOTTOM COVER - Sheet metal with gasket        ▓│    │
│  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

EMI SHIELDING:
• Enclosure provides >40dB shielding (100MHz-1GHz)
• Finger stock or conductive gasket at seams
• No direct openings to internal cavity

IP RATING: IP20 (when in rack)
• Protection against finger ingress
• No water protection (indoor use only)
• Rack provides additional protection
```

### 5.2 Conformal Coating

```
CONFORMAL COATING SPECIFICATION
═══════════════════════════════════════════════════════════════

TYPE: Acrylic or silicone-based coating

COVERAGE:
• Entire PCB top and bottom
• Min thickness: 25µm, Max: 75µm

EXCEPTIONS (No coating):
• Connector contacts
• Test points
• Heat-sensitive components (MOSFETs - thermal pad only)
• Mounting holes

BENEFITS:
• Humidity protection (85% RH, 85°C operation)
• Dust protection
• Minor corrosion resistance
• Discourages casual reverse engineering
• Adds ~$0.50 per module

APPLICATION:
• Selective spray coating (automated)
• UV inspection for coverage verification
• Cure time: 24h ambient, or 1h @ 80°C
```

### 5.3 Connector Security

```
CONNECTOR SECURITY FEATURES
═══════════════════════════════════════════════════════════════

KEYING (Mechanical):
• Unique key per module type (A, B, C, D)
• Cannot insert wrong module type
• Prevents operator error and intentional misuse

LOCKING:
• Spring latch with secondary lock
• Requires deliberate action to release
• Prevents accidental disconnection
• Vibration resistant

ESD PROTECTION:
• TVS diodes on all signal pins
• Contact discharge: ±15kV
• Air discharge: ±25kV
• Meets IEC 61000-4-2 Level 4

CONTACT INTEGRITY:
• Gold-plated contacts (50µ" min)
• >10,000 mating cycles rated
• Self-wiping action (cleans on insertion)
• Visual inspection window (optional)
```

---

## 6. Power Supply Security

### 6.1 Brownout Detection

```
BROWNOUT PROTECTION CHAIN
═══════════════════════════════════════════════════════════════

VCC ────┬──── BOR (STM32 internal)
        │      │
        │      └──→ Reset if VCC < 2.8V
        │
        ├──── Supervisor IC (MAX809 or similar)
        │      │
        │      └──→ External reset, watchdog
        │
        └──── Voltage Monitor ADC
               │
               └──→ Soft warnings, logging

RESPONSE TO BROWNOUT:
1. BOR triggers → MCU reset (hardware)
2. Supervisor holds reset until VCC stable
3. On recovery, check tamper flags
4. Log brownout event
5. Resume normal operation

This prevents:
• Glitch attacks during low-voltage
• Unpredictable behavior during power dips
• Corrupted flash writes during power loss
```

### 6.2 Glitch Protection

```
POWER SUPPLY FILTERING
═══════════════════════════════════════════════════════════════

     VIN ─────┬─────[L1]─────┬─────[L2]─────┬───── VCC_MCU
              │              │              │
             ═╪═            ═╪═            ═╪═
             ═╪═ C1         ═╪═ C2         ═╪═ C3
              │   100µF      │   10µF       │   100nF
              │              │              │
     GND ─────┴──────────────┴──────────────┴───── GND

COMPONENT SPECIFICATIONS:
• L1: Ferrite bead, 100MHz impedance >100Ω
• L2: Ferrite bead, 100MHz impedance >600Ω (near MCU)
• C1: Bulk capacitor, low ESR, aluminum polymer
• C2: Ceramic MLCC, X5R or X7R
• C3: Ceramic MLCC, close to VCC pin

This configuration:
• Filters high-frequency noise (>10MHz)
• Absorbs transient energy
• Provides local energy reserve for MCU
• Attenuates conducted emissions
```

---

## 7. EMC for Dual CAN Bus

### 7.1 CAN Bus Termination

```
CAN-FD TERMINATION OPTIONS
═══════════════════════════════════════════════════════════════

OPTION A: Standard Termination (Recommended)
─────────────────────────────────────────────

    CAN_H ═══════════════════════════════════════ CAN_H
              │                              │
              R                              R
              │  120Ω                        │  120Ω
              R                              R
              │                              │
    CAN_L ═══════════════════════════════════════ CAN_L

          NODE 1                          NODE N
          (first)                         (last)

Only the first and last nodes have 120Ω termination.
Total bus impedance: 60Ω (two 120Ω in parallel).


OPTION B: Split Termination (Better EMC)
────────────────────────────────────────

    CAN_H ═══════════════════════════════════════ CAN_H
              │                              │
              R                              R
              │  60Ω                         │  60Ω
              ├──┬──                         ├──┬──
              │  │                           │  │
             ═╪═ C  4.7nF                   ═╪═ C
              │  │                           │  │
              ├──┴──                         ├──┴──
              │  60Ω                         │  60Ω
              R                              R
              │                              │
    CAN_L ═══════════════════════════════════════ CAN_L

Split termination:
• Two 60Ω resistors + capacitor to ground
• AC path to ground for common-mode noise
• Better EMI performance
• Recommended for CAN-FD at 5 Mbps
```

### 7.2 Common Mode Choke

```
COMMON MODE CHOKE IMPLEMENTATION
═══════════════════════════════════════════════════════════════

At module CAN connector input:

                 COMMON MODE CHOKE
    CAN_H ────────╥═══════════════╥──────── CAN_H (internal)
                  ║      ●●●      ║
                  ║      ●●●      ║  (coupled windings)
                  ║      ●●●      ║
    CAN_L ────────╨═══════════════╨──────── CAN_L (internal)

SPECIFICATIONS:
• Impedance: >200Ω @ 100MHz (common mode)
• Differential impedance: <2Ω
• Current rating: >500mA
• Package: SMD 1210 or similar

CANDIDATES:
• Murata DLW21SN900SQ2
• TDK ACM2012-900-2P
• Wurth 744232090

PURPOSE:
• Rejects common-mode noise from backplane
• Reduces radiated emissions from CAN bus
• Improves ESD immunity
• Does NOT affect differential signal
```

### 7.3 CAN Transceiver Selection

```
CAN-FD TRANSCEIVER: TJA1443 (NXP)
═══════════════════════════════════════════════════════════════

KEY SPECIFICATIONS:
• CAN-FD capable: up to 5 Mbps data phase
• Supply voltage: 5V
• Logic levels: 3.3V compatible (VIO pin)
• ESD protection: ±8kV (HBM)
• Standby current: <5µA
• Operating temp: -40°C to +150°C

FEATURES FOR SECURITY:
• Bus fault protection (short to battery, ground)
• Thermal shutdown
• TXD dominant timeout (prevents bus lockup)
• Partial networking (wake on pattern)

ALTERNATIVE (Isolated):
• ISO1042 (Texas Instruments)
• Reinforced isolation: 5000V RMS
• For galvanic isolation between modules
• Higher cost (~$3 vs $1)
• Use when ground potential differences expected

CONNECTION:
┌─────────────┐         ┌─────────────┐
│   STM32G4   │         │   TJA1443   │
│             │         │             │
│  CAN1_TX ───┼─────────┼──→ TXD      │
│  CAN1_RX ───┼─────────┼──← RXD      │
│             │         │             │
│      3.3V ──┼─────────┼──→ VIO      │
│       GND ──┼─────────┼──→ GND      │
│             │         │      VCC ───┼──── 5V
│             │         │             │
│             │         │  CAN_H ─────┼──→ To connector
│             │         │  CAN_L ─────┼──→ (via CMC)
└─────────────┘         └─────────────┘
```

---

## 8. Debug Port Security

### 8.1 JTAG/SWD Protection

```
DEBUG PORT SECURITY
═══════════════════════════════════════════════════════════════

DEVELOPMENT MODE (RDP Level 0):
• Full JTAG/SWD access
• All memory readable
• Used only during development
• NEVER shipped to customers

PRODUCTION MODE (RDP Level 2):
• JTAG/SWD permanently disabled
• Cannot read flash or RAM
• Cannot halt processor
• Debug port pins can be reused as GPIO

TRANSITION:
• RDP 0 → RDP 1: Reversible (erases flash)
• RDP 1 → RDP 2: PERMANENT, IRREVERSIBLE
• Done during manufacturing programming

PHYSICAL PROTECTION:
• Debug header NOT populated on production units
• Pads present for factory use only
• Covered by enclosure (not accessible externally)
• Optional: Debug pads removed from PCB revision for
  high-security deployments
```

### 8.2 Production Programming

```
SECURE MANUFACTURING FLOW
═══════════════════════════════════════════════════════════════

    ┌─────────────────────────────────────────────────────────┐
    │                 MANUFACTURING LINE                       │
    └─────────────────────────┬───────────────────────────────┘
                              │
                              ▼
    ┌─────────────────────────────────────────────────────────┐
    │ STEP 1: INITIAL PROGRAMMING (RDP 0)                      │
    │ • Flash bootloader                                       │
    │ • Flash application firmware                             │
    │ • Write device unique ID to OTP                          │
    │ • Write firmware public key to OTP                       │
    └─────────────────────────┬───────────────────────────────┘
                              │
                              ▼
    ┌─────────────────────────────────────────────────────────┐
    │ STEP 2: KEY INJECTION (Secure Station)                   │
    │ • HSM generates device key from master + unique ID       │
    │ • Device key written to OTP (encrypted channel)          │
    │ • HSM records key in secure database                     │
    └─────────────────────────┬───────────────────────────────┘
                              │
                              ▼
    ┌─────────────────────────────────────────────────────────┐
    │ STEP 3: LOCKDOWN                                         │
    │ • Set Option Bytes for security                          │
    │ • Enable RDP Level 2 (PERMANENT)                         │
    │ • Verify lockdown successful                             │
    └─────────────────────────┬───────────────────────────────┘
                              │
                              ▼
    ┌─────────────────────────────────────────────────────────┐
    │ STEP 4: FUNCTIONAL TEST                                  │
    │ • Full power-on self test                                │
    │ • Crypto operation verification                          │
    │ • CAN communication check                                │
    │ • Thermal sensor calibration                             │
    └─────────────────────────────────────────────────────────┘
```

---

## 9. Security Certification Considerations

```
APPLICABLE STANDARDS
═══════════════════════════════════════════════════════════════

FOR EMBEDDED SECURITY:
• IEC 62443 - Industrial communication network security
• EN 303 645 - Cybersecurity for consumer IoT
• ETSI EN 319 411 - Electronic signatures

FOR CRYPTOGRAPHIC MODULES (if required):
• FIPS 140-2 Level 1 - Basic crypto module
• FIPS 140-2 Level 2 - Tamper-evidence
• FIPS 140-2 Level 3 - Tamper-resistant (requires external SE)

FOR POWER ELECTRONICS SAFETY:
• IEC 62477-1 - Power electronic converter systems
• IEC 61508 - Functional safety (SIL rating)
• ISO 26262 - Road vehicles functional safety (if vehicle-integrated)

CURRENT DESIGN TARGETS:
• IEC 62443 SL 2 (Security Level 2)
• FIPS 140-2 Level 1 (software-only crypto)
• FIPS 140-2 Level 2 achievable with minor additions
```

---

## 10. Revision History

| Version | Date       | Changes                    |
|---------|------------|----------------------------|
| 1.0     | 2026-01-04 | Initial document           |

---

## References

- STM32G4 Security Reference Manual (RM0440)
- NIST SP 800-57: Key Management Recommendations
- NIST SP 800-90B: Random Bit Generator Validation
- IEC 62443-4-2: Technical security requirements
- CAN in Automation (CiA) 301: CANopen application layer
- NXP TJA1443 Datasheet
- Microchip ATECC608B Datasheet
