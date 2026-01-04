/**
 * KorAllThing Panel - The Orchestrator
 * Inspired by Hyperion Cantos TechnoCore
 * The "brain" of the system that manages all scenarios and AI decisions
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Zap,
  Bot,
  Eye,
  TrendingUp,
  BarChart3,
  CircleDot,
  Workflow,
  Network,
} from 'lucide-react';
import { useSimulation, BUS_STATES } from '../../context/SimulationContext';

// Scenario status colors and labels
const STATUS_CONFIG = {
  pending: { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Čeka' },
  active: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', label: 'Aktivno' },
  completed: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Završeno' },
  timeout: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Timeout' },
};

// Collapsed panel - always visible sidebar
function CollapsedPanel({ onExpand, scenarios, systemStatus }) {
  const activeCount = scenarios.filter(s => s.status === 'active' || s.status === 'pending').length;
  const completedCount = scenarios.filter(s => s.status === 'completed').length;

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-16 h-full bg-[#0a0a0f]/95 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-4 gap-4"
    >
      {/* Logo/Brand */}
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center border border-purple-500/30">
          <Brain className="w-5 h-5 text-purple-400" />
        </div>
        {activeCount > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
            <span className="text-[10px] font-bold text-black">{activeCount}</span>
          </div>
        )}
      </div>

      {/* System Status Indicator */}
      <div className="flex flex-col items-center gap-1">
        <div className={`w-3 h-3 rounded-full ${
          systemStatus === 'healthy' ? 'bg-emerald-500 animate-pulse' :
          systemStatus === 'warning' ? 'bg-amber-500 animate-pulse' :
          'bg-red-500 animate-pulse'
        }`} />
        <span className="text-[8px] text-slate-500 uppercase tracking-wider">SYS</span>
      </div>

      {/* Quick Stats */}
      <div className="flex flex-col items-center gap-3 flex-1">
        <div className="flex flex-col items-center">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white">{activeCount}</span>
          <span className="text-[8px] text-slate-500">AKT</span>
        </div>

        <div className="flex flex-col items-center">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white">{completedCount}</span>
          <span className="text-[8px] text-slate-500">OK</span>
        </div>
      </div>

      {/* Expand Button */}
      <button
        onClick={onExpand}
        className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors group"
      >
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
      </button>
    </motion.div>
  );
}

// Scenario list item
function ScenarioItem({ scenario, isCompact }) {
  const config = STATUS_CONFIG[scenario.status] || STATUS_CONFIG.pending;
  const timeAgo = useMemo(() => {
    const diff = Date.now() - (scenario.addedAt || Date.now());
    if (diff < 60000) return 'sada';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    return `${Math.floor(diff / 3600000)}h`;
  }, [scenario.addedAt]);

  if (isCompact) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
        <div className={`w-2 h-2 rounded-full ${config.bg}`} />
        <span className="text-xs text-white truncate flex-1">{scenario.busName || scenario.type}</span>
        <span className="text-[10px] text-slate-500">{timeAgo}</span>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.bg}`} />
          <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
        </div>
        <span className="text-[10px] text-slate-500">{timeAgo}</span>
      </div>
      <div className="text-sm text-white font-medium mb-1">
        {scenario.busName || 'Bus'}
      </div>
      <div className="text-xs text-slate-400 truncate">
        {scenario.message || scenario.type}
      </div>
    </div>
  );
}

// AI Flow visualization
function AIFlowDiagram({ scenarios }) {
  const stages = [
    { id: 'input', label: 'INPUT', icon: Eye, color: 'cyan' },
    { id: 'analyze', label: 'ANALIZA', icon: Cpu, color: 'purple' },
    { id: 'decide', label: 'ODLUKA', icon: Brain, color: 'amber' },
    { id: 'execute', label: 'IZVRŠENJE', icon: Zap, color: 'emerald' },
  ];

  const activeStage = scenarios.some(s => s.status === 'active') ? 2 :
                      scenarios.some(s => s.status === 'pending') ? 1 : 0;

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <Workflow className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-medium text-white uppercase tracking-wider">AI Flow</span>
      </div>

      <div className="flex items-center justify-between relative">
        {/* Connection line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2" />

        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = index <= activeStage;
          const isCurrent = index === activeStage;

          return (
            <div key={stage.id} className="relative flex flex-col items-center z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isCurrent ? `bg-${stage.color}-500/30 border-2 border-${stage.color}-500 animate-pulse` :
                isActive ? `bg-${stage.color}-500/20 border border-${stage.color}-500/50` :
                'bg-white/5 border border-white/10'
              }`}>
                <Icon className={`w-4 h-4 ${isActive ? `text-${stage.color}-400` : 'text-slate-500'}`} />
              </div>
              <span className={`text-[9px] mt-1 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// System metrics
function SystemMetrics({ buses, stations }) {
  const activeBuses = buses.filter(b => b.state === BUS_STATES.DRIVING).length;
  const chargingBuses = buses.filter(b => b.state === BUS_STATES.CHARGING).length;
  const avgBattery = buses.length > 0
    ? Math.round(buses.reduce((sum, b) => sum + b.batteryLevel, 0) / buses.length)
    : 0;
  const activeStations = stations.filter(s => s.busesCharging.length > 0).length;

  const metrics = [
    { label: 'Aktivni', value: activeBuses, icon: Activity, color: 'cyan' },
    { label: 'Pune se', value: chargingBuses, icon: Zap, color: 'emerald' },
    { label: 'Avg Bat', value: `${avgBattery}%`, icon: BarChart3, color: 'amber' },
    { label: 'Stanice', value: `${activeStations}/${stations.length}`, icon: Network, color: 'purple' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {metrics.map(metric => {
        const Icon = metric.icon;
        return (
          <div key={metric.label} className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-3 h-3 text-${metric.color}-400`} />
              <span className="text-[10px] text-slate-400 uppercase">{metric.label}</span>
            </div>
            <div className="text-lg font-bold text-white">{metric.value}</div>
          </div>
        );
      })}
    </div>
  );
}

// Expanded panel - full view
function ExpandedPanel({ onCollapse, scenarios, buses, stations }) {
  const pendingScenarios = scenarios.filter(s => s.status === 'pending' || s.status === 'active');
  const completedScenarios = scenarios.filter(s => s.status === 'completed').slice(-5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-[#050508]/98 backdrop-blur-xl overflow-hidden"
    >
      <div className="h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center border border-purple-500/30">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">KorAllThing</h1>
              <p className="text-xs text-slate-400">Orchestrator System • TechnoCore AI</p>
            </div>
          </div>

          <button
            onClick={onCollapse}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300">Zatvori</span>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
          {/* Left Column - Scenario Queue */}
          <div className="flex flex-col">
            <h2 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Red Scenarija ({pendingScenarios.length})
            </h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {pendingScenarios.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <CircleDot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nema aktivnih scenarija</p>
                </div>
              ) : (
                pendingScenarios.map(scenario => (
                  <ScenarioItem key={scenario.id} scenario={scenario} />
                ))
              )}
            </div>
          </div>

          {/* Center Column - AI Flow + Metrics */}
          <div className="flex flex-col gap-4">
            <AIFlowDiagram scenarios={scenarios} />
            <SystemMetrics buses={buses} stations={stations} />

            {/* AI Confidence */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">AI Confidence</span>
                <span className="text-sm font-bold text-emerald-400">94%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full">
                <div className="h-full w-[94%] bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
              </div>
            </div>
          </div>

          {/* Right Column - Completed + Log */}
          <div className="flex flex-col">
            <h2 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Završeni ({completedScenarios.length})
            </h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {completedScenarios.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nema završenih</p>
                </div>
              ) : (
                completedScenarios.map(scenario => (
                  <ScenarioItem key={scenario.id} scenario={scenario} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Status Bar */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-400">System Online</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-slate-400">Robot A/B Ready</span>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            KorAllThing v1.0 • Hyperion Protocol
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Main component
export default function KorAllThingPanel() {
  const {
    korAllThingExpanded,
    toggleKorAllThing,
    scenarioQueue,
    buses,
    chargingStations,
  } = useSimulation();

  // Determine system status based on buses
  const systemStatus = useMemo(() => {
    const criticalBuses = buses.filter(b => b.batteryLevel < 15).length;
    if (criticalBuses > 2) return 'critical';
    if (criticalBuses > 0) return 'warning';
    return 'healthy';
  }, [buses]);

  return (
    <>
      {/* Collapsed sidebar - always visible when not expanded */}
      <AnimatePresence>
        {!korAllThingExpanded && (
          <CollapsedPanel
            onExpand={toggleKorAllThing}
            scenarios={scenarioQueue}
            systemStatus={systemStatus}
          />
        )}
      </AnimatePresence>

      {/* Expanded full-screen view */}
      <AnimatePresence>
        {korAllThingExpanded && (
          <ExpandedPanel
            onCollapse={toggleKorAllThing}
            scenarios={scenarioQueue}
            buses={buses}
            stations={chargingStations}
          />
        )}
      </AnimatePresence>
    </>
  );
}
