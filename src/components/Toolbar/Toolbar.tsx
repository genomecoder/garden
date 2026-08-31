import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { GardenState, GardenAction } from '../../types';
import {
  saveGarden,
  clearGarden,
  listLayouts,
  saveLayout,
  loadLayout,
  deleteLayout,
} from '../../utils/storage';
import type { SavedLayout } from '../../utils/storage';
import './Toolbar.css';

interface ToolbarProps {
  state: GardenState;
  dispatch: React.Dispatch<GardenAction>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExport: () => void;
}

export function Toolbar({ state, dispatch, undo, redo, canUndo, canRedo, onExport }: ToolbarProps) {
  const [showLayouts, setShowLayouts] = useState(false);
  const [layouts, setLayouts] = useState<SavedLayout[]>([]);
  const [currentLayoutId, setCurrentLayoutId] = useState<string | null>(null);

  const refreshLayouts = useCallback(() => {
    setLayouts(listLayouts());
  }, []);

  useEffect(() => {
    if (showLayouts) refreshLayouts();
  }, [showLayouts, refreshLayouts]);

  // Close panel on outside click
  useEffect(() => {
    if (!showLayouts) return;
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.layouts-panel') && !target.closest('.btn-layouts')) {
        setShowLayouts(false);
      }
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [showLayouts]);

  const handleSave = () => {
    saveGarden(state);
    if (currentLayoutId) {
      saveLayout(currentLayoutId, state);
    }
    alert('Garden saved!');
  };

  const handleSaveAs = () => {
    const id = uuidv4();
    saveLayout(id, state);
    saveGarden(state);
    setCurrentLayoutId(id);
    refreshLayouts();
  };

  const handleLoad = (id: string) => {
    const loaded = loadLayout(id);
    if (loaded) {
      dispatch({ type: 'LOAD_GARDEN', payload: loaded });
      saveGarden(loaded);
      setCurrentLayoutId(id);
      setShowLayouts(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteLayout(id);
    if (currentLayoutId === id) setCurrentLayoutId(null);
    refreshLayouts();
  };

  const handleClear = () => {
    if (confirm('Clear the entire garden?')) {
      clearGarden();
      dispatch({ type: 'CLEAR_GARDEN' });
      setCurrentLayoutId(null);
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
        <div className="layouts-wrapper">
          <button
            className="btn-layouts"
            onClick={() => setShowLayouts((v) => !v)}
          >
            Layouts
          </button>
          {showLayouts && (
            <div className="layouts-panel">
              <div className="layouts-header">
                <span>Saved Layouts</span>
                <button className="btn-save-as" onClick={handleSaveAs}>
                  Save as new
                </button>
              </div>
              {layouts.length === 0 ? (
                <div className="layouts-empty">No saved layouts</div>
              ) : (
                <ul className="layouts-list">
                  {layouts.map((l) => (
                    <li
                      key={l.id}
                      className={l.id === currentLayoutId ? 'active' : ''}
                    >
                      <button
                        className="layout-load"
                        onClick={() => handleLoad(l.id)}
                      >
                        <span className="layout-name">{l.name}</span>
                        <span className="layout-date">
                          {new Date(l.savedAt).toLocaleDateString()}
                        </span>
                      </button>
                      <button
                        className="layout-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(l.id);
                        }}
                        title="Delete layout"
                      >
                        x
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <button onClick={onExport}>Export PNG</button>
        <button onClick={handleClear} className="btn-danger">
          Clear
        </button>
      </div>
    </div>
  );
}
