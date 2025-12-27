/**
 * DrizzleLine - Oil or sauce drizzle
 * Thin organic line with natural variation and glossy appearance
 */

import { IngredientBase, lighten, darken } from '../base';
import { IngredientBaseProps } from '../base/types';

interface DrizzleLineProps extends IngredientBaseProps {
  /** Base color of the oil/sauce (default: olive oil green) */
  color?: string;
  /** Style of drizzle */
  style?: 'straight' | 'wavy' | 'spiral';
}

export function DrizzleLine({
  size,
  rotation,
  scale,
  shadow,
  className,
  color = '#8B9A42',
  style = 'wavy',
}: DrizzleLineProps) {
  const highlight = lighten(color, 0.4);
  const shadowColor = darken(color, 0.15);

  // Filled paths that create a thin but visible drizzle with slight thickness variation
  const paths = {
    straight: {
      main: 'M 4 30 Q 20 26, 36 22 Q 52 18, 68 14 Q 80 10, 88 6 L 88 8 Q 78 13, 66 17 Q 50 22, 34 26 Q 18 30, 4 34 Z',
      shadow: 'M 6 32 Q 22 28, 38 24 Q 54 20, 70 16 Q 82 12, 90 8 L 90 10 Q 80 15, 68 19 Q 52 24, 36 28 Q 20 32, 6 36 Z',
      highlight: 'M 6 28 Q 22 24, 38 20 Q 54 16, 70 12 Q 80 9, 86 6',
      pools: [{ cx: 10, cy: 30 }, { cx: 50, cy: 20 }],
    },
    wavy: {
      main: 'M 4 34 Q 14 28, 22 30 Q 30 32, 38 26 Q 46 20, 54 22 Q 62 24, 70 18 Q 80 12, 88 10 L 88 12 Q 78 16, 68 22 Q 60 28, 52 26 Q 44 24, 36 30 Q 28 36, 20 34 Q 12 32, 4 38 Z',
      shadow: 'M 6 36 Q 16 30, 24 32 Q 32 34, 40 28 Q 48 22, 56 24 Q 64 26, 72 20 Q 82 14, 90 12 L 90 14 Q 80 18, 70 24 Q 62 30, 54 28 Q 46 26, 38 32 Q 30 38, 22 36 Q 14 34, 6 40 Z',
      highlight: 'M 6 32 Q 16 26, 24 28 Q 32 30, 40 24 Q 48 18, 56 20 Q 64 22, 72 16 Q 80 10, 86 8',
      pools: [{ cx: 22, cy: 32 }, { cx: 54, cy: 24 }, { cx: 78, cy: 14 }],
    },
    spiral: {
      main: 'M 4 26 Q 14 20, 26 24 Q 38 28, 46 22 Q 54 16, 66 20 Q 78 24, 88 18 L 88 20 Q 76 28, 64 24 Q 52 20, 44 26 Q 36 32, 24 28 Q 12 24, 4 30 Z',
      shadow: 'M 6 28 Q 16 22, 28 26 Q 40 30, 48 24 Q 56 18, 68 22 Q 80 26, 90 20 L 90 22 Q 78 30, 66 26 Q 54 22, 46 28 Q 38 34, 26 30 Q 14 26, 6 32 Z',
      highlight: 'M 6 24 Q 16 18, 28 22 Q 40 26, 48 20 Q 56 14, 68 18 Q 78 22, 86 16',
      pools: [{ cx: 28, cy: 26 }, { cx: 66, cy: 22 }],
    },
  };

  const pathData = paths[style];

  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={92}
      baseHeight={40}
    >
      <svg width="100%" height="100%" viewBox="0 0 92 40" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Gradient for glossy oil effect */}
          <linearGradient id={`drizzleGrad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="50%" stopColor={color} />
            <stop offset="100%" stopColor={shadowColor} stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Soft shadow/spread underneath */}
        <path
          d={pathData.shadow}
          fill={shadowColor}
          opacity="0.15"
        />

        {/* Main drizzle body - filled shape */}
        <path
          d={pathData.main}
          fill={`url(#drizzleGrad-${color.replace('#', '')})`}
        />

        {/* Top edge highlight for glossy effect */}
        <path
          d={pathData.highlight}
          fill="none"
          stroke={highlight}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Small pooling spots where oil collects */}
        {pathData.pools.map((pool, i) => (
          <g key={i}>
            <ellipse cx={pool.cx} cy={pool.cy} rx="3" ry="2.5" fill={color} opacity="0.7" />
            <ellipse cx={pool.cx - 0.8} cy={pool.cy - 0.8} rx="1" ry="0.8" fill={highlight} opacity="0.5" />
          </g>
        ))}
      </svg>
    </IngredientBase>
  );
}

/**
 * OilDroplets - Scattered oil droplets
 */
interface OilDropletsProps extends IngredientBaseProps {
  color?: string;
}

export function OilDroplets({ size, rotation, scale, shadow, className, color = '#8B9A42' }: OilDropletsProps) {
  const highlight = lighten(color, 0.4);

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
        {/* Droplet 1 - large */}
        <ellipse cx="12" cy="12" rx="6" ry="5" fill={color} opacity="0.8" />
        <ellipse cx="10" cy="10" rx="2.5" ry="2" fill={highlight} opacity="0.5" />

        {/* Droplet 2 - medium */}
        <ellipse cx="32" cy="10" rx="5" ry="4" fill={color} opacity="0.75" />
        <ellipse cx="30" cy="8" rx="2" ry="1.5" fill={highlight} opacity="0.5" />

        {/* Droplet 3 - small */}
        <ellipse cx="24" cy="22" rx="4" ry="3.5" fill={color} opacity="0.8" />
        <ellipse cx="22.5" cy="20.5" rx="1.5" ry="1.2" fill={highlight} opacity="0.5" />

        {/* Droplet 4 - tiny */}
        <circle cx="40" cy="20" r="2.5" fill={color} opacity="0.7" />
        <circle cx="39" cy="19" r="0.8" fill={highlight} opacity="0.5" />

        {/* Droplet 5 - tiny */}
        <circle cx="8" cy="26" r="2" fill={color} opacity="0.65" />
        <circle cx="7.2" cy="25.2" r="0.6" fill={highlight} opacity="0.5" />
      </svg>
    </IngredientBase>
  );
}
