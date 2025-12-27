import type { DishDefinition } from '@/types/dishes';

/**
 * Final Exam: Pigeon en Croûte
 *
 * The culmination of all techniques learned at L'Institut.
 * This dish requires mastery of every gesture type and
 * demonstrates the student's readiness for professional service.
 *
 * This is a true test - minimal ghost guidance forces students
 * to rely on their trained instincts and muscle memory.
 *
 * Chef's quote: "Show me what you have learned. The plate remembers everything."
 */
export const finalExamPigeon: DishDefinition = {
  id: 'linstitut-final',
  name: 'Pigeon en Croûte',
  restaurant: 'linstitut',
  isFinalExam: true,

  parTime: 90, // 90 seconds for experienced players
  maxTime: 120, // 2 minutes before time runs out

  // Final exam: minimal ghost guidance
  ghostOpacity: 0.2,

  // Chef's quote shown before the dish
  chefQuote: 'Show me what you have learned. The plate remembers everything.',

  ingredients: [
    // 1. Foundation: the jus swoosh
    {
      id: 'jus',
      name: 'Jus',
      gesture: 'swoosh',
      hintText: 'swoosh',
      shape: { type: 'path' },
      color: 0x2c1810, // Deep brown
    },
    // 2. Main protein: pigeon breast
    {
      id: 'pigeon',
      name: 'Pigeon',
      gesture: 'place',
      hintText: 'place',
      shape: { type: 'roundRect', width: 55, height: 40, radius: 8 },
      color: 0x8b4513, // Roasted brown
    },
    // 3. Pastry element
    {
      id: 'pastry',
      name: 'Pastry',
      gesture: 'place',
      hintText: 'place',
      shape: { type: 'roundRect', width: 35, height: 25, radius: 4 },
      color: 0xdaa520, // Golden pastry
    },
    // 4. Vegetable purée quenelle
    {
      id: 'vegetable-puree',
      name: 'Purée',
      gesture: 'quenelle',
      hintText: 'quenelle',
      shape: { type: 'path' },
      color: 0x7d8b3e, // Earthy green
    },
    // 5. Sauce dots
    {
      id: 'sauce-dots',
      name: 'Sauce',
      gesture: 'dot',
      hintText: 'dot',
      shape: { type: 'circle', diameter: 8 },
      color: 0x4a3728, // Dark sauce
      count: 6,
    },
    // 6. Baby vegetables with tweezers
    {
      id: 'vegetables',
      name: 'Baby Vegetables',
      gesture: 'tweeze',
      hintText: 'tweeze',
      shape: { type: 'roundRect', width: 12, height: 24, radius: 4 },
      color: 0x228b22, // Forest green
      count: 4,
    },
    // 7. Micro herbs scattered
    {
      id: 'herbs',
      name: 'Micro Herbs',
      gesture: 'scatter',
      hintText: 'scatter',
      shape: { type: 'circle', diameter: 4 },
      color: 0x32cd32, // Lime green
      count: 10,
    },
    // 8. Herb oil drizzle
    {
      id: 'oil-drizzle',
      name: 'Herb Oil',
      gesture: 'drizzle',
      hintText: 'drizzle',
      shape: { type: 'path' },
      color: 0x4a7c23, // Olive green
    },
    // 9. Final touch: black salt dust
    {
      id: 'finishing-dust',
      name: 'Black Salt',
      gesture: 'dust',
      hintText: 'dust',
      shape: { type: 'path' },
      color: 0x2a2a2a, // Charcoal
      count: 80, // Particle count
    },
  ],

  targets: [
    // Jus swoosh - dramatic arc across the plate
    {
      type: 'path',
      id: 'jus-target',
      ingredientId: 'jus',
      path: [
        { x: -0.35, y: 0.25 },
        { x: -0.15, y: 0.1 },
        { x: 0.1, y: -0.05 },
        { x: 0.3, y: -0.15 },
        { x: 0.4, y: -0.2 },
      ],
      width: 0.12,
    },

    // Pigeon - placed on the jus, slightly off-center
    {
      type: 'point',
      id: 'pigeon-target',
      ingredientId: 'pigeon',
      position: { x: 0.05, y: 0.0 },
      rotation: -10,
      zones: {
        perfect: 0.06,
        great: 0.12,
        good: 0.20,
        acceptable: 0.35,
      },
    },

    // Pastry - resting against the pigeon
    {
      type: 'point',
      id: 'pastry-target',
      ingredientId: 'pastry',
      position: { x: -0.12, y: -0.08 },
      rotation: 15,
      zones: {
        perfect: 0.05,
        great: 0.10,
        good: 0.18,
        acceptable: 0.30,
      },
    },

    // Purée quenelle - elegant placement to the side
    {
      type: 'quenelle',
      id: 'puree-target',
      ingredientId: 'vegetable-puree',
      position: { x: -0.25, y: 0.15 },
      rotation: 25,
      arcStart: { x: -0.4, y: 0.35 },
      pauseZone: { x: -0.3, y: 0.22, radius: 0.08 },
      zones: {
        perfect: 0.05,
        great: 0.10,
        good: 0.18,
        acceptable: 0.30,
      },
    },

    // Sauce dots - arc pattern around the dish
    {
      type: 'multipoint',
      id: 'sauce-target',
      ingredientId: 'sauce-dots',
      positions: [
        { x: 0.28, y: 0.15 },
        { x: 0.32, y: 0.0 },
        { x: 0.28, y: -0.15 },
        { x: 0.18, y: -0.25 },
        { x: 0.02, y: -0.28 },
        { x: -0.15, y: -0.25 },
      ],
      zones: {
        perfect: 0.04,
        great: 0.08,
        good: 0.14,
        acceptable: 0.22,
      },
    },

    // Baby vegetables - precise tweeze placements
    {
      type: 'tweeze',
      id: 'veg1-target',
      ingredientId: 'vegetables',
      position: { x: 0.15, y: 0.12 },
      rotation: 45,
      zones: {
        perfect: 0.03,
        great: 0.06,
        good: 0.10,
        acceptable: 0.18,
      },
    },
    {
      type: 'tweeze',
      id: 'veg2-target',
      ingredientId: 'vegetables',
      position: { x: 0.22, y: 0.05 },
      rotation: -30,
      zones: {
        perfect: 0.03,
        great: 0.06,
        good: 0.10,
        acceptable: 0.18,
      },
    },
    {
      type: 'tweeze',
      id: 'veg3-target',
      ingredientId: 'vegetables',
      position: { x: 0.18, y: -0.05 },
      rotation: 60,
      zones: {
        perfect: 0.03,
        great: 0.06,
        good: 0.10,
        acceptable: 0.18,
      },
    },
    {
      type: 'tweeze',
      id: 'veg4-target',
      ingredientId: 'vegetables',
      position: { x: 0.12, y: -0.12 },
      rotation: -15,
      zones: {
        perfect: 0.03,
        great: 0.06,
        good: 0.10,
        acceptable: 0.18,
      },
    },

    // Micro herbs scatter zone
    {
      type: 'zone',
      id: 'herbs-target',
      ingredientId: 'herbs',
      zone: {
        center: { x: 0.08, y: 0.0 },
        radius: 0.25,
      },
      idealCount: 10,
    },

    // Herb oil drizzle - flowing pattern
    {
      type: 'drizzle',
      id: 'oil-target',
      ingredientId: 'oil-drizzle',
      path: [
        { x: -0.3, y: -0.2 },
        { x: -0.15, y: -0.25 },
        { x: 0.0, y: -0.22 },
        { x: 0.15, y: -0.28 },
      ],
      pathWidth: 0.08,
    },

    // Black salt dust - subtle finishing touch
    {
      type: 'dust',
      id: 'salt-target',
      ingredientId: 'finishing-dust',
      zone: {
        type: 'rectangle',
        bounds: { x: -0.15, y: -0.15, width: 0.4, height: 0.3 },
      },
      avoidZones: [
        // Avoid the purée
        { type: 'circle', center: { x: -0.25, y: 0.15 }, radius: 0.12 },
      ],
      idealCoverage: 0.4, // Light dusting - restraint is key
    },
  ],

  // Standard scoring (not tutorial-forgiving)
  scoringModifiers: {
    precisionMultiplier: 1.0,
    techniqueMultiplier: 1.0,
    tempoMultiplier: 1.0,
  },

  // Challenging thresholds for the final exam
  starThresholds: {
    threeStar: 95,
    twoStar: 85,
    oneStar: 70,
  },
};
