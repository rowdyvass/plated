/**
 * IngredientBase - Base wrapper component for all ingredient visuals
 * Provides consistent sizing, rotation, scaling, and shadow handling
 */

import { ReactNode } from 'react';
import { IngredientBaseProps, sizeMultipliers } from './types';

interface IngredientBaseWrapperProps extends IngredientBaseProps {
  children: ReactNode;
  /** Base width of the SVG (height is auto-calculated) */
  baseWidth?: number;
  /** Base height of the SVG */
  baseHeight?: number;
}

export function IngredientBase({
  size,
  rotation = 0,
  scale = 1,
  shadow = true,
  className = '',
  children,
  baseWidth = 48,
  baseHeight = 48,
}: IngredientBaseWrapperProps) {
  const multiplier = sizeMultipliers[size] * scale;
  const width = baseWidth * multiplier;
  const height = baseHeight * multiplier;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{
        width,
        height,
        transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
        filter: shadow ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' : undefined,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Color utility functions for ingredient rendering
 */

// Lighten a hex color by a percentage
export function lighten(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const newR = Math.min(255, Math.round(r + (255 - r) * amount));
  const newG = Math.min(255, Math.round(g + (255 - g) * amount));
  const newB = Math.min(255, Math.round(b + (255 - b) * amount));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Darken a hex color by a percentage
export function darken(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const newR = Math.max(0, Math.round(r * (1 - amount)));
  const newG = Math.max(0, Math.round(g * (1 - amount)));
  const newB = Math.max(0, Math.round(b * (1 - amount)));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Generate a color palette from a base color
export function generatePalette(color: string) {
  return {
    main: color,
    highlight: lighten(color, 0.25),
    shadow: darken(color, 0.2),
  };
}
