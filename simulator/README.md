# EK Simulator: Physics-First Digital Twin

## Why This Matters for Google

**One sentence:** We built a physics-accurate digital twin before spending a dollar on hardware.

### The Problem with Traditional Hardware Development

1. **Build first, learn later** - Traditional approach builds prototypes, finds problems, iterates
2. **Expensive failures** - Hardware bugs cost 10-100x more to fix than software bugs
3. **Integration surprises** - System behaviors emerge only when components connect
4. **Slow iteration** - Each hardware cycle takes weeks/months

### Our Approach: Simulate Everything First

We built a complete physics simulation of the EK3 charging system in Go:

```
simulator/
├── engine/           # Go physics engine (3,700+ LOC)
│   ├── models/       # Physical models
│   │   ├── thermal.go      # RC network + Arrhenius degradation
│   │   ├── electrical.go   # LLC converter + V2G droop control
│   │   ├── battery.go      # SoC/SoH + CC/CV charging
│   │   └── reliability.go  # Bayesian fault prediction
│   └── engine/       # Entity simulation
│       ├── module.go       # EK3 3.3kW module
│       ├── entities.go     # Racks, buses, stations, robots
│       ├── canbus.go       # CAN-FD network simulation
│       └── simulation.go   # Main loop + Redis pub/sub
└── api/              # TypeScript API (WebSocket + REST)
```

### Physics Models - Not Mockups

**Thermal Model** (`thermal.go`)
- 3-node RC network (junction → heatsink → ambient)
- Arrhenius degradation: lifetime halves every 10°C above rated
- Coffin-Manson thermal cycling: ΔT impacts fatigue life

**Electrical Model** (`electrical.go`)
- LLC resonant converter with variable frequency control
- MOSFET conduction + switching losses with RdsOn aging
- V2G droop control: frequency → active power, voltage → reactive power

**Battery Model** (`battery.go`)
- Equivalent circuit with R0, R1||C1
- CC/CV charging with temperature-dependent C-rate limits
- Calendar + cycle aging using Arrhenius + Ah-throughput

**Reliability Model** (`reliability.go`)
- Exponential failure rate with Weibull early/wear-out
- Bayesian RUL estimation from ESR/RdsOn measurements
- Swarm intelligence for distributed sparing

### Why Go?

1. **Concurrency** - Each entity (module, bus, robot) runs in its own goroutine
2. **Performance** - 10,000 tick/sec simulation with 84+ modules
3. **Simplicity** - Single binary, no runtime dependencies
4. **Type safety** - Catch physics errors at compile time

### Demo Scenarios

The API supports injecting scenarios for live demos:

| Scenario | What Happens | What It Shows |
|----------|--------------|---------------|
| `normal` | Standard day operation | Baseline metrics |
| `peak` | 250kW demand spike | Module coordination |
| `module-failure` | Single module fault | Swarm redistribution |
| `cascade` | 5 simultaneous faults | Resilience under stress |
| `v2g-response` | Grid frequency dip | Automatic V2G dispatch |

### Architecture Benefits

```
┌─────────────────────────────────────────────────────┐
│                     Web Frontend                      │
│  (React + WebSocket)                                  │
└─────────────────────────┬───────────────────────────┘
                          │ WebSocket
┌─────────────────────────▼───────────────────────────┐
│                   TypeScript API                      │
│  (Fastify + Redis Pub/Sub)                           │
└─────────────────────────┬───────────────────────────┘
                          │ Redis
┌─────────────────────────▼───────────────────────────┐
│                   Go Physics Engine                   │
│  - 100ms tick rate                                    │
│  - Parallel entity updates                            │
│  - Time scaling (1x - 1000x)                         │
└─────────────────────────────────────────────────────┘
```

**Decoupled layers:**
- Frontend can be replaced (React → Flutter → native)
- API can scale horizontally
- Engine can run headless in CI/CD

### What This Enables

1. **Design validation** - Test algorithms before building hardware
2. **Failure mode analysis** - Inject faults safely
3. **Performance optimization** - Profile thermal/electrical tradeoffs
4. **Training data generation** - ML models need labeled data
5. **Customer demos** - Show behavior without physical prototype

### The Pitch

> "Most hardware startups show you a prototype and hope it works.
> We show you a simulation that already works, then build hardware
> that matches it."

This is the same approach used by:
- SpaceX (Falcon 9 sim before launch)
- Tesla (Autopilot sim before road testing)
- Waymo (simulation miles before real miles)

We're applying it to power electronics.

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
- Arrhenius degradation for capacitors (lifetime halves per 10°C)
- Coffin-Manson thermal cycling
- Derating curve: 100% @ 35°C → 0% @ 60°C

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
