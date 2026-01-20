import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, TrendingDown, Cpu } from 'lucide-react';

/**
 * Power Distribution Visualization.
 * Shows total power demand, module load distribution histogram,
 * efficiency gauge, and power loss heatmap.
 */
export default function PowerDistViz({ modules = [], powerDemand = 0 }) {
  // Calculate power distribution stats
  const powerStats = useMemo(() => {
    if (!modules || modules.length === 0) {
      return {
        totalPower: 0,
        maxCapacity: 280000, // 84 modules × 3.3kW
        activeCount: 0,
        idleCount: 84,
        avgEfficiency: 0.96,
        totalLoss: 0,
        loadDistribution: Array(10).fill(0),
        moduleLoads: [],
      };
    }

    const activeModules = modules.filter(m => m.state === 'active' || m.state === 'v2g');
    const totalPower = modules.reduce((sum, m) => sum + (m.powerOut || 0), 0);
    const maxCapacity = modules.length * 3300; // 3.3kW per module

    // Calculate average efficiency from active modules
    const effModules = activeModules.filter(m => m.efficiency > 0);
    const avgEfficiency = effModules.length > 0
      ? effModules.reduce((sum, m) => sum + m.efficiency, 0) / effModules.length
      : 0.96;

    // Power loss: P_loss = P_out × (1/η - 1)
    const totalLoss = totalPower * (1 / avgEfficiency - 1);

    // Load distribution histogram (0-10%, 10-20%, etc.)
    const loadDistribution = Array(10).fill(0);
    modules.forEach(m => {
      const loadPercent = ((m.powerOut || 0) / 3300) * 100;
      const bucket = Math.min(9, Math.floor(loadPercent / 10));
      if (loadPercent > 0) loadDistribution[bucket]++;
    });

    // Individual module loads for heatmap
    const moduleLoads = modules.map(m => ({
      id: m.slotIndex,
      power: m.powerOut || 0,
      loadPercent: ((m.powerOut || 0) / 3300) * 100,
      efficiency: m.efficiency || 0.96,
      loss: (m.powerOut || 0) * (1 / (m.efficiency || 0.96) - 1),
    }));

    return {
      totalPower,
      maxCapacity,
      activeCount: activeModules.length,
      idleCount: modules.length - activeModules.length,
      avgEfficiency,
      totalLoss,
      loadDistribution,
      moduleLoads,
    };
  }, [modules]);

  const powerPercent = (powerStats.totalPower / powerStats.maxCapacity) * 100;

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      {/* Total Power Display */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <Zap className="w-20 h-20 text-cyan-400 mx-auto mb-4" />
          <motion.div
            className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">
          Total Output Power
        </div>
        <div className="text-6xl font-mono font-bold text-cyan-400">
          {(powerStats.totalPower / 1000).toFixed(1)}
          <span className="text-2xl text-slate-400 ml-2">kW</span>
        </div>
      </div>

      {/* Power Bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>0 kW</span>
          <span>Capacity: {(powerStats.maxCapacity / 1000).toFixed(0)} kW</span>
        </div>
        <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-green-500 rounded-full"
            animate={{ width: `${powerPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-right text-sm text-slate-400 mt-1">
          {powerPercent.toFixed(0)}% utilized
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Cpu}
          label="Active"
          value={powerStats.activeCount}
          subvalue={`/${modules.length || 84}`}
          color="cyan"
        />
        <StatCard
          icon={Activity}
          label="Efficiency"
          value={`${(powerStats.avgEfficiency * 100).toFixed(1)}%`}
          color={powerStats.avgEfficiency > 0.95 ? 'green' : 'yellow'}
        />
        <StatCard
          icon={TrendingDown}
          label="Power Loss"
          value={`${(powerStats.totalLoss / 1000).toFixed(2)} kW`}
          color="orange"
        />
        <StatCard
          icon={Zap}
          label="Avg Load"
          value={`${(powerStats.activeCount > 0
            ? (powerStats.totalPower / powerStats.activeCount / 3300) * 100
            : 0).toFixed(0)}%`}
          color="purple"
        />
      </div>

      {/* Load Distribution Histogram */}
      <div className="w-full max-w-lg mb-8">
        <div className="text-xs text-slate-400 mb-3 uppercase tracking-wide">
          Module Load Distribution
        </div>
        <div className="flex items-end gap-1 h-24">
          {powerStats.loadDistribution.map((count, i) => {
            const maxCount = Math.max(...powerStats.loadDistribution, 1);
            const height = (count / maxCount) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center">
                <motion.div
                  className={`w-full rounded-t ${
                    i < 3 ? 'bg-green-500' :
                    i < 6 ? 'bg-cyan-500' :
                    i < 8 ? 'bg-yellow-500' :
                    'bg-orange-500'
                  }`}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                />
                <span className="text-[9px] text-slate-500 mt-1">
                  {i * 10}-{(i + 1) * 10}%
                </span>
              </div>
            );
          })}
        </div>
        <div className="text-center text-xs text-slate-500 mt-2">
          Module Load Percentage
        </div>
      </div>

      {/* Loss Heatmap (mini module grid) */}
      <div className="w-full max-w-lg">
        <div className="text-xs text-slate-400 mb-3 uppercase tracking-wide">
          Power Loss Heatmap (redder = more loss)
        </div>
        <div className="grid grid-cols-12 gap-0.5">
          {Array(84).fill(null).map((_, i) => {
            const moduleData = powerStats.moduleLoads.find(m => m.id === i);
            const loss = moduleData?.loss || 0;
            const maxLoss = Math.max(...powerStats.moduleLoads.map(m => m.loss || 0), 1);
            const intensity = loss / maxLoss;

            return (
              <motion.div
                key={i}
                className="aspect-square rounded-sm"
                style={{
                  backgroundColor: loss > 0
                    ? `rgba(239, 68, 68, ${0.2 + intensity * 0.6})`
                    : 'rgba(71, 85, 105, 0.5)',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.002 }}
                title={moduleData ? `Module ${i}: ${loss.toFixed(1)}W loss` : `Module ${i}: idle`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subvalue, color }) {
  const colorClasses = {
    cyan: 'text-cyan-400 border-cyan-500/30',
    green: 'text-green-400 border-green-500/30',
    yellow: 'text-yellow-400 border-yellow-500/30',
    orange: 'text-orange-400 border-orange-500/30',
    purple: 'text-purple-400 border-purple-500/30',
  };

  return (
    <div className={`text-center p-3 rounded-lg border bg-slate-800/50 ${colorClasses[color]}`}>
      <Icon className={`w-5 h-5 mx-auto mb-1 ${colorClasses[color].split(' ')[0]}`} />
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-xl font-mono font-bold ${colorClasses[color].split(' ')[0]}`}>
        {value}
        {subvalue && <span className="text-sm text-slate-500">{subvalue}</span>}
      </div>
    </div>
  );
}
