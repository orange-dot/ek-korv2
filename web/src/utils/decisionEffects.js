/**
 * Decision Effects Utility
 * Maps decision types and selected options to simulation actions
 */

import { BUS_STATES, CHARGING_PRIORITY, ROBOT_STATES } from '../context/SimulationContext';

// Scenario types (must match KorHUD.jsx)
export const SCENARIO_TYPES = {
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

/**
 * Find nearest station to a bus
 */
function findNearestStation(busId, buses, stations) {
  const bus = buses.find(b => b.id === busId);
  if (!bus) return stations[0];

  // For now, return first available station with capacity
  // TODO: Calculate actual distance based on route position
  const availableStation = stations.find(s =>
    s.busesCharging.length < s.chargingPoints
  );
  return availableStation || stations[0];
}

/**
 * Find station with swap capability
 */
function findSwapStation(busId, buses, stations) {
  const bus = buses.find(b => b.id === busId);
  if (!bus) return stations.find(s => s.hasRobotB) || stations[0];

  // Find station with Robot B available
  const swapStation = stations.find(s =>
    s.hasRobotB && s.robotBStatus === ROBOT_STATES.IDLE
  );
  return swapStation || stations.find(s => s.hasRobotB) || stations[0];
}

/**
 * Apply decision effect to simulation
 * @param {Object} decision - The decision object from KorHUD
 * @param {Object} selectedOption - The option user selected
 * @param {Object} context - Simulation context with actions and state
 */
export function applyDecisionEffect(decision, selectedOption, context) {
  const {
    forceChargeBus,
    triggerSwap,
    dispatchRobot,
    setBusState,
    setBusPriority,
    addBusDecisionHistory,
    buses,
    chargingStations,
  } = context;

  // Always log to decision history
  addBusDecisionHistory(decision.busId, {
    type: decision.type,
    message: decision.message,
    optionSelected: selectedOption.id,
    optionLabel: selectedOption.label,
  });

  switch (decision.type) {
    case SCENARIO_TYPES.TRAFFIC_JAM:
      if (selectedOption.id === 'reroute') {
        // Reroute bus - for now just mark it as rerouted
        setBusState(decision.busId, BUS_STATES.DRIVING, {
          isRerouted: true,
          reroute: {
            reason: 'traffic_jam',
            timestamp: Date.now(),
          }
        });
      }
      // 'wait' option - no state change, bus continues
      break;

    case SCENARIO_TYPES.REROUTE:
      if (selectedOption.id === 'apply') {
        setBusState(decision.busId, BUS_STATES.DRIVING, {
          isOptimized: true,
          optimization: {
            type: 'route',
            timestamp: Date.now(),
          }
        });
      }
      break;

    case SCENARIO_TYPES.MAINTENANCE:
      if (selectedOption.id === 'inspect') {
        // Send bus to nearest depot for inspection
        const depot = chargingStations.find(s => s.type === 'depot') || chargingStations[0];
        setBusState(decision.busId, BUS_STATES.WAITING, {
          targetStation: depot.id,
          maintenanceRequired: true,
        });
        setBusPriority(decision.busId, CHARGING_PRIORITY.HIGH);
      } else if (selectedOption.id === 'monitor') {
        // Flag for enhanced monitoring
        setBusState(decision.busId, BUS_STATES.DRIVING, {
          enhancedMonitoring: true,
        });
      }
      // 'ignore' - no change
      break;

    case SCENARIO_TYPES.FORCE_MAJEURE:
      if (selectedOption.id === 'protocol') {
        // Activate emergency protocol
        setBusState(decision.busId, BUS_STATES.DRIVING, {
          emergencyProtocol: true,
          protocolType: 'force_majeure',
          timestamp: Date.now(),
        });
      } else if (selectedOption.id === 'manual') {
        // Flag for manual control
        setBusState(decision.busId, BUS_STATES.DRIVING, {
          manualOverride: true,
          timestamp: Date.now(),
        });
      }
      break;

    case SCENARIO_TYPES.CRITICAL_BATTERY:
    case SCENARIO_TYPES.LOW_BATTERY:
      if (selectedOption.id === 'charge') {
        const station = findNearestStation(decision.busId, buses, chargingStations);
        forceChargeBus(decision.busId, station.id);
        setBusPriority(decision.busId, CHARGING_PRIORITY.EMERGENCY);
      } else if (selectedOption.id === 'swap') {
        const swapStation = findSwapStation(decision.busId, buses, chargingStations);
        if (swapStation) {
          triggerSwap(decision.busId, swapStation.id);
          dispatchRobot(swapStation.id, 'B', decision.busId);
        }
      }
      // 'continue' - dangerous, no change but flag it
      if (selectedOption.id === 'continue') {
        setBusState(decision.busId, BUS_STATES.DRIVING, {
          lowBatteryOverride: true,
          overrideTimestamp: Date.now(),
        });
      }
      break;

    case SCENARIO_TYPES.CHARGING_QUEUE:
      if (selectedOption.id === 'ai') {
        // Elevate bus priority based on AI recommendation
        setBusPriority(decision.busId, CHARGING_PRIORITY.HIGH);
        // Could also reorder queue in future
      }
      // 'fifo' - standard, no change
      break;

    case SCENARIO_TYPES.SWAP_MODULE:
      if (selectedOption.id === 'swap') {
        const swapStation = findSwapStation(decision.busId, buses, chargingStations);
        if (swapStation) {
          triggerSwap(decision.busId, swapStation.id);
          dispatchRobot(swapStation.id, 'B', decision.busId);
        }
      } else if (selectedOption.id === 'charge') {
        const station = findNearestStation(decision.busId, buses, chargingStations);
        forceChargeBus(decision.busId, station.id);
      }
      break;

    case SCENARIO_TYPES.FLEET_EMPTY:
      if (selectedOption.id === 'emergency') {
        // Set emergency charging priority for this bus
        setBusPriority(decision.busId, CHARGING_PRIORITY.EMERGENCY);
        // In future: could set all stations to max power mode
        const station = findNearestStation(decision.busId, buses, chargingStations);
        forceChargeBus(decision.busId, station.id);
      } else if (selectedOption.id === 'reduce') {
        // Mark bus to be withdrawn from service
        setBusState(decision.busId, BUS_STATES.WAITING, {
          withdrawn: true,
          reason: 'fleet_optimization',
        });
      }
      break;

    case SCENARIO_TYPES.ROBOT_DISPATCH:
      // Dispatch Robot A to bus for charging connection
      const robotStation = chargingStations.find(s =>
        s.hasRobotA && s.robotAStatus === ROBOT_STATES.IDLE
      ) || chargingStations[0];

      if (robotStation) {
        dispatchRobot(robotStation.id, 'A', decision.busId);
      }
      break;

    default:
      console.warn('Unknown decision type:', decision.type);
  }
}

/**
 * Get default/recommended option for AI timeout handling
 */
export function getRecommendedOption(decision) {
  if (!decision.options || decision.options.length === 0) {
    return null;
  }
  // Return recommended option or first option
  return decision.options.find(o => o.recommended) || decision.options[0];
}

/**
 * Handle decision timeout - AI takes over
 */
export function handleDecisionTimeout(decision, context) {
  const recommendedOption = getRecommendedOption(decision);
  if (recommendedOption) {
    // Log that AI took over
    context.addBusDecisionHistory(decision.busId, {
      type: decision.type,
      message: decision.message,
      optionSelected: recommendedOption.id,
      optionLabel: recommendedOption.label,
      aiTakeover: true,
    });

    applyDecisionEffect(decision, recommendedOption, context);
  }
}
