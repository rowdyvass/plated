/**
 * Lab texture factory.
 *
 * All visuals in the feel lab come from two sources, both generated at runtime:
 *  - Canvas-2D procedural textures (table, plate, light, shadows, sauce splats)
 *  - High-res SVG food art rasterized to textures (sole, quenelle, lemon, parsley)
 *
 * One pipeline: everything on screen is a Pixi texture drawn from the model.
 */

import { Texture } from 'pixi.js';
import type { LabItemKind } from './model';

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

// ---------------------------------------------------------------------------
// Food art — authored SVG, rasterized at high resolution
// ---------------------------------------------------------------------------

/**
 * Pan-seared sole fillet, overhead. Golden meunière crust with flour-sear
 * mottling (feTurbulence), pale flaky edge, butter sheen along the spine.
 */
const SOLE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 150">
  <defs>
    <linearGradient id="crust" x1="0.05" y1="0.1" x2="0.85" y2="1">
      <stop offset="0" stop-color="#dfa452"/>
      <stop offset="0.35" stop-color="#c88b3a"/>
      <stop offset="0.7" stop-color="#a96d26"/>
      <stop offset="1" stop-color="#8a541c"/>
    </linearGradient>
    <radialGradient id="crustLight" cx="0.32" cy="0.28" r="0.85">
      <stop offset="0" stop-color="#f3cf8a" stop-opacity="0.85"/>
      <stop offset="0.5" stop-color="#f3cf8a" stop-opacity="0.2"/>
      <stop offset="1" stop-color="#f3cf8a" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="edgeFlake" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f6ecd0"/>
      <stop offset="1" stop-color="#e9d3a2"/>
    </linearGradient>
    <filter id="mottle" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.045 0.075" numOctaves="4" seed="9" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.36  0 0 0 0 0.19  0 0 0 0 0.05  0 0 0 0.9 -0.12" result="tint"/>
      <feComposite in="tint" in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.2"/>
    </filter>
    <filter id="soft2" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="4"/>
    </filter>
  </defs>

  <!-- Tapered fillet: broad shoulder at left, tail narrowing to the right,
       with a gentle S-curve. Pale flaky edge peeks out below. -->
  <path d="M 18 74 Q 12 58 26 44 Q 48 22 96 20 Q 160 18 226 34 Q 278 46 302 66 Q 312 76 302 86 Q 272 108 218 116 Q 150 126 92 118 Q 40 110 20 88 Q 14 82 18 74 Z"
        fill="url(#edgeFlake)"/>

  <path d="M 24 72 Q 18 58 30 46 Q 52 26 98 24 Q 158 22 222 38 Q 272 50 294 66 Q 302 74 294 82 Q 266 102 214 110 Q 150 120 96 112 Q 46 104 26 84 Q 20 78 24 72 Z"
        fill="url(#crust)"/>

  <!-- sear mottling: large organic blotches -->
  <path d="M 24 72 Q 18 58 30 46 Q 52 26 98 24 Q 158 22 222 38 Q 272 50 294 66 Q 302 74 294 82 Q 266 102 214 110 Q 150 120 96 112 Q 46 104 26 84 Q 20 78 24 72 Z"
        fill="#6b3f10" filter="url(#mottle)" opacity="0.85"/>

  <!-- deeper caramelized patches where the pan hit hardest -->
  <g filter="url(#soft2)" opacity="0.55">
    <ellipse cx="88" cy="52" rx="30" ry="13" fill="#7c4a12" transform="rotate(-10 88 52)"/>
    <ellipse cx="180" cy="88" rx="34" ry="12" fill="#6e400d" transform="rotate(5 180 88)"/>
    <ellipse cx="248" cy="66" rx="22" ry="9" fill="#7c4a12" transform="rotate(-14 248 66)"/>
    <ellipse cx="140" cy="44" rx="18" ry="8" fill="#8a5519" transform="rotate(6 140 44)"/>
  </g>

  <!-- flour-crust pale flecks -->
  <g fill="#f0d6a0" opacity="0.5">
    <circle cx="70" cy="66" r="2"/><circle cx="112" cy="50" r="1.6"/>
    <circle cx="150" cy="72" r="2.2"/><circle cx="196" cy="58" r="1.5"/>
    <circle cx="232" cy="80" r="1.8"/><circle cx="120" cy="92" r="1.7"/>
    <circle cx="86" cy="86" r="1.4"/><circle cx="210" cy="96" r="1.5"/>
    <circle cx="262" cy="70" r="1.4"/><circle cx="176" cy="40" r="1.6"/>
  </g>

  <!-- light from top-left -->
  <path d="M 24 72 Q 18 58 30 46 Q 52 26 98 24 Q 158 22 222 38 Q 272 50 294 66 Q 302 74 294 82 Q 266 102 214 110 Q 150 120 96 112 Q 46 104 26 84 Q 20 78 24 72 Z"
        fill="url(#crustLight)"/>

  <!-- faint diagonal flake seams following the fillet -->
  <g stroke="#7a4c16" stroke-width="1" opacity="0.22" fill="none" stroke-linecap="round">
    <path d="M 66 38 Q 76 66 62 98"/>
    <path d="M 110 30 Q 122 66 106 110"/>
    <path d="M 156 28 Q 168 68 152 116"/>
    <path d="M 202 36 Q 214 70 198 108"/>
    <path d="M 246 48 Q 256 72 244 98"/>
  </g>

  <!-- butter sheen along the spine -->
  <path d="M 48 58 Q 150 34 276 62" stroke="#ffe4a6" stroke-width="8" fill="none"
        stroke-linecap="round" opacity="0.35" filter="url(#soft)"/>
  <path d="M 56 54 Q 150 38 264 58" stroke="#fff2d0" stroke-width="2.2" fill="none"
        stroke-linecap="round" opacity="0.55"/>
</svg>`;

/** Butter quenelle, overhead: three-sided form with a bright ridge. */
const QUENELLE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 78">
  <defs>
    <linearGradient id="qbody" x1="0.1" y1="0.1" x2="0.8" y2="1">
      <stop offset="0" stop-color="#f9eec4"/>
      <stop offset="0.5" stop-color="#f0dfa4"/>
      <stop offset="1" stop-color="#d9bf78"/>
    </linearGradient>
    <linearGradient id="qshade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c9ab60" stop-opacity="0"/>
      <stop offset="1" stop-color="#b8973f" stop-opacity="0.8"/>
    </linearGradient>
    <filter id="qsoft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="1.6"/>
    </filter>
  </defs>
  <!-- body -->
  <path d="M 12 46 Q 8 30 26 20 Q 58 4 92 16 Q 112 24 108 42 Q 102 62 66 68 Q 28 72 12 46 Z"
        fill="url(#qbody)"/>
  <!-- lower shade face -->
  <path d="M 14 50 Q 40 68 66 66 Q 100 60 107 44 Q 104 60 66 68 Q 28 72 12 46 Z"
        fill="url(#qshade)" filter="url(#qsoft)"/>
  <!-- spoon ridge -->
  <path d="M 20 40 Q 56 18 100 30" stroke="#fdf7dc" stroke-width="5" fill="none"
        stroke-linecap="round" opacity="0.85" filter="url(#qsoft)"/>
  <path d="M 24 42 Q 56 22 96 32" stroke="#fffcee" stroke-width="1.8" fill="none"
        stroke-linecap="round" opacity="0.9"/>
  <!-- specular -->
  <ellipse cx="42" cy="30" rx="9" ry="4.5" fill="#ffffff" opacity="0.55" transform="rotate(-18 42 30)"/>
</svg>`;

/** Caramelized lemon half, overhead: flesh segments, pith ring, charred spots. */
const LEMON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="lflesh" cx="0.42" cy="0.4" r="0.75">
      <stop offset="0" stop-color="#fbedb0"/>
      <stop offset="0.65" stop-color="#f4d878"/>
      <stop offset="1" stop-color="#e3b94e"/>
    </radialGradient>
    <filter id="lchar" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.16" numOctaves="2" seed="11" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.16  0 0 0 0 0.04  0 0 0 0.5 0" result="t"/>
      <feComposite in="t" in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="lsoft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="1.4"/>
    </filter>
  </defs>
  <!-- rind -->
  <circle cx="60" cy="60" r="56" fill="#e8c34e"/>
  <circle cx="60" cy="60" r="56" fill="none" stroke="#c99e30" stroke-width="2.5"/>
  <!-- pith -->
  <circle cx="60" cy="60" r="49" fill="#f9f3d8"/>
  <!-- flesh -->
  <circle cx="60" cy="60" r="44" fill="url(#lflesh)"/>
  <!-- segments -->
  <g stroke="#f9f0c8" stroke-width="3" opacity="0.9">
    ${Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2 - Math.PI / 2;
      const x1 = 60 + Math.cos(a) * 7;
      const y1 = 60 + Math.sin(a) * 7;
      const x2 = 60 + Math.cos(a) * 42;
      const y2 = 60 + Math.sin(a) * 42;
      return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    }).join('')}
  </g>
  <circle cx="60" cy="60" r="6.5" fill="#f6ecc0"/>
  <!-- caramelization on the cut face -->
  <circle cx="60" cy="60" r="44" fill="#5c3a10" filter="url(#lchar)" opacity="0.85"/>
  <!-- charred edge kisses -->
  <g filter="url(#lsoft)" opacity="0.75">
    <path d="M 28 30 A 44 44 0 0 1 52 17" stroke="#6b430f" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M 92 88 A 44 44 0 0 1 72 100" stroke="#5c390c" stroke-width="6" fill="none" stroke-linecap="round"/>
  </g>
  <!-- glisten -->
  <ellipse cx="44" cy="40" rx="12" ry="6" fill="#fffbe8" opacity="0.4" transform="rotate(-24 44 40)"/>
</svg>`;

/** Flat-leaf parsley sprig: three lobed leaflets on a short stem. */
const PARSLEY_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="pleaf" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="#4f9438"/>
      <stop offset="0.55" stop-color="#357326"/>
      <stop offset="1" stop-color="#245417"/>
    </linearGradient>
    <linearGradient id="pleaf2" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="#5aa242"/>
      <stop offset="1" stop-color="#2c6420"/>
    </linearGradient>
  </defs>
  <path d="M 32 60 Q 30 46 32 36" stroke="#3f7a2c" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <!-- center leaflet -->
  <path d="M 32 38 Q 22 32 24 20 Q 26 12 32 6 Q 38 12 40 20 Q 42 32 32 38 Z" fill="url(#pleaf)"/>
  <path d="M 32 36 Q 27 28 29 18" stroke="#8cc474" stroke-width="1.1" fill="none" opacity="0.8"/>
  <!-- left leaflet -->
  <path d="M 30 40 Q 18 42 10 36 Q 4 30 6 22 Q 16 22 24 28 Q 30 33 30 40 Z" fill="url(#pleaf2)"/>
  <path d="M 28 38 Q 18 34 11 28" stroke="#8cc474" stroke-width="1" fill="none" opacity="0.7"/>
  <!-- right leaflet -->
  <path d="M 34 40 Q 46 42 54 36 Q 60 30 58 22 Q 48 22 40 28 Q 34 33 34 40 Z" fill="url(#pleaf)"/>
  <path d="M 36 38 Q 46 34 53 28" stroke="#8cc474" stroke-width="1" fill="none" opacity="0.7"/>
</svg>`;

const FOOD_SVGS: Record<LabItemKind, { svg: string; width: number }> = {
  sole: { svg: SOLE_SVG, width: 320 },
  quenelle: { svg: QUENELLE_SVG, width: 120 },
  lemon: { svg: LEMON_SVG, width: 120 },
  parsley: { svg: PARSLEY_SVG, width: 64 },
};

/** Display width of each item relative to the plate radius. */
export const FOOD_PLATE_SCALE: Record<LabItemKind, number> = {
  sole: 1.15,
  quenelle: 0.38,
  lemon: 0.34,
  parsley: 0.13,
};

function svgToDataUrl(svg: string): string {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.trim());
}

/** Data URLs for React tray thumbnails — same art as the canvas sprites. */
export const FOOD_THUMBNAILS: Record<LabItemKind, string> = {
  sole: svgToDataUrl(SOLE_SVG),
  quenelle: svgToDataUrl(QUENELLE_SVG),
  lemon: svgToDataUrl(LEMON_SVG),
  parsley: svgToDataUrl(PARSLEY_SVG),
};

function rasterizeSvg(svg: string, targetWidth: number): Promise<Texture> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const aspect = img.height / img.width || 1;
      const w = Math.round(targetWidth);
      const h = Math.round(targetWidth * aspect);
      const [canvas, ctx] = makeCanvas(w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(Texture.from(canvas));
    };
    img.onerror = () => reject(new Error('svg rasterize failed'));
    img.src = svgToDataUrl(svg);
  });
}

/** Rasterize all food art at 2x its largest on-screen size for crispness. */
export async function loadFoodTextures(plateRadius: number): Promise<Record<LabItemKind, Texture>> {
  const kinds = Object.keys(FOOD_SVGS) as LabItemKind[];
  const textures = await Promise.all(
    kinds.map((kind) =>
      rasterizeSvg(FOOD_SVGS[kind].svg, plateRadius * FOOD_PLATE_SCALE[kind] * 2)
    )
  );
  return Object.fromEntries(kinds.map((kind, i) => [kind, textures[i]])) as Record<
    LabItemKind,
    Texture
  >;
}
