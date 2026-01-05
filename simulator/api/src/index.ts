import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyCors from '@fastify/cors';
import { Redis } from 'ioredis';
import type { WebSocket } from 'ws';
import type { SimulationState, Module, Bus, Station, Grid, SimulationMetrics, DeliverySimulationState, Drone, DeliveryPod, SwarmBot, DeliveryHub, Package as DeliveryPackage, DeliveryMetrics } from './types/index.js';

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
let gridState: Grid | null = null;
let metrics: SimulationMetrics | null = null;

// LA Delivery state cache
let deliveryState: DeliverySimulationState | null = null;
let drones: Drone[] = [];
let pods: DeliveryPod[] = [];
let swarmBots: SwarmBot[] = [];
let deliveryHubs: DeliveryHub[] = [];
let packages: DeliveryPackage[] = [];
let deliveryMetrics: DeliveryMetrics | null = null;

// WebSocket clients
const wsClients = new Set<WebSocket>();

// Redis subscriber
const redis = new Redis(REDIS_URL);
const redisSub = new Redis(REDIS_URL);

// Subscribe to simulation events
async function setupRedisSubscription() {
  await redisSub.subscribe(
    'sim:state', 'sim:module', 'sim:bus', 'sim:station', 'sim:grid', 'sim:metrics',
    'delivery:state', 'delivery:drone', 'delivery:pod', 'delivery:swarmbot', 'delivery:hub', 'delivery:package', 'delivery:metrics'
  );

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
        case 'sim:grid':
          gridState = data as Grid;
          break;
        case 'sim:metrics':
          metrics = data as SimulationMetrics;
          break;
        // LA Delivery channels
        case 'delivery:state':
          deliveryState = data as DeliverySimulationState;
          drones = deliveryState.drones || [];
          pods = deliveryState.pods || [];
          swarmBots = deliveryState.swarmBots || [];
          deliveryHubs = deliveryState.hubs || [];
          packages = deliveryState.packages || [];
          deliveryMetrics = deliveryState.metrics || null;
          break;
        case 'delivery:drone':
          drones = data as Drone[];
          break;
        case 'delivery:pod':
          pods = data as DeliveryPod[];
          break;
        case 'delivery:swarmbot':
          swarmBots = data as SwarmBot[];
          break;
        case 'delivery:hub':
          deliveryHubs = data as DeliveryHub[];
          break;
        case 'delivery:package':
          packages = data as DeliveryPackage[];
          break;
        case 'delivery:metrics':
          deliveryMetrics = data as DeliveryMetrics;
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

  // Grid state (for V2G visualization)
  fastify.get('/api/grid', async () => {
    return gridState || {
      frequency: 50.0,
      voltage: 400.0,
      loadDemand: 0,
      v2gEnabled: false,
      v2gPower: 0,
    };
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

  // ===== LA Delivery Endpoints =====

  // Get full delivery simulation state
  fastify.get('/api/delivery', async () => {
    return deliveryState || {
      running: false,
      simTime: 0,
      timeScale: 1,
      drones: [],
      pods: [],
      swarmBots: [],
      hubs: [],
      packages: [],
      corridors: [],
      routes: [],
      zones: [],
      metrics: {
        totalDrones: 0,
        activeDrones: 0,
        totalPods: 0,
        activePods: 0,
        totalSwarmBots: 0,
        activeSwarmBots: 0,
        pendingDeliveries: 0,
        inTransitDeliveries: 0,
        completedDeliveries: 0,
        avgDeliveryTime: 0,
        avgDroneSOC: 0,
        avgPodSOC: 0,
        avgSwarmBotSOC: 0,
        chargingCount: 0,
        fleetUtilization: 0,
        handoffSuccessRate: 0,
      },
    };
  });

  // Get drones
  fastify.get('/api/delivery/drones', async () => {
    return drones;
  });

  fastify.get<{ Params: { id: string } }>('/api/delivery/drones/:id', async (request, reply) => {
    const drone = drones.find((d) => d.id === request.params.id);
    if (!drone) {
      return reply.code(404).send({ error: 'Drone not found' });
    }
    return drone;
  });

  // Get pods
  fastify.get('/api/delivery/pods', async () => {
    return pods;
  });

  fastify.get<{ Params: { id: string } }>('/api/delivery/pods/:id', async (request, reply) => {
    const pod = pods.find((p) => p.id === request.params.id);
    if (!pod) {
      return reply.code(404).send({ error: 'Pod not found' });
    }
    return pod;
  });

  // Get swarm bots
  fastify.get('/api/delivery/swarmbots', async () => {
    return swarmBots;
  });

  fastify.get<{ Params: { id: string } }>('/api/delivery/swarmbots/:id', async (request, reply) => {
    const bot = swarmBots.find((b) => b.id === request.params.id);
    if (!bot) {
      return reply.code(404).send({ error: 'SwarmBot not found' });
    }
    return bot;
  });

  // Get hubs
  fastify.get('/api/delivery/hubs', async () => {
    return deliveryHubs;
  });

  fastify.get<{ Params: { id: string } }>('/api/delivery/hubs/:id', async (request, reply) => {
    const hub = deliveryHubs.find((h) => h.id === request.params.id);
    if (!hub) {
      return reply.code(404).send({ error: 'Hub not found' });
    }
    return hub;
  });

  // Get packages
  fastify.get('/api/delivery/packages', async () => {
    return packages;
  });

  fastify.get<{ Params: { id: string } }>('/api/delivery/packages/:id', async (request, reply) => {
    const pkg = packages.find((p) => p.id === request.params.id);
    if (!pkg) {
      return reply.code(404).send({ error: 'Package not found' });
    }
    return pkg;
  });

  // Get delivery metrics
  fastify.get('/api/delivery/metrics', async () => {
    return deliveryMetrics || {
      totalDrones: 0,
      activeDrones: 0,
      totalPods: 0,
      activePods: 0,
      totalSwarmBots: 0,
      activeSwarmBots: 0,
      pendingDeliveries: 0,
      inTransitDeliveries: 0,
      completedDeliveries: 0,
      avgDeliveryTime: 0,
      avgDroneSOC: 0,
      avgPodSOC: 0,
      avgSwarmBotSOC: 0,
      chargingCount: 0,
      fleetUtilization: 0,
      handoffSuccessRate: 0,
    };
  });

  // Delivery simulation control
  fastify.post<{ Body: { action: string; value?: unknown } }>(
    '/api/delivery/control',
    async (request) => {
      const { action, value } = request.body;
      await redis.publish('delivery:control', JSON.stringify({ action, value }));
      return { success: true, action, value };
    }
  );

  // Add a new package
  fastify.post<{ Body: { priority: string; origin: { lat: number; lng: number }; destination: { lat: number; lng: number }; weight: number; size: string } }>(
    '/api/delivery/packages',
    async (request) => {
      const { priority, origin, destination, weight, size } = request.body;
      await redis.publish('delivery:control', JSON.stringify({
        action: 'addPackage',
        priority,
        origin,
        destination,
        weight,
        size,
      }));
      return { success: true };
    }
  );

  // Dispatch drone manually
  fastify.post<{ Body: { droneId: string; packageId: string } }>(
    '/api/delivery/dispatch-drone',
    async (request) => {
      const { droneId, packageId } = request.body;
      await redis.publish('delivery:control', JSON.stringify({
        action: 'dispatchDrone',
        vehicleId: droneId,
        packageId,
      }));
      return { success: true, droneId, packageId };
    }
  );

  // WebSocket endpoint
  fastify.get('/ws/simulation', { websocket: true }, (connection, _req) => {
    const ws = connection.socket;
    fastify.log.info('WebSocket client connected');
    wsClients.add(ws);

    // Send all current state on connect
    const timestamp = new Date().toISOString();

    if (simState) {
      ws.send(JSON.stringify({ type: 'sim:state', data: simState, timestamp }));
    }
    if (buses.length > 0) {
      ws.send(JSON.stringify({ type: 'sim:bus', data: buses, timestamp }));
    }
    if (stations.length > 0) {
      ws.send(JSON.stringify({ type: 'sim:station', data: stations, timestamp }));
    }
    if (modules.length > 0) {
      ws.send(JSON.stringify({ type: 'sim:module', data: modules, timestamp }));
    }
    if (gridState) {
      ws.send(JSON.stringify({ type: 'sim:grid', data: gridState, timestamp }));
    }
    if (metrics) {
      ws.send(JSON.stringify({ type: 'sim:metrics', data: metrics, timestamp }));
    }

    // Send delivery state on connect
    if (deliveryState) {
      ws.send(JSON.stringify({ type: 'delivery:state', data: deliveryState, timestamp }));
    }
    if (drones.length > 0) {
      ws.send(JSON.stringify({ type: 'delivery:drone', data: drones, timestamp }));
    }
    if (pods.length > 0) {
      ws.send(JSON.stringify({ type: 'delivery:pod', data: pods, timestamp }));
    }
    if (swarmBots.length > 0) {
      ws.send(JSON.stringify({ type: 'delivery:swarmbot', data: swarmBots, timestamp }));
    }
    if (deliveryHubs.length > 0) {
      ws.send(JSON.stringify({ type: 'delivery:hub', data: deliveryHubs, timestamp }));
    }
    if (packages.length > 0) {
      ws.send(JSON.stringify({ type: 'delivery:package', data: packages, timestamp }));
    }
    if (deliveryMetrics) {
      ws.send(JSON.stringify({ type: 'delivery:metrics', data: deliveryMetrics, timestamp }));
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
