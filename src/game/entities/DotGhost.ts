import { Container, Graphics } from 'pixi.js';
import type { PlacementZone } from './Ghost';

interface DotGhostOptions {
  positions: { x: number; y: number }[];  // Normalized positions (-1 to 1)
  plateRadius: number;
  dotSize?: number;
  color?: number;
  opacity?: number;
  strokeWidth?: number;
}

/**
 * DotGhost renders multiple small circle targets for dot placement.
 * Each dot position shows a hollow circle where the player should tap.
 */
export class DotGhost extends Container {
  private graphics: Graphics;
  private baseOpacity: number;
  private pulsePhase = 0;
  private animating = true;
  private color: number;
  private strokeWidth: number;
  private dotSize: number;
  private plateRadius: number;

  // Track which dots have been placed
  private positions: { x: number; y: number }[];
  private placedDots: boolean[];
  private dotGraphics: Graphics[];

  constructor(options: DotGhostOptions) {
    super();

    this.positions = options.positions;
    this.plateRadius = options.plateRadius;
    this.color = options.color ?? 0xb87333; // accent.primary
    this.baseOpacity = options.opacity ?? 0.6;
    this.strokeWidth = options.strokeWidth ?? 1;
    this.dotSize = options.dotSize ?? 8;

    // Initialize tracking
    this.placedDots = new Array(this.positions.length).fill(false);
    this.dotGraphics = [];

    this.graphics = new Graphics();
    this.addChild(this.graphics);

    this.drawDots();
    this.alpha = this.baseOpacity;
  }

  /**
   * Get a contrasting color for the outline shadow.
   */
  private getContrastColor(color: number): number {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? 0x3d3d3d : 0xffffff;
  }

  private drawDots(): void {
    const contrastColor = this.getContrastColor(this.color);

    // Create individual graphics for each dot so they can be hidden independently
    for (let i = 0; i < this.positions.length; i++) {
      const pos = this.positions[i];
      const dotGraphic = new Graphics();

      // Convert normalized position to pixels
      const x = pos.x * this.plateRadius;
      const y = pos.y * this.plateRadius;

      // Draw contrasting shadow for visibility
      dotGraphic.circle(x, y, this.dotSize);
      dotGraphic.stroke({ color: contrastColor, width: this.strokeWidth + 2, alpha: 0.25 });

      // Draw hollow circle (stroke only)
      dotGraphic.circle(x, y, this.dotSize);
      dotGraphic.stroke({ color: this.color, width: this.strokeWidth });

      // Add subtle fill
      dotGraphic.circle(x, y, this.dotSize);
      dotGraphic.fill({ color: this.color, alpha: 0.05 });

      this.addChild(dotGraphic);
      this.dotGraphics.push(dotGraphic);
    }
  }

  /**
   * Mark a dot as placed by index.
   * Note: Does NOT hide the dot graphic - showDotFeedback handles that after visual feedback.
   */
  markDotPlaced(dotIndex: number): void {
    if (dotIndex >= 0 && dotIndex < this.placedDots.length) {
      this.placedDots[dotIndex] = true;
    }
  }

  /**
   * Get the position of a specific dot index in pixel coordinates
   */
  getDotPosition(index: number): { x: number; y: number } | null {
    if (index < 0 || index >= this.positions.length) return null;

    const pos = this.positions[index];
    return {
      x: pos.x * this.plateRadius,
      y: pos.y * this.plateRadius,
    };
  }

  /**
   * Get the closest unplaced dot target
   */
  getClosestUnplacedDot(x: number, y: number): {
    index: number;
    position: { x: number; y: number };
    distance: number;
  } | null {
    let closestIndex = -1;
    let closestDistance = Infinity;

    for (let i = 0; i < this.positions.length; i++) {
      if (this.placedDots[i]) continue;

      const pos = this.positions[i];
      const targetX = pos.x * this.plateRadius;
      const targetY = pos.y * this.plateRadius;

      const dx = x - targetX;
      const dy = y - targetY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    if (closestIndex < 0) return null;

    return {
      index: closestIndex,
      position: {
        x: this.positions[closestIndex].x * this.plateRadius,
        y: this.positions[closestIndex].y * this.plateRadius,
      },
      distance: closestDistance,
    };
  }

  /**
   * Get count of remaining (unplaced) dots
   */
  getRemainingCount(): number {
    return this.placedDots.filter(placed => !placed).length;
  }

  /**
   * Check if all dots have been placed
   */
  isComplete(): boolean {
    return this.placedDots.every(placed => placed);
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

  /**
   * Show zone feedback for a specific dot
   */
  showDotFeedback(dotIndex: number, zone: PlacementZone): Promise<void> {
    if (dotIndex < 0 || dotIndex >= this.dotGraphics.length) {
      return Promise.resolve();
    }

    const dotGraphic = this.dotGraphics[dotIndex];
    if (!dotGraphic || dotGraphic.destroyed) return Promise.resolve();

    // Flash color based on zone
    const flashColors: Record<PlacementZone, number> = {
      perfect: 0x4a6741,
      great: 0xb87333,
      good: 0x808080,
      acceptable: 0x808080,
      miss: 0x8b0000,
    };

    const color = flashColors[zone];
    const pos = this.positions[dotIndex];
    const x = pos.x * this.plateRadius;
    const y = pos.y * this.plateRadius;

    // Redraw with flash color
    dotGraphic.clear();
    dotGraphic.circle(x, y, this.dotSize * 1.2);
    dotGraphic.fill({ color, alpha: 0.3 });
    dotGraphic.circle(x, y, this.dotSize * 1.2);
    dotGraphic.stroke({ color, width: 2 });

    // Fade out after flash
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!dotGraphic.destroyed) {
          dotGraphic.visible = false;
        }
        resolve();
      }, 150);
    });
  }

  /**
   * Show zone feedback for all remaining dots (e.g., when completing the dish)
   */
  showZoneFeedback(_zone: PlacementZone): Promise<void> {
    this.animating = false;

    // Just fade out all remaining visible dots
    return this.fadeOut(100);
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
