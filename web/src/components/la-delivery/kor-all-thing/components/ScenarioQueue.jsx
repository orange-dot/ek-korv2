import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  AlertTriangle,
  Cloud,
  Link2Off,
  Star,
  Grid3X3,
  Bot,
  Network,
  Zap,
  Truck,
  CheckCircle
} from 'lucide-react';

/**
 * Scenario Queue
 * Displays active scenarios with countdown timers and decision options
 */

const ICON_MAP = {
  weather_alert: Cloud,
  handoff_failure: Link2Off,
  priority_override: Star,
  hub_congestion: Grid3X3,
  emergency_landing: AlertTriangle,
  swarm_rebalance: Network,
  corridor_conflict: AlertTriangle,
  multi_hub_routing: Network,
  swarm_formation_breakdown: Bot,
  intercity_truck_coord: Truck,
  package_priority_conflict: Star,
  hub_power_grid: Zap
};

export function ScenarioQueue({ scenarios = [], onSelect }) {
  if (scenarios.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-500">
        <CheckCircle className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">All systems nominal</p>
        <p className="text-xs mt-1">No active scenarios</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
      <AnimatePresence mode="popLayout">
        {scenarios.map((scenario, index) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            index={index}
            onSelect={onSelect}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ScenarioCard({ scenario, index, onSelect }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  const config = scenario.config || {};
  const Icon = ICON_MAP[scenario.type] || AlertTriangle;

  // Calculate time left
  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(0, (scenario.expiresAt - Date.now()) / 1000);
      setTimeLeft(Math.ceil(remaining));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [scenario.expiresAt]);

  // Handle option selection
  const handleOptionClick = (option) => {
    setSelectedOption(option.id);
    if (onSelect) {
      onSelect(scenario, option);
    }
  };

  const timerPercent = config.timer ? (timeLeft / config.timer) * 100 : 100;
  const isUrgent = timeLeft < 10;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      className={`
        p-4 rounded-xl border transition-all
        ${isUrgent
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-white/5 border-white/10'}
      `}
      style={{
        background: config.bgGradient || undefined
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${config.color || '#888'}20` }}
          >
            <Icon
              className="w-4 h-4"
              style={{ color: config.color || '#888' }}
            />
          </div>
          <div>
            <div
              className="text-sm font-medium"
              style={{ color: config.color || '#fff' }}
            >
              {config.title || scenario.type}
            </div>
            <div className="text-[10px] text-slate-500">
              {scenario.vehicleType} • {scenario.vehicleId}
            </div>
          </div>
        </div>
        <Timer
          seconds={timeLeft}
          percent={timerPercent}
          isUrgent={isUrgent}
        />
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 mb-3 line-clamp-2">
        {config.description || scenario.message}
      </p>

      {/* AI Confidence */}
      {config.aiConfidence && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-slate-500">AI Confidence:</span>
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
              style={{ width: `${config.aiConfidence}%` }}
            />
          </div>
          <span className="text-[10px] text-purple-400">{config.aiConfidence}%</span>
        </div>
      )}

      {/* Options */}
      {config.options && config.options.length > 0 && (
        <div className="space-y-2">
          {config.options.map((option) => (
            <OptionButton
              key={option.id}
              option={option}
              isSelected={selectedOption === option.id}
              disabled={selectedOption !== null}
              onClick={() => handleOptionClick(option)}
              color={config.color}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function Timer({ seconds, percent, isUrgent }) {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className={`flex items-center gap-1 ${isUrgent ? 'animate-pulse' : ''}`}>
        <Clock className={`w-3 h-3 ${isUrgent ? 'text-red-400' : 'text-slate-400'}`} />
        <span className={`text-sm font-mono ${isUrgent ? 'text-red-400' : 'text-white'}`}>
          {seconds}s
        </span>
      </div>
      <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isUrgent ? 'bg-red-500' : 'bg-amber-500'}`}
          initial={{ width: '100%' }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

function OptionButton({ option, isSelected, disabled, onClick, color }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full p-3 rounded-lg border text-left transition-all
        ${isSelected
          ? 'bg-emerald-500/20 border-emerald-500/50'
          : disabled
          ? 'bg-white/5 border-white/10 opacity-50 cursor-not-allowed'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}
      `}
      whileHover={!disabled ? { scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-medium ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
          {option.label}
        </span>
        {option.recommended && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
            RECOMMENDED
          </span>
        )}
        {isSelected && (
          <CheckCircle className="w-4 h-4 text-emerald-400" />
        )}
      </div>
      <p className="text-[10px] text-slate-400 line-clamp-2">
        {option.description}
      </p>
      {option.ifChosen && (
        <p className="text-[9px] text-slate-500 mt-1 italic">
          → {option.ifChosen}
        </p>
      )}
    </motion.button>
  );
}

export default ScenarioQueue;
