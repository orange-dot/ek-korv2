import { motion } from 'framer-motion';
import { Maximize2, Minimize2, Cpu, Wifi, WifiOff } from 'lucide-react';

/**
 * HAX Demo header with branding and fullscreen toggle.
 */
export default function HAXHeader({ isFullscreen, onToggleFullscreen, isConnected }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between pointer-events-none"
    >
      {/* Left: Branding */}
      <div className="pointer-events-auto flex items-center space-x-4">
        {/* Logo/Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500/30 blur-xl" />
          <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Cpu className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">
            ELEKTROKOMBINACIJA
          </h1>
          <p className="text-xs text-slate-400 tracking-widest uppercase">
            HAX Demo - Modular EV Charging
          </p>
        </div>
      </div>

      {/* Center: Tagline */}
      <div className="hidden lg:block">
        <p className="text-sm text-slate-300 italic">
          "Simulation before silicon"
        </p>
      </div>

      {/* Right: Connection Status & Fullscreen */}
      <div className="pointer-events-auto flex items-center space-x-4">
        {/* Connection Status */}
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${
          isConnected
            ? 'bg-green-500/20 border border-green-500/50'
            : 'bg-red-500/20 border border-red-500/50'
        }`}>
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
          <span className={`text-xs font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-slate-300" />
          ) : (
            <Maximize2 className="w-5 h-5 text-slate-300" />
          )}
        </button>
      </div>
    </motion.header>
  );
}
