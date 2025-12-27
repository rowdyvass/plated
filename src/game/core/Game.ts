import { Ticker } from 'pixi.js';
import { Renderer } from './Renderer';
import { InputManager, TouchPoint, TouchPath } from './InputManager';
import { Plate } from '../entities/Plate';
import { GestureRecognizer } from '../gestures/GestureRecognizer';
import {
  GhostManager,
  PlacementManager,
  SwooshManager,
  ScatterManager,
  DrizzleManager,
  DustManager,
  type PlacedVisual,
  type SwooshResult,
  type DotResult,
  type ScatterResult,
  type PlaceResult,
  type DustResult,
} from './managers';
import type { DishDefinition, GestureTarget } from '@/types/dishes';
import type { PrecisionResult } from '../scoring/PrecisionScorer';

// Re-export types for backwards compatibility
export type { PlacedVisual, SwooshResult, DotResult, ScatterResult, PlaceResult, DustResult };

export class Game {
  private renderer: Renderer;
  private inputManager: InputManager | null = null;
  private plate: Plate | null = null;
  private initialized = false;
  private destroyed = false;
  private ticker: Ticker | null = null;
  private lastTickTime = 0;

  // Gesture recognition
  private gestureRecognizer: GestureRecognizer;

  // Managers
  private ghostManager: GhostManager | null = null;
  private placementManager: PlacementManager | null = null;
  private swooshManager: SwooshManager | null = null;
  private scatterManager: ScatterManager | null = null;
  private drizzleManager: DrizzleManager | null = null;
  private dustManager: DustManager | null = null;

  // Callbacks for drag events
  public onDragStart?: (point: TouchPoint) => void;
  public onDragMove?: (point: TouchPoint) => void;
  public onDragEnd?: (path: TouchPath, isOverPlate: boolean, platePosition: { x: number; y: number } | null) => void;

  // Callback for swoosh gesture
  public onSwooshStart?: (ingredientId: string) => void;
  public onSwooshMove?: (points: TouchPoint[]) => void;
  public onSwooshEnd?: (result: SwooshResult) => void;

  // Callback for dot gesture
  public onDotPlaced?: (result: DotResult) => void;

  // Callback for scatter gesture
  public onScatterComplete?: (result: ScatterResult) => void;

  // Callback for drizzle gesture
  public onDrizzleStart?: (ingredientId: string) => void;
  public onDrizzleMove?: (points: TouchPoint[]) => void;
  public onDrizzleEnd?: (result: SwooshResult) => void;

  // Callback for dust gesture
  public onDustStart?: (ingredientId: string) => void;
  public onDustMove?: (points: TouchPoint[]) => void;
  public onDustEnd?: (result: DustResult) => void;

  // Callback for game loop tick (deltaTime in seconds)
  public onTick?: (deltaSeconds: number) => void;

  // Tutorial mode - enables enhanced ghost highlighting
  private tutorialMode = false;

  constructor() {
    this.renderer = new Renderer();
    this.gestureRecognizer = new GestureRecognizer();
  }

  setTutorialMode(enabled: boolean): void {
    this.tutorialMode = enabled;
  }

  isTutorialMode(): boolean {
    return this.tutorialMode;
  }

  async init(container: HTMLElement): Promise<void> {
    if (this.initialized || this.destroyed) return;

    await this.renderer.init(container);

    if (this.destroyed) {
      this.renderer.destroy();
      return;
    }

    this.createPlate();
    this.setupManagers();
    this.setupInputManager();
    this.setupTicker();
    this.initialized = true;
  }

  private createPlate(): void {
    this.plate = new Plate({
      diameter: 280,
      rimWidth: 12,
    });

    this.plate.y = -40;
    this.renderer.stage.addChild(this.plate);
  }

  private setupManagers(): void {
    if (!this.plate) return;

    // Create ghost manager first (others depend on its ghosts map)
    this.ghostManager = new GhostManager(this.plate);
    const ghosts = this.ghostManager.getGhosts();
    const ghostsContainer = this.ghostManager.getGhostsContainer();
    const placedVisuals: PlacedVisual[] = [];

    // Create placement manager
    this.placementManager = new PlacementManager(
      this.plate,
      ghostsContainer,
      ghosts
    );

    // Create gesture managers with coordinate conversion helper
    const toPlateLocal = this.toPlateLocal.bind(this);

    this.swooshManager = new SwooshManager(
      this.plate,
      ghosts,
      placedVisuals,
      this.gestureRecognizer,
      toPlateLocal
    );

    this.scatterManager = new ScatterManager(
      this.plate,
      ghosts,
      this.gestureRecognizer,
      toPlateLocal
    );

    this.drizzleManager = new DrizzleManager(
      this.plate,
      ghosts,
      placedVisuals,
      this.gestureRecognizer,
      toPlateLocal
    );

    this.dustManager = new DustManager(
      this.plate,
      ghostsContainer,
      ghosts,
      placedVisuals,
      this.gestureRecognizer,
      toPlateLocal
    );

    // Wire up callbacks
    this.swooshManager.onSwooshStart = (id) => this.onSwooshStart?.(id);
    this.swooshManager.onSwooshMove = (points) => this.onSwooshMove?.(points);
    this.swooshManager.onSwooshEnd = (result) => this.onSwooshEnd?.(result);

    this.scatterManager.onScatterComplete = (result) => this.onScatterComplete?.(result);

    this.drizzleManager.onDrizzleStart = (id) => this.onDrizzleStart?.(id);
    this.drizzleManager.onDrizzleMove = (points) => this.onDrizzleMove?.(points);
    this.drizzleManager.onDrizzleEnd = (result) => this.onDrizzleEnd?.(result);

    this.dustManager.onDustStart = (id) => this.onDustStart?.(id);
    this.dustManager.onDustMove = (points) => this.onDustMove?.(points);
    this.dustManager.onDustEnd = (result) => this.onDustEnd?.(result);

    this.placementManager.onDotPlaced = (result) => this.onDotPlaced?.(result);
  }

  private setupTicker(): void {
    this.ticker = new Ticker();
    this.lastTickTime = performance.now();

    this.ticker.add(() => {
      const now = performance.now();
      const deltaMs = now - this.lastTickTime;
      this.lastTickTime = now;
      const deltaSeconds = deltaMs / 1000;

      // Update ghosts
      this.ghostManager?.updateAll(deltaMs);

      // Update swoosh settling
      this.swooshManager?.updateSettling(deltaMs);

      // Update particle systems
      this.scatterManager?.updateParticleSystems(deltaSeconds);

      // Update dust emitters
      this.dustManager?.updateDustEmitters(deltaSeconds);

      // Call external tick handler
      this.onTick?.(deltaSeconds);
    });

    this.ticker.start();
  }

  private setupInputManager(): void {
    this.inputManager = new InputManager(this.renderer.app);
    this.inputManager.init();

    this.inputManager.setCallbacks({
      onDragStart: (point) => {
        this.onDragStart?.(point);
      },
      onDragMove: (point) => {
        this.onDragMove?.(point);
      },
      onDragEnd: (path) => {
        const lastPoint = path.points[path.points.length - 1];
        if (lastPoint) {
          const isOverPlate = this.isPointOverPlate(lastPoint.x, lastPoint.y);
          const platePos = isOverPlate ? this.getPlateLocalPosition(lastPoint.x, lastPoint.y) : null;
          this.onDragEnd?.(path, isOverPlate, platePos);
        }
      },
    });
  }

  private toPlateLocal(point: TouchPoint): TouchPoint | null {
    if (!this.plate) return null;

    const stageX = point.x - this.renderer.stage.x;
    const stageY = point.y - this.renderer.stage.y;

    return {
      ...point,
      x: stageX - this.plate.x,
      y: stageY - this.plate.y,
    };
  }

  // Swoosh gesture delegation
  startSwoosh(ingredientId: string, startPoint: TouchPoint): void {
    this.swooshManager?.start(ingredientId, startPoint);
  }

  updateSwoosh(point: TouchPoint): void {
    this.swooshManager?.update(point);
  }

  endSwoosh(endPoint: TouchPoint): SwooshResult | null {
    return this.swooshManager?.end(endPoint) ?? null;
  }

  get isSwooshActive(): boolean {
    return this.swooshManager?.isActive ?? false;
  }

  // Scatter gesture delegation
  startScatter(ingredientId: string, startPoint: TouchPoint): void {
    this.scatterManager?.start(ingredientId, startPoint);
  }

  updateScatter(point: TouchPoint): void {
    this.scatterManager?.update(point);
  }

  endScatter(endPoint: TouchPoint): ScatterResult | null {
    return this.scatterManager?.end(endPoint) ?? null;
  }

  get isScatterActive(): boolean {
    return this.scatterManager?.isActive ?? false;
  }

  // Drizzle gesture delegation
  startDrizzle(ingredientId: string, startPoint: TouchPoint): void {
    this.drizzleManager?.start(ingredientId, startPoint);
  }

  updateDrizzle(point: TouchPoint): void {
    this.drizzleManager?.update(point);
  }

  endDrizzle(endPoint: TouchPoint): SwooshResult | null {
    return this.drizzleManager?.end(endPoint) ?? null;
  }

  get isDrizzleActive(): boolean {
    return this.drizzleManager?.isActive ?? false;
  }

  // Dust gesture delegation
  startDust(ingredientId: string, startPoint: TouchPoint): void {
    this.dustManager?.start(ingredientId, startPoint);
  }

  updateDust(point: TouchPoint): void {
    this.dustManager?.update(point);
  }

  endDust(endPoint: TouchPoint): DustResult | null {
    return this.dustManager?.end(endPoint) ?? null;
  }

  get isDustActive(): boolean {
    return this.dustManager?.isActive ?? false;
  }

  // Coordinate helpers
  isPointOverPlate(canvasX: number, canvasY: number): boolean {
    if (!this.plate) return false;

    const stageX = canvasX - this.renderer.stage.x;
    const stageY = canvasY - this.renderer.stage.y;

    const plateX = stageX - this.plate.x;
    const plateY = stageY - this.plate.y;
    const distance = Math.sqrt(plateX * plateX + plateY * plateY);

    return distance <= this.plate.plateRadius;
  }

  getPlateLocalPosition(canvasX: number, canvasY: number): { x: number; y: number } | null {
    if (!this.plate) return null;

    const stageX = canvasX - this.renderer.stage.x;
    const stageY = canvasY - this.renderer.stage.y;

    return {
      x: stageX - this.plate.x,
      y: stageY - this.plate.y,
    };
  }

  // Placement delegation
  addPlacedElement(
    id: string,
    x: number,
    y: number,
    shape?: { type: string; diameter?: number; width?: number; height?: number; radius?: number },
    color?: number
  ): void {
    this.placementManager?.addPlacedElement(id, x, y, shape, color);
  }

  clearPlacedElements(): void {
    this.placementManager?.clearPlacedElements();
  }

  placeElementWithScoring(
    ingredientId: string,
    x: number,
    y: number
  ): { precision: PrecisionResult; target: GestureTarget } | null {
    return this.placementManager?.placeElementWithScoring(ingredientId, x, y) ?? null;
  }

  placeMultipoint(ingredientId: string, x: number, y: number): PlaceResult | null {
    return this.placementManager?.placeMultipoint(ingredientId, x, y) ?? null;
  }

  isMultipointIngredient(ingredientId: string): boolean {
    return this.placementManager?.isMultipointIngredient(ingredientId) ?? false;
  }

  placeDot(ingredientId: string, x: number, y: number): DotResult | null {
    return this.placementManager?.placeDot(ingredientId, x, y) ?? null;
  }

  // Dish and ghost management
  loadDish(dish: DishDefinition): void {
    this.ghostManager?.loadDish(dish);
    this.placementManager?.setCurrentDish(dish);
    this.placementManager?.clearPlacedElements();
    this.swooshManager?.setCurrentDish(dish);
    this.swooshManager?.clear();
    this.scatterManager?.setCurrentDish(dish);
    this.drizzleManager?.setCurrentDish(dish);
    this.drizzleManager?.clear();
    this.dustManager?.setCurrentDish(dish);
  }

  showGhostForIngredient(ingredientId: string): void {
    this.ghostManager?.showGhostForIngredient(ingredientId);
  }

  hideGhostForIngredient(ingredientId: string): void {
    this.ghostManager?.hideGhostForIngredient(ingredientId);
  }

  clearGhosts(): void {
    this.ghostManager?.clearGhosts();
  }

  getCurrentDish(): DishDefinition | null {
    return this.ghostManager?.getCurrentDish() ?? null;
  }

  getPlateRadius(): number {
    return this.plate?.plateRadius ?? 0;
  }

  getStageOffset(): { x: number; y: number } {
    return {
      x: this.renderer.stage.x,
      y: this.renderer.stage.y,
    };
  }

  destroy(): void {
    this.destroyed = true;

    if (!this.initialized) return;

    this.placementManager?.destroy();
    this.swooshManager?.destroy();
    this.scatterManager?.destroy();
    this.drizzleManager?.destroy();
    this.dustManager?.destroy();
    this.ghostManager?.destroy();

    if (this.ticker) {
      this.ticker.stop();
      this.ticker.destroy();
      this.ticker = null;
    }

    if (this.inputManager) {
      this.inputManager.destroy();
      this.inputManager = null;
    }

    if (this.plate) {
      this.plate.destroy();
      this.plate = null;
    }

    this.renderer.destroy();
    this.initialized = false;
  }
}
