import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Home,
  ChevronDown,
  ChevronRight,
  Mail,
  Linkedin,
  Github,
  AlertTriangle,
  Zap,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Lightbulb,
  BarChart3,
  Rocket,
  Shield,
  Globe,
} from 'lucide-react';
import PasswordGate from '../components/PasswordGate';

// Pitch deck sections
const PITCH_SECTIONS = [
  {
    id: 'problem',
    title: 'The Problem',
    icon: AlertTriangle,
    color: 'red',
    content: {
      headline: 'EV Charging Infrastructure is Broken',
      points: [
        {
          stat: '84%',
          label: 'First-time success rate (J.D. Power 2025)',
          detail: 'Down from 96% in 2022',
        },
        {
          stat: '3-14 days',
          label: 'Average repair time',
          detail: 'Each failure = lost revenue + angry customers',
        },
        {
          stat: '€200-500',
          label: 'Cost per truck roll',
          detail: 'Specialized technician required for every repair',
        },
        {
          stat: '33%',
          label: 'Capacity loss per module failure',
          detail: 'Current modular systems use 10-50 kW modules',
        },
      ],
      quote: '"The industry optimized for initial cost, not lifetime reliability."',
    },
  },
  {
    id: 'solution',
    title: 'Our Solution',
    icon: Lightbulb,
    color: 'green',
    content: {
      headline: 'EK3: The Building Block of EV Charging',
      points: [
        {
          title: 'Granular Modularity',
          description: '3.3 kW modules vs industry standard 10-50 kW. Same module from e-bike to MCS.',
        },
        {
          title: 'Robotic Maintenance',
          description: '60-second swap by robot. No technician. No truck roll. No downtime.',
        },
        {
          title: 'Predictive AI',
          description: 'Predict failures 2 weeks ahead. Schedule swaps during regular depot visits.',
        },
        {
          title: 'Graceful Degradation',
          description: '0.1% capacity loss per module failure vs 33% for competitors.',
        },
      ],
    },
  },
  {
    id: 'technology',
    title: 'Technology',
    icon: Zap,
    color: 'blue',
    content: {
      headline: 'Silicon Carbide Power Electronics + AI',
      specs: [
        { label: 'Module Power', value: '3.3 kW' },
        { label: 'Efficiency', value: '>97%' },
        { label: 'Weight', value: '3.5 kg' },
        { label: 'Swap Time', value: '<60 sec' },
        { label: 'Topology', value: 'LLC SiC' },
        { label: 'Communication', value: 'CAN-FD' },
      ],
      innovations: [
        '5 invention disclosures filed (2026-01-02)',
        'Wolfspeed SiC MOSFETs for efficiency',
        'STM32G4 for real-time control',
        'Dual-robot coordination protocol',
      ],
    },
  },
  {
    id: 'market',
    title: 'Market',
    icon: Globe,
    color: 'purple',
    content: {
      headline: 'EV Charging Infrastructure Market',
      stats: [
        { value: '$56B', label: '2030 market size (McKinsey)' },
        { value: '30%', label: 'CAGR 2024-2030' },
        { value: '14M', label: 'Public chargers needed by 2030 (EU)' },
      ],
      segments: [
        { name: 'Fleet/Depot Charging', size: '35%', fit: 'Primary target' },
        { name: 'Highway Fast Charging', size: '25%', fit: 'Strong fit' },
        { name: 'Retail/Destination', size: '40%', fit: 'Secondary' },
      ],
    },
  },
  {
    id: 'business',
    title: 'Business Model',
    icon: DollarSign,
    color: 'emerald',
    content: {
      headline: 'Hardware + Service + Software',
      streams: [
        {
          name: 'Hardware Sales',
          description: 'EK3 modules and rack systems',
          margin: '40%',
        },
        {
          name: 'RaaS (Robots-as-a-Service)',
          description: 'Monthly fee for robotic maintenance',
          margin: '70%',
        },
        {
          name: 'Fleet Software',
          description: 'AI-powered fleet charging optimization',
          margin: '85%',
        },
      ],
      pricing: 'Module: €150 | Rack (50 modules): €10,000 | RaaS: €500/month/station',
    },
  },
  {
    id: 'competition',
    title: 'Competition',
    icon: Target,
    color: 'orange',
    content: {
      headline: 'Competitive Landscape',
      competitors: [
        { name: 'ABB Terra', weakness: 'Heavy modules (25 kW), no robotic swap' },
        { name: 'Siemens Sicharge', weakness: 'Monolithic design, long downtime' },
        { name: 'ChargePoint', weakness: 'Network focus, third-party hardware' },
        { name: 'Tesla Supercharger', weakness: 'Proprietary ecosystem' },
      ],
      advantages: [
        '10x more granular than competitors',
        'Only solution with robotic maintenance',
        '99.9% uptime vs 95% industry average',
        'Same module for all power levels',
      ],
    },
  },
  {
    id: 'traction',
    title: 'Traction',
    icon: TrendingUp,
    color: 'cyan',
    content: {
      headline: 'Current Status',
      milestones: [
        { date: '2026 Q1', item: '5 invention disclosures filed', status: 'done' },
        { date: '2026 Q1', item: 'EK3 detailed design complete', status: 'done' },
        { date: '2026 Q2', item: 'Prototype development', status: 'planned' },
        { date: '2026 Q3', item: 'First customer pilot', status: 'planned' },
        { date: '2027', item: 'Series production', status: 'planned' },
      ],
      validation: [
        'Design validated through simulation',
        'Component selection finalized',
        'Manufacturing partners identified',
      ],
    },
  },
  {
    id: 'team',
    title: 'Team',
    icon: Users,
    color: 'indigo',
    content: {
      headline: 'Founder-Led Technical Team',
      founder: {
        name: 'Bojan Janjatovic',
        role: 'Founder & CTO',
        background: 'Electrical engineering + software development background. Experience in power electronics, embedded systems, and AI/ML applications.',
      },
      hiring: ['Power Electronics Engineer', 'Embedded Systems Developer', 'Robotics Engineer'],
    },
  },
  {
    id: 'ask',
    title: 'The Ask',
    icon: Rocket,
    color: 'pink',
    content: {
      headline: 'Seed Round: €500K',
      use: [
        { item: 'Prototype Development', amount: '€200K', percent: 40 },
        { item: 'Patent Filing (PCT)', amount: '€100K', percent: 20 },
        { item: 'Team Expansion', amount: '€150K', percent: 30 },
        { item: 'Operations', amount: '€50K', percent: 10 },
      ],
      timeline: '18 months to first customer pilot',
      target: 'Series A ready by 2027 Q2',
    },
  },
];

// Section component
function PitchSection({ section, isExpanded, onToggle }) {
  const Icon = section.icon;
  const colorClasses = {
    red: 'bg-red-50 border-red-200 text-red-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-600',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
    pink: 'bg-pink-50 border-pink-200 text-pink-600',
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorClasses[section.color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-900">{section.title}</h3>
            <p className="text-sm text-slate-500">{section.content.headline}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-100">
          {/* Problem section */}
          {section.id === 'problem' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {section.content.points.map((point, i) => (
                  <div key={i} className="bg-red-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600">{point.stat}</div>
                    <div className="text-sm font-medium text-slate-700">{point.label}</div>
                    <div className="text-xs text-slate-500 mt-1">{point.detail}</div>
                  </div>
                ))}
              </div>
              <p className="text-slate-600 italic text-center">{section.content.quote}</p>
            </div>
          )}

          {/* Solution section */}
          {section.id === 'solution' && (
            <div className="grid grid-cols-2 gap-4">
              {section.content.points.map((point, i) => (
                <div key={i} className="bg-green-50 rounded-lg p-4">
                  <div className="font-semibold text-green-700">{point.title}</div>
                  <div className="text-sm text-slate-600 mt-1">{point.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* Technology section */}
          {section.id === 'technology' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {section.content.specs.map((spec, i) => (
                  <div key={i} className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-blue-600">{spec.value}</div>
                    <div className="text-xs text-slate-500">{spec.label}</div>
                  </div>
                ))}
              </div>
              <ul className="space-y-1">
                {section.content.innovations.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <Shield className="w-4 h-4 text-blue-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Market section */}
          {section.id === 'market' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {section.content.stats.map((stat, i) => (
                  <div key={i} className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{stat.value}</div>
                    <div className="text-xs text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {section.content.segments.map((seg, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                    <span className="font-medium text-slate-700">{seg.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">{seg.size}</span>
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">{seg.fit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Business model section */}
          {section.id === 'business' && (
            <div className="space-y-4">
              {section.content.streams.map((stream, i) => (
                <div key={i} className="bg-emerald-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-emerald-700">{stream.name}</div>
                    <span className="text-sm font-bold text-emerald-600">{stream.margin} margin</span>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">{stream.description}</div>
                </div>
              ))}
              <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3">
                <strong>Pricing:</strong> {section.content.pricing}
              </p>
            </div>
          )}

          {/* Competition section */}
          {section.id === 'competition' && (
            <div className="space-y-4">
              <div className="space-y-2">
                {section.content.competitors.map((comp, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                    <span className="font-medium text-slate-700">{comp.name}</span>
                    <span className="text-sm text-orange-600">{comp.weakness}</span>
                  </div>
                ))}
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="font-semibold text-green-700 mb-2">Our Advantages</div>
                <ul className="space-y-1">
                  {section.content.advantages.map((adv, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {adv}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Traction section */}
          {section.id === 'traction' && (
            <div className="space-y-4">
              <div className="space-y-2">
                {section.content.milestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-4 bg-slate-50 rounded-lg p-3">
                    <span className="text-sm font-medium text-slate-500 w-20">{m.date}</span>
                    <span className="flex-1 text-slate-700">{m.item}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      m.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team section */}
          {section.id === 'team' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="font-semibold text-indigo-700">{section.content.founder.name}</div>
                <div className="text-sm text-indigo-600">{section.content.founder.role}</div>
                <div className="text-sm text-slate-600 mt-2">{section.content.founder.background}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500 mb-2">Hiring:</div>
                <div className="flex flex-wrap gap-2">
                  {section.content.hiring.map((role, i) => (
                    <span key={i} className="text-sm px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ask section */}
          {section.id === 'ask' && (
            <div className="space-y-4">
              <div className="text-center bg-pink-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-pink-600">€500K</div>
                <div className="text-sm text-slate-500">Seed Round</div>
              </div>
              <div className="space-y-2">
                {section.content.use.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-pink-500 h-2 rounded-full"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-600 w-40">{item.item}</span>
                    <span className="text-sm font-medium text-slate-700 w-16">{item.amount}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-slate-500 bg-slate-50 rounded-lg p-3">
                <span><strong>Timeline:</strong> {section.content.timeline}</span>
                <span><strong>Target:</strong> {section.content.target}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main page content
function PitchContent() {
  const [expandedSections, setExpandedSections] = useState(['problem']);

  const toggleSection = (id) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-slate-400 hover:text-slate-600">
                <Home className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">ELEKTROKOMBINACIJA</h1>
                <p className="text-sm text-slate-500">Investor Presentation</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Confidential</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Modular EV Charging Infrastructure</h2>
          <p className="text-xl text-slate-300 mb-6">From 3kW to 3MW with one module. Robotic maintenance. Zero downtime.</p>
          <div className="flex gap-6">
            <div>
              <div className="text-3xl font-bold text-cyan-400">99.9%</div>
              <div className="text-sm text-slate-400">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">60s</div>
              <div className="text-sm text-slate-400">Module Swap</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">3.3kW</div>
              <div className="text-sm text-slate-400">Per Module</div>
            </div>
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Founder profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Bojan Janjatovic</h3>
                <p className="text-slate-500">Founder & CTO</p>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Background</h4>
                  <p className="text-slate-600">
                    Electrical engineering + software development. Experience in power electronics,
                    embedded systems, and AI/ML applications.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-2">Focus Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">Power Electronics</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">Embedded Systems</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">AI/ML</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">EV Infrastructure</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <h4 className="font-semibold text-slate-700 mb-2">Contact</h4>
                  <div className="space-y-2">
                    <a href="mailto:bojan@elektrokombinacija.com" className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
                      <Mail className="w-4 h-4" />
                      <span>bojan@elektrokombinacija.com</span>
                    </a>
                    <a href="https://linkedin.com" className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pitch deck */}
          <div className="lg:col-span-2 space-y-4">
            {PITCH_SECTIONS.map(section => (
              <PitchSection
                key={section.id}
                section={section}
                isExpanded={expandedSections.includes(section.id)}
                onToggle={() => toggleSection(section.id)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <p className="text-xs text-slate-400 text-center">
            CONFIDENTIAL - This presentation is intended for authorized recipients only.
            &copy; 2026 Elektrokombinacija. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function PitchPage() {
  return (
    <PasswordGate
      password="kassad"
      storageKey="ek_pitch_unlocked"
      title="Investor Presentation"
    >
      <PitchContent />
    </PasswordGate>
  );
}
