import { useEffect, useState } from 'react';
import './CivPicker.css';

const CIVS = [
  'Armenians', 'Aztecs', 'Bengalis', 'Berbers',
  'Bohemians', 'Britons', 'Bulgarians', 'Burgundians', 'Burmese', 'Byzantines',
  'Celts', 'Chinese', 'Cumans', 'Dravidians', 'Ethiopians', 'Franks',
  'Georgians', 'Goths', 'Gurjaras', 'Hindustanis', 'Huns', 'Incas',
  'Italians', 'Japanese', 'Jurchens', 'Khitans', 'Khmer', 'Koreans',
  'Lithuanians', 'Magyars', 'Malay', 'Malians', 'Mapuche',
  'Mayans', 'Mongols', 'Muisca', 'Persians', 'Poles', 'Portuguese',
  'Romans', 'Saracens', 'Shu', 'Sicilians', 'Slavs', 'Spanish',
  'Tatars', 'Teutons', 'Tupi', 'Turks', 'Vietnamese', 'Vikings',
  'Wei', 'Wu',
];

function pickThree(neverPicked) {
  if (neverPicked.length === 0) {
    const shuffled = [...CIVS].sort(() => Math.random() - 0.5);
    return { civs: shuffled.slice(0, 3), wildcardIdx: -1 };
  }
  const wildcard = neverPicked[Math.floor(Math.random() * neverPicked.length)];
  const rest = CIVS.filter(c => c !== wildcard).sort(() => Math.random() - 0.5).slice(0, 2);
  const three = [wildcard, ...rest].sort(() => Math.random() - 0.5);
  return { civs: three, wildcardIdx: three.indexOf(wildcard) };
}

export default function CivPicker() {
  const [neverPicked, setNeverPicked] = useState([]);
  const [pick, setPick] = useState(() => pickThree([]));

  useEffect(() => {
    fetch('/api/matches')
      .then(r => r.json())
      .then(matches => {
        const played = new Set(matches.flatMap(m => [m.kam_civ, m.schnoz_civ]));
        const never = CIVS.filter(c => !played.has(c));
        setNeverPicked(never);
        setPick(pickThree(never));
      })
      .catch(() => {});
  }, []);

  const { civs, wildcardIdx } = pick;

  return (
    <div className="picker-container">
      <h2>Random Civilizations</h2>
      <div className="civ-cards">
        {civs.map((civ, i) => (
          <div key={civ} className={`civ-card${i === wildcardIdx ? ' civ-card-wildcard' : ''}`}>
            {i === wildcardIdx && <span className="wildcard-badge">Never Picked</span>}
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
      <button className="reroll-btn" onClick={() => setPick(pickThree(neverPicked))}>
        Reroll
      </button>
    </div>
  );
}
