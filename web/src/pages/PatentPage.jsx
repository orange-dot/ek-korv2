import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

// Patent disclosure documents
const patents = [
  {
    id: 'EK-2026-001',
    title: 'Unified Modular Power Architecture',
    titleSr: 'Jedinstvena Modularna Arhitektura Napajanja',
    description: 'EK3 blade module design - standardized 3kW power module with blind-mate connectors, enabling scalable charging infrastructure from 3kW to 3MW.',
    descriptionSr: 'EK3 blade modul dizajn - standardizovani 3kW modul napajanja sa blind-mate konektorima, omogućava skalabilnu infrastrukturu punjenja od 3kW do 3MW.',
    inventor: 'Bojan Janjatović',
    witness: 'Marija Janjatović',
    dateOfConception: '2026-01-02',
    priorityDate: '2026-01-02',
    status: 'disclosed',
    category: 'hardware',
    claims: [
      'Standardized blade-format power module (100×300×44mm)',
      'Blind-mate connector system for hot-swap capability',
      'Wide striping load distribution across all modules',
      'Distributed sparing without dedicated hot-spare',
    ],
  },
  {
    id: 'EK-2026-002',
    title: 'Dual-Purpose Robotic Swap Station',
    titleSr: 'Dvonamenska Robotska Swap Stanica',
    description: 'Charging station with integrated robotic system for automated module replacement and battery swap operations.',
    descriptionSr: 'Stanica za punjenje sa integrisanim robotskim sistemom za automatizovanu zamenu modula i swap operacije baterija.',
    inventor: 'Bojan Janjatović',
    witness: 'Marija Janjatović',
    dateOfConception: '2026-01-02',
    priorityDate: '2026-01-02',
    status: 'disclosed',
    category: 'robotics',
    claims: [
      'Station-mounted robot (Robot B) for module manipulation',
      'Automated module extraction and insertion mechanism',
      'Real-time health monitoring integration',
      'Queue management for multiple vehicles',
    ],
  },
  {
    id: 'EK-2026-003',
    title: 'Distributed Power Sparing System',
    titleSr: 'Distribuirani Sistem Rezervnog Napajanja',
    description: 'Power distribution algorithm inspired by 3PAR storage architecture - graceful degradation with minimal capacity loss per module failure.',
    descriptionSr: 'Algoritam distribucije snage inspirisan 3PAR storage arhitekturom - graceful degradation sa minimalnim gubitkom kapaciteta po kvaru modula.',
    inventor: 'Bojan Janjatović',
    witness: 'Marija Janjatović',
    dateOfConception: '2026-01-02',
    priorityDate: '2026-01-02',
    status: 'disclosed',
    category: 'software',
    claims: [
      'Wide striping algorithm for load distribution',
      'Distributed sparing across all modules (no hot-spare)',
      '0.3% capacity loss per module failure (vs 10% traditional)',
      'Automatic load rebalancing on failure detection',
    ],
  },
  {
    id: 'EK-2026-004',
    title: 'Fleet-Integrated Maintenance Logistics',
    titleSr: 'Logistika Održavanja Integrisana sa Flotom',
    description: 'System for using regular bus fleet operations to transport failed modules to service centers - zero dedicated truck rolls.',
    descriptionSr: 'Sistem za korišćenje redovnih operacija flote autobusa za transport neispravnih modula do servisnih centara - nula posebnih truck roll-ova.',
    inventor: 'Bojan Janjatović',
    witness: 'Marija Janjatović',
    dateOfConception: '2026-01-02',
    priorityDate: '2026-01-02',
    status: 'disclosed',
    category: 'logistics',
    claims: [
      'Piggyback logistics using existing fleet routes',
      'Module tracking throughout repair lifecycle',
      'Circular economy integration - refurbishment workflow',
      'Predictive scheduling based on fleet patterns',
    ],
  },
  {
    id: 'EK-2026-005',
    title: 'Coordinated Dual-Robot System',
    titleSr: 'Koordinisani Sistem Dva Robota',
    description: 'Custom robot pair (Robot A on vehicle, Robot B at station) for self-healing charging infrastructure with wireless coordination.',
    descriptionSr: 'Par custom robota (Robot A na vozilu, Robot B na stanici) za self-healing infrastrukturu punjenja sa bežičnom koordinacijom.',
    inventor: 'Bojan Janjatović',
    witness: 'Marija Janjatović',
    dateOfConception: '2026-01-02',
    priorityDate: '2026-01-02',
    status: 'disclosed',
    category: 'robotics',
    claims: [
      'Vehicle-mounted diagnostic robot (Robot A)',
      'Station-based manipulation robot (Robot B)',
      'Wireless coordination protocol between robots',
      'Self-healing infrastructure - 2 minute repair vs 3-4 hours',
    ],
  },
];

const statusConfig = {
  disclosed: {
    label: 'Disclosed',
    labelSr: 'Prijavljen',
    color: 'text-accent-cyan',
    bgColor: 'bg-accent-cyan/20',
    icon: FileText,
  },
  filed: {
    label: 'Filed',
    labelSr: 'Podnet',
    color: 'text-accent-green',
    bgColor: 'bg-accent-green/20',
    icon: CheckCircle,
  },
  pending: {
    label: 'Pending',
    labelSr: 'Na čekanju',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
    icon: Clock,
  },
  granted: {
    label: 'Granted',
    labelSr: 'Odobren',
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

function PatentCard({ patent, lang }) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[patent.status];
  const category = categoryConfig[patent.category];
  const StatusIcon = status.icon;

  const title = lang === 'sr' ? patent.titleSr : patent.title;
  const description = lang === 'sr' ? patent.descriptionSr : patent.description;
  const statusLabel = lang === 'sr' ? status.labelSr : status.label;

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
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-400 line-clamp-2">{description}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${status.bgColor}`}>
            <StatusIcon className={`w-4 h-4 ${status.color}`} />
            <span className={`text-sm font-medium ${status.color}`}>{statusLabel}</span>
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

            {/* Witness info */}
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-border">
              <span>Witness: {patent.witness}</span>
              <span>Date of Conception: {patent.dateOfConception}</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function PatentPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
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
            <span className="text-sm font-medium">Nazad</span>
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
            <div className="text-sm text-slate-400">Ukupno</div>
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
            <PatentCard key={patent.id} patent={patent} lang={lang} />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 p-4 rounded-xl bg-slate-800/50 border border-border">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-400">
              <p className="font-medium text-white mb-1">Confidential - Internal Use Only</p>
              <p>
                Ovi dokumenti predstavljaju intelektualnu svojinu ELEKTROKOMBINACIJA.
                Priority date je uspostavljen kroz git commit history i blockchain timestamping.
                Za pitanja kontaktirajte patent tim.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
