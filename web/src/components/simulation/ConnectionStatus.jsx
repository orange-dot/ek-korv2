import { useSimulation, SIM_MODES } from '../../context/SimulationContext';
import { Wifi, WifiOff, Monitor, Server, RefreshCw } from 'lucide-react';

/**
 * Connection status indicator for the simulation page.
 * Shows current mode (Local/Live) and connection state.
 */
export default function ConnectionStatus() {
  const { mode, isConnected, connectionError, setMode, liveSimState } = useSimulation();

  const isLive = mode === SIM_MODES.LIVE;

  return (
    <div className="flex items-center space-x-3">
      {/* Mode Toggle */}
      <div className="flex items-center bg-slate-700 rounded-lg p-0.5">
        <button
          onClick={() => setMode(SIM_MODES.LOCAL)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
            !isLive
              ? 'bg-slate-600 text-white'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Local</span>
        </button>
        <button
          onClick={() => setMode(SIM_MODES.LIVE)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
            isLive
              ? 'bg-cyan-600 text-white'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Live</span>
        </button>
      </div>

      {/* Connection Status (only in live mode) */}
      {isLive && (
        <div
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm ${
            isConnected
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4" />
              <span>Connected</span>
              {liveSimState?.running && (
                <span className="text-xs text-green-300 ml-1">
                  Tick #{liveSimState.tickCount}
                </span>
              )}
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>{connectionError || 'Disconnected'}</span>
              <RefreshCw className="w-3.5 h-3.5 animate-spin ml-1" />
            </>
          )}
        </div>
      )}

      {/* Local mode indicator */}
      {!isLive && (
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm bg-slate-600/50 text-slate-300">
          <Monitor className="w-4 h-4" />
          <span>Demo Mode</span>
        </div>
      )}
    </div>
  );
}
