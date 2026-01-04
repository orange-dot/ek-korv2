# Skill: consistency-check

Check specification consistency across documentation.

## When to Use

- Before committing major changes
- When suspecting inconsistencies
- Periodic validation

## What It Checks

1. **EK3 power** - is it 3.3kW everywhere
2. **Dimensions** - 200×320×44mm
3. **SiC voltage** - 900V Wolfspeed
4. **Communication** - CAN-FD @ 5 Mbps
5. **MCU** - STM32G474
6. **Rack calculations** - 84 modules = 277kW

## Steps

1. Grep for key values across tehnika/, patent/, web/
2. Identify deviations from SPECIFICATIONS.md
3. Generate report with inconsistency locations
4. Suggest corrections

## Example

```
/consistency-check
```

Generates report of all documentation inconsistencies.