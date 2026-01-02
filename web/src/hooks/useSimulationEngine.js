import { useCallback, useRef, useEffect } from 'react';
import { useSimulation, BUS_STATES } from '../context/SimulationContext';
import { useAnimationFrame } from './useAnimationFrame';

const SPEED_MULTIPLIER = 0.00005;
const BATTERY_DRAIN_RATE = 0.0005;
const CHARGING_RATE = 0.02;
const LOW_BATTERY_THRESHOLD = 20;

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

        case BUS_STATES.SWAPPING:
          newBus.batteryLevel = 100;
          newBus.state = BUS_STATES.DRIVING;
          break;

        default:
          break;
      }

      return newBus;
    });

    updateBuses(updatedBuses);

    // Update stations
    const updatedStations = currentStations.map(station => {
      const busesAtStation = updatedBuses.filter(
        b => b.state === BUS_STATES.CHARGING && b.targetStation === station.id
      );

      return {
        ...station,
        busesCharging: busesAtStation.map(b => b.id),
        currentPower: busesAtStation.length * 50,
        robotAStatus: busesAtStation.length > 0 ? 'active' : 'idle',
        robotBStatus: busesAtStation.length > 2 ? 'active' : 'idle',
      };
    });

    updateStations(updatedStations);
  }, [updateBuses, updateStations, getRouteById]);

  useAnimationFrame(updateSimulation, isRunning);
}
