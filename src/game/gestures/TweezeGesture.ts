import { Graphics } from 'pixi.js';
import { BaseGesture } from './BaseGesture';
import type { GestureResult, GestureTarget, TouchPath, TouchPoint } from '@/types/gestures';

/**
 * Tweeze target: for precision placement of delicate elements like micro greens,
 * edible flowers, and small garnishes.
 */
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

export type TweezePhase = 'idle' | 'gripping' | 'carrying' | 'placed';

interface HoldDetection {
  detected: boolean;
  startIndex: number;
  endIndex: number;
  duration: number;
  stable: boolean; // Was the hold steady?
  jitter: number;
}

/**
 * Tweeze gesture: precision placement of delicate elements using a grip-and-place motion.
 *
 * The gesture flow:
 * 1. Long press to "grip" (300ms hold with minimal movement)
 * 2. Drag to position (steady carry)
 * 3. Release to place
 *
 * Recognition criteria:
 * - Hold phase at start: ~300ms of minimal movement
 * - Followed by dragging movement
 * - Clean release at end
 *
 * Technique scoring:
 * - Grip quality: stable hold during pickup
 * - Carry steadiness: minimal jitter during drag
 * - Placement accuracy: distance from target
 * - Rotation accuracy: if target has rotation requirement
 */
export class TweezeGesture extends BaseGesture {
  readonly type = 'tweeze' as const;

  // Recognition thresholds
  private readonly GRIP_DURATION_MS = 300;       // Time to establish grip
  private readonly GRIP_MAX_MOVEMENT_PX = 15;    // Max movement during grip (pixels)
  private readonly MIN_CARRY_DISTANCE_PX = 30;   // Must drag at least this far
  private readonly MAX_TOTAL_DURATION_MS = 10000; // Max total gesture time

  // Scoring thresholds
  private readonly GRIP_JITTER_THRESHOLD = 8;     // Max jitter during grip for "stable"
  private readonly CARRY_JITTER_THRESHOLD = 25;   // Max jitter during carry
  private readonly ROTATION_THRESHOLD_MAJOR = 20; // Degrees for major penalty
  private readonly ROTATION_THRESHOLD_MINOR = 10; // Degrees for minor penalty

  recognize(path: TouchPath): boolean {
    const { points, duration } = path;

    // Must have enough points
    if (points.length < 5) {
      return false;
    }

    // Check total duration
    if (duration > this.MAX_TOTAL_DURATION_MS) {
      return false;
    }

    // Must have a grip phase at the start
    const holdDetection = this.detectHold(path, 0, this.GRIP_DURATION_MS);
    if (!holdDetection.detected) {
      return false;
    }

    // Must have movement after grip (carrying)
    const postGripPoints = points.slice(holdDetection.endIndex);
    if (postGripPoints.length < 2) {
      return false;
    }

    // Calculate distance traveled during carry
    const carryDistance = this.calculateCarryDistance(postGripPoints);
    if (carryDistance < this.MIN_CARRY_DISTANCE_PX) {
      return false;
    }

    return true;
  }

  /**
   * Detect a hold phase (minimal movement for specified duration)
   */
  private detectHold(
    path: TouchPath,
    startIndex: number,
    minDuration: number
  ): HoldDetection {
    const points = path.points;
    if (points.length < 2) {
      return { detected: false, startIndex: 0, endIndex: 0, duration: 0, stable: false, jitter: 0 };
    }

    const startPoint = points[startIndex];
    let holdEndIndex = startIndex;
    let totalJitter = 0;
    let maxDisplacement = 0;

    // Find how long the user held steady
    for (let i = startIndex + 1; i < points.length; i++) {
      const point = points[i];
      const dx = point.x - startPoint.x;
      const dy = point.y - startPoint.y;
      const displacement = Math.sqrt(dx * dx + dy * dy);

      maxDisplacement = Math.max(maxDisplacement, displacement);

      // Calculate jitter (movement from previous point)
      if (i > startIndex + 1) {
        const prevPoint = points[i - 1];
        const jdx = point.x - prevPoint.x;
        const jdy = point.y - prevPoint.y;
        totalJitter += Math.sqrt(jdx * jdx + jdy * jdy);
      }

      // Check if movement exceeds threshold
      if (displacement > this.GRIP_MAX_MOVEMENT_PX) {
        break;
      }

      holdEndIndex = i;
    }

    const holdDuration = points[holdEndIndex].timestamp - startPoint.timestamp;
    const detected = holdDuration >= minDuration;
    const stable = totalJitter < this.GRIP_JITTER_THRESHOLD;

    return {
      detected,
      startIndex,
      endIndex: holdEndIndex,
      duration: holdDuration,
      stable,
      jitter: totalJitter,
    };
  }

  /**
   * Calculate total distance traveled during carry phase
   */
  private calculateCarryDistance(points: TouchPoint[]): number {
    if (points.length < 2) return 0;

    const first = points[0];
    const last = points[points.length - 1];
    const dx = last.x - first.x;
    const dy = last.y - first.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate jitter during carry phase
   */
  private calculateCarryJitter(points: TouchPoint[]): number {
    if (points.length < 3) return 0;

    // Calculate total path length vs direct distance
    let pathLength = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      pathLength += Math.sqrt(dx * dx + dy * dy);
    }

    const directDistance = this.calculateCarryDistance(points);
    if (directDistance < 1) return pathLength;

    // Jitter is excess path length beyond direct path
    return pathLength - directDistance;
  }

  /**
   * Calculate rotation from path (based on approach angle)
   */
  private calculatePlacementRotation(path: TouchPath): number {
    const points = path.points;
    if (points.length < 3) return 0;

    // Use last few points to determine approach angle
    const windowSize = Math.min(5, Math.floor(points.length / 3));
    const startIdx = points.length - windowSize - 1;
    const start = points[startIdx];
    const end = points[points.length - 1];

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    // Convert to degrees, with 0 being horizontal right
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }

  score(path: TouchPath, target: GestureTarget, plateRadius: number): GestureResult {
    // TweezeGesture expects a tweeze target
    if (target.type !== 'tweeze') {
      return {
        type: 'tweeze',
        success: false,
        techniqueScore: 0,
        penalties: [{ reason: 'Wrong target type for tweeze gesture', deduction: 100 }],
      };
    }

    const tweezeTarget = target as TweezeTarget;
    const penalties: { reason: string; deduction: number }[] = [];
    let techniqueScore = 100;

    // 1. Analyze grip quality
    const holdDetection = this.detectHold(path, 0, this.GRIP_DURATION_MS);
    if (!holdDetection.stable) {
      const penalty = 5;
      penalties.push({ reason: 'Fumbled pickup', deduction: penalty });
      techniqueScore -= penalty;
    }

    // 2. Analyze carry steadiness
    const carryPoints = path.points.slice(holdDetection.endIndex);
    const carryJitter = this.calculateCarryJitter(carryPoints);
    if (carryJitter > this.CARRY_JITTER_THRESHOLD) {
      const penalty = 5;
      penalties.push({ reason: 'Unsteady carry', deduction: penalty });
      techniqueScore -= penalty;
    }

    // 3. Analyze placement position
    const endPoint = path.points[path.points.length - 1];
    const targetX = tweezeTarget.position.x * plateRadius;
    const targetY = tweezeTarget.position.y * plateRadius;
    const dx = endPoint.x - targetX;
    const dy = endPoint.y - targetY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate zones in pixels
    const perfectRadius = tweezeTarget.zones.perfect * plateRadius;
    const greatRadius = tweezeTarget.zones.great * plateRadius;
    const goodRadius = tweezeTarget.zones.good * plateRadius;
    const acceptableRadius = tweezeTarget.zones.acceptable * plateRadius;

    if (distance <= perfectRadius) {
      // Perfect placement - no penalty
    } else if (distance <= greatRadius) {
      const penalty = 10;
      penalties.push({ reason: 'Slight position offset', deduction: penalty });
      techniqueScore -= penalty;
    } else if (distance <= goodRadius) {
      const penalty = 20;
      penalties.push({ reason: 'Position offset', deduction: penalty });
      techniqueScore -= penalty;
    } else if (distance <= acceptableRadius) {
      const penalty = 35;
      penalties.push({ reason: 'Significant position offset', deduction: penalty });
      techniqueScore -= penalty;
    } else {
      const penalty = 60;
      penalties.push({ reason: 'Missed target zone', deduction: penalty });
      techniqueScore -= penalty;
    }

    // 4. Analyze rotation accuracy (if target requires it)
    if (tweezeTarget.rotation !== undefined) {
      const placedRotation = this.calculatePlacementRotation(path);
      const rotationError = Math.abs(this.normalizeAngle(tweezeTarget.rotation - placedRotation));

      if (rotationError > this.ROTATION_THRESHOLD_MAJOR) {
        const penalty = 10;
        penalties.push({ reason: 'Wrong rotation', deduction: penalty });
        techniqueScore -= penalty;
      } else if (rotationError > this.ROTATION_THRESHOLD_MINOR) {
        const penalty = 5;
        penalties.push({ reason: 'Slight rotation error', deduction: penalty });
        techniqueScore -= penalty;
      }
    }

    // 5. Check for clean release (minimal jitter at end)
    const lastFew = path.points.slice(-3);
    if (lastFew.length >= 3) {
      let releaseJitter = 0;
      for (let i = 1; i < lastFew.length; i++) {
        const jdx = lastFew[i].x - lastFew[i - 1].x;
        const jdy = lastFew[i].y - lastFew[i - 1].y;
        releaseJitter += Math.sqrt(jdx * jdx + jdy * jdy);
      }
      if (releaseJitter > 15) {
        const penalty = 5;
        penalties.push({ reason: 'Unsteady release', deduction: penalty });
        techniqueScore -= penalty;
      }
    }

    // Clamp score
    techniqueScore = Math.max(0, Math.min(100, techniqueScore));

    return {
      type: 'tweeze',
      success: distance <= acceptableRadius,
      techniqueScore,
      penalties,
    };
  }

  /**
   * Normalize angle to -180 to 180 range
   */
  private normalizeAngle(angle: number): number {
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    return angle;
  }

  /**
   * Get the current phase of the tweeze gesture based on path progress
   */
  getPhase(path: TouchPath): TweezePhase {
    const { points, duration } = path;

    if (points.length < 2) return 'idle';

    // Check if in grip phase
    const holdDetection = this.detectHold(path, 0, this.GRIP_DURATION_MS);

    if (duration < this.GRIP_DURATION_MS) {
      return 'gripping';
    }

    if (holdDetection.detected) {
      const postGripPoints = points.slice(holdDetection.endIndex);
      if (postGripPoints.length > 1) {
        return 'carrying';
      }
      return 'gripping';
    }

    return 'gripping';
  }

  /**
   * Get grip progress (0 to 1) based on hold duration
   */
  getGripProgress(path: TouchPath): number {
    const { duration } = path;
    return Math.min(1, duration / this.GRIP_DURATION_MS);
  }

  /**
   * Check if grip is complete
   */
  isGripComplete(path: TouchPath): boolean {
    return this.getGripProgress(path) >= 1;
  }

  render(
    graphics: Graphics,
    _path: TouchPath,
    _progress: number,
    _color: number
  ): void {
    // Tweeze gesture rendering is handled by the Tweezers entity
    // which shows the actual tweezers animation
    graphics.clear();
  }

  /**
   * Render the final placement (no visible element, just position marker)
   */
  renderFinal(
    graphics: Graphics,
    _path: TouchPath,
    _color: number
  ): void {
    // Tweezed elements are rendered as IngredientEntity sprites
    // No additional rendering needed here
    graphics.clear();
  }
}
