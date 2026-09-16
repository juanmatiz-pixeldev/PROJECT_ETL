import React from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart3, Database, ShieldCheck, TrendingUp } from 'lucide-react';
import KpiCard from './KpiCard';

export default function Hero({ kpis, loading }) {
  return (
    <>
      <header className="hero hero-compact" id="resumen" style={{ scrollMarginTop: 76 }}>
        <div className="hero-blob b1" />
        <div className="hero-blob b2" />
        <motion.div
          className="hero-main"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="hero-left">
            <div className="hero-badges">
              <span className="badge solid">✦ ODS 8 · Trabajo decente y crecimiento económico</span>
              <span className="badge teal">🇨🇴 DANE · Colombia</span>
              <span className="badge hide-sm">EMC · Comercio mayorista</span>
            </div>
            <h1>
              1.1a · Coeficientes de variación del <span className="grad">comercio mayorista</span>
            </h1>
            <p>
              Análisis de la hoja oficial <strong>1.1a -CVs- Int.</strong> de la Encuesta Mensual de Comercio (EMC).
              El CV permite evaluar la precisión estadística de las estimaciones y complementar el análisis de
              actividad económica asociado al ODS 8.
            </p>
            <div className="hero-meta">
              <span className="tech-pill"><Database size={12} /> PostgreSQL · fact_emc_cv</span>
              <span className="tech-pill hide-sm"><Activity size={12} /> Python ETL</span>
              <span className="tech-pill hide-sm"><BarChart3 size={12} /> React + Recharts</span>
            </div>
          </div>
        </motion.div>
      </header>

      <div className="kpi-strip">
        <KpiCard index={0} variant="light" label="CV promedio · total mayorista" value={kpis.avgCv} display={(v) => (loading ? '—' : `${Number(v).toFixed(3)}%`)} sub="Variación anual" icon={<Activity size={15} />} accent="#0d9488" />
        <KpiCard index={1} variant="light" label="Variación promedio anual" value={kpis.avgVariation} display={(v) => (loading ? '—' : `${Number(v).toFixed(2)}%`)} sub="Total comercio mayorista" icon={<TrendingUp size={15} />} accent="#4f46e5" />
        <KpiCard index={2} variant="light" label="Registros normalizados" value={kpis.records} display={(v) => (loading ? '—' : v)} sub="DANE · 1.1a" icon={<Database size={15} />} accent="#d97706" />
        <KpiCard index={3} variant="light" label="Último período" value={0} display={() => (loading ? '—' : kpis.latestMonth)} sub="Archivo oficial" icon={<ShieldCheck size={15} />} accent="#e11d48" />
      </div>
    </>
  );
}
