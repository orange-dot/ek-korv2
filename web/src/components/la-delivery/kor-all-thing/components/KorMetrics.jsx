import React from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  ArrowLeftRight,
  Zap,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';

/**
 * KorMetrics
 * Key performance metrics display grid
 */

export function KorMetrics({ stats = {} }) {
  const metrics = [
    {
      label: 'Packages',
      value: stats.packagesInTransit ?? 0,
      icon: Package,
      color: 'amber',
      suffix: ''
    },
    {
      label: 'Handoffs',
      value: stats.activeHandoffs ?? 0,
      icon: ArrowLeftRight,
      color: 'purple',
      suffix: ''
    },
    {
      label: 'EK3 Load',
      value: stats.ek3Utilization ?? 78,
      icon: Zap,
      color: 'emerald',
      suffix: '%'
    },
    {
      label: 'Efficiency',
      value: stats.efficiency ?? 94,
      icon: TrendingUp,
      color: 'cyan',
      suffix: '%'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Primary Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.label} metric={metric} delay={index * 0.05} />
        ))}
      </div>

      {/* AI Confidence */}
      <AIConfidenceCard confidence={stats.aiConfidence ?? 94} />

      {/* Performance Summary */}
      <PerformanceSummary stats={stats} />
    </div>
  );
}

function MetricCard({ metric, delay = 0 }) {
  const Icon = metric.icon;

  const colorClasses = {
    amber: 'text-amber-400',
    purple: 'text-purple-400',
    emerald: 'text-emerald-400',
    cyan: 'text-cyan-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-4 rounded-lg bg-white/5 border border-white/10"
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${colorClasses[metric.color]}`} />
        <span className="text-xs text-slate-400">{metric.label}</span>
      </div>
      <div className={`text-2xl font-bold ${colorClasses[metric.color]}`}>
        {metric.value}
        {metric.suffix && <span className="text-sm">{metric.suffix}</span>}
      </div>
    </motion.div>
  );
}

function AIConfidenceCard({ confidence }) {
  const confidenceColor = confidence > 80 ? 'emerald' :
    confidence > 60 ? 'amber' : 'red';

  const colorClasses = {
    emerald: {
      text: 'text-emerald-400',
      gradient: 'from-emerald-500 to-cyan-500'
    },
    amber: {
      text: 'text-amber-400',
      gradient: 'from-amber-500 to-orange-500'
    },
    red: {
      text: 'text-red-400',
      gradient: 'from-red-500 to-pink-500'
    }
  };

  const colors = colorClasses[confidenceColor];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 rounded-xl bg-white/5 border border-white/10"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-slate-400">AI Confidence</span>
        </div>
        <span className={`text-sm font-bold ${colors.text}`}>{confidence}%</span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between mt-2 text-[9px] text-slate-500">
        <span>Decision Quality</span>
        <span>{confidence > 80 ? 'HIGH' : confidence > 60 ? 'MODERATE' : 'LOW'}</span>
      </div>
    </motion.div>
  );
}

function PerformanceSummary({ stats }) {
  const avgDeliveryTime = stats.avgDeliveryTime ?? 18;
  const deliveriesToday = stats.deliveriesToday ?? 247;
  const successRate = stats.successRate ?? 99.2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20"
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-400">Avg:</span>
            <span className="text-white font-medium">{avgDeliveryTime}min</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400">Today:</span>
            <span className="text-white font-medium">{deliveriesToday}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-emerald-400 font-bold">{successRate}%</span>
          <span className="text-slate-500">success</span>
        </div>
      </div>
    </motion.div>
  );
}

export default KorMetrics;
