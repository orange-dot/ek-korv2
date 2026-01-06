package battery

import (
	"math"
)

// CoolingType represents cooling system type
type CoolingType int

const (
	CoolingPassive CoolingType = iota // Natural convection only
	CoolingForced                     // Forced air cooling
	CoolingLiquid                     // Liquid cooling (glycol)
)

// String returns cooling type name
func (c CoolingType) String() string {
	switch c {
	case CoolingPassive:
		return "passive"
	case CoolingForced:
		return "forced_air"
	case CoolingLiquid:
		return "liquid"
	default:
		return "unknown"
	}
}

// ThermalConfig holds thermal system configuration
type ThermalConfig struct {
	CoolingType CoolingType

	// Thermal masses [J/K]
	CellThermalMass float64 // Per cell
	PackThermalMass float64 // Total pack structure

	// Thermal resistances [K/W]
	CellToCell      float64 // Between adjacent cells
	CellToCoolant   float64 // Cell to coolant (liquid)
	CellToAir       float64 // Cell to air (forced/passive)
	CoolantToAmbient float64 // Coolant to ambient (radiator)

	// Liquid cooling parameters
	CoolantFlowMax   float64 // Max flow rate [L/min]
	CoolantCp        float64 // Specific heat [J/(kg·K)]
	CoolantDensity   float64 // Density [kg/L]

	// Forced air parameters
	FanFlowMax       float64 // Max air flow [CFM]
	FanPowerMax      float64 // Max fan power [W]

	// Heater parameters
	HeaterPowerMax   float64 // Max heater power [W]

	// Control targets
	TargetTemp       float64 // Target cell temperature [°C]
	TempHysteresis   float64 // Control hysteresis [°C]
	HeatingThreshold float64 // Start heating below [°C]
	CoolingThreshold float64 // Start cooling above [°C]
}

// DefaultThermalConfig returns default configuration for liquid cooling
func DefaultThermalConfig() ThermalConfig {
	return ThermalConfig{
		CoolingType:      CoolingLiquid,
		CellThermalMass:  1500, // J/K
		PackThermalMass:  50000, // J/K
		CellToCell:       1.0,  // K/W
		CellToCoolant:    0.5,  // K/W
		CellToAir:        5.0,  // K/W
		CoolantToAmbient: 0.1,  // K/W
		CoolantFlowMax:   10,   // L/min
		CoolantCp:        3400, // J/(kg·K) for 50/50 glycol
		CoolantDensity:   1.07, // kg/L
		FanFlowMax:       200,  // CFM
		FanPowerMax:      100,  // W
		HeaterPowerMax:   2000, // W
		TargetTemp:       25,   // °C
		TempHysteresis:   2,    // °C
		HeatingThreshold: 10,   // °C
		CoolingThreshold: 35,   // °C
	}
}

// ThermalModel manages battery pack thermal simulation
type ThermalModel struct {
	Config ThermalConfig
	Pack   *Pack

	// Coolant state (liquid cooling)
	CoolantTempIn  float64 // Inlet temperature [°C]
	CoolantTempOut float64 // Outlet temperature [°C]
	CoolantFlow    float64 // Current flow rate [L/min]
	PumpPower      float64 // Pump power consumption [W]

	// Forced air state
	FanSpeed float64 // Fan speed 0-100%
	FanPower float64 // Fan power [W]

	// Heater state
	HeaterActive bool
	HeaterPower  float64 // Current heater power [W]

	// Aggregate values
	AvgCellTemp     float64 // Average cell temperature [°C]
	MaxCellTemp     float64 // Maximum cell temperature [°C]
	MinCellTemp     float64 // Minimum cell temperature [°C]
	TotalHeatGen    float64 // Total heat generated [W]
	TotalHeatRemoved float64 // Heat removed by cooling [W]

	// Ambient
	AmbientTemp float64 // Ambient temperature [°C]
}

// NewThermalModel creates a new thermal model
func NewThermalModel(pack *Pack, config ThermalConfig) *ThermalModel {
	return &ThermalModel{
		Config:      config,
		Pack:        pack,
		AmbientTemp: 25,
		CoolantTempIn: 25,
	}
}

// Update runs thermal simulation for one time step
// ambientTemp: ambient temperature [°C]
// dt: time step [s]
func (t *ThermalModel) Update(ambientTemp, dt float64) {
	t.AmbientTemp = ambientTemp

	// Calculate heat generation from all cells
	t.TotalHeatGen = t.Pack.GetHeatGenerated()

	// Run cooling control
	t.controlCooling()

	// Calculate heat removal
	switch t.Config.CoolingType {
	case CoolingLiquid:
		t.updateLiquidCooling(dt)
	case CoolingForced:
		t.updateForcedAirCooling(dt)
	case CoolingPassive:
		t.updatePassiveCooling(dt)
	}

	// Check for heating requirement
	t.controlHeating()

	// Update cell temperatures
	t.updateCellTemperatures(dt)

	// Update aggregate values
	t.updateAggregates()
}

// controlCooling determines cooling system setpoints
func (t *ThermalModel) controlCooling() {
	avgTemp := t.Pack.Temperature

	if avgTemp > t.Config.CoolingThreshold+t.Config.TempHysteresis {
		// Full cooling needed
		switch t.Config.CoolingType {
		case CoolingLiquid:
			// Proportional control of flow
			error := avgTemp - t.Config.TargetTemp
			t.CoolantFlow = clamp(error/10*t.Config.CoolantFlowMax, 0, t.Config.CoolantFlowMax)
		case CoolingForced:
			// Proportional fan speed
			error := avgTemp - t.Config.TargetTemp
			t.FanSpeed = clamp(error/10*100, 0, 100)
		}
	} else if avgTemp < t.Config.CoolingThreshold-t.Config.TempHysteresis {
		// Minimal cooling
		t.CoolantFlow = t.Config.CoolantFlowMax * 0.1 // 10% min flow
		t.FanSpeed = 10
	}
}

// updateLiquidCooling simulates liquid cooling
func (t *ThermalModel) updateLiquidCooling(dt float64) {
	if t.CoolantFlow < 0.1 {
		t.CoolantFlow = 0.1 // Minimum flow
	}

	// Mass flow rate [kg/s]
	massFlow := t.CoolantFlow / 60 * t.Config.CoolantDensity

	// Heat capacity rate [W/K]
	C := massFlow * t.Config.CoolantCp

	// Heat transfer from cells to coolant
	// Q = UA * (T_cell - T_coolant)
	// Simplified: assume uniform cell temp
	avgCellTemp := t.Pack.Temperature
	avgCoolantTemp := (t.CoolantTempIn + t.CoolantTempOut) / 2

	// Effective UA [W/K]
	UA := float64(t.Pack.Spec.SeriesCells*t.Pack.Spec.ParallelStrings) / t.Config.CellToCoolant

	// Heat removed [W]
	heatRemoved := UA * (avgCellTemp - avgCoolantTemp)
	if heatRemoved < 0 {
		heatRemoved = 0 // Can't add heat via cooling
	}

	t.TotalHeatRemoved = heatRemoved

	// Coolant temperature rise
	if C > 0 {
		t.CoolantTempOut = t.CoolantTempIn + heatRemoved/C
	}

	// Radiator heat rejection (coolant to ambient)
	radiatorQ := (t.CoolantTempOut - t.AmbientTemp) / t.Config.CoolantToAmbient
	if radiatorQ > 0 {
		t.CoolantTempIn = t.CoolantTempOut - radiatorQ/C
	}

	// Pump power (proportional to flow^3)
	t.PumpPower = 50 * math.Pow(t.CoolantFlow/t.Config.CoolantFlowMax, 3)
}

// updateForcedAirCooling simulates forced air cooling
func (t *ThermalModel) updateForcedAirCooling(dt float64) {
	// Heat transfer coefficient depends on fan speed
	// h = h0 * (1 + k * sqrt(V))
	hFactor := 1 + 0.5*math.Sqrt(t.FanSpeed/100)

	// Effective thermal resistance
	rEffective := t.Config.CellToAir / hFactor

	// Heat removed from each cell
	avgCellTemp := t.Pack.Temperature
	heatRemoved := (avgCellTemp - t.AmbientTemp) / rEffective *
		float64(t.Pack.Spec.SeriesCells*t.Pack.Spec.ParallelStrings)

	if heatRemoved < 0 {
		heatRemoved = 0
	}

	t.TotalHeatRemoved = heatRemoved

	// Fan power
	t.FanPower = t.Config.FanPowerMax * math.Pow(t.FanSpeed/100, 3)
}

// updatePassiveCooling simulates natural convection
func (t *ThermalModel) updatePassiveCooling(dt float64) {
	// Simple natural convection
	avgCellTemp := t.Pack.Temperature
	heatRemoved := (avgCellTemp - t.AmbientTemp) / t.Config.CellToAir *
		float64(t.Pack.Spec.SeriesCells*t.Pack.Spec.ParallelStrings)

	if heatRemoved < 0 {
		heatRemoved = 0
	}

	t.TotalHeatRemoved = heatRemoved
}

// controlHeating manages battery heating
func (t *ThermalModel) controlHeating() {
	avgTemp := t.Pack.Temperature

	if avgTemp < t.Config.HeatingThreshold-t.Config.TempHysteresis {
		t.HeaterActive = true
		// Proportional power
		error := t.Config.HeatingThreshold - avgTemp
		t.HeaterPower = clamp(error/5*t.Config.HeaterPowerMax, 0, t.Config.HeaterPowerMax)
	} else if avgTemp > t.Config.HeatingThreshold+t.Config.TempHysteresis {
		t.HeaterActive = false
		t.HeaterPower = 0
	}
}

// updateCellTemperatures updates individual cell temperatures
func (t *ThermalModel) updateCellTemperatures(dt float64) {
	// Heat balance per cell:
	// m*Cp*dT/dt = Q_gen - Q_cool + Q_heater/N + Q_neighbor

	cellCount := float64(t.Pack.Spec.SeriesCells * t.Pack.Spec.ParallelStrings)
	heaterPerCell := t.HeaterPower / cellCount
	coolPerCell := t.TotalHeatRemoved / cellCount

	for p := 0; p < t.Pack.Spec.ParallelStrings; p++ {
		for s := 0; s < t.Pack.Spec.SeriesCells; s++ {
			cell := t.Pack.Cells[p][s]

			// Net heat [W]
			netHeat := cell.HeatGenerated - coolPerCell + heaterPerCell

			// Neighbor heat exchange (simplified - average with neighbors)
			neighborQ := 0.0
			neighborCount := 0
			if s > 0 {
				neighborQ += (t.Pack.Cells[p][s-1].Temperature - cell.Temperature) / t.Config.CellToCell
				neighborCount++
			}
			if s < t.Pack.Spec.SeriesCells-1 {
				neighborQ += (t.Pack.Cells[p][s+1].Temperature - cell.Temperature) / t.Config.CellToCell
				neighborCount++
			}
			if neighborCount > 0 {
				netHeat += neighborQ / float64(neighborCount)
			}

			// Temperature change
			dT := netHeat / t.Config.CellThermalMass * dt
			cell.Temperature += dT
		}
	}
}

// updateAggregates calculates aggregate thermal values
func (t *ThermalModel) updateAggregates() {
	var sum float64
	t.MinCellTemp = math.MaxFloat64
	t.MaxCellTemp = -math.MaxFloat64

	cellCount := 0
	for p := 0; p < t.Pack.Spec.ParallelStrings; p++ {
		for s := 0; s < t.Pack.Spec.SeriesCells; s++ {
			temp := t.Pack.Cells[p][s].Temperature
			sum += temp
			cellCount++

			if temp < t.MinCellTemp {
				t.MinCellTemp = temp
			}
			if temp > t.MaxCellTemp {
				t.MaxCellTemp = temp
			}
		}
	}

	t.AvgCellTemp = sum / float64(cellCount)
}

// SetAmbientTemp sets ambient temperature
func (t *ThermalModel) SetAmbientTemp(temp float64) {
	t.AmbientTemp = temp
}

// SetCoolantInletTemp sets coolant inlet temperature
func (t *ThermalModel) SetCoolantInletTemp(temp float64) {
	t.CoolantTempIn = temp
}

// GetTotalPowerConsumption returns total parasitic power [W]
func (t *ThermalModel) GetTotalPowerConsumption() float64 {
	return t.PumpPower + t.FanPower + t.HeaterPower
}

// GetThermalMargin returns temperature margin to limit [°C]
func (t *ThermalModel) GetThermalMargin() float64 {
	return 60 - t.MaxCellTemp // Assuming 60°C max
}

// GetStats returns thermal statistics
func (t *ThermalModel) GetStats() ThermalStats {
	return ThermalStats{
		AvgCellTemp:     t.AvgCellTemp,
		MaxCellTemp:     t.MaxCellTemp,
		MinCellTemp:     t.MinCellTemp,
		TempSpread:      t.MaxCellTemp - t.MinCellTemp,
		HeatGenerated:   t.TotalHeatGen,
		HeatRemoved:     t.TotalHeatRemoved,
		CoolantFlow:     t.CoolantFlow,
		CoolantTempIn:   t.CoolantTempIn,
		CoolantTempOut:  t.CoolantTempOut,
		PumpPower:       t.PumpPower,
		FanSpeed:        t.FanSpeed,
		FanPower:        t.FanPower,
		HeaterActive:    t.HeaterActive,
		HeaterPower:     t.HeaterPower,
		AmbientTemp:     t.AmbientTemp,
	}
}

// ThermalStats holds thermal model statistics
type ThermalStats struct {
	AvgCellTemp    float64 // °C
	MaxCellTemp    float64 // °C
	MinCellTemp    float64 // °C
	TempSpread     float64 // °C
	HeatGenerated  float64 // W
	HeatRemoved    float64 // W
	CoolantFlow    float64 // L/min
	CoolantTempIn  float64 // °C
	CoolantTempOut float64 // °C
	PumpPower      float64 // W
	FanSpeed       float64 // %
	FanPower       float64 // W
	HeaterActive   bool
	HeaterPower    float64 // W
	AmbientTemp    float64 // °C
}
