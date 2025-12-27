import { Application, Container } from 'pixi.js';

export class Renderer {
  public app: Application;
  public stage: Container;
  private resizeHandler: () => void;
  private container: HTMLElement | null = null;
  private initialized = false;

  constructor() {
    this.app = new Application();
    this.stage = new Container();
    this.resizeHandler = this.handleResize.bind(this);
  }

  async init(container: HTMLElement): Promise<void> {
    this.container = container;

    // Ensure container has dimensions
    const rect = container.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    await this.app.init({
      background: 0xfffefa,
      width,
      height,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    container.appendChild(this.app.canvas);
    this.app.stage.addChild(this.stage);

    // Set canvas to fill container
    this.app.canvas.style.width = '100%';
    this.app.canvas.style.height = '100%';

    this.initialized = true;
    window.addEventListener('resize', this.resizeHandler);
    this.centerStage(width, height);
  }

  private centerStage(width: number, height: number): void {
    this.stage.x = width / 2;
    this.stage.y = height / 2;
  }

  private handleResize(): void {
    if (!this.container || !this.initialized) return;

    const rect = this.container.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    // Resize the renderer
    if (this.app.renderer) {
      this.app.renderer.resize(width, height);
    }

    // Center the stage
    this.stage.x = width / 2;
    this.stage.y = height / 2;
  }

  get width(): number {
    return this.app.screen.width;
  }

  get height(): number {
    return this.app.screen.height;
  }

  destroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    this.container = null;

    if (this.initialized && this.app.renderer) {
      this.app.destroy(true, { children: true });
    }
    this.initialized = false;
  }
}
