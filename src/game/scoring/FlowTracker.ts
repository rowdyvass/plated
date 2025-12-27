import type { GestureType } from '@/types';
import type { GestureResult } from './TechniqueScorer';

/**
 * FlowTracker - Tracks rhythmic flow during plating
 *
 * Flow represents the chef's "zone" - when gestures flow naturally
 * from one to the next without hesitation or mistakes.
 *
 * Flow meter builds through:
 * - Successful gesture completions (+2)
 * - Perfect technique (95+) (+3)
 * - Natural gesture pairs in quick succession (+5)
 *
 * Flow breaks when:
 * - Long hesitation between gestures (-10)
 * - Failed gesture (reset to 0)
 * - Major technique error (reset to 0)
 *
 * Flow bonuses at thresholds:
 * - 10+ meter: "Steady Hands" (+2 points)
 * - 25+ meter: "Clean Service" (+5 points)
 * - 40+ meter: "In the Zone" (+8 points)
 */

export interface FlowState {
  meter: number; // Current flow value (0-50)
  bonus: number; // Earned bonus (0, 2, 5, or 8)
  bonusLabel: string | null; // "Steady Hands", "Clean Service", "In the Zone"
  streak: number; // Consecutive successful gestures
  peakMeter: number; // Highest meter reached this session
}

export type FlowBonusTier = 'none' | 'steady' | 'clean' | 'zone';

/**
 * Natural gesture pairs that build extra flow
 * These are gestures that naturally follow each other in plating
 */
const NATURAL_PAIRS: Map<GestureType, GestureType[]> = new Map([
  // Swoosh leads to placement or dots
  ['swoosh', ['place', 'dot', 'tweeze']],
  // Placing the main element leads to garnishing
  ['place', ['dot', 'tweeze', 'scatter', 'quenelle']],
  // Dots often come in sequence or lead to more garnishing
  ['dot', ['dot', 'tweeze', 'scatter']],
  // Tweeze placements naturally chain
  ['tweeze', ['tweeze', 'scatter', 'dot']],
  // Drizzle leads to finishing touches
  ['drizzle', ['dot', 'dust', 'scatter']],
  // Quenelle is often followed by garnishing
  ['quenelle', ['place', 'scatter', 'tweeze']],
  // Scatter leads to more scatter or finishing
  ['scatter', ['scatter', 'dust', 'drizzle']],
  // Dust is usually a final touch, but can lead to more dust
  ['dust', ['dust']],
]);

/**
 * Threshold for considering gestures as "quick succession"
 */
const QUICK_SUCCESSION_MS = 1500;

/**
 * Threshold for hesitation penalty
 */
const HESITATION_THRESHOLD_MS = 3000;

/**
 * Maximum flow meter value
 */
const MAX_METER = 50;

export class FlowTracker {
  private meter: number = 0;
  private lastGestureTime: number = 0;
  private lastGesture: GestureType | null = null;
  private streak: number = 0;
  private peakMeter: number = 0;

  /**
   * Reset the flow tracker for a new dish
   */
  reset(): void {
    this.meter = 0;
    this.lastGestureTime = 0;
    this.lastGesture = null;
    this.streak = 0;
    this.peakMeter = 0;
  }

  /**
   * Called when a gesture is completed
   */
  onGestureComplete(
    gesture: GestureType,
    result: GestureResult,
    timestamp: number
  ): FlowState {
    const timeSinceLastGesture = this.lastGestureTime
      ? timestamp - this.lastGestureTime
      : 0;

    // Check for major failure - resets flow
    if (!result.success || result.techniqueScore < 50) {
      this.meter = 0;
      this.streak = 0;
      this.lastGestureTime = timestamp;
      this.lastGesture = gesture;
      return this.getState();
    }

    // Check for hesitation penalty
    if (
      this.lastGestureTime > 0 &&
      timeSinceLastGesture > HESITATION_THRESHOLD_MS
    ) {
      this.meter = Math.max(0, this.meter - 10);
      this.streak = 0;
    }

    // Build flow from successful gesture
    this.meter += 2;
    this.streak++;

    // Perfect technique bonus
    if (result.techniqueScore >= 95) {
      this.meter += 3;
    }

    // Natural pair bonus
    if (
      this.lastGesture &&
      timeSinceLastGesture < QUICK_SUCCESSION_MS &&
      this.isNaturalPair(this.lastGesture, gesture)
    ) {
      this.meter += 5;
    }

    // Quick succession bonus (even if not a natural pair)
    else if (
      this.lastGestureTime > 0 &&
      timeSinceLastGesture < 1000 &&
      result.techniqueScore >= 80
    ) {
      this.meter += 2;
    }

    // Clamp meter
    this.meter = Math.min(MAX_METER, this.meter);

    // Track peak
    if (this.meter > this.peakMeter) {
      this.peakMeter = this.meter;
    }

    // Update last gesture tracking
    this.lastGestureTime = timestamp;
    this.lastGesture = gesture;

    return this.getState();
  }

  /**
   * Called periodically to apply time-based decay
   * (Optional - can be used for visual feedback)
   */
  tick(timestamp: number): void {
    if (this.lastGestureTime === 0) return;

    const timeSinceLastGesture = timestamp - this.lastGestureTime;

    // Slow decay after 2 seconds of inactivity
    if (timeSinceLastGesture > 2000) {
      const decayAmount = Math.floor((timeSinceLastGesture - 2000) / 1000);
      this.meter = Math.max(0, this.meter - decayAmount);
    }
  }

  /**
   * Check if two gestures form a natural pair
   */
  private isNaturalPair(
    previous: GestureType,
    current: GestureType
  ): boolean {
    const validFollowUps = NATURAL_PAIRS.get(previous);
    return validFollowUps?.includes(current) ?? false;
  }

  /**
   * Get the current bonus tier
   */
  getBonusTier(): FlowBonusTier {
    if (this.meter >= 40) return 'zone';
    if (this.meter >= 25) return 'clean';
    if (this.meter >= 10) return 'steady';
    return 'none';
  }

  /**
   * Get the bonus amount and label
   */
  getBonus(): { bonus: number; label: string | null } {
    const tier = this.getBonusTier();
    switch (tier) {
      case 'zone':
        return { bonus: 8, label: 'In the Zone' };
      case 'clean':
        return { bonus: 5, label: 'Clean Service' };
      case 'steady':
        return { bonus: 2, label: 'Steady Hands' };
      default:
        return { bonus: 0, label: null };
    }
  }

  /**
   * Get the complete flow state
   */
  getState(): FlowState {
    const { bonus, label } = this.getBonus();
    return {
      meter: this.meter,
      bonus,
      bonusLabel: label,
      streak: this.streak,
      peakMeter: this.peakMeter,
    };
  }

  /**
   * Get the current meter value (0-50)
   */
  getMeter(): number {
    return this.meter;
  }

  /**
   * Get the current streak count
   */
  getStreak(): number {
    return this.streak;
  }

  /**
   * Get the meter as a percentage (0-100)
   */
  getMeterPercentage(): number {
    return Math.round((this.meter / MAX_METER) * 100);
  }
}

// Factory function for creating new flow trackers
export function createFlowTracker(): FlowTracker {
  return new FlowTracker();
}
