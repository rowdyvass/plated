import type { GestureType, GestureResult as NewGestureResult, GestureTarget, TouchPath } from '@/types/gestures';
import type { GestureResult, Position } from '@/types';
import { BaseGesture } from './BaseGesture';
import { PlaceGesture } from './PlaceGesture';
import { SwooshGesture } from './SwooshGesture';
import { DotGesture } from './DotGesture';
import { ScatterGesture } from './ScatterGesture';
import { QuenelleGesture } from './QuenelleGesture';
import { DrizzleGesture } from './DrizzleGesture';
import { TweezeGesture } from './TweezeGesture';
import { DustGesture } from './DustGesture';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
  pressure: number;
}

/**
 * Unified gesture recognizer that routes to specialized gesture handlers.
 *
 * Usage:
 * 1. Call start() when touch begins
 * 2. Call move() during touch movement
 * 3. Call end() when touch ends to get the recognized gesture
 *
 * For scoring against a target, use recognizeAndScore() with the expected gesture type.
 */
export class GestureRecognizer {
  private startPoint: TouchPoint | null = null;
  private points: TouchPoint[] = [];
  private isActive = false;
  private startTime = 0;

  // Gesture handlers
  private gestureHandlers: Map<GestureType, BaseGesture> = new Map();

  constructor() {
    // Register gesture handlers
    this.gestureHandlers.set('place', new PlaceGesture());
    this.gestureHandlers.set('swoosh', new SwooshGesture());
    this.gestureHandlers.set('dot', new DotGesture());
    this.gestureHandlers.set('scatter', new ScatterGesture());
    this.gestureHandlers.set('quenelle', new QuenelleGesture());
    this.gestureHandlers.set('drizzle', new DrizzleGesture());
    this.gestureHandlers.set('tweeze', new TweezeGesture());
    this.gestureHandlers.set('dust', new DustGesture());
  }

  /**
   * Get a gesture handler by type
   */
  getHandler(type: GestureType): BaseGesture | undefined {
    return this.gestureHandlers.get(type);
  }

  /**
   * Start tracking a gesture
   */
  start(x: number, y: number, pressure: number = 0.5): void {
    this.startTime = performance.now();
    this.startPoint = { x, y, timestamp: this.startTime, pressure };
    this.points = [this.startPoint];
    this.isActive = true;
  }

  /**
   * Track movement during gesture
   */
  move(x: number, y: number, pressure: number = 0.5): void {
    if (!this.isActive) return;
    this.points.push({ x, y, timestamp: performance.now(), pressure });
  }

  /**
   * End the gesture and get basic recognition result
   * This returns the legacy GestureResult format for backwards compatibility
   */
  end(x: number, y: number, pressure: number = 0.5): GestureResult | null {
    if (!this.isActive || !this.startPoint) return null;

    const endTime = performance.now();
    const endPoint: TouchPoint = { x, y, timestamp: endTime, pressure };
    this.points.push(endPoint);
    this.isActive = false;

    const gesture = this.recognize();
    this.reset();
    return gesture;
  }

  /**
   * Get the current path without ending the gesture
   */
  getCurrentPath(): TouchPath {
    const endTime = this.points.length > 0
      ? this.points[this.points.length - 1].timestamp
      : this.startTime;

    return {
      points: [...this.points],
      startTime: this.startTime,
      endTime,
      duration: endTime - this.startTime,
    };
  }

  /**
   * End the gesture and score it against an expected type and target
   */
  endAndScore(
    x: number,
    y: number,
    expectedType: GestureType,
    target: GestureTarget,
    plateRadius: number,
    pressure: number = 0.5
  ): NewGestureResult {
    if (!this.isActive || !this.startPoint) {
      return {
        type: expectedType,
        success: false,
        techniqueScore: 0,
        penalties: [{ reason: 'No active gesture', deduction: 100 }],
      };
    }

    const endTime = performance.now();
    const endPoint: TouchPoint = { x, y, timestamp: endTime, pressure };
    this.points.push(endPoint);
    this.isActive = false;

    const path: TouchPath = {
      points: [...this.points],
      startTime: this.startTime,
      endTime,
      duration: endTime - this.startTime,
    };

    this.reset();

    const handler = this.gestureHandlers.get(expectedType);
    if (!handler) {
      return {
        type: expectedType,
        success: false,
        techniqueScore: 0,
        penalties: [{ reason: `Unknown gesture type: ${expectedType}`, deduction: 100 }],
      };
    }

    // Check if the gesture matches the expected pattern
    if (!handler.recognize(path)) {
      return {
        type: expectedType,
        success: false,
        techniqueScore: 0,
        penalties: [{ reason: 'Gesture pattern not recognized', deduction: 100 }],
      };
    }

    // Score the gesture
    return handler.score(path, target, plateRadius);
  }

  /**
   * Cancel the current gesture
   */
  cancel(): void {
    this.reset();
  }

  /**
   * Check if currently tracking a gesture
   */
  get active(): boolean {
    return this.isActive;
  }

  /**
   * Get points collected so far
   */
  get currentPoints(): TouchPoint[] {
    return [...this.points];
  }

  /**
   * Basic gesture recognition (legacy format)
   */
  private recognize(): GestureResult | null {
    if (!this.startPoint || this.points.length < 2) return null;

    const start = this.startPoint;
    const end = this.points[this.points.length - 1];
    const duration = end.timestamp - start.timestamp;
    const distance = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );

    // Calculate path length
    let pathLength = 0;
    for (let i = 1; i < this.points.length; i++) {
      const dx = this.points[i].x - this.points[i - 1].x;
      const dy = this.points[i].y - this.points[i - 1].y;
      pathLength += Math.sqrt(dx * dx + dy * dy);
    }

    // Curvature ratio (how curved the path is)
    const curvatureRatio = distance > 0 ? pathLength / distance : 1;

    // Tap/Place gesture (short duration, minimal movement)
    if (duration < 200 && distance < 10) {
      return {
        type: 'place',
        position: this.normalizePosition(start.x, start.y),
      };
    }

    // Dot gesture (short tap)
    if (duration < 150 && distance < 5) {
      return {
        type: 'dot',
        position: this.normalizePosition(start.x, start.y),
      };
    }

    // Swoosh gesture (curved path, medium duration, enough length)
    if (
      duration >= 150 &&
      duration <= 2000 &&
      pathLength > 80 &&
      this.points.length >= 5
    ) {
      return {
        type: 'swoosh',
        position: this.normalizePosition(start.x, start.y),
        direction: this.normalizePosition(end.x, end.y),
      };
    }

    // Scatter gesture (quick flick with high velocity)
    if (duration >= 100 && duration <= 500 && distance > 30) {
      // Calculate release velocity
      const windowSize = Math.min(5, this.points.length - 1);
      const startIdx = this.points.length - 1 - windowSize;
      const velStart = this.points[startIdx];
      const velEnd = this.points[this.points.length - 1];
      const velDist = Math.sqrt(
        Math.pow(velEnd.x - velStart.x, 2) + Math.pow(velEnd.y - velStart.y, 2)
      );
      const velTime = (velEnd.timestamp - velStart.timestamp) / 1000;
      const velocity = velTime > 0 ? velDist / velTime : 0;

      if (velocity > 500) {
        const direction = {
          x: (end.x - start.x) / distance,
          y: (end.y - start.y) / distance,
        };
        return {
          type: 'scatter',
          position: this.normalizePosition(end.x, end.y),
          direction,
        };
      }
    }

    // Swipe gesture (fast, directional movement)
    if (duration < 300 && distance > 50) {
      const direction = {
        x: (end.x - start.x) / distance,
        y: (end.y - start.y) / distance,
      };
      return {
        type: 'swipe',
        position: this.normalizePosition(start.x, start.y),
        direction,
      };
    }

    // Drizzle gesture (slow, curved movement)
    if (duration > 300 && this.points.length > 10 && curvatureRatio > 1.1) {
      return {
        type: 'drizzle',
        position: this.normalizePosition(start.x, start.y),
        direction: this.normalizePosition(end.x, end.y),
      };
    }

    // Default to place for drag-and-drop
    return {
      type: 'place',
      position: this.normalizePosition(end.x, end.y),
    };
  }

  private normalizePosition(x: number, y: number): Position {
    // Return raw position (will be normalized by caller based on plate)
    return { x, y };
  }

  private reset(): void {
    this.startPoint = null;
    this.points = [];
    this.isActive = false;
    this.startTime = 0;
  }
}
