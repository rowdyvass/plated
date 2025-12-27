import type { DishDefinition } from '@/types/dishes';

/**
 * Lesson 3: Tartare Classique
 *
 * The third lesson introduces the dot gesture - precise sauce drops.
 * Students learn to place a tartare mound, top it with an egg yolk,
 * then add 5 sauce dots arranged around the plate.
 */
export const lesson3Tartare: DishDefinition = {
  id: 'linstitut-lesson-3',
  name: 'Tartare Classique',
  restaurant: 'linstitut',

  parTime: 25,    // 25 seconds for experienced players
  maxTime: 40,    // 40 seconds before time runs out

  ghostOpacity: 0.6,

  ingredients: [
    {
      id: 'tartare-mound',
      name: 'Tartare',
      gesture: 'place',
      hintText: 'place',
      shape: { type: 'circle', diameter: 56 },
      color: 0x8B4513,  // Beef tartare color
    },
    {
      id: 'egg-yolk',
      name: 'Egg Yolk',
      gesture: 'place',
      hintText: 'place',
      shape: { type: 'circle', diameter: 24 },
      color: 0xFFD700,  // Golden yolk
    },
    {
      id: 'sauce-dots',
      name: 'Sauce',
      gesture: 'dot',
      hintText: 'dot × 5',
      shape: { type: 'circle', diameter: 16 },  // Visual representation in tray
      color: 0x4A3728,  // Dark sauce color
      count: 5,  // Player needs to place 5 dots
    },
  ],

  targets: [
    {
      type: 'point',
      id: 'tartare-target',
      ingredientId: 'tartare-mound',
      position: { x: 0, y: 0 },  // Center of plate
      rotation: 0,
      zones: {
        perfect: 0.10,
        great: 0.18,
        good: 0.28,
        acceptable: 0.50,
      },
    },
    {
      type: 'point',
      id: 'yolk-target',
      ingredientId: 'egg-yolk',
      position: { x: 0, y: 0 },  // On top of tartare (same position)
      rotation: 0,
      zones: {
        perfect: 0.06,
        great: 0.12,
        good: 0.20,
        acceptable: 0.35,
      },
    },
    {
      type: 'multipoint',
      id: 'dot-targets',
      ingredientId: 'sauce-dots',
      // 5 dots arranged in a pattern around the tartare
      positions: [
        { x: -0.35, y: -0.25 },  // Top left
        { x: 0.35, y: -0.25 },   // Top right
        { x: -0.40, y: 0.15 },   // Middle left
        { x: 0.40, y: 0.15 },    // Middle right
        { x: 0, y: 0.35 },       // Bottom center
      ],
      zones: {
        perfect: 0.05,
        great: 0.10,
        good: 0.18,
        acceptable: 0.30,
      },
    },
  ],
};
