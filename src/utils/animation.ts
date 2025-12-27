// Animation utilities for smooth, polished transitions

/**
 * Easing functions for animations
 */
export const easings = {
  linear: (t: number) => t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
  easeInOut: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInCubic: (t: number) => t * t * t,
  easeOutBack: (t: number) =>
    1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

export type EasingFunction = keyof typeof easings;

/**
 * Promise-based animation for PixiJS objects
 */
export function animate<T extends object>(
  target: T,
  property: keyof T & string,
  from: number,
  to: number,
  duration: number,
  easing: EasingFunction = 'easeOut'
): Promise<void> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const easingFn = easings[easing];

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);

      (target as Record<string, number>)[property] = from + (to - from) * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    };

    tick();
  });
}

/**
 * Animate a scale property (x and y together)
 */
export function animateScale(
  target: { x: number; y: number },
  from: number,
  to: number,
  duration: number,
  easing: EasingFunction = 'easeOut'
): Promise<void> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const easingFn = easings[easing];

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);

      const value = from + (to - from) * easedProgress;
      target.x = value;
      target.y = value;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    };

    tick();
  });
}

/**
 * Delay utility (Promise-based setTimeout)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Lerp between two colors (returns hex number)
 */
export function lerpColor(from: number, to: number, t: number): number {
  const fromR = (from >> 16) & 0xff;
  const fromG = (from >> 8) & 0xff;
  const fromB = from & 0xff;

  const toR = (to >> 16) & 0xff;
  const toG = (to >> 8) & 0xff;
  const toB = to & 0xff;

  const r = Math.round(fromR + (toR - fromR) * t);
  const g = Math.round(fromG + (toG - fromG) * t);
  const b = Math.round(fromB + (toB - fromB) * t);

  return (r << 16) | (g << 8) | b;
}

/**
 * Animation sequence runner - runs animations in sequence
 */
export async function sequence(...animations: (() => Promise<void>)[]): Promise<void> {
  for (const animation of animations) {
    await animation();
  }
}

/**
 * Animation parallel runner - runs animations in parallel
 */
export function parallel(...animations: Promise<void>[]): Promise<void[]> {
  return Promise.all(animations);
}

/**
 * Create a spring-like bounce animation
 */
export function springBounce(
  target: Record<string, number>,
  property: string,
  from: number,
  to: number,
  duration: number = 400,
  bounceScale: number = 1.1
): Promise<void> {
  return new Promise(async (resolve) => {
    const overshoot = to + (to - from) * (bounceScale - 1);

    // First phase: overshoot
    await animate(target, property, from, overshoot, duration * 0.6, 'easeOut');

    // Second phase: settle back
    await animate(target, property, overshoot, to, duration * 0.4, 'easeInOut');

    resolve();
  });
}

/**
 * Framer Motion page transition variants
 */
export const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const pageTransition = {
  duration: 0.3,
  ease: 'easeInOut',
};

/**
 * Staggered children animation for Framer Motion
 */
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/**
 * Button press variants for Framer Motion
 */
export const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  pressed: { scale: 0.98 },
};

export const buttonTransition = {
  duration: 0.1,
  ease: 'easeOut',
};

/**
 * Card tap variants for Framer Motion
 */
export const cardVariants = {
  idle: { scale: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  hover: { scale: 1.01, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  pressed: { scale: 0.99, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  selected: {
    scale: 1,
    borderColor: 'rgba(184, 115, 51, 0.3)',
  },
};

/**
 * Toast animation variants for Framer Motion
 */
export const toastVariants = {
  initial: { opacity: 0, y: 10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -5, scale: 0.98 },
};

export const toastTransition = {
  enter: { duration: 0.2, ease: 'easeOut' },
  exit: { duration: 0.15, ease: 'easeIn' },
};

/**
 * Ingredient tray animation variants for Framer Motion
 */
export const trayVariants = {
  initial: { opacity: 0, y: 40, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: 20,
    scale: 0.98,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

/**
 * Float animation for ingredient preview
 */
export const floatAnimation = {
  y: [0, -3, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

/**
 * Timer colors for different phases
 */
export const TIMER_COLORS = {
  comfortable: 0xb87333, // Copper/accent
  warning: 0xb8860b, // Dark goldenrod
  critical: 0x8b4049, // Muted red
} as const;

/**
 * Placement quality bounce scales
 */
export const PLACEMENT_BOUNCE = {
  perfect: 1.08,
  great: 1.05,
  good: 1.03,
  acceptable: 1.02,
  miss: 1.0,
} as const;

/**
 * Score counter animation (for React useState)
 */
export function animateValue(
  from: number,
  to: number,
  duration: number,
  onUpdate: (value: number) => void,
  easing: EasingFunction = 'easeOutCubic'
): () => void {
  const startTime = performance.now();
  const easingFn = easings[easing];
  let animationFrame: number;

  const tick = () => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easingFn(progress);

    const value = Math.round(from + (to - from) * easedProgress);
    onUpdate(value);

    if (progress < 1) {
      animationFrame = requestAnimationFrame(tick);
    }
  };

  animationFrame = requestAnimationFrame(tick);

  // Return cleanup function
  return () => cancelAnimationFrame(animationFrame);
}
