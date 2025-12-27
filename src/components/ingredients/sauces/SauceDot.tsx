/**
 * SauceDot - A single sauce dot for precise plating
 * Glossy appearance with subtle highlights
 */

import { IngredientBase, lighten } from '../base';
import { IngredientBaseProps } from '../base/types';

interface SauceDotProps extends IngredientBaseProps {
  /** Base color of the sauce (default: dark brown) */
  color?: string;
  /** Sauce type affects sheen and opacity */
  type?: 'glossy' | 'matte' | 'oil';
}

export function SauceDot({ size, rotation, scale, shadow, className, color = '#4A3728', type = 'glossy' }: SauceDotProps) {
  const highlight = lighten(color, 0.4);
  const opacity = type === 'oil' ? 0.85 : 1;
  const sheenOpacity = type === 'matte' ? 0.3 : type === 'oil' ? 0.5 : 0.6;

  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={16}
      baseHeight={16}
    >
      <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id={`dotGrad-${color.replace('#', '')}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor={highlight} />
            <stop offset="50%" stopColor={color} />
            <stop offset="100%" stopColor={color} />
          </radialGradient>
        </defs>

        {/* Soft outer edge for sauce spread */}
        <circle cx="8" cy="8" r="7" fill={color} opacity={opacity * 0.4} />

        {/* Main dot body */}
        <circle cx="8" cy="8" r="6" fill={`url(#dotGrad-${color.replace('#', '')})`} opacity={opacity} />

        {/* Specular highlight */}
        <ellipse cx="6" cy="6" rx="2.5" ry="2" fill="white" opacity={sheenOpacity} />

        {/* Secondary smaller highlight */}
        <circle cx="5.5" cy="5.5" r="1" fill="white" opacity={sheenOpacity * 0.8} />
      </svg>
    </IngredientBase>
  );
}

/**
 * SauceDotCluster - Multiple sauce dots arranged in a pattern
 */
interface SauceDotClusterProps extends IngredientBaseProps {
  color?: string;
  pattern?: 'line' | 'triangle' | 'arc';
}

export function SauceDotCluster({ size, rotation, scale, shadow, className, color = '#4A3728', pattern = 'line' }: SauceDotClusterProps) {
  const highlight = lighten(color, 0.35);

  const patterns = {
    line: [
      { cx: 8, cy: 16, r: 5 },
      { cx: 22, cy: 16, r: 4.5 },
      { cx: 34, cy: 16, r: 4 },
    ],
    triangle: [
      { cx: 21, cy: 8, r: 5 },
      { cx: 10, cy: 24, r: 4.5 },
      { cx: 32, cy: 24, r: 4 },
    ],
    arc: [
      { cx: 8, cy: 20, r: 4.5 },
      { cx: 21, cy: 12, r: 5 },
      { cx: 34, cy: 20, r: 4.5 },
    ],
  };

  const dots = patterns[pattern];

  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={42}
      baseHeight={32}
    >
      <svg width="100%" height="100%" viewBox="0 0 42 32" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id={`clusterGrad-${color.replace('#', '')}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor={highlight} />
            <stop offset="100%" stopColor={color} />
          </radialGradient>
        </defs>

        {dots.map((dot, i) => (
          <g key={i}>
            {/* Soft spread */}
            <circle cx={dot.cx} cy={dot.cy} r={dot.r + 1} fill={color} opacity="0.3" />
            {/* Main dot */}
            <circle cx={dot.cx} cy={dot.cy} r={dot.r} fill={`url(#clusterGrad-${color.replace('#', '')})`} />
            {/* Highlight */}
            <ellipse
              cx={dot.cx - dot.r * 0.25}
              cy={dot.cy - dot.r * 0.25}
              rx={dot.r * 0.35}
              ry={dot.r * 0.28}
              fill="white"
              opacity="0.5"
            />
          </g>
        ))}
      </svg>
    </IngredientBase>
  );
}
