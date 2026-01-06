import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  ChevronLeft,
  Activity,
  Clock,
  CheckCircle,
  Network,
  Wifi,
  WifiOff
} from 'lucide-react';

import {
  DeliveryAIFlow,
  FleetStatusCards,
  KorMetrics,
  ScenarioQueue,
  CompletedScenarios,
  SystemHealthMonitor,
  ActionFlowVisualization
} from './components';

/**
 * Expanded full-screen KorAllThing panel
 * Shows complete orchestrator view with all fleet data
 */
export function ExpandedPanel({
  drones = [],
  pods = [],
  swarmBots = [],
  activeScenarios = [],
  completedScenarios = [],
  stats = {},
  systemStatus = 'healthy',
  isConnected = false,
  aiStage = 'sense',
  executingAction = null,
  onClose,
  onScenarioSelect,
  onActionComplete
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-[#050508]/98 backdrop-blur-xl overflow-hidden"
    >
      <div className="h-full flex flex-col p-6">
        {/* Header */}
        <Header
          isConnected={isConnected}
          systemStatus={systemStatus}
          onClose={onClose}
        />

        {/* Main Grid */}
        <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden mt-6">
          {/* Left Column - Fleet Overview */}
          <div className="flex flex-col gap-4 overflow-y-auto pr-2">
            <SectionHeader icon={Activity} title="Fleet Status" color="cyan" />
            <FleetStatusCards
              drones={drones}
              pods={pods}
              swarmBots={swarmBots}
            />
          </div>

          {/* Center Column - AI Flow + Metrics */}
          <div className="flex flex-col gap-4 overflow-y-auto px-2">
            <DeliveryAIFlow activeStage={aiStage} />
            <KorMetrics stats={stats} />
            <SystemHealthMonitor
              systemStatus={systemStatus}
              isConnected={isConnected}
              drones={drones}
              pods={pods}
              swarmBots={swarmBots}
            />
          </div>

          {/* Right Column - Scenarios */}
          <div className="flex flex-col gap-4 overflow-y-auto pl-2">
            <SectionHeader
              icon={Clock}
              title={`Scenario Queue (${activeScenarios.length})`}
              color="amber"
            />
            <ScenarioQueue
              scenarios={activeScenarios}
              onSelect={onScenarioSelect}
            />
            {completedScenarios.length > 0 && (
              <>
                <SectionHeader
                  icon={CheckCircle}
                  title="Recently Completed"
                  color="emerald"
                />
                <CompletedScenarios scenarios={completedScenarios} />
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <Footer
          systemStatus={systemStatus}
          isConnected={isConnected}
        />
      </div>

      {/* Action Flow Overlay */}
      {executingAction && (
        <ActionFlowVisualization
          action={executingAction}
          onComplete={onActionComplete}
        />
      )}
    </motion.div>
  );
}

function Header({ isConnected, systemStatus, onClose }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center border border-purple-500/30">
          <Brain className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">KorAllThing</h1>
            {isConnected ? (
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                <Wifi className="w-3 h-3" />
                LIVE
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400">
                <WifiOff className="w-3 h-3" />
                SIMULATION
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">LA Delivery Orchestrator • TechnoCore AI</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-300">Close</span>
      </button>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, color = 'white' }) {
  const colorClasses = {
    cyan: 'text-cyan-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
    white: 'text-white'
  };

  return (
    <h2 className="text-sm font-medium text-white flex items-center gap-2">
      <Icon className={`w-4 h-4 ${colorClasses[color]}`} />
      {title}
    </h2>
  );
}

function Footer({ systemStatus, isConnected }) {
  const statusColors = {
    healthy: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500'
  };

  return (
    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${statusColors[systemStatus]}`} />
          <span className="text-xs text-slate-400 capitalize">System {systemStatus}</span>
        </div>
        <div className="flex items-center gap-2">
          <Network className="w-3 h-3 text-purple-400" />
          <span className="text-xs text-slate-400">
            {isConnected ? 'Backend Connected' : 'Local Simulation'}
          </span>
        </div>
      </div>
      <div className="text-xs text-slate-500">
        KorAllThing v2.1 • LA Delivery Network
      </div>
    </div>
  );
}

export default ExpandedPanel;
