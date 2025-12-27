import type { DishDefinition } from '@/types/dishes';

/**
 * Lesson 4: Spring Pea Salad
 *
 * The fourth lesson introduces the scatter gesture - controlled randomness
 * for herbs and small elements. Students learn to flick pea shoots, peas,
 * and mint leaves across the plate with an artistic distribution.
 */
export const lesson4PeaSalad: DishDefinition = {
  id: 'linstitut-lesson-4',
  name: 'Spring Pea Salad',
  restaurant: 'linstitut',

  parTime: 30,    // 30 seconds for experienced players
  maxTime: 45,    // 45 seconds before time runs out

  ghostOpacity: 0.5,

  ingredients: [
    {
      id: 'pea-shoots',
      name: 'Pea Shoots',
      gesture: 'scatter',
      hintText: 'scatter',
      shape: { type: 'circle', diameter: 24 },  // Visual in tray
      color: 0x228B22,  // Forest green
      count: 12,  // Particle count
    },
    {
      id: 'peas',
      name: 'Peas',
      gesture: 'scatter',
      hintText: 'scatter',
      shape: { type: 'circle', diameter: 20 },
      color: 0x90EE90,  // Light green
      count: 8,
    },
    {
      id: 'mint-leaves',
      name: 'Mint',
      gesture: 'scatter',
      hintText: 'scatter',
      shape: { type: 'circle', diameter: 18 },
      color: 0x3CB371,  // Medium sea green
      count: 5,
    },
    {
      id: 'lemon-oil',
      name: 'Lemon Oil',
      gesture: 'dot',  // Using dot for now, drizzle coming later
      hintText: 'dot × 3',
      shape: { type: 'circle', diameter: 12 },
      color: 0xE8D44D,  // Lemon yellow
      count: 3,
    },
  ],

  targets: [
    {
      type: 'zone',
      id: 'shoots-scatter',
      ingredientId: 'pea-shoots',
      zone: { center: { x: 0, y: 0 }, radius: 0.35 },
      idealCount: 12,
    },
    {
      type: 'zone',
      id: 'peas-scatter',
      ingredientId: 'peas',
      zone: { center: { x: 0, y: 0 }, radius: 0.30 },
      idealCount: 8,
    },
    {
      type: 'zone',
      id: 'mint-scatter',
      ingredientId: 'mint-leaves',
      zone: { center: { x: 0, y: 0 }, radius: 0.35 },
      idealCount: 5,
    },
    {
      type: 'multipoint',
      id: 'oil-dots',
      ingredientId: 'lemon-oil',
      positions: [
        { x: -0.25, y: -0.20 },  // Upper left area
        { x: 0.25, y: -0.15 },   // Upper right area
        { x: 0, y: 0.25 },       // Lower center
      ],
      zones: {
        perfect: 0.06,
        great: 0.12,
        good: 0.20,
        acceptable: 0.35,
      },
    },
  ],
};
