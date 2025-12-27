import { Graphics } from 'pixi.js';
import { BaseGesture } from './BaseGesture';
import type { GestureResult, GestureTarget, TouchPath, PointTarget } from '@/types/gestures';

/**
 * Place gesture: simple tap/drag to position an ingredient.
 * Recognition: short duration, minimal movement, has endpoint.
 * Scoring: based on position precision (handled externally for now).
 */
export class PlaceGesture extends BaseGesture {
  readonly type = 'place' as const;

  // Recognition thresholds
  private readonly MAX_DURATION_MS = 2000;  // Allow longer drags
  private readonly MIN_POINTS = 1;          // Just need a start point

  recognize(path: TouchPath): boolean {
    const { points, duration } = path;

    // Must have at least one point
    if (points.length < this.MIN_POINTS) {
      return false;
    }

    // Check duration (allow up to 2 seconds for careful placement)
    if (duration > this.MAX_DURATION_MS) {
      return false;
    }

    // Check if it's not a long swipe (those are other gestures)
    // Place gestures can have movement (dragging), but should end at a point
    return true;
  }

  score(path: TouchPath, target: GestureTarget, plateRadius: number): GestureResult {
    // PlaceGesture expects a PointTarget
    if (target.type !== 'point') {
      return {
        type: 'place',
        success: false,
        techniqueScore: 0,
        penalties: [{ reason: 'Wrong target type for place gesture', deduction: 100 }],
      };
    }

    const pointTarget = target as PointTarget;
    const points = path.points;
    const endPoint = points[points.length - 1];

    // Calculate position in plate-relative coordinates
    // The endPoint is already in plate-local pixels from Game.ts
    const targetX = pointTarget.position.x * plateRadius;
    const targetY = pointTarget.position.y * plateRadius;

    const dx = endPoint.x - targetX;
    const dy = endPoint.y - targetY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate zones in pixels
    const perfectRadius = pointTarget.zones.perfect * plateRadius;
    const greatRadius = pointTarget.zones.great * plateRadius;
    const goodRadius = pointTarget.zones.good * plateRadius;
    const acceptableRadius = pointTarget.zones.acceptable * plateRadius;

    // Determine score based on zone
    let techniqueScore = 100;
    const penalties: { reason: string; deduction: number }[] = [];

    if (distance <= perfectRadius) {
      // Perfect placement - full score
      techniqueScore = 100;
    } else if (distance <= greatRadius) {
      // Great - small deduction
      const penalty = 10;
      penalties.push({ reason: 'Slight position offset', deduction: penalty });
      techniqueScore = 100 - penalty;
    } else if (distance <= goodRadius) {
      // Good - moderate deduction
      const penalty = 25;
      penalties.push({ reason: 'Position offset', deduction: penalty });
      techniqueScore = 100 - penalty;
    } else if (distance <= acceptableRadius) {
      // Acceptable - significant deduction
      const penalty = 40;
      penalties.push({ reason: 'Significant position offset', deduction: penalty });
      techniqueScore = 100 - penalty;
    } else {
      // Miss
      const penalty = 70;
      penalties.push({ reason: 'Missed target zone', deduction: penalty });
      techniqueScore = 100 - penalty;
    }

    // Check for clean release (no jitter at end)
    if (points.length > 3) {
      const lastFew = points.slice(-3);
      let jitter = 0;
      for (let i = 1; i < lastFew.length; i++) {
        const jdx = lastFew[i].x - lastFew[i - 1].x;
        const jdy = lastFew[i].y - lastFew[i - 1].y;
        jitter += Math.sqrt(jdx * jdx + jdy * jdy);
      }
      if (jitter > 20) {
        const penalty = 5;
        penalties.push({ reason: 'Unsteady release', deduction: penalty });
        techniqueScore = Math.max(0, techniqueScore - penalty);
      }
    }

    return {
      type: 'place',
      success: distance <= acceptableRadius,
      techniqueScore,
      penalties,
    };
  }

  render(
    graphics: Graphics,
    _path: TouchPath,
    _progress: number,
    _color: number
  ): void {
    // Place gesture rendering is handled by the dragged element overlay
    // in React, so we don't render anything in PixiJS
    graphics.clear();
  }
}
