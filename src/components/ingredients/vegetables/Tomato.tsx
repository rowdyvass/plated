/**
 * Tomato - Heirloom tomato slice
 * Cross-section showing seed chambers and vibrant color
 */

import { IngredientBase } from '../base';
import { IngredientBaseProps } from '../base/types';

export function TomatoSlice({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
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
          {/* Outer skin gradient */}
          <radialGradient id="tomatoSkin" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#E53935" />
            <stop offset="60%" stopColor="#C62828" />
            <stop offset="100%" stopColor="#B71C1C" />
          </radialGradient>

          {/* Inner flesh gradient */}
          <radialGradient id="tomatoFlesh" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF5350" />
            <stop offset="100%" stopColor="#E53935" />
          </radialGradient>

          {/* Seed chamber gradient */}
          <radialGradient id="seedChamber" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFAB91" />
            <stop offset="100%" stopColor="#FF8A65" />
          </radialGradient>
        </defs>

        {/* Outer skin ring */}
        <circle cx="24" cy="24" r="22" fill="url(#tomatoSkin)" />

        {/* Inner flesh */}
        <circle cx="24" cy="24" r="19" fill="url(#tomatoFlesh)" />

        {/* Seed chambers - 4 sections */}
        <ellipse cx="16" cy="16" rx="5" ry="7" fill="url(#seedChamber)" transform="rotate(-30 16 16)" />
        <ellipse cx="32" cy="16" rx="5" ry="7" fill="url(#seedChamber)" transform="rotate(30 32 16)" />
        <ellipse cx="16" cy="32" rx="5" ry="6" fill="url(#seedChamber)" transform="rotate(-150 16 32)" />
        <ellipse cx="32" cy="32" rx="5" ry="6" fill="url(#seedChamber)" transform="rotate(150 32 32)" />

        {/* Central core */}
        <ellipse cx="24" cy="24" rx="4" ry="4" fill="#FFCCBC" opacity="0.7" />

        {/* Seeds */}
        <ellipse cx="14" cy="14" rx="1.5" ry="2.5" fill="#F5DEB3" transform="rotate(-40 14 14)" />
        <ellipse cx="18" cy="18" rx="1.2" ry="2" fill="#F5DEB3" transform="rotate(-20 18 18)" />
        <ellipse cx="30" cy="14" rx="1.5" ry="2.5" fill="#F5DEB3" transform="rotate(40 30 14)" />
        <ellipse cx="34" cy="18" rx="1.2" ry="2" fill="#F5DEB3" transform="rotate(60 34 18)" />
        <ellipse cx="14" cy="30" rx="1.3" ry="2" fill="#F5DEB3" transform="rotate(-120 14 30)" />
        <ellipse cx="18" cy="34" rx="1.2" ry="2" fill="#F5DEB3" transform="rotate(-150 18 34)" />
        <ellipse cx="30" cy="30" rx="1.3" ry="2" fill="#F5DEB3" transform="rotate(120 30 30)" />
        <ellipse cx="34" cy="34" rx="1.2" ry="2" fill="#F5DEB3" transform="rotate(150 34 34)" />

        {/* Dividing walls between chambers */}
        <path d="M 24 6 L 24 18" stroke="#C62828" strokeWidth="1.5" opacity="0.4" />
        <path d="M 24 30 L 24 42" stroke="#C62828" strokeWidth="1.5" opacity="0.4" />
        <path d="M 6 24 L 18 24" stroke="#C62828" strokeWidth="1.5" opacity="0.4" />
        <path d="M 30 24 L 42 24" stroke="#C62828" strokeWidth="1.5" opacity="0.4" />

        {/* Highlight */}
        <ellipse cx="16" cy="12" rx="6" ry="4" fill="white" opacity="0.15" />

        {/* Skin edge definition */}
        <circle cx="24" cy="24" r="22" fill="none" stroke="#B71C1C" strokeWidth="0.5" opacity="0.5" />
      </svg>
    </IngredientBase>
  );
}

/**
 * CherryTomato - Whole cherry tomato
 */
export function CherryTomato({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={24}
      baseHeight={28}
    >
      <svg width="100%" height="100%" viewBox="0 0 24 28" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="cherryTomatoGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FF6347" />
            <stop offset="50%" stopColor="#E53935" />
            <stop offset="100%" stopColor="#C62828" />
          </radialGradient>
        </defs>

        {/* Calyx (green top) */}
        <path
          d="M 12 4 L 8 6 L 10 5 L 12 7 L 14 5 L 16 6 L 12 4"
          fill="#4A7023"
        />
        <path d="M 12 4 L 12 2" stroke="#3D6020" strokeWidth="1" strokeLinecap="round" />

        {/* Main tomato body */}
        <ellipse cx="12" cy="16" rx="10" ry="11" fill="url(#cherryTomatoGrad)" />

        {/* Highlight */}
        <ellipse cx="8" cy="12" rx="4" ry="3" fill="white" opacity="0.3" />
        <ellipse cx="7" cy="11" rx="2" ry="1.5" fill="white" opacity="0.3" />

        {/* Bottom shadow */}
        <ellipse cx="14" cy="22" rx="6" ry="3" fill="#B71C1C" opacity="0.3" />
      </svg>
    </IngredientBase>
  );
}
