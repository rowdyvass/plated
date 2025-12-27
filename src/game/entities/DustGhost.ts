import { Container, Graphics } from 'pixi.js';
import type { PlacementZone } from './Ghost';
import type { DustTarget } from '../gestures/DustGesture';

interface DustGhostOptions {
  target: DustTarget;
  plateRadius: number;
  color?: number;
  opacity?: number;
}

/**
 * DustGhost renders a soft, stippled zone boundary for dust gestures.
 * Shows:
 * - Rectangular or curved zone to cover with stipple pattern
 * - Arrow indicating recommended swipe direction
 * - Avoid zones as "holes" in the ghost
 */
export class DustGhost extends Container {
  private graphics: Graphics;
  private arrowGraphics: Graphics;
  private baseOpacity: number;
  private pulsePhase = 0;
  private animating = true;
  private color: number;
  private target: DustTarget;

  // Computed zone bounds in pixels
  private zoneBounds: { x: number; y: number; width: number; height: number };
  private avoidZones: { center: { x: number; y: number }; radius: number }[];

  // Track completion
  private isComplete = false;

  constructor(options: DustGhostOptions) {
    super();

    this.target = options.target;
    this.color = options.color ?? 0xffffff; // Default white for powder
    this.baseOpacity = options.opacity ?? 0.5;

    // Convert bounds to pixels
    this.zoneBounds = {
      x: options.target.zone.bounds.x * options.plateRadius,
      y: options.target.zone.bounds.y * options.plateRadius,
      width: options.target.zone.bounds.width * options.plateRadius,
      height: options.target.zone.bounds.height * options.plateRadius,
    };

    // Convert avoid zones to pixels
    this.avoidZones = (options.target.avoidZones ?? []).map(zone => ({
      center: {
        x: zone.center.x * options.plateRadius,
        y: zone.center.y * options.plateRadius,
      },
      radius: zone.radius * options.plateRadius,
    }));

    this.graphics = new Graphics();
    this.arrowGraphics = new Graphics();
    this.addChild(this.graphics);
    this.addChild(this.arrowGraphics);

    this.drawZone();
    this.drawSwipeArrow();
    this.alpha = this.baseOpacity;
  }

  /**
   * Draw the dust zone with stipple pattern
   */
  private drawZone(): void {
    const { x, y, width, height } = this.zoneBounds;

    // Draw subtle fill with stipple pattern
    this.drawStipplePattern(x, y, width, height);

    // Draw dashed border
    this.drawDashedBorder(x, y, width, height);
  }

  /**
   * Draw stipple pattern suggesting powder
   */
  private drawStipplePattern(x: number, y: number, width: number, height: number): void {
    const dotSpacing = 8;
    const dotSize = 1.5;

    // Create a grid of dots with some randomness
    for (let row = 0; row < Math.ceil(height / dotSpacing); row++) {
      for (let col = 0; col < Math.ceil(width / dotSpacing); col++) {
        const dotX = x + col * dotSpacing + (Math.sin(row * 3.7 + col * 2.1) * 0.3 + 0.5) * dotSpacing;
        const dotY = y + row * dotSpacing + (Math.cos(row * 2.3 + col * 4.5) * 0.3 + 0.5) * dotSpacing;

        // Skip dots that are outside the zone
        if (dotX < x || dotX > x + width || dotY < y || dotY > y + height) {
          continue;
        }

        // Skip dots in avoid zones
        let inAvoidZone = false;
        for (const zone of this.avoidZones) {
          const dx = dotX - zone.center.x;
          const dy = dotY - zone.center.y;
          if (Math.sqrt(dx * dx + dy * dy) < zone.radius * 1.2) {
            inAvoidZone = true;
            break;
          }
        }

        if (!inAvoidZone) {
          // Vary dot size slightly for organic look
          const size = dotSize * (0.8 + Math.sin(row * 1.3 + col * 2.7) * 0.4);
          this.graphics.circle(dotX, dotY, size);
          this.graphics.fill({ color: this.color, alpha: 0.15 });
        }
      }
    }

    // Draw avoid zone outlines (as clear holes)
    for (const zone of this.avoidZones) {
      // Draw a subtle ring around avoid zone
      this.graphics.circle(zone.center.x, zone.center.y, zone.radius);
      this.graphics.stroke({ color: this.color, width: 1, alpha: 0.3 });

      // Draw "X" or prohibition indicator
      const r = zone.radius * 0.3;
      this.graphics.moveTo(zone.center.x - r, zone.center.y - r);
      this.graphics.lineTo(zone.center.x + r, zone.center.y + r);
      this.graphics.stroke({ color: this.color, width: 1, alpha: 0.2 });

      this.graphics.moveTo(zone.center.x + r, zone.center.y - r);
      this.graphics.lineTo(zone.center.x - r, zone.center.y + r);
      this.graphics.stroke({ color: this.color, width: 1, alpha: 0.2 });
    }
  }

  /**
   * Draw dashed border around the zone
   */
  private drawDashedBorder(x: number, y: number, width: number, height: number): void {
    const dashLength = 8;
    const gapLength = 5;

    // Top edge
    this.drawDashedLine(x, y, x + width, y, dashLength, gapLength);

    // Right edge
    this.drawDashedLine(x + width, y, x + width, y + height, dashLength, gapLength);

    // Bottom edge
    this.drawDashedLine(x + width, y + height, x, y + height, dashLength, gapLength);

    // Left edge
    this.drawDashedLine(x, y + height, x, y, dashLength, gapLength);
  }

  /**
   * Draw a single dashed line
   */
  private drawDashedLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    dashLength: number,
    gapLength: number
  ): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const totalLength = Math.sqrt(dx * dx + dy * dy);
    const segmentLength = dashLength + gapLength;
    const segments = Math.floor(totalLength / segmentLength);

    const nx = dx / totalLength;
    const ny = dy / totalLength;

    for (let i = 0; i < segments; i++) {
      const startDist = i * segmentLength;
      const endDist = startDist + dashLength;

      const startX = x1 + nx * startDist;
      const startY = y1 + ny * startDist;
      const endX = x1 + nx * Math.min(endDist, totalLength);
      const endY = y1 + ny * Math.min(endDist, totalLength);

      this.graphics.moveTo(startX, startY);
      this.graphics.lineTo(endX, endY);
      this.graphics.stroke({ color: this.color, width: 1, alpha: 0.5 });
    }
  }

  /**
   * Draw arrow indicating swipe direction
   */
  private drawSwipeArrow(): void {
    const { x, y, width, height } = this.zoneBounds;
    const centerY = y + height / 2;

    // Draw horizontal arrow across the zone
    const arrowStartX = x + width * 0.15;
    const arrowEndX = x + width * 0.85;
    const arrowSize = 8;

    // Arrow line
    this.arrowGraphics.moveTo(arrowStartX, centerY);
    this.arrowGraphics.lineTo(arrowEndX, centerY);
    this.arrowGraphics.stroke({ color: this.color, width: 2, alpha: 0.4 });

    // Arrow head on right
    this.arrowGraphics.moveTo(arrowEndX, centerY);
    this.arrowGraphics.lineTo(arrowEndX - arrowSize, centerY - arrowSize);
    this.arrowGraphics.stroke({ color: this.color, width: 2, alpha: 0.4 });

    this.arrowGraphics.moveTo(arrowEndX, centerY);
    this.arrowGraphics.lineTo(arrowEndX - arrowSize, centerY + arrowSize);
    this.arrowGraphics.stroke({ color: this.color, width: 2, alpha: 0.4 });

    // Arrow head on left (bidirectional)
    this.arrowGraphics.moveTo(arrowStartX, centerY);
    this.arrowGraphics.lineTo(arrowStartX + arrowSize, centerY - arrowSize);
    this.arrowGraphics.stroke({ color: this.color, width: 2, alpha: 0.4 });

    this.arrowGraphics.moveTo(arrowStartX, centerY);
    this.arrowGraphics.lineTo(arrowStartX + arrowSize, centerY + arrowSize);
    this.arrowGraphics.stroke({ color: this.color, width: 2, alpha: 0.4 });
  }

  /**
   * Get the zone bounds in pixels
   */
  getZoneBounds(): { x: number; y: number; width: number; height: number } {
    return { ...this.zoneBounds };
  }

  /**
   * Get avoid zones in pixels
   */
  getAvoidZones(): { center: { x: number; y: number }; radius: number }[] {
    return this.avoidZones.map(z => ({
      center: { ...z.center },
      radius: z.radius,
    }));
  }

  /**
   * Check if a point is within the dust zone (and not in avoid zones)
   */
  isInZone(x: number, y: number): boolean {
    // Check if in main zone
    const inMainZone =
      x >= this.zoneBounds.x &&
      x <= this.zoneBounds.x + this.zoneBounds.width &&
      y >= this.zoneBounds.y &&
      y <= this.zoneBounds.y + this.zoneBounds.height;

    if (!inMainZone) return false;

    // Check if in avoid zone
    for (const zone of this.avoidZones) {
      const dx = x - zone.center.x;
      const dy = y - zone.center.y;
      if (Math.sqrt(dx * dx + dy * dy) < zone.radius) {
        return false;
      }
    }

    return true;
  }

  /**
   * Mark as complete
   */
  markComplete(): void {
    this.isComplete = true;
  }

  /**
   * Get the dust target
   */
  getTarget(): DustTarget {
    return this.target;
  }

  update(deltaMs: number): void {
    if (!this.animating || this.isComplete) return;

    // Pulse animation: opacity varies +-5% over 3 seconds
    this.pulsePhase += (deltaMs / 3000) * Math.PI * 2;
    if (this.pulsePhase > Math.PI * 2) {
      this.pulsePhase -= Math.PI * 2;
    }

    const pulseOffset = Math.sin(this.pulsePhase) * 0.05;
    this.alpha = this.baseOpacity + pulseOffset;

    // Subtle arrow animation
    this.arrowGraphics.x = Math.sin(this.pulsePhase * 0.5) * 2;
  }

  /**
   * Show zone feedback based on dust result
   */
  showZoneFeedback(zone: PlacementZone): Promise<void> {
    const flashColors: Record<PlacementZone, number> = {
      perfect: 0x4a6741,
      great: 0xb87333,
      good: 0x808080,
      acceptable: 0x808080,
      miss: 0x8b0000,
    };

    const color = flashColors[zone];
    this.animating = false;

    // Flash the zone
    this.graphics.clear();
    this.drawFlashZone(color);

    return new Promise((resolve) => {
      setTimeout(() => {
        this.fadeOut(150).then(resolve);
      }, 200);
    });
  }

  /**
   * Draw flash zone for feedback
   */
  private drawFlashZone(color: number): void {
    const { x, y, width, height } = this.zoneBounds;

    // Draw filled rectangle
    this.graphics.rect(x, y, width, height);
    this.graphics.fill({ color, alpha: 0.15 });
    this.graphics.rect(x, y, width, height);
    this.graphics.stroke({ color, width: 2 });
  }

  fadeOut(duration: number = 150): Promise<void> {
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

        // Ease out
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
