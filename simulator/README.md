# EK Simulator

Full-stack simulator za Elektrokombinacija sistem - EK3 moduli, rack-ovi, autobusi, swap stanice, roboti.

## Tech Stack

- **Go** - Simulation engine (goroutines za concurrency)
- **TypeScript/Fastify** - API server + WebSocket
- **MongoDB** - Perzistentni storage
- **Redis** - Pub/Sub za real-time state

## Quick Start

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│               SIMULATION ENGINE (Go)                         │
│  - EK3Module, Rack, Bus, Station, Robot, Grid               │
│  - Physical models (thermal, electrical, battery)           │
│  - State machines za sve entitete                           │
└─────────────────────────────────────────────────────────────┘
            │ Redis Pub/Sub
            ▼
┌─────────────────────────────────────────────────────────────┐
│               API SERVER (TypeScript/Fastify)                │
│  - REST API: /api/modules, /api/fleet, /api/stations        │
│  - WebSocket: /ws/simulation (real-time state)              │
└─────────────────────────────────────────────────────────────┘
            │ HTTP / WebSocket
            ▼
┌─────────────────────────────────────────────────────────────┐
│               FRONTEND (React)                               │
│  - Vizualizacija entiteta na mapi                           │
│  - Real-time metriks                                        │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Simulation
- `GET /api/simulation` - Current simulation state
- `POST /api/simulation/control` - Control simulation (start/pause/speed)

### Modules
- `GET /api/modules` - List all EK3 modules
- `GET /api/modules/:id` - Get specific module

### Fleet
- `GET /api/fleet` - List all buses
- `GET /api/fleet/:id` - Get specific bus

### Stations
- `GET /api/stations` - List all swap stations
- `GET /api/stations/:id` - Get specific station

### WebSocket
- `ws://localhost:8000/ws/simulation` - Real-time state updates

## Environment Variables

### Go Engine
- `REDIS_URL` - Redis connection URL (default: redis://localhost:6379)
- `MONGO_URL` - MongoDB connection URL
- `TICK_RATE` - Simulation tick rate (default: 100ms)
- `TIME_SCALE` - Time scale 1-1000 (default: 1)
- `MODULE_COUNT` - Number of modules (default: 84)
- `BUS_COUNT` - Number of buses (default: 10)

### TypeScript API
- `REDIS_URL` - Redis connection URL
- `MONGO_URL` - MongoDB connection URL
- `PORT` - API port (default: 8000)

## Development

### Go Engine
```bash
cd engine
go mod tidy
go run ./cmd/simulator
```

### TypeScript API
```bash
cd api
npm install
npm run dev
```

## Entity States

### EK3 Module
- `init` - Initializing
- `idle` - Ready, no power
- `charging` - Outputting power
- `v2g` - Vehicle-to-Grid mode
- `thermal_limiting` - Temperature derating
- `faulted` - Fault detected
- `marked_for_replacement` - Needs swap

### Bus
- `parked` - At depot
- `driving` - On route
- `charging` - Receiving power
- `swapping` - Battery/module swap
- `waiting` - In queue

### Station
- `offline` - Not operational
- `idle` - Ready for bus
- `identifying` - Reading bus ID
- `preparing` - Robots positioning
- `swapping` - Swap in progress
- `verifying` - Post-swap checks

### Robot
- `idle` - Ready
- `moving` - Positioning
- `gripping` - Grabbing payload
- `swapping` - Swap operation
- `returning` - Going home
- `faulted` - Error state

## Physical Models

### Thermal Model
- Junction temperature (Tj) based on power loss
- Thermal resistance (Rth) modeling
- Arrhenius degradation for capacitors
- Derating curve: 100% @ 35°C → 0% @ 60°C

### Electrical Model
- LLC resonant converter efficiency curves
- Power output 0-3600W per module
- Voltage range 50-500V DC
- SiC MOSFET Rds(on) degradation

### Reliability Model
- ESR ratio tracking (capacitor aging)
- Rds(on) ratio tracking (MOSFET degradation)
- Health score 0-100
- RUL (Remaining Useful Life) prediction
