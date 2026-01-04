# Skill: thermal-analysis

Thermal analysis for EK3 modules and rack systems.

## When to Use

- For rack design validation
- For cooling dimensioning
- For thermal derating calculations

## Thermal Model

### EK3 Module
```
Power: 3.3 kW
Efficiency: 96% (peak)
Losses: 137W per module

Loss components:
- SiC MOSFETs: 40W (switching + conduction)
- Transformer: 30W (core + copper)
- Rectifier diodes: 25W
- Inductor: 20W
- Control + gate drivers: 10W
- Misc (caps, PCB): 12W
```

### Rack Thermal Budget
```
84 modules × 137W = 11.5 kW dissipation

Airflow requirement:
Q = m_dot × Cp × ΔT
For ΔT = 20°C:
m_dot = 11500 / (1005 × 20) = 0.57 kg/s
≈ 1000 CFM @ sea level
```

### Junction Temperature
```
Tj = Ta + P × Rth_ja

Target: Tj < 125°C @ Ta = 50°C
Allowable Rth_ja = (125-50)/40W = 1.875 °C/W

With heatsink + forced air:
Rth_jc (MOSFET): 0.5 °C/W
Rth_cs (TIM): 0.1 °C/W
Rth_sa (heatsink): 1.0 °C/W
────────────────────────────
Total: 1.6 °C/W ✓
```

## Derating

```
Temperature      Allowed Power
─────────────────────────────────
< 40°C          100% (3.3 kW)
40-50°C         100% (3.3 kW)
50-60°C         90% (3.0 kW)
60-70°C         75% (2.5 kW)
> 70°C          SHUTDOWN
```

## Files

- `tehnika/03-thermal-management.md`
- `tehnika/komponente/termalno-upravljanje.md`
- `tehnika/09-ek3-rack-sistem.md` (Custom Rack section)

## Example

```
/thermal-analysis rack 84-modules ambient=45C
```