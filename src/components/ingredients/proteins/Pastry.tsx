/**
 * Pastry - Various pastry elements for desserts
 * Tart shells, puff pastry, tuiles
 */

import { IngredientBase } from '../base';
import { IngredientBaseProps } from '../base/types';

/**
 * TartSlice - Wedge of tart for plating
 */
export function TartSlice({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={48}
      baseHeight={40}
    >
      <svg width="100%" height="100%" viewBox="0 0 48 40" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="tartCrustGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4A86A" />
            <stop offset="50%" stopColor="#C49860" />
            <stop offset="100%" stopColor="#A67C4A" />
          </linearGradient>
          <linearGradient id="tartFillingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5E6C8" />
            <stop offset="100%" stopColor="#E8D4A8" />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <path
          d="M 6 36 L 24 4 L 44 36 Z"
          fill="#8B6914"
          opacity="0.15"
          transform="translate(1, 2)"
        />

        {/* Tart crust - triangular wedge with depth */}
        <path d="M 4 36 L 24 4 L 44 36 Z" fill="url(#tartCrustGrad)" />

        {/* Filling visible on top */}
        <path d="M 8 32 L 24 8 L 40 32 Z" fill="url(#tartFillingGrad)" />

        {/* Crust edge (rim) */}
        <path
          d="M 4 36 L 6 32 L 24 6 L 42 32 L 44 36"
          fill="none"
          stroke="#A67C4A"
          strokeWidth="2"
        />

        {/* Crust crimped edge texture */}
        <path d="M 6 34 L 8 32" stroke="#8B6914" strokeWidth="0.5" opacity="0.5" />
        <path d="M 12 34 L 14 32" stroke="#8B6914" strokeWidth="0.5" opacity="0.5" />
        <path d="M 18 34 L 20 32" stroke="#8B6914" strokeWidth="0.5" opacity="0.5" />
        <path d="M 24 34 L 26 32" stroke="#8B6914" strokeWidth="0.5" opacity="0.5" />
        <path d="M 30 34 L 32 32" stroke="#8B6914" strokeWidth="0.5" opacity="0.5" />
        <path d="M 36 34 L 38 32" stroke="#8B6914" strokeWidth="0.5" opacity="0.5" />

        {/* Highlight on filling */}
        <path d="M 16 20 L 24 10 L 32 20" fill="#FFF8E8" opacity="0.3" />

        {/* Caramelized edge on filling */}
        <path
          d="M 10 28 Q 24 18, 38 28"
          fill="none"
          stroke="#C49860"
          strokeWidth="0.5"
          opacity="0.4"
        />
      </svg>
    </IngredientBase>
  );
}

/**
 * PuffPastryPiece - Light, flaky puff pastry element
 */
export function PuffPastryPiece({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={40}
      baseHeight={24}
    >
      <svg width="100%" height="100%" viewBox="0 0 40 24" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="puffGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8C87A" />
            <stop offset="50%" stopColor="#D4A86A" />
            <stop offset="100%" stopColor="#C49860" />
          </linearGradient>
        </defs>

        {/* Main puff pastry body */}
        <path
          d="M 4 18 Q 2 12, 6 8 Q 12 4, 20 4 Q 28 4, 34 8 Q 38 12, 36 18 Q 32 22, 20 22 Q 8 22, 4 18 Z"
          fill="url(#puffGrad)"
        />

        {/* Layered flaky texture */}
        <path d="M 8 10 Q 20 6, 32 10" stroke="#B88A50" strokeWidth="0.5" opacity="0.4" />
        <path d="M 6 14 Q 20 10, 34 14" stroke="#B88A50" strokeWidth="0.5" opacity="0.4" />
        <path d="M 8 18 Q 20 14, 32 18" stroke="#B88A50" strokeWidth="0.5" opacity="0.3" />

        {/* Golden top highlight */}
        <path
          d="M 10 8 Q 20 5, 30 8"
          fill="none"
          stroke="#F0D88A"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Crispy flake edges */}
        <path d="M 6 16 Q 4 14, 6 12" stroke="#A67C4A" strokeWidth="0.3" opacity="0.5" />
        <path d="M 34 16 Q 36 14, 34 12" stroke="#A67C4A" strokeWidth="0.3" opacity="0.5" />
      </svg>
    </IngredientBase>
  );
}

/**
 * Tuile - Delicate curved cookie/wafer
 */
export function Tuile({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={48}
      baseHeight={20}
    >
      <svg width="100%" height="100%" viewBox="0 0 48 20" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="tuileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4A050" />
            <stop offset="50%" stopColor="#C49040" />
            <stop offset="100%" stopColor="#A07030" />
          </linearGradient>
        </defs>

        {/* Curved tuile shape */}
        <path
          d="M 4 16 Q 4 8, 14 6 Q 24 4, 34 6 Q 44 8, 44 16 Q 34 14, 24 12 Q 14 14, 4 16 Z"
          fill="url(#tuileGrad)"
        />

        {/* Lace-like holes (for a lace tuile) */}
        <ellipse cx="12" cy="10" rx="2" ry="1.5" fill="#E8C87A" opacity="0.5" />
        <ellipse cx="20" cy="8" rx="1.5" ry="1" fill="#E8C87A" opacity="0.5" />
        <ellipse cx="28" cy="8" rx="1.5" ry="1" fill="#E8C87A" opacity="0.5" />
        <ellipse cx="36" cy="10" rx="2" ry="1.5" fill="#E8C87A" opacity="0.5" />

        {/* Crisp edge highlight */}
        <path
          d="M 8 14 Q 24 10, 40 14"
          fill="none"
          stroke="#E8C87A"
          strokeWidth="0.8"
          opacity="0.5"
        />

        {/* Caramelized edge */}
        <path
          d="M 4 16 Q 14 14, 24 12 Q 34 14, 44 16"
          fill="none"
          stroke="#8B6914"
          strokeWidth="0.5"
          opacity="0.4"
        />
      </svg>
    </IngredientBase>
  );
}
