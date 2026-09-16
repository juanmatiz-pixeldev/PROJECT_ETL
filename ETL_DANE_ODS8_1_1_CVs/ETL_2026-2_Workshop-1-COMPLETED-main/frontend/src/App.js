import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import ChartCard from './components/ChartCard';
import DataTable from './components/DataTable';
import SqlBlock from './components/SqlBlock';
import MonthlySalesChart from './components/MonthlySalesChart';
import { formatNum, QUERIES } from './utils/format';
import { BarChart3, Activity, Database, ShieldCheck } from 'lucide-react';

const ENDPOINTS = {
  series: '/api/cv_series',
  summary: '/api/cv_summary',
  latest: '/api/latest',
};

function ChartSkeleton() {
  return <div style={{ padding: '6px 0' }}><div className="skeleton" style={{ height: 300, borderRadius: 12 }} /></div>;
}

export default function App() {
  const [series, setSeries] = useState([]);
  const [summary, setSummary] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, m, l] = await Promise.all([
        fetch(ENDPOINTS.series).then((r) => { if (!r.ok) throw new Error(`cv_series ${r.status}`); return r.json(); }),
        fetch(ENDPOINTS.summary).then((r) => { if (!r.ok) throw new Error(`cv_summary ${r.status}`); return r.json(); }),
        fetch(ENDPOINTS.latest).then((r) => { if (!r.ok) throw new Error(`latest ${r.status}`); return r.json(); }),
      ]);
      setSeries(s);
      setSummary(m);
      setLatest(l);
    } catch (e) {
      console.error(e);
      setError('No se pudo conectar con la API o con la base de datos PostgreSQL.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const kpis = useMemo(() => {
    const total = summary.find((x) => x.activity === 'Total comercio mayorista');
    const latestDate = latest[0];
    const avgCv = total ? Number(total.avg_cv) : 0;
    const avgVariation = total ? Number(total.avg_variation) : 0;
    const records = series.length;
    return {
      avgCv,
      avgVariation,
      records,
      latestMonth: latestDate ? `${latestDate.month_name} ${latestDate.year}` : '—',
    };
  }, [summary, latest, series]);

  return (
    <div className="app">
      <Navbar status={error ? 'error' : loading ? 'loading' : 'ok'} />
      <main className="container">
        <Hero kpis={kpis} loading={loading} />

        {error && <div className="error-box">{error}</div>}

        <ChartCard
          id="r1"
          badge="1.1a"
          badgeClass="teal"
          title="Evolución del coeficiente de variación (CV)"
          desc="Serie mensual de enero de 2020 a junio de 2026 para la variación anual de las cuatro actividades de comercio mayorista incluidas por el DANE."
          icon={<BarChart3 size={15} />}
        >
          {loading ? <ChartSkeleton /> : <MonthlySalesChart rows={series} />}
          <SqlBlock sql={QUERIES.R1} title="Consulta · Serie del CV" />
        </ChartCard>

        <div className="grid-1" style={{ marginTop: 16 }}>
          <ChartCard
            id="r2"
            badge="CV"
            badgeClass="amber"
            title="Resumen estadístico por actividad"
            desc="Promedio y máximo del coeficiente de variación, junto con la variación porcentual promedio."
            icon={<Activity size={15} />}
          >
            <DataTable
              loading={loading}
              rows={summary}
              columns={[
                { key: 'activity', label: 'Actividad', render: (r) => <strong>{r.activity}</strong> },
                { key: 'avg_cv', label: 'CV promedio', numeric: true, render: (r) => `${Number(r.avg_cv).toFixed(3)}%` },
                { key: 'max_cv', label: 'CV máximo', numeric: true, render: (r) => `${Number(r.max_cv).toFixed(3)}%` },
                { key: 'avg_variation', label: 'Variación promedio', numeric: true, render: (r) => `${Number(r.avg_variation).toFixed(2)}%` },
              ]}
            />
            <SqlBlock sql={QUERIES.R2} title="Consulta · CV promedio por actividad" />
          </ChartCard>
        </div>

        <div className="grid-1" style={{ marginTop: 16 }}>
          <ChartCard
            id="latest"
            badge="DANE"
            badgeClass="slate"
            title="Último dato disponible"
            desc="Valores del último mes del archivo oficial, con variación, intervalo de confianza y coeficiente de variación."
            icon={<Database size={15} />}
          >
            <DataTable
              loading={loading}
              rows={latest}
              columns={[
                { key: 'period', label: 'Período' },
                { key: 'activity', label: 'Actividad', render: (r) => <strong>{r.activity}</strong> },
                { key: 'variation_pct', label: 'Variación', numeric: true, render: (r) => `${Number(r.variation_pct).toFixed(2)}%` },
                { key: 'confidence_lower', label: 'L.i', numeric: true, render: (r) => `${Number(r.confidence_lower).toFixed(2)}%` },
                { key: 'confidence_upper', label: 'L.s', numeric: true, render: (r) => `${Number(r.confidence_upper).toFixed(2)}%` },
                { key: 'cv_pct', label: 'C.V.', numeric: true, render: (r) => `${Number(r.cv_pct).toFixed(3)}%` },
              ]}
            />
            <SqlBlock sql={QUERIES.R3} title="Consulta · Último dato por actividad" />
          </ChartCard>
        </div>

        <div className="grid-1" style={{ marginTop: 16 }}>
          <div className="insight" style={{ borderLeft: '4px solid #0d9488' }}>
            <span className="insight-ico" style={{ background: '#ccfbf1', color: '#0d9488' }}><ShieldCheck size={16} /></span>
            <span><strong>Relación con el ODS 8:</strong> el dashboard no interpreta el CV como empleo por sí mismo. El CV se utiliza para valorar la precisión de las estimaciones de la EMC; las variables de actividad comercial y personal ocupado del DANE permiten complementar el análisis de crecimiento económico y trabajo.</span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
