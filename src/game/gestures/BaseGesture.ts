import { Graphics } from 'pixi.js';
import type { GestureType, GestureResult, GestureTarget, TouchPath } from '@/types/gestures';

/**
 * Base class for all gesture recognizers.
 * Each gesture type extends this to provide recognition, scoring, and rendering.
 */
export abstract class BaseGesture {
  abstract readonly type: GestureType;

  /**
   * Check if the given touch path matches this gesture type
   * @param path The recorded touch path
   * @returns true if the path matches this gesture pattern
   */
  abstract recognize(path: TouchPath): boolean;

  /**
   * Score the gesture execution against a target
   * @param path The recorded touch path
   * @param target The target to compare against
   * @param plateRadius The plate radius in pixels for denormalization
   * @returns GestureResult with success flag, technique score, and penalties
   */
  abstract score(path: TouchPath, target: GestureTarget, plateRadius: number): GestureResult;

  /**
   * Render the gesture in progress or completed
   * @param graphics PixiJS Graphics object to draw on
   * @param path The touch path so far
   * @param progress Animation progress 0-1 (for completed gesture animation)
   * @param color The color to render with
   */
  abstract render(
    graphics: Graphics,
    path: TouchPath,
    progress: number,
    color: number
  ): void;

  /**
   * Calculate total path length
   */
  protected calculatePathLength(path: TouchPath): number {
    let length = 0;
    const points = path.points;

    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }

    return length;
  }

  /**
   * Calculate straight-line distance from start to end
   */
  protected calculateDirectDistance(path: TouchPath): number {
    const points = path.points;
    if (points.length < 2) return 0;

    const start = points[0];
    const end = points[points.length - 1];
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate curvature ratio (path length / direct distance)
   * Higher values indicate more curved paths
   */
  protected calculateCurvatureRatio(path: TouchPath): number {
    const pathLength = this.calculatePathLength(path);
    const directDistance = this.calculateDirectDistance(path);

    if (directDistance < 1) return 1;  // Prevent division by zero
    return pathLength / directDistance;
  }

  /**
   * Calculate speed variation (coefficient of variation)
   * Lower values indicate more consistent speed
   */
  protected calculateSpeedVariation(path: TouchPath): number {
    const points = path.points;
    if (points.length < 3) return 0;

    const speeds: number[] = [];

    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const dt = points[i].timestamp - points[i - 1].timestamp;

      if (dt > 0) {
        speeds.push(dist / dt);
      }
    }

    if (speeds.length < 2) return 0;

    const mean = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const variance = speeds.reduce((acc, s) => acc + Math.pow(s - mean, 2), 0) / speeds.length;
    const stdDev = Math.sqrt(variance);

    // Coefficient of variation
    return mean > 0 ? stdDev / mean : 0;
  }

  /**
   * Count direction reversals (jerky movements)
   */
  protected countDirectionReversals(path: TouchPath): number {
    const points = path.points;
    if (points.length < 4) return 0;

    let reversals = 0;

    for (let i = 2; i < points.length; i++) {
      // Calculate direction vectors
      const dx1 = points[i - 1].x - points[i - 2].x;
      const dy1 = points[i - 1].y - points[i - 2].y;
      const dx2 = points[i].x - points[i - 1].x;
      const dy2 = points[i].y - points[i - 1].y;

      // Check if dot product is negative (opposite directions)
      const dot = dx1 * dx2 + dy1 * dy2;
      if (dot < 0) {
        reversals++;
      }
    }

    return reversals;
  }

  /**
   * Smooth a path by averaging nearby points
   */
  protected smoothPath(path: TouchPath, windowSize: number = 3): TouchPath {
    const points = path.points;
    if (points.length < windowSize) return path;

    const smoothed = points.map((point, i) => {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(points.length, i + Math.ceil(windowSize / 2));
      const window = points.slice(start, end);

      const avgX = window.reduce((sum, p) => sum + p.x, 0) / window.length;
      const avgY = window.reduce((sum, p) => sum + p.y, 0) / window.length;

      return {
        ...point,
        x: avgX,
        y: avgY,
      };
    });

    return {
      ...path,
      points: smoothed,
    };
  }
}
