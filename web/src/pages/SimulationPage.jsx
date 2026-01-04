import { AnimatePresence } from 'framer-motion';
import { SimulationProvider, useSimulation } from '../context/SimulationContext';
import SimulationMap from '../components/simulation/SimulationMap';
import SimulationControls from '../components/simulation/SimulationControls';
import CitySelector from '../components/simulation/CitySelector';
import KorHUD from '../components/simulation/KorHUD';
import BusDetailPanel from '../components/simulation/BusDetailPanel';
import KorAllThingPanel from '../components/simulation/KorAllThingPanel';

// Inner component to access simulation context
function SimulationContent() {
  const { selectedItem, korAllThingExpanded } = useSimulation();

  return (
    <div className="h-screen w-screen bg-[#050508] overflow-hidden relative flex">
      {/* KorAllThing Panel - LEFT SIDE (always visible) */}
      <div className="relative z-40 flex-shrink-0 h-full">
        <KorAllThingPanel />
      </div>

      {/* Main Content Area - Map + Dynamic Content */}
      <AnimatePresence>
        {!korAllThingExpanded && (
          <div className="flex-1 relative flex">
            {/* Map Container - ~1/3 of remaining space */}
            <div className="w-[35%] min-w-[300px] max-w-[500px] p-4 pt-16 pb-24 flex-shrink-0">
              <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan-500/10">
                {/* Map glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-50" />

                {/* Map frame */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyan-500/50 rounded-tl-lg z-10" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-cyan-500/50 rounded-tr-lg z-10" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-cyan-500/50 rounded-bl-lg z-10" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-cyan-500/50 rounded-br-lg z-10" />

                  {/* The map */}
                  <SimulationMap />
                </div>
              </div>
            </div>

            {/* Dynamic Content - RIGHT SIDE (stats, decisions, panels) */}
            <div className="flex-1 relative">
              {/* City Selector - top right */}
              <div className="absolute top-4 right-4 z-30">
                <CitySelector />
              </div>

              {/* KorHUD Overlay - the main dynamic content */}
              <div className="absolute inset-0 z-20 pointer-events-none">
                <KorHUD />
              </div>

              {/* Bus Detail Panel */}
              <AnimatePresence>
                {selectedItem?.type === 'bus' && (
                  <BusDetailPanel />
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Playback Controls - bottom center, always visible */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <SimulationControls />
      </div>
    </div>
  );
}

export default function SimulationPage() {
  return (
    <SimulationProvider>
      <SimulationContent />
    </SimulationProvider>
  );
}
