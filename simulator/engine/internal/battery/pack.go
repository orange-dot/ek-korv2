package battery

import (
	"fmt"
	"math"
)

// PackType represents battery pack types
type PackType int

const (
	PackEKBAT25  PackType = iota // 25 kWh for vans
	PackEKBAT50                  // 50 kWh for city buses
	PackEKBAT100                 // 100 kWh for trucks
)

// String returns pack type name
func (p PackType) String() string {
	switch p {
	case PackEKBAT25:
		return "EK-BAT-25"
	case PackEKBAT50:
		return "EK-BAT-50"
	case PackEKBAT100:
		return "EK-BAT-100"
	default:
		return "unknown"
	}
}

// PackSpec defines pack specifications
type PackSpec struct {
	Type            PackType
	NominalCapacity float64 // kWh
	NominalVoltage  float64 // V
	MaxVoltage      float64 // V (full charge)
	MinVoltage      float64 // V (empty)
	MaxChargeCRate  float64 // C-rate
	MaxDischargeCRate float64 // C-rate
	SeriesCells     int     // Number of cells in series
	ParallelStrings int     // Number of parallel strings
	Weight          float64 // kg
}

// GetPackSpec returns specification for pack type
func GetPackSpec(packType PackType) PackSpec {
	switch packType {
	case PackEKBAT25:
		return PackSpec{
			Type:              PackEKBAT25,
			NominalCapacity:   25,
			NominalVoltage:    400,
			MaxVoltage:        460,
			MinVoltage:        320,
			MaxChargeCRate:    2.0,
			MaxDischargeCRate: 3.0,
			SeriesCells:       126,  // 126s for ~400V (126 × 3.2V)
			ParallelStrings:   1,
			Weight:            150,
		}
	case PackEKBAT50:
		return PackSpec{
			Type:              PackEKBAT50,
			NominalCapacity:   50,
			NominalVoltage:    400,
			MaxVoltage:        460,
			MinVoltage:        320,
			MaxChargeCRate:    2.0,
			MaxDischargeCRate: 3.0,
			SeriesCells:       126,
			ParallelStrings:   2,
			Weight:            300,
		}
	case PackEKBAT100:
		return PackSpec{
			Type:              PackEKBAT100,
			NominalCapacity:   100,
			NominalVoltage:    800,
			MaxVoltage:        920,
			MinVoltage:        640,
			MaxChargeCRate:    2.0,
			MaxDischargeCRate: 3.0,
			SeriesCells:       252,  // 252s for ~800V
			ParallelStrings:   2,
			Weight:            600,
		}
	default:
		return PackSpec{}
	}
}

// Pack represents a complete battery pack
type Pack struct {
	ID   string
	Spec PackSpec

	// Cell array [parallel][series]
	Cells [][]*Cell

	// Aggregate state
	Voltage     float64 // Pack voltage [V]
	Current     float64 // Pack current [A]
	SOC         float64 // Pack SOC (0-100%)
	SOH         float64 // Pack SOH (0-100%)
	Temperature float64 // Average temperature [°C]
	Power       float64 // Instantaneous power [W]

	// Statistics
	CycleCount  float64 // Equivalent full cycles
	EnergyIn    float64 // Total energy charged [kWh]
	EnergyOut   float64 // Total energy discharged [kWh]

	// Imbalance
	CellVoltageMin   float64
	CellVoltageMax   float64
	CellVoltageSpread float64
	CellTempMin      float64
	CellTempMax      float64
}

// NewPack creates a new battery pack
func NewPack(id string, packType PackType) *Pack {
	spec := GetPackSpec(packType)
	cellSpec := DefaultLFPSpec()

	// Adjust cell capacity for parallel strings
	cellSpec.NominalCapacity = spec.NominalCapacity * 1000 / (float64(spec.SeriesCells) * cellSpec.NominalVoltage) / float64(spec.ParallelStrings)

	pack := &Pack{
		ID:   id,
		Spec: spec,
	}

	// Create cell array
	pack.Cells = make([][]*Cell, spec.ParallelStrings)
	for p := 0; p < spec.ParallelStrings; p++ {
		pack.Cells[p] = make([]*Cell, spec.SeriesCells)
		for s := 0; s < spec.SeriesCells; s++ {
			pack.Cells[p][s] = NewCell(cellSpec)
		}
	}

	// Initial calculation
	pack.updateAggregates()

	return pack
}

// Update simulates pack for one time step
// current: pack current [A] (positive = discharge)
// ambientTemp: ambient temperature [°C]
// dt: time step [s]
func (p *Pack) Update(current, ambientTemp, dt float64) {
	p.Current = current

	// Distribute current across parallel strings
	stringCurrent := current / float64(p.Spec.ParallelStrings)

	// Update all cells
	for par := 0; par < p.Spec.ParallelStrings; par++ {
		for ser := 0; ser < p.Spec.SeriesCells; ser++ {
			p.Cells[par][ser].Update(stringCurrent, ambientTemp, dt)
		}
	}

	// Calculate power and energy
	p.Power = p.Voltage * current
	if current > 0 {
		p.EnergyOut += p.Power * dt / 3600000 // W·s to kWh
	} else {
		p.EnergyIn += -p.Power * dt / 3600000
	}

	// Track cycles (simplified: 1 full discharge = 1 cycle)
	if current > 0 {
		p.CycleCount += current * dt / (p.Spec.NominalCapacity * 1000 * 3600)
	}

	// Update aggregates
	p.updateAggregates()
}

// updateAggregates calculates pack-level values from cells
func (p *Pack) updateAggregates() {
	var totalVoltage float64
	var totalSOC float64
	var totalSOH float64
	var totalTemp float64
	cellCount := 0

	p.CellVoltageMin = math.MaxFloat64
	p.CellVoltageMax = -math.MaxFloat64
	p.CellTempMin = math.MaxFloat64
	p.CellTempMax = -math.MaxFloat64

	// For series connection, add voltages
	// For parallel, average them (should be equal if balanced)
	for par := 0; par < p.Spec.ParallelStrings; par++ {
		stringVoltage := 0.0
		for ser := 0; ser < p.Spec.SeriesCells; ser++ {
			cell := p.Cells[par][ser]
			stringVoltage += cell.Voltage
			totalSOC += cell.SOC
			totalSOH += cell.GetSOH()
			totalTemp += cell.Temperature
			cellCount++

			// Track min/max
			if cell.Voltage < p.CellVoltageMin {
				p.CellVoltageMin = cell.Voltage
			}
			if cell.Voltage > p.CellVoltageMax {
				p.CellVoltageMax = cell.Voltage
			}
			if cell.Temperature < p.CellTempMin {
				p.CellTempMin = cell.Temperature
			}
			if cell.Temperature > p.CellTempMax {
				p.CellTempMax = cell.Temperature
			}
		}
		totalVoltage += stringVoltage
	}

	// Average voltage across parallel strings
	p.Voltage = totalVoltage / float64(p.Spec.ParallelStrings)
	p.SOC = totalSOC / float64(cellCount) * 100
	p.SOH = totalSOH / float64(cellCount)
	p.Temperature = totalTemp / float64(cellCount)
	p.CellVoltageSpread = p.CellVoltageMax - p.CellVoltageMin
}

// GetMaxChargePower returns maximum charge power [W]
func (p *Pack) GetMaxChargePower() float64 {
	// Find minimum across all cells
	minCurrent := math.MaxFloat64
	for par := 0; par < p.Spec.ParallelStrings; par++ {
		for ser := 0; ser < p.Spec.SeriesCells; ser++ {
			maxI := p.Cells[par][ser].GetMaxChargeCurrent()
			if maxI < minCurrent {
				minCurrent = maxI
			}
		}
	}

	// Scale by parallel strings
	packCurrent := minCurrent * float64(p.Spec.ParallelStrings)
	return packCurrent * p.Voltage
}

// GetMaxDischargePower returns maximum discharge power [W]
func (p *Pack) GetMaxDischargePower() float64 {
	// Find minimum across all cells
	minCurrent := math.MaxFloat64
	for par := 0; par < p.Spec.ParallelStrings; par++ {
		for ser := 0; ser < p.Spec.SeriesCells; ser++ {
			maxI := p.Cells[par][ser].GetMaxDischargeCurrent()
			if maxI < minCurrent {
				minCurrent = maxI
			}
		}
	}

	// Scale by parallel strings
	packCurrent := minCurrent * float64(p.Spec.ParallelStrings)
	return packCurrent * p.Voltage
}

// GetEnergy returns available energy [kWh]
func (p *Pack) GetEnergy() float64 {
	return p.Spec.NominalCapacity * (p.SOC / 100) * (p.SOH / 100)
}

// GetCellVoltages returns all cell voltages as 2D array
func (p *Pack) GetCellVoltages() [][]float64 {
	voltages := make([][]float64, p.Spec.ParallelStrings)
	for par := 0; par < p.Spec.ParallelStrings; par++ {
		voltages[par] = make([]float64, p.Spec.SeriesCells)
		for ser := 0; ser < p.Spec.SeriesCells; ser++ {
			voltages[par][ser] = p.Cells[par][ser].Voltage
		}
	}
	return voltages
}

// GetCellTemperatures returns all cell temperatures
func (p *Pack) GetCellTemperatures() [][]float64 {
	temps := make([][]float64, p.Spec.ParallelStrings)
	for par := 0; par < p.Spec.ParallelStrings; par++ {
		temps[par] = make([]float64, p.Spec.SeriesCells)
		for ser := 0; ser < p.Spec.SeriesCells; ser++ {
			temps[par][ser] = p.Cells[par][ser].Temperature
		}
	}
	return temps
}

// GetHeatGenerated returns total heat generated [W]
func (p *Pack) GetHeatGenerated() float64 {
	var total float64
	for par := 0; par < p.Spec.ParallelStrings; par++ {
		for ser := 0; ser < p.Spec.SeriesCells; ser++ {
			total += p.Cells[par][ser].HeatGenerated
		}
	}
	return total
}

// SetTemperature sets temperature for all cells (for thermal simulation)
func (p *Pack) SetTemperature(temp float64) {
	for par := 0; par < p.Spec.ParallelStrings; par++ {
		for ser := 0; ser < p.Spec.SeriesCells; ser++ {
			p.Cells[par][ser].Temperature = temp
		}
	}
	p.Temperature = temp
}

// SetCellTemperatures sets individual cell temperatures
func (p *Pack) SetCellTemperatures(temps [][]float64) {
	for par := 0; par < p.Spec.ParallelStrings && par < len(temps); par++ {
		for ser := 0; ser < p.Spec.SeriesCells && ser < len(temps[par]); ser++ {
			p.Cells[par][ser].Temperature = temps[par][ser]
		}
	}
	p.updateAggregates()
}

// IsHealthy returns true if pack is within operating limits
func (p *Pack) IsHealthy() bool {
	// Check voltage limits
	if p.Voltage < p.Spec.MinVoltage || p.Voltage > p.Spec.MaxVoltage {
		return false
	}

	// Check cell imbalance (>50mV is concerning)
	if p.CellVoltageSpread > 0.05 {
		return false
	}

	// Check temperature spread (>5°C indicates problem)
	if p.CellTempMax-p.CellTempMin > 5 {
		return false
	}

	// Check individual cells
	for par := 0; par < p.Spec.ParallelStrings; par++ {
		for ser := 0; ser < p.Spec.SeriesCells; ser++ {
			if !p.Cells[par][ser].IsHealthy() {
				return false
			}
		}
	}

	return true
}

// String returns pack description
func (p *Pack) String() string {
	return fmt.Sprintf("%s %s: %.1fV %.1f%% SOC %.1f%% SOH %.1f°C",
		p.ID, p.Spec.Type.String(), p.Voltage, p.SOC, p.SOH, p.Temperature)
}
