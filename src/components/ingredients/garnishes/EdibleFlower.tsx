/**
 * EdibleFlower - Delicate edible flower for fine dining garnish
 * Multiple color variants available
 */

import { IngredientBase } from '../base';
import { IngredientBaseProps, FlowerProps } from '../base/types';

const petalColors: Record<string, { main: string; highlight: string; center: string }> = {
  purple: { main: '#9B7BB8', highlight: '#C9A8E0', center: '#FFD700' },
  yellow: { main: '#FFD54F', highlight: '#FFEC8B', center: '#FF8C00' },
  white: { main: '#FFFEF5', highlight: '#FFFFFF', center: '#FFD700' },
  pink: { main: '#F8BBD9', highlight: '#FFDDE8', center: '#FFD700' },
  orange: { main: '#FFB347', highlight: '#FFD699', center: '#D2691E' },
  blue: { main: '#87CEEB', highlight: '#B8E0F0', center: '#FFD700' },
};

export function EdibleFlower({ size, rotation, scale, shadow, className, color = 'purple' }: FlowerProps) {
  const { main, highlight, center } = petalColors[color];

  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={32}
      baseHeight={32}
    >
      <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id={`petalGrad-${color}`} cx="50%" cy="20%" r="80%">
            <stop offset="0%" stopColor={highlight} />
            <stop offset="100%" stopColor={main} />
          </radialGradient>
        </defs>

        {/* 6 petals arranged in circle */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse
            key={angle}
            cx="16"
            cy="8"
            rx="5"
            ry="8"
            fill={`url(#petalGrad-${color})`}
            transform={`rotate(${angle} 16 16)`}
            opacity="0.9"
          />
        ))}

        {/* Petal veins/texture */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <path
            key={`vein-${angle}`}
            d="M 16 8 L 16 14"
            stroke={main}
            strokeWidth="0.3"
            opacity="0.3"
            transform={`rotate(${angle} 16 16)`}
          />
        ))}

        {/* Center - stamen area */}
        <circle cx="16" cy="16" r="4" fill={center} />

        {/* Center texture - tiny dots */}
        <circle cx="14.5" cy="15" r="0.6" fill="#8B6914" opacity="0.5" />
        <circle cx="17.5" cy="15" r="0.6" fill="#8B6914" opacity="0.5" />
        <circle cx="16" cy="17.5" r="0.6" fill="#8B6914" opacity="0.5" />
        <circle cx="15" cy="16.5" r="0.5" fill="#8B6914" opacity="0.4" />
        <circle cx="17" cy="16.5" r="0.5" fill="#8B6914" opacity="0.4" />

        {/* Center highlight */}
        <circle cx="15" cy="15" r="1.5" fill="white" opacity="0.3" />
      </svg>
    </IngredientBase>
  );
}

/**
 * MicroFlower - Very small delicate flower
 */
export function MicroFlower({ size, rotation, scale, shadow, className, color = 'white' }: FlowerProps) {
  const { main, highlight, center } = petalColors[color];

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
        {/* 5 tiny petals */}
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse
            key={angle}
            cx="8"
            cy="4"
            rx="2.5"
            ry="4"
            fill={main}
            opacity="0.85"
            transform={`rotate(${angle} 8 8)`}
          />
        ))}

        {/* Petal highlights */}
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse
            key={`h-${angle}`}
            cx="8"
            cy="3.5"
            rx="1"
            ry="1.5"
            fill={highlight}
            opacity="0.4"
            transform={`rotate(${angle} 8 8)`}
          />
        ))}

        {/* Center */}
        <circle cx="8" cy="8" r="2" fill={center} />
        <circle cx="7.5" cy="7.5" r="0.8" fill="white" opacity="0.4" />
      </svg>
    </IngredientBase>
  );
}

/**
 * FlowerCluster - Small cluster of micro flowers
 */
export function FlowerCluster({ size, rotation, scale, shadow, className }: IngredientBaseProps) {
  return (
    <IngredientBase
      size={size}
      rotation={rotation}
      scale={scale}
      shadow={shadow}
      className={className}
      baseWidth={40}
      baseHeight={32}
    >
      <svg width="100%" height="100%" viewBox="0 0 40 32" fill="none" preserveAspectRatio="xMidYMid meet">
        {/* Flower 1 - purple */}
        <g transform="translate(8, 8)">
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="6"
              cy="2"
              rx="2"
              ry="3.5"
              fill="#9B7BB8"
              opacity="0.85"
              transform={`rotate(${angle} 6 6)`}
            />
          ))}
          <circle cx="6" cy="6" r="1.5" fill="#FFD700" />
        </g>

        {/* Flower 2 - white */}
        <g transform="translate(22, 4)">
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="6"
              cy="2"
              rx="2.2"
              ry="3.8"
              fill="#FFFEF5"
              opacity="0.9"
              transform={`rotate(${angle} 6 6)`}
            />
          ))}
          <circle cx="6" cy="6" r="1.5" fill="#FFD700" />
        </g>

        {/* Flower 3 - pink */}
        <g transform="translate(14, 18)">
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="5"
              cy="1.5"
              rx="1.8"
              ry="3"
              fill="#F8BBD9"
              opacity="0.85"
              transform={`rotate(${angle} 5 5)`}
            />
          ))}
          <circle cx="5" cy="5" r="1.2" fill="#FFD700" />
        </g>
      </svg>
    </IngredientBase>
  );
}
