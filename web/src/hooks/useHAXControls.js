import { useState, useCallback, useEffect, useMemo } from 'react';

/**
 * Hook to manage HAX demo interactive controls.
 * Handles power demand, grid frequency, ambient temperature, and fault injection.
 *
 * Uses the SimulationContext APIs to send commands to the Go physics engine.
 */
export function useHAXControls({
  sendCommand,
  injectFault,
  distributeRackPower,
  modules = [],
  gridState = null,
  isConnected = false,
}) {
  // Control states with defaults
  const [powerDemand, setPowerDemandState] = useState(150); // kW
  const [gridFrequency, setGridFrequencyState] = useState(50.0); // Hz
  const [ambientTemp, setAmbientTempState] = useState(25); // °C
  const [selectedProcess, setSelectedProcess] = useState('thermal');
  const [selectedModule, setSelectedModule] = useState(null);

  // Track pending API calls
  const [isPending, setIsPending] = useState({
    power: false,
    frequency: false,
    ambient: false,
    fault: false,
  });

  // Sync grid frequency from live data
  useEffect(() => {
    if (gridState?.frequency) {
      setGridFrequencyState(gridState.frequency);
    }
  }, [gridState?.frequency]);

  // Calculate derived stats from modules
  const moduleStats = useMemo(() => {
    if (!modules || modules.length === 0) {
      return {
        active: 0,
        faulted: 0,
        v2g: 0,
        totalPower: 0,
        avgTemp: 25,
        maxTemp: 25,
        avgEfficiency: 0.96,
        avgHealth: 100,
        hotCount: 0,
        criticalCount: 0,
      };
    }

    const active = modules.filter(m => m.state === 'active').length;
    const faulted = modules.filter(m => m.state === 'fault').length;
    const v2g = modules.filter(m => m.state === 'v2g').length;
    const totalPower = modules.reduce((sum, m) => sum + (m.powerOut || 0), 0);
    const avgTemp = modules.reduce((sum, m) => sum + (m.tempJunction || 25), 0) / modules.length;
    const maxTemp = Math.max(...modules.map(m => m.tempJunction || 25));

    // Calculate average efficiency (only from active modules)
    const activeModules = modules.filter(m => m.state === 'active' && m.efficiency > 0);
    const avgEfficiency = activeModules.length > 0
      ? activeModules.reduce((sum, m) => sum + m.efficiency, 0) / activeModules.length
      : 0.96;

    // Calculate average health
    const avgHealth = modules.reduce((sum, m) => sum + (m.health || 100), 0) / modules.length;

    // Count modules with issues
    const hotCount = modules.filter(m => (m.tempJunction || 25) > 80).length;
    const criticalCount = modules.filter(m => (m.health || 100) < 80).length;

    return {
      active,
      faulted,
      v2g,
      totalPower,
      avgTemp,
      maxTemp,
      avgEfficiency,
      avgHealth,
      hotCount,
      criticalCount,
    };
  }, [modules]);

  // Set power demand (kW)
  const setPowerDemand = useCallback(async (value) => {
    setPowerDemandState(value);

    if (!isConnected || !distributeRackPower) return;

    setIsPending(prev => ({ ...prev, power: true }));
    try {
      // Convert kW to W for the API
      await distributeRackPower('rack-0', value * 1000);
    } finally {
      setIsPending(prev => ({ ...prev, power: false }));
    }
  }, [isConnected, distributeRackPower]);

  // Set grid frequency (Hz) - triggers V2G at low frequency
  const setGridFrequency = useCallback(async (value) => {
    setGridFrequencyState(value);

    if (!isConnected || !sendCommand) return;

    setIsPending(prev => ({ ...prev, frequency: true }));
    try {
      // Use the V2G trigger command for low frequency scenarios
      if (value < 49.9) {
        await sendCommand('triggerV2G', value);
      } else {
        await sendCommand('setGridFreq', value);
      }
    } finally {
      setIsPending(prev => ({ ...prev, frequency: false }));
    }
  }, [isConnected, sendCommand]);

  // Set ambient temperature (°C)
  const setAmbientTemp = useCallback(async (value) => {
    setAmbientTempState(value);

    if (!isConnected || !sendCommand) return;

    setIsPending(prev => ({ ...prev, ambient: true }));
    try {
      await sendCommand('setAmbient', value);
    } finally {
      setIsPending(prev => ({ ...prev, ambient: false }));
    }
  }, [isConnected, sendCommand]);

  // Inject fault into a module
  const handleInjectFault = useCallback(async (moduleId, faultType, severity = 1.0) => {
    if (!isConnected || !injectFault) return false;

    setIsPending(prev => ({ ...prev, fault: true }));
    try {
      const result = await injectFault(moduleId, faultType, severity);
      return result;
    } finally {
      setIsPending(prev => ({ ...prev, fault: false }));
    }
  }, [isConnected, injectFault]);

  // Force V2G mode on selected module
  const forceV2G = useCallback(async (moduleId) => {
    if (!isConnected || !sendCommand) return false;

    try {
      await sendCommand('forceV2G', moduleId);
      return true;
    } catch {
      return false;
    }
  }, [isConnected, sendCommand]);

  // Reset module to normal operation
  const resetModule = useCallback(async (moduleId) => {
    if (!isConnected || !sendCommand) return false;

    try {
      await sendCommand('resetModule', moduleId);
      return true;
    } catch {
      return false;
    }
  }, [isConnected, sendCommand]);

  // Check if we're in warning states
  const warnings = useMemo(() => ({
    lowFrequency: gridFrequency < 49.9,
    highTemp: ambientTemp > 35,
    highPower: powerDemand > 250,
    thermalStress: moduleStats.hotCount > 10,
    healthCritical: moduleStats.criticalCount > 0,
  }), [gridFrequency, ambientTemp, powerDemand, moduleStats]);

  return {
    // Control values
    powerDemand,
    gridFrequency,
    ambientTemp,
    selectedProcess,
    selectedModule,

    // Setters
    setPowerDemand,
    setGridFrequency,
    setAmbientTemp,
    setSelectedProcess,
    setSelectedModule,

    // Actions
    injectFault: handleInjectFault,
    forceV2G,
    resetModule,

    // Derived state
    moduleStats,
    warnings,
    isPending,
    isConnected,
  };
}
