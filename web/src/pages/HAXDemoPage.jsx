import { useState, useEffect, useCallback, useRef, Component } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, Loader2, AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { SimulationProvider, useSimulation, SIM_MODES } from '../context/SimulationContext';
import { useHAXDemoSequence } from '../hooks/useHAXDemoSequence';
import { useHAXControls } from '../hooks/useHAXControls';
import ModuleGridPanel from '../components/simulation/ModuleGridPanel';
import HAXHeader from '../components/hax/HAXHeader';
import PhaseIndicator from '../components/hax/PhaseIndicator';
import HAXProcessVisualization from '../components/hax/HAXProcessVisualization';
import HAXControlPanel from '../components/hax/HAXControlPanel';
import KORTerminal from '../components/hax/KORTerminal';

/**
 * Error boundary to catch React errors and show a recovery UI.
 */
class HAXErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[HAX Demo] Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-[#050508] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Demo Error</h2>
            <p className="text-slate-400 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl transition-colors"
            >
              <RefreshCw className="w-5 h-5 inline-block mr-2" />
              Reload Demo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HAX Demo landing screen shown before the demo starts.
 */
function HAXLandingScreen({ onStart, isConnecting, isConnected, error, onRetry }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#050508]">
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center max-w-2xl mx-auto px-8"
      >
        {/* Logo */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl shadow-2xl shadow-cyan-500/30">
            <span className="text-4xl font-bold text-white">EK</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-bold text-white mb-4 tracking-tight"
        >
          ELEKTROKOMBINACIJA
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-slate-300 mb-2"
        >
          Modular EV Charging Infrastructure
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-cyan-400 mb-12 italic"
        >
          "Simulation before silicon"
        </motion.p>

        {/* Demo highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-6 mb-12"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-1">84</div>
            <div className="text-sm text-slate-400">Physics Models</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">10,000</div>
            <div className="text-sm text-slate-400">Ticks/Second</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">50ms</div>
            <div className="text-sm text-slate-400">Fault Recovery</div>
          </div>
        </motion.div>

        {/* Start button or status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {error ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Retry Connection
              </button>
            </div>
          ) : isConnecting ? (
            <div className="flex items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              <span className="text-lg">Connecting to physics engine...</span>
            </div>
          ) : isConnected ? (
            <button
              onClick={onStart}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xl font-semibold rounded-2xl shadow-2xl shadow-cyan-500/30 transition-all transform hover:scale-105"
            >
              <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Start Demo
            </button>
          ) : (
            <div className="flex items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-lg">Initializing...</span>
            </div>
          )}
        </motion.div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-sm text-slate-500"
        >
          Press F11 for fullscreen experience
        </motion.p>
      </motion.div>
    </div>
  );
}

/**
 * Main HAX Demo content with the simulation visualization.
 * New layout with Control Panel on the right.
 */
function HAXDemoContent() {
  const {
    mode,
    setMode,
    isConnected,
    connectionError,
    sendSimCommand,
    triggerSimScenario,
    injectFault,
    distributeRackPower,
    modules,
    gridState,
  } = useSimulation();

  const [hasStarted, setHasStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const containerRef = useRef(null);

  // HAX demo sequence hook
  const demoSequence = useHAXDemoSequence({
    triggerScenario: triggerSimScenario,
    sendCommand: sendSimCommand,
    isConnected,
  });

  // HAX controls hook for interactive controls
  const haxControls = useHAXControls({
    sendCommand: sendSimCommand,
    injectFault,
    distributeRackPower,
    modules,
    gridState,
    isConnected,
  });

  // Auto-connect to live simulator on mount
  useEffect(() => {
    if (mode !== SIM_MODES.LIVE) {
      setIsConnecting(true);
      setMode(SIM_MODES.LIVE);
    }
  }, [mode, setMode]);

  // Update connecting state when connection status changes
  useEffect(() => {
    if (isConnected) {
      setIsConnecting(false);
    }
  }, [isConnected]);

  // Handle retry connection
  const handleRetry = useCallback(() => {
    setIsConnecting(true);
    setMode(SIM_MODES.LOCAL); // Reset
    setTimeout(() => {
      setMode(SIM_MODES.LIVE);
    }, 500);
  }, [setMode]);

  // Start the demo
  const handleStart = useCallback(() => {
    setHasStarted(true);
    demoSequence.start();
  }, [demoSequence]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Show landing screen if demo hasn't started
  if (!hasStarted) {
    return (
      <div ref={containerRef} className="h-screen w-screen">
        <HAXLandingScreen
          onStart={handleStart}
          isConnecting={isConnecting}
          isConnected={isConnected}
          error={connectionError}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-screen w-screen bg-[#050508] overflow-hidden relative flex">
      {/* HAX Header */}
      <HAXHeader
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        isConnected={isConnected}
      />

      {/* Module Grid Panel - LEFT */}
      <div className="relative z-40 flex-shrink-0 h-full pt-16">
        <ModuleGridPanel
          onSelectModule={haxControls.setSelectedModule}
          onInjectFault={haxControls.injectFault}
          onForceV2G={haxControls.forceV2G}
          onResetModule={haxControls.resetModule}
        />
      </div>

      {/* Main Content - Process Visualization */}
      <div className="flex-1 flex pt-16 pb-24">
        {/* Center: Process Visualization */}
        <div className="flex-1 h-full overflow-hidden">
          <HAXProcessVisualization
            currentPhase={demoSequence.currentPhase}
            selectedProcess={haxControls.selectedProcess}
            onSelectProcess={haxControls.setSelectedProcess}
            ambientTemp={haxControls.ambientTemp}
            powerDemand={haxControls.powerDemand}
          />
        </div>

        {/* Right Side Panel: Control Panel + KOR Terminal */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-3 p-3 h-full">
          {/* Control Panel */}
          <div className="flex-1 min-h-0">
            <HAXControlPanel
              powerDemand={haxControls.powerDemand}
              gridFrequency={haxControls.gridFrequency}
              ambientTemp={haxControls.ambientTemp}
              selectedModule={haxControls.selectedModule}
              onPowerChange={haxControls.setPowerDemand}
              onFrequencyChange={haxControls.setGridFrequency}
              onAmbientChange={haxControls.setAmbientTemp}
              onInjectFault={haxControls.injectFault}
              warnings={haxControls.warnings}
              isPending={haxControls.isPending}
              disabled={!isConnected}
              compact={false}
            />
          </div>

          {/* KOR Terminal (small) */}
          <div className="h-48 flex-shrink-0">
            <KORTerminal compact />
          </div>
        </div>
      </div>

      {/* Phase Indicator - bottom */}
      <PhaseIndicator
        currentPhase={demoSequence.currentPhase}
        currentPhaseIndex={demoSequence.currentPhaseIndex}
        totalPhases={demoSequence.totalPhases}
        phaseProgress={demoSequence.phaseProgress}
        demoProgress={demoSequence.demoProgress}
        isPlaying={demoSequence.isPlaying}
        isConnected={isConnected}
        onTogglePlayPause={demoSequence.togglePlayPause}
        onReset={demoSequence.reset}
        phases={demoSequence.phases}
        onGoToPhase={demoSequence.goToPhase}
      />

      {/* Connection lost overlay */}
      <AnimatePresence>
        {!isConnected && hasStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center max-w-md mx-auto px-8"
            >
              <WifiOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Connection Lost</h2>
              <p className="text-slate-400 mb-6">
                Lost connection to the physics engine. Attempting to reconnect...
              </p>
              <div className="flex items-center justify-center gap-4">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                <button
                  onClick={handleRetry}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl transition-colors"
                >
                  <RefreshCw className="w-5 h-5 inline-block mr-2" />
                  Reconnect
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo complete overlay */}
      <AnimatePresence>
        {demoSequence.isComplete && isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center max-w-lg mx-auto px-8"
            >
              <h2 className="text-4xl font-bold text-white mb-4">Demo Complete</h2>
              <p className="text-lg text-slate-300 mb-8">
                This is simulation before silicon. The same approach SpaceX uses for Falcon 9.
                We de-risk hardware decisions before spending money on hardware.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => demoSequence.reset()}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                >
                  <RefreshCw className="w-5 h-5 inline-block mr-2" />
                  Restart Demo
                </button>
                <button
                  onClick={() => demoSequence.start()}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-xl transition-colors"
                >
                  <Play className="w-5 h-5 inline-block mr-2" />
                  Play Again
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * HAX Demo Page with SimulationProvider wrapper and error boundary.
 */
export default function HAXDemoPage() {
  return (
    <HAXErrorBoundary>
      <SimulationProvider>
        <HAXDemoContent />
      </SimulationProvider>
    </HAXErrorBoundary>
  );
}
