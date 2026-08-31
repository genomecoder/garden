import type { GardenState } from '../types';
import { STORAGE_KEY, LAYOUTS_KEY } from '../constants';

// --- Active garden (auto-load on startup) ---

export function saveGarden(state: GardenState): void {
  const toSave: GardenState = { ...state, selectedBedId: null };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

export function loadGarden(): GardenState | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as GardenState;
    parsed.selectedBedId = null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearGarden(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// --- Multiple saved layouts ---

export interface SavedLayout {
  id: string;
  name: string;
  savedAt: number;
  state: GardenState;
}

function getLayouts(): SavedLayout[] {
  const raw = localStorage.getItem(LAYOUTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SavedLayout[];
  } catch {
    return [];
  }
}

function setLayouts(layouts: SavedLayout[]): void {
  localStorage.setItem(LAYOUTS_KEY, JSON.stringify(layouts));
}

export function listLayouts(): SavedLayout[] {
  return getLayouts().sort((a, b) => b.savedAt - a.savedAt);
}

export function saveLayout(id: string, state: GardenState): void {
  const layouts = getLayouts();
  const toSave: GardenState = { ...state, selectedBedId: null };
  const existing = layouts.findIndex((l) => l.id === id);
  const entry: SavedLayout = {
    id,
    name: state.name,
    savedAt: Date.now(),
    state: toSave,
  };
  if (existing >= 0) {
    layouts[existing] = entry;
  } else {
    layouts.push(entry);
  }
  setLayouts(layouts);
}

export function loadLayout(id: string): GardenState | null {
  const layouts = getLayouts();
  const entry = layouts.find((l) => l.id === id);
  if (!entry) return null;
  return { ...entry.state, selectedBedId: null };
}

export function deleteLayout(id: string): void {
  const layouts = getLayouts().filter((l) => l.id !== id);
  setLayouts(layouts);
}
