import { useState, useEffect } from 'react';
import type { GardenBed, GardenAction } from '../../types';
import { PIXELS_PER_FOOT, PLANT_CATALOG, BED_COLORS } from '../../constants';

interface BedDimensionsProps {
  bed: GardenBed;
  dispatch: React.Dispatch<GardenAction>;
}

function pxToFeet(px: number): string {
  return (px / PIXELS_PER_FOOT).toFixed(1);
}

function feetToPx(feet: string): number {
  const val = parseFloat(feet);
  if (isNaN(val) || val <= 0) return 0;
  return val * PIXELS_PER_FOOT;
}

export function BedDimensions({ bed, dispatch }: BedDimensionsProps) {
  const [widthFt, setWidthFt] = useState(pxToFeet(bed.width));
  const [heightFt, setHeightFt] = useState(pxToFeet(bed.height));

  useEffect(() => {
    setWidthFt(pxToFeet(bed.width));
    setHeightFt(pxToFeet(bed.height));
  }, [bed.id, bed.width, bed.height]);

  const applyWidth = () => {
    const px = feetToPx(widthFt);
    if (px >= 40) {
      dispatch({ type: 'RESIZE_BED', payload: { id: bed.id, width: px, height: bed.height } });
    } else {
      setWidthFt(pxToFeet(bed.width));
    }
  };

  const applyHeight = () => {
    const px = feetToPx(heightFt);
    if (px >= 40) {
      dispatch({ type: 'RESIZE_BED', payload: { id: bed.id, width: bed.width, height: px } });
    } else {
      setHeightFt(pxToFeet(bed.height));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, apply: () => void) => {
    if (e.key === 'Enter') apply();
  };

  const isCircle = bed.shape === 'circle';

  return (
    <div className="palette-section bed-dimensions">
      <h3>Selected Bed</h3>
      <div className="dim-row">
        <label>Label</label>
        <input
          className="dim-label-input"
          type="text"
          placeholder="Untitled"
          value={bed.label}
          onChange={(e) =>
            dispatch({ type: 'RENAME_BED', payload: { id: bed.id, label: e.target.value } })
          }
        />
      </div>
      <div className="dim-row">
        <label>{isCircle ? 'Diameter X' : 'Width'}</label>
        <div className="dim-input-wrap">
          <input
            type="number"
            min="2"
            step="0.5"
            value={widthFt}
            onChange={(e) => setWidthFt(e.target.value)}
            onBlur={applyWidth}
            onKeyDown={(e) => handleKeyDown(e, applyWidth)}
          />
          <span className="dim-unit">ft</span>
        </div>
      </div>
      <div className="dim-row">
        <label>{isCircle ? 'Diameter Y' : 'Height'}</label>
        <div className="dim-input-wrap">
          <input
            type="number"
            min="2"
            step="0.5"
            value={heightFt}
            onChange={(e) => setHeightFt(e.target.value)}
            onBlur={applyHeight}
            onKeyDown={(e) => handleKeyDown(e, applyHeight)}
          />
          <span className="dim-unit">ft</span>
        </div>
      </div>
      <div className="dim-row">
        <label>Rotation</label>
        <div className="dim-input-wrap">
          <input
            type="number"
            min="0"
            max="360"
            step="1"
            value={Math.round(bed.rotation)}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) {
                dispatch({ type: 'ROTATE_BED', payload: { id: bed.id, rotation: val % 360 } });
              }
            }}
          />
          <span className="dim-unit">deg</span>
        </div>
      </div>
      <div className="dim-row color-row">
        <label>Color</label>
        <div className="color-swatches">
          {BED_COLORS.map((c) => (
            <button
              key={c}
              className={`color-swatch ${bed.color === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() =>
                dispatch({ type: 'COLOR_BED', payload: { id: bed.id, color: c } })
              }
            />
          ))}
          <input
            type="color"
            className="color-custom"
            value={bed.color}
            onChange={(e) =>
              dispatch({ type: 'COLOR_BED', payload: { id: bed.id, color: e.target.value } })
            }
            title="Custom color"
          />
        </div>
      </div>
      {bed.plants.length > 0 && (
        <div className="bed-plants-list">
          <h3>Plants ({bed.plants.length})</h3>
          {bed.plants.map((plant) => {
            const info = PLANT_CATALOG.find((p) => p.id === plant.plantTypeId);
            return (
              <div key={plant.id} className="bed-plant-row">
                <span className="bed-plant-name">
                  {info?.icon} {info?.name ?? plant.plantTypeId}
                </span>
                <button
                  className="btn-remove-plant"
                  onClick={() =>
                    dispatch({
                      type: 'REMOVE_PLANT',
                      payload: { bedId: bed.id, plantId: plant.id },
                    })
                  }
                  title="Remove plant"
                >
                  x
                </button>
              </div>
            );
          })}
        </div>
      )}
      <div className="bed-actions">
        <button
          className="btn-duplicate-bed"
          onClick={() => dispatch({ type: 'PASTE_BED', payload: { bed } })}
        >
          Duplicate
        </button>
        <button
          className={`btn-lock-bed ${bed.locked ? 'locked' : ''}`}
          onClick={() =>
            dispatch({ type: 'LOCK_BED', payload: { id: bed.id, locked: !bed.locked } })
          }
        >
          {bed.locked ? 'Unlock' : 'Lock'}
        </button>
        <button
          className="btn-delete-bed"
          onClick={() => dispatch({ type: 'DELETE_BED', payload: { id: bed.id } })}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
