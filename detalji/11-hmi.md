# HMI i Korisničko Sučelje za EV Punjače

## 1. HMI Zahtevi

### 1.1 Korisnički Interfejs

```
Osnovni Zahtevi:

1. Fizički elementi:
   ├── Display (touchscreen ili non-touch)
   ├── LED indikatori statusa
   ├── RFID čitač
   ├── Emergency stop button
   └── Connector holder/hook

2. Informacije za korisnika:
   ├── Status punjača (Available/Charging/Faulted)
   ├── Charging progress (%, kWh, time)
   ├── Price information
   ├── Instructions
   └── Error messages

3. Pristupačnost:
   ├── ADA/EN 301 549 compliance
   ├── Readable in sunlight
   ├── Contrast ratio >3:1
   └── Audio feedback option
```

### 1.2 Display Options

```
Display Tipovi:

1. TFT LCD sa Touchscreen:
┌─────────────────────────────────────────────────────────────┐
│ Size: 7-10 inch                                            │
│ Resolution: 800×480 to 1280×800                            │
│ Touch: Capacitive (PCAP)                                   │
│ Brightness: 500-1000 nits (outdoor)                        │
│ Interface: LVDS, HDMI, or MIPI DSI                         │
│                                                             │
│ Pros: Rich UI, interactive                                 │
│ Cons: Cost, power consumption                              │
│ Price: €100-300 (panel only)                               │
└─────────────────────────────────────────────────────────────┘

2. Industrial Panel PC:
┌─────────────────────────────────────────────────────────────┐
│ Complete unit with:                                        │
│ - Touch display (7-15")                                    │
│ - Embedded PC (ARM/x86)                                    │
│ - IP65 front panel                                         │
│                                                             │
│ Examples:                                                   │
│ - Advantech TPC series                                     │
│ - Siemens SIMATIC IPC                                      │
│ - Beijer iX T-series                                       │
│                                                             │
│ Price: €400-1500                                            │
└─────────────────────────────────────────────────────────────┘

3. Simple LCD + LED:
┌─────────────────────────────────────────────────────────────┐
│ Character LCD: 4×20 characters                             │
│ Status LEDs: RGB or multi-color                            │
│ Minimal interaction                                        │
│                                                             │
│ Pros: Low cost, reliable                                   │
│ Cons: Limited information                                  │
│ Price: €30-50                                               │
└─────────────────────────────────────────────────────────────┘
```

## 2. GUI Design

### 2.1 Screen Layout

```
Main Charging Screen:

┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  HEADER: Logo | Time | Status Icon                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │                    MAIN CONTENT                         │ │
│ │                                                         │ │
│ │     ┌─────────────────────────────────────────┐        │ │
│ │     │         SOC Progress Circle             │        │ │
│ │     │              ┌────┐                     │        │ │
│ │     │              │75% │                     │        │ │
│ │     │              └────┘                     │        │ │
│ │     │          ╭──────────╮                   │        │ │
│ │     │         ╱            ╲                  │        │ │
│ │     │        │              │                 │        │ │
│ │     │         ╲            ╱                  │        │ │
│ │     │          ╰──────────╯                   │        │ │
│ │     └─────────────────────────────────────────┘        │ │
│ │                                                         │ │
│ │     Power: 145.2 kW      Energy: 45.3 kWh             │ │
│ │     Time: 18:32          Remaining: ~7 min             │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  FOOTER: [STOP] [INFO] [HELP]                          │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Status Indikatori

```
LED Status Indikatori:

│ Status       │ LED Color     │ Pattern      │ Meaning              │
├──────────────┼───────────────┼──────────────┼──────────────────────┤
│ Available    │ Green         │ Solid        │ Ready to charge      │
│ Connecting   │ Blue          │ Slow blink   │ Vehicle connected    │
│ Authorizing  │ Blue          │ Fast blink   │ Waiting for auth     │
│ Preparing    │ Yellow        │ Pulse        │ Pre-charge active    │
│ Charging     │ Blue          │ Breathing    │ Charging in progress │
│ Finishing    │ Green         │ Fast blink   │ Charge complete      │
│ Suspended    │ Yellow        │ Solid        │ Paused by EV/EVSE    │
│ Faulted      │ Red           │ Slow blink   │ Error occurred       │
│ Unavailable  │ Red           │ Solid        │ Out of service       │

LED Ring Implementation (WS2812B):

    ┌────────────────────────────────┐
    │                                │
    │     ╭──────────────────╮      │
    │    ╱   ● ● ● ● ● ●     ╲     │  24 RGB LEDs
    │   │   ●           ●     │    │  in ring
    │   │  ●   [DISPLAY]  ●   │    │
    │   │   ●           ●     │    │
    │    ╲   ● ● ● ● ● ●     ╱     │
    │     ╰──────────────────╯      │
    │                                │
    └────────────────────────────────┘

Driver: WS2812B addressable LEDs
Control: Single GPIO from MCU
Power: 5V, ~1W for 24 LEDs
Library: FastLED (Arduino) or similar
```

## 3. RFID i Autorizacija

### 3.1 RFID Čitač

```
RFID Standards za EV Charging:

│ Standard   │ Frequency │ Range  │ Use Case           │
├────────────┼───────────┼────────┼────────────────────┤
│ ISO 14443A │ 13.56 MHz │ 10 cm  │ MIFARE, payment    │
│ ISO 14443B │ 13.56 MHz │ 10 cm  │ CALYPSO           │
│ ISO 15693  │ 13.56 MHz │ 1 m    │ Vicinity cards    │
│ ISO 18000  │ 13.56 MHz │ 1 m    │ RFID tags         │

Preporučeno: ISO 14443A (MIFARE compatible)

RFID Reader Modules:

1. HID iCLASS SE:
   - Multi-technology
   - Wiegand/OSDP output
   - Tamper detection
   - Price: ~€80-120

2. Elatec TWN4 MultiTech:
   - 125kHz + 13.56 MHz
   - USB/TTL interface
   - SDK available
   - Price: ~€60-80

3. Feig ID CPR30:
   - Industrial grade
   - IP65 rated
   - RS232/USB
   - Price: ~€100-150

Integration:

    RFID Reader                MCU
    ┌─────────┐              ┌─────┐
    │         │──── UART ────│     │
    │  NFC    │              │     │
    │ Antenna │──── IRQ  ────│     │
    │         │              │     │
    └─────────┘              └─────┘

    When card detected:
    1. Reader sends card UID
    2. MCU queries local whitelist
    3. If not found, send Authorize to CSMS
    4. Display auth result
```

### 3.2 Mobile App Integration

```
App-Based Authorization:

1. QR Code Scan:
   ┌─────────────────────────────────────────────────────────┐
   │ User scans QR code on charger                          │
   │ App sends StartSession request to backend              │
   │ Backend sends RemoteStartTransaction via OCPP          │
   │ Charger starts charging                                │
   └─────────────────────────────────────────────────────────┘

2. Bluetooth Connection:
   ┌─────────────────────────────────────────────────────────┐
   │ App discovers charger via BLE                          │
   │ Secure pairing                                         │
   │ Direct command or via cloud                            │
   └─────────────────────────────────────────────────────────┘

3. Plug & Charge (ISO 15118):
   ┌─────────────────────────────────────────────────────────┐
   │ Vehicle has embedded certificate                       │
   │ Automatic authentication on connection                 │
   │ No user interaction needed                             │
   │ Premium feature, requires ISO 15118-2/20               │
   └─────────────────────────────────────────────────────────┘

QR Code Content:

https://charge.example.com/start?
  station=STATION123&
  connector=1&
  nonce=abc123

// Server validates request, initiates OCPP RemoteStart
```

## 4. Lokalizacija

### 4.1 Multi-Language Support

```
Jezici za EXPO 2027 (Srbija):

1. Srpski (primary)
2. Engleski (international)
3. Nemački (visitors)
4. Kineski (Higer buses)

String Resources:

// strings_sr.json
{
  "welcome": "Добродошли",
  "connect_vehicle": "Повежите возило",
  "charging": "Пуњење у току",
  "complete": "Пуњење завршено",
  "stop": "Стоп",
  "error": "Грешка"
}

// strings_en.json
{
  "welcome": "Welcome",
  "connect_vehicle": "Connect vehicle",
  "charging": "Charging in progress",
  "complete": "Charging complete",
  "stop": "Stop",
  "error": "Error"
}

Language Selection:
- Auto-detect from RFID card region
- Manual selection on screen
- Default based on location
```

## 5. Bill of Materials - HMI

```
┌─────────────────────────────────────────────────────────────────┐
│ HMI KOMPONENTE (150 kW DC Punjač)                               │
├──────────────────────────────┬─────┬────────────┬───────────────┤
│ Komponenta                   │ Qty │ Jed. cena  │    Ukupno     │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ 10" Industrial Touch Panel   │  1  │   €350     │    €350       │
│ (Sunlight readable, IP65)    │     │            │               │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Raspberry Pi CM4 + carrier   │  1  │   €100     │    €100       │
│ (ili SBC za HMI)             │     │            │               │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ RFID Reader ISO 14443        │  1  │    €70     │     €70       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ LED Ring (24× RGB)           │  1  │    €15     │     €15       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Speaker (audio feedback)     │  1  │    €10     │     €10       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Bezels, mounting hardware    │ set │    €40     │     €40       │
├──────────────────────────────┴─────┴────────────┼───────────────┤
│ UKUPNO HMI                                      │    €585       │
└─────────────────────────────────────────────────┴───────────────┘
```
