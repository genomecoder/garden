import { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Line, Text } from 'react-konva';
import Konva from 'konva';
import type { GardenState, GardenAction, BedShape, GardenBed } from '../../types';
import { PIXELS_PER_FOOT } from '../../constants';
import { findBedAtPoint } from '../../utils/geometry';
import { GardenBedComponent } from './GardenBed';
import { TransformerWrapper } from './TransformerWrapper';
import './Canvas.css';

interface ContextMenuState {
  x: number;
  y: number;
  bedId: string | null;
}

interface CanvasProps {
  state: GardenState;
  dispatch: React.Dispatch<GardenAction>;
  clipboardRef: React.RefObject<GardenBed | null>;
  stageRef: React.RefObject<Konva.Stage | null>;
}

const MIN_SCALE = 0.1;
const MAX_SCALE = 5;
const ZOOM_FACTOR = 1.1;

export function Canvas({ state, dispatch, clipboardRef, stageRef }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [snapToGrid, setSnapToGrid] = useState(true);
  const isPanningRef = useRef(false);
  const isSpaceRef = useRef(false);

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

  // Space key for pan mode
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        isSpaceRef.current = true;
      }
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') isSpaceRef.current = false;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  // Convert screen pointer position to world coordinates
  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => ({
      x: (screenX - position.x) / scale,
      y: (screenY - position.y) / scale,
    }),
    [scale, position]
  );

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const direction = e.evt.deltaY < 0 ? 1 : -1;
      const newScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, scale * Math.pow(ZOOM_FACTOR, direction))
      );

      // Zoom toward pointer
      const mousePointTo = {
        x: (pointer.x - position.x) / scale,
        y: (pointer.y - position.y) / scale,
      };

      setScale(newScale);
      setPosition({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    },
    [scale, position]
  );

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Middle mouse button or space+left click starts pan
      if (e.evt.button === 1 || (e.evt.button === 0 && isSpaceRef.current)) {
        e.evt.preventDefault();
        isPanningRef.current = true;
        const stage = stageRef.current;
        if (stage) {
          stage.container().style.cursor = 'grabbing';
        }
      }
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isPanningRef.current) return;
      setPosition((prev) => ({
        x: prev.x + e.evt.movementX,
        y: prev.y + e.evt.movementY,
      }));
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      const stage = stageRef.current;
      if (stage) {
        stage.container().style.cursor = '';
      }
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const world = screenToWorld(screenX, screenY);

      const bedShape = e.dataTransfer.getData('application/garden-bed') as BedShape;
      if (bedShape) {
        dispatch({ type: 'ADD_BED', payload: { shape: bedShape, x: world.x, y: world.y } });
        return;
      }

      const plantId = e.dataTransfer.getData('application/garden-plant');
      if (plantId) {
        const targetBed = findBedAtPoint(state.beds, world.x, world.y);
        if (targetBed) {
          dispatch({
            type: 'ADD_PLANT',
            payload: { bedId: targetBed.id, plantTypeId: plantId },
          });
        }
      }
    },
    [dispatch, state.beds, screenToWorld]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanningRef.current || isSpaceRef.current) return;
    if (e.target === e.target.getStage()) {
      dispatch({ type: 'SELECT_BED', payload: { id: null } });
    }
  };

  const handleTransformEnd = (id: string, width: number, height: number, rotation: number) => {
    dispatch({ type: 'RESIZE_BED', payload: { id, width, height } });
    dispatch({ type: 'ROTATE_BED', payload: { id, rotation } });
  };

  const handleSelect = (id: string) => {
    if (isPanningRef.current || isSpaceRef.current) return;
    dispatch({ type: 'SELECT_BED', payload: { id } });
  };

  const handleContextMenu = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      e.evt.preventDefault();
      const stage = stageRef.current;
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const world = screenToWorld(pointer.x, pointer.y);
      const bed = findBedAtPoint(state.beds, world.x, world.y);
      if (bed) {
        dispatch({ type: 'SELECT_BED', payload: { id: bed.id } });
      }

      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      setContextMenu({
        x: e.evt.clientX - rect.left,
        y: e.evt.clientY - rect.top,
        bedId: bed?.id ?? null,
      });
    },
    [state.beds, dispatch, screenToWorld]
  );

  const closeContextMenu = () => setContextMenu(null);

  const handleCopy = () => {
    if (contextMenu?.bedId) {
      const bed = state.beds.find((b) => b.id === contextMenu.bedId);
      if (bed) clipboardRef.current = bed;
    }
    closeContextMenu();
  };

  const handlePaste = () => {
    if (clipboardRef.current) {
      dispatch({ type: 'PASTE_BED', payload: { bed: clipboardRef.current } });
    }
    closeContextMenu();
  };

  const handleDeleteCtx = () => {
    if (contextMenu?.bedId) {
      dispatch({ type: 'DELETE_BED', payload: { id: contextMenu.bedId } });
    }
    closeContextMenu();
  };

  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Close context menu on any click
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [contextMenu]);

  // Compute visible world bounds for grid
  const worldTopLeft = screenToWorld(0, 0);
  const worldBottomRight = screenToWorld(size.width, size.height);

  const MAJOR_EVERY = 5;
  const gridElements: React.ReactNode[] = [];

  const startFtX = Math.floor(worldTopLeft.x / PIXELS_PER_FOOT);
  const endFtX = Math.ceil(worldBottomRight.x / PIXELS_PER_FOOT);
  const startFtY = Math.floor(worldTopLeft.y / PIXELS_PER_FOOT);
  const endFtY = Math.ceil(worldBottomRight.y / PIXELS_PER_FOOT);

  for (let ft = startFtX; ft <= endFtX; ft++) {
    const x = ft * PIXELS_PER_FOOT;
    const isMajor = ft % MAJOR_EVERY === 0;
    gridElements.push(
      <Line
        key={`v-${ft}`}
        points={[x, worldTopLeft.y, x, worldBottomRight.y]}
        stroke={isMajor ? '#c0c0c0' : '#e0e0e0'}
        strokeWidth={(isMajor ? 1 : 0.5) / scale}
        listening={false}
      />
    );
    if (isMajor) {
      gridElements.push(
        <Text
          key={`vl-${ft}`}
          x={x + 3 / scale}
          y={worldTopLeft.y + 2 / scale}
          text={`${ft}ft`}
          fontSize={10 / scale}
          fill="#999"
          listening={false}
        />
      );
    }
  }

  for (let ft = startFtY; ft <= endFtY; ft++) {
    const y = ft * PIXELS_PER_FOOT;
    const isMajor = ft % MAJOR_EVERY === 0;
    gridElements.push(
      <Line
        key={`h-${ft}`}
        points={[worldTopLeft.x, y, worldBottomRight.x, y]}
        stroke={isMajor ? '#c0c0c0' : '#e0e0e0'}
        strokeWidth={(isMajor ? 1 : 0.5) / scale}
        listening={false}
      />
    );
    if (isMajor) {
      gridElements.push(
        <Text
          key={`hl-${ft}`}
          x={worldTopLeft.x + 2 / scale}
          y={y + 3 / scale}
          text={`${ft}ft`}
          fontSize={10 / scale}
          fill="#999"
          listening={false}
        />
      );
    }
  }

  const scaleFeet = 5;
  const scaleBarPx = scaleFeet * PIXELS_PER_FOOT * scale;
  const zoomPercent = Math.round(scale * 100);

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
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onContextMenu={handleContextMenu}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
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
              snapToGrid={snapToGrid}
              customPlants={state.customPlants ?? []}
            />
          ))}
          <TransformerWrapper
            selectedBedId={state.selectedBedId}
            isLocked={state.beds.find((b) => b.id === state.selectedBedId)?.locked ?? false}
            stageRef={stageRef}
            onTransformEnd={handleTransformEnd}
          />
        </Layer>
      </Stage>
      <div className="scale-indicator">
        <div className="scale-bar" style={{ width: scaleBarPx }} />
        <span className="scale-label">{scaleFeet} ft</span>
      </div>
      <div className="zoom-indicator">
        <button onClick={handleResetView} title="Reset view">
          {zoomPercent}%
        </button>
        <button
          className={`btn-snap ${snapToGrid ? 'active' : ''}`}
          onClick={() => setSnapToGrid((v) => !v)}
          title="Snap to grid"
        >
          Snap
        </button>
      </div>
      {contextMenu && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.bedId && (
            <button onClick={handleCopy}>Copy</button>
          )}
          <button
            onClick={handlePaste}
            disabled={!clipboardRef.current}
          >
            Paste
          </button>
          {contextMenu.bedId && (
            <button onClick={handleDeleteCtx} className="context-danger">
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
