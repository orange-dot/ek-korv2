import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  FileText,
  Layers,
  Zap,
  Network,
  Trophy,
  Battery,
  Hexagon,
  ArrowRight,
  Languages,
  Cpu,
} from 'lucide-react';

// Documentation sections for public access
const DOC_SECTIONS = [
  {
    id: 'self-healing',
    path: '/docs/self-healing',
    icon: Hexagon,
    color: 'green',
    title: { en: 'Self-Healing Fleet', sr: 'Samoizlečiva Flota' },
    description: {
      en: 'Buses carry spare modules. Robots swap in 60 seconds. No technicians in the field. Zero truck rolls.',
      sr: 'Autobusi nose rezervne module. Roboti menjaju za 60 sekundi. Bez tehničara na terenu. Nula izlazaka.',
    },
  },
  {
    id: 'architecture',
    path: '/docs/architecture',
    icon: Layers,
    color: 'blue',
    title: { en: 'System Architecture', sr: 'Arhitektura sistema' },
    description: {
      en: 'Philosophy of modular design + AI. Return to 1970s repairability with 2020s intelligence.',
      sr: 'Filozofija modularnog dizajna + AI. Povratak popravljivosti 1970-ih sa inteligencijom 2020-ih.',
    },
  },
  {
    id: 'v2g-concept',
    path: '/docs/v2g-concept',
    icon: Zap,
    color: 'emerald',
    title: { en: 'V2G Concepts', sr: 'V2G koncepti' },
    description: {
      en: 'Vehicle-to-Grid integration. How electric buses become virtual power plants.',
      sr: 'Integracija vozilo-mreža. Kako električni autobusi postaju virtualne elektrane.',
    },
  },
  {
    id: 'roj-overview',
    path: '/docs/roj-overview',
    icon: Network,
    color: 'purple',
    title: { en: 'ROJ Intelligence', sr: 'ROJ inteligencija' },
    description: {
      en: 'Swarm coordination for distributed power modules. Self-healing infrastructure.',
      sr: 'Koordinacija roja za distribuirane module snage. Samoisceljujuća infrastruktura.',
    },
  },
  {
    id: 'competition',
    path: '/docs/competition',
    icon: Trophy,
    color: 'amber',
    title: { en: 'Competitive Analysis', sr: 'Analiza konkurencije' },
    description: {
      en: 'Market positioning vs ABB, Heliox, ChargePoint, and other charging infrastructure providers.',
      sr: 'Pozicioniranje na tržištu u odnosu na ABB, Heliox, ChargePoint i druge pružaoce infrastrukture.',
    },
  },
  {
    id: 'small-battery',
    path: '/docs/small-battery',
    icon: Battery,
    color: 'cyan',
    title: { en: 'Small Battery Philosophy', sr: 'Filozofija malih baterija' },
    description: {
      en: 'Why smaller batteries + frequent charging beats larger batteries. Economics of opportunity charging.',
      sr: 'Zašto manje baterije + češće punjenje pobeđuje veće baterije. Ekonomija oportunističkog punjenja.',
    },
  },
  {
    id: 'ek-kor',
    path: '/docs/ek-kor',
    icon: Cpu,
    color: 'orange',
    title: { en: 'EK-KOR v2 Kernel', sr: 'EK-KOR v2 Kernel' },
    description: {
      en: 'Distributed RTOS without central scheduler. Potential field coordination inspired by starling flocks.',
      sr: 'Distribuirani RTOS bez centralnog schedulera. Koordinacija potencijalnim poljima inspirisana jatima čvoraka.',
    },
  },
];

function DocCard({ doc, lang }) {
  const IconComponent = doc.icon;
  const colorClasses = {
    green: 'bg-green-500/20 text-green-400 border-green-500/30 hover:border-green-400',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:border-blue-400',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:border-emerald-400',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30 hover:border-purple-400',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:border-amber-400',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:border-cyan-400',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30 hover:border-orange-400',
  };

  return (
    <Link
      to={doc.path}
      className={`block p-6 rounded-xl border ${colorClasses[doc.color]} transition-all hover:scale-[1.02] group`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[doc.color].split(' ').slice(0, 2).join(' ')}`}>
          <IconComponent className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors flex items-center gap-2">
            {doc.title[lang]}
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed">{doc.description[lang]}</p>
        </div>
      </div>
    </Link>
  );
}

export default function DocsPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('sr') ? 'sr' : 'en';

  const toggleLanguage = () => {
    i18n.changeLanguage(lang === 'sr' ? 'en' : 'sr');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <Home className="w-5 h-5" />
            <span>Elektrokombinacija</span>
          </Link>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            {lang === 'sr' ? 'Dokumentacija' : 'Documentation'}
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm mb-6">
            <Hexagon className="w-4 h-4" />
            {lang === 'sr' ? 'Otvorena dokumentacija' : 'Open Documentation'}
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            {lang === 'sr' ? 'Tehnička dokumentacija' : 'Technical Documentation'}
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {lang === 'sr'
              ? 'Konceptualna dokumentacija za modularnu infrastrukturu punjenja električnih vozila. Pogledajte našu filozofiju, arhitekturu i viziju.'
              : 'Conceptual documentation for modular EV charging infrastructure. Explore our philosophy, architecture, and vision.'}
          </p>
        </div>
      </section>

      {/* Document Grid */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-4">
            {DOC_SECTIONS.map(doc => (
              <DocCard key={doc.id} doc={doc} lang={lang} />
            ))}
          </div>
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
