import { Rect, Ellipse, Group, Text } from 'react-konva';
import Konva from 'konva';
import type { GardenBed as GardenBedType, GardenAction } from '../../types';
import { BED_STROKE, BED_SELECTED_STROKE, PIXELS_PER_FOOT } from '../../constants';
import { computePlantGrid } from '../../utils/geometry';
import { PlantIcon } from './PlantIcon';

interface GardenBedProps {
  bed: GardenBedType;
  isSelected: boolean;
  dispatch: React.Dispatch<GardenAction>;
  onSelect: (id: string) => void;
  snapToGrid: boolean;
}

export function GardenBedComponent({
  bed,
  isSelected,
  dispatch,
  onSelect,
  snapToGrid,
}: GardenBedProps) {
  const plantPositions = computePlantGrid(bed, bed.plants.length);
  const stroke = isSelected ? BED_SELECTED_STROKE : BED_STROKE;
  const strokeWidth = isSelected ? 3 : 2;

  const snap = (val: number) =>
    Math.round(val / PIXELS_PER_FOOT) * PIXELS_PER_FOOT;

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    // Group position is center-based (offset applied), convert back to top-left for state
    let cx = e.target.x();
    let cy = e.target.y();
    let x = cx - bed.width / 2;
    let y = cy - bed.height / 2;
    if (snapToGrid) {
      x = snap(x);
      y = snap(y);
      // Update group position to snapped center
      e.target.x(x + bed.width / 2);
      e.target.y(y + bed.height / 2);
    }
    dispatch({
      type: 'MOVE_BED',
      payload: { id: bed.id, x, y },
    });
  };

  const handleClick = () => {
    onSelect(bed.id);
  };

  return (
    <Group
      x={bed.x + bed.width / 2}
      y={bed.y + bed.height / 2}
      rotation={bed.rotation}
      offset={{ x: bed.width / 2, y: bed.height / 2 }}
      draggable={!bed.locked}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
      name={`bed-${bed.id}`}
    >
      {bed.shape === 'rectangle' ? (
        <Rect
          width={bed.width}
          height={bed.height}
          fill={bed.color}
          stroke={stroke}
          strokeWidth={strokeWidth}
          cornerRadius={4}
        />
      ) : (
        <Ellipse
          x={bed.width / 2}
          y={bed.height / 2}
          radiusX={bed.width / 2}
          radiusY={bed.height / 2}
          fill={bed.color}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      )}
      {bed.label && (
        <Text
          text={bed.label}
          x={0}
          y={-18}
          width={bed.width}
          align="center"
          fontSize={13}
          fontStyle="bold"
          fill="#2c3e50"
          listening={false}
        />
      )}
      {bed.plants.map((plant, i) => {
        const pos = plantPositions[i];
        if (!pos) return null;
        return (
          <PlantIcon
            key={plant.id}
            plantTypeId={plant.plantTypeId}
            x={pos.x}
            y={pos.y}
          />
        );
      })}
    </Group>
  );
}
