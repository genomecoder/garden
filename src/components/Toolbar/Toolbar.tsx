import type { GardenState, GardenAction } from '../../types';
import { saveGarden, clearGarden } from '../../utils/storage';
import './Toolbar.css';

interface ToolbarProps {
  state: GardenState;
  dispatch: React.Dispatch<GardenAction>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function Toolbar({ state, dispatch, undo, redo, canUndo, canRedo }: ToolbarProps) {
  const handleSave = () => {
    saveGarden(state);
    alert('Garden saved!');
  };

  const handleClear = () => {
    if (confirm('Clear the entire garden?')) {
      clearGarden();
      dispatch({ type: 'CLEAR_GARDEN' });
    }
  };

  return (
    <div className="toolbar">
      <input
        className="toolbar-name"
        type="text"
        value={state.name}
        onChange={(e) =>
          dispatch({ type: 'SET_NAME', payload: { name: e.target.value } })
        }
      />
      <div className="toolbar-actions">
        <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          Undo
        </button>
        <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">
          Redo
        </button>
        <button onClick={handleSave}>Save</button>
        <button onClick={handleClear} className="btn-danger">
          Clear
        </button>
      </div>
    </div>
  );
}
