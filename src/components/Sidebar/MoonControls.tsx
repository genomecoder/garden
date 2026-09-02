import { useRef, useCallback } from 'react';
import type { GardenAction } from '../../types';
import './MoonControls.css';

interface MoonControlsProps {
  moonDirection: number;
  moonElevation: number;
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

export function MoonControls({ moonDirection, moonElevation, dispatch }: MoonControlsProps) {
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
      let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
      angle = ((angle % 360) + 360) % 360;
      angle = Math.round(angle);
      dispatch({ type: 'SET_MOON_DIRECTION', payload: { moonDirection: angle } });
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

  const label = directionLabel(moonDirection);

  return (
    <div className="moon-controls">
      <h3>Moon Position</h3>

      <div className="moon-compass-wrapper">
        <div
          ref={compassRef}
          className="moon-compass-dial"
          onMouseDown={handleMouseDown}
        >
          <span className="moon-compass-label moon-compass-n">N</span>
          <span className="moon-compass-label moon-compass-s">S</span>
          <span className="moon-compass-label moon-compass-e">E</span>
          <span className="moon-compass-label moon-compass-w">W</span>
          <div
            className="moon-compass-needle"
            style={{ transform: `rotate(${moonDirection}deg)` }}
          />
          <div className="moon-compass-center" />
        </div>
        <div className="moon-compass-info">
          {label} ({moonDirection}&deg;)
        </div>
      </div>

      <div className="moon-elevation-control">
        <label>
          Elevation: {moonElevation}&deg;
        </label>
        <input
          type="range"
          min={15}
          max={75}
          value={moonElevation}
          onChange={(e) =>
            dispatch({
              type: 'SET_MOON_ELEVATION',
              payload: { moonElevation: Number(e.target.value) },
            })
          }
        />
      </div>
    </div>
  );
}
