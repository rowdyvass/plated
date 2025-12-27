/**
 * PowderedSugar - Dusted powdered sugar for desserts
 * Creates a fine dusting effect
 */

import { IngredientBase } from '../base';
import { IngredientBaseProps } from '../base/types';

export function PowderedSugarDust({ size, rotation, scale, className }: IngredientBaseProps) {
  // Pre-defined particle positions for consistent rendering
  const particles = [
    { cx: 8, cy: 6, r: 0.5, opacity: 0.4 }, { cx: 16, cy: 8, r: 0.6, opacity: 0.5 },
    { cx: 24, cy: 5, r: 0.4, opacity: 0.45 }, { cx: 32, cy: 7, r: 0.7, opacity: 0.55 },
    { cx: 40, cy: 6, r: 0.5, opacity: 0.4 }, { cx: 6, cy: 14, r: 0.6, opacity: 0.5 },
    { cx: 14, cy: 12, r: 0.5, opacity: 0.45 }, { cx: 22, cy: 15, r: 0.8, opacity: 0.6 },
    { cx: 30, cy: 13, r: 0.4, opacity: 0.4 }, { cx: 38, cy: 14, r: 0.6, opacity: 0.5 },
    { cx: 44, cy: 12, r: 0.5, opacity: 0.45 }, { cx: 10, cy: 20, r: 0.7, opacity: 0.55 },
    { cx: 18, cy: 22, r: 0.5, opacity: 0.4 }, { cx: 26, cy: 19, r: 0.6, opacity: 0.5 },
    { cx: 34, cy: 21, r: 0.4, opacity: 0.45 }, { cx: 42, cy: 20, r: 0.5, opacity: 0.5 },
    { cx: 5, cy: 26, r: 0.6, opacity: 0.5 }, { cx: 12, cy: 28, r: 0.5, opacity: 0.4 },
    { cx: 20, cy: 26, r: 0.7, opacity: 0.55 }, { cx: 28, cy: 27, r: 0.4, opacity: 0.45 },
    { cx: 36, cy: 25, r: 0.6, opacity: 0.5 }, { cx: 44, cy: 27, r: 0.5, opacity: 0.4 },
  ];

  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={false} // Dust doesn't cast shadows
      className={className}
      baseWidth={48}
      baseHeight={32}
    >
      <svg width="100%" height="100%" viewBox="0 0 48 32" fill="none" preserveAspectRatio="xMidYMid meet">
        {/* Sugar particles */}
        {particles.map((p, i) => (
          <circle
            key={i}
            cx={p.cx}
            cy={p.cy}
            r={p.r}
            fill="#FFFEF8"
            opacity={p.opacity}
          />
        ))}

        {/* Slightly larger clumps */}
        <circle cx="12" cy="10" r="1.2" fill="#FFFEF8" opacity="0.7" />
        <circle cx="28" cy="18" r="1" fill="#FFFEF8" opacity="0.6" />
        <circle cx="38" cy="8" r="0.9" fill="#FFFEF8" opacity="0.65" />
        <circle cx="20" cy="24" r="1.1" fill="#FFFEF8" opacity="0.55" />
      </svg>
    </IngredientBase>
  );
}

/**
 * BlackSalt - Coarse black salt crystals for finishing
 */
export function BlackSaltCrystals({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
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
        {/* Salt crystals - irregular angular shapes */}
        <polygon points="6,8 9,6 11,9 8,11" fill="#2D2D2D" opacity="0.9" />
        <polygon points="14,6 17,4 19,7 16,9" fill="#3D3D3D" opacity="0.85" />
        <polygon points="24,8 27,7 28,10 25,11" fill="#2D2D2D" opacity="0.9" />
        <polygon points="10,14 13,12 15,15 12,17" fill="#333333" opacity="0.85" />
        <polygon points="20,13 23,11 25,14 22,16" fill="#2D2D2D" opacity="0.9" />
        <polygon points="5,18 7,16 9,18 7,20" fill="#3D3D3D" opacity="0.8" />
        <polygon points="16,16 18,14 20,17 18,19" fill="#2D2D2D" opacity="0.85" />
        <polygon points="26,16 28,15 29,17 27,18" fill="#333333" opacity="0.8" />

        {/* Crystal highlights */}
        <line x1="7" y1="7" x2="9" y2="8" stroke="#5D5D5D" strokeWidth="0.5" opacity="0.6" />
        <line x1="15" y1="5" x2="17" y2="6" stroke="#5D5D5D" strokeWidth="0.5" opacity="0.6" />
        <line x1="25" y1="8" x2="27" y2="9" stroke="#5D5D5D" strokeWidth="0.5" opacity="0.6" />
        <line x1="11" y1="13" x2="13" y2="14" stroke="#5D5D5D" strokeWidth="0.5" opacity="0.6" />
      </svg>
    </IngredientBase>
  );
}

/**
 * FleurDeSel - Flaky finishing salt
 */
export function FleurDeSel({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={28}
      baseHeight={20}
    >
      <svg width="100%" height="100%" viewBox="0 0 28 20" fill="none" preserveAspectRatio="xMidYMid meet">
        {/* Delicate flaky crystals */}
        <path d="M 4 8 L 7 6 L 9 9 L 6 10 Z" fill="#F5F5F5" opacity="0.85" />
        <path d="M 12 5 L 15 4 L 16 7 L 13 8 Z" fill="#FFFFFF" opacity="0.9" />
        <path d="M 20 7 L 23 6 L 24 9 L 21 10 Z" fill="#F8F8F8" opacity="0.85" />
        <path d="M 8 13 L 10 11 L 12 13 L 10 15 Z" fill="#FFFFFF" opacity="0.8" />
        <path d="M 16 12 L 19 11 L 20 14 L 17 15 Z" fill="#F5F5F5" opacity="0.85" />

        {/* Crystal shimmer highlights */}
        <line x1="5" y1="7" x2="8" y2="8" stroke="white" strokeWidth="0.8" opacity="0.7" />
        <line x1="13" y1="5" x2="15" y2="6" stroke="white" strokeWidth="0.8" opacity="0.7" />
        <line x1="21" y1="7" x2="23" y2="8" stroke="white" strokeWidth="0.8" opacity="0.7" />
      </svg>
    </IngredientBase>
  );
}
