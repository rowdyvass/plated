import { Container, Graphics } from 'pixi.js';
import type { DustTarget } from '../gestures/DustGesture';

export interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  settled: boolean;
  settleProgress: number;
}

export interface DustConfig {
  particleCount: number;      // How many particles to emit
  particleSize: number;       // Base particle size (2-4px recommended)
  maxOpacity: number;         // Maximum opacity (0.4-0.6 recommended)
  gravity: number;            // Downward pull
  drift: number;              // Horizontal drift amount
  settleTime: number;         // Time in ms to settle
}

const DEFAULT_CONFIG: DustConfig = {
  particleCount: 150,
  particleSize: 2.5,
  maxOpacity: 0.5,
  gravity: 30,
  drift: 15,
  settleTime: 400,
};

/**
 * DustEmitter creates fine powder particle effects for dusting gestures.
 * Unlike scatter particles, dust is:
 * - Much finer (smaller particles)
 * - Falls and settles with gravity
 * - More particles, smaller size
 * - Opacity builds up with overlap
 * - Disperses in swipe direction
 */
export class DustEmitter extends Container {
  private particles: DustParticle[] = [];
  private graphics: Graphics;
  private config: DustConfig;
  private color: number;
  private isSettled = false;
  private onSettleCallback?: () => void;
  private plateRadius: number;

  constructor(plateRadius: number, color: number, config?: Partial<DustConfig>) {
    super();

    this.plateRadius = plateRadius;
    this.color = color;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.graphics = new Graphics();
    this.addChild(this.graphics);
  }

  /**
   * Emit dust particles along a path
   */
  emitAlongPath(
    path: { x: number; y: number }[],
    direction: { x: number; y: number },
    target: DustTarget
  ): void {
    if (path.length < 2) return;

    const { particleCount, particleSize, maxOpacity, drift } = this.config;

    // Distribute particles along the path
    const particlesPerPoint = Math.ceil(particleCount / path.length);

    // Convert avoid zones to pixel coordinates
    const avoidZones = target.avoidZones?.map(zone => ({
      center: {
        x: zone.center.x * this.plateRadius,
        y: zone.center.y * this.plateRadius,
      },
      radius: zone.radius * this.plateRadius,
    })) ?? [];

    for (const point of path) {
      for (let i = 0; i < particlesPerPoint; i++) {
        // Add randomness to position
        const spreadX = (Math.random() - 0.5) * 30;
        const spreadY = (Math.random() - 0.5) * 30;

        const x = point.x + spreadX + direction.x * (Math.random() * 20);
        const y = point.y + spreadY + direction.y * (Math.random() * 20);

        // Check if particle is in an avoid zone
        let inAvoidZone = false;
        for (const zone of avoidZones) {
          const dx = x - zone.center.x;
          const dy = y - zone.center.y;
          if (Math.sqrt(dx * dx + dy * dy) < zone.radius) {
            inAvoidZone = true;
            break;
          }
        }

        if (inAvoidZone) continue;

        // Random velocity based on direction
        const vx = direction.x * (20 + Math.random() * 30) + (Math.random() - 0.5) * drift;
        const vy = direction.y * (20 + Math.random() * 30) + (Math.random() - 0.5) * drift;

        // Random particle size
        const size = particleSize * (0.5 + Math.random() * 1.0);

        // Target alpha varies by position
        const targetAlpha = maxOpacity * (0.5 + Math.random() * 0.5);

        this.particles.push({
          x,
          y,
          vx,
          vy,
          size,
          alpha: 0, // Start invisible, fade in
          targetAlpha,
          settled: false,
          settleProgress: 0,
        });
      }
    }

    this.isSettled = false;
    this.renderParticles();
  }

  /**
   * Update particle physics
   * @param deltaTime Time since last update in seconds
   */
  update(deltaTime: number): void {
    if (this.isSettled) return;

    const { gravity, settleTime } = this.config;
    let allSettled = true;

    for (const particle of this.particles) {
      if (particle.settled) continue;

      // Apply gravity
      particle.vy += gravity * deltaTime;

      // Apply friction/air resistance
      particle.vx *= 0.95;
      particle.vy *= 0.95;

      // Update position
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;

      // Calculate settle progress
      const velocity = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (velocity < 5) {
        particle.settleProgress += deltaTime * 1000 / settleTime;

        if (particle.settleProgress >= 1) {
          particle.settled = true;
          particle.vx = 0;
          particle.vy = 0;
        }
      }

      // Fade in as particle settles
      particle.alpha = Math.min(particle.targetAlpha, particle.alpha + deltaTime * 2);

      if (!particle.settled) {
        allSettled = false;
      }
    }

    this.renderParticles();

    if (allSettled && !this.isSettled) {
      this.isSettled = true;
      this.onSettleCallback?.();
    }
  }

  /**
   * Render all particles
   */
  private renderParticles(): void {
    this.graphics.clear();

    for (const particle of this.particles) {
      if (particle.alpha > 0.01) {
        // Draw particle as small soft circle
        this.graphics.circle(particle.x, particle.y, particle.size);
        this.graphics.fill({ color: this.color, alpha: particle.alpha * 0.8 });

        // Soft outer glow for dust effect
        this.graphics.circle(particle.x, particle.y, particle.size * 1.5);
        this.graphics.fill({ color: this.color, alpha: particle.alpha * 0.2 });
      }
    }
  }

  /**
   * Immediately settle all particles
   */
  settle(): void {
    for (const particle of this.particles) {
      particle.vx = 0;
      particle.vy = 0;
      particle.settled = true;
      particle.alpha = particle.targetAlpha;
    }
    this.isSettled = true;
    this.renderParticles();
    this.onSettleCallback?.();
  }

  /**
   * Set callback for when all particles have settled
   */
  onSettle(callback: () => void): void {
    this.onSettleCallback = callback;
  }

  /**
   * Check if all particles have settled
   */
  hasSettled(): boolean {
    return this.isSettled;
  }

  /**
   * Get particle count
   */
  getParticleCount(): number {
    return this.particles.length;
  }

  /**
   * Clear all particles
   */
  clear(): void {
    this.particles = [];
    this.graphics.clear();
    this.isSettled = false;
  }

  /**
   * Destroy the emitter
   */
  destroy(): void {
    this.clear();
    super.destroy({ children: true });
  }
}

/**
 * Render final settled dust to a graphics object (for permanent placement)
 */
export function renderSettledDust(
  graphics: Graphics,
  path: { x: number; y: number }[],
  target: DustTarget,
  plateRadius: number,
  color: number,
  config?: Partial<DustConfig>
): void {
  const { particleSize, maxOpacity } = { ...DEFAULT_CONFIG, ...config };

  if (path.length < 2) return;

  // Convert avoid zones to pixel coordinates
  const avoidZones = target.avoidZones?.map(zone => ({
    center: {
      x: zone.center.x * plateRadius,
      y: zone.center.y * plateRadius,
    },
    radius: zone.radius * plateRadius,
  })) ?? [];

  // Use path to create a coverage grid
  const gridSize = 25;
  const zoneBounds = {
    x: target.zone.bounds.x * plateRadius,
    y: target.zone.bounds.y * plateRadius,
    width: target.zone.bounds.width * plateRadius,
    height: target.zone.bounds.height * plateRadius,
  };

  const cellWidth = zoneBounds.width / gridSize;
  const cellHeight = zoneBounds.height / gridSize;
  const dustRadius = 30;

  // Calculate coverage grid
  const coverageGrid: number[][] = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(0));

  for (const point of path) {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cellCenterX = zoneBounds.x + (col + 0.5) * cellWidth;
        const cellCenterY = zoneBounds.y + (row + 0.5) * cellHeight;

        const dx = point.x - cellCenterX;
        const dy = point.y - cellCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < dustRadius) {
          coverageGrid[row][col] = Math.min(1, coverageGrid[row][col] + (1 - dist / dustRadius) * 0.25);
        }
      }
    }
  }

  // Render dust particles based on coverage
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const coverage = coverageGrid[row][col];
      if (coverage < 0.1) continue;

      const cellCenterX = zoneBounds.x + (col + 0.5) * cellWidth;
      const cellCenterY = zoneBounds.y + (row + 0.5) * cellHeight;

      // Check avoid zones
      let inAvoidZone = false;
      for (const zone of avoidZones) {
        const dx = cellCenterX - zone.center.x;
        const dy = cellCenterY - zone.center.y;
        if (Math.sqrt(dx * dx + dy * dy) < zone.radius * 1.1) {
          inAvoidZone = true;
          break;
        }
      }

      if (inAvoidZone) continue;

      // Number of particles in this cell based on coverage
      const particlesInCell = Math.ceil(coverage * 5);

      for (let i = 0; i < particlesInCell; i++) {
        // Random position within cell
        const offsetX = (Math.random() - 0.5) * cellWidth;
        const offsetY = (Math.random() - 0.5) * cellHeight;
        const x = cellCenterX + offsetX;
        const y = cellCenterY + offsetY;

        // Random size
        const size = particleSize * (0.5 + Math.random() * 1.0);
        const alpha = maxOpacity * coverage * (0.6 + Math.random() * 0.4);

        // Draw particle
        graphics.circle(x, y, size);
        graphics.fill({ color, alpha: alpha * 0.8 });
      }
    }
  }
}
