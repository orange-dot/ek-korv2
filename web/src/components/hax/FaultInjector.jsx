import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Thermometer, Battery, Cpu, Wifi, ChevronDown, Zap } from 'lucide-react';

/**
 * Fault injection component for HAX demo.
 * Allows selecting a fault type and injecting it into a module.
 */

const FAULT_TYPES = [
  {
    id: 'thermal',
    label: 'Thermal Fault',
    description: 'Junction overtemperature',
    icon: Thermometer,
    color: 'orange',
    severity: 0.8,
  },
  {
    id: 'esr',
    label: 'ESR Degradation',
    description: 'Capacitor aging (high ESR)',
    icon: Battery,
    color: 'yellow',
    severity: 0.5,
  },
  {
    id: 'rdson',
    label: 'RdsOn Fault',
    description: 'MOSFET damage',
    icon: Cpu,
    color: 'red',
    severity: 0.7,
  },
  {
    id: 'communication',
    label: 'Comm Fault',
    description: 'Module offline',
    icon: Wifi,
    color: 'purple',
    severity: 1.0,
  },
];

const colorClasses = {
  orange: 'bg-orange-500/20 border-orange-500/50 text-orange-400 hover:bg-orange-500/30',
  yellow: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30',
  red: 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30',
  purple: 'bg-purple-500/20 border-purple-500/50 text-purple-400 hover:bg-purple-500/30',
};

export default function FaultInjector({
  selectedModule,
  onInjectFault,
  disabled = false,
  compact = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFault, setSelectedFault] = useState(null);
  const [isInjecting, setIsInjecting] = useState(false);

  const handleInjectFault = async (faultType) => {
    if (!onInjectFault || disabled || isInjecting) return;

    setIsInjecting(true);
    setSelectedFault(faultType.id);

    try {
      await onInjectFault(selectedModule, faultType.id, faultType.severity);
    } finally {
      setTimeout(() => {
        setIsInjecting(false);
        setSelectedFault(null);
      }, 500);
    }
  };

  const hasModuleSelected = selectedModule !== null && selectedModule !== undefined;

  return (
    <div className={`space-y-2 ${compact ? 'space-y-1' : ''}`}>
      {/* Header / Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-full flex items-center justify-between px-3 py-2 rounded-lg
          bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-red-400`} />
          <span className={`font-medium text-red-400 ${compact ? 'text-xs' : 'text-sm'}`}>
            Fault Injection
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-red-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Module indicator */}
      {isExpanded && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Target module */}
            <div className={`text-xs text-slate-400 mb-2 ${compact ? 'mb-1' : ''}`}>
              {hasModuleSelected ? (
                <span>Target: <span className="text-white font-mono">Module {selectedModule}</span></span>
              ) : (
                <span className="text-yellow-400">Click a module to select target</span>
              )}
            </div>

            {/* Fault type buttons */}
            <div className={`grid grid-cols-2 gap-2 ${compact ? 'gap-1' : ''}`}>
              {FAULT_TYPES.map((fault) => {
                const Icon = fault.icon;
                const isSelected = selectedFault === fault.id;
                const colors = colorClasses[fault.color];

                return (
                  <motion.button
                    key={fault.id}
                    onClick={() => handleInjectFault(fault)}
                    disabled={!hasModuleSelected || disabled || isInjecting}
                    whileHover={{ scale: hasModuleSelected ? 1.02 : 1 }}
                    whileTap={{ scale: hasModuleSelected ? 0.98 : 1 }}
                    className={`
                      flex flex-col items-start p-2 rounded-lg border transition-all
                      ${colors}
                      ${!hasModuleSelected || disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                      ${isSelected ? 'ring-2 ring-white/50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
                      <span className={`font-medium ${compact ? 'text-[10px]' : 'text-xs'}`}>
                        {fault.label}
                      </span>
                    </div>
                    <span className={`text-slate-400 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
                      {fault.description}
                    </span>

                    {/* Injecting indicator */}
                    {isSelected && isInjecting && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg"
                      >
                        <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export { FAULT_TYPES };
