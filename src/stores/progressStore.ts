import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlayerProgress, StarRating } from '@/types';

/**
 * Extended progress state with graduation tracking
 */
interface ProgressState extends PlayerProgress {
  // Graduation flags for each restaurant
  graduatedLinstitut: boolean;
  graduatedCopenhagen: boolean;

  // Attempt tracking for analytics
  dishAttempts: Record<string, number>;
  lastPlayedDish: string | null;
}

interface ProgressStore extends ProgressState {
  // Actions
  completeDish: (dishId: string, stars: StarRating, score: number) => void;
  unlockRestaurant: (restaurantId: string) => void;
  setGraduated: (restaurantId: string, graduated: boolean) => void;
  recordAttempt: (dishId: string) => void;
  getTotalStarsForRestaurant: (restaurantId: string, dishIds: string[]) => number;
  reset: () => void;
}

const initialProgress: ProgressState = {
  totalStars: 0,
  completedDishes: {},
  unlockedRestaurants: ['linstitut'], // First restaurant unlocked by default
  highScores: {},
  graduatedLinstitut: false,
  graduatedCopenhagen: false,
  dishAttempts: {},
  lastPlayedDish: null,
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...initialProgress,

      completeDish: (dishId, stars, score) =>
        set((state) => {
          const previousStars = state.completedDishes[dishId] || 0;
          const starDiff = Math.max(0, stars - previousStars);
          const previousScore = state.highScores[dishId] || 0;
          const previousAttempts = state.dishAttempts[dishId] || 0;

          return {
            totalStars: state.totalStars + starDiff,
            completedDishes: {
              ...state.completedDishes,
              [dishId]: Math.max(previousStars, stars) as StarRating,
            },
            highScores: {
              ...state.highScores,
              [dishId]: Math.max(previousScore, score),
            },
            dishAttempts: {
              ...state.dishAttempts,
              [dishId]: previousAttempts + 1,
            },
            lastPlayedDish: dishId,
          };
        }),

      unlockRestaurant: (restaurantId) =>
        set((state) => ({
          unlockedRestaurants: state.unlockedRestaurants.includes(restaurantId)
            ? state.unlockedRestaurants
            : [...state.unlockedRestaurants, restaurantId],
        })),

      setGraduated: (restaurantId, graduated) =>
        set((state) => {
          if (restaurantId === 'linstitut') {
            // When graduating from L'Institut, unlock Copenhagen
            const newUnlocked = graduated && !state.unlockedRestaurants.includes('copenhagen')
              ? [...state.unlockedRestaurants, 'copenhagen']
              : state.unlockedRestaurants;

            return {
              graduatedLinstitut: graduated,
              unlockedRestaurants: newUnlocked,
            };
          } else if (restaurantId === 'copenhagen') {
            return { graduatedCopenhagen: graduated };
          }
          return {};
        }),

      recordAttempt: (dishId) =>
        set((state) => ({
          dishAttempts: {
            ...state.dishAttempts,
            [dishId]: (state.dishAttempts[dishId] || 0) + 1,
          },
          lastPlayedDish: dishId,
        })),

      getTotalStarsForRestaurant: (restaurantId, dishIds) => {
        const state = get();
        return dishIds.reduce((total, dishId) => {
          // Only count dishes from this restaurant
          if (dishId.startsWith(restaurantId)) {
            return total + (state.completedDishes[dishId] || 0);
          }
          return total;
        }, 0);
      },

      reset: () => set(initialProgress),
    }),
    {
      name: 'plated-progress',
    }
  )
);

/**
 * Calculate the maximum possible stars for a restaurant
 */
export function getMaxStarsForRestaurant(dishCount: number): number {
  return dishCount * 3; // 3 stars per dish
}

/**
 * Calculate progress percentage for a restaurant
 */
export function getRestaurantProgress(
  earnedStars: number,
  dishCount: number
): number {
  const maxStars = getMaxStarsForRestaurant(dishCount);
  if (maxStars === 0) return 0;
  return Math.round((earnedStars / maxStars) * 100);
}
