# Rockstart Energy Submission Checklist

**Date:** January 20, 2026
**Status:** Ready to Submit

---

## Pre-Submission (Complete)

- [x] IP secured via Bernstein blockchain
- [x] 10 invention disclosures timestamped
- [x] Source code package prepared
- [x] Application draft written
- [x] Profile document complete
- [x] Financial projections drafted
- [x] Team CVs ready
- [x] Pitch deck outline ready

---

## Submission Actions

### Day 1 (Today)

- [ ] **Go to Rockstart Application**
  - URL: https://rockstart.com/energy/
  - Click "Apply Now"

- [ ] **Fill Online Form**
  - Use responses from `01-APPLICATION-MATERIALS.md`
  - Copy/paste prepared answers

- [ ] **Upload Materials**
  - Pitch deck (create PDF from outline)
  - Demo video link (if ready)
  - Team CVs

- [ ] **Optional: Offer Full Code Access**
  - Mention in application: "Full source code available for technical DD"
  - Shows technical depth and transparency

### Week 1-2

- [ ] **Prepare for Interview**
  - Review 4 D's alignment
  - Practice demo walkthrough
  - Prepare technical deep-dive

- [ ] **Research Interviewers**
  - Rockstart Energy partners
  - Recent portfolio companies
  - Program structure details

### If Invited to Interview

- [ ] **Demo Preparation**
  - `cd web && npm install && npm run dev`
  - Walkthrough: fleet visualization, module status
  - Explain ROJ consensus on whiteboard

- [ ] **Technical Questions Prep**
  - Why 3.3 kW module size?
  - How does ROJ consensus work?
  - What's the certification path?
  - How does fleet logistics scale?

---

## Application Form Sections

### Section 1: Company Info
- [ ] Company name: Elektrokombinacija
- [ ] Website: [GitHub or demo link]
- [ ] Country: Netherlands (planned) / Serbia (current)
- [ ] Stage: Pre-seed
- [ ] One-liner: Copy from application draft

### Section 2: Problem/Solution
- [ ] Problem statement (250 words) - from draft
- [ ] Solution description (300 words) - from draft
- [ ] Technology overview - from draft

### Section 3: Market
- [ ] TAM/SAM/SOM numbers
- [ ] Target customers
- [ ] Go-to-market strategy

### Section 4: Team
- [ ] Founder 1 (CEO) background
- [ ] Founder 2 (CTO) background
- [ ] Advisor info

### Section 5: Funding
- [ ] Amount seeking: €175K
- [ ] Use of funds breakdown
- [ ] Previous funding: None (bootstrapped)

### Section 6: Why Rockstart
- [ ] 4 D's alignment explanation
- [ ] What you need from program
- [ ] Portfolio synergies

---

## Materials to Upload

### Required
- [ ] Pitch deck (PDF)
- [ ] Team CVs (if requested)

### Optional (Differentiators)
- [ ] Demo video (2-3 min)
- [ ] Technical package link (Google Drive)
- [ ] GitHub access (private repo invite)

---

## Demo Video Script (If Recording)

```
DEMO VIDEO OUTLINE (2-3 minutes)
════════════════════════════════════════════════════════════════

0:00-0:20  INTRO
"I'm Bojan, founder of Elektrokombinacija. We're building
modular EV charging infrastructure for European bus fleets."

0:20-0:50  THE PROBLEM
Show: ABB charger photo, stranded investment story
"This €100K charger sits idle because proprietary firmware
can't be adapted locally. This will happen across Europe."

0:50-1:30  THE SOLUTION
Show: Web demo, module visualization
"EK3: 3.3 kW modules that scale to any power level.
Same module, same firmware, from e-bike to megacharger."

1:30-2:00  THE MAGIC (ROJ)
Show: Module failure, automatic recovery
"Watch what happens when a module fails... the mesh
reforms in under 100ms. No central controller."

2:00-2:30  THE BUSINESS
Show: Fleet logistics diagram
"Defective modules ride to depot on buses. Zero truck rolls.
This is how we beat ABB on service costs."

2:30-3:00  THE ASK
"We're seeking €175K from Rockstart to refine our prototype
and land our first EU customer. Full code available for DD."
```

---

## Key Talking Points

### If They Ask...

**"Why such small modules (3.3 kW)?"**
> Optimal balance of power density and repairability. Small enough
> for backpack transport, large enough for meaningful contribution.
> 46 modules = 150 kW bus charger with N+2 redundancy.

**"How is ROJ different from normal load balancing?"**
> No central coordinator. Each module runs identical firmware and
> participates in distributed consensus. It's Raft for power electronics.
> Failure recovery is automatic, not managed.

**"What's your unfair advantage?"**
> Architecture, not components. We use standard parts (SiC, STM32)
> in a fundamentally new arrangement. Incumbents can't retrofit
> distributed intelligence without complete redesign.

**"Why Serbia as a base?"**
> Cost-effective R&D, EU-adjacent timezone, personal network.
> Company will incorporate in Netherlands for EU market access.
> Best of both: Serbian engineering costs, Dutch legal structure.

**"What do you need from Rockstart specifically?"**
> 1. Dutch transit agency introductions (GVB, HTM)
> 2. CE certification guidance
> 3. Portfolio company connections (eDRV, Dexter Energy)
> 4. Investor network for Series A

---

## Files in This Folder

| File | Purpose |
|------|---------|
| `00-ROCKSTART-SUBMISSION-CONCEPT.md` | Overview of submission |
| `01-APPLICATION-MATERIALS.md` | Copy/paste for online form |
| `02-CHECKLIST.md` | This checklist |
| `EK-ROCKSTART-TECHNICAL-PACKAGE.zip` | Full code + docs (14 MB) |

---

## Success Criteria

### Immediate (Week 1-2)
- [ ] Application submitted
- [ ] Confirmation email received
- [ ] Materials properly uploaded

### Short-term (Week 2-4)
- [ ] Interview invitation
- [ ] Partner call scheduled
- [ ] Demo session booked

### Goal
- [ ] Accepted into cohort
- [ ] €175K investment secured
- [ ] Program start date confirmed

---

*Last updated: January 20, 2026*
