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

// Robot states
export const ROBOT_STATES = {
  IDLE: 'idle',
  DISPATCHED: 'dispatched',
  CONNECTING: 'connecting',
  ACTIVE: 'active',
  SWAPPING: 'swapping',
  RETURNING: 'returning',
};

// Charging priority levels
export const CHARGING_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  EMERGENCY: 'emergency',
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
      // New fields for decision tracking
      decisionHistory: [],
      chargingPriority: CHARGING_PRIORITY.NORMAL,
      targetStation: null,
      lastRobotInteraction: null,
      swapProgress: 0,
    };
  });
}

// Initialize stations for a city
function initializeStations(city) {
  return city.stations.map(s => ({
    ...s,
    currentPower: 0,
    busesCharging: [],
    // Robot A - bus-mounted charger robot
    robotAStatus: ROBOT_STATES.IDLE,
    robotATargetBus: null,
    robotAProgress: 0,
    // Robot B - station swap robot
    robotBStatus: ROBOT_STATES.IDLE,
    robotBTargetBus: null,
    robotBProgress: 0,
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
    // KorAllThing orchestrator panel state
    korAllThingExpanded: false,
    scenarioQueue: [], // List of all scenarios (active, pending, completed)
    systemHealth: { status: 'healthy', modules: 0, active: 0 },
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
  // New decision-related actions
  FORCE_CHARGE_BUS: 'FORCE_CHARGE_BUS',
  TRIGGER_SWAP: 'TRIGGER_SWAP',
  DISPATCH_ROBOT: 'DISPATCH_ROBOT',
  UPDATE_ROBOT_STATUS: 'UPDATE_ROBOT_STATUS',
  SET_BUS_STATE: 'SET_BUS_STATE',
  SET_BUS_PRIORITY: 'SET_BUS_PRIORITY',
  ADD_BUS_DECISION_HISTORY: 'ADD_BUS_DECISION_HISTORY',
  // KorAllThing orchestrator actions
  TOGGLE_KOR_ALL_THING: 'TOGGLE_KOR_ALL_THING',
  SET_KOR_ALL_THING_EXPANDED: 'SET_KOR_ALL_THING_EXPANDED',
  ADD_TO_SCENARIO_QUEUE: 'ADD_TO_SCENARIO_QUEUE',
  UPDATE_SCENARIO_STATUS: 'UPDATE_SCENARIO_STATUS',
  CLEAR_SCENARIO_QUEUE: 'CLEAR_SCENARIO_QUEUE',
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

    // New decision-related reducer cases
    case ACTIONS.FORCE_CHARGE_BUS: {
      const { busId, stationId } = action.payload;
      return {
        ...state,
        buses: state.buses.map(bus =>
          bus.id === busId
            ? {
                ...bus,
                state: BUS_STATES.CHARGING,
                targetStation: stationId,
                chargingPriority: CHARGING_PRIORITY.HIGH,
              }
            : bus
        ),
      };
    }

    case ACTIONS.TRIGGER_SWAP: {
      const { busId, stationId } = action.payload;
      return {
        ...state,
        buses: state.buses.map(bus =>
          bus.id === busId
            ? {
                ...bus,
                state: BUS_STATES.SWAPPING,
                targetStation: stationId,
                swapProgress: 0,
              }
            : bus
        ),
        chargingStations: state.chargingStations.map(station =>
          station.id === stationId
            ? {
                ...station,
                robotBStatus: ROBOT_STATES.DISPATCHED,
                robotBTargetBus: busId,
                robotBProgress: 0,
              }
            : station
        ),
      };
    }

    case ACTIONS.DISPATCH_ROBOT: {
      const { stationId, robotId, busId } = action.payload;
      const robotField = robotId === 'A' ? 'robotAStatus' : 'robotBStatus';
      const targetField = robotId === 'A' ? 'robotATargetBus' : 'robotBTargetBus';
      const progressField = robotId === 'A' ? 'robotAProgress' : 'robotBProgress';

      return {
        ...state,
        chargingStations: state.chargingStations.map(station =>
          station.id === stationId
            ? {
                ...station,
                [robotField]: ROBOT_STATES.DISPATCHED,
                [targetField]: busId,
                [progressField]: 0,
              }
            : station
        ),
      };
    }

    case ACTIONS.UPDATE_ROBOT_STATUS: {
      const { stationId, robotId, status, progress } = action.payload;
      const robotField = robotId === 'A' ? 'robotAStatus' : 'robotBStatus';
      const progressField = robotId === 'A' ? 'robotAProgress' : 'robotBProgress';

      return {
        ...state,
        chargingStations: state.chargingStations.map(station =>
          station.id === stationId
            ? {
                ...station,
                [robotField]: status,
                ...(progress !== undefined && { [progressField]: progress }),
              }
            : station
        ),
      };
    }

    case ACTIONS.SET_BUS_STATE: {
      const { busId, busState, extras = {} } = action.payload;
      return {
        ...state,
        buses: state.buses.map(bus =>
          bus.id === busId
            ? { ...bus, state: busState, ...extras }
            : bus
        ),
      };
    }

    case ACTIONS.SET_BUS_PRIORITY: {
      const { busId, priority } = action.payload;
      return {
        ...state,
        buses: state.buses.map(bus =>
          bus.id === busId
            ? { ...bus, chargingPriority: priority }
            : bus
        ),
      };
    }

    case ACTIONS.ADD_BUS_DECISION_HISTORY: {
      const { busId, entry } = action.payload;
      return {
        ...state,
        buses: state.buses.map(bus =>
          bus.id === busId
            ? {
                ...bus,
                decisionHistory: [
                  ...bus.decisionHistory.slice(-9), // Keep last 10
                  { ...entry, timestamp: Date.now() }
                ]
              }
            : bus
        ),
      };
    }

    // KorAllThing orchestrator reducer cases
    case ACTIONS.TOGGLE_KOR_ALL_THING:
      return { ...state, korAllThingExpanded: !state.korAllThingExpanded };

    case ACTIONS.SET_KOR_ALL_THING_EXPANDED:
      return { ...state, korAllThingExpanded: action.payload };

    case ACTIONS.ADD_TO_SCENARIO_QUEUE: {
      const scenario = action.payload;
      return {
        ...state,
        scenarioQueue: [
          ...state.scenarioQueue.filter(s => s.id !== scenario.id),
          { ...scenario, addedAt: Date.now() }
        ].slice(-20), // Keep last 20 scenarios
      };
    }

    case ACTIONS.UPDATE_SCENARIO_STATUS: {
      const { scenarioId, status } = action.payload;
      return {
        ...state,
        scenarioQueue: state.scenarioQueue.map(s =>
          s.id === scenarioId ? { ...s, status, updatedAt: Date.now() } : s
        ),
      };
    }

    case ACTIONS.CLEAR_SCENARIO_QUEUE:
      return { ...state, scenarioQueue: [] };

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

  // New decision action creators
  const forceChargeBus = useCallback((busId, stationId) =>
    dispatch({ type: ACTIONS.FORCE_CHARGE_BUS, payload: { busId, stationId } }), []);

  const triggerSwap = useCallback((busId, stationId) =>
    dispatch({ type: ACTIONS.TRIGGER_SWAP, payload: { busId, stationId } }), []);

  const dispatchRobot = useCallback((stationId, robotId, busId) =>
    dispatch({ type: ACTIONS.DISPATCH_ROBOT, payload: { stationId, robotId, busId } }), []);

  const updateRobotStatus = useCallback((stationId, robotId, status, progress) =>
    dispatch({ type: ACTIONS.UPDATE_ROBOT_STATUS, payload: { stationId, robotId, status, progress } }), []);

  const setBusState = useCallback((busId, busState, extras = {}) =>
    dispatch({ type: ACTIONS.SET_BUS_STATE, payload: { busId, busState, extras } }), []);

  const setBusPriority = useCallback((busId, priority) =>
    dispatch({ type: ACTIONS.SET_BUS_PRIORITY, payload: { busId, priority } }), []);

  const addBusDecisionHistory = useCallback((busId, entry) =>
    dispatch({ type: ACTIONS.ADD_BUS_DECISION_HISTORY, payload: { busId, entry } }), []);

  // KorAllThing orchestrator action creators
  const toggleKorAllThing = useCallback(() =>
    dispatch({ type: ACTIONS.TOGGLE_KOR_ALL_THING }), []);

  const setKorAllThingExpanded = useCallback((expanded) =>
    dispatch({ type: ACTIONS.SET_KOR_ALL_THING_EXPANDED, payload: expanded }), []);

  const addToScenarioQueue = useCallback((scenario) =>
    dispatch({ type: ACTIONS.ADD_TO_SCENARIO_QUEUE, payload: scenario }), []);

  const updateScenarioStatus = useCallback((scenarioId, status) =>
    dispatch({ type: ACTIONS.UPDATE_SCENARIO_STATUS, payload: { scenarioId, status } }), []);

  const clearScenarioQueue = useCallback(() =>
    dispatch({ type: ACTIONS.CLEAR_SCENARIO_QUEUE }), []);

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
    // New decision actions
    forceChargeBus,
    triggerSwap,
    dispatchRobot,
    updateRobotStatus,
    setBusState,
    setBusPriority,
    addBusDecisionHistory,
    // KorAllThing orchestrator actions
    toggleKorAllThing,
    setKorAllThingExpanded,
    addToScenarioQueue,
    updateScenarioStatus,
    clearScenarioQueue,
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
