import { Container, Graphics } from 'pixi.js';
import { QuenelleRenderer } from '../../rendering/QuenelleRenderer';
import { QuenelleGesture, type QuenelleTarget } from '../../gestures/QuenelleGesture';
import { GestureRecognizer } from '../../gestures/GestureRecognizer';
import type { Plate } from '../../entities/Plate';
import type { TouchPoint } from '../InputManager';
import type { DishDefinition } from '@/types/dishes';
import type { GhostType, PlacedVisual, SwooshResult } from './types';
import type { TouchPath } from '@/types/gestures';

interface ActiveQuenelle {
  ingredientId: string;
  color: number;
  points: TouchPoint[];
  settling: boolean;
  settleProgress: number;
  pauseDetected: boolean;
  pausePosition: { x: number; y: number } | null;
  formProgress: number;
  rotation: number;
}

// Reuse SwooshResult type for quenelle (same structure)
export type QuenelleResult = SwooshResult;

export class QuenelleManager {
  private plate: Plate;
  private ghosts: Map<string, GhostType>;
  private placedVisuals: PlacedVisual[];
  private gestureRecognizer: GestureRecognizer;
  private quenelleRenderer: QuenelleRenderer;
  private quenelleGesture: QuenelleGesture;
  private activeQuenelle: ActiveQuenelle | null = null;
  private currentDish: DishDefinition | null = null;

  // Coordinate conversion helper
  private toPlateLocal: (point: TouchPoint) => TouchPoint | null;

  // Pause detection thresholds
  private readonly PAUSE_VELOCITY_THRESHOLD = 15; // px/s

  // Callbacks
  public onQuenelleStart?: (ingredientId: string) => void;
  public onQuenelleMove?: (points: TouchPoint[]) => void;
  public onQuenelleEnd?: (result: QuenelleResult) => void;

  constructor(
    plate: Plate,
    ghosts: Map<string, GhostType>,
    placedVisuals: PlacedVisual[],
    gestureRecognizer: GestureRecognizer,
    toPlateLocal: (point: TouchPoint) => TouchPoint | null
  ) {
    this.plate = plate;
    this.ghosts = ghosts;
    this.placedVisuals = placedVisuals;
    this.gestureRecognizer = gestureRecognizer;
    this.toPlateLocal = toPlateLocal;
    this.quenelleRenderer = new QuenelleRenderer(plate);
    this.quenelleGesture = new QuenelleGesture();
  }

  setCurrentDish(dish: DishDefinition | null): void {
    this.currentDish = dish;
  }

  start(ingredientId: string, startPoint: TouchPoint): void {
    if (!this.currentDish) return;

    const ingredient = this.currentDish.ingredients.find(i => i.id === ingredientId);
    if (!ingredient || ingredient.gesture !== 'quenelle') return;

    const color = ingredient.color ?? 0xF5E6A3; // Default butter yellow
    const plateLocalStart = this.toPlateLocal(startPoint);
    if (!plateLocalStart) return;

    this.activeQuenelle = {
      ingredientId,
      color,
      points: [plateLocalStart],
      settling: false,
      settleProgress: 0,
      pauseDetected: false,
      pausePosition: null,
      formProgress: 0,
      rotation: 0,
    };

    this.gestureRecognizer.start(plateLocalStart.x, plateLocalStart.y, startPoint.pressure);
    this.onQuenelleStart?.(ingredientId);
  }

  update(point: TouchPoint): void {
    if (!this.activeQuenelle) return;

    const plateLocal = this.toPlateLocal(point);
    if (!plateLocal) return;

    this.activeQuenelle.points.push(plateLocal);
    this.gestureRecognizer.move(plateLocal.x, plateLocal.y, point.pressure);

    // Check for pause (low velocity)
    const pauseInfo = this.detectPause();
    if (pauseInfo.isPausing) {
      this.activeQuenelle.pauseDetected = true;
      this.activeQuenelle.pausePosition = pauseInfo.position;
      this.activeQuenelle.rotation = this.calculateRotation();

      // Increase form progress based on pause duration
      const pauseDuration = pauseInfo.duration;
      this.activeQuenelle.formProgress = Math.min(1, pauseDuration / 300);
    }

    // Build the path for rendering
    const path = this.buildPath();

    // Render the forming quenelle
    this.quenelleRenderer.renderForming(
      path,
      this.activeQuenelle.pausePosition,
      this.activeQuenelle.rotation,
      this.activeQuenelle.color,
      this.activeQuenelle.formProgress
    );

    this.onQuenelleMove?.(this.activeQuenelle.points);
  }

  end(endPoint: TouchPoint): QuenelleResult | null {
    if (!this.activeQuenelle || !this.currentDish) return null;

    const plateLocal = this.toPlateLocal(endPoint);
    if (!plateLocal) return null;

    this.activeQuenelle.points.push(plateLocal);

    const target = this.currentDish.targets.find(
      t => t.ingredientId === this.activeQuenelle!.ingredientId
    );

    if (!target || !('type' in target) || target.type !== 'quenelle') {
      this.clear();
      return {
        success: false,
        techniqueScore: 0,
        penalties: [{ reason: 'No quenelle target found', deduction: 100 }],
      };
    }

    const path = this.buildPath();

    // Check if the gesture matches quenelle pattern
    const isValidQuenelle = this.quenelleGesture.recognize(path);

    let result: QuenelleResult;

    if (!isValidQuenelle) {
      result = {
        success: false,
        techniqueScore: 0,
        penalties: [{ reason: 'Gesture not recognized as quenelle - try arc, pause, release', deduction: 100 }],
      };
    } else {
      // Score the gesture
      const gestureResult = this.quenelleGesture.score(path, target as QuenelleTarget, this.plate.plateRadius);
      result = {
        success: gestureResult.success,
        techniqueScore: gestureResult.techniqueScore,
        penalties: gestureResult.penalties,
      };
    }

    // Start settling animation if successful
    if (result.success && this.activeQuenelle.pausePosition) {
      this.activeQuenelle.settling = true;
      this.activeQuenelle.settleProgress = 0;
    }

    // Handle ghost feedback
    const ghost = this.ghosts.get(target.id);
    if (ghost) {
      const zone = result.success && result.techniqueScore >= 90
        ? 'perfect'
        : result.success && result.techniqueScore >= 70
        ? 'great'
        : result.success
        ? 'good'
        : 'miss';

      ghost.showZoneFeedback(zone).then(() => {
        ghost.destroy();
        this.ghosts.delete(target.id);
      });
    }

    this.onQuenelleEnd?.(result);

    // If not successful or no pause position, clear immediately
    if (!result.success || !this.activeQuenelle.pausePosition) {
      this.clear();
    }

    return result;
  }

  /**
   * Update settling animation each frame
   */
  updateSettling(deltaMs: number): boolean {
    if (!this.activeQuenelle?.settling || !this.activeQuenelle.pausePosition) {
      return false;
    }

    this.activeQuenelle.settleProgress += deltaMs / 150; // 150ms settle time

    if (this.activeQuenelle.settleProgress >= 1) {
      // Finalize the quenelle
      this.finalize();
      return true;
    } else {
      // Render settling animation
      this.quenelleRenderer.renderSettle(
        this.activeQuenelle.pausePosition,
        this.activeQuenelle.rotation,
        this.activeQuenelle.color,
        this.activeQuenelle.settleProgress
      );
      return false;
    }
  }

  private finalize(): void {
    if (!this.activeQuenelle || !this.activeQuenelle.pausePosition) return;

    // Create permanent container for the settled quenelle
    const container = new Container();
    const graphics = new Graphics();
    container.addChild(graphics);

    // Draw the final quenelle shape
    this.drawFinalQuenelle(
      graphics,
      this.activeQuenelle.pausePosition,
      this.activeQuenelle.rotation,
      this.activeQuenelle.color
    );

    this.plate.addChild(container);

    this.placedVisuals.push({
      id: this.activeQuenelle.ingredientId,
      container,
      type: 'element',
    });

    this.quenelleRenderer.clear();
    this.activeQuenelle = null;
  }

  private drawFinalQuenelle(
    graphics: Graphics,
    position: { x: number; y: number },
    rotation: number,
    color: number
  ): void {
    const length = 40;
    const width = 18;
    const alpha = 0.9;

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const cx = position.x;
    const cy = position.y;

    const transformPoint = (x: number, y: number, ox = 0, oy = 0) => ({
      x: cx + (x + ox) * cos - (y + oy) * sin,
      y: cy + (x + ox) * sin + (y + oy) * cos,
    });

    // Shadow
    const s0 = transformPoint(-length / 2, 0, 2, 3);
    const s1 = transformPoint(-length / 4, -width / 2, 2, 3);
    const s2 = transformPoint(length / 4, -width / 2, 2, 3);
    const s3 = transformPoint(length / 2, 0, 2, 3);
    const s4 = transformPoint(length / 4, width / 2, 2, 3);
    const s5 = transformPoint(-length / 4, width / 2, 2, 3);

    graphics.moveTo(s0.x, s0.y);
    graphics.bezierCurveTo(s1.x, s1.y, s2.x, s2.y, s3.x, s3.y);
    graphics.bezierCurveTo(s4.x, s4.y, s5.x, s5.y, s0.x, s0.y);
    graphics.closePath();
    graphics.fill({ color: 0x000000, alpha: 0.1 });

    // Main body
    const p0 = transformPoint(-length / 2, 0);
    const p1 = transformPoint(-length / 4, -width / 2);
    const p2 = transformPoint(length / 4, -width / 2);
    const p3 = transformPoint(length / 2, 0);
    const p4 = transformPoint(length / 4, width / 2);
    const p5 = transformPoint(-length / 4, width / 2);

    graphics.moveTo(p0.x, p0.y);
    graphics.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    graphics.bezierCurveTo(p4.x, p4.y, p5.x, p5.y, p0.x, p0.y);
    graphics.closePath();
    graphics.fill({ color, alpha });

    // Ridge highlight
    const r0 = transformPoint(-length / 3, -width / 6);
    const r1 = transformPoint(0, -width / 4);
    const r2 = transformPoint(length / 4, -width / 5);
    const r3 = transformPoint(length / 3, 0);

    graphics.moveTo(r0.x, r0.y);
    graphics.bezierCurveTo(r1.x, r1.y, r2.x, r2.y, r3.x, r3.y);
    graphics.stroke({ color: 0xffffff, width: 1.5, alpha: 0.4 });

    // Specular highlight
    const spec = transformPoint(-length / 6, -width / 5);
    graphics.circle(spec.x, spec.y, 3);
    graphics.fill({ color: 0xffffff, alpha: 0.25 });
  }

  /**
   * Detect if the user is currently pausing (holding still)
   */
  private detectPause(): { isPausing: boolean; position: { x: number; y: number } | null; duration: number } {
    const points = this.activeQuenelle?.points ?? [];
    if (points.length < 3) {
      return { isPausing: false, position: null, duration: 0 };
    }

    // Look at the last few points to detect pause
    const windowSize = Math.min(5, points.length - 1);
    const recentPoints = points.slice(-windowSize);

    // Calculate velocities
    let totalVelocity = 0;
    for (let i = 1; i < recentPoints.length; i++) {
      const dx = recentPoints[i].x - recentPoints[i - 1].x;
      const dy = recentPoints[i].y - recentPoints[i - 1].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const dt = (recentPoints[i].timestamp - recentPoints[i - 1].timestamp) / 1000;
      if (dt > 0) {
        totalVelocity += distance / dt;
      }
    }
    const avgVelocity = totalVelocity / (recentPoints.length - 1);

    const isPausing = avgVelocity < this.PAUSE_VELOCITY_THRESHOLD;

    if (isPausing) {
      // Find pause start
      let pauseStartIndex = points.length - 1;
      for (let i = points.length - 2; i >= 0; i--) {
        const dx = points[i + 1].x - points[i].x;
        const dy = points[i + 1].y - points[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const dt = (points[i + 1].timestamp - points[i].timestamp) / 1000;
        const velocity = dt > 0 ? distance / dt : 0;

        if (velocity >= this.PAUSE_VELOCITY_THRESHOLD) {
          pauseStartIndex = i + 1;
          break;
        }
      }

      const pauseDuration = points[points.length - 1].timestamp - points[pauseStartIndex].timestamp;
      const midIndex = Math.floor((pauseStartIndex + points.length - 1) / 2);

      return {
        isPausing: true,
        position: { x: points[midIndex].x, y: points[midIndex].y },
        duration: pauseDuration,
      };
    }

    return { isPausing: false, position: null, duration: 0 };
  }

  /**
   * Calculate the rotation angle based on the arc direction
   */
  private calculateRotation(): number {
    const points = this.activeQuenelle?.points ?? [];
    if (points.length < 2) return 0;

    // Use direction at the pause point
    const endIndex = points.length - 1;
    const startIndex = Math.max(0, endIndex - 5);

    const dx = points[endIndex].x - points[startIndex].x;
    const dy = points[endIndex].y - points[startIndex].y;

    return Math.atan2(dy, dx);
  }

  /**
   * Build a TouchPath from the current points
   */
  private buildPath(): TouchPath {
    const points = this.activeQuenelle?.points ?? [];
    const startTime = points.length > 0 ? points[0].timestamp : 0;
    const endTime = points.length > 0 ? points[points.length - 1].timestamp : 0;

    return {
      points: points.map(p => ({
        x: p.x,
        y: p.y,
        timestamp: p.timestamp,
        pressure: p.pressure,
      })),
      startTime,
      endTime,
      duration: endTime - startTime,
    };
  }

  get isActive(): boolean {
    return this.activeQuenelle !== null && !this.activeQuenelle.settling;
  }

  get isSettling(): boolean {
    return this.activeQuenelle?.settling ?? false;
  }

  clear(): void {
    this.quenelleRenderer.clear();
    this.activeQuenelle = null;
  }

  destroy(): void {
    this.quenelleRenderer.destroy();
    this.activeQuenelle = null;
  }
}
