/**
 * Ingredient Component Library
 *
 * A comprehensive library of food ingredient components with gouache/editorial
 * illustration style. Each component renders realistic SVG-based visuals that
 * work at multiple sizes (preview, plate, detail).
 *
 * Usage:
 * ```tsx
 * import { ButterPat, EdibleFlower, SwooshTrail } from '@/components/ingredients';
 *
 * <ButterPat size="plate" rotation={15} />
 * <EdibleFlower size="detail" color="purple" />
 * <SwooshTrail size="plate" color="#3D2314" />
 * ```
 *
 * Or use the registry for dynamic rendering:
 * ```tsx
 * import { getIngredient } from '@/components/ingredients';
 *
 * const Ingredient = getIngredient('butter-pat');
 * if (Ingredient) {
 *   return <Ingredient size="plate" />;
 * }
 * ```
 */

// Base utilities and types
export * from './base';

// Proteins
export * from './proteins';

// Vegetables
export * from './vegetables';

// Sauces
export * from './sauces';

// Garnishes
export * from './garnishes';

// Registry for dynamic ingredient lookup
export {
  ingredientRegistry,
  getIngredient,
  hasIngredient,
  getAllIngredientIds,
  ingredientCategories,
} from './registry';
