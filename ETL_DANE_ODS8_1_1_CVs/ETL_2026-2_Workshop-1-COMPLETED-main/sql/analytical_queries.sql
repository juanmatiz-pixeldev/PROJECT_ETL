-- Consultas analíticas de la hoja 1.1a - CVs de la EMC del DANE

-- R1: Serie del coeficiente de variación del total del comercio mayorista
SELECT year, month, month_name, cv_pct
FROM fact_emc_cv
WHERE period = 'Variación anual'
  AND activity = 'Total comercio mayorista'
ORDER BY year, month;

-- R2: CV promedio por actividad comercial
SELECT activity, ROUND(AVG(cv_pct)::numeric, 3) AS cv_promedio
FROM fact_emc_cv
WHERE period = 'Variación anual'
GROUP BY activity
ORDER BY cv_promedio;

-- R3: Último CV disponible por actividad
SELECT DISTINCT ON (activity)
    activity, year, month, month_name, cv_pct, variation_pct,
    confidence_lower, confidence_upper
FROM fact_emc_cv
WHERE period = 'Variación anual'
ORDER BY activity, year DESC, month DESC;

-- R4: Comparación de los tres períodos para el último mes disponible
WITH ultimo AS (
    SELECT MAX(date_key) AS date_key
    FROM fact_emc_cv
)
SELECT period, activity, cv_pct, variation_pct,
       confidence_lower, confidence_upper
FROM fact_emc_cv f
JOIN ultimo u ON f.date_key = u.date_key
ORDER BY period, activity;

-- R5: Registros con mayor CV en la variación anual
SELECT year, month, month_name, activity, cv_pct, variation_pct
FROM fact_emc_cv
WHERE period = 'Variación anual'
ORDER BY cv_pct DESC NULLS LAST
LIMIT 10;
