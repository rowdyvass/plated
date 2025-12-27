import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning';
  animated?: boolean;
  delay?: number;
  duration?: number;
}

const sizeMap = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const variantMap = {
  default: 'bg-accent-primary',
  success: 'bg-state-success',
  warning: 'bg-state-warning',
};

function getVariantFromScore(score: number): 'default' | 'success' | 'warning' {
  if (score >= 85) return 'success';
  if (score >= 55) return 'default';
  return 'warning';
}

export function ProgressBar({
  value,
  size = 'md',
  variant,
  animated = true,
  delay = 0,
  duration = 0.6,
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const resolvedVariant = variant ?? getVariantFromScore(clampedValue);

  return (
    <div
      className={`w-full ${sizeMap[size]} bg-foundation-400 rounded-full overflow-hidden`}
      role="progressbar"
      aria-valuenow={Math.round(clampedValue)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={`h-full ${variantMap[resolvedVariant]} rounded-full origin-left`}
        initial={animated ? { scaleX: 0 } : { scaleX: clampedValue / 100 }}
        animate={{ scaleX: clampedValue / 100 }}
        transition={
          animated
            ? {
                delay,
                duration,
                ease: [0.4, 0, 0.2, 1], // Custom ease for smooth fill
              }
            : { duration: 0 }
        }
        style={{ width: '100%' }}
      />
    </div>
  );
}

/**
 * Animated progress bar with label
 */
interface LabeledProgressBarProps extends ProgressBarProps {
  label: string;
  showValue?: boolean;
}

export function LabeledProgressBar({
  label,
  value,
  showValue = true,
  delay = 0,
  ...props
}: LabeledProgressBarProps) {
  const id = `progress-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay * 0.8, duration: 0.4 }}
      className="flex items-center gap-4"
    >
      <span id={id} className="w-24 text-text-secondary font-body text-sm">
        {label}
      </span>
      <div className="flex-1" role="progressbar" aria-labelledby={id} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
        <ProgressBar value={value} delay={delay} {...props} />
      </div>
      {showValue && (
        <span className="w-8 text-right font-body text-sm text-text-primary tabular-nums" aria-hidden="true">
          {Math.round(value)}
        </span>
      )}
    </motion.div>
  );
}
