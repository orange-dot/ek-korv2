import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Cpu, Thermometer, Zap, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { useSimulation, SIM_MODES } from '../../context/SimulationContext';
import { getModuleStateColor, getModuleStateLabel, aggregateModuleStats } from '../../adapters/simulatorAdapter';
import GridFrequencyIndicator from './GridFrequencyIndicator';

/**
 * Collapsible panel showing 84-slot module grid visualization.
 * Shows module states, power output, thermal status, and V2G activity.
 */
export default function ModuleGridPanel() {
  const { mode, modules, gridState } = useSimulation();
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

  // V2G state
  const v2gEnabled = gridState?.v2gEnabled ?? false;
  const v2gPower = gridState?.v2gPower ?? 0;

  // Count V2G active modules
  const v2gActiveCount = modules.filter(m => m.state === 'v2g').length;

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

  // Check if module is in V2G mode (for special styling)
  const isV2GModule = (mod) => mod.state === 'v2g';

  // Get power direction indicator
  const getPowerDirection = (mod) => {
    if (!mod.powerOut) return null;
    if (mod.state === 'v2g') return 'export'; // V2G = exporting to grid
    if (mod.state === 'active' && mod.powerOut > 0) return 'import'; // Charging = importing from grid
    return null;
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
                {slots.map((mod, i) => {
                  const isV2G = isV2GModule(mod);
                  const powerDir = getPowerDirection(mod);
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.003 }}
                      onClick={() => setSelectedModule(selectedModule === i ? null : i)}
                      className={`aspect-square rounded-sm ${getColorClass(mod)}
                        hover:ring-1 hover:ring-white/50 transition-all relative
                        ${selectedModule === i ? 'ring-2 ring-white' : ''}
                        ${isV2G ? 'shadow-lg shadow-purple-500/50 animate-pulse' : ''}`}
                      title={`Slot ${i}: ${getModuleStateLabel(mod.state)}`}
                    >
                      {/* Power direction indicator */}
                      {powerDir === 'export' && (
                        <ArrowUp className="absolute inset-0 w-full h-full p-0.5 text-white/80" />
                      )}
                      {powerDir === 'import' && (
                        <ArrowDown className="absolute inset-0 w-full h-full p-0.5 text-white/50" />
                      )}
                    </motion.button>
                  );
                })}
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

              {/* Grid Frequency Indicator (V2G) */}
              {gridState && (
                <div className="mb-4">
                  <GridFrequencyIndicator gridState={gridState} compact={false} />
                </div>
              )}

              {/* V2G Stats (when active) */}
              {v2gEnabled && (
                <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-purple-400 text-sm font-medium">V2G Active</span>
                    <span className="text-purple-300 text-xs">
                      {v2gActiveCount} modules
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {v2gPower < 0 ? (
                      <ArrowUp className="w-4 h-4 text-purple-400 animate-pulse" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-cyan-400" />
                    )}
                    <span className="text-white font-mono text-lg">
                      {Math.abs(v2gPower / 1000).toFixed(1)} kW
                    </span>
                    <span className="text-xs text-slate-400">
                      {v2gPower < 0 ? 'to grid' : 'from grid'}
                    </span>
                  </div>
                </div>
              )}

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
