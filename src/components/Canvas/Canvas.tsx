import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Line, Text } from 'react-konva';
import Konva from 'konva';
import type { GardenState, GardenAction, BedShape } from '../../types';
import { PIXELS_PER_FOOT } from '../../constants';
import { findBedAtPoint } from '../../utils/geometry';
import { GardenBedComponent } from './GardenBed';
import { TransformerWrapper } from './TransformerWrapper';
import './Canvas.css';

interface CanvasProps {
  state: GardenState;
  dispatch: React.Dispatch<GardenAction>;
}

export function Canvas({ state, dispatch }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      stage.setPointersPositions(e.nativeEvent);
      const pos = stage.getPointerPosition();
      if (!pos) return;

      const bedShape = e.dataTransfer.getData('application/garden-bed') as BedShape;
      if (bedShape) {
        dispatch({ type: 'ADD_BED', payload: { shape: bedShape, x: pos.x, y: pos.y } });
        return;
      }

      const plantId = e.dataTransfer.getData('application/garden-plant');
      if (plantId) {
        const targetBed = findBedAtPoint(state.beds, pos.x, pos.y);
        if (targetBed) {
          dispatch({
            type: 'ADD_PLANT',
            payload: { bedId: targetBed.id, plantTypeId: plantId },
          });
        }
      }
    },
    [dispatch, state.beds]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      dispatch({ type: 'SELECT_BED', payload: { id: null } });
    }
  };

  const handleTransformEnd = (id: string, width: number, height: number) => {
    dispatch({ type: 'RESIZE_BED', payload: { id, width, height } });
  };

  const handleSelect = (id: string) => {
    dispatch({ type: 'SELECT_BED', payload: { id } });
  };

  const MAJOR_EVERY = 5; // bold line every 5 feet
  const gridElements: React.ReactNode[] = [];

  // Vertical lines
  for (let ft = 0; ft * PIXELS_PER_FOOT < size.width; ft++) {
    const x = ft * PIXELS_PER_FOOT;
    const isMajor = ft % MAJOR_EVERY === 0;
    gridElements.push(
      <Line
        key={`v-${ft}`}
        points={[x, 0, x, size.height]}
        stroke={isMajor ? '#c0c0c0' : '#e0e0e0'}
        strokeWidth={isMajor ? 1 : 0.5}
        listening={false}
      />
    );
    if (isMajor && ft > 0) {
      gridElements.push(
        <Text
          key={`vl-${ft}`}
          x={x + 3}
          y={2}
          text={`${ft}ft`}
          fontSize={10}
          fill="#999"
          listening={false}
        />
      );
    }
  }

  // Horizontal lines
  for (let ft = 0; ft * PIXELS_PER_FOOT < size.height; ft++) {
    const y = ft * PIXELS_PER_FOOT;
    const isMajor = ft % MAJOR_EVERY === 0;
    gridElements.push(
      <Line
        key={`h-${ft}`}
        points={[0, y, size.width, y]}
        stroke={isMajor ? '#c0c0c0' : '#e0e0e0'}
        strokeWidth={isMajor ? 1 : 0.5}
        listening={false}
      />
    );
    if (isMajor && ft > 0) {
      gridElements.push(
        <Text
          key={`hl-${ft}`}
          x={2}
          y={y + 3}
          text={`${ft}ft`}
          fontSize={10}
          fill="#999"
          listening={false}
        />
      );
    }
  }

  const scaleFeet = 5;
  const scaleBarPx = scaleFeet * PIXELS_PER_FOOT;

  return (
    <div
      ref={containerRef}
      className="canvas-container"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          {gridElements}
          {state.beds.map((bed) => (
            <GardenBedComponent
              key={bed.id}
              bed={bed}
              isSelected={bed.id === state.selectedBedId}
              dispatch={dispatch}
              onSelect={handleSelect}
            />
          ))}
          <TransformerWrapper
            selectedBedId={state.selectedBedId}
            stageRef={stageRef}
            onTransformEnd={handleTransformEnd}
          />
        </Layer>
      </Stage>
      <div className="scale-indicator">
        <div className="scale-bar" style={{ width: scaleBarPx }} />
        <span className="scale-label">{scaleFeet} ft</span>
      </div>
    </div>
  );
}
