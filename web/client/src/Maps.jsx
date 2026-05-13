import { Fragment, useEffect, useState } from 'react';
import './Maps.css';

function mapImageUrl(name) {
  return `/static/${name.replace(/ /g, '_')}_AoE2_map.png`;
}

function formatDuration(s) {
  if (s == null) return '—';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function avg(vals) {
  const f = vals.filter(v => v != null);
  return f.length ? Math.round(f.reduce((a, b) => a + b, 0) / f.length) : null;
}

function computeMapDetail(mapName, matches) {
  const mm = matches.filter(m => m.map === mapName);
  if (!mm.length) return null;

  const avgDuration = avg(mm.map(m => m.duration));

  const ageTimes = {
    Kamarill:      { feudal: avg(mm.map(m => m.kam_feudal_time)),   castle: avg(mm.map(m => m.kam_castle_time)),   imperial: avg(mm.map(m => m.kam_imperial_time)) },
    Schnozberries: { feudal: avg(mm.map(m => m.schnoz_feudal_time)), castle: avg(mm.map(m => m.schnoz_castle_time)), imperial: avg(mm.map(m => m.schnoz_imperial_time)) },
  };

  function civBreakdown(civKey, winnerName) {
    const counts = {};
    for (const m of mm) {
      const civ = m[civKey];
      if (!counts[civ]) counts[civ] = { played: 0, wins: 0 };
      counts[civ].played++;
      if (m.winner === winnerName) counts[civ].wins++;
    }
    return Object.entries(counts)
      .map(([name, s]) => ({ name, ...s }))
      .sort((a, b) => b.played - a.played || b.wins - a.wins);
  }

  return {
    avgDuration,
    ageTimes,
    kamCivs: civBreakdown('kam_civ', 'Kamarill'),
    schnozCivs: civBreakdown('schnoz_civ', 'Schnozberries'),
    recent: mm.slice(0, 5),
  };
}

function AgeRow({ label, kam, schnoz }) {
  const kamFaster = kam != null && (schnoz == null || kam < schnoz);
  const schnozFaster = schnoz != null && (kam == null || schnoz < kam);
  return (
    <div className="detail-age-col">
      <span className="detail-age-label">{label}</span>
      <span className={`detail-age-kam${kamFaster ? ' detail-faster' : ''}`}>{formatDuration(kam)}</span>
      <span className={`detail-age-schnoz${schnozFaster ? ' detail-faster' : ''}`}>{formatDuration(schnoz)}</span>
    </div>
  );
}

function MapDetail({ mapName, detail, overallAvgDuration }) {
  return (
    <div className="map-detail-panel">
      <div className="detail-map-title">{mapName}</div>

      <div className="detail-stats-row">
        <div className="detail-duration-col">
          <span className="detail-section-label">Avg Duration</span>
          <span className="detail-duration-val">{formatDuration(detail.avgDuration)}</span>
          {overallAvgDuration != null && (
            <span className="detail-duration-vs">overall {formatDuration(overallAvgDuration)}</span>
          )}
        </div>
        <div className="detail-age-grid">
          <div className="detail-age-player-labels">
            <span className="detail-age-player-kam">Kamarill</span>
            <span className="detail-age-player-schnoz">Schnozberries</span>
          </div>
          <AgeRow label="Feudal"   kam={detail.ageTimes.Kamarill.feudal}   schnoz={detail.ageTimes.Schnozberries.feudal} />
          <AgeRow label="Castle"   kam={detail.ageTimes.Kamarill.castle}   schnoz={detail.ageTimes.Schnozberries.castle} />
          <AgeRow label="Imperial" kam={detail.ageTimes.Kamarill.imperial} schnoz={detail.ageTimes.Schnozberries.imperial} />
        </div>
      </div>

      <div className="detail-civs-row">
        <div className="detail-civs-col">
          <span className="detail-section-label detail-section-kam">Kamarill Civs</span>
          {detail.kamCivs.map(c => (
            <div key={c.name} className="detail-civ-row">
              <img src={`/static/${c.name}_AoE2.webp`} alt={c.name} className="detail-civ-icon" onError={e => { e.currentTarget.style.display = 'none'; }} />
              <span className="detail-civ-name">{c.name}</span>
              <span className="detail-civ-record detail-civ-kam">{c.wins}W {c.played - c.wins}L</span>
            </div>
          ))}
        </div>
        <div className="detail-civs-col">
          <span className="detail-section-label detail-section-schnoz">Schnozberries Civs</span>
          {detail.schnozCivs.map(c => (
            <div key={c.name} className="detail-civ-row">
              <img src={`/static/${c.name}_AoE2.webp`} alt={c.name} className="detail-civ-icon" onError={e => { e.currentTarget.style.display = 'none'; }} />
              <span className="detail-civ-name">{c.name}</span>
              <span className="detail-civ-record detail-civ-schnoz">{c.wins}W {c.played - c.wins}L</span>
            </div>
          ))}
        </div>
      </div>

      {detail.recent.length > 0 && (
        <div className="detail-recent">
          <span className="detail-section-label">Recent Games</span>
          {detail.recent.map(m => (
            <div key={m.id} className={`detail-recent-row ${m.winner === 'Kamarill' ? 'detail-recent-kam' : 'detail-recent-schnoz'}`}>
              <span className="detail-recent-winner">{m.winner}</span>
              <span className="detail-recent-civs">{m.kam_civ} vs {m.schnoz_civ}</span>
              <span className="detail-recent-dur">{formatDuration(m.duration)}</span>
              <span className="detail-recent-date">{formatDate(m.played_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Maps() {
  const [maps, setMaps] = useState(null);
  const [matches, setMatches] = useState(null);
  const [selectedMap, setSelectedMap] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/maps').then(r => r.json()),
      fetch('/api/matches').then(r => r.json()),
    ])
      .then(([m, mx]) => { setMaps(m); setMatches(mx); })
      .catch(e => setError(e.message));
  }, []);

  if (error)             return <p className="status error">Error: {error}</p>;
  if (!maps || !matches) return <p className="status">Loading...</p>;

  const overallAvgDuration = avg(matches.map(m => m.duration));
  const detail = selectedMap ? computeMapDetail(selectedMap, matches) : null;

  return (
    <div className="maps-container">
      <div className="map-grid">
        {maps.map(m => {
          const isSelected = selectedMap === m.name;
          return (
            <Fragment key={m.name}>
              <div
                className={`map-card${isSelected ? ' map-card-selected' : ''}`}
                onClick={() => setSelectedMap(prev => prev === m.name ? null : m.name)}
              >
                <img
                  src={mapImageUrl(m.name)}
                  alt={m.name}
                  className="map-img"
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="map-info">
                  <span className="map-name">{m.name}</span>
                  <span className="map-played">{m.played} {m.played === 1 ? 'game' : 'games'}</span>
                  <div className="map-record">
                    <span className="map-kam">{m.kamWins}W Kamarill</span>
                    <span className="map-schnoz">{m.schnozWins}W Schnozberries</span>
                  </div>
                </div>
                <div className="map-card-chevron">{isSelected ? '▲' : '▼'}</div>
              </div>
              {isSelected && detail && (
                <div className="map-detail-full">
                  <MapDetail mapName={selectedMap} detail={detail} overallAvgDuration={overallAvgDuration} />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
