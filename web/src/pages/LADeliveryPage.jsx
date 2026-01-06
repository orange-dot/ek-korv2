import { useState, useCallback, useMemo, useEffect, useRef, createContext, useContext, useReducer } from 'react';
import { MapContainer, TileLayer, useMap, CircleMarker, Polyline, Tooltip } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  Activity,
  CheckCircle,
  Clock,
  Cpu,
  Zap,
  Bot,
  Eye,
  Workflow,
  Network,
  X,
  Package,
  Battery,
  MapPin,
  Plane,
  Truck,
  CircleDot,
  History,
  ListTodo,
  Target,
  ArrowRight,
  RotateCcw,
  Navigation,
  Timer,
  TrendingUp,
  AlertTriangle,
  Radio,
  Gauge,
  ThermometerSun,
  Calendar,
  Play,
  Pause,
  ChevronDown,
  Users,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue in production (with defensive checks)
try {
  if (L?.Icon?.Default?.prototype?._getIconUrl) {
    delete L.Icon.Default.prototype._getIconUrl;
  }
  if (L?.Icon?.Default?.mergeOptions) {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }
} catch (e) {
  console.warn('Leaflet icon fix failed:', e);
}

// Components
import DroneMarker from '../components/simulation/map/DroneMarker';
import SwarmBotMarker from '../components/simulation/map/SwarmBotMarker';
import DeliveryPodMarker from '../components/simulation/map/DeliveryPodMarker';
import RooftopHubMarker from '../components/simulation/map/RooftopHubMarker';
import StreetHubMarker from '../components/simulation/map/StreetHubMarker';

// Data & Engine
import {
  VEHICLE_TYPES,
  DELIVERY_STATES,
  DELIVERY_PRIORITY,
  PRIORITY_CONFIG,
  interpolateCorridorPosition
} from '../data/laDelivery';
import { CITIES, CITY_LIST, getCityConfig, INTERSTATE_CORRIDORS, HIGHWAY_SWAP_STATIONS, generateTruckFleet } from '../data/deliveryCities';
import { useDeliveryEngine } from '../hooks/useDeliveryEngine';
import DeliveryDecisionHUD from '../components/la-delivery/DeliveryDecisionHUD';
import { SCENARIO_CONFIG, SCENARIO_TYPES } from '../data/laDecisionScenarios';
import { applyDecisionEffect } from '../utils/laDecisionEffects';
import { DeliveryKorAllThingPanel as KorAllThingPanelNew } from '../components/la-delivery/kor-all-thing';
import { useDeliveryConnection } from '../hooks/useDeliveryConnection';

// US Map configuration
const US_MAP_CONFIG = {
  center: [39.8283, -98.5795], // Geographic center of contiguous US
  zoom: 4,
  minZoom: 3,
  maxZoom: 18
};

// ============================================================================
// Context for LA Delivery Simulation
// ============================================================================

const DeliveryContext = createContext(null);

// Generate hub history and charging sessions
const generateHubHistory = (hubType) => {
  const events = hubType === 'rooftop'
    ? ['Drone landed', 'Battery swap completed', 'Drone departed', 'Charging started', 'Emergency landing', 'Maintenance check', 'Weather hold', 'Swap arm calibrated']
    : ['Pod connected', 'Pod departed', 'Swarm deployed', 'Swarm returned', 'Fast charge complete', 'Power grid sync', 'Queue cleared', 'Maintenance'];
  const now = Date.now();
  return Array.from({ length: Math.floor(Math.random() * 8) + 4 }, (_, i) => ({
    id: `hub-hist-${now}-${i}`,
    event: events[Math.floor(Math.random() * events.length)],
    timestamp: now - (i * (Math.random() * 600000 + 120000)),
    vehicleId: hubType === 'rooftop' ? `drone-${Math.floor(Math.random() * 8) + 1}` : Math.random() > 0.5 ? `pod-${Math.floor(Math.random() * 4) + 1}` : `swarm-${Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 5) + 1}`,
    duration: Math.floor(Math.random() * 20) + 5
  }));
};

const generateChargingSessions = (hubType, capacity) => {
  return Array.from({ length: Math.floor(Math.random() * capacity) }, (_, i) => ({
    id: `session-${Date.now()}-${i}`,
    vehicleId: hubType === 'rooftop' ? `drone-${Math.floor(Math.random() * 8) + 1}` : Math.random() > 0.5 ? `pod-${Math.floor(Math.random() * 4) + 1}` : `swarm-0-${Math.floor(Math.random() * 5) + 1}`,
    vehicleType: hubType === 'rooftop' ? 'drone' : Math.random() > 0.5 ? 'pod' : 'swarmbot',
    startTime: Date.now() - Math.floor(Math.random() * 1800000),
    currentCharge: Math.floor(Math.random() * 60) + 20,
    targetCharge: 95,
    power: Math.floor(Math.random() * 15) + 5,
    status: Math.random() > 0.2 ? 'charging' : 'completing',
    slot: i + 1
  }));
};

const generateHubMetrics = (hubType) => ({
  totalSessions: Math.floor(Math.random() * 500) + 100,
  energyDelivered: Math.floor(Math.random() * 5000) + 1000,
  avgSessionTime: Math.floor(Math.random() * 15) + 10,
  peakPowerToday: Math.floor(Math.random() * 30) + 50,
  uptime: Math.floor(Math.random() * 3) + 97,
  efficiency: Math.floor(Math.random() * 5) + 94,
  vehiclesServedToday: Math.floor(Math.random() * 30) + 10,
  queueWaitAvg: Math.floor(Math.random() * 5) + 1
});

const generateScheduledMaintenance = () => {
  const types = ['Connector inspection', 'Module calibration', 'Software update', 'Safety check', 'Cleaning'];
  const futureTime = Date.now() + Math.floor(Math.random() * 86400000 * 7);
  return Math.random() > 0.6 ? [{
    id: `maint-${Date.now()}`,
    type: types[Math.floor(Math.random() * types.length)],
    scheduledFor: futureTime,
    duration: Math.floor(Math.random() * 60) + 30,
    priority: Math.random() > 0.7 ? 'high' : 'normal'
  }] : [];
};

// Enrich hubs with extended data
const enrichHub = (hub, hubType) => ({
  ...hub,
  history: generateHubHistory(hubType),
  chargingSessions: generateChargingSessions(hubType, hubType === 'rooftop' ? hub.droneCapacity : (hub.podCapacity + hub.swarmCapacity)),
  metrics: generateHubMetrics(hubType),
  scheduledMaintenance: generateScheduledMaintenance(),
  currentPower: Math.floor(Math.random() * hub.maxPower * (hubType === 'rooftop' ? 0.8 : 0.7)),
  temperature: Math.floor(Math.random() * (hubType === 'rooftop' ? 15 : 10)) + (hubType === 'rooftop' ? 25 : 20),
  gridStatus: hubType === 'rooftop' ? (Math.random() > 0.1 ? 'connected' : 'backup') : 'connected',
  solarInput: hubType === 'rooftop' ? Math.floor(Math.random() * 10) : 0,
  queueLength: hubType === 'street' ? Math.floor(Math.random() * 3) : 0
});

// Generate all cities' enriched hub data
const generateAllCitiesData = () => {
  const allRooftopHubs = [];
  const allStreetHubs = [];

  Object.values(CITIES || {}).forEach(city => {
    if (!city) return;
    (city.rooftopHubs || []).forEach(hub => {
      allRooftopHubs.push(enrichHub({ ...hub, cityId: city.id, cityName: city.shortName }, 'rooftop'));
    });
    (city.streetHubs || []).forEach(hub => {
      allStreetHubs.push(enrichHub({ ...hub, cityId: city.id, cityName: city.shortName }, 'street'));
    });
  });

  return { allRooftopHubs, allStreetHubs };
};

const { allRooftopHubs, allStreetHubs } = generateAllCitiesData();

// Generate initial truck fleet
const initialTrucks = generateTruckFleet(25);

const initialState = {
  isRunning: true,
  speed: 1,
  selectedCity: null, // null = US overview, cityId = zoomed into city
  drones: [],
  pods: [],
  swarmBots: [],
  trucks: initialTrucks, // Intercity heavy-duty trucks
  rooftopHubs: allRooftopHubs,
  streetHubs: allStreetHubs,
  selectedItem: null,
  activeZone: null,
  korAllThingExpanded: false,
  scenarioQueue: [],
  focusedVehicle: null, // { id, type, position } - temporary focus for scenarios
  decisionToast: null, // { message, type, vehicleId } - shows decision result
  stats: {
    packagesInTransit: 0,
    activeHandoffs: 0,
    dronesFlying: 0,
    podsMoving: 0,
    swarmsDelivering: 0,
    ek3Utilization: 0,
    totalCities: Object.keys(CITIES).length,
    activeCities: Object.keys(CITIES).length
  }
};

function deliveryReducer(state, action) {
  switch (action.type) {
    case 'SET_RUNNING':
      return { ...state, isRunning: action.payload };
    case 'SET_SPEED':
      return { ...state, speed: action.payload };
    case 'UPDATE_DRONES':
      return { ...state, drones: action.payload };
    case 'UPDATE_PODS':
      return { ...state, pods: action.payload };
    case 'UPDATE_SWARM_BOTS':
      return { ...state, swarmBots: action.payload };
    case 'UPDATE_TRUCKS':
      return { ...state, trucks: action.payload };
    case 'UPDATE_HUBS':
      return { ...state, rooftopHubs: action.payload.rooftop, streetHubs: action.payload.street };
    case 'SELECT_ITEM':
      return { ...state, selectedItem: action.payload };
    case 'SET_ZONE':
      return { ...state, activeZone: action.payload };
    case 'UPDATE_STATS':
      return { ...state, stats: { ...state.stats, ...action.payload } };
    case 'INIT_FLEET':
      return { ...state, ...action.payload };
    case 'TOGGLE_KOR_ALL_THING':
      return { ...state, korAllThingExpanded: !state.korAllThingExpanded };
    case 'ADD_SCENARIO':
      return { ...state, scenarioQueue: [...state.scenarioQueue, action.payload] };
    case 'UPDATE_SCENARIO':
      return {
        ...state,
        scenarioQueue: state.scenarioQueue.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s
        )
      };
    case 'CLEAR_SELECTION':
      return { ...state, selectedItem: null };
    case 'SET_VEHICLE_PRIORITY': {
      const { vehicleType, vehicleId, priority } = action.payload;
      const listKey = vehicleType === 'drone' ? 'drones' : vehicleType === 'pod' ? 'pods' : 'swarmBots';
      return {
        ...state,
        [listKey]: state[listKey].map(v =>
          v.id === vehicleId ? { ...v, priority } : v
        )
      };
    }
    case 'ADD_DECISION_HISTORY': {
      const { vehicleType, vehicleId, decision } = action.payload;
      const listKey = vehicleType === 'drone' ? 'drones' : vehicleType === 'pod' ? 'pods' : 'swarmBots';
      return {
        ...state,
        [listKey]: state[listKey].map(v =>
          v.id === vehicleId
            ? { ...v, decisionHistory: [...(v.decisionHistory || []).slice(-9), decision] }
            : v
        )
      };
    }
    case 'REMOVE_SCENARIO':
      return {
        ...state,
        scenarioQueue: state.scenarioQueue.filter(s => s.id !== action.payload)
      };
    case 'SET_FOCUSED_VEHICLE':
      return { ...state, focusedVehicle: action.payload };
    case 'CLEAR_FOCUSED_VEHICLE':
      return { ...state, focusedVehicle: null };
    case 'SET_SELECTED_CITY':
      return { ...state, selectedCity: action.payload };
    case 'SET_DECISION_TOAST':
      return { ...state, decisionToast: action.payload };
    case 'CLEAR_DECISION_TOAST':
      return { ...state, decisionToast: null };
    default:
      return state;
  }
}

function DeliveryProvider({ children }) {
  const [state, dispatch] = useReducer(deliveryReducer, initialState);

  // Generate realistic mission queue
  const generateMissionQueue = (vehicleType, zone) => {
    const missionTypes = {
      drone: ['DELIVERY', 'PICKUP', 'HANDOFF', 'RECHARGE', 'PATROL'],
      pod: ['MULTI_DELIVERY', 'HUB_TRANSFER', 'SWARM_DISPATCH', 'RECHARGE', 'MAINTENANCE'],
      swarmbot: ['LAST_MILE', 'RETURN_BASE', 'RECEIVE_HANDOFF', 'RECHARGE', 'STANDBY']
    };
    const types = missionTypes[vehicleType] || missionTypes.drone;
    const count = Math.floor(Math.random() * 3) + 1;
    return Array.from({ length: count }, (_, i) => ({
      id: `mission-${Date.now()}-${i}`,
      type: types[Math.floor(Math.random() * types.length)],
      priority: Math.random() > 0.8 ? 'high' : Math.random() > 0.5 ? 'normal' : 'low',
      eta: Math.floor(Math.random() * 30) + 5,
      destination: zone,
      packages: Math.floor(Math.random() * 3) + 1,
      status: i === 0 ? 'active' : 'queued'
    }));
  };

  // Generate realistic activity history
  const generateHistory = (vehicleType) => {
    const events = {
      drone: ['Completed delivery', 'Battery swap', 'Handoff to swarm', 'Altitude adjustment', 'Weather reroute', 'Charging started', 'Takeoff', 'Landing'],
      pod: ['Route completed', 'Swarm dispatched', 'Packages loaded', 'Charging session', 'Traffic reroute', 'Hub arrival', 'Maintenance check'],
      swarmbot: ['Package delivered', 'Returned to base', 'Received from drone', 'Battery charged', 'Obstacle avoided', 'Customer confirmed']
    };
    const eventList = events[vehicleType] || events.drone;
    const count = Math.floor(Math.random() * 6) + 3;
    const now = Date.now();
    return Array.from({ length: count }, (_, i) => ({
      id: `hist-${now}-${i}`,
      event: eventList[Math.floor(Math.random() * eventList.length)],
      timestamp: now - (i * (Math.random() * 300000 + 60000)),
      details: Math.random() > 0.5 ? `Zone ${['DTLA', 'Santa Monica', 'Pasadena', 'Hollywood'][Math.floor(Math.random() * 4)]}` : null
    }));
  };

  // Initialize fleet on mount - generate for ALL cities
  useEffect(() => {
    const allDrones = [];
    const allPods = [];
    const allSwarmBots = [];

    // Generate vehicles for each city
    Object.values(CITIES || {}).forEach((city, cityIndex) => {
      if (!city || !city.fleet) return;
      const cityPrefix = city.shortName.toLowerCase();

      // Generate drones for this city
      for (let i = 0; i < city.fleet.drones; i++) {
        const corridor = city.droneCorridors[i % city.droneCorridors.length];
        const progress = Math.random();
        allDrones.push({
          id: `${cityPrefix}-drone-${i + 1}`,
          cityId: city.id,
          cityName: city.shortName,
          type: VEHICLE_TYPES.DRONE,
          corridorId: corridor?.id,
          progress,
          position: corridor ? interpolateCorridorPosition(corridor, progress) : city.center,
          batteryLevel: 60 + Math.random() * 40,
          state: DELIVERY_STATES.FLYING,
          direction: Math.random() > 0.5 ? 1 : -1,
          packages: Math.floor(Math.random() * 3),
          altitude: 80 + Math.random() * 40,
          zone: corridor?.zone || Object.keys(city.zones)[0],
          priority: Object.values(DELIVERY_PRIORITY)[Math.floor(Math.random() * 4)] || DELIVERY_PRIORITY.STANDARD,
          missionQueue: generateMissionQueue('drone', corridor?.zone || 'default'),
          history: generateHistory('drone'),
          decisionHistory: [],
          metrics: {
            totalDeliveries: Math.floor(Math.random() * 50) + 10,
            totalDistance: Math.floor(Math.random() * 500) + 100,
            avgDeliveryTime: Math.floor(Math.random() * 10) + 5,
            efficiency: Math.floor(Math.random() * 20) + 80,
            uptime: Math.floor(Math.random() * 10) + 90
          },
          health: {
            motors: Math.floor(Math.random() * 10) + 90,
            sensors: Math.floor(Math.random() * 5) + 95,
            communication: Math.floor(Math.random() * 3) + 97,
            temperature: Math.floor(Math.random() * 20) + 25
          }
        });
      }

      // Generate pods for this city
      for (let i = 0; i < city.fleet.pods; i++) {
        const route = city.podRoutes[i % city.podRoutes.length];
        allPods.push({
          id: `${cityPrefix}-pod-${i + 1}`,
          cityId: city.id,
          cityName: city.shortName,
          type: VEHICLE_TYPES.POD,
          routeId: route?.id,
          progress: Math.random(),
          position: route?.waypoints[0] || city.center,
          batteryLevel: 70 + Math.random() * 30,
          state: DELIVERY_STATES.EN_ROUTE,
          direction: 1,
          packages: Math.floor(Math.random() * 15),
          zone: route?.zone || Object.keys(city.zones)[0],
          priority: Object.values(DELIVERY_PRIORITY)[Math.floor(Math.random() * 4)] || DELIVERY_PRIORITY.STANDARD,
          missionQueue: generateMissionQueue('pod', route?.zone || 'default'),
          history: generateHistory('pod'),
          decisionHistory: [],
          metrics: {
            totalDeliveries: Math.floor(Math.random() * 200) + 50,
            totalDistance: Math.floor(Math.random() * 2000) + 500,
            avgDeliveryTime: Math.floor(Math.random() * 20) + 15,
            efficiency: Math.floor(Math.random() * 15) + 85,
            uptime: Math.floor(Math.random() * 8) + 92
          },
          health: {
            drivetrain: Math.floor(Math.random() * 8) + 92,
            sensors: Math.floor(Math.random() * 5) + 95,
            cargo: 100,
            temperature: Math.floor(Math.random() * 15) + 20
          },
          swarmBotsLoaded: Math.floor(Math.random() * 5)
        });
      }

      // Generate swarm bots for this city
      const swarmZones = city.swarmZones || [];
      swarmZones.forEach((zone, zi) => {
        const botsPerZone = Math.ceil(city.fleet.swarmBots / (swarmZones.length || 1));
        for (let i = 0; i < Math.min(zone.density, botsPerZone); i++) {
          const offset = zone.radius * 0.8;
          allSwarmBots.push({
            id: `${cityPrefix}-swarm-${zi}-${i + 1}`,
            cityId: city.id,
            cityName: city.shortName,
            type: VEHICLE_TYPES.SWARM_BOT,
            position: [
              zone.center[0] + (Math.random() - 0.5) * offset,
              zone.center[1] + (Math.random() - 0.5) * offset
            ],
            basePosition: zone.center,
            batteryLevel: 50 + Math.random() * 50,
            state: Math.random() > 0.6 ? DELIVERY_STATES.SWARMING : DELIVERY_STATES.IDLE,
            packages: Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : 0,
            targetPosition: null,
            zone: zone.zone,
            zoneId: `swarm-zone-${zone.zone}`, // For route-based movement
            baseHub: zone.baseHub,
            priority: Object.values(DELIVERY_PRIORITY)[Math.floor(Math.random() * 4)] || DELIVERY_PRIORITY.STANDARD,
            missionQueue: generateMissionQueue('swarmbot', zone.zone),
            history: generateHistory('swarmbot'),
            decisionHistory: [],
            metrics: {
              totalDeliveries: Math.floor(Math.random() * 30) + 5,
              totalDistance: Math.floor(Math.random() * 50) + 10,
              avgDeliveryTime: Math.floor(Math.random() * 5) + 3,
              efficiency: Math.floor(Math.random() * 25) + 75,
              uptime: Math.floor(Math.random() * 15) + 85
            },
            health: {
              wheels: Math.floor(Math.random() * 10) + 90,
              sensors: Math.floor(Math.random() * 8) + 92,
              communication: Math.floor(Math.random() * 5) + 95,
              temperature: Math.floor(Math.random() * 10) + 22
            }
          });
        }
      });
    });

    dispatch({ type: 'INIT_FLEET', payload: { drones: allDrones, pods: allPods, swarmBots: allSwarmBots } });
  }, []);

  // Calculate stats
  useEffect(() => {
    // Calculate total EK3 modules from all city hubs
    const totalEk3Modules = state.rooftopHubs.reduce((s, h) => s + (h.ek3Modules || 0), 0) +
      state.streetHubs.reduce((s, h) => s + (h.ek3Modules || 0), 0);

    const stats = {
      packagesInTransit:
        state.drones.reduce((sum, d) => sum + (d.packages || 0), 0) +
        state.pods.reduce((sum, p) => sum + (p.packages || 0), 0) +
        state.swarmBots.reduce((sum, s) => sum + (s.packages || 0), 0),
      activeHandoffs:
        state.drones.filter(d => d.state?.includes?.('handoff')).length +
        state.swarmBots.filter(s => s.state?.includes?.('handoff')).length,
      dronesFlying: state.drones.filter(d =>
        [DELIVERY_STATES.FLYING, DELIVERY_STATES.EN_ROUTE].includes(d.state)
      ).length,
      podsMoving: state.pods.filter(p => p.state === DELIVERY_STATES.EN_ROUTE).length,
      swarmsDelivering: state.swarmBots.filter(s =>
        [DELIVERY_STATES.SWARMING, DELIVERY_STATES.DELIVERING].includes(s.state)
      ).length,
      ek3Utilization: totalEk3Modules > 0 ? Math.round(
        ((state.drones.filter(d => d.state === DELIVERY_STATES.CHARGING).length * 2) +
          (state.pods.filter(p => p.state === DELIVERY_STATES.CHARGING).length * 6) +
          (state.swarmBots.filter(s => s.state === DELIVERY_STATES.CHARGING).length)) /
        totalEk3Modules * 100
      ) : 0
    };
    dispatch({ type: 'UPDATE_STATS', payload: stats });
  }, [state.drones, state.pods, state.swarmBots, state.rooftopHubs, state.streetHubs]);

  const value = useMemo(() => ({
    ...state,
    dispatch,
    setRunning: (val) => dispatch({ type: 'SET_RUNNING', payload: val }),
    setSpeed: (val) => dispatch({ type: 'SET_SPEED', payload: val }),
    updateDrones: (val) => dispatch({ type: 'UPDATE_DRONES', payload: val }),
    updatePods: (val) => dispatch({ type: 'UPDATE_PODS', payload: val }),
    updateSwarmBots: (val) => dispatch({ type: 'UPDATE_SWARM_BOTS', payload: val }),
    updateTrucks: (val) => dispatch({ type: 'UPDATE_TRUCKS', payload: val }),
    selectItem: (type, id) => dispatch({ type: 'SELECT_ITEM', payload: { type, id } }),
    clearSelection: () => dispatch({ type: 'CLEAR_SELECTION' }),
    setZone: (zone) => dispatch({ type: 'SET_ZONE', payload: zone }),
    toggleKorAllThing: () => dispatch({ type: 'TOGGLE_KOR_ALL_THING' }),
    addScenario: (scenario) => dispatch({ type: 'ADD_SCENARIO', payload: scenario }),
    updateScenario: (update) => dispatch({ type: 'UPDATE_SCENARIO', payload: update }),
    removeScenario: (id) => dispatch({ type: 'REMOVE_SCENARIO', payload: id }),
    setVehiclePriority: (vehicleType, vehicleId, priority) =>
      dispatch({ type: 'SET_VEHICLE_PRIORITY', payload: { vehicleType, vehicleId, priority } }),
    addDecisionHistory: (vehicleType, vehicleId, decision) =>
      dispatch({ type: 'ADD_DECISION_HISTORY', payload: { vehicleType, vehicleId, decision } }),
    setFocusedVehicle: (vehicle) => dispatch({ type: 'SET_FOCUSED_VEHICLE', payload: vehicle }),
    clearFocusedVehicle: () => dispatch({ type: 'CLEAR_FOCUSED_VEHICLE' }),
    setSelectedCity: (cityId) => dispatch({ type: 'SET_SELECTED_CITY', payload: cityId }),
    showDecisionToast: (toast) => dispatch({ type: 'SET_DECISION_TOAST', payload: toast }),
    clearDecisionToast: () => dispatch({ type: 'CLEAR_DECISION_TOAST' }),
    getCityConfig: (cityId) => cityId ? CITIES[cityId] : null
  }), [state]);

  return (
    <DeliveryContext.Provider value={value}>
      {children}
    </DeliveryContext.Provider>
  );
}

function useDelivery() {
  const context = useContext(DeliveryContext);
  if (!context) throw new Error('useDelivery must be used within DeliveryProvider');
  return context;
}

// ============================================================================
// Map Controller
// ============================================================================

function MapController() {
  const map = useMap();
  const { focusedVehicle, selectedCity } = useDelivery();
  const prevFocusedRef = useRef(null);
  const prevCityRef = useRef(null);

  // Set initial view to US map
  useEffect(() => {
    map.setView(US_MAP_CONFIG.center, US_MAP_CONFIG.zoom);
  }, [map]);

  // Handle city selection - zoom to city or back to US
  useEffect(() => {
    if (selectedCity && selectedCity !== prevCityRef.current) {
      const cityConfig = CITIES[selectedCity];
      if (cityConfig) {
        map.flyTo(cityConfig.center, cityConfig.zoom, { duration: 1.5 });
      }
      prevCityRef.current = selectedCity;
    } else if (!selectedCity && prevCityRef.current) {
      // Return to US view
      map.flyTo(US_MAP_CONFIG.center, US_MAP_CONFIG.zoom, { duration: 1.5 });
      prevCityRef.current = null;
    }
  }, [map, selectedCity]);

  // Handle focused vehicle - fly to it, return to city/US when cleared
  useEffect(() => {
    if (focusedVehicle?.position) {
      map.flyTo(focusedVehicle.position, 15, { duration: 1.5 });
      prevFocusedRef.current = focusedVehicle;
    } else if (prevFocusedRef.current !== null) {
      // Return to city view or US view
      if (selectedCity) {
        const cityConfig = CITIES[selectedCity];
        if (cityConfig) {
          map.flyTo(cityConfig.center, cityConfig.zoom, { duration: 1.5 });
        }
      } else {
        map.flyTo(US_MAP_CONFIG.center, US_MAP_CONFIG.zoom, { duration: 1.5 });
      }
      prevFocusedRef.current = null;
    }
  }, [map, focusedVehicle, selectedCity]);

  return null;
}

// ============================================================================
// Delivery Map Component
// ============================================================================

function DeliveryMap() {
  const {
    drones,
    pods,
    swarmBots,
    trucks,
    rooftopHubs,
    streetHubs,
    selectItem,
    selectedItem,
    selectedCity,
    setSelectedCity
  } = useDelivery();

  // Get all pod routes from all cities for reference
  const allPodRoutes = useMemo(() => {
    const routes = [];
    Object.values(CITIES).forEach(city => {
      routes.push(...city.podRoutes);
    });
    return routes;
  }, []);

  // Highway corridors for US view
  const highways = useMemo(() => Object.values(INTERSTATE_CORRIDORS), []);

  return (
    <MapContainer
      center={US_MAP_CONFIG.center}
      zoom={US_MAP_CONFIG.zoom}
      minZoom={US_MAP_CONFIG.minZoom}
      maxZoom={US_MAP_CONFIG.maxZoom}
      className="w-full h-full"
      style={{ background: '#030308' }}
      zoomControl={false}
    >
      <MapController />

      {/* Dark map tiles */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />

      {/* Rooftop Hubs */}
      {rooftopHubs.map(hub => (
        <RooftopHubMarker
          key={hub.id}
          hub={hub}
          dronesCharging={drones.filter(d => d.state === DELIVERY_STATES.CHARGING && d.targetHub === hub.id).length}
          swapInProgress={drones.some(d => d.state === DELIVERY_STATES.SWAPPING && d.targetHub === hub.id)}
          onSelect={selectItem}
          isSelected={selectedItem?.id === hub.id}
        />
      ))}

      {/* Street Hubs */}
      {streetHubs.map(hub => (
        <StreetHubMarker
          key={hub.id}
          hub={hub}
          podsCharging={pods.filter(p => p.state === DELIVERY_STATES.CHARGING && p.targetHub === hub.id).length}
          swarmsCharging={swarmBots.filter(s => s.state === DELIVERY_STATES.CHARGING && s.baseHub === hub.id).length}
          onSelect={selectItem}
          isSelected={selectedItem?.id === hub.id}
        />
      ))}

      {/* Delivery Pods */}
      {pods.map(pod => (
        <DeliveryPodMarker
          key={pod.id}
          pod={pod}
          route={allPodRoutes.find(r => r.id === pod.routeId)}
          onSelect={selectItem}
          isSelected={selectedItem?.id === pod.id}
        />
      ))}

      {/* Swarm Bots */}
      {swarmBots.map(bot => (
        <SwarmBotMarker
          key={bot.id}
          bot={bot}
          nearbyBots={swarmBots.filter(b =>
            b.id !== bot.id &&
            b.zone === bot.zone &&
            Math.abs(b.position[0] - bot.position[0]) < 0.005 &&
            Math.abs(b.position[1] - bot.position[1]) < 0.005
          )}
          onSelect={selectItem}
          isSelected={selectedItem?.id === bot.id}
        />
      ))}

      {/* Drones (render last for top layer) */}
      {drones.map(drone => {
        // Find corridor from any city
        let corridor = null;
        for (const city of Object.values(CITIES)) {
          corridor = city.droneCorridors.find(c => c.id === drone.corridorId);
          if (corridor) break;
        }
        return (
          <DroneMarker
            key={drone.id}
            drone={drone}
            corridor={corridor}
            onSelect={selectItem}
            isSelected={selectedItem?.id === drone.id}
          />
        );
      })}

      {/* Interstate Highway Corridors (US overview only) */}
      {!selectedCity && highways.map(corridor => (
        <Polyline
          key={corridor.id}
          positions={corridor.waypoints}
          pathOptions={{
            color: corridor.color,
            weight: 3,
            opacity: 0.6,
            dashArray: '10, 5'
          }}
        />
      ))}

      {/* Highway Swap Stations (US overview only) */}
      {!selectedCity && HIGHWAY_SWAP_STATIONS.map(station => (
        <CircleMarker
          key={station.id}
          center={station.position}
          radius={6}
          pathOptions={{
            fillColor: '#ff6b00',
            fillOpacity: 0.9,
            color: '#fff',
            weight: 1
          }}
        >
          <Tooltip permanent={false} direction="top" className="swap-tooltip">
            <div className="text-xs">
              <div className="font-bold">{station.name}</div>
              <div>Batteries: {station.batteryInventory}</div>
              <div>Queue: {station.queueLength}</div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}

      {/* Heavy-duty Trucks (US overview only) */}
      {!selectedCity && trucks?.map(truck => (
        <CircleMarker
          key={truck.id}
          center={truck.position}
          radius={5}
          pathOptions={{
            fillColor: truck.state === 'swapping' ? '#ff6b00' : '#39ff14',
            fillOpacity: 1,
            color: '#fff',
            weight: 2
          }}
        >
          <Tooltip permanent={false} direction="top">
            <div className="text-xs">
              <div className="font-bold">{truck.name}</div>
              <div>Battery: {Math.round(truck.batteryLevel)}%</div>
              <div>Status: {truck.state}</div>
              <div>Swaps: {truck.swapsCompleted}</div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}

      {/* City markers for US overview */}
      {!selectedCity && Object.values(CITIES).map(city => (
        <CircleMarker
          key={city.id}
          center={city.center}
          radius={12}
          pathOptions={{
            fillColor: '#00f0ff',
            fillOpacity: 0.9,
            color: '#39ff14',
            weight: 2
          }}
          eventHandlers={{
            click: () => setSelectedCity(city.id)
          }}
        >
          <Tooltip permanent={false} direction="top">
            <div className="text-xs font-bold">{city.name}</div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

// ============================================================================
// Stats HUD
// ============================================================================

function StatsHUD() {
  const { stats, drones, pods, swarmBots, trucks, selectedCity, setSelectedCity } = useDelivery();
  const cityConfig = selectedCity ? CITIES[selectedCity] : null;

  // Calculate totals for US view
  const totalFleet = useMemo(() => {
    return Object.values(CITIES).reduce((acc, city) => ({
      drones: acc.drones + city.fleet.drones,
      pods: acc.pods + city.fleet.pods,
      swarmBots: acc.swarmBots + city.fleet.swarmBots,
      hubs: acc.hubs + city.rooftopHubs.length + city.streetHubs.length
    }), { drones: 0, pods: 0, swarmBots: 0, hubs: 0 });
  }, []);

  return (
    <div className="absolute top-4 right-4 z-[1000]">
      <div className="bg-[#0a0a12]/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4 min-w-[220px]">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-cyan-400 font-bold text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            {selectedCity ? cityConfig?.name?.toUpperCase() : 'US DELIVERY NETWORK'}
          </h3>
          {selectedCity && (
            <button
              onClick={() => setSelectedCity(null)}
              className="text-xs px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded transition-colors"
            >
              ← US
            </button>
          )}
        </div>

        {/* City count for US view */}
        {!selectedCity && (
          <div className="mb-3 px-2 py-1.5 bg-gradient-to-r from-cyan-500/10 to-green-500/10 rounded border border-cyan-500/20">
            <div className="text-xs text-gray-400">
              Active Cities: <span className="text-cyan-400 font-bold">{Object.keys(CITIES).length}</span>
            </div>
          </div>
        )}

        <div className="space-y-2 text-xs">
          {/* Fleet counts */}
          <div className="flex justify-between text-gray-400">
            <span>Drones</span>
            <span className="text-cyan-400 font-mono">
              {stats.dronesFlying}/{selectedCity ? drones.filter(d => d.cityId === selectedCity).length : drones.length}
            </span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Pods</span>
            <span className="text-green-400 font-mono">
              {stats.podsMoving}/{selectedCity ? pods.filter(p => p.cityId === selectedCity).length : pods.length}
            </span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Swarm Bots</span>
            <span className="text-pink-400 font-mono">
              {stats.swarmsDelivering}/{selectedCity ? swarmBots.filter(s => s.cityId === selectedCity).length : swarmBots.length}
            </span>
          </div>

          {/* Intercity Trucks - US view only */}
          {!selectedCity && (
            <div className="flex justify-between text-gray-400">
              <span>🚛 Trucks</span>
              <span className="text-orange-400 font-mono">
                {trucks?.filter(t => t.state === 'driving').length || 0}/{trucks?.length || 0}
              </span>
            </div>
          )}

          <div className="border-t border-gray-700 my-2" />

          {/* Metrics */}
          <div className="flex justify-between text-gray-400">
            <span>Packages</span>
            <span className="text-amber-400 font-mono">{stats.packagesInTransit}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Handoffs</span>
            <span className="text-purple-400 font-mono">{stats.activeHandoffs}</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>EK3 Load</span>
            <span className="text-emerald-400 font-mono">{stats.ek3Utilization}%</span>
          </div>

          {/* Total hubs for US view */}
          {!selectedCity && (
            <>
              <div className="border-t border-gray-700 my-2" />
              <div className="flex justify-between text-gray-400">
                <span>Total Hubs</span>
                <span className="text-purple-400 font-mono">{totalFleet.hubs}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Zone Selector
// ============================================================================

function ZoneSelector() {
  const { activeZone, setZone, selectedCity } = useDelivery();

  // Get zones from selected city, or show city list for US view
  const cityConfig = selectedCity ? CITIES[selectedCity] : null;
  const zones = cityConfig ? Object.values(cityConfig.zones) : [];

  // Don't show zone selector in US view
  if (!selectedCity) return null;

  return (
    <div className="absolute top-4 left-[272px] z-[1000]">
      <div className="bg-[#0a0a12]/90 backdrop-blur-sm border border-purple-500/30 rounded-lg p-3">
        <div className="text-purple-400 text-xs font-bold mb-2">{cityConfig?.shortName} ZONES</div>
        <div className="flex flex-wrap gap-2">
          {zones.map(zone => (
            <button
              key={zone.id}
              onClick={() => setZone(activeZone === zone.id ? null : zone.id)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activeZone === zone.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              style={{ borderLeft: `3px solid ${zone.color}` }}
            >
              {zone.shortName}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Decision Result Toast
// ============================================================================

function DecisionToast({ toast }) {
  if (!toast) return null;

  const vehicleEmoji = {
    drone: '🚁',
    pod: '🚐',
    swarmbot: '🤖'
  }[toast.vehicleType] || '🚀';

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="absolute top-20 left-1/2 -translate-x-1/2 z-[1100]"
    >
      <div
        className="bg-[#0a0a12]/95 backdrop-blur-md border rounded-xl px-6 py-4 shadow-2xl min-w-[400px]"
        style={{ borderColor: `${toast.color}60` }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ background: `${toast.color}20` }}
          >
            {vehicleEmoji}
          </div>
          <div>
            <div className="text-white font-semibold">{toast.title}</div>
            <div className="text-xs text-gray-400">{toast.vehicleId}</div>
          </div>
          <div className="ml-auto">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
        </div>

        {/* Action taken */}
        <div
          className="rounded-lg px-4 py-3 mb-2"
          style={{ background: `${toast.color}15` }}
        >
          <div className="text-xs text-gray-400 mb-1">Action Taken</div>
          <div className="font-medium" style={{ color: toast.color }}>{toast.action}</div>
        </div>

        {/* Effect */}
        <div className="text-sm text-gray-300">
          <span className="text-gray-500">Result:</span> {toast.effect}
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 8, ease: 'linear' }}
            className="h-full rounded-full"
            style={{ background: toast.color }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Controls
// ============================================================================

function SimulationControls() {
  const { isRunning, speed, setRunning, setSpeed, drones, pods, swarmBots, addScenario, setFocusedVehicle } = useDelivery();

  // Manual scenario trigger with map focus
  const triggerScenario = useCallback(() => {
    const scenarioTypes = Object.values(SCENARIO_TYPES);
    const randomType = scenarioTypes[Math.floor(Math.random() * scenarioTypes.length)];
    const config = SCENARIO_CONFIG[randomType];

    if (!config) {
      console.error('No config found for scenario type:', randomType);
      return;
    }

    const allVehicles = [
      ...(drones || []).map(v => ({ ...v, vehicleType: 'drone' })),
      ...(pods || []).map(v => ({ ...v, vehicleType: 'pod' })),
      ...(swarmBots || []).map(v => ({ ...v, vehicleType: 'swarmbot' }))
    ];

    const eligibleVehicles = allVehicles.filter(v =>
      config.vehicleTypes.includes(v.vehicleType)
    );

    if (eligibleVehicles.length > 0) {
      const vehicle = eligibleVehicles[Math.floor(Math.random() * eligibleVehicles.length)];

      // Focus map on vehicle
      setFocusedVehicle({
        id: vehicle.id,
        type: vehicle.vehicleType,
        position: vehicle.position
      });

      // Add scenario to queue (shows modal)
      const scenario = {
        id: `scenario-${Date.now()}`,
        type: randomType,
        vehicleId: vehicle.id,
        vehicleType: vehicle.vehicleType,
        config,
        status: 'pending',
        createdAt: Date.now(),
        expiresAt: Date.now() + ((config.timer || 30) * 1000)
      };
      console.log('Adding scenario:', scenario);
      addScenario(scenario);
    } else {
      console.log('No eligible vehicles for', randomType, 'requires:', config.vehicleTypes);
    }
  }, [drones, pods, swarmBots, addScenario, setFocusedVehicle]);

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
      <div className="bg-[#0a0a12]/90 backdrop-blur-sm border border-cyan-500/30 rounded-full px-6 py-3 flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={() => setRunning(!isRunning)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isRunning
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
            }`}
        >
          {isRunning ? '⏸' : '▶'}
        </button>

        {/* Speed controls */}
        <div className="flex gap-1">
          {[1, 2, 5, 10].map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${speed === s
                  ? 'bg-cyan-500/30 text-cyan-400'
                  : 'bg-gray-800/50 text-gray-500 hover:text-gray-300'
                }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700" />

        {/* Manual Scenario Trigger */}
        <button
          onClick={triggerScenario}
          className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all flex items-center gap-2 text-xs font-medium"
        >
          <AlertTriangle size={14} />
          Trigger Scenario
        </button>

        {/* Status */}
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
          <span className={isRunning ? 'text-emerald-400' : 'text-gray-500'}>
            {isRunning ? 'LIVE' : 'PAUSED'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Fleet List Panel - Entity Selection
// ============================================================================

function FleetListPanel() {
  const { drones, pods, swarmBots, selectItem, selectedItem } = useDelivery();
  const [activeCategory, setActiveCategory] = useState('drones');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'drones', label: 'Drones', icon: Plane, color: 'cyan', count: drones.length },
    { id: 'pods', label: 'Pods', icon: Truck, color: 'green', count: pods.length },
    { id: 'swarm', label: 'Swarm', icon: Bot, color: 'pink', count: swarmBots.length },
  ];

  const getStateColor = (state) => {
    if (state?.includes('CHARGING')) return 'text-green-400';
    if (state?.includes('FLYING') || state?.includes('EN_ROUTE') || state?.includes('SWARMING')) return 'text-cyan-400';
    if (state?.includes('HANDOFF')) return 'text-pink-400';
    if (state?.includes('IDLE')) return 'text-gray-500';
    return 'text-amber-400';
  };

  const getBatteryColor = (level) => {
    if (level > 60) return 'bg-green-500';
    if (level > 30) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const renderEntityList = () => {
    let entities = [];
    let entityType = '';

    switch (activeCategory) {
      case 'drones':
        entities = drones.filter(d =>
          searchTerm === '' || d.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
        entityType = 'drone';
        break;
      case 'pods':
        entities = pods.filter(p =>
          searchTerm === '' || p.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
        entityType = 'pod';
        break;
      case 'swarm':
        entities = swarmBots.filter(s =>
          searchTerm === '' || s.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
        entityType = 'swarmbot';
        break;
    }

    if (entities.length === 0) {
      return (
        <div className="text-center text-gray-500 text-xs py-4">
          No entities found
        </div>
      );
    }

    return entities.map((entity) => {
      const isSelected = selectedItem?.id === entity.id;

      return (
        <button
          key={entity.id}
          onClick={() => selectItem(entityType, entity.id)}
          className={`w-full p-2 rounded-lg text-left transition-all ${
            isSelected
              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50'
              : 'bg-white/5 hover:bg-white/10 border border-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`}>
                {entity.id.replace('drone-', 'D').replace('pod-', 'P').replace('swarm-', 'S')}
              </span>
              <span className={`text-[10px] ${getStateColor(entity.state)}`}>
                {entity.state?.replace('_', ' ').substring(0, 8)}
              </span>
            </div>
            {entity.batteryLevel !== undefined && (
              <div className="flex items-center gap-1">
                <div className="w-8 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getBatteryColor(entity.batteryLevel)} transition-all`}
                    style={{ width: `${entity.batteryLevel}%` }}
                  />
                </div>
                <span className="text-[9px] text-gray-500 w-6">{Math.round(entity.batteryLevel)}%</span>
              </div>
            )}
          </div>
          {entity.packages > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Package className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] text-amber-400">{entity.packages} pkg</span>
            </div>
          )}
        </button>
      );
    });
  };

  return (
    <div className="absolute left-16 top-0 bottom-0 w-48 bg-[#0a0a0f]/90 backdrop-blur-sm border-r border-white/10 z-[500] flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fleet</h3>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-white/10">
        {categories.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 py-2 flex flex-col items-center gap-0.5 transition-all ${
                activeCategory === cat.id
                  ? `text-${cat.color}-400 border-b-2 border-${cat.color}-400 bg-white/5`
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[9px]">{cat.count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="p-2 border-b border-white/10">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* Entity List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {renderEntityList()}
      </div>
    </div>
  );
}

// ============================================================================
// Vehicle Detail Panel - Enhanced with Tabs
// ============================================================================

function VehicleDetailPanel() {
  const { selectedItem, drones, pods, swarmBots, rooftopHubs, streetHubs, clearSelection } = useDelivery();
  const [activeTab, setActiveTab] = useState('overview');

  if (!selectedItem) return null;

  // Find the selected item
  let item = null;
  let itemType = selectedItem.type;
  let typeLabel = '';
  let typeColor = '';
  let TypeIcon = CircleDot;

  switch (itemType) {
    case 'drone':
      item = drones.find(d => d.id === selectedItem.id);
      typeLabel = 'DRONE';
      typeColor = 'cyan';
      TypeIcon = Plane;
      break;
    case 'pod':
      item = pods.find(p => p.id === selectedItem.id);
      typeLabel = 'POD';
      typeColor = 'green';
      TypeIcon = Truck;
      break;
    case 'swarmbot':
      item = swarmBots.find(s => s.id === selectedItem.id);
      typeLabel = 'SWARM BOT';
      typeColor = 'pink';
      TypeIcon = Bot;
      break;
    case 'rooftop_hub':
      item = rooftopHubs.find(h => h.id === selectedItem.id);
      typeLabel = 'ROOFTOP HUB';
      typeColor = 'cyan';
      TypeIcon = Network;
      break;
    case 'street_hub':
      item = streetHubs.find(h => h.id === selectedItem.id);
      typeLabel = 'STREET HUB';
      typeColor = 'green';
      TypeIcon = Zap;
      break;
  }

  if (!item) return null;

  const isVehicle = ['drone', 'pod', 'swarmbot'].includes(itemType);
  const isHub = ['rooftop_hub', 'street_hub'].includes(itemType);

  // Tab configuration
  const tabs = isVehicle
    ? [
        { id: 'overview', label: 'Overview', icon: Eye },
        { id: 'processes', label: 'Processes', icon: Activity },
        { id: 'scheduled', label: 'Scheduled', icon: Calendar },
        { id: 'history', label: 'History', icon: History },
      ]
    : [
        { id: 'overview', label: 'Status', icon: Eye },
        { id: 'charging', label: 'Charging', icon: Zap },
        { id: 'vehicles', label: 'Queue', icon: Users },
        { id: 'history', label: 'Log', icon: History },
      ];

  // Format timestamp
  const formatTime = (ts) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  // Priority colors
  const priorityColors = {
    high: 'text-red-400 bg-red-500/20',
    normal: 'text-amber-400 bg-amber-500/20',
    low: 'text-slate-400 bg-slate-500/20'
  };

  // Get connected vehicles for hubs
  const getConnectedVehicles = () => {
    if (itemType === 'rooftop_hub') {
      return drones.filter(d => d.targetHub === item.id ||
        (d.state === DELIVERY_STATES.CHARGING && Math.random() > 0.5));
    }
    if (itemType === 'street_hub') {
      const connectedPods = pods.filter(p => p.targetHub === item.id ||
        (p.state === DELIVERY_STATES.CHARGING && Math.random() > 0.5));
      const connectedSwarm = swarmBots.filter(s => s.baseHub === item.id &&
        s.state === DELIVERY_STATES.CHARGING);
      return [...connectedPods, ...connectedSwarm];
    }
    return [];
  };

  return (
    <motion.div
      initial={{ x: 350, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 350, opacity: 0 }}
      className="absolute top-4 right-4 bottom-4 z-[1000] w-80"
    >
      <div className="h-full bg-[#0a0a12]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden flex flex-col shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-white/5 to-transparent border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-${typeColor}-500/30 to-${typeColor}-500/10 flex items-center justify-center`}>
                <TypeIcon className={`w-4 h-4 text-${typeColor}-400`} />
              </div>
              <div>
                <div className="text-white font-bold text-sm">{item.name || item.id}</div>
                <div className={`text-${typeColor}-400 text-[10px] font-medium uppercase tracking-wider`}>{typeLabel}</div>
              </div>
            </div>
            <button
              onClick={clearSelection}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-3 text-[10px]">
            {item.zone && (
              <span className="text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {item.zone}
              </span>
            )}
            {isVehicle && (
              <span className={`px-2 py-0.5 rounded-full ${
                item.state === DELIVERY_STATES.CHARGING ? 'bg-emerald-500/20 text-emerald-400' :
                item.state?.includes('handoff') ? 'bg-purple-500/20 text-purple-400' :
                `bg-${typeColor}-500/20 text-${typeColor}-400`
              } uppercase font-medium`}>
                {item.state?.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 text-[10px] font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === tab.id
                    ? `text-${typeColor}-400 border-b-2 border-${typeColor}-400 bg-${typeColor}-500/10`
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {isVehicle && (
                  <>
                    {/* Battery with detailed info */}
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-xs flex items-center gap-1.5">
                          <Battery className="w-3.5 h-3.5" /> Battery Level
                        </span>
                        <span className={`font-mono font-bold ${
                          item.batteryLevel > 50 ? 'text-emerald-400' :
                          item.batteryLevel > 20 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {Math.round(item.batteryLevel)}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.batteryLevel}%` }}
                          className={`h-full ${
                            item.batteryLevel > 50 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' :
                            item.batteryLevel > 20 ? 'bg-gradient-to-r from-amber-600 to-amber-400' :
                            'bg-gradient-to-r from-red-600 to-red-400'
                          }`}
                        />
                      </div>
                      <div className="flex justify-between mt-1.5 text-[10px] text-gray-500">
                        <span>Est. range: {Math.round(item.batteryLevel * 0.5)}km</span>
                        <span>{item.batteryLevel > 20 ? 'Healthy' : 'Low - Charge needed'}</span>
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="text-gray-500 text-[10px] mb-1">Packages</div>
                        <div className="text-amber-400 font-bold text-lg">{item.packages || 0}</div>
                      </div>
                      {itemType === 'drone' && (
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-gray-500 text-[10px] mb-1">Altitude</div>
                          <div className="text-cyan-400 font-bold text-lg">{Math.round(item.altitude || 0)}m</div>
                        </div>
                      )}
                      {itemType === 'pod' && (
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-gray-500 text-[10px] mb-1">Swarm Bots</div>
                          <div className="text-pink-400 font-bold text-lg">{item.swarmBotsLoaded || 0}</div>
                        </div>
                      )}
                      {itemType === 'swarmbot' && (
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-gray-500 text-[10px] mb-1">Base Hub</div>
                          <div className="text-green-400 font-bold text-xs truncate">{item.baseHub || 'N/A'}</div>
                        </div>
                      )}
                    </div>

                    {/* Health Status */}
                    {item.health && (
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-gray-400 text-xs font-medium">System Health</span>
                          <span className="text-emerald-400 text-[10px]">All Systems Nominal</span>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(item.health).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2">
                              <span className="text-gray-500 text-[10px] capitalize w-20">{key}</span>
                              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    key === 'temperature'
                                      ? 'bg-amber-500'
                                      : value > 90 ? 'bg-emerald-500' : value > 70 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: key === 'temperature' ? `${Math.min(value, 100)}%` : `${value}%` }}
                                />
                              </div>
                              <span className={`text-[10px] font-mono w-10 text-right ${
                                key === 'temperature' ? 'text-amber-400' : 'text-gray-400'
                              }`}>
                                {key === 'temperature' ? `${value}°C` : `${value}%`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Performance Metrics */}
                    {item.metrics && (
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="text-gray-400 text-xs font-medium mb-3 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" /> Performance
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <div className="text-gray-500 text-[10px]">Total Deliveries</div>
                            <div className="text-white font-bold">{item.metrics.totalDeliveries}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-[10px]">Distance</div>
                            <div className="text-white font-bold">{item.metrics.totalDistance} km</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-[10px]">Avg Time</div>
                            <div className="text-white font-bold">{item.metrics.avgDeliveryTime} min</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-[10px]">Efficiency</div>
                            <div className={`font-bold ${item.metrics.efficiency > 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {item.metrics.efficiency}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Hub Overview - Enhanced */}
                {isHub && (
                  <>
                    {/* Live Status */}
                    <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-emerald-400 text-xs font-medium">ONLINE</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${
                          item.gridStatus === 'connected' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          Grid: {item.gridStatus?.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-white font-bold text-lg">{item.currentPower || 0}</div>
                          <div className="text-gray-500 text-[9px]">kW Now</div>
                        </div>
                        <div>
                          <div className="text-amber-400 font-bold text-lg">{item.temperature || 25}°</div>
                          <div className="text-gray-500 text-[9px]">Temp</div>
                        </div>
                        <div>
                          <div className="text-cyan-400 font-bold text-lg">{item.chargingSessions?.length || 0}</div>
                          <div className="text-gray-500 text-[9px]">Active</div>
                        </div>
                      </div>
                    </div>

                    {/* Power Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="text-gray-500 text-[10px] mb-1">EK3 Modules</div>
                        <div className="text-emerald-400 font-bold text-lg">{item.ek3Modules}</div>
                        <div className="text-gray-600 text-[9px]">{(item.ek3Modules * 3.3).toFixed(1)} kW capacity</div>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="text-gray-500 text-[10px] mb-1">Power Output</div>
                        <div className="text-amber-400 font-bold text-lg">{item.currentPower || 0}/{item.maxPower}</div>
                        <div className="w-full h-1 bg-gray-800 rounded-full mt-1">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${((item.currentPower || 0) / item.maxPower) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Capacity */}
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="text-gray-400 text-xs font-medium mb-3">Charging Capacity</div>
                      {itemType === 'rooftop_hub' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-xs flex items-center gap-1.5">
                              <Plane className="w-3 h-3 text-cyan-400" /> Drone Pads
                            </span>
                            <span className="text-cyan-400 font-bold">
                              {item.chargingSessions?.length || 0}/{item.droneCapacity}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {Array.from({ length: item.droneCapacity }, (_, i) => (
                              <div
                                key={i}
                                className={`flex-1 h-2 rounded ${
                                  i < (item.chargingSessions?.length || 0) ? 'bg-cyan-500' : 'bg-gray-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {itemType === 'street_hub' && (
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-500 text-xs flex items-center gap-1.5">
                                <Truck className="w-3 h-3 text-green-400" /> Pod Slots
                              </span>
                              <span className="text-green-400 font-bold">
                                {item.chargingSessions?.filter(s => s.vehicleType === 'pod').length || 0}/{item.podCapacity}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              {Array.from({ length: item.podCapacity }, (_, i) => (
                                <div
                                  key={i}
                                  className={`flex-1 h-2 rounded ${
                                    i < (item.chargingSessions?.filter(s => s.vehicleType === 'pod').length || 0) ? 'bg-green-500' : 'bg-gray-700'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-gray-500 text-xs flex items-center gap-1.5">
                                <Bot className="w-3 h-3 text-pink-400" /> Swarm Slots
                              </span>
                              <span className="text-pink-400 font-bold">
                                {item.chargingSessions?.filter(s => s.vehicleType === 'swarmbot').length || 0}/{item.swarmCapacity}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              {Array.from({ length: item.swarmCapacity }, (_, i) => (
                                <div
                                  key={i}
                                  className={`flex-1 h-1.5 rounded ${
                                    i < (item.chargingSessions?.filter(s => s.vehicleType === 'swarmbot').length || 0) ? 'bg-pink-500' : 'bg-gray-700'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Performance Metrics */}
                    {item.metrics && (
                      <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="text-gray-400 text-xs font-medium mb-3 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" /> Today's Performance
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <div className="text-gray-500 text-[10px]">Vehicles Served</div>
                            <div className="text-white font-bold">{item.metrics.vehiclesServedToday}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-[10px]">Energy Delivered</div>
                            <div className="text-emerald-400 font-bold">{item.metrics.energyDelivered} kWh</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-[10px]">Avg Wait Time</div>
                            <div className="text-white font-bold">{item.metrics.queueWaitAvg} min</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-[10px]">Efficiency</div>
                            <div className={`font-bold ${item.metrics.efficiency > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {item.metrics.efficiency}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Special Features */}
                    <div className="flex gap-2">
                      {item.robotArm && (
                        <div className="flex-1 p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
                          <div className="flex items-center gap-1.5 text-purple-400 text-[10px] font-medium">
                            <RotateCcw className="w-3 h-3" />
                            Swap Arm
                          </div>
                        </div>
                      )}
                      {item.autoConnector && (
                        <div className="flex-1 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                          <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] font-medium">
                            <Zap className="w-3 h-3" />
                            Auto-Connect
                          </div>
                        </div>
                      )}
                      {item.solarInput > 0 && (
                        <div className="flex-1 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                          <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-medium">
                            <ThermometerSun className="w-3 h-3" />
                            +{item.solarInput}kW Solar
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Scheduled Maintenance */}
                    {item.scheduledMaintenance?.length > 0 && (
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-medium mb-2">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Scheduled Maintenance
                        </div>
                        {item.scheduledMaintenance.map(maint => (
                          <div key={maint.id} className="text-xs">
                            <div className="text-white">{maint.type}</div>
                            <div className="text-gray-500 text-[10px]">
                              In {Math.round((maint.scheduledFor - Date.now()) / 3600000)}h • {maint.duration}min duration
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* PROCESSES TAB */}
            {activeTab === 'processes' && isVehicle && (
              <motion.div
                key="processes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Current Process */}
                <div className="p-3 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full bg-${typeColor}-400 animate-pulse`} />
                    <span className="text-white text-xs font-medium">Active Process</span>
                  </div>

                  {item.missionQueue?.find(m => m.status === 'active') ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${priorityColors[item.missionQueue[0].priority]}`}>
                          {item.missionQueue[0].type.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-[10px] ${
                          item.missionQueue[0].priority === 'high' ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {item.missionQueue[0].priority.toUpperCase()}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Destination</span>
                          <span className="text-white">{item.missionQueue[0].destination}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Packages</span>
                          <span className="text-amber-400">{item.missionQueue[0].packages}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">ETA</span>
                          <span className="text-cyan-400">{item.missionQueue[0].eta} min</span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{Math.round((1 - item.missionQueue[0].eta / 35) * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(1 - item.missionQueue[0].eta / 35) * 100}%` }}
                            className={`h-full bg-gradient-to-r from-${typeColor}-600 to-${typeColor}-400`}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-xs text-center py-4">
                      <Pause className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      No active process
                    </div>
                  )}
                </div>

                {/* State Details */}
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-gray-400 text-xs font-medium mb-3">Current State Details</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">State</span>
                      <span className={`text-${typeColor}-400 uppercase font-medium`}>{item.state?.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Direction</span>
                      <span className="text-white">{item.direction > 0 ? 'Outbound →' : '← Returning'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Route Progress</span>
                      <span className="text-white">{Math.round((item.progress || 0) * 100)}%</span>
                    </div>
                    {itemType === 'drone' && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Flight Level</span>
                        <span className="text-cyan-400">{Math.round(item.altitude || 0)}m AGL</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resource Usage */}
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-gray-400 text-xs font-medium mb-3 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5" /> Resource Usage
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-gray-500">Power Draw</span>
                        <span className="text-amber-400">{Math.round(Math.random() * 50 + 20)}W</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full w-[60%] bg-amber-500" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-gray-500">CPU Load</span>
                        <span className="text-cyan-400">{Math.round(Math.random() * 30 + 15)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full w-[25%] bg-cyan-500" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-gray-500">Network</span>
                        <span className="text-emerald-400">Strong</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full w-[90%] bg-emerald-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SCHEDULED TAB */}
            {activeTab === 'scheduled' && isVehicle && (
              <motion.div
                key="scheduled"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs font-medium">Mission Queue</span>
                  <span className="text-gray-500 text-[10px]">{item.missionQueue?.length || 0} tasks</span>
                </div>

                {item.missionQueue?.map((mission, idx) => (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-3 rounded-lg border ${
                      mission.status === 'active'
                        ? `bg-${typeColor}-500/10 border-${typeColor}-500/30`
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {mission.status === 'active' ? (
                          <Play className={`w-3 h-3 text-${typeColor}-400`} />
                        ) : (
                          <Clock className="w-3 h-3 text-gray-500" />
                        )}
                        <span className={`text-xs font-medium ${
                          mission.status === 'active' ? `text-${typeColor}-400` : 'text-white'
                        }`}>
                          {mission.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${priorityColors[mission.priority]}`}>
                        {mission.priority}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                      <div>
                        <div className="text-gray-500">Dest</div>
                        <div className="text-white truncate">{mission.destination}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Packages</div>
                        <div className="text-amber-400">{mission.packages}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">ETA</div>
                        <div className="text-cyan-400">{mission.eta}m</div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {(!item.missionQueue || item.missionQueue.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <ListTodo className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No scheduled missions</p>
                    <p className="text-xs mt-1">Vehicle is available for dispatch</p>
                  </div>
                )}

                {/* Add Mission Button */}
                <button className={`w-full p-3 rounded-lg border-2 border-dashed border-${typeColor}-500/30 text-${typeColor}-400 text-xs font-medium hover:bg-${typeColor}-500/10 transition-all flex items-center justify-center gap-2`}>
                  <Target className="w-3.5 h-3.5" />
                  Assign New Mission
                </button>
              </motion.div>
            )}

            {/* CHARGING TAB (for hubs) */}
            {activeTab === 'charging' && isHub && (
              <motion.div
                key="charging"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {/* Active Sessions Header */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs font-medium">Active Charging Sessions</span>
                  <span className="text-emerald-400 text-[10px]">
                    {item.chargingSessions?.length || 0} active
                  </span>
                </div>

                {/* Charging Sessions List */}
                {item.chargingSessions?.map((session, idx) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {session.vehicleType === 'drone' ? (
                          <Plane className="w-3.5 h-3.5 text-cyan-400" />
                        ) : session.vehicleType === 'pod' ? (
                          <Truck className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Bot className="w-3.5 h-3.5 text-pink-400" />
                        )}
                        <span className="text-white text-xs font-medium">{session.vehicleId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          session.status === 'charging' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
                        }`}>
                          {session.status === 'charging' ? 'CHARGING' : 'COMPLETING'}
                        </span>
                        <span className="text-gray-500 text-[10px]">Slot {session.slot}</span>
                      </div>
                    </div>

                    {/* Charge Progress */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-gray-500">Charge Level</span>
                        <span className={`font-mono ${
                          session.currentCharge > 80 ? 'text-emerald-400' :
                          session.currentCharge > 40 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {session.currentCharge}% → {session.targetCharge}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden relative">
                        <div
                          className={`absolute h-full ${
                            session.currentCharge > 80 ? 'bg-emerald-600' :
                            session.currentCharge > 40 ? 'bg-amber-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${session.currentCharge}%` }}
                        />
                        <div
                          className="absolute h-full bg-white/20"
                          style={{ width: `${session.targetCharge}%` }}
                        />
                      </div>
                    </div>

                    {/* Session Details */}
                    <div className="flex justify-between mt-2 text-[10px]">
                      <div>
                        <span className="text-gray-500">Power: </span>
                        <span className="text-amber-400">{session.power} kW</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration: </span>
                        <span className="text-white">{Math.round((Date.now() - session.startTime) / 60000)} min</span>
                      </div>
                      <div>
                        <span className="text-gray-500">ETA: </span>
                        <span className="text-cyan-400">~{Math.round((session.targetCharge - session.currentCharge) / 2)} min</span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {(!item.chargingSessions || item.chargingSessions.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No active charging sessions</p>
                    <p className="text-xs mt-1">All slots available</p>
                  </div>
                )}

                {/* Power Distribution */}
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-gray-400 text-xs font-medium mb-3 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5" /> Power Distribution
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-gray-500">Total Output</span>
                        <span className="text-amber-400">{item.currentPower || 0} / {item.maxPower} kW</span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                          style={{ width: `${((item.currentPower || 0) / item.maxPower) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-gray-500">Grid Draw: </span>
                        <span className="text-white">{Math.round((item.currentPower || 0) * 0.9)} kW</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Solar: </span>
                        <span className="text-amber-400">+{item.solarInput || 0} kW</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
                    <div className="text-emerald-400 font-bold text-sm">{item.metrics?.totalSessions || 0}</div>
                    <div className="text-gray-500 text-[9px]">Total Sessions</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
                    <div className="text-amber-400 font-bold text-sm">{item.metrics?.avgSessionTime || 0}m</div>
                    <div className="text-gray-500 text-[9px]">Avg Time</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
                    <div className="text-cyan-400 font-bold text-sm">{item.metrics?.uptime || 0}%</div>
                    <div className="text-gray-500 text-[9px]">Uptime</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-xs font-medium">Activity Log</span>
                  <button className="text-gray-500 text-[10px] hover:text-white transition-colors">
                    View All
                  </button>
                </div>

                {item.history?.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex gap-3 relative"
                  >
                    {/* Timeline line */}
                    {idx < (item.history?.length || 0) - 1 && (
                      <div className="absolute left-[7px] top-5 bottom-0 w-px bg-gray-800" />
                    )}

                    {/* Timeline dot */}
                    <div className={`w-3.5 h-3.5 rounded-full border-2 ${
                      idx === 0
                        ? `border-${typeColor}-400 bg-${typeColor}-400/30`
                        : 'border-gray-600 bg-gray-800'
                    } flex-shrink-0 mt-0.5`} />

                    {/* Content */}
                    <div className="flex-1 pb-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${idx === 0 ? 'text-white font-medium' : 'text-gray-400'}`}>
                          {event.event}
                        </span>
                        <span className="text-[10px] text-gray-600">{formatTime(event.timestamp)}</span>
                      </div>
                      {/* Show vehicle ID for hub events */}
                      {isHub && event.vehicleId && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-500">Vehicle:</span>
                          <span className={`text-[10px] font-medium ${
                            event.vehicleId.includes('drone') ? 'text-cyan-400' :
                            event.vehicleId.includes('pod') ? 'text-green-400' : 'text-pink-400'
                          }`}>
                            {event.vehicleId}
                          </span>
                          {event.duration && (
                            <span className="text-[10px] text-gray-600">• {event.duration}min</span>
                          )}
                        </div>
                      )}
                      {event.details && (
                        <div className="text-[10px] text-gray-500 mt-0.5">{event.details}</div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {(!item.history || item.history.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No activity history</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* VEHICLES TAB (for hubs) - Enhanced Queue View */}
            {activeTab === 'vehicles' && isHub && (
              <motion.div
                key="vehicles"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {/* Queue Summary */}
                <div className="p-3 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-xs font-medium">Queue Status</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${
                      (item.queueLength || 0) > 2 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {(item.queueLength || 0) > 0 ? `${item.queueLength} waiting` : 'No queue'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-emerald-400 font-bold">{item.chargingSessions?.length || 0}</div>
                      <div className="text-gray-500 text-[9px]">Charging</div>
                    </div>
                    <div>
                      <div className="text-amber-400 font-bold">{item.queueLength || 0}</div>
                      <div className="text-gray-500 text-[9px]">Waiting</div>
                    </div>
                    <div>
                      <div className="text-cyan-400 font-bold">~{item.metrics?.queueWaitAvg || 3}m</div>
                      <div className="text-gray-500 text-[9px]">Avg Wait</div>
                    </div>
                  </div>
                </div>

                {/* Currently Charging */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-gray-400 text-xs font-medium">Currently Charging</span>
                  </div>
                  {item.chargingSessions?.slice(0, 3).map((session, idx) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-2.5 rounded-lg bg-white/5 border border-white/10 mb-2"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {session.vehicleType === 'drone' ? (
                            <Plane className="w-3 h-3 text-cyan-400" />
                          ) : session.vehicleType === 'pod' ? (
                            <Truck className="w-3 h-3 text-green-400" />
                          ) : (
                            <Bot className="w-3 h-3 text-pink-400" />
                          )}
                          <span className="text-white text-[11px]">{session.vehicleId}</span>
                        </div>
                        <span className="text-emerald-400 text-[10px]">{session.currentCharge}%</span>
                      </div>
                      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${session.currentCharge}%` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* In Queue / Approaching */}
                {(item.queueLength || 0) > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-gray-400 text-xs font-medium">In Queue</span>
                    </div>
                    {Array.from({ length: Math.min(item.queueLength || 0, 3) }, (_, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 mb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded bg-amber-500/20 flex items-center justify-center">
                              <span className="text-amber-400 text-[10px] font-bold">{i + 1}</span>
                            </div>
                            <span className="text-gray-400 text-[11px]">
                              {itemType === 'rooftop_hub' ? `drone-${Math.floor(Math.random() * 8) + 1}` : `pod-${Math.floor(Math.random() * 4) + 1}`}
                            </span>
                          </div>
                          <span className="text-amber-400 text-[10px]">~{(i + 1) * 3}min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recently Departed */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                    <span className="text-gray-400 text-xs font-medium">Recently Departed</span>
                  </div>
                  {item.history?.slice(0, 2).filter(h => h.event.includes('departed') || h.event.includes('completed')).slice(0, 2).map((event, idx) => (
                    <div key={event.id} className="p-2 rounded-lg bg-white/5 border border-white/10 mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-400 text-[11px]">{event.vehicleId}</span>
                      </div>
                      <span className="text-gray-500 text-[10px]">{formatTime(event.timestamp)}</span>
                    </div>
                  )) || (
                    <div className="text-gray-600 text-[10px] text-center py-2">No recent departures</div>
                  )}
                </div>

                {getConnectedVehicles().length === 0 && (!item.chargingSessions || item.chargingSessions.length === 0) && (
                  <div className="text-center py-6 text-gray-500">
                    <Radio className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No vehicles at hub</p>
                    <p className="text-xs mt-1">All slots available</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions Footer */}
        <div className="p-3 border-t border-white/10 bg-white/5">
          <div className="flex gap-2">
            <button className={`flex-1 py-2 rounded-lg text-xs font-medium bg-${typeColor}-500/20 text-${typeColor}-400 hover:bg-${typeColor}-500/30 transition-all flex items-center justify-center gap-1.5`}>
              <Zap className="w-3.5 h-3.5" />
              {isVehicle ? 'Force Charge' : 'Boost Power'}
            </button>
            <button className="flex-1 py-2 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all flex items-center justify-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              {isVehicle ? 'Reroute' : 'Dispatch'}
            </button>
            <button className="py-2 px-3 rounded-lg text-xs font-medium bg-white/10 text-gray-400 hover:bg-white/20 transition-all">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// KorAllThing Panel (Delivery Version) - Now using extracted component
// ============================================================================

function DeliveryKorAllThingPanel() {
  const {
    korAllThingExpanded,
    toggleKorAllThing,
    scenarioQueue,
    drones: localDrones,
    pods: localPods,
    swarmBots: localSwarmBots,
    stats,
    updateScenario,
    showDecisionToast,
    clearDecisionToast,
    clearFocusedVehicle,
    setSelectedCity
  } = useDelivery();

  // Connect to backend simulation
  const {
    isConnected,
    drones: backendDrones,
    pods: backendPods,
    swarmBots: backendSwarmBots,
    metrics: backendMetrics,
    connect
  } = useDeliveryConnection({ autoConnect: true });

  // Use backend data when connected, fallback to local simulation
  const drones = isConnected && backendDrones.length > 0 ? backendDrones : localDrones;
  const pods = isConnected && backendPods.length > 0 ? backendPods : localPods;
  const swarmBots = isConnected && backendSwarmBots.length > 0 ? backendSwarmBots : localSwarmBots;

  // Handle scenario option selection from KorAllThing panel
  const handleScenarioSelect = useCallback((scenario, option) => {
    // Mark scenario as completed with selected option
    updateScenario({
      id: scenario.id,
      status: 'completed',
      selectedOption: option,
      completedAt: Date.now()
    });

    // Show decision result toast with proper fields
    showDecisionToast({
      title: scenario.config?.title || 'Decision Made',
      action: option.label,
      effect: option.ifChosen || 'Action applied',
      vehicleId: scenario.vehicleId,
      vehicleType: scenario.vehicleType,
      color: scenario.config?.color || '#00f0ff'
    });

    // Clear toast and return to global view after 5 seconds
    setTimeout(() => {
      clearDecisionToast();
      clearFocusedVehicle();
      setSelectedCity(null);
    }, 5000);
  }, [updateScenario, showDecisionToast, clearDecisionToast, clearFocusedVehicle, setSelectedCity]);

  // Handle scenario completion (after action flow animation)
  const handleScenarioComplete = useCallback((scenario) => {
    // Scenario already marked complete in handleScenarioSelect
    // This is called after the action flow animation finishes
  }, []);

  return (
    <KorAllThingPanelNew
      drones={drones}
      pods={pods}
      swarmBots={swarmBots}
      scenarioQueue={scenarioQueue}
      stats={stats}
      isExpanded={korAllThingExpanded}
      onToggle={toggleKorAllThing}
      isConnected={isConnected}
      backendData={isConnected ? { drones: backendDrones, pods: backendPods, swarmBots: backendSwarmBots, metrics: backendMetrics } : null}
      onScenarioSelect={handleScenarioSelect}
      onScenarioComplete={handleScenarioComplete}
    />
  );
}

// ============================================================================
// Engine Wrapper
// ============================================================================

function DeliveryEngineWrapper({ children }) {
  const ctx = useDelivery();
  const ctxRef = useRef(ctx);
  useEffect(() => { ctxRef.current = ctx; }, [ctx]);

  // Scenario generation is now manual - use "Trigger Scenario" button

  // Handle scenario triggers from engine (for emergency events)
  const handleScenarioTrigger = useCallback((scenarioData) => {
    // Check if we already have this type of scenario for this vehicle
    const existingScenario = ctx.scenarioQueue?.find(s =>
      s.vehicleId === scenarioData.vehicleId &&
      s.type === scenarioData.type &&
      s.status === 'pending'
    );
    if (existingScenario) return;

    // Limit to 2 active scenarios
    const activeCount = ctx.scenarioQueue?.filter(s => s.status === 'pending').length || 0;
    if (activeCount >= 2) return;

    const config = scenarioData.config || SCENARIO_CONFIG[scenarioData.type];
    if (!config) return;

    ctx.addScenario({
      id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: scenarioData.type,
      vehicleId: scenarioData.vehicleId,
      vehicleType: scenarioData.vehicleType,
      createdAt: Date.now(),
      expiresAt: Date.now() + (config.timer * 1000),
      status: 'pending',
      config
    });
  }, [ctx]);

  useDeliveryEngine({
    isRunning: ctx.isRunning,
    speed: ctx.speed,
    drones: ctx.drones,
    pods: ctx.pods,
    swarmBots: ctx.swarmBots,
    rooftopHubs: ctx.rooftopHubs,
    streetHubs: ctx.streetHubs,
    droneCorridors: Object.values(CITIES).flatMap(c => c.droneCorridors || []),
    podRoutes: Object.values(CITIES).flatMap(c => c.podRoutes || []),
    swarmZones: Object.values(CITIES).flatMap(c => c.swarmZones || []),
    updateDrones: ctx.updateDrones,
    updatePods: ctx.updatePods,
    updateSwarmBots: ctx.updateSwarmBots,
    onScenarioTrigger: handleScenarioTrigger
  });

  // Truck animation - intercity heavy-duty network
  useEffect(() => {
    if (!ctx.isRunning) return;

    const interval = setInterval(() => {
      const currentCtx = ctxRef.current;
      if (!currentCtx.trucks || currentCtx.trucks.length === 0) return;

      const updatedTrucks = currentCtx.trucks.map(truck => {
        const corridor = INTERSTATE_CORRIDORS[
          Object.keys(INTERSTATE_CORRIDORS).find(k =>
            INTERSTATE_CORRIDORS[k].id === truck.corridorId
          )
        ];
        if (!corridor) return truck;

        // Handle swapping state
        if (truck.state === 'swapping') {
          // Finish swapping after a few ticks
          if (Math.random() < 0.05 * currentCtx.speed) {
            return {
              ...truck,
              state: 'driving',
              batteryLevel: 95 + Math.random() * 5,
              swapsCompleted: truck.swapsCompleted + 1
            };
          }
          return truck;
        }

        // Move truck along corridor
        const moveSpeed = 0.0003 * currentCtx.speed * truck.direction;
        let newProgress = truck.progress + moveSpeed;

        // Bounce at ends
        let newDirection = truck.direction;
        if (newProgress >= 1) {
          newProgress = 1;
          newDirection = -1;
        } else if (newProgress <= 0) {
          newProgress = 0;
          newDirection = 1;
        }

        // Drain battery
        let newBattery = truck.batteryLevel - (0.02 * currentCtx.speed);

        // Check if needs swap (low battery near station)
        let newState = truck.state;
        if (newBattery < 25 && Math.random() < 0.1) {
          newState = 'swapping';
          newBattery = truck.batteryLevel; // Hold during swap
        }

        // Interpolate position
        const waypointIndex = Math.floor(newProgress * (corridor.waypoints.length - 1));
        const localProgress = (newProgress * (corridor.waypoints.length - 1)) - waypointIndex;
        const wp1 = corridor.waypoints[waypointIndex];
        const wp2 = corridor.waypoints[Math.min(waypointIndex + 1, corridor.waypoints.length - 1)];
        const newPosition = [
          wp1[0] + (wp2[0] - wp1[0]) * localProgress,
          wp1[1] + (wp2[1] - wp1[1]) * localProgress
        ];

        return {
          ...truck,
          progress: newProgress,
          position: newPosition,
          direction: newDirection,
          batteryLevel: Math.max(5, newBattery),
          state: newState,
          totalMiles: truck.totalMiles + (currentCtx.speed * 0.1)
        };
      });

      currentCtx.updateTrucks(updatedTrucks);
    }, 100);

    return () => clearInterval(interval);
  }, [ctx.isRunning]);

  return children;
}

// ============================================================================
// Main Page Component
// ============================================================================

function LADeliveryContent() {
  const ctx = useDelivery();

  // Safety check - show loading if context not ready
  if (!ctx) {
    return (
      <div className="min-h-screen bg-[#030308] flex items-center justify-center text-cyan-400">
        Loading delivery network...
      </div>
    );
  }

  const {
    selectedItem,
    scenarioQueue,
    drones,
    pods,
    swarmBots,
    rooftopHubs,
    streetHubs,
    focusedVehicle,
    decisionToast,
    removeScenario,
    updateDrones,
    updatePods,
    updateSwarmBots,
    setVehiclePriority,
    addDecisionHistory,
    setFocusedVehicle,
    clearFocusedVehicle,
    setSelectedCity,
    showDecisionToast,
    clearDecisionToast
  } = ctx;

  // Track last focused scenario to avoid re-focusing
  const lastFocusedScenarioRef = useRef(null);

  // Auto-focus on vehicle when new scenario appears
  useEffect(() => {
    const activeScenarios = scenarioQueue?.filter(s => s.status === 'pending') || [];
    if (activeScenarios.length === 0) {
      // No active scenarios - clear focus after delay
      if (focusedVehicle) {
        const timeout = setTimeout(() => {
          clearFocusedVehicle();
        }, 2000);
        return () => clearTimeout(timeout);
      }
      return;
    }

    // Get current scenario (first pending)
    const currentScenario = activeScenarios[0];

    // Don't re-focus if same scenario
    if (lastFocusedScenarioRef.current === currentScenario.id) return;
    lastFocusedScenarioRef.current = currentScenario.id;

    // Find the vehicle
    const allVehicles = [
      ...(drones || []).map(v => ({ ...v, vehicleType: 'drone' })),
      ...(pods || []).map(v => ({ ...v, vehicleType: 'pod' })),
      ...(swarmBots || []).map(v => ({ ...v, vehicleType: 'swarmbot' }))
    ];
    const vehicle = allVehicles.find(v => v.id === currentScenario.vehicleId);

    if (vehicle?.position) {
      setFocusedVehicle({
        id: vehicle.id,
        type: currentScenario.vehicleType,
        position: vehicle.position
      });

      // Return to global view after 10 seconds
      const timeout = setTimeout(() => {
        clearFocusedVehicle();
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [scenarioQueue, drones, pods, swarmBots, focusedVehicle, setFocusedVehicle, clearFocusedVehicle]);

  // Handle decision made by user or AI
  const handleDecision = useCallback((scenarioId, optionId, wasAI) => {
    const scenario = scenarioQueue?.find(s => s.id === scenarioId);
    if (!scenario) return;

    // Get the chosen option details
    const chosenOption = scenario.config?.options?.find(o => o.id === optionId);

    // Apply the decision effect to simulation
    applyDecisionEffect(scenario, optionId, {
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
    });

    // Remove the scenario
    removeScenario(scenarioId);

    // Show decision result toast
    showDecisionToast({
      title: scenario.config?.title || 'Decision Made',
      action: chosenOption?.label || optionId,
      effect: chosenOption?.ifChosen || 'Action applied',
      vehicleId: scenario.vehicleId,
      vehicleType: scenario.vehicleType,
      color: scenario.config?.color || '#00f0ff'
    });

    // Clear toast and return to global view after 8 seconds
    setTimeout(() => {
      clearDecisionToast();
      clearFocusedVehicle();
      setSelectedCity(null);
    }, 8000);
  }, [scenarioQueue, drones, pods, swarmBots, rooftopHubs, streetHubs,
      updateDrones, updatePods, updateSwarmBots, setVehiclePriority,
      addDecisionHistory, removeScenario, clearFocusedVehicle, setSelectedCity,
      showDecisionToast, clearDecisionToast]);

  // Handle scenario dismissed
  const handleDismiss = useCallback((scenarioId) => {
    removeScenario(scenarioId);
    // Stay focused for 5 seconds, then return to global USA view
    setTimeout(() => {
      clearFocusedVehicle();
      setSelectedCity(null);
    }, 5000);
  }, [removeScenario, clearFocusedVehicle, setSelectedCity]);

  // Collect all vehicles for decision HUD
  const allVehicles = useMemo(() => [
    ...(drones || []),
    ...(pods || []),
    ...(swarmBots || [])
  ], [drones, pods, swarmBots]);

  return (
    <DeliveryEngineWrapper>
      <div className="relative w-full h-screen bg-[#030308] overflow-hidden">
        {/* KorAllThing Panel (Left side) */}
        <DeliveryKorAllThingPanel />

        {/* Fleet List Panel (Entity selection) */}
        <FleetListPanel />

        {/* Decorative corner accents */}
        <div className="absolute top-0 left-16 w-32 h-32 border-l-2 border-t-2 border-cyan-500/30 pointer-events-none z-10" />
        <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-purple-500/30 pointer-events-none z-10" />
        <div className="absolute bottom-0 left-16 w-32 h-32 border-l-2 border-b-2 border-purple-500/30 pointer-events-none z-10" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-cyan-500/30 pointer-events-none z-10" />

        {/* Title */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
          <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            US Autonomous Delivery Network
          </h1>
          <p className="text-center text-xs text-gray-500 mt-1">
            Powered by EK3 Modular Charging Infrastructure
          </p>
        </div>

        {/* Decision Result Toast */}
        <AnimatePresence>
          {decisionToast && <DecisionToast toast={decisionToast} />}
        </AnimatePresence>

        {/* Map */}
        <DeliveryMap />

        {/* UI Overlays */}
        <ZoneSelector />
        <StatsHUD />
        <SimulationControls />

        {/* Decision HUD (Bottom, when scenarios pending) */}
        <DeliveryDecisionHUD
          scenarios={scenarioQueue || []}
          vehicles={allVehicles}
          onDecision={handleDecision}
          onDismiss={handleDismiss}
        />

        {/* Vehicle Detail Panel (Right side, when selected) */}
        <AnimatePresence>
          {selectedItem && <VehicleDetailPanel />}
        </AnimatePresence>

        {/* Back button */}
        <a
          href="/"
          className="absolute bottom-4 left-20 z-[1000] px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 text-sm rounded-lg transition-all flex items-center gap-2"
        >
          ← Back
        </a>
      </div>
    </DeliveryEngineWrapper>
  );
}

export default function LADeliveryPage() {
  return (
    <DeliveryProvider>
      <LADeliveryContent />
    </DeliveryProvider>
  );
}
