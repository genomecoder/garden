import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { PlantType, GardenAction } from '../../types';
import { PLANT_CATALOG } from '../../constants';

interface PlantPaletteProps {
  customPlants: PlantType[];
  dispatch: React.Dispatch<GardenAction>;
}

function resizeImage(dataUrl: string, size: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}

export function PlantPalette({ customPlants, dispatch }: PlantPaletteProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('#27ae60');
  const [iconImage, setIconImage] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allPlants = [...PLANT_CATALOG, ...customPlants];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const resized = await resizeImage(reader.result as string, 32);
      setIconImage(resized);
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch({
      type: 'ADD_PLANT_TYPE',
      payload: {
        id: uuidv4(),
        name: trimmed,
        icon: icon || trimmed[0],
        color,
        ...(iconImage ? { iconImage } : {}),
      },
    });
    setName('');
    setIcon('');
    setColor('#27ae60');
    setIconImage(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowForm(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="palette-section">
      <h3>Plants</h3>
      {allPlants.map((plant) => {
        const isCustom = customPlants.some((p) => p.id === plant.id);
        return (
          <div
            key={plant.id}
            className="palette-item plant-item"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/garden-plant', plant.id);
              e.dataTransfer.effectAllowed = 'copy';
            }}
          >
            {plant.iconImage ? (
              <img
                src={plant.iconImage}
                alt={plant.name}
                className="plant-icon-img-preview"
              />
            ) : (
              <span className="plant-icon-preview">{plant.icon}</span>
            )}
            <span className="plant-name-text">{plant.name}</span>
            {isCustom && (
              <button
                className="btn-remove-plant-type"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: 'REMOVE_PLANT_TYPE', payload: { id: plant.id } });
                }}
                title="Remove plant type"
              >
                x
              </button>
            )}
          </div>
        );
      })}
      {showForm ? (
        <div className="add-plant-form">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <input
            type="text"
            placeholder="Icon (emoji)"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            onKeyDown={handleKeyDown}
            className="add-plant-icon-input"
          />
          <div className="add-plant-upload-row">
            <label className="btn-upload-icon">
              Upload Icon
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                hidden
              />
            </label>
            {iconImage && (
              <img src={iconImage} alt="preview" className="upload-icon-preview" />
            )}
          </div>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="add-plant-color"
          />
          <div className="add-plant-buttons">
            <button className="btn-add-confirm" onClick={handleAdd}>Add</button>
            <button className="btn-add-cancel" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="btn-add-plant-type" onClick={() => setShowForm(true)}>
          + Add Plant
        </button>
      )}
    </div>
  );
}
