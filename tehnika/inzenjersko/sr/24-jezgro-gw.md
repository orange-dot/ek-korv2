# JEZGRO-GW: Firmver za kapije i protokol adaptere

**Verzija:** 1.0
**Datum:** 2026-01-04
**Status:** SPECIFIKACIJA

---

## Namena dokumenta

Ovaj dokument specificira **JEZGRO-GW**, varijantu JEZGRO mikrokernela za protokol kapije i V2G adaptere. JEZGRO-GW pruža tolerantnu sinhronizaciju sa mrežom, dvosmerno upravljanje snagom i prevođenje protokola za integraciju različitih uređaja u ELEKTROKOMBINACIJA ekosistem.

---

## 1. Pregled

### 1.1 Zahtevi za kapije

Protokol kapije premošćuju različite sisteme i standarde:

| Tip kapije | Primarna funkcija | Složenost |
|------------|-------------------|-----------|
| **EK-ADAPT-V2G** | Ne-EK vozila → V2G mreža | Visoka (pun V2G stek) |
| **EK-ADAPT-BUS** | Retrofit nasleđenih autobusa | Srednja (prevođenje protokola) |
| **EK-ADAPT-CCS** | CCS Combo ka EK mostu | Visoka (ISO 15118 + SLAC) |
| **EK-ADAPT-MCS** | Megavatno punjenje adapter | Visoka (MCS + CharIN protokol) |
| **EK-ADAPT-OCPP** | Kapija za treće strane punjača | Srednja (OCPP 2.0.1) |

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ARHITEKTURA JEZGRO-GW KAPIJE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   SPOLJNI SVET                            ELEKTROKOMBINACIJA EKOSISTEM       │
│                                                                              │
│   ┌─────────────┐      ┌─────────────────────────┐      ┌─────────────┐     │
│   │ Treća strana│      │      JEZGRO-GW          │      │   EK3       │     │
│   │ EV          │◄────►│  ┌─────────────────┐   │◄────►│   Moduli    │     │
│   │ (ne-EK)     │      │  │ Protokol stek   │   │      │             │     │
│   └─────────────┘      │  │ ┌─────┐ ┌─────┐ │   │      └─────────────┘     │
│                        │  │ │ISO  │ │CAN  │ │   │                          │
│   ┌─────────────┐      │  │ │15118│ │-FD  │ │   │      ┌─────────────┐     │
│   │ Mrežna      │◄────►│  │ └─────┘ └─────┘ │   │◄────►│   Stanica   │     │
│   │ konekcija   │      │  └─────────────────┘   │      │   Kontroler │     │
│   └─────────────┘      │                        │      └─────────────┘     │
│                        │  ┌─────────────────┐   │                          │
│   ┌─────────────┐      │  │ V2G upravljanje │   │      ┌─────────────┐     │
│   │ Oblak       │◄────►│  │ ┌─────┐ ┌─────┐ │   │◄────►│   Upravljanje│    │
│   │ (OCPP)      │      │  │ │PLL  │ │Droop│ │   │      │   flotom    │     │
│   └─────────────┘      │  │ └─────┘ └─────┘ │   │      └─────────────┘     │
│                        │  └─────────────────┘   │                          │
│                        └─────────────────────────┘                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Zašto JEZGRO za kapije?

Kapije rukuju sa više istovremenih protokola sa zahtevima u realnom vremenu:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PREDNOSTI JEZGRO-GW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   TRADICIONALNA KAPIJA               JEZGRO-GW                               │
│   ──────────────────────            ──────────                               │
│   ┌─────────────────────┐          ┌─────────────────────┐                  │
│   │ Monolitni           │          │ Izolovani servisi   │                  │
│   │ Rukovalac protokola │          │ ┌─────┐ ┌─────┐    │                  │
│   │                     │          │ │PLL  │ │ISO  │    │                  │
│   │ ISO 15118 bug =     │          │ │SYNC │ │15118│    │                  │
│   │ Totalni pad sistema │          │ └──┬──┘ └──┬──┘    │                  │
│   │                     │          │    │       │       │                  │
│   │ Mrežna sync izgubljena│        │ ┌──┴───────┴──┐    │                  │
│   │                     │          │ │   KERNEL    │    │                  │
│   └─────────────────────┘          │ │ (restartuje │    │                  │
│                                    │ │  servise)   │    │                  │
│                                    │ └─────────────┘    │                  │
│                                    │                    │                  │
│                                    │ ISO 15118 pad =    │                  │
│                                    │ Restart servisa    │                  │
│                                    │ Mrežna sync očuvana│                  │
│                                    └────────────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Prednost | Opis |
|----------|------|
| **Izolacija protokola** | Pad ISO 15118 ne utiče na mrežnu sinhronizaciju |
| **Garancije realnog vremena** | PLL radi sa CRITICAL prioritetom, uvek raspoređen |
| **Graciozna degradacija** | Gubitak komunikacije → povratak na lokalno upravljanje |
| **Automatski oporavak** | Restart protokol steka za <100ms |
| **Unificirana platforma** | Isti JEZGRO na svim adapterima |

### 1.3 Izbor hardvera

JEZGRO-GW koristi STM32H743 za računarski prostor:

| Parametar | STM32G474 | STM32H743 (GW) | Razlog |
|-----------|-----------|----------------|--------|
| Jezgro | Cortex-M4 @ 170 MHz | Cortex-M7 @ 480 MHz | Protokol stekovi |
| Flash | 512 KB | 2 MB | Veliki stekovi |
| RAM | 128 KB | 1 MB | Baferi, TLS |
| FPU | Jednostruka preciznost | Dvostruka preciznost | Matematika upravljanja |
| Ethernet | Ne | Da (MAC) | OCPP, ISO 15118 |
| USB | USB FS | USB HS + OTG | ISO 15118-3 |
| CAN-FD | 3 | 2 | Interni CAN |
| Cena | ~8$ | ~15$ | Vredi |

**Zašto H743 za kapije:**
- 1 MB RAM za TLS bafere i mašine stanja protokola
- Ethernet MAC za OCPP i ISO 15118-20 komunikaciju
- USB High-Speed za PLC (Power Line Communication) modem
- Više flash-a za velike protokol stekove
- Hardverska kripto akceleracija (AES, SHA)

---

## 2. Arhitektura

### 2.1 Konfiguracija servisa (V2G kapija)

| ID | Servis | Prioritet | Stek | Memorija | Watchdog | Namena |
|----|--------|-----------|------|----------|----------|--------|
| 0 | KERNEL | - | 4 KB | 16 KB | - | Jezgro (privilegovano) |
| 1 | PLL_SYNC | CRITICAL | 4 KB | 16 KB | 10 ms | Mrežna sinhronizacija |
| 2 | CURRENT_CTRL | CRITICAL | 4 KB | 32 KB | 100 µs | dq-okvir upravljanje strujom |
| 3 | DROOP_CTRL | HIGH | 4 KB | 16 KB | 10 ms | P(f), Q(V) droop |
| 4 | POWER_MGR | HIGH | 4 KB | 16 KB | 50 ms | Koordinacija toka snage |
| 5 | ISO15118 | MEDIUM | 16 KB | 128 KB | 1000 ms | V2G protokol stek |
| 6 | SLAC | MEDIUM | 8 KB | 32 KB | 500 ms | Signal Level Attenuation |
| 7 | OCPP_CLIENT | LOW | 8 KB | 64 KB | 5000 ms | Backend komunikacija |
| 8 | CAN_HANDLER | HIGH | 4 KB | 16 KB | 100 ms | Interni CAN-FD |
| 9 | AUDIT_LOGGER | LOW | 4 KB | 32 KB | 2000 ms | Beleženje događaja |

**Ukupno RAM:** ~368 KB od 1 MB dostupno

### 2.2 Konfiguracija servisa (Protokol most)

Za jednostavnije protokol mostove (npr. OCPP kapija):

| ID | Servis | Prioritet | Stek | Memorija | Watchdog | Namena |
|----|--------|-----------|------|----------|----------|--------|
| 0 | KERNEL | - | 4 KB | 16 KB | - | Jezgro (privilegovano) |
| 1 | PROTOCOL_A | MEDIUM | 8 KB | 64 KB | 1000 ms | Izvorni protokol |
| 2 | PROTOCOL_B | MEDIUM | 8 KB | 64 KB | 1000 ms | Ciljni protokol |
| 3 | TRANSLATOR | HIGH | 4 KB | 32 KB | 100 ms | Prevođenje poruka |
| 4 | CAN_HANDLER | HIGH | 4 KB | 16 KB | 100 ms | Interni CAN-FD |
| 5 | ETHERNET | MEDIUM | 4 KB | 32 KB | 500 ms | Mrežni stek |
| 6 | AUDIT_LOGGER | LOW | 4 KB | 32 KB | 2000 ms | Beleženje događaja |

**Ukupno RAM:** ~256 KB od 1 MB dostupno

### 2.3 Mapa memorije

```
┌─────────────────────────────────────────────────┐  0x240FFFFF (1 MB)
│                                                 │
│        ISO15118 memorija (128 KB)               │
│        (V2G poruke, mašina stanja)              │
├─────────────────────────────────────────────────┤  0x240E0000
│        OCPP_CLIENT memorija (64 KB)             │
│        (JSON baferi, WebSocket)                 │
├─────────────────────────────────────────────────┤  0x240D0000
│        SLAC memorija (32 KB)                    │
│        (PLC modem interfejs)                    │
├─────────────────────────────────────────────────┤  0x240C8000
│        CURRENT_CTRL memorija (32 KB)            │
│        (PID stanje, istorija merenja)           │
├─────────────────────────────────────────────────┤  0x240C0000
│        DROOP_CTRL memorija (16 KB)              │
│        (Droop parametri, stanje rampe)          │
├─────────────────────────────────────────────────┤  0x240BC000
│        PLL_SYNC memorija (16 KB)                │
│        (PLL stanje, koeficijenti filtera)       │
├─────────────────────────────────────────────────┤  0x240B8000
│        Ostali servisi (64 KB)                   │
│        (POWER_MGR, CAN, AUDIT)                  │
├─────────────────────────────────────────────────┤  0x240A8000
│        IPC bafer poruka (32 KB)                 │
│        512 poruka × 64 bajta                    │
├─────────────────────────────────────────────────┤  0x240A0000
│        TLS baferi (64 KB)                       │
│        (Sigurna komunikacija)                   │
├─────────────────────────────────────────────────┤  0x24090000
│        Ethernet baferi (64 KB)                  │
│        (DMA, TX/RX prstenovi)                   │
├─────────────────────────────────────────────────┤  0x24080000
│        Stekovi servisa (64 KB)                  │
│        (8 KB × 8 servisa)                       │
├─────────────────────────────────────────────────┤  0x24070000
│        Rezervisano (448 KB)                     │
│        (buduće proširenje)                      │
├─────────────────────────────────────────────────┤  0x24000000
│        D1 domen RAM (128 KB)                    │
│        Kernel + TCM pristup                     │
└─────────────────────────────────────────────────┘  0x20000000
```

### 2.4 Hardverski interfejs

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    JEZGRO-GW HARDVER (V2G kapija)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        STM32H743 MCU                                 │   │
│   │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │   │
│   │  │ TIM1-2 │ │  ADC   │ │ CAN-FD │ │  ETH   │ │  USB   │ │ CRYP   │ │   │
│   │  │(PWM/Cap)│ │(V,I)   │ │(Interni)│ │(OCPP) │ │(PLC)   │ │(TLS)   │ │   │
│   │  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ │   │
│   └──────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┘   │
│          │          │          │          │          │          │           │
│          ▼          ▼          ▼          ▼          ▼          ▼           │
│   ┌──────────┐ ┌─────────┐ ┌───────┐ ┌─────────┐ ┌───────┐ ┌──────────┐    │
│   │ Invertor │ │ Napon   │ │Stanica│ │ Mrežni  │ │ PLC   │ │ Sigurni  │    │
│   │ most     │ │ struja  │ │ Ctrl  │ │ svič    │ │ modem │ │ element  │    │
│   │          │ │ senzori │ │       │ │         │ │(HomePlug)│          │    │
│   └──────────┘ └─────────┘ └───────┘ └─────────┘ └───────┘ └──────────┘    │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                       SPOLJNI INTERFEJSI                             │   │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│   │  │  Mreža     │  │  Vozilo    │  │  Pilot     │  │  Proximity │    │   │
│   │  │  3-fazna   │  │  konektor  │  │  Kontrola  │  │  detekcija │    │   │
│   │  │  AC/DC     │  │  (CCS)     │  │  (PWM)     │  │            │    │   │
│   └──┴────────────┴──┴────────────┴──┴────────────┴──┴────────────┴────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Servis PLL sinhronizacije

### 3.1 Definicija servisa

```c
JEZGRO_SERVICE_DEFINE(pll_sync,
    .priority = JEZGRO_PRIORITY_CRITICAL,
    .stack_size = 4096,
    .memory_size = 16384,
    .watchdog_ms = 10
);

void pll_sync_main(void) {
    PLL_State pll;

    PLL_Init(&pll);

    // Konfiguriši ADC za uzorkovanje mrežnog napona (10 kHz)
    adc_configure_grid_voltage(10000);

    while (1) {
        jezgro_watchdog_feed();

        // Čekaj na završetak ADC konverzije
        adc_wait_conversion();

        // Očitaj mrežne napone
        float Va = adc_read_voltage(CH_VA);
        float Vb = adc_read_voltage(CH_VB);
        float Vc = adc_read_voltage(CH_VC);

        // Ažuriraj PLL
        PLL_Update(&pll, Va, Vb, Vc, TS_PLL);

        // Objavi PLL stanje drugim servisima
        publish_pll_state(&pll);

        // Proveri gubitak mreže
        if (!pll.locked) {
            jezgro_msg_t msg = {
                .type = MSG_GRID_UNLOCKED,
                .payload.voltage = PLL_GetVoltage(&pll)
            };
            jezgro_send_priority(SVC_POWER_MGR, &msg);
        }
    }
}
```

### 3.2 SRF-PLL implementacija

Synchronous Reference Frame PLL prati fazu i frekvenciju mreže:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STRUKTURA SRF-PLL                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Mrežni naponi                                                              │
│   Va,Vb,Vc ──► [Clarke] ──► Vα,Vβ ──► [Park(θ)] ──► Vd,Vq                   │
│                                            ▲                │               │
│                                            │                │               │
│                                            │                ▼               │
│                                            │         ┌─────────────┐        │
│                                            │         │     PI      │        │
│                                            │         │  Kontroler  │        │
│                                            │         └──────┬──────┘        │
│                                            │                │ Δω            │
│                                            │                ▼               │
│                                            │         ┌─────────────┐        │
│                                            │         │    + ω_nom  │        │
│                                            │         └──────┬──────┘        │
│                                            │                │ ω             │
│                                            │                ▼               │
│                                            │         ┌─────────────┐        │
│                                            │         │  Integrator │        │
│                                            │         └──────┬──────┘        │
│                                            │                │ θ             │
│                                            └────────────────┘               │
│                                                                              │
│   Kada je zaključan: Vq ≈ 0, Vd = amplituda mrežnog napona                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Specifikacije performansi PLL

| Parametar | Vrednost | Napomene |
|-----------|----------|----------|
| Vreme smirivanja | < 50 ms | Za korak frekvencije od 5% |
| Greška u ustaljenom stanju | < 0.01 Hz | Pri stabilnoj mreži |
| Greška faze | < 1° | Nakon smirivanja |
| Propusni opseg | ~20 Hz | Kompromis šum vs brzina |
| Učestanost uzorkovanja | 10 kHz | Usklađeno sa upravljačkom petljom |
| Detekcija zaključavanja | 100 ms | Vq < 5% od Vd |

### 3.4 Usklađenost sa mrežnim kodovima

| Parametar | ENTSO-E | VDE AR-N 4110 | EirGrid |
|-----------|---------|---------------|---------|
| Opseg frekvencije | 47.5-51.5 Hz | 47.5-51.5 Hz | 47.0-52.0 Hz |
| Opseg napona | 0.85-1.10 pu | 0.90-1.10 pu | 0.90-1.10 pu |
| Vreme odziva | < 2 s | < 1 s | < 1 s |
| ROCOF tolerancija | 2 Hz/s | 2 Hz/s | 1 Hz/s |

---

## 4. Servis kontrolera struje

### 4.1 Definicija servisa

```c
JEZGRO_SERVICE_DEFINE(current_ctrl,
    .priority = JEZGRO_PRIORITY_CRITICAL,
    .stack_size = 4096,
    .memory_size = 32768,
    .watchdog_ms = 1  // 100 µs efektivno preko tajmera
);

void current_ctrl_main(void) {
    CurrentController_State cc;

    CurrentController_Init(&cc, L_FILTER, R_FILTER, V_DC_NOM);

    // Konfiguriši brzi tajmer za 10 kHz upravljačku petlju
    jezgro_timer_start(TIMER_CURRENT_LOOP, 10000);

    while (1) {
        jezgro_watchdog_feed();

        // Čekaj na takt upravljačke petlje
        jezgro_timer_wait(TIMER_CURRENT_LOOP);

        // Dobij PLL stanje (iz deljene memorije)
        PLL_State* pll = get_pll_state();

        // Dobij reference snage (od DROOP_CTRL)
        float P_ref = get_power_reference();
        float Q_ref = get_reactive_reference();

        // Izračunaj reference struje
        float Vd = pll->Vd;
        float id_ref = P_ref / (1.5f * Vd);
        float iq_ref = Q_ref / (1.5f * Vd);

        // Očitaj stvarne struje
        float Ia = adc_read_current(CH_IA);
        float Ib = adc_read_current(CH_IB);
        float Ic = adc_read_current(CH_IC);

        // Transformiši u dq okvir
        float id_meas, iq_meas;
        abc_to_dq(Ia, Ib, Ic, pll->theta, &id_meas, &iq_meas);

        // Pokreni kontroler struje
        float Vd_ref, Vq_ref;
        CurrentController_Update(&cc,
                                 id_ref, iq_ref,
                                 id_meas, iq_meas,
                                 pll->Vd, pll->Vq,
                                 pll->omega,
                                 &Vd_ref, &Vq_ref,
                                 TS_CURRENT);

        // Generiši PWM
        float duty_a, duty_b, duty_c;
        dq_to_pwm(Vd_ref, Vq_ref, pll->theta, V_DC,
                  &duty_a, &duty_b, &duty_c);

        pwm_update(duty_a, duty_b, duty_c);

        // Objavi stvarnu snagu
        float P_actual = 1.5f * Vd * id_meas;
        float Q_actual = 1.5f * Vd * iq_meas;
        publish_power(P_actual, Q_actual);
    }
}
```

### 4.2 Struktura razdvojenog upravljanja

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    dq KONTROLER STRUJE                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   P_ref ──► [÷1.5Vd] ──► id_ref ──►[─]──► [PI] ──► Vd_pi ──►[+]──► Vd_ref  │
│                             ▲       │                         ▲   │         │
│                        id_meas     │                         │   │         │
│                                    │                    Vd_mreža  │         │
│                                    │                             │         │
│                                    └──► (-ωL×iq) ────────────────┘         │
│                                              │                              │
│                                     Razdvojni član                          │
│                                                                              │
│   Q_ref ──► [÷1.5Vd] ──► iq_ref ──►[─]──► [PI] ──► Vq_pi ──►[+]──► Vq_ref  │
│                             ▲       │                         ▲   │         │
│                        iq_meas     │                         │   │         │
│                                    │                    Vq_mreža  │         │
│                                    │                             │         │
│                                    └──► (+ωL×id) ────────────────┘         │
│                                                                              │
│   Vd_ref, Vq_ref ──► [Inverzni Park] ──► [SVPWM] ──► Invertor               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Parametri podešavanja PI

| Parametar | Vrednost | Izvođenje |
|-----------|----------|-----------|
| Propusni opseg (ωc) | 2π × 1000 rad/s | 1 kHz propusni opseg upravljanja |
| Prigušenje (ζ) | 0.707 | Kritično prigušeno |
| Kp | 2ζωcL - R ≈ 4.4 Ω | Za L=0.5mH, R=0.1Ω |
| Ki | ωc²L ≈ 19740 Ω/s | Integralno pojačanje |
| Anti-windup | 0.9 × Vdc | Ograničenje izlaznog napona |

---

## 5. Servis droop upravljanja

### 5.1 Definicija servisa

```c
JEZGRO_SERVICE_DEFINE(droop_ctrl,
    .priority = JEZGRO_PRIORITY_HIGH,
    .stack_size = 4096,
    .memory_size = 16384,
    .watchdog_ms = 10
);

void droop_ctrl_main(void) {
    FreqDroop_State freq_droop;
    VoltDroop_State volt_droop;

    FreqDroop_Init(&freq_droop, P_NOMINAL);
    VoltDroop_Init(&volt_droop, S_NOMINAL);

    while (1) {
        jezgro_watchdog_feed();

        // Dobij raspoređenu snagu od ISO 15118 ili upravljanja flotom
        jezgro_msg_t msg;
        if (jezgro_receive(SVC_ISO15118, &msg, 0) == JEZGRO_OK) {
            if (msg.type == MSG_POWER_SCHEDULE) {
                FreqDroop_SetScheduledPower(&freq_droop, msg.payload.power);
            }
        }

        // Dobij PLL merenja
        PLL_State* pll = get_pll_state();
        float freq = pll->freq;
        float V_pu = PLL_GetVoltagePU(pll, V_GRID_NOMINAL);

        // Izračunaj P(f) droop
        float P_target = FreqDroop_Calculate(&freq_droop, freq);
        FreqDroop_ApplyRamp(&freq_droop, TS_DROOP);

        // Izračunaj Q(V) droop
        float Q_target = VoltDroop_Calculate(&volt_droop, V_pu, freq_droop.P_actual);
        VoltDroop_ApplyRamp(&volt_droop, RAMP_RATE_Q, TS_DROOP);

        // Objavi reference snage
        set_power_reference(freq_droop.P_actual);
        set_reactive_reference(volt_droop.Q_actual);

        // Proveri događaje mrežne podrške
        if (freq < F_CRITICAL || freq > F_CRITICAL_HIGH) {
            jezgro_msg_t alert = {
                .type = MSG_GRID_EMERGENCY,
                .payload.freq = freq
            };
            jezgro_send(SVC_POWER_MGR, &alert);
        }

        jezgro_sleep(1);  // 1 kHz ažuriranje droop-a
    }
}
```

### 5.2 P(f) droop karakteristika

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    P(f) DROOP KARAKTERISTIKA                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   P/Pn (%)                                                                   │
│      ▲                                                                       │
│  +100│                         ┌────────── Pmax (punjenje)                  │
│      │                        /                                             │
│   +50│                       /                                              │
│      │                      /  ← Droop nagib (4%)                           │
│    0 ├──────────────────────/───────────────────────────────► f (Hz)        │
│      │                     /│     │     │     │     │                       │
│   -50│                    / │     │     │     │     │                       │
│      │                   /  │     │     │     │     │                       │
│  -100│──────────────────/   │     │     │     │     │─── Pmax (V2G)         │
│      49.0    49.5    49.95 50.05  50.5  51.0                                │
│                                                                              │
│              ◄─── Pod-frekvencija ───►◄── Mrtva zona ──►◄── Nad-frek ──►    │
│                                         (±50 mHz)                           │
│                                                                              │
│   Odziv:                                                                     │
│   - Pod-frekvencija: Smanji punjenje (ili prazni preko V2G)                 │
│   - Nad-frekvencija: Povećaj punjenje                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Q(V) droop karakteristika

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Q(V) DROOP KARAKTERISTIKA                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Q/Sn (%)                                                                   │
│      ▲                                                                       │
│   +44│                         ┌────────── Qmax (kapacitivno)               │
│      │                        /           Ubaci Q → podigni napon           │
│   +20│                       /                                              │
│      │                      /                                               │
│    0 ├─────────────────────/────────────────────────────────► V (pu)        │
│      │                    /│    │    │         │    │                       │
│   -20│                   / │    │    │         │    │                       │
│      │                  /  │    │    │         │    │                       │
│   -44│─────────────────/   │    │    │         │    │── Qmax (induktivno)   │
│      0.90   0.92   0.94  0.95  1.0   1.05   1.08  1.10                      │
│                                                                              │
│              Pod-napon       Mrtva zona      Nad-napon                      │
│              (ubaci Q)      (bez akcije)     (apsorbuj Q)                   │
│                                                                              │
│   Ključna prednost: Bez habanja baterije! Q se razmenjuje, ne troši.        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.4 Parametri mrežnog koda

| Parametar | ENTSO-E | VDE AR-N 4110 | UK G99 |
|-----------|---------|---------------|--------|
| Droop opseg | 2-12% | 2-12% | 3-5% |
| Mrtva zona | ±10-500 mHz | ±10 mHz | ±15 mHz |
| Brzina rampe | ≤10% Pn/min | ≤10% Pn/min | ≤1% Pn/s |
| Vreme odziva | ≤ 2 s | ≤ 1 s | ≤ 1 s |
| Q(V) aktivacija | 0.90-1.10 pu | 0.95-1.05 pu | 0.95-1.05 pu |

---

## 6. Servis ISO 15118

### 6.1 Definicija servisa

```c
JEZGRO_SERVICE_DEFINE(iso15118,
    .priority = JEZGRO_PRIORITY_MEDIUM,
    .stack_size = 16384,
    .memory_size = 131072,  // 128 KB za V2G stek
    .watchdog_ms = 1000
);

void iso15118_main(void) {
    ISO15118_State state;
    V2G_Message msg_buf;

    ISO15118_Init(&state);

    while (1) {
        jezgro_watchdog_feed();

        // Mašina stanja bazirana na ISO 15118-2/-20
        switch (state.session_state) {
            case V2G_SESSION_IDLE:
                // Čekaj konekciju vozila preko SLAC
                if (check_vehicle_connected()) {
                    state.session_state = V2G_SESSION_SETUP;
                    send_session_setup_req(&state);
                }
                break;

            case V2G_SESSION_SETUP:
                if (receive_session_setup_res(&state, &msg_buf)) {
                    state.session_state = V2G_AUTH;
                    send_auth_req(&state);
                }
                break;

            case V2G_AUTH:
                // PnC (Plug and Charge) ili EIM
                if (receive_auth_res(&state, &msg_buf)) {
                    if (state.auth_success) {
                        state.session_state = V2G_CHARGE_PARAM;
                    }
                }
                break;

            case V2G_CHARGE_PARAM:
                // Razmena parametara punjenja
                if (receive_charge_param_res(&state, &msg_buf)) {
                    // Proveri BPT (Bidirectional Power Transfer)
                    if (state.bpt_supported) {
                        state.v2g_enabled = true;
                    }
                    state.session_state = V2G_POWER_DELIVERY;
                }
                break;

            case V2G_POWER_DELIVERY:
                // Aktivno punjenje/pražnjenje
                handle_power_delivery(&state);

                // Pošalji raspored snage droop kontroli
                jezgro_msg_t msg = {
                    .type = MSG_POWER_SCHEDULE,
                    .payload.power = state.scheduled_power
                };
                jezgro_send(SVC_DROOP_CTRL, &msg);
                break;

            case V2G_SESSION_STOP:
                send_session_stop_req(&state);
                state.session_state = V2G_SESSION_IDLE;
                break;
        }

        jezgro_sleep(100);  // 10 Hz ažuriranje protokola
    }
}
```

### 6.2 ISO 15118-20 BPT režim

Bidirectional Power Transfer (BPT) omogućava V2G operaciju:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ISO 15118-20 BPT SESIJA                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   EVSE (Punjač)                                    EV (Vozilo)               │
│        │                                              │                      │
│        │◄─────── SessionSetupReq ────────────────────│                      │
│        │──────── SessionSetupRes ───────────────────►│                      │
│        │                                              │                      │
│        │◄─────── AuthorizationReq ───────────────────│                      │
│        │──────── AuthorizationRes ──────────────────►│                      │
│        │                                              │                      │
│        │◄─────── ServiceDiscoveryReq ────────────────│                      │
│        │──────── ServiceDiscoveryRes ───────────────►│                      │
│        │         (uključuje BPT mogućnost)           │                      │
│        │                                              │                      │
│        │◄─────── DC_BPT_ChargeParameterReq ─────────│                      │
│        │──────── DC_BPT_ChargeParameterRes ────────►│                      │
│        │         (max snaga pražnjenja)              │                      │
│        │                                              │                      │
│        │◄─────── ScheduleExchangeReq ────────────────│                      │
│        │──────── ScheduleExchangeRes ───────────────►│                      │
│        │         (dvosmerni raspored)                │                      │
│        │                                              │                      │
│        │◄─────── DC_BPT_ControlReq ─────────────────│                      │
│        │──────── DC_BPT_ControlRes ────────────────►│                      │
│        │         (aktivna razmena snage)             │                      │
│        │         ┌─────────────────────────────┐    │                      │
│        │         │ Ponavljaj tokom V2G sesije  │    │                      │
│        │         └─────────────────────────────┘    │                      │
│        │                                              │                      │
│        │◄─────── PowerDeliveryReq (stop) ───────────│                      │
│        │──────── PowerDeliveryRes ─────────────────►│                      │
│        │                                              │                      │
│        │◄─────── SessionStopReq ────────────────────│                      │
│        │──────── SessionStopRes ───────────────────►│                      │
│        │                                              │                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Kodiranje poruka (EXI)

ISO 15118 koristi EXI (Efficient XML Interchange) za kompaktne poruke:

```c
// EXI kodiranje za V2G poruke
typedef struct {
    uint16_t session_id;
    uint8_t response_code;
    int32_t ev_max_power_w;
    int32_t ev_min_power_w;      // Negativno za V2G
    uint8_t ev_soc_percent;
    int32_t evse_max_power_w;
    int32_t evse_min_power_w;    // Negativno za V2G
    uint32_t departure_time;
} BPT_ChargeParam_t;

// Kodiraj u EXI
size_t encode_bpt_charge_param(BPT_ChargeParam_t* param, uint8_t* buffer, size_t max_len);

// Dekodiraj iz EXI
bool decode_bpt_charge_param(uint8_t* buffer, size_t len, BPT_ChargeParam_t* param);
```

---

## 7. Servis OCPP klijenta

### 7.1 Definicija servisa

```c
JEZGRO_SERVICE_DEFINE(ocpp_client,
    .priority = JEZGRO_PRIORITY_LOW,
    .stack_size = 8192,
    .memory_size = 65536,  // 64 KB za JSON bafere
    .watchdog_ms = 5000
);

void ocpp_client_main(void) {
    OCPP_State state;

    OCPP_Init(&state, CSMS_URL, STATION_ID);

    while (1) {
        jezgro_watchdog_feed();

        // Održavaj WebSocket konekciju
        if (!state.connected) {
            if (OCPP_Connect(&state) != OCPP_OK) {
                jezgro_sleep(5000);  // Pokušaj ponovo posle 5 sekundi
                continue;
            }
            OCPP_SendBootNotification(&state);
        }

        // Obradi dolazne poruke
        OCPP_Message msg;
        if (OCPP_Receive(&state, &msg, 100) == OCPP_OK) {
            switch (msg.action) {
                case OCPP_SET_CHARGING_PROFILE:
                    handle_charging_profile(&state, &msg);
                    break;

                case OCPP_REMOTE_START:
                    handle_remote_start(&state, &msg);
                    break;

                case OCPP_REMOTE_STOP:
                    handle_remote_stop(&state, &msg);
                    break;

                case OCPP_GET_COMPOSITE_SCHEDULE:
                    handle_get_schedule(&state, &msg);
                    break;

                case OCPP_RESERVE_NOW:
                    handle_reservation(&state, &msg);
                    break;
            }
        }

        // Šalji periodične statusne ažuriranja
        if (time_since_last_status() > STATUS_INTERVAL) {
            OCPP_SendStatusNotification(&state);
        }

        // Šalji vrednosti merača
        if (time_since_last_meter() > METER_INTERVAL) {
            OCPP_SendMeterValues(&state);
        }

        jezgro_sleep(100);
    }
}
```

### 7.2 OCPP 2.0.1 funkcije za V2G

| Funkcija | Opis | Poruka |
|----------|------|--------|
| **Dvosmerno punjenje** | V2G podrška | NotifyEVChargingSchedule |
| **Pametno punjenje** | Bazirano na profilima | SetChargingProfile |
| **Dinamično tarifiranje** | Cenovni signali | SetVariables |
| **ISO 15118 integracija** | PnC, BPT | Get15118EVCertificate |
| **Mrežne usluge** | FCR, aFRR | SetChargingProfile (apsolutno) |

### 7.3 Struktura profila punjenja

```c
typedef struct {
    int32_t id;
    int32_t stack_level;
    ChargingProfilePurpose purpose;  // TxProfile, RecurringProfile, itd.
    ChargingProfileKind kind;        // Absolute, Relative, Recurring
    uint32_t valid_from;
    uint32_t valid_to;

    struct {
        uint32_t start_period;
        float limit;                 // Pozitivno = punjenje, Negativno = pražnjenje
        int32_t number_phases;
    } periods[MAX_PERIODS];

    int32_t period_count;
} ChargingProfile;

// Primer: V2G tokom špica (17:00-19:00)
ChargingProfile v2g_peak_profile = {
    .id = 1,
    .stack_level = 0,
    .purpose = TxDefaultProfile,
    .kind = Absolute,
    .periods = {
        { .start_period = 0,     .limit = 22000,  .number_phases = 3 },   // 22 kW punjenje
        { .start_period = 61200, .limit = -10000, .number_phases = 3 },   // 10 kW V2G @ 17:00
        { .start_period = 68400, .limit = 22000,  .number_phases = 3 },   // Nastavi @ 19:00
    },
    .period_count = 3
};
```

---

## 8. Arhitektura integracije

### 8.1 Mapa komunikacije servisa

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MAPA KOMUNIKACIJE SERVISA                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        REAL-TIME DOMEN                               │   │
│   │                                                                      │   │
│   │   ┌─────────────┐    θ,ω,Vd    ┌─────────────┐                      │   │
│   │   │  PLL_SYNC   │─────────────►│CURRENT_CTRL │                      │   │
│   │   │  (10 kHz)   │              │  (10 kHz)   │                      │   │
│   │   └──────┬──────┘              └──────▲──────┘                      │   │
│   │          │ θ,ω,V                      │ P_ref, Q_ref                │   │
│   │          ▼                            │                              │   │
│   │   ┌─────────────┐    P,Q      ┌──────┴──────┐                      │   │
│   │   │ DROOP_CTRL  │────────────►│             │                      │   │
│   │   │  (1 kHz)    │◄────────────│             │                      │   │
│   │   └──────┬──────┘   P_sched   │             │                      │   │
│   │          │                     │ POWER_MGR  │                      │   │
│   │          │                     │             │                      │   │
│   └──────────┼─────────────────────┼─────────────┼───────────────────────┘   │
│              │                     │             │                           │
│   ┌──────────┼─────────────────────┼─────────────┼───────────────────────┐   │
│   │          ▼                     ▼             │    PROTOKOL DOMEN      │   │
│   │   ┌─────────────┐       ┌─────────────┐     │                        │   │
│   │   │  ISO15118   │◄─────►│ OCPP_CLIENT │     │                        │   │
│   │   │  (~10 Hz)   │       │  (~1 Hz)    │     │                        │   │
│   │   └─────────────┘       └─────────────┘     │                        │   │
│   │          ▲                     ▲            │                        │   │
│   │          │                     │            │                        │   │
│   │   ┌──────┴──────┐       ┌──────┴──────┐    │                        │   │
│   │   │    SLAC     │       │  ETHERNET   │    │                        │   │
│   │   │  (PLC)      │       │  (TCP/TLS)  │    │                        │   │
│   │   └─────────────┘       └─────────────┘    │                        │   │
│   │                                             │                        │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 CAN protokol ka kontroleru stanice

| ID poruke | Ime | Frekvencija | Sadržaj |
|-----------|-----|-------------|---------|
| 0x600 | GW_STATUS | 10 Hz | Stanje mreže, snaga, frekvencija |
| 0x610 | GW_PLL | 10 Hz | θ, ω, Vd, Vq, zaključan |
| 0x620 | GW_POWER | 10 Hz | P_actual, Q_actual, ograničenja |
| 0x630 | GW_V2G | 1 Hz | V2G omogućen, stanje sesije |
| 0x640 | GW_FAULT | Događaj | Kod greške, opis |
| 0x700 | STATION_CMD | Po zahtevu | Zadana snaga, režim |

### 8.3 Mašina stanja

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MAŠINA STANJA KAPIJE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                                 ┌─────────┐                                 │
│                                 │  INIT   │                                 │
│                                 └────┬────┘                                 │
│                                      │ HW OK                                │
│                                      ▼                                      │
│                             ┌────────────────┐                              │
│                             │  GRID_SEARCH   │◄───────────────┐            │
│                             │ (PLL zaključ.) │                │            │
│                             └────────┬───────┘                │            │
│                                      │ PLL zaključan          │            │
│                                      ▼                        │            │
│                             ┌────────────────┐                │            │
│                          ┌─►│   STANDBY      │◄──┐            │            │
│                          │  │ (mrežna sync)  │   │            │            │
│                          │  └────────┬───────┘   │            │ Mreža     │
│                          │           │ Vozilo    │            │ izgubljena│
│           Kraj sesije    │           │ povezano  │ Kraj       │            │
│                          │           ▼           │ sesije     │            │
│                          │  ┌────────────────┐   │            │            │
│                          │  │  V2G_SESSION   │───┘            │            │
│                          │  │ (ISO 15118)    │                │            │
│                          │  └────────┬───────┘                │            │
│                          │           │ Autorizovan            │            │
│                          │           ▼                        │            │
│                          │  ┌────────────────┐                │            │
│                          └──│   CHARGING     │────────────────┘            │
│                             │ ili DISCHARGING│                              │
│                             └────────────────┘                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Testiranje i validacija

### 9.1 Testovi na nivou servisa

| Test | Namena | Metoda |
|------|--------|--------|
| Vreme zaključavanja PLL | Verifikuj < 50 ms | Koračna promena mrežnog napona |
| Propusni opseg strujne petlje | Verifikuj 1 kHz | Frekvencijski odziv |
| Droop odziv | Verifikuj mrežni kod | Test koraka frekvencije |
| ISO 15118 usklađenost | Usaglašenost protokola | TTCN-3 test paket |
| OCPP usklađenost | Backend integracija | OCPP test alat |

### 9.2 Integracioni testovi

| Test | Namena | Kriterijum prolaska |
|------|--------|---------------------|
| Mrežna sync + punjenje | Kompletan tok snage | Stabilan na nominalnoj snazi |
| V2G pražnjenje | Dvosmerno | Pražnjenje u mrežu |
| Odziv na mrežni događaj | Aktivacija droop-a | < 1 s odziv |
| Gubitak komunikacije | Graciozna degradacija | Lokalno upravljanje nastavlja |
| Restart servisa | Oporavak od greške | < 100 ms restart |

### 9.3 Testovi mrežnog koda

| Test | Standard | Kriterijum |
|------|----------|------------|
| LVRT | IEC 61000 | Preživi 0.3 pu za 150 ms |
| Frekvencijski odziv | EN 50549 | 4% droop, < 2 s |
| Anti-ostrvo | IEC 62116 | Trip < 2 s |
| Harmonici | EN 61000-3-12 | THD < 5% |

---

## 10. Unakrsne reference

| Dokument | Veza |
|----------|------|
| `tehnika/inzenjersko/sr/21-jezgro-product-family.md` | JEZGRO porodica proizvoda |
| `tehnika/inzenjersko/sr/16-jezgro.md` | Bazna JEZGRO specifikacija |
| `tehnika/inzenjersko/sr/07-v2g-control.md` | Detalji V2G algoritma |
| `tehnika/inzenjersko/sr/08-iso15118-bpt.md` | ISO 15118 BPT režim |
| `tehnika/inzenjersko/sr/25-adapter-devices.md` | Specifikacije adapter hardvera |

---

## Istorija promena

| Datum | Verzija | Opis |
|-------|---------|------|
| 2026-01-04 | 1.0 | Inicijalna JEZGRO-GW specifikacija |
