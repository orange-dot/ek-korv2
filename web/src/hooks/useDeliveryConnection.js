import { useState, useEffect, useRef, useCallback } from 'react';
import {
  adaptDrone,
  adaptPod,
  adaptSwarmBot,
  adaptHub,
  adaptPackage,
  adaptMetrics,
} from '../adapters/deliveryAdapter';

const DEFAULT_WS_URL = 'ws://localhost:8000/ws/simulation';
const DEFAULT_API_URL = 'http://localhost:8000';
const RECONNECT_DELAY = 2000;

/**
 * Hook to manage WebSocket connection to the delivery simulation backend.
 * Returns connection state, delivery data, and control functions.
 */
export function useDeliveryConnection(options = {}) {
  const {
    wsUrl = DEFAULT_WS_URL,
    apiUrl = DEFAULT_API_URL,
    autoConnect = false,
  } = options;

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Delivery simulation data from backend
  const [simState, setSimState] = useState(null);
  const [drones, setDrones] = useState([]);
  const [pods, setPods] = useState([]);
  const [swarmBots, setSwarmBots] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [packages, setPackages] = useState([]);
  const [corridors, setCorridors] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [zones, setZones] = useState([]);
  const [metrics, setMetrics] = useState(null);

  // WebSocket ref
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const shouldReconnect = useRef(autoConnect);

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Don't connect if already connected or connecting
    if (wsRef.current?.readyState === WebSocket.OPEN ||
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[Delivery] WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          switch (msg.type) {
            case 'delivery:state':
              setSimState(msg.data);
              // Full state update includes all entities
              if (msg.data?.drones) setDrones(msg.data.drones.map(adaptDrone));
              if (msg.data?.pods) setPods(msg.data.pods.map(adaptPod));
              if (msg.data?.swarmBots) setSwarmBots(msg.data.swarmBots.map(adaptSwarmBot));
              if (msg.data?.hubs) setHubs(msg.data.hubs.map(adaptHub));
              if (msg.data?.packages) setPackages(msg.data.packages.map(adaptPackage));
              if (msg.data?.corridors) setCorridors(msg.data.corridors);
              if (msg.data?.routes) setRoutes(msg.data.routes);
              if (msg.data?.zones) setZones(msg.data.zones);
              if (msg.data?.metrics) setMetrics(adaptMetrics(msg.data.metrics));
              break;

            case 'delivery:drone':
              // Individual drone update
              if (Array.isArray(msg.data)) {
                setDrones(msg.data.map(adaptDrone));
              } else if (msg.data) {
                setDrones(prev => {
                  const adapted = adaptDrone(msg.data);
                  const idx = prev.findIndex(d => d.id === adapted.id);
                  if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = adapted;
                    return next;
                  }
                  return [...prev, adapted];
                });
              }
              break;

            case 'delivery:pod':
              if (Array.isArray(msg.data)) {
                setPods(msg.data.map(adaptPod));
              } else if (msg.data) {
                setPods(prev => {
                  const adapted = adaptPod(msg.data);
                  const idx = prev.findIndex(p => p.id === adapted.id);
                  if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = adapted;
                    return next;
                  }
                  return [...prev, adapted];
                });
              }
              break;

            case 'delivery:swarmbot':
              if (Array.isArray(msg.data)) {
                setSwarmBots(msg.data.map(adaptSwarmBot));
              } else if (msg.data) {
                setSwarmBots(prev => {
                  const adapted = adaptSwarmBot(msg.data);
                  const idx = prev.findIndex(s => s.id === adapted.id);
                  if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = adapted;
                    return next;
                  }
                  return [...prev, adapted];
                });
              }
              break;

            case 'delivery:hub':
              if (Array.isArray(msg.data)) {
                setHubs(msg.data.map(adaptHub));
              } else if (msg.data) {
                setHubs(prev => {
                  const adapted = adaptHub(msg.data);
                  const idx = prev.findIndex(h => h.id === adapted.id);
                  if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = adapted;
                    return next;
                  }
                  return [...prev, adapted];
                });
              }
              break;

            case 'delivery:package':
              if (Array.isArray(msg.data)) {
                setPackages(msg.data.map(adaptPackage));
              } else if (msg.data) {
                setPackages(prev => {
                  const adapted = adaptPackage(msg.data);
                  const idx = prev.findIndex(p => p.id === adapted.id);
                  if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = adapted;
                    return next;
                  }
                  return [...prev, adapted];
                });
              }
              break;

            case 'delivery:metrics':
              setMetrics(adaptMetrics(msg.data));
              break;

            default:
              // Unknown message type - might be other sim messages
              break;
          }
        } catch (err) {
          console.error('[Delivery] Failed to parse message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('[Delivery] WebSocket disconnected', event.code);
        setIsConnected(false);
        wsRef.current = null;

        // Auto-reconnect if enabled
        if (shouldReconnect.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        }
      };

      ws.onerror = (error) => {
        console.error('[Delivery] WebSocket error:', error);
        setConnectionError('Connection failed');
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[Delivery] Failed to connect:', err);
      setConnectionError(err.message);

      // Retry connection
      if (shouldReconnect.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, RECONNECT_DELAY);
      }
    }
  }, [wsUrl]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    shouldReconnect.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  // Send control command to API
  const sendCommand = useCallback(async (action, params = {}) => {
    try {
      const response = await fetch(`${apiUrl}/api/delivery/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...params }),
      });
      return response.ok;
    } catch (err) {
      console.error('[Delivery] Command failed:', err);
      return false;
    }
  }, [apiUrl]);

  // Start delivery simulation
  const startSimulation = useCallback(() => {
    return sendCommand('start');
  }, [sendCommand]);

  // Stop delivery simulation
  const stopSimulation = useCallback(() => {
    return sendCommand('stop');
  }, [sendCommand]);

  // Set simulation time scale
  const setTimeScale = useCallback((scale) => {
    return sendCommand('setTimeScale', { value: scale });
  }, [sendCommand]);

  // Dispatch a drone
  const dispatchDrone = useCallback((droneId, targetPos) => {
    return sendCommand('dispatchDrone', { droneId, targetPos });
  }, [sendCommand]);

  // Dispatch a pod
  const dispatchPod = useCallback((podId, routeId) => {
    return sendCommand('dispatchPod', { podId, routeId });
  }, [sendCommand]);

  // Dispatch swarm bots from a pod
  const dispatchSwarm = useCallback((podId, count, zoneId) => {
    return sendCommand('dispatchSwarm', { podId, count, zoneId });
  }, [sendCommand]);

  // Create a new package
  const createPackage = useCallback((origin, destination, priority) => {
    return sendCommand('createPackage', { origin, destination, priority });
  }, [sendCommand]);

  // Trigger emergency return for a vehicle
  const emergencyReturn = useCallback((vehicleId, vehicleType) => {
    return sendCommand('emergencyReturn', { vehicleId, vehicleType });
  }, [sendCommand]);

  // Fetch initial state via REST API
  const fetchState = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/delivery`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setSimState(data);
          if (data.drones) setDrones(data.drones.map(adaptDrone));
          if (data.pods) setPods(data.pods.map(adaptPod));
          if (data.swarmBots) setSwarmBots(data.swarmBots.map(adaptSwarmBot));
          if (data.hubs) setHubs(data.hubs.map(adaptHub));
          if (data.packages) setPackages(data.packages.map(adaptPackage));
          if (data.corridors) setCorridors(data.corridors);
          if (data.routes) setRoutes(data.routes);
          if (data.zones) setZones(data.zones);
          if (data.metrics) setMetrics(adaptMetrics(data.metrics));
        }
        return data;
      }
    } catch (err) {
      console.error('[Delivery] Failed to fetch state:', err);
    }
    return null;
  }, [apiUrl]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      shouldReconnect.current = true;
      connect();
    }

    return () => {
      shouldReconnect.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [autoConnect, connect]);

  return {
    // Connection state
    isConnected,
    connectionError,

    // Connection controls
    connect,
    disconnect,
    fetchState,

    // Delivery simulation state
    simState,
    drones,
    pods,
    swarmBots,
    hubs,
    packages,
    corridors,
    routes,
    zones,
    metrics,

    // Control functions
    sendCommand,
    startSimulation,
    stopSimulation,
    setTimeScale,
    dispatchDrone,
    dispatchPod,
    dispatchSwarm,
    createPackage,
    emergencyReturn,
  };
}

export default useDeliveryConnection;
