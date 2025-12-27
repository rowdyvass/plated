/**
 * TexturedGhost - A ghost/target indicator that shows the actual ingredient texture
 *
 * Unlike the simple dashed outline Ghost, this displays the ingredient's
 * visual representation at reduced opacity with a subtle outline effect.
 */

import { Container, Sprite, Graphics, Texture, ColorMatrixFilter } from 'pixi.js';
import { getIngredientTexture, getCachedTexture } from '../textures';
import type { PlacementZone } from './Ghost';

interface TexturedGhostOptions {
  /** The ingredient ID to display */
  ingredientId: string;
  /** Pre-loaded texture (optional - will load if not provided) */
  texture?: Texture;
  /** Base opacity for the ghost (default: 0.35) */
  opacity?: number;
  /** Accent color for outline effect (default: copper) */
  color?: number;
  /** Scale of the ingredient */
  scale?: number;
}

export class TexturedGhost extends Container {
  private sprite: Sprite | null = null;
  private outlineGraphics: Graphics;
  private baseOpacity: number;
  private pulsePhase = 0;
  private animating = true;
  private ingredientId: string;
  private accentColor: number;
  private ingredientScale: number;

  constructor(options: TexturedGhostOptions) {
    super();

    this.ingredientId = options.ingredientId;
    this.baseOpacity = options.opacity ?? 0.35;
    this.accentColor = options.color ?? 0xb87333;
    this.ingredientScale = options.scale ?? 1;

    // Create outline graphics (drawn behind sprite)
    this.outlineGraphics = new Graphics();
    this.addChild(this.outlineGraphics);

    // Set up the sprite
    if (options.texture) {
      this.setupSprite(options.texture);
    } else {
      // Try to get cached texture, or load async
      const cached = getCachedTexture(options.ingredientId, 'plate');
      if (cached) {
        this.setupSprite(cached);
      } else {
        this.loadTexture();
      }
    }

    this.alpha = this.baseOpacity;
  }

  private async loadTexture(): Promise<void> {
    const texture = await getIngredientTexture(this.ingredientId, 'plate');
    if (texture && !this.destroyed) {
      this.setupSprite(texture);
    }
  }

  private setupSprite(texture: Texture): void {
    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(this.ingredientScale);

    // Apply desaturation filter for ghost effect
    const colorMatrix = new ColorMatrixFilter();
    colorMatrix.desaturate();
    this.sprite.filters = [colorMatrix];

    this.addChild(this.sprite);

    // Draw subtle dashed outline around the sprite bounds
    this.drawOutline();
  }

  private drawOutline(): void {
    if (!this.sprite) return;

    this.outlineGraphics.clear();

    const bounds = this.sprite.getLocalBounds();
    const padding = 4;
    const width = bounds.width * this.ingredientScale + padding * 2;
    const height = bounds.height * this.ingredientScale + padding * 2;
    const radius = Math.min(width, height) * 0.15;

    // Draw dashed rounded rect outline
    const dashLength = 4;
    const gapLength = 3;
    const strokeWidth = 1.5;

    // Draw subtle fill
    this.outlineGraphics.roundRect(-width / 2, -height / 2, width, height, radius);
    this.outlineGraphics.fill({ color: this.accentColor, alpha: 0.05 });

    // Draw dashes along the perimeter
    this.drawDashedRoundRect(-width / 2, -height / 2, width, height, radius, dashLength, gapLength, strokeWidth);
  }

  private drawDashedRoundRect(
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    dashLength: number,
    gapLength: number,
    strokeWidth: number
  ): void {
    const straightH = width - 2 * radius;
    const straightV = height - 2 * radius;
    const cornerArc = (Math.PI / 2) * radius;
    const totalPerimeter = 2 * straightH + 2 * straightV + 4 * cornerArc;

    const segmentLength = dashLength + gapLength;
    const numDashes = Math.floor(totalPerimeter / segmentLength);
    const actualSegmentLength = totalPerimeter / numDashes;
    const actualDashLength = actualSegmentLength * (dashLength / segmentLength);

    // Sections of the rounded rect
    const sections = [
      { type: 'line' as const, length: straightH, x1: x + radius, y1: y, x2: x + width - radius, y2: y },
      { type: 'arc' as const, length: cornerArc, cx: x + width - radius, cy: y + radius, r: radius, startAngle: -Math.PI / 2, endAngle: 0 },
      { type: 'line' as const, length: straightV, x1: x + width, y1: y + radius, x2: x + width, y2: y + height - radius },
      { type: 'arc' as const, length: cornerArc, cx: x + width - radius, cy: y + height - radius, r: radius, startAngle: 0, endAngle: Math.PI / 2 },
      { type: 'line' as const, length: straightH, x1: x + width - radius, y1: y + height, x2: x + radius, y2: y + height },
      { type: 'arc' as const, length: cornerArc, cx: x + radius, cy: y + height - radius, r: radius, startAngle: Math.PI / 2, endAngle: Math.PI },
      { type: 'line' as const, length: straightV, x1: x, y1: y + height - radius, x2: x, y2: y + radius },
      { type: 'arc' as const, length: cornerArc, cx: x + radius, cy: y + radius, r: radius, startAngle: Math.PI, endAngle: Math.PI * 1.5 },
    ];

    for (let i = 0; i < numDashes; i++) {
      const startDist = i * actualSegmentLength;
      const endDist = startDist + actualDashLength;
      this.drawDashOnPerimeter(sections, startDist, endDist, strokeWidth);
    }
  }

  private drawDashOnPerimeter(
    sections: Array<{
      type: 'line' | 'arc';
      length: number;
      x1?: number;
      y1?: number;
      x2?: number;
      y2?: number;
      cx?: number;
      cy?: number;
      r?: number;
      startAngle?: number;
      endAngle?: number;
    }>,
    startDist: number,
    endDist: number,
    strokeWidth: number
  ): void {
    let currentDist = 0;

    for (const section of sections) {
      const sectionStart = currentDist;
      const sectionEnd = currentDist + section.length;

      if (startDist < sectionEnd && endDist > sectionStart) {
        const dashStartInSection = Math.max(0, startDist - sectionStart);
        const dashEndInSection = Math.min(section.length, endDist - sectionStart);

        if (section.type === 'line' && section.x1 !== undefined) {
          const t1 = dashStartInSection / section.length;
          const t2 = dashEndInSection / section.length;

          const px1 = section.x1 + (section.x2! - section.x1) * t1;
          const py1 = section.y1! + (section.y2! - section.y1!) * t1;
          const px2 = section.x1 + (section.x2! - section.x1) * t2;
          const py2 = section.y1! + (section.y2! - section.y1!) * t2;

          this.outlineGraphics.moveTo(px1, py1);
          this.outlineGraphics.lineTo(px2, py2);
          this.outlineGraphics.stroke({ color: this.accentColor, width: strokeWidth, alpha: 0.6 });
        } else if (section.type === 'arc' && section.cx !== undefined) {
          const angleRange = section.endAngle! - section.startAngle!;
          const t1 = dashStartInSection / section.length;
          const t2 = dashEndInSection / section.length;

          const angle1 = section.startAngle! + angleRange * t1;
          const angle2 = section.startAngle! + angleRange * t2;

          this.outlineGraphics.arc(section.cx, section.cy!, section.r!, angle1, angle2);
          this.outlineGraphics.stroke({ color: this.accentColor, width: strokeWidth, alpha: 0.6 });
        }
      }

      currentDist = sectionEnd;
    }
  }

  update(deltaMs: number): void {
    if (!this.animating) return;

    // Subtle pulse animation
    this.pulsePhase += (deltaMs / 2500) * Math.PI * 2;
    if (this.pulsePhase > Math.PI * 2) {
      this.pulsePhase -= Math.PI * 2;
    }

    const pulseOffset = Math.sin(this.pulsePhase) * 0.08;
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

      // Apply tint to sprite
      if (this.sprite) {
        this.sprite.tint = flashColor;
      }
      this.alpha = 0.8;

      setTimeout(() => {
        if (this.sprite) {
          this.sprite.tint = 0xffffff;
        }
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
