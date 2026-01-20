import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Zap, CheckCircle, AlertCircle, Activity } from 'lucide-react';

/**
 * LLC Resonance Visualization.
 * Shows resonant frequency, switching frequency, duty cycle,
 * ZVS status, and voltage conversion chain.
 */
export default function LLCResonanceViz({ modules = [], gridState = null }) {
  // Animate frequency sweep
  const [sweepPhase, setSweepPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSweepPhase(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Calculate LLC stats from modules
  const llcStats = useMemo(() => {
    if (!modules || modules.length === 0) {
      return {
        resonantFreq: 200, // kHz
        switchingFreq: 185, // kHz
        dutyCycle: 45, // %
        zvsActive: true,
        inputVoltage: 650, // V DC
        outputVoltage: 400, // V DC
        activeModules: 0,
        avgGain: 0.62,
      };
    }

    // Active modules
    const activeModules = modules.filter(m => m.state === 'active' || m.state === 'v2g');

    // Resonant frequency is fixed by design (LC tank)
    const resonantFreq = 200; // kHz (typical for LLC)

    // Switching frequency varies with load (below resonance for boost, at/above for buck)
    // Typical range: 150-250 kHz
    const avgLoad = activeModules.length > 0
      ? activeModules.reduce((sum, m) => sum + (m.powerOut || 0), 0) / (activeModules.length * 3300)
      : 0;
    const switchingFreq = 200 - avgLoad * 50; // Higher load = lower frequency

    // Duty cycle (simplified - near 50% for LLC)
    const dutyCycle = 45 + avgLoad * 10;

    // ZVS (Zero Voltage Switching) - active when switching freq < resonant freq
    const zvsActive = switchingFreq <= resonantFreq;

    // Voltages
    const inputVoltage = 650; // DC link from grid
    const outputVoltage = 400; // Battery voltage

    // Gain: Vout/Vin ratio
    const avgGain = outputVoltage / inputVoltage;

    return {
      resonantFreq,
      switchingFreq,
      dutyCycle,
      zvsActive,
      inputVoltage,
      outputVoltage,
      activeModules: activeModules.length,
      avgGain,
    };
  }, [modules]);

  // Generate frequency response curve points
  const freqResponseCurve = useMemo(() => {
    const points = [];
    for (let f = 100; f <= 300; f += 5) {
      // Simplified LLC gain curve (peaks near resonant frequency)
      const normalizedFreq = f / llcStats.resonantFreq;
      let gain;
      if (normalizedFreq < 1) {
        // Below resonance - gain increases
        gain = 1 + 0.3 * Math.pow(1 - normalizedFreq, 2);
      } else {
        // Above resonance - gain decreases
        gain = 1 / (1 + 0.5 * Math.pow(normalizedFreq - 1, 1.5));
      }
      points.push({ freq: f, gain: Math.min(gain, 1.5) });
    }
    return points;
  }, [llcStats.resonantFreq]);

  // Calculate current operating point on curve
  const operatingPoint = useMemo(() => {
    const normalizedFreq = llcStats.switchingFreq / llcStats.resonantFreq;
    let gain;
    if (normalizedFreq < 1) {
      gain = 1 + 0.3 * Math.pow(1 - normalizedFreq, 2);
    } else {
      gain = 1 / (1 + 0.5 * Math.pow(normalizedFreq - 1, 1.5));
    }
    return {
      freq: llcStats.switchingFreq,
      gain: Math.min(gain, 1.5),
    };
  }, [llcStats.switchingFreq, llcStats.resonantFreq]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <Radio className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <motion.div
            className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        <h2 className="text-xl font-semibold text-white mb-1">LLC Converter Status</h2>
        <p className="text-sm text-slate-400">
          {llcStats.activeModules} modules active
        </p>
      </div>

      {/* Frequency & Duty Cycle Display */}
      <div className="w-full max-w-lg mb-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
        <div className="grid grid-cols-2 gap-6">
          {/* Resonant Frequency */}
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
              Resonant Frequency
            </div>
            <div className="text-3xl font-mono text-cyan-400">
              {llcStats.resonantFreq}
              <span className="text-lg text-slate-400 ml-1">kHz</span>
            </div>
            <div className="text-xs text-slate-500">LC tank design parameter</div>
          </div>

          {/* Switching Frequency */}
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">
              Switching Frequency
            </div>
            <div className="text-3xl font-mono text-purple-400">
              {llcStats.switchingFreq.toFixed(0)}
              <span className="text-lg text-slate-400 ml-1">kHz</span>
            </div>
            <div className="text-xs text-slate-500">Load-dependent</div>
          </div>
        </div>

        {/* Frequency visualization */}
        <div className="mt-4 h-8 bg-slate-700 rounded-full overflow-hidden relative">
          {/* Resonant marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-400"
            style={{ left: `${(llcStats.resonantFreq - 100) / 2}%` }}
          />

          {/* Switching marker */}
          <motion.div
            className="absolute top-0 bottom-0 w-1 bg-purple-400 rounded-full"
            style={{ left: `${(llcStats.switchingFreq - 100) / 2}%` }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />

          {/* Waveform animation */}
          <div className="absolute inset-0 flex items-center px-2">
            {Array(20).fill(null).map((_, i) => (
              <motion.div
                key={i}
                className="flex-1 mx-px"
                style={{
                  height: `${50 + Math.sin((sweepPhase + i * 5) * 0.1) * 40}%`,
                  backgroundColor: i < (llcStats.switchingFreq - 100) / 10
                    ? 'rgba(168, 85, 247, 0.5)'
                    : 'rgba(71, 85, 105, 0.5)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Frequency scale */}
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>100 kHz</span>
          <span>200 kHz (fr)</span>
          <span>300 kHz</span>
        </div>

        {/* Duty Cycle */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-400 uppercase tracking-wide">Duty Cycle</span>
            <span className="text-lg font-mono text-yellow-400">{llcStats.dutyCycle.toFixed(0)}%</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
              animate={{ width: `${llcStats.dutyCycle}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* ZVS Status */}
      <div className={`
        flex items-center gap-3 px-6 py-3 rounded-xl mb-8
        ${llcStats.zvsActive
          ? 'bg-green-500/20 border border-green-500/50'
          : 'bg-orange-500/20 border border-orange-500/50'}
      `}>
        {llcStats.zvsActive ? (
          <CheckCircle className="w-6 h-6 text-green-400" />
        ) : (
          <AlertCircle className="w-6 h-6 text-orange-400" />
        )}
        <div>
          <div className={`font-medium ${llcStats.zvsActive ? 'text-green-400' : 'text-orange-400'}`}>
            ZVS {llcStats.zvsActive ? 'ACTIVE' : 'INACTIVE'}
          </div>
          <div className="text-xs text-slate-400">
            {llcStats.zvsActive ? 'Soft switching - minimal switching losses' : 'Hard switching - increased losses'}
          </div>
        </div>
      </div>

      {/* Voltage Conversion Chain */}
      <div className="w-full max-w-lg mb-8">
        <div className="text-xs text-slate-400 uppercase tracking-wide mb-3">
          Voltage Conversion Chain
        </div>
        <div className="flex items-center justify-center gap-4">
          {/* Input */}
          <div className="text-center p-4 bg-slate-800 border border-slate-600 rounded-xl">
            <div className="text-xs text-slate-400 mb-1">DC Link</div>
            <div className="text-2xl font-mono text-cyan-400">
              {llcStats.inputVoltage}V
            </div>
            <div className="text-xs text-slate-500">from Grid</div>
          </div>

          {/* Arrow */}
          <motion.div
            className="flex items-center"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Zap className="w-8 h-8 text-purple-400" />
          </motion.div>

          {/* LLC Tank */}
          <div className="text-center p-4 bg-purple-500/20 border border-purple-500/50 rounded-xl">
            <div className="text-xs text-purple-400 mb-1">LLC Tank</div>
            <Activity className="w-8 h-8 text-purple-400 mx-auto" />
            <div className="text-xs text-slate-400 mt-1">
              Gain: {operatingPoint.gain.toFixed(2)}
            </div>
          </div>

          {/* Arrow */}
          <motion.div
            className="flex items-center"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
          >
            <Zap className="w-8 h-8 text-green-400" />
          </motion.div>

          {/* Output */}
          <div className="text-center p-4 bg-slate-800 border border-slate-600 rounded-xl">
            <div className="text-xs text-slate-400 mb-1">Output</div>
            <div className="text-2xl font-mono text-green-400">
              {llcStats.outputVoltage}V
            </div>
            <div className="text-xs text-slate-500">to Battery</div>
          </div>
        </div>
      </div>

      {/* Frequency Response Curve */}
      <div className="w-full max-w-lg">
        <div className="text-xs text-slate-400 uppercase tracking-wide mb-3">
          Frequency Response (Gain vs Frequency)
        </div>
        <div className="h-32 bg-slate-800/50 border border-slate-700 rounded-lg p-4 relative">
          <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="40" x2="200" y2="40" stroke="rgba(100,116,139,0.3)" strokeDasharray="2" />
            <line x1="100" y1="0" x2="100" y2="80" stroke="rgba(100,116,139,0.3)" strokeDasharray="2" />

            {/* Gain curve */}
            <path
              d={`M ${freqResponseCurve.map((p, i) =>
                `${(p.freq - 100) * 1} ${80 - p.gain * 50}`
              ).join(' L ')}`}
              fill="none"
              stroke="rgba(168, 85, 247, 0.5)"
              strokeWidth="2"
            />

            {/* Operating point */}
            <motion.circle
              cx={(operatingPoint.freq - 100) * 1}
              cy={80 - operatingPoint.gain * 50}
              r="4"
              fill="#a855f7"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />

            {/* Resonant frequency marker */}
            <line
              x1={(llcStats.resonantFreq - 100) * 1}
              y1="0"
              x2={(llcStats.resonantFreq - 100) * 1}
              y2="80"
              stroke="#22d3ee"
              strokeWidth="1"
              strokeDasharray="4"
            />
          </svg>

          {/* Labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-slate-500 px-1">
            <span>100kHz</span>
            <span className="text-cyan-400">fr=200kHz</span>
            <span>300kHz</span>
          </div>
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-500 py-1">
            <span>1.5</span>
            <span>1.0</span>
            <span>0.5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
