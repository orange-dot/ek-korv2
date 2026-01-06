import { Activity, Zap, ArrowDown, ArrowUp, Circle } from 'lucide-react';

/**
 * Grid frequency indicator for V2G visualization.
 * Shows real-time grid frequency with color coding:
 * - Green: 49.95-50.05 Hz (normal)
 * - Yellow: 49.8-49.95 or 50.05-50.2 Hz (minor deviation)
 * - Red: <49.8 or >50.2 Hz (V2G activation zone)
 */
export default function GridFrequencyIndicator({ gridState, compact = false }) {
  const frequency = gridState?.frequency ?? 50.0;
  const voltage = gridState?.voltage ?? 400;
  const v2gEnabled = gridState?.v2gEnabled ?? false;
  const v2gPower = gridState?.v2gPower ?? 0;
  const loadDemand = gridState?.loadDemand ?? 0;

  // Determine frequency status and color
  const getFrequencyStatus = (freq) => {
    const deviation = Math.abs(freq - 50.0);
    if (deviation <= 0.05) {
      return { status: 'normal', color: 'green', label: 'Normal' };
    } else if (deviation <= 0.2) {
      return { status: 'warning', color: 'yellow', label: 'Deviation' };
    } else {
      return { status: 'critical', color: 'red', label: 'V2G Active' };
    }
  };

  const freqStatus = getFrequencyStatus(frequency);

  // Color classes based on status
  const colorClasses = {
    green: {
      bg: 'bg-green-500/20',
      border: 'border-green-500/50',
      text: 'text-green-400',
      glow: '',
    },
    yellow: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      glow: '',
    },
    red: {
      bg: 'bg-red-500/20',
      border: 'border-red-500/50',
      text: 'text-red-400',
      glow: 'shadow-lg shadow-red-500/30',
    },
  };

  const colors = colorClasses[freqStatus.color];

  // Power flow direction
  const isExporting = v2gPower < 0;
  const isImporting = v2gPower > 0;
  const powerMagnitude = Math.abs(v2gPower / 1000).toFixed(1); // kW

  if (compact) {
    // Compact version for header/navbar
    return (
      <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${colors.bg} ${colors.border} border ${colors.glow}`}>
        <Activity className={`w-4 h-4 ${colors.text}`} />
        <span className={`font-mono font-bold ${colors.text}`}>
          {frequency.toFixed(2)} Hz
        </span>
        {v2gEnabled && (
          <div className="flex items-center space-x-1">
            {isExporting ? (
              <ArrowUp className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            ) : isImporting ? (
              <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Circle className="w-3 h-3 text-purple-400" />
            )}
          </div>
        )}
      </div>
    );
  }

  // Full version for dashboard
  return (
    <div className={`rounded-xl ${colors.bg} ${colors.border} border p-4 ${colors.glow}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Activity className={`w-5 h-5 ${colors.text}`} />
          <span className="text-sm font-medium text-slate-300">Grid Status</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
          {freqStatus.label}
        </span>
      </div>

      {/* Frequency Display */}
      <div className="text-center mb-4">
        <div className={`text-3xl font-mono font-bold ${colors.text}`}>
          {frequency.toFixed(3)} Hz
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Target: 50.000 Hz
        </div>
      </div>

      {/* Frequency Bar */}
      <div className="relative h-2 bg-slate-700 rounded-full mb-4 overflow-hidden">
        <div className="absolute inset-0 flex">
          {/* Red zone left */}
          <div className="w-[10%] bg-red-500/30" />
          {/* Yellow zone left */}
          <div className="w-[15%] bg-yellow-500/30" />
          {/* Green zone */}
          <div className="w-[50%] bg-green-500/30" />
          {/* Yellow zone right */}
          <div className="w-[15%] bg-yellow-500/30" />
          {/* Red zone right */}
          <div className="w-[10%] bg-red-500/30" />
        </div>
        {/* Current frequency marker */}
        <div
          className={`absolute top-0 w-1 h-full ${colors.text.replace('text-', 'bg-')} rounded-full transition-all duration-300`}
          style={{
            left: `${Math.max(0, Math.min(100, ((frequency - 49) / 2) * 100))}%`,
          }}
        />
      </div>

      {/* Scale */}
      <div className="flex justify-between text-xs text-slate-500 mb-4">
        <span>49 Hz</span>
        <span>50 Hz</span>
        <span>51 Hz</span>
      </div>

      {/* V2G Status */}
      <div className="border-t border-slate-700 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Zap className={`w-4 h-4 ${v2gEnabled ? 'text-purple-400' : 'text-slate-500'}`} />
            <span className="text-sm text-slate-400">V2G Mode</span>
          </div>
          <span className={`text-sm font-medium ${v2gEnabled ? 'text-purple-400' : 'text-slate-500'}`}>
            {v2gEnabled ? 'Active' : 'Standby'}
          </span>
        </div>

        {v2gEnabled && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isExporting ? (
                <>
                  <ArrowUp className="w-4 h-4 text-purple-400 animate-pulse" />
                  <span className="text-sm text-purple-400">Exporting</span>
                </>
              ) : isImporting ? (
                <>
                  <ArrowDown className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-cyan-400">Importing</span>
                </>
              ) : (
                <>
                  <Circle className="w-3 h-3 text-slate-400" />
                  <span className="text-sm text-slate-400">Idle</span>
                </>
              )}
            </div>
            <span className={`text-sm font-mono font-bold ${isExporting ? 'text-purple-400' : 'text-cyan-400'}`}>
              {powerMagnitude} kW
            </span>
          </div>
        )}
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-700">
        <div className="text-center">
          <div className="text-xs text-slate-500">Voltage</div>
          <div className="text-sm font-mono text-slate-300">{voltage.toFixed(0)} V</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-500">Load</div>
          <div className="text-sm font-mono text-slate-300">{(loadDemand / 1000).toFixed(1)} kW</div>
        </div>
      </div>
    </div>
  );
}
