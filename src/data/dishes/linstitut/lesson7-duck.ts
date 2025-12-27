import type { DishDefinition } from '@/types/dishes';

/**
 * Lesson 7: Duck Breast
 *
 * This lesson introduces the tweeze gesture - precision placement of
 * delicate elements using a grip-and-place motion. Students must hold
 * steady to "grip" the element with tweezers, then carefully position
 * micro greens and edible flowers.
 *
 * Key skills:
 * - Long press to establish grip (300ms hold)
 * - Steady hand during carry
 * - Precise placement of delicate elements
 * - Rotation awareness for flowers
 *
 * Chef's quote: "The tweezers are an extension of intention. Steady hands, clear mind."
 */
export const lesson7Duck: DishDefinition = {
  id: 'linstitut-lesson-7',
  name: 'Duck Breast',
  restaurant: 'linstitut',

  parTime: 40,    // 40 seconds for experienced players
  maxTime: 60,    // 60 seconds before time runs out

  ghostOpacity: 0.5,

  ingredients: [
    {
      id: 'jus',
      name: 'Jus',
      gesture: 'swoosh',
      hintText: 'swoosh',
      shape: { type: 'path' },
      color: 0x3D2314, // Rich dark brown jus
    },
    {
      id: 'duck-slices',
      name: 'Duck',
      gesture: 'place',
      hintText: 'place × 3',
      shape: { type: 'roundRect', width: 45, height: 30, radius: 4 },
      color: 0x8B4513, // Seared duck color
      count: 3,
    },
    {
      id: 'micro-greens',
      name: 'Micro Greens',
      gesture: 'tweeze',
      hintText: 'tweeze × 4',
      shape: { type: 'circle', diameter: 8 }, // Small delicate elements
      color: 0x228B22, // Forest green
      count: 4,
    },
    {
      id: 'flowers',
      name: 'Edible Flowers',
      gesture: 'tweeze',
      hintText: 'tweeze × 2',
      shape: { type: 'circle', diameter: 12 }, // Slightly larger than greens
      color: 0xDA70D6, // Orchid purple
      count: 2,
    },
  ],

  targets: [
    // Jus swoosh - elegant curved stroke under the duck
    {
      type: 'path',
      id: 'jus-swoosh',
      ingredientId: 'jus',
      path: [
        { x: -0.30, y: 0.15 },
        { x: -0.10, y: 0.05 },
        { x: 0.10, y: -0.05 },
        { x: 0.35, y: 0.10 },
      ],
      width: 0.12, // Acceptable deviation as % of plate radius
    },

    // Duck slices - three overlapping pieces in a diagonal row
    {
      type: 'multipoint',
      id: 'duck-targets',
      ingredientId: 'duck-slices',
      positions: [
        { x: -0.15, y: 0.05 },   // Left slice
        { x: 0.05, y: 0 },       // Middle slice
        { x: 0.25, y: -0.05 },   // Right slice
      ],
      zones: {
        perfect: 0.06,
        great: 0.12,
        good: 0.20,
        acceptable: 0.35,
      },
    },

    // Micro greens - four small placements around the duck
    // These use tweeze targets with tight zones
    {
      type: 'tweeze',
      id: 'greens-1',
      ingredientId: 'micro-greens',
      position: { x: -0.20, y: -0.15 },
      zones: {
        perfect: 0.04,
        great: 0.08,
        good: 0.15,
        acceptable: 0.25,
      },
    },
    {
      type: 'tweeze',
      id: 'greens-2',
      ingredientId: 'micro-greens',
      position: { x: 0.15, y: -0.18 },
      zones: {
        perfect: 0.04,
        great: 0.08,
        good: 0.15,
        acceptable: 0.25,
      },
    },
    {
      type: 'tweeze',
      id: 'greens-3',
      ingredientId: 'micro-greens',
      position: { x: 0.30, y: 0.10 },
      zones: {
        perfect: 0.04,
        great: 0.08,
        good: 0.15,
        acceptable: 0.25,
      },
    },
    {
      type: 'tweeze',
      id: 'greens-4',
      ingredientId: 'micro-greens',
      position: { x: -0.10, y: 0.20 },
      zones: {
        perfect: 0.04,
        great: 0.08,
        good: 0.15,
        acceptable: 0.25,
      },
    },

    // Edible flowers - two placements with rotation requirements
    {
      type: 'tweeze',
      id: 'flower-1',
      ingredientId: 'flowers',
      position: { x: -0.25, y: -0.10 },
      rotation: 15, // Degrees - slight tilt
      zones: {
        perfect: 0.03,  // Very tight for flowers
        great: 0.06,
        good: 0.12,
        acceptable: 0.20,
      },
    },
    {
      type: 'tweeze',
      id: 'flower-2',
      ingredientId: 'flowers',
      position: { x: 0.20, y: 0.15 },
      rotation: -20, // Opposite tilt for visual balance
      zones: {
        perfect: 0.03,
        great: 0.06,
        good: 0.12,
        acceptable: 0.20,
      },
    },
  ],
};
