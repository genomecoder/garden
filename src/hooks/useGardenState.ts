import { useReducer, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { GardenState, GardenAction, GardenBed } from '../types';
import { DEFAULT_BED_WIDTH, DEFAULT_BED_HEIGHT, DEFAULT_BED_RADIUS, DEFAULT_SHED_WIDTH, DEFAULT_SHED_HEIGHT, DEFAULT_FENCE_WIDTH, DEFAULT_FENCE_HEIGHT, DEFAULT_PATH_WIDTH, DEFAULT_PATH_HEIGHT, DEFAULT_POND_WIDTH, DEFAULT_POND_HEIGHT, DEFAULT_RAISED_BED_WIDTH, DEFAULT_RAISED_BED_HEIGHT, DEFAULT_COMPOST_WIDTH, DEFAULT_COMPOST_HEIGHT, DEFAULT_TREE_WIDTH, DEFAULT_TREE_HEIGHT, DEFAULT_BENCH_WIDTH, DEFAULT_BENCH_HEIGHT, DEFAULT_TRELLIS_WIDTH, DEFAULT_TRELLIS_HEIGHT, DEFAULT_RAIN_BARREL_WIDTH, DEFAULT_RAIN_BARREL_HEIGHT, DEFAULT_GREENHOUSE_WIDTH, DEFAULT_GREENHOUSE_HEIGHT, BED_FILL, SHED_FILL, FENCE_FILL, PATH_FILL, POND_FILL, RAISED_BED_FILL, COMPOST_FILL, TREE_FILL, BENCH_FILL, TRELLIS_FILL, RAIN_BARREL_FILL, GREENHOUSE_FILL } from '../constants';
import { loadGarden } from '../utils/storage';

const MAX_HISTORY = 50;

const initialState: GardenState = {
  name: 'My Garden',
  beds: [],
  customPlants: [],
  annotations: [],
  selectedBedId: null,
  sunDirection: 180,
  sunElevation: 45,
  showSunOverlay: false,
  moonDirection: 0,
  moonElevation: 30,
  showMoonOverlay: false,
};

// Actions that don't modify data and shouldn't create history entries
const TRANSIENT_ACTIONS = new Set(['SELECT_BED', 'UNDO', 'REDO', 'SET_SUN_DIRECTION', 'SET_SUN_ELEVATION', 'TOGGLE_SUN_OVERLAY', 'SET_MOON_DIRECTION', 'SET_MOON_ELEVATION', 'TOGGLE_MOON_OVERLAY']);

interface HistoryState {
  past: GardenState[];
  present: GardenState;
  future: GardenState[];
}

function gardenReducer(state: GardenState, action: GardenAction): GardenState {
  switch (action.type) {
    case 'ADD_BED': {
      const { shape, x, y } = action.payload;
      let width: number;
      let height: number;
      let color: string;
      switch (shape) {
        case 'circle':
          width = DEFAULT_BED_RADIUS * 2;
          height = DEFAULT_BED_RADIUS * 2;
          color = BED_FILL;
          break;
        case 'shed':
          width = DEFAULT_SHED_WIDTH;
          height = DEFAULT_SHED_HEIGHT;
          color = SHED_FILL;
          break;
        case 'fence':
          width = DEFAULT_FENCE_WIDTH;
          height = DEFAULT_FENCE_HEIGHT;
          color = FENCE_FILL;
          break;
        case 'path':
          width = DEFAULT_PATH_WIDTH;
          height = DEFAULT_PATH_HEIGHT;
          color = PATH_FILL;
          break;
        case 'pond':
          width = DEFAULT_POND_WIDTH;
          height = DEFAULT_POND_HEIGHT;
          color = POND_FILL;
          break;
        case 'raised-bed':
          width = DEFAULT_RAISED_BED_WIDTH;
          height = DEFAULT_RAISED_BED_HEIGHT;
          color = RAISED_BED_FILL;
          break;
        case 'compost':
          width = DEFAULT_COMPOST_WIDTH;
          height = DEFAULT_COMPOST_HEIGHT;
          color = COMPOST_FILL;
          break;
        case 'tree':
          width = DEFAULT_TREE_WIDTH;
          height = DEFAULT_TREE_HEIGHT;
          color = TREE_FILL;
          break;
        case 'bench':
          width = DEFAULT_BENCH_WIDTH;
          height = DEFAULT_BENCH_HEIGHT;
          color = BENCH_FILL;
          break;
        case 'trellis':
          width = DEFAULT_TRELLIS_WIDTH;
          height = DEFAULT_TRELLIS_HEIGHT;
          color = TRELLIS_FILL;
          break;
        case 'rain-barrel':
          width = DEFAULT_RAIN_BARREL_WIDTH;
          height = DEFAULT_RAIN_BARREL_HEIGHT;
          color = RAIN_BARREL_FILL;
          break;
        case 'greenhouse':
          width = DEFAULT_GREENHOUSE_WIDTH;
          height = DEFAULT_GREENHOUSE_HEIGHT;
          color = GREENHOUSE_FILL;
          break;
        default:
          width = DEFAULT_BED_WIDTH;
          height = DEFAULT_BED_HEIGHT;
          color = BED_FILL;
          break;
      }
      return {
        ...state,
        beds: [
          ...state.beds,
          {
            id: uuidv4(),
            shape,
            label: '',
            color,
            rotation: 0,
            locked: false,
            plantSpacing: 1,
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
    case 'COLOR_BED':
      return {
        ...state,
        beds: state.beds.map((b) =>
          b.id === action.payload.id
            ? { ...b, color: action.payload.color }
            : b
        ),
      };
    case 'ROTATE_BED':
      return {
        ...state,
        beds: state.beds.map((b) =>
          b.id === action.payload.id
            ? { ...b, rotation: action.payload.rotation }
            : b
        ),
      };
    case 'LOCK_BED':
      return {
        ...state,
        beds: state.beds.map((b) =>
          b.id === action.payload.id
            ? { ...b, locked: action.payload.locked }
            : b
        ),
      };
    case 'SET_PLANT_SPACING':
      return {
        ...state,
        beds: state.beds.map((b) =>
          b.id === action.payload.id
            ? { ...b, plantSpacing: action.payload.plantSpacing }
            : b
        ),
      };
    case 'PASTE_BED': {
      const src = action.payload.bed;
      const newBed = {
        ...src,
        id: uuidv4(),
        locked: false,
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
    case 'ADD_PLANT_TYPE':
      return {
        ...state,
        customPlants: [...state.customPlants, action.payload],
      };
    case 'REMOVE_PLANT_TYPE':
      return {
        ...state,
        customPlants: state.customPlants.filter((p) => p.id !== action.payload.id),
      };
    case 'ADD_ANNOTATION':
      return {
        ...state,
        annotations: [
          ...state.annotations,
          {
            id: uuidv4(),
            text: 'Note',
            x: action.payload.x,
            y: action.payload.y,
            color: '#2c3e50',
            fontSize: 14,
          },
        ],
      };
    case 'MOVE_ANNOTATION':
      return {
        ...state,
        annotations: state.annotations.map((a) =>
          a.id === action.payload.id
            ? { ...a, x: action.payload.x, y: action.payload.y }
            : a
        ),
      };
    case 'EDIT_ANNOTATION':
      return {
        ...state,
        annotations: state.annotations.map((a) =>
          a.id === action.payload.id
            ? { ...a, text: action.payload.text }
            : a
        ),
      };
    case 'UPDATE_ANNOTATION_STYLE':
      return {
        ...state,
        annotations: state.annotations.map((a) =>
          a.id === action.payload.id
            ? {
                ...a,
                ...(action.payload.color !== undefined && { color: action.payload.color }),
                ...(action.payload.fontSize !== undefined && { fontSize: action.payload.fontSize }),
              }
            : a
        ),
      };
    case 'DELETE_ANNOTATION':
      return {
        ...state,
        annotations: state.annotations.filter((a) => a.id !== action.payload.id),
      };
    case 'SET_SUN_DIRECTION':
      return { ...state, sunDirection: action.payload.sunDirection };
    case 'SET_SUN_ELEVATION':
      return { ...state, sunElevation: action.payload.sunElevation };
    case 'TOGGLE_SUN_OVERLAY':
      return { ...state, showSunOverlay: !state.showSunOverlay };
    case 'SET_MOON_DIRECTION':
      return { ...state, moonDirection: action.payload.moonDirection };
    case 'SET_MOON_ELEVATION':
      return { ...state, moonElevation: action.payload.moonElevation };
    case 'TOGGLE_MOON_OVERLAY':
      return { ...state, showMoonOverlay: !state.showMoonOverlay };
    case 'LOAD_GARDEN':
      return { ...action.payload, customPlants: action.payload.customPlants ?? [], annotations: action.payload.annotations ?? [], selectedBedId: null, sunDirection: action.payload.sunDirection ?? 180, sunElevation: action.payload.sunElevation ?? 45, showSunOverlay: action.payload.showSunOverlay ?? false, moonDirection: action.payload.moonDirection ?? 0, moonElevation: action.payload.moonElevation ?? 30, showMoonOverlay: action.payload.showMoonOverlay ?? false };
    case 'CLEAR_GARDEN':
      return { ...initialState, name: state.name, customPlants: state.customPlants };
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
        const bed = state.beds.find((b) => b.id === state.selectedBedId);
        if (bed && !bed.locked) {
          dispatch({ type: 'DELETE_BED', payload: { id: state.selectedBedId } });
        }
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
