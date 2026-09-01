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
export const DEFAULT_SHED_WIDTH = 100;
export const DEFAULT_SHED_HEIGHT = 80;
export const DEFAULT_FENCE_WIDTH = 200;
export const DEFAULT_FENCE_HEIGHT = 10;
export const DEFAULT_PATH_WIDTH = 200;
export const DEFAULT_PATH_HEIGHT = 40;
export const DEFAULT_POND_WIDTH = 120;
export const DEFAULT_POND_HEIGHT = 100;
export const DEFAULT_RAISED_BED_WIDTH = 150;
export const DEFAULT_RAISED_BED_HEIGHT = 80;
export const RAISED_BED_FILL = '#A0522D';
export const DEFAULT_COMPOST_WIDTH = 60;
export const DEFAULT_COMPOST_HEIGHT = 60;
export const COMPOST_FILL = '#4A3728';
export const DEFAULT_TREE_WIDTH = 80;
export const DEFAULT_TREE_HEIGHT = 80;
export const TREE_FILL = '#2D8B46';
export const DEFAULT_BENCH_WIDTH = 100;
export const DEFAULT_BENCH_HEIGHT = 40;
export const BENCH_FILL = '#8B6914';
export const DEFAULT_TRELLIS_WIDTH = 100;
export const DEFAULT_TRELLIS_HEIGHT = 120;
export const TRELLIS_FILL = '#A08060';
export const SHED_FILL = '#8B7355';
export const FENCE_FILL = '#A0522D';
export const PATH_FILL = '#C8B99A';
export const POND_FILL = '#5B9BD5';

export const BED_FILL = '#8B6914';
export const BED_STROKE = '#5C4A0E';
export const BED_SELECTED_STROKE = '#3498db';

export const BED_COLORS = [
  '#8B6914', // brown (default)
  '#5C4A0E', // dark brown
  '#A0522D', // sienna
  '#6B8E23', // olive
  '#2E8B57', // sea green
  '#4682B4', // steel blue
  '#8B4513', // saddle brown
  '#CD853F', // peru
  '#D2691E', // chocolate
  '#556B2F', // dark olive
];

export const PIXELS_PER_FOOT = 20;
export const CANVAS_GRID_SIZE = PIXELS_PER_FOOT;

export const STORAGE_KEY = 'garden-planner-state';
export const LAYOUTS_KEY = 'garden-planner-layouts';
