/**
 * Leek - Leek preparations for fine dining
 * Includes velouté base visual
 */

import { IngredientBase, lighten, darken } from '../base';
import { IngredientBaseProps } from '../base/types';

/**
 * LeekVeloute - Smooth leek velouté pool
 */
export function LeekVeloute({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  const baseColor = '#E8DCC8';
  const highlight = lighten(baseColor, 0.2);
  const shadowColor = darken(baseColor, 0.1);

  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={64}
      baseHeight={48}
    >
      <svg width="100%" height="100%" viewBox="0 0 64 48" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="velouteGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor={highlight} />
            <stop offset="60%" stopColor={baseColor} />
            <stop offset="100%" stopColor={shadowColor} />
          </radialGradient>
        </defs>

        {/* Organic pool shape */}
        <path
          d="M 10 28 Q 4 20, 12 12 Q 24 4, 40 8 Q 56 12, 58 24 Q 60 36, 48 42 Q 32 48, 16 42 Q 6 38, 10 28 Z"
          fill="url(#velouteGrad)"
        />

        {/* Surface sheen */}
        <ellipse cx="24" cy="20" rx="12" ry="8" fill={highlight} opacity="0.4" />

        {/* Small highlight spot */}
        <ellipse cx="20" cy="16" rx="4" ry="3" fill="white" opacity="0.3" />

        {/* Subtle ripple marks */}
        <path
          d="M 20 30 Q 32 26, 44 30"
          fill="none"
          stroke={shadowColor}
          strokeWidth="0.5"
          opacity="0.3"
        />
      </svg>
    </IngredientBase>
  );
}

/**
 * LeekRing - Thinly sliced leek ring
 */
export function LeekRing({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={20}
      baseHeight={20}
    >
      <svg width="100%" height="100%" viewBox="0 0 20 20" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="leekRingGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#E8F0E0" />
            <stop offset="100%" stopColor="#C8D8C0" />
          </radialGradient>
        </defs>

        {/* Outer ring */}
        <circle cx="10" cy="10" r="8" fill="url(#leekRingGrad)" />

        {/* Inner hole */}
        <circle cx="10" cy="10" r="4" fill="#F5F8F0" />

        {/* Layer rings visible */}
        <circle cx="10" cy="10" r="6" fill="none" stroke="#C8D8C0" strokeWidth="0.5" opacity="0.6" />
        <circle cx="10" cy="10" r="7" fill="none" stroke="#B8C8B0" strokeWidth="0.3" opacity="0.5" />

        {/* Highlight */}
        <ellipse cx="7" cy="7" rx="2" ry="1.5" fill="white" opacity="0.4" />
      </svg>
    </IngredientBase>
  );
}

/**
 * BabyLeek - Whole baby leek
 */
export function BabyLeek({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={16}
      baseHeight={56}
    >
      <svg width="100%" height="100%" viewBox="0 0 16 56" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="leekWhiteGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#F5F8F0" />
            <stop offset="100%" stopColor="#E8F0E0" />
          </linearGradient>
          <linearGradient id="leekGreenGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4A8C4A" />
            <stop offset="100%" stopColor="#2D6B2D" />
          </linearGradient>
        </defs>

        {/* Root end */}
        <path d="M 8 56 L 6 54 L 8 52 L 10 54 Z" fill="#C8B898" />
        <path d="M 8 56 Q 7 55, 5 56" stroke="#A89878" strokeWidth="0.5" fill="none" />
        <path d="M 8 56 Q 9 55, 11 56" stroke="#A89878" strokeWidth="0.5" fill="none" />

        {/* White bulb portion */}
        <path
          d="M 4 52 Q 3 44, 4 36 Q 5 28, 6 24 L 10 24 Q 11 28, 12 36 Q 13 44, 12 52 Z"
          fill="url(#leekWhiteGrad)"
        />

        {/* Green leaves */}
        <path
          d="M 6 24 Q 2 16, 0 4 Q 2 8, 6 20"
          fill="url(#leekGreenGrad)"
        />
        <path
          d="M 8 24 Q 8 12, 8 0 Q 8 12, 8 22"
          fill="url(#leekGreenGrad)"
        />
        <path
          d="M 10 24 Q 14 16, 16 4 Q 14 8, 10 20"
          fill="url(#leekGreenGrad)"
        />

        {/* Layer lines on white portion */}
        <path d="M 5 40 L 11 40" stroke="#D8E0D0" strokeWidth="0.3" opacity="0.5" />
        <path d="M 4 46 L 12 46" stroke="#D8E0D0" strokeWidth="0.3" opacity="0.5" />

        {/* Highlight */}
        <path d="M 5 36 Q 5 44, 5 50" stroke="#FFFFF8" strokeWidth="1" opacity="0.4" />
      </svg>
    </IngredientBase>
  );
}
