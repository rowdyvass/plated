/**
 * IngredientTextureManager - Manages PixiJS textures generated from React SVG ingredient components
 *
 * This creates textures on demand by:
 * 1. Rendering the React SVG component to an offscreen DOM element
 * 2. Converting the SVG to a canvas via image loading
 * 3. Creating a PixiJS texture from the canvas
 *
 * Textures are cached for reuse across the game.
 */

import { Texture } from 'pixi.js';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getIngredient } from '@/components/ingredients/registry';
import type { IngredientSize } from '@/components/ingredients/base/types';

// Size mapping for texture generation
const SIZE_PIXELS: Record<IngredientSize, number> = {
  preview: 32,
  plate: 48,
  detail: 96,
};

// Cache for generated textures
const textureCache = new Map<string, Texture>();

// Pending texture promises to avoid duplicate generation
const pendingTextures = new Map<string, Promise<Texture>>();

/**
 * Get the cache key for an ingredient texture
 */
function getCacheKey(ingredientId: string, size: IngredientSize): string {
  return `${ingredientId}:${size}`;
}

/**
 * Render a React SVG component to a canvas
 */
async function renderToCanvas(
  ingredientId: string,
  size: IngredientSize
): Promise<HTMLCanvasElement | null> {
  const Component = getIngredient(ingredientId);
  if (!Component) {
    console.warn(`[IngredientTextureManager] No component found for ingredient: ${ingredientId}`);
    return null;
  }

  // Render the React component to static HTML
  const element = createElement(Component, { size });
  const svgMarkup = renderToStaticMarkup(element);

  // Extract just the SVG from the wrapper
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgMarkup, 'text/html');
  const svgElement = doc.querySelector('svg');

  if (!svgElement) {
    console.warn(`[IngredientTextureManager] No SVG found in component for: ${ingredientId}`);
    return null;
  }

  // Get the container div to extract sizing
  const containerDiv = doc.body.firstElementChild as HTMLElement;

  // Parse the style for width/height if available
  const containerStyle = containerDiv?.getAttribute('style') || '';
  const widthMatch = containerStyle.match(/width:\s*(\d+(?:\.\d+)?)px/);
  const heightMatch = containerStyle.match(/height:\s*(\d+(?:\.\d+)?)px/);

  // Use extracted dimensions or fall back to size mapping
  const pixelSize = SIZE_PIXELS[size];
  const width = widthMatch ? parseFloat(widthMatch[1]) : pixelSize;
  const height = heightMatch ? parseFloat(heightMatch[1]) : pixelSize;

  // Set explicit dimensions on the SVG
  svgElement.setAttribute('width', String(width));
  svgElement.setAttribute('height', String(height));

  // Serialize the SVG
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);

  // Create data URL
  const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

  // Load as image and draw to canvas
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Create canvas with proper scaling for device pixel ratio
      const scale = window.devicePixelRatio || 1;
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, width, height);
      }

      resolve(canvas);
    };
    img.onerror = () => {
      console.warn(`[IngredientTextureManager] Failed to load SVG for: ${ingredientId}`);
      resolve(null);
    };
    img.src = svgDataUrl;
  });
}

/**
 * Get or create a texture for an ingredient
 */
export async function getIngredientTexture(
  ingredientId: string,
  size: IngredientSize = 'plate'
): Promise<Texture | null> {
  const cacheKey = getCacheKey(ingredientId, size);

  // Check cache first
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  // Check if already being generated
  if (pendingTextures.has(cacheKey)) {
    return pendingTextures.get(cacheKey)!;
  }

  // Generate the texture
  const texturePromise = (async (): Promise<Texture> => {
    const canvas = await renderToCanvas(ingredientId, size);

    if (!canvas) {
      // Return a placeholder texture (1x1 transparent)
      const placeholderCanvas = document.createElement('canvas');
      placeholderCanvas.width = 1;
      placeholderCanvas.height = 1;
      return Texture.from(placeholderCanvas);
    }

    // Create PixiJS texture from canvas
    const texture = Texture.from(canvas);
    textureCache.set(cacheKey, texture);
    pendingTextures.delete(cacheKey);

    return texture;
  })();

  pendingTextures.set(cacheKey, texturePromise);
  return texturePromise;
}

/**
 * Preload textures for a list of ingredient IDs
 * Call this during game initialization for smooth gameplay
 */
export async function preloadIngredientTextures(
  ingredientIds: string[],
  sizes: IngredientSize[] = ['plate']
): Promise<void> {
  const loadPromises: Promise<Texture | null>[] = [];

  for (const ingredientId of ingredientIds) {
    for (const size of sizes) {
      loadPromises.push(getIngredientTexture(ingredientId, size));
    }
  }

  await Promise.all(loadPromises);
}

/**
 * Check if a texture is already cached
 */
export function hasTexture(ingredientId: string, size: IngredientSize = 'plate'): boolean {
  return textureCache.has(getCacheKey(ingredientId, size));
}

/**
 * Get a cached texture synchronously (returns null if not cached)
 */
export function getCachedTexture(
  ingredientId: string,
  size: IngredientSize = 'plate'
): Texture | null {
  return textureCache.get(getCacheKey(ingredientId, size)) || null;
}

/**
 * Clear all cached textures
 * Call this when changing levels or during cleanup
 */
export function clearTextureCache(): void {
  for (const texture of textureCache.values()) {
    texture.destroy(true);
  }
  textureCache.clear();
  pendingTextures.clear();
}

/**
 * Get stats about the texture cache
 */
export function getTextureCacheStats(): { count: number; pending: number } {
  return {
    count: textureCache.size,
    pending: pendingTextures.size,
  };
}
