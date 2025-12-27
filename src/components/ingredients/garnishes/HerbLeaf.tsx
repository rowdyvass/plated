/**
 * HerbLeaf - Generic herb leaf for fine dining garnish
 * Includes parsley, basil, and other culinary herbs
 */

import { IngredientBase } from '../base';
import { IngredientBaseProps } from '../base/types';

interface HerbLeafProps extends IngredientBaseProps {
  type?: 'parsley' | 'basil' | 'cilantro' | 'tarragon';
}

export function HerbLeaf({ size, rotation, scale, shadow, className, type = 'parsley' }: HerbLeafProps) {
  const herbs = {
    parsley: (
      <svg width="100%" height="100%" viewBox="0 0 28 32" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="parsleyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A9C4A" />
            <stop offset="100%" stopColor="#2D6B2D" />
          </linearGradient>
        </defs>

        {/* Stem */}
        <path d="M 14 32 L 14 20" stroke="#3D6020" strokeWidth="1.5" strokeLinecap="round" />

        {/* Three lobed leaves */}
        <path
          d="M 14 20 Q 6 16, 4 10 Q 2 6, 6 4 Q 10 2, 14 6"
          fill="url(#parsleyGrad)"
        />
        <path
          d="M 14 20 Q 22 16, 24 10 Q 26 6, 22 4 Q 18 2, 14 6"
          fill="url(#parsleyGrad)"
        />
        <path
          d="M 14 6 Q 14 2, 14 0 Q 16 4, 14 8"
          fill="#4A9C4A"
        />

        {/* Serrated edges suggestion */}
        <path d="M 6 8 L 8 6 L 10 8" stroke="#2D6B2D" strokeWidth="0.3" fill="none" opacity="0.5" />
        <path d="M 18 8 L 20 6 L 22 8" stroke="#2D6B2D" strokeWidth="0.3" fill="none" opacity="0.5" />

        {/* Vein lines */}
        <path d="M 14 18 L 8 10" stroke="#2D5B2D" strokeWidth="0.4" opacity="0.5" />
        <path d="M 14 18 L 20 10" stroke="#2D5B2D" strokeWidth="0.4" opacity="0.5" />
        <path d="M 14 8 L 14 4" stroke="#2D5B2D" strokeWidth="0.4" opacity="0.5" />

        {/* Highlights */}
        <ellipse cx="8" cy="10" rx="2" ry="3" fill="#6BC96B" opacity="0.3" transform="rotate(-30 8 10)" />
        <ellipse cx="20" cy="10" rx="2" ry="3" fill="#6BC96B" opacity="0.3" transform="rotate(30 20 10)" />
      </svg>
    ),

    basil: (
      <svg width="100%" height="100%" viewBox="0 0 32 40" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="basilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4CAF50" />
            <stop offset="50%" stopColor="#388E3C" />
            <stop offset="100%" stopColor="#2E7D32" />
          </linearGradient>
        </defs>

        {/* Stem */}
        <path d="M 16 40 L 16 28" stroke="#2E5520" strokeWidth="2" strokeLinecap="round" />

        {/* Large oval basil leaf */}
        <path
          d="M 16 28 Q 4 22, 4 14 Q 4 6, 16 2 Q 28 6, 28 14 Q 28 22, 16 28 Z"
          fill="url(#basilGrad)"
        />

        {/* Central vein */}
        <path d="M 16 26 L 16 4" stroke="#1B5E20" strokeWidth="0.8" fill="none" opacity="0.5" />

        {/* Side veins */}
        <path d="M 16 8 Q 10 10, 6 12" stroke="#1B5E20" strokeWidth="0.4" fill="none" opacity="0.4" />
        <path d="M 16 8 Q 22 10, 26 12" stroke="#1B5E20" strokeWidth="0.4" fill="none" opacity="0.4" />
        <path d="M 16 14 Q 10 16, 6 18" stroke="#1B5E20" strokeWidth="0.4" fill="none" opacity="0.4" />
        <path d="M 16 14 Q 22 16, 26 18" stroke="#1B5E20" strokeWidth="0.4" fill="none" opacity="0.4" />
        <path d="M 16 20 Q 12 22, 8 24" stroke="#1B5E20" strokeWidth="0.4" fill="none" opacity="0.4" />
        <path d="M 16 20 Q 20 22, 24 24" stroke="#1B5E20" strokeWidth="0.4" fill="none" opacity="0.4" />

        {/* Highlight */}
        <ellipse cx="10" cy="12" rx="4" ry="6" fill="#81C784" opacity="0.3" />
      </svg>
    ),

    cilantro: (
      <svg width="100%" height="100%" viewBox="0 0 32 36" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="cilantroGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4A7023" />
            <stop offset="100%" stopColor="#6B9C3A" />
          </linearGradient>
        </defs>

        {/* Stem */}
        <path d="M 16 36 L 16 22" stroke="#4A7023" strokeWidth="1.2" strokeLinecap="round" />

        {/* Branching stems */}
        <path d="M 16 22 Q 10 18, 6 14" stroke="#4A7023" strokeWidth="0.8" fill="none" />
        <path d="M 16 22 Q 22 18, 26 14" stroke="#4A7023" strokeWidth="0.8" fill="none" />
        <path d="M 16 22 Q 16 16, 16 10" stroke="#4A7023" strokeWidth="0.8" fill="none" />

        {/* Fan-shaped leaves */}
        <path d="M 6 14 Q 2 10, 4 6 Q 8 4, 10 8 Q 8 12, 6 14 Z" fill="url(#cilantroGrad)" />
        <path d="M 26 14 Q 30 10, 28 6 Q 24 4, 22 8 Q 24 12, 26 14 Z" fill="url(#cilantroGrad)" />
        <path d="M 16 10 Q 12 6, 14 2 Q 16 0, 18 2 Q 20 6, 16 10 Z" fill="url(#cilantroGrad)" />

        {/* Additional small leaves */}
        <ellipse cx="10" cy="18" rx="3" ry="4" fill="url(#cilantroGrad)" transform="rotate(-30 10 18)" />
        <ellipse cx="22" cy="18" rx="3" ry="4" fill="url(#cilantroGrad)" transform="rotate(30 22 18)" />

        {/* Highlights */}
        <ellipse cx="5" cy="8" rx="1.5" ry="2" fill="#8BC34A" opacity="0.4" />
        <ellipse cx="27" cy="8" rx="1.5" ry="2" fill="#8BC34A" opacity="0.4" />
      </svg>
    ),

    tarragon: (
      <svg width="100%" height="100%" viewBox="0 0 20 40" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="tarragonGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#5A7A3A" />
            <stop offset="100%" stopColor="#7A9C5A" />
          </linearGradient>
        </defs>

        {/* Stem */}
        <path d="M 10 40 L 10 4" stroke="#4A6A2A" strokeWidth="1" strokeLinecap="round" />

        {/* Long narrow leaves alternating */}
        <ellipse cx="6" cy="32" rx="5" ry="2" fill="url(#tarragonGrad)" transform="rotate(-20 6 32)" />
        <ellipse cx="14" cy="28" rx="5" ry="2" fill="url(#tarragonGrad)" transform="rotate(15 14 28)" />
        <ellipse cx="6" cy="24" rx="4.5" ry="1.8" fill="url(#tarragonGrad)" transform="rotate(-25 6 24)" />
        <ellipse cx="14" cy="20" rx="4.5" ry="1.8" fill="url(#tarragonGrad)" transform="rotate(20 14 20)" />
        <ellipse cx="6" cy="16" rx="4" ry="1.6" fill="url(#tarragonGrad)" transform="rotate(-20 6 16)" />
        <ellipse cx="14" cy="12" rx="4" ry="1.6" fill="url(#tarragonGrad)" transform="rotate(15 14 12)" />
        <ellipse cx="8" cy="8" rx="3" ry="1.4" fill="url(#tarragonGrad)" transform="rotate(-10 8 8)" />
        <ellipse cx="12" cy="4" rx="2.5" ry="1.2" fill="url(#tarragonGrad)" transform="rotate(5 12 4)" />

        {/* Leaf veins */}
        <path d="M 4 32 L 8 32" stroke="#4A6A2A" strokeWidth="0.2" opacity="0.4" />
        <path d="M 12 28 L 16 28" stroke="#4A6A2A" strokeWidth="0.2" opacity="0.4" />
      </svg>
    ),
  };

  const dimensions = {
    parsley: { width: 28, height: 32 },
    basil: { width: 32, height: 40 },
    cilantro: { width: 32, height: 36 },
    tarragon: { width: 20, height: 40 },
  };

  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={dimensions[type].width}
      baseHeight={dimensions[type].height}
    >
      {herbs[type]}
    </IngredientBase>
  );
}
