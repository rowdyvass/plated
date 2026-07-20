/**
 * LabRenderer — Pixi 8 scene for the Phase 1 feel prototype.
 *
 * Draws the environment (lit walnut table, ceramic plate), fluid sauce
 * (metaball splat field: blur + alpha-threshold "gooey" filter), and placed
 * food sprites with contact shadows and lift/settle animation. All plate
 * content mirrors the PlateModel; the renderer never invents state.
 */

import {
  Application,
  BlurFilter,
  ColorMatrixFilter,
  Container,
  Sprite,
  Texture,
  TilingSprite,
} from 'pixi.js';
import { PlateModel, type LabItemKind, type SauceStroke } from './model';
import {
  makeContactShadowTexture,
  makeLightPoolTexture,
  makePlateShadowTexture,
  makePlateTexture,
  makeSplatTexture,
  makeSweepTexture,
  makeVignetteTexture,
  makeWoodTexture,
} from './textures';
import { FOOD_PLATE_SCALE, getFoodAssets } from './foodPaint';
import { labAudio } from './audio';

export interface LabPoint {
  x: number;
  y: number;
}

interface Tween {
  elapsed: number;
  duration: number;
  update: (p: number) => void;
  onComplete?: () => void;
}

interface DragState {
  kind: LabItemKind;
  container: Container;
  sprite: Sprite;
  shadow: Sprite;
  /** When set, we're moving an existing placed item rather than a new one. */
  existingId: string | null;
  rotation: number;
  lastPoints: { x: number; y: number; t: number }[];
}

interface PaintState {
  stroke: SauceStroke;
  lastSplat: LabPoint | null;
  lastSplatSprites: { base: Sprite; sheen: Sprite } | null;
  stationaryMs: number;
  lastPoints: { x: number; y: number; t: number }[];
  splatCount: number;
}

// Sauce colors are painted by the layer's ColorMatrix (constant offsets), not
// by sprite tint — tint doesn't survive the blur+threshold chain cleanly.
const SAUCE_BASE_RGB: [number, number, number] = [0.455, 0.286, 0.114]; // beurre noisette
const SAUCE_SHEEN_RGB: [number, number, number] = [0.83, 0.68, 0.42]; // buttery caramel streak
const SPLAT_SPACING = 6;
const MAX_SPLATS_PER_STROKE = 420;

function easeOutBack(p: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
}

function easeOutCubic(p: number): number {
  return 1 - Math.pow(1 - p, 3);
}

export class LabRenderer {
  readonly model = new PlateModel();

  private app: Application | null = null;
  private host: HTMLElement | null = null;
  private destroyed = false;

  private plateCenter: LabPoint = { x: 0, y: 0 };
  private plateRadius = 200;

  // Layers (bottom → top)
  private tableLayer = new Container();
  private sauceBase = new Container();
  private sauceSheen = new Container();
  private foodLayer = new Container();
  private dragLayer = new Container();
  private fxLayer = new Container();

  private vignette: Sprite | null = null;
  private sweep: Sprite | null = null;

  private splatTexture: Texture | null = null;
  private contactShadowTexture: Texture | null = null;
  private foodTextures: Record<LabItemKind, Texture> | null = null;

  /** Placed-item containers by model id. */
  private itemNodes = new Map<string, Container>();
  /** Sauce splat sprites by stroke id. */
  private strokeNodes = new Map<string, Sprite[]>();

  private tweens: Tween[] = [];
  private drag: DragState | null = null;
  private paint: PaintState | null = null;

  get isReady(): boolean {
    return this.foodTextures !== null;
  }

  get dragging(): boolean {
    return this.drag !== null;
  }

  async init(host: HTMLElement): Promise<void> {
    this.host = host;
    const app = new Application();
    await app.init({
      background: 0x2c1f15,
      resizeTo: host,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
    });
    // React StrictMode can unmount us mid-init; bail out cleanly.
    if (this.destroyed) {
      app.destroy(true);
      return;
    }
    this.app = app;
    host.appendChild(app.canvas);

    const w = app.screen.width;
    const h = app.screen.height;
    this.plateRadius = Math.min(w, h) * 0.3;
    this.plateCenter = { x: w / 2, y: h * 0.46 };

    this.buildEnvironment(w, h);
    this.buildSauceLayers();

    app.stage.addChild(this.tableLayer);
    app.stage.addChild(this.sauceBase);
    app.stage.addChild(this.sauceSheen);
    app.stage.addChild(this.foodLayer);
    app.stage.addChild(this.dragLayer);
    app.stage.addChild(this.fxLayer);
    this.buildOverlay(w, h);

    this.splatTexture = makeSplatTexture();
    this.contactShadowTexture = makeContactShadowTexture();
    // Yield a frame so the loading state paints before the ~300ms food render
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    if (this.destroyed) return;
    this.foodTextures = getFoodAssets().textures;

    app.ticker.add((ticker) => this.tick(ticker.deltaMS));
  }

  destroy(): void {
    this.destroyed = true;
    labAudio.pourEnd();
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true });
      this.app = null;
    }
    if (this.host) {
      this.host.innerHTML = '';
      this.host = null;
    }
    this.itemNodes.clear();
    this.strokeNodes.clear();
    this.tweens = [];
  }

  // -------------------------------------------------------------------------
  // Scene construction
  // -------------------------------------------------------------------------

  private buildEnvironment(w: number, h: number): void {
    const wood = new TilingSprite({ texture: makeWoodTexture(), width: w, height: h });
    this.tableLayer.addChild(wood);

    const light = new Sprite(makeLightPoolTexture());
    light.anchor.set(0.5);
    light.position.set(this.plateCenter.x, this.plateCenter.y);
    light.scale.set((this.plateRadius * 4.6) / 512);
    light.blendMode = 'add';
    light.alpha = 0.34;
    this.tableLayer.addChild(light);

    const plateShadow = new Sprite(makePlateShadowTexture());
    plateShadow.anchor.set(0.5);
    plateShadow.position.set(this.plateCenter.x + this.plateRadius * 0.03, this.plateCenter.y + this.plateRadius * 0.08);
    plateShadow.width = this.plateRadius * 2.5;
    plateShadow.height = this.plateRadius * 2.35;
    this.tableLayer.addChild(plateShadow);

    const plate = new Sprite(makePlateTexture());
    plate.anchor.set(0.5);
    plate.position.set(this.plateCenter.x, this.plateCenter.y);
    plate.width = this.plateRadius * 2.083; // texture radius is 0.48 of its size
    plate.height = this.plateRadius * 2.083;
    this.tableLayer.addChild(plate);
  }

  private buildSauceLayers(): void {
    // The classic "gooey" trick: blur the white splat field, then slam alpha
    // contrast so the blurred union reads as one liquid body. The same matrix
    // paints the liquid's color as constant rgb offsets — splats stay white,
    // which sidesteps premultiplied-alpha fringing entirely.
    const configs: [Container, number, [number, number, number]][] = [
      [this.sauceBase, 7, SAUCE_BASE_RGB],
      [this.sauceSheen, 5, SAUCE_SHEEN_RGB],
    ];
    for (const [layer, blurStrength, rgb] of configs) {
      const blur = new BlurFilter({ strength: blurStrength, quality: 4 });

      // Pass 1 — alpha slam only. The shader re-premultiplies rgb by the
      // *unclamped* post-matrix alpha, so color must NOT be set here; the
      // intermediate framebuffer clamps everything back to [0,1].
      const threshold = new ColorMatrixFilter();
      {
        const m = threshold.matrix;
        m.fill(0);
        m[0] = 1;
        m[6] = 1;
        m[12] = 1;
        m[18] = 26; // alpha scale
        m[19] = -11; // alpha offset → liquid edge
      }

      // Pass 2 — paint the (now clamped) liquid body in the sauce color.
      const paint = new ColorMatrixFilter();
      {
        const m = paint.matrix;
        m.fill(0);
        m[4] = rgb[0];
        m[9] = rgb[1];
        m[14] = rgb[2];
        m[18] = 1; // alpha passthrough
      }

      blur.padding = 24;
      threshold.padding = 24;
      paint.padding = 24;
      layer.filters = [blur, threshold, paint];
    }
  }

  private buildOverlay(w: number, h: number): void {
    const sweep = new Sprite(makeSweepTexture());
    sweep.anchor.set(0.5);
    sweep.rotation = -0.5;
    sweep.width = w * 0.7;
    sweep.height = Math.hypot(w, h) * 1.4;
    sweep.blendMode = 'add';
    sweep.alpha = 0;
    this.fxLayer.addChild(sweep);
    this.sweep = sweep;

    const vignette = new Sprite(makeVignetteTexture());
    vignette.width = w;
    vignette.height = h;
    vignette.alpha = 0.72;
    this.fxLayer.addChild(vignette);
    this.vignette = vignette;
  }

  // -------------------------------------------------------------------------
  // Ticker: tweens, sauce pooling, drag physics
  // -------------------------------------------------------------------------

  private tick(deltaMS: number): void {
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const tw = this.tweens[i];
      tw.elapsed += deltaMS;
      const p = Math.min(1, tw.elapsed / tw.duration);
      tw.update(p);
      if (p >= 1) {
        this.tweens.splice(i, 1);
        tw.onComplete?.();
      }
    }

    // Sauce pooling: holding the pour in place grows the puddle
    if (this.paint?.lastSplatSprites && this.paint.lastSplat) {
      this.paint.stationaryMs += deltaMS;
      if (this.paint.stationaryMs > 110) {
        const { base, sheen } = this.paint.lastSplatSprites;
        const grow = 1 + deltaMS * 0.0011;
        const maxW = this.plateRadius * 0.55;
        if (base.width < maxW) {
          base.scale.set(base.scale.x * grow);
          sheen.scale.set(sheen.scale.x * grow);
          const pts = this.paint.stroke.points;
          if (pts.length > 0) pts[pts.length - 1].r = base.width / 2;
          labAudio.pourLevel(0.12);
        }
      }
    }

    // Drag tilt: the carried item leans into its motion
    if (this.drag) {
      const pts = this.drag.lastPoints;
      if (pts.length >= 2) {
        const a = pts[pts.length - 2];
        const b = pts[pts.length - 1];
        const dt = Math.max(1, b.t - a.t);
        const vx = (b.x - a.x) / dt;
        const target = Math.max(-0.16, Math.min(0.16, vx * 0.06));
        const s = this.drag.sprite;
        s.rotation += (this.drag.rotation + target - s.rotation) * 0.2;
      }
    }
  }

  private addTween(duration: number, update: (p: number) => void, onComplete?: () => void): void {
    this.tweens.push({ elapsed: 0, duration, update, onComplete });
  }

  // -------------------------------------------------------------------------
  // Fluid sauce painting
  // -------------------------------------------------------------------------

  sauceStart(p: LabPoint): void {
    if (!this.isReady) return;
    this.paint = {
      stroke: this.model.beginStroke(),
      lastSplat: null,
      lastSplatSprites: null,
      stationaryMs: 0,
      lastPoints: [{ ...p, t: performance.now() }],
      splatCount: 0,
    };
    this.strokeNodes.set(this.paint.stroke.id, []);
    labAudio.pourStart();
    this.spawnSplat(p, 1);
  }

  sauceMove(p: LabPoint): void {
    if (!this.paint) return;
    const now = performance.now();
    const pts = this.paint.lastPoints;
    const prev = pts[pts.length - 1];
    pts.push({ ...p, t: now });
    if (pts.length > 6) pts.shift();

    const dist = Math.hypot(p.x - prev.x, p.y - prev.y);
    const speed = dist / Math.max(1, now - prev.t); // px per ms
    labAudio.pourLevel(Math.min(1, speed / 1.1));

    if (!this.paint.lastSplat) {
      this.spawnSplat(p, speed);
      return;
    }
    const last = this.paint.lastSplat;
    const gap = Math.hypot(p.x - last.x, p.y - last.y);
    if (gap >= SPLAT_SPACING) {
      const steps = Math.min(8, Math.floor(gap / SPLAT_SPACING));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        this.spawnSplat({ x: last.x + (p.x - last.x) * t, y: last.y + (p.y - last.y) * t }, speed);
      }
      this.paint.stationaryMs = 0;
    }
  }

  sauceEnd(p: LabPoint): void {
    if (!this.paint) return;
    // A fast release flicks satellite droplets ahead of the stroke
    const pts = this.paint.lastPoints;
    if (pts.length >= 2) {
      const a = pts[0];
      const b = pts[pts.length - 1];
      const dt = Math.max(1, b.t - a.t);
      const vx = (b.x - a.x) / dt;
      const vy = (b.y - a.y) / dt;
      const speed = Math.hypot(vx, vy);
      if (speed > 0.55) {
        const nx = vx / speed;
        const ny = vy / speed;
        const drops = 2 + Math.floor(Math.random() * 2);
        for (let i = 1; i <= drops; i++) {
          const d = 16 + i * 14 + Math.random() * 10;
          this.spawnSplat(
            { x: p.x + nx * d + (Math.random() - 0.5) * 8, y: p.y + ny * d + (Math.random() - 0.5) * 8 },
            2.5 + i
          );
        }
      }
    }
    labAudio.pourEnd();
    this.paint = null;
  }

  /** Slow pour → wide pooling splat; fast pour → narrow trail. */
  private spawnSplat(p: LabPoint, speed: number): void {
    if (!this.paint || !this.splatTexture) return;
    if (this.paint.splatCount >= MAX_SPLATS_PER_STROKE) return;
    this.paint.splatCount++;

    const slowness = Math.max(0, 1 - speed / 1.2);
    const r = this.plateRadius * (0.045 + slowness * 0.055) * (0.92 + Math.random() * 0.16);

    const base = new Sprite(this.splatTexture);
    base.anchor.set(0.5);
    base.position.set(p.x, p.y);
    base.width = r * 2;
    base.height = r * 2;
    this.sauceBase.addChild(base);

    // A thin interior highlight streak, not a second body: much smaller than
    // the base splat and offset toward the light, so the brown still reads.
    const sheen = new Sprite(this.splatTexture);
    sheen.anchor.set(0.5);
    sheen.position.set(p.x - r * 0.2, p.y - r * 0.3);
    sheen.width = r * 0.6;
    sheen.height = r * 0.6;
    this.sauceSheen.addChild(sheen);

    this.strokeNodes.get(this.paint.stroke.id)?.push(base, sheen);
    this.paint.stroke.points.push({ x: p.x, y: p.y, r });
    this.paint.lastSplat = { ...p };
    this.paint.lastSplatSprites = { base, sheen };
  }

  // -------------------------------------------------------------------------
  // Placement: drag, lift, settle
  // -------------------------------------------------------------------------

  private itemDisplayWidth(kind: LabItemKind): number {
    return this.plateRadius * FOOD_PLATE_SCALE[kind];
  }

  private buildItemNode(kind: LabItemKind, lifted: boolean): { container: Container; sprite: Sprite; shadow: Sprite } {
    if (!this.foodTextures || !this.contactShadowTexture) throw new Error('not ready');
    const container = new Container();

    const texture = this.foodTextures[kind];
    const displayW = this.itemDisplayWidth(kind);
    const scale = displayW / texture.width;

    const shadow = new Sprite(this.contactShadowTexture);
    shadow.anchor.set(0.5);
    shadow.width = displayW * 1.15;
    shadow.height = displayW * 1.15 * 0.5 * (texture.height / texture.width) + displayW * 0.18;
    shadow.alpha = lifted ? 0.16 : 0.3;
    shadow.position.set(0, lifted ? displayW * 0.16 : displayW * 0.045);
    container.addChild(shadow);

    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.scale.set(scale * (lifted ? 1.06 : 1));
    container.addChild(sprite);

    return { container, sprite, shadow };
  }

  /** Begin dragging a new item from the tray. */
  dragStart(kind: LabItemKind, p: LabPoint): void {
    if (!this.isReady || this.drag) return;
    const { container, sprite, shadow } = this.buildItemNode(kind, true);
    container.position.set(p.x, p.y);
    this.dragLayer.addChild(container);
    this.drag = {
      kind,
      container,
      sprite,
      shadow,
      existingId: null,
      rotation: (Math.random() - 0.5) * 0.2,
      lastPoints: [{ ...p, t: performance.now() }],
    };
    labAudio.pickup();
  }

  /** Try to lift an already-placed item at this point. Returns true if picked. */
  pickAt(p: LabPoint): boolean {
    if (!this.isReady || this.drag) return false;
    const children = this.foodLayer.children;
    for (let i = children.length - 1; i >= 0; i--) {
      const node = children[i] as Container;
      const id = node.label;
      if (!id) continue;
      const item = this.model.items.find((it) => it.id === id);
      if (!item) continue;
      const local = node.toLocal(p);
      const sprite = node.children[1] as Sprite;
      const hw = sprite.width / 2 + 6;
      const hh = sprite.height / 2 + 6;
      if (Math.abs(local.x) <= hw && Math.abs(local.y) <= hh) {
        // Lift it out of the food layer into the drag layer
        this.foodLayer.removeChild(node);
        this.itemNodes.delete(id);
        node.destroy({ children: true });
        this.model.items = this.model.items.filter((it) => it.id !== id);

        const { container, sprite: s, shadow } = this.buildItemNode(item.kind, true);
        container.position.set(p.x, p.y);
        container.scale.set(item.scale);
        s.rotation = item.rotation;
        if (item.flip) s.scale.x *= -1;
        this.dragLayer.addChild(container);
        this.drag = {
          kind: item.kind,
          container,
          sprite: s,
          shadow,
          existingId: id,
          rotation: item.rotation,
          lastPoints: [{ ...p, t: performance.now() }],
        };
        labAudio.pickup();
        return true;
      }
    }
    return false;
  }

  dragMove(p: LabPoint): void {
    if (!this.drag) return;
    this.drag.container.position.set(p.x, p.y);
    this.drag.lastPoints.push({ ...p, t: performance.now() });
    if (this.drag.lastPoints.length > 6) this.drag.lastPoints.shift();
  }

  rotateDrag(delta: number): void {
    if (this.drag) this.drag.rotation += delta;
  }

  /** Drop the carried item: scatter for parsley, weighted settle otherwise. */
  dragDrop(p: LabPoint): void {
    const drag = this.drag;
    if (!drag) return;
    this.drag = null;

    if (drag.kind === 'parsley' && drag.existingId === null) {
      drag.container.destroy({ children: true });
      this.scatterParsley(p, drag.lastPoints);
      return;
    }

    const scale = 0.94 + Math.random() * 0.12;
    const flip = drag.kind !== 'sole' && Math.random() < 0.5;
    const item = this.model.addItem({
      kind: drag.kind,
      x: p.x,
      y: p.y,
      rotation: drag.rotation,
      scale,
      flip,
    });

    drag.container.destroy({ children: true });
    const { container, sprite, shadow } = this.buildItemNode(drag.kind, false);
    container.label = item.id;
    container.position.set(p.x, p.y);
    container.scale.set(scale);
    sprite.rotation = drag.rotation;
    if (flip) sprite.scale.x *= -1;
    this.foodLayer.addChild(container);
    this.itemNodes.set(item.id, container);

    this.settle(sprite, shadow, drag.kind);
  }

  dragCancel(): void {
    if (!this.drag) return;
    this.drag.container.destroy({ children: true });
    this.drag = null;
  }

  /** Weight lands: squash-overshoot, shadow snaps tight, foley by mass. */
  private settle(sprite: Sprite, shadow: Sprite, kind: LabItemKind): void {
    const baseScaleX = sprite.scale.x;
    const baseScaleY = sprite.scale.y;
    const shadowY = shadow.position.y;
    const displayW = this.itemDisplayWidth(kind);

    shadow.alpha = 0.16;
    shadow.position.y = displayW * 0.16;

    if (kind === 'quenelle') {
      // The quenelle forms as it releases from the spoon
      sprite.scale.set(baseScaleX * 1.3, baseScaleY * 0.72);
      this.addTween(300, (p) => {
        const e = easeOutBack(p);
        sprite.scale.set(baseScaleX * (1.3 - 0.3 * e), baseScaleY * (0.72 + 0.28 * e));
        shadow.alpha = 0.16 + 0.14 * p;
        shadow.position.y = displayW * 0.16 + (shadowY - displayW * 0.16) * p;
      });
      labAudio.slide();
      return;
    }

    const heavy = kind === 'sole' ? 1 : 0.55;
    sprite.scale.set(baseScaleX * 1.1, baseScaleY * 1.1);
    const wobbleAmp = kind === 'sole' ? 0.035 : 0.015;
    const baseRot = sprite.rotation;
    this.addTween(260, (p) => {
      const e = easeOutBack(p);
      const s = 1.1 - 0.1 * e;
      sprite.scale.set(baseScaleX * s, baseScaleY * (s * (1 - 0.06 * Math.sin(p * Math.PI))));
      sprite.rotation = baseRot + Math.sin(p * Math.PI * 2.5) * wobbleAmp * (1 - p);
      shadow.alpha = 0.16 + 0.14 * easeOutCubic(p);
      shadow.position.y = displayW * 0.16 + (shadowY - displayW * 0.16) * easeOutCubic(p);
    });
    labAudio.thud(heavy);
  }

  /** A flick of parsley: leaflets fan out along the throw direction. */
  private scatterParsley(p: LabPoint, recent: { x: number; y: number; t: number }[]): void {
    let dir = { x: 0, y: 0 };
    if (recent.length >= 2) {
      const a = recent[0];
      const b = recent[recent.length - 1];
      const dt = Math.max(1, b.t - a.t);
      dir = { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt };
    }
    const speed = Math.hypot(dir.x, dir.y);
    const hasDir = speed > 0.35;
    const n = 4 + Math.floor(Math.random() * 3);

    const specs: { x: number; y: number; rotation: number; scale: number; flip: boolean }[] = [];
    for (let i = 0; i < n; i++) {
      let ox: number;
      let oy: number;
      if (hasDir) {
        const along = i * 16 + Math.random() * 12;
        const side = (Math.random() - 0.5) * 34;
        const nx = dir.x / speed;
        const ny = dir.y / speed;
        ox = nx * along - ny * side;
        oy = ny * along + nx * side;
      } else {
        const a = Math.random() * Math.PI * 2;
        const d = Math.sqrt(Math.random()) * this.plateRadius * 0.22;
        ox = Math.cos(a) * d;
        oy = Math.sin(a) * d;
      }
      specs.push({
        x: p.x + ox,
        y: p.y + oy,
        rotation: Math.random() * Math.PI * 2,
        scale: 0.75 + Math.random() * 0.45,
        flip: Math.random() < 0.5,
      });
    }

    const placed = this.model.addCluster(specs.map((s) => ({ kind: 'parsley' as const, ...s })));
    placed.forEach((item, i) => {
      const { container, sprite, shadow } = this.buildItemNode('parsley', false);
      container.label = item.id;
      container.position.set(item.x, item.y);
      container.scale.set(item.scale);
      sprite.rotation = item.rotation;
      if (item.flip) sprite.scale.x *= -1;
      shadow.alpha = 0.18;
      container.alpha = 0;
      container.scale.set(item.scale * 0.3);
      this.foodLayer.addChild(container);
      this.itemNodes.set(item.id, container);

      // Staggered pop-in reads as leaves landing one after another
      this.addTween(200 + i * 45, (p) => {
        const local = Math.max(0, (p * (200 + i * 45) - i * 45) / 200);
        if (local <= 0) return;
        const e = easeOutBack(Math.min(1, local));
        container.alpha = Math.min(1, local * 2);
        container.scale.set(item.scale * (0.3 + 0.7 * e));
      });
    });
    labAudio.scatter(n);
  }

  // -------------------------------------------------------------------------
  // Undo / clear / beauty shot
  // -------------------------------------------------------------------------

  undo(): void {
    const ids = this.model.undo();
    for (const id of ids) {
      const node = this.itemNodes.get(id);
      if (node) {
        node.destroy({ children: true });
        this.itemNodes.delete(id);
        continue;
      }
      const splats = this.strokeNodes.get(id);
      if (splats) {
        splats.forEach((s) => s.destroy());
        this.strokeNodes.delete(id);
      }
    }
  }

  clearAll(): void {
    for (const id of this.model.clear()) {
      this.itemNodes.get(id)?.destroy({ children: true });
      const splats = this.strokeNodes.get(id);
      splats?.forEach((s) => s.destroy());
    }
    this.itemNodes.clear();
    this.strokeNodes.clear();
  }

  /** The Pass: deepen the vignette and run a light sweep across the plate. */
  pass(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.app || !this.sweep || !this.vignette) {
        resolve();
        return;
      }
      const w = this.app.screen.width;
      const h = this.app.screen.height;
      const sweep = this.sweep;
      const vignette = this.vignette;
      const startAlpha = vignette.alpha;

      this.addTween(500, (p) => {
        vignette.alpha = startAlpha + (1 - startAlpha) * p;
      });
      sweep.alpha = 0;
      this.addTween(
        1000,
        (p) => {
          sweep.position.set(w * (-0.25 + 1.5 * p), h * 0.5);
          sweep.alpha = 0.5 * Math.sin(p * Math.PI);
        },
        () => resolve()
      );
    });
  }

  resume(): void {
    if (!this.vignette) return;
    const vignette = this.vignette;
    const start = vignette.alpha;
    this.addTween(400, (p) => {
      vignette.alpha = start + (0.72 - start) * p;
    });
  }
}
