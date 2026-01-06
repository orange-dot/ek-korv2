/**
 * LA Delivery Decision Scenarios (Extended)
 * Human-in-the-loop decision system for autonomous delivery fleet
 *
 * 12 total scenarios:
 * - 6 original scenarios from laDecisionScenarios.js
 * - 6 new delivery-specific scenarios
 */

// Scenario types
export const SCENARIO_TYPES = {
  // Original scenarios
  WEATHER_ALERT: 'weather_alert',
  HANDOFF_FAILURE: 'handoff_failure',
  PRIORITY_OVERRIDE: 'priority_override',
  HUB_CONGESTION: 'hub_congestion',
  EMERGENCY_LANDING: 'emergency_landing',
  SWARM_REBALANCE: 'swarm_rebalance',
  // New scenarios
  CORRIDOR_CONFLICT: 'corridor_conflict',
  MULTI_HUB_ROUTING: 'multi_hub_routing',
  SWARM_FORMATION_BREAKDOWN: 'swarm_formation_breakdown',
  INTERCITY_TRUCK_COORD: 'intercity_truck_coord',
  PACKAGE_PRIORITY_CONFLICT: 'package_priority_conflict',
  HUB_POWER_GRID: 'hub_power_grid'
};

// Scenario configurations
export const SCENARIO_CONFIG = {
  // ============================================================================
  // ORIGINAL SCENARIOS
  // ============================================================================

  [SCENARIO_TYPES.WEATHER_ALERT]: {
    id: 'weather_alert',
    title: 'Weather Alert',
    icon: 'Cloud',
    color: '#00f0ff',
    bgGradient: 'linear-gradient(135deg, rgba(0,240,255,0.15) 0%, rgba(0,0,0,0.3) 100%)',
    timer: 30,
    vehicleTypes: ['drone'],
    trigger: {
      type: 'random',
      probability: 0.002,
      condition: 'wind > 25mph'
    },
    description: 'High winds detected in flight corridor. Wind speed exceeding safe operating limits.',
    aiConfidence: 87,
    options: [
      {
        id: 'ground',
        label: 'Ground Fleet',
        description: 'Land all drones at nearest hub until conditions improve',
        recommended: true,
        ifChosen: 'All drones safely grounded, deliveries delayed 15-30 min',
        effect: { action: 'ground_drones', scope: 'zone' }
      },
      {
        id: 'reduce',
        label: 'Reduce Altitude',
        description: 'Lower flight altitude to reduce wind exposure',
        recommended: false,
        ifChosen: 'Continue with reduced efficiency, 20% higher battery drain',
        effect: { action: 'reduce_altitude', value: 50 }
      },
      {
        id: 'continue',
        label: 'Continue Operations',
        description: 'Maintain current flight patterns',
        recommended: false,
        ifChosen: 'Risk of drone drift, potential delivery delays',
        effect: { action: 'none' }
      }
    ]
  },

  [SCENARIO_TYPES.HANDOFF_FAILURE]: {
    id: 'handoff_failure',
    title: 'Handoff Failure',
    icon: 'LinkSlash',
    color: '#ff006e',
    bgGradient: 'linear-gradient(135deg, rgba(255,0,110,0.15) 0%, rgba(0,0,0,0.3) 100%)',
    timer: 25,
    vehicleTypes: ['drone', 'swarmbot'],
    trigger: {
      type: 'state',
      condition: 'handoff_waiting > 60s'
    },
    description: 'SwarmBot unavailable for handoff. Drone hovering at transfer point.',
    aiConfidence: 72,
    options: [
      {
        id: 'wait',
        label: 'Wait for Bot',
        description: 'Hold position until swarmbot becomes available',
        recommended: false,
        ifChosen: 'Up to 5 min delay, battery drain while hovering',
        effect: { action: 'wait', timeout: 300 }
      },
      {
        id: 'redirect',
        label: 'Redirect Drone',
        description: 'Reroute to alternate handoff point',
        recommended: true,
        ifChosen: 'New handoff point 2km away, 3 min added delay',
        effect: { action: 'redirect_handoff' }
      },
      {
        id: 'direct',
        label: 'Direct Delivery',
        description: 'Drone completes last-mile delivery directly',
        recommended: false,
        ifChosen: 'Drone lands at destination, longer turnaround time',
        effect: { action: 'direct_delivery' }
      }
    ]
  },

  [SCENARIO_TYPES.PRIORITY_OVERRIDE]: {
    id: 'priority_override',
    title: 'Priority Override',
    icon: 'Star',
    color: '#fbbf24',
    bgGradient: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(0,0,0,0.3) 100%)',
    timer: 45,
    vehicleTypes: ['drone', 'pod', 'swarmbot'],
    trigger: {
      type: 'external',
      condition: 'vip_package_nearby'
    },
    description: 'Emergency medical delivery detected nearby. Priority package requires immediate attention.',
    aiConfidence: 95,
    options: [
      {
        id: 'intercept',
        label: 'Intercept Package',
        description: 'Redirect nearest vehicle to pick up priority package',
        recommended: true,
        ifChosen: 'Current delivery delayed, priority package delivered in 8 min',
        effect: { action: 'priority_intercept', priority: 'emergency' }
      },
      {
        id: 'dispatch',
        label: 'Dispatch Reserve',
        description: 'Send reserve vehicle from hub',
        recommended: false,
        ifChosen: 'No delay to current ops, priority delivered in 15 min',
        effect: { action: 'dispatch_reserve' }
      },
      {
        id: 'decline',
        label: 'Decline Override',
        description: 'Continue with current operations',
        recommended: false,
        ifChosen: 'Priority package assigned to next available unit',
        effect: { action: 'none' }
      }
    ]
  },

  [SCENARIO_TYPES.HUB_CONGESTION]: {
    id: 'hub_congestion',
    title: 'Hub Congestion',
    icon: 'Grid',
    color: '#9d4edd',
    bgGradient: 'linear-gradient(135deg, rgba(157,78,221,0.15) 0%, rgba(0,0,0,0.3) 100%)',
    timer: 40,
    vehicleTypes: ['drone', 'pod', 'swarmbot'],
    trigger: {
      type: 'threshold',
      condition: 'hub_capacity > 85%'
    },
    description: 'Charging hub approaching full capacity. Queue forming for charging slots.',
    aiConfidence: 81,
    options: [
      {
        id: 'redistribute',
        label: 'Redistribute',
        description: 'Send vehicles to alternate hubs',
        recommended: true,
        ifChosen: 'Vehicles rerouted to Hub B, 1.5km extra distance',
        effect: { action: 'redistribute_to_hubs' }
      },
      {
        id: 'priority-queue',
        label: 'Priority Queue',
        description: 'Prioritize low-battery vehicles',
        recommended: false,
        ifChosen: 'Low battery vehicles get priority, others wait',
        effect: { action: 'priority_queue' }
      },
      {
        id: 'extend-range',
        label: 'Extend Range',
        description: 'Allow vehicles to operate at lower battery threshold',
        recommended: false,
        ifChosen: 'Risky, potential emergency landings',
        effect: { action: 'lower_threshold', value: 15 }
      }
    ]
  },

  [SCENARIO_TYPES.EMERGENCY_LANDING]: {
    id: 'emergency_landing',
    title: 'Emergency Landing',
    icon: 'AlertTriangle',
    color: '#ef4444',
    bgGradient: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(0,0,0,0.3) 100%)',
    timer: 20,
    vehicleTypes: ['drone'],
    trigger: {
      type: 'threshold',
      condition: 'battery < 12%'
    },
    description: 'Drone critically low on battery. Immediate landing required.',
    aiConfidence: 98,
    options: [
      {
        id: 'nearest-hub',
        label: 'Nearest Hub',
        description: 'Rush to closest charging hub',
        recommended: false,
        ifChosen: 'Hub is 800m away, 40% chance of reaching',
        effect: { action: 'rush_to_hub' }
      },
      {
        id: 'safe-landing',
        label: 'Safe Landing Zone',
        description: 'Land at designated emergency zone',
        recommended: true,
        ifChosen: 'Safe landing 200m away, requires recovery dispatch',
        effect: { action: 'emergency_land' }
      },
      {
        id: 'immediate',
        label: 'Immediate Landing',
        description: 'Land at current position',
        recommended: false,
        ifChosen: 'Risk of landing in unsuitable area',
        effect: { action: 'land_now' }
      }
    ]
  },

  [SCENARIO_TYPES.SWARM_REBALANCE]: {
    id: 'swarm_rebalance',
    title: 'Swarm Rebalance',
    icon: 'Network',
    color: '#39ff14',
    bgGradient: 'linear-gradient(135deg, rgba(57,255,20,0.15) 0%, rgba(0,0,0,0.3) 100%)',
    timer: 35,
    vehicleTypes: ['swarmbot'],
    trigger: {
      type: 'threshold',
      condition: 'zone_imbalance > 40%'
    },
    description: 'Significant swarm imbalance detected. Zone A has high demand, Zone B oversupplied.',
    aiConfidence: 76,
    options: [
      {
        id: 'auto-rebalance',
        label: 'Auto Rebalance',
        description: 'Migrate bots from Zone B to Zone A',
        recommended: true,
        ifChosen: '4 bots relocated, 5 min migration time',
        effect: { action: 'rebalance_swarm', count: 4 }
      },
      {
        id: 'pod-dispatch',
        label: 'Pod Dispatch',
        description: 'Send pod to transport multiple bots',
        recommended: false,
        ifChosen: 'Faster migration, pod diverted from delivery',
        effect: { action: 'pod_transport' }
      },
      {
        id: 'ignore',
        label: 'Maintain Current',
        description: 'Keep current distribution',
        recommended: false,
        ifChosen: 'Zone A deliveries delayed up to 10 min',
        effect: { action: 'none' }
      }
    ]
  },

  // ============================================================================
  // NEW SCENARIOS
  // ============================================================================

  [SCENARIO_TYPES.CORRIDOR_CONFLICT]: {
    id: 'corridor_conflict',
    title: 'Corridor Conflict',
    icon: 'AlertTriangle',
    color: '#f97316',
    bgGradient: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(0,0,0,0.3) 100%)',
    timer: 20,
    vehicleTypes: ['drone'],
    trigger: {
      type: 'state',
      condition: 'drones_in_corridor > threshold'
    },
    description: 'Multiple drones converging on same flight corridor. Risk of collision or airspace congestion.',
    aiConfidence: 91,
    options: [
      {
        id: 'stagger',
        label: 'Stagger Entry',
        description: 'Delay lower-priority drones at corridor entry',
        recommended: true,
        ifChosen: '3 drones held for 30s each, safe separation maintained',
        effect: { action: 'stagger_corridor', delay: 30 }
      },
      {
        id: 'altitude-split',
        label: 'Altitude Split',
        description: 'Route drones to different altitude layers',
        recommended: false,
        ifChosen: 'Drones split to 50m, 75m, 100m layers, slight efficiency loss',
        effect: { action: 'altitude_split', layers: [50, 75, 100] }
      },
      {
        id: 'reroute',
        label: 'Reroute All',
        description: 'Send all drones to alternate corridors',
        recommended: false,
        ifChosen: 'Longer routes, 5-8 min added per drone',
        effect: { action: 'reroute_all' }
      }
    ]
  },

  [SCENARIO_TYPES.MULTI_HUB_ROUTING]: {
    id: 'multi_hub_routing',
    title: 'Multi-Hub Optimization',
    icon: 'Network',
    color: '#06b6d4',
    bgGradient: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(0,0,0,0.3) 100%)',
    timer: 45,
    vehicleTypes: ['drone', 'pod', 'swarmbot'],
    trigger: {
      type: 'optimization',
      condition: 'efficiency_gain > 15%'
    },
    description: 'AI detected more efficient routing using alternate hub configuration. 18% efficiency improvement possible.',
    aiConfidence: 84,
    options: [
      {
        id: 'accept',
        label: 'Accept Optimization',
        description: 'Migrate to new hub routing configuration',
        recommended: true,
        ifChosen: '12 vehicles rerouted, 18% efficiency gain, 3 min transition',
        effect: { action: 'apply_routing', config: 'optimized' }
      },
      {
        id: 'partial',
        label: 'Partial Apply',
        description: 'Apply only to new dispatches, current vehicles continue',
        recommended: false,
        ifChosen: 'Gradual transition, 10% efficiency gain initially',
        effect: { action: 'apply_routing', config: 'partial' }
      },
      {
        id: 'reject',
        label: 'Keep Current',
        description: 'Maintain existing hub assignments',
        recommended: false,
        ifChosen: 'No change, miss optimization opportunity',
        effect: { action: 'none' }
      }
    ]
  },

  [SCENARIO_TYPES.SWARM_FORMATION_BREAKDOWN]: {
    id: 'swarm_formation_breakdown',
    title: 'Swarm Formation Breakdown',
    icon: 'Bot',
    color: '#ec4899',
    bgGradient: 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(0,0,0,0.3) 100%)',
    timer: 25,
    vehicleTypes: ['swarmbot'],
    trigger: {
      type: 'state',
      condition: 'swarm_communication_loss'
    },
    description: 'SwarmBots lost communication with formation leader. 4 bots operating independently.',
    aiConfidence: 68,
    options: [
      {
        id: 'elect-leader',
        label: 'Elect New Leader',
        description: 'Trigger leader election among remaining bots',
        recommended: true,
        ifChosen: 'Bot SB-07 elected leader, formation restored in 45s',
        effect: { action: 'elect_leader' }
      },
      {
        id: 'recall',
        label: 'Recall to Hub',
        description: 'Return all bots to nearest hub for resync',
        recommended: false,
        ifChosen: 'Safe option, 8 min downtime, full system restart',
        effect: { action: 'recall_swarm' }
      },
      {
        id: 'independent',
        label: 'Continue Independent',
        description: 'Let bots complete current tasks independently',
        recommended: false,
        ifChosen: 'Risk of redundant coverage, efficiency drops 25%',
        effect: { action: 'none' }
      }
    ]
  },

  [SCENARIO_TYPES.INTERCITY_TRUCK_COORD]: {
    id: 'intercity_truck_coord',
    title: 'Intercity Truck Arrival',
    icon: 'Truck',
    color: '#22c55e',
    bgGradient: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(0,0,0,0.3) 100%)',
    timer: 60,
    vehicleTypes: ['pod', 'swarmbot'],
    trigger: {
      type: 'external',
      condition: 'truck_eta < 30min'
    },
    description: 'Intercity delivery truck arriving at Hub A in 25 minutes. 48 packages for local distribution.',
    aiConfidence: 92,
    options: [
      {
        id: 'preposition',
        label: 'Preposition Fleet',
        description: 'Move pods and swarm bots to Hub A in advance',
        recommended: true,
        ifChosen: '6 pods, 12 bots repositioned, ready for immediate dispatch',
        effect: { action: 'preposition', hub: 'A', pods: 6, bots: 12 }
      },
      {
        id: 'staged',
        label: 'Staged Response',
        description: 'Dispatch vehicles as packages are unloaded',
        recommended: false,
        ifChosen: 'Lower initial capacity, gradual ramp-up over 15 min',
        effect: { action: 'staged_response' }
      },
      {
        id: 'redistribute',
        label: 'Redistribute Load',
        description: 'Split packages across multiple hubs',
        recommended: false,
        ifChosen: 'Truck visits 3 hubs, adds 40 min to total distribution',
        effect: { action: 'redistribute_truck', hubs: ['A', 'B', 'C'] }
      }
    ]
  },

  [SCENARIO_TYPES.PACKAGE_PRIORITY_CONFLICT]: {
    id: 'package_priority_conflict',
    title: 'Priority Conflict',
    icon: 'Star',
    color: '#eab308',
    bgGradient: 'linear-gradient(135deg, rgba(234,179,8,0.15) 0%, rgba(0,0,0,0.3) 100%)',
    timer: 30,
    vehicleTypes: ['drone', 'pod'],
    trigger: {
      type: 'state',
      condition: 'emergency_packages > 1'
    },
    description: 'Two EMERGENCY priority packages competing for same drone. Medical sample and organ transport.',
    aiConfidence: 62,
    options: [
      {
        id: 'medical-first',
        label: 'Organ Transport First',
        description: 'Time-critical organ delivery takes absolute priority',
        recommended: true,
        ifChosen: 'Organ delivered in 12 min, sample delayed 20 min',
        effect: { action: 'prioritize', package: 'organ' }
      },
      {
        id: 'sample-first',
        label: 'Medical Sample First',
        description: 'Lab is closer, deliver sample first',
        recommended: false,
        ifChosen: 'Sample delivered in 8 min, organ delayed 15 min',
        effect: { action: 'prioritize', package: 'sample' }
      },
      {
        id: 'split-fleet',
        label: 'Dispatch Both',
        description: 'Send two separate drones immediately',
        recommended: false,
        ifChosen: 'Both delivered optimally, but reduces fleet coverage 20%',
        effect: { action: 'dispatch_both' }
      }
    ]
  },

  [SCENARIO_TYPES.HUB_POWER_GRID]: {
    id: 'hub_power_grid',
    title: 'Hub Power Issue',
    icon: 'Zap',
    color: '#a855f7',
    bgGradient: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(0,0,0,0.3) 100%)',
    timer: 25,
    vehicleTypes: ['drone', 'pod', 'swarmbot'],
    trigger: {
      type: 'hardware',
      condition: 'ek3_module_fault'
    },
    description: 'EK3 charging module fault at Hub B. Charging capacity reduced 40%. V2G compensation available.',
    aiConfidence: 88,
    options: [
      {
        id: 'v2g-compensate',
        label: 'V2G Compensation',
        description: 'Draw power from parked pods to maintain charging',
        recommended: true,
        ifChosen: '3 pods provide V2G, charging capacity at 85%',
        effect: { action: 'v2g_enable', pods: 3 }
      },
      {
        id: 'redistribute-load',
        label: 'Redistribute Load',
        description: 'Send low-battery vehicles to other hubs',
        recommended: false,
        ifChosen: '8 vehicles rerouted, adds 5-10 min per vehicle',
        effect: { action: 'redistribute_charging' }
      },
      {
        id: 'reduced-ops',
        label: 'Reduced Operations',
        description: 'Accept lower charging capacity, slow operations',
        recommended: false,
        ifChosen: 'Fleet capacity drops 30% until repair',
        effect: { action: 'accept_degraded' }
      }
    ]
  }
};

// Helper to get scenario by type
export const getScenarioConfig = (type) => SCENARIO_CONFIG[type];

// Get all scenario types
export const getAllScenarioTypes = () => Object.values(SCENARIO_TYPES);

// Get scenarios by category
export const getOriginalScenarios = () => [
  SCENARIO_TYPES.WEATHER_ALERT,
  SCENARIO_TYPES.HANDOFF_FAILURE,
  SCENARIO_TYPES.PRIORITY_OVERRIDE,
  SCENARIO_TYPES.HUB_CONGESTION,
  SCENARIO_TYPES.EMERGENCY_LANDING,
  SCENARIO_TYPES.SWARM_REBALANCE
].map(type => SCENARIO_CONFIG[type]);

export const getNewScenarios = () => [
  SCENARIO_TYPES.CORRIDOR_CONFLICT,
  SCENARIO_TYPES.MULTI_HUB_ROUTING,
  SCENARIO_TYPES.SWARM_FORMATION_BREAKDOWN,
  SCENARIO_TYPES.INTERCITY_TRUCK_COORD,
  SCENARIO_TYPES.PACKAGE_PRIORITY_CONFLICT,
  SCENARIO_TYPES.HUB_POWER_GRID
].map(type => SCENARIO_CONFIG[type]);

// Generate a random scenario for demo
export const generateRandomScenario = (vehicles, currentScenarios = []) => {
  // Don't generate if we already have 2 active scenarios
  if (currentScenarios.length >= 2) return null;

  // Random chance to generate
  if (Math.random() > 0.001) return null;

  const types = Object.keys(SCENARIO_CONFIG);
  const type = types[Math.floor(Math.random() * types.length)];
  const config = SCENARIO_CONFIG[type];

  // Find a matching vehicle
  const eligibleVehicles = vehicles.filter(v =>
    config.vehicleTypes.includes(v.type)
  );

  if (eligibleVehicles.length === 0) return null;

  const vehicle = eligibleVehicles[Math.floor(Math.random() * eligibleVehicles.length)];

  return {
    id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    vehicleId: vehicle.id,
    vehicleType: vehicle.type,
    createdAt: Date.now(),
    expiresAt: Date.now() + (config.timer * 1000),
    status: 'pending',
    config
  };
};

// Check if scenario should trigger based on vehicle state
export const checkScenarioTriggers = (vehicle, type) => {
  const config = SCENARIO_CONFIG[type];
  if (!config) return false;

  switch (type) {
    case SCENARIO_TYPES.EMERGENCY_LANDING:
      return vehicle.type === 'drone' && (vehicle.batteryLevel ?? vehicle.batterySoc ?? 100) < 12;

    case SCENARIO_TYPES.WEATHER_ALERT:
      return vehicle.type === 'drone' && Math.random() < 0.0001;

    case SCENARIO_TYPES.HUB_CONGESTION:
      return Math.random() < 0.00005;

    case SCENARIO_TYPES.SWARM_REBALANCE:
      return vehicle.type === 'swarmbot' && Math.random() < 0.0001;

    case SCENARIO_TYPES.CORRIDOR_CONFLICT:
      return vehicle.type === 'drone' && Math.random() < 0.00005;

    case SCENARIO_TYPES.SWARM_FORMATION_BREAKDOWN:
      return vehicle.type === 'swarmbot' && Math.random() < 0.00003;

    case SCENARIO_TYPES.HUB_POWER_GRID:
      return Math.random() < 0.00002;

    default:
      return false;
  }
};

export default SCENARIO_CONFIG;
