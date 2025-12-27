/**
 * SwooshTrail - Elegant sauce swoosh/smear
 * The classic fine dining sauce presentation - filled tapered shape
 */

import { IngredientBase, lighten, darken } from '../base';
import { IngredientBaseProps } from '../base/types';

interface SwooshTrailProps extends IngredientBaseProps {
  /** Base color of the sauce (default: dark jus brown) */
  color?: string;
  /** Direction of the swoosh */
  direction?: 'left' | 'right';
  /** Style of swoosh */
  style?: 'classic' | 'thin' | 'bold';
}

export function SwooshTrail({
  size,
  rotation,
  scale,
  shadow,
  className,
  color = '#3D2314',
  direction = 'right',
  style = 'classic',
}: SwooshTrailProps) {
  const highlight = lighten(color, 0.25);
  const shadowColor = darken(color, 0.2);

  // Filled tapered swoosh paths (thick at start, thin at end)
  const swooshPaths = {
    classic: {
      right: {
        // Outer edge (top of swoosh)
        main: 'M 6 24 Q 8 18, 20 17 Q 40 15, 60 12 Q 75 9, 86 6 L 86 10 Q 72 14, 55 18 Q 35 22, 18 26 Q 10 29, 6 32 Z',
        shadow: 'M 8 26 Q 10 20, 22 19 Q 42 17, 62 14 Q 77 11, 88 8 L 88 12 Q 74 16, 57 20 Q 37 24, 20 28 Q 12 31, 8 34 Z',
        highlight: 'M 8 20 Q 12 16, 24 15 Q 44 13, 64 10 Q 76 8, 84 6',
      },
      left: {
        main: 'M 86 24 Q 84 18, 72 17 Q 52 15, 32 12 Q 17 9, 6 6 L 6 10 Q 20 14, 37 18 Q 57 22, 74 26 Q 82 29, 86 32 Z',
        shadow: 'M 84 26 Q 82 20, 70 19 Q 50 17, 30 14 Q 15 11, 4 8 L 4 12 Q 18 16, 35 20 Q 55 24, 72 28 Q 80 31, 84 34 Z',
        highlight: 'M 84 20 Q 80 16, 68 15 Q 48 13, 28 10 Q 16 8, 8 6',
      },
    },
    thin: {
      right: {
        main: 'M 6 26 Q 10 22, 24 21 Q 48 19, 68 15 Q 80 12, 88 8 L 88 10 Q 78 14, 66 17 Q 45 21, 22 24 Q 12 26, 6 30 Z',
        shadow: 'M 8 28 Q 12 24, 26 23 Q 50 21, 70 17 Q 82 14, 90 10 L 90 12 Q 80 16, 68 19 Q 47 23, 24 26 Q 14 28, 8 32 Z',
        highlight: 'M 8 24 Q 14 20, 28 19 Q 52 17, 70 14 Q 80 11, 86 8',
      },
      left: {
        main: 'M 86 26 Q 82 22, 68 21 Q 44 19, 24 15 Q 12 12, 4 8 L 4 10 Q 14 14, 26 17 Q 47 21, 70 24 Q 80 26, 86 30 Z',
        shadow: 'M 84 28 Q 80 24, 66 23 Q 42 21, 22 17 Q 10 14, 2 10 L 2 12 Q 12 16, 24 19 Q 45 23, 68 26 Q 78 28, 84 32 Z',
        highlight: 'M 84 24 Q 78 20, 64 19 Q 40 17, 22 14 Q 12 11, 6 8',
      },
    },
    bold: {
      right: {
        main: 'M 4 20 Q 6 12, 18 10 Q 38 7, 58 5 Q 74 3, 88 2 L 88 8 Q 70 12, 50 16 Q 30 21, 14 28 Q 8 32, 4 36 Z',
        shadow: 'M 6 22 Q 8 14, 20 12 Q 40 9, 60 7 Q 76 5, 90 4 L 90 10 Q 72 14, 52 18 Q 32 23, 16 30 Q 10 34, 6 38 Z',
        highlight: 'M 6 16 Q 10 10, 22 8 Q 42 5, 62 3 Q 76 2, 86 2',
      },
      left: {
        main: 'M 88 20 Q 86 12, 74 10 Q 54 7, 34 5 Q 18 3, 4 2 L 4 8 Q 22 12, 42 16 Q 62 21, 78 28 Q 84 32, 88 36 Z',
        shadow: 'M 86 22 Q 84 14, 72 12 Q 52 9, 32 7 Q 16 5, 2 4 L 2 10 Q 20 14, 40 18 Q 60 23, 76 30 Q 82 34, 86 38 Z',
        highlight: 'M 86 16 Q 82 10, 70 8 Q 50 5, 30 3 Q 16 2, 6 2',
      },
    },
  };

  const paths = swooshPaths[style][direction];

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
          {/* Main sauce gradient */}
          <linearGradient id={`swooshGrad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="60%" stopColor={color} />
            <stop offset="100%" stopColor={shadowColor} stopOpacity="0.8" />
          </linearGradient>
          {/* Radial highlight for depth */}
          <radialGradient id={`swooshHighlight-${color.replace('#', '')}`} cx="20%" cy="30%" r="50%">
            <stop offset="0%" stopColor={highlight} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Soft shadow underneath */}
        <path
          d={paths.shadow}
          fill={shadowColor}
          opacity="0.2"
        />

        {/* Main sauce body - filled shape */}
        <path
          d={paths.main}
          fill={`url(#swooshGrad-${color.replace('#', '')})`}
        />

        {/* Depth/shine overlay */}
        <path
          d={paths.main}
          fill={`url(#swooshHighlight-${color.replace('#', '')})`}
        />

        {/* Top edge highlight */}
        <path
          d={paths.highlight}
          fill="none"
          stroke={highlight}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Specular highlights - small bright spots */}
        <circle
          cx={direction === 'right' ? 16 : 76}
          cy={direction === 'right' ? 22 : 22}
          r={style === 'bold' ? 2.5 : 1.8}
          fill="white"
          opacity="0.35"
        />
        <circle
          cx={direction === 'right' ? 36 : 56}
          cy={direction === 'right' ? 18 : 18}
          r={style === 'bold' ? 1.5 : 1}
          fill="white"
          opacity="0.25"
        />
      </svg>
    </IngredientBase>
  );
}

/**
 * SwooshPair - Two sauce swooshes creating a frame
 */
export function SwooshPair({ size, rotation, scale, shadow, className, color = '#3D2314' }: SwooshTrailProps) {
  const highlight = lighten(color, 0.25);
  const shadowColor = darken(color, 0.2);

  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={96}
      baseHeight={48}
    >
      <svg width="100%" height="100%" viewBox="0 0 96 48" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`swooshPairGrad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="60%" stopColor={color} />
            <stop offset="100%" stopColor={shadowColor} stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Top swoosh - filled tapered shape */}
        <path
          d="M 4 16 Q 6 10, 24 8 Q 48 5, 72 6 Q 88 7, 92 10 L 90 14 Q 70 12, 48 12 Q 26 13, 10 18 Q 6 20, 4 22 Z"
          fill={`url(#swooshPairGrad-${color.replace('#', '')})`}
        />
        <path
          d="M 6 12 Q 12 8, 28 6 Q 52 4, 74 5 Q 86 6, 90 8"
          fill="none"
          stroke={highlight}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Bottom swoosh - filled tapered shape (mirrored) */}
        <path
          d="M 4 32 Q 6 38, 24 40 Q 48 43, 72 42 Q 88 41, 92 38 L 90 34 Q 70 36, 48 36 Q 26 35, 10 30 Q 6 28, 4 26 Z"
          fill={`url(#swooshPairGrad-${color.replace('#', '')})`}
        />
        <path
          d="M 6 36 Q 12 40, 28 42 Q 52 44, 74 43 Q 86 42, 90 40"
          fill="none"
          stroke={highlight}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Specular highlights */}
        <circle cx="20" cy="14" r="1.5" fill="white" opacity="0.3" />
        <circle cx="20" cy="34" r="1.5" fill="white" opacity="0.3" />
      </svg>
    </IngredientBase>
  );
}
