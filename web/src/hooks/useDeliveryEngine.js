import { useCallback, useRef, useEffect } from 'react';
import { useAnimationFrame } from './useAnimationFrame';
import {
  VEHICLE_TYPES,
  DELIVERY_STATES,
  VEHICLE_PHYSICS,
  interpolateCorridorPosition,
  interpolateRoutePosition,
  getNearestHub,
  HUB_TYPES
} from '../data/laDelivery';
import { SCENARIO_TYPES, SCENARIO_CONFIG } from '../data/laDecisionScenarios';
import {
  SWARM_STREET_GRID,
  getNearestStreet,
  getRandomTargetOnStreet
} from '../data/routes/swarmRoutes';

// Simulation constants
const LOW_BATTERY_THRESHOLD = 20;
const HANDOFF_DURATION = 100; // frames

/**
 * Delivery Engine Hook for LA Autonomous Fleet
 * Manages drones, pods, and swarm bots with different physics
 */
export function useDeliveryEngine({
  isRunning,
  speed,
  drones,
  pods,
  swarmBots,
  rooftopHubs,
  streetHubs,
  droneCorridors,
  podRoutes,
  swarmZones,
  updateDrones,
  updatePods,
  updateSwarmBots,
  updateHubs,
  onHandoffComplete,
  onDeliveryComplete,
  onScenarioTrigger
}) {
  // Refs for avoiding stale closures
  const dronesRef = useRef(drones);
  const podsRef = useRef(pods);
  const swarmBotsRef = useRef(swarmBots);
  const speedRef = useRef(speed);
  const rooftopHubsRef = useRef(rooftopHubs);
  const streetHubsRef = useRef(streetHubs);
  const corridorsRef = useRef(droneCorridors);
  const podRoutesRef = useRef(podRoutes);

  // Update refs
  useEffect(() => { dronesRef.current = drones; }, [drones]);
  useEffect(() => { podsRef.current = pods; }, [pods]);
  useEffect(() => { swarmBotsRef.current = swarmBots; }, [swarmBots]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { rooftopHubsRef.current = rooftopHubs; }, [rooftopHubs]);
  useEffect(() => { streetHubsRef.current = streetHubs; }, [streetHubs]);
  useEffect(() => { corridorsRef.current = droneCorridors; }, [droneCorridors]);
  useEffect(() => { podRoutesRef.current = podRoutes; }, [podRoutes]);

  // Get corridor for a drone
  const getCorridorById = useCallback((corridorId) => {
    return corridorsRef.current?.find(c => c.id === corridorId);
  }, []);

  // Get route for a pod
  const getPodRouteById = useCallback((routeId) => {
    return podRoutesRef.current?.find(r => r.id === routeId);
  }, []);

  // Update drones
  const updateDronePhysics = useCallback((drone, deltaSpeed) => {
    const physics = VEHICLE_PHYSICS[VEHICLE_TYPES.DRONE];
    const corridor = getCorridorById(drone.corridorId);
    let newDrone = { ...drone };

    switch (drone.state) {
      case DELIVERY_STATES.FLYING:
      case DELIVERY_STATES.EN_ROUTE: {
        // Move along corridor
        let newProgress = drone.progress + physics.speedMultiplier * deltaSpeed * drone.direction;

        // Bounce at endpoints or reach destination
        if (newProgress >= 1) {
          newProgress = 0.99;
          newDrone.direction = -1;
        } else if (newProgress <= 0) {
          newProgress = 0.01;
          newDrone.direction = 1;
        }

        newDrone.progress = newProgress;
        newDrone.batteryLevel = Math.max(0, drone.batteryLevel - physics.batteryDrain * speedRef.current);

        // Update position from corridor
        if (corridor) {
          newDrone.position = interpolateCorridorPosition(corridor, newProgress);
        }

        // Low battery - need to land
        if (newDrone.batteryLevel < LOW_BATTERY_THRESHOLD) {
          newDrone.state = DELIVERY_STATES.LANDING;
          const nearestHub = getNearestHub(newDrone.position, HUB_TYPES.ROOFTOP);
          if (nearestHub) {
            newDrone.targetHub = nearestHub.id;
          }
        }

        // Random handoff trigger (for demo purposes)
        if (drone.packages > 0 && Math.random() < 0.0005 * speedRef.current) {
          newDrone.state = DELIVERY_STATES.HANDOFF_WAITING;
        }
        break;
      }

      case DELIVERY_STATES.LANDING: {
        // Descend to hub
        newDrone.altitude = Math.max(0, (drone.altitude || 100) - 2 * speedRef.current);
        if (newDrone.altitude <= 0) {
          newDrone.state = DELIVERY_STATES.CHARGING;
          newDrone.altitude = 0;
        }
        break;
      }

      case DELIVERY_STATES.TAKING_OFF: {
        // Ascend
        newDrone.altitude = Math.min(100, (drone.altitude || 0) + 3 * speedRef.current);
        if (newDrone.altitude >= 100) {
          newDrone.state = DELIVERY_STATES.FLYING;
          newDrone.altitude = 100;
        }
        break;
      }

      case DELIVERY_STATES.HOVERING: {
        // Slight position wobble for realism
        newDrone.batteryLevel = Math.max(0, drone.batteryLevel - physics.batteryDrain * 0.5 * speedRef.current);
        break;
      }

      case DELIVERY_STATES.CHARGING:
      case DELIVERY_STATES.SWAPPING: {
        newDrone.batteryLevel = Math.min(100, drone.batteryLevel + physics.chargingRate * speedRef.current);
        if (newDrone.batteryLevel >= 95) {
          newDrone.state = DELIVERY_STATES.TAKING_OFF;
          newDrone.targetHub = null;
          // Give new packages for demo
          newDrone.packages = Math.floor(Math.random() * 2) + 1;
        }
        break;
      }

      case DELIVERY_STATES.HANDOFF_WAITING: {
        newDrone.handoffProgress = (drone.handoffProgress || 0) + 1;
        if (newDrone.handoffProgress >= HANDOFF_DURATION / 2) {
          newDrone.state = DELIVERY_STATES.HANDOFF_ACTIVE;
        }
        break;
      }

      case DELIVERY_STATES.HANDOFF_ACTIVE: {
        newDrone.handoffProgress = (drone.handoffProgress || 0) + 1;
        if (newDrone.handoffProgress >= HANDOFF_DURATION) {
          // Complete handoff
          newDrone.state = DELIVERY_STATES.FLYING;
          newDrone.packages = 0;
          newDrone.handoffProgress = 0;
          onHandoffComplete?.('drone', drone.id);
        }
        break;
      }

      default:
        break;
    }

    return newDrone;
  }, [getCorridorById, onHandoffComplete]);

  // Update pods
  const updatePodPhysics = useCallback((pod, deltaSpeed) => {
    const physics = VEHICLE_PHYSICS[VEHICLE_TYPES.POD];
    const route = getPodRouteById(pod.routeId);
    let newPod = { ...pod };

    switch (pod.state) {
      case DELIVERY_STATES.EN_ROUTE: {
        // Move along route
        let newProgress = pod.progress + physics.speedMultiplier * deltaSpeed * pod.direction;

        if (newProgress >= 1) {
          newProgress = 0.99;
          newPod.direction = -1;
          // Unload at end of route
          if (pod.packages > 0) {
            newPod.state = DELIVERY_STATES.DISPATCHING;
          }
        } else if (newProgress <= 0) {
          newProgress = 0.01;
          newPod.direction = 1;
        }

        newPod.progress = newProgress;
        newPod.batteryLevel = Math.max(0, pod.batteryLevel - physics.batteryDrain * speedRef.current);

        if (route) {
          newPod.position = interpolateRoutePosition(route, newProgress);
        }

        // Low battery
        if (newPod.batteryLevel < LOW_BATTERY_THRESHOLD) {
          newPod.state = DELIVERY_STATES.CHARGING;
          const nearestHub = getNearestHub(newPod.position, HUB_TYPES.STREET);
          if (nearestHub) {
            newPod.targetHub = nearestHub.id;
          }
        }
        break;
      }

      case DELIVERY_STATES.DISPATCHING: {
        // Dispatching swarm bots
        newPod.dispatchProgress = (pod.dispatchProgress || 0) + 1;
        if (newPod.dispatchProgress >= 80) {
          newPod.state = DELIVERY_STATES.EN_ROUTE;
          newPod.packages = Math.max(0, pod.packages - 5);
          newPod.dispatchProgress = 0;
        }
        break;
      }

      case DELIVERY_STATES.LOADING:
      case DELIVERY_STATES.UNLOADING: {
        newPod.loadProgress = (pod.loadProgress || 0) + 1;
        if (newPod.loadProgress >= 60) {
          newPod.state = DELIVERY_STATES.EN_ROUTE;
          newPod.packages = pod.state === DELIVERY_STATES.LOADING ? 15 : 0;
          newPod.loadProgress = 0;
        }
        break;
      }

      case DELIVERY_STATES.CHARGING: {
        newPod.batteryLevel = Math.min(100, pod.batteryLevel + physics.chargingRate * speedRef.current);
        if (newPod.batteryLevel >= 95) {
          newPod.state = DELIVERY_STATES.LOADING;
          newPod.targetHub = null;
        }
        break;
      }

      default:
        break;
    }

    return newPod;
  }, [getPodRouteById]);

  // Helper to get street route for a swarm bot
  const getSwarmStreetRoute = useCallback((bot) => {
    if (!bot.currentStreet || !bot.zoneId) return null;
    const zone = SWARM_STREET_GRID[bot.zoneId];
    if (!zone || !zone.streets) return null;
    return zone.streets.find(s => s.id === bot.currentStreet);
  }, []);

  // Helper to interpolate position along a street route
  const interpolateStreetPosition = useCallback((street, progress) => {
    if (!street || !street.coordinates || street.coordinates.length < 2) return null;
    const coords = street.coordinates;
    const clampedProgress = Math.max(0, Math.min(1, progress));

    // Calculate total distance and find segment
    let totalDist = 0;
    const segmentDists = [];
    for (let i = 0; i < coords.length - 1; i++) {
      const dx = coords[i + 1][0] - coords[i][0];
      const dy = coords[i + 1][1] - coords[i][1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      segmentDists.push(dist);
      totalDist += dist;
    }

    // Find target distance
    const targetDist = clampedProgress * totalDist;
    let accDist = 0;

    for (let i = 0; i < segmentDists.length; i++) {
      if (accDist + segmentDists[i] >= targetDist) {
        const segProgress = (targetDist - accDist) / segmentDists[i];
        return [
          coords[i][0] + (coords[i + 1][0] - coords[i][0]) * segProgress,
          coords[i][1] + (coords[i + 1][1] - coords[i][1]) * segProgress
        ];
      }
      accDist += segmentDists[i];
    }

    return coords[coords.length - 1];
  }, []);

  // Update swarm bots
  const updateSwarmBotPhysics = useCallback((bot, deltaSpeed, allBots) => {
    const physics = VEHICLE_PHYSICS[VEHICLE_TYPES.SWARM_BOT];
    let newBot = { ...bot };

    switch (bot.state) {
      case DELIVERY_STATES.SWARMING:
      case DELIVERY_STATES.EN_ROUTE: {
        // Route-based movement (new: follow street grid)
        const street = getSwarmStreetRoute(bot);
        if (street && bot.routeProgress !== undefined) {
          // Move along street route
          let newProgress = bot.routeProgress + physics.speedMultiplier * deltaSpeed * (bot.routeDirection || 1);

          // Check if arrived at end
          if (newProgress >= 1) {
            newBot.state = DELIVERY_STATES.DELIVERING;
            newBot.routeProgress = 1;
          } else if (newProgress <= 0) {
            newBot.routeProgress = 0;
            newBot.routeDirection = 1;
          } else {
            newBot.routeProgress = newProgress;
          }

          // Update position from street route
          const newPos = interpolateStreetPosition(street, newBot.routeProgress);
          if (newPos) {
            newBot.position = newPos;
          }
        } else if (bot.targetPosition) {
          // Vector-based fallback (original behavior)
          const dx = bot.targetPosition[0] - bot.position[0];
          const dy = bot.targetPosition[1] - bot.position[1];
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 0.0001) {
            const moveSpeed = physics.speedMultiplier * deltaSpeed;
            newBot.position = [
              bot.position[0] + (dx / dist) * moveSpeed,
              bot.position[1] + (dy / dist) * moveSpeed
            ];
          } else {
            // Arrived at target
            newBot.state = DELIVERY_STATES.DELIVERING;
          }
        }

        newBot.batteryLevel = Math.max(0, bot.batteryLevel - physics.batteryDrain * speedRef.current);

        if (newBot.batteryLevel < LOW_BATTERY_THRESHOLD) {
          newBot.state = DELIVERY_STATES.RETURNING;
          // Reset route for return journey
          newBot.routeDirection = -1;
        }
        break;
      }

      case DELIVERY_STATES.DELIVERING: {
        newBot.deliveryProgress = (bot.deliveryProgress || 0) + 1;
        if (newBot.deliveryProgress >= 40) {
          newBot.state = DELIVERY_STATES.RETURNING;
          newBot.packages = 0;
          newBot.deliveryProgress = 0;
          // Set up return route
          newBot.routeDirection = -1;
          onDeliveryComplete?.('swarmbot', bot.id);
        }
        break;
      }

      case DELIVERY_STATES.RETURNING: {
        // Route-based return (follow street back)
        const street = getSwarmStreetRoute(bot);
        if (street && bot.routeProgress !== undefined) {
          // Move back along street route
          let newProgress = bot.routeProgress + physics.speedMultiplier * deltaSpeed * (bot.routeDirection || -1);

          if (newProgress <= 0) {
            newBot.state = DELIVERY_STATES.CHARGING;
            newBot.routeProgress = 0;
          } else {
            newBot.routeProgress = newProgress;
            const newPos = interpolateStreetPosition(street, newBot.routeProgress);
            if (newPos) {
              newBot.position = newPos;
            }
          }
        } else if (bot.basePosition) {
          // Vector-based fallback
          const dx = bot.basePosition[0] - bot.position[0];
          const dy = bot.basePosition[1] - bot.position[1];
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 0.0001) {
            const moveSpeed = physics.speedMultiplier * deltaSpeed;
            newBot.position = [
              bot.position[0] + (dx / dist) * moveSpeed,
              bot.position[1] + (dy / dist) * moveSpeed
            ];
          } else {
            newBot.state = DELIVERY_STATES.CHARGING;
          }
        }
        newBot.batteryLevel = Math.max(0, bot.batteryLevel - physics.batteryDrain * 0.5 * speedRef.current);
        break;
      }

      case DELIVERY_STATES.CHARGING: {
        newBot.batteryLevel = Math.min(100, bot.batteryLevel + physics.chargingRate * speedRef.current);
        if (newBot.batteryLevel >= 90) {
          // Ready for next delivery
          newBot.state = DELIVERY_STATES.IDLE;
          // Clear route for next trip
          newBot.currentStreet = null;
          newBot.routeProgress = undefined;
        }
        break;
      }

      case DELIVERY_STATES.IDLE: {
        // Random activation for demo
        if (Math.random() < 0.002 * speedRef.current) {
          newBot.state = DELIVERY_STATES.SWARMING;
          newBot.packages = Math.floor(Math.random() * 3) + 1;

          // Try to assign a street route from zone
          if (bot.zoneId) {
            const nearestStreet = getNearestStreet(bot.basePosition, bot.zoneId);
            if (nearestStreet) {
              newBot.currentStreet = nearestStreet.id;
              newBot.routeProgress = 0;
              newBot.routeDirection = 1;
              // Target is end of street
              const coords = nearestStreet.coordinates;
              if (coords && coords.length > 0) {
                newBot.targetPosition = coords[coords.length - 1];
              }
            } else {
              // Fallback: random target within zone
              const offset = 0.005;
              newBot.targetPosition = [
                bot.basePosition[0] + (Math.random() - 0.5) * offset * 2,
                bot.basePosition[1] + (Math.random() - 0.5) * offset * 2
              ];
            }
          } else {
            // Fallback: random target within zone
            const offset = 0.005;
            newBot.targetPosition = [
              bot.basePosition[0] + (Math.random() - 0.5) * offset * 2,
              bot.basePosition[1] + (Math.random() - 0.5) * offset * 2
            ];
          }
        }
        break;
      }

      case DELIVERY_STATES.HANDOFF_WAITING:
      case DELIVERY_STATES.HANDOFF_ACTIVE: {
        newBot.handoffProgress = (bot.handoffProgress || 0) + 1;
        if (newBot.handoffProgress >= HANDOFF_DURATION) {
          newBot.state = DELIVERY_STATES.DELIVERING;
          newBot.handoffProgress = 0;
        }
        break;
      }

      default:
        break;
    }

    return newBot;
  }, [onDeliveryComplete, getSwarmStreetRoute, interpolateStreetPosition]);

  // Main update loop
  const updateSimulation = useCallback((deltaTime) => {
    const currentDrones = dronesRef.current;
    const currentPods = podsRef.current;
    const currentSwarmBots = swarmBotsRef.current;
    const currentSpeed = speedRef.current;

    if (!currentDrones && !currentPods && !currentSwarmBots) return;

    const deltaSpeed = currentSpeed * deltaTime;

    // Update drones
    if (currentDrones && updateDrones) {
      const updatedDrones = currentDrones.map(drone =>
        updateDronePhysics(drone, deltaSpeed)
      );
      updateDrones(updatedDrones);
    }

    // Update pods
    if (currentPods && updatePods) {
      const updatedPods = currentPods.map(pod =>
        updatePodPhysics(pod, deltaSpeed)
      );
      updatePods(updatedPods);
    }

    // Update swarm bots
    if (currentSwarmBots && updateSwarmBots) {
      const updatedBots = currentSwarmBots.map(bot =>
        updateSwarmBotPhysics(bot, deltaSpeed, currentSwarmBots)
      );
      updateSwarmBots(updatedBots);
    }

    // Scenario triggers now manual - removed automatic triggering
  }, [updateDronePhysics, updatePodPhysics, updateSwarmBotPhysics, updateDrones, updatePods, updateSwarmBots, onScenarioTrigger]);

  // Run animation frame
  useAnimationFrame(updateSimulation, isRunning);

  return {
    // Expose control methods if needed
  };
}

export default useDeliveryEngine;
