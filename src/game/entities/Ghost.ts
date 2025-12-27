import { Container, Graphics } from 'pixi.js';

export type GhostShape =
  | { type: 'circle'; diameter: number }
  | { type: 'roundRect'; width: number; height: number; radius: number };

interface GhostOptions {
  shape: GhostShape;
  color?: number;
  opacity?: number;
  fillOpacity?: number;
  strokeWidth?: number;
  dashLength?: number;
  gapLength?: number;
  tutorialMode?: boolean; // Enable enhanced highlighting for tutorials
}

export type PlacementZone = 'perfect' | 'great' | 'good' | 'acceptable' | 'miss';

export class Ghost extends Container {
  private graphics: Graphics;
  private baseOpacity: number;
  private pulsePhase = 0;
  private animating = true;
  private shape: GhostShape;
  private color: number;
  private strokeWidth: number;
  private dashLength: number;
  private gapLength: number;
  private fillOpacity: number;
  private tutorialMode: boolean;

  constructor(options: GhostOptions) {
    super();

    this.shape = options.shape;
    this.color = options.color ?? 0xb87333; // accent.primary
    this.tutorialMode = options.tutorialMode ?? false;

    // Tutorial mode has more prominent visuals
    if (this.tutorialMode) {
      this.baseOpacity = options.opacity ?? 0.75;
      this.fillOpacity = options.fillOpacity ?? 0.1;
      this.strokeWidth = options.strokeWidth ?? 1.5;
    } else {
      this.baseOpacity = options.opacity ?? 0.6;
      this.fillOpacity = options.fillOpacity ?? 0.05;
      this.strokeWidth = options.strokeWidth ?? 1;
    }

    this.dashLength = options.dashLength ?? 6;
    this.gapLength = options.gapLength ?? 4;

    this.graphics = new Graphics();
    this.addChild(this.graphics);

    this.drawShape();
    this.alpha = this.baseOpacity;
  }

  private drawShape(): void {
    if (this.shape.type === 'circle') {
      this.drawDashedCircle();
    } else {
      this.drawDashedRoundRect();
    }
  }

  /**
   * Get a contrasting color for the outline shadow.
   * Light colors get a dark shadow, dark colors get a light shadow.
   */
  private getContrastColor(color: number): number {
    // Extract RGB components
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return dark shadow for light colors, light shadow for dark colors
    return luminance > 0.5 ? 0x3d3d3d : 0xffffff;
  }

  private drawDashedCircle(): void {
    if (this.shape.type !== 'circle') return;

    const radius = this.shape.diameter / 2;

    // Draw subtle fill
    this.graphics.circle(0, 0, radius);
    this.graphics.fill({ color: this.color, alpha: this.fillOpacity });

    // Draw dashed outline
    const circumference = 2 * Math.PI * radius;
    const segmentLength = this.dashLength + this.gapLength;
    const segments = Math.floor(circumference / segmentLength);
    const actualSegmentAngle = (2 * Math.PI) / segments;
    const dashAngle = actualSegmentAngle * (this.dashLength / segmentLength);

    // First pass: draw contrasting shadow for visibility on similar-colored backgrounds
    const contrastColor = this.getContrastColor(this.color);
    for (let i = 0; i < segments; i++) {
      const startAngle = i * actualSegmentAngle;
      const endAngle = startAngle + dashAngle;

      this.graphics.arc(0, 0, radius, startAngle, endAngle);
      this.graphics.stroke({ color: contrastColor, width: this.strokeWidth + 2, alpha: 0.25 });
    }

    // Second pass: draw the actual colored dashed outline on top
    for (let i = 0; i < segments; i++) {
      const startAngle = i * actualSegmentAngle;
      const endAngle = startAngle + dashAngle;

      this.graphics.arc(0, 0, radius, startAngle, endAngle);
      this.graphics.stroke({ color: this.color, width: this.strokeWidth });
    }
  }

  private drawDashedRoundRect(): void {
    if (this.shape.type !== 'roundRect') return;

    const { width, height, radius } = this.shape;
    const halfW = width / 2;
    const halfH = height / 2;

    // Draw subtle fill
    this.graphics.roundRect(-halfW, -halfH, width, height, radius);
    this.graphics.fill({ color: this.color, alpha: this.fillOpacity });

    // Draw dashed outline by walking the perimeter
    // The perimeter consists of 4 straight edges and 4 corner arcs
    const straightH = width - 2 * radius;  // horizontal straight sections
    const straightV = height - 2 * radius; // vertical straight sections
    const cornerArc = (Math.PI / 2) * radius; // quarter circle arc length
    const totalPerimeter = 2 * straightH + 2 * straightV + 4 * cornerArc;

    const segmentLength = this.dashLength + this.gapLength;
    const numDashes = Math.floor(totalPerimeter / segmentLength);
    const actualSegmentLength = totalPerimeter / numDashes;
    const actualDashLength = actualSegmentLength * (this.dashLength / segmentLength);

    // First pass: draw contrasting shadow for visibility
    const contrastColor = this.getContrastColor(this.color);
    for (let i = 0; i < numDashes; i++) {
      const startDist = i * actualSegmentLength;
      const endDist = startDist + actualDashLength;

      this.drawDashSegment(startDist, endDist, halfW, halfH, radius, straightH, straightV, cornerArc, contrastColor, this.strokeWidth + 2, 0.25);
    }

    // Second pass: draw actual colored dashes on top
    for (let i = 0; i < numDashes; i++) {
      const startDist = i * actualSegmentLength;
      const endDist = startDist + actualDashLength;

      this.drawDashSegment(startDist, endDist, halfW, halfH, radius, straightH, straightV, cornerArc);
    }
  }

  private drawDashSegment(
    startDist: number,
    endDist: number,
    halfW: number,
    halfH: number,
    r: number,
    straightH: number,
    straightV: number,
    cornerArc: number,
    overrideColor?: number,
    overrideWidth?: number,
    overrideAlpha?: number
  ): void {
    const strokeColor = overrideColor ?? this.color;
    const strokeWidth = overrideWidth ?? this.strokeWidth;
    const strokeAlpha = overrideAlpha ?? 1;
    // Perimeter sections (starting from top-left, going clockwise):
    // 1. Top edge (left to right): 0 to straightH
    // 2. Top-right corner: straightH to straightH + cornerArc
    // 3. Right edge (top to bottom): straightH + cornerArc to straightH + cornerArc + straightV
    // 4. Bottom-right corner: ... + cornerArc
    // 5. Bottom edge (right to left): ... + straightH
    // 6. Bottom-left corner: ... + cornerArc
    // 7. Left edge (bottom to top): ... + straightV
    // 8. Top-left corner: ... + cornerArc (back to start)

    const sections = [
      { type: 'line' as const, length: straightH, x1: -halfW + r, y1: -halfH, x2: halfW - r, y2: -halfH },
      { type: 'arc' as const, length: cornerArc, cx: halfW - r, cy: -halfH + r, r, startAngle: -Math.PI / 2, endAngle: 0 },
      { type: 'line' as const, length: straightV, x1: halfW, y1: -halfH + r, x2: halfW, y2: halfH - r },
      { type: 'arc' as const, length: cornerArc, cx: halfW - r, cy: halfH - r, r, startAngle: 0, endAngle: Math.PI / 2 },
      { type: 'line' as const, length: straightH, x1: halfW - r, y1: halfH, x2: -halfW + r, y2: halfH },
      { type: 'arc' as const, length: cornerArc, cx: -halfW + r, cy: halfH - r, r, startAngle: Math.PI / 2, endAngle: Math.PI },
      { type: 'line' as const, length: straightV, x1: -halfW, y1: halfH - r, x2: -halfW, y2: -halfH + r },
      { type: 'arc' as const, length: cornerArc, cx: -halfW + r, cy: -halfH + r, r, startAngle: Math.PI, endAngle: Math.PI * 1.5 },
    ];

    let currentDist = 0;

    for (const section of sections) {
      const sectionStart = currentDist;
      const sectionEnd = currentDist + section.length;

      // Check if this dash overlaps this section
      if (startDist < sectionEnd && endDist > sectionStart) {
        const dashStartInSection = Math.max(0, startDist - sectionStart);
        const dashEndInSection = Math.min(section.length, endDist - sectionStart);

        if (section.type === 'line') {
          const t1 = dashStartInSection / section.length;
          const t2 = dashEndInSection / section.length;

          const x1 = section.x1 + (section.x2 - section.x1) * t1;
          const y1 = section.y1 + (section.y2 - section.y1) * t1;
          const x2 = section.x1 + (section.x2 - section.x1) * t2;
          const y2 = section.y1 + (section.y2 - section.y1) * t2;

          this.graphics.moveTo(x1, y1);
          this.graphics.lineTo(x2, y2);
          this.graphics.stroke({ color: strokeColor, width: strokeWidth, alpha: strokeAlpha });
        } else {
          const angleRange = section.endAngle - section.startAngle;
          const t1 = dashStartInSection / section.length;
          const t2 = dashEndInSection / section.length;

          const angle1 = section.startAngle + angleRange * t1;
          const angle2 = section.startAngle + angleRange * t2;

          this.graphics.arc(section.cx, section.cy, section.r, angle1, angle2);
          this.graphics.stroke({ color: strokeColor, width: strokeWidth, alpha: strokeAlpha });
        }
      }

      currentDist = sectionEnd;
    }
  }

  private drawSolidShape(color: number, fillAlpha: number, strokeWidth: number): void {
    this.graphics.clear();

    if (this.shape.type === 'circle') {
      const radius = this.shape.diameter / 2;
      this.graphics.circle(0, 0, radius);
      this.graphics.fill({ color, alpha: fillAlpha });
      this.graphics.circle(0, 0, radius);
      this.graphics.stroke({ color, width: strokeWidth });
    } else {
      const { width, height, radius } = this.shape;
      this.graphics.roundRect(-width / 2, -height / 2, width, height, radius);
      this.graphics.fill({ color, alpha: fillAlpha });
      this.graphics.roundRect(-width / 2, -height / 2, width, height, radius);
      this.graphics.stroke({ color, width: strokeWidth });
    }
  }

  update(deltaMs: number): void {
    if (!this.animating) return;

    if (this.tutorialMode) {
      // Tutorial mode: more prominent pulse - +-15% over 1.5 seconds
      this.pulsePhase += (deltaMs / 1500) * Math.PI * 2;
      if (this.pulsePhase > Math.PI * 2) {
        this.pulsePhase -= Math.PI * 2;
      }
      const pulseOffset = Math.sin(this.pulsePhase) * 0.15;
      this.alpha = this.baseOpacity + pulseOffset;
    } else {
      // Normal mode: subtle pulse - +-5% over 3 seconds
      this.pulsePhase += (deltaMs / 3000) * Math.PI * 2;
      if (this.pulsePhase > Math.PI * 2) {
        this.pulsePhase -= Math.PI * 2;
      }
      const pulseOffset = Math.sin(this.pulsePhase) * 0.05;
      this.alpha = this.baseOpacity + pulseOffset;
    }
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

  flashColor(flashColor: number, duration: number = 150): Promise<void> {
    return new Promise((resolve) => {
      this.animating = false;

      // Redraw with solid shape in flash color
      this.drawSolidShape(flashColor, 0.15, 2);
      this.alpha = 1;

      // After flash, fade out
      setTimeout(() => {
        this.fadeOut(100).then(resolve);
      }, duration);
    });
  }

  showZoneFeedback(zone: PlacementZone): Promise<void> {
    switch (zone) {
      case 'perfect':
        // Flash green before fading
        return this.flashColor(0x4a6741, 150);
      case 'great':
        // Flash accent color before fading
        return this.flashColor(0xb87333, 120);
      case 'good':
        // Simply fade
        return this.fadeOut(100);
      case 'acceptable':
        // Fade with slight delay
        return new Promise((resolve) => {
          setTimeout(() => {
            this.fadeOut(100).then(resolve);
          }, 50);
        });
      case 'miss':
      default:
        // Immediate fade
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
