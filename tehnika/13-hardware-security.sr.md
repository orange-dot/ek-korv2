# EK3 Hardverska Bezbednost

## Informacije o Dokumentu

| Polje | Vrednost |
|-------|----------|
| ID Dokumenta | EK-TECH-013 |
| Verzija | 1.0 |
| Datum | 2026-01-03 |
| Status | Aktivan |
| Autor | Elektrokombinacija Inženjering |

---

## 1. Pregled Hardverske Bezbednosti

### 1.1 Odbrana u Dubini na PCB Nivou

Hardverska bezbednost štiti od:

| Pretnja | Uticaj | Mitigacija |
|---------|--------|------------|
| Fizički tamper | Manipulacija podacima, krađa IP | Detekcija tamper-a, šifrovanje |
| Probing | Izvlačenje ključeva, reverse engineering | Guard rings, mesh slojevi |
| Side-channel | Izvlačenje ključeva putem snage/EM | Konstantno vreme, zaštita |
| Fault injection | Zaobilaženje sigurnosnih provera | Detekcija gličeva, redundancija |
| ESD/EMI | Oštećenje komponenti, korupcija podataka | TVS diode, filtriranje |

### 1.2 Bezbednosna Arhitektura PCB-a

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PCB BEZBEDNOSNE ZONE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  6-slojni PCB Stack-up:                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Sloj 1 (Top)    │ Komponente, shield coverage                   │    │
│  ├─────────────────┼───────────────────────────────────────────────┤    │
│  │ Sloj 2          │ Ground plane (EMI shield)                     │    │
│  ├─────────────────┼───────────────────────────────────────────────┤    │
│  │ Sloj 3          │ Signali (osetljive linije ovde)              │    │
│  ├─────────────────┼───────────────────────────────────────────────┤    │
│  │ Sloj 4          │ Power planes (VCC, 3.3V, 5V)                  │    │
│  ├─────────────────┼───────────────────────────────────────────────┤    │
│  │ Sloj 5          │ Ground plane (return path)                    │    │
│  ├─────────────────┼───────────────────────────────────────────────┤    │
│  │ Sloj 6 (Bottom) │ Komponente, heatsink pad                      │    │
│  └─────────────────┴───────────────────────────────────────────────┘    │
│                                                                          │
│  Bezbednosne Zone:                                                      │
│  ┌───────────────────────────────────────────────────────────────┐      │
│  │                                                               │      │
│  │   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐        │      │
│  │   │   KRIPTO    │   │   MCU       │   │   POWER     │        │      │
│  │   │   ZONA      │   │   ZONA      │   │   ZONA      │        │      │
│  │   │   ══════    │   │             │   │             │        │      │
│  │   │ • Secure    │   │ • STM32G474 │   │ • SiC MOSFET│        │      │
│  │   │   storage   │   │ • Flash     │   │ • Gate drv  │        │      │
│  │   │ • AES       │   │ • SRAM      │   │ • LLC tank  │        │      │
│  │   │ • TRNG      │   │ • Debug     │   │             │        │      │
│  │   │             │   │   port      │   │             │        │      │
│  │   └─────────────┘   └─────────────┘   └─────────────┘        │      │
│  │        │                   │                                  │      │
│  │        └───────────────────┼── Guard Ring ────────────────────│      │
│  │                            │                                  │      │
│  └───────────────────────────────────────────────────────────────┘      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. PCB Layout za Bezbednost

### 2.1 Guard Rings

Guard rings štite osetljive oblasti od probing-a i EMI:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      DIZAJN GUARD RING-A                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Oko Kripto Sekcije:                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ ╔═══════════════════════════════════════════════════════════╗   │    │
│  │ ║                                                           ║   │    │
│  │ ║   ┌───────────────────────────────────────────────────┐  ║   │    │
│  │ ║   │                                                   │  ║   │    │
│  │ ║   │         STM32G474 Kripto Sekcija                 │  ║   │    │
│  │ ║   │         (AES, CMAC, TRNG, OTP)                   │  ║   │    │
│  │ ║   │                                                   │  ║   │    │
│  │ ║   └───────────────────────────────────────────────────┘  ║   │    │
│  │ ║                                                           ║   │    │
│  │ ╚═══════════════════════════════════════════════════════════╝   │    │
│  │  ▲                                                           ▲  │    │
│  │  │                                                           │  │    │
│  │  └─ Dvostruki guard ring (GND + VCC) oko kripto zone ───────┘  │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Oko Debug Porta:                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ ╔═══════════════════════════════════╗                           │    │
│  │ ║   ┌───────┐                       ║                           │    │
│  │ ║   │ JTAG/ │ ◄── Guard + popuna   ║                           │    │
│  │ ║   │ SWD   │     za sprečavanje   ║                           │    │
│  │ ║   │       │     neovlašćenog     ║                           │    │
│  │ ║   └───────┘     pristupa         ║                           │    │
│  │ ╚═══════════════════════════════════╝                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Specifikacija Guard Ring-a:                                            │
│  • Širina trake: 0.5 mm minimum                                        │
│  • Via spacing: 2.5 mm (λ/20 na 2.4 GHz)                               │
│  • Spojeno na: GND (spoljni ring), VCC (unutrašnji ring)               │
│  • Via stitching: na svakom sloju                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Pravila Rutiranja

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      BEZBEDNOSNA PRAVILA RUTIRANJA                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. OSETLJIVI SIGNALI (ključevi, kripto podaci):                        │
│     • Rutirani SAMO na unutrašnjim slojevima (3, 4)                    │
│     • Okruženi GND guard trakama                                        │
│     • Minimalna dužina, bez stub-ova                                    │
│     • Via-in-pad zabranjeno (probing rizik)                            │
│                                                                          │
│  2. CAN DIFERENCIJALNI PAROVI:                                          │
│     • Impedansa: 120Ω diferencijalno                                   │
│     • Spacing: 0.15 mm between traces                                  │
│     • Length matching: ±1 mm                                           │
│     • Guard traces na obe strane                                        │
│                                                                          │
│  3. CLOCK SIGNALI:                                                       │
│     • Series termination na izvoru                                      │
│     • Guard traces za smanjenje EMI                                    │
│     • Izbegavati prolaz preko split planes                             │
│                                                                          │
│  4. POWER RAILS:                                                         │
│     • Decoupling na svakom VCC pinu                                    │
│     • Ferrite beads na kritičnim rails                                 │
│     • Star topology za osetljive supplies                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Via Stitching

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      VIA STITCHING OBRAZAC                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Pogled odozgo na GND plane:                                            │
│                                                                          │
│  ○ ─ ○ ─ ○ ─ ○ ─ ○ ─ ○ ─ ○ ─ ○ ─ ○ ─ ○ ─ ○                           │
│  │                                           │                          │
│  ○   ┌───────────────────────────────────┐   ○                          │
│  │   │                                   │   │                          │
│  ○   │     Kripto Zona                   │   ○  ◄── Via stitching      │
│  │   │     (zaštićena oblast)            │   │      grid oko zone      │
│  ○   │                                   │   ○                          │
│  │   └───────────────────────────────────┘   │                          │
│  ○                                           ○                          │
│  │                                           │                          │
│  ○ ─ ○ ─ ○ ─ ○ ─ ○ ─ ○ ─ ○ ─ ○ ─ ○ ─ ○ ─ ○                           │
│                                                                          │
│  Via specifikacija:                                                      │
│  • Prečnik: 0.3 mm                                                      │
│  • Pitch: 2.5 mm (maksimum)                                             │
│  • Povezuje sve GND slojeve                                             │
│  • Formira Faradayev kavez                                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Kripto Hardver

### 3.1 STM32G474 Ugrađeni AES

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      STM32G474 KRIPTO MOGUĆNOSTI                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  AES Hardverski Akcelerator:                                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Karakteristika        │ Specifikacija                          │    │
│  ├───────────────────────┼─────────────────────────────────────────┤    │
│  │ Algoritam             │ AES-128, AES-192, AES-256              │    │
│  │ Modovi                │ ECB, CBC, CTR, GCM, CCM, CMAC          │    │
│  │ Performanse           │ 4.5 ciklusa/byte @ 170 MHz             │    │
│  │ Propusnost            │ ~38 MB/s                               │    │
│  │ Zaštita ključa        │ Key ne izlazi iz hardvera              │    │
│  │ DPA otpornost         │ Ugrađene protivmere                    │    │
│  └───────────────────────┴─────────────────────────────────────────┘    │
│                                                                          │
│  True Random Number Generator (TRNG):                                    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Izvor entropije       │ Analogni termički šum                  │    │
│  │ Izlaz                 │ 32-bit za ~40 CPU ciklusa              │    │
│  │ Testovi zdravlja      │ Kontinuirano praćenje                  │    │
│  │ Standardi             │ AIS-31 PTG.2, NIST SP 800-90B          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Dijagram Toka:                                                         │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐              │
│  │ Plaintext├───►│AES Engine├───►│Ciphertext│   │  TRNG   │              │
│  └─────────┘    └────┬────┘    └─────────┘    └────┬────┘              │
│                      │                              │                    │
│                      │                              ▼                    │
│                ┌─────▼─────┐                ┌─────────────┐              │
│                │ Key Slot  │                │ Seed za     │              │
│                │ (zaštićen)│                │ Derivaciju  │              │
│                └───────────┘                └─────────────┘              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Sigurno Skladištenje Ključeva

```c
/* Konfiguracija skladištenja ključeva */

/* 1. OTP (One-Time Programmable) Fuses */
#define OTP_ROOT_KEY_ADDR   0x1FFF7000
#define OTP_ROOT_KEY_SIZE   32  /* 256-bit root key */

/* 2. Option Bytes Zaštita */
void ConfigureSecureStorage(void) {
    FLASH_OBProgramInitTypeDef ob = {0};

    HAL_FLASH_OB_Unlock();

    /* Postavi Read-Out Protection Level 2 (permanentno) */
    ob.OptionType = OPTIONBYTE_RDP;
    ob.RDPLevel = OB_RDP_LEVEL_2;  /* OPREZ: nepovratno! */
    HAL_FLASHEx_OBProgram(&ob);

    /* Zaštiti secure storage sektor */
    ob.OptionType = OPTIONBYTE_WRP;
    ob.WRPArea = OB_WRPAREA_ZONE_A;
    ob.WRPStartOffset = 0x78;  /* Sektor sa ključevima */
    ob.WRPEndOffset = 0x7F;
    HAL_FLASHEx_OBProgram(&ob);

    HAL_FLASH_OB_Lock();
    HAL_FLASH_OB_Launch();  /* Reset za primenu */
}

/* 3. Učitavanje ključa iz OTP */
void LoadRootKey(uint8_t *key) {
    /* Čitamo direktno iz OTP memorije */
    /* Ključ nikada ne napušta MCU */
    volatile uint32_t *otp = (volatile uint32_t *)OTP_ROOT_KEY_ADDR;
    for (int i = 0; i < 8; i++) {
        ((uint32_t *)key)[i] = otp[i];
    }
}
```

### 3.3 Eksterni Secure Element (Opciono)

Za aplikacije koje zahtevaju viši nivo bezbednosti:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      EKSTERNI SECURE ELEMENT                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Opcija 1: Microchip ATECC608B                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ • ECC P-256 hardversko ubrzanje                                │    │
│  │ • 16 key slotova sa konfigurabilnom zaštitom                   │    │
│  │ • ECDH, ECDSA operacije                                        │    │
│  │ • I2C interfejs                                                 │    │
│  │ • Ugrađeni TRNG                                                │    │
│  │ • Tamper detekcija                                             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Opcija 2: ST STSAFE-A110                                               │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ • AES-128/256, SHA-256                                         │    │
│  │ • ECC NIST P-256, P-384                                        │    │
│  │ • X.509 sertifikati                                            │    │
│  │ • Secure boot asistencija                                      │    │
│  │ • I2C interfejs                                                 │    │
│  │ • CC EAL5+ sertifikovan                                        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Dijagram Povezivanja:                                                  │
│  ┌───────────┐         ┌───────────┐                                    │
│  │ STM32G474 │◄── I2C ──►│ ATECC608B │                                   │
│  │           │  (100kHz) │           │                                   │
│  │  SDA ◄────┼───────────┼──── SDA   │                                   │
│  │  SCL ◄────┼───────────┼──── SCL   │                                   │
│  │  IRQ ◄────┼───────────┼──── INT   │ (opciono)                        │
│  └───────────┘           └───────────┘                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Detekcija Tamper-a

### 4.1 Pasivni Tamper

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      PASIVNA DETEKCIJA TAMPER-A                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. Detekcija Otvaranja Kućišta:                                        │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                 │    │
│  │         ┌─────────────────────────────────────────┐            │    │
│  │         │           Poklopac Kućišta              │            │    │
│  │         │                                         │            │    │
│  │         │    ┌───────┐                           │            │    │
│  │         │    │ Magnet│                           │            │    │
│  │         │    └───┬───┘                           │            │    │
│  │         │        │                               │            │    │
│  │  ═══════│════════│═══════════════════════════════│═══════════ │    │
│  │         │        ▼                               │            │    │
│  │         │    ┌───────┐                           │            │    │
│  │  VCC ───┼────┤ Reed  ├───────────────► GPIO (PB0)│            │    │
│  │         │    │ Switch│                           │            │    │
│  │  GND ───┼────┴───────┘                           │            │    │
│  │         │                                         │            │    │
│  │         └──────────── PCB ────────────────────────┘            │    │
│  │                                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  2. Detektor Svetla (pokušaj otvaranja):                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                 │    │
│  │  VCC ───┬──────────────────────────────────┐                   │    │
│  │         │                                  │                   │    │
│  │        ┌┴┐ R1=10kΩ                        │                   │    │
│  │        └┬┘                                 │                   │    │
│  │         │                                  │                   │    │
│  │         ├───────────────► ADC (PA1)       │                   │    │
│  │         │                                  │                   │    │
│  │        ┌┴┐ Fotorezistor                   │                   │    │
│  │        └┬┘ (svetlo = nizak R)             │                   │    │
│  │         │                                  │                   │    │
│  │  GND ───┴──────────────────────────────────┘                   │    │
│  │                                                                 │    │
│  │  Logika: Ako ADC > prag (svetlo detektovano unutar kućišta)    │    │
│  │          → Tamper alarm                                        │    │
│  │                                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Aktivni Tamper

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AKTIVNA DETEKCIJA TAMPER-A                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. Detekcija Naponskog Glitch-a:                                       │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                 │    │
│  │  VCC ──────┬────────────────────────────────────────────────   │    │
│  │            │                                                    │    │
│  │           ┌┴┐                                                   │    │
│  │           │ │ Ferrite bead                                      │    │
│  │           └┬┘                                                   │    │
│  │            │                                                    │    │
│  │            ├─────────────► VDD_MCU                             │    │
│  │            │                                                    │    │
│  │           ─┴─ Bulk cap                                         │    │
│  │           ─┬─ 10µF                                             │    │
│  │            │                                                    │    │
│  │           ┌┴┐ Voltage                                          │    │
│  │           │ │ Detector ──────► NRST (reset ako V < 2.9V)       │    │
│  │           └┬┘ (MAX809)                                         │    │
│  │            │                                                    │    │
│  │  GND ──────┴────────────────────────────────────────────────   │    │
│  │                                                                 │    │
│  │  STM32G4 BOR (Brown-Out Reset) nivoi:                          │    │
│  │  • Level 0: 1.7V (najniži)                                     │    │
│  │  • Level 4: 2.8V (preporučeno za bezbednost)                   │    │
│  │                                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  2. Detekcija Clock Glitch-a:                                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                 │    │
│  │  STM32G4 ugrađena detekcija:                                   │    │
│  │  • CSS (Clock Security System): Detektuje HSE failure          │    │
│  │  • HSI automatski failover ako HSE otkaže                      │    │
│  │                                                                 │    │
│  │  Implementacija:                                                │    │
│  │  RCC->CR |= RCC_CR_CSSON;  /* Omogući CSS */                   │    │
│  │                                                                 │    │
│  │  void NMI_Handler(void) {                                      │    │
│  │      if (RCC->CIR & RCC_CIR_CSSF) {                           │    │
│  │          LogSecurityEvent(TAMPER_CLOCK_GLITCH);                │    │
│  │          /* Nastavi sa HSI, logiraj incident */                │    │
│  │      }                                                         │    │
│  │  }                                                             │    │
│  │                                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  3. Detekcija Temperaturne Anomalije:                                   │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                 │    │
│  │  STM32G4 interni temp senzor: ADC kanal 16                     │    │
│  │                                                                 │    │
│  │  Prag detekcije:                                               │    │
│  │  • T < -40°C: Sumnja na freeze attack                          │    │
│  │  • T > 105°C: Sumnja na heat attack                            │    │
│  │                                                                 │    │
│  │  Odgovor: Loguj + povećaj watchdog frekvenciju                 │    │
│  │                                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Odgovor na Tamper

```c
typedef enum {
    TAMPER_ENCLOSURE_OPEN,
    TAMPER_LIGHT_DETECTED,
    TAMPER_VOLTAGE_GLITCH,
    TAMPER_CLOCK_GLITCH,
    TAMPER_TEMP_ANOMALY
} TamperType_t;

void HandleTamperEvent(TamperType_t type) {
    /* 1. Loguj događaj (pre eventualnog brisanja) */
    LogSecurityEvent(EVT_TAMPER_DETECTED, type);

    /* 2. Ozbiljnost zavisi od tipa */
    switch (type) {
        case TAMPER_ENCLOSURE_OPEN:
        case TAMPER_LIGHT_DETECTED:
            /* Srednja ozbiljnost: upozorenje, možda privremeno onemogućavanje */
            SetModuleState(STATE_MAINTENANCE);
            SendAlert(ALERT_TAMPER_PHYSICAL);
            break;

        case TAMPER_VOLTAGE_GLITCH:
        case TAMPER_CLOCK_GLITCH:
            /* Visoka ozbiljnost: moguć napad */
            ZeroizeSensitiveKeys();  /* Obriši sesijske ključeve */
            SetModuleState(STATE_FAULT);
            SendAlert(ALERT_TAMPER_ACTIVE);
            break;

        case TAMPER_TEMP_ANOMALY:
            /* Kontekstualno: može biti i lažni alarm */
            IncreaseTamperCounter();
            if (GetTamperCount() > 3) {
                ZeroizeSensitiveKeys();
                SetModuleState(STATE_FAULT);
            }
            break;
    }
}

void ZeroizeSensitiveKeys(void) {
    /* Obriši sesijske ključeve iz RAM-a */
    volatile uint8_t *keys = GetSessionKeyBuffer();
    for (int i = 0; i < SESSION_KEY_SIZE; i++) {
        keys[i] = 0x00;
        keys[i] = 0xFF;  /* Dvostruko pisanje */
        keys[i] = 0x00;
    }
    __DSB();  /* Osiguraj da se pisanje završi */

    /* Root ključevi u OTP ostaju (ne mogu se obrisati) */
    /* Ali sesijski ključevi su sada neupotrebljivi */
}
```

---

## 5. Fizička Zaštita Modula

### 5.1 Dizajn Kućišta

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      DIZAJN KUĆIŠTA MODULA                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Specifikacije:                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Parametar              │ Vrednost                              │    │
│  ├────────────────────────┼───────────────────────────────────────┤    │
│  │ IP zaštita (u rack-u)  │ IP20                                  │    │
│  │ Materijal              │ Aluminijum (EMI shield + heatsink)    │    │
│  │ Debljina zida          │ 2 mm minimum                          │    │
│  │ Završna obrada         │ Anodizirano (električna izolacija)    │    │
│  │ Šarke/vijci            │ Tamper-evident (specijalni profil)    │    │
│  └────────────────────────┴───────────────────────────────────────┘    │
│                                                                          │
│  Poprečni Presek:                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                 │    │
│  │  ╔═══════════════════════════════════════════════════════════╗ │    │
│  │  ║        Metalni Poklopac (shield)                          ║ │    │
│  │  ╠═══════════════════════════════════════════════════════════╣ │    │
│  │  ║                                                           ║ │    │
│  │  ║    ┌─────────────────────────────────────────────────┐   ║ │    │
│  │  ║    │               PCB                               │   ║ │    │
│  │  ║    │   (komponente, kripto, MCU)                     │   ║ │    │
│  │  ║    └─────────────────────────────────────────────────┘   ║ │    │
│  │  ║                     │                                    ║ │    │
│  │  ║              Thermal pad                                 ║ │    │
│  │  ║                     │                                    ║ │    │
│  │  ╠═════════════════════│═════════════════════════════════════╣ │    │
│  │  ║              Heatsink (deo kućišta)                      ║ │    │
│  │  ╚═══════════════════════════════════════════════════════════╝ │    │
│  │                                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 ESD Zaštita Konektora

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ESD ZAŠTITA NA KONEKTORU                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Signal Pinovi (CAN, SPI, I2C):                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                 │    │
│  │    Pin ──┬──────────────────────────────────► MCU GPIO         │    │
│  │          │                                                      │    │
│  │         ─┴─ TVS dioda                                          │    │
│  │         ╲╱  (PESD5V0S2BT)                                      │    │
│  │         ─┬─                                                     │    │
│  │          │  Specifikacije:                                      │    │
│  │         ─┴─ • Radni napon: 5V                                  │    │
│  │          │  • Clamp napon: 15V                                  │    │
│  │         GND • ESD rating: ±30 kV (HBM)                         │    │
│  │                                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Power Pinovi (DC+, DC-):                                               │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                 │    │
│  │    DC+ Pin ────┬────────────────────────► DC Link              │    │
│  │                │                                                │    │
│  │               ─┴─ Varistor                                     │    │
│  │                │  (V1000LA40BP)                                │    │
│  │               ─┬─                                               │    │
│  │                │  Specifikacije:                                │    │
│  │               ─┴─ • Clamping: 1650V                            │    │
│  │                │  • Energija: 300J                              │    │
│  │    DC- Pin ────┴────────────────────────► DC Link              │    │
│  │                                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. EMC za Dual CAN

### 6.1 Terminacija

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CAN BUS TERMINACIJA                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Split Terminacija (preporučeno):                                       │
│                                                                          │
│    Kraj A                                      Kraj B                    │
│                                                                          │
│    CAN_H ─────────────────────────────────────────────── CAN_H          │
│            │                                       │                    │
│           ┌┴┐ 60Ω                                ┌┴┐ 60Ω               │
│           └┬┘                                    └┬┘                    │
│            │                                       │                    │
│            ├──┤├── 4.7nF ──► GND                  ├──┤├── 4.7nF        │
│            │                                       │                    │
│           ┌┴┐ 60Ω                                ┌┴┐ 60Ω               │
│           └┬┘                                    └┬┘                    │
│            │                                       │                    │
│    CAN_L ─────────────────────────────────────────────── CAN_L          │
│                                                                          │
│  Prednosti Split Terminacije:                                           │
│  • Bolja common-mode rejection                                          │
│  • Niža EMI emisija                                                     │
│  • AC terminacija preko kondenzatora                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Izbor Transceiver-a

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CAN-FD TRANSCEIVER IZBOR                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Primarni Izbor: NXP TJA1443                                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Parametar              │ Vrednost                              │    │
│  ├────────────────────────┼───────────────────────────────────────┤    │
│  │ CAN-FD brzina          │ do 5 Mbps                             │    │
│  │ Supply                 │ 3.3V ili 5V                           │    │
│  │ ESD zaštita            │ ±8 kV (HBM)                           │    │
│  │ Sleep struja           │ < 5 µA                                │    │
│  │ Wake pattern           │ Podrška                               │    │
│  │ Fail-safe              │ Recessive output pri bus failure      │    │
│  │ Pakovanje              │ SO-8                                  │    │
│  └────────────────────────┴───────────────────────────────────────┘    │
│                                                                          │
│  Alternativa za Izolaciju: TI ISO1042                                   │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ Parametar              │ Vrednost                              │    │
│  ├────────────────────────┼───────────────────────────────────────┤    │
│  │ Izolacija              │ 5 kVrms (1 min)                       │    │
│  │ CAN brzina             │ do 1 Mbps (CAN 2.0)                   │    │
│  │ CMR                    │ ±70 kV/µs                             │    │
│  │ Primena                │ Ground loop isolation                 │    │
│  └────────────────────────┴───────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Pravila Rutiranja

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CAN PRAVILA RUTIRANJA                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. Diferencijalni Par:                                                  │
│     • CAN_H i CAN_L rutirani zajedno                                    │
│     • Spacing: 0.15 mm između traka                                     │
│     • Širina trake: 0.2 mm (za 120Ω impedansu)                          │
│     • Length matching: ±1 mm                                             │
│                                                                          │
│  2. Guard Traces:                                                        │
│     ┌─────────────────────────────────────────────────────────────┐     │
│     │                                                             │     │
│     │  GND ═══════════════════════════════════════════════════   │     │
│     │  CAN_H ─────────────────────────────────────────────────   │     │
│     │  CAN_L ─────────────────────────────────────────────────   │     │
│     │  GND ═══════════════════════════════════════════════════   │     │
│     │                                                             │     │
│     └─────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  3. Common Mode Choke:                                                   │
│     Na ulazu u modul za dodatnu EMI zaštitu                             │
│     ┌───────────────┐                                                    │
│     │   ┌─────┐     │                                                    │
│     │ ──┤     ├──   │                                                    │
│     │   │ CMC │     │  Induktivnost: 100 µH tipično                     │
│     │ ──┤     ├──   │  Impedansa: >500Ω @ 100 MHz                       │
│     │   └─────┘     │                                                    │
│     └───────────────┘                                                    │
│                                                                          │
│  4. Backplane Rutiranje:                                                 │
│     • Twisted pair u backplane kablu                                    │
│     • Max stub dužina: <30 cm                                           │
│     • Fizički razdvojene putanje za CAN-A i CAN-B                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Reference

| Dokument | Opis |
|----------|------|
| `tehnika/10-microkernel-architecture.md` | Bezbednosni slojevi |
| `tehnika/11-security-model.md` | Softverski bezbednosni model |
| `tehnika/15-ek3-connector-spec.md` | ESD zaštita konektora |
| `tehnika/16-custom-rack-system.md` | Backplane EMC dizajn |
| STM32G4 Reference Manual | Kripto i bezbednosne funkcije |
| IEC 61000-4-2 | ESD test standard |

---

## Dodatak A: Kontrolna Lista Proizvodnje

### Bezbednosna Verifikacija

- [ ] OTP ključevi programirani i verifikovani
- [ ] RDP Level 2 omogućen (nepovratno)
- [ ] Secure boot funkcionalan
- [ ] Tamper detekcija testirana
- [ ] EMC testiranje prolazno
- [ ] ESD testiranje prolazno (±8 kV)

### Inspekcija PCB-a

- [ ] Guard rings kontinuirani
- [ ] Via stitching kompletno
- [ ] Kripto zona izolovana
- [ ] Debug port zaštićen
- [ ] CAN diferencijalni parovi usklađeni
