import { PLANT_CATALOG } from '../../constants';

export function PlantPalette() {
  return (
    <div className="palette-section">
      <h3>Plants</h3>
      {PLANT_CATALOG.map((plant) => (
        <div
          key={plant.id}
          className="palette-item plant-item"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('application/garden-plant', plant.id);
            e.dataTransfer.effectAllowed = 'copy';
          }}
        >
          <span className="plant-icon-preview">{plant.icon}</span>
          <span>{plant.name}</span>
        </div>
      ))}
    </div>
  );
}
