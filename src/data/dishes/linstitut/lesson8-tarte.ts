import type { DishDefinition } from '@/types/dishes';

/**
 * Lesson 8: Tarte Tatin
 *
 * This lesson introduces the dust gesture - the final flourish of
 * powdered sugar, cocoa, or matcha. Students learn to create
 * delicate, even dustings that whisper rather than shout.
 *
 * Key skills:
 * - Controlled swiping motion across a zone
 * - Even coverage distribution
 * - Avoiding specific areas (like the crème fraîche)
 * - Visual restraint - less is more
 *
 * Chef's quote: "Restraint. The powder should whisper, not shout."
 */
export const lesson8Tarte: DishDefinition = {
  id: 'linstitut-lesson-8',
  name: 'Tarte Tatin',
  restaurant: 'linstitut',

  parTime: 30,    // 30 seconds for experienced players
  maxTime: 45,    // 45 seconds before time runs out

  ghostOpacity: 0.5,

  ingredients: [
    {
      id: 'tarte-slice',
      name: 'Tarte',
      gesture: 'place',
      hintText: 'place',
      shape: { type: 'roundRect', width: 60, height: 50, radius: 8 },
      color: 0xB8860B, // Dark golden brown (caramelized apple)
    },
    {
      id: 'creme-quenelle',
      name: 'Crème Fraîche',
      gesture: 'quenelle',
      hintText: 'quenelle',
      shape: { type: 'path' },
      color: 0xFFFEF5, // Off-white cream
    },
    {
      id: 'powdered-sugar',
      name: 'Powdered Sugar',
      gesture: 'dust',
      hintText: 'dust',
      shape: { type: 'path' }, // No fixed shape for dust
      color: 0xFFFFFF, // Pure white
      count: 150, // Particle count
    },
  ],

  targets: [
    // Tarte slice - placed off-center
    {
      type: 'point',
      id: 'tarte-target',
      ingredientId: 'tarte-slice',
      position: { x: -0.05, y: 0.05 },
      rotation: 15, // Slight angle
      zones: {
        perfect: 0.08,
        great: 0.15,
        good: 0.25,
        acceptable: 0.40,
      },
    },

    // Crème fraîche quenelle - elegant placement beside the tarte
    {
      type: 'quenelle',
      id: 'creme-target',
      ingredientId: 'creme-quenelle',
      position: { x: 0.20, y: -0.15 },
      rotation: -20, // Angled away from tarte
      arcStart: { x: 0.35, y: -0.35 }, // Start the arc here
      pauseZone: { x: 0.25, y: -0.20, radius: 0.08 }, // Pause zone
      zones: {
        perfect: 0.05,
        great: 0.10,
        good: 0.18,
        acceptable: 0.30,
      },
    },

    // Powdered sugar dust - covers most of plate except crème
    {
      type: 'dust',
      id: 'sugar-dust',
      ingredientId: 'powdered-sugar',
      zone: {
        type: 'rectangle',
        bounds: { x: -0.40, y: -0.35, width: 0.80, height: 0.70 },
      },
      avoidZones: [
        // Avoid the crème fraîche area
        { type: 'circle', center: { x: 0.20, y: -0.15 }, radius: 0.14 },
      ],
      idealCoverage: 0.6, // Don't overdo it - subtle is key
    },
  ],
};
