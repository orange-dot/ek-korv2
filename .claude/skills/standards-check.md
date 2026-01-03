# Skill: standards-check

Industry standards compliance verification.

## When to Use

- For certification preparation
- For design validation
- For compliance documentation

## Relevant Standards

### Power Electronics
| Standard | Description | Status |
|----------|-------------|--------|
| IEC 62477 | Power converters safety | Required |
| IEC 61851 | EV charging | Required |
| IEC 62955 | DC RCD | Required |

### EV Charging Protocols
| Standard | Description | Status |
|----------|-------------|--------|
| ISO 15118-2 | V2G communication | Required |
| ISO 15118-20 | Bidirectional (BPT) | Planned |
| OCPP 2.0.1 | Backend protocol | Required |

### Grid Connection
| Standard | Description | Status |
|----------|-------------|--------|
| EN 50549 | Grid code (EU) | Required |
| IEEE 1547 | Grid interconnection | Reference |
| IEC 62116 | Anti-islanding | Required |

### EMC
| Standard | Description | Status |
|----------|-------------|--------|
| CISPR 11 | Industrial EMC | Required |
| IEC 61000-4 | Immunity tests | Required |

### Safety
| Standard | Description | Status |
|----------|-------------|--------|
| ISO 10218 | Robot safety | Required |
| IEC 62443 | Cybersecurity | Recommended |

## Checklist

```
[ ] Electrical safety (IEC 62477)
    [ ] Insulation monitoring
    [ ] RCD/RDC-DD protection
    [ ] Emergency stop
    [ ] Protective bonding

[ ] EV Charging (IEC 61851)
    [ ] Connector interlocks
    [ ] Pilot signal
    [ ] Proximity detection

[ ] Grid (EN 50549)
    [ ] LVRT capability
    [ ] Frequency response
    [ ] Power factor
```

## Files

- `reference/standardi-protokoli.md`
- `patent/03-TECHNICAL-SUPPORT/SAFETY-CERTIFICATION.md`

## Example

```
/standards-check IEC-61851
```