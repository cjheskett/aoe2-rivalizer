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

## Deployment

The app is hosted on [Railway](https://railway.app). Deployments are automatic — just push to `main`.

```bash
git push origin main
```
