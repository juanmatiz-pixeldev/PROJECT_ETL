import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const PALETTE = ['#0d9488', '#4f46e5', '#f59e0b', '#e11d48', '#06b6d4', '#8b5cf6', '#10b981', '#f97316', '#ec4899', '#14b8a6'];

function Tip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rt-tip">
      <div className="rt-title">{d.name}</div>
      <div className="rt-row">
        <span className="rt-dot" style={{ background: payload[0].color || '#0d9488' }} />
        Promedio <strong>{Number(d.qty).toFixed(2)} und.</strong>
      </div>
    </div>
  );
}

export default function AvgQtyChart({ rows = [] }) {
  if (!rows.length) return <p className="empty">Sin datos de productos.</p>;
  const data = [...rows].slice(0, 10).map((r) => ({ name: r.product_name, qty: Number(r.avg_qty) }));
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8eef6" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12, fill: '#0f172a', fontWeight: 600 }} axisLine={false} tickLine={false} />
          <Tooltip content={<Tip />} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="qty" radius={[0, 8, 8, 0]} maxBarSize={20}>
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
