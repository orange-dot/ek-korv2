# Bilingual Documentation Guide

This guide defines the workflow for maintaining documentation in Serbian and English.

## Language Policy

| Content Type | Primary Language | Secondary | Notes |
|--------------|------------------|-----------|-------|
| Technical docs (`tehnika/`) | Both | Parallel | Identical content, two languages |
| Patent docs (`patent/`) | Both | Parallel | Identical content, two languages |
| Web app (`web/i18n/`) | Both | Parallel | User-facing, both required |
| Skills (`.claude/skills/`) | English | - | Internal tools only |
| CLAUDE.md | English | - | Tool configuration |
| README.md | English | - | GitHub convention |

## File Naming Convention

**Standard: English primary everywhere**
- `document.md` - English (primary)
- `document.sr.md` - Serbian

Example:
```
tehnika/
├── 00-arhitektura.md      # English (primary)
├── 00-arhitektura.sr.md   # Serbian

patent/
├── EK3-DETAILED-DESIGN.md    # English (primary)
├── EK3-DETAILED-DESIGN.sr.md # Serbian
```

## Translation Workflow

### Parallel Maintenance

Both Serbian and English versions are always maintained together:
- Create both versions when adding new documents
- Update both versions when making changes
- Never let one version fall behind

### Sync Process

1. Update both language versions in the same commit when possible
2. If translating later, mark the untranslated version with TODO comment
3. Use git diff to identify changes for translation
4. Both versions should be identical in content

### Version Tracking

Add header to translated documents:

```markdown
<!--
Translated from: 00-arhitektura.md
Last sync: 2026-01-03
Source commit: abc1234
-->
```

## Technical Term Handling

### Keep in English (Don't Translate)
- Component names: SiC MOSFET, LLC resonant, CAN-FD
- Standards: ISO 15118, IEC 61851, OCPP
- Protocols: MQTT, HTTPS, TCP/IP
- Units: kW, kWh, CFM, °C

### Translate Properly (Avoid Anglicisms)
| English | Serbian |
|---------|---------|
| rack | ormar |
| swap | zamena |
| self-healing | samoizlečenje |
| opportunity charging | usputno punjenje |
| truck roll | izlazak tehničara |
| hot-swap | vruća zamena |
| wide striping | široko raspoređivanje |

### Keep as Technical Loan Words
- modul (module) - OK
- bajpas (bypass) - OK
- interfejs (interface) - OK

## Web App i18n

### Adding New Text

1. Add to both `sr.json` and `en.json`
2. Use descriptive keys: `patent.ek2026001.title`
3. Keep structure parallel

### Translation Quality

- Serbian: Avoid excessive anglicisms
- English: Natural, not machine-translated
- Both: Consistent with existing translations

## Git Commit Messages

For bilingual work, use format:

```
Update [document] - [EN/SR/both]

- Brief description of changes
```

Example:
```
Update tehnika/00-arhitektura - both versions

- Added custom rack concept section
- Updated EK3 specifications to 3.3kW
```

## Review Checklist

Before committing documentation changes:

- [ ] Primary language updated
- [ ] Secondary language marked outdated OR updated
- [ ] Technical terms consistent
- [ ] No excessive anglicisms in Serbian
- [ ] i18n keys added to both json files (if web)