import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, AlertTriangle, Radio, Thermometer, RefreshCw, CheckCircle } from 'lucide-react';
import { useSimulation, SIM_MODES } from '../../context/SimulationContext';

/**
 * Small terminal showing KOR v2 decisions in real-time.
 * @param {boolean} compact - If true, uses a more compact layout
 */
export default function KORTerminal({ compact = false }) {
  const { mode, modules, gridState } = useSimulation();
  const [logs, setLogs] = useState([]);
  const prevModulesRef = useRef([]);
  const containerRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  // Generate log entries based on state changes
  useEffect(() => {
    if (mode !== SIM_MODES.LIVE || modules.length === 0) return;

    const prevModules = prevModulesRef.current || [];
    const newLogs = [];
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', { hour12: false });

    // Check for new faults
    const currentFaulted = modules.filter(m => m.state === 'fault').map(m => m.slotIndex);
    const prevFaulted = prevModules.filter(m => m.state === 'fault').map(m => m.slotIndex);
    const newFaults = currentFaulted.filter(id => !prevFaulted.includes(id));

    newFaults.forEach(slot => {
      newLogs.push({
        id: `${Date.now()}-fault-${slot}`,
        time: timestamp,
        type: 'error',
        text: `FAULT module[${slot}] → isolate + redistribute`,
      });
    });

    // Check for fault recovery
    const recoveredFaults = prevFaulted.filter(id => !currentFaulted.includes(id));
    recoveredFaults.forEach(slot => {
      newLogs.push({
        id: `${Date.now()}-recover-${slot}`,
        time: timestamp,
        type: 'success',
        text: `RECOVERED module[${slot}] → reintegrate`,
      });
    });

    // Check for V2G changes
    const currentV2G = modules.filter(m => m.state === 'v2g').length;
    const prevV2G = prevModules.filter(m => m.state === 'v2g').length;

    if (currentV2G > prevV2G) {
      newLogs.push({
        id: `${Date.now()}-v2g-on`,
        time: timestamp,
        type: 'v2g',
        text: `V2G_ENABLE freq=${gridState?.frequency?.toFixed(2) || '49.80'}Hz n=${currentV2G}`,
      });
    } else if (currentV2G < prevV2G && prevV2G > 0) {
      newLogs.push({
        id: `${Date.now()}-v2g-off`,
        time: timestamp,
        type: 'info',
        text: `V2G_DISABLE grid_stable n=${currentV2G}`,
      });
    }

    // Check for thermal events
    const hotNow = modules.filter(m => m.tempJunction > 85).length;
    const hotPrev = prevModules.filter(m => m.tempJunction > 85).length;

    if (hotNow > hotPrev && hotNow > 0) {
      newLogs.push({
        id: `${Date.now()}-thermal`,
        time: timestamp,
        type: 'warning',
        text: `THERMAL_LIMIT n=${hotNow} → derate_power`,
      });
    }

    // Check for significant power changes
    const powerNow = modules.reduce((s, m) => s + (m.powerOut || 0), 0);
    const powerPrev = prevModules.reduce((s, m) => s + (m.powerOut || 0), 0);
    const delta = powerNow - powerPrev;

    if (Math.abs(delta) > 15000 && prevModules.length > 0) {
      newLogs.push({
        id: `${Date.now()}-power`,
        time: timestamp,
        type: 'info',
        text: `REBALANCE ${delta > 0 ? '+' : ''}${(delta/1000).toFixed(1)}kW across ${modules.filter(m => m.state === 'active').length} modules`,
      });
    }

    if (newLogs.length > 0) {
      setLogs(prev => [...prev, ...newLogs].slice(-50)); // Keep last 50
    }

    prevModulesRef.current = modules;
  }, [mode, modules, gridState]);

  // Add initial log on mount
  useEffect(() => {
    if (mode === SIM_MODES.LIVE && logs.length === 0) {
      const now = new Date();
      setLogs([{
        id: 'init',
        time: now.toLocaleTimeString('en-US', { hour12: false }),
        type: 'info',
        text: 'EK-KOR v2 initialized • monitoring 84 modules',
      }]);
    }
  }, [mode, logs.length]);

  const typeColors = {
    error: 'text-red-400',
    warning: 'text-yellow-400',
    success: 'text-green-400',
    v2g: 'text-purple-400',
    info: 'text-cyan-400',
  };

  const typeIcons = {
    error: AlertTriangle,
    warning: Thermometer,
    success: CheckCircle,
    v2g: Radio,
    info: RefreshCw,
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/80 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className={`flex items-center gap-2 bg-slate-800/80 border-b border-slate-700 ${compact ? 'px-2 py-1.5' : 'px-3 py-2'}`}>
        <Terminal className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-cyan-400`} />
        <span className={`font-mono text-slate-300 ${compact ? 'text-[10px]' : 'text-xs'}`}>ek-kor-v2</span>
        <div className="flex-1" />
        <div className={`rounded-full bg-green-500 animate-pulse ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
      </div>

      {/* Log content */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-y-auto font-mono space-y-1 ${compact ? 'p-1.5 text-[10px]' : 'p-2 text-xs'}`}
      >
        <AnimatePresence mode="popLayout">
          {logs.map((log) => {
            const Icon = typeIcons[log.type] || RefreshCw;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-start ${compact ? 'gap-1' : 'gap-2'}`}
              >
                {!compact && <span className="text-slate-600 shrink-0">{log.time}</span>}
                <Icon className={`${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} mt-0.5 shrink-0 ${typeColors[log.type]}`} />
                <span className={`${typeColors[log.type]} ${compact ? 'truncate' : ''}`}>{log.text}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {logs.length === 0 && (
          <div className="text-slate-600 text-center py-4">
            Waiting for events...
          </div>
        )}
      </div>
    </div>
  );
}
