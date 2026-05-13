# KAM vs SCHNOZ — Frontend

React + Vite frontend for the AoE2 rivalry tracker. Served by the Express backend in `web/server.js` in production; in development, Vite proxies `/api` and `/static` to the Express server.

## Commands

```bash
npm run dev      # Vite dev server with HMR (requires Express server running on port 3001)
npm run build    # Production build → web/client/dist/
npm run lint     # ESLint
```

## Structure

| File | Purpose |
|---|---|
| `src/App.jsx` | Tab shell + Match History tab + ArcChart |
| `src/components/Stats.jsx` | Per-player civ and map breakdown |
| `src/components/Maps.jsx` | Map grid with expandable detail panel |
| `src/components/CivPicker.jsx` | Random civ picker (guarantees one never-played civ) |
| `src/components/MapPicker.jsx` | Random map picker |
| `src/components/FunStats.jsx` | Streaks, longest game, never-picked civs, age-up comparison |
| `src/components/Rules.jsx` | House rules |
| `src/components/ArcChart.jsx` | SVG cumulative-wins / win-rate chart |

## Styling

Each component has a co-located `.css` file. All color and font tokens are CSS custom properties defined in `src/index.css` under the Stone Keep dark theme (`--stone-*`). To change the palette, only `index.css` needs to be edited — everything else uses `var(--stone-*)`.

Heading font: **Cinzel** (loaded from Google Fonts in `index.css`).

## API

All data comes from three Express endpoints:

- `GET /api/matches` — full match history with civ names and age-up times
- `GET /api/stats` — per-player civ and map breakdown
- `GET /api/maps` — per-map win/loss counts
