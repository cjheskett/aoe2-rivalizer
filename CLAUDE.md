# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## The players

- **Kamarill** — aggressive playstyle, prefers strong meta civs, gets heated under pressure
- **Schnozberries** — fundamentally sound, favors economic builds, enjoys varied strategies and builds

## What this project is

A purpose-built AoE2 match tracker for exactly one rivalry: Kamarill vs Schnozberries. It is not designed to be generalized to other players or rivalries. It has two independent parts:

1. **`main.py`** — a Python script that scans the local AoE2 replay directory, parses `.aoe2record` files via the `mgz` library, and inserts new 1v1 matches into a PostgreSQL database.
2. **`web/`** — a Node.js/Express backend + React/Vite frontend served as a single app.

## Commands

### Python replay ingestion

```bash
DATABASE_URL="postgresql://..." python main.py
```

Requires `mgz` and `psycopg2` installed. The replay directory is hardcoded at the top of `main.py`.

### Frontend development

```bash
cd web/client
npm run dev      # Vite dev server (proxies API calls to the Express server)
npm run lint     # ESLint
npm run build    # Production build into web/client/dist/
```

### Backend

```bash
cd web
npm start        # node server.js — requires DATABASE_URL env var
```

### Deployment

```bash
./deploy.sh      # Packages, SCPs, and runs Docker on the remote server
```

Env vars for `deploy.sh`: `SERVER_USER`, `SERVER_HOST`, `DEPLOY_DIR`, `CONTAINER_NAME`, `IMAGE_NAME`, `HOST_PORT`. The app is also auto-deployed to Railway on push to `main`.

## Architecture

### Database

Single PostgreSQL table `match` with columns: `id`, `played_at`, `duration` (seconds), `kam_civ_id`, `schnoz_civ_id`, `winner` (1=Kamarill, 2=Schnozberries), `map`, `kam_feudal_time`, `kam_castle_time`, `kam_imperial_time`, `schnoz_feudal_time`, `schnoz_castle_time`, `schnoz_imperial_time` (age-up times in seconds, nullable).

Civilization IDs are AoE2 engine integers. The authoritative ID→name mapping lives in `web/server.js` (`CIV_NAMES`). `main.py` stores raw IDs; the server resolves names at query time.

### API

Three endpoints in `web/server.js` — all stats are computed in-memory from raw rows, not in SQL:

- `GET /api/matches` — full history, civ IDs resolved to names, age-up times included
- `GET /api/maps` — per-map win/loss counts aggregated in JS
- `GET /api/stats` — per-player breakdown by civ and map, plus average age-up times, all aggregated in JS

### Frontend

`web/client/src/App.jsx` is the tab shell. Each tab is its own component (`Stats.jsx`, `Maps.jsx`, `CivPicker.jsx`, `FunStats.jsx`, `Rules.jsx`). All data fetching goes through the `/api/*` endpoints. Static civ/map images are served from `web/static/` by Express.

Notable component details:
- `App.jsx` renders the Match History tab directly, including an `ArcChart.jsx` SVG line chart above the table.
- `Maps.jsx` fetches both `/api/maps` and `/api/matches` to power an inline per-map detail panel (avg duration, age-up times, civ breakdown, recent games). The detail panel is a full-width CSS Grid item (`grid-column: 1 / -1`) injected after the selected card.
- `CivPicker.jsx` fetches `/api/matches` to guarantee one of the three random picks is always a never-played civ.

In development, Vite proxies `/api` and `/static` to the Express server — see `web/client/vite.config.js`.
