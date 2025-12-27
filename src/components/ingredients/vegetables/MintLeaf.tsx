/**
 * MintLeaf - Fresh spearmint leaf
 * Serrated edges with prominent veining
 */

import { IngredientBase } from '../base';
import { HerbProps } from '../base/types';

export function MintLeaf({ size, rotation, scale, shadow, className, variant = 1 }: HerbProps) {
  const variants = {
    1: (
      <svg width="100%" height="100%" viewBox="0 0 28 36" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="mintGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5AAF5A" />
            <stop offset="50%" stopColor="#3D8B3D" />
            <stop offset="100%" stopColor="#2D6B2D" />
          </linearGradient>
        </defs>

        {/* Main leaf shape with serrated edges */}
        <path
          d="M 14 2
             Q 20 6, 23 12 Q 24 14, 23 16
             Q 25 18, 24 22 Q 24 24, 22 26
             Q 23 28, 21 30 Q 18 34, 14 36
             Q 10 34, 7 30 Q 5 28, 6 26
             Q 4 24, 4 22 Q 3 18, 5 16
             Q 4 14, 5 12 Q 8 6, 14 2 Z"
          fill="url(#mintGradient1)"
        />

        {/* Central vein */}
        <path
          d="M 14 4 L 14 34"
          stroke="#2D5B2D"
          strokeWidth="0.8"
          fill="none"
        />

        {/* Side veins */}
        <path d="M 14 8 Q 18 10, 21 12" stroke="#2D5B2D" strokeWidth="0.4" fill="none" opacity="0.6" />
        <path d="M 14 8 Q 10 10, 7 12" stroke="#2D5B2D" strokeWidth="0.4" fill="none" opacity="0.6" />
        <path d="M 14 14 Q 18 16, 22 18" stroke="#2D5B2D" strokeWidth="0.4" fill="none" opacity="0.6" />
        <path d="M 14 14 Q 10 16, 6 18" stroke="#2D5B2D" strokeWidth="0.4" fill="none" opacity="0.6" />
        <path d="M 14 20 Q 18 22, 21 24" stroke="#2D5B2D" strokeWidth="0.4" fill="none" opacity="0.6" />
        <path d="M 14 20 Q 10 22, 7 24" stroke="#2D5B2D" strokeWidth="0.4" fill="none" opacity="0.6" />
        <path d="M 14 26 Q 17 28, 19 30" stroke="#2D5B2D" strokeWidth="0.4" fill="none" opacity="0.6" />
        <path d="M 14 26 Q 11 28, 9 30" stroke="#2D5B2D" strokeWidth="0.4" fill="none" opacity="0.6" />

        {/* Highlight on leaf surface */}
        <path
          d="M 10 8 Q 12 12, 10 18"
          stroke="#7BC97B"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
        />
      </svg>
    ),
    2: (
      <svg width="100%" height="100%" viewBox="0 0 28 36" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="mintGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4FA64F" />
            <stop offset="50%" stopColor="#3A803A" />
            <stop offset="100%" stopColor="#2A602A" />
          </linearGradient>
        </defs>

        {/* Slightly different leaf shape */}
        <path
          d="M 14 2
             Q 22 8, 24 16 Q 25 20, 23 26
             Q 20 32, 14 36
             Q 8 32, 5 26 Q 3 20, 4 16
             Q 6 8, 14 2 Z"
          fill="url(#mintGradient2)"
        />

        {/* Central vein */}
        <path d="M 14 4 L 14 34" stroke="#1D4B1D" strokeWidth="0.8" fill="none" />

        {/* Side veins */}
        <path d="M 14 10 Q 18 12, 22 14" stroke="#1D4B1D" strokeWidth="0.4" fill="none" opacity="0.5" />
        <path d="M 14 10 Q 10 12, 6 14" stroke="#1D4B1D" strokeWidth="0.4" fill="none" opacity="0.5" />
        <path d="M 14 18 Q 18 20, 22 22" stroke="#1D4B1D" strokeWidth="0.4" fill="none" opacity="0.5" />
        <path d="M 14 18 Q 10 20, 6 22" stroke="#1D4B1D" strokeWidth="0.4" fill="none" opacity="0.5" />
        <path d="M 14 26 Q 17 28, 20 30" stroke="#1D4B1D" strokeWidth="0.4" fill="none" opacity="0.5" />
        <path d="M 14 26 Q 11 28, 8 30" stroke="#1D4B1D" strokeWidth="0.4" fill="none" opacity="0.5" />

        {/* Highlight */}
        <ellipse cx="10" cy="14" rx="4" ry="6" fill="#6BC96B" opacity="0.25" />
      </svg>
    ),
    3: (
      <svg width="100%" height="100%" viewBox="0 0 28 36" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="mintGradient3" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5CB85C" />
            <stop offset="50%" stopColor="#449944" />
            <stop offset="100%" stopColor="#337733" />
          </linearGradient>
        </defs>

        {/* Curled/folded leaf */}
        <path
          d="M 14 2
             Q 21 6, 24 14 Q 26 22, 22 28
             Q 18 34, 14 36
             Q 12 32, 12 26 Q 13 20, 16 14
             Q 12 10, 14 2 Z"
          fill="url(#mintGradient3)"
        />

        {/* Folded under portion (darker) */}
        <path
          d="M 14 36 Q 8 32, 6 26 Q 4 20, 6 14 Q 10 8, 14 2
             Q 12 10, 16 14 Q 13 20, 12 26 Q 12 32, 14 36 Z"
          fill="#2D6B2D"
        />

        {/* Vein on visible part */}
        <path d="M 16 8 Q 20 16, 18 28" stroke="#1D4B1D" strokeWidth="0.6" fill="none" opacity="0.5" />

        {/* Edge highlight */}
        <path
          d="M 14 4 Q 20 8, 22 16"
          stroke="#7BC97B"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
        />
      </svg>
    ),
  };

  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={28}
      baseHeight={36}
    >
      {variants[variant]}
    </IngredientBase>
  );
}
