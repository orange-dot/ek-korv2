import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, FastForward, ChevronRight } from 'lucide-react';

/**
 * Phase indicator showing current demo phase, progress, and controls.
 */
export default function PhaseIndicator({
  currentPhase,
  currentPhaseIndex,
  totalPhases,
  phaseProgress,
  demoProgress,
  isPlaying,
  isConnected,
  onTogglePlayPause,
  onReset,
  phases,
  onGoToPhase,
}) {
  // Color mapping for phase colors
  const colorClasses = {
    cyan: {
      bg: 'bg-cyan-500',
      text: 'text-cyan-400',
      border: 'border-cyan-500',
      glow: 'shadow-cyan-500/50',
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-green-400',
      border: 'border-green-500',
      glow: 'shadow-green-500/50',
    },
    yellow: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-400',
      border: 'border-yellow-500',
      glow: 'shadow-yellow-500/50',
    },
    red: {
      bg: 'bg-red-500',
      text: 'text-red-400',
      border: 'border-red-500',
      glow: 'shadow-red-500/50',
    },
    purple: {
      bg: 'bg-purple-500',
      text: 'text-purple-400',
      border: 'border-purple-500',
      glow: 'shadow-purple-500/50',
    },
  };

  const colors = colorClasses[currentPhase?.color] || colorClasses.cyan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-0 left-0 right-0 z-40"
    >
      {/* Main container */}
      <div className="mx-auto max-w-4xl px-6 pb-6">
        {/* Talking Point */}
        <motion.div
          key={currentPhase?.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-center"
        >
          <p className={`text-lg font-medium ${colors.text}`}>
            "{currentPhase?.talkingPoint}"
          </p>
        </motion.div>

        {/* Controls Bar */}
        <div className="bg-black/80 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
          {/* Phase dots */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {phases.map((phase, index) => {
              const phaseColors = colorClasses[phase.color] || colorClasses.cyan;
              const isActive = index === currentPhaseIndex;
              const isCompleted = index < currentPhaseIndex;

              return (
                <button
                  key={phase.id}
                  onClick={() => onGoToPhase(index)}
                  className={`group relative flex items-center justify-center transition-all ${
                    isActive ? 'scale-110' : 'hover:scale-105'
                  }`}
                  title={phase.title}
                >
                  <div
                    className={`w-3 h-3 rounded-full transition-all ${
                      isActive
                        ? `${phaseColors.bg} shadow-lg ${phaseColors.glow}`
                        : isCompleted
                          ? `${phaseColors.bg} opacity-60`
                          : 'bg-slate-600'
                    }`}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="activePhase"
                      className={`absolute -inset-1 rounded-full border-2 ${phaseColors.border} opacity-50`}
                    />
                  )}
                  {/* Tooltip */}
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {phase.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Main controls row */}
          <div className="flex items-center justify-between gap-4">
            {/* Play/Pause */}
            <div className="flex items-center gap-2">
              <button
                onClick={onTogglePlayPause}
                disabled={!isConnected}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isPlaying
                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                    : 'bg-green-500/20 border border-green-500/50 text-green-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>

              <button
                onClick={onReset}
                disabled={!isConnected}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-700/50 border border-slate-600 text-slate-400 hover:text-white transition-all disabled:opacity-50"
                title="Reset demo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Phase info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-xs font-medium uppercase tracking-wider ${colors.text}`}>
                    Phase {currentPhaseIndex + 1}/{totalPhases}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold text-white truncate">
                    {currentPhase?.title}
                  </span>
                </div>
                <span className="text-xs text-slate-400 ml-2">
                  {Math.round(phaseProgress * 100)}%
                </span>
              </div>

              {/* Phase progress bar */}
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${colors.bg}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${phaseProgress * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>

            {/* Time indicator */}
            <div className="flex items-center gap-2 text-slate-400">
              <FastForward className="w-4 h-4" />
              <span className="text-sm font-mono">10x</span>
            </div>
          </div>

          {/* Overall progress */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs text-slate-500">Overall</span>
            <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${demoProgress * 100}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {Math.round(demoProgress * 100)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
