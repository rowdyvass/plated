/**
 * Ingredient Definitions - Single source of truth for all ingredient visuals
 *
 * Each ingredient has:
 * - id: Unique identifier matching registry
 * - name: Display name
 * - silhouettePath: SVG path string for outline shape
 * - primaryColor: Dominant color for drag state (hex string)
 * - dimensions: Base width/height in pixels
 * - perspective: Must be 'top-down' for all ingredients
 */

export interface IngredientDefinition {
  id: string;
  name: string;
  /** SVG path that traces the ingredient's outline */
  silhouettePath: string;
  /** Dominant color for drag state (hex string) */
  primaryColor: string;
  /** Base dimensions in pixels */
  dimensions: { width: number; height: number };
  /** Perspective - must be 'top-down' for all */
  perspective: 'top-down';
  /** Category for organization */
  category: 'protein' | 'vegetable' | 'sauce' | 'garnish';
  /** Whether this is a dynamic sauce element (swoosh, drizzle, dots) */
  isDynamic?: boolean;
}

// ===== PROTEINS =====

export const butterPat: IngredientDefinition = {
  id: 'butter-pat',
  name: 'Butter',
  // Matches ButterPat.tsx: rect x=4 y=6 width=40 height=20 rx=2
  // Rectangle from (4,6) to (44,26) with rx=2 rounded corners
  silhouettePath: 'M 6 6 H 42 Q 44 6 44 8 V 24 Q 44 26 42 26 H 6 Q 4 26 4 24 V 8 Q 4 6 6 6 Z',
  primaryColor: '#F5E6A3',
  dimensions: { width: 48, height: 32 },
  perspective: 'top-down',
  category: 'protein',
};

export const eggYolk: IngredientDefinition = {
  id: 'egg-yolk',
  name: 'Egg Yolk',
  silhouettePath: 'M 12 2 A 10 10 0 1 1 12 22 A 10 10 0 1 1 12 2',
  primaryColor: '#FFA500',
  dimensions: { width: 24, height: 24 },
  perspective: 'top-down',
  category: 'protein',
};

export const tartareMound: IngredientDefinition = {
  id: 'tartare-mound',
  name: 'Beef Tartare',
  // Circular top-down view of tartare cylinder
  silhouettePath: 'M 24 6 A 18 18 0 1 1 24 42 A 18 18 0 1 1 24 6 Z',
  primaryColor: '#8B3030',
  dimensions: { width: 48, height: 48 },
  perspective: 'top-down',
  category: 'protein',
};

export const soleFillet: IngredientDefinition = {
  id: 'sole-fillet',
  name: 'Sole Fillet',
  // Elongated oval fish fillet from above
  silhouettePath: 'M 36 18 A 32 14 0 1 1 36 18.01',
  primaryColor: '#FAF0E6',
  dimensions: { width: 72, height: 36 },
  perspective: 'top-down',
  category: 'protein',
};

export const duckBreast: IngredientDefinition = {
  id: 'duck-breast',
  name: 'Duck Breast',
  // Oval slice viewed from above
  silhouettePath: 'M 18 12 A 16 10 0 1 1 18 12.01',
  primaryColor: '#C97B7B',
  dimensions: { width: 36, height: 24 },
  perspective: 'top-down',
  category: 'protein',
};

export const pigeonBreast: IngredientDefinition = {
  id: 'pigeon-breast',
  name: 'Pigeon Breast',
  silhouettePath: 'M 24 16 A 20 14 0 1 1 24 16.01',
  primaryColor: '#A0522D',
  dimensions: { width: 48, height: 32 },
  perspective: 'top-down',
  category: 'protein',
};

export const mozzarellaSlice: IngredientDefinition = {
  id: 'mozzarella-slice',
  name: 'Mozzarella',
  silhouettePath: 'M 22 2 A 20 20 0 1 1 22 42.01',
  primaryColor: '#FFFEF5',
  dimensions: { width: 44, height: 44 },
  perspective: 'top-down',
  category: 'protein',
};

export const burrata: IngredientDefinition = {
  id: 'burrata',
  name: 'Burrata',
  silhouettePath: 'M 24 4 A 20 20 0 1 1 24 44.01',
  primaryColor: '#FFFEF8',
  dimensions: { width: 48, height: 48 },
  perspective: 'top-down',
  category: 'protein',
};

export const tartSlice: IngredientDefinition = {
  id: 'tart-slice',
  name: 'Tarte Tatin',
  // Triangle slice from above
  silhouettePath: 'M 28 4 L 52 44 L 4 44 Z',
  primaryColor: '#D2691E',
  dimensions: { width: 56, height: 48 },
  perspective: 'top-down',
  category: 'protein',
};

export const puffPastry: IngredientDefinition = {
  id: 'puff-pastry',
  name: 'Puff Pastry',
  silhouettePath: 'M 4 4 L 36 4 Q 40 4 40 8 L 40 24 Q 40 28 36 28 L 4 28 Q 0 28 0 24 L 0 8 Q 0 4 4 4 Z',
  primaryColor: '#DEB887',
  dimensions: { width: 40, height: 28 },
  perspective: 'top-down',
  category: 'protein',
};

export const pigeon: IngredientDefinition = {
  id: 'pigeon',
  name: 'Pigeon',
  silhouettePath: 'M 4 8 Q 4 4 28 4 Q 52 4 52 8 L 52 32 Q 52 36 28 36 Q 4 36 4 32 Z',
  primaryColor: '#8B4513',
  dimensions: { width: 56, height: 40 },
  perspective: 'top-down',
  category: 'protein',
};

export const pastry: IngredientDefinition = {
  id: 'pastry',
  name: 'Pastry',
  silhouettePath: 'M 2 4 L 33 4 Q 35 4 35 6 L 35 22 Q 35 25 33 25 L 2 25 Q 0 25 0 22 L 0 6 Q 0 4 2 4 Z',
  primaryColor: '#DAA520',
  dimensions: { width: 35, height: 25 },
  perspective: 'top-down',
  category: 'protein',
};

export const vegetablePuree: IngredientDefinition = {
  id: 'vegetable-puree',
  name: 'Vegetable Purée',
  silhouettePath: 'M 4 14 Q 4 8 10 5 Q 18 2 26 5 Q 32 8 32 14 Q 26 16 18 16 Q 10 16 4 14 Z',
  primaryColor: '#7D8B3E',
  dimensions: { width: 36, height: 18 },
  perspective: 'top-down',
  category: 'vegetable',
};

export const cremeQuenelle: IngredientDefinition = {
  id: 'creme-quenelle',
  name: 'Crème Fraîche Quenelle',
  silhouettePath: 'M 4 14 Q 4 8 10 5 Q 18 2 26 5 Q 32 8 32 14 Q 26 16 18 16 Q 10 16 4 14 Z',
  primaryColor: '#FFFEF5',
  dimensions: { width: 36, height: 18 },
  perspective: 'top-down',
  category: 'garnish',
};

// ===== VEGETABLES =====

export const tomatoSlice: IngredientDefinition = {
  id: 'tomato-slice',
  name: 'Tomato',
  silhouettePath: 'M 24 2 A 22 22 0 1 1 24 46.01',
  primaryColor: '#C62828',
  dimensions: { width: 48, height: 48 },
  perspective: 'top-down',
  category: 'vegetable',
};

export const cherryTomato: IngredientDefinition = {
  id: 'cherry-tomato',
  name: 'Cherry Tomato',
  // Small round tomato with stem indication at top
  silhouettePath: 'M 12 4 L 12 16 A 10 11 0 1 1 12 16.01',
  primaryColor: '#E53935',
  dimensions: { width: 24, height: 28 },
  perspective: 'top-down',
  category: 'vegetable',
};

export const pea: IngredientDefinition = {
  id: 'pea',
  name: 'Pea',
  silhouettePath: 'M 12 3 A 9 9 0 1 1 12 21 A 9 9 0 1 1 12 3 Z',
  primaryColor: '#5B8C3B',
  dimensions: { width: 24, height: 24 },
  perspective: 'top-down',
  category: 'vegetable',
};

export const peaShoot: IngredientDefinition = {
  id: 'pea-shoot',
  name: 'Pea Shoot',
  // Leaf cluster from above - larger for visibility
  silhouettePath: 'M 18 48 L 18 24 M 12 20 Q 4 16 12 4 Q 24 16 18 20 M 24 20 Q 32 16 24 4 Q 12 16 18 20 M 18 8 Q 12 0 18 0 Q 24 0 18 8 Z',
  primaryColor: '#7CFC00',
  dimensions: { width: 36, height: 48 },
  perspective: 'top-down',
  category: 'vegetable',
};

export const mintLeaf: IngredientDefinition = {
  id: 'mint-leaf',
  name: 'Mint Leaf',
  // Leaf shape from above
  silhouettePath: 'M 7 10 Q 0 5 7 0 Q 14 5 7 10 Z',
  primaryColor: '#228B22',
  dimensions: { width: 14, height: 10 },
  perspective: 'top-down',
  category: 'vegetable',
};

export const microGreen: IngredientDefinition = {
  id: 'micro-green',
  name: 'Micro Green',
  silhouettePath: 'M 6 14 L 6 8 M 3 6 A 3 2 -30 1 1 3 6.01 M 9 6 A 3 2 30 1 1 9 6.01',
  primaryColor: '#90EE90',
  dimensions: { width: 12, height: 14 },
  perspective: 'top-down',
  category: 'vegetable',
};

export const chivePiece: IngredientDefinition = {
  id: 'chive-single',
  name: 'Chive',
  silhouettePath: 'M 0 1 L 12 1 Q 14 1 14 2 Q 14 3 12 3 L 0 3 Q -2 3 -2 2 Q -2 1 0 1 Z',
  primaryColor: '#4A7023',
  dimensions: { width: 12, height: 2 },
  perspective: 'top-down',
  category: 'vegetable',
};

export const babyCarrot: IngredientDefinition = {
  id: 'baby-carrot',
  name: 'Baby Carrot',
  // Small carrot from above - elongated oval
  silhouettePath: 'M 7 5 A 5 7 0 1 1 7 19.01',
  primaryColor: '#FF8C00',
  dimensions: { width: 14, height: 20 },
  perspective: 'top-down',
  category: 'vegetable',
};

export const babyVegetable: IngredientDefinition = {
  id: 'baby-vegetable',
  name: 'Baby Vegetable',
  silhouettePath: 'M 7 5 A 5 5 0 1 1 7 15.01',
  primaryColor: '#8FBC8F',
  dimensions: { width: 14, height: 10 },
  perspective: 'top-down',
  category: 'vegetable',
};

export const leekRing: IngredientDefinition = {
  id: 'leek-ring',
  name: 'Leek Ring',
  // Ring shape from above - donut
  silhouettePath: 'M 12 2 A 10 10 0 1 1 12 22.01 M 12 6 A 6 6 0 1 0 12 18.01',
  primaryColor: '#E8F5E9',
  dimensions: { width: 24, height: 24 },
  perspective: 'top-down',
  category: 'vegetable',
};

// ===== SAUCES (Dynamic) =====

export const sauceDot: IngredientDefinition = {
  id: 'sauce-dot',
  name: 'Sauce Dot',
  silhouettePath: 'M 8 2 A 8 8 0 1 1 8 18.01',
  primaryColor: '#4A3728',
  dimensions: { width: 16, height: 16 },
  perspective: 'top-down',
  category: 'sauce',
  isDynamic: true,
};

export const swooshTrail: IngredientDefinition = {
  id: 'swoosh',
  name: 'Sauce Swoosh',
  // Curved trail shape
  silhouettePath: 'M 4 20 Q 20 8 46 10 Q 70 12 88 24 L 84 28 Q 66 18 46 16 Q 26 14 8 24 Z',
  primaryColor: '#8B7355',
  dimensions: { width: 92, height: 40 },
  perspective: 'top-down',
  category: 'sauce',
  isDynamic: true,
};

export const drizzleLine: IngredientDefinition = {
  id: 'drizzle',
  name: 'Oil Drizzle',
  // Wavy line for drizzle
  silhouettePath: 'M 0 8 Q 12 4 24 8 Q 36 12 48 8 Q 60 4 72 8',
  primaryColor: '#E8D44D',
  dimensions: { width: 72, height: 16 },
  perspective: 'top-down',
  category: 'sauce',
  isDynamic: true,
};

export const balsamicDots: IngredientDefinition = {
  id: 'balsamic-dots',
  name: 'Balsamic',
  silhouettePath: 'M 8 2 A 8 8 0 1 1 8 18.01',
  primaryColor: '#2C1810',
  dimensions: { width: 16, height: 16 },
  perspective: 'top-down',
  category: 'sauce',
  isDynamic: true,
};

export const brownButter: IngredientDefinition = {
  id: 'brown-butter',
  name: 'Brown Butter',
  silhouettePath: 'M 4 20 Q 20 8 46 10 Q 70 12 88 24 L 84 28 Q 66 18 46 16 Q 26 14 8 24 Z',
  primaryColor: '#8B7355',
  dimensions: { width: 92, height: 40 },
  perspective: 'top-down',
  category: 'sauce',
  isDynamic: true,
};

export const jus: IngredientDefinition = {
  id: 'jus',
  name: 'Jus',
  silhouettePath: 'M 4 20 Q 20 8 46 10 Q 70 12 88 24 L 84 28 Q 66 18 46 16 Q 26 14 8 24 Z',
  primaryColor: '#3D2314',
  dimensions: { width: 92, height: 40 },
  perspective: 'top-down',
  category: 'sauce',
  isDynamic: true,
};

export const lemonOil: IngredientDefinition = {
  id: 'lemon-oil',
  name: 'Lemon Oil',
  silhouettePath: 'M 0 8 Q 12 4 24 8 Q 36 12 48 8 Q 60 4 72 8',
  primaryColor: '#E8D44D',
  dimensions: { width: 72, height: 16 },
  perspective: 'top-down',
  category: 'sauce',
  isDynamic: true,
};

export const basilOil: IngredientDefinition = {
  id: 'basil-oil',
  name: 'Basil Oil',
  silhouettePath: 'M 0 8 Q 12 4 24 8 Q 36 12 48 8 Q 60 4 72 8',
  primaryColor: '#4A7C23',
  dimensions: { width: 72, height: 16 },
  perspective: 'top-down',
  category: 'sauce',
  isDynamic: true,
};

export const herbOil: IngredientDefinition = {
  id: 'herb-oil',
  name: 'Herb Oil',
  silhouettePath: 'M 0 8 Q 12 4 24 8 Q 36 12 48 8 Q 60 4 72 8',
  primaryColor: '#4A7C23',
  dimensions: { width: 72, height: 16 },
  perspective: 'top-down',
  category: 'sauce',
  isDynamic: true,
};

export const leekVeloute: IngredientDefinition = {
  id: 'leek-veloute',
  name: 'Leek Velouté',
  silhouettePath: 'M 4 20 Q 20 8 46 10 Q 70 12 88 24 L 84 28 Q 66 18 46 16 Q 26 14 8 24 Z',
  primaryColor: '#E8DCC8',
  dimensions: { width: 92, height: 40 },
  perspective: 'top-down',
  category: 'sauce',
  isDynamic: true,
};

// ===== GARNISHES =====

export const edibleFlower: IngredientDefinition = {
  id: 'edible-flower',
  name: 'Edible Flower',
  // 5-petal flower from above
  silhouettePath: 'M 10 0 L 12 6 L 18 6 L 13 10 L 15 16 L 10 12 L 5 16 L 7 10 L 2 6 L 8 6 Z',
  primaryColor: '#9370DB',
  dimensions: { width: 20, height: 20 },
  perspective: 'top-down',
  category: 'garnish',
};

export const microFlower: IngredientDefinition = {
  id: 'micro-flower',
  name: 'Micro Flower',
  silhouettePath: 'M 6 0 L 7 4 L 11 4 L 8 6 L 9 10 L 6 8 L 3 10 L 4 6 L 1 4 L 5 4 Z',
  primaryColor: '#FFD700',
  dimensions: { width: 12, height: 12 },
  perspective: 'top-down',
  category: 'garnish',
};

export const herbLeaf: IngredientDefinition = {
  id: 'herb-leaf',
  name: 'Herb Leaf',
  // Generic herb leaf from above
  silhouettePath: 'M 10 32 L 10 16 Q 0 12 10 0 Q 20 12 10 16 Z',
  primaryColor: '#228B22',
  dimensions: { width: 20, height: 32 },
  perspective: 'top-down',
  category: 'garnish',
};

export const parsley: IngredientDefinition = {
  id: 'parsley',
  name: 'Parsley',
  // Frilly parsley leaf cluster from above
  silhouettePath: 'M 6 12 Q 2 10 4 6 Q 6 2 10 4 Q 14 2 16 6 Q 18 10 14 12 Q 16 14 12 16 Q 8 14 6 12 Z',
  primaryColor: '#228B22',
  dimensions: { width: 20, height: 18 },
  perspective: 'top-down',
  category: 'garnish',
};

export const basil: IngredientDefinition = {
  id: 'basil',
  name: 'Basil',
  silhouettePath: 'M 10 0 Q 0 8 10 16 Q 20 8 10 0 Z',
  primaryColor: '#2E7D32',
  dimensions: { width: 20, height: 16 },
  perspective: 'top-down',
  category: 'garnish',
};

export const cilantro: IngredientDefinition = {
  id: 'cilantro',
  name: 'Cilantro',
  silhouettePath: 'M 8 14 L 8 8 M 4 6 Q 2 4 4 2 Q 6 0 8 2 Q 10 0 12 2 Q 14 4 12 6 L 8 8 L 4 6 Z',
  primaryColor: '#3D9140',
  dimensions: { width: 16, height: 14 },
  perspective: 'top-down',
  category: 'garnish',
};

export const tarragon: IngredientDefinition = {
  id: 'tarragon',
  name: 'Tarragon',
  // Long narrow leaf
  silhouettePath: 'M 4 0 Q 0 12 4 24 Q 8 12 4 0 Z',
  primaryColor: '#5D8C3E',
  dimensions: { width: 8, height: 24 },
  perspective: 'top-down',
  category: 'garnish',
};

export const quenelle: IngredientDefinition = {
  id: 'quenelle',
  name: 'Quenelle',
  // Matches Quenelle.tsx: viewBox 56x28
  silhouettePath: 'M 6 20 Q 4 14 8 10 Q 16 4 28 4 Q 40 4 48 10 Q 52 14 50 20 Q 42 24 28 24 Q 14 24 6 20 Z',
  primaryColor: '#F5E6A3',
  dimensions: { width: 56, height: 28 },
  perspective: 'top-down',
  category: 'garnish',
};

export const butterQuenelle: IngredientDefinition = {
  id: 'butter-quenelle',
  name: 'Butter Quenelle',
  // Matches Quenelle.tsx: viewBox 56x28
  silhouettePath: 'M 6 20 Q 4 14 8 10 Q 16 4 28 4 Q 40 4 48 10 Q 52 14 50 20 Q 42 24 28 24 Q 14 24 6 20 Z',
  primaryColor: '#F5E6A3',
  dimensions: { width: 56, height: 28 },
  perspective: 'top-down',
  category: 'garnish',
};

export const cremeFraicheQuenelle: IngredientDefinition = {
  id: 'creme-fraiche',
  name: 'Crème Fraîche',
  // Matches CremeFraicheQuenelle: viewBox 56x28
  silhouettePath: 'M 6 20 Q 4 14 8 10 Q 16 4 28 4 Q 40 4 48 10 Q 52 14 50 20 Q 42 24 28 24 Q 14 24 6 20 Z',
  primaryColor: '#FFFEF5',
  dimensions: { width: 56, height: 28 },
  perspective: 'top-down',
  category: 'garnish',
};

export const cremeFraicheDollop: IngredientDefinition = {
  id: 'creme-fraiche-dollop',
  name: 'Crème Fraîche Dollop',
  silhouettePath: 'M 12 2 A 10 10 0 1 1 12 22.01',
  primaryColor: '#FFFEF5',
  dimensions: { width: 24, height: 24 },
  perspective: 'top-down',
  category: 'garnish',
};

export const caper: IngredientDefinition = {
  id: 'caper',
  name: 'Caper',
  silhouettePath: 'M 4 3 A 4 3 0 1 1 4 9.01',
  primaryColor: '#556B2F',
  dimensions: { width: 8, height: 6 },
  perspective: 'top-down',
  category: 'garnish',
};

export const caperBerry: IngredientDefinition = {
  id: 'caper-berry',
  name: 'Caper Berry',
  // Larger with stem
  silhouettePath: 'M 6 2 L 6 6 A 5 6 0 1 1 6 18.01',
  primaryColor: '#6B8E23',
  dimensions: { width: 12, height: 20 },
  perspective: 'top-down',
  category: 'garnish',
};

export const powderedSugar: IngredientDefinition = {
  id: 'powdered-sugar',
  name: 'Powdered Sugar',
  // Dust cloud shape - irregular soft zone
  silhouettePath: 'M 8 4 Q 4 4 4 8 Q 2 12 6 14 Q 4 18 8 20 Q 12 22 16 20 Q 20 22 24 20 Q 28 18 26 14 Q 30 12 28 8 Q 28 4 24 4 Q 20 2 16 4 Q 12 2 8 4 Z',
  primaryColor: '#FFFFFF',
  dimensions: { width: 32, height: 24 },
  perspective: 'top-down',
  category: 'garnish',
  isDynamic: true,
};

export const blackSalt: IngredientDefinition = {
  id: 'black-salt',
  name: 'Black Salt',
  silhouettePath: 'M 8 4 Q 4 4 4 8 Q 2 12 6 14 Q 4 18 8 20 Q 12 22 16 20 Q 20 22 24 20 Q 28 18 26 14 Q 30 12 28 8 Q 28 4 24 4 Q 20 2 16 4 Q 12 2 8 4 Z',
  primaryColor: '#2A2A2A',
  dimensions: { width: 32, height: 24 },
  perspective: 'top-down',
  category: 'garnish',
  isDynamic: true,
};

export const fleurDeSel: IngredientDefinition = {
  id: 'fleur-de-sel',
  name: 'Fleur de Sel',
  silhouettePath: 'M 8 4 Q 4 4 4 8 Q 2 12 6 14 Q 4 18 8 20 Q 12 22 16 20 Q 20 22 24 20 Q 28 18 26 14 Q 30 12 28 8 Q 28 4 24 4 Q 20 2 16 4 Q 12 2 8 4 Z',
  primaryColor: '#F5F5F5',
  dimensions: { width: 32, height: 24 },
  perspective: 'top-down',
  category: 'garnish',
  isDynamic: true,
};

// ===== REGISTRY =====

export const ingredientDefinitions: Record<string, IngredientDefinition> = {
  // Proteins
  'butter-pat': butterPat,
  'egg-yolk': eggYolk,
  'tartare-mound': tartareMound,
  'sole-fillet': soleFillet,
  'duck-breast': duckBreast,
  'duck-slices': duckBreast, // Alias
  'pigeon-breast': pigeonBreast,
  'mozzarella': mozzarellaSlice,
  'mozzarella-slice': mozzarellaSlice,
  'burrata': burrata,
  'tart-slice': tartSlice,
  'puff-pastry': puffPastry,
  'pigeon': pigeon,
  'pastry': pastry,

  // Vegetables
  'tomato': tomatoSlice,
  'tomato-slice': tomatoSlice,
  'cherry-tomato': cherryTomato,
  'pea': pea,
  'peas': pea,
  'pea-cluster': pea,
  'pea-shoot': peaShoot,
  'pea-shoots': peaShoot,
  'mint-leaf': mintLeaf,
  'mint-leaves': mintLeaf,
  'micro-green': microGreen,
  'micro-greens': microGreen,
  'chives': chivePiece,
  'chive-single': chivePiece,
  'baby-carrot': babyCarrot,
  'baby-turnip': babyVegetable,
  'baby-radish': babyVegetable,
  'baby-beet': babyVegetable,
  'leek-ring': leekRing,
  'baby-leek': babyVegetable,
  'vegetables': babyVegetable,
  'vegetable-puree': vegetablePuree,
  'herbs': microGreen,
  'finishing-dust': blackSalt,
  'oil-drizzle': herbOil,

  // Sauces
  'sauce-dot': sauceDot,
  'sauce-dots': sauceDot,
  'balsamic-dots': balsamicDots,
  'swoosh': swooshTrail,
  'sauce-swoosh': swooshTrail,
  'brown-butter': brownButter,
  'jus': jus,
  'swoosh-pair': swooshTrail,
  'drizzle': drizzleLine,
  'lemon-oil': lemonOil,
  'basil-oil': basilOil,
  'herb-oil': herbOil,
  'oil-droplets': drizzleLine,
  'leek-veloute': leekVeloute,
  'veloute-swoosh': leekVeloute,

  // Garnishes
  'edible-flower': edibleFlower,
  'flowers': edibleFlower,
  'micro-flower': microFlower,
  'flower-cluster': edibleFlower,
  'parsley': parsley,
  'basil': basil,
  'cilantro': cilantro,
  'tarragon': tarragon,
  'herb-leaf': herbLeaf,
  'quenelle': quenelle,
  'butter-quenelle': butterQuenelle,
  'creme-fraiche': cremeFraicheQuenelle,
  'creme-fraiche-quenelle': cremeFraicheQuenelle,
  'creme-fraiche-dollop': cremeFraicheDollop,
  'creme-quenelle': cremeQuenelle,
  'powdered-sugar': powderedSugar,
  'black-salt': blackSalt,
  'fleur-de-sel': fleurDeSel,
  'caper': caper,
  'capers': caper,
  'caper-berry': caperBerry,
};

/**
 * Get an ingredient definition by ID
 */
export function getIngredientDefinition(id: string): IngredientDefinition | null {
  return ingredientDefinitions[id] || null;
}

/**
 * Check if an ingredient definition exists
 */
export function hasIngredientDefinition(id: string): boolean {
  return id in ingredientDefinitions;
}

/**
 * Get all ingredient IDs
 */
export function getAllDefinitionIds(): string[] {
  return Object.keys(ingredientDefinitions);
}

/**
 * Get ingredients by category
 */
export function getIngredientsByCategory(category: IngredientDefinition['category']): IngredientDefinition[] {
  return Object.values(ingredientDefinitions).filter(def => def.category === category);
}
