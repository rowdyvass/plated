import { Container, Graphics } from 'pixi.js';
import type { PathPoint } from '@/types/gestures';

export type PlacementZone = 'perfect' | 'great' | 'good' | 'acceptable' | 'miss';

interface DrizzleGhostOptions {
  path: PathPoint[];        // Normalized path points (-1 to 1)
  plateRadius: number;      // For denormalization
  color?: number;
  opacity?: number;
  strokeWidth?: number;
  dashLength?: number;
  gapLength?: number;
  showStartIndicator?: boolean;
  showDirectionArrows?: boolean;
}

/**
 * Ghost visualization for drizzle gestures.
 * Shows a thin dashed line with start indicator and direction arrows.
 * Unlike PathGhost (for swoosh), DrizzleGhost emphasizes:
 * - Consistent thin line (no taper)
 * - Direction arrows to guide continuous motion
 * - Start point prominence
 */
export class DrizzleGhost extends Container {
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
  private showStartIndicator: boolean;
  private showDirectionArrows: boolean;

  constructor(options: DrizzleGhostOptions) {
    super();

    this.path = options.path;
    this.plateRadius = options.plateRadius;
    this.color = options.color ?? 0x4A7C23; // Green for oil
    this.baseOpacity = options.opacity ?? 0.5;
    this.strokeWidth = options.strokeWidth ?? 1.5;
    this.dashLength = options.dashLength ?? 8;
    this.gapLength = options.gapLength ?? 6;
    this.showStartIndicator = options.showStartIndicator ?? true;
    this.showDirectionArrows = options.showDirectionArrows ?? true;

    this.graphics = new Graphics();
    this.addChild(this.graphics);

    this.drawPath();
    this.alpha = this.baseOpacity;
  }

  private drawPath(): void {
    if (this.path.length < 2) return;

    // Convert normalized path to pixel coordinates
    const pixelPath = this.path.map(p => ({
      x: p.x * this.plateRadius,
      y: p.y * this.plateRadius,
    }));

    // Draw dashed line for ghost path
    this.drawDashedPath(pixelPath);

    // Start indicator (filled circle with inner white dot)
    if (this.showStartIndicator) {
      const start = pixelPath[0];

      // Outer circle
      this.graphics.circle(start.x, start.y, 6);
      this.graphics.fill({ color: this.color, alpha: 0.6 });

      // Inner circle for contrast
      this.graphics.circle(start.x, start.y, 3);
      this.graphics.fill({ color: 0xFFFFFF, alpha: 0.4 });
    }

    // Direction arrows along path
    if (this.showDirectionArrows && pixelPath.length >= 3) {
      this.drawDirectionArrows(pixelPath);
    }

    // End indicator (small fading arrow)
    this.drawEndIndicator(pixelPath);
  }

  /**
   * Draw a dashed path connecting the points
   */
  private drawDashedPath(points: { x: number; y: number }[]): void {
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);

      if (segmentLength < 0.01) continue;

      const ux = dx / segmentLength;
      const uy = dy / segmentLength;

      let distance = 0;
      let drawing = true;

      while (distance < segmentLength) {
        const currentLength = drawing ? this.dashLength : this.gapLength;
        const endDistance = Math.min(distance + currentLength, segmentLength);

        if (drawing) {
          this.graphics.moveTo(
            p1.x + ux * distance,
            p1.y + uy * distance
          );
          this.graphics.lineTo(
            p1.x + ux * endDistance,
            p1.y + uy * endDistance
          );
          this.graphics.stroke({ color: this.color, width: this.strokeWidth });
        }

        distance = endDistance;
        drawing = !drawing;
      }
    }
  }

  /**
   * Draw direction arrows at 25% and 75% of the path
   */
  private drawDirectionArrows(points: { x: number; y: number }[]): void {
    const arrowPositions = [0.25, 0.75];

    for (const t of arrowPositions) {
      const index = Math.floor(t * (points.length - 1));
      const nextIndex = Math.min(index + 1, points.length - 1);

      const p1 = points[index];
      const p2 = points[nextIndex];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len < 1) continue;

      const ux = dx / len;
      const uy = dy / len;

      // Arrow position (midpoint of segment)
      const ax = (p1.x + p2.x) / 2;
      const ay = (p1.y + p2.y) / 2;

      // Arrow head size
      const arrowSize = 5;

      // Draw arrow head (triangle)
      this.graphics.moveTo(ax + ux * arrowSize, ay + uy * arrowSize);
      this.graphics.lineTo(ax - uy * arrowSize * 0.6, ay + ux * arrowSize * 0.6);
      this.graphics.lineTo(ax + uy * arrowSize * 0.6, ay - ux * arrowSize * 0.6);
      this.graphics.closePath();
      this.graphics.fill({ color: this.color, alpha: 0.5 });
    }
  }

  /**
   * Draw a small arrow at the end of the path
   */
  private drawEndIndicator(points: { x: number; y: number }[]): void {
    if (points.length < 2) return;

    const end = points[points.length - 1];
    const prev = points[points.length - 2];

    const dx = end.x - prev.x;
    const dy = end.y - prev.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len < 0.01) return;

    const ux = dx / len;
    const uy = dy / len;

    // Small fading arrow at end
    const arrowSize = 4;
    this.graphics.moveTo(end.x, end.y);
    this.graphics.lineTo(
      end.x - ux * arrowSize * 2 - uy * arrowSize,
      end.y - uy * arrowSize * 2 + ux * arrowSize
    );
    this.graphics.moveTo(end.x, end.y);
    this.graphics.lineTo(
      end.x - ux * arrowSize * 2 + uy * arrowSize,
      end.y - uy * arrowSize * 2 - ux * arrowSize
    );
    this.graphics.stroke({ color: this.color, width: this.strokeWidth, alpha: 0.7 });
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

      // Draw solid path
      if (pixelPath.length >= 2) {
        this.graphics.moveTo(pixelPath[0].x, pixelPath[0].y);
        for (let i = 1; i < pixelPath.length; i++) {
          this.graphics.lineTo(pixelPath[i].x, pixelPath[i].y);
        }
        this.graphics.stroke({ color: flashColor, width: this.strokeWidth * 1.5 });
      }

      // Draw start indicator
      this.graphics.circle(pixelPath[0].x, pixelPath[0].y, 6);
      this.graphics.fill({ color: flashColor, alpha: 0.6 });

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
