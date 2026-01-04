/**
 * US Delivery Cities Configuration
 * Multi-city autonomous delivery network for GV pitch demo
 */

import { VEHICLE_TYPES, HUB_TYPES, VEHICLE_PHYSICS } from './laDelivery';

// Import detailed GPS routes (50+ coordinates per route)
import { POD_ROUTES_BY_CITY } from './routes/podRoutes';
import { INTERSTATE_ROUTES, getAllSwapStations } from './routes/interstateRoutes';
import { SWARM_STREET_GRID } from './routes/swarmRoutes';

// ============================================================================
// CITY: LOS ANGELES
// ============================================================================

const LA_ZONES = {
  DTLA: {
    id: 'dtla', name: 'Downtown LA', shortName: 'DTLA', type: 'dense_urban',
    center: [34.0407, -118.2468], bounds: [[34.025, -118.275], [34.065, -118.22]],
    primaryVehicle: VEHICLE_TYPES.DRONE, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#00f0ff', deliveryDensity: 'high',
    description: 'High-rise delivery via drones with swarmbot last-100m'
  },
  SANTA_MONICA: {
    id: 'santaMonica', name: 'Santa Monica', shortName: 'SM', type: 'coastal_commercial',
    center: [34.0195, -118.4912], bounds: [[34.005, -118.52], [34.035, -118.46]],
    primaryVehicle: VEHICLE_TYPES.POD, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#39ff14', deliveryDensity: 'medium',
    description: 'Beach area with pod + swarm coverage'
  },
  PASADENA: {
    id: 'pasadena', name: 'Pasadena', shortName: 'PAS', type: 'residential',
    center: [34.1478, -118.1445], bounds: [[34.13, -118.17], [34.17, -118.12]],
    primaryVehicle: VEHICLE_TYPES.SWARM_BOT, secondaryVehicle: VEHICLE_TYPES.POD,
    color: '#ff006e', deliveryDensity: 'medium',
    description: 'Residential neighborhood swarm delivery'
  },
  HOLLYWOOD: {
    id: 'hollywood', name: 'Hollywood Hills', shortName: 'HW', type: 'mixed_terrain',
    center: [34.1341, -118.3215], bounds: [[34.11, -118.36], [34.155, -118.28]],
    primaryVehicle: VEHICLE_TYPES.DRONE, secondaryVehicle: VEHICLE_TYPES.POD,
    color: '#9d4edd', deliveryDensity: 'low',
    description: 'Hillside terrain - drone primary access'
  }
};

const LA_ROOFTOP_HUBS = [
  { id: 'hub-dtla-1', name: 'DTLA Tower Hub', zone: 'dtla', position: [34.0452, -118.2551], type: HUB_TYPES.ROOFTOP, ek3Modules: 8, maxPower: 26, droneCapacity: 6, swapEnabled: true, robotArm: true, altitude: 150, status: 'active' },
  { id: 'hub-dtla-2', name: 'Arts District Rooftop', zone: 'dtla', position: [34.0355, -118.2328], type: HUB_TYPES.ROOFTOP, ek3Modules: 6, maxPower: 20, droneCapacity: 4, swapEnabled: true, robotArm: true, altitude: 80, status: 'active' },
  { id: 'hub-hollywood-1', name: 'Hollywood View Hub', zone: 'hollywood', position: [34.1382, -118.3267], type: HUB_TYPES.ROOFTOP, ek3Modules: 8, maxPower: 26, droneCapacity: 6, swapEnabled: true, robotArm: true, altitude: 200, status: 'active' },
  { id: 'hub-sm-rooftop', name: 'Santa Monica Pier Hub', zone: 'santaMonica', position: [34.0103, -118.4973], type: HUB_TYPES.ROOFTOP, ek3Modules: 4, maxPower: 13, droneCapacity: 3, swapEnabled: true, robotArm: false, altitude: 40, status: 'active' }
];

const LA_STREET_HUBS = [
  { id: 'hub-dtla-street-1', name: 'Grand Ave Micro-Hub', zone: 'dtla', position: [34.0535, -118.2540], type: HUB_TYPES.STREET, ek3Modules: 24, maxPower: 79, podCapacity: 2, swarmCapacity: 8, autoConnector: true, status: 'active' },
  { id: 'hub-sm-street-1', name: 'Third Street Promenade Hub', zone: 'santaMonica', position: [34.0159, -118.4960], type: HUB_TYPES.STREET, ek3Modules: 18, maxPower: 59, podCapacity: 2, swarmCapacity: 6, autoConnector: true, status: 'active' },
  { id: 'hub-sm-street-2', name: 'Montana Ave Hub', zone: 'santaMonica', position: [34.0316, -118.4892], type: HUB_TYPES.STREET, ek3Modules: 12, maxPower: 40, podCapacity: 1, swarmCapacity: 8, autoConnector: true, status: 'active' },
  { id: 'hub-pasadena-1', name: 'Old Town Pasadena Hub', zone: 'pasadena', position: [34.1456, -118.1489], type: HUB_TYPES.STREET, ek3Modules: 24, maxPower: 79, podCapacity: 2, swarmCapacity: 12, autoConnector: true, status: 'active' },
  { id: 'hub-pasadena-2', name: 'Caltech Area Hub', zone: 'pasadena', position: [34.1377, -118.1253], type: HUB_TYPES.STREET, ek3Modules: 18, maxPower: 59, podCapacity: 1, swarmCapacity: 10, autoConnector: true, status: 'active' },
  { id: 'hub-hollywood-street', name: 'Sunset Blvd Hub', zone: 'hollywood', position: [34.0977, -118.3287], type: HUB_TYPES.STREET, ek3Modules: 15, maxPower: 50, podCapacity: 2, swarmCapacity: 6, autoConnector: true, status: 'active' }
];

const LA_DRONE_CORRIDORS = [
  { id: 'corridor-dtla-1', name: 'DTLA Tower Circuit', zone: 'dtla', waypoints: [[34.0452, -118.2551], [34.0487, -118.2529], [34.0520, -118.2490], [34.0494, -118.2407], [34.0355, -118.2328]], altitude: 100, color: '#00f0ff' },
  { id: 'corridor-hollywood-1', name: 'Hollywood Hills Run', zone: 'hollywood', waypoints: [[34.1382, -118.3267], [34.1280, -118.3350], [34.1127, -118.3472], [34.0977, -118.3287]], altitude: 150, color: '#9d4edd' }
];

const LA_POD_ROUTES = [
  { id: 'pod-route-sm-1', name: 'Santa Monica Main', zone: 'santaMonica', waypoints: [[34.0159, -118.4960], [34.0172, -118.4923], [34.0195, -118.4890], [34.0230, -118.4855], [34.0167, -118.5011], [34.0103, -118.4973]], color: '#39ff14' },
  { id: 'pod-route-pasadena-1', name: 'Pasadena Loop', zone: 'pasadena', waypoints: [[34.1456, -118.1489], [34.1466, -118.1396], [34.1425, -118.1340], [34.1377, -118.1253], [34.1420, -118.1350], [34.1456, -118.1489]], color: '#ff006e' }
];

const LA_SWARM_ZONES = [
  { id: 'swarm-zone-pasadena', name: 'Pasadena Residential', zone: 'pasadena', center: [34.1450, -118.1400], radius: 0.015, density: 8, baseHub: 'hub-pasadena-1' },
  { id: 'swarm-zone-sm', name: 'Santa Monica Beach', zone: 'santaMonica', center: [34.0180, -118.4950], radius: 0.012, density: 6, baseHub: 'hub-sm-street-1' },
  { id: 'swarm-zone-dtla', name: 'DTLA Ground', zone: 'dtla', center: [34.0480, -118.2500], radius: 0.010, density: 8, baseHub: 'hub-dtla-street-1' }
];

// ============================================================================
// CITY: NEW YORK CITY
// ============================================================================

const NYC_ZONES = {
  MANHATTAN: {
    id: 'manhattan', name: 'Manhattan', shortName: 'MAN', type: 'ultra_dense',
    center: [40.7580, -73.9855], bounds: [[40.70, -74.02], [40.82, -73.93]],
    primaryVehicle: VEHICLE_TYPES.DRONE, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#00f0ff', deliveryDensity: 'extreme',
    description: 'Skyscraper drone network with street-level swarm'
  },
  BROOKLYN: {
    id: 'brooklyn', name: 'Brooklyn Heights', shortName: 'BK', type: 'dense_urban',
    center: [40.6945, -73.9905], bounds: [[40.68, -74.01], [40.71, -73.97]],
    primaryVehicle: VEHICLE_TYPES.POD, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#39ff14', deliveryDensity: 'high',
    description: 'Brownstone neighborhoods with pod delivery'
  },
  WILLIAMSBURG: {
    id: 'williamsburg', name: 'Williamsburg', shortName: 'WB', type: 'mixed',
    center: [40.7081, -73.9571], bounds: [[40.70, -73.97], [40.72, -73.94]],
    primaryVehicle: VEHICLE_TYPES.SWARM_BOT, secondaryVehicle: VEHICLE_TYPES.DRONE,
    color: '#ff006e', deliveryDensity: 'high',
    description: 'Hip urban with swarm-first delivery'
  },
  QUEENS: {
    id: 'queens', name: 'Long Island City', shortName: 'LIC', type: 'industrial',
    center: [40.7447, -73.9485], bounds: [[40.73, -73.97], [40.76, -73.93]],
    primaryVehicle: VEHICLE_TYPES.POD, secondaryVehicle: VEHICLE_TYPES.DRONE,
    color: '#9d4edd', deliveryDensity: 'medium',
    description: 'Industrial hub with warehouse access'
  }
};

const NYC_ROOFTOP_HUBS = [
  { id: 'hub-nyc-empire', name: 'Empire State Hub', zone: 'manhattan', position: [40.7484, -73.9857], type: HUB_TYPES.ROOFTOP, ek3Modules: 12, maxPower: 40, droneCapacity: 8, swapEnabled: true, robotArm: true, altitude: 380, status: 'active' },
  { id: 'hub-nyc-hudson', name: 'Hudson Yards Tower', zone: 'manhattan', position: [40.7536, -74.0004], type: HUB_TYPES.ROOFTOP, ek3Modules: 10, maxPower: 33, droneCapacity: 6, swapEnabled: true, robotArm: true, altitude: 300, status: 'active' },
  { id: 'hub-nyc-wtc', name: 'WTC Observatory', zone: 'manhattan', position: [40.7127, -74.0134], type: HUB_TYPES.ROOFTOP, ek3Modules: 12, maxPower: 40, droneCapacity: 8, swapEnabled: true, robotArm: true, altitude: 400, status: 'active' },
  { id: 'hub-nyc-brooklyn', name: 'Brooklyn Tower Hub', zone: 'brooklyn', position: [40.6943, -73.9888], type: HUB_TYPES.ROOFTOP, ek3Modules: 6, maxPower: 20, droneCapacity: 4, swapEnabled: true, robotArm: true, altitude: 120, status: 'active' }
];

const NYC_STREET_HUBS = [
  { id: 'hub-nyc-times', name: 'Times Square Micro-Hub', zone: 'manhattan', position: [40.7580, -73.9855], type: HUB_TYPES.STREET, ek3Modules: 30, maxPower: 99, podCapacity: 3, swarmCapacity: 12, autoConnector: true, status: 'active' },
  { id: 'hub-nyc-chelsea', name: 'Chelsea Market Hub', zone: 'manhattan', position: [40.7424, -74.0061], type: HUB_TYPES.STREET, ek3Modules: 20, maxPower: 66, podCapacity: 2, swarmCapacity: 10, autoConnector: true, status: 'active' },
  { id: 'hub-nyc-dumbo', name: 'DUMBO Hub', zone: 'brooklyn', position: [40.7033, -73.9880], type: HUB_TYPES.STREET, ek3Modules: 18, maxPower: 59, podCapacity: 2, swarmCapacity: 8, autoConnector: true, status: 'active' },
  { id: 'hub-nyc-wb', name: 'Bedford Ave Hub', zone: 'williamsburg', position: [40.7142, -73.9614], type: HUB_TYPES.STREET, ek3Modules: 15, maxPower: 50, podCapacity: 1, swarmCapacity: 10, autoConnector: true, status: 'active' },
  { id: 'hub-nyc-lic', name: 'LIC Waterfront Hub', zone: 'queens', position: [40.7447, -73.9565], type: HUB_TYPES.STREET, ek3Modules: 24, maxPower: 79, podCapacity: 3, swarmCapacity: 8, autoConnector: true, status: 'active' }
];

const NYC_DRONE_CORRIDORS = [
  { id: 'corridor-nyc-midtown', name: 'Midtown Express', zone: 'manhattan', waypoints: [[40.7484, -73.9857], [40.7530, -73.9820], [40.7580, -73.9855], [40.7536, -74.0004]], altitude: 200, color: '#00f0ff' },
  { id: 'corridor-nyc-fidi', name: 'Financial District Run', zone: 'manhattan', waypoints: [[40.7127, -74.0134], [40.7100, -74.0050], [40.7050, -74.0090], [40.7033, -73.9880]], altitude: 180, color: '#9d4edd' }
];

const NYC_POD_ROUTES = [
  { id: 'pod-route-nyc-bk', name: 'Brooklyn Loop', zone: 'brooklyn', waypoints: [[40.7033, -73.9880], [40.6980, -73.9850], [40.6943, -73.9888], [40.6970, -73.9920], [40.7033, -73.9880]], color: '#39ff14' },
  { id: 'pod-route-nyc-lic', name: 'LIC Industrial', zone: 'queens', waypoints: [[40.7447, -73.9565], [40.7400, -73.9500], [40.7480, -73.9450], [40.7520, -73.9520], [40.7447, -73.9565]], color: '#ff006e' }
];

const NYC_SWARM_ZONES = [
  { id: 'swarm-zone-nyc-midtown', name: 'Midtown Ground', zone: 'manhattan', center: [40.7550, -73.9850], radius: 0.008, density: 12, baseHub: 'hub-nyc-times' },
  { id: 'swarm-zone-nyc-wb', name: 'Williamsburg Mesh', zone: 'williamsburg', center: [40.7100, -73.9580], radius: 0.010, density: 10, baseHub: 'hub-nyc-wb' },
  { id: 'swarm-zone-nyc-dumbo', name: 'DUMBO Swarm', zone: 'brooklyn', center: [40.7020, -73.9870], radius: 0.008, density: 8, baseHub: 'hub-nyc-dumbo' }
];

// ============================================================================
// CITY: SEATTLE
// ============================================================================

const SEATTLE_ZONES = {
  DOWNTOWN: {
    id: 'downtown', name: 'Downtown Seattle', shortName: 'DT', type: 'dense_urban',
    center: [47.6062, -122.3321], bounds: [[47.59, -122.36], [47.62, -122.30]],
    primaryVehicle: VEHICLE_TYPES.DRONE, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#00f0ff', deliveryDensity: 'high',
    description: 'Tech hub with drone-first delivery'
  },
  CAPITOL_HILL: {
    id: 'capitolHill', name: 'Capitol Hill', shortName: 'CH', type: 'residential',
    center: [47.6253, -122.3222], bounds: [[47.61, -122.34], [47.64, -122.30]],
    primaryVehicle: VEHICLE_TYPES.SWARM_BOT, secondaryVehicle: VEHICLE_TYPES.POD,
    color: '#ff006e', deliveryDensity: 'medium',
    description: 'Dense residential with sidewalk robots'
  },
  SOUTH_LAKE: {
    id: 'southLake', name: 'South Lake Union', shortName: 'SLU', type: 'tech_campus',
    center: [47.6227, -122.3368], bounds: [[47.61, -122.35], [47.64, -122.32]],
    primaryVehicle: VEHICLE_TYPES.POD, secondaryVehicle: VEHICLE_TYPES.DRONE,
    color: '#39ff14', deliveryDensity: 'high',
    description: 'Amazon HQ area with pod fleet'
  },
  BALLARD: {
    id: 'ballard', name: 'Ballard', shortName: 'BAL', type: 'mixed',
    center: [47.6677, -122.3840], bounds: [[47.65, -122.40], [47.69, -122.36]],
    primaryVehicle: VEHICLE_TYPES.POD, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#9d4edd', deliveryDensity: 'medium',
    description: 'Waterfront neighborhood delivery'
  }
};

const SEATTLE_ROOFTOP_HUBS = [
  { id: 'hub-sea-needle', name: 'Space Needle Hub', zone: 'downtown', position: [47.6205, -122.3493], type: HUB_TYPES.ROOFTOP, ek3Modules: 8, maxPower: 26, droneCapacity: 6, swapEnabled: true, robotArm: true, altitude: 180, status: 'active' },
  { id: 'hub-sea-columbia', name: 'Columbia Center', zone: 'downtown', position: [47.6047, -122.3305], type: HUB_TYPES.ROOFTOP, ek3Modules: 10, maxPower: 33, droneCapacity: 8, swapEnabled: true, robotArm: true, altitude: 280, status: 'active' },
  { id: 'hub-sea-amazon', name: 'Amazon Spheres Hub', zone: 'southLake', position: [47.6157, -122.3390], type: HUB_TYPES.ROOFTOP, ek3Modules: 12, maxPower: 40, droneCapacity: 8, swapEnabled: true, robotArm: true, altitude: 100, status: 'active' }
];

const SEATTLE_STREET_HUBS = [
  { id: 'hub-sea-pike', name: 'Pike Place Hub', zone: 'downtown', position: [47.6097, -122.3425], type: HUB_TYPES.STREET, ek3Modules: 20, maxPower: 66, podCapacity: 2, swarmCapacity: 10, autoConnector: true, status: 'active' },
  { id: 'hub-sea-slu', name: 'SLU Central Hub', zone: 'southLake', position: [47.6227, -122.3368], type: HUB_TYPES.STREET, ek3Modules: 24, maxPower: 79, podCapacity: 3, swarmCapacity: 12, autoConnector: true, status: 'active' },
  { id: 'hub-sea-cap', name: 'Broadway Hub', zone: 'capitolHill', position: [47.6253, -122.3200], type: HUB_TYPES.STREET, ek3Modules: 15, maxPower: 50, podCapacity: 1, swarmCapacity: 10, autoConnector: true, status: 'active' },
  { id: 'hub-sea-ballard', name: 'Ballard Ave Hub', zone: 'ballard', position: [47.6635, -122.3765], type: HUB_TYPES.STREET, ek3Modules: 18, maxPower: 59, podCapacity: 2, swarmCapacity: 8, autoConnector: true, status: 'active' }
];

const SEATTLE_DRONE_CORRIDORS = [
  { id: 'corridor-sea-dt', name: 'Downtown Express', zone: 'downtown', waypoints: [[47.6047, -122.3305], [47.6097, -122.3425], [47.6157, -122.3390], [47.6205, -122.3493]], altitude: 120, color: '#00f0ff' }
];

const SEATTLE_POD_ROUTES = [
  { id: 'pod-route-sea-slu', name: 'SLU Loop', zone: 'southLake', waypoints: [[47.6227, -122.3368], [47.6200, -122.3400], [47.6180, -122.3350], [47.6227, -122.3368]], color: '#39ff14' },
  { id: 'pod-route-sea-ballard', name: 'Ballard Circuit', zone: 'ballard', waypoints: [[47.6635, -122.3765], [47.6670, -122.3800], [47.6650, -122.3850], [47.6635, -122.3765]], color: '#9d4edd' }
];

const SEATTLE_SWARM_ZONES = [
  { id: 'swarm-zone-sea-cap', name: 'Capitol Hill', zone: 'capitolHill', center: [47.6253, -122.3222], radius: 0.012, density: 10, baseHub: 'hub-sea-cap' },
  { id: 'swarm-zone-sea-pike', name: 'Pike Market Area', zone: 'downtown', center: [47.6097, -122.3425], radius: 0.008, density: 8, baseHub: 'hub-sea-pike' }
];

// ============================================================================
// CITY: SAN FRANCISCO
// ============================================================================

const SF_ZONES = {
  SOMA: {
    id: 'soma', name: 'SoMa', shortName: 'SOMA', type: 'tech_hub',
    center: [37.7785, -122.3950], bounds: [[37.77, -122.42], [37.79, -122.37]],
    primaryVehicle: VEHICLE_TYPES.DRONE, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#00f0ff', deliveryDensity: 'high',
    description: 'Tech startup central with drone fleet'
  },
  MISSION: {
    id: 'mission', name: 'Mission District', shortName: 'MIS', type: 'mixed',
    center: [37.7599, -122.4148], bounds: [[37.74, -122.43], [37.77, -122.40]],
    primaryVehicle: VEHICLE_TYPES.SWARM_BOT, secondaryVehicle: VEHICLE_TYPES.POD,
    color: '#ff006e', deliveryDensity: 'high',
    description: 'Vibrant neighborhood swarm delivery'
  },
  MARINA: {
    id: 'marina', name: 'Marina District', shortName: 'MAR', type: 'residential',
    center: [37.8020, -122.4365], bounds: [[37.79, -122.45], [37.81, -122.42]],
    primaryVehicle: VEHICLE_TYPES.POD, secondaryVehicle: VEHICLE_TYPES.DRONE,
    color: '#39ff14', deliveryDensity: 'medium',
    description: 'Waterfront area with pod access'
  },
  FINANCIAL: {
    id: 'financial', name: 'Financial District', shortName: 'FiDi', type: 'dense_urban',
    center: [37.7946, -122.3999], bounds: [[37.78, -122.41], [37.80, -122.39]],
    primaryVehicle: VEHICLE_TYPES.DRONE, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#9d4edd', deliveryDensity: 'extreme',
    description: 'High-rise corporate delivery'
  }
};

const SF_ROOFTOP_HUBS = [
  { id: 'hub-sf-salesforce', name: 'Salesforce Tower', zone: 'soma', position: [37.7898, -122.3969], type: HUB_TYPES.ROOFTOP, ek3Modules: 12, maxPower: 40, droneCapacity: 8, swapEnabled: true, robotArm: true, altitude: 320, status: 'active' },
  { id: 'hub-sf-transamerica', name: 'Transamerica Pyramid', zone: 'financial', position: [37.7952, -122.4028], type: HUB_TYPES.ROOFTOP, ek3Modules: 8, maxPower: 26, droneCapacity: 6, swapEnabled: true, robotArm: true, altitude: 260, status: 'active' },
  { id: 'hub-sf-coit', name: 'Coit Tower Hub', zone: 'financial', position: [37.8024, -122.4058], type: HUB_TYPES.ROOFTOP, ek3Modules: 6, maxPower: 20, droneCapacity: 4, swapEnabled: true, robotArm: true, altitude: 85, status: 'active' }
];

const SF_STREET_HUBS = [
  { id: 'hub-sf-embarcadero', name: 'Embarcadero Hub', zone: 'soma', position: [37.7926, -122.3911], type: HUB_TYPES.STREET, ek3Modules: 24, maxPower: 79, podCapacity: 3, swarmCapacity: 10, autoConnector: true, status: 'active' },
  { id: 'hub-sf-mission', name: 'Valencia St Hub', zone: 'mission', position: [37.7599, -122.4210], type: HUB_TYPES.STREET, ek3Modules: 18, maxPower: 59, podCapacity: 2, swarmCapacity: 12, autoConnector: true, status: 'active' },
  { id: 'hub-sf-marina', name: 'Chestnut St Hub', zone: 'marina', position: [37.8003, -122.4358], type: HUB_TYPES.STREET, ek3Modules: 15, maxPower: 50, podCapacity: 2, swarmCapacity: 6, autoConnector: true, status: 'active' },
  { id: 'hub-sf-market', name: 'Market Street Hub', zone: 'soma', position: [37.7852, -122.4057], type: HUB_TYPES.STREET, ek3Modules: 20, maxPower: 66, podCapacity: 2, swarmCapacity: 10, autoConnector: true, status: 'active' }
];

const SF_DRONE_CORRIDORS = [
  { id: 'corridor-sf-fidi', name: 'FiDi Express', zone: 'financial', waypoints: [[37.7898, -122.3969], [37.7946, -122.3999], [37.7952, -122.4028], [37.8024, -122.4058]], altitude: 150, color: '#00f0ff' }
];

const SF_POD_ROUTES = [
  { id: 'pod-route-sf-marina', name: 'Marina Loop', zone: 'marina', waypoints: [[37.8003, -122.4358], [37.8020, -122.4400], [37.8050, -122.4365], [37.8003, -122.4358]], color: '#39ff14' },
  { id: 'pod-route-sf-mission', name: 'Mission Circuit', zone: 'mission', waypoints: [[37.7599, -122.4210], [37.7550, -122.4180], [37.7580, -122.4100], [37.7599, -122.4210]], color: '#ff006e' }
];

const SF_SWARM_ZONES = [
  { id: 'swarm-zone-sf-soma', name: 'SoMa Ground', zone: 'soma', center: [37.7820, -122.4000], radius: 0.010, density: 10, baseHub: 'hub-sf-market' },
  { id: 'swarm-zone-sf-mission', name: 'Mission Mesh', zone: 'mission', center: [37.7580, -122.4160], radius: 0.012, density: 12, baseHub: 'hub-sf-mission' }
];

// ============================================================================
// CITY: PALO ALTO (Silicon Valley)
// ============================================================================

const PALOALTO_ZONES = {
  DOWNTOWN: {
    id: 'downtown', name: 'Downtown Palo Alto', shortName: 'DT', type: 'tech_commercial',
    center: [37.4419, -122.1430], bounds: [[37.43, -122.16], [37.45, -122.12]],
    primaryVehicle: VEHICLE_TYPES.POD, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#00f0ff', deliveryDensity: 'medium',
    description: 'University Avenue commercial district'
  },
  STANFORD: {
    id: 'stanford', name: 'Stanford Campus', shortName: 'SU', type: 'campus',
    center: [37.4275, -122.1697], bounds: [[37.41, -122.19], [37.44, -122.15]],
    primaryVehicle: VEHICLE_TYPES.DRONE, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#9d4edd', deliveryDensity: 'medium',
    description: 'Campus drone delivery network'
  },
  RESEARCH_PARK: {
    id: 'researchPark', name: 'Stanford Research Park', shortName: 'SRP', type: 'tech_campus',
    center: [37.4100, -122.1450], bounds: [[37.40, -122.16], [37.42, -122.13]],
    primaryVehicle: VEHICLE_TYPES.POD, secondaryVehicle: VEHICLE_TYPES.DRONE,
    color: '#39ff14', deliveryDensity: 'high',
    description: 'Corporate campus pod fleet'
  },
  RESIDENTIAL: {
    id: 'residential', name: 'Old Palo Alto', shortName: 'OPA', type: 'residential',
    center: [37.4350, -122.1550], bounds: [[37.42, -122.17], [37.45, -122.14]],
    primaryVehicle: VEHICLE_TYPES.SWARM_BOT, secondaryVehicle: VEHICLE_TYPES.POD,
    color: '#ff006e', deliveryDensity: 'low',
    description: 'Quiet residential with swarm bots'
  }
};

const PALOALTO_ROOFTOP_HUBS = [
  { id: 'hub-pa-hoover', name: 'Hoover Tower Hub', zone: 'stanford', position: [37.4275, -122.1666], type: HUB_TYPES.ROOFTOP, ek3Modules: 8, maxPower: 26, droneCapacity: 6, swapEnabled: true, robotArm: true, altitude: 85, status: 'active' },
  { id: 'hub-pa-downtown', name: 'University Ave Tower', zone: 'downtown', position: [37.4440, -122.1630], type: HUB_TYPES.ROOFTOP, ek3Modules: 6, maxPower: 20, droneCapacity: 4, swapEnabled: true, robotArm: true, altitude: 50, status: 'active' }
];

const PALOALTO_STREET_HUBS = [
  { id: 'hub-pa-univ', name: 'University Ave Hub', zone: 'downtown', position: [37.4445, -122.1610], type: HUB_TYPES.STREET, ek3Modules: 18, maxPower: 59, podCapacity: 2, swarmCapacity: 8, autoConnector: true, status: 'active' },
  { id: 'hub-pa-caltrain', name: 'Caltrain Station Hub', zone: 'downtown', position: [37.4430, -122.1648], type: HUB_TYPES.STREET, ek3Modules: 24, maxPower: 79, podCapacity: 3, swarmCapacity: 10, autoConnector: true, status: 'active' },
  { id: 'hub-pa-srp', name: 'Research Park Hub', zone: 'researchPark', position: [37.4100, -122.1480], type: HUB_TYPES.STREET, ek3Modules: 20, maxPower: 66, podCapacity: 2, swarmCapacity: 8, autoConnector: true, status: 'active' },
  { id: 'hub-pa-stanford', name: 'Stanford Shopping Hub', zone: 'stanford', position: [37.4430, -122.1720], type: HUB_TYPES.STREET, ek3Modules: 15, maxPower: 50, podCapacity: 2, swarmCapacity: 6, autoConnector: true, status: 'active' }
];

const PALOALTO_DRONE_CORRIDORS = [
  { id: 'corridor-pa-campus', name: 'Stanford Campus Run', zone: 'stanford', waypoints: [[37.4275, -122.1666], [37.4300, -122.1700], [37.4350, -122.1720], [37.4430, -122.1720]], altitude: 80, color: '#9d4edd' }
];

const PALOALTO_POD_ROUTES = [
  { id: 'pod-route-pa-univ', name: 'University Ave Loop', zone: 'downtown', waypoints: [[37.4445, -122.1610], [37.4430, -122.1550], [37.4419, -122.1500], [37.4445, -122.1610]], color: '#00f0ff' },
  { id: 'pod-route-pa-srp', name: 'Research Park Circuit', zone: 'researchPark', waypoints: [[37.4100, -122.1480], [37.4080, -122.1520], [37.4050, -122.1450], [37.4100, -122.1480]], color: '#39ff14' }
];

const PALOALTO_SWARM_ZONES = [
  { id: 'swarm-zone-pa-dt', name: 'Downtown Mesh', zone: 'downtown', center: [37.4430, -122.1600], radius: 0.010, density: 8, baseHub: 'hub-pa-univ' },
  { id: 'swarm-zone-pa-res', name: 'Old Palo Alto', zone: 'residential', center: [37.4350, -122.1550], radius: 0.015, density: 6, baseHub: 'hub-pa-univ' }
];

// ============================================================================
// CITY: PORTLAND, OREGON
// ============================================================================

const PORTLAND_ZONES = {
  PEARL: {
    id: 'pearl', name: 'Pearl District', shortName: 'PRL', type: 'trendy_urban',
    center: [45.5286, -122.6816], bounds: [[45.52, -122.70], [45.54, -122.67]],
    primaryVehicle: VEHICLE_TYPES.SWARM_BOT, secondaryVehicle: VEHICLE_TYPES.POD,
    color: '#ff006e', deliveryDensity: 'high',
    description: 'Artsy district with swarm delivery'
  },
  DOWNTOWN: {
    id: 'downtown', name: 'Downtown Portland', shortName: 'DT', type: 'commercial',
    center: [45.5155, -122.6793], bounds: [[45.50, -122.70], [45.53, -122.66]],
    primaryVehicle: VEHICLE_TYPES.DRONE, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#00f0ff', deliveryDensity: 'high',
    description: 'Commercial core drone network'
  },
  HAWTHORNE: {
    id: 'hawthorne', name: 'Hawthorne', shortName: 'HAW', type: 'mixed',
    center: [45.5118, -122.6326], bounds: [[45.50, -122.65], [45.52, -122.61]],
    primaryVehicle: VEHICLE_TYPES.POD, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#39ff14', deliveryDensity: 'medium',
    description: 'Eclectic neighborhood pod service'
  },
  ALBERTA: {
    id: 'alberta', name: 'Alberta Arts', shortName: 'ALB', type: 'residential',
    center: [45.5590, -122.6472], bounds: [[45.55, -122.67], [45.57, -122.63]],
    primaryVehicle: VEHICLE_TYPES.SWARM_BOT, secondaryVehicle: VEHICLE_TYPES.DRONE,
    color: '#9d4edd', deliveryDensity: 'medium',
    description: 'Arts district ground delivery'
  }
};

const PORTLAND_ROOFTOP_HUBS = [
  { id: 'hub-pdx-usbank', name: 'US Bancorp Tower', zone: 'downtown', position: [45.5155, -122.6793], type: HUB_TYPES.ROOFTOP, ek3Modules: 8, maxPower: 26, droneCapacity: 6, swapEnabled: true, robotArm: true, altitude: 163, status: 'active' },
  { id: 'hub-pdx-wells', name: 'Wells Fargo Center', zone: 'downtown', position: [45.5185, -122.6780], type: HUB_TYPES.ROOFTOP, ek3Modules: 6, maxPower: 20, droneCapacity: 4, swapEnabled: true, robotArm: true, altitude: 166, status: 'active' }
];

const PORTLAND_STREET_HUBS = [
  { id: 'hub-pdx-pearl', name: 'Powell\'s Books Hub', zone: 'pearl', position: [45.5231, -122.6812], type: HUB_TYPES.STREET, ek3Modules: 18, maxPower: 59, podCapacity: 2, swarmCapacity: 10, autoConnector: true, status: 'active' },
  { id: 'hub-pdx-pioneer', name: 'Pioneer Square Hub', zone: 'downtown', position: [45.5189, -122.6795], type: HUB_TYPES.STREET, ek3Modules: 20, maxPower: 66, podCapacity: 2, swarmCapacity: 8, autoConnector: true, status: 'active' },
  { id: 'hub-pdx-hawthorne', name: 'Hawthorne Blvd Hub', zone: 'hawthorne', position: [45.5118, -122.6400], type: HUB_TYPES.STREET, ek3Modules: 15, maxPower: 50, podCapacity: 2, swarmCapacity: 8, autoConnector: true, status: 'active' },
  { id: 'hub-pdx-alberta', name: 'Alberta St Hub', zone: 'alberta', position: [45.5590, -122.6500], type: HUB_TYPES.STREET, ek3Modules: 12, maxPower: 40, podCapacity: 1, swarmCapacity: 8, autoConnector: true, status: 'active' }
];

const PORTLAND_DRONE_CORRIDORS = [
  { id: 'corridor-pdx-dt', name: 'Downtown Circuit', zone: 'downtown', waypoints: [[45.5155, -122.6793], [45.5189, -122.6795], [45.5231, -122.6812], [45.5185, -122.6780]], altitude: 100, color: '#00f0ff' }
];

const PORTLAND_POD_ROUTES = [
  { id: 'pod-route-pdx-hawthorne', name: 'Hawthorne Loop', zone: 'hawthorne', waypoints: [[45.5118, -122.6400], [45.5100, -122.6350], [45.5130, -122.6250], [45.5118, -122.6400]], color: '#39ff14' }
];

const PORTLAND_SWARM_ZONES = [
  { id: 'swarm-zone-pdx-pearl', name: 'Pearl Mesh', zone: 'pearl', center: [45.5270, -122.6800], radius: 0.012, density: 10, baseHub: 'hub-pdx-pearl' },
  { id: 'swarm-zone-pdx-alberta', name: 'Alberta Arts', zone: 'alberta', center: [45.5590, -122.6472], radius: 0.015, density: 8, baseHub: 'hub-pdx-alberta' }
];

// ============================================================================
// CITY: BOSTON
// ============================================================================

const BOSTON_ZONES = {
  BACK_BAY: {
    id: 'backBay', name: 'Back Bay', shortName: 'BB', type: 'upscale',
    center: [42.3503, -71.0810], bounds: [[42.34, -71.10], [42.36, -71.06]],
    primaryVehicle: VEHICLE_TYPES.POD, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#39ff14', deliveryDensity: 'high',
    description: 'Historic brownstones with pod service'
  },
  DOWNTOWN: {
    id: 'downtown', name: 'Downtown Crossing', shortName: 'DT', type: 'commercial',
    center: [42.3555, -71.0597], bounds: [[42.35, -71.07], [42.36, -71.05]],
    primaryVehicle: VEHICLE_TYPES.DRONE, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#00f0ff', deliveryDensity: 'extreme',
    description: 'Dense commercial drone network'
  },
  CAMBRIDGE: {
    id: 'cambridge', name: 'Cambridge/MIT', shortName: 'CAM', type: 'campus',
    center: [42.3601, -71.0942], bounds: [[42.35, -71.11], [42.37, -71.08]],
    primaryVehicle: VEHICLE_TYPES.DRONE, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#9d4edd', deliveryDensity: 'high',
    description: 'MIT/Harvard drone delivery corridor'
  },
  SEAPORT: {
    id: 'seaport', name: 'Seaport', shortName: 'SP', type: 'innovation',
    center: [42.3489, -71.0424], bounds: [[42.34, -71.06], [42.36, -71.02]],
    primaryVehicle: VEHICLE_TYPES.SWARM_BOT, secondaryVehicle: VEHICLE_TYPES.POD,
    color: '#ff006e', deliveryDensity: 'high',
    description: 'Innovation district swarm fleet'
  }
};

const BOSTON_ROOFTOP_HUBS = [
  { id: 'hub-bos-prudential', name: 'Prudential Tower', zone: 'backBay', position: [42.3471, -71.0821], type: HUB_TYPES.ROOFTOP, ek3Modules: 10, maxPower: 33, droneCapacity: 6, swapEnabled: true, robotArm: true, altitude: 228, status: 'active' },
  { id: 'hub-bos-hancock', name: 'Hancock Tower', zone: 'backBay', position: [42.3489, -71.0754], type: HUB_TYPES.ROOFTOP, ek3Modules: 8, maxPower: 26, droneCapacity: 6, swapEnabled: true, robotArm: true, altitude: 240, status: 'active' },
  { id: 'hub-bos-mit', name: 'MIT Great Dome', zone: 'cambridge', position: [42.3594, -71.0921], type: HUB_TYPES.ROOFTOP, ek3Modules: 8, maxPower: 26, droneCapacity: 6, swapEnabled: true, robotArm: true, altitude: 45, status: 'active' }
];

const BOSTON_STREET_HUBS = [
  { id: 'hub-bos-newbury', name: 'Newbury Street Hub', zone: 'backBay', position: [42.3518, -71.0779], type: HUB_TYPES.STREET, ek3Modules: 18, maxPower: 59, podCapacity: 2, swarmCapacity: 8, autoConnector: true, status: 'active' },
  { id: 'hub-bos-faneuil', name: 'Faneuil Hall Hub', zone: 'downtown', position: [42.3601, -71.0545], type: HUB_TYPES.STREET, ek3Modules: 20, maxPower: 66, podCapacity: 2, swarmCapacity: 10, autoConnector: true, status: 'active' },
  { id: 'hub-bos-kendall', name: 'Kendall Square Hub', zone: 'cambridge', position: [42.3629, -71.0857], type: HUB_TYPES.STREET, ek3Modules: 24, maxPower: 79, podCapacity: 3, swarmCapacity: 12, autoConnector: true, status: 'active' },
  { id: 'hub-bos-seaport', name: 'Seaport Blvd Hub', zone: 'seaport', position: [42.3489, -71.0450], type: HUB_TYPES.STREET, ek3Modules: 18, maxPower: 59, podCapacity: 2, swarmCapacity: 10, autoConnector: true, status: 'active' }
];

const BOSTON_DRONE_CORRIDORS = [
  { id: 'corridor-bos-charles', name: 'Charles River Run', zone: 'cambridge', waypoints: [[42.3594, -71.0921], [42.3580, -71.0850], [42.3555, -71.0750], [42.3489, -71.0754]], altitude: 100, color: '#9d4edd' }
];

const BOSTON_POD_ROUTES = [
  { id: 'pod-route-bos-backbay', name: 'Back Bay Loop', zone: 'backBay', waypoints: [[42.3518, -71.0779], [42.3500, -71.0800], [42.3471, -71.0821], [42.3518, -71.0779]], color: '#39ff14' }
];

const BOSTON_SWARM_ZONES = [
  { id: 'swarm-zone-bos-seaport', name: 'Seaport Mesh', zone: 'seaport', center: [42.3489, -71.0440], radius: 0.012, density: 10, baseHub: 'hub-bos-seaport' },
  { id: 'swarm-zone-bos-kendall', name: 'Kendall Square', zone: 'cambridge', center: [42.3629, -71.0857], radius: 0.010, density: 12, baseHub: 'hub-bos-kendall' }
];

// ============================================================================
// CITY: NEW JERSEY (Newark/Jersey City)
// ============================================================================

const NJ_ZONES = {
  JERSEY_CITY: {
    id: 'jerseyCity', name: 'Jersey City', shortName: 'JC', type: 'waterfront',
    center: [40.7178, -74.0431], bounds: [[40.70, -74.07], [40.74, -74.02]],
    primaryVehicle: VEHICLE_TYPES.DRONE, secondaryVehicle: VEHICLE_TYPES.POD,
    color: '#00f0ff', deliveryDensity: 'high',
    description: 'NYC-adjacent drone corridor'
  },
  HOBOKEN: {
    id: 'hoboken', name: 'Hoboken', shortName: 'HOB', type: 'dense_residential',
    center: [40.7439, -74.0323], bounds: [[40.73, -74.05], [40.76, -74.02]],
    primaryVehicle: VEHICLE_TYPES.SWARM_BOT, secondaryVehicle: VEHICLE_TYPES.POD,
    color: '#ff006e', deliveryDensity: 'high',
    description: 'Mile-square city swarm delivery'
  },
  NEWARK: {
    id: 'newark', name: 'Newark Downtown', shortName: 'NWK', type: 'commercial',
    center: [40.7357, -74.1724], bounds: [[40.72, -74.19], [40.75, -74.15]],
    primaryVehicle: VEHICLE_TYPES.POD, secondaryVehicle: VEHICLE_TYPES.DRONE,
    color: '#39ff14', deliveryDensity: 'medium',
    description: 'Business district pod fleet'
  },
  EXCHANGE: {
    id: 'exchange', name: 'Exchange Place', shortName: 'EXC', type: 'financial',
    center: [40.7163, -74.0327], bounds: [[40.71, -74.04], [40.72, -74.02]],
    primaryVehicle: VEHICLE_TYPES.DRONE, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#9d4edd', deliveryDensity: 'high',
    description: 'Financial district high-rise delivery'
  }
};

const NJ_ROOFTOP_HUBS = [
  { id: 'hub-nj-goldman', name: 'Goldman Tower Hub', zone: 'exchange', position: [40.7163, -74.0350], type: HUB_TYPES.ROOFTOP, ek3Modules: 10, maxPower: 33, droneCapacity: 6, swapEnabled: true, robotArm: true, altitude: 238, status: 'active' },
  { id: 'hub-nj-30hudson', name: '30 Hudson St Hub', zone: 'jerseyCity', position: [40.7178, -74.0341], type: HUB_TYPES.ROOFTOP, ek3Modules: 8, maxPower: 26, droneCapacity: 6, swapEnabled: true, robotArm: true, altitude: 238, status: 'active' },
  { id: 'hub-nj-prudential', name: 'Prudential Center Hub', zone: 'newark', position: [40.7339, -74.1712], type: HUB_TYPES.ROOFTOP, ek3Modules: 6, maxPower: 20, droneCapacity: 4, swapEnabled: true, robotArm: true, altitude: 50, status: 'active' }
];

const NJ_STREET_HUBS = [
  { id: 'hub-nj-grove', name: 'Grove Street Hub', zone: 'jerseyCity', position: [40.7195, -74.0431], type: HUB_TYPES.STREET, ek3Modules: 20, maxPower: 66, podCapacity: 2, swarmCapacity: 10, autoConnector: true, status: 'active' },
  { id: 'hub-nj-hoboken', name: 'Washington St Hub', zone: 'hoboken', position: [40.7439, -74.0289], type: HUB_TYPES.STREET, ek3Modules: 15, maxPower: 50, podCapacity: 1, swarmCapacity: 12, autoConnector: true, status: 'active' },
  { id: 'hub-nj-newark', name: 'Broad Street Hub', zone: 'newark', position: [40.7357, -74.1724], type: HUB_TYPES.STREET, ek3Modules: 18, maxPower: 59, podCapacity: 2, swarmCapacity: 8, autoConnector: true, status: 'active' },
  { id: 'hub-nj-path', name: 'PATH Terminal Hub', zone: 'exchange', position: [40.7149, -74.0324], type: HUB_TYPES.STREET, ek3Modules: 24, maxPower: 79, podCapacity: 3, swarmCapacity: 8, autoConnector: true, status: 'active' }
];

const NJ_DRONE_CORRIDORS = [
  { id: 'corridor-nj-waterfront', name: 'Hudson Waterfront', zone: 'jerseyCity', waypoints: [[40.7163, -74.0350], [40.7178, -74.0341], [40.7280, -74.0350], [40.7439, -74.0323]], altitude: 120, color: '#00f0ff' }
];

const NJ_POD_ROUTES = [
  { id: 'pod-route-nj-newark', name: 'Newark Business Loop', zone: 'newark', waypoints: [[40.7357, -74.1724], [40.7380, -74.1680], [40.7400, -74.1750], [40.7357, -74.1724]], color: '#39ff14' }
];

const NJ_SWARM_ZONES = [
  { id: 'swarm-zone-nj-hoboken', name: 'Hoboken Grid', zone: 'hoboken', center: [40.7439, -74.0310], radius: 0.010, density: 12, baseHub: 'hub-nj-hoboken' },
  { id: 'swarm-zone-nj-grove', name: 'Grove St Area', zone: 'jerseyCity', center: [40.7195, -74.0431], radius: 0.012, density: 10, baseHub: 'hub-nj-grove' }
];

// ============================================================================
// CITY: DENVER
// ============================================================================

const DENVER_ZONES = {
  LODO: {
    id: 'lodo', name: 'LoDo', shortName: 'LODO', type: 'entertainment',
    center: [39.7536, -104.9993], bounds: [[39.74, -105.01], [39.77, -104.98]],
    primaryVehicle: VEHICLE_TYPES.DRONE, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#00f0ff', deliveryDensity: 'high',
    description: 'Union Station area drone hub'
  },
  RINO: {
    id: 'rino', name: 'RiNo Arts', shortName: 'RINO', type: 'artsy',
    center: [39.7649, -104.9786], bounds: [[39.75, -105.00], [39.78, -104.96]],
    primaryVehicle: VEHICLE_TYPES.SWARM_BOT, secondaryVehicle: VEHICLE_TYPES.POD,
    color: '#ff006e', deliveryDensity: 'medium',
    description: 'Arts district ground delivery'
  },
  CAPITOL_HILL: {
    id: 'capHill', name: 'Capitol Hill', shortName: 'CH', type: 'residential',
    center: [39.7313, -104.9784], bounds: [[39.72, -105.00], [39.75, -104.96]],
    primaryVehicle: VEHICLE_TYPES.POD, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#39ff14', deliveryDensity: 'medium',
    description: 'Dense residential pod service'
  },
  TECH_CENTER: {
    id: 'techCenter', name: 'Denver Tech Center', shortName: 'DTC', type: 'suburban_office',
    center: [39.6090, -104.8935], bounds: [[39.59, -104.92], [39.63, -104.87]],
    primaryVehicle: VEHICLE_TYPES.POD, secondaryVehicle: VEHICLE_TYPES.DRONE,
    color: '#9d4edd', deliveryDensity: 'high',
    description: 'Suburban tech campus delivery'
  }
};

const DENVER_ROOFTOP_HUBS = [
  { id: 'hub-den-republic', name: 'Republic Plaza', zone: 'lodo', position: [39.7469, -104.9903], type: HUB_TYPES.ROOFTOP, ek3Modules: 10, maxPower: 33, droneCapacity: 6, swapEnabled: true, robotArm: true, altitude: 218, status: 'active' },
  { id: 'hub-den-1670', name: '1670 Broadway', zone: 'lodo', position: [39.7441, -104.9873], type: HUB_TYPES.ROOFTOP, ek3Modules: 8, maxPower: 26, droneCapacity: 6, swapEnabled: true, robotArm: true, altitude: 213, status: 'active' }
];

const DENVER_STREET_HUBS = [
  { id: 'hub-den-union', name: 'Union Station Hub', zone: 'lodo', position: [39.7536, -105.0008], type: HUB_TYPES.STREET, ek3Modules: 24, maxPower: 79, podCapacity: 3, swarmCapacity: 10, autoConnector: true, status: 'active' },
  { id: 'hub-den-rino', name: 'Larimer Square Hub', zone: 'rino', position: [39.7649, -104.9830], type: HUB_TYPES.STREET, ek3Modules: 15, maxPower: 50, podCapacity: 1, swarmCapacity: 10, autoConnector: true, status: 'active' },
  { id: 'hub-den-cap', name: 'Colfax Hub', zone: 'capHill', position: [39.7400, -104.9800], type: HUB_TYPES.STREET, ek3Modules: 18, maxPower: 59, podCapacity: 2, swarmCapacity: 8, autoConnector: true, status: 'active' },
  { id: 'hub-den-dtc', name: 'DTC Central Hub', zone: 'techCenter', position: [39.6090, -104.8935], type: HUB_TYPES.STREET, ek3Modules: 20, maxPower: 66, podCapacity: 2, swarmCapacity: 8, autoConnector: true, status: 'active' }
];

const DENVER_DRONE_CORRIDORS = [
  { id: 'corridor-den-lodo', name: 'LoDo Express', zone: 'lodo', waypoints: [[39.7469, -104.9903], [39.7500, -104.9950], [39.7536, -105.0008], [39.7441, -104.9873]], altitude: 100, color: '#00f0ff' }
];

const DENVER_POD_ROUTES = [
  { id: 'pod-route-den-cap', name: 'Capitol Hill Loop', zone: 'capHill', waypoints: [[39.7400, -104.9800], [39.7350, -104.9850], [39.7313, -104.9784], [39.7400, -104.9800]], color: '#39ff14' }
];

const DENVER_SWARM_ZONES = [
  { id: 'swarm-zone-den-rino', name: 'RiNo Mesh', zone: 'rino', center: [39.7649, -104.9800], radius: 0.015, density: 10, baseHub: 'hub-den-rino' },
  { id: 'swarm-zone-den-lodo', name: 'LoDo Ground', zone: 'lodo', center: [39.7510, -104.9980], radius: 0.010, density: 8, baseHub: 'hub-den-union' }
];

// ============================================================================
// CITY: BOULDER
// ============================================================================

const BOULDER_ZONES = {
  PEARL: {
    id: 'pearl', name: 'Pearl Street', shortName: 'PRL', type: 'pedestrian',
    center: [40.0176, -105.2797], bounds: [[40.01, -105.30], [40.03, -105.26]],
    primaryVehicle: VEHICLE_TYPES.SWARM_BOT, secondaryVehicle: VEHICLE_TYPES.DRONE,
    color: '#ff006e', deliveryDensity: 'high',
    description: 'Pedestrian mall swarm delivery'
  },
  CU_CAMPUS: {
    id: 'cuCampus', name: 'CU Boulder', shortName: 'CU', type: 'campus',
    center: [40.0076, -105.2659], bounds: [[39.99, -105.28], [40.02, -105.25]],
    primaryVehicle: VEHICLE_TYPES.DRONE, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#9d4edd', deliveryDensity: 'high',
    description: 'University campus drone network'
  },
  DOWNTOWN: {
    id: 'downtown', name: 'Downtown Boulder', shortName: 'DT', type: 'commercial',
    center: [40.0150, -105.2705], bounds: [[40.00, -105.29], [40.03, -105.25]],
    primaryVehicle: VEHICLE_TYPES.POD, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#39ff14', deliveryDensity: 'medium',
    description: 'Downtown commercial pod service'
  },
  NORTH: {
    id: 'north', name: 'North Boulder', shortName: 'NB', type: 'residential',
    center: [40.0450, -105.2900], bounds: [[40.03, -105.31], [40.06, -105.27]],
    primaryVehicle: VEHICLE_TYPES.DRONE, secondaryVehicle: VEHICLE_TYPES.POD,
    color: '#00f0ff', deliveryDensity: 'low',
    description: 'Foothills residential drone access'
  }
};

const BOULDER_ROOFTOP_HUBS = [
  { id: 'hub-bou-steeple', name: 'St Julien Hub', zone: 'downtown', position: [40.0170, -105.2800], type: HUB_TYPES.ROOFTOP, ek3Modules: 6, maxPower: 20, droneCapacity: 4, swapEnabled: true, robotArm: true, altitude: 25, status: 'active' },
  { id: 'hub-bou-cu', name: 'Folsom Field Hub', zone: 'cuCampus', position: [40.0076, -105.2655], type: HUB_TYPES.ROOFTOP, ek3Modules: 8, maxPower: 26, droneCapacity: 6, swapEnabled: true, robotArm: true, altitude: 40, status: 'active' }
];

const BOULDER_STREET_HUBS = [
  { id: 'hub-bou-pearl', name: 'Pearl Street Hub', zone: 'pearl', position: [40.0176, -105.2797], type: HUB_TYPES.STREET, ek3Modules: 15, maxPower: 50, podCapacity: 1, swarmCapacity: 12, autoConnector: true, status: 'active' },
  { id: 'hub-bou-29th', name: '29th Street Hub', zone: 'downtown', position: [40.0150, -105.2550], type: HUB_TYPES.STREET, ek3Modules: 18, maxPower: 59, podCapacity: 2, swarmCapacity: 8, autoConnector: true, status: 'active' },
  { id: 'hub-bou-umc', name: 'UMC Hub', zone: 'cuCampus', position: [40.0065, -105.2710], type: HUB_TYPES.STREET, ek3Modules: 20, maxPower: 66, podCapacity: 2, swarmCapacity: 10, autoConnector: true, status: 'active' },
  { id: 'hub-bou-north', name: 'North Boulder Hub', zone: 'north', position: [40.0450, -105.2850], type: HUB_TYPES.STREET, ek3Modules: 12, maxPower: 40, podCapacity: 1, swarmCapacity: 6, autoConnector: true, status: 'active' }
];

const BOULDER_DRONE_CORRIDORS = [
  { id: 'corridor-bou-campus', name: 'Campus Circuit', zone: 'cuCampus', waypoints: [[40.0076, -105.2655], [40.0065, -105.2710], [40.0100, -105.2750], [40.0170, -105.2800]], altitude: 60, color: '#9d4edd' }
];

const BOULDER_POD_ROUTES = [
  { id: 'pod-route-bou-dt', name: 'Downtown Loop', zone: 'downtown', waypoints: [[40.0150, -105.2550], [40.0176, -105.2650], [40.0170, -105.2800], [40.0150, -105.2550]], color: '#39ff14' }
];

const BOULDER_SWARM_ZONES = [
  { id: 'swarm-zone-bou-pearl', name: 'Pearl Street Mall', zone: 'pearl', center: [40.0176, -105.2797], radius: 0.008, density: 12, baseHub: 'hub-bou-pearl' },
  { id: 'swarm-zone-bou-cu', name: 'CU Campus', zone: 'cuCampus', center: [40.0076, -105.2680], radius: 0.012, density: 10, baseHub: 'hub-bou-umc' }
];

// ============================================================================
// CITY: LITTLE ROCK, ARKANSAS
// ============================================================================

const ARKANSAS_ZONES = {
  DOWNTOWN: {
    id: 'downtown', name: 'Downtown Little Rock', shortName: 'DT', type: 'commercial',
    center: [34.7465, -92.2896], bounds: [[34.73, -92.31], [34.76, -92.27]],
    primaryVehicle: VEHICLE_TYPES.DRONE, secondaryVehicle: VEHICLE_TYPES.POD,
    color: '#00f0ff', deliveryDensity: 'medium',
    description: 'Capitol area drone network'
  },
  RIVERMARKET: {
    id: 'rivermarket', name: 'River Market', shortName: 'RM', type: 'entertainment',
    center: [34.7505, -92.2712], bounds: [[34.74, -92.29], [34.76, -92.25]],
    primaryVehicle: VEHICLE_TYPES.SWARM_BOT, secondaryVehicle: VEHICLE_TYPES.POD,
    color: '#ff006e', deliveryDensity: 'high',
    description: 'Waterfront swarm delivery'
  },
  HILLCREST: {
    id: 'hillcrest', name: 'Hillcrest', shortName: 'HC', type: 'residential',
    center: [34.7550, -92.2640], bounds: [[34.74, -92.28], [34.77, -92.25]],
    primaryVehicle: VEHICLE_TYPES.POD, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#39ff14', deliveryDensity: 'medium',
    description: 'Historic neighborhood pod service'
  },
  WEST_LR: {
    id: 'westLr', name: 'West Little Rock', shortName: 'WLR', type: 'suburban',
    center: [34.7460, -92.3600], bounds: [[34.72, -92.40], [34.77, -92.32]],
    primaryVehicle: VEHICLE_TYPES.POD, secondaryVehicle: VEHICLE_TYPES.DRONE,
    color: '#9d4edd', deliveryDensity: 'low',
    description: 'Suburban shopping center delivery'
  }
};

const ARKANSAS_ROOFTOP_HUBS = [
  { id: 'hub-ark-regions', name: 'Regions Tower Hub', zone: 'downtown', position: [34.7465, -92.2896], type: HUB_TYPES.ROOFTOP, ek3Modules: 8, maxPower: 26, droneCapacity: 6, swapEnabled: true, robotArm: true, altitude: 168, status: 'active' },
  { id: 'hub-ark-capitol', name: 'Capitol Building Hub', zone: 'downtown', position: [34.7461, -92.2889], type: HUB_TYPES.ROOFTOP, ek3Modules: 6, maxPower: 20, droneCapacity: 4, swapEnabled: true, robotArm: true, altitude: 70, status: 'active' }
];

const ARKANSAS_STREET_HUBS = [
  { id: 'hub-ark-river', name: 'River Market Hub', zone: 'rivermarket', position: [34.7505, -92.2712], type: HUB_TYPES.STREET, ek3Modules: 15, maxPower: 50, podCapacity: 2, swarmCapacity: 10, autoConnector: true, status: 'active' },
  { id: 'hub-ark-main', name: 'Main Street Hub', zone: 'downtown', position: [34.7480, -92.2850], type: HUB_TYPES.STREET, ek3Modules: 18, maxPower: 59, podCapacity: 2, swarmCapacity: 8, autoConnector: true, status: 'active' },
  { id: 'hub-ark-hillcrest', name: 'Kavanaugh Hub', zone: 'hillcrest', position: [34.7550, -92.2640], type: HUB_TYPES.STREET, ek3Modules: 12, maxPower: 40, podCapacity: 1, swarmCapacity: 8, autoConnector: true, status: 'active' },
  { id: 'hub-ark-west', name: 'Chenal Hub', zone: 'westLr', position: [34.7460, -92.3650], type: HUB_TYPES.STREET, ek3Modules: 15, maxPower: 50, podCapacity: 2, swarmCapacity: 6, autoConnector: true, status: 'active' }
];

const ARKANSAS_DRONE_CORRIDORS = [
  { id: 'corridor-ark-dt', name: 'Downtown Circuit', zone: 'downtown', waypoints: [[34.7465, -92.2896], [34.7505, -92.2800], [34.7505, -92.2712], [34.7461, -92.2889]], altitude: 80, color: '#00f0ff' }
];

const ARKANSAS_POD_ROUTES = [
  { id: 'pod-route-ark-hill', name: 'Hillcrest Loop', zone: 'hillcrest', waypoints: [[34.7550, -92.2640], [34.7520, -92.2700], [34.7500, -92.2650], [34.7550, -92.2640]], color: '#39ff14' }
];

const ARKANSAS_SWARM_ZONES = [
  { id: 'swarm-zone-ark-river', name: 'River Market', zone: 'rivermarket', center: [34.7505, -92.2712], radius: 0.010, density: 10, baseHub: 'hub-ark-river' },
  { id: 'swarm-zone-ark-hill', name: 'Hillcrest Mesh', zone: 'hillcrest', center: [34.7550, -92.2640], radius: 0.012, density: 8, baseHub: 'hub-ark-hillcrest' }
];

// ============================================================================
// CITY: HOUSTON
// ============================================================================

const HOUSTON_ZONES = {
  DOWNTOWN: {
    id: 'downtown', name: 'Downtown Houston', shortName: 'DT', type: 'dense_urban',
    center: [29.7604, -95.3698], bounds: [[29.74, -95.39], [29.78, -95.35]],
    primaryVehicle: VEHICLE_TYPES.DRONE, secondaryVehicle: VEHICLE_TYPES.SWARM_BOT,
    color: '#00f0ff', deliveryDensity: 'high',
    description: 'Skyscraper drone network'
  },
  MEDICAL: {
    id: 'medical', name: 'Texas Medical Center', shortName: 'TMC', type: 'hospital',
    center: [29.7066, -95.3983], bounds: [[29.69, -95.42], [29.72, -95.38]],
    primaryVehicle: VEHICLE_TYPES.DRONE, secondaryVehicle: VEHICLE_TYPES.POD,
    color: '#ff006e', deliveryDensity: 'extreme',
    description: 'Medical supply drone priority'
  },
  MONTROSE: {
    id: 'montrose', name: 'Montrose', shortName: 'MTR', type: 'mixed',
    center: [29.7500, -95.3900], bounds: [[29.73, -95.41], [29.77, -95.37]],
    primaryVehicle: VEHICLE_TYPES.SWARM_BOT, secondaryVehicle: VEHICLE_TYPES.POD,
    color: '#39ff14', deliveryDensity: 'medium',
    description: 'Eclectic neighborhood swarm'
  },
  GALLERIA: {
    id: 'galleria', name: 'Galleria/Uptown', shortName: 'GAL', type: 'commercial',
    center: [29.7399, -95.4600], bounds: [[29.72, -95.48], [29.76, -95.44]],
    primaryVehicle: VEHICLE_TYPES.POD, secondaryVehicle: VEHICLE_TYPES.DRONE,
    color: '#9d4edd', deliveryDensity: 'high',
    description: 'Shopping district pod fleet'
  }
};

const HOUSTON_ROOFTOP_HUBS = [
  { id: 'hub-hou-jpmorgan', name: 'JPMorgan Chase Tower', zone: 'downtown', position: [29.7584, -95.3632], type: HUB_TYPES.ROOFTOP, ek3Modules: 12, maxPower: 40, droneCapacity: 8, swapEnabled: true, robotArm: true, altitude: 305, status: 'active' },
  { id: 'hub-hou-wells', name: 'Wells Fargo Plaza', zone: 'downtown', position: [29.7569, -95.3673], type: HUB_TYPES.ROOFTOP, ek3Modules: 10, maxPower: 33, droneCapacity: 6, swapEnabled: true, robotArm: true, altitude: 302, status: 'active' },
  { id: 'hub-hou-tmc', name: 'TMC Main Hub', zone: 'medical', position: [29.7066, -95.4000], type: HUB_TYPES.ROOFTOP, ek3Modules: 10, maxPower: 33, droneCapacity: 8, swapEnabled: true, robotArm: true, altitude: 120, status: 'active' }
];

const HOUSTON_STREET_HUBS = [
  { id: 'hub-hou-discovery', name: 'Discovery Green Hub', zone: 'downtown', position: [29.7532, -95.3597], type: HUB_TYPES.STREET, ek3Modules: 24, maxPower: 79, podCapacity: 3, swarmCapacity: 10, autoConnector: true, status: 'active' },
  { id: 'hub-hou-tmc-st', name: 'TMC Transit Hub', zone: 'medical', position: [29.7050, -95.3960], type: HUB_TYPES.STREET, ek3Modules: 30, maxPower: 99, podCapacity: 4, swarmCapacity: 8, autoConnector: true, status: 'active' },
  { id: 'hub-hou-montrose', name: 'Montrose Blvd Hub', zone: 'montrose', position: [29.7500, -95.3920], type: HUB_TYPES.STREET, ek3Modules: 15, maxPower: 50, podCapacity: 1, swarmCapacity: 12, autoConnector: true, status: 'active' },
  { id: 'hub-hou-galleria', name: 'Galleria Hub', zone: 'galleria', position: [29.7399, -95.4610], type: HUB_TYPES.STREET, ek3Modules: 24, maxPower: 79, podCapacity: 3, swarmCapacity: 8, autoConnector: true, status: 'active' },
  { id: 'hub-hou-rice', name: 'Rice Village Hub', zone: 'montrose', position: [29.7158, -95.4158], type: HUB_TYPES.STREET, ek3Modules: 18, maxPower: 59, podCapacity: 2, swarmCapacity: 10, autoConnector: true, status: 'active' }
];

const HOUSTON_DRONE_CORRIDORS = [
  { id: 'corridor-hou-dt', name: 'Downtown Express', zone: 'downtown', waypoints: [[29.7584, -95.3632], [29.7569, -95.3673], [29.7532, -95.3597], [29.7604, -95.3698]], altitude: 150, color: '#00f0ff' },
  { id: 'corridor-hou-tmc', name: 'TMC Medical Run', zone: 'medical', waypoints: [[29.7066, -95.4000], [29.7050, -95.3960], [29.7100, -95.3920], [29.7066, -95.4000]], altitude: 100, color: '#ff006e' }
];

const HOUSTON_POD_ROUTES = [
  { id: 'pod-route-hou-galleria', name: 'Galleria Loop', zone: 'galleria', waypoints: [[29.7399, -95.4610], [29.7450, -95.4550], [29.7420, -95.4500], [29.7399, -95.4610]], color: '#9d4edd' },
  { id: 'pod-route-hou-rice', name: 'Rice Village Circuit', zone: 'montrose', waypoints: [[29.7158, -95.4158], [29.7200, -95.4100], [29.7180, -95.4050], [29.7158, -95.4158]], color: '#39ff14' }
];

const HOUSTON_SWARM_ZONES = [
  { id: 'swarm-zone-hou-montrose', name: 'Montrose Mesh', zone: 'montrose', center: [29.7500, -95.3920], radius: 0.015, density: 12, baseHub: 'hub-hou-montrose' },
  { id: 'swarm-zone-hou-discovery', name: 'Discovery Green', zone: 'downtown', center: [29.7540, -95.3580], radius: 0.008, density: 10, baseHub: 'hub-hou-discovery' }
];

// ============================================================================
// CITY CONFIGURATIONS EXPORT
// ============================================================================

export const CITIES = {
  losAngeles: {
    id: 'losAngeles',
    name: 'Los Angeles',
    shortName: 'LA',
    fullName: 'Los Angeles Autonomous Delivery Network',
    state: 'California',
    center: [34.0522, -118.2437],
    zoom: 11,
    minZoom: 10,
    maxZoom: 18,
    timezone: 'America/Los_Angeles',
    zones: LA_ZONES,
    rooftopHubs: LA_ROOFTOP_HUBS,
    streetHubs: LA_STREET_HUBS,
    droneCorridors: LA_DRONE_CORRIDORS,
    podRoutes: Object.values(POD_ROUTES_BY_CITY.losAngeles || LA_POD_ROUTES),
    swarmZones: LA_SWARM_ZONES,
    fleet: { drones: 12, pods: 6, swarmBots: 20 }
  },
  newYork: {
    id: 'newYork',
    name: 'New York City',
    shortName: 'NYC',
    fullName: 'New York City Autonomous Delivery Network',
    state: 'New York',
    center: [40.7580, -73.9855],
    zoom: 12,
    minZoom: 11,
    maxZoom: 18,
    timezone: 'America/New_York',
    zones: NYC_ZONES,
    rooftopHubs: NYC_ROOFTOP_HUBS,
    streetHubs: NYC_STREET_HUBS,
    droneCorridors: NYC_DRONE_CORRIDORS,
    podRoutes: Object.values(POD_ROUTES_BY_CITY.newYork || NYC_POD_ROUTES),
    swarmZones: NYC_SWARM_ZONES,
    fleet: { drones: 16, pods: 8, swarmBots: 24 }
  },
  seattle: {
    id: 'seattle',
    name: 'Seattle',
    shortName: 'SEA',
    fullName: 'Seattle Autonomous Delivery Network',
    state: 'Washington',
    center: [47.6062, -122.3321],
    zoom: 12,
    minZoom: 11,
    maxZoom: 18,
    timezone: 'America/Los_Angeles',
    zones: SEATTLE_ZONES,
    rooftopHubs: SEATTLE_ROOFTOP_HUBS,
    streetHubs: SEATTLE_STREET_HUBS,
    droneCorridors: SEATTLE_DRONE_CORRIDORS,
    podRoutes: Object.values(POD_ROUTES_BY_CITY.seattle || SEATTLE_POD_ROUTES),
    swarmZones: SEATTLE_SWARM_ZONES,
    fleet: { drones: 10, pods: 6, swarmBots: 16 }
  },
  sanFrancisco: {
    id: 'sanFrancisco',
    name: 'San Francisco',
    shortName: 'SF',
    fullName: 'San Francisco Autonomous Delivery Network',
    state: 'California',
    center: [37.7749, -122.4194],
    zoom: 12,
    minZoom: 11,
    maxZoom: 18,
    timezone: 'America/Los_Angeles',
    zones: SF_ZONES,
    rooftopHubs: SF_ROOFTOP_HUBS,
    streetHubs: SF_STREET_HUBS,
    droneCorridors: SF_DRONE_CORRIDORS,
    podRoutes: Object.values(POD_ROUTES_BY_CITY.sanFrancisco || SF_POD_ROUTES),
    swarmZones: SF_SWARM_ZONES,
    fleet: { drones: 12, pods: 6, swarmBots: 18 }
  },
  paloAlto: {
    id: 'paloAlto',
    name: 'Palo Alto',
    shortName: 'PA',
    fullName: 'Palo Alto / Silicon Valley Delivery Network',
    state: 'California',
    center: [37.4419, -122.1430],
    zoom: 13,
    minZoom: 12,
    maxZoom: 18,
    timezone: 'America/Los_Angeles',
    zones: PALOALTO_ZONES,
    rooftopHubs: PALOALTO_ROOFTOP_HUBS,
    streetHubs: PALOALTO_STREET_HUBS,
    droneCorridors: PALOALTO_DRONE_CORRIDORS,
    podRoutes: Object.values(POD_ROUTES_BY_CITY.paloAlto || PALOALTO_POD_ROUTES),
    swarmZones: PALOALTO_SWARM_ZONES,
    fleet: { drones: 8, pods: 4, swarmBots: 12 }
  },
  portland: {
    id: 'portland',
    name: 'Portland',
    shortName: 'PDX',
    fullName: 'Portland Autonomous Delivery Network',
    state: 'Oregon',
    center: [45.5155, -122.6793],
    zoom: 12,
    minZoom: 11,
    maxZoom: 18,
    timezone: 'America/Los_Angeles',
    zones: PORTLAND_ZONES,
    rooftopHubs: PORTLAND_ROOFTOP_HUBS,
    streetHubs: PORTLAND_STREET_HUBS,
    droneCorridors: PORTLAND_DRONE_CORRIDORS,
    podRoutes: Object.values(POD_ROUTES_BY_CITY.portland || PORTLAND_POD_ROUTES),
    swarmZones: PORTLAND_SWARM_ZONES,
    fleet: { drones: 8, pods: 5, swarmBots: 16 }
  },
  boston: {
    id: 'boston',
    name: 'Boston',
    shortName: 'BOS',
    fullName: 'Boston Autonomous Delivery Network',
    state: 'Massachusetts',
    center: [42.3601, -71.0589],
    zoom: 12,
    minZoom: 11,
    maxZoom: 18,
    timezone: 'America/New_York',
    zones: BOSTON_ZONES,
    rooftopHubs: BOSTON_ROOFTOP_HUBS,
    streetHubs: BOSTON_STREET_HUBS,
    droneCorridors: BOSTON_DRONE_CORRIDORS,
    podRoutes: Object.values(POD_ROUTES_BY_CITY.boston || BOSTON_POD_ROUTES),
    swarmZones: BOSTON_SWARM_ZONES,
    fleet: { drones: 10, pods: 5, swarmBots: 18 }
  },
  newJersey: {
    id: 'newJersey',
    name: 'Jersey City',
    shortName: 'NJ',
    fullName: 'New Jersey Autonomous Delivery Network',
    state: 'New Jersey',
    center: [40.7282, -74.0776],
    zoom: 12,
    minZoom: 11,
    maxZoom: 18,
    timezone: 'America/New_York',
    zones: NJ_ZONES,
    rooftopHubs: NJ_ROOFTOP_HUBS,
    streetHubs: NJ_STREET_HUBS,
    droneCorridors: NJ_DRONE_CORRIDORS,
    podRoutes: NJ_POD_ROUTES,
    swarmZones: NJ_SWARM_ZONES,
    fleet: { drones: 10, pods: 6, swarmBots: 16 }
  },
  denver: {
    id: 'denver',
    name: 'Denver',
    shortName: 'DEN',
    fullName: 'Denver Autonomous Delivery Network',
    state: 'Colorado',
    center: [39.7392, -104.9903],
    zoom: 12,
    minZoom: 11,
    maxZoom: 18,
    timezone: 'America/Denver',
    zones: DENVER_ZONES,
    rooftopHubs: DENVER_ROOFTOP_HUBS,
    streetHubs: DENVER_STREET_HUBS,
    droneCorridors: DENVER_DRONE_CORRIDORS,
    podRoutes: Object.values(POD_ROUTES_BY_CITY.denver || DENVER_POD_ROUTES),
    swarmZones: DENVER_SWARM_ZONES,
    fleet: { drones: 10, pods: 6, swarmBots: 14 }
  },
  boulder: {
    id: 'boulder',
    name: 'Boulder',
    shortName: 'BOU',
    fullName: 'Boulder Autonomous Delivery Network',
    state: 'Colorado',
    center: [40.0150, -105.2705],
    zoom: 13,
    minZoom: 12,
    maxZoom: 18,
    timezone: 'America/Denver',
    zones: BOULDER_ZONES,
    rooftopHubs: BOULDER_ROOFTOP_HUBS,
    streetHubs: BOULDER_STREET_HUBS,
    droneCorridors: BOULDER_DRONE_CORRIDORS,
    podRoutes: BOULDER_POD_ROUTES,
    swarmZones: BOULDER_SWARM_ZONES,
    fleet: { drones: 6, pods: 4, swarmBots: 14 }
  },
  arkansas: {
    id: 'arkansas',
    name: 'Little Rock',
    shortName: 'LR',
    fullName: 'Little Rock Autonomous Delivery Network',
    state: 'Arkansas',
    center: [34.7465, -92.2896],
    zoom: 12,
    minZoom: 11,
    maxZoom: 18,
    timezone: 'America/Chicago',
    zones: ARKANSAS_ZONES,
    rooftopHubs: ARKANSAS_ROOFTOP_HUBS,
    streetHubs: ARKANSAS_STREET_HUBS,
    droneCorridors: ARKANSAS_DRONE_CORRIDORS,
    podRoutes: ARKANSAS_POD_ROUTES,
    swarmZones: ARKANSAS_SWARM_ZONES,
    fleet: { drones: 6, pods: 4, swarmBots: 12 }
  },
  houston: {
    id: 'houston',
    name: 'Houston',
    shortName: 'HOU',
    fullName: 'Houston Autonomous Delivery Network',
    state: 'Texas',
    center: [29.7604, -95.3698],
    zoom: 11,
    minZoom: 10,
    maxZoom: 18,
    timezone: 'America/Chicago',
    zones: HOUSTON_ZONES,
    rooftopHubs: HOUSTON_ROOFTOP_HUBS,
    streetHubs: HOUSTON_STREET_HUBS,
    droneCorridors: HOUSTON_DRONE_CORRIDORS,
    podRoutes: HOUSTON_POD_ROUTES,
    swarmZones: HOUSTON_SWARM_ZONES,
    fleet: { drones: 14, pods: 8, swarmBots: 22 }
  }
};

// City list for dropdown
export const CITY_LIST = Object.values(CITIES).map(city => ({
  id: city.id,
  name: city.name,
  shortName: city.shortName,
  state: city.state
}));

// Get city configuration by ID
export const getCityConfig = (cityId) => CITIES[cityId] || CITIES.losAngeles;

// ============================================================================
// INTERCITY HIGHWAY NETWORK - Heavy Duty Trucking with Frequent Swap Stations
// Uses detailed GPS routes (50+ coordinates) from routes/interstateRoutes.js
// ============================================================================

// Major Interstate Corridors - use imported detailed routes with 50+ GPS coordinates
export const INTERSTATE_CORRIDORS = INTERSTATE_ROUTES;

// Generate swap stations using detailed route data
export const HIGHWAY_SWAP_STATIONS = getAllSwapStations();

// Heavy-duty truck fleet
export const TRUCK_TYPES = {
  SEMI: { id: 'semi', name: 'Semi Truck', batteryKwh: 300, range: 150, swapTime: 5 },
  BOX: { id: 'box', name: 'Box Truck', batteryKwh: 150, range: 120, swapTime: 3 },
  FLATBED: { id: 'flatbed', name: 'Flatbed', batteryKwh: 250, range: 140, swapTime: 4 }
};

// Generate initial truck fleet
export const generateTruckFleet = (count = 20) => {
  const corridors = Object.values(INTERSTATE_CORRIDORS);
  const truckTypes = Object.values(TRUCK_TYPES);

  return Array.from({ length: count }, (_, i) => {
    const corridor = corridors[i % corridors.length];
    const truckType = truckTypes[Math.floor(Math.random() * truckTypes.length)];
    const progress = Math.random();
    const waypointIndex = Math.floor(progress * (corridor.waypoints.length - 1));
    const localProgress = (progress * (corridor.waypoints.length - 1)) - waypointIndex;

    // Interpolate position
    const wp1 = corridor.waypoints[waypointIndex];
    const wp2 = corridor.waypoints[Math.min(waypointIndex + 1, corridor.waypoints.length - 1)];
    const position = [
      wp1[0] + (wp2[0] - wp1[0]) * localProgress,
      wp1[1] + (wp2[1] - wp1[1]) * localProgress
    ];

    return {
      id: `truck-${i + 1}`,
      type: 'truck',
      truckType: truckType.id,
      name: `${truckType.name} ${i + 1}`,
      corridorId: corridor.id,
      corridorName: corridor.name,
      progress,
      position,
      direction: Math.random() > 0.5 ? 1 : -1,
      batteryLevel: 30 + Math.random() * 70,
      batteryKwh: truckType.batteryKwh,
      range: truckType.range,
      state: Math.random() > 0.1 ? 'driving' : 'swapping',
      speed: 55 + Math.random() * 15, // mph
      cargo: Math.random() > 0.3 ? Math.floor(Math.random() * 40000) + 10000 : 0, // lbs
      nextSwapStation: null,
      swapsCompleted: Math.floor(Math.random() * 10),
      totalMiles: Math.floor(Math.random() * 50000) + 5000
    };
  });
};

// Default export
export default CITIES;
