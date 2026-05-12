import { useState, useCallback } from 'react';
import './ArcChart.css';

const W = 800;
const H = 200;
const PAD = { l: 44, r: 16, t: 22, b: 30 };
const CW = W - PAD.l - PAD.r;
const CH = H - PAD.t - PAD.b;

function xFor(i, n) {
  return PAD.l + (n > 1 ? (i / (n - 1)) * CW : CW / 2);
}

function yFor(v, maxV) {
  return PAD.t + CH - (v / maxV) * CH;
}

export default function ArcChart({ matches, onGameClick }) {
  const [mode, setMode] = useState('cumulative');
  const [hoverIdx, setHoverIdx] = useState(null);

  const n = matches.length;
  const chrono = [...matches].reverse();

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(xFor(i, n) - svgX);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    setHoverIdx(best);
  }, [n]);

  const handleClick = useCallback(() => {
    if (hoverIdx != null && onGameClick) {
      onGameClick(chrono[hoverIdx].id);
    }
  }, [hoverIdx, onGameClick, chrono]);

  if (n < 2) return null;

  let kamCum = 0, schnozCum = 0;
  const kamSeries = [];
  const schnozSeries = [];

  for (let i = 0; i < n; i++) {
    if (chrono[i].winner === 'Kamarill') kamCum++;
    else schnozCum++;

    if (mode === 'cumulative') {
      kamSeries.push(kamCum);
      schnozSeries.push(schnozCum);
    } else {
      kamSeries.push((kamCum / (i + 1)) * 100);
      schnozSeries.push((schnozCum / (i + 1)) * 100);
    }
  }

  const maxVal = mode === 'cumulative' ? n : 100;

  const kamPts    = kamSeries.map((v, i) => [xFor(i, n), yFor(v, maxVal)]);
  const schnozPts = schnozSeries.map((v, i) => [xFor(i, n), yFor(v, maxVal)]);
  const toPolyline = pts => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  const gridTicks = mode === 'cumulative'
    ? Array.from({ length: 5 }, (_, k) => {
        const v = Math.round((k + 1) * n / 5);
        return { v, label: String(v) };
      })
    : [20, 40, 60, 80, 100].map(v => ({ v, label: `${v}%` }));

  const xInterval = Math.max(1, Math.floor(n / 8));
  const xLabels = Array.from({ length: n }, (_, i) => i)
    .filter(i => i % xInterval === 0 || i === n - 1)
    .map(i => ({ i, x: xFor(i, n), label: String(i + 1) }));

  return (
    <div className="arc-chart-wrap">
      <div className="arc-chart-header">
        <span className="arc-chart-title">Rivalry Arc</span>
        <div className="arc-mode-toggle">
          <button
            className={`arc-mode-btn${mode === 'cumulative' ? ' active' : ''}`}
            onClick={() => setMode('cumulative')}
          >
            Cumulative Wins
          </button>
          <button
            className={`arc-mode-btn${mode === 'winrate' ? ' active' : ''}`}
            onClick={() => setMode('winrate')}
          >
            Win Rate %
          </button>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: 'block', cursor: hoverIdx != null ? 'pointer' : 'default' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
        onClick={handleClick}
      >
        {/* Grid lines */}
        {gridTicks.map(({ v, label }) => {
          const y = yFor(v, maxVal);
          return (
            <g key={v}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="#252535" strokeWidth="1" />
              <text x={PAD.l - 5} y={y + 3.5} textAnchor="end" fontSize="9" fill="#555">{label}</text>
            </g>
          );
        })}

        {/* Axes */}
        <line x1={PAD.l} y1={PAD.t}      x2={PAD.l}      y2={PAD.t + CH} stroke="#383848" strokeWidth="1" />
        <line x1={PAD.l} y1={PAD.t + CH} x2={W - PAD.r} y2={PAD.t + CH} stroke="#383848" strokeWidth="1" />

        {/* Series lines */}
        <polyline points={toPolyline(schnozPts)} fill="none" stroke="#f07060" strokeWidth="2" strokeLinejoin="round" />
        <polyline points={toPolyline(kamPts)}    fill="none" stroke="#60a0f0" strokeWidth="2" strokeLinejoin="round" />

        {/* X axis labels */}
        {xLabels.map(({ i, x, label }) => (
          <text key={i} x={x} y={H - 4} textAnchor="middle" fontSize="9" fill="#555">{label}</text>
        ))}

        {/* Legend */}
        <circle cx={W - PAD.r - 148} cy={PAD.t + 9}  r="4" fill="#60a0f0" />
        <text    x={W - PAD.r - 141} y={PAD.t + 13} fontSize="10" fill="#60a0f0">Kamarill</text>
        <circle cx={W - PAD.r - 72}  cy={PAD.t + 9}  r="4" fill="#f07060" />
        <text    x={W - PAD.r - 65}  y={PAD.t + 13} fontSize="10" fill="#f07060">Schnozberries</text>

        {/* Hover state */}
        {hoverIdx != null && (() => {
          const hv = hoverIdx;
          const hx = xFor(hv, n);
          const kv = mode === 'cumulative' ? kamSeries[hv] : kamSeries[hv].toFixed(1) + '%';
          const sv = mode === 'cumulative' ? schnozSeries[hv] : schnozSeries[hv].toFixed(1) + '%';
          const ttX = hx + 10 > W - 148 ? hx - 138 : hx + 10;
          const ttY = PAD.t + 2;

          return (
            <>
              <line
                x1={hx} y1={PAD.t} x2={hx} y2={PAD.t + CH}
                stroke="#555" strokeWidth="1" strokeDasharray="3 2"
              />
              <circle cx={kamPts[hv][0]}    cy={kamPts[hv][1]}    r="4.5" fill="#60a0f0" />
              <circle cx={schnozPts[hv][0]} cy={schnozPts[hv][1]} r="4.5" fill="#f07060" />
              <rect x={ttX} y={ttY} width="126" height="58" rx="4" fill="#13131d" stroke="#444" />
              <text x={ttX + 8} y={ttY + 15} fontSize="9"  fill="#666">Game {hv + 1} · click to scroll</text>
              <text x={ttX + 8} y={ttY + 31} fontSize="11" fill="#60a0f0">Kamarill: {kv}</text>
              <text x={ttX + 8} y={ttY + 47} fontSize="11" fill="#f07060">Schnozberries: {sv}</text>
            </>
          );
        })()}
      </svg>
    </div>
  );
}
