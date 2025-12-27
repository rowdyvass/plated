/**
 * Mozzarella - Fresh buffalo mozzarella slice
 * Creamy white with soft texture
 */

import { IngredientBase } from '../base';
import { IngredientBaseProps } from '../base/types';

export function MozzarellaSlice({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={44}
      baseHeight={44}
    >
      <svg width="100%" height="100%" viewBox="0 0 44 44" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Creamy white gradient */}
          <radialGradient id="mozzarellaGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FFFEF5" />
            <stop offset="80%" stopColor="#F5F0E6" />
            <stop offset="100%" stopColor="#EBE5D8" />
          </radialGradient>
        </defs>

        {/* Soft shadow */}
        <ellipse cx="24" cy="24" rx="18" ry="16" fill="#D4C9B8" opacity="0.2" />

        {/* Main mozzarella slice - slightly irregular for handmade look */}
        <path
          d="M 22 4 Q 36 4, 40 16 Q 42 28, 34 38 Q 22 42, 10 38 Q 2 28, 4 16 Q 8 4, 22 4 Z"
          fill="url(#mozzarellaGrad)"
        />

        {/* Milky interior texture */}
        <ellipse cx="20" cy="20" rx="10" ry="8" fill="#FFFEFA" opacity="0.5" />

        {/* Soft highlight on surface */}
        <ellipse cx="14" cy="14" rx="8" ry="6" fill="white" opacity="0.6" />
        <ellipse cx="12" cy="12" rx="4" ry="3" fill="white" opacity="0.4" />

        {/* Slight texture - mozzarella fibers */}
        <path d="M 16 18 Q 20 16, 24 18" stroke="#E8E0D4" strokeWidth="0.4" opacity="0.4" />
        <path d="M 14 24 Q 20 22, 26 24" stroke="#E8E0D4" strokeWidth="0.4" opacity="0.4" />
        <path d="M 18 30 Q 22 28, 26 30" stroke="#E8E0D4" strokeWidth="0.4" opacity="0.3" />

        {/* Edge definition */}
        <path
          d="M 22 4 Q 36 4, 40 16 Q 42 28, 34 38 Q 22 42, 10 38 Q 2 28, 4 16 Q 8 4, 22 4 Z"
          fill="none"
          stroke="#D4C9B8"
          strokeWidth="0.3"
          opacity="0.5"
        />
      </svg>
    </IngredientBase>
  );
}

/**
 * Burrata - Whole burrata with creamy center
 */
export function Burrata({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={56}
      baseHeight={48}
    >
      <svg width="100%" height="100%" viewBox="0 0 56 48" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="burrataGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FFFEF8" />
            <stop offset="100%" stopColor="#F0EBE0" />
          </radialGradient>
          <radialGradient id="burrataCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFEFA" />
            <stop offset="100%" stopColor="#F8F4EB" />
          </radialGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="30" cy="28" rx="22" ry="16" fill="#C9BEA8" opacity="0.2" />

        {/* Main burrata body */}
        <ellipse cx="28" cy="24" rx="22" ry="18" fill="url(#burrataGrad)" />

        {/* Opened top showing creamy center */}
        <path
          d="M 16 16 Q 28 12, 40 16 Q 42 20, 38 24 Q 28 28, 18 24 Q 14 20, 16 16 Z"
          fill="url(#burrataCenter)"
        />

        {/* Creamy stracciatella visible */}
        <ellipse cx="28" cy="20" rx="8" ry="4" fill="#FFFEFA" opacity="0.8" />

        {/* Highlight */}
        <ellipse cx="20" cy="18" rx="6" ry="4" fill="white" opacity="0.5" />

        {/* Torn edge texture */}
        <path d="M 18 16 Q 20 14, 24 15" stroke="#E8E0D4" strokeWidth="0.5" opacity="0.4" />
        <path d="M 32 15 Q 36 14, 38 16" stroke="#E8E0D4" strokeWidth="0.5" opacity="0.4" />
      </svg>
    </IngredientBase>
  );
}
