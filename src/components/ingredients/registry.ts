/**
 * Ingredient Registry - Maps ingredient IDs to their component implementations
 * Used for dynamic rendering in both React UI and PixiJS game
 */

import { ComponentType } from 'react';
import { IngredientBaseProps } from './base/types';

// Proteins
import { ButterPat } from './proteins/ButterPat';
import { EggYolk } from './proteins/EggYolk';
import { SoleFillet } from './proteins/SoleFillet';
import { DuckBreast } from './proteins/DuckBreast';
import { PigeonBreast } from './proteins/PigeonBreast';
import { TartareMound } from './proteins/TartareMound';
import { MozzarellaSlice, Burrata } from './proteins/Mozzarella';
import { TartSlice, PuffPastryPiece, Tuile } from './proteins/Pastry';

// Vegetables
import { Pea, PeaCluster } from './vegetables/Pea';
import { PeaShoot } from './vegetables/PeaShoot';
import { MintLeaf } from './vegetables/MintLeaf';
import { MicroGreen, MicroGreenCluster } from './vegetables/MicroGreen';
import { TomatoSlice, CherryTomato } from './vegetables/Tomato';
import { BabyVegetable } from './vegetables/BabyVegetable';
import { ChivePieces, ChiveSingle } from './vegetables/Chives';
import { LeekVeloute, LeekRing, BabyLeek } from './vegetables/Leek';

// Sauces
import { SauceDot, SauceDotCluster } from './sauces/SauceDot';
import { SwooshTrail, SwooshPair } from './sauces/SwooshTrail';
import { DrizzleLine, OilDroplets } from './sauces/DrizzleLine';

// Garnishes
import { EdibleFlower, MicroFlower, FlowerCluster } from './garnishes/EdibleFlower';
import { HerbLeaf } from './garnishes/HerbLeaf';
import {
  Quenelle,
  ButterQuenelle,
  CremeFraicheQuenelle,
  ChocolateMousseQuenelle,
  SorbetQuenelle,
} from './garnishes/Quenelle';
import { PowderedSugarDust, BlackSaltCrystals, FleurDeSel } from './garnishes/PowderedSugar';
import { Caper, CaperScatter, CaperBerry } from './garnishes/Capers';

/**
 * Registry of all ingredient components
 * Keys should match the ingredient IDs used in dish definitions
 */
export const ingredientRegistry: Record<string, ComponentType<IngredientBaseProps>> = {
  // === PROTEINS ===
  'butter-pat': ButterPat,
  'egg-yolk': EggYolk,
  'sole-fillet': SoleFillet,
  'duck-breast': DuckBreast,
  'duck-slices': DuckBreast,
  'pigeon-breast': PigeonBreast,
  'tartare-mound': TartareMound,
  'mozzarella': MozzarellaSlice,
  'mozzarella-slice': MozzarellaSlice,
  'burrata': Burrata,
  'tart-slice': TartSlice,
  'puff-pastry': PuffPastryPiece,
  'tuile': Tuile,

  // === VEGETABLES ===
  'pea': Pea,
  'peas': PeaCluster,
  'pea-cluster': PeaCluster,
  'pea-shoot': PeaShoot,
  'pea-shoots': PeaShoot,
  'mint-leaf': MintLeaf,
  'mint-leaves': MintLeaf,
  'micro-green': MicroGreen,
  'micro-greens': MicroGreenCluster,
  'tomato': TomatoSlice,
  'tomato-slice': TomatoSlice,
  'cherry-tomato': CherryTomato,
  'baby-carrot': BabyVegetable,
  'baby-turnip': BabyVegetable,
  'baby-radish': BabyVegetable,
  'baby-beet': BabyVegetable,
  'chives': ChivePieces,
  'chive-single': ChiveSingle,
  'leek-veloute': LeekVeloute,
  'veloute-swoosh': LeekVeloute,
  'leek-ring': LeekRing,
  'baby-leek': BabyLeek,

  // === SAUCES ===
  'sauce-dot': SauceDot,
  'sauce-dots': SauceDotCluster,
  'balsamic-dots': SauceDotCluster,
  'swoosh': SwooshTrail,
  'sauce-swoosh': SwooshTrail,
  'brown-butter': SwooshTrail,
  'jus': SwooshTrail,
  'swoosh-pair': SwooshPair,
  'drizzle': DrizzleLine,
  'lemon-oil': DrizzleLine,
  'basil-oil': DrizzleLine,
  'herb-oil': DrizzleLine,
  'oil-droplets': OilDroplets,

  // === GARNISHES ===
  'edible-flower': EdibleFlower,
  'flowers': EdibleFlower,
  'micro-flower': MicroFlower,
  'flower-cluster': FlowerCluster,
  'parsley': HerbLeaf,
  'basil': HerbLeaf,
  'cilantro': HerbLeaf,
  'tarragon': HerbLeaf,
  'herb-leaf': HerbLeaf,
  'quenelle': Quenelle,
  'butter-quenelle': ButterQuenelle,
  'creme-fraiche': CremeFraicheQuenelle,
  'creme-fraiche-quenelle': CremeFraicheQuenelle,
  'chocolate-mousse-quenelle': ChocolateMousseQuenelle,
  'sorbet-quenelle': SorbetQuenelle,
  'powdered-sugar': PowderedSugarDust,
  'black-salt': BlackSaltCrystals,
  'fleur-de-sel': FleurDeSel,
  'caper': Caper,
  'capers': CaperScatter,
  'caper-berry': CaperBerry,
};

/**
 * Get an ingredient component by ID
 * @param id The ingredient ID
 * @returns The ingredient component or null if not found
 */
export function getIngredient(id: string): ComponentType<IngredientBaseProps> | null {
  return ingredientRegistry[id] || null;
}

/**
 * Check if an ingredient exists in the registry
 * @param id The ingredient ID to check
 */
export function hasIngredient(id: string): boolean {
  return id in ingredientRegistry;
}

/**
 * Get all registered ingredient IDs
 */
export function getAllIngredientIds(): string[] {
  return Object.keys(ingredientRegistry);
}

/**
 * Ingredient categories for organization
 */
export const ingredientCategories = {
  proteins: [
    'butter-pat',
    'egg-yolk',
    'sole-fillet',
    'duck-breast',
    'pigeon-breast',
    'tartare-mound',
    'mozzarella',
    'burrata',
    'tart-slice',
    'puff-pastry',
    'tuile',
  ],
  vegetables: [
    'pea',
    'pea-cluster',
    'pea-shoot',
    'mint-leaf',
    'micro-green',
    'micro-greens',
    'tomato-slice',
    'cherry-tomato',
    'baby-carrot',
    'baby-turnip',
    'baby-radish',
    'baby-beet',
    'chives',
    'leek-veloute',
    'leek-ring',
    'baby-leek',
  ],
  sauces: [
    'sauce-dot',
    'sauce-dots',
    'swoosh',
    'brown-butter',
    'jus',
    'drizzle',
    'lemon-oil',
    'basil-oil',
    'oil-droplets',
  ],
  garnishes: [
    'edible-flower',
    'micro-flower',
    'flower-cluster',
    'parsley',
    'basil',
    'cilantro',
    'tarragon',
    'quenelle',
    'butter-quenelle',
    'creme-fraiche',
    'powdered-sugar',
    'black-salt',
    'fleur-de-sel',
    'caper',
    'capers',
  ],
};
