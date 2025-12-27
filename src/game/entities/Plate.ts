import { Container, Graphics } from 'pixi.js';
import { animate, animateScale, delay } from '@/utils/animation';

interface PlateOptions {
  diameter: number;
  rimWidth?: number;
  surfaceColor?: number;
  rimColor?: number;
  shadowColor?: number;
}

export class Plate extends Container {
  private graphics: Graphics;
  private glowGraphics: Graphics;
  private diameter: number;
  private rimWidth: number;
  private isAnimating: boolean = false;

  constructor(options: PlateOptions) {
    super();

    this.diameter = options.diameter;
    this.rimWidth = options.rimWidth ?? 12;

    const surfaceColor = options.surfaceColor ?? 0xfefefa;
    const rimColor = options.rimColor ?? 0xf8f4ec;
    const shadowColor = options.shadowColor ?? 0x000000;

    // Create glow layer (behind main graphics)
    this.glowGraphics = new Graphics();
    this.glowGraphics.alpha = 0;
    this.addChild(this.glowGraphics);

    this.graphics = new Graphics();
    this.addChild(this.graphics);

    this.draw(surfaceColor, rimColor, shadowColor);
    this.drawGlow();
  }

  private draw(surfaceColor: number, rimColor: number, shadowColor: number): void {
    const radius = this.diameter / 2;
    const innerRadius = radius - this.rimWidth;

    // Shadow (offset below and slightly right)
    this.graphics
      .circle(4, 6, radius)
      .fill({ color: shadowColor, alpha: 0.08 });

    // Second shadow layer for depth
    this.graphics
      .circle(2, 3, radius)
      .fill({ color: shadowColor, alpha: 0.04 });

    // Outer rim
    this.graphics
      .circle(0, 0, radius)
      .fill(rimColor);

    // Inner surface
    this.graphics
      .circle(0, 0, innerRadius)
      .fill(surfaceColor);

    // Subtle inner highlight
    this.graphics
      .circle(-2, -2, innerRadius - 4)
      .fill({ color: 0xffffff, alpha: 0.3 });
  }

  private drawGlow(): void {
    const radius = this.diameter / 2;

    // Gold glow around the rim
    for (let i = 3; i > 0; i--) {
      const glowRadius = radius + i * 8;
      const alpha = 0.15 - i * 0.04;
      this.glowGraphics
        .circle(0, 0, glowRadius)
        .fill({ color: 0xd4af37, alpha });
    }
  }

  /**
   * Celebration animation when plate is completed
   * 1. Rim glow fades in
   * 2. Scale up slightly
   * 3. Hold for admiration
   * 4. Ready for transition
   */
  async celebrate(): Promise<void> {
    if (this.isAnimating) return;
    this.isAnimating = true;

    try {
      // 1. Fade in the glow
      await animate(this.glowGraphics, 'alpha', 0, 0.8, 400, 'easeOut');

      // 2. Scale up with bounce
      await animateScale(this.scale, 1, 1.02, 300, 'easeOutBack');

      // 3. Hold to admire
      await delay(500);

      // Glow pulse during hold
      animate(this.glowGraphics, 'alpha', 0.8, 0.5, 400, 'easeInOut');
      await delay(400);
      animate(this.glowGraphics, 'alpha', 0.5, 0.7, 400, 'easeInOut');

    } finally {
      this.isAnimating = false;
    }
  }

  /**
   * Fade out animation for transition to results
   */
  async fadeOut(duration: number = 400): Promise<void> {
    await Promise.all([
      animate(this, 'alpha', 1, 0, duration, 'easeIn'),
      animateScale(this.scale, this.scale.x, 0.95, duration, 'easeIn'),
    ]);
  }

  /**
   * Subtle pulse animation for idle state
   */
  async pulse(): Promise<void> {
    if (this.isAnimating) return;

    await animateScale(this.scale, 1, 1.005, 1500, 'easeInOut');
    await animateScale(this.scale, 1.005, 1, 1500, 'easeInOut');
  }

  /**
   * Reset any animations
   */
  resetAnimation(): void {
    this.isAnimating = false;
    this.scale.set(1);
    this.alpha = 1;
    this.glowGraphics.alpha = 0;
  }

  get plateRadius(): number {
    return this.diameter / 2;
  }

  get innerRadius(): number {
    return this.diameter / 2 - this.rimWidth;
  }
}
