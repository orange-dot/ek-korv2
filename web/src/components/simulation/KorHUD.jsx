import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Zap,
  AlertTriangle,
  CheckCircle,
  Battery,
  Cpu,
  Activity,
  Eye,
  AlertOctagon,
  Navigation,
  Wrench,
  Clock,
  TrendingDown,
  RefreshCw,
  BatteryWarning,
  Construction,
  CloudLightning,
  Timer,
  X,
  Bus,
  Route,
  Gauge,
  ThermometerSun,
  Wifi,
  MapPin,
  Power,
  Settings,
  BatteryCharging,
} from 'lucide-react';
import { useSimulation, BUS_STATES } from '../../context/SimulationContext';

// Scenario types
const SCENARIO_TYPES = {
  TRAFFIC_JAM: 'traffic_jam',
  REROUTE: 'reroute',
  LOW_BATTERY: 'low_battery',
  CRITICAL_BATTERY: 'critical_battery',
  MAINTENANCE: 'maintenance',
  FORCE_MAJEURE: 'force_majeure',
  FLEET_EMPTY: 'fleet_empty',
  ROBOT_DISPATCH: 'robot_dispatch',
  CHARGING_QUEUE: 'charging_queue',
  SWAP_MODULE: 'swap_module',
};

// Scenario configurations
const SCENARIOS = {
  [SCENARIO_TYPES.TRAFFIC_JAM]: {
    icon: Construction,
    color: 'amber',
    titlePrefix: 'GUŽVA',
    modalTitle: 'SAOBRAĆAJNA GUŽVA DETEKTOVANA',
  },
  [SCENARIO_TYPES.REROUTE]: {
    icon: Navigation,
    color: 'cyan',
    titlePrefix: 'PREUSMERENJE',
    modalTitle: 'OPTIMIZACIJA RUTE',
  },
  [SCENARIO_TYPES.LOW_BATTERY]: {
    icon: BatteryWarning,
    color: 'amber',
    titlePrefix: 'NISKA BATERIJA',
    modalTitle: 'NISKA BATERIJA',
  },
  [SCENARIO_TYPES.CRITICAL_BATTERY]: {
    icon: AlertOctagon,
    color: 'red',
    titlePrefix: 'KRITIČNA BATERIJA',
    modalTitle: 'KRITIČNO UPOZORENJE - BATERIJA',
  },
  [SCENARIO_TYPES.MAINTENANCE]: {
    icon: Wrench,
    color: 'purple',
    titlePrefix: 'ODRŽAVANJE',
    modalTitle: 'POTREBNO ODRŽAVANJE',
  },
  [SCENARIO_TYPES.FORCE_MAJEURE]: {
    icon: CloudLightning,
    color: 'red',
    titlePrefix: 'VIŠA SILA',
    modalTitle: 'VIŠA SILA - HITNA ODLUKA',
  },
  [SCENARIO_TYPES.FLEET_EMPTY]: {
    icon: TrendingDown,
    color: 'red',
    titlePrefix: 'FLOTA PRAZNA',
    modalTitle: 'KRITIČNO - FLOTA NA MINIMUMU',
  },
  [SCENARIO_TYPES.ROBOT_DISPATCH]: {
    icon: Bot,
    color: 'cyan',
    titlePrefix: 'ROBOT',
    modalTitle: 'ROBOT AKTIVIRAN',
  },
  [SCENARIO_TYPES.CHARGING_QUEUE]: {
    icon: Clock,
    color: 'amber',
    titlePrefix: 'RED ZA PUNJENJE',
    modalTitle: 'OPTIMIZACIJA REDA ZA PUNJENJE',
  },
  [SCENARIO_TYPES.SWAP_MODULE]: {
    icon: RefreshCw,
    color: 'purple',
    titlePrefix: 'SWAP MODULA',
    modalTitle: 'SWAP BATERIJSKOG MODULA',
  },
};

// Street names
const STREETS = [
  'Bulevar Oslobođenja', 'Futoski put', 'Bulevar Cara Lazara',
  'Kisačka ulica', 'Novosadskog sajma', 'Železnička stanica',
  'Liman', 'Novo Naselje', 'Detelinara', 'Satelit'
];

// Generate ONE random scenario - simpler approach
function generateRandomScenario(buses, routes) {
  if (buses.length === 0) return null;

  const now = Date.now();
  const scenarioType = Math.floor(Math.random() * 8); // 0-7
  const bus = buses[Math.floor(Math.random() * buses.length)];
  const route = routes.find(r => r.id === bus.routeId);
  const street = STREETS[Math.floor(Math.random() * STREETS.length)];

  switch (scenarioType) {
    case 0: // Traffic jam
      return {
        id: `traffic-${now}`,
        type: SCENARIO_TYPES.TRAFFIC_JAM,
        busName: bus.name,
        message: `Gužva: ${street}`,
        detail: `Kašnjenje ~${Math.floor(Math.random() * 15) + 5} min`,
        suggestion: `${Math.floor(Math.random() * 4) + 2} autobusa pogođeno`,
        urgency: 'SREDNJE',
        timeToDecide: 45,
        options: [
          { id: 'reroute', label: 'Preusmeri autobuse', description: 'Alternativna ruta bez gužve', recommended: true },
          { id: 'wait', label: 'Sačekaj prolaz', description: 'Nastavi kroz gužvu' },
        ],
        requiresApproval: true,
        showModal: true,
        timestamp: now,
      };

    case 1: // Route optimization
      return {
        id: `reroute-${now}`,
        type: SCENARIO_TYPES.REROUTE,
        busName: bus.name,
        message: `Optimizacija: ${route?.name || 'Linija ' + bus.routeId}`,
        detail: `Ušteda ${(Math.random() * 15 + 5).toFixed(1)}% energije`,
        suggestion: 'AI predlog baziran na real-time podacima',
        timeToDecide: 60,
        options: [
          { id: 'apply', label: 'Primeni novu rutu', description: 'Kraća ruta, manja potrošnja', recommended: true },
          { id: 'ignore', label: 'Zadrži postojeću', description: 'Bez promene' },
        ],
        requiresApproval: true,
        showModal: true,
        timestamp: now,
      };

    case 2: // Maintenance
      const modules = ['B1', 'B2', 'B3', 'C1', 'C2'];
      return {
        id: `maint-${now}`,
        type: SCENARIO_TYPES.MAINTENANCE,
        busName: bus.name,
        message: `Anomalija: Modul ${modules[Math.floor(Math.random() * modules.length)]}`,
        detail: 'Temperatura iznad normale',
        suggestion: 'Robot A preporučuje inspekciju',
        urgency: 'SREDNJE',
        timeToDecide: 60,
        options: [
          { id: 'inspect', label: 'Pošalji na pregled', description: 'Preventivna inspekcija', recommended: true },
          { id: 'monitor', label: 'Nastavi monitoring', description: 'Prati parametre' },
          { id: 'ignore', label: 'Ignoriši', description: 'Rizično!', danger: true },
        ],
        requiresApproval: true,
        showModal: true,
        timestamp: now,
      };

    case 3: // Force majeure
      const events = [
        { event: 'Nevreme prijavljeno', impact: 'Smanjena vidljivost' },
        { event: 'Saobraćajna nesreća', impact: 'Blokada puta' },
        { event: 'Prekid napajanja', impact: 'Stanica offline' },
      ];
      const evt = events[Math.floor(Math.random() * events.length)];
      return {
        id: `force-${now}`,
        type: SCENARIO_TYPES.FORCE_MAJEURE,
        message: evt.event,
        detail: evt.impact,
        suggestion: 'Potrebna hitna reakcija',
        urgency: 'HITNO',
        timeToDecide: 25,
        compensation: `Kompenzacija: +${Math.floor(Math.random() * 15) + 5} min`,
        options: [
          { id: 'protocol', label: 'Aktiviraj protokol', description: 'Automatske mere', recommended: true },
          { id: 'manual', label: 'Ručna kontrola', description: 'Preuzmi kontrolu', danger: true },
        ],
        requiresApproval: true,
        showModal: true,
        timestamp: now,
      };

    case 4: // Low battery warning
      return {
        id: `battery-${now}`,
        type: SCENARIO_TYPES.CRITICAL_BATTERY,
        busName: bus.name,
        message: `Kritična baterija: ${Math.floor(Math.random() * 15) + 5}%`,
        detail: `Preostalo ~${Math.floor(Math.random() * 20) + 5} min`,
        suggestion: 'Hitno punjenje potrebno',
        urgency: 'KRITIČNO',
        timeToDecide: 30,
        options: [
          { id: 'charge', label: 'Pošalji na punjenje', description: 'Najbliža stanica', recommended: true },
          { id: 'swap', label: 'Aktiviraj swap', description: 'Robot B intervencija' },
          { id: 'continue', label: 'Nastavi vožnju', description: 'Rizik!', danger: true },
        ],
        requiresApproval: true,
        showModal: true,
        timestamp: now,
      };

    case 5: // Charging queue
      return {
        id: `queue-${now}`,
        type: SCENARIO_TYPES.CHARGING_QUEUE,
        message: `Red za punjenje: ${Math.floor(Math.random() * 4) + 3} autobusa`,
        detail: 'Optimizacija redosleda',
        suggestion: `Prioritet: ${bus.name}`,
        timeToDecide: 45,
        options: [
          { id: 'ai', label: 'AI optimizacija', description: 'Minimizuj čekanje', recommended: true },
          { id: 'fifo', label: 'FIFO redosled', description: 'Ko prvi dođe' },
        ],
        requiresApproval: true,
        showModal: true,
        timestamp: now,
      };

    case 6: // Swap module
      return {
        id: `swap-${now}`,
        type: SCENARIO_TYPES.SWAP_MODULE,
        busName: bus.name,
        message: `Swap moguć: ${bus.name}`,
        detail: `${Math.floor(Math.random() * 30) + 50}% → 100% za 3 min`,
        suggestion: 'Robot B spreman',
        timeToDecide: 45,
        options: [
          { id: 'swap', label: 'Izvrši swap', description: '3 min do 100%', recommended: true },
          { id: 'charge', label: 'Nastavi punjenje', description: 'Standardno punjenje' },
        ],
        requiresApproval: true,
        showModal: true,
        timestamp: now,
      };

    case 7: // Fleet warning
      return {
        id: `fleet-${now}`,
        type: SCENARIO_TYPES.FLEET_EMPTY,
        message: `Flota na ${Math.floor(Math.random() * 20) + 15}%`,
        detail: `${Math.floor(Math.random() * 5) + 3} autobusa kritično`,
        suggestion: 'Sistemska intervencija',
        urgency: 'KRITIČNO',
        timeToDecide: 30,
        options: [
          { id: 'emergency', label: 'Hitni režim', description: 'Sve stanice max', recommended: true },
          { id: 'reduce', label: 'Smanji frekvenciju', description: 'Povuci 30% flote' },
        ],
        requiresApproval: true,
        showModal: true,
        timestamp: now,
      };

    default:
      return null;
  }
}

// Full screen decision modal
function DecisionModal({ decision, onAction, onTimeout }) {
  const [timeLeft, setTimeLeft] = useState(decision.timeToDecide || 30);
  const config = SCENARIOS[decision.type];
  const Icon = config?.icon || AlertTriangle;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          onTimeout(decision);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [decision, onTimeout]);

  const colorClasses = {
    red: { border: 'border-red-500', bg: 'bg-red-500', text: 'text-red-400', glow: 'shadow-red-500/30' },
    amber: { border: 'border-amber-500', bg: 'bg-amber-500', text: 'text-amber-400', glow: 'shadow-amber-500/30' },
    cyan: { border: 'border-cyan-500', bg: 'bg-cyan-500', text: 'text-cyan-400', glow: 'shadow-cyan-500/30' },
    purple: { border: 'border-purple-500', bg: 'bg-purple-500', text: 'text-purple-400', glow: 'shadow-purple-500/30' },
  };

  const colors = colorClasses[config?.color || 'amber'];
  const urgencyPercent = (timeLeft / (decision.timeToDecide || 30)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center decision-modal-overlay"
      style={{ pointerEvents: 'auto', zIndex: 9999 }}
    >
      {/* Backdrop - clicks close nothing, just visual */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Pulsing borders - visual only */}
      <div className={`absolute inset-4 border-2 ${colors.border} rounded-2xl opacity-30 animate-pulse pointer-events-none`} />

      {/* Main modal */}
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={`relative z-10 max-w-xl w-full mx-4 bg-black/95 backdrop-blur-md rounded-2xl border-2 ${colors.border} shadow-2xl ${colors.glow}`}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl overflow-hidden bg-white/10">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${urgencyPercent}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full ${colors.bg}`}
          />
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${colors.bg}/20 flex items-center justify-center ${config?.color === 'red' ? 'animate-pulse' : ''}`}>
              <Icon className={`w-6 h-6 ${colors.text}`} />
            </div>
            <div>
              <div className={`text-xs font-mono uppercase tracking-wider ${colors.text} mb-1`}>
                {decision.urgency || 'ODLUKA POTREBNA'}
              </div>
              <h2 className="text-lg font-bold text-white">
                {config?.modalTitle || 'HUMAN-IN-THE-LOOP'}
              </h2>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] text-slate-500">PREOSTALO</div>
              <div className={`text-3xl font-mono font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : colors.text}`}>
                {timeLeft}s
              </div>
            </div>
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                <circle
                  cx="28" cy="28" r="24" fill="none"
                  className={timeLeft <= 10 ? 'stroke-red-500' : `stroke-current ${colors.text}`}
                  strokeWidth="4"
                  strokeDasharray={`${urgencyPercent * 1.508} 150.8`}
                  strokeLinecap="round"
                />
              </svg>
              <Timer className={`absolute inset-0 m-auto w-6 h-6 ${timeLeft <= 10 ? 'text-red-500' : 'text-slate-400'}`} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {decision.busName && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/10 mb-3">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-sm font-mono text-white">{decision.busName}</span>
            </div>
          )}

          <h3 className="text-xl font-bold text-white mb-2">{decision.message}</h3>
          <p className="text-slate-400 mb-1">{decision.detail}</p>
          {decision.suggestion && (
            <p className="text-sm text-slate-500 italic mb-3">{decision.suggestion}</p>
          )}
          {decision.compensation && (
            <div className={`inline-flex items-center gap-2 px-3 py-2 ${colors.bg}/10 rounded border ${colors.border}/30 mb-3`}>
              <Clock className={`w-4 h-4 ${colors.text}`} />
              <span className={`text-sm font-medium ${colors.text}`}>{decision.compensation}</span>
            </div>
          )}

          {/* Options */}
          <div className="space-y-2 mt-5">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">IZABERITE AKCIJU:</div>
            {decision.options?.map((opt, i) => (
              <button
                key={opt.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(decision, opt.id);
                }}
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  opt.recommended
                    ? 'bg-emerald-500/10 border-emerald-500/50 hover:bg-emerald-500/20 hover:border-emerald-500'
                    : opt.danger
                    ? 'bg-red-500/5 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {opt.recommended && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                    {opt.danger && <AlertTriangle className="w-5 h-5 text-red-400" />}
                    {!opt.recommended && !opt.danger && <div className="w-5 h-5 rounded-full border-2 border-slate-500" />}
                    <div>
                      <div className={`font-semibold ${opt.recommended ? 'text-emerald-400' : opt.danger ? 'text-red-400' : 'text-white'}`}>
                        {opt.label}
                      </div>
                      <div className="text-sm text-slate-500">{opt.description}</div>
                    </div>
                  </div>
                  {opt.recommended && (
                    <span className="text-[10px] px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-bold">
                      PREPORUČENO
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-white/5 rounded-b-2xl">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              HUMAN-IN-THE-LOOP
            </span>
            <span className="font-mono">AI CONFIDENCE: {85 + Math.floor(Math.random() * 10)}%</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Mini card for sidebar
function MiniDecisionCard({ decision, onExpand }) {
  const config = SCENARIOS[decision.type];
  const Icon = config?.icon || AlertTriangle;

  const colorClass = {
    red: 'border-red-500/50 bg-red-500/10 text-red-400',
    amber: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
    cyan: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400',
    purple: 'border-purple-500/50 bg-purple-500/10 text-purple-400',
  }[config?.color || 'amber'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={() => onExpand(decision)}
      className={`p-3 rounded-lg border ${colorClass} mb-2 cursor-pointer hover:scale-[1.02] transition-transform`}
    >
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-mono opacity-70">{config?.titlePrefix}</div>
          <p className="text-sm text-white/90 truncate">{decision.message}</p>
          <span className="text-[10px] text-cyan-400 mt-1 inline-block">Klikni za odluku →</span>
        </div>
      </div>
    </motion.div>
  );
}

// Stat panel
function StatPanel({ label, value, unit, icon: Icon, color, position }) {
  return (
    <div className={`absolute ${position}`}>
      <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg p-2.5 min-w-[85px]">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Icon className={`w-3 h-3 ${color}`} />
          <span className="text-[9px] uppercase tracking-wider text-slate-500">{label}</span>
        </div>
        <div className="text-lg font-mono font-bold text-white">
          {value}<span className="text-[10px] text-slate-500 ml-0.5">{unit}</span>
        </div>
      </div>
    </div>
  );
}

// Action Flow visualization
const FLOW_STEPS = [
  { id: 'received', label: 'ODLUKA PRIMLJENA', icon: CheckCircle },
  { id: 'analyze', label: 'AI ANALIZA', icon: Cpu },
  { id: 'dispatch', label: 'SLANJE KOMANDE', icon: Zap },
  { id: 'execute', label: 'IZVRŠAVANJE', icon: Activity },
  { id: 'complete', label: 'ZAVRŠENO', icon: CheckCircle },
];

function ActionFlow({ action, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress through steps
    const stepDuration = 800;
    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          if (currentStep < FLOW_STEPS.length - 1) {
            setCurrentStep(s => s + 1);
            return 0;
          } else {
            clearInterval(progressInterval);
            setTimeout(onComplete, 500);
            return 100;
          }
        }
        return p + 5;
      });
    }, stepDuration / 20);

    return () => clearInterval(progressInterval);
  }, [currentStep, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 flex items-center justify-center z-[9998] pointer-events-none"
    >
      <div className="bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl shadow-cyan-500/20">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-[10px] font-mono text-cyan-500 mb-1">AI OPTIMIZACIJA</div>
          <div className="text-xl font-bold text-white">{action?.label}</div>
          <div className="text-sm text-slate-400 mt-1">{action?.description}</div>
        </div>

        {/* Flow steps */}
        <div className="space-y-3">
          {FLOW_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep;
            const isPending = index > currentStep;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-center gap-4 p-3 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-500/50'
                    : isComplete
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'bg-cyan-500/30'
                    : isComplete
                    ? 'bg-emerald-500/30'
                    : 'bg-white/10'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isActive
                      ? 'text-cyan-400'
                      : isComplete
                      ? 'text-emerald-400'
                      : 'text-slate-500'
                  }`} />
                </div>

                {/* Label */}
                <div className="flex-1">
                  <div className={`text-sm font-mono ${
                    isActive ? 'text-cyan-400' : isComplete ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    {step.label}
                  </div>
                  {isActive && (
                    <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-cyan-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="text-right">
                  {isComplete && (
                    <span className="text-[10px] text-emerald-400 font-mono">✓ OK</span>
                  )}
                  {isActive && (
                    <span className="text-[10px] text-cyan-400 font-mono animate-pulse">
                      {progress}%
                    </span>
                  )}
                  {isPending && (
                    <span className="text-[10px] text-slate-600 font-mono">ČEKA</span>
                  )}
                </div>

                {/* Connecting line */}
                {index < FLOW_STEPS.length - 1 && (
                  <div className={`absolute left-7 top-full w-0.5 h-3 ${
                    isComplete ? 'bg-emerald-500/50' : 'bg-white/10'
                  }`} />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            <span className="font-mono">ELEKTROKOMBINACIJA AI SISTEM</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Bus Detail Modal
function BusDetailModal({ bus, routes, onClose }) {
  const route = routes.find(r => r.id === bus.routeId);
  const [liveData, setLiveData] = useState({
    speed: Math.floor(Math.random() * 30) + 20,
    temp: Math.floor(Math.random() * 15) + 25,
    passengers: Math.floor(Math.random() * 40) + 10,
    nextStop: 'Centar',
    eta: Math.floor(Math.random() * 5) + 2,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        speed: Math.max(0, prev.speed + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5)),
        temp: prev.temp + (Math.random() > 0.5 ? 0.1 : -0.1),
        passengers: Math.max(0, prev.passengers + (Math.random() > 0.7 ? Math.floor(Math.random() * 3) - 1 : 0)),
        nextStop: prev.nextStop,
        eta: Math.max(1, prev.eta - (Math.random() > 0.8 ? 1 : 0)),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const stateConfig = {
    [BUS_STATES.DRIVING]: { label: 'VOŽNJA', color: 'cyan', icon: Navigation },
    [BUS_STATES.CHARGING]: { label: 'PUNJENJE', color: 'emerald', icon: BatteryCharging },
    [BUS_STATES.WAITING]: { label: 'ČEKANJE', color: 'amber', icon: Clock },
    [BUS_STATES.SWAPPING]: { label: 'SWAP MODULA', color: 'purple', icon: RefreshCw },
  };
  const state = stateConfig[bus.state] || stateConfig[BUS_STATES.DRIVING];
  const StateIcon = state.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-[9998]"
      style={{ pointerEvents: 'auto' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-black/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl shadow-cyan-500/20"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Bus className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{bus.name}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Route className="w-3 h-3" />
                <span>{route?.name || 'Nepoznata ruta'}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Status banner */}
        <div className={`p-3 rounded-xl mb-4 bg-${state.color}-500/20 border border-${state.color}-500/30`}>
          <div className="flex items-center gap-3">
            <StateIcon className={`w-5 h-5 text-${state.color}-400`} />
            <div>
              <div className={`text-sm font-bold text-${state.color}-400`}>{state.label}</div>
              {bus.state === BUS_STATES.CHARGING && (
                <div className="text-xs text-slate-400">Robot A aktivan • Dijagnostika u toku</div>
              )}
              {bus.state === BUS_STATES.SWAPPING && (
                <div className="text-xs text-slate-400">Zamena baterijskog modula • ETA 3 min</div>
              )}
            </div>
          </div>
        </div>

        {/* Battery */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Baterija</span>
            <span className={`text-lg font-bold ${
              bus.batteryLevel > 60 ? 'text-emerald-400' : bus.batteryLevel > 30 ? 'text-amber-400' : 'text-red-400'
            }`}>{Math.round(bus.batteryLevel)}%</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                bus.batteryLevel > 60 ? 'bg-emerald-500' : bus.batteryLevel > 30 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${bus.batteryLevel}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Live stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-slate-500">BRZINA</span>
            </div>
            <div className="text-xl font-mono font-bold text-white">{liveData.speed} <span className="text-sm text-slate-500">km/h</span></div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <ThermometerSun className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-500">TEMP</span>
            </div>
            <div className="text-xl font-mono font-bold text-white">{liveData.temp.toFixed(1)} <span className="text-sm text-slate-500">°C</span></div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-500">PUTNICI</span>
            </div>
            <div className="text-xl font-mono font-bold text-white">{liveData.passengers}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-500">SLEDEĆA</span>
            </div>
            <div className="text-sm font-bold text-white truncate">{liveData.nextStop}</div>
            <div className="text-xs text-slate-500">{liveData.eta} min</div>
          </div>
        </div>

        {/* Robot A status */}
        <div className="bg-cyan-500/10 rounded-xl p-3 border border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/30 flex items-center justify-center">
              <span className="text-sm font-bold text-cyan-400">A</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">Robot A (Vehicle-mounted)</div>
              <div className="text-xs text-slate-400">
                {bus.state === BUS_STATES.CHARGING ? 'Aktivan - dijagnostika baterije' : 'Standby režim'}
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${bus.state === BUS_STATES.CHARGING ? 'bg-cyan-500 animate-pulse' : 'bg-slate-600'}`} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span>CONNECTED</span>
          </div>
          <span className="font-mono">ID: {bus.id}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Available actions for EK3 modules
const EK3_ACTIONS = [
  { id: 'charge', label: 'Punjenje', icon: BatteryCharging, color: 'emerald', description: 'Pokreni punjenje modula' },
  { id: 'discharge', label: 'Pražnjenje', icon: Battery, color: 'amber', description: 'Kontrolisano pražnjenje' },
  { id: 'balance', label: 'Balansiranje', icon: Activity, color: 'cyan', description: 'Balansiranje ćelija' },
  { id: 'diagnostic', label: 'Dijagnostika', icon: Cpu, color: 'purple', description: 'Puna dijagnostika modula' },
  { id: 'swap_prep', label: 'Priprema za Swap', icon: RefreshCw, color: 'cyan', description: 'Pripremi modul za zamenu' },
  { id: 'maintenance', label: 'Održavanje', icon: Wrench, color: 'amber', description: 'Zakaži redovno održavanje' },
  { id: 'cooldown', label: 'Hlađenje', icon: ThermometerSun, color: 'blue', description: 'Aktivno hlađenje modula' },
  { id: 'reserve', label: 'Rezervacija', icon: Clock, color: 'purple', description: 'Rezerviši za specifičan autobus' },
];

// EK3 Module Detail Modal
function EK3ModuleDetailModal({ module, station, onClose, onScheduleAction }) {
  const [scheduledActions, setScheduledActions] = useState(() => {
    // Generate some random scheduled actions
    const actions = [];
    if (Math.random() > 0.5) {
      actions.push({
        id: 1,
        action: EK3_ACTIONS[Math.floor(Math.random() * EK3_ACTIONS.length)],
        scheduledTime: new Date(Date.now() + Math.floor(Math.random() * 3600000)),
        status: 'pending',
      });
    }
    if (Math.random() > 0.7) {
      actions.push({
        id: 2,
        action: EK3_ACTIONS[Math.floor(Math.random() * EK3_ACTIONS.length)],
        scheduledTime: new Date(Date.now() + Math.floor(Math.random() * 7200000) + 3600000),
        status: 'pending',
      });
    }
    return actions;
  });

  const [history] = useState(() => [
    { action: 'Punjenje', time: new Date(Date.now() - 3600000), result: 'success' },
    { action: 'Dijagnostika', time: new Date(Date.now() - 7200000), result: 'success' },
    { action: 'Balansiranje', time: new Date(Date.now() - 14400000), result: 'success' },
    { action: 'Održavanje', time: new Date(Date.now() - 86400000), result: 'warning' },
  ]);

  const colors = {
    healthy: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#34d399', bar: '#10b981' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#fbbf24', bar: '#f59e0b' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#f87171', bar: '#ef4444' },
  };
  const c = colors[module.health];

  const handleSchedule = (action) => {
    const newAction = {
      id: Date.now(),
      action,
      scheduledTime: new Date(Date.now() + 300000), // 5 min from now
      status: 'pending',
    };
    setScheduledActions(prev => [...prev, newAction]);
  };

  const handleCancelAction = (actionId) => {
    setScheduledActions(prev => prev.filter(a => a.id !== actionId));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-xl"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center border-2"
              style={{ backgroundColor: c.bg, borderColor: c.border }}
            >
              <span className="text-2xl font-bold" style={{ color: c.text }}>M{module.id}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Modul M{module.id}</h2>
              <p className="text-slate-400">{station.name} • EK3 Baterijski Modul</p>
            </div>
            <div
              className="ml-4 px-4 py-2 rounded-full text-sm font-bold"
              style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}
            >
              {module.health === 'healthy' ? 'ZDRAV' : module.health === 'warning' ? 'UPOZORENJE' : 'GREŠKA'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
          {/* Left - Module Stats */}
          <div className="space-y-4 overflow-auto">
            <h3 className="text-lg font-bold text-white mb-4">STANJE MODULA</h3>

            {/* SOC */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400">State of Charge</span>
                <span className="text-2xl font-mono font-bold" style={{ color: c.text }}>{module.charge}%</span>
              </div>
              <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${module.charge}%`, backgroundColor: c.bar }} />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-slate-500 mb-1">TEMPERATURA</div>
                <div className="text-xl font-mono font-bold text-white">{module.temp.toFixed(1)}°C</div>
                <div className={`text-xs mt-1 ${module.temp > 40 ? 'text-red-400' : module.temp > 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {module.temp > 40 ? '⚠ Visoka' : module.temp > 35 ? '! Povišena' : '✓ Normalna'}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-slate-500 mb-1">NAPON</div>
                <div className="text-xl font-mono font-bold text-white">{module.voltage.toFixed(2)}V</div>
                <div className="text-xs mt-1 text-emerald-400">✓ U opsegu</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-slate-500 mb-1">STRUJA</div>
                <div className="text-xl font-mono font-bold text-cyan-400">{module.current}A</div>
                <div className="text-xs mt-1 text-slate-500">{module.isActive ? 'Aktivan' : 'Idle'}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-slate-500 mb-1">CIKLUSI</div>
                <div className="text-xl font-mono font-bold text-purple-400">{module.cycles}</div>
                <div className="text-xs mt-1 text-slate-500">od 2000 max</div>
              </div>
            </div>

            {/* Health Details */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-slate-500 mb-3">ZDRAVLJE ĆELIJA</div>
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: 16 }).map((_, i) => {
                  const cellHealth = Math.random() > 0.1 ? 'healthy' : Math.random() > 0.5 ? 'warning' : 'error';
                  const cellColor = cellHealth === 'healthy' ? '#10b981' : cellHealth === 'warning' ? '#f59e0b' : '#ef4444';
                  return (
                    <div
                      key={i}
                      className="aspect-square rounded"
                      style={{ backgroundColor: cellColor }}
                      title={`Ćelija ${i + 1}: ${cellHealth}`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                <span>16 ćelija</span>
                <span>98.2% zdravlje</span>
              </div>
            </div>
          </div>

          {/* Center - Scheduled Actions */}
          <div className="space-y-4 overflow-auto">
            <h3 className="text-lg font-bold text-white mb-4">ZAKAZANE AKCIJE</h3>

            {scheduledActions.length > 0 ? (
              <div className="space-y-3">
                {scheduledActions.map((scheduled) => {
                  const ActionIcon = scheduled.action.icon;
                  return (
                    <div
                      key={scheduled.id}
                      className="bg-white/5 rounded-xl p-4 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <ActionIcon className={`w-5 h-5 text-${scheduled.action.color}-400`} />
                          <span className="font-bold text-white">{scheduled.action.label}</span>
                        </div>
                        <button
                          onClick={() => handleCancelAction(scheduled.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Otkaži
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>{scheduled.scheduledTime.toLocaleTimeString('sr-RS')}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-xs text-amber-400">Čeka izvršenje</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white/5 rounded-xl p-8 border border-white/10 text-center">
                <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">Nema zakazanih akcija</p>
              </div>
            )}

            {/* History */}
            <h3 className="text-lg font-bold text-white mt-6 mb-4">ISTORIJA</h3>
            <div className="space-y-2">
              {history.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.result === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="text-white">{item.action}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {item.time.toLocaleDateString('sr-RS')} {item.time.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Available Actions */}
          <div className="space-y-4 overflow-auto">
            <h3 className="text-lg font-bold text-white mb-4">DOSTUPNE AKCIJE</h3>

            <div className="grid grid-cols-1 gap-3">
              {EK3_ACTIONS.map((action) => {
                const ActionIcon = action.icon;
                const colorClasses = {
                  emerald: 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20',
                  amber: 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20',
                  cyan: 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20',
                  purple: 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20',
                  blue: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20',
                };
                const textColors = {
                  emerald: 'text-emerald-400',
                  amber: 'text-amber-400',
                  cyan: 'text-cyan-400',
                  purple: 'text-purple-400',
                  blue: 'text-blue-400',
                };
                return (
                  <button
                    key={action.id}
                    onClick={() => handleSchedule(action)}
                    className={`p-4 rounded-xl border transition-all text-left ${colorClasses[action.color]}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <ActionIcon className={`w-5 h-5 ${textColors[action.color]}`} />
                      <span className="font-bold text-white">{action.label}</span>
                    </div>
                    <p className="text-sm text-slate-400">{action.description}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <span>Klikni za zakazivanje →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span>CONNECTED</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono">Latency: 8ms</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">Modul ID: {module.id}</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              Zatvori
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// EK3 Modules Full Screen Modal - shows reserve batteries for swap
function EK3ModulesModal({ station, onClose }) {
  const [selectedModule, setSelectedModule] = useState(null);
  const batteryCount = station.batteryStorage || 0;
  const [modules, setModules] = useState(() =>
    Array.from({ length: batteryCount }).map((_, i) => ({
      id: i + 1,
      health: Math.random() > 0.15 ? 'healthy' : Math.random() > 0.5 ? 'warning' : 'error',
      charge: Math.floor(Math.random() * 30) + 70,
      temp: Math.floor(Math.random() * 15) + 25,
      voltage: 48 + Math.random() * 4 - 2,
      current: Math.floor(Math.random() * 50) + 10,
      cycles: Math.floor(Math.random() * 800) + 100,
      isCharging: i < Math.min(station.busesCharging.length, batteryCount), // charging in slots
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setModules(prev => prev.map(m => ({
        ...m,
        charge: Math.max(20, Math.min(100, m.charge + (Math.random() > 0.5 ? 1 : -1))),
        temp: Math.max(20, Math.min(50, m.temp + (Math.random() > 0.5 ? 0.5 : -0.5))),
        voltage: 48 + Math.random() * 4 - 2,
        current: m.isCharging ? Math.floor(Math.random() * 50) + 30 : Math.floor(Math.random() * 10),
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const colors = {
    healthy: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#34d399', bar: '#10b981' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#fbbf24', bar: '#f59e0b' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#f87171', bar: '#ef4444' },
  };

  const healthyCount = modules.filter(m => m.health === 'healthy').length;
  const warningCount = modules.filter(m => m.health === 'warning').length;
  const errorCount = modules.filter(m => m.health === 'error').length;

  // If a module is selected, show the detail modal
  if (selectedModule) {
    return (
      <EK3ModuleDetailModal
        module={selectedModule}
        station={station}
        onClose={() => setSelectedModule(null)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Battery className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">EK3 MODULI</h2>
              <p className="text-slate-400">{station.name} • {batteryCount} rezervnih baterija za swap • Klikni za detalje</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Legend */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-400">Zdrav ({healthyCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-400">Upozorenje ({warningCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-400">Greška ({errorCount})</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {modules.map((m) => {
              const c = colors[m.health];
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: m.id * 0.02 }}
                  onClick={() => setSelectedModule(m)}
                  className="relative rounded-2xl border p-4 cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: c.bg, borderColor: c.border }}
                >
                  {/* Module ID & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold" style={{ color: c.text }}>M{m.id}</span>
                    <div className="flex items-center gap-2">
                      {m.isActive && <Zap className="w-4 h-4" style={{ color: c.text }} />}
                      <div
                        className={`w-3 h-3 rounded-full ${m.health === 'healthy' && m.isActive ? 'animate-pulse' : ''}`}
                        style={{ backgroundColor: c.bar }}
                      />
                    </div>
                  </div>

                  {/* Charge bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">SOC</span>
                      <span style={{ color: c.text }}>{m.charge}%</span>
                    </div>
                    <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: c.bar }}
                        animate={{ width: `${m.charge}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-black/30 rounded-lg p-2">
                      <div className="text-slate-500">TEMP</div>
                      <div className="font-mono font-bold text-white">{m.temp.toFixed(1)}°C</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2">
                      <div className="text-slate-500">NAPON</div>
                      <div className="font-mono font-bold text-white">{m.voltage.toFixed(1)}V</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2">
                      <div className="text-slate-500">STRUJA</div>
                      <div className="font-mono font-bold text-white">{m.current}A</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-2">
                      <div className="text-slate-500">CIKLUSI</div>
                      <div className="font-mono font-bold text-white">{m.cycles}</div>
                    </div>
                  </div>

                  {/* Warning/Error indicator */}
                  {m.health !== 'healthy' && (
                    <div className="absolute -top-2 -right-2">
                      <AlertTriangle className="w-5 h-5" style={{ color: c.bar }} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="grid grid-cols-5 gap-4 text-center">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-slate-500 mb-1">UKUPNA SNAGA</div>
              <div className="text-2xl font-mono font-bold text-white">{station.maxPower} <span className="text-sm text-slate-500">kW</span></div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-slate-500 mb-1">NA PUNJENJU</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">{modules.filter(m => m.isCharging).length}/{batteryCount}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-slate-500 mb-1">PROSEK SOC</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">{Math.round(modules.reduce((a, m) => a + m.charge, 0) / modules.length)}%</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-slate-500 mb-1">PROSEK TEMP</div>
              <div className="text-2xl font-mono font-bold text-amber-400">{(modules.reduce((a, m) => a + m.temp, 0) / modules.length).toFixed(1)}°C</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-slate-500 mb-1">ZDRAVLJE</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">{Math.round((healthyCount / modules.length) * 100)}%</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Available actions for chargers
const CHARGER_ACTIONS = [
  { id: 'start_charge', label: 'Pokreni punjenje', icon: BatteryCharging, color: 'emerald', description: 'Ručno pokreni sesiju punjenja' },
  { id: 'stop_charge', label: 'Zaustavi punjenje', icon: Power, color: 'red', description: 'Prekini aktivnu sesiju' },
  { id: 'set_power', label: 'Podesi snagu', icon: Zap, color: 'amber', description: 'Promeni izlaznu snagu punjača' },
  { id: 'diagnostic', label: 'Dijagnostika', icon: Cpu, color: 'purple', description: 'Pokreni dijagnostiku punjača' },
  { id: 'maintenance', label: 'Održavanje', icon: Wrench, color: 'amber', description: 'Zakaži servis punjača' },
  { id: 'reserve', label: 'Rezervacija', icon: Clock, color: 'cyan', description: 'Rezerviši za specifičan autobus' },
  { id: 'priority', label: 'Prioritet', icon: AlertTriangle, color: 'red', description: 'Postavi kao prioritetni punjač' },
  { id: 'cooldown', label: 'Hlađenje', icon: ThermometerSun, color: 'blue', description: 'Aktiviraj sistem hlađenja' },
];

// Charger Detail Modal
function ChargerDetailModal({ charger, station, onClose }) {
  const [scheduledActions, setScheduledActions] = useState(() => {
    const actions = [];
    if (Math.random() > 0.5) {
      actions.push({
        id: 1,
        action: CHARGER_ACTIONS[Math.floor(Math.random() * CHARGER_ACTIONS.length)],
        scheduledTime: new Date(Date.now() + Math.floor(Math.random() * 3600000)),
        status: 'pending',
      });
    }
    return actions;
  });

  const [history] = useState(() => [
    { action: 'Punjenje završeno', time: new Date(Date.now() - 1800000), result: 'success', bus: 'Bus 3' },
    { action: 'Punjenje pokrenuto', time: new Date(Date.now() - 3600000), result: 'success', bus: 'Bus 7' },
    { action: 'Dijagnostika', time: new Date(Date.now() - 7200000), result: 'success' },
    { action: 'Održavanje', time: new Date(Date.now() - 86400000), result: 'warning' },
  ]);

  const statusColors = {
    active: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#34d399' },
    idle: { bg: 'rgba(100, 116, 139, 0.15)', border: 'rgba(100, 116, 139, 0.4)', text: '#94a3b8' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#f87171' },
    maintenance: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#fbbf24' },
  };
  const c = statusColors[charger.status];

  const actionColors = {
    emerald: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', text: '#34d399' },
    amber: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', text: '#fbbf24' },
    cyan: { bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.3)', text: '#22d3ee' },
    purple: { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)', text: '#c084fc' },
    red: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', text: '#f87171' },
    blue: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', text: '#60a5fa' },
  };

  const handleSchedule = (action) => {
    const newAction = {
      id: Date.now(),
      action,
      scheduledTime: new Date(Date.now() + 300000),
      status: 'pending',
    };
    setScheduledActions(prev => [...prev, newAction]);
  };

  const handleCancelAction = (actionId) => {
    setScheduledActions(prev => prev.filter(a => a.id !== actionId));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-xl"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center border-2"
              style={{ backgroundColor: c.bg, borderColor: c.border }}
            >
              <Zap className="w-8 h-8" style={{ color: c.text }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Punjač #{charger.id}</h2>
              <p className="text-slate-400">{station.name} • EK3 Punjač {charger.maxPower}kW</p>
            </div>
            <div
              className="ml-4 px-4 py-2 rounded-full text-sm font-bold uppercase"
              style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}
            >
              {charger.status === 'active' ? 'AKTIVAN' : charger.status === 'idle' ? 'SLOBODAN' : charger.status === 'error' ? 'GREŠKA' : 'ODRŽAVANJE'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Main Content - 3 Columns */}
        <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
          {/* Left - Charger Stats */}
          <div className="space-y-4 overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">STATISTIKA PUNJAČA</h3>

            {/* Live stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-slate-500 mb-1">SNAGA</div>
                <div className="text-2xl font-mono font-bold text-cyan-400">{charger.currentPower}<span className="text-sm text-slate-500 ml-1">kW</span></div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-slate-500 mb-1">MAX SNAGA</div>
                <div className="text-2xl font-mono font-bold text-white">{charger.maxPower}<span className="text-sm text-slate-500 ml-1">kW</span></div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-slate-500 mb-1">NAPON</div>
                <div className="text-2xl font-mono font-bold text-amber-400">{charger.voltage}<span className="text-sm text-slate-500 ml-1">V</span></div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-slate-500 mb-1">STRUJA</div>
                <div className="text-2xl font-mono font-bold text-purple-400">{charger.current}<span className="text-sm text-slate-500 ml-1">A</span></div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-slate-500 mb-1">TEMP</div>
                <div className="text-2xl font-mono font-bold text-amber-400">{charger.temp}<span className="text-sm text-slate-500 ml-1">°C</span></div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-slate-500 mb-1">EFIKASNOST</div>
                <div className="text-2xl font-mono font-bold text-emerald-400">{charger.efficiency}<span className="text-sm text-slate-500 ml-1">%</span></div>
              </div>
            </div>

            {/* Currently charging */}
            {charger.busId && (
              <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <Bus className="w-5 h-5 text-cyan-400" />
                  <span className="font-bold text-white">Trenutno puni: {charger.busId}</span>
                </div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-cyan-500"
                    animate={{ width: `${charger.sessionProgress || 60}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>Progres: {charger.sessionProgress || 60}%</span>
                  <span>ETA: {charger.eta || 15} min</span>
                </div>
              </div>
            )}

            {/* Daily stats */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="text-sm text-slate-500 mb-3">DANAS</h4>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <div className="text-xl font-mono font-bold text-cyan-400">{charger.sessionsToday}</div>
                  <div className="text-xs text-slate-500">sesija</div>
                </div>
                <div>
                  <div className="text-xl font-mono font-bold text-emerald-400">{charger.energyToday}</div>
                  <div className="text-xs text-slate-500">kWh</div>
                </div>
              </div>
            </div>

            {/* History */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="text-sm text-slate-500 mb-3">ISTORIJA AKCIJA</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {history.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${h.result === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-slate-400">{h.action}</span>
                      {h.bus && <span className="text-cyan-400">({h.bus})</span>}
                    </div>
                    <span className="text-slate-600 font-mono">
                      {h.time.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center - Scheduled Actions */}
          <div className="space-y-4 overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">ZAKAZANE AKCIJE</h3>

            {scheduledActions.length > 0 ? (
              <div className="space-y-3">
                {scheduledActions.map((scheduled) => {
                  const ac = actionColors[scheduled.action.color];
                  const Icon = scheduled.action.icon;
                  return (
                    <div
                      key={scheduled.id}
                      className="rounded-xl p-4 border"
                      style={{ backgroundColor: ac.bg, borderColor: ac.border }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" style={{ color: ac.text }} />
                          <span className="font-bold" style={{ color: ac.text }}>{scheduled.action.label}</span>
                        </div>
                        <button
                          onClick={() => handleCancelAction(scheduled.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>Zakazano za: {scheduled.scheduledTime.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white/5 rounded-xl p-8 border border-white/10 text-center">
                <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">Nema zakazanih akcija</p>
                <p className="text-xs text-slate-600 mt-1">Izaberi akciju sa desne strane</p>
              </div>
            )}
          </div>

          {/* Right - Available Actions */}
          <div className="space-y-4 overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">DOSTUPNE AKCIJE</h3>

            <div className="grid grid-cols-2 gap-3">
              {CHARGER_ACTIONS.map((action) => {
                const ac = actionColors[action.color];
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleSchedule(action)}
                    className="rounded-xl p-4 border transition-all hover:scale-105 text-left"
                    style={{ backgroundColor: ac.bg, borderColor: ac.border }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5" style={{ color: ac.text }} />
                      <span className="font-bold text-sm" style={{ color: ac.text }}>{action.label}</span>
                    </div>
                    <p className="text-xs text-slate-400">{action.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span>ONLINE</span>
            </div>
            <span className="text-slate-600">•</span>
            <span className="font-mono">Uptime: 99.8%</span>
          </div>
          <span className="font-mono text-slate-500">Punjač #{charger.id} @ {station.id}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Chargers Modal - Full Screen
function ChargersModal({ station, buses, onClose }) {
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [chargers, setChargers] = useState(() =>
    Array.from({ length: station.chargingPoints }).map((_, i) => {
      const isActive = i < station.busesCharging.length;
      return {
        id: i + 1,
        status: isActive ? 'active' : Math.random() > 0.9 ? 'maintenance' : 'idle',
        maxPower: Math.floor(station.maxPower / station.chargingPoints),
        currentPower: isActive ? Math.floor(Math.random() * 40) + 20 : 0,
        voltage: 380 + Math.floor(Math.random() * 20) - 10,
        current: isActive ? Math.floor(Math.random() * 100) + 50 : 0,
        temp: Math.floor(Math.random() * 15) + 30,
        efficiency: Math.floor(Math.random() * 5) + 94,
        busId: isActive ? station.busesCharging[i] : null,
        sessionProgress: isActive ? Math.floor(Math.random() * 60) + 30 : 0,
        eta: isActive ? Math.floor(Math.random() * 25) + 5 : 0,
        sessionsToday: Math.floor(Math.random() * 15) + 5,
        energyToday: Math.floor(Math.random() * 300) + 100,
      };
    })
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setChargers(prev => prev.map(ch => ({
        ...ch,
        currentPower: ch.status === 'active' ? Math.max(10, Math.min(ch.maxPower, ch.currentPower + (Math.random() > 0.5 ? 2 : -2))) : 0,
        voltage: 380 + Math.floor(Math.random() * 20) - 10,
        current: ch.status === 'active' ? Math.floor(Math.random() * 100) + 50 : 0,
        temp: Math.max(25, Math.min(55, ch.temp + (Math.random() > 0.5 ? 0.5 : -0.5))),
        sessionProgress: ch.status === 'active' ? Math.min(100, ch.sessionProgress + 0.5) : 0,
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    active: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', text: '#34d399', label: 'AKTIVAN' },
    idle: { bg: 'rgba(100, 116, 139, 0.15)', border: 'rgba(100, 116, 139, 0.4)', text: '#94a3b8', label: 'SLOBODAN' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', text: '#f87171', label: 'GREŠKA' },
    maintenance: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#fbbf24', label: 'ODRŽAVANJE' },
  };

  const activeCount = chargers.filter(c => c.status === 'active').length;
  const idleCount = chargers.filter(c => c.status === 'idle').length;
  const maintenanceCount = chargers.filter(c => c.status === 'maintenance').length;
  const totalPower = chargers.reduce((sum, c) => sum + c.currentPower, 0);

  if (selectedCharger) {
    return (
      <ChargerDetailModal
        charger={selectedCharger}
        station={station}
        onClose={() => setSelectedCharger(null)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Zap className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">EK3 PUNJAČI</h2>
              <p className="text-slate-400">{station.name} • {station.chargingPoints} punjača • Klikni za detalje</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Legend */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-400">Aktivan ({activeCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-500" />
                <span className="text-slate-400">Slobodan ({idleCount})</span>
              </div>
              {maintenanceCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-slate-400">Održavanje ({maintenanceCount})</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Chargers Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-4 gap-4">
            {chargers.map((charger) => {
              const sc = statusColors[charger.status];
              return (
                <div
                  key={charger.id}
                  onClick={() => setSelectedCharger(charger)}
                  className="relative rounded-2xl border p-4 cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: sc.bg, borderColor: sc.border }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5" style={{ color: sc.text }} />
                      <span className="font-bold text-white">#{charger.id}</span>
                    </div>
                    <span className="text-xs font-mono px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: sc.text }}>
                      {sc.label}
                    </span>
                  </div>

                  {/* Power bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Snaga</span>
                      <span className="font-mono" style={{ color: sc.text }}>{charger.currentPower}/{charger.maxPower} kW</span>
                    </div>
                    <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{ width: `${(charger.currentPower / charger.maxPower) * 100}%`, backgroundColor: sc.text }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-black/20 rounded-lg p-2">
                      <div className="text-slate-500">Temp</div>
                      <div className="font-mono text-amber-400">{charger.temp.toFixed(1)}°C</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-2">
                      <div className="text-slate-500">Efik.</div>
                      <div className="font-mono text-emerald-400">{charger.efficiency}%</div>
                    </div>
                  </div>

                  {/* Bus indicator */}
                  {charger.busId && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2 text-xs">
                        <Bus className="w-3 h-3 text-cyan-400" />
                        <span className="text-cyan-400">{charger.busId}</span>
                        <span className="text-slate-500">• {charger.sessionProgress.toFixed(0)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="grid grid-cols-5 gap-4 text-center">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-slate-500 mb-1">UKUPNA SNAGA</div>
              <div className="text-2xl font-mono font-bold text-white">{station.maxPower} <span className="text-sm text-slate-500">kW</span></div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-slate-500 mb-1">TRENUTNO</div>
              <div className="text-2xl font-mono font-bold text-cyan-400">{totalPower} <span className="text-sm text-slate-500">kW</span></div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-slate-500 mb-1">ISKORIŠĆENOST</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">{Math.round((totalPower / station.maxPower) * 100)}%</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-slate-500 mb-1">AKTIVNIH</div>
              <div className="text-2xl font-mono font-bold text-emerald-400">{activeCount}/{station.chargingPoints}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xs text-slate-500 mb-1">PROSEK TEMP</div>
              <div className="text-2xl font-mono font-bold text-amber-400">{(chargers.reduce((a, c) => a + c.temp, 0) / chargers.length).toFixed(1)}°C</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Station Detail Modal - Full Screen
function StationDetailModal({ station, buses, onClose }) {
  const [showEK3Modal, setShowEK3Modal] = useState(false);
  const [showChargersModal, setShowChargersModal] = useState(false);
  const [liveData, setLiveData] = useState({
    gridLoad: Math.floor(Math.random() * 30) + 60,
    voltage: 380 + Math.floor(Math.random() * 20) - 10,
    activeSessions: station.busesCharging.length,
    queueLength: Math.floor(Math.random() * 3),
    energyToday: Math.floor(Math.random() * 500) + 200,
    co2Saved: Math.floor(Math.random() * 100) + 50,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        gridLoad: Math.max(40, Math.min(100, prev.gridLoad + (Math.random() > 0.5 ? 2 : -2))),
        voltage: 380 + Math.floor(Math.random() * 20) - 10,
        activeSessions: station.busesCharging.length,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [station.busesCharging.length]);

  const isActive = station.busesCharging.length > 0;

  if (showChargersModal) {
    return <ChargersModal station={station} buses={buses} onClose={() => setShowChargersModal(false)} />;
  }

  if (showEK3Modal) {
    return <EK3ModulesModal station={station} onClose={() => setShowEK3Modal(false)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9998] bg-black/95 backdrop-blur-xl"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Zap className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{station.name}</h2>
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>{station.type === 'terminal' ? 'Terminal' : 'Usputna stanica'}</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono">{station.id}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-3 gap-6">
          {/* Left Column - Status & Power */}
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`p-6 rounded-2xl ${isActive ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-500/20 border border-slate-500/30'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                <div>
                  <div className={`text-xl font-bold ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {isActive ? 'AKTIVNO PUNJENJE' : 'STANDBY'}
                  </div>
                  <div className="text-slate-400">
                    {isActive ? `${station.busesCharging.length} autobus na punjenju` : 'Čeka na dolazeće autobuse'}
                  </div>
                </div>
              </div>
            </div>

            {/* Power Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span className="text-sm text-slate-500">MAX SNAGA</span>
                </div>
                <div className="text-3xl font-mono font-bold text-white">{station.maxPower}<span className="text-lg text-slate-500 ml-1">kW</span></div>
              </div>
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm text-slate-500">TRENUTNO</span>
                </div>
                <div className="text-3xl font-mono font-bold text-cyan-400">{station.currentPower}<span className="text-lg text-slate-500 ml-1">kW</span></div>
              </div>
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-slate-500">OPTEREĆENJE</span>
                </div>
                <div className="text-3xl font-mono font-bold text-purple-400">{liveData.gridLoad}<span className="text-lg text-slate-500 ml-1">%</span></div>
              </div>
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Power className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-slate-500">NAPON</span>
                </div>
                <div className="text-3xl font-mono font-bold text-white">{liveData.voltage}<span className="text-lg text-slate-500 ml-1">V</span></div>
              </div>
            </div>

            {/* Daily Stats */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
              <h3 className="text-sm text-slate-500 mb-4">DANAS</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-mono font-bold text-cyan-400">{liveData.energyToday}</div>
                  <div className="text-sm text-slate-500">kWh isporučeno</div>
                </div>
                <div>
                  <div className="text-2xl font-mono font-bold text-emerald-400">{liveData.co2Saved}</div>
                  <div className="text-sm text-slate-500">kg CO₂ ušteda</div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column - Charging & Swap */}
          <div className="space-y-6">
            {/* Charging Points */}
            <button
              onClick={() => setShowChargersModal(true)}
              className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 rounded-2xl p-5 border border-cyan-500/30 transition-all group text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-cyan-400" />
                  <span className="text-lg font-bold text-white">PUNJAČI</span>
                </div>
                <div className="text-cyan-400 group-hover:translate-x-1 transition-transform">→</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-black/30 rounded-xl p-3">
                  <div className="text-2xl font-mono font-bold text-white">{station.chargingPoints}</div>
                  <div className="text-xs text-slate-500">Ukupno</div>
                </div>
                <div className="bg-black/30 rounded-xl p-3">
                  <div className="text-2xl font-mono font-bold text-emerald-400">{station.busesCharging.length}/{station.chargingPoints}</div>
                  <div className="text-xs text-slate-500">Zauzeto</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-400 text-center">
                Klikni za detaljan pregled punjača →
              </div>
            </button>

            {/* Battery Storage for Swap - only if station has it */}
            {station.batteryStorage > 0 ? (
              <button
                onClick={() => setShowEK3Modal(true)}
                className="w-full bg-purple-500/10 hover:bg-purple-500/20 rounded-2xl p-5 border border-purple-500/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Battery className="w-6 h-6 text-purple-400" />
                    <span className="text-lg font-bold text-white">BATERIJE ZA SWAP</span>
                  </div>
                  <div className="text-purple-400 group-hover:translate-x-1 transition-transform">→</div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-black/30 rounded-xl p-3">
                    <div className="text-2xl font-mono font-bold text-white">{station.batteryStorage}</div>
                    <div className="text-xs text-slate-500">Rezervnih</div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3">
                    <div className="text-2xl font-mono font-bold text-emerald-400">✓</div>
                    <div className="text-xs text-slate-500">Swap Aktivan</div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-slate-400 text-center">
                  Klikni za detaljan pregled baterija →
                </div>
              </button>
            ) : (
              <div className="bg-slate-500/10 rounded-2xl p-5 border border-slate-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <Battery className="w-6 h-6 text-slate-500" />
                  <span className="text-lg font-bold text-slate-400">BATERIJE ZA SWAP</span>
                </div>
                <div className="text-slate-500 text-sm">
                  Ova stanica nema skladište baterija za swap. Koristi se samo za punjenje.
                </div>
              </div>
            )}

            {/* Queue */}
            {liveData.queueLength > 0 && (
              <div className="bg-amber-500/10 rounded-2xl p-5 border border-amber-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span className="text-lg font-bold text-amber-400">RED ZA PUNJENJE</span>
                </div>
                <div className="text-3xl font-mono font-bold text-white mb-2">{liveData.queueLength}</div>
                <div className="text-slate-400">autobusa čeka</div>
              </div>
            )}

            {/* Robots Status */}
            <div className="grid grid-cols-2 gap-4">
              {station.hasRobotB && (
                <div className="bg-purple-500/10 rounded-2xl p-5 border border-purple-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-400">B</span>
                    </div>
                    <div>
                      <div className="font-bold text-white">Robot B</div>
                      <div className="text-xs text-slate-400">Station-based</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${station.robotBStatus === 'active' ? 'bg-purple-500 animate-pulse' : 'bg-slate-600'}`} />
                    <span className="text-sm text-slate-400">{station.robotBStatus === 'active' ? 'Aktivan' : 'Standby'}</span>
                  </div>
                </div>
              )}
              <div className={`rounded-2xl p-5 border ${station.batteryStorage > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-500/10 border-slate-500/30'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <RefreshCw className={`w-5 h-5 ${station.batteryStorage > 0 ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <div className={`font-bold ${station.batteryStorage > 0 ? 'text-white' : 'text-slate-400'}`}>Swap System</div>
                </div>
                <div className={`text-sm ${station.batteryStorage > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {station.batteryStorage > 0 ? `✓ Aktivan (${station.batteryStorage} baterija)` : '✗ Nije dostupan'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Live Activity */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-6">LIVE AKTIVNOST</h3>

            {station.busesCharging.length > 0 ? (
              <div className="space-y-4">
                {station.busesCharging.map((busId, index) => {
                  const bus = buses.find(b => b.id === busId);
                  const progress = Math.floor(Math.random() * 60) + 40;
                  return (
                    <div key={busId} className="bg-black/30 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Bus className="w-5 h-5 text-cyan-400" />
                          <span className="font-bold text-white">{bus?.name || busId}</span>
                        </div>
                        <span className="text-emerald-400 font-mono">{progress}%</span>
                      </div>
                      <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-emerald-500"
                          animate={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                        <span>Modul M{index + 1}</span>
                        <span>ETA: {Math.floor(Math.random() * 20) + 5} min</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <Zap className="w-12 h-12 mb-4 opacity-30" />
                <p>Nema aktivnih punjenja</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span>CONNECTED</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono">Latency: 12ms</span>
          </div>
          <span className="font-mono text-slate-500">{station.id}</span>
        </div>
      </div>
    </motion.div>
  );
}

// KorHUD - Main HUD
export default function KorHUD() {
  const { buses, routes, city, isRunning, setSpeed, selectedItem, clearSelection, chargingStations } = useSimulation();
  const [decisions, setDecisions] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [activeFlow, setActiveFlow] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [stats, setStats] = useState({ approved: 0, timeout: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());
  const modalOpenRef = useRef(false);

  // Track modal/flow state in ref
  useEffect(() => {
    modalOpenRef.current = activeModal !== null || activeFlow !== null || selectedItem !== null;
  }, [activeModal, activeFlow, selectedItem]);

  // Update clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate scenarios every 12 seconds
  useEffect(() => {
    if (!isRunning) return;

    const triggerScenario = () => {
      if (modalOpenRef.current) return;
      if (buses.length === 0) return;
      const scenario = generateRandomScenario(buses, routes);
      if (scenario) {
        setSpeed(1);
        setActiveModal(scenario);
      }
    };

    // First scenario after 3 seconds
    const initialTimeout = setTimeout(triggerScenario, 3000);

    // Then every 12 seconds
    const interval = setInterval(triggerScenario, 12000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isRunning, buses, routes, setSpeed]);

  const handleAction = useCallback((decision, actionId) => {
    const option = decision.options?.find(o => o.id === actionId);
    setActiveModal(null);
    // Show the flow visualization
    setActiveFlow(option);
  }, []);

  const handleFlowComplete = useCallback(() => {
    if (activeFlow) {
      setActivityLog(prev => [{
        timestamp: Date.now(),
        action: `${activeFlow.label}`,
        type: 'approved'
      }, ...prev].slice(0, 6));
      setStats(s => ({ ...s, approved: s.approved + 1 }));
    }
    setActiveFlow(null);
  }, [activeFlow]);

  const handleTimeout = useCallback((decision) => {
    const recommended = decision.options?.find(o => o.recommended);
    setActiveModal(null);
    // Show flow for auto-selected option
    setActiveFlow({ ...recommended, label: `AUTO: ${recommended?.label || 'Timeout'}`, isAuto: true });
  }, []);

  const handleExpand = useCallback((decision) => {
    setDecisions(prev => prev.filter(d => d.id !== decision.id));
    setActiveModal(decision);
  }, []);

  const activeBuses = buses.filter(b => b.state === BUS_STATES.DRIVING).length;
  const chargingBuses = buses.filter(b => b.state === BUS_STATES.CHARGING).length;
  const avgBattery = buses.length > 0 ? Math.round(buses.reduce((sum, b) => sum + b.batteryLevel, 0) / buses.length) : 0;
  const criticalBuses = buses.filter(b => b.batteryLevel < 20).length;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Corner brackets */}
      <svg className="absolute top-0 left-0 w-16 h-16" viewBox="0 0 64 64">
        <path d="M0 20 L0 0 L20 0" fill="none" stroke="rgba(0,212,255,0.5)" strokeWidth="2" />
      </svg>
      <svg className="absolute top-0 right-0 w-16 h-16" viewBox="0 0 64 64">
        <path d="M64 20 L64 0 L44 0" fill="none" stroke="rgba(0,212,255,0.5)" strokeWidth="2" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-16 h-16" viewBox="0 0 64 64">
        <path d="M0 44 L0 64 L20 64" fill="none" stroke="rgba(0,212,255,0.5)" strokeWidth="2" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-16 h-16" viewBox="0 0 64 64">
        <path d="M64 44 L64 64 L44 64" fill="none" stroke="rgba(0,212,255,0.5)" strokeWidth="2" />
      </svg>

      {/* Top status bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <div className="bg-black/70 backdrop-blur-md border border-cyan-500/30 rounded-lg px-5 py-2">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-[10px] font-mono text-slate-400">{isRunning ? 'AKTIVAN' : 'PAUZA'}</span>
            </div>
            <div className="w-px h-4 bg-slate-700" />
            <span className="font-mono text-cyan-400 font-bold">{city?.name?.toUpperCase() || 'NOVI SAD'}</span>
            <div className="w-px h-4 bg-slate-700" />
            <span className="font-mono text-white/70">{currentTime.toLocaleTimeString('sr-RS')}</span>
            {criticalBuses > 0 && (
              <>
                <div className="w-px h-4 bg-slate-700" />
                <span className="text-red-400 animate-pulse flex items-center gap-1 font-mono">
                  <AlertTriangle className="w-3 h-3" />{criticalBuses} KRIT
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Left stats */}
      <StatPanel label="Aktivno" value={activeBuses} unit={`/${buses.length}`} icon={Activity} color="text-cyan-400" position="top-20 left-4" />
      <StatPanel label="Punjenje" value={chargingBuses} unit="bus" icon={Zap} color="text-emerald-400" position="top-36 left-4" />
      <StatPanel label="Baterija" value={avgBattery} unit="%" icon={Battery} color={avgBattery > 50 ? "text-emerald-400" : "text-amber-400"} position="top-52 left-4" />

      {/* Right panel - decisions queue */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-20 right-4 w-64 pointer-events-auto"
      >
        <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono text-white/80">AI KONTROLA</span>
            </div>
            <div className="text-[10px] font-mono">
              <span className="text-emerald-400">{stats.approved}</span>
              <span className="text-slate-600"> / </span>
              <span className="text-amber-400">{stats.timeout}</span>
            </div>
          </div>

          <div className="p-2 max-h-64 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {decisions.map(decision => (
                <MiniDecisionCard key={decision.id} decision={decision} onExpand={handleExpand} />
              ))}
            </AnimatePresence>

            {decisions.length === 0 && !activeModal && (
              <div className="text-center py-6 text-slate-500">
                <Eye className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">Čekam scenarij...</p>
              </div>
            )}
          </div>

          {activityLog.length > 0 && (
            <div className="px-3 py-2 border-t border-white/10 bg-black/30">
              <div className="text-[9px] text-slate-600 mb-1">LOG</div>
              {activityLog.slice(0, 3).map((e, i) => (
                <div key={i} className="text-[10px] font-mono text-slate-500 truncate">
                  <span className={e.type === 'approved' ? 'text-emerald-400' : 'text-amber-400'}>●</span> {e.action}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Bottom robot info */}
      <div className="absolute bottom-20 left-4">
        <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg p-2.5">
          <div className="text-[9px] font-mono text-slate-500 mb-2">ROBOTI</div>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-[9px] font-bold text-cyan-400">A</div>
              <span className="text-[9px] text-slate-400">Bus</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-[9px] font-bold text-purple-400">B</div>
              <span className="text-[9px] text-slate-400">Stanica</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full screen modal */}
      <AnimatePresence>
        {activeModal && (
          <DecisionModal
            decision={activeModal}
            onAction={handleAction}
            onTimeout={handleTimeout}
          />
        )}
      </AnimatePresence>

      {/* Action flow visualization */}
      <AnimatePresence>
        {activeFlow && (
          <ActionFlow
            action={activeFlow}
            onComplete={handleFlowComplete}
          />
        )}
      </AnimatePresence>

      {/* Bus detail modal */}
      <AnimatePresence>
        {selectedItem?.type === 'bus' && (
          <BusDetailModal
            bus={buses.find(b => b.id === selectedItem.id)}
            routes={routes}
            onClose={clearSelection}
          />
        )}
      </AnimatePresence>

      {/* Station detail modal */}
      <AnimatePresence>
        {selectedItem?.type === 'station' && (
          <StationDetailModal
            station={chargingStations.find(s => s.id === selectedItem.id)}
            buses={buses}
            onClose={clearSelection}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
