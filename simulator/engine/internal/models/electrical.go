package models

import (
	"math"
)

// EK3Specs holds electrical specifications for EK3 module
type EK3Specs struct {
	// Power ratings
	PnominalW  float64 // Nominal power: 3300W
	PmaxW      float64 // Max power: 3600W
	PstandbyW  float64 // Standby power: 3W

	// Voltage ranges
	VinDC      float64 // Input voltage from PFC: 650V DC
	VoutMin    float64 // Min output: 50V
	VoutMax    float64 // Max output: 500V
	VoutNom    float64 // Nominal output: 400V

	// Current limits
	ImaxA      float64 // Max output current: 7.2A (3600W/500V)
	IpeakA     float64 // Peak current limit: 10A (transient)

	// LLC parameters
	FresKHz    float64 // Resonant frequency: 200 kHz
	FsMinKHz   float64 // Min switching: 150 kHz
	FsMaxKHz   float64 // Max switching: 250 kHz

	// Efficiency targets
	EtaPeak    float64 // Peak efficiency: 0.97
	EtaNominal float64 // Nominal efficiency: 0.96
	EtaMin     float64 // Min efficiency (light load): 0.92
}

// DefaultEK3Specs returns standard EK3 specifications
func DefaultEK3Specs() EK3Specs {
	return EK3Specs{
		PnominalW:  3300,
		PmaxW:      3600,
		PstandbyW:  3,
		VinDC:      650,
		VoutMin:    50,
		VoutMax:    500,
		VoutNom:    400,
		ImaxA:      7.2,
		IpeakA:     10,
		FresKHz:    200,
		FsMinKHz:   150,
		FsMaxKHz:   250,
		EtaPeak:    0.97,
		EtaNominal: 0.96,
		EtaMin:     0.92,
	}
}

// ElectricalState holds current electrical state
type ElectricalState struct {
	Vin      float64 // Input voltage (V)
	Vout     float64 // Output voltage (V)
	Iout     float64 // Output current (A)
	Pout     float64 // Output power (W)
	Pin      float64 // Input power (W)
	Ploss    float64 // Power loss (W)
	Eta      float64 // Efficiency (0-1)
	Fs       float64 // Switching frequency (kHz)
	DutyCycle float64 // Effective duty cycle
}

// ElectricalModel simulates LLC converter behavior
type ElectricalModel struct {
	specs EK3Specs
	state ElectricalState

	// Degradation factors (1.0 = healthy)
	rdsOnRatio float64 // MOSFET Rds(on) degradation
	esrRatio   float64 // Capacitor ESR degradation
}

// NewElectricalModel creates a new electrical model
func NewElectricalModel() *ElectricalModel {
	specs := DefaultEK3Specs()
	return &ElectricalModel{
		specs: specs,
		state: ElectricalState{
			Vin:  specs.VinDC,
			Vout: specs.VoutNom,
		},
		rdsOnRatio: 1.0,
		esrRatio:   1.0,
	}
}

// SetOutputVoltage sets target output voltage (battery voltage)
func (m *ElectricalModel) SetOutputVoltage(vout float64) {
	m.state.Vout = math.Max(m.specs.VoutMin, math.Min(m.specs.VoutMax, vout))
}

// SetDegradation sets degradation factors
func (m *ElectricalModel) SetDegradation(rdsOnRatio, esrRatio float64) {
	m.rdsOnRatio = rdsOnRatio
	m.esrRatio = esrRatio
}

// CalculatePower calculates electrical parameters for given power request
// powerRequest: requested output power (W)
// Returns actual achievable power and updated state
func (m *ElectricalModel) CalculatePower(powerRequest float64) ElectricalState {
	specs := m.specs

	// Limit power to max
	m.state.Pout = math.Max(0, math.Min(specs.PmaxW, powerRequest))

	// Calculate output current
	if m.state.Vout > 0 {
		m.state.Iout = m.state.Pout / m.state.Vout
	} else {
		m.state.Iout = 0
	}

	// Current limiting
	if m.state.Iout > specs.ImaxA {
		m.state.Iout = specs.ImaxA
		m.state.Pout = m.state.Iout * m.state.Vout
	}

	// Calculate efficiency based on load
	m.state.Eta = m.calculateEfficiency(m.state.Pout)

	// Calculate input power and losses
	if m.state.Eta > 0 {
		m.state.Pin = m.state.Pout / m.state.Eta
		m.state.Ploss = m.state.Pin - m.state.Pout
	} else {
		m.state.Pin = specs.PstandbyW
		m.state.Ploss = specs.PstandbyW
	}

	// Calculate switching frequency (simplified)
	// LLC uses frequency modulation for regulation
	// Fs increases as Vout/Vin ratio decreases
	gainRequired := m.state.Vout / (m.state.Vin * 0.5) // Approximate gain
	m.state.Fs = specs.FresKHz / gainRequired
	m.state.Fs = math.Max(specs.FsMinKHz, math.Min(specs.FsMaxKHz, m.state.Fs))

	return m.state
}

// calculateEfficiency returns efficiency based on load and degradation
func (m *ElectricalModel) calculateEfficiency(pout float64) float64 {
	specs := m.specs

	if pout <= 0 {
		return 0
	}

	// Load factor (0-1)
	loadFactor := pout / specs.PnominalW

	// Base efficiency curve (empirical for LLC converter)
	// Peak efficiency around 50-70% load
	// Lower at light load (switching losses dominate)
	// Lower at full load (conduction losses dominate)

	var eta float64
	if loadFactor < 0.1 {
		// Light load - poor efficiency
		eta = specs.EtaMin + (specs.EtaNominal-specs.EtaMin)*loadFactor*5
	} else if loadFactor < 0.5 {
		// Rising toward peak
		eta = specs.EtaNominal + (specs.EtaPeak-specs.EtaNominal)*(loadFactor-0.1)/0.4
	} else if loadFactor < 0.8 {
		// Peak efficiency region
		eta = specs.EtaPeak
	} else {
		// Falling at high load
		eta = specs.EtaPeak - (specs.EtaPeak-specs.EtaNominal)*(loadFactor-0.8)/0.2
	}

	// Apply degradation
	// Higher Rds(on) = higher conduction losses
	// Higher ESR = higher ripple losses
	degradationFactor := 1.0 - 0.02*(m.rdsOnRatio-1) - 0.01*(m.esrRatio-1)
	eta *= degradationFactor

	return math.Max(specs.EtaMin*0.8, math.Min(specs.EtaPeak, eta))
}

// GetState returns current electrical state
func (m *ElectricalModel) GetState() ElectricalState {
	return m.state
}

// GetMaxPower returns current max power considering derating
func (m *ElectricalModel) GetMaxPower(thermalDerating float64) float64 {
	return m.specs.PmaxW * thermalDerating
}

// ============================================================================
// Wide Striping Power Distribution
// ============================================================================

// WideStripingConfig holds rack-level power distribution config
type WideStripingConfig struct {
	ModuleCount     int     // Number of modules in rack
	TargetPower     float64 // Total requested power (W)
	MaxModulePower  float64 // Max per module (W)
	MinModulePower  float64 // Min efficient power (W)
	SpareModules    int     // Modules held in reserve
}

// CalculateWideStriping distributes power across all modules
// Returns slice of power per module
func CalculateWideStriping(cfg WideStripingConfig) []float64 {
	activeModules := cfg.ModuleCount - cfg.SpareModules
	if activeModules <= 0 {
		return make([]float64, cfg.ModuleCount)
	}

	powers := make([]float64, cfg.ModuleCount)

	// Equal distribution across active modules
	powerPerModule := cfg.TargetPower / float64(activeModules)

	// Clamp to valid range
	powerPerModule = math.Max(0, math.Min(cfg.MaxModulePower, powerPerModule))

	// If below minimum efficient power, reduce active module count
	if powerPerModule < cfg.MinModulePower && cfg.TargetPower > 0 {
		// Use fewer modules at higher power
		neededModules := int(math.Ceil(cfg.TargetPower / cfg.MaxModulePower))
		activeModules = max(1, neededModules)
		powerPerModule = cfg.TargetPower / float64(activeModules)
	}

	// Assign power to modules (skip spares at end)
	for i := 0; i < activeModules && i < cfg.ModuleCount-cfg.SpareModules; i++ {
		powers[i] = powerPerModule
	}

	return powers
}

// CalculateDistributedSparing returns module assignments after failure
// failedIndices: indices of failed modules
// Returns new power distribution, total capacity loss
func CalculateDistributedSparing(cfg WideStripingConfig, failedIndices []int) ([]float64, float64) {
	// Mark failed modules
	failed := make(map[int]bool)
	for _, idx := range failedIndices {
		failed[idx] = true
	}

	// Count active modules
	activeModules := 0
	for i := 0; i < cfg.ModuleCount; i++ {
		if !failed[i] {
			activeModules++
		}
	}

	powers := make([]float64, cfg.ModuleCount)
	if activeModules == 0 {
		return powers, 1.0 // Total loss
	}

	// Redistribute power
	powerPerModule := cfg.TargetPower / float64(activeModules)
	powerPerModule = math.Min(cfg.MaxModulePower, powerPerModule)

	for i := 0; i < cfg.ModuleCount; i++ {
		if !failed[i] {
			powers[i] = powerPerModule
		}
	}

	// Calculate capacity loss
	originalCapacity := float64(cfg.ModuleCount) * cfg.MaxModulePower
	currentCapacity := float64(activeModules) * cfg.MaxModulePower
	capacityLoss := 1.0 - currentCapacity/originalCapacity

	return powers, capacityLoss
}

// ============================================================================
// V2G (Vehicle-to-Grid) Control
// ============================================================================

// V2GState holds V2G operation state
type V2GState struct {
	Enabled       bool    // V2G permitted by vehicle
	GridFrequency float64 // Hz
	GridVoltage   float64 // V
	ActivePower   float64 // W (positive = charging, negative = discharging)
	ReactivePower float64 // VAR
	PowerFactor   float64 // 0-1
}

// V2GDroopConfig holds droop control parameters
type V2GDroopConfig struct {
	FreqNominal   float64 // Nominal frequency: 50 Hz
	FreqDeadband  float64 // Deadband: ±0.05 Hz
	DroopPercent  float64 // Droop: 4% (ENTSO-E range: 2-12%)
	PnominalW     float64 // Nominal power per module
	VoltDeadband  float64 // Voltage deadband: ±5%
	QmaxVAR       float64 // Max reactive power
}

// DefaultV2GDroopConfig returns default droop parameters
func DefaultV2GDroopConfig() V2GDroopConfig {
	return V2GDroopConfig{
		FreqNominal:  50.0,
		FreqDeadband: 0.05,
		DroopPercent: 4.0,
		PnominalW:    3300,
		VoltDeadband: 0.05,
		QmaxVAR:      1500, // ~0.45 power factor at full P
	}
}

// CalculateFrequencyDroop calculates power adjustment for frequency deviation
// Returns power delta (negative = reduce charging / export to grid)
func CalculateFrequencyDroop(cfg V2GDroopConfig, gridFreq float64) float64 {
	// Frequency deviation
	deltaF := gridFreq - cfg.FreqNominal

	// Check deadband
	if math.Abs(deltaF) <= cfg.FreqDeadband {
		return 0
	}

	// Droop calculation
	// P/Pn = -Kp * (f - f0) / f0
	// where Kp = 1 / droop_percent
	Kp := 100.0 / cfg.DroopPercent // e.g., 25 for 4% droop

	// Power change per Hz deviation
	deltaPperHz := cfg.PnominalW * Kp / cfg.FreqNominal

	// Under-frequency: reduce load (negative delta for charging)
	// Over-frequency: increase load
	return -deltaF * deltaPperHz
}

// CalculateVoltageDroop calculates reactive power for voltage support
// Returns reactive power (positive = capacitive, negative = inductive)
func CalculateVoltageDroop(cfg V2GDroopConfig, gridVoltPU float64) float64 {
	// Voltage deviation from 1.0 pu
	deltaV := gridVoltPU - 1.0

	// Check deadband
	if math.Abs(deltaV) <= cfg.VoltDeadband {
		return 0
	}

	// Under-voltage: inject reactive (capacitive)
	// Over-voltage: absorb reactive (inductive)
	// Q = -Kq * deltaV * Qmax
	Kq := 1.0 / cfg.VoltDeadband
	return -deltaV * Kq * cfg.QmaxVAR
}
