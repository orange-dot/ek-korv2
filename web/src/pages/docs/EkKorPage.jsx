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
  Languages,
  Github,
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
    technicalTitle: 'Code Examples',
    codeExamples: [
      {
        title: 'Module Initialization',
        description: 'Each EK3 module initializes its own kernel instance.',
        code: `// Initialize module with unique ID from hardware
ekk_module_t module;
ekk_init(&module, EKK_MODULE_ID_FROM_MAC);

// Register fields this module will publish
ekk_field_register(&module, EKK_FIELD_LOAD);
ekk_field_register(&module, EKK_FIELD_TEMP);
ekk_field_register(&module, EKK_FIELD_VOLTAGE);

// Start the kernel - begins heartbeat and neighbor discovery
ekk_start(&module);`,
      },
      {
        title: 'Field Publication & Gradients',
        description: 'Modules publish state as fields. Neighbors react to gradients.',
        code: `// Publish current state - propagates to k=7 neighbors
ekk_field_publish(&module, EKK_FIELD_LOAD, current_load);
ekk_field_publish(&module, EKK_FIELD_TEMP, temperature_c);

// Read neighbor fields and compute gradient
ekk_neighbor_t neighbors[7];
int n = ekk_get_neighbors(&module, neighbors, 7);

float total_gradient = 0;
for (int i = 0; i < n; i++) {
    float neighbor_load = ekk_field_read(&neighbors[i], EKK_FIELD_LOAD);
    total_gradient += (neighbor_load - current_load);
}

// Positive gradient = neighbors have higher load = I should take more
if (total_gradient > EKK_GRADIENT_THRESHOLD) {
    increase_power_output();
}`,
      },
      {
        title: 'SPSC Lock-Free Queue',
        description: 'Single Producer Single Consumer queue for IPC.',
        code: `// Statically allocate queue (no malloc in kernel)
EKK_SPSC_DEFINE(cmd_queue, ekk_cmd_t, 16);

// Producer: power controller module
ekk_cmd_t cmd = { .type = CMD_SET_POWER, .value = 3300 };
if (!ekk_spsc_push(&cmd_queue, &cmd)) {
    // Queue full - apply backpressure
    ekk_field_publish(&module, EKK_FIELD_BUSY, 1);
}

// Consumer: power stage module (different core)
ekk_cmd_t received;
while (ekk_spsc_pop(&cmd_queue, &received)) {
    switch (received.type) {
        case CMD_SET_POWER:
            set_dab_power(received.value);
            break;
        case CMD_SHUTDOWN:
            enter_safe_state();
            break;
    }
}`,
      },
      {
        title: 'Heartbeat & Fault Detection',
        description: 'Kernel-level fault detection with 50ms heartbeat.',
        code: `// Heartbeat runs in kernel, not application
// Configured at compile time
#define EKK_HEARTBEAT_MS      50
#define EKK_DEAD_THRESHOLD    3  // 150ms to detect dead module

// Application registers fault handler
void on_neighbor_fault(ekk_module_id_t dead_id, void* ctx) {
    // Neighbor died - redistribute its load
    float dead_load = last_known_load[dead_id];
    float my_share = dead_load / surviving_neighbor_count();
    increase_power_output_by(my_share);

    // Log for diagnostics
    ekk_log(EKK_LOG_WARN, "Module %04x died, absorbed %.1fW",
            dead_id, my_share);
}

ekk_on_neighbor_fault(&module, on_neighbor_fault, NULL);`,
      },
      {
        title: 'Load Balancing via Fields',
        description: 'Emergent load balancing from local gradient following.',
        code: `// Main control loop - runs every 10ms
void control_loop(ekk_module_t* m) {
    // 1. Read local sensors
    float load = adc_read_current() * adc_read_voltage();
    float temp = adc_read_temperature();

    // 2. Publish to neighbors
    ekk_field_publish(m, EKK_FIELD_LOAD, load);
    ekk_field_publish(m, EKK_FIELD_TEMP, temp);

    // 3. Compute average neighbor load
    float neighbor_avg = ekk_field_neighbor_avg(m, EKK_FIELD_LOAD);

    // 4. Adjust toward average (gradient descent)
    float error = neighbor_avg - load;
    float adjustment = error * EKK_BALANCE_GAIN;

    // 5. Apply with thermal limiting
    if (temp < EKK_TEMP_LIMIT) {
        adjust_power_setpoint(adjustment);
    }
}`,
      },
      {
        title: 'Module Discovery Protocol',
        description: 'Dynamic topology with k=7 nearest neighbors.',
        code: `// Discovery runs automatically in kernel
// Modules announce presence via CAN-FD broadcast

// Application can query current topology
ekk_topology_t topo;
ekk_get_topology(&module, &topo);

printf("Module %04x topology:\\n", module.id);
printf("  Neighbors: %d/%d\\n", topo.neighbor_count, EKK_K_NEIGHBORS);
printf("  Rack ID: %d\\n", topo.rack_id);
printf("  Position: row=%d col=%d\\n", topo.row, topo.col);

// Iterate neighbors
for (int i = 0; i < topo.neighbor_count; i++) {
    ekk_neighbor_t* n = &topo.neighbors[i];
    printf("  [%d] id=%04x load=%.1fW temp=%.1fC\\n",
           i, n->id,
           ekk_field_read(n, EKK_FIELD_LOAD),
           ekk_field_read(n, EKK_FIELD_TEMP));
}`,
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
    technicalTitle: 'Primeri Koda',
    codeExamples: [
      {
        title: 'Inicijalizacija Modula',
        description: 'Svaki EK3 modul inicijalizuje sopstvenu instancu kernela.',
        code: `// Inicijalizuj modul sa jedinstvenim ID iz hardvera
ekk_module_t module;
ekk_init(&module, EKK_MODULE_ID_FROM_MAC);

// Registruj polja koja će ovaj modul objavljivati
ekk_field_register(&module, EKK_FIELD_LOAD);
ekk_field_register(&module, EKK_FIELD_TEMP);
ekk_field_register(&module, EKK_FIELD_VOLTAGE);

// Pokreni kernel - započinje heartbeat i otkrivanje suseda
ekk_start(&module);`,
      },
      {
        title: 'Publikovanje Polja i Gradijenti',
        description: 'Moduli objavljuju stanje kao polja. Susedi reaguju na gradijente.',
        code: `// Objavi trenutno stanje - propagira se do k=7 suseda
ekk_field_publish(&module, EKK_FIELD_LOAD, current_load);
ekk_field_publish(&module, EKK_FIELD_TEMP, temperature_c);

// Pročitaj polja suseda i izračunaj gradijent
ekk_neighbor_t neighbors[7];
int n = ekk_get_neighbors(&module, neighbors, 7);

float total_gradient = 0;
for (int i = 0; i < n; i++) {
    float neighbor_load = ekk_field_read(&neighbors[i], EKK_FIELD_LOAD);
    total_gradient += (neighbor_load - current_load);
}

// Pozitivan gradijent = susedi imaju veće opterećenje = treba da preuzmem više
if (total_gradient > EKK_GRADIENT_THRESHOLD) {
    increase_power_output();
}`,
      },
      {
        title: 'SPSC Red bez Zaključavanja',
        description: 'Single Producer Single Consumer red za IPC.',
        code: `// Statička alokacija reda (bez malloc u kernelu)
EKK_SPSC_DEFINE(cmd_queue, ekk_cmd_t, 16);

// Producent: modul kontrolera snage
ekk_cmd_t cmd = { .type = CMD_SET_POWER, .value = 3300 };
if (!ekk_spsc_push(&cmd_queue, &cmd)) {
    // Red pun - primeni backpressure
    ekk_field_publish(&module, EKK_FIELD_BUSY, 1);
}

// Konzumer: modul snage (drugo jezgro)
ekk_cmd_t received;
while (ekk_spsc_pop(&cmd_queue, &received)) {
    switch (received.type) {
        case CMD_SET_POWER:
            set_dab_power(received.value);
            break;
        case CMD_SHUTDOWN:
            enter_safe_state();
            break;
    }
}`,
      },
      {
        title: 'Heartbeat i Detekcija Grešaka',
        description: 'Detekcija grešaka na nivou kernela sa 50ms heartbeat-om.',
        code: `// Heartbeat radi u kernelu, ne u aplikaciji
// Konfigurisano u vreme kompajliranja
#define EKK_HEARTBEAT_MS      50
#define EKK_DEAD_THRESHOLD    3  // 150ms za detekciju mrtvog modula

// Aplikacija registruje handler za greške
void on_neighbor_fault(ekk_module_id_t dead_id, void* ctx) {
    // Sused je umro - preraspodeli njegovo opterećenje
    float dead_load = last_known_load[dead_id];
    float my_share = dead_load / surviving_neighbor_count();
    increase_power_output_by(my_share);

    // Logiraj za dijagnostiku
    ekk_log(EKK_LOG_WARN, "Modul %04x umro, apsorbovao %.1fW",
            dead_id, my_share);
}

ekk_on_neighbor_fault(&module, on_neighbor_fault, NULL);`,
      },
      {
        title: 'Balansiranje Opterećenja preko Polja',
        description: 'Emergentno balansiranje iz lokalnog praćenja gradijenata.',
        code: `// Glavna kontrolna petlja - izvršava se svakih 10ms
void control_loop(ekk_module_t* m) {
    // 1. Pročitaj lokalne senzore
    float load = adc_read_current() * adc_read_voltage();
    float temp = adc_read_temperature();

    // 2. Objavi susedima
    ekk_field_publish(m, EKK_FIELD_LOAD, load);
    ekk_field_publish(m, EKK_FIELD_TEMP, temp);

    // 3. Izračunaj prosečno opterećenje suseda
    float neighbor_avg = ekk_field_neighbor_avg(m, EKK_FIELD_LOAD);

    // 4. Prilagodi ka proseku (gradient descent)
    float error = neighbor_avg - load;
    float adjustment = error * EKK_BALANCE_GAIN;

    // 5. Primeni sa termalnim ograničenjem
    if (temp < EKK_TEMP_LIMIT) {
        adjust_power_setpoint(adjustment);
    }
}`,
      },
      {
        title: 'Protokol Otkrivanja Modula',
        description: 'Dinamička topologija sa k=7 najbližih suseda.',
        code: `// Otkrivanje radi automatski u kernelu
// Moduli objavljuju prisustvo preko CAN-FD broadcast-a

// Aplikacija može upitati trenutnu topologiju
ekk_topology_t topo;
ekk_get_topology(&module, &topo);

printf("Topologija modula %04x:\\n", module.id);
printf("  Susedi: %d/%d\\n", topo.neighbor_count, EKK_K_NEIGHBORS);
printf("  Rack ID: %d\\n", topo.rack_id);
printf("  Pozicija: red=%d kol=%d\\n", topo.row, topo.col);

// Iteriraj susede
for (int i = 0; i < topo.neighbor_count; i++) {
    ekk_neighbor_t* n = &topo.neighbors[i];
    printf("  [%d] id=%04x load=%.1fW temp=%.1fC\\n",
           i, n->id,
           ekk_field_read(n, EKK_FIELD_LOAD),
           ekk_field_read(n, EKK_FIELD_TEMP));
}`,
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

  const toggleLanguage = () => {
    i18n.changeLanguage(lang === 'sr' ? 'en' : 'sr');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/docs" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>{lang === 'sr' ? 'Nazad' : 'Back'}</span>
          </Link>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/orange-dot/ek-korv2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">Source</span>
            </a>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition-colors"
            >
              <Languages className="w-4 h-4" />
              {lang === 'sr' ? 'EN' : 'SR'}
            </button>
            <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <Home className="w-5 h-5" />
            </Link>
          </div>
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
