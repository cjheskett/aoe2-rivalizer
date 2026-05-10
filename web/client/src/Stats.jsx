import { useEffect, useState } from 'react';
import './Stats.css';

function CivImg({ name }) {
  return (
    <img
      src={`/static/${name}_AoE2.webp`}
      alt={name}
      className="stats-civ-icon"
      onError={e => { e.currentTarget.style.display = 'none'; }}
    />
  );
}

function StatsTable({ rows, firstCol }) {
  return (
    <table className="civ-table">
      <thead>
        <tr>
          <th>{firstCol}</th>
          <th>Played</th>
          <th>W</th>
          <th>L</th>
          <th>Win %</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.name}>
            <td>{r.name}</td>
            <td>{r.played}</td>
            <td className="col-wins">{r.wins}</td>
            <td className="col-losses">{r.losses}</td>
            <td>
              <span className="win-rate-bar-wrap">
                <span className="win-rate-bar" style={{ width: `${r.winRate}%` }} />
                <span className="win-rate-label">{r.winRate}%</span>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PlayerStats({ name, data }) {
  return (
    <div className="player-stats">
      <div className="player-stats-header">
        <h3>{name}</h3>
        <div className="player-record">
          <span className="record-wins">{data.wins}W</span>
          <span className="record-sep"> / </span>
          <span className="record-losses">{data.losses}L</span>
          <span className="record-rate">{data.winRate}%</span>
        </div>
      </div>

      <div className="stats-section-label">Civilizations</div>
      <StatsTable rows={data.civs.map(c => ({ ...c, name: <span className="stats-civ-cell"><CivImg name={c.name} />{c.name}</span> }))} firstCol="Civilization" />

      {data.maps.length > 0 && (
        <>
          <div className="stats-section-label">Maps</div>
          <StatsTable rows={data.maps} firstCol="Map" />
        </>
      )}
    </div>
  );
}

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(e => setError(e.message));
  }, []);

  if (error) return <p className="status error">Error: {error}</p>;
  if (!stats) return <p className="status">Loading...</p>;

  return (
    <div className="stats-container">
      <PlayerStats name="Kamarill" data={stats.Kamarill} />
      <PlayerStats name="Schnozberries" data={stats.Schnozberries} />
    </div>
  );
}
