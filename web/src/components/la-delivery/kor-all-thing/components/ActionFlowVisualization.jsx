import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Cpu,
  Radio,
  Activity,
  Shield,
  Zap
} from 'lucide-react';

/**
 * Action Flow Visualization
 * Shows step-by-step execution of AI decisions
 */

const FLOW_STEPS = [
  { id: 'received', label: 'DECISION RECEIVED', icon: CheckCircle },
  { id: 'validate', label: 'VALIDATING OPTIONS', icon: Cpu },
  { id: 'dispatch', label: 'DISPATCHING COMMANDS', icon: Radio },
  { id: 'execute', label: 'EXECUTING', icon: Activity },
  { id: 'confirm', label: 'CONFIRMING RESULT', icon: Shield },
  { id: 'complete', label: 'COMPLETE', icon: CheckCircle },
];

export function ActionFlowVisualization({ action, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepDuration = 700;
    const progressIncrement = 5;

    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          if (currentStep < FLOW_STEPS.length - 1) {
            setCurrentStep(s => s + 1);
            return 0;
          } else {
            clearInterval(progressInterval);
            setTimeout(onComplete, 400);
            return 100;
          }
        }
        return p + progressIncrement;
      });
    }, stepDuration / (100 / progressIncrement));

    return () => clearInterval(progressInterval);
  }, [currentStep, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 flex items-center justify-center z-[9998] pointer-events-none"
    >
      <div className="bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl shadow-cyan-500/20">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">
              AI Optimization
            </span>
          </div>
          <div className="text-xl font-bold text-white">{action?.label}</div>
          <div className="text-sm text-slate-400 mt-1">{action?.description}</div>
        </div>

        {/* Flow Steps */}
        <div className="space-y-2">
          {FLOW_STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep;
            const isPending = index > currentStep;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  relative flex items-center gap-4 p-3 rounded-lg border transition-all
                  ${isActive ? 'bg-cyan-500/20 border-cyan-500/50' :
                    isComplete ? 'bg-emerald-500/10 border-emerald-500/30' :
                    'bg-white/5 border-white/10'}
                `}
              >
                {/* Icon */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${isActive ? 'bg-cyan-500/30' :
                      isComplete ? 'bg-emerald-500/30' :
                      'bg-white/10'}
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-cyan-400' :
                      isComplete ? 'text-emerald-400' :
                      'text-slate-500'
                    }`}
                  />
                </div>

                {/* Label */}
                <div className="flex-1">
                  <div
                    className={`text-sm font-mono ${
                      isActive ? 'text-cyan-400' :
                      isComplete ? 'text-emerald-400' :
                      'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </div>
                  {isActive && (
                    <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="text-right min-w-[40px]">
                  {isComplete && (
                    <span className="text-[10px] text-emerald-400 font-mono">✓ OK</span>
                  )}
                  {isActive && (
                    <span className="text-[10px] text-cyan-400 font-mono animate-pulse">
                      {progress}%
                    </span>
                  )}
                  {isPending && (
                    <span className="text-[10px] text-slate-600 font-mono">WAIT</span>
                  )}
                </div>

                {/* Connecting Line */}
                {index < FLOW_STEPS.length - 1 && (
                  <div
                    className={`
                      absolute left-7 top-full w-0.5 h-2
                      ${isComplete ? 'bg-emerald-500/50' : 'bg-white/10'}
                    `}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
            <motion.span
              className="w-2 h-2 rounded-full bg-cyan-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="font-mono uppercase tracking-wider">
              KorAllThing AI System
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ActionFlowVisualization;
