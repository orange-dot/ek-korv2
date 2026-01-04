# Communication Protocols for EV Chargers

## 1. Communication Architecture Overview

### 1.1 Communication Layers

```
Communication Hierarchy in EV Charging:

┌─────────────────────────────────────────────────────────────────┐
│                     CLOUD / BACKEND                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CSMS (Charging Station Management System)               │   │
│  │  - Billing, User management, Fleet management            │   │
│  │  - Remote monitoring, Firmware updates                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↕ OCPP (WebSocket/JSON)                │
├─────────────────────────────────────────────────────────────────┤
│                     CHARGING STATION                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Station Controller                                      │   │
│  │  - OCPP Client                                           │   │
│  │  - ISO 15118 SECC (Supply Equipment Communication Ctrl)  │   │
│  │  - Local authorization                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↕ HomePlug GreenPHY / CAN             │
├─────────────────────────────────────────────────────────────────┤
│                     ELECTRIC VEHICLE                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  EVCC (Electric Vehicle Communication Controller)        │   │
│  │  - ISO 15118 EVCC                                        │   │
│  │  - Battery Management System (BMS)                       │   │
│  │  - Vehicle control unit                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

Protocols by Layer:

│ Layer                   │ Protocol              │ Medium        │
├─────────────────────────┼───────────────────────┼───────────────┤
│ Cloud ↔ Station         │ OCPP 1.6/2.0          │ 4G/Ethernet   │
│ Station ↔ Power Module  │ CAN / Modbus          │ Twisted pair  │
│ Station ↔ Vehicle (HLC) │ ISO 15118             │ PLC (CP line) │
│ Station ↔ Vehicle (BLC) │ IEC 61851-1 (PWM)     │ CP line       │
│ Vehicle internal        │ CAN                   │ Vehicle CAN   │
│ BMS ↔ Charger (DC)      │ CAN (proprietary/std) │ DC connector  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 EV Charging Standards

```
Key Standards:

IEC 61851-1: General requirements for EV charging
    └── Defines signaling, safety, connectors

IEC 61851-23: DC charging (CHAdeMO, CCS, GB/T)
    └── Specifics for DC fast charging

IEC 61851-24: Digital communication for DC
    └── Control protocol for DC charging

ISO 15118: Vehicle-to-Grid communication (V2G)
    ├── Part 1: General definitions
    ├── Part 2: Network and application protocol
    ├── Part 3: Physical layer and data link (PLC)
    ├── Part 4: Networking requirements
    ├── Part 8: Wireless (WiFi based)
    └── Part 20: 2nd generation (ISO 15118-20)

CHAdeMO: Japanese standard for DC (versions 0.9-3.0)

GB/T: Chinese standard (GB/T 27930)

OCPP (Open Charge Point Protocol):
    ├── OCPP 1.6: Most widespread
    ├── OCPP 2.0: New, with ISO 15118 support
    └── OCPP 2.0.1: Currently active version
```

## 2. IEC 61851-1: Basic Signaling

### 2.1 Control Pilot (CP) Signal

```
CP Signaling (PWM):

    Voltage
    (V)
      │
   +12├────┐
      │    │
    +9├────┼───────────────────────────────
      │    │    Duty Cycle = Imax
    +6├────┼────┐
      │    │    │
    +3├────┼────┼────┐
      │    │    │    │
     0├────┴────┴────┴─────────────────────
      │
    -3├─────────────────────┬────┬────┬────
      │                     │    │    │
   -12├─────────────────────┴────┴────┴────
      │
      └────────────────────────────────────► t
            1 kHz PWM

CP Signal States:

│ State  │ Positive  │ Negative  │ Meaning               │
├────────┼───────────┼───────────┼───────────────────────┤
│   A    │   +12V    │    N/A    │ EV not connected      │
│   B    │   +9V     │   -12V    │ EV connected, not chg │
│   C    │   +6V     │   -12V    │ EV charging, no vent. │
│   D    │   +3V     │   -12V    │ EV charging, w/ vent. │
│   E    │    0V     │    0V     │ Error                 │
│   F    │   -12V    │   -12V    │ EVSE not available    │

Duty Cycle → Max Current:

│ Duty Cycle  │ Max Current (A)                    │
├─────────────┼───────────────────────────────────┤
│ 10%         │ 6 A                               │
│ 16%         │ 10 A (min for ISO 15118 HLC)      │
│ 25%         │ 16 A                              │
│ 50%         │ 32 A                              │
│ 80%         │ 51 A                              │
│ 90%         │ 57 A                              │
│ 96%         │ 80 A (max for AC Mode 3)          │
│ 5%          │ Digital communication mode (HLC)  │

Formula:
I (A) = Duty Cycle (%) × 0.6    (for DC ≤ 85%)
I (A) = (Duty Cycle - 64) × 2.5  (for DC > 85%)
```

### 2.2 Proximity Pilot (PP)

```
PP Signal for Cable Rating:

PP Pin Resistors and Capacities:

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   EVSE ──────┬───────────────────────────────── Connector  │
│              │                                              │
│         ┌────┴────┐                                         │
│         │  R_pp   │  Resistor determining cable capacity   │
│         └────┬────┘                                         │
│              │                                              │
│             GND                                             │
└─────────────────────────────────────────────────────────────┘

│ R_pp (Ω)    │ Cable Rating (A) │ Cross-section (mm²) │
├─────────────┼──────────────────┼─────────────────────┤
│ 100         │ 63 A             │ 16                  │
│ 220         │ 32 A             │ 6                   │
│ 680         │ 20 A             │ 4                   │
│ 1500        │ 13 A             │ 2.5                 │

PP for DC charging (CCS):
- Used for button detection (disconnection)
- Not for cable rating (DC cable is fixed)
```

### 2.3 Hardware Implementation

```
CP Signal Generator:

     +12V ────┐
              │
         ┌────┴────┐
         │  R1=1kΩ │
         └────┬────┘
              │
              ├──────────────────────── CP Output
              │
         ┌────┴────┐
         │ OP-AMP  │◄──── PWM from MCU
         │ Buffer  │
         └────┬────┘
              │
         ┌────┴────┐
         │ R2=1kΩ  │
         └────┬────┘
              │
     -12V ────┘

CP State Detection:

                    CP Input
                       │
              ┌────────┼────────┐
              │        │        │
         ┌────┴────┐   │   ┌────┴────┐
         │ Voltage │   │   │  Peak   │
         │ Divider │   │   │Detector │
         └────┬────┘   │   └────┬────┘
              │        │        │
              ▼        ▼        ▼
         ADC_pos   ADC_neg   ADC_duty
              │        │        │
              └────────┴────────┘
                       │
                     MCU
              (State Machine)

Components:
- OP-AMP: LM358 or TL072 (rail-to-rail preferred)
- Comparator for peak detection: LM393
- Voltage divider: 10:1 for ADC compatibility
```

## 3. ISO 15118: High-Level Communication

### 3.1 ISO 15118 Overview

```
ISO 15118 Stack:

┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  V2G Messages (XML/EXI encoded)                          │   │
│  │  - SessionSetup, ChargeParameterDiscovery                │   │
│  │  - PowerDelivery, ChargingStatus                         │   │
│  │  - MeteringReceipt, CertificateInstallation             │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    TRANSPORT LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  TCP/IP over IPv6 (link-local)                          │   │
│  │  SDP (SECC Discovery Protocol) over UDP                  │   │
│  │  TLS 1.2/1.3 for security                               │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    DATA LINK LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  HomePlug GreenPHY (HPGP)                                │   │
│  │  SLAC (Signal Level Attenuation Characterization)       │   │
│  │  Ethernet over PLC (Power Line Communication)           │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    PHYSICAL LAYER                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Control Pilot line (CP)                                │   │
│  │  2-30 MHz OFDM (Orthogonal Frequency Division Multiplex)│   │
│  │  ~10 Mbps theoretical, ~2 Mbps practical                │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 ISO 15118-2 Message Flow

```
Charging Session Flow (DC Fast Charging):

  EVCC (Vehicle)                           SECC (Charger)
       │                                        │
       │◄──────── CP State B detected ─────────│
       │                                        │
       │         [SLAC - PLC Link Setup]        │
       │────── CM_SLAC_PARM.REQ ──────────────►│
       │◄───── CM_SLAC_PARM.CNF ──────────────│
       │────── CM_START_ATTEN_CHAR.IND ──────►│
       │◄───── CM_ATTEN_CHAR.RSP ─────────────│
       │────── CM_VALIDATE.REQ ───────────────►│
       │◄───── CM_VALIDATE.CNF ───────────────│
       │────── CM_SLAC_MATCH.REQ ─────────────►│
       │◄───── CM_SLAC_MATCH.CNF ─────────────│
       │                                        │
       │         [SDP - Service Discovery]      │
       │────── SECC Discovery Request (UDP) ──►│
       │◄───── SECC Discovery Response ────────│
       │                                        │
       │         [TLS Handshake]                │
       │◄─────── TLS Session Setup ───────────►│
       │                                        │
       │         [V2G Communication]            │
       │────── SessionSetupReq ───────────────►│
       │◄───── SessionSetupRes ────────────────│
       │                                        │
       │────── ServiceDiscoveryReq ───────────►│
       │◄───── ServiceDiscoveryRes ────────────│
       │                                        │
       │────── ChargeParameterDiscoveryReq ───►│ Battery params
       │◄───── ChargeParameterDiscoveryRes ────│ Charger limits
       │                                        │
       │────── CableCheckReq ─────────────────►│ Isolation test
       │◄───── CableCheckRes ──────────────────│
       │                                        │
       │────── PreChargeReq ──────────────────►│ Match voltage
       │◄───── PreChargeRes ───────────────────│
       │                                        │
       │────── PowerDeliveryReq (Start) ──────►│
       │◄───── PowerDeliveryRes ───────────────│
       │                                        │
       │         [Charging Loop]                │
       │────── CurrentDemandReq ──────────────►│ Request I, V
       │◄───── CurrentDemandRes ───────────────│ Actual I, V
       │                ... (repeated)          │
       │                                        │
       │────── PowerDeliveryReq (Stop) ───────►│
       │◄───── PowerDeliveryRes ───────────────│
       │                                        │
       │────── WeldingDetectionReq ───────────►│
       │◄───── WeldingDetectionRes ────────────│
       │                                        │
       │────── SessionStopReq ────────────────►│
       │◄───── SessionStopRes ─────────────────│
       │                                        │

Timing requirements:
- SLAC: <10 s
- V2G message response: <2 s
- CurrentDemand cycle: 50-250 ms
```

### 3.3 ISO 15118-20: Second Generation

```
New Features in ISO 15118-20:

1. Bidirectional Power Transfer (BPT):
   - V2G (Vehicle to Grid)
   - V2H (Vehicle to Home)
   - Scheduled charging/discharging

2. Advanced Payment:
   - Plug & Charge 2.0
   - External Identification Means (EIM)
   - Contract certificates

3. AC Bidirectional:
   - Support for three-phase AC V2G

4. Wireless Charging:
   - ISO 15118-20 + SAE J2954
   - Inductive power transfer

5. Automated Connection Device (ACD):
   - Robot charging
   - Pantograph integrations

Message Structure Changes:

ISO 15118-2 (XML/EXI):
<ChargeParameterDiscoveryReq>
  <RequestedEnergyTransferMode>DC_extended</RequestedEnergyTransferMode>
  <DC_EVChargeParameter>
    <DC_EVStatus>...</DC_EVStatus>
    <EVMaximumCurrentLimit>200</EVMaximumCurrentLimit>
    <EVMaximumVoltageLimit>850</EVMaximumVoltageLimit>
  </DC_EVChargeParameter>
</ChargeParameterDiscoveryReq>

ISO 15118-20 (Simplified, more structured):
- Mandatory/Optional fields clearly defined
- Better error handling
- Improved security (TLS 1.3, certificate handling)
```

### 3.4 PLC Hardware

```
HomePlug GreenPHY Implementation:

┌─────────────────────────────────────────────────────────────────┐
│                    PLC MODEM (EVSE side)                        │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │    MCU      │SPI │    PLC      │    │  Coupling   │         │
│  │ (ISO 15118  │◄──►│   MODEM     │◄──►│  Circuit    │◄── CP   │
│  │  Stack)     │    │  (QCA7000)  │    │             │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

PLC Modem Chips:

1. Qualcomm QCA7000/QCA7005:
   - HomePlug GreenPHY certified
   - SPI/UART interface
   - Integrated MAC/PHY
   - ISO 15118-3 compliant
   - Price: ~$15-20

2. Lumissil IS2062G:
   - Green PHY v1.1
   - SLAC support
   - Lower cost alternative
   - Price: ~$10-12

3. I2SE Modules (PLC Stamp):
   - QCA7000 based modules
   - Ready-to-use solutions
   - Development kits available
   - Price: ~€80-100 (dev kit)

Coupling Circuit:

          CP Line
             │
        ┌────┴────┐
        │    C1   │ 100nF / 600V
        │ Coupling│
        └────┬────┘
             │
        ┌────┴────┐
        │Balun/   │
        │Transformer│
        └────┬────┘
             │
          To PLC Modem
             │
    ┌────────┴────────┐
    │ TVS Protection  │
    │  CDSOD323-T05SC │
    └─────────────────┘
```

## 4. OCPP (Open Charge Point Protocol)

### 4.1 OCPP Architecture

```
OCPP Communication:

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌─────────────────┐         ┌─────────────────┐              │
│   │     CSMS        │         │  Charge Point   │              │
│   │ (Central System)│◄───────►│  (Client)       │              │
│   │                 │   OCPP  │                 │              │
│   │ - User mgmt     │WebSocket│ - Connector mgmt│              │
│   │ - Billing       │  /JSON  │ - Local auth    │              │
│   │ - Monitoring    │         │ - Metering      │              │
│   └─────────────────┘         └─────────────────┘              │
│          ↑                                                      │
│          │ HTTPS REST API                                       │
│          ↓                                                      │
│   ┌─────────────────┐                                          │
│   │   Mobile App    │                                          │
│   │   / Web Portal  │                                          │
│   └─────────────────┘                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

OCPP Versions:

│ Version │ Transport     │ Encoding │ Features            │
├─────────┼───────────────┼──────────┼─────────────────────┤
│ 1.5     │ SOAP/HTTP     │ XML      │ Basic               │
│ 1.6     │ WebSocket     │ JSON     │ Smart Charging      │
│ 2.0     │ WebSocket     │ JSON     │ ISO 15118, Security │
│ 2.0.1   │ WebSocket     │ JSON     │ Bug fixes, clarity  │
│ 2.1     │ WebSocket     │ JSON     │ V2G, ISO 15118-20   │
```

### 4.2 OCPP 1.6 Messages

```
Key OCPP 1.6 Messages:

1. Core Profile (mandatory):
┌────────────────────────────────────────────────────────────┐
│ Message             │ Direction│ Description               │
├─────────────────────┼──────────┼───────────────────────────┤
│ Authorize           │ CP→CSMS  │ Authorization check       │
│ BootNotification    │ CP→CSMS  │ Startup, capabilities     │
│ Heartbeat           │ CP→CSMS  │ Keep-alive (every 5 min)  │
│ MeterValues         │ CP→CSMS  │ Energy, power, etc.       │
│ StartTransaction    │ CP→CSMS  │ Charging start            │
│ StopTransaction     │ CP→CSMS  │ Charging end              │
│ StatusNotification  │ CP→CSMS  │ Status changes            │
│ DataTransfer        │ ↔        │ Vendor-specific           │
│ ChangeAvailability  │ CSMS→CP  │ Enable/disable connector  │
│ ChangeConfiguration │ CSMS→CP  │ Update settings           │
│ RemoteStartTransaction│ CSMS→CP│ Remote start charging     │
│ RemoteStopTransaction │ CSMS→CP│ Remote stop               │
│ Reset               │ CSMS→CP  │ Soft/Hard reset           │
│ UnlockConnector     │ CSMS→CP  │ Emergency unlock          │
└────────────────────────────────────────────────────────────┘

2. Smart Charging Profile:
┌────────────────────────────────────────────────────────────┐
│ SetChargingProfile  │ CSMS→CP  │ Set power/current limits  │
│ GetCompositeSchedule│ CSMS→CP  │ Query active schedule     │
│ ClearChargingProfile│ CSMS→CP  │ Remove schedule           │
└────────────────────────────────────────────────────────────┘

3. Firmware Management:
┌────────────────────────────────────────────────────────────┐
│ GetDiagnostics      │ CSMS→CP  │ Request log upload        │
│ UpdateFirmware      │ CSMS→CP  │ Trigger FW update         │
│ FirmwareStatusNotif.│ CP→CSMS  │ Update progress           │
└────────────────────────────────────────────────────────────┘
```

### 4.3 OCPP 2.0.1 Improvements

```
OCPP 2.0.1 Enhancements:

1. Device Model:
   - Hierarchical component model
   - EVSE → Connector structure
   - Standardized variables

2. Security:
   - TLS 1.2/1.3 mandatory
   - Client certificates
   - Security events/logging

3. ISO 15118 Integration:
   ┌─────────────────────────────────────────────────────┐
   │ Message                  │ Description              │
   ├─────────────────────────┼───────────────────────────┤
   │ Get15118EVCertificate   │ Certificate installation  │
   │ DeleteCertificate       │ Certificate management    │
   │ GetInstalledCertificateIds│ List certificates       │
   │ InstallCertificate      │ Install new cert          │
   └─────────────────────────────────────────────────────┘

4. Smart Charging Enhanced:
   - Profile prioritization
   - Cost-based charging
   - V2G preparation

5. Transaction Handling:
   - TransactionEvent (unified)
   - More detailed status reporting

OCPP 2.0.1 Message Example (JSON):

// StartTransaction equivalent in 2.0.1
{
  "transactionId": "TX001",
  "eventType": "Started",
  "timestamp": "2024-01-15T10:30:00Z",
  "triggerReason": "Authorized",
  "seqNo": 0,
  "evse": {
    "id": 1,
    "connectorId": 1
  },
  "idToken": {
    "idToken": "AB123456",
    "type": "ISO14443"
  },
  "meterValue": [{
    "timestamp": "2024-01-15T10:30:00Z",
    "sampledValue": [{
      "value": 1250.5,
      "context": "Transaction.Begin",
      "measurand": "Energy.Active.Import.Register",
      "unit": "Wh"
    }]
  }]
}
```

### 4.4 OCPP Implementation

```
Software Libraries:

1. Python: ocpp (by Mobility House)
   pip install ocpp

   from ocpp.v16 import ChargePoint, call

   class MyChargePoint(ChargePoint):
       @on(Action.BootNotification)
       def on_boot_notification(self, **kwargs):
           return call_result.BootNotificationPayload(
               current_time=datetime.utcnow().isoformat(),
               interval=300,
               status=RegistrationStatus.accepted
           )

2. JavaScript/Node.js: ocpp-js
   npm install ocpp-js

3. Java: Java-OCA-OCPP
   Maven: com.infuse-ev/java-oca-ocpp

4. C/C++: libocpp (Everest)
   Open source, production ready
   https://github.com/EVerest/libocpp

CSMS Backend Options:

│ Solution       │ Type       │ Price         │ Features        │
├────────────────┼────────────┼───────────────┼─────────────────┤
│ SteVe          │ Open source│ Free          │ Basic, 1.6      │
│ Everest        │ Open source│ Free          │ Advanced, 2.0   │
│ ChargeHQ       │ SaaS       │ $$            │ Full featured   │
│ has·to·be      │ SaaS       │ $$$           │ Enterprise      │
│ ChargeLab      │ SaaS       │ $$            │ Fleet focused   │
│ EVBox          │ Proprietary│ With hardware │ Integrated      │
└────────────────────────────────────────────────────────────────┘
```

## 5. CHAdeMO Protocol

### 5.1 CHAdeMO Communication

```
CHAdeMO CAN Communication:

┌─────────────────────────────────────────────────────────────────┐
│                    CHAdeMO Connector                            │
│                                                                 │
│  Pins:                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  DC+  │  DC-  │  FG  │  NC  │  START  │  CHARGE │  NC  │   │
│  │       │       │      │      │  SWITCH │  ENABLE │      │   │
│  ├───────┴───────┴──────┴──────┴─────────┴─────────┴──────┤   │
│  │  PP1  │  PP2  │ CAN-H│ CAN-L│  PROX   │  GND    │  NC  │   │
│  │(CS/CP)│(CS/CP)│      │      │         │         │      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  CAN: 500 kbps, 11-bit standard ID                             │
│  Cycle time: 100 ms                                             │
└─────────────────────────────────────────────────────────────────┘

CHAdeMO CAN Messages:

│ CAN ID │ Sender │ Content                                      │
├────────┼────────┼──────────────────────────────────────────────┤
│ 0x100  │ EV     │ Min/Max battery voltage, Max current         │
│ 0x101  │ EV     │ Charging current request, SOC               │
│ 0x102  │ EV     │ Battery status flags, remaining capacity     │
│ 0x108  │ EVSE   │ Charger capabilities (V, I limits)           │
│ 0x109  │ EVSE   │ Present voltage, current, status             │
└────────────────────────────────────────────────────────────────┘

CAN Message Example (0x101 - EV Request):

Byte │ Content                    │ Resolution
─────┼────────────────────────────┼───────────
 0   │ Control protocol number    │
 1   │ Target battery voltage (H) │ × 1 V
 2   │ Target battery voltage (L) │
 3   │ Charging current request   │ × 1 A
 4   │ Fault flag                 │ Bit flags
 5   │ Status flag                │ Bit flags
 6   │ State of Charge (SOC)      │ × 1 %
 7   │ Reserved                   │
```

### 5.2 CHAdeMO Sequence

```
Charging Sequence:

    EV                                      EVSE
     │                                        │
     │◄────── Connector Inserted ─────────────│
     │        (Proximity detected)            │
     │                                        │
     │◄────── 0x108: Charger Capabilities ────│
     │                                        │
     │────── 0x100: EV Capabilities ─────────►│
     │                                        │
     │────── Start Button Pressed ───────────►│ (Physical)
     │                                        │
     │◄────── Insulation Test ────────────────│
     │                                        │
     │────── 0x102: Ready to Charge ─────────►│
     │        (Status flags)                  │
     │                                        │
     │◄────── Contactor Close ────────────────│
     │                                        │
     │◄────── 0x109: Charging Started ────────│
     │                                        │
     │         [Charging Loop - 100ms]        │
     │────── 0x101: Current Request ─────────►│
     │◄────── 0x109: Present V, I ────────────│
     │              (repeated)                │
     │                                        │
     │────── 0x102: Stop Request ────────────►│
     │        (SOC target or fault)           │
     │                                        │
     │◄────── Current Ramp Down ──────────────│
     │                                        │
     │◄────── Contactor Open ─────────────────│
     │                                        │
     │        Connector Released              │
     │                                        │
```

### 5.3 CHAdeMO 3.0 (ChaoJi)

```
CHAdeMO 3.0 / ChaoJi:

Collaboration between CHAdeMO Association and China Electricity
Council for a new global standard.

Characteristics:
- Max 900 kW (up to 1500V / 600A)
- New connector design (smaller, lighter)
- Enhanced communication
- Backward compatibility with old CHAdeMO

         CHAdeMO 2.0          CHAdeMO 3.0/ChaoJi
         ───────────          ──────────────────
Max Power:   400 kW              900 kW
Max Voltage: 1000 V              1500 V
Max Current: 400 A               600 A
Connector:   Large, heavy        Compact, light
Communication: CAN               CAN + PLC option

Status: Pilot deployments 2024+
```

## 6. Internal CAN Bus

### 6.1 Internal CAN Architecture

```
CAN-FD Bus inside Charger:

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌───────────────┐                                            │
│   │ Main Controller│◄───────┐                                  │
│   │  (CAN-FD Hub)  │        │                                  │
│   └───────┬───────┘        │                                  │
│           │                 │ CAN-FD Bus                       │
│           │                 │ (5 Mbps data / 1 Mbps arb)       │
│   ┌───────┴─────────────────┼─────────────────────────┐       │
│   │       │                 │                         │        │
│   │  ┌────┴────┐       ┌────┴────┐           ┌───────┴──┐     │
│   │  │  EK3    │       │  EK3    │           │  Robot   │     │
│   │  │Module 1 │       │Module 2 │    ...    │  Ctrl    │     │
│   │  └─────────┘       └─────────┘           └──────────┘     │
│   │                                                            │
│   │  Termination                          Termination          │
│   │     ├═══════════════════════════════════════┤             │
│   │    120Ω                                    120Ω            │
│   │                                                            │
│   │  Latency: <1ms per message                                 │
│   │  Payload: 64 bytes (vs 8 bytes CAN 2.0)                    │
│   └────────────────────────────────────────────────────────────┘
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

CAN Message Allocation:

│ ID Range   │ Purpose                    │ Period  │
├────────────┼────────────────────────────┼─────────┤
│ 0x100-0x1FF│ Power module status        │ 10 ms   │
│ 0x200-0x2FF│ Power module command       │ 10 ms   │
│ 0x300-0x3FF│ Sensor data                │ 100 ms  │
│ 0x400-0x4FF│ Safety system              │ 10 ms   │
│ 0x500-0x5FF│ Configuration              │ On demand│
│ 0x600-0x6FF│ Diagnostics                │ On demand│
│ 0x700-0x7FF│ Bootloader                 │ On demand│
```

### 6.2 CANopen for Chargers

```
CANopen Object Dictionary:

Standard objects for EV charger:

│ Index  │ Name                      │ Access │
├────────┼───────────────────────────┼────────┤
│ 0x1000 │ Device Type               │ RO     │
│ 0x1001 │ Error Register            │ RO     │
│ 0x1017 │ Producer Heartbeat Time   │ RW     │
│ 0x6000 │ Voltage Setpoint          │ RW     │
│ 0x6001 │ Current Setpoint          │ RW     │
│ 0x6002 │ Actual Voltage            │ RO     │
│ 0x6003 │ Actual Current            │ RO     │
│ 0x6010 │ Module Status             │ RO     │
│ 0x6011 │ Module Faults             │ RO     │
│ 0x6020 │ Temperature               │ RO     │

NMT (Network Management) States:
- Initialization
- Pre-operational
- Operational
- Stopped

PDO Mapping (Example):
TPDO1: Actual V, Actual I (cyclic 10ms)
RPDO1: Voltage SP, Current SP (event-driven)
```

### 6.3 CAN-FD Hardware

```
CAN-FD Transceiver Selection (RECOMMENDED for EK3):

1. NXP TJA1443 (RECOMMENDED):
   - CAN-FD, up to 5 Mbps
   - -40°C to +150°C
   - AEC-Q100 qualified
   - Standby mode: <5 μA
   - Bus fault protection
   - Price: ~$1.8

2. Infineon TLE9250:
   - CAN-FD, 8 Mbps (headroom)
   - Integrated ESD protection
   - Wake patterns
   - Price: ~$2

3. Texas Instruments TCAN1044:
   - CAN-FD, 5 Mbps
   - -40°C to +125°C
   - Low quiescent current
   - Price: ~$1.6

LEGACY (for CHAdeMO/external):

4. NXP TJA1042:
   - CAN 2.0, 1 Mbps
   - Industry standard for vehicle comms
   - AEC-Q100 qualified
   - Price: ~$1.2

CAN Isolation:

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    MCU                Isolator            CAN Bus           │
│   ┌────┐           ┌──────────┐         ┌──────┐           │
│   │CAN │───TX─────►│ISO7721   │────────►│TJA   │──── CAN_H │
│   │    │◄──RX─────│  2.5kV   │◄────────│1042  │──── CAN_L │
│   │    │           │          │         │      │           │
│   └────┘           └──────────┘         └──────┘           │
│                                                             │
│   Isolated power required for transceiver                   │
│   RECOM R1D-1212 (1W, 1.2kV isolation)                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 7. Ethernet and Cloud Communication

### 7.1 Ethernet Interface

```
Ethernet for OCPP and diagnostics:

Options:
1. Integrated MAC (STM32H7, etc.)
2. SPI-to-Ethernet (W5500)
3. Industrial Ethernet module

W5500 Module Setup:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    MCU          W5500 Module         RJ45                   │
│   ┌────┐       ┌──────────┐       ┌──────┐                 │
│   │SPI │◄─────►│   W5500  │◄─────►│Magjack│◄──► Ethernet   │
│   │    │       │  TCP/IP  │       │ +LEDs │                 │
│   │    │       │ Hardware │       │       │                 │
│   └────┘       └──────────┘       └──────┘                 │
│                                                             │
│   Advantages:                                               │
│   - Offloaded TCP/IP stack                                  │
│   - Hardware socket management                              │
│   - SPI: 80 MHz, ~25 Mbps                                  │
│   - Price: ~$5-10 (module)                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Security Considerations:
- TLS 1.2/1.3 for OCPP
- Firewall rules
- VLAN segregation
- Certificate pinning
```

### 7.2 Cellular Connectivity

```
4G/LTE Module for Remote Communication:

Modules:
1. Quectel EC25:
   - Cat 4 LTE
   - 150 Mbps DL / 50 Mbps UL
   - GPS integrated
   - Price: ~$40

2. SIMCom SIM7600:
   - Cat 4 LTE
   - Global bands
   - Price: ~$35

3. u-blox SARA-R4:
   - LTE Cat M1 / NB-IoT
   - Low power
   - Price: ~$25

Architecture:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Main MCU          4G Module           Cloud               │
│   ┌────┐           ┌────────┐         ┌──────┐             │
│   │UART│◄─────────►│Quectel │ ◄──LTE──►│ CSMS │            │
│   │    │  AT Cmds  │EC25    │         │      │             │
│   └────┘           └────────┘         └──────┘             │
│                         │                                   │
│                      ┌──┴──┐                                │
│                      │ SIM │                                │
│                      │Card │                                │
│                      └─────┘                                │
│                                                             │
│   Data usage estimation:                                    │
│   - OCPP: ~50-100 KB/day                                   │
│   - Firmware update: 5-50 MB/event                         │
│   - Diagnostics: ~10 KB/day                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 8. Bill of Materials - Communication

```
┌─────────────────────────────────────────────────────────────────┐
│ COMMUNICATION COMPONENTS (150 kW DC Charger)                    │
├──────────────────────────────┬─────┬────────────┬───────────────┤
│ Component                    │ Qty │ Unit Price │    Total      │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ PLC Modem (QCA7000 module)   │  1  │    €80     │     €80       │
│ (I2SE GreenPHY devkit)       │     │            │               │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ CAN Transceiver TJA1042      │  4  │    €1.5    │     €6        │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ CAN Isolator ISO1042         │  2  │    €4      │     €8        │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Ethernet W5500 Module        │  1  │    €10     │     €10       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ 4G Module (Quectel EC25)     │  1  │    €45     │     €45       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ 4G Antenna                   │  2  │    €5      │     €10       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ RFID Reader (ISO 14443)      │  1  │    €25     │     €25       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ RS-485 Transceiver           │  2  │    €2      │     €4        │
│ (for MID metering)           │     │            │               │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Connectors, cables           │ set │    €30     │     €30       │
├──────────────────────────────┴─────┴────────────┼───────────────┤
│ TOTAL COMMUNICATION                             │    €218       │
└─────────────────────────────────────────────────┴───────────────┘
```

## 9. Conclusion

```
Communication Recommendations:

1. Vehicle Communication:
   ├── IEC 61851-1 (PWM): Mandatory - basic signaling
   ├── ISO 15118-2: Recommended for CCS DC charging
   ├── ISO 15118-20: Future-proof for V2G
   └── CHAdeMO: As needed for Japanese vehicles

2. Backend Communication:
   ├── OCPP 1.6: Minimum for interoperability
   ├── OCPP 2.0.1: For new installations
   └── OCPP 2.1: When V2G becomes relevant

3. Internal Communication:
   ├── CAN: Standard for power modules
   ├── CANopen: For more complex systems
   └── Modbus: For legacy components

4. Connectivity:
   ├── 4G/LTE: Primary for remote management
   ├── Ethernet: For local network/maintenance
   └── WiFi: Optional for configuration

5. Security:
   ├── TLS 1.3 for all network connections
   ├── Certificate management (PKI)
   └── Secure boot for firmware integrity
```
