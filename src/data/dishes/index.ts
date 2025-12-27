import type { Dish } from '@/types';
import type { DishDefinition } from '@/types/dishes';
import { lesson1Butter } from './linstitut/lesson1-butter';
import { lesson2Veloute } from './linstitut/lesson2-veloute';
import { lesson3Tartare } from './linstitut/lesson3-tartare';
import { lesson4PeaSalad } from './linstitut/lesson4-pea-salad';
import { lesson5Sole } from './linstitut/lesson5-sole';
import { lesson6Caprese } from './linstitut/lesson6-caprese';
import { lesson7Duck } from './linstitut/lesson7-duck';
import { lesson8Tarte } from './linstitut/lesson8-tarte';
import { finalExamPigeon } from './linstitut/final-exam';

// Ordered list of lesson IDs for progression (includes final exam)
export const lessonOrder: string[] = [
  'linstitut-lesson-1',
  'linstitut-lesson-2',
  'linstitut-lesson-3',
  'linstitut-lesson-4',
  'linstitut-lesson-5',
  'linstitut-lesson-6',
  'linstitut-lesson-7',
  'linstitut-lesson-8',
  'linstitut-final', // Final exam
];

// All L'Institut dishes (for progress tracking)
export const linstitutDishes: string[] = [...lessonOrder];

// Legacy dish format (kept for compatibility)
export const dishes: Record<string, Dish> = {
  'classic-consomme': {
    id: 'classic-consomme',
    name: 'Classic Consommé',
    description: 'A crystal-clear broth garnished with precision-cut vegetables.',
    restaurantId: 'linstitut',
    ingredients: [],
    targetPlating: [],
    timeLimit: 120,
    difficulty: 1,
  },
};

// New dish definition format
export const dishDefinitions: Record<string, DishDefinition> = {
  'linstitut-lesson-1': lesson1Butter,
  'linstitut-lesson-2': lesson2Veloute,
  'linstitut-lesson-3': lesson3Tartare,
  'linstitut-lesson-4': lesson4PeaSalad,
  'linstitut-lesson-5': lesson5Sole,
  'linstitut-lesson-6': lesson6Caprese,
  'linstitut-lesson-7': lesson7Duck,
  'linstitut-lesson-8': lesson8Tarte,
  'linstitut-final': finalExamPigeon,
};

// Export individual dishes for direct import
export { lesson1Butter } from './linstitut/lesson1-butter';
export { lesson2Veloute } from './linstitut/lesson2-veloute';
export { lesson3Tartare } from './linstitut/lesson3-tartare';
export { lesson4PeaSalad } from './linstitut/lesson4-pea-salad';
export { lesson5Sole } from './linstitut/lesson5-sole';
export { lesson6Caprese } from './linstitut/lesson6-caprese';
export { lesson7Duck } from './linstitut/lesson7-duck';
export { lesson8Tarte } from './linstitut/lesson8-tarte';
export { finalExamPigeon } from './linstitut/final-exam';

/**
 * Check if a dish is a final exam
 */
export function isFinalExam(dishId: string): boolean {
  const dish = dishDefinitions[dishId];
  return dish?.isFinalExam ?? false;
}

/**
 * Get all dishes for a restaurant
 */
export function getDishesForRestaurant(restaurantId: string): DishDefinition[] {
  return Object.values(dishDefinitions).filter(
    (dish) => dish.restaurant === restaurantId
  );
}

/**
 * Get the next dish after the given dish ID
 * Returns null if there is no next dish (last lesson completed)
 */
export function getNextDish(currentDishId: string): DishDefinition | null {
  const currentIndex = lessonOrder.indexOf(currentDishId);
  if (currentIndex === -1 || currentIndex >= lessonOrder.length - 1) {
    return null;
  }
  const nextDishId = lessonOrder[currentIndex + 1];
  return dishDefinitions[nextDishId] || null;
}

/**
 * Check if there is a next dish available
 */
export function hasNextDish(currentDishId: string): boolean {
  const currentIndex = lessonOrder.indexOf(currentDishId);
  return currentIndex !== -1 && currentIndex < lessonOrder.length - 1;
}
