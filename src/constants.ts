import type { PlantType } from './types';

export const PLANT_CATALOG: PlantType[] = [
  { id: 'tomato', name: 'Tomato', color: '#e74c3c', icon: '🍅' },
  { id: 'carrot', name: 'Carrot', color: '#e67e22', icon: '🥕' },
  { id: 'lettuce', name: 'Lettuce', color: '#2ecc71', icon: '🥬' },
  { id: 'pepper', name: 'Pepper', color: '#f39c12', icon: '🌶' },
  { id: 'cucumber', name: 'Cucumber', color: '#27ae60', icon: '🥒' },
  { id: 'sunflower', name: 'Sunflower', color: '#f1c40f', icon: '🌻' },
  { id: 'basil', name: 'Basil', color: '#16a085', icon: '🌿' },
  { id: 'strawberry', name: 'Strawberry', color: '#c0392b', icon: '🍓' },
  { id: 'corn', name: 'Corn', color: '#d4ac0d', icon: '🌽' },
  { id: 'pea', name: 'Pea', color: '#229954', icon: '🫛' },
];

export const DEFAULT_BED_WIDTH = 150;
export const DEFAULT_BED_HEIGHT = 100;
export const DEFAULT_BED_RADIUS = 60;

export const BED_FILL = '#8B6914';
export const BED_STROKE = '#5C4A0E';
export const BED_SELECTED_STROKE = '#3498db';

export const PIXELS_PER_FOOT = 20;
export const CANVAS_GRID_SIZE = PIXELS_PER_FOOT;

export const STORAGE_KEY = 'garden-planner-state';
