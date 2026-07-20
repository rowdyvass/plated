/**
 * PlateModel — the plate as pure data.
 *
 * Everything visible on the plate lives here: placed items and sauce strokes.
 * The renderer draws *from* this model, the (future) judge scores it, and it
 * serializes for undo/replay/sharing. This is the architectural seed of the
 * rebuild described in REDESIGN.md.
 */

export type LabItemKind = 'sole' | 'quenelle' | 'lemon' | 'parsley';

export interface PlacedItem {
  id: string;
  kind: LabItemKind;
  /** Canvas-space position */
  x: number;
  y: number;
  rotation: number;
  scale: number;
  flip: boolean;
}

export interface SaucePoint {
  x: number;
  y: number;
  /** Splat radius at this point */
  r: number;
}

export interface SauceStroke {
  id: string;
  points: SaucePoint[];
}

/** One undoable user action */
export type PlateAction =
  | { type: 'item'; id: string }
  | { type: 'stroke'; id: string }
  | { type: 'cluster'; ids: string[] };

let nextId = 1;
export function makeId(prefix: string): string {
  return `${prefix}-${nextId++}`;
}

export class PlateModel {
  items: PlacedItem[] = [];
  strokes: SauceStroke[] = [];
  private actions: PlateAction[] = [];

  addItem(item: Omit<PlacedItem, 'id'>): PlacedItem {
    const placed: PlacedItem = { ...item, id: makeId(item.kind) };
    this.items.push(placed);
    this.actions.push({ type: 'item', id: placed.id });
    return placed;
  }

  /** A scatter spawns several items but undoes as one action. */
  addCluster(items: Omit<PlacedItem, 'id'>[]): PlacedItem[] {
    const placed = items.map((item) => {
      const p: PlacedItem = { ...item, id: makeId(item.kind) };
      this.items.push(p);
      return p;
    });
    this.actions.push({ type: 'cluster', ids: placed.map((p) => p.id) });
    return placed;
  }

  beginStroke(): SauceStroke {
    const stroke: SauceStroke = { id: makeId('sauce'), points: [] };
    this.strokes.push(stroke);
    this.actions.push({ type: 'stroke', id: stroke.id });
    return stroke;
  }

  moveItem(id: string, x: number, y: number): void {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.x = x;
      item.y = y;
    }
  }

  rotateItem(id: string, rotation: number): void {
    const item = this.items.find((i) => i.id === id);
    if (item) item.rotation = rotation;
  }

  /** Pops the most recent action; returns the ids to remove from the scene. */
  undo(): string[] {
    const action = this.actions.pop();
    if (!action) return [];
    if (action.type === 'cluster') {
      this.items = this.items.filter((i) => !action.ids.includes(i.id));
      return action.ids;
    }
    if (action.type === 'item') {
      this.items = this.items.filter((i) => i.id !== action.id);
    } else {
      this.strokes = this.strokes.filter((s) => s.id !== action.id);
    }
    return [action.id];
  }

  clear(): string[] {
    const ids = [...this.items.map((i) => i.id), ...this.strokes.map((s) => s.id)];
    this.items = [];
    this.strokes = [];
    this.actions = [];
    return ids;
  }

  get isEmpty(): boolean {
    return this.items.length === 0 && this.strokes.length === 0;
  }

  serialize(): string {
    return JSON.stringify({ items: this.items, strokes: this.strokes });
  }
}
