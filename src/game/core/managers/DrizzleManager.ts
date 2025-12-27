import { Container, Graphics } from 'pixi.js';
import { DrizzleRenderer } from '../../rendering/SauceRenderer';
import { GestureRecognizer } from '../../gestures/GestureRecognizer';
import { DrizzleGesture } from '../../gestures/DrizzleGesture';
import type { Plate } from '../../entities/Plate';
import type { TouchPoint } from '../InputManager';
import type { DishDefinition } from '@/types/dishes';
import type { GestureResult as NewGestureResult } from '@/types/gestures';
import type { GhostType, PlacedVisual, SwooshResult } from './types';

interface ActiveDrizzle {
  ingredientId: string;
  color: number;
  points: TouchPoint[];
  settling: boolean;
  settleProgress: number;
}

export class DrizzleManager {
  private plate: Plate;
  private ghosts: Map<string, GhostType>;
  private placedVisuals: PlacedVisual[];
  private gestureRecognizer: GestureRecognizer;
  private drizzleRenderer: DrizzleRenderer;
  private activeDrizzle: ActiveDrizzle | null = null;
  private currentDish: DishDefinition | null = null;

  // Coordinate conversion helper
  private toPlateLocal: (point: TouchPoint) => TouchPoint | null;

  // Callbacks
  public onDrizzleStart?: (ingredientId: string) => void;
  public onDrizzleMove?: (points: TouchPoint[]) => void;
  public onDrizzleEnd?: (result: SwooshResult) => void;

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
    this.drizzleRenderer = new DrizzleRenderer(plate);
  }

  setCurrentDish(dish: DishDefinition | null): void {
    this.currentDish = dish;
  }

  getDrizzleRenderer(): DrizzleRenderer {
    return this.drizzleRenderer;
  }

  start(ingredientId: string, startPoint: TouchPoint): void {
    if (!this.currentDish) return;

    const ingredient = this.currentDish.ingredients.find(i => i.id === ingredientId);
    if (!ingredient || ingredient.gesture !== 'drizzle') return;

    const color = ingredient.color ?? 0x4A7C23;
    const plateLocalStart = this.toPlateLocal(startPoint);
    if (!plateLocalStart) return;

    this.activeDrizzle = {
      ingredientId,
      color,
      points: [plateLocalStart],
      settling: false,
      settleProgress: 0,
    };

    this.gestureRecognizer.start(plateLocalStart.x, plateLocalStart.y, startPoint.pressure);
    this.onDrizzleStart?.(ingredientId);
  }

  update(point: TouchPoint): void {
    if (!this.activeDrizzle) return;

    const plateLocal = this.toPlateLocal(point);
    if (!plateLocal) return;

    this.activeDrizzle.points.push(plateLocal);
    this.gestureRecognizer.move(plateLocal.x, plateLocal.y, point.pressure);

    const drizzleGesture = this.gestureRecognizer.getHandler('drizzle') as DrizzleGesture | undefined;
    const path = this.gestureRecognizer.getCurrentPath();
    const breakIndices = drizzleGesture?.getBreakIndices(path) ?? [];

    this.drizzleRenderer.renderDrizzle(
      this.activeDrizzle.points,
      this.activeDrizzle.color,
      breakIndices
    );
    this.onDrizzleMove?.(this.activeDrizzle.points);
  }

  end(endPoint: TouchPoint): SwooshResult | null {
    if (!this.activeDrizzle || !this.currentDish) return null;

    const plateLocal = this.toPlateLocal(endPoint);
    if (!plateLocal) return null;

    this.activeDrizzle.points.push(plateLocal);

    const target = this.currentDish.targets.find(
      t => t.ingredientId === this.activeDrizzle!.ingredientId
    );

    if (!target || !('type' in target) || target.type !== 'drizzle') {
      return {
        success: false,
        techniqueScore: 0,
        penalties: [{ reason: 'No drizzle target found', deduction: 100 }],
      };
    }

    const drizzleGesture = this.gestureRecognizer.getHandler('drizzle') as DrizzleGesture | undefined;
    const path = this.gestureRecognizer.getCurrentPath();

    let result: NewGestureResult;
    if (drizzleGesture) {
      result = drizzleGesture.score(path, target, this.plate.plateRadius);
    } else {
      result = {
        type: 'drizzle',
        success: false,
        techniqueScore: 0,
        penalties: [{ reason: 'Drizzle gesture handler not found', deduction: 100 }],
      };
    }

    this.activeDrizzle.settling = true;
    this.activeDrizzle.settleProgress = 0;

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

    this.finalize();

    const drizzleResult: SwooshResult = {
      success: result.success,
      techniqueScore: result.techniqueScore,
      penalties: result.penalties,
    };

    this.onDrizzleEnd?.(drizzleResult);
    this.gestureRecognizer.cancel();

    return drizzleResult;
  }

  private finalize(): void {
    if (!this.activeDrizzle) return;

    const drizzleGesture = this.gestureRecognizer.getHandler('drizzle') as DrizzleGesture | undefined;
    const path = this.gestureRecognizer.getCurrentPath();
    const breakIndices = drizzleGesture?.getBreakIndices(path) ?? [];

    const container = new Container();
    const graphics = new Graphics();

    const points = this.activeDrizzle.points;
    const color = this.activeDrizzle.color;

    if (points.length >= 2) {
      this.drawSettledDrizzle(graphics, points, color, breakIndices);
    }

    container.addChild(graphics);
    this.plate.addChild(container);

    this.placedVisuals.push({
      id: this.activeDrizzle.ingredientId,
      container,
      type: 'sauce',
    });

    this.drizzleRenderer.clear();
    this.activeDrizzle = null;
  }

  private drawSettledDrizzle(
    graphics: Graphics,
    points: TouchPoint[],
    color: number,
    breakIndices: number[]
  ): void {
    if (points.length < 2) return;

    const thickness = 2.75;
    const alpha = 0.9;

    let segmentStart = 0;

    for (let i = 0; i <= points.length; i++) {
      const isBreak = breakIndices.includes(i) || i === points.length;

      if (isBreak && i > segmentStart) {
        const segment = points.slice(segmentStart, i);
        this.drawDrizzleSegment(graphics, segment, color, thickness, alpha);
        segmentStart = i;
      }
    }
  }

  private drawDrizzleSegment(
    graphics: Graphics,
    points: TouchPoint[],
    color: number,
    thickness: number,
    alpha: number
  ): void {
    if (points.length < 2) return;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len < 0.01) continue;

      const nx = -dy / len;
      const ny = dx / len;

      graphics.moveTo(p1.x + nx * thickness / 2, p1.y + ny * thickness / 2);
      graphics.lineTo(p1.x - nx * thickness / 2, p1.y - ny * thickness / 2);
      graphics.lineTo(p2.x - nx * thickness / 2, p2.y - ny * thickness / 2);
      graphics.lineTo(p2.x + nx * thickness / 2, p2.y + ny * thickness / 2);
      graphics.closePath();
      graphics.fill({ color, alpha });
    }

    if (points.length > 0) {
      graphics.circle(points[0].x, points[0].y, thickness / 2);
      graphics.fill({ color, alpha });

      graphics.circle(points[points.length - 1].x, points[points.length - 1].y, thickness / 2);
      graphics.fill({ color, alpha });
    }

    // Shine effect
    const shineAlpha = 0.25;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len < 0.01) continue;

      const nx = -dy / len;
      const ny = dx / len;

      graphics.moveTo(p1.x + nx * 0.8, p1.y + ny * 0.8);
      graphics.lineTo(p2.x + nx * 0.8, p2.y + ny * 0.8);
      graphics.stroke({ color: 0xFFFFFF, width: 0.5, alpha: shineAlpha });
    }
  }

  get isActive(): boolean {
    return this.activeDrizzle !== null && !this.activeDrizzle.settling;
  }

  clear(): void {
    this.drizzleRenderer.clear();
    this.activeDrizzle = null;
  }

  destroy(): void {
    this.drizzleRenderer.destroy();
    this.activeDrizzle = null;
  }
}
