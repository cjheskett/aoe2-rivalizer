import { useState } from 'react';
import './CivPicker.css';
import './Maps.css';

const MAPS = ['Arabia','Arena','Haboob', 'Land Madness', 'MegaRandom', 'Hideout', 'Golden Pit', 'Crownwood', 'Dorothea Quarry', 'Glacis', 'Hengehold', 'Loch Ness', 'Rampart', 'Stonefront', 'Thames', 'Vulpine'];

function pickThree() {
  const shuffled = [...MAPS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);  
}

export default function MapPicker() {
  const [maps, setMaps] = useState(() => pickThree());

  if (MAPS.length === 0) {
    return <p className="status">No maps configured yet.</p>;
  }

  return (
    <div className="picker-container map-picker">
      <h2>Random Maps</h2>
      <div className="civ-cards">
        {maps.map(map => (
          <div key={map} className="civ-card">
            <img
              src={`/static/${map.replace(/ /g, '_')}_AoE2_map.png`}
              alt={map}
              className="civ-card-img"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="civ-card-name">{map}</span>
          </div>
        ))}
      </div>
      <button className="reroll-btn" onClick={() => setMaps(pickThree())}>
        Reroll
      </button>
    </div>
  );
}
