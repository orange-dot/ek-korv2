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
} from 'lucide-react';
import PasswordGate from '../components/PasswordGate';

// Development phases data
const PHASES = [
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

// Starter kit BOM
const STARTER_KIT = [
  { item: { en: 'NUCLEO-G474RE', sr: 'NUCLEO-G474RE' }, qty: 10 },
  { item: { en: 'USB Micro-B cables', sr: 'USB Micro-B kablovi' }, qty: 10 },
  { item: { en: '10-port powered USB hub', sr: '10-portni USB hub sa napajanjem' }, qty: 1 },
];

// Toolchain
const TOOLCHAIN = [
  { tool: 'VS Code', purpose: { en: 'Editor/IDE', sr: 'Editor/IDE' }, url: 'code.visualstudio.com' },
  { tool: 'ARM GCC', purpose: { en: 'Compiler', sr: 'Kompajler' }, url: 'developer.arm.com' },
  { tool: 'OpenOCD', purpose: { en: 'Debugger/flasher', sr: 'Debuger/flešer' }, url: 'openocd.org' },
  { tool: 'Cortex-Debug', purpose: { en: 'VS Code extension', sr: 'VS Code ekstenzija' }, url: 'VS Code Marketplace' },
];

// Capabilities with 10 boards
const CAPABILITIES = [
  { name: { en: 'Kernel core', sr: 'Jezgro kernela' }, status: 'full' },
  { name: { en: 'EDF Scheduler', sr: 'EDF raspoređivač' }, status: 'full' },
  { name: { en: 'MPU manager', sr: 'MPU menadžer' }, status: 'full' },
  { name: { en: 'Context switching', sr: 'Prebacivanje konteksta' }, status: 'full' },
  { name: { en: 'IPC message passing', sr: 'IPC prosleđivanje poruka' }, status: 'full' },
  { name: { en: 'Reincarnation server', sr: 'Server za reinkarnaciju' }, status: 'full' },
  { name: { en: 'Watchdog system', sr: 'Watchdog sistem' }, status: 'full' },
  { name: { en: 'CAN-FD communication', sr: 'CAN-FD komunikacija' }, status: 'full' },
  { name: { en: 'Swarm coordination (10 nodes!)', sr: 'Koordinacija roja (10 čvorova!)' }, status: 'highlight' },
  { name: { en: 'Leader election', sr: 'Izbor lidera' }, status: 'full' },
  { name: { en: 'Fault tolerance', sr: 'Tolerancija grešaka' }, status: 'full' },
];

// Milestones
const MILESTONES = [
  {
    id: 1,
    title: { en: 'Kernel Boot', sr: 'Boot kernela' },
    checks: [
      { en: 'System boots to idle task', sr: 'Sistem se podiže do idle taska' },
      { en: 'Tick timer running', sr: 'Tick tajmer radi' },
      { en: 'Serial debug output working', sr: 'Serijski debug izlaz funkcioniše' },
    ],
  },
  {
    id: 2,
    title: { en: 'MPU Isolation', sr: 'MPU izolacija' },
    checks: [
      { en: 'Two tasks in separate MPU regions', sr: 'Dva taska u odvojenim MPU regionima' },
      { en: 'Fault in Task A does not crash Task B', sr: 'Greška u Tasku A ne ruši Task B' },
      { en: 'MemManage handler catches violations', sr: 'MemManage handler hvata prekršaje' },
    ],
  },
  {
    id: 3,
    title: { en: 'IPC Working', sr: 'IPC funkcioniše' },
    checks: [
      { en: 'Task A sends message to Task B', sr: 'Task A šalje poruku Tasku B' },
      { en: 'Task B receives and responds', sr: 'Task B prima i odgovara' },
      { en: 'Zero-copy transfer verified', sr: 'Verifikovan zero-copy transfer' },
    ],
  },
  {
    id: 4,
    title: { en: 'Auto-Recovery', sr: 'Auto-oporavak' },
    checks: [
      { en: 'Service intentionally crashed', sr: 'Servis namerno srušen' },
      { en: 'Reincarnation server detects fault', sr: 'Server za reinkarnaciju detektuje grešku' },
      { en: 'Service restarts within 50ms', sr: 'Servis se restartuje u roku od 50ms' },
    ],
  },
  {
    id: 5,
    title: { en: 'Multi-Node CAN', sr: 'Višečvorni CAN' },
    checks: [
      { en: 'Two boards communicate via CAN-FD', sr: 'Dve ploče komuniciraju preko CAN-FD' },
      { en: 'Messages translated to internal IPC', sr: 'Poruke prevedene u interni IPC' },
      { en: 'Latency < 1ms verified', sr: 'Verifikovana latencija < 1ms' },
    ],
  },
  {
    id: 6,
    title: { en: 'Swarm Operational', sr: 'Roj operativan' },
    checks: [
      { en: '3+ nodes elect leader', sr: '3+ čvora biraju lidera' },
      { en: 'Leader failure triggers re-election', sr: 'Kvar lidera pokreće ponovni izbor' },
      { en: 'System continues operating', sr: 'Sistem nastavlja da radi' },
    ],
  },
];

function PhaseCard({ phase, lang, isExpanded, onToggle }) {
  const Icon = phase.icon;
  const isIncluded = ['1', '2', '3', '4'].includes(phase.phase);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">
              {lang === 'sr' ? 'Faza' : 'Phase'} {phase.phase}
            </span>
            {isIncluded && (
              <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                {lang === 'sr' ? 'Uključeno' : 'Included'}
              </span>
            )}
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
  const [expandedPhases, setExpandedPhases] = useState(['kernel']);

  const togglePhase = (id) => {
    setExpandedPhases(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
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
              <h1 className="text-xl font-bold text-slate-900">JEZGRO Development Plan</h1>
              <p className="text-sm text-slate-500">
                {lang === 'sr' ? 'Microkernel RTOS za power electronics' : 'Microkernel RTOS for power electronics'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Starter Kit */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              {lang === 'sr' ? 'Preporučeni početak' : 'Recommended Start'}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {lang === 'sr'
                ? '10 NUCLEO ploča - omogućava kompletan razvoj roja od prvog dana'
                : '10 NUCLEO boards - enables full swarm development from day one'}
            </p>
          </div>

          <div className="bg-white/10 rounded-xl p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-blue-200 text-left">
                  <th className="pb-2">{lang === 'sr' ? 'Stavka' : 'Item'}</th>
                  <th className="pb-2 text-right">{lang === 'sr' ? 'Kom' : 'Qty'}</th>
                </tr>
              </thead>
              <tbody>
                {STARTER_KIT.map((item, idx) => (
                  <tr key={idx} className="border-t border-white/10">
                    <td className="py-2">{item.item[lang]}</td>
                    <td className="py-2 text-right">{item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Capabilities */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              {lang === 'sr' ? 'Sve od prvog dana' : 'Everything from day one'}
            </h3>
            <div className="space-y-1.5">
              {CAPABILITIES.map((cap, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 text-sm ${
                    cap.status === 'highlight'
                      ? 'text-blue-600 font-medium'
                      : 'text-slate-600'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${
                    cap.status === 'highlight' ? 'text-blue-600' : 'text-green-500'
                  }`} />
                  {cap.name[lang]}
                </div>
              ))}
            </div>
          </div>

          {/* Toolchain */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-600" />
              {lang === 'sr' ? 'Primarni toolchain (besplatno)' : 'Primary toolchain (free)'}
            </h3>
            <div className="space-y-2">
              {TOOLCHAIN.map((tool, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-slate-900">{tool.tool}</span>
                    <span className="text-slate-400 mx-2">—</span>
                    <span className="text-slate-500">{tool.purpose[lang]}</span>
                  </div>
                  <span className="text-xs text-slate-400">{tool.url}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              {lang === 'sr'
                ? 'Alternativa: STM32CubeIDE (sve-u-jednom, ali teži)'
                : 'Alternative: STM32CubeIDE (all-in-one, but heavier)'}
            </div>
          </div>
        </div>

        {/* Development Phases */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            {lang === 'sr' ? 'Faze razvoja' : 'Development Phases'}
          </h2>
          <div className="space-y-2">
            {PHASES.map((phase, idx) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                lang={lang}
                isExpanded={expandedPhases.includes(phase.id)}
                onToggle={() => togglePhase(phase.id)}
              />
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            {lang === 'sr' ? 'Razvojne prekretnice' : 'Development Milestones'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {MILESTONES.map((milestone) => (
              <div key={milestone.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                    {milestone.id}
                  </span>
                  <h4 className="font-medium text-slate-900">{milestone.title[lang]}</h4>
                </div>
                <ul className="space-y-1">
                  {milestone.checks.map((check, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <Circle className="w-2.5 h-2.5 mt-1 text-slate-300" />
                      {check[lang]}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">
            {lang === 'sr' ? 'Brzi početak' : 'Quick Start'}
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div>
              <div className="text-slate-400 text-xs mb-1"># {lang === 'sr' ? 'Instaliraj toolchain' : 'Install toolchain'}</div>
              <div className="text-green-400">VS Code + ARM GCC + OpenOCD + Cortex-Debug</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-1"># {lang === 'sr' ? 'Kreiraj projekat' : 'Create project'}</div>
              <div className="text-white">mkdir jezgro && cd jezgro && git init</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-1"># {lang === 'sr' ? 'Build i flash' : 'Build and flash'}</div>
              <div className="text-white">mkdir build && cd build && cmake .. && make -j8</div>
              <div className="text-white">make flash</div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center text-sm text-slate-500 pb-8">
          {lang === 'sr'
            ? 'Referenca: tehnika/inzenjersko/sr/18-jezgro-dev-plan.md'
            : 'Reference: tehnika/inzenjersko/en/18-jezgro-dev-plan.md'}
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
      title={lang === 'sr' ? 'JEZGRO Razvojni Plan' : 'JEZGRO Development Plan'}
      storageKey="ek_jezgro_unlocked"
      password="gazdamilorad"
    >
      <JezgroDevContent />
    </PasswordGate>
  );
}
