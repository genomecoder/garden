import { useRef, useCallback } from 'react';
import type { GardenAction } from '../../types';
import './SunControls.css';

interface SunControlsProps {
  sunDirection: number;
  sunElevation: number;
  dispatch: React.Dispatch<GardenAction>;
}

function directionLabel(deg: number): string {
  const normalized = ((deg % 360) + 360) % 360;
  if (normalized >= 337.5 || normalized < 22.5) return 'N';
  if (normalized < 67.5) return 'NE';
  if (normalized < 112.5) return 'E';
  if (normalized < 157.5) return 'SE';
  if (normalized < 202.5) return 'S';
  if (normalized < 247.5) return 'SW';
  if (normalized < 292.5) return 'W';
  return 'NW';
}

export function SunControls({ sunDirection, sunElevation, dispatch }: SunControlsProps) {
  const compassRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateDirection = useCallback(
    (clientX: number, clientY: number) => {
      const el = compassRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      // atan2 gives angle from positive x-axis; convert so 0=North (up)
      let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
      angle = ((angle % 360) + 360) % 360;
      angle = Math.round(angle);
      dispatch({ type: 'SET_SUN_DIRECTION', payload: { sunDirection: angle } });
    },
    [dispatch]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      draggingRef.current = true;
      updateDirection(e.clientX, e.clientY);

      const onMove = (ev: MouseEvent) => {
        if (draggingRef.current) updateDirection(ev.clientX, ev.clientY);
      };
      const onUp = () => {
        draggingRef.current = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [updateDirection]
  );

  const needleRotation = sunDirection;
  const label = directionLabel(sunDirection);

  return (
    <div className="sun-controls">
      <h3>Sun Position</h3>

      <div className="compass-wrapper">
        <div
          ref={compassRef}
          className="compass-dial"
          onMouseDown={handleMouseDown}
        >
          <span className="compass-label compass-n">N</span>
          <span className="compass-label compass-s">S</span>
          <span className="compass-label compass-e">E</span>
          <span className="compass-label compass-w">W</span>
          <div
            className="compass-needle"
            style={{ transform: `rotate(${needleRotation}deg)` }}
          />
          <div className="compass-center" />
        </div>
        <div className="compass-info">
          {label} ({sunDirection}&deg;)
        </div>
      </div>

      <div className="elevation-control">
        <label>
          Elevation: {sunElevation}&deg;
        </label>
        <input
          type="range"
          min={15}
          max={75}
          value={sunElevation}
          onChange={(e) =>
            dispatch({
              type: 'SET_SUN_ELEVATION',
              payload: { sunElevation: Number(e.target.value) },
            })
          }
        />
      </div>
    </div>
  );
}
