import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bus,
  Battery,
  Route,
  Zap,
  Bot,
  History,
  Settings,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
} from 'lucide-react';
import { useSimulation, BUS_STATES } from '../../context/SimulationContext';

function getStatusColor(state) {
  switch (state) {
    case BUS_STATES.DRIVING:
      return 'text-cyan-400';
    case BUS_STATES.CHARGING:
      return 'text-green-400';
    case BUS_STATES.WAITING:
      return 'text-yellow-400';
    case BUS_STATES.SWAPPING:
      return 'text-purple-400';
    default:
      return 'text-slate-400';
  }
}

function getBatteryColor(level) {
  if (level > 60) return 'text-green-400';
  if (level > 30) return 'text-yellow-400';
  return 'text-red-400';
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        active
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function InfoRow({ icon: Icon, label, value, valueColor }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-slate-500" />
        <span className="text-slate-400">{label}</span>
      </div>
      <span className={`font-medium ${valueColor || 'text-white'}`}>{value}</span>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, variant = 'default' }) {
  const variants = {
    default: 'bg-white/5 hover:bg-white/10 text-white border-white/10',
    primary: 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-cyan-500/30',
    warning: 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/30',
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg border transition-all ${variants[variant]}`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}

function HistoryEvent({ event, t }) {
  const icons = {
    charging_started: Zap,
    charging_completed: CheckCircle,
    swap_completed: Bot,
    route_changed: Route,
    low_battery: AlertTriangle,
    diagnostics_run: Settings,
  };

  const colors = {
    charging_started: 'text-green-400 bg-green-400/10',
    charging_completed: 'text-green-400 bg-green-400/10',
    swap_completed: 'text-purple-400 bg-purple-400/10',
    route_changed: 'text-cyan-400 bg-cyan-400/10',
    low_battery: 'text-red-400 bg-red-400/10',
    diagnostics_run: 'text-blue-400 bg-blue-400/10',
  };

  const Icon = icons[event.type] || Clock;
  const colorClass = colors[event.type] || 'text-slate-400 bg-slate-400/10';

  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-white text-sm">
          {t(`simulation.busModal.historyEvents.${event.type}`)}
        </p>
        <p className="text-slate-500 text-xs mt-1">{event.time}</p>
      </div>
    </div>
  );
}

export default function BusDetailModal() {
  const { t } = useTranslation();
  const { selectedItem, clearSelection, buses, routes, chargingStations } = useSimulation();
  const [activeTab, setActiveTab] = useState('info');

  const bus = useMemo(() => {
    if (selectedItem?.type !== 'bus') return null;
    return buses.find((b) => b.id === selectedItem.id);
  }, [selectedItem, buses]);

  const route = useMemo(() => {
    if (!bus) return null;
    return routes.find((r) => r.id === bus.routeId);
  }, [bus, routes]);

  // Calculate estimated range (simple: 1% battery = 2km)
  const estimatedRange = useMemo(() => {
    if (!bus) return 0;
    return Math.round(bus.batteryLevel * 2);
  }, [bus]);

  // Find nearest station
  const nearestStation = useMemo(() => {
    if (!chargingStations.length) return null;
    return chargingStations[0]; // Simplified - would calculate actual nearest
  }, [chargingStations]);

  // Mock history events (in real app, this would come from context/API)
  const historyEvents = useMemo(() => {
    if (!bus) return [];
    // Generate some mock events based on bus state
    const events = [];
    if (bus.state === BUS_STATES.CHARGING) {
      events.push({ type: 'charging_started', time: '2 min ago' });
    }
    if (bus.batteryLevel < 30) {
      events.push({ type: 'low_battery', time: '5 min ago' });
    }
    events.push({ type: 'route_changed', time: '15 min ago' });
    events.push({ type: 'charging_completed', time: '1 hour ago' });
    return events;
  }, [bus]);

  const isRobotAActive = bus?.state === BUS_STATES.CHARGING || bus?.batteryLevel < 20;

  if (!bus) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={clearSelection}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-6 py-4 border-b border-white/10">
            {/* Gradient accent */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <Bus className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{bus.name}</h2>
                  <p className="text-sm text-slate-400">{route?.name || 'Unknown route'}</p>
                </div>
              </div>
              <button
                onClick={clearSelection}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              <TabButton
                active={activeTab === 'info'}
                onClick={() => setActiveTab('info')}
                icon={Bus}
                label={t('simulation.busModal.info')}
              />
              <TabButton
                active={activeTab === 'actions'}
                onClick={() => setActiveTab('actions')}
                icon={Play}
                label={t('simulation.busModal.actions')}
              />
              <TabButton
                active={activeTab === 'history'}
                onClick={() => setActiveTab('history')}
                icon={History}
                label={t('simulation.busModal.history')}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[400px] overflow-y-auto">
            {activeTab === 'info' && (
              <div className="space-y-1">
                <InfoRow
                  icon={Route}
                  label={t('simulation.busModal.currentRoute')}
                  value={route?.name || '-'}
                />
                <InfoRow
                  icon={Battery}
                  label={t('simulation.busModal.batteryLevel')}
                  value={`${Math.round(bus.batteryLevel)}%`}
                  valueColor={getBatteryColor(bus.batteryLevel)}
                />
                <InfoRow
                  icon={Zap}
                  label={t('simulation.busModal.currentStatus')}
                  value={t(`simulation.states.${bus.state}`)}
                  valueColor={getStatusColor(bus.state)}
                />
                <InfoRow
                  icon={Bot}
                  label={t('simulation.busModal.robotA')}
                  value={isRobotAActive ? t('simulation.robotStatus.active') : t('simulation.robotStatus.idle')}
                  valueColor={isRobotAActive ? 'text-cyan-400' : 'text-slate-400'}
                />
                <InfoRow
                  icon={MapPin}
                  label={t('simulation.busModal.estimatedRange')}
                  value={`${estimatedRange} ${t('simulation.busModal.kmRemaining')}`}
                />
                {nearestStation && (
                  <InfoRow
                    icon={Zap}
                    label={t('simulation.busModal.nextStation')}
                    value={`${nearestStation.name} (${t('simulation.busModal.inMinutes', { minutes: Math.round(5 + Math.random() * 10) })})`}
                  />
                )}
              </div>
            )}

            {activeTab === 'actions' && (
              <div className="space-y-3">
                <ActionButton
                  icon={Zap}
                  label={t('simulation.busModal.sendToCharge')}
                  onClick={() => console.log('Send to charge')}
                  variant="primary"
                />
                <ActionButton
                  icon={Bot}
                  label={t('simulation.busModal.requestSwap')}
                  onClick={() => console.log('Request swap')}
                  variant="warning"
                />
                <ActionButton
                  icon={Settings}
                  label={t('simulation.busModal.diagnostics')}
                  onClick={() => console.log('Run diagnostics')}
                />
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                {historyEvents.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">
                    {t('simulation.busModal.noHistory')}
                  </p>
                ) : (
                  <div>
                    {historyEvents.map((event, index) => (
                      <HistoryEvent key={index} event={event} t={t} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer status bar */}
          <div className="px-6 py-3 bg-white/5 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  bus.state === BUS_STATES.CHARGING
                    ? 'bg-green-400 animate-pulse'
                    : bus.state === BUS_STATES.DRIVING
                    ? 'bg-cyan-400'
                    : 'bg-yellow-400'
                }`}
              />
              <span className="text-sm text-slate-400">
                {t(`simulation.states.${bus.state}`)}
              </span>
            </div>
            <span className="text-xs text-slate-500">ID: {bus.id}</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
