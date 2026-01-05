import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyCors from '@fastify/cors';
import { Redis } from 'ioredis';
import type { WebSocket } from 'ws';
import type { SimulationState, Module, Bus, Station, SimulationMetrics } from './types/index.js';

// Configuration
const PORT = parseInt(process.env.PORT || '8000', 10);
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Fastify instance
const fastify = Fastify({
  logger: true,
});

// State cache (updated from Redis)
let simState: SimulationState | null = null;
let modules: Module[] = [];
let buses: Bus[] = [];
let stations: Station[] = [];
let metrics: SimulationMetrics | null = null;

// WebSocket clients
const wsClients = new Set<WebSocket>();

// Redis subscriber
const redis = new Redis(REDIS_URL);
const redisSub = new Redis(REDIS_URL);

// Subscribe to simulation events
async function setupRedisSubscription() {
  await redisSub.subscribe('sim:state', 'sim:module', 'sim:bus', 'sim:station', 'sim:metrics');

  redisSub.on('message', (channel: string, message: string) => {
    try {
      const data = JSON.parse(message);

      switch (channel) {
        case 'sim:state':
          simState = data as SimulationState;
          break;
        case 'sim:module':
          modules = data as Module[];
          break;
        case 'sim:bus':
          buses = data as Bus[];
          break;
        case 'sim:station':
          stations = data as Station[];
          break;
        case 'sim:metrics':
          metrics = data as SimulationMetrics;
          break;
      }

      // Broadcast to WebSocket clients
      const wsMessage = JSON.stringify({
        type: channel,
        data,
        timestamp: new Date().toISOString(),
      });

      for (const client of wsClients) {
        if (client.readyState === 1) { // WebSocket.OPEN = 1
          client.send(wsMessage);
        }
      }
    } catch (err) {
      fastify.log.error({ err }, 'Failed to parse Redis message');
    }
  });

  fastify.log.info('Subscribed to Redis channels');
}

// Register plugins
async function registerPlugins() {
  await fastify.register(fastifyCors, {
    origin: true,
  });

  await fastify.register(fastifyWebsocket);
}

// Register routes
async function registerRoutes() {
  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Simulation state
  fastify.get('/api/simulation', async () => {
    return simState || { running: false, paused: true };
  });

  // Modules
  fastify.get('/api/modules', async () => {
    return modules;
  });

  fastify.get<{ Params: { id: string } }>('/api/modules/:id', async (request, reply) => {
    const module = modules.find((m) => m.id === request.params.id);
    if (!module) {
      return reply.code(404).send({ error: 'Module not found' });
    }
    return module;
  });

  // Buses
  fastify.get('/api/fleet', async () => {
    return buses;
  });

  fastify.get<{ Params: { id: string } }>('/api/fleet/:id', async (request, reply) => {
    const bus = buses.find((b) => b.id === request.params.id);
    if (!bus) {
      return reply.code(404).send({ error: 'Bus not found' });
    }
    return bus;
  });

  // Stations
  fastify.get('/api/stations', async () => {
    return stations;
  });

  fastify.get<{ Params: { id: string } }>('/api/stations/:id', async (request, reply) => {
    const station = stations.find((s) => s.id === request.params.id);
    if (!station) {
      return reply.code(404).send({ error: 'Station not found' });
    }
    return station;
  });

  // Metrics - aggregated demo/pitch metrics
  fastify.get('/api/metrics', async () => {
    return metrics || {
      simulatedHours: 0,
      realTimeSeconds: 0,
      systemUptime: 0,
      moduleUptime: 0,
      faultsDetected: 0,
      faultsRecovered: 0,
      mtbfHours: 0,
      mttrMinutes: 0,
      avgEfficiency: 0,
      peakEfficiency: 0,
      totalEnergyKwh: 0,
      energyLossKwh: 0,
      modulesReplaced: 0,
      downtimeMinutes: 0,
      downtimeAvoided: 0,
      costSavingsUsd: 0,
      busesCharged: 0,
      swapsCompleted: 0,
      avgChargeTimeMin: 0,
      avgSwapTimeSec: 0,
      fleetSoc: 0,
      v2gEventsCount: 0,
      v2gEnergyKwh: 0,
      v2gRevenueUsd: 0,
      gridFreqMin: 50,
      gridFreqMax: 50,
      loadBalanceScore: 0,
      thermalBalance: 0,
      redundancyLevel: 0,
    };
  });

  // Simulation control (publish to Redis for Go engine to receive)
  fastify.post<{ Body: { action: string; value?: number } }>(
    '/api/simulation/control',
    async (request) => {
      const { action, value } = request.body;
      await redis.publish('sim:control', JSON.stringify({ action, value }));
      return { success: true, action, value };
    }
  );

  // Inject fault into a module
  fastify.post<{ Body: { moduleId: string; faultType: number; severity: number } }>(
    '/api/simulation/inject-fault',
    async (request) => {
      const { moduleId, faultType, severity } = request.body;
      await redis.publish(
        'sim:control',
        JSON.stringify({ action: 'injectFault', moduleId, faultType, severity })
      );
      return { success: true, moduleId, faultType, severity };
    }
  );

  // Set module power
  fastify.post<{ Body: { moduleId: string; power: number } }>(
    '/api/simulation/set-module-power',
    async (request) => {
      const { moduleId, power } = request.body;
      await redis.publish(
        'sim:control',
        JSON.stringify({ action: 'setModulePower', moduleId, power })
      );
      return { success: true, moduleId, power };
    }
  );

  // Distribute rack power
  fastify.post<{ Body: { rackId: string; power: number } }>(
    '/api/simulation/distribute-rack-power',
    async (request) => {
      const { rackId, power } = request.body;
      await redis.publish(
        'sim:control',
        JSON.stringify({ action: 'distributeRackPower', rackId, power })
      );
      return { success: true, rackId, power };
    }
  );

  // Queue bus for swap
  fastify.post<{ Body: { busId: string; stationId: string } }>(
    '/api/simulation/queue-bus-swap',
    async (request) => {
      const { busId, stationId } = request.body;
      await redis.publish(
        'sim:control',
        JSON.stringify({ action: 'queueBusForSwap', busId, stationId })
      );
      return { success: true, busId, stationId };
    }
  );

  // Demo scenarios
  fastify.post<{ Body: { scenario: string } }>(
    '/api/simulation/scenario',
    async (request) => {
      const { scenario } = request.body;

      switch (scenario) {
        case 'normal':
          // Normal day: moderate load, no faults
          await redis.publish('sim:control', JSON.stringify({ action: 'setTimeScale', value: 10 }));
          break;

        case 'peak':
          // Peak demand: high power usage
          await redis.publish('sim:control', JSON.stringify({ action: 'distributeRackPower', rackId: 'rack-0', power: 250000 }));
          break;

        case 'module-failure':
          // Single module failure - swarm redistributes
          await redis.publish('sim:control', JSON.stringify({ action: 'injectFault', moduleId: 'module-42', faultType: 2, severity: 1.0 }));
          break;

        case 'cascade':
          // Multiple failures - stress test swarm intelligence
          for (let i = 40; i < 45; i++) {
            await redis.publish('sim:control', JSON.stringify({ action: 'injectFault', moduleId: `module-${i}`, faultType: 1, severity: 0.8 }));
          }
          break;

        case 'v2g-response':
          // Grid frequency dip - V2G response
          await redis.publish('sim:control', JSON.stringify({ action: 'triggerV2G', frequency: 49.8 }));
          break;

        default:
          return { success: false, error: 'Unknown scenario' };
      }

      return { success: true, scenario };
    }
  );

  // WebSocket endpoint
  fastify.get('/ws/simulation', { websocket: true }, (socket, _req) => {
    const ws = socket as unknown as WebSocket;
    fastify.log.info('WebSocket client connected');
    wsClients.add(ws);

    // Send current state on connect
    if (simState) {
      ws.send(
        JSON.stringify({
          type: 'sim:state',
          data: simState,
          timestamp: new Date().toISOString(),
        })
      );
    }

    ws.on('message', (message: Buffer) => {
      try {
        const msg = JSON.parse(message.toString());
        fastify.log.info({ msg }, 'WebSocket message received');

        // Handle client commands
        if (msg.type === 'subscribe') {
          // Client wants specific updates (future use)
        }
      } catch (err) {
        fastify.log.error({ err }, 'Invalid WebSocket message');
      }
    });

    ws.on('close', () => {
      fastify.log.info('WebSocket client disconnected');
      wsClients.delete(ws);
    });

    ws.on('error', (err: Error) => {
      fastify.log.error({ err }, 'WebSocket error');
      wsClients.delete(ws);
    });
  });
}

// Main
async function main() {
  try {
    await registerPlugins();
    await registerRoutes();
    await setupRedisSubscription();

    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    fastify.log.info(`Server listening on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  fastify.log.info('Shutting down...');
  await redisSub.quit();
  await redis.quit();
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  fastify.log.info('Shutting down...');
  await redisSub.quit();
  await redis.quit();
  await fastify.close();
  process.exit(0);
});

main();
