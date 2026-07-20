/**
 * Procedural raster food painter.
 *
 * Replaces the vector SVG food art with per-pixel painted textures: each item
 * is built from a height field (for real lighting: lambert + specular + AO),
 * multi-octave value noise (sear mottling, crust grain, flesh fibers), and a
 * noise-perturbed silhouette — the things that make food read as food instead
 * of clip-art. Everything renders once into offscreen canvases and feeds the
 * same one-texture pipeline; AI-generated photo sprites can replace these
 * canvases later without touching the renderer.
 */

import { Texture } from 'pixi.js';
import type { LabItemKind } from './model';

/** Display width of each item relative to the plate radius. */
export const FOOD_PLATE_SCALE: Record<LabItemKind, number> = {
  sole: 1.15,
  quenelle: 0.38,
  lemon: 0.34,
  parsley: 0.13,
};

// ---------------------------------------------------------------------------
// Noise + math utilities
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Noise2D = (x: number, y: number) => number;

/** Seeded lattice value noise in [0,1] with smootherstep interpolation. */
function makeNoise(seed: number): Noise2D {
  const rand = mulberry32(seed);
  const size = 256;
  const grid = new Float32Array(size * size);
  for (let i = 0; i < grid.length; i++) grid[i] = rand();
  const at = (ix: number, iy: number) => grid[((iy & 255) << 8) | (ix & 255)];
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  return (x, y) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const u = fade(fx);
    const v = fade(fy);
    const a = at(ix, iy);
    const b = at(ix + 1, iy);
    const c = at(ix, iy + 1);
    const d = at(ix + 1, iy + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

function fbm(noise: Noise2D, x: number, y: number, octaves: number): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += noise(x * freq, y * freq) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return sum / norm;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (e0: number, e1: number, v: number) => {
  const t = clamp01((v - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type RGB = [number, number, number];
const mix = (a: RGB, b: RGB, t: number): RGB => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

/** Shared lighting: light from upper-left, camera overhead. */
const LX = -0.5;
const LY = -0.62;
const LZ = 0.6;

interface ShadeOpts {
  /** Height-field amplitude for normal computation */
  amp: number;
  /** Specular strength 0..1 */
  spec: number;
  specPower: number;
  /** Warm or cool specular color */
  specColor: RGB;
}

/**
 * Second pass over a painted buffer: derive normals from the height field and
 * apply lambert + blinn specular + edge ambient occlusion.
 */
function shade(
  data: Uint8ClampedArray,
  height: Float32Array,
  gloss: Float32Array | null,
  W: number,
  H: number,
  opts: ShadeOpts
): void {
  const hAt = (x: number, y: number) =>
    height[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))];
  // Blinn half-vector for overhead camera
  const hvLen = Math.hypot(LX, LY, LZ + 1);
  const hx = LX / hvLen;
  const hy = LY / hvLen;
  const hz = (LZ + 1) / hvLen;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (data[i + 3] === 0) continue;
      const dhx = (hAt(x + 1, y) - hAt(x - 1, y)) * opts.amp;
      const dhy = (hAt(x, y + 1) - hAt(x, y - 1)) * opts.amp;
      const inv = 1 / Math.hypot(dhx, dhy, 1);
      const nx = -dhx * inv;
      const ny = -dhy * inv;
      const nz = inv;

      const diff = Math.max(0, nx * LX + ny * LY + nz * LZ);
      const light = 0.62 + 0.55 * diff;

      let s = Math.max(0, nx * hx + ny * hy + nz * hz);
      s = Math.pow(s, opts.specPower) * opts.spec;
      if (gloss) s *= gloss[y * W + x];

      data[i] = Math.min(255, data[i] * light + s * 255 * opts.specColor[0]);
      data[i + 1] = Math.min(255, data[i + 1] * light + s * 255 * opts.specColor[1]);
      data[i + 2] = Math.min(255, data[i + 2] * light + s * 255 * opts.specColor[2]);
    }
  }
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');
  return [canvas, ctx];
}

// ---------------------------------------------------------------------------
// Sole meunière fillet
// ---------------------------------------------------------------------------

function paintSole(): HTMLCanvasElement {
  const W = 560;
  const H = 300;
  const [canvas, ctx] = makeCanvas(W, H);
  const img = ctx.createImageData(W, H);
  const data = img.data;
  const height = new Float32Array(W * H);
  const gloss = new Float32Array(W * H);

  const edgeN = makeNoise(11);
  const blotchN = makeNoise(23);
  const grainN = makeNoise(37);
  const flakeN = makeNoise(51);

  // Fillet spine: slight S-curve, broad head (left) tapering to the tail
  const x0 = 46;
  const x1 = W - 40;
  const SEGS = 28;
  const spine: { x: number; y: number; r: number }[] = [];
  for (let s = 0; s <= SEGS; s++) {
    const t = s / SEGS;
    const x = lerp(x0, x1, t);
    const y = H * 0.5 + Math.sin(t * Math.PI) * -H * 0.05 + t * H * 0.075;
    const head = smoothstep(0, 0.14, t);
    const taper = 1 - 0.66 * smoothstep(0.3, 1, t);
    const r = H * 0.335 * Math.pow(head, 0.5) * taper;
    spine.push({ x, y, r: Math.max(r, H * 0.055) });
  }

  const crustPale: RGB = [0.93, 0.8, 0.55];
  const crustGold: RGB = [0.8, 0.56, 0.25];
  const crustDeep: RGB = [0.58, 0.36, 0.13];
  const searDark: RGB = [0.38, 0.22, 0.07];
  const flakeCream: RGB = [0.95, 0.88, 0.72];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // Signed distance to the varying-radius capsule chain
      let d = Infinity;
      let rLocal = 1;
      let tAlong = 0;
      for (let s = 0; s < SEGS; s++) {
        const a = spine[s];
        const b = spine[s + 1];
        const abx = b.x - a.x;
        const aby = b.y - a.y;
        const len2 = abx * abx + aby * aby;
        const tt = clamp01(((x - a.x) * abx + (y - a.y) * aby) / len2);
        const px = a.x + abx * tt;
        const py = a.y + aby * tt;
        const r = lerp(a.r, b.r, tt);
        const dist = Math.hypot(x - px, y - py) - r;
        if (dist < d) {
          d = dist;
          rLocal = r;
          tAlong = (s + tt) / SEGS;
        }
      }
      // Organic edge
      d += (fbm(edgeN, x * 0.02, y * 0.02, 3) - 0.5) * 11;

      const i = (y * W + x) * 4;
      const alpha = clamp01(-d / 1.6);
      if (alpha <= 0) continue;

      const inset = clamp01(-d / rLocal); // 0 at edge → 1 at spine
      const h = Math.pow(smoothstep(0, 1, Math.min(1, inset * 1.45)), 0.62);
      height[y * W + x] = h;

      // Crust color: golden base, blotchy sear, fine grain
      const blotch = fbm(blotchN, x * 0.011, y * 0.017, 4);
      const grain = fbm(grainN, x * 0.11, y * 0.11, 3);
      let col = mix(crustDeep, crustGold, clamp01(0.25 + h * 0.55 + (grain - 0.5) * 0.5));
      col = mix(col, crustPale, clamp01((blotch - 0.5) * 2.4) * 0.8);
      col = mix(col, searDark, clamp01((0.4 - blotch) * 2.6) * 0.75);
      // Fine crust speckle
      const speck = grainN(x * 0.55, y * 0.55);
      if (speck > 0.88) col = mix(col, crustPale, (speck - 0.88) * 4);
      if (speck < 0.1) col = mix(col, searDark, (0.1 - speck) * 3.5);

      // Pale flaky underside: a narrow band hugging the lower edge
      const below = y - (spine[Math.round(tAlong * SEGS)]?.y ?? H / 2);
      if (below > 0 && inset < 0.17) {
        const fEdge = (1 - inset / 0.17) * smoothstep(0, 14, below);
        const striation = 0.5 + 0.5 * Math.sin(x * 0.3 + flakeN(x * 0.06, y * 0.06) * 8);
        col = mix(col, mix(flakeCream, [0.85, 0.74, 0.53], striation * 0.4), fEdge * 0.55);
      }

      // Transverse flake seams — faint darker curved lines (keyed to x, not
      // the spine parameter, which is discontinuous between capsule segments)
      const seam = Math.sin(x * 0.055 + flakeN(x * 0.02, y * 0.02) * 7);
      if (seam > 0.93 && inset > 0.15) {
        col = mix(col, searDark, (seam - 0.93) * 5 * 0.3);
      }

      // Butter gloss varies with the blotch pattern (wet render vs dry crust)
      gloss[y * W + x] = 0.35 + 0.65 * smoothstep(0.45, 0.75, blotch);

      data[i] = col[0] * 255;
      data[i + 1] = col[1] * 255;
      data[i + 2] = col[2] * 255;
      data[i + 3] = alpha * 255;
    }
  }

  shade(data, height, gloss, W, H, {
    amp: 26,
    spec: 0.5,
    specPower: 22,
    specColor: [1, 0.93, 0.72],
  });
  ctx.putImageData(img, 0, 0);
  return canvas;
}

// ---------------------------------------------------------------------------
// Butter quenelle
// ---------------------------------------------------------------------------

function paintQuenelle(): HTMLCanvasElement {
  const W = 220;
  const H = 150;
  const [canvas, ctx] = makeCanvas(W, H);
  const img = ctx.createImageData(W, H);
  const data = img.data;
  const height = new Float32Array(W * H);
  const gloss = new Float32Array(W * H);

  const surfN = makeNoise(71);
  const edgeN = makeNoise(83);

  const cx = W / 2;
  const cy = H / 2;
  const ang = -0.2;
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const a = 88;
  const b = 46;

  const butterLight: RGB = [0.99, 0.95, 0.7];
  const butterMid: RGB = [0.96, 0.88, 0.54];
  const butterShadow: RGB = [0.85, 0.72, 0.4];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const u = dx * ca - dy * sa;
      const v = dx * sa + dy * ca;
      // Superellipse: pointed quenelle ends
      const q = Math.pow(Math.abs(u) / a, 2.5) + Math.pow(Math.abs(v) / b, 2.2);
      const edge = (fbm(edgeN, x * 0.05, y * 0.05, 2) - 0.5) * 0.1;
      const inside = 1 - q + edge;

      const i = (y * W + x) * 4;
      const alpha = clamp01(inside * 14);
      if (alpha <= 0) continue;

      let h = Math.pow(clamp01(inside), 0.55);
      // Spoon ridge: a crease slightly above the long axis
      const ridgeDist = Math.abs(v + 6 - u * 0.1);
      h += 0.3 * Math.exp(-(ridgeDist * ridgeDist) / 90) * (1 - Math.abs(u) / (a * 1.05));
      height[y * W + x] = h;

      // Soft dairy surface with faint drag striations along the scoop
      const striate = 0.5 + 0.5 * Math.sin(v * 0.3 + fbm(surfN, u * 0.04, v * 0.05, 3) * 5);
      let col = mix(butterShadow, butterMid, clamp01(h * 1.15));
      col = mix(col, butterLight, clamp01((h - 0.55) * 1.6) * (0.6 + striate * 0.4));
      const fleck = surfN(x * 0.4, y * 0.4);
      if (fleck > 0.9) col = mix(col, butterLight, (fleck - 0.9) * 5);

      gloss[y * W + x] = 0.55 + 0.45 * striate;

      data[i] = col[0] * 255;
      data[i + 1] = col[1] * 255;
      data[i + 2] = col[2] * 255;
      data[i + 3] = alpha * 255;
    }
  }

  shade(data, height, gloss, W, H, {
    amp: 30,
    spec: 1,
    specPower: 50,
    specColor: [1, 1, 0.92],
  });
  ctx.putImageData(img, 0, 0);
  return canvas;
}

// ---------------------------------------------------------------------------
// Caramelized lemon half
// ---------------------------------------------------------------------------

function paintLemon(): HTMLCanvasElement {
  const S = 190;
  const [canvas, ctx] = makeCanvas(S, S);
  const img = ctx.createImageData(S, S);
  const data = img.data;
  const height = new Float32Array(S * S);
  const gloss = new Float32Array(S * S);

  const fiberN = makeNoise(101);
  const charN = makeNoise(113);
  const poreN = makeNoise(127);

  const c = S / 2;
  const R = S * 0.465;
  const SEGMENTS = 9;

  const rind: RGB = [0.94, 0.78, 0.16];
  const rindDark: RGB = [0.78, 0.6, 0.1];
  const pith: RGB = [0.98, 0.95, 0.78];
  const fleshLight: RGB = [0.99, 0.91, 0.42];
  const fleshDeep: RGB = [0.93, 0.77, 0.26];
  const charBrown: RGB = [0.33, 0.18, 0.04];

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = x - c;
      const dy = y - c;
      const r = Math.hypot(dx, dy);
      const theta = Math.atan2(dy, dx);
      const edge = (fbm(poreN, x * 0.06, y * 0.06, 2) - 0.5) * 2.5;
      const rr = r + edge;

      const i = (y * S + x) * 4;
      const alpha = clamp01((R - rr) / 1.4);
      if (alpha <= 0) continue;

      const rn = rr / R; // 0 center → 1 edge
      // Gentle dome so the light catches the face
      height[y * S + x] = Math.pow(clamp01(1 - Math.pow(rn, 3.2)), 0.5) * 0.55;

      let col: RGB;
      let g = 0.25;

      if (rn > 0.94) {
        // Rind: bright peel with pores
        const pore = fbm(poreN, x * 0.3, y * 0.3, 3);
        col = mix(rind, rindDark, clamp01((pore - 0.45) * 1.8));
        g = 0.5;
      } else if (rn > 0.86) {
        // Pith ring
        col = mix(pith, [0.88, 0.82, 0.6], fbm(poreN, x * 0.15, y * 0.15, 2) * 0.5);
        g = 0.15;
      } else if (rn < 0.07) {
        // Core
        col = mix(pith, fleshDeep, rn / 0.07 * 0.4);
        g = 0.2;
      } else {
        // Flesh: radial juice-vesicle fibers within segments
        const segPos = ((theta / (Math.PI * 2)) * SEGMENTS + SEGMENTS) % 1;
        const septum = Math.min(segPos, 1 - segPos); // 0 at segment boundary
        const fiber = fbm(fiberN, theta * 14, rr * 0.16, 3);
        const vesicle = 0.5 + 0.5 * Math.sin(theta * 90 + fiber * 10 + rr * 0.35);
        col = mix(fleshDeep, fleshLight, clamp01(0.25 + vesicle * 0.55 + (fiber - 0.5) * 0.6));
        // Pale septum walls between segments
        col = mix(pith, col, smoothstep(0, 0.06, septum));
        // Radial darkening toward the pith
        col = mix(col, fleshDeep, smoothstep(0.62, 0.86, rn) * 0.4);
        g = 0.5 + vesicle * 0.5; // juicy glisten
      }

      // Caramelization: charred crescent from the pan, heavier top-left
      const charBias = clamp01(0.42 - (dx * 0.5 + dy * 0.62) / R / 1.6);
      const charMask = clamp01((fbm(charN, x * 0.045, y * 0.045, 4) - 0.6 + charBias * 0.3) * 2.6);
      if (rn < 0.94 && charMask > 0) {
        col = mix(col, charBrown, Math.min(0.75, charMask));
        g = Math.max(g, charMask * 0.7); // char is glossy
      }

      gloss[y * S + x] = g;
      data[i] = col[0] * 255;
      data[i + 1] = col[1] * 255;
      data[i + 2] = col[2] * 255;
      data[i + 3] = alpha * 255;
    }
  }

  shade(data, height, gloss, S, S, {
    amp: 18,
    spec: 0.5,
    specPower: 16,
    specColor: [1, 0.97, 0.8],
  });
  ctx.putImageData(img, 0, 0);
  return canvas;
}

// ---------------------------------------------------------------------------
// Flat-leaf parsley sprig
// ---------------------------------------------------------------------------

function paintParsley(): HTMLCanvasElement {
  const S = 96;
  const [canvas, ctx] = makeCanvas(S, S);
  const img = ctx.createImageData(S, S);
  const data = img.data;
  const height = new Float32Array(S * S);

  const leafN = makeNoise(139);

  const deepGreen: RGB = [0.13, 0.31, 0.09];
  const midGreen: RGB = [0.22, 0.45, 0.14];
  const lightGreen: RGB = [0.38, 0.62, 0.24];
  const vein: RGB = [0.55, 0.76, 0.4];

  // Three serrated lobes: center up, two lower side lobes
  const lobes = [
    { cx: 48, cy: 30, rx: 17, ry: 24, rot: 0 },
    { cx: 26, cy: 52, rx: 19, ry: 13, rot: -0.55 },
    { cx: 70, cy: 52, rx: 19, ry: 13, rot: 0.55 },
  ];

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      let best = -Infinity;
      for (const L of lobes) {
        const dx = x - L.cx;
        const dy = y - L.cy;
        const u = dx * Math.cos(L.rot) + dy * Math.sin(L.rot);
        const v = -dx * Math.sin(L.rot) + dy * Math.cos(L.rot);
        const theta = Math.atan2(v, u);
        // Serrated edge: lobed radius wobble
        const serr = 1 + 0.1 * Math.sin(theta * 7 + L.cx) + 0.07 * (leafN(theta * 2 + L.cx, 0.5) - 0.5) * 2;
        const q = 1 - (Math.pow(u / (L.rx * serr), 2) + Math.pow(v / (L.ry * serr), 2));
        if (q > best) best = q;
      }

      // Stem: narrow strip from base toward the lobes
      const stemD = Math.abs(x - 48 - Math.sin(y * 0.1) * 2);
      const isStem = y > 48 && y < 86 && stemD < 2.2;

      const i = (y * S + x) * 4;
      if (best <= 0 && !isStem) continue;

      const alpha = isStem ? 1 : clamp01(best * 22);
      const h = isStem ? 0.3 : Math.pow(clamp01(best), 0.5);
      height[y * S + x] = h;

      let col: RGB;
      if (isStem) {
        col = mix(midGreen, lightGreen, 0.4);
      } else {
        const tex = fbm(leafN, x * 0.15, y * 0.15, 3);
        col = mix(deepGreen, midGreen, clamp01(0.3 + h * 0.6 + (tex - 0.5) * 0.7));
        col = mix(col, lightGreen, clamp01((tex - 0.6) * 1.8) * 0.6);
        // Veins: radial lighter lines from each lobe center
        for (const L of lobes) {
          const dx = x - L.cx;
          const dy = y - L.cy;
          const theta = Math.atan2(dy, dx);
          const veinLine = Math.abs(Math.sin(theta * 3.5 + L.cx * 2));
          const rr = Math.hypot(dx, dy) / Math.max(L.rx, L.ry);
          if (veinLine > 0.965 && rr < 1) {
            col = mix(col, vein, (veinLine - 0.965) * 18 * (1 - rr) * 0.8);
          }
        }
      }

      data[i] = col[0] * 255;
      data[i + 1] = col[1] * 255;
      data[i + 2] = col[2] * 255;
      data[i + 3] = alpha * 255;
    }
  }

  shade(data, height, null, S, S, {
    amp: 8,
    spec: 0.3,
    specPower: 10,
    specColor: [0.85, 1, 0.8],
  });
  ctx.putImageData(img, 0, 0);
  return canvas;
}

// ---------------------------------------------------------------------------
// Public API — memoized so painting happens once
// ---------------------------------------------------------------------------

export interface FoodAssets {
  textures: Record<LabItemKind, Texture>;
  thumbs: Record<LabItemKind, string>;
}

let cached: FoodAssets | null = null;

export function getFoodAssets(): FoodAssets {
  if (cached) return cached;
  const canvases: Record<LabItemKind, HTMLCanvasElement> = {
    sole: paintSole(),
    quenelle: paintQuenelle(),
    lemon: paintLemon(),
    parsley: paintParsley(),
  };
  cached = {
    textures: {
      sole: Texture.from(canvases.sole),
      quenelle: Texture.from(canvases.quenelle),
      lemon: Texture.from(canvases.lemon),
      parsley: Texture.from(canvases.parsley),
    },
    thumbs: {
      sole: canvases.sole.toDataURL(),
      quenelle: canvases.quenelle.toDataURL(),
      lemon: canvases.lemon.toDataURL(),
      parsley: canvases.parsley.toDataURL(),
    },
  };
  return cached;
}
