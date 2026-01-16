import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  ArrowLeft,
  Cpu,
  Network,
  Zap,
  Heart,
  Code,
} from 'lucide-react';

const content = {
  en: {
    title: 'EK-KOR v2: Field-Centric Distributed RTOS',
    subtitle: 'No scheduler. No master. Just local interactions.',
    intro: 'A real-time operating system where coordination emerges from potential field gradients, not central scheduling. Inspired by starling flocks.',
    architectureTitle: 'Architecture',
    architecture: [
      {
        title: 'Field-Based Coordination',
        description: 'Each module publishes its state as a field. Neighbors react to gradients automatically. Coordination emerges from local interactions.',
        icon: 'network',
      },
      {
        title: 'Module-First Design',
        description: 'The module is the first-class citizen. Each EK3 runs its own kernel instance. Fully decentralized topology.',
        icon: 'cpu',
      },
      {
        title: 'Lock-Free IPC',
        description: 'SPSC (Single Producer Single Consumer) queues for inter-module communication. Sub-100ns latency.',
        icon: 'zap',
      },
      {
        title: 'Kernel Heartbeat',
        description: 'Fault detection built into the kernel. 50ms heartbeat period. Dead modules detected in 150ms.',
        icon: 'heart',
      },
    ],
    technicalTitle: 'Technical Details',
    codeExamples: [
      {
        title: 'Field Publication',
        description: 'No explicit message passing. Modules publish state as fields.',
        code: `// Field publication - no explicit message passing
ekk_field_publish(&module, EKK_FIELD_LOAD, load_value);
ekk_field_publish(&module, EKK_FIELD_TEMP, temperature);

// Neighbors react to gradient automatically
float gradient = neighbor_field - my_field;
if (gradient > threshold) {
    // Adjust behavior based on gradient
    adjust_power_output(gradient);
}`,
      },
      {
        title: 'SPSC Queue',
        description: 'Lock-free inter-module communication.',
        code: `// Producer side (one module)
ekk_spsc_push(&queue, &message);

// Consumer side (another module)
if (ekk_spsc_pop(&queue, &message)) {
    process_message(&message);
}

// No locks, no blocking, no priority inversion
// Guaranteed <100ns latency`,
      },
      {
        title: 'Neighbor Discovery',
        description: 'k=7 dynamic neighbor topology.',
        code: `// Kernel maintains k=7 nearest neighbors
ekk_neighbor_t neighbors[7];
ekk_get_neighbors(&module, neighbors, 7);

// Field aggregation from neighbors
float avg_load = 0;
for (int i = 0; i < 7; i++) {
    avg_load += neighbors[i].load_field;
}
avg_load /= 7;`,
      },
    ],
    performanceTitle: 'Performance Metrics',
    performance: [
      { label: 'Field propagation', value: '<100ns' },
      { label: 'SPSC throughput', value: '10M msg/s' },
      { label: 'Heartbeat period', value: '50ms' },
      { label: 'Fault detection', value: '150ms' },
      { label: 'Scaling', value: 'O(1)' },
      { label: 'Memory per module', value: '8KB' },
    ],
    backToHome: 'See on homepage',
  },
  sr: {
    title: 'EK-KOR v2: Distribuirani RTOS sa koordinacijom poljima',
    subtitle: 'Bez schedulera. Bez mastera. Samo lokalne interakcije.',
    intro: 'Real-time operativni sistem gde koordinacija proizilazi iz gradijenata potencijalnih polja, ne centralnog raspoređivanja. Inspirisan jatima čvoraka.',
    architectureTitle: 'Arhitektura',
    architecture: [
      {
        title: 'Koordinacija Poljima',
        description: 'Svaki modul objavljuje svoje stanje kao polje. Susedi reaguju na gradijente automatski. Koordinacija proizilazi iz lokalnih interakcija.',
        icon: 'network',
      },
      {
        title: 'Modul kao Osnovna Jedinica',
        description: 'Modul je osnovna jedinica sistema. Svaki EK3 pokreće svoju instancu kernela. Potpuno decentralizovana topologija.',
        icon: 'cpu',
      },
      {
        title: 'IPC bez Zaključavanja',
        description: 'SPSC (Single Producer Single Consumer) redovi za inter-modularnu komunikaciju. Latencija ispod 100ns.',
        icon: 'zap',
      },
      {
        title: 'Heartbeat u Kernelu',
        description: 'Detekcija grešaka ugrađena u kernel. Period heartbeat-a 50ms. Mrtvi moduli detektovani za 150ms.',
        icon: 'heart',
      },
    ],
    technicalTitle: 'Tehnički Detalji',
    codeExamples: [
      {
        title: 'Publikovanje Polja',
        description: 'Bez eksplicitnog slanja poruka. Moduli objavljuju stanje kao polja.',
        code: `// Publikovanje polja - bez eksplicitnog slanja poruka
ekk_field_publish(&module, EKK_FIELD_LOAD, load_value);
ekk_field_publish(&module, EKK_FIELD_TEMP, temperature);

// Susedi reaguju na gradijent automatski
float gradient = neighbor_field - my_field;
if (gradient > threshold) {
    // Prilagodi ponašanje na osnovu gradijenta
    adjust_power_output(gradient);
}`,
      },
      {
        title: 'SPSC Red',
        description: 'Inter-modularna komunikacija bez zaključavanja.',
        code: `// Strana producenta (jedan modul)
ekk_spsc_push(&queue, &message);

// Strana konzumera (drugi modul)
if (ekk_spsc_pop(&queue, &message)) {
    process_message(&message);
}

// Bez lockova, bez blokiranja, bez inverzije prioriteta
// Garantovana latencija <100ns`,
      },
      {
        title: 'Otkrivanje Suseda',
        description: 'k=7 dinamička topologija suseda.',
        code: `// Kernel održava k=7 najbližih suseda
ekk_neighbor_t neighbors[7];
ekk_get_neighbors(&module, neighbors, 7);

// Agregacija polja od suseda
float avg_load = 0;
for (int i = 0; i < 7; i++) {
    avg_load += neighbors[i].load_field;
}
avg_load /= 7;`,
      },
    ],
    performanceTitle: 'Metrike Performansi',
    performance: [
      { label: 'Propagacija polja', value: '<100ns' },
      { label: 'SPSC propusnost', value: '10M msg/s' },
      { label: 'Period heartbeat-a', value: '50ms' },
      { label: 'Detekcija kvara', value: '150ms' },
      { label: 'Skaliranje', value: 'O(1)' },
      { label: 'Memorija po modulu', value: '8KB' },
    ],
    backToHome: 'Pogledaj na homepage',
  },
};

const iconMap = {
  network: Network,
  cpu: Cpu,
  zap: Zap,
  heart: Heart,
};

export default function EkKorPage() {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full text-sm mb-6">
            <Cpu className="w-4 h-4" />
            {lang === 'sr' ? 'Distribuirani Kernel' : 'Distributed Kernel'}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t.title}</h1>
          <p className="text-2xl text-orange-400 font-bold mb-6">{t.subtitle}</p>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">{t.intro}</p>
        </div>

        {/* Architecture */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{t.architectureTitle}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {t.architecture.map((item, index) => {
              const Icon = iconMap[item.icon];
              return (
                <div key={index} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-orange-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-slate-400">{item.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Technical Details - Code Examples */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{t.technicalTitle}</h2>
          <div className="space-y-8">
            {t.codeExamples.map((example, index) => (
              <div key={index} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Code className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{example.title}</h3>
                    <p className="text-slate-400 text-sm">{example.description}</p>
                  </div>
                </div>
                <pre className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm text-slate-300 font-mono">{example.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Performance Metrics */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{t.performanceTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {t.performance.map((item, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700/50">
                <div className="text-2xl font-bold text-orange-400 mb-2">{item.value}</div>
                <div className="text-slate-400 text-sm">{item.label}</div>
              </div>
            ))}
          </div>
        </section>
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
