# JEZGRO-BAT: Firmware za Upravljanje Baterijama

**Verzija:** 1.0
**Datum:** 2026-01-04
**Status:** SPECIFIKACIJA

---

## Svrha Dokumenta

Ovaj dokument specificira **JEZGRO-BAT**, varijantu JEZGRO mikrokernela za BMS kontrolere EK-BAT baterijskih modula. JEZGRO-BAT pruža tolerantno na greške monitoring ćelija, balansiranje i swarm koordinaciju za EK-BAT-25/50/100 familiju baterija.

---

## 1. Pregled

### 1.1 BMS Zahtevi

EK-BAT baterijski moduli zahtevaju sofisticirano upravljanje baterijom:

| Zahtev | Specifikacija |
|--------|---------------|
| Broj ćelija | 96-224 ćelija (zavisno od veličine modula) |
| Monitoring napona | ±2 mV tačnost |
| Monitoring temperature | ±1°C tačnost, 8-16 senzora po modulu |
| Balansiranje | Pasivno (100mA) + Aktivno (opciono, 1A) |
| SOC tačnost | ±3% preko punog opsega |
| SOH praćenje | Degradacija kapaciteta, rast impedanse |
| Komunikacija | CAN-FD @ 5 Mbps ka vozilu i punjaču |
| Bezbednost | Hardverski OVP/UVP, detekcija thermal runaway |

### 1.2 Zašto JEZGRO za BMS?

Tradicionalni BMS firmware je monolitan - jedan kvar može onesposobiti celu bateriju. JEZGRO-BAT pruža:

```
┌─────────────────────────────────────────────────────────────────┐
│                    JEZGRO-BAT PREDNOSTI                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   TRADICIONALNI BMS            JEZGRO-BAT                       │
│   ─────────────────            ──────────                        │
│   ┌─────────────────┐         ┌─────────────────┐               │
│   │ Monolitni       │         │ Izolovani Servisi│              │
│   │ Firmware        │         │ ┌─────┐ ┌─────┐ │               │
│   │                 │         │ │CELL │ │BAL  │ │               │
│   │ Jedan bug =     │         │ │MON  │ │     │ │               │
│   │ Totalni kvar    │         │ └──┬──┘ └──┬──┘ │               │
│   │                 │         │    │       │    │               │
│   └────────┬────────┘         │ ┌──┴───────┴──┐ │               │
│            │                  │ │   KERNEL    │ │               │
│            ▼                  │ │ (restartuje │ │               │
│      Baterija offline         │ │  neuspele   │ │               │
│      Vozilo zaglavljeno       │ │  servise)   │ │               │
│                               │ └─────────────┘ │               │
│                               │                 │               │
│                               │ Jedan bug =     │               │
│                               │ Restart servisa │               │
│                               │ Baterija online │               │
│                               └─────────────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| Prednost | Opis |
|----------|------|
| **Izolacija Grešaka** | Pad cell monitoringa ne utiče na balansiranje |
| **Automatski Oporavak** | Neuspeli servis se restartuje za <50ms |
| **Konzistentan API** | Isti razvojni model kao EK3, rack kontroler |
| **Swarm Ready** | Multi-baterijska koordinacija ugrađena |
| **OTA Ažuriranja** | Ažuriranje pojedinačnih servisa bez punog reflash-a |

### 1.3 Ciljni Hardver

| Parametar | EK-BAT-25 | EK-BAT-50 | EK-BAT-100 |
|-----------|-----------|-----------|------------|
| Kapacitet | 25 kWh | 50 kWh | 100 kWh |
| Napon | 400V (350-450V) | 400V (350-450V) | 800V (700-900V) |
| Konfiguracija ćelija | 96S (LFP) | 128S (LFP) | 224S (LFP) |
| MCU | STM32G474 | STM32G474 | STM32G474 |
| AFE | BQ76952 ×2 | BQ76952 ×3 | BQ76952 ×5 |

---

## 2. Arhitektura

### 2.1 Konfiguracija Servisa

| ID | Servis | Prioritet | Stack | Memory | Watchdog | Svrha |
|----|--------|-----------|-------|--------|----------|-------|
| 0 | KERNEL | - | 2 KB | 8 KB | - | Jezgro (privilegovano) |
| 1 | CELL_MONITOR | CRITICAL | 2 KB | 16 KB | 50 ms | Čitanje napona/temp ćelija |
| 2 | BALANCING | HIGH | 2 KB | 8 KB | 200 ms | Kontrola balansiranja |
| 3 | SOC_SOH | MEDIUM | 4 KB | 16 KB | 500 ms | Procena stanja |
| 4 | THERMAL_MGR | MEDIUM | 2 KB | 8 KB | 500 ms | Kontrola hlađenja |
| 5 | ROJ_COORD | MEDIUM | 4 KB | 16 KB | 1000 ms | Multi-bat koordinacija |
| 6 | CAN_HANDLER | HIGH | 2 KB | 8 KB | 100 ms | Vozilo/punjač komun. |
| 7 | AUDIT_LOGGER | LOW | 4 KB | 16 KB | 2000 ms | Event logging |

**Ukupni RAM:** ~86 KB od 128 KB dostupno

### 2.2 Memory Map

```
┌─────────────────────────────────────────────────┐  0x2001FFFF (128 KB)
│                                                 │
│        AUDIT_LOGGER Memory (16 KB)              │
│        (ring buffer, flash queue)               │
├─────────────────────────────────────────────────┤  0x2001C000
│        ROJ_COORD Memory (16 KB)               │
│        (peer tabela, election stanje)           │
├─────────────────────────────────────────────────┤  0x20018000
│        SOC_SOH Memory (16 KB)                   │
│        (Kalman stanje, history buffer)          │
├─────────────────────────────────────────────────┤  0x20014000
│        CELL_MONITOR Memory (16 KB)              │
│        (nizovi podataka ćelija, kalibracija)    │
├─────────────────────────────────────────────────┤  0x20010000
│        Ostali Servisi (24 KB)                   │
│        (BALANCING, THERMAL, CAN_HANDLER)        │
├─────────────────────────────────────────────────┤  0x2000A000
│        IPC Message Pool (16 KB)                 │
│        256 poruka × 64 bajta                    │
├─────────────────────────────────────────────────┤  0x20006000
│        Service Stack-ovi (16 KB)                │
│        (2 KB × 8 servisa)                       │
├─────────────────────────────────────────────────┤  0x20002000
│        Kernel Podaci + Stack (8 KB)             │
└─────────────────────────────────────────────────┘  0x20000000
```

### 2.3 Hardverski Interfejs

```
┌─────────────────────────────────────────────────────────────────┐
│                    JEZGRO-BAT HARDVER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                   STM32G474 MCU                          │   │
│   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │   │
│   │  │  SPI1   │ │  I2C1   │ │ CAN-FD  │ │  ADC    │        │   │
│   │  │ (AFE)   │ │ (Temp)  │ │ (Komun) │ │ (Struja)│        │   │
│   │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘        │   │
│   └───────┼───────────┼───────────┼───────────┼─────────────┘   │
│           │           │           │           │                  │
│           ▼           ▼           ▼           ▼                  │
│   ┌───────────┐ ┌───────────┐ ┌───────┐ ┌───────────┐           │
│   │ BQ76952   │ │ NTC/PT100 │ │Vozilo │ │ Hall/Shunt│           │
│   │ AFE ×2-5  │ │ Senzori   │ │Punjač │ │ Senzor    │           │
│   │ (isoSPI)  │ │ (8-16)    │ │       │ │ Struje    │           │
│   └───────────┘ └───────────┘ └───────┘ └───────────┘           │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    BATERIJSKE ĆELIJE                     │   │
│   │   ┌───┬───┬───┬───┬───┬───┬───┬───┐                     │   │
│   │   │ 1 │ 2 │ 3 │...│...│...│...│ N │  96-224 ćelija      │   │
│   │   └───┴───┴───┴───┴───┴───┴───┴───┘                     │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Cell Monitoring Servis

### 3.1 Definicija Servisa

```c
JEZGRO_SERVICE_DEFINE(cell_monitor,
    .priority = JEZGRO_PRIORITY_CRITICAL,
    .stack_size = 2048,
    .memory_size = 16384,
    .watchdog_ms = 50
);

void cell_monitor_main(void) {
    cell_data_t cells[MAX_CELLS];

    // Inicijalizacija AFE lanca
    afe_init_chain();

    while (1) {
        jezgro_watchdog_feed();

        // Čitanje svih napona ćelija (10-20ms)
        afe_read_all_voltages(cells);

        // Čitanje temperatura ćelija
        afe_read_all_temperatures(cells);

        // Provera limita
        for (int i = 0; i < cell_count; i++) {
            if (cells[i].voltage > OVP_THRESHOLD ||
                cells[i].voltage < UVP_THRESHOLD) {
                // Slanje poruke o grešci
                jezgro_msg_t msg = {
                    .type = MSG_CELL_FAULT,
                    .payload.cell_id = i,
                    .payload.voltage = cells[i].voltage
                };
                jezgro_send(SVC_SAFETY, &msg);
            }
        }

        // Publikovanje podataka ćelija za druge servise
        publish_cell_data(cells);

        jezgro_sleep(20);  // 50 Hz update rate
    }
}
```

### 3.2 AFE Interfejs (BQ76952)

BQ76952 AFE nadgleda do 16 ćelija. Više AFE-ova se povezuje u lanac preko isoSPI:

```
┌─────────────────────────────────────────────────────────────────┐
│                    AFE DAISY CHAIN (EK-BAT-50)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   STM32G474                                                      │
│   ┌───────┐                                                      │
│   │ SPI1  │───────────────┐                                     │
│   └───────┘               │                                     │
│                           ▼                                     │
│                    ┌─────────────┐                              │
│                    │  BQ76952 #1 │ Ćelije 1-16                  │
│                    │  (Master)   │                              │
│                    └──────┬──────┘                              │
│                           │ isoSPI                              │
│                    ┌──────▼──────┐                              │
│                    │  BQ76952 #2 │ Ćelije 17-32                 │
│                    └──────┬──────┘                              │
│                           │ isoSPI                              │
│                    ┌──────▼──────┐                              │
│                    │  BQ76952 #3 │ Ćelije 33-48 (+ preostale)   │
│                    └─────────────┘                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Strukture Podataka

```c
typedef struct {
    uint16_t voltage_mv;      // Napon ćelije u mV (2000-4200)
    int8_t   temperature_c;   // Temperatura ćelije u °C (-40 do +85)
    uint8_t  flags;           // OVP, UVP, OTP, balansiranje aktivno
} cell_state_t;

typedef struct {
    uint8_t      module_id;
    uint8_t      cell_count;
    cell_state_t cells[MAX_CELLS];
    uint32_t     pack_voltage_mv;
    int32_t      pack_current_ma;
    uint32_t     timestamp;
} cell_data_t;
```

### 3.4 Detekcija Grešaka

| Greška | Prag | Akcija |
|--------|------|--------|
| Prenapon ćelije | >3.65V (LFP) | Momentalni stop punjenja |
| Podnapon ćelije | <2.5V (LFP) | Momentalni stop pražnjenja |
| Pregrevanje ćelije | >55°C | Derate, zatim stop |
| Pothlađenje ćelije | <-20°C | Onemogući punjenje |
| Delta napon | >100mV | Označi za balansiranje |
| Gubitak komunikacije | >100ms | Koristi poslednje poznato + flag |

---

## 4. Balancing Servis

### 4.1 Definicija Servisa

```c
JEZGRO_SERVICE_DEFINE(balancing,
    .priority = JEZGRO_PRIORITY_HIGH,
    .stack_size = 2048,
    .memory_size = 8192,
    .watchdog_ms = 200
);

void balancing_main(void) {
    balance_state_t state;

    while (1) {
        jezgro_watchdog_feed();

        // Čekanje na podatke ćelija
        jezgro_msg_t msg;
        if (jezgro_receive(SVC_CELL_MONITOR, &msg, 100) == JEZGRO_OK) {
            cell_data_t* cells = msg.payload.cells;

            // Izračunaj ciljni napon (najniži + margina)
            uint16_t target = calculate_balance_target(cells);

            // Omogući balansiranje na visokim ćelijama
            for (int i = 0; i < cell_count; i++) {
                if (cells->cells[i].voltage_mv > target + BALANCE_HYSTERESIS) {
                    enable_balance(i);
                } else {
                    disable_balance(i);
                }
            }
        }

        // Provera termalnog limita
        if (get_max_temperature() > BALANCE_THERMAL_LIMIT) {
            disable_all_balancing();
        }
    }
}
```

### 4.2 Pasivno Balansiranje

Pasivno balansiranje disipira energiju sa visokih ćelija kroz otpornike:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PASIVNO BALANSIRANJE KOLO                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Ćelija N ──┬───────────────────────────────── Ćelija N+1      │
│              │                                                   │
│              │    ┌─────────┐                                   │
│              ├────┤  33Ω    ├────┐                              │
│              │    │ (1W)    │    │                              │
│              │    └─────────┘    │                              │
│              │                   │                              │
│              │    ┌─────────┐    │                              │
│              └────┤ MOSFET  ├────┘                              │
│                   │ (BQ76952│                                   │
│                   │ interni)│                                   │
│                   └────┬────┘                                   │
│                        │                                        │
│                   Kontrola od AFE                               │
│                                                                  │
│   Struja balansiranja: ~100mA @ 3.3V                            │
│   Disipacija snage: ~330mW po ćeliji                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| Parametar | Vrednost |
|-----------|----------|
| Otpornik balansiranja | 33Ω, 1W |
| Struja balansiranja | ~100mA |
| Max ćelija simultano | 8 (termalni limit) |
| Prag početka balansiranja | Vcell > Vmin + 50mV |
| Prag završetka balansiranja | Vcell < Vmin + 20mV |

### 4.3 Aktivno Balansiranje (Opciono)

Za brže balansiranje, aktivno balansiranje prenosi energiju između ćelija:

```
┌─────────────────────────────────────────────────────────────────┐
│                    AKTIVNO BALANSIRANJE (FLYBACK)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Visoka Ćelija ─┬──────┬──────────────────── Pack Bus          │
│                  │      │                                       │
│                  │   ┌──┴──┐                                    │
│                  │   │     │ Flyback                            │
│                  │   │ ))) │ Transformator                      │
│                  │   │ ((( │                                    │
│                  │   └──┬──┘                                    │
│                  │      │                                       │
│             ┌────┴────┐ │                                       │
│             │ MOSFET  │ │                                       │
│             │ Prekidač│ │                                       │
│             └────┬────┘ │                                       │
│                  │      │                                       │
│   GND ───────────┴──────┴──────────────────── Pack GND          │
│                                                                  │
│   Struja balansiranja: ~1A                                      │
│   Efikasnost: ~85%                                              │
│   Oporavak energije: Da (na pack bus)                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. SOC/SOH Estimation Servis

### 5.1 Definicija Servisa

```c
JEZGRO_SERVICE_DEFINE(soc_soh,
    .priority = JEZGRO_PRIORITY_MEDIUM,
    .stack_size = 4096,
    .memory_size = 16384,
    .watchdog_ms = 500
);

void soc_soh_main(void) {
    ekf_state_t ekf;
    soh_tracker_t soh;

    // Inicijalizacija Kalman filtera
    ekf_init(&ekf);
    soh_init(&soh);

    while (1) {
        jezgro_watchdog_feed();

        // Pribavi poslednje podatke ćelija
        cell_data_t cells;
        get_latest_cell_data(&cells);

        // Pokreni EKF update
        float soc = ekf_update(&ekf,
                               cells.pack_voltage_mv,
                               cells.pack_current_ma);

        // Ažuriraj SOH (sporo, praćenje degradacije kapaciteta)
        float soh_pct = soh_update(&soh, soc, cells.pack_current_ma);

        // Publikuj rezultate
        publish_soc_soh(soc, soh_pct);

        // Proveri pun/prazan stanje
        if (soc < SOC_EMPTY_THRESHOLD) {
            send_empty_warning();
        }

        jezgro_sleep(100);  // 10 Hz update
    }
}
```

### 5.2 Extended Kalman Filter

SOC procena koristi Extended Kalman Filter koji kombinuje:
- Coulomb counting (integracija struje)
- OCV-SOC lookup (baziran na naponu)
- Model-based predviđanje (RC ekvivalentno kolo)

```
┌─────────────────────────────────────────────────────────────────┐
│                    EKF SOC PROCENA                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   State Vector: x = [SOC, V_RC1, V_RC2]^T                       │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                   MODEL BATERIJE                         │   │
│   │                                                          │   │
│   │   V_terminal = OCV(SOC) - I*R0 - V_RC1 - V_RC2          │   │
│   │                                                          │   │
│   │   ┌───┐   ┌───────┐   ┌───────┐                         │   │
│   │   │R0 │───┤R1  C1 ├───┤R2  C2 ├───┬─── V_terminal       │   │
│   │   └───┘   └───────┘   └───────┘   │                     │   │
│   │                                    │                     │   │
│   │   OCV(SOC) ────────────────────────┘                    │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Predikcija:                                                    │
│     SOC_k+1 = SOC_k - (I * dt) / Q_nominal                     │
│     V_RCi_k+1 = V_RCi_k * exp(-dt/tau_i) + Ri*I*(1-exp(-dt/tau))│
│                                                                  │
│   Update:                                                        │
│     Inovacija: y = V_measured - V_predicted                    │
│     Kalman Gain: K = P * H^T * (H*P*H^T + R)^-1                │
│     x_updated = x_predicted + K * y                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 OCV-SOC Lookup Tabela (LFP)

```c
// OCV-SOC lookup za LiFePO4 na 25°C
const uint16_t ocv_soc_table[11] = {
    // mV na SOC = 0%, 10%, 20%, ... 100%
    2800,  // 0%
    3180,  // 10%
    3220,  // 20%
    3250,  // 30%
    3270,  // 40%
    3280,  // 50%
    3290,  // 60%
    3300,  // 70%
    3320,  // 80%
    3350,  // 90%
    3650   // 100%
};
```

### 5.4 SOH Praćenje

State of Health prati degradaciju kapaciteta i rast impedanse:

| Parametar | Metoda | Frekvencija |
|-----------|--------|-------------|
| Degradacija kapaciteta | Merenje punog ciklusa | Svakih 10 ciklusa |
| Rast impedanse | Analiza pulsnog testa | Mesečno ili na zahtev |
| Broj ciklusa | Coulomb counting | Kontinualno |
| Kalendarsko starenje | Model baziran na vremenu | U pozadini |

```c
typedef struct {
    float capacity_ah;         // Trenutni kapacitet (vs nominalni)
    float impedance_mohm;      // Trenutna impedansa (vs inicijalna)
    uint32_t cycle_count;      // Puni ekvivalentni ciklusi
    uint32_t operating_hours;  // Ukupni sati u upotrebi
    float soh_capacity_pct;    // SOH baziran na kapacitetu
    float soh_impedance_pct;   // SOH baziran na impedansi
    float soh_combined_pct;    // Ponderisana kombinacija
} soh_data_t;
```

---

## 6. Swarm Coordination Servis

### 6.1 Multi-Battery Arhitektura

Vozila mogu imati više EK-BAT modula koji se koordinišu preko swarm inteligencije:

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-BATTERY SWARM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Gradski Autobus (12m) - 2× EK-BAT-50                          │
│   ┌───────────────────────────────────────────────────────┐     │
│   │                                                        │     │
│   │   ┌─────────────┐         ┌─────────────┐             │     │
│   │   │ EK-BAT-50   │         │ EK-BAT-50   │             │     │
│   │   │ Modul A     │◄───────►│ Modul B     │             │     │
│   │   │ SOC: 75%    │  CAN-FD │ SOC: 72%    │             │     │
│   │   │ SOH: 98%    │         │ SOH: 95%    │             │     │
│   │   └──────┬──────┘         └──────┬──────┘             │     │
│   │          │                       │                     │     │
│   │          └───────────┬───────────┘                     │     │
│   │                      │                                 │     │
│   │              ┌───────▼───────┐                        │     │
│   │              │ Load Balancer │                        │     │
│   │              │ (ROJ_COORD) │                        │     │
│   │              │               │                        │     │
│   │              │ A: 52% load   │                        │     │
│   │              │ B: 48% load   │                        │     │
│   │              └───────────────┘                        │     │
│   │                                                        │     │
│   └───────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Definicija Servisa

```c
JEZGRO_SERVICE_DEFINE(swarm_coord,
    .priority = JEZGRO_PRIORITY_MEDIUM,
    .stack_size = 4096,
    .memory_size = 16384,
    .watchdog_ms = 1000
);

void swarm_coord_main(void) {
    peer_table_t peers;
    load_balance_t lb;

    peer_table_init(&peers);

    while (1) {
        jezgro_watchdog_feed();

        // Objavi naše stanje
        broadcast_state(get_local_soc(), get_local_soh());

        // Primi stanja peer-ova
        update_peer_table(&peers);

        // Izračunaj distribuciju opterećenja
        calculate_load_balance(&peers, &lb);

        // Primeni lokalni limit snage
        set_local_power_limit(lb.my_share);

        // Odluke svesne zdravlja
        if (should_defer_to_healthier_peer(&peers)) {
            reduce_my_contribution();
        }

        jezgro_sleep(100);
    }
}
```

### 6.3 Algoritam Balansiranja Opterećenja

```
┌─────────────────────────────────────────────────────────────────┐
│                    ALGORITAM BALANSIRANJA OPTEREĆENJA           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Ulaz:                                                          │
│     P_total = Ukupna potražnja snage                            │
│     SOC_i = State of charge za bateriju i                       │
│     SOH_i = State of health za bateriju i                       │
│     T_i = Temperatura za bateriju i                             │
│                                                                  │
│   Izračun Težine:                                                │
│     W_i = SOC_i × SOH_i × ThermalFactor(T_i)                   │
│                                                                  │
│     ThermalFactor(T) = 1.0           ako T < 40°C              │
│                      = 1.0 - 0.02×(T-40)  ako 40°C ≤ T < 50°C  │
│                      = 0.8 - 0.04×(T-50)  ako T ≥ 50°C         │
│                                                                  │
│   Alokacija Snage:                                               │
│     P_i = P_total × (W_i / Σ W_j)                              │
│                                                                  │
│   Primer (2 baterije):                                          │
│     Baterija A: SOC=75%, SOH=98%, T=35°C → W_A = 0.75×0.98×1.0 │
│     Baterija B: SOC=72%, SOH=95%, T=42°C → W_B = 0.72×0.95×0.96│
│                                                                  │
│     W_A = 0.735,  W_B = 0.657                                   │
│     P_A = P_total × 0.735/1.392 = 52.8%                        │
│     P_B = P_total × 0.657/1.392 = 47.2%                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.4 CAN Protokol za Multi-Battery

| Message ID | Ime | Frekvencija | Sadržaj |
|------------|-----|-------------|---------|
| 0x100 + ID | BAT_STATUS | 10 Hz | SOC, SOH, napon, struja, temp |
| 0x180 + ID | BAT_LIMITS | 1 Hz | Max snaga punjenja/pražnjenja |
| 0x200 + ID | BAT_COMMAND | Na zahtev | Setpoint snage, mod |
| 0x280 + ID | BAT_FAULT | Event | Kod greške, ID ćelije |

---

## 7. Integracija

### 7.1 Integracija sa Vozilom

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRACIJA SA VOZILOM                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐     CAN-FD      ┌─────────────┐              │
│   │   Vozilo    │◄───────────────►│  EK-BAT     │              │
│   │   ECU       │                 │  BMS        │              │
│   └──────┬──────┘                 └──────┬──────┘              │
│          │                               │                      │
│          ▼                               ▼                      │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                  TOK CAN PORUKA                          │   │
│   │                                                          │   │
│   │   Vozilo → BMS:                                          │   │
│   │   • Potražnja snage (kW)                                 │   │
│   │   • Omogući/onemogući punjenje                           │   │
│   │   • Zahtev za predgrejanje                               │   │
│   │                                                          │   │
│   │   BMS → Vozilo:                                          │   │
│   │   • SOC (%)                                              │   │
│   │   • Dostupna snaga (kW punjenje/pražnjenje)              │   │
│   │   • Pack napon/struja                                    │   │
│   │   • Opseg temperature                                    │   │
│   │   • Status greške                                        │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Integracija sa Swap Stanicom

Tokom zamene baterije, BMS komunicira sa swap stanicom:

| Faza | BMS Akcija |
|------|------------|
| **Pre-zamene** | Izveštaj o SOC, SOH, statusu grešaka |
| **Disconnect** | Bezbedan shutdown, otvaranje kontaktora |
| **Skladištenje** | Low-power mod, periodična provera SOC |
| **Reconnect** | Test izolacije, zatvaranje kontaktora |
| **Post-zamene** | Kompletan izveštaj statusa, spremno za rad |

### 7.3 Integracija Punjenja

```c
// Handshake punjenja sa EK3 modulima
void handle_charge_request(charge_request_t* req) {
    // Izračunaj limite punjenja na osnovu SOC, temperature, SOH
    charge_limits_t limits;

    limits.max_voltage = calculate_charge_voltage();
    limits.max_current = calculate_charge_current();
    limits.target_soc = req->target_soc;

    // Derating baziran na temperaturi
    if (get_max_temperature() > 40) {
        limits.max_current *= 0.8;
    }

    // Derating baziran na SOH za degradirane ćelije
    if (get_soh() < 80) {
        limits.max_current *= 0.9;
    }

    // Pošalji limite punjaču
    send_charge_limits(&limits);
}
```

---

## 8. Safety Arhitektura

### 8.1 Hardverska vs Softverska Zaštita

```
┌─────────────────────────────────────────────────────────────────┐
│                    SLOJEVI BEZBEDNOSTI                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Sloj 1: HARDVER (ne može se zaobići)                          │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ • AFE interni OVP/UVP komparatori                       │   │
│   │ • Hardverska kontrola kontaktora (nezavisan MCU)        │   │
│   │ • Osigurači (nivo ćelije i nivo pack-a)                │   │
│   │ • Termalni osigurači na ćelijama                        │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Sloj 2: FIRMWARE (JEZGRO servisi)                             │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ • CELL_MONITOR: Kontinualna provera napona/temp        │   │
│   │ • SAFETY_MONITOR: Dedicirani safety servis (opciono)   │   │
│   │ • Automatski restart servisa pri greški                │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Sloj 3: SISTEM (nivo vozila/stanice)                          │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ • Vozilo ECU nadgleda BMS heartbeat                    │   │
│   │ • Swap stanica verifikuje zdravlje baterije            │   │
│   │ • Fleet management prati degradaciju                   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Matrica Odgovora na Greške

| Greška | Detekcija | Odgovor | Oporavak |
|--------|-----------|---------|----------|
| Ćelija OVP | AFE + firmware | Stop punjenja, otvori kontaktor | Auto kada napon padne |
| Ćelija UVP | AFE + firmware | Stop pražnjenja, otvori kontaktor | Auto posle punjenja |
| Ćelija OTP | NTC + firmware | Derate, zatim stop | Auto posle hlađenja |
| Greška balansiranja | Firmware | Onemogući balance FET | Manualna inspekcija |
| Gubitak AFE komun. | Firmware | Koristi poslednje poznato, flag | Auto pri ponovnom povezivanju |
| Greška SOC procene | Firmware | Fall back na OCV metod | Auto |
| Zavareni kontaktor | Firmware + vozilo | Emergency disconnect | Zamena kontaktora |

---

## 9. Testiranje i Validacija

### 9.1 Testovi na Nivou Servisa

| Test | Svrha | Metoda |
|------|-------|--------|
| CELL_MONITOR timing | Verifikuj 50Hz update rate | Logic analyzer na SPI |
| BALANCING tačnost | Verifikuj konvergenciju ćelija | Test pražnjenja |
| SOC_SOH tačnost | Verifikuj ±3% SOC | Test punog ciklusa |
| ROJ_COORD fer | Verifikuj distribuciju opterećenja | Multi-battery test |
| Fault injection | Verifikuj oporavak | Kill servise, proveri restart |

### 9.2 Integracioni Testovi

| Test | Svrha | Kriterijum Prolaza |
|------|-------|-------------------|
| Integracija vozila | CAN protokol usaglašenost | Sve poruke parsirane |
| Swap station handshake | Bezbedan disconnect/reconnect | Bez grešaka kontaktora |
| Profil punjenja | Ispravno CC/CV punjenje | SOC dostiže 100% |
| Multi-battery balans | Konvergencija jednakog SOC | <2% delta posle 1h |

### 9.3 Testovi Okoline

| Test | Uslovi | Trajanje |
|------|--------|----------|
| Rad na visokoj temp | 55°C ambient | 8 sati |
| Punjenje na niskoj temp | -20°C | Punjenje do 80% |
| Termičko cikliranje | -20°C do +55°C | 100 ciklusa |
| Vibracije | Prema ISO 16750-3 | 8 sati po osi |

---

## 10. Unakrsne Reference

| Dokument | Veza |
|----------|------|
| `tehnika/inzenjersko/sr/21-jezgro-product-family.md` | JEZGRO familija proizvoda |
| `tehnika/inzenjersko/sr/16-jezgro.md` | Osnovna JEZGRO specifikacija |
| `tehnika/inzenjersko/sr/SPECIFICATIONS.md` | EK-BAT modul specifikacije |
| `tehnika/inzenjersko/sr/05-swap-station.md` | Integracija swap stanice |
| `tehnika/konceptualno/sr/02-swarm-intelligence.md` | Swarm algoritmi |

---

## Istorija Izmena

| Datum | Verzija | Opis |
|-------|---------|------|
| 2026-01-04 | 1.0 | Inicijalna JEZGRO-BAT specifikacija |
