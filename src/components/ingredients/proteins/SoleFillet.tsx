/**
 * SoleFillet - Pan-seared Dover sole fillet
 * Delicate white fish with golden brown sear marks
 */

import { IngredientBase } from '../base';
import { IngredientBaseProps } from '../base/types';

export function SoleFillet({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={64}
      baseHeight={32}
    >
      <svg width="100%" height="100%" viewBox="0 0 64 32" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Fillet gradient - pearly white to cream */}
          <linearGradient id="filletGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFEF8" />
            <stop offset="30%" stopColor="#F5F5DC" />
            <stop offset="70%" stopColor="#F0E68C" />
            <stop offset="100%" stopColor="#DEB887" />
          </linearGradient>

          {/* Sear gradient */}
          <linearGradient id="searGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C9A05C" />
            <stop offset="100%" stopColor="#8B7355" />
          </linearGradient>
        </defs>

        {/* Soft shadow */}
        <path
          d="M 6 18 Q 4 16, 6 10 Q 12 4, 32 6 Q 52 8, 60 12 Q 62 16, 58 20 Q 48 26, 32 26 Q 16 26, 6 18 Z"
          fill="#C9A05C"
          opacity="0.15"
          transform="translate(1, 2)"
        />

        {/* Main fillet shape - elegant fish silhouette */}
        <path
          d="M 6 18 Q 4 16, 6 10 Q 12 4, 32 6 Q 52 8, 60 12 Q 62 16, 58 20 Q 48 26, 32 26 Q 16 26, 6 18 Z"
          fill="url(#filletGradient)"
        />

        {/* Top surface highlight */}
        <path
          d="M 8 14 Q 10 8, 32 8 Q 50 10, 56 14 Q 48 10, 32 10 Q 16 10, 8 14 Z"
          fill="#FFFEF8"
          opacity="0.6"
        />

        {/* Sear marks - golden brown caramelization */}
        <path d="M 12 10 Q 18 9, 24 11" stroke="url(#searGradient)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <path d="M 28 9 Q 36 8, 44 10" stroke="url(#searGradient)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <path d="M 48 11 Q 52 10, 56 12" stroke="url(#searGradient)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

        {/* Delicate flake texture lines */}
        <path d="M 14 14 L 14 20" stroke="#E8DCC8" strokeWidth="0.3" opacity="0.5" />
        <path d="M 24 12 L 24 22" stroke="#E8DCC8" strokeWidth="0.3" opacity="0.5" />
        <path d="M 34 12 L 34 22" stroke="#E8DCC8" strokeWidth="0.3" opacity="0.5" />
        <path d="M 44 12 L 44 20" stroke="#E8DCC8" strokeWidth="0.3" opacity="0.5" />
        <path d="M 52 14 L 52 18" stroke="#E8DCC8" strokeWidth="0.3" opacity="0.5" />

        {/* Subtle edge definition */}
        <path
          d="M 6 18 Q 4 16, 6 10 Q 12 4, 32 6 Q 52 8, 60 12 Q 62 16, 58 20 Q 48 26, 32 26 Q 16 26, 6 18 Z"
          fill="none"
          stroke="#C9A05C"
          strokeWidth="0.3"
          opacity="0.4"
        />
      </svg>
    </IngredientBase>
  );
}
