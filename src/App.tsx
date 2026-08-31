import { useGardenState } from './hooks/useGardenState';
import { Toolbar } from './components/Toolbar/Toolbar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Canvas } from './components/Canvas/Canvas';
import './App.css';

function App() {
  const { state, dispatch, clipboardRef, undo, redo, canUndo, canRedo } = useGardenState();

  return (
    <div className="app">
      <Toolbar state={state} dispatch={dispatch} undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} />
      <div className="app-body">
        <Sidebar state={state} dispatch={dispatch} />
        <Canvas state={state} dispatch={dispatch} clipboardRef={clipboardRef} />
      </div>
    </div>
  );
}

export default App;
