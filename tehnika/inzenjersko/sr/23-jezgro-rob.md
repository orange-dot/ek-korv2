# JEZGRO-ROB: Firmver za Kontroler Robota

**Verzija:** 1.0
**Datum:** 2026-01-04
**Status:** SPECIFIKACIJA

---

## Svrha Dokumenta

Ovaj dokument specificira **JEZGRO-ROB**, varijantu JEZGRO mikrokernela za kontrolere robota u stanicama za zamenu. JEZGRO-ROB pruža upravljanje kretanjem otporno na greške, fuziju senzora i koordinisane operacije dva robota za zamenu baterija i modula punjača.

---

## 1. Pregled

### 1.1 Zahtevi Robotskog Sistema

Stanica za zamenu koristi dva specijalizovana robota koji rade paralelno:

| Robot | Oznaka | Primarni Zadatak | Nosivost | Preciznost |
|-------|--------|------------------|----------|------------|
| **Robot A** | Robot za Baterije | Zamena EK-BAT modula | 800 kg | ±5 mm |
| **Robot B** | Robot za Module | Zamena EK3 modula punjača | 50 kg | ±1 mm |

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ROBOTSKI SISTEM STANICE ZA ZAMENU                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌──────────────────────┐              ┌──────────────────────┐           │
│    │      ROBOT A         │              │      ROBOT B         │           │
│    │   (Zamena Baterija)  │              │   (Zamena Modula)    │           │
│    │                      │              │                      │           │
│    │   ┌────────────┐     │              │   ┌────────────┐     │           │
│    │   │ Portalski/ │     │              │   │ 6-Osni     │     │           │
│    │   │ Kartezijski│     │              │   │ Zglobni    │     │           │
│    │   │            │     │              │   │            │     │           │
│    │   │ Nosivost:  │     │              │   │ Nosivost:  │     │           │
│    │   │ 800 kg     │     │              │   │ 50 kg      │     │           │
│    │   └────────────┘     │              │   └────────────┘     │           │
│    │                      │              │                      │           │
│    │   STM32H743 + JEZGRO │              │   STM32H743 + JEZGRO │           │
│    └──────────┬───────────┘              └──────────┬───────────┘           │
│               │                                     │                        │
│               └─────────────┬───────────────────────┘                        │
│                             │                                                │
│                     ┌───────▼───────┐                                        │
│                     │  KONTROLER    │                                        │
│                     │  STANICE      │                                        │
│                     │  (Linux)      │                                        │
│                     └───────────────┘                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Zašto JEZGRO za Robote?

Tradicionalni firmver robota je monolitan sa složenim mašinama stanja. JEZGRO-ROB pruža:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PREDNOSTI JEZGRO-ROB                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   TRADICIONALNI FIRMVER ROBOTA     JEZGRO-ROB                               │
│   ─────────────────────────────    ──────────                                │
│   ┌─────────────────────┐         ┌─────────────────────┐                   │
│   │ Monolitna           │         │ Izolovani Servisi   │                   │
│   │ Kontrolna Petlja    │         │ ┌──────┐ ┌──────┐  │                   │
│   │                     │         │ │KRETA-│ │SIGUR-│  │                   │
│   │ Greška senzora =    │         │ │NJE   │ │NOST  │  │                   │
│   │ Robot staje         │         │ └──┬───┘ └──┬───┘  │                   │
│   │                     │         │    │        │      │                   │
│   │ Nema graciozan      │         │ ┌──┴────────┴──┐   │                   │
│   │ oporavak            │         │ │   KERNEL     │   │                   │
│   │                     │         │ │ (restartuje  │   │                   │
│   └─────────────────────┘         │ │  servise)    │   │                   │
│                                   │ └──────────────┘   │                   │
│                                   │                    │                   │
│                                   │ Pad vizije =       │                   │
│                                   │ Prelazak na enkod. │                   │
│                                   │ Robot nastavlja    │                   │
│                                   └────────────────────┘                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Prednost | Opis |
|----------|------|
| **Izolacija Grešaka** | Pad vizije ne zaustavlja upravljanje kretanjem |
| **Graciozan Oporavak** | Povratak na pozicioniranje samo enkoderom |
| **Automatski Oporavak** | Restart servisa za <50ms |
| **Sinhronizacija Robota** | Servis koordinacije upravlja protokolom A↔B |
| **Konzistentan API** | Isti JEZGRO model kao EK3, BMS, rack kontroler |

### 1.3 Izbor Hardvera

JEZGRO-ROB koristi STM32H743 za pojačane računske zahteve:

| Parametar | STM32G474 (EK3/BMS) | STM32H743 (Roboti) |
|-----------|---------------------|-------------------|
| Jezgro | Cortex-M4 @ 170 MHz | Cortex-M7 @ 480 MHz |
| Flash | 512 KB | 2 MB |
| RAM | 128 KB | 1 MB |
| FPU | Jednostruka preciznost | Dvostruka preciznost |
| Keš | Nema | 16 KB I + 16 KB D |
| DMA | Da | MDMA + BDMA |
| CAN-FD | 3 interfejsa | 2 interfejsa |
| Ethernet | Ne | Da (MAC) |
| Cena | ~$8 | ~$15 |

**Zašto H743 za robote:**
- FPU dvostruke preciznosti za kinematičke proračune
- Više RAM-a za bafere trajektorije i obradu slike
- 480 MHz za čvrste servo petlje (1 kHz+)
- Ethernet za interfejs kamere
- Hardversko ubrzanje matematike

---

## 2. Arhitektura

### 2.1 Konfiguracija Servisa (Robot A - Baterija)

| ID | Servis | Prioritet | Stek | Memorija | Watchdog | Svrha |
|----|--------|-----------|------|----------|----------|-------|
| 0 | KERNEL | - | 4 KB | 16 KB | - | Jezgro (privilegovano) |
| 1 | MOTION_CTRL | KRITIČAN | 8 KB | 64 KB | 10 ms | Servo petlje, kinematika |
| 2 | TRAJECTORY | VISOK | 8 KB | 128 KB | 50 ms | Planiranje putanje, splajn |
| 3 | SENSOR_FUSION | VISOK | 8 KB | 64 KB | 20 ms | IMU, enkoderi, graničnici |
| 4 | SAFETY_MONITOR | KRITIČAN | 4 KB | 16 KB | 20 ms | E-stop, kolizija |
| 5 | COORDINATION | SREDNJI | 4 KB | 32 KB | 100 ms | Sinhronizacija Robot A↔B |
| 6 | GRIPPER_CTRL | VISOK | 4 KB | 16 KB | 50 ms | Kontrola krajnjeg efektora |
| 7 | CAN_HANDLER | VISOK | 4 KB | 16 KB | 100 ms | Komunikacija sa stanicom |
| 8 | VISION_PROC | SREDNJI | 8 KB | 128 KB | 200 ms | Poravnanje kamerom |
| 9 | AUDIT_LOGGER | NIZAK | 4 KB | 32 KB | 2000 ms | Zapisivanje događaja |

**Ukupno RAM:** ~512 KB od 1 MB dostupno

### 2.2 Konfiguracija Servisa (Robot B - Modul)

| ID | Servis | Prioritet | Stek | Memorija | Watchdog | Svrha |
|----|--------|-----------|------|----------|----------|-------|
| 0 | KERNEL | - | 4 KB | 16 KB | - | Jezgro (privilegovano) |
| 1 | MOTION_CTRL | KRITIČAN | 8 KB | 64 KB | 5 ms | Precizno servo |
| 2 | TRAJECTORY | VISOK | 8 KB | 64 KB | 50 ms | Planiranje putanje |
| 3 | SENSOR_FUSION | VISOK | 8 KB | 32 KB | 10 ms | Enkoderi, sila/obrtni moment |
| 4 | SAFETY_MONITOR | KRITIČAN | 4 KB | 16 KB | 10 ms | Kolaborativna sigurnost |
| 5 | COORDINATION | SREDNJI | 4 KB | 32 KB | 100 ms | Sinhronizacija Robot A↔B |
| 6 | GRIPPER_CTRL | VISOK | 4 KB | 16 KB | 50 ms | Hvataljka za module |
| 7 | CAN_HANDLER | VISOK | 4 KB | 16 KB | 100 ms | Komunikacija sa stanicom |
| 8 | AUDIT_LOGGER | NIZAK | 4 KB | 32 KB | 2000 ms | Zapisivanje događaja |

**Ukupno RAM:** ~288 KB od 1 MB dostupno

### 2.3 Mapa Memorije

```
┌─────────────────────────────────────────────────┐  0x240FFFFF (1 MB)
│                                                 │
│        VISION_PROC Memorija (128 KB)            │  (samo Robot A)
│        (baferi slika, keš karakteristika)       │
├─────────────────────────────────────────────────┤  0x240E0000
│        TRAJECTORY Memorija (128 KB)             │
│        (bafer tačaka, koeficijenti splajna)     │
├─────────────────────────────────────────────────┤  0x240C0000
│        MOTION_CTRL Memorija (64 KB)             │
│        (stanja zglobova, PID istorija)          │
├─────────────────────────────────────────────────┤  0x240B0000
│        SENSOR_FUSION Memorija (64 KB)           │
│        (Kalman stanje, istorija senzora)        │
├─────────────────────────────────────────────────┤  0x240A0000
│        COORDINATION Memorija (32 KB)            │
│        (stanje para, baferi sinhronizacije)     │
├─────────────────────────────────────────────────┤  0x24098000
│        Ostali Servisi (64 KB)                   │
│        (SAFETY, GRIPPER, CAN, AUDIT)            │
├─────────────────────────────────────────────────┤  0x24088000
│        IPC Bazen Poruka (32 KB)                 │
│        512 poruka × 64 bajta                    │
├─────────────────────────────────────────────────┤  0x24080000
│        Stekovi Servisa (64 KB)                  │
│        (8 KB × 8 servisa)                       │
├─────────────────────────────────────────────────┤  0x24070000
│        DMA Baferi (64 KB)                       │
│        (ADC, enkoder, SPI)                      │
├─────────────────────────────────────────────────┤  0x24060000
│        Rezervisano (384 KB)                     │
│        (buduće proširenje)                      │
├─────────────────────────────────────────────────┤  0x24000000
│        D1 Domen RAM (128 KB)                    │
│        Kernel + TCM pristup                     │
└─────────────────────────────────────────────────┘  0x20000000
```

### 2.4 Hardverski Interfejs

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    JEZGRO-ROB HARDVER (Robot A)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        STM32H743 MCU                                 │   │
│   │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │   │
│   │  │ TIM1-8 │ │  ADC   │ │ CAN-FD │ │  SPI   │ │  I2C   │ │  ETH   │ │   │
│   │  │(PWM/QEI)│ │(Struja)│ │(Komun.)│ │(Enkod.)│ │ (IMU)  │ │(Vizija)│ │   │
│   │  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ │   │
│   └──────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┘   │
│          │          │          │          │          │          │           │
│          ▼          ▼          ▼          ▼          ▼          ▼           │
│   ┌──────────┐ ┌─────────┐ ┌───────┐ ┌─────────┐ ┌───────┐ ┌──────────┐    │
│   │ Servo    │ │ Senzori │ │Kontr. │ │Apsolutni│ │ IMU   │ │ 3D       │    │
│   │ Pogoni   │ │ Struje  │ │Stanice│ │ Enkoderi│ │ 9-DOF │ │ Kamera   │    │
│   │ (6 osa)  │ │ (6 kan.)│ │       │ │ (6 kan.)│ │       │ │          │    │
│   └──────────┘ └─────────┘ └───────┘ └─────────┘ └───────┘ └──────────┘    │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                       EKSTERNI SISTEMI                               │   │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│   │  │  E-Stop    │  │  Svetlosne │  │  Aktuator  │  │  Granični  │    │   │
│   │  │  Kolo      │  │  Zavese    │  │  Hvataljke │  │  Prekidači │    │   │
│   └──┴────────────┴──┴────────────┴──┴────────────┴──┴────────────┴────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Servis Upravljanja Kretanjem

### 3.1 Definicija Servisa

```c
JEZGRO_SERVICE_DEFINE(motion_ctrl,
    .priority = JEZGRO_PRIORITY_CRITICAL,
    .stack_size = 8192,
    .memory_size = 65536,
    .watchdog_ms = 10  // Robot A: 10ms, Robot B: 5ms
);

void motion_ctrl_main(void) {
    joint_state_t joints[MAX_JOINTS];
    pid_controller_t pid[MAX_JOINTS];

    // Inicijalizacija servo interfejsa
    servo_init_all();
    pid_init_all(pid);

    // Konfigurisanje tajmera kontrolne petlje (1 kHz)
    jezgro_timer_start(TIMER_SERVO_LOOP, 1000);

    while (1) {
        jezgro_watchdog_feed();

        // Čekaj na otkucaj kontrolne petlje
        jezgro_timer_wait(TIMER_SERVO_LOOP);

        // Čitaj trenutne pozicije zglobova
        encoder_read_all(joints);

        // Dobij tačku trajektorije
        trajectory_point_t setpoint;
        if (get_current_setpoint(&setpoint) != JEZGRO_OK) {
            // Nema trajektorije, drži poziciju
            setpoint = get_hold_position();
        }

        // Izvrši inverznu kinematiku
        joint_setpoint_t joint_sp;
        inverse_kinematics(&setpoint.pose, &joint_sp);

        // PID kontrola za svaki zglob
        for (int i = 0; i < joint_count; i++) {
            float error = joint_sp.position[i] - joints[i].position;
            float output = pid_update(&pid[i], error);

            // Ograničenje struje
            output = apply_current_limit(i, output);

            // Pošalji na servo pogon
            servo_set_torque(i, output);
        }

        // Objavi stanja zglobova
        publish_joint_states(joints);
    }
}
```

### 3.2 Kinematika (Robot A - Portalski)

Robot A koristi kartezijsku/portalsku konfiguraciju za rukovanje teškim teretom:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    KINEMATIKA ROBOTA A (PORTALSKI)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Koordinatni Sistem:                                                        │
│                                                                              │
│                    Z (vertikalno)                                            │
│                    │                                                         │
│                    │    Y (napred)                                           │
│                    │   /                                                     │
│                    │  /                                                      │
│                    │ /                                                       │
│                    │/_________ X (bočno)                                     │
│                                                                              │
│   Konfiguracija Zglobova:                                                    │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  Zglob 1: X-osa linearna šina (bočno)      Opseg: 0-3000 mm    │       │
│   │  Zglob 2: Y-osa linearna šina (napred)     Opseg: 0-2000 mm    │       │
│   │  Zglob 3: Z-osa linearna šina (vertikalno) Opseg: 0-1500 mm    │       │
│   │  Zglob 4: Rotacija oko Z                   Opseg: ±180°        │       │
│   │  Zglob 5: Nagib (pitch)                    Opseg: ±30°         │       │
│   │  Zglob 6: Rotacija hvataljke               Opseg: ±90°         │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   Direktna Kinematika:                                                       │
│     x = J1                                                                   │
│     y = J2                                                                   │
│     z = J3                                                                   │
│     Rz = J4, Ry = J5, Rz' = J6                                              │
│                                                                              │
│   Inverzna Kinematika (trivijalna za kartezijski):                          │
│     J1 = x, J2 = y, J3 = z                                                  │
│     J4, J5, J6 iz matrice rotacije                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Kinematika (Robot B - Zglobni)

Robot B koristi 6-osnu zglobnu ruku za precizno rukovanje modulima:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    KINEMATIKA ROBOTA B (6-OSNI)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   DH Parametri (stil Universal Robots UR20):                                │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  Zglob  │  θ (var) │    d    │    a    │   α   │  Opseg        │       │
│   ├─────────┼──────────┼─────────┼─────────┼───────┼───────────────┤       │
│   │    1    │    θ₁    │   181   │    0    │  90°  │  ±360°        │       │
│   │    2    │    θ₂    │    0    │  -612   │   0°  │  ±360°        │       │
│   │    3    │    θ₃    │    0    │  -572   │   0°  │  ±360°        │       │
│   │    4    │    θ₄    │   174   │    0    │  90°  │  ±360°        │       │
│   │    5    │    θ₅    │   120   │    0    │ -90°  │  ±360°        │       │
│   │    6    │    θ₆    │   117   │    0    │   0°  │  ±360°        │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   Inverzna Kinematika: Rešenje u zatvorenoj formi (6R sferični zglob)       │
│   - 8 mogućih rešenja, bira se po minimalnom pomeranju zglobova            │
│   - Izbegavanje singulariteta blizu poravnanja zgloba                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Implementacija PID Kontrolera

```c
typedef struct {
    float kp, ki, kd;           // Pojačanja
    float integral;              // Akumulirani integral
    float prev_error;            // Za derivat
    float integral_limit;        // Anti-windup
    float output_limit;          // Maks obrtni moment
} pid_controller_t;

float pid_update(pid_controller_t* pid, float error) {
    // Proporcionalni član
    float p_term = pid->kp * error;

    // Integralni član sa anti-windup
    pid->integral += error;
    if (pid->integral > pid->integral_limit) {
        pid->integral = pid->integral_limit;
    } else if (pid->integral < -pid->integral_limit) {
        pid->integral = -pid->integral_limit;
    }
    float i_term = pid->ki * pid->integral;

    // Derivativni član (filtriran)
    float d_term = pid->kd * (error - pid->prev_error);
    pid->prev_error = error;

    // Suma i ograničenje
    float output = p_term + i_term + d_term;
    if (output > pid->output_limit) {
        output = pid->output_limit;
    } else if (output < -pid->output_limit) {
        output = -pid->output_limit;
    }

    return output;
}
```

### 3.5 Interfejs Servo Pogona

| Parametar | Robot A | Robot B |
|-----------|---------|---------|
| Tip pogona | Servo (CAN) | Servo (EtherCAT/CAN) |
| Režim kontrole | Obrtni moment | Obrtni moment/Pozicija |
| Povratna sprega | Apsolutni enkoder | Apsolutni enkoder |
| Rezolucija | 19-bitna | 23-bitna |
| Frekvencija petlje | 1 kHz | 2 kHz |
| Ograničenje struje | Po zglobu | Po zglobu |

---

## 4. Servis Trajektorije

### 4.1 Definicija Servisa

```c
JEZGRO_SERVICE_DEFINE(trajectory,
    .priority = JEZGRO_PRIORITY_HIGH,
    .stack_size = 8192,
    .memory_size = 131072,  // 128 KB za bafer tačaka
    .watchdog_ms = 50
);

void trajectory_main(void) {
    trajectory_buffer_t buffer;
    spline_state_t spline;

    trajectory_buffer_init(&buffer);

    while (1) {
        jezgro_watchdog_feed();

        // Proveri nove komande trajektorije
        jezgro_msg_t msg;
        if (jezgro_receive(SVC_CAN_HANDLER, &msg, 10) == JEZGRO_OK) {
            if (msg.type == MSG_TRAJECTORY_NEW) {
                // Učitaj novu trajektoriju
                load_trajectory(&buffer, msg.payload.trajectory);
                spline_init(&spline, &buffer);
            } else if (msg.type == MSG_TRAJECTORY_APPEND) {
                // Dodaj tačke (blending)
                append_waypoints(&buffer, msg.payload.waypoints);
            }
        }

        // Generiši setpoints na 1 kHz za kontrolu kretanja
        if (buffer.state == TRAJ_EXECUTING) {
            trajectory_point_t point;

            // Interpoliraj trenutnu poziciju na splajnu
            float t = get_trajectory_time();
            spline_evaluate(&spline, t, &point);

            // Ograničenja brzine/ubrzanja
            apply_dynamic_limits(&point);

            // Objavi kontroli kretanja
            publish_setpoint(&point);

            // Proveri završetak
            if (t >= spline.duration) {
                buffer.state = TRAJ_COMPLETE;
                notify_completion();
            }
        }

        jezgro_sleep(1);  // 1 kHz generisanje trajektorije
    }
}
```

### 4.2 Tipovi Trajektorija

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TIPOVI TRAJEKTORIJA                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. TAČKA-DO-TAČKE (PTP)                                                   │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  • Interpolacija u prostoru zglobova                             │       │
│   │  • Najbrže za velika kretanja                                    │       │
│   │  • Trapezni profil brzine                                        │       │
│   │                                                                  │       │
│   │      brzina                                                      │       │
│   │         │    ┌────────┐                                         │       │
│   │         │   /          \                                         │       │
│   │         │  /            \                                        │       │
│   │         │ /              \                                       │       │
│   │         └/────────────────\────────▶ vreme                      │       │
│   │           ubrzanje   krst   usporenje                            │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   2. LINEARNO (LIN)                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  • Interpolacija u kartezijskom prostoru                         │       │
│   │  • Pravolinijska putanja alata                                   │       │
│   │  • Koristi se za umetanje/vađenje baterije/modula               │       │
│   │                                                                  │       │
│   │      Početak ──────────────────────────────────▶ Kraj           │       │
│   │        P1                                       P2               │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   3. KRUŽNO (CIRC)                                                          │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  • Lučna interpolacija kroz 3 tačke                              │       │
│   │  • Koristi se za izbegavanje prepreka                            │       │
│   │                                                                  │       │
│   │            ╭──────────╮                                          │       │
│   │      Poč.╯    luk     ╰Kraj                                     │       │
│   │        P1      P2      P3                                        │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   4. SPLAJN                                                                 │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  • Glatka putanja kroz više tačaka                               │       │
│   │  • Kubni ili kvintni Bezier                                      │       │
│   │  • Neprekidna brzina i ubrzanje                                  │       │
│   │                                                                  │       │
│   │                  ╭──╮                                            │       │
│   │      Početak ───╯    ╰─────────╮                                │       │
│   │                                 ╰──── Kraj                       │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Profil Brzine

```c
typedef struct {
    float max_velocity;      // mm/s ili deg/s
    float max_acceleration;  // mm/s² ili deg/s²
    float max_jerk;          // mm/s³ ili deg/s³ (za S-krivu)
} velocity_profile_t;

// Podrazumevani profili po robotu
const velocity_profile_t robot_a_profile = {
    .max_velocity = 500.0f,      // 500 mm/s
    .max_acceleration = 2000.0f, // 2000 mm/s²
    .max_jerk = 10000.0f         // 10000 mm/s³
};

const velocity_profile_t robot_b_profile = {
    .max_velocity = 1000.0f,     // 1000 mm/s
    .max_acceleration = 5000.0f, // 5000 mm/s²
    .max_jerk = 25000.0f         // 25000 mm/s³
};
```

### 4.4 Blending Putanje

Za kontinuirano kretanje bez zaustavljanja na tačkama:

```c
// Radijus blendinga određuje koliko "seče uglove"
typedef struct {
    pose_t position;
    float blend_radius;  // mm, 0 = potpuno zaustavljanje na tački
} waypoint_t;

// Tokom sekvence zamene:
waypoint_t swap_path[] = {
    { .position = HOME_POSITION,     .blend_radius = 50 },
    { .position = APPROACH_POSITION, .blend_radius = 30 },
    { .position = GRIP_POSITION,     .blend_radius = 0  },  // Stop za hvatanje
    { .position = EXTRACT_POSITION,  .blend_radius = 20 },
    { .position = TRANSIT_POSITION,  .blend_radius = 50 },
    // ...
};
```

---

## 5. Servis Fuzije Senzora

### 5.1 Definicija Servisa

```c
JEZGRO_SERVICE_DEFINE(sensor_fusion,
    .priority = JEZGRO_PRIORITY_HIGH,
    .stack_size = 8192,
    .memory_size = 65536,
    .watchdog_ms = 20
);

void sensor_fusion_main(void) {
    fusion_state_t state;
    kalman_filter_t kf;

    fusion_init(&state);
    kalman_init(&kf);

    while (1) {
        jezgro_watchdog_feed();

        // Čitaj sve senzore
        encoder_data_t encoders;
        imu_data_t imu;
        limit_switch_t limits;

        encoder_read_all(&encoders);
        imu_read(&imu);
        limit_read_all(&limits);

        // Fuzija enkoder + IMU za bolju procenu pozicije
        fused_state_t fused;
        kalman_update(&kf, &encoders, &imu, &fused);

        // Proveri okidanje graničnih prekidača
        if (check_limits(&limits)) {
            // Pošalji hitnu poruku sigurnosti
            jezgro_msg_t msg = {
                .type = MSG_LIMIT_TRIGGERED,
                .payload.limits = limits
            };
            jezgro_send_priority(SVC_SAFETY_MONITOR, &msg);
        }

        // Objavi fuzionisano stanje
        publish_fused_state(&fused);

        // Integracija vizije (samo Robot A)
        #if ROBOT_CONFIG == ROBOT_A
        if (vision_data_available()) {
            vision_correction_t correction;
            if (get_vision_correction(&correction)) {
                apply_position_correction(&state, &correction);
            }
        }
        #endif

        jezgro_sleep(5);  // 200 Hz fuzija senzora
    }
}
```

### 5.2 Konfiguracija Senzora

| Senzor | Robot A | Robot B | Interfejs | Frekvencija |
|--------|---------|---------|-----------|-------------|
| Enkoderi zglobova | Apsolutni, 19-bit | Apsolutni, 23-bit | SPI/SSI | 1 kHz |
| IMU (9-DOF) | BMI088 | Opciono | SPI | 400 Hz |
| Sila/Moment | Opciono | ATI Mini45 | Ethernet | 1 kHz |
| Granični prekidači | 12 (6 + 6) | 12 (6 + 6) | GPIO | 1 kHz |
| Svetlosne zavese | 2 zone | 2 zone | Sigurnosni PLC | - |
| 3D Kamera | Intel RealSense | Opciono | Ethernet | 30 Hz |

### 5.3 Interfejs Enkodera

```c
typedef struct {
    uint32_t position_raw;    // Sirovi broj enkodera
    float position_rad;       // Pozicija u radijanima
    float velocity_rad_s;     // Brzina u rad/s
    uint8_t status;           // Zastavice grešaka
    uint32_t timestamp;       // Mikrosekunde
} encoder_channel_t;

void encoder_read_all(encoder_data_t* data) {
    for (int i = 0; i < joint_count; i++) {
        // Čitaj apsolutnu poziciju (SSI protokol)
        uint32_t raw = ssi_read(encoder_config[i].ssi_port);

        // Konvertuj u radijane
        data->channels[i].position_raw = raw;
        data->channels[i].position_rad =
            (raw / (float)encoder_config[i].resolution) * 2.0f * M_PI;

        // Izračunaj brzinu iz derivata pozicije
        float dt = (now_us() - data->channels[i].timestamp) / 1e6f;
        data->channels[i].velocity_rad_s =
            (data->channels[i].position_rad - prev_position[i]) / dt;
        prev_position[i] = data->channels[i].position_rad;

        data->channels[i].timestamp = now_us();
    }
}
```

### 5.4 Obrada Vizije (Robot A)

```c
// Vizija se koristi za fino poravnanje tokom hvatanja baterije
typedef struct {
    float x_offset;      // mm, bočna korekcija
    float y_offset;      // mm, korekcija napred
    float z_offset;      // mm, vertikalna korekcija
    float rotation;      // stepeni, korekcija okretanja
    float confidence;    // 0-1, pouzdanost detekcije
    bool valid;
} vision_correction_t;

// Poziva VISION_PROC servis
void process_camera_frame(frame_t* frame, vision_correction_t* result) {
    // Detektuj markere za poravnanje na baterijskom modulu
    marker_t markers[4];
    int num_markers = detect_alignment_markers(frame, markers);

    if (num_markers >= 3) {
        // Izračunaj korekciju pozicije iz markera
        calculate_pose_correction(markers, num_markers, result);
        result->valid = result->confidence > 0.8f;
    } else {
        result->valid = false;
    }
}
```

---

## 6. Servis Nadzora Sigurnosti

### 6.1 Definicija Servisa

```c
JEZGRO_SERVICE_DEFINE(safety_monitor,
    .priority = JEZGRO_PRIORITY_CRITICAL,
    .stack_size = 4096,
    .memory_size = 16384,
    .watchdog_ms = 20
);

void safety_monitor_main(void) {
    safety_state_t state = SAFETY_OK;
    uint32_t last_heartbeat[2];  // Heartbeat Robota A/B

    while (1) {
        jezgro_watchdog_feed();

        // Proveri status E-stop (hardverski ulaz)
        if (gpio_read(ESTOP_PIN) == ESTOP_ACTIVE) {
            trigger_emergency_stop(ESTOP_BUTTON);
            state = SAFETY_ESTOP;
        }

        // Proveri status svetlosne zavese (sa Sigurnosnog PLC-a)
        if (get_light_curtain_status() == CURTAIN_BROKEN) {
            if (state != SAFETY_ESTOP) {
                trigger_protective_stop(CURTAIN_VIOLATION);
                state = SAFETY_PROTECTIVE_STOP;
            }
        }

        // Proveri heartbeat parskog robota (koordinacija)
        if (now_ms() - last_heartbeat[PEER_ROBOT] > HEARTBEAT_TIMEOUT_MS) {
            trigger_protective_stop(PEER_TIMEOUT);
            state = SAFETY_PROTECTIVE_STOP;
        }

        // Obradi poruke sigurnosti od drugih servisa
        jezgro_msg_t msg;
        while (jezgro_receive_nonblock(JEZGRO_ANY, &msg) == JEZGRO_OK) {
            switch (msg.type) {
                case MSG_LIMIT_TRIGGERED:
                    handle_limit_trigger(&msg.payload.limits);
                    break;
                case MSG_COLLISION_DETECTED:
                    trigger_emergency_stop(COLLISION);
                    state = SAFETY_ESTOP;
                    break;
                case MSG_PEER_HEARTBEAT:
                    last_heartbeat[PEER_ROBOT] = now_ms();
                    break;
            }
        }

        // Objavi stanje sigurnosti
        publish_safety_state(state);

        // Pošalji naš heartbeat paru
        send_heartbeat_to_peer();

        jezgro_sleep(10);  // 100 Hz nadzor sigurnosti
    }
}
```

### 6.2 Kategorije Sigurnosti

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    KATEGORIJE SIGURNOSTI                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   KATEGORIJA 0: HITNO ZAUSTAVLJANJE (E-STOP)                                │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  Okidač:                                                         │       │
│   │  • Pritisnut crveni gumb za stop                                 │       │
│   │  • Detektovana kolizija                                          │       │
│   │  • Kritična greška                                               │       │
│   │                                                                  │       │
│   │  Odgovor:                                                        │       │
│   │  • Trenutni prekid napajanja svih motora                         │       │
│   │  • Kočnice se aktiviraju                                         │       │
│   │  • Zahteva ručni reset                                           │       │
│   │                                                                  │       │
│   │  Oporavak:                                                       │       │
│   │  • Otpusti E-stop dugme                                          │       │
│   │  • Pritisni dugme za reset                                       │       │
│   │  • Ponovo vrati robot u početnu poziciju                        │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   KATEGORIJA 1: ZAŠTITNO ZAUSTAVLJANJE                                      │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  Okidač:                                                         │       │
│   │  • Prekinuta svetlosna zavesa                                    │       │
│   │  • Timeout parskog robota                                        │       │
│   │  • Prekoračen soft limit                                         │       │
│   │                                                                  │       │
│   │  Odgovor:                                                        │       │
│   │  • Kontrolisano usporavanje                                      │       │
│   │  • Napajanje ostaje uključeno                                    │       │
│   │  • Moguće automatsko nastavljanje                                │       │
│   │                                                                  │       │
│   │  Oporavak:                                                       │       │
│   │  • Ukloni sigurnosni uslov                                       │       │
│   │  • Automatsko nastavljanje ili ručni okidač                      │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   KATEGORIJA 2: REDUKOVANI REŽIM                                            │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  Okidač:                                                         │       │
│   │  • Ulazak u kolaborativnu zonu (Robot B)                         │       │
│   │  • Kršenje nadzora brzine                                        │       │
│   │                                                                  │       │
│   │  Odgovor:                                                        │       │
│   │  • Smanjena brzina (maks 250 mm/s)                               │       │
│   │  • Smanjena sila (maks 150 N)                                    │       │
│   │  • Pojačan nadzor                                                │       │
│   │                                                                  │       │
│   │  Oporavak:                                                       │       │
│   │  • Automatski kada se zona oslobodi                              │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Detekcija Kolizije

Robot B (robot za module) podržava kolaborativni rad sa nadzorom sile:

```c
// Ograničenja sile/momenta za kolaborativni režim
const force_limits_t collab_limits = {
    .force_x = 150.0f,   // N
    .force_y = 150.0f,   // N
    .force_z = 150.0f,   // N
    .torque_x = 10.0f,   // Nm
    .torque_y = 10.0f,   // Nm
    .torque_z = 10.0f    // Nm
};

void check_collision(force_torque_t* ft, safety_state_t* state) {
    if (fabsf(ft->force_x) > collab_limits.force_x ||
        fabsf(ft->force_y) > collab_limits.force_y ||
        fabsf(ft->force_z) > collab_limits.force_z) {

        // Detektovana kolizija
        *state = SAFETY_COLLISION;
        trigger_protective_stop(COLLISION_FORCE);

        // Zabelezi događaj
        audit_log_event(EVENT_COLLISION, ft);
    }
}
```

### 6.4 Hardverska Arhitektura Sigurnosti

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HARDVERSKA ARHITEKTURA SIGURNOSTI                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    SIGURNOSNI PLC (Pilz PNOZ / Siemens F-CPU)        │   │
│   │                                                                      │   │
│   │   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐       │   │
│   │   │  E-Stop   │  │Svetlosne  │  │  Bravica  │  │  Enable   │       │   │
│   │   │  Kolo     │  │  Zavese   │  │  Vrata    │  │  Prekidač │       │   │
│   │   └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘       │   │
│   │         │              │              │              │              │   │
│   │         └──────────────┴──────────────┴──────────────┘              │   │
│   │                              │                                       │   │
│   │                     ┌────────▼────────┐                              │   │
│   │                     │ Sigurnosna      │                              │   │
│   │                     │ Logika          │                              │   │
│   │                     │ (SIL 2/PL d)    │                              │   │
│   │                     └────────┬────────┘                              │   │
│   │                              │                                       │   │
│   └──────────────────────────────┼───────────────────────────────────────┘   │
│                                  │                                           │
│              ┌───────────────────┼───────────────────┐                       │
│              │                   │                   │                       │
│       ┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐               │
│       │   STO       │     │   STO       │     │   STO       │               │
│       │ Robot A     │     │ Robot B     │     │ Aktuatori   │               │
│       │ Pogoni      │     │ Pogoni      │     │ Hvataljke   │               │
│       └─────────────┘     └─────────────┘     └─────────────┘               │
│                                                                              │
│   STO = Siguran Prekid Momenta (po IEC 62061)                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Servis Koordinacije Robota

### 7.1 Definicija Servisa

```c
JEZGRO_SERVICE_DEFINE(coordination,
    .priority = JEZGRO_PRIORITY_MEDIUM,
    .stack_size = 4096,
    .memory_size = 32768,
    .watchdog_ms = 100
);

void coordination_main(void) {
    coord_state_t state;
    peer_status_t peer;
    sync_point_t sync;

    coord_init(&state);

    while (1) {
        jezgro_watchdog_feed();

        // Razmeni status sa parskim robotom
        broadcast_my_status(&state);
        receive_peer_status(&peer);

        // Proveri tačke sinhronizacije
        if (state.current_phase != peer.current_phase) {
            // Nepodudaranje faza - čekaj sinhronizaciju
            if (is_sync_point(state.current_phase)) {
                wait_for_peer_sync(&peer, &sync);
            }
        }

        // Provera izbegavanja kolizije
        if (check_workspace_conflict(&state, &peer)) {
            // Reši konflikt na osnovu prioriteta
            resolve_workspace_conflict(&state, &peer);
        }

        // Obradi prelaze faza
        if (state.phase_complete && peer.phase_complete) {
            advance_to_next_phase(&state);
            notify_station_controller(state.current_phase);
        }

        jezgro_sleep(50);  // 20 Hz koordinacija
    }
}
```

### 7.2 Sekvenca Paralelne Zamene

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SEKVENCA PARALELNE ZAMENE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   FAZA   │  ROBOT A (Baterija)           │  ROBOT B (Modul)                 │
│   ───────┼──────────────────────────────┼────────────────────────────────── │
│          │                              │                                    │
│     1    │  ● Kretanje ka vozilu        │  ● Kretanje ka rek sistemu        │
│  (PRIPR.)│    približna pozicija        │    približna pozicija             │
│          │                              │                                    │
│     ──── │ ──────────── SINHRO ────────── │ ─────────────────────────────────│
│          │                              │                                    │
│     2    │  ● Poravnanje sa baterijom   │  ● Identifikacija ciljanog modula │
│  (PORAV.)│  ● Korekcija vizijom         │  ● Pozicioniranje kod slota       │
│          │                              │                                    │
│     ──── │ ──────────── SINHRO ────────── │ ─────────────────────────────────│
│          │                              │                                    │
│     3    │  ● Aktiviranje hvataljke     │  ● Aktiviranje hvataljke          │
│ (HVATAN.)│  ● Verifikacija sile hvata   │  ● Verifikacija sile hvata        │
│          │                              │                                    │
│     ──── │ ──────────── SINHRO ────────── │ ─────────────────────────────────│
│          │                              │                                    │
│     4    │  ● Otključavanje baterije    │  ● Isključivanje modula           │
│ (OTKLJUČ)│  ● Čekanje na potvrdu        │  ● (napajanje već isključeno)     │
│          │                              │                                    │
│     ──── │ ──────────── SINHRO ────────── │ ─────────────────────────────────│
│          │                              │                                    │
│     5    │  ● Vađenje baterije          │  ● Vađenje modula                 │
│(VAĐENJE) │  ● Kretanje ka skladištu     │  ● Kretanje ka skladištu          │
│          │                              │                                    │
│     ──── │ ──────────── SINHRO ────────── │ ─────────────────────────────────│
│          │                              │                                    │
│     6    │  ● Odlaganje u skladište     │  ● Odlaganje u skladište          │
│(ODLAGAN.)│  ● Kretanje ka novoj bat.    │  ● Kretanje ka novom modulu       │
│          │                              │                                    │
│     ──── │ ──────────── SINHRO ────────── │ ─────────────────────────────────│
│          │                              │                                    │
│     7    │  ● Uzimanje nove baterije    │  ● Uzimanje novog modula          │
│(UZIMANJE)│  ● Kretanje ka vozilu        │  ● Kretanje ka rek sistemu        │
│          │                              │                                    │
│     ──── │ ──────────── SINHRO ────────── │ ─────────────────────────────────│
│          │                              │                                    │
│     8    │  ● Umetanje baterije         │  ● Umetanje modula                │
│(UMETAN.) │  ● Zaključavanje             │  ● Povezivanje (automatsko)       │
│          │                              │                                    │
│     ──── │ ──────────── SINHRO ────────── │ ─────────────────────────────────│
│          │                              │                                    │
│     9    │  ● Otpuštanje hvataljke      │  ● Otpuštanje hvataljke           │
│(OTPUŠT.) │  ● Verifikacija nameštanja   │  ● Verifikacija da je modul online│
│          │                              │                                    │
│     ──── │ ──────────── SINHRO ────────── │ ─────────────────────────────────│
│          │                              │                                    │
│    10    │  ● Povratak u početnu poz.   │  ● Povratak u početnu poz.        │
│  (HOME)  │  ● Prijava završetka         │  ● Prijava završetka              │
│          │                              │                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Protokol Sinhronizacije

```c
typedef enum {
    PHASE_IDLE = 0,
    PHASE_PREP,
    PHASE_ALIGN,
    PHASE_GRIP,
    PHASE_UNLOCK,
    PHASE_EXTRACT,
    PHASE_DEPOSIT,
    PHASE_PICK,
    PHASE_INSERT,
    PHASE_RELEASE,
    PHASE_HOME,
    PHASE_COMPLETE
} swap_phase_t;

// Poruka sinhronizacije na CAN-FD
typedef struct {
    uint8_t robot_id;          // 0 = A, 1 = B
    uint8_t current_phase;     // swap_phase_t
    uint8_t phase_complete;    // 1 = spreman za sledeću
    uint8_t fault_code;        // 0 = OK
    float position[6];         // Trenutna TCP pozicija
    uint32_t timestamp;
} sync_message_t;

// Čekaj da par stigne na istu fazu
void wait_for_peer_sync(peer_status_t* peer, sync_point_t* sync) {
    uint32_t timeout = now_ms() + SYNC_TIMEOUT_MS;

    while (peer->current_phase < my_phase &&
           peer->fault_code == 0 &&
           now_ms() < timeout) {

        // Nastavi razmenu statusa
        broadcast_my_status(&my_state);
        receive_peer_status(peer);

        jezgro_sleep(10);
    }

    if (peer->fault_code != 0) {
        handle_peer_fault(peer->fault_code);
    } else if (now_ms() >= timeout) {
        handle_sync_timeout();
    }

    sync->synced = true;
    sync->timestamp = now_ms();
}
```

### 7.4 Rešavanje Konflikta Radnog Prostora

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ZONE RADNOG PROSTORA                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                      │   │
│   │   ┌───────────────────┐  DELJENA  ┌───────────────────┐             │   │
│   │   │                   │   ZONA    │                   │             │   │
│   │   │   ROBOT A         │           │   ROBOT B         │             │   │
│   │   │   EKSKLUZIVNA     │ ╔═══════╗ │   EKSKLUZIVNA     │             │   │
│   │   │   ZONA            │ ║       ║ │   ZONA            │             │   │
│   │   │                   │ ║ MUTEX ║ │                   │             │   │
│   │   │   (Skladište      │ ║       ║ │   (REK sistem     │             │   │
│   │   │    baterija)      │ ╚═══════╝ │    modula)        │             │   │
│   │   │                   │           │                   │             │   │
│   │   └───────────────────┘           └───────────────────┘             │   │
│   │                                                                      │   │
│   │   ════════════════════ TRAKA ZA AUTOBUS ═══════════════════════     │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   Rešavanje Konflikta:                                                      │
│   1. Robot sa prioritetom trenutne faze dobija pristup                      │
│   2. Ako je ista faza, Robot A ima prioritet (teži teret)                  │
│   3. Ako postoji konflikt, sporiji robot pauzira na granici zone            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

```c
bool check_workspace_conflict(coord_state_t* my_state, peer_status_t* peer) {
    // Proveri da li oba robota ulaze u deljenu zonu
    if (is_in_shared_zone(my_state->position) &&
        is_in_shared_zone(peer->position)) {
        return true;
    }

    // Proveri presek trajektorija
    if (trajectories_intersect(my_state->trajectory, peer->trajectory)) {
        return true;
    }

    return false;
}

void resolve_workspace_conflict(coord_state_t* my_state, peer_status_t* peer) {
    // Odredi prioritet
    int my_priority = get_phase_priority(my_state->current_phase);
    int peer_priority = get_phase_priority(peer->current_phase);

    if (my_priority > peer_priority) {
        // Ja imam prioritet, nastavi
        return;
    } else if (my_priority < peer_priority) {
        // Par ima prioritet, pauziraj
        pause_at_zone_boundary();
    } else {
        // Isti prioritet, Robot A pobeđuje
        if (MY_ROBOT_ID == ROBOT_A) {
            return;
        } else {
            pause_at_zone_boundary();
        }
    }
}
```

### 7.5 CAN Protokol za Koordinaciju Robota

| ID Poruke | Naziv | Frekvencija | Sadržaj |
|-----------|-------|-------------|---------|
| 0x500 | ROBOT_STATUS | 20 Hz | Faza, pozicija, brzina, greške |
| 0x510 | ROBOT_SYNC | Na zahtev | Zahtev/potvrda sinhronizacije |
| 0x520 | ROBOT_HEARTBEAT | 10 Hz | Signal života + vremenski pečat |
| 0x530 | ROBOT_COMMAND | Na zahtev | Napredovanje faze, prekid, reset |
| 0x540 | GRIPPER_STATUS | 10 Hz | Sila hvata, pozicija, angažovan |

---

## 8. Servis Kontrole Hvataljke

### 8.1 Definicija Servisa

```c
JEZGRO_SERVICE_DEFINE(gripper_ctrl,
    .priority = JEZGRO_PRIORITY_HIGH,
    .stack_size = 4096,
    .memory_size = 16384,
    .watchdog_ms = 50
);

void gripper_ctrl_main(void) {
    gripper_state_t state;

    gripper_init(&state);

    while (1) {
        jezgro_watchdog_feed();

        // Obradi komande
        jezgro_msg_t msg;
        if (jezgro_receive(JEZGRO_ANY, &msg, 20) == JEZGRO_OK) {
            switch (msg.type) {
                case MSG_GRIPPER_OPEN:
                    gripper_open(&state);
                    break;
                case MSG_GRIPPER_CLOSE:
                    gripper_close(&state, msg.payload.target_force);
                    break;
                case MSG_GRIPPER_POSITION:
                    gripper_move_to(&state, msg.payload.position);
                    break;
            }
        }

        // Nadgledaj silu hvata
        float current_force = read_grip_force();
        if (state.engaged && current_force < MIN_GRIP_FORCE) {
            // Hvataljka klizi!
            jezgro_msg_t alert = {
                .type = MSG_GRIP_SLIP_ALERT,
                .payload.force = current_force
            };
            jezgro_send_priority(SVC_SAFETY_MONITOR, &alert);
        }

        // Objavi stanje hvataljke
        publish_gripper_state(&state, current_force);
    }
}
```

### 8.2 Specifikacije Hvataljke

| Parametar | Robot A (Baterija) | Robot B (Modul) |
|-----------|-------------------|------------------|
| Tip | Viljuškasta + stezaljka | Paralelne čeljusti |
| Opseg hvata | Fiksno + podešavanje | 50-250 mm |
| Sila hvata | 5000 N maks | 500 N maks |
| Senzor pozicije | Linearni enkoder | Linearni enkoder |
| Senzor sile | Ćelija opterećenja | Merna traka |
| Aktuator | Hidraulični | Električni servo |

### 8.3 Hvataljka za Baterije (Robot A)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HVATALJKA ZA BATERIJE (Robot A)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Pogled odozgo:                                                             │
│   ┌─────────────────────────────────────────────────────────┐               │
│   │                                                          │               │
│   │   ┌──────────┐                    ┌──────────┐          │               │
│   │   │ STEZALJKA│                    │ STEZALJKA│          │               │
│   │   │   LEVA   │    ┌──────────┐   │  DESNA   │          │               │
│   │   │          │    │ BATERIJ- │   │          │          │               │
│   │   │    ◄─────┼────┤    SKI   ├───┼─────►    │          │               │
│   │   │          │    │  MODUL   │   │          │          │               │
│   │   └──────────┘    └──────────┘   └──────────┘          │               │
│   │                                                          │               │
│   │   ════════════ ZUPCI VILJUŠKE ════════════              │               │
│   │                                                          │               │
│   └─────────────────────────────────────────────────────────┘               │
│                                                                              │
│   Pogled sa strane:                                                         │
│   ┌─────────────────────────────────────────────────────────┐               │
│   │         │                │                               │               │
│   │   RUKA  │   ┌────────────┤                               │               │
│   │    ↓    │   │  STEZALJKA │                               │               │
│   │    ║    │   │            ▼                               │               │
│   │    ║    │   │     ┌──────────────┐                      │               │
│   │    ║════╪═══│     │  BATERIJSKI │                      │               │
│   │         │   │     │    MODUL    │                      │               │
│   │   ZUPCI │   │     └──────────────┘                      │               │
│   │ VILJUŠKE│   │                                            │               │
│   └─────────────────────────────────────────────────────────┘               │
│                                                                              │
│   Sekvenca Hvatanja:                                                        │
│   1. Pozicioniraj zupce ispod baterije                                      │
│   2. Podigni zupce do kontakta sa dnom                                      │
│   3. Zatvori stezaljke sa strana                                            │
│   4. Verifikuj silu hvata (ćelije opterećenja na stezaljkama)               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.4 Hvataljka za Module (Robot B)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HVATALJKA ZA MODULE (Robot B)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────┐               │
│   │                                                          │               │
│   │        ┌─────────────┐       ┌─────────────┐            │               │
│   │        │    PRST     │       │    PRST     │            │               │
│   │        │    LEVI     │       │   DESNI     │            │               │
│   │        │             │       │             │            │               │
│   │        │    ├───►    │       │   ◄───┤    │            │               │
│   │        │    │        │       │        │    │            │               │
│   │        │    │   ┌────┴───────┴────┐   │    │            │               │
│   │        │    │   │                  │   │    │            │               │
│   │        │    │   │    EK3 MODUL    │   │    │            │               │
│   │        │    │   │                  │   │    │            │               │
│   │        │    │   │   ●          ●  │   │    │            │               │
│   │        │    │   │  tačke hvata   │   │    │            │               │
│   │        │    │   └──────────────────┘   │    │            │               │
│   │        │    │                          │    │            │               │
│   │        └────┴──────────────────────────┴────┘            │               │
│   │                                                          │               │
│   └─────────────────────────────────────────────────────────┘               │
│                                                                              │
│   Tačke Hvata: M8 navojni umeci, razmak 200 mm (EK3 spec)                   │
│   Sila Hvata: 100-500 N podesivo                                            │
│   Preciznost: ±0.5 mm pozicioniranje                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Integracija sa Stanicom

### 9.1 Arhitektura Komunikacije

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INTEGRACIJA SA STANICOM                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    KONTROLER STANICE (Linux)                         │   │
│   │                                                                      │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │   │
│   │   │  ORKESTRA-  │  │  INTERFEJS  │  │  INVENTAR   │                │   │
│   │   │  TOR ZAMENE │  │   VOZILA    │  │   MODULA    │                │   │
│   │   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                │   │
│   │          │                │                │                        │   │
│   └──────────┼────────────────┼────────────────┼────────────────────────┘   │
│              │                │                │                             │
│              │ CAN-FD         │ CAN-FD         │ CAN-FD                      │
│              │                │                │                             │
│   ┌──────────▼──────────┬─────▼────────┬───────▼─────────┐                  │
│   │                     │              │                  │                  │
│   │   ROBOT A           │   ROBOT B    │   EK3 REK       │                  │
│   │   (JEZGRO-ROB)      │  (JEZGRO-ROB)│   (JEZGRO)      │                  │
│   │                     │              │                  │                  │
│   └─────────────────────┴──────────────┴──────────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Poruke Orkestracije Zamene

| Poruka | Smer | Sadržaj |
|--------|------|---------|
| `SWAP_START` | Kontroler → Roboti | Slot baterije, slot modula, ID vozila |
| `SWAP_PHASE` | Roboti → Kontroler | Trenutna faza, napredak, procenjeno vreme |
| `SWAP_COMPLETE` | Roboti → Kontroler | Uspeh/neuspeh, trajanje |
| `SWAP_ABORT` | Kontroler → Roboti | Razlog prekida, komanda sigurnog zaustavljanja |
| `ROBOT_READY` | Roboti → Kontroler | Robot spreman za zamenu |
| `ROBOT_FAULT` | Roboti → Kontroler | Kod greške, opis |

### 9.3 Vremena Sekvence Zamene

| Faza | Vreme Robot A | Vreme Robot B | Ukupno |
|------|---------------|---------------|--------|
| PRIPREMA | 5 s | 3 s | 5 s (paralelno) |
| PORAVNANJE | 8 s | 3 s | 8 s (paralelno) |
| HVATANJE | 3 s | 2 s | 3 s (paralelno) |
| OTKLJUČAVANJE | 2 s | 1 s | 2 s (paralelno) |
| VAĐENJE | 10 s | 5 s | 10 s (paralelno) |
| ODLAGANJE | 5 s | 3 s | 5 s (paralelno) |
| UZIMANJE | 8 s | 4 s | 8 s (paralelno) |
| UMETANJE | 15 s | 6 s | 15 s (paralelno) |
| OTPUŠTANJE | 3 s | 2 s | 3 s (paralelno) |
| POČETNA POZ. | 5 s | 4 s | 5 s (paralelno) |
| **Ukupno** | **64 s** | **33 s** | **~65 s** |

Napomena: Robot B završava brže ali čeka na tačke sinhronizacije sa Robotom A.

---

## 10. Testiranje i Validacija

### 10.1 Testovi na Nivou Servisa

| Test | Svrha | Metod |
|------|-------|-------|
| Vreme MOTION_CTRL petlje | Verifikacija 1 kHz petlje | Logički analizator na GPIO |
| Tačnost kinematike | Verifikacija TCP pozicioniranja | Laserski tracker merenje |
| Latencija SAFETY_MONITOR | Verifikacija <20 ms odziva | E-stop okidanje do isključenja motora |
| Sinhronizacija COORDINATION | Verifikacija vremena sinhronizacije | Analiza logova |
| Restart servisa | Verifikacija <50 ms oporavka | Ubacivanje greške |

### 10.2 Integracioni Testovi

| Test | Svrha | Kriterijum Prolaza |
|------|-------|---------------------|
| Zamena dva robota | Kompletna sekvenca zamene | Završetak za <90 s |
| Oporavak od greške | Rukovanje greškom robota | Sigurno zaustavljanje, nastavljanje |
| Konflikt radnog prostora | Izbegavanje kolizije | Bez kontakta |
| Gubitak komunikacije | Rukovanje CAN timeout-om | Zaštitno zaustavljanje |

### 10.3 Testovi Sertifikacije Sigurnosti

| Test | Standard | Kriterijum |
|------|----------|------------|
| Odziv E-stop | ISO 13849 | <500 ms |
| Svetlosna zavesa | IEC 61496 | <100 ms |
| Ograničenje sile | ISO 10218-1 | <150 N (Robot B) |
| Nadzor brzine | ISO 10218-1 | <250 mm/s u redukovanom režimu |

---

## 11. Unakrsne Reference

| Dokument | Relacija |
|----------|----------|
| `tehnika/inzenjersko/sr/21-jezgro-product-family.md` | JEZGRO familija proizvoda |
| `tehnika/inzenjersko/sr/16-jezgro.md` | Osnovna JEZGRO specifikacija |
| `tehnika/inzenjersko/sr/05-swap-station.md` | Koncept stanice za zamenu |
| `patent/03-TECHNICAL-SUPPORT/CONTROL-SYSTEM-ARCHITECTURE.md` | Kontrolna hijerarhija |
| `tehnika/inzenjersko/sr/22-jezgro-bat.md` | Baterijski BMS za zamenu |

---

## Istorija Izmena

| Datum | Verzija | Opis |
|-------|---------|------|
| 2026-01-04 | 1.0 | Početna JEZGRO-ROB specifikacija |
