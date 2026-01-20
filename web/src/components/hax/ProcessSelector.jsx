import { motion } from 'framer-motion';
import { Thermometer, Zap, Radio, Heart } from 'lucide-react';

/**
 * Process selector bar with 4 clickable cards to switch visualization focus.
 *
 * Process types:
 * - thermal: 4-node temperature flow (Tj → Tc → Th → Ta)
 * - power: Load balancing, efficiency, loss heatmap
 * - llc: Frequency, duty cycle, ZVS status
 * - health: ESR/RdsOn trends, RUL, health score
 */

const PROCESSES = [
  {
    id: 'thermal',
    label: 'Thermal',
    shortLabel: 'THRM',
    icon: Thermometer,
    color: 'orange',
    description: 'Temperature chain & derating',
  },
  {
    id: 'power',
    label: 'Power',
    shortLabel: 'PWR',
    icon: Zap,
    color: 'cyan',
    description: 'Load distribution & efficiency',
  },
  {
    id: 'llc',
    label: 'LLC',
    shortLabel: 'LLC',
    icon: Radio,
    color: 'purple',
    description: 'Resonance & ZVS status',
  },
  {
    id: 'health',
    label: 'Health',
    shortLabel: 'HLTH',
    icon: Heart,
    color: 'green',
    description: 'Degradation & RUL tracking',
  },
];

const colorClasses = {
  orange: {
    active: 'bg-orange-500/20 border-orange-500 text-orange-400',
    inactive: 'border-slate-600 text-slate-400 hover:border-orange-500/50 hover:text-orange-400/80',
    icon: 'text-orange-400',
    glow: 'shadow-orange-500/30',
  },
  cyan: {
    active: 'bg-cyan-500/20 border-cyan-500 text-cyan-400',
    inactive: 'border-slate-600 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400/80',
    icon: 'text-cyan-400',
    glow: 'shadow-cyan-500/30',
  },
  purple: {
    active: 'bg-purple-500/20 border-purple-500 text-purple-400',
    inactive: 'border-slate-600 text-slate-400 hover:border-purple-500/50 hover:text-purple-400/80',
    icon: 'text-purple-400',
    glow: 'shadow-purple-500/30',
  },
  green: {
    active: 'bg-green-500/20 border-green-500 text-green-400',
    inactive: 'border-slate-600 text-slate-400 hover:border-green-500/50 hover:text-green-400/80',
    icon: 'text-green-400',
    glow: 'shadow-green-500/30',
  },
};

export default function ProcessSelector({ selected, onSelect, compact = false }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? 'gap-1' : 'gap-2'}`}>
      {PROCESSES.map((process) => {
        const isSelected = selected === process.id;
        const colors = colorClasses[process.color];
        const Icon = process.icon;

        return (
          <motion.button
            key={process.id}
            onClick={() => onSelect(process.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
              ${isSelected ? `${colors.active} shadow-lg ${colors.glow}` : colors.inactive}
              ${compact ? 'px-2 py-1.5' : 'px-3 py-2'}
            `}
          >
            <Icon className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} ${isSelected ? colors.icon : ''}`} />
            <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
              {compact ? process.shortLabel : process.label}
            </span>

            {/* Active indicator */}
            {isSelected && (
              <motion.div
                layoutId="process-indicator"
                className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full ${
                  process.color === 'orange' ? 'bg-orange-400' :
                  process.color === 'cyan' ? 'bg-cyan-400' :
                  process.color === 'purple' ? 'bg-purple-400' :
                  'bg-green-400'
                }`}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// Export process list for use in other components
export { PROCESSES };
