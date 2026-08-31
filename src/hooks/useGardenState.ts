import { useReducer, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { GardenState, GardenAction, GardenBed } from '../types';
import { DEFAULT_BED_WIDTH, DEFAULT_BED_HEIGHT, DEFAULT_BED_RADIUS } from '../constants';
import { loadGarden } from '../utils/storage';

const initialState: GardenState = {
  name: 'My Garden',
  beds: [],
  selectedBedId: null,
};

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

export function useGardenState() {
  const [state, dispatch] = useReducer(gardenReducer, initialState, () => {
    const saved = loadGarden();
    return saved ?? initialState;
  });

  const clipboardRef = useRef<GardenBed | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedBedId) {
        dispatch({ type: 'DELETE_BED', payload: { id: state.selectedBedId } });
        return;
      }

      const mod = e.ctrlKey || e.metaKey;
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
  }, [state.selectedBedId, state.beds]);

  return { state, dispatch, clipboardRef };
}
