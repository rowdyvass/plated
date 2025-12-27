/**
 * BabyVegetable - Various baby vegetables for fine dining garnish
 * Includes baby carrot, baby turnip, baby radish
 */

import { IngredientBase } from '../base';
import { IngredientBaseProps } from '../base/types';

interface BabyVegetableProps extends IngredientBaseProps {
  type?: 'carrot' | 'turnip' | 'radish' | 'beet';
}

export function BabyVegetable({ size, rotation, scale, shadow, className, type = 'carrot' }: BabyVegetableProps) {
  const vegetables = {
    carrot: (
      <svg width="100%" height="100%" viewBox="0 0 20 48" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="babyCarrotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF8C42" />
            <stop offset="50%" stopColor="#F76B15" />
            <stop offset="100%" stopColor="#E55A00" />
          </linearGradient>
        </defs>

        {/* Carrot top greens */}
        <path d="M 10 12 Q 6 8, 4 2" stroke="#4A7023" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M 10 12 Q 10 6, 10 1" stroke="#5A8C2A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M 10 12 Q 14 8, 16 2" stroke="#4A7023" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <ellipse cx="4" cy="2" rx="2" ry="3" fill="#6B8E23" transform="rotate(-20 4 2)" />
        <ellipse cx="10" cy="1" rx="1.5" ry="3" fill="#7BA428" />
        <ellipse cx="16" cy="2" rx="2" ry="3" fill="#6B8E23" transform="rotate(20 16 2)" />

        {/* Carrot body - tapered */}
        <path
          d="M 6 12 Q 4 14, 4 20 Q 4 30, 6 38 Q 8 44, 10 46 Q 12 44, 14 38 Q 16 30, 16 20 Q 16 14, 14 12 Z"
          fill="url(#babyCarrotGrad)"
        />

        {/* Root lines */}
        <path d="M 6 18 L 14 18" stroke="#E55A00" strokeWidth="0.3" opacity="0.4" />
        <path d="M 5 24 L 15 24" stroke="#E55A00" strokeWidth="0.3" opacity="0.4" />
        <path d="M 6 30 L 14 30" stroke="#E55A00" strokeWidth="0.3" opacity="0.4" />
        <path d="M 7 36 L 13 36" stroke="#E55A00" strokeWidth="0.3" opacity="0.4" />

        {/* Highlight */}
        <path d="M 7 14 Q 6 20, 7 30" stroke="#FFB066" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
      </svg>
    ),

    turnip: (
      <svg width="100%" height="100%" viewBox="0 0 32 44" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="babyTurnipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8DFF5" />
            <stop offset="40%" stopColor="#F5F5F5" />
            <stop offset="100%" stopColor="#FFFEF8" />
          </linearGradient>
        </defs>

        {/* Turnip greens */}
        <path d="M 16 14 Q 10 8, 6 2" stroke="#4A7023" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M 16 14 Q 16 6, 16 1" stroke="#5A8C2A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M 16 14 Q 22 8, 26 2" stroke="#4A7023" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <ellipse cx="6" cy="2" rx="3" ry="5" fill="#6B8E23" transform="rotate(-25 6 2)" />
        <ellipse cx="16" cy="1" rx="2" ry="4" fill="#7BA428" />
        <ellipse cx="26" cy="2" rx="3" ry="5" fill="#6B8E23" transform="rotate(25 26 2)" />

        {/* Purple top */}
        <path
          d="M 8 14 Q 4 18, 4 24 Q 4 20, 8 16 Z"
          fill="#9B7BB8"
          opacity="0.6"
        />
        <path
          d="M 24 14 Q 28 18, 28 24 Q 28 20, 24 16 Z"
          fill="#9B7BB8"
          opacity="0.6"
        />

        {/* Turnip body - round */}
        <ellipse cx="16" cy="28" rx="12" ry="14" fill="url(#babyTurnipGrad)" />

        {/* Root tip */}
        <path d="M 16 42 L 16 44" stroke="#E8E0D0" strokeWidth="2" strokeLinecap="round" />

        {/* Highlight */}
        <ellipse cx="12" cy="24" rx="4" ry="6" fill="white" opacity="0.4" />
      </svg>
    ),

    radish: (
      <svg width="100%" height="100%" viewBox="0 0 28 44" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="babyRadishGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FF6B8A" />
            <stop offset="50%" stopColor="#E53E63" />
            <stop offset="100%" stopColor="#C2185B" />
          </radialGradient>
        </defs>

        {/* Radish greens */}
        <path d="M 14 12 Q 8 6, 4 2" stroke="#4A7023" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M 14 12 Q 14 4, 14 1" stroke="#5A8C2A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M 14 12 Q 20 6, 24 2" stroke="#4A7023" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <ellipse cx="4" cy="2" rx="3" ry="4" fill="#6B8E23" transform="rotate(-30 4 2)" />
        <ellipse cx="14" cy="1" rx="2" ry="3.5" fill="#7BA428" />
        <ellipse cx="24" cy="2" rx="3" ry="4" fill="#6B8E23" transform="rotate(30 24 2)" />

        {/* Radish body - elongated sphere */}
        <ellipse cx="14" cy="26" rx="10" ry="14" fill="url(#babyRadishGrad)" />

        {/* White bottom */}
        <path
          d="M 8 34 Q 6 38, 10 42 Q 14 44, 18 42 Q 22 38, 20 34"
          fill="#FFFEF8"
        />

        {/* Root */}
        <path d="M 14 42 Q 14 44, 13 46" stroke="#E8D8C8" strokeWidth="1" strokeLinecap="round" fill="none" />

        {/* Highlight */}
        <ellipse cx="10" cy="22" rx="3" ry="5" fill="white" opacity="0.4" />
      </svg>
    ),

    beet: (
      <svg width="100%" height="100%" viewBox="0 0 32 48" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="babyBeetGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#8E1650" />
            <stop offset="50%" stopColor="#6A0F3C" />
            <stop offset="100%" stopColor="#4A0A2A" />
          </radialGradient>
        </defs>

        {/* Beet greens with red stems */}
        <path d="M 16 14 Q 8 6, 4 2" stroke="#8E1650" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M 16 14 Q 16 4, 16 1" stroke="#8E1650" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M 16 14 Q 24 6, 28 2" stroke="#8E1650" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <ellipse cx="4" cy="2" rx="3" ry="5" fill="#2E5520" transform="rotate(-30 4 2)" />
        <ellipse cx="16" cy="1" rx="2.5" ry="4" fill="#3D6B25" />
        <ellipse cx="28" cy="2" rx="3" ry="5" fill="#2E5520" transform="rotate(30 28 2)" />

        {/* Beet body - round with slight taper */}
        <path
          d="M 4 24 Q 2 28, 4 34 Q 8 42, 16 44 Q 24 42, 28 34 Q 30 28, 28 24 Q 26 16, 16 14 Q 6 16, 4 24 Z"
          fill="url(#babyBeetGrad)"
        />

        {/* Root */}
        <path d="M 16 44 Q 15 46, 14 48" stroke="#4A0A2A" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Highlight */}
        <ellipse cx="10" cy="26" rx="4" ry="6" fill="#B83070" opacity="0.4" />

        {/* Ring texture hints */}
        <ellipse cx="16" cy="30" rx="8" ry="6" fill="none" stroke="#6A0F3C" strokeWidth="0.3" opacity="0.3" />
      </svg>
    ),
  };

  const dimensions = {
    carrot: { width: 20, height: 48 },
    turnip: { width: 32, height: 44 },
    radish: { width: 28, height: 44 },
    beet: { width: 32, height: 48 },
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
      {vegetables[type]}
    </IngredientBase>
  );
}
