import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, AlertTriangle, Clock, Activity, TrendingUp } from 'lucide-react';

/**
 * Degradation/Health Visualization.
 * Shows module health overview, degradation factors (ESR, RdsOn, Efficiency),
 * RUL predictions, and health trend sparklines.
 */
export default function DegradationViz({ modules = [], healthHistory = [] }) {
  // Calculate health stats from modules
  const healthStats = useMemo(() => {
    if (!modules || modules.length === 0) {
      return {
        avgHealth: 100,
        minHealth: 100,
        worstModule: null,
        avgEsr: 1.0,
        avgRdson: 1.0,
        avgEfficiency: 0.96,
        avgRul: 50000,
        criticalModules: [],
        healthDistribution: Array(10).fill(0),
      };
    }

    // Calculate averages
    const avgHealth = modules.reduce((sum, m) => sum + (m.health || 100), 0) / modules.length;
    const healthValues = modules.map(m => m.health || 100);
    const minHealth = Math.min(...healthValues);

    // Find worst module
    const worstIdx = healthValues.indexOf(minHealth);
    const worstModule = worstIdx >= 0 ? { id: modules[worstIdx].slotIndex, health: minHealth } : null;

    // Degradation factors (normalized ratios)
    const avgEsr = modules.reduce((sum, m) => sum + (m.esrRatio || 1.0), 0) / modules.length;
    const avgRdson = modules.reduce((sum, m) => sum + (m.rdsonRatio || 1.0), 0) / modules.length;

    // Efficiency
    const effModules = modules.filter(m => m.efficiency > 0);
    const avgEfficiency = effModules.length > 0
      ? effModules.reduce((sum, m) => sum + m.efficiency, 0) / effModules.length
      : 0.96;

    // RUL (Remaining Useful Life)
    const rulValues = modules.filter(m => m.rulHours > 0).map(m => m.rulHours);
    const avgRul = rulValues.length > 0
      ? rulValues.reduce((sum, r) => sum + r, 0) / rulValues.length
      : 50000;

    // Critical modules (health < 80%)
    const criticalModules = modules
      .filter(m => (m.health || 100) < 80)
      .map(m => ({
        id: m.slotIndex,
        health: m.health || 100,
        rulHours: m.rulHours || 0,
        reason: getDegradationReason(m),
      }))
      .sort((a, b) => a.health - b.health)
      .slice(0, 5);

    // Health distribution (0-10%, 10-20%, etc. but inverted for health: 90-100%, 80-90%, etc.)
    const healthDistribution = Array(10).fill(0);
    modules.forEach(m => {
      const health = m.health || 100;
      const bucket = Math.min(9, Math.floor((100 - health) / 10));
      healthDistribution[bucket]++;
    });

    return {
      avgHealth,
      minHealth,
      worstModule,
      avgEsr,
      avgRdson,
      avgEfficiency,
      avgRul,
      criticalModules,
      healthDistribution,
    };
  }, [modules]);

  function getDegradationReason(module) {
    if ((module.esrRatio || 1) > 1.3) return 'High ESR (capacitor aging)';
    if ((module.rdsonRatio || 1) > 1.2) return 'High RdsOn (MOSFET stress)';
    if ((module.efficiency || 0.96) < 0.90) return 'Low efficiency';
    if ((module.tempJunction || 25) > 90) return 'Thermal stress';
    return 'General wear';
  }

  // Health bar color
  const getHealthColor = (health) => {
    if (health >= 90) return 'bg-green-500';
    if (health >= 80) return 'bg-cyan-500';
    if (health >= 70) return 'bg-yellow-500';
    if (health >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      {/* Overall Health Display */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <Heart
            className={`w-20 h-20 mx-auto mb-4 ${
              healthStats.avgHealth >= 90 ? 'text-green-400' :
              healthStats.avgHealth >= 80 ? 'text-cyan-400' :
              healthStats.avgHealth >= 70 ? 'text-yellow-400' :
              'text-red-400'
            }`}
          />
          <motion.div
            className={`absolute inset-0 blur-3xl rounded-full ${
              healthStats.avgHealth >= 90 ? 'bg-green-500/20' :
              healthStats.avgHealth >= 80 ? 'bg-cyan-500/20' :
              healthStats.avgHealth >= 70 ? 'bg-yellow-500/20' :
              'bg-red-500/20'
            }`}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">
          Average Health Score
        </div>
        <div className={`text-6xl font-mono font-bold ${
          healthStats.avgHealth >= 90 ? 'text-green-400' :
          healthStats.avgHealth >= 80 ? 'text-cyan-400' :
          healthStats.avgHealth >= 70 ? 'text-yellow-400' :
          'text-red-400'
        }`}>
          {healthStats.avgHealth.toFixed(1)}
          <span className="text-2xl text-slate-400 ml-1">%</span>
        </div>

        {/* Lowest health indicator */}
        {healthStats.worstModule && (
          <div className="text-sm text-slate-400 mt-2">
            Lowest: Module {healthStats.worstModule.id} ({healthStats.worstModule.health.toFixed(0)}%)
          </div>
        )}
      </div>

      {/* Health Bar */}
      <div className="w-full max-w-md mb-8">
        <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${getHealthColor(healthStats.avgHealth)}`}
            animate={{ width: `${healthStats.avgHealth}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Degradation Factors */}
      <div className="grid grid-cols-3 gap-6 mb-8 w-full max-w-lg">
        <DegradationCard
          label="ESR Ratio"
          value={`${healthStats.avgEsr.toFixed(2)}x`}
          sublabel="(cap aging)"
          status={healthStats.avgEsr < 1.1 ? 'good' : healthStats.avgEsr < 1.2 ? 'warn' : 'bad'}
        />
        <DegradationCard
          label="RdsOn Ratio"
          value={`${healthStats.avgRdson.toFixed(2)}x`}
          sublabel="(FET stress)"
          status={healthStats.avgRdson < 1.1 ? 'good' : healthStats.avgRdson < 1.2 ? 'warn' : 'bad'}
        />
        <DegradationCard
          label="Efficiency"
          value={`${(healthStats.avgEfficiency * 100).toFixed(1)}%`}
          sublabel="(combined)"
          status={healthStats.avgEfficiency > 0.95 ? 'good' : healthStats.avgEfficiency > 0.90 ? 'warn' : 'bad'}
        />
      </div>

      {/* RUL Section */}
      <div className="w-full max-w-lg mb-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-purple-400" />
          <span className="text-sm text-slate-300 font-medium">Remaining Useful Life</span>
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400">Average RUL</span>
          <span className="text-2xl font-mono text-purple-400">
            {(healthStats.avgRul / 1000).toFixed(1)}k hrs
          </span>
        </div>

        {healthStats.criticalModules.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="flex items-center gap-2 text-sm text-orange-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Critical Modules ({healthStats.criticalModules.length})</span>
            </div>
            <div className="space-y-1">
              {healthStats.criticalModules.map(m => (
                <div key={m.id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Module {m.id}: <span className="text-red-400">{m.health.toFixed(0)}%</span>
                  </span>
                  <span className="text-orange-400">
                    {m.rulHours > 0 ? `${(m.rulHours / 1000).toFixed(1)}k hrs` : 'Check soon'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Health Distribution */}
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-slate-400 uppercase tracking-wide">
            Health Distribution
          </span>
        </div>

        <div className="flex items-end gap-1 h-20">
          {healthStats.healthDistribution.map((count, i) => {
            const maxCount = Math.max(...healthStats.healthDistribution, 1);
            const height = (count / maxCount) * 100;
            const label = `${100 - (i + 1) * 10}-${100 - i * 10}%`;

            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <motion.div
                  className={`w-full rounded-t ${
                    i < 2 ? 'bg-green-500' :
                    i < 4 ? 'bg-cyan-500' :
                    i < 6 ? 'bg-yellow-500' :
                    i < 8 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                />
                <span className="text-[8px] text-slate-500 mt-1 rotate-45 origin-left">
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-between text-[10px] text-slate-500 mt-4">
          <span className="text-green-400">Healthy (90-100%)</span>
          <span className="text-red-400">Critical (&lt;60%)</span>
        </div>
      </div>

      {/* Trend Sparkline (if history available) */}
      {healthHistory.length > 0 && (
        <div className="w-full max-w-lg mt-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wide">
              Health Trend (last 60s)
            </span>
          </div>
          <div className="h-12 bg-slate-700/50 rounded-lg overflow-hidden">
            <svg className="w-full h-full">
              <path
                d={`M ${healthHistory.map((h, i) =>
                  `${(i / (healthHistory.length - 1)) * 100}%,${100 - h}%`
                ).join(' L ')}`}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

function DegradationCard({ label, value, sublabel, status }) {
  const statusColors = {
    good: 'bg-green-500/20 border-green-500/50 text-green-400',
    warn: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
    bad: 'bg-red-500/20 border-red-500/50 text-red-400',
  };

  return (
    <div className={`text-center p-4 rounded-lg border ${statusColors[status]}`}>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="text-2xl font-mono font-bold">{value}</div>
      <div className="text-[10px] text-slate-500">{sublabel}</div>
    </div>
  );
}
