import { Container, Graphics } from 'pixi.js';
import type { PlacementZone } from './Ghost';

interface ScatterGhostOptions {
  zone: {
    center: { x: number; y: number };
    radius: number;  // As fraction of plate radius
  };
  plateRadius: number;
  idealCount: number;
  color?: number;
  opacity?: number;
  strokeWidth?: number;
}

/**
 * ScatterGhost renders a soft, organic zone boundary for scatter gestures.
 * Shows a dashed boundary with faint dots inside suggesting distribution.
 */
export class ScatterGhost extends Container {
  private graphics: Graphics;
  private dotGraphics: Graphics;
  private baseOpacity: number;
  private pulsePhase = 0;
  private animating = true;
  private color: number;
  private strokeWidth: number;
  private zoneCenter: { x: number; y: number };
  private zoneRadius: number;
  private idealCount: number;

  // Track completion
  private isComplete = false;

  constructor(options: ScatterGhostOptions) {
    super();

    this.zoneCenter = {
      x: options.zone.center.x * options.plateRadius,
      y: options.zone.center.y * options.plateRadius,
    };
    this.zoneRadius = options.zone.radius * options.plateRadius;
    this.idealCount = options.idealCount;
    this.color = options.color ?? 0xb87333;
    this.baseOpacity = options.opacity ?? 0.5;
    this.strokeWidth = options.strokeWidth ?? 1;

    this.graphics = new Graphics();
    this.dotGraphics = new Graphics();
    this.addChild(this.graphics);
    this.addChild(this.dotGraphics);

    this.drawZone();
    this.drawSuggestedDots();
    this.alpha = this.baseOpacity;
  }

  /**
   * Draw the organic zone boundary
   */
  private drawZone(): void {
    const cx = this.zoneCenter.x;
    const cy = this.zoneCenter.y;
    const radius = this.zoneRadius;

    // Draw subtle fill with organic wobble
    this.drawOrganicCircle(cx, cy, radius, true);

    // Draw dashed outline with organic wobble
    this.drawDashedOrganicCircle(cx, cy, radius);
  }

  /**
   * Draw an organic (slightly wobbly) circle
   */
  private drawOrganicCircle(cx: number, cy: number, radius: number, fill: boolean): void {
    const points = 32;
    const wobbleAmount = radius * 0.08; // 8% wobble

    // Generate wobble offsets (consistent per ghost)
    const wobbles: number[] = [];
    for (let i = 0; i < points; i++) {
      // Use sine waves for smooth wobble
      wobbles.push(
        Math.sin(i * 0.7) * 0.4 +
        Math.sin(i * 1.3) * 0.3 +
        Math.sin(i * 2.1) * 0.3
      );
    }

    if (fill) {
      this.graphics.moveTo(
        cx + (radius + wobbles[0] * wobbleAmount) * Math.cos(0),
        cy + (radius + wobbles[0] * wobbleAmount) * Math.sin(0)
      );

      for (let i = 1; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const wobble = wobbles[i % points] * wobbleAmount;
        const r = radius + wobble;

        this.graphics.lineTo(
          cx + r * Math.cos(angle),
          cy + r * Math.sin(angle)
        );
      }

      this.graphics.closePath();
      this.graphics.fill({ color: this.color, alpha: 0.05 });
    }
  }

  /**
   * Draw a dashed organic circle outline
   */
  private drawDashedOrganicCircle(cx: number, cy: number, radius: number): void {
    const dashLength = 8;
    const gapLength = 6;
    const circumference = 2 * Math.PI * radius;
    const segmentLength = dashLength + gapLength;
    const segments = Math.floor(circumference / segmentLength);
    const actualSegmentAngle = (2 * Math.PI) / segments;
    const dashAngle = actualSegmentAngle * (dashLength / segmentLength);

    const wobbleAmount = radius * 0.08;

    for (let i = 0; i < segments; i++) {
      const startAngle = i * actualSegmentAngle;
      const endAngle = startAngle + dashAngle;

      // Add subtle wobble to each dash
      const wobble1 = Math.sin(startAngle * 3) * wobbleAmount * 0.5;
      const wobble2 = Math.sin(endAngle * 3) * wobbleAmount * 0.5;

      const r1 = radius + wobble1;
      const r2 = radius + wobble2;

      const x1 = cx + r1 * Math.cos(startAngle);
      const y1 = cy + r1 * Math.sin(startAngle);
      const x2 = cx + r2 * Math.cos(endAngle);
      const y2 = cy + r2 * Math.sin(endAngle);

      this.graphics.moveTo(x1, y1);
      this.graphics.lineTo(x2, y2);
      this.graphics.stroke({ color: this.color, width: this.strokeWidth });
    }
  }

  /**
   * Draw faint dots inside the zone to suggest distribution
   */
  private drawSuggestedDots(): void {
    const cx = this.zoneCenter.x;
    const cy = this.zoneCenter.y;
    const radius = this.zoneRadius;

    // Generate semi-random positions using golden angle
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const dotCount = Math.min(this.idealCount, 12); // Cap at 12 suggestion dots

    for (let i = 0; i < dotCount; i++) {
      const angle = i * goldenAngle;
      const distRatio = Math.sqrt((i + 0.5) / dotCount) * 0.8; // Sunflower pattern
      const dist = distRatio * radius;

      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;

      // Draw small faint dot
      this.dotGraphics.circle(x, y, 3);
      this.dotGraphics.fill({ color: this.color, alpha: 0.15 });
    }
  }

  /**
   * Get the zone center in plate coordinates
   */
  getZoneCenter(): { x: number; y: number } {
    return { ...this.zoneCenter };
  }

  /**
   * Get the zone radius in pixels
   */
  getZoneRadius(): number {
    return this.zoneRadius;
  }

  /**
   * Check if a point is within the zone
   */
  isInZone(x: number, y: number): boolean {
    const dx = x - this.zoneCenter.x;
    const dy = y - this.zoneCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= this.zoneRadius;
  }

  /**
   * Mark as complete (after scatter is done)
   */
  markComplete(): void {
    this.isComplete = true;
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
  }

  /**
   * Show zone feedback based on scatter result
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
        this.fadeOut(100).then(resolve);
      }, 150);
    });
  }

  /**
   * Draw flash zone for feedback
   */
  private drawFlashZone(color: number): void {
    const cx = this.zoneCenter.x;
    const cy = this.zoneCenter.y;
    const radius = this.zoneRadius;

    // Draw solid fill
    this.graphics.circle(cx, cy, radius);
    this.graphics.fill({ color, alpha: 0.2 });
    this.graphics.circle(cx, cy, radius);
    this.graphics.stroke({ color, width: 2 });
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
