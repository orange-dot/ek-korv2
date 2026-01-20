import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu } from 'lucide-react';
import { useSimulation, SIM_MODES } from '../../context/SimulationContext';
import ProcessSelector from './ProcessSelector';
import ThermalChainViz from './ThermalChainViz';
import PowerDistViz from './PowerDistViz';
import DegradationViz from './DegradationViz';
import LLCResonanceViz from './LLCResonanceViz';

/**
 * Large central visualization of the current process/scenario.
 * Shows different visualizations based on selected process and simulation state.
 *
 * Supports 4 process views:
 * - thermal: 4-node temperature chain
 * - power: Load distribution and efficiency
 * - llc: LLC converter resonance details
 * - health: Degradation and RUL tracking
 */
export default function HAXProcessVisualization({
  currentPhase,
  selectedProcess = 'thermal',
  onSelectProcess,
  ambientTemp = 25,
  powerDemand = 150,
}) {
  const { mode, modules, gridState, liveSimState } = useSimulation();

  // Auto-select process based on phase if no explicit selection
  const effectiveProcess = useMemo(() => {
    if (selectedProcess) return selectedProcess;

    // Auto-select based on current phase
    const phaseId = currentPhase?.id || 'init';
    switch (phaseId) {
      case 'peak':
        return 'thermal';
      case 'failure':
        return 'health';
      case 'v2g':
        return 'power';
      default:
        return 'thermal';
    }
  }, [selectedProcess, currentPhase]);

  if (mode !== SIM_MODES.LIVE) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Cpu className="w-16 h-16 text-slate-600 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-500">Connecting to simulator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Process Selector Bar */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-slate-700/50">
        <ProcessSelector
          selected={effectiveProcess}
          onSelect={onSelectProcess}
          compact={false}
        />
      </div>

      {/* Main Visualization Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={effectiveProcess}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {effectiveProcess === 'thermal' && (
              <ThermalChainViz
                modules={modules}
                ambientTemp={ambientTemp}
              />
            )}
            {effectiveProcess === 'power' && (
              <PowerDistViz
                modules={modules}
                powerDemand={powerDemand}
              />
            )}
            {effectiveProcess === 'llc' && (
              <LLCResonanceViz
                modules={modules}
                gridState={gridState}
              />
            )}
            {effectiveProcess === 'health' && (
              <DegradationViz
                modules={modules}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
