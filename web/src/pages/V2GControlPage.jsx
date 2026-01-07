import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import mermaid from 'mermaid';
import {
  Home,
  ChevronDown,
  ChevronRight,
  Zap,
  Radio,
  BarChart3,
  Shield,
  Cpu,
  Lock,
  RefreshCw,
  Activity,
  Gauge,
  Brain,
  ArrowLeftRight,
} from 'lucide-react';
import PasswordGate, { ACCESS_TIERS } from '../components/PasswordGate';

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#10b981',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#64748b',
    lineColor: '#64748b',
    secondaryColor: '#1e293b',
    tertiaryColor: '#334155',
    background: '#0f172a',
    mainBkg: '#1e293b',
    nodeBorder: '#64748b',
    clusterBkg: '#1e293b',
    titleColor: '#f8fafc',
    edgeLabelBackground: '#1e293b',
  },
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
  },
});

// V2G sections with bilingual content
const V2G_SECTIONS = [
  {
    id: 'intro',
    title: 'What is V2G?',
    titleSr: 'Šta je V2G?',
    icon: ArrowLeftRight,
    color: 'green',
    content: `**V2G (Vehicle-to-Grid)** enables bidirectional power flow between electric vehicles and the power grid.

### Philosophy: V2G Native, Not Addon

| Traditional Charger | ELEKTROKOMBINACIJA |
|---------------------|-------------------|
| Unidirectional power | Bidirectional from the start |
| V2G as addon | V2G as core feature |
| Passive load | Active grid asset |
| Fixed charging profile | Grid-responsive charging |
| ISO 15118-2 max | ISO 15118-20 native |

### Four-Quadrant Operation

Our system operates in all 4 quadrants:
- **Q1**: Charging + capacitive compensation
- **Q2**: V2G discharge + capacitive compensation
- **Q3**: V2G discharge + inductive compensation
- **Q4**: Charging + inductive compensation`,
    contentSr: `**V2G (Vehicle-to-Grid)** omogućava dvosmerni protok energije između električnih vozila i elektromreže.

### Filozofija: V2G Nativno, Ne Dodatak

| Tradicionalni punjač | ELEKTROKOMBINACIJA |
|---------------------|-------------------|
| Jednosmerna snaga | Dvosmerna od starta |
| V2G kao dodatak | V2G kao osnovna funkcija |
| Pasivno opterećenje | Aktivni mrežni resurs |
| Fiksni profil punjenja | Grid-responsive punjenje |
| ISO 15118-2 max | ISO 15118-20 nativno |

### Rad u četiri kvadranta

Naš sistem radi u sva 4 kvadranta:
- **Q1**: Punjenje + kapacitivna kompenzacija
- **Q2**: V2G pražnjenje + kapacitivna kompenzacija
- **Q3**: V2G pražnjenje + induktivna kompenzacija
- **Q4**: Punjenje + induktivna kompenzacija`,
    diagram: `flowchart LR
    subgraph Grid["GRID (AC)"]
        G[Power Grid<br/>50 Hz]
    end

    subgraph EK["ELEKTROKOMBINACIJA"]
        PFC[3-Level NPC<br/>PFC/Inverter]
        DC[DC Bus<br/>800V]
        LLC[LLC Converter<br/>Bidirectional]
    end

    subgraph Vehicle["VEHICLE"]
        BAT[Battery<br/>Pack]
    end

    G <-->|"Charge ←<br/>→ V2G"| PFC
    PFC <--> DC
    DC <--> LLC
    LLC <-->|"Charge ←<br/>→ Discharge"| BAT`,
  },
  {
    id: 'pll',
    title: 'Per-Module Grid Sync (PLL)',
    titleSr: 'Grid Sinhronizacija Po Modulu (PLL)',
    icon: Activity,
    color: 'cyan',
    content: `### SRF-PLL (Synchronous Reference Frame Phase-Locked Loop)

Each EK3 module has its own independent PLL for grid synchronization. This is the key innovation enabling hot-swap during V2G.

**Coordinate Transformations:**

1. **Clarke (abc → αβ)**: Converts 3-phase to stationary 2-phase
2. **Park (αβ → dq)**: Converts stationary to rotating synchronous frame

**PLL Performance:**
| Parameter | Value |
|-----------|-------|
| Bandwidth | ~20 Hz |
| Lock time | <50 ms |
| Phase error | <1° |
| Frequency range | 45-55 Hz |

**PI Controller Tuning:**
- Kp = 178 (proportional gain)
- Ki = 15,790 (integral gain)
- Damping ratio: ζ = 0.707 (critically damped)`,
    contentSr: `### SRF-PLL (Synchronous Reference Frame Phase-Locked Loop)

Svaki EK3 modul ima sopstveni nezavisni PLL za sinhronizaciju sa mrežom. Ovo je ključna inovacija koja omogućava hot-swap tokom V2G.

**Koordinatne transformacije:**

1. **Clarke (abc → αβ)**: Konvertuje 3-fazno u stacionarno 2-fazno
2. **Park (αβ → dq)**: Konvertuje stacionarno u rotirajući sinhroni okvir

**PLL performanse:**
| Parametar | Vrednost |
|-----------|----------|
| Propusni opseg | ~20 Hz |
| Vreme zaključavanja | <50 ms |
| Greška faze | <1° |
| Frekventni opseg | 45-55 Hz |

**PI Controller podešavanje:**
- Kp = 178 (proporcionalno pojačanje)
- Ki = 15,790 (integralno pojačanje)
- Faktor prigušenja: ζ = 0.707 (kritično prigušeno)`,
    diagram: `flowchart LR
    subgraph PLL["SRF-PLL"]
        V["Vabc<br/>(Grid)"] --> Clarke["Clarke<br/>abc→αβ"]
        Clarke --> Park["Park<br/>αβ→dq"]
        Park --> Vq["Vq"]
        Vq --> PI["PI<br/>Controller"]
        PI --> DeltaW["Δω"]
        DeltaW --> Plus["+"]
        W0["ω₀<br/>(314 rad/s)"] --> Plus
        Plus --> Int["∫"]
        Int --> Theta["θ"]
        Theta --> Park
    end

    Theta --> Out["Phase Angle<br/>for Control"]`,
  },
  {
    id: 'droop',
    title: 'Droop Control (P(f), Q(V))',
    titleSr: 'Droop Kontrola (P(f), Q(V))',
    icon: Gauge,
    color: 'purple',
    content: `### Frequency Droop P(f)

Automatic load sharing based on grid frequency deviation:

\`\`\`
P = Pn × (f_nom - f) / (f_nom × droop%)

Where:
- Pn = rated power (3.3 kW per module)
- f_nom = 50 Hz
- droop = 2-12% (per ENTSO-E)
\`\`\`

**Frequency Thresholds:**
| Range | Action |
|-------|--------|
| 50.2+ Hz | Reduce charging |
| 49.8-50.2 Hz | Normal (deadband) |
| 49.5-49.8 Hz | V2G activation |
| <49.5 Hz | Maximum V2G |

### Voltage Droop Q(V)

Reactive power for voltage support (no battery wear!):

\`\`\`
Q = Qmax × (V_nom - V) / ΔV

Power factor range: 0.9 leading to 0.9 lagging
\`\`\`

**Key benefit**: Voltage regulation uses only reactive power exchange, causing zero battery degradation.`,
    contentSr: `### Frekventni Droop P(f)

Automatska raspodela opterećenja zasnovana na devijaciji frekvencije mreže:

\`\`\`
P = Pn × (f_nom - f) / (f_nom × droop%)

Gde je:
- Pn = nominalna snaga (3.3 kW po modulu)
- f_nom = 50 Hz
- droop = 2-12% (prema ENTSO-E)
\`\`\`

**Frekventni pragovi:**
| Opseg | Akcija |
|-------|--------|
| 50.2+ Hz | Smanji punjenje |
| 49.8-50.2 Hz | Normalno (deadband) |
| 49.5-49.8 Hz | V2G aktivacija |
| <49.5 Hz | Maksimalni V2G |

### Naponski Droop Q(V)

Reaktivna snaga za podršku napona (bez habanja baterije!):

\`\`\`
Q = Qmax × (V_nom - V) / ΔV

Opseg faktora snage: 0.9 leading do 0.9 lagging
\`\`\`

**Ključna prednost**: Regulacija napona koristi samo razmenu reaktivne snage, bez degradacije baterije.`,
    diagram: `flowchart TB
    subgraph Freq["Frequency Droop P(f)"]
        F["Grid<br/>Frequency"] --> FD["Droop<br/>Calculator"]
        FD --> P["Active Power<br/>P (kW)"]
    end

    subgraph Volt["Voltage Droop Q(V)"]
        V["Grid<br/>Voltage"] --> VD["Droop<br/>Calculator"]
        VD --> Q["Reactive Power<br/>Q (kVAr)"]
    end

    P --> Total["Power<br/>Command"]
    Q --> Total
    Total --> Inv["EK3<br/>Inverter"]`,
  },
  {
    id: 'hotswap',
    title: 'Hot-Swap During V2G',
    titleSr: 'Hot-Swap Tokom V2G',
    icon: RefreshCw,
    color: 'orange',
    content: `### Zero Downtime Module Replacement

The key innovation: **modules can be replaced during active V2G operation** without interrupting grid service.

**How it works:**

1. **Detection**: Module fault detected (ESR rise, thermal issue)
2. **Redistribution**: Remaining 99 modules absorb the load
3. **Swap**: Robot replaces faulty module in 60 seconds
4. **Resync**: New module's PLL locks to grid in <50ms
5. **Rebalance**: Power redistributed across 100 modules

**Math:**
\`\`\`
100 modules at 99% load = 99 MW
1 module fails → 99 modules at 100% load = 99 MW
Overload per module: 1.01% (within safe margin)
\`\`\`

**Grid Service Impact:**
- Power delivery: **Uninterrupted**
- Frequency response: **Continuous**
- Voltage support: **Maintained**`,
    contentSr: `### Zamena modula bez zastoja

Ključna inovacija: **moduli se mogu zameniti tokom aktivnog V2G rada** bez prekida mrežnog servisa.

**Kako funkcioniše:**

1. **Detekcija**: Kvar modula detektovan (porast ESR, termalni problem)
2. **Preraspoređivanje**: Preostalih 99 modula preuzima opterećenje
3. **Zamena**: Robot zamenjuje neispravan modul za 60 sekundi
4. **Resinhronizacija**: PLL novog modula se zaključava na mrežu za <50ms
5. **Rebalansiranje**: Snaga preraspoređena na 100 modula

**Matematika:**
\`\`\`
100 modula na 99% opterećenja = 99 MW
1 modul otkaže → 99 modula na 100% opterećenja = 99 MW
Preopterećenje po modulu: 1.01% (u sigurnoj margini)
\`\`\`

**Uticaj na mrežni servis:**
- Isporuka snage: **Neprekidna**
- Frekventni odziv: **Kontinuiran**
- Podrška naponu: **Održana**`,
    diagram: `flowchart LR
    subgraph Before["Before Fault"]
        M1["Module 1<br/>3.3 kW"]
        M2["Module 2<br/>3.3 kW"]
        M3["Module 3<br/>3.3 kW"]
        Mn["...<br/>Module 100"]
    end

    subgraph During["During Swap (60s)"]
        M1b["Module 1<br/>3.33 kW"]
        M2b["Module 2<br/>3.33 kW"]
        X["❌ Module 3<br/>SWAP"]
        Mnb["...<br/>3.33 kW"]
    end

    subgraph After["After Swap"]
        M1c["Module 1<br/>3.3 kW"]
        M2c["Module 2<br/>3.3 kW"]
        M3c["✅ Module 3<br/>NEW"]
        Mnc["...<br/>Module 100"]
    end

    Before --> During --> After`,
  },
  {
    id: 'iso15118',
    title: 'ISO 15118-20 BPT',
    titleSr: 'ISO 15118-20 BPT',
    icon: Shield,
    color: 'blue',
    content: `### Bidirectional Power Transfer Protocol

ISO 15118-20 is the international standard for V2G communication between vehicle and charger.

**Protocol Stack:**
| Layer | Technology |
|-------|------------|
| Application | V2G Messages, BPT Control |
| Presentation | EXI (Efficient XML Interchange) |
| Session | TLS 1.3 (mandatory) |
| Transport | TCP/IP |
| Physical | HomePlug Green PHY (PLC) |

**BPT Control Modes:**

1. **Scheduled Mode**
   - Predefined charging/discharging schedule
   - EV provides departure time, target SoC
   - EVSE optimizes based on grid conditions

2. **Dynamic Mode**
   - Real-time power adjustment
   - EVSE can request power changes on-the-fly
   - Required for frequency regulation

**Key Feature**: Mode transition (Grid-Following ↔ Grid-Forming) without service renegotiation.`,
    contentSr: `### Protokol za Dvosmerni Prenos Snage

ISO 15118-20 je međunarodni standard za V2G komunikaciju između vozila i punjača.

**Protokol stek:**
| Sloj | Tehnologija |
|------|-------------|
| Aplikacija | V2G Poruke, BPT Kontrola |
| Prezentacija | EXI (Efficient XML Interchange) |
| Sesija | TLS 1.3 (obavezno) |
| Transport | TCP/IP |
| Fizički | HomePlug Green PHY (PLC) |

**BPT Režimi Kontrole:**

1. **Zakazani Režim**
   - Unapred definisan raspored punjenja/pražnjenja
   - EV pruža vreme polaska, ciljni SoC
   - EVSE optimizuje na osnovu uslova mreže

2. **Dinamički Režim**
   - Prilagođavanje snage u realnom vremenu
   - EVSE može zahtevati promene snage u hodu
   - Potrebno za regulaciju frekvencije

**Ključna funkcija**: Prelaz režima (Grid-Following ↔ Grid-Forming) bez ponovnog pregovaranja servisa.`,
    diagram: `sequenceDiagram
    participant EV as EVCC (Vehicle)
    participant CS as SECC (Charger)

    EV->>CS: SupportedAppProtocolReq
    CS->>EV: SupportedAppProtocolRes (ISO15118-20)
    EV->>CS: SessionSetupReq
    CS->>EV: SessionSetupRes
    EV->>CS: ServiceDiscoveryReq
    CS->>EV: ServiceDiscoveryRes (DC_BPT)
    EV->>CS: ServiceSelectionReq (BPT)
    CS->>EV: ServiceSelectionRes
    loop Power Transfer
        EV->>CS: DC_BPT_ChargeLoopReq
        CS->>EV: DC_BPT_ChargeLoopRes
    end`,
  },
  {
    id: 'aiml',
    title: 'AI/ML Optimization',
    titleSr: 'AI/ML Optimizacija',
    icon: Brain,
    color: 'pink',
    content: `### Edge-Deployed Machine Learning

AI/ML algorithms run directly on STM32H7 microcontrollers for real-time V2G optimization.

**1. Grid Frequency Prediction (LSTM)**
- Architecture: 2-layer LSTM (64→32 units)
- Input: 60-second sliding window
- Prediction: 1s, 10s, 60s, 300s ahead
- Accuracy: <0.02 Hz MAE

**2. Demand Response Optimization (MILP)**
- PuLP solver for fleet optimization
- Minimizes: Degradation + Opportunity cost - Revenue
- Constraints: SoC limits, Departure times, Ramp rates

**3. Price Arbitrage**
\`\`\`
Breakeven = (1/η_rt - 1) × P_avg + C_degradation

Where:
- η_rt = 91% round-trip efficiency
- C_degradation = $0.02/kWh battery wear
\`\`\`

**4. Fleet Aggregation**
- Priority scoring: SoC, Departure, Health, Margin
- Greedy allocation to highest-priority vehicles
- CAN-FD response: <10ms`,
    contentSr: `### Mašinsko Učenje na Edge Uređajima

AI/ML algoritmi rade direktno na STM32H7 mikrokontrolerima za optimizaciju V2G u realnom vremenu.

**1. Predikcija Frekvencije Mreže (LSTM)**
- Arhitektura: 2-slojni LSTM (64→32 jedinice)
- Ulaz: 60-sekundni klizni prozor
- Predikcija: 1s, 10s, 60s, 300s unapred
- Tačnost: <0.02 Hz MAE

**2. Optimizacija Demand Response (MILP)**
- PuLP solver za optimizaciju flote
- Minimizira: Degradacija + Oportunitetni trošak - Prihod
- Ograničenja: SoC limiti, Vremena polaska, Stope rampe

**3. Arbitraža Cena**
\`\`\`
Breakeven = (1/η_rt - 1) × P_avg + C_degradation

Gde je:
- η_rt = 91% round-trip efikasnost
- C_degradation = $0.02/kWh habanje baterije
\`\`\`

**4. Agregacija Flote**
- Bodovanje prioriteta: SoC, Polazak, Zdravlje, Margina
- Greedy alokacija vozilima sa najvišim prioritetom
- CAN-FD odziv: <10ms`,
    diagram: `flowchart TB
    subgraph Edge["Edge (STM32H7)"]
        LSTM["LSTM<br/>Freq Prediction"]
        Anom["Anomaly<br/>Detection"]
        Local["Local<br/>Optimization"]
    end

    subgraph Cloud["Cloud"]
        Train["Model<br/>Training"]
        Fleet["Fleet<br/>Aggregation"]
        MILP["MILP<br/>Solver"]
    end

    LSTM --> Local
    Anom --> Local
    Local --> CAN["CAN-FD<br/>Bus"]

    Train -.->|"TFLite Model"| LSTM
    Fleet --> MILP
    MILP -.->|"Schedules"| Local`,
  },
];

// Mermaid diagram component
function MermaidDiagram({ chart, id }) {
  const [svg, setSvg] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render(`mermaid-v2g-${id}`, chart);
        setSvg(svg);
      } catch (error) {
        console.error('Mermaid render error:', error);
      }
    };
    renderDiagram();
  }, [chart, id]);

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: svg }}
      className="bg-slate-800 rounded-lg p-4 overflow-x-auto my-4"
    />
  );
}

// Section component
function V2GSection({ section, isExpanded, onToggle, language }) {
  const Icon = section.icon;
  const title = language === 'sr' ? section.titleSr : section.title;
  const content = language === 'sr' ? section.contentSr : section.content;

  const colorClasses = {
    green: 'bg-green-500/20 border-green-500/30 text-green-400',
    cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
    purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
    orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
    blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
  };

  // Simple markdown-like rendering
  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-semibold mt-4 mb-2 text-slate-100">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-slate-200">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('| ')) {
        // Table row - simplified
        const cells = line.split('|').filter(c => c.trim());
        return (
          <div key={i} className="grid grid-cols-2 gap-2 text-sm border-b border-slate-700 py-1">
            {cells.map((cell, j) => (
              <span key={j} className={j === 0 ? 'text-slate-400' : 'text-slate-200'}>{cell.trim().replace(/\*\*/g, '')}</span>
            ))}
          </div>
        );
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 text-slate-300">{line.replace('- ', '')}</li>;
      }
      if (line.startsWith('```')) {
        return null; // Skip code fence markers
      }
      if (line.startsWith('`') && line.endsWith('`')) {
        return <code key={i} className="block bg-slate-800 p-2 rounded text-sm text-green-400 font-mono my-2">{line.replace(/`/g, '')}</code>;
      }
      if (line.includes('`') && !line.startsWith('`')) {
        // Inline code - render as paragraph with code spans
        return <p key={i} className="text-slate-300 my-1">{line}</p>;
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-slate-300 my-1">{line}</p>;
    });
  };

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-800/50 mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorClasses[section.color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-100">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-700">
          <div className="prose prose-invert max-w-none">
            {renderContent(content)}
          </div>
          {section.diagram && (
            <MermaidDiagram chart={section.diagram} id={section.id} />
          )}
        </div>
      )}
    </div>
  );
}

// Main page content
function V2GContent() {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language === 'sr' ? 'sr' : 'en');
  const [expandedSections, setExpandedSections] = useState(['intro']);

  const toggleSection = (id) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const expandAll = () => setExpandedSections(V2G_SECTIONS.map(s => s.id));
  const collapseAll = () => setExpandedSections([]);

  const stats = [
    { value: '<50ms', label: language === 'sr' ? 'PLL Sinhronizacija' : 'PLL Lock Time', color: 'cyan' },
    { value: '<100ms', label: language === 'sr' ? 'Frekventni Odziv' : 'Freq Response', color: 'green' },
    { value: '60s', label: language === 'sr' ? 'Hot-Swap Vreme' : 'Hot-Swap Time', color: 'orange' },
    { value: '91%+', label: language === 'sr' ? 'Round-Trip' : 'Round-Trip Eff', color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                <Home className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <h1 className="text-xl font-bold text-white">V2G CONTROL SYSTEM</h1>
                </div>
                <p className="text-sm text-slate-400">
                  {language === 'sr' ? 'Vehicle-to-Grid Kontrolni Sistem' : 'Bidirectional Power Transfer'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Language toggle */}
              <div className="flex bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    language === 'en' ? 'bg-green-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('sr')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    language === 'sr' ? 'bg-green-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SR
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center"
            >
              <div className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</div>
              <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Expand/Collapse buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
          >
            {language === 'sr' ? 'Proširi Sve' : 'Expand All'}
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors"
          >
            {language === 'sr' ? 'Skupi Sve' : 'Collapse All'}
          </button>
        </div>

        {/* Sections */}
        {V2G_SECTIONS.map(section => (
          <V2GSection
            key={section.id}
            section={section}
            isExpanded={expandedSections.includes(section.id)}
            onToggle={() => toggleSection(section.id)}
            language={language}
          />
        ))}

        {/* Link to simulation */}
        <div className="mt-8 p-6 bg-gradient-to-r from-green-900/30 to-cyan-900/30 border border-green-500/30 rounded-xl text-center">
          <h3 className="text-lg font-bold text-white mb-2">
            {language === 'sr' ? 'Pogledaj V2G u Akciji' : 'See V2G in Action'}
          </h3>
          <p className="text-slate-400 mb-4">
            {language === 'sr'
              ? 'Pokreni simulaciju i aktiviraj V2G scenario da vidiš module kako reaguju na pad frekvencije mreže.'
              : 'Run the simulation and trigger a V2G scenario to see modules respond to grid frequency dips.'}
          </p>
          <Link
            to="/simulation"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
          >
            <Zap className="w-5 h-5" />
            {language === 'sr' ? 'Otvori Simulator' : 'Open Simulator'}
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 mt-8">
        <p className="text-center text-slate-500 text-sm">
          ELEKTROKOMBINACIJA V2G Control System • {language === 'sr' ? 'Poverljivo' : 'Confidential'}
        </p>
      </footer>
    </div>
  );
}

// Export with password gate
export default function V2GControlPage() {
  const { t } = useTranslation();

  return (
    <PasswordGate tier={ACCESS_TIERS.PARTNER}>
      <V2GContent />
    </PasswordGate>
  );
}
