package types

import "time"

// EntityType represents different entity types in the simulation
type EntityType string

const (
	EntityModule      EntityType = "module"
	EntityRack        EntityType = "rack"
	EntityBus         EntityType = "bus"
	EntityStation     EntityType = "station"
	EntityRobot       EntityType = "robot"
	EntityGrid        EntityType = "grid"
	EntityFleet       EntityType = "fleet"
	EntityBatteryPack EntityType = "battery_pack"
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

// BatteryPackType represents battery pack model
type BatteryPackType string

const (
	BatteryPackTypeEKBAT25  BatteryPackType = "EK-BAT-25"  // 25 kWh, van
	BatteryPackTypeEKBAT50  BatteryPackType = "EK-BAT-50"  // 50 kWh, city bus
	BatteryPackTypeEKBAT100 BatteryPackType = "EK-BAT-100" // 100 kWh, truck
)

// BatteryPackState represents battery pack state
type BatteryPackState string

const (
	BatteryPackStateIdle        BatteryPackState = "idle"
	BatteryPackStateCharging    BatteryPackState = "charging"
	BatteryPackStateDischarging BatteryPackState = "discharging"
	BatteryPackStateSwapping    BatteryPackState = "swapping"
	BatteryPackStateBalancing   BatteryPackState = "balancing"
	BatteryPackStateFaulted     BatteryPackState = "faulted"
)

// BatteryPack represents an EK-BAT swappable battery pack
type BatteryPack struct {
	ID              string           `json:"id"`
	Type            string           `json:"type"`            // Pack type string from spec
	State           BatteryPackState `json:"state"`
	Location        string           `json:"location"`        // "vehicle:bus-001" or "station:station-001"
	SlotIndex       int              `json:"slotIndex"`       // Position in rack or vehicle

	// Capacity and energy
	CapacityKWh     float64 `json:"capacityKwh"`     // kWh nominal
	SOC             float64 `json:"soc"`             // 0-100%
	SOH             float64 `json:"soh"`             // 0-100%

	// Electrical
	Voltage         float64 `json:"voltage"`         // V (pack voltage)
	Current         float64 `json:"current"`         // A (+ = discharge)
	Power           float64 `json:"power"`           // W
	MaxChargePower  float64 `json:"maxChargePower"`  // W (current limit)
	MaxDischargePower float64 `json:"maxDischargePower"` // W

	// Thermal
	Temperature     float64 `json:"temperature"`     // °C average cell temp
	CellTempMin     float64 `json:"cellTempMin"`     // °C coldest cell
	CellTempMax     float64 `json:"cellTempMax"`     // °C hottest cell
	CoolantTemp     float64 `json:"coolantTemp"`     // °C
	CoolingActive   bool    `json:"coolingActive"`
	HeaterActive    bool    `json:"heaterActive"`

	// Cell balance
	CellVoltageMin  float64 `json:"cellVoltageMin"`  // V
	CellVoltageMax  float64 `json:"cellVoltageMax"`  // V
	CellImbalance   float64 `json:"cellImbalance"`   // mV max spread
	BalancingActive bool    `json:"balancingActive"`

	// Statistics
	CycleCount      int     `json:"cycleCount"`      // Full equivalent cycles
	EnergyIn        float64 `json:"energyIn"`        // kWh lifetime charged
	EnergyOut       float64 `json:"energyOut"`       // kWh lifetime discharged
	OperatingHours  float64 `json:"operatingHours"`
	LastSwapTime    string  `json:"lastSwapTime"`    // ISO timestamp

	// Health & status
	IsHealthy       bool    `json:"isHealthy"`
	BMSOnline       bool    `json:"bmsOnline"`
	ContactorClosed bool    `json:"contactorClosed"`
	FaultCode       uint32  `json:"faultCode"`
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
	EventSimState         = "sim:state"
	EventModuleState      = "sim:module"
	EventBusState         = "sim:bus"
	EventStationState     = "sim:station"
	EventRobotState       = "sim:robot"
	EventGridState        = "sim:grid"
	EventBatteryPackState = "sim:battery_pack"
	EventAlert            = "sim:alert"
	EventControl          = "sim:control" // Control commands from API
	EventMetrics          = "sim:metrics" // Aggregated metrics for dashboard
)

// ControlCommand represents a control command from the API
type ControlCommand struct {
	Action    string  `json:"action"`             // start, stop, pause, resume, setTimeScale, injectFault, triggerV2G
	Value     float64 `json:"value,omitempty"`    // For setTimeScale
	ModuleID  string  `json:"moduleId,omitempty"` // For injectFault, setModulePower
	FaultType int     `json:"faultType,omitempty"` // For injectFault
	Severity  float64 `json:"severity,omitempty"` // For injectFault
	Power     float64 `json:"power,omitempty"`    // For setModulePower
	RackID    string  `json:"rackId,omitempty"`   // For distributeRackPower
	BusID     string  `json:"busId,omitempty"`    // For queueBusForSwap
	StationID string  `json:"stationId,omitempty"` // For queueBusForSwap
	Frequency float64 `json:"frequency,omitempty"` // For triggerV2G (grid frequency)
}

// SimulationMetrics represents aggregated metrics for demo/pitch
type SimulationMetrics struct {
	// Time
	SimulatedHours   float64 `json:"simulatedHours"`
	RealTimeSeconds  float64 `json:"realTimeSeconds"`

	// Uptime & Reliability
	SystemUptime     float64 `json:"systemUptime"`      // 0-100%
	ModuleUptime     float64 `json:"moduleUptime"`      // Average module uptime %
	FaultsDetected   int     `json:"faultsDetected"`
	FaultsRecovered  int     `json:"faultsRecovered"`
	MTBFHours        float64 `json:"mtbfHours"`         // Mean time between failures
	MTTRMinutes      float64 `json:"mttrMinutes"`       // Mean time to repair

	// Efficiency
	AvgEfficiency    float64 `json:"avgEfficiency"`     // 0-100%
	PeakEfficiency   float64 `json:"peakEfficiency"`
	TotalEnergyKWh   float64 `json:"totalEnergyKwh"`
	EnergyLossKWh    float64 `json:"energyLossKwh"`

	// Cost Savings (vs traditional)
	ModulesReplaced  int     `json:"modulesReplaced"`
	DowntimeMinutes  float64 `json:"downtimeMinutes"`
	DowntimeAvoided  float64 `json:"downtimeAvoided"`   // Minutes saved by hot-swap
	CostSavingsUSD   float64 `json:"costSavingsUsd"`    // Estimated savings

	// Fleet Performance
	BusesCharged     int     `json:"busesCharged"`
	SwapsCompleted   int     `json:"swapsCompleted"`
	AvgChargeTimeMin float64 `json:"avgChargeTimeMin"`
	AvgSwapTimeSec   float64 `json:"avgSwapTimeSec"`
	FleetSOC         float64 `json:"fleetSoc"`          // Average fleet SoC

	// V2G Performance
	V2GEventsCount   int     `json:"v2gEventsCount"`
	V2GEnergyKWh     float64 `json:"v2gEnergyKwh"`      // Energy exported to grid
	V2GRevenueUSD    float64 `json:"v2gRevenueUsd"`
	GridFreqMin      float64 `json:"gridFreqMin"`       // Minimum frequency seen
	GridFreqMax      float64 `json:"gridFreqMax"`       // Maximum frequency seen

	// Swarm Intelligence
	LoadBalanceScore float64 `json:"loadBalanceScore"`  // 0-100 (100 = perfect distribution)
	ThermalBalance   float64 `json:"thermalBalance"`    // Temperature spread across modules
	RedundancyLevel  float64 `json:"redundancyLevel"`   // Available spare capacity %
}
