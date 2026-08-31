import { useRef, useCallback } from 'react';
import Konva from 'konva';
import { useGardenState } from './hooks/useGardenState';
import { Toolbar } from './components/Toolbar/Toolbar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Canvas } from './components/Canvas/Canvas';
import './App.css';

function App() {
  const { state, dispatch, clipboardRef, undo, redo, canUndo, canRedo } = useGardenState();
  const stageRef = useRef<Konva.Stage>(null);

  const handleExport = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // Save current transform
    const oldScale = { x: stage.scaleX(), y: stage.scaleY() };
    const oldPos = { x: stage.x(), y: stage.y() };

    // Reset to 1:1 for export
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    stage.batchDraw();

    const dataUrl = stage.toDataURL({ pixelRatio: 2 });

    // Restore transform
    stage.scale(oldScale);
    stage.position(oldPos);
    stage.batchDraw();

    const link = document.createElement('a');
    link.download = `${state.name || 'garden'}.png`;
    link.href = dataUrl;
    link.click();
  }, [state.name]);

  return (
    <div className="app">
      <Toolbar
        state={state}
        dispatch={dispatch}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onExport={handleExport}
      />
      <div className="app-body">
        <Sidebar state={state} dispatch={dispatch} />
        <Canvas state={state} dispatch={dispatch} clipboardRef={clipboardRef} stageRef={stageRef} />
      </div>
    </div>
  );
}

export default App;
