import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatCOP, formatNum } from '../utils/format';

const COLORS = ['#0d9488', '#4f46e5', '#f59e0b', '#e11d48', '#06b6d4'];

function Tip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rt-tip">
      <div className="rt-title">{d.name}</div>
      <div className="rt-row">
        <span className="rt-dot" style={{ background: d.fill }} />
        <strong>{formatCOP(d.total)}</strong>&nbsp;· {formatNum(d.sales)} ventas
      </div>
    </div>
  );
}

export default function ChannelChart({ rows = [] }) {
  if (!rows.length) return <p className="empty">Sin datos por canal.</p>;
  const total = rows.reduce((a, r) => a + Number(r.total_revenue), 0) || 1;
  const data = rows.map((r, i) => ({
    name: r.channel_name,
    total: Number(r.total_revenue),
    sales: Number(r.num_sales),
    share: Number(r.total_revenue) / total,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div>
      <div className="chart-box short">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="name" innerRadius="58%" outerRadius="88%" paddingAngle={3} cornerRadius={8} strokeWidth={0}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Pie>
            <Tooltip content={<Tip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="legend-list">
        {data.map((d) => (
          <div key={d.name} className="legend-item">
            <span className="legend-dot" style={{ background: d.fill }} />
            <span className="legend-name">{d.name}</span>
            <span className="legend-val">{formatCOP(d.total)}</span>
            <span className="legend-pct">{(d.share * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
