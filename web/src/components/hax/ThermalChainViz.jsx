import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Thermometer, ArrowRight, AlertTriangle } from 'lucide-react';

/**
 * Thermal Chain Visualization.
 * Shows 4-node temperature flow: Junction (Tj) → Case (Tc) → Heatsink (Th) → Ambient (Ta)
 * With thermal resistances, heat flow animation, and derating curve.
 */
export default function ThermalChainViz({ modules = [], ambientTemp = 25 }) {
  // Calculate thermal stats from modules
  const thermalStats = useMemo(() => {
    if (!modules || modules.length === 0) {
      return {
        avgJunction: 45,
        avgCase: 40,
        avgHeatsink: 35,
        ambient: ambientTemp,
        maxJunction: 45,
        hotModules: [],
        efficiency: 0.96,
        deratingActive: false,
      };
    }

    // Get average temperatures
    const junctionTemps = modules.map(m => m.tempJunction || 45);
    const caseTemps = modules.map(m => m.tempCase || m.tempJunction * 0.85 || 40);
    const heatsinkTemps = modules.map(m => m.tempHeatsink || m.tempJunction * 0.7 || 35);

    const avgJunction = junctionTemps.reduce((a, b) => a + b, 0) / modules.length;
    const avgCase = caseTemps.reduce((a, b) => a + b, 0) / modules.length;
    const avgHeatsink = heatsinkTemps.reduce((a, b) => a + b, 0) / modules.length;
    const maxJunction = Math.max(...junctionTemps);

    // Find hot modules (above 80°C junction)
    const hotModules = modules
      .filter(m => (m.tempJunction || 45) > 80)
      .map(m => ({ id: m.slotIndex, temp: m.tempJunction }))
      .sort((a, b) => b.temp - a.temp)
      .slice(0, 5);

    // Calculate average efficiency
    const activeModules = modules.filter(m => m.efficiency > 0);
    const efficiency = activeModules.length > 0
      ? activeModules.reduce((sum, m) => sum + m.efficiency, 0) / activeModules.length
      : 0.96;

    // Derating active above 85°C
    const deratingActive = maxJunction > 85;

    return {
      avgJunction,
      avgCase,
      avgHeatsink,
      ambient: ambientTemp,
      maxJunction,
      hotModules,
      efficiency,
      deratingActive,
    };
  }, [modules, ambientTemp]);

  // Thermal resistance values (typical)
  const thermalResistances = {
    junctionToCase: 0.3,  // K/W
    caseToHeatsink: 0.15, // K/W
    heatsinkToAmbient: 0.6, // K/W
  };

  // Temperature color gradient
  const getTempColor = (temp) => {
    if (temp > 90) return 'text-red-400';
    if (temp > 80) return 'text-orange-400';
    if (temp > 70) return 'text-yellow-400';
    if (temp > 50) return 'text-cyan-400';
    return 'text-green-400';
  };

  const getTempBgColor = (temp) => {
    if (temp > 90) return 'bg-red-500/20 border-red-500';
    if (temp > 80) return 'bg-orange-500/20 border-orange-500';
    if (temp > 70) return 'bg-yellow-500/20 border-yellow-500';
    if (temp > 50) return 'bg-cyan-500/20 border-cyan-500';
    return 'bg-green-500/20 border-green-500';
  };

  // Calculate derating factor
  const deratingFactor = thermalStats.maxJunction > 85
    ? Math.max(0.5, 1 - (thermalStats.maxJunction - 85) * 0.02)
    : 1.0;

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      {/* Main thermal chain visualization */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          {/* Junction Node */}
          <ThermalNode
            label="JUNCTION"
            sublabel="Tj"
            temp={thermalStats.avgJunction}
            color={getTempBgColor(thermalStats.avgJunction)}
            textColor={getTempColor(thermalStats.avgJunction)}
          />

          {/* Rth Junction-Case */}
          <ThermalResistor
            value={thermalResistances.junctionToCase}
            heatFlow={thermalStats.avgJunction - thermalStats.avgCase}
          />

          {/* Case Node */}
          <ThermalNode
            label="CASE"
            sublabel="Tc"
            temp={thermalStats.avgCase}
            color={getTempBgColor(thermalStats.avgCase)}
            textColor={getTempColor(thermalStats.avgCase)}
          />

          {/* Rth Case-Heatsink */}
          <ThermalResistor
            value={thermalResistances.caseToHeatsink}
            heatFlow={thermalStats.avgCase - thermalStats.avgHeatsink}
          />

          {/* Heatsink Node */}
          <ThermalNode
            label="HEATSINK"
            sublabel="Th"
            temp={thermalStats.avgHeatsink}
            color={getTempBgColor(thermalStats.avgHeatsink)}
            textColor={getTempColor(thermalStats.avgHeatsink)}
          />

          {/* Rth Heatsink-Ambient */}
          <ThermalResistor
            value={thermalResistances.heatsinkToAmbient}
            heatFlow={thermalStats.avgHeatsink - thermalStats.ambient}
          />

          {/* Ambient Node */}
          <ThermalNode
            label="AMBIENT"
            sublabel="Ta"
            temp={thermalStats.ambient}
            color="bg-slate-700/50 border-slate-500"
            textColor="text-slate-300"
            isAmbient
          />
        </div>
      </div>

      {/* Heat flow indicator */}
      <div className="flex items-center gap-2 mb-8 text-sm">
        <Thermometer className="w-4 h-4 text-orange-400" />
        <span className="text-slate-400">Heat Flow:</span>
        <motion.div
          className="flex items-center"
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowRight className="w-5 h-5 text-orange-400" />
        </motion.div>
        <span className="text-orange-400 font-mono">
          {((thermalStats.avgJunction - thermalStats.ambient) /
            (thermalResistances.junctionToCase + thermalResistances.caseToHeatsink + thermalResistances.heatsinkToAmbient)
          ).toFixed(1)} W
        </span>
      </div>

      {/* Derating indicator */}
      {thermalStats.deratingActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-orange-500/20 border border-orange-500/50 rounded-lg"
        >
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          <span className="text-orange-400 font-medium">
            Thermal Derating Active: {(deratingFactor * 100).toFixed(0)}% capacity
          </span>
        </motion.div>
      )}

      {/* Efficiency vs Temperature graph (simplified) */}
      <div className="w-full max-w-md">
        <div className="text-xs text-slate-400 mb-2 uppercase tracking-wide">
          Efficiency vs Junction Temperature
        </div>
        <div className="relative h-16 bg-slate-700/50 rounded-lg overflow-hidden">
          {/* Graph background */}
          <div className="absolute inset-0 flex">
            <div className="flex-1 border-r border-slate-600/50" />
            <div className="flex-1 border-r border-slate-600/50" />
            <div className="flex-1 border-r border-slate-600/50" />
            <div className="flex-1" />
          </div>

          {/* Efficiency curve (simplified) */}
          <svg className="absolute inset-0 w-full h-full">
            <path
              d="M 0,10 Q 100,10 150,15 T 250,25 T 350,50"
              fill="none"
              stroke="rgba(34, 211, 238, 0.5)"
              strokeWidth="2"
            />
            {/* Current operating point */}
            <motion.circle
              cx={(thermalStats.avgJunction - 25) / 75 * 350}
              cy={10 + (100 - thermalStats.efficiency * 100) * 0.5}
              r="6"
              fill="#22d3ee"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </svg>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[10px] text-slate-500">
            <span>25°C</span>
            <span>50°C</span>
            <span>75°C</span>
            <span>100°C</span>
          </div>
        </div>

        {/* Current efficiency */}
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-slate-400">Current Efficiency</span>
          <span className={`font-mono ${thermalStats.efficiency > 0.95 ? 'text-green-400' : 'text-yellow-400'}`}>
            {(thermalStats.efficiency * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Hot modules list */}
      {thermalStats.hotModules.length > 0 && (
        <div className="mt-8 w-full max-w-md">
          <div className="text-xs text-slate-400 mb-2 uppercase tracking-wide">
            Hottest Modules
          </div>
          <div className="flex flex-wrap gap-2">
            {thermalStats.hotModules.map(m => (
              <div
                key={m.id}
                className={`
                  px-3 py-1 rounded-full text-sm font-mono
                  ${m.temp > 90 ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                    'bg-orange-500/20 text-orange-400 border border-orange-500/50'}
                `}
              >
                #{m.id}: {m.temp.toFixed(0)}°C
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ThermalNode({ label, sublabel, temp, color, textColor, isAmbient = false }) {
  return (
    <motion.div
      className={`
        flex flex-col items-center justify-center w-24 h-24 rounded-xl border-2
        ${color}
      `}
      whileHover={{ scale: 1.05 }}
    >
      <span className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</span>
      <span className={`text-3xl font-mono font-bold ${textColor}`}>
        {temp.toFixed(0)}
      </span>
      <span className={`text-sm ${textColor}`}>°C</span>
      <span className="text-[10px] text-slate-500 mt-1">{sublabel}</span>
    </motion.div>
  );
}

function ThermalResistor({ value, heatFlow }) {
  return (
    <div className="flex flex-col items-center">
      {/* Arrow with animation */}
      <motion.div
        className="relative w-12 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {/* Heat flow particles */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-400 rounded-full"
          animate={{ x: [0, 48, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
      {/* Resistance value */}
      <span className="text-[10px] text-slate-500 mt-1">
        {value} K/W
      </span>
    </div>
  );
}
