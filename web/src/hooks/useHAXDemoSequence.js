import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * HAX Demo sequence configuration.
 * Each phase has a scenario to trigger, duration, title, and talking points.
 */
export const HAX_DEMO_SEQUENCE = [
  {
    id: 'init',
    scenario: null,
    duration: 10,
    title: 'System Initialization',
    subtitle: 'Connecting to physics engine',
    talkingPoint: '84 physics models initializing at 10,000 ticks per second...',
    color: 'cyan',
  },
  {
    id: 'baseline',
    scenario: 'normal',
    duration: 30,
    title: 'System Baseline',
    subtitle: 'Normal operation',
    talkingPoint: 'Each module: thermal model, electrical model, reliability model. Real physics.',
    color: 'green',
  },
  {
    id: 'peak',
    scenario: 'peak',
    duration: 45,
    title: 'Peak Demand Stress',
    subtitle: '250kW demand spike',
    talkingPoint: '250kW spike incoming. Watch the thermal derating kick in automatically.',
    color: 'yellow',
  },
  {
    id: 'failure',
    scenario: 'module-failure',
    duration: 60,
    title: 'Failure & Self-Healing',
    subtitle: 'Module 42 fault detected',
    talkingPoint: 'Module 42 just failed. Watch the swarm redistribute in 50 milliseconds. Zero human intervention.',
    color: 'red',
  },
  {
    id: 'v2g',
    scenario: 'v2g-response',
    duration: 45,
    title: 'V2G Grid Response',
    subtitle: 'Grid frequency dip to 49.8 Hz',
    talkingPoint: 'Grid unstable at 49.8 Hz. Our buses aren\'t just charging - they\'re exporting power to stabilize.',
    color: 'purple',
  },
  {
    id: 'summary',
    scenario: null,
    duration: 10,
    title: 'Summary',
    subtitle: 'Simulation before silicon',
    talkingPoint: 'This is de-risking hardware decisions before spending money on hardware. The SpaceX approach.',
    color: 'cyan',
  },
];

/**
 * Hook to manage the HAX demo sequence flow.
 * Handles auto-advancing through phases, pause/resume, and progress tracking.
 */
export function useHAXDemoSequence({ triggerScenario, sendCommand, isConnected }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedAtRef = useRef(null);

  const currentPhase = HAX_DEMO_SEQUENCE[currentPhaseIndex];
  const totalDuration = HAX_DEMO_SEQUENCE.reduce((sum, p) => sum + p.duration, 0);

  // Calculate overall demo progress
  const demoProgress = (() => {
    const completedDuration = HAX_DEMO_SEQUENCE.slice(0, currentPhaseIndex)
      .reduce((sum, p) => sum + p.duration, 0);
    const currentPhaseDuration = currentPhase?.duration || 0;
    const currentPhaseProgress = phaseProgress * currentPhaseDuration;
    return (completedDuration + currentPhaseProgress) / totalDuration;
  })();

  // Clear timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Advance to next phase
  const advancePhase = useCallback(async () => {
    const nextIndex = currentPhaseIndex + 1;

    if (nextIndex >= HAX_DEMO_SEQUENCE.length) {
      // Demo complete
      setIsPlaying(false);
      setIsComplete(true);
      clearTimer();
      return;
    }

    setCurrentPhaseIndex(nextIndex);
    setPhaseProgress(0);
    startTimeRef.current = performance.now();

    // Trigger the scenario for the new phase
    const nextPhase = HAX_DEMO_SEQUENCE[nextIndex];
    if (nextPhase.scenario && isConnected) {
      await triggerScenario(nextPhase.scenario);
    }
  }, [currentPhaseIndex, triggerScenario, isConnected, clearTimer]);

  // Update progress
  const updateProgress = useCallback(() => {
    if (!isPlaying || !startTimeRef.current) return;

    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const duration = currentPhase?.duration || 1;
    const progress = Math.min(elapsed / duration, 1);

    setPhaseProgress(progress);

    if (progress >= 1) {
      advancePhase();
    } else {
      timerRef.current = requestAnimationFrame(updateProgress);
    }
  }, [isPlaying, currentPhase, advancePhase]);

  // Start the demo
  const start = useCallback(async () => {
    if (isComplete) {
      // Reset if demo was complete
      setCurrentPhaseIndex(0);
      setPhaseProgress(0);
      setIsComplete(false);
    }

    setIsPlaying(true);
    setHasStarted(true);
    startTimeRef.current = performance.now();
    pausedAtRef.current = null;

    // Start the simulation if connected
    if (isConnected) {
      await sendCommand('start');
      await sendCommand('setTimeScale', 10);

      // Trigger the current phase's scenario
      if (currentPhase?.scenario) {
        await triggerScenario(currentPhase.scenario);
      }
    }

    timerRef.current = requestAnimationFrame(updateProgress);
  }, [isComplete, isConnected, sendCommand, triggerScenario, currentPhase, updateProgress]);

  // Pause the demo
  const pause = useCallback(async () => {
    setIsPlaying(false);
    clearTimer();
    pausedAtRef.current = phaseProgress;

    if (isConnected) {
      await sendCommand('pause');
    }
  }, [clearTimer, phaseProgress, isConnected, sendCommand]);

  // Resume the demo
  const resume = useCallback(async () => {
    setIsPlaying(true);

    // Adjust start time based on paused progress
    const duration = currentPhase?.duration || 1;
    const elapsedSeconds = (pausedAtRef.current || 0) * duration;
    startTimeRef.current = performance.now() - (elapsedSeconds * 1000);

    if (isConnected) {
      await sendCommand('resume');
    }

    timerRef.current = requestAnimationFrame(updateProgress);
  }, [currentPhase, isConnected, sendCommand, updateProgress]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (hasStarted) {
      resume();
    } else {
      start();
    }
  }, [isPlaying, hasStarted, pause, resume, start]);

  // Reset to beginning
  const reset = useCallback(async () => {
    clearTimer();
    setIsPlaying(false);
    setCurrentPhaseIndex(0);
    setPhaseProgress(0);
    setHasStarted(false);
    setIsComplete(false);
    startTimeRef.current = null;
    pausedAtRef.current = null;

    if (isConnected) {
      await sendCommand('stop');
    }
  }, [clearTimer, isConnected, sendCommand]);

  // Skip to a specific phase
  const goToPhase = useCallback(async (index) => {
    if (index < 0 || index >= HAX_DEMO_SEQUENCE.length) return;

    clearTimer();
    setCurrentPhaseIndex(index);
    setPhaseProgress(0);
    startTimeRef.current = performance.now();

    const targetPhase = HAX_DEMO_SEQUENCE[index];
    if (targetPhase.scenario && isConnected) {
      await triggerScenario(targetPhase.scenario);
    }

    if (isPlaying) {
      timerRef.current = requestAnimationFrame(updateProgress);
    }
  }, [clearTimer, isConnected, triggerScenario, isPlaying, updateProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    // State
    isPlaying,
    hasStarted,
    isComplete,
    currentPhaseIndex,
    currentPhase,
    phaseProgress,
    demoProgress,
    totalPhases: HAX_DEMO_SEQUENCE.length,
    phases: HAX_DEMO_SEQUENCE,

    // Actions
    start,
    pause,
    resume,
    togglePlayPause,
    reset,
    goToPhase,
  };
}
