import { Container } from 'pixi.js';
import { Ghost } from '../../entities/Ghost';
import { TexturedGhost } from '../../entities/TexturedGhost';
import { PathGhost } from '../../entities/PathGhost';
import { DotGhost } from '../../entities/DotGhost';
import { ScatterGhost } from '../../entities/ScatterGhost';
import { DrizzleGhost } from '../../entities/DrizzleGhost';
import { DustGhost } from '../../entities/DustGhost';
import type { Plate } from '../../entities/Plate';
import type { DishDefinition, PathGestureTarget, MultiPointGestureTarget, ZoneGestureTarget, DrizzleGestureTarget, DustGestureTarget } from '@/types/dishes';
import type { DustTarget } from '../../gestures/DustGesture';
import type { GhostType } from './types';

export class GhostManager {
  private ghosts: Map<string, GhostType> = new Map();
  private ghostsContainer: Container;
  private plate: Plate;
  private currentDish: DishDefinition | null = null;

  constructor(plate: Plate) {
    this.plate = plate;
    this.ghostsContainer = new Container();
    plate.addChild(this.ghostsContainer);
  }

  getGhosts(): Map<string, GhostType> {
    return this.ghosts;
  }

  getGhostsContainer(): Container {
    return this.ghostsContainer;
  }

  getCurrentDish(): DishDefinition | null {
    return this.currentDish;
  }

  loadDish(dish: DishDefinition): void {
    this.currentDish = dish;
    this.clearGhosts();

    // Ensure ghosts container is on top of any placed elements
    this.plate.addChild(this.ghostsContainer);

    // Create ghosts for each target
    for (const target of dish.targets) {
      const ingredient = dish.ingredients.find(i => i.id === target.ingredientId);
      if (!ingredient) continue;

      const ghost = this.createGhostForTarget(target, ingredient, dish.ghostOpacity);
      if (ghost) {
        this.ghostsContainer.addChild(ghost);
        this.ghosts.set(target.id, ghost);
        ghost.visible = false;
      }
    }
  }

  private createGhostForTarget(
    target: DishDefinition['targets'][number],
    ingredient: DishDefinition['ingredients'][number],
    ghostOpacity?: number
  ): GhostType | null {
    // Path-based target (swoosh)
    if ('type' in target && target.type === 'path') {
      const pathTarget = target as PathGestureTarget;
      return new PathGhost({
        path: pathTarget.path,
        plateRadius: this.plate.plateRadius,
        opacity: ghostOpacity,
        color: ingredient.color,
      });
    }

    // Multipoint target (dots)
    if ('type' in target && target.type === 'multipoint') {
      const multiTarget = target as MultiPointGestureTarget;
      return new DotGhost({
        positions: multiTarget.positions,
        plateRadius: this.plate.plateRadius,
        opacity: ghostOpacity,
        dotSize: 8,
        color: ingredient.color,
      });
    }

    // Zone target (scatter)
    if ('type' in target && target.type === 'zone') {
      const zoneTarget = target as ZoneGestureTarget;
      return new ScatterGhost({
        zone: zoneTarget.zone,
        plateRadius: this.plate.plateRadius,
        idealCount: zoneTarget.idealCount,
        opacity: ghostOpacity,
        color: ingredient.color,
      });
    }

    // Drizzle target
    if ('type' in target && target.type === 'drizzle') {
      const drizzleTarget = target as DrizzleGestureTarget;
      return new DrizzleGhost({
        path: drizzleTarget.path,
        plateRadius: this.plate.plateRadius,
        opacity: ghostOpacity,
        color: ingredient.color,
      });
    }

    // Dust target
    if ('type' in target && target.type === 'dust') {
      const dustTarget = target as DustGestureTarget;
      return new DustGhost({
        target: dustTarget as DustTarget,
        plateRadius: this.plate.plateRadius,
        opacity: ghostOpacity,
        color: ingredient.color,
      });
    }

    // Point-based target (legacy or explicit point type)
    if (ingredient.shape.type === 'path') return null;

    // Use TexturedGhost for 'place' gestures
    if (ingredient.gesture === 'place') {
      const ghost = new TexturedGhost({
        ingredientId: ingredient.id,
        opacity: ghostOpacity ?? 0.35,
        color: ingredient.color,
      });

      const position = 'position' in target ? target.position : { x: 0, y: 0 };
      ghost.x = position.x * this.plate.plateRadius;
      ghost.y = position.y * this.plate.plateRadius;

      return ghost;
    }

    // Fall back to simple Ghost
    const ghost = new Ghost({
      shape: ingredient.shape as { type: 'circle'; diameter: number } | { type: 'roundRect'; width: number; height: number; radius: number },
      opacity: ghostOpacity,
      color: ingredient.color,
    });

    const position = 'position' in target ? target.position : { x: 0, y: 0 };
    ghost.x = position.x * this.plate.plateRadius;
    ghost.y = position.y * this.plate.plateRadius;

    return ghost;
  }

  showGhostForIngredient(ingredientId: string): void {
    if (!this.currentDish) return;

    // Hide all ghosts first
    for (const ghost of this.ghosts.values()) {
      ghost.visible = false;
    }

    // Show ghosts for this ingredient
    const targets = this.currentDish.targets.filter(t => t.ingredientId === ingredientId);
    for (const target of targets) {
      const ghost = this.ghosts.get(target.id);
      if (ghost) {
        ghost.visible = true;
        ghost.startAnimation();
      }
    }
  }

  hideGhostForIngredient(ingredientId: string): void {
    if (!this.currentDish) return;

    const targets = this.currentDish.targets.filter(t => t.ingredientId === ingredientId);
    for (const target of targets) {
      const ghost = this.ghosts.get(target.id);
      if (ghost) {
        ghost.visible = false;
      }
    }
  }

  getGhost(targetId: string): GhostType | undefined {
    return this.ghosts.get(targetId);
  }

  removeGhost(targetId: string): void {
    const ghost = this.ghosts.get(targetId);
    if (ghost) {
      ghost.destroy();
      this.ghosts.delete(targetId);
    }
  }

  updateAll(deltaMs: number): void {
    for (const ghost of this.ghosts.values()) {
      ghost.update(deltaMs);
    }
  }

  clearGhosts(): void {
    for (const ghost of this.ghosts.values()) {
      ghost.destroy();
    }
    this.ghosts.clear();
    this.ghostsContainer.removeChildren();
  }

  destroy(): void {
    this.clearGhosts();
    this.ghostsContainer.destroy();
  }
}
