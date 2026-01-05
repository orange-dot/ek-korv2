package types

// DeliveryVehicleType represents delivery vehicle types
type DeliveryVehicleType string

const (
	VehiclePod      DeliveryVehicleType = "pod"      // Nuro-style ground delivery
	VehicleDrone    DeliveryVehicleType = "drone"    // Quadcopter aerial delivery
	VehicleSwarmBot DeliveryVehicleType = "swarmbot" // Sidewalk micro-delivery robot
)

// DeliveryState represents vehicle state
type DeliveryState string

const (
	// Common states
	DeliveryStateIdle     DeliveryState = "idle"
	DeliveryStateCharging DeliveryState = "charging"
	DeliveryStateSwapping DeliveryState = "swapping"

	// Movement states
	DeliveryStateEnRoute  DeliveryState = "en_route"
	DeliveryStateArriving DeliveryState = "arriving"

	// Drone specific
	DeliveryStateFlying    DeliveryState = "flying"
	DeliveryStateLanding   DeliveryState = "landing"
	DeliveryStateHovering  DeliveryState = "hovering"
	DeliveryStateTakingOff DeliveryState = "taking_off"

	// Handoff states
	DeliveryStateHandoffWaiting DeliveryState = "handoff_waiting"
	DeliveryStateHandoffActive  DeliveryState = "handoff_active"

	// SwarmBot specific
	DeliveryStateSwarming   DeliveryState = "swarming"
	DeliveryStateDelivering DeliveryState = "delivering"
	DeliveryStateReturning  DeliveryState = "returning"

	// Pod specific
	DeliveryStateLoading     DeliveryState = "loading"
	DeliveryStateUnloading   DeliveryState = "unloading"
	DeliveryStateDispatching DeliveryState = "dispatching"
)

// DeliveryPriority represents delivery urgency
type DeliveryPriority string

const (
	PriorityStandard  DeliveryPriority = "standard"  // Regular delivery
	PriorityExpress   DeliveryPriority = "express"   // 2hr guarantee
	PriorityPriority  DeliveryPriority = "priority"  // 1hr, hub queue skip
	PriorityEmergency DeliveryPriority = "emergency" // Medical/urgent, instant
)

// HubType represents hub types
type HubType string

const (
	HubTypeRooftop HubType = "rooftop_hub"   // Drone landing/charging
	HubTypeStreet  HubType = "street_hub"    // Pod/SwarmBot charging
	HubTypeHandoff HubType = "handoff_point" // Package transfer location
)

// Drone represents an aerial delivery drone
type Drone struct {
	ID         string              `json:"id"`
	State      DeliveryState       `json:"state"`
	Position   Position            `json:"position"`
	Altitude   float64             `json:"altitude"`   // meters
	Speed      float64             `json:"speed"`      // m/s
	Heading    float64             `json:"heading"`    // degrees
	BatterySOC float64             `json:"batterySoc"` // 0-100
	PackageID  string              `json:"packageId,omitempty"`
	CorridorID string              `json:"corridorId,omitempty"`
	HomeHubID  string              `json:"homeHubId"`
	TargetPos  *Position           `json:"targetPos,omitempty"`
	RouteIndex int                 `json:"routeIndex"`
}

// DeliveryPod represents a ground delivery pod (Nuro-style)
type DeliveryPod struct {
	ID           string              `json:"id"`
	State        DeliveryState       `json:"state"`
	Position     Position            `json:"position"`
	Speed        float64             `json:"speed"`        // km/h
	Heading      float64             `json:"heading"`      // degrees
	BatterySOC   float64             `json:"batterySoc"`   // 0-100
	Capacity     int                 `json:"capacity"`     // Package slots
	PackageIDs   []string            `json:"packageIds"`   // Current packages
	SwarmBotIDs  []string            `json:"swarmBotIds"`  // Attached swarm bots
	RouteID      string              `json:"routeId,omitempty"`
	HomeHubID    string              `json:"homeHubId"`
	RouteIndex   int                 `json:"routeIndex"`
}

// SwarmBot represents a sidewalk delivery robot
type SwarmBot struct {
	ID         string              `json:"id"`
	State      DeliveryState       `json:"state"`
	Position   Position            `json:"position"`
	Speed      float64             `json:"speed"`      // m/s
	Heading    float64             `json:"heading"`    // degrees
	BatterySOC float64             `json:"batterySoc"` // 0-100
	PackageID  string              `json:"packageId,omitempty"`
	ParentPodID string             `json:"parentPodId,omitempty"`
	HomeHubID  string              `json:"homeHubId"`
	TargetPos  *Position           `json:"targetPos,omitempty"`
	ZoneID     string              `json:"zoneId,omitempty"`
}

// DeliveryHub represents a charging/staging hub
type DeliveryHub struct {
	ID            string   `json:"id"`
	Name          string   `json:"name"`
	Type          HubType  `json:"type"`
	Position      Position `json:"position"`
	Capacity      int      `json:"capacity"`      // Charging slots
	Occupied      int      `json:"occupied"`      // Currently charging
	QueueLength   int      `json:"queueLength"`   // Waiting vehicles
	ChargingPower float64  `json:"chargingPower"` // kW available
	AvgWaitTime   float64  `json:"avgWaitTime"`   // minutes
}

// Package represents a delivery package
type Package struct {
	ID          string           `json:"id"`
	Priority    DeliveryPriority `json:"priority"`
	Origin      Position         `json:"origin"`
	Destination Position         `json:"destination"`
	Weight      float64          `json:"weight"`     // kg
	Size        string           `json:"size"`       // small/medium/large
	Status      string           `json:"status"`     // pending/assigned/in_transit/delivered
	VehicleID   string           `json:"vehicleId,omitempty"`
	VehicleType DeliveryVehicleType `json:"vehicleType,omitempty"`
	CreatedAt   int64            `json:"createdAt"`  // Unix timestamp
	DeliveredAt int64            `json:"deliveredAt,omitempty"`
	ETAMinutes  float64          `json:"etaMinutes,omitempty"`
}

// DroneCorridort defines a drone flight corridor
type DroneCorridor struct {
	ID         string     `json:"id"`
	Name       string     `json:"name"`
	Waypoints  []Position `json:"waypoints"`
	Altitude   float64    `json:"altitude"`   // meters
	Width      float64    `json:"width"`      // meters
	SpeedLimit float64    `json:"speedLimit"` // m/s
}

// PodRoute defines a pod route
type PodRoute struct {
	ID        string     `json:"id"`
	Name      string     `json:"name"`
	Waypoints []Position `json:"waypoints"`
	Length    float64    `json:"length"` // km
}

// SwarmZone defines a swarmbot operating zone
type SwarmZone struct {
	ID      string     `json:"id"`
	Name    string     `json:"name"`
	Center  Position   `json:"center"`
	Radius  float64    `json:"radius"` // meters
	HubID   string     `json:"hubId"`
}

// DeliveryMetrics holds delivery system metrics
type DeliveryMetrics struct {
	// Counts
	TotalDrones    int `json:"totalDrones"`
	ActiveDrones   int `json:"activeDrones"`
	TotalPods      int `json:"totalPods"`
	ActivePods     int `json:"activePods"`
	TotalSwarmBots int `json:"totalSwarmBots"`
	ActiveSwarmBots int `json:"activeSwarmBots"`

	// Deliveries
	PendingDeliveries   int     `json:"pendingDeliveries"`
	InTransitDeliveries int     `json:"inTransitDeliveries"`
	CompletedDeliveries int     `json:"completedDeliveries"`
	AvgDeliveryTime     float64 `json:"avgDeliveryTime"`     // minutes

	// Battery
	AvgDroneSOC    float64 `json:"avgDroneSOC"`
	AvgPodSOC      float64 `json:"avgPodSOC"`
	AvgSwarmBotSOC float64 `json:"avgSwarmBotSOC"`
	ChargingCount  int     `json:"chargingCount"`

	// Efficiency
	FleetUtilization float64 `json:"fleetUtilization"` // 0-100
	HandoffSuccessRate float64 `json:"handoffSuccessRate"` // 0-100
}

// DeliverySimulationState holds complete delivery simulation state
type DeliverySimulationState struct {
	Running   bool              `json:"running"`
	SimTime   int64             `json:"simTime"`   // Unix timestamp
	TimeScale float64           `json:"timeScale"`
	Drones    []Drone           `json:"drones"`
	Pods      []DeliveryPod     `json:"pods"`
	SwarmBots []SwarmBot        `json:"swarmBots"`
	Hubs      []DeliveryHub     `json:"hubs"`
	Packages  []Package         `json:"packages"`
	Corridors []DroneCorridor   `json:"corridors"`
	Routes    []PodRoute        `json:"routes"`
	Zones     []SwarmZone       `json:"zones"`
	Metrics   DeliveryMetrics   `json:"metrics"`
}

// Event types for delivery pub/sub
const (
	EventDeliveryState    = "delivery:state"
	EventDroneUpdate      = "delivery:drone"
	EventPodUpdate        = "delivery:pod"
	EventSwarmBotUpdate   = "delivery:swarmbot"
	EventHubUpdate        = "delivery:hub"
	EventPackageUpdate    = "delivery:package"
	EventDeliveryMetrics  = "delivery:metrics"
	EventDeliveryControl  = "delivery:control"
)

// DeliveryControlCommand represents control commands for delivery simulation
type DeliveryControlCommand struct {
	Action    string  `json:"action"`    // start, stop, pause, addPackage, dispatchDrone
	VehicleID string  `json:"vehicleId,omitempty"`
	PackageID string  `json:"packageId,omitempty"`
	HubID     string  `json:"hubId,omitempty"`
	Priority  string  `json:"priority,omitempty"`
	Origin    *Position `json:"origin,omitempty"`
	Destination *Position `json:"destination,omitempty"`
}
