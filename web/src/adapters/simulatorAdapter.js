/**
 * Adapters to transform Go simulator API data to match existing UI component expectations.
 *
 * NOTE: Constants are defined inline to avoid circular dependency with SimulationContext.
 */

// Bus states (must match SimulationContext.BUS_STATES)
const BUS_STATES = {
  DRIVING: 'driving',
  CHARGING: 'charging',
  WAITING: 'waiting',
  SWAPPING: 'swapping',
};

// Robot states (must match SimulationContext.ROBOT_STATES)
const ROBOT_STATES = {
  IDLE: 'idle',
  DISPATCHED: 'dispatched',
  CONNECTING: 'connecting',
  ACTIVE: 'active',
  SWAPPING: 'swapping',
  RETURNING: 'returning',
};

// Map API bus state to UI bus state
const BUS_STATE_MAP = {
  parked: BUS_STATES.WAITING,
  driving: BUS_STATES.DRIVING,
  at_stop: BUS_STATES.DRIVING, // Brief stop at bus stop
  charging: BUS_STATES.CHARGING,
  swapping: BUS_STATES.SWAPPING,
  waiting: BUS_STATES.WAITING,
};

// Map API robot state to UI robot state
const ROBOT_STATE_MAP = {
  idle: ROBOT_STATES.IDLE,
  moving: ROBOT_STATES.DISPATCHED,
  gripping: ROBOT_STATES.CONNECTING,
  swapping: ROBOT_STATES.SWAPPING,
  returning: ROBOT_STATES.RETURNING,
  faulted: ROBOT_STATES.IDLE,
};

// Map API station state to a simple status
const STATION_STATE_MAP = {
  offline: 'offline',
  idle: 'available',
  identifying: 'active',
  preparing: 'active',
  swapping: 'active',
  verifying: 'active',
};

/**
 * Transform API bus data to UI format
 */
export function adaptBus(apiBus) {
  return {
    id: apiBus.id,
    name: apiBus.id.replace('bus-', 'Bus '),
    routeId: apiBus.routeId || 'unknown',
    batteryLevel: apiBus.batterySoc || 0,
    state: BUS_STATE_MAP[apiBus.state] || BUS_STATES.DRIVING,
    // Direct position from live data (no progress interpolation needed)
    position: apiBus.position,
    speed: apiBus.speed || 0,
    // UI extras
    direction: 1,
    progress: 0, // Not used in live mode
    targetStation: apiBus.nextStationId || null,
    etaMinutes: apiBus.etaMinutes || 0,
    // Battery details from API
    batteryCapKwh: apiBus.batteryCapKwh || 0,
    batteryVoltage: apiBus.batteryVoltage || 0,
  };
}

/**
 * Transform array of API buses to UI format
 */
export function adaptBuses(apiBuses) {
  if (!Array.isArray(apiBuses)) return [];
  return apiBuses.map(adaptBus);
}

/**
 * Transform API station data to UI format
 */
export function adaptStation(apiStation, robots = []) {
  // Find robots for this station
  const stationRobots = robots.filter(r => r.stationId === apiStation.id);
  const batteryRobot = stationRobots.find(r => r.type === 'battery');
  const moduleRobot = stationRobots.find(r => r.type === 'module');

  return {
    id: apiStation.id,
    name: apiStation.name,
    position: apiStation.position,
    status: STATION_STATE_MAP[apiStation.state] || 'available',
    maxPower: apiStation.rackCount * 300, // Estimate based on rack count
    currentPower: 0, // Would need to calculate from modules
    busesCharging: apiStation.busQueue || [],
    moduleInventory: apiStation.moduleInventory || 0,
    // Robot A - battery swap robot
    hasRobotA: !!batteryRobot,
    robotAStatus: batteryRobot ? (ROBOT_STATE_MAP[batteryRobot.state] || ROBOT_STATES.IDLE) : ROBOT_STATES.IDLE,
    robotATargetBus: apiStation.currentBusId || null,
    robotAProgress: batteryRobot ? batteryRobot.progress : 0,
    // Robot B - module swap robot
    hasRobotB: !!moduleRobot,
    robotBStatus: moduleRobot ? (ROBOT_STATE_MAP[moduleRobot.state] || ROBOT_STATES.IDLE) : ROBOT_STATES.IDLE,
    robotBTargetBus: null,
    robotBProgress: moduleRobot ? moduleRobot.progress : 0,
  };
}

/**
 * Transform array of API stations to UI format
 */
export function adaptStations(apiStations, robots = []) {
  if (!Array.isArray(apiStations)) return [];
  return apiStations.map(s => adaptStation(s, robots));
}

/**
 * Transform API module data to UI format for grid visualization
 */
export function adaptModule(apiModule) {
  return {
    id: apiModule.id,
    slotIndex: apiModule.slotIndex,
    rackId: apiModule.rackId,
    state: apiModule.state,
    // Power
    powerOut: apiModule.powerOut || 0,
    voltage: apiModule.voltage || 0,
    current: apiModule.current || 0,
    efficiency: apiModule.efficiency || 0,
    // Thermal
    tempJunction: apiModule.tempJunction || 0,
    tempHeatsink: apiModule.tempHeatsink || 0,
    tempAmbient: apiModule.tempAmbient || 0,
    // Health
    health: apiModule.health || 100,
    rulHours: apiModule.rulHours || 0,
    operatingHrs: apiModule.operatingHrs || 0,
    powerCycles: apiModule.powerCycles || 0,
    // Degradation
    esrRatio: apiModule.esrRatio || 1,
    rdsOnRatio: apiModule.rdsOnRatio || 1,
  };
}

/**
 * Transform array of API modules to UI format
 */
export function adaptModules(apiModules) {
  if (!Array.isArray(apiModules)) return [];
  return apiModules.map(adaptModule);
}

/**
 * Get module state color for grid visualization
 */
export function getModuleStateColor(module) {
  const { state, powerOut, tempJunction } = module;

  if (state === 'faulted') return 'red';
  if (state === 'marked_for_replacement') return 'yellow';
  if (state === 'thermal_limiting') return 'orange';
  if (state === 'v2g') return 'purple';
  if (state === 'charging' || powerOut > 0) {
    const intensity = Math.min(powerOut / 3600, 1);
    if (intensity > 0.7) return 'cyan-400';
    if (intensity > 0.3) return 'cyan-500';
    return 'cyan-600';
  }
  return 'slate-600';
}

/**
 * Get module state label
 */
export function getModuleStateLabel(state) {
  const labels = {
    init: 'Initializing',
    idle: 'Idle',
    charging: 'Charging',
    v2g: 'V2G Active',
    thermal_limiting: 'Thermal Limit',
    faulted: 'Faulted',
    marked_for_replacement: 'Replace Soon',
  };
  return labels[state] || state;
}

/**
 * Aggregate module statistics
 */
export function aggregateModuleStats(modules) {
  if (!modules || modules.length === 0) {
    return {
      total: 0,
      active: 0,
      faulted: 0,
      v2g: 0,
      totalPower: 0,
      avgTemp: 0,
      avgEfficiency: 0,
      avgHealth: 0,
    };
  }

  const active = modules.filter(m => m.state !== 'faulted' && m.state !== 'idle');
  const faulted = modules.filter(m => m.state === 'faulted');
  const v2g = modules.filter(m => m.state === 'v2g');

  const totalPower = modules.reduce((sum, m) => sum + (m.powerOut || 0), 0);
  const avgTemp = modules.reduce((sum, m) => sum + (m.tempJunction || 0), 0) / modules.length;
  const avgEfficiency = modules.reduce((sum, m) => sum + (m.efficiency || 0), 0) / modules.length;
  const avgHealth = modules.reduce((sum, m) => sum + (m.health || 0), 0) / modules.length;

  return {
    total: modules.length,
    active: active.length,
    faulted: faulted.length,
    v2g: v2g.length,
    totalPower,
    avgTemp,
    avgEfficiency,
    avgHealth,
  };
}

/**
 * Transform simulation state for UI
 */
export function adaptSimState(apiSimState) {
  if (!apiSimState) return null;

  return {
    running: apiSimState.running,
    paused: apiSimState.paused,
    timeScale: apiSimState.timeScale || 1,
    tickCount: apiSimState.tickCount || 0,
    simTime: apiSimState.simTime,
    realTime: apiSimState.realTime,
    // Aggregated stats
    moduleCount: apiSimState.moduleCount || 0,
    rackCount: apiSimState.rackCount || 0,
    busCount: apiSimState.busCount || 0,
    stationCount: apiSimState.stationCount || 0,
    totalPower: apiSimState.totalPower || 0,
    avgEfficiency: apiSimState.avgEfficiency || 0,
    avgBatterySoc: apiSimState.avgBatterySoc || 0,
  };
}
