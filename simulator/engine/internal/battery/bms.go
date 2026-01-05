package battery

import (
	"math"
	"time"
)

// BMSState represents BMS operating state
type BMSState int

const (
	BMSStateInit       BMSState = iota // Initializing
	BMSStateIdle                       // Idle, contactors open
	BMSStatePrecharge                  // Precharging
	BMSStateActive                     // Contactors closed, operational
	BMSStateBalancing                  // Cell balancing active
	BMSStateCharging                   // Charging mode
	BMSStateDischarging                // Discharging mode
	BMSStateFault                      // Fault condition
	BMSStateShutdown                   // Controlled shutdown
)

// String returns state name
func (s BMSState) String() string {
	names := []string{
		"init", "idle", "precharge", "active", "balancing",
		"charging", "discharging", "fault", "shutdown",
	}
	if int(s) < len(names) {
		return names[s]
	}
	return "unknown"
}

// BMSFault represents BMS fault flags
type BMSFault uint32

const (
	BMSFaultNone            BMSFault = 0
	BMSFaultOverVoltage     BMSFault = 1 << 0  // Cell overvoltage
	BMSFaultUnderVoltage    BMSFault = 1 << 1  // Cell undervoltage
	BMSFaultOverCurrent     BMSFault = 1 << 2  // Overcurrent
	BMSFaultOverTemp        BMSFault = 1 << 3  // Overtemperature
	BMSFaultUnderTemp       BMSFault = 1 << 4  // Undertemperature
	BMSFaultCellImbalance   BMSFault = 1 << 5  // Excessive cell imbalance
	BMSFaultCommunication   BMSFault = 1 << 6  // Communication error
	BMSFaultIsolation       BMSFault = 1 << 7  // Isolation fault
	BMSFaultPrechargeTimeout BMSFault = 1 << 8 // Precharge timeout
	BMSFaultContactor       BMSFault = 1 << 9  // Contactor failure
)

// BMSConfig holds BMS configuration
type BMSConfig struct {
	// Voltage limits
	CellOVP float64 // Cell overvoltage protection [V]
	CellUVP float64 // Cell undervoltage protection [V]
	CellOVPRecover float64 // Recovery voltage [V]
	CellUVPRecover float64 // Recovery voltage [V]

	// Current limits
	MaxChargeCurrent    float64 // Max charge current [A]
	MaxDischargeCurrent float64 // Max discharge current [A]

	// Temperature limits
	MaxCellTemp      float64 // Max cell temperature [°C]
	MinCellTemp      float64 // Min cell temperature [°C]
	ChargeMinTemp    float64 // Min temp for charging [°C]
	ChargeMaxTemp    float64 // Max temp for charging [°C]

	// Balancing
	BalanceThreshold float64 // Voltage diff to trigger balancing [mV]
	BalanceCurrent   float64 // Balancing current [A]

	// Precharge
	PrechargeResistor float64 // Precharge resistor [Ω]
	PrechargeTarget   float64 // Target voltage ratio (0.9)
	PrechargeTimeout  float64 // Timeout [s]

	// Imbalance
	MaxImbalance float64 // Max allowed voltage spread [V]
}

// DefaultBMSConfig returns default configuration
func DefaultBMSConfig() BMSConfig {
	return BMSConfig{
		CellOVP:        3.65,
		CellUVP:        2.5,
		CellOVPRecover: 3.60,
		CellUVPRecover: 2.8,

		MaxChargeCurrent:    200,
		MaxDischargeCurrent: 300,

		MaxCellTemp:   60,
		MinCellTemp:   -20,
		ChargeMinTemp: 0,
		ChargeMaxTemp: 45,

		BalanceThreshold: 0.020, // 20mV
		BalanceCurrent:   0.5,   // 500mA

		PrechargeResistor: 50,
		PrechargeTarget:   0.95,
		PrechargeTimeout:  5.0,

		MaxImbalance: 0.1, // 100mV
	}
}

// BMS represents the Battery Management System
type BMS struct {
	Pack   *Pack
	Config BMSConfig
	State  BMSState
	Faults BMSFault

	// Contactors
	MainContactorPos     bool // Positive contactor
	MainContactorNeg     bool // Negative contactor
	PrechargeContactor   bool // Precharge contactor

	// SOC/SOH estimators
	SOCEstimator *SOCEstimator
	SOHTracker   *SOHTracker

	// Balancing state
	BalancingActive   bool
	BalancingCells    [][]bool // Which cells are being balanced

	// Current limits (dynamic)
	AllowedChargeCurrent    float64
	AllowedDischargeCurrent float64

	// Precharge tracking
	prechargeStart time.Time
	prechargeVoltage float64

	// Fault tracking
	faultTime   time.Time
	faultCount  uint32
}

// NewBMS creates a new BMS for a pack
func NewBMS(pack *Pack) *BMS {
	config := DefaultBMSConfig()

	bms := &BMS{
		Pack:   pack,
		Config: config,
		State:  BMSStateInit,
	}

	// Initialize balancing state
	bms.BalancingCells = make([][]bool, pack.Spec.ParallelStrings)
	for p := 0; p < pack.Spec.ParallelStrings; p++ {
		bms.BalancingCells[p] = make([]bool, pack.Spec.SeriesCells)
	}

	// Initialize estimators
	bms.SOCEstimator = NewSOCEstimator(pack.Spec.NominalCapacity*1000, pack.Cells[0][0].ocvTable)
	bms.SOHTracker = NewSOHTracker(pack.Spec.NominalCapacity * 1000)

	// Calculate initial limits
	bms.updateCurrentLimits()

	return bms
}

// Update runs BMS logic for one time step
func (b *BMS) Update(dt float64) {
	// Check faults first
	b.checkFaults()

	// Run state machine
	switch b.State {
	case BMSStateInit:
		b.handleInit()
	case BMSStateIdle:
		b.handleIdle()
	case BMSStatePrecharge:
		b.handlePrecharge(dt)
	case BMSStateActive, BMSStateCharging, BMSStateDischarging:
		b.handleActive(dt)
	case BMSStateFault:
		b.handleFault()
	}

	// Update current limits
	b.updateCurrentLimits()

	// Update SOC estimator
	if b.SOCEstimator != nil {
		soc := b.SOCEstimator.Update(b.Pack.Current, b.Pack.Voltage, dt)
		// Blend with cell-level SOC
		b.Pack.SOC = 0.7*soc*100 + 0.3*b.Pack.SOC
	}

	// Update SOH tracker
	if b.SOHTracker != nil {
		b.SOHTracker.Update(b.Pack.SOC/100, b.Pack.Temperature, dt)
	}

	// Handle balancing
	if b.BalancingActive {
		b.handleBalancing(dt)
	}
}

// handleInit initializes BMS
func (b *BMS) handleInit() {
	// Close negative contactor first
	b.MainContactorNeg = true
	b.State = BMSStateIdle
}

// handleIdle waits for activation
func (b *BMS) handleIdle() {
	// Stay idle until commanded
}

// StartPrecharge begins precharge sequence
func (b *BMS) StartPrecharge() error {
	if b.State != BMSStateIdle {
		return nil
	}

	b.PrechargeContactor = true
	b.prechargeStart = time.Now()
	b.prechargeVoltage = b.Pack.Voltage
	b.State = BMSStatePrecharge
	return nil
}

// handlePrecharge monitors precharge progress
func (b *BMS) handlePrecharge(dt float64) {
	elapsed := time.Since(b.prechargeStart).Seconds()

	// Check timeout
	if elapsed > b.Config.PrechargeTimeout {
		b.Faults |= BMSFaultPrechargeTimeout
		b.State = BMSStateFault
		return
	}

	// Check if target reached (simulated)
	// In real system, compare DC link voltage to pack voltage
	if elapsed > 0.5 { // Assume 500ms precharge
		b.CloseMainContactor()
	}
}

// CloseMainContactor closes main contactor after precharge
func (b *BMS) CloseMainContactor() {
	b.MainContactorPos = true
	b.PrechargeContactor = false
	b.State = BMSStateActive
}

// handleActive monitors active operation
func (b *BMS) handleActive(dt float64) {
	// Check balancing condition
	if b.Pack.CellVoltageSpread > b.Config.BalanceThreshold {
		b.StartBalancing()
	}

	// Update state based on current
	if b.Pack.Current < -1 { // Charging
		b.State = BMSStateCharging
	} else if b.Pack.Current > 1 { // Discharging
		b.State = BMSStateDischarging
	} else {
		b.State = BMSStateActive
	}
}

// handleFault manages fault state
func (b *BMS) handleFault() {
	// Open contactors
	b.OpenContactors()
}

// OpenContactors opens all contactors
func (b *BMS) OpenContactors() {
	b.MainContactorPos = false
	b.MainContactorNeg = false
	b.PrechargeContactor = false
}

// Shutdown performs controlled shutdown
func (b *BMS) Shutdown() {
	b.State = BMSStateShutdown
	b.OpenContactors()
}

// checkFaults checks all fault conditions
func (b *BMS) checkFaults() {
	var faults BMSFault

	// Cell voltage faults
	if b.Pack.CellVoltageMax > b.Config.CellOVP {
		faults |= BMSFaultOverVoltage
	}
	if b.Pack.CellVoltageMin < b.Config.CellUVP {
		faults |= BMSFaultUnderVoltage
	}

	// Temperature faults
	if b.Pack.CellTempMax > b.Config.MaxCellTemp {
		faults |= BMSFaultOverTemp
	}
	if b.Pack.CellTempMin < b.Config.MinCellTemp {
		faults |= BMSFaultUnderTemp
	}

	// Current faults
	if b.Pack.Current > b.Config.MaxDischargeCurrent {
		faults |= BMSFaultOverCurrent
	}
	if b.Pack.Current < -b.Config.MaxChargeCurrent {
		faults |= BMSFaultOverCurrent
	}

	// Imbalance
	if b.Pack.CellVoltageSpread > b.Config.MaxImbalance {
		faults |= BMSFaultCellImbalance
	}

	// Update faults
	if faults != BMSFaultNone && b.Faults == BMSFaultNone {
		b.faultTime = time.Now()
		b.faultCount++
	}
	b.Faults = faults

	if faults != BMSFaultNone && b.State != BMSStateFault {
		b.State = BMSStateFault
	}
}

// updateCurrentLimits calculates dynamic current limits
func (b *BMS) updateCurrentLimits() {
	// Start with pack limits
	maxCharge := b.Pack.GetMaxChargePower() / b.Pack.Voltage
	maxDischarge := b.Pack.GetMaxDischargePower() / b.Pack.Voltage

	// Apply temperature derating
	if b.Pack.Temperature < b.Config.ChargeMinTemp {
		maxCharge = 0 // No charging below 0°C
	} else if b.Pack.Temperature > b.Config.ChargeMaxTemp {
		// Reduce above 45°C
		maxCharge *= math.Max(0, 1-0.1*(b.Pack.Temperature-b.Config.ChargeMaxTemp))
	}

	// Apply SOC-based limits
	if b.Pack.SOC > 95 {
		// Taper charge above 95%
		maxCharge *= (100 - b.Pack.SOC) / 5
	}
	if b.Pack.SOC < 5 {
		// Reduce discharge below 5%
		maxDischarge *= b.Pack.SOC / 5
	}

	// Apply config limits
	b.AllowedChargeCurrent = math.Min(maxCharge, b.Config.MaxChargeCurrent)
	b.AllowedDischargeCurrent = math.Min(maxDischarge, b.Config.MaxDischargeCurrent)
}

// StartBalancing starts cell balancing
func (b *BMS) StartBalancing() {
	if b.BalancingActive {
		return
	}

	// Find highest voltage cell
	maxV := b.Pack.CellVoltageMin // Target lowest cell

	for p := 0; p < b.Pack.Spec.ParallelStrings; p++ {
		for s := 0; s < b.Pack.Spec.SeriesCells; s++ {
			cell := b.Pack.Cells[p][s]
			if cell.Voltage-maxV > b.Config.BalanceThreshold {
				b.BalancingCells[p][s] = true
			} else {
				b.BalancingCells[p][s] = false
			}
		}
	}

	b.BalancingActive = true
	b.State = BMSStateBalancing
}

// handleBalancing performs cell balancing
func (b *BMS) handleBalancing(dt float64) {
	minV := b.Pack.CellVoltageMin
	balanced := true

	for p := 0; p < b.Pack.Spec.ParallelStrings; p++ {
		for s := 0; s < b.Pack.Spec.SeriesCells; s++ {
			if !b.BalancingCells[p][s] {
				continue
			}

			cell := b.Pack.Cells[p][s]

			// Check if this cell is balanced
			if cell.Voltage-minV < b.Config.BalanceThreshold/2 {
				b.BalancingCells[p][s] = false
				continue
			}

			balanced = false

			// Simulate balance discharge (bleeder resistor)
			// Draw small current from this cell
			balanceAh := b.Config.BalanceCurrent * dt / 3600
			cell.SOC -= balanceAh / cell.Spec.NominalCapacity
			cell.SOC = clamp(cell.SOC, 0, 1)
		}
	}

	if balanced {
		b.BalancingActive = false
		b.State = BMSStateActive
	}
}

// StopBalancing stops cell balancing
func (b *BMS) StopBalancing() {
	b.BalancingActive = false
	for p := 0; p < b.Pack.Spec.ParallelStrings; p++ {
		for s := 0; s < b.Pack.Spec.SeriesCells; s++ {
			b.BalancingCells[p][s] = false
		}
	}
}

// RequestPower requests power from BMS
// Returns allowed power (may be limited)
func (b *BMS) RequestPower(power float64) float64 {
	if b.State == BMSStateFault || b.State == BMSStateShutdown {
		return 0
	}

	if !b.MainContactorPos {
		return 0 // Contactors not closed
	}

	// Calculate current from power
	current := power / b.Pack.Voltage

	// Apply limits
	if current > 0 { // Discharge
		current = math.Min(current, b.AllowedDischargeCurrent)
	} else { // Charge
		current = math.Max(current, -b.AllowedChargeCurrent)
	}

	return current * b.Pack.Voltage
}

// ClearFaults clears fault flags
func (b *BMS) ClearFaults() {
	b.Faults = BMSFaultNone
	if b.State == BMSStateFault {
		b.State = BMSStateIdle
	}
}

// GetState returns current BMS state
func (b *BMS) GetState() BMSState {
	return b.State
}

// GetFaults returns current faults
func (b *BMS) GetFaults() BMSFault {
	return b.Faults
}

// IsContactorsClosed returns true if main contactors are closed
func (b *BMS) IsContactorsClosed() bool {
	return b.MainContactorPos && b.MainContactorNeg
}

// GetSOC returns estimated SOC
func (b *BMS) GetSOC() float64 {
	if b.SOCEstimator != nil {
		return b.SOCEstimator.GetSOC() * 100
	}
	return b.Pack.SOC
}

// GetSOH returns estimated SOH
func (b *BMS) GetSOH() float64 {
	if b.SOHTracker != nil {
		return b.SOHTracker.GetSOH()
	}
	return b.Pack.SOH
}
