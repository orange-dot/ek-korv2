import { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_WS_URL = 'ws://localhost:8000/ws/simulation';
const DEFAULT_API_URL = 'http://localhost:8000';
const RECONNECT_DELAY = 2000;

/**
 * Hook to manage WebSocket connection to the Go physics simulator.
 * Returns connection state, simulation data, and control functions.
 */
export function useSimulatorConnection(options = {}) {
  const {
    wsUrl = DEFAULT_WS_URL,
    apiUrl = DEFAULT_API_URL,
    autoConnect = true,
  } = options;

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Simulation data from Go engine
  const [simState, setSimState] = useState(null);
  const [modules, setModules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [stations, setStations] = useState([]);
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
        console.log('[Simulator] WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          switch (msg.type) {
            case 'sim:state':
              setSimState(msg.data);
              break;
            case 'sim:module':
              setModules(msg.data || []);
              break;
            case 'sim:bus':
              setBuses(msg.data || []);
              break;
            case 'sim:station':
              setStations(msg.data || []);
              break;
            case 'sim:metrics':
              setMetrics(msg.data);
              break;
            default:
              // Unknown message type
              break;
          }
        } catch (err) {
          console.error('[Simulator] Failed to parse message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('[Simulator] WebSocket disconnected', event.code);
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
        console.error('[Simulator] WebSocket error:', error);
        setConnectionError('Connection failed');
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[Simulator] Failed to connect:', err);
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
  const sendCommand = useCallback(async (action, value) => {
    try {
      const response = await fetch(`${apiUrl}/api/simulation/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, value }),
      });
      return response.ok;
    } catch (err) {
      console.error('[Simulator] Command failed:', err);
      return false;
    }
  }, [apiUrl]);

  // Trigger a demo scenario
  const triggerScenario = useCallback(async (scenario) => {
    try {
      const response = await fetch(`${apiUrl}/api/simulation/scenario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });
      return response.ok;
    } catch (err) {
      console.error('[Simulator] Scenario trigger failed:', err);
      return false;
    }
  }, [apiUrl]);

  // Inject fault into a module
  const injectFault = useCallback(async (moduleId, faultType, severity) => {
    try {
      const response = await fetch(`${apiUrl}/api/simulation/inject-fault`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, faultType, severity }),
      });
      return response.ok;
    } catch (err) {
      console.error('[Simulator] Fault injection failed:', err);
      return false;
    }
  }, [apiUrl]);

  // Set module power
  const setModulePower = useCallback(async (moduleId, power) => {
    try {
      const response = await fetch(`${apiUrl}/api/simulation/set-module-power`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, power }),
      });
      return response.ok;
    } catch (err) {
      console.error('[Simulator] Set module power failed:', err);
      return false;
    }
  }, [apiUrl]);

  // Distribute rack power
  const distributeRackPower = useCallback(async (rackId, power) => {
    try {
      const response = await fetch(`${apiUrl}/api/simulation/distribute-rack-power`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rackId, power }),
      });
      return response.ok;
    } catch (err) {
      console.error('[Simulator] Distribute rack power failed:', err);
      return false;
    }
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

    // Simulation state
    simState,
    modules,
    buses,
    stations,
    metrics,

    // Control functions
    sendCommand,
    triggerScenario,
    injectFault,
    setModulePower,
    distributeRackPower,
  };
}
