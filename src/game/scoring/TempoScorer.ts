/**
 * TempoScorer - Evaluates time-based performance
 *
 * Scoring based on completion time relative to par time:
 * - Under par: Excellent (90-100)
 * - At par: Good (80-90)
 * - Over par: Acceptable to slow (50-80)
 * - Over max time: Failure
 *
 * The tempo score rewards efficient, rhythmic service without
 * penalizing players who take their time for precision.
 */

export type TempoRating = 'excellent' | 'good' | 'acceptable' | 'slow';

export interface TempoResult {
  score: number; // 0-100
  timeUsed: number; // seconds
  parTime: number;
  maxTime: number;
  rating: TempoRating;
  bonusSeconds?: number; // Seconds under par (if applicable)
}

/**
 * Calculate tempo score based on time used vs par/max time
 *
 * Scoring curve:
 * - 80% of par or less: 100 points (excellent)
 * - 100% of par: 90 points (excellent)
 * - 110% of par: 85 points (good)
 * - 125% of par: 80 points (good)
 * - 150% of par: 70 points (acceptable)
 * - Beyond 150%: Linear decline to 50 at max time (slow)
 *
 * @param timeUsed - Actual time taken in seconds
 * @param parTime - Target time for skilled completion
 * @param maxTime - Maximum allowed time before failure
 * @returns TempoResult with score and rating
 */
export function calculateTempo(
  timeUsed: number,
  parTime: number,
  maxTime: number
): TempoResult {
  // Handle edge cases
  if (timeUsed <= 0) {
    return {
      score: 100,
      timeUsed: 0,
      parTime,
      maxTime,
      rating: 'excellent',
      bonusSeconds: parTime,
    };
  }

  if (timeUsed >= maxTime) {
    return {
      score: 0,
      timeUsed,
      parTime,
      maxTime,
      rating: 'slow',
    };
  }

  const parRatio = timeUsed / parTime;

  let score: number;
  let rating: TempoRating;
  let bonusSeconds: number | undefined;

  if (parRatio <= 0.8) {
    // Well under par - perfect score
    score = 100;
    rating = 'excellent';
    bonusSeconds = parTime - timeUsed;
  } else if (parRatio <= 1.0) {
    // At or slightly under par - excellent
    score = 90 + (1 - parRatio) * 50; // 90-100
    rating = 'excellent';
    bonusSeconds = parTime - timeUsed;
  } else if (parRatio <= 1.1) {
    // Slightly over par - still good
    score = 85 + (1.1 - parRatio) * 50; // 85-90
    rating = 'good';
  } else if (parRatio <= 1.25) {
    // Moderately over par
    score = 80 + (1.25 - parRatio) * 33.33; // 80-85
    rating = 'good';
  } else if (parRatio <= 1.5) {
    // Significantly over par
    score = 70 + (1.5 - parRatio) * 40; // 70-80
    rating = 'acceptable';
  } else {
    // Approaching max time - linear decline
    const overParTime = parTime * 1.5;
    const remainingTime = maxTime - overParTime;
    const usedRemaining = timeUsed - overParTime;

    if (remainingTime <= 0) {
      score = 50;
    } else {
      const progress = Math.min(1, usedRemaining / remainingTime);
      score = 70 - progress * 20; // 70 down to 50
    }
    rating = 'slow';
  }

  return {
    score: Math.max(0, Math.round(score)),
    timeUsed,
    parTime,
    maxTime,
    rating,
    bonusSeconds,
  };
}

/**
 * Get a display label for the tempo rating
 */
export function getTempoLabel(rating: TempoRating): string {
  switch (rating) {
    case 'excellent':
      return 'Swift Service';
    case 'good':
      return 'Good Pace';
    case 'acceptable':
      return 'Steady';
    case 'slow':
      return 'Take Your Time';
  }
}

/**
 * Calculate the percentage of time used relative to par
 */
export function getTimePercentage(timeUsed: number, parTime: number): number {
  if (parTime <= 0) return 100;
  return Math.round((timeUsed / parTime) * 100);
}

/**
 * Format time as MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
