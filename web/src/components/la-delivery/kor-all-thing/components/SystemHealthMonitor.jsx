import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Activity,
  Cpu,
  HardDrive,
  Network
} from 'lucide-react';

/**
 * System Health Monitor
 * Shows overall system health, connection status, and alerts
 */

export function SystemHealthMonitor({
  systemStatus = 'healthy',
  isConnected = false,
  drones = [],
  pods = [],
  swarmBots = []
}) {
  // Calculate health indicators
  const healthIndicators = useMemo(() => {
    const allVehicles = [...drones, ...pods, ...swarmBots];

    // Count issues
    const lowBattery = allVehicles.filter(v =>
      (v.batteryLevel ?? v.batterySoc ?? 100) < 20
    ).length;
    const criticalBattery = allVehicles.filter(v =>
      (v.batteryLevel ?? v.batterySoc ?? 100) < 10
    ).length;
    const faulted = allVehicles.filter(v =>
      v.state === 'faulted' || v.state === 'error'
    ).length;

    return {
      totalVehicles: allVehicles.length,
      lowBattery,
      criticalBattery,
      faulted,
      healthyCount: allVehicles.length - lowBattery - faulted,
      healthPercent: allVehicles.length > 0
        ? Math.round(((allVehicles.length - criticalBattery - faulted) / allVehicles.length) * 100)
        : 100
    };
  }, [drones, pods, swarmBots]);

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-medium text-white uppercase tracking-wider">
            System Health
          </span>
        </div>
        <StatusBadge status={systemStatus} />
      </div>

      {/* Health Score */}
      <HealthScore percent={healthIndicators.healthPercent} />

      {/* System Indicators */}
      <div className="grid grid-cols-2 gap-2">
        <Indicator
          icon={isConnected ? Wifi : WifiOff}
          label="Backend"
          status={isConnected ? 'connected' : 'disconnected'}
          color={isConnected ? 'emerald' : 'slate'}
        />
        <Indicator
          icon={Network}
          label="Network"
          status="online"
          color="emerald"
        />
        <Indicator
          icon={Cpu}
          label="AI Core"
          status="active"
          color="purple"
        />
        <Indicator
          icon={HardDrive}
          label="Storage"
          status="healthy"
          color="cyan"
        />
      </div>

      {/* Alerts */}
      {(healthIndicators.criticalBattery > 0 || healthIndicators.faulted > 0) && (
        <div className="space-y-2">
          {healthIndicators.criticalBattery > 0 && (
            <Alert
              icon={AlertTriangle}
              message={`${healthIndicators.criticalBattery} vehicle(s) with critical battery`}
              severity="warning"
            />
          )}
          {healthIndicators.faulted > 0 && (
            <Alert
              icon={AlertTriangle}
              message={`${healthIndicators.faulted} vehicle(s) in fault state`}
              severity="error"
            />
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
        <span className="text-slate-500">Fleet Status</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-400">{healthIndicators.healthyCount} healthy</span>
          </span>
          {healthIndicators.lowBattery > 0 && (
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-400" />
              <span className="text-slate-400">{healthIndicators.lowBattery} low batt</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    healthy: {
      label: 'Healthy',
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    },
    warning: {
      label: 'Warning',
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    },
    critical: {
      label: 'Critical',
      color: 'bg-red-500/20 text-red-400 border-red-500/30'
    }
  };

  const { label, color } = config[status] || config.healthy;

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${color}`}>
      {label.toUpperCase()}
    </span>
  );
}

function HealthScore({ percent }) {
  const color = percent > 80 ? 'emerald' :
    percent > 60 ? 'amber' : 'red';

  const gradientColors = {
    emerald: 'from-emerald-500 to-green-400',
    amber: 'from-amber-500 to-yellow-400',
    red: 'from-red-500 to-pink-400'
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-slate-400">System Health Score</span>
        <span className={`text-lg font-bold text-${color}-400`}>{percent}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${gradientColors[color]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function Indicator({ icon: Icon, label, status, color }) {
  const colorClasses = {
    emerald: 'text-emerald-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
    amber: 'text-amber-400',
    slate: 'text-slate-400'
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded bg-white/5">
      <Icon className={`w-3 h-3 ${colorClasses[color]}`} />
      <div className="flex-1">
        <div className="text-[10px] text-slate-400">{label}</div>
        <div className={`text-[9px] font-medium capitalize ${colorClasses[color]}`}>
          {status}
        </div>
      </div>
    </div>
  );
}

function Alert({ icon: Icon, message, severity }) {
  const colors = {
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-2 p-2 rounded border ${colors[severity]}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="text-[10px]">{message}</span>
    </motion.div>
  );
}

export default SystemHealthMonitor;
