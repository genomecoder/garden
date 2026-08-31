import { useState, useEffect } from 'react';
import type { GardenBed, GardenAction } from '../../types';
import { PIXELS_PER_FOOT } from '../../constants';

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
      <h3>Bed Dimensions (ft)</h3>
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
      <button
        className="btn-delete-bed"
        onClick={() => dispatch({ type: 'DELETE_BED', payload: { id: bed.id } })}
      >
        Delete Bed
      </button>
    </div>
  );
}
