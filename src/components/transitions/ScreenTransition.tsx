import { motion, Variants, Transition } from 'framer-motion';
import { ReactNode } from 'react';

type TransitionType = 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale';

interface ScreenTransitionProps {
  children: ReactNode;
  type?: TransitionType;
  className?: string;
  delay?: number;
}

const variants: Record<TransitionType, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
  },
};

const transitions: Record<TransitionType, Transition> = {
  fade: { duration: 0.3, ease: 'easeInOut' },
  slideUp: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  slideDown: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  slideLeft: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  slideRight: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  scale: { duration: 0.25, ease: 'easeOut' },
};

export function ScreenTransition({
  children,
  type = 'fade',
  className = '',
  delay = 0,
}: ScreenTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants[type]}
      transition={{ ...transitions[type], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Page wrapper with full-height fade transition
 * Use this as the root wrapper for each screen
 */
export function PageTransition({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`h-full w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered container for animating children sequentially
 */
interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className = '',
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        initial: {},
        animate: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered item for use inside StaggerContainer
 */
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function StaggerItem({
  children,
  className = '',
  direction = 'up',
}: StaggerItemProps) {
  const offset = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { x: 20, y: 0 },
    right: { x: -20, y: 0 },
  };

  return (
    <motion.div
      variants={{
        initial: { opacity: 0, ...offset[direction] },
        animate: { opacity: 1, x: 0, y: 0 },
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Crossfade transition for smooth content switching
 */
export function CrossfadeTransition({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Plate completion transition - scale up with glow effect
 * For use in game completion flow
 */
export function PlateCompleteTransition({
  children,
  onComplete,
  className = '',
}: {
  children: ReactNode;
  onComplete?: () => void;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={{ scale: 1.02 }}
      transition={{
        duration: 0.4,
        ease: 'easeOut',
      }}
      onAnimationComplete={onComplete}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Results reveal transition with scale spring
 */
export function ResultsRevealTransition({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
