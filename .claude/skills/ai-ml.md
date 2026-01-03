# Skill: ai-ml

AI/ML design for predictive maintenance and optimization.

## When to Use

- For predictive maintenance algorithms
- For digital twin design
- For anomaly detection
- For self-tuning control

## AI Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       CLOUD LAYER                            │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐      │
│   │   Digital   │   │  Predictive │   │    Fleet    │      │
│   │    Twins    │   │  Analytics  │   │  Learning   │      │
│   └─────────────┘   └─────────────┘   └─────────────┘      │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │ MQTT/HTTPS
┌───────────────────────────┼──────────────────────────────────┐
│                      EDGE LAYER                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              STATION CONTROLLER                      │   │
│   │   • Aggregated anomaly detection                    │   │
│   │   • Module swap scheduling                          │   │
│   │   • Local inference (TensorFlow Lite)               │   │
│   └─────────────────────────────────────────────────────┘   │
└───────────────────────────┼──────────────────────────────────┘
                            │ CAN-FD
┌───────────────────────────┼──────────────────────────────────┐
│                     MODULE LAYER                             │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐               │
│   │   EK3    │   │   EK3    │   │   EK3    │               │
│   │ • TSEP   │   │ • TSEP   │   │ • TSEP   │               │
│   │ • Rules  │   │ • Rules  │   │ • Rules  │               │
│   └──────────┘   └──────────┘   └──────────┘               │
└─────────────────────────────────────────────────────────────┘
```

## Predictive Maintenance

### Health Indicators

```
1. ESR Trending (Capacitors)
   - Baseline: Measured at install
   - Alarm: +20% from baseline
   - Replace: +50% from baseline
   - RUL: Linear extrapolation

2. Junction Temperature (TSEP)
   - Monitor: Vds(on) method
   - Alarm: Tj > 125°C
   - Derating: Tj > 100°C
   - Aging: dRds(on)/dT correlation

3. Efficiency Degradation
   - Baseline: >96%
   - Warning: <94%
   - Critical: <90%
   - Root cause: Switching/conduction split
```

### Prediction Tiers

```
Tier 1 - Trend Analysis (weeks):
  Input: ESR, efficiency history
  Method: Linear regression
  Action: Schedule replacement

Tier 2 - Anomaly Detection (hours):
  Input: Real-time telemetry
  Method: Isolation Forest / LSTM
  Action: Alert, increase monitoring

Tier 3 - Reactive (minutes):
  Input: Fault flags
  Method: Rule-based
  Action: Immediate swap
```

## Digital Twin

```
Per-module digital twin (200+ parameters):

Static:
  - Serial number, manufacturing date
  - Calibration data
  - Component lot numbers

Dynamic:
  - Operating hours
  - Thermal cycles
  - ESR measurements
  - Efficiency history
  - Fault events

Simulation:
  - What-if scenarios
  - Remaining useful life (RUL)
  - Optimal load allocation
```

## Self-Tuning Control

```
LLC Resonant Tuning:
  - Dead time optimization
  - Frequency tracking
  - Burst mode threshold

Inputs:
  - Temperature
  - Load
  - Component aging

Method:
  - Online parameter estimation
  - Lookup table interpolation
  - Adaptive PID
```

## Model Training

```
Data requirements:
  - 6 months operating data
  - 100+ failure examples
  - Labeled anomalies

Pipeline:
  1. Feature extraction (edge)
  2. Aggregation (station)
  3. Training (cloud)
  4. Deployment (edge inference)

Federated learning:
  - Model updates, not raw data
  - Privacy preserving
  - Fleet-wide improvement
```

## Files

- `tehnika/02-ai-ml-sistem.md`
- `patent/03-TECHNICAL-SUPPORT/SENSOR-ARCHITECTURE.md`

## Example

```
/ai-ml anomaly-detection ESR-trending
```