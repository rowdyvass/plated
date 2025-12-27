import { Container, Graphics } from 'pixi.js';
import { DustEmitter, renderSettledDust } from '../../rendering/DustEmitter';
import { GestureRecognizer } from '../../gestures/GestureRecognizer';
import { DustGesture, type DustTarget } from '../../gestures/DustGesture';
import { DustGhost } from '../../entities/DustGhost';
import type { Plate } from '../../entities/Plate';
import type { TouchPoint } from '../InputManager';
import type { DishDefinition, DustGestureTarget } from '@/types/dishes';
import type { GhostType, PlacedVisual, DustResult } from './types';

interface ActiveDust {
  ingredientId: string;
  color: number;
  points: TouchPoint[];
  dustEmitter: DustEmitter | null;
  target: DustTarget;
}

export class DustManager {
  private plate: Plate;
  private ghosts: Map<string, GhostType>;
  private placedVisuals: PlacedVisual[];
  private gestureRecognizer: GestureRecognizer;
  private activeDust: ActiveDust | null = null;
  private dustEmitters: DustEmitter[] = [];
  private currentDish: DishDefinition | null = null;
  private ghostsContainer: Container;

  // Coordinate conversion helper
  private toPlateLocal: (point: TouchPoint) => TouchPoint | null;

  // Callbacks
  public onDustStart?: (ingredientId: string) => void;
  public onDustMove?: (points: TouchPoint[]) => void;
  public onDustEnd?: (result: DustResult) => void;

  constructor(
    plate: Plate,
    ghostsContainer: Container,
    ghosts: Map<string, GhostType>,
    placedVisuals: PlacedVisual[],
    gestureRecognizer: GestureRecognizer,
    toPlateLocal: (point: TouchPoint) => TouchPoint | null
  ) {
    this.plate = plate;
    this.ghostsContainer = ghostsContainer;
    this.ghosts = ghosts;
    this.placedVisuals = placedVisuals;
    this.gestureRecognizer = gestureRecognizer;
    this.toPlateLocal = toPlateLocal;
  }

  setCurrentDish(dish: DishDefinition | null): void {
    this.currentDish = dish;
  }

  start(ingredientId: string, startPoint: TouchPoint): void {
    if (!this.currentDish) return;

    const ingredient = this.currentDish.ingredients.find(i => i.id === ingredientId);
    if (!ingredient || ingredient.gesture !== 'dust') return;

    const color = ingredient.color ?? 0xFFFFFF;

    const target = this.currentDish.targets.find(t => t.ingredientId === ingredientId);
    if (!target || !('type' in target) || target.type !== 'dust') return;

    const dustTarget = target as DustGestureTarget;
    const plateLocalStart = this.toPlateLocal(startPoint);
    if (!plateLocalStart) return;

    this.activeDust = {
      ingredientId,
      color,
      points: [plateLocalStart],
      dustEmitter: null,
      target: dustTarget as DustTarget,
    };

    this.gestureRecognizer.start(plateLocalStart.x, plateLocalStart.y, startPoint.pressure);
    this.onDustStart?.(ingredientId);
  }

  update(point: TouchPoint): void {
    if (!this.activeDust) return;

    const plateLocal = this.toPlateLocal(point);
    if (!plateLocal) return;

    this.activeDust.points.push(plateLocal);
    this.gestureRecognizer.move(plateLocal.x, plateLocal.y, point.pressure);

    this.onDustMove?.(this.activeDust.points);
  }

  end(endPoint: TouchPoint): DustResult | null {
    if (!this.activeDust || !this.currentDish) return null;

    const plateLocal = this.toPlateLocal(endPoint);
    if (!plateLocal) return null;

    this.activeDust.points.push(plateLocal);

    const { color, points, target } = this.activeDust;

    const dustGesture = this.gestureRecognizer.getHandler('dust') as DustGesture | undefined;
    const path = this.gestureRecognizer.getCurrentPath();

    if (!dustGesture) {
      this.activeDust = null;
      return null;
    }

    if (!dustGesture.recognize(path)) {
      this.gestureRecognizer.cancel();
      this.activeDust = null;
      return null;
    }

    const gestureResult = dustGesture.score(path, target, this.plate.plateRadius);
    const analysis = dustGesture.analyzeDust(path, target, this.plate.plateRadius);

    const dustEmitter = new DustEmitter(this.plate.plateRadius, color, {
      particleCount: 150,
      particleSize: 2.5,
      maxOpacity: 0.5,
    });
    this.plate.addChild(dustEmitter);
    this.dustEmitters.push(dustEmitter);

    const direction = dustGesture['calculateSwipeDirection'](path);

    dustEmitter.emitAlongPath(
      points.map(p => ({ x: p.x, y: p.y })),
      direction,
      target
    );

    const ghost = this.ghosts.get(target.id);
    if (ghost instanceof DustGhost) {
      const zone = gestureResult.success && gestureResult.techniqueScore >= 90
        ? 'perfect'
        : gestureResult.success && gestureResult.techniqueScore >= 70
        ? 'great'
        : gestureResult.success
        ? 'good'
        : 'miss';

      ghost.showZoneFeedback(zone).then(() => {
        ghost.destroy();
        this.ghosts.delete(target.id);
      });
    }

    dustEmitter.onSettle(() => {
      this.finalizeDust(points, target, color);
    });

    this.gestureRecognizer.cancel();

    const dustResult: DustResult = {
      success: gestureResult.success,
      techniqueScore: gestureResult.techniqueScore,
      penalties: gestureResult.penalties,
      coverage: analysis.coverage,
    };

    this.onDustEnd?.(dustResult);
    this.activeDust = null;

    return dustResult;
  }

  private finalizeDust(
    points: TouchPoint[],
    target: DustTarget,
    color: number
  ): void {
    const container = new Container();
    const graphics = new Graphics();

    renderSettledDust(
      graphics,
      points.map(p => ({ x: p.x, y: p.y })),
      target,
      this.plate.plateRadius,
      color
    );

    container.addChild(graphics);

    if (this.plate.children.includes(this.ghostsContainer)) {
      const ghostsIndex = this.plate.getChildIndex(this.ghostsContainer);
      this.plate.addChildAt(container, ghostsIndex);
    } else {
      this.plate.addChild(container);
    }

    this.placedVisuals.push({
      id: `dust-${target.ingredientId}`,
      container,
      type: 'sauce',
    });
  }

  updateDustEmitters(deltaSeconds: number): void {
    for (const dustEmitter of this.dustEmitters) {
      dustEmitter.update(deltaSeconds);
    }
  }

  get isActive(): boolean {
    return this.activeDust !== null;
  }

  destroy(): void {
    for (const dustEmitter of this.dustEmitters) {
      dustEmitter.destroy();
    }
    this.dustEmitters = [];
    this.activeDust = null;
  }
}
