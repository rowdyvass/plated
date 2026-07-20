/**
 * Lab texture factory.
 *
 * Canvas-2D procedural environment textures generated at runtime: table,
 * plate, light, shadows, sauce splats. Food art lives in foodPaint.ts.
 *
 * One pipeline: everything on screen is a Pixi texture drawn from the model.
 */

import { Texture } from 'pixi.js';

// ---------------------------------------------------------------------------
// Canvas helpers
// ---------------------------------------------------------------------------

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');
  return [canvas, ctx];
}

/** Deterministic PRNG so the table grain doesn't reshuffle on every mount. */
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

// ---------------------------------------------------------------------------
// Environment textures
// ---------------------------------------------------------------------------

/** Dark walnut tabletop, tileable, with grain lines and subtle noise. */
export function makeWoodTexture(): Texture {
  const size = 512;
  const [canvas, ctx] = makeCanvas(size, size);
  const rand = mulberry32(41);

  const base = ctx.createLinearGradient(0, 0, 0, size);
  base.addColorStop(0, '#33241a');
  base.addColorStop(0.5, '#3b2a1e');
  base.addColorStop(1, '#33241a');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // Grain: long wavy horizontal strokes in lighter/darker tones
  for (let i = 0; i < 90; i++) {
    const y = rand() * size;
    const light = rand() > 0.5;
    ctx.strokeStyle = light
      ? `rgba(94, 68, 46, ${0.05 + rand() * 0.1})`
      : `rgba(24, 15, 9, ${0.05 + rand() * 0.12})`;
    ctx.lineWidth = 0.6 + rand() * 1.8;
    ctx.beginPath();
    const wobble = 2 + rand() * 5;
    ctx.moveTo(-10, y);
    for (let x = 0; x <= size + 10; x += 32) {
      ctx.lineTo(x, y + Math.sin(x / (30 + rand() * 40) + rand() * 6) * wobble);
    }
    ctx.stroke();
  }

  // Plank seams (kept horizontal so the tile repeats cleanly)
  for (const y of [128, 300, 470]) {
    ctx.strokeStyle = 'rgba(15, 9, 5, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(120, 88, 60, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + 2);
    ctx.lineTo(size, y + 2);
    ctx.stroke();
  }

  // Fine per-pixel noise
  const image = ctx.getImageData(0, 0, size, size);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (rand() - 0.5) * 14;
    data[i] += n;
    data[i + 1] += n;
    data[i + 2] += n;
  }
  ctx.putImageData(image, 0, 0);

  return Texture.from(canvas);
}

/** Soft radial light pool, additive-blended over the table. */
export function makeLightPoolTexture(): Texture {
  const size = 512;
  const [canvas, ctx] = makeCanvas(size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255, 244, 224, 0.85)');
  g.addColorStop(0.45, 'rgba(255, 240, 214, 0.35)');
  g.addColorStop(1, 'rgba(255, 236, 205, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return Texture.from(canvas);
}

/** Darkened edges for the food-photo look. */
export function makeVignetteTexture(): Texture {
  const size = 512;
  const [canvas, ctx] = makeCanvas(size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.28, size / 2, size / 2, size * 0.72);
  g.addColorStop(0, 'rgba(0, 0, 0, 0)');
  g.addColorStop(1, 'rgba(10, 5, 2, 0.55)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return Texture.from(canvas);
}

/** The ceramic plate: rim, recessed well, inset shadow, top-left specular. */
export function makePlateTexture(): Texture {
  const size = 1024;
  const [canvas, ctx] = makeCanvas(size, size);
  const c = size / 2;
  const R = size * 0.48;

  // Rim: bright ceramic, slightly darker toward the outer edge
  const rim = ctx.createRadialGradient(c, c - R * 0.15, R * 0.2, c, c, R);
  rim.addColorStop(0, '#fdfbf6');
  rim.addColorStop(0.8, '#f5f1e9');
  rim.addColorStop(0.96, '#e2dccf');
  rim.addColorStop(1, '#cfc7b6');
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(c, c, R, 0, Math.PI * 2);
  ctx.fill();

  // Well: recessed inner circle with an inset shadow at its lip
  const wellR = R * 0.72;
  const lip = ctx.createRadialGradient(c, c, wellR * 0.75, c, c, wellR * 1.04);
  lip.addColorStop(0, 'rgba(0,0,0,0)');
  lip.addColorStop(0.85, 'rgba(0,0,0,0)');
  lip.addColorStop(0.97, 'rgba(96, 84, 66, 0.16)');
  lip.addColorStop(1, 'rgba(96, 84, 66, 0.02)');

  const well = ctx.createRadialGradient(c, c - wellR * 0.2, wellR * 0.1, c, c, wellR);
  well.addColorStop(0, '#fefdf9');
  well.addColorStop(0.75, '#f9f6ee');
  well.addColorStop(1, '#efe9dc');
  ctx.fillStyle = well;
  ctx.beginPath();
  ctx.arc(c, c, wellR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = lip;
  ctx.beginPath();
  ctx.arc(c, c, wellR * 1.04, 0, Math.PI * 2);
  ctx.fill();

  // Specular arc top-left — ties the plate to the scene's light direction
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 252, 0.75)';
  ctx.lineWidth = R * 0.045;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(c, c, R * 0.86, Math.PI * 1.08, Math.PI * 1.46);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 255, 252, 0.3)';
  ctx.lineWidth = R * 0.09;
  ctx.beginPath();
  ctx.arc(c, c, R * 0.86, Math.PI * 1.02, Math.PI * 1.52);
  ctx.stroke();
  ctx.restore();

  // Barely-there ceramic speckle
  const rand = mulberry32(7);
  ctx.fillStyle = 'rgba(140, 125, 100, 0.05)';
  for (let i = 0; i < 260; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * R * 0.97;
    ctx.beginPath();
    ctx.arc(c + Math.cos(a) * r, c + Math.sin(a) * r, 0.5 + rand() * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  return Texture.from(canvas);
}

/** Soft dark ellipse: drop shadow under the plate itself. */
export function makePlateShadowTexture(): Texture {
  const w = 512;
  const h = 512;
  const [canvas, ctx] = makeCanvas(w, h);
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, 'rgba(8, 4, 2, 0.5)');
  g.addColorStop(0.7, 'rgba(8, 4, 2, 0.25)');
  g.addColorStop(1, 'rgba(8, 4, 2, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  return Texture.from(canvas);
}

/** Contact shadow under placed food. */
export function makeContactShadowTexture(): Texture {
  const w = 256;
  const h = 128;
  const [canvas, ctx] = makeCanvas(w, h);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(1, 0.5);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w / 2);
  g.addColorStop(0, 'rgba(30, 16, 6, 0.55)');
  g.addColorStop(0.6, 'rgba(30, 16, 6, 0.28)');
  g.addColorStop(1, 'rgba(30, 16, 6, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(-w / 2, -w / 2, w, w);
  ctx.restore();
  return Texture.from(canvas);
}

/** Soft white blob — the metaball field element for fluid sauce. */
export function makeSplatTexture(): Texture {
  const size = 128;
  const [canvas, ctx] = makeCanvas(size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.9)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return Texture.from(canvas);
}

/** Diagonal light band for the beauty-shot sweep. */
export function makeSweepTexture(): Texture {
  const w = 512;
  const h = 512;
  const [canvas, ctx] = makeCanvas(w, h);
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, 'rgba(255,250,235,0)');
  g.addColorStop(0.45, 'rgba(255,250,235,0.5)');
  g.addColorStop(0.55, 'rgba(255,252,240,0.6)');
  g.addColorStop(1, 'rgba(255,250,235,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  return Texture.from(canvas);
}
