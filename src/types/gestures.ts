import type { TouchPoint, TouchPath } from '@/game/core/InputManager';

// All supported gesture types in the game
export type GestureType =
  | 'place'    // tap to place solid ingredient
  | 'swoosh'   // curved sauce stroke
  | 'dot'      // short tap for sauce dots
  | 'scatter'  // multiple quick taps for garnish
  | 'quenelle' // drag with curve for shaped sauces
  | 'drizzle'  // slow curved movement
  | 'tweeze'   // precise placement with rotation
  | 'dust';    // shake motion for powders

// Result from gesture recognition and scoring
export interface GestureResult {
  type: GestureType;
  success: boolean;
  techniqueScore: number;  // 0-100
  penalties: GesturePenalty[];
}

export interface GesturePenalty {
  reason: string;
  deduction: number;  // positive number, will be subtracted
}

// Target for swoosh-type gestures (path-based)
export interface SwooshTarget {
  id: string;
  ingredientId: string;
  path: PathPoint[];  // Ideal path normalized -1 to 1
  width: number;      // Acceptable width deviation as % of plate radius
}

export interface PathPoint {
  x: number;  // -1 to 1, normalized to plate
  y: number;
}

// Drizzle target for continuous thin lines (oil, reduction)
export interface DrizzleTarget {
  type: 'drizzle';
  id: string;
  ingredientId: string;
  path: PathPoint[];       // Ideal path normalized -1 to 1
  pathWidth: number;       // How close to ideal path (as fraction of plate radius)
}

// Tweeze target for precision placement of delicate elements
export interface TweezeTarget {
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

// Dust target for powder dusting gestures
export interface DustTarget {
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

// Unified target type that can be point-based, path-based, zone-based, quenelle, drizzle, tweeze, or dust
export type GestureTarget =
  | PointTarget
  | PathTarget
  | ZoneTarget
  | QuenelleTarget
  | DrizzleTarget
  | TweezeTarget
  | DustTarget;

export interface PointTarget {
  type: 'point';
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

export interface PathTarget {
  type: 'path';
  id: string;
  ingredientId: string;
  path: PathPoint[];
  width: number;  // as fraction of plate radius
}

export interface ZoneTarget {
  type: 'zone';
  id: string;
  ingredientId: string;
  zone: {
    center: { x: number; y: number };  // Normalized -1 to 1
    radius: number;  // As fraction of plate radius
  };
  idealCount: number;  // How many particles should land in zone
}

export interface QuenelleTarget {
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

// For swoosh analysis
export interface PathMetrics {
  totalLength: number;
  smoothness: number;      // 0-1, how smooth the path is
  speedVariation: number;  // 0-1, lower is more consistent
  curvature: number;       // average curvature
  directionChanges: number; // sudden direction reversals
}

export { TouchPoint, TouchPath };
