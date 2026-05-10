import { useEffect, useState } from 'react';
import './Maps.css';

function mapImageUrl(name) {
  return `/static/${name.replace(/ /g, '_')}_AoE2_map.png`;
}

export default function Maps() {
  const [maps, setMaps] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/maps')
      .then(r => r.json())
      .then(setMaps)
      .catch(e => setError(e.message));
  }, []);

  if (error) return <p className="status error">Error: {error}</p>;
  if (!maps) return <p className="status">Loading...</p>;

  return (
    <div className="maps-container">
      <div className="map-grid">
        {maps.map(m => (
          <div key={m.name} className="map-card">
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
          </div>
        ))}
      </div>
    </div>
  );
}
