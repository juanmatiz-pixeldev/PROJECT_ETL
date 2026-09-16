import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

app = FastAPI(title="DANE EMC - ODS 8 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── BUG FIX: credenciales hardcodeadas → variable de entorno ──
POSTGRES_URI = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost/etl_workshop",
)
engine = create_engine(POSTGRES_URI)


def run_query(query: str):
    try:
        with engine.connect() as conn:
            return [dict(row) for row in conn.execute(text(query)).mappings().all()]
    except OperationalError as exc:
        # ── BUG FIX: errores de DB se propagaban como 500 sin mensaje útil ──
        raise HTTPException(status_code=503, detail=f"Error de base de datos: {exc}") from exc


@app.get("/api/cv_series")
def cv_series():
    query = """
    SELECT year, month, month_name, activity, cv_pct,
           variation_pct, confidence_lower, confidence_upper
    FROM fact_emc_cv
    WHERE period = 'Variación anual'
    ORDER BY year, month, activity
    """
    return run_query(query)


@app.get("/api/cv_summary")
def cv_summary():
    query = """
    SELECT activity,
           ROUND(AVG(cv_pct)::numeric, 3)       AS avg_cv,
           ROUND(MAX(cv_pct)::numeric, 3)       AS max_cv,
           ROUND(AVG(variation_pct)::numeric, 3) AS avg_variation
    FROM fact_emc_cv
    WHERE period = 'Variación anual'
    GROUP BY activity
    ORDER BY activity
    """
    return run_query(query)


@app.get("/api/latest")
def latest():
    query = """
    SELECT period, activity, year, month, month_name,
           cv_pct, variation_pct, confidence_lower, confidence_upper
    FROM fact_emc_cv
    WHERE date_key = (SELECT MAX(date_key) FROM fact_emc_cv)
    ORDER BY period, activity
    """
    return run_query(query)


# ── BUG FIX: R4 y R5 mencionados en el README pero no implementados ──
@app.get("/api/period_comparison")
def period_comparison():
    """R4 – Comparación de los tres períodos para el último mes disponible."""
    query = """
    WITH ultimo AS (SELECT MAX(date_key) AS date_key FROM fact_emc_cv)
    SELECT f.period, f.activity, f.cv_pct, f.variation_pct,
           f.confidence_lower, f.confidence_upper
    FROM fact_emc_cv f
    JOIN ultimo u ON f.date_key = u.date_key
    ORDER BY f.period, f.activity
    """
    return run_query(query)


@app.get("/api/top_cv")
def top_cv():
    """R5 – Registros con mayor coeficiente de variación."""
    query = """
    SELECT year, month, month_name, activity, cv_pct, variation_pct
    FROM fact_emc_cv
    WHERE period = 'Variación anual'
    ORDER BY cv_pct DESC NULLS LAST
    LIMIT 10
    """
    return run_query(query)
