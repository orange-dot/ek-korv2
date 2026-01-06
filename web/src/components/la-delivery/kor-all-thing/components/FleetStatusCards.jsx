import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Truck, Bot, Battery, Navigation } from 'lucide-react';

/**
 * Fleet Status Cards
 * Shows status breakdown for drones, pods, and swarm bots
 */

const DELIVERY_STATES = {
  IDLE: 'idle',
  CHARGING: 'charging',
  FLYING: 'flying',
  EN_ROUTE: 'en_route',
  DELIVERING: 'delivering',
  DISPATCHING: 'dispatching',
  SWARMING: 'swarming',
  HANDOFF_WAITING: 'handoff_waiting',
  HANDOFF_ACTIVE: 'handoff_active',
  RETURNING: 'returning'
};

export function FleetStatusCards({ drones = [], pods = [], swarmBots = [] }) {
  return (
    <div className="space-y-3">
      <DroneCard drones={drones} />
      <PodCard pods={pods} />
      <SwarmBotCard swarmBots={swarmBots} />
    </div>
  );
}

function DroneCard({ drones }) {
  const flying = drones.filter(d =>
    d.state === DELIVERY_STATES.FLYING ||
    d.state === DELIVERY_STATES.EN_ROUTE
  ).length;
  const charging = drones.filter(d => d.state === DELIVERY_STATES.CHARGING).length;
  const handoff = drones.filter(d =>
    d.state?.includes('handoff') ||
    d.state === DELIVERY_STATES.HANDOFF_WAITING ||
    d.state === DELIVERY_STATES.HANDOFF_ACTIVE
  ).length;
  const avgBattery = drones.length > 0
    ? Math.round(drones.reduce((sum, d) => sum + (d.batteryLevel ?? d.batterySoc ?? 0), 0) / drones.length)
    : 0;

  return (
    <FleetCard
      title="Drones"
      icon={Plane}
      total={drones.length}
      color="cyan"
      stats={[
        { label: 'Flying', value: flying, color: 'emerald' },
        { label: 'Charging', value: charging, color: 'amber' },
        { label: 'Handoff', value: handoff, color: 'purple' }
      ]}
      avgBattery={avgBattery}
    />
  );
}

function PodCard({ pods }) {
  const moving = pods.filter(d =>
    d.state === DELIVERY_STATES.EN_ROUTE ||
    d.state === 'moving'
  ).length;
  const charging = pods.filter(d => d.state === DELIVERY_STATES.CHARGING).length;
  const dispatching = pods.filter(d =>
    d.state === DELIVERY_STATES.DISPATCHING
  ).length;
  const avgBattery = pods.length > 0
    ? Math.round(pods.reduce((sum, p) => sum + (p.batteryLevel ?? p.batterySoc ?? 0), 0) / pods.length)
    : 0;

  return (
    <FleetCard
      title="Ground Pods"
      icon={Truck}
      total={pods.length}
      color="green"
      stats={[
        { label: 'Moving', value: moving, color: 'emerald' },
        { label: 'Charging', value: charging, color: 'amber' },
        { label: 'Dispatch', value: dispatching, color: 'purple' }
      ]}
      avgBattery={avgBattery}
    />
  );
}

function SwarmBotCard({ swarmBots }) {
  const delivering = swarmBots.filter(d =>
    d.state === DELIVERY_STATES.DELIVERING
  ).length;
  const swarming = swarmBots.filter(d =>
    d.state === DELIVERY_STATES.SWARMING
  ).length;
  const idle = swarmBots.filter(d =>
    d.state === DELIVERY_STATES.IDLE
  ).length;
  const avgBattery = swarmBots.length > 0
    ? Math.round(swarmBots.reduce((sum, s) => sum + (s.batteryLevel ?? s.batterySoc ?? 0), 0) / swarmBots.length)
    : 0;

  return (
    <FleetCard
      title="Swarm Bots"
      icon={Bot}
      total={swarmBots.length}
      color="pink"
      stats={[
        { label: 'Deliver', value: delivering, color: 'emerald' },
        { label: 'Swarm', value: swarming, color: 'cyan' },
        { label: 'Idle', value: idle, color: 'slate' }
      ]}
      avgBattery={avgBattery}
    />
  );
}

function FleetCard({ title, icon: Icon, total, color, stats, avgBattery }) {
  const colorClasses = {
    cyan: 'border-cyan-500/20 text-cyan-400',
    green: 'border-green-500/20 text-green-400',
    pink: 'border-pink-500/20 text-pink-400'
  };

  const batteryColor = avgBattery > 50 ? 'text-emerald-400' :
    avgBattery > 20 ? 'text-amber-400' : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-lg bg-white/5 border ${colorClasses[color].split(' ')[0]}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`font-medium flex items-center gap-2 ${colorClasses[color].split(' ')[1]}`}>
          <Icon className="w-4 h-4" />
          {title}
        </span>
        <span className="text-white font-bold">{total}</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
        {stats.map(stat => (
          <div key={stat.label} className="text-center">
            <div className={`font-bold text-${stat.color}-400`}>{stat.value}</div>
            <div className="text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Battery Status */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
        <Battery className={`w-3 h-3 ${batteryColor}`} />
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              avgBattery > 50 ? 'bg-emerald-500' :
              avgBattery > 20 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${avgBattery}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className={`text-[10px] font-mono ${batteryColor}`}>
          {avgBattery}%
        </span>
      </div>
    </motion.div>
  );
}

export default FleetStatusCards;
