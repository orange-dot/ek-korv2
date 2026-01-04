import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fastifyCors from '@fastify/cors';
import { Redis } from 'ioredis';
import type { WebSocket } from 'ws';
import type { SimulationState, Module, Bus, Station } from './types/index.js';

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

// WebSocket clients
const wsClients = new Set<WebSocket>();

// Redis subscriber
const redis = new Redis(REDIS_URL);
const redisSub = new Redis(REDIS_URL);

// Subscribe to simulation events
async function setupRedisSubscription() {
  await redisSub.subscribe('sim:state', 'sim:module', 'sim:bus', 'sim:station');

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

  // Simulation control (publish to Redis for Go engine to receive)
  fastify.post<{ Body: { action: string; value?: number } }>(
    '/api/simulation/control',
    async (request) => {
      const { action, value } = request.body;
      await redis.publish('sim:control', JSON.stringify({ action, value }));
      return { success: true, action, value };
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
