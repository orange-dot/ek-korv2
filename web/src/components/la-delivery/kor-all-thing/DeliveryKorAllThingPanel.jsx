import React, { useMemo, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';

import { CollapsedSidebar } from './CollapsedSidebar';
import { ExpandedPanel } from './ExpandedPanel';
import { useDeliveryKorState } from './hooks/useDeliveryKorState';

/**
 * DeliveryKorAllThingPanel
 * Main entry point for the LA Delivery orchestrator panel
 *
 * Features:
 * - Collapsed sidebar with quick stats (always visible)
 * - Full-screen expanded view with complete fleet overview
 * - Backend integration via WebSocket
 * - AI flow visualization (SENSE → ANALYZE → DECIDE → ACT)
 * - Scenario queue management
 */
export function DeliveryKorAllThingPanel({
  // Context data
  drones = [],
  pods = [],
  swarmBots = [],
  scenarioQueue = [],
  stats = {},
  // Panel state
  isExpanded = false,
  onToggle,
  // Backend connection (optional)
  isConnected = false,
  backendData = null,
  // Callbacks
  onScenarioSelect,
  onScenarioComplete
}) {
  const [executingAction, setExecutingAction] = useState(null);
  const [aiStage, setAiStage] = useState('sense');

  // Merge backend data with local context
  const mergedData = useDeliveryKorState({
    localDrones: drones,
    localPods: pods,
    localSwarmBots: swarmBots,
    localStats: stats,
    backendData,
    isConnected
  });

  // Calculate system status based on fleet health
  const systemStatus = useMemo(() => {
    const allVehicles = [
      ...mergedData.drones,
      ...mergedData.pods,
      ...mergedData.swarmBots
    ];
    const criticalCount = allVehicles.filter(v =>
      (v.batteryLevel ?? v.batterySoc ?? 100) < 15
    ).length;

    if (criticalCount > 3) return 'critical';
    if (criticalCount > 0) return 'warning';
    return 'healthy';
  }, [mergedData.drones, mergedData.pods, mergedData.swarmBots]);

  // Split scenarios by status
  const activeScenarios = useMemo(() =>
    scenarioQueue.filter(s => s.status === 'active' || s.status === 'pending'),
    [scenarioQueue]
  );

  const completedScenarios = useMemo(() =>
    scenarioQueue.filter(s => s.status === 'completed').slice(-5),
    [scenarioQueue]
  );

  // Handle scenario selection
  const handleScenarioSelect = useCallback((scenario, option) => {
    // Start action flow animation
    setExecutingAction({
      label: option.label,
      description: option.description,
      scenario
    });
    setAiStage('analyze');

    // Progress through AI stages
    setTimeout(() => setAiStage('decide'), 500);
    setTimeout(() => setAiStage('act'), 1000);

    // Call parent handler
    if (onScenarioSelect) {
      onScenarioSelect(scenario, option);
    }
  }, [onScenarioSelect]);

  // Handle action completion
  const handleActionComplete = useCallback(() => {
    setExecutingAction(null);
    setAiStage('sense');

    if (onScenarioComplete) {
      onScenarioComplete(executingAction?.scenario);
    }
  }, [onScenarioComplete, executingAction]);

  // Render collapsed or expanded view
  if (!isExpanded) {
    return (
      <CollapsedSidebar
        activeScenarios={activeScenarios}
        systemStatus={systemStatus}
        stats={mergedData.stats}
        isConnected={isConnected}
        onExpand={onToggle}
      />
    );
  }

  return (
    <AnimatePresence>
      <ExpandedPanel
        drones={mergedData.drones}
        pods={mergedData.pods}
        swarmBots={mergedData.swarmBots}
        activeScenarios={activeScenarios}
        completedScenarios={completedScenarios}
        stats={mergedData.stats}
        systemStatus={systemStatus}
        isConnected={isConnected}
        aiStage={aiStage}
        executingAction={executingAction}
        onClose={onToggle}
        onScenarioSelect={handleScenarioSelect}
        onActionComplete={handleActionComplete}
      />
    </AnimatePresence>
  );
}

export default DeliveryKorAllThingPanel;
