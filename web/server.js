const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use('/static', express.static(path.join(__dirname, 'static')));

const DB_PATH = path.join(__dirname, '..', 'match_history.db');

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

app.get('/api/matches', (req, res) => {
  const db = new Database(DB_PATH, { readonly: true });
  const rows = db.prepare('SELECT * FROM match ORDER BY date DESC, time DESC').all();
  db.close();

  const matches = rows.map(r => ({
    id: r.id,
    date: r.date,
    time: r.time,
    duration: r.duration,
    kam_civ: civName(r.kam_civ_id),
    schnoz_civ: civName(r.schnoz_civ_id),
    winner: r.winner === 1 ? 'Kamarill' : 'Schnozberries',
  }));

  res.json(matches);
});

const PORT = 3001;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
