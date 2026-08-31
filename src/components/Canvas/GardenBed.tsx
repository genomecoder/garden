import { Rect, Ellipse, Group } from 'react-konva';
import Konva from 'konva';
import type { GardenBed as GardenBedType, GardenAction } from '../../types';
import { BED_FILL, BED_STROKE, BED_SELECTED_STROKE } from '../../constants';
import { computePlantGrid } from '../../utils/geometry';
import { PlantIcon } from './PlantIcon';

interface GardenBedProps {
  bed: GardenBedType;
  isSelected: boolean;
  dispatch: React.Dispatch<GardenAction>;
  onSelect: (id: string) => void;
}

export function GardenBedComponent({
  bed,
  isSelected,
  dispatch,
  onSelect,
}: GardenBedProps) {
  const plantPositions = computePlantGrid(bed, bed.plants.length);
  const stroke = isSelected ? BED_SELECTED_STROKE : BED_STROKE;
  const strokeWidth = isSelected ? 3 : 2;

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    dispatch({
      type: 'MOVE_BED',
      payload: { id: bed.id, x: e.target.x(), y: e.target.y() },
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
          fill={BED_FILL}
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
          fill={BED_FILL}
          stroke={stroke}
          strokeWidth={strokeWidth}
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
