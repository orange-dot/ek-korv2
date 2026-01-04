/**
 * Delivery Decision HUD - LA Delivery Simulation
 * Single-focus design with glassmorphism - background visible
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  Link2Off,
  Star,
  Grid3X3,
  AlertTriangle,
  Network,
  Brain,
  CheckCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Radio
} from 'lucide-react';
import { SCENARIO_CONFIG, SCENARIO_TYPES } from '../../data/laDecisionScenarios';

// Icon mapping for scenarios
const SCENARIO_ICONS = {
  Cloud: Cloud,
  LinkSlash: Link2Off,
  Star: Star,
  Grid: Grid3X3,
  AlertTriangle: AlertTriangle,
  Network: Network
};

// Vehicle type display
const VEHICLE_DISPLAY = {
  drone: { icon: '🚁', color: '#00f0ff' },
  pod: { icon: '🚐', color: '#39ff14' },
  swarmbot: { icon: '🤖', color: '#ff006e' }
};

// ============================================================================
// Queue Indicator - Small dots for queued scenarios
// ============================================================================
function QueueIndicator({ scenarios, currentIndex, onSelect }) {
  if (scenarios.length <= 1) return null;

  return (
    <div className="flex items-center gap-2">
      {scenarios.map((s, i) => {
        const config = s.config;
        const isActive = i === currentIndex;
        const remaining = s.expiresAt - Date.now();
        const isUrgent = remaining <= 10000;

        return (
          <button
            key={s.id}
            onClick={() => onSelect(i)}
            className={`relative transition-all ${isActive ? 'scale-125' : 'hover:scale-110'}`}
          >
            <div
              className={`w-3 h-3 rounded-full ${isUrgent ? 'animate-pulse' : ''}`}
              style={{
                background: isActive ? config.color : `${config.color}50`,
                boxShadow: isActive ? `0 0 10px ${config.color}` : 'none'
              }}
            />
            {isUrgent && !isActive && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Main Decision Panel - Single focused scenario
// ============================================================================
function FocusedDecisionPanel({ scenario, onDecision, onDismiss, onNext, onPrev, hasNext, hasPrev, queueLength }) {
  const [timeRemaining, setTimeRemaining] = useState(scenario.expiresAt - Date.now());
  const [selectedOption, setSelectedOption] = useState(null);

  const config = scenario.config;
  const Icon = SCENARIO_ICONS[config.icon] || AlertTriangle;
  const vehicleConfig = VEHICLE_DISPLAY[scenario.vehicleType];

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = scenario.expiresAt - Date.now();
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        const recommended = config.options.find(o => o.recommended);
        if (recommended && onDecision) {
          onDecision(scenario.id, recommended.id, true);
        }
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [scenario, config, onDecision]);

  // Reset selection when scenario changes
  useEffect(() => {
    setSelectedOption(null);
  }, [scenario.id]);

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
    setTimeout(() => {
      onDecision(scenario.id, optionId, false);
    }, 300);
  };

  const seconds = Math.max(0, Math.ceil(timeRemaining / 1000));
  const isUrgent = seconds <= 10;
  const progress = Math.max(0, timeRemaining / (config.timer * 1000));

  return (
    <motion.div
      initial={{ y: 50, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 50, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(10, 10, 20, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${config.color}30`,
        boxShadow: `0 0 40px ${config.color}15, 0 25px 50px rgba(0,0,0,0.5)`
      }}
    >
      {/* Progress bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-black/30">
        <motion.div
          className="h-full"
          style={{ background: isUrgent ? '#ef4444' : config.color }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {/* Left: Scenario info */}
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl"
              style={{ background: `${config.color}20`, border: `1px solid ${config.color}30` }}
            >
              <Icon className="w-6 h-6" style={{ color: config.color }} />
            </div>
            <div>
              <div className="font-bold text-white text-lg">{config.title}</div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="text-xl">{vehicleConfig.icon}</span>
                <span className="font-mono" style={{ color: vehicleConfig.color }}>
                  {scenario.vehicleId.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Center: Timer */}
          <div className="flex items-center gap-4">
            {/* AI Confidence - compact */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
              <Brain className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-mono text-gray-300">{config.aiConfidence}%</span>
            </div>

            {/* Timer - prominent */}
            <div
              className={`flex items-center justify-center w-14 h-14 rounded-full ${isUrgent ? 'animate-pulse' : ''}`}
              style={{
                background: isUrgent ? 'rgba(239,68,68,0.2)' : `${config.color}15`,
                border: `2px solid ${isUrgent ? '#ef4444' : config.color}`,
                boxShadow: `0 0 20px ${isUrgent ? 'rgba(239,68,68,0.4)' : `${config.color}30`}`
              }}
            >
              <div className="text-center">
                <div className="text-xl font-bold font-mono" style={{ color: isUrgent ? '#ef4444' : config.color }}>
                  {seconds}
                </div>
                <div className="text-[9px] text-gray-500 uppercase">sec</div>
              </div>
            </div>
          </div>

          {/* Right: Close & Navigation */}
          <div className="flex items-center gap-2">
            {queueLength > 1 && (
              <>
                <button
                  onClick={onPrev}
                  disabled={!hasPrev}
                  className={`p-1.5 rounded-lg transition-all ${hasPrev ? 'hover:bg-white/10 text-gray-400' : 'text-gray-600 cursor-not-allowed'}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={onNext}
                  disabled={!hasNext}
                  className={`p-1.5 rounded-lg transition-all ${hasNext ? 'hover:bg-white/10 text-gray-400' : 'text-gray-600 cursor-not-allowed'}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={() => onDismiss(scenario.id)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors ml-1"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Description - compact */}
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">{config.description}</p>

        {/* Options - horizontal cards */}
        <div className="flex gap-3">
          {config.options.map((option) => (
            <motion.button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={selectedOption !== null}
              whileHover={{ scale: selectedOption ? 1 : 1.02, y: selectedOption ? 0 : -2 }}
              whileTap={{ scale: selectedOption ? 1 : 0.98 }}
              className={`relative flex-1 p-4 rounded-xl text-left transition-all ${
                selectedOption === option.id
                  ? 'ring-2 ring-green-400'
                  : selectedOption !== null
                    ? 'opacity-40'
                    : ''
              }`}
              style={{
                background: option.recommended
                  ? `linear-gradient(135deg, ${config.color}12 0%, transparent 100%)`
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${option.recommended ? `${config.color}50` : 'rgba(255,255,255,0.08)'}`
              }}
            >
              {/* Recommended badge */}
              {option.recommended && (
                <div
                  className="absolute -top-2 left-3 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide"
                  style={{ background: config.color, color: '#000' }}
                >
                  AI PICK
                </div>
              )}

              <div className="font-semibold text-white mb-1">{option.label}</div>
              <div className="text-xs text-gray-500 mb-2 line-clamp-2">{option.description}</div>

              {/* If chosen preview */}
              <div className="text-xs text-gray-400 pt-2 border-t border-white/5">
                <span className="text-gray-600">→</span>{' '}
                <span className={option.recommended ? 'text-green-400/80' : ''}>
                  {option.ifChosen}
                </span>
              </div>

              {/* Selection indicator */}
              {selectedOption === option.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* AI takeover warning */}
        {isUrgent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center justify-center gap-2 text-sm"
          >
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="text-red-400">AI takes over in {seconds}s</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Minimized Indicator
// ============================================================================
function MinimizedIndicator({ scenarios, onExpand }) {
  const urgentCount = scenarios.filter(s => (s.expiresAt - Date.now()) <= 10000).length;

  return (
    <motion.button
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 30, opacity: 0 }}
      onClick={onExpand}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-full ${urgentCount > 0 ? 'animate-pulse' : ''}`}
      style={{
        background: 'rgba(10, 10, 20, 0.7)',
        backdropFilter: 'blur(15px)',
        border: `1px solid ${urgentCount > 0 ? '#ef444450' : '#00f0ff30'}`,
        boxShadow: urgentCount > 0 ? '0 0 25px rgba(239,68,68,0.3)' : '0 0 20px rgba(0,240,255,0.15)'
      }}
    >
      <div className="relative">
        <AlertTriangle className="w-5 h-5" style={{ color: urgentCount > 0 ? '#ef4444' : '#00f0ff' }} />
        <div
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{ background: urgentCount > 0 ? '#ef4444' : '#00f0ff', color: '#000' }}
        >
          {scenarios.length}
        </div>
      </div>
      <span className="text-sm font-medium" style={{ color: urgentCount > 0 ? '#ef4444' : '#00f0ff' }}>
        {scenarios.length} Decision{scenarios.length > 1 ? 's' : ''} Pending
      </span>
      <ChevronRight className="w-4 h-4 text-gray-500" />
    </motion.button>
  );
}

// ============================================================================
// Main Component
// ============================================================================
export default function DeliveryDecisionHUD({
  scenarios = [],
  vehicles = [],
  onDecision,
  onDismiss
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter active scenarios
  const activeScenarios = scenarios.filter(s =>
    s.status === 'pending' && s.expiresAt > Date.now()
  );

  // Reset index if out of bounds
  useEffect(() => {
    if (currentIndex >= activeScenarios.length) {
      setCurrentIndex(Math.max(0, activeScenarios.length - 1));
    }
  }, [activeScenarios.length, currentIndex]);

  // Auto-expand when new scenario arrives
  useEffect(() => {
    if (activeScenarios.length > 0 && !isExpanded) {
      setIsExpanded(true);
    }
  }, [activeScenarios.length]);

  if (activeScenarios.length === 0) return null;

  const currentScenario = activeScenarios[currentIndex];

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
      <AnimatePresence mode="wait">
        {isExpanded && currentScenario ? (
          <motion.div key="expanded" className="space-y-3">
            {/* Queue indicator */}
            {activeScenarios.length > 1 && (
              <div className="flex justify-center">
                <QueueIndicator
                  scenarios={activeScenarios}
                  currentIndex={currentIndex}
                  onSelect={setCurrentIndex}
                />
              </div>
            )}

            {/* Main panel */}
            <FocusedDecisionPanel
              scenario={currentScenario}
              onDecision={onDecision}
              onDismiss={onDismiss}
              onNext={() => setCurrentIndex(i => Math.min(i + 1, activeScenarios.length - 1))}
              onPrev={() => setCurrentIndex(i => Math.max(i - 1, 0))}
              hasNext={currentIndex < activeScenarios.length - 1}
              hasPrev={currentIndex > 0}
              queueLength={activeScenarios.length}
            />

            {/* Minimize button */}
            <div className="flex justify-center">
              <button
                onClick={() => setIsExpanded(false)}
                className="px-3 py-1 rounded-full text-xs text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
              >
                Minimize
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="flex justify-center">
            <MinimizedIndicator
              scenarios={activeScenarios}
              onExpand={() => setIsExpanded(true)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
