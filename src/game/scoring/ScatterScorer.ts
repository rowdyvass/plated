import type { PlacementZone } from '../entities/Ghost';
import type { Particle } from '../rendering/ParticleSystem';

export interface ScatterTarget {
  id: string;
  ingredientId: string;
  zone: {
    center: { x: number; y: number };  // Normalized -1 to 1
    radius: number;  // As fraction of plate radius
  };
  idealCount: number;
}

export interface ScatterResult {
  zone: PlacementZone;
  score: number;           // 0-100
  inZoneCount: number;     // Particles that landed in zone
  totalCount: number;      // Total particles on plate
  coverage: number;        // 0-1, how well distributed
  containment: number;     // 0-1, percentage in zone
}

/**
 * Score a scatter result based on particle distribution
 */
export function scoreScatter(
  particles: Particle[],
  target: ScatterTarget,
  plateRadius: number
): ScatterResult {
  // Convert target zone to pixel coordinates
  const zoneCenterX = target.zone.center.x * plateRadius;
  const zoneCenterY = target.zone.center.y * plateRadius;
  const zoneRadius = target.zone.radius * plateRadius;

  // Filter to on-plate particles only
  const onPlateParticles = particles.filter(p => !p.offPlate);
  const totalCount = onPlateParticles.length;

  if (totalCount === 0) {
    return {
      zone: 'miss',
      score: 0,
      inZoneCount: 0,
      totalCount: 0,
      coverage: 0,
      containment: 0,
    };
  }

  // Count particles in zone
  const inZoneParticles = onPlateParticles.filter(p => {
    const dx = p.x - zoneCenterX;
    const dy = p.y - zoneCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= zoneRadius;
  });

  const inZoneCount = inZoneParticles.length;
  const containment = inZoneCount / totalCount;

  // Calculate coverage (how well distributed within zone)
  const coverage = calculateCoverage(inZoneParticles, zoneCenterX, zoneCenterY, zoneRadius);

  // Calculate distribution quality (not too clumped, not too sparse)
  const distribution = calculateDistribution(inZoneParticles, zoneRadius);

  // Calculate overall score
  // Containment: 50% weight (did particles land in zone?)
  // Coverage: 30% weight (are they spread out?)
  // Distribution: 20% weight (aesthetic distribution)
  const rawScore = (
    containment * 0.5 +
    coverage * 0.3 +
    distribution * 0.2
  ) * 100;

  // Apply bonus/penalty based on count vs ideal
  const countRatio = totalCount / target.idealCount;
  let countModifier = 1;
  if (countRatio < 0.5) {
    countModifier = 0.7; // Too few particles
  } else if (countRatio > 1.5) {
    countModifier = 0.85; // Too many particles
  }

  const score = Math.round(rawScore * countModifier);

  // Determine zone based on score
  const zone = getZoneFromScore(score, containment);

  return {
    zone,
    score,
    inZoneCount,
    totalCount,
    coverage,
    containment,
  };
}

/**
 * Calculate coverage: how well particles fill the zone
 */
function calculateCoverage(
  particles: Particle[],
  centerX: number,
  centerY: number,
  _radius: number
): number {
  if (particles.length < 2) return particles.length > 0 ? 0.5 : 0;

  // Divide zone into quadrants and check distribution
  const quadrants = [0, 0, 0, 0]; // Top-left, top-right, bottom-left, bottom-right

  for (const p of particles) {
    const dx = p.x - centerX;
    const dy = p.y - centerY;

    const quadrant =
      (dx >= 0 ? 1 : 0) +
      (dy >= 0 ? 2 : 0);

    quadrants[quadrant]++;
  }

  // Calculate evenness of distribution
  const total = particles.length;
  const ideal = total / 4;

  let variance = 0;
  for (const count of quadrants) {
    variance += Math.pow(count - ideal, 2);
  }
  variance /= 4;

  // Convert variance to coverage score (lower variance = higher coverage)
  const maxVariance = Math.pow(total, 2) / 4; // All in one quadrant
  const coverage = 1 - Math.sqrt(variance / maxVariance);

  return Math.max(0, Math.min(1, coverage));
}

/**
 * Calculate distribution quality (not too clumped)
 */
function calculateDistribution(
  particles: Particle[],
  zoneRadius: number
): number {
  if (particles.length < 2) return 1;

  // Calculate average nearest-neighbor distance
  let totalNearestDist = 0;

  for (let i = 0; i < particles.length; i++) {
    let nearestDist = Infinity;

    for (let j = 0; j < particles.length; j++) {
      if (i === j) continue;

      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < nearestDist) {
        nearestDist = dist;
      }
    }

    totalNearestDist += nearestDist;
  }

  const avgNearestDist = totalNearestDist / particles.length;

  // Ideal nearest-neighbor distance for random distribution
  // Roughly: r / sqrt(n) where r is radius and n is count
  const idealDist = zoneRadius / Math.sqrt(particles.length);

  // Score based on how close to ideal (not too clumped, not too sparse)
  const ratio = avgNearestDist / idealDist;

  // Optimal ratio is around 0.5-1.5
  if (ratio < 0.3) {
    return 0.5; // Too clumped
  } else if (ratio > 2) {
    return 0.6; // Too sparse
  } else if (ratio >= 0.5 && ratio <= 1.5) {
    return 1; // Optimal
  } else {
    // Linear interpolation
    if (ratio < 0.5) {
      return 0.5 + (ratio - 0.3) / 0.2 * 0.5;
    } else {
      return 1 - (ratio - 1.5) / 0.5 * 0.4;
    }
  }
}

/**
 * Get placement zone from score and containment
 */
function getZoneFromScore(score: number, containment: number): PlacementZone {
  // Minimum containment thresholds
  if (containment < 0.2) return 'miss';
  if (containment < 0.4) return 'acceptable';

  // Score-based zones
  if (score >= 85) return 'perfect';
  if (score >= 70) return 'great';
  if (score >= 55) return 'good';
  if (score >= 40) return 'acceptable';

  return 'miss';
}

/**
 * Get a label for the scatter result
 */
export function getScatterLabel(result: ScatterResult): string {
  if (result.containment < 0.2) {
    return 'Scattered wide!';
  }
  if (result.containment < 0.4) {
    return 'Most missed the zone';
  }

  switch (result.zone) {
    case 'perfect':
      return 'Perfect scatter!';
    case 'great':
      return 'Great distribution';
    case 'good':
      return 'Good coverage';
    case 'acceptable':
      return 'Acceptable';
    case 'miss':
      return 'Missed';
  }
}

/**
 * Quick check if a position is in a zone
 */
export function isInZone(
  x: number,
  y: number,
  target: ScatterTarget,
  plateRadius: number
): boolean {
  const zoneCenterX = target.zone.center.x * plateRadius;
  const zoneCenterY = target.zone.center.y * plateRadius;
  const zoneRadius = target.zone.radius * plateRadius;

  const dx = x - zoneCenterX;
  const dy = y - zoneCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance <= zoneRadius;
}
