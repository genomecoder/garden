import type { BedShape } from '../../types';

const BED_OPTIONS: { shape: BedShape; label: string }[] = [
  { shape: 'rectangle', label: 'Rectangle Bed' },
  { shape: 'circle', label: 'Circle Bed' },
  { shape: 'triangle', label: 'Triangle Bed' },
  { shape: 'l-shape', label: 'L-Shape Bed' },
  { shape: 'shed', label: 'Shed' },
  { shape: 'fence', label: 'Fence' },
  { shape: 'path', label: 'Path / Walkway' },
  { shape: 'pond', label: 'Pond / Fountain' },
];

export function BedPalette() {
  return (
    <div className="palette-section">
      <h3>Garden Beds</h3>
      {BED_OPTIONS.map(({ shape, label }) => (
        <div
          key={shape}
          className="palette-item bed-item"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('application/garden-bed', shape);
            e.dataTransfer.effectAllowed = 'copy';
          }}
        >
          <span className={`bed-preview ${shape}`} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
