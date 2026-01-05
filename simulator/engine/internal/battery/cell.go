// Package battery implements EK-BAT battery pack simulation including
// cell models, BMS, SOC/SOH estimation, and thermal management.
//
// Reference: tehnika/inzenjersko/en/22-jezgro-bat.md
package battery

import (
	"math"
)

// CellChemistry represents battery chemistry types
type CellChemistry int

const (
	ChemistryLFP CellChemistry = iota // LiFePO4 (primary)
	ChemistryNMC                      // NMC (future)
	ChemistryLTO                      // Lithium Titanate (fast charge)
)

// String returns chemistry name
func (c CellChemistry) String() string {
	switch c {
	case ChemistryLFP:
		return "LFP"
	case ChemistryNMC:
		return "NMC"
	case ChemistryLTO:
		return "LTO"
	default:
		return "unknown"
	}
}

// CellSpec defines cell specifications
type CellSpec struct {
	Chemistry       CellChemistry
	NominalCapacity float64 // Ah
	NominalVoltage  float64 // V
	MaxVoltage      float64 // V (full charge)
	MinVoltage      float64 // V (empty)
	MaxChargeCRate  float64 // Maximum charge C-rate
	MaxDischargeCRate float64 // Maximum discharge C-rate
	InternalR       float64 // Internal resistance [Ω]
	ThermalMass     float64 // J/K (heat capacity)
	Weight          float64 // kg
}

// DefaultLFPSpec returns spec for LFP cell
func DefaultLFPSpec() CellSpec {
	return CellSpec{
		Chemistry:         ChemistryLFP,
		NominalCapacity:   100.0, // 100 Ah prismatic
		NominalVoltage:    3.2,
		MaxVoltage:        3.65,
		MinVoltage:        2.5,
		MaxChargeCRate:    2.0, // 2C charge
		MaxDischargeCRate: 3.0, // 3C discharge
		InternalR:         0.5e-3, // 0.5 mΩ
		ThermalMass:       1500.0, // J/K
		Weight:            2.0, // kg
	}
}

// Cell represents a single battery cell
type Cell struct {
	Spec CellSpec

	// State
	SOC         float64 // State of Charge (0-1)
	Voltage     float64 // Terminal voltage [V]
	Current     float64 // Current [A] (+ = discharge)
	Temperature float64 // Cell temperature [°C]

	// Open Circuit Voltage lookup (SOC → Voltage)
	ocvTable []float64 // 101 points (0%, 1%, ..., 100%)

	// Degradation state
	CapacityFade     float64 // Remaining capacity factor (1.0 = new)
	ResistanceGrowth float64 // Resistance increase factor (1.0 = new)
	CycleCount       float64 // Equivalent full cycles

	// Thermal state
	HeatGenerated float64 // W (current heat generation)
}

// NewCell creates a new cell with given spec
func NewCell(spec CellSpec) *Cell {
	cell := &Cell{
		Spec:             spec,
		SOC:              0.5, // Start at 50% SOC
		Temperature:      25.0, // 25°C ambient
		CapacityFade:     1.0,
		ResistanceGrowth: 1.0,
	}

	// Initialize OCV table based on chemistry
	cell.initOCVTable()

	// Set initial voltage
	cell.Voltage = cell.GetOCV(cell.SOC)

	return cell
}

// initOCVTable initializes OCV lookup table based on chemistry
func (c *Cell) initOCVTable() {
	c.ocvTable = make([]float64, 101)

	switch c.Spec.Chemistry {
	case ChemistryLFP:
		// LFP has very flat voltage curve in middle
		c.ocvTable = []float64{
			2.50, 2.80, 2.95, 3.05, 3.12, 3.17, 3.20, 3.22, 3.23, 3.24, // 0-9%
			3.25, 3.25, 3.26, 3.26, 3.26, 3.27, 3.27, 3.27, 3.27, 3.27, // 10-19%
			3.27, 3.28, 3.28, 3.28, 3.28, 3.28, 3.28, 3.28, 3.28, 3.28, // 20-29%
			3.28, 3.28, 3.28, 3.29, 3.29, 3.29, 3.29, 3.29, 3.29, 3.29, // 30-39%
			3.29, 3.29, 3.29, 3.29, 3.29, 3.29, 3.29, 3.29, 3.30, 3.30, // 40-49%
			3.30, 3.30, 3.30, 3.30, 3.30, 3.30, 3.30, 3.30, 3.30, 3.30, // 50-59%
			3.30, 3.30, 3.31, 3.31, 3.31, 3.31, 3.31, 3.31, 3.31, 3.31, // 60-69%
			3.31, 3.32, 3.32, 3.32, 3.32, 3.32, 3.33, 3.33, 3.33, 3.34, // 70-79%
			3.34, 3.35, 3.35, 3.36, 3.37, 3.38, 3.39, 3.40, 3.42, 3.44, // 80-89%
			3.46, 3.48, 3.50, 3.52, 3.54, 3.56, 3.58, 3.60, 3.62, 3.64, // 90-99%
			3.65, // 100%
		}
	case ChemistryNMC:
		// NMC has more linear curve
		for i := 0; i <= 100; i++ {
			soc := float64(i) / 100.0
			c.ocvTable[i] = 3.0 + 1.2*soc // Linear approximation
		}
	default:
		// Default linear
		for i := 0; i <= 100; i++ {
			soc := float64(i) / 100.0
			min := c.Spec.MinVoltage
			max := c.Spec.MaxVoltage
			c.ocvTable[i] = min + (max-min)*soc
		}
	}
}

// GetOCV returns Open Circuit Voltage for given SOC
func (c *Cell) GetOCV(soc float64) float64 {
	soc = clamp(soc, 0, 1)
	index := int(soc * 100)
	if index >= 100 {
		return c.ocvTable[100]
	}

	// Linear interpolation between points
	frac := soc*100 - float64(index)
	return c.ocvTable[index]*(1-frac) + c.ocvTable[index+1]*frac
}

// GetTerminalVoltage returns terminal voltage under load
// V = OCV - I*R (I > 0 for discharge)
func (c *Cell) GetTerminalVoltage(current float64) float64 {
	ocv := c.GetOCV(c.SOC)
	rInternal := c.Spec.InternalR * c.ResistanceGrowth

	// Temperature effect on resistance (+0.5% per °C below 25°C)
	if c.Temperature < 25 {
		tempFactor := 1 + 0.005*(25-c.Temperature)
		rInternal *= tempFactor
	}

	return ocv - current*rInternal
}

// Update simulates cell for one time step
// current: positive = discharge, negative = charge
// dt: time step in seconds
func (c *Cell) Update(current, ambientTemp, dt float64) {
	c.Current = current

	// Calculate terminal voltage
	c.Voltage = c.GetTerminalVoltage(current)

	// Coulomb counting for SOC
	// dSOC = -I * dt / (Capacity * 3600)
	effectiveCapacity := c.Spec.NominalCapacity * c.CapacityFade
	dSOC := -current * dt / (effectiveCapacity * 3600)
	c.SOC = clamp(c.SOC+dSOC, 0, 1)

	// Heat generation
	// Q = I²R + I*(OCV - V) for entropic heat (simplified)
	rInternal := c.Spec.InternalR * c.ResistanceGrowth
	c.HeatGenerated = current*current*rInternal + math.Abs(current*(c.GetOCV(c.SOC)-c.Voltage))

	// Thermal model (simplified - external thermal manager handles this)
	// dT/dt = (Q - h*A*(T - T_ambient)) / (m*Cp)
	// For cell-level, just track heat generation
}

// GetMaxChargeCurrent returns maximum allowed charge current
func (c *Cell) GetMaxChargeCurrent() float64 {
	// Base max from C-rate
	maxI := c.Spec.NominalCapacity * c.Spec.MaxChargeCRate

	// Temperature derating
	if c.Temperature < 0 {
		// Below 0°C: reduce to 20%
		maxI *= 0.2
	} else if c.Temperature < 10 {
		// 0-10°C: linear derating
		maxI *= 0.2 + 0.8*(c.Temperature/10)
	} else if c.Temperature > 45 {
		// Above 45°C: reduce
		maxI *= math.Max(0, 1-0.1*(c.Temperature-45))
	}

	// SOC-based tapering (CC-CV transition)
	if c.SOC > 0.8 {
		// Taper above 80% SOC
		maxI *= 1 - (c.SOC-0.8)/0.2*0.8
	}

	return maxI
}

// GetMaxDischargeCurrent returns maximum allowed discharge current
func (c *Cell) GetMaxDischargeCurrent() float64 {
	// Base max from C-rate
	maxI := c.Spec.NominalCapacity * c.Spec.MaxDischargeCRate

	// Temperature derating
	if c.Temperature < -20 {
		// Below -20°C: reduce significantly
		maxI *= 0.3
	} else if c.Temperature < 0 {
		// -20 to 0°C: linear derating
		maxI *= 0.3 + 0.7*(c.Temperature+20)/20
	} else if c.Temperature > 55 {
		// Above 55°C: reduce
		maxI *= math.Max(0, 1-0.15*(c.Temperature-55))
	}

	// SOC-based protection (low SOC cutoff)
	if c.SOC < 0.1 {
		// Reduce below 10% SOC
		maxI *= c.SOC / 0.1
	}

	return maxI
}

// IsHealthy returns true if cell is within operating limits
func (c *Cell) IsHealthy() bool {
	// Voltage limits
	if c.Voltage < c.Spec.MinVoltage || c.Voltage > c.Spec.MaxVoltage {
		return false
	}

	// Temperature limits (-20°C to 60°C operating)
	if c.Temperature < -20 || c.Temperature > 60 {
		return false
	}

	// SOH threshold (80% capacity = end of life)
	if c.CapacityFade < 0.8 {
		return false
	}

	return true
}

// GetSOH returns State of Health as percentage
func (c *Cell) GetSOH() float64 {
	// SOH based on capacity fade and resistance growth
	// Weighted average: 70% capacity, 30% resistance
	capacitySOH := c.CapacityFade * 100
	resistanceSOH := math.Max(0, (2-c.ResistanceGrowth)) * 100 // 100% at 1.0, 0% at 2.0

	return 0.7*capacitySOH + 0.3*resistanceSOH
}

// GetEnergy returns available energy in Wh
func (c *Cell) GetEnergy() float64 {
	// E = SOC * Capacity * NominalVoltage * CapacityFade
	return c.SOC * c.Spec.NominalCapacity * c.Spec.NominalVoltage * c.CapacityFade
}

// clamp limits value to [min, max]
func clamp(val, min, max float64) float64 {
	if val < min {
		return min
	}
	if val > max {
		return max
	}
	return val
}
