# Garden Planner

A drag-and-drop garden planning web app. Place garden bed shapes on a canvas, drop plants onto beds, resize and reposition beds, and save layouts to localStorage.

## Features

- **Drag-and-drop beds** — Drag rectangle or circle bed shapes from the sidebar onto the canvas
- **Move and resize** — Drag beds around the canvas; click to select and resize with handles
- **Plant placement** — Drag plants from the catalog onto any bed; remove individual plants from the sidebar
- **Custom plants** — Add your own plant types with a name, emoji icon, and color via the sidebar; remove custom plants anytime
- **Bed labels** — Select a bed and type a label in the sidebar; it displays centered above the bed on the canvas
- **Bed colors** — Choose from 10 preset colors or pick a custom color for each bed via the sidebar
- **Bed rotation** — Rotate beds by dragging the transformer handle on the canvas or entering a degree value in the sidebar
- **Lock beds** — Lock a bed in place via the sidebar to prevent moving, resizing, rotating, or deleting it
- **Plant spacing** — Set the spacing (in feet) between plants within each bed via the sidebar
- **Dimensions in feet** — Select a bed to edit its width/height in feet via the sidebar
- **Duplicate bed** — Duplicate the selected bed (including plants) via the sidebar button, Ctrl+C / Ctrl+V, or right-click context menu
- **Right-click context menu** — Right-click a bed for Copy, Paste, and Delete options; right-click empty canvas to paste
- **Undo / Redo** — Undo and redo changes via toolbar buttons or Ctrl+Z / Ctrl+Y (up to 50 steps)
- **Export as PNG** — Export the canvas as a high-resolution PNG image via the toolbar
- **Multiple layouts** — Save multiple garden layouts via the Layouts dropdown; load, switch between, or delete saved layouts
- **Persistence** — Save your layout to localStorage; auto-loads on next visit
- **Zoom and pan** — Scroll to zoom (0.1x–5x), middle-click or Space+drag to pan; click the zoom percentage to reset view
- **Snap to grid** — Beds snap to the nearest 1-foot grid line when dragged; toggle via the Snap button (on by default)
- **Scale grid** — 1 ft grid lines with 5 ft major lines, labels, and a scale indicator

## Tech Stack

- React 18 + TypeScript + Vite
- [react-konva](https://github.com/konvajs/react-konva) / [Konva](https://konvajs.org/) for canvas rendering
- Plain CSS

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Structure

```
src/
  main.tsx                          # Entry point
  App.tsx / App.css                 # Root layout (toolbar, sidebar, canvas)
  types.ts                          # TypeScript interfaces
  constants.ts                      # Plant catalog, default dimensions, colors
  hooks/
    useGardenState.ts               # useReducer state management + keyboard shortcuts
  utils/
    geometry.ts                     # Hit testing and plant grid layout
    storage.ts                      # localStorage save/load/clear
  components/
    Toolbar/                        # Save/Clear buttons, garden name input
    Sidebar/                        # Bed palette, plant palette, dimension editor
    Canvas/                         # Konva stage, bed shapes, plant icons, transformer
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Delete / Backspace | Delete selected bed |
| Ctrl+C | Copy selected bed |
| Ctrl+V | Paste copied bed |
| Ctrl+Z | Undo |
| Ctrl+Y / Ctrl+Shift+Z | Redo |
| Space + drag | Pan canvas |
| Middle mouse + drag | Pan canvas |
| Scroll wheel | Zoom in/out |
