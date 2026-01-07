# Email Draft for Infineon Belgrade

**To:** belgrade@infineon.com
**Subject:** Partnership Inquiry - Modular EV Charging (AURIX TC3xx) - Serbian Startup

---

Dear Infineon Belgrade Team,

I am founder of **Elektrokombinacija**, developing a novel distributed architecture for EV charging infrastructure - a purpose-built RTOS and swarm intelligence protocol that enables fault-tolerant, scalable charging systems.

## Quick Summary

We are developing a **novel distributed architecture** for EV charging infrastructure:

1. **JEZGRO** - A microkernel RTOS designed for power electronics (EDF scheduling, MPU isolation, fault recovery)
2. **ROJ** - Distributed swarm intelligence across hundreds of power modules
3. **EK3** - 3.3kW hot-swappable module as the building block (3kW to 3MW scaling)

**The innovation:** Instead of monolithic chargers with single points of failure, we treat charging infrastructure like a distributed computing cluster. Each module runs JEZGRO, communicates via CAN-FD, and the swarm self-organizes for load balancing, fault tolerance, and predictive maintenance.

**Global market:** Fleet operators, charging networks, OEMs - anyone building 100kW+ charging infrastructure.

## Why We're Contacting Infineon

We have developed **JEZGRO**, a custom RTOS for power electronics, currently running on STM32G474. We want to port it to **AURIX TC375/TC397** for:

- Rack controllers (CAN-FD gateway, fan control)
- V2G gateways (grid sync, ISO 15118)
- Robot controllers (battery swap automation)

The lockstep cores and ASIL-D capability of AURIX are exactly what we need for safety-critical applications.

## Request

1. **Development kits** - TC375 Lite Kit, TC397 TFT Kit
2. **Component samples** - Gate drivers (1ED3124), CAN-FD transceivers (TLE9251V)
3. **Technical meeting** - Discuss architecture and get FAE support

## Scaling Vision

| Phase | Volume | Application |
|-------|--------|-------------|
| 2027 | 1,000+ modules | Pilot deployments (Serbia, EU) |
| 2028 | 10,000+ modules | Fleet operator partnerships |
| 2029 | 50,000+ modules | OEM licensing, global rollout |

The architecture is designed for **licensing to charging OEMs** - JEZGRO + reference designs + manufacturing specs.

## Current Status

JEZGRO is running on STM32G474 (Renode emulation):
- EDF scheduler with preemption
- MPU memory protection
- IPC message passing
- Mutex/Semaphore synchronization
- 22/22 unit tests passing

I have attached a detailed partnership proposal with full technical specifications.

Would you be available for a call or meeting to discuss this opportunity?

Best regards,

**Bojan Janjatović**
Founder & CTO
Elektrokombinacija d.o.o.

Email: bojan@elektrokombinacija.com
Phone: [YOUR PHONE]
Web: https://elektrokombinacija.com

---

**Attachment:** infineon-partner-pitch.pdf (full proposal)
