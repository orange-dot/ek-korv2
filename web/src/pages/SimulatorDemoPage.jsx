import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Play,
  Pause,
  RotateCcw,
  Zap,
  AlertTriangle,
  Activity,
  Gauge,
  Thermometer,
  Battery,
  Cpu,
  Grid3X3,
  TrendingUp,
  Clock,
  FastForward,
} from 'lucide-react';
import PasswordGate, { ACCESS_TIERS } from '../components/PasswordGate';
import MetricsDashboard from '../components/simulation/MetricsDashboard';

// Demo scenarios
const SCENARIOS = [
  {
    id: 'normal',
    name: 'Normal Operation',
    description: 'Standard day with moderate load',
    icon: Activity,
    color: 'green',
  },
  {
    id: 'peak',
    name: 'Peak Demand',
    description: '250kW demand spike',
    icon: TrendingUp,
    color: 'yellow',
  },
  {
    id: 'module-failure',
    name: 'Module Failure',
    description: 'Single module fault - watch swarm respond',
    icon: AlertTriangle,
    color: 'red',
  },
  {
    id: 'cascade',
    name: 'Cascade Failure',
    description: '5 simultaneous faults - stress test',
    icon: Zap,
    color: 'orange',
  },
  {
    id: 'v2g-response',
    name: 'V2G Response',
    description: 'Grid frequency dip triggers V2G',
    icon: Grid3X3,
    color: 'purple',
  },
];

// Module visualization component
function ModuleGrid({ modules = [] }) {
  // Create 84 module slots (7 rows x 12 columns)
  const slots = Array(84).fill(null).map((_, i) => {
    const mod = modules.find(m => m.slotIndex === i) || {
      state: 'idle',
      powerOut: 0,
      tempJunction: 35,
      health: 100,
    };
    return mod;
  });

  const getStateColor = (state, power, temp) => {
    if (state === 'faulted') return 'bg-red-500';
    if (state === 'thermal_limiting') return 'bg-orange-500';
    if (state === 'marked_for_replacement') return 'bg-yellow-500';
    if (state === 'v2g') return 'bg-purple-500';
    if (power > 0) {
      const intensity = Math.min(power / 3600, 1);
      return intensity > 0.7 ? 'bg-cyan-400' : intensity > 0.3 ? 'bg-cyan-500' : 'bg-cyan-600';
    }
    return 'bg-slate-600';
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Rack Visualization</h3>
        <div className="flex items-center space-x-4 text-xs text-slate-400">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-cyan-500 rounded" />
            <span>Active</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span>Faulted</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-500 rounded" />
            <span>V2G</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-1">
        {slots.map((mod, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.005 }}
            className={`aspect-square rounded-sm ${getStateColor(mod.state, mod.powerOut, mod.tempJunction)}
              hover:ring-2 hover:ring-white/50 cursor-pointer transition-all`}
            title={`Module ${i}: ${mod.state} | ${mod.powerOut?.toFixed(0) || 0}W | ${mod.tempJunction?.toFixed(1) || 0}°C`}
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-slate-400">Active</div>
          <div className="text-white font-mono">
            {modules.filter(m => m.state !== 'faulted').length}/84
          </div>
        </div>
        <div>
          <div className="text-slate-400">Power</div>
          <div className="text-cyan-400 font-mono">
            {(modules.reduce((sum, m) => sum + (m.powerOut || 0), 0) / 1000).toFixed(1)} kW
          </div>
        </div>
        <div>
          <div className="text-slate-400">Avg Temp</div>
          <div className="text-orange-400 font-mono">
            {(modules.reduce((sum, m) => sum + (m.tempJunction || 0), 0) / Math.max(modules.length, 1)).toFixed(1)}°C
          </div>
        </div>
        <div>
          <div className="text-slate-400">Efficiency</div>
          <div className="text-green-400 font-mono">
            {((modules.reduce((sum, m) => sum + (m.efficiency || 0), 0) / Math.max(modules.length, 1)) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

// Simulation controls
function SimulationControls({ isRunning, isPaused, timeScale, onControl, onScenario }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Simulation Control</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isRunning && !isPaused ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className="text-sm text-slate-400">
            {isRunning ? (isPaused ? 'Paused' : 'Running') : 'Stopped'}
          </span>
        </div>
      </div>

      {/* Transport controls */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <button
          onClick={() => onControl('start')}
          disabled={isRunning && !isPaused}
          className="p-3 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-6 h-6" />
        </button>
        <button
          onClick={() => onControl(isPaused ? 'resume' : 'pause')}
          disabled={!isRunning}
          className="p-3 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Pause className="w-6 h-6" />
        </button>
        <button
          onClick={() => onControl('stop')}
          disabled={!isRunning}
          className="p-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Time scale */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Time Scale</span>
          <span className="text-sm text-white font-mono">{timeScale}x</span>
        </div>
        <div className="flex items-center space-x-2">
          <FastForward className="w-4 h-4 text-slate-400" />
          <input
            type="range"
            min="1"
            max="100"
            value={timeScale}
            onChange={(e) => onControl('setTimeScale', parseFloat(e.target.value))}
            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Scenario buttons */}
      <div className="space-y-2">
        <div className="text-sm text-slate-400 mb-2">Demo Scenarios</div>
        {SCENARIOS.map((scenario) => {
          const Icon = scenario.icon;
          return (
            <button
              key={scenario.id}
              onClick={() => onScenario(scenario.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg border border-slate-600
                hover:border-${scenario.color}-500/50 hover:bg-${scenario.color}-500/10 transition-colors text-left`}
            >
              <div className={`p-2 rounded-lg bg-${scenario.color}-500/20`}>
                <Icon className={`w-4 h-4 text-${scenario.color}-400`} />
              </div>
              <div>
                <div className="text-white text-sm font-medium">{scenario.name}</div>
                <div className="text-slate-400 text-xs">{scenario.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Main demo content
function SimulatorDemoContent() {
  const { t } = useTranslation();
  const [isConnected, setIsConnected] = useState(false);
  const [simState, setSimState] = useState({
    running: false,
    paused: false,
    timeScale: 1,
    tickCount: 0,
  });
  const [modules, setModules] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const wsRef = useRef(null);

  const API_URL = 'http://localhost:8000';
  const WS_URL = 'ws://localhost:8000/ws/simulation';

  // Connect to WebSocket
  useEffect(() => {
    const connectWs = () => {
      try {
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            switch (msg.type) {
              case 'sim:state':
                setSimState(msg.data);
                break;
              case 'sim:module':
                setModules(msg.data);
                break;
              case 'sim:metrics':
                setMetrics(msg.data);
                break;
            }
          } catch (err) {
            console.error('Failed to parse message:', err);
          }
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          // Reconnect after 2 seconds
          setTimeout(connectWs, 2000);
        };

        ws.onerror = (err) => {
          console.error('WebSocket error:', err);
        };

        wsRef.current = ws;
      } catch (err) {
        console.error('Failed to connect:', err);
        setTimeout(connectWs, 2000);
      }
    };

    connectWs();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Control simulation
  const handleControl = async (action, value) => {
    try {
      await fetch(`${API_URL}/api/simulation/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, value }),
      });
    } catch (err) {
      console.error('Control failed:', err);
    }
  };

  // Trigger scenario
  const handleScenario = async (scenario) => {
    try {
      await fetch(`${API_URL}/api/simulation/scenario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });
    } catch (err) {
      console.error('Scenario failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-slate-400 hover:text-slate-200">
                <Home className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">EK3 Simulator</h1>
                <p className="text-sm text-slate-400">Physics-First Digital Twin Demo</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${
                isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              {simState.running && (
                <div className="flex items-center space-x-2 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-sm">Tick #{simState.tickCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔌</div>
            <h2 className="text-2xl font-bold text-white mb-2">Simulator Not Connected</h2>
            <p className="text-slate-400 mb-6">
              Start the Go engine and API server to see live simulation data.
            </p>
            <div className="bg-slate-800 rounded-xl p-6 max-w-xl mx-auto text-left">
              <div className="text-sm text-slate-400 mb-2">Quick Start:</div>
              <pre className="text-cyan-400 text-sm">
{`# Terminal 1: Start Redis
docker run -p 6379:6379 redis

# Terminal 2: Start Go Engine
cd simulator/engine && go run ./cmd/simulator

# Terminal 3: Start API
cd simulator/api && npm run dev`}
              </pre>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column: Controls */}
            <div className="lg:col-span-1 space-y-6">
              <SimulationControls
                isRunning={simState.running}
                isPaused={simState.paused}
                timeScale={simState.timeScale || 1}
                onControl={handleControl}
                onScenario={handleScenario}
              />
            </div>

            {/* Right column: Visualization */}
            <div className="lg:col-span-2 space-y-6">
              <ModuleGrid modules={modules} />
              {metrics && <MetricsDashboard metrics={metrics} />}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-xs text-slate-500 text-center">
            EK3 Physics Simulator - Real thermal, electrical, and reliability models running in Go.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function SimulatorDemoPage() {
  return (
    <PasswordGate tier={ACCESS_TIERS.PARTNER}>
      <SimulatorDemoContent />
    </PasswordGate>
  );
}
