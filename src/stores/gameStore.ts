import { create } from 'zustand';
import type { GameState, GamePhase, PlacedIngredient, ScoreBreakdown, StarRating } from '@/types';
import type { PrecisionResult } from '@/game/scoring/PrecisionScorer';
import type { DishDefinition } from '@/types/dishes';

// Simple ingredient for drag/drop
export interface SimpleIngredient {
  id: string;
  name: string;
}

// Placed element on the plate (simpler than full PlacedIngredient for now)
export interface PlacedElement {
  id: string;
  x: number;
  y: number;
}

// Timer state
export type TimerState = 'idle' | 'running' | 'paused' | 'expired';

// Failure reason
export type FailureReason = 'time' | 'critical_miss';

// Final results for the results screen
export interface DishResults {
  dishId: string;
  dishName: string;
  restaurantName: string;
  finalScore: number;
  stars: StarRating;
  timeElapsed: number;
  precision: number;
  technique: number;
  tempo: number;
  // Flow bonus (optional for backward compatibility)
  flowBonus?: number;
  flowLabel?: string | null;
}

interface GameStore {
  // Game state
  state: GameState;
  phase: GamePhase;
  currentDish: DishDefinition | null;
  currentDishId: string | null;
  placedIngredients: PlacedIngredient[];
  score: ScoreBreakdown | null;

  // Timer state
  timeRemaining: number;  // seconds
  maxTime: number;        // seconds
  timerState: TimerState;

  // Drag and drop state
  currentIngredient: SimpleIngredient | null;
  placedElements: PlacedElement[];
  isDragging: boolean;

  // Precision scoring
  precisionScores: PrecisionResult[];
  latestPrecision: PrecisionResult | null;

  // Results
  results: DishResults | null;
  failureReason: FailureReason | null;

  // Actions
  setCurrentDish: (dish: DishDefinition) => void;
  startDish: (dish: DishDefinition) => void;
  setPhase: (phase: GamePhase) => void;
  completeDish: () => void;
  failDish: (reason: FailureReason) => void;
  startGame: (dishId: string) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  placeIngredient: (ingredient: PlacedIngredient) => void;
  removeIngredient: (index: number) => void;
  clearPlate: () => void;
  setScore: (score: ScoreBreakdown) => void;
  reset: () => void;
  resetGame: () => void;

  // Timer actions
  startTimer: (maxTime: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  tick: (deltaTime: number) => void;

  // Drag and drop actions
  setCurrentIngredient: (ingredient: SimpleIngredient | null) => void;
  placeElement: (id: string, x: number, y: number) => void;
  resetPlate: () => void;
  setIsDragging: (dragging: boolean) => void;

  // Precision scoring actions
  recordPrecision: (result: PrecisionResult) => void;
  clearLatestPrecision: () => void;
  getTotalPrecision: () => number;
}

// Restaurant display names
const restaurantNames: Record<string, string> = {
  linstitut: "L'Institut · Lyon",
};

// Calculate stars from score (tutorial thresholds - easier)
function calculateStars(score: number): StarRating {
  if (score >= 85) return 3;
  if (score >= 70) return 2;
  if (score >= 55) return 1;
  return 0;
}

const initialState = {
  state: 'idle' as GameState,
  phase: 'loading' as GamePhase,
  currentDish: null as DishDefinition | null,
  currentDishId: null as string | null,
  placedIngredients: [] as PlacedIngredient[],
  score: null as ScoreBreakdown | null,
  // Timer
  timeRemaining: 0,
  maxTime: 0,
  timerState: 'idle' as TimerState,
  // Initialize with butter as the current ingredient (matches lesson1-butter dish)
  currentIngredient: { id: 'butter-pat', name: 'Butter' } as SimpleIngredient | null,
  placedElements: [] as PlacedElement[],
  isDragging: false,
  // Precision scoring
  precisionScores: [] as PrecisionResult[],
  latestPrecision: null as PrecisionResult | null,
  // Results
  results: null as DishResults | null,
  failureReason: null as FailureReason | null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  // Set current dish (for level selection)
  setCurrentDish: (dish: DishDefinition) =>
    set({ currentDish: dish, currentDishId: dish.id }),

  // New phase-based actions
  startDish: (dish: DishDefinition) =>
    set({
      phase: 'loading',
      currentDish: dish,
      currentDishId: dish.id,
      placedIngredients: [],
      placedElements: [],
      precisionScores: [],
      latestPrecision: null,
      score: null,
      results: null,
      failureReason: null,
      currentIngredient: dish.ingredients[0]
        ? { id: dish.ingredients[0].id, name: dish.ingredients[0].name }
        : null,
    }),

  setPhase: (phase: GamePhase) =>
    set({ phase }),

  completeDish: () => {
    const state = get();
    const { currentDish, maxTime, timeRemaining, precisionScores } = state;

    if (!currentDish) return;

    // Calculate precision score (average of all placements)
    const precision = precisionScores.length > 0
      ? Math.round(precisionScores.reduce((acc, p) => acc + p.score, 0) / precisionScores.length)
      : 0;

    // For now, technique and tempo are placeholders
    const technique = precision; // Will be gesture-based later
    const tempo = Math.round(Math.min(100, (timeRemaining / maxTime) * 150)); // Bonus for speed

    // Final score is just precision for now
    const finalScore = precision;
    const stars = calculateStars(finalScore);

    const results: DishResults = {
      dishId: currentDish.id,
      dishName: currentDish.name,
      restaurantName: restaurantNames[currentDish.restaurant] || currentDish.restaurant,
      finalScore,
      stars,
      timeElapsed: maxTime - timeRemaining,
      precision,
      technique,
      tempo,
    };

    set({
      phase: 'complete',
      timerState: 'paused',
      results,
    });
  },

  failDish: (reason: FailureReason) => {
    const state = get();
    const { currentDish, maxTime, timeRemaining, precisionScores } = state;

    if (!currentDish) return;

    // Calculate what we can
    const precision = precisionScores.length > 0
      ? Math.round(precisionScores.reduce((acc, p) => acc + p.score, 0) / precisionScores.length)
      : 0;

    const results: DishResults = {
      dishId: currentDish.id,
      dishName: currentDish.name,
      restaurantName: restaurantNames[currentDish.restaurant] || currentDish.restaurant,
      finalScore: Math.max(0, precision - 20), // Penalty for failure
      stars: 0,
      timeElapsed: maxTime - timeRemaining,
      precision,
      technique: 0,
      tempo: 0,
    };

    set({
      phase: 'failed',
      timerState: 'paused',
      failureReason: reason,
      results,
    });
  },

  resetGame: () => {
    const state = get();
    const { currentDish } = state;

    set({
      ...initialState,
      currentDish,
      currentDishId: currentDish?.id || null,
      currentIngredient: currentDish?.ingredients[0]
        ? { id: currentDish.ingredients[0].id, name: currentDish.ingredients[0].name }
        : null,
    });
  },

  // Legacy actions (kept for compatibility)
  startGame: (dishId) =>
    set({
      state: 'playing',
      currentDishId: dishId,
      placedIngredients: [],
      score: null,
    }),

  pauseGame: () =>
    set((state) => ({
      state: state.state === 'playing' ? 'paused' : state.state,
    })),

  resumeGame: () =>
    set((state) => ({
      state: state.state === 'paused' ? 'playing' : state.state,
    })),

  endGame: () =>
    set({
      state: 'complete',
    }),

  placeIngredient: (ingredient) =>
    set((state) => ({
      placedIngredients: [...state.placedIngredients, ingredient],
    })),

  removeIngredient: (index) =>
    set((state) => ({
      placedIngredients: state.placedIngredients.filter((_, i) => i !== index),
    })),

  clearPlate: () =>
    set({
      placedIngredients: [],
    }),

  setScore: (score) =>
    set({
      score,
      state: 'scoring',
    }),

  reset: () => set(initialState),

  // Timer actions
  startTimer: (maxTime: number) =>
    set({
      maxTime,
      timeRemaining: maxTime,
      timerState: 'running',
    }),

  pauseTimer: () =>
    set((state) => ({
      timerState: state.timerState === 'running' ? 'paused' : state.timerState,
    })),

  resumeTimer: () =>
    set((state) => ({
      timerState: state.timerState === 'paused' ? 'running' : state.timerState,
    })),

  tick: (deltaTime: number) =>
    set((state) => {
      if (state.timerState !== 'running') return state;

      const newTime = Math.max(0, state.timeRemaining - deltaTime);
      const newTimerState = newTime <= 0 ? 'expired' : state.timerState;

      return {
        timeRemaining: newTime,
        timerState: newTimerState,
      };
    }),

  // Drag and drop actions
  setCurrentIngredient: (ingredient) =>
    set({ currentIngredient: ingredient }),

  placeElement: (id, x, y) =>
    set((state) => ({
      placedElements: [...state.placedElements, { id, x, y }],
    })),

  resetPlate: () =>
    set({
      placedElements: [],
      currentIngredient: { id: 'butter-pat', name: 'Butter' },
    }),

  setIsDragging: (dragging) =>
    set({ isDragging: dragging }),

  // Precision scoring actions
  recordPrecision: (result) =>
    set((state) => ({
      precisionScores: [...state.precisionScores, result],
      latestPrecision: result,
    })),

  clearLatestPrecision: () =>
    set({ latestPrecision: null }),

  getTotalPrecision: (): number => 0, // Placeholder, use selector instead
}));

// Selector for total precision (average of all scores)
export function selectTotalPrecision(state: GameStore): number {
  if (state.precisionScores.length === 0) return 0;
  const sum = state.precisionScores.reduce((acc, p) => acc + p.score, 0);
  return Math.round(sum / state.precisionScores.length);
}
