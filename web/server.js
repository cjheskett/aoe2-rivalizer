const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use('/static', express.static(path.join(__dirname, 'static')));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CIV_NAMES = {
  1: 'Britons', 2: 'Franks', 3: 'Goths', 4: 'Teutons', 5: 'Japanese',
  6: 'Chinese', 7: 'Byzantines', 8: 'Persians', 9: 'Saracens', 10: 'Turks',
  11: 'Vikings', 12: 'Mongols', 13: 'Celts', 14: 'Spanish', 15: 'Aztecs',
  16: 'Maya', 17: 'Huns', 18: 'Koreans', 19: 'Italians', 20: 'Hindustanis',
  21: 'Incas', 22: 'Magyars', 23: 'Slavs', 24: 'Portuguese', 25: 'Ethiopians',
  26: 'Malians', 27: 'Berbers', 28: 'Khmer', 29: 'Malay', 30: 'Burmese',
  31: 'Vietnamese', 32: 'Bulgarians', 33: 'Tatars', 34: 'Cumans', 35: 'Lithuanians',
  36: 'Burgundians', 37: 'Sicilians', 38: 'Poles', 39: 'Bohemians', 40: 'Dravidians',
  41: 'Bengalis', 42: 'Gurjaras', 43: 'Romans', 44: 'Armenians', 45: 'Georgians',
  46: 'Achaemenids', 47: 'Athenians', 48: 'Spartans', 49: 'Shu', 50: 'Wu',
  51: 'Wei', 52: 'Jurchens', 53: 'Khitans', 54: 'Macedonians', 55: 'Thracians',
  56: 'Puru', 57: 'Muisca', 58: 'Mapuche', 59: 'Tupi',
};

function civName(id) {
  return CIV_NAMES[id] ?? `Unknown (${id})`;
}

app.get('/api/matches', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM match ORDER BY played_at DESC');

  const matches = rows.map(r => ({
    id: r.id,
    played_at: r.played_at,
    duration: r.duration,
    kam_civ: civName(r.kam_civ_id),
    schnoz_civ: civName(r.schnoz_civ_id),
    winner: r.winner === 1 ? 'Kamarill' : 'Schnozberries',
    map: r.map ?? null,
  }));

  res.json(matches);
});

app.get('/api/maps', async (_req, res) => {
  const { rows } = await pool.query('SELECT map, winner FROM match WHERE map IS NOT NULL');

  const maps = {};
  for (const r of rows) {
    if (!maps[r.map]) maps[r.map] = { played: 0, kamWins: 0, schnozWins: 0 };
    maps[r.map].played++;
    if (r.winner === 1) maps[r.map].kamWins++;
    else maps[r.map].schnozWins++;
  }

  const result = Object.entries(maps)
    .map(([name, s]) => ({ name, ...s }))
    .sort((a, b) => b.played - a.played);

  res.json(result);
});

app.get('/api/stats', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM match');

  const players = {
    Kamarill:      { wins: 0, losses: 0, civs: {}, maps: {} },
    Schnozberries: { wins: 0, losses: 0, civs: {}, maps: {} },
  };

  function tally(player, civId, map, won) {
    const civ = civName(civId);
    if (!player.civs[civ]) player.civs[civ] = { played: 0, wins: 0 };
    player.civs[civ].played++;
    if (won) { player.civs[civ].wins++; player.wins++; }
    else player.losses++;

    if (map) {
      if (!player.maps[map]) player.maps[map] = { played: 0, wins: 0 };
      player.maps[map].played++;
      if (won) player.maps[map].wins++;
    }
  }

  for (const r of rows) {
    const kamWon = r.winner === 1;
    tally(players.Kamarill,      r.kam_civ_id,   r.map, kamWon);
    tally(players.Schnozberries, r.schnoz_civ_id, r.map, !kamWon);
  }

  function toRows(bucket) {
    return Object.entries(bucket)
      .map(([name, s]) => ({
        name,
        played: s.played,
        wins: s.wins,
        losses: s.played - s.wins,
        winRate: +(s.wins / s.played * 100).toFixed(1),
      }))
      .sort((a, b) => b.played - a.played || b.wins - a.wins);
  }

  const result = {};
  for (const [name, p] of Object.entries(players)) {
    const total = p.wins + p.losses;
    result[name] = {
      wins: p.wins,
      losses: p.losses,
      total,
      winRate: total ? +(p.wins / total * 100).toFixed(1) : 0,
      civs: toRows(p.civs),
      maps: toRows(p.maps),
    };
  }

  res.json(result);
});

const CLIENT_DIST = path.join(__dirname, 'client', 'dist');
app.use(express.static(CLIENT_DIST));
app.get('/{*splat}', (_req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
