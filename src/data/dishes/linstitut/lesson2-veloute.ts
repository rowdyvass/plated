import type { DishDefinition } from '@/types/dishes';

/**
 * Lesson 2: Leek Velouté
 *
 * The second lesson introduces the swoosh gesture - the signature
 * sauce technique used in fine dining. Students learn to create
 * an elegant curved sauce swoosh followed by placing a crème fraîche quenelle.
 */
export const lesson2Veloute: DishDefinition = {
  id: 'linstitut-lesson-2',
  name: 'Leek Velouté',
  restaurant: 'linstitut',

  parTime: 20,    // 20 seconds for experienced players
  maxTime: 35,    // 35 seconds before time runs out

  ghostOpacity: 0.6,

  ingredients: [
    {
      id: 'veloute-swoosh',
      name: 'Velouté',
      gesture: 'swoosh',
      hintText: 'swoosh',
      shape: { type: 'path' },
      color: 0xE8DCC8,  // cream color for the sauce
    },
    {
      id: 'creme-fraiche',
      name: 'Crème Fraîche',
      gesture: 'place',
      hintText: 'place',
      shape: { type: 'circle', diameter: 32 },
      color: 0xFFFEF8,  // off-white
    },
  ],

  targets: [
    {
      type: 'path',
      id: 'swoosh-target',
      ingredientId: 'veloute-swoosh',
      // Elegant S-curve swoosh across the plate
      // Path points are normalized -1 to 1 relative to plate center
      path: [
        { x: -0.5, y: 0.15 },   // Start on left side, slightly below center
        { x: -0.15, y: -0.1 },  // Curve up through middle
        { x: 0.2, y: 0.0 },     // Continue curving
        { x: 0.45, y: -0.08 },  // End on right side
      ],
      width: 0.18,  // Allow 18% plate radius deviation
    },
    {
      type: 'point',
      id: 'creme-target',
      ingredientId: 'creme-fraiche',
      position: { x: 0.15, y: -0.05 },  // Slightly right of center, near swoosh curve
      rotation: 0,
      zones: {
        perfect: 0.08,
        great: 0.15,
        good: 0.25,
        acceptable: 0.40,
      },
    },
  ],
};
