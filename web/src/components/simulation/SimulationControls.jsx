import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, FastForward, Zap, AlertTriangle, Activity, TrendingUp, Grid3X3, ChevronUp } from 'lucide-react';
import { useSimulation, SIM_MODES } from '../../context/SimulationContext';

const SPEED_OPTIONS = [1, 2, 5, 10];

// Live mode scenarios
const SCENARIOS = [
  { id: 'normal', name: 'Normal', icon: Activity, color: 'green' },
  { id: 'peak', name: 'Peak Load', icon: TrendingUp, color: 'yellow' },
  { id: 'module-failure', name: 'Module Fault', icon: AlertTriangle, color: 'red' },
  { id: 'cascade', name: 'Cascade', icon: Zap, color: 'orange' },
  { id: 'v2g-response', name: 'V2G', icon: Grid3X3, color: 'purple' },
];

export default function SimulationControls() {
  const {
    isRunning,
    speed,
    start,
    stop,
    setSpeed,
    changeCity,
    cityId,
    mode,
    isConnected,
    liveSimState,
    sendSimCommand,
    triggerSimScenario,
  } = useSimulation();

  const [showScenarios, setShowScenarios] = useState(false);
  const isLive = mode === SIM_MODES.LIVE;

  const handleReset = () => {
    if (isLive) {
      sendSimCommand('stop');
    } else {
      changeCity(cityId);
    }
  };

  const handlePlayPause = async () => {
    if (isLive) {
      if (liveSimState?.running && !liveSimState?.paused) {
        await sendSimCommand('pause');
      } else if (liveSimState?.paused) {
        await sendSimCommand('resume');
      } else {
        await sendSimCommand('start');
      }
    } else {
      isRunning ? stop() : start();
    }
  };

  const handleSpeedChange = (s) => {
    if (isLive) {
      sendSimCommand('setTimeScale', s);
    } else {
      setSpeed(s);
    }
  };

  const handleScenario = async (scenarioId) => {
    await triggerSimScenario(scenarioId);
    setShowScenarios(false);
  };

  // Determine running state
  const effectiveRunning = isLive
    ? liveSimState?.running && !liveSimState?.paused
    : isRunning;

  const effectiveSpeed = isLive
    ? liveSimState?.timeScale || 1
    : speed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
    >
      {/* Scenario Popup (Live mode only) */}
      <AnimatePresence>
        {showScenarios && isLive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-2 min-w-[280px]"
          >
            <div className="text-xs text-slate-400 mb-2 px-2">Demo Scenarios</div>
            <div className="grid grid-cols-5 gap-1">
              {SCENARIOS.map((scenario) => {
                const Icon = scenario.icon;
                const colorClass = {
                  green: 'hover:bg-green-500/20 hover:border-green-500/50',
                  yellow: 'hover:bg-yellow-500/20 hover:border-yellow-500/50',
                  red: 'hover:bg-red-500/20 hover:border-red-500/50',
                  orange: 'hover:bg-orange-500/20 hover:border-orange-500/50',
                  purple: 'hover:bg-purple-500/20 hover:border-purple-500/50',
                }[scenario.color];
                const iconColor = {
                  green: 'text-green-400',
                  yellow: 'text-yellow-400',
                  red: 'text-red-400',
                  orange: 'text-orange-400',
                  purple: 'text-purple-400',
                }[scenario.color];
                return (
                  <button
                    key={scenario.id}
                    onClick={() => handleScenario(scenario.id)}
                    disabled={!isConnected}
                    className={`flex flex-col items-center p-2 rounded-lg border border-white/10 transition-all ${colorClass} disabled:opacity-50`}
                  >
                    <Icon className={`w-4 h-4 ${iconColor} mb-1`} />
                    <span className="text-[10px] text-white">{scenario.name}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glow effect */}
      <div className="absolute inset-0 bg-cyan-500/10 blur-2xl" />

      {/* Main container */}
      <div className="relative bg-black/70 backdrop-blur-md border border-white/10 rounded-full px-2 py-2">
        {/* Top accent line */}
        <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        <div className="flex items-center gap-1">
          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            disabled={isLive && !isConnected}
            className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all overflow-hidden ${
              effectiveRunning
                ? 'text-amber-400'
                : 'text-emerald-400'
            } disabled:opacity-50`}
          >
            {/* Button glow */}
            <div className={`absolute inset-0 ${
              effectiveRunning
                ? 'bg-amber-500/20'
                : 'bg-emerald-500/20'
            }`} />
            {/* Border */}
            <div className={`absolute inset-0 rounded-full border ${
              effectiveRunning
                ? 'border-amber-500/50'
                : 'border-emerald-500/50'
            }`} />
            {/* Icon */}
            {effectiveRunning ? (
              <Pause className="w-5 h-5 relative z-10" />
            ) : (
              <Play className="w-5 h-5 ml-0.5 relative z-10" />
            )}
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            disabled={isLive && !isConnected}
            className="relative flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-white transition-all group disabled:opacity-50"
            title="Reset simulation"
          >
            <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 rounded-full border border-white/10 group-hover:border-white/20 transition-colors" />
            <RotateCcw className="w-4 h-4 relative z-10" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-2" />

          {/* Speed Controls */}
          <div className="flex items-center gap-1">
            <FastForward className="w-3 h-3 text-slate-500 mr-1" />
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                disabled={isLive && !isConnected}
                className={`relative w-9 h-9 text-xs font-mono font-bold rounded-full transition-all ${
                  effectiveSpeed === s
                    ? 'text-purple-400'
                    : 'text-slate-500 hover:text-white'
                } disabled:opacity-50`}
              >
                {effectiveSpeed === s && (
                  <motion.div
                    layoutId="speedIndicator"
                    className="absolute inset-0 rounded-full bg-purple-500/20 border border-purple-500/50"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                  />
                )}
                <span className="relative z-10">{s}x</span>
              </button>
            ))}
          </div>

          {/* Scenarios button (Live mode only) */}
          {isLive && (
            <>
              <div className="w-px h-6 bg-white/10 mx-2" />
              <button
                onClick={() => setShowScenarios(!showScenarios)}
                disabled={!isConnected}
                className={`relative flex items-center justify-center w-10 h-10 rounded-full text-cyan-400 transition-all group disabled:opacity-50 ${
                  showScenarios ? 'bg-cyan-500/20' : ''
                }`}
                title="Demo scenarios"
              >
                <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 rounded-full border border-cyan-500/30 group-hover:border-cyan-500/50 transition-colors" />
                <Zap className="w-4 h-4 relative z-10" />
                {showScenarios && (
                  <ChevronUp className="w-3 h-3 absolute -top-0.5 -right-0.5 text-cyan-400" />
                )}
              </button>
            </>
          )}

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-2" />

          {/* Status */}
          <div className="flex items-center gap-2 px-3">
            <div className="relative">
              <div
                className={`w-2 h-2 rounded-full ${
                  effectiveRunning ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
              />
              {effectiveRunning && (
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              {effectiveRunning ? 'RUNNING' : 'PAUSED'}
            </span>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute -bottom-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      </div>
    </motion.div>
  );
}
