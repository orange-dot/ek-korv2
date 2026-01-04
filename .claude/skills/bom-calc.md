# Skill: bom-calc

Bill of Materials and cost calculations.

## When to Use

- When changing components
- For cost analysis of new configurations
- For scaling calculations

## Key Files

- `tehnika/06-bom-cost.md` - main BOM document
- `tehnika/01-power-electronics.md` - power stage BOM
- `tehnika/09-ek3-rack-sistem.md` - rack cost analysis

## Formulas

### EK3 Module Cost @ Volume
```
1,000 modules:   €300/module
10,000 modules:  €150/module
100,000 modules: €80/module
1,000,000:       €50/module
```

### System Cost
```
1 MW = 303 modules × €module + rack + control + robot
```

### Power Density
```
kW per rack = modules × 3.3 kW
Cost per kW = Total cost / kW
```

## Steps

1. Define configuration (module count, racks)
2. Calculate module BOM
3. Add rack, control, robot costs
4. Compare with traditional solutions
5. Update relevant documents

## Example

```
/bom-calc 500kW depot
```

Generates BOM and cost breakdown for 500kW depot configuration.