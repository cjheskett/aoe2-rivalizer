# AoE2 Match Tracker

A web app for tracking Age of Empires 2 match history between two players. The backend is an Express API backed by a PostgreSQL database on Railway; the frontend is a React/Vite app served by the same Express server.

---

## How it works

`main.py` scans the AoE2 replay directory for `.aoe2record` files and syncs new matches into the database.

For each multiplayer replay file it finds, it:

1. Parses the timestamp from the filename and skips any match already in the database
2. Uses the [`mgz`](https://github.com/happyleavesaoc/aoc-mgz) library to read the replay and extract players, civilizations, winner, map, and match duration
3. Skips replays that aren't a 1v1 between Kamarill and Schnozberries, or are under 5 minutes (forfeit/lobby accidents)
4. Inserts the match into the database

Run it whenever new replays have been recorded:

```bash
DATABASE_URL="postgresql://..." python main.py
```

---

## Server

The backend is a Node.js/Express server (`web/server.js`) that:

- Connects to the Railway PostgreSQL database via the `DATABASE_URL` environment variable
- Exposes three REST API endpoints:
  - `GET /api/matches` — full match history, ordered by date
  - `GET /api/maps` — per-map win/loss breakdown
  - `GET /api/stats` — per-player stats broken down by civilization and map
- Serves static civ and map images from `web/static/`
- Serves the built React client for all other routes

---

## Client

The frontend is a React app (`web/client/`) built with Vite. It has five tabs:

- **Match History** — a full table of every recorded match
- **Stats** — per-player win rates broken down by civilization and map
- **Maps** — map cards showing games played and win records
- **Civ Picker** — randomly picks three civilizations for each player to choose from
- **Rules** — house rules reference

In production the client is built with `vite build` and served as static files by the Express server. For local development, run the Vite dev server separately:

```bash
cd web/client
npm run dev
```

---

## Deployment

The app is hosted on [Railway](https://railway.app). Deployments are automatic — just push to `main`.

```bash
git push origin main
```
