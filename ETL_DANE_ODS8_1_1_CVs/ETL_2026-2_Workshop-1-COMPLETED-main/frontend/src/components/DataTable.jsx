import React from 'react';

export default function DataTable({ columns, rows, loading, emptyText = 'Sin datos' }) {
  if (loading) {
    return (
      <div style={{ marginTop: 14 }}>
        <div className="skeleton" style={{ width: '100%' }} />
        <div className="skeleton" style={{ width: '92%' }} />
        <div className="skeleton" style={{ width: '97%' }} />
        <div className="skeleton" style={{ width: '85%' }} />
      </div>
    );
  }
  if (!rows || rows.length === 0) return <p className="empty">{emptyText}</p>;
  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.numeric ? 'num' : ''}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.key} className={c.numeric ? 'num' : ''}>
                  {c.render ? c.render(r, i) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
