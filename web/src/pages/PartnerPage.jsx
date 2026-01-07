import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Users,
  FileText,
  Cpu,
  Zap,
  Network,
  Thermometer,
  Shield,
  ArrowRight,
  Languages,
  Lock,
} from 'lucide-react';
import PasswordGate, { ACCESS_TIERS } from '../components/PasswordGate';

// Partner documentation sections
const PARTNER_DOCS = [
  {
    id: 'specs',
    path: '/partner/specs',
    icon: FileText,
    color: 'emerald',
    title: { en: 'EK3 Specifications', sr: 'EK3 specifikacije' },
    description: {
      en: 'Master specification document. Single source of truth for all EK3 3.3kW module parameters.',
      sr: 'Master dokument specifikacija. Jedini izvor istine za sve parametre EK3 3.3kW modula.',
    },
    available: false, // Coming soon
  },
  {
    id: 'jezgro',
    path: '/jezgro-dev',
    icon: Cpu,
    color: 'blue',
    title: { en: 'JEZGRO Development', sr: 'JEZGRO razvoj' },
    description: {
      en: 'RTOS development options for EK3 firmware. STM32, AURIX, and hybrid platforms.',
      sr: 'Opcije razvoja RTOS-a za EK3 firmware. STM32, AURIX i hibridne platforme.',
    },
    available: true,
  },
  {
    id: 'jezgro-blog',
    path: '/jezgro-blog',
    icon: FileText,
    color: 'cyan',
    title: { en: 'JEZGRO Dev Blog', sr: 'JEZGRO Dev Blog' },
    description: {
      en: 'Development milestones and progress tracking. Latest: RTOS running on custom TriCore emulator.',
      sr: 'Razvojni milestones i praćenje napretka. Najnovije: RTOS radi na custom TriCore emulatoru.',
    },
    available: true,
  },
  {
    id: 'roj',
    path: '/roj',
    icon: Network,
    color: 'purple',
    title: { en: 'ROJ Intelligence System', sr: 'ROJ sistem inteligencije' },
    description: {
      en: 'Distributed swarm coordination for power modules. Self-healing infrastructure.',
      sr: 'Distribuirana koordinacija roja za module snage. Samoisceljujuća infrastruktura.',
    },
    available: true,
  },
  {
    id: 'v2g',
    path: '/v2g',
    icon: Zap,
    color: 'amber',
    title: { en: 'V2G Control System', sr: 'V2G kontrolni sistem' },
    description: {
      en: 'Vehicle-to-Grid control algorithms. PLL, droop control, grid synchronization.',
      sr: 'Algoritmi kontrole vozilo-mreža. PLL, droop kontrola, sinhronizacija mreže.',
    },
    available: true,
  },
  {
    id: 'thermal',
    path: '/partner/thermal',
    icon: Thermometer,
    color: 'red',
    title: { en: 'Thermal Management', sr: 'Termalno upravljanje' },
    description: {
      en: 'Cooling system design, thermal analysis, and AI thermal control.',
      sr: 'Dizajn sistema hlađenja, termalna analiza i AI termalna kontrola.',
    },
    available: false,
  },
  {
    id: 'security',
    path: '/partner/security',
    icon: Shield,
    color: 'slate',
    title: { en: 'Security Architecture', sr: 'Sigurnosna arhitektura' },
    description: {
      en: '6-layer security model, hardware security modules, tamper protection.',
      sr: '6-slojni model sigurnosti, hardverski sigurnosni moduli, zaštita od neovlašćenog pristupa.',
    },
    available: false,
  },
];

function DocCard({ doc, lang }) {
  const IconComponent = doc.icon;
  const colorClasses = {
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  if (!doc.available) {
    return (
      <div className={`p-6 rounded-xl border ${colorClasses[doc.color]} opacity-60 cursor-not-allowed`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${colorClasses[doc.color].split(' ').slice(0, 2).join(' ')}`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-400 flex items-center gap-2">
              {doc.title[lang]}
              <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">
                {lang === 'sr' ? 'Uskoro' : 'Coming soon'}
              </span>
            </h3>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">{doc.description[lang]}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={doc.path}
      className={`block p-6 rounded-xl border ${colorClasses[doc.color]} hover:border-opacity-60 transition-all hover:scale-[1.02] group`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[doc.color].split(' ').slice(0, 2).join(' ')}`}>
          <IconComponent className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
            {doc.title[lang]}
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed">{doc.description[lang]}</p>
        </div>
      </div>
    </Link>
  );
}

function PartnerContent() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('sr') ? 'sr' : 'en';

  const toggleLanguage = () => {
    i18n.changeLanguage(lang === 'sr' ? 'en' : 'sr');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <Home className="w-5 h-5" />
            <span>Elektrokombinacija</span>
          </Link>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Partner Portal
          </h1>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition-colors"
          >
            <Languages className="w-4 h-4" />
            {lang === 'sr' ? 'EN' : 'SR'}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm mb-6">
            <Lock className="w-4 h-4" />
            {lang === 'sr' ? 'Partnerski pristup' : 'Partner Access'}
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {lang === 'sr' ? 'Tehnička dokumentacija' : 'Technical Documentation'}
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {lang === 'sr'
              ? 'Detaljne specifikacije, arhitektura firmware-a i razvojne opcije za EK3 modularan sistem.'
              : 'Detailed specifications, firmware architecture, and development options for the EK3 modular system.'}
          </p>
        </div>
      </section>

      {/* Document Grid */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-4">
            {PARTNER_DOCS.map(doc => (
              <DocCard key={doc.id} doc={doc} lang={lang} />
            ))}
          </div>
        </div>
      </section>

      {/* Upgrade CTA */}
      <section className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {lang === 'sr' ? 'Investitor?' : 'Investor?'}
          </h2>
          <p className="text-slate-400 mb-6">
            {lang === 'sr'
              ? 'Pristupite patentnoj dokumentaciji i strategiji ulaganja.'
              : 'Access patent documentation and investment strategy.'}
          </p>
          <Link
            to="/investor"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            {lang === 'sr' ? 'Investor Portal' : 'Investor Portal'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-slate-500 text-sm">
          &copy; 2026 Elektrokombinacija. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default function PartnerPage() {
  return (
    <PasswordGate tier={ACCESS_TIERS.PARTNER}>
      <PartnerContent />
    </PasswordGate>
  );
}
