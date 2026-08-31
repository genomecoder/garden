import { useReducer, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { GardenState, GardenAction, GardenBed } from '../types';
import { DEFAULT_BED_WIDTH, DEFAULT_BED_HEIGHT, DEFAULT_BED_RADIUS } from '../constants';
import { loadGarden } from '../utils/storage';

const MAX_HISTORY = 50;

const initialState: GardenState = {
  name: 'My Garden',
  beds: [],
  selectedBedId: null,
};

// Actions that don't modify data and shouldn't create history entries
const TRANSIENT_ACTIONS = new Set(['SELECT_BED', 'UNDO', 'REDO']);

interface HistoryState {
  past: GardenState[];
  present: GardenState;
  future: GardenState[];
}

function gardenReducer(state: GardenState, action: GardenAction): GardenState {
  switch (action.type) {
    case 'ADD_BED': {
      const { shape, x, y } = action.payload;
      const width = shape === 'circle' ? DEFAULT_BED_RADIUS * 2 : DEFAULT_BED_WIDTH;
      const height = shape === 'circle' ? DEFAULT_BED_RADIUS * 2 : DEFAULT_BED_HEIGHT;
      return {
        ...state,
        beds: [
          ...state.beds,
          {
            id: uuidv4(),
            shape,
            label: '',
            x: x - width / 2,
            y: y - height / 2,
            width,
            height,
            plants: [],
          },
        ],
      };
    }
    case 'MOVE_BED':
      return {
        ...state,
        beds: state.beds.map((b) =>
          b.id === action.payload.id
            ? { ...b, x: action.payload.x, y: action.payload.y }
            : b
        ),
      };
    case 'RESIZE_BED':
      return {
        ...state,
        beds: state.beds.map((b) =>
          b.id === action.payload.id
            ? { ...b, width: action.payload.width, height: action.payload.height }
            : b
        ),
      };
    case 'SELECT_BED':
      return { ...state, selectedBedId: action.payload.id };
    case 'DELETE_BED':
      return {
        ...state,
        beds: state.beds.filter((b) => b.id !== action.payload.id),
        selectedBedId:
          state.selectedBedId === action.payload.id ? null : state.selectedBedId,
      };
    case 'ADD_PLANT': {
      const { bedId, plantTypeId } = action.payload;
      return {
        ...state,
        beds: state.beds.map((b) =>
          b.id === bedId
            ? { ...b, plants: [...b.plants, { id: uuidv4(), plantTypeId }] }
            : b
        ),
      };
    }
    case 'REMOVE_PLANT': {
      const { bedId, plantId } = action.payload;
      return {
        ...state,
        beds: state.beds.map((b) =>
          b.id === bedId
            ? { ...b, plants: b.plants.filter((p) => p.id !== plantId) }
            : b
        ),
      };
    }
    case 'RENAME_BED':
      return {
        ...state,
        beds: state.beds.map((b) =>
          b.id === action.payload.id
            ? { ...b, label: action.payload.label }
            : b
        ),
      };
    case 'PASTE_BED': {
      const src = action.payload.bed;
      const newBed = {
        ...src,
        id: uuidv4(),
        x: src.x + 30,
        y: src.y + 30,
        plants: src.plants.map((p) => ({ ...p, id: uuidv4() })),
      };
      return {
        ...state,
        beds: [...state.beds, newBed],
        selectedBedId: newBed.id,
      };
    }
    case 'SET_NAME':
      return { ...state, name: action.payload.name };
    case 'LOAD_GARDEN':
      return { ...action.payload, selectedBedId: null };
    case 'CLEAR_GARDEN':
      return { ...initialState, name: state.name };
    default:
      return state;
  }
}

function historyReducer(
  histState: HistoryState,
  action: GardenAction
): HistoryState {
  if (action.type === 'UNDO') {
    if (histState.past.length === 0) return histState;
    const previous = histState.past[histState.past.length - 1];
    return {
      past: histState.past.slice(0, -1),
      present: { ...previous, selectedBedId: histState.present.selectedBedId },
      future: [histState.present, ...histState.future],
    };
  }

  if (action.type === 'REDO') {
    if (histState.future.length === 0) return histState;
    const next = histState.future[0];
    return {
      past: [...histState.past, histState.present],
      present: { ...next, selectedBedId: histState.present.selectedBedId },
      future: histState.future.slice(1),
    };
  }

  const newPresent = gardenReducer(histState.present, action);

  if (newPresent === histState.present) return histState;

  // Transient actions don't create history entries
  if (TRANSIENT_ACTIONS.has(action.type)) {
    return { ...histState, present: newPresent };
  }

  // LOAD_GARDEN and CLEAR_GARDEN reset history
  if (action.type === 'LOAD_GARDEN' || action.type === 'CLEAR_GARDEN') {
    return { past: [], present: newPresent, future: [] };
  }

  return {
    past: [...histState.past.slice(-MAX_HISTORY + 1), histState.present],
    present: newPresent,
    future: [],
  };
}

export function useGardenState() {
  const [histState, histDispatch] = useReducer(
    historyReducer,
    undefined,
    (): HistoryState => {
      const saved = loadGarden();
      return { past: [], present: saved ?? initialState, future: [] };
    }
  );

  const state = histState.present;
  const canUndo = histState.past.length > 0;
  const canRedo = histState.future.length > 0;

  const dispatch = useCallback((action: GardenAction) => {
    histDispatch(action);
  }, []);

  const undo = useCallback(() => {
    histDispatch({ type: 'UNDO' } as GardenAction);
  }, []);

  const redo = useCallback(() => {
    histDispatch({ type: 'REDO' } as GardenAction);
  }, []);

  const clipboardRef = useRef<GardenBed | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedBedId) {
        dispatch({ type: 'DELETE_BED', payload: { id: state.selectedBedId } });
        return;
      }

      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && e.key === 'c' && state.selectedBedId) {
        const bed = state.beds.find((b) => b.id === state.selectedBedId);
        if (bed) clipboardRef.current = bed;
      }
      if (mod && e.key === 'v' && clipboardRef.current) {
        dispatch({ type: 'PASTE_BED', payload: { bed: clipboardRef.current } });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedBedId, state.beds, dispatch, undo, redo]);

  return { state, dispatch, clipboardRef, undo, redo, canUndo, canRedo };
}
