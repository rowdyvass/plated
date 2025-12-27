import { Graphics } from 'pixi.js';
import { BaseGesture } from './BaseGesture';
import type { GestureResult, GestureTarget, TouchPath } from '@/types/gestures';

export interface DustTarget {
  type: 'dust';
  id: string;
  ingredientId: string;
  zone: {
    type: 'rectangle' | 'circle';
    bounds: { x: number; y: number; width: number; height: number };
  };
  avoidZones?: {
    type: 'circle';
    center: { x: number; y: number };
    radius: number;
  }[];
  idealCoverage: number; // 0-1, what % coverage is ideal
}

export interface DustAnalysis {
  swipeDirection: { x: number; y: number };
  coverage: number;        // 0-1, what % of target zone was covered
  passes: number;          // How many back-and-forth passes
  speed: number;           // Average speed in px/s
  evenness: number;        // How even was the distribution (0-1)
  avoidViolations: number; // Count of violations in avoid zones
}

/**
 * Dust gesture: controlled powder dusting across a zone.
 * Recognition: swipe motion covering horizontal or diagonal distance.
 * Scoring: based on coverage, evenness, and avoiding specified zones.
 *
 * The dust gesture is different from scatter - it's a controlled
 * swiping motion that creates a fine powder effect across an area.
 */
export class DustGesture extends BaseGesture {
  readonly type = 'dust' as const;

  // Recognition thresholds (adjusted for mouse/trackpad compatibility)
  private readonly MIN_DURATION_MS = 100;     // Minimum duration for valid dust (lowered for mouse)
  private readonly MAX_DURATION_MS = 3000;    // Maximum duration (extended for mouse)
  private readonly MIN_PATH_LENGTH = 50;      // Minimum path length in pixels (lowered for mouse)
  private readonly MIN_SPEED = 20;            // Minimum average speed (px/s) (lowered for mouse)
  private readonly MAX_SPEED = 800;           // Maximum speed (not too fast) (raised for mouse)

  recognize(path: TouchPath): boolean {
    const { points, duration } = path;

    // Must have enough points (lowered for mouse compatibility)
    if (points.length < 3) {
      return false;
    }

    // Check duration range
    if (duration < this.MIN_DURATION_MS || duration > this.MAX_DURATION_MS) {
      return false;
    }

    // Check minimum path length
    const pathLength = this.calculatePathLength(path);
    if (pathLength < this.MIN_PATH_LENGTH) {
      return false;
    }

    // Calculate average speed
    const avgSpeed = pathLength / (duration / 1000);
    if (avgSpeed < this.MIN_SPEED || avgSpeed > this.MAX_SPEED) {
      return false;
    }

    return true;
  }

  /**
   * Analyze the dust gesture to extract metrics
   */
  analyzeDust(path: TouchPath, target: DustTarget, plateRadius: number): DustAnalysis {
    const pathLength = this.calculatePathLength(path);
    const avgSpeed = pathLength / (path.duration / 1000);

    // Calculate swipe direction (overall)
    const direction = this.calculateSwipeDirection(path);

    // Calculate passes (direction reversals indicate back-and-forth)
    const passes = Math.max(1, Math.floor(this.countDirectionReversals(path) / 2) + 1);

    // Calculate coverage and evenness
    const { coverage, evenness, avoidViolations } = this.calculateCoverage(path, target, plateRadius);

    return {
      swipeDirection: direction,
      coverage,
      passes,
      speed: avgSpeed,
      evenness,
      avoidViolations,
    };
  }

  /**
   * Calculate the overall swipe direction
   */
  private calculateSwipeDirection(path: TouchPath): { x: number; y: number } {
    const points = path.points;
    if (points.length < 2) return { x: 1, y: 0 };

    // Use first and last points for overall direction
    const start = points[0];
    const end = points[points.length - 1];

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const magnitude = Math.sqrt(dx * dx + dy * dy);

    if (magnitude < 1) return { x: 1, y: 0 };

    return {
      x: dx / magnitude,
      y: dy / magnitude,
    };
  }

  /**
   * Calculate coverage of the target zone and violations of avoid zones
   */
  private calculateCoverage(
    path: TouchPath,
    target: DustTarget,
    plateRadius: number
  ): { coverage: number; evenness: number; avoidViolations: number } {
    const points = path.points;
    const gridSize = 10; // Grid cells for coverage calculation

    // Convert zone bounds to pixels
    const zoneBounds = {
      x: target.zone.bounds.x * plateRadius,
      y: target.zone.bounds.y * plateRadius,
      width: target.zone.bounds.width * plateRadius,
      height: target.zone.bounds.height * plateRadius,
    };

    // Create coverage grid
    const cellWidth = zoneBounds.width / gridSize;
    const cellHeight = zoneBounds.height / gridSize;
    const coverageGrid: number[][] = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(0));

    // Mark cells as covered based on path proximity
    const dustRadius = 20; // Dust spreads this far from path

    for (const point of points) {
      // Check each grid cell
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const cellCenterX = zoneBounds.x + (col + 0.5) * cellWidth;
          const cellCenterY = zoneBounds.y + (row + 0.5) * cellHeight;

          const dx = point.x - cellCenterX;
          const dy = point.y - cellCenterY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Add coverage based on proximity
          if (dist < dustRadius) {
            const coverageAmount = 1 - dist / dustRadius;
            coverageGrid[row][col] = Math.min(1, coverageGrid[row][col] + coverageAmount * 0.3);
          }
        }
      }
    }

    // Calculate avoid zone violations
    let avoidViolations = 0;
    if (target.avoidZones) {
      for (const avoidZone of target.avoidZones) {
        const avoidCenter = {
          x: avoidZone.center.x * plateRadius,
          y: avoidZone.center.y * plateRadius,
        };
        const avoidRadius = avoidZone.radius * plateRadius;

        for (const point of points) {
          const dx = point.x - avoidCenter.x;
          const dy = point.y - avoidCenter.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < avoidRadius) {
            avoidViolations++;
          }
        }
      }
      // Normalize violations
      avoidViolations = Math.min(1, avoidViolations / points.length);
    }

    // Calculate total coverage
    let totalCoverage = 0;
    let coveredCells = 0;
    const cellCoverages: number[] = [];

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        // Skip cells in avoid zones
        let inAvoidZone = false;
        if (target.avoidZones) {
          const cellCenterX = zoneBounds.x + (col + 0.5) * cellWidth;
          const cellCenterY = zoneBounds.y + (row + 0.5) * cellHeight;

          for (const avoidZone of target.avoidZones) {
            const avoidCenter = {
              x: avoidZone.center.x * plateRadius,
              y: avoidZone.center.y * plateRadius,
            };
            const avoidRadius = avoidZone.radius * plateRadius;

            const dx = cellCenterX - avoidCenter.x;
            const dy = cellCenterY - avoidCenter.y;
            if (Math.sqrt(dx * dx + dy * dy) < avoidRadius) {
              inAvoidZone = true;
              break;
            }
          }
        }

        if (!inAvoidZone) {
          totalCoverage += coverageGrid[row][col];
          cellCoverages.push(coverageGrid[row][col]);
          if (coverageGrid[row][col] > 0.2) {
            coveredCells++;
          }
        }
      }
    }

    const validCellCount = cellCoverages.length;
    const coverage = validCellCount > 0 ? coveredCells / validCellCount : 0;

    // Calculate evenness (coefficient of variation, inverted)
    let evenness = 1;
    if (cellCoverages.length > 1) {
      const mean = totalCoverage / cellCoverages.length;
      if (mean > 0) {
        const variance = cellCoverages.reduce((acc, c) => acc + Math.pow(c - mean, 2), 0) / cellCoverages.length;
        const stdDev = Math.sqrt(variance);
        const cv = stdDev / mean;
        evenness = Math.max(0, 1 - cv);
      }
    }

    return { coverage, evenness, avoidViolations };
  }

  /**
   * Get the path points for dust rendering
   */
  getDustPath(path: TouchPath): { x: number; y: number }[] {
    return path.points.map(p => ({ x: p.x, y: p.y }));
  }

  score(path: TouchPath, target: GestureTarget, plateRadius: number): GestureResult {
    // DustGesture expects a dust target
    if (!('type' in target) || target.type !== 'dust') {
      return {
        type: 'dust',
        success: false,
        techniqueScore: 0,
        penalties: [{ reason: 'Wrong target type for dust gesture', deduction: 100 }],
      };
    }

    const dustTarget = target as DustTarget;
    const analysis = this.analyzeDust(path, dustTarget, plateRadius);
    const penalties: { reason: string; deduction: number }[] = [];
    let techniqueScore = 100;

    // Coverage accuracy
    if (analysis.coverage < dustTarget.idealCoverage * 0.5) {
      const penalty = 20;
      penalties.push({ reason: 'Insufficient coverage', deduction: penalty });
      techniqueScore -= penalty;
    } else if (analysis.coverage < dustTarget.idealCoverage * 0.8) {
      const penalty = 10;
      penalties.push({ reason: 'Light coverage', deduction: penalty });
      techniqueScore -= penalty;
    } else if (analysis.coverage > dustTarget.idealCoverage * 1.3) {
      const penalty = 10;
      penalties.push({ reason: 'Too heavy', deduction: penalty });
      techniqueScore -= penalty;
    }

    // Avoid zone violations
    if (analysis.avoidViolations > 0.1) {
      const penalty = Math.round(analysis.avoidViolations * 25);
      penalties.push({ reason: 'Dust in wrong area', deduction: penalty });
      techniqueScore -= penalty;
    }

    // Evenness
    if (analysis.evenness < 0.6) {
      const penalty = Math.round((1 - analysis.evenness) * 15);
      penalties.push({ reason: 'Uneven distribution', deduction: penalty });
      techniqueScore -= penalty;
    }

    // Speed consistency
    if (analysis.speed < this.MIN_SPEED * 1.5) {
      const penalty = 5;
      penalties.push({ reason: 'Slow dusting motion', deduction: penalty });
      techniqueScore -= penalty;
    } else if (analysis.speed > this.MAX_SPEED * 0.8) {
      const penalty = 5;
      penalties.push({ reason: 'Too fast', deduction: penalty });
      techniqueScore -= penalty;
    }

    // Clamp score
    techniqueScore = Math.max(0, Math.min(100, techniqueScore));

    return {
      type: 'dust',
      success: techniqueScore >= 50,
      techniqueScore,
      penalties,
    };
  }

  render(
    graphics: Graphics,
    path: TouchPath,
    progress: number,
    color: number
  ): void {
    graphics.clear();

    const points = path.points;
    if (points.length < 2) return;

    const alpha = 0.5 * (1 - progress * 0.3);

    // Draw the dust trail as a soft cloud following the path
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const t = i / (points.length - 1);

      // Vary the dust cloud size along the path
      const baseRadius = 15 + Math.sin(t * Math.PI * 4) * 5;

      // Draw soft circles for dust cloud effect
      graphics.circle(point.x, point.y, baseRadius);
      graphics.fill({ color, alpha: alpha * 0.2 });

      // Inner denser core
      graphics.circle(point.x, point.y, baseRadius * 0.6);
      graphics.fill({ color, alpha: alpha * 0.3 });
    }

    // Draw particles scattering from the path
    if (progress > 0) {
      const particleCount = Math.floor(points.length * progress);

      for (let i = 0; i < particleCount; i++) {
        const basePoint = points[i % points.length];

        // Scatter particles around the path
        for (let j = 0; j < 3; j++) {
          const angle = (i * 0.7 + j * 2.1) % (Math.PI * 2);
          const distance = 10 + Math.sin(i * 0.3 + j) * 15;
          const size = 1.5 + Math.random() * 1.5;

          const x = basePoint.x + Math.cos(angle) * distance * progress;
          const y = basePoint.y + Math.sin(angle) * distance * progress + progress * 5; // Gravity

          graphics.circle(x, y, size);
          graphics.fill({ color, alpha: alpha * 0.4 * (1 - progress) });
        }
      }
    }
  }

  /**
   * Render the final settled dust effect
   */
  renderFinal(
    graphics: Graphics,
    path: TouchPath,
    color: number,
    target: DustTarget,
    plateRadius: number
  ): void {
    graphics.clear();

    const points = path.points;
    if (points.length < 2) return;

    const alpha = 0.4; // Subtle final opacity

    // Convert zone bounds to pixels
    const zoneBounds = {
      x: target.zone.bounds.x * plateRadius,
      y: target.zone.bounds.y * plateRadius,
      width: target.zone.bounds.width * plateRadius,
      height: target.zone.bounds.height * plateRadius,
    };

    // Create a grid of small dust particles
    const gridSize = 20;
    const cellWidth = zoneBounds.width / gridSize;
    const cellHeight = zoneBounds.height / gridSize;
    const dustRadius = 25;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cellCenterX = zoneBounds.x + (col + 0.5) * cellWidth;
        const cellCenterY = zoneBounds.y + (row + 0.5) * cellHeight;

        // Check if in avoid zone
        let inAvoidZone = false;
        if (target.avoidZones) {
          for (const avoidZone of target.avoidZones) {
            const avoidCenter = {
              x: avoidZone.center.x * plateRadius,
              y: avoidZone.center.y * plateRadius,
            };
            const avoidRadius = avoidZone.radius * plateRadius;

            const dx = cellCenterX - avoidCenter.x;
            const dy = cellCenterY - avoidCenter.y;
            if (Math.sqrt(dx * dx + dy * dy) < avoidRadius * 1.1) {
              inAvoidZone = true;
              break;
            }
          }
        }

        if (inAvoidZone) continue;

        // Calculate coverage from path proximity
        let coverage = 0;
        for (const point of points) {
          const dx = point.x - cellCenterX;
          const dy = point.y - cellCenterY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < dustRadius) {
            coverage += (1 - dist / dustRadius) * 0.2;
          }
        }
        coverage = Math.min(1, coverage);

        if (coverage > 0.1) {
          // Add some randomness for organic look
          const offsetX = (Math.sin(row * 3.7 + col * 2.3) * 0.5) * cellWidth;
          const offsetY = (Math.cos(row * 2.1 + col * 4.1) * 0.5) * cellHeight;
          const particleSize = 1.5 + coverage * 2;

          graphics.circle(
            cellCenterX + offsetX,
            cellCenterY + offsetY,
            particleSize
          );
          graphics.fill({ color, alpha: alpha * coverage });
        }
      }
    }
  }
}
