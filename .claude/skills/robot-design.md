# Skill: robot-design

Design and specifications for robotic swap system.

## When to Use

- For Robot A (on bus) or Robot B (at station) development
- For swap sequences and timing
- For safety interlocks

## Robot Specifications

### Robot A (on bus)
```
Mass: <15 kg
Payload: 5-10 kg
Reach: 0.5-1m
Power: 48V DC (from bus)
Function: Connector manipulation, diagnostics
```

### Robot B (at station)
```
Mass: 30-50 kg
Payload: 50-100 kg (for batteries)
Reach: 1.5-2m
Power: 400V AC
Function: Module swap, battery swap
Linear rail: 2-10m
```

## Swap Timing

```
T+0s:   AI identifies module
T+5s:   Robot positions
T+10s:  Grip engagement
T+15s:  Module extraction
T+25s:  Fresh module pickup
T+35s:  Module insertion
T+40s:  Handshake complete

TOTAL: 40 seconds per swap
```

## Safety Interlocks

1. Power isolation before swap
2. Confirmation before movement
3. Force limits on gripper
4. E-stop accessible

## Files

- `tehnika/08-swap-station.md` - Swap station design
- `tehnika/09-ek3-rack-sistem.md` - Robot section
- `patent/01-IP-FOUNDATION/02-INVENTION-DISCLOSURE-ROBOT.md`

## Example

```
/robot-design gripper EK3
```