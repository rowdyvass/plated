import { Application } from 'pixi.js';

export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
  pressure: number;
}

export interface TouchPath {
  points: TouchPoint[];
  startTime: number;
  endTime: number;
  duration: number;
}

export interface InputCallbacks {
  onDragStart?: (point: TouchPoint) => void;
  onDragMove?: (point: TouchPoint, path: TouchPoint[]) => void;
  onDragEnd?: (path: TouchPath) => void;
}

export class InputManager {
  private app: Application;
  private isDragging = false;
  private currentPath: TouchPoint[] = [];
  private callbacks: InputCallbacks = {};
  private boundHandlePointerDown: (e: PointerEvent) => void;
  private boundHandlePointerMove: (e: PointerEvent) => void;
  private boundHandlePointerUp: (e: PointerEvent) => void;
  private boundHandlePointerCancel: (e: PointerEvent) => void;

  constructor(app: Application) {
    this.app = app;

    this.boundHandlePointerDown = this.handlePointerDown.bind(this);
    this.boundHandlePointerMove = this.handlePointerMove.bind(this);
    this.boundHandlePointerUp = this.handlePointerUp.bind(this);
    this.boundHandlePointerCancel = this.handlePointerCancel.bind(this);
  }

  init(): void {
    const canvas = this.app.canvas;

    canvas.addEventListener('pointerdown', this.boundHandlePointerDown);
    canvas.addEventListener('pointermove', this.boundHandlePointerMove);
    canvas.addEventListener('pointerup', this.boundHandlePointerUp);
    canvas.addEventListener('pointercancel', this.boundHandlePointerCancel);
    canvas.addEventListener('pointerleave', this.boundHandlePointerUp);

    // Prevent default touch behaviors (scrolling, zooming)
    canvas.style.touchAction = 'none';
  }

  setCallbacks(callbacks: InputCallbacks): void {
    this.callbacks = callbacks;
  }

  private getCanvasPoint(e: PointerEvent): TouchPoint {
    const canvas = this.app.canvas;
    const rect = canvas.getBoundingClientRect();

    // Account for canvas scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      timestamp: performance.now(),
      pressure: e.pressure || 0.5,
    };
  }

  private handlePointerDown(e: PointerEvent): void {
    // Only handle primary pointer (left mouse button or first touch)
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    this.isDragging = true;
    const point = this.getCanvasPoint(e);
    this.currentPath = [point];

    this.callbacks.onDragStart?.(point);
  }

  private handlePointerMove(e: PointerEvent): void {
    if (!this.isDragging) return;

    const point = this.getCanvasPoint(e);
    this.currentPath.push(point);

    this.callbacks.onDragMove?.(point, [...this.currentPath]);
  }

  private handlePointerUp(e: PointerEvent): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    const endPoint = this.getCanvasPoint(e);

    // Add final point if it's different from the last one
    const lastPoint = this.currentPath[this.currentPath.length - 1];
    if (!lastPoint || lastPoint.x !== endPoint.x || lastPoint.y !== endPoint.y) {
      this.currentPath.push(endPoint);
    }

    const path: TouchPath = {
      points: [...this.currentPath],
      startTime: this.currentPath[0]?.timestamp ?? 0,
      endTime: endPoint.timestamp,
      duration: endPoint.timestamp - (this.currentPath[0]?.timestamp ?? endPoint.timestamp),
    };

    this.callbacks.onDragEnd?.(path);
    this.currentPath = [];
  }

  private handlePointerCancel(_e: PointerEvent): void {
    this.isDragging = false;
    this.currentPath = [];
  }

  get dragging(): boolean {
    return this.isDragging;
  }

  destroy(): void {
    const canvas = this.app.canvas;

    canvas.removeEventListener('pointerdown', this.boundHandlePointerDown);
    canvas.removeEventListener('pointermove', this.boundHandlePointerMove);
    canvas.removeEventListener('pointerup', this.boundHandlePointerUp);
    canvas.removeEventListener('pointercancel', this.boundHandlePointerCancel);
    canvas.removeEventListener('pointerleave', this.boundHandlePointerUp);
  }
}
