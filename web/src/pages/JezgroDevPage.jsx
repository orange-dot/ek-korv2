import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Home,
  Cpu,
  Package,
  Wrench,
  Terminal,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Zap,
  Network,
  Shield,
  RotateCcw,
  MessageSquare,
  Clock,
  Wifi,
  Lock,
  Layers,
  ArrowRight,
  Star,
} from 'lucide-react';
import PasswordGate from '../components/PasswordGate';

// Development Options
const DEV_OPTIONS = [
  {
    id: 'stm32',
    name: 'STM32',
    subtitle: { en: 'Recommended Start', sr: 'Preporučeni početak' },
    color: 'blue',
    icon: Cpu,
    entry: '€290',
    full: '€605',
    badges: [
      { en: 'Best Ecosystem', sr: 'Najbolji ekosistem' },
      { en: 'Fast Start', sr: 'Brz početak' },
    ],
  },
  {
    id: 'aurix',
    name: 'AURIX',
    subtitle: { en: 'Safety-Critical', sr: 'Bezbednosno-kritičan' },
    color: 'purple',
    icon: Shield,
    entry: '€165',
    full: '€830',
    badges: [
      { en: 'ASIL-D', sr: 'ASIL-D' },
      { en: 'Lockstep', sr: 'Lockstep' },
    ],
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    subtitle: { en: 'Ultimate: AURIX + XMC4400/C2000 + ESP32', sr: 'Ultimate: AURIX + XMC4400/C2000 + ESP32' },
    color: 'emerald',
    icon: Layers,
    entry: '€210',
    full: '€1,100',
    badges: [
      { en: 'ASIL-D', sr: 'ASIL-D' },
      { en: '150ps PWM', sr: '150ps PWM' },
      { en: 'WiFi/OTA', sr: 'WiFi/OTA' },
      { en: 'Renode OK', sr: 'Renode OK' },
    ],
  },
];

// Technical comparison
const TECH_COMPARISON = [
  { spec: { en: 'Primary MCU', sr: 'Primarni MCU' }, stm32: 'STM32G474', aurix: 'TC375/TC397', hybrid: 'AURIX + XMC4400 + ESP32' },
  { spec: { en: 'Architecture', sr: 'Arhitektura' }, stm32: 'Cortex-M4', aurix: 'TriCore (3 cores)', hybrid: 'TriCore + ARM + Xtensa' },
  { spec: { en: 'Clock Speed', sr: 'Takt' }, stm32: '170 MHz', aurix: '300 MHz', hybrid: '300 + 100 + 240 MHz' },
  { spec: { en: 'RAM', sr: 'RAM' }, stm32: '128 KB', aurix: '768 KB', hybrid: '768 + 100 + 512 KB' },
  { spec: { en: 'PWM Resolution', sr: 'PWM rezolucija' }, stm32: '5.9 ns', aurix: '6.5 ns', hybrid: '150 ps', hybridHighlight: true },
  { spec: { en: 'Safety Cert', sr: 'Bezbed. sert.' }, stm32: '—', aurix: 'ASIL-D', aurixHighlight: true, hybrid: 'ASIL-D', hybridHighlight: true },
  { spec: { en: 'Hardware Lockstep', sr: 'HW Lockstep' }, stm32: '—', aurix: '✓', aurixHighlight: true, hybrid: '✓', hybridHighlight: true },
  { spec: { en: 'WiFi/OTA', sr: 'WiFi/OTA' }, stm32: '—', aurix: '—', hybrid: '✓', hybridHighlight: true },
];

// Investment phases
const INVESTMENT = [
  { phase: { en: 'Phase 1: Kernel', sr: 'Faza 1: Kernel' }, stm32: '€290', aurix: '€165', hybrid: '€210' },
  { phase: { en: 'Phase 2: CAN-FD Swarm', sr: 'Faza 2: CAN-FD roj' }, stm32: '€410', aurix: '€430', hybrid: '€550' },
  { phase: { en: 'Phase 3: Full System', sr: 'Faza 3: Kompletan sistem' }, stm32: '€605', aurix: '€830', hybrid: '€1,100' },
  { phase: { en: 'Phase 4: Production', sr: 'Faza 4: Proizvodnja' }, stm32: '€770', aurix: '€1,030', hybrid: '€1,400' },
];

// Complexity factors
const COMPLEXITY = [
  { factor: { en: 'Learning Curve', sr: 'Krivulja učenja' }, stm32: { en: 'Low', sr: 'Niska' }, aurix: { en: 'Medium', sr: 'Srednja' }, hybrid: { en: 'High', sr: 'Visoka' } },
  { factor: { en: 'Toolchains', sr: 'Toolchain-ovi' }, stm32: '1', aurix: '1', hybrid: '3' },
  { factor: { en: 'Time to First Boot', sr: 'Vreme do prvog boot-a' }, stm32: { en: '1 day', sr: '1 dan' }, aurix: { en: '3 days', sr: '3 dana' }, hybrid: { en: '7 days', sr: '7 dana' } },
];

// STM32 Development phases
const STM32_PHASES = [
  {
    id: 'kernel',
    phase: '1',
    title: { en: 'Kernel Core', sr: 'Jezgro kernela' },
    hardware: { en: 'Included in start kit', sr: 'Uključeno u starter kit' },
    icon: Cpu,
    goals: [
      { en: 'Boot sequence and clock configuration', sr: 'Sekvenca pokretanja i konfiguracija takta' },
      { en: 'EDF scheduler implementation', sr: 'Implementacija EDF raspoređivača' },
      { en: 'Context switch with MPU reconfiguration', sr: 'Prebacivanje konteksta sa MPU rekonfiguracijom' },
      { en: 'Basic task creation and management', sr: 'Osnovno kreiranje i upravljanje taskovima' },
      { en: 'Kernel tick timer (SysTick)', sr: 'Kernel tick tajmer (SysTick)' },
    ],
  },
  {
    id: 'mpu',
    phase: '2',
    title: { en: 'Fault Isolation', sr: 'Izolacija grešaka' },
    hardware: { en: 'Same as Phase 1', sr: 'Isto kao Faza 1' },
    icon: Shield,
    goals: [
      { en: 'MPU region configuration', sr: 'Konfiguracija MPU regiona' },
      { en: 'MemManage fault handler', sr: 'MemManage handler za greške' },
      { en: 'Stack overflow detection', sr: 'Detekcija prekoračenja steka' },
      { en: 'Service memory isolation', sr: 'Izolacija memorije servisa' },
      { en: 'Privilege level separation', sr: 'Razdvajanje nivoa privilegija' },
    ],
  },
  {
    id: 'ipc',
    phase: '3',
    title: { en: 'IPC System', sr: 'IPC sistem' },
    hardware: { en: 'Same as Phase 1', sr: 'Isto kao Faza 1' },
    icon: MessageSquare,
    goals: [
      { en: 'Message pool allocation (lock-free)', sr: 'Alokacija pool-a poruka (bez zaključavanja)' },
      { en: 'Synchronous send/receive', sr: 'Sinhrono slanje/primanje' },
      { en: 'Asynchronous messaging', sr: 'Asinhrono prosleđivanje poruka' },
      { en: 'Broadcast mechanism', sr: 'Mehanizam emitovanja' },
      { en: 'Service mailboxes', sr: 'Poštanski sandučići servisa' },
    ],
  },
  {
    id: 'reincarnation',
    phase: '4',
    title: { en: 'Reincarnation Server', sr: 'Server za reinkarnaciju' },
    hardware: { en: 'Same as Phase 1', sr: 'Isto kao Faza 1' },
    icon: RotateCcw,
    goals: [
      { en: 'Per-service watchdog monitoring', sr: 'Watchdog monitoring po servisu' },
      { en: 'Automatic fault detection', sr: 'Automatska detekcija grešaka' },
      { en: 'Service restart without system reset', sr: 'Restart servisa bez reseta sistema' },
      { en: 'State preservation hooks', sr: 'Hook-ovi za očuvanje stanja' },
      { en: 'Exponential backoff for repeated failures', sr: 'Eksponencijalno odlaganje za ponovljene greške' },
    ],
  },
  {
    id: 'canfd',
    phase: '5',
    title: { en: 'CAN-FD Integration', sr: 'CAN-FD integracija' },
    hardware: { en: '+ 10× CAN transceiver + Canable', sr: '+ 10× CAN primopredajnik + Canable' },
    icon: Network,
    goals: [
      { en: 'CAN-FD driver (5 Mbps)', sr: 'CAN-FD drajver (5 Mbps)' },
      { en: 'CAN ↔ IPC message translation', sr: 'Prevođenje CAN ↔ IPC poruka' },
      { en: 'Multi-node communication', sr: 'Komunikacija više čvorova' },
      { en: 'Message routing', sr: 'Rutiranje poruka' },
    ],
  },
  {
    id: 'swarm',
    phase: '6',
    title: { en: 'Swarm Testing', sr: 'Testiranje roja' },
    hardware: { en: '+ Logic analyzer + UART adapters', sr: '+ Logički analizator + UART adapteri' },
    icon: Zap,
    goals: [
      { en: 'Leader election (Raft-inspired)', sr: 'Izbor lidera (inspirisano Raft-om)' },
      { en: 'Heartbeat protocol', sr: 'Heartbeat protokol' },
      { en: 'Distributed consensus', sr: 'Distribuirani konsenzus' },
      { en: 'Fault tolerance testing', sr: 'Testiranje tolerancije na greške' },
    ],
  },
  {
    id: 'prototype',
    phase: '7',
    title: { en: 'Production Prototype', sr: 'Proizvodni prototip' },
    hardware: { en: '+ 5× Custom PCB boards', sr: '+ 5× Prilagođene PCB ploče' },
    icon: Package,
    goals: [
      { en: 'Custom hardware validation', sr: 'Validacija prilagođenog hardvera' },
      { en: 'Thermal testing', sr: 'Termalno testiranje' },
      { en: 'EMC pre-compliance', sr: 'EMC pred-usklađenost' },
      { en: 'Production-representative performance', sr: 'Performanse reprezentativne za proizvodnju' },
    ],
  },
];

// AURIX phases
const AURIX_PHASES = [
  {
    id: 'kernel',
    phase: '1',
    title: { en: 'Kernel Development', sr: 'Razvoj kernela' },
    hardware: { en: '2× TC375 Lite Kit (~€165)', sr: '2× TC375 Lite Kit (~€165)' },
    icon: Cpu,
    goals: [
      { en: 'TriCore architecture familiarization', sr: 'Upoznavanje sa TriCore arhitekturom' },
      { en: 'Multi-core boot sequence', sr: 'Višejezgarni boot sekvenca' },
      { en: 'Lockstep configuration (CPU0/CPU1)', sr: 'Lockstep konfiguracija (CPU0/CPU1)' },
      { en: 'Safety core (CPU2) initialization', sr: 'Inicijalizacija safety jezgra (CPU2)' },
      { en: 'HSM secure boot setup', sr: 'HSM secure boot podešavanje' },
    ],
  },
  {
    id: 'swarm',
    phase: '2',
    title: { en: 'CAN-FD Swarm', sr: 'CAN-FD roj' },
    hardware: { en: '+ 3× TC375 + CAN transceivers (~€265)', sr: '+ 3× TC375 + CAN primopredajnici (~€265)' },
    icon: Network,
    goals: [
      { en: 'CAN-FD driver (4 instances)', sr: 'CAN-FD drajver (4 instance)' },
      { en: '5-node swarm coordination', sr: 'Koordinacija roja od 5 čvorova' },
      { en: 'Distributed safety monitoring', sr: 'Distribuirani safety monitoring' },
      { en: 'FlexRay evaluation (optional)', sr: 'FlexRay evaluacija (opciono)' },
    ],
  },
  {
    id: 'safety',
    phase: '3',
    title: { en: 'Safety Validation', sr: 'Validacija bezbednosti' },
    hardware: { en: '+ TC397 Application Kit (~€400)', sr: '+ TC397 Application Kit (~€400)' },
    icon: Shield,
    goals: [
      { en: 'SafeTlib integration', sr: 'SafeTlib integracija' },
      { en: 'ASIL-D compliance testing', sr: 'Testiranje ASIL-D usklađenosti' },
      { en: 'Lockstep fault injection', sr: 'Lockstep fault injection' },
      { en: 'HSM crypto validation', sr: 'HSM kripto validacija' },
    ],
  },
];

// Hybrid phases
const HYBRID_PHASES = [
  {
    id: 'triad',
    phase: '1',
    title: { en: 'Triple-MCU Core', sr: 'Triple-MCU jezgro' },
    hardware: { en: 'AURIX + XMC4400 + ESP32 (~€210)', sr: 'AURIX + XMC4400 + ESP32 (~€210)' },
    icon: Layers,
    goals: [
      { en: 'AURIX TC375 JEZGRO coordinator (ASIL-D)', sr: 'AURIX TC375 JEZGRO koordinator (ASIL-D)' },
      { en: 'XMC4400 power control (150ps HRPWM, Renode OK)', sr: 'XMC4400 kontrola snage (150ps HRPWM, Renode OK)' },
      { en: 'ESP32-S3 WiFi/BT gateway + OTA', sr: 'ESP32-S3 WiFi/BT gateway + OTA' },
      { en: 'CAN-FD + UART inter-MCU bridge', sr: 'CAN-FD + UART međuprocesni most' },
    ],
  },
  {
    id: 'integration',
    phase: '2',
    title: { en: 'Full Integration', sr: 'Puna integracija' },
    hardware: { en: '+ 2× AURIX + 2× XMC4400 + CAN (~€360)', sr: '+ 2× AURIX + 2× XMC4400 + CAN (~€360)' },
    icon: Network,
    goals: [
      { en: 'Multi-node AURIX swarm (lockstep)', sr: 'Višečvorni AURIX roj (lockstep)' },
      { en: 'Distributed XMC4400 power stages (Renode testable)', sr: 'Distribuirani XMC4400 stepeni snage (Renode OK)' },
      { en: 'Cloud telemetry via ESP32', sr: 'Cloud telemetrija preko ESP32' },
      { en: 'OTA firmware update system', sr: 'OTA sistem za ažuriranje firmware-a' },
    ],
  },
  {
    id: 'swarm',
    phase: '3',
    title: { en: 'Production System', sr: 'Proizvodni sistem' },
    hardware: { en: '+ TC397 + custom PCB (~€550)', sr: '+ TC397 + custom PCB (~€550)' },
    icon: Zap,
    goals: [
      { en: 'TC397 Application Kit validation', sr: 'TC397 Application Kit validacija' },
      { en: 'ASIL-D + EMC compliance testing', sr: 'Testiranje ASIL-D + EMC usklađenosti' },
      { en: 'Integrated safety + power + cloud', sr: 'Integrisani safety + power + cloud' },
      { en: 'Production-ready prototype', sr: 'Prototip spreman za proizvodnju' },
    ],
  },
];

// Starter kits per option
const STARTER_KITS = {
  stm32: [
    { item: { en: 'NUCLEO-G474RE', sr: 'NUCLEO-G474RE' }, qty: 10, price: '€240' },
    { item: { en: 'USB Micro-B cables', sr: 'USB Micro-B kablovi' }, qty: 10, price: '€30' },
    { item: { en: '10-port powered USB hub', sr: '10-portni USB hub sa napajanjem' }, qty: 1, price: '€20' },
  ],
  aurix: [
    { item: { en: 'AURIX TC375 Lite Kit', sr: 'AURIX TC375 Lite Kit' }, qty: 2, price: '€140' },
    { item: { en: 'USB cables', sr: 'USB kablovi' }, qty: 4, price: '€8' },
    { item: { en: 'Jumper wires + breadboards', sr: 'Žice + breadboard' }, qty: 1, price: '€17' },
  ],
  hybrid: [
    { item: { en: 'AURIX TC375 Lite Kit', sr: 'AURIX TC375 Lite Kit' }, qty: 2, price: '€140' },
    { item: { en: 'XMC4400 PLT2GO (150ps HRPWM)', sr: 'XMC4400 PLT2GO (150ps HRPWM)' }, qty: 1, price: '€35' },
    { item: { en: 'ESP32-S3-DevKitC-1', sr: 'ESP32-S3-DevKitC-1' }, qty: 1, price: '€10' },
    { item: { en: 'CAN + cables + jumpers', sr: 'CAN + kablovi + žice' }, qty: 1, price: '€25' },
  ],
};

// Decision guide
const DECISION_GUIDE = [
  {
    question: { en: 'Need ASIL-D + 150ps PWM + WiFi/OTA?', sr: 'Treba ASIL-D + 150ps PWM + WiFi/OTA?' },
    yes: 'hybrid',
    no: 'next',
  },
  {
    question: { en: 'Need ASIL-D certification only?', sr: 'Treba samo ASIL-D sertifikacija?' },
    yes: 'aurix',
    no: 'next',
  },
  {
    question: { en: 'Fast PoC, best ecosystem, lowest cost?', sr: 'Brz PoC, najbolji ekosistem, najniža cena?' },
    yes: 'stm32',
    no: 'stm32',
  },
];

// Toolchains per option
const TOOLCHAINS = {
  stm32: [
    { tool: 'VS Code', purpose: { en: 'Editor/IDE', sr: 'Editor/IDE' } },
    { tool: 'ARM GCC', purpose: { en: 'Compiler', sr: 'Kompajler' } },
    { tool: 'OpenOCD', purpose: { en: 'Debugger/flasher', sr: 'Debager/flešer' } },
    { tool: 'Cortex-Debug', purpose: { en: 'VS Code extension', sr: 'VS Code ekstenzija' } },
  ],
  aurix: [
    { tool: 'AURIX Dev Studio', purpose: { en: 'IDE (Eclipse)', sr: 'IDE (Eclipse)' } },
    { tool: 'TriCore GCC', purpose: { en: 'Compiler', sr: 'Kompajler' } },
    { tool: 'iLLD', purpose: { en: 'Low Level Drivers', sr: 'Drajveri niskog nivoa' } },
    { tool: 'SafeTlib', purpose: { en: 'Safety library', sr: 'Bezbed. biblioteka' } },
  ],
  hybrid: [
    { tool: 'AURIX Dev Studio', purpose: { en: 'AURIX (safety)', sr: 'AURIX (safety)' } },
    { tool: 'DAVE IDE', purpose: { en: 'XMC4400 (power)', sr: 'XMC4400 (snaga)' } },
    { tool: 'ESP-IDF', purpose: { en: 'ESP32 (WiFi/OTA)', sr: 'ESP32 (WiFi/OTA)' } },
    { tool: 'Renode', purpose: { en: 'XMC4400 emulation', sr: 'XMC4400 emulacija' } },
  ],
};

function OptionCard({ option, lang, isSelected, onSelect }) {
  const Icon = option.icon;
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50',
    purple: 'border-purple-500 bg-purple-50',
    emerald: 'border-emerald-500 bg-emerald-50',
  };
  const iconColorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    emerald: 'bg-emerald-100 text-emerald-600',
  };
  const badgeColorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    emerald: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <button
      onClick={onSelect}
      className={`relative w-full p-4 rounded-xl border-2 transition-all text-left ${
        isSelected
          ? colorClasses[option.color]
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      {option.id === 'stm32' && (
        <div className="absolute -top-2 -right-2">
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-400 text-amber-900 text-xs font-medium rounded-full">
            <Star className="w-3 h-3" />
            {lang === 'sr' ? 'Preporučeno' : 'Recommended'}
          </span>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${iconColorClasses[option.color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900">{option.name}</h3>
          <p className="text-sm text-slate-500">{option.subtitle[lang]}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {option.badges.map((badge, idx) => (
              <span key={idx} className={`text-xs px-2 py-0.5 rounded-full ${badgeColorClasses[option.color]}`}>
                {badge[lang]}
              </span>
            ))}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {lang === 'sr' ? 'Od' : 'From'} {option.entry} → {option.full}
          </div>
        </div>
      </div>
    </button>
  );
}

function PhaseCard({ phase, lang, isExpanded, onToggle, color = 'blue' }) {
  const Icon = phase.icon;
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    emerald: 'bg-emerald-100 text-emerald-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors"
      >
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-xs font-medium text-slate-400">
            {lang === 'sr' ? 'Faza' : 'Phase'} {phase.phase}
          </div>
          <h3 className="font-medium text-slate-900">{phase.title[lang]}</h3>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 mt-3 mb-2">
            <Wrench className="w-3 h-3 inline mr-1" />
            {phase.hardware[lang]}
          </p>
          <ul className="space-y-1.5">
            {phase.goals.map((goal, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                <Circle className="w-3 h-3 mt-1 text-slate-300" />
                {goal[lang]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function JezgroDevContent() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'sr' ? 'sr' : 'en';
  const [selectedOption, setSelectedOption] = useState('stm32');
  const [expandedPhases, setExpandedPhases] = useState(['kernel', 'triad']);
  const [showDecisionGuide, setShowDecisionGuide] = useState(false);

  const togglePhase = (id) => {
    setExpandedPhases((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const currentOption = DEV_OPTIONS.find((o) => o.id === selectedOption);
  const phases = selectedOption === 'stm32' ? STM32_PHASES : selectedOption === 'aurix' ? AURIX_PHASES : HYBRID_PHASES;
  const starterKit = STARTER_KITS[selectedOption];
  const toolchain = TOOLCHAINS[selectedOption];

  const colorMap = {
    stm32: 'blue',
    aurix: 'purple',
    hybrid: 'emerald',
  };

  const gradientMap = {
    stm32: 'from-blue-600 to-blue-700',
    aurix: 'from-purple-600 to-purple-700',
    hybrid: 'from-emerald-600 to-emerald-700',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Home className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {lang === 'sr' ? 'JEZGRO razvojne opcije' : 'JEZGRO Development Options'}
              </h1>
              <p className="text-sm text-slate-500">
                {lang === 'sr' ? 'Microkernel RTOS za power electronics' : 'Microkernel RTOS for power electronics'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Option Selector */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900">
              {lang === 'sr' ? 'Izaberite platformu' : 'Select Platform'}
            </h2>
            <button
              onClick={() => setShowDecisionGuide(!showDecisionGuide)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {lang === 'sr' ? 'Pomoć pri izboru' : 'Help me choose'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Decision Guide */}
          {showDecisionGuide && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <h3 className="font-medium text-amber-900 mb-3">
                {lang === 'sr' ? 'Vodič za brzu odluku' : 'Quick Decision Guide'}
              </h3>
              <div className="space-y-2 text-sm">
                {DECISION_GUIDE.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-amber-700">{item.question[lang]}</span>
                    <span className="text-amber-500">→</span>
                    <span className="font-medium text-amber-900">
                      {item.yes === 'aurix' ? 'AURIX' : item.yes === 'hybrid' ? 'Hybrid' : 'STM32'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-3">
            {DEV_OPTIONS.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                lang={lang}
                isSelected={selectedOption === option.id}
                onSelect={() => setSelectedOption(option.id)}
              />
            ))}
          </div>
        </div>

        {/* Technical Comparison */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">
              {lang === 'sr' ? 'Tehničko poređenje' : 'Technical Comparison'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-2 text-left font-medium text-slate-600">
                    {lang === 'sr' ? 'Specifikacija' : 'Specification'}
                  </th>
                  <th className="px-4 py-2 text-center font-medium text-blue-600">STM32</th>
                  <th className="px-4 py-2 text-center font-medium text-purple-600">AURIX</th>
                  <th className="px-4 py-2 text-center font-medium text-emerald-600">Hybrid</th>
                </tr>
              </thead>
              <tbody>
                {TECH_COMPARISON.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-700">{row.spec[lang]}</td>
                    <td className={`px-4 py-2 text-center text-slate-800 ${selectedOption === 'stm32' ? 'bg-blue-100 font-semibold text-blue-900' : ''}`}>
                      {row.stm32}
                    </td>
                    <td className={`px-4 py-2 text-center text-slate-800 ${selectedOption === 'aurix' ? 'bg-purple-100 font-semibold text-purple-900' : ''} ${row.aurixHighlight ? 'text-purple-700 font-semibold' : ''}`}>
                      {row.aurix}
                    </td>
                    <td className={`px-4 py-2 text-center text-slate-800 ${selectedOption === 'hybrid' ? 'bg-emerald-100 font-semibold text-emerald-900' : ''} ${row.hybridHighlight ? 'text-emerald-700 font-semibold' : ''}`}>
                      {row.hybrid}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Investment Comparison */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">
              {lang === 'sr' ? 'Poređenje investicija' : 'Investment Comparison'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-2 text-left font-medium text-slate-600">
                    {lang === 'sr' ? 'Faza' : 'Phase'}
                  </th>
                  <th className="px-4 py-2 text-center font-medium text-blue-600">STM32</th>
                  <th className="px-4 py-2 text-center font-medium text-purple-600">AURIX</th>
                  <th className="px-4 py-2 text-center font-medium text-emerald-600">Hybrid</th>
                </tr>
              </thead>
              <tbody>
                {INVESTMENT.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-700">{row.phase[lang]}</td>
                    <td className={`px-4 py-2 text-center text-slate-800 ${selectedOption === 'stm32' ? 'bg-blue-100 font-semibold text-blue-900' : ''}`}>
                      {row.stm32}
                    </td>
                    <td className={`px-4 py-2 text-center text-slate-800 ${selectedOption === 'aurix' ? 'bg-purple-100 font-semibold text-purple-900' : ''}`}>
                      {row.aurix}
                    </td>
                    <td className={`px-4 py-2 text-center text-slate-800 ${selectedOption === 'hybrid' ? 'bg-emerald-100 font-semibold text-emerald-900' : ''}`}>
                      {row.hybrid}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Starter Kit */}
        <div className={`bg-gradient-to-br ${gradientMap[selectedOption]} rounded-2xl p-6 text-white`}>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              {currentOption.name} {lang === 'sr' ? 'Starter Kit' : 'Starter Kit'}
            </h2>
            <p className="text-white/80 text-sm mt-1">
              {currentOption.subtitle[lang]}
            </p>
          </div>

          <div className="bg-white/10 rounded-xl p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/70 text-left">
                  <th className="pb-2">{lang === 'sr' ? 'Stavka' : 'Item'}</th>
                  <th className="pb-2 text-right">{lang === 'sr' ? 'Kom' : 'Qty'}</th>
                  <th className="pb-2 text-right">{lang === 'sr' ? 'Cena' : 'Price'}</th>
                </tr>
              </thead>
              <tbody>
                {starterKit.map((item, idx) => (
                  <tr key={idx} className="border-t border-white/10">
                    <td className="py-2">{item.item[lang]}</td>
                    <td className="py-2 text-right">{item.qty}</td>
                    <td className="py-2 text-right">{item.price}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/20 font-semibold">
                  <td className="py-2">{lang === 'sr' ? 'Ukupno' : 'Total'}</td>
                  <td></td>
                  <td className="py-2 text-right">{currentOption.entry}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Toolchain */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-600" />
              {lang === 'sr' ? 'Toolchain (besplatno)' : 'Toolchain (free)'}
            </h3>
            <div className="space-y-2">
              {toolchain.map((tool, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-900">{tool.tool}</span>
                  <span className="text-slate-500">{tool.purpose[lang]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Complexity */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              {lang === 'sr' ? 'Složenost' : 'Complexity'}
            </h3>
            <div className="space-y-2">
              {COMPLEXITY.map((row, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{row.factor[lang]}</span>
                  <span className="font-medium text-slate-900">
                    {typeof row[selectedOption] === 'object' ? row[selectedOption][lang] : row[selectedOption]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Development Phases */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            {lang === 'sr' ? 'Faze razvoja' : 'Development Phases'} — {currentOption.name}
          </h2>
          <div className="space-y-2">
            {phases.map((phase) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                lang={lang}
                color={colorMap[selectedOption]}
                isExpanded={expandedPhases.includes(phase.id)}
                onToggle={() => togglePhase(phase.id)}
              />
            ))}
          </div>
        </div>

        {/* Architecture Diagrams */}
        {selectedOption === 'hybrid' && (
          <div className="bg-slate-900 rounded-2xl p-6 text-white font-mono text-xs overflow-x-auto">
            <h3 className="text-sm font-semibold mb-4 font-sans">
              {lang === 'sr' ? 'Hibridna arhitektura (Ultimate)' : 'Hybrid Architecture (Ultimate)'}
            </h3>
            <pre className="text-green-400 leading-relaxed">{`
                    ┌─────────────────────────────────────┐
                    │         Cloud / SCADA               │
                    └──────────────┬──────────────────────┘
                                   │ WiFi/MQTT
                    ┌──────────────▼──────────────────────┐
                    │     ESP32-S3 Communication Hub      │
                    │   • WiFi/BT gateway • OTA updates   │
                    └──────────────┬──────────────────────┘
                                   │ UART 1 Mbps
┌──────────────────────────────────┼──────────────────────────────────┐
│                          CAN-FD Bus (5 Mbps)                        │
└───────────────┬──────────────────┴──────────────────┬───────────────┘
                │                                     │
┌───────────────▼───────────────┐     ┌───────────────▼───────────────┐
│       AURIX TC375/TC397       │     │      Infineon XMC4400         │
│    JEZGRO Master (ASIL-D)     │     │     Power Controller          │
├───────────────────────────────┤     ├───────────────────────────────┤
│ • Lockstep (CPU0/CPU1)        │     │ • HRPWM 150 ps resolution     │
│ • Safety monitor (CPU2)       │     │ • ARM Cortex-M4 (Renode OK)   │
│ • HSM crypto                  │     │ • PFC + LLC control           │
│ • Swarm coordination          │     │ • Same vendor as AURIX        │
└───────────────────────────────┘     └───────────────────────────────┘
`}</pre>
          </div>
        )}

        {selectedOption === 'aurix' && (
          <div className="bg-slate-900 rounded-2xl p-6 text-white font-mono text-xs overflow-x-auto">
            <h3 className="text-sm font-semibold mb-4 font-sans">
              {lang === 'sr' ? 'AURIX TriCore arhitektura' : 'AURIX TriCore Architecture'}
            </h3>
            <pre className="text-purple-400 leading-relaxed">{`
┌─────────────────────────────────────────────────────────────┐
│                    AURIX TC375 (3 cores)                    │
├───────────────┬───────────────┬───────────────┬─────────────┤
│    CPU0       │     CPU1      │     CPU2      │    HSM      │
│   (Master)    │  (Lockstep)   │   (Safety)    │  (Crypto)   │
├───────────────┼───────────────┼───────────────┼─────────────┤
│ JEZGRO Kernel │ JEZGRO Mirror │ Safety        │ Secure boot │
│ Scheduler     │ (redundant)   │ Monitor       │ Key storage │
│ IPC Manager   │               │ Watchdog      │ Crypto accel│
└───────────────┴───────────────┴───────────────┴─────────────┘
        │               │
        └───────┬───────┘
                │
   Hardware Comparator (lockstep verification)
`}</pre>
          </div>
        )}

        {/* Migration Path */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">
            {lang === 'sr' ? 'Putanja migracije' : 'Migration Path'}
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            {lang === 'sr'
              ? 'Počnite sa STM32, migrirajte ako zahtevi to traže. Hybrid je ultimativna opcija.'
              : "Start with STM32, migrate if requirements demand. Hybrid is the ultimate option."}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
            <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">
              STM32 (PoC)
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 rotate-90 md:rotate-0" />
            <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg">
              AURIX (ASIL-D)
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 rotate-90 md:rotate-0" />
            <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium">
              Hybrid (ALL)
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center text-sm text-slate-500 pb-8">
          {lang === 'sr'
            ? 'Referenca: tehnika/inzenjersko/sr/19-jezgro-dev-alternatives.md'
            : 'Reference: tehnika/inzenjersko/en/19-jezgro-dev-alternatives.md'}
        </div>
      </div>
    </div>
  );
}

export default function JezgroDevPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'sr' ? 'sr' : 'en';

  return (
    <PasswordGate
      title={lang === 'sr' ? 'JEZGRO Razvojne Opcije' : 'JEZGRO Development Options'}
      storageKey="ek_jezgro_unlocked"
      password="gazdamilorad"
    >
      <JezgroDevContent />
    </PasswordGate>
  );
}
