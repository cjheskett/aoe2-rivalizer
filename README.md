# AoE2 Match Tracker

A web app for tracking the Age of Empires 2 rivalry between Kamarill and Schnozberries. It is purpose-built for this one matchup and not designed to be generalized. The backend is an Express API backed by a PostgreSQL database on Railway; the frontend is a React/Vite app served by the same Express server.

---

## How it works

`main.py` scans the AoE2 replay directory for `.aoe2record` files and syncs new matches into the database.

For each multiplayer replay file it finds, it:

1. Parses the timestamp from the filename and skips any match already in the database
2. Uses the [`mgz`](https://github.com/happyleavesaoc/aoc-mgz) library to read the replay and extract players, civilizations, winner, map, and match duration
3. Also parses each replay with `mgz.model.parse_match` to extract per-player Feudal, Castle, and Imperial age-up times
4. Skips replays that aren't a 1v1 between Kamarill and Schnozberries, or are under 5 minutes (forfeit/lobby accidents)
5. Inserts the match into the database

Run it whenever new replays have been recorded:

```bash
DATABASE_URL="postgresql://..." python main.py
```

---

## Server

The backend is a Node.js/Express server (`web/server.js`) that:

- Connects to the Railway PostgreSQL database via the `DATABASE_URL` environment variable
- Exposes three REST API endpoints:
  - `GET /api/matches` — full match history, ordered by date, including per-player age-up times
  - `GET /api/maps` — per-map win/loss breakdown
  - `GET /api/stats` — per-player stats broken down by civilization and map, including average age-up times
- Serves static civ and map images from `web/static/`
- Serves the built React client for all other routes

---

## Client

The frontend is a React app (`web/client/`) built with Vite. It has six tabs:

- **Match History** — full table of every recorded match. The scoreboard shows the all-time series record and win percentages. A streak banner appears when either player is on a winning run of 2 or more games. Hovering a row shows a tooltip with that match's age-up times for both players.
- **Stats** — per-player win rates broken down by civilization and map, plus average Feudal, Castle, and Imperial age-up times per player.
- **Maps** — map cards showing games played and win records per map.
- **Fun Stats** — rivalry highlights including longest/shortest game, all-time best streak, favorite map, go-to civs, clutch civs, average game length, civ diversity, most improved form, favorite day to play, average age-up times comparison, and a full list of never-picked civilizations.
- **Civ Picker** — randomly picks three civilizations for each player to choose from, plus a map picker.
- **Rules** — house rules reference.

In production the client is built with `vite build` and served as static files by the Express server. For local development, run the Vite dev server separately:

```bash
cd web/client
npm run dev
```

---

## Deployment

The app is hosted on [Railway](https://railway.app). Deployments trigger automatically when changes land on `main`.

`main` is a protected branch — direct pushes are not allowed. The workflow is:

1. Work on the `test` branch (or a feature branch)
2. Push to `test` — this triggers the Docker publish workflow so changes can be validated
3. Open a pull request from `test` → `main`
4. Merge the PR to deploy to production
