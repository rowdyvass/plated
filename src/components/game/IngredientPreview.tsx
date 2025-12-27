/**
 * IngredientPreview - Renders ingredient visuals using the new component library
 * This component bridges the game's ingredient ID system with the new SVG-based components
 */

import { getIngredient, hasIngredient } from '@/components/ingredients';
import type { IngredientSize } from '@/components/ingredients/base/types';

interface IngredientPreviewProps {
  ingredientId: string;
  size?: number; // Size in pixels (maps to size variants)
  className?: string;
}

/**
 * Map pixel sizes to ingredient size variants
 */
function getSizeVariant(pixels: number): IngredientSize {
  if (pixels <= 40) return 'preview';
  if (pixels <= 64) return 'plate';
  return 'detail';
}

export function IngredientPreview({ ingredientId, size = 56, className = '' }: IngredientPreviewProps) {
  // Try to get the new component from the registry
  const IngredientComponent = getIngredient(ingredientId);

  if (IngredientComponent) {
    const sizeVariant = getSizeVariant(size);

    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <IngredientComponent size={sizeVariant} />
      </div>
    );
  }

  // Fallback for unknown ingredients - simple colored circle
  return (
    <div
      className={`rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Check if an ingredient has a visual component available
 */
export function hasIngredientVisual(ingredientId: string): boolean {
  return hasIngredient(ingredientId);
}
