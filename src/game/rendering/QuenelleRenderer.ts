import { Graphics, Container } from 'pixi.js';
import type { TouchPoint, TouchPath } from '@/types/gestures';

interface QuenelleRenderOptions {
  length?: number;
  width?: number;
  alpha?: number;
}

/**
 * Renders quenelle shapes - the elegant three-sided scooped forms.
 * Used for both real-time rendering during gestures and final settled quenelles.
 */
export class QuenelleRenderer {
  private container: Container;
  private graphics: Graphics;

  constructor(parent: Container) {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    parent.addChild(this.container);
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
   * Render a quenelle shape at a specific position
   */
  renderQuenelle(
    position: { x: number; y: number },
    rotation: number,
    color: number,
    progress: number = 1,
    options: QuenelleRenderOptions = {}
  ): void {
    const {
      length = 40,
      width = 18,
      alpha = 0.9,
    } = options;

    this.graphics.clear();

    // Scale based on progress
    const currentLength = length * progress;
    const currentWidth = width * progress;
    const currentAlpha = alpha * Math.min(1, progress * 1.5);

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const cx = position.x;
    const cy = position.y;

    // Subtle shadow (only when mostly formed)
    if (progress > 0.5) {
      const shadowAlpha = (progress - 0.5) * 0.2;
      this.drawQuenelleShapeTransformed(
        cx, cy, cos, sin,
        { x: 2, y: 3 },
        currentLength,
        currentWidth,
        0x000000,
        shadowAlpha
      );
    }

    // Main quenelle body
    this.drawQuenelleShapeTransformed(
      cx, cy, cos, sin,
      { x: 0, y: 0 },
      currentLength,
      currentWidth,
      color,
      currentAlpha
    );

    // Ridge highlight (the distinctive top ridge of a quenelle)
    if (progress > 0.3) {
      const highlightAlpha = (progress - 0.3) * 0.5;
      const r0 = this.transformPoint(-currentLength / 3, -currentWidth / 6, cx, cy, cos, sin);
      const r1 = this.transformPoint(0, -currentWidth / 4, cx, cy, cos, sin);
      const r2 = this.transformPoint(currentLength / 4, -currentWidth / 5, cx, cy, cos, sin);
      const r3 = this.transformPoint(currentLength / 3, 0, cx, cy, cos, sin);

      this.graphics.moveTo(r0.x, r0.y);
      this.graphics.bezierCurveTo(r1.x, r1.y, r2.x, r2.y, r3.x, r3.y);
      this.graphics.stroke({ color: 0xffffff, width: 1.5, alpha: highlightAlpha });
    }

    // Specular highlight (small bright spot)
    if (progress > 0.6) {
      const specularAlpha = (progress - 0.6) * 0.6;
      const spec = this.transformPoint(-currentLength / 6, -currentWidth / 5, cx, cy, cos, sin);
      this.graphics.circle(spec.x, spec.y, 3 * progress);
      this.graphics.fill({ color: 0xffffff, alpha: specularAlpha });
    }
  }

  /**
   * Draw the classic quenelle shape with transformation
   */
  private drawQuenelleShapeTransformed(
    cx: number,
    cy: number,
    cos: number,
    sin: number,
    offset: { x: number; y: number },
    length: number,
    width: number,
    color: number,
    alpha: number
  ): void {
    const halfLen = length / 2;

    // Transform all points
    const p0 = this.transformPoint(offset.x - halfLen, offset.y, cx, cy, cos, sin);
    const p1 = this.transformPoint(offset.x - halfLen * 0.5, offset.y - width * 0.45, cx, cy, cos, sin);
    const p2 = this.transformPoint(offset.x + halfLen * 0.5, offset.y - width * 0.45, cx, cy, cos, sin);
    const p3 = this.transformPoint(offset.x + halfLen, offset.y, cx, cy, cos, sin);
    const p4 = this.transformPoint(offset.x + halfLen * 0.5, offset.y + width * 0.55, cx, cy, cos, sin);
    const p5 = this.transformPoint(offset.x - halfLen * 0.5, offset.y + width * 0.55, cx, cy, cos, sin);

    // Quenelle shape: elongated three-sided form with tapered ends
    this.graphics.moveTo(p0.x, p0.y);

    // Top curve (slightly flatter for the ridge effect)
    this.graphics.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);

    // Bottom curve (rounder)
    this.graphics.bezierCurveTo(p4.x, p4.y, p5.x, p5.y, p0.x, p0.y);

    this.graphics.closePath();
    this.graphics.fill({ color, alpha });
  }

  /**
   * Render the quenelle forming during the gesture
   * Shows the shape gradually taking form as the pause happens
   */
  renderForming(
    path: TouchPath,
    pausePosition: { x: number; y: number } | null,
    rotation: number,
    color: number,
    formProgress: number
  ): void {
    this.graphics.clear();

    const points = path.points;
    if (points.length < 2) return;

    // Draw the arc trail showing the scooping motion
    this.drawScoopTrail(points, color, 0.5);

    // Draw the forming quenelle at pause position
    if (pausePosition && formProgress > 0) {
      this.renderQuenelle(pausePosition, rotation, color, formProgress, {
        length: 35,
        width: 15,
        alpha: 0.85,
      });
    }
  }

  /**
   * Draw the scooping trail during gesture
   */
  private drawScoopTrail(
    points: TouchPoint[],
    color: number,
    alpha: number
  ): void {
    if (points.length < 2) return;

    // Draw with variable thickness showing the scoop motion
    const startThickness = 4;
    const endThickness = 8;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const t = i / (points.length - 1);
      const thickness = startThickness + (endThickness - startThickness) * t;
      const segmentAlpha = alpha * (0.3 + t * 0.7); // Fade in along path

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len < 0.01) continue;

      const nx = -dy / len;
      const ny = dx / len;

      // Draw segment as a quad
      this.graphics.moveTo(p1.x + nx * thickness / 2, p1.y + ny * thickness / 2);
      this.graphics.lineTo(p1.x - nx * thickness / 2, p1.y - ny * thickness / 2);
      this.graphics.lineTo(p2.x - nx * thickness / 2, p2.y - ny * thickness / 2);
      this.graphics.lineTo(p2.x + nx * thickness / 2, p2.y + ny * thickness / 2);
      this.graphics.closePath();
      this.graphics.fill({ color, alpha: segmentAlpha });
    }
  }

  /**
   * Render the final settled quenelle
   */
  renderFinal(
    position: { x: number; y: number },
    rotation: number,
    color: number,
    options: QuenelleRenderOptions = {}
  ): void {
    this.renderQuenelle(position, rotation, color, 1, {
      length: 40,
      width: 18,
      alpha: 0.9,
      ...options,
    });
  }

  /**
   * Render settle animation after gesture ends
   */
  renderSettle(
    position: { x: number; y: number },
    rotation: number,
    color: number,
    settleProgress: number
  ): void {
    // During settle, the quenelle "settles" slightly - minimal scale change
    const scaleFactor = 1 + (1 - settleProgress) * 0.05;

    this.renderQuenelle(position, rotation, color, 1, {
      length: 40 * scaleFactor,
      width: 18 * scaleFactor,
      alpha: 0.9,
    });
  }

  /**
   * Clear the renderer
   */
  clear(): void {
    this.graphics.clear();
  }

  /**
   * Destroy the renderer and clean up
   */
  destroy(): void {
    this.container.destroy({ children: true });
  }
}
