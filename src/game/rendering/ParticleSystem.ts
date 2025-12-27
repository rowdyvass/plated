import { Container, Sprite, Texture, Graphics } from 'pixi.js';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  alpha: number;
  sprite: Sprite;
  settled: boolean;
  offPlate: boolean;
}

export interface ScatterConfig {
  particleCount: number;
  spread: number;         // Angle spread in radians
  force: number;          // Initial velocity multiplier (0-1)
  friction: number;       // Deceleration rate (default 0.92)
  gravity: number;        // Downward pull (default 0)
  rotationRange: number;  // Max rotation in radians
  scaleVariation: number; // Scale range (e.g., 0.2 = 0.8-1.2)
  settleThreshold: number; // Velocity threshold to settle
  plateRadius: number;    // For boundary detection
}

const DEFAULT_CONFIG: Partial<ScatterConfig> = {
  spread: Math.PI / 3,      // 60 degree spread
  friction: 0.92,
  gravity: 0,
  rotationRange: Math.PI / 6,
  scaleVariation: 0.2,
  settleThreshold: 10,
};

/**
 * ParticleSystem manages scattered particles with physics simulation.
 * Used for scatter gesture effects like herbs, peas, and small garnishes.
 */
export class ParticleSystem extends Container {
  private particles: Particle[] = [];
  private config: ScatterConfig;
  private plateRadius: number;
  private isSettled = false;
  private onSettleCallback?: () => void;

  constructor(plateRadius: number) {
    super();
    this.plateRadius = plateRadius;
    this.config = { ...DEFAULT_CONFIG, plateRadius } as ScatterConfig;
  }

  /**
   * Scatter particles from an origin point in a direction
   */
  scatter(
    origin: { x: number; y: number },
    direction: { x: number; y: number },
    count: number,
    texture: Texture,
    config?: Partial<ScatterConfig>
  ): void {
    // Merge config
    this.config = { ...DEFAULT_CONFIG, ...config, plateRadius: this.plateRadius } as ScatterConfig;

    const baseAngle = Math.atan2(direction.y, direction.x);
    const spreadHalf = (config?.spread ?? DEFAULT_CONFIG.spread!) / 2;
    const force = (config?.force ?? 0.7) * 300; // Base velocity

    for (let i = 0; i < count; i++) {
      // Randomize angle within spread cone
      const angleOffset = (Math.random() - 0.5) * 2 * spreadHalf;
      const angle = baseAngle + angleOffset;

      // Randomize velocity
      const velocityMultiplier = 0.6 + Math.random() * 0.8; // 0.6-1.4
      const vx = Math.cos(angle) * force * velocityMultiplier;
      const vy = Math.sin(angle) * force * velocityMultiplier;

      // Randomize scale
      const scaleVar = this.config.scaleVariation;
      const scale = 1 + (Math.random() - 0.5) * 2 * scaleVar;

      // Randomize initial rotation
      const rotation = (Math.random() - 0.5) * 2 * this.config.rotationRange;
      const rotationSpeed = (Math.random() - 0.5) * 0.1;

      // Create sprite
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.x = origin.x;
      sprite.y = origin.y;
      sprite.scale.set(scale);
      sprite.rotation = rotation;
      sprite.alpha = 1;

      this.addChild(sprite);

      const particle: Particle = {
        x: origin.x,
        y: origin.y,
        vx,
        vy,
        rotation,
        rotationSpeed,
        scale,
        alpha: 1,
        sprite,
        settled: false,
        offPlate: false,
      };

      this.particles.push(particle);
    }

    this.isSettled = false;
  }

  /**
   * Create simple circle particles (for ingredients without sprites)
   */
  scatterCircles(
    origin: { x: number; y: number },
    direction: { x: number; y: number },
    count: number,
    color: number,
    radius: number = 6,
    config?: Partial<ScatterConfig>
  ): void {
    // Create a circle texture
    const graphics = new Graphics();
    graphics.circle(0, 0, radius);
    graphics.fill({ color, alpha: 1 });

    // Add soft edge
    graphics.circle(0, 0, radius * 1.2);
    graphics.fill({ color, alpha: 0.3 });

    // Note: In a full implementation, we'd render to texture
    // For now, use a placeholder white texture and tint
    const texture = Texture.WHITE;

    this.scatter(origin, direction, count, texture, config);

    // Tint particles
    for (const particle of this.particles) {
      particle.sprite.tint = color;
      particle.sprite.scale.set(radius / 8); // Scale based on radius
    }
  }

  /**
   * Update particle physics
   * @param deltaTime Time since last update in seconds
   */
  update(deltaTime: number): void {
    if (this.isSettled) return;

    let allSettled = true;

    for (const particle of this.particles) {
      if (particle.settled) continue;

      // Apply friction
      particle.vx *= this.config.friction;
      particle.vy *= this.config.friction;

      // Apply gravity
      particle.vy += this.config.gravity * deltaTime;

      // Update position
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;

      // Update rotation
      particle.rotation += particle.rotationSpeed;

      // Check if off plate
      const distFromCenter = Math.sqrt(particle.x * particle.x + particle.y * particle.y);
      if (distFromCenter > this.plateRadius * 0.95) {
        particle.offPlate = true;
        // Fade out particles leaving the plate
        particle.alpha = Math.max(0, particle.alpha - deltaTime * 3);
        if (particle.alpha <= 0) {
          particle.settled = true;
          particle.sprite.visible = false;
        }
      }

      // Check if settled (velocity below threshold)
      const velocity = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (velocity < this.config.settleThreshold && !particle.offPlate) {
        particle.settled = true;
        particle.vx = 0;
        particle.vy = 0;
      }

      // Update sprite
      particle.sprite.x = particle.x;
      particle.sprite.y = particle.y;
      particle.sprite.rotation = particle.rotation;
      particle.sprite.alpha = particle.alpha;

      if (!particle.settled) {
        allSettled = false;
      }
    }

    if (allSettled && !this.isSettled) {
      this.isSettled = true;
      this.onSettleCallback?.();
    }
  }

  /**
   * Immediately settle all particles in place
   */
  settle(): void {
    for (const particle of this.particles) {
      particle.vx = 0;
      particle.vy = 0;
      particle.rotationSpeed = 0;
      particle.settled = true;
    }
    this.isSettled = true;
    this.onSettleCallback?.();
  }

  /**
   * Set callback for when all particles have settled
   */
  onSettle(callback: () => void): void {
    this.onSettleCallback = callback;
  }

  /**
   * Get all particles (for scoring)
   */
  getParticles(): Particle[] {
    return [...this.particles];
  }

  /**
   * Get particles that landed on the plate (not off-plate)
   */
  getOnPlateParticles(): Particle[] {
    return this.particles.filter(p => !p.offPlate);
  }

  /**
   * Get settled particle positions (for scoring)
   */
  getSettledPositions(): { x: number; y: number }[] {
    return this.particles
      .filter(p => p.settled && !p.offPlate)
      .map(p => ({ x: p.x, y: p.y }));
  }

  /**
   * Check if all particles have settled
   */
  hasSettled(): boolean {
    return this.isSettled;
  }

  /**
   * Get count of particles that landed on plate
   */
  getOnPlateCount(): number {
    return this.particles.filter(p => !p.offPlate).length;
  }

  /**
   * Clear all particles
   */
  clear(): void {
    for (const particle of this.particles) {
      particle.sprite.destroy();
    }
    this.particles = [];
    this.isSettled = false;
  }

  /**
   * Destroy the particle system
   */
  destroy(): void {
    this.clear();
    super.destroy({ children: true });
  }
}
