import { Circle, Text, Group } from 'react-konva';
import type { PlantType } from '../../types';
import { PLANT_CATALOG } from '../../constants';

interface PlantIconProps {
  plantTypeId: string;
  x: number;
  y: number;
  customPlants?: PlantType[];
}

export function PlantIcon({ plantTypeId, x, y, customPlants = [] }: PlantIconProps) {
  const plant = PLANT_CATALOG.find((p) => p.id === plantTypeId)
    ?? customPlants.find((p) => p.id === plantTypeId);
  if (!plant) return null;

  return (
    <Group x={x} y={y} listening={false}>
      <Circle radius={10} fill={plant.color} opacity={0.8} />
      <Text
        text={plant.icon}
        fontSize={12}
        offsetX={6}
        offsetY={6}
        listening={false}
      />
    </Group>
  );
}
