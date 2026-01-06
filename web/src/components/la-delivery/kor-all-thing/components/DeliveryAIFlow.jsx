import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Cpu, Brain, Zap, Workflow } from 'lucide-react';

/**
 * AI Flow visualization showing the 4-stage pipeline
 * SENSE → ANALYZE → DECIDE → ACT
 */

const STAGES = [
  { id: 'sense', label: 'SENSE', icon: Eye, color: 'cyan', description: 'Gathering fleet telemetry' },
  { id: 'analyze', label: 'ANALYZE', icon: Cpu, color: 'purple', description: 'Processing patterns' },
  { id: 'decide', label: 'DECIDE', icon: Brain, color: 'amber', description: 'Evaluating options' },
  { id: 'act', label: 'ACT', icon: Zap, color: 'emerald', description: 'Executing commands' },
];

const colorClasses = {
  cyan: {
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/50',
    text: 'text-cyan-400',
    glow: 'shadow-cyan-500/30'
  },
  purple: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/30'
  },
  amber: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/30'
  },
  emerald: {
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/50',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/30'
  }
};

export function DeliveryAIFlow({ activeStage = 'sense' }) {
  const activeIndex = STAGES.findIndex(s => s.id === activeStage);

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Workflow className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-medium text-white uppercase tracking-wider">
          AI Decision Flow
        </span>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
          ACTIVE
        </span>
      </div>

      {/* Flow Visualization */}
      <div className="relative flex items-center justify-between">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-white/10 -translate-y-1/2" />

        {/* Progress Line */}
        <motion.div
          className="absolute top-1/2 left-8 h-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 -translate-y-1/2"
          initial={{ width: 0 }}
          animate={{
            width: `${Math.max(0, ((activeIndex) / (STAGES.length - 1)) * (100 - 16))}%`
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />

        {/* Stages */}
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const colors = colorClasses[stage.color];
          const isActive = stage.id === activeStage;
          const isComplete = index < activeIndex;
          const isPending = index > activeIndex;

          return (
            <motion.div
              key={stage.id}
              className="relative flex flex-col items-center z-10"
              animate={isActive ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
            >
              {/* Stage Circle */}
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  border-2 transition-all duration-300
                  ${isActive ? `${colors.bg} ${colors.border} shadow-lg ${colors.glow}` :
                    isComplete ? `bg-emerald-500/20 border-emerald-500/50` :
                    `bg-white/5 border-white/20`}
                `}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? colors.text :
                    isComplete ? 'text-emerald-400' :
                    'text-slate-500'
                  }`}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[10px] mt-2 font-medium tracking-wider ${
                  isActive ? colors.text :
                  isComplete ? 'text-emerald-400' :
                  'text-slate-500'
                }`}
              >
                {stage.label}
              </span>

              {/* Active Description */}
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-6 text-[9px] text-slate-400 whitespace-nowrap"
                >
                  {stage.description}
                </motion.span>
              )}

              {/* Pulse Animation for Active */}
              {isActive && (
                <motion.div
                  className={`absolute w-12 h-12 rounded-full ${colors.bg} opacity-50`}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut'
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default DeliveryAIFlow;
