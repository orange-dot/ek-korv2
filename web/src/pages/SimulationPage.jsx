import { SimulationProvider } from '../context/SimulationContext';
import SimulationMap from '../components/simulation/SimulationMap';
import SimulationControls from '../components/simulation/SimulationControls';
import CitySelector from '../components/simulation/CitySelector';
import KorHUD from '../components/simulation/KorHUD';
import BusDetailModal from '../components/simulation/BusDetailModal';

export default function SimulationPage() {
  return (
    <SimulationProvider>
      <div className="h-screen w-screen bg-[#050508] overflow-hidden relative">
        {/* Map Container - z-index 0, lowest layer */}
        <div className="absolute inset-0 z-0 flex items-center justify-center p-4 pt-20 pb-24 pl-36 pr-80">
          <div className="relative w-full h-full max-w-5xl max-h-[700px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan-500/10">
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

        {/* City Selector - z-index 30 */}
        <div className="absolute top-4 right-4 z-30">
          <CitySelector />
        </div>

        {/* Playback Controls - z-index 20 */}
        <div className="z-20">
          <SimulationControls />
        </div>

        {/* KorHUD Overlay - z-index 40, above everything except modal */}
        <div className="z-40">
          <KorHUD />
        </div>

        {/* Bus Detail Modal - z-index 50, above everything */}
        <BusDetailModal />
      </div>
    </SimulationProvider>
  );
}
