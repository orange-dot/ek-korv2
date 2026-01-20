# HAX Demo - Elektrokombinacija

Dedicated demo stack for HAX presentations. Runs the full physics simulation with auto-advancing demo scenarios.

## Quick Start

```bash
cd hax-demo
docker-compose up -d

# Open in browser:
# http://localhost:3000/hax-demo
```

## What You'll See

1. **Landing Screen** - Connection status, demo highlights
2. **Click "Start Demo"** - Auto-advances through 5 phases

## Demo Phases (5 minutes total)

| Phase | Duration | What Happens |
|-------|----------|--------------|
| **INIT** | 10 sec | 84 physics models initialize |
| **BASELINE** | 30 sec | Normal operation, green modules |
| **PEAK** | 45 sec | 250kW demand spike, thermal stress |
| **FAILURE** | 60 sec | Module 42 fails, auto-redistribution |
| **V2G** | 45 sec | Grid frequency dip, buses export power |
| **SUMMARY** | 10 sec | Demo complete |

## Talking Points

### Opening
> "Most hardware startups build first, fail expensive. We simulate first, de-risk decisions."

### During BASELINE
> "You're looking at 84 physics models running at 10,000 ticks per second. Real thermal dynamics. Real efficiency curves."

### During FAILURE
> "I just killed module 42. Watch what happens... The swarm detected the failure in 50 milliseconds and redistributed automatically. Zero human intervention."

### During V2G
> "Grid frequency just dropped to 49.8 Hz. Our buses aren't just charging - they're now exporting power to stabilize the grid. This is V2G."

### Closing
> "This is simulation before silicon. The same approach SpaceX uses for Falcon 9. We de-risk hardware decisions before we spend money on hardware."

## Controls

- **Play/Pause** - Toggle demo playback
- **Phase dots** - Click to jump to any phase
- **F11** - Fullscreen mode (recommended)
- **Reset** - Start over

## Troubleshooting

### Can't connect to engine
```bash
# Check if all containers are running
docker-compose ps

# View engine logs
docker-compose logs engine

# Restart the stack
docker-compose down && docker-compose up -d
```

### Slow performance
The demo runs at 10x speed by default. If the simulation is lagging:
```bash
# Check resource usage
docker stats

# Give more resources to engine
docker-compose up -d --scale engine=1 --force-recreate
```

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Web App    │────▶│   API        │────▶│   Engine     │
│   :3000      │ WS  │   :8000      │ Pub │   (Go)       │
│   React/Vite │     │   Fastify    │ Sub │   10k ticks  │
└──────────────┘     └──────────────┘     └──────────────┘
                            │                    │
                     ┌──────▼──────┐      ┌──────▼──────┐
                     │   Redis     │      │   MongoDB   │
                     │   PubSub    │      │   State     │
                     └─────────────┘      └─────────────┘
```

## Development

To modify the demo without rebuilding:

```bash
# Web app hot reload
cd ../web
npm run dev

# Then access at http://localhost:5173/hax-demo
# (API/Engine must still be running via Docker)
```
