import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  ArrowLeft,
  Brain,
  Bus,
  Bot,
  Route,
  Truck,
  UserX,
  Package,
  Recycle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Zap,
} from 'lucide-react';

const content = {
  en: {
    title: 'Self-Healing Fleet',
    subtitle: 'No technicians in the field. Ever.',
    intro: 'The fundamental innovation: buses themselves are the spare parts network. When a module fails, the fleet repairs itself automatically.',
    howItWorks: 'How It Works',
    steps: [
      {
        title: 'AI Predicts Failure',
        description: 'Machine learning detects degradation patterns 2 weeks before actual failure. ROJ swarm intelligence identifies which module needs attention.',
        icon: 'brain',
      },
      {
        title: 'Bus Carries Spares',
        description: 'Each electric bus carries 2-4 spare EK3 modules. The fleet becomes a distributed spare parts warehouse. No central inventory needed.',
        icon: 'bus',
      },
      {
        title: 'Robot Swaps Module',
        description: 'At the charging station, Robot B automatically swaps the degraded module in 60 seconds. No human intervention, no waiting.',
        icon: 'robot',
      },
      {
        title: 'Fleet Transport',
        description: 'The failed module travels to the service depot on the next scheduled bus. Zero truck rolls. Zero special logistics.',
        icon: 'route',
      },
    ],
    comparison: {
      title: 'Traditional vs ELEKTROKOMBINACIJA',
      traditional: {
        title: 'Traditional Approach',
        time: '3-4 hours',
        steps: [
          'Charging fails',
          'Alarm to central dispatch',
          'Dispatch sends technician',
          'Technician drives 1-2 hours',
          'On-site diagnosis: 30 min',
          'Repair or order parts: 1+ hours',
        ],
        result: 'Downtime, truck rolls, waiting, frustration',
      },
      ek: {
        title: 'ELEKTROKOMBINACIJA',
        time: '2 minutes',
        steps: [
          'AI detects degradation',
          'Robot A runs diagnostics',
          'Robot B swaps module',
          'Bus continues route',
        ],
        result: 'Continuous operation, zero human intervention',
      },
    },
    benefits: {
      title: 'Key Benefits',
      items: [
        {
          title: 'Zero Truck Rolls',
          description: 'Failed modules travel on regular bus routes to the depot. No special service vehicles needed.',
        },
        {
          title: 'No Field Technicians',
          description: 'Robots handle all field operations. Humans work in comfortable service centers with proper tools.',
        },
        {
          title: 'Fleet = Spare Inventory',
          description: 'Buses carry distributed spare capacity. No central warehouse, no inventory management.',
        },
        {
          title: 'Circular Economy',
          description: 'Modules are repaired at the depot and returned to service. 15+ year module lifespan.',
        },
      ],
    },
    economics: {
      title: 'Economics',
      items: [
        { label: 'Spare inventory reduction', value: '60%' },
        { label: 'Truck roll elimination', value: '95%' },
        { label: 'Mean time to repair', value: '2 min' },
        { label: 'Technician productivity', value: '3x' },
      ],
    },
  },
  sr: {
    title: 'Samoizlečiva Flota',
    subtitle: 'Bez tehničara na terenu. Nikad.',
    intro: 'Fundamentalna inovacija: autobusi su sami mreža rezervnih delova. Kada modul otkaže, flota se sama popravlja.',
    howItWorks: 'Kako Funkcioniše',
    steps: [
      {
        title: 'AI Predviđa Kvar',
        description: 'Mašinsko učenje detektuje degradaciju 2 nedelje pre kvara. ROJ inteligencija roja identifikuje koji modul treba pažnju.',
        icon: 'brain',
      },
      {
        title: 'Autobus Nosi Rezerve',
        description: 'Svaki električni autobus nosi 2-4 rezervna EK3 modula. Flota postaje distribuirano skladište rezervnih delova.',
        icon: 'bus',
      },
      {
        title: 'Robot Menja Modul',
        description: 'Na stanici za punjenje, Robot B automatski menja degradirani modul za 60 sekundi. Bez ljudske intervencije.',
        icon: 'robot',
      },
      {
        title: 'Transport Flotom',
        description: 'Pokvareni modul putuje u servisni depo sledećim autobusom. Nula izlazaka servisnih vozila.',
        icon: 'route',
      },
    ],
    comparison: {
      title: 'Tradicionalno vs ELEKTROKOMBINACIJA',
      traditional: {
        title: 'Tradicionalni Pristup',
        time: '3-4 sata',
        steps: [
          'Punjenje ne radi',
          'Alarm na centralu',
          'Dispečer šalje tehničara',
          'Tehničar vozi 1-2 sata',
          'Dijagnostika na licu mesta: 30 min',
          'Popravka ili narudžbina delova: 1+ sat',
        ],
        result: 'Zastoj, izlasci vozila, čekanje, frustracija',
      },
      ek: {
        title: 'ELEKTROKOMBINACIJA',
        time: '2 minuta',
        steps: [
          'AI detektuje degradaciju',
          'Robot A vrši dijagnostiku',
          'Robot B menja modul',
          'Autobus nastavlja rutu',
        ],
        result: 'Kontinuiran rad, nula ljudske intervencije',
      },
    },
    benefits: {
      title: 'Ključne Prednosti',
      items: [
        {
          title: 'Nula Izlazaka',
          description: 'Pokvareni moduli putuju redovnim autobuskim linijama u depo. Bez specijalnih servisnih vozila.',
        },
        {
          title: 'Bez Tehničara na Terenu',
          description: 'Roboti obavljaju sve terenske operacije. Ljudi rade u udobnim servisnim centrima.',
        },
        {
          title: 'Flota = Skladište Rezervi',
          description: 'Autobusi nose distribuirani rezervni kapacitet. Bez centralnog skladišta.',
        },
        {
          title: 'Cirkularna Ekonomija',
          description: 'Moduli se popravljaju u depou i vraćaju u upotrebu. 15+ godina životnog veka modula.',
        },
      ],
    },
    economics: {
      title: 'Ekonomija',
      items: [
        { label: 'Smanjenje zaliha rezervi', value: '60%' },
        { label: 'Eliminacija izlazaka', value: '95%' },
        { label: 'Srednje vreme popravke', value: '2 min' },
        { label: 'Produktivnost tehničara', value: '3x' },
      ],
    },
  },
};

const iconMap = {
  brain: Brain,
  bus: Bus,
  robot: Bot,
  route: Route,
};

export default function SelfHealingPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('sr') ? 'sr' : 'en';
  const t = content[lang];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/docs" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>{lang === 'sr' ? 'Nazad' : 'Back'}</span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <Home className="w-5 h-5" />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm mb-6">
            <Zap className="w-4 h-4" />
            {lang === 'sr' ? 'Ključna Inovacija' : 'Key Innovation'}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t.title}</h1>
          <p className="text-2xl text-green-400 font-bold mb-6">{t.subtitle}</p>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">{t.intro}</p>
        </div>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{t.howItWorks}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {t.steps.map((step, index) => {
              const Icon = iconMap[step.icon];
              return (
                <div key={index} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-green-400" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-green-400 font-mono mb-1">Step {index + 1}</div>
                      <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-slate-400">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Comparison */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{t.comparison.title}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Traditional */}
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-red-400">{t.comparison.traditional.title}</h3>
                <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-bold text-sm">{t.comparison.traditional.time}</span>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                {t.comparison.traditional.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 font-bold text-xs">
                      {i + 1}
                    </div>
                    <span className="text-slate-300 text-sm">{step}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-red-500/30 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 text-sm">{t.comparison.traditional.result}</span>
              </div>
            </div>

            {/* EK */}
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-green-400">{t.comparison.ek.title}</h3>
                <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-bold text-sm">{t.comparison.ek.time}</span>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                {t.comparison.ek.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold text-xs">
                      {i + 1}
                    </div>
                    <span className="text-slate-300 text-sm">{step}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-green-500/30 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-sm">{t.comparison.ek.result}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{t.benefits.title}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {t.benefits.items.map((benefit, i) => {
              const icons = [Truck, UserX, Package, Recycle];
              const Icon = icons[i];
              return (
                <div key={i} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">{benefit.title}</h3>
                      <p className="text-slate-400 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Economics */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{t.economics.title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {t.economics.items.map((item, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700/50">
                <div className="text-3xl font-bold text-green-400 mb-2">{item.value}</div>
                <div className="text-slate-400 text-sm">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/#self-healing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <span>{lang === 'sr' ? 'Pogledaj na homepage' : 'See on homepage'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-slate-500 text-sm">
          &copy; 2026 Elektrokombinacija
        </div>
      </footer>
    </div>
  );
}
