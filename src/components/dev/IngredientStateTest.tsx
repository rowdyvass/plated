/**
 * IngredientStateTest - Development component for testing ingredient visual states
 *
 * Shows all 4 visual states for each ingredient side by side to verify:
 * 1. Tray and Placed look identical
 * 2. Dragging is same shape, single color fill
 * 3. Ghost is same shape, dashed outline
 * 4. All are top-down perspective
 */

import { useState, useMemo } from 'react';
import { IngredientVisualNew, type IngredientState } from '@/components/game/IngredientVisual';
import {
  ingredientDefinitions,
  getAllDefinitionIds,
  getIngredientsByCategory,
  type IngredientDefinition,
} from '@/data/ingredients';
import { hasIngredient } from '@/components/ingredients';

interface IngredientStateTestProps {
  ingredientId: string;
}

/**
 * Shows a single ingredient in all 4 states
 */
export function IngredientStateTest({ ingredientId }: IngredientStateTestProps) {
  const definition = ingredientDefinitions[ingredientId];
  const hasComponent = hasIngredient(ingredientId);

  if (!definition) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">Unknown ingredient: {ingredientId}</p>
      </div>
    );
  }

  const states: IngredientState[] = ['tray', 'dragging', 'ghost', 'placed'];
  const stateLabels: Record<IngredientState, string> = {
    tray: 'Tray',
    dragging: 'Dragging',
    ghost: 'Ghost',
    placed: 'Placed',
  };

  return (
    <div className="p-6 bg-foundation-100 rounded-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-display text-lg text-text-primary">{definition.name}</h3>
        <span className="text-xs text-text-muted font-mono bg-foundation-200 px-2 py-1 rounded">
          {ingredientId}
        </span>
        {definition.isDynamic && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            Dynamic
          </span>
        )}
        {!hasComponent && (
          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            No Component
          </span>
        )}
      </div>

      {/* States grid */}
      <div className="flex gap-6 items-center">
        {states.map((state) => (
          <div key={state} className="text-center">
            <div
              className={`w-20 h-20 rounded flex items-center justify-center mb-2 ${
                state === 'ghost' || state === 'placed'
                  ? 'bg-[#FEFEFA] border border-foundation-300'
                  : state === 'dragging'
                  ? 'bg-foundation-200 border border-foundation-400'
                  : 'bg-white border border-foundation-400'
              }`}
            >
              <IngredientVisualNew
                ingredientId={ingredientId}
                state={state}
                size="md"
              />
            </div>
            <span className="text-xs text-text-muted">{stateLabels[state]}</span>
          </div>
        ))}
      </div>

      {/* Metadata */}
      <div className="mt-4 p-3 bg-foundation-200 rounded text-sm">
        <div className="grid grid-cols-2 gap-2 text-text-tertiary">
          <div>
            <span className="font-medium">Dimensions:</span>{' '}
            {definition.dimensions.width} × {definition.dimensions.height}
          </div>
          <div>
            <span className="font-medium">Primary Color:</span>{' '}
            <span
              className="inline-block w-4 h-4 rounded align-middle border border-foundation-400"
              style={{ backgroundColor: definition.primaryColor }}
            />{' '}
            {definition.primaryColor}
          </div>
          <div>
            <span className="font-medium">Category:</span> {definition.category}
          </div>
          <div>
            <span className="font-medium">Perspective:</span> {definition.perspective}
          </div>
        </div>
      </div>

      {/* Verification checklist */}
      <div className="mt-4 p-3 bg-foundation-200 rounded text-sm">
        <strong className="text-text-secondary">Verification Checklist:</strong>
        <ul className="list-disc ml-4 mt-1 text-text-tertiary">
          <li>Tray and Placed look identical</li>
          <li>Dragging is same shape, single color fill</li>
          <li>Ghost is same shape, dashed outline</li>
          <li>All are top-down perspective</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Test page showing all ingredients organized by category
 */
export function AllIngredientsTest() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', 'protein', 'vegetable', 'sauce', 'garnish'];

  const filteredIngredients = useMemo(() => {
    let ids = getAllDefinitionIds();

    // Filter by category
    if (selectedCategory !== 'all') {
      const categoryIngredients = getIngredientsByCategory(
        selectedCategory as IngredientDefinition['category']
      );
      const categoryIds = new Set(categoryIngredients.map((d) => d.id));
      ids = ids.filter((id) => categoryIds.has(ingredientDefinitions[id]?.id));
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      ids = ids.filter((id) => {
        const def = ingredientDefinitions[id];
        return (
          id.toLowerCase().includes(query) ||
          def?.name.toLowerCase().includes(query)
        );
      });
    }

    // Remove duplicates (aliases point to same definition)
    const seen = new Set<string>();
    return ids.filter((id) => {
      const defId = ingredientDefinitions[id]?.id;
      if (!defId || seen.has(defId)) return false;
      seen.add(defId);
      return true;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-foundation-200 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl text-text-primary mb-2">
            Ingredient Visual State Test
          </h1>
          <p className="text-text-muted">
            Verify that all ingredients render consistently across all 4 visual states.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          {/* Category filter */}
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-copper text-white'
                    : 'bg-white text-text-secondary hover:bg-foundation-300'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-foundation-400 bg-white text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-copper/30"
          />
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-text-muted">
          Showing {filteredIngredients.length} ingredients
        </div>

        {/* Ingredients grid */}
        <div className="space-y-6">
          {filteredIngredients.map((id) => (
            <IngredientStateTest key={id} ingredientId={id} />
          ))}
        </div>

        {filteredIngredients.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            No ingredients found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Export as default for easy import
 */
export default AllIngredientsTest;
