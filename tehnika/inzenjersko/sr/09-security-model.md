# EK3 Model Bezbednosti

## Informacije o Dokumentu

| Polje | Vrednost |
|-------|----------|
| ID Dokumenta | EK-TECH-011 |
| Verzija | 1.0 |
| Datum | 2026-01-03 |
| Status | Aktivan |
| Autor | Elektrokombinacija Inženjering |

---

## 1. Pregled

### 1.1 Pretnje i Rizici

EK3 sistem je suočen sa bezbednosnim pretnjama na više slojeva:

| Sloj Pretnje | Primeri | Uticaj |
|--------------|---------|--------|
| Fizički pristup | Tamper, krađa modula | Oštećenje imovine, bezbednosni rizik |
| Mrežni napad | CAN bus injection, DoS | Poremećaj usluge, oštećenje opreme |
| Kompromitacija firmware-a | Maliciozno ažuriranje, backdoor-i | Potpuna kontrola sistema |
| Curenje podataka | Telemetrija, informacije o klijentima | Kršenje privatnosti, IP krađa |
| Poricanje usluge | Onemogućavanje punjenja | Gubitak prihoda, uticaj na flotu |

### 1.2 Odbrana u Dubini

Bezbednost EK3 implementira višeslojne odbrane:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ODBRANA U DUBINI                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Sloj 5: Politike i Procedure                                           │
│  ├── Kontrola pristupa za osoblje                                       │
│  ├── Raspored održavanja                                                │
│  └── Planovi reagovanja na incidente                                    │
│                                                                          │
│  Sloj 4: Mrežna Bezbednost                                              │
│  ├── Firewall na Station Controller-u                                   │
│  ├── mTLS za Cloud komunikaciju                                        │
│  └── VPN za udaljeni pristup                                            │
│                                                                          │
│  Sloj 3: Bezbednost Aplikacija                                          │
│  ├── RBAC (Role-Based Access Control)                                   │
│  ├── Ograničenje stope                                                  │
│  └── Validacija unosa                                                   │
│                                                                          │
│  Sloj 2: Bezbednost Firmware-a                                          │
│  ├── Secure boot lanac                                                  │
│  ├── Potpisane slike firmware-a                                         │
│  └── Zaštita od rollback-a                                              │
│                                                                          │
│  Sloj 1: Bezbednost Komunikacije                                        │
│  ├── CAN poruke sa CMAC autentifikacijom                                │
│  ├── Replay zaštita (sekventni brojevi)                                 │
│  └── Šifrovanje za osetljive podatke                                    │
│                                                                          │
│  Sloj 0: Hardverska Bezbednost                                          │
│  ├── Fuse za root ključeve                                              │
│  ├── Zaštita od tamper-a                                                │
│  └── Hardverski zaštitni tripovi (ne može se zaobići)                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Nivoi Poverenja

### 2.1 Definicije Nivoa

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        NIVOI POVERENJA                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  NIVO 0: HARDVER (najviše poverenje)                                    │
│  ────────────────────────────────────                                    │
│  Lokacija:    PCB, silicijum                                            │
│  Primeri:     • OTP ključevi u STM32G4 secure storage                   │
│               • Hardverski zaštitni komparatori                         │
│               • Read-out zaštita (RDP Level 2)                          │
│  Kompromis:   Zahteva fizički pristup, laboratorijsku opremu           │
│                                                                          │
│  NIVO 1: FIRMWARE (visoko poverenje)                                    │
│  ──────────────────────────────────────                                  │
│  Lokacija:    STM32G474 flash memorija                                  │
│  Zahtevi:     • Secure boot validacija                                  │
│               • Potpisana slika firmware-a (Ed25519)                    │
│               • Brojač verzija u OTP (anti-rollback)                    │
│  Kompromis:   Zahteva krađu ključa za potpisivanje ili 0-day exploit   │
│                                                                          │
│  NIVO 2: STATION CONTROLLER (srednje poverenje)                         │
│  ───────────────────────────────────────────────                         │
│  Lokacija:    Lokalni kontroler stanice                                 │
│  Autentifikacija: mTLS klijentski sertifikat                            │
│  Mogućnosti:  • Slanje komandi snage                                    │
│               • Čitanje statusa modula                                  │
│               • Ne može ažurirati firmware ili resetovati               │
│  Kompromis:   Zahteva kompromitovan sertifikat ili ranjivost kontrolera │
│                                                                          │
│  NIVO 3: CLOUD/DEPOT (niže poverenje)                                   │
│  ───────────────────────────────────                                     │
│  Lokacija:    Udaljeni serveri                                          │
│  Autentifikacija: API ključ + OAuth2 token                              │
│  Mogućnosti:  • Orkestracija visokog nivoa                              │
│               • Raspoređivanje ažuriranja firmware-a                    │
│               • Čitanje agregirane telemetrije                          │
│  Kompromis:   Izložen internet pretnjama, mora se pretpostaviti potencijalno neprijateljsko │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Matricama Prelaska Poverenja

Kada zahtev prelazi iz nižeg u viši nivo poverenja, potrebna je dodatna validacija:

| Od Nivoa | Ka Nivou | Potrebna Validacija |
|----------|----------|---------------------|
| 3 (Cloud) | 2 (Station) | API ključ + OAuth2, IP whitelist |
| 2 (Station) | 1 (Firmware) | CMAC potpis, sekventni broj |
| 1 (Firmware) | 0 (Hardver) | Nije moguće (hardver je uvek nadređen) |

---

## 3. RBAC za CAN Komande

### 3.1 Definicije Uloga

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DEFINICIJE ULOGA                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  MODULE_PEER (ID: 0x00-0xFE)                                            │
│  ───────────────────────────                                             │
│  Opis:       Drugi EK3 modul u istom rack-u                             │
│  Autentifikacija: Implicitna (isti trust zone)                          │
│  Tipične operacije:                                                      │
│    • Primanje heartbeat-a od vršnjaka                                   │
│    • Učešće u izboru lidera (Raft)                                      │
│    • Deljenje termalnih podataka za balansiranje opterećenja            │
│                                                                          │
│  STATION_CONTROLLER (ID: 0xFF)                                          │
│  ──────────────────────────────                                          │
│  Opis:       Lokalni kontroler stanice za punjenje                      │
│  Autentifikacija: mTLS sertifikat (x.509)                               │
│  Tipične operacije:                                                      │
│    • Postavljanje ciljeva snage                                         │
│    • Start/stop sesije punjenja                                         │
│    • Čitanje statusa i telemetrije modula                               │
│                                                                          │
│  DEPOT_CONTROLLER (ID: preko Station)                                   │
│  ─────────────────────────────────────                                   │
│  Opis:       Upravljanje na nivou depoa                                 │
│  Autentifikacija: Lanac sertifikata (Station → Depot)                   │
│  Tipične operacije:                                                      │
│    • Pokretanje ažuriranja firmware-a                                   │
│    • Pisanje konfiguracije                                              │
│    • Pristup dijagnostici                                               │
│                                                                          │
│  CLOUD_ADMIN (ID: preko Station → Depot)                                │
│  ───────────────────────────────────────                                 │
│  Opis:       Upravljanje udaljenom flotom                               │
│  Autentifikacija: API ključ + OAuth2 + lanac sertifikata                │
│  Tipične operacije:                                                      │
│    • Planiranje održavanja                                              │
│    • Agregacija telemetrije flote                                       │
│    • Komande na visokom nivou (ne direktna kontrola snage)              │
│                                                                          │
│  MAINTENANCE (ID: fizički pristup)                                      │
│  ─────────────────────────────────                                       │
│  Opis:       Tehničar na licu mesta                                     │
│  Autentifikacija: Fizička značka + PIN kod                              │
│  Tipične operacije:                                                      │
│    • Fabrički reset                                                     │
│    • Provizija ključeva                                                 │
│    • Zamena modula                                                      │
│    • Dijagnostika                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Matrica Dozvola

| Dozvola | MODULE_PEER | STATION | DEPOT | CLOUD | MAINTENANCE |
|---------|-------------|---------|-------|-------|-------------|
| READ_STATUS | Da | Da | Da | Da | Da |
| READ_CONFIG | Ne | Da | Da | Da | Da |
| SET_POWER | Ne | Da | Da | Ne | Da |
| SET_LIMITS | Ne | Da | Da | Ne | Da |
| SHUTDOWN | Ne | Da | Da | Da | Da |
| ENABLE | Ne | Da | Da | Ne | Da |
| WRITE_CONFIG | Ne | Ne | Da | Ne | Da |
| FIRMWARE_UPDATE | Ne | Ne | Da | Da | Da |
| FACTORY_RESET | Ne | Ne | Ne | Ne | Da |
| READ_KEYS | Ne | Ne | Ne | Ne | Ne* |
| WRITE_KEYS | Ne | Ne | Ne | Ne | Ne* |

*Ključevi se mogu provizionisati samo tokom proizvodnje

### 3.3 Validacija Komandi

```c
/* Validacija bazirana na ulogama */
typedef enum {
    ROLE_MODULE_PEER = 0,
    ROLE_STATION_CONTROLLER = 1,
    ROLE_DEPOT_CONTROLLER = 2,
    ROLE_CLOUD_ADMIN = 3,
    ROLE_MAINTENANCE = 4
} Role_t;

typedef struct {
    uint32_t permissions;  /* Bitmask dozvola */
    uint8_t min_trust_level;
    bool requires_cmac;
} RoleConfig_t;

static const RoleConfig_t role_configs[] = {
    [ROLE_MODULE_PEER] = {
        .permissions = PERM_READ_STATUS,
        .min_trust_level = 1,
        .requires_cmac = false
    },
    [ROLE_STATION_CONTROLLER] = {
        .permissions = PERM_READ_STATUS | PERM_READ_CONFIG |
                       PERM_SET_POWER | PERM_SET_LIMITS |
                       PERM_SHUTDOWN | PERM_ENABLE,
        .min_trust_level = 2,
        .requires_cmac = true
    },
    /* ... itd ... */
};

bool ValidateRolePermission(Role_t role, Permission_t perm) {
    if (role >= ROLE_COUNT) return false;
    return (role_configs[role].permissions & perm) != 0;
}
```

---

## 4. CMAC Autentifikacija Poruka

### 4.1 Pregled

CAN-FD poruke od station controller-a moraju biti autentifikovane korišćenjem AES-128-CMAC:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CMAC Format Poruke                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  CAN-FD Frame (64 bytes max):                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  Zaglavlje (8 bytes)  │  Payload (48 bytes)  │  CMAC (8 bytes)    │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  CMAC pokriva:                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  CAN ID (4) │ Seq# (2) │ Zaglavlje (8) │ Payload (48)             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  CMAC izračunavanje:                                                    │
│  CMAC = AES-128-CMAC(K, CAN_ID || SeqNum || Header || Payload)         │
│  CMAC u poruci = prvih 8 bytes (skraćeno)                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Implementacija

```c
#include "stm32g4xx_hal.h"

/* STM32G4 ima hardverski AES akcelerator */
#define CMAC_KEY_SIZE   16  /* AES-128 */
#define CMAC_TAG_SIZE   8   /* Skraćeno za CAN efikasnost */

typedef struct {
    uint8_t key[CMAC_KEY_SIZE];
    uint32_t last_seq_num;
} AuthContext_t;

static AuthContext_t auth_ctx;

/* Izračunaj CMAC korišćenjem STM32G4 hardverskog AES */
bool CalculateCMAC(const uint8_t *data, size_t len, uint8_t *cmac_out) {
    CRYP_HandleTypeDef hcryp = {0};

    hcryp.Instance = AES;
    hcryp.Init.DataType = CRYP_DATATYPE_8B;
    hcryp.Init.KeySize = CRYP_KEYSIZE_128B;
    hcryp.Init.Algorithm = CRYP_AES_GCM_GMAC;  /* Koristi za CMAC */

    /* Učitaj ključ */
    if (HAL_CRYP_SetConfig(&hcryp, &hcryp.Init) != HAL_OK) {
        return false;
    }

    /* Izračunaj CMAC */
    uint8_t full_cmac[16];
    if (HAL_CRYPEx_AESCMAC_Generate(&hcryp,
            (uint32_t *)auth_ctx.key,
            (uint32_t *)data,
            len,
            (uint32_t *)full_cmac,
            100) != HAL_OK) {
        return false;
    }

    /* Skrati na 8 bytes */
    memcpy(cmac_out, full_cmac, CMAC_TAG_SIZE);
    return true;
}

/* Verifikuj CMAC primljene poruke */
bool VerifyMessageCMAC(const CANMessage_t *msg) {
    uint8_t buffer[64];
    size_t offset = 0;

    /* Sastavi podatke za verifikaciju */
    memcpy(buffer + offset, &msg->id, 4); offset += 4;
    memcpy(buffer + offset, &msg->seq_num, 2); offset += 2;
    memcpy(buffer + offset, msg->header, 8); offset += 8;
    memcpy(buffer + offset, msg->payload, msg->payload_len); offset += msg->payload_len;

    /* Izračunaj očekivani CMAC */
    uint8_t expected_cmac[CMAC_TAG_SIZE];
    if (!CalculateCMAC(buffer, offset, expected_cmac)) {
        return false;
    }

    /* Poređenje konstantnog vremena da se spreči timing napad */
    uint8_t diff = 0;
    for (int i = 0; i < CMAC_TAG_SIZE; i++) {
        diff |= msg->cmac[i] ^ expected_cmac[i];
    }

    return (diff == 0);
}
```

### 4.3 Replay Zaštita

Svaka autentifikovana poruka uključuje sekventni broj za sprečavanje replay napada:

```c
#define SEQ_WINDOW_SIZE 32  /* Prihvati poruke u okviru ovog prozora */

typedef struct {
    uint16_t expected_seq;
    uint32_t received_bitmap;  /* Bitmap za prozor prihvaćenog */
} SeqTracker_t;

static SeqTracker_t seq_trackers[MAX_SOURCES];

bool CheckSequenceNumber(uint8_t source, uint16_t seq_num) {
    SeqTracker_t *tracker = &seq_trackers[source];

    /* Izračunaj razliku od očekivanog */
    int16_t diff = (int16_t)(seq_num - tracker->expected_seq);

    if (diff < 0) {
        /* Poruka je starija od očekivane */
        if (diff < -SEQ_WINDOW_SIZE) {
            /* Previše stara, odbij */
            return false;
        }
        /* Proveri da li je već primljena */
        uint32_t bit = 1 << (SEQ_WINDOW_SIZE + diff);
        if (tracker->received_bitmap & bit) {
            /* Replay detektovan */
            return false;
        }
        tracker->received_bitmap |= bit;
    } else if (diff == 0) {
        /* Tačno očekivana, ažuriraj prozor */
        tracker->expected_seq++;
        tracker->received_bitmap <<= 1;
        tracker->received_bitmap |= 1;
    } else {
        /* Novija od očekivane, pomeri prozor */
        if (diff >= SEQ_WINDOW_SIZE) {
            /* Veliki skok, resetuj prozor */
            tracker->received_bitmap = 1;
        } else {
            tracker->received_bitmap <<= diff;
            tracker->received_bitmap |= 1;
        }
        tracker->expected_seq = seq_num + 1;
    }

    return true;
}
```

---

## 5. Upravljanje Ključevima

### 5.1 Hijerarhija Ključeva

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      HIJERARHIJA KLJUČEVA                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                    ┌─────────────────────────┐                          │
│                    │    Root Key (K_root)    │                          │
│                    │    Spaljen u OTP        │                          │
│                    │    NIKAD ne napušta čip │                          │
│                    └───────────┬─────────────┘                          │
│                                │                                         │
│              ┌─────────────────┼─────────────────┐                      │
│              │                 │                 │                      │
│              ▼                 ▼                 ▼                      │
│    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐         │
│    │  K_firmware     │ │  K_comms        │ │  K_logging      │         │
│    │  Verifikacija   │ │  Ključ CAN      │ │  Ključ audit    │         │
│    │  firmware-a     │ │  CMAC-a         │ │  loga           │         │
│    └─────────────────┘ └────────┬────────┘ └─────────────────┘         │
│                                 │                                        │
│                         ┌───────┴───────┐                               │
│                         │               │                               │
│                         ▼               ▼                               │
│               ┌─────────────────┐ ┌─────────────────┐                   │
│               │  K_session_n    │ │  K_session_n+1  │                   │
│               │  Sesijski ključ │ │  Sledeći sesijski│                  │
│               └─────────────────┘ └─────────────────┘                   │
│                                                                          │
│  Derivacija:                                                            │
│  K_comms = HKDF(K_root, "EK3-COMMS-V1", module_id)                      │
│  K_session = HKDF(K_comms, "SESSION", timestamp || nonce)               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Bezbedno Skladištenje Ključeva

Korišćenje STM32G4 OTP (One-Time Programmable) i zaštite od čitanja:

```c
/* Konfiguracija skladištenja ključeva */
#define OTP_KEY_ADDR    0x1FFF7000  /* OTP oblast */
#define OTP_KEY_SIZE    32          /* 256-bit root ključ */

/* Pročitaj root ključ iz OTP (samo interno) */
static void LoadRootKey(uint8_t *key_out) {
    /* Direktno memorijsko čitanje iz OTP */
    memcpy(key_out, (const void *)OTP_KEY_ADDR, OTP_KEY_SIZE);
}

/* Deriviraj komm ključ iz root-a */
void DeriveCommKey(uint8_t *comm_key, uint8_t module_id) {
    uint8_t root_key[OTP_KEY_SIZE];
    LoadRootKey(root_key);

    /* HKDF ekspanzija */
    uint8_t info[32];
    snprintf((char *)info, sizeof(info), "EK3-COMMS-V1-%02X", module_id);

    HKDF_Expand(root_key, OTP_KEY_SIZE,
                info, strlen((char *)info),
                comm_key, 16);

    /* Očisti root ključ iz memorije */
    memset(root_key, 0, sizeof(root_key));
}
```

### 5.3 Rotacija Ključeva

Sesijski ključevi se rotiraju periodično ili po zahtevnom događaju:

```c
#define KEY_ROTATION_INTERVAL_MS  (24 * 60 * 60 * 1000)  /* 24 sata */

typedef struct {
    uint8_t current_key[16];
    uint8_t next_key[16];
    uint32_t rotation_time;
    uint8_t key_epoch;
} KeyRotation_t;

static KeyRotation_t key_state;

void CheckKeyRotation(uint32_t current_time) {
    if (current_time >= key_state.rotation_time) {
        /* Rotiraj na sledeći ključ */
        memcpy(key_state.current_key, key_state.next_key, 16);

        /* Generiši novi sledeći ključ */
        uint8_t nonce[8];
        HAL_RNG_GenerateRandomNumber(&hrng, (uint32_t *)nonce);
        HAL_RNG_GenerateRandomNumber(&hrng, (uint32_t *)(nonce + 4));

        DeriveSessionKey(key_state.next_key, current_time, nonce);

        key_state.rotation_time = current_time + KEY_ROTATION_INTERVAL_MS;
        key_state.key_epoch++;

        LogSecurityEvent(SEC_EVENT_KEY_ROTATED, key_state.key_epoch);
    }
}
```

### 5.4 Opoziv Ključa

Ako je modul kompromitovan, njegov ključ mora biti opozvan:

```c
/* Lista opoziva se skladišti u Station Controller-u */
typedef struct {
    uint8_t module_id;
    uint32_t revoked_since;
    uint8_t reason;
} RevokedKey_t;

#define MAX_REVOKED 256
static RevokedKey_t revoked_list[MAX_REVOKED];
static uint16_t revoked_count = 0;

bool IsKeyRevoked(uint8_t module_id) {
    for (uint16_t i = 0; i < revoked_count; i++) {
        if (revoked_list[i].module_id == module_id) {
            return true;
        }
    }
    return false;
}

void RevokeModuleKey(uint8_t module_id, uint8_t reason) {
    if (revoked_count < MAX_REVOKED) {
        revoked_list[revoked_count].module_id = module_id;
        revoked_list[revoked_count].revoked_since = GetCurrentTime();
        revoked_list[revoked_count].reason = reason;
        revoked_count++;

        /* Broadcast opoziva svim modulima */
        BroadcastKeyRevocation(module_id);

        LogSecurityEvent(SEC_EVENT_KEY_REVOKED, module_id);
    }
}
```

---

## 6. Bezbednosni Događaji

### 6.1 Tipovi Događaja

| Kod Događaja | Ime | Ozbiljnost | Opis |
|--------------|-----|------------|------|
| 0x0001 | AUTH_SUCCESS | Info | Uspešna autentifikacija |
| 0x0002 | AUTH_FAILURE | Warning | Neuspela autentifikacija |
| 0x0003 | CMAC_INVALID | Warning | Nevažeći potpis poruke |
| 0x0004 | REPLAY_DETECTED | Warning | Replay napad detektovan |
| 0x0005 | KEY_ROTATED | Info | Rotacija sesijskog ključa |
| 0x0006 | KEY_REVOKED | Alert | Opozvan ključ modula |
| 0x0007 | TAMPER_DETECTED | Critical | Fizički tamper |
| 0x0008 | BOOT_VERIFIED | Info | Secure boot uspešan |
| 0x0009 | BOOT_FAILED | Critical | Secure boot neuspešan |
| 0x000A | FW_UPDATE_START | Info | Početak ažuriranja firmware-a |
| 0x000B | FW_UPDATE_SUCCESS | Info | Ažuriranje uspešno |
| 0x000C | FW_UPDATE_FAILED | Alert | Ažuriranje neuspešno |
| 0x000D | PERMISSION_DENIED | Warning | Pokušaj pristupa odbijen |
| 0x000E | CONFIG_CHANGED | Info | Konfiguracija izmenjena |
| 0x000F | RATE_LIMITED | Warning | Zahtev ograničen stopom |

### 6.2 Format Log Unosa

```c
typedef struct __attribute__((packed)) {
    uint32_t timestamp;     /* Unix timestamp */
    uint16_t event_code;    /* Iz tabele iznad */
    uint8_t severity;       /* 0=Info, 1=Warning, 2=Alert, 3=Critical */
    uint8_t source_id;      /* ID modula ili 0xFF za sistem */
    uint32_t data;          /* Podaci specifični za događaj */
    uint8_t reserved[4];    /* Padding na 16 bytes */
} SecurityLogEntry_t;

void LogSecurityEvent(uint16_t event_code, uint32_t data) {
    SecurityLogEntry_t entry = {
        .timestamp = GetUnixTime(),
        .event_code = event_code,
        .severity = GetEventSeverity(event_code),
        .source_id = GetModuleId(),
        .data = data
    };

    /* Skladišti u sigurnom log bafer (kružni bafer u Flash) */
    WriteSecurityLog(&entry);

    /* Za kritične događaje, odmah javi */
    if (entry.severity >= 2) {
        SendSecurityAlert(&entry);
    }
}
```

### 6.3 Odgovor na Upozorenje

| Ozbiljnost | Odgovor |
|------------|---------|
| Info | Samo loguj |
| Warning | Loguj + povećaj brojač |
| Alert | Loguj + obavesti station controller + mogući derating |
| Critical | Loguj + hitno gašenje + obavesti ceo lanac |

---

## 7. Reference

| Dokument | Opis |
|----------|------|
| `tehnika/10-microkernel-architecture.md` | Granice poverenja i slojevi |
| `tehnika/13-hardware-security.md` | Hardverska bezbednosna implementacija |
| `tehnika/14-firmware-architecture.md` | Secure boot lanac |
| `tehnika/12-audit-logging.md` | Detalji revizijskog logovanja |
| NIST SP 800-108 | Preporuka za derivaciju ključeva |
| RFC 4493 | AES-CMAC specifikacija |

---

## Dodatak A: Bezbednosna Kontrolna Lista

### Proizvodnja

- [ ] Programirati root ključeve u OTP
- [ ] Omogućiti RDP Level 2
- [ ] Verifikovati secure boot lanac
- [ ] Testirati CMAC verifikaciju
- [ ] Potvrditi blokadu tamper-a

### Deployment

- [ ] Generisati jedinstvene sertifikate po stanici
- [ ] Konfigurisati IP whitelist za cloud
- [ ] Omogućiti mrežni firewall
- [ ] Testirati rotaciju ključeva
- [ ] Verifikovati lanac opoziva

### Operacije

- [ ] Pratiti bezbednosne događaje
- [ ] Pregled auth neuspeha sedmično
- [ ] Rotiranje cloud API ključeva kvartalno
- [ ] Testiranje procedure oporavka godišnje
- [ ] Penetraciono testiranje godišnje
