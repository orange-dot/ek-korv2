/**
 * LA Delivery Decision Scenarios
 * Human-in-the-loop decision system for autonomous delivery fleet
 */

// Scenario types
export const SCENARIO_TYPES = {
  WEATHER_ALERT: 'weather_alert',
  HANDOFF_FAILURE: 'handoff_failure',
  PRIORITY_OVERRIDE: 'priority_override',
  HUB_CONGESTION: 'hub_congestion',
  EMERGENCY_LANDING: 'emergency_landing',
  SWARM_REBALANCE: 'swarm_rebalance'
};

// Scenario configurations
export const SCENARIO_CONFIG = {
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
      probability: 0.002, // per frame
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
  }
};

// Helper to get scenario by type
export const getScenarioConfig = (type) => SCENARIO_CONFIG[type];

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
      return vehicle.type === 'drone' && vehicle.batteryLevel < 12;

    case SCENARIO_TYPES.WEATHER_ALERT:
      return vehicle.type === 'drone' && Math.random() < 0.0001;

    case SCENARIO_TYPES.HUB_CONGESTION:
      return Math.random() < 0.00005;

    case SCENARIO_TYPES.SWARM_REBALANCE:
      return vehicle.type === 'swarmbot' && Math.random() < 0.0001;

    default:
      return false;
  }
};

export default SCENARIO_CONFIG;
