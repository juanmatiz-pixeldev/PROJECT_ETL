import React from 'react';
import { Database, GraduationCap, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <strong>RetailCO · SDG 8</strong> — Data Engineering for Sustainable Development · UAO
          <br />
          <span className="foot-sub">
            <Database size={12} /> PostgreSQL · Python ETL · FastAPI · React + Recharts + Framer Motion
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="tech-pill dark">
            <MapPin size={12} /> Bogotá · Medellín · Cali
          </span>
          <span className="tech-pill dark">
            <GraduationCap size={12} /> Workshop 1 · ETL 2026-2
          </span>
        </div>
      </div>
    </footer>
  );
}
