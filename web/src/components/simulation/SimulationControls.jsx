import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

const SPEED_OPTIONS = [1, 2, 5, 10];

export default function SimulationControls() {
  const { isRunning, speed, start, stop, setSpeed, changeCity, cityId } = useSimulation();

  const handleReset = () => {
    changeCity(cityId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-cyan-500/10 blur-2xl" />

      {/* Main container */}
      <div className="relative bg-black/70 backdrop-blur-md border border-white/10 rounded-full px-2 py-2">
        {/* Top accent line */}
        <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        <div className="flex items-center gap-1">
          {/* Play/Pause */}
          <button
            onClick={isRunning ? stop : start}
            className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all overflow-hidden ${
              isRunning
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {/* Button glow */}
            <div className={`absolute inset-0 ${
              isRunning
                ? 'bg-amber-500/20'
                : 'bg-emerald-500/20'
            }`} />
            {/* Border */}
            <div className={`absolute inset-0 rounded-full border ${
              isRunning
                ? 'border-amber-500/50'
                : 'border-emerald-500/50'
            }`} />
            {/* Icon */}
            {isRunning ? (
              <Pause className="w-5 h-5 relative z-10" />
            ) : (
              <Play className="w-5 h-5 ml-0.5 relative z-10" />
            )}
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="relative flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-white transition-all group"
            title="Reset simulaciju"
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
                onClick={() => setSpeed(s)}
                className={`relative w-9 h-9 text-xs font-mono font-bold rounded-full transition-all ${
                  speed === s
                    ? 'text-purple-400'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {speed === s && (
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

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-2" />

          {/* Status */}
          <div className="flex items-center gap-2 px-3">
            <div className="relative">
              <div
                className={`w-2 h-2 rounded-full ${
                  isRunning ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
              />
              {isRunning && (
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              {isRunning ? 'LIVE' : 'PAUSED'}
            </span>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute -bottom-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      </div>
    </motion.div>
  );
}
