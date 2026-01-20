# EK Simulator

## Overview

Physics simulation of the EK3 charging system built in Go. Enables pre-hardware validation of distributed RTOS algorithms and power electronics control strategies.

### Simulation Capabilities

- **Thermal modeling** - 3-node RC network with Arrhenius degradation
- **Electrical modeling** - LLC converter with V2G droop control
- **Battery modeling** - SoC/SoH with CC/CV charging
- **Reliability modeling** - Bayesian RUL estimation

### Technical Stack

```
simulator/
├── engine/           # Go physics engine (3,700+ LOC)
│   └── models/       # Physical models (thermal, electrical, battery, reliability)
└── api/              # TypeScript API (WebSocket + REST)
```

### Use Cases

1. **Algorithm development** - Test RTOS coordination without hardware
2. **Failure mode analysis** - Inject faults safely
3. **Thermal/electrical tradeoffs** - Optimize before building
4. **Demo scenarios** - Show system behavior to stakeholders

---

## Validation Status

> **Important:** This simulator is a physics-based model. It has NOT been validated against real hardware measurements.

| Model | Validation Status |
|-------|-------------------|
| Thermal (RC network) | Simulated only - parameters from datasheets |
| Electrical (LLC) | Simulated only - efficiency curves estimated |
| Battery (SoC/SoH) | Simulated only - no real cell data |
| Reliability | Simulated only - statistical models |

### What This Means
- Performance numbers (10,000 tick/sec, 84 modules) are simulation metrics
- Physics models use textbook parameters, not measured values
- Real hardware may behave differently

### Planned Validation
- [ ] Compare thermal model with thermocouple measurements
- [ ] Validate electrical efficiency against bench tests
- [ ] Calibrate battery model with actual cell cycling data

---

## Quick Start

### Prerequisites
- Go 1.21+
- Node.js 18+
- Redis

### Start All Services
```bash
docker-compose up -d
docker-compose logs -f
```

### Manual Start

**Go Engine:**
```bash
cd simulator/engine
go mod tidy
go run ./cmd/simulator
```

**TypeScript API:**
```bash
cd simulator/api
npm install
npm run dev
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | `redis://localhost:6379` | Redis connection |
| `TICK_RATE` | `100ms` | Simulation tick rate |
| `TIME_SCALE` | `1.0` | Time scale (1-1000) |
| `MODULE_COUNT` | `84` | Number of EK3 modules |
| `BUS_COUNT` | `10` | Number of buses |
| `PORT` | `8000` | API server port |

## API Endpoints

### Simulation Control
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/simulation` | Current simulation state |
| POST | `/api/simulation/control` | Start/stop/pause/resume |
| POST | `/api/simulation/scenario` | Inject demo scenario |
| POST | `/api/simulation/inject-fault` | Inject module fault |
| POST | `/api/simulation/set-module-power` | Set module power |
| POST | `/api/simulation/distribute-rack-power` | Distribute rack power |
| POST | `/api/simulation/queue-bus-swap` | Queue bus for swap |

### Entity Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/modules` | All module states |
| GET | `/api/modules/:id` | Specific module |
| GET | `/api/fleet` | All bus states |
| GET | `/api/fleet/:id` | Specific bus |
| GET | `/api/stations` | All station states |
| GET | `/api/stations/:id` | Specific station |

### WebSocket
- `ws://localhost:8000/ws/simulation` - Real-time state stream

## Control Commands

```bash
# Start simulation
curl -X POST http://localhost:8000/api/simulation/control \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'

# Set time scale (10x speed)
curl -X POST http://localhost:8000/api/simulation/control \
  -H "Content-Type: application/json" \
  -d '{"action": "setTimeScale", "value": 10}'

# Inject module failure
curl -X POST http://localhost:8000/api/simulation/inject-fault \
  -H "Content-Type: application/json" \
  -d '{"moduleId": "module-42", "faultType": 2, "severity": 1.0}'

# Trigger V2G response (grid frequency dip)
curl -X POST http://localhost:8000/api/simulation/scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario": "v2g-response"}'

# Cascade failure test
curl -X POST http://localhost:8000/api/simulation/scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario": "cascade"}'
```

## Demo Scenarios

| Scenario | What Happens | What It Shows |
|----------|--------------|---------------|
| `normal` | Standard day operation | Baseline metrics |
| `peak` | 250kW demand spike | Module coordination |
| `module-failure` | Single module fault | Swarm redistribution |
| `cascade` | 5 simultaneous faults | Resilience under stress |
| `v2g-response` | Grid frequency dip | Automatic V2G dispatch |

## Entity States

### EK3 Module
| State | Description |
|-------|-------------|
| `init` | Initializing |
| `idle` | Ready, no power |
| `charging` | Outputting power |
| `v2g` | Vehicle-to-Grid mode |
| `thermal_limiting` | Temperature derating |
| `faulted` | Fault detected |
| `marked_for_replacement` | Needs swap |

### Bus
| State | Description |
|-------|-------------|
| `parked` | At depot |
| `driving` | On route |
| `charging` | Receiving power |
| `swapping` | Battery/module swap |
| `waiting` | In queue |

### Station
| State | Description |
|-------|-------------|
| `offline` | Not operational |
| `idle` | Ready for bus |
| `identifying` | Reading bus ID |
| `preparing` | Robots positioning |
| `swapping` | Swap in progress |
| `verifying` | Post-swap checks |

### Robot
| State | Description |
|-------|-------------|
| `idle` | Ready |
| `moving` | Positioning |
| `gripping` | Grabbing payload |
| `swapping` | Swap operation |
| `returning` | Going home |
| `faulted` | Error state |

## Physical Models

### Thermal Model
- Junction temperature (Tj) based on power loss
- 3-node RC thermal network
- Arrhenius degradation for capacitors (lifetime halves per 10C)
- Coffin-Manson thermal cycling
- Derating curve: 100% @ 35C -> 0% @ 60C

### Electrical Model
- LLC resonant converter efficiency curves
- Power output 0-3600W per module
- Voltage range 50-500V DC
- SiC MOSFET Rds(on) degradation modeling
- V2G droop control (P-f, Q-V)

### Reliability Model
- ESR ratio tracking (capacitor aging)
- Rds(on) ratio tracking (MOSFET degradation)
- Health score 0-100
- RUL (Remaining Useful Life) prediction
- Bayesian fault probability estimation
