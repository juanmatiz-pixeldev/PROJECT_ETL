import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';

// ── BUG FIX: los nombres deben coincidir EXACTAMENTE con los valores que
//    vienen de la API (campo `activity`). Los nombres anteriores eran
//    abreviaciones que no coincidían con las claves del objeto byDate,
//    por lo que todas las líneas se graficaban vacías. ──
const ACTIVITY_NAMES = [
  'Total comercio mayorista',
  '462-463-4641-4642-4643-4644-4649. Materias primas agropecuarias; alimentos, bebidas y tabaco; artículos y enseres domésticos',
  '4645. Productos farmacéuticos, medicinales, cosméticos y de tocador',
  '465-466-469. Maquinaria y equipo; especializado y no especializado',
];

const COLORS = ['#0d9488', '#4f46e5', '#f59e0b', '#e11d48'];

function shortName(name) {
  if (name.startsWith('Total')) return 'Total mayorista';
  if (name.startsWith('462-')) return 'Materias primas y alimentos';
  if (name.startsWith('4645')) return 'Farmacéuticos y cosméticos';
  return 'Maquinaria y equipo';
}

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rt-tip">
      <div className="rt-title">{label}</div>
      {payload.map((p) => (
        <div className="rt-row" key={p.dataKey}>
          <span className="rt-dot" style={{ background: p.color }} />
          {shortName(p.dataKey)} <strong>{Number(p.value).toFixed(2)}%</strong>
        </div>
      ))}
    </div>
  );
}

export default function MonthlySalesChart({ rows = [] }) {
  if (!rows.length) return <p className="empty">Sin datos del CV.</p>;

  const byDate = {};
  rows.forEach((r) => {
    const key = `${r.year}-${String(r.month).padStart(2, '0')}`;
    if (!byDate[key]) byDate[key] = { name: `${r.month_name.trim()} ${r.year}` };
    byDate[key][r.activity] = Number(r.cv_pct);
  });

  // ── BUG FIX: ordenar por clave de fecha para que el eje X sea cronológico ──
  const data = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);

  return (
    <div className="chart-box tall">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8eef6" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
          <Tooltip content={<Tip />} />
          <Legend formatter={(value) => shortName(value)} wrapperStyle={{ fontSize: 11 }} />
          {ACTIVITY_NAMES.map((activity, i) => (
            <Line
              key={activity}
              type="monotone"
              dataKey={activity}
              stroke={COLORS[i]}
              strokeWidth={2.5}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
