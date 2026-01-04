# Softver i Firmware za EV Punjače

## 1. Softverska Arhitektura

### 1.1 Slojevita Arhitektura

```
Softverski Slojevi EV Punjača:

┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Charging Application                                    │   │
│  │  - Session management                                    │   │
│  │  - User interface logic                                  │   │
│  │  - Payment processing                                    │   │
│  │  - Scheduling                                            │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    MIDDLEWARE LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Protocol Stacks          │  Services                   │   │
│  │  - ISO 15118              │  - Configuration mgmt       │   │
│  │  - OCPP                   │  - Logging/Diagnostics      │   │
│  │  - CHAdeMO                │  - OTA Update               │   │
│  │  - DIN 70121              │  - Security                 │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    CONTROL LAYER                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Power Control            │  Safety Control             │   │
│  │  - PFC controller         │  - Fault monitoring         │   │
│  │  - DC/DC controller       │  - Protection logic         │   │
│  │  - State machines         │  - Watchdog                 │   │
│  │  - Current/Voltage loops  │  - Emergency shutdown       │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    DRIVER LAYER                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Hardware Abstraction Layer (HAL)                        │   │
│  │  - PWM, ADC, GPIO                                        │   │
│  │  - CAN, SPI, UART                                        │   │
│  │  - Timers, Interrupts                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    HARDWARE                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  MCU/DSP, Power Stage, Sensors, Communication ICs       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Multi-Processor Podela

```
Podela Funkcija na Procesore:

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────────┐                                           │
│  │ SYSTEM          │  Linux/RTOS                               │
│  │ CONTROLLER      │  - HMI rendering                          │
│  │ (ARM Cortex-A)  │  - OCPP client                            │
│  │                 │  - Web server                             │
│  │ Raspberry Pi/   │  - Database                               │
│  │ i.MX6/STM32MP1  │  - Cloud communication                    │
│  └────────┬────────┘                                           │
│           │ Ethernet/CAN                                        │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ CHARGE          │  Bare-metal/RTOS                          │
│  │ CONTROLLER      │  - ISO 15118 SECC                         │
│  │ (ARM Cortex-M4) │  - CHAdeMO protocol                       │
│  │                 │  - Sequence control                        │
│  │ STM32H7/F4      │  - Thermal management                     │
│  └────────┬────────┘                                           │
│           │ CAN/SPI                                             │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ POWER           │  Bare-metal (real-time critical)          │
│  │ CONTROLLER      │  - PWM generation                         │
│  │ (C2000 DSP)     │  - Current/Voltage control                │
│  │                 │  - Grid synchronization                   │
│  │ TMS320F28379    │  - Fault protection                       │
│  └────────┬────────┘                                           │
│           │ Hardwired signals                                   │
│           ▼                                                     │
│  ┌─────────────────┐                                           │
│  │ SAFETY          │  Bare-metal (independent)                 │
│  │ CONTROLLER      │  - Watchdog monitoring                    │
│  │ (Dedicated MCU) │  - Ultimate shutdown                      │
│  │                 │  - Fault logging                          │
│  │ TMS320F28069    │  - SIL2/ASIL-B capable                    │
│  └─────────────────┘                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Real-Time Firmware

### 2.1 RTOS vs Bare-Metal

```
Kada koristiti šta:

┌────────────────────────────────────────────────────────────────┐
│ Zadatak                      │ RTOS  │ Bare-metal │ Preporuka  │
├──────────────────────────────┼───────┼────────────┼────────────┤
│ PWM control loop (>10kHz)    │  ✗    │     ✓      │ Bare-metal │
│ Current loop (<10μs)         │  ✗    │     ✓      │ Bare-metal │
│ Voltage loop (<100μs)        │  △    │     ✓      │ Bare-metal │
│ Communication (CAN, etc.)    │  ✓    │     △      │ RTOS       │
│ State machine (ms level)     │  ✓    │     ✓      │ Either     │
│ HMI updates                  │  ✓    │     ✗      │ RTOS       │
│ Logging/Diagnostics          │  ✓    │     ✗      │ RTOS       │
│ OCPP/ISO 15118               │  ✓    │     ✗      │ RTOS       │
└────────────────────────────────────────────────────────────────┘

RTOS Opcije:

1. FreeRTOS:
   - Najpopularniji, besplatan
   - Mala footprint (<10KB)
   - AWS IoT integracija
   - Dobra TI, ST podrška

2. Zephyr:
   - Linux Foundation projekat
   - Rastući ekosistem
   - Dobra mrežna podrška
   - Cryptography ugrađen

3. ThreadX (Azure RTOS):
   - Komercijalni kvalitet
   - Safety certified opcije
   - Microsoft podrška

4. Bare-metal + Super Loop:
   - Za DSP kontrolu
   - Determinističko ponašanje
   - Minimalna latencija
```

### 2.2 Kontrolne Petlje

```
Current Control Loop (C2000 DSP):

// ISR triggered by PWM at 50 kHz
__interrupt void ePWM1_ISR(void)
{
    // Read ADC (already converted, hardware triggered)
    float32_t Ia = ADC_readResult(ADCA_BASE, ADC_RESULT_ADCRESULT0);
    float32_t Ib = ADC_readResult(ADCA_BASE, ADC_RESULT_ADCRESULT1);
    float32_t Vdc = ADC_readResult(ADCB_BASE, ADC_RESULT_ADCRESULT0);

    // Scale to engineering units
    Ia = (Ia - 2048.0f) * I_SCALE;  // 12-bit centered
    Ib = (Ib - 2048.0f) * I_SCALE;
    Vdc = Vdc * V_SCALE;

    // Clarke transform (abc to αβ)
    float32_t Ialpha = Ia;
    float32_t Ibeta = ONE_BY_SQRT3 * (Ia + 2.0f * Ib);

    // Park transform (αβ to dq)
    float32_t sinTheta, cosTheta;
    __sincos(theta, &sinTheta, &cosTheta);  // TMU instruction

    float32_t Id = Ialpha * cosTheta + Ibeta * sinTheta;
    float32_t Iq = -Ialpha * sinTheta + Ibeta * cosTheta;

    // PI Controllers
    float32_t Vd_ref = PI_run(&pi_Id, Id_ref - Id);
    float32_t Vq_ref = PI_run(&pi_Iq, Iq_ref - Iq);

    // Inverse Park
    float32_t Valpha_ref = Vd_ref * cosTheta - Vq_ref * sinTheta;
    float32_t Vbeta_ref = Vd_ref * sinTheta + Vq_ref * cosTheta;

    // Space Vector Modulation
    SVM_run(Valpha_ref, Vbeta_ref, Vdc, &Ta, &Tb, &Tc);

    // Update PWM compares
    EPWM_setCounterCompareValue(EPWM1_BASE, EPWM_COUNTER_COMPARE_A, Ta);
    EPWM_setCounterCompareValue(EPWM2_BASE, EPWM_COUNTER_COMPARE_A, Tb);
    EPWM_setCounterCompareValue(EPWM3_BASE, EPWM_COUNTER_COMPARE_A, Tc);

    // Clear interrupt
    Interrupt_clearACKGroup(INTERRUPT_ACK_GROUP3);
}

// Execution time: ~2-3 μs @ 200 MHz
// Available time @ 50 kHz: 20 μs
// CPU utilization for control: ~15%
```

### 2.3 State Machine za Punjenje

```
DC Charging State Machine:

typedef enum {
    STATE_IDLE,
    STATE_WAIT_VEHICLE,
    STATE_SLAC,
    STATE_SDP,
    STATE_TLS_SETUP,
    STATE_SESSION_SETUP,
    STATE_AUTHORIZATION,
    STATE_CABLE_CHECK,
    STATE_PRE_CHARGE,
    STATE_POWER_DELIVERY,
    STATE_CHARGING,
    STATE_RAMP_DOWN,
    STATE_WELDING_CHECK,
    STATE_SESSION_STOP,
    STATE_ERROR
} ChargingState_t;

typedef struct {
    ChargingState_t state;
    uint32_t stateTimer;
    uint32_t errorCode;
    float targetVoltage;
    float targetCurrent;
    float actualVoltage;
    float actualCurrent;
    float soc;
    bool vehicleReady;
    bool chargerReady;
} ChargingSession_t;

State Diagram:

     ┌──────────────────────────────────────────────────┐
     │                                                  │
     ▼                                                  │
  ┌──────┐                                              │
  │ IDLE │◄─────────────────────────────────────────────┤
  └──┬───┘                                              │
     │ Connector inserted                               │
     ▼                                                  │
  ┌──────────────┐                                      │
  │WAIT_VEHICLE  │──timeout──►┌───────┐                │
  └──────┬───────┘            │ ERROR │◄───────────────┤
     │ CP=B detected          └───────┘                │
     ▼                            ▲                     │
  ┌──────┐                        │                     │
  │ SLAC │────────fail───────────►│                     │
  └──┬───┘                        │                     │
     │ SLAC complete              │                     │
     ▼                            │                     │
  ┌──────┐                        │                     │
  │ SDP  │────────fail───────────►│                     │
  └──┬───┘                        │                     │
     │ SECC found                 │                     │
     ▼                            │                     │
  ┌──────────┐                    │                     │
  │TLS_SETUP │───────fail────────►│                     │
  └────┬─────┘                    │                     │
       │ TLS OK                   │                     │
       ▼                          │                     │
  ┌──────────────┐                │                     │
  │SESSION_SETUP │───fail────────►│                     │
  └──────┬───────┘                │                     │
         │ OK                     │                     │
         ▼                        │                     │
  ┌──────────────┐                │                     │
  │AUTHORIZATION │───fail────────►│                     │
  └──────┬───────┘                │                     │
         │ Authorized             │                     │
         ▼                        │                     │
  ┌────────────┐                  │                     │
  │CABLE_CHECK │───────fail──────►│                     │
  └──────┬─────┘                  │                     │
         │ Isolation OK           │                     │
         ▼                        │                     │
  ┌────────────┐                  │                     │
  │PRE_CHARGE  │───────fail──────►│                     │
  └──────┬─────┘                  │                     │
         │ Voltage matched        │                     │
         ▼                        │                     │
  ┌────────────────┐              │                     │
  │POWER_DELIVERY  │──fail───────►│                     │
  └───────┬────────┘              │                     │
          │ OK                    │                     │
          ▼                       │                     │
  ┌──────────┐     EV stop        │                     │
  │ CHARGING │──────request──────►│                     │
  └────┬─────┘                    │                     │
       │ SOC reached or EV stop   │                     │
       ▼                          │                     │
  ┌───────────┐                   │                     │
  │RAMP_DOWN  │                   │                     │
  └─────┬─────┘                   │                     │
        │ Current = 0             │                     │
        ▼                         │                     │
  ┌──────────────┐                │                     │
  │WELDING_CHECK │                │                     │
  └──────┬───────┘                │                     │
         │ No welding             │                     │
         ▼                        │                     │
  ┌─────────────┐                 │                     │
  │SESSION_STOP │─────────────────┴─────────────────────┘
  └─────────────┘
```

### 2.4 Fault Handling

```
Fault Classification:

typedef enum {
    FAULT_CLASS_NONE,
    FAULT_CLASS_WARNING,    // Continue, log, notify
    FAULT_CLASS_DERATE,     // Reduce power
    FAULT_CLASS_STOP,       // Stop charging gracefully
    FAULT_CLASS_EMERGENCY   // Immediate shutdown
} FaultClass_t;

Fault Table:

│ Fault                │ Class      │ Action                    │
├──────────────────────┼────────────┼───────────────────────────┤
│ Over-temperature     │ Derate     │ Reduce power 50%          │
│ Critical temp        │ Stop       │ Ramp down, then stop      │
│ Over-current         │ Emergency  │ Immediate PWM disable     │
│ Over-voltage         │ Emergency  │ Immediate PWM disable     │
│ Ground fault         │ Emergency  │ Open contactor            │
│ Communication loss   │ Stop       │ Ramp down, wait 60s       │
│ Isolation fault      │ Stop       │ Don't start/stop if running│
│ Contactor failure    │ Emergency  │ Disable all outputs       │
│ Watchdog timeout     │ Emergency  │ Hardware reset            │

Fault Handler Code:

void Fault_Handler(FaultCode_t fault)
{
    FaultClass_t faultClass = Fault_GetClass(fault);

    // Log fault
    Logger_LogFault(fault, Get_Timestamp());

    switch (faultClass) {
        case FAULT_CLASS_WARNING:
            // Set warning flag, continue operation
            System_SetWarning(fault);
            break;

        case FAULT_CLASS_DERATE:
            // Reduce power limit
            PowerLimit_Set(PowerLimit_Get() * 0.5f);
            System_SetWarning(fault);
            break;

        case FAULT_CLASS_STOP:
            // Graceful shutdown sequence
            Charging_RequestStop(STOP_REASON_FAULT);
            System_SetFault(fault);
            break;

        case FAULT_CLASS_EMERGENCY:
            // Immediate shutdown (hardware level)
            PWM_DisableAll();
            Contactor_Open(CONTACTOR_ALL);
            System_SetEmergency(fault);
            // Safety MCU will take over
            break;
    }

    // Notify upper layers
    if (faultClass >= FAULT_CLASS_STOP) {
        OCPP_SendStatusNotification(CONNECTOR_ID,
            STATUS_FAULTED,
            Fault_GetErrorCode(fault));
    }
}
```

## 3. ISO 15118 Implementation

### 3.1 Open Source Stack-ovi

```
Dostupni ISO 15118 Stack-ovi:

1. Josev (Open Source):
   ┌─────────────────────────────────────────────────┐
   │ github.com/SwitchEV/josev                       │
   │                                                 │
   │ - Python-based SECC/EVCC                        │
   │ - ISO 15118-2, ISO 15118-20                     │
   │ - Aktivno održavan                              │
   │ - Dobra dokumentacija                           │
   │ - Koristi se sa I2SE PLC modulima               │
   │                                                 │
   │ Ograničenja:                                    │
   │ - Python (potreban Linux SBC)                   │
   │ - Nije za embedded MCU direktno                 │
   └─────────────────────────────────────────────────┘

2. OpenV2G (Siemens, stariji):
   ┌─────────────────────────────────────────────────┐
   │ github.com/siemens/OpenV2G                      │
   │                                                 │
   │ - C implementacija                              │
   │ - EXI codec                                     │
   │ - ISO 15118-2, DIN 70121                        │
   │ - Zastareo, ograničena podrška                  │
   └─────────────────────────────────────────────────┘

3. Chargebyte (Komercijalni):
   ┌─────────────────────────────────────────────────┐
   │ chargebyte.com                                  │
   │                                                 │
   │ - Turnkey rešenje (HW + SW)                     │
   │ - ISO 15118-2, -20, DIN 70121                   │
   │ - Certified stack                               │
   │ - Technical support                             │
   │ - Cena: €5,000-20,000 license                   │
   └─────────────────────────────────────────────────┘

4. Switch EV (Komercijalni):
   ┌─────────────────────────────────────────────────┐
   │ switch-ev.com                                   │
   │                                                 │
   │ - Baziran na Josev                              │
   │ - Production ready                              │
   │ - V2G podržan                                   │
   │ - Cloud services                                │
   └─────────────────────────────────────────────────┘

5. Vector CANoe (Testiranje):
   ┌─────────────────────────────────────────────────┐
   │ Testing i simulacija                            │
   │ - EVCC/SECC simulation                          │
   │ - Conformance testing                           │
   │ - ~€15,000+                                     │
   └─────────────────────────────────────────────────┘
```

### 3.2 EXI Encoding

```
EXI (Efficient XML Interchange):

XML:
<ChargeParameterDiscoveryReq>
  <DC_EVChargeParameter>
    <EVMaximumCurrentLimit>200</EVMaximumCurrentLimit>
    <EVMaximumVoltageLimit>850</EVMaximumVoltageLimit>
  </DC_EVChargeParameter>
</ChargeParameterDiscoveryReq>

EXI encoded: ~50-70% smaller than XML

Libraries:
1. OpenEXI (Java)
2. Exificient (Java, C)
3. libcbor (C) - alternative binary format

Code Example (using EXIficient binding):

// Encode ChargeParameterDiscoveryReq
EXIStream stream;
EXI_initStream(&stream, buffer, BUFFER_SIZE);

EXI_startDocument(&stream);
EXI_startElement(&stream, "ChargeParameterDiscoveryReq");
  EXI_startElement(&stream, "DC_EVChargeParameter");
    EXI_addElement(&stream, "EVMaximumCurrentLimit", "200");
    EXI_addElement(&stream, "EVMaximumVoltageLimit", "850");
  EXI_endElement(&stream);
EXI_endElement(&stream);
EXI_endDocument(&stream);

size_t encodedSize = EXI_getEncodedSize(&stream);
// encodedSize << strlen(xmlString)
```

### 3.3 SLAC Implementation

```
SLAC (Signal Level Attenuation Characterization):

Purpose: Match EVSE and EV over PLC

SLAC Flow:
1. EV sends CM_SLAC_PARM.REQ (broadcast)
2. EVSE responds with CM_SLAC_PARM.CNF
3. EV starts attenuation measurement
4. EV sends sounds (CM_START_ATTEN_CHAR.IND)
5. EVSE measures signal levels
6. EVSE sends CM_ATTEN_CHAR.RSP with results
7. EV validates matching EVSE
8. EV sends CM_SLAC_MATCH.REQ
9. EVSE confirms with CM_SLAC_MATCH.CNF
10. PLC link established with NMK/NID

QCA7000 SLAC Configuration:

// Initialize SLAC module
slac_config_t config = {
    .run_id = generate_random_id(),
    .forwarding_sta = MAC_ADDR_BROADCAST,
    .application_type = SLAC_APP_EV_CHARGE,
    .security_type = SLAC_SECURE_NO_SECURITY,
    .resp_type = SLAC_RESP_MATCHING,
};

slac_init(&config);

// Start SLAC (EVSE side - wait for EV)
slac_evse_start();

// Callback when matched
void slac_match_callback(slac_match_info_t *info)
{
    // Store NMK, NID for communication
    memcpy(&network_key, &info->nmk, 16);
    memcpy(&network_id, &info->nid, 7);

    // Proceed to SDP
    sdp_start();
}
```

## 4. OCPP Implementation

### 4.1 OCPP Client Architecture

```
OCPP Client na MCU/SBC:

┌─────────────────────────────────────────────────────────────────┐
│                    OCPP CLIENT                                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               Application Layer                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │  Charging   │  │   Meter     │  │   Remote    │      │   │
│  │  │  Session    │  │  Reporting  │  │   Control   │      │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │   │
│  │         │                │                │              │   │
│  │         └────────────────┼────────────────┘              │   │
│  │                          │                               │   │
│  │  ┌───────────────────────┴─────────────────────────┐    │   │
│  │  │              OCPP Message Handler               │    │   │
│  │  │  - Request/Response matching                    │    │   │
│  │  │  - Timeout handling                             │    │   │
│  │  │  - Queue management                             │    │   │
│  │  └───────────────────────┬─────────────────────────┘    │   │
│  │                          │                               │   │
│  │  ┌───────────────────────┴─────────────────────────┐    │   │
│  │  │              JSON Serializer                     │    │   │
│  │  │  - JSON encode/decode                           │    │   │
│  │  │  - Schema validation                            │    │   │
│  │  └───────────────────────┬─────────────────────────┘    │   │
│  │                          │                               │   │
│  │  ┌───────────────────────┴─────────────────────────┐    │   │
│  │  │              WebSocket Client                    │    │   │
│  │  │  - Connection management                        │    │   │
│  │  │  - Reconnection logic                           │    │   │
│  │  │  - Ping/Pong keepalive                          │    │   │
│  │  └───────────────────────┬─────────────────────────┘    │   │
│  │                          │                               │   │
│  │  ┌───────────────────────┴─────────────────────────┐    │   │
│  │  │              TLS Layer                           │    │   │
│  │  │  - mbedTLS / wolfSSL                            │    │   │
│  │  │  - Certificate management                        │    │   │
│  │  └───────────────────────┬─────────────────────────┘    │   │
│  │                          │                               │   │
│  └──────────────────────────┼──────────────────────────────┘   │
│                             │                                   │
│                       TCP/IP Stack                              │
│                       (lwIP / native)                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 OCPP Message Handler

```
OCPP Message Processing:

// Message types
#define OCPP_CALL          2
#define OCPP_CALL_RESULT   3
#define OCPP_CALL_ERROR    4

// Message structure
typedef struct {
    uint8_t messageType;
    char uniqueId[37];  // UUID
    char action[32];
    cJSON *payload;
} OcppMessage_t;

// Request handler registration
typedef void (*OcppHandler_t)(const char *uniqueId, cJSON *payload);

typedef struct {
    const char *action;
    OcppHandler_t handler;
} OcppHandlerEntry_t;

OcppHandlerEntry_t handlers[] = {
    {"ChangeAvailability", handle_ChangeAvailability},
    {"ChangeConfiguration", handle_ChangeConfiguration},
    {"RemoteStartTransaction", handle_RemoteStartTransaction},
    {"RemoteStopTransaction", handle_RemoteStopTransaction},
    {"Reset", handle_Reset},
    {"UnlockConnector", handle_UnlockConnector},
    {"GetConfiguration", handle_GetConfiguration},
    {"SetChargingProfile", handle_SetChargingProfile},
    {"TriggerMessage", handle_TriggerMessage},
    {NULL, NULL}
};

// Main message dispatcher
void ocpp_dispatch(const char *message)
{
    OcppMessage_t msg;

    if (ocpp_parse_message(message, &msg) != OCPP_OK) {
        return;
    }

    switch (msg.messageType) {
        case OCPP_CALL:
            for (int i = 0; handlers[i].action != NULL; i++) {
                if (strcmp(handlers[i].action, msg.action) == 0) {
                    handlers[i].handler(msg.uniqueId, msg.payload);
                    return;
                }
            }
            // Unknown action
            ocpp_send_error(msg.uniqueId,
                "NotImplemented",
                "Action not supported");
            break;

        case OCPP_CALL_RESULT:
            ocpp_handle_response(msg.uniqueId, msg.payload);
            break;

        case OCPP_CALL_ERROR:
            ocpp_handle_error(msg.uniqueId, msg.payload);
            break;
    }
}
```

### 4.3 Offline Behavior

```
Offline Charging Support:

1. Local Authorization List:
   - Predefinisani tokeni u flash memoriji
   - OCPP: SendLocalList, GetLocalListVersion

2. Authorization Cache:
   - Keširani tokeni sa CSMS-a
   - Timeout-based expiry

3. Offline Transactions:
   - Čuvanje transakcija u lokalnoj memoriji
   - Sinhronizacija kada se veza uspostavi

// Transaction storage structure
typedef struct {
    uint32_t transactionId;     // Local ID
    char idTag[21];
    uint32_t startTime;
    uint32_t stopTime;
    float meterStart;
    float meterStop;
    StopReason_t stopReason;
    bool synced;
} OfflineTransaction_t;

#define MAX_OFFLINE_TRANSACTIONS 100

// NV storage
void save_offline_transaction(OfflineTransaction_t *tx)
{
    // Write to external flash / EEPROM
    uint32_t addr = OFFLINE_TX_BASE + (tx_index * sizeof(OfflineTransaction_t));
    flash_write(addr, tx, sizeof(OfflineTransaction_t));
    tx_index = (tx_index + 1) % MAX_OFFLINE_TRANSACTIONS;
}

// Sync when online
void sync_offline_transactions(void)
{
    for (int i = 0; i < MAX_OFFLINE_TRANSACTIONS; i++) {
        OfflineTransaction_t tx;
        flash_read(OFFLINE_TX_BASE + (i * sizeof(tx)), &tx, sizeof(tx));

        if (tx.transactionId != 0 && !tx.synced) {
            // Send StartTransaction
            ocpp_send_start_transaction(&tx);
            // Send StopTransaction
            ocpp_send_stop_transaction(&tx);
            // Mark as synced
            tx.synced = true;
            save_offline_transaction(&tx);
        }
    }
}
```

## 5. HMI Software

### 5.1 Display Options

```
HMI Opcije:

1. Embedded LCD + Qt/LVGL:
   ┌─────────────────────────────────────────────────────────────┐
   │ Hardware: 7-10" LCD + Touch                                 │
   │ Processor: STM32MP1 / i.MX6 / Raspberry Pi                  │
   │ GUI: Qt Quick / LVGL                                        │
   │                                                             │
   │ Pros: Full control, responsive                              │
   │ Cons: More development effort                               │
   │ Cost: €100-200 (display + SBC)                              │
   └─────────────────────────────────────────────────────────────┘

2. Industrial HMI Panel:
   ┌─────────────────────────────────────────────────────────────┐
   │ Hardware: Siemens/Weintek/Beijer panel                      │
   │ Protocol: Modbus TCP/RTU to charger controller              │
   │                                                             │
   │ Pros: Rugged, easy development                              │
   │ Cons: Limited flexibility, higher cost                      │
   │ Cost: €300-800                                              │
   └─────────────────────────────────────────────────────────────┘

3. Web-based HMI:
   ┌─────────────────────────────────────────────────────────────┐
   │ Hardware: Any browser-capable display                       │
   │ Software: HTML5 + WebSocket to controller                   │
   │                                                             │
   │ Pros: Easy updates, responsive design                       │
   │ Cons: Requires browser, boot time                           │
   │ Cost: €50-150 (tablet/panel PC)                             │
   └─────────────────────────────────────────────────────────────┘

LVGL (Light and Versatile Graphics Library):

// Example LVGL screen for charging status
void create_charging_screen(void)
{
    lv_obj_t *screen = lv_obj_create(NULL);

    // SOC Arc meter
    lv_obj_t *arc = lv_arc_create(screen);
    lv_arc_set_range(arc, 0, 100);
    lv_arc_set_value(arc, current_soc);
    lv_obj_set_size(arc, 200, 200);
    lv_obj_center(arc);

    // SOC label
    lv_obj_t *soc_label = lv_label_create(arc);
    lv_label_set_text_fmt(soc_label, "%d%%", current_soc);
    lv_obj_center(soc_label);

    // Power label
    lv_obj_t *power_label = lv_label_create(screen);
    lv_label_set_text_fmt(power_label, "%.1f kW", current_power);
    lv_obj_align(power_label, LV_ALIGN_BOTTOM_MID, 0, -50);

    // Time remaining
    lv_obj_t *time_label = lv_label_create(screen);
    lv_label_set_text_fmt(time_label, "%d min remaining", time_remaining);
    lv_obj_align(time_label, LV_ALIGN_BOTTOM_MID, 0, -20);

    lv_scr_load(screen);
}
```

### 5.2 Screen Flow

```
HMI Screen Flow:

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌──────────┐     Connector      ┌──────────────────────┐     │
│   │  IDLE    │────inserted───────►│  CONNECT VEHICLE    │     │
│   │ "Ready"  │                    │  "Please plug in EV" │     │
│   └──────────┘                    └──────────┬───────────┘     │
│        ▲                                     │                  │
│        │                           Vehicle detected             │
│        │                                     ▼                  │
│        │                         ┌──────────────────────┐       │
│        │                         │  AUTHENTICATION     │       │
│        │                         │  "Present RFID card"│       │
│        │                         │  or "Use app"       │       │
│        │                         └──────────┬───────────┘       │
│        │                                    │                   │
│        │                          Auth success                  │
│        │                                    ▼                   │
│        │                         ┌──────────────────────┐       │
│        │                         │  PREPARING          │       │
│        │                         │  "Preparing charge" │       │
│        │                         │  [Progress bar]     │       │
│        │                         └──────────┬───────────┘       │
│        │                                    │                   │
│        │                          Pre-charge complete           │
│        │                                    ▼                   │
│        │                         ┌──────────────────────┐       │
│        │                         │  CHARGING           │       │
│        │                         │  SOC: 45%           │       │
│        │                         │  Power: 150 kW      │       │
│        │                         │  Time: 25 min       │       │
│        │                         │  [STOP button]      │       │
│        │                         └──────────┬───────────┘       │
│        │                                    │                   │
│        │                      Stop pressed / SOC reached        │
│        │                                    ▼                   │
│        │                         ┌──────────────────────┐       │
│        │                         │  FINISHING          │       │
│        │                         │  "Charging complete"│       │
│        │                         │  Energy: 45.2 kWh   │       │
│        │                         │  Cost: €15.50       │       │
│        │                         └──────────┬───────────┘       │
│        │                                    │                   │
│        │                        Connector unplugged             │
│        └────────────────────────────────────┘                   │
│                                                                 │
│   Error at any point:                                           │
│   ┌──────────────────────┐                                      │
│   │  ERROR               │                                      │
│   │  [Error code]        │──────► Contact support              │
│   │  [Description]       │                                      │
│   └──────────────────────┘                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 6. OTA Updates

### 6.1 Firmware Update Architecture

```
OTA Update Flow:

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Cloud                    Charger                               │
│  ┌─────┐                 ┌─────────────────────────────────┐   │
│  │CSMS │                 │ ┌───────────┐  ┌───────────┐    │   │
│  │     │──UpdateFirmware─│►│ Download  │─►│ Verify    │    │   │
│  │     │  (OCPP)         │ │ Manager   │  │ Signature │    │   │
│  └─────┘                 │ └─────┬─────┘  └─────┬─────┘    │   │
│     ▲                    │       │              │           │   │
│     │                    │       ▼              ▼           │   │
│     │                    │ ┌─────────────────────────┐      │   │
│     │                    │ │    Dual Bank Flash     │      │   │
│     │                    │ │  ┌─────┐    ┌─────┐    │      │   │
│     │                    │ │  │Bank │    │Bank │    │      │   │
│     │                    │ │  │ A   │    │ B   │    │      │   │
│     │                    │ │  │(run)│    │(new)│    │      │   │
│     │                    │ │  └─────┘    └─────┘    │      │   │
│     │                    │ └───────────┬────────────┘      │   │
│     │                    │             │                    │   │
│     │                    │             ▼                    │   │
│     │                    │      ┌─────────────┐            │   │
│     │◄─FirmwareStatus────│──────│ Bootloader  │            │   │
│                          │      │ (validates) │            │   │
│                          │      └─────────────┘            │   │
│                          └─────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Dual-Bank Update Process:

1. Download new firmware to inactive bank
2. Verify signature (RSA/ECDSA)
3. Set boot flag to new bank
4. Reboot
5. Bootloader validates new image
6. If valid, boot new image
7. Mark as successful after 5 min operation
8. If fails, rollback to old bank
```

### 6.2 Secure Boot

```
Secure Boot Chain:

┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌────────────────┐                                          │
│  │  ROM Bootloader │  Hardcoded in silicon                  │
│  │  (immutable)    │  Contains root public key hash         │
│  └───────┬────────┘                                          │
│          │ Verifies signature                                │
│          ▼                                                   │
│  ┌────────────────┐                                          │
│  │  1st Stage     │  Signed with OEM private key            │
│  │  Bootloader    │  Contains app public key                │
│  └───────┬────────┘                                          │
│          │ Verifies signature                                │
│          ▼                                                   │
│  ┌────────────────┐                                          │
│  │  Application   │  Signed with app private key            │
│  │  Firmware      │  Version control, rollback protection   │
│  └────────────────┘                                          │
│                                                              │
│  Key Storage:                                                │
│  - Root key: OTP fuses in MCU                               │
│  - OEM key: Protected flash region                          │
│  - App key: Updateable, but signed by OEM key               │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Example: STM32 Secure Boot (SBSFU)

// Signature verification
bool verify_firmware_signature(const uint8_t *fw_data, size_t fw_size)
{
    // Load public key
    mbedtls_pk_context pk;
    mbedtls_pk_init(&pk);
    mbedtls_pk_parse_public_key(&pk, public_key_pem, sizeof(public_key_pem));

    // Calculate hash of firmware
    uint8_t hash[32];
    mbedtls_sha256(fw_data, fw_size, hash, 0);

    // Verify signature (last 256 bytes of image)
    const uint8_t *signature = fw_data + fw_size - 256;
    int ret = mbedtls_pk_verify(&pk, MBEDTLS_MD_SHA256,
                                 hash, sizeof(hash),
                                 signature, 256);

    mbedtls_pk_free(&pk);
    return (ret == 0);
}
```

## 7. Testing i Validation

### 7.1 Unit Testing

```
Unit Testing sa Unity/CMock:

// test_current_control.c
#include "unity.h"
#include "mock_adc.h"
#include "mock_pwm.h"
#include "current_control.h"

void setUp(void) {
    CurrentControl_Init();
}

void tearDown(void) {
    // Cleanup
}

void test_PI_controller_zero_error(void) {
    // Zero error should produce zero output
    PI_State_t pi = {.kp = 1.0, .ki = 0.1, .integral = 0};
    float output = PI_Run(&pi, 0.0f);
    TEST_ASSERT_FLOAT_WITHIN(0.001, 0.0, output);
}

void test_current_setpoint_limiting(void) {
    // Setpoint should be limited to max value
    CurrentControl_SetSetpoint(500.0f);  // Above max
    TEST_ASSERT_FLOAT_WITHIN(0.1, MAX_CURRENT, CurrentControl_GetSetpoint());
}

void test_overcurrent_fault(void) {
    // Mock ADC to return overcurrent
    ADC_Read_ExpectAndReturn(ADC_CURRENT, 4000);  // Overcurrent value

    CurrentControl_Update();

    TEST_ASSERT_TRUE(Fault_IsActive(FAULT_OVERCURRENT));
}

// Run tests
int main(void) {
    UNITY_BEGIN();
    RUN_TEST(test_PI_controller_zero_error);
    RUN_TEST(test_current_setpoint_limiting);
    RUN_TEST(test_overcurrent_fault);
    return UNITY_END();
}
```

### 7.2 Hardware-in-the-Loop (HIL)

```
HIL Testing Setup:

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌───────────────┐         ┌───────────────┐                  │
│   │  Real-Time    │◄───────►│   Charger     │                  │
│   │  Simulator    │  Analog │   Controller  │                  │
│   │  (dSPACE/OPAL)│  + CAN  │   (DUT)       │                  │
│   └───────┬───────┘         └───────────────┘                  │
│           │                                                     │
│           │ Ethernet                                            │
│           ▼                                                     │
│   ┌───────────────┐                                            │
│   │  Test         │                                            │
│   │  Automation   │                                            │
│   │  PC           │                                            │
│   └───────────────┘                                            │
│                                                                 │
│   Simulated Signals:                                            │
│   - Grid voltage/current                                        │
│   - DC output voltage/current                                   │
│   - Temperature sensors                                         │
│   - Vehicle CAN messages                                        │
│   - Fault injection                                             │
│                                                                 │
│   Monitored Signals:                                            │
│   - PWM outputs                                                 │
│   - Gate drive signals                                          │
│   - Contactor commands                                          │
│   - Communication messages                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Test Scenarios:

1. Normal charging cycle
2. Vehicle disconnect during charging
3. Grid fault (sag, surge, interruption)
4. Overcurrent/overvoltage conditions
5. Temperature limits
6. Communication loss
7. Emergency stop
8. Contactor welding detection
```

### 7.3 Conformance Testing

```
Potrebni Conformance Testovi:

1. ISO 15118 Conformance:
   ┌─────────────────────────────────────────────────────────┐
   │ Test system: Vector CANoe / Keysight                    │
   │                                                         │
   │ Test cases (ISO 15118-4/5):                            │
   │ - SLAC protocol                                         │
   │ - SDP (Service Discovery Protocol)                      │
   │ - V2G message exchange                                  │
   │ - TLS handling                                          │
   │ - Certificate management                                │
   │ - Error handling                                        │
   │                                                         │
   │ Result: Conformance certificate                         │
   └─────────────────────────────────────────────────────────┘

2. OCPP Conformance:
   ┌─────────────────────────────────────────────────────────┐
   │ Test: OCA OCPP Compliance Test Tool                     │
   │                                                         │
   │ Profiles tested:                                        │
   │ - Core                                                  │
   │ - FirmwareManagement                                    │
   │ - LocalAuthListManagement                               │
   │ - SmartCharging                                         │
   │ - Security (OCPP 2.0)                                   │
   │                                                         │
   │ Result: OCA certification                               │
   └─────────────────────────────────────────────────────────┘

3. CHAdeMO Certification:
   ┌─────────────────────────────────────────────────────────┐
   │ Test by: CHAdeMO Association certified lab              │
   │                                                         │
   │ Test protocol version: 0.9, 1.0, 2.0                   │
   │ Items: CAN communication, timing, safety               │
   │                                                         │
   │ Result: CHAdeMO certification number                    │
   └─────────────────────────────────────────────────────────┘
```

## 8. Development Tools

```
Preporučeni Development Stack:

IDE & Toolchain:
├── Power Control (C2000): Code Composer Studio
├── System Control (STM32): STM32CubeIDE
├── Linux SBC: VS Code + GCC/Clang
└── FPGA: Quartus / Vivado

Version Control:
├── Git (obavezno)
├── GitHub/GitLab za CI/CD
└── Branching: GitFlow ili Trunk-based

Build System:
├── CMake za cross-platform
├── Make za embedded
└── Ninja za brže buildove

CI/CD:
├── GitHub Actions / GitLab CI
├── Automated testing na commit
├── Static analysis (PC-lint, Coverity)
└── Automated deployment

Documentation:
├── Doxygen za API docs
├── Markdown za user docs
└── PlantUML za dijagrame

Debugging:
├── JTAG/SWD (Segger J-Link, ST-Link)
├── Logic analyzer (Saleae)
├── CAN analyzer (PCAN, Vector)
└── Oscilloscope sa decode
```

## 9. Bill of Materials - Softver

```
Software Costs Estimation:

┌─────────────────────────────────────────────────────────────────┐
│ Stavka                           │ Cena         │ Napomena      │
├──────────────────────────────────┼──────────────┼───────────────┤
│ ISO 15118 Stack License          │ €5,000-20,000│ Jednom        │
│ (komercijalni, npr Chargebyte)   │              │               │
├──────────────────────────────────┼──────────────┼───────────────┤
│ Alternative: Josev (open source) │ €0           │ Dev effort    │
│ + I2SE hardware                  │ €100/unit    │ Per unit      │
├──────────────────────────────────┼──────────────┼───────────────┤
│ OCPP Stack (open source)         │ €0           │ Dev effort    │
├──────────────────────────────────┼──────────────┼───────────────┤
│ RTOS (FreeRTOS)                  │ €0           │ Open source   │
├──────────────────────────────────┼──────────────┼───────────────┤
│ GUI Framework (LVGL)             │ €0           │ Open source   │
├──────────────────────────────────┼──────────────┼───────────────┤
│ TLS Library (mbedTLS)            │ €0           │ Open source   │
├──────────────────────────────────┼──────────────┼───────────────┤
│ IDE/Toolchain                    │ €0-2,000     │ Per seat/year │
├──────────────────────────────────┼──────────────┼───────────────┤
│ Test Tools (Vector CANoe)        │ €15,000+     │ Per seat      │
├──────────────────────────────────┼──────────────┼───────────────┤
│ Conformance Certification        │ €10,000-30,000│ Per product  │
└─────────────────────────────────────────────────────────────────┘

Development Effort Estimation:

│ Module                    │ Effort (person-months) │
├───────────────────────────┼────────────────────────┤
│ Power control firmware    │ 6-12                   │
│ Safety controller         │ 3-6                    │
│ ISO 15118 integration     │ 3-6                    │
│ OCPP client               │ 2-4                    │
│ HMI development           │ 2-4                    │
│ System integration        │ 3-6                    │
│ Testing & validation      │ 3-6                    │
├───────────────────────────┼────────────────────────┤
│ TOTAL                     │ 22-44 person-months    │
└───────────────────────────────────────────────────-┘
```
