import type { GardenState } from '../types';
import { STORAGE_KEY } from '../constants';

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
