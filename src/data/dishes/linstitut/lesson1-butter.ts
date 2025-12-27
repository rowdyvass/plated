import type { DishDefinition } from '@/types/dishes';

export const lesson1Butter: DishDefinition = {
  id: 'linstitut-lesson-1',
  name: 'Butter Service',
  restaurant: 'linstitut',

  parTime: 15,
  maxTime: 30,

  ghostOpacity: 0.6,

  ingredients: [
    {
      id: 'butter-pat',
      name: 'Butter',
      gesture: 'place',
      hintText: 'place',
      shape: { type: 'roundRect', width: 48, height: 48, radius: 4 },
    },
  ],

  targets: [
    {
      id: 'butter-target',
      ingredientId: 'butter-pat',
      position: { x: 0, y: 0 }, // center of plate
      rotation: 0,
      zones: {
        perfect: 0.08,
        great: 0.15,
        good: 0.25,
        acceptable: 0.5,
      },
    },
  ],
};
