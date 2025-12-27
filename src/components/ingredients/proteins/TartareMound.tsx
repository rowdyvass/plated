/**
 * TartareMound - Hand-cut beef tartare formed into a neat cylinder
 * Top-down view showing the circular top surface with fine dice texture
 */

import { IngredientBase } from '../base';
import { IngredientBaseProps } from '../base/types';

export function TartareMound({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={48}
      baseHeight={48}
    >
      <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Top surface gradient - rich beef red with subtle 3D */}
          <radialGradient id="tartareTopGradient" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#C04848" />
            <stop offset="40%" stopColor="#9B3838" />
            <stop offset="80%" stopColor="#8B3030" />
            <stop offset="100%" stopColor="#702020" />
          </radialGradient>
        </defs>

        {/* Soft shadow underneath */}
        <ellipse cx="26" cy="26" rx="18" ry="18" fill="#4A2020" opacity="0.15" />

        {/* Main circular top surface */}
        <circle cx="24" cy="24" r="18" fill="url(#tartareTopGradient)" />

        {/* Texture - fine dice pattern scattered across top */}
        {/* Ring 1 - outer */}
        <rect x="8" y="18" width="2.5" height="2" rx="0.3" fill="#C04848" opacity="0.6" transform="rotate(-20 9 19)" />
        <rect x="14" y="8" width="2.5" height="2" rx="0.3" fill="#9B3838" opacity="0.5" transform="rotate(15 15 9)" />
        <rect x="28" y="9" width="2.5" height="2" rx="0.3" fill="#C04848" opacity="0.55" transform="rotate(-10 29 10)" />
        <rect x="36" y="18" width="2.5" height="2" rx="0.3" fill="#9B3838" opacity="0.6" transform="rotate(25 37 19)" />
        <rect x="36" y="28" width="2.5" height="2" rx="0.3" fill="#C04848" opacity="0.55" transform="rotate(-15 37 29)" />
        <rect x="28" y="36" width="2.5" height="2" rx="0.3" fill="#9B3838" opacity="0.5" transform="rotate(5 29 37)" />
        <rect x="14" y="36" width="2.5" height="2" rx="0.3" fill="#C04848" opacity="0.6" transform="rotate(-25 15 37)" />
        <rect x="7" y="28" width="2.5" height="2" rx="0.3" fill="#9B3838" opacity="0.55" transform="rotate(10 8 29)" />

        {/* Ring 2 - middle */}
        <rect x="14" y="14" width="2.5" height="2" rx="0.3" fill="#C04848" opacity="0.6" transform="rotate(8 15 15)" />
        <rect x="22" y="12" width="2.5" height="2" rx="0.3" fill="#9B3838" opacity="0.55" transform="rotate(-12 23 13)" />
        <rect x="30" y="15" width="2.5" height="2" rx="0.3" fill="#C04848" opacity="0.5" transform="rotate(20 31 16)" />
        <rect x="32" y="24" width="2.5" height="2" rx="0.3" fill="#9B3838" opacity="0.6" transform="rotate(-8 33 25)" />
        <rect x="30" y="32" width="2.5" height="2" rx="0.3" fill="#C04848" opacity="0.55" transform="rotate(15 31 33)" />
        <rect x="22" y="34" width="2.5" height="2" rx="0.3" fill="#9B3838" opacity="0.5" transform="rotate(-20 23 35)" />
        <rect x="13" y="31" width="2.5" height="2" rx="0.3" fill="#C04848" opacity="0.6" transform="rotate(5 14 32)" />
        <rect x="11" y="22" width="2.5" height="2" rx="0.3" fill="#9B3838" opacity="0.55" transform="rotate(-10 12 23)" />

        {/* Ring 3 - center */}
        <rect x="18" y="19" width="2.5" height="2" rx="0.3" fill="#9B3838" opacity="0.5" transform="rotate(12 19 20)" />
        <rect x="26" y="18" width="2.5" height="2" rx="0.3" fill="#C04848" opacity="0.55" transform="rotate(-18 27 19)" />
        <rect x="28" y="26" width="2.5" height="2" rx="0.3" fill="#9B3838" opacity="0.5" transform="rotate(8 29 27)" />
        <rect x="20" y="28" width="2.5" height="2" rx="0.3" fill="#C04848" opacity="0.55" transform="rotate(-5 21 29)" />

        {/* Center pieces */}
        <rect x="22" y="22" width="2.5" height="2" rx="0.3" fill="#C04848" opacity="0.6" transform="rotate(15 23 23)" />
        <rect x="23" y="25" width="2.5" height="2" rx="0.3" fill="#9B3838" opacity="0.5" transform="rotate(-22 24 26)" />

        {/* Highlight - subtle light reflection */}
        <ellipse cx="18" cy="18" rx="5" ry="4" fill="#D05858" opacity="0.25" />

        {/* Rim of the mold/ring mark */}
        <circle cx="24" cy="24" r="18" fill="none" stroke="#602020" strokeWidth="0.5" opacity="0.4" />

        {/* Inner subtle depth ring */}
        <circle cx="24" cy="24" r="15" fill="none" stroke="#501818" strokeWidth="0.3" opacity="0.2" />
      </svg>
    </IngredientBase>
  );
}
