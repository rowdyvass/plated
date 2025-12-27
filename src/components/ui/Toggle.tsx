import { motion } from 'framer-motion';
import { useSettingsStore } from '@/stores';

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

export function Toggle({
  value,
  onChange,
  disabled,
  'aria-label': ariaLabel,
}: ToggleProps) {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  return (
    <button
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={`
        w-12 h-7 rounded-full transition-colors relative flex-shrink-0
        focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2
        ${value ? 'bg-accent-primary' : 'bg-foundation-500'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <motion.div
        className="w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm"
        initial={false}
        animate={{ left: value ? 26 : 4 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.2, ease: 'easeOut' }}
      />
    </button>
  );
}
