import React, { useMemo } from 'react';

const palette = ['#6366f1', '#22d3ee', '#f97316', '#facc15', '#34d399', '#f472b6', '#a855f7', '#38bdf8'];

export default function ExpensePieChart({ summary = {}, participants = [] }) {
  const data = useMemo(() => {
    const entries = Object.entries(summary).filter(([, balance]) => balance < 0);
    return entries.map(([id, balance], index) => {
      const participant = participants.find((p) => p.id === Number(id) || p.id === id);
      const name = participant?.name || 'Unknown';
      const value = Math.abs(balance);
      const color = palette[index % palette.length];
      return { id, name, value, color };
    });
  }, [summary, participants]);

  const total = useMemo(() => data.reduce((acc, item) => acc + item.value, 0), [data]);

  if (!data.length || total <= 0) {
    return <p className="chart-empty">No one owes anything right now.</p>;
  }

  let currentAngle = 0;
  const segments = data.map((item) => {
    const share = item.value / total;
    const start = currentAngle;
    const end = currentAngle + share;
    currentAngle = end;
    return {
      ...item,
      startDeg: start * 360,
      endDeg: end * 360,
    };
  });

  const gradientStops = segments
    .map((segment) => `${segment.color} ${segment.startDeg}deg ${segment.endDeg}deg`)
    .join(', ');

  return (
    <div className="pie-chart">
      <div className="pie-chart__visual" style={{ background: `conic-gradient(${gradientStops})` }}>
        <div className="pie-chart__hole">
          <span className="pie-chart__label">Total owed</span>
          <strong className="pie-chart__value">${total.toFixed(2)}</strong>
        </div>
      </div>
      <ul className="pie-chart__legend">
        {segments.map((segment) => (
          <li key={segment.id}>
            <span className="legend-swatch" style={{ backgroundColor: segment.color }} />
            <span className="legend-label">{segment.name}</span>
            <span className="legend-value">${segment.value.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
