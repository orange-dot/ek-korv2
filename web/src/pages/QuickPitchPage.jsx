import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Cpu,
  Users,
  Bot,
  Battery,
  Building2,
  Truck,
  Ship,
  Bike,
  Car,
  FileText,
  Calendar,
  Euro,
  Shield,
  Hexagon,
  Network,
  ChevronRight,
} from 'lucide-react';

// Depth levels
const DEPTH_LEVELS = [
  { id: '30s', label: '30 sec', labelSr: '30 sek' },
  { id: '2min', label: '2 min', labelSr: '2 min' },
  { id: '5min', label: '5 min', labelSr: '5 min' },
];

// Scale configurations
const SCALE_ITEMS = [
  { icon: Bike, modules: 1, power: '3.3 kW', label: 'E-bike', labelSr: 'E-bicikl' },
  { icon: Home, modules: 7, power: '23 kW', label: 'Home', labelSr: 'Dom' },
  { icon: Car, modules: 46, power: '150 kW', label: 'DC Fast', labelSr: 'Brzo DC' },
  { icon: Building2, modules: 152, power: '500 kW', label: 'Depot', labelSr: 'Depo' },
  { icon: Truck, modules: 303, power: '1 MW', label: '1 MW', labelSr: '1 MW' },
  { icon: Ship, modules: 909, power: '3 MW', label: 'MCS', labelSr: 'MCS' },
];

// Tech pillars for 2min+ view
const TECH_PILLARS = [
  {
    id: 'jezgro',
    icon: Cpu,
    color: 'purple',
    title: 'JEZGRO',
    titleSr: 'JEZGRO',
    desc: 'MINIX-inspired RTOS',
    descSr: 'MINIX-inspirisan RTOS',
    detail: 'MPU isolation, <50ms restart',
    detailSr: 'MPU izolacija, <50ms restart',
  },
  {
    id: 'roj',
    icon: Hexagon,
    color: 'cyan',
    title: 'ROJ',
    titleSr: 'ROJ',
    desc: 'Swarm Intelligence',
    descSr: 'Inteligencija Roja',
    detail: 'No central controller, N+1 redundancy',
    detailSr: 'Bez centralnog kontrolera, N+1 redundancija',
  },
  {
    id: 'robots',
    icon: Bot,
    color: 'green',
    title: 'ROBOTS',
    titleSr: 'ROBOTI',
    desc: 'A + B Coordination',
    descSr: 'A + B Koordinacija',
    detail: '60s swap, zero downtime',
    detailSr: '60s zamena, nula zastoja',
  },
];

// Comparison data for 5min view
const COMPARISON = [
  { feature: 'Module size', featureSr: 'Veličina modula', ek: '3.3 kW', abb: '25-50 kW', tesla: 'Monolithic' },
  { feature: 'Swap time', featureSr: 'Vreme zamene', ek: '60 sec', abb: '2-4 hours', tesla: 'N/A' },
  { feature: 'Failure impact', featureSr: 'Uticaj kvara', ek: '0.3%', abb: '10-33%', tesla: '100%' },
  { feature: 'Redundancy', featureSr: 'Redundancija', ek: 'N+1', abb: 'None', tesla: 'None' },
];

export default function QuickPitchPage() {
  const { t, i18n } = useTranslation();
  const [depth, setDepth] = useState('2min');
  const isSr = i18n.language === 'sr';

  const showMedium = depth === '2min' || depth === '5min';
  const showFull = depth === '5min';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <Home className="w-5 h-5" />
              <span className="font-bold">
                <span className="text-white">ELEKTRO</span>
                <span className="text-cyan-400">KOMBINACIJA</span>
              </span>
            </Link>

            {/* Depth toggle */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-full p-1">
              {DEPTH_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setDepth(level.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    depth === level.id
                      ? 'bg-cyan-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isSr ? level.labelSr : level.label}
                </button>
              ))}
            </div>

            {/* Language toggle */}
            <button
              onClick={() => i18n.changeLanguage(isSr ? 'en' : 'sr')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-300"
            >
              {isSr ? 'EN' : 'SR'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* PROBLEM → SOLUTION Flow */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Problem */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-red-950/50 to-orange-950/50 border border-red-500/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-red-400">
                  {isSr ? 'PROBLEM' : 'PROBLEM'}
                </h2>
              </div>

              <p className="text-4xl font-black text-white mb-4">
                {isSr ? 'Punjač crkne' : 'Charger dies'}
              </p>

              <div className="flex items-center gap-4">
                <Clock className="w-12 h-12 text-red-400" />
                <div>
                  <p className="text-5xl font-black text-red-400">14</p>
                  <p className="text-xl text-red-300">{isSr ? 'dana čekanja' : 'days waiting'}</p>
                </div>
              </div>

              <AnimatePresence>
                {showMedium && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-red-500/20"
                  >
                    <ul className="space-y-2 text-slate-300">
                      <li className="flex items-center gap-2">
                        <span className="text-red-400">✗</span>
                        {isSr ? 'Monolitni dizajn - ceo sistem pada' : 'Monolithic design - whole system fails'}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-400">✗</span>
                        {isSr ? 'Specijalizovani tehničari potrebni' : 'Specialized technicians required'}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-400">✗</span>
                        {isSr ? '10-33% kapaciteta izgubljeno' : '10-33% capacity lost per failure'}
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Arrow */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowRight className="w-12 h-12 text-cyan-400" />
            </motion.div>
          </div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-green-950/50 to-cyan-950/50 border border-green-500/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-green-400">
                  {isSr ? 'REŠENJE' : 'SOLUTION'}
                </h2>
              </div>

              <p className="text-4xl font-black text-white mb-4">
                {isSr ? 'Zameni modul' : 'Swap module'}
              </p>

              <div className="flex items-center gap-4">
                <Zap className="w-12 h-12 text-green-400" />
                <div>
                  <p className="text-5xl font-black text-green-400">60</p>
                  <p className="text-xl text-green-300">{isSr ? 'sekundi' : 'seconds'}</p>
                </div>
              </div>

              <AnimatePresence>
                {showMedium && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-green-500/20"
                  >
                    <ul className="space-y-2 text-slate-300">
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        {isSr ? 'EK3 modul: 3.3 kW, 3.5 kg' : 'EK3 module: 3.3 kW, 3.5 kg'}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        {isSr ? 'Robotska zamena - bez tehničara' : 'Robotic swap - no technicians'}
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        {isSr ? 'Samo 0.3% kapaciteta izgubljeno' : 'Only 0.3% capacity lost'}
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Tech Pillars - 2min+ */}
        <AnimatePresence>
          {showMedium && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-16"
            >
              <h3 className="text-center text-xl font-bold text-slate-400 mb-8">
                {isSr ? 'TRI STUBA TEHNOLOGIJE' : 'THREE TECHNOLOGY PILLARS'}
              </h3>

              <div className="grid md:grid-cols-3 gap-6">
                {TECH_PILLARS.map((pillar, idx) => {
                  const Icon = pillar.icon;
                  const colorClass = {
                    purple: 'from-purple-950/50 to-purple-900/30 border-purple-500/30 text-purple-400',
                    cyan: 'from-cyan-950/50 to-cyan-900/30 border-cyan-500/30 text-cyan-400',
                    green: 'from-green-950/50 to-green-900/30 border-green-500/30 text-green-400',
                  }[pillar.color];

                  return (
                    <motion.div
                      key={pillar.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`bg-gradient-to-br ${colorClass} border rounded-2xl p-6 text-center`}
                    >
                      <Icon className="w-12 h-12 mx-auto mb-4" />
                      <h4 className="text-2xl font-black text-white mb-2">
                        {isSr ? pillar.titleSr : pillar.title}
                      </h4>
                      <p className="text-lg font-medium mb-2">
                        {isSr ? pillar.descSr : pillar.desc}
                      </p>
                      {showFull && (
                        <p className="text-sm text-slate-400">
                          {isSr ? pillar.detailSr : pillar.detail}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scale Bar - Always visible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h3 className="text-center text-xl font-bold text-slate-400 mb-6">
            {isSr ? 'SKALIRANJE: 3 kW → 3 MW' : 'SCALING: 3 kW → 3 MW'}
          </h3>

          <div className="relative">
            {/* Progress bar */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full" />

            <div className="relative grid grid-cols-6 gap-2">
              {SCALE_ITEMS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 mb-2 hover:border-cyan-500/50 transition-colors">
                      <Icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <p className="text-lg font-bold text-white">{item.power}</p>
                    <p className="text-xs text-slate-500">{isSr ? item.labelSr : item.label}</p>
                    {showMedium && (
                      <p className="text-xs text-slate-600">{item.modules}×</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Comparison Table - 5min only */}
        <AnimatePresence>
          {showFull && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-16"
            >
              <h3 className="text-center text-xl font-bold text-slate-400 mb-6">
                {isSr ? 'POREĐENJE SA KONKURENCIJOM' : 'VS COMPETITION'}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium"></th>
                      <th className="py-3 px-4 text-cyan-400 font-bold">ELEKTROKOMBINACIJA</th>
                      <th className="py-3 px-4 text-slate-400 font-medium">ABB Terra</th>
                      <th className="py-3 px-4 text-slate-400 font-medium">Tesla SC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-800">
                        <td className="py-3 px-4 text-slate-300">{isSr ? row.featureSr : row.feature}</td>
                        <td className="py-3 px-4 text-center text-green-400 font-bold">{row.ek}</td>
                        <td className="py-3 px-4 text-center text-slate-500">{row.abb}</td>
                        <td className="py-3 px-4 text-center text-slate-500">{row.tesla}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Key Stats - 2min+ */}
        <AnimatePresence>
          {showMedium && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-3 gap-6 mb-16"
            >
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
                <FileText className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-4xl font-black text-white">10</p>
                <p className="text-slate-400">{isSr ? 'Patenata' : 'Patents'}</p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
                <Calendar className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-4xl font-black text-white">2027</p>
                <p className="text-slate-400">{isSr ? 'EXPO Beograd' : 'EXPO Belgrade'}</p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center">
                <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-4xl font-black text-white">N+1</p>
                <p className="text-slate-400">{isSr ? 'Redundancija' : 'Redundancy'}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Investment Ask - 5min only */}
        <AnimatePresence>
          {showFull && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-cyan-950/50 to-purple-950/50 border border-cyan-500/30 rounded-2xl p-8 text-center"
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                {isSr ? 'INVESTICIONA PRILIKA' : 'INVESTMENT OPPORTUNITY'}
              </h3>

              <div className="flex justify-center items-center gap-8 mb-6">
                <div>
                  <p className="text-5xl font-black text-cyan-400">€2.5M</p>
                  <p className="text-slate-400">Seed Round</p>
                </div>
                <ChevronRight className="w-8 h-8 text-slate-600" />
                <div>
                  <p className="text-5xl font-black text-purple-400">2027</p>
                  <p className="text-slate-400">MVP @ EXPO</p>
                </div>
              </div>

              <p className="text-slate-300 max-w-2xl mx-auto">
                {isSr
                  ? 'Modularna arhitektura koja skalira od e-bicikala do megavat-klase. Patentirana tehnologija, dokazan tim, jasan put do tržišta.'
                  : 'Modular architecture scaling from e-bikes to megawatt-class. Patented technology, proven team, clear path to market.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            {isSr ? 'Istraži ceo sajt' : 'Explore full site'}
            <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 mt-12">
        <p className="text-center text-slate-500 text-sm">
          ELEKTROKOMBINACIJA © 2026 • {isSr ? 'Modularna EV Infrastruktura' : 'Modular EV Infrastructure'}
        </p>
      </footer>
    </div>
  );
}
