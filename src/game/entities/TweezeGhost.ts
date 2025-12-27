import { Container, Graphics } from 'pixi.js';

export type PlacementZone = 'perfect' | 'great' | 'good' | 'acceptable' | 'miss';

interface TweezeGhostOptions {
  color?: number;
  opacity?: number;
  size?: number;
  showRotation?: boolean;
  rotation?: number;
}

/**
 * TweezeGhost: A minimal crosshair/target marker for tweeze placements.
 *
 * Unlike other ghosts which show the shape of the ingredient, tweeze ghosts
 * are precise markers indicating exact placement positions for delicate elements.
 *
 * Visual design:
 * - Small crosshair (12x12px by default)
 * - Optional rotation guide line
 * - Subtle pulsing animation
 */
export class TweezeGhost extends Container {
  private graphics: Graphics;
  private baseOpacity: number;
  private pulsePhase = 0;
  private animating = true;
  private color: number;
  private size: number;
  private showRotation: boolean;
  private targetRotation: number;

  constructor(options: TweezeGhostOptions = {}) {
    super();

    this.color = options.color ?? 0xB87333; // accent.primary (copper)
    this.baseOpacity = options.opacity ?? 0.6;
    this.size = options.size ?? 12;
    this.showRotation = options.showRotation ?? false;
    this.targetRotation = options.rotation ?? 0;

    this.graphics = new Graphics();
    this.addChild(this.graphics);

    this.drawCrosshair();
    this.alpha = this.baseOpacity;
  }

  /**
   * Draw the crosshair target marker
   */
  private drawCrosshair(): void {
    this.graphics.clear();

    const halfSize = this.size / 2;
    const lineWidth = 1;
    const centerGap = 2; // Gap in center of crosshair

    // Horizontal line (left)
    this.graphics.moveTo(-halfSize, 0);
    this.graphics.lineTo(-centerGap, 0);
    this.graphics.stroke({ color: this.color, width: lineWidth, alpha: 0.9 });

    // Horizontal line (right)
    this.graphics.moveTo(centerGap, 0);
    this.graphics.lineTo(halfSize, 0);
    this.graphics.stroke({ color: this.color, width: lineWidth, alpha: 0.9 });

    // Vertical line (top)
    this.graphics.moveTo(0, -halfSize);
    this.graphics.lineTo(0, -centerGap);
    this.graphics.stroke({ color: this.color, width: lineWidth, alpha: 0.9 });

    // Vertical line (bottom)
    this.graphics.moveTo(0, centerGap);
    this.graphics.lineTo(0, halfSize);
    this.graphics.stroke({ color: this.color, width: lineWidth, alpha: 0.9 });

    // Small center dot
    this.graphics.circle(0, 0, 1.5);
    this.graphics.fill({ color: this.color, alpha: 0.4 });

    // Rotation guide (if enabled)
    if (this.showRotation) {
      this.drawRotationGuide();
    }
  }

  /**
   * Draw a small line indicating required rotation
   */
  private drawRotationGuide(): void {
    const guideLength = this.size * 0.8;
    const angleRad = (this.targetRotation * Math.PI) / 180;

    // Calculate end point of rotation guide
    const endX = Math.cos(angleRad) * guideLength;
    const endY = Math.sin(angleRad) * guideLength;

    // Draw dashed rotation guide
    const dashLength = 3;
    const gapLength = 2;
    const totalLength = guideLength;
    const steps = Math.floor(totalLength / (dashLength + gapLength));

    for (let i = 0; i < steps; i++) {
      const startT = (i * (dashLength + gapLength)) / totalLength;
      const endT = Math.min(1, (i * (dashLength + gapLength) + dashLength) / totalLength);

      const x1 = startT * endX;
      const y1 = startT * endY;
      const x2 = endT * endX;
      const y2 = endT * endY;

      this.graphics.moveTo(x1, y1);
      this.graphics.lineTo(x2, y2);
      this.graphics.stroke({ color: this.color, width: 0.8, alpha: 0.5 });
    }

    // Small arrow head at end
    const arrowSize = 3;
    const arrowAngle = Math.PI / 6; // 30 degrees

    const arrowX1 = endX - arrowSize * Math.cos(angleRad - arrowAngle);
    const arrowY1 = endY - arrowSize * Math.sin(angleRad - arrowAngle);
    const arrowX2 = endX - arrowSize * Math.cos(angleRad + arrowAngle);
    const arrowY2 = endY - arrowSize * Math.sin(angleRad + arrowAngle);

    this.graphics.moveTo(endX, endY);
    this.graphics.lineTo(arrowX1, arrowY1);
    this.graphics.stroke({ color: this.color, width: 0.8, alpha: 0.5 });

    this.graphics.moveTo(endX, endY);
    this.graphics.lineTo(arrowX2, arrowY2);
    this.graphics.stroke({ color: this.color, width: 0.8, alpha: 0.5 });
  }

  /**
   * Update animation
   */
  update(deltaMs: number): void {
    if (!this.animating) return;

    // Pulse animation: opacity varies +-8% over 2 seconds
    this.pulsePhase += (deltaMs / 2000) * Math.PI * 2;
    if (this.pulsePhase > Math.PI * 2) {
      this.pulsePhase -= Math.PI * 2;
    }

    const pulseOffset = Math.sin(this.pulsePhase) * 0.08;
    this.alpha = this.baseOpacity + pulseOffset;
  }

  /**
   * Fade out and remove
   */
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
        const eased = 1 - Math.pow(1 - progress, 2); // Ease out

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

  /**
   * Flash a color then fade out (for feedback)
   */
  flashColor(flashColor: number, duration: number = 150): Promise<void> {
    return new Promise((resolve) => {
      this.animating = false;

      // Redraw with new color
      const originalColor = this.color;
      this.color = flashColor;
      this.graphics.clear();
      this.drawCrosshairSolid(flashColor);
      this.alpha = 1;

      // After flash, fade out
      setTimeout(() => {
        this.color = originalColor;
        this.fadeOut(100).then(resolve);
      }, duration);
    });
  }

  /**
   * Draw solid crosshair (for flash effect)
   */
  private drawCrosshairSolid(color: number): void {
    const halfSize = this.size / 2 + 2; // Slightly larger for flash
    const lineWidth = 2;

    // Horizontal line
    this.graphics.moveTo(-halfSize, 0);
    this.graphics.lineTo(halfSize, 0);
    this.graphics.stroke({ color, width: lineWidth, alpha: 1 });

    // Vertical line
    this.graphics.moveTo(0, -halfSize);
    this.graphics.lineTo(0, halfSize);
    this.graphics.stroke({ color, width: lineWidth, alpha: 1 });

    // Center dot
    this.graphics.circle(0, 0, 2);
    this.graphics.fill({ color, alpha: 0.8 });
  }

  /**
   * Show zone-based feedback
   */
  showZoneFeedback(zone: PlacementZone): Promise<void> {
    switch (zone) {
      case 'perfect':
        return this.flashColor(0x4A6741, 150); // Green
      case 'great':
        return this.flashColor(0xB87333, 120); // Copper
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

  /**
   * Stop pulsing animation
   */
  stopAnimation(): void {
    this.animating = false;
  }

  /**
   * Start pulsing animation
   */
  startAnimation(): void {
    this.animating = true;
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.graphics.destroy();
    super.destroy();
  }
}
