import { useCallback, useRef, useEffect } from 'react';
import { useSimulation, BUS_STATES, ROBOT_STATES } from '../context/SimulationContext';
import { useAnimationFrame } from './useAnimationFrame';

const SPEED_MULTIPLIER = 0.00005;
const BATTERY_DRAIN_RATE = 0.0005;
const CHARGING_RATE = 0.02;
const LOW_BATTERY_THRESHOLD = 20;

// Robot timing constants
const ROBOT_DISPATCH_SPEED = 0.5; // Progress per frame when dispatched
const ROBOT_CONNECT_TIME = 50; // Progress units to connect
const SWAP_RATE = 1.0; // Swap progress per frame

export function useSimulationEngine() {
  const {
    isRunning,
    speed,
    buses,
    routes,
    chargingStations,
    updateBuses,
    updateStations,
    start,
  } = useSimulation();

  // Use refs to avoid dependency issues
  const busesRef = useRef(buses);
  const speedRef = useRef(speed);
  const stationsRef = useRef(chargingStations);
  const routesRef = useRef(routes);

  useEffect(() => {
    busesRef.current = buses;
  }, [buses]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    stationsRef.current = chargingStations;
  }, [chargingStations]);

  useEffect(() => {
    routesRef.current = routes;
  }, [routes]);

  // Auto-start simulation
  useEffect(() => {
    start();
  }, [start]);

  const getRouteById = useCallback((routeId) => {
    return routesRef.current.find(r => r.id === routeId);
  }, []);

  const updateSimulation = useCallback((deltaTime) => {
    const currentBuses = busesRef.current;
    const currentSpeed = speedRef.current;
    const currentStations = stationsRef.current;

    if (!currentBuses || currentBuses.length === 0) return;

    const effectiveSpeed = currentSpeed * SPEED_MULTIPLIER * deltaTime;

    // Update buses
    const updatedBuses = currentBuses.map(bus => {
      const route = getRouteById(bus.routeId);
      if (!route) return bus;

      let newBus = { ...bus };

      switch (bus.state) {
        case BUS_STATES.DRIVING: {
          let newProgress = bus.progress + effectiveSpeed * bus.direction;

          // Bounce at endpoints
          if (newProgress >= 1) {
            newProgress = 0.99;
            newBus.direction = -1;
          } else if (newProgress <= 0) {
            newProgress = 0.01;
            newBus.direction = 1;
          }

          newBus.progress = newProgress;
          newBus.batteryLevel = Math.max(0, bus.batteryLevel - BATTERY_DRAIN_RATE * currentSpeed);

          // Low battery - go to charging
          if (newBus.batteryLevel < LOW_BATTERY_THRESHOLD) {
            const routeStations = route.stations;
            if (routeStations && routeStations.length > 0) {
              newBus.state = BUS_STATES.CHARGING;
              newBus.targetStation = routeStations[0];
            }
          }
          break;
        }

        case BUS_STATES.CHARGING: {
          newBus.batteryLevel = Math.min(100, bus.batteryLevel + CHARGING_RATE * currentSpeed);

          if (newBus.batteryLevel >= 95) {
            newBus.state = BUS_STATES.DRIVING;
            newBus.targetStation = null;
          }
          break;
        }

        case BUS_STATES.WAITING:
          newBus.state = BUS_STATES.CHARGING;
          break;

        case BUS_STATES.SWAPPING: {
          // Swap progress simulation
          const swapProgress = (bus.swapProgress || 0) + SWAP_RATE * currentSpeed;
          newBus.swapProgress = swapProgress;

          if (swapProgress >= 100) {
            newBus.batteryLevel = 100;
            newBus.state = BUS_STATES.DRIVING;
            newBus.swapProgress = 0;
            newBus.targetStation = null;
          }
          break;
        }

        default:
          break;
      }

      return newBus;
    });

    updateBuses(updatedBuses);

    // Update stations with robot state machine
    const updatedStations = currentStations.map(station => {
      const busesAtStation = updatedBuses.filter(
        b => (b.state === BUS_STATES.CHARGING || b.state === BUS_STATES.SWAPPING) && b.targetStation === station.id
      );
      const swappingBus = updatedBuses.find(
        b => b.state === BUS_STATES.SWAPPING && b.targetStation === station.id
      );

      let newStation = {
        ...station,
        busesCharging: busesAtStation.map(b => b.id),
        currentPower: busesAtStation.length * 50,
      };

      // Robot A state machine (charging robot)
      if (station.hasRobotA) {
        const targetBusA = updatedBuses.find(b => b.id === station.robotATargetBus);
        const busNeedsRobotA = busesAtStation.find(b => b.state === BUS_STATES.CHARGING);

        switch (station.robotAStatus) {
          case ROBOT_STATES.IDLE:
            // If a bus is charging, dispatch robot
            if (busNeedsRobotA && !station.robotATargetBus) {
              newStation.robotAStatus = ROBOT_STATES.DISPATCHED;
              newStation.robotATargetBus = busNeedsRobotA.id;
              newStation.robotAProgress = 0;
            }
            break;

          case ROBOT_STATES.DISPATCHED:
            newStation.robotAProgress = (station.robotAProgress || 0) + ROBOT_DISPATCH_SPEED * currentSpeed;
            if (newStation.robotAProgress >= 100) {
              newStation.robotAStatus = ROBOT_STATES.CONNECTING;
              newStation.robotAProgress = 0;
            }
            break;

          case ROBOT_STATES.CONNECTING:
            newStation.robotAProgress = (station.robotAProgress || 0) + ROBOT_DISPATCH_SPEED * currentSpeed;
            if (newStation.robotAProgress >= ROBOT_CONNECT_TIME) {
              newStation.robotAStatus = ROBOT_STATES.ACTIVE;
              newStation.robotAProgress = 0;
            }
            break;

          case ROBOT_STATES.ACTIVE:
            // Stay active while bus is charging
            if (!targetBusA || targetBusA.state !== BUS_STATES.CHARGING) {
              newStation.robotAStatus = ROBOT_STATES.RETURNING;
              newStation.robotAProgress = 100;
            }
            break;

          case ROBOT_STATES.RETURNING:
            newStation.robotAProgress = Math.max(0, (station.robotAProgress || 0) - ROBOT_DISPATCH_SPEED * currentSpeed);
            if (newStation.robotAProgress <= 0) {
              newStation.robotAStatus = ROBOT_STATES.IDLE;
              newStation.robotATargetBus = null;
              newStation.robotAProgress = 0;
            }
            break;

          default:
            break;
        }
      }

      // Robot B state machine (swap robot)
      if (station.hasRobotB) {
        const targetBusB = updatedBuses.find(b => b.id === station.robotBTargetBus);

        switch (station.robotBStatus) {
          case ROBOT_STATES.IDLE:
            // Will be activated by triggerSwap action, not automatically
            break;

          case ROBOT_STATES.DISPATCHED:
            newStation.robotBProgress = (station.robotBProgress || 0) + ROBOT_DISPATCH_SPEED * currentSpeed;
            if (newStation.robotBProgress >= 100) {
              newStation.robotBStatus = ROBOT_STATES.CONNECTING;
              newStation.robotBProgress = 0;
            }
            break;

          case ROBOT_STATES.CONNECTING:
            newStation.robotBProgress = (station.robotBProgress || 0) + ROBOT_DISPATCH_SPEED * currentSpeed;
            if (newStation.robotBProgress >= ROBOT_CONNECT_TIME) {
              newStation.robotBStatus = ROBOT_STATES.SWAPPING;
              newStation.robotBProgress = 0;
            }
            break;

          case ROBOT_STATES.SWAPPING:
            // Track swap progress with bus
            if (swappingBus) {
              newStation.robotBProgress = swappingBus.swapProgress || 0;
            }
            // When swap complete, return to idle
            if (!targetBusB || targetBusB.state !== BUS_STATES.SWAPPING) {
              newStation.robotBStatus = ROBOT_STATES.RETURNING;
              newStation.robotBProgress = 100;
            }
            break;

          case ROBOT_STATES.RETURNING:
            newStation.robotBProgress = Math.max(0, (station.robotBProgress || 0) - ROBOT_DISPATCH_SPEED * currentSpeed);
            if (newStation.robotBProgress <= 0) {
              newStation.robotBStatus = ROBOT_STATES.IDLE;
              newStation.robotBTargetBus = null;
              newStation.robotBProgress = 0;
            }
            break;

          default:
            break;
        }
      }

      return newStation;
    });

    updateStations(updatedStations);
  }, [updateBuses, updateStations, getRouteById]);

  useAnimationFrame(updateSimulation, isRunning);
}
