# Safety & Certification Requirements

**Document Version:** 1.0
**Date:** 2026-01-03
**Author:** Bojan Janjatović
**Email:** bojan.janjatovic@gmail.com
**Address:** Vojislava Ilica 8, Kikinda, Severni Banat, Serbia

---

## 1. Executive Summary

```
SERTIFIKACIJA - PREGLED
═══════════════════════════════════════════════════════════════

Sistem se sastoji od više komponenti koje zahtevaju različite
sertifikacije:

┌─────────────────────────────────────────────────────────────┐
│ KOMPONENTA          │ KLJUČNI STANDARDI                     │
├─────────────────────┼───────────────────────────────────────┤
│ EK3 Power Module    │ IEC 62477, IEC 61851, CE/UKCA        │
│ Charging Station    │ IEC 61851, ISO 15118, EN 50178       │
│ Robot (Swap)        │ ISO 10218, EN ISO 13849, CE          │
│ Control System      │ IEC 62443 (cybersecurity)            │
│ Full System         │ Site-specific permits                 │
└─────────────────────────────────────────────────────────────┘

PRIORITET ZA MVP:
1. CE marking za EK3 module (EU market access)
2. IEC 61851 compliance za charging funkciju
3. Basic robot safety (za demonstration)

FULL CERTIFICATION: 12-18 meseci, €50-150k budget
═══════════════════════════════════════════════════════════════
```

---

## 2. Regulatory Landscape

### 2.1 EU Market (Primary Target)

```
EU REGULATORY FRAMEWORK
═══════════════════════════════════════════════════════════════

1. LOW VOLTAGE DIRECTIVE (LVD) 2014/35/EU
   • Applies to: electrical equipment 50-1000V AC, 75-1500V DC
   • EK3 module: YES (650V DC input)
   • Requirement: CE marking

2. EMC DIRECTIVE 2014/30/EU
   • Electromagnetic compatibility
   • EK3 module: YES
   • Requirement: CE marking

3. MACHINERY DIRECTIVE 2006/42/EC
   • Applies to: robotic swap station
   • Requirement: CE marking, Declaration of Conformity

4. RADIO EQUIPMENT DIRECTIVE (RED) 2014/53/EU
   • If using WiFi/Bluetooth
   • EK3 module: YES (ESP32 ima radio)
   • Requirement: CE marking

5. ROHS DIRECTIVE 2011/65/EU
   • Hazardous substances restriction
   • All electronics: YES
   • Requirement: Compliance declaration

6. WEEE DIRECTIVE 2012/19/EU
   • Waste electronics handling
   • Requirement: Registration, take-back scheme
```

### 2.2 EV Charging Specific

```
EV CHARGING STANDARDS (EU)
═══════════════════════════════════════════════════════════════

IEC 61851 - EV Conductive Charging System
─────────────────────────────────────────
Part 1: General requirements
Part 21: DC charging requirements
Part 23: DC charging station
Part 24: Digital communication (ISO 15118)

→ MANDATORY za bilo koji EV charger

IEC 62196 - Plugs, Sockets, Connectors
─────────────────────────────────────────
Part 1: General requirements
Part 3: DC connectors (CCS, CHAdeMO)

→ Ako koristimo standardne konektore (verovatno CCS2)

ISO 15118 - Vehicle to Grid Communication
─────────────────────────────────────────
Part 1: General information
Part 2: Network/application protocol
Part 3: Physical/data link layer
Part 20: 2nd gen network layer

→ Za smart charging / V2G funkcionalnost

EN 50549 - Grid Connection Requirements
─────────────────────────────────────────
• Power quality
• Grid support functions
• Fault ride-through

→ Zahteva lokalni grid operator
```

### 2.3 UK Market (Post-Brexit)

```
UK SPECIFIC
═══════════════════════════════════════════════════════════════

UKCA Marking (replaces CE in UK)
• Similar technical requirements
• Separate conformity assessment
• UK Approved Body (not EU Notified Body)

Timeline:
• CE accepted until Dec 2025 (možda produženo)
• Then UKCA required

Strategy:
• Design za CE (EU)
• UKCA as add-on (minimal extra effort)
```

---

## 3. Safety Standards by Component

### 3.1 EK3 Power Module

```
EK3 MODULE - SAFETY STANDARDS
═══════════════════════════════════════════════════════════════

PRIMARY: IEC 62477-1
"Safety requirements for power electronic converter systems"
─────────────────────────────────────────────────────────────

Scope:
• Power electronics equipment
• Bidirectional energy conversion
• Up to 1000V AC / 1500V DC

Key Requirements:
□ Electrical safety (shock protection)
□ Thermal safety (fire prevention)
□ Mechanical safety (enclosure)
□ Insulation coordination
□ Creepage/clearance distances
□ Protective bonding
□ Marking and documentation

Classification (per IEC 62477):
• OVERVOLTAGE CATEGORY: OVC III (industrial)
• POLLUTION DEGREE: PD2 (non-conductive pollution)
• PROTECTION CLASS: Class I (protective earth)

Tests Required:
□ Dielectric strength (hipot)
□ Insulation resistance
□ Protective bonding continuity
□ Touch current measurement
□ Thermal test (overload)
□ Abnormal operation tests


SECONDARY: IEC 61851-23
"DC charging station"
─────────────────────────────────────────────────────────────

Additional requirements specific to EV charging:
□ Isolation monitoring
□ Ground fault protection
□ Emergency stop function
□ Connector interlock
□ Sequence of operations


EMC: CISPR 32 / EN 55032
─────────────────────────────────────────────────────────────

Class A (industrial) limits:
• Conducted emissions: 150 kHz - 30 MHz
• Radiated emissions: 30 MHz - 1 GHz

Immunity per EN 61000-4-x series:
□ ESD (4-2)
□ Radiated immunity (4-3)
□ EFT/Burst (4-4)
□ Surge (4-5)
□ Conducted immunity (4-6)
□ Power frequency magnetic field (4-8)
□ Voltage dips/interruptions (4-11)
```

### 3.2 Charging Station (System Level)

```
CHARGING STATION - SAFETY
═══════════════════════════════════════════════════════════════

IEC 61851-1 (General Requirements)
─────────────────────────────────────────────────────────────

Modes of charging:
• Mode 4: DC charging with external charger

Safety functions:
□ Protective earth continuity monitoring
□ Insulation monitoring (DC side)
□ Residual current detection
□ Overcurrent protection
□ Overvoltage protection
□ Emergency stop
□ Ventilation interlock (if enclosed)

Sequence requirements:
□ Pre-charge safety checks
□ Insulation test before connecting
□ Controlled disconnect
□ Fault handling


IEC 61439-7
"Low-voltage switchgear - Busbar trunking systems"
─────────────────────────────────────────────────────────────

If station has distribution panel:
□ Temperature rise limits
□ Short-circuit withstand
□ Insulation coordination


FIRE SAFETY
─────────────────────────────────────────────────────────────

EN 13501-1: Fire classification of materials
• Enclosure materials: min Class B (limited combustibility)
• Or adequate fire containment

Local fire codes:
• Sprinkler requirements
• Fire detection
• Emergency egress
• Depends on installation location
```

### 3.3 Robot Safety (Swap Station)

```
ROBOT SAFETY - CRITICAL
═══════════════════════════════════════════════════════════════

ISO 10218-1:2011
"Robots and robotic devices - Safety requirements - Part 1: Robots"
─────────────────────────────────────────────────────────────

Applies to: Industrial robot arm

Requirements:
□ Emergency stop function (Category 0 or 1)
□ Protective stop function
□ Speed and force limiting
□ Axis limiting (soft and hard)
□ Enabling device (three-position)
□ Pendant safety
□ Singular point protection


ISO 10218-2:2011
"Part 2: Robot systems and integration"
─────────────────────────────────────────────────────────────

Applies to: Complete robot cell (robot + station)

Requirements:
□ Risk assessment (mandatory)
□ Safeguarding (fences, sensors, interlocks)
□ Layout design
□ Installation verification
□ User information


EN ISO 13849-1
"Safety of machinery - Safety-related parts of control systems"
─────────────────────────────────────────────────────────────

Performance Levels (PL):
• PL a: lowest
• PL e: highest

For robot swap station:
• Emergency stop: PL d minimum
• Safety door interlock: PL c minimum
• Presence detection: PL c minimum

Categories:
• Category 3: fault detection, single fault tolerance
• Category 4: fault detection, accumulated faults


IEC 62443
"Industrial automation and control systems security"
─────────────────────────────────────────────────────────────

Cybersecurity za control systems:
□ Security levels (SL 1-4)
□ Zones and conduits
□ Security requirements
□ Component security
```

### 3.4 Functional Safety

```
FUNCTIONAL SAFETY (ako potrebno)
═══════════════════════════════════════════════════════════════

IEC 61508
"Functional safety of E/E/PE safety-related systems"
─────────────────────────────────────────────────────────────

SIL (Safety Integrity Level):
• SIL 1: lowest
• SIL 4: highest

Za EK3 system:
• SIL 1 verovatno dovoljan za većinu funkcija
• SIL 2 možda za neke kritične (e-stop, isolation)

Napomena:
• Full SIL compliance je SKUPO
• Alternativa: EN ISO 13849 (PL levels)
• Konsultovati safety engineer


IEC 61511 (Process sector) - verovatno N/A
IEC 62061 (Machinery) - alternativa za 13849
```

---

## 4. Certification Path

### 4.1 Self-Declaration vs Third-Party

```
CONFORMITY ASSESSMENT OPTIONS
═══════════════════════════════════════════════════════════════

OPTION A: SELF-DECLARATION (Manufacturer's Declaration)
─────────────────────────────────────────────────────────────
• Manufacturer sam izjavljuje compliance
• Za LVD, EMC: dozvoljeno (većina slučajeva)
• Jeftinije, brže
• Rizik: ako nešto pođe po zlu, odgovornost na tebi

Potrebno:
□ Technical file (dokumentacija)
□ Declaration of Conformity
□ CE marking
□ Internal testing (or use test lab for data)


OPTION B: THIRD-PARTY CERTIFICATION
─────────────────────────────────────────────────────────────
• Notified Body (EU) potvrđuje compliance
• Za Machinery Directive: može biti potrebno
• Za ATEX (ako ima): obavezno
• Skuplje, sporije, ali manje rizika

Notified Bodies (primeri):
• TÜV SÜD (DE)
• TÜV Rheinland (DE)
• SGS (CH)
• Bureau Veritas (FR)
• UL (US, ima EU presence)


PREPORUKA ZA EK3:
═══════════════════════════════════════════════════════════════

Phase 1 (MVP):
• Self-declaration za CE (LVD + EMC)
• Use accredited test lab za EMC testing
• Internal safety testing per IEC 62477

Phase 2 (Production):
• Third-party certification za charging (IEC 61851)
• Robot cell: third-party risk assessment
• Consider CB Scheme za international recognition
```

### 4.2 Testing Laboratories

```
TEST LABORATORIES (EU)
═══════════════════════════════════════════════════════════════

EMC Testing:
• Element Materials Technology
• Eurofins E&E
• TÜV labs
• Local accredited labs (jeftinije)

Safety Testing:
• TÜV
• UL
• SGS
• Intertek

EV Charging Specific:
• KEMA Labs (NL)
• VDE (DE)
• Ricardo (UK)

Cene (orientaciono):
• EMC pre-compliance: €2-5k
• EMC full compliance: €5-15k
• Safety testing: €10-30k
• IEC 61851 full: €30-50k
```

### 4.3 Timeline

```
CERTIFICATION TIMELINE
═══════════════════════════════════════════════════════════════

MONTH  1-2:   Design review for compliance
               □ Gap analysis vs standards
               □ Design modifications if needed
               □ Documentation preparation

MONTH  3-4:   Pre-compliance testing (in-house or lab)
               □ EMC pre-scan
               □ Safety checks
               □ Fix issues

MONTH  5-6:   Formal testing
               □ EMC full compliance
               □ Safety testing
               □ Environmental testing

MONTH  7-8:   Documentation & submission
               □ Technical file completion
               □ Test reports compilation
               □ Declaration of Conformity draft

MONTH  9:     Certification body review (if third-party)
               □ Document review
               □ Possible questions

MONTH 10:     Certificate issued
               □ CE marking applied
               □ Production release

═══════════════════════════════════════════════════════════════
TOTAL: ~10 months for first certification

Parallel activities can reduce this.
Robot certification is separate track.
```

---

## 5. Safety Design Requirements

### 5.1 Electrical Safety

```
ELECTRICAL SAFETY DESIGN
═══════════════════════════════════════════════════════════════

1. INSULATION COORDINATION (IEC 60664-1)
─────────────────────────────────────────

Voltage categories:
• Mains input (400V AC): OVC III
• DC link (650V DC): OVC II
• Output (400V DC): OVC II
• Control circuits (24V): OVC I

Creepage distances (PD2, basic insulation):
┌─────────────────────────────────────────────────────────────┐
│ Working Voltage │ OVC III (mm) │ OVC II (mm) │ OVC I (mm) │
├─────────────────┼──────────────┼─────────────┼────────────┤
│ 400V            │ 4.0          │ 2.5         │ 1.6        │
│ 650V            │ 6.3          │ 4.0         │ 2.5        │
│ 800V            │ 8.0          │ 5.0         │ 3.2        │
└─────────────────────────────────────────────────────────────┘

Reinforced insulation = 2× basic

Clearance: može biti manja, ali obično ista kao creepage


2. PROTECTION AGAINST ELECTRIC SHOCK
─────────────────────────────────────────

Basic protection:
• Enclosure (IP rating)
• Insulation of live parts

Fault protection:
• Automatic disconnection of supply
• Protective earthing (PE)
• RCD (residual current device) - external

IP Rating:
• Minimum: IP20 (finger protection)
• Outdoor: IP54 or higher
• Za EK3 module: IP20 (inside cabinet)


3. PROTECTIVE BONDING
─────────────────────────────────────────

• All exposed conductive parts → PE
• Bonding conductor: min 6mm² or equal to phase
• Green/yellow identification
• Continuity: <0.1Ω


4. OVERCURRENT PROTECTION
─────────────────────────────────────────

• Fuse or circuit breaker at input
• Internal electronic OCP
• Coordination with upstream protection
```

### 5.2 Thermal Safety

```
THERMAL SAFETY DESIGN
═══════════════════════════════════════════════════════════════

1. MAXIMUM TEMPERATURES (normal operation)
─────────────────────────────────────────

Per IEC 62477:
┌─────────────────────────────────────────────────────────────┐
│ Component/Surface                        │ Max Temp (°C)   │
├──────────────────────────────────────────┼─────────────────┤
│ External surfaces (touchable, metal)     │ 70              │
│ External surfaces (touchable, plastic)   │ 85              │
│ Internal components (general)            │ per datasheet   │
│ Printed wiring board                     │ 130 (FR4)       │
│ Insulation (Class B)                     │ 130             │
│ Insulation (Class F)                     │ 155             │
│ Insulation (Class H)                     │ 180             │
└─────────────────────────────────────────────────────────────┘


2. ABNORMAL CONDITIONS
─────────────────────────────────────────

Must test under fault conditions:
• Cooling fan failure → safe shutdown or derating
• Blocked ventilation → thermal cutout
• Single component failure → no fire, no shock

Thermal cutouts:
• OTP in firmware: derating at 100°C, shutdown at 125°C
• Backup: thermal fuse (one-shot, last resort)


3. FIRE RESISTANCE
─────────────────────────────────────────

PCB material: UL 94 V-0 (minimum)
Enclosure: UL 94 V-0 or metal
Wiring insulation: flame retardant

Glow wire test:
• 650°C for external parts
• 850°C for internal parts holding live parts
```

### 5.3 Mechanical Safety

```
MECHANICAL SAFETY
═══════════════════════════════════════════════════════════════

1. ENCLOSURE STRENGTH
─────────────────────────────────────────

Impact resistance:
• IK code per IEC 62262
• Minimum IK07 (2J impact)

Stability:
• No tip-over risk
• Secure mounting

Sharp edges:
• No accessible sharp edges
• Deburred metal edges


2. HOT-SWAP SAFETY
─────────────────────────────────────────

During module removal:
□ Power automatically disconnected BEFORE extraction possible
□ Residual energy discharge (<60V within 1 sec, or guarded)
□ Interlock prevents re-energization during swap

Connector sequencing:
• Ground first make / last break
• Power before signal
• Module present = last contact


3. ROBOT CELL SAFEGUARDING
─────────────────────────────────────────

Physical barriers:
• Fixed guards (fencing) where possible
• Minimum height: 1400mm (reaching over)

Interlocked guards:
• Movable guards with safety switches
• Safety switch per ISO 14119
• PL c minimum

Presence sensing:
• Light curtains (Type 4) ili
• Safety scanner (za larger area)
• PL c or d depending on risk

Emergency stop:
• Red mushroom button, yellow background
• IEC 60947-5-5
• Category 0 ili 1 stop
• Located at each access point
```

---

## 6. Documentation Requirements

### 6.1 Technical File

```
TECHNICAL FILE (Za CE marking)
═══════════════════════════════════════════════════════════════

Mora sadržavati:

1. GENERAL DESCRIPTION
   □ Product description
   □ Photographs
   □ Intended use statement
   □ User manual (draft)

2. DESIGN DOCUMENTATION
   □ Electrical schematics
   □ PCB layouts
   □ Mechanical drawings
   □ Bill of materials
   □ Software description (if applicable)

3. STANDARDS LIST
   □ List of applied harmonized standards
   □ Gap analysis for non-harmonized

4. RISK ASSESSMENT
   □ Hazard identification
   □ Risk estimation
   □ Risk reduction measures
   □ Residual risk acceptance

5. TEST REPORTS
   □ Safety tests (internal or external)
   □ EMC tests
   □ Environmental tests (if applicable)
   □ Performance tests

6. QUALITY EVIDENCE
   □ Production quality control description
   □ Calibration records
   □ Component certificates (critical safety)

7. DECLARATION OF CONFORMITY
   □ Signed by authorized person
   □ Lists all applicable directives
   □ References to standards

RETENTION: 10 years after last product sold
LOCATION: EU address (or authorized representative)
```

### 6.2 User Documentation

```
USER DOCUMENTATION
═══════════════════════════════════════════════════════════════

1. INSTALLATION MANUAL
   □ Site requirements
   □ Electrical connection
   □ Mechanical mounting
   □ Commissioning procedure
   □ Safety warnings

2. OPERATION MANUAL
   □ Normal operation
   □ User interface description
   □ Error messages and responses
   □ Safety procedures

3. MAINTENANCE MANUAL
   □ Preventive maintenance schedule
   □ Module replacement procedure
   □ Troubleshooting guide
   □ Spare parts list

4. SAFETY DATA
   □ Safety symbols explanation
   □ Risk warnings
   □ Emergency procedures
   □ Personal protective equipment

Languages:
• Official language of each target country
• English as minimum for EU
```

---

## 7. Risk Assessment

### 7.1 Methodology

```
RISK ASSESSMENT PROCESS (per ISO 12100)
═══════════════════════════════════════════════════════════════

STEP 1: Determine limits
─────────────────────────
• Intended use
• Foreseeable misuse
• User characteristics
• Product lifetime

STEP 2: Hazard identification
─────────────────────────
• Electrical hazards
• Thermal hazards
• Mechanical hazards
• Radiation (EMF)
• Material hazards
• Ergonomic hazards
• Hazards from environment

STEP 3: Risk estimation
─────────────────────────
Risk = Severity × Probability × Exposure

Severity:
• S1: Minor injury (reversible)
• S2: Serious injury (irreversible)
• S3: Fatal

Probability:
• P1: Low
• P2: High

Exposure:
• F1: Seldom
• F2: Frequent

STEP 4: Risk evaluation
─────────────────────────
Is risk acceptable?
→ Compare to PLr (required performance level)

STEP 5: Risk reduction
─────────────────────────
1. Inherently safe design (eliminate hazard)
2. Safeguarding (guards, interlocks)
3. Information (warnings, instructions)

STEP 6: Verify & document
─────────────────────────
• Validate risk reduction measures
• Document residual risks
```

### 7.2 Key Hazards for EK3 System

```
HAZARD SUMMARY
═══════════════════════════════════════════════════════════════

HAZARD                  │ SEVERITY │ MITIGATION
────────────────────────┼──────────┼───────────────────────────
Electric shock (650V DC)│ S3       │ Insulation, enclosure, PE
                        │          │ interlock, RCD
────────────────────────┼──────────┼───────────────────────────
Arc flash               │ S2-S3    │ Fusing, enclosure rating
                        │          │ PPE requirements
────────────────────────┼──────────┼───────────────────────────
Fire (thermal runaway)  │ S2-S3    │ OTP, thermal fuse, V-0
                        │          │ materials, fire detection
────────────────────────┼──────────┼───────────────────────────
Robot collision         │ S2-S3    │ Guards, safety scanner
                        │          │ E-stop, speed limiting
────────────────────────┼──────────┼───────────────────────────
Crushing (robot gripper)│ S2       │ Force limiting, sensors
                        │          │ E-stop
────────────────────────┼──────────┼───────────────────────────
Stored energy (caps)    │ S2       │ Discharge circuit,
                        │          │ warning labels, interlock
────────────────────────┼──────────┼───────────────────────────
Hot surfaces            │ S1       │ Guards, warning labels
                        │          │ temp limits per std
────────────────────────┼──────────┼───────────────────────────
EMF exposure            │ S1       │ Shielding, distance
                        │          │ (unlikely issue at 3kW)
────────────────────────┼──────────┼───────────────────────────
```

---

## 8. Cybersecurity

```
CYBERSECURITY REQUIREMENTS
═══════════════════════════════════════════════════════════════

Growing importance per:
• IEC 62443 (Industrial control systems)
• UN ECE R155 (Automotive cybersecurity)
• NIS2 Directive (EU Critical infrastructure)

MINIMUM REQUIREMENTS:
─────────────────────────────────────────

1. Secure boot
   • Verify firmware integrity at startup
   • Prevent unauthorized firmware

2. Encrypted communication
   • TLS 1.3 za sve external communications
   • No plaintext credentials

3. Authentication
   • User authentication for configuration
   • API keys for system-to-system

4. Access control
   • Role-based access (operator, admin, service)
   • Principle of least privilege

5. Audit logging
   • Log all security-relevant events
   • Tamper-evident logs

6. Update mechanism
   • Secure OTA updates
   • Rollback capability
   • Signed firmware

7. Vulnerability management
   • SBOM (Software Bill of Materials)
   • Process za security patches
```

---

## 9. Budget Estimate

```
CERTIFICATION BUDGET (Rough Estimate)
═══════════════════════════════════════════════════════════════

ITEM                            │ LOW (€)   │ HIGH (€)
────────────────────────────────┼───────────┼───────────
EK3 MODULE:                     │           │
  EMC testing (pre + full)      │ 8,000     │ 15,000
  Safety testing (IEC 62477)    │ 10,000    │ 25,000
  Environmental testing         │ 5,000     │ 10,000
  Documentation preparation     │ 5,000     │ 10,000
────────────────────────────────┼───────────┼───────────
Subtotal EK3                    │ 28,000    │ 60,000
────────────────────────────────┼───────────┼───────────
CHARGING STATION:               │           │
  IEC 61851 testing             │ 20,000    │ 40,000
  Grid connection tests         │ 5,000     │ 15,000
────────────────────────────────┼───────────┼───────────
Subtotal Station                │ 25,000    │ 55,000
────────────────────────────────┼───────────┼───────────
ROBOT CELL:                     │           │
  Risk assessment               │ 5,000     │ 15,000
  Safety system validation      │ 10,000    │ 25,000
  Third-party certification     │ 10,000    │ 20,000
────────────────────────────────┼───────────┼───────────
Subtotal Robot                  │ 25,000    │ 60,000
────────────────────────────────┼───────────┼───────────
CONSULTING:                     │           │
  Safety consultant             │ 10,000    │ 30,000
  Regulatory consultant         │ 5,000     │ 15,000
────────────────────────────────┼───────────┼───────────
Subtotal Consulting             │ 15,000    │ 45,000
────────────────────────────────┼───────────┼───────────
TOTAL                           │ 93,000    │ 220,000
════════════════════════════════╧═══════════╧═══════════

Notes:
• Range depends on scope, complexity, issues found
• Re-tests if failures: add 30-50%
• Multiple markets: add per market
• This is external costs only (no internal labor)
```

---

## 10. Certification Roadmap

```
PHASED APPROACH
═══════════════════════════════════════════════════════════════

PHASE 1: MVP (6 months) - Target: Demonstration unit
─────────────────────────────────────────────────────────────
□ Internal safety review
□ Basic EMC pre-compliance
□ Risk assessment (documented)
□ Robot cell: physical guards only
□ NO CE marking yet (R&D prototype)

Outcome: Safe for controlled demos


PHASE 2: PILOT (12 months) - Target: Limited deployment
─────────────────────────────────────────────────────────────
□ Full EMC compliance testing
□ Safety testing (IEC 62477)
□ CE marking for EK3 module
□ Basic IEC 61851 compliance
□ Robot cell: full safeguarding

Outcome: CE marked, can deploy at pilot sites


PHASE 3: PRODUCTION (18 months) - Target: Commercial sales
─────────────────────────────────────────────────────────────
□ Third-party IEC 61851 certification
□ Grid code compliance (per country)
□ Full robot cell certification
□ Cybersecurity assessment
□ Quality management system (ISO 9001)

Outcome: Fully certified for EU market


PHASE 4: EXPANSION (24+ months) - Target: Other markets
─────────────────────────────────────────────────────────────
□ UKCA marking (UK)
□ UL/CSA (North America) - if entering
□ Other regional certifications

═══════════════════════════════════════════════════════════════
```

---

## 11. Key Contacts & Resources

```
USEFUL RESOURCES
═══════════════════════════════════════════════════════════════

STANDARDS BODIES:
• IEC: www.iec.ch
• ISO: www.iso.org
• CENELEC: www.cencenelec.eu

EU OFFICIAL:
• EUR-Lex (Directives): eur-lex.europa.eu
• Blue Guide: ec.europa.eu/growth

NOTIFIED BODIES DATABASE:
• NANDO: ec.europa.eu/growth/tools-databases/nando

TEST LABS (Examples):
• TÜV SÜD: www.tuvsud.com
• Element: www.element.com
• SGS: www.sgs.com

EV CHARGING SPECIFIC:
• CharIN (CCS organization): www.charin.global
• Open Charge Alliance: www.openchargealliance.org
```

---

## 12. Open Questions

1. **Target markets** - Which countries first? (affects grid codes)
2. **Robot OEM** - Their compliance responsibility vs ours?
3. **V2G scope** - Adds significant certification complexity
4. **Explosion protection** - Any ATEX zones? (battery swap?)
5. **Insurance requirements** - Product liability coverage
6. **Existing certifications** - Any components already certified?

---

## References

- IEC 62477-1:2022 - Safety requirements for power electronic converter systems
- IEC 61851-1:2017 - EV conductive charging system - General requirements
- IEC 61851-23:2014 - DC EV charging station
- ISO 10218-1:2011 - Robots - Safety requirements - Robots
- ISO 10218-2:2011 - Robots - Safety requirements - Integration
- EN ISO 13849-1:2023 - Safety of machinery - Safety-related control systems
- IEC 62443 series - Industrial communication networks - Security
- 2014/35/EU - Low Voltage Directive
- 2014/30/EU - EMC Directive
- 2006/42/EC - Machinery Directive
