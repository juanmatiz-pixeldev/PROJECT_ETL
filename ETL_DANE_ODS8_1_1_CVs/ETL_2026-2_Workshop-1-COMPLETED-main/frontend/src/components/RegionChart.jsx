import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { formatCOP, formatCOPCompact } from '../utils/format';

const COLORS = ['#0d9488', '#4f46e5', '#f59e0b', '#e11d48', '#06b6d4', '#8b5cf6'];

function Tip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rt-tip">
      <div className="rt-title">
        {d.city} · {d.region}
      </div>
      <div className="rt-row">
        <span className="rt-dot" style={{ background: payload[0].color }} />
        Ingresos <strong>{formatCOP(d.total)}</strong>
      </div>
    </div>
  );
}

export default function RegionChart({ rows = [] }) {
  if (!rows.length) return <p className="empty">Sin datos por región.</p>;
  const data = rows.map((r) => ({ city: r.city, region: r.region, name: r.city, total: Number(r.total_revenue) }));
  return (
    <div className="chart-box short">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8eef6" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#0f172a', fontWeight: 700 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => `$${formatCOPCompact(v)}`} />
          <Tooltip content={<Tip />} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="total" radius={[10, 10, 4, 4]} maxBarSize={64}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
