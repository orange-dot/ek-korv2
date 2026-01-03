# Komunikacijski Protokoli za EV Punjače

## 1. Pregled Komunikacijske Arhitekture

### 1.1 Komunikacijski Slojevi

```
Hijerarhija Komunikacije u EV Punjenju:

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

Protokoli po Slojevima:

│ Sloj                    │ Protokol              │ Medijum       │
├─────────────────────────┼───────────────────────┼───────────────┤
│ Cloud ↔ Station         │ OCPP 1.6/2.0          │ 4G/Ethernet   │
│ Station ↔ Power Module  │ CAN / Modbus          │ Twisted pair  │
│ Station ↔ Vehicle (HLC) │ ISO 15118             │ PLC (CP line) │
│ Station ↔ Vehicle (BLC) │ IEC 61851-1 (PWM)     │ CP line       │
│ Vehicle internal        │ CAN                   │ Vehicle CAN   │
│ BMS ↔ Charger (DC)      │ CAN (proprietary/std) │ DC connector  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Standardi za EV Punjenje

```
Ključni Standardi:

IEC 61851-1: Opšti zahtevi za EV punjenje
    └── Definira signalizaciju, bezbednost, konektore

IEC 61851-23: DC charging (CHAdeMO, CCS, GB/T)
    └── Specifičnosti za DC fast charging

IEC 61851-24: Digitalna komunikacija za DC
    └── Kontrolni protokol za DC punjenje

ISO 15118: Komunikacija vozilo-mreža (V2G)
    ├── Part 1: Opšte definicije
    ├── Part 2: Mrežni i aplikacijski protokol
    ├── Part 3: Fizički sloj i data link (PLC)
    ├── Part 4: Zahtevi za umrežavanje
    ├── Part 8: Wireless (WiFi baziran)
    └── Part 20: 2nd generation (ISO 15118-20)

CHAdeMO: Japanski standard za DC (verzije 0.9-3.0)

GB/T: Kineski standard (GB/T 27930)

OCPP (Open Charge Point Protocol):
    ├── OCPP 1.6: Najrasprostranjeniji
    ├── OCPP 2.0: Novi, sa ISO 15118 podrškom
    └── OCPP 2.0.1: Trenutno aktuelna verzija
```

## 2. IEC 61851-1: Osnovna Signalizacija

### 2.1 Control Pilot (CP) Signal

```
CP Signalizacija (PWM):

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

Stanja CP Signala:

│ Stanje │ Pozitivna │ Negativna │ Značenje              │
├────────┼───────────┼───────────┼───────────────────────┤
│   A    │   +12V    │    N/A    │ EV nije konektovan    │
│   B    │   +9V     │   -12V    │ EV konektovan, ne puni│
│   C    │   +6V     │   -12V    │ EV puni, bez ventil.  │
│   D    │   +3V     │   -12V    │ EV puni, sa ventil.   │
│   E    │    0V     │    0V     │ Greška                │
│   F    │   -12V    │   -12V    │ EVSE nije dostupan    │

Duty Cycle → Max Struja:

│ Duty Cycle  │ Max Struja (A)                    │
├─────────────┼───────────────────────────────────┤
│ 10%         │ 6 A                               │
│ 16%         │ 10 A (min za ISO 15118 HLC)       │
│ 25%         │ 16 A                              │
│ 50%         │ 32 A                              │
│ 80%         │ 51 A                              │
│ 90%         │ 57 A                              │
│ 96%         │ 80 A (max za AC Mode 3)           │
│ 5%          │ Digital communication mode (HLC)  │

Formula:
I (A) = Duty Cycle (%) × 0.6    (za DC ≤ 85%)
I (A) = (Duty Cycle - 64) × 2.5  (za DC > 85%)
```

### 2.2 Proximity Pilot (PP)

```
PP Signal za Cable Rating:

PP Pin Otpori i Kapaciteti:

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   EVSE ──────┬───────────────────────────────── Connector  │
│              │                                              │
│         ┌────┴────┐                                         │
│         │  R_pp   │  Otpor koji određuje kapacitet kabla   │
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

PP za DC punjenje (CCS):
- Koristi se za button detection (disconnection)
- Nije za cable rating (DC kabel fiksiran)
```

### 2.3 Hardverska Implementacija

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

Komponente:
- OP-AMP: LM358 ili TL072 (rail-to-rail preferirano)
- Comparator za peak detection: LM393
- Voltage divider: 10:1 za ADC kompatibilnost
```

## 3. ISO 15118: High-Level Communication

### 3.1 Pregled ISO 15118

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

Timing zahtevi:
- SLAC: <10 s
- V2G message response: <2 s
- CurrentDemand cycle: 50-250 ms
```

### 3.3 ISO 15118-20: Druga Generacija

```
Nove Funkcije u ISO 15118-20:

1. Bidirectional Power Transfer (BPT):
   - V2G (Vehicle to Grid)
   - V2H (Vehicle to Home)
   - Scheduled charging/discharging

2. Advanced Payment:
   - Plug & Charge 2.0
   - External Identification Means (EIM)
   - Contract certificates

3. AC Bidirectional:
   - Podrška za trofazno AC V2G

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
HomePlug GreenPHY Implementacija:

┌─────────────────────────────────────────────────────────────────┐
│                    PLC MODEM (EVSE strana)                      │
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
   - Cena: ~$15-20

2. Lumissil IS2062G:
   - Green PHY v1.1
   - SLAC support
   - Lower cost alternative
   - Cena: ~$10-12

3. I2SE Modules (PLC Stamp):
   - QCA7000 based modules
   - Ready-to-use solutions
   - Development kits available
   - Cena: ~€80-100 (dev kit)

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

### 4.1 OCPP Arhitektura

```
OCPP Komunikacija:

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

OCPP Verzije:

│ Verzija │ Transport     │ Encoding │ Features            │
├─────────┼───────────────┼──────────┼─────────────────────┤
│ 1.5     │ SOAP/HTTP     │ XML      │ Basic               │
│ 1.6     │ WebSocket     │ JSON     │ Smart Charging      │
│ 2.0     │ WebSocket     │ JSON     │ ISO 15118, Security │
│ 2.0.1   │ WebSocket     │ JSON     │ Bug fixes, clarity  │
│ 2.1     │ WebSocket     │ JSON     │ V2G, ISO 15118-20   │
```

### 4.2 OCPP 1.6 Poruke

```
Ključne OCPP 1.6 Poruke:

1. Core Profile (obavezne):
┌────────────────────────────────────────────────────────────┐
│ Poruka              │ Smer     │ Opis                      │
├─────────────────────┼──────────┼───────────────────────────┤
│ Authorize           │ CP→CSMS  │ Provera autorizacije      │
│ BootNotification    │ CP→CSMS  │ Startup, capabilities     │
│ Heartbeat           │ CP→CSMS  │ Keep-alive (svaka 5 min)  │
│ MeterValues         │ CP→CSMS  │ Energija, snaga, itd.     │
│ StartTransaction    │ CP→CSMS  │ Početak punjenja          │
│ StopTransaction     │ CP→CSMS  │ Kraj punjenja             │
│ StatusNotification  │ CP→CSMS  │ Status promene            │
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

### 4.3 OCPP 2.0.1 Novosti

```
OCPP 2.0.1 Poboljšanja:

1. Device Model:
   - Hijerarhijski model komponenti
   - EVSE → Connector struktura
   - Standardizovane varijable

2. Security:
   - TLS 1.2/1.3 obavezan
   - Client certificates
   - Security events/logging

3. ISO 15118 Integracija:
   ┌─────────────────────────────────────────────────────┐
   │ Poruka                  │ Opis                      │
   ├─────────────────────────┼───────────────────────────┤
   │ Get15118EVCertificate   │ Certificate installation  │
   │ DeleteCertificate       │ Certificate management    │
   │ GetInstalledCertificateIds│ List certificates       │
   │ InstallCertificate      │ Install new cert          │
   └─────────────────────────────────────────────────────┘

4. Smart Charging Enhanced:
   - Prioretizacija profila
   - Cost-based charging
   - V2G preparation

5. Transaction Handling:
   - TransactionEvent (unified)
   - Detaljniji status reporting

OCPP 2.0.1 Primer Poruke (JSON):

// StartTransaction equivalent u 2.0.1
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

### 4.4 OCPP Implementacija

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
   Maven: com.infuse-ev:java-oca-ocpp

4. C/C++: libocpp (Everest)
   Open source, production ready
   https://github.com/EVerest/libocpp

CSMS Backend Options:

│ Rešenje        │ Tip        │ Cena          │ Features        │
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

### 5.1 CHAdeMO Komunikacija

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

Primer CAN Poruke (0x101 - EV Request):

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

### 5.2 CHAdeMO Sekvenca

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

Collaboration između CHAdeMO Association i China Electricity
Council za novi globalni standard.

Karakteristike:
- Max 900 kW (do 1500V / 600A)
- Novi konektor dizajn (manji, lakši)
- Unapređena komunikacija
- Kompatibilnost sa starim CHAdeMO

         CHAdeMO 2.0          CHAdeMO 3.0/ChaoJi
         ───────────          ──────────────────
Max Power:   400 kW              900 kW
Max Voltage: 1000 V              1500 V
Max Current: 400 A               600 A
Connector:   Large, heavy        Compact, light
Communication: CAN               CAN + PLC option

Status: Pilot deployments 2024+
```

## 6. CAN Bus Interno

### 6.1 Interna CAN Arhitektura

```
CAN Bus unutar Punjača:

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌───────────────┐                                            │
│   │ Main Controller│◄───────┐                                  │
│   │    (Master)    │        │                                  │
│   └───────┬───────┘        │                                  │
│           │                 │ CAN Bus                          │
│           │                 │ (500 kbps)                       │
│   ┌───────┴─────────────────┼─────────────────────────┐       │
│   │       │                 │                         │        │
│   │  ┌────┴────┐       ┌────┴────┐           ┌───────┴──┐     │
│   │  │ Power   │       │ Power   │           │  Safety  │     │
│   │  │Module 1 │       │Module 2 │    ...    │   MCU    │     │
│   │  └─────────┘       └─────────┘           └──────────┘     │
│   │                                                            │
│   │  Terminacija                          Terminacija          │
│   │     ├═══════════════════════════════════════┤             │
│   │    120Ω                                    120Ω            │
│   │                                                            │
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

### 6.2 CANopen za Punjače

```
CANopen Object Dictionary:

Standard objects za EV charger:

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

### 6.3 CAN Hardware

```
CAN Transceiver Selection:

1. Texas Instruments TCAN1042:
   - CAN 2.0, 5 Mbps capable
   - -40°C to +150°C
   - Standby mode: <5 μA
   - Bus fault protection
   - Cena: ~$1.5

2. NXP TJA1042:
   - Industry standard
   - -40°C to +150°C
   - AEC-Q100 qualified
   - Cena: ~$1.2

3. Infineon TLE9250:
   - CAN-FD, 8 Mbps
   - Integrated ESD protection
   - Wake patterns
   - Cena: ~$2

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

## 7. Ethernet i Cloud Komunikacija

### 7.1 Ethernet Interfejs

```
Ethernet za OCPP i dijagnostiku:

Opcije:
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
│   Prednosti:                                                │
│   - Offloaded TCP/IP stack                                  │
│   - Hardware socket management                              │
│   - SPI: 80 MHz, ~25 Mbps                                  │
│   - Cena: ~$5-10 (module)                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Security Considerations:
- TLS 1.2/1.3 za OCPP
- Firewall rules
- VLAN segregation
- Certificate pinning
```

### 7.2 Cellular Connectivity

```
4G/LTE Modul za Remote Communication:

Moduli:
1. Quectel EC25:
   - Cat 4 LTE
   - 150 Mbps DL / 50 Mbps UL
   - GPS integrated
   - Cena: ~$40

2. SIMCom SIM7600:
   - Cat 4 LTE
   - Global bands
   - Cena: ~$35

3. u-blox SARA-R4:
   - LTE Cat M1 / NB-IoT
   - Low power
   - Cena: ~$25

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

## 8. Bill of Materials - Komunikacija

```
┌─────────────────────────────────────────────────────────────────┐
│ KOMUNIKACIONE KOMPONENTE (150 kW DC Punjač)                     │
├──────────────────────────────┬─────┬────────────┬───────────────┤
│ Komponenta                   │ Qty │ Jed. cena  │    Ukupno     │
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
│ (za MID merenje)             │     │            │               │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Connectors, cables           │ set │    €30     │     €30       │
├──────────────────────────────┴─────┴────────────┼───────────────┤
│ UKUPNO KOMUNIKACIJA                             │    €218       │
└─────────────────────────────────────────────────┴───────────────┘
```

## 9. Zaključak

```
Preporuke za Komunikaciju:

1. Vehicle Communication:
   ├── IEC 61851-1 (PWM): Obavezno - osnovna signalizacija
   ├── ISO 15118-2: Preporučeno za CCS DC punjenje
   ├── ISO 15118-20: Future-proof za V2G
   └── CHAdeMO: Po potrebi za japanska vozila

2. Backend Communication:
   ├── OCPP 1.6: Minimum za interoperabilnost
   ├── OCPP 2.0.1: Za nove instalacije
   └── OCPP 2.1: Kada V2G bude aktuelan

3. Internal Communication:
   ├── CAN: Standard za power modules
   ├── CANopen: Za kompleksnije sisteme
   └── Modbus: Za legacy komponente

4. Connectivity:
   ├── 4G/LTE: Primary for remote management
   ├── Ethernet: For local network/maintenance
   └── WiFi: Optional for configuration

5. Security:
   ├── TLS 1.3 za sve mrežne konekcije
   ├── Certificate management (PKI)
   └── Secure boot za firmware integrity
```
