import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  ChevronDown,
  ChevronRight,
  FileText,
  Shield,
  Target,
  Briefcase,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Lightbulb,
  Globe,
} from 'lucide-react';
import PasswordGate from '../components/PasswordGate';

// Strategy document sections
const STRATEGY_DOCS = [
  {
    id: 'patent-family',
    title: 'Patent Family Structure',
    icon: Shield,
    color: 'purple',
    content: `
## 3-Patent Family Strategy

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                    ELEKTROKOMBINACIJA                           │
│                    Patent Family                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐                                           │
│  │   PATENT A      │ ◄─── UMBRELLA PATENT                      │
│  │   (Priority)    │      Modular Power Architecture           │
│  │   EK-001/002/003│      + Robotic Swap + Distributed Sparing │
│  └────────┬────────┘                                           │
│           │                                                     │
│           │ cross-reference                                     │
│           │                                                     │
│  ┌────────┴────────┐       ┌─────────────────┐                │
│  │   PATENT B      │       │   PATENT C      │                │
│  │   (Standalone)  │       │   (Standalone)  │                │
│  │   EK-005        │       │   EK-004        │                │
│  │   Dual-Robot    │       │   Fleet         │                │
│  │   System        │       │   Logistics     │                │
│  └─────────────────┘       └─────────────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

### Patent A: Modular Power Architecture (Umbrella)
**"Modular Power Conversion System with Distributed Sparing and Robotic Module Replacement"**
- EK-2026-001: Unified Modular Power Architecture
- EK-2026-002: Dual-Purpose Robotic Swap Station
- EK-2026-003: Distributed Power Sparing System

### Patent B: Dual-Robot System (Standalone)
**"Coordinated Vehicle-Mounted and Station-Based Robotic Systems"**
- EK-2026-005: Coordinated Dual-Robot Maintenance

### Patent C: Fleet Logistics (Standalone)
**"Fleet-Integrated Module Logistics and Transport Network"**
- EK-2026-004: Fleet-Integrated Module Logistics
    `
  },
  {
    id: 'priority-proof',
    title: 'Priority Protection',
    icon: Calendar,
    color: 'blue',
    content: `
## Priority Date: 2026-01-02

### Triple Protection Strategy

| Method | Status | Cost | Validity |
|--------|--------|------|----------|
| Git Commit | ✅ DONE | Free | Cryptographic proof |
| WIPO PROOF | ⏳ Pending | €20 | UN timestamp, global |
| Email Backup | ✅ DONE | Free | Third-party timestamp |

### Git Evidence
\`\`\`
commit: 2026-01-02
hash: [verified]
5 invention disclosures included
\`\`\`

### WIPO PROOF Next Steps
1. Compile Master PDF (all disclosures)
2. Upload to wipoproof.wipo.int
3. Receive token (~24h)
4. Store token securely

### Why This Works
- Establishes PRIORITY without full patent filing
- Costs €20 vs €15,000 for PCT
- Can file provisional within 12 months
- Defensible in court if needed
    `
  },
  {
    id: 'filing-timeline',
    title: 'Filing Timeline',
    icon: Clock,
    color: 'amber',
    content: `
## Patent Filing Schedule

### Phase 1: Priority Protection (NOW)
- [x] Invention disclosures (5)
- [x] Git timestamp
- [ ] WIPO PROOF upload
- [ ] Email backup

### Phase 2: Provisional Filing (Q2 2026)
**If funding secured:**
- US Provisional: $320 (micro entity)
- UK Priority: £60
- Total: ~€400

### Phase 3: PCT Application (Q1 2027)
**Within 12 months of priority:**
- PCT International: ~€4,000
- National phase (30 months): varies by country
- Budget: €15,000-25,000

### Phase 4: National Phase (2028)
Priority countries:
1. EU (EPO)
2. USA
3. China
4. South Korea
5. Japan

### DIY vs Attorney
| Task | DIY | Attorney |
|------|-----|----------|
| Priority protection | ✅ | Overkill |
| Provisional | ✅ With template | Optional |
| PCT filing | ⚠️ Risky | Recommended |
| National phase | ❌ | Required |
    `
  },
  {
    id: 'market-strategy',
    title: '8 Development Paths',
    icon: Target,
    color: 'green',
    content: `
## Strategic Options

### 1. Fast Follower (Low Risk)
ODM partnership, local software/service
- Investment: €200-400k
- Time: 4-6 months
- Margin: 15-25%

### 2. Modular Pioneer (Our Path)
Full EK3 development
- Investment: €500k-1M
- Time: 12-18 months
- Margin: 40%+

### 3. Battery Swap Focus
Partner with battery swap operators
- Investment: €300-500k
- Time: 6-9 months

### 4. Grid Services Play
V2G/frequency regulation focus
- Investment: €400-600k
- Recurring revenue

### 5. Fleet Software Pure
Software-only, hardware agnostic
- Investment: €100-200k
- SaaS model

### 6. Local Manufacturing
Serbian production for EXPO 2027
- Investment: €1-2M
- EBRD/EU funding eligible

### 7. Niche Leader
MCS (3MW) megawatt charging
- Investment: €2-5M
- First mover advantage

### 8. Full Stack
Hardware + Software + Service
- Investment: €3-5M
- Highest margin potential
    `
  },
  {
    id: 'expo-2027',
    title: 'EXPO 2027 Opportunity',
    icon: Globe,
    color: 'cyan',
    content: `
## Belgrade EXPO 2027

### The Opportunity
- 100 electric buses for Belgrade
- Deadline: May 2027
- Charging infrastructure needed

### Requirements
| Item | Specification |
|------|---------------|
| Fleet size | 100 e-buses |
| Depot charging | 2-20 MW |
| Opportunity charging | 300-600 kW |
| Grid upgrade | 12-24 month lead time |

### Our Positioning
1. **Modular approach** solves grid constraints
2. **Robotic maintenance** reduces TCO
3. **Local presence** matches funding requirements
4. **AI optimization** for depot scheduling

### Competition
| Player | Weakness |
|--------|----------|
| ABB | Expensive, no local presence |
| Siemens | Long lead times |
| Chinese ODM | No local support |

### Action Items
- [ ] Contact Belgrade transit authority
- [ ] Prepare technical proposal
- [ ] Identify local partners
- [ ] Apply for EBRD funding
    `
  },
  {
    id: 'funding',
    title: 'Funding Strategy',
    icon: DollarSign,
    color: 'emerald',
    content: `
## Funding Roadmap

### Seed Round: €500K
**Use of funds:**
| Category | Amount | % |
|----------|--------|---|
| Prototype | €200K | 40% |
| Patents (PCT) | €100K | 20% |
| Team | €150K | 30% |
| Operations | €50K | 10% |

**Timeline:** 18 months

### Sources
1. **Angel investors** - EV/cleantech focus
2. **EBRD** - Western Balkans programs
3. **EU Horizon** - EIC Accelerator
4. **Serbian Innovation Fund** - Matching grants
5. **Climate VC** - Breakthrough Energy, etc.

### Series A: €2-3M (2027)
- First customer deployments
- Production scale-up
- Market expansion

### Valuation Benchmarks
| Stage | Valuation | Dilution |
|-------|-----------|----------|
| Seed | €2-3M | 15-25% |
| Series A | €10-15M | 20-25% |

### Key Metrics for Investors
- Patent portfolio (priority established)
- Prototype performance
- First customer LOI
- Team completeness
    `
  },
  {
    id: 'competitive',
    title: 'Competitive Analysis',
    icon: Users,
    color: 'red',
    content: `
## Competitive Landscape

### Direct Competitors
| Company | Module Size | Robotic Swap | AI |
|---------|-------------|--------------|-----|
| ABB Terra | 25 kW | No | Basic |
| Siemens Sicharge | 50 kW | No | No |
| Kempower | 50 kW | No | Yes |
| **EK3** | **3.3 kW** | **Yes** | **Yes** |

### Our Differentiation
1. **10x more granular** than competitors
2. **Only robotic maintenance** solution
3. **Graceful degradation** (0.1% vs 33% loss)
4. **Same module** for all power levels

### Barrier Analysis
| Barrier | Height | Our Status |
|---------|--------|------------|
| Patents | High | Priority established |
| Technology | Medium | Design complete |
| Manufacturing | Medium | Partners identified |
| Customers | Medium | EXPO opportunity |
| Capital | High | Seed round needed |

### Acquisition Interest
Potential acquirers:
- ABB (filling robotic gap)
- Siemens (modular tech)
- ChargePoint (differentiation)
- BYD (vertical integration)

**Exit timeline:** 5-7 years
**Target valuation:** €50-100M
    `
  },
  {
    id: 'risks',
    title: 'Risk Register',
    icon: AlertTriangle,
    color: 'orange',
    content: `
## Risk Assessment

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| SiC supply chain | Medium | High | Multiple suppliers |
| Thermal issues | Low | High | Conservative design |
| Robot reliability | Medium | Medium | Redundant systems |
| AI accuracy | Low | Medium | Human-in-loop |

### Market Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Slow EV adoption | Low | High | Multiple segments |
| Competitor response | High | Medium | Patent protection |
| Price pressure | High | Medium | RaaS model |
| Regulation change | Medium | Medium | Standards compliance |

### Execution Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Funding gap | Medium | Critical | Multiple sources |
| Key person | High | High | Documentation |
| Timeline slip | Medium | Medium | Buffer time |
| Certification delay | Medium | Medium | Early start |

### Catastrophic Scenarios
1. **Patent rejected** → Prior art defense, trade secrets
2. **Major competitor enters** → Niche focus, acquisition
3. **Funding fails** → Pivot to consulting/licensing
4. **Technical failure** → Insurance, reserves
    `
  }
];

function StrategySection({ doc, isExpanded, onToggle }) {
  const Icon = doc.icon;
  const colorClasses = {
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-600',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorClasses[doc.color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900">{doc.title}</h3>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-100">
          <div className="prose prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-strong:text-slate-700 prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100">
            <pre className="whitespace-pre-wrap text-sm font-mono text-slate-700 bg-slate-50 p-4 rounded-lg overflow-x-auto">
              {doc.content.trim()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function StrategyContent() {
  const [expandedSections, setExpandedSections] = useState(['patent-family']);

  const toggleSection = (id) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const expandAll = () => setExpandedSections(STRATEGY_DOCS.map(d => d.id));
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
                <h1 className="text-xl font-bold text-white">STRATEGY HQ</h1>
                <p className="text-sm text-slate-400">Private - Samo za tebe</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/30">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">TOP SECRET</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-purple-400">5</div>
            <div className="text-xs text-slate-400">Invention Disclosures</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-blue-400">3</div>
            <div className="text-xs text-slate-400">Patent Family</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-green-400">€500K</div>
            <div className="text-xs text-slate-400">Seed Target</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-2xl font-bold text-amber-400">2027</div>
            <div className="text-xs text-slate-400">EXPO Target</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-end gap-2 mb-4">
          <button
            onClick={expandAll}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded bg-slate-800"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded bg-slate-800"
          >
            Collapse All
          </button>
        </div>

        {/* Strategy Sections */}
        <div className="space-y-4">
          {STRATEGY_DOCS.map(doc => (
            <StrategySection
              key={doc.id}
              doc={doc}
              isExpanded={expandedSections.includes(doc.id)}
              onToggle={() => toggleSection(doc.id)}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/patent-portfolio"
              className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <FileText className="w-5 h-5 text-purple-400" />
              <div>
                <div className="font-medium text-white">Patent Portfolio</div>
                <div className="text-xs text-slate-400">Full IP documentation</div>
              </div>
            </Link>
            <Link
              to="/pitch"
              className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <Briefcase className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="font-medium text-white">Investor Pitch</div>
                <div className="text-xs text-slate-400">Presentation deck</div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <p className="text-xs text-slate-500 text-center">
            PRIVATE - This page is for internal use only. Password: silenus
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function StrategyPage() {
  return (
    <PasswordGate
      password="silenus"
      storageKey="ek_strategy_unlocked"
      title="Strategy HQ"
    >
      <StrategyContent />
    </PasswordGate>
  );
}
