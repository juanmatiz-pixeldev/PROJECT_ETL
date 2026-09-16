export const formatNum = (v, decimals = 0) => {
  const n = Number(v);
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
};

export const formatQty = (v) => formatNum(v, 2);
export const formatPct = (v, decimals = 1) => `${formatNum(v, decimals)}%`;

export const monthLabel = (year, month) => {
  const names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${names[(Number(month) - 1 + 12) % 12] || `M${month}`} ${year}`;
};

export const monthShort = (month) => {
  const names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return names[(Number(month) - 1 + 12) % 12] || `M${month}`;
};

export const QUERIES = {
  R1: `SELECT year, month, month_name, activity, cv_pct,
       variation_pct, confidence_lower, confidence_upper
FROM fact_emc_cv
WHERE period = 'Variación anual'
ORDER BY year, month, activity;`,
  R2: `SELECT activity,
       ROUND(AVG(cv_pct)::numeric, 3) AS cv_promedio,
       ROUND(MAX(cv_pct)::numeric, 3) AS cv_maximo,
       ROUND(AVG(variation_pct)::numeric, 3) AS variacion_promedio
FROM fact_emc_cv
WHERE period = 'Variación anual'
GROUP BY activity
ORDER BY cv_promedio;`,
  R3: `SELECT DISTINCT ON (activity)
       activity, year, month, month_name, cv_pct,
       variation_pct, confidence_lower, confidence_upper
FROM fact_emc_cv
WHERE period = 'Variación anual'
ORDER BY activity, year DESC, month DESC;`,
};
