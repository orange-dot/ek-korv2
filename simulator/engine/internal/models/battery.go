package models

import (
	"math"
)

// BatterySpecs holds battery pack specifications
type BatterySpecs struct {
	// Capacity
	NominalCapacityKWh float64 // Nominal capacity: 350 kWh typical for bus
	UsableCapacityKWh  float64 // Usable capacity (80% of nominal typically)

	// Voltage
	VnominalV   float64 // Nominal voltage: 650V
	VminV       float64 // Min voltage (0% SoC): 550V
	VmaxV       float64 // Max voltage (100% SoC): 750V

	// Current limits
	ImaxChargeA    float64 // Max charge current: 400A (260kW @ 650V)
	ImaxDischargeA float64 // Max discharge current: 600A

	// Chemistry
	CellCount     int     // Number of cells in series
	CellVnominal  float64 // Nominal cell voltage: 3.7V (NMC)
	CellCapacityAh float64 // Cell capacity

	// Degradation
	CycleLifeNominal int     // Cycles to 80% capacity: 2000-3000
	CalendarLifeYrs  float64 // Calendar life: 8-10 years
}

// DefaultBusBatterySpecs returns typical electric bus battery specs
func DefaultBusBatterySpecs() BatterySpecs {
	return BatterySpecs{
		NominalCapacityKWh: 350,
		UsableCapacityKWh:  280, // 80% DoD
		VnominalV:          650,
		VminV:              550,
		VmaxV:              750,
		ImaxChargeA:        400,
		ImaxDischargeA:     600,
		CellCount:          176, // 176S for ~650V nominal
		CellVnominal:       3.7,
		CellCapacityAh:     270, // Large format cells
		CycleLifeNominal:   2500,
		CalendarLifeYrs:    10,
	}
}

// BatteryState holds current battery state
type BatteryState struct {
	SoC           float64 // State of charge (0-100%)
	SoH           float64 // State of health (0-100%)
	Voltage       float64 // Terminal voltage (V)
	Current       float64 // Current (A, positive = charging)
	Power         float64 // Power (W, positive = charging)
	Temperature   float64 // Pack temperature (°C)
	CycleCount    int     // Charge cycles completed
	EnergyInKWh   float64 // Total energy charged (kWh)
	EnergyOutKWh  float64 // Total energy discharged (kWh)
}

// BatteryModel simulates battery pack behavior
type BatteryModel struct {
	specs BatterySpecs
	state BatteryState

	// Internal state
	internalResistance float64 // Pack internal resistance (Ω)
	ocvCurve           []float64 // Open circuit voltage vs SoC
}

// NewBatteryModel creates a new battery model
func NewBatteryModel(specs BatterySpecs, initialSoC float64) *BatteryModel {
	m := &BatteryModel{
		specs: specs,
		state: BatteryState{
			SoC:         initialSoC,
			SoH:         100.0,
			Temperature: 25.0,
		},
	}

	// Initialize OCV curve (normalized to cell voltage)
	// Typical NMC curve points: SoC -> Vcell
	m.ocvCurve = []float64{
		3.0,  // 0%
		3.3,  // 10%
		3.5,  // 20%
		3.6,  // 30%
		3.65, // 40%
		3.7,  // 50%
		3.75, // 60%
		3.85, // 70%
		3.95, // 80%
		4.05, // 90%
		4.2,  // 100%
	}

	// Initial resistance (increases with degradation)
	// ~0.1 mΩ per cell, 176 cells = ~18 mΩ pack
	m.internalResistance = 0.018

	// Calculate initial voltage
	m.state.Voltage = m.calculateOCV(initialSoC)

	return m
}

// calculateOCV returns open circuit voltage for given SoC
func (m *BatteryModel) calculateOCV(soc float64) float64 {
	// Linear interpolation on OCV curve
	soc = math.Max(0, math.Min(100, soc))
	idx := soc / 10.0
	idxLow := int(math.Floor(idx))
	idxHigh := int(math.Ceil(idx))

	if idxHigh >= len(m.ocvCurve) {
		idxHigh = len(m.ocvCurve) - 1
	}
	if idxLow >= len(m.ocvCurve) {
		idxLow = len(m.ocvCurve) - 1
	}

	// Interpolate cell voltage
	frac := idx - float64(idxLow)
	cellV := m.ocvCurve[idxLow] + frac*(m.ocvCurve[idxHigh]-m.ocvCurve[idxLow])

	// Scale to pack voltage
	return cellV * float64(m.specs.CellCount)
}

// Update updates battery state for given power flow
// power: power in W (positive = charging, negative = discharging)
// dt: time step in seconds
func (m *BatteryModel) Update(power float64, dt float64) BatteryState {
	specs := m.specs

	// Calculate current from power and voltage
	if m.state.Voltage > 0 {
		m.state.Current = power / m.state.Voltage
	}

	// Apply current limits
	if m.state.Current > specs.ImaxChargeA {
		m.state.Current = specs.ImaxChargeA
	}
	if m.state.Current < -specs.ImaxDischargeA {
		m.state.Current = -specs.ImaxDischargeA
	}

	// Recalculate actual power
	m.state.Power = m.state.Current * m.state.Voltage

	// Energy flow (Wh)
	energyWh := m.state.Power * dt / 3600.0

	// Update SoC
	// Available capacity considering SoH
	availableCapacityWh := specs.NominalCapacityKWh * 1000 * (m.state.SoH / 100)

	if availableCapacityWh > 0 {
		socChange := (energyWh / availableCapacityWh) * 100
		m.state.SoC += socChange
	}

	// Clamp SoC
	m.state.SoC = math.Max(0, math.Min(100, m.state.SoC))

	// Track energy throughput
	if energyWh > 0 {
		m.state.EnergyInKWh += energyWh / 1000
	} else {
		m.state.EnergyOutKWh -= energyWh / 1000
	}

	// Update cycle count (one cycle = 100% DoD equivalent)
	// Simplified: accumulate partial cycles
	cycleIncrement := math.Abs(energyWh) / (specs.UsableCapacityKWh * 1000)
	if cycleIncrement > 0.001 { // Threshold to avoid noise
		m.state.CycleCount = int(float64(m.state.CycleCount) + cycleIncrement)
	}

	// Update voltage (OCV + IR drop)
	ocv := m.calculateOCV(m.state.SoC)
	irDrop := m.state.Current * m.internalResistance * (1 + 0.1*(m.state.SoH/100-1)) // Resistance increases as SoH decreases
	m.state.Voltage = ocv + irDrop

	// Clamp voltage
	m.state.Voltage = math.Max(specs.VminV, math.Min(specs.VmaxV, m.state.Voltage))

	return m.state
}

// UpdateDegradation updates SoH based on usage
// Call periodically (e.g., every simulated hour)
func (m *BatteryModel) UpdateDegradation(hoursElapsed float64) {
	specs := m.specs

	// Cycle-based degradation
	// Linear model: 20% loss over cycle life
	cycleDegradation := 20.0 * (float64(m.state.CycleCount) / float64(specs.CycleLifeNominal))

	// Calendar degradation
	// Linear model: 20% loss over calendar life
	calendarDegradation := 20.0 * (hoursElapsed / (specs.CalendarLifeYrs * 8760))

	// Temperature acceleration (Arrhenius-like)
	// 2x degradation rate per 10°C above 25°C
	tempFactor := math.Pow(2, (m.state.Temperature-25)/10)
	if tempFactor < 1 {
		tempFactor = 1
	}

	// Total degradation (whichever is worse + some combined effect)
	totalDegradation := math.Max(cycleDegradation, calendarDegradation) * tempFactor

	m.state.SoH = math.Max(0, 100-totalDegradation)

	// Increase internal resistance with degradation
	// 50% increase at 80% SoH
	m.internalResistance = 0.018 * (1 + 0.5*(100-m.state.SoH)/20)
}

// GetState returns current battery state
func (m *BatteryModel) GetState() BatteryState {
	return m.state
}

// SetTemperature sets pack temperature
func (m *BatteryModel) SetTemperature(temp float64) {
	m.state.Temperature = temp
}

// GetMaxChargePower returns max charge power at current state
func (m *BatteryModel) GetMaxChargePower() float64 {
	// Reduce charge rate at high SoC (CC-CV transition)
	var factor float64
	if m.state.SoC < 80 {
		factor = 1.0 // Full power CC phase
	} else {
		// Linear taper from 80% to 100%
		factor = 1.0 - (m.state.SoC-80)/20*0.8
	}

	// Temperature derating
	if m.state.Temperature < 0 {
		factor *= 0.3 // Very limited charging below 0°C
	} else if m.state.Temperature < 10 {
		factor *= 0.5 + 0.5*(m.state.Temperature/10)
	} else if m.state.Temperature > 45 {
		factor *= math.Max(0, 1-(m.state.Temperature-45)/15)
	}

	return m.specs.ImaxChargeA * m.state.Voltage * factor
}

// GetMaxDischargePower returns max discharge power at current state
func (m *BatteryModel) GetMaxDischargePower() float64 {
	// Reduce discharge at low SoC
	var factor float64
	if m.state.SoC > 20 {
		factor = 1.0
	} else {
		factor = m.state.SoC / 20
	}

	// Temperature derating (less restrictive than charging)
	if m.state.Temperature < -10 {
		factor *= 0.5
	} else if m.state.Temperature > 50 {
		factor *= math.Max(0, 1-(m.state.Temperature-50)/10)
	}

	return m.specs.ImaxDischargeA * m.state.Voltage * factor
}

// EstimateRange returns estimated range in km based on current state
func (m *BatteryModel) EstimateRange(consumptionKWhPerKm float64) float64 {
	if consumptionKWhPerKm <= 0 {
		return 0
	}

	// Available energy
	availableKWh := m.specs.UsableCapacityKWh * (m.state.SoC / 100) * (m.state.SoH / 100)

	return availableKWh / consumptionKWhPerKm
}

// TimeToCharge returns estimated time to reach target SoC in hours
func (m *BatteryModel) TimeToCharge(targetSoC, chargePowerKW float64) float64 {
	if chargePowerKW <= 0 || targetSoC <= m.state.SoC {
		return 0
	}

	// Energy needed
	socDelta := targetSoC - m.state.SoC
	energyNeededKWh := m.specs.NominalCapacityKWh * (socDelta / 100) * (m.state.SoH / 100)

	// Account for charging efficiency (~95%)
	energyNeededKWh /= 0.95

	return energyNeededKWh / chargePowerKW
}
