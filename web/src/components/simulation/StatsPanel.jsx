import { motion } from 'framer-motion';
import { Bus, Zap, Battery, Activity } from 'lucide-react';
import { useSimulation, BUS_STATES } from '../../context/SimulationContext';

export default function StatsPanel() {
  const { buses, chargingStations } = useSimulation();

  // Calculate metrics
  const totalBuses = buses.length;
  const drivingBuses = buses.filter(b => b.state === BUS_STATES.DRIVING).length;
  const chargingBuses = buses.filter(b => b.state === BUS_STATES.CHARGING).length;
  const avgBattery = buses.length > 0
    ? Math.round(buses.reduce((sum, b) => sum + b.batteryLevel, 0) / buses.length)
    : 0;
  const totalPower = chargingStations.reduce((sum, s) => sum + s.currentPower, 0);
  const activeStations = chargingStations.filter(s => s.busesCharging.length > 0).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute top-4 right-4 bg-primary/90 backdrop-blur-md rounded-xl border border-border p-4 w-48"
    >
      <div className="space-y-3">
        {/* Active buses */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-cyan/20 flex items-center justify-center">
              <Bus className="w-4 h-4 text-accent-cyan" />
            </div>
            <span className="text-xs text-slate-400">Aktivno</span>
          </div>
          <span className="text-lg font-bold text-white">{drivingBuses}/{totalBuses}</span>
        </div>

        {/* Charging */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-green/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent-green" />
            </div>
            <span className="text-xs text-slate-400">Puni se</span>
          </div>
          <span className="text-lg font-bold text-accent-green">{chargingBuses}</span>
        </div>

        {/* Battery */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              avgBattery > 50 ? 'bg-accent-green/20' : 'bg-yellow-500/20'
            }`}>
              <Battery className={`w-4 h-4 ${avgBattery > 50 ? 'text-accent-green' : 'text-yellow-500'}`} />
            </div>
            <span className="text-xs text-slate-400">Prosek</span>
          </div>
          <span className={`text-lg font-bold ${avgBattery > 50 ? 'text-accent-green' : 'text-yellow-500'}`}>
            {avgBattery}%
          </span>
        </div>

        {/* Power */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-accent-purple" />
            </div>
            <span className="text-xs text-slate-400">Snaga</span>
          </div>
          <span className="text-lg font-bold text-accent-purple">{totalPower} kW</span>
        </div>

        {/* Stations */}
        <div className="pt-2 border-t border-border">
          <div className="text-xs text-slate-500">
            Aktivne stanice: {activeStations}/{chargingStations.length}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
