import React from 'react';
import { LayoutDashboard, Database, Zap } from 'lucide-react';

const LINKS = [
  { href: '#r1', label: '1.1a · CV' },
  { href: '#r2', label: 'Resumen CV' },
  { href: '#latest', label: 'Último dato' },
];

export default function Navbar({ status = 'loading' }) {
  const label = status === 'ok' ? 'API conectada' : status === 'error' ? 'API sin conexión' : 'Conectando…';
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a className="brand" href="#resumen">
          <span className="brand-mark">
            <LayoutDashboard size={20} strokeWidth={2.4} />
          </span>
          <span>
            <span className="brand-name">DANE · ODS 8</span>
            <br />
            <span className="brand-sub">EMC · Comercio mayorista</span>
          </span>
        </a>
        <div className="nav-links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="nav-right">
          <span className="dw-pill" title="Data Warehouse en PostgreSQL">
            <Database size={13} /> DW · PostgreSQL
          </span>
          <div className="api-pill" title="Estado del backend FastAPI">
            <span className={`dot ${status === 'ok' ? '' : status}`} />
            <Zap size={13} />
            {label}
          </div>
        </div>
      </div>
    </nav>
  );
}
