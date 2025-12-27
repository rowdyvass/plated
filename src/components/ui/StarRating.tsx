import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { StarRating as StarRatingType } from '@/types';
import { audioManager } from '@/audio';

interface StarRatingProps {
  rating: StarRatingType;
  size?: 'sm' | 'md' | 'lg' | 'display';
  animated?: boolean;
  startDelay?: number;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
  display: 40,
};

// Glow effect for filled stars
function StarGlow({ size, delay }: { size: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.5, 1.8] }}
      transition={{
        delay,
        duration: 0.6,
        ease: 'easeOut',
      }}
      className="absolute inset-0 rounded-full bg-accent-star/30 blur-md pointer-events-none"
      style={{ width: size * 1.5, height: size * 1.5, left: -size * 0.25, top: -size * 0.25 }}
    />
  );
}

function Star({
  filled,
  size,
  delay,
  animated,
  isEarned,
}: {
  filled: boolean;
  size: number;
  delay: number;
  animated: boolean;
  isEarned: boolean;
}) {
  return (
    <motion.div className="relative">
      {/* Glow effect for earned stars */}
      {animated && isEarned && <StarGlow size={size} delay={delay} />}

      <motion.svg
        initial={animated ? { scale: 0, rotate: -180, opacity: 0 } : false}
        animate={{
          scale: 1,
          rotate: 0,
          opacity: 1,
        }}
        transition={
          animated
            ? {
                delay,
                type: 'spring',
                stiffness: 250,
                damping: 15,
              }
            : { duration: 0 }
        }
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={filled ? '#D4AF37' : 'none'}
        stroke={filled ? '#D4AF37' : '#D4C9BB'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={filled ? 'drop-shadow-sm' : ''}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </motion.svg>

      {/* Subtle shine effect for filled stars */}
      {animated && isEarned && (
        <motion.div
          initial={{ opacity: 0, x: -size }}
          animate={{ opacity: [0, 0.8, 0], x: size }}
          transition={{
            delay: delay + 0.3,
            duration: 0.4,
            ease: 'easeOut',
          }}
          className="absolute inset-0 overflow-hidden pointer-events-none"
        >
          <div
            className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12"
            style={{ top: 0, left: 0 }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

export function StarRating({
  rating,
  size = 'md',
  animated = true,
  startDelay = 0.8,
}: StarRatingProps) {
  const starSize = sizeMap[size];
  const gapClass = size === 'display' ? 'gap-3' : size === 'lg' ? 'gap-2' : 'gap-1';
  const hasPlayedRef = useRef(false);

  // Play star reveal sounds when animated and rating > 0
  useEffect(() => {
    if (animated && rating > 0 && !hasPlayedRef.current) {
      hasPlayedRef.current = true;
      // Play staggered chimes for each star earned
      for (let i = 0; i < rating; i++) {
        audioManager.playStarReveal(i);
      }
    }
  }, [animated, rating]);

  return (
    <div
      className={`flex ${gapClass}`}
      role="img"
      aria-label={`${rating} out of 3 stars`}
    >
      {[1, 2, 3].map((star, index) => {
        const isEarned = star <= rating;
        const delay = animated ? startDelay + index * 0.2 : 0;

        return (
          <Star
            key={star}
            filled={isEarned}
            size={starSize}
            delay={delay}
            animated={animated}
            isEarned={isEarned}
          />
        );
      })}
    </div>
  );
}

/**
 * Inline star reveal for smaller contexts
 */
export function StarReveal({
  stars,
  size = 'md',
}: {
  stars: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const starSize = sizeMap[size];

  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.8 + i * 0.2,
            duration: 0.2,
            ease: 'easeOut',
          }}
          className={i <= stars ? 'text-accent-star' : 'text-foundation-500'}
          style={{ fontSize: starSize }}
        >
          {i <= stars ? '\u2605' : '\u2606'}
        </motion.span>
      ))}
    </div>
  );
}
