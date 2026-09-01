import type { GardenBed } from '../types';
import { PIXELS_PER_FOOT } from '../constants';

export function isPointInRect(
  px: number,
  py: number,
  x: number,
  y: number,
  width: number,
  height: number
): boolean {
  return px >= x && px <= x + width && py >= y && py <= y + height;
}

export function isPointInCircle(
  px: number,
  py: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): boolean {
  const dx = (px - cx) / rx;
  const dy = (py - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

export function isPointInPolygon(
  px: number,
  py: number,
  vertices: { x: number; y: number }[]
): boolean {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x, yi = vertices[i].y;
    const xj = vertices[j].x, yj = vertices[j].y;
    const intersect =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function getTriangleVertices(bed: GardenBed): { x: number; y: number }[] {
  return [
    { x: bed.x + bed.width / 2, y: bed.y },
    { x: bed.x + bed.width, y: bed.y + bed.height },
    { x: bed.x, y: bed.y + bed.height },
  ];
}

function getLShapeVertices(bed: GardenBed): { x: number; y: number }[] {
  return [
    { x: bed.x, y: bed.y },
    { x: bed.x + bed.width * 0.6, y: bed.y },
    { x: bed.x + bed.width * 0.6, y: bed.y + bed.height * 0.4 },
    { x: bed.x + bed.width, y: bed.y + bed.height * 0.4 },
    { x: bed.x + bed.width, y: bed.y + bed.height },
    { x: bed.x, y: bed.y + bed.height },
  ];
}

export function findBedAtPoint(
  beds: GardenBed[],
  px: number,
  py: number
): GardenBed | undefined {
  // Iterate in reverse so topmost (last added) beds are found first
  for (let i = beds.length - 1; i >= 0; i--) {
    const bed = beds[i];
    switch (bed.shape) {
      case 'rectangle':
      case 'shed':
      case 'fence':
      case 'path':
      case 'raised-bed':
      case 'compost':
      case 'bench':
      case 'trellis':
      case 'rain-barrel':
        if (isPointInRect(px, py, bed.x, bed.y, bed.width, bed.height)) {
          return bed;
        }
        break;
      case 'circle':
      case 'pond':
      case 'tree':
        if (
          isPointInCircle(
            px, py,
            bed.x + bed.width / 2, bed.y + bed.height / 2,
            bed.width / 2, bed.height / 2
          )
        ) {
          return bed;
        }
        break;
      case 'triangle':
        if (isPointInPolygon(px, py, getTriangleVertices(bed))) {
          return bed;
        }
        break;
      case 'l-shape':
        if (isPointInPolygon(px, py, getLShapeVertices(bed))) {
          return bed;
        }
        break;
    }
  }
  return undefined;
}

export function computePlantGrid(
  bed: GardenBed,
  plantCount: number
): { x: number; y: number }[] {
  if (plantCount === 0) return [];

  const padding = 12;
  const spacingPx = (bed.plantSpacing ?? 1) * PIXELS_PER_FOOT;
  const innerW = bed.width - padding * 2;
  const innerH = bed.height - padding * 2;

  const cols = Math.max(1, Math.floor(innerW / spacingPx));
  const rows = Math.max(1, Math.ceil(plantCount / cols));

  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < plantCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cellW = cols > 1 ? innerW / cols : innerW;
    const cellH = rows > 1 ? innerH / rows : innerH;
    positions.push({
      x: padding + cellW * (col + 0.5),
      y: padding + cellH * (row + 0.5),
    });
  }
  return positions;
}
