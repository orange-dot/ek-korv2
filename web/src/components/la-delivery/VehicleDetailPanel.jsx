/**
 * Vehicle Detail Panel - LA Delivery Simulation
 * Futuristic design with neon accents and glassmorphism
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Battery,
  MapPin,
  Clock,
  Package,
  Zap,
  Star,
  AlertTriangle,
  Navigation,
  Target,
  RotateCcw,
  ArrowUp,
  Radio,
  History,
  Activity,
  Cpu,
  ThermometerSun,
  Signal,
  Hexagon,
  ChevronRight,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { DELIVERY_PRIORITY, PRIORITY_CONFIG, DELIVERY_STATES } from '../../data/laDelivery';

// Tab configuration
const TABS = [
  { id: 'mission', label: 'MISSION', icon: Target },
  { id: 'actions', label: 'ACTIONS', icon: Zap },
  { id: 'log', label: 'LOG', icon: History },
  { id: 'grid', label: 'GRID', icon: Hexagon }
];

// Vehicle type icons and colors
const VEHICLE_CONFIG = {
  drone: {
    icon: '🚁',
    color: '#00f0ff',
    label: 'DRONE'
  },
  pod: {
    icon: '🚐',
    color: '#39ff14',
    label: 'POD'
  },
  swarmbot: {
    icon: '🤖',
    color: '#ff006e',
    label: 'SWARM'
  }
};

// State color mapping
const STATE_COLORS = {
  [DELIVERY_STATES.FLYING]: '#00f0ff',
  [DELIVERY_STATES.EN_ROUTE]: '#39ff14',
  [DELIVERY_STATES.CHARGING]: '#fbbf24',
  [DELIVERY_STATES.IDLE]: '#6b7280',
  [DELIVERY_STATES.SWARMING]: '#ff006e',
  [DELIVERY_STATES.DELIVERING]: '#39ff14',
  [DELIVERY_STATES.LANDING]: '#ff6b00',
  [DELIVERY_STATES.HANDOFF_ACTIVE]: '#9d4edd',
  [DELIVERY_STATES.LOADING]: '#fbbf24',
  [DELIVERY_STATES.RETURNING]: '#00f0ff'
};

// Format timestamp
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const formatTimeAgo = (timestamp) => {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
};

// ============================================================================
// Mission Tab Component
// ============================================================================
function MissionTab({ vehicle, vehicleType }) {
  const config = VEHICLE_CONFIG[vehicleType];
  const priorityConfig = PRIORITY_CONFIG[vehicle.priority] || PRIORITY_CONFIG[DELIVERY_PRIORITY.STANDARD];
  const stateColor = STATE_COLORS[vehicle.state] || '#6b7280';

  const currentMission = vehicle.missionQueue?.find(m => m.status === 'active');
  const queuedMissions = vehicle.missionQueue?.filter(m => m.status === 'queued') || [];

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <div className="relative p-4 rounded-lg overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(0,240,255,0.1) 0%, rgba(0,0,0,0.3) 100%)' }}>
        {/* Scan line animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-scan" />
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <div className="text-xs text-gray-400 font-mono">STATUS</div>
              <div className="font-bold uppercase" style={{ color: stateColor }}>
                {vehicle.state.replace(/_/g, ' ')}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400 font-mono">PRIORITY</div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded"
              style={{ background: priorityConfig.bgColor, color: priorityConfig.color }}>
              <Star className="w-3 h-3" />
              <span className="text-xs font-bold">{priorityConfig.label.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Battery & Packages */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 rounded bg-black/30">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Battery className="w-3 h-3" />
              <span className="font-mono">BATTERY</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${vehicle.batteryLevel}%`,
                    background: vehicle.batteryLevel > 50 ? '#39ff14' :
                      vehicle.batteryLevel > 20 ? '#fbbf24' : '#ef4444'
                  }}
                />
              </div>
              <span className="text-sm font-mono font-bold" style={{
                color: vehicle.batteryLevel > 50 ? '#39ff14' :
                  vehicle.batteryLevel > 20 ? '#fbbf24' : '#ef4444'
              }}>
                {Math.round(vehicle.batteryLevel)}%
              </span>
            </div>
          </div>

          <div className="p-2 rounded bg-black/30">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Package className="w-3 h-3" />
              <span className="font-mono">CARGO</span>
            </div>
            <div className="text-lg font-bold" style={{ color: config.color }}>
              {vehicle.packages || 0}
              <span className="text-xs text-gray-400 ml-1">PKG</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Mission */}
      {currentMission && (
        <div className="p-3 rounded-lg border border-cyan-500/30"
          style={{ background: 'rgba(0,240,255,0.05)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs text-cyan-400 font-mono">ACTIVE MISSION</span>
            </div>
            <span className="text-xs text-gray-400 font-mono">
              ETA {currentMission.eta}min
            </span>
          </div>
          <div className="text-white font-bold">{currentMission.type.replace(/_/g, ' ')}</div>
          <div className="text-xs text-gray-400 mt-1">
            {currentMission.packages} package(s) • Zone: {currentMission.destination?.toUpperCase()}
          </div>
        </div>
      )}

      {/* Mission Queue */}
      {queuedMissions.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 font-mono mb-2">QUEUE ({queuedMissions.length})</div>
          <div className="space-y-1">
            {queuedMissions.slice(0, 3).map((mission, i) => (
              <div key={mission.id}
                className="flex items-center justify-between p-2 rounded bg-black/20 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-mono">{i + 1}</span>
                  <span className="text-gray-300">{mission.type.replace(/_/g, ' ')}</span>
                </div>
                <span className="text-xs text-gray-500">{mission.eta}min</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicle specific info */}
      {vehicleType === 'drone' && vehicle.altitude && (
        <div className="p-2 rounded bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ArrowUp className="w-3 h-3" />
            <span className="font-mono">ALTITUDE</span>
          </div>
          <span className="font-mono text-cyan-400">{Math.round(vehicle.altitude)}m</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Actions Tab Component
// ============================================================================
function ActionsTab({ vehicle, vehicleType, onAction }) {
  const config = VEHICLE_CONFIG[vehicleType];
  const priorityConfig = PRIORITY_CONFIG[vehicle.priority] || PRIORITY_CONFIG[DELIVERY_PRIORITY.STANDARD];

  const actions = [
    {
      id: 'force-return',
      label: 'Force Return',
      icon: RotateCcw,
      description: 'Send to nearest hub immediately',
      color: '#ff6b00',
      disabled: vehicle.state === DELIVERY_STATES.CHARGING
    },
    {
      id: 'priority-boost',
      label: 'Priority Boost',
      icon: Star,
      description: 'Elevate to next priority level',
      color: '#fbbf24',
      disabled: vehicle.priority === DELIVERY_PRIORITY.EMERGENCY
    },
    {
      id: 'redirect',
      label: 'Redirect',
      icon: Navigation,
      description: 'Change destination hub',
      color: '#00f0ff',
      disabled: vehicle.state === DELIVERY_STATES.IDLE
    },
    {
      id: 'abort',
      label: 'Abort Mission',
      icon: X,
      description: 'Cancel current delivery',
      color: '#ef4444',
      disabled: !vehicle.missionQueue?.some(m => m.status === 'active')
    }
  ];

  return (
    <div className="space-y-3">
      {/* Priority Selector */}
      <div className="p-3 rounded-lg bg-black/30">
        <div className="text-xs text-gray-400 font-mono mb-2">SET PRIORITY</div>
        <div className="grid grid-cols-4 gap-1">
          {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => onAction('set-priority', key)}
              className={`p-2 rounded text-xs font-bold transition-all ${
                vehicle.priority === key
                  ? 'ring-2'
                  : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                background: config.bgColor,
                color: config.color,
                ringColor: config.color
              }}
            >
              {config.label.slice(0, 4).toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => !action.disabled && onAction(action.id)}
            disabled={action.disabled}
            className={`w-full p-3 rounded-lg text-left transition-all group ${
              action.disabled
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:scale-[1.02]'
            }`}
            style={{
              background: action.disabled ? 'rgba(0,0,0,0.2)' : `linear-gradient(135deg, ${action.color}15 0%, rgba(0,0,0,0.3) 100%)`,
              border: `1px solid ${action.color}30`
            }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: `${action.color}20` }}>
                <action.icon className="w-4 h-4" style={{ color: action.color }} />
              </div>
              <div className="flex-1">
                <div className="font-bold text-white text-sm">{action.label}</div>
                <div className="text-xs text-gray-400">{action.description}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
            </div>
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="p-2 rounded bg-black/20 text-center">
          <div className="text-xs text-gray-400 font-mono">UPTIME</div>
          <div className="text-lg font-bold" style={{ color: config.color }}>
            {vehicle.metrics?.uptime || 0}%
          </div>
        </div>
        <div className="p-2 rounded bg-black/20 text-center">
          <div className="text-xs text-gray-400 font-mono">EFFICIENCY</div>
          <div className="text-lg font-bold" style={{ color: config.color }}>
            {vehicle.metrics?.efficiency || 0}%
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Log Tab Component
// ============================================================================
function LogTab({ vehicle, vehicleType }) {
  const config = VEHICLE_CONFIG[vehicleType];
  const allHistory = [
    ...(vehicle.history || []),
    ...(vehicle.decisionHistory || []).map(d => ({
      ...d,
      event: `Decision: ${d.scenarioType}`,
      isDecision: true
    }))
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 15);

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-400 font-mono mb-2">ACTIVITY LOG</div>

      <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
        {allHistory.map((entry, i) => (
          <motion.div
            key={entry.id || i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-2 rounded text-sm ${
              entry.isDecision
                ? 'bg-purple-500/10 border border-purple-500/30'
                : 'bg-black/20'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className={`font-medium ${entry.isDecision ? 'text-purple-400' : 'text-gray-200'}`}>
                  {entry.event}
                </div>
                {entry.details && (
                  <div className="text-xs text-gray-500 mt-0.5">{entry.details}</div>
                )}
                {entry.chosenOption && (
                  <div className="text-xs text-purple-300 mt-0.5">
                    → {entry.chosenOption} {entry.wasAI && <span className="text-purple-500">(AI)</span>}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 font-mono whitespace-nowrap">
                {formatTimeAgo(entry.timestamp)}
              </div>
            </div>
          </motion.div>
        ))}

        {allHistory.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <div className="text-sm">No activity yet</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Grid Tab Component (Hub/EK3 connection info)
// ============================================================================
function GridTab({ vehicle, vehicleType, hubs }) {
  const config = VEHICLE_CONFIG[vehicleType];

  // Find connected/nearest hub based on vehicle type
  const connectedHub = vehicle.state === DELIVERY_STATES.CHARGING
    ? hubs?.find(h => h.id === vehicle.targetHub || h.id === vehicle.baseHub)
    : null;

  const nearestHub = hubs?.[0]; // Simplified - would calculate in real app

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="p-3 rounded-lg"
        style={{
          background: connectedHub
            ? 'linear-gradient(135deg, rgba(57,255,20,0.1) 0%, rgba(0,0,0,0.3) 100%)'
            : 'linear-gradient(135deg, rgba(107,114,128,0.1) 0%, rgba(0,0,0,0.3) 100%)',
          border: `1px solid ${connectedHub ? '#39ff1430' : '#6b728030'}`
        }}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${connectedHub ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-xs font-mono" style={{ color: connectedHub ? '#39ff14' : '#6b7280' }}>
            {connectedHub ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>

        {connectedHub ? (
          <div>
            <div className="text-white font-bold">{connectedHub.name}</div>
            <div className="text-xs text-gray-400 mt-1">
              {connectedHub.ek3Modules} EK3 modules • {connectedHub.maxPower}kW
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-sm">Not charging at any hub</div>
        )}
      </div>

      {/* EK3 Module Assignment */}
      {connectedHub && (
        <div className="p-3 rounded-lg bg-black/30">
          <div className="text-xs text-gray-400 font-mono mb-2">EK3 ASSIGNMENT</div>
          <div className="grid grid-cols-6 gap-1">
            {Array.from({ length: connectedHub.ek3Modules }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded flex items-center justify-center text-xs font-mono ${
                  i < 2 ? 'bg-cyan-500/30 text-cyan-400' : 'bg-gray-700/30 text-gray-500'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Using 2 of {connectedHub.ek3Modules} modules • 6.6kW
          </div>
        </div>
      )}

      {/* Queue Position */}
      {vehicle.state === DELIVERY_STATES.CHARGING && (
        <div className="p-2 rounded bg-black/20 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-mono">QUEUE POSITION</span>
          <span className="font-mono text-cyan-400">#1</span>
        </div>
      )}

      {/* Health Metrics */}
      <div className="p-3 rounded-lg bg-black/30">
        <div className="text-xs text-gray-400 font-mono mb-2">HEALTH</div>
        <div className="space-y-2">
          {vehicle.health && Object.entries(vehicle.health).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 capitalize w-24">{key}</span>
              <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${key === 'temperature' ? Math.min(100, value * 2) : value}%`,
                    background: key === 'temperature'
                      ? (value > 40 ? '#ef4444' : value > 30 ? '#fbbf24' : '#39ff14')
                      : (value > 90 ? '#39ff14' : value > 70 ? '#fbbf24' : '#ef4444')
                  }}
                />
              </div>
              <span className="text-xs font-mono w-10 text-right" style={{
                color: key === 'temperature'
                  ? (value > 40 ? '#ef4444' : value > 30 ? '#fbbf24' : '#39ff14')
                  : (value > 90 ? '#39ff14' : value > 70 ? '#fbbf24' : '#ef4444')
              }}>
                {key === 'temperature' ? `${value}°C` : `${value}%`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main VehicleDetailPanel Component
// ============================================================================
export default function VehicleDetailPanel({
  vehicle,
  vehicleType,
  hubs,
  onClose,
  onAction
}) {
  const [activeTab, setActiveTab] = useState('mission');
  const config = VEHICLE_CONFIG[vehicleType];

  if (!vehicle) return null;

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute right-0 top-0 h-full w-80 z-40"
      style={{
        background: 'linear-gradient(180deg, rgba(10,10,15,0.95) 0%, rgba(26,26,46,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderLeft: `1px solid ${config.color}30`
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <div className="font-bold text-white">{vehicle.id.toUpperCase()}</div>
              <div className="text-xs font-mono" style={{ color: config.color }}>
                {config.label} • Zone {vehicle.zone?.toUpperCase()}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 bg-black/30 p-1 rounded-lg">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-2 py-1.5 rounded text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              style={{
                background: activeTab === tab.id ? `${config.color}30` : 'transparent',
                boxShadow: activeTab === tab.id ? `0 0 10px ${config.color}30` : 'none'
              }}
            >
              <tab.icon className="w-3 h-3 mx-auto mb-0.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'mission' && (
              <MissionTab vehicle={vehicle} vehicleType={vehicleType} />
            )}
            {activeTab === 'actions' && (
              <ActionsTab vehicle={vehicle} vehicleType={vehicleType} onAction={onAction} />
            )}
            {activeTab === 'log' && (
              <LogTab vehicle={vehicle} vehicleType={vehicleType} />
            )}
            {activeTab === 'grid' && (
              <GridTab vehicle={vehicle} vehicleType={vehicleType} hubs={hubs} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Circuit board decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none overflow-hidden opacity-20">
        <svg className="w-full h-full" viewBox="0 0 320 80">
          <defs>
            <pattern id="circuit" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 20 15 M 20 25 L 20 40 M 0 20 L 15 20 M 25 20 L 40 20"
                stroke={config.color} strokeWidth="0.5" fill="none" opacity="0.5" />
              <circle cx="20" cy="20" r="2" fill={config.color} opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>
      </div>

      {/* CSS for scan animation */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </motion.div>
  );
}
