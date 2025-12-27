/**
 * Capers - Brined capers for garnish
 * Small, dark green buds with characteristic texture
 */

import { IngredientBase } from '../base';
import { IngredientBaseProps } from '../base/types';

export function Caper({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={12}
      baseHeight={10}
    >
      <svg width="100%" height="100%" viewBox="0 0 12 10" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="caperGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#6B8E4C" />
            <stop offset="50%" stopColor="#4A6B3A" />
            <stop offset="100%" stopColor="#3D5A30" />
          </radialGradient>
        </defs>

        {/* Main caper body - slightly elongated sphere */}
        <ellipse cx="6" cy="5" rx="5" ry="4" fill="url(#caperGrad)" />

        {/* Bud texture - concentric layers */}
        <ellipse cx="6" cy="5" rx="3" ry="2.5" fill="none" stroke="#3D5A30" strokeWidth="0.3" opacity="0.4" />
        <ellipse cx="6" cy="5" rx="1.5" ry="1.2" fill="#4A6B3A" opacity="0.5" />

        {/* Highlight */}
        <ellipse cx="4.5" cy="4" rx="1.5" ry="1" fill="#8BAF6A" opacity="0.4" />

        {/* Stem remnant */}
        <ellipse cx="10" cy="5" rx="1" ry="0.8" fill="#5A7A4A" opacity="0.6" />
      </svg>
    </IngredientBase>
  );
}

/**
 * CaperScatter - Multiple capers scattered for garnish
 */
export function CaperScatter({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={36}
      baseHeight={28}
    >
      <svg width="100%" height="100%" viewBox="0 0 36 28" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="caperScatterGrad1" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#6B8E4C" />
            <stop offset="100%" stopColor="#3D5A30" />
          </radialGradient>
          <radialGradient id="caperScatterGrad2" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#5A7A40" />
            <stop offset="100%" stopColor="#3A5028" />
          </radialGradient>
        </defs>

        {/* Caper 1 */}
        <g transform="translate(6, 8)">
          <ellipse cx="4" cy="3" rx="4" ry="3" fill="url(#caperScatterGrad1)" />
          <ellipse cx="3" cy="2.5" rx="1" ry="0.8" fill="#8BAF6A" opacity="0.4" />
        </g>

        {/* Caper 2 */}
        <g transform="translate(18, 4) rotate(15)">
          <ellipse cx="3.5" cy="2.5" rx="3.5" ry="2.5" fill="url(#caperScatterGrad2)" />
          <ellipse cx="2.5" cy="2" rx="0.8" ry="0.6" fill="#7A9F5A" opacity="0.4" />
        </g>

        {/* Caper 3 */}
        <g transform="translate(26, 14) rotate(-10)">
          <ellipse cx="4" cy="3" rx="4" ry="3" fill="url(#caperScatterGrad1)" />
          <ellipse cx="3" cy="2.5" rx="1" ry="0.8" fill="#8BAF6A" opacity="0.4" />
        </g>

        {/* Caper 4 - smaller */}
        <g transform="translate(10, 18) rotate(25)">
          <ellipse cx="3" cy="2.2" rx="3" ry="2.2" fill="url(#caperScatterGrad2)" />
          <ellipse cx="2.2" cy="1.8" rx="0.7" ry="0.5" fill="#7A9F5A" opacity="0.4" />
        </g>

        {/* Caper 5 - smallest */}
        <g transform="translate(22, 20) rotate(-20)">
          <ellipse cx="2.5" cy="2" rx="2.5" ry="2" fill="url(#caperScatterGrad1)" />
          <ellipse cx="2" cy="1.5" rx="0.6" ry="0.4" fill="#8BAF6A" opacity="0.35" />
        </g>
      </svg>
    </IngredientBase>
  );
}

/**
 * CaperBerry - Larger caper berry (caper fruit)
 */
export function CaperBerry({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={20}
      baseHeight={28}
    >
      <svg width="100%" height="100%" viewBox="0 0 20 28" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="caperBerryGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#7A9F5A" />
            <stop offset="50%" stopColor="#5A7A40" />
            <stop offset="100%" stopColor="#4A6B35" />
          </radialGradient>
        </defs>

        {/* Stem */}
        <path d="M 10 4 L 10 1" stroke="#5A7A40" strokeWidth="1.5" strokeLinecap="round" />

        {/* Main berry body - teardrop shape */}
        <path
          d="M 10 4 Q 3 10, 3 16 Q 3 24, 10 26 Q 17 24, 17 16 Q 17 10, 10 4 Z"
          fill="url(#caperBerryGrad)"
        />

        {/* Surface striations */}
        <path d="M 6 10 Q 10 12, 14 10" stroke="#4A6B35" strokeWidth="0.3" opacity="0.4" />
        <path d="M 5 14 Q 10 16, 15 14" stroke="#4A6B35" strokeWidth="0.3" opacity="0.4" />
        <path d="M 5 18 Q 10 20, 15 18" stroke="#4A6B35" strokeWidth="0.3" opacity="0.4" />
        <path d="M 6 22 Q 10 24, 14 22" stroke="#4A6B35" strokeWidth="0.3" opacity="0.4" />

        {/* Highlight */}
        <ellipse cx="7" cy="12" rx="2" ry="4" fill="#9BBF7A" opacity="0.35" />
      </svg>
    </IngredientBase>
  );
}
