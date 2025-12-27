/**
 * ButterPat - A rectangular pat of cultured butter
 * Gouache style with soft highlights and subtle texture
 */

import { IngredientBase } from '../base';
import { IngredientBaseProps } from '../base/types';

export function ButterPat({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={48}
      baseHeight={32}
    >
      <svg width="100%" height="100%" viewBox="0 0 48 32" fill="none" preserveAspectRatio="xMidYMid meet">
        {/* Soft shadow underneath */}
        <rect x="5" y="8" width="40" height="20" rx="2" fill="#E8D88F" opacity="0.4" />

        {/* Main butter body - rich cultured butter yellow */}
        <rect x="4" y="6" width="40" height="20" rx="2" fill="#F5E6A3" />

        {/* Top surface - lighter, catching light */}
        <rect x="4" y="6" width="40" height="10" rx="2" fill="#F8EEB8" />

        {/* Soft highlight on top edge - gouache style soft edge */}
        <rect x="6" y="7" width="36" height="3" rx="1.5" fill="#FFFEF5" opacity="0.5" />

        {/* Secondary highlight spot */}
        <ellipse cx="14" cy="10" rx="6" ry="2" fill="#FFFDF8" opacity="0.4" />

        {/* Subtle vertical cut marks - knife impressions */}
        <line x1="16" y1="8" x2="16" y2="24" stroke="#E8D88F" strokeWidth="0.5" opacity="0.6" />
        <line x1="32" y1="8" x2="32" y2="24" stroke="#E8D88F" strokeWidth="0.5" opacity="0.6" />

        {/* Bottom edge - darker, in shadow */}
        <rect x="4" y="22" width="40" height="4" rx="2" fill="#E5D48A" />

        {/* Subtle surface texture - gouache brush marks */}
        <path
          d="M 8 14 Q 12 13 16 14 Q 20 15 24 14 Q 28 13 32 14 Q 36 15 40 14"
          fill="none"
          stroke="#EDE3A0"
          strokeWidth="0.5"
          opacity="0.5"
        />

        {/* Edge definition */}
        <rect x="4" y="6" width="40" height="20" rx="2" fill="none" stroke="#D4C57A" strokeWidth="0.3" />
      </svg>
    </IngredientBase>
  );
}
