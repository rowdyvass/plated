/**
 * MicroGreen - Tiny delicate microgreen seedling
 * Multiple variants for natural variety when scattered
 */

import { IngredientBase } from '../base';
import { IngredientBaseProps, HerbProps } from '../base/types';

export function MicroGreen({ size, rotation, scale, shadow, className, variant = 1 }: HerbProps) {
  const variants = {
    1: (
      <svg width="100%" height="100%" viewBox="0 0 16 24" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="microStem1" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4A7023" />
            <stop offset="100%" stopColor="#6B9C3A" />
          </linearGradient>
        </defs>

        {/* Thin stem */}
        <path
          d="M 8 24 L 8 10"
          stroke="url(#microStem1)"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Two cotyledon leaves */}
        <ellipse cx="4" cy="8" rx="4" ry="2.5" fill="#6B8E23" transform="rotate(-25 4 8)" />
        <ellipse cx="12" cy="8" rx="4" ry="2.5" fill="#6B8E23" transform="rotate(25 12 8)" />

        {/* Top growing point */}
        <ellipse cx="8" cy="5" rx="2" ry="3.5" fill="#7BA428" />

        {/* Leaf highlights */}
        <ellipse cx="3" cy="7" rx="1.5" ry="1" fill="#8BC34A" opacity="0.4" transform="rotate(-25 3 7)" />
        <ellipse cx="13" cy="7" rx="1.5" ry="1" fill="#8BC34A" opacity="0.4" transform="rotate(25 13 7)" />
      </svg>
    ),
    2: (
      <svg width="100%" height="100%" viewBox="0 0 16 24" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="microStem2" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#3D6020" />
            <stop offset="100%" stopColor="#5A8C2A" />
          </linearGradient>
        </defs>

        {/* Curved stem */}
        <path
          d="M 8 24 Q 6 18, 8 10"
          stroke="url(#microStem2)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />

        {/* Heart-shaped cotyledons */}
        <path
          d="M 8 10 Q 2 8, 3 4 Q 4 2, 8 6"
          fill="#558B2F"
        />
        <path
          d="M 8 10 Q 14 8, 13 4 Q 12 2, 8 6"
          fill="#558B2F"
        />

        {/* Highlights */}
        <path d="M 4 5 Q 5 4, 7 6" stroke="#8BC34A" strokeWidth="0.8" fill="none" opacity="0.4" />
        <path d="M 12 5 Q 11 4, 9 6" stroke="#8BC34A" strokeWidth="0.8" fill="none" opacity="0.4" />
      </svg>
    ),
    3: (
      <svg width="100%" height="100%" viewBox="0 0 16 24" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="microStem3" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4A5A23" />
            <stop offset="100%" stopColor="#6B7C3A" />
          </linearGradient>
        </defs>

        {/* Slightly curved stem */}
        <path
          d="M 8 24 Q 10 16, 8 8"
          stroke="url(#microStem3)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />

        {/* Rounded cotyledons */}
        <circle cx="5" cy="6" r="3" fill="#689F38" />
        <circle cx="11" cy="6" r="3" fill="#689F38" />

        {/* Tiny true leaf emerging */}
        <ellipse cx="8" cy="4" rx="1.5" ry="2.5" fill="#7CB342" />

        {/* Highlights */}
        <circle cx="4" cy="5" r="1" fill="#9CCC65" opacity="0.4" />
        <circle cx="10" cy="5" r="1" fill="#9CCC65" opacity="0.4" />
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
      baseWidth={16}
      baseHeight={24}
    >
      {variants[variant]}
    </IngredientBase>
  );
}

/**
 * MicroGreenCluster - A small cluster of microgreens
 */
export function MicroGreenCluster({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={36}
      baseHeight={32}
    >
      <svg width="100%" height="100%" viewBox="0 0 36 32" fill="none" preserveAspectRatio="xMidYMid meet">
        {/* Multiple microgreens of varying types */}

        {/* Back row */}
        <g transform="translate(6, 4)">
          <path d="M 4 20 L 4 10" stroke="#4A7023" strokeWidth="0.8" />
          <ellipse cx="2" cy="8" rx="2.5" ry="1.5" fill="#6B8E23" transform="rotate(-20 2 8)" />
          <ellipse cx="6" cy="8" rx="2.5" ry="1.5" fill="#6B8E23" transform="rotate(20 6 8)" />
        </g>

        <g transform="translate(16, 2)">
          <path d="M 4 22 L 4 10" stroke="#5A8C2A" strokeWidth="0.8" />
          <circle cx="2" cy="8" r="2" fill="#689F38" />
          <circle cx="6" cy="8" r="2" fill="#689F38" />
          <ellipse cx="4" cy="6" rx="1" ry="2" fill="#7CB342" />
        </g>

        <g transform="translate(26, 4)">
          <path d="M 4 18 Q 3 14, 4 8" stroke="#3D6020" strokeWidth="0.8" fill="none" />
          <path d="M 4 8 Q 1 6, 2 3 Q 3 2, 4 5" fill="#558B2F" />
          <path d="M 4 8 Q 7 6, 6 3 Q 5 2, 4 5" fill="#558B2F" />
        </g>

        {/* Front row */}
        <g transform="translate(2, 10)">
          <path d="M 4 20 Q 5 14, 4 8" stroke="#4A7023" strokeWidth="0.8" fill="none" />
          <ellipse cx="2" cy="6" rx="3" ry="2" fill="#7BA428" transform="rotate(-30 2 6)" />
          <ellipse cx="6" cy="6" rx="3" ry="2" fill="#7BA428" transform="rotate(30 6 6)" />
        </g>

        <g transform="translate(12, 8)">
          <path d="M 4 22 L 4 8" stroke="#5A8C2A" strokeWidth="0.8" />
          <ellipse cx="1" cy="6" rx="3" ry="1.8" fill="#6B8E23" transform="rotate(-35 1 6)" />
          <ellipse cx="7" cy="6" rx="3" ry="1.8" fill="#6B8E23" transform="rotate(35 7 6)" />
          <ellipse cx="4" cy="4" rx="1.5" ry="2.5" fill="#8BC34A" />
        </g>

        <g transform="translate(22, 10)">
          <path d="M 4 18 L 4 8" stroke="#4A5A23" strokeWidth="0.8" />
          <circle cx="2" cy="6" r="2.5" fill="#689F38" />
          <circle cx="6" cy="6" r="2.5" fill="#689F38" />
        </g>
      </svg>
    </IngredientBase>
  );
}
