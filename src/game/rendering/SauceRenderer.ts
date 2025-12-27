import { Graphics, Container } from 'pixi.js';
import type { TouchPoint, TouchPath } from '@/types/gestures';

interface SwooshRenderOptions {
  startThickness?: number;
  endThickness?: number;
  alpha?: number;
  featherEdge?: boolean;
}

/**
 * Renders sauce effects like swooshes, drizzles, and dots.
 * Used for both real-time rendering during gestures and final settled sauce.
 */
export class SauceRenderer {
  private container: Container;
  private graphics: Graphics;
  private settleGraphics: Graphics | null = null;

  constructor(parent: Container) {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    parent.addChild(this.container);
  }

  /**
   * Render a swoosh stroke in real-time as the user draws
   */
  renderSwoosh(
    path: TouchPoint[],
    color: number,
    progress: number = 1,
    options: SwooshRenderOptions = {}
  ): void {
    const {
      startThickness = 10,
      endThickness = 3,
      alpha = 0.85,
      featherEdge = true,
    } = options;

    this.graphics.clear();

    if (path.length < 2) return;

    // Smooth the path
    const smoothedPoints = this.smoothPath(path, 3);

    // Determine how many points to draw based on progress
    const pointsToDraw = Math.max(2, Math.floor(smoothedPoints.length * progress));
    const drawPoints = smoothedPoints.slice(0, pointsToDraw);

    // Draw the tapered stroke
    this.drawTaperedStroke(this.graphics, drawPoints, color, startThickness, endThickness, alpha, featherEdge);
  }

  /**
   * Render the settling animation after gesture ends
   */
  renderSettle(
    path: TouchPoint[],
    color: number,
    settleProgress: number,
    options: SwooshRenderOptions = {}
  ): void {
    const {
      startThickness = 10,
      endThickness = 3,
      alpha = 0.85,
    } = options;

    this.graphics.clear();

    if (path.length < 2) return;

    // Smooth the path
    const smoothedPoints = this.smoothPath(path, 3);

    // During settle, slightly spread the sauce (subtle effect)
    const spreadFactor = 1 + settleProgress * 0.03;
    const thicknessBoost = 1 + settleProgress * 0.1;

    // Apply spread to points (relative to path center)
    const centerX = smoothedPoints.reduce((sum, p) => sum + p.x, 0) / smoothedPoints.length;
    const centerY = smoothedPoints.reduce((sum, p) => sum + p.y, 0) / smoothedPoints.length;

    const settledPoints = smoothedPoints.map(p => ({
      ...p,
      x: centerX + (p.x - centerX) * spreadFactor,
      y: centerY + (p.y - centerY) * spreadFactor,
    }));

    // Draw with slightly increased thickness
    this.drawTaperedStroke(
      this.graphics,
      settledPoints,
      color,
      startThickness * thicknessBoost,
      endThickness * thicknessBoost,
      alpha,
      true
    );
  }

  /**
   * Draw the final settled sauce (no animation)
   */
  renderFinal(
    path: TouchPoint[],
    color: number,
    options: SwooshRenderOptions = {}
  ): void {
    const {
      startThickness = 10,
      endThickness = 3,
      alpha = 0.85,
    } = options;

    this.graphics.clear();

    if (path.length < 2) return;

    const smoothedPoints = this.smoothPath(path, 3);

    // Add slight spread for settled appearance
    const spreadFactor = 1.03;
    const centerX = smoothedPoints.reduce((sum, p) => sum + p.x, 0) / smoothedPoints.length;
    const centerY = smoothedPoints.reduce((sum, p) => sum + p.y, 0) / smoothedPoints.length;

    const settledPoints = smoothedPoints.map(p => ({
      ...p,
      x: centerX + (p.x - centerX) * spreadFactor,
      y: centerY + (p.y - centerY) * spreadFactor,
    }));

    this.drawTaperedStroke(
      this.graphics,
      settledPoints,
      color,
      startThickness * 1.1,
      endThickness * 1.1,
      alpha,
      true
    );
  }

  /**
   * Clear the renderer
   */
  clear(): void {
    this.graphics.clear();
    if (this.settleGraphics) {
      this.settleGraphics.clear();
    }
  }

  /**
   * Destroy the renderer and clean up
   */
  destroy(): void {
    this.container.destroy({ children: true });
  }

  /**
   * Draw a stroke that tapers from thick at start to thin at end
   */
  private drawTaperedStroke(
    graphics: Graphics,
    points: TouchPoint[],
    color: number,
    startThickness: number,
    endThickness: number,
    alpha: number,
    featherEdge: boolean
  ): void {
    if (points.length < 2) return;

    // Generate quads for the tapered stroke
    const quads: {
      x1: number; y1: number;
      x2: number; y2: number;
      x3: number; y3: number;
      x4: number; y4: number;
    }[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      // Calculate progress along the path
      const t1 = i / (points.length - 1);
      const t2 = (i + 1) / (points.length - 1);

      // Calculate thickness at each point with slight easing
      const ease1 = this.easeOutQuad(t1);
      const ease2 = this.easeOutQuad(t2);
      const thickness1 = startThickness + (endThickness - startThickness) * ease1;
      const thickness2 = startThickness + (endThickness - startThickness) * ease2;

      // Calculate perpendicular direction
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len < 0.01) continue;

      const nx = -dy / len;
      const ny = dx / len;

      // Calculate quad corners
      quads.push({
        x1: p1.x + nx * thickness1 / 2,
        y1: p1.y + ny * thickness1 / 2,
        x2: p1.x - nx * thickness1 / 2,
        y2: p1.y - ny * thickness1 / 2,
        x3: p2.x - nx * thickness2 / 2,
        y3: p2.y - ny * thickness2 / 2,
        x4: p2.x + nx * thickness2 / 2,
        y4: p2.y + ny * thickness2 / 2,
      });
    }

    // Draw each quad as a filled polygon
    for (const quad of quads) {
      graphics.moveTo(quad.x1, quad.y1);
      graphics.lineTo(quad.x2, quad.y2);
      graphics.lineTo(quad.x3, quad.y3);
      graphics.lineTo(quad.x4, quad.y4);
      graphics.closePath();
      graphics.fill({ color, alpha });
    }

    // Add feathered edge effect (slightly lighter outer edge)
    if (featherEdge && quads.length > 0) {
      const edgeAlpha = alpha * 0.3;
      for (const quad of quads) {
        graphics.moveTo(quad.x1, quad.y1);
        graphics.lineTo(quad.x4, quad.y4);
        graphics.stroke({ color, width: 1, alpha: edgeAlpha });
        graphics.moveTo(quad.x2, quad.y2);
        graphics.lineTo(quad.x3, quad.y3);
        graphics.stroke({ color, width: 1, alpha: edgeAlpha });
      }
    }

    // Add a rounded start cap
    if (points.length > 0) {
      const firstPoint = points[0];
      graphics.circle(firstPoint.x, firstPoint.y, startThickness / 2);
      graphics.fill({ color, alpha });
    }

    // Add a tapered end point
    if (points.length > 1) {
      const lastPoint = points[points.length - 1];
      graphics.circle(lastPoint.x, lastPoint.y, endThickness / 2);
      graphics.fill({ color, alpha });
    }
  }

  /**
   * Smooth a path by averaging nearby points
   */
  private smoothPath(points: TouchPoint[], windowSize: number = 3): TouchPoint[] {
    if (points.length < windowSize) return points;

    return points.map((point, i) => {
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
  }

  /**
   * Easing function for thickness tapering
   */
  private easeOutQuad(t: number): number {
    return 1 - (1 - t) * (1 - t);
  }

  /**
   * Render a sauce dot with soft edges and specular highlight
   */
  renderDot(
    position: { x: number; y: number },
    color: number,
    size: number,
    progress: number = 1
  ): void {
    this.graphics.clear();

    const alpha = 0.9;

    // Animate: slight spread on land (size * 1.1 over initial progress, then settle)
    let animatedSize: number;
    if (progress < 0.3) {
      // Spread phase (0 to 0.3) - grow to 1.1x
      const spreadProgress = progress / 0.3;
      animatedSize = size * (1 + 0.1 * spreadProgress);
    } else {
      // Settle phase (0.3 to 1.0) - shrink back to 1.0x
      const settleProgress = (progress - 0.3) / 0.7;
      animatedSize = size * (1.1 - 0.1 * settleProgress);
    }

    // Soft outer edge (draw first, behind main dot)
    this.graphics.circle(position.x, position.y, animatedSize * 1.15);
    this.graphics.fill({ color, alpha: alpha * 0.3 });

    // Main dot body
    this.graphics.circle(position.x, position.y, animatedSize);
    this.graphics.fill({ color, alpha });

    // Specular highlight (small lighter dot offset toward top-left)
    const highlightOffset = animatedSize * 0.3;
    const highlightSize = animatedSize * 0.25;
    this.graphics.circle(
      position.x - highlightOffset,
      position.y - highlightOffset,
      highlightSize
    );
    this.graphics.fill({ color: 0xFFFFFF, alpha: 0.4 });
  }

  /**
   * Render a final settled dot (no animation)
   */
  renderDotFinal(
    position: { x: number; y: number },
    color: number,
    size: number
  ): void {
    const alpha = 0.9;

    // Soft outer edge
    this.graphics.circle(position.x, position.y, size * 1.15);
    this.graphics.fill({ color, alpha: alpha * 0.3 });

    // Main dot body
    this.graphics.circle(position.x, position.y, size);
    this.graphics.fill({ color, alpha });

    // Specular highlight
    const highlightOffset = size * 0.3;
    const highlightSize = size * 0.25;
    this.graphics.circle(
      position.x - highlightOffset,
      position.y - highlightOffset,
      highlightSize
    );
    this.graphics.fill({ color: 0xFFFFFF, alpha: 0.4 });
  }
}

/**
 * Convert a TouchPath to an array of points for rendering
 */
export function pathToPoints(path: TouchPath): TouchPoint[] {
  return path.points;
}

/**
 * Drizzle render options
 */
interface DrizzleRenderOptions {
  thickness?: number;
  alpha?: number;
  showShine?: boolean;
}

/**
 * Renders drizzle (continuous thin oil/reduction lines)
 * Unlike swoosh which tapers, drizzle has consistent thickness
 */
export class DrizzleRenderer {
  private container: Container;
  private graphics: Graphics;

  constructor(parent: Container) {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    parent.addChild(this.container);
  }

  /**
   * Render a drizzle line in real-time as the user draws
   * Handles breaks in the line (when user lifts finger)
   */
  renderDrizzle(
    path: TouchPoint[],
    color: number,
    breakIndices: number[] = [],
    progress: number = 1,
    options: DrizzleRenderOptions = {}
  ): void {
    const {
      thickness = 2.5,
      alpha = 0.85,
      showShine = true,
    } = options;

    this.graphics.clear();

    if (path.length < 2) return;

    // Determine how many points to draw based on progress
    const pointsToDraw = Math.max(2, Math.floor(path.length * progress));
    const drawPoints = path.slice(0, pointsToDraw);

    // Draw segments between breaks
    let segmentStart = 0;

    for (let i = 0; i <= drawPoints.length; i++) {
      const isBreak = breakIndices.includes(i) || i === drawPoints.length;

      if (isBreak && i > segmentStart) {
        const segment = drawPoints.slice(segmentStart, i);
        this.drawDrizzleSegment(segment, color, thickness, alpha);
        segmentStart = i;
      }
    }

    // Add shine effect on completion
    if (showShine && progress >= 1) {
      this.drawShineEffect(drawPoints, breakIndices);
    }
  }

  /**
   * Draw a single segment of the drizzle with consistent thickness
   */
  private drawDrizzleSegment(
    points: TouchPoint[],
    color: number,
    thickness: number,
    alpha: number
  ): void {
    if (points.length < 2) return;

    // Draw line following exact path with consistent thickness
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len < 0.01) continue;

      // Perpendicular direction for thickness
      const nx = -dy / len;
      const ny = dx / len;

      // Draw segment as quad
      this.graphics.moveTo(p1.x + nx * thickness / 2, p1.y + ny * thickness / 2);
      this.graphics.lineTo(p1.x - nx * thickness / 2, p1.y - ny * thickness / 2);
      this.graphics.lineTo(p2.x - nx * thickness / 2, p2.y - ny * thickness / 2);
      this.graphics.lineTo(p2.x + nx * thickness / 2, p2.y + ny * thickness / 2);
      this.graphics.closePath();
      this.graphics.fill({ color, alpha });
    }

    // Add rounded caps
    if (points.length > 0) {
      this.graphics.circle(points[0].x, points[0].y, thickness / 2);
      this.graphics.fill({ color, alpha });

      this.graphics.circle(points[points.length - 1].x, points[points.length - 1].y, thickness / 2);
      this.graphics.fill({ color, alpha });
    }
  }

  /**
   * Draw subtle shine effect along the drizzle line
   */
  private drawShineEffect(
    points: TouchPoint[],
    breakIndices: number[]
  ): void {
    const shineAlpha = 0.25;
    const shineOffset = 0.8;

    let segmentStart = 0;

    for (let i = 0; i <= points.length; i++) {
      const isBreak = breakIndices.includes(i) || i === points.length;

      if (isBreak && i > segmentStart + 2) {
        const segment = points.slice(segmentStart, i);

        for (let j = 0; j < segment.length - 1; j++) {
          const p1 = segment[j];
          const p2 = segment[j + 1];

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const len = Math.sqrt(dx * dx + dy * dy);

          if (len < 0.01) continue;

          const nx = -dy / len;
          const ny = dx / len;

          this.graphics.moveTo(p1.x + nx * shineOffset, p1.y + ny * shineOffset);
          this.graphics.lineTo(p2.x + nx * shineOffset, p2.y + ny * shineOffset);
          this.graphics.stroke({ color: 0xFFFFFF, width: 0.5, alpha: shineAlpha });
        }

        segmentStart = i;
      }
    }
  }

  /**
   * Render the final settled drizzle
   */
  renderFinal(
    path: TouchPoint[],
    color: number,
    breakIndices: number[] = [],
    options: DrizzleRenderOptions = {}
  ): void {
    const {
      thickness = 2.5,
      alpha = 0.9,
    } = options;

    this.graphics.clear();

    if (path.length < 2) return;

    // Draw with slightly increased thickness for settled look
    const settledThickness = thickness * 1.1;

    let segmentStart = 0;

    for (let i = 0; i <= path.length; i++) {
      const isBreak = breakIndices.includes(i) || i === path.length;

      if (isBreak && i > segmentStart) {
        const segment = path.slice(segmentStart, i);
        this.drawDrizzleSegment(segment, color, settledThickness, alpha);
        segmentStart = i;
      }
    }

    // Add shine
    this.drawShineEffect(path, breakIndices);
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

/**
 * Render a drizzle ghost (the target path to follow)
 */
export function renderDrizzleGhost(
  graphics: Graphics,
  path: { x: number; y: number }[],
  plateRadius: number,
  options: {
    color?: number;
    alpha?: number;
    showStartIndicator?: boolean;
    showDirectionArrows?: boolean;
  } = {}
): void {
  const {
    color = 0x888888,
    alpha = 0.3,
    showStartIndicator = true,
    showDirectionArrows = true,
  } = options;

  if (path.length < 2) return;

  // Denormalize path
  const denormalizedPath = path.map(p => ({
    x: p.x * plateRadius,
    y: p.y * plateRadius,
  }));

  // Draw dashed line for ghost path
  const dashLength = 8;
  const gapLength = 6;

  for (let i = 0; i < denormalizedPath.length - 1; i++) {
    const p1 = denormalizedPath[i];
    const p2 = denormalizedPath[i + 1];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const segmentLength = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / segmentLength;
    const uy = dy / segmentLength;

    let distance = 0;
    let drawing = true;

    while (distance < segmentLength) {
      const currentLength = drawing ? dashLength : gapLength;
      const endDistance = Math.min(distance + currentLength, segmentLength);

      if (drawing) {
        graphics.moveTo(
          p1.x + ux * distance,
          p1.y + uy * distance
        );
        graphics.lineTo(
          p1.x + ux * endDistance,
          p1.y + uy * endDistance
        );
        graphics.stroke({ color, width: 1.5, alpha });
      }

      distance = endDistance;
      drawing = !drawing;
    }
  }

  // Start indicator (filled circle)
  if (showStartIndicator) {
    const start = denormalizedPath[0];
    graphics.circle(start.x, start.y, 6);
    graphics.fill({ color, alpha: alpha * 1.5 });

    // Inner circle for contrast
    graphics.circle(start.x, start.y, 3);
    graphics.fill({ color: 0xFFFFFF, alpha: alpha });
  }

  // Direction arrows along path
  if (showDirectionArrows && denormalizedPath.length >= 3) {
    // Place arrows at ~25% and ~75% of path
    const arrowPositions = [0.25, 0.75];

    for (const t of arrowPositions) {
      const index = Math.floor(t * (denormalizedPath.length - 1));
      const nextIndex = Math.min(index + 1, denormalizedPath.length - 1);

      const p1 = denormalizedPath[index];
      const p2 = denormalizedPath[nextIndex];

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

      // Draw arrow head
      graphics.moveTo(ax + ux * arrowSize, ay + uy * arrowSize);
      graphics.lineTo(ax - uy * arrowSize * 0.6, ay + ux * arrowSize * 0.6);
      graphics.lineTo(ax + uy * arrowSize * 0.6, ay - ux * arrowSize * 0.6);
      graphics.closePath();
      graphics.fill({ color, alpha: alpha * 1.2 });
    }
  }

  // End indicator (fade arrow)
  const end = denormalizedPath[denormalizedPath.length - 1];
  const prev = denormalizedPath[denormalizedPath.length - 2];

  const endDx = end.x - prev.x;
  const endDy = end.y - prev.y;
  const endLen = Math.sqrt(endDx * endDx + endDy * endDy);

  if (endLen > 0) {
    const endUx = endDx / endLen;
    const endUy = endDy / endLen;

    // Small fading arrow at end
    const arrowSize = 4;
    graphics.moveTo(end.x, end.y);
    graphics.lineTo(end.x - endUx * arrowSize * 2 - endUy * arrowSize, end.y - endUy * arrowSize * 2 + endUx * arrowSize);
    graphics.moveTo(end.x, end.y);
    graphics.lineTo(end.x - endUx * arrowSize * 2 + endUy * arrowSize, end.y - endUy * arrowSize * 2 - endUx * arrowSize);
    graphics.stroke({ color, width: 1.5, alpha: alpha * 0.7 });
  }
}
