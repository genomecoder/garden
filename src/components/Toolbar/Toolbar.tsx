import type { GardenState, GardenAction } from '../../types';
import { saveGarden, clearGarden } from '../../utils/storage';
import './Toolbar.css';

interface ToolbarProps {
  state: GardenState;
  dispatch: React.Dispatch<GardenAction>;
}

export function Toolbar({ state, dispatch }: ToolbarProps) {
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
        <button onClick={handleSave}>Save</button>
        <button onClick={handleClear} className="btn-danger">
          Clear
        </button>
      </div>
    </div>
  );
}
