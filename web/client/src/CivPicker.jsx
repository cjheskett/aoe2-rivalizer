import { useState } from 'react';
import './CivPicker.css';

const CIVS = [
  'Armenians', 'Aztecs', 'Bengalis', 'Berbers',
  'Bohemians', 'Britons', 'Bulgarians', 'Burgundians', 'Burmese', 'Byzantines',
  'Celts', 'Chinese', 'Cumans', 'Dravidians', 'Ethiopians', 'Franks',
  'Georgians', 'Goths', 'Gurjaras', 'Hindustanis', 'Huns', 'Incas',
  'Italians', 'Japanese', 'Jurchens', 'Khitans', 'Khmer', 'Koreans',
  'Lithuanians', 'Magyars', 'Malay', 'Malians', 'Mapuche',
  'Mayans', 'Mongols', 'Muisca', 'Persians', 'Poles', 'Portuguese', ,
  'Romans', 'Saracens', 'Shu', 'Sicilians', 'Slavs', 'Spanish',
  'Tatars', 'Teutons', 'Tupi', 'Turks', 'Vietnamese', 'Vikings',
  'Wei', 'Wu',
];

function pickThree() {
  const shuffled = [...CIVS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export default function CivPicker() {
  const [civs, setCivs] = useState(() => pickThree());

  return (
    <div className="picker-container">
      <h2>Random Civilizations</h2>
      <div className="civ-cards">
        {civs.map(civ => (
          <div key={civ} className="civ-card">
            <img
              src={`/static/${civ}_AoE2.webp`}
              alt={civ}
              className="civ-card-img"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="civ-card-name">{civ}</span>
          </div>
        ))}
      </div>
      <button className="reroll-btn" onClick={() => setCivs(pickThree())}>
        Reroll
      </button>
    </div>
  );
}
