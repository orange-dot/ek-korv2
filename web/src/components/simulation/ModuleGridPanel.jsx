import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Cpu,
  Thermometer,
  Zap,
  Activity,
  ArrowUp,
  ArrowDown,
  X,
  AlertTriangle,
  Clock,
  Heart,
  Radio,
  RefreshCw,
} from 'lucide-react';
import { useSimulation, SIM_MODES } from '../../context/SimulationContext';
import { getModuleStateColor, getModuleStateLabel, aggregateModuleStats } from '../../adapters/simulatorAdapter';
import GridFrequencyIndicator from './GridFrequencyIndicator';

/**
 * Collapsible panel showing 84-slot module grid visualization.
 * Shows module states, power output, thermal status, and V2G activity.
 * Includes expanded module detail view with all 12 data fields.
 */
export default function ModuleGridPanel({ onSelectModule, onInjectFault, onForceV2G, onResetModule }) {
  const { mode, modules, gridState, injectFault } = useSimulation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

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
      tempCase: 22,
      tempHeatsink: 20,
      health: 100,
      efficiency: 0,
      esrRatio: 1.0,
      rdsonRatio: 1.0,
      rulHours: 50000,
      operatingHours: 0,
      cycles: 0,
      voltage: 0,
      current: 0,
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

  const handleModuleClick = (index) => {
    if (selectedModule === index) {
      setShowDetail(!showDetail);
    } else {
      setSelectedModule(index);
      setShowDetail(true);
    }
    onSelectModule?.(index);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
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
            <div className="p-4 h-full flex flex-col overflow-y-auto">
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
                      onClick={() => handleModuleClick(i)}
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

              {/* Expanded Module Detail */}
              <AnimatePresence>
                {showDetail && selectedModule !== null && (
                  <ExpandedModuleDetail
                    module={slots[selectedModule]}
                    onClose={handleCloseDetail}
                    onInjectFault={onInjectFault || injectFault}
                    onForceV2G={onForceV2G}
                    onReset={onResetModule}
                  />
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

/**
 * Expanded module detail panel showing all 12 data fields.
 */
function ExpandedModuleDetail({ module, onClose, onInjectFault, onForceV2G, onReset }) {
  if (!module) return null;

  const isFaulted = module.state === 'fault';
  const isV2G = module.state === 'v2g';
  const isActive = module.state === 'active';

  // Calculate temperature percentages for visual bars (0-100°C range)
  const tempJunctionPct = Math.min((module.tempJunction || 25) / 100, 1) * 100;
  const tempCasePct = Math.min((module.tempCase || 22) / 100, 1) * 100;
  const tempHeatsinkPct = Math.min((module.tempHeatsink || 20) / 100, 1) * 100;
  const ambientPct = Math.min(25 / 100, 1) * 100;

  // Health bar color
  const healthColor = (module.health || 100) > 80 ? 'bg-green-500' :
    (module.health || 100) > 60 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-slate-700/70 rounded-xl border border-slate-600 overflow-hidden mb-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-700">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="font-medium text-white text-sm">Module {module.slotIndex}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-600 rounded transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* State */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">State</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            isFaulted ? 'bg-red-500/20 text-red-400' :
            isV2G ? 'bg-purple-500/20 text-purple-400' :
            isActive ? 'bg-cyan-500/20 text-cyan-400' :
            'bg-slate-600/50 text-slate-400'
          }`}>
            {getModuleStateLabel(module.state)}
          </span>
        </div>

        {/* Temperatures Section */}
        <div className="space-y-1.5">
          <div className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <Thermometer className="w-3 h-3" />
            Temperatures
          </div>

          <TempBar label="Junction" value={module.tempJunction} percent={tempJunctionPct} />
          <TempBar label="Case" value={module.tempCase || module.tempJunction * 0.85} percent={tempCasePct} />
          <TempBar label="Heatsink" value={module.tempHeatsink || module.tempJunction * 0.7} percent={tempHeatsinkPct} />
          <TempBar label="Ambient" value={25} percent={ambientPct} isAmbient />
        </div>

        {/* Electrical Section */}
        <div className="space-y-1.5">
          <div className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Electrical
          </div>

          <DataRow label="Power Out" value={`${(module.powerOut || 0).toFixed(0)} W`} color="cyan" />
          <DataRow label="Voltage" value={`${(module.voltage || 400).toFixed(1)} V`} />
          <DataRow label="Current" value={`${(module.current || (module.powerOut || 0) / 400).toFixed(2)} A`} />
          <DataRow
            label="Efficiency"
            value={`${((module.efficiency || 0.96) * 100).toFixed(1)}%`}
            color={(module.efficiency || 0.96) > 0.95 ? 'green' : 'yellow'}
          />
        </div>

        {/* Degradation Section */}
        <div className="space-y-1.5">
          <div className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Degradation
          </div>

          <DataRow
            label="ESR Ratio"
            value={`${(module.esrRatio || 1.0).toFixed(2)}x`}
            color={(module.esrRatio || 1.0) < 1.1 ? 'green' : 'orange'}
            sublabel={(module.esrRatio || 1.0) > 1.0 ? `${(((module.esrRatio || 1.0) - 1) * 100).toFixed(0)}% degraded` : null}
          />
          <DataRow
            label="RdsOn Ratio"
            value={`${(module.rdsonRatio || 1.0).toFixed(2)}x`}
            color={(module.rdsonRatio || 1.0) < 1.1 ? 'green' : 'orange'}
            sublabel={(module.rdsonRatio || 1.0) > 1.0 ? `${(((module.rdsonRatio || 1.0) - 1) * 100).toFixed(0)}% degraded` : null}
          />

          {/* Health Bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Heart className="w-3 h-3" />
                Health
              </span>
              <span className={`font-mono ${(module.health || 100) > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                {(module.health || 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${healthColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${module.health || 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lifetime Section */}
        <div className="space-y-1.5">
          <div className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Lifetime
          </div>

          <DataRow label="Operating" value={`${((module.operatingHours || 0) / 1000).toFixed(1)}k hrs`} />
          <DataRow label="Cycles" value={`${((module.cycles || 0) / 1000).toFixed(1)}k`} />
          <DataRow
            label="RUL"
            value={`${((module.rulHours || 50000) / 1000).toFixed(1)}k hrs`}
            color={(module.rulHours || 50000) > 20000 ? 'green' : 'orange'}
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-600 flex gap-2">
          <ActionButton
            icon={AlertTriangle}
            label="Inject Fault"
            color="red"
            onClick={() => onInjectFault?.(module.slotIndex, 'thermal', 0.8)}
            disabled={isFaulted}
          />
          <ActionButton
            icon={Radio}
            label="Force V2G"
            color="purple"
            onClick={() => onForceV2G?.(module.slotIndex)}
            disabled={isV2G || isFaulted}
          />
          <ActionButton
            icon={RefreshCw}
            label="Reset"
            color="slate"
            onClick={() => onReset?.(module.slotIndex)}
            disabled={!isFaulted && !isV2G}
          />
        </div>
      </div>
    </motion.div>
  );
}

function TempBar({ label, value, percent, isAmbient = false }) {
  const getBarColor = () => {
    if (isAmbient) return 'bg-slate-500';
    if (value > 90) return 'bg-red-500';
    if (value > 80) return 'bg-orange-500';
    if (value > 70) return 'bg-yellow-500';
    return 'bg-cyan-500';
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-400 w-16">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-600 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor()} transition-all duration-300`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className={`font-mono w-12 text-right ${isAmbient ? 'text-slate-400' : value > 80 ? 'text-orange-400' : 'text-white'}`}>
        {value?.toFixed(1) || '0.0'}°C
      </span>
    </div>
  );
}

function DataRow({ label, value, color, sublabel }) {
  const colorClasses = {
    cyan: 'text-cyan-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
  };

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-400">{label}</span>
      <div className="text-right">
        <span className={`font-mono ${colorClasses[color] || 'text-white'}`}>{value}</span>
        {sublabel && <span className="text-slate-500 text-[10px] ml-1">({sublabel})</span>}
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, color, onClick, disabled }) {
  const colorClasses = {
    red: 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30',
    purple: 'bg-purple-500/20 border-purple-500/50 text-purple-400 hover:bg-purple-500/30',
    slate: 'bg-slate-600/50 border-slate-500/50 text-slate-400 hover:bg-slate-600/70',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border transition-colors
        ${colorClasses[color]}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      `}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="text-[10px]">{label}</span>
    </button>
  );
}
