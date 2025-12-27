import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { audioManager } from '@/audio';
import { useSettingsStore } from '@/stores/settingsStore';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  onClick,
  disabled,
  type = 'button',
}: ButtonProps) {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  const baseStyles = `
    font-display font-medium tracking-[0.15em] uppercase
    transition-all duration-300 ease-out
    focus:outline-none focus-visible:ring-2 focus-visible:ring-copper/50 focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-gradient-to-b from-copper to-[#9A5F2A]
      text-white
      border border-[#A86830]/30
      shadow-[0_2px_8px_rgba(184,115,51,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]
      hover:shadow-[0_4px_16px_rgba(184,115,51,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]
      hover:from-[#C4813D] hover:to-[#A86830]
      active:shadow-[0_1px_4px_rgba(184,115,51,0.2),inset_0_2px_4px_rgba(0,0,0,0.1)]
    `,
    secondary: `
      bg-gradient-to-b from-foundation-200 to-foundation-300
      text-text-primary
      border border-foundation-500/40
      shadow-[0_2px_6px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.8)]
      hover:shadow-[0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]
      hover:border-copper/40
      active:shadow-[0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_2px_rgba(0,0,0,0.05)]
    `,
    ghost: `
      bg-transparent
      text-text-secondary
      border border-transparent
      hover:bg-foundation-200/60
      hover:text-text-primary
      hover:border-foundation-400/30
    `,
  };

  const sizes = {
    sm: 'px-6 py-2.5 text-xs rounded-lg',
    md: 'px-10 py-3.5 text-sm rounded-xl',
    lg: 'px-14 py-4 text-base rounded-xl',
  };

  const handleClick = () => {
    audioManager.play('button_tap');
    onClick?.();
  };

  return (
    <motion.button
      whileHover={reduceMotion ? undefined : { scale: 1.02, y: -1 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98, y: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </motion.button>
  );
}

