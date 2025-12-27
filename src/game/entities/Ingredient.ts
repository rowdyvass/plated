import { Container, Sprite, Texture } from 'pixi.js';
import type { Ingredient as IngredientData } from '@/types';

interface IngredientOptions {
  data: IngredientData;
  texture?: Texture;
}

export class IngredientEntity extends Container {
  public data: IngredientData;
  private sprite: Sprite | null = null;

  constructor(options: IngredientOptions) {
    super();
    this.data = options.data;

    if (options.texture) {
      this.sprite = new Sprite(options.texture);
      this.sprite.anchor.set(0.5);
      this.sprite.scale.set(options.data.scale ?? 1);
      this.addChild(this.sprite);
    }

    this.eventMode = 'static';
    this.cursor = 'grab';
  }

  setScale(scale: number): void {
    if (this.sprite) {
      this.sprite.scale.set(scale);
    }
  }

  setRotation(rotation: number): void {
    this.rotation = rotation;
  }
}
