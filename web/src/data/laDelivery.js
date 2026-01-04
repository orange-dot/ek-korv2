/**
 * LA Delivery Fleet Configuration
 * Futuristic autonomous delivery network for GV pitch demo
 */

// Vehicle type constants
export const VEHICLE_TYPES = {
  POD: 'pod',           // Nuro-style ground delivery vehicle
  DRONE: 'drone',       // Quadcopter aerial delivery
  SWARM_BOT: 'swarmbot' // Sidewalk micro-delivery robot
};

// Vehicle states
export const DELIVERY_STATES = {
  // Common states
  IDLE: 'idle',
  CHARGING: 'charging',
  SWAPPING: 'swapping',

  // Movement states
  EN_ROUTE: 'en_route',
  ARRIVING: 'arriving',

  // Drone specific
  FLYING: 'flying',
  LANDING: 'landing',
  HOVERING: 'hovering',
  TAKING_OFF: 'taking_off',

  // Handoff states
  HANDOFF_WAITING: 'handoff_waiting',
  HANDOFF_ACTIVE: 'handoff_active',

  // SwarmBot specific
  SWARMING: 'swarming',
  DELIVERING: 'delivering',
  RETURNING: 'returning',

  // Pod specific
  LOADING: 'loading',
  UNLOADING: 'unloading',
  DISPATCHING: 'dispatching' // Dispatching swarm bots
};

// Hub types
export const HUB_TYPES = {
  ROOFTOP: 'rooftop_hub',   // Drone landing/charging
  STREET: 'street_hub',      // Pod/SwarmBot charging
  HANDOFF: 'handoff_point'   // Package transfer location
};

// LA Zone definitions
export const LA_ZONES = {
  DTLA: {
    id: 'dtla',
    name: 'Downtown LA',
    shortName: 'DTLA',
    type: 'dense_urban',
    center: [34.0407, -118.2468],
    bounds: [[34.025, -118.275], [34.065, -118.22]],
    primaryVehicle: VEHICLE_TYPES.DRONE,
    secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#00f0ff', // Cyan
    deliveryDensity: 'high',
    description: 'High-rise delivery via drones with swarmbot last-100m'
  },
  SANTA_MONICA: {
    id: 'santaMonica',
    name: 'Santa Monica',
    shortName: 'SM',
    type: 'coastal_commercial',
    center: [34.0195, -118.4912],
    bounds: [[34.005, -118.52], [34.035, -118.46]],
    primaryVehicle: VEHICLE_TYPES.POD,
    secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#39ff14', // Neon green
    deliveryDensity: 'medium',
    description: 'Beach area with pod + swarm coverage'
  },
  PASADENA: {
    id: 'pasadena',
    name: 'Pasadena',
    shortName: 'PAS',
    type: 'residential',
    center: [34.1478, -118.1445],
    bounds: [[34.13, -118.17], [34.17, -118.12]],
    primaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    secondaryVehicle: VEHICLE_TYPES.POD,
    color: '#ff006e', // Neon pink
    deliveryDensity: 'medium',
    description: 'Residential neighborhood swarm delivery'
  },
  HOLLYWOOD: {
    id: 'hollywood',
    name: 'Hollywood Hills',
    shortName: 'HW',
    type: 'mixed_terrain',
    center: [34.1341, -118.3215],
    bounds: [[34.11, -118.36], [34.155, -118.28]],
    primaryVehicle: VEHICLE_TYPES.DRONE,
    secondaryVehicle: VEHICLE_TYPES.POD,
    color: '#9d4edd', // Neon purple
    deliveryDensity: 'low',
    description: 'Hillside terrain - drone primary access'
  }
};

// Rooftop Hubs (Drone charging/swap stations)
export const ROOFTOP_HUBS = [
  {
    id: 'hub-dtla-1',
    name: 'DTLA Tower Hub',
    zone: 'dtla',
    position: [34.0452, -118.2551],
    type: HUB_TYPES.ROOFTOP,
    ek3Modules: 8,       // 26.4 kW
    maxPower: 26,
    droneCapacity: 6,    // Landing pads
    swapEnabled: true,
    robotArm: true,
    altitude: 150,       // Building height in meters
    status: 'active'
  },
  {
    id: 'hub-dtla-2',
    name: 'Arts District Rooftop',
    zone: 'dtla',
    position: [34.0355, -118.2328],
    type: HUB_TYPES.ROOFTOP,
    ek3Modules: 6,
    maxPower: 20,
    droneCapacity: 4,
    swapEnabled: true,
    robotArm: true,
    altitude: 80,
    status: 'active'
  },
  {
    id: 'hub-hollywood-1',
    name: 'Hollywood View Hub',
    zone: 'hollywood',
    position: [34.1382, -118.3267],
    type: HUB_TYPES.ROOFTOP,
    ek3Modules: 8,
    maxPower: 26,
    droneCapacity: 6,
    swapEnabled: true,
    robotArm: true,
    altitude: 200,
    status: 'active'
  },
  {
    id: 'hub-sm-rooftop',
    name: 'Santa Monica Pier Hub',
    zone: 'santaMonica',
    position: [34.0103, -118.4973],
    type: HUB_TYPES.ROOFTOP,
    ek3Modules: 4,
    maxPower: 13,
    droneCapacity: 3,
    swapEnabled: true,
    robotArm: false,
    altitude: 40,
    status: 'active'
  }
];

// Street Hubs (Pod + SwarmBot charging)
export const STREET_HUBS = [
  {
    id: 'hub-dtla-street-1',
    name: 'Grand Ave Micro-Hub',
    zone: 'dtla',
    position: [34.0535, -118.2540],
    type: HUB_TYPES.STREET,
    ek3Modules: 24,      // 79.2 kW
    maxPower: 79,
    podCapacity: 2,
    swarmCapacity: 8,
    autoConnector: true,
    status: 'active'
  },
  {
    id: 'hub-sm-street-1',
    name: 'Third Street Promenade Hub',
    zone: 'santaMonica',
    position: [34.0159, -118.4960],
    type: HUB_TYPES.STREET,
    ek3Modules: 18,
    maxPower: 59,
    podCapacity: 2,
    swarmCapacity: 6,
    autoConnector: true,
    status: 'active'
  },
  {
    id: 'hub-sm-street-2',
    name: 'Montana Ave Hub',
    zone: 'santaMonica',
    position: [34.0316, -118.4892],
    type: HUB_TYPES.STREET,
    ek3Modules: 12,
    maxPower: 40,
    podCapacity: 1,
    swarmCapacity: 8,
    autoConnector: true,
    status: 'active'
  },
  {
    id: 'hub-pasadena-1',
    name: 'Old Town Pasadena Hub',
    zone: 'pasadena',
    position: [34.1456, -118.1489],
    type: HUB_TYPES.STREET,
    ek3Modules: 24,
    maxPower: 79,
    podCapacity: 2,
    swarmCapacity: 12,
    autoConnector: true,
    status: 'active'
  },
  {
    id: 'hub-pasadena-2',
    name: 'Caltech Area Hub',
    zone: 'pasadena',
    position: [34.1377, -118.1253],
    type: HUB_TYPES.STREET,
    ek3Modules: 18,
    maxPower: 59,
    podCapacity: 1,
    swarmCapacity: 10,
    autoConnector: true,
    status: 'active'
  },
  {
    id: 'hub-hollywood-street',
    name: 'Sunset Blvd Hub',
    zone: 'hollywood',
    position: [34.0977, -118.3287],
    type: HUB_TYPES.STREET,
    ek3Modules: 15,
    maxPower: 50,
    podCapacity: 2,
    swarmCapacity: 6,
    autoConnector: true,
    status: 'active'
  }
];

// Handoff Points (Drone-to-SwarmBot, Pod-to-Swarm transfers)
export const HANDOFF_POINTS = [
  {
    id: 'handoff-dtla-1',
    name: 'Pershing Square Transfer',
    zone: 'dtla',
    position: [34.0487, -118.2529],
    type: HUB_TYPES.HANDOFF,
    droneCapacity: 2,
    swarmCapacity: 6,
    podAccess: false
  },
  {
    id: 'handoff-dtla-2',
    name: 'Little Tokyo Exchange',
    zone: 'dtla',
    position: [34.0494, -118.2407],
    type: HUB_TYPES.HANDOFF,
    droneCapacity: 2,
    swarmCapacity: 4,
    podAccess: true
  },
  {
    id: 'handoff-sm-1',
    name: 'Palisades Park Transfer',
    zone: 'santaMonica',
    position: [34.0167, -118.5011],
    type: HUB_TYPES.HANDOFF,
    droneCapacity: 1,
    swarmCapacity: 4,
    podAccess: true
  },
  {
    id: 'handoff-pasadena-1',
    name: 'Central Park Exchange',
    zone: 'pasadena',
    position: [34.1466, -118.1396],
    type: HUB_TYPES.HANDOFF,
    droneCapacity: 2,
    swarmCapacity: 8,
    podAccess: true
  },
  {
    id: 'handoff-hollywood-1',
    name: 'Runyon Canyon Base',
    zone: 'hollywood',
    position: [34.1127, -118.3472],
    type: HUB_TYPES.HANDOFF,
    droneCapacity: 3,
    swarmCapacity: 4,
    podAccess: false
  }
];

// Drone flight corridors (point-to-point routes)
export const DRONE_CORRIDORS = [
  {
    id: 'corridor-dtla-1',
    name: 'DTLA Tower Circuit',
    zone: 'dtla',
    waypoints: [
      [34.0452, -118.2551], // Hub 1
      [34.0487, -118.2529], // Handoff point
      [34.0520, -118.2490],
      [34.0494, -118.2407], // Handoff 2
      [34.0355, -118.2328], // Hub 2
    ],
    altitude: 100,
    color: '#00f0ff'
  },
  {
    id: 'corridor-hollywood-1',
    name: 'Hollywood Hills Run',
    zone: 'hollywood',
    waypoints: [
      [34.1382, -118.3267], // Hollywood Hub
      [34.1280, -118.3350],
      [34.1127, -118.3472], // Runyon handoff
      [34.0977, -118.3287], // Back to street hub area
    ],
    altitude: 150,
    color: '#9d4edd'
  }
];

// Pod routes (street-level)
export const POD_ROUTES = [
  {
    id: 'pod-route-sm-1',
    name: 'Santa Monica Main',
    zone: 'santaMonica',
    waypoints: [
      [34.0159, -118.4960], // Third Street Hub
      [34.0172, -118.4923],
      [34.0195, -118.4890],
      [34.0230, -118.4855],
      [34.0167, -118.5011], // Handoff point
      [34.0103, -118.4973], // Pier hub
    ],
    color: '#39ff14'
  },
  {
    id: 'pod-route-pasadena-1',
    name: 'Pasadena Loop',
    zone: 'pasadena',
    waypoints: [
      [34.1456, -118.1489], // Old Town Hub
      [34.1466, -118.1396], // Handoff
      [34.1425, -118.1340],
      [34.1377, -118.1253], // Caltech Hub
      [34.1420, -118.1350],
      [34.1456, -118.1489], // Back to Old Town
    ],
    color: '#ff006e'
  }
];

// SwarmBot zones (neighborhood mesh)
export const SWARM_ZONES = [
  {
    id: 'swarm-zone-pasadena',
    name: 'Pasadena Residential',
    zone: 'pasadena',
    center: [34.1450, -118.1400],
    radius: 0.015, // ~1.5km coverage
    density: 8,    // Bots per zone
    baseHub: 'hub-pasadena-1'
  },
  {
    id: 'swarm-zone-sm',
    name: 'Santa Monica Beach',
    zone: 'santaMonica',
    center: [34.0180, -118.4950],
    radius: 0.012,
    density: 6,
    baseHub: 'hub-sm-street-1'
  },
  {
    id: 'swarm-zone-dtla',
    name: 'DTLA Ground',
    zone: 'dtla',
    center: [34.0480, -118.2500],
    radius: 0.010,
    density: 8,
    baseHub: 'hub-dtla-street-1'
  }
];

// Vehicle physics configuration
export const VEHICLE_PHYSICS = {
  [VEHICLE_TYPES.POD]: {
    speedMultiplier: 0.00003,     // Ground speed
    batteryDrain: 0.0003,         // Large battery, slow drain
    chargingRate: 0.015,          // Slower charge (larger battery)
    maxBattery: 100,              // kWh equivalent
    packageCapacity: 15,
    color: '#39ff14'
  },
  [VEHICLE_TYPES.DRONE]: {
    speedMultiplier: 0.0001,      // Faster aerial
    batteryDrain: 0.002,          // Small battery, fast drain
    chargingRate: 0.05,           // Fast swap/charge
    maxBattery: 100,              // Simulated %
    packageCapacity: 2,
    color: '#00f0ff',
    altitudeRange: [50, 200]      // Min/max meters
  },
  [VEHICLE_TYPES.SWARM_BOT]: {
    speedMultiplier: 0.00001,     // Slowest, sidewalk
    batteryDrain: 0.0008,
    chargingRate: 0.04,
    maxBattery: 100,
    packageCapacity: 3,
    color: '#ff006e'
  }
};

// Initial fleet configuration
export const INITIAL_FLEET = {
  drones: 12,
  pods: 6,
  swarmBots: 20
};

// Main LA configuration export
export const laDeliveryConfig = {
  id: 'losAngeles',
  name: 'Los Angeles',
  fullName: 'Los Angeles Autonomous Delivery Network',
  center: [34.0522, -118.2437],
  zoom: 11,
  minZoom: 10,
  maxZoom: 18,

  // Fleet counts
  ...INITIAL_FLEET,

  // All data
  zones: LA_ZONES,
  rooftopHubs: ROOFTOP_HUBS,
  streetHubs: STREET_HUBS,
  handoffPoints: HANDOFF_POINTS,
  droneCorridors: DRONE_CORRIDORS,
  podRoutes: POD_ROUTES,
  swarmZones: SWARM_ZONES,
  vehiclePhysics: VEHICLE_PHYSICS,

  // Simulation settings
  simulationSpeed: 1,
  handoffDuration: 3000,  // ms
  scenarioInterval: 5000, // ms between scenarios
};

// Helper functions
export const getZoneById = (zoneId) => LA_ZONES[zoneId.toUpperCase()] || Object.values(LA_ZONES).find(z => z.id === zoneId);

export const getHubsInZone = (zoneId) => [
  ...ROOFTOP_HUBS.filter(h => h.zone === zoneId),
  ...STREET_HUBS.filter(h => h.zone === zoneId)
];

export const getHandoffPointsInZone = (zoneId) =>
  HANDOFF_POINTS.filter(h => h.zone === zoneId);

export const getNearestHub = (position, type = null) => {
  const allHubs = type === HUB_TYPES.ROOFTOP
    ? ROOFTOP_HUBS
    : type === HUB_TYPES.STREET
      ? STREET_HUBS
      : [...ROOFTOP_HUBS, ...STREET_HUBS];

  let nearest = null;
  let minDist = Infinity;

  allHubs.forEach(hub => {
    const dist = Math.sqrt(
      Math.pow(hub.position[0] - position[0], 2) +
      Math.pow(hub.position[1] - position[1], 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = hub;
    }
  });

  return nearest;
};

export const getNearestHandoffPoint = (position) => {
  let nearest = null;
  let minDist = Infinity;

  HANDOFF_POINTS.forEach(point => {
    const dist = Math.sqrt(
      Math.pow(point.position[0] - position[0], 2) +
      Math.pow(point.position[1] - position[1], 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = point;
    }
  });

  return nearest;
};

export const interpolateCorridorPosition = (corridor, progress) => {
  const waypoints = corridor.waypoints;
  const totalSegments = waypoints.length - 1;
  const segmentProgress = progress * totalSegments;
  const segmentIndex = Math.min(Math.floor(segmentProgress), totalSegments - 1);
  const localProgress = segmentProgress - segmentIndex;

  const start = waypoints[segmentIndex];
  const end = waypoints[segmentIndex + 1] || waypoints[segmentIndex];

  return [
    start[0] + (end[0] - start[0]) * localProgress,
    start[1] + (end[1] - start[1]) * localProgress
  ];
};

export const interpolateRoutePosition = (route, progress) => {
  return interpolateCorridorPosition({ waypoints: route.waypoints }, progress);
};

export default laDeliveryConfig;
