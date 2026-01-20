import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable slider control for HAX demo.
 * Supports labels, units, min/max, warning states.
 */
export default function ControlSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  warning = false,
  warningThreshold,
  warningMessage,
  formatValue,
  disabled = false,
  compact = false,
}) {
  const [isDragging, setIsDragging] = useState(false);

  // Calculate percentage for visual display
  const percentage = ((value - min) / (max - min)) * 100;

  // Format the displayed value
  const displayValue = formatValue ? formatValue(value) : value;

  // Check if we're in warning state
  const isWarning = warning || (warningThreshold !== undefined && value < warningThreshold);

  // Handle slider change
  const handleChange = useCallback((e) => {
    const newValue = parseFloat(e.target.value);
    onChange?.(newValue);
  }, [onChange]);

  return (
    <div className={`${compact ? 'space-y-1' : 'space-y-2'}`}>
      {/* Label and value */}
      <div className="flex items-center justify-between">
        <label className={`font-medium ${compact ? 'text-xs' : 'text-sm'} ${isWarning ? 'text-yellow-400' : 'text-slate-300'}`}>
          {label}
        </label>
        <div className={`font-mono ${compact ? 'text-xs' : 'text-sm'} ${isWarning ? 'text-yellow-400' : 'text-white'}`}>
          {displayValue}
          {unit && <span className="text-slate-400 ml-1">{unit}</span>}
        </div>
      </div>

      {/* Slider track */}
      <div className="relative">
        <div className={`w-full ${compact ? 'h-2' : 'h-3'} bg-slate-700 rounded-full overflow-hidden`}>
          <motion.div
            className={`h-full rounded-full ${
              isWarning
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                : 'bg-gradient-to-r from-cyan-500 to-cyan-400'
            }`}
            style={{ width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: isDragging ? 0 : 0.15 }}
          />
        </div>

        {/* Actual range input (transparent, on top) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          disabled={disabled}
          className={`
            absolute inset-0 w-full opacity-0 cursor-pointer
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
          style={{ height: compact ? '8px' : '12px' }}
        />

        {/* Thumb indicator */}
        <motion.div
          className={`
            absolute top-1/2 -translate-y-1/2 -translate-x-1/2
            ${compact ? 'w-3 h-3' : 'w-4 h-4'}
            rounded-full border-2 border-white shadow-lg
            ${isWarning ? 'bg-yellow-500' : 'bg-cyan-500'}
            pointer-events-none
          `}
          style={{ left: `${percentage}%` }}
          animate={{ left: `${percentage}%` }}
          transition={{ duration: isDragging ? 0 : 0.15 }}
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-slate-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>

      {/* Warning message */}
      {isWarning && warningMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-yellow-400 mt-1"
        >
          ⚠ {warningMessage}
        </motion.div>
      )}
    </div>
  );
}
