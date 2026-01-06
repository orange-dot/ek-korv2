# JEZGRO Vodič za simulaciju razvoja

## Informacije o dokumentu

| Polje | Vrednost |
|-------|----------|
| ID dokumenta | EK-TECH-022 |
| Verzija | 1.1 |
| Datum | 2026-01-04 |
| Status | Aktivan |
| Povezano | 16-jezgro.md, 19-jezgro-dev-alternatives.md |

---

## 1. Pregled

Razvoj JEZGRO-a može početi odmah korišćenjem alata za simulaciju i emulaciju. Ovaj dokument pokriva opcije za svaku komponentu Hibridne arhitekture.

### 1.1 Šta se može simulirati

| Komponenta | Kvalitet simulacije | Preporučeni alat |
|------------|---------------------|------------------|
| JEZGRO Kernel (ARM) | ★★★★★ Odličan | Renode, QEMU |
| STM32G474 periferije | ★★★★☆ Vrlo dobar | Renode |
| **XMC4400 (NOVO)** | ★★★★☆ Vrlo dobar | Renode (prilagođeno) |
| AURIX TriCore | ★★★☆☆ Ograničen | TSIM, ADS Simulator |
| TI C2000 | ★★★☆☆ Ograničen | CCS Simulator |
| ESP32-S3 | ★★★★☆ Vrlo dobar | Wokwi, QEMU |
| CAN-FD magistrala | ★★★★★ Odličan | vcan, python-can |
| Višečvorni roj | ★★★★☆ Vrlo dobar | Docker + vcan |

---

## 2. Preporučena strategija razvoja

### 2.1 Faza 0: Razvoj pre dolaska hardvera

```
┌─────────────────────────────────────────────────────────────┐
│              PRISTUP "NAJPRE SIMULACIJA"                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Nedelja 1-2: Razvoj na PC-ju                               │
│  ├── Unit testovi za algoritme kernela                       │
│  ├── Logika raspoređivača (EDF)                             │
│  ├── IPC prosleđivanje poruka                               │
│  └── Strukture podataka                                      │
│                                                              │
│  Nedelja 3-4: ARM simulacija (Renode/QEMU)                  │
│  ├── Boot sekvenca                                           │
│  ├── Promena konteksta                                       │
│  ├── MPU konfiguracija                                       │
│  └── Obrada prekida                                          │
│                                                              │
│  Nedelja 5-6: Virtuelna CAN mreža                           │
│  ├── CAN-FD protokol stek                                    │
│  ├── Višečvorna komunikacija                                 │
│  ├── Izbor lidera                                            │
│  └── Koordinacija roja                                       │
│                                                              │
│  Nedelja 7+: Hardver stiže → Portovanje i validacija        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Podešavanje alata

### 3.1 Renode (preporučen za STM32)

**Renode** je open-source simulator ugrađenih sistema od Antmicro-a. Odličan za ARM Cortex-M razvoj.

#### Instalacija

```bash
# Windows (preko instalera)
# Preuzmi sa: https://renode.io/download/

# Linux
wget https://github.com/renode/renode/releases/download/v1.14.0/renode_1.14.0_amd64.deb
sudo dpkg -i renode_1.14.0_amd64.deb

# macOS
brew install renode
```

#### Pokretanje JEZGRO u Renode-u

```bash
# Pokreni Renode
renode

# U Renode konzoli:
mach create
machine LoadPlatformDescription @stm32g474.repl
sysbus LoadELF @jezgro.elf
showAnalyzer usart1
start
```

### 3.2 Virtuelna CAN magistrala (Linux)

Esencijalno za simulaciju višečvorne komunikacije roja.

#### Podešavanje vcan interfejsa

```bash
# Učitaj kernel modul
sudo modprobe vcan

# Kreiraj virtuelne CAN interfejse
sudo ip link add dev vcan0 type vcan
sudo ip link set up vcan0

# Kreiraj više interfejsa za simulaciju roja
for i in {0..9}; do
    sudo ip link add dev vcan$i type vcan
    sudo ip link set up vcan$i
done
```

#### Python CAN simulacija

```python
#!/usr/bin/env python3
"""
JEZGRO CAN-FD Simulator roja
Simulira više JEZGRO čvorova koji komuniciraju preko virtuelnog CAN-a
"""

import can
import threading
import time

class JezgroCvor:
    """Simulira JEZGRO čvor na CAN magistrali"""

    # ID poruka iz JEZGRO specifikacije
    MSG_HEARTBEAT = 0x100
    MSG_LEADER_ELECTION = 0x110
    MSG_POWER_STATUS = 0x200

    def __init__(self, cvor_id: int, bus: can.Bus):
        self.cvor_id = cvor_id
        self.bus = bus
        self.je_lider = False
        self.lider_id = None
        self.radi = True

    def posalji_heartbeat(self):
        """Šalje periodični heartbeat"""
        msg = can.Message(
            arbitration_id=self.MSG_HEARTBEAT + self.cvor_id,
            data=[self.cvor_id, int(self.je_lider), 0, 0, 0, 0, 0, 0],
            is_fd=True
        )
        self.bus.send(msg)

    def pokreni(self):
        """Glavna petlja čvora"""
        print(f"Čvor {self.cvor_id} pokrenut")

        while self.radi:
            self.posalji_heartbeat()
            time.sleep(0.1)  # 100ms heartbeat


def simuliraj_roj(broj_cvorova: int = 5):
    """Pokreni simulaciju roja sa više čvorova"""

    # Kreiraj virtuelnu CAN magistralu
    bus = can.Bus('vcan0', bustype='socketcan', fd=True)

    # Kreiraj čvorove
    cvorovi = []
    for i in range(broj_cvorova):
        cvor = JezgroCvor(cvor_id=i, bus=bus)
        cvorovi.append(cvor)
        threading.Thread(target=cvor.pokreni).start()

    print(f"Simulacija roja pokrenuta sa {broj_cvorova} čvorova")
    print("Pritisni Ctrl+C za zaustavljanje")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        for cvor in cvorovi:
            cvor.radi = False

    bus.shutdown()


if __name__ == "__main__":
    simuliraj_roj(5)
```

#### Windows alternativa

```python
# Za Windows bez vcan, koristi virtuelnu magistralu
import can

# Kreiraj virtuelnu magistralu (radi na svim platformama)
bus1 = can.Bus('test', bustype='virtual', fd=True)
bus2 = can.Bus('test', bustype='virtual', fd=True)

# Poruke poslate na bus1 se primaju na bus2 i obrnuto
```

### 3.3 Wokwi (ESP32 simulacija)

**Wokwi** je besplatni online simulator za ESP32, Arduino i druge mikrokontrolere.

#### Online simulator

Poseti: https://wokwi.com/

Podržava:
- WiFi simulaciju
- GPIO, I2C, SPI
- UART
- Simulaciju displeja

### 3.4 AURIX simulacija (ograničena)

Infineon pruža ograničenu simulaciju u AURIX Development Studio.

### 3.5 Infineon XMC4400 simulacija (NOVO)

**Ključno otkriće:** Infineon XMC4400 ima **150ps HRPWM** (isto kao TI C2000) ali koristi **ARM Cortex-M4** jezgro koje Renode može da emulira!

#### Zašto XMC4400?

| Karakteristika | XMC4400 | TI C2000 |
|----------------|---------|----------|
| **Arhitektura** | ARM Cortex-M4 | C28x DSP |
| **HRPWM rezolucija** | 150 ps | 150 ps |
| **Renode emulacija** | ✅ Moguća | ❌ Nije podržana |
| **Proizvođač** | Infineon (isti kao AURIX) | TI |

#### Renode podešavanje za XMC4400

```bash
# Koristi prilagođenu platformu
cd pre-hw-dev/renode
renode jezgro-xmc.resc

# U Renode konzoli:
(XMC4400) start
(XMC4400) sysbus.cpu PC    # Proveri program counter
```

#### Prilagođena platforma (xmc4400.repl)

```python
cpu: CPU.CortexM @ sysbus
    cpuType: "cortex-m4f"
    nvic: nvic
    cpuFrequency: 120000000

# HRPWM - Visoko-rezolucioni PWM (150ps)
hrpwm0: Python.PythonPeripheral @ sysbus 0x40028000
    size: 0x4000
    initable: true
    script: '''
if request.isInit:
    log("HRPWM0: Inicijalizovan (150ps rezolucija)")
'''
```

#### Prednosti za JEZGRO razvoj

1. **Emulatibilno** - Celokupna HRPWM logika može se testirati pre hardvera
2. **Isti proizvođač** - Infineon ekosistem (AURIX + XMC)
3. **Ista HRPWM performansa** - 150ps kao C2000
4. **Referentni dizajni** - Würth 3kW LLC konvertor koristi XMC4400

#### Praktičan pristup za AURIX

```
Pošto je AURIX simulacija ograničena:

1. Razvij JEZGRO kernel jezgro na simuliranom STM32 (Renode)
2. Apstrahuj hardverski sloj (HAL) za prenosivost
3. Testiraj algoritme i logiku u simulaciji
4. Portiraj na AURIX kada hardver stigne
5. AURIX-specifične funkcije (lockstep, HSM) testiraj na pravom hardveru
```

---

## 4. Unit testiranje na PC-ju

Pre bilo kakve simulacije, razvij osnovne algoritme na PC-ju.

### 4.1 Struktura projekta

```
jezgro/
├── src/
│   ├── kernel/
│   │   ├── scheduler.c      # EDF raspoređivač
│   │   ├── ipc.c            # Prosleđivanje poruka
│   │   └── context.c        # Promena konteksta (ARM-specifično)
│   ├── hal/
│   │   ├── hal.h            # Apstrakcija hardvera
│   │   ├── hal_stm32.c      # STM32 implementacija
│   │   ├── hal_aurix.c      # AURIX implementacija
│   │   └── hal_sim.c        # Simulacioni stub
│   └── services/
│       ├── power_ctrl.c
│       └── can_gateway.c
├── test/
│   ├── test_scheduler.c
│   ├── test_ipc.c
│   └── test_swarm.c
├── sim/
│   ├── swarm_simulator.py
│   └── can_monitor.py
└── CMakeLists.txt
```

### 4.2 Primer: Test EDF raspoređivača

```c
// test/test_scheduler.c
#include <stdio.h>
#include <assert.h>
#include "../src/kernel/scheduler.h"

void test_edf_prioritet(void) {
    scheduler_init();

    // Kreiraj taskove sa različitim rokovima
    task_t task1 = {.id = 1, .deadline = 100, .state = TASK_READY};
    task_t task2 = {.id = 2, .deadline = 50, .state = TASK_READY};
    task_t task3 = {.id = 3, .deadline = 200, .state = TASK_READY};

    scheduler_add_task(&task1);
    scheduler_add_task(&task2);
    scheduler_add_task(&task3);

    // EDF treba da izabere task2 (najraniji rok)
    task_t *sledeci = scheduler_get_next();
    assert(sledeci->id == 2);
    printf("✓ EDF bira task sa najranijim rokom\n");
}

int main(void) {
    printf("JEZGRO Testovi raspoređivača\n");
    printf("============================\n\n");

    test_edf_prioritet();

    printf("\nSvi testovi prošli!\n");
    return 0;
}
```

---

## 5. Ograničenja simulacije

### 5.1 Šta se ne može simulirati

| Funkcija | Razlog | Rešenje |
|----------|--------|---------|
| AURIX lockstep | Hardverski specifično | Testiraj na pravom TC375 |
| HSM kripto | Bezbednosni hardver | Koristi softverski kripto u sim |
| Tačno vreme | Varijansa PC-ja | Koristi relativno vreme |
| CAN-FD bit timing | Fizički sloj | Testiraj protokol, ne elektriku |
| Energetska elektronika | Analogni domen | Koristi SPICE za power stage |

### 5.2 Simulacija vs realnost

```
Tačnost simulacije po sloju:

┌─────────────────────────────────────────┐
│ Aplikativna logika     │ ████████████ 95%  ← Odlična
├─────────────────────────────────────────┤
│ RTOS Kernel            │ ████████░░░░ 80%  ← Dobra
├─────────────────────────────────────────┤
│ Drajveri periferija    │ ██████░░░░░░ 60%  ← Umerena
├─────────────────────────────────────────┤
│ Hardversko vreme       │ ████░░░░░░░░ 40%  ← Ograničena
├─────────────────────────────────────────┤
│ Električno/Analogno    │ ██░░░░░░░░░░ 20%  ← Slaba
└─────────────────────────────────────────┘
```

---

## 6. Brzi start

### 6.1 Danas (bez hardvera)

```bash
# 1. Kloniraj i podesi
git clone <jezgro-repo>
cd jezgro

# 2. Bilduj i pokreni host testove
mkdir build && cd build
cmake -DBUILD_SIM=ON ..
make
./jezgro_test

# 3. Podesi virtuelni CAN (Linux)
sudo modprobe vcan
sudo ip link add dev vcan0 type vcan
sudo ip link set up vcan0

# 4. Pokreni simulator roja
python3 sim/swarm_simulator.py
```

### 6.2 Ove nedelje

1. **Dan 1-2:** Podesi toolchain, pokreni host testove
2. **Dan 3-4:** Instaliraj Renode, simuliraj STM32 boot
3. **Dan 5-6:** Implementiraj osnovni raspoređivač, testiraj u simulaciji
4. **Dan 7:** Podesi virtuelni CAN, testiraj višečvorno slanje poruka

### 6.3 Pre dolaska hardvera

- [ ] EDF raspoređivač implementiran i testiran
- [ ] IPC prosleđivanje poruka radi u simulaciji
- [ ] CAN-FD protokol stek testiran na vcan
- [ ] Algoritam izbora lidera validiran
- [ ] Osnovna koordinacija roja demonstrirana
- [ ] CI/CD pipeline pokrenut

---

## 7. Reference

| Resurs | URL |
|--------|-----|
| Renode dokumentacija | https://renode.readthedocs.io/ |
| QEMU ARM | https://www.qemu.org/docs/master/system/arm/ |
| python-can | https://python-can.readthedocs.io/ |
| Wokwi ESP32 | https://docs.wokwi.com/guides/esp32 |
| AURIX Dev Studio | https://www.infineon.com/aurix-development-studio |
| SocketCAN | https://docs.kernel.org/networking/can.html |

---

## Istorija izmena

| Datum | Verzija | Opis |
|-------|---------|------|
| 2026-01-04 | 1.0 | Inicijalna verzija |
| 2026-01-04 | 1.1 | Dodata XMC4400 simulacija (ARM Cortex-M4 sa 150ps HRPWM, Renode emulatibilan) |
