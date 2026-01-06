/**
 * Adapters to transform LA Delivery API data to match UI component expectations.
 */

// Delivery vehicle states
export const DELIVERY_STATES = {
  IDLE: 'idle',
  CHARGING: 'charging',
  SWAPPING: 'swapping',
  EN_ROUTE: 'en_route',
  ARRIVING: 'arriving',
  FLYING: 'flying',
  LANDING: 'landing',
  HOVERING: 'hovering',
  TAKING_OFF: 'taking_off',
  HANDOFF_WAITING: 'handoff_waiting',
  HANDOFF_ACTIVE: 'handoff_active',
  SWARMING: 'swarming',
  DELIVERING: 'delivering',
  RETURNING: 'returning',
  LOADING: 'loading',
  UNLOADING: 'unloading',
  DISPATCHING: 'dispatching',
};

// Priority levels
export const PRIORITY_LEVELS = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  PRIORITY: 'priority',
  EMERGENCY: 'emergency',
};

// Hub types
export const HUB_TYPES = {
  ROOFTOP: 'rooftop_hub',
  STREET: 'street_hub',
  HANDOFF: 'handoff_point',
};

// State color mapping for visualization
const STATE_COLORS = {
  idle: 'slate-500',
  charging: 'yellow-500',
  swapping: 'orange-500',
  en_route: 'blue-500',
  arriving: 'blue-400',
  flying: 'cyan-500',
  landing: 'cyan-400',
  hovering: 'cyan-600',
  taking_off: 'cyan-400',
  handoff_waiting: 'purple-500',
  handoff_active: 'purple-400',
  swarming: 'green-500',
  delivering: 'green-400',
  returning: 'amber-500',
  loading: 'indigo-500',
  unloading: 'indigo-400',
  dispatching: 'blue-600',
};

// Priority color mapping
const PRIORITY_COLORS = {
  standard: 'slate-500',
  express: 'blue-500',
  priority: 'orange-500',
  emergency: 'red-500',
};

/**
 * Get color for delivery state
 */
export function getStateColor(state) {
  return STATE_COLORS[state] || 'slate-500';
}

/**
 * Get color for priority level
 */
export function getPriorityColor(priority) {
  return PRIORITY_COLORS[priority] || 'slate-500';
}

/**
 * Get human-readable label for state
 */
export function getStateLabel(state) {
  const labels = {
    idle: 'Idle',
    charging: 'Charging',
    swapping: 'Battery Swap',
    en_route: 'En Route',
    arriving: 'Arriving',
    flying: 'Flying',
    landing: 'Landing',
    hovering: 'Hovering',
    taking_off: 'Taking Off',
    handoff_waiting: 'Waiting for Handoff',
    handoff_active: 'Handoff Active',
    swarming: 'Swarming',
    delivering: 'Delivering',
    returning: 'Returning',
    loading: 'Loading',
    unloading: 'Unloading',
    dispatching: 'Dispatching',
  };
  return labels[state] || state;
}

/**
 * Get human-readable label for priority
 */
export function getPriorityLabel(priority) {
  const labels = {
    standard: 'Standard',
    express: 'Express',
    priority: 'Priority',
    emergency: 'Emergency',
  };
  return labels[priority] || priority;
}

/**
 * Transform API drone data to UI format
 */
export function adaptDrone(apiDrone) {
  return {
    id: apiDrone.id,
    type: 'drone',
    state: apiDrone.state,
    stateLabel: getStateLabel(apiDrone.state),
    stateColor: getStateColor(apiDrone.state),
    position: apiDrone.position,
    altitude: apiDrone.altitude || 0,
    speed: apiDrone.speed || 0,
    heading: apiDrone.heading || 0,
    batteryLevel: apiDrone.batterySoc || 0,
    packageId: apiDrone.packageId || null,
    corridorId: apiDrone.corridorId || null,
    homeHubId: apiDrone.homeHubId,
    targetPos: apiDrone.targetPos || null,
    // UI helpers
    isActive: apiDrone.state !== 'idle' && apiDrone.state !== 'charging',
    isFlying: ['flying', 'taking_off', 'landing', 'hovering'].includes(apiDrone.state),
    hasPackage: !!apiDrone.packageId,
    needsCharge: apiDrone.batterySoc < 30,
  };
}

/**
 * Transform array of API drones to UI format
 */
export function adaptDrones(apiDrones) {
  if (!Array.isArray(apiDrones)) return [];
  return apiDrones.map(adaptDrone);
}

/**
 * Transform API pod data to UI format
 */
export function adaptPod(apiPod) {
  return {
    id: apiPod.id,
    type: 'pod',
    state: apiPod.state,
    stateLabel: getStateLabel(apiPod.state),
    stateColor: getStateColor(apiPod.state),
    position: apiPod.position,
    speed: apiPod.speed || 0,
    heading: apiPod.heading || 0,
    batteryLevel: apiPod.batterySoc || 0,
    capacity: apiPod.capacity || 6,
    packageIds: apiPod.packageIds || [],
    swarmBotIds: apiPod.swarmBotIds || [],
    routeId: apiPod.routeId || null,
    homeHubId: apiPod.homeHubId,
    // UI helpers
    isActive: apiPod.state !== 'idle' && apiPod.state !== 'charging',
    packageCount: (apiPod.packageIds || []).length,
    swarmBotCount: (apiPod.swarmBotIds || []).length,
    loadPercentage: ((apiPod.packageIds || []).length / (apiPod.capacity || 6)) * 100,
    needsCharge: apiPod.batterySoc < 25,
  };
}

/**
 * Transform array of API pods to UI format
 */
export function adaptPods(apiPods) {
  if (!Array.isArray(apiPods)) return [];
  return apiPods.map(adaptPod);
}

/**
 * Transform API swarm bot data to UI format
 */
export function adaptSwarmBot(apiBot) {
  return {
    id: apiBot.id,
    type: 'swarmbot',
    state: apiBot.state,
    stateLabel: getStateLabel(apiBot.state),
    stateColor: getStateColor(apiBot.state),
    position: apiBot.position,
    speed: apiBot.speed || 0,
    heading: apiBot.heading || 0,
    batteryLevel: apiBot.batterySoc || 0,
    packageId: apiBot.packageId || null,
    parentPodId: apiBot.parentPodId || null,
    homeHubId: apiBot.homeHubId,
    targetPos: apiBot.targetPos || null,
    zoneId: apiBot.zoneId || null,
    // UI helpers
    isActive: apiBot.state !== 'idle' && apiBot.state !== 'charging' && apiBot.state !== 'swapping',
    hasPackage: !!apiBot.packageId,
    isAttached: !!apiBot.parentPodId,
    needsCharge: apiBot.batterySoc < 20,
  };
}

/**
 * Transform array of API swarm bots to UI format
 */
export function adaptSwarmBots(apiBots) {
  if (!Array.isArray(apiBots)) return [];
  return apiBots.map(adaptSwarmBot);
}

/**
 * Transform API hub data to UI format
 */
export function adaptHub(apiHub) {
  const hubTypeLabels = {
    rooftop_hub: 'Rooftop Hub',
    street_hub: 'Street Hub',
    handoff_point: 'Handoff Point',
  };

  const hubTypeIcons = {
    rooftop_hub: 'building',
    street_hub: 'truck',
    handoff_point: 'exchange',
  };

  return {
    id: apiHub.id,
    name: apiHub.name,
    type: apiHub.type,
    typeLabel: hubTypeLabels[apiHub.type] || apiHub.type,
    typeIcon: hubTypeIcons[apiHub.type] || 'hub',
    position: apiHub.position,
    capacity: apiHub.capacity || 4,
    occupied: apiHub.occupied || 0,
    queueLength: apiHub.queueLength || 0,
    chargingPower: apiHub.chargingPower || 0,
    avgWaitTime: apiHub.avgWaitTime || 0,
    // UI helpers
    utilizationPercentage: ((apiHub.occupied || 0) / (apiHub.capacity || 1)) * 100,
    isBusy: apiHub.occupied >= apiHub.capacity,
    hasQueue: apiHub.queueLength > 0,
    isDroneHub: apiHub.type === 'rooftop_hub',
    isStreetHub: apiHub.type === 'street_hub',
  };
}

/**
 * Transform array of API hubs to UI format
 */
export function adaptHubs(apiHubs) {
  if (!Array.isArray(apiHubs)) return [];
  return apiHubs.map(adaptHub);
}

/**
 * Transform API package data to UI format
 */
export function adaptPackage(apiPackage) {
  return {
    id: apiPackage.id,
    priority: apiPackage.priority,
    priorityLabel: getPriorityLabel(apiPackage.priority),
    priorityColor: getPriorityColor(apiPackage.priority),
    origin: apiPackage.origin,
    destination: apiPackage.destination,
    weight: apiPackage.weight || 0,
    size: apiPackage.size || 'small',
    status: apiPackage.status,
    vehicleId: apiPackage.vehicleId || null,
    vehicleType: apiPackage.vehicleType || null,
    createdAt: apiPackage.createdAt,
    deliveredAt: apiPackage.deliveredAt || null,
    etaMinutes: apiPackage.etaMinutes || null,
    // UI helpers
    isPending: apiPackage.status === 'pending',
    isInTransit: apiPackage.status === 'in_transit' || apiPackage.status === 'assigned',
    isDelivered: apiPackage.status === 'delivered',
    isUrgent: apiPackage.priority === 'emergency' || apiPackage.priority === 'priority',
    formattedWeight: `${(apiPackage.weight || 0).toFixed(1)} kg`,
  };
}

/**
 * Transform array of API packages to UI format
 */
export function adaptPackages(apiPackages) {
  if (!Array.isArray(apiPackages)) return [];
  return apiPackages.map(adaptPackage);
}

/**
 * Transform API corridor data to UI format
 */
export function adaptCorridor(apiCorridor) {
  return {
    id: apiCorridor.id,
    name: apiCorridor.name,
    waypoints: apiCorridor.waypoints || [],
    altitude: apiCorridor.altitude || 100,
    width: apiCorridor.width || 50,
    speedLimit: apiCorridor.speedLimit || 20,
  };
}

/**
 * Transform array of API corridors to UI format
 */
export function adaptCorridors(apiCorridors) {
  if (!Array.isArray(apiCorridors)) return [];
  return apiCorridors.map(adaptCorridor);
}

/**
 * Transform API route data to UI format
 */
export function adaptRoute(apiRoute) {
  return {
    id: apiRoute.id,
    name: apiRoute.name,
    waypoints: apiRoute.waypoints || [],
    length: apiRoute.length || 0,
  };
}

/**
 * Transform array of API routes to UI format
 */
export function adaptRoutes(apiRoutes) {
  if (!Array.isArray(apiRoutes)) return [];
  return apiRoutes.map(adaptRoute);
}

/**
 * Transform API zone data to UI format
 */
export function adaptZone(apiZone) {
  return {
    id: apiZone.id,
    name: apiZone.name,
    center: apiZone.center,
    radius: apiZone.radius || 500,
    hubId: apiZone.hubId,
  };
}

/**
 * Transform array of API zones to UI format
 */
export function adaptZones(apiZones) {
  if (!Array.isArray(apiZones)) return [];
  return apiZones.map(adaptZone);
}

/**
 * Transform API metrics to UI format
 */
export function adaptMetrics(apiMetrics) {
  if (!apiMetrics) return getDefaultMetrics();

  return {
    // Fleet counts
    totalDrones: apiMetrics.totalDrones || 0,
    activeDrones: apiMetrics.activeDrones || 0,
    totalPods: apiMetrics.totalPods || 0,
    activePods: apiMetrics.activePods || 0,
    totalSwarmBots: apiMetrics.totalSwarmBots || 0,
    activeSwarmBots: apiMetrics.activeSwarmBots || 0,

    // Delivery counts
    pendingDeliveries: apiMetrics.pendingDeliveries || 0,
    inTransitDeliveries: apiMetrics.inTransitDeliveries || 0,
    completedDeliveries: apiMetrics.completedDeliveries || 0,
    avgDeliveryTime: apiMetrics.avgDeliveryTime || 0,

    // Battery stats
    avgDroneSOC: apiMetrics.avgDroneSOC || 0,
    avgPodSOC: apiMetrics.avgPodSOC || 0,
    avgSwarmBotSOC: apiMetrics.avgSwarmBotSOC || 0,
    chargingCount: apiMetrics.chargingCount || 0,

    // Efficiency
    fleetUtilization: apiMetrics.fleetUtilization || 0,
    handoffSuccessRate: apiMetrics.handoffSuccessRate || 0,

    // Computed helpers
    totalVehicles: (apiMetrics.totalDrones || 0) + (apiMetrics.totalPods || 0) + (apiMetrics.totalSwarmBots || 0),
    activeVehicles: (apiMetrics.activeDrones || 0) + (apiMetrics.activePods || 0) + (apiMetrics.activeSwarmBots || 0),
    totalDeliveries: (apiMetrics.pendingDeliveries || 0) + (apiMetrics.inTransitDeliveries || 0) + (apiMetrics.completedDeliveries || 0),
  };
}

/**
 * Get default metrics object
 */
export function getDefaultMetrics() {
  return {
    totalDrones: 0,
    activeDrones: 0,
    totalPods: 0,
    activePods: 0,
    totalSwarmBots: 0,
    activeSwarmBots: 0,
    pendingDeliveries: 0,
    inTransitDeliveries: 0,
    completedDeliveries: 0,
    avgDeliveryTime: 0,
    avgDroneSOC: 0,
    avgPodSOC: 0,
    avgSwarmBotSOC: 0,
    chargingCount: 0,
    fleetUtilization: 0,
    handoffSuccessRate: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    totalDeliveries: 0,
  };
}

/**
 * Transform full delivery simulation state
 */
export function adaptDeliveryState(apiState) {
  if (!apiState) {
    return {
      running: false,
      simTime: 0,
      timeScale: 1,
      drones: [],
      pods: [],
      swarmBots: [],
      hubs: [],
      packages: [],
      corridors: [],
      routes: [],
      zones: [],
      metrics: getDefaultMetrics(),
    };
  }

  return {
    running: apiState.running || false,
    simTime: apiState.simTime || 0,
    timeScale: apiState.timeScale || 1,
    drones: adaptDrones(apiState.drones),
    pods: adaptPods(apiState.pods),
    swarmBots: adaptSwarmBots(apiState.swarmBots),
    hubs: adaptHubs(apiState.hubs),
    packages: adaptPackages(apiState.packages),
    corridors: adaptCorridors(apiState.corridors),
    routes: adaptRoutes(apiState.routes),
    zones: adaptZones(apiState.zones),
    metrics: adaptMetrics(apiState.metrics),
  };
}

/**
 * Aggregate fleet statistics
 */
export function aggregateFleetStats(drones, pods, swarmBots) {
  const allVehicles = [
    ...(drones || []),
    ...(pods || []),
    ...(swarmBots || []),
  ];

  const active = allVehicles.filter(v => v.isActive);
  const charging = allVehicles.filter(v => v.state === 'charging' || v.state === 'swapping');
  const withPackage = allVehicles.filter(v => v.hasPackage);
  const lowBattery = allVehicles.filter(v => v.needsCharge);

  return {
    total: allVehicles.length,
    active: active.length,
    charging: charging.length,
    delivering: withPackage.length,
    lowBattery: lowBattery.length,
    utilization: allVehicles.length > 0 ? (active.length / allVehicles.length) * 100 : 0,
    avgBattery: allVehicles.length > 0
      ? allVehicles.reduce((sum, v) => sum + (v.batteryLevel || 0), 0) / allVehicles.length
      : 0,
  };
}

/**
 * Get vehicle icon based on type and state
 */
export function getVehicleIcon(type, state) {
  const icons = {
    drone: {
      flying: 'drone-flying',
      charging: 'drone-charging',
      default: 'drone',
    },
    pod: {
      en_route: 'pod-moving',
      charging: 'pod-charging',
      default: 'pod',
    },
    swarmbot: {
      delivering: 'bot-active',
      charging: 'bot-charging',
      default: 'bot',
    },
  };

  const typeIcons = icons[type] || icons.drone;
  return typeIcons[state] || typeIcons.default;
}

/**
 * Calculate distance between two positions (Haversine formula)
 */
export function calculateDistance(pos1, pos2) {
  const R = 6371; // Earth's radius in km
  const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
  const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format distance for display
 */
export function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Format time for display
 */
export function formatTime(minutes) {
  if (minutes < 1) {
    return '< 1 min';
  }
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}
