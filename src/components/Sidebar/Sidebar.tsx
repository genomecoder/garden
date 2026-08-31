import type { GardenState, GardenAction } from '../../types';
import { BedPalette } from './BedPalette';
import { PlantPalette } from './PlantPalette';
import { BedDimensions } from './BedDimensions';
import './Sidebar.css';

interface SidebarProps {
  state: GardenState;
  dispatch: React.Dispatch<GardenAction>;
}

export function Sidebar({ state, dispatch }: SidebarProps) {
  const selectedBed = state.beds.find((b) => b.id === state.selectedBedId);

  return (
    <aside className="sidebar">
      {selectedBed && (
        <BedDimensions bed={selectedBed} dispatch={dispatch} />
      )}
      <BedPalette />
      <PlantPalette />
    </aside>
  );
}
