import { Container, Graphics } from 'pixi.js';
import { SauceRenderer } from '../../rendering/SauceRenderer';
import { GestureRecognizer } from '../../gestures/GestureRecognizer';
import type { Plate } from '../../entities/Plate';
import type { TouchPoint } from '../InputManager';
import type { DishDefinition } from '@/types/dishes';
import type { GestureResult as NewGestureResult } from '@/types/gestures';
import type { GhostType, PlacedVisual, SwooshResult } from './types';

interface ActiveSwoosh {
  ingredientId: string;
  color: number;
  points: TouchPoint[];
  settling: boolean;
  settleProgress: number;
}

export class SwooshManager {
  private plate: Plate;
  private ghosts: Map<string, GhostType>;
  private placedVisuals: PlacedVisual[];
  private gestureRecognizer: GestureRecognizer;
  private sauceRenderer: SauceRenderer;
  private activeSwoosh: ActiveSwoosh | null = null;
  private currentDish: DishDefinition | null = null;

  // Coordinate conversion helper
  private toPlateLocal: (point: TouchPoint) => TouchPoint | null;

  // Callbacks
  public onSwooshStart?: (ingredientId: string) => void;
  public onSwooshMove?: (points: TouchPoint[]) => void;
  public onSwooshEnd?: (result: SwooshResult) => void;

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
    this.sauceRenderer = new SauceRenderer(plate);
  }

  setCurrentDish(dish: DishDefinition | null): void {
    this.currentDish = dish;
  }

  getSauceRenderer(): SauceRenderer {
    return this.sauceRenderer;
  }

  start(ingredientId: string, startPoint: TouchPoint): void {
    if (!this.currentDish) return;

    const ingredient = this.currentDish.ingredients.find(i => i.id === ingredientId);
    if (!ingredient || ingredient.gesture !== 'swoosh') return;

    const color = ingredient.color ?? 0x4A3728;
    const plateLocalStart = this.toPlateLocal(startPoint);
    if (!plateLocalStart) return;

    this.activeSwoosh = {
      ingredientId,
      color,
      points: [plateLocalStart],
      settling: false,
      settleProgress: 0,
    };

    this.gestureRecognizer.start(plateLocalStart.x, plateLocalStart.y, startPoint.pressure);
    this.onSwooshStart?.(ingredientId);
  }

  update(point: TouchPoint): void {
    if (!this.activeSwoosh) return;

    const plateLocal = this.toPlateLocal(point);
    if (!plateLocal) return;

    this.activeSwoosh.points.push(plateLocal);
    this.gestureRecognizer.move(plateLocal.x, plateLocal.y, point.pressure);

    this.sauceRenderer.renderSwoosh(this.activeSwoosh.points, this.activeSwoosh.color);
    this.onSwooshMove?.(this.activeSwoosh.points);
  }

  end(endPoint: TouchPoint): SwooshResult | null {
    if (!this.activeSwoosh || !this.currentDish) return null;

    const plateLocal = this.toPlateLocal(endPoint);
    if (!plateLocal) return null;

    this.activeSwoosh.points.push(plateLocal);

    const target = this.currentDish.targets.find(
      t => t.ingredientId === this.activeSwoosh!.ingredientId
    );

    if (!target) {
      return {
        success: false,
        techniqueScore: 0,
        penalties: [{ reason: 'No target found', deduction: 100 }],
      };
    }

    let result: NewGestureResult;

    if ('type' in target && target.type === 'path') {
      result = this.gestureRecognizer.endAndScore(
        plateLocal.x,
        plateLocal.y,
        'swoosh',
        target,
        this.plate.plateRadius
      );
    } else {
      result = {
        type: 'swoosh',
        success: false,
        techniqueScore: 0,
        penalties: [{ reason: 'Wrong target type for swoosh', deduction: 100 }],
      };
    }

    this.activeSwoosh.settling = true;
    this.activeSwoosh.settleProgress = 0;

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

    const swooshResult: SwooshResult = {
      success: result.success,
      techniqueScore: result.techniqueScore,
      penalties: result.penalties,
    };

    this.onSwooshEnd?.(swooshResult);

    return swooshResult;
  }

  updateSettling(deltaMs: number): boolean {
    if (!this.activeSwoosh?.settling) return false;

    this.activeSwoosh.settleProgress += deltaMs / 50;

    if (this.activeSwoosh.settleProgress >= 1) {
      this.sauceRenderer.renderFinal(
        this.activeSwoosh.points,
        this.activeSwoosh.color
      );
      this.finalize();
      return true;
    } else {
      this.sauceRenderer.renderSettle(
        this.activeSwoosh.points,
        this.activeSwoosh.color,
        this.activeSwoosh.settleProgress
      );
      return false;
    }
  }

  private finalize(): void {
    if (!this.activeSwoosh) return;

    const container = new Container();
    const graphics = new Graphics();

    const points = this.activeSwoosh.points;
    const color = this.activeSwoosh.color;

    if (points.length >= 2) {
      this.drawSettledSauce(graphics, points, color);
    }

    container.addChild(graphics);
    this.plate.addChild(container);

    this.placedVisuals.push({
      id: this.activeSwoosh.ingredientId,
      container,
      type: 'sauce',
    });

    this.sauceRenderer.clear();
    this.activeSwoosh = null;
  }

  private drawSettledSauce(
    graphics: Graphics,
    points: TouchPoint[],
    color: number
  ): void {
    if (points.length < 2) return;

    const startThickness = 11;
    const endThickness = 3.5;
    const alpha = 0.88;

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const t1 = i / (points.length - 1);
      const t2 = (i + 1) / (points.length - 1);

      const ease1 = 1 - (1 - t1) * (1 - t1);
      const ease2 = 1 - (1 - t2) * (1 - t2);
      const thickness1 = startThickness + (endThickness - startThickness) * ease1;
      const thickness2 = startThickness + (endThickness - startThickness) * ease2;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len < 0.01) continue;

      const nx = -dy / len;
      const ny = dx / len;

      graphics.moveTo(p1.x + nx * thickness1 / 2, p1.y + ny * thickness1 / 2);
      graphics.lineTo(p1.x - nx * thickness1 / 2, p1.y - ny * thickness1 / 2);
      graphics.lineTo(p2.x - nx * thickness2 / 2, p2.y - ny * thickness2 / 2);
      graphics.lineTo(p2.x + nx * thickness2 / 2, p2.y + ny * thickness2 / 2);
      graphics.closePath();
      graphics.fill({ color, alpha });
    }

    graphics.circle(points[0].x, points[0].y, startThickness / 2);
    graphics.fill({ color, alpha });

    const lastPoint = points[points.length - 1];
    graphics.circle(lastPoint.x, lastPoint.y, endThickness / 2);
    graphics.fill({ color, alpha });
  }

  get isActive(): boolean {
    return this.activeSwoosh !== null && !this.activeSwoosh.settling;
  }

  get isSettling(): boolean {
    return this.activeSwoosh?.settling ?? false;
  }

  clear(): void {
    this.sauceRenderer.clear();
    this.activeSwoosh = null;
  }

  destroy(): void {
    this.sauceRenderer.destroy();
    this.activeSwoosh = null;
  }
}
