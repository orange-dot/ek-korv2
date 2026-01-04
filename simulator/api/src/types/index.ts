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
} as const;
