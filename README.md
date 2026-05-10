# AoE2 Match Tracker

A web app for tracking Age of Empires 2 match history between two players. The backend is an Express API reading from a SQLite database; the frontend is a React/Vite app served by the same Express server.

---

## How it works

`main.py` scans the AoE2 replay directory for `.aoe2record` files and builds the SQLite database that powers the web app.

For each multiplayer replay file it finds, it:

1. Parses the date and time from the filename and skips any match already in the database
2. Uses the [`mgz`](https://github.com/happyleavesaoc/aoc-mgz) library to read the replay and extract players, civilizations, winner, map, and match duration
3. Skips replays that aren't a 1v1 between Kamarill and Schnozberries, or are under 5 minutes (forfeit/lobby accidents)
4. Inserts the match into `match_history.db`

Run it whenever new replays have been recorded:

```bash
python main.py
```

Then push the updated database to the server:

```bash
scp match_history.db user@your-server:/opt/aoe2/match_history.db
```

---

## Deployment

The app is hosted on [Railway](https://railway.app). Deployments are automatic — just push to `main`.

```bash
git push origin main
```
