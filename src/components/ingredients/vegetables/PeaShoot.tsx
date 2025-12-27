/**
 * PeaShoot - Delicate pea tendril with leaves
 * Elegant curved stem with paired leaves and tendril
 */

import { IngredientBase } from '../base';
import { HerbProps } from '../base/types';

export function PeaShoot({ size, rotation, scale, shadow, className, variant = 1 }: HerbProps) {
  const variants = {
    1: (
      <svg width="100%" height="100%" viewBox="0 0 24 36" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="peaShootStem1" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4A7023" />
            <stop offset="100%" stopColor="#6B9C3A" />
          </linearGradient>
          <linearGradient id="peaShootLeaf1" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5A8C2A" />
            <stop offset="50%" stopColor="#7BAF50" />
            <stop offset="100%" stopColor="#6B9C3A" />
          </linearGradient>
        </defs>

        {/* Main stem - gentle S curve */}
        <path
          d="M 12 36 Q 10 28, 12 20 Q 14 14, 12 6"
          fill="none"
          stroke="url(#peaShootStem1)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Left leaf - lower */}
        <ellipse cx="6" cy="22" rx="5" ry="3" fill="url(#peaShootLeaf1)" transform="rotate(-35 6 22)" />
        <path d="M 6 22 L 11 21" stroke="#4A7023" strokeWidth="0.3" opacity="0.5" />

        {/* Right leaf - lower */}
        <ellipse cx="18" cy="20" rx="5" ry="3" fill="url(#peaShootLeaf1)" transform="rotate(30 18 20)" />
        <path d="M 18 20 L 13 20" stroke="#4A7023" strokeWidth="0.3" opacity="0.5" />

        {/* Left leaf - upper */}
        <ellipse cx="8" cy="12" rx="4" ry="2.5" fill="url(#peaShootLeaf1)" transform="rotate(-25 8 12)" />
        <path d="M 8 12 L 11 12" stroke="#4A7023" strokeWidth="0.3" opacity="0.4" />

        {/* Right leaf - upper */}
        <ellipse cx="16" cy="10" rx="4" ry="2.5" fill="url(#peaShootLeaf1)" transform="rotate(25 16 10)" />
        <path d="M 16 10 L 13 10" stroke="#4A7023" strokeWidth="0.3" opacity="0.4" />

        {/* Top tendril */}
        <path
          d="M 12 6 Q 14 4, 13 2 Q 11 0, 9 1"
          fill="none"
          stroke="#6B9C3A"
          strokeWidth="0.8"
          strokeLinecap="round"
        />

        {/* Leaf highlights */}
        <ellipse cx="5" cy="21" rx="2" ry="1" fill="#A5D66F" opacity="0.3" transform="rotate(-35 5 21)" />
        <ellipse cx="19" cy="19" rx="2" ry="1" fill="#A5D66F" opacity="0.3" transform="rotate(30 19 19)" />
      </svg>
    ),
    2: (
      <svg width="100%" height="100%" viewBox="0 0 24 36" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="peaShootStem2" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#4A7023" />
            <stop offset="100%" stopColor="#7BAF50" />
          </linearGradient>
          <linearGradient id="peaShootLeaf2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4F8025" />
            <stop offset="100%" stopColor="#6B9C3A" />
          </linearGradient>
        </defs>

        {/* Main stem - more upright */}
        <path
          d="M 12 36 Q 11 26, 12 18 Q 13 10, 12 4"
          fill="none"
          stroke="url(#peaShootStem2)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Single large leaf left */}
        <ellipse cx="5" cy="18" rx="6" ry="3.5" fill="url(#peaShootLeaf2)" transform="rotate(-40 5 18)" />
        <path d="M 5 18 L 11 17" stroke="#3D6020" strokeWidth="0.4" opacity="0.5" />

        {/* Single large leaf right */}
        <ellipse cx="19" cy="16" rx="6" ry="3.5" fill="url(#peaShootLeaf2)" transform="rotate(35 19 16)" />
        <path d="M 19 16 L 13 16" stroke="#3D6020" strokeWidth="0.4" opacity="0.5" />

        {/* Small top leaves */}
        <ellipse cx="9" cy="8" rx="3" ry="2" fill="url(#peaShootLeaf2)" transform="rotate(-20 9 8)" />
        <ellipse cx="15" cy="6" rx="3" ry="2" fill="url(#peaShootLeaf2)" transform="rotate(20 15 6)" />

        {/* Curly tendril */}
        <path
          d="M 12 4 Q 15 2, 16 4 Q 17 6, 15 7"
          fill="none"
          stroke="#7BAF50"
          strokeWidth="0.6"
          strokeLinecap="round"
        />
      </svg>
    ),
    3: (
      <svg width="100%" height="100%" viewBox="0 0 24 36" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="peaShootStem3" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#3D6020" />
            <stop offset="100%" stopColor="#5A8C2A" />
          </linearGradient>
          <linearGradient id="peaShootLeaf3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4A7023" />
            <stop offset="100%" stopColor="#6B9C3A" />
          </linearGradient>
        </defs>

        {/* Main stem - curved to right */}
        <path
          d="M 10 36 Q 8 28, 10 20 Q 14 12, 16 4"
          fill="none"
          stroke="url(#peaShootStem3)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Leaves following curve */}
        <ellipse cx="4" cy="24" rx="4.5" ry="2.5" fill="url(#peaShootLeaf3)" transform="rotate(-50 4 24)" />
        <ellipse cx="6" cy="16" rx="5" ry="3" fill="url(#peaShootLeaf3)" transform="rotate(-30 6 16)" />
        <ellipse cx="14" cy="10" rx="4" ry="2.5" fill="url(#peaShootLeaf3)" transform="rotate(10 14 10)" />
        <ellipse cx="18" cy="6" rx="3.5" ry="2" fill="url(#peaShootLeaf3)" transform="rotate(30 18 6)" />

        {/* Tendril at top */}
        <path
          d="M 16 4 Q 18 2, 19 3 Q 20 5, 18 6"
          fill="none"
          stroke="#6B9C3A"
          strokeWidth="0.6"
          strokeLinecap="round"
        />

        {/* Leaf veins */}
        <path d="M 4 24 L 9 22" stroke="#3D6020" strokeWidth="0.3" opacity="0.4" />
        <path d="M 6 16 L 10 17" stroke="#3D6020" strokeWidth="0.3" opacity="0.4" />
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
      baseWidth={36}
      baseHeight={48}
    >
      {variants[variant]}
    </IngredientBase>
  );
}
