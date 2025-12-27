import type { GestureType } from './index';
import type { PathPoint } from './gestures';

export type IngredientShape =
  | { type: 'circle'; diameter: number }
  | { type: 'roundRect'; width: number; height: number; radius: number }
  | { type: 'path' };  // For swoosh/drizzle gestures (no fixed shape)

// Point-based target (for place gesture)
export interface PointGestureTarget {
  type: 'point';
  id: string;
  ingredientId: string;
  position: { x: number; y: number }; // relative to plate center, normalized -1 to 1
  rotation: number;
  zones: {
    perfect: number;   // radius as % of plate (e.g., 0.08 = 8%)
    great: number;     // 0.15
    good: number;      // 0.25
    acceptable: number; // 0.50
  };
}

// Multi-point target (for dot gestures with multiple placements)
export interface MultiPointGestureTarget {
  type: 'multipoint';
  id: string;
  ingredientId: string;
  positions: { x: number; y: number }[]; // Multiple target positions
  zones: {
    perfect: number;
    great: number;
    good: number;
    acceptable: number;
  };
}

// Path-based target (for swoosh, drizzle gestures)
export interface PathGestureTarget {
  type: 'path';
  id: string;
  ingredientId: string;
  path: PathPoint[];  // Ideal path, normalized -1 to 1
  width: number;      // Acceptable deviation as % of plate radius
}

// Zone-based target (for scatter gestures)
export interface ZoneGestureTarget {
  type: 'zone';
  id: string;
  ingredientId: string;
  zone: {
    center: { x: number; y: number };  // Normalized -1 to 1
    radius: number;  // As fraction of plate radius
  };
  idealCount: number;  // How many particles should land in zone
}

// Quenelle target (for quenelle gestures - arc + pause + release)
export interface QuenelleGestureTarget {
  type: 'quenelle';
  id: string;
  ingredientId: string;
  position: { x: number; y: number }; // Where quenelle lands (normalized -1 to 1)
  rotation: number; // Rotation in degrees
  arcStart: { x: number; y: number }; // Where the arc should begin
  pauseZone: { x: number; y: number; radius: number }; // Where pause should occur
  zones: {
    perfect: number;
    great: number;
    good: number;
    acceptable: number;
  };
}

// Drizzle target (for continuous oil/reduction lines)
export interface DrizzleGestureTarget {
  type: 'drizzle';
  id: string;
  ingredientId: string;
  path: PathPoint[];       // Ideal path normalized -1 to 1
  pathWidth: number;       // How close to ideal path (as fraction of plate radius)
}

// Tweeze target (for precision placement of delicate elements)
export interface TweezeGestureTarget {
  type: 'tweeze';
  id: string;
  ingredientId: string;
  position: { x: number; y: number }; // Target position normalized -1 to 1
  rotation?: number; // Optional rotation requirement in degrees
  zones: {
    perfect: number;   // Very tight for precision placement
    great: number;
    good: number;
    acceptable: number;
  };
}

// Dust target (for powder dusting gestures)
export interface DustGestureTarget {
  type: 'dust';
  id: string;
  ingredientId: string;
  zone: {
    type: 'rectangle' | 'circle';
    bounds: { x: number; y: number; width: number; height: number };
  };
  avoidZones?: {
    type: 'circle';
    center: { x: number; y: number };
    radius: number;
  }[];
  idealCoverage: number; // 0-1, what % coverage is ideal
}

// Union type for all target types
export type GestureTarget = PointGestureTarget | PathGestureTarget | MultiPointGestureTarget | ZoneGestureTarget | QuenelleGestureTarget | DrizzleGestureTarget | TweezeGestureTarget | DustGestureTarget;

// Legacy support: infer type if not specified
export interface LegacyGestureTarget {
  id: string;
  ingredientId: string;
  position: { x: number; y: number };
  rotation: number;
  zones: {
    perfect: number;
    great: number;
    good: number;
    acceptable: number;
  };
}

export interface DishIngredient {
  id: string;
  name: string;
  gesture: GestureType;
  hintText: string;
  shape: IngredientShape;
  color?: number;  // For sauce rendering (hex color)
  count?: number;  // Number of times this gesture should be performed (for dots, etc.)
}

export interface ScoringModifiers {
  precisionMultiplier: number;
  techniqueMultiplier: number;
  tempoMultiplier: number;
}

export interface StarThresholds {
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

export interface DishDefinition {
  id: string;
  name: string;
  restaurant: string;

  parTime: number;  // seconds for "par" completion
  maxTime: number;  // seconds until time runs out

  ghostOpacity: number;

  // Optional: Final exam flag
  isFinalExam?: boolean;

  // Optional: Chef's quote for the dish
  chefQuote?: string;

  ingredients: DishIngredient[];
  targets: (GestureTarget | LegacyGestureTarget)[];

  // Optional: Scoring modifiers for tutorials (more forgiving) or exams (stricter)
  scoringModifiers?: ScoringModifiers;

  // Optional: Custom star thresholds (defaults: 90/70/50)
  starThresholds?: StarThresholds;
}

// Type guard to check if a target is path-based
export function isPathTarget(target: GestureTarget | LegacyGestureTarget): target is PathGestureTarget {
  return 'type' in target && target.type === 'path';
}

// Type guard to check if a target is point-based
export function isPointTarget(target: GestureTarget | LegacyGestureTarget): target is PointGestureTarget {
  return ('type' in target && target.type === 'point') || !('type' in target);
}

// Type guard to check if a target is multipoint-based (for dots)
export function isMultiPointTarget(target: GestureTarget | LegacyGestureTarget): target is MultiPointGestureTarget {
  return 'type' in target && target.type === 'multipoint';
}

// Type guard to check if a target is zone-based (for scatter)
export function isZoneTarget(target: GestureTarget | LegacyGestureTarget): target is ZoneGestureTarget {
  return 'type' in target && target.type === 'zone';
}

// Type guard to check if a target is quenelle-based
export function isQuenelleTarget(target: GestureTarget | LegacyGestureTarget): target is QuenelleGestureTarget {
  return 'type' in target && target.type === 'quenelle';
}

// Type guard to check if a target is drizzle-based
export function isDrizzleTarget(target: GestureTarget | LegacyGestureTarget): target is DrizzleGestureTarget {
  return 'type' in target && target.type === 'drizzle';
}

// Type guard to check if a target is tweeze-based
export function isTweezeTarget(target: GestureTarget | LegacyGestureTarget): target is TweezeGestureTarget {
  return 'type' in target && target.type === 'tweeze';
}

// Type guard to check if a target is dust-based
export function isDustTarget(target: GestureTarget | LegacyGestureTarget): target is DustGestureTarget {
  return 'type' in target && target.type === 'dust';
}

// Convert legacy target to point target
export function normalizeTarget(target: GestureTarget | LegacyGestureTarget): GestureTarget {
  if ('type' in target) {
    return target;
  }
  // Legacy format - convert to PointGestureTarget
  return {
    type: 'point',
    ...target,
  };
}
