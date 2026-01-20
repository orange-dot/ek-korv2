import { motion } from 'framer-motion';
import { Settings, Zap, Radio, Thermometer } from 'lucide-react';
import ControlSlider from './ControlSlider';
import FaultInjector from './FaultInjector';

/**
 * HAX Demo Control Panel.
 * Contains sliders for power demand, grid frequency, ambient temperature,
 * and fault injection controls.
 */
export default function HAXControlPanel({
  powerDemand,
  gridFrequency,
  ambientTemp,
  selectedModule,
  onPowerChange,
  onFrequencyChange,
  onAmbientChange,
  onInjectFault,
  warnings = {},
  isPending = {},
  disabled = false,
  compact = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        bg-slate-800/95 backdrop-blur border border-slate-700 rounded-xl
        ${compact ? 'p-3' : 'p-4'}
        flex flex-col h-full
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
        <Settings className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-cyan-400`} />
        <h3 className={`font-semibold text-white ${compact ? 'text-sm' : 'text-base'}`}>
          Control Panel
        </h3>
      </div>

      {/* Controls */}
      <div className={`flex-1 space-y-5 ${compact ? 'space-y-3' : ''}`}>
        {/* Power Demand */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Zap className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-cyan-400`} />
            <span className={`text-slate-400 ${compact ? 'text-[10px]' : 'text-xs'} uppercase tracking-wide`}>
              Power Demand
            </span>
          </div>
          <ControlSlider
            label=""
            value={powerDemand}
            min={0}
            max={280}
            step={5}
            unit="kW"
            onChange={onPowerChange}
            warning={warnings.highPower}
            warningMessage="Near maximum capacity"
            disabled={disabled || isPending.power}
            compact={compact}
          />
        </div>

        {/* Grid Frequency */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Radio className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-purple-400`} />
            <span className={`text-slate-400 ${compact ? 'text-[10px]' : 'text-xs'} uppercase tracking-wide`}>
              Grid Frequency
            </span>
          </div>
          <ControlSlider
            label=""
            value={gridFrequency}
            min={49.5}
            max={50.5}
            step={0.01}
            unit="Hz"
            onChange={onFrequencyChange}
            formatValue={(v) => v.toFixed(2)}
            warning={warnings.lowFrequency}
            warningThreshold={49.9}
            warningMessage="V2G activates below 49.9 Hz"
            disabled={disabled || isPending.frequency}
            compact={compact}
          />
        </div>

        {/* Ambient Temperature */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-orange-400`} />
            <span className={`text-slate-400 ${compact ? 'text-[10px]' : 'text-xs'} uppercase tracking-wide`}>
              Ambient Temperature
            </span>
          </div>
          <ControlSlider
            label=""
            value={ambientTemp}
            min={20}
            max={45}
            step={1}
            unit="°C"
            onChange={onAmbientChange}
            warning={warnings.highTemp}
            warningThreshold={35}
            warningMessage="Thermal derating active"
            disabled={disabled || isPending.ambient}
            compact={compact}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 my-4" />

        {/* Fault Injection */}
        <FaultInjector
          selectedModule={selectedModule}
          onInjectFault={onInjectFault}
          disabled={disabled || isPending.fault}
          compact={compact}
        />
      </div>

      {/* Status indicators */}
      <div className={`mt-auto pt-4 border-t border-slate-700 ${compact ? 'pt-3' : ''}`}>
        <div className={`grid grid-cols-3 gap-2 ${compact ? 'gap-1' : ''}`}>
          <StatusIndicator
            label="Power"
            active={powerDemand > 0}
            warning={warnings.highPower}
            compact={compact}
          />
          <StatusIndicator
            label="V2G"
            active={warnings.lowFrequency}
            warning={warnings.lowFrequency}
            color="purple"
            compact={compact}
          />
          <StatusIndicator
            label="Thermal"
            active={warnings.thermalStress}
            warning={warnings.thermalStress}
            color="orange"
            compact={compact}
          />
        </div>
      </div>
    </motion.div>
  );
}

function StatusIndicator({ label, active, warning, color = 'cyan', compact }) {
  const colorClasses = {
    cyan: active ? (warning ? 'bg-yellow-500' : 'bg-cyan-500') : 'bg-slate-600',
    purple: active ? 'bg-purple-500' : 'bg-slate-600',
    orange: active ? 'bg-orange-500' : 'bg-slate-600',
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          ${compact ? 'w-2 h-2' : 'w-3 h-3'} rounded-full mb-1
          ${colorClasses[color]}
          ${active ? 'animate-pulse' : ''}
        `}
      />
      <span className={`text-slate-400 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
        {label}
      </span>
    </div>
  );
}
