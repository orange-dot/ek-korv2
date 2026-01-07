import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Briefcase,
  FileText,
  Shield,
  Target,
  DollarSign,
  Users,
  ArrowRight,
  Languages,
  Lock,
  Calendar,
} from 'lucide-react';
import PasswordGate, { ACCESS_TIERS } from '../components/PasswordGate';

// Investor documentation sections
const INVESTOR_DOCS = [
  {
    id: 'patents',
    path: '/patent-portfolio',
    icon: Shield,
    color: 'amber',
    title: { en: 'Patent Portfolio', sr: 'Patentni portfolio' },
    description: {
      en: '10 invention disclosures. Priority date 2026-01-02. Modular architecture, robotic swap, fleet logistics.',
      sr: '10 objavljivanja izuma. Datum prioriteta 2026-01-02. Modularna arhitektura, robotska zamena, logistika flote.',
    },
    badge: { en: '10 Disclosures', sr: '10 objavljivanja' },
    available: true,
  },
  {
    id: 'strategy',
    path: '/strategy',
    icon: Target,
    color: 'purple',
    title: { en: 'Filing Strategy', sr: 'Strategija prijavljivanja' },
    description: {
      en: '3-patent family strategy. Umbrella patent (A), Dual-robot (B), Fleet logistics (C).',
      sr: 'Strategija porodice od 3 patenta. Krovni patent (A), Dvostruki robot (B), Logistika flote (C).',
    },
    available: true,
  },
  {
    id: 'pitch',
    path: '/pitch',
    icon: DollarSign,
    color: 'emerald',
    title: { en: 'Investor Presentation', sr: 'Investitorska prezentacija' },
    description: {
      en: 'Full pitch deck. Problem, solution, market size, team, financials, ask.',
      sr: 'Kompletna prezentacija. Problem, rešenje, veličina tržišta, tim, finansije, traženje.',
    },
    available: true,
  },
  {
    id: 'disclosures',
    path: '/investor/disclosures',
    icon: FileText,
    color: 'blue',
    title: { en: 'Invention Disclosures', sr: 'Objavljivanja izuma' },
    description: {
      en: 'Detailed invention disclosure documents. EK-2026-001 through EK-2026-010.',
      sr: 'Detaljni dokumenti o objavljivanju izuma. EK-2026-001 do EK-2026-010.',
    },
    available: false,
  },
  {
    id: 'team',
    path: '/investor/team',
    icon: Users,
    color: 'cyan',
    title: { en: 'Team & Roadmap', sr: 'Tim i plan' },
    description: {
      en: 'Team capabilities, hiring plan, development milestones.',
      sr: 'Sposobnosti tima, plan zapošljavanja, razvojne prekretnice.',
    },
    available: false,
  },
];

// Key metrics
const METRICS = [
  { label: { en: 'Priority Date', sr: 'Datum prioriteta' }, value: '2026-01-02', icon: Calendar },
  { label: { en: 'Invention Disclosures', sr: 'Objavljivanja izuma' }, value: '10', icon: FileText },
  { label: { en: 'Patent Family', sr: 'Patentna porodica' }, value: '3', icon: Shield },
];

function DocCard({ doc, lang }) {
  const IconComponent = doc.icon;
  const colorClasses = {
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
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
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-amber-300 transition-colors">
              {doc.title[lang]}
            </h3>
            {doc.badge && (
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                {doc.badge[lang]}
              </span>
            )}
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
          </div>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed">{doc.description[lang]}</p>
        </div>
      </div>
    </Link>
  );
}

function InvestorContent() {
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
            <Briefcase className="w-5 h-5 text-amber-400" />
            Investor Portal
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-full text-sm mb-6">
            <Lock className="w-4 h-4" />
            {lang === 'sr' ? 'Investitorski pristup' : 'Investor Access'}
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {lang === 'sr' ? 'IP i investiciona dokumentacija' : 'IP & Investment Documentation'}
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {lang === 'sr'
              ? 'Patentni portfolio, strategija prijavljivanja i investitorski materijali za Elektrokombinacija modularni sistem punjenja.'
              : 'Patent portfolio, filing strategy, and investor materials for Elektrokombinacija modular charging system.'}
          </p>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4">
            {METRICS.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div key={index} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
                  <IconComponent className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{metric.value}</div>
                  <div className="text-sm text-slate-400">{metric.label[lang]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Document Grid */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-4">
            {INVESTOR_DOCS.map(doc => (
              <DocCard key={doc.id} doc={doc} lang={lang} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {lang === 'sr' ? 'Zainteresovani za investiranje?' : 'Interested in investing?'}
          </h2>
          <p className="text-slate-400 mb-6">
            {lang === 'sr'
              ? 'Kontaktirajte nas za detaljnu prezentaciju i due diligence materijale.'
              : 'Contact us for a detailed presentation and due diligence materials.'}
          </p>
          <a
            href="mailto:bojan@elektrokombinacija.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            {lang === 'sr' ? 'Kontaktirajte nas' : 'Contact Us'}
            <ArrowRight className="w-4 h-4" />
          </a>
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

export default function InvestorPage() {
  return (
    <PasswordGate tier={ACCESS_TIERS.INVESTOR}>
      <InvestorContent />
    </PasswordGate>
  );
}
