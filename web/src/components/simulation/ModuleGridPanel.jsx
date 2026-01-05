import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Cpu, Thermometer, Zap, Activity } from 'lucide-react';
import { useSimulation, SIM_MODES } from '../../context/SimulationContext';
import { getModuleStateColor, getModuleStateLabel, aggregateModuleStats } from '../../adapters/simulatorAdapter';

/**
 * Collapsible panel showing 84-slot module grid visualization.
 * Shows module states, power output, and thermal status.
 */
export default function ModuleGridPanel() {
  const { mode, modules } = useSimulation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);

  // Only show in live mode
  if (mode !== SIM_MODES.LIVE) {
    return null;
  }

  // Create 84 slots (7 rows x 12 columns)
  const slots = Array(84).fill(null).map((_, i) => {
    const mod = modules.find(m => m.slotIndex === i);
    return mod || {
      slotIndex: i,
      state: 'idle',
      powerOut: 0,
      tempJunction: 25,
      health: 100,
    };
  });

  const stats = aggregateModuleStats(modules);

  // Get Tailwind color class for module state
  const getColorClass = (mod) => {
    const color = getModuleStateColor(mod);
    const colorMap = {
      'red': 'bg-red-500',
      'yellow': 'bg-yellow-500',
      'orange': 'bg-orange-500',
      'purple': 'bg-purple-500',
      'cyan-400': 'bg-cyan-400',
      'cyan-500': 'bg-cyan-500',
      'cyan-600': 'bg-cyan-600',
      'slate-600': 'bg-slate-600',
    };
    return colorMap[color] || 'bg-slate-600';
  };

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-4 z-10 p-1.5 bg-slate-700 hover:bg-slate-600 rounded-full border border-slate-600 shadow-lg transition-colors"
      >
        {isExpanded ? (
          <ChevronLeft className="w-4 h-4 text-slate-300" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-300" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-800/95 backdrop-blur border-r border-slate-700 h-full overflow-hidden"
          >
            <div className="p-4 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center space-x-2 mb-4">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-white">Module Rack</h3>
                <span className="text-xs text-slate-400 ml-auto">84 slots</span>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-2 mb-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2.5 h-2.5 bg-cyan-500 rounded" />
                  <span className="text-slate-400">Active</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded" />
                  <span className="text-slate-400">Fault</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2.5 h-2.5 bg-purple-500 rounded" />
                  <span className="text-slate-400">V2G</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded" />
                  <span className="text-slate-400">Hot</span>
                </div>
              </div>

              {/* Module Grid (7 rows x 12 columns) */}
              <div className="grid grid-cols-12 gap-0.5 mb-4">
                {slots.map((mod, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.003 }}
                    onClick={() => setSelectedModule(selectedModule === i ? null : i)}
                    className={`aspect-square rounded-sm ${getColorClass(mod)}
                      hover:ring-1 hover:ring-white/50 transition-all
                      ${selectedModule === i ? 'ring-2 ring-white' : ''}`}
                    title={`Slot ${i}: ${getModuleStateLabel(mod.state)}`}
                  />
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className="flex items-center space-x-1 text-slate-400 text-xs mb-1">
                    <Activity className="w-3 h-3" />
                    <span>Active</span>
                  </div>
                  <div className="text-white font-mono text-sm">
                    {stats.active}/{stats.total}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className="flex items-center space-x-1 text-slate-400 text-xs mb-1">
                    <Zap className="w-3 h-3" />
                    <span>Power</span>
                  </div>
                  <div className="text-cyan-400 font-mono text-sm">
                    {(stats.totalPower / 1000).toFixed(1)} kW
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className="flex items-center space-x-1 text-slate-400 text-xs mb-1">
                    <Thermometer className="w-3 h-3" />
                    <span>Avg Temp</span>
                  </div>
                  <div className="text-orange-400 font-mono text-sm">
                    {stats.avgTemp.toFixed(1)}°C
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-2">
                  <div className="flex items-center space-x-1 text-slate-400 text-xs mb-1">
                    <Cpu className="w-3 h-3" />
                    <span>Efficiency</span>
                  </div>
                  <div className="text-green-400 font-mono text-sm">
                    {(stats.avgEfficiency * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Selected Module Details */}
              <AnimatePresence>
                {selectedModule !== null && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-slate-700/50 rounded-lg p-3 border border-slate-600"
                  >
                    <div className="text-xs text-slate-400 mb-2">
                      Module {selectedModule}
                    </div>
                    {(() => {
                      const mod = slots[selectedModule];
                      return (
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">State</span>
                            <span className="text-white">{getModuleStateLabel(mod.state)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Power</span>
                            <span className="text-cyan-400 font-mono">{mod.powerOut?.toFixed(0) || 0} W</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Junction</span>
                            <span className="text-orange-400 font-mono">{mod.tempJunction?.toFixed(1) || 0}°C</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Health</span>
                            <span className={`font-mono ${(mod.health || 100) > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                              {mod.health?.toFixed(0) || 100}%
                            </span>
                          </div>
                          {mod.efficiency > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Efficiency</span>
                              <span className="text-white font-mono">{(mod.efficiency * 100).toFixed(1)}%</span>
                            </div>
                          )}
                          {mod.rulHours > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">RUL</span>
                              <span className="text-white font-mono">{mod.rulHours.toFixed(0)} hrs</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Fault indicator */}
              {stats.faulted > 0 && (
                <div className="mt-auto pt-4">
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 text-center">
                    <span className="text-red-400 text-sm font-medium">
                      {stats.faulted} module{stats.faulted > 1 ? 's' : ''} faulted
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed state indicator */}
      {!isExpanded && (
        <div className="w-8 bg-slate-800/95 h-full flex flex-col items-center py-4 border-r border-slate-700">
          <Cpu className="w-4 h-4 text-cyan-400 mb-2" />
          <div className="text-xs text-slate-400 writing-mode-vertical transform rotate-180" style={{ writingMode: 'vertical-rl' }}>
            Modules
          </div>
        </div>
      )}
    </div>
  );
}
