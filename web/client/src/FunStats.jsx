import { useEffect, useState } from 'react';
import './FunStats.css';

const ALL_CIVS = new Set([
  'Britons', 'Franks', 'Goths', 'Teutons', 'Japanese', 'Chinese', 'Byzantines',
  'Persians', 'Saracens', 'Turks', 'Vikings', 'Mongols', 'Celts', 'Spanish',
  'Aztecs', 'Mayans', 'Huns', 'Koreans', 'Italians', 'Hindustanis', 'Incas',
  'Magyars', 'Slavs', 'Portuguese', 'Ethiopians', 'Malians', 'Berbers', 'Khmer',
  'Malay', 'Burmese', 'Vietnamese', 'Bulgarians', 'Tatars', 'Cumans', 'Lithuanians',
  'Burgundians', 'Sicilians', 'Poles', 'Bohemians', 'Dravidians', 'Bengalis',
  'Gurjaras', 'Romans', 'Armenians', 'Georgians',
  'Shu', 'Wu', 'Wei', 'Jurchens', 'Khitans',
  'Muisca', 'Mapuche', 'Tupi',
]);

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatDuration(seconds) {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function computeStats(matches, stats) {
  if (!matches.length) return null;

  const withDuration = matches.filter(m => m.duration != null);
  const longest  = withDuration.reduce((a, b) => b.duration > a.duration ? b : a, withDuration[0]);
  const shortest = withDuration.reduce((a, b) => b.duration < a.duration ? b : a, withDuration[0]);

  // All-time best streak (matches DESC → reverse for chronological)
  const chrono = [...matches].reverse();
  let bestStreakPlayer = null, bestStreakCount = 0;
  let curPlayer = chrono[0]?.winner, curCount = 0;
  for (const m of chrono) {
    if (m.winner === curPlayer) { curCount++; }
    else { curPlayer = m.winner; curCount = 1; }
    if (curCount > bestStreakCount) { bestStreakCount = curCount; bestStreakPlayer = curPlayer; }
  }

  // Most-played map
  const mapCounts = {};
  for (const m of matches) {
    if (m.map) mapCounts[m.map] = (mapCounts[m.map] ?? 0) + 1;
  }
  const favoriteMap = Object.entries(mapCounts).sort((a, b) => b[1] - a[1])[0];

  // Go-to civ (most played)
  const kamTopCiv   = stats?.Kamarill?.civs?.[0];
  const schnozTopCiv = stats?.Schnozberries?.civs?.[0];

  // Average game length
  const avgDuration = withDuration.length
    ? Math.round(withDuration.reduce((sum, m) => sum + m.duration, 0) / withDuration.length)
    : null;

  // Civ diversity (unique civs played)
  const kamCivs   = new Set(matches.map(m => m.kam_civ));
  const schnozCivs = new Set(matches.map(m => m.schnoz_civ));

  // Clutch civ: highest win rate, min 2 games played
  function clutchCiv(civs) {
    return civs
      .filter(c => c.played >= 2)
      .sort((a, b) => b.winRate - a.winRate || b.played - a.played)[0] ?? null;
  }
  const kamClutch   = clutchCiv(stats?.Kamarill?.civs ?? []);
  const schnozClutch = clutchCiv(stats?.Schnozberries?.civs ?? []);

  // Most improved: last 10 vs all-time win rate
  const recent = matches.slice(0, 10);
  const kamRecentWins   = recent.filter(m => m.winner === 'Kamarill').length;
  const schnozRecentWins = recent.filter(m => m.winner === 'Schnozberries').length;
  const kamOverall   = stats?.Kamarill?.winRate ?? 0;
  const schnozOverall = stats?.Schnozberries?.winRate ?? 0;
  const kamDelta   = +(kamRecentWins / recent.length * 100 - kamOverall).toFixed(0);
  const schnozDelta = +(schnozRecentWins / recent.length * 100 - schnozOverall).toFixed(0);
  const improvedPlayer = kamDelta >= schnozDelta ? 'Kamarill' : 'Schnozberries';
  const improvedDelta  = kamDelta >= schnozDelta ? kamDelta : schnozDelta;

  // Favorite day to play
  const dayCounts = Array(7).fill(0);
  for (const m of matches) {
    if (m.played_at) dayCounts[new Date(m.played_at).getDay()]++;
  }
  const favoriteDay = dayCounts.indexOf(Math.max(...dayCounts));
  const favoriteDayCount = dayCounts[favoriteDay];

  // Never-picked civs
  const pickedCivs = new Set([...matches.map(m => m.kam_civ), ...matches.map(m => m.schnoz_civ)]);
  const neverPicked = [...ALL_CIVS].filter(c => !pickedCivs.has(c));

  return {
    longest, shortest, bestStreakPlayer, bestStreakCount, favoriteMap,
    kamTopCiv, schnozTopCiv,
    avgDuration,
    kamCivs, schnozCivs,
    kamClutch, schnozClutch,
    improvedPlayer, improvedDelta, kamDelta, schnozDelta,
    favoriteDay, favoriteDayCount,
    neverPicked,
  };
}

function StatCard({ label, value, sub, colorClass }) {
  return (
    <div className={`fun-card ${colorClass ?? ''}`}>
      <span className="fun-card-label">{label}</span>
      <span className="fun-card-value">{value}</span>
      {sub && <span className="fun-card-sub">{sub}</span>}
    </div>
  );
}

export default function FunStats() {
  const [matches, setMatches] = useState(null);
  const [stats, setStats]     = useState(null);
  const [error, setError]     = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/matches').then(r => r.json()),
      fetch('/api/stats').then(r => r.json()),
    ])
      .then(([m, s]) => { setMatches(m); setStats(s); })
      .catch(e => setError(e.message));
  }, []);

  if (error)               return <p className="status error">Error: {error}</p>;
  if (!matches || !stats)  return <p className="status">Loading...</p>;

  const s = computeStats(matches, stats);
  if (!s) return <p className="status">No data yet.</p>;

  const deltaSign = d => d > 0 ? `+${d}%` : `${d}%`;

  return (
    <div className="fun-container">
      <h2 className="fun-title">Fun Stats</h2>
      <div className="fun-grid">

        <StatCard
          label="Longest Battle"
          value={formatDuration(s.longest?.duration)}
          sub={s.longest ? `${s.longest.map ?? 'Unknown map'} · Won by ${s.longest.winner}` : null}
        />
        <StatCard
          label="Quickest Victory"
          value={formatDuration(s.shortest?.duration)}
          sub={s.shortest ? `${s.shortest.map ?? 'Unknown map'} · Won by ${s.shortest.winner}` : null}
        />
        <StatCard
          label="All-Time Best Streak"
          value={`${s.bestStreakCount} in a row`}
          sub={s.bestStreakPlayer}
          colorClass={s.bestStreakPlayer === 'Kamarill' ? 'card-kam' : 'card-schnoz'}
        />
        <StatCard
          label="Favorite Battlefield"
          value={s.favoriteMap?.[0] ?? '—'}
          sub={s.favoriteMap ? `${s.favoriteMap[1]} games played` : null}
        />
        {s.kamTopCiv && (
          <StatCard
            label="Kamarill's Go-To"
            value={s.kamTopCiv.name}
            sub={`${s.kamTopCiv.played} games · ${s.kamTopCiv.winRate}% win rate`}
            colorClass="card-kam"
          />
        )}
        {s.schnozTopCiv && (
          <StatCard
            label="Schnozberries' Go-To"
            value={s.schnozTopCiv.name}
            sub={`${s.schnozTopCiv.played} games · ${s.schnozTopCiv.winRate}% win rate`}
            colorClass="card-schnoz"
          />
        )}

        <StatCard
          label="Average Game Length"
          value={formatDuration(s.avgDuration)}
          sub={`across ${matches.filter(m => m.duration).length} games`}
        />
        {s.kamClutch && (
          <StatCard
            label="Kamarill's Clutch Civ"
            value={s.kamClutch.name}
            sub={`${s.kamClutch.winRate}% win rate · ${s.kamClutch.played} games`}
            colorClass="card-kam"
          />
        )}
        {s.schnozClutch && (
          <StatCard
            label="Schnozberries' Clutch Civ"
            value={s.schnozClutch.name}
            sub={`${s.schnozClutch.winRate}% win rate · ${s.schnozClutch.played} games`}
            colorClass="card-schnoz"
          />
        )}
        <StatCard
          label="Most Improved (last 10)"
          value={s.improvedPlayer}
          sub={`${deltaSign(s.improvedDelta)} vs all-time · Kam ${deltaSign(s.kamDelta)} / Schnoz ${deltaSign(s.schnozDelta)}`}
          colorClass={s.improvedPlayer === 'Kamarill' ? 'card-kam' : 'card-schnoz'}
        />
        <StatCard
          label="Favorite Day to Play"
          value={DAYS[s.favoriteDay]}
          sub={`${s.favoriteDayCount} of ${matches.length} games`}
        />
        <StatCard
          label="Civ Diversity"
          value={`${s.kamCivs.size} vs ${s.schnozCivs.size}`}
          sub={`Kamarill · Schnozberries unique civs`}
        />

      </div>

      <div className="never-picked-section">
        <h3 className="never-picked-title">
          Never-Picked Civs <span className="never-picked-count">{s.neverPicked.length} of {ALL_CIVS.size}</span>
        </h3>
        <div className="never-picked-grid">
          {s.neverPicked.sort().map(civ => (
            <span key={civ} className="never-picked-tag">
              <img
                src={`/static/${civ}_AoE2.webp`}
                alt={civ}
                className="never-picked-icon"
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
              {civ}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
