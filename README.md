# Garden Planner

A drag-and-drop garden planning web app. Place garden bed shapes on a canvas, drop plants onto beds, resize and reposition beds, and save layouts to localStorage.

## Features

- **Drag-and-drop beds** — Drag rectangle or circle bed shapes from the sidebar onto the canvas
- **Move and resize** — Drag beds around the canvas; click to select and resize with handles
- **Plant placement** — Drag plants from a catalog of 10 types onto any bed; remove individual plants from the sidebar
- **Bed labels** — Select a bed and type a label in the sidebar; it displays centered above the bed on the canvas
- **Dimensions in feet** — Select a bed to edit its width/height in feet via the sidebar
- **Copy and paste** — Select a bed and use Ctrl+C / Ctrl+V or right-click context menu to duplicate it (including plants)
- **Right-click context menu** — Right-click a bed for Copy, Paste, and Delete options; right-click empty canvas to paste
- **Persistence** — Save your layout to localStorage; auto-loads on next visit
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
