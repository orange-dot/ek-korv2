import { motion } from 'framer-motion';
import { useSimulation } from '../../context/SimulationContext';
import { MapPin, Bus, Zap, Route, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const cityList = [
  { id: 'noviSad', name: 'Novi Sad', code: 'NS' },
  { id: 'beograd', name: 'Beograd', code: 'BG' },
  { id: 'kragujevac', name: 'Kragujevac', code: 'KG' },
];

export default function CitySelector() {
  const { cityId, changeCity, city } = useSimulation();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-cyan-500/10 blur-xl" />

      {/* Main container */}
      <div className="relative bg-black/60 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
        {/* Top accent */}
        <div className="absolute top-0 left-2 right-2 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        <div className="flex items-center">
          {/* Home link */}
          <Link
            to="/"
            className="flex items-center justify-center w-10 h-10 border-r border-white/10 text-slate-500 hover:text-cyan-400 hover:bg-white/5 transition-all"
            title="Nazad na početnu"
          >
            <Home className="w-4 h-4" />
          </Link>

          {/* City selector */}
          <div className="flex items-center p-1">
            {cityList.map((c, i) => (
              <button
                key={c.id}
                onClick={() => changeCity(c.id)}
                className={`relative px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all ${
                  cityId === c.id
                    ? 'text-cyan-400'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {/* Active indicator */}
                {cityId === c.id && (
                  <motion.div
                    layoutId="cityIndicator"
                    className="absolute inset-0 bg-cyan-500/20 rounded border border-cyan-500/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{c.name}</span>
              </button>
            ))}
          </div>

          {/* City stats */}
          <div className="hidden lg:flex items-center gap-3 px-3 border-l border-white/10 text-[10px] font-mono text-slate-500">
            <div className="flex items-center gap-1">
              <Bus className="w-3 h-3 text-cyan-500/50" />
              <span>{city?.busCount || 10}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-500/50" />
              <span>{city?.stations?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Route className="w-3 h-3 text-purple-500/50" />
              <span>{city?.routes?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
