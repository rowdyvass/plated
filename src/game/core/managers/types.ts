import type { Container } from 'pixi.js';
import type { Plate } from '../../entities/Plate';
import type { Ghost } from '../../entities/Ghost';
import type { TexturedGhost } from '../../entities/TexturedGhost';
import type { PathGhost } from '../../entities/PathGhost';
import type { DotGhost } from '../../entities/DotGhost';
import type { ScatterGhost } from '../../entities/ScatterGhost';
import type { DrizzleGhost } from '../../entities/DrizzleGhost';
import type { DustGhost } from '../../entities/DustGhost';
import type { GestureRecognizer } from '../../gestures/GestureRecognizer';
import type { DishDefinition } from '@/types/dishes';
import type { Renderer } from '../Renderer';
import type { TouchPoint } from '../InputManager';

// Union type for all ghost variants
export type GhostType = Ghost | TexturedGhost | PathGhost | DotGhost | ScatterGhost | DrizzleGhost | DustGhost;

// Visual element placed on the plate
export interface PlacedVisual {
  id: string;
  container: Container;
  type: 'element' | 'sauce';
}

// Shared context passed to all managers
export interface GameContext {
  readonly renderer: Renderer;
  readonly plate: Plate;
  readonly ghostsContainer: Container;
  readonly ghosts: Map<string, GhostType>;
  readonly gestureRecognizer: GestureRecognizer;
  readonly placedVisuals: PlacedVisual[];
  currentDish: DishDefinition | null;

  // Helper method for coordinate conversion
  toPlateLocal(point: TouchPoint): TouchPoint | null;
}

// Result types for gestures
export interface SwooshResult {
  success: boolean;
  techniqueScore: number;
  penalties: { reason: string; deduction: number }[];
}

export interface DotResult {
  success: boolean;
  techniqueScore: number;
  penalties: { reason: string; deduction: number }[];
  dotIndex: number;
  remainingDots: number;
}

export interface ScatterResult {
  success: boolean;
  techniqueScore: number;
  zone: 'perfect' | 'great' | 'good' | 'acceptable' | 'miss';
  inZoneCount: number;
  totalCount: number;
}

export interface PlaceResult {
  success: boolean;
  techniqueScore: number;
  zone: 'perfect' | 'great' | 'good' | 'acceptable' | 'miss';
  placedIndex: number;
  remainingCount: number;
  totalCount?: number;
}

export interface DustResult {
  success: boolean;
  techniqueScore: number;
  penalties: { reason: string; deduction: number }[];
  coverage: number;
}

// Zone type for scoring
export type PlacementZone = 'perfect' | 'great' | 'good' | 'acceptable' | 'miss';
