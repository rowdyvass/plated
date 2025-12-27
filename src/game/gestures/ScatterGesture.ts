import { Graphics } from 'pixi.js';
import { BaseGesture } from './BaseGesture';
import type { GestureResult, GestureTarget, TouchPath } from '@/types/gestures';

/**
 * Scatter gesture: controlled randomness for herbs and small elements.
 * Recognition: quick flick motion from a central point with outward velocity.
 * Scoring: based on distribution coverage and containment within target zone.
 */
export class ScatterGesture extends BaseGesture {
  readonly type = 'scatter' as const;

  // Recognition thresholds (lowered for mouse compatibility)
  private readonly MIN_DURATION_MS = 50;      // Minimum duration for a valid flick
  private readonly MAX_DURATION_MS = 800;     // Maximum duration (longer for mouse)
  private readonly MIN_VELOCITY = 150;        // Minimum velocity at release (px/s) - lowered for mouse
  private readonly MIN_DISTANCE = 20;         // Minimum flick distance in pixels

  recognize(path: TouchPath): boolean {
    const { points, duration } = path;

    // Must have enough points to calculate velocity
    if (points.length < 3) {
      return false;
    }

    // Check duration range
    if (duration < this.MIN_DURATION_MS || duration > this.MAX_DURATION_MS) {
      return false;
    }

    // Check minimum flick distance
    const directDistance = this.calculateDirectDistance(path);
    if (directDistance < this.MIN_DISTANCE) {
      return false;
    }

    // Calculate velocity at release (use last few points)
    const releaseVelocity = this.calculateReleaseVelocity(path);
    if (releaseVelocity < this.MIN_VELOCITY) {
      return false;
    }

    return true;
  }

  /**
   * Calculate velocity at the end of the gesture (release velocity)
   */
  private calculateReleaseVelocity(path: TouchPath): number {
    const points = path.points;
    if (points.length < 2) return 0;

    // Use last 3-5 points to calculate release velocity
    const windowSize = Math.min(5, points.length - 1);
    const startIdx = points.length - 1 - windowSize;
    const endIdx = points.length - 1;

    const start = points[startIdx];
    const end = points[endIdx];

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const time = (end.timestamp - start.timestamp) / 1000; // Convert to seconds

    if (time <= 0) return 0;
    return distance / time;
  }

  /**
   * Get the flick direction (normalized vector)
   */
  getFlickDirection(path: TouchPath): { x: number; y: number } {
    const points = path.points;
    if (points.length < 2) return { x: 0, y: -1 };

    const start = points[0];
    const end = points[points.length - 1];

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const magnitude = Math.sqrt(dx * dx + dy * dy);

    if (magnitude < 1) return { x: 0, y: -1 };

    return {
      x: dx / magnitude,
      y: dy / magnitude,
    };
  }

  /**
   * Get the release position (where scatter originates)
   */
  getReleasePosition(path: TouchPath): { x: number; y: number } {
    const points = path.points;
    if (points.length === 0) return { x: 0, y: 0 };

    const lastPoint = points[points.length - 1];
    return { x: lastPoint.x, y: lastPoint.y };
  }

  /**
   * Get flick force (0-1 based on velocity)
   */
  getFlickForce(path: TouchPath): number {
    const velocity = this.calculateReleaseVelocity(path);
    // Map velocity to 0-1 range (150-800 px/s -> 0.4-1.0) - adjusted for mouse
    const normalizedForce = Math.min(1, Math.max(0.4, (velocity - 100) / 700));
    return normalizedForce;
  }

  score(path: TouchPath, target: GestureTarget, _plateRadius: number): GestureResult {
    // ScatterGesture expects a zone target
    if (target.type !== 'zone') {
      return {
        type: 'scatter',
        success: false,
        techniqueScore: 0,
        penalties: [{ reason: 'Wrong target type for scatter gesture', deduction: 100 }],
      };
    }

    // For scatter, we score the gesture itself - particle distribution is scored separately
    let techniqueScore = 100;
    const penalties: { reason: string; deduction: number }[] = [];

    // Check velocity (too slow = weak scatter) - only penalize very slow flicks
    const velocity = this.calculateReleaseVelocity(path);
    if (velocity < this.MIN_VELOCITY * 0.8) {
      const penalty = 15;
      penalties.push({ reason: 'Slow flick - weak scatter', deduction: penalty });
      techniqueScore = Math.max(0, techniqueScore - penalty);
    }

    // Check for jerky movement
    const reversals = this.countDirectionReversals(path);
    if (reversals > 2) {
      const penalty = Math.min(15, reversals * 5);
      penalties.push({ reason: 'Unsteady flick motion', deduction: penalty });
      techniqueScore = Math.max(0, techniqueScore - penalty);
    }

    return {
      type: 'scatter',
      success: true,
      techniqueScore,
      penalties,
    };
  }

  render(
    graphics: Graphics,
    path: TouchPath,
    progress: number,
    color: number
  ): void {
    graphics.clear();

    const points = path.points;
    if (points.length < 2) return;

    // Draw the flick trail
    const alpha = 0.6 * (1 - progress * 0.5);

    // Draw a tapered line from start to end
    graphics.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      const t = i / (points.length - 1);
      const width = 3 * (1 - t * 0.7); // Taper toward end

      graphics.lineTo(points[i].x, points[i].y);
      graphics.stroke({ color, width, alpha });
    }

    // Draw burst indicator at release point
    if (progress > 0) {
      const releasePos = this.getReleasePosition(path);
      const direction = this.getFlickDirection(path);
      const force = this.getFlickForce(path);

      // Draw burst rays
      const rayCount = 5;
      const spreadAngle = Math.PI / 4; // 45 degree spread
      const baseAngle = Math.atan2(direction.y, direction.x);

      for (let i = 0; i < rayCount; i++) {
        const angleOffset = (i / (rayCount - 1) - 0.5) * spreadAngle;
        const angle = baseAngle + angleOffset;
        const rayLength = 20 * force * (1 + progress * 0.5);

        const endX = releasePos.x + Math.cos(angle) * rayLength;
        const endY = releasePos.y + Math.sin(angle) * rayLength;

        graphics.moveTo(releasePos.x, releasePos.y);
        graphics.lineTo(endX, endY);
        graphics.stroke({ color, width: 2, alpha: alpha * 0.5 });
      }
    }
  }
}
