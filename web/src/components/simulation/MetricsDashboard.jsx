import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Activity,
  Zap,
  Battery,
  Clock,
  TrendingUp,
  Shield,
  DollarSign,
  Gauge,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Cpu,
  Grid3X3,
} from 'lucide-react';

// Mock metrics for demo (in real app, fetch from API)
const defaultMetrics = {
  simulatedHours: 0,
  realTimeSeconds: 0,
  systemUptime: 99.7,
  moduleUptime: 98.5,
  faultsDetected: 0,
  faultsRecovered: 0,
  mtbfHours: 8760,
  mttrMinutes: 2,
  avgEfficiency: 96.2,
  peakEfficiency: 97.8,
  totalEnergyKwh: 0,
  energyLossKwh: 0,
  modulesReplaced: 0,
  downtimeMinutes: 0,
  downtimeAvoided: 0,
  costSavingsUsd: 0,
  busesCharged: 0,
  swapsCompleted: 0,
  avgChargeTimeMin: 45,
  avgSwapTimeSec: 120,
  fleetSoc: 72,
  v2gEventsCount: 0,
  v2gEnergyKwh: 0,
  v2gRevenueUsd: 0,
  gridFreqMin: 49.95,
  gridFreqMax: 50.05,
  loadBalanceScore: 94,
  thermalBalance: 3.2,
  redundancyLevel: 95,
};

function MetricCard({ icon: Icon, label, value, unit, color = 'cyan', trend, subtext }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}-500/10`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        {trend && (
          <div className={`text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">
        {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value}
        {unit && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
      </div>
      <div className="text-sm text-slate-400">{label}</div>
      {subtext && <div className="text-xs text-slate-500 mt-1">{subtext}</div>}
    </motion.div>
  );
}

function ProgressBar({ value, max = 100, color = 'cyan', label }) {
  const percentage = (value / max) * 100;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-white">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full bg-${color}-500`}
        />
      </div>
    </div>
  );
}

export default function MetricsDashboard({ metrics: propMetrics, apiUrl }) {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState(propMetrics || defaultMetrics);
  const [isLive, setIsLive] = useState(false);

  // Fetch metrics from API if URL provided
  useEffect(() => {
    if (!apiUrl) return;

    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/metrics`);
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
          setIsLive(true);
        }
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 1000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  // Update from props
  useEffect(() => {
    if (propMetrics) {
      setMetrics(propMetrics);
    }
  }, [propMetrics]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">System Performance</h2>
          <p className="text-slate-400">Real-time metrics from EK3 physics simulation</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className="text-sm text-slate-400">{isLive ? 'Live' : 'Demo Mode'}</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={Shield}
          label="System Uptime"
          value={metrics.systemUptime}
          unit="%"
          color="green"
          subtext="99.9% SLA target"
        />
        <MetricCard
          icon={Gauge}
          label="Avg Efficiency"
          value={metrics.avgEfficiency}
          unit="%"
          color="cyan"
          subtext={`Peak: ${metrics.peakEfficiency}%`}
        />
        <MetricCard
          icon={DollarSign}
          label="Cost Savings"
          value={metrics.costSavingsUsd}
          unit="USD"
          color="yellow"
          subtext="vs traditional system"
        />
        <MetricCard
          icon={Battery}
          label="Fleet SoC"
          value={metrics.fleetSoc}
          unit="%"
          color="blue"
          subtext={`${metrics.busesCharged} buses charged`}
        />
      </div>

      {/* Reliability & Swarm Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Reliability Panel */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Reliability Metrics</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">MTBF</span>
              <span className="text-white font-mono">{metrics.mtbfHours.toLocaleString()} hrs</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">MTTR</span>
              <span className="text-green-400 font-mono">{metrics.mttrMinutes} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Faults Detected</span>
              <span className="text-white font-mono">{metrics.faultsDetected}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Auto-Recovered</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-mono">{metrics.faultsRecovered}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Modules Replaced</span>
              <span className="text-white font-mono">{metrics.modulesReplaced}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Downtime Avoided</span>
              <span className="text-green-400 font-mono">{metrics.downtimeAvoided.toFixed(0)} min</span>
            </div>
          </div>
        </div>

        {/* Swarm Intelligence Panel */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Grid3X3 className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Swarm Intelligence</h3>
          </div>

          <ProgressBar
            value={metrics.loadBalanceScore}
            color="cyan"
            label="Load Distribution"
          />
          <ProgressBar
            value={metrics.moduleUptime}
            color="green"
            label="Module Uptime"
          />
          <ProgressBar
            value={metrics.redundancyLevel}
            color="purple"
            label="Spare Capacity"
          />

          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Thermal Spread</span>
              <span className="text-white font-mono">{metrics.thermalBalance.toFixed(1)}°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* V2G & Energy Section */}
      <div className="grid md:grid-cols-3 gap-4">
        <MetricCard
          icon={Zap}
          label="V2G Events"
          value={metrics.v2gEventsCount}
          color="yellow"
          subtext={`${metrics.v2gEnergyKwh.toFixed(1)} kWh exported`}
        />
        <MetricCard
          icon={TrendingUp}
          label="V2G Revenue"
          value={metrics.v2gRevenueUsd.toFixed(2)}
          unit="USD"
          color="green"
          subtext="Grid services income"
        />
        <MetricCard
          icon={Activity}
          label="Grid Frequency"
          value={`${metrics.gridFreqMin.toFixed(2)}-${metrics.gridFreqMax.toFixed(2)}`}
          unit="Hz"
          color="blue"
          subtext="Range during operation"
        />
      </div>

      {/* Energy & Time Section */}
      <div className="grid md:grid-cols-4 gap-4">
        <MetricCard
          icon={Zap}
          label="Total Energy"
          value={metrics.totalEnergyKwh.toFixed(1)}
          unit="kWh"
          color="cyan"
        />
        <MetricCard
          icon={Thermometer}
          label="Energy Loss"
          value={metrics.energyLossKwh.toFixed(1)}
          unit="kWh"
          color="orange"
        />
        <MetricCard
          icon={Clock}
          label="Simulated Time"
          value={metrics.simulatedHours.toFixed(1)}
          unit="hrs"
          color="blue"
        />
        <MetricCard
          icon={Cpu}
          label="Swaps Completed"
          value={metrics.swapsCompleted}
          color="purple"
          subtext={`${metrics.avgSwapTimeSec}s avg`}
        />
      </div>

      {/* Comparison Footer */}
      <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">EK3 Modular vs Traditional Charger</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-slate-400 mb-1">Repair Time</div>
            <div className="flex items-center space-x-2">
              <span className="text-red-400 line-through">4 hours</span>
              <span className="text-green-400 font-bold">2 minutes</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Single Point of Failure</div>
            <div className="flex items-center space-x-2">
              <span className="text-red-400 line-through">Entire system down</span>
              <span className="text-green-400 font-bold">1/84 capacity loss</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Efficiency</div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">92-94%</span>
              <span className="text-green-400 font-bold">&gt;96%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
