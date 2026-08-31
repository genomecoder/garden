import { useGardenState } from './hooks/useGardenState';
import { Toolbar } from './components/Toolbar/Toolbar';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Canvas } from './components/Canvas/Canvas';
import './App.css';

function App() {
  const { state, dispatch, clipboardRef } = useGardenState();

  return (
    <div className="app">
      <Toolbar state={state} dispatch={dispatch} />
      <div className="app-body">
        <Sidebar state={state} dispatch={dispatch} />
        <Canvas state={state} dispatch={dispatch} clipboardRef={clipboardRef} />
      </div>
    </div>
  );
}

export default App;
