/**
 * Pea - A single fresh garden pea
 * Small, spherical with natural highlight and color variation
 */

import { IngredientBase } from '../base';
import { IngredientBaseProps } from '../base/types';

export function Pea({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={24}
      baseHeight={24}
    >
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Pea gradient - vibrant green */}
          <radialGradient id="peaGradient" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#90EE90" />
            <stop offset="40%" stopColor="#5B8C3B" />
            <stop offset="80%" stopColor="#3D6B25" />
            <stop offset="100%" stopColor="#2E5520" />
          </radialGradient>
        </defs>

        {/* Soft shadow */}
        <ellipse cx="14" cy="15" rx="8" ry="6" fill="#1B4010" opacity="0.15" />

        {/* Main pea body */}
        <circle cx="12" cy="12" r="9" fill="url(#peaGradient)" />

        {/* Primary highlight */}
        <ellipse cx="8" cy="8" rx="3.5" ry="3" fill="#A5D66F" opacity="0.6" />

        {/* Small specular highlight */}
        <circle cx="7" cy="7" r="1.5" fill="#C5E8A5" opacity="0.7" />

        {/* Subtle rim light */}
        <path
          d="M 6 17 Q 3 12, 6 7"
          stroke="#7BAF50"
          strokeWidth="0.75"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
        />
      </svg>
    </IngredientBase>
  );
}

/**
 * PeaCluster - A small group of peas for scatter placement
 */
export function PeaCluster({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
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
      <svg width="100%" height="100%" viewBox="0 0 32 28" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="peaClusterGrad1" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#90EE90" />
            <stop offset="40%" stopColor="#5B8C3B" />
            <stop offset="100%" stopColor="#2E5520" />
          </radialGradient>
          <radialGradient id="peaClusterGrad2" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#8BD86B" />
            <stop offset="40%" stopColor="#4F7A35" />
            <stop offset="100%" stopColor="#2A4E1C" />
          </radialGradient>
        </defs>

        {/* Shadows */}
        <ellipse cx="10" cy="18" rx="4" ry="3" fill="#1B4010" opacity="0.1" />
        <ellipse cx="22" cy="16" rx="4" ry="3" fill="#1B4010" opacity="0.1" />
        <ellipse cx="14" cy="24" rx="5" ry="3" fill="#1B4010" opacity="0.1" />

        {/* Pea 1 - back left */}
        <circle cx="8" cy="12" r="5" fill="url(#peaClusterGrad1)" />
        <ellipse cx="6" cy="10" rx="2" ry="1.5" fill="#A5D66F" opacity="0.5" />
        <circle cx="5.5" cy="9.5" r="0.8" fill="#C5E8A5" opacity="0.6" />

        {/* Pea 2 - back right */}
        <circle cx="20" cy="10" r="5.5" fill="url(#peaClusterGrad2)" />
        <ellipse cx="17.5" cy="8" rx="2.2" ry="1.6" fill="#98D058" opacity="0.5" />
        <circle cx="17" cy="7.5" r="0.9" fill="#B8E088" opacity="0.6" />

        {/* Pea 3 - front center (slightly larger, in front) */}
        <circle cx="14" cy="18" r="6" fill="url(#peaClusterGrad1)" />
        <ellipse cx="11" cy="15" rx="2.5" ry="1.8" fill="#A5D66F" opacity="0.6" />
        <circle cx="10.5" cy="14.5" r="1" fill="#C5E8A5" opacity="0.7" />

        {/* Pea 4 - small one tucked in */}
        <circle cx="24" cy="18" r="4" fill="url(#peaClusterGrad2)" />
        <ellipse cx="22" cy="16" rx="1.5" ry="1.2" fill="#98D058" opacity="0.5" />
      </svg>
    </IngredientBase>
  );
}
