import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  size?: number;
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

const colorStyles = {
  primary: 'border-foundation-400 border-t-accent-primary',
  secondary: 'border-foundation-300 border-t-text-secondary',
  white: 'border-white/30 border-t-white',
};

export function LoadingSpinner({
  size = 24,
  color = 'primary',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <motion.div
      className={`border-2 rounded-full ${colorStyles[color]} ${className}`}
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

/**
 * Delayed spinner - only shows after a delay to avoid flash for quick loads
 */
interface DelayedSpinnerProps extends LoadingSpinnerProps {
  delay?: number;
}

export function DelayedSpinner({
  delay = 300,
  ...props
}: DelayedSpinnerProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <LoadingSpinner {...props} />
    </motion.div>
  );
}

/**
 * Full-page loading state with centered spinner
 */
interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-foundation-100 gap-4">
      <DelayedSpinner size={32} delay={200} />
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-body text-sm text-text-secondary"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

/**
 * Three-dot loading indicator
 */
export function LoadingDots({
  size = 6,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="rounded-full bg-accent-primary"
          style={{ width: size, height: size }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
