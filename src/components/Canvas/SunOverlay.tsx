import { Line } from 'react-konva';
import type { GardenBed } from '../../types';
import { BED_HEIGHTS, PIXELS_PER_FOOT } from '../../constants';

interface SunOverlayProps {
  beds: GardenBed[];
  sunDirection: number;
  sunElevation: number;
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function getFootprintCorners(bed: GardenBed): [number, number][] {
  const cx = bed.x + bed.width / 2;
  const cy = bed.y + bed.height / 2;
  const hw = bed.width / 2;
  const hh = bed.height / 2;

  // Local corners (relative to center)
  let localCorners: [number, number][];

  switch (bed.shape) {
    case 'circle':
    case 'pond':
    case 'tree': {
      // Approximate circle/ellipse with 12-sided polygon
      const steps = 12;
      localCorners = [];
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        localCorners.push([
          Math.cos(angle) * hw,
          Math.sin(angle) * hh,
        ]);
      }
      break;
    }
    case 'triangle':
      localCorners = [
        [0, -hh],
        [hw, hh],
        [-hw, hh],
      ];
      break;
    case 'l-shape':
      localCorners = [
        [-hw, -hh],
        [hw * 0.2, -hh],
        [hw * 0.2, -hh * 0.2],
        [hw, -hh * 0.2],
        [hw, hh],
        [-hw, hh],
      ];
      break;
    default:
      // Rectangle-like shapes
      localCorners = [
        [-hw, -hh],
        [hw, -hh],
        [hw, hh],
        [-hw, hh],
      ];
      break;
  }

  // Apply rotation
  const rad = degToRad(bed.rotation);
  const cosR = Math.cos(rad);
  const sinR = Math.sin(rad);

  return localCorners.map(([lx, ly]) => [
    cx + lx * cosR - ly * sinR,
    cy + lx * sinR + ly * cosR,
  ]);
}

function computeShadowPolygon(
  corners: [number, number][],
  shadowDx: number,
  shadowDy: number
): number[] {
  // Extrude each corner by the shadow offset, then build a hull
  // Simple approach: original footprint + offset footprint, compute convex hull
  const allPoints: [number, number][] = [
    ...corners,
    ...corners.map(([x, y]) => [x + shadowDx, y + shadowDy] as [number, number]),
  ];

  // Convex hull (Graham scan)
  return flattenHull(convexHull(allPoints));
}

function convexHull(points: [number, number][]): [number, number][] {
  if (points.length < 3) return points;

  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  const lower: [number, number][] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: [number, number][] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  // Remove last point of each half because it's repeated
  lower.pop();
  upper.pop();

  return lower.concat(upper);
}

function flattenHull(hull: [number, number][]): number[] {
  const flat: number[] = [];
  for (const [x, y] of hull) {
    flat.push(x, y);
  }
  return flat;
}

export function SunOverlay({ beds, sunDirection, sunElevation }: SunOverlayProps) {
  // Shadow direction is opposite of sun direction
  const shadowAngle = degToRad(sunDirection + 180);
  const elevRad = degToRad(sunElevation);

  const shadows: { key: string; points: number[] }[] = [];

  for (const bed of beds) {
    const heightFt = BED_HEIGHTS[bed.shape] ?? 0;
    if (heightFt <= 0) continue;

    const shadowLength = (heightFt * PIXELS_PER_FOOT) / Math.tan(elevRad);
    const shadowDx = Math.sin(shadowAngle) * shadowLength;
    const shadowDy = -Math.cos(shadowAngle) * shadowLength;

    const corners = getFootprintCorners(bed);
    const points = computeShadowPolygon(corners, shadowDx, shadowDy);

    shadows.push({ key: bed.id, points });
  }

  return (
    <>
      {shadows.map(({ key, points }) => (
        <Line
          key={`shadow-${key}`}
          points={points}
          closed
          fill="rgba(0,0,0,0.15)"
          listening={false}
        />
      ))}
    </>
  );
}
