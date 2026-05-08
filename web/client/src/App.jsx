import { useEffect, useState } from 'react';
import './App.css';
import CivPicker from './CivPicker.jsx';
import Rules from './Rules.jsx';

const TABS = [
  { id: 'history', label: 'Match History' },
  { id: 'picker', label: 'Civ Picker' },
  { id: 'rules', label: 'Rules' },
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

function CivCell({ name }) {
  return (
    <span className="civ-cell">
      <img
        src={`http://localhost:3001/static/${name}_AoE2.webp`}
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
    fetch('http://localhost:3001/api/matches')
      .then(r => r.json())
      .then(data => { setMatches(data); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (tab === 'picker') {
    return (
      <>
        <Nav tab={tab} setTab={setTab} />
        <CivPicker />
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

  return (
    <>
      <Nav tab={tab} setTab={setTab} />
      <div className="container">
        <h1>AoE2 Match History</h1>

        <div className="scoreboard">
          <div className={`score-card ${kamWins >= schnozWins ? 'leading' : ''}`}>
            <span className="player-name">Kamarill</span>
            <span className="win-count">{kamWins}</span>
          </div>
          <div className="score-divider">vs</div>
          <div className={`score-card ${schnozWins > kamWins ? 'leading' : ''}`}>
            <span className="player-name">Schnozberries</span>
            <span className="win-count">{schnozWins}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Time</th>
              <th>Duration</th>
              <th>Kamarill</th>
              <th>Schnozberries</th>
              <th>Winner</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m, i) => (
              <tr key={m.id} className={m.winner === 'Kamarill' ? 'kam-win' : 'schnoz-win'}>
                <td className="num">{matches.length - i}</td>
                <td>{m.date}</td>
                <td className="mono">{m.time ?? '—'}</td>
                <td className="mono">{formatDuration(m.duration)}</td>
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
