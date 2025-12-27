/**
 * Ingredient component types and interfaces
 * Base types for all ingredient visual components
 */

// Size variants for different use contexts
export type IngredientSize = 'preview' | 'plate' | 'detail';

// Size multipliers for each variant
export const sizeMultipliers: Record<IngredientSize, number> = {
  preview: 0.67,  // 32px base (for tray thumbnails)
  plate: 1,       // 48px base (on plate during plating)
  detail: 2,      // 96px base (for detail/inspection views)
};

// Base props shared by all ingredient components
export interface IngredientBaseProps {
  /** Size variant - determines base scaling */
  size: IngredientSize;
  /** Rotation in degrees (default: 0) */
  rotation?: number;
  /** Additional scale multiplier (default: 1) */
  scale?: number;
  /** Show drop shadow (default: true) */
  shadow?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// Extended props for sauce/liquid components
export interface SauceProps extends IngredientBaseProps {
  /** Base color of the sauce */
  color: string;
}

// Props for flower components with color variants
export interface FlowerProps extends IngredientBaseProps {
  /** Petal color variant */
  color?: 'purple' | 'yellow' | 'white' | 'pink' | 'orange' | 'blue';
}

// Props for herb components with variants
export interface HerbProps extends IngredientBaseProps {
  /** Visual variant for natural variety */
  variant?: 1 | 2 | 3;
}

// Color utility types for sauce/ingredient coloring
export interface ColorPalette {
  main: string;
  highlight: string;
  shadow: string;
}

// Ingredient positioning for scatter patterns
export interface ScatterPosition {
  x: number;       // Percentage position
  y: number;       // Percentage position
  rotation?: number;
  scale?: number;
}
