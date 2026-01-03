# Skill: v2g-design

Vehicle-to-Grid (V2G) functionality design.

## When to Use

- For bidirectional charging implementation
- For grid services design
- For ISO 15118-20 integration

## V2G Architecture

```
┌─────────────────────────────────────────────────┐
│                    GRID                          │
│              400V AC 3-phase                     │
└────────────────────┬────────────────────────────┘
                     │
              ┌──────┴──────┐
              │ CENTRAL PFC │ ◄── Bidirectional
              │   (AC/DC)   │     Active Front End
              └──────┬──────┘
                     │ 650V DC Bus
     ┌───────────────┼───────────────┐
     │               │               │
┌────┴────┐    ┌────┴────┐    ┌────┴────┐
│   EK3   │    │   EK3   │    │   EK3   │
│  DC/DC  │◄──►│  DC/DC  │◄──►│  DC/DC  │
│ (Bidir) │    │ (Bidir) │    │ (Bidir) │
└────┬────┘    └────┬────┘    └────┬────┘
     │               │               │
     └───────────────┼───────────────┘
                     │
              ┌──────┴──────┐
              │   VEHICLE   │
              │   BATTERY   │
              └─────────────┘
```

## Grid Services

### Frequency Regulation
```
Frequency deviation → Power adjustment
±0.5 Hz → ±100% power
Response time: <2 seconds
```

### Reactive Power
```
Power factor: 0.9 leading to 0.9 lagging
Q = P × tan(φ)
For 1 MW: ±484 kVAr
```

### Peak Shaving
```
Grid signal → Reduce charging
Or: Discharge to grid
Ramp rate: 10%/min
```

## ISO 15118-20 Requirements

```
Bidirectional Power Transfer (BPT):
- Metering: ±0.5% accuracy
- Scheduling: 24h ahead
- Dynamic adjustment: Real-time
- Authentication: Plug & Charge
```

## Round-Trip Efficiency

```
AC → DC (charging): 96%
DC → DC (EK3): 96%
DC → AC (discharging): 96%
─────────────────────────
Round-trip: 96% × 96% × 96% = 88.5%
```

## Files

- `tehnika/04-v2g-grid.md`
- `patent/03-TECHNICAL-SUPPORT/EK3-DETAILED-DESIGN.md` (Bidir section)

## Example

```
/v2g-design frequency-response 500kW
```