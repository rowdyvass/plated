import { Container, Graphics } from 'pixi.js';
import type { PathPoint } from '@/types/gestures';

export type PlacementZone = 'perfect' | 'great' | 'good' | 'acceptable' | 'miss';

interface PathGhostOptions {
  path: PathPoint[];        // Normalized path points (-1 to 1)
  plateRadius: number;      // For denormalization
  color?: number;
  opacity?: number;
  strokeWidth?: number;
  dashLength?: number;
  gapLength?: number;
  startIndicatorSize?: number;
  endIndicatorSize?: number;
}

/**
 * Ghost visualization for path-based gestures like swoosh.
 * Shows a curved dashed line with start indicator and tapered end.
 */
export class PathGhost extends Container {
  private graphics: Graphics;
  private baseOpacity: number;
  private pulsePhase = 0;
  private animating = true;
  private path: PathPoint[];
  private plateRadius: number;
  private color: number;
  private strokeWidth: number;
  private dashLength: number;
  private gapLength: number;
  private startIndicatorSize: number;
  private endIndicatorSize: number;

  constructor(options: PathGhostOptions) {
    super();

    this.path = options.path;
    this.plateRadius = options.plateRadius;
    this.color = options.color ?? 0xb87333; // accent.primary
    this.baseOpacity = options.opacity ?? 0.6;
    this.strokeWidth = options.strokeWidth ?? 2;
    this.dashLength = options.dashLength ?? 8;
    this.gapLength = options.gapLength ?? 6;
    this.startIndicatorSize = options.startIndicatorSize ?? 6;
    this.endIndicatorSize = options.endIndicatorSize ?? 3;

    this.graphics = new Graphics();
    this.addChild(this.graphics);

    this.drawPath();
    this.alpha = this.baseOpacity;
  }

  /**
   * Get a contrasting color for the outline shadow.
   * Light colors get a dark shadow, dark colors get a light shadow.
   */
  private getContrastColor(color: number): number {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? 0x3d3d3d : 0xffffff;
  }

  private drawPath(): void {
    if (this.path.length < 2) return;

    // Convert normalized path to pixel coordinates
    const pixelPath = this.path.map(p => ({
      x: p.x * this.plateRadius,
      y: p.y * this.plateRadius,
    }));

    // Generate smooth bezier curve points from the control points
    const curvePoints = this.generateCurvePoints(pixelPath, 50);

    // Get contrast color for shadow
    const contrastColor = this.getContrastColor(this.color);

    // Draw start indicator shadow then fill
    this.graphics.circle(pixelPath[0].x, pixelPath[0].y, this.startIndicatorSize + 1);
    this.graphics.fill({ color: contrastColor, alpha: 0.2 });
    this.graphics.circle(pixelPath[0].x, pixelPath[0].y, this.startIndicatorSize);
    this.graphics.fill({ color: this.color, alpha: 0.4 });

    // Draw dashed path with contrast shadow
    this.drawDashedCurve(curvePoints, contrastColor);

    // Draw end indicator (arrow or small point)
    const lastIdx = curvePoints.length - 1;
    const endPoint = curvePoints[lastIdx];
    const prevPoint = curvePoints[lastIdx - 1];

    // Calculate direction for arrow
    const dx = endPoint.x - prevPoint.x;
    const dy = endPoint.y - prevPoint.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len > 0) {
      const nx = dx / len;
      const ny = dy / len;

      // Draw small arrow at end
      const arrowSize = this.endIndicatorSize * 2;
      const arrowX = endPoint.x;
      const arrowY = endPoint.y;

      // Arrow head points
      const perpX = -ny;
      const perpY = nx;

      // Draw arrow shadow
      this.graphics.moveTo(arrowX, arrowY);
      this.graphics.lineTo(arrowX - nx * arrowSize + perpX * arrowSize * 0.5, arrowY - ny * arrowSize + perpY * arrowSize * 0.5);
      this.graphics.moveTo(arrowX, arrowY);
      this.graphics.lineTo(arrowX - nx * arrowSize - perpX * arrowSize * 0.5, arrowY - ny * arrowSize - perpY * arrowSize * 0.5);
      this.graphics.stroke({ color: contrastColor, width: this.strokeWidth + 2, alpha: 0.25 });

      // Draw arrow
      this.graphics.moveTo(arrowX, arrowY);
      this.graphics.lineTo(arrowX - nx * arrowSize + perpX * arrowSize * 0.5, arrowY - ny * arrowSize + perpY * arrowSize * 0.5);
      this.graphics.moveTo(arrowX, arrowY);
      this.graphics.lineTo(arrowX - nx * arrowSize - perpX * arrowSize * 0.5, arrowY - ny * arrowSize - perpY * arrowSize * 0.5);
      this.graphics.stroke({ color: this.color, width: this.strokeWidth });
    }
  }

  /**
   * Generate smooth curve points using Catmull-Rom interpolation
   */
  private generateCurvePoints(
    controlPoints: { x: number; y: number }[],
    segments: number
  ): { x: number; y: number }[] {
    if (controlPoints.length < 2) return controlPoints;

    const result: { x: number; y: number }[] = [];

    // Add phantom points at start and end for smoother curves
    const points = [
      controlPoints[0],
      ...controlPoints,
      controlPoints[controlPoints.length - 1],
    ];

    for (let i = 1; i < points.length - 2; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2];

      const segmentsForSection = Math.ceil(segments / (controlPoints.length - 1));

      for (let t = 0; t <= 1; t += 1 / segmentsForSection) {
        const tt = t * t;
        const ttt = tt * t;

        // Catmull-Rom spline
        const x = 0.5 * (
          (2 * p1.x) +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * tt +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * ttt
        );

        const y = 0.5 * (
          (2 * p1.y) +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * tt +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * ttt
        );

        result.push({ x, y });
      }
    }

    return result;
  }

  /**
   * Draw a dashed curve along the given points
   */
  private drawDashedCurve(points: { x: number; y: number }[], contrastColor: number): void {
    if (points.length < 2) return;

    // Calculate cumulative distances along the path
    const distances: number[] = [0];
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      distances.push(distances[i - 1] + Math.sqrt(dx * dx + dy * dy));
    }

    const totalLength = distances[distances.length - 1];
    const segmentLength = this.dashLength + this.gapLength;

    // First pass: draw contrast shadow for visibility
    let currentDist = 0;
    while (currentDist < totalLength) {
      const dashStart = currentDist;
      const dashEnd = Math.min(currentDist + this.dashLength, totalLength);

      const startPoint = this.getPointAtDistance(points, distances, dashStart);
      const endPoint = this.getPointAtDistance(points, distances, dashEnd);

      if (startPoint && endPoint) {
        this.graphics.moveTo(startPoint.x, startPoint.y);
        this.graphics.lineTo(endPoint.x, endPoint.y);
        this.graphics.stroke({ color: contrastColor, width: this.strokeWidth + 2, alpha: 0.25 });
      }

      currentDist += segmentLength;
    }

    // Second pass: draw actual colored dashes
    currentDist = 0;
    while (currentDist < totalLength) {
      const dashStart = currentDist;
      const dashEnd = Math.min(currentDist + this.dashLength, totalLength);

      const startPoint = this.getPointAtDistance(points, distances, dashStart);
      const endPoint = this.getPointAtDistance(points, distances, dashEnd);

      if (startPoint && endPoint) {
        this.graphics.moveTo(startPoint.x, startPoint.y);
        this.graphics.lineTo(endPoint.x, endPoint.y);
        this.graphics.stroke({ color: this.color, width: this.strokeWidth });
      }

      currentDist += segmentLength;
    }
  }

  /**
   * Get the point at a specific distance along the path
   */
  private getPointAtDistance(
    points: { x: number; y: number }[],
    distances: number[],
    targetDist: number
  ): { x: number; y: number } | null {
    if (points.length < 2) return null;

    // Find the segment containing this distance
    for (let i = 1; i < distances.length; i++) {
      if (distances[i] >= targetDist) {
        const segmentStart = distances[i - 1];
        const segmentEnd = distances[i];
        const segmentLength = segmentEnd - segmentStart;

        if (segmentLength < 0.01) {
          return points[i - 1];
        }

        const t = (targetDist - segmentStart) / segmentLength;

        return {
          x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
          y: points[i - 1].y + (points[i].y - points[i - 1].y) * t,
        };
      }
    }

    return points[points.length - 1];
  }

  update(deltaMs: number): void {
    if (!this.animating) return;

    // Pulse animation: opacity varies +-5% over 3 seconds
    this.pulsePhase += (deltaMs / 3000) * Math.PI * 2;
    if (this.pulsePhase > Math.PI * 2) {
      this.pulsePhase -= Math.PI * 2;
    }

    const pulseOffset = Math.sin(this.pulsePhase) * 0.05;
    this.alpha = this.baseOpacity + pulseOffset;
  }

  fadeOut(duration: number = 100): Promise<void> {
    return new Promise((resolve) => {
      this.animating = false;
      const startAlpha = this.alpha;
      const startTime = performance.now();

      const animate = () => {
        if (this.destroyed) {
          resolve();
          return;
        }

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const eased = 1 - Math.pow(1 - progress, 2);
        this.alpha = startAlpha * (1 - eased);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  flashColor(flashColor: number, duration: number = 150): Promise<void> {
    return new Promise((resolve) => {
      this.animating = false;

      // Redraw with solid line in flash color
      this.graphics.clear();

      const pixelPath = this.path.map(p => ({
        x: p.x * this.plateRadius,
        y: p.y * this.plateRadius,
      }));

      const curvePoints = this.generateCurvePoints(pixelPath, 50);

      // Draw solid path
      if (curvePoints.length >= 2) {
        this.graphics.moveTo(curvePoints[0].x, curvePoints[0].y);
        for (let i = 1; i < curvePoints.length; i++) {
          this.graphics.lineTo(curvePoints[i].x, curvePoints[i].y);
        }
        this.graphics.stroke({ color: flashColor, width: this.strokeWidth * 1.5 });
      }

      // Draw start indicator
      this.graphics.circle(pixelPath[0].x, pixelPath[0].y, this.startIndicatorSize);
      this.graphics.fill({ color: flashColor, alpha: 0.5 });

      this.alpha = 1;

      setTimeout(() => {
        this.fadeOut(100).then(resolve);
      }, duration);
    });
  }

  showZoneFeedback(zone: PlacementZone): Promise<void> {
    switch (zone) {
      case 'perfect':
        return this.flashColor(0x4a6741, 150);
      case 'great':
        return this.flashColor(0xb87333, 120);
      case 'good':
        return this.fadeOut(100);
      case 'acceptable':
        return new Promise((resolve) => {
          setTimeout(() => {
            this.fadeOut(100).then(resolve);
          }, 50);
        });
      case 'miss':
      default:
        return this.fadeOut(50);
    }
  }

  stopAnimation(): void {
    this.animating = false;
  }

  startAnimation(): void {
    this.animating = true;
  }
}
