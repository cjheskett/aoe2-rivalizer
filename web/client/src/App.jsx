import { useEffect, useState } from 'react';
import './App.css';
import CivPicker from './CivPicker.jsx';
import MapPicker from './MapPicker.jsx';
import Rules from './Rules.jsx';
import Stats from './Stats.jsx';
import Maps from './Maps.jsx';
import FunStats from './FunStats.jsx';

const TABS = [
  { id: 'history',   label: 'Match History' },
  { id: 'stats',     label: 'Stats' },
  { id: 'maps',      label: 'Maps' },
  { id: 'funstats',  label: 'Fun Stats' },
  { id: 'picker',    label: 'Civ Picker' },
  { id: 'rules',     label: 'Rules' },
];

function Nav({ tab, setTab }) {
  return (
    <nav className="tab-nav">
      {TABS.map(t => (
        <button
          key={t.id}
          className={`tab-btn${tab === t.id ? ' active' : ''}`}
          onClick={() => setTab(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

function formatDuration(seconds) {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDateTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  const date = d.toLocaleDateString('en-US');
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

function CivCell({ name }) {
  return (
    <span className="civ-cell">
      <img
        src={`/static/${name}_AoE2.webp`}
        alt={name}
        className="civ-icon"
        onError={e => { e.currentTarget.style.display = 'none'; }}
      />
      {name}
    </span>
  );
}

export default function App() {
  const [tab, setTab] = useState('history');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/matches')
      .then(r => r.json())
      .then(data => { setMatches(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (tab === 'maps') {
    return (
      <>
        <Nav tab={tab} setTab={setTab} />
        <Maps />
      </>
    );
  }

  if (tab === 'picker') {
    return (
      <>
        <Nav tab={tab} setTab={setTab} />
        <CivPicker />
        <MapPicker />
      </>
    );
  }

  if (tab === 'funstats') {
    return (
      <>
        <Nav tab={tab} setTab={setTab} />
        <FunStats />
      </>
    );
  }

  if (tab === 'stats') {
    return (
      <>
        <Nav tab={tab} setTab={setTab} />
        <Stats />
      </>
    );
  }

  if (tab === 'rules') {
    return (
      <>
        <Nav tab={tab} setTab={setTab} />
        <Rules />
      </>
    );
  }

  if (loading) return <><Nav tab={tab} setTab={setTab} /><p className="status">Loading...</p></>;
  if (error) return <><Nav tab={tab} setTab={setTab} /><p className="status error">Error: {error}</p></>;

  const kamWins = matches.filter(m => m.winner === 'Kamarill').length;
  const schnozWins = matches.filter(m => m.winner === 'Schnozberries').length;

  let streakPlayer = null;
  let streakCount = 0;
  if (matches.length > 0) {
    streakPlayer = matches[0].winner;
    for (const m of matches) {
      if (m.winner !== streakPlayer) break;
      streakCount++;
    }
  }

  const total = matches.length;
  const seriesLabel = kamWins === schnozWins
    ? 'The rivalry is dead even'
    : `${kamWins > schnozWins ? 'Kamarill' : 'Schnozberries'} leads the all-time series`;

  return (
    <>
      <Nav tab={tab} setTab={setTab} />
      <div className="container">

        <div className="rival-card">
          <div className="rival-player rival-kam">
            <span className="rival-name">Kamarill</span>
            <span className="rival-wins">{kamWins}</span>
            <span className="rival-pct">{total ? (kamWins / total * 100).toFixed(0) : 0}%</span>
          </div>
          <div className="rival-center">
            <span className="rival-series-label">{seriesLabel}</span>
            <span className="rival-vs">VS</span>
            <span className="rival-total">{total} games played</span>
          </div>
          <div className="rival-player rival-schnoz">
            <span className="rival-name">Schnozberries</span>
            <span className="rival-wins">{schnozWins}</span>
            <span className="rival-pct">{total ? (schnozWins / total * 100).toFixed(0) : 0}%</span>
          </div>
        </div>

        {streakCount >= 2 && (
          <p className={`streak-banner ${streakPlayer === 'Kamarill' ? 'streak-kam' : 'streak-schnoz'}`}>
            {streakPlayer} is on a {streakCount}-game win streak
          </p>
        )}

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Map</th>
              <th>Kamarill</th>
              <th>Schnozberries</th>
              <th>Winner</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m, i) => (
              <tr key={m.id} className={m.winner === 'Kamarill' ? 'kam-win' : 'schnoz-win'}>
                <td className="num">{matches.length - i}</td>
                <td className="mono">{formatDateTime(m.played_at)}</td>
                <td className="mono">{formatDuration(m.duration)}</td>
                <td>{m.map ?? '—'}</td>
              <td><CivCell name={m.kam_civ} /></td>
                <td><CivCell name={m.schnoz_civ} /></td>
                <td className="winner-cell">{m.winner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
