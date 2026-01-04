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
  Search,
  ChevronRight,
  Plug,
  BarChart3,
  History,
  Calendar,
  TrendingUp,
  ChevronDown,
  Sun,
  Fuel,
  Shield,
  LayoutGrid,
} from 'lucide-react';
import { useSimulation, BUS_STATES } from '../../context/SimulationContext';
import FocusedMiniMap from './FocusedMiniMap';
import { applyDecisionEffect, handleDecisionTimeout } from '../../utils/decisionEffects';

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
        busId: bus.id,
        busName: bus.name,
        message: `Gužva: ${street}`,
        detail: `Kašnjenje ~${Math.floor(Math.random() * 15) + 5} min`,
        suggestion: `${Math.floor(Math.random() * 4) + 2} autobusa pogođeno`,
        urgency: 'SREDNJE',
        timeToDecide: 45,
        analysis: {
          reason: 'Senzori detektovali usporenje >70%. Alternativna ruta ima 40% manje saobraćaja.',
          ifAccepted: 'Ušteda 8-12 min po autobusu. Održavanje reda vožnje.',
          ifRejected: 'Kašnjenje se akumulira. Moguće prekoračenje smene vozača.',
        },
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
        busId: bus.id,
        busName: bus.name,
        message: `Optimizacija: ${route?.name || 'Linija ' + bus.routeId}`,
        detail: `Ušteda ${(Math.random() * 15 + 5).toFixed(1)}% energije`,
        suggestion: 'AI predlog baziran na real-time podacima',
        timeToDecide: 60,
        analysis: {
          reason: 'ML model analizirao 24h podatke. Nova ruta kraća za 2.3km sa manjim usponima.',
          ifAccepted: 'Smanjenje potrošnje energije. Produženje dometa za 15km.',
          ifRejected: 'Nastavak trenutne rute. Bez optimizacije troškova.',
        },
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
        busId: bus.id,
        busName: bus.name,
        message: `Anomalija: Modul ${modules[Math.floor(Math.random() * modules.length)]}`,
        detail: 'Temperatura iznad normale',
        suggestion: 'Robot A preporučuje inspekciju',
        urgency: 'SREDNJE',
        timeToDecide: 60,
        analysis: {
          reason: 'Termalni senzor pokazuje +12°C iznad baseline. Pattern sličan pre-failure stanju.',
          ifAccepted: 'Preventivna zamena modula. Downtime 15min. Izbegnuta havarija.',
          ifRejected: 'Rizik od thermal runaway. Potencijalna šteta €5,000-15,000.',
        },
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
        { event: 'Loše vreme prijavljeno', impact: 'Smanjena vidljivost', reason: 'Meteo podaci + senzori na vozilima.', accept: 'Aktivira se protokol bezbednosti. Brzina smanjena 20%.', reject: 'Nastavak bez prilagođavanja. Povećan rizik.' },
        { event: 'Saobraćajna nesreća', impact: 'Put blokiran', reason: 'Policijski izveštaj + GPS zastoj detektovan.', accept: 'Automatsko preusmeravanje. ETA ažuriran.', reject: 'Čekanje u koloni. Nepoznato trajanje.' },
        { event: 'Nestanak struje', impact: 'Stanica offline', reason: 'Grid monitoring detektovao pad napona.', accept: 'Preusmeravanje na backup stanicu. V2G aktiviran.', reject: 'Autobusi bez punjenja. Rizik za red vožnje.' },
      ];
      const evt = events[Math.floor(Math.random() * events.length)];
      return {
        id: `force-${now}`,
        type: SCENARIO_TYPES.FORCE_MAJEURE,
        busId: bus.id,
        busName: bus.name,
        message: evt.event,
        detail: evt.impact,
        suggestion: 'Potrebna hitna reakcija',
        urgency: 'HITNO',
        timeToDecide: 25,
        compensation: `Kompenzacija: +${Math.floor(Math.random() * 15) + 5} min`,
        analysis: {
          reason: evt.reason,
          ifAccepted: evt.accept,
          ifRejected: evt.reject,
        },
        options: [
          { id: 'protocol', label: 'Aktiviraj protokol', description: 'Automatske mere', recommended: true },
          { id: 'manual', label: 'Ručna kontrola', description: 'Preuzmi kontrolu', danger: true },
        ],
        requiresApproval: true,
        showModal: true,
        timestamp: now,
      };

    case 4: // Low battery warning
      const batteryPct = Math.floor(Math.random() * 15) + 5;
      return {
        id: `battery-${now}`,
        type: SCENARIO_TYPES.CRITICAL_BATTERY,
        busId: bus.id,
        busName: bus.name,
        message: `Kritična baterija: ${batteryPct}%`,
        detail: `Preostalo ~${Math.floor(Math.random() * 20) + 5} min`,
        suggestion: 'Hitno punjenje potrebno',
        urgency: 'KRITIČNO',
        timeToDecide: 30,
        analysis: {
          reason: `BMS prijavio ${batteryPct}% kapaciteta. Bazni potrošnja 2.1kWh/km pri trenutnoj brzini.`,
          ifAccepted: 'Punjenje za 25min do 80%. Nastavak linije sa minimalnim kašnjenjem.',
          ifRejected: 'Rizik od zaustavljanja na ruti. Potrebna pomoć. Kašnjenje 45+ min.',
        },
        options: [
          { id: 'charge', label: 'Pošalji na punjenje', description: 'Najbliža stanica', recommended: true },
          { id: 'swap', label: 'Aktiviraj swap', description: 'Robot B intervencija' },
          { id: 'continue', label: 'Nastavi vožnju', description: 'Rizično!', danger: true },
        ],
        requiresApproval: true,
        showModal: true,
        timestamp: now,
      };

    case 5: // Charging queue
      const queueSize = Math.floor(Math.random() * 4) + 3;
      return {
        id: `queue-${now}`,
        type: SCENARIO_TYPES.CHARGING_QUEUE,
        busId: bus.id,
        busName: bus.name,
        message: `Red za punjenje: ${queueSize} autobusa`,
        detail: 'Optimizacija reda',
        suggestion: `Prioritet: ${bus.name}`,
        timeToDecide: 45,
        analysis: {
          reason: `${queueSize} autobusa čeka. AI analizirao SoC, raspored i hitnost svakog.`,
          ifAccepted: 'Ukupno čekanje flote smanjeno 35%. Kritični autobusi prvi.',
          ifRejected: 'FIFO red. Moguće da kritičan autobus čeka predugo.',
        },
        options: [
          { id: 'ai', label: 'AI optimizacija', description: 'Minimizuj čekanje', recommended: true },
          { id: 'fifo', label: 'FIFO redosled', description: 'Ko prvi dođe, prvi se puni' },
        ],
        requiresApproval: true,
        showModal: true,
        timestamp: now,
      };

    case 6: // Swap module
      const currentSoc = Math.floor(Math.random() * 30) + 50;
      return {
        id: `swap-${now}`,
        type: SCENARIO_TYPES.SWAP_MODULE,
        busId: bus.id,
        busName: bus.name,
        message: `Swap dostupan: ${bus.name}`,
        detail: `${currentSoc}% → 100% za 3 min`,
        suggestion: 'Robot B spreman',
        timeToDecide: 45,
        analysis: {
          reason: `Autobus na ${currentSoc}%. Swap stanica slobodna. Puna baterija čeka.`,
          ifAccepted: 'Zamena za 3 min. Autobus odmah spreman za punu smenu.',
          ifRejected: 'Standardno punjenje ~45min do 100%. Moguće kašnjenje rasporeda.',
        },
        options: [
          { id: 'swap', label: 'Izvrši swap', description: '3 min do 100%', recommended: true },
          { id: 'charge', label: 'Nastavi punjenje', description: 'Standardno punjenje' },
        ],
        requiresApproval: true,
        showModal: true,
        timestamp: now,
      };

    case 7: // Fleet warning
      const fleetPct = Math.floor(Math.random() * 20) + 15;
      const criticalCount = Math.floor(Math.random() * 5) + 3;
      return {
        id: `fleet-${now}`,
        type: SCENARIO_TYPES.FLEET_EMPTY,
        busId: bus.id,
        busName: bus.name,
        message: `Flota na ${fleetPct}%`,
        detail: `${criticalCount} autobusa kritično`,
        suggestion: 'Sistemska intervencija',
        urgency: 'KRITIČNO',
        timeToDecide: 30,
        analysis: {
          reason: `Prosečan SoC flote ${fleetPct}%. ${criticalCount} autobusa ispod 20%. Peak saobraćaj za 2h.`,
          ifAccepted: 'Sve stanice na max snagu. V2G deaktiviran. Prioritetno punjenje.',
          ifRejected: 'Rizik od masovnog zastoja flote. Mogući prekid linija.',
        },
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
function DecisionModal({ decision, onAction, onTimeout, onFlowComplete }) {
  const [timeLeft, setTimeLeft] = useState(decision.timeToDecide || 30);
  const [selectedOption, setSelectedOption] = useState(null);
  const [flowStep, setFlowStep] = useState(0);
  const [flowProgress, setFlowProgress] = useState(0);
  const config = SCENARIOS[decision.type];
  const Icon = config?.icon || AlertTriangle;

  // Use refs to avoid stale closure issues
  const flowStepRef = useRef(0);
  const selectedOptionRef = useRef(null);
  const onFlowCompleteRef = useRef(onFlowComplete);

  // Keep refs in sync
  useEffect(() => {
    flowStepRef.current = flowStep;
  }, [flowStep]);

  useEffect(() => {
    selectedOptionRef.current = selectedOption;
  }, [selectedOption]);

  useEffect(() => {
    onFlowCompleteRef.current = onFlowComplete;
  }, [onFlowComplete]);

  // Flow animation when option is selected - FIXED: no flowStep in dependencies
  useEffect(() => {
    if (!selectedOption) return;

    const stepDuration = 800;
    const totalSteps = FLOW_STEPS.length;

    const progressInterval = setInterval(() => {
      setFlowProgress(p => {
        const currentStep = flowStepRef.current;

        if (p >= 100) {
          if (currentStep < totalSteps - 1) {
            // Move to next step
            const nextStep = currentStep + 1;
            flowStepRef.current = nextStep;
            setFlowStep(nextStep);
            return 0;
          } else {
            // All steps complete
            clearInterval(progressInterval);
            setTimeout(() => {
              if (onFlowCompleteRef.current && selectedOptionRef.current) {
                onFlowCompleteRef.current(selectedOptionRef.current);
              }
            }, 500);
            return 100;
          }
        }
        return p + 5;
      });
    }, stepDuration / 20);

    return () => clearInterval(progressInterval);
  }, [selectedOption]); // Only depend on selectedOption

  useEffect(() => {
    if (selectedOption) return; // Stop timer when option is selected

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
  }, [decision, onTimeout, selectedOption]);

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
      className="absolute inset-y-0 right-0 left-[45%] flex items-center justify-center decision-modal-overlay px-4"
      style={{ pointerEvents: 'none', zIndex: 100 }}
    >
      {/* NO full backdrop - main map stays visible */}

      {/* Content container - fills available space on right */}
      <div className="relative flex items-stretch gap-4 h-[90vh] max-h-[800px] flex-1 max-w-[900px]" style={{ pointerEvents: 'auto' }}>
        {/* Left - Focused Mini Map - LARGE, fills space */}
        {!selectedOption && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ delay: 0.1 }}
            className="flex-1 min-w-[300px] h-full"
          >
            <FocusedMiniMap busId={decision.busId} scenarioType={decision.type} />
          </motion.div>
        )}

        {/* Right - Modal + Visualizations stacked */}
        <div className="flex flex-col gap-3 flex-1 max-w-xl">

        {/* Main modal */}
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className={`relative max-w-lg w-full bg-black/95 backdrop-blur-md rounded-2xl border-2 ${colors.border} shadow-2xl ${colors.glow}`}
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
            <div className={`w-12 h-12 rounded-xl ${selectedOption ? 'bg-cyan-500/20' : `${colors.bg}/20`} flex items-center justify-center ${selectedOption ? '' : config?.color === 'red' ? 'animate-pulse' : ''}`}>
              {selectedOption ? (
                <Cpu className="w-6 h-6 text-cyan-400 animate-pulse" />
              ) : (
                <Icon className={`w-6 h-6 ${colors.text}`} />
              )}
            </div>
            <div>
              <div className={`text-xs font-mono uppercase tracking-wider ${selectedOption ? 'text-cyan-400' : colors.text} mb-1`}>
                {selectedOption ? 'AI PROCESIRANJE' : (decision.urgency || 'ODLUKA POTREBNA')}
              </div>
              <h2 className="text-lg font-bold text-white">
                {selectedOption ? 'IZVRŠAVANJE AKCIJE' : (config?.modalTitle || 'HUMAN-IN-THE-LOOP')}
              </h2>
            </div>
          </div>

          {/* Timer or Processing indicator */}
          {!selectedOption ? (
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
          ) : (
            <div className="flex items-center gap-2 text-cyan-400">
              <div className="w-3 h-3 rounded-full bg-cyan-500 animate-ping" />
              <span className="text-sm font-mono">{flowStep + 1}/{FLOW_STEPS.length}</span>
            </div>
          )}
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

          {/* AI Reason - stays in modal */}
          {decision.analysis && (
            <div className="mt-3 mb-4 p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-cyan-500 uppercase mb-1">AI Analiza</div>
                  <div className="text-sm text-slate-300">{decision.analysis.reason}</div>
                </div>
              </div>
            </div>
          )}

          {/* Options OR Flow Visualization */}
          {!selectedOption ? (
            <div className="space-y-2 mt-5">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">IZABERITE AKCIJU:</div>
              {decision.options?.map((opt, i) => (
                <button
                  key={opt.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!selectedOption) setSelectedOption(opt);
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
          ) : (
            /* Flow Visualization - shown after option is selected */
            <div className="mt-5">
              <div className="text-center mb-4">
                <div className="text-[10px] font-mono text-cyan-500 mb-1">AI OPTIMIZACIJA U TOKU</div>
                <div className="text-lg font-bold text-white">{selectedOption.label}</div>
              </div>

              {/* Flow steps */}
              <div className="space-y-2">
                {FLOW_STEPS.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = index === flowStep;
                  const isComplete = index < flowStep;
                  const isPending = index > flowStep;

                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                        isActive
                          ? 'bg-cyan-500/20 border-cyan-500/50'
                          : isComplete
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-cyan-500/30' : isComplete ? 'bg-emerald-500/30' : 'bg-white/10'
                      }`}>
                        <StepIcon className={`w-4 h-4 ${
                          isActive ? 'text-cyan-400' : isComplete ? 'text-emerald-400' : 'text-slate-500'
                        }`} />
                      </div>

                      <div className="flex-1">
                        <div className={`text-sm font-mono ${
                          isActive ? 'text-cyan-400' : isComplete ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          {step.label}
                        </div>
                        {isActive && (
                          <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-cyan-500"
                              style={{ width: `${flowProgress}%` }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="text-right text-[10px] font-mono">
                        {isComplete && <span className="text-emerald-400">✓</span>}
                        {isActive && <span className="text-cyan-400 animate-pulse">{flowProgress}%</span>}
                        {isPending && <span className="text-slate-600">•••</span>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
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

          {/* Analysis panels below modal - only show when decision not made */}
          {decision.analysis && !selectedOption && (
            <div className="flex gap-3">
              {/* If Accepted */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 bg-emerald-500/10 backdrop-blur-md rounded-xl border border-emerald-500/30 p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Ako prihvatiš</span>
                </div>
                <p className="text-xs text-emerald-200/90 leading-relaxed">{decision.analysis.ifAccepted}</p>
              </motion.div>

              {/* If Rejected */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex-1 bg-red-500/10 backdrop-blur-md rounded-xl border border-red-500/30 p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-[10px] font-bold text-red-400 uppercase">Ako odbiješ</span>
                </div>
                <p className="text-xs text-red-200/90 leading-relaxed">{decision.analysis.ifRejected}</p>
              </motion.div>
            </div>
          )}

          {/* Processing status during flow */}
          {selectedOption && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-cyan-500/10 backdrop-blur-md rounded-xl border border-cyan-500/30 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-xs text-cyan-400 uppercase">Izabrana akcija</div>
                    <div className="text-sm font-bold text-white">{selectedOption.label}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500">PROGRES</div>
                  <div className="text-lg font-mono font-bold text-cyan-400">
                    {Math.round((flowStep / FLOW_STEPS.length) * 100 + (flowProgress / FLOW_STEPS.length))}%
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
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

// Bus List Panel with search
function BusListPanel({ buses, routes, selectedItem, onSelectBus, onOpenModal }) {
  const [search, setSearch] = useState('');
  const [showConfirm, setShowConfirm] = useState(null);

  const filteredBuses = buses.filter(bus =>
    bus.name.toLowerCase().includes(search.toLowerCase()) ||
    routes.find(r => r.id === bus.routeId)?.name.toLowerCase().includes(search.toLowerCase())
  );

  const getBatteryColor = (level) => {
    if (level > 60) return 'text-emerald-400';
    if (level > 30) return 'text-amber-400';
    return 'text-red-400';
  };

  const getStateInfo = (state) => {
    switch (state) {
      case BUS_STATES.DRIVING: return { label: 'Vozi', color: 'text-cyan-400', bg: 'bg-cyan-400' };
      case BUS_STATES.CHARGING: return { label: 'Puni', color: 'text-emerald-400', bg: 'bg-emerald-400' };
      case BUS_STATES.WAITING: return { label: 'Čeka', color: 'text-amber-400', bg: 'bg-amber-400' };
      case BUS_STATES.SWAPPING: return { label: 'Swap', color: 'text-purple-400', bg: 'bg-purple-400' };
      default: return { label: '?', color: 'text-slate-400', bg: 'bg-slate-400' };
    }
  };

  const handleBusClick = (bus) => {
    onSelectBus(bus.id);
    setShowConfirm(bus.id);
  };

  return (
    <div className="absolute top-[17rem] left-6 w-52 pointer-events-auto">
      <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-2.5 py-2 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Bus className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-mono text-white/80 uppercase">Buses</span>
            <span className="ml-auto text-[9px] font-mono text-slate-500">{buses.length}</span>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pretraži..."
              className="w-full bg-black/50 border border-white/10 rounded pl-6 pr-2 py-1 text-[10px] text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Bus list */}
        <div className="max-h-48 overflow-y-auto">
          {filteredBuses.length === 0 ? (
            <div className="text-center py-4 text-slate-500 text-[10px]">
              Nema rezultata
            </div>
          ) : (
            filteredBuses.map(bus => {
              const route = routes.find(r => r.id === bus.routeId);
              const stateInfo = getStateInfo(bus.state);
              const isSelected = selectedItem?.type === 'bus' && selectedItem?.id === bus.id;

              return (
                <div key={bus.id}>
                  <button
                    onClick={() => handleBusClick(bus)}
                    className={`w-full px-2.5 py-2 text-left hover:bg-white/5 border-b border-white/5 transition-colors ${
                      isSelected ? 'bg-amber-500/10 border-l-2 border-l-amber-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${stateInfo.bg}`} />
                      <span className="text-[11px] font-medium text-white">{bus.name}</span>
                      <span className={`ml-auto text-[10px] font-mono ${getBatteryColor(bus.batteryLevel)}`}>
                        {Math.round(bus.batteryLevel)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 ml-3.5">
                      <span className="text-[9px] text-slate-500 truncate">{route?.name || '-'}</span>
                      <span className={`text-[8px] ${stateInfo.color}`}>{stateInfo.label}</span>
                    </div>
                  </button>

                  {/* Confirm modal */}
                  <AnimatePresence>
                    {showConfirm === bus.id && isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-cyan-500/10 border-t border-cyan-500/20 px-2.5 py-2"
                      >
                        <div className="text-[9px] text-slate-400 mb-1.5">Selektovan na mapi</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal(bus.id);
                            setShowConfirm(null);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded py-1.5 text-[10px] text-cyan-400 transition-colors"
                        >
                          <span>Otvori detalje</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// Quick Bus Info Panel - shows when bus is selected
function BusQuickInfo({ bus, route, onClose, onOpenDetails }) {
  if (!bus) return null;

  const getBatteryColor = (level) => {
    if (level > 60) return 'text-emerald-400';
    if (level > 30) return 'text-amber-400';
    return 'text-red-400';
  };

  const getStateInfo = (state) => {
    switch (state) {
      case BUS_STATES.DRIVING: return { label: 'Vozi', color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
      case BUS_STATES.CHARGING: return { label: 'Puni se', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
      case BUS_STATES.WAITING: return { label: 'Čeka', color: 'text-amber-400', bg: 'bg-amber-500/20' };
      case BUS_STATES.SWAPPING: return { label: 'Swap', color: 'text-purple-400', bg: 'bg-purple-500/20' };
      default: return { label: '?', color: 'text-slate-400', bg: 'bg-slate-500/20' };
    }
  };

  const stateInfo = getStateInfo(bus.state);
  const estimatedRange = Math.round(bus.batteryLevel * 2.5); // ~250km at 100%

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      className="absolute top-1/2 left-[17rem] -translate-y-1/2 w-56 pointer-events-auto z-20"
    >
      <div className="bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-lg overflow-hidden shadow-lg shadow-cyan-500/10">
        {/* Header */}
        <div className="px-2.5 py-2 border-b border-cyan-500/20 bg-cyan-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold text-white">{bus.name}</span>
          </div>
          <button onClick={onClose} className="p-0.5 hover:bg-white/10 rounded">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-2.5 space-y-2">
          {/* Status badge */}
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${stateInfo.bg}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${stateInfo.color.replace('text-', 'bg-')}`} />
            <span className={`text-[10px] font-medium ${stateInfo.color}`}>{stateInfo.label}</span>
          </div>

          {/* Battery */}
          <div className="bg-white/5 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-500">Baterija</span>
              <span className={`text-lg font-mono font-bold ${getBatteryColor(bus.batteryLevel)}`}>
                {Math.round(bus.batteryLevel)}%
              </span>
            </div>
            <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${bus.batteryLevel}%` }}
                className={`h-full rounded-full ${bus.batteryLevel > 60 ? 'bg-emerald-500' : bus.batteryLevel > 30 ? 'bg-amber-500' : 'bg-red-500'}`}
              />
            </div>
            <div className="text-[9px] text-slate-500 mt-1">
              Domet: ~{estimatedRange} km
            </div>
          </div>

          {/* Route */}
          <div className="flex items-center gap-2 text-[10px]">
            <Route className="w-3 h-3 text-slate-500" />
            <span className="text-slate-400">{route?.name || 'Nepoznata linija'}</span>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white/5 rounded p-1.5 text-center">
              <div className="text-slate-500">Brzina</div>
              <div className="text-white font-mono">{bus.state === BUS_STATES.DRIVING ? Math.floor(Math.random() * 30 + 20) : 0} km/h</div>
            </div>
            <div className="bg-white/5 rounded p-1.5 text-center">
              <div className="text-slate-500">Temp</div>
              <div className="text-white font-mono">{Math.floor(Math.random() * 15 + 25)}°C</div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={onOpenDetails}
            className="w-full flex items-center justify-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded py-2 text-[11px] text-cyan-400 font-medium transition-colors"
          >
            <span>Više detalja</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
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

// AI Live Flow Panel - shows real-time process visualization with expansion on activity
function AILiveFlowPanel({ decisions, activeModal, activityLog, buses, chargingStations }) {
  const [activeNodes, setActiveNodes] = useState([]);
  const [flowLines, setFlowLines] = useState([]);
  const [currentProcess, setCurrentProcess] = useState(null);
  const [processSteps, setProcessSteps] = useState([]);

  const isExpanded = decisions.length > 0 || activeModal || processSteps.length > 0;

  // Simulate active processes based on system state
  useEffect(() => {
    const interval = setInterval(() => {
      const processes = [];
      const lines = [];
      const steps = [];

      // Check for charging buses
      const chargingBuses = buses.filter(b => b.state === 'charging');
      if (chargingBuses.length > 0) {
        processes.push({ id: 'charging', node: 'station' });
        lines.push({ from: 'bus', to: 'station', active: true });
        steps.push({ id: 'charge', label: 'Punjenje aktivno', status: 'active', icon: 'zap' });
      }

      // Check for pending decisions
      if (decisions.length > 0 || activeModal) {
        processes.push({ id: 'decision', node: 'ai' });
        lines.push({ from: 'sensor', to: 'ai', active: true });
        lines.push({ from: 'ai', to: 'decision', active: true });
        steps.push({ id: 'analyze', label: 'AI analiza', status: 'complete', icon: 'cpu' });
        steps.push({ id: 'decide', label: 'Čeka odluku', status: 'active', icon: 'alert' });
      }

      // Check for low battery buses
      const lowBattery = buses.filter(b => b.batteryLevel < 30);
      if (lowBattery.length > 0) {
        processes.push({ id: 'alert', node: 'monitor' });
        lines.push({ from: 'bus', to: 'monitor', active: true });
        if (!steps.find(s => s.id === 'monitor')) {
          steps.push({ id: 'monitor', label: `${lowBattery.length} bus < 30%`, status: 'warning', icon: 'battery' });
        }
      }

      // Check for swapping
      const swappingBuses = buses.filter(b => b.state === 'swapping');
      if (swappingBuses.length > 0) {
        processes.push({ id: 'swap', node: 'station' });
        steps.push({ id: 'swap', label: 'Swap u toku', status: 'active', icon: 'refresh' });
      }

      setActiveNodes(processes.map(p => p.node));
      setFlowLines(lines);
      setProcessSteps(steps);

      // Set current process description
      if (activeModal) {
        setCurrentProcess({ type: 'decision', label: 'HUMAN-IN-THE-LOOP', sublabel: 'Čeka odluku operatera' });
      } else if (decisions.length > 0) {
        setCurrentProcess({ type: 'analyzing', label: 'AI PROCESIRA', sublabel: 'Analizira situaciju' });
      } else if (swappingBuses.length > 0) {
        setCurrentProcess({ type: 'swap', label: 'SWAP AKTIVAN', sublabel: `${swappingBuses.length} bus` });
      } else if (chargingBuses.length > 0) {
        setCurrentProcess({ type: 'charging', label: 'CHARGING', sublabel: `${chargingBuses.length} bus active` });
      } else if (lowBattery.length > 0) {
        setCurrentProcess({ type: 'monitoring', label: 'MONITORING', sublabel: `${lowBattery.length} bus low battery` });
      } else {
        setCurrentProcess({ type: 'idle', label: 'STANDBY', sublabel: 'System stable' });
      }
    }, 500);

    return () => clearInterval(interval);
  }, [decisions, activeModal, buses]);

  const nodes = [
    { id: 'bus', label: 'FLOTA', x: 15, y: 25, color: 'cyan' },
    { id: 'sensor', label: 'SENZORI', x: 15, y: 75, color: 'purple' },
    { id: 'monitor', label: 'MONITOR', x: 90, y: 25, color: 'amber' },
    { id: 'ai', label: 'AI', x: 90, y: 75, color: 'cyan' },
    { id: 'station', label: 'STANICA', x: 165, y: 25, color: 'emerald' },
    { id: 'decision', label: 'ODLUKA', x: 165, y: 75, color: 'emerald' },
  ];

  const connections = [
    { from: 'bus', to: 'sensor' },
    { from: 'bus', to: 'monitor' },
    { from: 'sensor', to: 'ai' },
    { from: 'monitor', to: 'ai' },
    { from: 'ai', to: 'decision' },
    { from: 'ai', to: 'station' },
    { from: 'bus', to: 'station' },
  ];

  const getNodePos = (id) => nodes.find(n => n.id === id);

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400', dot: 'bg-emerald-500' };
      case 'active': return { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-400', dot: 'bg-cyan-500' };
      case 'warning': return { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', dot: 'bg-amber-500' };
      default: return { bg: 'bg-white/5', border: 'border-white/10', text: 'text-slate-500', dot: 'bg-slate-500' };
    }
  };

  return (
    <motion.div
      initial={{ width: 256 }}
      animate={{ width: isExpanded ? 320 : 256 }}
      className="absolute top-[22rem] right-[18rem] pointer-events-auto"
    >
      <motion.div
        className={`bg-black/80 backdrop-blur-md rounded-lg overflow-hidden transition-all ${
          isExpanded ? 'border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20' : 'border border-white/10'
        }`}
      >
        {/* Header */}
        <div className={`px-3 py-2 border-b ${isExpanded ? 'border-cyan-500/30 bg-cyan-500/10' : 'border-white/10 bg-white/5'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Cpu className={`w-4 h-4 ${isExpanded ? 'text-cyan-400' : 'text-slate-400'}`} />
                {isExpanded && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full animate-ping" />
                )}
              </div>
              <span className={`text-[11px] font-mono uppercase ${isExpanded ? 'text-cyan-400' : 'text-white/80'}`}>
                {isExpanded ? 'AI PROCES AKTIVAN' : 'AI Flow'}
              </span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              isExpanded ? 'bg-cyan-500/30 text-cyan-400' : 'bg-white/10 text-slate-500'
            }`}>
              {currentProcess?.type === 'idle' ? 'IDLE' : 'LIVE'}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-3">
          {/* Current Process Banner */}
          {isExpanded && currentProcess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 p-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/30 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{currentProcess.label}</div>
                  <div className="text-xs text-slate-400">{currentProcess.sublabel}</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Flow Visualization */}
          <svg width="100%" height={isExpanded ? 120 : 100} viewBox="0 0 220 110" className="w-full">
            {/* Connection lines */}
            {connections.map((conn, i) => {
              const from = getNodePos(conn.from);
              const to = getNodePos(conn.to);
              const isActive = flowLines.some(l => l.from === conn.from && l.to === conn.to && l.active);

              return (
                <g key={i}>
                  <line
                    x1={from.x + 22}
                    y1={from.y + 12}
                    x2={to.x + 22}
                    y2={to.y + 12}
                    stroke={isActive ? '#00d4ff' : 'rgba(255,255,255,0.1)'}
                    strokeWidth={isActive ? 2 : 1}
                    strokeDasharray={isActive ? '6 3' : 'none'}
                  >
                    {isActive && (
                      <animate
                        attributeName="stroke-dashoffset"
                        from="0"
                        to="-18"
                        dur="0.8s"
                        repeatCount="indefinite"
                      />
                    )}
                  </line>
                  {isActive && (
                    <circle r="4" fill="#00d4ff" opacity="0.8">
                      <animateMotion
                        dur="1.2s"
                        repeatCount="indefinite"
                        path={`M${from.x + 22},${from.y + 12} L${to.x + 22},${to.y + 12}`}
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isActive = activeNodes.includes(node.id);
              const colorMap = {
                cyan: { bg: 'rgba(0,212,255,0.3)', border: '#00d4ff', text: '#00d4ff' },
                emerald: { bg: 'rgba(16,185,129,0.3)', border: '#10b981', text: '#10b981' },
                amber: { bg: 'rgba(245,158,11,0.3)', border: '#f59e0b', text: '#f59e0b' },
                purple: { bg: 'rgba(168,85,247,0.3)', border: '#a855f7', text: '#a855f7' },
              };
              const colors = colorMap[node.color];

              return (
                <g key={node.id}>
                  {/* Glow effect for active nodes */}
                  {isActive && (
                    <rect
                      x={node.x - 2}
                      y={node.y - 2}
                      width="48"
                      height="28"
                      rx="6"
                      fill="none"
                      stroke={colors.border}
                      strokeWidth="2"
                      opacity="0.3"
                    >
                      <animate attributeName="opacity" values="0.3;0.6;0.3" dur="1s" repeatCount="indefinite" />
                    </rect>
                  )}
                  <rect
                    x={node.x}
                    y={node.y}
                    width="44"
                    height="24"
                    rx="4"
                    fill={isActive ? colors.bg : 'rgba(255,255,255,0.05)'}
                    stroke={isActive ? colors.border : 'rgba(255,255,255,0.15)'}
                    strokeWidth={isActive ? 2 : 1}
                  />
                  <text
                    x={node.x + 22}
                    y={node.y + 16}
                    textAnchor="middle"
                    fill={isActive ? colors.text : 'rgba(255,255,255,0.5)'}
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Process Steps - shows when expanded */}
          <AnimatePresence>
            {isExpanded && processSteps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-white/10 space-y-2"
              >
                <div className="text-[9px] text-slate-600 uppercase font-mono">Aktivni procesi</div>
                {processSteps.map((step, i) => {
                  const colors = getStatusColor(step.status);
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center gap-2 p-2 rounded ${colors.bg} border ${colors.border}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${colors.dot} ${step.status === 'active' ? 'animate-pulse' : ''}`} />
                      <span className={`text-[10px] font-medium ${colors.text}`}>{step.label}</span>
                      {step.status === 'active' && (
                        <span className="ml-auto text-[8px] text-cyan-400 font-mono animate-pulse">LIVE</span>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Footer */}
          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                currentProcess?.type === 'idle' ? 'bg-slate-500' : 'bg-cyan-500 animate-pulse'
              }`} />
              <span className="text-[10px] text-slate-500">{currentProcess?.sublabel}</span>
            </div>
            <span className="text-[9px] font-mono text-slate-600">AI v2.1</span>
          </div>

          {/* Activity Log */}
          {activityLog.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
              <div className="text-[8px] text-slate-600 uppercase">Log</div>
              {activityLog.slice(0, 3).map((log, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[9px]">
                  <span className={log.type === 'approved' ? 'text-emerald-400' : 'text-amber-400'}>●</span>
                  <span className="text-slate-500 truncate">{log.action}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Mini Widget with expandable modal
function MiniWidget({ title, icon: Icon, color, children, modalContent, modalTitle }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className={`bg-black/70 backdrop-blur-md border border-white/10 rounded-lg p-2 cursor-pointer hover:border-${color}-500/50 hover:bg-${color}-500/5 transition-all group`}
      >
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`w-3 h-3 text-${color}-400`} />
          <span className="text-[9px] font-mono text-white/70 uppercase">{title}</span>
          <ChevronRight className="w-3 h-3 text-slate-600 ml-auto group-hover:text-white/50 transition-colors" />
        </div>
        {children}
      </div>

      {/* Full screen modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            onClick={() => setIsOpen(false)}
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative z-10 bg-black/95 border-2 border-${color}-500/50 rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-auto shadow-2xl shadow-${color}-500/20`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${color}-400`} />
                  </div>
                  <h2 className="text-xl font-bold text-white">{modalTitle || title}</h2>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              {modalContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Grid Component Detail Modal
function GridComponentModal({ component, onClose }) {
  if (!component) return null;

  const getComponentDetails = () => {
    switch (component.type) {
      case 'grid':
        return {
          title: 'Priključak na Mrežu',
          subtitle: '10kV Srednjenaponski Vod',
          color: 'amber',
          stats: [
            { label: 'Napon', value: '10 kV', color: 'amber' },
            { label: 'Max snaga', value: '2 MVA', color: 'cyan' },
            { label: 'Cos φ', value: '0.95', color: 'emerald' },
            { label: 'THD', value: '< 3%', color: 'purple' },
          ],
          parameters: [
            { label: 'Distributer', value: 'EPS Distribucija' },
            { label: 'Tarifni broj', value: 'ED-2024-78542' },
            { label: 'Priključna snaga', value: '1.5 MW' },
            { label: 'Merenje', value: 'AMR daljinsko' },
            { label: 'Ugovor', value: 'Aktivan do 2028' },
          ],
          status: 'online',
        };
      case 'transformer':
        return {
          title: 'Energetski Transformator',
          subtitle: 'TR1 - 10/0.4 kV',
          color: 'purple',
          stats: [
            { label: 'Snaga', value: '1000 kVA', color: 'purple' },
            { label: 'Opterećenje', value: '67%', color: 'emerald' },
            { label: 'Temp. namotaja', value: '58°C', color: 'amber' },
            { label: 'Efikasnost', value: '98.5%', color: 'cyan' },
          ],
          parameters: [
            { label: 'Proizvođač', value: 'Minel Transformatori' },
            { label: 'Serijski broj', value: 'MT-2023-4521' },
            { label: 'Godina proizvodnje', value: '2023' },
            { label: 'Grupa spoja', value: 'Dyn5' },
            { label: 'Ulje', value: 'Mineralno, 450L' },
            { label: 'Hlađenje', value: 'ONAN' },
          ],
          status: 'normal',
        };
      case 'mainPanel':
        return {
          title: 'Glavni Razvodni Orman',
          subtitle: 'GRO-01 - 400V',
          color: 'cyan',
          stats: [
            { label: 'Ulazna struja', value: '1450 A', color: 'cyan' },
            { label: 'Izlaznih polja', value: '12', color: 'purple' },
            { label: 'Aktivnih', value: '10', color: 'emerald' },
            { label: 'Rezerva', value: '2', color: 'slate' },
          ],
          parameters: [
            { label: 'Proizvođač', value: 'Schneider Electric' },
            { label: 'Tip', value: 'Prisma P' },
            { label: 'In glavne sklopke', value: '2000 A' },
            { label: 'Ik max', value: '50 kA' },
            { label: 'IP zaštita', value: 'IP54' },
            { label: 'Sabirnice', value: 'Cu 100x10mm' },
          ],
          circuits: [
            { name: 'Punjač 1-4', power: '300 kW', status: 'active' },
            { name: 'Punjač 5-8', power: '300 kW', status: 'active' },
            { name: 'Punjač 9-12', power: '300 kW', status: 'active' },
            { name: 'Solar Inverter', power: '150 kW', status: 'active' },
            { name: 'Rasveta', power: '15 kW', status: 'active' },
            { name: 'HVAC', power: '45 kW', status: 'active' },
            { name: 'Rezerva 1', power: '-', status: 'off' },
            { name: 'Rezerva 2', power: '-', status: 'off' },
          ],
          status: 'normal',
        };
      case 'solar':
        return {
          title: 'Solarni Sistem',
          subtitle: 'FN Elektrana 150 kWp',
          color: 'amber',
          stats: [
            { label: 'Trenutna snaga', value: '142 kW', color: 'amber' },
            { label: 'Danas', value: '876 kWh', color: 'emerald' },
            { label: 'Ovaj mesec', value: '24.5 MWh', color: 'cyan' },
            { label: 'Efikasnost', value: '94.7%', color: 'purple' },
          ],
          parameters: [
            { label: 'Instalisana snaga', value: '150 kWp' },
            { label: 'Broj panela', value: '375 × 400W' },
            { label: 'Inverteri', value: '3 × SMA 50kW' },
            { label: 'Orijentacija', value: 'Jug, 15°' },
            { label: 'Puštanje u rad', value: 'Mart 2024' },
            { label: 'Garancija', value: '25 godina' },
          ],
          status: 'producing',
        };
      case 'generator':
        return {
          title: 'Diesel Agregat',
          subtitle: 'Backup Generator 500 kVA',
          color: 'red',
          stats: [
            { label: 'Status', value: 'STANDBY', color: 'amber' },
            { label: 'Gorivo', value: '85%', color: 'emerald' },
            { label: 'Sati rada', value: '127h', color: 'cyan' },
            { label: 'Poslednji test', value: '3 dana', color: 'purple' },
          ],
          parameters: [
            { label: 'Proizvođač', value: 'Caterpillar' },
            { label: 'Model', value: 'C15 ACERT' },
            { label: 'Snaga', value: '500 kVA / 400 kW' },
            { label: 'Rezervoar', value: '1000L' },
            { label: 'Autonomija', value: '~8h @ 75%' },
            { label: 'Auto-start', value: 'Da, < 10s' },
          ],
          status: 'standby',
        };
      case 'ups':
        return {
          title: 'UPS Sistem',
          subtitle: 'Besprekidno Napajanje',
          color: 'emerald',
          stats: [
            { label: 'Opterećenje', value: '34%', color: 'emerald' },
            { label: 'Autonomija', value: '15 min', color: 'cyan' },
            { label: 'Baterije', value: '100%', color: 'emerald' },
            { label: 'Temp.', value: '24°C', color: 'amber' },
          ],
          parameters: [
            { label: 'Proizvođač', value: 'Eaton' },
            { label: 'Model', value: '9PX 20kVA' },
            { label: 'Topologija', value: 'Double conversion' },
            { label: 'Baterije', value: '40 × 12V/9Ah' },
            { label: 'Bypass', value: 'Automatski' },
            { label: 'Kritični potrošači', value: 'Kontrola, IT' },
          ],
          status: 'online',
        };
      case 'charger':
        return {
          title: 'EK3 Punjački Rack',
          subtitle: '84 × EK3 Modula = 252 kW',
          color: 'cyan',
          stats: [
            { label: 'Aktivnih modula', value: '82/84', color: 'emerald' },
            { label: 'Trenutna snaga', value: '187 kW', color: 'cyan' },
            { label: 'Efikasnost', value: '97.2%', color: 'purple' },
            { label: 'Temp. avg', value: '42°C', color: 'amber' },
          ],
          parameters: [
            { label: 'Konfiguracija', value: '84 × 3kW modula' },
            { label: 'Wide striping', value: 'Aktivno' },
            { label: 'Distributed sparing', value: '2 modula' },
            { label: 'Hot-swap', value: 'Podržan' },
            { label: 'Robot spreman', value: 'Da' },
            { label: 'Health score', value: '98.7%' },
          ],
          modules: [
            { id: 'M01-M21', status: 'active', power: 63, temp: 41 },
            { id: 'M22-M42', status: 'active', power: 62, temp: 43 },
            { id: 'M43-M63', status: 'active', power: 60, temp: 42 },
            { id: 'M64-M84', status: 'partial', power: 58, temp: 44 },
          ],
          status: 'charging',
        };
      default:
        return null;
    }
  };

  const details = getComponentDetails();
  if (!details) return null;

  const colorClasses = {
    amber: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' },
    purple: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
    cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    emerald: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    red: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400' },
    slate: { bg: 'bg-slate-500/20', border: 'border-slate-500/30', text: 'text-slate-400' },
  };

  const c = colorClasses[details.color];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0a0a12] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${c.bg} border-b ${c.border} px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-bold ${c.text}`}>{details.title}</h2>
              <p className="text-sm text-slate-400">{details.subtitle}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {details.stats.map((stat, i) => {
              const sc = colorClasses[stat.color];
              return (
                <div key={i} className={`${sc.bg} border ${sc.border} rounded-xl p-4 text-center`}>
                  <div className={`text-2xl font-mono font-bold ${sc.text}`}>{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Parameters */}
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 bg-white/5">
              <h3 className="text-sm font-bold text-white">Tehnički Podaci</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {details.parameters.map((param, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-black/30 rounded-lg">
                    <span className="text-sm text-slate-400">{param.label}</span>
                    <span className="text-sm font-mono text-white">{param.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Circuits for main panel */}
          {details.circuits && (
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                <h3 className="text-sm font-bold text-white">Izlazna Polja</h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-2">
                {details.circuits.map((circuit, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${circuit.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-500/10 border-slate-500/20'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${circuit.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                      <span className="text-sm text-white">{circuit.name}</span>
                    </div>
                    <span className={`text-sm font-mono ${circuit.status === 'active' ? 'text-cyan-400' : 'text-slate-500'}`}>{circuit.power}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modules for charger */}
          {details.modules && (
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                <h3 className="text-sm font-bold text-white">Grupe Modula</h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {details.modules.map((mod, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${mod.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-white">{mod.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${mod.status === 'active' ? 'bg-emerald-500/30 text-emerald-400' : 'bg-amber-500/30 text-amber-400'}`}>
                        {mod.status === 'active' ? 'OK' : '1 FAULT'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Snaga: <span className="text-cyan-400 font-mono">{mod.power} kW</span></span>
                      <span className="text-slate-400">Temp: <span className="text-amber-400 font-mono">{mod.temp}°C</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status footer */}
          <div className={`${c.bg} border ${c.border} rounded-xl p-4 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${details.status === 'standby' ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
              <span className="text-sm text-white">Status: <span className={c.text}>{details.status.toUpperCase()}</span></span>
            </div>
            <span className="text-xs text-slate-500 font-mono">ID: {component.type.toUpperCase()}-001</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Interactive Grid Schematic Component
function GridSchematicComponent({ type, label, sublabel, icon: Icon, color, status, onClick, className = '' }) {
  const colorClasses = {
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'hover:shadow-amber-500/20' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'hover:shadow-purple-500/20' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'hover:shadow-cyan-500/20' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'hover:shadow-emerald-500/20' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', glow: 'hover:shadow-red-500/20' },
  };
  const c = colorClasses[color];

  return (
    <button
      onClick={() => onClick({ type })}
      className={`${c.bg} border-2 ${c.border} rounded-xl p-4 transition-all hover:scale-105 hover:shadow-lg ${c.glow} cursor-pointer group ${className}`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
        <div className="text-left">
          <div className="text-sm font-bold text-white group-hover:text-white/90">{label}</div>
          <div className="text-xs text-slate-500">{sublabel}</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${status === 'active' || status === 'online' ? 'bg-emerald-500 animate-pulse' : status === 'standby' ? 'bg-amber-500' : 'bg-slate-500'}`} />
          <span className="text-[10px] text-slate-400 uppercase">{status}</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white/50 group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
}

// Power flow line component
function PowerFlowLine({ direction = 'horizontal', active = true, className = '' }) {
  return (
    <div className={`relative ${direction === 'horizontal' ? 'h-1 w-full' : 'w-1 h-full'} ${className}`}>
      <div className={`absolute inset-0 ${active ? 'bg-cyan-500/30' : 'bg-slate-700'} rounded-full`} />
      {active && (
        <motion.div
          className={`absolute ${direction === 'horizontal' ? 'h-full w-4' : 'w-full h-4'} bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full`}
          animate={direction === 'horizontal' ? { x: ['-100%', '400%'] } : { y: ['-100%', '400%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </div>
  );
}

// Grid Status Widget with Interactive Schematic
function GridStatusWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [gridData] = useState({
    status: 'online',
    load: 67,
    available: 850,
    total: 1200,
  });

  const handleComponentClick = (component) => {
    setSelectedComponent(component);
  };

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden cursor-pointer hover:border-emerald-500/30 transition-colors"
      >
        <div className="px-2 py-1.5 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Plug className="w-3 h-3 text-emerald-400" />
            <span className="text-[9px] font-mono text-white/80 uppercase">Grid</span>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-600" />
        </div>
        <div className="p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-emerald-400">ONLINE</span>
            </div>
            <span className="text-sm font-mono font-bold text-white">{gridData.load}%</span>
          </div>
        </div>
      </div>

      {/* Full Screen Schematic Modal */}
      <AnimatePresence>
        {isOpen && !selectedComponent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col p-6"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Elektro Šema Sistema</h2>
                  <p className="text-slate-400">Interaktivna jednopolna šema • Klikni na komponentu za detalje</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-slate-400">Aktivno</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="text-slate-400">Standby</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-500" />
                      <span className="text-slate-400">Offline</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Schematic Content */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-6xl">
                  {/* Top Row - Power Sources */}
                  <div className="flex justify-center gap-8 mb-4">
                    <GridSchematicComponent
                      type="grid"
                      label="Gradska Mreža"
                      sublabel="10kV / 600kW"
                      icon={Zap}
                      color="amber"
                      status="active"
                      onClick={handleComponentClick}
                      className="w-48"
                    />
                    <GridSchematicComponent
                      type="solar"
                      label="Solar FN"
                      sublabel="150 kWp"
                      icon={Sun}
                      color="amber"
                      status="active"
                      onClick={handleComponentClick}
                      className="w-48"
                    />
                    <GridSchematicComponent
                      type="generator"
                      label="Diesel Agregat"
                      sublabel="500 kVA"
                      icon={Fuel}
                      color="red"
                      status="standby"
                      onClick={handleComponentClick}
                      className="w-48"
                    />
                  </div>

                  {/* Power Flow Lines Down */}
                  <div className="flex justify-center gap-8 h-8">
                    <div className="w-48 flex justify-center"><PowerFlowLine direction="vertical" active={true} /></div>
                    <div className="w-48 flex justify-center"><PowerFlowLine direction="vertical" active={true} /></div>
                    <div className="w-48 flex justify-center"><PowerFlowLine direction="vertical" active={false} /></div>
                  </div>

                  {/* Transformer */}
                  <div className="flex justify-center mb-4">
                    <GridSchematicComponent
                      type="transformer"
                      label="Transformator TR1"
                      sublabel="10/0.4 kV • 1000 kVA"
                      icon={Cpu}
                      color="purple"
                      status="active"
                      onClick={handleComponentClick}
                      className="w-64"
                    />
                  </div>

                  {/* Power Flow Line Down */}
                  <div className="flex justify-center h-8">
                    <PowerFlowLine direction="vertical" active={true} />
                  </div>

                  {/* Main Panel */}
                  <div className="flex justify-center mb-4">
                    <GridSchematicComponent
                      type="mainPanel"
                      label="Glavni Razvod GRO"
                      sublabel="400V • 2000A • 12 polja"
                      icon={LayoutGrid}
                      color="cyan"
                      status="active"
                      onClick={handleComponentClick}
                      className="w-72"
                    />
                  </div>

                  {/* Power Flow Lines to outputs */}
                  <div className="flex justify-center h-8">
                    <div className="flex items-center gap-0 w-full max-w-4xl">
                      <div className="flex-1" />
                      <PowerFlowLine direction="vertical" active={true} className="w-1" />
                      <div className="flex-1 flex items-center">
                        <PowerFlowLine direction="horizontal" active={true} />
                      </div>
                      <PowerFlowLine direction="vertical" active={true} className="w-1" />
                      <div className="flex-1 flex items-center">
                        <PowerFlowLine direction="horizontal" active={true} />
                      </div>
                      <PowerFlowLine direction="vertical" active={true} className="w-1" />
                      <div className="flex-1" />
                    </div>
                  </div>

                  {/* Bottom Row - Outputs */}
                  <div className="flex justify-center gap-6">
                    <GridSchematicComponent
                      type="charger"
                      label="EK3 Rack #1"
                      sublabel="84 modula • 252 kW"
                      icon={BatteryCharging}
                      color="cyan"
                      status="active"
                      onClick={handleComponentClick}
                      className="w-44"
                    />
                    <GridSchematicComponent
                      type="charger"
                      label="EK3 Rack #2"
                      sublabel="84 modula • 252 kW"
                      icon={BatteryCharging}
                      color="cyan"
                      status="active"
                      onClick={handleComponentClick}
                      className="w-44"
                    />
                    <GridSchematicComponent
                      type="ups"
                      label="UPS Sistem"
                      sublabel="20 kVA • 15 min"
                      icon={Shield}
                      color="emerald"
                      status="online"
                      onClick={handleComponentClick}
                      className="w-44"
                    />
                  </div>

                  {/* Stats Bar */}
                  <div className="mt-8 flex justify-center">
                    <div className="bg-black/50 border border-white/10 rounded-xl px-8 py-4 flex items-center gap-12">
                      <div className="text-center">
                        <div className="text-3xl font-mono font-bold text-emerald-400">{gridData.load}%</div>
                        <div className="text-xs text-slate-500">Opterećenje</div>
                      </div>
                      <div className="w-px h-10 bg-white/10" />
                      <div className="text-center">
                        <div className="text-3xl font-mono font-bold text-cyan-400">{gridData.available} kW</div>
                        <div className="text-xs text-slate-500">Dostupno</div>
                      </div>
                      <div className="w-px h-10 bg-white/10" />
                      <div className="text-center">
                        <div className="text-3xl font-mono font-bold text-purple-400">{gridData.total} kW</div>
                        <div className="text-xs text-slate-500">Kapacitet</div>
                      </div>
                      <div className="w-px h-10 bg-white/10" />
                      <div className="text-center">
                        <div className="text-3xl font-mono font-bold text-amber-400">98.5%</div>
                        <div className="text-xs text-slate-500">Efikasnost</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
                <span>ELEKTROKOMBINACIJA • Jednopolna šema napajanja</span>
                <span className="font-mono">Poslednje ažuriranje: {new Date().toLocaleTimeString('sr-RS')}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Component Detail Modal */}
      <AnimatePresence>
        {selectedComponent && (
          <GridComponentModal
            component={selectedComponent}
            onClose={() => setSelectedComponent(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Energy Sparkline Widget
function EnergySparklineWidget({ buses }) {
  const [hourlyData] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      hour: i + 6,
      consumption: Math.floor(Math.random() * 200) + 100,
      production: Math.floor(Math.random() * 80) + 20,
    }))
  );
  const maxVal = Math.max(...hourlyData.map(d => d.consumption));
  const currentConsumption = Math.floor(buses.length * 12.8);

  return (
    <MiniWidget
      title="Energija"
      icon={BarChart3}
      color="cyan"
      modalTitle="Potrošnja Energije"
      modalContent={
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/30">
              <div className="text-2xl font-bold text-cyan-400">{currentConsumption} kWh</div>
              <div className="text-sm text-slate-400">Trenutno</div>
            </div>
            <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
              <div className="text-2xl font-bold text-emerald-400">{Math.floor(buses.length * 34.7)} kWh</div>
              <div className="text-sm text-slate-400">Danas ukupno</div>
            </div>
            <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
              <div className="text-2xl font-bold text-amber-400">94.2%</div>
              <div className="text-sm text-slate-400">Efikasnost</div>
            </div>
            <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30">
              <div className="text-2xl font-bold text-purple-400">{Math.floor(buses.length * 8.2)} kg</div>
              <div className="text-sm text-slate-400">CO₂ ušteda</div>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-3">Potrošnja po satima</h3>
            <div className="h-48 flex items-end gap-1">
              {hourlyData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col gap-0.5">
                    <div
                      className="w-full bg-cyan-500/60 rounded-t"
                      style={{ height: `${(d.consumption / maxVal) * 150}px` }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500">{d.hour}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className="flex items-center gap-1 h-6">
        {hourlyData.slice(-8).map((d, i) => (
          <div
            key={i}
            className="flex-1 bg-cyan-500/60 rounded-sm"
            style={{ height: `${(d.consumption / maxVal) * 100}%` }}
          />
        ))}
      </div>
    </MiniWidget>
  );
}

// Alarm Log Widget
function AlarmLogWidget({ activityLog }) {
  const [alarmHistory] = useState([
    { time: '14:32', type: 'warning', message: 'Bus 3 - niska baterija', resolved: true },
    { time: '14:15', type: 'info', message: 'Swap završen - Bus 7', resolved: true },
    { time: '13:58', type: 'warning', message: 'Gužva - Bulevar Oslobođenja', resolved: true },
    { time: '13:42', type: 'error', message: 'Stanica 2 - kratak prekid', resolved: true },
    { time: '13:30', type: 'info', message: 'AI optimizacija rute', resolved: true },
    { time: '12:55', type: 'warning', message: 'Bus 12 - temperatura modula', resolved: true },
  ]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'error': return 'red';
      case 'warning': return 'amber';
      default: return 'cyan';
    }
  };

  return (
    <MiniWidget
      title="Alarmi"
      icon={History}
      color="amber"
      modalTitle="Istorija Alarma"
      modalContent={
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
              <div className="text-2xl font-bold text-red-400">0</div>
              <div className="text-sm text-slate-400">Kritičnih</div>
            </div>
            <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
              <div className="text-2xl font-bold text-amber-400">2</div>
              <div className="text-sm text-slate-400">Upozorenja</div>
            </div>
            <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
              <div className="text-2xl font-bold text-emerald-400">{alarmHistory.length}</div>
              <div className="text-sm text-slate-400">Rešenih danas</div>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 max-h-80 overflow-auto">
            <h3 className="text-sm font-bold text-white mb-3">Poslednji događaji</h3>
            <div className="space-y-2">
              {alarmHistory.map((alarm, i) => {
                const color = getTypeColor(alarm.type);
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 bg-${color}-500/10 rounded-lg border border-${color}-500/20`}>
                    <div className={`w-2 h-2 rounded-full bg-${color}-500`} />
                    <span className="text-xs font-mono text-slate-500">{alarm.time}</span>
                    <span className="text-sm text-white flex-1">{alarm.message}</span>
                    {alarm.resolved && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      }
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400">{alarmHistory.length} danas</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-emerald-400">OK</span>
        </div>
      </div>
    </MiniWidget>
  );
}

// Maintenance Widget
function MaintenanceWidget({ buses, chargingStations }) {
  const [schedule] = useState([
    { id: 1, type: 'Bus', name: 'Bus 5', task: 'Servis EK3 modula', date: 'Danas 16:00', priority: 'normal' },
    { id: 2, type: 'Station', name: 'Stanica Centar', task: 'Kalibracija robota', date: 'Sutra 09:00', priority: 'low' },
    { id: 3, type: 'Bus', name: 'Bus 12', task: 'Zamena filtera', date: '05.01.', priority: 'normal' },
    { id: 4, type: 'Station', name: 'Depo Novi Sad', task: 'Inspekcija mreže', date: '07.01.', priority: 'low' },
  ]);

  const todayCount = schedule.filter(s => s.date.includes('Danas')).length;

  return (
    <MiniWidget
      title="Održavanje"
      icon={Calendar}
      color="purple"
      modalTitle="Raspored Održavanja"
      modalContent={
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
              <div className="text-2xl font-bold text-amber-400">{todayCount}</div>
              <div className="text-sm text-slate-400">Danas</div>
            </div>
            <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/30">
              <div className="text-2xl font-bold text-cyan-400">{schedule.length}</div>
              <div className="text-sm text-slate-400">Ova nedelja</div>
            </div>
            <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
              <div className="text-2xl font-bold text-emerald-400">98.5%</div>
              <div className="text-sm text-slate-400">Fleet health</div>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-3">Zakazano</h3>
            <div className="space-y-2">
              {schedule.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-white/10">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'Bus' ? 'bg-cyan-500/20' : 'bg-purple-500/20'}`}>
                    {item.type === 'Bus' ? <Bus className="w-4 h-4 text-cyan-400" /> : <Zap className="w-4 h-4 text-purple-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{item.name}</div>
                    <div className="text-xs text-slate-400">{item.task}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-mono ${item.date.includes('Danas') ? 'text-amber-400' : 'text-slate-500'}`}>{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400">Sledeće: danas</span>
        <span className="text-sm font-mono font-bold text-purple-400">{todayCount}</span>
      </div>
    </MiniWidget>
  );
}

// ============ EXPANDED WIDGETS ============

// Grid Status Widget Expanded
function GridStatusWidgetExpanded() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [gridData] = useState({
    status: 'online',
    load: 67,
    available: 850,
    total: 1200,
    voltage: 398,
    frequency: 50.01,
    powerFactor: 0.95,
  });

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden cursor-pointer hover:border-emerald-500/30 transition-colors"
      >
        <div className="px-2.5 py-1.5 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Plug className="w-3 h-3 text-emerald-400" />
            <span className="text-[9px] font-mono text-white/80 uppercase">Grid</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-emerald-400">ONLINE</span>
          </div>
        </div>
        <div className="p-2.5 space-y-2">
          {/* Load bar */}
          <div>
            <div className="flex justify-between text-[9px] mb-1">
              <span className="text-slate-500">Opterećenje</span>
              <span className="text-white font-mono">{gridData.load}%</span>
            </div>
            <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${gridData.load}%` }}
              />
            </div>
          </div>
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-white/5 rounded p-1.5">
              <div className="text-[8px] text-slate-500">Napon</div>
              <div className="text-xs font-mono text-cyan-400">{gridData.voltage}V</div>
            </div>
            <div className="bg-white/5 rounded p-1.5">
              <div className="text-[8px] text-slate-500">Frekvencija</div>
              <div className="text-xs font-mono text-emerald-400">{gridData.frequency}Hz</div>
            </div>
            <div className="bg-white/5 rounded p-1.5">
              <div className="text-[8px] text-slate-500">Dostupno</div>
              <div className="text-xs font-mono text-white">{gridData.available}kW</div>
            </div>
            <div className="bg-white/5 rounded p-1.5">
              <div className="text-[8px] text-slate-500">Cos φ</div>
              <div className="text-xs font-mono text-purple-400">{gridData.powerFactor}</div>
            </div>
          </div>
          {/* Sources mini */}
          <div className="flex items-center gap-1 pt-1 border-t border-white/5">
            <div className="flex items-center gap-1 flex-1">
              <Zap className="w-2.5 h-2.5 text-amber-400" />
              <span className="text-[8px] text-slate-400">600kW</span>
            </div>
            <div className="flex items-center gap-1 flex-1">
              <Sun className="w-2.5 h-2.5 text-amber-400" />
              <span className="text-[8px] text-slate-400">150kW</span>
            </div>
            <div className="flex items-center gap-1 flex-1">
              <Fuel className="w-2.5 h-2.5 text-slate-500" />
              <span className="text-[8px] text-slate-500">STBY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reuse existing schematic modal */}
      <AnimatePresence>
        {isOpen && !selectedComponent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Elektro Šema Sistema</h2>
                  <p className="text-slate-400">Interaktivna jednopolna šema • Klikni na komponentu za detalje</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-6xl">
                  <div className="flex justify-center gap-8 mb-4">
                    <GridSchematicComponent type="grid" label="Gradska Mreža" sublabel="10kV / 600kW" icon={Zap} color="amber" status="active" onClick={setSelectedComponent} className="w-48" />
                    <GridSchematicComponent type="solar" label="Solar FN" sublabel="150 kWp" icon={Sun} color="amber" status="active" onClick={setSelectedComponent} className="w-48" />
                    <GridSchematicComponent type="generator" label="Diesel Agregat" sublabel="500 kVA" icon={Fuel} color="red" status="standby" onClick={setSelectedComponent} className="w-48" />
                  </div>
                  <div className="flex justify-center gap-8 h-8">
                    <div className="w-48 flex justify-center"><PowerFlowLine direction="vertical" active={true} /></div>
                    <div className="w-48 flex justify-center"><PowerFlowLine direction="vertical" active={true} /></div>
                    <div className="w-48 flex justify-center"><PowerFlowLine direction="vertical" active={false} /></div>
                  </div>
                  <div className="flex justify-center mb-4">
                    <GridSchematicComponent type="transformer" label="Transformator TR1" sublabel="10/0.4 kV • 1000 kVA" icon={Cpu} color="purple" status="active" onClick={setSelectedComponent} className="w-64" />
                  </div>
                  <div className="flex justify-center h-8"><PowerFlowLine direction="vertical" active={true} /></div>
                  <div className="flex justify-center mb-4">
                    <GridSchematicComponent type="mainPanel" label="Glavni Razvod GRO" sublabel="400V • 2000A • 12 polja" icon={LayoutGrid} color="cyan" status="active" onClick={setSelectedComponent} className="w-72" />
                  </div>
                  <div className="flex justify-center h-8">
                    <div className="flex items-center w-full max-w-4xl">
                      <div className="flex-1" />
                      <PowerFlowLine direction="vertical" active={true} className="w-1" />
                      <div className="flex-1 flex items-center"><PowerFlowLine direction="horizontal" active={true} /></div>
                      <PowerFlowLine direction="vertical" active={true} className="w-1" />
                      <div className="flex-1 flex items-center"><PowerFlowLine direction="horizontal" active={true} /></div>
                      <PowerFlowLine direction="vertical" active={true} className="w-1" />
                      <div className="flex-1" />
                    </div>
                  </div>
                  <div className="flex justify-center gap-6">
                    <GridSchematicComponent type="charger" label="EK3 Rack #1" sublabel="84 modula • 252 kW" icon={BatteryCharging} color="cyan" status="active" onClick={setSelectedComponent} className="w-44" />
                    <GridSchematicComponent type="charger" label="EK3 Rack #2" sublabel="84 modula • 252 kW" icon={BatteryCharging} color="cyan" status="active" onClick={setSelectedComponent} className="w-44" />
                    <GridSchematicComponent type="ups" label="UPS Sistem" sublabel="20 kVA • 15 min" icon={Shield} color="emerald" status="online" onClick={setSelectedComponent} className="w-44" />
                  </div>
                  <div className="mt-8 flex justify-center">
                    <div className="bg-black/50 border border-white/10 rounded-xl px-8 py-4 flex items-center gap-12">
                      <div className="text-center">
                        <div className="text-3xl font-mono font-bold text-emerald-400">{gridData.load}%</div>
                        <div className="text-xs text-slate-500">Opterećenje</div>
                      </div>
                      <div className="w-px h-10 bg-white/10" />
                      <div className="text-center">
                        <div className="text-3xl font-mono font-bold text-cyan-400">{gridData.available} kW</div>
                        <div className="text-xs text-slate-500">Dostupno</div>
                      </div>
                      <div className="w-px h-10 bg-white/10" />
                      <div className="text-center">
                        <div className="text-3xl font-mono font-bold text-purple-400">{gridData.total} kW</div>
                        <div className="text-xs text-slate-500">Kapacitet</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedComponent && <GridComponentModal component={selectedComponent} onClose={() => setSelectedComponent(null)} />}
      </AnimatePresence>
    </>
  );
}

// Energy Sparkline Widget Expanded
function EnergySparklineWidgetExpanded({ buses }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hourlyData] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      hour: i + 6,
      consumption: Math.floor(Math.random() * 200) + 100,
    }))
  );
  const maxVal = Math.max(...hourlyData.map(d => d.consumption));
  const currentConsumption = Math.floor(buses.length * 12.8);
  const todayTotal = Math.floor(buses.length * 34.7);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden cursor-pointer hover:border-cyan-500/30 transition-colors"
      >
        <div className="px-2.5 py-1.5 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3 h-3 text-cyan-400" />
            <span className="text-[9px] font-mono text-white/80 uppercase">Energija</span>
          </div>
          <span className="text-[9px] font-mono text-cyan-400">{currentConsumption} kW</span>
        </div>
        <div className="p-2.5 space-y-2">
          {/* Sparkline chart */}
          <div className="flex items-end gap-0.5 h-10">
            {hourlyData.map((d, i) => (
              <div
                key={i}
                className="flex-1 bg-cyan-500/60 rounded-t transition-all hover:bg-cyan-400"
                style={{ height: `${(d.consumption / maxVal) * 100}%` }}
              />
            ))}
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-white/5 rounded p-1.5">
              <div className="text-[8px] text-slate-500">Danas</div>
              <div className="text-xs font-mono text-emerald-400">{todayTotal} kWh</div>
            </div>
            <div className="bg-white/5 rounded p-1.5">
              <div className="text-[8px] text-slate-500">CO₂ ušteda</div>
              <div className="text-xs font-mono text-emerald-400">{Math.floor(buses.length * 8.2)} kg</div>
            </div>
          </div>
          {/* Efficiency indicator */}
          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <span className="text-[8px] text-slate-500">Efikasnost</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
              <span className="text-[10px] font-mono text-emerald-400">94.2%</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-[#0a0a12] border border-white/10 rounded-2xl w-full max-w-4xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Potrošnja Energije</h2>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/30 text-center">
                  <div className="text-2xl font-mono font-bold text-cyan-400">{currentConsumption} kW</div>
                  <div className="text-sm text-slate-400">Trenutno</div>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30 text-center">
                  <div className="text-2xl font-mono font-bold text-emerald-400">{todayTotal} kWh</div>
                  <div className="text-sm text-slate-400">Danas ukupno</div>
                </div>
                <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30 text-center">
                  <div className="text-2xl font-mono font-bold text-amber-400">94.2%</div>
                  <div className="text-sm text-slate-400">Efikasnost</div>
                </div>
                <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30 text-center">
                  <div className="text-2xl font-mono font-bold text-purple-400">{Math.floor(buses.length * 8.2)} kg</div>
                  <div className="text-sm text-slate-400">CO₂ ušteda</div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-bold text-white mb-4">Potrošnja po satima</h3>
                <div className="h-48 flex items-end gap-2">
                  {hourlyData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-cyan-500/60 rounded-t" style={{ height: `${(d.consumption / maxVal) * 150}px` }} />
                      <span className="text-[10px] text-slate-500">{d.hour}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Alarm Log Widget Expanded
function AlarmLogWidgetExpanded({ activityLog }) {
  const [isOpen, setIsOpen] = useState(false);
  const [alarms] = useState([
    { time: '15:02', type: 'info', msg: 'Swap OK - Bus 7' },
    { time: '14:45', type: 'warning', msg: 'Niska baterija Bus 3' },
    { time: '14:32', type: 'info', msg: 'Ruta optimizovana' },
  ]);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden cursor-pointer hover:border-amber-500/30 transition-colors"
      >
        <div className="px-2.5 py-1.5 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <History className="w-3 h-3 text-amber-400" />
            <span className="text-[9px] font-mono text-white/80 uppercase">Alarmi</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] text-emerald-400">OK</span>
          </div>
        </div>
        <div className="p-2.5 space-y-1.5">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-1">
            <div className="bg-red-500/10 rounded p-1 text-center">
              <div className="text-sm font-mono font-bold text-red-400">0</div>
              <div className="text-[7px] text-slate-500">Kritično</div>
            </div>
            <div className="bg-amber-500/10 rounded p-1 text-center">
              <div className="text-sm font-mono font-bold text-amber-400">2</div>
              <div className="text-[7px] text-slate-500">Upozor.</div>
            </div>
            <div className="bg-emerald-500/10 rounded p-1 text-center">
              <div className="text-sm font-mono font-bold text-emerald-400">12</div>
              <div className="text-[7px] text-slate-500">Rešeno</div>
            </div>
          </div>
          {/* Recent alarms */}
          <div className="space-y-1 pt-1 border-t border-white/5">
            {alarms.slice(0, 3).map((a, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[9px]">
                <div className={`w-1.5 h-1.5 rounded-full ${a.type === 'warning' ? 'bg-amber-500' : a.type === 'error' ? 'bg-red-500' : 'bg-cyan-500'}`} />
                <span className="text-slate-500 font-mono">{a.time}</span>
                <span className="text-slate-400 truncate">{a.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-[#0a0a12] border border-white/10 rounded-2xl w-full max-w-3xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Istorija Alarma</h2>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30 text-center">
                  <div className="text-3xl font-mono font-bold text-red-400">0</div>
                  <div className="text-sm text-slate-400">Kritičnih</div>
                </div>
                <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30 text-center">
                  <div className="text-3xl font-mono font-bold text-amber-400">2</div>
                  <div className="text-sm text-slate-400">Upozorenja</div>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30 text-center">
                  <div className="text-3xl font-mono font-bold text-emerald-400">12</div>
                  <div className="text-sm text-slate-400">Rešenih danas</div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 max-h-80 overflow-auto">
                <h3 className="text-sm font-bold text-white mb-3">Poslednji događaji</h3>
                <div className="space-y-2">
                  {[...alarms,
                    { time: '14:15', type: 'info', msg: 'Dijagnostika završena' },
                    { time: '13:58', type: 'warning', msg: 'Gužva - Bulevar Oslobođenja' },
                    { time: '13:42', type: 'info', msg: 'Swap završen - Bus 12' },
                  ].map((a, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${a.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : a.type === 'error' ? 'bg-red-500/10 border-red-500/20' : 'bg-cyan-500/10 border-cyan-500/20'}`}>
                      <div className={`w-2 h-2 rounded-full ${a.type === 'warning' ? 'bg-amber-500' : a.type === 'error' ? 'bg-red-500' : 'bg-cyan-500'}`} />
                      <span className="text-xs font-mono text-slate-500">{a.time}</span>
                      <span className="text-sm text-white flex-1">{a.msg}</span>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Maintenance Widget Expanded
function MaintenanceWidgetExpanded({ buses, chargingStations }) {
  const [isOpen, setIsOpen] = useState(false);
  const [schedule] = useState([
    { type: 'Bus', name: 'Bus 5', task: 'EK3 servis', date: 'Danas 16:00' },
    { type: 'Station', name: 'Centar', task: 'Kalibracija', date: 'Sutra 09:00' },
  ]);
  const todayCount = 1;

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden cursor-pointer hover:border-purple-500/30 transition-colors"
      >
        <div className="px-2.5 py-1.5 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-purple-400" />
            <span className="text-[9px] font-mono text-white/80 uppercase">Održavanje</span>
          </div>
          <span className="text-[9px] font-mono text-purple-400">{todayCount} danas</span>
        </div>
        <div className="p-2.5 space-y-1.5">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="bg-amber-500/10 rounded p-1.5">
              <div className="text-[8px] text-slate-500">Danas</div>
              <div className="text-sm font-mono font-bold text-amber-400">{todayCount}</div>
            </div>
            <div className="bg-emerald-500/10 rounded p-1.5">
              <div className="text-[8px] text-slate-500">Fleet health</div>
              <div className="text-sm font-mono font-bold text-emerald-400">98.5%</div>
            </div>
          </div>
          {/* Upcoming */}
          <div className="space-y-1 pt-1 border-t border-white/5">
            {schedule.slice(0, 2).map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[9px]">
                {s.type === 'Bus' ? <Bus className="w-2.5 h-2.5 text-cyan-400" /> : <Zap className="w-2.5 h-2.5 text-purple-400" />}
                <span className="text-white truncate flex-1">{s.name}</span>
                <span className={`font-mono ${s.date.includes('Danas') ? 'text-amber-400' : 'text-slate-500'}`}>{s.date.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-[#0a0a12] border border-white/10 rounded-2xl w-full max-w-3xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Raspored Održavanja</h2>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30 text-center">
                  <div className="text-3xl font-mono font-bold text-amber-400">{todayCount}</div>
                  <div className="text-sm text-slate-400">Danas</div>
                </div>
                <div className="bg-cyan-500/10 rounded-xl p-4 border border-cyan-500/30 text-center">
                  <div className="text-3xl font-mono font-bold text-cyan-400">4</div>
                  <div className="text-sm text-slate-400">Ova nedelja</div>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30 text-center">
                  <div className="text-3xl font-mono font-bold text-emerald-400">98.5%</div>
                  <div className="text-sm text-slate-400">Fleet health</div>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-bold text-white mb-3">Zakazano</h3>
                <div className="space-y-2">
                  {[...schedule,
                    { type: 'Bus', name: 'Bus 12', task: 'Zamena filtera', date: '05.01.' },
                    { type: 'Station', name: 'Depo NS', task: 'Inspekcija mreže', date: '07.01.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg border border-white/10">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'Bus' ? 'bg-cyan-500/20' : 'bg-purple-500/20'}`}>
                        {item.type === 'Bus' ? <Bus className="w-4 h-4 text-cyan-400" /> : <Zap className="w-4 h-4 text-purple-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{item.name}</div>
                        <div className="text-xs text-slate-400">{item.task}</div>
                      </div>
                      <div className={`text-xs font-mono ${item.date.includes('Danas') ? 'text-amber-400' : 'text-slate-500'}`}>{item.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
  const {
    buses,
    routes,
    city,
    isRunning,
    speed,
    setSpeed,
    selectedItem,
    selectItem,
    clearSelection,
    chargingStations,
    pendingDecision,
    setPendingDecision,
    clearPendingDecision,
    // New decision actions
    forceChargeBus,
    triggerSwap,
    dispatchRobot,
    setBusState,
    setBusPriority,
    addBusDecisionHistory,
    // KorAllThing orchestrator
    addToScenarioQueue,
    updateScenarioStatus,
  } = useSimulation();

  // Context object for decision effects
  const simulationContext = {
    buses,
    chargingStations,
    forceChargeBus,
    triggerSwap,
    dispatchRobot,
    setBusState,
    setBusPriority,
    addBusDecisionHistory,
  };
  const [decisions, setDecisions] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [activeFlow, setActiveFlow] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [stats, setStats] = useState({ approved: 0, timeout: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showBusModal, setShowBusModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);
  const modalOpenRef = useRef(false);
  const lastMouseMoveRef = useRef(Date.now());
  const isMouseIdleRef = useRef(true);
  const simTimeRef = useRef(Date.now()); // Simulation time that advances with speed
  const activeScenarioIdRef = useRef(null); // Track current scenario for KorAllThing

  // Track modal/flow state in ref - only block on actual modals, not item selection
  useEffect(() => {
    modalOpenRef.current = activeModal !== null || activeFlow !== null;
  }, [activeModal, activeFlow]);

  // Open station modal when station is selected from map
  useEffect(() => {
    if (selectedItem?.type === 'station' && !showStationModal) {
      setShowStationModal(true);
    }
  }, [selectedItem]);

  // Update clock - advances faster with higher speed
  useEffect(() => {
    if (!isRunning) return;

    let lastRealTime = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const realDelta = now - lastRealTime;
      lastRealTime = now;

      // Advance simulation time by realDelta * speed
      simTimeRef.current += realDelta * speed;
      setCurrentTime(new Date(simTimeRef.current));
    }, 100); // Update more frequently for smoother display

    return () => clearInterval(interval);
  }, [isRunning, speed]);

  // Track mouse movement for idle detection
  useEffect(() => {
    const handleMouseMove = () => {
      lastMouseMoveRef.current = Date.now();
      isMouseIdleRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Track activeModal/activeFlow in refs to avoid effect re-triggering
  const activeModalRef = useRef(activeModal);
  const activeFlowRef = useRef(activeFlow);
  const busesRef = useRef(buses);
  const routesRef = useRef(routes);
  const addToScenarioQueueRef = useRef(addToScenarioQueue);

  useEffect(() => { activeModalRef.current = activeModal; }, [activeModal]);
  useEffect(() => { activeFlowRef.current = activeFlow; }, [activeFlow]);
  useEffect(() => { busesRef.current = buses; }, [buses]);
  useEffect(() => { routesRef.current = routes; }, [routes]);
  useEffect(() => { addToScenarioQueueRef.current = addToScenarioQueue; }, [addToScenarioQueue]);

  // Generate scenarios - simple fixed interval (uses refs to avoid restarting)
  useEffect(() => {
    console.log('🔄 Scenario effect started');

    const triggerScenario = () => {
      console.log('⏰ Trigger check - modal:', !!activeModalRef.current, 'flow:', !!activeFlowRef.current);

      // Don't trigger if modal is already open
      if (activeModalRef.current || activeFlowRef.current) {
        console.log('⏸️ Skipping - modal or flow active');
        return;
      }

      const currentBuses = busesRef.current;
      const currentRoutes = routesRef.current;

      if (currentBuses.length === 0) {
        console.log('⏸️ Skipping - no buses');
        return;
      }

      const scenario = generateRandomScenario(currentBuses, currentRoutes);
      if (scenario) {
        console.log('🚀 Triggering scenario:', scenario.type, 'for bus:', scenario.busId);
        setSpeed(1);
        setActiveModal(scenario);
        // Add to KorAllThing scenario queue
        addToScenarioQueueRef.current({
          id: scenario.id,
          type: scenario.type,
          busId: scenario.busId,
          busName: scenario.busName,
          message: scenario.message,
          status: 'pending',
        });
        if (scenario.busId) {
          setPendingDecision({
            busId: scenario.busId,
            type: scenario.type,
            message: scenario.message,
          });
          console.log('📍 Set pendingDecision for:', scenario.busId);
        }
      }
    };

    // First scenario after 1.5 seconds (quick start)
    const initialTimeout = setTimeout(triggerScenario, 1500);

    // Then every 5 seconds
    const interval = setInterval(triggerScenario, 5000);

    return () => {
      console.log('🧹 Scenario effect cleanup');
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [setSpeed, setPendingDecision]); // Only stable dependencies

  const handleAction = useCallback((decision, actionId) => {
    const option = decision.options?.find(o => o.id === actionId);
    setActiveModal(null);
    // Track scenario ID for KorAllThing
    activeScenarioIdRef.current = decision.id;
    // Update scenario status to active
    updateScenarioStatus(decision.id, 'active');
    // Show the flow visualization
    setActiveFlow(option);
  }, [updateScenarioStatus]);

  const handleFlowComplete = useCallback(() => {
    if (activeFlow) {
      setActivityLog(prev => [{
        timestamp: Date.now(),
        action: `${activeFlow.label}`,
        type: 'approved'
      }, ...prev].slice(0, 6));
      setStats(s => ({ ...s, approved: s.approved + 1 }));
    }
    // Mark scenario as completed in KorAllThing
    if (activeScenarioIdRef.current) {
      updateScenarioStatus(activeScenarioIdRef.current, 'completed');
      activeScenarioIdRef.current = null;
    }
    setActiveFlow(null);
    // Clear bus highlighting when decision flow is complete
    clearPendingDecision();
  }, [activeFlow, clearPendingDecision, updateScenarioStatus]);

  const handleTimeout = useCallback((decision) => {
    const recommended = decision.options?.find(o => o.recommended);
    // Apply AI takeover effect to simulation
    handleDecisionTimeout(decision, simulationContext);
    // Mark scenario as timeout in KorAllThing
    updateScenarioStatus(decision.id, 'timeout');
    // Update stats
    setStats(s => ({ ...s, timeout: s.timeout + 1 }));
    setActiveModal(null);
    // Show flow for auto-selected option
    setActiveFlow({ ...recommended, label: `AUTO: ${recommended?.label || 'Timeout'}`, isAuto: true });
  }, [simulationContext, updateScenarioStatus]);

  const handleExpand = useCallback((decision) => {
    setDecisions(prev => prev.filter(d => d.id !== decision.id));
    setActiveModal(decision);
  }, []);

  const activeBuses = buses.filter(b => b.state === BUS_STATES.DRIVING).length;
  const chargingBuses = buses.filter(b => b.state === BUS_STATES.CHARGING).length;
  const avgBattery = buses.length > 0 ? Math.round(buses.reduce((sum, b) => sum + b.batteryLevel, 0) / buses.length) : 0;
  const criticalBuses = buses.filter(b => b.batteryLevel < 20).length;

  return (
    <div className="absolute inset-0 pointer-events-none">
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
      <StatPanel label="Aktivno" value={activeBuses} unit={`/${buses.length}`} icon={Activity} color="text-cyan-400" position="top-20 left-6" />
      <StatPanel label="Punjenje" value={chargingBuses} unit="bus" icon={Zap} color="text-emerald-400" position="top-36 left-6" />
      <StatPanel label="Baterija" value={avgBattery} unit="%" icon={Battery} color={avgBattery > 50 ? "text-emerald-400" : "text-amber-400"} position="top-52 left-6" />

      {/* Bus list panel */}
      <BusListPanel
        buses={buses}
        routes={routes}
        selectedItem={selectedItem}
        onSelectBus={(busId) => selectItem('bus', busId)}
        onOpenModal={(busId) => {
          selectItem('bus', busId);
          setShowBusModal(true);
        }}
      />

      {/* Quick bus info - shows when bus is selected */}
      <AnimatePresence>
        {selectedItem?.type === 'bus' && (
          <BusQuickInfo
            bus={buses.find(b => b.id === selectedItem.id)}
            route={routes.find(r => r.id === buses.find(b => b.id === selectedItem.id)?.routeId)}
            onClose={clearSelection}
            onOpenDetails={() => setShowBusModal(true)}
          />
        )}
      </AnimatePresence>

      {/* Right panel - decisions queue */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-20 right-6 w-64 pointer-events-auto"
      >
        <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono text-white/80">AI KONTROLA</span>
              {pendingDecision && (
                <span className="ml-2 px-1.5 py-0.5 bg-orange-500/20 border border-orange-500/50 rounded text-[9px] text-orange-400 animate-pulse">
                  {pendingDecision.busId}
                </span>
              )}
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
                {pendingDecision && (
                  <p className="text-[10px] text-orange-400 mt-2">
                    🔶 {pendingDecision.busId} čeka odluku
                  </p>
                )}
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

      {/* Fleet Statistics Panel - left side */}
      <div className="absolute top-[30rem] left-6 w-52 pointer-events-auto">
        <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
          <div className="px-2.5 py-2 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-mono text-white/80 uppercase">Fleet Stats</span>
            </div>
          </div>
          <div className="p-2.5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-500">Pređeno danas</span>
              <span className="text-sm font-mono font-bold text-white">{Math.floor(buses.length * 47.3)} <span className="text-[9px] text-slate-500">km</span></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-500">Energija</span>
              <span className="text-sm font-mono font-bold text-cyan-400">{Math.floor(buses.length * 12.8)} <span className="text-[9px] text-slate-500">kWh</span></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-500">CO₂ ušteda</span>
              <span className="text-sm font-mono font-bold text-emerald-400">{Math.floor(buses.length * 8.2)} <span className="text-[9px] text-slate-500">kg</span></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-500">Efikasnost</span>
              <span className="text-sm font-mono font-bold text-amber-400">94.2<span className="text-[9px] text-slate-500">%</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Predictions Panel - left side */}
      <div className="absolute top-[36rem] left-6 w-52 pointer-events-auto">
        <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
          <div className="px-2.5 py-2 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px] font-mono text-white/80 uppercase">AI Predikcije</span>
            </div>
          </div>
          <div className="p-2.5 space-y-2">
            {buses.filter(b => b.batteryLevel < 40).slice(0, 3).map((bus, i) => {
              const timeToEmpty = Math.floor((bus.batteryLevel / 100) * 180);
              return (
                <div key={bus.id} className="flex items-center gap-2 p-1.5 bg-amber-500/10 rounded border border-amber-500/20">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-white truncate">{bus.name}</div>
                    <div className="text-[9px] text-amber-400">Punjenje za ~{timeToEmpty} min</div>
                  </div>
                </div>
              );
            })}
            {buses.filter(b => b.batteryLevel < 40).length === 0 && (
              <div className="text-center py-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-[10px] text-slate-500">Nema upozorenja</div>
              </div>
            )}
            <div className="pt-2 border-t border-white/10 flex justify-between text-[9px]">
              <span className="text-slate-500">Sledeći swap</span>
              <span className="text-purple-400 font-mono">~{Math.floor(Math.random() * 30) + 15} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Widgets - left side, second column - expanded */}
      <div className="absolute top-20 left-[14.5rem] w-56 space-y-2 pointer-events-auto">
        <GridStatusWidgetExpanded />
        <EnergySparklineWidgetExpanded buses={buses} />
        <AlarmLogWidgetExpanded activityLog={activityLog} />
        <MaintenanceWidgetExpanded buses={buses} chargingStations={chargingStations} />
      </div>

      {/* Robot & Swap Panel - left bottom */}
      <div className="absolute bottom-20 left-6 w-52 pointer-events-auto">
        <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
          <div className="px-2.5 py-2 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px] font-mono text-white/80 uppercase">Robot Sistem</span>
            </div>
          </div>
          <div className="p-2.5">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-4 h-4 rounded-full bg-cyan-500/30 flex items-center justify-center text-[8px] font-bold text-cyan-400">A</div>
                  <span className="text-[9px] text-slate-400">Bus Robot</span>
                </div>
                <div className="text-[10px] text-cyan-400 font-medium">AKTIVAN</div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-4 h-4 rounded-full bg-purple-500/30 flex items-center justify-center text-[8px] font-bold text-purple-400">B</div>
                  <span className="text-[9px] text-slate-400">Station</span>
                </div>
                <div className="text-[10px] text-purple-400 font-medium">STANDBY</div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="text-[10px] text-slate-500">Swapovi danas</span>
              <span className="text-sm font-mono font-bold text-white">{Math.floor(Math.random() * 8) + 3}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charging Statistics - right side */}
      <div className="absolute top-[22rem] right-6 w-64 pointer-events-auto">
        <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-mono text-white/80 uppercase">Punjenje</span>
            </div>
          </div>
          <div className="p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 rounded p-2">
                <div className="text-[9px] text-slate-500 mb-0.5">Aktivno</div>
                <div className="text-lg font-mono font-bold text-emerald-400">{chargingBuses}</div>
              </div>
              <div className="bg-white/5 rounded p-2">
                <div className="text-[9px] text-slate-500 mb-0.5">U redu</div>
                <div className="text-lg font-mono font-bold text-amber-400">{Math.max(0, buses.filter(b => b.batteryLevel < 30).length - chargingBuses)}</div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-500">Ukupna snaga</span>
              <span className="text-sm font-mono font-bold text-white">{chargingStations.reduce((s, st) => s + st.currentPower, 0)} <span className="text-[9px] text-slate-500">kW</span></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-500">Napunjeno danas</span>
              <span className="text-sm font-mono font-bold text-cyan-400">{Math.floor(buses.length * 34.7)} <span className="text-[9px] text-slate-500">kWh</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Route Performance - right side */}
      <div className="absolute top-[34rem] right-[18rem] w-56 pointer-events-auto">
        <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <Route className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-mono text-white/80 uppercase">Rute</span>
            </div>
          </div>
          <div className="p-2.5 space-y-1.5">
            {routes.slice(0, 4).map((route, i) => {
              const busesOnRoute = buses.filter(b => b.routeId === route.id).length;
              const avgBattery = buses.filter(b => b.routeId === route.id).reduce((sum, b) => sum + b.batteryLevel, 0) / Math.max(1, busesOnRoute);
              return (
                <div key={route.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: route.color }} />
                  <span className="text-[10px] text-slate-400 flex-1 truncate">{route.name}</span>
                  <span className="text-[9px] font-mono text-white">{busesOnRoute} bus</span>
                  <span className={`text-[9px] font-mono ${avgBattery > 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {Math.round(avgBattery)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Live Flow Panel - right side */}
      <AILiveFlowPanel
        decisions={decisions}
        activeModal={activeModal}
        activityLog={activityLog}
        buses={buses}
        chargingStations={chargingStations}
      />

      {/* EK3 Module Health - right side */}
      <div className="absolute top-[34rem] right-6 w-64 pointer-events-auto">
        <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] font-mono text-white/80 uppercase">EK3 Moduli</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400">98.7% HEALTH</span>
            </div>
          </div>
          <div className="p-3">
            <div className="space-y-1.5">
              {chargingStations.slice(0, 3).map((station, i) => (
                <div key={station.id} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-[10px] text-slate-400 flex-1 truncate">{station.name}</span>
                  <span className="text-[10px] font-mono text-white">{84 - i * 2} modula</span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-white/10 flex justify-between">
              <span className="text-[9px] text-slate-500">Sledeći swap</span>
              <span className="text-[10px] font-mono text-amber-400">~{Math.floor(Math.random() * 20) + 10} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Activity Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl px-6 py-3">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Bus className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase">Flota</div>
                <div className="text-sm font-mono font-bold text-white">{activeBuses}/{buses.length}</div>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Battery className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase">Prosek</div>
                <div className="text-sm font-mono font-bold text-emerald-400">{avgBattery}%</div>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase">Snaga</div>
                <div className="text-sm font-mono font-bold text-purple-400">{chargingStations.reduce((s, st) => s + st.currentPower, 0)} kW</div>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${criticalBuses > 0 ? 'bg-red-500/20' : 'bg-slate-500/20'}`}>
                <AlertTriangle className={`w-4 h-4 ${criticalBuses > 0 ? 'text-red-400' : 'text-slate-500'}`} />
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase">Kritično</div>
                <div className={`text-sm font-mono font-bold ${criticalBuses > 0 ? 'text-red-400' : 'text-slate-500'}`}>{criticalBuses}</div>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-slate-400">SISTEM OK</span>
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
            onFlowComplete={(option) => {
              // Apply the decision effect to simulation
              applyDecisionEffect(activeModal, option, simulationContext);
              // Update activity log
              setActivityLog(prev => [{
                timestamp: Date.now(),
                action: option.label,
                type: 'approved'
              }, ...prev].slice(0, 6));
              setStats(s => ({ ...s, approved: s.approved + 1 }));
              setActiveModal(null);
              clearPendingDecision();
            }}
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
        {showBusModal && selectedItem?.type === 'bus' && (
          <BusDetailModal
            bus={buses.find(b => b.id === selectedItem.id)}
            routes={routes}
            onClose={() => {
              setShowBusModal(false);
              clearSelection();
            }}
          />
        )}
      </AnimatePresence>

      {/* Station detail modal */}
      <AnimatePresence>
        {showStationModal && selectedItem?.type === 'station' && (
          <StationDetailModal
            station={chargingStations.find(s => s.id === selectedItem.id)}
            buses={buses}
            onClose={() => {
              setShowStationModal(false);
              clearSelection();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
