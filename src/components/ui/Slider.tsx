interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  disabled?: boolean;
  'aria-label'?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.2,
  showValue = true,
  formatValue = (v) => `${Math.round(v * 100)}%`,
  disabled,
  'aria-label': ariaLabel,
}: SliderProps) {
  return (
    <div className="flex items-center gap-4 w-full">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={formatValue(value)}
        className={`
          flex-1 h-2 rounded-full appearance-none cursor-pointer
          bg-foundation-300
          focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-accent-primary
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-moz-range-thumb]:w-5
          [&::-moz-range-thumb]:h-5
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-accent-primary
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:shadow-md
          [&::-moz-range-thumb]:cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      />
      {showValue && (
        <span className="text-sm text-text-tertiary w-12 text-right tabular-nums">
          {formatValue(value)}
        </span>
      )}
    </div>
  );
}
