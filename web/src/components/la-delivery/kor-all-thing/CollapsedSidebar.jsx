import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Plane,
  Truck,
  Bot,
  Package,
  ChevronRight,
  Wifi,
  WifiOff
} from 'lucide-react';

/**
 * Collapsed sidebar for KorAllThing panel
 * Always visible on the left side of the map
 */
export function CollapsedSidebar({
  activeScenarios = [],
  systemStatus = 'healthy',
  stats = {},
  isConnected = false,
  onExpand
}) {
  const statusColors = {
    healthy: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500'
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="absolute left-0 top-0 bottom-0 w-16 bg-[#0a0a0f]/95 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-4 gap-4 z-[1000]"
    >
      {/* Logo with notification badge */}
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center border border-purple-500/30">
          <Brain className="w-5 h-5 text-purple-400" />
        </div>
        {activeScenarios.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center"
          >
            <span className="text-[10px] font-bold text-black">{activeScenarios.length}</span>
          </motion.div>
        )}
      </div>

      {/* Connection Status */}
      <div className="flex flex-col items-center gap-1">
        {isConnected ? (
          <Wifi className="w-3 h-3 text-emerald-400" />
        ) : (
          <WifiOff className="w-3 h-3 text-red-400" />
        )}
        <span className="text-[8px] text-slate-500 uppercase">
          {isConnected ? 'LIVE' : 'SIM'}
        </span>
      </div>

      {/* System Status */}
      <div className="flex flex-col items-center gap-1">
        <div className={`w-3 h-3 rounded-full animate-pulse ${statusColors[systemStatus]}`} />
        <span className="text-[8px] text-slate-500 uppercase">SYS</span>
      </div>

      {/* Quick Stats */}
      <div className="flex flex-col items-center gap-3 flex-1">
        <StatItem
          icon={Plane}
          value={stats.dronesFlying ?? 0}
          label="FLY"
          color="text-cyan-400"
        />
        <StatItem
          icon={Truck}
          value={stats.podsMoving ?? 0}
          label="POD"
          color="text-green-400"
        />
        <StatItem
          icon={Bot}
          value={stats.swarmsDelivering ?? 0}
          label="SWM"
          color="text-pink-400"
        />
        <StatItem
          icon={Package}
          value={stats.packagesInTransit ?? 0}
          label="PKG"
          color="text-amber-400"
        />
      </div>

      {/* Expand Button */}
      <button
        onClick={onExpand}
        className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors group"
      >
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
      </button>
    </motion.div>
  );
}

function StatItem({ icon: Icon, value, label, color }) {
  return (
    <div className="flex flex-col items-center">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-xs font-bold text-white">{value}</span>
      <span className="text-[8px] text-slate-500">{label}</span>
    </div>
  );
}

export default CollapsedSidebar;
