import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { audioManager } from '@/audio';
import { useSettingsStore } from '@/stores';

interface IconButtonProps {
  icon: ReactNode;
  onClick: () => void;
  'aria-label': string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function IconButton({
  icon,
  onClick,
  'aria-label': ariaLabel,
  className = '',
  size = 'md',
}: IconButtonProps) {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  const sizes = {
    sm: 'w-8 h-8 min-w-[44px] min-h-[44px]',
    md: 'w-10 h-10 min-w-[44px] min-h-[44px]',
    lg: 'w-12 h-12 min-w-[44px] min-h-[44px]',
  };

  const handleClick = () => {
    audioManager.play('button_tap');
    onClick();
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`
        ${sizes[size]}
        flex items-center justify-center
        text-text-secondary hover:text-text-primary
        transition-colors rounded-full
        focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2
        ${className}
      `}
      whileHover={reduceMotion ? undefined : { scale: 1.1 }}
      whileTap={reduceMotion ? undefined : { scale: 0.95 }}
      aria-label={ariaLabel}
    >
      {icon}
    </motion.button>
  );
}

// Settings gear icon
export function SettingsIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
