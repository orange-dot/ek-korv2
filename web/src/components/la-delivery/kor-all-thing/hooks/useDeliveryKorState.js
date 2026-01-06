import { useMemo, useCallback } from 'react';

/**
 * useDeliveryKorState
 * Hook for managing KorAllThing panel state with backend integration
 *
 * Merges local context data with real-time backend data
 * Falls back to local simulation when backend is disconnected
 */
export function useDeliveryKorState({
  // Local context data
  localDrones = [],
  localPods = [],
  localSwarmBots = [],
  localStats = {},
  // Backend data from useDeliveryConnection
  backendData = null,
  isConnected = false
}) {
  // Merge drones from local and backend
  const drones = useMemo(() => {
    if (!isConnected || !backendData?.drones?.length) {
      return localDrones;
    }

    // Create a map of backend drones for quick lookup
    const backendMap = new Map(
      backendData.drones.map(d => [d.id, d])
    );

    // Merge: use backend data for matching IDs, keep local for others
    const merged = localDrones.map(local => {
      const backend = backendMap.get(local.id);
      if (backend) {
        // Backend data takes precedence, but preserve local UI state
        return {
          ...local,
          ...backend,
          // Normalize battery field names
          batteryLevel: backend.batterySoc ?? backend.batteryLevel ?? local.batteryLevel
        };
      }
      return local;
    });

    // Add any backend drones not in local state
    backendData.drones.forEach(backend => {
      if (!merged.find(m => m.id === backend.id)) {
        merged.push({
          ...backend,
          batteryLevel: backend.batterySoc ?? backend.batteryLevel ?? 100
        });
      }
    });

    return merged;
  }, [localDrones, backendData?.drones, isConnected]);

  // Merge pods
  const pods = useMemo(() => {
    if (!isConnected || !backendData?.pods?.length) {
      return localPods;
    }

    const backendMap = new Map(
      backendData.pods.map(p => [p.id, p])
    );

    const merged = localPods.map(local => {
      const backend = backendMap.get(local.id);
      if (backend) {
        return {
          ...local,
          ...backend,
          batteryLevel: backend.batterySoc ?? backend.batteryLevel ?? local.batteryLevel
        };
      }
      return local;
    });

    backendData.pods.forEach(backend => {
      if (!merged.find(m => m.id === backend.id)) {
        merged.push({
          ...backend,
          batteryLevel: backend.batterySoc ?? backend.batteryLevel ?? 100
        });
      }
    });

    return merged;
  }, [localPods, backendData?.pods, isConnected]);

  // Merge swarm bots
  const swarmBots = useMemo(() => {
    if (!isConnected || !backendData?.swarmBots?.length) {
      return localSwarmBots;
    }

    const backendMap = new Map(
      backendData.swarmBots.map(s => [s.id, s])
    );

    const merged = localSwarmBots.map(local => {
      const backend = backendMap.get(local.id);
      if (backend) {
        return {
          ...local,
          ...backend,
          batteryLevel: backend.batterySoc ?? backend.batteryLevel ?? local.batteryLevel
        };
      }
      return local;
    });

    backendData.swarmBots.forEach(backend => {
      if (!merged.find(m => m.id === backend.id)) {
        merged.push({
          ...backend,
          batteryLevel: backend.batterySoc ?? backend.batteryLevel ?? 100
        });
      }
    });

    return merged;
  }, [localSwarmBots, backendData?.swarmBots, isConnected]);

  // Calculate merged stats
  const stats = useMemo(() => {
    const backendMetrics = backendData?.metrics;

    // Start with local stats
    const merged = { ...localStats };

    // If connected, merge with backend metrics
    if (isConnected && backendMetrics) {
      merged.dronesFlying = backendMetrics.activeDrones ?? merged.dronesFlying ?? 0;
      merged.podsMoving = backendMetrics.activePods ?? merged.podsMoving ?? 0;
      merged.swarmsDelivering = backendMetrics.activeSwarmBots ?? merged.swarmsDelivering ?? 0;
      merged.packagesInTransit = backendMetrics.inTransitDeliveries ?? merged.packagesInTransit ?? 0;
      merged.activeHandoffs = backendMetrics.pendingDeliveries ?? merged.activeHandoffs ?? 0;
      merged.ek3Utilization = Math.round((backendMetrics.chargingCount ?? 0) / Math.max(1, drones.length + pods.length + swarmBots.length) * 100);
      merged.avgDeliveryTime = backendMetrics.avgDeliveryTime ?? merged.avgDeliveryTime ?? 18;
      merged.handoffSuccessRate = backendMetrics.handoffSuccessRate ?? merged.handoffSuccessRate ?? 99;
      merged.fleetUtilization = backendMetrics.fleetUtilization ?? merged.fleetUtilization ?? 78;
    }

    // Calculate efficiency from fleet data if not provided
    if (!merged.efficiency) {
      const allVehicles = [...drones, ...pods, ...swarmBots];
      const avgBattery = allVehicles.length > 0
        ? allVehicles.reduce((sum, v) => sum + (v.batteryLevel ?? v.batterySoc ?? 100), 0) / allVehicles.length
        : 100;
      merged.efficiency = Math.round(85 + (avgBattery / 100) * 10); // 85-95% based on battery
    }

    // AI confidence based on system health
    if (!merged.aiConfidence) {
      const criticalCount = [...drones, ...pods, ...swarmBots].filter(
        v => (v.batteryLevel ?? v.batterySoc ?? 100) < 15
      ).length;
      merged.aiConfidence = Math.max(60, 98 - criticalCount * 5);
    }

    return merged;
  }, [localStats, backendData?.metrics, isConnected, drones, pods, swarmBots]);

  // Utility function to get vehicle by ID
  const getVehicleById = useCallback((id, type) => {
    switch (type) {
      case 'drone':
        return drones.find(d => d.id === id);
      case 'pod':
        return pods.find(p => p.id === id);
      case 'swarmbot':
        return swarmBots.find(s => s.id === id);
      default:
        return (
          drones.find(d => d.id === id) ||
          pods.find(p => p.id === id) ||
          swarmBots.find(s => s.id === id)
        );
    }
  }, [drones, pods, swarmBots]);

  // Get all vehicles as a flat array
  const allVehicles = useMemo(() => [
    ...drones.map(d => ({ ...d, type: 'drone' })),
    ...pods.map(p => ({ ...p, type: 'pod' })),
    ...swarmBots.map(s => ({ ...s, type: 'swarmbot' }))
  ], [drones, pods, swarmBots]);

  return {
    // Merged entity data
    drones,
    pods,
    swarmBots,
    allVehicles,

    // Merged stats
    stats,

    // Utility functions
    getVehicleById,

    // Connection status
    isConnected,
    hasBackendData: isConnected && backendData !== null
  };
}

export default useDeliveryKorState;
