package models

import (
	"math"
)

// ThermalConstants holds thermal parameters for EK3 module
type ThermalConstants struct {
	// Thermal resistances (K/W)
	RthJC float64 // Junction to case: 0.3 K/W
	RthCH float64 // Case to heatsink (TIM): 0.15 K/W
	RthHA float64 // Heatsink to ambient: 0.6 K/W @ 12 CFM

	// Thermal capacitances (J/K) - for transient response
	CthJ float64 // Junction thermal mass
	CthH float64 // Heatsink thermal mass

	// Temperature limits (°C)
	TjMax       float64 // Maximum junction temp: 150°C
	TjWarn      float64 // Warning threshold: 105°C
	TjDerate    float64 // Start derating: 100°C
	TjShutdown  float64 // Emergency shutdown: 120°C
	TambientMax float64 // Max ambient: 55°C
}

// DefaultThermalConstants returns default EK3 thermal parameters
func DefaultThermalConstants() ThermalConstants {
	return ThermalConstants{
		RthJC:       0.3,
		RthCH:       0.15,
		RthHA:       0.6,
		CthJ:        0.5,   // Small thermal mass at junction
		CthH:        50.0,  // Larger heatsink mass
		TjMax:       150.0,
		TjWarn:      105.0,
		TjDerate:    100.0,
		TjShutdown:  120.0,
		TambientMax: 55.0,
	}
}

// ThermalState holds current thermal state
type ThermalState struct {
	Tj       float64 // Junction temperature (°C)
	Tc       float64 // Case temperature (°C)
	Th       float64 // Heatsink temperature (°C)
	Tambient float64 // Ambient temperature (°C)
	Ploss    float64 // Power loss (W)
	RthTotal float64 // Total thermal resistance (K/W)
}

// ThermalModel simulates thermal behavior of EK3 module
type ThermalModel struct {
	constants ThermalConstants
	state     ThermalState
}

// NewThermalModel creates a new thermal model
func NewThermalModel(ambient float64) *ThermalModel {
	c := DefaultThermalConstants()
	return &ThermalModel{
		constants: c,
		state: ThermalState{
			Tj:       ambient + 5, // Slightly above ambient at startup
			Tc:       ambient + 3,
			Th:       ambient + 1,
			Tambient: ambient,
			RthTotal: c.RthJC + c.RthCH + c.RthHA,
		},
	}
}

// Update calculates new thermal state
// powerOut: output power (W)
// efficiency: current efficiency (0-1)
// dt: time step (seconds)
func (m *ThermalModel) Update(powerOut, efficiency, dt float64) ThermalState {
	c := m.constants

	// Power loss = P_out * (1 - η) / η
	// For 3300W @ 96% efficiency: Ploss = 3300 * 0.04 / 0.96 = 137.5W
	if efficiency > 0 && efficiency < 1 {
		m.state.Ploss = powerOut * (1 - efficiency) / efficiency
	} else {
		m.state.Ploss = 0
	}

	// Steady-state temperatures (thermal resistance network)
	// Tj_ss = Tambient + Ploss * Rth_total
	TjSteady := m.state.Tambient + m.state.Ploss*m.state.RthTotal
	ThSteady := m.state.Tambient + m.state.Ploss*c.RthHA

	// First-order thermal dynamics (RC time constant)
	// τ = Rth * Cth
	tauJ := c.RthJC * c.CthJ // Fast junction response (~0.15s)
	tauH := c.RthHA * c.CthH // Slow heatsink response (~30s)

	// Exponential approach to steady state
	alphaJ := 1 - math.Exp(-dt/tauJ)
	alphaH := 1 - math.Exp(-dt/tauH)

	// Update temperatures
	m.state.Tj = m.state.Tj + alphaJ*(TjSteady-m.state.Tj)
	m.state.Th = m.state.Th + alphaH*(ThSteady-m.state.Th)
	m.state.Tc = ThSteady + m.state.Ploss*c.RthCH // Case between heatsink and junction

	return m.state
}

// SetAmbient updates ambient temperature
func (m *ThermalModel) SetAmbient(temp float64) {
	m.state.Tambient = temp
}

// GetState returns current thermal state
func (m *ThermalModel) GetState() ThermalState {
	return m.state
}

// CalculateDerating returns power derating factor (0-1) based on temperature
// Uses linear derating from TjDerate to TjShutdown
func (m *ThermalModel) CalculateDerating() float64 {
	c := m.constants
	tj := m.state.Tj

	if tj <= c.TjDerate {
		return 1.0 // Full power
	}
	if tj >= c.TjShutdown {
		return 0.0 // Shutdown
	}

	// Linear derating between TjDerate and TjShutdown
	// 100°C: 100%, 110°C: 50%, 120°C: 0%
	return 1.0 - (tj-c.TjDerate)/(c.TjShutdown-c.TjDerate)
}

// AmbientDerating returns max power factor based on ambient temperature
// Per spec: 100% @ 35°C, 91% @ 40°C, 70% @ 50°C, 55% @ 55°C, 0% @ 60°C
func (m *ThermalModel) AmbientDerating() float64 {
	ta := m.state.Tambient

	if ta <= 35 {
		return 1.0
	}
	if ta >= 60 {
		return 0.0
	}

	// Piecewise linear approximation
	// Based on: Pmax = Pn * (1 - (Ta - 35) / 25)^0.7
	factor := 1.0 - (ta-35)/25
	return math.Pow(math.Max(0, factor), 0.7)
}

// IsOverTemp returns true if temperature exceeds warning threshold
func (m *ThermalModel) IsOverTemp() bool {
	return m.state.Tj >= m.constants.TjWarn
}

// IsCritical returns true if temperature exceeds shutdown threshold
func (m *ThermalModel) IsCritical() bool {
	return m.state.Tj >= m.constants.TjShutdown
}

// ============================================================================
// Arrhenius Model for Capacitor Aging
// ============================================================================

// ArrheniusParams holds parameters for temperature-accelerated aging
type ArrheniusParams struct {
	Ea float64 // Activation energy (eV), typically 0.6-0.8 for Al electrolytics
	K  float64 // Boltzmann constant: 8.617e-5 eV/K
	T0 float64 // Reference temperature (K), typically 378K (105°C)
	L0 float64 // Rated life at T0 (hours)
}

// DefaultArrheniusParams returns typical capacitor aging parameters
func DefaultArrheniusParams() ArrheniusParams {
	return ArrheniusParams{
		Ea: 0.7,        // eV - typical for film capacitors
		K:  8.617e-5,   // eV/K
		T0: 378,        // K (105°C)
		L0: 50000,      // hours rated life
	}
}

// CalculateAccelerationFactor returns aging acceleration factor
// Based on Arrhenius equation: AF = exp(Ea/k * (1/T - 1/T0))
// Higher temperature = higher AF = faster aging
func CalculateAccelerationFactor(params ArrheniusParams, tempC float64) float64 {
	T := tempC + 273.15 // Convert to Kelvin

	// Prevent division by zero
	if T <= 0 {
		return 1.0
	}

	exponent := params.Ea / params.K * (1/T - 1/params.T0)
	return math.Exp(exponent)
}

// CalculateRemainingLife returns remaining useful life in hours
// Uses Arrhenius model with temperature history
func CalculateRemainingLife(params ArrheniusParams, operatingHours, avgTempC float64) float64 {
	af := CalculateAccelerationFactor(params, avgTempC)

	// Effective hours = actual hours * acceleration factor
	effectiveHours := operatingHours * af

	// Remaining life = rated life - effective hours
	remaining := params.L0 - effectiveHours

	return math.Max(0, remaining)
}

// ============================================================================
// Coffin-Manson Model for Power Cycling
// ============================================================================

// CoffinMansonParams holds parameters for thermal cycling fatigue
type CoffinMansonParams struct {
	A float64 // Material constant, typically 5e12 for SiC
	N float64 // Fatigue exponent, typically 5-6 for SiC
}

// DefaultCoffinMansonParams returns typical SiC MOSFET parameters
func DefaultCoffinMansonParams() CoffinMansonParams {
	return CoffinMansonParams{
		A: 5e12,
		N: 5.0,
	}
}

// CalculateCyclesRemaining returns remaining thermal cycles before failure
// Based on: Nf = A * (ΔTj)^(-n)
func CalculateCyclesRemaining(params CoffinMansonParams, deltaTj float64, cyclesUsed int) int {
	if deltaTj <= 0 {
		return 1e9 // Essentially infinite
	}

	// Total cycles to failure at this delta-T
	Nf := params.A * math.Pow(deltaTj, -params.N)

	// Remaining cycles
	remaining := int(Nf) - cyclesUsed

	return max(0, remaining)
}

// CalculateDamage returns cumulative damage fraction (0-1)
// Based on Miner's rule: D = Σ(ni / Nfi)
func CalculateDamage(params CoffinMansonParams, deltaTj float64, cycles int) float64 {
	if deltaTj <= 0 {
		return 0
	}

	Nf := params.A * math.Pow(deltaTj, -params.N)
	damage := float64(cycles) / Nf

	return math.Min(1.0, damage)
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
