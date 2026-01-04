/**
 * LA Delivery Decision Effects
 * Maps decision options to actual simulation state changes
 */

import { DELIVERY_STATES, DELIVERY_PRIORITY, getNearestHub, HUB_TYPES } from '../data/laDelivery';
import { SCENARIO_TYPES } from '../data/laDecisionScenarios';

/**
 * Apply decision effect to LA delivery simulation
 * @param {Object} scenario - The scenario object
 * @param {string} optionId - Selected option ID
 * @param {Object} context - Delivery context with state and actions
 */
export function applyDecisionEffect(scenario, optionId, context) {
  const {
    drones,
    pods,
    swarmBots,
    rooftopHubs,
    streetHubs,
    updateDrones,
    updatePods,
    updateSwarmBots,
    setVehiclePriority,
    addDecisionHistory
  } = context;

  const { vehicleId, vehicleType, type: scenarioType, config } = scenario;

  // Find the selected option config
  const option = config.options.find(o => o.id === optionId);

  // Log to decision history
  addDecisionHistory(vehicleType, vehicleId, {
    id: `decision-${Date.now()}`,
    scenarioType,
    chosenOption: optionId,
    optionLabel: option?.label || optionId,
    wasAI: false,
    timestamp: Date.now()
  });

  // Apply effects based on scenario type
  switch (scenarioType) {
    case SCENARIO_TYPES.WEATHER_ALERT:
      applyWeatherEffect(optionId, vehicleId, { drones, updateDrones });
      break;

    case SCENARIO_TYPES.HANDOFF_FAILURE:
      applyHandoffEffect(optionId, vehicleId, vehicleType, {
        drones, swarmBots, updateDrones, updateSwarmBots, rooftopHubs
      });
      break;

    case SCENARIO_TYPES.PRIORITY_OVERRIDE:
      applyPriorityEffect(optionId, vehicleId, vehicleType, {
        drones, pods, swarmBots, updateDrones, updatePods, updateSwarmBots, setVehiclePriority
      });
      break;

    case SCENARIO_TYPES.HUB_CONGESTION:
      applyHubCongestionEffect(optionId, vehicleId, vehicleType, {
        drones, pods, swarmBots, updateDrones, updatePods, updateSwarmBots,
        rooftopHubs, streetHubs
      });
      break;

    case SCENARIO_TYPES.EMERGENCY_LANDING:
      applyEmergencyLandingEffect(optionId, vehicleId, {
        drones, updateDrones, rooftopHubs
      });
      break;

    case SCENARIO_TYPES.SWARM_REBALANCE:
      applySwarmRebalanceEffect(optionId, {
        swarmBots, pods, updateSwarmBots, updatePods
      });
      break;

    default:
      console.warn('Unknown LA delivery scenario type:', scenarioType);
  }
}

/**
 * Weather Alert Effects
 */
function applyWeatherEffect(optionId, vehicleId, { drones, updateDrones }) {
  switch (optionId) {
    case 'ground':
      // Ground all drones - send to landing state
      const groundedDrones = drones.map(d => ({
        ...d,
        state: DELIVERY_STATES.LANDING,
        weatherGrounded: true,
        groundedAt: Date.now()
      }));
      updateDrones(groundedDrones);
      break;

    case 'reduce':
      // Reduce altitude for specific drone
      const reducedDrones = drones.map(d =>
        d.id === vehicleId
          ? { ...d, altitude: Math.min(d.altitude || 100, 50), reducedAltitude: true }
          : d
      );
      updateDrones(reducedDrones);
      break;

    case 'continue':
      // No change, just flag
      const flaggedDrones = drones.map(d =>
        d.id === vehicleId
          ? { ...d, weatherOverride: true, overrideAt: Date.now() }
          : d
      );
      updateDrones(flaggedDrones);
      break;
  }
}

/**
 * Handoff Failure Effects
 */
function applyHandoffEffect(optionId, vehicleId, vehicleType, context) {
  const { drones, swarmBots, updateDrones, updateSwarmBots, rooftopHubs } = context;

  switch (optionId) {
    case 'wait':
      // Keep waiting - extend timeout
      if (vehicleType === 'drone') {
        const waitingDrones = drones.map(d =>
          d.id === vehicleId
            ? { ...d, handoffTimeout: Date.now() + 300000 } // 5 min extended wait
            : d
        );
        updateDrones(waitingDrones);
      }
      break;

    case 'redirect':
      // Redirect to alternate handoff point
      if (vehicleType === 'drone') {
        const redirectedDrones = drones.map(d => {
          if (d.id !== vehicleId) return d;
          return {
            ...d,
            state: DELIVERY_STATES.FLYING,
            handoffProgress: 0,
            redirected: true,
            redirectedAt: Date.now()
          };
        });
        updateDrones(redirectedDrones);
      }
      break;

    case 'direct':
      // Drone delivers directly
      if (vehicleType === 'drone') {
        const directDrones = drones.map(d =>
          d.id === vehicleId
            ? {
                ...d,
                state: DELIVERY_STATES.LANDING,
                directDelivery: true,
                handoffProgress: 0
              }
            : d
        );
        updateDrones(directDrones);
      }
      break;
  }
}

/**
 * Priority Override Effects
 */
function applyPriorityEffect(optionId, vehicleId, vehicleType, context) {
  const { drones, pods, swarmBots, updateDrones, updatePods, updateSwarmBots, setVehiclePriority } = context;

  switch (optionId) {
    case 'intercept':
      // Elevate priority to emergency, redirect vehicle
      setVehiclePriority(vehicleType, vehicleId, DELIVERY_PRIORITY.EMERGENCY);

      if (vehicleType === 'drone') {
        const interceptDrones = drones.map(d =>
          d.id === vehicleId
            ? { ...d, intercepting: true, packages: (d.packages || 0) + 1 }
            : d
        );
        updateDrones(interceptDrones);
      } else if (vehicleType === 'pod') {
        const interceptPods = pods.map(p =>
          p.id === vehicleId
            ? { ...p, intercepting: true, packages: (p.packages || 0) + 1 }
            : p
        );
        updatePods(interceptPods);
      }
      break;

    case 'dispatch':
      // Dispatch reserve - mark a random idle vehicle
      const idleDrone = drones.find(d => d.state === DELIVERY_STATES.IDLE || d.state === DELIVERY_STATES.CHARGING);
      if (idleDrone) {
        const dispatchedDrones = drones.map(d =>
          d.id === idleDrone.id
            ? {
                ...d,
                state: DELIVERY_STATES.TAKING_OFF,
                priority: DELIVERY_PRIORITY.EMERGENCY,
                dispatchedForPriority: true
              }
            : d
        );
        updateDrones(dispatchedDrones);
      }
      break;

    case 'decline':
      // No action, package goes to next available
      break;
  }
}

/**
 * Hub Congestion Effects
 */
function applyHubCongestionEffect(optionId, vehicleId, vehicleType, context) {
  const { drones, pods, swarmBots, updateDrones, updatePods, updateSwarmBots, rooftopHubs, streetHubs } = context;

  switch (optionId) {
    case 'redistribute':
      // Send vehicles to alternate hubs
      if (vehicleType === 'drone') {
        const redistributedDrones = drones.map(d => {
          if (d.state !== DELIVERY_STATES.CHARGING && d.state !== DELIVERY_STATES.LANDING) return d;
          // Find alternate hub
          const alternateHub = rooftopHubs.find(h => h.id !== d.targetHub);
          return alternateHub
            ? { ...d, targetHub: alternateHub.id, redistributed: true }
            : d;
        });
        updateDrones(redistributedDrones);
      } else if (vehicleType === 'pod' || vehicleType === 'swarmbot') {
        const redistributedPods = pods.map(p => {
          if (p.state !== DELIVERY_STATES.CHARGING) return p;
          const alternateHub = streetHubs.find(h => h.id !== p.targetHub);
          return alternateHub
            ? { ...p, targetHub: alternateHub.id, redistributed: true }
            : p;
        });
        updatePods(redistributedPods);
      }
      break;

    case 'priority-queue':
      // Prioritize low battery vehicles - sort by battery level
      // This would affect queue ordering in a real implementation
      const lowBatteryDrones = drones.filter(d => d.batteryLevel < 30);
      if (lowBatteryDrones.length > 0) {
        const prioritizedDrones = drones.map(d =>
          d.batteryLevel < 30
            ? { ...d, priority: DELIVERY_PRIORITY.PRIORITY, queuePrioritized: true }
            : d
        );
        updateDrones(prioritizedDrones);
      }
      break;

    case 'extend-range':
      // Lower battery threshold - risky
      const extendedDrones = drones.map(d => ({
        ...d,
        lowBatteryThreshold: 15, // Lowered from 20
        extendedRange: true
      }));
      updateDrones(extendedDrones);
      break;
  }
}

/**
 * Emergency Landing Effects
 */
function applyEmergencyLandingEffect(optionId, vehicleId, { drones, updateDrones, rooftopHubs }) {
  switch (optionId) {
    case 'nearest-hub':
      // Rush to nearest hub
      const rushDrones = drones.map(d => {
        if (d.id !== vehicleId) return d;
        const nearestHub = getNearestHub(d.position, HUB_TYPES.ROOFTOP);
        return {
          ...d,
          state: DELIVERY_STATES.LANDING,
          targetHub: nearestHub?.id,
          emergencyRush: true
        };
      });
      updateDrones(rushDrones);
      break;

    case 'safe-landing':
      // Land at designated safe zone
      const safeDrones = drones.map(d =>
        d.id === vehicleId
          ? {
              ...d,
              state: DELIVERY_STATES.LANDING,
              emergencyLanding: true,
              safeZoneLanding: true,
              altitude: Math.max((d.altitude || 100) - 20, 0)
            }
          : d
      );
      updateDrones(safeDrones);
      break;

    case 'immediate':
      // Land immediately at current position
      const immediateDrones = drones.map(d =>
        d.id === vehicleId
          ? {
              ...d,
              state: DELIVERY_STATES.LANDING,
              immediateLanding: true,
              altitude: 0
            }
          : d
      );
      updateDrones(immediateDrones);
      break;
  }
}

/**
 * Swarm Rebalance Effects
 */
function applySwarmRebalanceEffect(optionId, { swarmBots, pods, updateSwarmBots, updatePods }) {
  switch (optionId) {
    case 'auto-rebalance':
      // Move some idle bots to different zone
      let movedCount = 0;
      const rebalancedBots = swarmBots.map(bot => {
        if (movedCount >= 4) return bot;
        if (bot.state === DELIVERY_STATES.IDLE) {
          movedCount++;
          // Shift position slightly to simulate zone change
          return {
            ...bot,
            state: DELIVERY_STATES.RETURNING,
            rebalancing: true,
            targetPosition: [
              bot.basePosition[0] + (Math.random() - 0.5) * 0.01,
              bot.basePosition[1] + (Math.random() - 0.5) * 0.01
            ]
          };
        }
        return bot;
      });
      updateSwarmBots(rebalancedBots);
      break;

    case 'pod-dispatch':
      // Use pod to transport bots
      const availablePod = pods.find(p =>
        p.state === DELIVERY_STATES.EN_ROUTE || p.state === DELIVERY_STATES.IDLE
      );
      if (availablePod) {
        const transportPods = pods.map(p =>
          p.id === availablePod.id
            ? { ...p, transportingBots: true, botsToTransport: 4 }
            : p
        );
        updatePods(transportPods);
      }
      break;

    case 'ignore':
      // No action
      break;
  }
}

export default applyDecisionEffect;
