import { useState, useEffect } from 'react';
import { Circle, Text, Group, Image as KonvaImage } from 'react-konva';
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

  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!plant?.iconImage) {
      setImg(null);
      return;
    }
    const image = new window.Image();
    image.onload = () => setImg(image);
    image.src = plant.iconImage;
  }, [plant?.iconImage]);

  if (!plant) return null;

  return (
    <Group x={x} y={y} listening={false}>
      <Circle radius={10} fill={plant.color} opacity={0.8} />
      {plant.iconImage && img ? (
        <KonvaImage
          image={img}
          width={16}
          height={16}
          offsetX={8}
          offsetY={8}
          listening={false}
        />
      ) : (
        <Text
          text={plant.icon}
          fontSize={12}
          offsetX={6}
          offsetY={6}
          listening={false}
        />
      )}
    </Group>
  );
}
