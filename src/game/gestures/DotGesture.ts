import { Graphics } from 'pixi.js';
import { BaseGesture } from './BaseGesture';
import type { GestureResult, GestureTarget, TouchPath, PointTarget } from '@/types/gestures';

/**
 * Dot gesture: precise sauce drops via short taps.
 * Recognition: very short duration, minimal movement - essentially a tap.
 * Scoring: based on position precision and tap quality.
 */
export class DotGesture extends BaseGesture {
  readonly type = 'dot' as const;

  // Recognition thresholds
  private readonly MAX_DURATION_MS = 300;    // Very short tap
  private readonly MAX_MOVEMENT_PX = 20;     // Minimal movement allowed
  private readonly IDEAL_DURATION_MS = 100;  // Sweet spot for clean tap

  // Dot rendering properties
  private readonly DOT_BASE_SIZE = 8;        // Base dot radius in pixels
  private readonly DOT_SIZE_VARIATION = 0.3; // How much pressure affects size (30%)

  recognize(path: TouchPath): boolean {
    const { points, duration } = path;

    // Must have at least one point
    if (points.length < 1) {
      return false;
    }

    // Check duration - must be a quick tap
    if (duration > this.MAX_DURATION_MS) {
      return false;
    }

    // Check movement - should be minimal
    const totalMovement = this.calculatePathLength(path);
    if (totalMovement > this.MAX_MOVEMENT_PX) {
      return false;
    }

    return true;
  }

  score(path: TouchPath, target: GestureTarget, plateRadius: number): GestureResult {
    // DotGesture expects a PointTarget
    if (target.type !== 'point') {
      return {
        type: 'dot',
        success: false,
        techniqueScore: 0,
        penalties: [{ reason: 'Wrong target type for dot gesture', deduction: 100 }],
      };
    }

    const pointTarget = target as PointTarget;
    const points = path.points;

    // Use the first point (tap location) as the dot position
    const tapPoint = points[0];

    // Calculate position in plate-relative coordinates
    const targetX = pointTarget.position.x * plateRadius;
    const targetY = pointTarget.position.y * plateRadius;

    const dx = tapPoint.x - targetX;
    const dy = tapPoint.y - targetY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate zones in pixels
    const perfectRadius = pointTarget.zones.perfect * plateRadius;
    const greatRadius = pointTarget.zones.great * plateRadius;
    const goodRadius = pointTarget.zones.good * plateRadius;
    const acceptableRadius = pointTarget.zones.acceptable * plateRadius;

    // Start with base score
    let techniqueScore = 100;
    const penalties: { reason: string; deduction: number }[] = [];

    // Position-based scoring
    if (distance <= perfectRadius) {
      // Perfect placement - full score
      techniqueScore = 100;
    } else if (distance <= greatRadius) {
      const penalty = 10;
      penalties.push({ reason: 'Slight position offset', deduction: penalty });
      techniqueScore = 100 - penalty;
    } else if (distance <= goodRadius) {
      const penalty = 25;
      penalties.push({ reason: 'Position offset', deduction: penalty });
      techniqueScore = 100 - penalty;
    } else if (distance <= acceptableRadius) {
      const penalty = 40;
      penalties.push({ reason: 'Significant position offset', deduction: penalty });
      techniqueScore = 100 - penalty;
    } else {
      const penalty = 70;
      penalties.push({ reason: 'Missed target zone', deduction: penalty });
      techniqueScore = 100 - penalty;
    }

    // Technique penalties

    // Check for movement during tap (jitter)
    const movement = this.calculatePathLength(path);
    if (movement > 5) {
      const penalty = Math.min(5, Math.floor(movement / 4));
      penalties.push({ reason: 'Movement during tap', deduction: penalty });
      techniqueScore = Math.max(0, techniqueScore - penalty);
    }

    // Check for hesitation (too long duration)
    if (path.duration > this.IDEAL_DURATION_MS * 2) {
      const penalty = 10;
      penalties.push({ reason: 'Hesitant tap', deduction: penalty });
      techniqueScore = Math.max(0, techniqueScore - penalty);
    }

    return {
      type: 'dot',
      success: distance <= acceptableRadius,
      techniqueScore,
      penalties,
    };
  }

  /**
   * Calculate dot size based on pressure and tap characteristics
   */
  calculateDotSize(path: TouchPath): number {
    const points = path.points;
    if (points.length === 0) return this.DOT_BASE_SIZE;

    // Get average pressure if available
    const avgPressure = points.reduce((sum, p) => sum + (p.pressure ?? 0.5), 0) / points.length;

    // Scale dot size based on pressure (0.7 to 1.3 of base size)
    const pressureScale = 1 + (avgPressure - 0.5) * this.DOT_SIZE_VARIATION * 2;

    return this.DOT_BASE_SIZE * pressureScale;
  }

  render(
    graphics: Graphics,
    path: TouchPath,
    progress: number,
    color: number
  ): void {
    graphics.clear();

    const points = path.points;
    if (points.length === 0) return;

    const position = points[0];
    const baseSize = this.calculateDotSize(path);

    // Animate: slight spread on land (size * 1.1 over initial progress, then settle)
    let size: number;
    if (progress < 0.3) {
      // Spread phase (0 to 0.3) - grow to 1.1x
      const spreadProgress = progress / 0.3;
      size = baseSize * (1 + 0.1 * spreadProgress);
    } else {
      // Settle phase (0.3 to 1.0) - shrink back to 1.0x
      const settleProgress = (progress - 0.3) / 0.7;
      size = baseSize * (1.1 - 0.1 * settleProgress);
    }

    const alpha = 0.9;

    // Main dot body
    graphics.circle(position.x, position.y, size);
    graphics.fill({ color, alpha });

    // Soft edge (slightly larger, lower alpha for blur effect)
    graphics.circle(position.x, position.y, size * 1.15);
    graphics.fill({ color, alpha: alpha * 0.3 });

    // Specular highlight (small lighter dot offset toward top-left)
    const highlightOffset = size * 0.3;
    const highlightSize = size * 0.25;
    graphics.circle(
      position.x - highlightOffset,
      position.y - highlightOffset,
      highlightSize
    );
    graphics.fill({ color: 0xFFFFFF, alpha: 0.4 });
  }

  /**
   * Render a settled (final) dot
   */
  renderSettled(
    graphics: Graphics,
    x: number,
    y: number,
    color: number,
    size: number = this.DOT_BASE_SIZE
  ): void {
    const alpha = 0.9;

    // Main dot body
    graphics.circle(x, y, size);
    graphics.fill({ color, alpha });

    // Soft edge
    graphics.circle(x, y, size * 1.15);
    graphics.fill({ color, alpha: alpha * 0.3 });

    // Specular highlight
    const highlightOffset = size * 0.3;
    const highlightSize = size * 0.25;
    graphics.circle(
      x - highlightOffset,
      y - highlightOffset,
      highlightSize
    );
    graphics.fill({ color: 0xFFFFFF, alpha: 0.4 });
  }
}
