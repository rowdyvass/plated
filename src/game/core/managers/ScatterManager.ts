import { ParticleSystem } from '../../rendering/ParticleSystem';
import { GestureRecognizer } from '../../gestures/GestureRecognizer';
import { ScatterGesture } from '../../gestures/ScatterGesture';
import { ScatterGhost } from '../../entities/ScatterGhost';
import { scoreScatter, type ScatterTarget } from '../../scoring/ScatterScorer';
import type { Plate } from '../../entities/Plate';
import type { TouchPoint } from '../InputManager';
import type { DishDefinition, ZoneGestureTarget } from '@/types/dishes';
import type { GhostType, ScatterResult } from './types';

interface ActiveScatter {
  ingredientId: string;
  color: number;
  particleSystem: ParticleSystem;
  startPoint: TouchPoint;
}

export class ScatterManager {
  private plate: Plate;
  private ghosts: Map<string, GhostType>;
  private gestureRecognizer: GestureRecognizer;
  private activeScatter: ActiveScatter | null = null;
  private particleSystems: ParticleSystem[] = [];
  private currentDish: DishDefinition | null = null;

  // Coordinate conversion helper
  private toPlateLocal: (point: TouchPoint) => TouchPoint | null;

  // Callback
  public onScatterComplete?: (result: ScatterResult) => void;

  constructor(
    plate: Plate,
    ghosts: Map<string, GhostType>,
    gestureRecognizer: GestureRecognizer,
    toPlateLocal: (point: TouchPoint) => TouchPoint | null
  ) {
    this.plate = plate;
    this.ghosts = ghosts;
    this.gestureRecognizer = gestureRecognizer;
    this.toPlateLocal = toPlateLocal;
  }

  setCurrentDish(dish: DishDefinition | null): void {
    this.currentDish = dish;
  }

  start(ingredientId: string, startPoint: TouchPoint): void {
    if (!this.currentDish) return;

    const ingredient = this.currentDish.ingredients.find(i => i.id === ingredientId);
    if (!ingredient || ingredient.gesture !== 'scatter') return;

    const color = ingredient.color ?? 0x228B22;
    const plateLocal = this.toPlateLocal(startPoint);
    if (!plateLocal) return;

    const particleSystem = new ParticleSystem(this.plate.plateRadius);
    this.plate.addChild(particleSystem);
    this.particleSystems.push(particleSystem);

    this.activeScatter = {
      ingredientId,
      color,
      particleSystem,
      startPoint: plateLocal,
    };

    this.gestureRecognizer.start(plateLocal.x, plateLocal.y, startPoint.pressure);
  }

  update(point: TouchPoint): void {
    if (!this.activeScatter) return;

    const plateLocal = this.toPlateLocal(point);
    if (!plateLocal) return;

    this.gestureRecognizer.move(plateLocal.x, plateLocal.y, point.pressure);
  }

  end(endPoint: TouchPoint): ScatterResult | null {
    if (!this.activeScatter || !this.currentDish) return null;

    const plateLocal = this.toPlateLocal(endPoint);
    if (!plateLocal) return null;

    const { ingredientId, color, particleSystem } = this.activeScatter;

    const scatterGesture = this.gestureRecognizer.getHandler('scatter') as ScatterGesture;
    const path = this.gestureRecognizer.getCurrentPath();

    if (!scatterGesture.recognize(path)) {
      this.activeScatter = null;
      particleSystem.destroy();
      this.particleSystems = this.particleSystems.filter(ps => ps !== particleSystem);
      return null;
    }

    const direction = scatterGesture.getFlickDirection(path);
    const force = scatterGesture.getFlickForce(path);
    const releasePos = scatterGesture.getReleasePosition(path);

    const ingredient = this.currentDish.ingredients.find(i => i.id === ingredientId);
    const particleCount = ingredient?.count ?? 8;

    particleSystem.scatterCircles(
      releasePos,
      direction,
      particleCount,
      color,
      12,
      {
        spread: Math.PI / 3,
        force,
        friction: 0.92,
        settleThreshold: 15,
      }
    );

    const target = this.currentDish.targets.find(t => t.ingredientId === ingredientId);

    particleSystem.onSettle(() => {
      if (!target || !('type' in target) || target.type !== 'zone') {
        return;
      }

      const zoneTarget = target as ZoneGestureTarget;

      const scatterTarget: ScatterTarget = {
        id: zoneTarget.id,
        ingredientId: zoneTarget.ingredientId,
        zone: zoneTarget.zone,
        idealCount: zoneTarget.idealCount,
      };

      const scatterResult = scoreScatter(
        particleSystem.getParticles(),
        scatterTarget,
        this.plate.plateRadius
      );

      const ghost = this.ghosts.get(target.id);
      if (ghost instanceof ScatterGhost) {
        ghost.showZoneFeedback(scatterResult.zone).then(() => {
          ghost.destroy();
          this.ghosts.delete(target.id);
        });
      }

      const result: ScatterResult = {
        success: scatterResult.zone !== 'miss',
        techniqueScore: scatterResult.score,
        zone: scatterResult.zone,
        inZoneCount: scatterResult.inZoneCount,
        totalCount: scatterResult.totalCount,
      };

      this.onScatterComplete?.(result);
    });

    this.gestureRecognizer.cancel();

    const result: ScatterResult = {
      success: true,
      techniqueScore: 0,
      zone: 'good',
      inZoneCount: 0,
      totalCount: particleCount,
    };

    this.activeScatter = null;
    return result;
  }

  updateParticleSystems(deltaSeconds: number): void {
    for (const ps of this.particleSystems) {
      ps.update(deltaSeconds);
    }
  }

  get isActive(): boolean {
    return this.activeScatter !== null;
  }

  destroy(): void {
    for (const ps of this.particleSystems) {
      ps.destroy();
    }
    this.particleSystems = [];
    this.activeScatter = null;
  }
}
