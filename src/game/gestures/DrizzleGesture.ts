import { Graphics } from 'pixi.js';
import { BaseGesture } from './BaseGesture';
import type { GestureResult, GestureTarget, TouchPath, TouchPoint, PathPoint } from '@/types/gestures';

/**
 * Drizzle target: for continuous oil/reduction lines that follow a path
 */
export interface DrizzleTarget {
  type: 'drizzle';
  id: string;
  ingredientId: string;
  path: PathPoint[];       // Ideal path normalized -1 to 1
  pathWidth: number;       // How close to ideal path (as fraction of plate radius)
}

interface BreakDetection {
  breakIndices: number[];
  breakCount: number;
}

interface DrizzleAnalysis {
  isUnbroken: boolean;
  breakCount: number;
  breakIndices: number[];
  thicknessVariation: number;  // 0-1, how consistent the line thickness is
  speedVariation: number;      // 0-1, how consistent the speed is
  pathDeviation: number;       // Average deviation from target path
  pathCoverage: number;        // 0-1, how much of target path was covered
}

/**
 * Drizzle gesture: continuous thin lines of oil or reduction.
 * The key differentiator from swoosh: follows exact path, consistent thickness,
 * can have multiple direction changes, no taper.
 *
 * Recognition criteria:
 * - Continuous path (minimal/no breaks)
 * - Duration > 500ms typically
 * - Path length > 150px
 * - Relatively consistent speed
 *
 * Technique scoring penalties:
 * - Each break in line: -20
 * - Thickness variation > 30%: -10
 * - Speed too inconsistent: -10
 * - Path too short: -10
 * - Went outside target zone: -5 per excursion
 */
export class DrizzleGesture extends BaseGesture {
  readonly type = 'drizzle' as const;

  // Recognition thresholds
  private readonly MIN_PATH_LENGTH_PX = 120;
  private readonly MIN_DURATION_MS = 400;
  private readonly MAX_DURATION_MS = 8000;
  private readonly MIN_POINTS = 10;

  // Break detection thresholds
  private readonly MAX_TIME_GAP_MS = 100;        // Time gap that indicates a break
  private readonly MAX_SPEED_PX_PER_MS = 2.5;    // Physically impossible speed (indicates break)

  // Scoring thresholds
  private readonly MAX_SPEED_VARIATION = 0.5;
  private readonly MAX_THICKNESS_VARIATION = 0.3;
  private readonly BREAK_PENALTY = 20;
  private readonly EXCURSION_PENALTY = 5;

  // Rendering properties
  private readonly DRIZZLE_THICKNESS = 2.5;      // Consistent thin line

  recognize(path: TouchPath): boolean {
    const { points, duration } = path;

    // Must have enough points
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

    // Drizzle is recognized by continuous, relatively consistent movement
    // Unlike swoosh which is quick and curved, drizzle is slower and follows a path
    const avgSpeed = pathLength / duration; // px/ms

    // Drizzle should be slower than swoosh (0.1 - 0.8 px/ms range)
    if (avgSpeed > 1.0) {
      return false; // Too fast, probably a swoosh
    }

    return true;
  }

  /**
   * Detect breaks in the path where the user lifted their finger
   */
  private detectBreaks(path: TouchPath): BreakDetection {
    const points = path.points;
    const breakIndices: number[] = [];

    for (let i = 1; i < points.length; i++) {
      const timeDelta = points[i].timestamp - points[i - 1].timestamp;

      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Break if: large time gap or physically impossible movement
      if (timeDelta > this.MAX_TIME_GAP_MS) {
        breakIndices.push(i);
      } else if (timeDelta > 0 && distance / timeDelta > this.MAX_SPEED_PX_PER_MS) {
        breakIndices.push(i);
      }
    }

    return {
      breakIndices,
      breakCount: breakIndices.length,
    };
  }

  /**
   * Calculate thickness variation along the path
   * For drizzle, we want consistent thickness (low variation)
   */
  private calculateThicknessVariation(path: TouchPath): number {
    const points = path.points;
    if (points.length < 3) return 0;

    // Use pressure if available, otherwise estimate from speed
    const thicknesses: number[] = [];

    for (let i = 1; i < points.length; i++) {
      if (points[i].pressure !== undefined) {
        thicknesses.push(points[i].pressure);
      } else {
        // Estimate from speed - slower = thicker
        const dx = points[i].x - points[i - 1].x;
        const dy = points[i].y - points[i - 1].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const dt = points[i].timestamp - points[i - 1].timestamp;
        const speed = dt > 0 ? dist / dt : 0;
        // Normalize speed to thickness (inverse relationship)
        thicknesses.push(1 / (1 + speed));
      }
    }

    if (thicknesses.length < 2) return 0;

    // Calculate coefficient of variation
    const mean = thicknesses.reduce((a, b) => a + b, 0) / thicknesses.length;
    const variance = thicknesses.reduce((acc, t) => acc + Math.pow(t - mean, 2), 0) / thicknesses.length;
    const stdDev = Math.sqrt(variance);

    return mean > 0 ? stdDev / mean : 0;
  }

  /**
   * Calculate how much the drawn path deviates from the target path
   */
  private calculatePathDeviation(
    path: TouchPath,
    targetPath: PathPoint[],
    plateRadius: number
  ): number {
    const points = path.points;
    if (points.length < 2 || targetPath.length < 2) return 1;

    // Denormalize target path
    const targetPoints = targetPath.map(p => ({
      x: p.x * plateRadius,
      y: p.y * plateRadius,
    }));

    // Sample the drawn path at regular intervals
    const samples = Math.min(20, points.length);
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

  /**
   * Calculate how much of the target path was covered
   */
  private calculatePathCoverage(
    path: TouchPath,
    targetPath: PathPoint[],
    plateRadius: number,
    pathWidth: number
  ): number {
    if (targetPath.length < 2) return 0;

    // Denormalize target path
    const targetPoints = targetPath.map(p => ({
      x: p.x * plateRadius,
      y: p.y * plateRadius,
    }));

    // Check how many target points are "covered" by drawn path
    const coverageRadius = pathWidth * plateRadius;
    let coveredCount = 0;

    for (const targetPoint of targetPoints) {
      let isCovered = false;
      for (const drawnPoint of path.points) {
        const dx = drawnPoint.x - targetPoint.x;
        const dy = drawnPoint.y - targetPoint.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= coverageRadius) {
          isCovered = true;
          break;
        }
      }
      if (isCovered) coveredCount++;
    }

    return coveredCount / targetPoints.length;
  }

  /**
   * Analyze the drizzle gesture
   */
  private analyzeGesture(
    path: TouchPath,
    targetPath?: PathPoint[],
    plateRadius?: number,
    pathWidth?: number
  ): DrizzleAnalysis {
    const breakResult = this.detectBreaks(path);
    const thicknessVariation = this.calculateThicknessVariation(path);
    const speedVariation = this.calculateSpeedVariation(path);

    let pathDeviation = 0;
    let pathCoverage = 1;

    if (targetPath && plateRadius && pathWidth) {
      pathDeviation = this.calculatePathDeviation(path, targetPath, plateRadius);
      pathCoverage = this.calculatePathCoverage(path, targetPath, plateRadius, pathWidth);
    }

    return {
      isUnbroken: breakResult.breakCount === 0,
      breakCount: breakResult.breakCount,
      breakIndices: breakResult.breakIndices,
      thicknessVariation,
      speedVariation,
      pathDeviation,
      pathCoverage,
    };
  }

  score(path: TouchPath, target: GestureTarget, plateRadius: number): GestureResult {
    // DrizzleGesture expects a drizzle target
    if (target.type !== 'drizzle') {
      return {
        type: 'drizzle',
        success: false,
        techniqueScore: 0,
        penalties: [{ reason: 'Wrong target type for drizzle gesture', deduction: 100 }],
      };
    }

    const drizzleTarget = target as DrizzleTarget;
    const penalties: { reason: string; deduction: number }[] = [];
    let techniqueScore = 100;

    // Analyze the gesture
    const analysis = this.analyzeGesture(
      path,
      drizzleTarget.path,
      plateRadius,
      drizzleTarget.pathWidth
    );

    // 1. Check for breaks - major penalty
    if (!analysis.isUnbroken) {
      const penalty = Math.min(60, analysis.breakCount * this.BREAK_PENALTY);
      penalties.push({
        reason: analysis.breakCount === 1
          ? 'Line broken once'
          : `Line broken ${analysis.breakCount} times`,
        deduction: penalty
      });
      techniqueScore -= penalty;
    }

    // 2. Check thickness variation
    if (analysis.thicknessVariation > this.MAX_THICKNESS_VARIATION) {
      const penalty = 10;
      penalties.push({ reason: 'Inconsistent line thickness', deduction: penalty });
      techniqueScore -= penalty;
    }

    // 3. Check speed consistency
    if (analysis.speedVariation > this.MAX_SPEED_VARIATION) {
      const penalty = 10;
      penalties.push({ reason: 'Inconsistent speed', deduction: penalty });
      techniqueScore -= penalty;
    }

    // 4. Check path length
    const pathLength = this.calculatePathLength(path);
    if (pathLength < this.MIN_PATH_LENGTH_PX) {
      const penalty = 10;
      penalties.push({ reason: 'Drizzle too short', deduction: penalty });
      techniqueScore -= penalty;
    }

    // 5. Check path deviation (how well they followed the target)
    if (analysis.pathDeviation > drizzleTarget.pathWidth * 1.5) {
      const excessDeviation = analysis.pathDeviation - drizzleTarget.pathWidth;
      const excursions = Math.floor(excessDeviation / drizzleTarget.pathWidth);
      const penalty = Math.min(25, excursions * this.EXCURSION_PENALTY);
      penalties.push({ reason: 'Strayed from target path', deduction: penalty });
      techniqueScore -= penalty;
    }

    // 6. Check path coverage (did they cover enough of the target?)
    if (analysis.pathCoverage < 0.7) {
      const penalty = Math.round((1 - analysis.pathCoverage) * 20);
      penalties.push({ reason: 'Incomplete drizzle path', deduction: penalty });
      techniqueScore -= penalty;
    }

    // Clamp score
    techniqueScore = Math.max(0, Math.min(100, techniqueScore));

    return {
      type: 'drizzle',
      success: techniqueScore >= 50,
      techniqueScore,
      penalties,
    };
  }

  /**
   * Check if an index is a break point
   */
  isBreak(path: TouchPath, index: number): boolean {
    const breakResult = this.detectBreaks(path);
    return breakResult.breakIndices.includes(index);
  }

  /**
   * Get break indices for rendering
   */
  getBreakIndices(path: TouchPath): number[] {
    return this.detectBreaks(path).breakIndices;
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

    // Determine how many points to draw based on progress
    const pointsToDraw = Math.max(2, Math.floor(points.length * progress));
    const drawPoints = points.slice(0, pointsToDraw);

    // Get break points
    const breakIndices = this.getBreakIndices(path);

    // Draw the drizzle line - follows exact path, consistent thickness
    this.drawDrizzleLine(graphics, drawPoints, color, breakIndices, progress);
  }

  /**
   * Draw a drizzle line that follows the exact path with consistent thickness
   */
  private drawDrizzleLine(
    graphics: Graphics,
    points: TouchPoint[],
    color: number,
    breakIndices: number[],
    progress: number
  ): void {
    if (points.length < 2) return;

    const thickness = this.DRIZZLE_THICKNESS;
    const alpha = 0.85;

    // Start first segment
    let segmentStart = 0;

    for (let segmentEnd = 0; segmentEnd <= points.length; segmentEnd++) {
      const isBreak = breakIndices.includes(segmentEnd) || segmentEnd === points.length;

      if (isBreak && segmentEnd > segmentStart) {
        // Draw this segment
        const segmentPoints = points.slice(segmentStart, segmentEnd);
        this.drawDrizzleSegment(graphics, segmentPoints, color, thickness, alpha);
        segmentStart = segmentEnd;
      }
    }

    // Add shine effect along the line (subtle highlight)
    if (progress >= 1 && points.length >= 2) {
      this.drawShineEffect(graphics, points, breakIndices);
    }
  }

  /**
   * Draw a single segment of the drizzle
   */
  private drawDrizzleSegment(
    graphics: Graphics,
    points: TouchPoint[],
    color: number,
    thickness: number,
    alpha: number
  ): void {
    if (points.length < 2) return;

    // Draw with consistent thickness (no taper like swoosh)
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len < 0.01) continue;

      const nx = -dy / len;
      const ny = dx / len;

      // Draw segment as quad
      graphics.moveTo(p1.x + nx * thickness / 2, p1.y + ny * thickness / 2);
      graphics.lineTo(p1.x - nx * thickness / 2, p1.y - ny * thickness / 2);
      graphics.lineTo(p2.x - nx * thickness / 2, p2.y - ny * thickness / 2);
      graphics.lineTo(p2.x + nx * thickness / 2, p2.y + ny * thickness / 2);
      graphics.closePath();
      graphics.fill({ color, alpha });
    }

    // Add rounded caps at start and end
    if (points.length > 0) {
      graphics.circle(points[0].x, points[0].y, thickness / 2);
      graphics.fill({ color, alpha });

      graphics.circle(points[points.length - 1].x, points[points.length - 1].y, thickness / 2);
      graphics.fill({ color, alpha });
    }
  }

  /**
   * Draw a subtle shine effect along the drizzle
   */
  private drawShineEffect(
    graphics: Graphics,
    points: TouchPoint[],
    breakIndices: number[]
  ): void {
    const shineAlpha = 0.25;
    const shineOffset = 0.8; // Offset from center line

    // Draw shine segments (avoiding breaks)
    let segmentStart = 0;

    for (let i = 0; i <= points.length; i++) {
      const isBreak = breakIndices.includes(i) || i === points.length;

      if (isBreak && i > segmentStart + 2) {
        const segmentPoints = points.slice(segmentStart, i);

        // Draw thin highlight line offset from center
        for (let j = 0; j < segmentPoints.length - 1; j++) {
          const p1 = segmentPoints[j];
          const p2 = segmentPoints[j + 1];

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.sqrt(dx * dx + dy * dy);

          if (len < 0.01) continue;

          const nx = -dy / len;
          const ny = dx / len;

          graphics.moveTo(p1.x + nx * shineOffset, p1.y + ny * shineOffset);
          graphics.lineTo(p2.x + nx * shineOffset, p2.y + ny * shineOffset);
          graphics.stroke({ color: 0xFFFFFF, width: 0.5, alpha: shineAlpha });
        }

        segmentStart = i;
      }
    }
  }

  /**
   * Render the final settled drizzle
   */
  renderFinal(
    graphics: Graphics,
    path: TouchPath,
    color: number
  ): void {
    graphics.clear();

    const points = path.points;
    if (points.length < 2) return;

    const breakIndices = this.getBreakIndices(path);

    // Draw with slightly increased thickness for settled look
    const thickness = this.DRIZZLE_THICKNESS * 1.1;
    const alpha = 0.9;

    let segmentStart = 0;

    for (let segmentEnd = 0; segmentEnd <= points.length; segmentEnd++) {
      const isBreak = breakIndices.includes(segmentEnd) || segmentEnd === points.length;

      if (isBreak && segmentEnd > segmentStart) {
        const segmentPoints = points.slice(segmentStart, segmentEnd);
        this.drawDrizzleSegment(graphics, segmentPoints, color, thickness, alpha);
        segmentStart = segmentEnd;
      }
    }

    // Add shine
    this.drawShineEffect(graphics, points, breakIndices);
  }
}
