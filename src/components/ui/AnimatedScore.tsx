import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { animateValue } from '@/utils/animation';

interface AnimatedScoreProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'display';
}

const sizeStyles = {
  sm: 'text-xl font-display',
  md: 'text-2xl font-display',
  lg: 'text-4xl font-display',
  display: 'text-6xl font-display',
};

export function AnimatedScore({
  value,
  duration = 600,
  delay = 0,
  className = '',
  size = 'display',
}: AnimatedScoreProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;

    const timeoutId = setTimeout(() => {
      hasAnimated.current = true;
      const cleanup = animateValue(0, value, duration, setDisplayValue);
      return cleanup;
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, duration, delay]);

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: delay / 1000,
        type: 'spring',
        stiffness: 150,
        damping: 20,
      }}
      className={`${sizeStyles[size]} text-accent-primary tabular-nums ${className}`}
    >
      {displayValue}
    </motion.span>
  );
}

/**
 * Animated percentage display (0-100)
 */
interface AnimatedPercentageProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
}

export function AnimatedPercentage({
  value,
  duration = 500,
  delay = 0,
  className = '',
}: AnimatedPercentageProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;

    const timeoutId = setTimeout(() => {
      hasAnimated.current = true;
      animateValue(0, value, duration, setDisplayValue);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, duration, delay]);

  return (
    <span className={`tabular-nums ${className}`}>
      {displayValue}
    </span>
  );
}

/**
 * Time display with animation
 */
interface AnimatedTimeProps {
  seconds: number;
  className?: string;
}

export function AnimatedTime({ seconds, className = '' }: AnimatedTimeProps) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`tabular-nums ${className}`}
    >
      {mins}:{secs.toString().padStart(2, '0')}
    </motion.span>
  );
}
