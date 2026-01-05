import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import mermaid from 'mermaid';
import {
  Home,
  ChevronDown,
  ChevronRight,
  Zap,
  Users,
  Radio,
  BarChart3,
  Thermometer,
  Shield,
  Layers,
  Sparkles,
  Battery,
  AlertTriangle,
  Lock,
  Hexagon,
  Network,
} from 'lucide-react';
import PasswordGate from '../components/PasswordGate';

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#3b82f6',
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

// ROJ sections with bilingual content
const ROJ_SECTIONS = [
  {
    id: 'intro',
    title: 'What is ROJ?',
    titleSr: 'Šta je ROJ?',
    icon: Zap,
    color: 'blue',
    content: `**ROJ** (Serbian for "swarm", as in bee swarm) is Elektrokombinacija's distributed intelligence system.

Just as **JEZGRO** names our microkernel OS, **ROJ** names our swarm coordination layer.

### Philosophy
> "Simple rules at the individual level create complex optimal behavior at the system level."

Each module is autonomous. No central controller. Peer-to-peer coordination.

**Key Difference:**
- Traditional: Single point of failure, controller bottleneck
- ROJ: No single point of failure, direct peer communication`,
    contentSr: `**ROJ** je naš sistem distribuirane inteligencije nazvan po srpskoj reči za "roj" (kao roj pčela).

Kao što **JEZGRO** imenuje naš mikrokernel OS, **ROJ** imenuje naš sloj za koordinaciju roja.

### Filozofija
> "Jednostavna pravila na nivou pojedinca stvaraju kompleksno optimalno ponašanje na nivou sistema."

Svaki modul je autonoman. Nema centralnog kontrolera. Peer-to-peer koordinacija.

**Ključna razlika:**
- Tradicionalno: Jedna tačka otkaza, usko grlo kontrolera
- ROJ: Bez jedne tačke otkaza, direktna peer komunikacija`,
    diagram: `flowchart LR
    subgraph Traditional["Tradicionalno: Centralni Kontroler"]
        CC[Centralni<br/>Kontroler]
        M1a[Modul 1]
        M2a[Modul 2]
        M3a[Modul 3]
        CC --> M1a
        CC --> M2a
        CC --> M3a
    end

    subgraph ROJ["ROJ: Distribuirana Inteligencija"]
        M1b[Modul 1<br/>+ AI]
        M2b[Modul 2<br/>+ AI]
        M3b[Modul 3<br/>+ AI]
        M1b <--> M2b
        M2b <--> M3b
        M3b <--> M1b
    end`,
  },
  {
    id: 'leader-election',
    title: 'Leader Election (Raft)',
    titleSr: 'Izbor Lidera (Raft)',
    icon: Users,
    color: 'purple',
    content: `### Dynamic Role Assignment

Modules take on roles dynamically. Leader election uses **Raft consensus algorithm**.

| Role | Count | Responsibilities |
|------|-------|-----------------|
| **Leader** | 1 | Aggregate state, assign loads, coordinate |
| **Follower** | N-1 | Local optimization, report status, vote |
| **Standby** | 0+ | Reduced power, hot spare, ready to activate |

### Election Timing
- Election timeout: 150-300ms (randomized)
- Heartbeat interval: 50ms
- Leader election: <400ms total`,
    contentSr: `### Dinamička dodela uloga

Moduli dinamički preuzimaju uloge. Izbor lidera koristi **Raft konsenzus algoritam**.

| Uloga | Broj | Odgovornosti |
|-------|------|--------------|
| **Lider** | 1 | Agregira stanje, dodeljuje opterećenje, koordinira |
| **Pratilac** | N-1 | Lokalna optimizacija, izveštava status, glasa |
| **Rezerva** | 0+ | Smanjena snaga, hot spare, spreman za aktivaciju |

### Vremenski okviri izbora
- Timeout izbora: 150-300ms (nasumično)
- Heartbeat interval: 50ms
- Izbor lidera: <400ms ukupno`,
    diagram: `stateDiagram-v2
    [*] --> Follower: Power On

    Follower --> Candidate: Election Timeout
    Candidate --> Leader: Majority Votes
    Candidate --> Follower: Higher Term
    Leader --> Follower: Higher Term

    Follower --> Standby: Low Demand
    Standby --> Follower: Demand Increase`,
  },
  {
    id: 'communication',
    title: 'Communication Protocol',
    titleSr: 'Komunikacioni Protokol',
    icon: Radio,
    color: 'cyan',
    content: `### CAN-FD @ 5 Mbps

All inter-module communication uses **CAN-FD** (Flexible Data-rate).

| Type | ID | Frequency | Purpose |
|------|------|-----------|---------|
| \`HEARTBEAT\` | 0x1xx | 1 Hz | Presence detection |
| \`POWER_CMD\` | 0x2xx | On-demand | Power redistribution |
| \`SYNC\` | 0x0xx | 100 Hz | Time/grid sync |
| \`THERMAL\` | 0x3xx | 10 Hz | Thermal coordination |
| \`FAULT\` | 0x7FF | Event | Emergency notification |
| \`ELECTION\` | 0x010 | Event | Leader election |`,
    contentSr: `### CAN-FD @ 5 Mbps

Sva međumodulska komunikacija koristi **CAN-FD** (Flexible Data-rate).

| Tip | ID | Frekvencija | Svrha |
|-----|------|-------------|-------|
| \`HEARTBEAT\` | 0x1xx | 1 Hz | Detekcija prisutnosti |
| \`POWER_CMD\` | 0x2xx | Po potrebi | Preraspodelа snage |
| \`SYNC\` | 0x0xx | 100 Hz | Vremenska/mrežna sinhronizacija |
| \`THERMAL\` | 0x3xx | 10 Hz | Termalna koordinacija |
| \`FAULT\` | 0x7FF | Događaj | Hitna notifikacija |
| \`ELECTION\` | 0x010 | Događaj | Izbor lidera |`,
    diagram: `sequenceDiagram
    participant L as Leader
    participant F1 as Follower 1
    participant F2 as Follower 2

    L->>F1: HEARTBEAT
    L->>F2: HEARTBEAT
    F1-->>L: STATUS (T=45°C)
    F2-->>L: STATUS (T=52°C)

    Note over L,F2: Thermal Share
    L->>F2: THERMAL_SHARE (reduce 10%)

    Note over F2: Fault Event
    F2--xL: FAULT_ALERT
    L->>F1: POWER_CMD (+15%)`,
  },
  {
    id: 'load-balancing',
    title: 'Distributed Load Balancing',
    titleSr: 'Distribuirano Balansiranje',
    icon: BarChart3,
    color: 'green',
    content: `### Two Mechanisms

**1. Droop Control (Hardware)**
\`\`\`
P_out = P_rated × (V_ref - V_actual) / ΔV_droop
\`\`\`
Natural self-balancing. Higher bus voltage → Higher power output. No communication needed.

**2. AI-Enhanced Optimization**
- Thermal awareness (hot modules reduce load)
- Efficiency curves (optimal operating points)
- Lifetime balancing (wear leveling)
- Fault anticipation (predictive)`,
    contentSr: `### Dva mehanizma

**1. Droop kontrola (Hardver)**
\`\`\`
P_out = P_rated × (V_ref - V_actual) / ΔV_droop
\`\`\`
Prirodno samo-balansiranje. Viši napon magistrale → Veća izlazna snaga. Bez komunikacije.

**2. AI-poboljšana optimizacija**
- Termalna svesnost (vrući moduli smanjuju opterećenje)
- Krive efikasnosti (optimalne radne tačke)
- Balansiranje životnog veka (ravnomerno trošenje)
- Anticipacija kvarova (prediktivno)`,
    diagram: `flowchart TD
    subgraph Droop["Droop Control Loop"]
        V[Measure Bus Voltage]
        C[Compare to Reference]
        D{ΔV > threshold?}
        INC[Increase Power]
        DEC[Decrease Power]

        V --> C
        C --> D
        D -->|V < Vref| INC
        D -->|V > Vref| DEC
        INC --> V
        DEC --> V
    end`,
  },
  {
    id: 'thermal',
    title: 'Thermal Migration',
    titleSr: 'Termalna Migracija',
    icon: Thermometer,
    color: 'orange',
    content: `### Heat Flows to Cooler Modules

Through load redistribution, heat effectively "migrates" from hot modules to cooler ones.

**Before Optimization:**
| Module | Temperature | Power |
|--------|------------|-------|
| M1 | 45°C | 3.3 kW |
| M2 | **65°C** | 3.3 kW |
| M3 | 48°C | 3.3 kW |

**After ROJ Optimization:**
| Module | Temperature | Power |
|--------|------------|-------|
| M1 | 50°C | 3.6 kW |
| M2 | **55°C** | 2.4 kW |
| M3 | 52°C | 3.9 kW |

**Result:** Temperature spread reduced from 20°C to 5°C.`,
    contentSr: `### Toplota "teče" ka hladnijim modulima

Kroz preraspodelu opterećenja, toplota efektivno "migrira" sa vrućih modula na hladnije.

**Pre optimizacije:**
| Modul | Temperatura | Snaga |
|-------|-------------|-------|
| M1 | 45°C | 3.3 kW |
| M2 | **65°C** | 3.3 kW |
| M3 | 48°C | 3.3 kW |

**Nakon ROJ optimizacije:**
| Modul | Temperatura | Snaga |
|-------|-------------|-------|
| M1 | 50°C | 3.6 kW |
| M2 | **55°C** | 2.4 kW |
| M3 | 52°C | 3.9 kW |

**Rezultat:** Raspon temperature smanjen sa 20°C na 5°C.`,
    diagram: `flowchart LR
    subgraph Before["Pre migracije"]
        B1["M1: 45°C"]
        B2["M2: 65°C"]
        B3["M3: 48°C"]
    end

    subgraph After["Posle migracije"]
        A1["M1: 50°C"]
        A2["M2: 55°C"]
        A3["M3: 52°C"]
    end

    Before --> |"ROJ<br/>Optimization"| After`,
  },
  {
    id: 'fault-tolerance',
    title: 'Fault Tolerance',
    titleSr: 'Tolerancija na Greške',
    icon: Shield,
    color: 'red',
    content: `### Self-Healing System

**Recovery Times:**
| Event | Detection | Response | Total |
|-------|-----------|----------|-------|
| Module fault | <1 ms | <100 ms | <100 ms |
| Leader failure | 150-300 ms | <100 ms | <400 ms |
| Communication loss | 50 ms | Immediate | <50 ms |

**N+1 Redundancy:**
- System sized: Σ P_module > P_required × 1.2
- Example: 6 × EK3 (19.8 kW) for 16 kW system
- Any single failure: No service interruption`,
    contentSr: `### Samo-lečeći sistem

**Vremena oporavka:**
| Događaj | Detekcija | Odgovor | Ukupno |
|---------|-----------|---------|--------|
| Kvar modula | <1 ms | <100 ms | <100 ms |
| Kvar lidera | 150-300 ms | <100 ms | <400 ms |
| Gubitak komunikacije | 50 ms | Trenutno | <50 ms |

**N+1 Redundancija:**
- Sistem dimenzionisan: Σ P_modul > P_zahtevano × 1.2
- Primer: 6 × EK3 (19.8 kW) za 16 kW sistem
- Bilo koji pojedinačni kvar: Bez prekida usluge`,
    diagram: `sequenceDiagram
    participant M as Faulty Module
    participant L as Leader
    participant P1 as Peer 1
    participant P2 as Peer 2

    Note over M: Fault Detected
    M->>L: FAULT_ALERT
    L->>L: Calculate redistribution

    par Redistribute
        L->>P1: POWER_CMD (+25%)
        L->>P2: POWER_CMD (+25%)
    end

    P1-->>L: ACK
    P2-->>L: ACK
    Note over M,P2: Service maintained<br/><100ms`,
  },
  {
    id: 'scalability',
    title: 'Scalability',
    titleSr: 'Skalabilnost',
    icon: Layers,
    color: 'indigo',
    content: `### Hierarchical Coordination

| Level | Scope | Max Modules | Communication |
|-------|-------|-------------|---------------|
| **L1** | Single CAN | 20 | Direct CAN-FD |
| **L2** | CAN bridge | 100 | CAN-FD bridged |
| **L3** | Site-wide | 1000+ | Ethernet + CAN |

**Plug & Play:**
1. Physical connection (DC bus, CAN-FD)
2. Power up → self-test → CAN scan
3. JOIN_REQUEST → receive config
4. PLL lock → soft-start
5. Full operation in <60 seconds`,
    contentSr: `### Hijerarhijska koordinacija

| Nivo | Opseg | Max modula | Komunikacija |
|------|-------|------------|--------------|
| **L1** | Jedan CAN | 20 | Direktan CAN-FD |
| **L2** | CAN most | 100 | CAN-FD premošćen |
| **L3** | Ceo sajt | 1000+ | Ethernet + CAN |

**Plug & Play:**
1. Fizička konekcija (DC bus, CAN-FD)
2. Uključenje → samo-test → CAN skeniranje
3. JOIN_REQUEST → prijem konfiguracije
4. PLL zaključavanje → soft-start
5. Pun rad za <60 sekundi`,
    diagram: `flowchart BT
    subgraph L1["Nivo 1: Module ROJs"]
        R1[ROJ Klaster 1<br/>20 modula]
        R2[ROJ Klaster 2<br/>20 modula]
        R3[ROJ Klaster 3<br/>20 modula]
    end

    subgraph L2["Nivo 2: ROJ-of-ROJs"]
        RR[Meta-ROJ<br/>Koordinira klastere]
    end

    subgraph L3["Nivo 3: Site Controller"]
        SC[Site Controller<br/>Fleet Integration]
    end

    R1 --> RR
    R2 --> RR
    R3 --> RR
    RR --> SC`,
  },
  {
    id: 'emergent',
    title: 'Emergent Behaviors',
    titleSr: 'Emergentna Ponašanja',
    icon: Sparkles,
    color: 'pink',
    content: `### Simple Rules → Complex Behavior

**Load Following**
- Tracks load changes automatically
- No central command needed
- Sub-second response

**Thermal Migration**
- Heat "flows" to cooler modules
- Prevents hot spots
- Extends component lifetime

**Fault Absorption**
- Seamless ride-through
- Automatic redistribution
- Zero service interruption

**Self Organization**
- New modules auto-integrate
- Failed modules auto-excluded
- Network self-heals`,
    contentSr: `### Jednostavna pravila → Kompleksno ponašanje

**Praćenje opterećenja**
- Automatski prati promene opterećenja
- Nije potrebna centralna komanda
- Sub-sekundni odgovor

**Termalna migracija**
- Toplota "teče" ka hladnijim modulima
- Sprečava vruće tačke
- Produžava životni vek komponenti

**Apsorpcija kvarova**
- Besprekoran prolaz kroz kvar
- Automatska preraspodela
- Nula prekida usluge

**Samo-organizacija**
- Novi moduli se auto-integrišu
- Pokvareni moduli se auto-isključuju
- Mreža se samo-leči`,
    diagram: `mindmap
  root((ROJ<br/>Emergent))
    Load Following
      Automatic
      Sub-second
    Thermal Migration
      Heat flows
      No hot spots
    Fault Absorption
      Seamless
      Auto-redistribute
    Self Organization
      Auto-integrate
      Self-heal`,
  },
  {
    id: 'battery-roj',
    title: 'Battery ROJ',
    titleSr: 'Baterijski ROJ',
    icon: Battery,
    color: 'emerald',
    content: `### Fleet Battery Coordination

ROJ extends to battery modules for fleet-wide optimization.

**Benefits:**
| Behavior | Mechanism | Benefit |
|----------|-----------|---------|
| SOC Equalization | Cross-battery sharing | Uniform wear |
| Thermal Shifting | Hot batteries rest | Extended life |
| Health Selection | Degraded avoid deep cycles | Protected investment |
| Predictive Position | Pre-staged for routes | Faster swaps |
| V2G Participation | Fleet as VPP | Revenue generation |

**V2G Virtual Power Plant:**
- 50 battery fleet = 625 kWh storage
- Frequency regulation revenue: €137k/year potential
- Grid stabilization during peak demand`,
    contentSr: `### Koordinacija baterija flote

ROJ se proširuje na baterijske module za optimizaciju cele flote.

**Prednosti:**
| Ponašanje | Mehanizam | Korist |
|-----------|-----------|--------|
| SOC izjednačenje | Deljenje između baterija | Ravnomerno trošenje |
| Termalno pomeranje | Vruće baterije odmara | Produžen životni vek |
| Izbor po zdravlju | Degradirane izbegavaju duboke cikluse | Zaštićena investicija |
| Prediktivno pozicioniranje | Unapred postavljene za rute | Brže zamene |
| V2G učešće | Flota kao VPP | Generisanje prihoda |

**V2G Virtuelna elektrana:**
- Flota od 50 baterija = 625 kWh skladištenje
- Prihod od regulacije frekvencije: €137k/godišnje potencijal
- Stabilizacija mreže tokom vršnog opterećenja`,
    diagram: `flowchart LR
    subgraph Grid["Elektromreža"]
        G[Grid<br/>Operator]
    end

    subgraph VPP["Virtuelna Elektrana"]
        AGG[ROJ<br/>Agregator]
    end

    subgraph Batteries["Baterijska Flota"]
        B1[Baterija 1<br/>Pražnjenje]
        B2[Baterija 2<br/>Punjenje]
        B3[Baterija 3<br/>Idle]
    end

    G <-->|"Frekvencija"| AGG
    AGG <--> B1
    AGG <--> B2
    AGG <--> B3`,
  },
  {
    id: 'swarm-core',
    title: 'SWARM CORE',
    titleSr: 'SWARM CORE',
    icon: Hexagon,
    color: 'violet',
    content: `### Unified Coordination Core

**SWARM CORE** is the formal specification of ROJ coordination for the entire JEZGRO product family.

All devices (EK3, BAT, ROB, GW, RACK) use the same **ROJ_COORD** service.

**Service Components:**
| Component | Purpose |
|-----------|---------|
| **Policy Engine** | Stores parameters, selects behavior mode (explore/exploit) |
| **Quorum Engine** | Drives decisions with cross-inhibition |
| **Stigmergy Store** | Local tag map with TTL and exponential decay |
| **Task Allocator** | Task and resource distribution |
| **Health/Trust** | Anomaly detection and agent isolation |

**Default Policy Profile:**
| Parameter | Value |
|-----------|-------|
| k_neighbors | 6-7 |
| quorum_min | 3 |
| quorum_ratio | 60% |
| heartbeat_period | 1000 ms |
| tag_ttl | 5000 ms |
| decay_half_life | 2000 ms |`,
    contentSr: `### Jedinstveno Koordinaciono Jezgro

**SWARM CORE** je formalna specifikacija ROJ koordinacije za celu JEZGRO porodicu proizvoda.

Svi uređaji (EK3, BAT, ROB, GW, RACK) koriste isti **ROJ_COORD** servis.

**Komponente Servisa:**
| Komponenta | Svrha |
|------------|-------|
| **Policy Engine** | Čuva parametre, bira režim ponašanja (istraživanje/eksploatacija) |
| **Quorum Engine** | Pokreće odluke sa unakrsnom inhibicijom |
| **Stigmergy Store** | Lokalna mapa tagova sa TTL i eksponencijalnim opadanjem |
| **Task Allocator** | Distribucija zadataka i resursa |
| **Health/Trust** | Detekcija anomalija i izolacija agenata |

**Podrazumevani Profil Politike:**
| Parametar | Vrednost |
|-----------|----------|
| k_neighbors | 6-7 |
| quorum_min | 3 |
| quorum_ratio | 60% |
| heartbeat_period | 1000 ms |
| tag_ttl | 5000 ms |
| decay_half_life | 2000 ms |`,
    diagram: `flowchart TB
    subgraph SWARM["SWARM CORE Library"]
        PE[Policy<br/>Engine]
        QE[Quorum<br/>Engine]
        SS[Stigmergy<br/>Store]
        TA[Task<br/>Allocator]
        HT[Health<br/>Trust]
    end

    subgraph ROJ["ROJ_COORD Service"]
        IPC[IPC Adapter]
        CAN[CAN-FD Adapter]
    end

    subgraph DEVICES["JEZGRO Devices"]
        EK3[EK3<br/>Charger]
        BAT[BAT<br/>Battery]
        ROB[ROB<br/>Robot]
        GW[GW<br/>Gateway]
    end

    SWARM --> ROJ
    ROJ --> EK3
    ROJ --> BAT
    ROJ --> ROB
    ROJ --> GW`,
  },
  {
    id: 'swarm-protocol',
    title: 'SWARM Protocol',
    titleSr: 'SWARM Protokol',
    icon: Network,
    color: 'teal',
    content: `### CAN-FD Message Types

SWARM CORE defines **6 message types** for swarm coordination:

| Type | ID Range | Frequency | Purpose |
|------|----------|-----------|---------|
| \`ROJ_HEARTBEAT\` | 0x510 + node | 1-2 Hz | Presence + basic metrics |
| \`ROJ_STATE\` | 0x520 + node | 0.5 Hz | Extended state snapshot |
| \`ROJ_TASK_CLAIM\` | 0x540 | On-demand | Task/resource requests |
| \`ROJ_VOTE\` | 0x550 | On-demand | Quorum voting |
| \`ROJ_TAG\` | 0x560 | 1-5 Hz | Stigmergy tags |
| \`ROJ_ALERT\` | 0x5FF | Event | Critical notifications |

**Quorum Decision Logic:**
\`\`\`
Q = max(quorum_min, quorum_ratio × active_nodes)

if votes_yes >= Q and votes_yes > votes_no:
    decision = ACCEPT
elif timeout and votes_yes < Q:
    decision = REJECT
\`\`\`

**Stigmergy (Tag + Decay):**
\`\`\`
tag.value(t+dt) = tag.value(t) × exp(-dt / tau)
\`\`\`
Tags decay exponentially. TTL expiry removes the tag.`,
    contentSr: `### CAN-FD Tipovi Poruka

SWARM CORE definiše **6 tipova poruka** za koordinaciju roja:

| Tip | ID Opseg | Frekvencija | Svrha |
|-----|----------|-------------|-------|
| \`ROJ_HEARTBEAT\` | 0x510 + node | 1-2 Hz | Prisutnost + osnovne metrike |
| \`ROJ_STATE\` | 0x520 + node | 0.5 Hz | Prošireni snimak stanja |
| \`ROJ_TASK_CLAIM\` | 0x540 | Po potrebi | Zahtevi za zadatke/resurse |
| \`ROJ_VOTE\` | 0x550 | Po potrebi | Kvorum glasanje |
| \`ROJ_TAG\` | 0x560 | 1-5 Hz | Stigmergy tagovi |
| \`ROJ_ALERT\` | 0x5FF | Događaj | Kritične notifikacije |

**Logika Kvorum Odluke:**
\`\`\`
Q = max(quorum_min, quorum_ratio × active_nodes)

if votes_yes >= Q and votes_yes > votes_no:
    decision = ACCEPT
elif timeout and votes_yes < Q:
    decision = REJECT
\`\`\`

**Stigmergija (Tag + Opadanje):**
\`\`\`
tag.value(t+dt) = tag.value(t) × exp(-dt / tau)
\`\`\`
Tagovi eksponencijalno opadaju. Istek TTL-a uklanja tag.`,
    diagram: `sequenceDiagram
    participant N1 as Node 1
    participant N2 as Node 2
    participant N3 as Node 3

    Note over N1,N3: Periodic Health
    N1->>N2: ROJ_HEARTBEAT
    N1->>N3: ROJ_HEARTBEAT
    N2-->>N1: ROJ_STATE
    N3-->>N1: ROJ_STATE

    Note over N1,N3: Quorum Decision
    N1->>N2: ROJ_VOTE (task_123, YES)
    N1->>N3: ROJ_VOTE (task_123, YES)
    N2-->>N1: ROJ_VOTE (task_123, YES)
    N3-->>N1: ROJ_VOTE (task_123, YES)

    Note over N1: Q=3 reached!
    N1->>N2: ROJ_TAG (TASK_ASSIGNED)
    N1->>N3: ROJ_TAG (TASK_ASSIGNED)`,
  },
];

// Mermaid diagram component
function MermaidDiagram({ chart, id }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState('');

  useEffect(() => {
    const renderDiagram = async () => {
      if (chart && containerRef.current) {
        try {
          const { svg } = await mermaid.render(`mermaid-${id}`, chart);
          setSvg(svg);
        } catch (error) {
          console.error('Mermaid render error:', error);
          setSvg(`<pre class="text-red-400">${error.message}</pre>`);
        }
      }
    };
    renderDiagram();
  }, [chart, id]);

  return (
    <div
      ref={containerRef}
      className="bg-slate-800 rounded-lg p-4 overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// Section component
function RojSection({ section, isExpanded, onToggle, language }) {
  const Icon = section.icon;
  const colorClasses = {
    blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
    cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
    green: 'bg-green-500/20 border-green-500/30 text-green-400',
    orange: 'bg-orange-500/20 border-orange-500/30 text-orange-400',
    red: 'bg-red-500/20 border-red-500/30 text-red-400',
    indigo: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
    pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
    emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    violet: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
    teal: 'bg-teal-500/20 border-teal-500/30 text-teal-400',
  };

  const title = language === 'sr' ? section.titleSr : section.title;
  const content = language === 'sr' ? section.contentSr : section.content;

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-800/50">
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
          {/* Content */}
          <div className="prose prose-sm prose-invert max-w-none mb-6">
            <pre className="whitespace-pre-wrap text-sm font-sans text-slate-300 bg-transparent p-0">
              {content}
            </pre>
          </div>

          {/* Mermaid Diagram */}
          {section.diagram && (
            <MermaidDiagram chart={section.diagram} id={section.id} />
          )}
        </div>
      )}
    </div>
  );
}

// Main content component
function RojContent() {
  const { i18n } = useTranslation();
  const [expandedSections, setExpandedSections] = useState(['intro']);
  const [language, setLanguage] = useState(i18n.language === 'sr' ? 'sr' : 'en');

  const toggleSection = (id) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const expandAll = () => setExpandedSections(ROJ_SECTIONS.map(s => s.id));
  const collapseAll = () => setExpandedSections([]);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-slate-400 hover:text-slate-200">
                <Home className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">ROJ INTELLIGENCE</h1>
                <p className="text-sm text-slate-400">Distributed Swarm Coordination</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('sr')}
                  className={`px-3 py-1 text-xs font-medium rounded ${
                    language === 'sr' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SR
                </button>
              </div>
              {/* Confidential Badge */}
              <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">CONFIDENTIAL</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-blue-400">5 Mbps</div>
            <div className="text-xs text-slate-400">CAN-FD Speed</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-green-400">&lt;100ms</div>
            <div className="text-xs text-slate-400">Fault Recovery</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-purple-400">20</div>
            <div className="text-xs text-slate-400">Modules/Cluster</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-amber-400">N+1</div>
            <div className="text-xs text-slate-400">Redundancy</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={expandAll}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded bg-slate-800 border border-slate-700"
          >
            {language === 'sr' ? 'Proširi sve' : 'Expand All'}
          </button>
          <button
            onClick={collapseAll}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded bg-slate-800 border border-slate-700"
          >
            {language === 'sr' ? 'Skupi sve' : 'Collapse All'}
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {ROJ_SECTIONS.map(section => (
            <RojSection
              key={section.id}
              section={section}
              isExpanded={expandedSections.includes(section.id)}
              onToggle={() => toggleSection(section.id)}
              language={language}
            />
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-500 text-center">
            {language === 'sr'
              ? 'ROJ: Distribuirana inteligencija za modularne EV punjače. Dokumentacija verzija 1.0.'
              : 'ROJ: Distributed intelligence for modular EV chargers. Documentation version 1.0.'
            }
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 py-4">
        <p className="text-xs text-slate-500 text-center">
          CONFIDENTIAL - ELEKTROKOMBINACIJA © 2026
        </p>
      </footer>
    </div>
  );
}

// Main export with password gate
export default function RojIntelligencePage() {
  return (
    <PasswordGate
      password="kosnica"
      storageKey="ek_roj_unlocked"
      title="ROJ Intelligence"
    >
      <RojContent />
    </PasswordGate>
  );
}
