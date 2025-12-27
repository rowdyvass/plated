import type { DishDefinition } from '@/types/dishes';

/**
 * Lesson 6: Caprese Moderne
 *
 * This lesson introduces the drizzle gesture - a continuous, controlled
 * pour of oil or reduction that follows a precise path. Students must
 * maintain an unbroken line while tracing the target pattern.
 *
 * Key skills:
 * - Steady hand control for continuous movement
 * - Following a curved path precisely
 * - Maintaining consistent speed for even thickness
 * - Combining drizzle with dot technique for final touches
 *
 * Chef's quote: "The drizzle tells a story. Break it, and the story is lost."
 */
export const lesson6Caprese: DishDefinition = {
  id: 'linstitut-lesson-6',
  name: 'Caprese Moderne',
  restaurant: 'linstitut',

  parTime: 35,    // 35 seconds for experienced players
  maxTime: 50,    // 50 seconds before time runs out

  ghostOpacity: 0.5,

  ingredients: [
    {
      id: 'tomato',
      name: 'Tomato',
      gesture: 'place',
      hintText: 'place',
      shape: { type: 'circle', diameter: 55 },
      color: 0xE53935, // Rich tomato red
    },
    {
      id: 'mozzarella',
      name: 'Mozzarella',
      gesture: 'place',
      hintText: 'place',
      shape: { type: 'circle', diameter: 50 },
      color: 0xFFFDE7, // Creamy white
    },
    {
      id: 'basil-oil',
      name: 'Basil Oil',
      gesture: 'drizzle',
      hintText: 'drizzle',
      shape: { type: 'path' },
      color: 0x4A7C23, // Green basil oil
    },
    {
      id: 'balsamic-dots',
      name: 'Balsamic',
      gesture: 'dot',
      hintText: 'dot × 4',
      shape: { type: 'circle', diameter: 10 },
      color: 0x2C1810, // Dark balsamic
      count: 4,
    },
  ],

  targets: [
    // Tomato - left side of plate
    {
      type: 'point',
      id: 'tomato-target',
      ingredientId: 'tomato',
      position: { x: -0.15, y: 0 },
      rotation: 0,
      zones: {
        perfect: 0.08,
        great: 0.15,
        good: 0.25,
        acceptable: 0.40,
      },
    },

    // Mozzarella - right side of plate (overlapping slightly with tomato)
    {
      type: 'point',
      id: 'mozz-target',
      ingredientId: 'mozzarella',
      position: { x: 0.15, y: 0 },
      rotation: 0,
      zones: {
        perfect: 0.08,
        great: 0.15,
        good: 0.25,
        acceptable: 0.40,
      },
    },

    // Basil oil drizzle - elegant arc around the elements
    // Forms a sweeping curve that frames the tomato and mozzarella
    {
      type: 'drizzle',
      id: 'basil-drizzle',
      ingredientId: 'basil-oil',
      path: [
        // Starting upper left, sweeping around to lower right
        { x: -0.30, y: -0.20 },
        { x: -0.05, y: -0.30 },
        { x: 0.20, y: -0.25 },
        { x: 0.35, y: -0.10 },
        { x: 0.38, y: 0.10 },
        { x: 0.30, y: 0.25 },
        { x: 0.10, y: 0.32 },
        { x: -0.15, y: 0.30 },
      ],
      pathWidth: 0.10, // How close to ideal path (10% of plate radius)
    },

    // Balsamic dots - four corners to frame the composition
    {
      type: 'multipoint',
      id: 'balsamic-dots',
      ingredientId: 'balsamic-dots',
      positions: [
        { x: -0.30, y: 0.25 },   // Lower left
        { x: 0.30, y: 0.25 },    // Lower right
        { x: -0.25, y: -0.25 },  // Upper left
        { x: 0.25, y: -0.25 },   // Upper right
      ],
      zones: {
        perfect: 0.05,
        great: 0.10,
        good: 0.15,
        acceptable: 0.25,
      },
    },
  ],
};
