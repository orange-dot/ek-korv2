import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Cloud,
  Link2Off,
  Star,
  Grid3X3,
  Bot,
  Network,
  Zap,
  Truck
} from 'lucide-react';

/**
 * Completed Scenarios
 * Shows recently resolved scenarios
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

export function CompletedScenarios({ scenarios = [] }) {
  if (scenarios.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {scenarios.map((scenario, index) => (
        <CompletedCard
          key={scenario.id}
          scenario={scenario}
          index={index}
        />
      ))}
    </div>
  );
}

function CompletedCard({ scenario, index }) {
  const config = scenario.config || {};
  const Icon = ICON_MAP[scenario.type] || CheckCircle;

  // Calculate how long ago it was completed
  const completedAt = scenario.completedAt || Date.now();
  const timeAgo = formatTimeAgo(completedAt);

  // Get the selected option
  const selectedOption = scenario.selectedOption || config.options?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20"
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400 truncate">
              {config.title || scenario.type}
            </span>
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
          </div>
          {selectedOption && (
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {selectedOption.label}
            </p>
          )}
        </div>
      </div>

      {/* Outcome */}
      {selectedOption?.ifChosen && (
        <div className="mt-2 pt-2 border-t border-emerald-500/10">
          <p className="text-[9px] text-slate-500 italic line-clamp-1">
            ✓ {selectedOption.ifChosen}
          </p>
        </div>
      )}
    </motion.div>
  );
}

function formatTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) {
    return 'just now';
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(seconds / 86400);
    return `${days}d ago`;
  }
}

export default CompletedScenarios;
