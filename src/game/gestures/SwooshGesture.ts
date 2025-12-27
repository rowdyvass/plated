import { Graphics } from 'pixi.js';
import { BaseGesture } from './BaseGesture';
import type { GestureResult, GestureTarget, TouchPath, PathTarget, TouchPoint } from '@/types/gestures';

/**
 * Swoosh gesture: signature sauce technique.
 * A smooth, curved stroke that creates an elegant sauce swoosh on the plate.
 *
 * Recognition criteria:
 * - Path length > 100px
 * - Generally curved (curvature ratio > 1.05)
 * - Smooth velocity (no sudden stops/starts)
 * - Duration 200ms - 1500ms
 *
 * Technique scoring penalties:
 * - Speed variation > 40%: -15 points
 * - Jerky corrections (direction reversals): -10 points each
 * - Too straight: -10 points
 * - Too slow: -5 points
 * - Path too short: -10 points
 */
export class SwooshGesture extends BaseGesture {
  readonly type = 'swoosh' as const;

  // Recognition thresholds
  private readonly MIN_PATH_LENGTH_PX = 80;
  private readonly MIN_DURATION_MS = 150;
  private readonly MAX_DURATION_MS = 2000;
  private readonly MIN_CURVATURE_RATIO = 1.03;
  private readonly MIN_POINTS = 5;

  // Scoring thresholds
  private readonly MAX_SPEED_VARIATION = 0.4;
  private readonly MAX_REVERSALS = 2;

  recognize(path: TouchPath): boolean {
    const { points, duration } = path;

    // Must have enough points to form a curve
    if (points.length < this.MIN_POINTS) {
      return false;
    }

    // Check duration
    if (duration < this.MIN_DURATION_MS || duration > this.MAX_DURATION_MS) {
      return false;
    }

    // Check path length
    const pathLength = this.calculatePathLength(path);
    if (pathLength < this.MIN_PATH_LENGTH_PX) {
      return false;
    }

    // Check for some curvature (not a perfectly straight line)
    const curvatureRatio = this.calculateCurvatureRatio(path);
    if (curvatureRatio < this.MIN_CURVATURE_RATIO) {
      // Might still be a swoosh if it's long enough
      if (pathLength < 150) {
        return false;
      }
    }

    return true;
  }

  score(path: TouchPath, target: GestureTarget, plateRadius: number): GestureResult {
    // SwooshGesture expects a PathTarget
    if (target.type !== 'path') {
      return {
        type: 'swoosh',
        success: false,
        techniqueScore: 0,
        penalties: [{ reason: 'Wrong target type for swoosh gesture', deduction: 100 }],
      };
    }

    const pathTarget = target as PathTarget;
    const penalties: { reason: string; deduction: number }[] = [];
    let techniqueScore = 100;

    // Smooth the path for analysis
    const smoothedPath = this.smoothPath(path, 5);

    // 1. Check path length
    const pathLength = this.calculatePathLength(smoothedPath);
    if (pathLength < this.MIN_PATH_LENGTH_PX) {
      const penalty = 10;
      penalties.push({ reason: 'Path too short', deduction: penalty });
      techniqueScore -= penalty;
    }

    // 2. Check speed variation
    const speedVariation = this.calculateSpeedVariation(smoothedPath);
    if (speedVariation > this.MAX_SPEED_VARIATION) {
      const penalty = Math.min(15, Math.round((speedVariation - this.MAX_SPEED_VARIATION) * 30));
      penalties.push({ reason: 'Inconsistent speed', deduction: penalty });
      techniqueScore -= penalty;
    }

    // 3. Check for direction reversals (jerky movements)
    const reversals = this.countDirectionReversals(smoothedPath);
    if (reversals > this.MAX_REVERSALS) {
      const penalty = Math.min(30, (reversals - this.MAX_REVERSALS) * 10);
      penalties.push({ reason: 'Jerky corrections', deduction: penalty });
      techniqueScore -= penalty;
    }

    // 4. Check curvature (not too straight)
    const curvatureRatio = this.calculateCurvatureRatio(smoothedPath);
    if (curvatureRatio < 1.05) {
      const penalty = 10;
      penalties.push({ reason: 'Too straight', deduction: penalty });
      techniqueScore -= penalty;
    }

    // 5. Check if path follows target path reasonably well
    const pathDeviation = this.calculatePathDeviation(smoothedPath, pathTarget, plateRadius);
    if (pathDeviation > pathTarget.width * 2) {
      const penalty = Math.min(20, Math.round((pathDeviation - pathTarget.width) * 40));
      penalties.push({ reason: 'Off target path', deduction: penalty });
      techniqueScore -= penalty;
    }

    // 6. Check velocity (not too slow)
    const avgSpeed = pathLength / path.duration;
    if (avgSpeed < 0.1) {  // pixels per ms
      const penalty = 5;
      penalties.push({ reason: 'Too slow', deduction: penalty });
      techniqueScore -= penalty;
    }

    // Clamp score
    techniqueScore = Math.max(0, Math.min(100, techniqueScore));

    return {
      type: 'swoosh',
      success: techniqueScore >= 50,
      techniqueScore,
      penalties,
    };
  }

  /**
   * Calculate how much the drawn path deviates from the target path
   */
  private calculatePathDeviation(
    path: TouchPath,
    target: PathTarget,
    plateRadius: number
  ): number {
    const points = path.points;
    if (points.length < 2 || target.path.length < 2) return 1;

    // Denormalize target path
    const targetPoints = target.path.map(p => ({
      x: p.x * plateRadius,
      y: p.y * plateRadius,
    }));

    // Sample the drawn path at regular intervals
    const samples = 10;
    let totalDeviation = 0;

    for (let i = 0; i < samples; i++) {
      const t = i / (samples - 1);
      const pointIndex = Math.floor(t * (points.length - 1));
      const point = points[pointIndex];

      // Find closest point on target path
      let minDist = Infinity;
      for (const targetPoint of targetPoints) {
        const dx = point.x - targetPoint.x;
        const dy = point.y - targetPoint.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        minDist = Math.min(minDist, dist);
      }

      totalDeviation += minDist / plateRadius;
    }

    return totalDeviation / samples;
  }

  render(
    graphics: Graphics,
    path: TouchPath,
    progress: number,
    color: number
  ): void {
    const points = path.points;
    if (points.length < 2) return;

    graphics.clear();

    // Smooth the path for rendering
    const smoothedPath = this.smoothPath(path, 3);
    const smoothedPoints = smoothedPath.points;

    // Determine how many points to draw based on progress
    const pointsToDraw = Math.max(2, Math.floor(smoothedPoints.length * progress));
    const drawPoints = smoothedPoints.slice(0, pointsToDraw);

    // Draw the sauce swoosh with thickness variation
    this.drawTaperedStroke(graphics, drawPoints, color, progress);
  }

  /**
   * Draw a stroke that tapers from thick at start to thin at end
   */
  private drawTaperedStroke(
    graphics: Graphics,
    points: TouchPoint[],
    color: number,
    progress: number
  ): void {
    if (points.length < 2) return;

    const startThickness = 10;
    const endThickness = 3;
    const alpha = 0.85;

    // Generate quads for the tapered stroke
    const quads: { x1: number; y1: number; x2: number; y2: number; x3: number; y3: number; x4: number; y4: number }[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      // Calculate progress along the path
      const t1 = i / (points.length - 1);
      const t2 = (i + 1) / (points.length - 1);

      // Calculate thickness at each point (linear interpolation)
      const thickness1 = startThickness + (endThickness - startThickness) * t1;
      const thickness2 = startThickness + (endThickness - startThickness) * t2;

      // Calculate perpendicular direction
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len < 0.01) continue;

      const nx = -dy / len;
      const ny = dx / len;

      // Calculate quad corners
      quads.push({
        x1: p1.x + nx * thickness1 / 2,
        y1: p1.y + ny * thickness1 / 2,
        x2: p1.x - nx * thickness1 / 2,
        y2: p1.y - ny * thickness1 / 2,
        x3: p2.x - nx * thickness2 / 2,
        y3: p2.y - ny * thickness2 / 2,
        x4: p2.x + nx * thickness2 / 2,
        y4: p2.y + ny * thickness2 / 2,
      });
    }

    // Draw each quad
    for (const quad of quads) {
      graphics.moveTo(quad.x1, quad.y1);
      graphics.lineTo(quad.x2, quad.y2);
      graphics.lineTo(quad.x3, quad.y3);
      graphics.lineTo(quad.x4, quad.y4);
      graphics.closePath();
      graphics.fill({ color, alpha });
    }

    // Add feathered edge effect (slightly lighter outer edge)
    if (progress >= 1) {
      const edgeAlpha = 0.3;
      for (const quad of quads) {
        graphics.moveTo(quad.x1, quad.y1);
        graphics.lineTo(quad.x4, quad.y4);
        graphics.stroke({ color, width: 1, alpha: edgeAlpha });
      }
    }

    // Add a rounded start cap
    if (points.length > 0) {
      const firstPoint = points[0];
      graphics.circle(firstPoint.x, firstPoint.y, startThickness / 2);
      graphics.fill({ color, alpha });
    }

    // Add a tapered end point
    if (points.length > 1 && progress >= 1) {
      const lastPoint = points[points.length - 1];
      graphics.circle(lastPoint.x, lastPoint.y, endThickness / 2);
      graphics.fill({ color, alpha });
    }
  }

  /**
   * Animate the sauce "settling" after gesture completion
   * Returns a progress value 0-1 over the settle duration
   */
  renderSettle(
    graphics: Graphics,
    path: TouchPath,
    settleProgress: number,
    color: number
  ): void {
    // During settle, slightly spread the sauce
    const spreadFactor = 1 + settleProgress * 0.05;

    const points = path.points.map(p => ({
      ...p,
      // Spread slightly outward from center
      x: p.x * spreadFactor,
      y: p.y * spreadFactor,
    }));

    const modifiedPath = { ...path, points };
    this.render(graphics, modifiedPath, 1, color);
  }
}
