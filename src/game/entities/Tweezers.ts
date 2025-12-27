import { Container, Graphics } from 'pixi.js';

/**
 * Tweezers visual entity that appears during the tweeze gesture.
 * Shows animated tweezers that grip, carry, and release delicate elements.
 *
 * Visual states:
 * - Open (grip = 0): Arms spread ~30 degrees apart
 * - Closed (grip = 1): Arms parallel (gripping position)
 *
 * The tweezers follow the touch position with a slight offset to
 * simulate holding from above.
 */
export class Tweezers extends Container {
  private leftArm: Graphics;
  private rightArm: Graphics;
  private body: Graphics;
  private gripProgress: number = 0;

  // Tweezers dimensions
  private readonly ARM_LENGTH = 40;
  private readonly ARM_WIDTH = 2.5;
  private readonly TIP_LENGTH = 8;
  private readonly TIP_WIDTH = 1.5;
  private readonly BODY_LENGTH = 15;
  private readonly BODY_WIDTH = 4;

  // Animation
  private readonly OPEN_ANGLE = Math.PI / 10;  // ~18 degrees when open
  private readonly CLOSED_ANGLE = Math.PI / 60; // ~3 degrees when closed

  // Styling
  private readonly METAL_COLOR = 0xC0C0C0;      // Silver
  private readonly METAL_HIGHLIGHT = 0xE8E8E8;  // Bright silver
  private readonly METAL_SHADOW = 0x808080;     // Dark silver

  constructor() {
    super();

    // Create components
    this.body = new Graphics();
    this.leftArm = new Graphics();
    this.rightArm = new Graphics();

    // Add in order (body first, then arms on top)
    this.addChild(this.body);
    this.addChild(this.leftArm);
    this.addChild(this.rightArm);

    // Initial draw
    this.drawTweezers();

    // Start invisible
    this.alpha = 0;
    this.visible = false;
  }

  /**
   * Show the tweezers with fade-in animation
   */
  show(): Promise<void> {
    this.visible = true;
    return new Promise((resolve) => {
      const startTime = performance.now();
      const duration = 150;
      const startAlpha = this.alpha;

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 2); // Ease out

        this.alpha = startAlpha + (1 - startAlpha) * eased;

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
   * Hide the tweezers with fade-out animation
   */
  hide(): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const duration = 100;
      const startAlpha = this.alpha;

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = progress * progress; // Ease in

        this.alpha = startAlpha * (1 - eased);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.visible = false;
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * Set the grip amount (0 = open, 1 = closed)
   */
  setGrip(progress: number): void {
    this.gripProgress = Math.max(0, Math.min(1, progress));
    this.drawTweezers();
  }

  /**
   * Get current grip progress
   */
  getGrip(): number {
    return this.gripProgress;
  }

  /**
   * Update tweezers position and grip
   */
  update(position: { x: number; y: number }, grip: number): void {
    // Position with slight offset (tweezers held from above)
    this.position.set(position.x, position.y - 5);
    this.setGrip(grip);
  }

  /**
   * Animate grip opening (for release)
   */
  animateOpen(duration: number = 100): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const startGrip = this.gripProgress;

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic

        this.setGrip(startGrip * (1 - eased));

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
   * Redraw the tweezers based on current grip state
   */
  private drawTweezers(): void {
    // Calculate arm angle based on grip
    const angle = this.OPEN_ANGLE + (this.CLOSED_ANGLE - this.OPEN_ANGLE) * this.gripProgress;

    this.drawBody();
    this.drawArm(this.leftArm, -angle);
    this.drawArm(this.rightArm, angle);
  }

  /**
   * Draw the tweezers body (handle/pivot area)
   */
  private drawBody(): void {
    this.body.clear();

    // Simple rounded rectangle for body
    const halfWidth = this.BODY_WIDTH / 2;
    const halfLength = this.BODY_LENGTH / 2;

    // Main body
    this.body.roundRect(
      -halfWidth,
      -halfLength - this.ARM_LENGTH,
      this.BODY_WIDTH,
      this.BODY_LENGTH,
      2
    );
    this.body.fill({ color: this.METAL_COLOR, alpha: 0.9 });

    // Highlight on body
    this.body.roundRect(
      -halfWidth + 0.5,
      -halfLength - this.ARM_LENGTH + 1,
      this.BODY_WIDTH - 1.5,
      this.BODY_LENGTH - 2,
      1.5
    );
    this.body.stroke({ color: this.METAL_HIGHLIGHT, width: 0.5, alpha: 0.5 });
  }

  /**
   * Draw a single arm of the tweezers
   */
  private drawArm(graphics: Graphics, angle: number): void {
    graphics.clear();

    // Save transform
    graphics.rotation = angle;

    // Main arm shaft
    graphics.roundRect(
      -this.ARM_WIDTH / 2,
      -this.ARM_LENGTH,
      this.ARM_WIDTH,
      this.ARM_LENGTH,
      1
    );
    graphics.fill({ color: this.METAL_COLOR, alpha: 0.95 });

    // Highlight line along arm
    graphics.moveTo(-this.ARM_WIDTH / 4, -this.ARM_LENGTH + 2);
    graphics.lineTo(-this.ARM_WIDTH / 4, -2);
    graphics.stroke({ color: this.METAL_HIGHLIGHT, width: 0.5, alpha: 0.4 });

    // Tip (thinner, pointed)
    const tipStartY = 0;
    const tipEndY = this.TIP_LENGTH;

    // Tip path (tapered)
    graphics.moveTo(-this.TIP_WIDTH / 2, tipStartY);
    graphics.lineTo(0, tipEndY);
    graphics.lineTo(this.TIP_WIDTH / 2, tipStartY);
    graphics.closePath();
    graphics.fill({ color: this.METAL_SHADOW, alpha: 0.95 });

    // Tip highlight
    graphics.moveTo(-this.TIP_WIDTH / 4, tipStartY + 1);
    graphics.lineTo(0, tipEndY - 1);
    graphics.stroke({ color: this.METAL_HIGHLIGHT, width: 0.3, alpha: 0.5 });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.leftArm.destroy();
    this.rightArm.destroy();
    this.body.destroy();
    super.destroy();
  }
}
