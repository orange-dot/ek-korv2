package battery

import (
	"math"
)

// SOHTracker tracks State of Health using cycle and calendar aging models.
//
// Degradation is modeled as:
// 1. Cycle aging - from charge/discharge cycles (Rainflow counting)
// 2. Calendar aging - from time and storage conditions (Arrhenius)
type SOHTracker struct {
	// Initial capacity
	initialCapacity float64 // Ah

	// Current capacity
	currentCapacity float64 // Ah

	// SOH (0-1)
	soh float64

	// Cycle aging state
	cycleCount      float64 // Equivalent full cycles
	cycleDamage     float64 // Accumulated damage (0-1)
	socHistory      []float64 // For Rainflow counting
	maxHistoryLen   int

	// Calendar aging state
	calendarDays    float64 // Days elapsed
	calendarDamage  float64 // Accumulated damage (0-1)
	avgTemperature  float64 // Running average temp
	avgSOC          float64 // Running average SOC
	sampleCount     int

	// Model parameters (LFP-specific)
	cycleLifeCoeff    float64 // Base cycle life
	calendarCoeff     float64 // Calendar aging rate
	tempCoeff         float64 // Temperature acceleration (Arrhenius)
	dodExponent       float64 // DoD exponent for cycle life

	// Resistance tracking
	initialResistance float64 // Initial R [Ω]
	resistanceGrowth  float64 // Growth factor (1.0 = new)
}

// NewSOHTracker creates a new SOH tracker
func NewSOHTracker(initialCapacityAh float64) *SOHTracker {
	return &SOHTracker{
		initialCapacity:   initialCapacityAh,
		currentCapacity:   initialCapacityAh,
		soh:               1.0,
		maxHistoryLen:     1000,
		cycleLifeCoeff:    4000, // 4000 cycles at 100% DoD
		calendarCoeff:     0.02, // 2% per year at 25°C, 50% SOC
		tempCoeff:         3500, // Arrhenius activation energy / R
		dodExponent:       0.5,  // Square-root DoD dependence
		initialResistance: 0.001,
		resistanceGrowth:  1.0,
	}
}

// Update processes new data and updates SOH
// soc: current SOC (0-1)
// temperature: cell temperature [°C]
// dt: time step [s]
func (s *SOHTracker) Update(soc, temperature, dt float64) {
	// Track SOC history for rainflow
	s.updateSOCHistory(soc)

	// Update running averages
	s.updateAverages(soc, temperature)

	// Calendar aging (continuous)
	s.updateCalendarAging(temperature, soc, dt)

	// Cycle aging (from SOC transitions)
	s.updateCycleAging()

	// Calculate total SOH
	s.calculateSOH()
}

// updateSOCHistory adds SOC to history for rainflow counting
func (s *SOHTracker) updateSOCHistory(soc float64) {
	// Only add if different enough from last (reduces noise)
	if len(s.socHistory) > 0 {
		last := s.socHistory[len(s.socHistory)-1]
		if math.Abs(soc-last) < 0.01 {
			return
		}
	}

	s.socHistory = append(s.socHistory, soc)

	// Limit history length
	if len(s.socHistory) > s.maxHistoryLen {
		// Keep only local extrema
		s.socHistory = s.extractExtrema(s.socHistory)
	}
}

// extractExtrema extracts local minima and maxima from SOC history
func (s *SOHTracker) extractExtrema(history []float64) []float64 {
	if len(history) < 3 {
		return history
	}

	extrema := []float64{history[0]}
	for i := 1; i < len(history)-1; i++ {
		prev := history[i-1]
		curr := history[i]
		next := history[i+1]

		// Local max or min
		if (curr > prev && curr > next) || (curr < prev && curr < next) {
			extrema = append(extrema, curr)
		}
	}
	extrema = append(extrema, history[len(history)-1])

	return extrema
}

// updateAverages updates running averages
func (s *SOHTracker) updateAverages(soc, temperature float64) {
	s.sampleCount++
	alpha := 1.0 / float64(s.sampleCount)
	if alpha < 0.001 {
		alpha = 0.001 // Minimum weight
	}

	s.avgTemperature = (1-alpha)*s.avgTemperature + alpha*temperature
	s.avgSOC = (1-alpha)*s.avgSOC + alpha*soc
}

// updateCalendarAging calculates calendar aging damage
func (s *SOHTracker) updateCalendarAging(temperature, soc, dt float64) {
	// Convert dt to days
	days := dt / 86400

	// Arrhenius temperature factor
	// k = k0 * exp(-Ea / (R * T))
	// Reference: 25°C (298 K)
	tempK := temperature + 273.15
	tempRef := 298.15
	tempFactor := math.Exp(s.tempCoeff * (1/tempRef - 1/tempK))

	// SOC factor (higher SOC = faster aging)
	// Approximate: aging ~ 1 + 0.5*(SOC - 0.5)
	socFactor := 1 + 0.5*(soc-0.5)

	// Calendar damage rate
	damageRate := s.calendarCoeff / 365 * tempFactor * socFactor

	// Accumulate damage
	s.calendarDamage += damageRate * days
	s.calendarDays += days
}

// updateCycleAging uses simplified rainflow counting
func (s *SOHTracker) updateCycleAging() {
	if len(s.socHistory) < 3 {
		return
	}

	// Simplified rainflow: count completed cycles
	cycles := s.countCycles()

	// Calculate damage from cycles
	for _, cycle := range cycles {
		dod := cycle.amplitude // Depth of discharge
		meanSOC := cycle.mean

		// Cycle life depends on DoD and mean SOC
		// N(DoD) = N0 * DoD^(-b)
		cycleLife := s.cycleLifeCoeff * math.Pow(dod+0.01, -s.dodExponent)

		// Mean SOC effect (high/low SOC = faster aging)
		socStress := 1 + 0.3*math.Abs(meanSOC-0.5)

		// Damage from this cycle
		damage := 1.0 / cycleLife * socStress

		s.cycleDamage += damage
		s.cycleCount += cycle.count
	}
}

// cycleInfo holds cycle information from rainflow
type cycleInfo struct {
	amplitude float64 // Half-cycle amplitude (DoD)
	mean      float64 // Mean SOC
	count     float64 // Cycle count (0.5 or 1.0)
}

// countCycles performs simplified rainflow counting
func (s *SOHTracker) countCycles() []cycleInfo {
	var cycles []cycleInfo

	if len(s.socHistory) < 2 {
		return cycles
	}

	// Process pairs of transitions
	i := 0
	for i < len(s.socHistory)-1 {
		start := s.socHistory[i]
		end := s.socHistory[i+1]

		amplitude := math.Abs(end - start)
		mean := (start + end) / 2

		if amplitude > 0.02 { // Ignore small transitions
			cycles = append(cycles, cycleInfo{
				amplitude: amplitude,
				mean:      mean,
				count:     0.5, // Half-cycle
			})
		}

		i++
	}

	// Clear processed history
	if len(s.socHistory) > 1 {
		s.socHistory = s.socHistory[len(s.socHistory)-1:]
	}

	return cycles
}

// calculateSOH computes total SOH from all degradation
func (s *SOHTracker) calculateSOH() {
	// Total damage is sum of cycle and calendar
	totalDamage := s.cycleDamage + s.calendarDamage

	// SOH = 1 - damage (clamped)
	s.soh = clamp(1-totalDamage, 0, 1)

	// Update capacity
	s.currentCapacity = s.initialCapacity * s.soh

	// Update resistance (grows with degradation)
	// Resistance roughly doubles at EOL
	s.resistanceGrowth = 1 + totalDamage
}

// GetSOH returns current SOH as percentage
func (s *SOHTracker) GetSOH() float64 {
	return s.soh * 100
}

// GetCapacityFade returns capacity fade factor (1.0 = no fade)
func (s *SOHTracker) GetCapacityFade() float64 {
	return s.soh
}

// GetResistanceGrowth returns resistance growth factor
func (s *SOHTracker) GetResistanceGrowth() float64 {
	return s.resistanceGrowth
}

// GetCycleCount returns equivalent full cycles
func (s *SOHTracker) GetCycleCount() float64 {
	return s.cycleCount
}

// GetRemainingCycles estimates remaining cycles at current usage
func (s *SOHTracker) GetRemainingCycles() float64 {
	if s.cycleCount < 1 {
		return s.cycleLifeCoeff // Full life if no cycles yet
	}

	// Estimate based on current damage rate
	avgDamagePerCycle := s.cycleDamage / s.cycleCount
	if avgDamagePerCycle <= 0 {
		return s.cycleLifeCoeff
	}

	remainingDamage := 0.2 // EOL at 80% SOH
	if s.soh > 0.8 {
		remainingDamage = 1 - s.soh
	}

	return remainingDamage / avgDamagePerCycle
}

// GetExpectedLifeYears estimates remaining calendar life
func (s *SOHTracker) GetExpectedLifeYears() float64 {
	if s.calendarDays < 1 {
		return 20 // Default 20 years if no data
	}

	avgDamagePerDay := s.calendarDamage / s.calendarDays
	if avgDamagePerDay <= 0 {
		return 20
	}

	remainingDamage := 0.2
	if s.soh > 0.8 {
		remainingDamage = 1 - s.soh
	}

	remainingDays := remainingDamage / avgDamagePerDay
	return remainingDays / 365
}

// Reset resets tracker to initial state
func (s *SOHTracker) Reset() {
	s.currentCapacity = s.initialCapacity
	s.soh = 1.0
	s.cycleCount = 0
	s.cycleDamage = 0
	s.calendarDamage = 0
	s.calendarDays = 0
	s.socHistory = nil
	s.avgTemperature = 25
	s.avgSOC = 0.5
	s.sampleCount = 0
	s.resistanceGrowth = 1.0
}

// SetDegradation manually sets degradation state
func (s *SOHTracker) SetDegradation(soh, cycleCount float64) {
	s.soh = clamp(soh, 0, 1)
	s.cycleCount = cycleCount
	s.currentCapacity = s.initialCapacity * s.soh
	s.cycleDamage = 1 - s.soh
	s.resistanceGrowth = 1 + (1 - s.soh)
}

// GetStats returns degradation statistics
func (s *SOHTracker) GetStats() SOHStats {
	return SOHStats{
		SOH:               s.soh * 100,
		CapacityAh:        s.currentCapacity,
		CycleCount:        s.cycleCount,
		CycleDamage:       s.cycleDamage * 100,
		CalendarDamage:    s.calendarDamage * 100,
		CalendarDays:      s.calendarDays,
		ResistanceGrowth:  s.resistanceGrowth,
		RemainingCycles:   s.GetRemainingCycles(),
		RemainingYears:    s.GetExpectedLifeYears(),
		AvgTemperature:    s.avgTemperature,
		AvgSOC:            s.avgSOC * 100,
	}
}

// SOHStats holds SOH tracking statistics
type SOHStats struct {
	SOH              float64 // %
	CapacityAh       float64 // Ah
	CycleCount       float64 // Cycles
	CycleDamage      float64 // % from cycles
	CalendarDamage   float64 // % from calendar
	CalendarDays     float64 // Days
	ResistanceGrowth float64 // Factor
	RemainingCycles  float64 // Estimated
	RemainingYears   float64 // Estimated
	AvgTemperature   float64 // °C
	AvgSOC           float64 // %
}
