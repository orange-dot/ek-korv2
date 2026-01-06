package engine

import (
	"fmt"
	"math"
	"math/rand"
	"sync"
	"time"

	"github.com/elektrokombinacija/simulator/internal/battery"
	"github.com/elektrokombinacija/simulator/internal/models"
	"github.com/elektrokombinacija/simulator/pkg/types"
)

// ============================================================================
// Rack - Aggregates EK3 modules with wide striping
// ============================================================================

// Rack represents a rack of 84 EK3 modules
type Rack struct {
	mu   sync.RWMutex
	data types.Rack

	// Module references
	modules []*EK3Module

	// Wide striping config
	stripingConfig models.WideStripingConfig
}

// NewRack creates a new rack
func NewRack(index int, stationID string) *Rack {
	return &Rack{
		data: types.Rack{
			ID:            fmt.Sprintf("rack-%02d", index),
			StationID:     stationID,
			State:         types.RackStateActive,
			ModuleCount:   84,
			ActiveModules: 84,
			TotalPower:    0,
			MaxPower:      277200, // 84 * 3300W
			Efficiency:    0.96,
			TempAvg:       35,
		},
		modules: make([]*EK3Module, 0, 84),
		stripingConfig: models.WideStripingConfig{
			ModuleCount:    84,
			MaxModulePower: 3600,
			MinModulePower: 500,
			SpareModules:   4, // N+4 redundancy
		},
	}
}

// AddModule adds a module to the rack
func (r *Rack) AddModule(m *EK3Module) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.modules = append(r.modules, m)
}

// DistributePower distributes target power across modules using wide striping
func (r *Rack) DistributePower(targetPower float64) {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.stripingConfig.TargetPower = targetPower

	// Find failed modules
	failedIndices := []int{}
	for i, m := range r.modules {
		state := m.GetData().State
		if state == types.ModuleStateFaulted || state == types.ModuleStateMarkedForReplace {
			failedIndices = append(failedIndices, i)
		}
	}

	// Calculate power distribution with sparing
	powers, capacityLoss := models.CalculateDistributedSparing(r.stripingConfig, failedIndices)

	// Apply power to each module
	for i, m := range r.modules {
		if i < len(powers) {
			m.SetTargetPower(powers[i])
		}
	}

	// Update rack state
	r.data.ActiveModules = r.data.ModuleCount - len(failedIndices)
	r.data.MaxPower = float64(r.data.ActiveModules) * 3600 * (1 - capacityLoss)
}

func (r *Rack) ID() string             { return r.data.ID }
func (r *Rack) Type() types.EntityType { return types.EntityRack }
func (r *Rack) State() interface{}     { return r.data }

func (r *Rack) Tick(dt time.Duration) {
	r.mu.Lock()
	defer r.mu.Unlock()

	// Aggregate module statistics
	totalPower := 0.0
	totalTemp := 0.0
	activeCount := 0
	totalEfficiency := 0.0

	for _, m := range r.modules {
		data := m.GetData()
		totalPower += data.PowerOut
		totalTemp += data.TempJunction
		if data.State != types.ModuleStateFaulted && data.State != types.ModuleStateMarkedForReplace {
			activeCount++
			totalEfficiency += data.Efficiency
		}
	}

	r.data.TotalPower = totalPower
	r.data.ActiveModules = activeCount
	if activeCount > 0 {
		r.data.TempAvg = totalTemp / float64(len(r.modules))
		r.data.Efficiency = totalEfficiency / float64(activeCount)
	}

	// Check rack state based on active modules
	if activeCount == 0 {
		r.data.State = types.RackStateFaulted
	} else if activeCount < r.data.ModuleCount-10 {
		r.data.State = types.RackStateDegraded
	} else {
		r.data.State = types.RackStateActive
	}
}

// ============================================================================
// Bus - Electric bus with full battery model
// ============================================================================

// Bus represents an electric bus with battery simulation
type Bus struct {
	mu   sync.RWMutex
	data types.Bus

	// Battery model
	battery *models.BatteryModel

	// Route simulation
	routeProgress   float64
	routeLength     float64
	routeStops      int
	currentStop     int
	stopDuration    float64 // seconds remaining at stop
	consumptionRate float64 // kWh/km

	// Charging session
	chargingStationID string
	chargeStartSoC    float64
	chargeTargetSoC   float64
}

// NewBus creates a new bus with battery model
func NewBus(index int, cityCenter types.Position) *Bus {
	routes := []string{"31", "52", "65", "83", "95"}
	routeLengths := []float64{15, 22, 18, 25, 20} // km

	routeIdx := index % len(routes)
	initialSoC := 40 + rand.Float64()*50 // 40-90%

	// Create battery with initial SoC
	batterySpecs := models.DefaultBusBatterySpecs()
	battery := models.NewBatteryModel(batterySpecs, initialSoC)

	// Random starting position around city center
	pos := types.Position{
		Lat: cityCenter.Lat - 0.05 + rand.Float64()*0.1,
		Lng: cityCenter.Lng - 0.05 + rand.Float64()*0.1,
	}

	b := &Bus{
		data: types.Bus{
			ID:             fmt.Sprintf("bus-%03d", index),
			RouteID:        routes[routeIdx],
			State:          types.BusStateDriving,
			BatterySOC:     initialSoC,
			BatteryCapKWh:  350,
			BatteryVoltage: battery.GetState().Voltage,
			Position:       pos,
			Speed:          25 + rand.Float64()*20,
			NextStationID:  "station-00",
			ETAMinutes:     10 + rand.Float64()*30,
		},
		battery:         battery,
		routeProgress:   rand.Float64(),
		routeLength:     routeLengths[routeIdx],
		routeStops:      10 + rand.Intn(15), // 10-25 stops
		currentStop:     rand.Intn(10),
		consumptionRate: 1.2 + rand.Float64()*0.4, // 1.2-1.6 kWh/km
	}

	return b
}

func (b *Bus) ID() string             { return b.data.ID }
func (b *Bus) Type() types.EntityType { return types.EntityBus }
func (b *Bus) State() interface{}     { return b.data }

func (b *Bus) Tick(dt time.Duration) {
	b.mu.Lock()
	defer b.mu.Unlock()

	dtSeconds := dt.Seconds()
	dtHours := dtSeconds / 3600.0

	// Update battery temperature based on ambient
	ambientTemp := 15 + 10*math.Sin(float64(time.Now().Hour())*math.Pi/12) // Daily variation
	b.battery.SetTemperature(ambientTemp + 5)

	switch b.data.State {
	case types.BusStateDriving:
		b.tickDriving(dtHours)
	case types.BusStateAtStop:
		b.tickAtStop(dtSeconds)
	case types.BusStateWaiting:
		b.tickWaiting(dtSeconds)
	case types.BusStateCharging:
		b.tickCharging(dtSeconds)
	case types.BusStateSwapping:
		b.tickSwapping(dtSeconds)
	}

	// Update battery-derived values
	batteryState := b.battery.GetState()
	b.data.BatterySOC = batteryState.SoC
	b.data.BatteryVoltage = batteryState.Voltage

	// Update ETA (simplified)
	if b.data.State == types.BusStateDriving {
		remainingKm := b.routeLength * (1 - b.routeProgress)
		if b.data.Speed > 0 {
			b.data.ETAMinutes = remainingKm / b.data.Speed * 60
		}
	}
}

// tickDriving handles driving state
func (b *Bus) tickDriving(dtHours float64) {
	// Calculate distance traveled
	distanceKm := b.data.Speed * dtHours

	// Energy consumption (discharge battery)
	energyUsedWh := distanceKm * b.consumptionRate * 1000
	b.battery.Update(-energyUsedWh, dtHours*3600)

	// Update position along route
	b.routeProgress += distanceKm / b.routeLength

	// Check if reached a stop
	stopInterval := 1.0 / float64(b.routeStops)
	if b.routeProgress > float64(b.currentStop+1)*stopInterval {
		b.currentStop++
		b.data.State = types.BusStateAtStop
		b.stopDuration = 15 + rand.Float64()*45 // 15-60 seconds at stop
	}

	// Loop route
	if b.routeProgress >= 1.0 {
		b.routeProgress = 0
		b.currentStop = 0
	}

	// Speed variation
	b.data.Speed = 20 + rand.Float64()*30 // 20-50 km/h

	// Check if need to charge
	if b.data.BatterySOC < 25 {
		b.data.State = types.BusStateWaiting
	}
}

// tickAtStop handles passenger stop
func (b *Bus) tickAtStop(dtSeconds float64) {
	b.data.Speed = 0
	b.stopDuration -= dtSeconds

	if b.stopDuration <= 0 {
		// Check battery before continuing
		if b.data.BatterySOC < 25 {
			b.data.State = types.BusStateWaiting
		} else {
			b.data.State = types.BusStateDriving
			b.data.Speed = 25 + rand.Float64()*15
		}
	}
}

// tickWaiting handles waiting for charge
func (b *Bus) tickWaiting(dtSeconds float64) {
	b.data.Speed = 0

	// Random chance to enter charging (simulates queue)
	if rand.Float64() < 0.01*dtSeconds {
		b.data.State = types.BusStateCharging
		b.chargeStartSoC = b.data.BatterySOC
		b.chargeTargetSoC = 85 + rand.Float64()*10 // 85-95%
	}
}

// tickCharging handles charging with proper battery model
func (b *Bus) tickCharging(dtSeconds float64) {
	b.data.Speed = 0

	// Get max charge power from battery
	maxPowerW := b.battery.GetMaxChargePower()

	// Update battery state (positive power = charging)
	b.battery.Update(maxPowerW, dtSeconds)

	// Check if reached target
	if b.data.BatterySOC >= b.chargeTargetSoC {
		b.data.State = types.BusStateDriving
		b.data.Speed = 25 + rand.Float64()*15
	}
}

// tickSwapping handles battery swap (controlled by station)
func (b *Bus) tickSwapping(dtSeconds float64) {
	b.data.Speed = 0
	// Swap progress controlled by station/robot
}

// StartCharging initiates a charging session
func (b *Bus) StartCharging(stationID string, targetSoC float64) {
	b.mu.Lock()
	defer b.mu.Unlock()

	b.data.State = types.BusStateCharging
	b.chargingStationID = stationID
	b.chargeStartSoC = b.data.BatterySOC
	b.chargeTargetSoC = targetSoC
}

// StartSwap initiates battery swap
func (b *Bus) StartSwap(stationID string) {
	b.mu.Lock()
	defer b.mu.Unlock()

	b.data.State = types.BusStateSwapping
	b.chargingStationID = stationID
}

// CompleteSwap completes battery swap with new battery
func (b *Bus) CompleteSwap(newSoC float64) {
	b.mu.Lock()
	defer b.mu.Unlock()

	// Create new battery at swapped SoC
	batterySpecs := models.DefaultBusBatterySpecs()
	b.battery = models.NewBatteryModel(batterySpecs, newSoC)
	b.data.State = types.BusStateDriving
	b.data.Speed = 25 + rand.Float64()*15
}

// GetBatteryModel returns battery model for external access
func (b *Bus) GetBatteryModel() *models.BatteryModel {
	return b.battery
}

// ============================================================================
// Station - Full swap station workflow
// ============================================================================

// Station represents a swap station with complete workflow
type Station struct {
	mu   sync.RWMutex
	data types.Station

	// Workflow state
	workflowPhase   StationWorkflowPhase
	phaseStartTime  time.Time
	phaseDuration   float64 // seconds
	phaseProgress   float64 // 0-100%

	// Current operation
	currentBus         *Bus
	batteryRobotState  types.RobotState
	moduleRobotState   types.RobotState
	removedBatterySOC  float64
	replacementBattery float64 // SoC of replacement
}

// StationWorkflowPhase represents workflow phases
type StationWorkflowPhase int

const (
	PhaseIdle StationWorkflowPhase = iota
	PhaseApproach           // Bus approaching and positioning
	PhaseIdentification     // RFID/camera identification
	PhaseBatteryDisconnect  // Disconnect battery connections
	PhaseBatteryRemoval     // Robot A removes depleted battery
	PhaseBatteryInsertion   // Robot A inserts charged battery
	PhaseBatteryConnect     // Connect new battery
	PhaseVerification       // System verification
	PhaseDeparture          // Bus departing
)

// NewStation creates a new station
func NewStation(index int, pos types.Position) *Station {
	return &Station{
		data: types.Station{
			ID:              fmt.Sprintf("station-%02d", index),
			Name:            fmt.Sprintf("Swap Station %d", index+1),
			Position:        pos,
			State:           types.StationStateIdle,
			RackCount:       1,
			ModuleInventory: 12, // Spare modules
			BusQueue:        []string{},
			CurrentBusID:    "",
		},
		workflowPhase:      PhaseIdle,
		replacementBattery: 95, // Start with charged battery
	}
}

func (s *Station) ID() string             { return s.data.ID }
func (s *Station) Type() types.EntityType { return types.EntityStation }
func (s *Station) State() interface{}     { return s.data }

func (s *Station) Tick(dt time.Duration) {
	s.mu.Lock()
	defer s.mu.Unlock()

	dtSeconds := dt.Seconds()

	// Update progress in current phase
	if s.phaseDuration > 0 {
		s.phaseProgress += (100.0 / s.phaseDuration) * dtSeconds
	}

	switch s.workflowPhase {
	case PhaseIdle:
		s.tickIdle()
	case PhaseApproach:
		s.tickApproach()
	case PhaseIdentification:
		s.tickIdentification()
	case PhaseBatteryDisconnect:
		s.tickBatteryDisconnect()
	case PhaseBatteryRemoval:
		s.tickBatteryRemoval()
	case PhaseBatteryInsertion:
		s.tickBatteryInsertion()
	case PhaseBatteryConnect:
		s.tickBatteryConnect()
	case PhaseVerification:
		s.tickVerification()
	case PhaseDeparture:
		s.tickDeparture()
	}
}

func (s *Station) tickIdle() {
	s.data.State = types.StationStateIdle
	if len(s.data.BusQueue) > 0 {
		s.transitionTo(PhaseApproach, 10) // 10 seconds for approach
	}
}

func (s *Station) tickApproach() {
	s.data.State = types.StationStatePreparing
	if s.phaseProgress >= 100 {
		s.transitionTo(PhaseIdentification, 2) // 2 seconds for ID
	}
}

func (s *Station) tickIdentification() {
	s.data.State = types.StationStateIdentifying
	if s.phaseProgress >= 100 {
		// Start disconnect
		s.batteryRobotState = types.RobotStatePositioning
		s.transitionTo(PhaseBatteryDisconnect, 5) // 5 seconds disconnect
	}
}

func (s *Station) tickBatteryDisconnect() {
	s.data.State = types.StationStatePreparing
	s.batteryRobotState = types.RobotStatePositioning
	if s.phaseProgress >= 100 {
		s.transitionTo(PhaseBatteryRemoval, 45) // 45 seconds removal
	}
}

func (s *Station) tickBatteryRemoval() {
	s.data.State = types.StationStateSwapping
	s.batteryRobotState = types.RobotStateSwapping

	if s.phaseProgress >= 100 {
		// Store removed battery SoC
		if s.currentBus != nil {
			s.removedBatterySOC = s.currentBus.GetBatteryModel().GetState().SoC
		}
		s.transitionTo(PhaseBatteryInsertion, 45) // 45 seconds insertion
	}
}

func (s *Station) tickBatteryInsertion() {
	s.data.State = types.StationStateSwapping
	s.batteryRobotState = types.RobotStateSwapping

	if s.phaseProgress >= 100 {
		s.transitionTo(PhaseBatteryConnect, 5) // 5 seconds connect
	}
}

func (s *Station) tickBatteryConnect() {
	s.data.State = types.StationStateSwapping
	s.batteryRobotState = types.RobotStateReturning
	if s.phaseProgress >= 100 {
		s.transitionTo(PhaseVerification, 8) // 8 seconds verification
	}
}

func (s *Station) tickVerification() {
	s.data.State = types.StationStateVerifying
	s.batteryRobotState = types.RobotStateIdle

	if s.phaseProgress >= 100 {
		// Complete the swap
		if s.currentBus != nil {
			s.currentBus.CompleteSwap(s.replacementBattery)
		}
		// Queue depleted battery for charging
		s.replacementBattery = s.removedBatterySOC // Swap batteries
		s.transitionTo(PhaseDeparture, 5) // 5 seconds departure
	}
}

func (s *Station) tickDeparture() {
	s.data.State = types.StationStatePreparing
	if s.phaseProgress >= 100 {
		s.data.CurrentBusID = ""
		s.currentBus = nil
		s.transitionTo(PhaseIdle, 0)
	}
}

func (s *Station) transitionTo(phase StationWorkflowPhase, duration float64) {
	s.workflowPhase = phase
	s.phaseStartTime = time.Now()
	s.phaseDuration = duration
	s.phaseProgress = 0
}

// QueueBus adds a bus to the swap queue
func (s *Station) QueueBus(busID string, bus *Bus) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.data.BusQueue = append(s.data.BusQueue, busID)
	if s.workflowPhase == PhaseIdle {
		s.data.CurrentBusID = busID
		s.data.BusQueue = s.data.BusQueue[1:]
		s.currentBus = bus
		if bus != nil {
			bus.StartSwap(s.data.ID)
		}
	}
}

// GetSwapProgress returns current swap progress
func (s *Station) GetSwapProgress() (phase string, progress float64) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	phases := []string{
		"idle", "approach", "identification", "disconnect",
		"removal", "insertion", "connect", "verification", "departure",
	}
	if int(s.workflowPhase) < len(phases) {
		return phases[s.workflowPhase], s.phaseProgress
	}
	return "unknown", 0
}

// ============================================================================
// Robot - Coordinated robot operations
// ============================================================================

// Robot represents a swap robot with full coordination
type Robot struct {
	mu   sync.RWMutex
	data types.Robot

	// Motion control
	position     types.Position
	homePosition types.Position
	targetPos    types.Position
	velocity     float64 // m/s

	// Task queue
	currentTask  RobotTask
	taskProgress float64

	// Coordination
	partnerRobot *Robot
	isLeader     bool
}

// RobotTask represents a robot task
type RobotTask struct {
	Type     string
	Target   types.Position
	Duration float64
	Payload  interface{}
}

// NewRobot creates a new robot
func NewRobot(stationID string, robotType types.RobotType) *Robot {
	suffix := "a"
	cycleTime := 90.0 // Battery robot: 90s
	if robotType == types.RobotTypeModule {
		suffix = "b"
		cycleTime = 120.0 // Module robot: 120s
	}

	return &Robot{
		data: types.Robot{
			ID:        fmt.Sprintf("%s-robot-%s", stationID, suffix),
			StationID: stationID,
			Type:      robotType,
			State:     types.RobotStateIdle,
			Progress:  0,
			CycleTime: cycleTime,
		},
		position: types.Position{Lat: 0, Lng: 0},
		homePosition: types.Position{Lat: 0, Lng: 0},
		velocity: 0.5, // 0.5 m/s
	}
}

func (r *Robot) ID() string             { return r.data.ID }
func (r *Robot) Type() types.EntityType { return types.EntityRobot }
func (r *Robot) State() interface{}     { return r.data }

func (r *Robot) Tick(dt time.Duration) {
	r.mu.Lock()
	defer r.mu.Unlock()

	dtSeconds := dt.Seconds()

	switch r.data.State {
	case types.RobotStateIdle:
		// Wait for commands

	case types.RobotStatePositioning:
		// Move to target position
		r.data.Progress += (100.0 / 10.0) * dtSeconds // 10s positioning
		if r.data.Progress >= 100 {
			r.data.Progress = 0
			r.data.State = types.RobotStateSwapping
		}

	case types.RobotStateSwapping:
		// Execute swap operation
		r.data.Progress += (100.0 / r.data.CycleTime) * dtSeconds
		if r.data.Progress >= 100 {
			r.data.Progress = 0
			r.data.State = types.RobotStateReturning
		}

	case types.RobotStateReturning:
		// Return to home
		r.data.Progress += (100.0 / 10.0) * dtSeconds
		if r.data.Progress >= 100 {
			r.data.Progress = 0
			r.data.State = types.RobotStateIdle
		}

	case types.RobotStateCharging:
		// Robot battery charging
		r.data.Progress += (100.0 / 3600.0) * dtSeconds // 1 hour charge
		if r.data.Progress >= 100 {
			r.data.Progress = 0
			r.data.State = types.RobotStateIdle
		}
	}
}

// StartSwapOperation starts a swap operation
func (r *Robot) StartSwapOperation() {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.data.State == types.RobotStateIdle {
		r.data.State = types.RobotStatePositioning
		r.data.Progress = 0
	}
}

// SetPartner sets the partner robot for coordination
func (r *Robot) SetPartner(partner *Robot) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.partnerRobot = partner
}

// IsAvailable returns true if robot can accept new task
func (r *Robot) IsAvailable() bool {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.data.State == types.RobotStateIdle
}

// ============================================================================
// Grid - Full V2G model with droop control
// ============================================================================

// Grid represents the electrical grid with V2G
type Grid struct {
	mu   sync.RWMutex
	data types.Grid

	// V2G droop config
	droopConfig models.V2GDroopConfig

	// Grid state
	v2gModules       []*EK3Module
	totalV2GCapacity float64
	activeV2GPower   float64

	// History for frequency regulation
	frequencyHistory []float64
	maxHistoryLen    int
}

// NewGrid creates a new grid model
func NewGrid() *Grid {
	return &Grid{
		data: types.Grid{
			Frequency:  50.0,
			Voltage:    400.0,
			LoadDemand: 100000, // 100 kW base load
			V2GEnabled: true,
			V2GPower:   0,
		},
		droopConfig:      models.DefaultV2GDroopConfig(),
		v2gModules:       make([]*EK3Module, 0),
		frequencyHistory: make([]float64, 0, 100),
		maxHistoryLen:    100,
	}
}

func (g *Grid) ID() string             { return "grid" }
func (g *Grid) Type() types.EntityType { return types.EntityGrid }
func (g *Grid) State() interface{}     { return g.data }

func (g *Grid) Tick(dt time.Duration) {
	g.mu.Lock()
	defer g.mu.Unlock()

	dtSeconds := dt.Seconds()

	// Simulate grid frequency dynamics
	g.updateFrequency(dtSeconds)

	// Simulate voltage variations
	g.updateVoltage(dtSeconds)

	// Calculate V2G response if enabled
	if g.data.V2GEnabled {
		g.calculateV2GResponse()
	}

	// Record frequency history
	g.frequencyHistory = append(g.frequencyHistory, g.data.Frequency)
	if len(g.frequencyHistory) > g.maxHistoryLen {
		g.frequencyHistory = g.frequencyHistory[1:]
	}
}

// updateFrequency simulates grid frequency dynamics
func (g *Grid) updateFrequency(dt float64) {
	// Base frequency with load-dependent deviation
	// Under-frequency when load > generation
	hour := float64(time.Now().Hour()) + float64(time.Now().Minute())/60.0

	// Simulate load demand pattern (peak at 18:00)
	dailyLoadFactor := 0.7 + 0.3*math.Sin((hour-6)*math.Pi/12)
	g.data.LoadDemand = 150000 * dailyLoadFactor // 105-195 kW

	// Frequency deviation based on load imbalance
	// Simplified: higher load = lower frequency
	baseDeviation := (0.5 - dailyLoadFactor) * 0.2 // ±0.1 Hz

	// Random walk component
	randomWalk := (rand.Float64() - 0.5) * 0.01 * dt

	// V2G contribution to frequency support
	v2gSupport := 0.0
	if g.data.V2GPower != 0 {
		v2gSupport = g.data.V2GPower / 100000 * 0.05 // 0.05 Hz per 100kW
	}

	g.data.Frequency += baseDeviation*dt + randomWalk + v2gSupport*dt

	// Clamp to realistic range
	g.data.Frequency = math.Max(49.0, math.Min(51.0, g.data.Frequency))
}

// updateVoltage simulates grid voltage variations
func (g *Grid) updateVoltage(dt float64) {
	// Random voltage variations
	randomWalk := (rand.Float64() - 0.5) * 2 * dt
	g.data.Voltage += randomWalk

	// Reactive power support from V2G
	voltPU := g.data.Voltage / 400.0
	qSupport := models.CalculateVoltageDroop(g.droopConfig, voltPU)

	// Voltage correction from reactive power
	g.data.Voltage += qSupport / 10000 * dt // Small effect

	// Clamp to realistic range
	g.data.Voltage = math.Max(380, math.Min(420, g.data.Voltage))
}

// calculateV2GResponse calculates V2G power based on grid conditions
func (g *Grid) calculateV2GResponse() {
	// Active power droop (frequency regulation)
	activePower := models.CalculateFrequencyDroop(g.droopConfig, g.data.Frequency)

	// Scale by number of V2G modules
	moduleCount := float64(len(g.v2gModules))
	if moduleCount > 0 {
		g.data.V2GPower = activePower * moduleCount
	} else {
		g.data.V2GPower = 0
	}

	// Limit to available capacity
	maxCapacity := g.totalV2GCapacity
	g.data.V2GPower = math.Max(-maxCapacity, math.Min(maxCapacity, g.data.V2GPower))

	// Set module states based on V2G activity
	// V2G active when frequency deviation exceeds deadband (50 mHz)
	const deadband = 0.05 // Hz
	freqDeviation := math.Abs(g.data.Frequency - 50.0)
	v2gActive := freqDeviation > deadband && g.data.V2GPower != 0

	for _, m := range g.v2gModules {
		m.mu.Lock()
		if v2gActive {
			// Only transition healthy modules to V2G
			if m.data.State == types.ModuleStateIdle || m.data.State == types.ModuleStateCharging {
				m.data.State = types.ModuleStateV2G
				// Set power proportional to V2G demand
				perModulePower := math.Abs(g.data.V2GPower) / moduleCount
				m.targetPower = math.Min(perModulePower, 3600) // Cap at max module power
			}
		} else {
			// Return V2G modules to idle when event ends
			if m.data.State == types.ModuleStateV2G {
				m.data.State = types.ModuleStateIdle
				m.targetPower = 0
			}
		}
		m.mu.Unlock()
	}
}

// RegisterV2GModule registers a module for V2G
func (g *Grid) RegisterV2GModule(m *EK3Module) {
	g.mu.Lock()
	defer g.mu.Unlock()

	g.v2gModules = append(g.v2gModules, m)
	g.totalV2GCapacity += 3600 // 3.6 kW per module
}

// UnregisterV2GModule removes a module from V2G
func (g *Grid) UnregisterV2GModule(moduleID string) {
	g.mu.Lock()
	defer g.mu.Unlock()

	for i, m := range g.v2gModules {
		if m.ID() == moduleID {
			g.v2gModules = append(g.v2gModules[:i], g.v2gModules[i+1:]...)
			g.totalV2GCapacity -= 3600
			break
		}
	}
}

// GetFrequencyDeviation returns current frequency deviation from nominal
func (g *Grid) GetFrequencyDeviation() float64 {
	g.mu.RLock()
	defer g.mu.RUnlock()
	return g.data.Frequency - 50.0
}

// GetV2GStatus returns V2G status
func (g *Grid) GetV2GStatus() (enabled bool, power float64, moduleCount int) {
	g.mu.RLock()
	defer g.mu.RUnlock()
	return g.data.V2GEnabled, g.data.V2GPower, len(g.v2gModules)
}

// SetFrequency manually sets grid frequency (for V2G demo)
func (g *Grid) SetFrequency(frequency float64) {
	g.mu.Lock()
	defer g.mu.Unlock()
	g.data.Frequency = frequency
}

// ============================================================================
// BatteryPackEntity - EK-BAT swappable battery pack
// ============================================================================

// BatteryPackEntity wraps the full battery pack simulation
type BatteryPackEntity struct {
	mu   sync.RWMutex
	data types.BatteryPack

	// Full battery model
	pack    *battery.Pack
	bms     *battery.BMS
	thermal *battery.ThermalModel

	// Location tracking
	location    string // "station-XX", "bus-XXX", "inventory"
	stationID   string
	busID       string

	// Charging state
	isCharging     bool
	chargePower    float64 // W
	chargeProgress float64 // 0-100%

	// Ambient conditions
	ambientTemp float64
}

// NewBatteryPackEntity creates a new battery pack entity
func NewBatteryPackEntity(id string, packType battery.PackType) *BatteryPackEntity {
	pack := battery.NewPack(id, packType)
	bms := battery.NewBMS(pack)
	thermalCfg := battery.DefaultThermalConfig()
	thermal := battery.NewThermalModel(pack, thermalCfg)

	spec := battery.GetPackSpec(packType)

	return &BatteryPackEntity{
		data: types.BatteryPack{
			ID:             id,
			Type:           spec.Type.String(),
			State:          types.BatteryPackStateIdle,
			SOC:            pack.SOC,
			SOH:            pack.SOH,
			Voltage:        pack.Voltage,
			Current:        0,
			Power:          0,
			Temperature:    pack.Temperature,
			CapacityKWh:    spec.NominalCapacity,
			CycleCount:     int(pack.CycleCount),
			CellVoltageMin: pack.CellVoltageMin,
			CellVoltageMax: pack.CellVoltageMax,
			CellTempMin:    pack.CellTempMin,
			CellTempMax:    pack.CellTempMax,
			Location:       "inventory",
		},
		pack:        pack,
		bms:         bms,
		thermal:     thermal,
		location:    "inventory",
		ambientTemp: 25,
	}
}

func (b *BatteryPackEntity) ID() string             { return b.data.ID }
func (b *BatteryPackEntity) Type() types.EntityType { return types.EntityBatteryPack }
func (b *BatteryPackEntity) State() interface{}     { return b.data }

// GetData returns current battery pack data
func (b *BatteryPackEntity) GetData() types.BatteryPack {
	b.mu.RLock()
	defer b.mu.RUnlock()
	return b.data
}

// Tick advances the battery pack simulation
func (b *BatteryPackEntity) Tick(dt time.Duration) {
	b.mu.Lock()
	defer b.mu.Unlock()

	dtSeconds := dt.Seconds()

	// Update BMS
	b.bms.Update(dtSeconds)

	// Determine current based on state
	var current float64
	switch b.data.State {
	case types.BatteryPackStateCharging:
		// Get max charge power from pack
		maxPower := b.pack.GetMaxChargePower()
		if b.chargePower > 0 {
			maxPower = math.Min(b.chargePower, maxPower)
		}
		// Apply BMS limits
		if b.bms.AllowedChargeCurrent > 0 && b.pack.Voltage > 0 {
			bmsLimit := b.bms.AllowedChargeCurrent * b.pack.Voltage
			maxPower = math.Min(maxPower, bmsLimit)
		}
		// Calculate charging current (negative = charging in pack convention)
		if b.pack.Voltage > 0 {
			current = -maxPower / b.pack.Voltage
		}
		b.data.Power = -maxPower
		b.data.Current = current

	case types.BatteryPackStateDischarging:
		// Calculate discharge current based on power demand
		if b.pack.Voltage > 0 && b.chargePower > 0 {
			maxPower := math.Min(b.chargePower, b.pack.GetMaxDischargePower())
			// Apply BMS limits
			if b.bms.AllowedDischargeCurrent > 0 {
				bmsLimit := b.bms.AllowedDischargeCurrent * b.pack.Voltage
				maxPower = math.Min(maxPower, bmsLimit)
			}
			current = maxPower / b.pack.Voltage
			b.data.Power = maxPower
			b.data.Current = current
		}

	case types.BatteryPackStateSwapping:
		// No current flow during swap
		current = 0
		b.data.Power = 0
		b.data.Current = 0

	default:
		// Idle - small self-discharge
		current = 0.001 // Very small leakage
		b.data.Power = 0
		b.data.Current = 0
	}

	// Update battery pack
	b.pack.Update(current, b.ambientTemp, dtSeconds)

	// Update thermal model
	b.thermal.Update(b.ambientTemp, dtSeconds)

	// Sync data from pack
	b.data.SOC = b.pack.SOC
	b.data.SOH = b.pack.SOH
	b.data.Voltage = b.pack.Voltage
	b.data.Temperature = b.pack.Temperature
	b.data.CycleCount = int(b.pack.CycleCount)
	b.data.CellVoltageMin = b.pack.CellVoltageMin
	b.data.CellVoltageMax = b.pack.CellVoltageMax
	b.data.CellTempMin = b.pack.CellTempMin
	b.data.CellTempMax = b.pack.CellTempMax

	// Get thermal stats
	thermalStats := b.thermal.GetStats()
	b.data.CoolantTemp = thermalStats.CoolantTempOut
	b.data.HeaterActive = thermalStats.HeaterActive

	// Check for state transitions
	if b.data.State == types.BatteryPackStateCharging && b.pack.SOC >= 95 {
		b.data.State = types.BatteryPackStateIdle
		b.isCharging = false
	}

	// Check BMS faults
	bmsFaults := b.bms.GetFaults()
	if bmsFaults != 0 {
		b.data.State = types.BatteryPackStateFaulted
		b.data.FaultCode = uint32(bmsFaults)
	}

	// Update health status
	b.data.IsHealthy = b.pack.IsHealthy() && bmsFaults == 0
}

// StartCharging starts charging the battery
func (b *BatteryPackEntity) StartCharging(power float64) {
	b.mu.Lock()
	defer b.mu.Unlock()

	if b.data.State == types.BatteryPackStateFaulted {
		return
	}

	b.data.State = types.BatteryPackStateCharging
	b.isCharging = true
	b.chargePower = power
}

// StopCharging stops charging
func (b *BatteryPackEntity) StopCharging() {
	b.mu.Lock()
	defer b.mu.Unlock()

	if b.data.State == types.BatteryPackStateCharging {
		b.data.State = types.BatteryPackStateIdle
	}
	b.isCharging = false
	b.chargePower = 0
}

// StartDischarging starts V2G discharge
func (b *BatteryPackEntity) StartDischarging(power float64) {
	b.mu.Lock()
	defer b.mu.Unlock()

	if b.data.State == types.BatteryPackStateFaulted {
		return
	}

	b.data.State = types.BatteryPackStateDischarging
	b.chargePower = power
}

// StopDischarging stops V2G discharge
func (b *BatteryPackEntity) StopDischarging() {
	b.mu.Lock()
	defer b.mu.Unlock()

	if b.data.State == types.BatteryPackStateDischarging {
		b.data.State = types.BatteryPackStateIdle
	}
	b.chargePower = 0
}

// StartSwap marks battery as being swapped
func (b *BatteryPackEntity) StartSwap() {
	b.mu.Lock()
	defer b.mu.Unlock()

	b.data.State = types.BatteryPackStateSwapping
	b.chargePower = 0
}

// CompleteSwap completes the swap operation
func (b *BatteryPackEntity) CompleteSwap(newLocation, newBusID, newStationID string) {
	b.mu.Lock()
	defer b.mu.Unlock()

	b.location = newLocation
	b.busID = newBusID
	b.stationID = newStationID
	b.data.Location = newLocation
	b.data.State = types.BatteryPackStateIdle
}

// SetAmbientTemp sets ambient temperature for thermal simulation
func (b *BatteryPackEntity) SetAmbientTemp(temp float64) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.ambientTemp = temp
	b.thermal.SetAmbientTemp(temp)
}

// GetPack returns the underlying battery pack model
func (b *BatteryPackEntity) GetPack() *battery.Pack {
	return b.pack
}

// GetBMS returns the BMS
func (b *BatteryPackEntity) GetBMS() *battery.BMS {
	return b.bms
}

// GetThermalModel returns thermal model
func (b *BatteryPackEntity) GetThermalModel() *battery.ThermalModel {
	return b.thermal
}

// ClearFaults clears BMS faults
func (b *BatteryPackEntity) ClearFaults() {
	b.mu.Lock()
	defer b.mu.Unlock()

	b.bms.ClearFaults()
	b.data.FaultCode = 0
	if b.pack.IsHealthy() {
		b.data.State = types.BatteryPackStateIdle
		b.data.IsHealthy = true
	}
}
