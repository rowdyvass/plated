/**
 * PigeonBreast - Roasted squab/pigeon breast
 * Smaller, darker meat than duck with elegant presentation
 */

import { IngredientBase } from '../base';
import { IngredientBaseProps } from '../base/types';

export function PigeonBreast({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={44}
      baseHeight={28}
    >
      <svg width="100%" height="100%" viewBox="0 0 44 28" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Pigeon meat gradient - deeper, gamier color than duck */}
          <linearGradient id="pigeonMeatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B4050" />
            <stop offset="40%" stopColor="#703040" />
            <stop offset="100%" stopColor="#502030" />
          </linearGradient>

          {/* Crispy skin */}
          <linearGradient id="pigeonSkinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6B3A2B" />
            <stop offset="100%" stopColor="#4A2818" />
          </linearGradient>
        </defs>

        {/* Soft shadow */}
        <ellipse cx="23" cy="16" rx="18" ry="10" fill="#2D1A14" opacity="0.15" />

        {/* Main breast shape - more compact oval */}
        <path
          d="M 4 14 Q 2 8, 10 4 Q 22 2, 34 4 Q 42 8, 40 14 Q 42 20, 34 24 Q 22 26, 10 24 Q 2 20, 4 14 Z"
          fill="url(#pigeonMeatGradient)"
        />

        {/* Crispy skin on top third */}
        <path
          d="M 4 14 Q 2 8, 10 4 Q 22 2, 34 4 Q 42 8, 40 10 Q 30 12, 22 12 Q 14 12, 4 10 Z"
          fill="url(#pigeonSkinGradient)"
        />

        {/* Skin texture - scoring marks */}
        <path d="M 10 6 L 12 10" stroke="#3D2214" strokeWidth="0.5" opacity="0.5" />
        <path d="M 18 5 L 20 10" stroke="#3D2214" strokeWidth="0.5" opacity="0.5" />
        <path d="M 26 5 L 24 10" stroke="#3D2214" strokeWidth="0.5" opacity="0.5" />
        <path d="M 34 6 L 32 10" stroke="#3D2214" strokeWidth="0.5" opacity="0.5" />

        {/* Rose pink center - medium rare */}
        <ellipse cx="22" cy="16" rx="10" ry="6" fill="#9B5060" opacity="0.5" />

        {/* Skin highlight */}
        <path
          d="M 12 5 Q 22 4, 32 5"
          stroke="#8B6040"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Meat highlight at edge */}
        <path
          d="M 8 18 Q 6 14, 8 10"
          stroke="#A06070"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* Subtle edge definition */}
        <path
          d="M 4 14 Q 2 8, 10 4 Q 22 2, 34 4 Q 42 8, 40 14 Q 42 20, 34 24 Q 22 26, 10 24 Q 2 20, 4 14 Z"
          fill="none"
          stroke="#3D1A14"
          strokeWidth="0.3"
          opacity="0.4"
        />
      </svg>
    </IngredientBase>
  );
}
