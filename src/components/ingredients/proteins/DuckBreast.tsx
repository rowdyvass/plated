/**
 * DuckBreast - Sliced roasted duck breast (magret)
 * Shows pink-red meat with crispy fat cap and caramelization
 */

import { IngredientBase } from '../base';
import { IngredientBaseProps } from '../base/types';

interface DuckBreastProps extends IngredientBaseProps {
  /** Number of slices to show (1-4) */
  slices?: number;
}

export function DuckBreast({ size, rotation, scale, shadow, className, slices = 3 }: DuckBreastProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={56}
      baseHeight={40}
    >
      <svg width="100%" height="100%" viewBox="0 0 56 40" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Duck meat gradient - rose pink to deeper red */}
          <linearGradient id="duckMeatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C08080" />
            <stop offset="40%" stopColor="#A05050" />
            <stop offset="100%" stopColor="#804040" />
          </linearGradient>

          {/* Fat cap gradient - golden rendered fat */}
          <linearGradient id="fatCapGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F5E6C8" />
            <stop offset="50%" stopColor="#E8D4A8" />
            <stop offset="100%" stopColor="#C9A05C" />
          </linearGradient>

          {/* Crispy skin gradient */}
          <linearGradient id="crispySkinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B5A2B" />
            <stop offset="100%" stopColor="#5D3A1A" />
          </linearGradient>
        </defs>

        {/* Slices arranged in fan pattern */}
        {Array.from({ length: Math.min(slices, 4) }).map((_, i) => {
          const offsetX = i * 10;
          const offsetY = i * 2;
          const zIndex = slices - i;

          return (
            <g key={i} style={{ zIndex }} transform={`translate(${offsetX}, ${offsetY})`}>
              {/* Slice shadow */}
              <ellipse cx="22" cy="22" rx="18" ry="12" fill="#3D2314" opacity="0.1" />

              {/* Main meat slice */}
              <path
                d="M 4 8 L 36 6 Q 40 10, 38 24 L 6 28 Q 2 24, 4 8 Z"
                fill="url(#duckMeatGradient)"
              />

              {/* Interior pink gradient - medium rare center */}
              <path
                d="M 8 12 L 32 10 Q 34 14, 32 22 L 10 24 Q 6 20, 8 12 Z"
                fill="#B86060"
                opacity="0.6"
              />

              {/* Fat cap on top */}
              <path
                d="M 4 8 L 36 6 Q 38 8, 36 10 L 6 12 Q 2 10, 4 8 Z"
                fill="url(#fatCapGradient)"
              />

              {/* Crispy skin layer */}
              <path
                d="M 4 8 L 36 6 L 36 7 L 4 9 Z"
                fill="url(#crispySkinGradient)"
              />

              {/* Fat cap highlight */}
              <path
                d="M 8 8 L 30 7"
                stroke="#FFFEF5"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.4"
              />

              {/* Meat fiber texture */}
              <path d="M 10 14 L 10 22" stroke="#904040" strokeWidth="0.3" opacity="0.4" />
              <path d="M 18 13 L 18 23" stroke="#904040" strokeWidth="0.3" opacity="0.4" />
              <path d="M 26 12 L 26 22" stroke="#904040" strokeWidth="0.3" opacity="0.4" />

              {/* Slice edge definition */}
              <path
                d="M 4 8 L 36 6 Q 40 10, 38 24 L 6 28 Q 2 24, 4 8 Z"
                fill="none"
                stroke="#5D3A1A"
                strokeWidth="0.3"
                opacity="0.3"
              />
            </g>
          );
        })}
      </svg>
    </IngredientBase>
  );
}
