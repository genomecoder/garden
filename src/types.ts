export type BedShape = 'rectangle' | 'circle';

export interface GardenBed {
  id: string;
  shape: BedShape;
  x: number;
  y: number;
  width: number;
  height: number;
  plants: PlantInstance[];
}

export interface PlantType {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface PlantInstance {
  id: string;
  plantTypeId: string;
}

export interface GardenState {
  name: string;
  beds: GardenBed[];
  selectedBedId: string | null;
}

export type GardenAction =
  | { type: 'ADD_BED'; payload: { shape: BedShape; x: number; y: number } }
  | { type: 'MOVE_BED'; payload: { id: string; x: number; y: number } }
  | { type: 'RESIZE_BED'; payload: { id: string; width: number; height: number } }
  | { type: 'SELECT_BED'; payload: { id: string | null } }
  | { type: 'DELETE_BED'; payload: { id: string } }
  | { type: 'ADD_PLANT'; payload: { bedId: string; plantTypeId: string } }
  | { type: 'REMOVE_PLANT'; payload: { bedId: string; plantId: string } }
  | { type: 'SET_NAME'; payload: { name: string } }
  | { type: 'PASTE_BED'; payload: { bed: GardenBed } }
  | { type: 'LOAD_GARDEN'; payload: GardenState }
  | { type: 'CLEAR_GARDEN' };
