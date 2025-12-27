import type { DishDefinition } from '@/types/dishes';

/**
 * Lesson 5: Sole Meunière
 *
 * The fifth lesson introduces the quenelle gesture - the most technically
 * demanding gesture in the game. Students learn the classic arc + pause + release
 * motion to form an elegant butter quenelle on their sole meunière.
 *
 * Chef's quote: "The quenelle is patience made visible. Rush it, and it shows."
 */
export const lesson5Sole: DishDefinition = {
  id: 'linstitut-lesson-5',
  name: 'Sole Meunière',
  restaurant: 'linstitut',

  parTime: 35,    // 35 seconds for experienced players
  maxTime: 55,    // 55 seconds before time runs out

  ghostOpacity: 0.6,

  ingredients: [
    {
      id: 'brown-butter',
      name: 'Brown Butter',
      gesture: 'swoosh',
      hintText: 'swoosh',
      shape: { type: 'path' },
      color: 0x8B7355, // Brown butter color
    },
    {
      id: 'sole-fillet',
      name: 'Sole',
      gesture: 'place',
      hintText: 'place',
      shape: { type: 'roundRect', width: 100, height: 45, radius: 20 },
    },
    {
      id: 'butter-quenelle',
      name: 'Butter',
      gesture: 'quenelle',
      hintText: 'quenelle',
      shape: { type: 'circle', diameter: 40 }, // Approximate for tray display
      color: 0xF5E6A3, // Pale butter yellow
    },
    {
      id: 'parsley',
      name: 'Parsley',
      gesture: 'scatter',
      hintText: 'scatter',
      shape: { type: 'circle', diameter: 16 },
      color: 0x228B22, // Forest green
      count: 6,
    },
  ],

  targets: [
    // Brown butter swoosh - elegant arc through the center
    {
      type: 'path',
      id: 'butter-swoosh',
      ingredientId: 'brown-butter',
      path: [
        { x: -0.35, y: 0.20 },
        { x: -0.10, y: 0.05 },
        { x: 0.15, y: -0.05 },
        { x: 0.35, y: 0.15 },
      ],
      width: 0.12, // Acceptable deviation
    },

    // Sole fillet - centered on the plate
    {
      type: 'point',
      id: 'sole-target',
      ingredientId: 'sole-fillet',
      position: { x: 0, y: 0 },
      rotation: -5, // Slight angle for visual interest
      zones: {
        perfect: 0.10,
        great: 0.18,
        good: 0.28,
        acceptable: 0.45,
      },
    },

    // Butter quenelle - the star of this lesson
    {
      type: 'quenelle',
      id: 'quenelle-target',
      ingredientId: 'butter-quenelle',
      position: { x: 0.25, y: -0.20 }, // Upper right of sole
      rotation: -15, // Slight angle matching the sole
      arcStart: { x: 0.40, y: -0.40 }, // Start in upper right
      pauseZone: { x: 0.30, y: -0.25, radius: 0.10 }, // Pause zone near target
      zones: {
        perfect: 0.06,
        great: 0.12,
        good: 0.20,
        acceptable: 0.35,
      },
    },

    // Parsley scatter - light garnish around the sole
    {
      type: 'zone',
      id: 'parsley-scatter',
      ingredientId: 'parsley',
      zone: { center: { x: 0, y: 0 }, radius: 0.30 },
      idealCount: 6,
    },
  ],
};
