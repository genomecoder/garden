import { Rect, Ellipse, Group, Text, Label, Tag, Line } from 'react-konva';
import Konva from 'konva';
import type { GardenBed as GardenBedType, GardenAction, PlantType } from '../../types';
import { BED_STROKE, BED_SELECTED_STROKE, PIXELS_PER_FOOT } from '../../constants';
import { computePlantGrid } from '../../utils/geometry';
import { PlantIcon } from './PlantIcon';

interface GardenBedProps {
  bed: GardenBedType;
  isSelected: boolean;
  dispatch: React.Dispatch<GardenAction>;
  onSelect: (id: string) => void;
  snapToGrid: boolean;
  customPlants: PlantType[];
}

export function GardenBedComponent({
  bed,
  isSelected,
  dispatch,
  onSelect,
  snapToGrid,
  customPlants,
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
      {bed.shape === 'rectangle' && (
        <Rect
          width={bed.width}
          height={bed.height}
          fill={bed.color}
          stroke={stroke}
          strokeWidth={strokeWidth}
          cornerRadius={4}
        />
      )}
      {bed.shape === 'circle' && (
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
      {bed.shape === 'triangle' && (
        <Line
          points={[bed.width / 2, 0, bed.width, bed.height, 0, bed.height]}
          closed
          fill={bed.color}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      )}
      {bed.shape === 'l-shape' && (
        <Line
          points={[
            0, 0,
            bed.width * 0.6, 0,
            bed.width * 0.6, bed.height * 0.4,
            bed.width, bed.height * 0.4,
            bed.width, bed.height,
            0, bed.height,
          ]}
          closed
          fill={bed.color}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      )}
      {bed.shape === 'shed' && (
        <>
          <Rect
            y={bed.height * 0.3}
            width={bed.width}
            height={bed.height * 0.7}
            fill={bed.color}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[0, bed.height * 0.3, bed.width / 2, 0, bed.width, bed.height * 0.3]}
            closed
            fill={bed.color}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </>
      )}
      {bed.shape === 'fence' && (
        <Rect
          width={bed.width}
          height={bed.height}
          fill={bed.color}
          opacity={0.5}
          stroke={stroke}
          strokeWidth={strokeWidth}
          dash={[8, 4]}
        />
      )}
      {bed.shape === 'compost' && (
        <>
          <Rect
            width={bed.width}
            height={bed.height}
            fill={bed.color}
            stroke={stroke}
            strokeWidth={strokeWidth}
            cornerRadius={3}
          />
          {[0.25, 0.5, 0.75].map((frac) => (
            <Line
              key={frac}
              points={[0, bed.height * frac, bed.width, bed.height * frac]}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={1}
              listening={false}
            />
          ))}
          <Rect
            y={-4}
            x={-2}
            width={bed.width + 4}
            height={6}
            fill="#3E2C1E"
            cornerRadius={2}
            listening={false}
          />
        </>
      )}
      {bed.shape === 'raised-bed' && (
        <>
          <Rect
            x={0}
            y={6}
            width={bed.width}
            height={bed.height - 6}
            fill="#5C4A0E"
            cornerRadius={3}
            listening={false}
          />
          <Rect
            width={bed.width}
            height={bed.height - 6}
            fill={bed.color}
            stroke={stroke}
            strokeWidth={strokeWidth}
            cornerRadius={3}
          />
          <Line
            points={[3, 0, 3, bed.height - 6]}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
            listening={false}
          />
          <Line
            points={[bed.width - 3, 0, bed.width - 3, bed.height - 6]}
            stroke="rgba(0,0,0,0.15)"
            strokeWidth={1}
            listening={false}
          />
        </>
      )}
      {bed.shape === 'pond' && (
        <>
          <Ellipse
            x={bed.width / 2}
            y={bed.height / 2}
            radiusX={bed.width / 2}
            radiusY={bed.height / 2}
            fill={bed.color}
            stroke={isSelected ? BED_SELECTED_STROKE : '#3A7BBF'}
            strokeWidth={strokeWidth}
          />
          <Ellipse
            x={bed.width / 2}
            y={bed.height / 2 - bed.height * 0.05}
            radiusX={bed.width * 0.3}
            radiusY={bed.height * 0.2}
            fill="rgba(255,255,255,0.2)"
            listening={false}
          />
        </>
      )}
      {bed.shape === 'path' && (
        <Rect
          width={bed.width}
          height={bed.height}
          fill={bed.color}
          stroke={stroke}
          strokeWidth={strokeWidth}
          cornerRadius={bed.height / 2}
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
            customPlants={customPlants}
          />
        );
      })}
      {isSelected && (
        <>
          <Text
            text={`${(bed.width / PIXELS_PER_FOOT).toFixed(1)} ft`}
            x={0}
            y={bed.height + 4}
            width={bed.width}
            align="center"
            fontSize={11}
            fill="#3498db"
            fontStyle="bold"
            listening={false}
          />
          <Text
            text={`${(bed.height / PIXELS_PER_FOOT).toFixed(1)} ft`}
            x={bed.width + 4}
            y={bed.height / 2 - 6}
            fontSize={11}
            fill="#3498db"
            fontStyle="bold"
            listening={false}
          />
        </>
      )}
      {bed.plants.length > 0 && (
        <Label x={bed.width - 4} y={bed.height - 4} listening={false}>
          <Tag
            fill="rgba(0,0,0,0.6)"
            cornerRadius={8}
            pointerDirection="none"
          />
          <Text
            text={`${bed.plants.length}`}
            fontSize={11}
            fontStyle="bold"
            fill="#fff"
            padding={3}
            listening={false}
          />
        </Label>
      )}
    </Group>
  );
}
