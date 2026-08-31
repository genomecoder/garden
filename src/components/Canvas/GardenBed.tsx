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
    let x = e.target.x();
    let y = e.target.y();
    if (snapToGrid) {
      x = snap(x);
      y = snap(y);
      e.target.x(x);
      e.target.y(y);
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
      x={bed.x}
      y={bed.y}
      draggable
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
