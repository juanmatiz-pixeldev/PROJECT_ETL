import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';
import { formatCOP, formatCOPCompact } from '../utils/format';

const COLORS = ['#f59e0b', '#94a3b8', '#fb923c', '#0d9488', '#4f46e5'];

function Tip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rt-tip">
      <div className="rt-title">
        {d.name} <span className="rt-cat">{d.category}</span>
      </div>
      <div className="rt-row">
        <span className="rt-dot" style={{ background: '#f59e0b' }} />
        Ingresos <strong>{formatCOP(d.total)}</strong>
      </div>
    </div>
  );
}

export default function TopProductsChart({ rows = [] }) {
  if (!rows.length) return <p className="empty">Sin top de productos.</p>;
  const data = rows.slice(0, 5).map((r) => ({ name: r.product_name, category: r.category, total: Number(r.total_revenue) }));
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 70, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8eef6" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12, fill: '#0f172a', fontWeight: 700 }} axisLine={false} tickLine={false} />
          <Tooltip content={<Tip />} cursor={{ fill: '#fef3c7' }} />
          <Bar dataKey="total" radius={[0, 10, 10, 0]} maxBarSize={30}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
            <LabelList dataKey="total" position="right" formatter={(v) => `$${formatCOPCompact(v)}`} style={{ fontSize: 11, fontWeight: 800, fill: '#92400e' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
