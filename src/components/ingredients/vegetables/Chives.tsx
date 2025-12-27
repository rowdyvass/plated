/**
 * Chives - Fresh chive pieces for garnish
 * Thin tubular herb pieces scattered or aligned
 */

import { IngredientBase } from '../base';
import { IngredientBaseProps } from '../base/types';

export function ChivePieces({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={32}
      baseHeight={24}
    >
      <svg width="100%" height="100%" viewBox="0 0 32 24" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="chiveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5A8C2A" />
            <stop offset="50%" stopColor="#4A7023" />
            <stop offset="100%" stopColor="#3D6020" />
          </linearGradient>
        </defs>

        {/* Multiple chive pieces at various angles */}

        {/* Piece 1 */}
        <rect x="4" y="8" width="12" height="2" rx="1" fill="url(#chiveGrad)" transform="rotate(-15 10 9)" />
        <rect x="4" y="8" width="12" height="0.5" rx="0.25" fill="#7BAF50" opacity="0.4" transform="rotate(-15 10 9)" />

        {/* Piece 2 */}
        <rect x="10" y="14" width="14" height="2" rx="1" fill="url(#chiveGrad)" transform="rotate(10 17 15)" />
        <rect x="10" y="14" width="14" height="0.5" rx="0.25" fill="#7BAF50" opacity="0.4" transform="rotate(10 17 15)" />

        {/* Piece 3 */}
        <rect x="18" y="6" width="10" height="1.8" rx="0.9" fill="url(#chiveGrad)" transform="rotate(-5 23 7)" />
        <rect x="18" y="6" width="10" height="0.4" rx="0.2" fill="#7BAF50" opacity="0.4" transform="rotate(-5 23 7)" />

        {/* Piece 4 */}
        <rect x="2" y="16" width="8" height="1.6" rx="0.8" fill="url(#chiveGrad)" transform="rotate(25 6 17)" />
        <rect x="2" y="16" width="8" height="0.4" rx="0.2" fill="#7BAF50" opacity="0.4" transform="rotate(25 6 17)" />

        {/* Piece 5 */}
        <rect x="20" y="16" width="9" height="1.8" rx="0.9" fill="url(#chiveGrad)" transform="rotate(-20 24 17)" />
        <rect x="20" y="16" width="9" height="0.4" rx="0.2" fill="#7BAF50" opacity="0.4" transform="rotate(-20 24 17)" />
      </svg>
    </IngredientBase>
  );
}

/**
 * Single chive piece for precise placement
 */
export function ChiveSingle({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={24}
      baseHeight={6}
    >
      <svg width="100%" height="100%" viewBox="0 0 24 6" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="chiveSingleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6B9C3A" />
            <stop offset="50%" stopColor="#5A8C2A" />
            <stop offset="100%" stopColor="#4A7023" />
          </linearGradient>
        </defs>

        {/* Single tubular chive piece */}
        <rect x="1" y="1" width="22" height="4" rx="2" fill="url(#chiveSingleGrad)" />

        {/* Highlight along top */}
        <rect x="1" y="1" width="22" height="1" rx="0.5" fill="#8BC34A" opacity="0.4" />

        {/* Cut edge hints */}
        <ellipse cx="2" cy="3" rx="1" ry="2" fill="#3D6020" opacity="0.3" />
        <ellipse cx="22" cy="3" rx="1" ry="2" fill="#3D6020" opacity="0.3" />
      </svg>
    </IngredientBase>
  );
}
