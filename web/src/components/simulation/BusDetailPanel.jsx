import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bus,
  Battery,
  BatteryCharging,
  Route,
  MapPin,
  Gauge,
  ThermometerSun,
  Clock,
  History,
  Bot,
  RefreshCw,
  Cpu,
  AlertTriangle,
  CheckCircle,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { useSimulation, BUS_STATES, CHARGING_PRIORITY } from '../../context/SimulationContext';

const TABS = [
  { id: 'info', label: 'Info', icon: Bus },
  { id: 'actions', label: 'Akcije', icon: Zap },
  { id: 'history', label: 'Istorija', icon: History },
  { id: 'robot', label: 'Robot', icon: Bot },
];

const STATE_LABELS = {
  [BUS_STATES.DRIVING]: { label: 'Vozi', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  [BUS_STATES.CHARGING]: { label: 'Puni se', color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  [BUS_STATES.WAITING]: { label: 'Čeka', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  [BUS_STATES.SWAPPING]: { label: 'Zamena', color: 'text-purple-400', bg: 'bg-purple-500/20' },
};

const PRIORITY_LABELS = {
  [CHARGING_PRIORITY.LOW]: { label: 'Nizak', color: 'text-slate-400' },
  [CHARGING_PRIORITY.NORMAL]: { label: 'Normalan', color: 'text-slate-300' },
  [CHARGING_PRIORITY.HIGH]: { label: 'Visok', color: 'text-amber-400' },
  [CHARGING_PRIORITY.EMERGENCY]: { label: 'Hitan', color: 'text-red-400' },
};

function InfoTab({ bus, route }) {
  const stateInfo = STATE_LABELS[bus.state] || STATE_LABELS[BUS_STATES.DRIVING];
  const priorityInfo = PRIORITY_LABELS[bus.chargingPriority] || PRIORITY_LABELS[CHARGING_PRIORITY.NORMAL];

  return (
    <div className="space-y-4">
      {/* Status card */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-400 uppercase tracking-wider">Status</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${stateInfo.bg} ${stateInfo.color}`}>
            {stateInfo.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Battery className="w-3.5 h-3.5" />
              <span className="text-xs">Baterija</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {Math.round(bus.batteryLevel)}%
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full mt-1">
              <div
                className={`h-full rounded-full transition-all ${
                  bus.batteryLevel > 50 ? 'bg-emerald-500' :
                  bus.batteryLevel > 20 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${bus.batteryLevel}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Gauge className="w-3.5 h-3.5" />
              <span className="text-xs">Progres rute</span>
            </div>
            <div className="text-lg font-semibold text-white">
              {Math.round(bus.progress * 100)}%
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full mt-1">
              <div
                className="h-full rounded-full bg-cyan-500"
                style={{ width: `${bus.progress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Route info */}
      {route && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Route className="w-3.5 h-3.5" />
            <span className="text-xs uppercase tracking-wider">Linija</span>
          </div>
          <div className="text-white font-medium">{route.name}</div>
          {route.description && (
            <div className="text-xs text-slate-400 mt-1">{route.description}</div>
          )}
          <div
            className="w-full h-1 rounded-full mt-2"
            style={{ backgroundColor: route.color }}
          />
        </div>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <ThermometerSun className="w-3.5 h-3.5" />
            <span className="text-xs">Temp</span>
          </div>
          <div className="text-sm font-medium text-white">
            {Math.floor(25 + Math.random() * 15)}°C
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-xs">Prioritet</span>
          </div>
          <div className={`text-sm font-medium ${priorityInfo.color}`}>
            {priorityInfo.label}
          </div>
        </div>
      </div>

      {/* Special flags */}
      {(bus.isRerouted || bus.isOptimized || bus.enhancedMonitoring || bus.emergencyProtocol) && (
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Aktivni flagovi</div>
          <div className="flex flex-wrap gap-2">
            {bus.isRerouted && (
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                Preusmereno
              </span>
            )}
            {bus.isOptimized && (
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                Optimizovano
              </span>
            )}
            {bus.enhancedMonitoring && (
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                Monitoring+
              </span>
            )}
            {bus.emergencyProtocol && (
              <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                Hitni protokol
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionsTab({ bus, onAction }) {
  const { forceChargeBus, triggerSwap, setBusPriority, chargingStations, buses } = useSimulation();

  const nearestStation = useMemo(() => {
    return chargingStations.find(s => s.busesCharging.length < s.chargingPoints) || chargingStations[0];
  }, [chargingStations]);

  const swapStation = useMemo(() => {
    return chargingStations.find(s => s.hasRobotB && s.robotBStatus === 'idle') || chargingStations.find(s => s.hasRobotB);
  }, [chargingStations]);

  const handleForceCharge = () => {
    if (nearestStation) {
      forceChargeBus(bus.id, nearestStation.id);
    }
  };

  const handleSwap = () => {
    if (swapStation) {
      triggerSwap(bus.id, swapStation.id);
    }
  };

  const handleSetPriority = (priority) => {
    setBusPriority(bus.id, priority);
  };

  return (
    <div className="space-y-4">
      {/* Quick actions */}
      <div className="space-y-2">
        <button
          onClick={handleForceCharge}
          disabled={bus.state === BUS_STATES.CHARGING}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <BatteryCharging className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-white">Pošalji na punjenje</div>
            <div className="text-xs text-slate-400">
              {nearestStation ? `Stanica: ${nearestStation.name}` : 'Nema dostupne stanice'}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={handleSwap}
          disabled={!swapStation || bus.state === BUS_STATES.SWAPPING}
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-white">Zatraži zamenu baterije</div>
            <div className="text-xs text-slate-400">
              {swapStation ? `Robot B: ${swapStation.name}` : 'Nema swap stanice'}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-white">Pokreni dijagnostiku</div>
            <div className="text-xs text-slate-400">Proveri status modula</div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Priority selector */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="text-xs text-slate-400 uppercase tracking-wider mb-3">Prioritet punjenja</div>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(CHARGING_PRIORITY).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleSetPriority(value)}
              className={`p-2 rounded text-xs font-medium transition-colors ${
                bus.chargingPriority === value
                  ? 'bg-cyan-500 text-white'
                  : 'bg-white/10 text-slate-400 hover:bg-white/20'
              }`}
            >
              {PRIORITY_LABELS[value]?.label || key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoryTab({ bus }) {
  const history = bus.decisionHistory || [];

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
        <History className="w-8 h-8 mb-2 opacity-50" />
        <div className="text-sm">Nema istorije odluka</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {history.slice().reverse().map((entry, index) => (
        <div
          key={index}
          className="bg-white/5 rounded-lg p-3 border border-white/10"
        >
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2">
              {entry.aiTakeover ? (
                <Bot className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="text-xs font-medium text-white">
                {entry.optionLabel}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              {new Date(entry.timestamp).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="text-xs text-slate-400 ml-5.5">
            {entry.message}
          </div>
          {entry.aiTakeover && (
            <div className="text-xs text-amber-400/60 ml-5.5 mt-1">
              AI automatski
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RobotTab({ bus }) {
  const { chargingStations } = useSimulation();

  // Find if any robot is assigned to this bus
  const robotInteraction = useMemo(() => {
    for (const station of chargingStations) {
      if (station.robotATargetBus === bus.id) {
        return { type: 'A', station, status: station.robotAStatus, progress: station.robotAProgress };
      }
      if (station.robotBTargetBus === bus.id) {
        return { type: 'B', station, status: station.robotBStatus, progress: station.robotBProgress };
      }
    }
    return null;
  }, [chargingStations, bus.id]);

  if (!robotInteraction) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
        <Bot className="w-8 h-8 mb-2 opacity-50" />
        <div className="text-sm">Nema aktivne robot interakcije</div>
        <div className="text-xs mt-1">Robot će biti dodeljen pri punjenju ili zameni</div>
      </div>
    );
  }

  const statusLabels = {
    idle: 'Spreman',
    dispatched: 'Putuje do busa',
    connecting: 'Povezivanje',
    active: 'Aktivan - punjenje',
    swapping: 'Zamena baterije',
    returning: 'Vraća se na stanicu',
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            robotInteraction.type === 'A' ? 'bg-cyan-500/20' : 'bg-purple-500/20'
          }`}>
            <Bot className={`w-6 h-6 ${
              robotInteraction.type === 'A' ? 'text-cyan-400' : 'text-purple-400'
            }`} />
          </div>
          <div>
            <div className="text-lg font-semibold text-white">
              Robot {robotInteraction.type}
            </div>
            <div className="text-sm text-slate-400">
              {robotInteraction.station.name}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">Status</span>
              <span className={`font-medium ${
                robotInteraction.status === 'active' || robotInteraction.status === 'swapping'
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}>
                {statusLabels[robotInteraction.status] || robotInteraction.status}
              </span>
            </div>
          </div>

          {robotInteraction.progress > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Progres</span>
                <span className="text-white">{Math.round(robotInteraction.progress)}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full">
                <div
                  className={`h-full rounded-full transition-all ${
                    robotInteraction.type === 'A' ? 'bg-cyan-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${robotInteraction.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
        <div className="text-xs text-slate-400 mb-2">Robot tip</div>
        <div className="text-sm text-white">
          {robotInteraction.type === 'A'
            ? 'Robot A - Montiran na autobus za automatsko punjenje'
            : 'Robot B - Stacionaran na stanici za zamenu baterija'
          }
        </div>
      </div>
    </div>
  );
}

export default function BusDetailPanel({ onClose }) {
  const { selectedItem, buses, routes, clearSelection } = useSimulation();
  const [activeTab, setActiveTab] = useState('info');

  const bus = useMemo(() => {
    if (selectedItem?.type !== 'bus') return null;
    return buses.find(b => b.id === selectedItem.id);
  }, [selectedItem, buses]);

  const route = useMemo(() => {
    if (!bus) return null;
    return routes.find(r => r.id === bus.routeId);
  }, [bus, routes]);

  if (!bus) return null;

  const handleClose = () => {
    clearSelection();
    onClose?.();
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute right-4 top-4 bottom-4 w-80 bg-[#0a0a0f]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden pointer-events-auto z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Bus className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="text-lg font-semibold text-white">{bus.name}</div>
              <div className="text-xs text-slate-400">ID: {bus.id}</div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'info' && <InfoTab bus={bus} route={route} />}
            {activeTab === 'actions' && <ActionsTab bus={bus} />}
            {activeTab === 'history' && <HistoryTab bus={bus} />}
            {activeTab === 'robot' && <RobotTab bus={bus} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
