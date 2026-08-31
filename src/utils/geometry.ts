import type { GardenBed } from '../types';

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

export function findBedAtPoint(
  beds: GardenBed[],
  px: number,
  py: number
): GardenBed | undefined {
  // Iterate in reverse so topmost (last added) beds are found first
  for (let i = beds.length - 1; i >= 0; i--) {
    const bed = beds[i];
    if (bed.shape === 'rectangle') {
      if (isPointInRect(px, py, bed.x, bed.y, bed.width, bed.height)) {
        return bed;
      }
    } else {
      const cx = bed.x + bed.width / 2;
      const cy = bed.y + bed.height / 2;
      if (isPointInCircle(px, py, cx, cy, bed.width / 2, bed.height / 2)) {
        return bed;
      }
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
  const plantSize = 24;
  const innerW = bed.width - padding * 2;
  const innerH = bed.height - padding * 2;

  const cols = Math.max(1, Math.floor(innerW / (plantSize + 4)));
  const rows = Math.max(1, Math.ceil(plantCount / cols));

  const positions: { x: number; y: number }[] = [];
  for (let i = 0; i < plantCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const spacingX = cols > 1 ? innerW / cols : 0;
    const spacingY = rows > 1 ? innerH / rows : 0;
    positions.push({
      x: padding + spacingX * (col + 0.5),
      y: padding + spacingY * (row + 0.5),
    });
  }
  return positions;
}
