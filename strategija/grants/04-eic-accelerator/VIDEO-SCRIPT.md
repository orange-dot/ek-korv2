# EIC Accelerator - Video Pitch Script

**Duration:** 3 minutes maximum
**Format:** Founder talking to camera + visuals
**Speaker:** Bojan Janjatovic (CTO) or Marija Janjatovic (CEO)

---

## Script

### Opening (0:00 - 0:20)

[Visual: Bus depot with charging stations]

**BOJAN:**
"Every electric bus depot in Europe runs on proprietary software that doesn't talk to each other. ABB's system doesn't work with Siemens. Siemens doesn't work with ChargePoint. It's like the early days of mobile phones - before Android."

---

### Problem (0:20 - 0:45)

[Visual: Diagram showing fragmented systems]

**BOJAN:**
"The EU has mandated €100 billion in EV charging infrastructure. But there's no coordination standard. Transit operators are stuck with vendor lock-in, expensive integration, and systems that fail when a single controller goes down."

[Visual: Single point of failure diagram]

"Every system today has a central coordinator. When that fails, everything stops."

---

### Solution (0:45 - 1:30)

[Visual: EK-KOR2 architecture, self-organizing modules]

**BOJAN:**
"We built EK-KOR2 - an open-source operating system where charging modules coordinate themselves. No central controller. No single point of failure."

[Visual: Potential field animation - work flowing to low-load modules]

"Our innovation is called potential field scheduling. Each module publishes its state - how loaded it is, its temperature, available power. Work flows automatically from overloaded modules to available ones - like water flowing downhill."

[Visual: Self-healing animation - module fails, others adapt]

"When a module fails, the others adapt in milliseconds. The system heals itself."

---

### Validation (1:30 - 1:50)

[Visual: Code/tests, Infineon logo]

**BOJAN:**
"This isn't just theory. We have working code with 22 tests passing. Infineon - a €50 billion semiconductor company - is partnering with us on emulator development. They've reviewed our source code and they see a production path."

---

### Business Model (1:50 - 2:15)

[Visual: Open source vs revenue split]

**BOJAN:**
"Our model is simple: open-source the software, sell certified hardware and services. It's the same playbook as Linux, Android, and Kubernetes."

[Visual: Red Hat $34B, Android 70% market share]

"Linux is free. Red Hat was acquired for $34 billion. Android is free. Google owns the mobile ecosystem. We're creating the Linux of distributed energy."

---

### Ask (2:15 - 2:40)

[Visual: Milestones timeline]

**BOJAN:**
"We're asking for €2.5 million to launch EK-KOR2 publicly and deploy our first certified hardware pilots with European transit operators."

[Visual: Team photos]

"My co-founder Marija handles business operations. I designed the RTOS and the hardware. We have PhD advisors in distributed systems and a clear path to building a team."

---

### Close (2:40 - 3:00)

[Visual: EU map with charging infrastructure]

**BOJAN:**
"Europe is building the world's largest EV charging network. We can let it be controlled by proprietary American and Chinese systems. Or we can build an open European standard that becomes the foundation for the entire industry."

[Visual: Elektrokombinacija logo]

"Elektrokombinacija. The Linux of distributed energy."

---

## Production Notes

### Visual Requirements

1. **Bus depot B-roll** (stock footage or self-shot)
2. **Architecture diagrams** (animated)
3. **Potential field animation** (show gradient flow)
4. **Self-healing animation** (module failure → recovery)
5. **Code screenshots** (tests passing)
6. **Partner logos** (Infineon)
7. **Business model diagram**
8. **Timeline/milestones**
9. **Team photos**
10. **EU map visualization**

### Technical Setup

- **Camera:** 4K, good lighting
- **Audio:** Lapel mic or shotgun
- **Background:** Clean, professional (office or neutral)
- **Dress:** Business casual
- **Teleprompter:** Recommended for consistent delivery

### Editing Guidelines

- Keep cuts dynamic (every 10-15 seconds)
- Use visual aids for technical concepts
- Include captions/subtitles
- End card with contact info

### Alternative: Marija as Speaker

If Marija presents, adjust script to:
- More business/market focus
- Reference Bojan as technical co-founder
- Same key messages, different delivery style

---

## Backup Talking Points

If questions arise in interview:

**"Why open source?"**
> "Standard creation is the ultimate moat. Once everyone uses your standard, switching costs are high. We monetize hardware and services, not the software itself."

**"Why will incumbents not just copy this?"**
> "Innovator's dilemma. Their business model is proprietary lock-in. Open-sourcing would cannibalize their existing revenue."

**"What's the technical breakthrough?"**
> "Potential field scheduling - adapting Khatib's 1986 robot navigation algorithm to temporal task scheduling. No one has done this for distributed power electronics."

**"What's next if you get funded?"**
> "Hire three engineers, launch EK-KOR2 publicly by month 6, have certified hardware in pilots by month 12. Series A ready by month 24."

---

*Video script prepared: January 2026*
*For: EIC Accelerator Application*
