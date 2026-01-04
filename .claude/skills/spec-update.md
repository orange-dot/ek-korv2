# Skill: spec-update

Update EK3 specifications across all documentation.

## When to Use

- When changing any EK3 specification (power, dimensions, SiC, etc.)
- When ensuring consistency across all documents

## Steps

1. Read `tehnika/SPECIFICATIONS.md` - master spec document
2. Identify all files containing the old value
3. Update all relevant files:
   - tehnika/*.md
   - patent/03-TECHNICAL-SUPPORT/*.md
   - web/src/pages/PatentPage.jsx
4. Update `tehnika/SPECIFICATIONS.md` with new value
5. Verify consistency with grep

## Key Files

- `tehnika/SPECIFICATIONS.md` - ALWAYS update first
- `tehnika/00-arhitektura.md` - master overview
- `tehnika/09-ek3-rack-sistem.md` - calculations
- `tehnika/01-power-electronics.md` - components
- `patent/03-TECHNICAL-SUPPORT/EK3-DETAILED-DESIGN.md` - detailed design

## Example

```
/spec-update power 3.5kW
```

Updates EK3 module power from current value to 3.5kW across all documents.