import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Shield,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

// Patent disclosure documents - Updated with latest specs from documentation
const patents = [
  {
    id: 'EK-2026-001',
    title: 'Unified Modular Power Architecture (EK3)',
    description: 'EK3 blade module: 3.3kW DC/DC converter with 900V SiC MOSFETs (Wolfspeed), LLC resonant topology, 200×320×44mm (1U half-width format), ~3.5kg, >96% efficiency. CAN-FD @ 5Mbps. Blind-mate connectors enable hot-swap in <1 second. Scalable from 3.3kW (single module) to 3MW (909 modules).',
    inventor: 'Bojan Janjatović',
    dateOfConception: '2026-01-02',
    priorityDate: '2026-01-02',
    status: 'disclosed',
    category: 'hardware',
    claims: [
      'Standardized blade-format power module (200×320×44mm, 1U half-width, 3.5kg)',
      'LLC resonant DC/DC topology with 900V SiC MOSFETs (Wolfspeed C3M0065090D)',
      'Blind-mate connector system with 20-pin data + sequenced power contacts',
      'Planar transformer design integrated in PCB for manufacturing repeatability',
      'Integrated current sensing (Infineon TLI4971) and thermal monitoring',
      'STM32G474 control MCU with CAN-FD @ 5 Mbps communication',
      'Film capacitors (no electrolytics) for 50,000+ hour lifespan',
      'Custom rack design optimized for thermal management and robotic swap',
    ],
  },
  {
    id: 'EK-2026-002',
    title: 'Dual-Purpose Robotic Swap Station',
    description: 'Charging station with Robot B (station-based, 30-50kg, 50-100kg payload) on linear rail. Performs battery swap and EK3 module replacement. Estimated cost €10,000-20,000 vs €30,000-100,000 for industrial robots.',
    inventor: 'Bojan Janjatović',
    dateOfConception: '2026-01-02',
    priorityDate: '2026-01-02',
    status: 'disclosed',
    category: 'robotics',
    claims: [
      'Station-mounted robot (Robot B) on linear rail system',
      'Purpose-built design vs general-purpose industrial robots',
      '60 second module swap time (vs 3-4 hours traditional repair)',
      'Fresh module/battery storage and defective bins',
      'Queue management for multiple vehicles',
      'Integration with AI failure prediction system',
    ],
  },
  {
    id: 'EK-2026-003',
    title: 'Distributed Power Sparing System',
    description: 'Power distribution inspired by 3PAR storage architecture. Wide striping spreads load across ALL modules. Distributed sparing eliminates dedicated hot-spare. 84 modules in custom rack = 277kW. Single module failure = 0.33% capacity loss (vs 10% in traditional systems).',
    inventor: 'Bojan Janjatović',
    dateOfConception: '2026-01-02',
    priorityDate: '2026-01-02',
    status: 'disclosed',
    category: 'software',
    claims: [
      'Wide striping algorithm spreading load across all N modules',
      'Distributed sparing - no dedicated hot-spare, all modules active',
      'Graceful degradation: 1/84 = 1.2% (not 10%) capacity loss per failure',
      'Automatic load rebalancing within milliseconds of failure detection',
      'Custom rack design for 84 modules (277kW @ 3.3kW per module)',
      'CAN-FD @ 5 Mbps for swarm coordination',
    ],
  },
  {
    id: 'EK-2026-004',
    title: 'Fleet-Integrated Maintenance Logistics',
    description: 'Zero truck rolls: failed modules travel to service center on regular bus routes. AI predicts failures 2 weeks ahead. Module tracking throughout repair lifecycle. Circular economy: refurbished modules return to service.',
    inventor: 'Bojan Janjatović',
    dateOfConception: '2026-01-02',
    priorityDate: '2026-01-02',
    status: 'disclosed',
    category: 'logistics',
    claims: [
      'Piggyback logistics using existing fleet routes for module transport',
      'Tiered failure detection: trend analysis (days/weeks), anomaly detection (hours), reactive (minutes)',
      'Module tracking with unique ID throughout repair lifecycle',
      'Circular economy workflow: field→service→refurbish→field',
      'Predictive maintenance scheduling based on fleet patterns',
      'Zero dedicated service truck rolls for routine maintenance',
    ],
  },
  {
    id: 'EK-2026-005',
    title: 'Coordinated Dual-Robot Maintenance System',
    description: 'Robot A (on bus, <15kg, 5-10kg payload, 48V) + Robot B (at station, 30-50kg, 50-100kg payload, 400V AC). Wireless coordination protocol. Self-healing infrastructure: 2 minute repair vs 3-4 hours. 100 buses = 100 mobile maintenance robots!',
    inventor: 'Bojan Janjatović',
    dateOfConception: '2026-01-02',
    priorityDate: '2026-01-02',
    status: 'disclosed',
    category: 'robotics',
    claims: [
      'Vehicle-mounted Robot A (<15kg, 0.5-1m reach, connector manipulation)',
      'Station-based Robot B (30-50kg, 1.5-2m reach, heavy-duty swap)',
      'Wireless coordination protocol with <10ms latency',
      'Spare parts storage on bus (fuses, connectors, small modules)',
      'Self-healing scenarios: Robot A diagnoses, Robot B repairs',
      'Fleet multiplier effect: N buses = N mobile maintenance robots',
      'Redundancy: Robot A can perform basic ops if Robot B fails',
      'Cost advantage: €15,000-25,000 for both vs €50,000+ industrial robot',
    ],
  },
];

const statusConfig = {
  disclosed: {
    label: 'Disclosed',
    color: 'text-accent-cyan',
    bgColor: 'bg-accent-cyan/20',
    icon: FileText,
  },
  filed: {
    label: 'Filed',
    color: 'text-accent-green',
    bgColor: 'bg-accent-green/20',
    icon: CheckCircle,
  },
  pending: {
    label: 'Pending',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
    icon: Clock,
  },
  granted: {
    label: 'Granted',
    color: 'text-accent-green',
    bgColor: 'bg-accent-green/20',
    icon: Shield,
  },
};

const categoryConfig = {
  hardware: { label: 'Hardware', color: 'text-accent-cyan' },
  software: { label: 'Software', color: 'text-accent-purple' },
  robotics: { label: 'Robotics', color: 'text-accent-green' },
  logistics: { label: 'Logistics', color: 'text-yellow-500' },
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-slate-700 transition-colors"
      title="Copy ID"
    >
      {copied ? (
        <Check className="w-4 h-4 text-accent-green" />
      ) : (
        <Copy className="w-4 h-4 text-slate-400" />
      )}
    </button>
  );
}

function PatentCard({ patent }) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[patent.status];
  const category = categoryConfig[patent.category];
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary-light rounded-xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-mono text-slate-400">{patent.id}</span>
              <CopyButton text={patent.id} />
              <span className={`text-xs px-2 py-0.5 rounded-full ${category.color} bg-slate-800`}>
                {category.label}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{patent.title}</h3>
            <p className="text-sm text-slate-400 line-clamp-2">{patent.description}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${status.bgColor}`}>
            <StatusIcon className={`w-4 h-4 ${status.color}`} />
            <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{patent.inventor}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Priority: {patent.priorityDate}</span>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-border"
        >
          <div className="p-4 space-y-4">
            {/* Claims */}
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Key Claims</h4>
              <ul className="space-y-1">
                {patent.claims.map((claim, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="text-accent-cyan mt-0.5">•</span>
                    <span>{claim}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Date info */}
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-border">
              <span>Date of Conception: {patent.dateOfConception}</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function PatentPage() {
  const [filter, setFilter] = useState('all');

  const filteredPatents = filter === 'all'
    ? patents
    : patents.filter(p => p.category === filter);

  const stats = {
    total: patents.length,
    disclosed: patents.filter(p => p.status === 'disclosed').length,
    filed: patents.filter(p => p.status === 'filed').length,
    granted: patents.filter(p => p.status === 'granted').length,
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="border-b border-border bg-primary/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-300 hover:text-accent-cyan transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <h1 className="text-lg font-bold text-white">Patent Portfolio</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-primary-light border border-border">
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-slate-400">Total</div>
          </div>
          <div className="p-4 rounded-xl bg-primary-light border border-border">
            <div className="text-3xl font-bold text-accent-cyan">{stats.disclosed}</div>
            <div className="text-sm text-slate-400">Disclosed</div>
          </div>
          <div className="p-4 rounded-xl bg-primary-light border border-border">
            <div className="text-3xl font-bold text-yellow-500">{stats.filed}</div>
            <div className="text-sm text-slate-400">Filed</div>
          </div>
          <div className="p-4 rounded-xl bg-primary-light border border-border">
            <div className="text-3xl font-bold text-accent-green">{stats.granted}</div>
            <div className="text-sm text-slate-400">Granted</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'hardware', 'software', 'robotics', 'logistics'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === cat
                  ? 'bg-accent-cyan text-primary'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All' : categoryConfig[cat]?.label || cat}
            </button>
          ))}
        </div>

        {/* Patent list */}
        <div className="space-y-4">
          {filteredPatents.map((patent) => (
            <PatentCard key={patent.id} patent={patent} />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 p-4 rounded-xl bg-slate-800/50 border border-border">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-400">
              <p className="font-medium text-white mb-1">Confidential - Internal Use Only</p>
              <p>
                These documents represent intellectual property of ELEKTROKOMBINACIJA.
                Priority date established through GPG-signed git commits and blockchain timestamping.
                All commits are cryptographically signed to ensure authenticity and non-repudiation.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
