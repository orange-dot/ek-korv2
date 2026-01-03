import { createContext, useContext, useReducer, useCallback } from 'react';
import { cities, getCity } from '../data/cities';

const SimulationContext = createContext(null);

// Bus states
export const BUS_STATES = {
  DRIVING: 'driving',
  CHARGING: 'charging',
  WAITING: 'waiting',
  SWAPPING: 'swapping',
};

// Generate buses for a city
function generateBuses(city) {
  const count = city.busCount;
  const routes = city.routes;

  return Array.from({ length: count }, (_, i) => {
    const route = routes[i % routes.length];
    return {
      id: `bus-${i + 1}`,
      name: `Bus ${i + 1}`,
      routeId: route.id,
      progress: Math.random() * 0.8,
      batteryLevel: 50 + Math.random() * 50,
      state: BUS_STATES.DRIVING,
      direction: Math.random() > 0.5 ? 1 : -1,
    };
  });
}

// Initialize stations for a city
function initializeStations(city) {
  return city.stations.map(s => ({
    ...s,
    currentPower: 0,
    busesCharging: [],
    robotAStatus: 'idle',
    robotBStatus: 'idle',
  }));
}

// Get initial state for a city
function getInitialStateForCity(cityId) {
  const city = getCity(cityId);
  return {
    isRunning: false,
    speed: 1,
    cityId: cityId,
    city: city,
    buses: generateBuses(city),
    routes: city.routes,
    chargingStations: initializeStations(city),
    selectedItem: null, // { type: 'bus' | 'station', id: string }
    pendingDecision: null, // { busId, type, message } - for human-in-the-loop
  };
}

// Initial state - default to Novi Sad
const initialState = getInitialStateForCity('noviSad');

// Action types
const ACTIONS = {
  START: 'START',
  STOP: 'STOP',
  SET_SPEED: 'SET_SPEED',
  UPDATE_BUSES: 'UPDATE_BUSES',
  UPDATE_STATIONS: 'UPDATE_STATIONS',
  CHANGE_CITY: 'CHANGE_CITY',
  SELECT_ITEM: 'SELECT_ITEM',
  CLEAR_SELECTION: 'CLEAR_SELECTION',
  SET_PENDING_DECISION: 'SET_PENDING_DECISION',
  CLEAR_PENDING_DECISION: 'CLEAR_PENDING_DECISION',
};

// Reducer
function simulationReducer(state, action) {
  switch (action.type) {
    case ACTIONS.START:
      return { ...state, isRunning: true };

    case ACTIONS.STOP:
      return { ...state, isRunning: false };

    case ACTIONS.SET_SPEED:
      return { ...state, speed: action.payload };

    case ACTIONS.UPDATE_BUSES:
      return { ...state, buses: action.payload };

    case ACTIONS.UPDATE_STATIONS:
      return { ...state, chargingStations: action.payload };

    case ACTIONS.CHANGE_CITY: {
      const newCityId = action.payload;
      const newCity = getCity(newCityId);
      return {
        ...state,
        isRunning: true,
        cityId: newCityId,
        city: newCity,
        buses: generateBuses(newCity),
        routes: newCity.routes,
        chargingStations: initializeStations(newCity),
        selectedItem: null,
      };
    }

    case ACTIONS.SELECT_ITEM:
      return { ...state, selectedItem: action.payload };

    case ACTIONS.CLEAR_SELECTION:
      return { ...state, selectedItem: null };

    case ACTIONS.SET_PENDING_DECISION:
      return { ...state, pendingDecision: action.payload };

    case ACTIONS.CLEAR_PENDING_DECISION:
      return { ...state, pendingDecision: null };

    default:
      return state;
  }
}

// Provider component
export function SimulationProvider({ children }) {
  const [state, dispatch] = useReducer(simulationReducer, initialState);

  const start = useCallback(() => dispatch({ type: ACTIONS.START }), []);
  const stop = useCallback(() => dispatch({ type: ACTIONS.STOP }), []);
  const setSpeed = useCallback((speed) => dispatch({ type: ACTIONS.SET_SPEED, payload: speed }), []);
  const updateBuses = useCallback((buses) => dispatch({ type: ACTIONS.UPDATE_BUSES, payload: buses }), []);
  const updateStations = useCallback((stations) => dispatch({ type: ACTIONS.UPDATE_STATIONS, payload: stations }), []);
  const changeCity = useCallback((cityId) => dispatch({ type: ACTIONS.CHANGE_CITY, payload: cityId }), []);
  const selectItem = useCallback((type, id) => dispatch({ type: ACTIONS.SELECT_ITEM, payload: { type, id } }), []);
  const clearSelection = useCallback(() => dispatch({ type: ACTIONS.CLEAR_SELECTION }), []);
  const setPendingDecision = useCallback((decision) => dispatch({ type: ACTIONS.SET_PENDING_DECISION, payload: decision }), []);
  const clearPendingDecision = useCallback(() => dispatch({ type: ACTIONS.CLEAR_PENDING_DECISION }), []);

  const value = {
    ...state,
    start,
    stop,
    setSpeed,
    updateBuses,
    updateStations,
    changeCity,
    selectItem,
    clearSelection,
    setPendingDecision,
    clearPendingDecision,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

// Hook
export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
