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
      {bed.shape === 'shed' && (() => {
        const roofTop = bed.height * 0.2;
        const roofBase = bed.height * 0.35;
        const wallTop = roofBase;
        const wallH = bed.height - wallTop;
        const doorW = bed.width * 0.25;
        const doorH = wallH * 0.7;
        const doorX = (bed.width - doorW) / 2;
        const doorY = bed.height - doorH;
        const winSize = Math.min(bed.width * 0.15, wallH * 0.3);
        const winY = wallTop + wallH * 0.15;
        return (
          <>
            {/* Wall */}
            <Rect
              y={wallTop}
              width={bed.width}
              height={wallH}
              fill={bed.color}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
            {/* Horizontal plank lines */}
            {[0.25, 0.5, 0.75].map((frac) => (
              <Line
                key={frac}
                points={[0, wallTop + wallH * frac, bed.width, wallTop + wallH * frac]}
                stroke="rgba(0,0,0,0.12)"
                strokeWidth={1}
                listening={false}
              />
            ))}
            {/* Roof */}
            <Line
              points={[
                -bed.width * 0.05, roofBase,
                bed.width / 2, roofTop,
                bed.width * 1.05, roofBase,
              ]}
              closed
              fill="#6B4226"
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
            {/* Roof ridge line */}
            <Line
              points={[bed.width / 2, roofTop, bed.width / 2, roofBase]}
              stroke="rgba(0,0,0,0.1)"
              strokeWidth={1}
              listening={false}
            />
            {/* Door */}
            <Rect
              x={doorX}
              y={doorY}
              width={doorW}
              height={doorH}
              fill="#3E2C1E"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={1}
              cornerRadius={[3, 3, 0, 0]}
              listening={false}
            />
            {/* Door knob */}
            <Ellipse
              x={doorX + doorW * 0.75}
              y={doorY + doorH * 0.5}
              radiusX={2}
              radiusY={2}
              fill="#C0A060"
              listening={false}
            />
            {/* Window left */}
            <Rect
              x={bed.width * 0.08}
              y={winY}
              width={winSize}
              height={winSize}
              fill="#A8D8EA"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={1}
              listening={false}
            />
            {/* Window cross */}
            <Line
              points={[bed.width * 0.08 + winSize / 2, winY, bed.width * 0.08 + winSize / 2, winY + winSize]}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth={1}
              listening={false}
            />
            <Line
              points={[bed.width * 0.08, winY + winSize / 2, bed.width * 0.08 + winSize, winY + winSize / 2]}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth={1}
              listening={false}
            />
            {/* Window right */}
            <Rect
              x={bed.width - bed.width * 0.08 - winSize}
              y={winY}
              width={winSize}
              height={winSize}
              fill="#A8D8EA"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth={1}
              listening={false}
            />
            {/* Window cross */}
            <Line
              points={[bed.width - bed.width * 0.08 - winSize / 2, winY, bed.width - bed.width * 0.08 - winSize / 2, winY + winSize]}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth={1}
              listening={false}
            />
            <Line
              points={[bed.width - bed.width * 0.08 - winSize, winY + winSize / 2, bed.width - bed.width * 0.08, winY + winSize / 2]}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth={1}
              listening={false}
            />
          </>
        );
      })()}
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
      {bed.shape === 'trellis' && (() => {
        const slatColor = bed.color;
        const slatW = 2;
        const spacing = Math.max(10, bed.width * 0.15);
        const vLines: React.ReactNode[] = [];
        const hLines: React.ReactNode[] = [];
        for (let x = spacing; x < bed.width; x += spacing) {
          vLines.push(
            <Line
              key={`v-${x}`}
              points={[x, 0, x, bed.height]}
              stroke={slatColor}
              strokeWidth={slatW}
              listening={false}
            />
          );
        }
        for (let y = spacing; y < bed.height; y += spacing) {
          hLines.push(
            <Line
              key={`h-${y}`}
              points={[0, y, bed.width, y]}
              stroke={slatColor}
              strokeWidth={slatW}
              listening={false}
            />
          );
        }
        return (
          <>
            {/* Frame */}
            <Rect
              width={bed.width}
              height={bed.height}
              stroke={stroke}
              strokeWidth={strokeWidth}
              fill="rgba(255,255,255,0.05)"
              cornerRadius={2}
            />
            {/* Lattice */}
            {vLines}
            {hLines}
            {/* Top cap */}
            <Rect
              width={bed.width}
              height={4}
              fill={slatColor}
              cornerRadius={[2, 2, 0, 0]}
              listening={false}
            />
          </>
        );
      })()}
      {bed.shape === 'bench' && (() => {
        const legW = bed.width * 0.06;
        const legH = bed.height * 0.35;
        const seatY = bed.height * 0.45;
        const seatH = bed.height * 0.12;
        const backY = bed.height * 0.1;
        const backH = seatY - backY;
        const backThick = bed.height * 0.08;
        return (
          <>
            {/* Left leg */}
            <Rect
              x={bed.width * 0.1}
              y={seatY + seatH}
              width={legW}
              height={legH}
              fill="#5C4A0E"
              listening={false}
            />
            {/* Right leg */}
            <Rect
              x={bed.width - bed.width * 0.1 - legW}
              y={seatY + seatH}
              width={legW}
              height={legH}
              fill="#5C4A0E"
              listening={false}
            />
            {/* Seat */}
            <Rect
              x={0}
              y={seatY}
              width={bed.width}
              height={seatH}
              fill={bed.color}
              stroke={stroke}
              strokeWidth={strokeWidth}
              cornerRadius={2}
            />
            {/* Seat plank lines */}
            <Line
              points={[0, seatY + seatH * 0.5, bed.width, seatY + seatH * 0.5]}
              stroke="rgba(0,0,0,0.1)"
              strokeWidth={1}
              listening={false}
            />
            {/* Backrest */}
            <Rect
              x={bed.width * 0.02}
              y={backY}
              width={bed.width * 0.96}
              height={backThick}
              fill={bed.color}
              stroke={stroke}
              strokeWidth={strokeWidth}
              cornerRadius={2}
              listening={false}
            />
            <Rect
              x={bed.width * 0.02}
              y={backY + backH * 0.5}
              width={bed.width * 0.96}
              height={backThick}
              fill={bed.color}
              stroke={stroke}
              strokeWidth={strokeWidth}
              cornerRadius={2}
              listening={false}
            />
            {/* Back supports */}
            <Rect
              x={bed.width * 0.1}
              y={backY}
              width={legW}
              height={backH + seatH}
              fill="#5C4A0E"
              listening={false}
            />
            <Rect
              x={bed.width - bed.width * 0.1 - legW}
              y={backY}
              width={legW}
              height={backH + seatH}
              fill="#5C4A0E"
              listening={false}
            />
          </>
        );
      })()}
      {bed.shape === 'tree' && (() => {
        const cx = bed.width / 2;
        const cy = bed.height / 2;
        const canopyRx = bed.width * 0.45;
        const canopyRy = bed.height * 0.45;
        const trunkW = bed.width * 0.12;
        const trunkH = bed.height * 0.3;
        return (
          <>
            {/* Trunk */}
            <Rect
              x={cx - trunkW / 2}
              y={cy}
              width={trunkW}
              height={trunkH}
              fill="#6B4226"
              cornerRadius={2}
              listening={false}
            />
            {/* Shadow under canopy */}
            <Ellipse
              x={cx}
              y={cy + bed.height * 0.02}
              radiusX={canopyRx}
              radiusY={canopyRy}
              fill="rgba(0,0,0,0.1)"
              listening={false}
            />
            {/* Main canopy */}
            <Ellipse
              x={cx}
              y={cy - bed.height * 0.05}
              radiusX={canopyRx}
              radiusY={canopyRy}
              fill={bed.color}
              stroke={stroke}
              strokeWidth={strokeWidth}
            />
            {/* Highlight */}
            <Ellipse
              x={cx - canopyRx * 0.2}
              y={cy - canopyRy * 0.3}
              radiusX={canopyRx * 0.35}
              radiusY={canopyRy * 0.3}
              fill="rgba(255,255,255,0.15)"
              listening={false}
            />
          </>
        );
      })()}
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
      {bed.shape === 'rain-barrel' && (() => {
        const cx = bed.width / 2;
        const bandH = 3;
        return (
          <>
            {/* Main barrel body */}
            <Rect
              width={bed.width}
              height={bed.height}
              fill={bed.color}
              stroke={stroke}
              strokeWidth={strokeWidth}
              cornerRadius={[4, 4, 6, 6]}
            />
            {/* Metal bands */}
            {[0.2, 0.5, 0.8].map((frac) => (
              <Rect
                key={frac}
                x={0}
                y={bed.height * frac - bandH / 2}
                width={bed.width}
                height={bandH}
                fill="rgba(180,180,180,0.5)"
                listening={false}
              />
            ))}
            {/* Lid / top rim */}
            <Rect
              x={-2}
              y={-3}
              width={bed.width + 4}
              height={5}
              fill="#3A5A78"
              cornerRadius={2}
              listening={false}
            />
            {/* Water highlight */}
            <Ellipse
              x={cx}
              y={bed.height * 0.35}
              radiusX={bed.width * 0.2}
              radiusY={bed.height * 0.15}
              fill="rgba(255,255,255,0.15)"
              listening={false}
            />
            {/* Spigot */}
            <Rect
              x={bed.width - 2}
              y={bed.height * 0.7}
              width={6}
              height={4}
              fill="#888"
              cornerRadius={1}
              listening={false}
            />
          </>
        );
      })()}
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
