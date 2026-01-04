package types

import "time"

// EntityType represents different entity types in the simulation
type EntityType string

const (
	EntityModule  EntityType = "module"
	EntityRack    EntityType = "rack"
	EntityBus     EntityType = "bus"
	EntityStation EntityType = "station"
	EntityRobot   EntityType = "robot"
	EntityGrid    EntityType = "grid"
	EntityFleet   EntityType = "fleet"
)

// ModuleState represents the state of an EK3 module
type ModuleState string

const (
	ModuleStateInit               ModuleState = "init"
	ModuleStateIdle               ModuleState = "idle"
	ModuleStateCharging           ModuleState = "charging"
	ModuleStateV2G                ModuleState = "v2g"
	ModuleStateThermalLimiting    ModuleState = "thermal_limiting"
	ModuleStateFaulted            ModuleState = "faulted"
	ModuleStateMarkedForReplace   ModuleState = "marked_for_replacement"
)

// Module represents an EK3 3.3kW power module
type Module struct {
	ID           string      `json:"id"`
	RackID       string      `json:"rackId"`
	SlotIndex    int         `json:"slotIndex"`
	State        ModuleState `json:"state"`
	PowerOut     float64     `json:"powerOut"`     // W (0-3600)
	Voltage      float64     `json:"voltage"`      // V (50-500)
	Current      float64     `json:"current"`      // A
	TempJunction float64     `json:"tempJunction"` // °C
	TempHeatsink float64     `json:"tempHeatsink"` // °C
	TempAmbient  float64     `json:"tempAmbient"`  // °C
	ESRRatio     float64     `json:"esrRatio"`     // 1.0 = healthy
	RdsOnRatio   float64     `json:"rdsOnRatio"`   // 1.0 = healthy
	Efficiency   float64     `json:"efficiency"`   // 0.0-1.0
	OperatingHrs float64     `json:"operatingHrs"`
	PowerCycles  int         `json:"powerCycles"`
	Health       float64     `json:"health"`   // 0-100
	RULHours     float64     `json:"rulHours"` // Remaining useful life
}

// RackState represents the state of a rack
type RackState string

const (
	RackStateOffline   RackState = "offline"
	RackStateStandby   RackState = "standby"
	RackStateActive    RackState = "active"
	RackStateDegraded  RackState = "degraded"
	RackStateFaulted   RackState = "faulted"
)

// Rack represents a rack of 84 EK3 modules
type Rack struct {
	ID            string    `json:"id"`
	StationID     string    `json:"stationId"`
	State         RackState `json:"state"`
	ModuleCount   int       `json:"moduleCount"`
	ActiveModules int       `json:"activeModules"`
	TotalPower    float64   `json:"totalPower"`   // W
	MaxPower      float64   `json:"maxPower"`     // W (277000 for 84 modules)
	Efficiency    float64   `json:"efficiency"`   // aggregate
	TempAvg       float64   `json:"tempAvg"`      // °C average
}

// BusState represents the state of an electric bus
type BusState string

const (
	BusStateParked    BusState = "parked"
	BusStateDriving   BusState = "driving"
	BusStateAtStop    BusState = "at_stop"
	BusStateCharging  BusState = "charging"
	BusStateSwapping  BusState = "swapping"
	BusStateWaiting   BusState = "waiting"
)

// Bus represents an electric bus
type Bus struct {
	ID            string   `json:"id"`
	RouteID       string   `json:"routeId"`
	State         BusState `json:"state"`
	BatterySOC    float64  `json:"batterySoc"`    // 0-100%
	BatteryCapKWh float64  `json:"batteryCapKwh"` // kWh
	BatteryVoltage float64 `json:"batteryVoltage"` // V
	Position      Position `json:"position"`
	Speed         float64  `json:"speed"`       // km/h
	NextStationID string   `json:"nextStationId"`
	ETAMinutes    float64  `json:"etaMinutes"`
}

// Position represents GPS coordinates
type Position struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

// StationState represents swap station state
type StationState string

const (
	StationStateOffline    StationState = "offline"
	StationStateIdle       StationState = "idle"
	StationStateIdentifying StationState = "identifying"
	StationStatePreparing  StationState = "preparing"
	StationStateSwapping   StationState = "swapping"
	StationStateVerifying  StationState = "verifying"
)

// Station represents a swap station
type Station struct {
	ID           string       `json:"id"`
	Name         string       `json:"name"`
	Position     Position     `json:"position"`
	State        StationState `json:"state"`
	RackCount    int          `json:"rackCount"`
	ModuleInventory int       `json:"moduleInventory"` // spare modules
	BusQueue     []string     `json:"busQueue"`        // bus IDs waiting
	CurrentBusID string       `json:"currentBusId"`
}

// RobotType represents robot type
type RobotType string

const (
	RobotTypeBattery RobotType = "battery"  // Robot A - battery swap
	RobotTypeModule  RobotType = "module"   // Robot B - module swap
)

// RobotState represents robot state
type RobotState string

const (
	RobotStateIdle        RobotState = "idle"
	RobotStatePositioning RobotState = "positioning"
	RobotStateMoving      RobotState = "moving"
	RobotStateGripping    RobotState = "gripping"
	RobotStateSwapping    RobotState = "swapping"
	RobotStateReturning   RobotState = "returning"
	RobotStateCharging    RobotState = "charging"
	RobotStateFaulted     RobotState = "faulted"
)

// Robot represents a swap robot
type Robot struct {
	ID        string     `json:"id"`
	StationID string     `json:"stationId"`
	Type      RobotType  `json:"type"`
	State     RobotState `json:"state"`
	Progress  float64    `json:"progress"` // 0-100% of current operation
	CycleTime float64    `json:"cycleTime"` // seconds
}

// Grid represents the electrical grid state
type Grid struct {
	Frequency    float64 `json:"frequency"`    // Hz (50 nominal)
	Voltage      float64 `json:"voltage"`      // V (400 nominal)
	LoadDemand   float64 `json:"loadDemand"`   // W
	V2GEnabled   bool    `json:"v2gEnabled"`
	V2GPower     float64 `json:"v2gPower"`     // W (negative = export to grid)
}

// SimulationState represents the overall simulation state
type SimulationState struct {
	Running    bool      `json:"running"`
	Paused     bool      `json:"paused"`
	SimTime    time.Time `json:"simTime"`
	RealTime   time.Time `json:"realTime"`
	TimeScale  float64   `json:"timeScale"`  // 1-1000
	TickCount  int64     `json:"tickCount"`

	// Entity counts
	ModuleCount  int `json:"moduleCount"`
	RackCount    int `json:"rackCount"`
	BusCount     int `json:"busCount"`
	StationCount int `json:"stationCount"`

	// Aggregate stats
	TotalPower     float64 `json:"totalPower"`     // W
	AvgEfficiency  float64 `json:"avgEfficiency"`
	AvgBatterySOC  float64 `json:"avgBatterySoc"`
	ActiveCharging int     `json:"activeCharging"` // buses charging
}

// CANMessage represents a CAN-FD message
type CANMessage struct {
	ID          uint32                 `json:"id"`          // 29-bit extended ID
	Priority    uint8                  `json:"priority"`    // 0-15 (0 = highest)
	MessageType string                 `json:"messageType"` // message type name
	SourceID    string                 `json:"sourceId"`
	TargetID    string                 `json:"targetId"`    // "broadcast" for all
	Payload     map[string]interface{} `json:"payload"`     // flexible payload
	Data        []byte                 `json:"data"`        // raw data (up to 64 bytes)
	Timestamp   time.Time              `json:"timestamp"`
}

// Event types for pub/sub
const (
	EventSimState    = "sim:state"
	EventModuleState = "sim:module"
	EventBusState    = "sim:bus"
	EventStationState = "sim:station"
	EventRobotState  = "sim:robot"
	EventGridState   = "sim:grid"
	EventAlert       = "sim:alert"
)
