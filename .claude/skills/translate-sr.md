# Skill: translate-sr

Translation and localization to Serbian language.

## When to Use

- For translating new web application text
- For maintaining Serbian documentation versions
- For reducing anglicisms

## Translation Rules

### Avoid Anglicisms

| English | Bad (Anglicism) | Good (Serbian) |
|---------|-----------------|----------------|
| rack | rek | ormar |
| module | modul | modul (OK) |
| swap | svop | zamena |
| self-healing | self-hiling | samoizlečenje |
| opportunity charging | oportuniti | usputno punjenje |
| truck roll | trak rol | izlazak tehničara |
| hot-swap | hot-svop | vruća zamena |

### Keep Technical Terms

- SiC MOSFET (don't translate)
- CAN-FD (don't translate)
- LLC resonant (don't translate)
- ISO 15118 (don't translate)

## Files for Localization

- `web/src/i18n/sr.json` - UI text
- Documentation remains in Serbian

## Steps

1. Identify text for translation
2. Apply translation rules
3. Check consistency with existing translations
4. Update sr.json or documents

## Example

```
/translate-sr "The system uses wide striping for load distribution"
```

Returns: "Sistem koristi široko raspoređivanje za distribuciju opterećenja"