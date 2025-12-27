import { Container, Graphics, Sprite } from 'pixi.js';
import { getIngredientTexture, getCachedTexture } from '../../textures';
import { scorePlacement, type PrecisionResult } from '../../scoring/PrecisionScorer';
import { DotGhost } from '../../entities/DotGhost';
import type { Plate } from '../../entities/Plate';
import type { DishDefinition, GestureTarget, MultiPointGestureTarget } from '@/types/dishes';
import type { GhostType, PlacedVisual, PlaceResult, DotResult } from './types';

export class PlacementManager {
  private plate: Plate;
  private ghostsContainer: Container;
  private ghosts: Map<string, GhostType>;
  private placedVisuals: PlacedVisual[] = [];
  private currentDish: DishDefinition | null = null;

  // Callback for dot placement
  public onDotPlaced?: (result: DotResult) => void;

  constructor(
    plate: Plate,
    ghostsContainer: Container,
    ghosts: Map<string, GhostType>
  ) {
    this.plate = plate;
    this.ghostsContainer = ghostsContainer;
    this.ghosts = ghosts;
  }

  setCurrentDish(dish: DishDefinition | null): void {
    this.currentDish = dish;
  }

  getPlacedVisuals(): PlacedVisual[] {
    return this.placedVisuals;
  }

  placeElementWithScoring(
    ingredientId: string,
    x: number,
    y: number
  ): { precision: PrecisionResult; target: GestureTarget } | null {
    if (!this.currentDish) return null;

    const target = this.currentDish.targets.find(t => t.ingredientId === ingredientId);
    if (!target) return null;

    // Only score point-based targets
    if ('type' in target && target.type === 'path') {
      return null;
    }

    const precision = scorePlacement(
      { x, y },
      target,
      this.plate.plateRadius
    );

    // Show ghost feedback
    const ghost = this.ghosts.get(target.id);
    if (ghost) {
      ghost.showZoneFeedback(precision.zone).then(() => {
        ghost.destroy();
        this.ghosts.delete(target.id);
      });
    }

    const ingredient = this.currentDish!.ingredients.find(i => i.id === ingredientId);
    const shape = ingredient?.shape;
    const color = ingredient?.color;

    this.addPlacedElement(ingredientId, x, y, shape, color);

    return { precision, target: target as GestureTarget };
  }

  placeMultipoint(
    ingredientId: string,
    x: number,
    y: number
  ): PlaceResult | null {
    if (!this.currentDish) return null;

    const target = this.currentDish.targets.find(t => t.ingredientId === ingredientId);
    if (!target || !('type' in target) || target.type !== 'multipoint') return null;

    const multiTarget = target as MultiPointGestureTarget;
    const ghost = this.ghosts.get(target.id);

    if (!(ghost instanceof DotGhost)) return null;

    const closest = ghost.getClosestUnplacedDot(x, y);
    if (!closest) return null;

    const distance = closest.distance;
    const plateRadius = this.plate.plateRadius;

    const perfectRadius = multiTarget.zones.perfect * plateRadius;
    const greatRadius = multiTarget.zones.great * plateRadius;
    const goodRadius = multiTarget.zones.good * plateRadius;
    const acceptableRadius = multiTarget.zones.acceptable * plateRadius;

    let techniqueScore = 100;
    let success = true;
    let zone: 'perfect' | 'great' | 'good' | 'acceptable' | 'miss' = 'perfect';

    if (distance <= perfectRadius) {
      techniqueScore = 100;
      zone = 'perfect';
    } else if (distance <= greatRadius) {
      techniqueScore = 90;
      zone = 'great';
    } else if (distance <= goodRadius) {
      techniqueScore = 75;
      zone = 'good';
    } else if (distance <= acceptableRadius) {
      techniqueScore = 60;
      zone = 'acceptable';
    } else {
      techniqueScore = 30;
      success = false;
      zone = 'miss';
    }

    ghost.markDotPlaced(closest.index);
    ghost.showDotFeedback(closest.index, zone);

    const ingredient = this.currentDish!.ingredients.find(i => i.id === ingredientId);
    const shape = ingredient?.shape;
    const color = ingredient?.color;

    this.addPlacedElement(ingredientId, x, y, shape, color);

    const remainingCount = ghost.getRemainingCount();

    if (ghost.isComplete()) {
      ghost.fadeOut().then(() => {
        ghost.destroy();
        this.ghosts.delete(target.id);
      });
    }

    return {
      success,
      techniqueScore,
      zone,
      placedIndex: closest.index,
      remainingCount,
      totalCount: multiTarget.positions.length,
    };
  }

  isMultipointIngredient(ingredientId: string): boolean {
    if (!this.currentDish) return false;
    const target = this.currentDish.targets.find(t => t.ingredientId === ingredientId);
    return target !== undefined && 'type' in target && target.type === 'multipoint';
  }

  placeDot(
    ingredientId: string,
    x: number,
    y: number
  ): DotResult | null {
    if (!this.currentDish) return null;

    const target = this.currentDish.targets.find(t => t.ingredientId === ingredientId);
    if (!target || !('type' in target) || target.type !== 'multipoint') return null;

    const multiTarget = target as MultiPointGestureTarget;
    const ghost = this.ghosts.get(target.id);

    if (!(ghost instanceof DotGhost)) return null;

    const closestDot = ghost.getClosestUnplacedDot(x, y);
    if (!closestDot) return null;

    const distance = closestDot.distance;
    const plateRadius = this.plate.plateRadius;

    const perfectRadius = multiTarget.zones.perfect * plateRadius;
    const greatRadius = multiTarget.zones.great * plateRadius;
    const goodRadius = multiTarget.zones.good * plateRadius;
    const acceptableRadius = multiTarget.zones.acceptable * plateRadius;

    let techniqueScore = 100;
    const penalties: { reason: string; deduction: number }[] = [];
    let success = true;
    let zone: 'perfect' | 'great' | 'good' | 'acceptable' | 'miss' = 'perfect';

    if (distance <= perfectRadius) {
      techniqueScore = 100;
      zone = 'perfect';
    } else if (distance <= greatRadius) {
      penalties.push({ reason: 'Slight position offset', deduction: 10 });
      techniqueScore = 90;
      zone = 'great';
    } else if (distance <= goodRadius) {
      penalties.push({ reason: 'Position offset', deduction: 25 });
      techniqueScore = 75;
      zone = 'good';
    } else if (distance <= acceptableRadius) {
      penalties.push({ reason: 'Significant position offset', deduction: 40 });
      techniqueScore = 60;
      zone = 'acceptable';
    } else {
      penalties.push({ reason: 'Missed target zone', deduction: 70 });
      techniqueScore = 30;
      success = false;
      zone = 'miss';
    }

    ghost.markDotPlaced(closestDot.index);
    ghost.showDotFeedback(closestDot.index, zone);

    this.addDotVisual(ingredientId, x, y, closestDot.index);

    const remainingDots = ghost.getRemainingCount();

    if (ghost.isComplete()) {
      ghost.fadeOut().then(() => {
        ghost.destroy();
        this.ghosts.delete(target.id);
      });
    }

    const result: DotResult = {
      success,
      techniqueScore,
      penalties,
      dotIndex: closestDot.index,
      remainingDots,
    };

    this.onDotPlaced?.(result);

    return result;
  }

  addPlacedElement(
    id: string,
    x: number,
    y: number,
    shape?: { type: string; diameter?: number; width?: number; height?: number; radius?: number },
    color?: number
  ): void {
    const container = new Container();

    const cachedTexture = getCachedTexture(id, 'plate');

    if (cachedTexture) {
      const sprite = new Sprite(cachedTexture);
      sprite.anchor.set(0.5);
      container.addChild(sprite);
    } else {
      this.loadAndReplaceWithTexture(container, id);

      const graphics = new Graphics();
      if (shape?.type === 'circle' && shape.diameter) {
        const radius = shape.diameter / 2;
        graphics.circle(0, 0, radius);
        graphics.fill(color ?? 0xfbbf24);
      } else if (shape?.type === 'roundRect' && shape.width && shape.height) {
        const halfW = shape.width / 2;
        const halfH = shape.height / 2;
        graphics.roundRect(-halfW, -halfH, shape.width, shape.height, shape.radius ?? 4);
        graphics.fill(color ?? 0xfbbf24);
      } else {
        graphics.roundRect(-24, -24, 48, 48, 4);
        graphics.fill(color ?? 0xfbbf24);
      }
      container.addChild(graphics);
    }

    container.x = x;
    container.y = y;

    // Insert before ghosts container
    if (this.plate.children.includes(this.ghostsContainer)) {
      const ghostsIndex = this.plate.getChildIndex(this.ghostsContainer);
      this.plate.addChildAt(container, ghostsIndex);
    } else {
      this.plate.addChild(container);
    }

    this.placedVisuals.push({ id, container, type: 'element' });

    container.scale.set(1.05);
    this.animateScale(container, 1.0, 150);
  }

  private async loadAndReplaceWithTexture(container: Container, ingredientId: string): Promise<void> {
    const texture = await getIngredientTexture(ingredientId, 'plate');

    if (!texture || container.destroyed || container.children.length === 0) return;

    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);

    const oldChild = container.children[0];
    container.removeChild(oldChild);
    oldChild.destroy();
    container.addChild(sprite);
  }

  private addDotVisual(ingredientId: string, x: number, y: number, dotIndex: number): void {
    if (!this.currentDish) return;

    const ingredient = this.currentDish.ingredients.find(i => i.id === ingredientId);
    const color = ingredient?.color ?? 0x4A3728;
    const dotSize = 8;

    const container = new Container();
    const graphics = new Graphics();
    const alpha = 0.9;

    // Soft outer edge
    graphics.circle(0, 0, dotSize * 1.15);
    graphics.fill({ color, alpha: alpha * 0.3 });

    // Main dot body
    graphics.circle(0, 0, dotSize);
    graphics.fill({ color, alpha });

    // Specular highlight
    const highlightOffset = dotSize * 0.3;
    const highlightSize = dotSize * 0.25;
    graphics.circle(-highlightOffset, -highlightOffset, highlightSize);
    graphics.fill({ color: 0xFFFFFF, alpha: 0.4 });

    container.addChild(graphics);
    container.x = x;
    container.y = y;

    if (this.plate.children.includes(this.ghostsContainer)) {
      const ghostsIndex = this.plate.getChildIndex(this.ghostsContainer);
      this.plate.addChildAt(container, ghostsIndex);
    } else {
      this.plate.addChild(container);
    }

    this.placedVisuals.push({
      id: `${ingredientId}-dot-${dotIndex}`,
      container,
      type: 'sauce',
    });

    container.scale.set(0.5);
    this.animateScale(container, 1.0, 100);
  }

  private animateScale(container: Container, targetScale: number, duration: number): void {
    const startScale = container.scale.x;
    const startTime = performance.now();

    const animate = () => {
      if (container.destroyed || !container.scale) return;

      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const scale = startScale + (targetScale - startScale) * eased;
      container.scale.set(scale);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  addPlacedVisual(visual: PlacedVisual): void {
    this.placedVisuals.push(visual);
  }

  clearPlacedElements(): void {
    for (const visual of this.placedVisuals) {
      visual.container.destroy();
    }
    this.placedVisuals = [];
  }

  destroy(): void {
    this.clearPlacedElements();
  }
}
