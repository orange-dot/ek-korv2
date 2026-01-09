# Hardware Decision: XMC4400 for EK3 Modules

**Date:** 2026-01-08

---

## Current Development Status

EK-KOR kernel (JEZGRO) runs on two platforms:

| Platform | Emulator | Notes |
|----------|----------|-------|
| STM32G474 | Renode | Verified |
| TC397XP | Custom | Internal use, unverified |
| XMC4400 | None | Port planned |

The custom TriCore emulator handles basic execution but CSA management, multi-core sync, and interrupt timing need hardware validation.

## XMC4400 Evaluation

Reviewing alternatives for EK3 module control, XMC4400 has relevant specs:

**HRPWM resolution comparison at 500kHz LLC:**
```
Period = 2µs
STM32 @ 170MHz: ~6ns resolution
XMC4400 HRPWM:  150ps resolution
```

XMC4400 is Cortex-M4, same as STM32G474. Port requires new peripheral drivers, core (NVIC, SysTick, PendSV) remains identical.

## Architecture

```
                         FLEET LEVEL
                    ┌─────────────────┐
                    │  TC397 × N      │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │ CHARGER │          │ CHARGER │          │ CHARGER │
   │ TC397×3 │          │ TC397×3 │          │ TC397×3 │
   └────┬────┘          └────┬────┘          └────┬────┘
        │                    │                    │
   ┌────┼────┐          ┌────┼────┐          ┌────┼────┐
   ▼    ▼    ▼          ▼    ▼    ▼          ▼    ▼    ▼
 ┌───┐┌───┐┌───┐      ┌───┐┌───┐┌───┐      ┌───┐┌───┐┌───┐
 │EK3││EK3││...│      │EK3││EK3││...│      │EK3││EK3││...│
 │XMC││XMC││   │      │XMC││XMC││   │      │XMC││XMC││   │
 └───┘└───┘└───┘      └───┘└───┘└───┘      └───┘└───┘└───┘
   MODULE LEVEL          MODULE LEVEL          MODULE LEVEL
```

- XMC4400: EK3 module control (LLC, HRPWM)
- TC397: ROJ coordination (multi-module, multi-charger)
- CAN-FD @ 5 Mbit/s between all nodes

## HAL Structure

```
hal.h          - common interface
hal_stm32.c    - STM32G474
hal_tc397xp.c  - AURIX TC397
hal_xmc4400.c  - planned
```

Scheduler, IPC, ROJ protocol unchanged across platforms.

## Hardware Request

Sent RFQ to Infineon:

- XMC4400 Platform2Go × 2
- XMC4402 MCU × 10
- TC397 TriBoard × 3
- TC397XX MCU × 5
- TLE9251V CAN-FD transceiver × 40
- 1EDI gate drivers, LDOs, current sensors

Goal: 10-node ROJ testbed for hardware validation.

## Next

1. Receive hardware
2. Port EK-KOR to XMC4400
3. Validate TC397 emulator against silicon
4. Multi-node ROJ testing

---

https://elektrokombinacija.com
