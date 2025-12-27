// Game Phase Types
export type GamePhase = 'loading' | 'ready' | 'playing' | 'complete' | 'failed';

// Legacy GameState (kept for compatibility)
export type GameState = 'idle' | 'playing' | 'paused' | 'scoring' | 'complete';

// Michelin Star Rating
export type StarRating = 0 | 1 | 2 | 3;

// Position on plate (normalized 0-1)
export interface Position {
  x: number;
  y: number;
}

// Ingredient Types
export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  sprite: string;
  scale?: number;
}

export type IngredientCategory =
  | 'protein'
  | 'vegetable'
  | 'sauce'
  | 'garnish'
  | 'starch';

// Placed ingredient on plate
export interface PlacedIngredient {
  ingredientId: string;
  position: Position;
  rotation: number;
  scale: number;
  gestureApplied?: GestureType;
}

// Gesture Types
export type GestureType =
  | 'place'
  | 'swoosh'   // curved sauce stroke (signature technique)
  | 'swipe'
  | 'dot'
  | 'drizzle'
  | 'scatter'
  | 'quenelle'
  | 'tweeze'
  | 'dust'
  | 'pinch'
  | 'rotate';

export interface GestureResult {
  type: GestureType;
  position: Position;
  direction?: Position;
  scale?: number;
  rotation?: number;
}

// Dish Definition
export interface Dish {
  id: string;
  name: string;
  description: string;
  restaurantId: string;
  ingredients: Ingredient[];
  targetPlating: PlacedIngredient[];
  timeLimit?: number;
  difficulty: 1 | 2 | 3;
}

// Restaurant Definition
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  theme: ThemeColors;
  dishes: string[];
  unlockRequirement?: {
    stars: number;
  };
}

// Theme Colors
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

// Score Breakdown
export interface ScoreBreakdown {
  composition: number;
  balance: number;
  technique: number;
  creativity: number;
  total: number;
  stars: StarRating;
}

// Player Progress
export interface PlayerProgress {
  totalStars: number;
  completedDishes: Record<string, StarRating>;
  unlockedRestaurants: string[];
  highScores: Record<string, number>;
}
