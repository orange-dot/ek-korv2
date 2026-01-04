package models

import (
	"math"
	"math/rand"
)

// FaultType represents different failure modes
type FaultType int

const (
	FaultNone FaultType = iota
	FaultMOSFETDegradation    // Rds(on) increase
	FaultCapacitorAging       // ESR increase
	FaultTIMDegradation       // Thermal resistance increase
	FaultSolderFatigue        // Intermittent contact
	FaultGateOxide            // Gate driver failure
	FaultTransformerWinding   // Winding short/open
	FaultCoolingFan           // Fan failure
	FaultControlCircuit       // MCU/driver failure
)

// FaultTypeNames maps fault types to names
var FaultTypeNames = map[FaultType]string{
	FaultNone:               "None",
	FaultMOSFETDegradation:  "MOSFET Degradation",
	FaultCapacitorAging:     "Capacitor Aging",
	FaultTIMDegradation:     "TIM Degradation",
	FaultSolderFatigue:      "Solder Fatigue",
	FaultGateOxide:          "Gate Oxide",
	FaultTransformerWinding: "Transformer Winding",
	FaultCoolingFan:         "Cooling Fan",
	FaultControlCircuit:     "Control Circuit",
}

// ReliabilityMetrics holds observable symptoms
type ReliabilityMetrics struct {
	// Degradation indicators (ratio to baseline, 1.0 = healthy)
	RdsOnRatio   float64 // MOSFET on-resistance
	ESRRatio     float64 // Capacitor ESR
	RthRatio     float64 // Thermal resistance
	EffLoss      float64 // Efficiency loss from baseline

	// Operating history
	OperatingHours float64
	PowerCycles    int
	ThermalCycles  int
	MaxTjSeen      float64 // Peak junction temp ever seen
	AvgTj          float64 // Running average Tj

	// Fault detection
	OVPCount   int // Over-voltage protection trips
	OCPCount   int // Over-current protection trips
	OTPCount   int // Over-temperature protection trips
}

// BayesianFaultPredictor predicts faults using Bayesian inference
type BayesianFaultPredictor struct {
	// Prior probabilities P(fault_type)
	priors map[FaultType]float64

	// Conditional probabilities P(symptom | fault_type)
	// Simplified as thresholds and weights
	symptomWeights map[FaultType]map[string]float64

	// Current posterior probabilities
	posteriors map[FaultType]float64
}

// NewBayesianFaultPredictor creates a new fault predictor
func NewBayesianFaultPredictor() *BayesianFaultPredictor {
	p := &BayesianFaultPredictor{
		priors:         make(map[FaultType]float64),
		symptomWeights: make(map[FaultType]map[string]float64),
		posteriors:     make(map[FaultType]float64),
	}

	// Prior probabilities based on field data / MTBF
	// Sum to ~0.10 (10% cumulative failure rate assumption)
	p.priors[FaultMOSFETDegradation] = 0.025
	p.priors[FaultCapacitorAging] = 0.020
	p.priors[FaultTIMDegradation] = 0.015
	p.priors[FaultSolderFatigue] = 0.010
	p.priors[FaultGateOxide] = 0.008
	p.priors[FaultTransformerWinding] = 0.005
	p.priors[FaultCoolingFan] = 0.012
	p.priors[FaultControlCircuit] = 0.005

	// Symptom weights: how strongly each symptom indicates each fault
	p.symptomWeights[FaultMOSFETDegradation] = map[string]float64{
		"rds_on":    0.9,  // Strong indicator
		"esr":       0.1,
		"rth":       0.3,
		"eff_loss":  0.7,
		"ocp":       0.5,
	}
	p.symptomWeights[FaultCapacitorAging] = map[string]float64{
		"rds_on":   0.1,
		"esr":      0.9, // Strong indicator
		"rth":      0.1,
		"eff_loss": 0.5,
	}
	p.symptomWeights[FaultTIMDegradation] = map[string]float64{
		"rds_on":   0.2,
		"esr":      0.1,
		"rth":      0.9, // Strong indicator
		"eff_loss": 0.4,
		"otp":      0.7,
	}
	p.symptomWeights[FaultSolderFatigue] = map[string]float64{
		"rds_on":        0.3,
		"intermittent":  0.9, // Not directly measured, inferred from variance
		"thermal_cycle": 0.8,
	}
	p.symptomWeights[FaultCoolingFan] = map[string]float64{
		"rth":      0.6,
		"otp":      0.8,
		"temp_var": 0.7,
	}

	// Initialize posteriors to priors
	for ft, prior := range p.priors {
		p.posteriors[ft] = prior
	}

	return p
}

// UpdatePosteriors updates fault probabilities given symptoms
func (p *BayesianFaultPredictor) UpdatePosteriors(metrics ReliabilityMetrics) {
	// Calculate symptom severities (0-1)
	symptoms := make(map[string]float64)

	// Rds(on) degradation symptom
	symptoms["rds_on"] = math.Min(1.0, math.Max(0, (metrics.RdsOnRatio-1.0)/0.5))

	// ESR degradation symptom
	symptoms["esr"] = math.Min(1.0, math.Max(0, (metrics.ESRRatio-1.0)/0.5))

	// Thermal resistance symptom
	symptoms["rth"] = math.Min(1.0, math.Max(0, (metrics.RthRatio-1.0)/0.3))

	// Efficiency loss symptom
	symptoms["eff_loss"] = math.Min(1.0, math.Max(0, metrics.EffLoss/0.05))

	// Protection trip symptoms
	symptoms["ocp"] = math.Min(1.0, float64(metrics.OCPCount)/10)
	symptoms["otp"] = math.Min(1.0, float64(metrics.OTPCount)/10)

	// Thermal cycling symptom (normalized to 10000 cycles)
	symptoms["thermal_cycle"] = math.Min(1.0, float64(metrics.ThermalCycles)/10000)

	// Bayesian update for each fault type
	// P(fault | symptoms) ∝ P(symptoms | fault) * P(fault)
	totalEvidence := 0.0

	for faultType, prior := range p.priors {
		weights := p.symptomWeights[faultType]
		if weights == nil {
			continue
		}

		// Calculate likelihood P(symptoms | fault)
		likelihood := 1.0
		for symptom, severity := range symptoms {
			weight := weights[symptom]
			if weight > 0 && severity > 0 {
				// Weighted symptom contribution
				likelihood *= 1 + weight*severity
			}
		}

		// Posterior ∝ likelihood * prior
		posterior := likelihood * prior
		p.posteriors[faultType] = posterior
		totalEvidence += posterior
	}

	// Normalize posteriors
	if totalEvidence > 0 {
		for ft := range p.posteriors {
			p.posteriors[ft] /= totalEvidence
		}
	}
}

// GetTopFaults returns most likely faults sorted by probability
func (p *BayesianFaultPredictor) GetTopFaults(n int) []FaultPrediction {
	predictions := make([]FaultPrediction, 0, len(p.posteriors))

	for ft, prob := range p.posteriors {
		predictions = append(predictions, FaultPrediction{
			Type:        ft,
			Name:        FaultTypeNames[ft],
			Probability: prob,
		})
	}

	// Sort by probability descending
	for i := 0; i < len(predictions)-1; i++ {
		for j := i + 1; j < len(predictions); j++ {
			if predictions[j].Probability > predictions[i].Probability {
				predictions[i], predictions[j] = predictions[j], predictions[i]
			}
		}
	}

	if n > len(predictions) {
		n = len(predictions)
	}
	return predictions[:n]
}

// FaultPrediction holds a fault prediction result
type FaultPrediction struct {
	Type        FaultType
	Name        string
	Probability float64
}

// ============================================================================
// RUL (Remaining Useful Life) Estimator
// ============================================================================

// RULEstimator estimates remaining useful life
type RULEstimator struct {
	arrheniusParams     ArrheniusParams
	coffinMansonParams  CoffinMansonParams

	// Historical trend data
	esrHistory   []float64
	rdsOnHistory []float64
	tempHistory  []float64
}

// NewRULEstimator creates a new RUL estimator
func NewRULEstimator() *RULEstimator {
	return &RULEstimator{
		arrheniusParams:    DefaultArrheniusParams(),
		coffinMansonParams: DefaultCoffinMansonParams(),
		esrHistory:         make([]float64, 0, 1000),
		rdsOnHistory:       make([]float64, 0, 1000),
		tempHistory:        make([]float64, 0, 1000),
	}
}

// RecordMetrics records current metrics for trending
func (r *RULEstimator) RecordMetrics(esr, rdsOn, temp float64) {
	// Keep last 1000 samples
	if len(r.esrHistory) >= 1000 {
		r.esrHistory = r.esrHistory[1:]
		r.rdsOnHistory = r.rdsOnHistory[1:]
		r.tempHistory = r.tempHistory[1:]
	}

	r.esrHistory = append(r.esrHistory, esr)
	r.rdsOnHistory = append(r.rdsOnHistory, rdsOn)
	r.tempHistory = append(r.tempHistory, temp)
}

// EstimateRUL estimates remaining useful life in hours
func (r *RULEstimator) EstimateRUL(metrics ReliabilityMetrics) RULResult {
	result := RULResult{
		EstimatedHours: 50000, // Default MTBF
		Confidence:     0.5,
	}

	// Component-based RUL estimates

	// 1. Capacitor life (Arrhenius)
	capLife := CalculateRemainingLife(r.arrheniusParams, metrics.OperatingHours, metrics.AvgTj)

	// 2. MOSFET life (Coffin-Manson)
	avgDeltaTj := 30.0 // Assume 30°C typical thermal swing
	if metrics.MaxTjSeen > metrics.AvgTj {
		avgDeltaTj = metrics.MaxTjSeen - metrics.AvgTj
	}
	mosfetCyclesRemaining := CalculateCyclesRemaining(r.coffinMansonParams, avgDeltaTj, metrics.ThermalCycles)
	// Convert cycles to hours (assume 10 cycles/hour average)
	mosfetLife := float64(mosfetCyclesRemaining) / 10.0

	// 3. Trend-based prediction
	trendLife := r.predictFromTrend(metrics)

	// Combine estimates (minimum approach, conservative)
	result.EstimatedHours = math.Min(capLife, math.Min(mosfetLife, trendLife))
	result.CapacitorRUL = capLife
	result.MOSFETRUL = mosfetLife
	result.TrendRUL = trendLife

	// Confidence based on data quality
	result.Confidence = r.calculateConfidence(metrics)

	// Classify urgency
	if result.EstimatedHours < 168 { // < 1 week
		result.Urgency = "CRITICAL"
	} else if result.EstimatedHours < 336 { // < 2 weeks
		result.Urgency = "WARNING"
	} else if result.EstimatedHours < 720 { // < 1 month
		result.Urgency = "MONITOR"
	} else {
		result.Urgency = "NORMAL"
	}

	return result
}

// predictFromTrend uses linear regression on degradation trends
func (r *RULEstimator) predictFromTrend(metrics ReliabilityMetrics) float64 {
	if len(r.esrHistory) < 10 {
		return 100000 // Not enough data
	}

	// Calculate ESR slope
	esrSlope := r.calculateSlope(r.esrHistory)

	// ESR failure threshold: 1.5x baseline
	esrThreshold := 1.5
	if esrSlope > 0 && metrics.ESRRatio < esrThreshold {
		samplesToFailure := (esrThreshold - metrics.ESRRatio) / esrSlope
		// Assume 1 sample per hour
		return samplesToFailure
	}

	// Similarly for Rds(on)
	rdsSlope := r.calculateSlope(r.rdsOnHistory)
	rdsThreshold := 1.5
	if rdsSlope > 0 && metrics.RdsOnRatio < rdsThreshold {
		samplesToFailure := (rdsThreshold - metrics.RdsOnRatio) / rdsSlope
		return samplesToFailure
	}

	return 100000 // Stable, long life expected
}

// calculateSlope calculates linear regression slope
func (r *RULEstimator) calculateSlope(data []float64) float64 {
	n := float64(len(data))
	if n < 2 {
		return 0
	}

	// Simple linear regression
	var sumX, sumY, sumXY, sumX2 float64
	for i, y := range data {
		x := float64(i)
		sumX += x
		sumY += y
		sumXY += x * y
		sumX2 += x * x
	}

	denominator := n*sumX2 - sumX*sumX
	if denominator == 0 {
		return 0
	}

	return (n*sumXY - sumX*sumY) / denominator
}

// calculateConfidence returns confidence score (0-1)
func (r *RULEstimator) calculateConfidence(metrics ReliabilityMetrics) float64 {
	confidence := 0.5 // Base confidence

	// More data = higher confidence
	dataPoints := float64(len(r.esrHistory))
	confidence += math.Min(0.3, dataPoints/1000*0.3)

	// Consistent trends = higher confidence
	if len(r.esrHistory) > 10 {
		variance := r.calculateVariance(r.esrHistory[len(r.esrHistory)-10:])
		if variance < 0.01 {
			confidence += 0.2
		}
	}

	return math.Min(1.0, confidence)
}

// calculateVariance calculates variance of data
func (r *RULEstimator) calculateVariance(data []float64) float64 {
	if len(data) < 2 {
		return 0
	}

	var sum, sumSq float64
	for _, v := range data {
		sum += v
		sumSq += v * v
	}

	n := float64(len(data))
	mean := sum / n
	return sumSq/n - mean*mean
}

// RULResult holds RUL estimation results
type RULResult struct {
	EstimatedHours float64 // Combined estimate
	Confidence     float64 // 0-1
	Urgency        string  // CRITICAL, WARNING, MONITOR, NORMAL

	// Component breakdown
	CapacitorRUL float64
	MOSFETRUL    float64
	TrendRUL     float64
}

// ============================================================================
// Fault Injection for Testing
// ============================================================================

// FaultInjector simulates fault injection for testing
type FaultInjector struct {
	activeFaults map[FaultType]float64 // fault -> severity (0-1)
}

// NewFaultInjector creates a new fault injector
func NewFaultInjector() *FaultInjector {
	return &FaultInjector{
		activeFaults: make(map[FaultType]float64),
	}
}

// InjectFault injects a fault with given severity
func (f *FaultInjector) InjectFault(faultType FaultType, severity float64) {
	f.activeFaults[faultType] = math.Max(0, math.Min(1, severity))
}

// ClearFault clears an injected fault
func (f *FaultInjector) ClearFault(faultType FaultType) {
	delete(f.activeFaults, faultType)
}

// ClearAll clears all injected faults
func (f *FaultInjector) ClearAll() {
	f.activeFaults = make(map[FaultType]float64)
}

// ApplyToMetrics modifies metrics based on active faults
func (f *FaultInjector) ApplyToMetrics(metrics *ReliabilityMetrics) {
	for faultType, severity := range f.activeFaults {
		switch faultType {
		case FaultMOSFETDegradation:
			metrics.RdsOnRatio *= 1 + severity*0.5
		case FaultCapacitorAging:
			metrics.ESRRatio *= 1 + severity*0.5
		case FaultTIMDegradation:
			metrics.RthRatio *= 1 + severity*0.3
		case FaultCoolingFan:
			metrics.RthRatio *= 1 + severity*0.5
			// Temperature increases
		}
	}
}

// GenerateRandomFault randomly generates a fault for testing
func (f *FaultInjector) GenerateRandomFault(probability float64) FaultType {
	if rand.Float64() > probability {
		return FaultNone
	}

	// Weighted random selection
	faults := []FaultType{
		FaultMOSFETDegradation,
		FaultCapacitorAging,
		FaultTIMDegradation,
		FaultSolderFatigue,
		FaultCoolingFan,
	}

	return faults[rand.Intn(len(faults))]
}
