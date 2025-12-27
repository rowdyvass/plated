/**
 * EggYolk - A perfectly round raw egg yolk
 * Rich golden color with glossy membrane and specular highlight
 */

import { IngredientBase } from '../base';
import { IngredientBaseProps } from '../base/types';

export function EggYolk({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={36}
      baseHeight={36}
    >
      <svg width="100%" height="100%" viewBox="0 0 36 36" fill="none" preserveAspectRatio="xMidYMid meet">
        {/* Definitions for gradients */}
        <defs>
          {/* Main yolk gradient - rich golden to deep orange-yellow */}
          <radialGradient id="yolkGradient" cx="35%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="40%" stopColor="#FFD700" />
            <stop offset="70%" stopColor="#F5B800" />
            <stop offset="100%" stopColor="#DAA520" />
          </radialGradient>

          {/* Membrane sheen gradient */}
          <radialGradient id="yolkSheen" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFF8DC" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#FFE4B5" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft shadow under yolk */}
        <ellipse cx="19" cy="20" rx="14" ry="12" fill="#C9A227" opacity="0.2" />

        {/* Main yolk body */}
        <circle cx="18" cy="18" r="14" fill="url(#yolkGradient)" />

        {/* Membrane sheen overlay */}
        <circle cx="18" cy="18" r="14" fill="url(#yolkSheen)" />

        {/* Primary specular highlight */}
        <ellipse cx="12" cy="12" rx="5" ry="3.5" fill="#FFFEF5" opacity="0.7" />

        {/* Secondary smaller highlight */}
        <ellipse cx="10" cy="14" rx="2" ry="1.5" fill="#FFFFFF" opacity="0.5" />

        {/* Subtle rim highlight */}
        <path
          d="M 6 20 Q 6 10, 14 6"
          fill="none"
          stroke="#FFFACD"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* Subtle depth variation in yolk */}
        <circle cx="20" cy="20" r="6" fill="#E6A800" opacity="0.2" />
      </svg>
    </IngredientBase>
  );
}
