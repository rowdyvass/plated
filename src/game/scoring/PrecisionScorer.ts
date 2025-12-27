import type { GestureTarget, PointGestureTarget, LegacyGestureTarget } from '@/types/dishes';
import type { PlacementZone } from '../entities/Ghost';

export interface PrecisionResult {
  zone: PlacementZone;
  score: number;        // 0-100
  distance: number;     // pixels from target center
  maxDistance: number;  // acceptable zone radius (in pixels)
}

// Type guard for point-based targets
function isPointBasedTarget(target: GestureTarget | LegacyGestureTarget): target is PointGestureTarget | LegacyGestureTarget {
  // Path targets have type === 'path', everything else is point-based
  if ('type' in target && target.type === 'path') {
    return false;
  }
  return true;
}

export function calculatePlacementZone(
  dropPosition: { x: number; y: number },
  target: GestureTarget | LegacyGestureTarget,
  plateRadius: number
): PlacementZone {
  // Only works for point-based targets
  if (!isPointBasedTarget(target)) {
    return 'miss';
  }

  // Convert target position from normalized (-1 to 1) to plate coordinates
  const targetX = target.position.x * plateRadius;
  const targetY = target.position.y * plateRadius;

  // Calculate distance from drop position to target center
  const dx = dropPosition.x - targetX;
  const dy = dropPosition.y - targetY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Convert distance to percentage of plate radius
  const distanceRatio = distance / plateRadius;

  // Compare against zone thresholds (zones are defined as % of plate radius)
  if (distanceRatio <= target.zones.perfect) {
    return 'perfect';
  }
  if (distanceRatio <= target.zones.great) {
    return 'great';
  }
  if (distanceRatio <= target.zones.good) {
    return 'good';
  }
  if (distanceRatio <= target.zones.acceptable) {
    return 'acceptable';
  }

  return 'miss';
}

export function scorePlacement(
  dropPosition: { x: number; y: number },
  target: GestureTarget | LegacyGestureTarget,
  plateRadius: number
): PrecisionResult {
  // Only works for point-based targets
  if (!isPointBasedTarget(target)) {
    return {
      zone: 'miss',
      score: 0,
      distance: 0,
      maxDistance: 0,
    };
  }

  // Convert target position from normalized (-1 to 1) to plate coordinates
  const targetX = target.position.x * plateRadius;
  const targetY = target.position.y * plateRadius;

  // Calculate distance from drop position to target center
  const dx = dropPosition.x - targetX;
  const dy = dropPosition.y - targetY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Calculate max distance (acceptable zone in pixels)
  const maxDistance = target.zones.acceptable * plateRadius;

  // Get zone and score
  const zone = calculatePlacementZone(dropPosition, target, plateRadius);
  const score = getZoneScore(zone);

  return {
    zone,
    score,
    distance,
    maxDistance,
  };
}

export function getZoneScore(zone: PlacementZone): number {
  switch (zone) {
    case 'perfect':
      return 100;
    case 'great':
      return 85;
    case 'good':
      return 70;
    case 'acceptable':
      return 50;
    case 'miss':
      return 0;
  }
}

export function getZoneLabel(zone: PlacementZone): string {
  switch (zone) {
    case 'perfect':
      return 'Perfect!';
    case 'great':
      return 'Great';
    case 'good':
      return 'Good';
    case 'acceptable':
      return 'Acceptable';
    case 'miss':
      return 'Miss';
  }
}
