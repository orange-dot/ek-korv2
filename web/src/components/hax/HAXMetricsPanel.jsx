import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Zap,
  Thermometer,
  Activity,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Clock,
  TrendingUp,
  TrendingDown,
  Gauge,
  Shield,
  RefreshCw,
  Radio,
} from 'lucide-react';
import { useSimulation, SIM_MODES } from '../../context/SimulationContext';

/**
 * Generate KOR decision messages based on simulation state changes.
 */
function generateKORDecisions(modules, gridState, prevModulesRef) {
  const decisions = [];
  const prevModules = prevModulesRef.current || [];
  const now = Date.now();

  // Check for new faults
  const currentFaulted = modules.filter(m => m.state === 'fault').map(m => m.slotIndex);
  const prevFaulted = prevModules.filter(m => m.state === 'fault').map(m => m.slotIndex);
  const newFaults = currentFaulted.filter(id => !prevFaulted.includes(id));

  newFaults.forEach(slotIndex => {
    decisions.push({
      id: `fault-${slotIndex}-${now}`,
      type: 'fault',
      icon: AlertTriangle,
      color: 'red',
      title: `FAULT DETECTED`,
      message: `Module ${slotIndex} fault detected. Isolating and redistributing load.`,
      timestamp: now,
    });
  });

  // Check for V2G activation
  const currentV2G = modules.filter(m => m.state === 'v2g').length;
  const prevV2G = prevModules.filter(m => m.state === 'v2g').length;

  if (currentV2G > prevV2G && gridState?.v2gEnabled) {
    decisions.push({
      id: `v2g-${now}`,
      type: 'v2g',
      icon: Radio,
      color: 'purple',
      title: `V2G RESPONSE`,
      message: `Grid frequency ${gridState?.frequency?.toFixed(2) || '49.80'} Hz. Activating ${currentV2G} modules for grid support.`,
      timestamp: now,
    });
  }

  // Check for thermal derating
  const hotModules = modules.filter(m => m.tempJunction > 85);
  const prevHotModules = prevModules.filter(m => m.tempJunction > 85);

  if (hotModules.length > prevHotModules.length) {
    decisions.push({
      id: `thermal-${now}`,
      type: 'thermal',
      icon: Thermometer,
      color: 'orange',
      title: `THERMAL MANAGEMENT`,
      message: `${hotModules.length} modules above 85°C. Applying thermal derating.`,
      timestamp: now,
    });
  }

  // Check for load redistribution (power changes)
  const totalPower = modules.reduce((sum, m) => sum + (m.powerOut || 0), 0);
  const prevTotalPower = prevModules.reduce((sum, m) => sum + (m.powerOut || 0), 0);
  const powerDelta = Math.abs(totalPower - prevTotalPower);

  if (powerDelta > 10000 && prevModules.length > 0) { // >10kW change
    decisions.push({
      id: `redistribute-${now}`,
      type: 'redistribute',
      icon: RefreshCw,
      color: 'cyan',
      title: `LOAD REDISTRIBUTION`,
      message: `Power ${totalPower > prevTotalPower ? 'increased' : 'decreased'} by ${(powerDelta / 1000).toFixed(1)} kW. Rebalancing across ${modules.filter(m => m.state === 'active').length} active modules.`,
      timestamp: now,
    });
  }

  return decisions;
}

/**
 * HAX-focused metrics panel showing EK3 module swarm and KOR v2 decisions.
 */
export default function HAXMetricsPanel() {
  const { mode, modules, gridState, metrics, liveSimState } = useSimulation();
  const [decisions, setDecisions] = useState([]);
  const prevModulesRef = useRef([]);
  const maxDecisions = 8;

  // Only render in live mode
  if (mode !== SIM_MODES.LIVE) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        <p>Waiting for live connection...</p>
      </div>
    );
  }

  // Generate decisions on module changes
  useEffect(() => {
    if (modules.length === 0) return;

    const newDecisions = generateKORDecisions(modules, gridState, prevModulesRef);

    if (newDecisions.length > 0) {
      setDecisions(prev => [...newDecisions, ...prev].slice(0, maxDecisions));
    }

    prevModulesRef.current = modules;
  }, [modules, gridState]);

  // Calculate aggregate stats
  const stats = {
    total: 84,
    active: modules.filter(m => m.state === 'active').length,
    idle: modules.filter(m => m.state === 'idle').length,
    faulted: modules.filter(m => m.state === 'fault').length,
    v2g: modules.filter(m => m.state === 'v2g').length,
    totalPower: modules.reduce((sum, m) => sum + (m.powerOut || 0), 0),
    avgTemp: modules.length > 0
      ? modules.reduce((sum, m) => sum + (m.tempJunction || 25), 0) / modules.length
      : 25,
    maxTemp: modules.length > 0
      ? Math.max(...modules.map(m => m.tempJunction || 25))
      : 25,
    avgEfficiency: modules.filter(m => m.efficiency > 0).length > 0
      ? modules.filter(m => m.efficiency > 0).reduce((sum, m) => sum + m.efficiency, 0) / modules.filter(m => m.efficiency > 0).length
      : 0.97,
  };

  const colorForType = (type) => ({
    fault: 'border-red-500/50 bg-red-500/10',
    v2g: 'border-purple-500/50 bg-purple-500/10',
    thermal: 'border-orange-500/50 bg-orange-500/10',
    redistribute: 'border-cyan-500/50 bg-cyan-500/10',
  }[type] || 'border-slate-500/50 bg-slate-500/10');

  const iconColorForType = (type) => ({
    fault: 'text-red-400',
    v2g: 'text-purple-400',
    thermal: 'text-orange-400',
    redistribute: 'text-cyan-400',
  }[type] || 'text-slate-400');

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">EK-KOR v2</h2>
            <p className="text-xs text-slate-400">Swarm Intelligence Controller</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${liveSimState?.running ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
          <span className="text-xs text-slate-400 font-mono">
            {liveSimState?.timeScale || 1}x SPEED
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
            <Activity className="w-4 h-4" />
            <span>Active Modules</span>
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            {stats.active}<span className="text-slate-500 text-lg">/{stats.total}</span>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
            <Zap className="w-4 h-4" />
            <span>Total Power</span>
          </div>
          <div className="text-2xl font-bold text-green-400 font-mono">
            {(stats.totalPower / 1000).toFixed(1)}<span className="text-slate-500 text-lg"> kW</span>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
            <Thermometer className="w-4 h-4" />
            <span>Max Temperature</span>
          </div>
          <div className={`text-2xl font-bold font-mono ${stats.maxTemp > 85 ? 'text-orange-400' : 'text-slate-300'}`}>
            {stats.maxTemp.toFixed(1)}<span className="text-slate-500 text-lg">°C</span>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
            <Gauge className="w-4 h-4" />
            <span>Avg Efficiency</span>
          </div>
          <div className="text-2xl font-bold text-purple-400 font-mono">
            {(stats.avgEfficiency * 100).toFixed(1)}<span className="text-slate-500 text-lg">%</span>
          </div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-4 mb-6">
        {stats.faulted > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/50 rounded-full">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400 font-medium">{stats.faulted} Faulted</span>
          </div>
        )}
        {stats.v2g > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 border border-purple-500/50 rounded-full">
            <Radio className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400 font-medium">{stats.v2g} V2G Active</span>
          </div>
        )}
        {gridState?.frequency && gridState.frequency < 49.9 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/50 rounded-full">
            <TrendingDown className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-400 font-medium">Grid: {gridState.frequency.toFixed(2)} Hz</span>
          </div>
        )}
      </div>

      {/* KOR Decisions Feed */}
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-300">KOR v2 Decisions</h3>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[calc(100%-2rem)]">
          <AnimatePresence mode="popLayout">
            {decisions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-slate-500"
              >
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Monitoring system state...</p>
                <p className="text-xs mt-1">Decisions will appear here</p>
              </motion.div>
            ) : (
              decisions.map((decision, index) => {
                const Icon = decision.icon;
                return (
                  <motion.div
                    key={decision.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 rounded-lg border ${colorForType(decision.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${iconColorForType(decision.type)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold uppercase tracking-wider ${iconColorForType(decision.type)}`}>
                            {decision.title}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(decision.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{decision.message}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
