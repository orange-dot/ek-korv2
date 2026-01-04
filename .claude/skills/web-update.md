# Skill: web-update

Update React demo application.

## When to Use

- For updating UI with new specifications
- For adding new simulation features
- For i18n changes

## Project Structure

```
web/
├── src/
│   ├── components/
│   │   └── simulation/    # Simulation components
│   ├── data/
│   │   └── cities.js      # Cities and routes
│   ├── i18n/
│   │   ├── en.json        # English
│   │   ├── sr.json        # Serbian
│   │   └── index.js       # i18n config
│   └── pages/
│       ├── PatentPage.jsx    # Patent portfolio
│       └── SimulationPage.jsx # Main simulation
```

## Key Components

- **PatentPage.jsx** - Patent disclosures (update when spec changes)
- **SimulationPage.jsx** - Bus fleet simulation
- **KorHUD.jsx** - HUD overlay for simulation

## i18n Rules

1. All UI text in sr.json/en.json
2. Use `t('key')` for translations
3. Avoid hardcoded text
4. Serbian without excessive anglicisms

## Steps

1. Identify what needs updating
2. For spec changes → PatentPage.jsx
3. For UI text → i18n/*.json
4. Test: `npm run dev`
5. Build: `npm run build`

## Example

```
/web-update patent EK-2026-001 "new claim"
```