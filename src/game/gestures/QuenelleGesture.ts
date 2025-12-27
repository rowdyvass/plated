import { Graphics } from 'pixi.js';
import { BaseGesture } from './BaseGesture';
import type { GestureResult, GestureTarget, TouchPath, TouchPoint } from '@/types/gestures';

interface PauseDetection {
  found: boolean;
  startIndex: number;
  endIndex: number;
  position: { x: number; y: number } | null;
  duration: number;
}

interface QuenelleAnalysis {
  hasArc: boolean;
  hasPause: boolean;
  pauseDuration: number;
  pausePosition: { x: number; y: number } | null;
  arcQuality: number; // 0-1, how smooth the arc is
  releaseClean: boolean; // Didn't drag significantly after pause
  pauseInLatterHalf: boolean;
}

/**
 * Quenelle gesture: the most technically demanding gesture.
 * Mimics the real quenelle technique of scooping with an arc motion,
 * pausing to let the shape form, then releasing.
 *
 * Recognition criteria:
 * - Path length > 80px
 * - Path has curved section (arc)
 * - Pause detected: velocity < 10px/s for > 150ms
 * - Pause occurs in latter half of gesture
 *
 * Technique scoring penalties:
 * - No pause detected: -15
 * - Pause too short (< 200ms): -10
 * - Arc too straight: -10
 * - Jerky/inconsistent arc: -10
 * - Continued movement after pause: -10
 * - Poor arc quality: -10
 */
export class QuenelleGesture extends BaseGesture {
  readonly type = 'quenelle' as const;

  // Recognition thresholds
  private readonly MIN_PATH_LENGTH_PX = 80;
  private readonly MIN_DURATION_MS = 300;
  private readonly MAX_DURATION_MS = 4000;
  private readonly MIN_POINTS = 8;
  private readonly MIN_CURVATURE_RATIO = 1.05;

  // Pause detection thresholds
  private readonly PAUSE_VELOCITY_THRESHOLD = 15; // px/s - velocity below which is considered "paused"
  private readonly MINIMUM_PAUSE_DURATION = 150; // ms - minimum pause to be recognized
  private readonly IDEAL_PAUSE_DURATION = 250; // ms - ideal pause duration

  // Scoring thresholds
  private readonly MAX_POST_PAUSE_MOVEMENT = 20; // px - max movement allowed after pause

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

    // Analyze the gesture
    const analysis = this.analyzeGesture(path);

    // Must have arc shape
    if (!analysis.hasArc) {
      return false;
    }

    // Must have pause in latter half
    if (!analysis.hasPause || !analysis.pauseInLatterHalf) {
      return false;
    }

    // Pause must be long enough
    if (analysis.pauseDuration < this.MINIMUM_PAUSE_DURATION) {
      return false;
    }

    return true;
  }

  /**
   * Analyze the gesture to extract quenelle-specific metrics
   */
  private analyzeGesture(path: TouchPath): QuenelleAnalysis {
    const pauseResult = this.detectPause(path);
    const curvatureRatio = this.calculateCurvatureRatio(path);
    const hasArc = curvatureRatio >= this.MIN_CURVATURE_RATIO;

    // Check if pause is in latter half of gesture
    const pauseInLatterHalf = pauseResult.found &&
      pauseResult.startIndex > path.points.length * 0.3;

    // Calculate arc quality (smoothness)
    const smoothedPath = this.smoothPath(path, 5);
    const reversals = this.countDirectionReversals(smoothedPath);
    const arcQuality = Math.max(0, 1 - reversals * 0.15);

    // Check for clean release (minimal movement after pause)
    let releaseClean = true;
    if (pauseResult.found && pauseResult.endIndex < path.points.length - 1) {
      const postPausePoints = path.points.slice(pauseResult.endIndex);
      let postPauseDistance = 0;
      for (let i = 1; i < postPausePoints.length; i++) {
        const dx = postPausePoints[i].x - postPausePoints[i - 1].x;
        const dy = postPausePoints[i].y - postPausePoints[i - 1].y;
        postPauseDistance += Math.sqrt(dx * dx + dy * dy);
      }
      releaseClean = postPauseDistance < this.MAX_POST_PAUSE_MOVEMENT;
    }

    return {
      hasArc,
      hasPause: pauseResult.found,
      pauseDuration: pauseResult.duration,
      pausePosition: pauseResult.position,
      arcQuality,
      releaseClean,
      pauseInLatterHalf,
    };
  }

  /**
   * Detect pause in the gesture path
   * A pause is defined as velocity dropping below threshold for a minimum duration
   */
  private detectPause(path: TouchPath): PauseDetection {
    const points = path.points;
    if (points.length < 3) {
      return { found: false, startIndex: -1, endIndex: -1, position: null, duration: 0 };
    }

    // Calculate velocities between consecutive points
    const velocities = this.calculateVelocities(points);

    let pauseStartIndex = -1;
    let pauseEndIndex = -1;
    let bestPauseDuration = 0;
    let bestPauseStart = -1;
    let bestPauseEnd = -1;

    for (let i = 0; i < velocities.length; i++) {
      if (velocities[i] < this.PAUSE_VELOCITY_THRESHOLD) {
        // Start or continue pause
        if (pauseStartIndex === -1) {
          pauseStartIndex = i;
        }
        pauseEndIndex = i;
      } else if (pauseStartIndex !== -1) {
        // End of pause - check if it was long enough
        const duration = points[pauseEndIndex + 1].timestamp - points[pauseStartIndex].timestamp;
        if (duration >= this.MINIMUM_PAUSE_DURATION && duration > bestPauseDuration) {
          bestPauseDuration = duration;
          bestPauseStart = pauseStartIndex;
          bestPauseEnd = pauseEndIndex;
        }
        pauseStartIndex = -1;
        pauseEndIndex = -1;
      }
    }

    // Check final pause segment
    if (pauseStartIndex !== -1) {
      const endIdx = Math.min(pauseEndIndex + 1, points.length - 1);
      const duration = points[endIdx].timestamp - points[pauseStartIndex].timestamp;
      if (duration >= this.MINIMUM_PAUSE_DURATION && duration > bestPauseDuration) {
        bestPauseDuration = duration;
        bestPauseStart = pauseStartIndex;
        bestPauseEnd = pauseEndIndex;
      }
    }

    if (bestPauseStart !== -1) {
      const midIndex = Math.floor((bestPauseStart + bestPauseEnd) / 2);
      return {
        found: true,
        startIndex: bestPauseStart,
        endIndex: bestPauseEnd,
        position: {
          x: points[midIndex].x,
          y: points[midIndex].y,
        },
        duration: bestPauseDuration,
      };
    }

    return { found: false, startIndex: -1, endIndex: -1, position: null, duration: 0 };
  }

  /**
   * Calculate velocities between consecutive points (in px/s)
   */
  private calculateVelocities(points: TouchPoint[]): number[] {
    const velocities: number[] = [];

    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const dt = (points[i].timestamp - points[i - 1].timestamp) / 1000; // Convert to seconds

      if (dt > 0) {
        velocities.push(distance / dt);
      } else {
        velocities.push(0);
      }
    }

    return velocities;
  }

  /**
   * Get the pause position for use by renderers
   */
  getPausePosition(path: TouchPath): { x: number; y: number } | null {
    const pauseResult = this.detectPause(path);
    return pauseResult.position;
  }

  /**
   * Get the arc end position (where quenelle should be placed)
   */
  getPlacementPosition(path: TouchPath): { x: number; y: number } {
    const pauseResult = this.detectPause(path);
    if (pauseResult.found && pauseResult.position) {
      return pauseResult.position;
    }
    // Fall back to end of path
    const lastPoint = path.points[path.points.length - 1];
    return { x: lastPoint.x, y: lastPoint.y };
  }

  /**
   * Get the rotation angle of the quenelle based on arc direction
   */
  getRotation(path: TouchPath): number {
    const points = path.points;
    if (points.length < 2) return 0;

    // Use the direction at the pause point or end of arc
    const pauseResult = this.detectPause(path);
    const endIndex = pauseResult.found ? pauseResult.startIndex : points.length - 1;
    const startIndex = Math.max(0, endIndex - 5);

    const dx = points[endIndex].x - points[startIndex].x;
    const dy = points[endIndex].y - points[startIndex].y;

    return Math.atan2(dy, dx);
  }

  score(path: TouchPath, target: GestureTarget, plateRadius: number): GestureResult {
    // QuenelleGesture expects a quenelle target type
    if (target.type !== 'quenelle') {
      return {
        type: 'quenelle',
        success: false,
        techniqueScore: 0,
        penalties: [{ reason: 'Wrong target type for quenelle gesture', deduction: 100 }],
      };
    }

    const penalties: { reason: string; deduction: number }[] = [];
    let techniqueScore = 100;

    // Smooth path for analysis
    const smoothedPath = this.smoothPath(path, 5);

    // Analyze the gesture
    const analysis = this.analyzeGesture(smoothedPath);

    // 1. Check for pause
    if (!analysis.hasPause) {
      const penalty = 15;
      penalties.push({ reason: 'No pause detected', deduction: penalty });
      techniqueScore -= penalty;
    } else if (analysis.pauseDuration < this.IDEAL_PAUSE_DURATION) {
      const penalty = 10;
      penalties.push({ reason: 'Pause too short', deduction: penalty });
      techniqueScore -= penalty;
    }

    // 2. Check arc quality
    if (!analysis.hasArc) {
      const penalty = 10;
      penalties.push({ reason: 'Arc too straight', deduction: penalty });
      techniqueScore -= penalty;
    }

    // 3. Check smoothness
    if (analysis.arcQuality < 0.7) {
      const penalty = Math.round((1 - analysis.arcQuality) * 15);
      penalties.push({ reason: 'Jerky arc motion', deduction: penalty });
      techniqueScore -= penalty;
    }

    // 4. Check clean release
    if (!analysis.releaseClean) {
      const penalty = 10;
      penalties.push({ reason: 'Movement after pause', deduction: penalty });
      techniqueScore -= penalty;
    }

    // 5. Check position accuracy
    const placement = this.getPlacementPosition(smoothedPath);
    const quenelleTarget = target as QuenelleTarget;
    const targetPos = {
      x: quenelleTarget.position.x * plateRadius,
      y: quenelleTarget.position.y * plateRadius,
    };

    const dx = placement.x - targetPos.x;
    const dy = placement.y - targetPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy) / plateRadius;

    // Check which zone the placement falls into
    const zones = quenelleTarget.zones;
    if (distance > zones.acceptable) {
      const penalty = 20;
      penalties.push({ reason: 'Placement too far from target', deduction: penalty });
      techniqueScore -= penalty;
    } else if (distance > zones.good) {
      const penalty = 10;
      penalties.push({ reason: 'Placement accuracy could improve', deduction: penalty });
      techniqueScore -= penalty;
    }

    // Clamp score
    techniqueScore = Math.max(0, Math.min(100, techniqueScore));

    return {
      type: 'quenelle',
      success: techniqueScore >= 50,
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

    // Smooth the path
    const smoothedPath = this.smoothPath(path, 3);
    const smoothedPoints = smoothedPath.points;

    // Determine how many points to draw based on progress
    const pointsToDraw = Math.max(2, Math.floor(smoothedPoints.length * progress));
    const drawPoints = smoothedPoints.slice(0, pointsToDraw);

    const alpha = 0.75;

    // Detect pause to show forming quenelle
    const pauseResult = this.detectPause(path);
    const isPausing = pauseResult.found && progress > (pauseResult.startIndex / points.length);

    // Draw the arc path with variable thickness
    this.drawArcPath(graphics, drawPoints, color, alpha, isPausing);

    // If we've reached the pause point, draw the forming quenelle
    if (isPausing && pauseResult.position) {
      this.drawFormingQuenelle(
        graphics,
        pauseResult.position,
        this.getRotation(path),
        color,
        Math.min(1, (progress - pauseResult.startIndex / points.length) * 3)
      );
    }
  }

  /**
   * Draw the arc path with variable thickness showing scooping motion
   */
  private drawArcPath(
    graphics: Graphics,
    points: TouchPoint[],
    color: number,
    alpha: number,
    isPausing: boolean
  ): void {
    if (points.length < 2) return;

    // Draw with thickness that tapers
    const startThickness = 6;
    const endThickness = isPausing ? 8 : 4;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const t = i / (points.length - 1);
      const thickness = startThickness + (endThickness - startThickness) * t;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len < 0.01) continue;

      const nx = -dy / len;
      const ny = dx / len;

      // Draw segment
      graphics.moveTo(p1.x + nx * thickness / 2, p1.y + ny * thickness / 2);
      graphics.lineTo(p1.x - nx * thickness / 2, p1.y - ny * thickness / 2);
      graphics.lineTo(p2.x - nx * thickness / 2, p2.y - ny * thickness / 2);
      graphics.lineTo(p2.x + nx * thickness / 2, p2.y + ny * thickness / 2);
      graphics.closePath();
      graphics.fill({ color, alpha: alpha * 0.6 });
    }
  }

  /**
   * Transform a point by translation and rotation
   */
  private transformPoint(
    x: number,
    y: number,
    cx: number,
    cy: number,
    cos: number,
    sin: number
  ): { x: number; y: number } {
    return {
      x: cx + x * cos - y * sin,
      y: cy + x * sin + y * cos,
    };
  }

  /**
   * Draw the quenelle shape forming at the pause position
   */
  private drawFormingQuenelle(
    graphics: Graphics,
    position: { x: number; y: number },
    rotation: number,
    color: number,
    formProgress: number
  ): void {
    // Quenelle dimensions based on form progress
    const length = 35 * formProgress;
    const width = 15 * formProgress;
    const alpha = 0.8 * formProgress;

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const cx = position.x;
    const cy = position.y;

    // Draw quenelle shape using bezier curves
    // Classic three-sided quenelle form
    const p0 = this.transformPoint(-length / 2, 0, cx, cy, cos, sin);
    const p1 = this.transformPoint(-length / 4, -width / 2, cx, cy, cos, sin);
    const p2 = this.transformPoint(length / 4, -width / 2, cx, cy, cos, sin);
    const p3 = this.transformPoint(length / 2, 0, cx, cy, cos, sin);
    const p4 = this.transformPoint(length / 4, width / 2, cx, cy, cos, sin);
    const p5 = this.transformPoint(-length / 4, width / 2, cx, cy, cos, sin);

    graphics.moveTo(p0.x, p0.y);

    // Top curve
    graphics.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);

    // Bottom curve
    graphics.bezierCurveTo(p4.x, p4.y, p5.x, p5.y, p0.x, p0.y);

    graphics.closePath();
    graphics.fill({ color, alpha });

    // Add ridge highlight along top
    const r0 = this.transformPoint(-length / 3, -width / 6, cx, cy, cos, sin);
    const r1 = this.transformPoint(0, -width / 4, cx, cy, cos, sin);
    const r2 = this.transformPoint(length / 4, -width / 5, cx, cy, cos, sin);
    const r3 = this.transformPoint(length / 3, 0, cx, cy, cos, sin);

    graphics.moveTo(r0.x, r0.y);
    graphics.bezierCurveTo(r1.x, r1.y, r2.x, r2.y, r3.x, r3.y);
    graphics.stroke({ color: 0xffffff, width: 1, alpha: alpha * 0.3 });
  }

  /**
   * Render the final settled quenelle
   */
  renderFinal(
    graphics: Graphics,
    position: { x: number; y: number },
    rotation: number,
    color: number
  ): void {
    graphics.clear();

    const length = 40;
    const width = 18;
    const alpha = 0.9;

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const cx = position.x;
    const cy = position.y;

    // Subtle shadow (offset by 2, 3)
    const s0 = this.transformPoint(-length / 2 + 2, 3, cx, cy, cos, sin);
    const s1 = this.transformPoint(-length / 4 + 2, -width / 2 + 3, cx, cy, cos, sin);
    const s2 = this.transformPoint(length / 4 + 2, -width / 2 + 3, cx, cy, cos, sin);
    const s3 = this.transformPoint(length / 2 + 2, 3, cx, cy, cos, sin);
    const s4 = this.transformPoint(length / 4 + 2, width / 2 + 3, cx, cy, cos, sin);
    const s5 = this.transformPoint(-length / 4 + 2, width / 2 + 3, cx, cy, cos, sin);

    graphics.moveTo(s0.x, s0.y);
    graphics.bezierCurveTo(s1.x, s1.y, s2.x, s2.y, s3.x, s3.y);
    graphics.bezierCurveTo(s4.x, s4.y, s5.x, s5.y, s0.x, s0.y);
    graphics.closePath();
    graphics.fill({ color: 0x000000, alpha: 0.1 });

    // Main quenelle body
    const p0 = this.transformPoint(-length / 2, 0, cx, cy, cos, sin);
    const p1 = this.transformPoint(-length / 4, -width / 2, cx, cy, cos, sin);
    const p2 = this.transformPoint(length / 4, -width / 2, cx, cy, cos, sin);
    const p3 = this.transformPoint(length / 2, 0, cx, cy, cos, sin);
    const p4 = this.transformPoint(length / 4, width / 2, cx, cy, cos, sin);
    const p5 = this.transformPoint(-length / 4, width / 2, cx, cy, cos, sin);

    graphics.moveTo(p0.x, p0.y);
    graphics.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    graphics.bezierCurveTo(p4.x, p4.y, p5.x, p5.y, p0.x, p0.y);
    graphics.closePath();
    graphics.fill({ color, alpha });

    // Ridge highlight
    const r0 = this.transformPoint(-length / 3, -width / 6, cx, cy, cos, sin);
    const r1 = this.transformPoint(0, -width / 4, cx, cy, cos, sin);
    const r2 = this.transformPoint(length / 4, -width / 5, cx, cy, cos, sin);
    const r3 = this.transformPoint(length / 3, 0, cx, cy, cos, sin);

    graphics.moveTo(r0.x, r0.y);
    graphics.bezierCurveTo(r1.x, r1.y, r2.x, r2.y, r3.x, r3.y);
    graphics.stroke({ color: 0xffffff, width: 1.5, alpha: 0.4 });

    // Specular highlight
    const spec = this.transformPoint(-length / 6, -width / 5, cx, cy, cos, sin);
    graphics.circle(spec.x, spec.y, 3);
    graphics.fill({ color: 0xffffff, alpha: 0.25 });
  }
}

// Quenelle target type
export interface QuenelleTarget {
  type: 'quenelle';
  id: string;
  ingredientId: string;
  position: { x: number; y: number };
  rotation: number; // degrees
  arcStart: { x: number; y: number }; // Where arc should begin
  pauseZone: { x: number; y: number; radius: number }; // Where pause should occur
  zones: {
    perfect: number;
    great: number;
    good: number;
    acceptable: number;
  };
}
