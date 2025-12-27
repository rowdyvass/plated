import type { PlacedIngredient, ScoreBreakdown, StarRating } from '@/types';
import type { DishDefinition } from '@/types/dishes';
import type { PrecisionResult } from './PrecisionScorer';
import type { GestureResult } from './TechniqueScorer';
import type { TempoResult } from './TempoScorer';
import type { FlowState } from './FlowTracker';
import { calculateTempo } from './TempoScorer';

/**
 * Complete final score breakdown
 */
export interface FinalScore {
  precision: number; // 0-100
  technique: number; // 0-100
  tempo: number; // 0-100
  flowBonus: number; // 0-8
  flowLabel: string | null;

  finalScore: number; // Combined score
  stars: 0 | 1 | 2 | 3;

  breakdown: {
    precisionWeight: 0.5;
    techniqueWeight: 0.3;
    tempoWeight: 0.2;

    precisionContribution: number;
    techniqueContribution: number;
    tempoContribution: number;
  };
}

/**
 * Calculate the final score for a completed dish
 *
 * Scoring weights:
 * - Precision (50%): How close placements are to targets
 * - Technique (30%): Gesture execution quality
 * - Tempo (20%): Time performance vs par
 * - Flow Bonus (+0-8): Bonus for rhythmic, flowing service
 */
export function calculateFinalScore(
  precisionResults: PrecisionResult[],
  techniqueResults: GestureResult[],
  timeElapsed: number,
  flowState: FlowState,
  dish: DishDefinition
): FinalScore {
  // Calculate average precision
  const precision =
    precisionResults.length > 0
      ? precisionResults.reduce((sum, r) => sum + r.score, 0) / precisionResults.length
      : 0;

  // Calculate average technique
  const technique =
    techniqueResults.length > 0
      ? techniqueResults.reduce((sum, r) => sum + r.techniqueScore, 0) /
        techniqueResults.length
      : 0;

  // Calculate tempo score
  const tempoResult = calculateTempo(timeElapsed, dish.parTime, dish.maxTime);
  const tempo = tempoResult.score;

  // Get flow bonus
  const flowBonus = flowState.bonus;
  const flowLabel = flowState.bonusLabel;

  // Apply dish modifiers (if any)
  const modifiers = dish.scoringModifiers ?? {
    precisionMultiplier: 1,
    techniqueMultiplier: 1,
    tempoMultiplier: 1,
  };

  const modifiedPrecision = precision * modifiers.precisionMultiplier;
  const modifiedTechnique = technique * modifiers.techniqueMultiplier;
  const modifiedTempo = tempo * modifiers.tempoMultiplier;

  // Calculate weighted contributions
  const precisionContribution = modifiedPrecision * 0.5;
  const techniqueContribution = modifiedTechnique * 0.3;
  const tempoContribution = modifiedTempo * 0.2;

  // Final score with flow bonus
  const rawFinalScore =
    precisionContribution + techniqueContribution + tempoContribution + flowBonus;

  // Clamp to 0-100 (flow bonus can push slightly above, but cap at 100)
  const finalScore = Math.min(100, Math.round(rawFinalScore));

  // Determine stars based on dish thresholds or defaults
  const thresholds = dish.starThresholds ?? {
    threeStar: 90,
    twoStar: 70,
    oneStar: 50,
  };

  const stars: 0 | 1 | 2 | 3 =
    finalScore >= thresholds.threeStar
      ? 3
      : finalScore >= thresholds.twoStar
        ? 2
        : finalScore >= thresholds.oneStar
          ? 1
          : 0;

  return {
    precision: Math.round(precision),
    technique: Math.round(technique),
    tempo: Math.round(tempo),
    flowBonus,
    flowLabel,
    finalScore,
    stars,
    breakdown: {
      precisionWeight: 0.5,
      techniqueWeight: 0.3,
      tempoWeight: 0.2,
      precisionContribution: Math.round(precisionContribution),
      techniqueContribution: Math.round(techniqueContribution),
      tempoContribution: Math.round(tempoContribution),
    },
  };
}

/**
 * Legacy ScoreCalculator class for backward compatibility
 * Used by existing code that expects the class-based API
 */
export class ScoreCalculator {
  calculateScore(
    placed: PlacedIngredient[],
    target: PlacedIngredient[]
  ): ScoreBreakdown {
    const composition = this.calculateComposition(placed, target);
    const balance = this.calculateBalance(placed);
    const technique = this.calculateTechnique(placed);
    const creativity = this.calculateCreativity(placed, target);

    const total = Math.round(
      composition * 0.35 + balance * 0.25 + technique * 0.25 + creativity * 0.15
    );

    return {
      composition,
      balance,
      technique,
      creativity,
      total,
      stars: this.calculateStars(total),
    };
  }

  private calculateComposition(
    placed: PlacedIngredient[],
    target: PlacedIngredient[]
  ): number {
    if (target.length === 0) return 50;

    let matchScore = 0;
    const usedTargets = new Set<number>();

    for (const placedItem of placed) {
      let bestMatch = 0;
      let bestIndex = -1;

      for (let i = 0; i < target.length; i++) {
        if (usedTargets.has(i)) continue;

        const targetItem = target[i];
        if (placedItem.ingredientId === targetItem.ingredientId) {
          const distance = Math.sqrt(
            Math.pow(placedItem.position.x - targetItem.position.x, 2) +
              Math.pow(placedItem.position.y - targetItem.position.y, 2)
          );
          const positionScore = Math.max(0, 100 - distance * 200);

          if (positionScore > bestMatch) {
            bestMatch = positionScore;
            bestIndex = i;
          }
        }
      }

      if (bestIndex >= 0) {
        usedTargets.add(bestIndex);
        matchScore += bestMatch;
      }
    }

    return Math.round(matchScore / Math.max(target.length, 1));
  }

  private calculateBalance(placed: PlacedIngredient[]): number {
    if (placed.length === 0) return 0;
    if (placed.length === 1) return 70;

    // Calculate center of mass
    const centerX =
      placed.reduce((sum, p) => sum + p.position.x, 0) / placed.length;
    const centerY =
      placed.reduce((sum, p) => sum + p.position.y, 0) / placed.length;

    // Score based on how centered the composition is
    const offsetFromCenter = Math.sqrt(centerX * centerX + centerY * centerY);
    const balanceScore = Math.max(0, 100 - offsetFromCenter * 100);

    return Math.round(balanceScore);
  }

  private calculateTechnique(placed: PlacedIngredient[]): number {
    if (placed.length === 0) return 0;

    // Score based on gesture variety and execution
    const gesturesUsed = new Set(
      placed.map((p) => p.gestureApplied).filter(Boolean)
    );
    const varietyBonus = Math.min(gesturesUsed.size * 15, 30);

    return Math.min(100, 70 + varietyBonus);
  }

  private calculateCreativity(
    placed: PlacedIngredient[],
    target: PlacedIngredient[]
  ): number {
    if (placed.length === 0) return 0;

    // Reward deviations that still look intentional
    const extraIngredients = placed.length - target.length;
    const creativityBonus = Math.max(0, Math.min(extraIngredients * 10, 30));

    return Math.min(100, 70 + creativityBonus);
  }

  private calculateStars(total: number): StarRating {
    if (total >= 90) return 3;
    if (total >= 70) return 2;
    if (total >= 50) return 1;
    return 0;
  }
}

/**
 * Helper to calculate stars from a raw score using default or custom thresholds
 */
export function calculateStarsFromScore(
  score: number,
  thresholds?: { threeStar: number; twoStar: number; oneStar: number }
): StarRating {
  const t = thresholds ?? { threeStar: 90, twoStar: 70, oneStar: 50 };

  if (score >= t.threeStar) return 3;
  if (score >= t.twoStar) return 2;
  if (score >= t.oneStar) return 1;
  return 0;
}

/**
 * Helper to calculate a simplified score when full data isn't available
 * Used for quick scoring during gameplay feedback
 */
export function calculateQuickScore(
  precisionResults: PrecisionResult[],
  tempoResult?: TempoResult
): { score: number; stars: StarRating } {
  const precision =
    precisionResults.length > 0
      ? precisionResults.reduce((sum, r) => sum + r.score, 0) / precisionResults.length
      : 0;

  const tempo = tempoResult?.score ?? 80;

  // Simplified 60/40 split when technique data isn't available
  const score = Math.round(precision * 0.6 + tempo * 0.4);
  const stars = calculateStarsFromScore(score);

  return { score, stars };
}
