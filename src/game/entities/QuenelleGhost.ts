import { Container, Graphics } from 'pixi.js';
import type { PlacementZone } from './Ghost';

interface QuenelleGhostOptions {
  position: { x: number; y: number }; // Normalized position for quenelle placement
  rotation: number; // Rotation in radians
  arcStart: { x: number; y: number }; // Where the arc should begin
  pauseZone: { x: number; y: number; radius: number }; // Where pause should occur
  plateRadius: number;
  color?: number;
  opacity?: number;
  strokeWidth?: number;
}

/**
 * QuenelleGhost renders the ghost visualization for quenelle gestures.
 * Shows:
 * 1. Arc path showing the scooping motion (curved dashed line)
 * 2. Start indicator (small circle at arc start)
 * 3. Pause indicator (pulsing circle where pause should occur)
 * 4. Target quenelle shape (dashed outline of final shape)
 */
export class QuenelleGhost extends Container {
  private graphics: Graphics;
  private pauseGraphics: Graphics;
  private quenelleGraphics: Graphics;
  private baseOpacity: number;
  private pulsePhase = 0;
  private pausePulsePhase = 0;
  private animating = true;
  private color: number;
  private strokeWidth: number;

  // Ghost configuration
  private arcStart: { x: number; y: number };
  private pausePosition: { x: number; y: number };
  private pauseRadius: number;
  private quenellePosition: { x: number; y: number };
  private quenelleRotation: number; // Renamed from 'rotation' to avoid conflict with Container

  // Pause state tracking
  private pauseActive = false;
  private pauseProgress = 0;

  constructor(options: QuenelleGhostOptions) {
    super();

    this.color = options.color ?? 0xb87333;
    this.baseOpacity = options.opacity ?? 0.6;
    this.strokeWidth = options.strokeWidth ?? 1.5;

    // Convert normalized positions to pixel coordinates
    this.arcStart = {
      x: options.arcStart.x * options.plateRadius,
      y: options.arcStart.y * options.plateRadius,
    };
    this.pausePosition = {
      x: options.pauseZone.x * options.plateRadius,
      y: options.pauseZone.y * options.plateRadius,
    };
    this.pauseRadius = options.pauseZone.radius * options.plateRadius;
    this.quenellePosition = {
      x: options.position.x * options.plateRadius,
      y: options.position.y * options.plateRadius,
    };
    this.quenelleRotation = (options.rotation * Math.PI) / 180; // Convert degrees to radians

    // Create graphics layers
    this.graphics = new Graphics();
    this.pauseGraphics = new Graphics();
    this.quenelleGraphics = new Graphics();

    this.addChild(this.graphics);
    this.addChild(this.pauseGraphics);
    this.addChild(this.quenelleGraphics);

    this.drawArcPath();
    this.drawPauseIndicator();
    this.drawQuenelleOutline();

    this.alpha = this.baseOpacity;
  }

  /**
   * Draw the curved arc path showing the scooping motion
   */
  private drawArcPath(): void {
    // Generate arc path from start to pause position
    const arcPoints = this.generateArcPoints(this.arcStart, this.pausePosition, 30);

    // Draw start indicator
    this.graphics.circle(this.arcStart.x, this.arcStart.y, 5);
    this.graphics.fill({ color: this.color, alpha: 0.4 });

    // Draw dashed arc path
    this.drawDashedPath(arcPoints);

    // Draw small arrow near pause to indicate direction
    if (arcPoints.length > 2) {
      const lastIdx = arcPoints.length - 1;
      const prevIdx = lastIdx - 3;
      const dx = arcPoints[lastIdx].x - arcPoints[prevIdx].x;
      const dy = arcPoints[lastIdx].y - arcPoints[prevIdx].y;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len > 0) {
        const nx = dx / len;
        const ny = dy / len;
        const arrowSize = 8;
        const perpX = -ny;
        const perpY = nx;

        const arrowX = arcPoints[lastIdx].x;
        const arrowY = arcPoints[lastIdx].y;

        this.graphics.moveTo(arrowX, arrowY);
        this.graphics.lineTo(
          arrowX - nx * arrowSize + perpX * arrowSize * 0.5,
          arrowY - ny * arrowSize + perpY * arrowSize * 0.5
        );
        this.graphics.moveTo(arrowX, arrowY);
        this.graphics.lineTo(
          arrowX - nx * arrowSize - perpX * arrowSize * 0.5,
          arrowY - ny * arrowSize - perpY * arrowSize * 0.5
        );
        this.graphics.stroke({ color: this.color, width: this.strokeWidth, alpha: 0.6 });
      }
    }
  }

  /**
   * Generate arc points using quadratic bezier curve
   */
  private generateArcPoints(
    start: { x: number; y: number },
    end: { x: number; y: number },
    segments: number
  ): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [];

    // Create a control point for the arc (perpendicular to midpoint)
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    // Control point offset perpendicular to the line, creating a downward arc
    const controlOffset = len * 0.4;
    const perpX = -dy / len;
    const perpY = dx / len;

    const controlX = midX + perpX * controlOffset;
    const controlY = midY + perpY * controlOffset;

    // Generate points along quadratic bezier
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * controlX + t * t * end.x;
      const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * controlY + t * t * end.y;
      points.push({ x, y });
    }

    return points;
  }

  /**
   * Draw a dashed path along the given points
   */
  private drawDashedPath(points: { x: number; y: number }[]): void {
    if (points.length < 2) return;

    const dashLength = 8;
    const gapLength = 5;

    // Calculate cumulative distances
    const distances: number[] = [0];
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      distances.push(distances[i - 1] + Math.sqrt(dx * dx + dy * dy));
    }

    const totalLength = distances[distances.length - 1];
    const segmentLength = dashLength + gapLength;

    let currentDist = 0;
    while (currentDist < totalLength) {
      const dashStart = currentDist;
      const dashEnd = Math.min(currentDist + dashLength, totalLength);

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
   * Get point at specific distance along path
   */
  private getPointAtDistance(
    points: { x: number; y: number }[],
    distances: number[],
    targetDist: number
  ): { x: number; y: number } | null {
    if (points.length < 2) return null;

    for (let i = 1; i < distances.length; i++) {
      if (distances[i] >= targetDist) {
        const segmentStart = distances[i - 1];
        const segmentEnd = distances[i];
        const segmentLength = segmentEnd - segmentStart;

        if (segmentLength < 0.01) return points[i - 1];

        const t = (targetDist - segmentStart) / segmentLength;
        return {
          x: points[i - 1].x + (points[i].x - points[i - 1].x) * t,
          y: points[i - 1].y + (points[i].y - points[i - 1].y) * t,
        };
      }
    }

    return points[points.length - 1];
  }

  /**
   * Draw the pause indicator (pulsing circle)
   */
  private drawPauseIndicator(): void {
    const { x, y } = this.pausePosition;
    const radius = this.pauseRadius;

    // Draw outer ring (dashed)
    this.drawDashedCircle(this.pauseGraphics, x, y, radius, 6, 4);

    // Draw center dot
    this.pauseGraphics.circle(x, y, 4);
    this.pauseGraphics.fill({ color: this.color, alpha: 0.3 });

    // Draw "pause here" text indicator (simple bars)
    const barWidth = 3;
    const barHeight = 10;
    const barGap = 4;

    this.pauseGraphics.rect(x - barGap / 2 - barWidth, y - barHeight / 2, barWidth, barHeight);
    this.pauseGraphics.rect(x + barGap / 2, y - barHeight / 2, barWidth, barHeight);
    this.pauseGraphics.fill({ color: this.color, alpha: 0.4 });
  }

  /**
   * Draw a dashed circle
   */
  private drawDashedCircle(
    graphics: Graphics,
    cx: number,
    cy: number,
    radius: number,
    dashLength: number,
    gapLength: number
  ): void {
    const circumference = 2 * Math.PI * radius;
    const segmentLength = dashLength + gapLength;
    const segments = Math.floor(circumference / segmentLength);
    const actualSegmentAngle = (2 * Math.PI) / segments;
    const dashAngle = actualSegmentAngle * (dashLength / segmentLength);

    for (let i = 0; i < segments; i++) {
      const startAngle = i * actualSegmentAngle;
      const endAngle = startAngle + dashAngle;

      graphics.arc(cx, cy, radius, startAngle, endAngle);
      graphics.stroke({ color: this.color, width: this.strokeWidth });
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
   * Draw the target quenelle shape outline
   */
  private drawQuenelleOutline(): void {
    const cx = this.quenellePosition.x;
    const cy = this.quenellePosition.y;
    const length = 35;
    const width = 15;
    const cos = Math.cos(this.quenelleRotation);
    const sin = Math.sin(this.quenelleRotation);

    // Draw subtle fill
    this.drawQuenelleShapeTransformed(cx, cy, cos, sin, length, width, 0.05, true);

    // Draw dashed outline
    this.drawDashedQuenelleOutlineTransformed(cx, cy, cos, sin, length, width);
  }

  /**
   * Draw quenelle shape fill with transformation
   */
  private drawQuenelleShapeTransformed(
    cx: number,
    cy: number,
    cos: number,
    sin: number,
    length: number,
    width: number,
    alpha: number,
    fill: boolean
  ): void {
    const halfLen = length / 2;

    // Transform all points
    const p0 = this.transformPoint(-halfLen, 0, cx, cy, cos, sin);
    const p1 = this.transformPoint(-halfLen * 0.5, -width * 0.45, cx, cy, cos, sin);
    const p2 = this.transformPoint(halfLen * 0.5, -width * 0.45, cx, cy, cos, sin);
    const p3 = this.transformPoint(halfLen, 0, cx, cy, cos, sin);
    const p4 = this.transformPoint(halfLen * 0.5, width * 0.55, cx, cy, cos, sin);
    const p5 = this.transformPoint(-halfLen * 0.5, width * 0.55, cx, cy, cos, sin);

    this.quenelleGraphics.moveTo(p0.x, p0.y);
    this.quenelleGraphics.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    this.quenelleGraphics.bezierCurveTo(p4.x, p4.y, p5.x, p5.y, p0.x, p0.y);
    this.quenelleGraphics.closePath();

    if (fill) {
      this.quenelleGraphics.fill({ color: this.color, alpha });
    }
  }

  /**
   * Draw dashed quenelle outline with transformation
   */
  private drawDashedQuenelleOutlineTransformed(
    cx: number,
    cy: number,
    cos: number,
    sin: number,
    length: number,
    width: number
  ): void {
    const halfLen = length / 2;
    const dashLength = 5;
    const gapLength = 3;
    const segments = 24;

    // Generate points along the quenelle outline (in local coords)
    const localPoints: { x: number; y: number }[] = [];

    // Top curve
    for (let i = 0; i <= segments / 2; i++) {
      const t = i / (segments / 2);
      const x = -halfLen + t * length;
      const curve = Math.sin(t * Math.PI);
      const y = -width * 0.45 * curve;
      localPoints.push({ x, y });
    }

    // Bottom curve
    for (let i = 0; i <= segments / 2; i++) {
      const t = i / (segments / 2);
      const x = halfLen - t * length;
      const curve = Math.sin(t * Math.PI);
      const y = width * 0.55 * curve;
      localPoints.push({ x, y });
    }

    // Transform all points
    const outlinePoints = localPoints.map(p => this.transformPoint(p.x, p.y, cx, cy, cos, sin));

    // Draw dashed outline
    const totalPoints = outlinePoints.length;
    let currentDist = 0;
    let inDash = true;

    for (let i = 1; i < totalPoints; i++) {
      const dx = outlinePoints[i].x - outlinePoints[i - 1].x;
      const dy = outlinePoints[i].y - outlinePoints[i - 1].y;
      const segDist = Math.sqrt(dx * dx + dy * dy);

      if (inDash) {
        this.quenelleGraphics.moveTo(outlinePoints[i - 1].x, outlinePoints[i - 1].y);
        this.quenelleGraphics.lineTo(outlinePoints[i].x, outlinePoints[i].y);
        this.quenelleGraphics.stroke({ color: this.color, width: this.strokeWidth });
      }

      currentDist += segDist;
      if (currentDist >= (inDash ? dashLength : gapLength)) {
        currentDist = 0;
        inDash = !inDash;
      }
    }
  }

  /**
   * Set pause active state (called when player enters pause zone)
   */
  setPauseActive(active: boolean): void {
    this.pauseActive = active;
  }

  /**
   * Set pause progress (0-1, how complete the pause is)
   */
  setPauseProgress(progress: number): void {
    this.pauseProgress = Math.min(1, Math.max(0, progress));
  }

  update(deltaMs: number): void {
    if (!this.animating) return;

    // Main pulse animation
    this.pulsePhase += (deltaMs / 3000) * Math.PI * 2;
    if (this.pulsePhase > Math.PI * 2) {
      this.pulsePhase -= Math.PI * 2;
    }

    const pulseOffset = Math.sin(this.pulsePhase) * 0.05;
    this.alpha = this.baseOpacity + pulseOffset;

    // Pause indicator pulse (faster when pause is active)
    const pausePulseSpeed = this.pauseActive ? 1500 : 2500;
    this.pausePulsePhase += (deltaMs / pausePulseSpeed) * Math.PI * 2;
    if (this.pausePulsePhase > Math.PI * 2) {
      this.pausePulsePhase -= Math.PI * 2;
    }

    // Update pause indicator appearance
    this.updatePauseIndicator();
  }

  /**
   * Update pause indicator based on current state
   */
  private updatePauseIndicator(): void {
    this.pauseGraphics.clear();

    const { x, y } = this.pausePosition;
    const radius = this.pauseRadius;

    // Calculate pulse scale
    const pulseScale = 1 + Math.sin(this.pausePulsePhase) * 0.1;
    const currentRadius = radius * pulseScale;

    if (this.pauseActive) {
      // When pausing, show solid circle that fills based on progress
      const fillAlpha = 0.1 + this.pauseProgress * 0.3;

      // Background fill
      this.pauseGraphics.circle(x, y, currentRadius);
      this.pauseGraphics.fill({ color: this.color, alpha: fillAlpha });

      // Progress ring
      if (this.pauseProgress > 0) {
        const progressAngle = this.pauseProgress * Math.PI * 2 - Math.PI / 2;
        this.pauseGraphics.arc(x, y, currentRadius, -Math.PI / 2, progressAngle);
        this.pauseGraphics.stroke({ color: this.color, width: 3 });
      }
    } else {
      // When not pausing, show dashed circle
      this.drawDashedCircle(this.pauseGraphics, x, y, currentRadius, 6, 4);
    }

    // Center indicator
    this.pauseGraphics.circle(x, y, 4);
    this.pauseGraphics.fill({ color: this.color, alpha: this.pauseActive ? 0.6 : 0.3 });

    // Pause bars
    const barWidth = 3;
    const barHeight = 10;
    const barGap = 4;
    const barAlpha = this.pauseActive ? 0.7 : 0.4;

    this.pauseGraphics.rect(x - barGap / 2 - barWidth, y - barHeight / 2, barWidth, barHeight);
    this.pauseGraphics.rect(x + barGap / 2, y - barHeight / 2, barWidth, barHeight);
    this.pauseGraphics.fill({ color: this.color, alpha: barAlpha });
  }

  /**
   * Get the pause zone center in plate coordinates
   */
  getPausePosition(): { x: number; y: number } {
    return { ...this.pausePosition };
  }

  /**
   * Get the pause zone radius in pixels
   */
  getPauseRadius(): number {
    return this.pauseRadius;
  }

  /**
   * Check if a point is within the pause zone
   */
  isInPauseZone(x: number, y: number): boolean {
    const dx = x - this.pausePosition.x;
    const dy = y - this.pausePosition.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.pauseRadius;
  }

  showZoneFeedback(zone: PlacementZone): Promise<void> {
    const flashColors: Record<PlacementZone, number> = {
      perfect: 0x4a6741,
      great: 0xb87333,
      good: 0x808080,
      acceptable: 0x808080,
      miss: 0x8b0000,
    };

    const flashColor = flashColors[zone];
    this.animating = false;

    // Flash the quenelle outline
    this.quenelleGraphics.clear();

    const cx = this.quenellePosition.x;
    const cy = this.quenellePosition.y;
    const length = 35;
    const width = 15;
    const cos = Math.cos(this.quenelleRotation);
    const sin = Math.sin(this.quenelleRotation);
    const halfLen = length / 2;

    // Draw flash shape with transformed points
    const p0 = this.transformPoint(-halfLen, 0, cx, cy, cos, sin);
    const p1 = this.transformPoint(-halfLen * 0.5, -width * 0.45, cx, cy, cos, sin);
    const p2 = this.transformPoint(halfLen * 0.5, -width * 0.45, cx, cy, cos, sin);
    const p3 = this.transformPoint(halfLen, 0, cx, cy, cos, sin);
    const p4 = this.transformPoint(halfLen * 0.5, width * 0.55, cx, cy, cos, sin);
    const p5 = this.transformPoint(-halfLen * 0.5, width * 0.55, cx, cy, cos, sin);

    this.quenelleGraphics.moveTo(p0.x, p0.y);
    this.quenelleGraphics.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    this.quenelleGraphics.bezierCurveTo(p4.x, p4.y, p5.x, p5.y, p0.x, p0.y);
    this.quenelleGraphics.closePath();
    this.quenelleGraphics.fill({ color: flashColor, alpha: 0.3 });

    return new Promise((resolve) => {
      setTimeout(() => {
        this.fadeOut(100).then(resolve);
      }, 150);
    });
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

  stopAnimation(): void {
    this.animating = false;
  }

  startAnimation(): void {
    this.animating = true;
  }
}
