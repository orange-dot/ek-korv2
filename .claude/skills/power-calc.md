# Skill: power-calc

Power electronics and thermal design calculations.

## When to Use

- For sizing new configurations
- For thermal calculations
- For efficiency and loss analysis

## Formulas

### Power and Efficiency
```
Output = Input × Efficiency
Losses = Output × (1/Efficiency - 1)

At 96% efficiency:
  3.3 kW output = 3.44 kW input
  Losses = 137W per module
```

### Thermal Calculation
```
Thermal resistance: Rth_ja = (Tj - Ta) / P_loss

For 84 modules in rack:
  Total losses = 84 × 137W = 11.5 kW
  Airflow required: ~1000 CFM
```

### Scaling
```
303 modules = 1 MW @ 3.3 kW
909 modules = 3 MW @ 3.3 kW

10% redundancy:
  1 MW = 333 modules installed
  333 × 90% = 300 active = 990 kW
```

### LLC Resonant
```
fr = 1 / (2π × √(Lr × Cr))
Lr = 20 µH, Cr = 32 nF → fr ≈ 200 kHz
```

## Steps

1. Define requirements (power, redundancy)
2. Calculate module count
3. Check thermal limits
4. Validate efficiency at various loads

## Example

```
/power-calc 750kW opportunity 15% redundancy
```