package battery

import (
	"math"
)

// SOCEstimator implements State of Charge estimation using
// Coulomb counting with Extended Kalman Filter correction.
//
// The estimator combines:
// 1. Coulomb counting (integration of current)
// 2. OCV-based correction when current is low
// 3. Kalman filter for optimal fusion
type SOCEstimator struct {
	// Capacity
	capacity float64 // Nominal capacity [Ah]

	// State estimate
	soc float64 // Estimated SOC (0-1)

	// Coulomb counting state
	coulombs float64 // Accumulated Ah

	// Kalman filter state
	P float64 // Error covariance
	Q float64 // Process noise covariance
	R float64 // Measurement noise covariance

	// OCV lookup table for correction
	ocvTable []float64 // OCV vs SOC (101 points)

	// Rest detection for OCV correction
	restTimer   float64 // Time with low current [s]
	restThreshold float64 // Time before OCV correction [s]
	lowCurrentThreshold float64 // Current threshold for "rest" [A]

	// Statistics
	correctionCount int
	lastCorrection  float64 // SOC correction magnitude
}

// NewSOCEstimator creates a new SOC estimator
func NewSOCEstimator(capacityAh float64, ocvTable []float64) *SOCEstimator {
	e := &SOCEstimator{
		capacity:            capacityAh,
		soc:                 0.5, // Start at 50%
		P:                   0.01, // Initial covariance
		Q:                   1e-5, // Process noise (SOC drift per step)
		R:                   0.01, // Measurement noise (OCV-based SOC)
		restThreshold:       30.0, // 30 seconds rest
		lowCurrentThreshold: 1.0,  // 1A threshold
	}

	// Copy or create OCV table
	if ocvTable != nil && len(ocvTable) == 101 {
		e.ocvTable = make([]float64, 101)
		copy(e.ocvTable, ocvTable)
	} else {
		e.initDefaultOCVTable()
	}

	return e
}

// initDefaultOCVTable creates default LFP OCV table
func (e *SOCEstimator) initDefaultOCVTable() {
	e.ocvTable = []float64{
		2.50, 2.80, 2.95, 3.05, 3.12, 3.17, 3.20, 3.22, 3.23, 3.24,
		3.25, 3.25, 3.26, 3.26, 3.26, 3.27, 3.27, 3.27, 3.27, 3.27,
		3.27, 3.28, 3.28, 3.28, 3.28, 3.28, 3.28, 3.28, 3.28, 3.28,
		3.28, 3.28, 3.28, 3.29, 3.29, 3.29, 3.29, 3.29, 3.29, 3.29,
		3.29, 3.29, 3.29, 3.29, 3.29, 3.29, 3.29, 3.29, 3.30, 3.30,
		3.30, 3.30, 3.30, 3.30, 3.30, 3.30, 3.30, 3.30, 3.30, 3.30,
		3.30, 3.30, 3.31, 3.31, 3.31, 3.31, 3.31, 3.31, 3.31, 3.31,
		3.31, 3.32, 3.32, 3.32, 3.32, 3.32, 3.33, 3.33, 3.33, 3.34,
		3.34, 3.35, 3.35, 3.36, 3.37, 3.38, 3.39, 3.40, 3.42, 3.44,
		3.46, 3.48, 3.50, 3.52, 3.54, 3.56, 3.58, 3.60, 3.62, 3.64,
		3.65,
	}
}

// Update processes new measurements and returns updated SOC
// current: measured current [A] (positive = discharge)
// voltage: measured terminal voltage [V]
// dt: time step [s]
func (e *SOCEstimator) Update(current, voltage, dt float64) float64 {
	// Step 1: Coulomb counting (predict)
	e.coulombCount(current, dt)

	// Step 2: Check for rest condition
	if math.Abs(current) < e.lowCurrentThreshold {
		e.restTimer += dt
	} else {
		e.restTimer = 0
	}

	// Step 3: Kalman predict
	// State prediction: SOC stays the same (with noise)
	e.P += e.Q

	// Step 4: OCV correction when at rest
	if e.restTimer >= e.restThreshold {
		// Get SOC from OCV lookup
		ocvSOC := e.ocvToSOC(voltage)

		// Kalman update
		e.kalmanCorrect(ocvSOC)

		// Reset rest timer
		e.restTimer = 0
	}

	return e.soc
}

// coulombCount performs Coulomb counting
func (e *SOCEstimator) coulombCount(current, dt float64) {
	// dSOC = -I * dt / (Capacity * 3600)
	// Negative because discharge (positive I) reduces SOC
	dSOC := -current * dt / (e.capacity * 3600)

	// Update SOC
	e.soc = clamp(e.soc+dSOC, 0, 1)

	// Track coulombs for diagnostics
	e.coulombs += current * dt / 3600
}

// kalmanCorrect performs Kalman filter measurement update
func (e *SOCEstimator) kalmanCorrect(measuredSOC float64) {
	// Innovation
	innovation := measuredSOC - e.soc

	// Kalman gain: K = P / (P + R)
	K := e.P / (e.P + e.R)

	// State update: x = x + K * innovation
	correction := K * innovation
	e.soc = clamp(e.soc+correction, 0, 1)

	// Covariance update: P = (1 - K) * P
	e.P = (1 - K) * e.P

	// Track correction
	e.lastCorrection = correction
	e.correctionCount++
}

// ocvToSOC converts OCV voltage to SOC using lookup table
func (e *SOCEstimator) ocvToSOC(voltage float64) float64 {
	// Binary search for SOC that gives this OCV
	if voltage <= e.ocvTable[0] {
		return 0
	}
	if voltage >= e.ocvTable[100] {
		return 1
	}

	// Linear search (simple for 101 points)
	for i := 0; i < 100; i++ {
		if voltage >= e.ocvTable[i] && voltage < e.ocvTable[i+1] {
			// Linear interpolation
			frac := (voltage - e.ocvTable[i]) / (e.ocvTable[i+1] - e.ocvTable[i])
			return (float64(i) + frac) / 100
		}
	}

	return 0.5 // Fallback
}

// socToOCV converts SOC to OCV voltage
func (e *SOCEstimator) socToOCV(soc float64) float64 {
	soc = clamp(soc, 0, 1)
	index := int(soc * 100)
	if index >= 100 {
		return e.ocvTable[100]
	}

	frac := soc*100 - float64(index)
	return e.ocvTable[index]*(1-frac) + e.ocvTable[index+1]*frac
}

// GetSOC returns current SOC estimate (0-1)
func (e *SOCEstimator) GetSOC() float64 {
	return e.soc
}

// GetCovariance returns current error covariance
func (e *SOCEstimator) GetCovariance() float64 {
	return e.P
}

// GetConfidence returns confidence in estimate (0-100%)
func (e *SOCEstimator) GetConfidence() float64 {
	// Lower P = higher confidence
	// P=0.01 → 99%, P=0.1 → 90%, P=1 → 0%
	return clamp((1-e.P)*100, 0, 100)
}

// Reset resets the estimator to initial state
func (e *SOCEstimator) Reset(initialSOC float64) {
	e.soc = clamp(initialSOC, 0, 1)
	e.P = 0.01
	e.coulombs = 0
	e.restTimer = 0
	e.correctionCount = 0
	e.lastCorrection = 0
}

// SetSOC manually sets SOC (e.g., from full charge calibration)
func (e *SOCEstimator) SetSOC(soc float64) {
	e.soc = clamp(soc, 0, 1)
	e.P = 0.001 // High confidence after calibration
}

// SetTuning sets Kalman filter tuning parameters
func (e *SOCEstimator) SetTuning(Q, R float64) {
	e.Q = Q
	e.R = R
}

// GetCoulombs returns accumulated Ah
func (e *SOCEstimator) GetCoulombs() float64 {
	return e.coulombs
}

// GetCorrectionCount returns number of OCV corrections
func (e *SOCEstimator) GetCorrectionCount() int {
	return e.correctionCount
}

// GetLastCorrection returns last correction magnitude
func (e *SOCEstimator) GetLastCorrection() float64 {
	return e.lastCorrection
}
