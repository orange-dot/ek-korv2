// Entity types
export type ModuleState =
  | 'init'
  | 'idle'
  | 'charging'
  | 'v2g'
  | 'thermal_limiting'
  | 'faulted'
  | 'marked_for_replacement';

export interface Module {
  id: string;
  rackId: string;
  slotIndex: number;
  state: ModuleState;
  powerOut: number;
  voltage: number;
  current: number;
  tempJunction: number;
  tempHeatsink: number;
  tempAmbient: number;
  esrRatio: number;
  rdsOnRatio: number;
  efficiency: number;
  operatingHrs: number;
  powerCycles: number;
  health: number;
  rulHours: number;
}

export type RackState = 'offline' | 'standby' | 'active' | 'faulted';

export interface Rack {
  id: string;
  stationId: string;
  state: RackState;
  moduleCount: number;
  activeModules: number;
  totalPower: number;
  maxPower: number;
  efficiency: number;
  tempAvg: number;
}

export type BusState = 'parked' | 'driving' | 'charging' | 'swapping' | 'waiting';

export interface Position {
  lat: number;
  lng: number;
}

export interface Bus {
  id: string;
  routeId: string;
  state: BusState;
  batterySoc: number;
  batteryCapKwh: number;
  batteryVoltage: number;
  position: Position;
  speed: number;
  nextStationId: string;
  etaMinutes: number;
}

export type StationState =
  | 'offline'
  | 'idle'
  | 'identifying'
  | 'preparing'
  | 'swapping'
  | 'verifying';

export interface Station {
  id: string;
  name: string;
  position: Position;
  state: StationState;
  rackCount: number;
  moduleInventory: number;
  busQueue: string[];
  currentBusId: string;
}

export type RobotType = 'battery' | 'module';
export type RobotState =
  | 'idle'
  | 'moving'
  | 'gripping'
  | 'swapping'
  | 'returning'
  | 'faulted';

export interface Robot {
  id: string;
  stationId: string;
  type: RobotType;
  state: RobotState;
  progress: number;
  cycleTime: number;
}

export interface Grid {
  frequency: number;
  voltage: number;
  loadDemand: number;
  v2gEnabled: boolean;
  v2gPower: number;
}

export interface SimulationState {
  running: boolean;
  paused: boolean;
  simTime: string;
  realTime: string;
  timeScale: number;
  tickCount: number;
  moduleCount: number;
  rackCount: number;
  busCount: number;
  stationCount: number;
  totalPower: number;
  avgEfficiency: number;
  avgBatterySoc: number;
  activeCharging: number;
}

// WebSocket message types
export interface WSMessage {
  type: string;
  data: unknown;
  timestamp: string;
}

// Redis event channels
export const EVENTS = {
  SIM_STATE: 'sim:state',
  MODULE_STATE: 'sim:module',
  BUS_STATE: 'sim:bus',
  STATION_STATE: 'sim:station',
  ROBOT_STATE: 'sim:robot',
  GRID_STATE: 'sim:grid',
  ALERT: 'sim:alert',
  METRICS: 'sim:metrics',
  // Delivery events
  DELIVERY_STATE: 'delivery:state',
  DELIVERY_DRONE: 'delivery:drone',
  DELIVERY_POD: 'delivery:pod',
  DELIVERY_SWARMBOT: 'delivery:swarmbot',
  DELIVERY_HUB: 'delivery:hub',
  DELIVERY_PACKAGE: 'delivery:package',
  DELIVERY_METRICS: 'delivery:metrics',
  DELIVERY_CONTROL: 'delivery:control',
} as const;

// ===== LA Delivery Types =====

export type DeliveryVehicleType = 'pod' | 'drone' | 'swarmbot';

export type DeliveryState =
  | 'idle'
  | 'charging'
  | 'swapping'
  | 'en_route'
  | 'arriving'
  | 'flying'
  | 'landing'
  | 'hovering'
  | 'taking_off'
  | 'handoff_waiting'
  | 'handoff_active'
  | 'swarming'
  | 'delivering'
  | 'returning'
  | 'loading'
  | 'unloading'
  | 'dispatching';

export type DeliveryPriority = 'standard' | 'express' | 'priority' | 'emergency';

export type HubType = 'rooftop_hub' | 'street_hub' | 'handoff_point';

export interface Drone {
  id: string;
  state: DeliveryState;
  position: Position;
  altitude: number;
  speed: number;
  heading: number;
  batterySoc: number;
  packageId?: string;
  corridorId?: string;
  homeHubId: string;
  targetPos?: Position;
  routeIndex: number;
}

export interface DeliveryPod {
  id: string;
  state: DeliveryState;
  position: Position;
  speed: number;
  heading: number;
  batterySoc: number;
  capacity: number;
  packageIds: string[];
  swarmBotIds: string[];
  routeId?: string;
  homeHubId: string;
  routeIndex: number;
}

export interface SwarmBot {
  id: string;
  state: DeliveryState;
  position: Position;
  speed: number;
  heading: number;
  batterySoc: number;
  packageId?: string;
  parentPodId?: string;
  homeHubId: string;
  targetPos?: Position;
  zoneId?: string;
}

export interface DeliveryHub {
  id: string;
  name: string;
  type: HubType;
  position: Position;
  capacity: number;
  occupied: number;
  queueLength: number;
  chargingPower: number;
  avgWaitTime: number;
}

export interface Package {
  id: string;
  priority: DeliveryPriority;
  origin: Position;
  destination: Position;
  weight: number;
  size: string;
  status: string;
  vehicleId?: string;
  vehicleType?: DeliveryVehicleType;
  createdAt: number;
  deliveredAt?: number;
  etaMinutes?: number;
}

export interface DroneCorridor {
  id: string;
  name: string;
  waypoints: Position[];
  altitude: number;
  width: number;
  speedLimit: number;
}

export interface PodRoute {
  id: string;
  name: string;
  waypoints: Position[];
  length: number;
}

export interface SwarmZone {
  id: string;
  name: string;
  center: Position;
  radius: number;
  hubId: string;
}

export interface DeliveryMetrics {
  totalDrones: number;
  activeDrones: number;
  totalPods: number;
  activePods: number;
  totalSwarmBots: number;
  activeSwarmBots: number;
  pendingDeliveries: number;
  inTransitDeliveries: number;
  completedDeliveries: number;
  avgDeliveryTime: number;
  avgDroneSOC: number;
  avgPodSOC: number;
  avgSwarmBotSOC: number;
  chargingCount: number;
  fleetUtilization: number;
  handoffSuccessRate: number;
}

export interface DeliverySimulationState {
  running: boolean;
  simTime: number;
  timeScale: number;
  drones: Drone[];
  pods: DeliveryPod[];
  swarmBots: SwarmBot[];
  hubs: DeliveryHub[];
  packages: Package[];
  corridors: DroneCorridor[];
  routes: PodRoute[];
  zones: SwarmZone[];
  metrics: DeliveryMetrics;
}

// Aggregated metrics for demo/pitch dashboard
export interface SimulationMetrics {
  // Time
  simulatedHours: number;
  realTimeSeconds: number;

  // Uptime & Reliability
  systemUptime: number;      // 0-100%
  moduleUptime: number;      // Average module uptime %
  faultsDetected: number;
  faultsRecovered: number;
  mtbfHours: number;         // Mean time between failures
  mttrMinutes: number;       // Mean time to repair

  // Efficiency
  avgEfficiency: number;     // 0-100%
  peakEfficiency: number;
  totalEnergyKwh: number;
  energyLossKwh: number;

  // Cost Savings (vs traditional)
  modulesReplaced: number;
  downtimeMinutes: number;
  downtimeAvoided: number;   // Minutes saved by hot-swap
  costSavingsUsd: number;    // Estimated savings

  // Fleet Performance
  busesCharged: number;
  swapsCompleted: number;
  avgChargeTimeMin: number;
  avgSwapTimeSec: number;
  fleetSoc: number;          // Average fleet SoC

  // V2G Performance
  v2gEventsCount: number;
  v2gEnergyKwh: number;      // Energy exported to grid
  v2gRevenueUsd: number;
  gridFreqMin: number;       // Minimum frequency seen
  gridFreqMax: number;       // Maximum frequency seen

  // Swarm Intelligence
  loadBalanceScore: number;  // 0-100 (100 = perfect distribution)
  thermalBalance: number;    // Temperature spread across modules
  redundancyLevel: number;   // Available spare capacity %
}
