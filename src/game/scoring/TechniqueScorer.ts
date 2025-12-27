import type { GestureType } from '@/types';
import type { TouchPath } from '@/types/gestures';

/**
 * Result from scoring a gesture's technique
 */
export interface GestureResult {
  type: GestureType;
  success: boolean;
  techniqueScore: number; // 0-100
  penalties: TechniquePenalty[];
}

/**
 * A penalty applied to a gesture's technique score
 */
export interface TechniquePenalty {
  type: string;
  description: string;
  amount: number; // Points deducted
}

/**
 * Target interface for gesture scoring
 */
interface GestureTarget {
  position?: { x: number; y: number };
  path?: { x: number; y: number; pressure?: number }[];
  zones?: {
    perfect: number;
    great: number;
    good: number;
    acceptable: number;
  };
}

/**
 * TechniqueScorer - Evaluates the execution quality of each gesture type
 *
 * Each gesture has specific technique criteria:
 * - Place: Steady hand, clean release
 * - Swoosh: Fluid motion, consistent speed, proper arc
 * - Dot: Quick and precise, consistent size
 * - Scatter: Even distribution, appropriate density
 * - Quenelle: Smooth arc, proper pause, clean release
 * - Drizzle: Steady flow, consistent width
 * - Tweeze: Precise control, gentle placement
 * - Dust: Even coverage, appropriate density
 */
export class TechniqueScorer {
  /**
   * Score a gesture's technique based on its type and execution
   */
  score(gesture: GestureType, path: TouchPath, target: GestureTarget): GestureResult {
    switch (gesture) {
      case 'place':
        return this.scorePlace(path, target);
      case 'swoosh':
        return this.scoreSwoosh(path, target);
      case 'dot':
        return this.scoreDot(path, target);
      case 'scatter':
        return this.scoreScatter(path, target);
      case 'quenelle':
        return this.scoreQuenelle(path, target);
      case 'drizzle':
        return this.scoreDrizzle(path, target);
      case 'tweeze':
        return this.scoreTweeze(path, target);
      case 'dust':
        return this.scoreDust(path, target);
      default:
        // Fallback for legacy gestures
        return this.scoreGeneric(gesture, path, target);
    }
  }

  /**
   * Place gesture: Evaluate steady hand and clean release
   */
  private scorePlace(path: TouchPath, _target: GestureTarget): GestureResult {
    const penalties: TechniquePenalty[] = [];
    let score = 100;

    // Check for wobble during hold (movement before release)
    const wobble = this.calculateWobble(path);
    if (wobble > 10) {
      const penalty = Math.min(20, (wobble - 10) * 2);
      penalties.push({
        type: 'wobble',
        description: 'Unsteady hand',
        amount: penalty,
      });
      score -= penalty;
    }

    // Check release speed (should be clean, not jerky)
    const releaseJerk = this.calculateReleaseJerk(path);
    if (releaseJerk > 50) {
      const penalty = Math.min(15, (releaseJerk - 50) / 10);
      penalties.push({
        type: 'jerky_release',
        description: 'Jerky release',
        amount: penalty,
      });
      score -= penalty;
    }

    // Bonus for very short, clean placement
    if (path.duration < 300 && wobble < 5) {
      score = Math.min(100, score + 5);
    }

    return {
      type: 'place',
      success: score >= 50,
      techniqueScore: Math.max(0, Math.round(score)),
      penalties,
    };
  }

  /**
   * Swoosh gesture: Evaluate fluid motion, speed consistency, and arc quality
   */
  private scoreSwoosh(path: TouchPath, target: GestureTarget): GestureResult {
    const penalties: TechniquePenalty[] = [];
    let score = 100;

    // Speed variation (should be consistent)
    const speedVariation = this.calculateSpeedVariation(path);
    if (speedVariation > 0.3) {
      const penalty = Math.min(20, (speedVariation - 0.3) * 50);
      penalties.push({
        type: 'speed_variation',
        description: 'Inconsistent speed',
        amount: penalty,
      });
      score -= penalty;
    }

    // Direction reversals (should flow smoothly)
    const reversals = this.countDirectionReversals(path);
    if (reversals > 1) {
      const penalty = (reversals - 1) * 8;
      penalties.push({
        type: 'reversals',
        description: 'Jerky corrections',
        amount: penalty,
      });
      score -= penalty;
    }

    // Path deviation from target (if target path provided)
    if (target.path && target.path.length > 0) {
      const deviation = this.calculatePathDeviation(path, target.path);
      if (deviation > 0.15) {
        const penalty = Math.min(25, (deviation - 0.15) * 100);
        penalties.push({
          type: 'path_deviation',
          description: 'Off-target path',
          amount: penalty,
        });
        score -= penalty;
      }
    }

    // Curvature check (should have smooth arc)
    const curvature = this.calculateCurvatureRatio(path);
    if (curvature < 1.05) {
      penalties.push({
        type: 'too_straight',
        description: 'Too straight',
        amount: 10,
      });
      score -= 10;
    }

    return {
      type: 'swoosh',
      success: score >= 50,
      techniqueScore: Math.max(0, Math.round(score)),
      penalties,
    };
  }

  /**
   * Dot gesture: Quick, precise taps with consistent size
   */
  private scoreDot(path: TouchPath, _target: GestureTarget): GestureResult {
    const penalties: TechniquePenalty[] = [];
    let score = 100;

    // Duration check (should be quick)
    if (path.duration > 400) {
      const penalty = Math.min(20, (path.duration - 400) / 50);
      penalties.push({
        type: 'too_slow',
        description: 'Held too long',
        amount: penalty,
      });
      score -= penalty;
    }

    // Movement check (should be stationary)
    const totalMovement = this.calculateTotalMovement(path);
    if (totalMovement > 15) {
      const penalty = Math.min(15, (totalMovement - 15) * 0.5);
      penalties.push({
        type: 'movement',
        description: 'Too much movement',
        amount: penalty,
      });
      score -= penalty;
    }

    // Bonus for crisp, clean dots
    if (path.duration < 200 && totalMovement < 5) {
      score = Math.min(100, score + 10);
    }

    return {
      type: 'dot',
      success: score >= 50,
      techniqueScore: Math.max(0, Math.round(score)),
      penalties,
    };
  }

  /**
   * Scatter gesture: Even distribution and appropriate pacing
   */
  private scoreScatter(path: TouchPath, _target: GestureTarget): GestureResult {
    const penalties: TechniquePenalty[] = [];
    let score = 100;

    // Check tap rhythm (should be reasonably consistent)
    const rhythmVariation = this.calculateRhythmVariation(path);
    if (rhythmVariation > 0.5) {
      const penalty = Math.min(15, (rhythmVariation - 0.5) * 30);
      penalties.push({
        type: 'irregular_rhythm',
        description: 'Irregular rhythm',
        amount: penalty,
      });
      score -= penalty;
    }

    // Movement between taps (shouldn't be too frantic)
    const avgSpeed = this.calculateAverageSpeed(path);
    if (avgSpeed > 800) {
      penalties.push({
        type: 'too_frantic',
        description: 'Too frantic',
        amount: 10,
      });
      score -= 10;
    }

    return {
      type: 'scatter',
      success: score >= 50,
      techniqueScore: Math.max(0, Math.round(score)),
      penalties,
    };
  }

  /**
   * Quenelle gesture: Smooth arc with proper pause and clean release
   */
  private scoreQuenelle(path: TouchPath, _target: GestureTarget): GestureResult {
    const penalties: TechniquePenalty[] = [];
    let score = 100;

    // Check for proper arc (smooth curve)
    const curvature = this.calculateCurvatureRatio(path);
    if (curvature < 1.1) {
      penalties.push({
        type: 'weak_arc',
        description: 'Weak arc',
        amount: 15,
      });
      score -= 15;
    }

    // Check for pause phase (speed should drop significantly mid-gesture)
    const hasPause = this.detectPausePhase(path);
    if (!hasPause) {
      penalties.push({
        type: 'no_pause',
        description: 'Missing pause',
        amount: 20,
      });
      score -= 20;
    }

    // Speed variation during arc should be controlled
    const speedVariation = this.calculateSpeedVariation(path);
    if (speedVariation > 0.6) {
      const penalty = Math.min(15, (speedVariation - 0.6) * 25);
      penalties.push({
        type: 'jerky_motion',
        description: 'Jerky motion',
        amount: penalty,
      });
      score -= penalty;
    }

    return {
      type: 'quenelle',
      success: score >= 50,
      techniqueScore: Math.max(0, Math.round(score)),
      penalties,
    };
  }

  /**
   * Drizzle gesture: Steady flow with consistent width
   */
  private scoreDrizzle(path: TouchPath, target: GestureTarget): GestureResult {
    const penalties: TechniquePenalty[] = [];
    let score = 100;

    // Speed consistency (should be slow and steady)
    const speedVariation = this.calculateSpeedVariation(path);
    if (speedVariation > 0.4) {
      const penalty = Math.min(20, (speedVariation - 0.4) * 40);
      penalties.push({
        type: 'unsteady_flow',
        description: 'Unsteady flow',
        amount: penalty,
      });
      score -= penalty;
    }

    // Check for minimum speed (shouldn't be too fast)
    const avgSpeed = this.calculateAverageSpeed(path);
    if (avgSpeed > 400) {
      penalties.push({
        type: 'too_fast',
        description: 'Too fast',
        amount: 15,
      });
      score -= 15;
    }

    // Path smoothness
    const reversals = this.countDirectionReversals(path);
    if (reversals > 2) {
      const penalty = (reversals - 2) * 5;
      penalties.push({
        type: 'wobbly',
        description: 'Wobbly line',
        amount: penalty,
      });
      score -= penalty;
    }

    // Path adherence
    if (target.path && target.path.length > 0) {
      const deviation = this.calculatePathDeviation(path, target.path);
      if (deviation > 0.1) {
        const penalty = Math.min(20, (deviation - 0.1) * 80);
        penalties.push({
          type: 'off_path',
          description: 'Off target path',
          amount: penalty,
        });
        score -= penalty;
      }
    }

    return {
      type: 'drizzle',
      success: score >= 50,
      techniqueScore: Math.max(0, Math.round(score)),
      penalties,
    };
  }

  /**
   * Tweeze gesture: Precise control with gentle placement
   */
  private scoreTweeze(path: TouchPath, _target: GestureTarget): GestureResult {
    const penalties: TechniquePenalty[] = [];
    let score = 100;

    // Wobble check (hand should be very steady)
    const wobble = this.calculateWobble(path);
    if (wobble > 5) {
      const penalty = Math.min(25, (wobble - 5) * 3);
      penalties.push({
        type: 'unsteady',
        description: 'Unsteady hand',
        amount: penalty,
      });
      score -= penalty;
    }

    // Approach speed (should slow down at the end)
    const finalSpeed = this.calculateFinalSpeed(path);
    if (finalSpeed > 100) {
      const penalty = Math.min(20, (finalSpeed - 100) / 10);
      penalties.push({
        type: 'rushed',
        description: 'Rushed placement',
        amount: penalty,
      });
      score -= penalty;
    }

    // Duration (should take appropriate time for precision)
    if (path.duration < 200) {
      penalties.push({
        type: 'too_quick',
        description: 'Too hasty',
        amount: 10,
      });
      score -= 10;
    }

    return {
      type: 'tweeze',
      success: score >= 50,
      techniqueScore: Math.max(0, Math.round(score)),
      penalties,
    };
  }

  /**
   * Dust gesture: Even coverage with controlled motion
   */
  private scoreDust(path: TouchPath, _target: GestureTarget): GestureResult {
    const penalties: TechniquePenalty[] = [];
    let score = 100;

    // Check for proper coverage motion (should have horizontal movement)
    const horizontalCoverage = this.calculateHorizontalCoverage(path);
    if (horizontalCoverage < 0.3) {
      penalties.push({
        type: 'limited_coverage',
        description: 'Limited coverage',
        amount: 20,
      });
      score -= 20;
    }

    // Speed should be moderate (not too fast or slow)
    const avgSpeed = this.calculateAverageSpeed(path);
    if (avgSpeed > 600) {
      penalties.push({
        type: 'too_fast',
        description: 'Too aggressive',
        amount: 15,
      });
      score -= 15;
    } else if (avgSpeed < 100) {
      penalties.push({
        type: 'too_slow',
        description: 'Too tentative',
        amount: 10,
      });
      score -= 10;
    }

    // Even motion (shouldn't be jerky)
    const speedVariation = this.calculateSpeedVariation(path);
    if (speedVariation > 0.5) {
      const penalty = Math.min(15, (speedVariation - 0.5) * 30);
      penalties.push({
        type: 'uneven',
        description: 'Uneven dusting',
        amount: penalty,
      });
      score -= penalty;
    }

    return {
      type: 'dust',
      success: score >= 50,
      techniqueScore: Math.max(0, Math.round(score)),
      penalties,
    };
  }

  /**
   * Generic scoring for unknown gesture types
   */
  private scoreGeneric(gesture: GestureType, path: TouchPath, _target: GestureTarget): GestureResult {
    const penalties: TechniquePenalty[] = [];
    let score = 80; // Default baseline

    // Basic wobble check
    const wobble = this.calculateWobble(path);
    if (wobble > 20) {
      score -= Math.min(20, wobble - 20);
    }

    return {
      type: gesture,
      success: score >= 50,
      techniqueScore: Math.max(0, Math.round(score)),
      penalties,
    };
  }

  // === Helper methods ===

  private calculateWobble(path: TouchPath): number {
    if (path.points.length < 3) return 0;

    let totalDeviation = 0;
    for (let i = 1; i < path.points.length - 1; i++) {
      const prev = path.points[i - 1];
      const curr = path.points[i];
      const next = path.points[i + 1];

      // Calculate deviation from the line between prev and next
      const expectedX = (prev.x + next.x) / 2;
      const expectedY = (prev.y + next.y) / 2;
      const deviation = Math.sqrt(
        Math.pow(curr.x - expectedX, 2) + Math.pow(curr.y - expectedY, 2)
      );
      totalDeviation += deviation;
    }

    return totalDeviation / (path.points.length - 2);
  }

  private calculateReleaseJerk(path: TouchPath): number {
    if (path.points.length < 3) return 0;

    const lastPoints = path.points.slice(-3);
    let maxAcceleration = 0;

    for (let i = 1; i < lastPoints.length; i++) {
      const dt = lastPoints[i].timestamp - lastPoints[i - 1].timestamp;
      if (dt === 0) continue;

      const dx = lastPoints[i].x - lastPoints[i - 1].x;
      const dy = lastPoints[i].y - lastPoints[i - 1].y;
      const speed = Math.sqrt(dx * dx + dy * dy) / dt;
      maxAcceleration = Math.max(maxAcceleration, speed);
    }

    return maxAcceleration * 1000; // Convert to pixels per second
  }

  private calculateSpeedVariation(path: TouchPath): number {
    if (path.points.length < 3) return 0;

    const speeds: number[] = [];
    for (let i = 1; i < path.points.length; i++) {
      const dt = path.points[i].timestamp - path.points[i - 1].timestamp;
      if (dt === 0) continue;

      const dx = path.points[i].x - path.points[i - 1].x;
      const dy = path.points[i].y - path.points[i - 1].y;
      speeds.push(Math.sqrt(dx * dx + dy * dy) / dt);
    }

    if (speeds.length === 0) return 0;

    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    if (avgSpeed === 0) return 0;

    const variance =
      speeds.reduce((sum, s) => sum + Math.pow(s - avgSpeed, 2), 0) / speeds.length;
    return Math.sqrt(variance) / avgSpeed; // Coefficient of variation
  }

  private countDirectionReversals(path: TouchPath): number {
    if (path.points.length < 3) return 0;

    let reversals = 0;
    let lastDx = 0;
    let lastDy = 0;

    for (let i = 1; i < path.points.length; i++) {
      const dx = path.points[i].x - path.points[i - 1].x;
      const dy = path.points[i].y - path.points[i - 1].y;

      if (i > 1) {
        if ((lastDx > 0 && dx < 0) || (lastDx < 0 && dx > 0)) reversals++;
        if ((lastDy > 0 && dy < 0) || (lastDy < 0 && dy > 0)) reversals++;
      }

      lastDx = dx;
      lastDy = dy;
    }

    return reversals;
  }

  private calculatePathDeviation(
    path: TouchPath,
    targetPath: { x: number; y: number }[]
  ): number {
    if (path.points.length === 0 || targetPath.length === 0) return 0;

    let totalDeviation = 0;
    let count = 0;

    for (const point of path.points) {
      let minDist = Infinity;
      for (const target of targetPath) {
        const dist = Math.sqrt(
          Math.pow(point.x - target.x, 2) + Math.pow(point.y - target.y, 2)
        );
        minDist = Math.min(minDist, dist);
      }
      totalDeviation += minDist;
      count++;
    }

    return count > 0 ? totalDeviation / count : 0;
  }

  private calculateCurvatureRatio(path: TouchPath): number {
    if (path.points.length < 2) return 1;

    const first = path.points[0];
    const last = path.points[path.points.length - 1];
    const directDistance = Math.sqrt(
      Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2)
    );

    if (directDistance === 0) return 1;

    let pathLength = 0;
    for (let i = 1; i < path.points.length; i++) {
      const dx = path.points[i].x - path.points[i - 1].x;
      const dy = path.points[i].y - path.points[i - 1].y;
      pathLength += Math.sqrt(dx * dx + dy * dy);
    }

    return pathLength / directDistance;
  }

  private calculateTotalMovement(path: TouchPath): number {
    if (path.points.length < 2) return 0;

    let total = 0;
    for (let i = 1; i < path.points.length; i++) {
      const dx = path.points[i].x - path.points[i - 1].x;
      const dy = path.points[i].y - path.points[i - 1].y;
      total += Math.sqrt(dx * dx + dy * dy);
    }
    return total;
  }

  private calculateRhythmVariation(path: TouchPath): number {
    // For scatter, we'd need tap timestamps - for now, use speed variation
    return this.calculateSpeedVariation(path);
  }

  private calculateAverageSpeed(path: TouchPath): number {
    if (path.duration === 0) return 0;
    const totalMovement = this.calculateTotalMovement(path);
    return (totalMovement / path.duration) * 1000; // pixels per second
  }

  private detectPausePhase(path: TouchPath): boolean {
    if (path.points.length < 5) return false;

    // Look for a significant speed drop in the middle portion
    const midStart = Math.floor(path.points.length * 0.3);
    const midEnd = Math.floor(path.points.length * 0.7);

    for (let i = midStart; i < midEnd; i++) {
      const dt = path.points[i + 1]?.timestamp - path.points[i].timestamp;
      if (dt && dt > 200) return true; // 200ms pause detected

      // Or very slow movement
      if (dt && dt > 0) {
        const dx = path.points[i + 1].x - path.points[i].x;
        const dy = path.points[i + 1].y - path.points[i].y;
        const speed = Math.sqrt(dx * dx + dy * dy) / dt;
        if (speed < 0.05) return true;
      }
    }

    return false;
  }

  private calculateFinalSpeed(path: TouchPath): number {
    if (path.points.length < 2) return 0;

    const lastTwo = path.points.slice(-2);
    const dt = lastTwo[1].timestamp - lastTwo[0].timestamp;
    if (dt === 0) return 0;

    const dx = lastTwo[1].x - lastTwo[0].x;
    const dy = lastTwo[1].y - lastTwo[0].y;
    return (Math.sqrt(dx * dx + dy * dy) / dt) * 1000;
  }

  private calculateHorizontalCoverage(path: TouchPath): number {
    if (path.points.length < 2) return 0;

    const xs = path.points.map((p) => p.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);

    // Return as fraction of typical plate width (assume ~400px plate)
    return (maxX - minX) / 400;
  }
}

// Singleton instance
export const techniqueScorer = new TechniqueScorer();
